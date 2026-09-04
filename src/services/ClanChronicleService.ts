import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  ClanChronicle,
  ClanChronicleComment,
  ClanIntroConfig,
  ChronicleCategory,
} from '../types/chronicle';

// In-Memory & LocalStorage persistent fallback store
const LOCAL_CHRONICLES_KEY = 'giapha_clan_chronicles_store';
const LOCAL_COMMENTS_KEY = 'giapha_clan_comments_store';
const LOCAL_INTRO_KEY = 'giapha_clan_intro_store';

const inMemoryChronicles = new Map<string, ClanChronicle[]>();
const inMemoryComments = new Map<string, ClanChronicleComment[]>();
const inMemoryIntro = new Map<string, ClanIntroConfig>();

function getLocalChronicles(familyId: string): ClanChronicle[] {
  if (inMemoryChronicles.has(familyId)) {
    return inMemoryChronicles.get(familyId) || [];
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(`${LOCAL_CHRONICLES_KEY}_${familyId}`);
      const list = raw ? JSON.parse(raw) : [];
      inMemoryChronicles.set(familyId, list);
      return list;
    }
  } catch {}
  return [];
}

function saveLocalChronicles(familyId: string, items: ClanChronicle[]) {
  inMemoryChronicles.set(familyId, items);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(`${LOCAL_CHRONICLES_KEY}_${familyId}`, JSON.stringify(items));
    }
  } catch (err) {
    console.warn('Cannot save local chronicles:', err);
  }
}

function getLocalComments(chronicleId: string): ClanChronicleComment[] {
  if (inMemoryComments.has(chronicleId)) {
    return inMemoryComments.get(chronicleId) || [];
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(`${LOCAL_COMMENTS_KEY}_${chronicleId}`);
      const list = raw ? JSON.parse(raw) : [];
      inMemoryComments.set(chronicleId, list);
      return list;
    }
  } catch {}
  return [];
}

function saveLocalComments(chronicleId: string, items: ClanChronicleComment[]) {
  inMemoryComments.set(chronicleId, items);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(`${LOCAL_COMMENTS_KEY}_${chronicleId}`, JSON.stringify(items));
    }
  } catch (err) {
    console.warn('Cannot save local comments:', err);
  }
}

const isUUID = (str?: string | null): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

export class ClanChronicleService {
  /**
   * Lấy danh sách bài viết / ký sự của dòng họ
   */
  static async getChronicles(
    familyId: string,
    category?: ChronicleCategory,
    search?: string
  ): Promise<ClanChronicle[]> {
    if (!familyId) return [];

    let list: ClanChronicle[] = [];

    if (isSupabaseConfigured() && isUUID(familyId)) {
      try {
        let query = supabase
          .from('clan_chronicles')
          .select('*')
          .eq('family_id', familyId)
          .eq('status', 'PUBLISHED')
          .order('is_pinned', { ascending: false })
          .order('published_at', { ascending: false });

        if (category) {
          query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (error) {
          console.error('Supabase getChronicles query error:', error);
          throw new Error(`Lỗi tải danh sách ký sự: ${error.message}`);
        }
        if (data) {
          list = data as ClanChronicle[];
        }
      } catch (err: any) {
        console.error('Supabase getChronicles query error:', err);
        throw err;
      }
    } else {
      // Local/in-memory items only when Supabase is not configured or non-UUID
      list = getLocalChronicles(familyId);
    }

    if (category) {
      list = list.filter((c) => c.category === category);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.author_name.toLowerCase().includes(q) ||
          c.content.toLowerCase().includes(q)
      );
    }

    return list;
  }

  /**
   * Lấy chi tiết một bài viết theo ID
   */
  static async getChronicleById(id: string, familyId: string): Promise<ClanChronicle | null> {
    if (!id || !familyId) return null;

    if (isSupabaseConfigured() && isUUID(id) && isUUID(familyId)) {
      try {
        const { data, error } = await supabase
          .from('clan_chronicles')
          .select('*')
          .eq('id', id)
          .eq('family_id', familyId)
          .single();

        if (error) {
          console.error('Supabase getChronicleById error:', error);
          throw new Error(`Lỗi tải bài viết: ${error.message}`);
        }
        if (data) {
          this.incrementViews(id, familyId);
          return data as ClanChronicle;
        }
        return null;
      } catch (err: any) {
        console.error('Supabase getChronicleById error:', err);
        throw err;
      }
    }

    const localList = getLocalChronicles(familyId);
    const found = localList.find((c) => c.id === id);
    if (found) {
      found.views_count = (found.views_count || 0) + 1;
      saveLocalChronicles(familyId, localList);
      return found;
    }

    return null;
  }

  /**
   * Tăng lượt xem bài viết
   */
  static async incrementViews(id: string, familyId: string): Promise<void> {
    if (isSupabaseConfigured() && isUUID(id)) {
      try {
        const { error } = await supabase.rpc('increment_chronicle_views', { chronicle_id: id });
        if (error) {
          const { data } = await supabase.from('clan_chronicles').select('views_count').eq('id', id).single();
          if (data) {
            await supabase.from('clan_chronicles').update({ views_count: (data.views_count || 0) + 1 }).eq('id', id);
          }
        }
      } catch {}
    }
  }

  /**
   * Thả tim / Bày tỏ lòng tri ân bài viết
   */
  static async likeChronicle(id: string, familyId: string): Promise<{ success: boolean; likes: number }> {
    let currentLikes = 0;
    if (isSupabaseConfigured() && isUUID(id)) {
      try {
        const { data } = await supabase.from('clan_chronicles').select('likes_count').eq('id', id).single();
        if (data) {
          currentLikes = (data.likes_count || 0) + 1;
          await supabase.from('clan_chronicles').update({ likes_count: currentLikes }).eq('id', id);
          return { success: true, likes: currentLikes };
        }
      } catch (err) {
        console.warn('Supabase likeChronicle error:', err);
      }
    }

    const localList = getLocalChronicles(familyId);
    const found = localList.find((c) => c.id === id);
    if (found) {
      found.likes_count = (found.likes_count || 0) + 1;
      saveLocalChronicles(familyId, localList);
      return { success: true, likes: found.likes_count };
    }

    return { success: true, likes: 1 };
  }

  /**
   * Tạo bài viết mới hoặc lưu ký dòng họ
   */
  static async createChronicle(data: {
    family_id: string;
    author_id?: string;
    author_name: string;
    author_avatar?: string;
    author_branch?: string;
    author_generation?: number | string;
    title: string;
    summary: string;
    content: string;
    category: ChronicleCategory;
    cover_image_url?: string;
    gallery_images?: string[];
    attached_documents?: { name: string; url: string; size?: string }[];
    tags?: string[];
    is_featured?: boolean;
    is_pinned?: boolean;
  }): Promise<{ success: boolean; chronicle?: ClanChronicle; error?: string }> {
    if (!data.family_id || !data.title.trim() || !data.content.trim()) {
      return { success: false, error: 'Vui lòng nhập đầy đủ Tiêu đề và Nội dung bài viết.' };
    }

    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined;
    const slug = data.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (isSupabaseConfigured() && isUUID(data.family_id)) {
      const insertPayload: Record<string, any> = {
        family_id: data.family_id,
        author_id: data.author_id || null,
        author_name: data.author_name.trim() || 'Thành viên gia tộc',
        author_avatar: data.author_avatar || null,
        author_branch: data.author_branch || null,
        author_generation: typeof data.author_generation === 'number' ? data.author_generation : null,
        title: data.title.trim(),
        slug: `${slug}-${(id || Date.now().toString()).slice(0, 6)}`,
        summary: data.summary.trim() || data.content.slice(0, 150) + '...',
        content: data.content.trim(),
        category: data.category,
        cover_image_url: data.cover_image_url || null,
        gallery_images: data.gallery_images || [],
        attached_documents: data.attached_documents || [],
        tags: data.tags || [],
        status: 'PUBLISHED',
        is_featured: !!data.is_featured,
        is_pinned: !!data.is_pinned,
        views_count: 1,
        likes_count: 0,
        comments_count: 0,
        published_at: new Date().toISOString(),
      };
      if (id) insertPayload.id = id;

      const { data: dbData, error } = await supabase.from('clan_chronicles').insert([insertPayload]).select().single();
      if (error) {
        console.error('Supabase insert clan_chronicles error:', error);
        return { success: false, error: error.message };
      }
      if (dbData) {
        const chronicle = dbData as ClanChronicle;
        return { success: true, chronicle };
      }
      return { success: false, error: 'Không thể tạo bài viết trên cơ sở dữ liệu.' };
    }

    const newChronicle: ClanChronicle = {
      id: id || `chr-${Date.now()}`,
      family_id: data.family_id,
      author_id: data.author_id,
      author_name: data.author_name.trim() || 'Thành viên gia tộc',
      author_avatar: data.author_avatar,
      author_branch: data.author_branch,
      author_generation: data.author_generation,
      title: data.title.trim(),
      slug: `${slug}-${(id || Date.now().toString()).slice(0, 6)}`,
      summary: data.summary.trim() || data.content.slice(0, 150) + '...',
      content: data.content.trim(),
      category: data.category,
      cover_image_url: data.cover_image_url,
      gallery_images: data.gallery_images || [],
      attached_documents: data.attached_documents || [],
      tags: data.tags || [],
      status: 'PUBLISHED',
      is_featured: !!data.is_featured,
      is_pinned: !!data.is_pinned,
      views_count: 1,
      likes_count: 0,
      comments_count: 0,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Always update in-memory / local storage
    const localList = getLocalChronicles(data.family_id);
    localList.unshift(newChronicle);
    saveLocalChronicles(data.family_id, localList);

    return { success: true, chronicle: newChronicle };
  }

  /**
   * Xóa bài viết
   */
  static async deleteChronicle(id: string, familyId: string): Promise<boolean> {
    if (!id || !familyId) return false;

    if (isSupabaseConfigured() && isUUID(id) && isUUID(familyId)) {
      const { error } = await supabase.from('clan_chronicles').delete().eq('id', id).eq('family_id', familyId);
      if (error) {
        console.error('Supabase delete error:', error);
        return false;
      }
      return true;
    }

    const localList = getLocalChronicles(familyId).filter((c) => c.id !== id);
    saveLocalChronicles(familyId, localList);
    return true;
  }

  /**
   * Lấy danh sách bình luận / lưu bút con cháu của bài viết
   */
  static async getComments(chronicleId: string, familyId: string): Promise<ClanChronicleComment[]> {
    if (!chronicleId) return [];

    if (isSupabaseConfigured() && isUUID(chronicleId) && isUUID(familyId)) {
      try {
        const { data, error } = await supabase
          .from('clan_chronicle_comments')
          .select('*')
          .eq('chronicle_id', chronicleId)
          .eq('family_id', familyId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase getComments error:', error);
          throw new Error(`Lỗi tải danh sách bình luận: ${error.message}`);
        }
        if (data) {
          return data as ClanChronicleComment[];
        }
        return [];
      } catch (err: any) {
        console.error('Supabase getComments error:', err);
        throw err;
      }
    }

    return getLocalComments(chronicleId);
  }

  /**
   * Thêm bình luận / lưu bút con cháu
   */
  static async addComment(data: {
    chronicle_id: string;
    family_id: string;
    author_id?: string;
    author_name: string;
    author_avatar?: string;
    author_branch?: string;
    content: string;
  }): Promise<{ success: boolean; comment?: ClanChronicleComment; error?: string }> {
    if (!data.chronicle_id || !data.content.trim()) {
      return { success: false, error: 'Vui lòng nhập nội dung lưu bút.' };
    }

    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined;

    if (isSupabaseConfigured() && isUUID(data.chronicle_id) && isUUID(data.family_id)) {
      const commentPayload: Record<string, any> = {
        chronicle_id: data.chronicle_id,
        family_id: data.family_id,
        author_id: data.author_id || null,
        author_name: data.author_name.trim() || 'Con cháu dòng tộc',
        author_avatar: data.author_avatar || null,
        author_branch: data.author_branch || null,
        content: data.content.trim(),
      };
      if (id) commentPayload.id = id;

      const { data: dbComment, error } = await supabase
        .from('clan_chronicle_comments')
        .insert([commentPayload])
        .select()
        .single();

      if (error) {
        console.error('Supabase addComment error:', error);
        return { success: false, error: error.message };
      }

      if (dbComment) {
        // Update comment count
        const { data: chr } = await supabase.from('clan_chronicles').select('comments_count').eq('id', data.chronicle_id).single();
        if (chr) {
          await supabase.from('clan_chronicles').update({ comments_count: (chr.comments_count || 0) + 1 }).eq('id', data.chronicle_id);
        }
        const comment = dbComment as ClanChronicleComment;
        return { success: true, comment };
      }
      return { success: false, error: 'Không thể thêm bình luận trên cơ sở dữ liệu.' };
    }

    const newComment: ClanChronicleComment = {
      id: id || `cmt-${Date.now()}`,
      chronicle_id: data.chronicle_id,
      family_id: data.family_id,
      author_id: data.author_id,
      author_name: data.author_name.trim() || 'Con cháu dòng tộc',
      author_avatar: data.author_avatar,
      author_branch: data.author_branch,
      content: data.content.trim(),
      created_at: new Date().toISOString(),
    };

    const localComments = getLocalComments(data.chronicle_id);
    localComments.unshift(newComment);
    saveLocalComments(data.chronicle_id, localComments);

    return { success: true, comment: newComment };
  }

  /**
   * Lấy thông tin Giới Thiệu & Lịch Sử Cội Nguồn của dòng họ
   */
  static async getClanIntro(familyId: string): Promise<ClanIntroConfig> {
    const defaultIntro: ClanIntroConfig = {
      family_id: familyId,
      founding_ancestor: 'Khởi Tổ Tiên Công',
      founding_year_era: 'Khởi dựng từ thời tiền nhân lập ấp',
      origin_province: 'Cội nguồn quê cha đất tổ',
      historical_origin:
        'Trải qua bao thăng trầm của lịch sử, các bậc tiền nhân đã khai hoang lập ấp, gầy dựng cơ đồ cho con cháu muôn đời sau. Nối tiếp truyền thống hiếu học, đoàn kết và tương thân tương ái, dòng họ luôn giữ vững nề nếp gia phong, rạng danh tiên tổ.',
      clan_motto: 'Uống nước nhớ nguồn • Đoàn kết tương thân • Hiếu học thành tài • Rạng danh tiên tổ',
      couplets: [
        {
          horizontal: 'ĐỨC LƯU QUANG',
          left: 'Tổ tông công đức thiên niên thịnh',
          right: 'Tử hiếu tôn hiền vạn đại vinh',
        },
        {
          horizontal: 'ẨM THỦY TƯ NGUYÊN',
          left: 'Mộc xuất thiên chi do hữu bản',
          right: 'Thủy lưu vạn phái tổng quy nguyên',
        },
      ],
      ancestral_hall_address: 'Nhà thờ tổ dòng họ',
      ancestral_hall_architect: 'Kiến trúc cổ truyền 3 gian 2 chái, mái ngói mũi hài, cột gỗ lim',
      ancestral_hall_images: [
        '/images/presets/tu-duong-san-gach.png',
        '/images/presets/gian-tho-son-son.jpg',
        '/images/presets/ho-ban-nguyet-tu-duong.png',
        '/images/presets/lang-mo-da-tien-nhan.png',
        'https://villagold.vn/uploads/nha-go-nha-co/3-gian-2-chai-xay-1/5-interactive-lightmix.jpg',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGhYeiltQG5qUQvGDSDnswI7NMoN682brydl58CsCEEIiITcrTJ8blFBQ&s=10',
      ],
      relics_description: 'Văn bia ghi danh công đức, lư hương đồng cổ, gia phả cổ chữ Hán Nôm và các bức đại tự ngàn năm.',
      leadership_board: [
        { role: 'Trưởng Tộc', name: 'Đại diện Trưởng tộc', title: 'Chủ trì việc họ' },
        { role: 'Phó Trưởng Tộc', name: 'Ban Quản trị dòng họ', title: 'Điều hành khánh tiết' },
        { role: 'Thủ Quỹ & Tài Chính', name: 'Ban Tài Chính', title: 'Quản lý sổ quỹ minh bạch' },
        { role: 'Ban Khuyến Học', name: 'Hội Đồng Khuyến Học', title: 'Khen thưởng con cháu đỗ đạt' },
      ],
    };

    if (!familyId) return defaultIntro;

    if (isSupabaseConfigured() && isUUID(familyId)) {
      try {
        const { data, error } = await supabase
          .from('families')
          .select('description, ancestral_hall_address, origin_province, origin_district, origin_commune, covenant_preamble')
          .eq('id', familyId)
          .single();

        if (error) {
          console.error('Supabase getClanIntro error:', error);
          throw new Error(`Lỗi tải thông tin giới thiệu dòng họ: ${error.message}`);
        }

        if (data) {
          const intro: ClanIntroConfig = { ...defaultIntro };
          if (data.covenant_preamble && data.covenant_preamble.startsWith('{')) {
            try {
              const parsed = JSON.parse(data.covenant_preamble);
              Object.assign(intro, parsed);
            } catch {}
          }
          if (data.description) intro.historical_origin = data.description;
          if (data.ancestral_hall_address) intro.ancestral_hall_address = data.ancestral_hall_address;
          if (data.origin_province) intro.origin_province = data.origin_province;
          if (data.origin_district) intro.origin_district = data.origin_district;
          if (data.origin_commune) intro.origin_commune = data.origin_commune;

          inMemoryIntro.set(familyId, intro);
          return intro;
        }
      } catch (err: any) {
        console.error('Supabase getClanIntro exception:', err);
        throw err;
      }
    }

    if (inMemoryIntro.has(familyId)) {
      return inMemoryIntro.get(familyId)!;
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(`${LOCAL_INTRO_KEY}_${familyId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          inMemoryIntro.set(familyId, parsed);
          return { ...defaultIntro, ...parsed };
        }
      }
    } catch {}

    return defaultIntro;
  }

  /**
   * Cập nhật thông tin Giới Thiệu & Lịch Sử Cội Nguồn của dòng họ
   */
  static async updateClanIntro(
    familyId: string,
    data: Partial<ClanIntroConfig>
  ): Promise<{ success: boolean; intro?: ClanIntroConfig; error?: string }> {
    if (!familyId) return { success: false, error: 'Không tìm thấy ID dòng họ.' };

    const current = await this.getClanIntro(familyId);
    const updated: ClanIntroConfig = {
      ...current,
      ...data,
      family_id: familyId,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && isUUID(familyId)) {
      const { error } = await supabase
        .from('families')
        .update({
          description: updated.historical_origin,
          ancestral_hall_address: updated.ancestral_hall_address,
          origin_province: updated.origin_province,
          origin_district: updated.origin_district,
          origin_commune: updated.origin_commune,
          covenant_preamble: JSON.stringify(updated),
        })
        .eq('id', familyId);

      if (error) {
        console.error('Supabase update family intro error:', error);
        return { success: false, error: error.message };
      }
    }

    inMemoryIntro.set(familyId, updated);

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`${LOCAL_INTRO_KEY}_${familyId}`, JSON.stringify(updated));
      }
    } catch {}

    return { success: true, intro: updated };
  }
}
