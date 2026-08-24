import React from 'react';
import { Bell, Calendar, Wallet, CheckCircle2, Trash2 } from 'lucide-react';
import { mockNotifications } from '../services/mockData';
import { formatDate } from '../lib/utils';

export const NotificationsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Trung Tâm Thông Báo Họ Tộc</h1>
          <p className="text-xs text-slate-500">Cập nhật ngày giỗ, sự kiện, đóng quỹ và thông báo hệ thống</p>
        </div>

        <button className="text-xs font-semibold text-heritage-green hover:underline">
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {mockNotifications.map((notif) => (
          <div key={notif.id} className="p-4 hover:bg-slate-50 transition flex items-start space-x-3">
            <div className="p-2.5 bg-amber-50 text-heritage-gold rounded-xl shrink-0 mt-0.5 border border-amber-200">
              <Calendar className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-900">{notif.title}</h2>
                <span className="text-[10px] text-slate-400 font-mono">{formatDate(notif.created_at)}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
