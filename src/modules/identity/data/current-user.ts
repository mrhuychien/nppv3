import "server-only";

import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CurrentUser } from "@/modules/identity/domain/current-user";

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createSupabaseServerClient();
  const { data: claimData, error: claimError } = await supabase.auth.getClaims();
  const subject = claimData?.claims?.sub;

  if (claimError || typeof subject !== "string") return null;

  const { data: profile, error } = await supabase
    .from("users")
    .select(
      "id, org_id, full_name, role, phone, is_active, allow_price_edit, price_edit_max_increase_pct",
    )
    .eq("id", subject)
    .maybeSingle();

  if (error) throw new Error(`PROFILE_QUERY_FAILED: ${error.message}`);
  if (!profile || !profile.is_active) return null;

  return {
    id: profile.id,
    organizationId: profile.org_id,
    fullName: profile.full_name,
    role: profile.role,
    phone: profile.phone,
    active: profile.is_active,
    canEditPrice: profile.allow_price_edit,
    maxPriceIncreasePercent: profile.price_edit_max_increase_pct,
  };
});
