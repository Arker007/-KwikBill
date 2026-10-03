import { billsRepository } from '../bills/bills.repository.js';
import { purchasesRepository } from '../purchases/purchases.repository.js';
import { expensesRepository } from '../expenses/expenses.repository.js';

export class TaxationService {
  constructor(billsRepo, purchaseRepo, expenseRepo) {
    this.billsRepo = billsRepo || billsRepository;
    this.purchaseRepo = purchaseRepo || purchasesRepository;
    this.expenseRepo = expenseRepo || expensesRepository;
  }

  filterByDateRange(items, startDate, endDate) {
    if (!startDate && !endDate) return items;
    const start = startDate ? new Date(startDate).getTime() : -Infinity;
    const end = endDate ? new Date(endDate + 'T23:59:59.999Z').getTime() : Infinity;

    return items.filter(item => {
      const d = item.date || item.createdAt;
      const itemTime = d ? new Date(d).getTime() : 0;
      return itemTime >= start && itemTime <= end;
    });
  }

  getGstr1Summary(startDate, endDate) {
    const rawBills = this.billsRepo.getAllBills();
    const bills = this.filterByDateRange(rawBills, startDate, endDate);

    const summary = {
      b2b: { count: 0, taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, total: 0 },
      b2cLarge: { count: 0, taxable: 0, igst: 0, cess: 0, total: 0 },
      b2cSmall: { count: 0, taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, total: 0 },
      creditDebitNotes: { count: 0, taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, total: 0 },
      nilExempt: { nilRated: 0, exempted: 0, nonGst: 0 },
      hsnSummary: [],
      totalTaxLiability: 0,
    };

    const hsnMap = new Map();

    for (const bill of bills) {
      const data = bill.data || bill;
      const client = data.client || {};
      const totals = data.totals || {};
      const items = data.items || [];
      const billType = data.type || 'tax-invoice';

      const taxable = Number(totals.taxableAmount || totals.subtotal || 0);
      const cgst = Number(totals.cgst || 0);
      const sgst = Number(totals.sgst || 0) + Number(totals.utgst || 0);
      const igst = Number(totals.igst || 0);
      const cess = Number(totals.cess || 0);
      const grandTotal = Number(totals.grandTotal || (taxable + cgst + sgst + igst + cess));

      const hasGstin = Boolean(client.gstin && client.gstin.trim().length >= 15);
      const isInterstate = Boolean(totals.isInterState || (client.isSEZ));

      if (billType === 'credit-note' || billType === 'debit-note') {
        summary.creditDebitNotes.count += 1;
        summary.creditDebitNotes.taxable += taxable;
        summary.creditDebitNotes.igst += igst;
        summary.creditDebitNotes.cgst += cgst;
        summary.creditDebitNotes.sgst += sgst;
        summary.creditDebitNotes.cess += cess;
        summary.creditDebitNotes.total += grandTotal;
      } else if (hasGstin) {
        summary.b2b.count += 1;
        summary.b2b.taxable += taxable;
        summary.b2b.igst += igst;
        summary.b2b.cgst += cgst;
        summary.b2b.sgst += sgst;
        summary.b2b.cess += cess;
        summary.b2b.total += grandTotal;
      } else if (isInterstate && grandTotal > 250000) {
        summary.b2cLarge.count += 1;
        summary.b2cLarge.taxable += taxable;
        summary.b2cLarge.igst += igst;
        summary.b2cLarge.cess += cess;
        summary.b2cLarge.total += grandTotal;
      } else {
        summary.b2cSmall.count += 1;
        summary.b2cSmall.taxable += taxable;
        summary.b2cSmall.igst += igst;
        summary.b2cSmall.cgst += cgst;
        summary.b2cSmall.sgst += sgst;
        summary.b2cSmall.cess += cess;
        summary.b2cSmall.total += grandTotal;
      }

      for (const item of items) {
        const hsn = (item.hsn || item.sac || 'OTHER').toUpperCase().trim();
        const itemTaxable = Number(item.taxable || item.amount || 0);
        const itemIgst = Number(item.igst || 0);
        const itemCgst = Number(item.cgst || 0);
        const itemSgst = Number(item.sgst || 0);
        const itemCess = Number(item.cess || 0);
        const qty = Number(item.quantity || item.qty || 1);

        if (!hsnMap.has(hsn)) {
          hsnMap.set(hsn, {
            hsn,
            description: item.description || item.name || '',
            uqc: item.unit || 'NOS',
            totalQty: 0,
            taxable: 0,
            igst: 0,
            cgst: 0,
            sgst: 0,
            cess: 0,
            total: 0,
          });
        }
        const record = hsnMap.get(hsn);
        record.totalQty += qty;
        record.taxable += itemTaxable;
        record.igst += itemIgst;
        record.cgst += itemCgst;
        record.sgst += itemSgst;
        record.cess += itemCess;
        record.total += itemTaxable + itemIgst + itemCgst + itemSgst + itemCess;
      }
    }

    summary.hsnSummary = Array.from(hsnMap.values());
    summary.totalTaxLiability =
      summary.b2b.igst + summary.b2b.cgst + summary.b2b.sgst + summary.b2b.cess +
      summary.b2cLarge.igst + summary.b2cLarge.cess +
      summary.b2cSmall.igst + summary.b2cSmall.cgst + summary.b2cSmall.sgst + summary.b2cSmall.cess;

    return summary;
  }

  getGstr3bSummary(startDate, endDate) {
    const gstr1 = this.getGstr1Summary(startDate, endDate);
    const rawPurchases = this.purchaseRepo.getAllPurchases();
    const rawExpenses = this.expenseRepo.getAllExpenses();

    const purchases = this.filterByDateRange(rawPurchases, startDate, endDate);
    const expenses = this.filterByDateRange(rawExpenses, startDate, endDate);

    let allOtherItcIgst = 0;
    let allOtherItcCgst = 0;
    let allOtherItcSgst = 0;
    let allOtherItcCess = 0;

    let inelig17_5Igst = 0;
    let inelig17_5Cgst = 0;
    let inelig17_5Sgst = 0;
    let inelig17_5Cess = 0;

    for (const p of purchases) {
      const tax = Number(p.totalTax || 0);
      const half = tax / 2;
      if (p.itcEligible !== false) {
        allOtherItcCgst += half;
        allOtherItcSgst += half;
      } else {
        inelig17_5Cgst += half;
        inelig17_5Sgst += half;
      }
    }

    for (const e of expenses) {
      const tax = Number(e.taxAmount || 0);
      const half = tax / 2;
      if (e.itcEligible === false || e.itcCategory === 'ineligible_17_5') {
        inelig17_5Cgst += half;
        inelig17_5Sgst += half;
      } else {
        allOtherItcCgst += half;
        allOtherItcSgst += half;
      }
    }

    const outwardTaxable = {
      taxable: gstr1.b2b.taxable + gstr1.b2cLarge.taxable + gstr1.b2cSmall.taxable,
      igst: gstr1.b2b.igst + gstr1.b2cLarge.igst + gstr1.b2cSmall.igst,
      cgst: gstr1.b2b.cgst + gstr1.b2cSmall.cgst,
      sgst: gstr1.b2b.sgst + gstr1.b2cSmall.sgst,
      cess: gstr1.b2b.cess + gstr1.b2cLarge.cess + gstr1.b2cSmall.cess,
    };

    const netPayableIgst = Math.max(0, outwardTaxable.igst - allOtherItcIgst);
    const netPayableCgst = Math.max(0, outwardTaxable.cgst - allOtherItcCgst);
    const netPayableSgst = Math.max(0, outwardTaxable.sgst - allOtherItcSgst);
    const netPayableCess = Math.max(0, outwardTaxable.cess - allOtherItcCess);

    return {
      outwardTaxableSupplies: outwardTaxable,
      outwardZeroRated: { taxable: 0, igst: 0, cess: 0 },
      otherOutwardSupplies: { taxable: gstr1.nilExempt.nilRated + gstr1.nilExempt.exempted },
      inwardReverseCharge: { taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
      eligibleItc: {
        importGoods: { igst: 0, cess: 0 },
        importServices: { igst: 0, cess: 0 },
        inwardReverseCharge: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
        allOtherItc: { igst: allOtherItcIgst, cgst: allOtherItcCgst, sgst: allOtherItcSgst, cess: allOtherItcCess },
        totalItc: { igst: allOtherItcIgst, cgst: allOtherItcCgst, sgst: allOtherItcSgst, cess: allOtherItcCess },
      },
      ineligibleItc: {
        section17_5: { igst: inelig17_5Igst, cgst: inelig17_5Cgst, sgst: inelig17_5Sgst, cess: inelig17_5Cess },
        others: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
      },
      netTaxPayable: {
        igst: netPayableIgst,
        cgst: netPayableCgst,
        sgst: netPayableSgst,
        cess: netPayableCess,
        total: netPayableIgst + netPayableCgst + netPayableSgst + netPayableCess,
      },
    };
  }

  getTaxSummary(startDate, endDate) {
    return {
      gstr1: this.getGstr1Summary(startDate, endDate),
      gstr3b: this.getGstr3bSummary(startDate, endDate),
      generatedAt: new Date().toISOString(),
    };
  }
}

export const taxationService = new TaxationService();
