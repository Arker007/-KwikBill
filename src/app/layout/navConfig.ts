import {
  CreditCard,
  ShoppingBag,
  FileEdit,
  Tag,
  Sparkles,
  Package,
  Boxes,
  IndianRupee,
  Users,
  Building2,
  Briefcase,
  LineChart,
  BarChart3,
  Store,
  Truck,
  Puzzle,
  MoreHorizontal,
  LucideIcon,
  FileText,
  MinusCircle,
  PlusCircle,
  RefreshCw,
  Clock,
  Link,
  BookOpen,
  Scale,
  Globe,
  FileCheck,
  HelpCircle,
  HardDrive,
  Calculator,
} from 'lucide-react';

export interface NavSubItem {
  id: string;
  label: string;
  viewId: string;
  invoiceType?: string;
  badge?: string;
  badgeColor?: string;
  icon?: LucideIcon;
  description?: string;
  isExternalTab?: boolean;
  settingsSection?: string;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  defaultView: string;
  defaultInvoiceType?: string;
  children?: NavSubItem[];
  badge?: string;
}

export interface DirectNavItem {
  id: string;
  label: string;
  viewId: string;
  icon: LucideIcon;
  badge?: string;
  description?: string;
  isExternalTab?: boolean;
  settingsSection?: string;
}

// 1. Sales (Submenu)
export const SALES_GROUP: NavGroup = {
  id: 'group-sales',
  label: 'Sales',
  icon: CreditCard,
  defaultView: 'dashboard',
  children: [
    { id: 'sales-invoices', label: 'Invoices', viewId: 'dashboard', icon: FileText, description: 'All Sales Invoices' },
    { id: 'sales-credit-notes', label: 'Credit Notes', viewId: 'new', invoiceType: 'credit-note', badge: 'CN', icon: MinusCircle, description: 'Sales returns & adjustments' },
    { id: 'sales-e-invoices', label: 'E-Invoices', viewId: 'new', invoiceType: 'tax-invoice', badge: 'GST', icon: FileText, description: 'GST E-Invoicing' },
    { id: 'sales-subscriptions', label: 'Subscriptions', viewId: 'recurring', badge: 'AUTO', icon: RefreshCw, description: 'Recurring billing' },
  ],
};

// 2. Purchases (Submenu)
export const PURCHASES_GROUP: NavGroup = {
  id: 'group-purchases',
  label: 'Purchases',
  icon: ShoppingBag,
  defaultView: 'purchases',
  children: [
    { id: 'purchases-bills', label: 'Purchases', viewId: 'purchases', icon: ShoppingBag, description: 'Inward purchase bills' },
    { id: 'purchases-orders', label: 'Purchase Orders', viewId: 'purchases', icon: FileCheck, description: 'Purchase order vouchers' },
    { id: 'purchases-debit-notes', label: 'Debit Notes', viewId: 'new', invoiceType: 'debit-note', badge: 'DN', icon: PlusCircle, description: 'Purchase return notes' },
  ],
};

// 3. Quotations+ (Submenu)
export const QUOTATIONS_GROUP: NavGroup = {
  id: 'group-quotations',
  label: 'Quotations+',
  icon: FileEdit,
  defaultView: 'new',
  defaultInvoiceType: 'proforma',
  children: [
    { id: 'quotes-quotations', label: 'Quotations', viewId: 'quotations', description: 'Sales quotes & estimates' },
    { id: 'quotes-sales-orders', label: 'Sales Orders', viewId: 'new', invoiceType: 'proforma', description: 'Sales orders' },
    { id: 'quotes-proforma', label: 'Pro Forma Invoices', viewId: 'new', invoiceType: 'proforma', description: 'Pro Forma Invoices' },
    { id: 'quotes-delivery-challans', label: 'Delivery Challans', viewId: 'new', invoiceType: 'delivery-challan', badge: 'CHALLAN', description: 'Delivery & job work slips' },
    { id: 'quotes-packing-lists', label: 'Packing Lists', viewId: 'new', invoiceType: 'delivery-challan', description: 'Shipment packing lists' },
  ],
};

// 4. Expenses+ (Submenu)
export const EXPENSES_GROUP: NavGroup = {
  id: 'group-expenses',
  label: 'Expenses+',
  icon: Tag,
  defaultView: 'expenses',
  children: [
    { id: 'expenses-list', label: 'Expenses', viewId: 'expenses', description: 'Operating expense tracker' },
    { id: 'expenses-indirect-income', label: 'Indirect Income', viewId: 'expenses', description: 'Other business income' },
  ],
};

// 5. Single Links
export const SINGLE_SWIPE_AI: DirectNavItem = {
  id: 'single-swipe-ai',
  label: 'SwipeAI',
  viewId: 'settings',
  isExternalTab: true,
  settingsSection: 'section-swipe-ai',
  icon: Sparkles,
  badge: 'AI',
  description: 'AI Business Assistant',
};

export const SINGLE_PRODUCTS_SERVICES: DirectNavItem = {
  id: 'single-products-services',
  label: 'Products & Services',
  viewId: 'inventory',
  icon: Package,
  description: 'Product & Service Master Catalog',
};

// 6. Inventory (Submenu)
export const INVENTORY_GROUP: NavGroup = {
  id: 'group-inventory',
  label: 'Inventory',
  icon: Boxes,
  defaultView: 'inventory',
  children: [
    { id: 'inventory-warehouses', label: 'Warehouses', viewId: 'inventory', description: 'Warehouse stock tracking' },
    { id: 'inventory-timeline', label: 'Timeline', viewId: 'inventory', description: 'Stock movement timeline' },
  ],
};

// 7. Payments (Submenu - Expanded/Selected by default)
export const PAYMENTS_GROUP: NavGroup = {
  id: 'group-payments',
  label: 'Payments',
  icon: IndianRupee,
  defaultView: 'receipts',
  children: [
    { id: 'payments-timeline', label: 'Timeline', viewId: 'receipts', description: 'Payment timeline & vouchers' },
    { id: 'payments-links', label: 'Payment Links', viewId: 'receipts', description: 'Online collection links' },
    { id: 'payments-journals', label: 'Journals', viewId: 'receipts', description: 'Journal entries & ledger' },
    { id: 'payments-reconciliation', label: 'Bank Reconciliation', viewId: 'receipts', description: 'Bank statement matching' },
  ],
};

// 8. Other Single Links
export const SINGLE_CUSTOMERS: DirectNavItem = {
  id: 'single-customers',
  label: 'Customers',
  viewId: 'clients',
  icon: Users,
  description: 'Customer directory & ledgers',
};

export const SINGLE_VENDORS: DirectNavItem = {
  id: 'single-vendors',
  label: 'Vendors',
  viewId: 'purchases',
  icon: Building2,
  description: 'Vendor directory & supplier ledgers',
};

export const SINGLE_PROJECTS: DirectNavItem = {
  id: 'single-projects',
  label: 'Projects',
  viewId: 'reports',
  icon: Briefcase,
  description: 'Project cost & profit tracking',
};

export const SINGLE_INSIGHTS: DirectNavItem = {
  id: 'single-insights',
  label: 'Insights',
  viewId: 'reports',
  icon: LineChart,
  description: 'Analytics & business insights',
};

export const SINGLE_REPORTS: DirectNavItem = {
  id: 'single-reports',
  label: 'Reports',
  viewId: 'reports',
  icon: BarChart3,
  description: 'Financial & statutory GST reports',
};

export const SINGLE_ONLINE_STORE: DirectNavItem = {
  id: 'single-online-store',
  label: 'OnlineStore',
  viewId: 'inventory',
  icon: Store,
  description: 'E-commerce store integration',
};

export const SINGLE_EWAY_BILLS: DirectNavItem = {
  id: 'single-eway-bills',
  label: 'E-way Bills',
  viewId: 'filing',
  icon: Truck,
  description: 'E-Way bill management',
};

export const SINGLE_INTEGRATIONS: DirectNavItem = {
  id: 'single-integrations',
  label: 'Integrations',
  viewId: 'settings',
  isExternalTab: true,
  settingsSection: 'section-integrations',
  icon: Puzzle,
  description: 'Third-party app & API integrations',
};

// 9. More (Submenu)
export const MORE_GROUP: NavGroup = {
  id: 'group-more',
  label: 'More',
  icon: MoreHorizontal,
  defaultView: 'guide',
  children: [
    { id: 'more-user-guide', label: 'User Guide', viewId: 'guide', icon: HelpCircle, description: 'Help documentation & guides' },
    { id: 'more-control-panel', label: 'Control Panel', viewId: 'controlpanel', icon: HardDrive, description: 'System diagnostics & audit' },
    { id: 'more-income-tax', label: 'Income Tax', viewId: 'incometax', badge: '2025', icon: Calculator, description: 'Income tax calculator & slabs' },
  ],
};
