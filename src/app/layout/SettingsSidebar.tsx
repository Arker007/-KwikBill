import React from 'react';
import { Tooltip } from 'antd';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  Layers,
  FileText,
  Printer,
  Sliders,
  Bell,
  Globe,
  Database,
  Cloud,
  ArrowLeftRight,
  Sparkles,
  Settings,
  LucideIcon,
} from 'lucide-react';

export interface SettingsSectionItem {
  id: string;
  label: string;
  icon: LucideIcon;
  group: string;
}

export const SETTINGS_SECTIONS: SettingsSectionItem[] = [
  { id: 'section-company', label: 'Company', icon: Building2, group: 'Business & Print' },
  { id: 'section-profiles', label: 'Profiles', icon: Layers, group: 'Business & Print' },
  { id: 'section-terms', label: 'Terms', icon: FileText, group: 'Business & Print' },
  { id: 'section-print', label: 'Print & PDF', icon: Printer, group: 'Business & Print' },
  { id: 'section-modules', label: 'Features', icon: Sliders, group: 'Preferences' },
  { id: 'section-stock', label: 'Stock', icon: Bell, group: 'Preferences' },
  { id: 'section-region', label: 'Region', icon: Globe, group: 'Preferences' },
  { id: 'section-backups', label: 'Backups', icon: Database, group: 'Data & Sync' },
  { id: 'section-cloud', label: 'Google Drive', icon: Cloud, group: 'Data & Sync' },
  { id: 'section-supabase', label: 'Supabase Cloud', icon: Database, group: 'Data & Sync' },
  { id: 'section-data', label: 'Import/Export', icon: ArrowLeftRight, group: 'Data & Sync' },
  { id: 'section-updates', label: 'Updates', icon: Sparkles, group: 'System' },
];

export interface SettingsSidebarProps {
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
  onBack: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  className?: string;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  activeSection,
  onSelectSection,
  onBack,
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
  className = '',
}) => {
  const handleItemClick = (sectionId: string) => {
    onSelectSection(sectionId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleBackClick = () => {
    onBack();
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  // Group sections by their category
  const groups = [
    { title: 'Business & Print', items: SETTINGS_SECTIONS.filter((s) => s.group === 'Business & Print') },
    { title: 'Preferences', items: SETTINGS_SECTIONS.filter((s) => s.group === 'Preferences') },
    { title: 'Data & Sync', items: SETTINGS_SECTIONS.filter((s) => s.group === 'Data & Sync') },
    { title: 'System', items: SETTINGS_SECTIONS.filter((s) => s.group === 'System') },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${
          mobileOpen ? 'sidebar-mobile-open' : ''
        } ${className}`.trim()}
        id="settings-sidebar"
        aria-label="Settings Navigation Rail"
      >
        {/* Mobile Header Close Row */}
        <div className="sidebar-mobile-close-row">
          <span className="sidebar-mobile-title">Settings Menu</span>
          <button
            type="button"
            className="sidebar-mobile-close-btn"
            onClick={onCloseMobile}
            aria-label="Close settings drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Primary Action: Back to App */}
        <div className="sidebar-cta-wrap">
          <Tooltip title={collapsed ? 'Back to App' : ''} placement="right" mouseEnterDelay={0.3}>
            <button
              type="button"
              className="sidebar-back-btn"
              onClick={handleBackClick}
            >
              <ArrowLeft size={16} />
              {!collapsed && <span>Back to App</span>}
            </button>
          </Tooltip>
        </div>

        {/* Section Title Header */}
        {!collapsed && (
          <div className="px-4 py-2 border-b border-[#f0f0f0] dark:border-[rgba(255,255,255,0.08)] mb-1 flex items-center gap-2">
            <Settings size={15} className="text-[#1677ff]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8c8c8c] dark:text-[rgba(255,255,255,0.45)]">
              Settings Options
            </span>
          </div>
        )}

        {/* Navigation Categories */}
        <div className="sidebar-nav-scroll">
          <nav className="sidebar-nav" aria-label="Settings Sections">
            {groups.map((group) => (
              <div key={group.title} className="nav-group">
                {!collapsed && (
                  <div className="nav-group-header">{group.title}</div>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  return (
                    <Tooltip key={item.id} title={collapsed ? item.label : ''} placement="right" mouseEnterDelay={0.3}>
                      <button
                        id={`settings-nav-tab-${item.id}`}
                        type="button"
                        className={`nav-btn ${isActive ? 'nav-btn-active' : ''}`}
                        onClick={() => handleItemClick(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon size={17} style={{ flexShrink: 0 }} />
                        {!collapsed && (
                          <span className="nav-btn-label">{item.label}</span>
                        )}
                      </button>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer with Collapse Trigger */}
        <div className="sidebar-footer">
          <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right" mouseEnterDelay={0.3}>
            <button
              type="button"
              className="sidebar-collapse-trigger"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              <span>Collapse</span>
            </button>
          </Tooltip>
        </div>
      </aside>
    </>
  );
};

export default SettingsSidebar;
