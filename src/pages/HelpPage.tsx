import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft, BookOpen, CreditCard, ShieldCheck, Users, Calendar } from 'lucide-react';

export const HelpPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-emerald-500 selection:text-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quay lại Trang Chủ
          </Link>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
            Trung Tâm Trợ Giúp & Hướng Dẫn
          </span>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-emerald-400" />
            Hướng Dẫn Sử Dụng & Vận Hành Gia Phả Gia Tộc
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Tổng hợp các quy trình nghiệp vụ quan trọng về quản lý cây gia phả, tính toán ngày giỗ âm lịch, quản lý sổ quỹ và kích hoạt gói cước.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">1. Nhập Dữ Liệu Gia Phả Ban Đầu</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trưởng tộc hoặc Người quản trị có thể nhập từng thành viên hoặc sử dụng Wizard Nhập Liệu 5 bước tự động nhận diện quan hệ huyết thống từ tệp Excel/CSV.
            </p>
          </div>

          <div className="p-6 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">2. Lịch Âm & Nhắc Ngày Giỗ</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hệ thống tự động chuyển đổi ngày mất âm lịch sang ngày dương lịch theo từng năm (hỗ trợ năm nhuận, tháng thiếu 29 ngày) và gửi thông báo nhắc lễ trước 30, 15, 7, 3, 1 ngày.
            </p>
          </div>

          <div className="p-6 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">3. Quy Trình Thanh Toán & Kích Hoạt Gói</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Khách hàng chọn gói cước $\rightarrow$ chuyển khoản theo mã VietQR $\rightarrow$ bấm "Tôi đã chuyển khoản". Ban Quản Trị sẽ kiểm tra sao kê ngân hàng và phê duyệt trong vòng 15-30 phút.
            </p>
          </div>

          <div className="p-6 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">4. Chế Độ Bảo Toàn READ_ONLY</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Khi gói cước hết hạn, toàn bộ dữ liệu gia phả, lịch sử ngày giỗ và sổ quỹ được bảo toàn vĩnh viễn ở chế độ Chỉ Đọc (READ_ONLY), tuyệt đối không bị xóa hoặc mất mát.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
