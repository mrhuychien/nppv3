import { describe, expect, it } from "vitest";

import { validateOrderEdit } from "@/modules/orders/domain/edit-policy";

const pickedLine = {
  id: "line-1",
  productId: "product-a",
  unit: "thùng",
  quantity: "2",
  conversionFactor: "10",
  pickedBaseQuantity: "15",
};

describe("order edit policy", () => {
  it("blocks all edits after picking", () => {
    expect(validateOrderEdit("delivering", [])).toEqual([
      { lineId: "*", code: "ORDER_LOCKED" },
    ]);
  });

  it("blocks reducing a picked line below picked base quantity", () => {
    expect(
      validateOrderEdit("picking", [
        {
          existing: pickedLine,
          proposed: {
            productId: "product-a",
            unit: "thùng",
            quantity: "1.4",
            conversionFactor: "10",
          },
        },
      ]),
    ).toEqual([{ lineId: "line-1", code: "PICKED_QUANTITY_REDUCTION" }]);
  });

  it("allows increasing a picked line", () => {
    expect(
      validateOrderEdit("picking", [
        {
          existing: pickedLine,
          proposed: {
            productId: "product-a",
            unit: "thùng",
            quantity: "2.5",
            conversionFactor: "10",
          },
        },
      ]),
    ).toEqual([]);
  });
});
