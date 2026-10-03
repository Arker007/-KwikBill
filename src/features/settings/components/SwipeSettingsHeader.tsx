import React from 'react';
import { Tooltip, ConfigProvider } from 'antd';
import {
  Sparkles,
  Zap,
  Bell,
  Megaphone,
  User,
  Menu,
} from 'lucide-react';
import { useTheme } from '@/app/providers/ThemeProvider';
import { getAntdTheme } from '@/shared/components/ui/AntdThemeConfig';
import {
  CompanySwitcherDropdown,
  BusinessProfile,
} from '@/app/layout/components/CompanySwitcherDropdown';

export interface BusinessProfileOption {
  id?: string;
  name: string;
  businessName?: string;
  tradeName?: string;
  legalName?: string;
  logo?: string;
  gstin?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface SwipeSettingsHeaderProps {
  currentBusinessName?: string;
  currentBusinessLogo?: string;
  currentProfile?: BusinessProfile;
  allProfiles?: BusinessProfile[];
  profiles?: BusinessProfileOption[];
  onSelectProfile?: (profileId: string) => void;
  onAddNewProfile?: () => void;
  onOpenSearch?: () => void;
  onOpenQuickActions?: () => void;
  onOpenNotifications?: () => void;
  onOpenAnnouncements?: () => void;
  onLogoClick?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const SwipeSettingsHeader: React.FC<SwipeSettingsHeaderProps> = ({
  currentBusinessName = 'Vishal Enterprise',
  currentBusinessLogo,
  currentProfile,
  allProfiles,
  profiles = [],
  onSelectProfile,
  onAddNewProfile,
  onOpenSearch,
  onOpenQuickActions,
  onOpenNotifications,
  onOpenAnnouncements,
  onLogoClick,
  onToggleMobileSidebar,
}) => {
  const { isDark } = useTheme();

  // Adapt single profile
  const resolvedProfile: BusinessProfile = currentProfile || {
    businessName: currentBusinessName,
    companyName: currentBusinessName,
    tradeName: currentBusinessName,
    logo: currentBusinessLogo,
  };

  // Adapt list of profiles
  const resolvedAllProfiles: BusinessProfile[] =
    allProfiles && allProfiles.length > 0
      ? allProfiles
      : profiles.map((p) => ({
          id: p.id,
          businessName: p.businessName || p.name,
          tradeName: p.tradeName || p.legalName || p.businessName || p.name,
          logo: p.logo,
          gstin: p.gstin,
          phone: p.phone,
        }));

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <header
        id="swipe-global-header"
        className="bg-white dark:bg-[#141414] border-b border-gray-200 dark:border-neutral-800 h-14 sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between select-none transition-colors"
      >
        {/* Left: Mobile Toggle, Brand Logo & Active Company Switcher */}
        <div className="flex items-center space-x-2.5 sm:space-x-5">
          {/* Mobile Sidebar Menu Toggle */}
          {onToggleMobileSidebar && (
            <button
              type="button"
              id="swipe-mobile-menu-btn"
              onClick={onToggleMobileSidebar}
              className="md:hidden p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors flex items-center shrink-0 cursor-pointer"
              aria-label="Toggle Settings Navigation Menu"
              title="Open Settings Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Swipe / KwikBill Logo */}
          <div
            id="swipe-logo-btn"
            onClick={onLogoClick}
            className="flex items-center space-x-2 cursor-pointer group"
            role="button"
            tabIndex={0}
            title="KwikBill GST Billing"
          >
            <div className="w-7 h-7 bg-gradient-to-tr from-[#1665D8] to-[#2563EB] group-hover:from-[#1254B7] group-hover:to-[#1D4ED8] rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm transition-colors">
              K
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Kwik<span className="text-[#1665D8] dark:text-blue-400">Bill</span>
            </span>
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-gray-200 dark:bg-neutral-700 hidden sm:block" />

          {/* Ant Design Company Switcher Dropdown */}
          <CompanySwitcherDropdown
            profile={resolvedProfile}
            allProfiles={resolvedAllProfiles}
            onSwitchProfile={(p) => {
              if (p.id && onSelectProfile) {
                onSelectProfile(p.id);
              }
            }}
            onOpenSettings={onAddNewProfile}
          />
        </div>

        {/* Right: Search & Action Tools */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Ask AI search pill */}
          <Tooltip title="Press Ctrl+K to search actions" placement="bottom">
            <div
              id="swipe-search-pill"
              onClick={onOpenSearch}
              className="relative hidden sm:flex items-center w-52 md:w-64 h-8 rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 px-3 hover:border-gray-300 dark:hover:border-neutral-600 transition-colors cursor-pointer"
              role="search"
            >
              <Sparkles className="w-3.5 h-3.5 text-gray-400 dark:text-gray-400 mr-2 shrink-0" />
              <span className="text-xs text-gray-400 dark:text-gray-400 font-normal select-none">
                Ask AI Assistant
              </span>
              <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-400 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 px-1.5 py-0.5 rounded shadow-2xs font-mono">
                ctrl+k
              </span>
            </div>
          </Tooltip>

          {/* Action Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2 text-gray-500 dark:text-gray-400">
            <Tooltip title="Quick Actions">
              <button
                id="swipe-quick-actions-btn"
                type="button"
                onClick={onOpenQuickActions}
                className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                aria-label="Quick Actions"
              >
                <Zap className="w-4 h-4 fill-current" />
              </button>
            </Tooltip>

            <Tooltip title="Notifications">
              <button
                id="swipe-notifications-btn"
                type="button"
                onClick={onOpenNotifications}
                className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
              </button>
            </Tooltip>

            <Tooltip title="Announcements & Updates">
              <button
                id="swipe-announcements-btn"
                type="button"
                onClick={onOpenAnnouncements}
                className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                aria-label="Announcements"
              >
                <Megaphone className="w-4 h-4" />
              </button>
            </Tooltip>

            <Tooltip title="Business Profile">
              <button
                id="swipe-user-profile-btn"
                type="button"
                className="w-7 h-7 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center hover:ring-2 hover:ring-[#1E61EB] transition-all cursor-pointer"
                aria-label="User Profile"
              >
                <User className="w-4 h-4 text-gray-600 dark:text-gray-300 fill-current" />
              </button>
            </Tooltip>
          </div>
        </div>
      </header>
    </ConfigProvider>
  );
};

export default SwipeSettingsHeader;
