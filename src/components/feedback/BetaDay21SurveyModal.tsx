import React, { useState } from 'react';
import { Award, CheckCircle2, HeartHandshake, HelpCircle } from 'lucide-react';

interface BetaDay21SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const BetaDay21SurveyModal: React.FC<BetaDay21SurveyModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [q1, setQ1] = useState<string>('YES');
  const [q2, setQ2] = useState<string>('1_TO_2M');
  const [q3, setQ3] = useState<string>('TREE_AND_LUNAR');
  const [q4, setQ4] = useState<string>('NONE');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onSubmit();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-100 text-heritage-gold rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">Khảo Sát Chất Lượng Trải Nghiệm (Day 21 Beta)</h1>
              <p className="text-xs text-slate-500">Ý kiến quý báu của Quý Dòng Họ giúp hoàn thiện nền tảng</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-heritage-green rounded-2xl mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Trân Trọng Cảm Ơn Quý Dòng Họ!</h2>
            <p className="text-xs text-slate-500">Phản hồi của Dòng Họ đã được ghi nhận vào hệ thống Trung Tâm Điều Hành Beta.</p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Question 1 */}
            <div className="space-y-2">
              <label className="font-bold text-slate-800">
                1. Nếu chương trình dùng thử kết thúc hôm nay, Gia tộc có tiếp tục sử dụng không?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'YES', label: '○ Có (Chắc chắn)' },
                  { value: 'MAYBE', label: '○ Chưa chắc chắn' },
                  { value: 'NO', label: '○ Không tiếp tục' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setQ1(opt.value)}
                    className={`p-2.5 rounded-xl border text-center font-medium transition ${
                      q1 === opt.value
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2 */}
            <div className="space-y-2">
              <label className="font-bold text-slate-800">
                2. Mức phí thường niên Gia tộc sẵn sàng chi trả để duy trì không gian số dòng họ:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { value: 'UNDER_500K', label: '< 500.000 ₫/năm' },
                  { value: '500K_1M', label: '500k – 1 triệu' },
                  { value: '1_TO_2M', label: '1 – 2 triệu / năm' },
                  { value: '2_TO_5M', label: '2 – 5 triệu / năm' },
                  { value: 'OVER_5M', label: '> 5 triệu / năm' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setQ2(opt.value)}
                    className={`p-2 rounded-xl border text-center font-medium transition ${
                      q2 === opt.value
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-800 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3 */}
            <div className="space-y-2">
              <label className="font-bold text-slate-800">
                3. Tính năng mang lại giá trị thiết thực và ý nghĩa nhất cho Dòng Họ:
              </label>
              <select
                value={q3}
                onChange={(e) => setQ3(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-heritage-green font-medium"
              >
                <option value="TREE_AND_LUNAR">Cây Phả Hệ Tương Tác & Lịch Giỗ Âm Lịch</option>
                <option value="MEMBERS">Quản Lý Danh Bạ & Thông Tin Nhân Khẩu</option>
                <option value="FINANCE">Sổ Quỹ Kế Toán Kép & Thu/Chi Minh Bạch</option>
                <option value="EVENTS">Sự Kiện & Đại Lễ Dòng Họ</option>
                <option value="ARCHIVE">Kho Tư Liệu & Hình Ảnh Di Tích Tiền Nhân</option>
              </select>
            </div>

            {/* Question 4 */}
            <div className="space-y-2">
              <label className="font-bold text-slate-800">
                4. Nếu phải BỎ BỚT 1 tính năng để đơn giản hóa giao diện, Gia tộc sẽ bỏ tính năng nào?
              </label>
              <select
                value={q4}
                onChange={(e) => setQ4(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-heritage-green font-medium"
              >
                <option value="NONE">Không bỏ tính năng nào (Toàn bộ đều cần thiết)</option>
                <option value="ARCHIVE">Kho Tư Liệu Văn Bản</option>
                <option value="EVENTS">Thông Báo Sự Kiện</option>
                <option value="PERMISSIONS">Ma Trận Phân Quyền Nâng Cao</option>
              </select>
            </div>

            <div className="pt-3 flex items-center justify-end space-x-2">
              <button onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl">
                Để Sau
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-heritage-green hover:bg-heritage-green-light text-white font-bold rounded-xl shadow-md inline-flex items-center space-x-1.5"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Gửi Phản Hồi Dòng Họ</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
