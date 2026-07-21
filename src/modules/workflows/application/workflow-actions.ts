"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  collectSelfDeliveryActionSchema,
  confirmDriverHandoverActionSchema,
  createSalesOrderActionSchema,
  createStockOutBundleActionSchema,
  settleDriverDeliveryActionSchema,
} from "@/modules/workflows/application/rpc-contracts";
import {
  executeAuthenticatedRpc,
  invalidWorkflowInput,
  type WorkflowActionResult,
} from "@/modules/workflows/application/execute-authenticated-rpc";

const rpcObjectSchema = z.looseObject({});
type RpcObject = z.infer<typeof rpcObjectSchema>;

function refresh(paths: readonly string[]) {
  for (const path of paths) revalidatePath(path);
}

export async function createSalesOrder(
  input: unknown,
): Promise<WorkflowActionResult<RpcObject>> {
  const parsed = createSalesOrderActionSchema.safeParse(input);
  if (!parsed.success) return invalidWorkflowInput();

  const result = await executeAuthenticatedRpc({
    execute: (client) =>
      client.rpc("create_sales_order_v1_compatible", {
        p_payload: parsed.data.payload,
        p_idempotency_key: parsed.data.idempotencyKey,
      }),
    outputSchema: rpcObjectSchema,
  });
  if (result.ok) refresh(["/orders"]);
  return result;
}

export async function createStockOutBundle(
  input: unknown,
): Promise<WorkflowActionResult<RpcObject>> {
  const parsed = createStockOutBundleActionSchema.safeParse(input);
  if (!parsed.success) return invalidWorkflowInput();

  const result = await executeAuthenticatedRpc({
    execute: (client) =>
      client.rpc("create_stock_out_bundle", {
        p_payload: parsed.data.payload,
        p_idempotency_key: parsed.data.idempotencyKey,
      }),
    outputSchema: rpcObjectSchema,
  });
  if (result.ok) refresh(["/orders", "/inventory/stock-out"]);
  return result;
}

export async function collectSelfDelivery(
  input: unknown,
): Promise<WorkflowActionResult<RpcObject>> {
  const parsed = collectSelfDeliveryActionSchema.safeParse(input);
  if (!parsed.success) return invalidWorkflowInput();

  const result = await executeAuthenticatedRpc({
    execute: (client) =>
      client.rpc("collect_self_delivery", {
        p_entry_id: parsed.data.entryId,
        p_payload: parsed.data.payload,
        p_idempotency_key: parsed.data.idempotencyKey,
      }),
    outputSchema: rpcObjectSchema,
  });
  if (result.ok) refresh(["/orders", "/deliveries", "/finance/cash-receipts"]);
  return result;
}

export async function settleDriverDelivery(
  input: unknown,
): Promise<WorkflowActionResult<RpcObject>> {
  const parsed = settleDriverDeliveryActionSchema.safeParse(input);
  if (!parsed.success) return invalidWorkflowInput();

  const result = await executeAuthenticatedRpc({
    execute: (client) =>
      client.rpc("settle_driver_delivery", {
        p_delivery_id: parsed.data.deliveryId,
        p_payload: parsed.data.payload,
        p_idempotency_key: parsed.data.idempotencyKey,
      }),
    outputSchema: rpcObjectSchema,
  });
  if (result.ok) refresh(["/orders", "/deliveries", "/finance/cash-receipts"]);
  return result;
}

export async function confirmDriverHandover(
  input: unknown,
): Promise<WorkflowActionResult<RpcObject>> {
  const parsed = confirmDriverHandoverActionSchema.safeParse(input);
  if (!parsed.success) return invalidWorkflowInput();

  const result = await executeAuthenticatedRpc({
    execute: (client) =>
      client.rpc("confirm_driver_handover", {
        p_handover_id: parsed.data.handoverId,
        p_idempotency_key: parsed.data.idempotencyKey,
      }),
    outputSchema: rpcObjectSchema,
  });
  if (result.ok) refresh(["/orders", "/deliveries", "/inventory/stock-out"]);
  return result;
}
