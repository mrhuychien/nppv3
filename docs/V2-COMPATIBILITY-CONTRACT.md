# Hợp đồng tương thích nppv2 → nppv3

Nguồn đã kiểm tra: 433 file trên nhánh `main` của `mrhuychien/nppv2`, các tài
liệu `WORKFLOW-PARITY`, `PARITY-STATUS`, `V1-SCHEMA-CATALOG`, migrations 001–014
và source các màn nghiệp vụ lõi.

## Bất biến bắt buộc

1. Tenant: mọi dữ liệu nghiệp vụ phải scope `org_id`; owner chỉ full quyền trong
   org của mình.
2. Permission: user override thắng role override; owner luôn full; SQL resolver là
   hàng rào cuối.
3. UOM: tồn kho chỉ tính bằng `qty_in_base_uom`; conversion factor là snapshot.
4. Mã chứng từ: dùng `next_doc_code()` theo org/ngày; không sinh random ở client.
5. Giao thất bại: không cho `delivering → cancelled` trực tiếp.
6. Hàng hoàn: một nguồn vật lý chỉ được restock đúng một lần.
7. Bàn giao, xuất kho, thu tiền, quyết toán và kiểm kê phải atomic/idempotent.
8. Báo cáo không được kéo raw rows có cap rồi coi tổng cục bộ là tổng thật.

## Trạng thái đơn

```text
draft → confirmed → picking → delivering → delivered
  └────────────── cancellation chỉ trước delivering ──→ cancelled
```

`current_workflow_stage` tiếp tục giữ các giá trị: `draft`, `pending_approval`,
`approved`, `picking`, `delivering`, `collecting`, `handover`, `closed`, `failed`,
`delivery_failed`.

## Nhánh tự giao

| Bước | Hành vi phải giữ |
|---|---|
| Bắt đầu lấy hàng | Chỉ mở `/inventory/stock-out?orderIds=...`; chưa đổi status |
| Xuất kho & gộp | Tạo entry draft, đủ line bán/đổi/dự phòng, FEFO gợi ý, merged orders; đơn → picking; chưa trừ tồn |
| Tự giao | Trừ batch FEFO + FIFO COGS một lần; entry posted; đơn delivering; tạo receivable; delivery in_transit |
| Bàn giao | Xử lý thất bại/partial, khách trả, swap thừa; restock một lần |
| Thu tiền | Tạo cash receipt + lines + payment; update receivable; đơn delivered; delivery settled |

v3 bổ sung `post_self_delivery(uuid)` để toàn bộ bước “Tự giao” chạy trong một
transaction. Thứ tự và kết quả nghiệp vụ không đổi.

## Nhánh giao tài xế

1. Chuyến mới chọn đơn `confirmed`, tạo delivery pending + lines; không tạo stock
   entry ở thao tác này.
2. Pending → in_transit. Khi in_transit luôn có hành động nhận bàn giao lại.
3. Bàn giao xác nhận bằng `confirm_driver_handover`.
4. Quyết toán bằng `settle_driver_delivery`; tạo phiếu thu TT200 và liên kết
   payment/receivable trước khi stamp settled.

Hai nhánh không được dùng chung shortcut hoặc tự động nhảy qua bàn giao.

## RPC giữ tương thích

| RPC v2 | Vai trò trong v3 |
|---|---|
| `create_sales_order_v1_compatible` | tạo đơn, tính lại tiền, approval, return kèm |
| `create_stock_out_bundle` | tạo phiếu xuất gộp + swap + orders picking |
| `confirm_driver_handover` | bàn giao + hoàn kho + điều chỉnh phải thu |
| `collect_self_delivery` | thu tiền nhánh tự giao |
| `settle_driver_delivery` | quyết toán chuyến tài xế |
| `submit_stocktake` / `approve_stocktake` | kiểm kê hai bước |
| `report_*` | tổng hợp báo cáo không cap |

## Route tương thích

Nhóm route cũ `/warehouse/*` và `/operations/*` phải tiếp tục redirect sang
`/inventory/*`. Các alias kiểm kê và HR cũ phải bảo toàn query string trong giai
đoạn chuyển tiếp. Không xóa route cũ trước khi log 404 xác nhận không còn client
đang dùng.

## Phần cần Golden Master/UAT

Chưa thể xác minh parity số liệu thật chỉ bằng source code. Trước cutover phải
chạy bộ dữ liệu ẩn danh lấy từ v2/v1, đối chiếu tồn theo lô, công nợ, phiếu thu,
lương và báo cáo; sau đó UAT đủ owner/manager/accountant/sales/warehouse/driver.
