"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  executeAuthenticatedRpc,
  invalidWorkflowInput,
} from "@/modules/workflows/application/execute-authenticated-rpc";

const inputSchema = z.object({ entryId: z.string().uuid() });

export type PostSelfDeliveryResult =
  | { ok: true; deliveryId: string; idempotent: boolean }
  | { ok: false; error: string };

export async function postSelfDelivery(
  input: z.input<typeof inputSchema>,
): Promise<PostSelfDeliveryResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: invalidWorkflowInput().error.code };
  }

  const result = await executeAuthenticatedRpc({
    execute: (client) =>
      client.rpc("post_self_delivery", { p_entry_id: parsed.data.entryId }),
    outputSchema: z.object({
      delivery_id: z.string().uuid(),
      idempotent: z.boolean().optional(),
    }),
  });
  if (!result.ok) return { ok: false, error: result.error.code };

  revalidatePath("/orders");
  revalidatePath("/inventory/stock-out");
  revalidatePath("/deliveries");

  return {
    ok: true,
    deliveryId: result.data.delivery_id,
    idempotent: result.data.idempotent === true,
  };
}
