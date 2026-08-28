import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleGuard } from './components/auth/RoleGuard';
import { AppLayout } from './components/layout/AppLayout';
import { PageSkeleton } from './components/ui/PageSkeleton';

import { ScrollToTop } from './components/ui/ScrollToTop';

/**
 * Trình nạp Lazy Component tự phục hồi:
 * - Khắc phục triệt để lỗi màn hình trắng khi chuyển trang trên SPA
 * - Tự động nhận diện cả default export lẫn named export
 * - Tự động tải lại chunk mới khi Vercel deploy bản cập nhật
 */
function lazyRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<any>,
  name?: string
) {
  return lazy(async () => {
    try {
      const module = await factory();
      if (name && module[name]) {
        return { default: module[name] };
      }
      if (module.default) {
        return { default: module.default };
      }
      const firstExportKey = Object.keys(module).find(
        (k) => typeof module[k] === 'function' || (typeof module[k] === 'object' && module[k] !== null)
      );
      if (firstExportKey && module[firstExportKey]) {
        return { default: module[firstExportKey] };
      }
      return module;
    } catch (error: any) {
      console.warn('[ChunkLoader] Lỗi nạp mô-đun trang động:', error);
      const isChunkError =
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('Importing a module script failed') ||
        error?.name === 'ChunkLoadError';

      if (isChunkError && typeof window !== 'undefined') {
        const lastReloadKey = 'hl_last_chunk_reload';
        const lastReloadTime = Number(sessionStorage.getItem(lastReloadKey) || 0);
        const now = Date.now();
        if (now - lastReloadTime > 10000) {
          sessionStorage.setItem(lastReloadKey, String(now));
          window.location.reload();
          return new Promise(() => {});
        }
      }
      throw error;
    }
  });
}

// ─── Public Pages (Lazy Loaded with Auto-Retry) ────────────────────────────────
const LandingPage = lazyRetry(() => import('./pages/LandingPage'), 'LandingPage');
const PricingPage = lazyRetry(() => import('./pages/PricingPage'), 'PricingPage');
const HelpPage = lazyRetry(() => import('./pages/HelpPage'), 'HelpPage');
const LoginPage = lazyRetry(() => import('./pages/LoginPage'), 'LoginPage');
const RegisterPage = lazyRetry(() => import('./pages/RegisterPage'), 'RegisterPage');
const InviteRegisterPage = lazyRetry(() => import('./pages/InviteRegisterPage'), 'InviteRegisterPage');
const ClanPassUnlockPage = lazyRetry(() => import('./pages/ClanPassUnlockPage'), 'ClanPassUnlockPage');
const ShortLinkRedirectPage = lazyRetry(() => import('./pages/ShortLinkRedirectPage'), 'ShortLinkRedirectPage');
const DevTestLoginPage = lazyRetry(() => import('./pages/DevTestLoginPage'), 'DevTestLoginPage');

// ─── Onboarding & Core Family Pages (Lazy Loaded with Auto-Retry) ──────────────
const CreateFamilyPage = lazyRetry(() => import('./pages/CreateFamilyPage'), 'CreateFamilyPage');
const DashboardPage = lazyRetry(() => import('./pages/DashboardPage'), 'DashboardPage');
const GenealogyTreePage = lazyRetry(() => import('./pages/GenealogyTreePage'), 'GenealogyTreePage');
const MembersListPage = lazyRetry(() => import('./pages/MembersListPage'), 'MembersListPage');
const KinshipCalculatorPage = lazyRetry(() => import('./pages/KinshipCalculatorPage'), 'KinshipCalculatorPage');
const MemberProfilePage = lazyRetry(() => import('./pages/MemberProfilePage'), 'MemberProfilePage');
const FamilyCalendarPage = lazyRetry(() => import('./pages/FamilyCalendarPage'), 'FamilyCalendarPage');
const MemorialsPage = lazyRetry(() => import('./pages/MemorialsPage'), 'MemorialsPage');
const EventListPage = lazyRetry(() => import('./pages/EventListPage'), 'EventListPage');
const EventDetailPage = lazyRetry(() => import('./pages/EventDetailPage'), 'EventDetailPage');
const ReminderSettingsPage = lazyRetry(() => import('./pages/ReminderSettingsPage'), 'ReminderSettingsPage');
const ClanIntroductionPage = lazyRetry(() => import('./pages/ClanIntroductionPage'), 'ClanIntroductionPage');
const ClanChroniclesPage = lazyRetry(() => import('./pages/ClanChroniclesPage'), 'ClanChroniclesPage');
const ClanChronicleDetailPage = lazyRetry(() => import('./pages/ClanChronicleDetailPage'), 'ClanChronicleDetailPage');

// ─── Finance Pages (Lazy Loaded with Auto-Retry) ───────────────────────────────
const FinanceDashboardPage = lazyRetry(() => import('./pages/FinanceDashboardPage'), 'FinanceDashboardPage');
const FundLedgerPage = lazyRetry(() => import('./pages/FundLedgerPage'), 'FundLedgerPage');
const IncomeAssessmentsPage = lazyRetry(() => import('./pages/IncomeAssessmentsPage'), 'IncomeAssessmentsPage');
const ExpensesPage = lazyRetry(() => import('./pages/ExpensesPage'), 'ExpensesPage');
const ContributionsPage = lazyRetry(() => import('./pages/ContributionsPage'), 'ContributionsPage');
const HonorRollPage = lazyRetry(() => import('./pages/HonorRollPage'), 'HonorRollPage');

// ─── Billing & Settings Pages (Lazy Loaded with Auto-Retry) ────────────────────
const BillingOverviewPage = lazyRetry(() => import('./pages/BillingOverviewPage'), 'BillingOverviewPage');
const UsageDashboardPage = lazyRetry(() => import('./pages/UsageDashboardPage'), 'UsageDashboardPage');
const InvoicesPage = lazyRetry(() => import('./pages/InvoicesPage'), 'InvoicesPage');
const CheckoutPage = lazyRetry(() => import('./pages/CheckoutPage'), 'CheckoutPage');
const SupportCenterPage = lazyRetry(() => import('./pages/SupportCenterPage'), 'SupportCenterPage');
const NotificationsPage = lazyRetry(() => import('./pages/NotificationsPage'), 'NotificationsPage');
const FamilySettingsPage = lazyRetry(() => import('./pages/FamilySettingsPage'), 'FamilySettingsPage');
const PermissionsPage = lazyRetry(() => import('./pages/PermissionsPage'), 'PermissionsPage');
const AuditLogsPage = lazyRetry(() => import('./pages/AuditLogsPage'), 'AuditLogsPage');

// ─── Super Admin Pages (Lazy Loaded with Auto-Retry) ───────────────────────────
const BetaCommandCenterPage = lazyRetry(() => import('./pages/admin/BetaCommandCenterPage'), 'BetaCommandCenterPage');
const AdminUsersPage = lazyRetry(() => import('./pages/admin/AdminUsersPage'), 'AdminUsersPage');
const AdminPaymentsPage = lazyRetry(() => import('./pages/admin/AdminPaymentsPage'), 'AdminPaymentsPage');
const AdminBillingConfigPage = lazyRetry(() => import('./pages/admin/AdminBillingConfigPage'), 'AdminBillingConfigPage');
const IntegrityWatchdogPage = lazyRetry(() => import('./pages/admin/IntegrityWatchdogPage'), 'IntegrityWatchdogPage');
const FinancialReconciliationPage = lazyRetry(() => import('./pages/admin/FinancialReconciliationPage'), 'FinancialReconciliationPage');
const BetaEvidencePage = lazyRetry(() => import('./pages/admin/BetaEvidencePage'), 'BetaEvidencePage');
const BetaExitAuditPage = lazyRetry(() => import('./pages/admin/BetaExitAuditPage'), 'BetaExitAuditPage');
const AdminRevenuePage = lazyRetry(() => import('./pages/AdminRevenuePage'), 'AdminRevenuePage');
const AdminPlansPage = lazyRetry(() => import('./pages/AdminPlansPage'), 'AdminPlansPage');
const AdminSubscriptionsPage = lazyRetry(() => import('./pages/AdminSubscriptionsPage'), 'AdminSubscriptionsPage');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/invite/:code" element={<InviteRegisterPage />} />
              <Route path="/c/:code" element={<ShortLinkRedirectPage />} />
              <Route path="/clan-pass/:token" element={<ClanPassUnlockPage />} />
              <Route path="/qr/:token" element={<ClanPassUnlockPage />} />

              {/* Dev / Test Mode Routes */}
              <Route path="/dev/test-login" element={<DevTestLoginPage />} />

              {/* Onboarding */}
              <Route
                path="/onboarding/create-family"
                element={
                  <ProtectedRoute>
                    <CreateFamilyPage />
                  </ProtectedRoute>
                }
              />

              {/* Authenticated Family Workspace Routes (/app/...) */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="genealogy" element={<GenealogyTreePage />} />
                <Route path="members" element={<MembersListPage />} />
                <Route path="kinship" element={<KinshipCalculatorPage />} />
                <Route path="members/me" element={<MemberProfilePage />} />
                <Route path="members/:id" element={<MemberProfilePage />} />
                <Route path="calendar" element={<FamilyCalendarPage />} />
                <Route path="memorials" element={<MemorialsPage />} />
                <Route path="events" element={<EventListPage />} />
                <Route path="events/:id" element={<EventDetailPage />} />
                <Route path="reminders" element={<ReminderSettingsPage />} />
                <Route path="settings/reminders" element={<ReminderSettingsPage />} />

                {/* Clan Heritage & Chronicles Routes */}
                <Route path="clan/intro" element={<ClanIntroductionPage />} />
                <Route path="clan/chronicles" element={<ClanChroniclesPage />} />
                <Route path="clan/chronicles/:id" element={<ClanChronicleDetailPage />} />

                {/* Financial Routes (Protected by RoleGuard) */}
                <Route
                  path="finance"
                  element={
                    <RoleGuard allowedRoles={['OWNER', 'ADMIN', 'TREASURER', 'APPROVER']}>
                      <FinanceDashboardPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="finance/ledger"
                  element={
                    <RoleGuard allowedRoles={['OWNER', 'ADMIN', 'TREASURER']}>
                      <FundLedgerPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="finance/income"
                  element={
                    <RoleGuard allowedRoles={['OWNER', 'ADMIN', 'TREASURER']}>
                      <IncomeAssessmentsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="finance/expenses"
                  element={
                    <RoleGuard allowedRoles={['OWNER', 'ADMIN', 'TREASURER', 'APPROVER']}>
                      <ExpensesPage />
                    </RoleGuard>
                  }
                />
                <Route path="finance/contributions" element={<ContributionsPage />} />
                <Route path="finance/honor-roll" element={<HonorRollPage />} />

                {/* Billing & Settings */}
                <Route
                  path="billing"
                  element={
                    <RoleGuard allowedRoles={['OWNER', 'ADMIN']}>
                      <BillingOverviewPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="billing/usage"
                  element={
                    <RoleGuard allowedRoles={['OWNER', 'ADMIN']}>
                      <UsageDashboardPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="billing/invoices"
                  element={
                    <RoleGuard allowedRoles={['OWNER', 'ADMIN']}>
                      <InvoicesPage />
                    </RoleGuard>
                  }
                />
                <Route path="billing/checkout" element={<CheckoutPage />} />
                <Route path="support" element={<SupportCenterPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route
                  path="family/settings"
                  element={
                    <RoleGuard allowedRoles={['OWNER', 'ADMIN']}>
                      <FamilySettingsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="settings/permissions"
                  element={
                    <RoleGuard allowedRoles={['OWNER', 'ADMIN']}>
                      <PermissionsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="audit"
                  element={
                    <RoleGuard allowedRoles={['OWNER', 'ADMIN']}>
                      <AuditLogsPage />
                    </RoleGuard>
                  }
                />
              </Route>

              {/* Super Admin Platform Space Routes (/admin/...) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <RoleGuard requireSuperAdmin={true}>
                      <AppLayout />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/beta" replace />} />
                <Route path="beta" element={<BetaCommandCenterPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="payments" element={<AdminPaymentsPage />} />
                <Route path="billing/config" element={<AdminBillingConfigPage />} />
                <Route path="integrity" element={<IntegrityWatchdogPage />} />
                <Route path="reconciliation" element={<FinancialReconciliationPage />} />
                <Route path="beta/evidence" element={<BetaEvidencePage />} />
                <Route path="beta/exit-audit" element={<BetaExitAuditPage />} />
                <Route path="revenue" element={<AdminRevenuePage />} />
                <Route path="plans" element={<AdminPlansPage />} />
                <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
                <Route path="transactions" element={<AdminRevenuePage />} />
              </Route>

              {/* Default Fallback to Landing Page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
};

export default App;
