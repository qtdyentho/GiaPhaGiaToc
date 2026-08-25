-- ============================================================
-- DATABASE SCHEMA: GIA PHẢ GIA TỘC (POSTGRESQL / SUPABASE)
-- Nền tảng Quản Lý Gia Phả, Lịch Gia Tộc & Quỹ Tài Chính Gia Tộc
-- ============================================================

-- ------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- 2. CUSTOM ENUMS
-- ------------------------------------------------------------

-- Vai trò thành viên trong gia tộc (RBAC)
DO $$ BEGIN
    CREATE TYPE membership_role AS ENUM (
        'OWNER',            -- Toàn quyền gia tộc (Chủ sở hữu/Trưởng họ)
        'ADMIN',            -- Quản trị viên gia tộc
        'GENEALOGY_ADMIN',  -- Quản trị viên ban gia phả
        'TREASURER',        -- Thủ quỹ / Kế toán gia tộc
        'APPROVER',         -- Người duyệt chi / Ban kiểm soát
        'EVENT_MANAGER',    -- Ban khánh tiết / Quản lý sự kiện
        'MEMBER',           -- Thành viên gia tộc (Được xem & nộp quỹ)
        'VIEWER'            -- Khách / Thành viên chỉ xem
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE membership_status AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'LEFT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE member_life_status AS ENUM ('ALIVE', 'DECEASED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE spouse_rank_type AS ENUM (
        'CHINH_THAT',   -- Bà Cả / Nguyên Phối
        'KE_THAT',      -- Bà Hai / Kế Thất
        'THAC_THAT',    -- Bà Ba, Bà Tư / Thứ Thiếp
        'KHONG_RO'      -- Chưa rõ thứ tự
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE child_lineage_type AS ENUM (
        'BIOLOGICAL',           -- Con ruột
        'MATERNAL_STEPCHILD',   -- Con riêng của vợ
        'PATERNAL_STEPCHILD',   -- Con riêng của chồng
        'ADOPTED'               -- Con nuôi
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE recurrence_type AS ENUM ('YEARLY_LUNAR', 'YEARLY_SOLAR', 'NONE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_type AS ENUM (
        'CLAN_ANCESTRAL_DAY',       -- Giỗ tổ họ
        'MEMORIAL',                 -- Ngày giỗ cá nhân
        'BRANCH_MEMORIAL',          -- Giỗ chi / phái
        'FAMILY_MEETING',           -- Họp họ / Hội đồng gia tộc
        'ANCESTRAL_HALL_OPENING',   -- Khánh thành nhà thờ họ
        'ANCESTRAL_HALL_RENOVATION',-- Tu sửa từ đường
        'CLAN_ANNIVERSARY',         -- Kỷ niệm ngày thành lập dòng họ
        'BIRTHDAY',                 -- Sinh nhật
        'LONGEVITY',                -- Lễ mừng thọ các cụ
        'WEDDING',                  -- Lễ cưới hỏi con cháu
        'FUNERAL',                  -- Lễ tang
        'OTHER'                     -- Sự kiện khác
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_scope AS ENUM ('FAMILY', 'BRANCH', 'SUB_BRANCH', 'HOUSEHOLD', 'INDIVIDUAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE fund_status AS ENUM ('ACTIVE', 'FROZEN', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER', 'ADJUSTMENT', 'REVERSAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('DRAFT', 'POSTED', 'REVERSED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE assessment_status AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'WAIVED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE expense_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'POSTED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('CASH', 'BANK_TRANSFER', 'VIETQR', 'VNPAY', 'MOMO', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sponsor_type AS ENUM ('MEMBER', 'RELATIVE', 'BUSINESS', 'ORGANIZATION', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE_ATTEMPT', 'APPROVE', 'REJECT', 'POST', 'REVERSE', 'LOGIN', 'LOGOUT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('MEMORIAL_REMINDER', 'EVENT_REMINDER', 'PAYMENT_DUE', 'EXPENSE_APPROVAL_REQUEST', 'TRANSACTION_POSTED', 'MEMBERSHIP_INVITE', 'SYSTEM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED', 'SUSPENDED', 'READ_ONLY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE plan_tier AS ENUM ('FREE', 'FAMILY', 'GIA_TOC', 'DONG_HO', 'PREMIUM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE refund_status AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'PROCESSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_event_type AS ENUM (
        'CREATED', 'TRIAL_STARTED', 'TRIAL_EXTENDED', 'TRIAL_ENDED', 
        'UPGRADED', 'DOWNGRADED', 'RENEWED', 'CANCELLED', 
        'EXPIRED', 'PAST_DUE_ENTERED', 'READ_ONLY_ENTERED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_event_type AS ENUM (
        'WEBHOOK_RECEIVED', 'QR_GENERATED', 'QR_SCANNED', 
        'BANK_TRANSFERRED', 'AUTO_MATCHED', 'MANUAL_MATCHED', 'FAILED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE billing_audit_action AS ENUM (
        'PLAN_CREATED', 'PLAN_UPDATED', 'PLAN_VERSIONED', 'PRICE_CHANGED', 
        'TRIAL_EXTENDED', 'SUBSCRIPTION_STATUS_CHANGED', 'INVOICE_GENERATED', 
        'INVOICE_VOIDED', 'PAYMENT_RECEIVED', 'REFUND_REQUESTED', 
        'REFUND_APPROVED', 'REFUND_PROCESSED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------
-- 3. CORE TABLES DEFINITIONS
-- ------------------------------------------------------------

-- BẢNG 1: Hồ sơ người dùng toàn cục (Liên kết với Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    is_superadmin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 2: Danh sách các gia tộc (Multi-tenant Root)
CREATE TABLE IF NOT EXISTS families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                         -- Tên gia tộc (VD: Gia Tộc Nguyễn Văn)
    surname TEXT NOT NULL,                      -- Họ chính (VD: Nguyễn)
    description TEXT,
    origin TEXT,                                -- Nguồn gốc, thủy tổ
    ancestral_home TEXT,                        -- Quê quán, nguyên quán
    ancestral_hall TEXT,                        -- Địa chỉ Nhà thờ tổ / Từ đường
    logo_url TEXT,
    cover_url TEXT,
    founder_member_id UUID,                     -- Tham chiếu thủy tổ (được set sau khi tạo member)
    founded_date DATE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 3: Tư cách thành viên gia tộc & Phân quyền RBAC
CREATE TABLE IF NOT EXISTS family_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role membership_role DEFAULT 'MEMBER' NOT NULL,
    status membership_status DEFAULT 'ACTIVE' NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_family_user UNIQUE (family_id, user_id)
);

-- BẢNG 4: Mã mời tham gia gia tộc (Invitation Tokens)
CREATE TABLE IF NOT EXISTS invitation_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    role membership_role DEFAULT 'MEMBER' NOT NULL,
    email TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    used_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 5: Quản lý các thế hệ (Đời)
CREATE TABLE IF NOT EXISTS generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    generation_number INTEGER NOT NULL CHECK (generation_number > 0),
    name TEXT NOT NULL,                         -- VD: Đời thứ nhất (Thủy tổ), Đời thứ hai...
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_family_generation UNIQUE (family_id, generation_number)
);

-- BẢNG 6: Quản lý Chi, Phái, Nhánh họ
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                         -- VD: Chi Trưởng, Chi 2, Nhánh Giáp...
    code TEXT NOT NULL,
    parent_branch_id UUID REFERENCES branches(id) ON DELETE RESTRICT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_family_branch_code UNIQUE (family_id, code)
);

-- BẢNG 7: Danh bạ thành viên nhân khẩu gia tộc
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    gender gender_type DEFAULT 'MALE' NOT NULL,
    date_of_birth DATE,
    place_of_birth TEXT,
    occupation TEXT,
    phone TEXT,
    email TEXT,
    avatar_url TEXT,
    generation_id UUID REFERENCES generations(id) ON DELETE RESTRICT,
    branch_id UUID REFERENCES branches(id) ON DELETE RESTRICT,
    status member_life_status DEFAULT 'ALIVE' NOT NULL,
    is_deceased BOOLEAN DEFAULT FALSE NOT NULL,
    date_of_death_solar DATE,
    date_of_death_lunar_day INTEGER CHECK (date_of_death_lunar_day BETWEEN 1 AND 30),
    date_of_death_lunar_month INTEGER CHECK (date_of_death_lunar_month BETWEEN 1 AND 12),
    date_of_death_lunar_year INTEGER,
    date_of_death_is_leap_month BOOLEAN DEFAULT FALSE,
    burial_place TEXT,                          -- Nơi an táng / Mộ phần
    biography TEXT,                             -- Tiểu sử, công trạng
    notes TEXT,
    linked_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Liên kết với tài khoản hệ thống (nếu có)
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 8: Quan hệ phả hệ gia đình (Cha-con, Mẹ-con, Vợ-chồng)
CREATE TABLE IF NOT EXISTS member_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    related_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    relationship_type relationship_type NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT chk_no_self_relationship CHECK (member_id != related_member_id),
    CONSTRAINT uq_member_relation UNIQUE (family_id, member_id, related_member_id, relationship_type)
);

-- BẢNG 9: Danh bạ ngày giỗ tổ tiên
CREATE TABLE IF NOT EXISTS memorial_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    lunar_day INTEGER NOT NULL CHECK (lunar_day BETWEEN 1 AND 30),
    lunar_month INTEGER NOT NULL CHECK (lunar_month BETWEEN 1 AND 12),
    lunar_year INTEGER,
    is_leap_month BOOLEAN DEFAULT FALSE NOT NULL,
    recurrence recurrence_type DEFAULT 'YEARLY_LUNAR' NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 10: Sự kiện họ tộc (Events)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_type event_type DEFAULT 'OTHER' NOT NULL,
    scope event_scope DEFAULT 'FAMILY' NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
    lunar_day INTEGER CHECK (lunar_day BETWEEN 1 AND 30),
    lunar_month INTEGER CHECK (lunar_month BETWEEN 1 AND 12),
    lunar_year INTEGER,
    is_leap_month BOOLEAN DEFAULT FALSE,
    solar_date DATE,
    start_time TIME,
    end_time TIME,
    location TEXT,
    description TEXT,
    recurrence recurrence_type DEFAULT 'NONE' NOT NULL,
    status TEXT DEFAULT 'SCHEDULED' NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 11: Cấu hình nhắc lịch sự kiện tự động (Event Reminders)
CREATE TABLE IF NOT EXISTS event_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    memorial_id UUID REFERENCES memorial_dates(id) ON DELETE CASCADE,
    days_before INTEGER NOT NULL CHECK (days_before >= 0), -- 30, 15, 7, 3, 1
    channel TEXT DEFAULT 'IN_APP' NOT NULL,                -- IN_APP, EMAIL, PUSH, ZALO
    is_sent BOOLEAN DEFAULT FALSE NOT NULL,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 12: Quản lý Quỹ Gia Tộc (Funds)
CREATE TABLE IF NOT EXISTS funds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                                    -- Quỹ họ, Quỹ xây nhà thờ, Quỹ khuyến học...
    description TEXT,
    opening_balance NUMERIC(15, 2) DEFAULT 0.00 NOT NULL CHECK (opening_balance >= 0),
    current_balance NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    status fund_status DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 13: Danh mục nguồn thu (Income Categories)
CREATE TABLE IF NOT EXISTS income_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                                    -- Đóng góp thường niên, Quỹ giỗ tổ...
    code TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_family_income_category UNIQUE (family_id, code)
);

-- BẢNG 14: Danh mục khoản chi (Expense Categories)
CREATE TABLE IF NOT EXISTS expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                                    -- Ăn uống, Khánh tiết, Tu bổ từ đường...
    code TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_family_expense_category UNIQUE (family_id, code)
);

-- BẢNG 15: Nghĩa vụ thu tiền định mức (Income Assessments)
CREATE TABLE IF NOT EXISTS income_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE RESTRICT,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    category_id UUID NOT NULL REFERENCES income_categories(id) ON DELETE RESTRICT,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount_due NUMERIC(15, 2) NOT NULL CHECK (amount_due > 0),
    amount_paid NUMERIC(15, 2) DEFAULT 0.00 NOT NULL CHECK (amount_paid >= 0),
    amount_remaining NUMERIC(15, 2) GENERATED ALWAYS AS (amount_due - amount_paid) STORED,
    status assessment_status DEFAULT 'PENDING' NOT NULL,
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 16: Giao dịch tài chính thực tế (Financial Transactions / Sổ Cái)
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE RESTRICT,
    transaction_code TEXT NOT NULL,                        -- Mã chứng từ (VD: THU-2026-001)
    transaction_type transaction_type NOT NULL,            -- INCOME, EXPENSE, TRANSFER, REVERSAL
    category_id UUID REFERENCES income_categories(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    assessment_id UUID REFERENCES income_assessments(id) ON DELETE SET NULL,
    expense_id UUID REFERENCES expense_records(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    payment_method payment_method DEFAULT 'CASH' NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    receipt_url TEXT,
    status transaction_status DEFAULT 'POSTED' NOT NULL,
    reference_transaction_id UUID REFERENCES financial_transactions(id) ON DELETE RESTRICT, -- Cho bút toán Reversal
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_family_tx_code UNIQUE (family_id, transaction_code)
);

-- BẢNG 17: Hồ sơ đề xuất & duyệt khoản chi (Expense Records)
CREATE TABLE IF NOT EXISTS expense_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    recipient TEXT NOT NULL,                               -- Người nhận tiền / Nhà cung cấp
    expense_date DATE NOT NULL,
    payment_method payment_method DEFAULT 'CASH' NOT NULL,
    description TEXT NOT NULL,
    receipt_url TEXT,
    status expense_status DEFAULT 'DRAFT' NOT NULL,
    transaction_id UUID REFERENCES financial_transactions(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 18: Đóng góp tự nguyện (Contributions)
CREATE TABLE IF NOT EXISTS contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    donor_name TEXT,                                       -- Lưu tên nếu không liên kết member
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE RESTRICT,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    purpose TEXT NOT NULL,
    payment_method payment_method DEFAULT 'CASH' NOT NULL,
    transaction_id UUID REFERENCES financial_transactions(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 19: Tài trợ & Công đức lớn (Sponsorships / Bảng Vàng)
CREATE TABLE IF NOT EXISTS sponsorships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    sponsor_name TEXT NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    purpose TEXT NOT NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE RESTRICT,
    sponsor_type sponsor_type DEFAULT 'MEMBER' NOT NULL,
    notes TEXT,
    transaction_id UUID REFERENCES financial_transactions(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================
-- PHÂN HỆ TÀI CHÍNH THUÊ BAO, GÓI CƯỚC & THANH TOÁN (MODULES 16 — 21)
-- ============================================================

-- BẢNG 20: Gói dịch vụ hệ thống (Plans)
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code plan_tier UNIQUE NOT NULL,                        -- FREE, FAMILY, GIA_TOC, DONG_HO, PREMIUM
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    is_public BOOLEAN DEFAULT TRUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 21: Quản lý phiên bản gói & Biểu giá lịch sử (Plan Versions)
CREATE TABLE IF NOT EXISTS plan_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    version_number INTEGER DEFAULT 1 NOT NULL,
    price_monthly NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    price_yearly NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    currency TEXT DEFAULT 'VND' NOT NULL,
    trial_days INTEGER DEFAULT 14 NOT NULL,
    is_current BOOLEAN DEFAULT TRUE NOT NULL,
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_plan_version UNIQUE (plan_id, version_number)
);

-- BẢNG 22: Chi tiết hạn mức tính năng của gói (Plan Features)
CREATE TABLE IF NOT EXISTS plan_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    plan_version_id UUID REFERENCES plan_versions(id) ON DELETE CASCADE,
    feature_code TEXT NOT NULL,                            -- MAX_MEMBERS, MAX_STORAGE, MAX_BRANCHES...
    feature_name TEXT NOT NULL,
    feature_type TEXT DEFAULT 'INTEGER' NOT NULL,          -- BOOLEAN, INTEGER, STORAGE, ENUM
    limit_value NUMERIC(15, 2),                            -- NULL = Unlimited
    is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    CONSTRAINT uq_plan_feature UNIQUE (plan_id, feature_code)
);

-- BẢNG 23: Thuê bao gia tộc (Subscriptions)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID UNIQUE NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    plan_version_id UUID REFERENCES plan_versions(id) ON DELETE RESTRICT,
    status subscription_status DEFAULT 'TRIALING' NOT NULL,
    billing_cycle TEXT DEFAULT 'YEARLY' NOT NULL,          -- MONTHLY, YEARLY
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE NOT NULL,
    cancelled_at TIMESTAMPTZ,
    expired_at TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT TRUE NOT NULL,
    payment_provider TEXT DEFAULT 'VIETQR',
    external_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 24: Lịch sử vòng đời sự kiện thuê bao (Subscription Events)
CREATE TABLE IF NOT EXISTS subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    event_type subscription_event_type NOT NULL,
    from_status subscription_status,
    to_status subscription_status NOT NULL,
    triggered_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 25: Quản lý giai đoạn dùng thử (Trial Periods)
CREATE TABLE IF NOT EXISTS trial_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    is_extended BOOLEAN DEFAULT FALSE NOT NULL,
    extended_days INTEGER DEFAULT 0 NOT NULL,
    extended_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    extension_reason TEXT,
    status TEXT DEFAULT 'ACTIVE' NOT NULL,                 -- ACTIVE, EXPIRED, CONVERTED
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 26: Bảng đếm mức sử dụng tài nguyên tức thời (Usage Counters)
CREATE TABLE IF NOT EXISTS usage_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    feature_code TEXT NOT NULL,                            -- MEMBERS_COUNT, STORAGE_BYTES, BRANCHES_COUNT
    current_usage NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    peak_usage NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    last_reset_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_family_feature_usage UNIQUE (family_id, feature_code)
);

-- BẢNG 27: Nhật ký tăng giảm hạn mức tài nguyên (Usage Events)
CREATE TABLE IF NOT EXISTS usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    feature_code TEXT NOT NULL,
    delta NUMERIC(15, 2) NOT NULL,                         -- Số lượng cộng/trừ (+1 thành viên, +25MB ảnh)
    previous_value NUMERIC(15, 2) NOT NULL,
    new_value NUMERIC(15, 2) NOT NULL,
    reference_id UUID,                                     -- ID của member hoặc file được upload
    triggered_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 28: Hóa đơn thuê bao (Invoices)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,                   -- INV-YYYYMMDD-XXXX
    subtotal NUMERIC(12, 2) NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    tax NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'VND' NOT NULL,
    status invoice_status DEFAULT 'DRAFT' NOT NULL,
    billing_reason TEXT DEFAULT 'SUBSCRIPTION_CYCLE' NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL,
    due_at TIMESTAMPTZ NOT NULL,
    paid_at TIMESTAMPTZ,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 29: Chi tiết từng dòng hàng trên Hóa đơn (Invoice Items)
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,                             -- 'Gói Gia Tộc (1 năm) - 300 thành viên'
    quantity INTEGER DEFAULT 1 NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    feature_code TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 30: Giao dịch thanh toán thuê bao (Payments)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    payment_code TEXT UNIQUE NOT NULL,                     -- PAY-YYYYMMDD-XXXX
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'VND' NOT NULL,
    payment_method payment_method DEFAULT 'VIETQR' NOT NULL,
    provider TEXT DEFAULT 'VIETQR' NOT NULL,
    provider_transaction_id TEXT,
    status payment_status DEFAULT 'PENDING' NOT NULL,
    paid_at TIMESTAMPTZ,
    failure_reason TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 31: Nhật ký sự kiện thanh toán & Webhook ngân hàng (Payment Events)
CREATE TABLE IF NOT EXISTS payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    event_type payment_event_type NOT NULL,
    raw_payload JSONB NOT NULL,
    provider_response JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 32: Quản lý hoàn tiền & hủy giao dịch (Refunds)
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    invoice_id UUID REFERENCES invoices(id) ON DELETE RESTRICT,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE RESTRICT,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    refund_code TEXT UNIQUE NOT NULL,                      -- RFD-YYYYMMDD-XXXX
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'VND' NOT NULL,
    reason TEXT NOT NULL,
    status refund_status DEFAULT 'REQUESTED' NOT NULL,
    bank_account_name TEXT,
    bank_account_number TEXT,
    bank_name TEXT,
    bank_transaction_reference TEXT,
    processed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 33: Nhật ký kiểm toán thanh toán & thuê bao (Billing Audit Logs)
CREATE TABLE IF NOT EXISTS billing_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action billing_audit_action NOT NULL,
    entity_type TEXT NOT NULL,                             -- Subscription, Plan, Invoice, Payment, Refund
    entity_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================
-- PHÂN HỆ THÔNG BÁO & KIỂM TOÁN HỆ THỐNG
-- ============================================================

-- BẢNG 34: Thông báo hệ thống (Notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    reference_type TEXT,                                   -- event, memorial, assessment, expense, billing
    reference_id UUID,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BẢNG 35: Cấu hình thông báo người dùng (Notification Preferences)
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    in_app_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    push_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    memorial_reminders BOOLEAN DEFAULT TRUE NOT NULL,
    event_reminders BOOLEAN DEFAULT TRUE NOT NULL,
    financial_alerts BOOLEAN DEFAULT TRUE NOT NULL,
    billing_alerts BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_user_family_pref UNIQUE (user_id, family_id)
);

-- BẢNG 36: Nhật ký kiểm toán bất biến (Audit Logs)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action audit_action NOT NULL,
    entity_type TEXT NOT NULL,                             -- Member, Event, Fund, Assessment, Transaction, Expense
    entity_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------
-- 4. PERFORMANCE INDEXES
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_memberships_user_family ON family_memberships(user_id, family_id, status);
CREATE INDEX IF NOT EXISTS idx_members_family ON members(family_id);
CREATE INDEX IF NOT EXISTS idx_members_generation ON members(generation_id);
CREATE INDEX IF NOT EXISTS idx_members_branch ON members(branch_id);
CREATE INDEX IF NOT EXISTS idx_relationships_members ON member_relationships(family_id, member_id, related_member_id);
CREATE INDEX IF NOT EXISTS idx_memorial_family_lunar ON memorial_dates(family_id, lunar_month, lunar_day);
CREATE INDEX IF NOT EXISTS idx_events_family_date ON events(family_id, solar_date);
CREATE INDEX IF NOT EXISTS idx_events_lunar ON events(family_id, lunar_month, lunar_day);
CREATE INDEX IF NOT EXISTS idx_assessments_family_member ON income_assessments(family_id, member_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_family_fund ON financial_transactions(family_id, fund_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON financial_transactions(family_id, status);
CREATE INDEX IF NOT EXISTS idx_expenses_family_status ON expense_records(family_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_family ON subscriptions(family_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_counters_family ON usage_counters(family_id, feature_code);
CREATE INDEX IF NOT EXISTS idx_invoices_family_sub ON invoices(family_id, subscription_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_family_status ON payments(family_id, status);
CREATE INDEX IF NOT EXISTS idx_refunds_family_status ON refunds(family_id, status);
CREATE INDEX IF NOT EXISTS idx_billing_audit_family ON billing_audit_logs(family_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_family_created ON audit_logs(family_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- ------------------------------------------------------------
-- 5. TRIGGER FUNCTIONS (AUTOMATIC UPDATED_AT TIMESTAMP)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          AND table_name IN (
              'profiles', 'families', 'family_memberships', 'generations', 'branches',
              'members', 'member_relationships', 'memorial_dates', 'events', 'funds',
              'income_assessments', 'financial_transactions', 'expense_records',
              'plans', 'plan_versions', 'subscriptions', 'trial_periods', 'usage_counters',
              'invoices', 'payments', 'refunds', 'user_notification_preferences'
          )
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_update_timestamp_%I ON %I', t, t);
        EXECUTE format('CREATE TRIGGER trg_update_timestamp_%I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_timestamp_column()', t, t);
    END LOOP;
END $$;

-- ------------------------------------------------------------
-- 6. ATOMIC DATABASE FUNCTIONS (FINANCIAL INTEGRITY & ATOMICITY)
-- ------------------------------------------------------------

-- HÀM 1: Ghi nhận thu tiền định mức & cập nhật Sổ quỹ nguyên tử
CREATE OR REPLACE FUNCTION record_income_payment(
    p_family_id UUID,
    p_fund_id UUID,
    p_assessment_id UUID,
    p_amount NUMERIC,
    p_payment_method payment_method,
    p_transaction_date DATE,
    p_description TEXT,
    p_receipt_url TEXT,
    p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_assessment RECORD;
    v_tx_id UUID;
    v_tx_code TEXT;
    v_new_paid NUMERIC;
    v_new_status assessment_status;
BEGIN
    -- 1. Khóa và kiểm tra nghĩa vụ thu
    SELECT * INTO v_assessment FROM income_assessments 
    WHERE id = p_assessment_id AND family_id = p_family_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Khoản thu định mức không tồn tại hoặc không thuộc gia tộc này.';
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Số tiền thanh toán phải lớn hơn 0.';
    END IF;

    v_new_paid := v_assessment.amount_paid + p_amount;
    IF v_new_paid >= v_assessment.amount_due THEN
        v_new_status := 'PAID';
    ELSE
        v_new_status := 'PARTIAL';
    END IF;

    -- 2. Sinh mã giao dịch duy nhất
    v_tx_code := 'THU-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM()*10000)::TEXT, 4, '0');

    -- 3. Tạo bản ghi giao dịch tài chính POSTED
    INSERT INTO financial_transactions (
        family_id, fund_id, transaction_code, transaction_type, category_id,
        event_id, member_id, assessment_id, amount, payment_method,
        transaction_date, description, receipt_url, status, created_by
    ) VALUES (
        p_family_id, p_fund_id, v_tx_code, 'INCOME', v_assessment.category_id,
        v_assessment.event_id, v_assessment.member_id, p_assessment_id, p_amount, p_payment_method,
        p_transaction_date, p_description, p_receipt_url, 'POSTED', p_user_id
    ) RETURNING id INTO v_tx_id;

    -- 4. Cập nhật nghĩa vụ thu
    UPDATE income_assessments 
    SET amount_paid = v_new_paid,
        status = v_new_status,
        updated_at = NOW()
    WHERE id = p_assessment_id;

    -- 5. Cập nhật số dư quỹ nguyên tử
    UPDATE funds 
    SET current_balance = current_balance + p_amount,
        updated_at = NOW()
    WHERE id = p_fund_id;

    -- 6. Ghi nhật ký kiểm toán
    INSERT INTO audit_logs (
        family_id, user_id, action, entity_type, entity_id, new_data
    ) VALUES (
        p_family_id, p_user_id, 'POST', 'financial_transactions', v_tx_id,
        jsonb_build_object('amount', p_amount, 'assessment_id', p_assessment_id, 'code', v_tx_code)
    );

    RETURN v_tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- HÀM 2: Duyệt khoản chi & trừ tiền quỹ nguyên tử
CREATE OR REPLACE FUNCTION approve_expense_record(
    p_family_id UUID,
    p_expense_id UUID,
    p_approver_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_expense RECORD;
    v_fund RECORD;
    v_tx_id UUID;
    v_tx_code TEXT;
BEGIN
    -- 1. Khóa và kiểm tra phiếu chi
    SELECT * INTO v_expense FROM expense_records 
    WHERE id = p_expense_id AND family_id = p_family_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Phiếu chi không tồn tại hoặc không thuộc gia tộc này.';
    END IF;

    IF v_expense.status != 'PENDING_APPROVAL' AND v_expense.status != 'DRAFT' THEN
        RAISE EXCEPTION 'Phiếu chi này không ở trạng thái chờ duyệt.';
    END IF;

    -- 2. Kiểm tra số dư quỹ
    SELECT * INTO v_fund FROM funds 
    WHERE id = v_expense.fund_id AND family_id = p_family_id FOR UPDATE;

    IF v_fund.current_balance < v_expense.amount THEN
        RAISE EXCEPTION 'Số dư quỹ không đủ để thực hiện chi (Số dư hiện tại: %, Cần chi: %).', 
            v_fund.current_balance, v_expense.amount;
    END IF;

    -- 3. Sinh mã giao dịch chi
    v_tx_code := 'CHI-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM()*10000)::TEXT, 4, '0');

    -- 4. Tạo bản ghi giao dịch POSTED
    INSERT INTO financial_transactions (
        family_id, fund_id, transaction_code, transaction_type, category_id,
        event_id, expense_id, amount, payment_method, transaction_date,
        description, receipt_url, status, created_by
    ) VALUES (
        p_family_id, v_expense.fund_id, v_tx_code, 'EXPENSE', v_expense.category_id,
        v_expense.event_id, p_expense_id, v_expense.amount, v_expense.payment_method,
        v_expense.expense_date, v_expense.description, v_expense.receipt_url, 'POSTED', p_approver_id
    ) RETURNING id INTO v_tx_id;

    -- 5. Cập nhật phiếu chi thành APPROVED
    UPDATE expense_records 
    SET status = 'APPROVED',
        approved_by = p_approver_id,
        approved_at = NOW(),
        updated_at = NOW()
    WHERE id = p_expense_id;

    -- 6. Trừ số dư quỹ nguyên tử
    UPDATE funds 
    SET current_balance = current_balance - v_expense.amount,
        updated_at = NOW()
    WHERE id = v_expense.fund_id;

    -- 7. Ghi nhật ký kiểm toán
    INSERT INTO audit_logs (
        family_id, user_id, action, entity_type, entity_id, new_data
    ) VALUES (
        p_family_id, p_approver_id, 'APPROVE', 'expense_records', p_expense_id,
        jsonb_build_object('amount', v_expense.amount, 'transaction_id', v_tx_id)
    );

    RETURN v_tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- HÀM 3: Bút toán đảo ngược (Reversal Transaction) - Tuyệt đối không xóa vật lý
CREATE OR REPLACE FUNCTION reverse_financial_transaction(
    p_family_id UUID,
    p_transaction_id UUID,
    p_reason TEXT,
    p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_tx RECORD;
    v_rev_tx_id UUID;
    v_rev_code TEXT;
BEGIN
    SELECT * INTO v_tx FROM financial_transactions 
    WHERE id = p_transaction_id AND family_id = p_family_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Giao dịch không tồn tại hoặc không thuộc gia tộc này.';
    END IF;

    IF v_tx.status != 'POSTED' THEN
        RAISE EXCEPTION 'Chỉ giao dịch ở trạng thái POSTED mới có thể đảo ngược.';
    END IF;

    v_rev_code := 'REV-' || v_tx.transaction_code;

    -- 1. Đánh dấu giao dịch gốc là REVERSED
    UPDATE financial_transactions 
    SET status = 'REVERSED', updated_at = NOW() 
    WHERE id = p_transaction_id;

    -- 2. Tạo bút toán đảo ngược đối ứng
    INSERT INTO financial_transactions (
        family_id, fund_id, transaction_code, transaction_type, category_id,
        event_id, member_id, assessment_id, amount, payment_method,
        transaction_date, description, status, reference_transaction_id, created_by
    ) VALUES (
        p_family_id, v_tx.fund_id, v_rev_code, 'REVERSAL', v_tx.category_id,
        v_tx.event_id, v_tx.member_id, v_tx.assessment_id, v_tx.amount, v_tx.payment_method,
        CURRENT_DATE, 'Đảo ngược giao dịch ' || v_tx.transaction_code || ': ' || p_reason,
        'POSTED', p_transaction_id, p_user_id
    ) RETURNING id INTO v_rev_tx_id;

    -- 3. Hoàn trả số dư quỹ
    IF v_tx.transaction_type = 'INCOME' THEN
        UPDATE funds SET current_balance = current_balance - v_tx.amount, updated_at = NOW() WHERE id = v_tx.fund_id;
        IF v_tx.assessment_id IS NOT NULL THEN
            UPDATE income_assessments 
            SET amount_paid = GREATEST(0, amount_paid - v_tx.amount),
                status = CASE WHEN (amount_paid - v_tx.amount) <= 0 THEN 'PENDING'::assessment_status ELSE 'PARTIAL'::assessment_status END,
                updated_at = NOW()
            WHERE id = v_tx.assessment_id;
        END IF;
    ELSIF v_tx.transaction_type = 'EXPENSE' THEN
        UPDATE funds SET current_balance = current_balance + v_tx.amount, updated_at = NOW() WHERE id = v_tx.fund_id;
    END IF;

    -- 4. Ghi audit log
    INSERT INTO audit_logs (
        family_id, user_id, action, entity_type, entity_id, new_data
    ) VALUES (
        p_family_id, p_user_id, 'REVERSE', 'financial_transactions', p_transaction_id,
        jsonb_build_object('reason', p_reason, 'reversal_transaction_id', v_rev_tx_id)
    );

    RETURN v_rev_tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------

-- Kích hoạt RLS cho toàn bộ các bảng nghiệp vụ
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE memorial_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function lấy vai trò của user trong family
CREATE OR REPLACE FUNCTION get_user_family_role(p_family_id UUID)
RETURNS membership_role AS $$
    SELECT role FROM family_memberships 
    WHERE family_id = p_family_id 
      AND user_id = auth.uid() 
      AND status = 'ACTIVE'
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS Policy cho PROFILES
CREATE POLICY profiles_read_all ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY profiles_update_self ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- RLS Policy cho FAMILIES
CREATE POLICY families_select_member ON families FOR SELECT TO authenticated USING (
    id IN (SELECT family_id FROM family_memberships WHERE user_id = auth.uid() AND status = 'ACTIVE')
    OR created_by = auth.uid()
);
CREATE POLICY families_insert_auth ON families FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY families_update_admin ON families FOR UPDATE TO authenticated USING (
    get_user_family_role(id) IN ('OWNER', 'ADMIN')
);

-- RLS Policy cho Public Plans & Features
CREATE POLICY plans_select_public ON plans FOR SELECT TO authenticated, anon USING (is_public = true AND is_active = true);
CREATE POLICY plan_versions_select_current ON plan_versions FOR SELECT TO authenticated, anon USING (is_current = true);
CREATE POLICY plan_features_select_enabled ON plan_features FOR SELECT TO authenticated, anon USING (is_enabled = true);

-- RLS Policy mẫu cho các bảng Tenant phụ thuộc family_id
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'generations', 'branches', 'members', 'member_relationships', 'memorial_dates',
        'events', 'event_reminders', 'funds', 'income_categories', 'expense_categories',
        'income_assessments', 'financial_transactions', 'expense_records', 'contributions',
        'sponsorships', 'subscriptions', 'subscription_events', 'trial_periods',
        'usage_counters', 'usage_events', 'invoices', 'payments', 'refunds',
        'billing_audit_logs', 'audit_logs'
    ]) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I_tenant_select ON %I', tbl, tbl);
        EXECUTE format('CREATE POLICY %I_tenant_select ON %I FOR SELECT TO authenticated USING (
            family_id IN (SELECT family_id FROM family_memberships WHERE user_id = auth.uid() AND status = ''ACTIVE'')
        )', tbl, tbl);
    END LOOP;
END $$;

-- Policy cho Invoice Items
CREATE POLICY invoice_items_select ON invoice_items FOR SELECT TO authenticated USING (
    invoice_id IN (SELECT id FROM invoices WHERE family_id IN (
        SELECT family_id FROM family_memberships WHERE user_id = auth.uid() AND status = 'ACTIVE'
    ))
);

-- Policy cho Payment Events
CREATE POLICY payment_events_select ON payment_events FOR SELECT TO authenticated USING (
    payment_id IN (SELECT id FROM payments WHERE family_id IN (
        SELECT family_id FROM family_memberships WHERE user_id = auth.uid() AND status = 'ACTIVE'
    ))
);

-- Policy ghi nhận cho MEMBERSHIP
CREATE POLICY family_memberships_select ON family_memberships FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR family_id IN (SELECT family_id FROM family_memberships WHERE user_id = auth.uid() AND status = 'ACTIVE')
);

-- Policy cho NOTIFICATIONS
CREATE POLICY notif_select_own ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY notif_update_own ON notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- ------------------------------------------------------------
-- 8. BUSINESS VIEWS
-- ------------------------------------------------------------

-- View tổng quan số dư các quỹ
CREATE OR REPLACE VIEW v_fund_balances AS
SELECT 
    f.id AS fund_id,
    f.family_id,
    f.name AS fund_name,
    f.opening_balance,
    f.current_balance,
    f.status,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'INCOME' AND t.status = 'POSTED' THEN t.amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'EXPENSE' AND t.status = 'POSTED' THEN t.amount ELSE 0 END), 0) AS total_expense
FROM funds f
LEFT JOIN financial_transactions t ON f.id = t.fund_id
GROUP BY f.id, f.family_id, f.name, f.opening_balance, f.current_balance, f.status;

-- View danh sách ngày giỗ sắp tới
CREATE OR REPLACE VIEW v_upcoming_memorials AS
SELECT 
    m.id AS memorial_id,
    m.family_id,
    m.member_id,
    mem.full_name AS deceased_name,
    m.lunar_day,
    m.lunar_month,
    m.is_leap_month,
    g.name AS generation_name,
    b.name AS branch_name
FROM memorial_dates m
JOIN members mem ON m.member_id = mem.id
LEFT JOIN generations g ON mem.generation_id = g.id
LEFT JOIN branches b ON mem.branch_id = b.id;

-- ------------------------------------------------------------
-- 9. SEED DATA DEVELOPMENT & TESTING
-- ------------------------------------------------------------

-- 1. Khởi tạo 5 Gói dịch vụ cốt lõi
INSERT INTO plans (id, code, name, description, short_description, is_public, is_active, sort_order) VALUES
('00000000-0000-0000-0000-000000000001', 'FREE', 'Gói Trải Nghiệm', 'Dành cho gia đình nhỏ tra cứu cơ bản', 'Miễn phí tối đa 30 thành viên', true, true, 1),
('00000000-0000-0000-0000-000000000002', 'FAMILY', 'Gói Gia Đình', 'Quản lý tối đa 100 thành viên, sổ quỹ cơ bản', 'Gia đình hạt nhân 49k/tháng', true, true, 2),
('00000000-0000-0000-0000-000000000003', 'GIA_TOC', 'Gói Gia Tộc', 'Quản lý 300 thành viên, 30 chi nhánh, sổ quỹ kép đầy đủ', 'Dòng tộc vừa & nhỏ 99k/tháng', true, true, 3),
('00000000-0000-0000-0000-000000000004', 'DONG_HO', 'Gói Dòng Họ', 'Quản lý 1000 thành viên, đa quỹ, báo cáo chuyên sâu', 'Dòng họ lớn 199k/tháng', true, true, 4),
('00000000-0000-0000-0000-000000000005', 'PREMIUM', 'Gói Toàn Năng', 'Không giới hạn thành viên, API & sao lưu đám mây', 'Đại tộc toàn năng 499k/tháng', true, true, 5)
ON CONFLICT (code) DO NOTHING;

-- 2. Khởi tạo Phiên bản giá hiện tại (v1)
INSERT INTO plan_versions (plan_id, version_number, price_monthly, price_yearly, currency, trial_days, is_current, effective_from) VALUES
('00000000-0000-0000-0000-000000000001', 1, 0, 0, 'VND', 0, true, NOW()),
('00000000-0000-0000-0000-000000000002', 1, 49000, 490000, 'VND', 14, true, NOW()),
('00000000-0000-0000-0000-000000000003', 1, 99000, 990000, 'VND', 14, true, NOW()),
('00000000-0000-0000-0000-000000000004', 1, 199000, 1990000, 'VND', 14, true, NOW()),
('00000000-0000-0000-0000-000000000005', 1, 499000, 4990000, 'VND', 30, true, NOW())
ON CONFLICT (plan_id, version_number) DO NOTHING;

-- 3. Khởi tạo Định mức tính năng (Plan Features)
INSERT INTO plan_features (plan_id, feature_code, feature_name, feature_type, limit_value, is_enabled) VALUES
-- Free
('00000000-0000-0000-0000-000000000001', 'MAX_MEMBERS', 'Số thành viên tối đa', 'INTEGER', 30, true),
('00000000-0000-0000-0000-000000000001', 'MAX_STORAGE_MB', 'Dung lượng lưu trữ (MB)', 'STORAGE', 500, true),
-- Family
('00000000-0000-0000-0000-000000000002', 'MAX_MEMBERS', 'Số thành viên tối đa', 'INTEGER', 100, true),
('00000000-0000-0000-0000-000000000002', 'MAX_STORAGE_MB', 'Dung lượng lưu trữ (MB)', 'STORAGE', 2048, true),
-- Gia Tộc
('00000000-0000-0000-0000-000000000003', 'MAX_MEMBERS', 'Số thành viên tối đa', 'INTEGER', 300, true),
('00000000-0000-0000-0000-000000000003', 'MAX_STORAGE_MB', 'Dung lượng lưu trữ (MB)', 'STORAGE', 5120, true),
-- Dòng Họ
('00000000-0000-0000-0000-000000000004', 'MAX_MEMBERS', 'Số thành viên tối đa', 'INTEGER', 1000, true),
('00000000-0000-0000-0000-000000000004', 'MAX_STORAGE_MB', 'Dung lượng lưu trữ (MB)', 'STORAGE', 20480, true),
-- Premium
('00000000-0000-0000-0000-000000000005', 'MAX_MEMBERS', 'Số thành viên tối đa', 'INTEGER', NULL, true),
('00000000-0000-0000-0000-000000000005', 'MAX_STORAGE_MB', 'Dung lượng lưu trữ (MB)', 'STORAGE', 102400, true)
ON CONFLICT (plan_id, feature_code) DO NOTHING;
