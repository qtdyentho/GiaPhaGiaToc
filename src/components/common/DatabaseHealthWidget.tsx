import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Zap, Globe, Clock } from 'lucide-react';
import { DatabaseKeepAliveService, KeepAliveStatus } from '../../services/DatabaseKeepAliveService';

export const DatabaseHealthWidget: React.FC = () => {
  const [status, setStatus] = useState<KeepAliveStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pingSuccess, setPingSuccess] = useState<boolean>(false);

  const handlePing = async () => {
    setIsLoading(true);
    setPingSuccess(false);
    try {
      const res = await DatabaseKeepAliveService.pingDatabase();
      setStatus(res);
      setPingSuccess(true);
      setTimeout(() => setPingSuccess(false), 4000);
    } catch {
      // Handled in service
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Lấy status ban đầu
    DatabaseKeepAliveService.pingDatabase().then(setStatus);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Bảo Vệ CSDL 24/7 (Keep-Alive Guard)
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cơ chế tự động đánh thức CSDL Supabase định kỳ, chống tạm dừng (Auto-Pause)
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handlePing}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Đang Đánh Thức...' : 'Đánh Thức CSDL Ngay'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Độ Trễ Phản Hồi</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-lg font-black text-slate-900 dark:text-white">
              {status ? `${status.latencyMs} ms` : '...'}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Tức thì</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Lần Kiểm Tra Gần Nhất</span>
          </div>
          <div className="mt-1.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {status?.lastPingAt ? new Date(status.lastPingAt).toLocaleTimeString('vi-VN') : 'Vừa xong'}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
            <span>Nền Tảng CSDL</span>
          </div>
          <div className="mt-1.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
              {status?.databaseProvider || 'Supabase PostgreSQL'}
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {pingSuccess && (
        <div className="mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>CSDL Supabase đã được đánh thức thành công! Bộ đếm thời gian 7 ngày tạm dừng đã được đặt lại.</span>
        </div>
      )}

      {/* Auto Channels List */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#166534] dark:text-emerald-400" />
          <span>3 Tầng Tự Động Đánh Thức Đang Kích Hoạt 24/7:</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>1. GitHub Actions (Mỗi 6h)</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>2. Vercel Cron (02:00 UTC)</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>3. Client Heartbeat (Mỗi phiên)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
