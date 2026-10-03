import { getAllPurchases, savePurchase, deletePurchase, getProfile } from '../../../store';
import { calculateRoundOff } from '@/features/invoices/utils/taxCalculation';
import { getPrintSettings } from '@/features/invoices/utils/printSettings';
import { toast } from '@/shared/components/feedback/Toast';
import { Purchase, PurchaseItem, PurchaseTotals } from '../types';

export function getAccentRGB(): [number, number, number] {
  try {
    const ps = getPrintSettings();
    if (ps.userColorsEnabled && ps.pdfAccent) {
      const hex = String(ps.pdfAccent).replace('#', '');
      if (/^[0-9a-f]{6}$/i.test(hex)) {
        return [
          parseInt(hex.slice(0, 2), 16),
          parseInt(hex.slice(2, 4), 16),
          parseInt(hex.slice(4, 6), 16),
        ];
      }
    }
  } catch {
    /* ignore */
  }
  return [30, 64, 175];
}

export function calcItemTax(item: PurchaseItem) {
  const amount = (item.quantity || 0) * (item.rate || 0);
  const tax = (amount * (item.taxPercent || 0)) / 100;
  const cess = (amount * (Number(item.cessPercent) || 0)) / 100;
  return { amount, tax, cess, total: amount + tax + cess };
}

export function calcPurchaseTotal(items: PurchaseItem[], applyRoundOff = false): PurchaseTotals {
  const raw = (items || []).reduce(
    (acc, item) => {
      const { amount, tax, cess, total } = calcItemTax(item);
      return {
        taxable: acc.taxable + amount,
        tax: acc.tax + tax,
        cess: acc.cess + cess,
        total: acc.total + total,
      };
    },
    { taxable: 0, tax: 0, cess: 0, total: 0 }
  );

  const roundOff = applyRoundOff ? calculateRoundOff(raw.total) : 0;
  return { ...raw, roundOff, finalTotal: raw.total + roundOff };
}

export async function fetchPurchases(): Promise<Purchase[]> {
  return await getAllPurchases();
}

export async function savePurchaseBill(purchase: Purchase): Promise<void> {
  await savePurchase(purchase);
}

export async function deletePurchaseBill(id: string): Promise<void> {
  await deletePurchase(id);
}

export async function generatePurchasePdf(purchase: Purchase): Promise<void> {
  try {
    const { jsPDF } = await import('jspdf');
    const t = calcPurchaseTotal(purchase.items, !!purchase.applyRoundOff);
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const marginL = 15, marginR = 195;
    let y = 20;
    const fmt = (n: number) =>
      (Number(n) || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PURCHASE BILL', marginL, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Invoice #: ${purchase.invoiceNumber || '-'}`, marginL, y);
    y += 5;
    doc.text(
      `Date: ${
        purchase.date
          ? new Date(purchase.date).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '-'
      }`,
      marginL,
      y
    );
    y += 5;
    doc.text(
      `Payment: ${purchase.paymentStatus || 'Unpaid'}   ·   ${
        purchase.interstate ? 'Interstate (IGST)' : 'Intrastate (CGST+SGST)'
      }`,
      marginL,
      y
    );
    y += 8;
    doc.setDrawColor(...getAccentRGB());
    doc.setLineWidth(0.5);
    doc.line(marginL, y, marginR, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Supplier', marginL, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(purchase.supplierName || '-', marginL, y);
    y += 5;

    if (purchase.supplierAddress) {
      const wrapped = doc.splitTextToSize(purchase.supplierAddress, 110);
      wrapped.forEach((line: string) => {
        doc.text(line, marginL, y);
        y += 5;
      });
    }
    if (purchase.supplierGstin) {
      doc.text(`GSTIN: ${purchase.supplierGstin}`, marginL, y);
      y += 5;
    }
    y += 4;

    // Items header
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('#', marginL, y);
    doc.text('Description', marginL + 8, y);
    doc.text('HSN', marginL + 80, y);
    doc.text('Qty', marginL + 100, y, { align: 'right' });
    doc.text('Rate', marginL + 122, y, { align: 'right' });
    doc.text('GST%', marginL + 140, y, { align: 'right' });
    doc.text('Amount', marginR, y, { align: 'right' });
    y += 2;
    doc.setLineWidth(0.2);
    doc.line(marginL, y, marginR, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    (purchase.items || []).forEach((item, idx) => {
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
      const lineTotal = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
      const withTax = lineTotal * (1 + (Number(item.taxPercent) || 0) / 100);
      const nameCol = 70;
      const nameLines = doc.splitTextToSize(String(item.name || '-'), nameCol);
      const rowH = Math.max(6, nameLines.length * 4.5);
      if (y + rowH > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(String(idx + 1), marginL, y);
      nameLines.forEach((line: string, lineIdx: number) => {
        doc.text(line, marginL + 8, y + lineIdx * 4.5);
      });
      doc.text(String(item.hsn || '-'), marginL + 80, y);
      doc.text(String(item.quantity || 0), marginL + 100, y, { align: 'right' });
      doc.text(fmt(item.rate), marginL + 122, y, { align: 'right' });
      doc.text(String(item.taxPercent || 0) + '%', marginL + 140, y, { align: 'right' });
      doc.text(fmt(withTax), marginR, y, { align: 'right' });
      y += rowH;
    });

    // Totals
    y += 4;
    doc.setDrawColor(...getAccentRGB());
    doc.setLineWidth(0.4);
    doc.line(marginL + 100, y, marginR, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    doc.text('Taxable', marginL + 100, y);
    doc.text(fmt(t.taxable), marginR, y, { align: 'right' });
    y += 5;
    doc.text('Tax (CGST+SGST or IGST)', marginL + 100, y);
    doc.text(fmt(t.tax), marginR, y, { align: 'right' });
    y += 5;
    if (t.cess > 0.005) {
      doc.text('Cess', marginL + 100, y);
      doc.text(fmt(t.cess), marginR, y, { align: 'right' });
      y += 5;
    }
    if (Math.abs(t.roundOff) > 0.005) {
      doc.text('Round-off', marginL + 100, y);
      doc.text((t.roundOff > 0 ? '+' : '') + fmt(t.roundOff), marginR, y, {
        align: 'right',
      });
      y += 5;
    }
    y += 2;
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(marginL + 100, y, marginR, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text('TOTAL', marginL + 100, y);
    doc.text(fmt(t.finalTotal), marginR, y, { align: 'right' });

    if (purchase.note) {
      y += 14;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(90);
      doc.text('Note: ' + purchase.note, marginL, y);
    }

    const safeInv = String(purchase.invoiceNumber || 'purchase').replace(/[^A-Za-z0-9._-]/g, '_');
    const filename = `Purchase-${safeInv}-${purchase.date || 'undated'}.pdf`;
    doc.save(filename);
  } catch (err) {
    console.error('Purchase PDF failed:', err);
    toast('Could not generate PDF — see console', 'error');
  }
}
