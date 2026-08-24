import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleGuard } from './components/auth/RoleGuard';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { HelpPage } from './pages/HelpPage';
import { InviteRegisterPage } from './pages/InviteRegisterPage';
import { DevTestLoginPage } from './pages/DevTestLoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GenealogyTreePage } from './pages/GenealogyTreePage';
import { MembersListPage } from './pages/MembersListPage';
import { KinshipCalculatorPage } from './pages/KinshipCalculatorPage';
import { FamilyCalendarPage } from './pages/FamilyCalendarPage';
import { FinanceDashboardPage } from './pages/FinanceDashboardPage';
import { BillingOverviewPage } from './pages/BillingOverviewPage';
import { UsageDashboardPage } from './pages/UsageDashboardPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { PricingPage } from './pages/PricingPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AdminRevenuePage } from './pages/AdminRevenuePage';
import { CreateFamilyPage } from './pages/CreateFamilyPage';
import { FamilySettingsPage } from './pages/FamilySettingsPage';
import { MemberProfilePage } from './pages/MemberProfilePage';
import { MemorialsPage } from './pages/MemorialsPage';
import { EventListPage } from './pages/EventListPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { ReminderSettingsPage } from './pages/ReminderSettingsPage';
import { FundLedgerPage } from './pages/FundLedgerPage';
import { IncomeAssessmentsPage } from './pages/IncomeAssessmentsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { ContributionsPage } from './pages/ContributionsPage';
import { HonorRollPage } from './pages/HonorRollPage';
import { PermissionsPage } from './pages/PermissionsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AdminPlansPage } from './pages/AdminPlansPage';
import { AdminSubscriptionsPage } from './pages/AdminSubscriptionsPage';

import SupportCenterPage from './pages/SupportCenterPage';
import BetaCommandCenterPage from './pages/admin/BetaCommandCenterPage';
import IntegrityWatchdogPage from './pages/admin/IntegrityWatchdogPage';
import FinancialReconciliationPage from './pages/admin/FinancialReconciliationPage';
import BetaEvidencePage from './pages/admin/BetaEvidencePage';
import BetaExitAuditPage from './pages/admin/BetaExitAuditPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminBillingConfigPage from './pages/admin/AdminBillingConfigPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

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
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/invite/:code" element={<InviteRegisterPage />} />

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
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
