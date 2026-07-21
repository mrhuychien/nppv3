export type Vnd = bigint & { readonly __brand: "VND" };

export function vnd(value: bigint | number | string): Vnd {
  const parsed = BigInt(value);
  return parsed as Vnd;
}

export function formatVnd(value: Vnd | bigint): string {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);
}
