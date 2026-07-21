import Decimal from "decimal.js";

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export type DecimalInput = Decimal.Value;

export function decimal(value: DecimalInput): Decimal {
  const parsed = new Decimal(value);
  if (!parsed.isFinite()) throw new Error("INVALID_DECIMAL");
  return parsed;
}

export function nonNegativeDecimal(value: DecimalInput): Decimal {
  const parsed = decimal(value);
  if (parsed.isNegative()) throw new Error("NEGATIVE_DECIMAL");
  return parsed;
}
