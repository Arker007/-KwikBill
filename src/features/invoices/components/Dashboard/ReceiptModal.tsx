import { SideModal } from "../../../../shared/components/ui";
import React from 'react';
import { X, Printer } from 'lucide-react';
import { formatCurrency, numberToWords } from '@/shared/utils';
import { ReceiptModalTarget } from './types';

interface ReceiptModalProps {
  target: ReceiptModalTarget;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ target, onClose }) => {
  const { bill, payment, remaining } = target;
  const currency = bill.currency || bill.data?.invoiceOptions?.currency || 'INR';
  const businessName = bill.data?.profile?.businessName || 'Your Business';
  const businessAddress = bill.data?.profile?.address || '';
  const businessGstin = bill.data?.profile?.gstin || '';
  const businessPhone = bill.data?.profile?.phone || '';
  const businessEmail = bill.data?.profile?.email || '';
  const clientName = bill.data?.client?.name || bill.clientName || 'Client';
  const clientAddress = bill.data?.client?.address || '';
  const clientPhone = bill.data?.client?.phone || '';
  const receiptNo = `RCPT-${(payment.id || '').replace('pay_', '').toUpperCase().slice(0, 10)}`;
  const paymentModeLabel = {
    'bank-transfer': 'Bank Transfer',
    'upi': 'UPI',
    'cash': 'Cash',
    'cheque': 'Cheque',
    'card': 'Card',
    'other': 'Other',
  }[payment.mode] || payment.mode;

  const doPrint = () => {
    let styleEl = document.getElementById('fgsb-receipt-print-css');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'fgsb-receipt-print-css';
      styleEl.textContent = `
        @media print {
          body * { visibility: hidden !important; }
          .fgsb-receipt-page, .fgsb-receipt-page * { visibility: visible !important; }
          .fgsb-receipt-page { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; background: #fff !important; color: #000 !important; }
          .fgsb-receipt-noprint { display: none !important; }
          @page { size: A5; margin: 12mm; }
        }
      `;
      document.head.appendChild(styleEl);
    }
    window.print();
  };

  return (
    <SideModal
      isOpen={true}
      onClose={onClose}
      title="Payment Receipt"
      maxWidthClass="max-w-xl"
      actions={
        <button id="btn-print-receipt" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors text-sm flex items-center gap-1 fgsb-receipt-noprint" onClick={doPrint}>
          <Printer size={16} /> Print Receipt
        </button>
      }
    >
      <div className="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-[#141414]">
        <div className="fgsb-receipt-page" style={{
          background: '#fff', color: '#111', padding: '1.5rem 1.75rem',
          border: '1px solid #e5e7eb', borderRadius: 6, fontFamily: 'Helvetica, Arial, sans-serif',
        }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '0.05em' }}>{businessName}</div>
            {businessAddress && <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 3 }}>{businessAddress}</div>}
            <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 3 }}>
              {businessGstin && <>GSTIN: <strong>{businessGstin}</strong> · </>}
              {businessPhone && <>Ph: {businessPhone} · </>}
              {businessEmail}
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            PAYMENT RECEIPT
          </div>
          <table style={{ width: '100%', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            <tbody>
              <tr><td style={{ padding: '3px 0', color: '#475569' }}>Receipt No.</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{receiptNo}</td></tr>
              <tr><td style={{ padding: '3px 0', color: '#475569' }}>Payment Date</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{payment.date ? new Date(payment.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td></tr>
              <tr><td style={{ padding: '3px 0', color: '#475569' }}>Against Invoice</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{bill.invoiceNumber}</td></tr>
              <tr><td style={{ padding: '3px 0', color: '#475569' }}>Payment Mode</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{paymentModeLabel}</td></tr>
              {payment.note && <tr><td style={{ padding: '3px 0', color: '#475569' }}>Ref / Note</td><td style={{ textAlign: 'right' }}>{payment.note}</td></tr>}
            </tbody>
          </table>
          <div style={{ border: '1px solid #cbd5e1', borderRadius: 4, padding: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#475569' }}>Received with thanks from</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 3 }}>{clientName}</div>
            {clientAddress && <div style={{ fontSize: '0.72rem', color: '#475569' }}>{clientAddress}</div>}
            {clientPhone && <div style={{ fontSize: '0.72rem', color: '#475569' }}>Ph: {clientPhone}</div>}
          </div>
          <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, padding: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '0.85rem', color: '#334155' }}>Amount Received</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{formatCurrency(payment.amount, currency)}</span>
            </div>
            {currency === 'INR' && (
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4, fontStyle: 'italic' }}>
                In words: {numberToWords(Number(payment.amount) || 0)}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#334155', marginBottom: '1rem' }}>
            <span>Invoice Total: <strong>{formatCurrency(Number(bill.totalAmount) || 0, currency)}</strong></span>
            <span>Total Paid: <strong>{formatCurrency(Number(bill.paidAmount) || 0, currency)}</strong></span>
            <span>
              {remaining < -0.005
                ? <>Overpaid: <strong style={{ color: '#059669' }}>{formatCurrency(Math.abs(remaining), currency)}</strong></>
                : <>Balance: <strong style={{ color: remaining > 0.005 ? '#dc2626' : '#059669' }}>{formatCurrency(Math.max(0, remaining), currency)}</strong></>}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', fontSize: '0.75rem', color: '#475569' }}>
            <div><div style={{ borderTop: '1px solid #94a3b8', paddingTop: 4, minWidth: 140, textAlign: 'center' }}>Customer Signature</div></div>
            <div><div style={{ borderTop: '1px solid #94a3b8', paddingTop: 4, minWidth: 140, textAlign: 'center' }}>For {businessName}</div></div>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.75rem' }}>
            This is a computer-generated receipt. Recorded on {new Date(payment.recordedAt || Date.now()).toLocaleString('en-IN')}.
          </div>
        </div>
      </div>
    </SideModal>
  );
};

export default ReceiptModal;
