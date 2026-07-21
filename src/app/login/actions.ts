"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1),
});

export interface LoginState {
  error: string | null;
}

export async function signIn(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { error: "Vui lòng nhập đủ tài khoản và mật khẩu." };

  const supabase = await createSupabaseServerClient();
  let email = parsed.data.identifier;

  if (!email.includes("@")) {
    const { data, error } = await supabase.rpc("lookup_email_by_identifier", {
      p_id: email,
    });
    if (error || !data) return { error: "Sai tài khoản hoặc mật khẩu." };
    email = data;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });
  if (error) return { error: "Sai tài khoản hoặc mật khẩu." };

  redirect("/orders");
}
