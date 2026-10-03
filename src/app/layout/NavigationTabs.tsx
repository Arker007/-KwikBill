import React, { useState, useEffect } from 'react';
import { Tooltip } from 'antd';
import {
  ChevronDown,
  LucideIcon,
  FileText,
  FileCheck2,
  Receipt,
  Building2,
  MinusCircle,
  PlusCircle,
  Ticket,
  Truck,
} from 'lucide-react';
import {
  SALES_GROUP,
  PURCHASES_GROUP,
  QUOTATIONS_GROUP,
  EXPENSES_GROUP,
  SINGLE_SWIPE_AI,
  SINGLE_PRODUCTS_SERVICES,
  INVENTORY_GROUP,
  PAYMENTS_GROUP,
  SINGLE_CUSTOMERS,
  SINGLE_VENDORS,
  SINGLE_PROJECTS,
  SINGLE_INSIGHTS,
  SINGLE_REPORTS,
  SINGLE_ONLINE_STORE,
  SINGLE_EWAY_BILLS,
  SINGLE_INTEGRATIONS,
  MORE_GROUP,
  NavGroup,
  NavSubItem,
  DirectNavItem,
} from './navConfig';
import { NavGroupFlyout } from './NavFlyout';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  module?: string;
  badge?: number | string;
}

export interface NavigationTabsProps {
  navItems?: NavItem[];
  currentView: string;
  currentInvoiceType?: string;
  onSelectView: (viewId: string, invoiceType?: string) => void;
  collapsed?: boolean;
  onOpenSettingsTab?: (tab: string) => void;
  className?: string;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  currentView,
  currentInvoiceType,
  onSelectView,
  collapsed = false,
  onOpenSettingsTab,
  className = '',
}) => {
  // Submenu accordion states
  const [salesExpanded, setSalesExpanded] = useState(
    ['dashboard', 'new', 'recurring'].includes(currentView)
  );
  const [purchasesExpanded, setPurchasesExpanded] = useState(
    ['purchases'].includes(currentView)
  );
  const [quotationsExpanded, setQuotationsExpanded] = useState(
    currentView === 'new' && currentInvoiceType === 'proforma'
  );
  const [expensesExpanded, setExpensesExpanded] = useState(
    currentView === 'expenses'
  );
  const [inventoryExpanded, setInventoryExpanded] = useState(false);
  const [paymentsExpanded, setPaymentsExpanded] = useState<boolean>(true);
  const [moreExpanded, setMoreExpanded] = useState(
    ['guide', 'controlpanel', 'incometax'].includes(currentView)
  );

  // Auto-expand relevant group when view changes
  useEffect(() => {
    if (['dashboard', 'new', 'recurring'].includes(currentView)) {
      setSalesExpanded(true);
    } else if (currentView === 'purchases') {
      setPurchasesExpanded(true);
    } else if (currentView === 'expenses') {
      setExpensesExpanded(true);
    } else if (currentView === 'receipts') {
      setPaymentsExpanded(true);
    } else if (['guide', 'controlpanel', 'incometax'].includes(currentView)) {
      setMoreExpanded(true);
    }
  }, [currentView]);

  const isSalesActive = currentView === 'dashboard' || currentView === 'recurring';
  const isPurchasesActive = currentView === 'purchases';
  const isQuotationsActive = currentView === 'new' && currentInvoiceType === 'proforma';
  const isExpensesActive = currentView === 'expenses';
  const isInventoryActive = currentView === 'inventory';
  const isPaymentsActive = currentView === 'receipts';
  const isMoreActive = ['guide', 'controlpanel', 'incometax'].includes(currentView);

  const handleSelectSubItem = (sub: NavSubItem) => {
    if (sub.isExternalTab && sub.settingsSection && onOpenSettingsTab) {
      onOpenSettingsTab(sub.settingsSection);
    } else if (sub.viewId) {
      onSelectView(sub.viewId, sub.invoiceType);
    }
  };

  const handleSelectDirectItem = (item: DirectNavItem) => {
    if (item.isExternalTab && item.settingsSection && onOpenSettingsTab) {
      onOpenSettingsTab(item.settingsSection);
    } else {
      onSelectView(item.viewId);
    }
  };

  const renderGroup = (
    group: NavGroup,
    isExpanded: boolean,
    toggleExpanded: () => void,
    isGroupActive: boolean
  ) => {
    const Icon = group.icon;

    if (collapsed) {
      return (
        <NavGroupFlyout
          key={group.id}
          group={group}
          isActive={isGroupActive}
          currentView={currentView}
          currentInvoiceType={currentInvoiceType}
          onSelectSubItem={handleSelectSubItem}
          onSelectGroupDefault={() => onSelectView(group.defaultView, group.defaultInvoiceType)}
        />
      );
    }

    return (
      <div key={group.id} className="space-y-0.5">
        <button
          type="button"
          id={`nav-${group.id}`}
          onClick={toggleExpanded}
          className={`flex items-center justify-between px-3 py-1.5 rounded-md text-xs group cursor-pointer w-full transition-colors ${
            isGroupActive
              ? 'bg-[#EFF6FF] dark:bg-blue-950/40 text-[#1665D8] dark:text-blue-400 font-semibold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800'
          }`}
          aria-expanded={isExpanded}
          aria-controls={`sub-${group.id}`}
        >
          <div className="flex items-center space-x-2.5">
            <Icon
              className={`w-4 h-4 shrink-0 ${
                isGroupActive
                  ? 'text-[#1665D8] dark:text-blue-400'
                  : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
              }`}
            />
            <span>{group.label}</span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.645,0.045,0.355,1)] ${
              isExpanded ? 'rotate-180' : ''
            } ${
              isGroupActive
                ? 'text-[#1665D8] dark:text-blue-400'
                : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
            }`}
          />
        </button>

        {group.children && (
          <div
            id={`sub-${group.id}`}
            className={`grid transition-[grid-template-rows,opacity] ${
              isExpanded
                ? 'grid-rows-[1fr] opacity-100 duration-200 ease-[cubic-bezier(0.215,0.61,0.355,1)]'
                : 'grid-rows-[0fr] opacity-0 duration-140 ease-[cubic-bezier(0.55,0.055,0.675,0.19)] pointer-events-none'
            }`}
          >
            <div className="overflow-hidden pl-6 pr-1 py-0.5 space-y-0.5">
              {group.children.map((sub) => {
                const isSubActive =
                  currentView === sub.viewId &&
                  (!sub.invoiceType || currentInvoiceType === sub.invoiceType);

                return (
                  <Tooltip key={sub.id} title={sub.description} placement="right" mouseEnterDelay={0.3}>
                    <button
                      type="button"
                      id={`nav-${sub.id}`}
                      onClick={() => handleSelectSubItem(sub)}
                      className={`w-full text-left px-2.5 py-1 rounded text-[11px] flex items-center justify-between transition-colors duration-100 cursor-pointer ${
                        isSubActive
                          ? 'text-[#1665D8] dark:text-blue-400 font-semibold bg-blue-50/80 dark:bg-blue-950/50 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="truncate">{sub.label}</span>
                      {sub.badge && (
                        <span
                          className={`text-[9px] font-semibold px-1 py-0.2 rounded ml-1.5 shrink-0 ${
                            sub.badgeColor || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {sub.badge}
                        </span>
                      )}
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDirectItem = (item: DirectNavItem) => {
    const Icon = item.icon;
    const isItemActive = currentView === item.viewId;

    if (collapsed) {
      return (
        <Tooltip key={item.id} title={`${item.label} (${item.badge || ''})`} placement="right" mouseEnterDelay={0.3}>
          <button
            type="button"
            id={`nav-${item.id}-collapsed`}
            onClick={() => handleSelectDirectItem(item)}
            className={`flex items-center justify-center p-2 rounded-md transition-colors w-full cursor-pointer ${
              isItemActive
                ? 'bg-[#EFF6FF] dark:bg-blue-950/50 text-[#1665D8] dark:text-blue-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            aria-label={item.label}
          >
            <Icon className="w-4 h-4 shrink-0" />
          </button>
        </Tooltip>
      );
    }

    return (
      <Tooltip key={item.id} title={item.description} placement="right" mouseEnterDelay={0.3}>
        <button
          type="button"
          id={`nav-${item.id}`}
          onClick={() => handleSelectDirectItem(item)}
          className={`flex items-center justify-between px-3 py-1.5 rounded-md text-xs cursor-pointer w-full transition-colors ${
            isItemActive
              ? 'bg-[#EFF6FF] dark:bg-blue-950/40 text-[#1665D8] dark:text-blue-400 font-semibold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <Icon
              className={`w-4 h-4 shrink-0 ${
                isItemActive
                  ? 'text-[#1665D8] dark:text-blue-400'
                  : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
              }`}
            />
            <span>{item.label}</span>
          </div>
          {item.badge && (
            <span className="text-[9px] font-medium px-1 py-0.2 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              {item.badge}
            </span>
          )}
        </button>
      </Tooltip>
    );
  };

  return (
    <nav
      className={`py-2 px-1.5 space-y-1 ${className}`.trim()}
      aria-label="Main Application Navigation"
      role="navigation"
    >
      {/* 1. Sales Submenu */}
      {renderGroup(SALES_GROUP, salesExpanded, () => setSalesExpanded((p) => !p), isSalesActive)}

      {/* 2. Purchases Submenu */}
      {renderGroup(PURCHASES_GROUP, purchasesExpanded, () => setPurchasesExpanded((p) => !p), isPurchasesActive)}

      {/* 3. Quotations+ Submenu */}
      {renderGroup(QUOTATIONS_GROUP, quotationsExpanded, () => setQuotationsExpanded((p) => !p), isQuotationsActive)}

      {/* 4. Expenses+ Submenu */}
      {renderGroup(EXPENSES_GROUP, expensesExpanded, () => setExpensesExpanded((p) => !p), isExpensesActive)}

      {/* 5. SwipeAI Single Link */}
      {renderDirectItem(SINGLE_SWIPE_AI)}

      {/* 6. Products & Services Single Link */}
      {renderDirectItem(SINGLE_PRODUCTS_SERVICES)}

      {/* 7. Inventory Submenu */}
      {renderGroup(INVENTORY_GROUP, inventoryExpanded, () => setInventoryExpanded((p) => !p), isInventoryActive)}

      {/* 8. Payments Submenu (Selected / Expanded) */}
      {renderGroup(PAYMENTS_GROUP, paymentsExpanded, () => setPaymentsExpanded((p) => !p), isPaymentsActive)}

      {/* 9. Customers Single Link */}
      {renderDirectItem(SINGLE_CUSTOMERS)}

      {/* 10. Vendors Single Link */}
      {renderDirectItem(SINGLE_VENDORS)}

      {/* 11. Projects Single Link */}
      {renderDirectItem(SINGLE_PROJECTS)}

      {/* 12. Insights Single Link */}
      {renderDirectItem(SINGLE_INSIGHTS)}

      {/* 13. Reports Single Link */}
      {renderDirectItem(SINGLE_REPORTS)}

      {/* 14. OnlineStore Single Link */}
      {renderDirectItem(SINGLE_ONLINE_STORE)}

      {/* 15. E-way Bills Single Link */}
      {renderDirectItem(SINGLE_EWAY_BILLS)}

      {/* 16. Integrations Single Link */}
      {renderDirectItem(SINGLE_INTEGRATIONS)}

      {/* 17. More Submenu */}
      {renderGroup(MORE_GROUP, moreExpanded, () => setMoreExpanded((p) => !p), isMoreActive)}
    </nav>
  );
};

export default NavigationTabs;
