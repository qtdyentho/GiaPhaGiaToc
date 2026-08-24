-- ============================================================
-- MIGRATION: PHASE 3 - FAMILY CALENDAR & MEMORIAL ENGINE
-- DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)
-- ============================================================

-- ------------------------------------------------------------
-- 1. BẢNG MEMORIAL DATES (NÂNG CẤP BACKWARD COMPATIBLE)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS memorial_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    lunar_day INTEGER NOT NULL CHECK (lunar_day BETWEEN 1 AND 30),
    lunar_month INTEGER NOT NULL CHECK (lunar_month BETWEEN 1 AND 12),
    lunar_year INTEGER,
    is_leap_month BOOLEAN DEFAULT FALSE NOT NULL,
    recurrence recurrence_type DEFAULT 'YEARLY_LUNAR' NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_memorial_dates_family ON memorial_dates(family_id);
CREATE INDEX IF NOT EXISTS idx_memorial_dates_lunar ON memorial_dates(lunar_month, lunar_day);
CREATE INDEX IF NOT EXISTS idx_memorial_dates_member ON memorial_dates(member_id);

-- ------------------------------------------------------------
-- 2. BẢNG EVENTS (SỰ KIỆN HỌ TỘC)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_type event_type DEFAULT 'OTHER' NOT NULL,
    scope event_scope DEFAULT 'FAMILY' NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
    fund_id UUID REFERENCES funds(id) ON DELETE SET NULL,
    lunar_day INTEGER CHECK (lunar_day BETWEEN 1 AND 30),
    lunar_month INTEGER CHECK (lunar_month BETWEEN 1 AND 12),
    lunar_year INTEGER,
    is_leap_month BOOLEAN DEFAULT FALSE,
    solar_date DATE,
    start_time TIME,
    end_time TIME,
    location TEXT,
    description TEXT,
    estimated_budget NUMERIC(15, 2) DEFAULT 0.00 CHECK (estimated_budget >= 0),
    recurrence recurrence_type DEFAULT 'NONE' NOT NULL,
    status TEXT DEFAULT 'SCHEDULED' NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_family ON events(family_id);
CREATE INDEX IF NOT EXISTS idx_events_solar_date ON events(solar_date);
CREATE INDEX IF NOT EXISTS idx_events_branch ON events(branch_id);

-- ------------------------------------------------------------
-- 3. BẢNG EVENT REMINDERS & NOTIFICATIONS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    memorial_id UUID REFERENCES memorial_dates(id) ON DELETE CASCADE,
    days_before INTEGER NOT NULL CHECK (days_before >= 0),
    channel TEXT DEFAULT 'IN_APP' NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE NOT NULL,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type notification_type DEFAULT 'SYSTEM' NOT NULL,
    reference_id TEXT,
    reference_type TEXT,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_family_user ON notifications(family_id, user_id);

-- ------------------------------------------------------------
-- 4. RLS POLICIES (MULTI-TENANT ISOLATION)
-- ------------------------------------------------------------
ALTER TABLE memorial_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS p_memorial_dates_tenant ON memorial_dates;
    CREATE POLICY p_memorial_dates_tenant ON memorial_dates
        FOR ALL USING (family_id IN (SELECT current_user_family_ids()));
EXCEPTION WHEN undefined_function THEN null; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS p_events_tenant ON events;
    CREATE POLICY p_events_tenant ON events
        FOR ALL USING (family_id IN (SELECT current_user_family_ids()));
EXCEPTION WHEN undefined_function THEN null; END $$;
