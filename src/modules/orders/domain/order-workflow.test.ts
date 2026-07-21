import { describe, expect, it } from "vitest";

import {
  canTransitionOrder,
  startPickingIntent,
} from "@/modules/orders/domain/order-workflow";

describe("order workflow compatibility", () => {
  it("forbids the delivering to cancelled shortcut", () => {
    expect(canTransitionOrder("delivering", "cancelled", "owner")).toBe(false);
  });

  it("allows a driver to mark a delivering order delivered", () => {
    expect(canTransitionOrder("delivering", "delivered", "driver")).toBe(true);
  });

  it("opens stock-out without mutating status when picking starts", () => {
    expect(startPickingIntent(["order-a", "order-a", "order-b"])).toEqual({
      kind: "navigate",
      href: "/inventory/stock-out?orderIds=order-a,order-b",
      mutatesStatus: false,
    });
  });
});
