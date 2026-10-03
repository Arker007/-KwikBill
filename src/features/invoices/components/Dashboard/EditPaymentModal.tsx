import { SideModal, Button, Input, Select, DatePicker } from "@/shared/components/ui";
import React from 'react';
import { formatCurrency } from '@/shared/utils';
import { EditPaymentModalState } from './types';

interface EditPaymentModalProps {
  modalState: EditPaymentModalState;
  onClose: () => void;
  onFormChange: (updater: (prev: EditPaymentModalState) => EditPaymentModalState) => void;
  onSave: () => void;
}

export const EditPaymentModal: React.FC<EditPaymentModalProps> = ({
  modalState,
  onClose,
  onFormChange,
  onSave,
}) => {
  return (
    <SideModal
      isOpen={true}
      onClose={onClose}
      title="Edit Payment"
      maxWidthClass="max-w-md"
      actions={
        <Button id="btn-save-edit-payment" variant="primary" onClick={onSave}>
          Save changes
        </Button>
      }
    >
      <div className="p-6 overflow-y-auto flex-1">
        <p className="text-slate-600 dark:text-slate-400 text-xs mb-3">
          Invoice: <strong>{modalState.bill.invoiceNumber}</strong>
          {' '}| Total: <strong>{formatCurrency(modalState.bill.totalAmount, modalState.bill.currency)}</strong>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="input-edit-payment-amount"
            label="Amount"
            type="number"
            value={modalState.form.amount}
            onChange={e => onFormChange(prev => ({ ...prev, form: { ...prev.form, amount: e.target.value } }))}
            min="0"
            step="0.01"
          />
          <DatePicker
            id="input-edit-payment-date"
            label="Date"
            value={modalState.form.date}
            onChange={e => onFormChange(prev => ({ ...prev, form: { ...prev.form, date: e.target.value } }))}
          />
          <Select
            id="select-edit-payment-mode"
            label="Mode"
            value={modalState.form.mode}
            onChange={e => onFormChange(prev => ({ ...prev, form: { ...prev.form, mode: e.target.value } }))}
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
            id="input-edit-payment-note"
            label="Note / reference"
            type="text"
            value={modalState.form.note}
            onChange={e => onFormChange(prev => ({ ...prev, form: { ...prev.form, note: e.target.value } }))}
            placeholder="Transaction ID, ref..."
          />
        </div>
      </div>
    </SideModal>
  );
};

export default EditPaymentModal;

