import React, { lazy } from 'react';
import {
  Home,
  Plus,
  Users,
  Package,
  Wallet,
  ShoppingCart,
  RefreshCw,
  Receipt,
  BarChart3,
  BookOpen,
  Calculator,
  HelpCircle,
  Settings,
  HardDrive,
  Database,
  LucideIcon,
  FileEdit,
} from 'lucide-react';

// Eagerly load the dashboard only; invoice editing pulls in PDF/preview code.
import DashboardPage from '../../pages/DashboardPage';

// Route-level lazy loading for secondary pages
const InvoiceEditorPage = lazy(() => import('../../pages/InvoiceEditorPage'));
const ClientsPage = lazy(() => import('../../pages/ClientsPage'));
const InventoryPage = lazy(() => import('../../pages/InventoryPage'));
const ExpensesPage = lazy(() => import('../../pages/ExpensesPage'));
const PurchasesPage = lazy(() => import('../../pages/PurchasesPage'));
const RecurringPage = lazy(() => import('../../pages/RecurringPage'));
const ReceiptsPage = lazy(() => import('../../pages/ReceiptsPage'));
const ReportsPage = lazy(() => import('../../pages/ReportsPage'));
const GSTReturnsPage = lazy(() => import('../../pages/GSTReturnsPage'));
const IncomeTaxPage = lazy(() => import('../../pages/IncomeTaxPage'));
const UserGuidePage = lazy(() => import('../../pages/UserGuidePage'));
const SettingsPage = lazy(() => import('../../pages/SettingsPage'));
const ControlPanelPage = lazy(() => import('../../pages/ControlPanelPage'));
const SupabasePage = lazy(() => import('../../pages/SupabasePage'));
const QuotationsPage = lazy(() => import('../../pages/QuotationsPage'));

export type ViewId =
  | 'dashboard'
  | 'new'
  | 'clients'
  | 'inventory'
  | 'expenses'
  | 'purchases'
  | 'recurring'
  | 'receipts'
  | 'reports'
  | 'filing'
  | 'incometax'
  | 'guide'
  | 'settings'
  | 'controlpanel'
  | 'supabase'
  | 'quotations';

export interface RouteConfig {
  id: ViewId;
  label: string;
  icon: LucideIcon;
  module?: string;
  isNav?: boolean;
  component: React.ComponentType<any> | React.LazyExoticComponent<React.ComponentType<any>>;
}

export const VALID_VIEWS: ViewId[] = [
  'dashboard',
  'new',
  'clients',
  'inventory',
  'expenses',
  'purchases',
  'recurring',
  'receipts',
  'reports',
  'filing',
  'incometax',
  'guide',
  'settings',
  'controlpanel',
  'supabase',
  'quotations',
];

export const APP_ROUTES: RouteConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    module: 'dashboard',
    isNav: true,
    component: DashboardPage,
  },
  {
    id: 'quotations',
    label: 'Quotations',
    icon: FileEdit,
    module: 'invoicing',
    isNav: true,
    component: QuotationsPage,
  },
  {
    id: 'new',
    label: 'Create Invoice',
    icon: Plus,
    module: 'invoicing',
    isNav: true,
    component: InvoiceEditorPage,
  },
  {
    id: 'clients',
    label: 'Customers & Clients',
    icon: Users,
    module: 'clients',
    isNav: true,
    component: ClientsPage,
  },
  {
    id: 'inventory',
    label: 'Products & Inventory',
    icon: Package,
    module: 'inventory',
    isNav: true,
    component: InventoryPage,
  },
  {
    id: 'expenses',
    label: 'Expense Tracker',
    icon: Wallet,
    module: 'expenses',
    isNav: true,
    component: ExpensesPage,
  },
  {
    id: 'purchases',
    label: 'Purchase Bills',
    icon: ShoppingCart,
    module: 'purchases',
    isNav: true,
    component: PurchasesPage,
  },
  {
    id: 'recurring',
    label: 'Recurring Invoices',
    icon: RefreshCw,
    module: 'recurring',
    isNav: true,
    component: RecurringPage,
  },
  {
    id: 'receipts',
    label: 'Payments & Receipts',
    icon: Receipt,
    module: 'receipts',
    isNav: true,
    component: ReceiptsPage,
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: BarChart3,
    module: 'reports',
    isNav: true,
    component: ReportsPage,
  },
  {
    id: 'filing',
    label: 'GST & E-Way Returns',
    icon: BookOpen,
    module: 'gstReturns',
    isNav: true,
    component: GSTReturnsPage,
  },
  {
    id: 'incometax',
    label: 'Income & Advance Tax',
    icon: Calculator,
    module: 'incomeTax',
    isNav: true,
    component: IncomeTaxPage,
  },
  {
    id: 'guide',
    label: 'User Guide',
    icon: HelpCircle,
    module: 'dashboard', // always available when dashboard is enabled
    isNav: true,
    component: UserGuidePage,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    isNav: false,
    component: SettingsPage,
  },
  {
    id: 'controlpanel',
    label: 'Control Panel',
    icon: HardDrive,
    isNav: false,
    component: ControlPanelPage,
  },
  {
    id: 'supabase',
    label: 'Supabase Cloud',
    icon: Database,
    isNav: false,
    component: SupabasePage,
  },
];

export const VIEW_MODULE_MAP: Partial<Record<ViewId, string>> = {
  new: 'invoicing',
  clients: 'clients',
  inventory: 'inventory',
  expenses: 'expenses',
  purchases: 'purchases',
  recurring: 'recurring',
  receipts: 'receipts',
  reports: 'reports',
  filing: 'gstReturns',
  incometax: 'incomeTax',
};
