import { getPrintSettings } from '@/features/invoices/utils/printSettings';
import { toast } from '@/shared/components/feedback/Toast';
import { Client, ClientStats, ClientAgingResult } from '@/features/clients/types';

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
    /* ignore — fall through to default */
  }
  return [30, 64, 175];
}

export async function generateClientStatement(
  clientName: string,
  clientBills: any[],
  clients: Client[],
  stats: ClientStats,
  profileForStatement: any
): Promise<void> {
  if (clientBills.length === 0) {
    toast('No invoices for this customer', 'warning');
    return;
  }
  try {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const savedClient = clients.find((c) => c.name === clientName) || { name: clientName };
    const pageW = 210,
      marginL = 15,
      marginR = 195,
      tableW = marginR - marginL;

    const fmt = (n: number) => {
      const v = Number(n) || 0;
      const abs = Math.abs(v);
      const rounded = abs.toFixed(2);
      const parts = rounded.split('.');
      const intPart = parts[0];
      const last3 = intPart.slice(-3);
      const rest = intPart.slice(0, -3);
      const grouped = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3 : last3;
      return (v < 0 ? '-' : '') + 'Rs. ' + grouped + '.' + parts[1];
    };

    // Header Band
    doc.setFillColor(...getAccentRGB());
    doc.rect(0, 0, pageW, 22, 'F');
    doc.setTextColor(255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTOMER STATEMENT', pageW / 2, 12, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Generated ${new Date().toLocaleDateString('en-IN')}  ·  Period: All invoices`,
      pageW / 2,
      18,
      { align: 'center' }
    );
    doc.setTextColor(0);

    let y = 30;

    const colL = marginL,
      colR = marginL + tableW / 2 + 5;
    const colWidth = tableW / 2 - 5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100);
    doc.text('FROM', colL, y);
    doc.text('BILL TO', colR, y);
    doc.setTextColor(0);
    y += 4;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(doc.splitTextToSize(profileForStatement?.businessName || '', colWidth), colL, y);
    doc.text(doc.splitTextToSize(savedClient.name || clientName, colWidth), colR, y);
    y += 5;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');

    const sellerLines = [
      profileForStatement?.address,
      [profileForStatement?.city, profileForStatement?.state, profileForStatement?.pin]
        .filter(Boolean)
        .join(', '),
      profileForStatement?.gstin ? `GSTIN: ${profileForStatement.gstin}` : null,
      profileForStatement?.email,
      profileForStatement?.phone ? `Ph: ${profileForStatement.phone}` : null,
    ].filter(Boolean);

    const clientLines = [
      savedClient.address,
      [savedClient.city, savedClient.state, savedClient.pin].filter(Boolean).join(', '),
      savedClient.gstin ? `GSTIN: ${savedClient.gstin}` : null,
      savedClient.email,
      savedClient.phone ? `Ph: ${savedClient.phone}` : null,
    ].filter(Boolean);

    let sellerDy = 0;
    sellerLines.forEach((line) => {
      const wrapped = doc.splitTextToSize(line as string, colWidth);
      doc.text(wrapped, colL, y + sellerDy);
      sellerDy += wrapped.length * 4;
    });
    let clientDy = 0;
    clientLines.forEach((line) => {
      const wrapped = doc.splitTextToSize(line as string, colWidth);
      doc.text(wrapped, colR, y + clientDy);
      clientDy += wrapped.length * 4;
    });
    y += Math.max(sellerDy, clientDy) + 5;

    // Summary Strip
    doc.setFillColor(241, 245, 249);
    doc.rect(marginL, y, tableW, 16, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(marginL, y, tableW, 16, 'S');

    const cellW = tableW / 4;
    const summaryCells = [
      { label: 'Invoices', value: String(stats.count) },
      { label: 'Total Billed', value: fmt(stats.total) },
      { label: 'Paid', value: fmt(stats.paid), color: [5, 150, 105] },
      {
        label: 'Outstanding',
        value: fmt(stats.unpaid),
        color: stats.unpaid > 0 ? [220, 38, 38] : [5, 150, 105],
      },
    ];
    summaryCells.forEach((cell, i) => {
      const cx = marginL + i * cellW + cellW / 2;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(cell.label.toUpperCase(), cx, y + 5, { align: 'center' });
      doc.setFontSize(cell.label === 'Invoices' ? 12 : 10);
      doc.setFont('helvetica', 'bold');
      if (cell.color) doc.setTextColor(cell.color[0], cell.color[1], cell.color[2]);
      else doc.setTextColor(15, 23, 42);
      doc.text(cell.value, cx, y + 12, { align: 'center' });
    });
    doc.setTextColor(0);
    y += 22;

    // Ledger Table
    const col = {
      dateEnd: 40,
      particEnd: 100,
      debitEnd: 133,
      creditEnd: 163,
      balanceEnd: marginR - 2,
    };

    const drawHeader = () => {
      doc.setFillColor(...getAccentRGB());
      doc.rect(marginL, y, tableW, 9, 'F');
      doc.setTextColor(255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Date', marginL + 2, y + 6);
      doc.text('Particulars', col.dateEnd + 2, y + 6);
      doc.text('Debit', col.debitEnd, y + 6, { align: 'right' });
      doc.text('Credit', col.creditEnd, y + 6, { align: 'right' });
      doc.text('Balance', col.balanceEnd, y + 6, { align: 'right' });
      doc.setTextColor(0);
      y += 12;
    };

    drawHeader();

    // Opening Balance
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(80);
    doc.text('Opening Balance', col.dateEnd + 2, y);
    doc.text(fmt(0), col.balanceEnd, y, { align: 'right' });
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.15);
    doc.line(marginL, y + 2, marginR, y + 2);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    y += 7;

    let runningBalance = 0;
    const sortedBills = clientBills
      .slice()
      .sort((a, b) => new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime());

    for (let i = 0; i < sortedBills.length; i++) {
      const bill = sortedBills[i];
      const isCreditNote = bill.invoiceType === 'credit-note';
      const amount = Number(bill.totalAmount) || 0;
      const paid = Number(bill.paidAmount) || 0;
      const debit = isCreditNote ? 0 : amount;
      const credit = isCreditNote ? amount : 0;

      if (y > 260) {
        doc.addPage();
        y = 20;
        drawHeader();
      }

      const rowH = 7;
      if (i % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(marginL, y - rowH + 2, tableW, rowH, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(new Date(bill.invoiceDate).toLocaleDateString('en-IN'), marginL + 2, y);

      const particulars = `${bill.invoiceNumber || ''} · ${bill.invoiceType || ''}`;
      const particText = doc.splitTextToSize(particulars, col.particEnd - col.dateEnd - 4);
      doc.text(particText[0] || '', col.dateEnd + 2, y);

      if (debit > 0) {
        doc.text(fmt(debit), col.debitEnd, y, { align: 'right' });
      } else {
        doc.setTextColor(180);
        doc.text('—', col.debitEnd, y, { align: 'right' });
        doc.setTextColor(15, 23, 42);
      }

      if (credit > 0) {
        doc.text(fmt(credit), col.creditEnd, y, { align: 'right' });
      } else {
        doc.setTextColor(180);
        doc.text('—', col.creditEnd, y, { align: 'right' });
        doc.setTextColor(15, 23, 42);
      }

      runningBalance += debit - credit;
      const isDr = runningBalance > 0.01;
      const isCr = runningBalance < -0.01;
      if (isDr) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 38, 38);
      } else if (isCr) {
        doc.setTextColor(5, 150, 105);
      } else {
        doc.setTextColor(15, 23, 42);
      }
      const suffix = isDr ? ' Dr' : isCr ? ' Cr' : '';
      doc.text(fmt(Math.abs(runningBalance)) + suffix, col.balanceEnd, y, { align: 'right' });
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'normal');
      y += rowH;

      if (paid > 0.01 && !isCreditNote) {
        if (y > 265) {
          doc.addPage();
          y = 20;
          drawHeader();
        }
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(80);
        doc.text('   Payment recd against above', col.dateEnd + 2, y);
        doc.text(fmt(paid), col.creditEnd, y, { align: 'right' });
        runningBalance -= paid;
        const isDr2 = runningBalance > 0.01;
        const isCr2 = runningBalance < -0.01;
        if (isDr2) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(220, 38, 38);
        } else if (isCr2) {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(5, 150, 105);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(15, 23, 42);
        }
        const suffix2 = isDr2 ? ' Dr' : isCr2 ? ' Cr' : '';
        doc.text(fmt(Math.abs(runningBalance)) + suffix2, col.balanceEnd, y, { align: 'right' });
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'normal');
        y += rowH;
      }
    }

    // Closing Balance
    y += 3;
    doc.setDrawColor(...getAccentRGB());
    doc.setLineWidth(0.6);
    doc.line(marginL, y, marginR, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('CLOSING BALANCE', marginL, y);
    doc.setFontSize(12);
    if (runningBalance > 0.01) doc.setTextColor(220, 38, 38);
    else doc.setTextColor(5, 150, 105);
    const balanceLabel =
      fmt(Math.abs(runningBalance)) +
      (runningBalance > 0.01 ? ' Dr' : runningBalance < -0.01 ? ' Cr' : ' Nil');
    doc.text(balanceLabel, col.balanceEnd, y, { align: 'right' });
    doc.setTextColor(0);
    y += 10;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100);
    doc.text('Dr = amount receivable from customer  ·  Cr = amount owed to customer', marginL, y);

    y = Math.max(y + 15, 260);
    doc.setDrawColor(150);
    doc.line(marginR - 55, y, marginR - 2, y);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    doc.text('Authorised Signatory', marginR - 28, y + 4, { align: 'center' });
    doc.text(profileForStatement?.businessName || '', marginR - 28, y + 8, { align: 'center' });

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120);
    doc.text(
      'Please review and confirm within 7 days. This is a computer-generated statement — no signature required.',
      pageW / 2,
      285,
      { align: 'center' }
    );
    doc.text('Generated by Free GST Billing Software', pageW / 2, 290, { align: 'center' });

    doc.save(
      `statement-${clientName.replace(/[^\w]+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
    );
    toast('Statement PDF generated', 'success');
  } catch (e) {
    toast('Could not generate statement PDF', 'error');
    console.error('generateClientStatement', e);
  }
}

export async function generateAgingReport(
  clientName: string,
  agingResult: ClientAgingResult,
  profileForStatement: any
): Promise<void> {
  try {
    const { jsPDF } = await import('jspdf');
    const { unpaidBills, buckets } = agingResult;
    if (unpaidBills.length === 0) {
      toast(`${clientName} has no outstanding balance.`, 'info');
      return;
    }
    const profile = profileForStatement || {};
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const marginL = 15,
      marginR = 195;
    let y = 20;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('AGING REPORT', marginL, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(profile?.businessName || 'Your Business', marginL, y);
    y += 5;
    if (profile?.address) {
      doc.text(profile.address, marginL, y);
      y += 5;
    }
    if (profile?.gstin) {
      doc.text(`GSTIN: ${profile.gstin}`, marginL, y);
      y += 5;
    }
    doc.setTextColor(0);
    doc.text(
      `As of: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
      marginR,
      20,
      { align: 'right' }
    );
    doc.setFont('helvetica', 'bold');
    doc.text(`Customer: ${clientName}`, marginR, 26, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    y += 4;
    doc.setDrawColor(...getAccentRGB());
    doc.setLineWidth(0.5);
    doc.line(marginL, y, marginR, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice #', marginL, y);
    doc.text('Date', marginL + 40, y);
    doc.text('Due', marginL + 65, y);
    doc.text('Age', marginL + 90, y);
    doc.text('Total', marginL + 115, y, { align: 'right' });
    doc.text('Outstanding', marginR, y, { align: 'right' });
    y += 6;
    doc.setLineWidth(0.2);
    doc.line(marginL, y - 2, marginR, y - 2);

    doc.setFont('helvetica', 'normal');
    const fmt = (n: number) =>
      (Number(n) || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    for (const { bill, ageDays, outstanding } of unpaidBills) {
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
      const due = bill.data?.details?.dueDate
        ? new Date(bill.data.details.dueDate).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
          })
        : '—';
      const dt = bill.invoiceDate
        ? new Date(bill.invoiceDate).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
          })
        : '—';
      doc.text(String(bill.invoiceNumber || '—').slice(0, 24), marginL, y);
      doc.text(dt, marginL + 40, y);
      doc.text(due, marginL + 65, y);
      doc.text(`${ageDays}d`, marginL + 90, y);
      doc.text(fmt(bill.totalAmount), marginL + 115, y, { align: 'right' });
      doc.setTextColor(ageDays > 60 ? 220 : 0, ageDays > 60 ? 38 : 0, ageDays > 60 ? 38 : 0);
      doc.text(fmt(outstanding), marginR, y, { align: 'right' });
      doc.setTextColor(0);
      y += 6;
    }

    y += 6;
    doc.setDrawColor(...getAccentRGB());
    doc.setLineWidth(0.5);
    doc.line(marginL, y, marginR, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('AGEING SUMMARY', marginL, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const bucketRows: [string, number][] = [
      ['Current (0–30 days)', buckets.current],
      ['31–60 days', buckets.d31_60],
      ['61–90 days', buckets.d61_90],
      ['90+ days (overdue)', buckets.d90plus],
    ];
    for (const [label, val] of bucketRows) {
      doc.text(label, marginL, y);
      doc.text(fmt(val), marginR, y, { align: 'right' });
      y += 6;
    }
    y += 2;
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.line(marginL, y, marginR, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL OUTSTANDING', marginL, y);
    doc.setTextColor(220, 38, 38);
    doc.text(fmt(buckets.total), marginR, y, { align: 'right' });
    doc.setTextColor(0);

    const filename = `Statement-${clientName.replace(/[^A-Za-z0-9]+/g, '_').slice(0, 40)}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    toast(`Statement for ${clientName} downloaded`, 'success');
  } catch (err) {
    console.error('generateAgingReport failed:', err);
    toast('Failed to generate statement — see console', 'error');
  }
}
