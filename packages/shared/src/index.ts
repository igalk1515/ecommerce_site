import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const productFilterSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  minPrice: z.coerce.number().int().optional(),
  maxPrice: z.coerce.number().int().optional(),
  inStock: z.coerce.boolean().optional()
});

export const addToCartSchema = z.object({
  variantId: z.string(),
  quantity: z.number().int().min(1).max(10)
});

export const checkoutSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  phone: z.string().min(7),
  city: z.string().min(2),
  street: z.string().min(2),
  postalCode: z.string().min(4),
  shippingMethod: z.enum(["pickup", "delivery"]),
  notes: z.string().optional()
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
