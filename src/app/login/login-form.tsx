"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";

import { signIn, type LoginState } from "@/app/login/actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <form action={action} className="space-y-5">
      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Email / SĐT / Tài khoản
        </span>
        <input
          autoComplete="username"
          className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-sm outline-none transition focus:border-brand focus:ring-3 focus:ring-brand/15"
          name="identifier"
          placeholder="Nhập tài khoản"
          required
        />
      </label>
      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Mật khẩu
        </span>
        <input
          autoComplete="current-password"
          className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-sm outline-none transition focus:border-brand focus:ring-3 focus:ring-brand/15"
          name="password"
          placeholder="Nhập mật khẩu"
          required
          type="password"
        />
      </label>
      {state.error ? (
        <p
          className="rounded-xl border border-danger/20 bg-danger/8 px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <button
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition hover:bg-brand-strong disabled:cursor-wait disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        <LogIn className="size-4" />
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>
    </form>
  );
}
