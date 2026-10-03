import React, { useState } from 'react';
import { Plus, Landmark, Star, Trash2, Edit2, Check, AlertCircle } from 'lucide-react';
import { PaymentAccount, BusinessProfileData } from '../types';
import { createEmptyAccount, getPaymentAccounts, setDefaultAccount } from '../../../shared/utils';
import { toast } from '../../../shared/components/feedback/Toast';
import { confirmAction } from '../../../shared/components/feedback/ConfirmModal';

export interface PaymentAccountsViewProps {
  profile: BusinessProfileData;
  setProfile: React.Dispatch<React.SetStateAction<BusinessProfileData>>;
  onSaveProfile: (profile: BusinessProfileData) => Promise<void>;
}

export const PaymentAccountsView: React.FC<PaymentAccountsViewProps> = ({
  profile,
  setProfile,
  onSaveProfile,
}) => {
  const accounts = getPaymentAccounts(profile);
  const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openAddAccount = () => {
    const fresh = createEmptyAccount();
    if (accounts.length === 0) fresh.isDefault = true;
    setEditingAccount(fresh);
    setModalOpen(true);
  };

  const openEditAccount = (acc: PaymentAccount) => {
    setEditingAccount({ ...acc });
    setModalOpen(true);
  };

  const updateAccountsList = async (nextAccounts: PaymentAccount[]) => {
    const def = nextAccounts.find(a => a.isDefault) || nextAccounts[0];
    const updated: BusinessProfileData = {
      ...profile,
      paymentAccounts: nextAccounts,
      ...(def
        ? {
            bankName: def.bankName || '',
            accountNumber: def.accountNumber || '',
            ifsc: def.ifsc || '',
            swift: def.swift || '',
            upiId: def.upiId || '',
          }
        : {}),
    };
    setProfile(updated);
    await onSaveProfile(updated);
  };

  const handleSaveAccountModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    if (!editingAccount.bankName.trim() && !editingAccount.upiId.trim()) {
      toast('Please enter Bank Name or UPI ID', 'warning');
      return;
    }

    const existing = accounts.filter(a => a.id !== 'legacy');
    const idx = existing.findIndex(a => a.id === editingAccount.id);
    let next: PaymentAccount[];

    if (idx >= 0) {
      next = existing.map((a, i) => (i === idx ? editingAccount : a));
    } else {
      next = [...existing, editingAccount];
    }

    if (editingAccount.isDefault) {
      next = next.map(a => ({
        ...a,
        isDefault: a.id === editingAccount.id,
      }));
    } else if (!next.some(a => a.isDefault) && next.length > 0) {
      next[0].isDefault = true;
    }

    await updateAccountsList(next);
    setModalOpen(false);
    setEditingAccount(null);
    toast(idx >= 0 ? 'Account updated' : 'Account added', 'success');
  };

  const handleRemoveAccount = async (acc: PaymentAccount) => {
    const confirmed = await confirmAction({
      title: `Delete payment account "${acc.label || acc.bankName || 'this account'}"?`,
      message: 'Existing invoices keep their frozen bank snapshot.',
      confirmLabel: 'Delete account',
      tone: 'danger',
    });
    if (!confirmed) return;

    const next = accounts.filter(a => a.id !== 'legacy' && a.id !== acc.id);
    if (next.length > 0 && !next.some(a => a.isDefault)) {
      next[0].isDefault = true;
    }
    await updateAccountsList(next);
    toast('Account removed', 'success');
  };

  const handleSetDefault = async (acc: PaymentAccount) => {
    const next = setDefaultAccount(
      accounts.filter(a => a.id !== 'legacy'),
      acc.id
    );
    await updateAccountsList(next);
    toast(`Default account set to ${acc.label || acc.bankName}`, 'success');
  };

  return (
    <div id="payment-accounts-tab-content" className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Payment Accounts & Banks</h2>
          <p className="text-xs text-gray-500 mt-1">
            Configure bank accounts and UPI IDs to display on invoices and payment receipts.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddAccount}
          className="flex items-center space-x-1.5 bg-[#1E61EB] hover:bg-[#174ec4] text-white text-xs font-medium py-2 px-3.5 rounded-md shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bank Account</span>
        </button>
      </div>

      {/* Accounts List */}
      {accounts.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <Landmark className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs font-medium text-gray-700">No payment accounts configured yet</p>
          <p className="text-[11px] text-gray-500 mt-1">Add your bank account details or UPI ID for seamless billing.</p>
          <button
            type="button"
            onClick={openAddAccount}
            className="mt-3 text-xs font-semibold text-[#1E61EB] hover:underline"
          >
            + Add First Bank Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map(acc => (
            <div
              key={acc.id}
              className={`p-4 rounded-lg border transition-all ${
                acc.isDefault
                  ? 'bg-blue-50/40 border-[#1E61EB]/40 shadow-xs'
                  : 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#1E61EB]">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 flex items-center space-x-1.5">
                      <span>{acc.label || acc.bankName || 'Bank Account'}</span>
                      {acc.isDefault && (
                        <span className="text-[10px] bg-[#1E61EB] text-white px-1.5 py-0.2 rounded font-medium">
                          Default
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-gray-500">{acc.bankName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {!acc.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(acc)}
                      title="Set as default"
                      className="p-1 text-gray-400 hover:text-amber-500 rounded"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openEditAccount(acc)}
                    title="Edit account"
                    className="p-1 text-gray-400 hover:text-[#1E61EB] rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveAccount(acc)}
                    title="Delete account"
                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                {acc.accountNumber && (
                  <div>
                    <span className="text-[10px] text-gray-400 block">Account Number</span>
                    <span className="font-mono text-gray-800">{acc.accountNumber}</span>
                  </div>
                )}
                {acc.ifsc && (
                  <div>
                    <span className="text-[10px] text-gray-400 block">IFSC Code</span>
                    <span className="font-mono uppercase text-gray-800">{acc.ifsc}</span>
                  </div>
                )}
                {acc.upiId && (
                  <div className="col-span-2">
                    <span className="text-[10px] text-gray-400 block">UPI ID</span>
                    <span className="font-mono text-[#1E61EB]">{acc.upiId}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Account Modal */}
      {modalOpen && editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">
                {editingAccount.id ? 'Edit Bank Account' : 'Add Bank Account'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAccountModal} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Account Label / Title :</label>
                <input
                  type="text"
                  value={editingAccount.label || ''}
                  onChange={e => setEditingAccount({ ...editingAccount, label: e.target.value })}
                  placeholder="e.g. Current Account - HDFC"
                  className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Bank Name :</label>
                <input
                  type="text"
                  value={editingAccount.bankName || ''}
                  onChange={e => setEditingAccount({ ...editingAccount, bankName: e.target.value })}
                  placeholder="e.g. HDFC Bank Ltd"
                  className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Account Number :</label>
                  <input
                    type="text"
                    value={editingAccount.accountNumber || ''}
                    onChange={e => setEditingAccount({ ...editingAccount, accountNumber: e.target.value })}
                    placeholder="e.g. 50200012345678"
                    className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs font-mono focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">IFSC Code :</label>
                  <input
                    type="text"
                    value={editingAccount.ifsc || ''}
                    onChange={e => setEditingAccount({ ...editingAccount, ifsc: e.target.value.toUpperCase() })}
                    placeholder="e.g. HDFC0000240"
                    maxLength={11}
                    className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs font-mono uppercase focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">UPI ID (for instant QR code) :</label>
                <input
                  type="text"
                  value={editingAccount.upiId || ''}
                  onChange={e => setEditingAccount({ ...editingAccount, upiId: e.target.value.toLowerCase() })}
                  placeholder="e.g. vishal@okhdfcbank"
                  className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="acc-default-check"
                  checked={!!editingAccount.isDefault}
                  onChange={e => setEditingAccount({ ...editingAccount, isDefault: e.target.checked })}
                  className="rounded border-gray-300 text-[#1E61EB] focus:ring-0"
                />
                <label htmlFor="acc-default-check" className="text-gray-700 cursor-pointer">
                  Set as default account on new invoices
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 rounded border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#1E61EB] hover:bg-[#174ec4] text-white font-medium text-xs shadow-xs"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentAccountsView;
