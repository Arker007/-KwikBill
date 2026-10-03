/**
 * Income Tax Domain Types & Data Contracts
 */

export type ITRRegime = 'old' | 'new';

export interface IncomeTaxInputs {
  salary: number;
  businessIncome: number;
  housePropertyIncome: number;
  otherSources: number;
  stcgAtSpecialRate: number;
  ltcgAtSpecialRate: number;
  deductions: Record<string, number>;
  regime?: ITRRegime;
  _autofillHint?: boolean;
}

export interface PresumptiveInputs {
  section: '44AD' | '44ADA' | '44AE';
  digitalReceipts: number;
  cashReceipts: number;
  declaredIncome: number;
  heavyVehicleMonths: number;
  heavyVehicleTonnage: number;
  lightVehicleMonths: number;
}

export interface PresumptiveResult {
  section: string;
  turnover?: number;
  deemedIncome?: number;
  heavyIncome?: number;
  lightIncome?: number;
  presumptiveIncome: number;
  isEligible?: boolean;
  notes: string[];
}

export interface AdvancePayment {
  date: string;
  amount: number;
}

export interface AdvanceTaxInputs {
  tdsCredit: number;
  payments: AdvancePayment[];
  mode: 'regular' | 'presumptive';
}

export interface AdvanceScheduleRow {
  installment: number;
  label: string;
  cumulativePct: number;
  installmentDue: number;
  totalPaidByDue: number;
  shortfall: number;
}



export interface BankImportData {
  bankName: string;
  transactions: BankTransaction[];
}

export interface RegimeTaxResult {
  grossTotalIncome: number;
  standardDeduction: number;
  allowedDeductions: number;
  taxableIncome: number;
  slabTax: number;
  stcgTax: number;
  ltcgTax: number;
  rebate87A: number;
  surcharge: number;
  cess: number;
  totalTax: number;
}

export interface RegimeComparison {
  recommended: ITRRegime;
  savings: number;
  old: RegimeTaxResult;
  new: RegimeTaxResult;
}

export interface BankTransaction {
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  category: string;
}

export interface AdvanceTaxScheduleResult {
  applies: boolean;
  netLiability: number;
  totalPaid?: number;
  totalOutstanding?: number;
  note?: string;
  schedule: any[];
  mode?: 'regular' | 'presumptive';
  fy: string;
}
