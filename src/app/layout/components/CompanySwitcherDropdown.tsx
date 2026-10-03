import React, { useState, useMemo } from 'react';
import {
  Dropdown,
  Button,
  Space,
  Typography,
  Badge,
  ConfigProvider,
} from 'antd';
import {
  CheckOutlined,
  EditOutlined,
  SendOutlined,
  PlusCircleFilled,
  ArrowRightOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useTheme } from '@/app/providers/ThemeProvider';
import { getAntdTheme } from '@/shared/components/ui/AntdThemeConfig';
import { toast } from '@/shared/components/feedback/Toast';

const { Text } = Typography;

export interface BusinessProfile {
  id?: string;
  businessName?: string;
  tradeName?: string;
  legalName?: string;
  companyName?: string;
  gstin?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  logo?: string;
  [key: string]: any;
}

export interface CompanySwitcherDropdownProps {
  profile: BusinessProfile | null;
  allProfiles?: BusinessProfile[];
  onSwitchProfile?: (profile: BusinessProfile) => void;
  onOpenSettings?: () => void;
  onSelectView?: (viewId: string) => void;
}

export const CompanySwitcherDropdown: React.FC<CompanySwitcherDropdownProps> = ({
  profile,
  allProfiles = [],
  onSwitchProfile,
  onOpenSettings,
  onSelectView,
}) => {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);

  const businessName = profile?.businessName || profile?.companyName || 'Vishal Enterprise';
  const tradeName = (
    profile?.tradeName ||
    profile?.legalName ||
    profile?.businessName ||
    'VISHAL ENTERPRISE'
  ).toUpperCase();

  const profilesList = useMemo(() => {
    if (allProfiles && allProfiles.length > 0) return allProfiles;
    if (profile) return [profile];
    return [{ businessName: 'Vishal Enterprise', tradeName: 'VISHAL ENTERPRISE' }];
  }, [allProfiles, profile]);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    if (onOpenSettings) {
      onOpenSettings();
    } else if (onSelectView) {
      onSelectView('settings');
    }
  };

  const handleShare = async (e: React.MouseEvent, targetProfile: BusinessProfile) => {
    e.stopPropagation();
    const pName = targetProfile.businessName || 'Business Profile';
    const gstinText = targetProfile.gstin ? `\nGSTIN: ${targetProfile.gstin}` : '';
    const phoneText = targetProfile.phone ? `\nPhone: ${targetProfile.phone}` : '';
    const upiText = targetProfile.upiId ? `\nUPI ID: ${targetProfile.upiId}` : '';
    const shareData = `${pName}${gstinText}${phoneText}${upiText}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: pName,
          text: shareData,
        });
        toast.success('Shared business profile!');
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareData);
      toast.success('Business profile copied to clipboard!');
    } catch {
      toast.info(`Business: ${pName}`);
    }
  };

  const handleAddNewCompany = () => {
    setOpen(false);
    if (onOpenSettings) {
      onOpenSettings();
    } else if (onSelectView) {
      onSelectView('settings');
    }
  };

  // Render circular company logo / monogram badge
  const renderCompanyAvatar = (p: BusinessProfile | null, size: number = 36) => {
    if (p?.logo) {
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: `1px solid ${isDark ? '#434343' : '#e2e8f0'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            padding: 2,
          }}
        >
          <img
            src={p.logo}
            alt={p.businessName || 'Logo'}
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
          />
        </div>
      );
    }

    const name = p?.businessName || 'Vishal Enterprise';
    const words = name.trim().split(/\s+/);
    const firstChar = (words[0]?.[0] || 'V').toUpperCase();
    const secondChar = (words[1]?.[0] || words[0]?.[1] || 'E').toUpperCase();

    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          border: `1px solid ${isDark ? '#434343' : '#e2e8f0'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="48" fill="#ffffff" />
          {/* Stylized dark V */}
          <path d="M22 28L42 74H52L72 28H58L47 55L36 28H22Z" fill="#1e293b" />
          {/* Stylized bright green E */}
          <path d="M48 28H76V38H58V45H72V54H58V64H76V74H48V28Z" fill="#84cc16" />
          {/* Small text below monogram */}
          <text
            x="50"
            y="87"
            textAnchor="middle"
            fontSize="9"
            fill="#65a30d"
            fontWeight="800"
            letterSpacing="0.4"
          >
            {name.slice(0, 12).toUpperCase()}
          </text>
        </svg>
      </div>
    );
  };

  // Custom Dropdown Menu Card Content matching user screenshot exactly
  const menuContent = (
    <div
      style={{
        width: 320,
        backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
        borderRadius: 14,
        boxShadow: isDark
          ? '0 10px 30px rgba(0, 0, 0, 0.45), 0 0 0 1px #303030'
          : '0 10px 30px rgba(0, 0, 0, 0.08), 0 0 0 1px #f0f0f0',
        overflow: 'hidden',
      }}
    >
      {/* List of profiles / active profile */}
      <div style={{ padding: '8px 12px' }}>
        {profilesList.map((bp, idx) => {
          const pName = bp.businessName || bp.companyName || 'Vishal Enterprise';
          const pTrade = (bp.tradeName || bp.legalName || pName).toUpperCase();
          const isActive =
            profile?.businessName === bp.businessName ||
            profile?.id === bp.id ||
            idx === 0;

          return (
            <div
              key={bp.id || `${pName}-${idx}`}
              onClick={() => {
                if (onSwitchProfile && !isActive) {
                  onSwitchProfile(bp);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '10px 8px',
                borderRadius: 10,
                cursor: isActive ? 'default' : 'pointer',
                backgroundColor: isDark ? 'transparent' : 'transparent',
                transition: 'background-color 0.2s',
              }}
            >
              {/* Avatar with Green Verified Check Badge */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {renderCompanyAvatar(bp, 44)}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      border: '2px solid #ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    }}
                  >
                    <CheckOutlined style={{ color: '#ffffff', fontSize: 9, strokeWidth: 2 }} />
                  </div>
                )}
              </div>

              {/* Company Info & Actions */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: isDark ? '#f3f4f6' : '#111827',
                    lineHeight: 1.25,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {pName}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: isDark ? '#9ca3af' : '#6b7280',
                    lineHeight: 1.4,
                    letterSpacing: '0.02em',
                    marginTop: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {pTrade}
                </div>

                {/* Edit & Share Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={handleEdit}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 500,
                      color: isDark ? '#9ca3af' : '#4b5563',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#1677ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isDark ? '#9ca3af' : '#4b5563';
                    }}
                  >
                    <EditOutlined style={{ fontSize: 13 }} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleShare(e, bp)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 500,
                      color: isDark ? '#9ca3af' : '#4b5563',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#1677ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isDark ? '#9ca3af' : '#4b5563';
                    }}
                  >
                    <SendOutlined style={{ fontSize: 13 }} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          backgroundColor: isDark ? '#2d2d2d' : '#f1f5f9',
          width: '100%',
        }}
      />

      {/* Footer Button: + Add new Company -> */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: isDark ? '#16181d' : '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          onClick={handleAddNewCompany}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 0',
            color: isDark ? '#60a5fa' : '#0f172a',
            transition: 'transform 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#1677ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = isDark ? '#60a5fa' : '#0f172a';
          }}
        >
          <PlusCircleFilled
            style={{
              fontSize: 16,
              color: isDark ? '#60a5fa' : '#0f172a',
            }}
          />
          <span
            style={{
              fontSize: 13.5,
              fontWeight: 700,
              letterSpacing: '0.01em',
            }}
          >
            Add new Company
          </span>
          <ArrowRightOutlined
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: isDark ? '#60a5fa' : '#0f172a',
            }}
          />
        </button>
      </div>
    </div>
  );

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <Dropdown
        open={open}
        onOpenChange={setOpen}
        popupRender={() => menuContent}
        trigger={['click']}
        placement="bottomLeft"
      >
        <div
          id="company-switcher-trigger"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            userSelect: 'none',
            padding: '4px 8px',
            borderRadius: 8,
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark
              ? 'rgba(255, 255, 255, 0.06)'
              : 'rgba(0, 0, 0, 0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {/* Logo / Monogram */}
          {renderCompanyAvatar(profile, 34)}

          {/* Text Stack: Company Name + Subtitle */}
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 700,
                color: isDark ? '#f3f4f6' : '#111827',
                lineHeight: 1.25,
                maxWidth: 160,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {businessName}
            </span>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 500,
                color: isDark ? '#9ca3af' : '#64748b',
                lineHeight: 1.3,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              + Add Another Company
            </span>
          </div>
        </div>
      </Dropdown>
    </ConfigProvider>
  );
};

export default CompanySwitcherDropdown;
