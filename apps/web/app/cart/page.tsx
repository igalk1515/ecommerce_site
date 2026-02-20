"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, currency } from "../../lib/api";
import { emitCartUpdated } from "../../lib/cart-events";

export default function CartPage() {
  const [cart, setCart] = useState<any>({ items: [], subtotalAgorot: 0 });
  const load = () => api<any>("/cart").then(setCart);

  useEffect(() => {
    void load();
  }, []);

  return (
    <main className="container py-8 space-y-4">
      <h1 className="text-2xl font-bold">עגלה</h1>
      {cart.items?.map((item: any) => (
        <div key={item.id} className="card flex justify-between">
          <div>{item.variant.product.name} ({item.variant.size}/{item.variant.color})</div>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min={1}
              className="border rounded p-1 w-16"
              value={item.quantity}
              onChange={async (e) => {
                await api(`/cart/items/${item.id}`, { method: "PATCH", body: JSON.stringify({ quantity: Number(e.target.value) }) });
                await load();
                emitCartUpdated();
              }}
            />
            <button
              onClick={async () => {
                await api(`/cart/items/${item.id}`, { method: "DELETE" });
                await load();
                emitCartUpdated();
              }}
            >
              הסר
            </button>
          </div>
        </div>
      ))}
      <div className="card">סה"כ ביניים: {currency(cart.subtotalAgorot || 0)}</div>
      <Link className="btn" href="/checkout">לתשלום</Link>
    </main>
  );
}

