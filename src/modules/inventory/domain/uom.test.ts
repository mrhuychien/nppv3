import { describe, expect, it } from "vitest";

import { formatQuantity, snapshotQuantity } from "@/modules/inventory/domain/uom";

describe("inventory UOM", () => {
  it("uses exact decimal arithmetic for base UOM", () => {
    const snapshot = snapshotQuantity({
      quantity: "0.1",
      unit: "thùng",
      conversionFactor: "10",
    });

    expect(snapshot.baseQuantity.toString()).toBe("1");
    expect(formatQuantity(snapshot, "hộp")).toBe("0.1 thùng (1 hộp)");
  });

  it("rejects a zero conversion factor", () => {
    expect(() =>
      snapshotQuantity({ quantity: 1, unit: "thùng", conversionFactor: 0 }),
    ).toThrow("INVALID_CONVERSION_FACTOR");
  });
});
