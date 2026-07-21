# Quyết định công nghệ v3

| Hạng mục | Chọn | Lý do |
|---|---|---|
| Framework | Next.js 16.2.10 | Bản stable hiện hành; dùng `proxy.ts`, App Router, Turbopack; không dùng 16.3 preview |
| UI runtime | React 19.2.7 | Bản patch stable hiện hành |
| CSS | Tailwind CSS 4.3.3 | CSS-first, engine mới; bỏ config Tailwind 3 tích lũy |
| TypeScript | 5.9.x | Tương thích ổn định với hệ sinh thái; chưa nhảy TS 7 trong rewrite nghiệp vụ |
| Backend | Supabase/PostgreSQL | Giữ RLS, Auth và schema đã chứng minh; tránh migration big-bang sang ORM/backend mới |
| Data access | DAL server-only + DTO | Tập trung auth/org/permission, giảm query copy-paste trong page |
| Mutation | Server Action → RPC | Input/auth ở application boundary; transaction và row lock ở PostgreSQL |
| Validation | Zod 4 | Contract runtime cho FormData, query và RPC JSON payload |
| Numeric | Decimal.js + bigint | Tránh sai số float cho quantity/conversion và tiền VND |
| Test | Vitest + Playwright | Domain test nhanh, E2E cho async Server Components và mobile workflow |

## Không chọn trong giai đoạn đầu

- Microservices/event sourcing: tăng độ phức tạp và làm khó transaction xuyên kho,
  công nợ, phiếu thu.
- ORM thay hoàn toàn PostgREST/RPC: không tạo giá trị tương xứng trong lúc phải
  giữ 72 bảng và RLS hiện hữu.
- Next.js 16.3 preview hoặc React canary: không phù hợp với cutover ERP.
- Cache dùng chung cho tồn kho/công nợ: nguy cơ dữ liệu cũ cao hơn lợi ích.
