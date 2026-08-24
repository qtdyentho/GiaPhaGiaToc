import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  HardDrive,
  Users,
  GitBranch,
  Calendar,
  FileText,
  Download,
} from 'lucide-react';
import { UsageService, FeatureUsageSummary } from '../services/billing/UsageService';
import { Link } from 'react-router-dom';

export const UsageDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<FeatureUsageSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await UsageService.getUsageSummary('fam-0000-0001');
      setMetrics(data);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span>Đo Lường Hạn Mức & Tài Nguyên Gia Tộc</span>
            <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              Gói Gia Tộc
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Giám sát mức độ sử dụng thành viên, dung lượng lưu trữ, sự kiện và lượt xuất báo cáo
          </p>
        </div>

        <Link
          to="/pricing"
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-xl transition shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>Nâng Cấp Hạn Mức</span>
        </Link>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m) => {
          const isNearLimit = m.level === 'NEAR_LIMIT' || m.level === 'LIMIT_REACHED';

          return (
            <div
              key={m.featureCode}
              className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between transition ${
                isNearLimit ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{m.featureName}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      m.level === 'LIMIT_REACHED'
                        ? 'bg-rose-100 text-rose-800'
                        : m.level === 'NEAR_LIMIT'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {m.percentage}% Đã Dùng
                  </span>
                </div>

                <div className="mt-3 flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-slate-900">{m.currentUsage}</span>
                  <span className="text-xs text-slate-500 font-medium">
                    / {m.limitValue !== null ? `${m.limitValue} ${m.unit}` : 'Không giới hạn'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      m.level === 'LIMIT_REACHED'
                        ? 'bg-rose-500'
                        : m.level === 'NEAR_LIMIT'
                        ? 'bg-amber-500'
                        : 'bg-heritage-green'
                    }`}
                    style={{ width: `${Math.min(100, m.percentage)}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">
                  {m.limitValue !== null
                    ? `Còn lại: ${Math.max(0, m.limitValue - m.currentUsage)} ${m.unit}`
                    : 'Không hạn chế'}
                </span>

                {isNearLimit && (
                  <Link
                    to="/pricing"
                    className="text-amber-700 font-bold hover:underline flex items-center space-x-0.5"
                  >
                    <span>Mở rộng</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
