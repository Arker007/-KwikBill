import React, { useState } from 'react';
import {
  QrCode,
  Barcode,
  Sliders,
  Printer,
  Sparkles,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { toast } from '@/shared/components/feedback/Toast';
import { Select } from '@/shared/components/ui/Select';

export const BarcodeSettingsView: React.FC = () => {
  const [barcodeType, setBarcodeType] = useState('code128');
  const [hardwarePrefix, setHardwarePrefix] = useState('');
  const [hardwareSuffix, setHardwareSuffix] = useState('Enter');
  const [labelPaper, setLabelPaper] = useState('sheet24');
  const [includeMRP, setIncludeMRP] = useState(true);
  const [includeBizName, setIncludeBizName] = useState(true);
  const [includeExpiry, setIncludeExpiry] = useState(false);
  const [autoAddScannedItem, setAutoAddScannedItem] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Barcode & label scanner settings saved!', 'success');
  };

  return (
    <div className="space-y-8" id="barcode-settings-view">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <Barcode className="w-5 h-5 text-[#1E61EB]" />
            <span>Barcode &amp; QR Label Settings</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure USB/Bluetooth hardware barcode scanners, symbology (CODE-128, EAN-13, QR), and label sticker sheet layouts.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hardware Scanner Config */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
            <Sliders className="w-4 h-4 text-gray-500" />
            <span>Hardware Barcode Scanner Interface</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Select
                label="Barcode Symbology"
                value={barcodeType}
                onChange={(e: any) => {
                  const val = typeof e === 'object' && e?.target ? e.target.value : e;
                  setBarcodeType(val);
                }}
                options={[
                  { value: 'code128', label: 'CODE-128 (Alphanumeric SKU & Serial)' },
                  { value: 'ean13', label: 'EAN-13 (Standard 13-digit Retail UPC)' },
                  { value: 'qr', label: '2D QR Code (Product + Batch URL)' },
                  { value: 'code39', label: 'CODE-39 (Industrial & Logistics)' },
                ]}
              />
            </div>

            <div>
              <Select
                label="Scanner Terminator Key"
                value={hardwareSuffix}
                onChange={(e: any) => {
                  const val = typeof e === 'object' && e?.target ? e.target.value : e;
                  setHardwareSuffix(val);
                }}
                options={[
                  { value: 'Enter', label: 'Enter Key (Standard POS Gun)' },
                  { value: 'Tab', label: 'Tab Key' },
                  { value: 'None', label: 'None (Fixed length timer)' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Scanner Prefix (Optional)</label>
              <input
                type="text"
                value={hardwarePrefix}
                onChange={(e) => setHardwarePrefix(e.target.value)}
                placeholder="e.g. # or @"
                className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center space-x-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={autoAddScannedItem}
                onChange={(e) => setAutoAddScannedItem(e.target.checked)}
                className="w-4 h-4 text-[#1E61EB] rounded focus:ring-0"
              />
              <span className="text-gray-700 font-medium">
                Auto-increment quantity by +1 when scanning the same barcode in Invoice / POS mode
              </span>
            </label>
          </div>
        </div>

        {/* Product Label Sticker Generator */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
            <Tag className="w-4 h-4 text-gray-500" />
            <span>Product Sticker &amp; Label Sheet Layout</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Select
                label="Label Paper Sheet Size"
                value={labelPaper}
                onChange={(e: any) => {
                  const val = typeof e === 'object' && e?.target ? e.target.value : e;
                  setLabelPaper(val);
                }}
                options={[
                  { value: 'sheet24', label: 'A4 Sheet - 24 Labels (63.5 × 33.9 mm)' },
                  { value: 'sheet48', label: 'A4 Sheet - 48 Labels (48.5 × 25.4 mm)' },
                  { value: 'sheet65', label: 'A4 Sheet - 65 Labels (38.1 × 21.2 mm)' },
                  { value: 'roll', label: 'Continuous Thermal Barcode Roll (50 × 25 mm)' },
                ]}
              />
            </div>

            <div className="space-y-2 pt-1">
              <label className="block text-xs font-medium text-gray-700">Information on Label:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeBizName}
                    onChange={(e) => setIncludeBizName(e.target.checked)}
                    className="w-4 h-4 text-[#1E61EB] rounded focus:ring-0"
                  />
                  <span className="text-gray-700">Company Name</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeMRP}
                    onChange={(e) => setIncludeMRP(e.target.checked)}
                    className="w-4 h-4 text-[#1E61EB] rounded focus:ring-0"
                  />
                  <span className="text-gray-700">MRP &amp; Selling Price</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeExpiry}
                    onChange={(e) => setIncludeExpiry(e.target.checked)}
                    className="w-4 h-4 text-[#1E61EB] rounded focus:ring-0"
                  />
                  <span className="text-gray-700">Expiry / Mfg Date</span>
                </label>
              </div>
            </div>
          </div>

          {/* Live Label Sticker Preview */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-gray-600 block mb-2">Live Barcode Sticker Preview:</span>
            <div className="inline-block p-3 border border-gray-300 rounded bg-white shadow-2xs text-center space-y-1 w-48">
              {includeBizName && (
                <div className="text-[9px] font-bold text-gray-800 uppercase tracking-tight">Vishal Enterprise</div>
              )}
              <div className="text-[10px] font-semibold text-gray-900 truncate">Premium Organic Green Tea</div>
              <div className="py-1 flex justify-center">
                <div className="font-mono text-xl tracking-widest font-black text-black">||| | |||| | |||</div>
              </div>
              <div className="text-[9px] font-mono text-gray-600">TEA-GRN-250G</div>
              {includeMRP && (
                <div className="text-[10px] font-bold text-[#1E61EB]">MRP: ₹ 450.00 (Incl. Taxes)</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#1E61EB] hover:bg-[#174ec4] text-white text-xs font-semibold py-2 px-5 rounded-md transition-colors shadow-sm"
          >
            Save Barcode Preferences
          </button>
        </div>
      </form>
    </div>
  );
};

export default BarcodeSettingsView;
