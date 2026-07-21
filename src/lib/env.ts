import { z } from "zod";

const publicEnvSchema = z.object({
  url: z.string().url(),
  publishableKey: z.string().min(20),
});

const serverEnvSchema = publicEnvSchema.extend({
  serviceRoleKey: z.string().min(20),
});

export function hasSupabasePublicEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}

export function getSupabasePublicEnv() {
  return publicEnvSchema.parse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

export function getSupabaseServerEnv() {
  const publicEnv = getSupabasePublicEnv();
  return serverEnvSchema.parse({
    ...publicEnv,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}
