============================================================
CREATE INTERNAL ALPHA DATASET
PROJECT: GIA PHẢ GIA TỘC
============================================================

Tạo bộ dữ liệu TEST riêng cho môi trường:

INTERNAL ALPHA

KHÔNG sử dụng dữ liệu khách hàng thật.

============================================================
FAMILY
============================================================

Tạo:

3 gia tộc test

Family Alpha
Family Beta
Family Gamma

Mỗi gia tộc có:

5 thế hệ
3 chi
nhiều nhánh

============================================================
MEMBERS
============================================================

Family Alpha:
86 thành viên

Family Beta:
300 thành viên

Family Gamma:
500 thành viên

Tạo quan hệ:

Cha
Mẹ
Con
Vợ
Chồng
Anh
Chị
Em

Đảm bảo genealogy graph hợp lệ.

============================================================
MEMORIAL
============================================================

Tạo:

20 ngày giỗ

Bao gồm:

- ngày âm thông thường
- tháng nhuận
- ngày cuối tháng
- nhiều ngày giỗ trong cùng tháng

============================================================
EVENTS
============================================================

Tạo:

Giỗ Tổ
Họp họ
Khánh thành từ đường
Tu sửa từ đường
Ngày hội gia tộc

============================================================
FINANCE
============================================================

Tạo:

3 quỹ / family

Income categories

Expense categories

Income assessments

Posted payments

Expenses

Approved expenses

Reversal transactions

Contributions

Sponsorships

============================================================
BILLING
============================================================

Tạo:

FREE
TRIAL
FAMILY
GIA_TOC
DONG_HO
PREMIUM

Test:

ACTIVE
EXPIRING
EXPIRED
PAST_DUE
READ_ONLY

============================================================
PAYMENT
============================================================

Tạo các test cases:

PAYMENT_SUCCESS
PAYMENT_PENDING
PAYMENT_FAILED
DUPLICATE_PAYMENT
UNDER_PAYMENT
OVER_PAYMENT
INVALID_REFERENCE
REFUND

============================================================
SECURITY
============================================================

Family Alpha user:

MUST NOT access:

Family Beta
Family Gamma

Test:

SELECT
INSERT
UPDATE
DELETE
RPC
STORAGE

============================================================
OUTPUT
============================================================

Tạo:

/supabase/seed_alpha.sql

và:

/docs/ALPHA_TEST_DATA.md

Không đưa dữ liệu giả vào production database.
============================================================