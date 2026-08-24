# DANH MỤC KIỂM TRA PHÁT HÀNH PRODUCTION (RELEASE CHECKLIST)
# DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE — HERITAGE LEDGER)

---

## ✅ 1. Danh Mục Kiểm Tra Bắt Buộc Trước Khi Release

- [ ] **Git Working Directory**: Sạch sẽ, không có thay đổi chưa commit (`git status` clean).
- [ ] **Automated Tests**: Toàn bộ test suites chạy **PASS 100% (123/123 tests)**.
- [ ] **Production Build**: Lệnh `npm run build` (`tsc && vite build`) hoàn thành với **0 lỗi**.
- [ ] **Typecheck & Linter**: Không có lỗi cú pháp hoặc vi phạm kiểu TypeScript.
- [ ] **RLS & Security Review**: Toàn bộ bảng CSDL được bật RLS phân lập theo `family_id`.
- [ ] **Secret Scan**: Không rò rỉ bất kỳ `service_role_key` hay `webhook_secret` trong client bundle.
- [ ] **Payment & Webhook Verification**: Chữ ký HMAC-SHA256 và Atomic RPC hoạt động chính xác.
- [ ] **Backup & Restore Drill**: Diễn tập khôi phục và đối chiếu Checksum dữ liệu hoàn tất.
- [ ] **Rollback Strategy**: Đã chuẩn bị sẵn Commit SHA trước đó và kế hoạch rollback an toàn.
