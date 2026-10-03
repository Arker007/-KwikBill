import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Globe,
  CheckCircle2,
  Lock,
  Camera,
  Smartphone,
  Save,
} from 'lucide-react';
import { toast } from '@/shared/components/feedback/Toast';
import { Select } from '@/shared/components/ui/Select';

export interface UserProfileViewProps {
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
  profile?: any;
  setProfile?: any;
  onSaveProfile?: any;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  initialName = 'Vishal Patel',
  initialEmail = 'vishal760063@gmail.com',
  initialPhone = '+91 98765 43210',
}) => {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [designation, setDesignation] = useState('Founder & Managing Director');
  const [language, setLanguage] = useState('en-IN');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeZone, setTimeZone] = useState('Asia/Kolkata');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast('User profile preferences updated successfully!', 'success');
    }, 400);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast('Please enter your current password', 'warning');
      return;
    }
    if (newPassword.length < 6) {
      toast('New password must be at least 6 characters', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast('Password changed successfully!', 'success');
  };

  return (
    <div className="space-y-8" id="user-profile-view">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <User className="w-5 h-5 text-[#1E61EB]" />
            <span>User Profile & Security</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your personal identity, contact details, authentication credentials, and display formatting.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Super Admin
          </span>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-5">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
            <User className="w-4 h-4 text-gray-500" />
            <span>Personal Information</span>
          </h3>

          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="flex flex-col items-center space-y-2 shrink-0">
              <div className="w-20 h-20 rounded-full bg-blue-100 border-2 border-[#1E61EB] text-[#1E61EB] font-bold text-xl flex items-center justify-center relative shadow-sm">
                {name ? name.charAt(0).toUpperCase() : 'U'}
                <button
                  type="button"
                  onClick={() => toast('Avatar photo upload triggered', 'info')}
                  className="absolute bottom-0 right-0 bg-[#1E61EB] text-white p-1.5 rounded-full hover:bg-[#174ec4] transition-colors shadow"
                  title="Change avatar"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">JPG, PNG (Max 2MB)</span>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Vishal Patel"
                  className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Designation / Role Title</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Managing Director, Accountant"
                  className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    className="w-full h-8 pl-8 pr-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mobile Number *</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+91 98765 43210"
                    className="w-full h-8 pl-8 pr-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
            <Globe className="w-4 h-4 text-gray-500" />
            <span>Regional & Display Preferences</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Select
                label="UI Language"
                value={language}
                onChange={(e: any) => {
                  const val = typeof e === 'object' && e?.target ? e.target.value : e;
                  setLanguage(val);
                }}
                options={[
                  { value: 'en-IN', label: 'English (India)' },
                  { value: 'hi-IN', label: 'Hindi (हिंदी)' },
                  { value: 'gu-IN', label: 'Gujarati (ગુજરાતી)' },
                  { value: 'mr-IN', label: 'Marathi (મરાઠી)' },
                  { value: 'ta-IN', label: 'Tamil (தமிழ்)' },
                  { value: 'te-IN', label: 'Telugu (తెలుగు)' },
                ]}
              />
            </div>

            <div>
              <Select
                label="Date Display Format"
                value={dateFormat}
                onChange={(e: any) => {
                  const val = typeof e === 'object' && e?.target ? e.target.value : e;
                  setDateFormat(val);
                }}
                options={[
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (e.g. 20/09/2026)' },
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (e.g. 2026-09-20)' },
                  { value: 'DD-MMM-YYYY', label: 'DD-MMM-YYYY (e.g. 20-Sep-2026)' },
                ]}
              />
            </div>

            <div>
              <Select
                label="Timezone"
                value={timeZone}
                onChange={(e: any) => {
                  const val = typeof e === 'object' && e?.target ? e.target.value : e;
                  setTimeZone(val);
                }}
                options={[
                  { value: 'Asia/Kolkata', label: 'IST (GMT +05:30) New Delhi' },
                  { value: 'Asia/Dubai', label: 'GST (GMT +04:00) Dubai' },
                  { value: 'Asia/Singapore', label: 'SGT (GMT +08:00) Singapore' },
                  { value: 'UTC', label: 'UTC (Universal Coordinated Time)' },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#1E61EB] hover:bg-[#174ec4] text-white text-xs font-semibold py-2 px-5 rounded-md transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-5">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
          <Shield className="w-4 h-4 text-gray-500" />
          <span>Security & Authentication</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleChangePassword} className="space-y-3.5 pr-0 lg:pr-4 lg:border-r border-gray-100">
            <h4 className="text-xs font-semibold text-gray-900 flex items-center space-x-1.5">
              <Key className="w-3.5 h-3.5 text-gray-500" />
              <span>Change Login Password</span>
            </h4>

            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <button
              type="submit"
              className="border border-gray-200 hover:bg-gray-50 text-gray-800 text-xs font-medium py-1.5 px-4 rounded-md transition-colors"
            >
              Update Password
            </button>
          </form>

          <div className="space-y-4">
            <div className="flex items-start justify-between p-3.5 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-semibold text-gray-900">Two-Factor Authentication (2FA)</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Require an OTP or authenticator code during login for maximum data security.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3">
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(e) => {
                    setTwoFactorEnabled(e.target.checked);
                    toast(
                      e.target.checked
                        ? 'Two-factor authentication enabled via SMS/Email OTP.'
                        : 'Two-factor authentication disabled.',
                      'info'
                    );
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E61EB]"></div>
              </label>
            </div>

            <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-100 text-[11px] text-gray-600 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#1E61EB]" />
                <span>Active local session on this device. Zero cloud snooping.</span>
              </div>
              <span className="text-emerald-700 font-semibold">Active Now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;
