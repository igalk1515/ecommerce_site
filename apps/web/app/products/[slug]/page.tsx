"use client";
import { useEffect, useState } from "react";
import { api, currency } from "../../../lib/api";

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [variantId, setVariantId] = useState<string>("");
  useEffect(() => { api<any>(`/products/${params.slug}`).then((p) => { setProduct(p); setVariantId(p.variants[0]?.id); }); }, [params.slug]);
  if (!product) return <main className="container py-8">טוען...</main>;
  return (
    <main className="container py-8 grid md:grid-cols-2 gap-6">
      <img src={product.images[0]?.url} alt={product.name} className="rounded-xl" />
      <div className="card space-y-3">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p>{product.description}</p>
        <select className="border rounded p-2 w-full" value={variantId} onChange={(e) => setVariantId(e.target.value)}>
          {product.variants.map((v: any) => <option key={v.id} value={v.id}>{v.size} / {v.color} - {currency(v.priceAgorot)}</option>)}
        </select>
        <button className="btn" onClick={async () => {
          await api("/cart/items", { method: "POST", body: JSON.stringify({ variantId, quantity: 1 }) });
          alert("נוסף לעגלה");
        }}>הוספה לעגלה</button>
      </div>
    </main>
  );
}
