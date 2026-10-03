import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Modal,
  Button,
  Space,
  Typography,
  Tooltip,
  Tag,
  Slider,
  Segmented,
  Divider,
  Spin,
  Badge,
  ConfigProvider,
  Flex,
  Grid,
} from 'antd';
import {
  PrinterOutlined,
  DownloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  EyeOutlined,
  CloseOutlined,
  FilePdfOutlined,
  ExpandOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import InvoicePreview from '@/features/invoices/components/InvoicePreview/InvoicePreview';
import PdfInvoicePreview from '@/features/invoices/components/InvoicePreview/PdfInvoicePreview';
import { getPaperSize } from '@/features/invoices/utils/printSettings';
import { INVOICE_TYPES } from '@/features/invoices/constants';
import { formatCurrency } from '@/shared/utils';
import { useTheme } from '@/app/providers/ThemeProvider';
import { getAntdTheme } from '@/shared/components/ui/AntdThemeConfig';

const { Text } = Typography;
const { useBreakpoint } = Grid;

export interface LiveDocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint?: () => Promise<void> | void;
  onDownloadPdf?: () => Promise<void> | void;
  profile?: any;
  client?: any;
  details?: any;
  items?: any[];
  totals?: any;
  invoiceType?: string;
  customTerms?: string;
  customNotes?: string;
  extraSections?: any;
  invoiceOptions?: any;
  title?: React.ReactNode;
}

export const LiveDocumentPreviewModal: React.FC<LiveDocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  onPrint,
  onDownloadPdf,
  profile,
  client,
  details = {},
  items = [],
  totals = {},
  invoiceType = 'tax-invoice',
  customTerms,
  customNotes,
  extraSections,
  invoiceOptions = {},
  title,
}) => {
  const { isDark } = useTheme();
  const screens = useBreakpoint();
  const isCompact = !screens.md;
  const paperCfg = getPaperSize(invoiceOptions?.paperSize, invoiceOptions);
  const isThermal = paperCfg.kind === 'thermal';
  const paperLabel = paperCfg.label || `${paperCfg.widthMm}mm`;

  const [zoom, setZoom] = useState<number>(isThermal ? 140 : 100);
  const [previewEngine, setPreviewEngine] = useState<'pdf' | 'html'>(
    typeof window !== 'undefined' && window.self !== window.top ? 'html' : 'pdf'
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Reset zoom default when paper type changes or opened
  useEffect(() => {
    if (isOpen) {
      setZoom(isThermal ? 140 : 100);
      const isSandboxed = typeof window !== 'undefined' && window.self !== window.top;
      setPreviewEngine(isSandboxed ? 'html' : 'pdf');
      setIsFullscreen(false);
    }
  }, [isOpen, isThermal]);

  // Keyboard shortcut for Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !printing && !downloading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, printing, downloading, onClose]);

  const handleZoomIn = () => setZoom((z) => Math.min(200, z + 10));
  const handleZoomOut = () => setZoom((z) => Math.max(40, z - 10));

  const handleFit = useCallback(() => {
    if (!viewportRef.current) {
      setZoom(isThermal ? 140 : 100);
      return;
    }
    const containerWidth = viewportRef.current.clientWidth - 48;
    const targetWidth = isThermal ? (paperCfg.widthMm <= 58 ? 260 : 340) : 794;
    if (containerWidth > 0 && targetWidth > 0) {
      const fitZoom = Math.max(40, Math.min(180, Math.round((containerWidth / targetWidth) * 100)));
      setZoom(fitZoom);
    } else {
      setZoom(isThermal ? 140 : 100);
    }
  }, [isThermal, paperCfg.widthMm]);

  const handleSegmentedChange = (val: string | number) => {
    if (val === 'fit') {
      handleFit();
    } else {
      setZoom(Number(val));
    }
  };

  const handlePrint = async () => {
    if (!onPrint || printing) return;
    setPrinting(true);
    try {
      await onPrint();
    } finally {
      setPrinting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!onDownloadPdf || downloading) return;
    setDownloading(true);
    try {
      await onDownloadPdf();
    } finally {
      setDownloading(false);
    }
  };

  const typeConfig = (INVOICE_TYPES as Record<string, any>)[invoiceType] || (INVOICE_TYPES as Record<string, any>)['tax-invoice'];
  const invoiceTypeLabel = typeConfig?.label || (invoiceType === 'credit-note' ? 'Credit Note' : 'Tax Invoice');
  const currencyCode = invoiceOptions?.currency || 'INR';
  const formattedTotal = formatCurrency(Number(totals?.total) || 0, currencyCode);

  const segmentedValue = useMemo(() => {
    if ([50, 75, 100, 125].includes(zoom)) return zoom;
    return undefined;
  }, [zoom]);

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <Modal
        open={isOpen}
        onCancel={onClose}
        centered={false}
        width={isFullscreen ? '100vw' : isThermal ? 680 : 1180}
        style={
          isFullscreen
            ? { top: 0, padding: 0, margin: 0, maxWidth: '100vw' }
            : {
                top: isCompact ? 8 : 20,
                paddingBottom: isCompact ? 8 : 20,
                margin: '0 auto',
                maxWidth: isThermal ? 720 : `calc(100vw - ${isCompact ? 16 : 32}px)`,
              }
        }
        styles={{
          header: {
            margin: 0,
            padding: '14px 20px',
            borderBottom: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
            flexShrink: 0,
          },
          body: {
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            backgroundColor: isDark ? '#141414' : '#eef2f6',
          },
          footer: {
            margin: 0,
            padding: '12px 20px',
            borderTop: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
            flexShrink: 0,
          },
          container: isFullscreen
            ? { borderRadius: 0, height: '100vh', display: 'flex', flexDirection: 'column', padding: 0 }
            : {
                borderRadius: isCompact ? 8 : 12,
                overflow: 'hidden',
                height: isCompact ? 'calc(100dvh - 16px)' : 'calc(100vh - 40px)',
                maxHeight: isCompact ? 'calc(100dvh - 16px)' : '92vh',
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
              },
        }}
        title={
          <Flex align="center" gap={8} wrap="wrap" style={{ paddingRight: 28 }}>
            <EyeOutlined style={{ fontSize: 18, color: '#1677ff' }} />
            <Text strong style={{ fontSize: 16 }}>
              {title || 'Live Document Preview'}
            </Text>
            <Tag color="processing" variant="filled">
              #{details?.invoiceNumber || 'Draft'}
            </Tag>
            <Tag color={invoiceType === 'credit-note' ? 'magenta' : 'geekblue'} variant="filled">
              {invoiceTypeLabel}
            </Tag>
            <Tag color="default" variant="filled">
              {paperLabel}
            </Tag>
          </Flex>
        }
        footer={
          <Flex
            vertical={isCompact}
            align={isCompact ? 'stretch' : 'center'}
            justify="space-between"
            gap={isCompact ? 10 : 16}
          >
            <Flex align="center" gap={10} wrap="wrap">
              <Flex gap={4} align="center">
                <FileTextOutlined style={{ color: '#1677ff', fontSize: 13 }} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Items:
                </Text>
                <Badge count={items?.length || 0} showZero overflowCount={999} style={{ backgroundColor: '#1677ff' }} />
              </Flex>
              <Divider type="vertical" />
              <Flex gap={4} align="center">
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Total:
                </Text>
                <Text strong style={{ fontSize: 13, color: '#1677ff' }}>
                  {formattedTotal}
                </Text>
              </Flex>
              <Divider type="vertical" />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Client: <Text strong style={{ fontSize: 12 }}>{client?.name || 'Cash Customer'}</Text>
              </Text>
            </Flex>
            <Flex gap={8} wrap="wrap">
              <Button icon={<CloseOutlined />} onClick={onClose} style={isCompact ? { flex: 1 } : undefined}>
                Close
              </Button>
              {onDownloadPdf && (
                <Button
                  icon={<FilePdfOutlined />}
                  loading={downloading}
                  disabled={printing}
                  onClick={handleDownloadPdf}
                  style={isCompact ? { flex: 1 } : undefined}
                >
                  Download PDF
                </Button>
              )}
              {onPrint && (
                <Button
                  type="primary"
                  icon={<PrinterOutlined />}
                  loading={printing}
                  disabled={downloading}
                  onClick={handlePrint}
                  style={isCompact ? { flex: 1 } : undefined}
                >
                  Print Document
                </Button>
              )}
            </Flex>
          </Flex>
        }
      >
        {/* Sub-header Toolbar */}
        <Flex
          vertical={isCompact}
          align={isCompact ? 'stretch' : 'center'}
          justify="space-between"
          gap={8}
          style={{
            padding: '8px 16px',
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
            borderBottom: `1px solid ${isDark ? '#303030' : '#e8e8e8'}`,
            flexShrink: 0,
          }}
        >
          {/* Zoom controls */}
          <Flex align="center" gap={8} wrap="wrap" style={{ minWidth: 0 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Zoom:
            </Text>
            <Space.Compact size="small">
              <Tooltip title="Zoom Out (-10%)">
                <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} disabled={zoom <= 40} />
              </Tooltip>
              <Tooltip title="Reset to 100%">
                <Button
                  style={{ minWidth: 54, textAlign: 'center', fontFamily: 'monospace' }}
                  onClick={() => setZoom(100)}
                >
                  {zoom}%
                </Button>
              </Tooltip>
              <Tooltip title="Zoom In (+10%)">
                <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} disabled={zoom >= 200} />
              </Tooltip>
            </Space.Compact>

            <Slider
              min={40}
              max={200}
              step={5}
              value={zoom}
              onChange={(val) => setZoom(val as number)}
              style={{ width: 90, margin: '0 4px' }}
              tooltip={{ formatter: (v) => `${v}%` }}
            />

            <Segmented
              size="small"
              value={segmentedValue}
              options={[
                { label: '50%', value: 50 },
                { label: '75%', value: 75 },
                { label: '100%', value: 100 },
                { label: '125%', value: 125 },
                { label: 'Fit', value: 'fit' },
              ]}
              onChange={handleSegmentedChange}
            />

            <Tooltip title="Auto-fit to available window width">
              <Button size="small" icon={<ExpandOutlined />} onClick={handleFit}>
                Fit Width
              </Button>
            </Tooltip>

            <Divider type="vertical" style={{ marginInline: 4 }} />

            <Segmented
              size="small"
              value={previewEngine}
              options={[
                { label: '📄 PDF Layout', value: 'pdf' },
                { label: '⚡ HTML Layout', value: 'html' },
              ]}
              onChange={(val) => setPreviewEngine(val as 'pdf' | 'html')}
            />
            {typeof window !== 'undefined' && window.self !== window.top && (
              <Tooltip title="Sandbox environment detected. Defaulting to high-fidelity HTML Layout to prevent standard browser iframe/Blob blocking.">
                <Badge status="processing" text="Sandbox Safe Mode" style={{ fontSize: '11px', color: 'var(--text-muted)' }} />
              </Tooltip>
            )}
          </Flex>

          {/* Quick status information */}
          <Flex align="center" justify={isCompact ? 'space-between' : 'flex-end'} gap={8}>
            <Tag color={isThermal ? 'gold' : 'blue'}>
              {paperLabel}
            </Tag>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Real-time Preview
            </Text>
            <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
              <Button
                size="small"
                type="text"
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={() => setIsFullscreen(!isFullscreen)}
              />
            </Tooltip>
          </Flex>
        </Flex>

        {/* Viewport canvas */}
        <Flex
          ref={viewportRef}
          vertical
          align="stretch"
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            padding: isFullscreen ? '16px' : '24px 12px',
            backgroundColor: isDark ? '#141414' : '#e5e9f0',
          }}
        >
          <Flex justify="center" align="flex-start" style={{ minWidth: 'max-content', minHeight: '100%' }}>
            <Spin
              spinning={printing || downloading}
              description={printing ? 'Preparing print...' : 'Generating PDF...'}
              style={{ display: 'block' }}
            >
              <Flex
                vertical
                style={{
                  zoom: `${zoom}%`,
                  boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.1)',
                  borderRadius: 8,
                  backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
                  overflow: 'hidden',
                  transition: 'zoom 0.1s ease-out',
                  minHeight: isFullscreen ? 'calc(100vh - 120px)' : 680,
                }}
              >
                {previewEngine === 'pdf' ? (
                  <PdfInvoicePreview
                    profile={profile}
                    client={client}
                    details={details}
                    items={items}
                    totals={totals}
                    invoiceType={invoiceType}
                    customTerms={customTerms}
                    customNotes={customNotes}
                    extraSections={extraSections}
                    options={invoiceOptions}
                    style={{
                      width: isThermal ? '340px' : '794px',
                      height: isFullscreen ? 'calc(100vh - 180px)' : '780px',
                      border: 'none',
                      borderRadius: '8px',
                    }}
                  />
                ) : (
                  <InvoicePreview
                    profile={profile}
                    client={client}
                    details={details}
                    items={items}
                    totals={totals}
                    invoiceType={invoiceType}
                    customTerms={customTerms}
                    customNotes={customNotes}
                    extraSections={extraSections}
                    options={invoiceOptions}
                    previewOnly={true}
                  />
                )}
              </Flex>
            </Spin>
          </Flex>
        </Flex>
      </Modal>
    </ConfigProvider>
  );
};

export default LiveDocumentPreviewModal;
