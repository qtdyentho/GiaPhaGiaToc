export type ChronicleCategory =
  | 'ORIGIN_HISTORY'     // Sự tích & Cội nguồn Tiền nhân
  | 'MEMOIR_STORY'       // Hồi ký & Kỷ niệm Gia đình
  | 'FESTIVAL_REPORT'    // Ký sự Giỗ Tổ & Lễ hội Họ
  | 'TALENT_HONOR'       // Gương sáng & Khuyến học
  | 'RESEARCH_DOCUMENT'  // Tư liệu & Văn bản cổ
  | 'CLAN_ANNOUNCEMENT'; // Thông tri & Lời ngỏ

export type ChronicleStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export interface ClanChronicle {
  id: string;
  family_id: string;
  author_id?: string;
  author_name: string;
  author_avatar?: string;
  author_branch?: string;
  author_generation?: number | string;
  title: string;
  slug: string;
  summary: string;
  content: string; // Markdown / Rich text
  category: ChronicleCategory;
  cover_image_url?: string;
  gallery_images?: string[];
  attached_documents?: { name: string; url: string; size?: string }[];
  tags?: string[];
  status: ChronicleStatus;
  is_featured?: boolean;
  is_pinned?: boolean;
  views_count: number;
  likes_count: number;
  comments_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ClanChronicleComment {
  id: string;
  chronicle_id: string;
  family_id: string;
  author_id?: string;
  author_name: string;
  author_avatar?: string;
  author_branch?: string;
  content: string;
  created_at: string;
}

export interface ClanIntroCouplet {
  horizontal?: string; // Hoành phi (VD: "Đức Lưu Quang", "Ẩm Thủy Tư Nguyên")
  left: string;        // Vế câu đối trái
  right: string;       // Vế câu đối phải
}

export interface ClanLeaderItem {
  id?: string;
  role: string;       // "Trưởng Tộc", "Phó Trưởng Tộc", "Trưởng Ban Khánh Tiết", "Chủ Tịch Hội Khuyến Học"
  name: string;       // Họ và tên
  title?: string;      // Danh xưng / Chức sắc
  phone?: string;     // Số điện thoại liên hệ
  branch_name?: string; // Thuộc Chi nào
  generation?: number; // Đời thứ mấy
}

export interface ClanIntroConfig {
  family_id: string;
  founding_ancestor: string;      // Tên Thủy Tổ / Khởi Tổ
  founding_year_era: string;      // Niên đại phát tích (VD: "Thế kỷ XV thời Hậu Lê")
  origin_province?: string;       // Tỉnh/Thành phát tích
  origin_district?: string;       // Quận/Huyện phát tích
  origin_commune?: string;        // Xã/Phường/Làng phát tích
  historical_origin: string;      // Lịch sử cội nguồn, phát tích và các mốc di cư
  clan_motto: string;             // Phương châm & Cổ huấn dòng tộc
  couplets: ClanIntroCouplet[];   // Hoành phi & Câu đối từ đường
  ancestral_hall_address?: string; // Địa chỉ Nhà thờ tổ / Từ đường
  ancestral_hall_architect?: string; // Kiến trúc, diện tích, năm xây dựng
  ancestral_hall_images?: string[]; // Hình ảnh từ đường & di tích
  relics_description?: string;    // Di vật, sắc phong, văn bia
  leadership_board: ClanLeaderItem[]; // Ban Trị Sự & Hội đồng gia tộc đương nhiệm
  updated_at?: string;
}

export const CHRONICLE_CATEGORY_LABELS: Record<ChronicleCategory, { label: string; color: string; icon: string }> = {
  ORIGIN_HISTORY: {
    label: 'Sự Tích & Cội Nguồn',
    color: 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    icon: '📜',
  },
  MEMOIR_STORY: {
    label: 'Hồi Ký & Kỷ Niệm',
    color: 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-800',
    icon: '📖',
  },
  FESTIVAL_REPORT: {
    label: 'Ký Sự Giỗ Tổ & Lễ Hội',
    color: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    icon: '🏮',
  },
  TALENT_HONOR: {
    label: 'Gương Sáng Khuyến Học',
    color: 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    icon: '🎓',
  },
  RESEARCH_DOCUMENT: {
    label: 'Tư Liệu & Văn Bản Cổ',
    color: 'bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    icon: '🗂️',
  },
  CLAN_ANNOUNCEMENT: {
    label: 'Thông Tri & Lời Ngỏ',
    color: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    icon: '📢',
  },
};
