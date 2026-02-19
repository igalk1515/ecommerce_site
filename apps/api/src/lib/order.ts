export function calcSubtotal(items: Array<{ quantity: number; priceAgorot: number }>) {
  return items.reduce((sum, i) => sum + i.quantity * i.priceAgorot, 0);
}

export function calcShipping(subtotal: number, method: "pickup" | "delivery", deliveryPrice: number, freeThreshold: number) {
  if (method === "pickup") return 0;
  return subtotal >= freeThreshold ? 0 : deliveryPrice;
}
