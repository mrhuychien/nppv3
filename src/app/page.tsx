import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  DatabaseZap,
  GitBranch,
  ShieldCheck,
} from "lucide-react";

const pillars = [
  {
    icon: GitBranch,
    title: "Workflow tương thích",
    body: "Giữ hai đường ray tự giao và giao tài xế, cùng toàn bộ trạng thái và route nghiệp vụ đã dùng ở v2.",
  },
  {
    icon: DatabaseZap,
    title: "Giao dịch atomic",
    body: "Các thao tác nhiều bước được đẩy xuống PostgreSQL RPC, khóa dòng và có khóa idempotency hoặc natural key.",
  },
  {
    icon: ShieldCheck,
    title: "Bảo mật theo DAL",
    body: "JWT được xác minh bằng getClaims; RLS tiếp tục là hàng rào dữ liệu, Server Action tự kiểm tra quyền và input.",
  },
  {
    icon: Boxes,
    title: "Số lượng chính xác",
    body: "Tồn kho chỉ tính theo base UOM; Decimal dùng cho số lượng và bigint dùng cho tiền VND ở tầng domain.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-dvh overflow-hidden bg-canvas">
      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8 lg:px-12 lg:pb-28">
        <div className="absolute -right-44 -top-52 size-[34rem] rounded-full bg-blue-200/60 blur-3xl" />
        <nav className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand font-bold text-white shadow-lg shadow-brand/20">N</span>
            <div>
              <p className="font-semibold tracking-tight">npp.sale</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">version 3</p>
            </div>
          </div>
          <Link className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold shadow-sm transition hover:border-brand/30" href="/login">
            Đăng nhập
          </Link>
        </nav>

        <div className="relative mt-24 max-w-4xl lg:mt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Compatibility-first rewrite</p>
          <h1 className="mt-5 text-balance text-5xl font-semibold leading-[1.03] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Viết mới nền tảng. Giữ nguyên nghiệp vụ đã chạy.
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-base leading-7 text-muted sm:text-lg">
            Nền tảng v3 được tách theo module nghiệp vụ, dùng Next.js 16, React 19.2, Tailwind CSS 4 và Supabase SSR; ưu tiên tính đúng của đơn hàng, kho, giao nhận và công nợ trước mọi tối ưu giao diện.
          </p>
          <Link className="mt-9 inline-flex h-12 items-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5" href="/login">
            Mở hệ thống <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="relative mt-20 grid gap-4 md:grid-cols-2 lg:mt-28 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, body }) => (
            <article className="rounded-3xl border border-line bg-surface/90 p-6 shadow-[0_16px_50px_-36px_rgba(15,23,42,.35)] backdrop-blur" key={title}>
              <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-brand"><Icon className="size-5" /></span>
              <h2 className="mt-5 font-semibold tracking-tight">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
