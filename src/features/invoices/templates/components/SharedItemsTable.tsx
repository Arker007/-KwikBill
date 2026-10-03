import React from 'react';
import { resolveLineDiscount } from '@/features/invoices/utils/taxCalculation';
import { InvoiceTemplateProps } from '../types';

export interface SharedItemsTableProps {
  props: InvoiceTemplateProps;
  tableStyle?: React.CSSProperties;
  className?: string;
}

export const SharedItemsTable: React.FC<SharedItemsTableProps> = ({ props, tableStyle, className }) => {
  const {
    items = [],
    totals = {} as any,
    showGST,
    showHSN,
    showItemQty,
    showItemUnit,
    showRateColumn,
    hasAnyDiscount,
    isIndia,
    isInterstate,
    taxLabel,
    fmt,
  } = props;

  return (
    <table className={`inv-table ${className || ''}`} style={{ tableLayout: 'auto', ...tableStyle }}>
      <thead>
        {showGST ? (
          isIndia && isInterstate ? (
            <>
              <tr>
                <th className="inv-th" rowSpan={2}>#</th>
                <th className="inv-th" rowSpan={2}>Description</th>
                {showHSN && <th className="inv-th inv-th-center" rowSpan={2}>HSN/SAC</th>}
                {showItemQty && <th className="inv-th inv-th-center" rowSpan={2}>Qty</th>}
                {showRateColumn && <th className="inv-th inv-th-right" rowSpan={2}>Rate</th>}
                {hasAnyDiscount && <th className="inv-th inv-th-right" rowSpan={2}>Disc.</th>}
                <th className="inv-th inv-th-center" colSpan={2} style={{ borderBottom: '1px solid #cbd5e1' }}>IGST</th>
                <th className="inv-th inv-th-right" rowSpan={2}>Amount</th>
              </tr>
              <tr>
                <th className="inv-th inv-th-center">%</th>
                <th className="inv-th inv-th-right">Amt</th>
              </tr>
            </>
          ) : isIndia ? (
            <>
              <tr>
                <th className="inv-th" rowSpan={2}>#</th>
                <th className="inv-th" rowSpan={2}>Description</th>
                {showHSN && <th className="inv-th inv-th-center" rowSpan={2}>HSN/SAC</th>}
                {showItemQty && <th className="inv-th inv-th-center" rowSpan={2}>Qty</th>}
                {showRateColumn && <th className="inv-th inv-th-right" rowSpan={2}>Rate</th>}
                {hasAnyDiscount && <th className="inv-th inv-th-right" rowSpan={2}>Disc.</th>}
                <th className="inv-th inv-th-center" colSpan={2} style={{ borderBottom: '1px solid #cbd5e1' }}>CGST</th>
                <th className="inv-th inv-th-center" colSpan={2} style={{ borderBottom: '1px solid #cbd5e1' }}>SGST</th>
                <th className="inv-th inv-th-right" rowSpan={2}>Amount</th>
              </tr>
              <tr>
                <th className="inv-th inv-th-center">%</th>
                <th className="inv-th inv-th-right">Amt</th>
                <th className="inv-th inv-th-center">%</th>
                <th className="inv-th inv-th-right">Amt</th>
              </tr>
            </>
          ) : (
            <>
              <tr>
                <th className="inv-th" rowSpan={2}>#</th>
                <th className="inv-th" rowSpan={2}>Description</th>
                {showHSN && <th className="inv-th inv-th-center" rowSpan={2}>HSN/SAC</th>}
                {showItemQty && <th className="inv-th inv-th-center" rowSpan={2}>Qty</th>}
                {showRateColumn && <th className="inv-th inv-th-right" rowSpan={2}>Rate</th>}
                {hasAnyDiscount && <th className="inv-th inv-th-right" rowSpan={2}>Disc.</th>}
                <th className="inv-th inv-th-center" colSpan={2} style={{ borderBottom: '1px solid #cbd5e1' }}>{taxLabel}</th>
                <th className="inv-th inv-th-right" rowSpan={2}>Amount</th>
              </tr>
              <tr>
                <th className="inv-th inv-th-center">%</th>
                <th className="inv-th inv-th-right">Amt</th>
              </tr>
            </>
          )
        ) : (
          <tr>
            <th className="inv-th">#</th>
            <th className="inv-th">Description</th>
            {showHSN && <th className="inv-th inv-th-center">HSN/SAC</th>}
            {showItemQty && <th className="inv-th inv-th-center">Qty</th>}
            {showRateColumn && <th className="inv-th inv-th-right">Rate</th>}
            {hasAnyDiscount && <th className="inv-th inv-th-right">Disc.</th>}
            <th className="inv-th inv-th-right">Amount</th>
          </tr>
        )}
      </thead>
      <tbody>
        {items.map((item: any, index: number) => {
          const lineAmount = item.quantity * item.rate;
          const discount = resolveLineDiscount(item);
          const grossAfterDiscount = Math.max(0, lineAmount - discount);
          const taxRate = item.taxPercent || 0;
          const isTaxInclusive = totals.taxInclusive;
          const afterDiscount = isTaxInclusive && showGST ? grossAfterDiscount / (1 + taxRate / 100) : grossAfterDiscount;
          const taxAmount = isTaxInclusive && showGST ? grossAfterDiscount - afterDiscount : (afterDiscount * taxRate) / 100;
          const halfRate = taxRate / 2;
          const halfTax = taxAmount / 2;

          return (
            <tr key={item.id || `preview-item-${index}`} className={index % 2 === 0 ? 'inv-tr-even' : ''}>
              <td className="inv-td inv-td-muted">{index + 1}</td>
              <td className="inv-td inv-td-name">
                {item.name || '-'}
                {item.description && (
                  <div style={{ fontSize: '0.78em', color: '#475569', marginTop: 2, whiteSpace: 'pre-wrap' }}>
                    {item.description}
                  </div>
                )}
              </td>
              {showHSN && <td className="inv-td inv-td-center inv-td-muted">{item.hsn || '-'}</td>}
              {showItemQty && (
                <td className="inv-td inv-td-center">
                  {item.quantity}
                  {showItemUnit && item.unit ? ` ${item.unit}` : ''}
                </td>
              )}
              {showRateColumn && <td className="inv-td inv-td-right">{fmt(item.rate)}</td>}
              {hasAnyDiscount && <td className="inv-td inv-td-right">{discount > 0 ? fmt(discount) : '-'}</td>}
              {showGST && (
                isIndia && isInterstate ? (
                  <>
                    <td className="inv-td inv-td-center">{taxRate}%</td>
                    <td className="inv-td inv-td-right">{fmt(taxAmount)}</td>
                  </>
                ) : isIndia ? (
                  <>
                    <td className="inv-td inv-td-center">{halfRate}%</td>
                    <td className="inv-td inv-td-right">{fmt(halfTax)}</td>
                    <td className="inv-td inv-td-center">{halfRate}%</td>
                    <td className="inv-td inv-td-right">{fmt(halfTax)}</td>
                  </>
                ) : (
                  <>
                    <td className="inv-td inv-td-center">{taxRate}%</td>
                    <td className="inv-td inv-td-right">{fmt(taxAmount)}</td>
                  </>
                )
              )}
              <td className="inv-td inv-td-right inv-td-amount">{fmt(afterDiscount)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
