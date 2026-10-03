import React, { useState } from 'react';
import {
  Gift,
  Copy,
  Share2,
  CheckCircle2,
  Users,
  Sparkles,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { toast } from '@/shared/components/feedback/Toast';

export const ReferralView: React.FC = () => {
  const referralCode = 'FREEGST-VISHAL-89';
  const referralUrl = `https://freegstbill.in/join?ref=${referralCode}`;
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(referralUrl);
    setCopied(true);
    toast('Referral invite link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hey! I'm using Free GST Billing Software for Indian businesses — zero setup fees, automated GSTR reports, and 100% offline data privacy. Try it here: ${referralUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-8" id="referral-view">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <Gift className="w-5 h-5 text-pink-600" />
            <span>Refer Other Businesses &amp; Earn Credits</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Share Free GST Billing Software with fellow traders, merchants, and accountants. Earn 500 WhatsApp/SMS credits for each friend who starts billing.
          </p>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-700 text-white rounded-xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-2">
          <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            Community Referral Program
          </span>
          <h3 className="text-2xl font-black tracking-tight">Give 500 Credits, Get 500 Credits</h3>
          <p className="text-xs text-white/90 leading-relaxed">
            Help Indian small businesses say goodbye to expensive monthly SaaS subscriptions. When your colleagues switch to local-first Free GST Billing, you both receive 500 messaging credits instantly.
          </p>
        </div>
      </div>

      {/* Unique Link & Code Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
          <Share2 className="w-4 h-4 text-gray-500" />
          <span>Your Unique Referral Link</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Invite URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={referralUrl}
                className="flex-1 h-9 px-3 rounded border border-gray-200 text-xs font-mono bg-gray-50 text-gray-700 select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="bg-[#1E61EB] hover:bg-[#174ec4] text-white text-xs font-semibold px-4 rounded-md transition-colors flex items-center space-x-1.5 shrink-0 shadow-sm"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold px-4 rounded-md transition-colors flex items-center space-x-1.5 shrink-0 shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Your Referral Code:</span>
            <span className="font-mono font-bold text-gray-900 bg-white px-2.5 py-1 rounded border border-gray-200">
              {referralCode}
            </span>
          </div>
        </div>
      </div>

      {/* Rewards Ledger / Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
          <Users className="w-4 h-4 text-gray-500" />
          <span>Referral Impact &amp; Earnings</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50 space-y-1">
            <span className="text-xs text-gray-500">Invited Businesses</span>
            <div className="text-2xl font-extrabold text-gray-900">8</div>
            <p className="text-[10px] text-gray-400">Total signups via link</p>
          </div>

          <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50 space-y-1">
            <span className="text-xs text-gray-500">Active Billing Accounts</span>
            <div className="text-2xl font-extrabold text-emerald-600">6</div>
            <p className="text-[10px] text-gray-400">Generated &gt; 5 invoices</p>
          </div>

          <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50 space-y-1">
            <span className="text-xs text-gray-500">Total Credits Earned</span>
            <div className="text-2xl font-extrabold text-[#1E61EB]">3,000</div>
            <p className="text-[10px] text-gray-400">Credited to Swipe Wallet</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralView;
