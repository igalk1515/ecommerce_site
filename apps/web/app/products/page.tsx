import { api } from "../../lib/api";
import { ProductsGrid } from "../../components/products-grid";

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
      <ProductsGrid products={products} />
    </main>
  );
}
