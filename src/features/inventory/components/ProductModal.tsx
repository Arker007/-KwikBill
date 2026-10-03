import React, { useState, useEffect } from 'react';
import { Lock, Plus, Wand2 } from 'lucide-react';
import { Product, ProductFormData, ProductItemType, TaxInclusiveMode } from '../types';

import { SideModal, Button, Input, Select, Textarea, Switch } from '@/shared/components/ui';

export interface ProductModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (formData: ProductFormData) => void;
  editingId: string | null;
  product?: Product | null;
  units: any[];
  categories?: string[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  show,
  onClose,
  onSave,
  editingId,
  product,
  units,
  categories = [],
}) => {
  const emptyForm: ProductFormData = {
    name: '',
    type: 'product',
    category: '',
    hsn: '',
    purchasePrice: '',
    sellingPrice: '',
    taxPercent: '18',
    taxType: 'exclusive',
    unit: 'NOS',
    stock: '0',
    barcode: '',
    description: '',
  };

  const [form, setForm] = useState<ProductFormData>({ ...emptyForm });

  useEffect(() => {
    if (show && product) {
      setForm({
        name: product.name || '',
        type: product.type || 'product',
        category: product.category || '',
        hsn: product.hsn || '',
        purchasePrice:
          product.purchasePrice !== undefined && product.purchasePrice !== null
            ? String(product.purchasePrice)
            : '',
        sellingPrice:
          product.sellingPrice !== undefined && product.sellingPrice !== null
            ? String(product.sellingPrice)
            : product.rate !== undefined && product.rate !== null
            ? String(product.rate)
            : '',
        taxPercent:
          product.taxPercent !== undefined && product.taxPercent !== null
            ? String(product.taxPercent)
            : '18',
        taxType: product.taxType || 'exclusive',
        unit: product.unit || 'NOS',
        stock:
          product.stock !== undefined && product.stock !== null ? String(product.stock) : '0',
        barcode: product.barcode || '',
        description: product.description || '',
      });
    } else if (show) {
      setForm({ ...emptyForm });
    }
  }, [show, product]);

  if (!show) return null;

  const updateField = (field: keyof ProductFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(form);
  };

  return (
    <SideModal
      isOpen={show}
      onClose={onClose}
      title={editingId ? 'Update Product' : 'Add New Product'}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="primary">
            {editingId ? 'Update Product' : 'Save Product'}
          </Button>
        </div>
      }
    >
      {/* Tabs */}
        <div className="flex items-center px-6 bg-white dark:bg-[#1f1f1f] border-b border-gray-200 dark:border-gray-800 text-sm overflow-x-auto shrink-0">
          <button className="px-4 py-3 text-blue-600 font-medium border-b-2 border-blue-600 whitespace-nowrap">Details</button>
          <button className="px-4 py-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 flex items-center gap-1 whitespace-nowrap">
            Price Lists <Lock size={14} />
          </button>
          <button className="px-4 py-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 whitespace-nowrap">Attachments</button>
          
          <div className="ml-auto pl-4 py-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 dark:text-gray-300 font-medium bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors whitespace-nowrap">
              <Plus size={14} /> Variants <Lock size={14} />
            </button>
          </div>
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Basic Details Section */}
          <div className="bg-white dark:bg-[#1f1f1f] rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Basic Details</h3>
               <button className="text-xs text-gray-500 flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                 <Plus size={12} /> Add Custom Fields
               </button>
            </div>

            <div className="space-y-5">
              {/* Product/Service Toggle */}
              <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button
                  onClick={() => updateField('type', 'product')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${form.type === 'product' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Product
                </button>
                <button
                  onClick={() => updateField('type', 'service')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${form.type === 'service' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Service
                </button>
              </div>

              {/* Product Name */}
              <div>
                <Input
                  label={<><span className="text-red-500 mr-0.5">*</span>Product Name</>}
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Enter product name"
                  inputSize="md"
                  containerClassName="mb-0"
                />
              </div>

              {/* Selling Price & Tax */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Selling Price
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={form.sellingPrice}
                        onChange={(e) => updateField('sellingPrice', e.target.value)}
                        prefix="₹"
                        placeholder="0.00"
                        min="0"
                        step="any"
                        inputSize="md"
                        containerClassName="mb-0"
                      />
                    </div>
                    <div className="w-36">
                      <Select
                        value={form.taxType || 'exclusive'}
                        onChange={(e) => updateField('taxType', e.target.value as TaxInclusiveMode)}
                        options={[
                          { value: 'exclusive', label: 'without Tax' },
                          { value: 'inclusive', label: 'with Tax' },
                        ]}
                        selectSize="md"
                        containerClassName="mb-0"
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {form.taxType === 'inclusive' ? 'Inclusive of Taxes' : 'Exclusive of Taxes'}
                  </p>
                </div>
                
                <div>
                  <Select
                    label="*Tax %"
                    value={form.taxPercent}
                    onChange={(e) => updateField('taxPercent', e.target.value)}
                    options={[
                      { value: '0', label: '0% (Nil / Exempt)' },
                      { value: '3', label: '3%' },
                      { value: '5', label: '5%' },
                      { value: '12', label: '12%' },
                      { value: '18', label: '18 Default (9% CGST & 9% SGST, 18% IGST)' },
                      { value: '28', label: '28%' },
                    ]}
                    selectSize="md"
                    containerClassName="mb-0"
                  />
                </div>
              </div>

              {/* Primary Unit & Alt Units */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <Select
                     label="Primary Unit"
                     value={form.unit}
                     onChange={(e) => updateField('unit', e.target.value)}
                     options={units.map((u) => ({ value: u.label, label: `${u.label} ${u.name || ''}` }))}
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                     Enable Alternative Units <Lock size={14} className="text-gray-400" />
                   </label>
                   <div className="flex items-center h-[38px]">
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">No</span>
                     </label>
                   </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Additional Information <span className="font-normal opacity-70">OPTIONAL</span></h3>
            <div className="bg-white dark:bg-[#1f1f1f] rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-5">
               
               {/* HSN/SAC & Purchase Price */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label={form.type === 'service' ? 'SAC' : 'HSN/SAC'}
                      type="text"
                      value={form.hsn}
                      onChange={(e) => updateField('hsn', e.target.value)}
                      placeholder="e.g. 9983"
                      inputSize="md"
                      containerClassName="mb-0"
                    />
                    <a href="https://cbic-gst.gov.in/gst-goods-service-rates.html" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 mt-1 inline-block hover:underline">Click here to check GST approved HSN/SAC codes.</a>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                      Purchase Price
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          type="number"
                          value={form.purchasePrice}
                          onChange={(e) => updateField('purchasePrice', e.target.value)}
                          prefix="₹"
                          placeholder="0.00"
                          min="0"
                          step="any"
                          inputSize="md"
                          containerClassName="mb-0"
                        />
                      </div>
                      <div className="w-36">
                        <Select
                          value={form.taxType || 'exclusive'}
                          onChange={(e) => updateField('taxType', e.target.value as TaxInclusiveMode)}
                          options={[
                            { value: 'exclusive', label: 'without Tax' },
                            { value: 'inclusive', label: 'with Tax' },
                          ]}
                          selectSize="md"
                          containerClassName="mb-0"
                        />
                      </div>
                    </div>
                  </div>
               </div>

               {/* Barcode & Category */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                      Barcode
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          type="text"
                          value={form.barcode}
                          onChange={(e) => updateField('barcode', e.target.value)}
                          placeholder="Barcode"
                          inputSize="md"
                          containerClassName="mb-0"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => updateField('barcode', String(Math.floor(100000000000 + Math.random() * 900000000000)))}
                        className="inline-flex items-center gap-1.5 px-3 h-[34px] rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
                      >
                        <Wand2 size={13} /> Auto Generate
                      </button>
                    </div>
                 </div>

                 <div>
                    <Input
                      label="Category"
                      type="text"
                      list="category-suggestions"
                      value={form.category}
                      onChange={(e) => updateField('category', e.target.value)}
                      placeholder="Select or enter Category"
                      inputSize="md"
                      containerClassName="mb-0"
                    />
                    <datalist id="category-suggestions">
                      {categories.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                 </div>
               </div>

               {/* Product Images */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Images & Videos
                  </label>
                  <button className="flex flex-col items-center justify-center w-24 h-24 border border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
                     <Plus size={20} className="mb-1" />
                     <span className="text-xs">Upload</span>
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                     Upload up to 10 files (3MB per image, 50MB per video).<br/>
                     Images: 1024x1024 recommended. Videos: 9:16 or 1:1 (min 1000x1000px).
                  </p>
               </div>

               {/* Description */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <div className="border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300">
                       <button className="font-bold hover:text-blue-600 px-1">B</button>
                       <button className="italic hover:text-blue-600 px-1">I</button>
                       <button className="underline hover:text-blue-600 px-1">U</button>
                       <button className="line-through hover:text-blue-600 px-1">S</button>
                       <span className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></span>
                       <button className="hover:text-blue-600 px-1">UL</button>
                       <button className="hover:text-blue-600 px-1">OL</button>
                    </div>
                    <textarea
                      value={form.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      className="w-full px-3 py-2 border-0 focus:ring-0 sm:text-sm bg-transparent text-gray-900 dark:text-gray-100 min-h-[80px]"
                      placeholder="Enter description..."
                    ></textarea>
                  </div>
                  <button className="mt-2 flex items-center gap-1 text-xs font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 px-2.5 py-1 rounded-md border border-purple-200 dark:border-purple-800 transition-colors">
                    <Wand2 size={12} /> AI
                  </button>
               </div>
            </div>
          </div>

          {/* Opening Stock Section */}
          <div className="space-y-2">
             <div className="flex items-center justify-between ml-1">
               <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Opening Stock <span className="font-normal opacity-70">OPTIONAL</span></h3>
               <button className="text-xs text-gray-500 flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                 <Lock size={12} /> Add batches
               </button>
             </div>

             <div className="bg-white dark:bg-[#1f1f1f] rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-800">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                       Opening Quantity
                     </label>
                     <div className="flex items-center gap-2">
                       <div className="flex-1">
                         <Input
                           type="number"
                           disabled={form.type === 'service'}
                           value={form.stock}
                           onChange={(e) => updateField('stock', e.target.value)}
                           placeholder="0"
                           min="0"
                           inputSize="md"
                           containerClassName="mb-0"
                         />
                       </div>
                       <span className="inline-flex items-center justify-center px-3 h-[34px] rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-medium shrink-0">
                         {form.unit || 'NOS'}
                       </span>
                     </div>
                     <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">*Quantity of the product available in your existing inventory</p>
                  </div>

                  <div>
                     <Input
                       label="Opening Purchase Price (with tax)"
                       type="number"
                       placeholder="0.00"
                       prefix="₹"
                       inputSize="md"
                       containerClassName="mb-0"
                     />
                  </div>

                  <div>
                     <Input
                       label="Opening Stock Value (with tax)"
                       type="number"
                       placeholder="0.00"
                       prefix="₹"
                       inputSize="md"
                       containerClassName="mb-0"
                     />
                  </div>
               </div>
             </div>
          </div>
          
          {/* Footer Info */}
          <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg shadow-sm border border-red-100 dark:border-red-900/30">
            <p className="text-xs text-red-500 dark:text-red-400">
              *Note: Any changes made will be applied to new documents and old documents won't be affected except for product HSN/SAC.
            </p>
          </div>
          
          {/* Bottom Button */}
          <div className="pb-4 flex items-center justify-end gap-3">
             <Button
                variant="default"
                onClick={onClose}
             >
                Cancel
             </Button>
             <Button
                variant="primary"
                onClick={handleSave}
             >
                {editingId ? 'Update Product' : 'Save Product'}
             </Button>
          </div>

        </div>
    </SideModal>
  );
};

export default ProductModal;
