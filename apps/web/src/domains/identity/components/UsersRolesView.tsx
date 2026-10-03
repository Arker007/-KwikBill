import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Building2,
  ShieldCheck,
  Plus,
  Trash2,
  Shield,
  Briefcase,
} from 'lucide-react';
import { BusinessProfileData } from '@/features/settings/types';
import { toast } from '@/shared/components/feedback/Toast';
import { confirmAction } from '@/shared/components/feedback/ConfirmModal';
import { Select } from '@/shared/components/ui/Select';

export interface UsersRolesViewProps {
  businessProfiles: BusinessProfileData[];
  currentBusinessName: string;
  handleAddNewProfile: () => void;
  handleSaveAsProfile: () => Promise<void>;
  handleLoadProfile: (bp: BusinessProfileData) => Promise<void>;
  handleDeleteProfile: (id?: string) => Promise<void>;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Billing Operator' | 'Accountant / CA' | 'Viewer';
  status: 'Active' | 'Invited';
  lastActive: string;
}

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Vishal Patel (You)',
    email: 'vishal760063@gmail.com',
    role: 'Owner',
    status: 'Active',
    lastActive: 'Just now',
  },
  {
    id: '2',
    name: 'Ramesh Sharma',
    email: 'ramesh.accounts@enterprise.in',
    role: 'Accountant / CA',
    status: 'Active',
    lastActive: '2 hours ago',
  },
  {
    id: '3',
    name: 'Priya Mehta',
    email: 'priya.billing@enterprise.in',
    role: 'Billing Operator',
    status: 'Invited',
    lastActive: 'Pending accept',
  },
];

export const UsersRolesView: React.FC<UsersRolesViewProps> = ({
  businessProfiles,
  currentBusinessName,
  handleAddNewProfile,
  handleSaveAsProfile,
  handleLoadProfile,
  handleDeleteProfile,
}) => {
  const [members, setMembers] = useState<TeamMember[]>(DEFAULT_MEMBERS);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('Billing Operator');

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast('Please enter both name and email', 'warning');
      return;
    }
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'Invited',
      lastActive: 'Invite Sent',
    };
    setMembers((prev) => [...prev, newMember]);
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
    toast(`Invitation sent to ${newMember.email}`, 'success');
  };

  const handleRemoveMember = async (id: string, name: string) => {
    if (
      await confirmAction({
        title: `Remove ${name}?`,
        message: 'This user will immediately lose access to this billing workspace.',
        confirmLabel: 'Remove User',
        tone: 'danger',
      })
    ) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast(`Removed user ${name}`, 'info');
    }
  };

  return (
    <div className="space-y-8" id="users-roles-view">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#1E61EB]" />
            <span>Team Members &amp; Workspace Profiles</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage multi-user permissions, operator roles, CA access, and multi-business workspace profiles.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowInviteModal(true)}
          className="bg-[#1E61EB] hover:bg-[#174ec4] text-white text-xs font-semibold py-2 px-4 rounded-md transition-colors flex items-center space-x-1.5 self-start sm:self-auto shadow-sm"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite New Member</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-gray-500" />
            <span>Authorized Workspace Users ({members.length})</span>
          </h3>
          <span className="text-[11px] text-gray-400 font-medium">Role-Based Access Control (RBAC)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 font-semibold">User</th>
                <th className="py-2.5 px-3 font-semibold">Role</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Activity</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-[#1E61EB] font-bold flex items-center justify-center text-xs">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{m.name}</div>
                        <div className="text-[11px] text-gray-400">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        m.role === 'Owner'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : m.role === 'Admin'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : m.role === 'Accountant / CA'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        m.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-500 text-[11px]">{m.lastActive}</td>
                  <td className="py-3 px-3 text-right">
                    {m.role !== 'Owner' ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.id, m.name)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Remove user"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">Primary</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-100 gap-2">
          <div>
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-gray-500" />
              <span>Multi-Company Workspaces ({businessProfiles.length})</span>
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Switch instantly between multiple GSTINs, legal entities, or branch companies.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddNewProfile}
              className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium py-1.5 px-3 rounded-md transition-colors flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Company</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAsProfile}
              className="bg-[#1E61EB] hover:bg-[#174ec4] text-white text-xs font-semibold py-1.5 px-3 rounded-md transition-colors flex items-center space-x-1"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Save Current as Workspace</span>
            </button>
          </div>
        </div>

        {businessProfiles.length === 0 ? (
          <div className="p-6 text-center text-gray-400 bg-gray-50/50 rounded-lg border border-dashed border-gray-200 text-xs">
            No saved business workspaces yet. Fill in your details in Company Details and click "Save Current as Workspace".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {businessProfiles.map((bp) => {
              const isActive =
                bp.businessName?.trim().toLowerCase() === currentBusinessName?.trim().toLowerCase();

              return (
                <div
                  key={bp.id || bp.businessName}
                  className={`p-4 rounded-lg border transition-all ${
                    isActive
                      ? 'border-[#1E61EB] bg-blue-50/30 ring-1 ring-[#1E61EB]/20 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900 text-xs">
                          {bp.brandName || bp.businessName}
                        </span>
                        {isActive && (
                          <span className="bg-[#1E61EB] text-white text-[10px] font-bold px-2 py-0.2 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {bp.gstin ? (
                          <span className="font-mono">{bp.gstin}</span>
                        ) : (
                          <span>Unregistered / Composite</span>
                        )}
                        {bp.state && <span> · {bp.state}</span>}
                      </div>
                      {bp.address && (
                        <p className="text-[11px] text-gray-400 line-clamp-1">{bp.address}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleLoadProfile(bp)}
                        disabled={isActive}
                        className={`text-xs font-semibold py-1 px-2.5 rounded transition-colors ${
                          isActive
                            ? 'bg-gray-100 text-gray-400 cursor-default'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {isActive ? 'Current' : 'Switch'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProfile(bp.id)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-gray-50/80 border border-gray-200 rounded-lg p-5 text-xs text-gray-600 space-y-3">
        <h4 className="font-bold text-gray-900 flex items-center space-x-1.5">
          <Shield className="w-4 h-4 text-[#1E61EB]" />
          <span>Role Permissions Matrix</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
          <div className="p-3 bg-white rounded border border-gray-200 space-y-1">
            <span className="font-bold text-gray-900 block">Owner / Admin</span>
            <p className="text-gray-500">Full control over invoices, settings, bank accounts, and user management.</p>
          </div>
          <div className="p-3 bg-white rounded border border-gray-200 space-y-1">
            <span className="font-bold text-gray-900 block">Billing Operator</span>
            <p className="text-gray-500">Can create and print invoices, receipts, and client ledgers. No settings access.</p>
          </div>
          <div className="p-3 bg-white rounded border border-gray-200 space-y-1">
            <span className="font-bold text-gray-900 block">Accountant / CA</span>
            <p className="text-gray-500">Can view GSTR-1/3B tax reports, export Excel/Tally XML, and audit ledgers.</p>
          </div>
          <div className="p-3 bg-white rounded border border-gray-200 space-y-1">
            <span className="font-bold text-gray-900 block">Viewer</span>
            <p className="text-gray-500">Read-only access to sales dashboard, inventory balances, and invoices.</p>
          </div>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4 border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-[#1E61EB]" />
                <span>Invite Workspace Member</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  required
                  placeholder="e.g. Suresh Patel"
                  className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  placeholder="suresh@company.com"
                  className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <Select
                  label="Role & Permissions"
                  value={inviteRole}
                  onChange={(e: any) => {
                    const val = typeof e === 'object' && e?.target ? e.target.value : e;
                    setInviteRole(val as TeamMember['role']);
                  }}
                  options={[
                    { value: 'Admin', label: 'Admin (Full Access)' },
                    { value: 'Billing Operator', label: 'Billing Operator (Invoices Only)' },
                    { value: 'Accountant / CA', label: 'Accountant / CA (Tax & Reports)' },
                    { value: 'Viewer', label: 'Viewer (Read-Only)' },
                  ]}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="border border-gray-200 text-gray-700 text-xs font-medium py-1.5 px-4 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1E61EB] text-white text-xs font-semibold py-1.5 px-4 rounded-md hover:bg-[#174ec4]"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersRolesView;
