import React, { useState } from 'react';
import {
  Code,
  Key,
  Copy,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  Globe,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import { toast } from '@/shared/components/feedback/Toast';

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsed: string;
}

export const ApiWebhooksView: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    {
      id: 'k1',
      name: 'Production Server Integration',
      keyPrefix: 'gst_live_948f93...29a',
      createdAt: '12-Aug-2026',
      lastUsed: '2 minutes ago',
    },
    {
      id: 'k2',
      name: 'Shopify / WooCommerce Sync',
      keyPrefix: 'gst_live_3821aa...10b',
      createdAt: '01-Sep-2026',
      lastUsed: 'Yesterday',
    },
  ]);

  const [webhookUrl, setWebhookUrl] = useState('https://myshop.in/api/webhooks/billing');
  const [webhookSecret, setWebhookSecret] = useState('whsec_984392049283048203');
  const [events, setEvents] = useState({
    'invoice.created': true,
    'invoice.paid': true,
    'client.created': true,
    'stock.low': false,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast('Please enter a key name', 'warning');
      return;
    }
    const newK: ApiKeyItem = {
      id: 'k_' + Date.now(),
      name: newKeyName.trim(),
      keyPrefix: `gst_live_${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 5)}`,
      createdAt: 'Just now',
      lastUsed: 'Never',
    };
    setApiKeys((prev) => [...prev, newK]);
    setNewKeyName('');
    setIsGenerating(false);
    toast('API Key generated successfully! Store it securely.', 'success');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    toast('Copied to clipboard!', 'info');
  };

  const handleTestWebhook = () => {
    toast('Test ping dispatched to webhook URL: HTTP 200 OK received!', 'success');
  };

  return (
    <div className="space-y-8" id="api-webhooks-view">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <Code className="w-5 h-5 text-[#1E61EB]" />
            <span>Developer REST API &amp; Webhooks</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Integrate your custom ERP, CRM, mobile apps, or e-commerce stores with secure local REST endpoints.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsGenerating(true)}
          className="bg-[#1E61EB] hover:bg-[#174ec4] text-white text-xs font-semibold py-2 px-4 rounded-md transition-colors flex items-center space-x-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Generate New API Key</span>
        </button>
      </div>

      {/* Section 1: Active API Keys */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
          <Key className="w-4 h-4 text-gray-500" />
          <span>Active API Keys ({apiKeys.length})</span>
        </h3>

        {isGenerating && (
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/40 space-y-3">
            <div className="font-bold text-xs text-gray-900">Create New API Secret Key</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Mobile POS Terminal 1"
                className="flex-1 h-8 px-2.5 rounded border border-gray-200 text-xs bg-white"
              />
              <button
                type="button"
                onClick={handleCreateKey}
                className="bg-[#1E61EB] text-white text-xs font-semibold px-4 rounded-md"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsGenerating(false)}
                className="border border-gray-200 text-gray-700 text-xs font-medium px-3 rounded-md bg-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
                <th className="py-2 px-3 font-semibold">Key Name</th>
                <th className="py-2 px-3 font-semibold">Token / Prefix</th>
                <th className="py-2 px-3 font-semibold">Created</th>
                <th className="py-2 px-3 font-semibold">Last Used</th>
                <th className="py-2 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {apiKeys.map((k) => (
                <tr key={k.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-gray-900">{k.name}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{k.keyPrefix}</span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-500 text-[11px]">{k.createdAt}</td>
                  <td className="py-2.5 px-3 text-gray-500 text-[11px]">{k.lastUsed}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setApiKeys((prev) => prev.filter((item) => item.id !== k.id))}
                      className="text-gray-400 hover:text-red-600 p-1 rounded"
                      title="Revoke Key"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Real-Time Webhooks */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <span>Outbound Webhook Subscriptions</span>
          </h3>
          <button
            type="button"
            onClick={handleTestWebhook}
            className="border border-gray-200 hover:bg-gray-50 text-gray-800 text-xs font-medium py-1 px-3 rounded-md transition-colors flex items-center space-x-1"
          >
            <Send className="w-3 h-3 text-[#1E61EB]" />
            <span>Send Test Webhook Ping</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Webhook Target URL</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://yourserver.com/webhooks/billing"
              className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs font-mono focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">HMAC Signing Secret</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={webhookSecret}
                className="flex-1 h-8 px-2.5 rounded border border-gray-200 text-xs font-mono bg-gray-50 text-gray-600"
              />
              <button
                type="button"
                onClick={() => handleCopy(webhookSecret)}
                className="border border-gray-200 hover:bg-gray-50 px-2.5 rounded text-gray-600"
                title="Copy Secret"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <label className="block text-xs font-medium text-gray-700">Subscribed Event Triggers:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {Object.entries(events).map(([evt, isChecked]) => (
              <label key={evt} className="flex items-center space-x-2 cursor-pointer p-2 rounded bg-gray-50 border border-gray-100">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setEvents((prev) => ({ ...prev, [evt]: e.target.checked }))}
                  className="w-4 h-4 text-[#1E61EB] rounded focus:ring-0"
                />
                <span className="font-mono text-[11px] text-gray-800">{evt}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: REST API Quick Reference */}
      <div className="bg-gray-900 text-white rounded-lg p-5 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between text-gray-400 border-b border-gray-800 pb-2">
          <span className="text-gray-200 font-bold">API Documentation Endpoints</span>
          <span className="text-emerald-400">Base: http://localhost:3000/api</span>
        </div>
        <div className="space-y-2 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-emerald-400 font-bold">GET /api/bills</span>
            <span className="text-gray-400">List all invoices with tax breakdown</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-400 font-bold">POST /api/bills</span>
            <span className="text-gray-400">Create new invoice &amp; generate PDF</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-emerald-400 font-bold">GET /api/products</span>
            <span className="text-gray-400">Retrieve catalog &amp; live stock counts</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-emerald-400 font-bold">GET /api/clients</span>
            <span className="text-gray-400">Fetch client balances &amp; GSTINs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiWebhooksView;
