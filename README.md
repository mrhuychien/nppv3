# npp.sale v3

Bản viết mới theo hướng compatibility-first cho hệ thống mini-ERP nhà phân phối
FMCG. v3 giữ hợp đồng nghiệp vụ đã xác minh từ `mrhuychien/nppv2`, đồng thời
thay lớp ứng dụng bằng kiến trúc module, Data Access Layer và giao dịch PostgreSQL
atomic.

> Trạng thái: nền tảng kỹ thuật và contract nghiệp vụ lõi đã được dựng; chưa phải
> bản thay thế production cho toàn bộ 100 route của v2.

## Stack

- Next.js 16.2.10, React 19.2.7, App Router, Server Components mặc định.
- Tailwind CSS 4.3, TypeScript 5.9 strict.
- Supabase SSR 0.12 + PostgreSQL, Auth, RLS, Realtime.
- Zod 4 cho boundary validation; Decimal.js cho số lượng; `bigint` cho VND.
- Vitest cho domain/contract tests; Playwright cho E2E desktop + mobile.

## Chạy local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Kiểm tra toàn bộ nền hiện tại:

```bash
npm run check
```

## Những phần đã có

- Supabase browser/server/admin clients khởi tạo lazy.
- Next.js `proxy.ts` + Supabase `getClaims()` để xác minh JWT.
- Đăng nhập email / username / SĐT qua Server Action tương thích RPC v2.
- Domain contracts: trạng thái đơn, edit-while-picking, UOM, permission precedence,
  hai đường ray fulfillment và schema payload của RPC v2.
- Migration `015_post_self_delivery_atomic.sql` thay chuỗi request phía trình
  duyệt của bước tự giao bằng một transaction có row lock và rollback.
- Unit/contract tests cho các bất biến có rủi ro cao.

## Tài liệu

- `docs/ARCHITECTURE.md`
- `docs/V2-COMPATIBILITY-CONTRACT.md`
- `docs/MIGRATION-ROADMAP.md`
- `docs/TECHNOLOGY-DECISIONS.md`
