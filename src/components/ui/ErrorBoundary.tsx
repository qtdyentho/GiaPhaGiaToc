import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Landmark, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Lỗi giao diện (Uncaught Error):', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 mx-auto flex items-center justify-center shadow-xs">
              <Landmark className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Tạm Thời Gián Đoạn Tải Dữ Liệu
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Hệ thống đang đồng bộ dữ liệu gia tộc mới nhất. Vui lòng bấm làm mới để tiếp tục.
              </p>
            </div>

            <button
              onClick={this.handleReload}
              className="w-full py-2.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tải Lại Trang</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
