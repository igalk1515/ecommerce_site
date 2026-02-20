export const CART_UPDATED_EVENT = "cart:updated";

export function emitCartUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

