import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { z } from "zod";

import type { Database, Json } from "@/data/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/modules/identity/data/current-user";
import { normalizeRpcError } from "@/modules/workflows/application/workflow-error";

export type WorkflowActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string } };

interface RpcResponse {
  data: Json | null;
  error: { message: string } | null;
}

export function invalidWorkflowInput(): {
  ok: false;
  error: { code: "INVALID_INPUT" };
} {
  return { ok: false, error: { code: "INVALID_INPUT" } };
}

export async function executeAuthenticatedRpc<T>({
  execute,
  outputSchema,
}: {
  execute: (client: SupabaseClient<Database>) => PromiseLike<RpcResponse>;
  outputSchema: z.ZodType<T>;
}): Promise<WorkflowActionResult<T>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: { code: "NOT_AUTHENTICATED" } };

    const client = await createSupabaseServerClient();
    const { data, error } = await execute(client);
    if (error) {
      return { ok: false, error: { code: normalizeRpcError(error.message) } };
    }

    const parsed = outputSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false, error: { code: "INVALID_RPC_RESPONSE" } };
    }

    return { ok: true, data: parsed.data };
  } catch {
    return { ok: false, error: { code: "RPC_UNAVAILABLE" } };
  }
}
