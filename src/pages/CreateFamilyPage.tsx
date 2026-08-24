import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, MapPin, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const CreateFamilyPage: React.FC = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [originProvince, setOriginProvince] = useState('Hà Nội');
  const [originDistrict, setOriginDistrict] = useState('');
  const [originCommune, setOriginCommune] = useState('');
  const [ancestralHallAddress, setAncestralHallAddress] = useState('');
  const [founderName, setFounderName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();
  const { createFamily, user, families, memberships, activeFamily } = useAuth();

  const currentUserId = user?.id || 'usr-0000-0001';
  const existingOwnedFamily = families.find(
    (f) => f.created_by === currentUserId || memberships.some((m) => m.user_id === currentUserId && m.family_id === f.id && m.role === 'OWNER')
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await createFamily({
        name,
        code,
        originProvince,
        originDistrict,
        originCommune,
        ancestralHallAddress,
        founderName,
        description,
      });
      // Redirect straight to dashboard of newly created family
      navigate('/app/dashboard');
    } catch (err: any) {
      console.error('Lỗi khi tạo dòng họ:', err);
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi tạo dòng họ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // If user already owns a family, show clear dignified single-family policy notice
  if (existingOwnedFamily) {
    return (
      <div className="min-h-screen bg-heritage-bg py-12 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center animate-fade-in">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-center mx-auto text-[#166534]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              Tài Khoản Đã Khởi Tạo Dòng Họ
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn đang là chủ quản trị của <strong>{existingOwnedFamily.name}</strong> ({existingOwnedFamily.code}).
            </p>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 text-left space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <Shield className="w-4 h-4 text-amber-700" />
              <span>Quy định hệ sinh thái:</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Mỗi tài khoản người dùng chỉ được khởi tạo và quản lý duy nhất <strong>1 dòng họ</strong> nhằm bảo toàn tính toàn vẹn dữ liệu và phân quyền gia tộc chuẩn mực.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/app/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <span>Về Bảng Quản Trị Dòng Họ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-heritage-bg py-10 px-4 sm:px-6 lg:px-8 font-sans animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#166534] text-amber-300 font-black text-2xl rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-emerald-400/30">
            GP
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Khởi Tạo Không Gian Dòng Họ Của Bạn</h1>
          <p className="text-xs text-slate-500">
            Tạo lập cơ sở dữ liệu số hóa dòng họ riêng biệt, thiết lập cây phả hệ và quỹ tài chính độc lập
          </p>
        </div>

        {/* Wizard Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2 font-medium animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleCreate}>
            {/* Step 1: Thông tin cơ bản */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
                <Shield className="w-4 h-4 text-[#166534]" />
                <span>1. Thông Tin Danh Xưng Gia Tộc</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Tên Gia Tộc / Dòng Họ *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Đại Tộc Vũ Đình"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!code) {
                        const generatedCode = e.target.value
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, '-')
                          .replace(/-+/g, '-');
                        setCode(generatedCode);
                      }
                    }}
                    className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] bg-slate-50 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Mã Gia Tộc (Duy Nhất) *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: VU-DINH-ND"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] bg-slate-50 focus:bg-white uppercase transition"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Nguồn cội & Quê quán */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
                <MapPin className="w-4 h-4 text-[#166534]" />
                <span>2. Nguyên Quán & Từ Đường (Nhà Thờ Tổ)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Tỉnh / Thành Phố *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nam Định"
                    value={originProvince}
                    onChange={(e) => setOriginProvince(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] bg-slate-50 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Quận / Huyện</label>
                  <input
                    type="text"
                    placeholder="VD: Hải Hậu"
                    value={originDistrict}
                    onChange={(e) => setOriginDistrict(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] bg-slate-50 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Xã / Phường</label>
                  <input
                    type="text"
                    placeholder="VD: Hải Anh"
                    value={originCommune}
                    onChange={(e) => setOriginCommune(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] bg-slate-50 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Địa Chỉ Nhà Thờ Họ (Từ Đường)</label>
                <input
                  type="text"
                  placeholder="VD: Xóm 5, Xã Hải Anh, Huyện Hải Hậu, Tỉnh Nam Định"
                  value={ancestralHallAddress}
                  onChange={(e) => setAncestralHallAddress(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] bg-slate-50 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Step 3: Thủy tổ & Giới thiệu */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-[#166534]" />
                <span>3. Cụ Thủy Tổ & Tiểu Sử Dòng Tộc</span>
              </h2>

              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Danh Tính Cụ Thủy Tổ (Đời 1)</label>
                <input
                  type="text"
                  placeholder="VD: Cụ Vũ Đình Thủy (Thủy Tổ đời 1)"
                  value={founderName}
                  onChange={(e) => setFounderName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] bg-slate-50 focus:bg-white transition"
                />
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Mô Tả & Lịch Sử Tóm Tắt Dòng Họ</label>
                <textarea
                  rows={3}
                  placeholder="Ghi chú về nguồn gốc di cư, công đức tiền nhân hoặc đặc điểm dòng họ..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] bg-slate-50 focus:bg-white transition"
                ></textarea>
              </div>
            </div>

            {/* Role & Quota Notice */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-[#166534] shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900">
                <span className="font-bold">Đặc quyền Trưởng Tộc (OWNER):</span> Bạn sẽ là quản trị viên cao nhất của dòng họ này.
                Hệ thống tự động khởi tạo 3 quỹ dòng họ độc lập và kích hoạt 14 ngày dùng thử miễn phí đầy đủ tính năng.
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'Đang khởi tạo dòng họ...' : 'Hoàn Tất Khởi Tạo Gia Tộc'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFamilyPage;
