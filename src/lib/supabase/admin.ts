import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/data/database.types";
import { getSupabaseServerEnv } from "@/lib/env";

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdminClient() {
  if (adminClient) return adminClient;

  const env = getSupabaseServerEnv();
  adminClient = createClient<Database>(env.url, env.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClient;
}
