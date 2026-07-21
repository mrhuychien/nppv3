import { z } from "zod";

const uuid = z.string().uuid();
const positiveDecimal = z.union([z.string(), z.number()]).transform(String).pipe(
  z.string().regex(/^\d+(?:\.\d+)?$/),
);
const nonNegativeMoney = z.union([z.string(), z.number()]).transform(String).pipe(
  z.string().regex(/^\d+$/),
);

export const idempotencyKeySchema = z.string().uuid();

export const createSalesOrderPayloadSchema = z.object({
  customer_id: uuid,
  payment_terms: z.string().trim().optional(),
  expected_delivery: z.iso.date().optional(),
  notes: z.string().trim().optional(),
  lines: z
    .array(
      z.object({
        product_id: uuid,
        unit_name: z.string().trim().min(1),
        quantity: positiveDecimal,
        unit_price: nonNegativeMoney,
        discount_percent: z.number().min(0).max(100).optional(),
        vat_rate: z.number().min(0).max(1).optional(),
        note: z.string().trim().optional(),
      }),
    )
    .min(1),
  returns: z
    .object({
      reason: z.string().trim().min(1),
      notes: z.string().trim().optional(),
      lines: z.array(
        z.object({
          product_id: uuid,
          unit_name: z.string().trim().min(1),
          quantity: positiveDecimal,
          unit_price: nonNegativeMoney,
          vat_rate: z.number().min(0).max(1).optional(),
          is_exchange: z.boolean().optional(),
          note: z.string().trim().optional(),
        }),
      ),
    })
    .optional(),
});

export const createStockOutBundlePayloadSchema = z.object({
  order_ids: z.array(uuid).min(1),
  swaps: z
    .array(
      z.object({
        product_id: uuid,
        unit_name: z.string().trim().min(1),
        qty: positiveDecimal,
        conversion_factor: positiveDecimal.optional(),
        reason: z.string().trim().optional(),
      }),
    )
    .optional(),
});

export const collectSelfDeliveryPayloadSchema = z.object({
  rows: z.array(
    z.object({
      order_id: uuid,
      collect: nonNegativeMoney,
      method: z.enum(["cash", "transfer", "ewallet"]),
    }),
  ),
  notes: z.string().trim().optional(),
});

export const settleDriverDeliveryPayloadSchema = z.object({
  lines: z.array(
    z.object({
      delivery_line_id: uuid,
      amount: nonNegativeMoney,
    }),
  ),
  notes: z.string().trim().optional(),
});

export const createSalesOrderActionSchema = z.object({
  payload: createSalesOrderPayloadSchema,
  idempotencyKey: idempotencyKeySchema,
});

export const createStockOutBundleActionSchema = z.object({
  payload: createStockOutBundlePayloadSchema,
  idempotencyKey: idempotencyKeySchema,
});

export const collectSelfDeliveryActionSchema = z.object({
  entryId: uuid,
  payload: collectSelfDeliveryPayloadSchema,
  idempotencyKey: idempotencyKeySchema,
});

export const settleDriverDeliveryActionSchema = z.object({
  deliveryId: uuid,
  payload: settleDriverDeliveryPayloadSchema,
  idempotencyKey: idempotencyKeySchema,
});

export const confirmDriverHandoverActionSchema = z.object({
  handoverId: uuid,
  idempotencyKey: idempotencyKeySchema,
});
