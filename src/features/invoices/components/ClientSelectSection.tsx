import React, { useState, useRef, useEffect } from 'react';
import { AutoComplete, ConfigProvider, Input as AntInput } from 'antd';
import { useIsDarkMode, getAntdTheme } from '@/shared/components/ui/AntdThemeConfig';
import {
  Search,
  Plus,
  HelpCircle,
  Pencil,
  X,
  ChevronDown,
  User,
  CreditCard,
  MapPin,
} from 'lucide-react';
import { INVOICE_TYPES } from '@/features/invoices/constants';
import { DatePicker, Select, Input } from '@/shared/components/ui';

interface ClientSelectSectionProps {
  editingBill?: any;
  clientCredit?: any;
  invoiceOptions?: any;
  setInvoiceOptions?: React.Dispatch<React.SetStateAction<any>>;
  totals?: any;
  creditToApply?: number;
  setCreditToApply?: (val: number) => void;
  client: any;
  setClient: React.Dispatch<React.SetStateAction<any>>;
  clientNameRef: React.RefObject<HTMLInputElement | null>;
  showClientSuggestions: boolean;
  setShowClientSuggestions: (val: boolean) => void;
  savedClients: any[];
  filteredClients: any[];
  clientPickerIdx: number;
  setClientPickerIdx: React.Dispatch<React.SetStateAction<number>>;
  selectedClientId: string | null;
  setSelectedClientId: (val: string | null) => void;
  selectSavedClient: (cli: any) => void;
  openEditClientModal: (cli: any) => void;
  openAddClientModal: () => void;
  clientSuggestionsRef: React.RefObject<HTMLDivElement | null>;
  profile?: any;
  getCountriesForRegion?: (region: string) => any[];
  getRegionMode?: () => string;
  getCountryConfig?: (country: string) => any;
  getStatesForCountry?: (country: string) => string[];
  formatCurrency?: (amount: number, currency: string) => string;

  details: any;
  setDetails: React.Dispatch<React.SetStateAction<any>>;
  invoiceType: string;
}

const CUSTOM_HEADER_TAGS = [
  { id: 'vehicleNo', label: 'Vehicle No' },
  { id: 'poNumber', label: 'PO Number' },
  { id: 'challanNo', label: 'Challan No.' },
  { id: 'deliveryDate', label: 'Delivery Date', type: 'date' },
  { id: 'salesPerson', label: 'Sales Person' },
  { id: 'dispatchNumber', label: 'Dispatch Number' },
];

export function ClientSelectSection({
  client,
  setClient,
  clientNameRef,
  showClientSuggestions,
  setShowClientSuggestions,
  savedClients = [],
  filteredClients = [],
  clientPickerIdx,
  setClientPickerIdx,
  selectedClientId,
  setSelectedClientId,
  selectSavedClient,
  openEditClientModal,
  openAddClientModal,
  clientSuggestionsRef,
  clientCredit,
  details,
  setDetails,
  invoiceType,
  profile,
  getStatesForCountry,
}: ClientSelectSectionProps) {
  const [searchQuery, setSearchQuery] = useState(client?.name || '');
  const [isEditingSearch, setIsEditingSearch] = useState(!client?.name);
  const [showAddressDetails, setShowAddressDetails] = useState(false);
  const [activeCustomHeaders, setActiveCustomHeaders] = useState<Record<string, string>>(() => {
    return details?.customHeaders || {};
  });

  const lastSelectedIdRef = useRef<string | null>(selectedClientId || null);

  const typeConfig = (INVOICE_TYPES as Record<string, any>)[invoiceType];
  const isQuotation = invoiceType === 'quotation' || invoiceType === 'estimate';
  const dateLabel = isQuotation ? 'Quotation Date' : 'Invoice Date';
  const validityLabel = isQuotation ? 'Validity' : 'Due Date';

  // Only collapse into selected card on mount or when a saved client ID is explicitly changed externally
  useEffect(() => {
    if (selectedClientId && selectedClientId !== lastSelectedIdRef.current) {
      lastSelectedIdRef.current = selectedClientId;
      if (client?.name) {
        setSearchQuery(client.name);
        setIsEditingSearch(false);
      }
    }
  }, [selectedClientId, client?.name]);

  // Comprehensive multi-field client matching
  const matchingClients = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return (savedClients || []).slice(0, 8);
    return (savedClients || []).filter((cli: any) => {
      const name = (cli.name || '').toLowerCase();
      const company = (cli.company || cli.businessName || '').toLowerCase();
      const gstin = (cli.gstin || '').toLowerCase();
      const phone = (cli.phone || '').toLowerCase();
      const email = (cli.email || '').toLowerCase();
      const city = (cli.city || '').toLowerCase();
      const state = (cli.state || '').toLowerCase();
      return (
        name.includes(q) ||
        company.includes(q) ||
        gstin.includes(q) ||
        phone.includes(q) ||
        email.includes(q) ||
        city.includes(q) ||
        state.includes(q)
      );
    }).slice(0, 8);
  }, [searchQuery, savedClients]);

  const handleSelectClient = (c: any) => {
    lastSelectedIdRef.current = c.id || null;
    selectSavedClient(c);
    setSearchQuery(c.name || '');
    setIsEditingSearch(false);
    setShowClientSuggestions(false);
  };

  const handleSelectCashCustomer = () => {
    lastSelectedIdRef.current = null;
    if (setSelectedClientId) setSelectedClientId(null);
    setClient({
      name: 'Cash / Walk-in Customer',
      address: '',
      city: '',
      pin: '',
      state: profile?.state || '',
      gstin: '',
      country: profile?.country || 'India',
      email: '',
      phone: '',
      isSEZ: false,
    });
    setSearchQuery('Cash / Walk-in Customer');
    setIsEditingSearch(false);
    setShowClientSuggestions(false);
  };

  const handleConfirmOneTimeCustomer = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    lastSelectedIdRef.current = null;
    if (setSelectedClientId) setSelectedClientId(null);
    setClient((prev: any) => ({
      ...prev,
      name: trimmed,
      country: prev?.country || profile?.country || 'India',
      state: prev?.state || profile?.state || '',
    }));
    setIsEditingSearch(false);
    setShowClientSuggestions(false);
  };

  const isDark = useIsDarkMode();

  const autoCompleteOptions = React.useMemo(() => {
    const list: any[] = [];

    // Quick Cash / Walk-in Customer option
    list.push({
      value: 'Cash / Walk-in Customer',
      key: 'cash-customer',
      type: 'cash',
      label: (
        <div
          key="cash-customer"
          onMouseDown={(e) => {
            e.preventDefault();
            handleSelectCashCustomer();
          }}
          className="px-3 py-2 text-xs cursor-pointer bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 hover:text-blue-800 transition flex items-center justify-between font-medium border-b border-slate-100 dark:border-slate-800"
        >
          <span className="flex items-center space-x-1.5">
            <span className="text-amber-500">⚡</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">Cash / Walk-in Customer</span>
          </span>
          <span className="text-[10px] text-slate-400 font-normal">Standard Billing</span>
        </div>
      ),
    });

    // Matching Saved Clients
    matchingClients.forEach((c: any, i: number) => {
      list.push({
        value: c.name,
        key: c.id || `${c.name}-${i}`,
        client: c,
        label: (
          <div
            key={c.id || `${c.name}-${i}`}
            onMouseDown={(e) => {
              e.preventDefault();
              handleSelectClient(c);
            }}
            className="flex items-center justify-between py-2 px-1 border-b border-slate-100/80 dark:border-slate-800/60 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
          >
            {/* Left Details */}
            <div className="flex-1 min-w-0 pr-3">
              <div className="font-bold text-slate-900 dark:text-slate-100 text-[13px] leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {c.name}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] mt-0.5 flex-wrap text-slate-500 dark:text-slate-400">
                {c.phone && <span>Ph: {c.phone}</span>}
                {c.city && <span>• {c.city}</span>}
                {c.state && <span>({c.state})</span>}
              </div>
            </div>

            {/* Right Side: GSTIN or Tag */}
            {c.gstin && (
              <div className="shrink-0">
                <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  GST: {c.gstin}
                </span>
              </div>
            )}
          </div>
        ),
      });
    });

    return list;
  }, [matchingClients, handleSelectCashCustomer, handleSelectClient]);

  const handleClearClient = () => {
    lastSelectedIdRef.current = null;
    if (setSelectedClientId) setSelectedClientId(null);
    setClient({
      name: '',
      address: '',
      city: '',
      pin: '',
      state: '',
      gstin: '',
      country: profile?.country || 'India',
      email: '',
      phone: '',
      isSEZ: false,
    });
    setSearchQuery('');
    setIsEditingSearch(true);
    setShowClientSuggestions(true);
    setTimeout(() => {
      clientNameRef.current?.focus();
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showClientSuggestions) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setShowClientSuggestions(true);
      }
      return;
    }

    const totalSuggestions = matchingClients.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setClientPickerIdx((prev) => (prev < totalSuggestions - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setClientPickerIdx((prev) => (prev > 0 ? prev - 1 : totalSuggestions - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (clientPickerIdx >= 0 && clientPickerIdx < matchingClients.length) {
        handleSelectClient(matchingClients[clientPickerIdx]);
      } else if (searchQuery.trim()) {
        handleConfirmOneTimeCustomer();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowClientSuggestions(false);
      setClientPickerIdx(-1);
    }
  };

  const handleCustomHeaderClick = (tagId: string) => {
    if (activeCustomHeaders[tagId] !== undefined) {
      const next = { ...activeCustomHeaders };
      delete next[tagId];
      setActiveCustomHeaders(next);
      setDetails((prev: any) => ({ ...prev, customHeaders: next }));
    } else {
      const next = { ...activeCustomHeaders, [tagId]: '' };
      setActiveCustomHeaders(next);
      setDetails((prev: any) => ({ ...prev, customHeaders: next }));
    }
  };

  const updateCustomHeaderValue = (tagId: string, val: string) => {
    const next = { ...activeCustomHeaders, [tagId]: val };
    setActiveCustomHeaders(next);
    setDetails((prev: any) => ({ ...prev, customHeaders: next }));
  };

  const handleDateChange = (field: 'invoiceDate' | 'dueDate', val: string) => {
    setDetails((prev: any) => ({ ...prev, [field]: val }));
  };

  const handleReferenceChange = (val: string) => {
    setDetails((prev: any) => ({ ...prev, reference: val }));
  };

  const states = getStatesForCountry?.(client?.country || profile?.country || 'India') || [];
  const hasSelectedCustomer = Boolean(client?.name?.trim()) && !isEditingSearch;
  const isSavedCustomer = Boolean(selectedClientId || savedClients.some((c: any) => c.name === client?.name));

  return (
    <div className="space-y-3" id="client-and-details-section">
      {/* Section 1: Customer and Details */}
      <section className="bg-white dark:bg-[#141414] border border-slate-200 dark:border-[rgba(255,255,255,0.08)] rounded-lg p-3.5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
          {/* Customer Selection (Col 4) */}
          <div className="md:col-span-4 relative" id="customer-selection-card">
            <div className="flex items-center justify-between h-5 mb-1.5">
              <label htmlFor="customer-search-input" className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Select Customer
              </label>
              <button
                type="button"
                id="btn-create-customer-modal"
                onClick={openAddClientModal}
                className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Create Customer</span>
              </button>
            </div>

            {/* If Client is Selected and not actively searching */}
            {hasSelectedCustomer ? (
              <div id="selected-customer-card" className="bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-xs shadow-xs min-h-[32px] flex flex-col justify-center">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1 flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs truncate max-w-[170px]" title={client.name}>
                      {client.name}
                    </span>
                    {isSavedCustomer ? (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Saved
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        Walk-in
                      </span>
                    )}
                    {client.phone && <span className="text-[10px] text-slate-500">Ph: {client.phone}</span>}
                    {client.gstin && <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400">GST: {client.gstin}</span>}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center space-x-1 shrink-0">
                    {isSavedCustomer && (
                      <button
                        type="button"
                        id="btn-edit-selected-customer"
                        onClick={() => openEditClientModal(client)}
                        className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Edit Customer Master Record"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      id="btn-change-selected-customer"
                      onClick={() => {
                        setIsEditingSearch(true);
                        setShowClientSuggestions(true);
                        setTimeout(() => clientNameRef.current?.focus(), 50);
                      }}
                      className="text-[10px] text-blue-600 hover:text-blue-700 font-medium px-1.5 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                      title="Search or select different customer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      id="btn-clear-selected-customer"
                      onClick={handleClearClient}
                      className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Clear customer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Client credit pill if available */}
                {clientCredit && clientCredit.available > 0 && (
                  <div className="mt-1 flex items-center space-x-1 text-[10px] text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-medium">
                    <CreditCard className="w-2.5 h-2.5" />
                    <span>Advance Credit Available: ₹{clientCredit.available}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Ant Design Search Input & Dynamic Dropdown matching Product Search style */
              <div ref={clientSuggestionsRef} className="relative w-full" id="customer-search-container">
                <ConfigProvider theme={getAntdTheme(isDark)}>
                  <AutoComplete
                    className="w-full"
                    options={autoCompleteOptions}
                    value={searchQuery}
                    onSearch={(text) => {
                      setSearchQuery(text);
                      setClient((prev: any) => ({ ...prev, name: text }));
                      setShowClientSuggestions(true);
                      setClientPickerIdx(0);
                    }}
                    onSelect={(_val, option: any) => {
                      if (option?.client) {
                        handleSelectClient(option.client);
                      } else if (option?.type === 'cash') {
                        handleSelectCashCustomer();
                      }
                    }}
                    open={showClientSuggestions}
                    onFocus={() => setShowClientSuggestions(true)}
                    popupMatchSelectWidth={false}
                    popupRender={(menu) => (
                      <div className="bg-white dark:bg-[#1f1f1f] rounded-[6px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 min-w-[340px] max-w-[500px] z-50">
                        <div className="max-h-[360px] overflow-y-auto">
                          {matchingClients.length > 0 || !searchQuery.trim() ? (
                            menu
                          ) : (
                            <div className="py-6 px-4 text-center text-slate-500 text-xs font-medium">
                              No saved customer found for &quot;{searchQuery}&quot;
                            </div>
                          )}
                        </div>

                        {/* One-time customer action if query has custom text */}
                        {searchQuery.trim() && (
                          <div
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleConfirmOneTimeCustomer();
                            }}
                            className="px-3 py-2 bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border-t border-blue-100 dark:border-blue-900 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between cursor-pointer transition-colors font-medium"
                          >
                            <span>Use &quot;<strong>{searchQuery.trim()}</strong>&quot; as One-Time Customer</span>
                            <span className="text-[10px] text-blue-500">↵ Enter</span>
                          </div>
                        )}

                        {/* Bottom Footer: Create Customer */}
                        <div
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setShowClientSuggestions(false);
                            openAddClientModal();
                          }}
                          className="bg-[#f0f2f5] dark:bg-slate-800/90 py-3.5 px-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer hover:bg-[#e2e5ea] dark:hover:bg-slate-800 transition-colors group"
                        >
                          <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                            +
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Create New Customer &rarr;
                          </span>
                        </div>
                      </div>
                    )}
                  >
                    <AntInput
                      ref={clientNameRef as any}
                      id="customer-search-input"
                      prefix={<Search className="w-4 h-4 text-slate-400 mr-1.5 shrink-0" />}
                      placeholder="Search by Name, Phone, GSTIN, City..."
                      size="middle"
                      className="w-full !rounded-[6px] !border !border-slate-300 dark:!border-slate-700 !bg-white dark:!bg-[#141414] font-medium text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-xs focus:!border-blue-500"
                      allowClear
                      onKeyDown={handleKeyDown}
                    />
                  </AutoComplete>
                </ConfigProvider>
              </div>
            )}
          </div>

          {/* Quotation / Invoice Date (Col 2) */}
          <div className="md:col-span-2 sm:col-span-6">
            <DatePicker
              id="invoice-date-input"
              label={
                <div className="flex items-center h-5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {dateLabel}
                  </span>
                </div>
              }
              value={details?.invoiceDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => handleDateChange('invoiceDate', e.target.value)}
              pickerSize="sm"
              allowClear={false}
              containerClassName="!mb-0 mb-0"
              fullWidth
            />
          </div>

          {/* Validity / Due Date (Col 2) */}
          <div className="md:col-span-2 sm:col-span-6">
            <DatePicker
              id="invoice-due-date-input"
              label={
                <div className="flex items-center space-x-1 h-5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {validityLabel}
                  </span>
                  <HelpCircle
                    className="w-3 h-3 text-slate-400 cursor-pointer"
                    aria-label={`Validity period or due date for this ${typeConfig?.label || 'document'}`}
                  />
                </div>
              }
              value={details?.dueDate || ''}
              onChange={(e) => handleDateChange('dueDate', e.target.value)}
              pickerSize="sm"
              allowClear
              placeholder="Due date"
              containerClassName="!mb-0 mb-0"
              fullWidth
              showNetPresets
              baseDate={details?.invoiceDate}
            />
          </div>

          {/* Reference (Col 4) */}
          <div className="md:col-span-4">
            <Input
              id="invoice-reference-input"
              inputSize="sm"
              label={
                <div className="flex items-center space-x-1 h-5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Reference
                  </span>
                  <HelpCircle
                    className="w-3 h-3 text-slate-400 cursor-pointer"
                    aria-label="Add PO number, salesperson, or shipment references"
                  />
                </div>
              }
              placeholder="PO #, Salesperson, notes... (Optional)"
              value={details?.reference || ''}
              onChange={(e) => handleReferenceChange(e.target.value)}
              containerClassName="!mb-0 mb-0"
              fullWidth
            />
          </div>
        </div>

        {/* Optional Collapsible Place of Supply & Billing Details */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400" id="place-of-supply-row">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">Place of Supply:</span>
            <div className="w-56">
              <Select
                id="select-place-of-supply"
                selectSize="sm"
                containerClassName="!mb-0 mb-0"
                value={details?.placeOfSupply || client?.state || profile?.state || ''}
                onChange={(e: any) => {
                  const val = typeof e === 'object' && e?.target ? e.target.value : e;
                  setDetails((prev: any) => ({ ...prev, placeOfSupply: val }));
                }}
                options={[
                  {
                    value: '',
                    label: `Same as State (${client?.state || profile?.state || 'Default'})`,
                  },
                  ...states.map((s: string) => ({
                    value: s,
                    label: s,
                  })),
                ]}
              />
            </div>
          </div>

          <button
            type="button"
            id="btn-toggle-address-details"
            onClick={() => setShowAddressDetails((v) => !v)}
            className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium transition cursor-pointer flex items-center gap-1"
          >
            {showAddressDetails ? 'Hide Address Details' : '+ Add / Edit Billing Address'}
          </button>
        </div>

        {/* Expandable Address Details */}
        {showAddressDetails && (
          <div className="mt-3 p-3 bg-slate-50 rounded border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs" id="expandable-billing-address-section">
            <div>
              <label htmlFor="client-billing-address-input" className="block text-[10px] text-slate-500 mb-0.5">Billing Address</label>
              <input
                id="client-billing-address-input"
                type="text"
                value={client?.address || ''}
                onChange={(e) => setClient((prev: any) => ({ ...prev, address: e.target.value }))}
                placeholder="Street address"
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
              />
            </div>
            <div>
              <label htmlFor="client-billing-city-input" className="block text-[10px] text-slate-500 mb-0.5">City &amp; PIN</label>
              <div className="flex space-x-1">
                <input
                  id="client-billing-city-input"
                  type="text"
                  value={client?.city || ''}
                  onChange={(e) => setClient((prev: any) => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                  className="w-2/3 bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                />
                <input
                  id="client-billing-pin-input"
                  type="text"
                  value={client?.pin || ''}
                  onChange={(e) => setClient((prev: any) => ({ ...prev, pin: e.target.value }))}
                  placeholder="PIN"
                  className="w-1/3 bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                />
              </div>
            </div>
            <div>
              <label htmlFor="client-billing-gstin-input" className="block text-[10px] text-slate-500 mb-0.5">Customer GSTIN</label>
              <input
                id="client-billing-gstin-input"
                type="text"
                value={client?.gstin || ''}
                onChange={(e) => setClient((prev: any) => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                placeholder="22AAAAA0000A1Z5"
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono"
              />
            </div>
          </div>
        )}
      </section>

      {/* Custom Headers Tags Row */}
      <section className="space-y-1.5" id="custom-headers-tags-section">
        <h3 className="text-[11px] font-semibold text-slate-600">Custom Headers</h3>
        <div className="flex flex-wrap items-center gap-2">
          {CUSTOM_HEADER_TAGS.map((tag) => {
            const isFilled = activeCustomHeaders[tag.id] !== undefined;
            return (
              <button
                key={tag.id}
                id={`btn-custom-header-${tag.id}`}
                type="button"
                onClick={() => handleCustomHeaderClick(tag.id)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition shadow-xs cursor-pointer ${
                  isFilled
                    ? 'border border-blue-500 bg-blue-50 text-blue-700'
                    : 'border border-blue-400 bg-white hover:bg-blue-50 text-blue-600'
                }`}
              >
                <span>{isFilled ? '✓' : '+'}</span>
                <span>{tag.label}</span>
              </button>
            );
          })}
        </div>

        {/* If any custom headers are active, show inline edit fields */}
        {Object.keys(activeCustomHeaders).length > 0 && (
          <div className="p-2.5 bg-white border border-slate-200 rounded-md grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-1" id="active-custom-headers-fields">
            {Object.keys(activeCustomHeaders).map((tagId) => {
              const tagConfig = CUSTOM_HEADER_TAGS.find((t) => t.id === tagId);
              return (
                <div key={tagId} className="relative">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                    <span>{tagConfig?.label || tagId}</span>
                    <button
                      type="button"
                      id={`btn-remove-header-${tagId}`}
                      onClick={() => handleCustomHeaderClick(tagId)}
                      className="text-slate-400 hover:text-red-500"
                      title="Remove field"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <input
                    id={`input-custom-header-${tagId}`}
                    type={tagConfig?.type || 'text'}
                    value={activeCustomHeaders[tagId] || ''}
                    onChange={(e) => updateCustomHeaderValue(tagId, e.target.value)}
                    placeholder={`Enter ${tagConfig?.label || tagId}`}
                    className="w-full py-1 px-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default ClientSelectSection;
