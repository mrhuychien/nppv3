import Link from "next/link";
import { Boxes, ClipboardList, FileText, Truck } from "lucide-react";

import type { CurrentUser } from "@/modules/identity/domain/current-user";

const nav = [
  { href: "/orders", label: "Đơn hàng", icon: ClipboardList },
  { href: "/inventory/stock-out", label: "Xuất kho", icon: Boxes },
  { href: "/deliveries", label: "Giao hàng", icon: Truck },
  { href: "/finance/cash-receipts", label: "Phiếu thu", icon: FileText },
] as const;

export function DashboardShell({
  user,
  children,
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden border-r border-line bg-ink px-4 py-6 text-white lg:block">
        <div className="px-3 text-lg font-semibold tracking-tight">npp.sale / v3</div>
        <nav className="mt-9 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white" href={href} key={href}>
              <Icon className="size-4" /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-surface/90 px-5 backdrop-blur sm:px-8">
          <div>
            <p className="text-sm font-semibold">{user.fullName}</p>
            <p className="text-xs uppercase tracking-[0.12em] text-muted">{user.role}</p>
          </div>
          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-brand">v3 foundation</span>
        </header>
        <main className="px-5 py-7 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
