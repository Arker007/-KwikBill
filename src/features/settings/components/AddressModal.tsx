import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SwipeAddressItem } from '../types';
import { GST_STATE_CODES, INDIAN_STATES } from '../../../shared/constants/indianStates';
import { Select } from '@/shared/components/ui/Select';

interface AddressModalProps {
  isOpen: boolean;
  type: 'billing' | 'shipping';
  initialData?: SwipeAddressItem | null;
  onClose: () => void;
  onSave: (address: SwipeAddressItem) => void;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  type,
  initialData,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<SwipeAddressItem>({
    id: '',
    type: 'billing',
    title: '',
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    stateCode: '',
    pincode: '',
    country: 'India',
    isDefault: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: `addr-${Date.now()}`,
        type,
        title: '',
        name: '',
        line1: '',
        line2: '',
        city: '',
        state: 'Gujarat',
        stateCode: '24',
        pincode: '',
        country: 'India',
        isDefault: false,
      });
    }
  }, [initialData, type, isOpen]);

  if (!isOpen) return null;

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStateName = e.target.value;
    setFormData(prev => ({
      ...prev,
      state: selectedStateName,
      stateCode: GST_STATE_CODES[selectedStateName.toLowerCase()] || prev.stateCode,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.line1.trim()) return;
    onSave(formData);
    onClose();
  };

  const isBilling = type === 'billing';

  return (
    <div
      id="address-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
    >
      <div
        id="address-modal-container"
        className="w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">
            {initialData ? 'Edit' : 'Add'}{' '}
            {isBilling ? 'Billing Address' : 'Shipping Address'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {!isBilling && (
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Location / Consignee Name :
              </label>
              <input
                type="text"
                value={formData.name || formData.title || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    name: e.target.value,
                    title: e.target.value,
                  }))
                }
                placeholder="e.g. Vishal Enterprise"
                className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              <span className="text-red-500 font-bold">*</span> Address Line 1 (Plot / Street / Building) :
            </label>
            <input
              required
              type="text"
              value={formData.line1}
              onChange={e =>
                setFormData(prev => ({ ...prev, line1: e.target.value }))
              }
              placeholder="e.g. PLOT NO. 1706/06"
              className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Address Line 2 (Area / Landmark) :
            </label>
            <input
              type="text"
              value={formData.line2 || ''}
              onChange={e =>
                setFormData(prev => ({ ...prev, line2: e.target.value }))
              }
              placeholder="e.g. South 9 Road, G.I.D.C, Ankleshwar"
              className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                City :
              </label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={e =>
                  setFormData(prev => ({ ...prev, city: e.target.value }))
                }
                placeholder="e.g. Bharuch"
                className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Pincode :
              </label>
              <input
                type="text"
                value={formData.pincode || ''}
                onChange={e =>
                  setFormData(prev => ({ ...prev, pincode: e.target.value }))
                }
                placeholder="e.g. 393002"
                maxLength={10}
                className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Select
                label="State :"
                value={formData.state || ''}
                onChange={(e: any) => {
                  const val = typeof e === 'object' && e?.target ? e.target.value : e;
                  setFormData(prev => ({
                    ...prev,
                    state: val,
                    stateCode: GST_STATE_CODES[String(val).toLowerCase()] || prev.stateCode,
                  }));
                }}
                placeholder="Select State"
                options={[
                  { value: '', label: 'Select State' },
                  ...INDIAN_STATES.map(s => ({
                    value: s,
                    label: `${GST_STATE_CODES[s.toLowerCase()] || '--'} - ${s}`,
                  })),
                ]}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Country :
              </label>
              <input
                type="text"
                value={formData.country || 'India'}
                onChange={e =>
                  setFormData(prev => ({ ...prev, country: e.target.value }))
                }
                className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs bg-gray-50 focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {isBilling && (
            <div className="pt-2 flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-default-addr"
                checked={!!formData.isDefault}
                onChange={e =>
                  setFormData(prev => ({ ...prev, isDefault: e.target.checked }))
                }
                className="rounded border-gray-300 text-[#1E61EB] focus:ring-0"
              />
              <label htmlFor="is-default-addr" className="text-gray-700 cursor-pointer">
                Set as default billing address
              </label>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-[#1E61EB] hover:bg-[#174ec4] text-white font-medium text-xs shadow-xs transition-colors"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;
