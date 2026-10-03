import React from 'react';
import { TrendingUp, Landmark, FileText, Calculator, Download } from 'lucide-react';
import { formatCurrency } from '@/shared/utils';
import { getPrintSettings } from '@/features/invoices/utils/printSettings';
import { buildITR4FieldMap } from '../utils';
import { toast } from '@/shared/components/feedback/Toast';
import { Row } from './RegimeCalculatorTab';
import type {
  IncomeTaxInputs,
  RegimeComparison,
  PresumptiveResult,
  AdvanceTaxScheduleResult,
} from '../types';

function getAccentRGB(): [number, number, number] {
  try {
    const s = getPrintSettings();
    if (!s?.userColorsEnabled) return [30, 64, 175];
    const hex = String(s.pdfAccent || '').replace('#', '');
    if (hex.length !== 6) return [30, 64, 175];
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    if ([r, g, b].some(v => !Number.isFinite(v))) return [30, 64, 175];
    return [r, g, b];
  } catch {
    return [30, 64, 175];
  }
}

interface BillItem {
  invoiceDate?: string;
  totalAmount?: number | string;
}

interface PurchaseItem {
  date?: string;
  totalAmount?: number | string;
}

interface ExpenseItem {
  date?: string;
  amount?: number | string;
  category?: string;
}

interface ProfileItem {
  businessName?: string;
  gstin?: string;
  pan?: string;
  businessType?: string;
}

interface SummaryTabProps {
  bills: BillItem[];
  expenses: ExpenseItem[];
  purchases: PurchaseItem[];
  profile: ProfileItem;
  comparison: RegimeComparison;
  inputs: IncomeTaxInputs;
  presumptive: PresumptiveResult | null;
  advanceSchedule: AdvanceTaxScheduleResult;
  fy: string;
  ay: string;
}

export function SummaryTab({
  bills,
  expenses,
  purchases,
  profile,
  comparison,
  inputs,
  presumptive,
  advanceSchedule,
  fy,
  ay,
}: SummaryTabProps) {
  const generateITR4PDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const tax = comparison[comparison.recommended] as any;
      // Build the ITR-4 field map from all inputs
      const rows = buildITR4FieldMap(inputs, tax, presumptive?.presumptiveIncome ? presumptive : null, inputs.deductions);

      let y = 15;
      doc.setFontSize(16); doc.setFont('helvetica', 'bold');
      doc.text('ITR-4 (Sugam) Filing Summary', 105, y, { align: 'center' });
      y += 6;
      doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.text(`FY ${fy} · AY ${ay} · Regime: ${comparison.recommended.toUpperCase()} · Generated ${new Date().toLocaleDateString('en-IN')}`, 105, y, { align: 'center' });
      y += 6;

      // Assessee block
      if (profile?.businessName) {
        doc.setFontSize(10); doc.setFont('helvetica', 'bold');
        doc.rect(15, y, 180, 22, 'S');
        doc.text('Assessee', 20, y + 5);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
        doc.text(`Name: ${profile.businessName}`, 20, y + 11);
        if (profile.gstin) doc.text(`GSTIN: ${profile.gstin}`, 20, y + 16);
        if (profile.pan) doc.text(`PAN: ${profile.pan}`, 120, y + 11);
        y += 26;
      }

      // Fields grouped by section
      let currentSection = '';
      for (const r of rows) {
        if (y > 265) { doc.addPage(); y = 20; }
        if (r.section !== currentSection) {
          currentSection = r.section;
          y += 4;
          doc.setFillColor(...getAccentRGB()); doc.setTextColor(255);
          doc.rect(15, y, 180, 6, 'F');
          doc.setFontSize(9); doc.setFont('helvetica', 'bold');
          doc.text(r.section, 17, y + 4);
          doc.setTextColor(0);
          y += 8;
        }
        doc.setFontSize(r.big ? 10 : 8.5);
        doc.setFont('helvetica', r.bold ? 'bold' : 'normal');
        doc.text(r.field, 17, y);
        const val = typeof r.value === 'number' ? formatCurrency(r.value) : String(r.value || '');
        doc.text(val, 190, y, { align: 'right' });
        if (r.note) {
          y += 4;
          doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(120);
          doc.text(r.note, 20, y);
          doc.setTextColor(0);
        }
        y += 5;
      }

      // Advance tax summary
      if (advanceSchedule?.applies) {
        if (y > 245) { doc.addPage(); y = 20; }
        y += 4;
        doc.setFillColor(...getAccentRGB()); doc.setTextColor(255);
        doc.rect(15, y, 180, 6, 'F');
        doc.setFontSize(9); doc.setFont('helvetica', 'bold');
        doc.text('E — Advance Tax', 17, y + 4);
        doc.setTextColor(0); y += 8;

        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
        advanceSchedule.schedule.forEach(row => {
          doc.text(`Installment #${row.installment} (${row.label})`, 17, y);
          doc.text(formatCurrency(row.installmentDue), 130, y, { align: 'right' });
          doc.text(`Paid: ${formatCurrency(row.totalPaidByDue)}`, 190, y, { align: 'right' });
          y += 5;
        });
      }

      // Footer
      doc.setFontSize(7); doc.setFont('helvetica', 'italic');
      doc.text('Generated by Free GST Billing Software. Verify against your books + Form 26AS before filing on incometax.gov.in.', 105, 285, { align: 'center' });

      doc.save(`ITR-4-Summary-${profile?.businessName?.replace(/[^\w]+/g, '-') || 'assessee'}-${ay}.pdf`);
      toast('ITR-4 Summary PDF downloaded', 'success');
    } catch (e) {
      toast('Could not generate PDF', 'error');
      console.error('ITR-4 PDF', e);
    }
  };

  const inFY = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
    return `${y}-${String(y + 1).slice(-2)}` === fy;
  };

  const fyBills = bills.filter(b => inFY(b.invoiceDate));
  const fyExpenses = expenses.filter(e => inFY(e.date));
  const fyPurchases = purchases.filter(p => inFY(p.date));

  const sales = fyBills.reduce((s, b) => s + (Number(b.totalAmount) || 0), 0);
  const businessExpenses = fyExpenses
    .filter(e => e.category !== 'Personal / Drawings' && e.category !== 'Asset Purchase')
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const trading = fyPurchases.reduce((s, p) => s + (Number(p.totalAmount) || 0), 0);
  const assets = fyExpenses
    .filter(e => e.category === 'Asset Purchase')
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const netBusiness = Math.max(0, sales - trading - businessExpenses);

  // Presumptive threshold check (Section 44AD — up to ₹2Cr turnover)
  const under44ADEligible = sales < 20_000_000 && (profile?.businessType || '').toLowerCase() !== 'professional';

  return (
    <>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1rem' }}>
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue"><TrendingUp size={22} /></div>
          <div><p className="stat-label">Sales (FY {fy})</p><h2 className="stat-value">{formatCurrency(sales)}</h2></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-purple"><Landmark size={22} /></div>
          <div><p className="stat-label">Trading Purchases</p><h2 className="stat-value">{formatCurrency(trading)}</h2></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green"><FileText size={22} /></div>
          <div><p className="stat-label">Business Expenses</p><h2 className="stat-value">{formatCurrency(businessExpenses)}</h2></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-red"><Calculator size={22} /></div>
          <div><p className="stat-label">Net Business Income</p><h2 className="stat-value">{formatCurrency(netBusiness)}</h2></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="glass-panel p-4">
          <h3 className="section-title">Income breakdown</h3>
          <Row label="Sales / Turnover" value={sales} />
          <Row label="Less: Trading purchases" value={-trading} />
          <Row label="Less: Business expenses" value={-businessExpenses} />
          <Row label="= Net business income" value={netBusiness} bold />
          <Row label="+ Salary declared" value={Number(inputs.salary) || 0} muted={!inputs.salary} />
          <Row label="+ Rent received" value={Number(inputs.housePropertyIncome) || 0} muted={!inputs.housePropertyIncome} />
          <Row label="+ Other sources" value={Number(inputs.otherSources) || 0} muted={!inputs.otherSources} />
          <Row label="+ Capital gains (STCG + LTCG)" value={(Number(inputs.stcgAtSpecialRate) || 0) + (Number(inputs.ltcgAtSpecialRate) || 0)} muted={!inputs.stcgAtSpecialRate && !inputs.ltcgAtSpecialRate} />

          {assets > 0 && (
            <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'var(--warn-bg, #fffbeb)', borderRadius: 6, fontSize: '0.78rem' }}>
              <strong>Note:</strong> {formatCurrency(assets)} in Asset Purchases isn't deducted here.
              Assets are capitalised then depreciated under §32 — enter depreciation as a business expense
              in the year it's claimed (not the year of purchase).
            </div>
          )}
        </div>

        <div className="glass-panel p-4">
          <h3 className="section-title">Tax snapshot</h3>
          <p style={{ fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>
            Recommended regime: <strong style={{ color: comparison.recommended === 'new' ? '#059669' : '#8b5cf6', textTransform: 'uppercase' }}>{comparison.recommended}</strong>
          </p>
          <Row label={`Tax under ${comparison.recommended.toUpperCase()} Regime`} value={comparison[comparison.recommended].totalTax} bold big />
          <Row label="Tax under other regime" value={comparison[comparison.recommended === 'new' ? 'old' : 'new'].totalTax} muted />
          <Row label="You save vs other regime" value={comparison.savings} />

          <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {under44ADEligible && (
              <>
                <strong>💡 You may qualify for Section 44AD presumptive taxation.</strong> If your turnover is under ₹2Cr,
                you can declare 6% (digital receipts) or 8% (cash) of turnover as income and skip maintaining full books.
                File ITR-4 (Sugam) if you opt in.
                <br /><br />
              </>
            )}
            Filing due date: <strong>31 July {parseInt(fy.split('-')[1], 10) + 2000}</strong> (non-audit) ·
            <strong> 31 October {parseInt(fy.split('-')[1], 10) + 2000}</strong> (audit / §44AB).
            Advance tax installments: 15 Jun · 15 Sep · 15 Dec · 15 Mar.
          </div>
        </div>
      </div>

      <div className="glass-panel p-4" style={{ marginTop: '1rem', background: 'linear-gradient(135deg, rgba(30,64,175,0.05) 0%, rgba(5,150,105,0.05) 100%)', border: '1px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 className="section-title" style={{ margin: 0, color: 'var(--primary)' }}>ITR-4 (Sugam) Filing Summary PDF</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
              One PDF with every ITR-4 field pre-computed. Copy each value into the corresponding box on incometax.gov.in — or hand the PDF to your CA.
            </p>
          </div>
          <button className="btn btn-primary" onClick={generateITR4PDF}>
            <Download size={16} /> Download ITR-4 Summary
          </button>
        </div>
      </div>

      <div className="glass-panel p-4" style={{ marginTop: '1rem' }}>
        <h3 className="section-title">Coming next in v1.9.0</h3>
        <ul style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, paddingLeft: '1.2rem', lineHeight: 1.7 }}>
          <li><strong>Form 16 upload + parse</strong> — auto-extract salary + TDS + exemptions</li>
          <li><strong>Capital Gains module</strong> — Zerodha / Groww / ICICI Direct CSV import</li>
          <li><strong>House Property module</strong> — multi-property, home-loan interest §24(b)</li>
          <li><strong>ITR-1 / ITR-2 / ITR-3 support</strong> — for salaried + rental + capital-gains assessees</li>
          <li><strong>ITR JSON export</strong> — upload directly to the IT portal</li>
          <li><strong>Form 26AS reconciliation</strong> — upload TDS certificate</li>
        </ul>
      </div>
    </>
  );
}
