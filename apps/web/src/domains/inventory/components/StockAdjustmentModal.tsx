import React, { useState } from 'react';
import { Modal, Button, Input, Select } from '@/shared/components/ui';
import { Product } from '@/features/inventory/types';

export interface StockAdjustmentModalProps {
  show: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (productId: string, newStock: number, reason: string) => Promise<void>;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  show,
  product,
  onClose,
  onSave,
}) => {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'reduce' | 'set'>('add');
  const [quantity, setQuantity] = useState<string>('0');
  const [reason, setReason] = useState<string>('');
  const [saving, setSaving] = useState(false);

  if (!show || !product) return null;

  const currentStock = Number(product.stock) || 0;
  const qtyNum = Number(quantity) || 0;

  let calculatedStock = currentStock;
  if (adjustmentType === 'add') {
    calculatedStock = currentStock + qtyNum;
  } else if (adjustmentType === 'reduce') {
    calculatedStock = Math.max(0, currentStock - qtyNum);
  } else {
    calculatedStock = qtyNum;
  }

  const handleConfirm = async () => {
    try {
      setSaving(true);
      await onSave(product.id || '', calculatedStock, reason);
      onClose();
    } catch {
      // Handled by parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title={`Adjust Stock — ${product.name}`}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={saving}>
            {saving ? 'Saving...' : 'Apply Adjustment'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Current Stock:</span>
          <span className="font-bold text-gray-900 dark:text-gray-100">
            {currentStock} {product.unit || 'NOS'}
          </span>
        </div>

        <div>
          <Select
            label="Adjustment Type"
            value={adjustmentType}
            onChange={(e) => setAdjustmentType(e.target.value as any)}
            options={[
              { value: 'add', label: 'Add Stock (+)' },
              { value: 'reduce', label: 'Reduce Stock (-)' },
              { value: 'set', label: 'Set Exact Stock (=)' },
            ]}
          />
        </div>

        <div>
          <Input
            label="Quantity"
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
          />
        </div>

        <div>
          <Input
            label="Reason / Note"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Physical audit recount, Damaged goods"
          />
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between text-sm">
          <span className="text-blue-700 dark:text-blue-300 font-medium">New Stock Level:</span>
          <span className="font-bold text-blue-900 dark:text-blue-100">
            {calculatedStock} {product.unit || 'NOS'}
          </span>
        </div>
      </div>
    </Modal>
  );
};

export default StockAdjustmentModal;
