import React from 'react';
import { ShieldAlert, ArrowUpRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Subscription } from '../../types/database';

interface SubscriptionGateProps {
  subscription?: Subscription;
  isReadOnly?: boolean;
  children: React.ReactNode;
  fallbackMessage?: string;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  subscription,
  isReadOnly = false,
  children,
  fallbackMessage = 'Tài khoản đang ở chế độ Xem (READ_ONLY). Toàn bộ dữ liệu gia phả, ngày giỗ và tài chính được bảo toàn nguyên vẹn 100%. Vui lòng gia hạn để chỉnh sửa và thêm mới.',
}) => {
  const readOnly = isReadOnly || subscription?.status === 'READ_ONLY' || subscription?.status === 'EXPIRED';

  if (readOnly) {
    return (
      <div className="space-y-4">
        {/* Read-only Alert Banner */}
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-200/80 text-amber-900 rounded-xl shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Chế Độ Bảo Toàn Dữ Liệu (READ_ONLY)
              </h3>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                {fallbackMessage}
              </p>
            </div>
          </div>

          <Link
            to="/app/billing"
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-xl transition shrink-0 shadow-xs"
          >
            <span>Gia Hạn Dịch Vụ</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Read-only disabled content wrapper */}
        <div className="pointer-events-none opacity-80 select-none">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
