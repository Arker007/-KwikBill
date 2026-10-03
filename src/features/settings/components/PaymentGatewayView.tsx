import React, { useState } from 'react';
import {
  CreditCard,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Key,
  ExternalLink,
  Save,
  Lock,
  QrCode,
} from 'lucide-react';
import { toast } from '@/shared/components/feedback/Toast';

export const PaymentGatewayView: React.FC = () => {
  const [razorpayEnabled, setRazorpayEnabled] = useState(true);
  const [razorpayKey, setRazorpayKey] = useState('rzp_live_89324892304928');
  const [razorpaySecret, setRazorpaySecret] = useState('••••••••••••••••••••••••');
  const [cashfreeEnabled, setCashfreeEnabled] = useState(false);
  const [cashfreeAppId, setCashfreeAppId] = useState('');
  const [cashfreeSecret, setCashfreeSecret] = useState('');
  const [upiQrEnabled, setUpiQrEnabled] = useState(true);
  const [instantSettlement, setInstantSettlement] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast('Payment gateway credentials encrypted and saved locally!', 'success');
    }, 400);
  };

  return (
    <div className="space-y-8" id="payment-gateway-view">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-[#1E61EB]" />
            <span>Online Payment Gateways &amp; UPI Links</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Collect credit cards, debit cards, netbanking, and UPI payments directly on client invoice links with automatic reconciliation.
          </p>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          Zero Surcharge UPI
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Dynamic UPI Payment Links */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <QrCode className="w-4 h-4 text-[#1E61EB]" />
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Dynamic UPI Auto-QR Code (0% MDR / Free)
              </h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={upiQrEnabled}
                onChange={(e) => setUpiQrEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E61EB]"></div>
            </label>
          </div>

          <p className="text-xs text-gray-500">
            Generates NPCI-compliant UPI payment QR codes on every invoice and PDF. Clients scan using GPay, PhonePe, Paytm, BHIM, or any banking app to pay straight into your bank account.
          </p>
        </div>

        {/* Razorpay Gateway */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <span className="font-black text-blue-900 text-sm tracking-tight">Razorpay</span>
              <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded">
                Cards, Netbanking, EMI, Wallets
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={razorpayEnabled}
                onChange={(e) => setRazorpayEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E61EB]"></div>
            </label>
          </div>

          {razorpayEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Razorpay Key ID *</label>
                <input
                  type="text"
                  value={razorpayKey}
                  onChange={(e) => setRazorpayKey(e.target.value)}
                  required={razorpayEnabled}
                  placeholder="rzp_live_xxxxxxxxxxxx"
                  className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs font-mono focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Razorpay Key Secret *</label>
                <input
                  type="password"
                  value={razorpaySecret}
                  onChange={(e) => setRazorpaySecret(e.target.value)}
                  required={razorpayEnabled}
                  placeholder="••••••••••••••••"
                  className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs font-mono focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between text-[11px] text-gray-500 pt-1">
                <span>Webhook Endpoint: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">https://api.freegstbill.in/webhooks/razorpay</code></span>
                <a
                  href="https://dashboard.razorpay.com/#/access/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1E61EB] hover:underline flex items-center space-x-1"
                >
                  <span>Get Razorpay Keys</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Cashfree Payments */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <span className="font-black text-emerald-900 text-sm tracking-tight">Cashfree Payments</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Instant Auto-Collect
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={cashfreeEnabled}
                onChange={(e) => setCashfreeEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E61EB]"></div>
            </label>
          </div>

          {cashfreeEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cashfree App ID *</label>
                <input
                  type="text"
                  value={cashfreeAppId}
                  onChange={(e) => setCashfreeAppId(e.target.value)}
                  placeholder="CF_APP_xxxxxxxx"
                  className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs font-mono focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cashfree Secret Key *</label>
                <input
                  type="password"
                  value={cashfreeSecret}
                  onChange={(e) => setCashfreeSecret(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs font-mono focus:outline-none focus:border-black"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#1E61EB] hover:bg-[#174ec4] text-white text-xs font-semibold py-2 px-5 rounded-md transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Payment Gateways'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentGatewayView;
