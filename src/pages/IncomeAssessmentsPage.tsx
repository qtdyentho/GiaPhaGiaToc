import React, { useState, useEffect } from 'react';
import {
  ReceiptText,
  Plus,
  CheckCircle2,
  Search,
  ArrowDownLeft,
} from 'lucide-react';
import { FundService } from '../services/FundService';
import { GenealogyService } from '../services/GenealogyService';
import {
  IncomeAssessment,
  Fund,
  IncomeCategory,
  Branch,
  Generation,
  Member,
} from '../types/database';
import { BulkAssessmentModal } from '../components/finance/BulkAssessmentModal';
import { RecordIncomeModal } from '../components/finance/RecordIncomeModal';
import { useAuth } from '../contexts/AuthContext';

export const IncomeAssessmentsPage: React.FC = () => {
  const { activeFamily } = useAuth();
  const [assessments, setAssessments] = useState<IncomeAssessment[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [recordTarget, setRecordTarget] = useState<IncomeAssessment | null>(null);

  const loadData = async () => {
    if (!activeFamily?.id) {
      setAssessments([]);
      setFunds([]);
      setCategories([]);
      setBranches([]);
      setGenerations([]);
      setMembers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const famId = activeFamily.id;
      const [asmData, fundsData, catData, treeData] = await Promise.all([
        FundService.getAssessments(famId),
        FundService.getFunds(famId),
        FundService.getIncomeCategories(famId),
        GenealogyService.getFamilyTree(famId),
      ]);
      setAssessments(asmData);
      setFunds(fundsData);
      setCategories(catData);
      setBranches(treeData.branches);
      setGenerations(treeData.generations);
      setMembers(treeData.members || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách định mức thu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeFamily?.id]);

  const totalDue = assessments.reduce((sum, a) => sum + Number(a.amount_due || 0), 0);
  const totalPaid = assessments.reduce((sum, a) => sum + Number(a.amount_paid || 0), 0);
  const totalPending = totalDue - totalPaid;

  const filteredAssessments = assessments.filter((asm) => {
    const member = members.find((m) => m.id === asm.member_id);
    const matchStatus =
      selectedStatus === 'ALL'
        ? true
        : selectedStatus === 'PAID'
        ? asm.status === 'PAID'
        : asm.status === 'PENDING' || asm.status === 'PARTIAL';
    const matchSearch =
      !search.trim() ||
      asm.title.toLowerCase().includes(search.toLowerCase()) ||
      (member?.full_name && member.full_name.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#166534] via-[#C49A3A] to-[#1E3A5F]" />
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shadow-sm">
            <ReceiptText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Định Mức Thu Phí Thành Viên
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Quản lý các đợt thu bổ phần định kỳ theo suất đinh & hộ gia đình
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsBulkModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Lập Đợt Thu Hàng Loạt</span>
        </button>
      </div>

      {/* Campaign Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Nghĩa Vụ Phải Thu</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalDue.toLocaleString()} ₫</div>
          <div className="text-xs text-slate-400 mt-0.5">{assessments.length} suất nghĩa vụ thu</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Đã Thực Thu (Vào Quỹ)</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{totalPaid.toLocaleString()} ₫</div>
          <div className="text-xs text-slate-400 mt-0.5">
            {assessments.filter((a) => a.status === 'PAID').length} thành viên đã hoàn thành
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">Còn Tồn Đọng Chưa Thu</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{totalPending.toLocaleString()} ₫</div>
          <div className="text-xs text-slate-400 mt-0.5">
            {assessments.filter((a) => a.status !== 'PAID').length} thành viên chưa nộp đủ
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên thành viên hoặc tên khoản thu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#166534] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {['ALL', 'PENDING', 'PAID'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedStatus === status
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status === 'ALL' ? 'Tất cả' : status === 'PENDING' ? 'Chưa nộp đủ' : 'Đã nộp đủ'}
            </button>
          ))}
        </div>
      </div>

      {/* Assessments List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Khoản Thu / Chiến Dịch</th>
                <th className="py-3.5 px-4">Thành Viên Phải Nộp</th>
                <th className="py-3.5 px-4 text-right">Mức Phải Nộp</th>
                <th className="py-3.5 px-4 text-right">Đã Thu</th>
                <th className="py-3.5 px-4">Hạn Nộp</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-[#166534] rounded-full animate-spin mx-auto mb-2" />
                    Đang tải danh sách định mức thu...
                  </td>
                </tr>
              ) : filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không có khoản thu nào trong danh sách
                  </td>
                </tr>
              ) : (
                filteredAssessments.map((asm) => {
                  const member = members.find((m) => m.id === asm.member_id);
                  const isPaid = asm.status === 'PAID';

                  return (
                    <tr key={asm.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{asm.title}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{member?.full_name || 'Thành viên'}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {Number(asm.amount_due).toLocaleString()} ₫
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-800">
                        {Number(asm.amount_paid).toLocaleString()} ₫
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{asm.due_date || '2026-12-31'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-900 border border-amber-300 font-bold'
                          }`}
                        >
                          {isPaid ? 'ĐÃ NỘP ĐỦ' : 'CHỜ NỘP'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!isPaid ? (
                          <button
                            onClick={() => setRecordTarget(asm)}
                            className="px-3 py-1.5 bg-[#166534] hover:bg-[#14532d] text-white font-bold rounded-xl text-xs transition shadow-xs inline-flex items-center gap-1"
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            <span>Ghi Thu Tiền</span>
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-semibold text-xs flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Đã vào quỹ</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <BulkAssessmentModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={loadData}
        funds={funds}
        categories={categories}
        branches={branches}
        generations={generations}
        familyId={activeFamily?.id}
      />

      <RecordIncomeModal
        isOpen={Boolean(recordTarget)}
        onClose={() => setRecordTarget(null)}
        onSuccess={loadData}
        assessment={recordTarget}
        funds={funds}
        familyId={activeFamily?.id}
      />
    </div>
  );
};

export default IncomeAssessmentsPage;
