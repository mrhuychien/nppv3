import { Boxes, QrCode, ShieldCheck, Truck } from "lucide-react";

import { LoginForm } from "@/app/login/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh bg-canvas lg:grid-cols-[1.08fr_1fr]">
      <section className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(37,99,235,.42),transparent_38%),radial-gradient(circle_at_80%_90%,rgba(14,165,233,.24),transparent_34%)]" />
        <div className="relative text-xl font-bold tracking-tight">npp.sale / v3</div>
        <div className="relative max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
            Mini ERP cho nhà phân phối FMCG
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight">
            Nhanh hơn ở giao diện. Chặt hơn ở giao dịch.
          </h1>
          <div className="mt-8 grid gap-3 text-sm text-slate-300">
            <p className="flex items-center gap-3"><Boxes className="size-5 text-sky-300" /> Kho theo lô, HSD và ĐVT gốc</p>
            <p className="flex items-center gap-3"><Truck className="size-5 text-sky-300" /> Tự giao và giao tài xế tách biệt</p>
            <p className="flex items-center gap-3"><ShieldCheck className="size-5 text-sky-300" /> RLS, JWT đã xác minh và giao dịch atomic</p>
          </div>
        </div>
        <p className="relative text-xs text-slate-500">npp.sale · compatibility-first rewrite</p>
      </section>

      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-7 shadow-[0_24px_80px_-32px_rgba(15,23,42,.28)] sm:p-9">
          <p className="text-sm font-semibold text-brand">npp.sale</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Đăng nhập</h2>
          <p className="mt-2 text-sm text-muted">Dùng email, số điện thoại hoặc tên tài khoản.</p>
          <div className="mt-7"><LoginForm /></div>
          <div className="mt-6 flex gap-3 rounded-2xl bg-canvas p-4 text-xs leading-5 text-muted">
            <QrCode className="mt-0.5 size-5 shrink-0 text-brand" />
            Nhân viên có thể quét mã QR do quản lý cấp để đăng nhập mà không cần nhập mật khẩu.
          </div>
        </div>
      </section>
    </main>
  );
}
