export default function robots() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return { rules: [{ userAgent: "*", allow: "/" }], sitemap: `${url}/sitemap.xml` };
}
