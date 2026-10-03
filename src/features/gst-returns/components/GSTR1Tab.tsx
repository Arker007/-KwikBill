import React, { useState } from 'react';
import { Download, Upload, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/shared/utils';
import type { B2BRow, HSNRow, DocSummaryItem, GrandTotals, PeriodFilingStatus } from '../types';

interface GSTR1TabProps {
  b2bRows: B2BRow[];
  b2bRegular: any[];
  b2cRates: [string, any][];
  b2cSmall: any[];
  b2cLarge: any[];
  b2cTotals: any;
  hsnRows: HSNRow[];
  creditNotes: any[];
  cnTotals: any;
  docSummary: Record<string, DocSummaryItem>;
  b2bTotals: any;
  grandTotals: GrandTotals;
  periodFiling: PeriodFilingStatus;
  markFiled: (returnType: 'gstr1' | 'gstr3b') => void;
  onExportJSON: () => void;
  onExportB2B: () => void;
  onExportB2C: () => void;
  onExportHSN: () => void;
  onExportCDNR: () => void;
  onExportDocSummary: () => void;
}

export const GSTR1Tab: React.FC<GSTR1TabProps> = ({
  b2bRows,
  b2cRates,
  b2cLarge,
  b2cTotals,
  hsnRows,
  creditNotes,
  cnTotals,
  docSummary,
  b2bTotals,
  grandTotals,
  periodFiling,
  markFiled,
  onExportJSON,
  onExportB2B,
  onExportB2C,
  onExportHSN,
  onExportCDNR,
  onExportDocSummary,
}) => {
  const [b2bPage, setB2bPage] = useState(1);
  const B2B_PER_PAGE = 25;
  const b2bTotalPages = Math.max(1, Math.ceil(b2bRows.length / B2B_PER_PAGE));
  const b2bPagedRows = b2bRows.slice((b2bPage - 1) * B2B_PER_PAGE, b2bPage * B2B_PER_PAGE);

  return (
    <>
      {/* Actions Toolbar */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          className="btn btn-primary"
          onClick={onExportJSON}
          style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
          title="Download GSTR-1 JSON to upload directly on GST portal offline tool"
        >
          <Upload size={13} /> GSTR-1 JSON
        </button>
        <button className="btn btn-secondary" onClick={onExportB2B} style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}>
          <Download size={13} /> B2B CSV
        </button>
        <button className="btn btn-secondary" onClick={onExportB2C} style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}>
          <Download size={13} /> B2C CSV
        </button>
        <button className="btn btn-secondary" onClick={onExportHSN} style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}>
          <Download size={13} /> HSN CSV
        </button>
        <button className="btn btn-secondary" onClick={onExportCDNR} style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}>
          <Download size={13} /> CDNR CSV
        </button>
        <button className="btn btn-secondary" onClick={onExportDocSummary} style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}>
          <Download size={13} /> Docs CSV
        </button>
        {!periodFiling.gstr1 && (
          <button
            className="btn btn-secondary"
            onClick={() => markFiled('gstr1')}
            style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem', marginLeft: 'auto', color: '#059669', borderColor: '#bbf7d0' }}
          >
            <CheckCircle size={13} /> Mark Filed
          </button>
        )}
      </div>

      {/* Table 4A: B2B Invoices */}
      <div className="glass-panel mb-4">
        <div className="table-header">
          <h3>Table 4A — B2B Invoices (Registered Clients)</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b2bRows.length} invoices</span>
        </div>
        {b2bRows.length === 0 ? (
          <p className="empty-state">No B2B invoices in this period</p>
        ) : (
          <>
            <div className="table-scroll">
              <table className="data-table" style={{ minWidth: '850px' }}>
                <thead>
                  <tr>
                    <th>GSTIN</th>
                    <th>Receiver</th>
                    <th>Invoice No.</th>
                    <th>Date</th>
                    <th>POS</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Taxable</th>
                    <th style={{ textAlign: 'right' }}>CGST</th>
                    <th style={{ textAlign: 'right' }}>SGST</th>
                    <th style={{ textAlign: 'right' }}>IGST</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {b2bPagedRows.map((row, i) => (
                    <tr key={i}>
                      <td><span className="badge badge-outline">{row.gstin}</span></td>
                      <td className="font-medium">{row.clientName}</td>
                      <td>{row.invoiceNo}</td>
                      <td>{row.date}</td>
                      <td>{row.pos}</td>
                      <td><span className="badge badge-subtle">{row.supplyType}</span></td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(row.taxable)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(row.cgst)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(row.sgst)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(row.igst)}</td>
                      <td style={{ textAlign: 'right' }} className="font-bold">{formatCurrency(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 'bold', borderTop: '2px solid var(--border)' }}>
                    <td colSpan={6}>B2B Total</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(b2bTotals.taxable)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(b2bTotals.cgst)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(b2bTotals.sgst)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(b2bTotals.igst)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(b2bTotals.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {b2bTotalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', borderTop: '1px solid var(--border)', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Showing {(b2bPage - 1) * B2B_PER_PAGE + 1}–{Math.min(b2bPage * B2B_PER_PAGE, b2bRows.length)} of {b2bRows.length}</span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button className="btn btn-secondary" onClick={() => setB2bPage(p => Math.max(1, p - 1))} disabled={b2bPage === 1} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Prev</button>
                  <span style={{ padding: '0.2rem 0.5rem', color: 'var(--text-secondary)' }}>{b2bPage} / {b2bTotalPages}</span>
                  <button className="btn btn-secondary" onClick={() => setB2bPage(p => Math.min(b2bTotalPages, p + 1))} disabled={b2bPage === b2bTotalPages} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Table 9B: Credit / Debit Notes */}
      {creditNotes.length > 0 && (
        <div className="glass-panel mb-4">
          <div className="table-header">
            <h3>Table 9B — Credit / Debit Notes</h3>
            <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>{creditNotes.length} notes (reduces liability)</span>
          </div>
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: '850px' }}>
              <thead>
                <tr>
                  <th>Note No.</th>
                  <th>Date</th>
                  <th>Recipient</th>
                  <th>GSTIN</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Taxable</th>
                  <th style={{ textAlign: 'right' }}>CGST</th>
                  <th style={{ textAlign: 'right' }}>SGST</th>
                  <th style={{ textAlign: 'right' }}>IGST</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {creditNotes.map((cn, i) => {
                  const t = cn.data?.totals || {};
                  return (
                    <tr key={i}>
                      <td className="font-medium">{cn.invoiceNumber}</td>
                      <td>{cn.invoiceDate}</td>
                      <td>{cn.data?.client?.name || cn.clientName}</td>
                      <td>{cn.data?.client?.gstin ? <span className="badge badge-outline">{cn.data.client.gstin}</span> : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Unregistered</span>}</td>
                      <td><span className="badge" style={{ background: '#fef2f2', color: '#dc2626' }}>Credit Note</span></td>
                      <td style={{ textAlign: 'right', color: '#dc2626' }}>-{formatCurrency(t.taxableAmount || 0)}</td>
                      <td style={{ textAlign: 'right', color: '#dc2626' }}>-{formatCurrency(t.cgst || 0)}</td>
                      <td style={{ textAlign: 'right', color: '#dc2626' }}>-{formatCurrency(t.sgst || 0)}</td>
                      <td style={{ textAlign: 'right', color: '#dc2626' }}>-{formatCurrency(t.igst || 0)}</td>
                      <td style={{ textAlign: 'right', color: '#dc2626' }} className="font-bold">-{formatCurrency(t.total || 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid var(--border)', color: '#dc2626' }}>
                  <td colSpan={5}>Total Credit Notes</td>
                  <td style={{ textAlign: 'right' }}>-{formatCurrency(cnTotals.taxable)}</td>
                  <td style={{ textAlign: 'right' }}>-{formatCurrency(cnTotals.cgst)}</td>
                  <td style={{ textAlign: 'right' }}>-{formatCurrency(cnTotals.sgst)}</td>
                  <td style={{ textAlign: 'right' }}>-{formatCurrency(cnTotals.igst)}</td>
                  <td style={{ textAlign: 'right' }}>-{formatCurrency(cnTotals.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Table 7: B2C Invoices */}
      <div className="glass-panel mb-4">
        <div className="table-header">
          <h3>Table 7 — B2C Invoices (Unregistered Clients)</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Summary by tax rate</span>
        </div>
        {b2cRates.length === 0 ? (
          <p className="empty-state">No B2C sales in this period</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: '600px' }}>
              <thead>
                <tr>
                  <th>Rate</th>
                  <th style={{ textAlign: 'right' }}>Taxable Value</th>
                  <th style={{ textAlign: 'right' }}>CGST</th>
                  <th style={{ textAlign: 'right' }}>SGST</th>
                  <th style={{ textAlign: 'right' }}>IGST</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {b2cRates.map(([rate, data]) => (
                  <tr key={rate}>
                    <td><span className="badge badge-primary">{rate}%</span></td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(data.taxable)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(data.cgst)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(data.sgst)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(data.igst)}</td>
                    <td style={{ textAlign: 'right' }} className="font-bold">{formatCurrency(data.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid var(--border)' }}>
                  <td>B2C Total</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(b2cTotals.taxable)}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(b2cTotals.cgst)}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(b2cTotals.sgst)}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(b2cTotals.igst)}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(b2cTotals.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        {b2cLarge.length > 0 && (
          <p className="field-hint" style={{ padding: '0.5rem 1.25rem' }}>
            Note: {b2cLarge.length} inter-state invoice(s) &gt; ₹2.5L will be reported in Table 5 (B2C Large) separately in JSON export.
          </p>
        )}
      </div>

      {/* Table 12: HSN Summary */}
      <div className="glass-panel mb-4">
        <div className="table-header">
          <h3>Table 12 — HSN Summary of Outward Supplies</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hsnRows.length} HSN/SAC codes</span>
        </div>
        {hsnRows.length === 0 ? (
          <p className="empty-state">No HSN data found</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: '700px' }}>
              <thead>
                <tr>
                  <th>HSN/SAC</th>
                  <th>Description</th>
                  <th>UQC</th>
                  <th style={{ textAlign: 'right' }}>Quantity</th>
                  <th style={{ textAlign: 'right' }}>Taxable</th>
                  <th style={{ textAlign: 'right' }}>Rate</th>
                  <th style={{ textAlign: 'right' }}>CGST</th>
                  <th style={{ textAlign: 'right' }}>SGST</th>
                  <th style={{ textAlign: 'right' }}>IGST</th>
                  <th style={{ textAlign: 'right' }}>Total Tax</th>
                </tr>
              </thead>
              <tbody>
                {hsnRows.map((row, i) => (
                  <tr key={i}>
                    <td><span className="badge badge-outline">{row.hsn}</span></td>
                    <td className="font-medium">{row.description}</td>
                    <td>{row.uqc}</td>
                    <td style={{ textAlign: 'right' }}>{row.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(row.taxable)}</td>
                    <td style={{ textAlign: 'right' }}>{row.rate}%</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(row.cgst)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(row.sgst)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(row.igst)}</td>
                    <td style={{ textAlign: 'right' }} className="font-bold">{formatCurrency(row.totalTax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Table 13: Documents Issued */}
      <div className="glass-panel mb-4">
        <div className="table-header">
          <h3>Table 13 — Documents Issued</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Invoice series summary</span>
        </div>
        {Object.keys(docSummary).length === 0 ? (
          <p className="empty-state">No documents issued in this period</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: '500px' }}>
              <thead>
                <tr>
                  <th>Nature of Document</th>
                  <th>Sr. No. From</th>
                  <th>Sr. No. To</th>
                  <th style={{ textAlign: 'right' }}>Total Number</th>
                  <th style={{ textAlign: 'right' }}>Cancelled</th>
                  <th style={{ textAlign: 'right' }}>Net Issued</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(docSummary).map(([type, doc]: [string, any]) => (
                  <tr key={type}>
                    <td className="font-medium">{doc.type}</td>
                    <td>{doc.from}</td>
                    <td>{doc.to}</td>
                    <td style={{ textAlign: 'right' }}>{doc.total}</td>
                    <td style={{ textAlign: 'right' }}>0</td>
                    <td style={{ textAlign: 'right' }} className="font-bold">{doc.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grand Summary */}
      <div className="glass-panel">
        <div className="table-header"><h3>GSTR-1 Summary Totals</h3></div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Taxable</th>
                <th style={{ textAlign: 'right' }}>CGST</th>
                <th style={{ textAlign: 'right' }}>SGST</th>
                <th style={{ textAlign: 'right' }}>IGST</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-medium">B2B Sales</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(b2bTotals.taxable)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(b2bTotals.cgst)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(b2bTotals.sgst)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(b2bTotals.igst)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(b2bTotals.total)}</td>
              </tr>
              <tr>
                <td className="font-medium">B2C Sales</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(b2cTotals.taxable)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(b2cTotals.cgst)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(b2cTotals.sgst)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(b2cTotals.igst)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(b2cTotals.total)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 'bold', borderTop: '2px solid var(--border)' }}>
                <td>Grand Total</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(grandTotals.taxable)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(grandTotals.cgst)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(grandTotals.sgst)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(grandTotals.igst)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(grandTotals.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
};
