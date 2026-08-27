import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Wallet, CheckCircle2, Trash2, Filter, AlertCircle, Info, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../lib/utils';

interface NotificationItem {
  id: string;
  family_id?: string;
  type: 'MEMORIAL_REMINDER' | 'EVENT_REMINDER' | 'PAYMENT_DUE' | 'EXPENSE_APPROVAL_REQUEST' | 'TRANSACTION_POSTED' | 'SYSTEM';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const NotificationsPage: React.FC = () => {
  const { activeFamily, user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'CALENDAR' | 'FINANCE'>('ALL');

  useEffect(() => {
    // Generate clean localized notifications for the active family
    const familyName = activeFamily?.name || 'Gia Tộc';
    const initialNotifs: NotificationItem[] = [
      {
        id: `notif-1-${activeFamily?.id || 'gen'}`,
        family_id: activeFamily?.id,
        type: 'SYSTEM',
        title: `Chào mừng bạn đến với Không Gian Số ${familyName}`,
        message: `Hệ thống đã sẵn sàng hỗ trợ khởi tạo Cây Gia Phả, thiết lập Mã QR Từ Đường và minh bạch Sổ Quỹ dòng họ.`,
        is_read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: `notif-2-${activeFamily?.id || 'gen'}`,
        family_id: activeFamily?.id,
        type: 'MEMORIAL_REMINDER',
        title: 'Tự động nhắc lịch giỗ tổ tiên âm lịch',
        message: 'Hệ thống tự động chuyển đổi ngày âm sang dương lịch và gửi thông báo nhắc lễ trước 7 ngày.',
        is_read: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: `notif-3-${activeFamily?.id || 'gen'}`,
        family_id: activeFamily?.id,
        type: 'TRANSACTION_POSTED',
        title: 'Sổ Quỹ Bất Biến & Minh Bạch',
        message: 'Mọi khoản đóng góp công đức và chi tiêu giỗ chạp đều được ghi nhận vào sổ cái kép.',
        is_read: true,
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    setNotifications(initialNotifs);
  }, [activeFamily?.id, activeFamily?.name]);

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
    if (filter === 'CALENDAR') return notif.type === 'MEMORIAL_REMINDER' || notif.type === 'EVENT_REMINDER';
    if (filter === 'FINANCE') return notif.type === 'PAYMENT_DUE' || notif.type === 'EXPENSE_APPROVAL_REQUEST' || notif.type === 'TRANSACTION_POSTED';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getIcon = (type?: string) => {
    switch (type) {
      case 'PAYMENT_DUE':
      case 'EXPENSE_APPROVAL_REQUEST':
      case 'TRANSACTION_POSTED':
        return <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'MEMORIAL_REMINDER':
      case 'EVENT_REMINDER':
        return <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Trung Tâm Thông Báo Họ Tộc</span>
            {unreadCount > 0 && (
              <span className="text-xs bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                {unreadCount} Chưa đọc
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cập nhật ngày giỗ tổ tiên, sự kiện chi phái, thông báo thu chi quỹ họ và tin tức gia tộc
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs font-semibold text-[#166534] dark:text-emerald-400 hover:underline flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-medium overflow-x-auto">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl transition ${
            filter === 'ALL'
              ? 'bg-[#166534] text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Tất Cả ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-xl transition ${
            filter === 'UNREAD'
              ? 'bg-[#166534] text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Chưa Đọc ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('CALENDAR')}
          className={`px-3 py-1.5 rounded-xl transition ${
            filter === 'CALENDAR'
              ? 'bg-[#166534] text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Ngày Giỗ & Sự Kiện
        </button>
        <button
          onClick={() => setFilter('FINANCE')}
          className={`px-3 py-1.5 rounded-xl transition ${
            filter === 'FINANCE'
              ? 'bg-[#166534] text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Sổ Quỹ & Đóng Góp
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 transition flex items-start justify-between gap-3 ${
                notif.is_read 
                  ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50' 
                  : 'bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div
                  className={`p-2.5 rounded-xl shrink-0 mt-0.5 border ${
                    notif.type === 'PAYMENT_DUE' || notif.type === 'EXPENSE_APPROVAL_REQUEST' || notif.type === 'TRANSACTION_POSTED'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
                      : notif.type === 'MEMORIAL_REMINDER' || notif.type === 'EVENT_REMINDER'
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800'
                      : 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800'
                  }`}
                >
                  {getIcon(notif.type)}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className={`text-xs ${notif.is_read ? 'font-semibold text-slate-800 dark:text-slate-200' : 'font-bold text-slate-900 dark:text-white'}`}>
                      {notif.title}
                    </h2>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block pt-0.5">
                    {formatDate(notif.created_at)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 opacity-80 hover:opacity-100">
                <button
                  onClick={() => handleToggleRead(notif.id)}
                  title={notif.is_read ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                  className="p-1.5 text-slate-400 hover:text-[#166534] dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(notif.id)}
                  title="Xóa thông báo"
                  className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">Không có thông báo nào trong mục này</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Các thông báo mới về ngày giỗ và tài chính sẽ hiển thị tại đây</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
