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
