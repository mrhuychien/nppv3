import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/data/database.types";
import { getSupabasePublicEnv } from "@/lib/env";
import { fetchWithTimeout } from "@/lib/http/fetch-with-timeout";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const env = getSupabasePublicEnv();
  browserClient = createBrowserClient<Database>(env.url, env.publishableKey, {
    global: { fetch: fetchWithTimeout(10_000) },
  });
  return browserClient;
}
