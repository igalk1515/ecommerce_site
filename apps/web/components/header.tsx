"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api, currency } from "../lib/api";
import { CART_UPDATED_EVENT, emitCartUpdated } from "../lib/cart-events";

type CartItem = {
  id: string;
  quantity: number;
  variant: {
    id: string;
    size: string;
    color: string;
    priceAgorot: number;
    product: { name: string };
  };
};

type CartResponse = {
  items: CartItem[];
  subtotalAgorot: number;
};

export function Header() {
  const [cart, setCart] = useState<CartResponse>({ items: [], subtotalAgorot: 0 });
  const [open, setOpen] = useState(false);

  const loadCart = async () => {
    const data = await api<CartResponse>("/cart");
    setCart(data);
  };

  useEffect(() => {
    void loadCart();
  }, []);

  useEffect(() => {
    const onCartUpdated = () => {
      void loadCart();
    };
    window.addEventListener(CART_UPDATED_EVENT, onCartUpdated);
    window.addEventListener("focus", onCartUpdated);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, onCartUpdated);
      window.removeEventListener("focus", onCartUpdated);
    };
  }, []);

  const totalItems = useMemo(() => cart.items.reduce((sum, item) => sum + item.quantity, 0), [cart.items]);

  return (
    <header className="bg-white border-b">
      <div className="container py-4 flex gap-4 items-center justify-between">
        <Link href="/" className="font-bold text-xl">ספורט בעיר</Link>
        <nav className="flex gap-4 text-sm items-center">
          <Link href="/products">מוצרים</Link>
          <Link href="/about">אודות</Link>
          <Link href="/contact">יצירת קשר</Link>
          <div className="relative">
            <button className="inline-flex items-center gap-2" onClick={() => setOpen((v) => !v)} aria-label="Cart preview">
              <span aria-hidden="true">🛒</span>
              <span>עגלה</span>
              <span className="inline-flex items-center justify-center min-w-5 h-5 rounded-full bg-black text-white text-xs px-1">{totalItems}</span>
            </button>
            {open ? (
              <div className="absolute left-0 mt-2 w-80 max-w-[90vw] bg-white border rounded-lg p-3 shadow-lg z-30 space-y-2">
                {cart.items.length === 0 ? <div className="text-sm text-gray-500">העגלה ריקה</div> : null}
                {cart.items.map((item) => (
                  <div key={item.id} className="text-xs border-b pb-2">
                    <div className="font-medium">{item.variant.product.name}</div>
                    <div className="text-gray-600">{item.variant.size}/{item.variant.color}</div>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        className="border rounded p-1 w-16"
                        onChange={async (e) => {
                          await api(`/cart/items/${item.id}`, { method: "PATCH", body: JSON.stringify({ quantity: Number(e.target.value) }) });
                          await loadCart();
                          emitCartUpdated();
                        }}
                      />
                      <span>{currency(item.quantity * item.variant.priceAgorot)}</span>
                    </div>
                  </div>
                ))}
                <div className="font-semibold text-sm">סה"כ: {currency(cart.subtotalAgorot || 0)}</div>
                <div className="flex gap-2">
                  <Link href="/cart" className="btn flex-1 text-center" onClick={() => setOpen(false)}>לעגלה</Link>
                  <Link href="/checkout" className="btn flex-1 text-center" onClick={() => setOpen(false)}>לתשלום</Link>
                </div>
              </div>
            ) : null}
          </div>
          <Link href="/admin">ניהול</Link>
        </nav>
      </div>
    </header>
  );
}
