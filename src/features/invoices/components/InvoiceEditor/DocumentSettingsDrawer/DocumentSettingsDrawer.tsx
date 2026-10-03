import React, { useState, useEffect, useRef } from 'react';
import { 
  Drawer, 
  Switch, 
  Select, 
  Input, 
  Radio, 
  Button, 
  Tooltip,
  Upload,
  Modal
} from 'antd';
import { 
  X, 
  Search, 
  Lock, 
  Heart, 
  Sliders, 
  List, 
  FileText, 
  HelpCircle, 
  ExternalLink,
  Upload as UploadIcon
} from 'lucide-react';
import { toast } from '@/shared/components/feedback/Toast';

export interface DocumentSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceOptions: any;
  setInvoiceOptions: React.Dispatch<React.SetStateAction<any>>;
  toggleOption?: (key: string) => void;
  profile: any;
  initialTab?: string;
}

type TabType =
  | 'display'
  | 'layout'
  | 'export'
  | 'branding'
  | 'labels'
  | 'whatsapp';

export const DocumentSettingsDrawer: React.FC<DocumentSettingsDrawerProps> = ({
  isOpen,
  onClose,
  invoiceOptions = {},
  setInvoiceOptions,
  profile,
  initialTab = 'display',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('display');
  const [searchQuery, setSearchQuery] = useState('');
  const [localProfile, setLocalProfile] = useState<any>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab((initialTab as TabType) || 'display');
      setSearchQuery('');
    }
  }, [isOpen, initialTab]);

  const handleSaveChanges = () => {
    toast.success('Document settings saved successfully');
    onClose();
  };

  const setOption = (key: string, value: any) => {
    setInvoiceOptions((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleImageUpload = (key: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setOption(key, reader.result as string);
      toast.success('Image uploaded successfully');
    };
    reader.readAsDataURL(file);
    return false; // Prevent automatic upload
  };

  const matchesSearch = (text: string, desc?: string) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return text.toLowerCase().includes(q) || (desc && desc.toLowerCase().includes(q));
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      size={900 as any}
      placement="right"
      zIndex={150}
      closable={false}
      styles={{
        body: { padding: 24, backgroundColor: '#f8fafc' },
        header: { borderBottom: '1px solid #e2e8f0', padding: '16px 24px', backgroundColor: '#white' }
      }}
      title={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
          <span className="text-[17px] font-bold text-slate-900">Document settings</span>
        </div>
      }
      extra={
        <Button
          type="primary"
          onClick={handleSaveChanges}
          className="bg-blue-600 hover:bg-blue-700 h-9 font-bold text-xs px-5 rounded-lg border-0"
        >
          Save changes
        </Button>
      }
    >
      <div className="space-y-6 font-sans">
        
        {/* Quick Actions (4 Top Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div 
            onClick={() => setIsTemplateModalOpen(true)}
            className="bg-white border border-slate-100 rounded-xl p-4 cursor-pointer hover:shadow-xs transition-all flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-2 text-[#ef4444]">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                <Heart size={15} fill="currentColor" />
              </div>
              <span className="text-[13px] font-bold text-slate-800">Invoice templates</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal font-medium">
              Professional templates for every business need
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('layout')}
            className="bg-white border border-slate-100 rounded-xl p-4 cursor-pointer hover:shadow-xs transition-all flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                <Sliders size={15} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[13px] font-bold text-slate-800">Custom fields</span>
                <Lock size={11} className="text-slate-400" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal font-medium">
              Add custom fields in the PDFs that suit your business.
            </p>
          </div>

          <div 
            onClick={() => toast('Configure invoice number sequencing under Company/Filing dashboard.')}
            className="bg-white border border-slate-100 rounded-xl p-4 cursor-pointer hover:shadow-xs transition-all flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                <List size={15} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[13px] font-bold text-slate-800">Prefixes / suffixes</span>
                <HelpCircle size={11} className="text-slate-400 cursor-help" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal font-medium">
              Customize invoice serial numbers and sequences.
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('branding')}
            className="bg-white border border-slate-100 rounded-xl p-4 cursor-pointer hover:shadow-xs transition-all flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                <FileText size={15} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[13px] font-bold text-slate-800">Notes and terms</span>
                <Lock size={11} className="text-slate-400" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal font-medium">
              Default footer text, terms, and notes on PDFs.
            </p>
          </div>
        </div>

        {/* Customization Header */}
        <div className="space-y-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Customization
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Tab Pills */}
            <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-lg">
              {[
                { id: 'display', label: 'Display' },
                { id: 'layout', label: 'Layout & Fonts' },
                { id: 'export', label: 'Export' },
                { id: 'branding', label: 'Branding' },
                { id: 'labels', label: 'Customize Labels', locked: true, external: true },
                { id: 'whatsapp', label: 'Email / WhatsApp templates', external: true }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      if (tab.id === 'labels' || tab.id === 'whatsapp') {
                        toast(`${tab.label} preferences require premium enterprise subscription.`);
                        return;
                      }
                      setActiveTab(tab.id as TabType);
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer border-0 ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 bg-transparent'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.locked && <Lock size={10} className="text-slate-400" />}
                    {tab.external && <ExternalLink size={10} className="text-slate-400" />}
                  </button>
                );
              })}
            </div>

            {/* Search Bar (Ant Design Input) */}
            <Input 
              prefix={<Search size={13} className="text-slate-400 mr-1.5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PDF settings (margins, GST, pr..."
              className="w-full sm:w-72 h-9 rounded-lg"
              allowClear
            />
          </div>
        </div>

        {/* Subtitle Label */}
        <div className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 capitalize">
          {activeTab}
        </div>

        {/* Dynamically Render Redesigned Cards Matching the Image */}
        <div className="space-y-6">

          {/* ==================== DISPLAY TAB ==================== */}
          {activeTab === 'display' && (
            <>
              {/* General Section */}
              {matchesSearch('General', 'Show Images, Show Net Balance, Show Due Date, Show Dispatch Address') && (
                <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 shadow-2xs">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">General</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Show Images */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-bold text-slate-800">Show Images</span>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">Show product images on PDFs (up to 10) when you add them.</p>
                      </div>
                      <Switch checked={Boolean(invoiceOptions.showImages)} onChange={(v) => setOption('showImages', v)} />
                    </div>

                    {/* Show Net Balance */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-bold text-slate-800">Show Net Balance</span>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">Show what the customer owes (receivable balance).</p>
                      </div>
                      <Switch checked={Boolean(invoiceOptions.autoApplyClientCredit)} onChange={(v) => setOption('autoApplyClientCredit', v)} />
                    </div>

                    {/* Show Due Date */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-bold text-slate-800">Show Due Date</span>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">Show due date on PDFs.</p>
                      </div>
                      <Switch checked={invoiceOptions.showDueDate !== false} onChange={(v) => setOption('showDueDate', v)} />
                    </div>

                    {/* Show Dispatch Address */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-bold text-slate-800">Show Dispatch Address</span>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">Show dispatch address on PDFs.</p>
                      </div>
                      <Switch checked={invoiceOptions.showClientAddress !== false} onChange={(v) => setOption('showClientAddress', v)} />
                    </div>

                    {/* Show Payments */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-bold text-slate-800">Show Payments</span>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">Show how and when they paid on PDFs.</p>
                      </div>
                      <Switch checked={invoiceOptions.showBankDetails !== false} onChange={(v) => setOption('showBankDetails', v)} />
                    </div>

                    {/* Show Round Off */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-bold text-slate-800">Show Round Off</span>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">Show round-off on PDFs.</p>
                      </div>
                      <Switch checked={Boolean(invoiceOptions.showRoundOff)} onChange={(v) => setOption('showRoundOff', v)} />
                    </div>

                    {/* Secure PDF */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-bold text-slate-800">Secure PDF</span>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">When enabled, PDF content cannot be modified in editing tools.</p>
                      </div>
                      <Switch checked={Boolean(invoiceOptions.securePdf)} onChange={(v) => setOption('securePdf', v)} />
                    </div>

                    {/* Show Receiver's Signature */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-bold text-slate-800">Show Receiver's Signature</span>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">Show receiver sign-off on PDFs.</p>
                      </div>
                      <Switch checked={Boolean(invoiceOptions.showReceiverSignature)} onChange={(v) => setOption('showReceiverSignature', v)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Ewaybill Options Section */}
              {matchesSearch('Ewaybill Options', 'Eway Bill Details to Show on PDF') && (
                <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 shadow-2xs">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ewaybill Options</div>
                  <div className="max-w-md space-y-1.5">
                    <span className="text-[13px] font-bold text-slate-800">Eway Bill Details to Show on PDF</span>
                    <p className="text-[11px] text-slate-400 leading-normal font-medium mb-2">Choose which eway bill fields appear on the invoice PDF.</p>
                    <Select 
                      value={invoiceOptions.ewayFields || '+ 2 ...'}
                      onChange={(val) => setOption('ewayFields', val)}
                      className="w-full h-9 rounded-lg"
                      options={[
                        { value: '+ 2 ...', label: '+ 2 fields (No, Date)' },
                        { value: '+ 4 ...', label: '+ 4 fields (No, Date, Mode, Vehicle)' },
                        { value: 'none', label: 'Hide all Eway fields' }
                      ]}
                    />
                  </div>
                </div>
              )}

              {/* Quantities Section */}
              {matchesSearch('Quantities', 'Hide Quantity, Show Quantity with 3 decimals, Show Quantity Conversion Rate') && (
                <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 shadow-2xs">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantities</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Hide Quantity */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-bold text-slate-800">Hide Quantity</span>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">Hide quantity on PDFs.</p>
                      </div>
                      <Switch checked={Boolean(invoiceOptions.hideQuantity)} onChange={(v) => setOption('hideQuantity', v)} />
                    </div>

                    {/* Show Quantity with 3 decimals */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-bold text-slate-800">Show Quantity with 3 decimals</span>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">Show qty with three decimals on PDFs.</p>
                      </div>
                      <Switch checked={Boolean(invoiceOptions.showQuantity3Decimals)} onChange={(v) => setOption('showQuantity3Decimals', v)} />
                    </div>

                    {/* Show Quantity Conversion Rate */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-bold text-slate-800">Show Quantity Conversion Rate</span>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">Show main unit under the alternate unit on PDFs.</p>
                      </div>
                      <Switch checked={Boolean(invoiceOptions.showQuantityConversionRate)} onChange={(v) => setOption('showQuantityConversionRate', v)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing & Discounts Section */}
              {matchesSearch('Pricing & Discounts', 'Hide Discount, Show Discount Column, Decimals for Item prices on PDFs') && (
                <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 shadow-2xs">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pricing & Discounts</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Hide Discount */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-bold text-slate-800">Hide Discount</span>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">Hide line discounts on PDFs.</p>
                      </div>
                      <Switch checked={Boolean(invoiceOptions.hideDiscount)} onChange={(v) => setOption('hideDiscount', v)} />
                    </div>

                    {/* Show Discount Column */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-bold text-slate-800">Show Discount Column</span>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">Put discount in its own PDF column.</p>
                      </div>
                      <Switch checked={invoiceOptions.showDiscount !== false} onChange={(v) => setOption('showDiscount', v)} />
                    </div>

                    {/* Decimals for Item prices on PDFs (Lock) */}
                    <div className="col-span-1 sm:col-span-2 max-w-md space-y-1.5 pt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[13px] font-bold text-slate-800">Decimals for Item prices on PDFs</span>
                        <Lock size={11} className="text-slate-400" />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal font-medium mb-2">Unit and tax-included prices on PDFs. Default 2, up to 6 decimals.</p>
                      <Select 
                        value={String(invoiceOptions.decimalPlaces || 2)}
                        onChange={(val) => setOption('decimalPlaces', parseInt(val, 10))}
                        className="w-full h-9 rounded-lg"
                        options={[
                          { value: '2', label: '2 decimals' },
                          { value: '3', label: '3 decimals' },
                          { value: '4', label: '4 decimals' }
                        ]}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Company & HSN/SAC Section */}
              {matchesSearch('Company & HSN/SAC', 'Hide HSN/SAC, Show Company Details, Show Brand Name, Show HSN/SAC Summary') && (
                <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 shadow-2xs">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company & HSN/SAC</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Hide HSN/SAC */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-bold text-slate-800">Hide HSN/SAC</span>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">Hide HSN/SAC on PDFs.</p>
                      </div>
                      <Switch checked={Boolean(invoiceOptions.hideHsnSac)} onChange={(v) => setOption('hideHsnSac', v)} />
                    </div>

                    {/* Show Company Details (Lock) */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="text-[13px] font-bold text-slate-800">Show Company Details</span>
                          <Lock size={11} className="text-slate-400" />
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">Off hides your company block on PDFs (for printed letterhead).</p>
                      </div>
                      <Switch checked={invoiceOptions.showCompanyDetails !== false} onChange={(v) => setOption('showCompanyDetails', v)} />
                    </div>

                    {/* Show Brand Name */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-bold text-slate-800">Show Brand Name</span>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">Brand Name will be shown below the Company Name in PDFs if enabled.</p>
                      </div>
                      <Switch checked={Boolean(invoiceOptions.showBrandName)} onChange={(v) => setOption('showBrandName', v)} />
                    </div>

                    {/* Show HSN/SAC Summary (Lock) */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="text-[13px] font-bold text-slate-800">Show HSN/SAC Summary</span>
                          <Lock size={11} className="text-slate-400" />
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">HSN/SAC summary on PDFs.</p>
                      </div>
                      <Switch checked={Boolean(invoiceOptions.showHsnSacSummary)} onChange={(v) => setOption('showHsnSacSummary', v)} />
                    </div>

                    {/* Show HSN/SAC Summary on */}
                    <div className="col-span-1 sm:col-span-2 max-w-md space-y-1.5 pt-2">
                      <span className="text-[13px] font-bold text-slate-800">Show HSN/SAC Summary on</span>
                      <p className="text-[11px] text-slate-400 leading-normal font-medium mb-2">Choose which document types display the HSN/SAC summary table in PDFs.</p>
                      <Select 
                        value={invoiceOptions.showHsnSummaryOn || '+ 10 ...'}
                        onChange={(val) => setOption('showHsnSummaryOn', val)}
                        className="w-full h-9 rounded-lg"
                        options={[
                          { value: '+ 10 ...', label: '+ 10 document types' },
                          { value: 'tax-invoice', label: 'Tax Invoice only' },
                          { value: 'all', label: 'All documents' }
                        ]}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}


          {/* ==================== LAYOUT & FONTS TAB ==================== */}
          {activeTab === 'layout' && (
            <>
              {/* Language & Font Section */}
              {matchesSearch('Language & Font', 'Select Language in PDF, Select Font Style in PDF, PDF font size') && (
                <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 shadow-2xs">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Language & Font</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Select Language */}
                    <div className="space-y-1.5">
                      <span className="text-[13px] font-bold text-slate-800">Select Language in PDF</span>
                      <p className="text-[11px] text-slate-400 leading-normal font-medium">Uses this language in PDFs when you type text in that language.</p>
                      <Select 
                        value={invoiceOptions.pdfLanguage || 'English (Default)'}
                        onChange={(val) => setOption('pdfLanguage', val)}
                        className="w-full h-9 rounded-lg"
                        options={[
                          { value: 'English (Default)', label: 'English (Default)' },
                          { value: 'Hindi', label: 'Hindi' },
                          { value: 'Gujarati', label: 'Gujarati' }
                        ]}
                      />
                    </div>

                    {/* Select Font Style */}
                    <div className="space-y-1.5">
                      <span className="text-[13px] font-bold text-slate-800">Select Font Style in PDF</span>
                      <p className="text-[11px] text-slate-400 leading-normal font-medium">English PDFs only.</p>
                      <Select 
                        value={invoiceOptions.pdfFont || 'Stylish'}
                        onChange={(val) => setOption('pdfFont', val)}
                        className="w-full h-9 rounded-lg"
                        options={[
                          { value: 'Stylish', label: 'Stylish' },
                          { value: 'Classic', label: 'Classic' },
                          { value: 'Modern', label: 'Modern' }
                        ]}
                      />
                    </div>

                    {/* PDF Font Size (Ant Design Radios) */}
                    <div className="col-span-1 sm:col-span-2 space-y-2 pt-2">
                      <span className="text-[13px] font-bold text-slate-800">PDF font size</span>
                      <p className="text-[11px] text-slate-400 leading-normal font-medium mb-1.5">All PDFs.</p>
                      <Radio.Group 
                        value={invoiceOptions.pdfFontSize || 'Normal'} 
                        onChange={(e) => setOption('pdfFontSize', e.target.value)}
                        className="flex gap-6"
                      >
                        <Radio value="Small">Small</Radio>
                        <Radio value="Normal">Normal</Radio>
                        <Radio value="Large">Large</Radio>
                      </Radio.Group>
                    </div>
                  </div>
                </div>
              )}

              {/* Page Setup Section */}
              {matchesSearch('Page Setup', 'PDF Orientation, Repeat Header') && (
                <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 shadow-2xs">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Page Setup</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* PDF Orientation */}
                    <div className="space-y-1.5">
                      <span className="text-[13px] font-bold text-slate-800">PDF Orientation</span>
                      <p className="text-[11px] text-slate-400 leading-normal font-medium">All PDF templates except Landscape (6th).</p>
                      <Select 
                        value={invoiceOptions.pdfOrientation || 'Portrait'}
                        onChange={(val) => setOption('pdfOrientation', val)}
                        className="w-full h-9 rounded-lg"
                        options={[
                          { value: 'Portrait', label: 'Portrait' },
                          { value: 'Landscape', label: 'Landscape' }
                        ]}
                      />
                    </div>

                    {/* Repeat Header */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-bold text-slate-800">Repeat Header</span>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">Repeat the PDF header on every page.</p>
                      </div>
                      <Switch checked={Boolean(invoiceOptions.repeatHeader)} onChange={(v) => setOption('repeatHeader', v)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Table & Content Section */}
              {matchesSearch('Table & Content', 'Enable Item Headers, Show full page, Show Striped Rows') && (
                <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 shadow-2xs">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Table & Content</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Enable Item Headers (Lock) */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="text-[13px] font-bold text-slate-800">Enable Item Headers</span>
                          <Lock size={11} className="text-slate-400" />
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">Section titles above line groups on PDFs. Turn on to pick types below.</p>
                      </div>
                      <Switch checked={Boolean(invoiceOptions.enableItemHeaders)} onChange={(v) => setOption('enableItemHeaders', v)} />
                    </div>

                    {/* Show full page */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-bold text-slate-800">Show full page</span>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">Vintage, Evergreen, Compact, or Legend PDFs only.</p>
                      </div>
                      <Switch checked={invoiceOptions.showFullPage !== false} onChange={(v) => setOption('showFullPage', v)} />
                    </div>

                    {/* Show Striped Rows */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-bold text-slate-800">Show Striped Rows</span>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">Stripe rows in the PDF table.</p>
                      </div>
                      <Switch checked={Boolean(invoiceOptions.showStripedRows)} onChange={(v) => setOption('showStripedRows', v)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Margins Section */}
              {matchesSearch('Margins', 'PDF margin top, PDF margin bottom, PDF margin left, PDF margin right') && (
                <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 shadow-2xs">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Margins</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    {/* Top Margin */}
                    <div className="space-y-1.5">
                      <span className="text-[13px] font-bold text-slate-800"><span className="text-red-500 mr-0.5">*</span>PDF margin top</span>
                      <p className="text-[11px] text-slate-400 leading-normal font-medium">Top space on the PDF. Try about 50; max 250.</p>
                      <Input 
                        type="number"
                        value={invoiceOptions.marginTop === undefined ? 0 : invoiceOptions.marginTop}
                        onChange={(e) => setOption('marginTop', parseInt(e.target.value, 10) || 0)}
                        className="bg-slate-50 border-0 h-9 rounded-lg"
                      />
                    </div>

                    {/* Bottom Margin */}
                    <div className="space-y-1.5">
                      <span className="text-[13px] font-bold text-slate-800"><span className="text-red-500 mr-0.5">*</span>PDF margin bottom</span>
                      <p className="text-[11px] text-slate-400 leading-normal font-medium">Bottom space on the PDF. Try about 50; max 250.</p>
                      <Input 
                        type="number"
                        value={invoiceOptions.marginBottom === undefined ? 0 : invoiceOptions.marginBottom}
                        onChange={(e) => setOption('marginBottom', parseInt(e.target.value, 10) || 0)}
                        className="bg-slate-50 border-0 h-9 rounded-lg"
                      />
                    </div>

                    {/* Left Margin */}
                    <div className="space-y-1.5">
                      <span className="text-[13px] font-bold text-slate-800"><span className="text-red-500 mr-0.5">*</span>PDF margin left</span>
                      <p className="text-[11px] text-slate-400 leading-normal font-medium">Left PDF margin. 10 to 60; default 24.</p>
                      <Input 
                        type="number"
                        value={invoiceOptions.marginLeft === undefined ? 24 : invoiceOptions.marginLeft}
                        onChange={(e) => setOption('marginLeft', parseInt(e.target.value, 10) || 0)}
                        className="bg-slate-50 border-0 h-9 rounded-lg"
                      />
                    </div>

                    {/* Right Margin */}
                    <div className="space-y-1.5">
                      <span className="text-[13px] font-bold text-slate-800"><span className="text-red-500 mr-0.5">*</span>PDF margin right</span>
                      <p className="text-[11px] text-slate-400 leading-normal font-medium">Right PDF margin. 10 to 60; default 24.</p>
                      <Input 
                        type="number"
                        value={invoiceOptions.marginRight === undefined ? 24 : invoiceOptions.marginRight}
                        onChange={(e) => setOption('marginRight', parseInt(e.target.value, 10) || 0)}
                        className="bg-slate-50 border-0 h-9 rounded-lg"
                      />
                    </div>

                  </div>
                </div>
              )}
            </>
          )}


          {/* ==================== EXPORT TAB ==================== */}
          {activeTab === 'export' && (
            <>
              {matchesSearch('Export', 'Show Conversion Rate, Show in INR') && (
                <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 shadow-2xs">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Export</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Show Conversion Rate */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-bold text-slate-800">Show Conversion Rate</span>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">Show conversion rate on export PDFs.</p>
                      </div>
                      <Switch checked={Boolean(invoiceOptions.showConversionRate)} onChange={(v) => setOption('showConversionRate', v)} />
                    </div>

                    {/* Show in INR */}
                    <div className="flex items-center justify-between gap-4 p-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-bold text-slate-800">Show in INR</span>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">Also show INR on export PDFs.</p>
                      </div>
                      <Switch checked={Boolean(invoiceOptions.showInInr)} onChange={(v) => setOption('showInInr', v)} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}


          {/* ==================== BRANDING TAB ==================== */}
          {activeTab === 'branding' && (
            <>
              {/* Brand Logo Section */}
              {matchesSearch('Business Logo', 'Show logo, Upload brand logo, Logo height') && (
                <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Business Logo</div>
                      <p className="text-[11px] text-slate-400 leading-normal font-medium">Display brand logo on PDFs and printed invoices.</p>
                    </div>
                    <Switch
                      checked={invoiceOptions.showLogo !== false}
                      onChange={(v) => setOption('showLogo', v)}
                    />
                  </div>

                  {invoiceOptions.showLogo !== false && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                      {/* Upload / Preview */}
                      <div className="space-y-2">
                        <span className="text-[13px] font-bold text-slate-800 block">Brand Logo Image</span>
                        <div className="flex items-center gap-3">
                          {(invoiceOptions.logo || profile?.logo) ? (
                            <div className="relative group p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden h-20 w-36">
                              <img
                                src={invoiceOptions.logo || profile?.logo}
                                alt="logo"
                                style={{ maxHeight: `${Math.min(invoiceOptions.logoHeight || profile?.logoHeight || 48, 64)}px`, maxWidth: '100%', objectFit: 'contain' }}
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                <Upload
                                  accept="image/*"
                                  showUploadList={false}
                                  beforeUpload={(file) => handleImageUpload('logo', file)}
                                >
                                  <Button size="small" icon={<UploadIcon size={12} />} className="text-xs bg-white text-slate-800">
                                    Change
                                  </Button>
                                </Upload>
                                <Button
                                  size="small"
                                  danger
                                  onClick={() => setOption('logo', '')}
                                  className="text-xs bg-white"
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Upload
                              accept="image/*"
                              showUploadList={false}
                              beforeUpload={(file) => handleImageUpload('logo', file)}
                            >
                              <Button
                                icon={<UploadIcon size={14} className="text-slate-500" />}
                                className="flex flex-col items-center justify-center w-36 h-20 bg-white border border-dashed border-slate-200 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-all text-[11px] text-slate-500 gap-1"
                              >
                                Upload Logo
                              </Button>
                            </Upload>
                          )}
                          <div className="text-[11px] text-slate-400 leading-tight">
                            PNG, JPG, SVG or WebP.<br />Recommended 400×200px transparent.
                          </div>
                        </div>
                      </div>

                      {/* Logo Height */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-bold text-slate-800">Logo Size Height</span>
                          <span className="text-xs font-mono text-slate-500 font-semibold">
                            {invoiceOptions.logoHeight || profile?.logoHeight || 48}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={24}
                          max={100}
                          step={2}
                          value={invoiceOptions.logoHeight || profile?.logoHeight || 48}
                          onChange={(e) => setOption('logoHeight', Number(e.target.value))}
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                          <span>24px (Small)</span>
                          <span>48px (Default)</span>
                          <span>100px (Large)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Color & Watermark Section */}
              {matchesSearch('Color & Watermark', 'PDF accent color, Watermark') && (
                <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 shadow-2xs">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Color & Watermark</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    {/* Color Picker */}
                    <div className="space-y-1.5">
                      <span className="text-[13px] font-bold text-slate-800">PDF accent color (default #276ef1)</span>
                      <p className="text-[11px] text-slate-400 leading-normal font-medium">Hex color for PDF accents on templates that support tinting.</p>
                      <Input 
                        value={invoiceOptions.pdfAccentColor || '#276ef1'}
                        onChange={(e) => setOption('pdfAccentColor', e.target.value)}
                        className="bg-slate-50 border-0 h-9 rounded-lg"
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <div 
                          className="w-10 h-10 rounded-lg border border-slate-200 shadow-sm"
                          style={{ backgroundColor: invoiceOptions.pdfAccentColor || '#276ef1' }}
                        />
                        <span className="text-xs font-semibold text-slate-500">Selected Tint Accent</span>
                      </div>
                    </div>

                    {/* Watermark Preview Tile */}
                    <div className="space-y-1.5">
                      <span className="text-[13px] font-bold text-slate-800">Watermark</span>
                      <p className="text-[11px] text-slate-400 leading-normal font-medium">PNG or JPEG, 512×512 square. Transparency is handled for you.</p>
                      
                      <div className="relative w-36 h-20 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                        {/* Beautiful Tilted Watermark Text resembling the screenshot */}
                        <div className="text-slate-200 text-3xl font-black uppercase tracking-widest select-none transform -rotate-12 scale-110 opacity-60">
                          swipe
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Footer Text Section */}
              {matchesSearch('Footer Text', 'PDF footer, Thermal Print Footer') && (
                <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 shadow-2xs">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Footer Text</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    {/* PDF Footer */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[13px] font-bold text-slate-800">PDF footer</span>
                        <Lock size={11} className="text-slate-400" />
                      </div>
                      <Input.TextArea 
                        rows={3}
                        maxLength={255}
                        placeholder="Swipe | Simple Invoicing, Billing and Payments | Visit getswipe.in"
                        value={invoiceOptions.footerTerms || ''}
                        onChange={(e) => setOption('footerTerms', e.target.value)}
                        className="rounded-lg border-slate-200"
                      />
                      <div className="text-right text-[10px] text-slate-400 font-medium">
                        Up to 255 characters on PDFs.
                      </div>
                    </div>

                    {/* Thermal Print Footer */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[13px] font-bold text-slate-800">Thermal Print Footer</span>
                        <Lock size={11} className="text-slate-400" />
                      </div>
                      <Input.TextArea 
                        rows={3}
                        maxLength={255}
                        placeholder="Powered by Swipe POS, https://getswipe.in"
                        value={invoiceOptions.thermalFooterTerms || ''}
                        onChange={(e) => setOption('thermalFooterTerms', e.target.value)}
                        className="rounded-lg border-slate-200"
                      />
                      <div className="text-right text-[10px] text-slate-400 font-medium">
                        Up to 255 characters on PDFs.
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Header & Footer Images Section */}
              {matchesSearch('Header & Footer Images', 'Header image, Footer image') && (
                <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 shadow-2xs">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Header & Footer Images</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    {/* Header Image Upload */}
                    <div className="flex items-center justify-between gap-4 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="text-[13px] font-bold text-slate-800">Header</span>
                          <HelpCircle size={11} className="text-slate-400 cursor-help" />
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">PNG or JPEG, 1000×125 wide strip. First PDF page only.</p>
                      </div>
                      
                      <Upload 
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={(file) => handleImageUpload('headerStripImage', file)}
                      >
                        {invoiceOptions.headerStripImage ? (
                          <div className="relative group w-20 h-10 border border-slate-200 rounded-lg overflow-hidden bg-white">
                            <img src={invoiceOptions.headerStripImage} alt="header" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <UploadIcon size={12} className="text-white" />
                            </div>
                          </div>
                        ) : (
                          <Button 
                            icon={<UploadIcon size={14} className="text-slate-500" />}
                            className="flex flex-col items-center justify-center w-20 h-20 bg-white border border-dashed border-slate-200 rounded-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition-all text-[11px] text-slate-500 shrink-0 gap-1 h-auto"
                          >
                            Upload
                          </Button>
                        )}
                      </Upload>
                    </div>

                    {/* Footer Image Upload */}
                    <div className="flex items-center justify-between gap-4 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="text-[13px] font-bold text-slate-800">Footer</span>
                          <HelpCircle size={11} className="text-slate-400 cursor-help" />
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">PNG or JPEG, 1000×125 wide strip.</p>
                      </div>
                      
                      <Upload 
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={(file) => handleImageUpload('footerStripImage', file)}
                      >
                        {invoiceOptions.footerStripImage ? (
                          <div className="relative group w-20 h-10 border border-slate-200 rounded-lg overflow-hidden bg-white">
                            <img src={invoiceOptions.footerStripImage} alt="footer" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <UploadIcon size={12} className="text-white" />
                            </div>
                          </div>
                        ) : (
                          <Button 
                            icon={<UploadIcon size={14} className="text-slate-500" />}
                            className="flex flex-col items-center justify-center w-20 h-20 bg-white border border-dashed border-slate-200 rounded-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition-all text-[11px] text-slate-500 shrink-0 gap-1 h-auto"
                          >
                            Upload
                          </Button>
                        )}
                      </Upload>
                    </div>

                  </div>
                </div>
              )}

              {/* Banner Images Section */}
              {matchesSearch('Banner Images', 'Banner Image - Top, Banner Image - Bottom') && (
                <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 shadow-2xs">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Banner Images</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    {/* Banner Image Top Upload */}
                    <div className="flex items-center justify-between gap-4 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="text-[13px] font-bold text-slate-800">Banner Image - Top</span>
                          <HelpCircle size={11} className="text-slate-400 cursor-help" />
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">PNG or JPEG, 1000×125. Above line items on PDFs.</p>
                      </div>
                      
                      <Upload 
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={(file) => handleImageUpload('topBannerImage', file)}
                      >
                        {invoiceOptions.topBannerImage ? (
                          <div className="relative group w-20 h-10 border border-slate-200 rounded-lg overflow-hidden bg-white">
                            <img src={invoiceOptions.topBannerImage} alt="top banner" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <UploadIcon size={12} className="text-white" />
                            </div>
                          </div>
                        ) : (
                          <Button 
                            icon={<UploadIcon size={14} className="text-slate-500" />}
                            className="flex flex-col items-center justify-center w-20 h-20 bg-white border border-dashed border-slate-200 rounded-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition-all text-[11px] text-slate-500 shrink-0 gap-1 h-auto"
                          >
                            Upload
                          </Button>
                        )}
                      </Upload>
                    </div>

                    {/* Banner Image Bottom Upload */}
                    <div className="flex items-center justify-between gap-4 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="text-[13px] font-bold text-slate-800">Banner Image - Bottom</span>
                          <HelpCircle size={11} className="text-slate-400 cursor-help" />
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium">PNG or JPEG, 1000×125. Below line items on PDFs.</p>
                      </div>
                      
                      <Upload 
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={(file) => handleImageUpload('bottomBannerImage', file)}
                      >
                        {invoiceOptions.bottomBannerImage ? (
                          <div className="relative group w-20 h-10 border border-slate-200 rounded-lg overflow-hidden bg-white">
                            <img src={invoiceOptions.bottomBannerImage} alt="bottom banner" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <UploadIcon size={12} className="text-white" />
                            </div>
                          </div>
                        ) : (
                          <Button 
                            icon={<UploadIcon size={14} className="text-slate-500" />}
                            className="flex flex-col items-center justify-center w-20 h-20 bg-white border border-dashed border-slate-200 rounded-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition-all text-[11px] text-slate-500 shrink-0 gap-1 h-auto"
                          >
                            Upload
                          </Button>
                        )}
                      </Upload>
                    </div>

                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer Actions (Cancel / Save changes) */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
          <Button
            type="primary"
            onClick={handleSaveChanges}
            className="bg-blue-600 hover:bg-blue-700 h-10 font-bold text-[13px] px-6 rounded-lg border-0 cursor-pointer"
          >
            Save changes
          </Button>
          <Button
            type="text"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 h-10 font-bold text-[13px] px-6 rounded-lg cursor-pointer"
          >
            Cancel
          </Button>
        </div>

      </div>

      {/* Ant Design Invoice Template Selection Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-red-500" fill="currentColor" />
            <span className="text-base font-bold text-slate-900">Select Invoice Template</span>
          </div>
        }
        open={isTemplateModalOpen}
        onOk={() => setIsTemplateModalOpen(false)}
        onCancel={() => setIsTemplateModalOpen(false)}
        width={650}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsTemplateModalOpen(false)} className="bg-blue-600 hover:bg-blue-700">
            Apply Template
          </Button>
        ]}
      >
        <div className="py-4 space-y-4">
          <p className="text-xs text-slate-500">
            Select a professional invoice template using Ant Design selection controls. Changes apply instantly to your invoice document preview and printed PDFs.
          </p>
          <Radio.Group 
            value={invoiceOptions.pdfStyle || 'classic'}
            onChange={(e) => setOption('pdfStyle', e.target.value)}
            className="w-full space-y-2.5"
          >
            {[
              { id: 'classic', label: 'Classic', desc: 'Standard business layout with clean dividers and top bar' },
              { id: 'modern', label: 'Modern', desc: 'Contemporary header block with accent typography' },
              { id: 'minimal', label: 'Minimal', desc: 'Ultra-clean, crisp borderless editorial layout' },
              { id: 'corporate', label: 'Corporate', desc: 'Formal executive structure with high-contrast sections' },
              { id: 'evergreen', label: 'Evergreen', desc: 'Detailed business and quotation layout with structured grid' },
              { id: 'exact', label: 'Exact GST Standard', desc: 'Official statutory GST tax invoice layout with structured tax and totals columns' },
            ].map((t) => (
              <div 
                key={t.id}
                onClick={() => setOption('pdfStyle', t.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  (invoiceOptions.pdfStyle || 'classic') === t.id
                    ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Radio value={t.id} />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{t.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{t.desc}</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded">
                  {t.id}
                </span>
              </div>
            ))}
          </Radio.Group>
        </div>
      </Modal>
    </Drawer>
  );
};
