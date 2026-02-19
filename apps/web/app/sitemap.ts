import { api } from "../lib/api";

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const products = await api<any[]>("/products");
  return [
    "", "/products", "/about", "/contact", "/faq", "/shipping-returns", "/privacy", "/how-to-get-here"
  ].map((path) => ({ url: `${base}${path}`, lastModified: new Date() })).concat(products.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: new Date() })));
}
