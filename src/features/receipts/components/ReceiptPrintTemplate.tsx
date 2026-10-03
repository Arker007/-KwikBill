import React, { forwardRef } from 'react';
import { formatCurrency, numberToWords } from '@/shared/utils';
import { Receipt } from '../types';

interface ReceiptPrintTemplateProps {
  receipt: Receipt;
  profile: any;
}

export const ReceiptPrintTemplate = forwardRef<HTMLDivElement, ReceiptPrintTemplateProps>(
  ({ receipt, profile }, ref) => {
    return (
      <div style={{ position: 'absolute', left: '-9999px' }} ref={ref}>
        <div className="receipt-box">
          <div className="receipt-header">
            <p className="business-name">{profile?.businessName || 'Your Business'}</p>
            <p className="business-details">{profile?.address}</p>
            {profile?.gstin && <p className="business-details">GSTIN: {profile.gstin}</p>}
            <h2 className="receipt-title">PAYMENT RECEIPT</h2>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Receipt No:</span>
            <span className="receipt-value">{receipt.receiptNo}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Date:</span>
            <span className="receipt-value">
              {new Date(receipt.date).toLocaleDateString('en-IN')}
            </span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Received From:</span>
            <span className="receipt-value">{receipt.clientName}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Payment Mode:</span>
            <span className="receipt-value">{receipt.paymentMode}</span>
          </div>
          {receipt.referenceNo && (
            <div className="receipt-row">
              <span className="receipt-label">Reference No:</span>
              <span className="receipt-value">{receipt.referenceNo}</span>
            </div>
          )}
          {receipt.againstInvoice && (
            <div className="receipt-row">
              <span className="receipt-label">Against Invoice:</span>
              <span className="receipt-value">{receipt.againstInvoice}</span>
            </div>
          )}
          <div className="receipt-amount">{formatCurrency(receipt.amount)}</div>
          <p className="receipt-words">{numberToWords(receipt.amount)}</p>
          {receipt.note && (
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Note: {receipt.note}</p>
          )}
          <div className="receipt-footer">
            <div className="receipt-sig">
              <div className="receipt-sig-line"></div>
              <span className="receipt-sig-label">Received By</span>
            </div>
            <div className="receipt-sig">
              <div className="receipt-sig-line"></div>
              <span className="receipt-sig-label">Authorized Signatory</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ReceiptPrintTemplate.displayName = 'ReceiptPrintTemplate';
