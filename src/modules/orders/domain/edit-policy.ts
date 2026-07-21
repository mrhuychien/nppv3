import { decimal, type DecimalInput } from "@/modules/shared/domain/decimal";
import type { OrderStatus } from "@/modules/orders/domain/order-workflow";

export type WorkflowStage =
  | "draft"
  | "pending_approval"
  | "approved"
  | "picking"
  | "delivering"
  | "collecting"
  | "handover"
  | "closed"
  | "failed"
  | "delivery_failed";

export interface LineSnapshot {
  id: string;
  productId: string;
  unit: string;
  quantity: DecimalInput;
  conversionFactor: DecimalInput;
  pickedBaseQuantity: DecimalInput;
}

export interface ProposedLine {
  productId: string;
  unit: string;
  quantity: DecimalInput;
  conversionFactor: DecimalInput;
}

export interface LineChange {
  existing: LineSnapshot | null;
  proposed: ProposedLine | null;
}

export interface EditViolation {
  lineId: string;
  code:
    | "ORDER_LOCKED"
    | "PICKED_LINE_REMOVE"
    | "PICKED_PRODUCT_CHANGE"
    | "PICKED_UOM_CHANGE"
    | "PICKED_QUANTITY_REDUCTION";
}

const LOCKED_STAGES: readonly WorkflowStage[] = [
  "delivering",
  "collecting",
  "handover",
  "closed",
  "failed",
  "delivery_failed",
];

export function validateOrderEdit(
  stage: WorkflowStage,
  changes: readonly LineChange[],
): readonly EditViolation[] {
  if (LOCKED_STAGES.includes(stage)) {
    return [{ lineId: "*", code: "ORDER_LOCKED" }];
  }
  if (stage !== "picking") return [];

  const violations: EditViolation[] = [];
  for (const [index, change] of changes.entries()) {
    const lineId = change.existing?.id ?? `new-${index}`;
    if (!change.existing) continue;

    const picked = decimal(change.existing.pickedBaseQuantity);
    if (picked.lte(0)) continue;

    if (!change.proposed) {
      violations.push({ lineId, code: "PICKED_LINE_REMOVE" });
      continue;
    }
    if (change.existing.productId !== change.proposed.productId) {
      violations.push({ lineId, code: "PICKED_PRODUCT_CHANGE" });
      continue;
    }
    if (change.existing.unit !== change.proposed.unit) {
      violations.push({ lineId, code: "PICKED_UOM_CHANGE" });
      continue;
    }

    const proposedBase = decimal(change.proposed.quantity).mul(
      decimal(change.proposed.conversionFactor),
    );
    if (proposedBase.lt(picked)) {
      violations.push({ lineId, code: "PICKED_QUANTITY_REDUCTION" });
    }
  }
  return violations;
}

export function stageFromOrderStatus(status: OrderStatus): WorkflowStage {
  const mapping: Record<OrderStatus, WorkflowStage> = {
    draft: "draft",
    confirmed: "approved",
    picking: "picking",
    delivering: "delivering",
    delivered: "closed",
    cancelled: "failed",
  };
  return mapping[status];
}
