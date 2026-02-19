import Link from "next/link";
import { api, currency } from "../../lib/api";

export default async function ProductsPage({ searchParams }: { searchParams: Record<string, string> }) {
  const q = new URLSearchParams(searchParams).toString();
  const products = await api<any[]>(`/products${q ? `?${q}` : ""}`);
  return (
    <main className="container py-8">
      <h1 className="text-2xl font-bold mb-4">קטלוג מוצרים</h1>
      <form className="card grid md:grid-cols-6 gap-2 mb-4">
        <input name="q" placeholder="חיפוש" className="border rounded p-2" />
        <input name="category" placeholder="קטגוריה" className="border rounded p-2" />
        <input name="brand" placeholder="מותג" className="border rounded p-2" />
        <input name="size" placeholder="מידה" className="border rounded p-2" />
        <input name="color" placeholder="צבע" className="border rounded p-2" />
        <button className="btn">סינון</button>
      </form>
      <div className="grid md:grid-cols-4 gap-4">
        {products.map((p) => (
          <Link key={p.id} className="card" href={`/products/${p.slug}`}>
            <img src={p.images[0]?.url} alt={p.name} className="rounded-lg" />
            <h3 className="mt-2">{p.name}</h3>
            <p>{currency(p.variants[0]?.priceAgorot ?? 0)}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
