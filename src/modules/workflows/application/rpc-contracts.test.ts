import { describe, expect, it } from "vitest";

import {
  createSalesOrderPayloadSchema,
  createStockOutBundlePayloadSchema,
} from "@/modules/workflows/application/rpc-contracts";

const customerId = "0d3035b1-693b-4e62-8ca0-bf59d45830a7";
const productId = "241d5f45-826b-41ce-a64f-b6f18b1fdc12";
const orderId = "6ed5e5a6-68f8-4f61-a18e-46f7e6bdf742";

describe("legacy RPC contracts", () => {
  it("normalizes numeric order input to decimal strings", () => {
    const parsed = createSalesOrderPayloadSchema.parse({
      customer_id: customerId,
      lines: [
        {
          product_id: productId,
          unit_name: "thùng",
          quantity: 2.5,
          unit_price: 480000,
        },
      ],
    });
    expect(parsed.lines[0]?.quantity).toBe("2.5");
    expect(parsed.lines[0]?.unit_price).toBe("480000");
  });

  it("requires at least one order for stock-out", () => {
    expect(() => createStockOutBundlePayloadSchema.parse({ order_ids: [] })).toThrow();
    expect(
      createStockOutBundlePayloadSchema.parse({ order_ids: [orderId] }).order_ids,
    ).toEqual([orderId]);
  });
});
