import React, { useState } from 'react';
import { Bell, Calendar, Wallet, CheckCircle2, Trash2, Filter, AlertCircle, Info, Check } from 'lucide-react';
import { mockNotifications } from '../services/mockData';
import { formatDate } from '../lib/utils';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'CALENDAR' | 'FINANCE'>('ALL');

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: !n.is_read } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'UNREAD') return !notif.is_read;
    if (filter === 'CALENDAR') return notif.type === 'MEMORIAL' || notif.type === 'EVENT';
    if (filter === 'FINANCE') return notif.type === 'FINANCE' || notif.type === 'CONTRIBUTION';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getIcon = (type?: string) => {
    switch (type) {
      case 'FINANCE':
      case 'CONTRIBUTION':
        return <Wallet className="w-4 h-4 text-emerald-600" />;
      case 'MEMORIAL':
      case 'EVENT':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-sky-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>Trung Tâm Thông Báo Họ Tộc</span>
            {unreadCount > 0 && (
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                {unreadCount} Chưa đọc
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500">
            Cập nhật ngày giỗ tổ tiên, sự kiện chi phái, thông báo thu chi quỹ họ và tin tức gia tộc
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs font-semibold text-[#166534] hover:underline flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-medium overflow-x-auto">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl transition ${
            filter === 'ALL'
              ? 'bg-[#166534] text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất Cả ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-xl transition ${
            filter === 'UNREAD'
              ? 'bg-[#166534] text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Chưa Đọc ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('CALENDAR')}
          className={`px-3 py-1.5 rounded-xl transition ${
            filter === 'CALENDAR'
              ? 'bg-[#166534] text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Ngày Giỗ & Sự Kiện
        </button>
        <button
          onClick={() => setFilter('FINANCE')}
          className={`px-3 py-1.5 rounded-xl transition ${
            filter === 'FINANCE'
              ? 'bg-[#166534] text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Sổ Quỹ & Đóng Góp
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 transition flex items-start justify-between gap-3 ${
                notif.is_read ? 'bg-white hover:bg-slate-50' : 'bg-emerald-50/40 hover:bg-emerald-50/70'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div
                  className={`p-2.5 rounded-xl shrink-0 mt-0.5 border ${
                    notif.type === 'FINANCE'
                      ? 'bg-emerald-50 border-emerald-200'
                      : notif.type === 'MEMORIAL'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-sky-50 border-sky-200'
                  }`}
                >
                  {getIcon(notif.type)}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className={`text-xs ${notif.is_read ? 'font-semibold text-slate-800' : 'font-bold text-slate-900'}`}>
                      {notif.title}
                    </h2>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 block pt-0.5">
                    {formatDate(notif.created_at)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 opacity-80 hover:opacity-100">
                <button
                  onClick={() => handleToggleRead(notif.id)}
                  title={notif.is_read ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                  className="p-1.5 text-slate-400 hover:text-[#166534] hover:bg-slate-100 rounded-lg transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(notif.id)}
                  title="Xóa thông báo"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">Không có thông báo nào trong mục này</p>
            <p className="text-[11px] text-slate-400">Các thông báo mới về ngày giỗ và tài chính sẽ hiển thị tại đây</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

