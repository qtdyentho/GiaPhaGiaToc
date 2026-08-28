import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft, CreditCard, ShieldCheck, Users, Calendar } from 'lucide-react';

export const HelpPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7F8F5] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-[#166534] selection:text-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-[#166534] dark:hover:text-emerald-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quay lại Trang Chủ
          </Link>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-full">
            Trung Tâm Trợ Giúp & Hướng Dẫn
          </span>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3 font-heritage">
            <HelpCircle className="w-8 h-8 text-[#166534] dark:text-emerald-400" />
            Hướng Dẫn Sử Dụng & Vận Hành Gia Phả Gia Tộc
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
            Tổng hợp các quy trình nghiệp vụ quan trọng về quản lý cây gia phả, tính toán ngày giỗ âm lịch, quản lý sổ quỹ và kích hoạt gói cước.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl space-y-3 shadow-xs hover:border-emerald-500 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Nhập Dữ Liệu Gia Phả Ban Đầu</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Trưởng tộc hoặc Người quản trị có thể nhập từng thành viên hoặc sử dụng Wizard Nhập Liệu 5 bước tự động nhận diện quan hệ huyết thống từ tệp Excel/CSV.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl space-y-3 shadow-xs hover:border-teal-500 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-teal-100/70 dark:bg-teal-950/60 text-teal-800 dark:text-teal-400 flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Lịch Âm & Nhắc Ngày Giỗ</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Hệ thống tự động chuyển đổi ngày mất âm lịch sang ngày dương lịch theo từng năm (hỗ trợ năm nhuận, tháng thiếu 29 ngày) và gửi thông báo nhắc lễ trước 30, 15, 7, 3, 1 ngày.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl space-y-3 shadow-xs hover:border-cyan-500 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-cyan-100/70 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-400 flex items-center justify-center shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Quy Trình Thanh Toán & Kích Hoạt Gói</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Khách hàng chọn gói cước → chuyển khoản theo mã VietQR → bấm &quot;Tôi đã chuyển khoản&quot;. Ban Quản Trị sẽ kiểm tra sao kê ngân hàng và phê duyệt trong vòng 15-30 phút.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl space-y-3 shadow-xs hover:border-amber-500 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-amber-100/70 dark:bg-amber-950/60 text-amber-900 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Chế Độ Bảo Toàn READ_ONLY</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Khi gói cước hết hạn, toàn bộ dữ liệu gia phả, lịch sử ngày giỗ và sổ quỹ được bảo toàn vĩnh viễn ở chế độ Chỉ Đọc (READ_ONLY), tuyệt đối không bị xóa hoặc mất mát.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
