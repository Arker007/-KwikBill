import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, Upload, Trash2, Check } from 'lucide-react';
import { BusinessProfileData, SwipeAddressItem } from '@/features/settings/types';
import { AddressCard } from './AddressCard';
import { AddressModal } from '@/features/settings/components/AddressModal';
import { Select } from '@/shared/components/ui/Select';

export interface CompanyDetailsViewProps {
  profile: BusinessProfileData;
  setProfile: React.Dispatch<React.SetStateAction<BusinessProfileData>>;
  onSave: (updatedProfile: BusinessProfileData) => Promise<void>;
  saving?: boolean;
  handleImageUpload?: (
    field: 'logo' | 'signature',
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  removeImage?: (field: 'logo' | 'signature') => void;
  logoInputRef?: React.RefObject<HTMLInputElement | null>;
}

export const CompanyDetailsView: React.FC<CompanyDetailsViewProps> = ({
  profile,
  setProfile,
  onSave,
  saving = false,
  handleImageUpload,
  removeImage,
  logoInputRef: externalLogoInputRef,
}) => {
  const internalLogoInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = externalLogoInputRef || internalLogoInputRef;

  const [formData, setFormData] = useState<BusinessProfileData>(profile);

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [modalAddressType, setModalAddressType] = useState<'billing' | 'shipping'>('billing');
  const [editingAddress, setEditingAddress] = useState<SwipeAddressItem | null>(null);

  const [showCustomFieldInput, setShowCustomFieldInput] = useState(false);
  const [newCustomKey, setNewCustomKey] = useState('');
  const [newCustomVal, setNewCustomVal] = useState('');

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const billingAddresses: SwipeAddressItem[] =
    formData.billingAddresses && formData.billingAddresses.length > 0
      ? formData.billingAddresses
      : [
          {
            id: 'addr-default-billing',
            type: 'billing',
            title: formData.businessName || 'Main Office',
            line1: formData.address || 'PLOT NO. 1706/06',
            line2: 'South 9 Road, G.I.D.C, Ankleshwar',
            city: formData.city || 'Bharuch',
            state: formData.state || 'GUJARAT',
            stateCode: formData.stateCode || '24',
            pincode: formData.pincode || '393002',
            country: formData.country || 'India',
            isDefault: true,
          },
        ];

  const shippingAddresses: SwipeAddressItem[] =
    formData.shippingAddresses && formData.shippingAddresses.length > 0
      ? formData.shippingAddresses
      : [
          {
            id: 'addr-default-shipping-1',
            type: 'shipping',
            name: formData.companyName || formData.businessName || 'Vishal Enterprise',
            line1: 'Plot No. 1706/7, GIDC Estate, Ankleshwar',
            city: formData.city || 'Bharuch',
            state: formData.state || 'GUJARAT',
            stateCode: formData.stateCode || '24',
            pincode: formData.pincode || '393002',
            country: 'India',
          },
          {
            id: 'addr-default-shipping-2',
            type: 'shipping',
            name: 'Bhavya Road Lines',
            line1: 'Plot No-A-1/3619, Nr. Swastik Coumpound, Opp - ETL, GIDC',
            city: 'Bharuch',
            state: 'GUJARAT',
            stateCode: '24',
            pincode: '393002',
            country: 'India',
          },
        ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'companyName' || name === 'brandName'
        ? { businessName: value }
        : {}),
    }));
  };

  const handleFetchGstin = () => {
    const raw = (formData.gstin || '').trim().toUpperCase();
    if (raw.length >= 15) {
      const stateCode = raw.substring(0, 2);
      const pan = raw.substring(2, 12);
      setFormData(prev => ({
        ...prev,
        gstin: raw,
        stateCode: stateCode,
        pan: pan,
      }));
    }
  };

  const handleOpenAddAddress = (type: 'billing' | 'shipping') => {
    setModalAddressType(type);
    setEditingAddress(null);
    setAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: SwipeAddressItem) => {
    setModalAddressType(addr.type);
    setEditingAddress(addr);
    setAddressModalOpen(true);
  };

  const handleSaveAddress = (address: SwipeAddressItem) => {
    if (address.type === 'billing') {
      const currentList = [...billingAddresses];
      const existingIdx = currentList.findIndex(a => a.id === address.id);
      let updated: SwipeAddressItem[];
      if (existingIdx >= 0) {
        updated = currentList.map(a => (a.id === address.id ? address : a));
      } else {
        updated = [...currentList, address];
      }
      if (address.isDefault) {
        updated = updated.map(a => ({
          ...a,
          isDefault: a.id === address.id,
        }));
      }
      setFormData(prev => ({ ...prev, billingAddresses: updated }));
    } else {
      const currentList = [...shippingAddresses];
      const existingIdx = currentList.findIndex(a => a.id === address.id);
      let updated: SwipeAddressItem[];
      if (existingIdx >= 0) {
        updated = currentList.map(a => (a.id === address.id ? address : a));
      } else {
        updated = [...currentList, address];
      }
      setFormData(prev => ({ ...prev, shippingAddresses: updated }));
    }
  };

  const handleDeleteAddress = (id: string, type: 'billing' | 'shipping') => {
    if (type === 'billing') {
      setFormData(prev => ({
        ...prev,
        billingAddresses: billingAddresses.filter(a => a.id !== id),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        shippingAddresses: shippingAddresses.filter(a => a.id !== id),
      }));
    }
  };

  const handleCopyToShipping = (addr: SwipeAddressItem) => {
    const newShippingItem: SwipeAddressItem = {
      ...addr,
      id: `addr-ship-${Date.now()}`,
      type: 'shipping',
      name: formData.brandName || formData.businessName || 'Default Branch',
      isDefault: false,
    };
    setFormData(prev => ({
      ...prev,
      shippingAddresses: [...shippingAddresses, newShippingItem],
    }));
  };

  const handleSetDefaultBilling = (id: string) => {
    const updated = billingAddresses.map(a => ({
      ...a,
      isDefault: a.id === id,
    }));
    setFormData(prev => ({ ...prev, billingAddresses: updated }));
  };

  const handleAddCustomField = () => {
    if (!newCustomKey.trim()) return;
    const currentFields = formData.customFields || [];
    const newField = {
      id: `cf-${Date.now()}`,
      key: newCustomKey.trim(),
      value: newCustomVal.trim(),
    };
    setFormData(prev => ({
      ...prev,
      customFields: [...currentFields, newField],
    }));
    setNewCustomKey('');
    setNewCustomVal('');
    setShowCustomFieldInput(false);
  };

  const handleRemoveCustomField = (id: string) => {
    const currentFields = formData.customFields || [];
    setFormData(prev => ({
      ...prev,
      customFields: currentFields.filter(f => f.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(formData);
    await onSave(formData);
  };

  return (
    <div className="w-full max-w-5xl">
      <h1
        id="swipe-page-heading"
        className="text-xl font-bold text-gray-900 mb-8 tracking-tight"
      >
        Company Details
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-start gap-4 mb-6">
        <label className="text-xs font-normal text-gray-800 pt-2">
          Company Logo :
        </label>
        <div>
          <div className="relative group w-24 h-24 border border-gray-200 rounded-lg p-2 flex flex-col items-center justify-center bg-white shadow-2xs hover:shadow-xs transition-shadow">
            {formData.logo ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <img
                  src={formData.logo}
                  alt="Company Logo"
                  className="max-h-16 max-w-full object-contain"
                />
                {removeImage && (
                  <button
                    type="button"
                    onClick={() => removeImage('logo')}
                    className="absolute -top-1 -right-1 bg-white border border-gray-200 rounded-full p-0.5 text-red-500 shadow-xs hover:bg-red-50"
                    title="Remove Logo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : (
              <div
                className="cursor-pointer flex flex-col items-center justify-center"
                onClick={() => logoInputRef.current?.click()}
              >
                <div className="relative w-16 h-12 flex items-center justify-center">
                  <svg
                    className="w-full h-full"
                    fill="none"
                    viewBox="0 0 160 120"
                    role="img"
                    aria-label="Current invoice logo"
                  >
                    <path d="M 5,5 L 38,92 L 56,10 L 42,10 L 38,65 L 20,5 Z" fill="#1b4d3e" />
                    <path d="M 18,5 L 38,92 L 72,5 L 54,5 L 38,62 L 32,5 Z" fill="#8bc34a" />
                    <path
                      d="M 50,12 L 140,12 L 140,32 L 75,32 L 75,44 L 128,44 L 128,62 L 75,62 L 75,76 L 142,76 L 142,96 L 50,96 Z"
                      fill="#1b4d3e"
                    />
                    <path d="M 50,12 L 140,12 L 140,28 L 75,28 L 50,12 Z" fill="#8bc34a" />
                    <path d="M 75,44 L 128,44 L 128,58 L 75,58 Z" fill="#8bc34a" />
                    <text x="2" y="114" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill="#8bc34a">
                      VISHAL
                    </text>
                    <text x="56" y="114" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill="#1b4d3e">
                      ENTERPRISE
                    </text>
                  </svg>
                </div>
              </div>
            )}

            <input
              ref={logoInputRef as React.RefObject<HTMLInputElement>}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                if (handleImageUpload) {
                  handleImageUpload('logo', e);
                } else if (e.target.files && e.target.files[0]) {
                  const reader = new FileReader();
                  reader.onload = ev => {
                    const result = ev.target?.result as string;
                    setFormData(prev => ({ ...prev, logo: result }));
                  };
                  reader.readAsDataURL(e.target.files[0]);
                }
              }}
            />

            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="mt-1 text-[9px] text-[#1E61EB] hover:underline flex items-center space-x-0.5"
            >
              <Upload className="w-2.5 h-2.5" />
              <span>Change</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
          <label className="text-xs text-gray-800" htmlFor="brand-name">
            <span className="text-red-500 font-bold">*</span>Brand Name :
          </label>
          <input
            required
            id="brand-name"
            name="brandName"
            type="text"
            value={formData.brandName ?? formData.businessName ?? ''}
            onChange={handleInputChange}
            placeholder="e.g. Vishal Enterprise"
            className="w-full h-9 rounded border border-gray-200 text-xs px-3 focus:outline-none focus:border-black"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
          <label className="text-xs text-gray-800" htmlFor="company-name">
            <span className="text-red-500 font-bold">*</span>Company Name :
          </label>
          <input
            required
            id="company-name"
            name="companyName"
            type="text"
            value={formData.companyName ?? formData.businessName ?? ''}
            onChange={handleInputChange}
            placeholder="e.g. VISHAL ENTERPRISE"
            className="w-full h-9 rounded border border-gray-200 text-xs px-3 focus:outline-none focus:border-black"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
          <label className="text-xs text-gray-800" htmlFor="company-phone">
            Company Phone :
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative w-24 shrink-0">
              <button
                type="button"
                className="w-full h-9 bg-white border border-gray-200 rounded px-2.5 flex items-center justify-between text-xs text-gray-700"
              >
                <span>+91</span>
                <svg
                  className="w-3.5 h-3.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19 9l-7 7-7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>
            <input
              id="company-phone"
              name="phone"
              type="text"
              value={formData.phone ?? ''}
              onChange={handleInputChange}
              placeholder="e.g. 9898686379"
              className="flex-1 h-9 rounded border border-gray-200 text-xs px-3 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
          <label className="text-xs text-gray-800" htmlFor="company-email">
            Company Email :
          </label>
          <input
            id="company-email"
            name="email"
            type="email"
            value={formData.email ?? ''}
            onChange={handleInputChange}
            placeholder="e.g. Info@vishalenterpriseank.com"
            className="w-full h-9 rounded border border-gray-200 text-xs px-3 focus:outline-none focus:border-black"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
          <label className="text-xs text-gray-800" htmlFor="gstin">
            GSTIN :
          </label>
          <div className="flex items-center space-x-2">
            <input
              id="gstin"
              name="gstin"
              type="text"
              value={formData.gstin ?? ''}
              onChange={e => {
                const upper = e.target.value.toUpperCase();
                setFormData(prev => ({
                  ...prev,
                  gstin: upper,
                  ...(upper.length >= 15 ? { pan: upper.substring(2, 12) } : {}),
                }));
              }}
              maxLength={15}
              placeholder="e.g. 24AXCPS0336E1ZV"
              className="flex-1 h-9 rounded border border-gray-200 text-xs px-3 uppercase font-mono tracking-wide focus:outline-none focus:border-black"
            />
            <button
              type="button"
              onClick={handleFetchGstin}
              className="h-9 px-4 rounded border border-gray-200 bg-white hover:bg-gray-50 text-xs font-normal text-gray-700 transition-colors shrink-0 active:bg-gray-100"
            >
              Fetch Details
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
          <label className="text-xs text-gray-800" htmlFor="business-type">
            Business Type :
          </label>
          <div>
            <Select
              id="business-type"
              name="businessType"
              value={formData.businessType ?? ''}
              onChange={(e: any) => {
                const val = typeof e === 'object' && e?.target ? e.target.value : e;
                setFormData(prev => ({
                  ...prev,
                  businessType: val,
                }));
              }}
              placeholder="Select Business Type"
              options={[
                { value: '', label: 'Select Business Type' },
                { value: 'retail', label: 'Retail' },
                { value: 'wholesale', label: 'Wholesale' },
                { value: 'manufacturing', label: 'Manufacturing' },
                { value: 'services', label: 'Services' },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
          <label className="text-xs text-gray-800" htmlFor="alt-phone">
            Alternative Contact Number :
          </label>
          <input
            id="alt-phone"
            name="altPhone"
            type="text"
            value={formData.altPhone ?? ''}
            onChange={handleInputChange}
            placeholder="Alternate contact numbers"
            className="w-full h-9 rounded border border-gray-200 text-xs px-3 placeholder-gray-400 focus:outline-none focus:border-black"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
          <label className="text-xs text-gray-800" htmlFor="website">
            Website :
          </label>
          <input
            id="website"
            name="website"
            type="text"
            value={formData.website ?? ''}
            onChange={handleInputChange}
            placeholder="e.g. www.vishalenterprises.in"
            className="w-full h-9 rounded border border-gray-200 text-xs px-3 focus:outline-none focus:border-black"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
          <label className="text-xs text-gray-800" htmlFor="pan-number">
            PAN Number :
          </label>
          <input
            id="pan-number"
            name="pan"
            type="text"
            value={formData.pan ?? ''}
            onChange={e =>
              setFormData(prev => ({ ...prev, pan: e.target.value.toUpperCase() }))
            }
            maxLength={10}
            placeholder="e.g. AXCPS0336E"
            className="w-full h-9 rounded border border-gray-200 text-xs px-3 uppercase font-mono placeholder-gray-400 focus:outline-none focus:border-black"
          />
        </div>

        <div className="w-full bg-[#F5F5F5] rounded-md px-4 py-2.5 my-8 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-900">Custom Fields</span>
          <button
            type="button"
            onClick={() => setShowCustomFieldInput(prev => !prev)}
            className="flex items-center text-xs font-medium text-gray-900 hover:text-[#1E61EB] space-x-1 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-[#1E61EB]" />
            <span>Custom Fields</span>
          </button>
        </div>

        {((formData.customFields && formData.customFields.length > 0) ||
          showCustomFieldInput) && (
          <div className="mb-6 space-y-2">
            {(formData.customFields || []).map(f => (
              <div
                key={f.id}
                className="flex items-center justify-between p-2.5 rounded bg-gray-50 border border-gray-100 text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-800">{f.key}:</span>
                  <span className="text-gray-600">{f.value}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCustomField(f.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {showCustomFieldInput && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50/50 rounded border border-blue-100 text-xs">
                <input
                  type="text"
                  placeholder="Field Name (e.g. CIN, MSME)"
                  value={newCustomKey}
                  onChange={e => setNewCustomKey(e.target.value)}
                  className="h-8 px-2 rounded border border-gray-200 text-xs bg-white focus:outline-none focus:border-black"
                />
                <input
                  type="text"
                  placeholder="Field Value"
                  value={newCustomVal}
                  onChange={e => setNewCustomVal(e.target.value)}
                  className="h-8 px-2 rounded border border-gray-200 text-xs bg-white flex-1 focus:outline-none focus:border-black"
                />
                <button
                  type="button"
                  onClick={handleAddCustomField}
                  className="h-8 px-3 rounded bg-[#1E61EB] text-white font-medium text-xs flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xs font-semibold text-gray-900 mb-3">
            Billing Details
          </h2>

          {billingAddresses.map(addr => (
            <AddressCard
              key={addr.id}
              id={addr.id}
              type="billing"
              line1={addr.line1}
              line2={addr.line2}
              city={addr.city}
              state={addr.state}
              stateCode={addr.stateCode}
              pincode={addr.pincode}
              country={addr.country}
              isDefault={addr.isDefault}
              onEdit={() => handleOpenEditAddress(addr)}
              onDelete={() => handleDeleteAddress(addr.id, 'billing')}
              onCopyToShipping={() => handleCopyToShipping(addr)}
              onSetDefault={() => handleSetDefaultBilling(addr.id)}
            />
          ))}

          <button
            type="button"
            onClick={() => handleOpenAddAddress('billing')}
            className="flex items-center text-xs font-semibold text-[#F43F5E] hover:text-[#E11D48] space-x-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-[#F43F5E]" />
            <span>Billing Address</span>
          </button>
        </div>

        <div className="mb-10">
          <h2 className="text-xs font-semibold text-gray-900 mb-3">
            Shipping Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mb-3">
            {shippingAddresses.map(addr => (
              <AddressCard
                key={addr.id}
                id={addr.id}
                type="shipping"
                name={addr.name || addr.title}
                line1={addr.line1}
                line2={addr.line2}
                city={addr.city}
                state={addr.state}
                stateCode={addr.stateCode}
                pincode={addr.pincode}
                country={addr.country}
                onEdit={() => handleOpenEditAddress(addr)}
                onDelete={() => handleDeleteAddress(addr.id, 'shipping')}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleOpenAddAddress('shipping')}
            className="flex items-center text-xs font-semibold text-[#F43F5E] hover:text-[#E11D48] space-x-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-[#F43F5E]" />
            <span>Shipping Address</span>
          </button>
        </div>

        <div className="pt-2">
          <button
            id="swipe-save-update-btn"
            type="submit"
            disabled={saving}
            className="bg-[#1E61EB] hover:bg-[#174ec4] active:bg-[#133fa8] text-white font-medium text-xs py-2.5 px-6 rounded-md shadow transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save & Update'}
          </button>
        </div>
      </form>

      <AddressModal
        isOpen={addressModalOpen}
        type={modalAddressType}
        initialData={editingAddress}
        onClose={() => setAddressModalOpen(false)}
        onSave={handleSaveAddress}
      />
    </div>
  );
};

export default CompanyDetailsView;
