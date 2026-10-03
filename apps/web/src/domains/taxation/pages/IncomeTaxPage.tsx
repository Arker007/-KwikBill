import { useState, useEffect, useMemo } from 'react';
import { Calculator, Briefcase, Clock, Upload, FileText, IndianRupee, Sparkles, TrendingDown } from 'lucide-react';
import { getAllBills, getAllExpenses, getAllPurchases, getProfile } from '@/store';
import { formatCurrency, getFinancialYearLabel, belongsToProfile } from '@/shared/utils';
import { PageHeader } from '@/shared/components/layout';
import { StatCard, SegmentedTabs } from '@/shared/components/ui';
import { AlertBanner } from '@/shared/components/feedback';
import {
  compareRegimes,
  compute44AD,
  compute44ADA,
  compute44AE,
  computeAdvanceTaxSchedule,
  CURRENT_FY as ENGINE_FY,
} from '@/features/income-tax';
import { toast } from '@/shared/components/feedback/Toast';
import {
  defaultInputs,
  RegimeCalculatorTab,
  PresumptiveTab,
  AdvanceTaxTab,
  BankImportTab,
  SummaryTab,
} from '@/features/income-tax';
import type {
  IncomeTaxInputs,
  PresumptiveInputs,
  AdvanceTaxInputs,
  BankImportData,
  PresumptiveResult,
  AdvanceTaxScheduleResult,
  RegimeComparison,
} from '@/features/income-tax';

const TABS = [
  { key: 'calculator', label: 'Regime Calculator', icon: Calculator, help: 'Compare Old vs New (Section 115BAC) — auto-picks the cheaper regime' },
  { key: 'presumptive', label: 'Presumptive (§44AD/ADA)', icon: Briefcase, help: 'Skip full books — declare 6/8% (business) or 50% (professional) of turnover' },
  { key: 'advance',    label: 'Advance Tax',       icon: Clock,    help: 'Four installment schedule with §234B/C interest calculation' },
  { key: 'bank',       label: 'Bank Statement Import', icon: Upload, help: 'Upload SBI / HDFC / ICICI / Axis / Kotak / PNB / Yes Bank CSV — auto-categorises' },
  { key: 'summary',    label: 'ITR Summary',    icon: FileText, help: 'Consolidated view + ITR-4 Filing Summary PDF' },
];

const CURRENT_FY = ENGINE_FY;
const CURRENT_AY = (() => {
  const start = parseInt(CURRENT_FY.split('-')[0], 10) + 1;
  return `${start}-${String(start + 1).slice(-2)}`;
})();

export function IncomeTaxPage() {
  const [tab, setTab] = useState('calculator');
  const [bills, setBills] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>({});

  const [inputs, setInputs] = useState<IncomeTaxInputs>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('gst_itrCalcInputs') || '{}');
      return { ...defaultInputs(), ...saved };
    } catch {
      return defaultInputs();
    }
  });

  const [bankImport, setBankImport] = useState<BankImportData>({ bankName: '', transactions: [] });

  const [presumptiveInputs, setPresumptiveInputs] = useState<PresumptiveInputs>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('gst_itrPresumptive') || '{}');
      return {
        section: '44AD',
        digitalReceipts: 0,
        cashReceipts: 0,
        declaredIncome: 0,
        heavyVehicleMonths: 0,
        heavyVehicleTonnage: 12,
        lightVehicleMonths: 0,
        ...saved,
      };
    } catch {
      return {
        section: '44AD',
        digitalReceipts: 0,
        cashReceipts: 0,
        declaredIncome: 0,
        heavyVehicleMonths: 0,
        heavyVehicleTonnage: 12,
        lightVehicleMonths: 0,
      };
    }
  });

  const [advanceInputs, setAdvanceInputs] = useState<AdvanceTaxInputs>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('gst_itrAdvanceTax') || '{}');
      return { tdsCredit: 0, payments: [], mode: 'regular', ...saved };
    } catch {
      return { tdsCredit: 0, payments: [], mode: 'regular' };
    }
  });

  useEffect(() => {
    Promise.all([
      getAllBills().catch(() => []),
      getAllExpenses().catch(() => []),
      getAllPurchases().catch(() => []),
      getProfile().catch(() => ({})),
    ]).then(([b, e, p, prof]) => {
      setBills((b || []).filter((bill: any) => belongsToProfile(bill, prof)));
      setExpenses(e || []);
      setPurchases(p || []);
      setProfile(prof || {});
    });
  }, []);

  // Prefill Business Income from the app's own sales - purchases - expenses for the current FY
  useEffect(() => {
    if (!bills.length && !purchases.length) return;
    if (Number(inputs.businessIncome) > 0) return;
    const inFY = (dateStr?: string) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
      return `${y}-${String(y + 1).slice(-2)}` === CURRENT_FY;
    };
    const sales = bills.filter(b => inFY(b.invoiceDate)).reduce((s, b) => s + (Number(b.totalAmount) || 0), 0);
    const cogs  = purchases.filter(p => inFY(p.date)).reduce((s, p) => s + (Number(p.totalAmount) || 0), 0);
    const exps  = expenses.filter(e => inFY(e.date))
                          .filter(e => e.category !== 'Personal / Drawings' && e.category !== 'Asset Purchase')
                          .reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const estimated = Math.max(0, sales - cogs - exps);
    if (estimated > 0) {
      setInputs(prev => ({ ...prev, businessIncome: Math.round(estimated), _autofillHint: true }));
    }
  }, [bills, purchases, expenses]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save calculator inputs whenever they change
  useEffect(() => {
    try {
      const { _autofillHint, ...persist } = inputs;
      void _autofillHint;
      localStorage.setItem('gst_itrCalcInputs', JSON.stringify(persist));
    } catch { /* localStorage full */ }
  }, [inputs]);

  useEffect(() => {
    try {
      localStorage.setItem('gst_itrPresumptive', JSON.stringify(presumptiveInputs));
    } catch { /* ignore */ }
  }, [presumptiveInputs]);

  useEffect(() => {
    try {
      localStorage.setItem('gst_itrAdvanceTax', JSON.stringify(advanceInputs));
    } catch { /* ignore */ }
  }, [advanceInputs]);

  // Presumptive result
  const presumptive: PresumptiveResult | null = useMemo(() => {
    if (presumptiveInputs.section === '44AD') return compute44AD(presumptiveInputs);
    if (presumptiveInputs.section === '44ADA') return compute44ADA(presumptiveInputs);
    if (presumptiveInputs.section === '44AE') return compute44AE(presumptiveInputs);
    return null;
  }, [presumptiveInputs]);

  // Regime comparison recomputes live from inputs
  const comparison: RegimeComparison = useMemo(() => compareRegimes(inputs), [inputs]);

  // Advance-tax schedule
  const advanceSchedule: AdvanceTaxScheduleResult = useMemo(() => {
    const recTotal = comparison?.[comparison?.recommended]?.totalTax ?? 0;
    return computeAdvanceTaxSchedule(
      recTotal,
      advanceInputs.tdsCredit,
      advanceInputs.payments,
      advanceInputs.mode
    );
  }, [comparison, advanceInputs]);

  const recommendedRegime = comparison?.recommended === 'new' ? 'New Regime (§115BAC)' : 'Old Regime';
  const recTax = comparison?.[comparison?.recommended]?.totalTax ?? 0;
  const savings = comparison?.savings ?? 0;

  const subTabs = TABS.map(t => ({ key: t.key, label: t.label }));

  return (
    <div className="dashboard-container max-w-7xl mx-auto px-2 sm:px-4 py-3 space-y-5">
      <PageHeader
        breadcrumbs={[
          { label: 'Tax & Compliance' },
          { label: 'Income Tax Helper' },
        ]}
        icon={<Calculator size={20} />}
        title="Income Tax Helper"
        subtitle={`FY ${CURRENT_FY} · AY ${CURRENT_AY} — Old vs New Regime, Section 44AD/ADA, Advance Tax schedule & ITR Summary`}
      />

      {getFinancialYearLabel() !== CURRENT_FY && (
        <AlertBanner
          type="warning"
          title={`Figures calibrated for FY ${CURRENT_FY} (Current running FY is ${getFinancialYearLabel()})`}
          description={`Statutory tax slabs, rebate limits and capital-gains rates built into this calculation engine go up to FY ${CURRENT_FY}. Verify all calculations with your Chartered Accountant prior to filing ITR.`}
        />
      )}

      {/* Modern High-Density Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Recommended Regime"
          value={recommendedRegime}
          subtitle={savings > 0 ? `Saves ${formatCurrency(savings)} vs alternative` : 'Optimal tax calculation'}
          icon={<Sparkles size={20} />}
          variant="success"
        />
        <StatCard
          title="Est. Tax Liability"
          value={formatCurrency(recTax)}
          subtitle={`Under ${recommendedRegime}`}
          icon={<IndianRupee size={20} />}
          variant={recTax > 0 ? "danger" : "success"}
        />
        <StatCard
          title="Potential Tax Savings"
          value={formatCurrency(savings)}
          subtitle="Differential benefit between regimes"
          icon={<TrendingDown size={20} />}
          variant={savings > 0 ? "purple" : "default"}
        />
      </div>

      {/* Modern Segmented Tab Bar */}
      <div>
        <SegmentedTabs
          options={subTabs}
          activeKey={tab}
          onChange={(k) => setTab(k)}
        />
      </div>

      {tab === 'calculator' && (
        <RegimeCalculatorTab
          inputs={inputs}
          setInputs={setInputs}
          comparison={comparison}
          onReset={() => setInputs(defaultInputs())}
        />
      )}

      {tab === 'presumptive' && (
        <PresumptiveTab
          presumptiveInputs={presumptiveInputs}
          setPresumptiveInputs={setPresumptiveInputs}
          presumptive={presumptive}
          onPushToCalculator={() => {
            if (!presumptive) return;
            setInputs(prev => ({ ...prev, businessIncome: presumptive.presumptiveIncome }));
            setTab('calculator');
            toast(`Presumptive income of ${formatCurrency(presumptive.presumptiveIncome)} pushed to calculator`, 'success');
          }}
        />
      )}

      {tab === 'advance' && (
        <AdvanceTaxTab
          advanceInputs={advanceInputs}
          setAdvanceInputs={setAdvanceInputs}
          schedule={advanceSchedule}
          totalTax={comparison[comparison.recommended].totalTax}
          recommended={comparison.recommended}
        />
      )}

      {tab === 'bank' && (
        <BankImportTab
          bankImport={bankImport}
          setBankImport={setBankImport}
          onCommit={(totals) => {
            setInputs(prev => ({
              ...prev,
              businessIncome: (prev.businessIncome || 0) + (totals.business_in || 0),
              otherSources: (prev.otherSources || 0) + (totals.interest || 0),
              housePropertyIncome: Math.max(0, ((prev.housePropertyIncome || 0) + (totals.rent_received || 0) * 0.7)),
              deductions: {
                ...prev.deductions,
                '80C':   (Number(prev.deductions?.['80C'])  || 0) + (totals.deduction_80C || 0),
                '80D':   (Number(prev.deductions?.['80D'])  || 0) + (totals.deduction_80D || 0),
                '80TTA': Math.min(10_000, (Number(prev.deductions?.['80TTA']) || 0) + (totals.interest || 0)),
              },
            }));
            setTab('calculator');
            toast('Numbers pushed to Regime Calculator', 'success');
          }}
        />
      )}

      {tab === 'summary' && (
        <SummaryTab
          bills={bills}
          expenses={expenses}
          purchases={purchases}
          profile={profile}
          comparison={comparison}
          inputs={inputs}
          presumptive={presumptive}
          advanceSchedule={advanceSchedule}
          fy={CURRENT_FY}
          ay={CURRENT_AY}
        />
      )}
    </div>
  );
}

export default IncomeTaxPage;
