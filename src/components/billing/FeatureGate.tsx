import React from 'react';
import { Lock, Sparkles, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureGateProps {
  featureCode: string;
  featureName: string;
  requiredPlanName?: string;
  isEnabled: boolean;
  children: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  featureCode,
  featureName,
  requiredPlanName = 'Gói Gia Tộc',
  isEnabled,
  children,
}) => {
  if (!isEnabled) {
    return (
      <div className="relative border border-slate-200 rounded-2xl overflow-hidden p-6 bg-slate-50/50">
        <div className="flex flex-col items-center justify-center text-center space-y-3 py-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center shadow-xs">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Tính năng {featureName}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mt-1">
              Tính năng cao cấp này chỉ khả dụng từ <strong className="text-slate-800">{requiredPlanName}</strong> trở lên.
            </p>
          </div>

          <Link
            to="/pricing"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-xl transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nâng Cấp Gói Để Mở Khóa</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
