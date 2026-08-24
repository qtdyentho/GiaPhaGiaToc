import React, { useState } from 'react';
import { Bell, Mail, Smartphone, Check, Clock, ShieldCheck } from 'lucide-react';

export const ReminderSettingsPage: React.FC = () => {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Cấu Hình Nhắc Lịch Giỗ & Sự Kiện</h1>
        <p className="text-xs text-slate-500">
          Tự động gửi thông báo nhắc lễ giỗ và sự kiện gia tộc theo chuẩn BR-NOTIF-001 (30 - 15 - 7 - 3 - 1 ngày)
        </p>
      </div>

      {/* Reminder Channels Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
          <Bell className="w-4 h-4 text-heritage-green" />
          <span>Kênh Tiếp Nhận Thông Báo</span>
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Thông báo qua Thư điện tử (Email)</div>
                <div className="text-[11px] text-slate-500">Gửi thư chi tiết chương trình và danh sách phân công cúng giỗ</div>
              </div>
            </div>

            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={(e) => setEmailEnabled(e.target.checked)}
              className="w-4 h-4 text-heritage-green rounded"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 text-heritage-green rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Thông báo trên Ứng dụng (In-App)</div>
                <div className="text-[11px] text-slate-500">Hiển thị quả chuông thông báo và biểu ngữ trên trang Tổng quan</div>
              </div>
            </div>

            <input
              type="checkbox"
              checked={inAppEnabled}
              onChange={(e) => setInAppEnabled(e.target.checked)}
              className="w-4 h-4 text-heritage-green rounded"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 text-purple-800 rounded-lg">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Thông báo Đẩy Di Động (Web Push)</div>
                <div className="text-[11px] text-slate-500">Nhắc tức thời trên màn hình khóa điện thoại con cháu</div>
              </div>
            </div>

            <input
              type="checkbox"
              checked={pushEnabled}
              onChange={(e) => setPushEnabled(e.target.checked)}
              className="w-4 h-4 text-heritage-green rounded"
            />
          </div>
        </div>

        {/* Milestone Schedule */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-heritage-gold" />
            <span>Mốc Thời Gian Tự Động Kích Hoạt (BR-NOTIF-001)</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            {['Trước 30 Ngày', 'Trước 15 Ngày', 'Trước 7 Ngày', 'Trước 3 Ngày', 'Trước 1 Ngày'].map((m, idx) => (
              <div key={idx} className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl">
                <div className="text-xs font-bold text-amber-950">{m}</div>
                <div className="text-[10px] text-amber-800 mt-0.5">Tự động gửi</div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          {saved && (
            <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
              <Check className="w-4 h-4" />
              <span>Đã lưu cấu hình nhắc lịch!</span>
            </span>
          )}
          <button
            onClick={handleSave}
            className="ml-auto px-5 py-2.5 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            Lưu Cấu Hình
          </button>
        </div>
      </div>
    </div>
  );
};
