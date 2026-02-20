import { Role, ShippingType } from "@prisma/client";
import { addToCartSchema, checkoutSchema, loginSchema, productFilterSchema } from "@store/shared";
import argon2 from "argon2";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { sendEmail, stripe } from "../lib/services.js";
import { requireAdmin } from "../plugins/auth.js";

const adminProductSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  categoryId: z.string(),
  brandId: z.string(),
  featured: z.boolean().default(false)
});

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ ok: true }));

  app.post("/auth/login", { config: { rateLimit: { max: 5, timeWindow: "1 minute" } } }, async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !(await argon2.verify(user.passwordHash, body.password))) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }
    const token = app.jwt.sign({ sub: user.id, role: user.role });
    reply.setCookie("token", token, { httpOnly: true, sameSite: "lax", path: "/" });
    return { ok: true, role: user.role };
  });

  app.post("/auth/logout", async (_, reply) => {
    reply.clearCookie("token", { path: "/" });
    return { ok: true };
  });

  app.get("/products", async (request) => {
    const filters = productFilterSchema.parse(request.query);
    const products = await prisma.product.findMany({
      where: {
        name: filters.q ? { contains: filters.q, mode: "insensitive" } : undefined,
        category: filters.category ? { slug: filters.category } : undefined,
        brand: filters.brand ? { slug: filters.brand } : undefined,
        variants: {
          some: {
            size: filters.size,
            color: filters.color,
            priceAgorot: {
              gte: filters.minPrice,
              lte: filters.maxPrice
            },
            stock: filters.inStock ? { gt: 0 } : undefined
          }
        }
      },
      include: { images: true, variants: true, category: true, brand: true }
    });
    return products;
  });

  app.get("/products/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const product = await prisma.product.findUnique({ where: { slug }, include: { images: true, variants: true, category: true, brand: true } });
    if (!product) return reply.code(404).send({ message: "Not found" });
    return product;
  });

  app.get("/meta", async () => ({
    categories: await prisma.category.findMany(),
    brands: await prisma.brand.findMany(),
    shipping: await prisma.shippingSetting.findUnique({ where: { id: "default" } })
  }));

  app.post("/cart/items", async (request, reply) => {
    const body = addToCartSchema.parse(request.body);
    let cartId = request.cookies.cartId;
    if (!cartId) {
      const cart = await prisma.cart.create({ data: {} });
      cartId = cart.id;
      reply.setCookie("cartId", cart.id, { httpOnly: true, sameSite: "lax", path: "/" });
    }
    await prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId, variantId: body.variantId } },
      update: { quantity: { increment: body.quantity } },
      create: { cartId, variantId: body.variantId, quantity: body.quantity }
    });
    return { ok: true };
  });

  app.get("/cart", async (request) => {
    const cartId = request.cookies.cartId;
    if (!cartId) return { items: [], subtotalAgorot: 0 };
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: { variants: true }
                }
              }
            }
          }
        }
      }
    });
    if (!cart) return { items: [], subtotalAgorot: 0 };
    const subtotalAgorot = cart.items.reduce((sum, i) => sum + i.quantity * i.variant.priceAgorot, 0);
    return { ...cart, subtotalAgorot };
  });

  app.patch("/cart/items/:id", async (request) => {
    const { id } = request.params as { id: string };
    const { quantity, variantId } = z
      .object({ quantity: z.number().int().min(1).optional(), variantId: z.string().min(1).optional() })
      .refine((data) => data.quantity !== undefined || data.variantId !== undefined, { message: "quantity or variantId required" })
      .parse(request.body);
    const existing = await prisma.cartItem.findUnique({ where: { id } });
    if (!existing) return { ok: true };
    if (!variantId || variantId === existing.variantId) {
      await prisma.cartItem.update({ where: { id }, data: { quantity } });
      return { ok: true };
    }
    await prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: existing.cartId, variantId } },
      update: { quantity: { increment: quantity ?? existing.quantity } },
      create: { cartId: existing.cartId, variantId, quantity: quantity ?? existing.quantity }
    });
    await prisma.cartItem.delete({ where: { id } });
    return { ok: true };
  });

  app.delete("/cart/items/:id", async (request) => {
    const { id } = request.params as { id: string };
    await prisma.cartItem.delete({ where: { id } });
    return { ok: true };
  });

  app.post("/checkout", async (request, reply) => {
    const body = checkoutSchema.parse(request.body);
    const cartId = request.cookies.cartId;
    if (!cartId) return reply.code(400).send({ message: "cart missing" });
    const cart = await prisma.cart.findUnique({ where: { id: cartId }, include: { items: { include: { variant: { include: { product: true } } } } } });
    if (!cart || cart.items.length === 0) return reply.code(400).send({ message: "cart empty" });

    const shipping = await prisma.shippingSetting.findUniqueOrThrow({ where: { id: "default" } });
    const subtotal = cart.items.reduce((sum, i) => sum + i.quantity * i.variant.priceAgorot, 0);
    const shippingAgorot = body.shippingMethod === "pickup" ? 0 : subtotal >= shipping.freeShippingThreshold ? 0 : shipping.deliveryPriceAgorot;
    const address = await prisma.address.create({ data: body });

    const order = await prisma.order.create({
      data: {
        email: body.email,
        shippingMethod: body.shippingMethod === "pickup" ? ShippingType.PICKUP : ShippingType.DELIVERY,
        subtotalAgorot: subtotal,
        shippingAgorot,
        totalAgorot: subtotal + shippingAgorot,
        addressId: address.id,
        notes: body.notes,
        items: {
          create: cart.items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
            priceAgorot: i.variant.priceAgorot,
            productName: i.variant.product.name,
            variantLabel: `${i.variant.size} / ${i.variant.color}`
          }))
        }
      },
      include: { items: true }
    });

    await sendEmail(body.email, "אישור הזמנה", `ההזמנה התקבלה מספר ${order.id}`);

    let checkoutUrl = `/checkout/success?orderId=${order.id}`;
    if (stripe && process.env.STRIPE_WEB_URL) {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${process.env.STRIPE_WEB_URL}/checkout/success?orderId=${order.id}`,
        cancel_url: `${process.env.STRIPE_WEB_URL}/cart`,
        line_items: order.items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: "ils",
            unit_amount: item.priceAgorot,
            product_data: { name: item.productName }
          }
        }))
      });
      checkoutUrl = session.url ?? checkoutUrl;
      await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
    }

    await prisma.cartItem.deleteMany({ where: { cartId } });
    return { orderId: order.id, checkoutUrl };
  });

  app.get("/admin/orders", { preHandler: requireAdmin }, async () => prisma.order.findMany({ include: { items: true, address: true }, orderBy: { createdAt: "desc" } }));
  app.patch("/admin/orders/:id", { preHandler: requireAdmin }, async (request) => {
    const { id } = request.params as { id: string };
    const { status } = z.object({ status: z.enum(["PENDING", "PAID", "FULFILLED", "CANCELED", "REFUNDED"]) }).parse(request.body);
    return prisma.order.update({ where: { id }, data: { status } });
  });

  app.get("/admin/products", { preHandler: requireAdmin }, async () => prisma.product.findMany({ include: { variants: true, images: true } }));
  app.post("/admin/products", { preHandler: requireAdmin }, async (request) => {
    const body = adminProductSchema.parse(request.body);
    return prisma.product.create({ data: body });
  });

  app.get("/admin/categories", { preHandler: requireAdmin }, async () => prisma.category.findMany());
  app.post("/admin/categories", { preHandler: requireAdmin }, async (request) => {
    const data = z.object({ name: z.string(), slug: z.string() }).parse(request.body);
    return prisma.category.create({ data });
  });

  app.get("/admin/brands", { preHandler: requireAdmin }, async () => prisma.brand.findMany());
  app.post("/admin/brands", { preHandler: requireAdmin }, async (request) => {
    const data = z.object({ name: z.string(), slug: z.string() }).parse(request.body);
    return prisma.brand.create({ data });
  });

  app.get("/admin/shipping", { preHandler: requireAdmin }, async () => prisma.shippingSetting.findUnique({ where: { id: "default" } }));
  app.put("/admin/shipping", { preHandler: requireAdmin }, async (request) => {
    const data = z.object({ pickupEnabled: z.boolean(), pickupAddress: z.string(), deliveryPriceAgorot: z.number().int(), freeShippingThreshold: z.number().int(), slaText: z.string() }).parse(request.body);
    return prisma.shippingSetting.update({ where: { id: "default" }, data });
  });

  app.get("/me", async (request) => {
    try {
      await request.jwtVerify();
      const user = await prisma.user.findUnique({ where: { id: request.user.sub as string } });
      return { user: user ? { id: user.id, email: user.email, role: user.role } : null };
    } catch {
      return { user: null };
    }
  });
}
