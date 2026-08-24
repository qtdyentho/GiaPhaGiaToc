export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type MembershipRole =
  | 'OWNER'
  | 'ADMIN'
  | 'GENEALOGY_ADMIN'
  | 'TREASURER'
  | 'APPROVER'
  | 'EVENT_MANAGER'
  | 'MEMBER'
  | 'VIEWER';

export type MembershipStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'LEFT';
export type GenderType = 'MALE' | 'FEMALE' | 'OTHER';
export type MemberLifeStatus = 'ALIVE' | 'DECEASED';
export type RelationshipType = 'PARENT' | 'CHILD' | 'SPOUSE' | 'SIBLING' | 'ADOPTIVE_PARENT' | 'ADOPTED_CHILD' | 'OTHER';
export type RecurrenceType = 'YEARLY_LUNAR' | 'YEARLY_SOLAR' | 'NONE';

export type EventType =
  | 'CLAN_ANCESTRAL_DAY'
  | 'MEMORIAL'
  | 'BRANCH_MEMORIAL'
  | 'FAMILY_MEETING'
  | 'ANCESTRAL_HALL_OPENING'
  | 'ANCESTRAL_HALL_RENOVATION'
  | 'CLAN_ANNIVERSARY'
  | 'BIRTHDAY'
  | 'LONGEVITY'
  | 'WEDDING'
  | 'FUNERAL'
  | 'OTHER';

export type EventScope = 'FAMILY' | 'BRANCH' | 'SUB_BRANCH' | 'HOUSEHOLD' | 'INDIVIDUAL';
export type FundStatus = 'ACTIVE' | 'FROZEN' | 'CLOSED';
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'ADJUSTMENT' | 'REVERSAL';
export type TransactionStatus = 'DRAFT' | 'POSTED' | 'REVERSED' | 'CANCELLED';
export type AssessmentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'WAIVED' | 'CANCELLED';
export type ExpenseStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'POSTED' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'VIETQR' | 'VNPAY' | 'MOMO' | 'OTHER';
export type SponsorType = 'MEMBER' | 'RELATIVE' | 'BUSINESS' | 'ORGANIZATION' | 'OTHER';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE_ATTEMPT' | 'APPROVE' | 'REJECT' | 'POST' | 'REVERSE' | 'LOGIN' | 'LOGOUT';
export type NotificationType = 'MEMORIAL_REMINDER' | 'EVENT_REMINDER' | 'PAYMENT_DUE' | 'EXPENSE_APPROVAL_REQUEST' | 'TRANSACTION_POSTED' | 'MEMBERSHIP_INVITE' | 'SYSTEM';

export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED' | 'READ_ONLY';
export type InvoiceStatus = 'DRAFT' | 'OPEN' | 'PAID' | 'VOID' | 'UNCOLLECTIBLE' | 'REFUNDED';
export type PlanTier = 'FREE' | 'FAMILY' | 'GIA_TOC' | 'DONG_HO' | 'PREMIUM';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type RefundStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'PROCESSED';

export type SubscriptionEventType =
  | 'CREATED'
  | 'TRIAL_STARTED'
  | 'TRIAL_EXTENDED'
  | 'TRIAL_ENDED'
  | 'UPGRADED'
  | 'DOWNGRADED'
  | 'RENEWED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'PAST_DUE_ENTERED'
  | 'READ_ONLY_ENTERED';

export type PaymentEventType =
  | 'WEBHOOK_RECEIVED'
  | 'QR_GENERATED'
  | 'QR_SCANNED'
  | 'BANK_TRANSFERRED'
  | 'AUTO_MATCHED'
  | 'MANUAL_MATCHED'
  | 'FAILED';

export type BillingAuditAction =
  | 'PLAN_CREATED'
  | 'PLAN_UPDATED'
  | 'PLAN_VERSIONED'
  | 'PRICE_CHANGED'
  | 'TRIAL_EXTENDED'
  | 'SUBSCRIPTION_STATUS_CHANGED'
  | 'INVOICE_GENERATED'
  | 'INVOICE_VOIDED'
  | 'PAYMENT_RECEIVED'
  | 'REFUND_REQUESTED'
  | 'REFUND_APPROVED'
  | 'REFUND_PROCESSED';

// ==========================================
// TABLE INTERFACES MATCHING DATABASE_SCHEMA
// ==========================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: string;
  name: string;
  code: string;
  slug: string;
  description?: string;
  origin_province?: string;
  origin_district?: string;
  origin_commune?: string;
  ancestral_hall_address?: string;
  logo_url?: string;
  banner_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMembership {
  id: string;
  family_id: string;
  user_id: string;
  role: MembershipRole;
  status: MembershipStatus;
  invited_by?: string;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  family_id: string;
  generation_number: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface Branch {
  id: string;
  family_id: string;
  parent_branch_id?: string;
  name: string;
  code?: string;
  order_index: number;
  created_at: string;
}

export interface Member {
  id: string;
  family_id: string;
  generation_id?: string;
  branch_id?: string;
  first_name: string;
  last_name: string;
  full_name: string;
  gender: GenderType;
  life_status: MemberLifeStatus;
  birth_solar_date?: string;
  birth_lunar_day?: number;
  birth_lunar_month?: number;
  birth_lunar_year?: number;
  death_solar_date?: string;
  death_lunar_day?: number;
  death_lunar_month?: number;
  death_lunar_year?: number;
  burial_place?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface MemberRelationship {
  id: string;
  family_id: string;
  member_id: string;
  related_member_id: string;
  relationship: RelationshipType;
  relationship_type?: RelationshipType;
  is_direct_lineage?: boolean;
  created_at?: string;
}

export interface MemorialDate {
  id: string;
  family_id: string;
  member_id: string;
  title: string;
  lunar_day: number;
  lunar_month: number;
  is_leap_month: boolean;
  notes?: string;
  next_solar_date?: string;
  created_at: string;
}

export interface Event {
  id: string;
  family_id: string;
  title: string;
  description?: string;
  event_type: EventType;
  scope: EventScope;
  solar_date: string;
  solar_time?: string;
  lunar_day?: number;
  lunar_month?: number;
  lunar_year?: number;
  is_leap_month?: boolean;
  location?: string;
  estimated_budget: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Fund {
  id: string;
  family_id: string;
  name: string;
  code: string;
  description?: string;
  opening_balance: number;
  current_balance: number;
  status: FundStatus;
  created_at: string;
  updated_at: string;
}

export interface FinancialTransaction {
  id: string;
  family_id: string;
  fund_id: string;
  transaction_code: string;
  transaction_type: TransactionType;
  category_id?: string;
  event_id?: string;
  member_id?: string;
  assessment_id?: string;
  expense_id?: string;
  amount: number;
  payment_method: PaymentMethod;
  transaction_date: string;
  description?: string;
  receipt_url?: string;
  status: TransactionStatus;
  reference_transaction_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface IncomeAssessment {
  id: string;
  family_id: string;
  title: string;
  category_id?: string;
  event_id?: string;
  member_id: string;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: AssessmentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseRecord {
  id: string;
  family_id: string;
  fund_id: string;
  title: string;
  category_id?: string;
  event_id?: string;
  amount: number;
  expense_date: string;
  payment_method: PaymentMethod;
  recipient_name?: string;
  status: ExpenseStatus;
  description?: string;
  receipt_url?: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Contribution {
  id: string;
  family_id: string;
  member_id?: string;
  donor_name: string;
  fund_id: string;
  amount: number;
  contribution_date: string;
  notes?: string;
  created_at: string;
}

export interface Sponsorship {
  id: string;
  family_id: string;
  sponsor_name: string;
  sponsor_type: SponsorType;
  fund_id: string;
  amount: number;
  sponsorship_date: string;
  notes?: string;
  is_honored: boolean;
  created_at: string;
}

export interface Plan {
  id: string;
  code: PlanTier;
  name: string;
  description?: string;
  short_description?: string;
  is_public: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PlanVersion {
  id: string;
  plan_id: string;
  version_number: number;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  trial_days: number;
  is_current: boolean;
  effective_from: string;
  effective_to?: string;
  created_at: string;
  updated_at: string;
}

export interface PlanFeature {
  id: string;
  plan_id: string;
  plan_version_id?: string;
  feature_code: string;
  feature_name: string;
  feature_type: string;
  limit_value?: number | null;
  is_enabled: boolean;
}

export interface Subscription {
  id: string;
  family_id: string;
  plan_id: string;
  plan_version_id?: string;
  status: SubscriptionStatus;
  billing_cycle: 'MONTHLY' | 'YEARLY';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  cancelled_at?: string;
  expired_at?: string;
  auto_renew: boolean;
  payment_provider: string;
  external_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionEvent {
  id: string;
  subscription_id: string;
  family_id: string;
  event_type: SubscriptionEventType;
  from_status?: SubscriptionStatus;
  to_status: SubscriptionStatus;
  triggered_by?: string;
  reason?: string;
  metadata?: Json;
  created_at: string;
}

export interface TrialPeriod {
  id: string;
  subscription_id: string;
  family_id: string;
  start_at: string;
  end_at: string;
  is_extended: boolean;
  extended_days: number;
  extended_by?: string;
  extension_reason?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CONVERTED';
  created_at: string;
  updated_at: string;
}

export interface UsageCounter {
  id: string;
  family_id: string;
  subscription_id: string;
  feature_code: string;
  current_usage: number;
  peak_usage: number;
  last_reset_at?: string;
  updated_at: string;
}

export interface UsageEvent {
  id: string;
  family_id: string;
  subscription_id: string;
  feature_code: string;
  delta: number;
  previous_value: number;
  new_value: number;
  reference_id?: string;
  triggered_by?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  family_id: string;
  subscription_id: string;
  invoice_number: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  billing_reason: string;
  issued_at: string;
  due_at: string;
  paid_at?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  period_start?: string;
  period_end?: string;
  feature_code?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  family_id: string;
  subscription_id: string;
  invoice_id?: string;
  payment_code: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  provider: string;
  provider_transaction_id?: string;
  status: PaymentStatus;
  paid_at?: string;
  failure_reason?: string;
  metadata?: Json;
  created_at: string;
  updated_at: string;
}

export interface PaymentEvent {
  id: string;
  payment_id: string;
  event_type: PaymentEventType;
  raw_payload: Json;
  provider_response?: Json;
  created_at: string;
}

export interface Refund {
  id: string;
  payment_id: string;
  invoice_id: string;
  subscription_id: string;
  family_id: string;
  refund_code: string;
  amount: number;
  currency: string;
  reason: string;
  status: RefundStatus;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_name?: string;
  bank_transaction_reference?: string;
  processed_by?: string;
  processed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BillingAuditLog {
  id: string;
  family_id: string;
  subscription_id?: string;
  actor_id?: string;
  action: BillingAuditAction;
  entity_type: string;
  entity_id: string;
  old_data?: Json;
  new_data?: Json;
  ip_address?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  family_id: string;
  type: NotificationType;
  title: string;
  message: string;
  reference_type?: string;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface UserNotificationPreferences {
  id: string;
  user_id: string;
  family_id: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  push_enabled: boolean;
  memorial_reminders: boolean;
  event_reminders: boolean;
  financial_alerts: boolean;
  billing_alerts: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  family_id: string;
  user_id?: string;
  action: AuditAction;
  entity_type: string;
  entity_id: string;
  old_data?: Json;
  new_data?: Json;
  ip_address?: string;
  created_at: string;
}
