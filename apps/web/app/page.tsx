import Link from "next/link";
import { api, currency } from "../lib/api";

export default async function HomePage() {
  const products = await api<any[]>("/products");
  const featured = products.filter((p) => p.featured).slice(0, 8);
  return (
    <main className="container py-8 space-y-8">
      <section className="card bg-gradient-to-l from-blue-900 to-blue-500 text-white">
        <h1 className="text-3xl font-bold">חנות ספורט מקצועית אונליין</h1>
        <p className="mt-2">מוצרים איכותיים לאימון, ריצה ואורח חיים פעיל.</p>
        <Link className="btn mt-4 bg-white text-blue-900" href="/products">לקטלוג המלא</Link>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">מוצרים מובילים</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {featured.map((p) => (
            <Link key={p.id} href={`/products/${p.slug}`} className="card">
              <img src={p.images[0]?.url} alt={p.name} className="rounded-lg mb-2" />
              <h3>{p.name}</h3>
              <p>{currency(p.variants[0]?.priceAgorot ?? 0)}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
