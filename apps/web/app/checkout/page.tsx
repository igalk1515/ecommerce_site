"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api, currency } from "../../lib/api";
import { emitCartUpdated } from "../../lib/cart-events";

type Variant = { id: string; size: string; color: string; priceAgorot: number; stock: number };
type CartItem = {
  id: string;
  quantity: number;
  variantId: string;
  variant: { id: string; size: string; color: string; priceAgorot: number; product: { name: string; variants: Variant[] } };
};
type CartResponse = { items: CartItem[]; subtotalAgorot: number };

export default function CheckoutPage() {
  const [form, setForm] = useState({ email: "", fullName: "", phone: "", city: "", street: "", postalCode: "", shippingMethod: "delivery", notes: "" });
  const [cart, setCart] = useState<CartResponse>({ items: [], subtotalAgorot: 0 });

  const loadCart = async () => {
    const data = await api<CartResponse>("/cart");
    setCart(data);
  };

  useEffect(() => {
    void loadCart();
  }, []);

  const canCheckout = useMemo(() => cart.items.length > 0 && cart.items.every((item) => Boolean(item.variantId)), [cart.items]);

  return (
    <main className="container py-8 space-y-4">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <section className="card space-y-2">
        <h2 className="font-semibold">××™×ž×•×ª ×¤×¨×™×˜×™× ×•×ž×™×“×”</h2>
        {cart.items.length === 0 ? <div>×”×¢×’×œ×” ×¨×™×§×”. <Link className="underline" href="/products">×—×–×¨×” ×œ×ž×•×¦×¨×™×</Link></div> : null}
        {cart.items.map((item) => (
          <div key={item.id} className="border-b pb-2">
            <div className="font-medium">{item.variant.product.name}</div>
            <div className="text-sm text-gray-600">×›×ž×•×ª: {item.quantity}</div>
            <select
              className="border p-2 rounded mt-1"
              value={item.variantId}
              onChange={async (e) => {
                await api(`/cart/items/${item.id}`, { method: "PATCH", body: JSON.stringify({ variantId: e.target.value }) });
                await loadCart();
                emitCartUpdated();
              }}
            >
              {item.variant.product.variants
                .filter((v) => v.stock > 0)
                .map((v) => <option key={v.id} value={v.id}>{v.size} / {v.color} - {currency(v.priceAgorot)}</option>)}
            </select>
          </div>
        ))}
      </section>
      <form className="card grid md:grid-cols-2 gap-3" onSubmit={async (e) => {
        e.preventDefault();
        if (!canCheckout) return;
        const res = await api<{ checkoutUrl: string }>("/checkout", { method: "POST", body: JSON.stringify(form) });
        window.location.href = res.checkoutUrl;
      }}>
        <input className="border p-2 rounded" placeholder="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="border p-2 rounded" placeholder="fullName" autoComplete="name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input className="border p-2 rounded" placeholder="phone" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="border p-2 rounded" placeholder="city" autoComplete="address-level2" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <input className="border p-2 rounded" placeholder="street" autoComplete="street-address" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
        <input className="border p-2 rounded" placeholder="postalCode" autoComplete="postal-code" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
        <input className="border p-2 rounded md:col-span-2" placeholder="notes" autoComplete="off" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <select className="border p-2 rounded" value={form.shippingMethod} onChange={(e) => setForm({ ...form, shippingMethod: e.target.value })}>
          <option value="delivery">×ž×©×œ×•×—</option>
          <option value="pickup">××™×¡×•×£ ×¢×¦×ž×™</option>
        </select>
        <button className="btn" disabled={!canCheckout}>×ª×©×œ×•×</button>
      </form>
    </main>
  );
}
