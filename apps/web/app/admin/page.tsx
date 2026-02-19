"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productForm, setProductForm] = useState({ name: "", slug: "", description: "", categoryId: "", brandId: "", featured: false });
  const [meta, setMeta] = useState<any>({ categories: [], brands: [] });

  useEffect(() => {
    api<any>("/meta").then(setMeta);
    api<any[]>("/admin/orders").then(setOrders).catch(() => (window.location.href = "/admin/login"));
    api<any[]>("/admin/products").then(setProducts);
  }, []);

  return (
    <main className="container py-8 space-y-6">
      <h1 className="text-2xl font-bold">דשבורד ניהול</h1>
      <section className="card">
        <h2 className="font-semibold mb-2">יצירת מוצר</h2>
        <form className="grid md:grid-cols-3 gap-2" onSubmit={async (e) => {
          e.preventDefault();
          await api("/admin/products", { method: "POST", body: JSON.stringify(productForm) });
          setProducts(await api<any[]>("/admin/products"));
        }}>
          <input className="border p-2 rounded" placeholder="name" onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
          <input className="border p-2 rounded" placeholder="slug" onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} />
          <input className="border p-2 rounded" placeholder="description" onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
          <select className="border p-2 rounded" onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}>{meta.categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <select className="border p-2 rounded" onChange={(e) => setProductForm({ ...productForm, brandId: e.target.value })}>{meta.brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
          <button className="btn">שמור</button>
        </form>
      </section>
      <section className="card">
        <h2 className="font-semibold">הזמנות</h2>
        {orders.map((o) => <div key={o.id} className="border-b py-2 flex justify-between"><span>{o.id}</span><span>{o.status}</span></div>)}
      </section>
      <section className="card">
        <h2 className="font-semibold">מוצרים</h2>
        {products.map((p) => <div key={p.id}>{p.name}</div>)}
      </section>
    </main>
  );
}
