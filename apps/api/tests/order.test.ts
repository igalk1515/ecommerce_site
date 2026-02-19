import { describe, expect, it } from "vitest";
import { calcShipping, calcSubtotal } from "../src/lib/order.js";

describe("order calculations", () => {
  it("calculates subtotal", () => {
    expect(calcSubtotal([{ quantity: 2, priceAgorot: 1000 }, { quantity: 1, priceAgorot: 500 }])).toBe(2500);
  });
  it("pickup has free shipping", () => {
    expect(calcShipping(10000, "pickup", 3000, 20000)).toBe(0);
  });
  it("free shipping threshold", () => {
    expect(calcShipping(25000, "delivery", 3000, 20000)).toBe(0);
  });
});
