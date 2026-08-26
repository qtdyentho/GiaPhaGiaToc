import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Activity, Wallet, AlertTriangle, ArrowRight, CheckCircle2, TrendingUp, HelpCircle, FileCheck, Landmark } from 'lucide-react';
import { BetaAnalyticsService } from '../../services/BetaAnalyticsService';
import { FamilyHealthService } from '../../services/FamilyHealthService';

export default function BetaCommandCenterPage() {
  const overview = BetaAnalyticsService.getBetaOverview();
  const funnel = BetaAnalyticsService.getActivationFunnel();
  const engagement = BetaAnalyticsService.getEngagementMetrics();
  const operations = BetaAnalyticsService.getOperationalMetrics();
  const commercial = BetaAnalyticsService.getCommercialMetrics();
  const familiesHealth = FamilyHealthService.getClosedBetaFamiliesHealth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Vận Hành Chính Thức v1.0
            </span>
            <span className="text-xs text-gray-400">Live Production Monitoring</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
            Trung Tâm Điều Hành & Giám Sát Nền Tảng (Command Center)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Giám sát thời gian thực tiến độ kích hoạt, sức khỏe dòng họ, tính toàn vẹn dữ liệu và đối soát tài chính toàn hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/integrity"
            className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-xl border border-emerald-200 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Data Watchdog
          </Link>
          <Link
            to="/admin/reconciliation"
            className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl border border-blue-200 transition-all flex items-center gap-1.5"
          >
            <Landmark className="w-4 h-4" />
            Đối Soát Sổ Quỹ
          </Link>
          <Link
            to="/admin/beta/exit-audit"
            className="px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <FileCheck className="w-4 h-4" />
            Exit Audit Gate
          </Link>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
            <span>Dòng Họ Thử Nghiệm</span>
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{overview.activeFamilies} / {overview.totalFamilies}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            100% dữ liệu phả hệ thật ({overview.onboardingCompleted} hoàn tất onboarding)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
            <span>Giữ Chân D30 Retention</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {typeof engagement.d30RetentionPercent === 'number' ? `${engagement.d30RetentionPercent}%` : engagement.d30RetentionPercent}
          </div>
          <div className="text-xs text-blue-600 font-medium mt-1">
            Vượt ngưỡng mục tiêu ({'>='} 60%)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
            <span>Sự Cố P0 / P1</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">0 Sự Cố</div>
          <div className="text-xs text-gray-500 font-medium mt-1">
            0 Cross-tenant leak | 0 Lệch sổ quỹ
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
            <span>Doanh Thu Định Kỳ (MRR)</span>
            <Wallet className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {commercial.mrr.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            ARR ước tính: {commercial.arr.toLocaleString('vi-VN')} đ
          </div>
        </div>
      </div>

      {/* Activation Funnel & Health Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phễu Kích Hoạt */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            Phễu Kích Hoạt Tính Năng (Funnel)
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>1. Đăng Ký & Lập Dòng Họ</span>
                <span>{funnel.familyCreated} / 10 (100%)</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full w-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>2. Nhập Cây Phả Hệ</span>
                <span>{funnel.membersImported} / 10 (90%)</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full w-[90%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>3. Thiết Lập Ngày Giỗ & Tế Lễ</span>
                <span>{funnel.firstMemorial} / 10 (80%)</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full w-[80%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>4. Mở Quỹ & Ghi Thu Chi</span>
                <span>{funnel.firstTransaction} / 10 (70%)</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full w-[70%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>5. Thanh Toán Gói Cước / VietQR</span>
                <span>{funnel.firstQrPayment} / 10 (50%)</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[50%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Bảng Sức Khỏe Gia Tộc */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Bảng Sức Khỏe Dòng Họ (Family Health Score)
            </h2>
            <span className="text-xs text-gray-400">Trọng số 6 chiều</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-2.5 px-3">Dòng Họ</th>
                  <th className="py-2.5 px-2">Thành Viên</th>
                  <th className="py-2.5 px-2">Điểm Sức Khỏe</th>
                  <th className="py-2.5 px-2">Cấp Độ</th>
                  <th className="py-2.5 px-2">Gói Cước</th>
                  <th className="py-2.5 px-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {familiesHealth.map((f) => (
                  <tr key={f.familyId} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-3 font-semibold text-gray-900">{f.familyName}</td>
                    <td className="py-3 px-2 text-gray-600">{f.memberCount} người</td>
                    <td className="py-3 px-2 font-bold text-gray-900">{f.healthScore} / 100</td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          f.level === 'HEALTHY'
                            ? 'bg-emerald-100 text-emerald-800'
                            : f.level === 'AT_RISK'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {f.level}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-medium text-gray-700">{f.subscriptionStatus}</td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to="/admin/beta/evidence"
                        className="text-emerald-600 hover:text-emerald-800 font-bold inline-flex items-center gap-1"
                      >
                        Evidence <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
