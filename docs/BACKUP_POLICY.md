# CHÍNH SÁCH SAO LƯU & BẢO VỆ DỮ LIỆU (BACKUP POLICY)
# DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE — HERITAGE LEDGER)

---

## 🎯 1. Chỉ Tiêu Phục Hồi Thảm Họa (RPO & RTO)

- **RPO (Recovery Point Objective) $\le$ 1 Giờ**: Dữ liệu phả hệ và bút toán tài chính không bị mất quá 1 giờ trong trường hợp xấu nhất nhờ tính năng PITR (Point-in-Time Recovery).
- **RTO (Recovery Time Objective) $\le$ 2 Giờ**: Toàn bộ hệ thống sẵn sàng phục vụ trở lại trong vòng tối đa 2 giờ kể từ khi phát hiện sự cố.

---

## 📦 2. Phạm Vi Sao Lưu Toàn Diện

1. **Phả hệ cốt lõi**: `families`, `generations`, `branches`, `members`, `member_relationships`.
2. **Lịch vạn niên & Tế lễ**: `memorial_dates`, `events`, `event_reminder_configs`, `notifications`.
3. **Tài chính & Sổ cái**: `funds`, `financial_transactions`, `income_categories`, `income_assessments`, `expense_records`, `contributions`, `sponsorships`.
4. **Thương mại SaaS**: `plans`, `subscriptions`, `usage_counters`, `invoices`, `payments`, `refunds`.
5. **Kiểm toán & Hồ sơ**: `audit_logs`, `profiles`, `family_memberships`.
