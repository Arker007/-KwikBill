import React from 'react';
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Flex,
  Grid,
  Layout,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import {
  Bell,
  Download,
  Menu,
  Moon,
  Plus,
  Search,
  Sparkles,
  Sun,
} from 'lucide-react';
import { CompanySwitcherDropdown } from './components/CompanySwitcherDropdown';

const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

export interface BusinessProfile {
  id?: string;
  businessName?: string;
  [key: string]: unknown;
}

export interface AppHeaderProps {
  profile: BusinessProfile | null;
  allProfiles?: BusinessProfile[];
  onSwitchProfile?: (profile: BusinessProfile) => void;
  onOpenSettings?: () => void;
  currentView: string;
  onSelectView: (viewId: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  notifTotal?: number;
  onToggleNotifs?: () => void;
  updateBannerVisible?: boolean;
  updateLatestVersion?: string;
  onOpenUpdateModal?: () => void;
  serverStatus?: 'checking' | 'online' | 'offline';
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
  onOpenCommandPalette?: () => void;
  onNewInvoice?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  profile,
  allProfiles = [],
  onSwitchProfile,
  onOpenSettings,
  onSelectView,
  darkMode,
  onToggleDarkMode,
  notifTotal = 0,
  onToggleNotifs,
  updateBannerVisible = false,
  updateLatestVersion = '',
  onOpenUpdateModal,
  serverStatus = 'online',
  onToggleSidebar,
  sidebarCollapsed = false,
  onOpenCommandPalette,
  onNewInvoice,
}) => {
  const screens = useBreakpoint();
  const { token } = theme.useToken();
  const businessName = profile?.businessName || 'My Business';
  const companyInitials =
    businessName
      .split(' ')
      .map((word) => word[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'KB';

  const statusLabel =
    serverStatus === 'online'
      ? 'Connected'
      : serverStatus === 'offline'
        ? 'Offline'
        : 'Connecting';
  const statusColor =
    serverStatus === 'online' ? 'success' : serverStatus === 'offline' ? 'error' : 'warning';

  return (
    <Header
      id="app-header"
      aria-label="Global application header"
      className="app-header"
      style={{
        height: 64,
        minHeight: 64,
        paddingInline: screens.sm ? 20 : 10,
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: token.boxShadowTertiary,
        lineHeight: 'normal',
      }}
    >
      <Flex align="center" justify="space-between" gap={12} style={{ width: '100%', minWidth: 0 }}>
        <Flex align="center" gap={screens.sm ? 12 : 6} style={{ minWidth: 0, flexShrink: 0 }}>
          {onToggleSidebar && !screens.md && (
            <Tooltip title={sidebarCollapsed ? 'Open navigation' : 'Close navigation'}>
              <Button
                id="header-navigation-toggle"
                type="text"
                icon={<Menu size={18} />}
                onClick={onToggleSidebar}
                aria-label="Toggle navigation menu"
              />
            </Tooltip>
          )}

          <Tooltip title="Go to dashboard">
            <Button
              id="header-brand-home"
              type="text"
              onClick={() => onSelectView('dashboard')}
              style={{ height: 44, paddingInline: screens.sm ? 6 : 2 }}
            >
              <Flex align="center" gap={9}>
                <Avatar
                  shape="square"
                  size={32}
                  style={{ background: token.colorPrimary, fontWeight: 700 }}
                >
                  K
                </Avatar>
                {screens.sm && (
                  <Flex vertical align="flex-start" gap={0}>
                    <Text strong style={{ fontSize: 16, lineHeight: 1.15 }}>
                      KwikBill
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.2 }}>
                      GST Billing
                    </Text>
                  </Flex>
                )}
              </Flex>
            </Button>
          </Tooltip>

          {screens.lg && (
            <>
              <Divider type="vertical" style={{ height: 28, marginInline: 0 }} />
              <CompanySwitcherDropdown
                profile={profile}
                allProfiles={allProfiles}
                onSwitchProfile={onSwitchProfile}
                onOpenSettings={onOpenSettings}
                onSelectView={onSelectView}
              />
            </>
          )}
        </Flex>

        {screens.md && (
          <Button
            id="header-command-search"
            onClick={onOpenCommandPalette}
            style={{
              width: 'min(440px, 34vw)',
              height: 36,
              paddingInline: 12,
              background: token.colorFillTertiary,
              borderColor: token.colorBorderSecondary,
            }}
          >
            <Flex align="center" gap={8} style={{ width: '100%' }}>
              <Search size={15} color={token.colorTextTertiary} />
              <Text type="secondary" ellipsis style={{ flex: 1, textAlign: 'left', fontSize: 13 }}>
                Search invoices, clients, products or ask AI
              </Text>
              <Tag bordered={false} style={{ marginInlineEnd: 0, fontSize: 11 }}>
                Ctrl K
              </Tag>
            </Flex>
          </Button>
        )}

        <Flex align="center" gap={screens.sm ? 6 : 2} style={{ flexShrink: 0 }}>
          {screens.xl && (
            <Tooltip title={`Server status: ${statusLabel}`}>
              <Tag color={statusColor} style={{ marginInlineEnd: 2 }}>
                {statusLabel}
              </Tag>
            </Tooltip>
          )}

          {updateBannerVisible && onOpenUpdateModal && (
            <Tooltip title={`Update ${updateLatestVersion ? `v${updateLatestVersion} ` : ''}available`}>
              <Badge dot color={token.colorWarning}>
                <Button
                  id="header-update-button"
                  type="text"
                  icon={<Download size={17} />}
                  onClick={onOpenUpdateModal}
                  aria-label="View available update"
                />
              </Badge>
            </Tooltip>
          )}

          {onNewInvoice && screens.sm && (
            <Tooltip title="Create new invoice (Ctrl+N)">
              <Button
                id="header-new-invoice"
                type="primary"
                icon={<Plus size={16} />}
                onClick={() => onNewInvoice()}
              >
                {screens.lg ? 'New invoice' : null}
              </Button>
            </Tooltip>
          )}

          {!screens.md && (
            <Tooltip title="Search and commands (Ctrl+K)">
              <Button
                id="header-mobile-search"
                type="text"
                icon={<Sparkles size={17} />}
                onClick={onOpenCommandPalette}
                aria-label="Open search and commands"
              />
            </Tooltip>
          )}

          {onToggleNotifs && (
            <Tooltip title={`Notifications (${notifTotal})`}>
              <Badge count={notifTotal} size="small" overflowCount={99}>
                <Button
                  id="header-notifications"
                  type="text"
                  icon={<Bell size={17} />}
                  onClick={onToggleNotifs}
                  aria-label="View notifications"
                />
              </Badge>
            </Tooltip>
          )}

          <Tooltip title={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}>
            <Button
              id="header-theme-toggle"
              type="text"
              icon={darkMode ? <Sun size={17} /> : <Moon size={17} />}
              onClick={onToggleDarkMode}
              aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            />
          </Tooltip>

          <Tooltip title={`${businessName} — open settings`}>
            <Button
              id="header-profile-settings"
              type="text"
              onClick={() => onSelectView('settings')}
              aria-label="Open business profile settings"
              style={{ paddingInline: 4 }}
            >
              <Avatar size={30} style={{ background: token.colorPrimary, fontSize: 12 }}>
                {companyInitials}
              </Avatar>
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
    </Header>
  );
};

export default AppHeader;
