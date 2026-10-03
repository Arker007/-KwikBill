import React, { useMemo } from 'react';
import {
  ChevronLeft,
  Building2,
  User,
  Users,
  Sliders,
  Printer,
  Barcode,
  PenTool,
  FileText,
  Clock,
  Landmark,
  Wallet,
  Receipt,
  Zap,
  CreditCard,
  BookOpen,
  Radio,
  Share2,
  SlidersHorizontal,
  Gift,
  HelpCircle,
  Database,
  Lock,
} from 'lucide-react';
import { Button, Drawer, Flex, Grid, Layout, Tag, Typography, theme } from 'antd';
import {
  Menu,
  ProCard,
  type MenuItemType,
} from '@/shared/components/ui';
import { SwipeSettingsTabId } from '../types';

const { Sider } = Layout;
const { Text } = Typography;

export interface SwipeSidebarSection {
  title: string;
  items: {
    id: SwipeSettingsTabId;
    label: string;
    icon: React.ElementType;
    locked?: boolean;
  }[];
}

export const SWIPE_SETTINGS_SECTIONS: SwipeSidebarSection[] = [
  {
    title: 'Profile & Team',
    items: [
      { id: 'company-details', label: 'Company Details', icon: Building2 },
      { id: 'user-profile', label: 'User Profile', icon: User },
      { id: 'users-roles', label: 'All Users / Roles', icon: Users },
    ],
  },
  {
    title: 'General Settings',
    items: [
      { id: 'preferences', label: 'Preferences', icon: Sliders },
      { id: 'thermal-print', label: 'Thermal Print Settings', icon: Printer },
      { id: 'barcode-settings', label: 'Barcode Settings', icon: Barcode },
      { id: 'signatures', label: 'Signatures', icon: PenTool },
      { id: 'notes-terms', label: 'Notes & Terms', icon: FileText },
      { id: 'auto-reminders', label: 'Auto Reminders', icon: Clock },
    ],
  },
  {
    title: 'Banks & Payments',
    items: [
      { id: 'banks', label: 'Banks', icon: Landmark },
      { id: 'wallet', label: 'Payment Accounts', icon: Wallet },
      { id: 'billing', label: 'Invoice Numbering', icon: Receipt },
    ],
  },
  {
    title: 'Integrations & Cloud',
    items: [
      { id: 'swipe-ai', label: 'Smart Assistant', icon: Zap },
      { id: 'payment-gateway', label: 'Payment Gateway', icon: CreditCard },
      { id: 'tally-integration', label: 'Tally Integration', icon: BookOpen },
      { id: 'api-webhooks', label: 'API & Webhooks', icon: Radio },
      { id: 'integrations', label: 'Google Drive Sync', icon: Share2 },
      { id: 'supabase-cloud', label: 'Supabase Cloud', icon: Database },
    ],
  },
  {
    title: 'System & Tools',
    items: [
      { id: 'advanced-features', label: 'Advanced Features', icon: SlidersHorizontal },
      { id: 'social-links', label: 'Social Links', icon: Share2 },
      { id: 'referral', label: 'Referral & Rewards', icon: Gift },
      { id: 'support', label: 'Help & Support', icon: HelpCircle },
    ],
  },
];

export interface SwipeSettingsSidebarProps {
  activeTab: SwipeSettingsTabId | string;
  onSelectTab: (tabId: SwipeSettingsTabId) => void;
  onBackToHome: () => void;
  className?: string;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SwipeSettingsSidebar: React.FC<SwipeSettingsSidebarProps> = ({
  activeTab,
  onSelectTab,
  onBackToHome,
  className = '',
  mobileOpen = false,
  onCloseMobile,
}) => {
  const screens = Grid.useBreakpoint();
  const { token } = theme.useToken();
  const isDesktop = Boolean(screens.md);

  const handleItemClick = (tabId: SwipeSettingsTabId) => {
    onSelectTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const menuItems = useMemo<MenuItemType[]>(
    () =>
      SWIPE_SETTINGS_SECTIONS.map((section, sectionIndex) => ({
        key: `settings-group-${sectionIndex}`,
        type: 'group' as const,
        label: (
          <Text
            strong
            style={{
              color: token.colorTextDescription,
              fontSize: token.fontSizeSM,
              letterSpacing: 0.3,
            }}
          >
            {section.title}
          </Text>
        ),
        children: section.items.map(item => {
          const Icon = item.icon;
          return {
            key: item.id,
            icon: <Icon size={16} strokeWidth={1.8} />,
            disabled: item.locked,
            label: (
              <Flex
                id={`swipe-tab-${item.id}`}
                align="center"
                justify="space-between"
                gap="small"
              >
                <Text ellipsis>{item.label}</Text>
                {item.locked ? (
                  <Tag bordered={false} icon={<Lock size={10} />}>
                    Locked
                  </Tag>
                ) : null}
              </Flex>
            ),
          };
        }),
      })),
    [token.colorTextDescription, token.fontSizeSM]
  );

  const sidebarPanel = (
    <Flex
      vertical
      style={{
        height: '100%',
        minHeight: 0,
        background: token.colorBgContainer,
      }}
    >
      <ProCard
        variant="borderless"
        headerBordered
        title={
          <Flex align="center" gap="small">
            <SlidersHorizontal size={18} color={token.colorPrimary} />
            <Text strong>Settings</Text>
          </Flex>
        }
        subTitle={<Text type="secondary">Business configuration</Text>}
        extra={<Tag color="blue">{menuItems.reduce((count, group) => count + (group.children?.length || 0), 0)}</Tag>}
        style={{ borderRadius: 0, flexShrink: 0 }}
        styles={{
          header: { paddingInline: token.paddingSM, minHeight: 64 },
          body: { padding: token.paddingSM },
        }}
      >
        <Button
          id="swipe-back-home-btn"
          block
          icon={<ChevronLeft size={16} />}
          onClick={() => {
            onBackToHome();
            onCloseMobile?.();
          }}
          style={{ justifyContent: 'flex-start' }}
        >
          Back to Dashboard
        </Button>
      </ProCard>

      <Flex
        flex="1"
        style={{
          minHeight: 0,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          padding: `${token.paddingXS}px ${token.paddingSM}px ${token.paddingLG}px`,
          scrollbarGutter: 'stable',
        }}
      >
        <Menu
          id="swipe-settings-menu"
          items={menuItems}
          selectedKeys={[String(activeTab)]}
          mode="inline"
          onSelect={({ key }) => handleItemClick(key as SwipeSettingsTabId)}
          style={{ width: '100%', background: 'transparent' }}
        />
      </Flex>
    </Flex>
  );

  return (
    <>
      {!isDesktop ? (
        <Drawer
          id="swipe-settings-sidebar-mobile"
          title="Settings"
          placement="left"
          width={288}
          open={mobileOpen}
          onClose={onCloseMobile}
          destroyOnHidden
          styles={{ body: { padding: 0, height: '100%', overflow: 'hidden' } }}
        >
          {sidebarPanel}
        </Drawer>
      ) : (
        <Sider
          id="swipe-settings-sidebar"
          width={272}
          trigger={null}
          className={className}
          style={{
            height: '100%',
            minHeight: 0,
            flexShrink: 0,
            overflow: 'hidden',
            background: token.colorBgContainer,
            borderInlineEnd: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          {sidebarPanel}
        </Sider>
      )}
    </>
  );
};

export default SwipeSettingsSidebar;
