import { billsRepository, BillsRepository } from '../invoicing/bills.repository.ts';
import { purchasingRepository, PurchasingRepository } from '../purchasing/purchasing.repository.ts';
import { expensesRepository, ExpensesRepository } from '../expenses/expenses.repository.ts';
import { clientsRepository, ClientsRepository } from '../customers/clients.repository.ts';

export interface ProfitAndLossReport {
  totalRevenue: number;
  totalCostOfPurchases: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  marginPercent: number;
}

export interface AgingBucket {
  current: number;       // 0-30 days
  thirtyToSixty: number; // 31-60 days
  sixtyToNinety: number; // 61-90 days
  overNinety: number;    // 90+ days
  totalReceivables: number;
}

export interface FinancialOverviewReport {
  totalSales: number;
  totalInvoicesCount: number;
  totalPurchases: number;
  totalExpenses: number;
  profitAndLoss: ProfitAndLossReport;
  aging: AgingBucket;
  topClients: Array<{ clientId: string; clientName: string; totalRevenue: number; count: number }>;
}

export class ReportingService {
  private billsRepo: BillsRepository;
  private purchaseRepo: PurchasingRepository;
  private expenseRepo: ExpensesRepository;
  private clientsRepo: ClientsRepository;

  constructor(
    billsRepo?: BillsRepository,
    purchaseRepo?: PurchasingRepository,
    expenseRepo?: ExpensesRepository,
    clientsRepo?: ClientsRepository
  ) {
    this.billsRepo = billsRepo || billsRepository;
    this.purchaseRepo = purchaseRepo || purchasingRepository;
    this.expenseRepo = expenseRepo || expensesRepository;
    this.clientsRepo = clientsRepo || clientsRepository;
  }

  private parseDate(d: string | undefined): Date {
    return d ? new Date(d) : new Date(0);
  }

  private filterByDateRange<T extends { date?: string; createdAt?: string }>(
    items: T[],
    startDate?: string,
    endDate?: string
  ): T[] {
    if (!startDate && !endDate) return items;
    const start = startDate ? new Date(startDate).getTime() : -Infinity;
    const end = endDate ? new Date(endDate + 'T23:59:59.999Z').getTime() : Infinity;

    return items.filter(item => {
      const itemTime = this.parseDate(item.date || item.createdAt).getTime();
      return itemTime >= start && itemTime <= end;
    });
  }

  getProfitAndLoss(startDate?: string, endDate?: string): ProfitAndLossReport {
    const bills = this.filterByDateRange(this.billsRepo.getAllBills(), startDate, endDate);
    const purchases = this.filterByDateRange(this.purchaseRepo.getAllPurchases(), startDate, endDate);
    const expenses = this.filterByDateRange(this.expenseRepo.getAllExpenses(), startDate, endDate);

    let totalRevenue = 0;
    for (const b of bills) {
      const totals = b.data?.totals || b.totals || {};
      totalRevenue += Number(totals.taxableAmount || totals.subtotal || 0);
    }

    let totalCostOfPurchases = 0;
    for (const p of purchases) {
      totalCostOfPurchases += Number(p.subtotal || p.grandTotal || 0);
    }

    let totalExpenses = 0;
    for (const e of expenses) {
      totalExpenses += Number(e.amount || 0);
    }

    const grossProfit = totalRevenue - totalCostOfPurchases;
    const netProfit = grossProfit - totalExpenses;
    const marginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCostOfPurchases: Math.round(totalCostOfPurchases * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      marginPercent: Math.round(marginPercent * 100) / 100,
    };
  }

  getAccountsReceivableAging(): AgingBucket {
    const bills = this.billsRepo.getAllBills();
    const now = Date.now();

    const aging: AgingBucket = {
      current: 0,
      thirtyToSixty: 0,
      sixtyToNinety: 0,
      overNinety: 0,
      totalReceivables: 0,
    };

    for (const b of bills) {
      const data = b.data || b;
      const status = (data.status || 'unpaid').toLowerCase();
      if (status === 'paid' || status === 'cancelled') continue;

      const grandTotal = Number(data.totals?.grandTotal || data.grandTotal || 0);
      const paidAmount = Number(data.totals?.paidAmount || data.paidAmount || 0);
      const balanceDue = Math.max(0, grandTotal - paidAmount);

      if (balanceDue <= 0) continue;

      const dateStr = data.details?.date || data.date || data.createdAt;
      const billTime = dateStr ? new Date(dateStr).getTime() : now;
      const diffDays = Math.floor((now - billTime) / (1000 * 60 * 60 * 24));

      aging.totalReceivables += balanceDue;

      if (diffDays <= 30) {
        aging.current += balanceDue;
      } else if (diffDays <= 60) {
        aging.thirtyToSixty += balanceDue;
      } else if (diffDays <= 90) {
        aging.sixtyToNinety += balanceDue;
      } else {
        aging.overNinety += balanceDue;
      }
    }

    aging.current = Math.round(aging.current * 100) / 100;
    aging.thirtyToSixty = Math.round(aging.thirtyToSixty * 100) / 100;
    aging.sixtyToNinety = Math.round(aging.sixtyToNinety * 100) / 100;
    aging.overNinety = Math.round(aging.overNinety * 100) / 100;
    aging.totalReceivables = Math.round(aging.totalReceivables * 100) / 100;

    return aging;
  }

  getOverview(startDate?: string, endDate?: string): FinancialOverviewReport {
    const rawBills = this.billsRepo.getAllBills();
    const rawPurchases = this.purchaseRepo.getAllPurchases();
    const rawExpenses = this.expenseRepo.getAllExpenses();

    const bills = this.filterByDateRange(rawBills, startDate, endDate);
    const purchases = this.filterByDateRange(rawPurchases, startDate, endDate);
    const expenses = this.filterByDateRange(rawExpenses, startDate, endDate);

    let totalSales = 0;
    const clientMap = new Map<string, { clientId: string; clientName: string; totalRevenue: number; count: number }>();

    for (const b of bills) {
      const data = b.data || b;
      const grandTotal = Number(data.totals?.grandTotal || data.grandTotal || 0);
      totalSales += grandTotal;

      const clientId = data.client?.id || data.clientId || 'UNKNOWN';
      const clientName = data.client?.name || data.clientName || 'Cash Customer';

      if (!clientMap.has(clientId)) {
        clientMap.set(clientId, { clientId, clientName, totalRevenue: 0, count: 0 });
      }
      const record = clientMap.get(clientId)!;
      record.totalRevenue += grandTotal;
      record.count += 1;
    }

    let totalPurchases = 0;
    for (const p of purchases) {
      totalPurchases += Number(p.grandTotal || p.subtotal || 0);
    }

    let totalExpenses = 0;
    for (const e of expenses) {
      totalExpenses += Number(e.amount || 0);
    }

    const topClients = Array.from(clientMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    return {
      totalSales: Math.round(totalSales * 100) / 100,
      totalInvoicesCount: bills.length,
      totalPurchases: Math.round(totalPurchases * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      profitAndLoss: this.getProfitAndLoss(startDate, endDate),
      aging: this.getAccountsReceivableAging(),
      topClients,
    };
  }
}

export const reportingService = new ReportingService();
