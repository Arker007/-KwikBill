import React, { useState } from 'react';
import {
  Printer,
  TestTube,
  RotateCcw,
  Sliders,
  Type,
  FileText,
  QrCode,
  Check,
  Zap,
} from 'lucide-react';
import { toast } from '@/shared/components/feedback/Toast';
import { DEFAULT_PRINT_SETTINGS, getPrintSettings, savePrintSettings } from '@/features/invoices/utils/printSettings';
import { Select } from '@/shared/components/ui/Select';

export const ThermalPrintView: React.FC = () => {
  const [settings, setSettings] = useState<any>(getPrintSettings);

  const updateSetting = (patch: any) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    savePrintSettings(next);
  };

  const handleTestPrint = () => {
    toast('Test receipt sent to default printer queue!', 'success');
  };

  const handleResetDefaults = () => {
    setSettings({ ...DEFAULT_PRINT_SETTINGS });
    savePrintSettings({ ...DEFAULT_PRINT_SETTINGS });
    toast('Thermal print defaults restored', 'info');
  };

  return (
    <div className="space-y-8" id="thermal-print-view">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <Printer className="w-5 h-5 text-[#1E61EB]" />
            <span>Thermal POS &amp; Document Print Settings</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure POS thermal roll sizes (58mm/80mm), density, print typography, and auto-cut rules.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium py-1.5 px-3 rounded-md transition-colors flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleTestPrint}
            className="bg-[#1E61EB] hover:bg-[#174ec4] text-white text-xs font-semibold py-1.5 px-4 rounded-md transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <TestTube className="w-3.5 h-3.5" />
            <span>Test Print Receipt</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Print Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Paper Format Selector */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
              <FileText className="w-4 h-4 text-gray-500" />
              <span>Default Paper Format</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'thermal80', label: '3-inch (80mm)', desc: 'Standard POS Thermal' },
                { id: 'thermal58', label: '2-inch (58mm)', desc: 'Mini Mobile Thermal' },
                { id: 'a4', label: 'A4 Full Sheet', desc: 'Laser / Inkjet Standard' },
                { id: 'a5', label: 'A5 Half Sheet', desc: 'Compact Ledger Print' },
              ].map((p) => {
                const active = (settings.defaultPaperSize || 'thermal80') === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => updateSetting({ defaultPaperSize: p.id })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      active
                        ? 'border-[#1E61EB] bg-blue-50/40 ring-1 ring-[#1E61EB]/20 text-gray-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div className="font-bold text-xs">{p.label}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typography & Ink Darkness */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
              <Type className="w-4 h-4 text-gray-500" />
              <span>Thermal Receipt Typography</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Select
                  label="Font Family"
                  value={settings.fontFamily || 'mono'}
                  onChange={(e: any) => {
                    const val = typeof e === 'object' && e?.target ? e.target.value : e;
                    updateSetting({ fontFamily: val });
                  }}
                  options={[
                    { value: 'mono', label: 'Monospace (Receipt Sharp)' },
                    { value: 'sans', label: 'Sans-Serif (Modern Clean)' },
                  ]}
                />
              </div>

              <div>
                <Select
                  label="Font Weight"
                  value={settings.fontWeight || 'bold'}
                  onChange={(e: any) => {
                    const val = typeof e === 'object' && e?.target ? e.target.value : e;
                    updateSetting({ fontWeight: val });
                  }}
                  options={[
                    { value: 'normal', label: 'Regular' },
                    { value: 'bold', label: 'Bold (Recommended)' },
                    { value: 'ultra', label: 'Ultra Bold (Darkest)' },
                  ]}
                />
              </div>

              <div>
                <Select
                  label="Print Contrast"
                  value={settings.contrast || 'high'}
                  onChange={(e: any) => {
                    const val = typeof e === 'object' && e?.target ? e.target.value : e;
                    updateSetting({ contrast: val });
                  }}
                  options={[
                    { value: 'normal', label: 'Standard' },
                    { value: 'high', label: 'High Contrast (Dark)' },
                    { value: 'ultra', label: 'Max Ink Penetration' },
                  ]}
                />
              </div>
            </div>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={!!settings.allCaps}
                  onChange={(e) => updateSetting({ allCaps: e.target.checked })}
                  className="w-4 h-4 text-[#1E61EB] rounded focus:ring-0"
                />
                <span className="text-gray-700 font-medium">ALL CAPS Receipt Mode (Reliance / Mart Style)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={!!settings.autoPrintOnSave}
                  onChange={(e) => updateSetting({ autoPrintOnSave: e.target.checked })}
                  className="w-4 h-4 text-[#1E61EB] rounded focus:ring-0"
                />
                <span className="text-gray-700 font-medium">Auto-Print Receipt immediately on invoice save</span>
              </label>
            </div>
          </div>

          {/* Receipt Content Toggles */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
              <Sliders className="w-4 h-4 text-gray-500" />
              <span>Visible Content Fields</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { key: 'showLogo', label: 'Print Business Logo at Header' },
                { key: 'showHSN', label: 'Print HSN/SAC code per line item' },
                { key: 'showRateLine', label: 'Print "Qty × Rate" calculation row' },
                { key: 'showAmountWords', label: 'Print Grand Total in Words' },
                { key: 'showBankDetails', label: 'Print Bank Account Details' },
                { key: 'showUPI', label: 'Print Dynamic UPI Payment QR Code' },
                { key: 'cutMark', label: 'Print Scissors Cut Line (✂ Cut Here)' },
              ].map((f) => (
                <label key={f.key} className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={!!settings[f.key]}
                    onChange={(e) => updateSetting({ [f.key]: e.target.checked })}
                    className="w-4 h-4 text-[#1E61EB] rounded focus:ring-0"
                  />
                  <span className="text-gray-700">{f.label}</span>
                </label>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Receipt Footer Note</label>
              <input
                type="text"
                value={settings.footerMessage || ''}
                onChange={(e) => updateSetting({ footerMessage: e.target.value })}
                placeholder="e.g. Goods once sold will not be taken back. Thank you!"
                className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Live Mockup Preview */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider pb-2 border-b border-gray-100">
              Live Receipt Mockup (80mm)
            </h3>

            <div className="bg-amber-50/20 border border-dashed border-gray-300 rounded p-4 font-mono text-[11px] space-y-2 text-gray-800 shadow-inner">
              <div className="text-center font-bold text-xs pb-1 border-b border-gray-300 border-dashed">
                VISHAL ENTERPRISE
                <div className="text-[9px] font-normal text-gray-500">GSTIN: 24AABCU9603R1ZM</div>
              </div>

              <div className="flex justify-between text-[10px] text-gray-500">
                <span>INV-2025-001</span>
                <span>20-Sep-2026</span>
              </div>

              <div className="border-t border-b border-gray-300 border-dashed py-1.5 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>ITEM</span>
                  <span>AMT (₹)</span>
                </div>
                <div className="flex justify-between">
                  <span>1. Organic Green Tea (250g)</span>
                  <span>450.00</span>
                </div>
                {settings.showRateLine && (
                  <div className="text-[9px] text-gray-500 pl-2">1 PCS × ₹450.00</div>
                )}
                <div className="flex justify-between">
                  <span>2. Roasted Almonds (500g)</span>
                  <span>650.00</span>
                </div>
                {settings.showRateLine && (
                  <div className="text-[9px] text-gray-500 pl-2">1 PKT × ₹650.00</div>
                )}
              </div>

              <div className="space-y-0.5 pt-1">
                <div className="flex justify-between text-[10px]">
                  <span>Subtotal:</span>
                  <span>₹ 1,100.00</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>CGST (2.5%):</span>
                  <span>₹ 27.50</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>SGST (2.5%):</span>
                  <span>₹ 27.50</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-gray-300 border-dashed">
                  <span>GRAND TOTAL:</span>
                  <span>₹ 1,155.00</span>
                </div>
              </div>

              {settings.showUPI && (
                <div className="pt-2 text-center border-t border-gray-300 border-dashed">
                  <div className="w-16 h-16 bg-gray-200 mx-auto rounded flex items-center justify-center text-gray-500 text-[9px]">
                    <QrCode className="w-8 h-8 text-gray-700" />
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 block">Scan UPI to Pay</span>
                </div>
              )}

              <div className="text-center text-[9px] text-gray-500 pt-2 border-t border-gray-300 border-dashed">
                {settings.footerMessage || 'Thank you for shopping with us!'}
              </div>

              {settings.cutMark && (
                <div className="text-center text-[9px] text-gray-400 border-t border-gray-300 border-dotted pt-1">
                  - - - - - ✂ Cut Here - - - - -
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThermalPrintView;
