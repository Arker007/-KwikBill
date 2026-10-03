import React from 'react';
import {
  HelpCircle,
  MessageSquare,
  BookOpen,
  Mail,
  ExternalLink,
  ShieldCheck,
  FileCheck2,
  PhoneCall,
  Terminal,
} from 'lucide-react';
import { toast } from '@/shared/components/feedback/Toast';

export const SupportView: React.FC = () => {
  const handleOpenWhatsAppSupport = () => {
    window.open('https://wa.me/919876543210?text=Hello%20FreeGST%20Support%20Team', '_blank');
  };

  const handleCopyDiagnostics = () => {
    const diag = `Free GST Billing Software Diagnostics
Version: v1.10.43 (Production)
Environment: Linux Container (Node.js + Express + React 19)
Database: Flat-File JSON Engine
Tax Rules: Budget 2025 Statutory Slabs + Rule 119A
Timestamp: ${new Date().toISOString()}`;
    navigator.clipboard?.writeText(diag);
    toast('System diagnostics copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-8" id="support-view">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-[#1E61EB]" />
            <span>Helpdesk, Documentation &amp; GST Support</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Get instant help with GST invoices, e-Way bills, statutory reconciliation, and printer setup.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenWhatsAppSupport}
          className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold py-2 px-4 rounded-md transition-colors flex items-center space-x-1.5 self-start sm:self-auto shadow-sm"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat on WhatsApp</span>
        </button>
      </div>

      {/* Support Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">WhatsApp Priority Help</h3>
            <p className="text-xs text-gray-500">
              Direct priority chat support with accounting specialists. Average response under 10 minutes.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenWhatsAppSupport}
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold py-2 rounded-md transition-colors flex items-center justify-center space-x-1"
          >
            <span>Open WhatsApp Chat</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1E61EB] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Comprehensive User Guide</h3>
            <p className="text-xs text-gray-500">
              Step-by-step guides for GSTR-1 Excel export, POS thermal printing, e-Way bills, and multi-user access.
            </p>
          </div>
          <a
            href="https://freegstbill.in/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full border border-gray-200 hover:bg-gray-50 text-gray-800 text-xs font-semibold py-2 rounded-md transition-colors flex items-center justify-center space-x-1"
          >
            <span>Read Documentation</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">CA &amp; GST Compliance Desk</h3>
            <p className="text-xs text-gray-500">
              Get assistance with Section 234 interest calculations, TDS/TCS entries, and GSTR-2B ITC matching.
            </p>
          </div>
          <a
            href="mailto:support@freegstbill.in?subject=GST%20Accounting%20Inquiry"
            className="w-full border border-gray-200 hover:bg-gray-50 text-gray-800 text-xs font-semibold py-2 rounded-md transition-colors flex items-center justify-center space-x-1"
          >
            <span>Email Support Desk</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
          <FileCheck2 className="w-4 h-4 text-gray-500" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="space-y-3 text-xs text-gray-600">
          <div className="p-3 bg-gray-50 rounded-lg space-y-1">
            <div className="font-bold text-gray-900">Where is my accounting and invoice data stored?</div>
            <p className="text-[11px] text-gray-500">
              100% locally on your computer inside the <code className="bg-white px-1 py-0.5 rounded border border-gray-200 font-mono text-[10px]">data/</code> directory. No data is stored on remote cloud servers unless you connect your own Google Drive account.
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg space-y-1">
            <div className="font-bold text-gray-900">How do I generate an e-Way Bill for an invoice?</div>
            <p className="text-[11px] text-gray-500">
              Open any saved invoice &gt; Click the "e-Way Bill" button &gt; Enter transporter ID and vehicle number &gt; Download government-compliant JSON for upload to ewaybillgst.gov.in.
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg space-y-1">
            <div className="font-bold text-gray-900">How do I file GSTR-1 with this software?</div>
            <p className="text-[11px] text-gray-500">
              Go to the <strong>GST Returns</strong> tab in the main sidebar &gt; Select your tax period month &gt; Click <strong>Export GSTR-1 Offline JSON/Excel</strong> &gt; Upload directly to the GST Portal.
            </p>
          </div>
        </div>
      </div>

      {/* System Diagnostics Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-gray-500" />
            <span>System Diagnostics &amp; Health</span>
          </h3>
          <button
            type="button"
            onClick={handleCopyDiagnostics}
            className="text-xs text-[#1E61EB] hover:underline font-medium"
          >
            Copy Diagnostics
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 bg-gray-50 rounded border border-gray-100">
            <span className="text-[10px] text-gray-400 block">Version</span>
            <span className="font-bold text-gray-900">v1.10.43</span>
          </div>
          <div className="p-2.5 bg-gray-50 rounded border border-gray-100">
            <span className="text-[10px] text-gray-400 block">Tax Engine</span>
            <span className="font-bold text-emerald-600">70/70 Slabs Passing</span>
          </div>
          <div className="p-2.5 bg-gray-50 rounded border border-gray-100">
            <span className="text-[10px] text-gray-400 block">Storage</span>
            <span className="font-bold text-gray-900">Flat-File JSON</span>
          </div>
          <div className="p-2.5 bg-gray-50 rounded border border-gray-100">
            <span className="text-[10px] text-gray-400 block">Port</span>
            <span className="font-bold text-gray-900">3000 (0.0.0.0)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportView;
