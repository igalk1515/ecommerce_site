"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api, currency } from "../lib/api";
import { CART_UPDATED_EVENT, emitCartUpdated } from "../lib/cart-events";

type Product = {
  id: string;
  slug: string;
  name: string;
  images: { url: string }[];
  variants: { id: string; priceAgorot: number }[];
};

type CartResponse = {
  items: { id: string; quantity: number; variantId: string }[];
};

export function ProductsGrid({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<CartResponse>({ items: [] });

  const loadCart = async () => {
    const data = await api<CartResponse>("/cart");
    setCart(data);
  };

  useEffect(() => {
    void loadCart();
  }, []);

  useEffect(() => {
    const onUpdate = () => {
      void loadCart();
    };
    window.addEventListener(CART_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(CART_UPDATED_EVENT, onUpdate);
  }, []);

  const byVariant = useMemo(() => {
    const map = new Map<string, { id: string; quantity: number }>();
    for (const item of cart.items) map.set(item.variantId, { id: item.id, quantity: item.quantity });
    return map;
  }, [cart.items]);

  const addOne = async (variantId?: string) => {
    if (!variantId) return;
    const existing = byVariant.get(variantId);
    if (!existing) {
      await api("/cart/items", { method: "POST", body: JSON.stringify({ variantId, quantity: 1 }) });
    } else {
      await api(`/cart/items/${existing.id}`, { method: "PATCH", body: JSON.stringify({ quantity: existing.quantity + 1 }) });
    }
    await loadCart();
    emitCartUpdated();
  };

  const removeOne = async (variantId?: string) => {
    if (!variantId) return;
    const existing = byVariant.get(variantId);
    if (!existing) return;
    if (existing.quantity <= 1) {
      await api(`/cart/items/${existing.id}`, { method: "DELETE" });
    } else {
      await api(`/cart/items/${existing.id}`, { method: "PATCH", body: JSON.stringify({ quantity: existing.quantity - 1 }) });
    }
    await loadCart();
    emitCartUpdated();
  };

  return (
    <div className="grid md:grid-cols-4 gap-4">
      {products.map((p) => {
        const variantId = p.variants[0]?.id;
        const quantity = variantId ? byVariant.get(variantId)?.quantity ?? 0 : 0;
        return (
          <article key={p.id} className="card relative group">
            <Link href={`/products/${p.slug}`}>
              <img src={p.images[0]?.url} alt={p.name} className="rounded-lg" />
              <h3 className="mt-2">{p.name}</h3>
              <p>{currency(p.variants[0]?.priceAgorot ?? 0)}</p>
            </Link>
            <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/95 border rounded-lg px-2 py-1 flex items-center justify-between">
                <button className="px-2 py-1 border rounded" onClick={() => void removeOne(variantId)} disabled={!variantId || quantity === 0}>-</button>
                <span className="text-sm font-semibold">{quantity}</span>
                <button className="px-2 py-1 border rounded" onClick={() => void addOne(variantId)} disabled={!variantId}>+</button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
