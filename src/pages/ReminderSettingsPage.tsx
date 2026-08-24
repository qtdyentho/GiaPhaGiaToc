import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Shield,
  Smartphone,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { ReminderService, ClanNotification, EventReminderConfig } from '../services/calendar/ReminderService';

export const ReminderSettingsPage: React.FC = () => {
  const [configs, setConfigs] = useState<EventReminderConfig[]>([]);
  const [notifications, setNotifications] = useState<ClanNotification[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const loadData = async () => {
    const [cfgList, notifList] = await Promise.all([
      ReminderService.getReminderConfigs('fam-0000-0001'),
      ReminderService.getNotifications('fam-0000-0001'),
    ]);
    setConfigs(cfgList);
    setNotifications(notifList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (id: string, currentVal: boolean) => {
    await ReminderService.toggleReminderConfig(id, !currentVal);
    loadData();
  };

  const handleScanNow = async () => {
    setIsScanning(true);
    setScanMessage(null);
    const count = await ReminderService.generateDailyReminders('fam-0000-0001');
    setIsScanning(false);
    setScanMessage(`Đã quét toàn bộ lịch gia tộc: Tạo mới ${count} thông báo nhắc lễ hôm nay.`);
    loadData();
  };

  const handleMarkAsRead = async (notifId: string) => {
    await ReminderService.markAsRead(notifId, 'fam-0000-0001');
    loadData();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span>Cấu Hình Nhắc Lịch & Thông Báo Lễ Giỗ</span>
            <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              Tự Động Nhắc Lễ
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Tự động gửi thông báo nhắc lễ giỗ và đại lễ theo các mốc thời gian đã cài đặt
          </p>
        </div>

        <button
          onClick={handleScanNow}
          disabled={isScanning}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-xl transition shadow-sm disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{isScanning ? 'Đang Quét...' : 'Quét & Nhắc Lịch Ngay'}</span>
        </button>
      </div>

      {scanMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-heritage-green shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Reminder Milestones */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-heritage-green" />
          <span>Các Mốc Thời Gian Nhắc Nhở Tự Động (Days Before)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {configs.map((cfg) => (
            <div
              key={cfg.id}
              className={`p-4 rounded-xl border flex items-center justify-between transition ${
                cfg.enabled
                  ? 'bg-amber-50/50 border-amber-300'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-slate-800">
                  Trước {cfg.days_before} ngày
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Kênh: {cfg.channel === 'IN_APP' ? 'Chuông thông báo App' : cfg.channel}
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={cfg.enabled}
                  onChange={() => handleToggle(cfg.id, cfg.enabled)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-heritage-green"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Notifications Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Bell className="w-4 h-4 text-amber-600" />
            <span>Hộp Thư Thông Báo & Nhắc Lễ ({notifications.length})</span>
          </h2>
        </div>

        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                n.is_read
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-amber-50/80 border-amber-300 shadow-xs'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">{n.title}</span>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{n.content}</p>
                <div className="text-[10px] text-slate-400">
                  {new Date(n.created_at).toLocaleString('vi-VN')}
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 text-xs font-semibold rounded-lg hover:bg-amber-100 transition shrink-0"
                >
                  Đã đọc
                </button>
              )}
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              Chưa có thông báo nào trong hệ thống
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
