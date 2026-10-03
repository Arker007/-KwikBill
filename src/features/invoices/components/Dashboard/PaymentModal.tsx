import { SideModal, Button, Input, Select, DatePicker } from "@/shared/components/ui";
import React from 'react';
import { Receipt, Edit3, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/shared/utils';
import { DashboardBill, DashboardPaymentItem } from './types';

interface PaymentModalProps {
  bill: DashboardBill;
  paymentInput: {
    amount: string;
    date: string;
    mode: string;
    note: string;
  };
  onClose: () => void;
  onInputChange: (field: string, value: string) => void;
  onRecordPayment: () => void;
  onOpenReceipt: (bill: DashboardBill, payment: DashboardPaymentItem) => void;
  onEditPayment: (bill: DashboardBill, index: number) => void;
  onDeletePayment: (bill: DashboardBill, index: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  bill,
  paymentInput,
  onClose,
  onInputChange,
  onRecordPayment,
  onOpenReceipt,
  onEditPayment,
  onDeletePayment,
}) => {
  const rem = bill.totalAmount - (bill.paidAmount || 0);

  return (
    <SideModal
      isOpen={true}
      onClose={onClose}
      title="Record Payment"
      maxWidthClass="max-w-xl"
      actions={
        <Button id="btn-submit-record-payment" variant="primary" onClick={onRecordPayment}>
          Record Payment
        </Button>
      }
    >
      <div className="p-6 overflow-y-auto flex-1">
        <p className="text-slate-600 dark:text-slate-400 text-xs mb-4">
          Invoice: <strong>{bill.invoiceNumber}</strong> | Total: <strong>{formatCurrency(bill.totalAmount, bill.currency)}</strong>
          {(bill.paidAmount || 0) > 0 && <> | Paid: <strong>{formatCurrency(bill.paidAmount, bill.currency)}</strong></>}
          {' '}| {(() => {
            if (rem < -0.005) {
              return <>Overpaid: <strong className="text-sky-600">{formatCurrency(Math.abs(rem), bill.currency)}</strong></>;
            }
            return <>Balance: <strong className={rem > 0.005 ? 'text-red-600' : 'text-emerald-600'}>{formatCurrency(Math.max(0, rem), bill.currency)}</strong></>;
          })()}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="input-record-payment-amount"
            label="Amount Received"
            type="number"
            value={paymentInput.amount}
            onChange={e => onInputChange('amount', e.target.value)}
            placeholder={String(bill.totalAmount - (bill.paidAmount || 0))}
            min="0"
          />
          <DatePicker
            id="input-record-payment-date"
            label="Payment Date"
            value={paymentInput.date}
            onChange={e => onInputChange('date', e.target.value)}
          />
          <Select
            id="select-record-payment-mode"
            label="Payment Mode"
            value={paymentInput.mode}
            onChange={e => onInputChange('mode', e.target.value)}
            options={[
              { value: 'bank-transfer', label: 'Bank Transfer' },
              { value: 'upi', label: 'UPI' },
              { value: 'cash', label: 'Cash' },
              { value: 'cheque', label: 'Cheque' },
              { value: 'card', label: 'Card' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Input
            id="input-record-payment-note"
            label="Note (optional)"
            type="text"
            value={paymentInput.note}
            onChange={e => onInputChange('note', e.target.value)}
            placeholder="Transaction ID, ref..."
          />
        </div>

        {bill.payments && bill.payments.length > 0 && (
          <div className="mt-6">
            <label className="form-label block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Payment History</label>
            <div id="payment-history-list" className="space-y-2">
              {bill.payments.map((p, i) => (
                <div key={p.id || i} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a1a] flex items-center gap-2 text-xs flex-wrap">
                  <span className="min-w-[90px] text-slate-600 dark:text-slate-400">{p.date ? new Date(p.date).toLocaleDateString('en-IN') : '—'}</span>
                  <span className="font-bold min-w-[100px] text-slate-800 dark:text-slate-200">{formatCurrency(p.amount, bill.currency)}</span>
                  <span className="text-slate-500 dark:text-slate-400 min-w-[90px]">{p.mode}</span>
                  {p.note && <span className="text-slate-500 dark:text-slate-400 flex-1 truncate">· {p.note}</span>}
                  <div className="ml-auto flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Receipt size={12} />}
                      onClick={() => onOpenReceipt(bill, p)}
                      title="View / Print receipt for this payment"
                    >
                      Receipt
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Edit3 size={12} />}
                      onClick={() => onEditPayment(bill, i)}
                      title="Edit amount / date / mode / note"
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 size={12} />}
                      onClick={() => onDeletePayment(bill, i)}
                      title="Delete this payment"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </SideModal>
  );
};

export default PaymentModal;
