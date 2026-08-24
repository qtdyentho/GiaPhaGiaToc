import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import { BetaControlCenterPage } from './pages/BetaControlCenterPage';

import SupportCenterPage from './pages/SupportCenterPage';
import BetaCommandCenterPage from './pages/admin/BetaCommandCenterPage';
import IntegrityWatchdogPage from './pages/admin/IntegrityWatchdogPage';
import FinancialReconciliationPage from './pages/admin/FinancialReconciliationPage';
import BetaEvidencePage from './pages/admin/BetaEvidencePage';
import BetaExitAuditPage from './pages/admin/BetaExitAuditPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminBillingConfigPage from './pages/admin/AdminBillingConfigPage';

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
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/invite/:code" element={<InviteRegisterPage />} />

          {/* Dev / Test Mode Routes (Available in Dev / Staging) */}
          <Route path="/dev/test-login" element={<DevTestLoginPage />} />

          {/* Onboarding */}
          <Route path="/onboarding/create-family" element={<CreateFamilyPage />} />

          {/* Authenticated App Shell Routes (/app/...) */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="genealogy" element={<GenealogyTreePage />} />
            <Route path="members" element={<MembersListPage />} />
            <Route path="members/:id" element={<MemberProfilePage />} />
            <Route path="calendar" element={<FamilyCalendarPage />} />
            <Route path="memorials" element={<MemorialsPage />} />
            <Route path="events" element={<EventListPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="reminders" element={<ReminderSettingsPage />} />
            <Route path="settings/reminders" element={<ReminderSettingsPage />} />
            <Route path="finance" element={<FinanceDashboardPage />} />
            <Route path="finance/ledger" element={<FundLedgerPage />} />
            <Route path="finance/income" element={<IncomeAssessmentsPage />} />
            <Route path="finance/expenses" element={<ExpensesPage />} />
            <Route path="finance/contributions" element={<ContributionsPage />} />
            <Route path="finance/honor-roll" element={<HonorRollPage />} />
            <Route path="billing" element={<BillingOverviewPage />} />
            <Route path="billing/usage" element={<UsageDashboardPage />} />
            <Route path="billing/invoices" element={<InvoicesPage />} />
            <Route path="billing/checkout" element={<CheckoutPage />} />
            <Route path="support" element={<SupportCenterPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="family/settings" element={<FamilySettingsPage />} />
            <Route path="settings/permissions" element={<PermissionsPage />} />
            <Route path="audit" element={<AuditLogsPage />} />
          </Route>

          {/* Admin Routes (/admin/...) */}
          <Route path="/admin" element={<AppLayout />}>
            <Route index element={<Navigate to="/admin/beta" replace />} />
            <Route path="beta" element={<BetaCommandCenterPage />} />
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
    </QueryClientProvider>
  );
};

export default App;
