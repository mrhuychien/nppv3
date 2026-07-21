export const SELF_DELIVERY_STAGES = [
  "confirmed",
  "stock_out_draft",
  "picking",
  "in_transit",
  "handover_confirmed",
  "collecting",
  "closed",
] as const;

export const DRIVER_DELIVERY_STAGES = [
  "confirmed",
  "delivery_pending",
  "in_transit",
  "handover_confirmed",
  "settling",
  "closed",
] as const;

export type SelfDeliveryStage = (typeof SELF_DELIVERY_STAGES)[number];
export type DriverDeliveryStage = (typeof DRIVER_DELIVERY_STAGES)[number];
export type FulfillmentRail = "self_delivery" | "driver_delivery";

export interface FulfillmentStep {
  rail: FulfillmentRail;
  stage: string;
  atomicOperation: string | null;
  invariants: readonly string[];
}

export const SELF_DELIVERY_WORKFLOW: readonly FulfillmentStep[] = [
  {
    rail: "self_delivery",
    stage: "confirmed",
    atomicOperation: null,
    invariants: ["start-picking-navigates-only"],
  },
  {
    rail: "self_delivery",
    stage: "stock_out_draft",
    atomicOperation: "create_stock_out_bundle",
    invariants: ["all-lines-created", "fefo-suggested", "stock-not-deducted"],
  },
  {
    rail: "self_delivery",
    stage: "picking",
    atomicOperation: "post_self_delivery",
    invariants: ["stock-deducted-once", "receivable-created-immediately"],
  },
  {
    rail: "self_delivery",
    stage: "in_transit",
    atomicOperation: "confirm_driver_handover",
    invariants: ["returns-restocked-once", "failed-orders-reconciled"],
  },
  {
    rail: "self_delivery",
    stage: "collecting",
    atomicOperation: "collect_self_delivery",
    invariants: ["cash-receipt-created", "payments-linked", "orders-delivered"],
  },
];

export const DRIVER_DELIVERY_WORKFLOW: readonly FulfillmentStep[] = [
  {
    rail: "driver_delivery",
    stage: "confirmed",
    atomicOperation: "create_driver_delivery",
    invariants: ["confirmed-orders-only", "no-stock-entry-created"],
  },
  {
    rail: "driver_delivery",
    stage: "in_transit",
    atomicOperation: "confirm_driver_handover",
    invariants: ["handover-always-available", "returns-restocked-once"],
  },
  {
    rail: "driver_delivery",
    stage: "settling",
    atomicOperation: "settle_driver_delivery",
    invariants: ["cash-receipt-created", "payments-linked", "settled-once"],
  },
];

export function workflowForRail(rail: FulfillmentRail): readonly FulfillmentStep[] {
  return rail === "self_delivery"
    ? SELF_DELIVERY_WORKFLOW
    : DRIVER_DELIVERY_WORKFLOW;
}
