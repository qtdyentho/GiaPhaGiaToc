-- ==============================================================================
-- MIGRATION: CLAN CHRONICLES, COMMENTS, INTRO CONFIGS & FAMILY COVENANT
-- DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)
-- NGÀY: 2026-09-04
-- ==============================================================================

-- 1. Bổ sung các cột thông tin Hương ước dòng họ và thông tin mở rộng cho bảng families
ALTER TABLE families ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE families ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE families ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE families ADD COLUMN IF NOT EXISTS ancestral_hall_address TEXT;
ALTER TABLE families ADD COLUMN IF NOT EXISTS covenant_title TEXT;
ALTER TABLE families ADD COLUMN IF NOT EXISTS covenant_preamble TEXT;
ALTER TABLE families ADD COLUMN IF NOT EXISTS covenant_articles JSONB;

COMMENT ON COLUMN families.code IS 'Mã định danh dòng họ (VD: NGUYEN_VAN_YM)';
COMMENT ON COLUMN families.slug IS 'Đường dẫn tĩnh thân thiện (VD: nguyen-van-yen-mo)';
COMMENT ON COLUMN families.banner_url IS 'Ảnh banner lớn đầu trang dòng tộc';
COMMENT ON COLUMN families.ancestral_hall_address IS 'Địa chỉ chi tiết Nhà thờ tổ / Từ đường dòng họ';
COMMENT ON COLUMN families.covenant_title IS 'Tiêu đề bản Hương Ước Tộc Quy';
COMMENT ON COLUMN families.covenant_preamble IS 'Lời nói đầu / Lời ngỏ Hương Ước';
COMMENT ON COLUMN families.covenant_articles IS 'Danh sách các điều khoản Hương ước dòng họ dạng JSONB';

-- 2. Bảng clan_chronicles: Ký sự, hồi ký, bài viết lịch sử dòng họ
CREATE TABLE IF NOT EXISTS clan_chronicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    author_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category TEXT DEFAULT 'GENERAL',
    tags TEXT[],
    cover_image TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

    -- Các cột bổ trợ đồng bộ với service & UI
    slug TEXT,
    author_name TEXT DEFAULT 'Thành viên gia tộc',
    author_avatar TEXT,
    author_branch TEXT,
    author_generation INTEGER,
    summary TEXT,
    cover_image_url TEXT,
    gallery_images TEXT[],
    attached_documents JSONB,
    status TEXT DEFAULT 'PUBLISHED',
    is_featured BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_clan_chronicles_family ON clan_chronicles(family_id);
CREATE INDEX IF NOT EXISTS idx_clan_chronicles_author ON clan_chronicles(author_id);
CREATE INDEX IF NOT EXISTS idx_clan_chronicles_published ON clan_chronicles(family_id, is_published, created_at DESC);

-- 3. Bảng clan_chronicle_comments: Bình luận, lưu bút con cháu cho bài viết
CREATE TABLE IF NOT EXISTS clan_chronicle_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chronicle_id UUID NOT NULL REFERENCES clan_chronicles(id) ON DELETE CASCADE,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    author_id UUID NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    author_branch TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clan_chronicle_comments_chronicle ON clan_chronicle_comments(chronicle_id);
CREATE INDEX IF NOT EXISTS idx_clan_chronicle_comments_family ON clan_chronicle_comments(family_id);

-- 4. Bảng clan_intro_configs: Cấu hình trang giới thiệu cội nguồn & lịch sử dòng họ
CREATE TABLE IF NOT EXISTS clan_intro_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL UNIQUE REFERENCES families(id) ON DELETE CASCADE,
    clan_name TEXT NOT NULL,
    ancestral_origin TEXT,
    hall_name TEXT,
    hall_address TEXT,
    motto TEXT,
    logo_url TEXT,
    banner_url TEXT,
    leader_name TEXT,
    leader_title TEXT,
    leader_phone TEXT,
    leader_email TEXT,
    established_year INTEGER,
    welcome_message TEXT,
    overview TEXT,
    traditions TEXT,
    achievements TEXT,
    rules_summary TEXT,
    contact_info TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

    -- Các cột bổ trợ đồng bộ với ClanIntroConfig UI
    founding_ancestor TEXT,
    founding_year_era TEXT,
    origin_province TEXT,
    origin_district TEXT,
    origin_commune TEXT,
    historical_origin TEXT,
    clan_motto TEXT,
    couplets JSONB,
    ancestral_hall_architect TEXT,
    ancestral_hall_images TEXT[],
    relics_description TEXT,
    leadership_board JSONB
);

CREATE INDEX IF NOT EXISTS idx_clan_intro_configs_family ON clan_intro_configs(family_id);

-- 5. Thiết lập RLS Policies bảo mật và cách ly đa gia tộc (Multi-tenancy)

-- RLS: clan_chronicles
ALTER TABLE clan_chronicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published clan chronicles" ON clan_chronicles;
CREATE POLICY "Anyone can view published clan chronicles" ON clan_chronicles
    FOR SELECT TO anon, authenticated
    USING (is_published = TRUE OR status = 'PUBLISHED');

DROP POLICY IF EXISTS "Family members can view all chronicles" ON clan_chronicles;
CREATE POLICY "Family members can view all chronicles" ON clan_chronicles
    FOR SELECT TO authenticated
    USING (
        family_id IN (
            SELECT family_id FROM family_memberships 
            WHERE user_id = auth.uid() AND status = 'ACTIVE'
        )
    );

DROP POLICY IF EXISTS "Family members can create chronicles" ON clan_chronicles;
CREATE POLICY "Family members can create chronicles" ON clan_chronicles
    FOR INSERT TO authenticated
    WITH CHECK (
        family_id IN (
            SELECT family_id FROM family_memberships 
            WHERE user_id = auth.uid() AND status = 'ACTIVE'
        )
    );

DROP POLICY IF EXISTS "Authors and admins can update chronicles" ON clan_chronicles;
CREATE POLICY "Authors and admins can update chronicles" ON clan_chronicles
    FOR UPDATE TO authenticated
    USING (
        author_id = auth.uid() OR
        family_id IN (
            SELECT family_id FROM family_memberships 
            WHERE user_id = auth.uid() AND status = 'ACTIVE' AND role IN ('OWNER', 'ADMIN', 'GENEALOGY_ADMIN')
        )
    );

DROP POLICY IF EXISTS "Authors and admins can delete chronicles" ON clan_chronicles;
CREATE POLICY "Authors and admins can delete chronicles" ON clan_chronicles
    FOR DELETE TO authenticated
    USING (
        author_id = auth.uid() OR
        family_id IN (
            SELECT family_id FROM family_memberships 
            WHERE user_id = auth.uid() AND status = 'ACTIVE' AND role IN ('OWNER', 'ADMIN')
        )
    );

-- RLS: clan_chronicle_comments
ALTER TABLE clan_chronicle_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read comments on published chronicles" ON clan_chronicle_comments;
CREATE POLICY "Anyone can read comments on published chronicles" ON clan_chronicle_comments
    FOR SELECT TO anon, authenticated
    USING (
        chronicle_id IN (
            SELECT id FROM clan_chronicles WHERE is_published = TRUE OR status = 'PUBLISHED'
        )
    );

DROP POLICY IF EXISTS "Authenticated users can create comments" ON clan_chronicle_comments;
CREATE POLICY "Authenticated users can create comments" ON clan_chronicle_comments
    FOR INSERT TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authors and admins can delete comments" ON clan_chronicle_comments;
CREATE POLICY "Authors and admins can delete comments" ON clan_chronicle_comments
    FOR DELETE TO authenticated
    USING (
        author_id = auth.uid() OR
        family_id IN (
            SELECT family_id FROM family_memberships 
            WHERE user_id = auth.uid() AND status = 'ACTIVE' AND role IN ('OWNER', 'ADMIN')
        )
    );

-- RLS: clan_intro_configs
ALTER TABLE clan_intro_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view clan intro configs" ON clan_intro_configs;
CREATE POLICY "Anyone can view clan intro configs" ON clan_intro_configs
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Family admins can manage clan intro configs" ON clan_intro_configs;
CREATE POLICY "Family admins can manage clan intro configs" ON clan_intro_configs
    FOR ALL TO authenticated
    USING (
        family_id IN (
            SELECT family_id FROM family_memberships 
            WHERE user_id = auth.uid() AND status = 'ACTIVE' AND role IN ('OWNER', 'ADMIN')
        )
    )
    WITH CHECK (
        family_id IN (
            SELECT family_id FROM family_memberships 
            WHERE user_id = auth.uid() AND status = 'ACTIVE' AND role IN ('OWNER', 'ADMIN')
        )
    );
