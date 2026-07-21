import type { UserRole } from "@/data/database.types";

export const ORDER_STATUSES = [
  "draft",
  "confirmed",
  "picking",
  "delivering",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderTransition {
  to: OrderStatus;
  roles: readonly UserRole[];
}

export const ORDER_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderTransition[]>> = {
  draft: [
    { to: "confirmed", roles: ["owner", "manager"] },
    { to: "cancelled", roles: ["owner", "manager", "sales"] },
  ],
  confirmed: [
    { to: "picking", roles: ["owner", "manager", "warehouse"] },
    { to: "cancelled", roles: ["owner", "manager"] },
  ],
  picking: [
    { to: "delivering", roles: ["owner", "manager", "warehouse", "driver"] },
    { to: "cancelled", roles: ["owner", "manager"] },
  ],
  // Giao thất bại phải qua bàn giao/đối soát; không có đường tắt hủy đơn.
  delivering: [
    { to: "delivered", roles: ["owner", "manager", "warehouse", "driver"] },
  ],
  delivered: [],
  cancelled: [],
};

export function canTransitionOrder(
  from: OrderStatus,
  to: OrderStatus,
  role: UserRole,
): boolean {
  return ORDER_TRANSITIONS[from].some(
    (transition) => transition.to === to && transition.roles.includes(role),
  );
}

export type StartPickingIntent = {
  kind: "navigate";
  href: `/inventory/stock-out?orderIds=${string}`;
  mutatesStatus: false;
};

/**
 * Compatibility rule: "Bắt đầu lấy hàng" only opens stock-out. The atomic
 * stock-out RPC is the operation that creates the draft entry and moves the
 * selected orders to picking.
 */
export function startPickingIntent(orderIds: readonly string[]): StartPickingIntent {
  if (orderIds.length === 0) throw new Error("NO_ORDERS");
  const uniqueIds = [...new Set(orderIds)];
  return {
    kind: "navigate",
    href: `/inventory/stock-out?orderIds=${uniqueIds.join(",")}`,
    mutatesStatus: false,
  };
}
