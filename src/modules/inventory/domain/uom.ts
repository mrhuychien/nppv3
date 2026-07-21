import type Decimal from "decimal.js";

import {
  decimal,
  nonNegativeDecimal,
  type DecimalInput,
} from "@/modules/shared/domain/decimal";

export interface QuantitySnapshot {
  transactionQuantity: Decimal;
  transactionUnit: string;
  conversionFactor: Decimal;
  baseQuantity: Decimal;
}

export function snapshotQuantity(input: {
  quantity: DecimalInput;
  unit: string;
  conversionFactor: DecimalInput;
}): QuantitySnapshot {
  const transactionQuantity = nonNegativeDecimal(input.quantity);
  const conversionFactor = decimal(input.conversionFactor);

  if (conversionFactor.lte(0)) throw new Error("INVALID_CONVERSION_FACTOR");
  if (!input.unit.trim()) throw new Error("UNIT_REQUIRED");

  return {
    transactionQuantity,
    transactionUnit: input.unit.trim(),
    conversionFactor,
    baseQuantity: transactionQuantity.mul(conversionFactor),
  };
}

export function formatQuantity(snapshot: QuantitySnapshot, baseUnit: string): string {
  const transaction = snapshot.transactionQuantity.toDecimalPlaces(3).toString();
  const base = snapshot.baseQuantity.toDecimalPlaces(3).toString();

  if (snapshot.conversionFactor.eq(1) && snapshot.transactionUnit === baseUnit) {
    return `${transaction} ${baseUnit}`;
  }
  return `${transaction} ${snapshot.transactionUnit} (${base} ${baseUnit})`;
}
