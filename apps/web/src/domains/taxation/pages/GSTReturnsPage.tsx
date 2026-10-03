import React, { useState, useEffect, useMemo } from 'react';
import { Select, StatCard, SegmentedTabs } from '@/shared/components/ui';
import { PageHeader } from '@/shared/components/layout';
import { AlertBanner } from '@/shared/components/feedback';
import {
  FileText,
  ExternalLink,
  Receipt,
  Scale,
  Percent,
  IndianRupee,
} from 'lucide-react';
import { getAllBills, getAllExpenses, getAllPurchases, getProfile } from '@/store';
import {
  formatCurrency,
  getStateCode,
  getFYOptions,
  belongsToProfile,
} from '@/shared/utils';
import { INVOICE_TYPES } from '@/features/invoices/constants';
import { toast } from '@/shared/components/feedback/Toast';
import HelpButton from '@/shared/components/feedback/HelpButton';
import { GSTR1Tab } from '@/features/gst-returns/components/GSTR1Tab';
import { GSTR3BTab } from '@/features/gst-returns/components/GSTR3BTab';
import { GSTR2BTab } from '@/features/gst-returns/components/GSTR2BTab';
import { TdsTcsTab } from '@/features/gst-returns/components/TdsTcsTab';
import { FilingGuideTab } from '@/features/gst-returns/components/FilingGuideTab';
import {
  exportB2BCSV,
  exportB2CCSV,
  exportHSNCSV,
  exportCDNRCSV,
  exportDocSummaryCSV,
  exportGSTR3BCSV,
  exportGSTR1JSON,
  exportGSTR3BJSON,
  exportReconCSV,
} from '@/features/gst-returns/services/gstExportService';
import {
  GST_TYPES,
  MONTHS,
  QUARTERS,
  billIsInterstate,
  billIsIntraUT,
  computeItemTaxSplit,
  getTaxableAmount,
} from '@/features/gst-returns/utils/gstCalculations';
import type { B2BRow, HSNRow, DocSummaryItem, GrandTotals, ReconRow } from '@/features/gst-returns/types';

export const GSTReturnsPage: React.FC = () => {
  const [bills, setBills] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>({});
  const [filterMode, setFilterMode] = useState<string>('month'); // 'month' | 'quarter' | 'fy'
  const [fyFilter, setFyFilter] = useState<string>('');
  const [quarterFilter, setQuarterFilter] = useState<string>('Q1');
  const [monthFilter, setMonthFilter] = useState<string>('0');
  const [yearFilter, setYearFilter] = useState<string>('2026');
  const [activeTab, setActiveTab] = useState<'gstr1' | 'gstr3b' | 'gstr2b' | 'tds' | 'guide'>('gstr1');
  const [gstr2bData, setGstr2bData] = useState<any>(null);
  const [filingStatus, setFilingStatus] = useState<Record<string, any>>(() => {
    try {
      return JSON.parse(localStorage.getItem('gst_filing_status') || '{}');
    } catch {
      return {};
    }
  });

  const fyOptions = getFYOptions();
  const currentYear = new Date().getFullYear();
  const yearOptions: number[] = [];
  for (let y = currentYear; y >= currentYear - 5; y--) yearOptions.push(y);

  const loadData = async () => {
    try {
      const [b, e, p] = await Promise.all([getAllBills(), getAllExpenses(), getProfile().catch(() => ({}))]);
      setBills((b || []).filter((bill: any) => belongsToProfile(bill, p)));
      setExpenses(e || []);
      setProfile(p || {});
      try {
        const pur = await getAllPurchases();
        setPurchases(pur || []);
      } catch {
        /* ignore older servers without purchases endpoint */
      }
    } catch {
      toast('Failed to load data', 'error');
    }
  };

  useEffect(() => {
    const now = new Date();
    const fy = fyOptions[0];
    if (fy) setFyFilter(fy.value);
    setYearFilter(String(now.getFullYear()));
    setMonthFilter(String(now.getMonth()));
    const m = now.getMonth();
    const q = QUARTERS.find(qu => qu.months.includes(m));
    if (q) setQuarterFilter(q.id);
    loadData();
  }, []);

  const filterByPeriod = (date: string) => {
    if (!date) return false;
    if (filterMode === 'fy') {
      const fy = fyOptions.find(f => f.value === fyFilter);
      return fy ? date >= fy.from && date <= fy.to : true;
    } else if (filterMode === 'quarter') {
      const d = new Date(date);
      const q = QUARTERS.find(qu => qu.id === quarterFilter);
      if (!q) return false;
      const yr = parseInt(yearFilter);
      return q.months.includes(d.getMonth()) && d.getFullYear() === yr;
    } else {
      const d = new Date(date);
      return d.getFullYear() === parseInt(yearFilter) && d.getMonth() === parseInt(monthFilter);
    }
  };

  const filteredBills = useMemo(
    () =>
      bills.filter(bill => {
        const type = bill.invoiceType || 'tax-invoice';
        if (!GST_TYPES.includes(type)) return false;
        if (!bill.data) return false;
        return filterByPeriod(bill.invoiceDate);
      }),
    [bills, filterMode, fyFilter, quarterFilter, monthFilter, yearFilter]
  );

  const allFilteredBills = useMemo(
    () => bills.filter(bill => bill.data && filterByPeriod(bill.invoiceDate)),
    [bills, filterMode, fyFilter, quarterFilter, monthFilter, yearFilter]
  );

  const filteredExpenses = useMemo(
    () => expenses.filter(exp => filterByPeriod(exp.date)),
    [expenses, filterMode, fyFilter, quarterFilter, monthFilter, yearFilter]
  );

  // Classification
  const creditNotes = filteredBills.filter(b => (b.invoiceType || 'tax-invoice') === 'credit-note');
  const regularBills = filteredBills.filter(b => (b.invoiceType || 'tax-invoice') !== 'credit-note');
  const b2bRegular = regularBills.filter(b => b.data?.client?.gstin);
  const b2cRegular = regularBills.filter(b => !b.data?.client?.gstin);

  // B2B Rows
  const b2bRows: B2BRow[] = b2bRegular.map(bill => {
    const { client, totals, details } = bill.data;
    const isInterState = billIsInterstate(bill);
    const pos = getStateCode(details?.placeOfSupply || client?.state || '');
    const sgstBucket = isInterState ? 0 : (totals?.sgst || 0) + (totals?.utgst || 0);
    return {
      gstin: client.gstin,
      clientName: client.name || bill.clientName || '',
      invoiceNo: bill.invoiceNumber || '',
      date: bill.invoiceDate || '',
      pos,
      supplyType: isInterState ? 'Inter' : 'Intra',
      taxable: getTaxableAmount(totals),
      cgst: isInterState ? 0 : totals?.cgst || 0,
      sgst: sgstBucket,
      igst: isInterState ? totals?.igst || 0 : 0,
      cess: totals?.cess || 0,
      total: totals?.total || 0,
    };
  });

  // B2C by Rate
  const b2cByRate: Record<string, any> = {};
  const b2cBills = filteredBills.filter(b => !b.data?.client?.gstin);
  b2cBills.forEach(bill => {
    const { items } = bill.data;
    const isInterState = billIsInterstate(bill);
    const isIntraUT_ = billIsIntraUT(bill);
    (items || []).forEach((item: any) => {
      const rate = item.taxPercent || 0;
      if (!b2cByRate[rate]) b2cByRate[rate] = { taxable: 0, cgst: 0, sgst: 0, igst: 0, cess: 0, total: 0 };
      const split = computeItemTaxSplit(item, isInterState, !!bill.data?.taxInclusive, isIntraUT_);
      b2cByRate[rate].taxable += split.taxable;
      b2cByRate[rate].cgst += split.cgst;
      b2cByRate[rate].sgst += split.sgst + split.utgst;
      b2cByRate[rate].igst += split.igst;
      b2cByRate[rate].cess += split.cess;
      b2cByRate[rate].total += split.taxable + split.cgst + split.sgst + split.utgst + split.igst + split.cess;
    });
  });
  const b2cRates: [string, any][] = Object.keys(b2cByRate)
    .map(Number)
    .sort((a, b) => a - b)
    .map(rt => [String(rt), b2cByRate[rt]]);

  // HSN Summary
  const hsnMap: Record<string, HSNRow> = {};
  filteredBills.forEach(bill => {
    const { items } = bill.data;
    const isInterState = billIsInterstate(bill);
    const isIntraUT_ = billIsIntraUT(bill);
    (items || []).forEach((item: any) => {
      const hsn = item.hsn || 'N/A';
      const rate = item.taxPercent || 0;
      const uqc = item.unit || 'OTH';
      const key = `${hsn}|${rate}|${uqc}`;
      if (!hsnMap[key]) {
        hsnMap[key] = {
          hsn,
          rate,
          uqc,
          description: item.name || '',
          quantity: 0,
          taxable: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          cess: 0,
          totalTax: 0,
        };
      }
      const split = computeItemTaxSplit(item, isInterState, !!bill.data?.taxInclusive, isIntraUT_);
      hsnMap[key].quantity += item.quantity || 0;
      hsnMap[key].taxable += split.taxable;
      hsnMap[key].cgst += split.cgst;
      hsnMap[key].sgst += split.sgst + split.utgst;
      hsnMap[key].igst += split.igst;
      hsnMap[key].cess += split.cess;
      hsnMap[key].totalTax += split.cgst + split.sgst + split.utgst + split.igst + split.cess;
    });
  });
  const hsnRows = Object.values(hsnMap).sort((a, b) => (a.hsn || '').localeCompare(b.hsn || ''));

  // Totals
  const sumRows = (rows: any[]) =>
    rows.reduce(
      (acc, r) => ({
        taxable: acc.taxable + r.taxable,
        cgst: acc.cgst + r.cgst,
        sgst: acc.sgst + r.sgst,
        igst: acc.igst + r.igst,
        cess: acc.cess + (r.cess || 0),
        total: acc.total + r.total,
      }),
      { taxable: 0, cgst: 0, sgst: 0, igst: 0, cess: 0, total: 0 }
    );
  const b2bTotals = sumRows(b2bRows);
  const b2cTotals = b2cRates.reduce(
    (acc, [, d]) => ({
      taxable: acc.taxable + d.taxable,
      cgst: acc.cgst + d.cgst,
      sgst: acc.sgst + d.sgst,
      igst: acc.igst + d.igst,
      cess: acc.cess + (d.cess || 0),
      total: acc.total + d.total,
    }),
    { taxable: 0, cgst: 0, sgst: 0, igst: 0, cess: 0, total: 0 }
  );

  const cnTotals = (creditNotes || []).reduce(
    (acc, b) => {
      const t = b.data?.totals || {};
      const isInter = billIsInterstate(b);
      return {
        taxable: acc.taxable + (getTaxableAmount(t) || 0),
        cgst: acc.cgst + (isInter ? 0 : t.cgst || 0),
        sgst: acc.sgst + (isInter ? 0 : (t.sgst || 0) + (t.utgst || 0)),
        igst: acc.igst + (isInter ? t.igst || 0 : 0),
        cess: acc.cess + (t.cess || 0),
        total: acc.total + (t.total || 0),
      };
    },
    { taxable: 0, cgst: 0, sgst: 0, igst: 0, cess: 0, total: 0 }
  );

  const grandTotals: GrandTotals = {
    taxable: Math.max(0, b2bTotals.taxable + b2cTotals.taxable - cnTotals.taxable),
    cgst: Math.max(0, b2bTotals.cgst + b2cTotals.cgst - cnTotals.cgst),
    sgst: Math.max(0, b2bTotals.sgst + b2cTotals.sgst - cnTotals.sgst),
    igst: Math.max(0, b2bTotals.igst + b2cTotals.igst - cnTotals.igst),
    cess: Math.max(0, b2bTotals.cess + b2cTotals.cess - cnTotals.cess),
    total: b2bTotals.total + b2cTotals.total - cnTotals.total,
    cnTotals,
  };

  const outputTax = { cgst: grandTotals.cgst, sgst: grandTotals.sgst, igst: grandTotals.igst };

  const itcFromExpensesOnly = filteredExpenses.reduce(
    (acc, e) => {
      const gst = e.gstAmount || 0;
      if (e.interstate) {
        return { cgst: acc.cgst, sgst: acc.sgst, igst: acc.igst + gst };
      }
      const half = Math.round((gst / 2) * 100) / 100;
      return { cgst: acc.cgst + half, sgst: acc.sgst + (gst - half), igst: acc.igst };
    },
    { cgst: 0, sgst: 0, igst: 0 }
  );

  const filteredPurchases = purchases.filter(p => filterByPeriod(p.date));
  const itcFromPurchases = filteredPurchases.reduce(
    (acc, p) => {
      const tax =
        p.totalTax ||
        (p.items || []).reduce(
          (s: number, i: any) => s + ((i.quantity || 0) * (i.rate || 0) * (i.taxPercent || 0)) / 100,
          0
        );
      if (p.interstate) {
        return { cgst: acc.cgst, sgst: acc.sgst, igst: acc.igst + tax };
      }
      const half = Math.round((tax / 2) * 100) / 100;
      return { cgst: acc.cgst + half, sgst: acc.sgst + (tax - half), igst: acc.igst };
    },
    { cgst: 0, sgst: 0, igst: 0 }
  );

  const itcFromExpenses = {
    cgst: itcFromExpensesOnly.cgst + itcFromPurchases.cgst,
    sgst: itcFromExpensesOnly.sgst + itcFromPurchases.sgst,
    igst: itcFromExpensesOnly.igst + itcFromPurchases.igst,
  };

  const netTax = {
    cgst: Math.max(0, outputTax.cgst - itcFromExpenses.cgst),
    sgst: Math.max(0, outputTax.sgst - itcFromExpenses.sgst),
    igst: Math.max(0, outputTax.igst - itcFromExpenses.igst),
  };

  // Document Summary
  const docSummary: Record<string, DocSummaryItem> = {};
  allFilteredBills.forEach(bill => {
    const type = bill.invoiceType || 'tax-invoice';
    const prefix = INVOICE_TYPES[type]?.prefix || 'INV';
    if (!docSummary[prefix]) {
      docSummary[prefix] = {
        type: INVOICE_TYPES[type]?.label || type,
        from: bill.invoiceNumber,
        to: bill.invoiceNumber,
        total: 0,
      };
    }
    docSummary[prefix].total++;
    if (bill.invoiceNumber < docSummary[prefix].from) docSummary[prefix].from = bill.invoiceNumber;
    if (bill.invoiceNumber > docSummary[prefix].to) docSummary[prefix].to = bill.invoiceNumber;
  });

  // Validation Warnings
  const warnings: { type: 'error' | 'warning'; msg: string }[] = [];
  filteredBills.forEach(bill => {
    const { client, items } = bill.data;
    if (client?.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z][A-Z\d]$/.test(client.gstin)) {
      warnings.push({ type: 'error', msg: `Invoice ${bill.invoiceNumber}: Invalid client GSTIN format — ${client.gstin}` });
    }
    (items || []).forEach((item: any) => {
      if (!item.hsn || item.hsn === 'N/A') {
        warnings.push({ type: 'warning', msg: `Invoice ${bill.invoiceNumber}: Item "${item.name || 'Unnamed'}" has no HSN/SAC code` });
      }
    });
    if (client?.gstin && !client?.state) {
      warnings.push({ type: 'warning', msg: `Invoice ${bill.invoiceNumber}: Client ${client.name} has GSTIN but no State — Place of Supply may be wrong` });
    }
  });
  if (!profile.gstin) {
    warnings.push({ type: 'error', msg: 'Your business GSTIN is not set. Go to Settings → Company Details to add it.' });
  }

  // Filing Period Key & Status
  const getPeriodKey = () => {
    if (filterMode === 'month') return `${monthFilter}_${yearFilter}`;
    if (filterMode === 'quarter') return `${quarterFilter}_${yearFilter}`;
    return fyFilter;
  };
  const periodKey = getPeriodKey();
  const periodFiling = filingStatus[periodKey] || {};

  const toggleFiled = (returnType: 'gstr1' | 'gstr3b') => {
    const next = !periodFiling[returnType];
    const updated = {
      ...filingStatus,
      [periodKey]: {
        ...periodFiling,
        [returnType]: next,
        [`${returnType}Date`]: next ? new Date().toISOString() : null,
      },
    };
    setFilingStatus(updated);
    try {
      localStorage.setItem('gst_filing_status', JSON.stringify(updated));
    } catch {
      /* localStorage full */
    }
    toast(`${returnType.toUpperCase()} marked as ${next ? 'filed' : 'pending'} for this period`, 'success');
  };

  const markFiled = (returnType: 'gstr1' | 'gstr3b') => {
    const updated = {
      ...filingStatus,
      [periodKey]: {
        ...periodFiling,
        [returnType]: true,
        [`${returnType}Date`]: new Date().toISOString(),
      },
    };
    setFilingStatus(updated);
    try {
      localStorage.setItem('gst_filing_status', JSON.stringify(updated));
    } catch {}
    toast(`${returnType.toUpperCase()} marked as filed for this period`, 'success');
  };

  // B2C Large vs Small
  const b2cLarge = b2cRegular.filter(bill => {
    const isInter = billIsInterstate(bill);
    return isInter && (bill.data?.totals?.total || 0) > 250000;
  });
  const b2cSmall = b2cRegular.filter(bill => {
    const isInter = billIsInterstate(bill);
    return !isInter || (bill.data?.totals?.total || 0) <= 250000;
  });

  const totalTax = grandTotals.cgst + grandTotals.sgst + grandTotals.igst;
  const netPayable = netTax.igst + netTax.cgst + netTax.sgst;
  const isNilReturn = filteredBills.length === 0 && filteredExpenses.length === 0;

  const handleImport2B = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const root = json?.data || json;
      if (!root?.docdata && !root?.b2b) {
        toast("That doesn't look like a GSTR-2B JSON. Expected docdata.b2b array.", 'error');
        return;
      }
      setGstr2bData(root);
      const supplierCount = (root.docdata?.b2b || root.b2b || []).length;
      toast(`Imported GSTR-2B for ${root.gstin || '?'} — ${supplierCount} suppliers`, 'success');
    } catch (err) {
      console.error(err);
      toast('Failed to parse GSTR-2B JSON', 'error');
    }
    e.target.value = '';
  };

  const returnTabs = [
    { key: 'gstr1', label: 'GSTR-1' },
    { key: 'gstr3b', label: 'GSTR-3B' },
    { key: 'gstr2b', label: 'GSTR-2B Reconciliation' },
    { key: 'tds', label: 'TDS / TCS Report' },
    { key: 'guide', label: 'Filing Guide' },
  ];

  return (
    <div className="dashboard-container max-w-7xl mx-auto px-2 sm:px-4 py-3 space-y-5">
      <PageHeader
        breadcrumbs={[
          { label: 'Tax & Compliance' },
          { label: 'GST Returns (GSTR-1, 3B, 2B)' },
        ]}
        icon={<Receipt size={20} />}
        title={
          <div className="flex items-center gap-2">
            <span>GST Returns & Compliance</span>
            <HelpButton title="GST Returns — how to use">
              <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
                <li><strong>Pick a period</strong> — Monthly / Quarterly (QRMP) / Full Year, then the specific month + year.</li>
                <li><strong>R1 Filed / 3B Pending pills</strong> — click to toggle Filed ↔ Pending in case of misclick.</li>
                <li><strong>GSTR-1</strong> tab shows B2B / B2C / HSN Summary / Docs Issued as the portal expects. "Download JSON" gives you the file to upload at gst.gov.in.</li>
                <li><strong>GSTR-3B</strong> auto-populates from your GSTR-1. Cross-check with the Notes column before filing.</li>
                <li><strong>GSTR-2B</strong> — upload the JSON you download from the portal; app matches ITC against your Purchase Bills.</li>
                <li><strong>Mark Filed</strong> — after filing on the portal, click Mark Filed to keep the app's status in sync.</li>
              </ul>
            </HelpButton>
          </div>
        }
        subtitle="Prepare, reconcile, and export statutory GSTR-1, GSTR-3B, GSTR-2B, and TDS/TCS statements"
      >
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Select
            value={filterMode}
            onChange={e => setFilterMode(e.target.value)}
            options={[
              { value: 'month', label: 'Monthly' },
              { value: 'quarter', label: 'Quarterly (QRMP)' },
              { value: 'fy', label: 'Full Year' },
            ]}
            selectSize="md"
            containerClassName="w-36 shrink-0"
          />
          {filterMode === 'fy' ? (
            <Select
              value={fyFilter}
              onChange={e => setFyFilter(e.target.value)}
              options={fyOptions.map(fy => ({ value: fy.value, label: fy.label }))}
              selectSize="md"
              containerClassName="w-36 shrink-0"
            />
          ) : filterMode === 'quarter' ? (
            <>
              <Select
                value={quarterFilter}
                onChange={e => setQuarterFilter(e.target.value)}
                options={QUARTERS.map(q => ({ value: q.id, label: q.label }))}
                selectSize="md"
                containerClassName="w-32 shrink-0"
              />
              <Select
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
                options={yearOptions.map(y => ({ value: String(y), label: String(y) }))}
                selectSize="md"
                containerClassName="w-24 shrink-0"
              />
            </>
          ) : (
            <>
              <Select
                value={monthFilter}
                onChange={e => setMonthFilter(e.target.value)}
                options={MONTHS.map((m, i) => ({ value: String(i), label: m }))}
                selectSize="md"
                containerClassName="w-32 shrink-0"
              />
              <Select
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
                options={yearOptions.map(y => ({ value: String(y), label: String(y) }))}
                selectSize="md"
                containerClassName="w-24 shrink-0"
              />
            </>
          )}
          <button
            type="button"
            onClick={() => toggleFiled('gstr1')}
            title={periodFiling.gstr1 ? 'Click to mark as pending' : 'Click to mark as filed'}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors cursor-pointer shrink-0 ${
              periodFiling.gstr1
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800'
            }`}
          >
            R1 {periodFiling.gstr1 ? 'Filed' : 'Pending'}
          </button>
          <button
            type="button"
            onClick={() => toggleFiled('gstr3b')}
            title={periodFiling.gstr3b ? 'Click to mark as pending' : 'Click to mark as filed'}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors cursor-pointer shrink-0 ${
              periodFiling.gstr3b
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800'
            }`}
          >
            3B {periodFiling.gstr3b ? 'Filed' : 'Pending'}
          </button>
          <a
            href="https://gst.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary text-xs flex items-center gap-1.5 shrink-0"
          >
            <ExternalLink size={13} /> GST Portal
          </a>
        </div>
      </PageHeader>

      {/* Warnings */}
      {warnings.filter(w => w.type === 'error').length > 0 && (
        <AlertBanner
          type="error"
          title="GST Compliance Warnings Detected"
          description={warnings.filter(w => w.type === 'error').slice(0, 3).map(w => w.msg).join(' | ')}
        />
      )}

      {/* NIL Return notice */}
      {isNilReturn && (
        <AlertBanner
          type="warning"
          title="NIL Return Period"
          description="No invoices or expenses found for this period. File a NIL return on the GST portal (gst.gov.in); NIL returns are mandatory to avoid late filing penalties."
        />
      )}

      {/* Modern High-Density Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Taxable Turnover"
          value={formatCurrency(grandTotals.taxable)}
          subtitle="Total outward taxable value"
          icon={<Scale size={20} />}
          variant="primary"
        />
        <StatCard
          title="Total Output Tax"
          value={formatCurrency(totalTax)}
          subtitle="IGST + CGST + SGST + Cess"
          icon={<Percent size={20} />}
          variant="purple"
        />
        <StatCard
          title="Net Tax Payable"
          value={formatCurrency(netPayable)}
          subtitle="After deducting eligible ITC"
          icon={<IndianRupee size={20} />}
          variant={netPayable > 0 ? "danger" : "success"}
        />
        <StatCard
          title="Outward Invoices"
          value={filteredBills.length}
          subtitle="B2B, B2C and Credit Notes"
          icon={<FileText size={20} />}
          variant="primary"
        />
      </div>

      {/* Modern Segmented Tab Bar */}
      <div>
        <SegmentedTabs
          options={returnTabs}
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as any)}
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'gstr1' && (
        <GSTR1Tab
          b2bRows={b2bRows}
          b2bRegular={b2bRegular}
          b2cRates={b2cRates}
          b2cSmall={b2cSmall}
          b2cLarge={b2cLarge}
          b2cTotals={b2cTotals}
          hsnRows={hsnRows}
          creditNotes={creditNotes}
          cnTotals={cnTotals}
          docSummary={docSummary}
          b2bTotals={b2bTotals}
          grandTotals={grandTotals}
          periodFiling={periodFiling}
          markFiled={markFiled}
          onExportJSON={() =>
            exportGSTR1JSON(
              filteredBills,
              profile,
              filterMode,
              monthFilter,
              yearFilter,
              b2bRegular,
              b2cSmall,
              b2cLarge,
              creditNotes,
              docSummary
            )
          }
          onExportB2B={() => exportB2BCSV(b2bRegular)}
          onExportB2C={() => exportB2CCSV(b2cSmall, b2cLarge, b2cRates.length)}
          onExportHSN={() => exportHSNCSV(filteredBills, hsnRows.length)}
          onExportCDNR={() => exportCDNRCSV(creditNotes)}
          onExportDocSummary={() => exportDocSummaryCSV(docSummary)}
        />
      )}

      {activeTab === 'gstr3b' && (
        <GSTR3BTab
          grandTotals={grandTotals}
          b2cBills={b2cBills}
          itcFromExpenses={itcFromExpenses}
          outputTax={outputTax}
          netTax={netTax}
          netPayable={netPayable}
          periodFiling={periodFiling}
          markFiled={markFiled}
          onExportCSV={() => exportGSTR3BCSV(grandTotals, itcFromExpenses, netTax)}
          onExportJSON={() =>
            exportGSTR3BJSON(
              filteredBills,
              filteredExpenses,
              purchases,
              profile,
              filterMode,
              monthFilter,
              yearFilter,
              grandTotals,
              itcFromExpenses
            )
          }
        />
      )}

      {activeTab === 'gstr2b' && (
        <GSTR2BTab
          gstr2bData={gstr2bData}
          purchases={purchases}
          onImport2B={handleImport2B}
          onClear2B={() => setGstr2bData(null)}
          onExportCSV={(rows: ReconRow[]) => exportReconCSV(rows)}
        />
      )}

      {activeTab === 'tds' && <TdsTcsTab filteredBills={filteredBills} />}

      {activeTab === 'guide' && <FilingGuideTab />}
    </div>
  );
};

export default GSTReturnsPage;
