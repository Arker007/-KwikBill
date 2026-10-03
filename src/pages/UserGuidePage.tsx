import React, { useState, useMemo } from 'react';
import { Download, Search, X, BookOpen } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { GUIDE_CONTENT } from '@/userGuideContent';
import { toast } from '@/shared/components/feedback';
import { PageHeader } from '@/shared/components/layout';

interface GuideBlock {
  type: string;
  text?: string;
  items?: string[];
  rows?: [string, string][];
  _idx?: number;
  _hit?: boolean;
}

// Searchable User Guide. The on-screen render and the PDF use the same content
// array so they can never drift. The PDF is built with jsPDF.text() (real text
// glyphs, OS-searchable / copy-pasteable) NOT html2canvas (which rasterises
// to JPEG and is not searchable).
export default function UserGuidePage(): React.ReactElement {
  const [search, setSearch] = useState('');
  const [generating, setGenerating] = useState(false);

  // Filter blocks by search term. Headings stay visible if any of their child
  // blocks match, so context isn't lost. Implemented by walking the array in
  // chunks delimited by h1/h2 boundaries.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return (GUIDE_CONTENT as GuideBlock[]).map((b, i) => ({ ...b, _idx: i, _hit: false }));
    const blockMatches = (b: GuideBlock): boolean => {
      if (b.text && b.text.toLowerCase().includes(q)) return true;
      if (b.items && b.items.some(i => i.toLowerCase().includes(q))) return true;
      if (b.rows && b.rows.some(([k, v]) => `${k} ${v}`.toLowerCase().includes(q))) return true;
      return false;
    };
    // Group into sections starting at h1/h2 — keep the section header if any
    // block in the section matches.
    const sections: { header: GuideBlock | null; blocks: GuideBlock[] }[] = [];
    let cur: { header: GuideBlock | null; blocks: GuideBlock[] } | null = null;
    (GUIDE_CONTENT as GuideBlock[]).forEach((b, i) => {
      if (b.type === 'h1' || b.type === 'h2') {
        if (cur) sections.push(cur);
        cur = { header: { ...b, _idx: i }, blocks: [] };
      } else {
        if (!cur) cur = { header: null, blocks: [] };
        cur.blocks.push({ ...b, _idx: i });
      }
    });
    if (cur) sections.push(cur);
    const out: GuideBlock[] = [];
    sections.forEach(sec => {
      const matches = sec.blocks.filter(b => blockMatches(b));
      const headerMatches = sec.header ? blockMatches(sec.header) : false;
      if (matches.length === 0 && !headerMatches) return;
      if (sec.header) out.push({ ...sec.header, _hit: headerMatches });
      // If only the header matched, show all blocks in that section so context is preserved.
      const blocks = headerMatches && matches.length === 0 ? sec.blocks : matches;
      blocks.forEach(b => out.push({ ...b, _hit: blockMatches(b) }));
    });
    return out;
  }, [search]);

  const highlight = (text: string | undefined): React.ReactNode => {
    if (!text) return '';
    const q = search.trim();
    if (!q) return text;
    const re = new RegExp(`(${q.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'ig');
    const parts = text.split(re);
    return parts.map((p, i) => re.test(p)
      ? <mark key={i} style={{ background: '#fef08a', padding: 0 }}>{p}</mark>
      : <span key={i}>{p}</span>);
  };

  const downloadPDF = async () => {
    setGenerating(true);
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginX = 18;
      const marginTop = 18;
      const marginBottom = 18;
      const contentWidth = pageWidth - marginX * 2;
      let y = marginTop;
      let pageNum = 1;

      const ensureSpace = (needed: number) => {
        if (y + needed > pageHeight - marginBottom) {
          pdf.setFontSize(8); pdf.setTextColor(150);
          pdf.text(`Page ${pageNum} — Free GST Billing Software User Guide`, pageWidth / 2, pageHeight - 8, { align: 'center' });
          pdf.addPage();
          pageNum += 1;
          y = marginTop;
        }
      };

      const writeWrapped = (text: string, opts: { size?: number; bold?: boolean; indent?: number; color?: number[]; leading?: number } = {}) => {
        const { size = 11, bold = false, indent = 0, color = [40, 40, 40], leading = 1.4 } = opts;
        pdf.setFont('helvetica', bold ? 'bold' : 'normal');
        pdf.setFontSize(size);
        pdf.setTextColor(color[0], color[1], color[2]);
        const lines = pdf.splitTextToSize(text, contentWidth - indent);
        const lineHeight = size * 0.3528 * leading; // pt → mm × leading
        lines.forEach((line: string) => {
          ensureSpace(lineHeight);
          pdf.text(line, marginX + indent, y);
          y += lineHeight;
        });
      };

      // Cover-page-ish heading
      writeWrapped('Free GST Billing Software', { size: 22, bold: true, color: [30, 64, 175] });
      writeWrapped('User Guide — v1.4.0', { size: 12, color: [100, 116, 139] });
      writeWrapped(`Generated on ${new Date().toLocaleDateString()}. by DiceCodes`, { size: 9, color: [148, 163, 184] });
      y += 4;

      (GUIDE_CONTENT as GuideBlock[]).forEach(block => {
        switch (block.type) {
          case 'h1':
            y += 6; ensureSpace(12);
            if (block.text) writeWrapped(block.text, { size: 18, bold: true, color: [30, 64, 175] });
            break;
          case 'h2':
            y += 5; ensureSpace(10);
            if (block.text) writeWrapped(block.text, { size: 14, bold: true, color: [30, 41, 59] });
            break;
          case 'h3':
            y += 3;
            if (block.text) writeWrapped(block.text, { size: 11, bold: true, color: [51, 65, 85] });
            break;
          case 'p':
            if (block.text) writeWrapped(block.text, { size: 10, color: [40, 40, 40] });
            y += 1;
            break;
          case 'note':
            y += 2;
            ensureSpace(20);
            if (block.text) {
              pdf.setFont('helvetica', 'normal');
              pdf.setFontSize(10);
              const noteLines = pdf.splitTextToSize(block.text, contentWidth - 8);
              const noteH = noteLines.length * 10 * 0.3528 * 1.45 + 5;
              pdf.setFillColor(254, 252, 232);
              pdf.setDrawColor(202, 138, 4);
              pdf.roundedRect(marginX, y - 2, contentWidth, noteH, 2, 2, 'FD');
              pdf.setTextColor(120, 53, 15);
              noteLines.forEach((ln: string, i: number) => {
                pdf.text(ln, marginX + 4, y + 2 + i * 10 * 0.3528 * 1.45);
              });
              y += noteH + 2;
            }
            break;
          case 'ul':
          case 'ol':
            (block.items || []).forEach((item, i) => {
              const bullet = block.type === 'ol' ? `${i + 1}. ` : '•  ';
              writeWrapped(bullet + item, { size: 10, indent: 4, color: [40, 40, 40] });
            });
            y += 1;
            break;
          case 'kv':
            (block.rows || []).forEach(([k, v]) => {
              writeWrapped(k, { size: 10, bold: true, color: [30, 41, 59] });
              writeWrapped(v, { size: 10, indent: 6, color: [71, 85, 105] });
              y += 0.5;
            });
            y += 1;
            break;
          case 'spacer':
            y += 3;
            break;
          default:
            break;
        }
      });

      // Final-page footer
      pdf.setFontSize(8); pdf.setTextColor(150);
      pdf.text(`Page ${pageNum} — Free GST Billing Software User Guide`, pageWidth / 2, pageHeight - 8, { align: 'center' });

      pdf.save('Free-GST-Billing-User-Guide.pdf');
      toast('User Guide PDF downloaded', 'success');
    } catch (err) {
      console.error(err);
      toast('PDF generation failed', 'error');
    }
    setGenerating(false);
  };

  return (
    <div id="user-guide-view" className="dashboard-container max-w-5xl mx-auto px-2 sm:px-4 py-3 space-y-5">
      <PageHeader
        icon={<BookOpen size={20} />}
        title="Documentation & User Guide"
        subtitle="Complete reference from installation to statutory reporting and backups. Search or download as searchable PDF."
        actions={
          <button
            id="btn-download-guide-pdf"
            type="button"
            className="btn btn-primary text-xs flex items-center gap-1.5"
            onClick={downloadPDF}
            disabled={generating}
          >
            <Download size={14} /> {generating ? 'Generating…' : 'Download PDF'}
          </button>
        }
      />

      {/* Modern Search Toolbar */}
      <div className="bg-white dark:bg-[#141414] border border-[#f0f0f0] dark:border-[rgba(255,255,255,0.08)] rounded-[8px] p-3 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-gray-400 dark:text-gray-500 shrink-0 ml-1" />
          <input
            id="input-search-guide"
            type="text"
            placeholder="Search documentation and guides… (e.g. 'backup', 'TDS', 'unit', 'e-Way')"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600"
          />
          {search && (
            <button
              id="btn-clear-guide-search"
              type="button"
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              onClick={() => setSearch('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Modern Content Reader Container */}
      <div className="bg-white dark:bg-[#141414] border border-[#f0f0f0] dark:border-[rgba(255,255,255,0.08)] rounded-[8px] p-6 sm:p-8 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] leading-relaxed text-sm">
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 dark:text-gray-500 py-8">
            Nothing in the guide matches &quot;{search}&quot;. Try a different keyword, or clear your search.
          </p>
        )}
        {filtered.map((block, i) => {
          const key = `${block.type}-${block._idx ?? i}`;
          switch (block.type) {
            case 'h1':
              return (
                <h2
                  key={key}
                  className={`text-xl font-bold text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-100 dark:border-neutral-800 ${
                    i === 0 ? 'mt-0 mb-3' : 'mt-8 mb-3'
                  }`}
                >
                  {highlight(block.text)}
                </h2>
              );
            case 'h2':
              return (
                <h3
                  key={key}
                  className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2"
                >
                  {highlight(block.text)}
                </h3>
              );
            case 'h3':
              return (
                <h4
                  key={key}
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-1.5"
                >
                  {highlight(block.text)}
                </h4>
              );
            case 'p':
              return (
                <p key={key} className="my-1.5 text-gray-600 dark:text-gray-300 leading-normal">
                  {highlight(block.text)}
                </p>
              );
            case 'note':
              return (
                <div
                  key={key}
                  className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg p-3 my-3 text-amber-900 dark:text-amber-300 text-xs leading-relaxed"
                >
                  {highlight(block.text)}
                </div>
              );
            case 'ul':
              return (
                <ul key={key} className="my-2 ml-5 list-disc text-gray-600 dark:text-gray-300 space-y-1">
                  {(block.items || []).map((it, j) => (
                    <li key={j}>{highlight(it)}</li>
                  ))}
                </ul>
              );
            case 'ol':
              return (
                <ol key={key} className="my-2 ml-5 list-decimal text-gray-600 dark:text-gray-300 space-y-1">
                  {(block.items || []).map((it, j) => (
                    <li key={j}>{highlight(it)}</li>
                  ))}
                </ol>
              );
            case 'kv':
              return (
                <div key={key} className="overflow-x-auto my-3 border border-gray-100 dark:border-neutral-800 rounded-lg">
                  <table className="w-full border-collapse text-xs">
                    <tbody>
                      {(block.rows || []).map(([k, v], j) => (
                        <tr key={j} className="border-b border-gray-100 dark:border-neutral-800 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-neutral-900/50">
                          <td className="p-2.5 font-semibold text-gray-800 dark:text-gray-200 w-1/3 align-top bg-gray-50/30 dark:bg-neutral-900/30">
                            {highlight(k)}
                          </td>
                          <td className="p-2.5 text-gray-600 dark:text-gray-300">
                            {highlight(v)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            case 'spacer':
              return <div key={key} className="h-2" />;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
