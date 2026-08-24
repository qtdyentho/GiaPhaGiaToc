# MA TRẬN BIẾN MÔI TRƯỜNG & PHÂN TÁCH BẢO MẬT (ENVIRONMENT MATRIX)
# DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE — HERITAGE LEDGER)

---

## 🔒 1. Phân Loại Biến Môi Trường (Secret Classification)

| Biến Môi Trường | Phân Loại | Phạm Vi Khả Dụng | Mô Tả & Mức Độ Nhạy Cảm |
|:---|:---:|:---:|:---|
| `VITE_SUPABASE_URL` | **PUBLIC** | Client & Server | URL định danh dự án Supabase (An toàn công khai) |
| `VITE_SUPABASE_ANON_KEY`| **PUBLIC** | Client & Server | Khóa ẩn danh được bảo vệ qua Row Level Security (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY`| **SECRET** | **SERVER ONLY** | Khóa Super Admin bypass RLS (**Tuyệt đối không đưa vào Client**) |
| `BANK_WEBHOOK_SECRET` | **SECRET** | **SERVER ONLY** | Khóa bí mật ký số HMAC-SHA256 của Webhook Ngân Hàng |
| `NODE_ENV` | **SENSITIVE** | Serverless / Build | Môi trường (`production`, `staging`, `development`) |
| `BETA_MODE` | **SENSITIVE** | Server & Client | Công tắc kích hoạt chế độ thử nghiệm kín (Invite-only) |

---

## 🛡️ 2. Quy Tắc Bảo Mật Bất Biến (Secret Hygiene Invariants)

1. **Không commit `.env` hoặc `.env.production` vào Git**: Chỉ commit file mẫu `.env.example`.
2. **Client Bundle Scan**: Quá trình `npm run build` được kiểm tra nghiêm ngặt để đảm bảo không có bất kỳ chuỗi `service_role_key` hay `webhook_secret` nào bị đóng gói vào file JS phân phối cho người dùng.
3. **Phân Tách Môi Trường**: Dự án Local, Staging và Production sử dụng các database Supabase và Webhook Secret hoàn toàn độc lập, không dùng chung dữ liệu.
