# KIẾN TRÚC FINANCIAL CORE & SỔ CÁI BẤT BIẾN
# Dự Án: Gia Phả Gia Tộc (Gia Pha Gia Toc Enterprise)

Tài liệu này đặc tả toàn diện kiến trúc phân hệ **Financial Core**, quy trình thu chi, sổ cái bất biến, đảo bút toán và tích hợp VietQR chuẩn NAPAS 247.

---

## 🏛️ 1. Nguyên Tắc Cốt Lõi (Financial Invariants)

1. **Sổ Cái Bất Biến (Immutable Ledger)**:
   - Mọi bản ghi giao dịch ở trạng thái `POSTED` **TUYỆT ĐỐI KHÔNG ĐƯỢC PHÉP DELETE** hoặc sửa đổi `amount`, `fund_id`, `transaction_date`.
   - Nếu có sai sót, bắt buộc thực hiện **Đảo Bút Toán (`REVERSAL`)** theo chuẩn `BR-REV-001`.
2. **Tách Biệt Nghĩa Vụ Thu & Thực Thu (BR-FUND-001)**:
   - `ASSESSMENT ≠ PAYMENT`.
   - Tạo định mức thu (Assessment) chỉ sinh ra nghĩa vụ thu, **KHÔNG** làm tăng số dư quỹ.
   - Chỉ khi thực tế thu tiền (`PAYMENT` $\rightarrow$ `POSTED`) qua Cash/Bank/VietQR thì số dư quỹ mới được cộng dồn.
3. **Quy Trình Duyệt Chi Chống Âm Quỹ (BR-EXP-001)**:
   - Quy trình: `DRAFT` $\rightarrow$ `PENDING_APPROVAL` $\rightarrow$ `APPROVED` $\rightarrow$ `POSTED`.
   - Kiểm tra số dư khả dụng (`current_balance >= amount`) trước khi cho phép lập đề xuất và phê duyệt.
   - Chỉ người có thẩm quyền (`OWNER`, `TRUONG_HO`, `KIEM_SOAT`) mới được phê duyệt chi.

---

## 🔄 2. Luồng Xử Lý Thanh Toán VietQR (NAPAS 247)

```
CREATE PAYMENT INTENT / GHI THU
        ↓
GENERATE VIETQR (NAPAS 247 Payload + Memo [MA_GD])
        ↓
CUSTOMER TRANSFER VIA BANKING APP
        ↓
BANK WEBHOOK / ĐỐI SOÁT THỦ QUỸ
        ↓
VERIFY SIGNATURE (HMAC-SHA256)
        ↓
IDEMPOTENCY CHECK (Chống trùng lặp giao dịch)
        ↓
ATOMIC RPC EXECUTION (record_income_payment)
        ↓
LEDGER POSTED & FUND BALANCE UPDATED
```

---

## 🏆 3. Phân Hạng Bảng Vàng Công Đức (Honor Roll)

Dựa trên tổng giá trị đóng góp & tài trợ lũy kế của từng nhà hảo tâm:
- 💎 **Kim Cương (Diamond)**: $\ge 50.000.000$ VNĐ
- 🥇 **Vàng (Gold)**: $\ge 20.000.000$ VNĐ
- 🥈 **Bạc (Silver)**: $\ge 5.000.000$ VNĐ
- 🥉 **Đồng (Bronze)**: $\ge 1.000.000$ VNĐ

---

## 🔒 4. Ma Trận Phân Quyền Tài Chính (RBAC)

| Role | Xem Sổ Quỹ | Lập Định Mức Thu | Ghi Thu Quỹ | Tạo Đề Xuất Chi | Phê Duyệt Chi | Đảo Bút Toán |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **OWNER / TRƯỞNG TỘC** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **QUẢN TRỊ VIÊN** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **THỦ QUỸ** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **KIỂM SOÁT** | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **THÀNH VIÊN** | ✅ (Public) | ❌ | ❌ | ❌ | ❌ | ❌ |
