import { CheckCircle2, GitBranch, LockKeyhole, PackageCheck } from "lucide-react";

const contracts = [
  { icon: GitBranch, title: "2 luồng giao hàng", body: "Tự giao và giao tài xế không trộn trạng thái hay chứng từ." },
  { icon: PackageCheck, title: "UOM + FIFO/FEFO", body: "Base UOM là nguồn chân lý; giá vốn và lô được khóa trong giao dịch." },
  { icon: LockKeyhole, title: "Atomic + idempotent", body: "Không để phiếu kho, công nợ hoặc phiếu thu ở trạng thái nửa chừng." },
  { icon: CheckCircle2, title: "Contract tests", body: "Quy tắc v2 được đóng băng bằng unit test trước khi port UI." },
] as const;

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <header>
        <p className="text-sm font-semibold text-brand">Module đơn hàng</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Nền tương thích đã sẵn sàng</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Trang danh sách và form đơn hàng sẽ dùng Data Access Layer mới nhưng gọi các RPC tương thích đã kiểm thử. Mã ở tầng UI không tự tính tiền, tự chuyển trạng thái hoặc tự trừ kho.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {contracts.map(({ icon: Icon, title, body }) => (
          <article className="rounded-2xl border border-line bg-surface p-5" key={title}>
            <Icon className="size-5 text-brand" />
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
