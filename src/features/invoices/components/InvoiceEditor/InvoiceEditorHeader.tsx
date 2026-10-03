import React, { useMemo } from 'react';
import {
  Button,
  Dropdown,
  Input,
  Space,
  Typography,
  Tooltip,
  Badge,
  ConfigProvider,
  type MenuProps,
} from 'antd';
import {
  ArrowLeftOutlined,
  DownOutlined,
  EyeOutlined,
  PrinterOutlined,
  WhatsAppOutlined,
  ArrowRightOutlined,
  SettingOutlined,
  LockOutlined,
  CheckOutlined,
  LoadingOutlined,
  BankOutlined,
  SwapOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { INVOICE_TYPES } from '@/features/invoices/constants';
import type { InvoiceType } from '@/features/invoices/types';
import { useTheme } from '@/app/providers/ThemeProvider';
import { getAntdTheme } from '@/shared/components/ui/AntdThemeConfig';
import { CompanySwitcherDropdown } from '@/app/layout/components/CompanySwitcherDropdown';

const { Text } = Typography;

export interface InvoiceEditorHeaderProps {
  handleBack: () => void;
  autoSaveStatus: string;
  isMeaningfulInvoice: () => boolean;
  client?: any;
  clientNameRef?: React.RefObject<HTMLInputElement | null>;
  addItem?: () => void;
  validateForSave?: () => string | null;
  saveInvoiceToDB: (manual?: boolean, patch?: any) => Promise<any>;
  generatePDF?: () => Promise<any>;
  directPrint: () => Promise<any>;
  shareWhatsApp: () => void;
  exportEWayBill?: () => void;
  previewCollapsed: boolean;
  setPreviewCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  invoiceType: InvoiceType;
  onTypeChange?: (type: InvoiceType) => void;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  isThermalPaper?: () => boolean;
  onOpenSettings?: () => void;
  onOpenCustomHeaders?: () => void;
  details?: any;
  setDetails?: React.Dispatch<React.SetStateAction<any>>;
  editingBill?: any;
  profile?: any;
  allProfiles?: any[];
  onSwitchProfile?: (profile: any) => void;
  supplyType?: string;
  onSupplyTypeChange?: (val: string) => void;
}

export const InvoiceEditorHeader: React.FC<InvoiceEditorHeaderProps> = ({
  handleBack,
  autoSaveStatus,
  isMeaningfulInvoice,
  validateForSave,
  saveInvoiceToDB,
  directPrint,
  shareWhatsApp,
  previewCollapsed,
  setPreviewCollapsed,
  invoiceType,
  onTypeChange,
  saving,
  setSaving,
  onOpenSettings,
  onOpenCustomHeaders,
  details,
  setDetails,
  editingBill,
  profile,
  allProfiles = [],
  onSwitchProfile,
  supplyType = 'Regular',
  onSupplyTypeChange,
}) => {
  const { isDark } = useTheme();

  const typeConfig = (INVOICE_TYPES as Record<string, any>)[invoiceType];
  const invoiceTitle = typeConfig?.label
    ? editingBill
      ? `Edit ${typeConfig.label}`
      : `Create ${typeConfig.label}`
    : editingBill
    ? 'Edit Invoice'
    : 'Create Invoice';

  const businessName = profile?.businessName || 'Vishal Enterprise';
  const fullAddress =
    [
      profile?.businessName,
      profile?.address,
      profile?.city,
      profile?.state,
      profile?.pin,
    ]
      .filter(Boolean)
      .join(', ') || 'Vishal Enterprise, Plot No. 1706/7, GIDC Estate...';

  const profilesToDisplay = useMemo(() => {
    if (allProfiles && allProfiles.length > 0) return allProfiles;
    return [profile].filter(Boolean);
  }, [allProfiles, profile]);

  // Invoice prefix extraction & handling
  const defaultPrefix =
    (businessName.match(/\b(\w)/g) || []).join('').toUpperCase().slice(0, 3) || 'VE';
  const currentPrefix = details?.invoicePrefix || `${defaultPrefix}-`;
  const currentNumber = details?.invoiceNumber ?? editingBill?.id ?? '0001';

  const triggerSave = async () => {
    if (validateForSave) {
      const problem = validateForSave();
      if (problem) {
        alert(problem);
        return;
      }
    }
    try {
      setSaving(true);
      await saveInvoiceToDB(true);
    } catch (err: any) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  // Menu items for Document Type dropdown
  const typeMenuItems: MenuProps['items'] = useMemo(() => {
    return Object.entries(INVOICE_TYPES).map(([key, cfg]: [string, any]) => ({
      key,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 150, padding: '2px 0' }}>
          <span style={{ fontWeight: invoiceType === key ? 600 : 400 }}>{cfg.label}</span>
          {invoiceType === key && <CheckOutlined style={{ color: '#1677ff', fontSize: 12 }} />}
        </div>
      ),
      onClick: () => onTypeChange?.(key as InvoiceType),
    }));
  }, [invoiceType, onTypeChange]);

  // Menu items for Prefix selection
  const prefixMenuItems: MenuProps['items'] = useMemo(() => {
    const prefixes = [`${defaultPrefix}-`, 'INV-', 'QT-', 'EST-', 'TAX-', 'BILL-'];
    return prefixes.map((pfx) => ({
      key: pfx,
      label: (
        <span style={{ fontFamily: 'monospace', fontWeight: currentPrefix === pfx ? 600 : 400 }}>
          {pfx}
        </span>
      ),
      onClick: () => {
        if (setDetails) {
          setDetails((prev: any) => ({ ...prev, invoicePrefix: pfx }));
        }
      },
    }));
  }, [defaultPrefix, currentPrefix, setDetails]);

  // Menu items for Supply Type
  const supplyMenuItems: MenuProps['items'] = useMemo(() => {
    const types = ['Regular', 'SEZ with payment', 'SEZ without payment', 'Deemed Export'];
    return types.map((st) => ({
      key: st,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 140 }}>
          <span style={{ fontWeight: supplyType === st ? 600 : 400 }}>{st}</span>
          {supplyType === st && <CheckOutlined style={{ color: '#1677ff', fontSize: 12 }} />}
        </div>
      ),
      onClick: () => onSupplyTypeChange?.(st),
    }));
  }, [supplyType, onSupplyTypeChange]);

  // Menu items for Profile & Dispatch From dropdown
  const profileMenuItems: MenuProps['items'] = useMemo(() => {
    const items: MenuProps['items'] = profilesToDisplay.map((p: any, idx: number) => {
      const isCurrent = profile?.businessName === p.businessName;
      const pAddress = [p.address, p.city, p.state, p.pin].filter(Boolean).join(', ');

      return {
        key: p.id || `${p.businessName}-${idx}`,
        label: (
          <div style={{ padding: '4px 0', maxWidth: 320 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <Text strong style={{ fontSize: 13, color: isCurrent ? '#1677ff' : undefined }}>
                {p.businessName || 'Business Profile'}
              </Text>
              {isCurrent && (
                <Badge count="Active" style={{ backgroundColor: '#52c41a', fontSize: 10, height: 16, lineHeight: '16px' }} />
              )}
            </div>
            {pAddress && (
              <div style={{ fontSize: 11, color: '#8c8c8c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                {pAddress}
              </div>
            )}
            {p.gstin && (
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#595959', marginTop: 2 }}>
                GSTIN: {p.gstin}
              </div>
            )}
          </div>
        ),
        onClick: () => onSwitchProfile?.(p),
      };
    });

    items.push({
      type: 'divider',
    });

    items.push({
      key: 'manage-profiles',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1677ff', fontWeight: 500, padding: '2px 0' }}>
          <PlusOutlined style={{ fontSize: 12 }} />
          <span>Manage Business Profiles</span>
        </div>
      ),
      onClick: () => onOpenSettings?.(),
    });

    return items;
  }, [profilesToDisplay, profile, onSwitchProfile, onOpenSettings]);

  // Auto-save indicator badge & text
  const autoSaveBadge = useMemo(() => {
    if (autoSaveStatus === 'saving' || saving) {
      return (
        <Space size={4} align="center">
          <LoadingOutlined style={{ fontSize: 12, color: '#1677ff' }} />
          <Text style={{ fontSize: 12, color: '#1677ff' }}>Saving...</Text>
        </Space>
      );
    }
    if (autoSaveStatus === 'saved' || isMeaningfulInvoice()) {
      return (
        <Space size={6} align="center">
          <Badge status="success" />
          <Text type="secondary" style={{ fontSize: 12 }}>Saved</Text>
        </Space>
      );
    }
    return (
      <Space size={6} align="center">
        <Badge status="warning" />
        <Text type="secondary" style={{ fontSize: 12 }}>Draft</Text>
      </Space>
    );
  }, [autoSaveStatus, saving, isMeaningfulInvoice]);

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <header
        id="invoice-editor-header"
        style={{
          backgroundColor: isDark ? '#141414' : '#ffffff',
          borderBottom: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
          position: 'sticky',
          top: 0,
          zIndex: 30,
          padding: '8px 20px',
        }}
      >
        <div
          style={{
            maxWidth: 1720,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          {/* Left section: Back button, Title Dropdown, Prefix + Number input, Saved status */}
          <Space align="center" size={12} wrap>
            <Tooltip title="Go back">
              <Button
                id="fgsb-header-back-btn"
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                style={{ color: isDark ? '#d9d9d9' : '#595959' }}
              />
            </Tooltip>

            {/* Company / Business Switcher */}
            <CompanySwitcherDropdown
              profile={profile}
              allProfiles={allProfiles}
              onSwitchProfile={onSwitchProfile}
              onOpenSettings={onOpenSettings}
            />

            <div style={{ height: 24, width: 1, backgroundColor: isDark ? '#303030' : '#f0f0f0' }} />

            {/* Document Type Dropdown */}
            <Dropdown menu={{ items: typeMenuItems }} trigger={['click']} placement="bottomLeft">
              <div
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  userSelect: 'none',
                  padding: '2px 6px',
                  borderRadius: 6,
                  transition: 'background-color 0.2s',
                }}
              >
                <Space size={4} align="center">
                  <Text strong style={{ fontSize: 14 }}>
                    {invoiceTitle}
                  </Text>
                  <DownOutlined style={{ fontSize: 10, color: '#8c8c8c' }} />
                </Space>
              </div>
            </Dropdown>

            {/* Invoice Prefix + Number Box */}
            <Space.Compact style={{ maxWidth: 175 }}>
              <Dropdown menu={{ items: prefixMenuItems }} trigger={['click']} placement="bottomLeft">
                <Button
                  style={{
                    backgroundColor: isDark ? '#1f1f1f' : '#fafafa',
                    fontSize: 12,
                    padding: '0 8px',
                    fontFamily: 'monospace',
                  }}
                >
                  <Space size={4} align="center">
                    <span>{currentPrefix}</span>
                    <DownOutlined style={{ fontSize: 8, color: '#8c8c8c' }} />
                  </Space>
                </Button>
              </Dropdown>
              <Input
                style={{ fontSize: 12, fontWeight: 500, fontFamily: 'monospace', minWidth: 70 }}
                value={currentNumber}
                onChange={(e) => {
                  if (setDetails) {
                    setDetails((prev: any) => ({ ...prev, invoiceNumber: e.target.value }));
                  }
                }}
                placeholder="0001"
              />
            </Space.Compact>

            {/* Saved status indicator */}
            <div style={{ marginLeft: 4 }}>
              {autoSaveBadge}
            </div>
          </Space>

          {/* Right section: Live Preview, Print, WhatsApp, Save Invoice */}
          <Space align="center" size={8} wrap>
            <Button
              type={!previewCollapsed ? 'primary' : 'default'}
              ghost={!previewCollapsed}
              icon={<EyeOutlined />}
              onClick={() => setPreviewCollapsed((v) => !v)}
              style={
                !previewCollapsed
                  ? { backgroundColor: isDark ? '#111d2c' : '#e6f4ff', borderColor: '#91caff', color: '#1677ff' }
                  : undefined
              }
            >
              Live Preview
            </Button>

            <Tooltip title="Print document directly">
              <Button
                icon={<PrinterOutlined />}
                onClick={directPrint}
                disabled={saving}
              >
                Print
              </Button>
            </Tooltip>

            <Tooltip title="Share via WhatsApp">
              <Button
                icon={<WhatsAppOutlined style={{ color: '#ffffff', fontSize: 16 }} />}
                onClick={shareWhatsApp}
                disabled={saving}
                style={{
                  backgroundColor: '#25D366',
                  borderColor: '#25D366',
                  color: '#ffffff',
                }}
              />
            </Tooltip>

            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              iconPlacement="end"
              onClick={triggerSave}
              loading={saving}
              style={{
                backgroundColor: isDark ? '#177ddc' : '#18181b',
                borderColor: isDark ? '#177ddc' : '#18181b',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              Save Invoice
            </Button>
          </Space>
        </div>
      </header>

      {/* Sub-header section: Type, Dispatch From, Custom Headers, Settings */}
      <section
        style={{
          backgroundColor: isDark ? '#191919' : '#fafafa',
          borderBottom: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
          padding: '6px 20px',
        }}
      >
        <div
          style={{
            maxWidth: 1720,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {/* Left sub-controls: Supply Type & Dispatch Location */}
          <Space align="center" size={16} wrap>
            {/* Supply Type Selector */}
            <Dropdown menu={{ items: supplyMenuItems }} trigger={['click']} placement="bottomLeft">
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  userSelect: 'none',
                  fontSize: 12,
                  padding: '2px 4px',
                  borderRadius: 4,
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>Type:</Text>
                <Text strong style={{ fontSize: 12 }}>{supplyType}</Text>
                <DownOutlined style={{ fontSize: 9, color: '#8c8c8c' }} />
              </div>
            </Dropdown>

            {/* Dispatch Location Dropdown */}
            <Dropdown menu={{ items: profileMenuItems }} trigger={['click']} placement="bottomLeft">
              <div
                id="dispatch-from-trigger"
                title={fullAddress}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  userSelect: 'none',
                  fontSize: 12,
                  maxWidth: 520,
                  padding: '2px 6px',
                  borderRadius: 4,
                }}
              >
                <BankOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
                <Text type="secondary" style={{ fontSize: 12 }}>Dispatch From:</Text>
                <Text
                  strong
                  ellipsis
                  style={{
                    fontSize: 12,
                    maxWidth: 320,
                    color: isDark ? '#d9d9d9' : '#262626',
                  }}
                >
                  {fullAddress}
                </Text>
                <DownOutlined style={{ fontSize: 9, color: '#8c8c8c' }} />
              </div>
            </Dropdown>
          </Space>

          {/* Right sub-controls: Custom Headers & Settings */}
          <Space align="center" size={12}>
            <Button
              type="text"
              size="small"
              icon={<LockOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />}
              onClick={onOpenCustomHeaders}
              style={{ fontSize: 12, color: isDark ? '#bfbfbf' : '#595959' }}
            >
              Custom Headers
            </Button>

            <Button
              type="text"
              size="small"
              icon={<SettingOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />}
              onClick={onOpenSettings}
              style={{ fontSize: 12, color: isDark ? '#bfbfbf' : '#595959' }}
            >
              Settings
            </Button>
          </Space>
        </div>
      </section>
    </ConfigProvider>
  );
};

export default InvoiceEditorHeader;
