import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  saveBill,
  getNextInvoiceNumber,
  getTermsTemplates,
  getAllClients,
  saveClient,
  getProfile,
  getAllProducts,
  saveProduct,
  getInvoiceDisplayOptions,
  saveInvoiceDisplayOptions,
  getAllProfiles,
  saveRecurring,
  getAllBills,
} from '@/store';
import {
  INVOICE_TYPES,
} from '@/features/invoices/constants';
import {
  formatCurrency,
  getCountryConfig,
  getAllUnits,
  addCustomUnit,
  removeCustomUnit,
  getActiveAccounts,
  getDefaultAccount,
  getAccountById,
  getDefaultUnitForMode,
} from '@/shared/utils';
import { computeInvoiceTotals } from '../utils/taxCalculation';
import { getPaperSize, getPrintSettings, savePrintSettings } from '../utils/printSettings';
import { confirmAction, promptAction } from '@/shared/components/feedback/ConfirmModal';
import { ensureToken, findOrCreateFolder, uploadPDF } from '@/features/settings/services/googleDrive';
import { getClientCredit, planCreditApplication } from '@/features/clients/utils/clientCredit';
import { toast } from '@/shared/components/feedback/Toast';
import { buildInvoicePDF } from '../services/pdfService';
import { InvoiceType, InvoiceItem } from '../types';

const DEFAULT_OPTIONS = {
  showGST: true,
  showState: true,
  showGSTIN: true,
  showPlaceOfSupply: true,
  showHSN: true,
  showDiscount: true,
  showBankDetails: true,
  showUPI: true,
  showLogo: true,
  showSignature: true,
  showTerms: true,
  showNotes: true,
  showAmountWords: true,
  showDueDate: true,
  showItemQty: true,
  showRoundOff: false,
  invoiceMode: 'goods',
  paperSize: 'a4',
  thermalFontSize: 'medium',
  thermalCompact: false,
  thermalCutMark: true,
  recurring: null,
  showCess: false,
  reverseCharge: false,
  showTDS: false,
  tdsSection: '194Q',
  tdsRate: 0.1,
  tdsCumulativeThisYear: 0,
  showTCS: false,
  tcsSection: '206C(1H)',
  tcsRate: 0.1,
  tcsCumulativeThisYear: 0,
  customTitle: '',
  currency: 'INR',
  exchangeRate: '',
  selectedAccountId: null,
  showAccountLabel: false,
  accentColor: '',
  pdfStyle: 'classic',
  invoiceDiscountValue: 0,
  invoiceDiscountType: 'fixed',
  autoApplyClientCredit: false,
};

function loadDraft() {
  try {
    const saved = sessionStorage.getItem('gst_invoiceDraft');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

interface UseInvoiceFormProps {
  onBack: () => void;
  profileProp?: any;
  editingBill?: any;
}

export function useInvoiceForm({ onBack, profileProp, editingBill }: UseInvoiceFormProps) {
  const draft = loadDraft();
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [activeProfile, setActiveProfile] = useState<any>(profileProp);
  const profile = activeProfile || profileProp;
  const [invoiceType, setInvoiceType] = useState<InvoiceType>((draft?.invoiceType as InvoiceType) || 'tax-invoice');
  const [client, setClient] = useState<any>(
    draft?.client || {
      name: '',
      address: '',
      city: '',
      pin: '',
      state: '',
      gstin: '',
      country: '',
      email: '',
      phone: '',
      isSEZ: false,
    }
  );

  const previewPaneRef = useRef<HTMLDivElement | null>(null);
  const printRef = useRef<HTMLDivElement | null>(null);

  const [previewZoom, setPreviewZoom] = useState<number>(() => {
    try {
      return Number(getPrintSettings().previewZoom) || 100;
    } catch {
      return 100;
    }
  });

  useEffect(() => {
    try {
      const s = getPrintSettings();
      if (Number(s.previewZoom) !== previewZoom) {
        savePrintSettings({ ...s, previewZoom });
      }
    } catch {
      /* sandboxed localStorage - session-only degradation ok */
    }
  }, [previewZoom]);

  const handleFitToWidth = useCallback(() => {
    if (!previewPaneRef.current) {
      setPreviewZoom(100);
      return;
    }
    const pane = previewPaneRef.current;
    const scaler = pane.querySelector('.preview-scaler');
    const preview = scaler?.querySelector('.invoice-preview-container') as HTMLElement | null;
    const paneWidth = pane.clientWidth - 16;
    const naturalWidth = preview?.offsetWidth || 794;
    if (!(paneWidth > 0 && naturalWidth > 0)) {
      setPreviewZoom(100);
      return;
    }
    const ratio = paneWidth / naturalWidth;
    const nextZoom = Math.max(50, Math.min(200, Math.round(ratio * 100)));
    setPreviewZoom(nextZoom);
  }, []);

  const [previewCollapsed, setPreviewCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fgsb_previewCollapsed') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('fgsb_previewCollapsed', previewCollapsed ? '1' : '0');
    } catch {
      /* sandboxed */
    }
  }, [previewCollapsed]);

  const [details, setDetails] = useState<any>(
    draft?.details || {
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      placeOfSupply: '',
      originalInvoiceRef: '',
      shipToSameAsBilling: true,
      shippingAddress: '',
      shippingCity: '',
      shippingPin: '',
      shippingState: '',
    }
  );

  const [items, setItems] = useState<InvoiceItem[]>(
    draft?.items || []
  );

  const [allBillsForCredit, setAllBillsForCredit] = useState<any[]>([]);
  const [creditToApply, setCreditToApply] = useState<number>(0);
  const [units, setUnits] = useState<any[]>(getAllUnits());
  const [taxInclusive, setTaxInclusive] = useState<boolean>(draft?.taxInclusive || false);

  const [saving, setSaving] = useState<boolean>(false);
  const [termsTemplates, setTermsTemplates] = useState<any[]>([]);
  const [selectedTermsId, setSelectedTermsId] = useState<string>(draft?.selectedTermsId || '');
  const [customTerms, setCustomTerms] = useState<string>(draft?.customTerms || '');
  const [customNotes, setCustomNotes] = useState<string>(draft?.customNotes || '');
  const [internalNote, setInternalNote] = useState<string>(draft?.internalNote || '');
  const [extraSections, setExtraSections] = useState<any[]>(draft?.extraSections || []);
  const [savedClients, setSavedClients] = useState<any[]>([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState<boolean>(false);
  const [clientPickerIdx, setClientPickerIdx] = useState<number>(-1);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showClientModal, setShowClientModal] = useState<boolean>(false);
  const [modalClient, setModalClient] = useState<any>(null);
  const [isEditingClient, setIsEditingClient] = useState<boolean>(false);
  const clientNameRef = useRef<HTMLInputElement | null>(null);
  const clientSuggestionsRef = useRef<HTMLDivElement | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [modalProduct, setModalProduct] = useState<any>(null);
  const [isEditingProduct, setIsEditingProduct] = useState<boolean>(false);
  const [productSearch, setProductSearch] = useState<{ itemId: string | null; query: string }>({
    itemId: null,
    query: '',
  });

  const [invoiceOptions, setInvoiceOptions] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('freegstbill_invoiceOptions');
      const persisted = saved ? JSON.parse(saved) : {};
      delete persisted.paymentAccountSnapshot;
      return { ...DEFAULT_OPTIONS, ...persisted, ...(draft?.invoiceOptions || {}) };
    } catch {
      return draft?.invoiceOptions || { ...DEFAULT_OPTIONS };
    }
  });

  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [showPrintPreview, setShowPrintPreview] = useState<boolean>(false);

  const [previewNatural, setPreviewNatural] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const el = printRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const measure = () =>
      setPreviewNatural((prev) =>
        prev.w === el.offsetWidth && prev.h === el.offsetHeight ? prev : { w: el.offsetWidth, h: el.offsetHeight }
      );
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [previewCollapsed]);

  const draftInitialized = useRef<boolean>(!!draft);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('idle');
  const autoSaveTimer = useRef<any>(null);
  const isDirty = useRef<boolean>(false);
  const stockDeducted = useRef<boolean>(!!editingBill && !editingBill?._isDuplicate && !editingBill?._convertToType);
  const hasInitialized = useRef<boolean>(false);
  const numberReserved = useRef<boolean>(!!editingBill);
  const hasBeenSaved = useRef<boolean>(!!editingBill);

  const showGST = invoiceOptions.showGST;
  const sellerCountryConfig = getCountryConfig(profile?.country);

  const _psPrintForRates = getPrintSettings();
  const customRates = Array.isArray(_psPrintForRates.customTaxRates)
    ? _psPrintForRates.customTaxRates.map(Number).filter((n) => isFinite(n) && n >= 0 && n <= 100)
    : [];
  const baseCountryRates =
    sellerCountryConfig.taxRates && sellerCountryConfig.taxRates.length ? sellerCountryConfig.taxRates : [0, 5, 12, 18, 28];
  const countryTaxRates = useMemo(
    () => [...new Set([...baseCountryRates, ...customRates])].sort((a, b) => a - b),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseCountryRates.join(','), customRates.join(',')]
  );
  const taxLabel = sellerCountryConfig.taxLabel || 'GST';

  const clampNonNeg = useCallback((raw: any) => {
    const n = parseFloat(raw);
    if (!isFinite(n) || n < 0) return 0;
    return n;
  }, []);

  const optionsPersistTimer = useRef<any>(null);
  useEffect(() => {
    const { paymentAccountSnapshot: _snap, ...toPersist } = invoiceOptions;
    localStorage.setItem('freegstbill_invoiceOptions', JSON.stringify(toPersist));
    if (hasInitialized.current) {
      clearTimeout(optionsPersistTimer.current);
      optionsPersistTimer.current = setTimeout(() => {
        saveInvoiceDisplayOptions(toPersist).catch(() => {});
      }, 800);
    }
    return () => clearTimeout(optionsPersistTimer.current);
  }, [invoiceOptions]);

  useEffect(() => {
    getInvoiceDisplayOptions()
      .then((serverOpts) => {
        if (serverOpts) {
          delete serverOpts.paymentAccountSnapshot;
          const merged = { ...DEFAULT_OPTIONS, ...serverOpts };
          setInvoiceOptions((prev: any) => {
            const changed = Object.keys(merged).some((k) => merged[k] !== prev[k]);
            if (changed) {
              const nextOpts = { ...merged, paymentAccountSnapshot: prev.paymentAccountSnapshot };
              const { paymentAccountSnapshot: _skip, ...toPersist } = nextOpts;
              localStorage.setItem('freegstbill_invoiceOptions', JSON.stringify(toPersist));
              return nextOpts;
            }
            return prev;
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const draftData = {
        invoiceType,
        client,
        details,
        items,
        customTerms,
        customNotes,
        internalNote,
        extraSections,
        selectedTermsId,
        invoiceOptions,
        taxInclusive,
      };
      try {
        sessionStorage.setItem('gst_invoiceDraft', JSON.stringify(draftData));
      } catch {
        /* private mode / quota exceeded */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [
    invoiceType,
    client,
    details,
    items,
    customTerms,
    customNotes,
    internalNote,
    extraSections,
    selectedTermsId,
    invoiceOptions,
    taxInclusive,
  ]);

  useEffect(() => {
    const t = setTimeout(() => {
      hasInitialized.current = true;
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  const isMeaningfulInvoice = useCallback(() => {
    if (editingBill) return true;
    if (!client?.name?.trim()) return false;
    return items.some((item) => (item.name || '').trim() && (item.quantity || 0) * (item.rate || 0) > 0);
  }, [client?.name, items, editingBill]);

  const validateForSave = useCallback(() => {
    if (editingBill) return null;
    if (!client?.name?.trim()) {
      return 'Add a client name before saving.';
    }
    const hasRealItem = items.some((item) => (item.name || '').trim() && (item.quantity || 0) * (item.rate || 0) > 0);
    if (!hasRealItem) {
      return 'Add at least one item with a quantity and rate before saving.';
    }
    return null;
  }, [client?.name, items, editingBill]);

  useEffect(() => {
    if (!hasInitialized.current) return;
    isDirty.current = true;
    if (!details.invoiceNumber) return;
    if (!isMeaningfulInvoice()) {
      setAutoSaveStatus((s) => (s === 'saved' ? 'idle' : s));
      return;
    }

    if (!editingBill && !hasBeenSaved.current) {
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus((s) => (s === 'saved' ? 'idle' : s)), 2000);
      return;
    }

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      try {
        setAutoSaveStatus('saving');
        await saveInvoiceToDB(true);
        setAutoSaveStatus('saved');
        isDirty.current = false;
        setTimeout(() => setAutoSaveStatus((s) => (s === 'saved' ? 'idle' : s)), 2000);
      } catch (err) {
        console.error('Auto-save failed:', err);
        setAutoSaveStatus('idle');
      }
    }, 2000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [
    invoiceType,
    client,
    details,
    items,
    customTerms,
    customNotes,
    internalNote,
    extraSections,
    invoiceOptions,
    isMeaningfulInvoice,
  ]);

  const [leaveModal, setLeaveModal] = useState<boolean>(false);
  const handleBack = () => {
    if (isMeaningfulInvoice() && isDirty.current) {
      setLeaveModal(true);
      return;
    }
    clearDraft();
    onBack();
  };

  const leaveActions = {
    saveAndExit: async () => {
      try {
        setAutoSaveStatus('saving');
        await saveInvoiceToDB(true);
        toast('Invoice saved', 'success');
        clearDraft();
        setLeaveModal(false);
        onBack();
      } catch {
        toast('Save failed — staying on the page so you can retry', 'error');
      }
    },
    discardAndExit: () => {
      clearDraft();
      setLeaveModal(false);
      onBack();
    },
    cancel: () => setLeaveModal(false),
  };

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isMeaningfulInvoice() && isDirty.current) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isMeaningfulInvoice]);

  const clearDraft = () => {
    sessionStorage.removeItem('gst_invoiceDraft');
  };

  useEffect(() => {
    const refetchProfiles = () =>
      getAllProfiles()
        .then(setAllProfiles)
        .catch(() => {});
    const onVisible = () => {
      if (document.visibilityState === 'visible') refetchProfiles();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', refetchProfiles);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', refetchProfiles);
    };
  }, []);

  useEffect(() => {
    getAllProfiles()
      .then((p) => {
        setAllProfiles(p);
        if (!activeProfile && p.length > 0) setActiveProfile(profileProp);
      })
      .catch(() => {});
    getTermsTemplates().then((templates) => {
      setTermsTemplates(templates);
      if (templates.length > 0 && !selectedTermsId && !draftInitialized.current) {
        setSelectedTermsId(templates[0].id);
        setCustomTerms(templates[0].content);
      }
    });
    getAllClients().then((clients) => {
      setSavedClients(clients);
      if (client.name.trim()) {
        const match = clients.find((c) => c.name.toLowerCase() === client.name.trim().toLowerCase());
        if (match) setSelectedClientId(match.id);
      }
    });
    getAllProducts()
      .then((prods) => setProducts(Array.isArray(prods) ? prods : []))
      .catch((err) => {
        console.warn('Failed to load products catalog:', err);
        setProducts([]);
      });
    getAllBills()
      .then(setAllBillsForCredit)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (draftInitialized.current) {
      draftInitialized.current = false;
      return;
    }
    if (editingBill?._initialType) {
      const initType = editingBill._initialType as InvoiceType;
      setInvoiceType(initType);
      const config = INVOICE_TYPES[initType];
      if (config) {
        setInvoiceOptions((prev: any) => ({ ...prev, showGST: config.showGST, showPlaceOfSupply: config.showGST }));
      }
      const _psForPrefix = getPrintSettings();
      const rawOverride = _psForPrefix.customPrefixes?.[initType];
      const overridePrefix = rawOverride && rawOverride.trim();
      const prefix = overridePrefix || INVOICE_TYPES[initType]?.prefix || 'INV';
      getNextInvoiceNumber(prefix, { peek: true, explicitPrefix: !!overridePrefix }).then((num) => {
        setDetails((prev: any) => ({ ...prev, invoiceNumber: num, invoiceDate: new Date().toISOString().split('T')[0] }));
        numberReserved.current = false;
      });
    } else if (editingBill?.data) {
      const d = editingBill.data;
      if (d.client) setClient(d.client);
      if (d.items && Array.isArray(d.items)) {
        setItems(
          d.items.map((it: any, idx: number) =>
            it.id ? it : { ...it, id: `loaded_${Date.now()}_${idx}` }
          )
        );
      }
      setInvoiceType(d.invoiceType || 'tax-invoice');
      if (d.customTerms !== undefined) setCustomTerms(d.customTerms);
      if (d.customNotes !== undefined) setCustomNotes(d.customNotes);
      if (d.internalNote !== undefined) setInternalNote(d.internalNote);
      if (d.extraSections) setExtraSections(d.extraSections);
      if (d.taxInclusive !== undefined) setTaxInclusive(d.taxInclusive);
      if (d.invoiceOptions) {
        let mergedOpts: any = null;
        try {
          const saved = localStorage.getItem('freegstbill_invoiceOptions');
          const persisted = saved ? JSON.parse(saved) : {};
          delete persisted.paymentAccountSnapshot;
          mergedOpts = { ...DEFAULT_OPTIONS, ...persisted, ...d.invoiceOptions };
        } catch {
          mergedOpts = { ...DEFAULT_OPTIONS, ...d.invoiceOptions };
        }
        const billSnap = d.invoiceOptions.paymentAccountSnapshot;
        const billSelId = d.invoiceOptions.selectedAccountId;
        const snapshotIsStale = billSnap && billSelId && billSnap.id && billSnap.id !== billSelId;
        if ((!billSnap || snapshotIsStale) && d.profile) {
          const snap = getAccountById(d.profile, billSelId);
          if (snap) mergedOpts.paymentAccountSnapshot = snap;
        }
        setInvoiceOptions(mergedOpts);
      }

      if (editingBill._isDuplicate) {
        const convertType = editingBill._convertToType;
        const type = convertType || d.invoiceType || 'tax-invoice';
        if (convertType) {
          setInvoiceType(convertType);
          const config = INVOICE_TYPES[convertType];
          if (config) {
            setInvoiceOptions((prev: any) => ({ ...prev, showGST: config.showGST, showPlaceOfSupply: config.showGST }));
          }
        }
        const _psForPrefix = getPrintSettings();
        const rawOverride = _psForPrefix.customPrefixes?.[type];
        const overridePrefix = rawOverride && rawOverride.trim();
        const prefix = overridePrefix || INVOICE_TYPES[type]?.prefix || 'INV';
        getNextInvoiceNumber(prefix, { peek: true, explicitPrefix: !!overridePrefix }).then((num) => {
          setDetails({ ...d.details, invoiceNumber: num, invoiceDate: new Date().toISOString().split('T')[0] });
          numberReserved.current = false;
        });
      } else {
        setDetails(d.details);
      }
    } else if (!details.invoiceNumber) {
      const _psForPrefix = getPrintSettings();
      const rawOverride = _psForPrefix.customPrefixes?.[invoiceType];
      const overridePrefix = rawOverride && rawOverride.trim();
      const prefix = overridePrefix || INVOICE_TYPES[invoiceType]?.prefix || 'INV';
      getNextInvoiceNumber(prefix, { peek: true, explicitPrefix: !!overridePrefix }).then((num) => {
        setDetails((prev: any) => ({ ...prev, invoiceNumber: num }));
        numberReserved.current = false;
      });
    }
  }, [editingBill]);

  useEffect(() => {
    if (editingBill) return;
    if (invoiceOptions.selectedAccountId) return;
    if (!profile) return;
    const lastUsedKey = `gst_lastUsedAccountId_${profile.id || profile.businessName || 'default'}`;
    let candidate = null;
    try {
      candidate = localStorage.getItem(lastUsedKey);
    } catch {
      /* sandboxed */
    }
    const active = getActiveAccounts(profile);
    const defaultId = getDefaultAccount(profile)?.id || null;
    const candidateResolves = candidate && active.some((a: any) => a.id === candidate);
    const next = defaultId || (candidateResolves ? candidate : null) || active[0]?.id || null;
    if (next) setInvoiceOptions((prev: any) => ({ ...prev, selectedAccountId: next }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, profile?.businessName, editingBill]);

  useEffect(() => {
    if (!profile || !invoiceOptions.selectedAccountId) return;
    const lastUsedKey = `gst_lastUsedAccountId_${profile.id || profile.businessName || 'default'}`;
    try {
      localStorage.setItem(lastUsedKey, invoiceOptions.selectedAccountId);
    } catch {
      /* ignore */
    }
  }, [profile?.id, profile?.businessName, invoiceOptions.selectedAccountId]);

  useEffect(() => {
    if (!editingBill?.data?.profile || allProfiles.length === 0) return;
    const snap = editingBill.data.profile;
    const liveMatch = allProfiles.find(
      (p) =>
        (p.id && snap.id && p.id === snap.id) ||
        (p.businessName && p.businessName === snap.businessName)
    );
    if (liveMatch && liveMatch !== activeProfile) setActiveProfile(liveMatch);
  }, [editingBill, allProfiles, activeProfile]);

  const handleTypeChange = async (type: InvoiceType) => {
    setInvoiceType(type);
    const config = INVOICE_TYPES[type];
    const _psForPrefix = getPrintSettings();
    const rawOverride = _psForPrefix.customPrefixes?.[type];
    const overridePrefix = rawOverride && rawOverride.trim();
    const prefix = overridePrefix || config?.prefix || 'INV';
    const num = await getNextInvoiceNumber(prefix, { peek: true, explicitPrefix: !!overridePrefix });
    numberReserved.current = false;
    setDetails((prev: any) => ({ ...prev, invoiceNumber: num }));

    if (type === 'bill-of-supply') {
      setInvoiceOptions((prev: any) => ({ ...prev, showGST: false, showPlaceOfSupply: false }));
    } else {
      setInvoiceOptions((prev: any) => ({ ...prev, showGST: config.showGST, showPlaceOfSupply: config.showGST }));
    }
  };

  const toggleOption = (key: string) => {
    setInvoiceOptions((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const totals = useMemo(
    () =>
      computeInvoiceTotals({
        items,
        profile,
        client,
        details,
        showGST,
        taxInclusive,
        invoiceOptions,
      }),
    [
      items,
      client.state,
      client?.isSEZ,
      profile?.state,
      profile?.country,
      showGST,
      taxInclusive,
      invoiceOptions.showRoundOff,
      invoiceOptions.showTDS,
      invoiceOptions.tdsRate,
      invoiceOptions.tdsCumulativeThisYear,
      invoiceOptions.showTCS,
      invoiceOptions.tcsRate,
      invoiceOptions.tcsCumulativeThisYear,
      invoiceOptions.reverseCharge,
      invoiceOptions.invoiceDiscountValue,
      invoiceOptions.invoiceDiscountType,
      details?.placeOfSupply,
    ]
  );

  const clientCredit = useMemo(() => {
    if (!client?.name?.trim()) return { available: 0, sources: [] };
    const otherBills = editingBill ? allBillsForCredit.filter((b) => b.id !== editingBill.id) : allBillsForCredit;
    return getClientCredit(client.name, otherBills);
  }, [client?.name, allBillsForCredit, editingBill]);

  const lastAutoAppliedClient = useRef<string | null>(null);
  useEffect(() => {
    if (editingBill) return;
    if (!invoiceOptions.autoApplyClientCredit) {
      lastAutoAppliedClient.current = null;
      return;
    }
    const name = client?.name?.trim() || '';
    if (!name || lastAutoAppliedClient.current === name) return;
    lastAutoAppliedClient.current = name;
    const cap = Math.min(clientCredit.available, Number(totals.total) || 0);
    setCreditToApply(cap > 0.005 ? cap : 0);
  }, [client?.name, clientCredit.available, invoiceOptions.autoApplyClientCredit, editingBill]);

  useEffect(() => {
    const isIndia = (profile?.country || 'India') === 'India';
    if (!isIndia || !showGST) return;
    if (!profile?.state && client?.state) {
      const key = `gst_stateWarning_${profile?.businessName || 'profile'}`;
      if (!sessionStorage.getItem(key)) {
        toast('Set your business State in Settings — required for correct CGST/SGST vs IGST split.', 'warning');
        sessionStorage.setItem(key, '1');
      }
    }
  }, [profile?.state, profile?.country, profile?.businessName, client?.state, showGST]);

  const handleItemChange = useCallback((id: string, field: string, value: any) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    if (field === 'name') {
      setProductSearch({ itemId: id, query: value });
    }
  }, []);

  const selectProduct = useCallback(
    (itemId: string, product: any) => {
      const salePrice = product.sellingPrice ?? product.rate ?? 0;
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                name: product.name,
                hsn: product.hsn || '',
                rate: salePrice,
                unit: product.unit || item.unit || 'Nos',
                taxPercent: product.taxPercent ?? (countryTaxRates[countryTaxRates.length - 2] ?? 18),
                productId: product.id,
              }
            : item
        )
      );
      setProductSearch({ itemId: null, query: '' });
    },
    [countryTaxRates]
  );

  const getProductSuggestions = useCallback(
    (itemId: string) => {
      if (productSearch.itemId !== itemId || !productSearch.query.trim()) return [];
      const q = productSearch.query.toLowerCase();
      return products
        .filter((p) => p.name?.toLowerCase().includes(q) || p.hsn?.toLowerCase().includes(q))
        .slice(0, 5);
    },
    [productSearch.itemId, productSearch.query, products]
  );

  const addProductItem = useCallback(
    (product: any, qty: number = 1) => {
      if (!product && typeof product !== 'string') return;
      const parsedQty = typeof qty === 'number' ? (isNaN(qty) || qty <= 0 ? 1 : qty) : parseFloat(qty) || 1;

      setItems((prev) => {
        const defaultUnit =
          prev.length > 0 && prev[prev.length - 1].unit
            ? prev[prev.length - 1].unit
            : getDefaultUnitForMode(invoiceOptions.invoiceMode);

        const emptyIdx = prev.findIndex(
          (it) => !it.name?.trim() && !it.rate && !it.productId
        );

        let newItem: InvoiceItem;
        if (typeof product === 'object' && product !== null) {
          const salePrice = product.sellingPrice ?? product.rate ?? 0;
          newItem = {
            id: emptyIdx !== -1 ? prev[emptyIdx].id : Date.now().toString(),
            name: product.name || '',
            hsn: product.hsn || '',
            quantity: parsedQty,
            unit: product.unit || defaultUnit || 'Nos',
            rate: salePrice,
            discount: 0,
            discountType: 'percent',
            taxPercent: product.taxPercent ?? (showGST ? countryTaxRates[countryTaxRates.length - 2] ?? 18 : 0),
            cessPercent: product.cessPercent || 0,
            productId: product.id,
          };
        } else {
          const customName = String(product).trim();
          if (!customName) return prev;
          newItem = {
            id: emptyIdx !== -1 ? prev[emptyIdx].id : Date.now().toString(),
            name: customName,
            hsn: '',
            quantity: parsedQty,
            unit: defaultUnit || 'Nos',
            rate: 0,
            discount: 0,
            discountType: 'percent',
            taxPercent: showGST ? countryTaxRates[countryTaxRates.length - 2] ?? 18 : 0,
            cessPercent: 0,
          };
        }

        if (emptyIdx !== -1) {
          const copy = [...prev];
          copy[emptyIdx] = newItem;
          return copy;
        }

        return [...prev, newItem];
      });
      setProductSearch({ itemId: null, query: '' });
    },
    [invoiceOptions.invoiceMode, showGST, countryTaxRates]
  );

  const addItem = () => {
    const defaultUnit =
      items.length > 0 && items[items.length - 1].unit
        ? items[items.length - 1].unit
        : getDefaultUnitForMode(invoiceOptions.invoiceMode);
    const newId = Date.now().toString();
    setItems((prev) => [
      ...prev,
      {
        id: newId,
        name: '',
        hsn: '',
        quantity: 1,
        unit: defaultUnit,
        rate: 0,
        discount: 0,
        taxPercent: showGST ? countryTaxRates[countryTaxRates.length - 2] ?? 18 : 0,
        cessPercent: 0,
      },
    ]);
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-item-id="${newId}"] input.form-input`) as HTMLInputElement | null;
      if (el) el.focus();
    });
  };

  const handleAddCustomUnit = useCallback(
    async (itemId: string) => {
      const label = await promptAction({
        title: 'Add custom unit',
        message: 'Enter a short unit label. Saved for reuse across future invoices.',
        placeholder: 'e.g. Carat, Bundle, Bushel',
        confirmLabel: 'Add unit',
      });
      if (!label) return;
      const trimmed = label.trim();
      if (!trimmed) return;
      if (trimmed.length > 20) {
        toast('Unit name must be 20 characters or fewer', 'warning');
        return;
      }
      const ok = addCustomUnit(trimmed);
      setUnits(getAllUnits());
      if (!ok) {
        toast(`Unit "${trimmed}" already exists or is reserved`, 'info');
      } else {
        toast(`Unit "${trimmed}" added`, 'success');
      }
      handleItemChange(itemId, 'unit', trimmed);
    },
    [handleItemChange]
  );

  const handleRemoveCustomUnit = useCallback(async (label: string) => {
    if (
      !(await confirmAction({
        title: `Remove custom unit "${label}"?`,
        message: 'Existing invoices keep this label unchanged. It just no longer appears in the unit dropdowns.',
        confirmLabel: 'Remove unit',
        tone: 'danger',
      }))
    )
      return;
    removeCustomUnit(label);
    setUnits(getAllUnits());
    toast(`Removed custom unit "${label}"`, 'success');
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleTermsSelect = (templateId: string) => {
    setSelectedTermsId(templateId);
    const tpl = termsTemplates.find((t) => t.id === templateId);
    if (tpl) setCustomTerms(tpl.content);
  };

  const selectSavedClient = (cli: any) => {
    setClient({
      name: cli.name || '',
      address: cli.address || '',
      city: cli.city || '',
      pin: cli.pin || '',
      state: cli.state || '',
      gstin: cli.gstin || '',
      country: cli.country || '',
      email: cli.email || '',
      phone: cli.phone || '',
      isSEZ: !!cli.isSEZ,
    });
    setSelectedClientId(cli.id);
    setShowClientSuggestions(false);
    if (!editingBill) {
      setInvoiceOptions((prev: any) => ({
        ...prev,
        paperSize: cli.preferredPaperSize || prev.paperSize || 'a4',
        customPaperWidth: cli.preferredCustomPaperWidth || prev.customPaperWidth || 80,
        customPaperHeight: cli.preferredCustomPaperHeight || prev.customPaperHeight || 297,
        currency: cli.preferredCurrency || prev.currency || 'INR',
        clientAutoPrint: !!cli.autoPrint,
      }));
    }
    toast(`Loaded client: ${cli.name}`, 'info');
  };

  const openAddClientModal = () => {
    setModalClient({
      name: client.name || '',
      address: client.address || '',
      city: client.city || '',
      pin: client.pin || '',
      state: client.state || '',
      gstin: client.gstin || '',
    });
    setIsEditingClient(false);
    setShowClientModal(true);
    setShowClientSuggestions(false);
  };

  const openEditClientModal = (cli: any) => {
    setModalClient(cli);
    setIsEditingClient(true);
    setShowClientModal(true);
  };

  const handleClientModalSave = async (formData: any) => {
    const data = { ...formData };
    if (isEditingClient && modalClient?.id) data.id = modalClient.id;
    await saveClient(data);
    const updated = await getAllClients();
    setSavedClients(updated);
    setClient({
      name: data.name || '',
      address: data.address || '',
      city: data.city || '',
      pin: data.pin || '',
      state: data.state || '',
      gstin: data.gstin || '',
      country: data.country || '',
      email: data.email || '',
      phone: data.phone || '',
      isSEZ: !!data.isSEZ,
    });
    if (isEditingClient && modalClient?.id) {
      setSelectedClientId(modalClient.id);
      toast(`Client "${data.name}" updated!`, 'success');
    } else {
      const found = updated.find((c) => c.name === data.name.trim() && !savedClients.some((old) => old.id === c.id));
      if (found) setSelectedClientId(found.id);
      toast(`Client "${data.name}" saved!`, 'success');
    }
    setShowClientModal(false);
  };

  const openAddProductModal = (initialName?: string) => {
    setModalProduct({
      name: typeof initialName === 'string' ? initialName : '',
      type: 'product',
      category: '',
      hsn: '',
      purchasePrice: 0,
      sellingPrice: 0,
      rate: 0,
      taxPercent: 18,
      taxType: 'exclusive',
      unit: 'NOS',
      stock: 0,
      barcode: '',
      description: '',
    });
    setIsEditingProduct(false);
    setShowProductModal(true);
  };

  const openEditProductModal = (prod: any) => {
    setModalProduct(prod);
    setIsEditingProduct(true);
    setShowProductModal(true);
  };

  const handleProductModalSave = async (formData: any) => {
    try {
      const sellingPrice =
        parseFloat(formData.sellingPrice) || parseFloat(formData.rate) || 0;
      const purchasePrice = parseFloat(formData.purchasePrice) || 0;
      const taxPercent =
        formData.taxPercent !== undefined && formData.taxPercent !== ''
          ? parseFloat(formData.taxPercent)
          : 18;
      const stock = parseFloat(formData.stock) || 0;

      const productPayload: any = {
        name: formData.name?.trim() || 'New Item',
        type: formData.type || 'product',
        category: formData.category || '',
        hsn: formData.hsn || '',
        sellingPrice,
        purchasePrice,
        rate: sellingPrice,
        taxPercent,
        taxType: formData.taxType || 'exclusive',
        unit: formData.unit || 'NOS',
        stock,
        barcode: formData.barcode || '',
        description: formData.description || '',
      };

      if (isEditingProduct && modalProduct?.id) {
        productPayload.id = modalProduct.id;
      }

      const saved = await saveProduct(productPayload);
      const updatedProducts = await getAllProducts();
      setProducts(updatedProducts);

      const targetProduct = saved || productPayload;
      // Automatically add new item to the invoice table
      addProductItem(targetProduct, 1);

      setShowProductModal(false);
      toast(`Product "${targetProduct.name}" saved & added to bill!`, 'success');
    } catch (err) {
      console.error('Failed to save product:', err);
      toast('Failed to save product', 'error');
    }
  };

  const filteredClients = useMemo(() => {
    const q = (client?.name || '').trim().toLowerCase();
    if (!q) return savedClients;
    return savedClients.filter((cli) => {
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
    });
  }, [client?.name, savedClients]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const inputEl = (clientNameRef.current as any)?.input || clientNameRef.current;
      if (
        clientSuggestionsRef.current &&
        !clientSuggestionsRef.current.contains(e.target as Node) &&
        inputEl &&
        typeof inputEl.contains === 'function' &&
        !inputEl.contains(e.target as Node)
      ) {
        setShowClientSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveInvoiceToDB = async (skipStockDeduction = false, extraPatch: any = {}) => {
    let finalInvoiceNumber = details.invoiceNumber;
    if (!editingBill && !numberReserved.current) {
      try {
        const _psForPrefix = getPrintSettings();
        const rawOverride = _psForPrefix.customPrefixes?.[invoiceType];
        const overridePrefix = rawOverride && rawOverride.trim();
        const prefix = overridePrefix || INVOICE_TYPES[invoiceType]?.prefix || 'INV';
        finalInvoiceNumber = await getNextInvoiceNumber(prefix, { explicitPrefix: !!overridePrefix });
        setDetails((prev: any) => ({ ...prev, invoiceNumber: finalInvoiceNumber }));
        numberReserved.current = true;
      } catch {
        /* fall back to the peeked value */
      }
    }

    const priorSnapshot = invoiceOptions.paymentAccountSnapshot;
    const priorMatchesSelection = priorSnapshot && priorSnapshot.id === invoiceOptions.selectedAccountId;
    const snapAccount = priorMatchesSelection ? priorSnapshot : getAccountById(profile, invoiceOptions.selectedAccountId);
    const invoiceOptionsWithSnapshot = { ...invoiceOptions, paymentAccountSnapshot: snapAccount || null };

    const creditPlan =
      !editingBill && creditToApply > 0.005
        ? planCreditApplication(client.name, allBillsForCredit, creditToApply, finalInvoiceNumber)
        : null;

    const seedPayments = editingBill?.payments ? [...editingBill.payments] : [];
    if (editingBill?.id) {
      try {
        const serverBills = await getAllBills();
        const fresh = serverBills.find((b) => b.id === editingBill.id);
        const freshPayments = Array.isArray(fresh?.payments) ? fresh.payments : [];
        for (const fp of freshPayments) {
          const dup = seedPayments.some(
            (p) =>
              (fp.receiptNo && p.receiptNo === fp.receiptNo) ||
              (fp.id && p.id === fp.id) ||
              (Math.abs((Number(p.amount) || 0) - (Number(fp.amount) || 0)) < 0.005 &&
                p.date === fp.date &&
                (p.mode || '') === (fp.mode || ''))
          );
          if (!dup) seedPayments.push(fp);
        }
      } catch {
        /* non-fatal */
      }
    }
    if (creditPlan?.targetEntry) seedPayments.push(creditPlan.targetEntry);
    const seedPaidAmount = seedPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

    const billTotalForStatus = Number(totals.total) || 0;
    const computedStatus =
      seedPaidAmount >= billTotalForStatus - 0.005 && billTotalForStatus > 0
        ? 'paid'
        : seedPaidAmount > 0.005
        ? 'partial'
        : 'unpaid';
    const seedStatus = computedStatus === 'unpaid' && editingBill?.status === 'overdue' ? 'overdue' : computedStatus;

    const bill = {
      id: finalInvoiceNumber,
      clientName: client.name,
      invoiceNumber: finalInvoiceNumber,
      invoiceDate: details.invoiceDate,
      invoiceType,
      currency: invoiceOptions.currency || 'INR',
      totalAmount: totals.total,
      totalTaxAmount:
        totals.totalTaxAmount ??
        totals.cgst + totals.sgst + (totals.utgst || 0) + totals.igst + (totals.cess || 0),
      status: seedStatus,
      paidAmount: seedPaidAmount,
      payments: seedPayments,
      printedCount: extraPatch.printedCount ?? editingBill?.printedCount ?? 0,
      lastPrintedAt: extraPatch.lastPrintedAt ?? editingBill?.lastPrintedAt ?? null,
      data: {
        profile,
        client,
        details: { ...details, invoiceNumber: finalInvoiceNumber },
        items,
        totals,
        invoiceType,
        customTerms,
        customNotes,
        internalNote,
        extraSections,
        invoiceOptions: invoiceOptionsWithSnapshot,
        taxInclusive,
      },
    };

    const shouldOverwrite = !!editingBill || hasBeenSaved.current;
    try {
      await saveBill(bill, { overwrite: shouldOverwrite });
      if (creditPlan?.sourcePatches?.length) {
        try {
          for (const { updatedBill } of creditPlan.sourcePatches) {
            await saveBill(updatedBill, { overwrite: true });
          }
          const applied = creditPlan.amountApplied;
          const from = creditPlan.consumedFrom.map((c: any) => c.invoiceNumber).join(', ');
          toast(`${formatCurrency(applied, invoiceOptions.currency || 'INR')} credit applied from ${from}`, 'success');
          getAllBills()
            .then(setAllBillsForCredit)
            .catch(() => {});
          setCreditToApply(0);
        } catch (creditErr) {
          console.error('Source-bill credit patch failed:', creditErr);
          toast('Credit applied on this bill, but source bill update failed. Please review Client ledger.', 'warning');
        }
      }

      if (selectedClientId) {
        const cli = savedClients.find((c) => c.id === selectedClientId);
        if (cli) {
          const nextPaperSize = invoiceOptions.paperSize || 'a4';
          const nextCurrency = invoiceOptions.currency || 'INR';
          const nextCustomW = invoiceOptions.customPaperWidth || 80;
          const nextCustomH = invoiceOptions.customPaperHeight || 297;
          const changed =
            cli.preferredPaperSize !== nextPaperSize ||
            cli.preferredCurrency !== nextCurrency ||
            cli.preferredCustomPaperWidth !== nextCustomW ||
            cli.preferredCustomPaperHeight !== nextCustomH;
          if (changed) {
            const updatedClient = {
              ...cli,
              preferredPaperSize: nextPaperSize,
              preferredCurrency: nextCurrency,
              preferredCustomPaperWidth: nextCustomW,
              preferredCustomPaperHeight: nextCustomH,
            };
            saveClient(updatedClient)
              .then(() => {
                setSavedClients((prev) => prev.map((c) => (c.id === cli.id ? updatedClient : c)));
              })
              .catch(() => {});
          }
        }
      }
      hasBeenSaved.current = true;
      isDirty.current = false;
    } catch (err: any) {
      if (err?.status === 409) {
        if (!editingBill && !shouldOverwrite) {
          const _psForPrefix = getPrintSettings();
          const rawOverride = _psForPrefix.customPrefixes?.[invoiceType];
          const overridePrefix = rawOverride && rawOverride.trim();
          const prefix = overridePrefix || INVOICE_TYPES[invoiceType]?.prefix || 'INV';
          let nextNum = bill.id;
          let success = false;
          for (let i = 0; i < 20; i++) {
            try {
              nextNum = await getNextInvoiceNumber(prefix, { explicitPrefix: !!overridePrefix });
              const retryBill: any = { ...bill, id: nextNum, invoiceNumber: nextNum };
              retryBill.data = { ...retryBill.data, details: { ...retryBill.data.details, invoiceNumber: nextNum } };
              await saveBill(retryBill, { overwrite: false });
              success = true;
              setDetails((prev: any) => ({ ...prev, invoiceNumber: nextNum }));
              hasBeenSaved.current = true;
              isDirty.current = false;
              if (nextNum !== bill.id) {
                toast(`Invoice number ${bill.id} was already used — saved as ${nextNum} instead.`, 'info');
              }
              break;
            } catch (retryErr: any) {
              if (retryErr?.status !== 409) throw retryErr;
            }
          }
          if (!success) {
            toast(`Could not find a free invoice number after 20 attempts. Please change the number manually.`, 'error');
            return;
          }
        } else {
          toast(`Invoice number ${bill.id} already exists. Change it before saving.`, 'error');
          return;
        }
      } else {
        throw err;
      }
    }

    if (invoiceOptions.recurring?.enabled) {
      try {
        const rec = invoiceOptions.recurring;
        const templateId = `tpl_${details.invoiceNumber}`;
        await saveRecurring({
          id: templateId,
          sourceInvoiceId: details.invoiceNumber,
          active: true,
          frequency: rec.frequency || 'monthly',
          interval: rec.interval || 1,
          nextDate: rec.nextDate,
          endMode: rec.endMode || 'never',
          endDate: rec.endDate || '',
          maxOccurrences: rec.maxOccurrences || null,
          occurrencesCreated: 0,
          createdAt: new Date().toISOString(),
          lastGenerated: null,
          clientName: client.name,
          clientState: client.state,
          clientGstin: client.gstin,
          clientAddress: client.address,
          clientCountry: client.country,
          clientCity: client.city,
          clientPin: client.pin,
          clientEmail: client.email,
          clientPhone: client.phone,
          isSEZ: client.isSEZ,
          invoiceType,
          profileId: profile?.id || null,
          profileBusinessName: profile?.businessName || null,
          items: items.map((i) => ({ ...i })),
          customTerms,
          customNotes,
          extraSections,
          taxInclusive,
          invoiceOptions: { ...invoiceOptions, recurring: null },
        });
      } catch (err) {
        console.error('Failed to save recurring template:', err);
        toast('Invoice saved, but recurring template failed to save', 'warning');
      }
    }

    if (!skipStockDeduction && !stockDeducted.current) {
      stockDeducted.current = true;
      const currentProducts = await getAllProducts();
      const lowStockWarnings: string[] = [];

      for (const item of items) {
        if (!item.productId) continue;
        const product = currentProducts.find((p) => p.id === item.productId);
        if (!product) continue;

        const updatedStock = (product.stock || 0) - (item.quantity || 0);
        await saveProduct({ ...product, stock: updatedStock });

        if (updatedStock <= 0) {
          lowStockWarnings.push(`${product.name} is now out of stock!`);
        } else if (updatedStock <= 5) {
          lowStockWarnings.push(`${product.name} has only ${updatedStock} left in stock`);
        }
      }

      const refreshed = await getAllProducts();
      setProducts(refreshed);

      for (const warning of lowStockWarnings) {
        toast(warning, 'warning');
      }
    }
  };

  const uploadToGoogleDrive = async (pdfBlob: Blob, fileName: string) => {
    try {
      const latestProfile = await getProfile();
      const clientId = latestProfile.googleClientId;
      const folderName = latestProfile.googleDriveFolder || 'GST Billing Invoices';
      if (!clientId) return;

      const hasToken = await ensureToken(clientId);
      if (!hasToken) {
        toast('Google Drive: Please reconnect in Settings', 'warning');
        return;
      }

      const folderId = await findOrCreateFolder(folderName);
      await uploadPDF(fileName, pdfBlob, folderId);
      toast(`Saved to Google Drive → ${folderName}`, 'success');
    } catch (err: any) {
      console.error('Google Drive upload error:', err);
      toast('Google Drive upload failed: ' + err.message, 'warning');
    }
  };

  const buildPDF = async () => {
    if (!printRef.current) throw new Error('Preview element not mounted');
    const printSettings = getPrintSettings();
    const scalerEl = printRef.current.closest('.preview-scaler') as HTMLElement | null;
    if (scalerEl) scalerEl.style.transform = 'none';
    try {
      return await buildInvoicePDF(printRef.current, {
        printSettings,
        invoiceOptions,
        editingBill,
        details,
        profile,
      });
    } finally {
      if (scalerEl) scalerEl.style.transform = '';
    }
  };

  return {
    // States
    editingBill,
    allProfiles,
    activeProfile,
    setActiveProfile,
    profile,
    invoiceType,
    setInvoiceType,
    handleTypeChange,
    client,
    setClient,
    details,
    setDetails,
    items,
    setItems,
    allBillsForCredit,
    creditToApply,
    setCreditToApply,
    units,
    setUnits,
    taxInclusive,
    setTaxInclusive,
    saving,
    setSaving,
    termsTemplates,
    setTermsTemplates,
    selectedTermsId,
    setSelectedTermsId,
    customTerms,
    setCustomTerms,
    customNotes,
    setCustomNotes,
    internalNote,
    setInternalNote,
    extraSections,
    setExtraSections,
    savedClients,
    setSavedClients,
    showClientSuggestions,
    setShowClientSuggestions,
    clientPickerIdx,
    setClientPickerIdx,
    selectedClientId,
    setSelectedClientId,
    showClientModal,
    setShowClientModal,
    modalClient,
    setModalClient,
    isEditingClient,
    setIsEditingClient,
    showProductModal,
    setShowProductModal,
    modalProduct,
    setModalProduct,
    isEditingProduct,
    setIsEditingProduct,
    openAddProductModal,
    openEditProductModal,
    handleProductModalSave,
    products,
    productSearch,
    setProductSearch,
    invoiceOptions,
    setInvoiceOptions,
    toggleOption,
    showOptions,
    setShowOptions,
    showPrintPreview,
    setShowPrintPreview,
    previewZoom,
    setPreviewZoom,
    previewCollapsed,
    setPreviewCollapsed,
    previewNatural,
    autoSaveStatus,
    leaveModal,
    setLeaveModal,

    // Computed / Memoized
    totals,
    clientCredit,
    filteredClients,
    getProductSuggestions,
    countryTaxRates,
    taxLabel,

    // Functions
    handleFitToWidth,
    validateForSave,
    saveInvoiceToDB,
    handleBack,
    leaveActions,
    addProductItem,
    addItem,
    removeItem,
    handleItemChange,
    selectProduct,
    handleAddCustomUnit,
    handleRemoveCustomUnit,
    handleTermsSelect,
    selectSavedClient,
    openAddClientModal,
    openEditClientModal,
    handleClientModalSave,
    uploadToGoogleDrive,
    buildPDF,
    clampNonNeg,
    isMeaningfulInvoice,

    // Refs
    previewPaneRef,
    printRef,
    clientNameRef,
    clientSuggestionsRef,
  };
}
