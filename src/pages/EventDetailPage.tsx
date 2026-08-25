import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  ArrowLeft,
  Users,
  CheckCircle2,
  FileText,
  CreditCard,
  Building,
} from 'lucide-react';
import { EventService, EventBudgetSummary } from '../services/calendar/EventService';
import { Event } from '../types/database';
import { formatDate, formatCurrency } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeFamily } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [budgetSummary, setBudgetSummary] = useState<EventBudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const familyId = activeFamily?.id || 'fam-0000-0001';

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      const [evt, budget] = await Promise.all([
        EventService.getEventById(id, familyId),
        EventService.getEventBudgetSummary(id, familyId),
      ]);
      setEvent(evt);
      setBudgetSummary(budget);
      setLoading(false);
    }
    loadData();
  }, [id, familyId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
        Đang tải thông tin chi tiết sự kiện...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 space-y-3">
        <div>Không tìm thấy sự kiện họ tộc yêu cầu</div>
        <Link to="/app/events" className="text-heritage-green font-bold hover:underline">
          Quay lại danh sách sự kiện
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        to="/app/events"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-heritage-green transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách sự kiện</span>
      </Link>

      {/* Main Event Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {event.event_type}
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-2">{event.title}</h1>
          </div>
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">DƯƠNG LỊCH</span>
            <div className="font-bold text-slate-800 text-sm">{formatDate(event.solar_date)}</div>
            <div className="text-[11px] text-slate-500">Giờ khai mạc: {event.solar_time || '08:00'}</div>
          </div>

          <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 space-y-1">
            <span className="text-[10px] text-amber-800 font-bold uppercase">ÂM LỊCH VIỆT NAM</span>
            <div className="font-bold text-amber-950 text-sm">
              Ngày {event.lunar_day || 15}/{event.lunar_month || 1} {event.is_leap_month ? '(Nhuận)' : ''}
            </div>
            <div className="text-[11px] text-amber-700">Năm {event.lunar_year || 2026}</div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">ĐỊA ĐIỂM</span>
            <div className="font-bold text-slate-800 text-xs truncate">{event.location || 'Từ đường gia tộc'}</div>
            <div className="text-[11px] text-slate-500">Quy mô: Toàn gia tộc</div>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-700">Chương Trình & Kế Hoạch Tổ Chức</h3>
            <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}
      </div>

      {/* Event Budget & Financial Integration (BR-EVENT-004) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-heritage-green">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Ngân Sách & Quyết Toán Sự Kiện</h2>
              <p className="text-[11px] text-slate-500">Trích xuất trực tiếp từ sổ quỹ dòng họ</p>
            </div>
          </div>

          <Link
            to="/app/finance/ledger"
            className="text-xs font-semibold text-heritage-green hover:underline flex items-center space-x-1"
          >
            <span>Xem Sổ Quỹ</span>
          </Link>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">DỰ TOÁN NGÂN SÁCH</span>
            <strong className="text-base font-black text-slate-900 mt-1 block">
              {formatCurrency(budgetSummary?.estimatedBudget || 0)}
            </strong>
          </div>

          <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-100">
            <span className="text-[11px] text-rose-800 font-medium block">THỰC TẾ ĐÃ CHI QUA QUỸ</span>
            <strong className="text-base font-black text-rose-900 mt-1 block">
              {formatCurrency(budgetSummary?.spentAmount || 0)}
            </strong>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-100">
            <span className="text-[11px] text-emerald-800 font-medium block">SỐ DƯ DỰ TOÁN CÒN LẠI</span>
            <strong className="text-base font-black text-emerald-900 mt-1 block">
              {formatCurrency(budgetSummary?.remainingBudget || 0)}
            </strong>
          </div>
        </div>

        {/* Transactions list */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-slate-700">Các Khoản Chi Trực Tiếp Thuộc Sự Kiện</h4>
          {budgetSummary?.transactions.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
              Chưa có phiếu chi thực tế nào được giải ngân cho sự kiện này
            </div>
          ) : (
            <div className="space-y-1.5">
              {budgetSummary?.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800">{tx.description || 'Chi phí tổ chức sự kiện'}</div>
                    <div className="text-[10px] text-slate-400">
                      Mã GD: {tx.transaction_code} — Ngày: {tx.transaction_date}
                    </div>
                  </div>

                  <span className="font-bold text-rose-600">
                    -{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
