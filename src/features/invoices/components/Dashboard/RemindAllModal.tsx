import { SideModal, Button, EmptyState } from "@/shared/components/ui";
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { formatCurrency } from '@/shared/utils';
import { DashboardBill } from './types';

interface RemindAllModalProps {
  show: boolean;
  onClose: () => void;
  overdueBills: DashboardBill[];
  getClientPhone: (bill: DashboardBill) => string;
  onSendReminder: (bill: DashboardBill & { clientPhone?: string }) => void;
}

export const RemindAllModal: React.FC<RemindAllModalProps> = ({
  show,
  onClose,
  overdueBills,
  getClientPhone,
  onSendReminder,
}) => {
  if (!show) return null;

  return (
    <SideModal
      isOpen={show}
      onClose={onClose}
      title="Send Payment Reminders"
      maxWidthClass="max-w-xl"
    >
      <div className="p-6 overflow-y-auto flex-1">
        <p className="text-slate-600 dark:text-slate-400 text-xs mb-4">
          Click on a client below to send a WhatsApp payment reminder.
        </p>
        {overdueBills.length === 0 ? (
          <EmptyState
            title="No Overdue Invoices"
            description="All client invoices are fully settled or up to date."
          />
        ) : (
          <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800">
            {overdueBills.map(bill => {
              const phone = getClientPhone(bill);
              const outCur = bill.currency || bill.data?.invoiceOptions?.currency;
              const out = bill.totalAmount - (bill.paidAmount || 0);

              return (
                <div key={bill.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{bill.clientName}</span>
                    <span className="text-slate-500 dark:text-slate-400 ml-2">{bill.invoiceNumber}</span>
                    {(() => {
                      if (out < -0.005) {
                        return (
                          <span className="ml-2 font-semibold text-sky-600">
                            Overpaid {formatCurrency(Math.abs(out), outCur)}
                          </span>
                        );
                      }
                      return (
                        <span className="ml-2 font-semibold text-red-600">
                          {formatCurrency(Math.max(0, out), outCur)}
                        </span>
                      );
                    })()}
                    {phone && <span className="text-slate-400 dark:text-slate-500 ml-2">({phone})</span>}
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<MessageCircle size={13} />}
                    onClick={() => onSendReminder({ ...bill, clientPhone: phone })}
                  >
                    Remind
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SideModal>
  );
};

export default RemindAllModal;
