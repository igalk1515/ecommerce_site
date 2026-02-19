"use client";
import { useState } from "react";
import { api } from "../../lib/api";

export default function CheckoutPage() {
  const [form, setForm] = useState({ email: "", fullName: "", phone: "", city: "", street: "", postalCode: "", shippingMethod: "delivery", notes: "" });
  return (
    <main className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <form className="card grid md:grid-cols-2 gap-3" onSubmit={async (e) => {
        e.preventDefault();
        const res = await api<{ checkoutUrl: string }>("/checkout", { method: "POST", body: JSON.stringify(form) });
        window.location.href = res.checkoutUrl;
      }}>
        {Object.entries(form).map(([k, v]) => k !== "shippingMethod" ? <input key={k} className="border p-2 rounded" placeholder={k} value={v} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /> : null)}
        <select className="border p-2 rounded" value={form.shippingMethod} onChange={(e) => setForm({ ...form, shippingMethod: e.target.value })}>
          <option value="delivery">משלוח</option>
          <option value="pickup">איסוף עצמי</option>
        </select>
        <button className="btn">תשלום</button>
      </form>
    </main>
  );
}
