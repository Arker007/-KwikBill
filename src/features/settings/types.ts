export interface PaymentAccount {
  id: string;
  label: string;
  bankName: string;
  accountNumber: string;
  accountName?: string;
  accountType?: string;
  branch?: string;
  ifsc: string;
  swift?: string;
  upiId: string;
  notes?: string;
  isDefault: boolean;
  isActive?: boolean;
}

export interface BusinessProfileData {
  id?: string;
  businessName: string;
  tradeName?: string;
  legalName?: string;
  brandName?: string;
  companyName?: string;
  businessType?: string;
  tagline?: string;
  address: string;
  city?: string;
  state: string;
  stateCode?: string;
  pincode?: string;
  country?: string;
  phone?: string;
  altPhone?: string;
  email?: string;
  website?: string;
  pan?: string;
  gstin?: string;
  billingAddresses?: SwipeAddressItem[];
  shippingAddresses?: SwipeAddressItem[];
  customFields?: Array<{ id: string; key: string; value: string }>;
  aato?: string;
  swift?: string;
  taxLabel?: string;
  taxIdNumber?: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  branch?: string;
  upiId?: string;
  paymentAccounts?: PaymentAccount[];
  logo?: string;
  logoHeight?: number;
  signature?: string;
  lutNumber?: string;
  googleClientId?: string;
  googleDriveFolder?: string;
}

export interface InvoiceNumberSettings {
  format: 'branded' | 'sequential' | 'random';
  brandPrefix: string;
  separator: string;
  showFinYear: boolean;
  startNumber: number;
  padDigits: number;
}

export interface StockAlertSettings {
  enabled: boolean;
  threshold: number;
}

export interface TermsTemplate {
  id: string;
  name: string;
  content: string;
}

export interface BackupPart {
  id: string;
  label: string;
  hint: string;
}

export interface BackupInspection {
  valid: boolean;
  version?: string;
  exportedAt?: string;
  counts: Record<string, number>;
}

export interface DailyBackup {
  date: string;
  createdAt?: string;
}

export interface TrashedBill {
  id: string;
  invoiceNumber: string;
  clientName: string;
  _trashedAt?: string;
}

export interface UpdateInfo {
  updateAvailable?: boolean;
  latest?: string;
  current?: string;
  error?: boolean;
}

export interface FeatureModuleItem {
  id: string;
  name: string;
  desc: string;
}

export interface FeatureModuleGroup {
  group: string;
  desc: string;
  modules: FeatureModuleItem[];
}

export interface SwipeAddressItem {
  id: string;
  type: 'billing' | 'shipping';
  title?: string;
  name?: string;
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  pincode?: string;
  country?: string;
  isDefault?: boolean;
}

export type SwipeSettingsTabId =
  | 'company-details'
  | 'user-profile'
  | 'users-roles'
  | 'preferences'
  | 'thermal-print'
  | 'barcode-settings'
  | 'signatures'
  | 'notes-terms'
  | 'auto-reminders'
  | 'banks'
  | 'wallet'
  | 'billing'
  | 'swipe-ai'
  | 'payment-gateway'
  | 'tally-integration'
  | 'api-webhooks'
  | 'integrations'
  | 'supabase-cloud'
  | 'advanced-features'
  | 'social-links'
  | 'referral'
  | 'support';
