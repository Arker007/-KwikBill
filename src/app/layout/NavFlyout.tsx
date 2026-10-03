import React, { useState } from 'react';
import { Tooltip } from 'antd';
import { NavGroup, NavSubItem } from './navConfig';

interface NavGroupFlyoutProps {
  group: NavGroup;
  isActive: boolean;
  currentView: string;
  currentInvoiceType?: string;
  onSelectSubItem: (sub: NavSubItem) => void;
  onSelectGroupDefault: () => void;
}

export const NavGroupFlyout: React.FC<NavGroupFlyoutProps> = ({
  group,
  isActive,
  currentView,
  currentInvoiceType,
  onSelectSubItem,
  onSelectGroupDefault,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = group.icon;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Tooltip title={group.label} placement="right" mouseEnterDelay={0.3}>
        <button
          type="button"
          id={`nav-${group.id}-collapsed`}
          onClick={onSelectGroupDefault}
          className={`flex items-center justify-center p-2 rounded-md transition-colors w-full cursor-pointer ${
            isActive
              ? 'bg-[#EFF6FF] dark:bg-blue-950/50 text-[#1665D8] dark:text-blue-400 font-medium'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          aria-label={group.label}
        >
          <Icon className="w-4 h-4 shrink-0" />
        </button>
      </Tooltip>

      {/* Flyout Menu for Collapsed Sidebar */}
      {isOpen && group.children && (
        <div
          className="absolute left-full ml-2 top-0 z-50 min-w-[210px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1.5 px-1 ant-motion-dropdown"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
            {group.label}
          </div>
          <div className="space-y-0.5">
            {group.children.map((sub) => {
              const SubIcon = sub.icon;
              const isSubActive =
                currentView === sub.viewId &&
                (!sub.invoiceType || currentInvoiceType === sub.invoiceType);

              return (
                <button
                  key={sub.id}
                  type="button"
                  id={`flyout-${sub.id}`}
                  onClick={() => {
                    onSelectSubItem(sub);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSubActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-[#1665D8] dark:text-blue-400 font-medium'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center space-x-2">
                    {SubIcon && <SubIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />}
                    <span>{sub.label}</span>
                  </div>
                  {sub.badge && (
                    <span
                      className={`text-[9px] font-semibold px-1 py-0.2 rounded ml-2 shrink-0 ${
                        sub.badgeColor || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {sub.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
