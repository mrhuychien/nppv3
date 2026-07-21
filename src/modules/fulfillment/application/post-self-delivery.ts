"use server";

import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const inputSchema = z.object({ entryId: z.string().uuid() });

export type PostSelfDeliveryResult =
  | { ok: true; deliveryId: string; idempotent: boolean }
  | { ok: false; error: string };

export async function postSelfDelivery(
  input: z.input<typeof inputSchema>,
): Promise<PostSelfDeliveryResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_ENTRY_ID" };

  const supabase = await createSupabaseServerClient();
  const { data: claims, error: authError } = await supabase.auth.getClaims();
  if (authError || !claims?.claims?.sub) {
    return { ok: false, error: "NOT_AUTHENTICATED" };
  }

  const { data, error } = await supabase.rpc("post_self_delivery", {
    p_entry_id: parsed.data.entryId,
  });
  if (error) return { ok: false, error: error.message };

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, error: "INVALID_RPC_RESPONSE" };
  }
  const deliveryId = data.delivery_id;
  if (typeof deliveryId !== "string") {
    return { ok: false, error: "DELIVERY_NOT_CREATED" };
  }

  return {
    ok: true,
    deliveryId,
    idempotent: data.idempotent === true,
  };
}
