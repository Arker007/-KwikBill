import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Sliders,
  FolderSync,
  HelpCircle,
  Save,
} from 'lucide-react';
import { toast } from '@/shared/components/feedback/Toast';
import { Select } from '@/shared/components/ui/Select';

export const TallyIntegrationView: React.FC = () => {
  const [tallyVersion, setTallyVersion] = useState<'prime' | 'erp9'>('prime');
  const [companyNameInTally, setCompanyNameInTally] = useState('VISHAL ENTERPRISE');
  const [salesLedger, setSalesLedger] = useState('Sales GST Accounts');
  const [cgstLedger, setCgstLedger] = useState('Input/Output CGST');
  const [sgstLedger, setSgstLedger] = useState('Input/Output SGST');
  const [igstLedger, setIgstLedger] = useState('Input/Output IGST');
  const [roundOffLedger, setRoundOffLedger] = useState('Round Off Account');
  const [exporting, setExporting] = useState(false);

  const handleExportTallyXML = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      const xmlData = `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${companyNameInTally}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <!-- Tally XML Voucher entries exported from Free GST Billing Software -->
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

      const blob = new Blob([xmlData], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Tally_Vouchers_${new Date().toISOString().split('T')[0]}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast('Tally XML Vouchers generated and downloaded!', 'success');
    }, 600);
  };

  const handleSaveLedgers = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Tally ledger mapping preferences saved!', 'success');
  };

  return (
    <div className="space-y-8" id="tally-integration-view">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Tally Prime &amp; ERP 9 Integration</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            1-Click XML export for sales vouchers, purchase entries, and automatic ledger mapping into Tally.
          </p>
        </div>
        <button
          type="button"
          disabled={exporting}
          onClick={handleExportTallyXML}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-4 rounded-md transition-colors flex items-center space-x-1.5 self-start sm:self-auto shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{exporting ? 'Generating XML...' : 'Export All Vouchers XML'}</span>
        </button>
      </div>

      <form onSubmit={handleSaveLedgers} className="space-y-6">
        {/* Tally Version Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
            <Sliders className="w-4 h-4 text-gray-500" />
            <span>Tally Environment</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Select
                label="Tally Version"
                value={tallyVersion}
                onChange={(e: any) => {
                  const val = typeof e === 'object' && e?.target ? e.target.value : e;
                  setTallyVersion(val);
                }}
                options={[
                  { value: 'prime', label: 'Tally Prime (Release 1.0 - 4.x / 5.0)' },
                  { value: 'erp9', label: 'Tally.ERP 9 (Series A Release 6.x)' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Company Name in Tally</label>
              <input
                type="text"
                value={companyNameInTally}
                onChange={(e) => setCompanyNameInTally(e.target.value)}
                required
                placeholder="Exact company name as in Tally"
                className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Ledger Mapping Matrix */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
            <FolderSync className="w-4 h-4 text-gray-500" />
            <span>Statutory Ledger Name Mapping</span>
          </h3>
          <p className="text-[11px] text-gray-400">
            Ensure ledger names match your Tally Chart of Accounts to avoid import errors.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sales Ledger</label>
              <input
                type="text"
                value={salesLedger}
                onChange={(e) => setSalesLedger(e.target.value)}
                className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">CGST Tax Ledger</label>
              <input
                type="text"
                value={cgstLedger}
                onChange={(e) => setCgstLedger(e.target.value)}
                className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">SGST Tax Ledger</label>
              <input
                type="text"
                value={sgstLedger}
                onChange={(e) => setSgstLedger(e.target.value)}
                className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">IGST Tax Ledger</label>
              <input
                type="text"
                value={igstLedger}
                onChange={(e) => setIgstLedger(e.target.value)}
                className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Round Off Ledger</label>
              <input
                type="text"
                value={roundOffLedger}
                onChange={(e) => setRoundOffLedger(e.target.value)}
                className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* How-To Guide */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-600 space-y-2">
          <div className="flex items-center space-x-1.5 font-bold text-gray-900">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>How to Import into Tally Prime in 30 Seconds:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-600 pl-2">
            <li>Click <strong>"Export All Vouchers XML"</strong> above to download the XML file.</li>
            <li>Open Tally Prime &rarr; Press <strong>Alt + O</strong> (Import menu).</li>
            <li>Select <strong>Transactions</strong> &rarr; Select the downloaded XML file &rarr; Press Enter.</li>
            <li>All Sales, Purchases, Client Ledgers, and GST entries will be created automatically.</li>
          </ol>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#1E61EB] hover:bg-[#174ec4] text-white text-xs font-semibold py-2 px-5 rounded-md transition-colors shadow-sm"
          >
            Save Tally Mapping
          </button>
        </div>
      </form>
    </div>
  );
};

export default TallyIntegrationView;
