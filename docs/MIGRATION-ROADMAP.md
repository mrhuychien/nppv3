# Lộ trình chuyển nppv2 → nppv3

## Nguyên tắc phát hành

Không big-bang. v3 dùng cùng database contract trong giai đoạn đầu, port theo
vertical slice và bật theo organization/user. Mỗi slice chỉ được bật sau khi
contract test, PostgreSQL integration test và UAT vai trò tương ứng đạt.

## Các mốc

| Mốc | Phạm vi | Điều kiện hoàn thành |
|---|---|---|
| M0 — Contract | inventory repo, đóng băng workflow/schema/route, domain tests | Hoàn thành trong nền hiện tại |
| M1 — Platform | auth, tenant DAL, permission, shell, observability, CI | Đang làm: JWT `getClaims`, shell và CI đã có; còn cross-org integration test/observability |
| M2 — Order-to-cash | customer/product search, tạo/duyệt đơn, stock-out, self-delivery, handover, collect/settle | Đang làm: contract + mutation gates + atomic self-delivery đã có; còn UI dữ liệu thật, 2 rail E2E và concurrency/rollback test |
| M3 — Inventory/purchasing | stock-in, batch, stocktake approval, PO/AP/supplier return | tồn/lô/AP khớp Golden Master |
| M4 — Sales force/HR | PJP, visit, commission, attendance, payroll v1 formula | payroll snapshot khớp dữ liệu chuẩn |
| M5 — Reporting/settings | reports, Excel, MISA, user/QR/permission/config | số liệu và export khớp v2 |
| M6 — Cutover | pilot, canary, rollback rehearsal | UAT 6 vai trò ký nghiệm thu |

## Cổng chất lượng cho mỗi slice

1. Không thay đổi RPC/schema cũ nếu chưa có compatibility migration.
2. Không có mutation nhiều bảng ở client.
3. Không dùng `getSession()` để authorize server request.
4. Test thiếu tồn phải rollback entry/order/receivable/delivery.
5. Retry cùng natural/idempotency key không nhân đôi tồn, công nợ hoặc tiền.
6. Query và RPC từ org A không đọc/ghi được org B.
7. Mobile 375 px và desktop đều hoàn thành được workflow.

## Cutover dữ liệu

Vì giai đoạn đầu dùng cùng contract database, phần lớn cutover là chuyển traffic,
không copy dữ liệu. Khi baseline v3 được squash, phải tạo migration rehearsal trên
bản sao production và đối chiếu count/checksum theo bảng nghiệp vụ trước khi chạy
thật.
