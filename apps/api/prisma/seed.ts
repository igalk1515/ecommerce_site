import { PrismaClient, Role } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.shippingSetting.deleteMany();

  const categories = await Promise.all([
    prisma.category.create({ data: { name: "נעלי ספורט", slug: "sports-shoes" } }),
    prisma.category.create({ data: { name: "ביגוד אימון", slug: "training-clothes" } }),
    prisma.category.create({ data: { name: "ציוד כושר", slug: "fitness-gear" } }),
    prisma.category.create({ data: { name: "אביזרים", slug: "accessories" } })
  ]);

  const brands = await Promise.all([
    prisma.brand.create({ data: { name: "ActiveOne", slug: "activeone" } }),
    prisma.brand.create({ data: { name: "MoveMax", slug: "movemax" } }),
    prisma.brand.create({ data: { name: "SprintLab", slug: "sprintlab" } }),
    prisma.brand.create({ data: { name: "ProFlex", slug: "proflex" } })
  ]);

  for (let i = 1; i <= 20; i++) {
    const category = categories[i % categories.length];
    const brand = brands[i % brands.length];
    await prisma.product.create({
      data: {
        name: `מוצר ספורט ${i}`,
        slug: `sport-product-${i}`,
        description: "מוצר איכותי לאימון יומיומי ולביצועים גבוהים.",
        categoryId: category.id,
        brandId: brand.id,
        featured: i <= 6,
        images: {
          create: [{ url: `https://picsum.photos/seed/sport${i}/900/900`, alt: `מוצר ${i}`, sortOrder: 0 }]
        },
        variants: {
          create: [
            {
              size: "M",
              color: "שחור",
              sku: `SKU-${i}-M-BLK`,
              priceAgorot: 14990 + i * 500,
              compareAgorot: 17990 + i * 500,
              stock: 10 + i
            },
            {
              size: "L",
              color: "כחול",
              sku: `SKU-${i}-L-BLU`,
              priceAgorot: 15990 + i * 500,
              compareAgorot: 18990 + i * 500,
              stock: 5 + i
            }
          ]
        }
      }
    });
  }

  const passwordHash = await argon2.hash("Admin123!");
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash, role: Role.ADMIN, fullName: "מנהל מערכת" },
    create: {
      email: "admin@example.com",
      passwordHash,
      role: Role.ADMIN,
      fullName: "מנהל מערכת"
    }
  });

  await prisma.shippingSetting.create({
    data: {
      id: "default",
      pickupEnabled: true,
      pickupAddress: "רחוב הספורט 10, תל אביב",
      deliveryPriceAgorot: 3000,
      freeShippingThreshold: 25000,
      slaText: "עד 7 ימי עסקים"
    }
  });
}

main().finally(async () => prisma.$disconnect());
