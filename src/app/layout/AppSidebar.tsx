import React, { useEffect, useMemo, useState } from 'react';
import { Button, Drawer, Flex, Grid, Layout, Tag, Tooltip, Typography, theme } from 'antd';
import {
  UserPlus,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Menu, ProCard, type MenuItemType } from '@/shared/components/ui';
import type { NavItem } from './NavigationTabs';
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
  type DirectNavItem,
  type NavGroup,
  type NavSubItem,
} from './navConfig';

const { Sider } = Layout;
const { Text } = Typography;

type MainNavEntry =
  | { type: 'group'; value: NavGroup }
  | { type: 'direct'; value: DirectNavItem };

const MAIN_NAV_ENTRIES: MainNavEntry[] = [
  { type: 'group', value: SALES_GROUP },
  { type: 'group', value: PURCHASES_GROUP },
  { type: 'group', value: QUOTATIONS_GROUP },
  { type: 'group', value: EXPENSES_GROUP },
  { type: 'direct', value: SINGLE_SWIPE_AI },
  { type: 'direct', value: SINGLE_PRODUCTS_SERVICES },
  { type: 'group', value: INVENTORY_GROUP },
  { type: 'group', value: PAYMENTS_GROUP },
  { type: 'direct', value: SINGLE_CUSTOMERS },
  { type: 'direct', value: SINGLE_VENDORS },
  { type: 'direct', value: SINGLE_PROJECTS },
  { type: 'direct', value: SINGLE_INSIGHTS },
  { type: 'direct', value: SINGLE_REPORTS },
  { type: 'direct', value: SINGLE_ONLINE_STORE },
  { type: 'direct', value: SINGLE_EWAY_BILLS },
  { type: 'direct', value: SINGLE_INTEGRATIONS },
  { type: 'group', value: MORE_GROUP },
];

export interface AppSidebarProps {
  navItems?: NavItem[];
  currentView: string;
  currentInvoiceType?: string;
  onSelectView: (viewId: string, invoiceType?: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onNewInvoice?: (invoiceType?: string) => void;
  onOpenSettingsTab?: (tab: string) => void;
  className?: string;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  navItems,
  currentView,
  currentInvoiceType,
  onSelectView,
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
  onOpenSettingsTab,
  className = '',
}) => {
  const screens = Grid.useBreakpoint();
  const { token } = theme.useToken();
  const isDesktop = Boolean(screens.md);
  const effectiveCollapsed = isDesktop ? collapsed : false;
  const [openKeys, setOpenKeys] = useState<string[]>(['group-payments']);

  const handleSelectView = (viewId: string, invoiceType?: string) => {
    onSelectView(viewId, invoiceType);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleOpenSettings = (tab?: string) => {
    if (tab && onOpenSettingsTab) {
      onOpenSettingsTab(tab);
    } else {
      onSelectView('settings');
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const routeCandidates = useMemo(
    () =>
      MAIN_NAV_ENTRIES.flatMap(entry => {
        if (entry.type === 'direct') {
          return [{
            key: entry.value.id,
            viewId: entry.value.viewId,
            invoiceType: undefined as string | undefined,
            parentKey: undefined as string | undefined,
          }];
        }

        return (entry.value.children || []).map(child => ({
          key: child.id,
          viewId: child.viewId,
          invoiceType: child.invoiceType,
          parentKey: entry.value.id,
        }));
      }),
    []
  );

  const selectedRoute = useMemo(() => {
    if (currentView === 'settings') return undefined;

    const exact = currentInvoiceType
      ? routeCandidates.find(candidate =>
          candidate.viewId === currentView && candidate.invoiceType === currentInvoiceType
        )
      : undefined;

    return exact || routeCandidates.find(candidate =>
      candidate.viewId === currentView && !candidate.invoiceType
    );
  }, [currentInvoiceType, currentView, routeCandidates]);

  useEffect(() => {
    if (!selectedRoute?.parentKey || effectiveCollapsed) return;
    setOpenKeys(previous =>
      previous.includes(selectedRoute.parentKey as string)
        ? previous
        : [...previous, selectedRoute.parentKey as string]
    );
  }, [effectiveCollapsed, selectedRoute?.parentKey]);

  const menuItems = useMemo<MenuItemType[]>(() => {
    const renderLabel = (id: string, label: string, badge?: string) => (
      <Flex id={`nav-${id}`} align="center" justify="space-between" gap="small">
        <Text ellipsis>{label}</Text>
        {badge ? <Tag bordered={false} color="blue">{badge}</Tag> : null}
      </Flex>
    );

    return MAIN_NAV_ENTRIES.map(entry => {
      const Icon = entry.value.icon;

      if (entry.type === 'direct') {
        return {
          key: entry.value.id,
          icon: <Icon size={16} strokeWidth={1.8} />,
          label: renderLabel(entry.value.id, entry.value.label, entry.value.badge),
        };
      }

      return {
        key: entry.value.id,
        icon: <Icon size={16} strokeWidth={1.8} />,
        label: renderLabel(entry.value.id, entry.value.label, entry.value.badge),
        children: (entry.value.children || []).map(child => {
          const ChildIcon = child.icon;
          return {
            key: child.id,
            icon: ChildIcon ? <ChildIcon size={14} strokeWidth={1.8} /> : undefined,
            label: renderLabel(child.id, child.label, child.badge),
          };
        }),
      };
    });
  }, []);

  const selectSubItem = (subItem: NavSubItem) => {
    if (subItem.isExternalTab && subItem.settingsSection && onOpenSettingsTab) {
      onOpenSettingsTab(subItem.settingsSection);
      onCloseMobile?.();
      return;
    }
    handleSelectView(subItem.viewId, subItem.invoiceType);
  };

  const handleMenuSelect = (key: string) => {
    for (const entry of MAIN_NAV_ENTRIES) {
      if (entry.type === 'direct' && entry.value.id === key) {
        if (entry.value.isExternalTab && entry.value.settingsSection && onOpenSettingsTab) {
          onOpenSettingsTab(entry.value.settingsSection);
          onCloseMobile?.();
        } else {
          handleSelectView(entry.value.viewId);
        }
        return;
      }

      if (entry.type === 'group') {
        const child = entry.value.children?.find(item => item.id === key);
        if (child) {
          selectSubItem(child);
          return;
        }
      }
    }
  };

  const sidebarPanel = (
    <Flex
      vertical
      style={{
        height: '100%',
        minHeight: 0,
        background: token.colorBgContainer,
      }}
    >
      <Flex
        flex="1"
        style={{
          minHeight: 0,
          overflowY: effectiveCollapsed ? 'visible' : 'auto',
          overflowX: effectiveCollapsed ? 'visible' : 'hidden',
          overscrollBehavior: 'contain',
          padding: `${token.paddingXS}px ${effectiveCollapsed ? token.paddingXXS : token.paddingXS}px`,
          scrollbarGutter: effectiveCollapsed ? undefined : 'stable',
        }}
      >
        <Menu
          id="app-navigation-menu"
          items={menuItems}
          selectedKeys={selectedRoute ? [selectedRoute.key] : []}
          openKeys={effectiveCollapsed ? undefined : openKeys}
          inlineCollapsed={effectiveCollapsed}
          mode="inline"
          onOpenChange={setOpenKeys}
          onSelect={({ key }) => handleMenuSelect(key)}
          style={{ width: '100%', background: 'transparent' }}
        />
      </Flex>

      <ProCard
        id="nav-menu-footer"
        variant="borderless"
        headerBordered
        style={{ borderRadius: 0, flexShrink: 0 }}
        styles={{ body: { padding: effectiveCollapsed ? token.paddingXXS : token.paddingSM } }}
      >
        <Flex vertical gap={token.marginXXS}>
          <Tooltip title={effectiveCollapsed ? 'Invite Users' : undefined} placement="right">
            <Button
              id="sidebar-invite-users"
              type="text"
              block
              icon={<UserPlus size={16} />}
              onClick={() => handleOpenSettings('section-users')}
              style={{ justifyContent: effectiveCollapsed ? 'center' : 'flex-start' }}
            >
              {effectiveCollapsed ? null : 'Invite Users'}
            </Button>
          </Tooltip>

          <Tooltip title={effectiveCollapsed ? 'Settings' : undefined} placement="right">
            <Button
              id="sidebar-settings"
              type={currentView === 'settings' ? 'primary' : 'text'}
              block
              icon={<Settings size={16} />}
              onClick={() => handleSelectView('settings')}
              style={{ justifyContent: effectiveCollapsed ? 'center' : 'flex-start' }}
            >
              {effectiveCollapsed ? null : 'Settings'}
            </Button>
          </Tooltip>

          {isDesktop ? (
            <Tooltip title={effectiveCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
              <Button
                id="sidebar-collapse-arrow"
                type="text"
                block
                icon={effectiveCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
                onClick={onToggleCollapse}
                aria-label={effectiveCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                style={{ justifyContent: effectiveCollapsed ? 'center' : 'flex-start' }}
              >
                {effectiveCollapsed ? null : 'Collapse sidebar'}
              </Button>
            </Tooltip>
          ) : null}
        </Flex>
      </ProCard>
    </Flex>
  );

  return (
    <>
      {!isDesktop ? (
        <Drawer
          id="app-sidebar-mobile"
          title="Navigation"
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
          id="app-sidebar"
          aria-label="Application Navigation"
          width={240}
          collapsedWidth={64}
          collapsed={collapsed}
          trigger={null}
          className={className}
          style={{
            height: '100%',
            minHeight: 0,
            flexShrink: 0,
            overflow: collapsed ? 'visible' : 'hidden',
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

export default AppSidebar;
