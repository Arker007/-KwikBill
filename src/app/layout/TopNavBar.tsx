import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Building2,
  ChevronDown,
  Pencil,
  Download,
  Bell,
  Sun,
  Moon,
  HardDrive,
  Settings,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';

interface BusinessProfile {
  id?: string;
  businessName?: string;
  [key: string]: unknown;
}

export interface TopNavBarProps {
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
  className?: string;
  children?: React.ReactNode;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  profile,
  allProfiles = [],
  onSwitchProfile,
  onOpenSettings,
  currentView,
  onSelectView,
  darkMode,
  onToggleDarkMode,
  notifTotal = 0,
  onToggleNotifs,
  updateBannerVisible = false,
  updateLatestVersion = '',
  onOpenUpdateModal,
  serverStatus = 'online',
  className = '',
  children,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('freegstbill_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const profileMenuRef = useRef<HTMLDivElement>(null);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('freegstbill_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  useEffect(() => {
    if (!showProfileMenu) return;
    const handler = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showProfileMenu]);

  const businessName = profile?.businessName || 'My Business';
  const hasMultipleProfiles = allProfiles.length > 1;

  // Clone navigation child to pass collapsed state
  const renderedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { collapsed } as Record<string, unknown>);
    }
    return child;
  });

  return (
    <aside
      className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${className}`.trim()}
      aria-label="Sidebar Navigation"
    >
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo" title="Free GST Billing Software">
          <FileText size={18} />
        </div>
        {!collapsed && (
          <div className="sidebar-brand-text">
            <div className="sidebar-title-row">
              <h2 className="sidebar-title">GST Billing</h2>
              <span className="sidebar-tag">PRO</span>
            </div>
            <p className="sidebar-subtitle">by DiceCodes</p>
          </div>
        )}
      </div>

      {/* Profile Switcher */}
      <div className="profile-switcher" ref={profileMenuRef}>
        <div className="profile-switcher-row">
          <button
            type="button"
            className="profile-switcher-btn"
            onClick={() => hasMultipleProfiles && setShowProfileMenu((v) => !v)}
            title={businessName}
            style={{ cursor: hasMultipleProfiles ? 'pointer' : 'default' }}
          >
            <Building2 size={14} style={{ flexShrink: 0 }} />
            {!collapsed && <span className="profile-switcher-name">{businessName}</span>}
            {!collapsed && hasMultipleProfiles && (
              <ChevronDown size={13} style={{ marginLeft: 'auto', opacity: 0.6 }} />
            )}
          </button>
          {!collapsed && (
            <button
              type="button"
              className="profile-switcher-edit"
              onClick={() => {
                setShowProfileMenu(false);
                if (onOpenSettings) onOpenSettings();
                else onSelectView('settings');
              }}
              title="Edit business profile"
            >
              <Pencil size={13} />
            </button>
          )}
        </div>

        {showProfileMenu && (
          <div className="profile-switcher-menu">
            {allProfiles.map((bp) => {
              const name = bp.businessName || 'Unnamed Profile';
              const isActive = name.trim().toLowerCase() === businessName.trim().toLowerCase();
              return (
                <button
                  key={bp.id || name}
                  type="button"
                  className={`profile-switcher-item${isActive ? ' active' : ''}`}
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onSwitchProfile) onSwitchProfile(bp);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{name}</span>
                    {isActive && <Check size={13} style={{ color: '#1677ff' }} />}
                  </div>
                </button>
              );
            })}
            <button
              type="button"
              className="profile-switcher-item profile-switcher-manage"
              onClick={() => {
                setShowProfileMenu(false);
                if (onOpenSettings) onOpenSettings();
                else onSelectView('settings');
              }}
            >
              Manage profiles...
            </button>
          </div>
        )}
      </div>

      {/* Main Navigation Items */}
      {renderedChildren}

      {/* Ant Design Sider Footer */}
      <div className="sidebar-footer">
        {updateBannerVisible && (
          <button
            type="button"
            className="nav-btn"
            onClick={onOpenUpdateModal}
            title={updateLatestVersion ? `v${updateLatestVersion} is available` : 'Update available'}
            style={{
              background: 'var(--info-bg)',
              color: 'var(--info-text)',
              fontWeight: 600,
            }}
          >
            <Download size={17} style={{ flexShrink: 0 }} />
            {!collapsed && (
              <span className="nav-btn-label">
                Update to v{updateLatestVersion || 'new'}
              </span>
            )}
            {!collapsed && (
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#faad14',
                  boxShadow: '0 0 0 2px rgba(250,173,20,0.25)',
                  flexShrink: 0,
                }}
              />
            )}
          </button>
        )}

        {onToggleNotifs && (
          <button
            type="button"
            className="nav-btn"
            onClick={onToggleNotifs}
            title={collapsed ? `Notifications (${notifTotal})` : 'Notifications'}
          >
            <Bell size={17} style={{ flexShrink: 0 }} />
            {!collapsed && <span className="nav-btn-label">Notifications</span>}
            {notifTotal > 0 && (
              <span
                style={{
                  minWidth: 16,
                  height: 16,
                  padding: '0 4px',
                  borderRadius: '8px',
                  background: '#ff4d4f',
                  color: '#fff',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: collapsed ? '-8px' : 'auto',
                  marginTop: collapsed ? '-10px' : 0,
                }}
              >
                {notifTotal > 99 ? '99+' : notifTotal}
              </span>
            )}
          </button>
        )}

        <button
          type="button"
          className="nav-btn"
          onClick={onToggleDarkMode}
          title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {darkMode ? <Sun size={17} style={{ flexShrink: 0 }} /> : <Moon size={17} style={{ flexShrink: 0 }} />}
          {!collapsed && <span className="nav-btn-label">{darkMode ? 'Light Theme' : 'Dark Theme'}</span>}
        </button>

        <button
          type="button"
          className={`nav-btn ${currentView === 'controlpanel' ? 'nav-btn-active' : ''}`}
          onClick={() => onSelectView('controlpanel')}
          title={collapsed ? 'Control Panel' : undefined}
        >
          <HardDrive size={17} style={{ flexShrink: 0 }} />
          {!collapsed && <span className="nav-btn-label">Control Panel</span>}
        </button>

        <button
          type="button"
          className={`nav-btn ${currentView === 'settings' ? 'nav-btn-active' : ''}`}
          onClick={() => (onOpenSettings ? onOpenSettings() : onSelectView('settings'))}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings size={17} style={{ flexShrink: 0 }} />
          {!collapsed && <span className="nav-btn-label">Settings</span>}
          {updateBannerVisible && !collapsed && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#faad14',
                marginLeft: 'auto',
              }}
              title="Update available"
            />
          )}
        </button>

        {/* Ant Design Status Badge */}
        <div className={`ant-server-status ant-status-${serverStatus}`}>
          <span className="ant-status-dot" />
          <span className="ant-status-text">
            {serverStatus === 'online'
              ? 'App Ready'
              : serverStatus === 'offline'
              ? 'Offline'
              : 'Connecting...'}
          </span>
        </div>

        {/* Ant Design Collapse Trigger */}
        <button
          type="button"
          className="sidebar-collapse-trigger"
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          <span>Collapse</span>
        </button>
      </div>
    </aside>
  );
};

export default TopNavBar;
