import React, { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { EventBroadcastToast } from '../notifications/EventBroadcastToast';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { PageSkeleton } from '../ui/PageSkeleton';

export const AppLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-heritage-bg dark:bg-slate-950 font-sans transition-colors duration-200 text-slate-800 dark:text-slate-100">
      {/* Sidebar */}
      <AppSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Area with Dynamic Left Padding */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <AppHeader
          onMenuToggle={() => setIsMobileSidebarOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto animate-fade-in outline-none focus:ring-0"
        >
          <ErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* 🔔 Thông Báo Đẩy Sự Kiện Quan Trọng Dòng Họ Kèm Đếm Ngược 5s */}
      <EventBroadcastToast />
    </div>
  );
};

export default AppLayout;
