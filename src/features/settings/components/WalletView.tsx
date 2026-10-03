import React, { useState } from 'react';
import {
  Wallet,
  Zap,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  CreditCard,
  History,
} from 'lucide-react';
import { toast } from '@/shared/components/feedback/Toast';
import { Radio } from '@/shared/components/ui';

export const WalletView: React.FC = () => {
  const [balance, setBalance] = useState(1250);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'growth'>('pro');

  const plans = [
    {
      id: 'starter',
      name: 'Starter Pack',
      credits: 500,
      price: 199,
      perCredit: '₹0.39/credit',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro Business Pack',
      credits: 2500,
      price: 799,
      perCredit: '₹0.31/credit',
      popular: true,
    },
    {
      id: 'growth',
      name: 'Enterprise Scale',
      credits: 10000,
      price: 2499,
      perCredit: '₹0.24/credit',
      popular: false,
    },
  ];

  const transactions = [
    {
      id: 'tx_1',
      date: '20-Sep-2026 10:14 AM',
      type: 'debit',
      desc: 'Automated WhatsApp Invoices (42 msgs)',
      amount: -42,
      balanceAfter: 1250,
    },
    {
      id: 'tx_2',
      date: '18-Sep-2026 04:30 PM',
      type: 'credit',
      desc: 'Pro Business Pack Recharge (UPI #483920)',
      amount: +1000,
      balanceAfter: 1292,
    },
    {
      id: 'tx_3',
      date: '15-Sep-2026 11:20 AM',
      type: 'debit',
      desc: 'Payment Reminder SMS Broadcast (80 msgs)',
      amount: -80,
      balanceAfter: 292,
    },
  ];

  const handleRecharge = (plan: (typeof plans)[0]) => {
    setBalance((prev) => prev + plan.credits);
    setShowAddModal(false);
    toast(`Successfully recharged ${plan.credits} credits to your Swipe Wallet!`, 'success');
  };

  return (
    <div className="space-y-8" id="wallet-view">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-[#1E61EB]" />
            <span>Swipe Wallet &amp; Messaging Credits</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your prepaid balance for automated WhatsApp invoices, SMS alerts, e-Invoicing, and AI automation.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="bg-[#1E61EB] hover:bg-[#174ec4] text-white text-xs font-semibold py-2 px-4 rounded-md transition-colors flex items-center space-x-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Wallet Credits</span>
        </button>
      </div>

      {/* Balance & Overview Card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-blue-200 text-xs font-medium uppercase tracking-wider">Available Credits Balance</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold tracking-tight">{balance.toLocaleString()}</span>
              <span className="text-blue-200 text-xs font-medium">Credits Available</span>
            </div>
            <p className="text-[11px] text-blue-200/80">
              Equivalent to ~{Math.floor(balance / 1)} WhatsApp invoices or ~{Math.floor(balance * 2)} SMS alerts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-white text-[#1E61EB] hover:bg-blue-50 font-bold text-xs py-2 px-5 rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Zap className="w-4 h-4 text-[#1E61EB]" />
            <span>Instant Top-Up</span>
          </button>
        </div>
      </div>

      {/* Rate Card & Transparent Pricing */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
          <Sparkles className="w-4 h-4 text-gray-500" />
          <span>Usage Rates &amp; Credit Consumption</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/60 space-y-1">
            <span className="font-semibold text-gray-900 block">WhatsApp Invoice</span>
            <div className="text-sm font-bold text-[#1E61EB]">1 Credit / msg</div>
            <p className="text-[10px] text-gray-500">Official Meta Cloud API delivery with PDF document attachment.</p>
          </div>

          <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/60 space-y-1">
            <span className="font-semibold text-gray-900 block">SMS Notification</span>
            <div className="text-sm font-bold text-[#1E61EB]">0.5 Credits / sms</div>
            <p className="text-[10px] text-gray-500">TRAI DLT compliant high-speed transactional SMS delivery.</p>
          </div>

          <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/60 space-y-1">
            <span className="font-semibold text-gray-900 block">NIC e-Invoice &amp; e-Way</span>
            <div className="text-sm font-bold text-emerald-600">Free / 0 Credits</div>
            <p className="text-[10px] text-gray-500">Direct sandbox &amp; production NIC GSP portal generation included.</p>
          </div>

          <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/60 space-y-1">
            <span className="font-semibold text-gray-900 block">SwipeAI Categorizer</span>
            <div className="text-sm font-bold text-purple-600">Free Unlimited</div>
            <p className="text-[10px] text-gray-500">Free built-in AI tax classification &amp; expense categorization.</p>
          </div>
        </div>
      </div>

      {/* Credit Packs */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
          <CreditCard className="w-4 h-4 text-gray-500" />
          <span>Prepaid Credit Packages</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`p-5 rounded-xl border transition-all relative flex flex-col justify-between ${
                p.popular
                  ? 'border-[#1E61EB] bg-blue-50/30 ring-2 ring-[#1E61EB]/20 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-2.5 right-4 bg-[#1E61EB] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Best Value
                </span>
              )}

              <div className="space-y-2">
                <div className="font-bold text-gray-900 text-sm">{p.name}</div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-gray-900">₹{p.price}</span>
                  <span className="text-gray-400 text-xs">+ GST</span>
                </div>
                <div className="text-xs font-semibold text-[#1E61EB]">{p.credits.toLocaleString()} Credits</div>
                <p className="text-[11px] text-gray-500">{p.perCredit} · Never expires</p>
              </div>

              <button
                type="button"
                onClick={() => handleRecharge(p)}
                className={`mt-4 w-full py-2 px-4 rounded-md text-xs font-semibold transition-colors ${
                  p.popular
                    ? 'bg-[#1E61EB] hover:bg-[#174ec4] text-white shadow-sm'
                    : 'border border-gray-200 hover:bg-gray-50 text-gray-800'
                }`}
              >
                Recharge ₹{p.price}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Ledger History */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2">
            <History className="w-4 h-4 text-gray-500" />
            <span>Recent Credit Ledger History</span>
          </h3>
          <span className="text-[11px] text-gray-400 font-medium">Auto-updated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Description</th>
                <th className="py-2.5 px-3 font-semibold">Credits</th>
                <th className="py-2.5 px-3 font-semibold text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-2.5 px-3 text-gray-500 text-[11px]">{tx.date}</td>
                  <td className="py-2.5 px-3 font-medium text-gray-800">{tx.desc}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center font-bold text-xs ${
                        tx.type === 'credit' ? 'text-emerald-600' : 'text-gray-700'
                      }`}
                    >
                      {tx.type === 'credit' ? '+' : ''}
                      {tx.amount}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-gray-600">{tx.balanceAfter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Credits Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4 border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-[#1E61EB]" />
                <span>Instant Wallet Top-Up</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              {plans.map((p) => (
                <label
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedPlan === p.id
                      ? 'border-[#1E61EB] bg-blue-50/40 ring-1 ring-[#1E61EB]/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Radio
                      name="rechargePlan"
                      checked={selectedPlan === p.id}
                      onChange={() => setSelectedPlan(p.id as any)}
                    />
                    <div>
                      <div className="font-bold text-xs text-gray-900">{p.name}</div>
                      <div className="text-[11px] text-gray-500">{p.credits.toLocaleString()} Credits ({p.perCredit})</div>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-gray-900">₹{p.price}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="border border-gray-200 text-gray-700 text-xs font-medium py-1.5 px-4 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetPlan = plans.find((p) => p.id === selectedPlan)!;
                  handleRecharge(targetPlan);
                }}
                className="bg-[#1E61EB] text-white text-xs font-semibold py-1.5 px-5 rounded-md hover:bg-[#174ec4] shadow-sm"
              >
                Pay &amp; Recharge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletView;
