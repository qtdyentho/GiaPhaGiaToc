import React, { useState } from 'react';
import { ShieldCheck, Users, Activity, Clock, CheckCircle2, TrendingUp, AlertTriangle, FileSpreadsheet, RotateCcw, Award, ChevronRight, Search } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export const BetaControlCenterPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('fam-01');

  const betaFamilies = [
    {
      id: 'fam-01',
      name: 'Đại Tộc Nguyễn Văn (Hà Nội)',
      contactName: 'Nguyễn Văn Hoàng (Trưởng Họ)',
      phone: '0988111222',
      joinDate: '01/09/2026',
      expiryDate: '30/09/2026',
      membersCount: 86,
      ttfv1: '8m 15s',
      ttfv2: '14m 30s',
      ttfv3: '18m 45s',
      milestones: {
        login: true,
        createFamily: true,
        importMembers: true,
        buildTree: true,
        createMemorial: true,
        createFund: true,
        recordIncome: true,
        recordExpense: true,
        useReports: true,
      },
      survey: {
        continueUse: 'CÓ (Chắc chắn)',
        willingPrice: '1.000.000 – 2.000.000 ₫/năm',
        topFeature: 'Cây Gia Phả & Lịch Giỗ Âm',
        leastFeature: 'Không bỏ tính năng nào',
      }
    },
    {
      id: 'fam-02',
      name: 'Gia Tộc Trần Bá (Bắc Ninh)',
      contactName: 'Trần Bá Hùng (Trưởng Chi)',
      phone: '0988222333',
      joinDate: '02/09/2026',
      expiryDate: '01/10/2026',
      membersCount: 142,
      ttfv1: '11m 40s',
      ttfv2: '22m 10s',
      ttfv3: '25m 15s',
      milestones: {
        login: true,
        createFamily: true,
        importMembers: true,
        buildTree: true,
        createMemorial: true,
        createFund: true,
        recordIncome: true,
        recordExpense: false,
        useReports: true,
      },
      survey: {
        continueUse: 'CÓ',
        willingPrice: '500.000 – 1.000.000 ₫/năm',
        topFeature: 'Quản Lý Sổ Quỹ Kế Toán',
        leastFeature: 'Tư liệu gia tộc',
      }
    },
    {
      id: 'fam-03',
      name: 'Dòng Họ Lê Quang (Thanh Hóa)',
      contactName: 'Lê Quang Liêm (Ban Khánh Tiết)',
      phone: '0988333444',
      joinDate: '03/09/2026',
      expiryDate: '02/10/2026',
      membersCount: 199,
      ttfv1: '14m 20s',
      ttfv2: '35m 00s',
      ttfv3: '31m 10s',
      milestones: {
        login: true,
        createFamily: true,
        importMembers: true,
        buildTree: true,
        createMemorial: true,
        createFund: true,
        recordIncome: false,
        recordExpense: false,
        useReports: false,
      },
      survey: {
        continueUse: 'CHƯA CHẮC',
        willingPrice: '< 500.000 ₫/năm',
        topFeature: 'Lịch Giỗ & Nhắc Hẹn',
        leastFeature: 'Sổ quỹ kế toán',
      }
    }
  ];

  const selectedFamily = betaFamilies.find((f) => f.id === selectedFamilyId) || betaFamilies[0];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1 border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>HỆ THỐNG QUẢN TRỊ NỀN TẢNG — OFFICIAL RELEASE</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Trung Tâm Giám Sát & Quản Trị Hệ Thống Dòng Họ</h1>
          <p className="text-xs text-slate-500">Giám sát hoạt động thực tế, mức độ hài lòng và tiến độ số hóa phả hệ toàn bộ các dòng họ</p>
        </div>
      </div>

      {/* KPI Overview Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Gia Tộc Tham Gia</div>
          <div className="text-2xl font-black text-slate-900 mt-1">8 / 10</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">80% Đang Hoạt Động</div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Thành Viên Số Hóa</div>
          <div className="text-2xl font-black text-heritage-navy mt-1">427</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Trung bình 53.4 TV/họ</div>
        </div>

        <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
          <div className="text-[11px] font-bold text-emerald-800 uppercase">TTFV Trung Bình</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">11m 32s</div>
          <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">✓ Đạt mục tiêu ≤ 15m</div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Tỷ Lệ Import Thành Công</div>
          <div className="text-2xl font-black text-heritage-green mt-1">94.2%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Qua Data Import Wizard</div>
        </div>

        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
          <div className="text-[11px] font-bold text-amber-900 uppercase">Sự Cố P0 / P1</div>
          <div className="text-2xl font-black text-amber-900 mt-1">0 / 0</div>
          <div className="text-[10px] text-emerald-700 font-bold mt-0.5">✓ An toàn tuyệt đối</div>
        </div>
      </div>

      {/* 3 TTFV Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">TTFV-1: Khởi Tạo Cây Phả Hệ</span>
            <span className="text-xs font-bold text-emerald-600">8m 15s</span>
          </div>
          <p className="text-[11px] text-slate-500">Đăng ký $\rightarrow$ Khởi tạo gia tộc $\rightarrow$ Thành viên đầu tiên $\rightarrow$ Cây xuất hiện</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[85%]"></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">TTFV-2: Import Dữ Liệu Lớn</span>
            <span className="text-xs font-bold text-teal-600">14m 30s</span>
          </div>
          <p className="text-[11px] text-slate-500">Upload Excel $\rightarrow$ Auto-mapping $\rightarrow$ Validate $\rightarrow$ Preview $\rightarrow$ Commit cây</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-teal-500 h-full w-[72%]"></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">TTFV-3: Kích Hoạt Sổ Quỹ</span>
            <span className="text-xs font-bold text-indigo-600">18m 45s</span>
          </div>
          <p className="text-[11px] text-slate-500">Tạo quỹ $\rightarrow$ Khoản thu định mức $\rightarrow$ Ghi thu tiền $\rightarrow$ Sổ cái kế toán xuất hiện</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full w-[65%]"></div>
          </div>
        </div>
      </div>

      {/* Main Grid: Beta Families List & Deep Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Families List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase">Danh Sách Dòng Họ Đang Hoạt Động</h2>
            <span className="text-[11px] text-slate-400 font-semibold">{betaFamilies.length} Dòng Họ</span>
          </div>

          <div className="space-y-2">
            {betaFamilies.map((fam) => (
              <button
                key={fam.id}
                onClick={() => setSelectedFamilyId(fam.id)}
                className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                  selectedFamilyId === fam.id
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{fam.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{fam.contactName} • {fam.membersCount} TV</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Selected Family Deep Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Box 1: Adoption Milestones Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">{selectedFamily.name}</h2>
                <div className="text-xs text-slate-500">
                  Người đại diện: <strong>{selectedFamily.contactName}</strong> ({selectedFamily.phone}) • Tham gia: {selectedFamily.joinDate}
                </div>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                Trial Còn 16 Ngày
              </span>
            </div>

            {/* Milestones Grid */}
            <div>
              <div className="text-xs font-bold text-slate-700 uppercase mb-3">Mức Độ Sử Dụng Thực Tế (9 Adoption Milestones):</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {Object.entries({
                  login: 'Đã đăng nhập tài khoản',
                  createFamily: 'Đã thiết lập gia tộc',
                  importMembers: 'Đã nạp danh bạ thành viên',
                  buildTree: 'Đã dựng cây phả hệ',
                  createMemorial: 'Đã tạo ngày giỗ tiền nhân',
                  createFund: 'Đã khởi tạo 3 quỹ',
                  recordIncome: 'Đã ghi nhận thu tiền quỹ',
                  recordExpense: 'Đã duyệt phiếu chi',
                  useReports: 'Đã xem báo cáo tài chính',
                }).map(([key, label]) => {
                  const completed = (selectedFamily.milestones as any)[key];
                  return (
                    <div
                      key={key}
                      className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
                        completed
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${completed ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span className="font-semibold text-[11px] truncate">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Box 2: Willingness to Pay & Value Survey Results */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Award className="w-4 h-4 text-heritage-gold" />
              <span>Khảo Sát Mức Độ Hài Lòng & Sẵn Sàng Trả Phí (Day 21 Survey)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-500 text-[11px]">Gia tộc có tiếp tục sử dụng sau khi hết Trial?</div>
                <div className="font-bold text-emerald-700 text-sm">{selectedFamily.survey.continueUse}</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-500 text-[11px]">Mức giá dòng họ sẵn sàng chi trả hằng năm:</div>
                <div className="font-bold text-heritage-navy text-sm">{selectedFamily.survey.willingPrice}</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-500 text-[11px]">Tính năng mang lại giá trị cao nhất:</div>
                <div className="font-bold text-slate-900">{selectedFamily.survey.topFeature}</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-500 text-[11px]">Nếu phải bỏ 1 tính năng, dòng họ sẽ bỏ:</div>
                <div className="font-bold text-slate-700">{selectedFamily.survey.leastFeature}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
