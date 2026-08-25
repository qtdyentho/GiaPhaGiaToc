import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleGuard } from './components/auth/RoleGuard';
import { AppLayout } from './components/layout/AppLayout';
import { PageSkeleton } from './components/ui/PageSkeleton';

// ─── Public Pages (Lazy Loaded) ───────────────────────────────────────────────
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })));
const HelpPage = lazy(() => import('./pages/HelpPage').then(m => ({ default: m.HelpPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const InviteRegisterPage = lazy(() => import('./pages/InviteRegisterPage').then(m => ({ default: m.InviteRegisterPage })));
const ClanPassUnlockPage = lazy(() => import('./pages/ClanPassUnlockPage').then(m => ({ default: m.ClanPassUnlockPage })));
const ShortLinkRedirectPage = lazy(() => import('./pages/ShortLinkRedirectPage').then(m => ({ default: m.ShortLinkRedirectPage })));
const DevTestLoginPage = lazy(() => import('./pages/DevTestLoginPage').then(m => ({ default: m.DevTestLoginPage })));

// ─── Onboarding & Core Family Pages (Lazy Loaded) ─────────────────────────────
const CreateFamilyPage = lazy(() => import('./pages/CreateFamilyPage').then(m => ({ default: m.CreateFamilyPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const GenealogyTreePage = lazy(() => import('./pages/GenealogyTreePage').then(m => ({ default: m.GenealogyTreePage })));
const MembersListPage = lazy(() => import('./pages/MembersListPage').then(m => ({ default: m.MembersListPage })));
const KinshipCalculatorPage = lazy(() => import('./pages/KinshipCalculatorPage').then(m => ({ default: m.KinshipCalculatorPage })));
const MemberProfilePage = lazy(() => import('./pages/MemberProfilePage').then(m => ({ default: m.MemberProfilePage })));
const FamilyCalendarPage = lazy(() => import('./pages/FamilyCalendarPage').then(m => ({ default: m.FamilyCalendarPage })));
const MemorialsPage = lazy(() => import('./pages/MemorialsPage').then(m => ({ default: m.MemorialsPage })));
const EventListPage = lazy(() => import('./pages/EventListPage').then(m => ({ default: m.EventListPage })));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage').then(m => ({ default: m.EventDetailPage })));
const ReminderSettingsPage = lazy(() => import('./pages/ReminderSettingsPage').then(m => ({ default: m.ReminderSettingsPage })));

// ─── Finance Pages (Lazy Loaded) ──────────────────────────────────────────────
const FinanceDashboardPage = lazy(() => import('./pages/FinanceDashboardPage').then(m => ({ default: m.FinanceDashboardPage })));
const FundLedgerPage = lazy(() => import('./pages/FundLedgerPage').then(m => ({ default: m.FundLedgerPage })));
const IncomeAssessmentsPage = lazy(() => import('./pages/IncomeAssessmentsPage').then(m => ({ default: m.IncomeAssessmentsPage })));
const ExpensesPage = lazy(() => import('./pages/ExpensesPage').then(m => ({ default: m.ExpensesPage })));
const ContributionsPage = lazy(() => import('./pages/ContributionsPage').then(m => ({ default: m.ContributionsPage })));
const HonorRollPage = lazy(() => import('./pages/HonorRollPage').then(m => ({ default: m.HonorRollPage })));

// ─── Billing & Settings Pages (Lazy Loaded) ───────────────────────────────────
const BillingOverviewPage = lazy(() => import('./pages/BillingOverviewPage').then(m => ({ default: m.BillingOverviewPage })));
const UsageDashboardPage = lazy(() => import('./pages/UsageDashboardPage').then(m => ({ default: m.UsageDashboardPage })));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage').then(m => ({ default: m.InvoicesPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const SupportCenterPage = lazy(() => import('./pages/SupportCenterPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const FamilySettingsPage = lazy(() => import('./pages/FamilySettingsPage').then(m => ({ default: m.FamilySettingsPage })));
const PermissionsPage = lazy(() => import('./pages/PermissionsPage').then(m => ({ default: m.PermissionsPage })));
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage').then(m => ({ default: m.AuditLogsPage })));

// ─── Super Admin Pages (Lazy Loaded) ──────────────────────────────────────────
const BetaCommandCenterPage = lazy(() => import('./pages/admin/BetaCommandCenterPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminPaymentsPage = lazy(() => import('./pages/admin/AdminPaymentsPage'));
const AdminBillingConfigPage = lazy(() => import('./pages/admin/AdminBillingConfigPage'));
const IntegrityWatchdogPage = lazy(() => import('./pages/admin/IntegrityWatchdogPage'));
const FinancialReconciliationPage = lazy(() => import('./pages/admin/FinancialReconciliationPage'));
const BetaEvidencePage = lazy(() => import('./pages/admin/BetaEvidencePage'));
const BetaExitAuditPage = lazy(() => import('./pages/admin/BetaExitAuditPage'));
const AdminRevenuePage = lazy(() => import('./pages/AdminRevenuePage').then(m => ({ default: m.AdminRevenuePage })));
const AdminPlansPage = lazy(() => import('./pages/AdminPlansPage').then(m => ({ default: m.AdminPlansPage })));
const AdminSubscriptionsPage = lazy(() => import('./pages/AdminSubscriptionsPage').then(m => ({ default: m.AdminSubscriptionsPage })));

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
