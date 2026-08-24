import React, { useState } from 'react';
import { Check, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { mockPlans } from '../services/mockData';
import { Link } from 'react-router-dom';

export const PricingPage: React.FC = () => {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <div className="py-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 bg-emerald-100 text-heritage-green font-semibold text-xs px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Biểu Phí Thuê Bao Chuẩn Hóa</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Chọn Gói Phù Hợp Cho Dòng Tộc Của Bạn
        </h1>
        <p className="text-sm text-slate-500">
          Khởi tạo và số hóa gia phả, quản lý lịch giỗ tổ tiên và minh bạch sổ quỹ toàn diện.
        </p>

        {/* Monthly / Yearly Toggle */}
        <div className="pt-4 flex items-center justify-center space-x-3">
          <span className={`text-xs font-semibold ${!isYearly ? 'text-slate-900' : 'text-slate-400'}`}>
            Thanh toán theo tháng
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="w-12 h-6 bg-heritage-navy p-0.5 rounded-full relative transition flex items-center"
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                isYearly ? 'translate-x-6' : 'translate-x-0'
              }`}
            ></div>
          </button>
          <span className={`text-xs font-semibold ${isYearly ? 'text-slate-900' : 'text-slate-400'} flex items-center space-x-1`}>
            <span>Thanh toán theo năm</span>
            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
              Tiết kiệm 20%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {mockPlans.map((plan) => {
          const isFeatured = plan.code === 'GIA_TOC';
          const price = isYearly
            ? plan.code === 'FREE'
              ? 0
              : plan.code === 'FAMILY'
              ? 490000
              : plan.code === 'GIA_TOC'
              ? 990000
              : plan.code === 'DONG_HO'
              ? 1990000
              : 4990000
            : plan.code === 'FREE'
            ? 0
            : plan.code === 'FAMILY'
            ? 49000
            : plan.code === 'GIA_TOC'
            ? 99000
            : plan.code === 'DONG_HO'
            ? 199000
            : 499000;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-5 flex flex-col justify-between transition relative ${
                isFeatured
                  ? 'bg-heritage-navy text-white shadow-heritage-hover border-2 border-heritage-gold scale-105 z-10'
                  : 'bg-white text-slate-800 border border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              {isFeatured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-heritage-gold text-slate-900 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                  Phổ biến nhất
                </div>
              )}

              <div>
                <div className="text-sm font-bold">{plan.name}</div>
                <div className={`text-xs mt-1 ${isFeatured ? 'text-slate-300' : 'text-slate-500'}`}>
                  {plan.short_description}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200/20">
                  <div className="text-2xl font-black">
                    {formatCurrency(price)}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${isFeatured ? 'text-amber-300' : 'text-slate-400'}`}>
                    {isYearly ? '/ năm' : '/ tháng'}
                  </div>
                </div>

                <ul className="mt-4 space-y-2 text-xs">
                  <li className="flex items-center space-x-2">
                    <Check className={`w-3.5 h-3.5 shrink-0 ${isFeatured ? 'text-amber-300' : 'text-heritage-green'}`} />
                    <span>
                      {plan.code === 'FREE'
                        ? 'Tối đa 30 thành viên'
                        : plan.code === 'FAMILY'
                        ? 'Tối đa 100 thành viên'
                        : plan.code === 'GIA_TOC'
                        ? 'Tối đa 300 thành viên'
                        : plan.code === 'DONG_HO'
                        ? 'Tối đa 1000 thành viên'
                        : 'Không giới hạn thành viên'}
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className={`w-3.5 h-3.5 shrink-0 ${isFeatured ? 'text-amber-300' : 'text-heritage-green'}`} />
                    <span>Lịch âm & Ngày giỗ</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className={`w-3.5 h-3.5 shrink-0 ${isFeatured ? 'text-amber-300' : 'text-heritage-green'}`} />
                    <span>Sổ quỹ kế toán kép</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4">
                <Link
                  to="/app/billing/checkout"
                  className={`w-full py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition ${
                    isFeatured
                      ? 'bg-heritage-gold hover:bg-heritage-gold-light text-slate-950 shadow'
                      : 'bg-heritage-green hover:bg-heritage-green-light text-white'
                  }`}
                >
                  <span>Chọn gói này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
