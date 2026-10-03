import React, { useState } from 'react';
import {
  Clock,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  Calendar,
  Send,
  Sparkles,
  Sliders,
  AlertCircle,
  Save,
} from 'lucide-react';
import { toast } from '@/shared/components/feedback/Toast';
import { Select } from '@/shared/components/ui/Select';

export const AutoRemindersView: React.FC = () => {
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [daysBeforeDue, setDaysBeforeDue] = useState(3);
  const [onDueDate, setOnDueDate] = useState(true);
  const [daysAfterDue, setDaysAfterDue] = useState(3);
  const [overdueUrgent, setOverdueUrgent] = useState(7);
  const [customGreeting, setCustomGreeting] = useState(
    'Dear {client_name}, this is a gentle reminder regarding invoice #{invoice_no} of ₹{amount_due} due on {due_date}. Kindly click {upi_link} to settle online. Thank you!'
  );
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast('Automated payment reminder schedules saved!', 'success');
    }, 400);
  };

  const handleSendTestMessage = () => {
    toast('Test WhatsApp reminder dispatched to your business phone number!', 'success');
  };

  return (
    <div className="space-y-8" id="auto-reminders-view">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#1E61EB]" />
            <span>Automated WhatsApp &amp; SMS Reminders</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Recover outstanding receivables 3x faster with automated multi-stage WhatsApp and SMS reminders.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSendTestMessage}
          className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold py-1.5 px-4 rounded-md transition-colors flex items-center space-x-1.5 self-start sm:self-auto shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send Test WhatsApp</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Channel Toggles */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
            <Smartphone className="w-4 h-4 text-gray-500" />
            <span>Reminder Delivery Channels</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/40 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-gray-900">WhatsApp Messaging (Recommended)</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    98% Open Rate
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Sends beautiful rich WhatsApp messages with your business logo and instant 1-click UPI payment link.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3">
                <input
                  type="checkbox"
                  checked={whatsappEnabled}
                  onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#25D366]"></div>
              </label>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/40 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-gray-900">SMS Notifications</span>
                  <span className="text-[10px] text-gray-400 font-medium">TRAI DLT Compliant</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Sends standard SMS text messages with short bill URL for feature phones or offline users.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3">
                <input
                  type="checkbox"
                  checked={smsEnabled}
                  onChange={(e) => setSmsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E61EB]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Schedule Stages */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>Automated Timing Schedule</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="font-medium text-gray-800">Stage 1: Advance Courtesy Notice</span>
              </div>
              <div className="w-48">
                <Select
                  selectSize="sm"
                  value={daysBeforeDue}
                  onChange={(e: any) => {
                    const val = typeof e === 'object' && e?.target ? e.target.value : e;
                    setDaysBeforeDue(Number(val));
                  }}
                  options={[
                    { value: 1, label: '1 day before due date' },
                    { value: 3, label: '3 days before due date' },
                    { value: 5, label: '5 days before due date' },
                    { value: 7, label: '7 days before due date' },
                  ]}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="font-medium text-gray-800">Stage 2: On Due Date</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={onDueDate}
                  onChange={(e) => setOnDueDate(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1E61EB]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span className="font-medium text-gray-800">Stage 3: Overdue Follow-up</span>
              </div>
              <div className="w-48">
                <Select
                  selectSize="sm"
                  value={daysAfterDue}
                  onChange={(e: any) => {
                    const val = typeof e === 'object' && e?.target ? e.target.value : e;
                    setDaysAfterDue(Number(val));
                  }}
                  options={[
                    { value: 3, label: '3 days after due date' },
                    { value: 5, label: '5 days after due date' },
                    { value: 7, label: '7 days after due date' },
                  ]}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="font-medium text-gray-800">Stage 4: Critical Overdue Demand</span>
              </div>
              <div className="w-48">
                <Select
                  selectSize="sm"
                  value={overdueUrgent}
                  onChange={(e: any) => {
                    const val = typeof e === 'object' && e?.target ? e.target.value : e;
                    setOverdueUrgent(Number(val));
                  }}
                  options={[
                    { value: 7, label: '7 days after due date' },
                    { value: 15, label: '15 days after due date' },
                    { value: 30, label: '30 days after due date' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Message Template & Live Preview */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
            <MessageSquare className="w-4 h-4 text-gray-500" />
            <span>Reminder Message Template &amp; WhatsApp Preview</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">Template Text</label>
              <textarea
                rows={5}
                value={customGreeting}
                onChange={(e) => setCustomGreeting(e.target.value)}
                className="w-full p-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
              />
              <div className="flex flex-wrap gap-1 text-[10px] text-gray-500">
                <span className="font-medium">Variables:</span>
                <code className="bg-gray-100 px-1 py-0.5 rounded">{'{client_name}'}</code>
                <code className="bg-gray-100 px-1 py-0.5 rounded">{'{invoice_no}'}</code>
                <code className="bg-gray-100 px-1 py-0.5 rounded">{'{amount_due}'}</code>
                <code className="bg-gray-100 px-1 py-0.5 rounded">{'{due_date}'}</code>
                <code className="bg-gray-100 px-1 py-0.5 rounded">{'{upi_link}'}</code>
              </div>
            </div>

            {/* Live WhatsApp Bubble Mockup */}
            <div className="bg-[#EFEAE2] p-4 rounded-lg border border-gray-200 space-y-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                Live WhatsApp Mockup Preview
              </span>
              <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-xs space-y-2 text-gray-800">
                <div className="font-bold text-[#1E61EB]">VISHAL ENTERPRISE</div>
                <p className="text-[11px] leading-relaxed">
                  Dear <strong>Apex Technologies Ltd</strong>, this is a gentle reminder regarding invoice{' '}
                  <strong>#INV-2025-001</strong> of <strong>₹45,200.00</strong> due on <strong>30-Sep-2026</strong>.
                  Kindly click below to settle instantly via UPI / Netbanking.
                </p>
                <div className="bg-blue-50 text-[#1E61EB] font-bold p-2 rounded text-center text-xs border border-blue-100">
                  💳 Pay ₹45,200.00 Online Now
                </div>
                <div className="text-[9px] text-gray-400 text-right">10:45 AM · Delivered</div>
              </div>
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
            <span>{saving ? 'Saving...' : 'Save Reminder Schedules'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AutoRemindersView;
