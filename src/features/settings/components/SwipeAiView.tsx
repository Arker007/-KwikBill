import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Zap,
  CheckCircle2,
  Sliders,
  Send,
  HelpCircle,
  FileCheck,
  Tag,
  PieChart,
} from 'lucide-react';
import { toast } from '@/shared/components/feedback/Toast';

export const SwipeAiView: React.FC = () => {
  const [hsnAutoSuggest, setHsnAutoSuggest] = useState(true);
  const [expenseCategorizer, setExpenseCategorizer] = useState(true);
  const [gstSummaryExplainer, setGstSummaryExplainer] = useState(true);
  const [ocrAutoFill, setOcrAutoFill] = useState(true);
  const [aiTone, setAiTone] = useState<'professional' | 'concise' | 'detailed'>('professional');
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const handleTestAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsThinking(true);
    setAiResponse(null);

    setTimeout(() => {
      setIsThinking(false);
      const q = prompt.toLowerCase();
      if (q.includes('hsn') || q.includes('tea') || q.includes('food')) {
        setAiResponse(
          '🔍 **Recommended HSN Code:** `0902` (Tea, whether or not flavoured).\n- **GST Rate:** 5% (2.5% CGST + 2.5% SGST or 5% IGST)\n- **Statutory Reference:** Notification No. 1/2017-Integrated Tax (Rate).'
        );
      } else if (q.includes('rule 119a') || q.includes('round')) {
        setAiResponse(
          '⚖️ **Rule 119A Rounding Guide:**\n- Tax amounts must be rounded to the nearest multiple of ten rupees for income tax, and to the nearest one rupee for GST invoices under Section 170.\n- Fractions of 50 paise or more are rounded up to ₹1, less than 50 paise ignored.'
        );
      } else {
        setAiResponse(
          `🤖 **SwipeAI Response for:** "${prompt}"\n- Under Indian GST statutory provisions, all taxable supplies must carry appropriate SAC/HSN codes.\n- E-Way bill threshold is ₹50,000 inter-state, or state-specific thresholds intra-state.`
        );
      }
      toast('SwipeAI parsed statutory response!', 'success');
    }, 600);
  };

  return (
    <div className="space-y-8" id="swipe-ai-view">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>SwipeAI Smart Accounting &amp; Automation</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure built-in local AI capabilities for statutory GST classification, OCR receipt parsing, and smart auto-fill.
          </p>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <Bot className="w-3.5 h-3.5 mr-1 text-purple-600" />
          SwipeAI v2.4 Active
        </span>
      </div>

      {/* AI Features Grid */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
          <Sliders className="w-4 h-4 text-gray-500" />
          <span>Active Intelligence Capabilities</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/40 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-[#1E61EB]" />
                <span className="font-bold text-xs text-gray-900">HSN/SAC Code Auto-Classifier</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Instantly predicts the accurate 4-digit or 6-digit HSN code &amp; GST tax bracket when you type item names.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-3">
              <input
                type="checkbox"
                checked={hsnAutoSuggest}
                onChange={(e) => setHsnAutoSuggest(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E61EB]"></div>
            </label>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/40 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-xs text-gray-900">Smart Expense Categorizer</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Automatically maps raw expense receipts into P&amp;L accounting buckets (Travel, Rent, Office Supplies, IT).
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-3">
              <input
                type="checkbox"
                checked={expenseCategorizer}
                onChange={(e) => setExpenseCategorizer(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E61EB]"></div>
            </label>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/40 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-xs text-gray-900">GSTR-1 &amp; 3B Plain English Summaries</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Generates simple monthly GST filing summaries, tax liabilities, and ITC mismatch warnings in plain language.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-3">
              <input
                type="checkbox"
                checked={gstSummaryExplainer}
                onChange={(e) => setGstSummaryExplainer(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E61EB]"></div>
            </label>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/40 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-xs text-gray-900">OCR Bill Photo &amp; PDF Auto-Extraction</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Extracts GSTIN, invoice date, line items, and totals from camera photos of vendor bills.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-3">
              <input
                type="checkbox"
                checked={ocrAutoFill}
                onChange={(e) => setOcrAutoFill(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E61EB]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Interactive AI Statutory Testing Console */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Interactive SwipeAI Assistant Sandbox</span>
        </h3>

        <p className="text-xs text-gray-500">
          Ask any question about GST rates, HSN codes, invoice rules, Section 234 interest, or Indian tax provisions:
        </p>

        <form onSubmit={handleTestAI} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. What is the HSN code for Green Tea and its GST rate?"
              className="flex-1 h-9 px-3 rounded-md border border-gray-200 text-xs focus:outline-none focus:border-black"
            />
            <button
              type="submit"
              disabled={isThinking || !prompt.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 rounded-md transition-colors flex items-center space-x-1.5 shrink-0 shadow-sm"
            >
              <Send className={`w-3.5 h-3.5 ${isThinking ? 'animate-bounce' : ''}`} />
              <span>{isThinking ? 'Analyzing...' : 'Ask SwipeAI'}</span>
            </button>
          </div>

          <div className="flex gap-2 flex-wrap text-[11px] text-gray-500">
            <span>Quick Prompts:</span>
            <button
              type="button"
              onClick={() => setPrompt('What is the HSN code for Organic Tea?')}
              className="underline hover:text-purple-600"
            >
              HSN for Tea
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setPrompt('How does statutory Rule 119A rounding work?')}
              className="underline hover:text-purple-600"
            >
              Rule 119A Rounding
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setPrompt('What is the e-Way bill threshold in Gujarat vs Inter-state?')}
              className="underline hover:text-purple-600"
            >
              e-Way Bill Limit
            </button>
          </div>
        </form>

        {aiResponse && (
          <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-lg text-xs space-y-2 text-gray-800">
            <div className="flex items-center space-x-1.5 font-bold text-purple-900">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>SwipeAI Assistant Result</span>
            </div>
            <div className="whitespace-pre-line text-[11px] leading-relaxed pl-5">{aiResponse}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwipeAiView;
