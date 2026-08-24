import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, MapPin, Building, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BRAND } from '../lib/constants';

export const CreateFamilyPage: React.FC = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [originProvince, setOriginProvince] = useState('Hà Nội');
  const [originDistrict, setOriginDistrict] = useState('');
  const [originCommune, setOriginCommune] = useState('');
  const [ancestralHallAddress, setAncestralHallAddress] = useState('');
  const [founderName, setFounderName] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate creating family & redirect to dashboard
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen bg-heritage-bg py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-heritage-green text-heritage-gold font-black text-xl rounded-xl mx-auto flex items-center justify-center shadow-md">
            GP
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Khởi Tạo Không Gian Gia Tộc Mới</h1>
          <p className="text-xs text-slate-500">
            Tạo lập cơ sở dữ liệu số hóa dòng họ, thiết lập cây phả hệ và phân quyền thành viên
          </p>
        </div>

        {/* Wizard Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-heritage p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleCreate}>
            {/* Step 1: Thông tin cơ bản */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
                <Shield className="w-4 h-4 text-heritage-green" />
                <span>1. Thông Tin Danh Xưng Gia Tộc</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Tên Gia Tộc / Dòng Họ *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Đại Tộc Nguyễn Văn"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Mã Gia Tộc (Duy Nhất) *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: NGUYEN-VAN-HN"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="mt-1 block w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Nguồn cội & Quê quán */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
                <MapPin className="w-4 h-4 text-heritage-green" />
                <span>2. Nguyên Quán & Từ Đường (Nhà Thờ Tổ)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Tỉnh / Thành Phố *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Hà Nội"
                    value={originProvince}
                    onChange={(e) => setOriginProvince(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Quận / Huyện</label>
                  <input
                    type="text"
                    placeholder="VD: Hoàng Mai"
                    value={originDistrict}
                    onChange={(e) => setOriginDistrict(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Xã / Phường</label>
                  <input
                    type="text"
                    placeholder="VD: Định Công"
                    value={originCommune}
                    onChange={(e) => setOriginCommune(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 uppercase">Địa Chỉ Nhà Thờ Họ (Từ Đường)</label>
                <input
                  type="text"
                  placeholder="VD: Số 18 Ngõ 42 Tổ 5, Định Công, Hoàng Mai, Hà Nội"
                  value={ancestralHallAddress}
                  onChange={(e) => setAncestralHallAddress(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green"
                />
              </div>
            </div>

            {/* Step 3: Thủy tổ & Giới thiệu */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-heritage-green" />
                <span>3. Cụ Thủy Tổ & Tiểu Sử Dòng Tộc</span>
              </h2>

              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 uppercase">Danh Tính Cụ Thủy Tổ (Đời 1)</label>
                <input
                  type="text"
                  placeholder="VD: Cụ Nguyễn Văn Phúc (Thủy Tổ đời 1)"
                  value={founderName}
                  onChange={(e) => setFounderName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green"
                />
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 uppercase">Mô Tả & Lịch Sử Tóm Tắt Dòng Họ</label>
                <textarea
                  rows={3}
                  placeholder="Ghi chú về nguồn gốc di cư, công đức tiền nhân hoặc đặc điểm dòng họ..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green"
                ></textarea>
              </div>
            </div>

            {/* Role & Quota Notice */}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-heritage-green shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900">
                <span className="font-bold">Đặc quyền Trưởng Tộc (OWNER):</span> Bạn sẽ là quản trị viên cao nhất của gia tộc này.
                Hệ thống tự động kích hoạt 14 ngày dùng thử miễn phí đầy đủ tính năng.
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition shadow-md"
              >
                <span>Hoàn Tất Khởi Tạo Gia Tộc</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
