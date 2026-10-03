import React from 'react';
import { theme } from 'antd';
import DOMPurify from 'dompurify';
import { InvoiceTemplateProps } from './types';
import { resolveLineDiscount } from '@/features/invoices/utils/taxCalculation';
import { splitNumberedTerms, htmlHasText } from '@/shared/utils';

export const ExactInvoiceLayout: React.FC<InvoiceTemplateProps> = (props) => {
  const {
    profile = {},
    client = {},
    details = {},
    items = [],
    totals = {} as any,
    invoiceType = 'quotation',
    customTitle,
    customTerms,
    customNotes,
    sellerCC,
    isIndia = true,
    isInterstate = false,
    showLogo = true,
    showDueDate = true,
    showPlaceOfSupply = true,
    showBusinessName = true,
    showBusinessAddress = true,
    showBusinessPhone = true,
    showBusinessEmail = true,
    showGSTIN = true,
    showBankDetails = true,
    showUPI = false,
    showSignature = true,
    showTerms = true,
    showNotes = false,
    showAmountWords = true,
    upiId,
    qrDataUrl,
    account,
    amountInWords,
    extraSections = [],
    options = {},
    hideHeaderBecauseLetterhead = false,
  } = props;

  // Ant Design Semantic Token System
  const { useToken } = theme;
  const { token } = useToken();

  // Multi-Level Semantic Border Thickness Values
  // Concrete pixel units ensure 100% exact rendering parity across browser DOM preview, jsPDF html2canvas, and window.print()
  const thinWidth = '0.5px';
  const baseWidth = `${token?.lineWidth || 1}px`;
  const boldWidth = `${token?.lineWidthBold ? Math.min(2, token.lineWidthBold) : 1.5}px`;
  const borderColor = '#000000';

  // Format Date e.g. "06 Sep 2026"
  const formatDate = (val?: string) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return val;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return val;
    }
  };

  // Determine Title: "QUOTATION", "TAX INVOICE", "PROFORMA INVOICE", etc.
  const titleText =
    customTitle ||
    (invoiceType === 'quotation'
      ? 'QUOTATION'
      : invoiceType === 'proforma'
        ? 'PROFORMA INVOICE'
        : invoiceType === 'credit-note'
          ? 'CREDIT NOTE'
          : invoiceType === 'bill-of-supply'
            ? 'BILL OF SUPPLY'
            : invoiceType === 'delivery-challan'
              ? 'DELIVERY CHALLAN'
              : 'TAX INVOICE');

  // Document labels
  const docNumberLabel =
    invoiceType === 'quotation'
      ? 'Quotation #:'
      : invoiceType === 'credit-note'
        ? 'Credit Note #:'
        : invoiceType === 'proforma'
          ? 'Proforma #:'
          : 'Invoice #:';

  const docDateLabel =
    invoiceType === 'quotation'
      ? 'Quotation Date:'
      : invoiceType === 'credit-note'
        ? 'Credit Note Date:'
        : invoiceType === 'proforma'
          ? 'Proforma Date:'
          : 'Invoice Date:';

  // Bank Info Resolution
  const bankName = account?.bankName || profile?.bankName || 'Bank of Baroda';
  const accountNo = account?.accountNumber || profile?.accountNumber || '08950200002246';
  const ifsc = account?.ifsc || profile?.ifsc || 'BARBOINDANK';
  const branch = account?.branch || profile?.branch || 'IND.ANKLESHW BRANCH';
  const rawBusinessName = profile?.brandName || profile?.businessName || profile?.companyName || 'VISHAL ENTERPRISE';
  const businessDisplayName = String(rawBusinessName).toUpperCase();

  // Sum total quantities
  const totalQty = items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 0), 0);

  // Client Details resolution (Always in UPPERCASE)
  const rawCustomerName = details?.customerName || details?.buyerName || client?.name || 'VEER PHARMACHEM';
  const customerName = String(rawCustomerName).toUpperCase();
  const customerAddress =
    details?.customerAddress ||
    [client?.address, client?.city, client?.state, client?.pin].filter(Boolean).join(', ');
  const customerGSTIN = details?.customerGSTIN || client?.gstin || '24AANFV7124M1ZO';
  const customerPhone = client?.phone;

  // Terms parsing
  const termsHtml = customTerms ? splitNumberedTerms(DOMPurify.sanitize(customTerms)) : '';
  const hasTerms = htmlHasText(termsHtml);

  // Notes parsing
  const notesHtml = customNotes ? splitNumberedTerms(DOMPurify.sanitize(customNotes)) : '';
  const hasNotes = htmlHasText(notesHtml);

  // Amount in words
  const wordsString = amountInWords ? amountInWords(totals.total || 0) : '';

  // Determine tax rates
  const firstItemTax = items[0]?.taxPercent || 18;
  const halfTax = firstItemTax / 2;

  // Format currency numbers with 2 decimals
  const fmtNum = (n: number) =>
    (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Calculate spacer height so the grid table fills the standard single-page area elegantly
  const rowCount = items.length;
  const spacerHeight = Math.max(80, 260 - rowCount * 36);

  return (
    <div className="exact-page-wrapper">
      <style>{`
        .exact-page-wrapper {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: #ffffff;
          padding: 8mm 10mm;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          box-sizing: border-box;
          font-family: Arial, Helvetica, 'Liberation Sans', sans-serif;
          color: #000000;
          -webkit-font-smoothing: antialiased;
        }

        @media print {
          .exact-page-wrapper {
            box-shadow: none !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 8mm 10mm !important;
            background: #ffffff !important;
          }
        }

        /* Level 1 Base Border for Outer Container */
        .border-black-main {
          border: ${baseWidth} solid ${borderColor};
        }

        /* Level 0 Thin Borders for Inner Cells and Grids */
        .b-b { border-bottom: ${thinWidth} solid ${borderColor}; }
        .b-r { border-right: ${thinWidth} solid ${borderColor}; }
        .b-l { border-left: ${thinWidth} solid ${borderColor}; }
        .b-t { border-top: ${thinWidth} solid ${borderColor}; }

        /* Level 1 Base Borders for Main Section Dividers */
        .b-b-base { border-bottom: ${baseWidth} solid ${borderColor}; }
        .b-t-base { border-top: ${baseWidth} solid ${borderColor}; }

        /* Level 2 Bold Border for Summary Emphasis */
        .b-t-bold { border-top: ${boldWidth} solid ${borderColor}; }

        /* Fixed Table Column Widths matching screenshot pixel-for-pixel */
        .col-w-1 { width: 3.5%; }    /* # */
        .col-w-2 { width: 42.5%; }   /* Item */
        .col-w-3 { width: 9.0%; }    /* HSN/SAC */
        .col-w-4 { width: 5.0%; }    /* Tax */
        .col-w-5 { width: 10.0%; }   /* Qty */
        .col-w-6 { width: 11.5%; }   /* Rate/Item */
        .col-w-7 { width: 4.5%; }    /* Per */
        .col-w-8 { width: 14.0%; }   /* Amount */

        .tbl-header {
          font-size: 10.5px;
          font-weight: 700;
          padding: 6px 4px 5px 4px;
          line-height: 1.25;
          vertical-align: middle;
          color: #000000;
          box-sizing: border-box;
        }

        .tbl-cell {
          font-size: 10.5px;
          padding: 4px 4px;
          line-height: 1.3;
          vertical-align: top;
          color: #000000;
          box-sizing: border-box;
        }
      `}</style>

      <div className="border-black-main bg-white text-black">
        {/* 1. Top Title Header Row */}
        {!hideHeaderBecauseLetterhead && (
          <div className="b-b grid grid-cols-12 items-center py-1 px-3">
            <div className="col-span-2"></div>
            <div className="col-span-8 text-center">
              <span className="text-[#1E61EB] font-bold text-[15px] tracking-[0.2em] uppercase">
                {titleText}
              </span>
            </div>
            <div className="col-span-2 text-right">
              <span className="text-[9px] text-[#000000] font-bold tracking-tight">
                ORIGINAL FOR RECIPIENT
              </span>
            </div>
          </div>
        )}

        {/* 2. Top Split Grid: Company & Customer on Left | Meta & Dispatch on Right */}
        {!hideHeaderBecauseLetterhead && (
          <div className="b-b grid grid-cols-12">
            {/* LEFT COLUMN: Seller Info + Customer Details */}
            <div className="col-span-6 b-r flex flex-col justify-between">
              {/* Seller Info Block */}
              <div className="p-2 flex gap-3 b-b">
                {/* Logo */}
                {showLogo && (
                  <div className="w-[78px] pt-1 shrink-0">
                    {options?.logo || profile?.logo ? (
                      <img
                        src={options?.logo || profile?.logo}
                        alt="Logo"
                        className="w-full h-auto object-contain"
                        style={
                          options?.logoHeight || profile?.logoHeight
                            ? { maxHeight: `${options?.logoHeight || profile?.logoHeight}px` }
                            : undefined
                        }
                      />
                    ) : (
                      <svg viewBox="0 0 160 120" className="w-full h-auto">
                        <path d="M 5,5 L 38,92 L 56,10 L 42,10 L 38,65 L 20,5 Z" fill="#1b4d3e" />
                        <path d="M 18,5 L 38,92 L 72,5 L 54,5 L 38,62 L 32,5 Z" fill="#8bc34a" />
                        <path
                          d="M 50,12 L 140,12 L 140,32 L 75,32 L 75,44 L 128,44 L 128,62 L 75,62 L 75,76 L 142,76 L 142,96 L 50,96 Z"
                          fill="#1b4d3e"
                        />
                        <path d="M 50,12 L 140,12 L 140,28 L 75,28 L 50,12 Z" fill="#8bc34a" />
                        <path d="M 75,44 L 128,44 L 128,58 L 75,58 Z" fill="#8bc34a" />
                        <text x="2" y="114" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill="#8bc34a">
                          VISHAL
                        </text>
                        <text x="56" y="114" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill="#1b4d3e">
                          ENTERPRISE
                        </text>
                      </svg>
                    )}
                  </div>
                )}

                {/* Company Meta Details */}
                <div className="text-[10.5px] leading-[1.3] text-black">
                  {showBusinessName && (
                    <div className="font-bold text-[11.5px]">{businessDisplayName}</div>
                  )}
                  {showGSTIN && (
                    <div className="font-bold">
                      {sellerCC?.taxIdLabel || 'GSTIN'}: {profile?.gstin || '24AXCPS0336E1ZV'}
                    </div>
                  )}
                  {profile?.pan && (
                    <div>
                      <span className="font-bold">PAN:</span> {profile.pan}
                    </div>
                  )}
                  {showBusinessAddress && (
                    <div className="font-normal">
                      {profile?.address ? `PLOT NO. ${profile.address}` : 'PLOT NO. 1706/06 , South 9 Road, G.I.D.C,'}
                    </div>
                  )}
                  <div className="font-normal">
                    {profile?.city || 'Ankleshwar'}
                  </div>
                  <div className="font-normal">
                    {[profile?.city ? undefined : 'Bharuch', profile?.state || 'GUJARAT', profile?.pin || '393002']
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                  {showBusinessPhone && (
                    <div>
                      <span className="font-bold">Mobile:</span>{' '}
                      <span className="font-normal">{profile?.phone || '+91 9898686379'}</span>
                    </div>
                  )}
                  {showBusinessEmail && (
                    <div>
                      <span className="font-bold">Email:</span>{' '}
                      <span className="font-normal">{profile?.email || 'Info@vishalenterpriseank.com'}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-bold">Website:</span>{' '}
                    <span className="font-normal">{profile?.website || 'www.vishalenterprises.in'}</span>
                  </div>
                </div>
              </div>

              {/* Customer Details Block (In Left Column under Seller info) */}
              <div className="p-2 text-[10.5px] leading-[1.3] text-black">
                <div className="font-normal">Customer Details:</div>
                <div className="font-bold text-[11.5px]">{customerName}</div>
                {customerGSTIN && (
                  <div className="font-bold">
                    {sellerCC?.taxIdLabel || 'GSTIN'}: {customerGSTIN}
                  </div>
                )}
                <div className="font-normal">Billing Address:</div>
                {customerAddress ? (
                  <div className="font-normal">{customerAddress}</div>
                ) : (
                  <>
                    <div className="font-normal">PLOT NO.39, JHAGADIA INDUSTRIAL ESTATE</div>
                    <div className="font-normal">GIDC, JHAGADIA</div>
                    <div className="font-normal">Bharuch, GUJARAT, 393110</div>
                  </>
                )}
                {customerPhone && (
                  <div>
                    <span className="font-bold">Mobile:</span>{' '}
                    <span className="font-normal">{customerPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: 2x2 Meta Grid + Dispatch From */}
            <div className="col-span-6 flex flex-col justify-between">
              {/* 2x2 Meta Information Grid */}
              <div className="grid grid-cols-2 text-[10.5px]">
                {/* Document Number */}
                <div className="b-r b-b p-1.5 pl-2">
                  <div className="font-normal">{docNumberLabel}</div>
                  <div className="font-bold text-[11px] mt-0.5">{details?.invoiceNumber || 'VE-330'}</div>
                </div>

                {/* Document Date */}
                <div className="b-b p-1.5 pl-2">
                  <div className="font-normal">{docDateLabel}</div>
                  <div className="font-bold text-[11px] mt-0.5">
                    {formatDate(details?.invoiceDate) || '06 Sep 2026'}
                  </div>
                </div>

                {/* Place of Supply */}
                <div className="b-r b-b p-1.5 pl-2">
                  {showPlaceOfSupply && (
                    <>
                      <div className="font-normal">Place of Supply:</div>
                      <div className="font-bold text-[11px] mt-0.5">
                        {details?.placeOfSupply || client?.state || '24-GUJARAT'}
                      </div>
                    </>
                  )}
                </div>

                {/* Due Date or Empty Cell */}
                <div className="b-b p-1.5 pl-2">
                  {showDueDate && details?.dueDate ? (
                    <>
                      <div className="font-normal">Due Date:</div>
                      <div className="font-bold text-[11px] mt-0.5">{formatDate(details.dueDate)}</div>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Dispatch From */}
              <div className="p-2 text-[10.5px] leading-snug flex-1 flex flex-col justify-start">
                <div className="font-bold">Dispatch From:</div>
                <div className="font-normal">{profile?.dispatchName || businessDisplayName}</div>
                <div className="font-normal">
                  {profile?.dispatchAddress ||
                    (profile?.address ? `Plot No. ${profile.address}` : 'Plot No. 1706/7, GIDC Estate, Ankleshwar')}
                </div>
                <div className="font-normal">
                  {[
                    profile?.dispatchCity || profile?.city || 'Bharuch',
                    profile?.dispatchState || profile?.state || 'GUJARAT',
                    profile?.dispatchPin || profile?.pin || '393002',
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Main Line Items Table */}
        <div className="w-full">
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="b-b">
                <th className="col-w-1 tbl-header b-r text-center font-bold">#</th>
                <th className="col-w-2 tbl-header b-r text-left pl-1.5 font-bold">Item</th>
                <th className="col-w-3 tbl-header b-r text-center font-bold">HSN/SAC</th>
                <th className="col-w-4 tbl-header b-r text-center font-bold">Tax</th>
                <th className="col-w-5 tbl-header b-r text-center font-bold">Qty</th>
                <th className="col-w-6 tbl-header b-r text-right pr-1.5 font-bold">Rate / Item</th>
                <th className="col-w-7 tbl-header b-r text-center font-bold">Per</th>
                <th className="col-w-8 tbl-header text-right pr-1.5 font-bold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Line Items */}
              {items.length > 0 ? (
                items.map((item: any, idx: number) => {
                  const lineAmount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                  const discount = resolveLineDiscount(item);
                  const grossAfterDiscount = Math.max(0, lineAmount - discount);
                  const taxRate = item.taxPercent || 0;
                  const isTaxInclusive = totals.taxInclusive;
                  const afterDiscount = isTaxInclusive
                    ? grossAfterDiscount / (1 + taxRate / 100)
                    : grossAfterDiscount;
                  const unit = item.unit || 'NOS';

                  return (
                    <tr key={item.id || `exact-item-${idx}`}>
                      <td className="tbl-cell text-center b-r align-top pt-1.5 font-normal">{idx + 1}</td>
                      <td className="tbl-cell b-r align-top pl-1.5 pt-1.5">
                        <div className="font-bold text-[11px] text-black">{item.name || '-'}</div>
                        {item.description && (
                          <div className="text-[10.5px] text-black font-normal mt-0.5">{item.description}</div>
                        )}
                      </td>
                      <td className="tbl-cell text-center b-r align-top pt-1.5 font-normal">{item.hsn || '-'}</td>
                      <td className="tbl-cell text-center b-r align-top pt-1.5 font-normal">
                        {taxRate ? `${taxRate}%` : '-'}
                      </td>
                      <td className="tbl-cell text-center b-r align-top pt-1.5 font-normal">
                        {item.quantity} {unit}
                      </td>
                      <td className="tbl-cell text-right b-r align-top pr-1.5 pt-1.5 font-bold">
                        {fmtNum(item.rate)}
                      </td>
                      <td className="tbl-cell text-center b-r align-top pt-1.5 italic font-normal font-serif">
                        {unit}
                      </td>
                      <td className="tbl-cell text-right align-top pr-1.5 pt-1.5 font-normal">
                        {fmtNum(afterDiscount)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                /* Sample Item when none are loaded */
                <>
                  <tr>
                    <td className="tbl-cell text-center b-r align-top pt-1.5 font-normal">1</td>
                    <td className="tbl-cell b-r align-top pl-1.5 pt-1.5">
                      <div className="font-bold text-[11px] text-black">Repairing of Plastic Pallet</div>
                      <div className="text-[10.5px] text-black font-normal mt-0.5">(39 Pallets × 7 Lumber = 273 Lumber)</div>
                    </td>
                    <td className="tbl-cell text-center b-r align-top pt-1.5 font-normal">39233090</td>
                    <td className="tbl-cell text-center b-r align-top pt-1.5 font-normal">18%</td>
                    <td className="tbl-cell text-center b-r align-top pt-1.5 font-normal">273 NOS</td>
                    <td className="tbl-cell text-right b-r align-top pr-1.5 pt-1.5 font-bold">200.00</td>
                    <td className="tbl-cell text-center b-r align-top pt-1.5 italic font-normal font-serif">NOS</td>
                    <td className="tbl-cell text-right align-top pr-1.5 pt-1.5 font-normal">54,600.00</td>
                  </tr>
                  <tr>
                    <td className="tbl-cell text-center b-r align-top pt-1.5 font-normal">2</td>
                    <td className="tbl-cell b-r align-top pl-1.5 pt-1.5">
                      <div className="font-bold text-[11px] text-black">Metal Frame for Pallet</div>
                    </td>
                    <td className="tbl-cell text-center b-r align-top pt-1.5 font-normal">73089090</td>
                    <td className="tbl-cell text-center b-r align-top pt-1.5 font-normal">18%</td>
                    <td className="tbl-cell text-center b-r align-top pt-1.5 font-normal">39 NOS</td>
                    <td className="tbl-cell text-right b-r align-top pr-1.5 pt-1.5 font-bold">600.00</td>
                    <td className="tbl-cell text-center b-r align-top pt-1.5 italic font-normal font-serif">NOS</td>
                    <td className="tbl-cell text-right align-top pr-1.5 pt-1.5 font-normal">23,400.00</td>
                  </tr>
                </>
              )}

              {/* Vertical Fill Height Spacer Row (Maintains Vertical Lines Down) */}
              <tr style={{ height: `${spacerHeight}px` }}>
                <td className="b-r"></td>
                <td className="b-r"></td>
                <td className="b-r"></td>
                <td className="b-r"></td>
                <td className="b-r"></td>
                <td className="b-r"></td>
                <td className="b-r"></td>
                <td></td>
              </tr>

              {/* Summary Row 1: Taxable Amount */}
              <tr>
                <td className="b-r"></td>
                <td className="b-r text-right pr-2 py-0.5 font-bold italic text-[11px]">
                  Taxable Amount
                </td>
                <td className="b-r"></td>
                <td className="b-r"></td>
                <td className="b-r"></td>
                <td className="b-r"></td>
                <td className="b-r"></td>
                <td className="text-right pr-1.5 py-0.5 font-bold text-[11px]">
                  {fmtNum(totals.subtotal || 78000)}
                </td>
              </tr>

              {/* Summary Row 2 & 3: Tax Breakdown */}
              {isIndia && isInterstate ? (
                <tr>
                  <td className="b-r"></td>
                  <td className="b-r text-right pr-2 py-0.5 font-bold italic text-[11px]">
                    IGST {firstItemTax}%
                  </td>
                  <td className="b-r"></td>
                  <td className="b-r"></td>
                  <td className="b-r"></td>
                  <td className="b-r"></td>
                  <td className="b-r"></td>
                  <td className="text-right pr-1.5 py-0.5 font-bold text-[11px]">
                    {fmtNum(totals.igst)}
                  </td>
                </tr>
              ) : isIndia ? (
                <>
                  <tr>
                    <td className="b-r"></td>
                    <td className="b-r text-right pr-2 py-0.5 font-bold italic text-[11px]">
                      CGST {halfTax.toFixed(1)}%
                    </td>
                    <td className="b-r"></td>
                    <td className="b-r"></td>
                    <td className="b-r"></td>
                    <td className="b-r"></td>
                    <td className="b-r"></td>
                    <td className="text-right pr-1.5 py-0.5 font-bold text-[11px]">
                      {fmtNum(totals.cgst || 7020)}
                    </td>
                  </tr>
                  <tr>
                    <td className="b-r"></td>
                    <td className="b-r text-right pr-2 py-0.5 font-bold italic text-[11px]">
                      SGST {halfTax.toFixed(1)}%
                    </td>
                    <td className="b-r"></td>
                    <td className="b-r"></td>
                    <td className="b-r"></td>
                    <td className="b-r"></td>
                    <td className="b-r"></td>
                    <td className="text-right pr-1.5 py-0.5 font-bold text-[11px]">
                      {fmtNum(totals.sgst || 7020)}
                    </td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td className="b-r"></td>
                  <td className="b-r text-right pr-2 py-0.5 font-bold italic text-[11px]">Tax</td>
                  <td className="b-r"></td>
                  <td className="b-r"></td>
                  <td className="b-r"></td>
                  <td className="b-r"></td>
                  <td className="b-r"></td>
                  <td className="text-right pr-1.5 py-0.5 font-bold text-[11px]">
                    {fmtNum((totals.cgst || 0) + (totals.sgst || 0) + (totals.igst || 0))}
                  </td>
                </tr>
              )}

              {/* Optional Cess */}
              {totals.cess > 0 && (
                <tr>
                  <td className="b-r"></td>
                  <td className="b-r text-right pr-2 py-0.5 font-bold italic text-[11px]">GST Cess</td>
                  <td className="b-r"></td>
                  <td className="b-r"></td>
                  <td className="b-r"></td>
                  <td className="b-r"></td>
                  <td className="b-r"></td>
                  <td className="text-right pr-1.5 py-0.5 font-bold text-[11px]">
                    {fmtNum(totals.cess)}
                  </td>
                </tr>
              )}

              {/* Total Row */}
              <tr
                className="font-bold text-[11px] b-t-bold b-b"
              >
                <td className="b-r py-1"></td>
                <td className="b-r text-right pr-2 py-1 font-bold italic text-[11px]">Total</td>
                <td className="b-r py-1"></td>
                <td className="b-r py-1"></td>
                <td className="b-r text-center py-1 font-bold text-[11px]">{totalQty || 312}</td>
                <td className="b-r py-1" colSpan={2}></td>
                <td className="text-right pr-1.5 py-1 font-bold text-[12px]">
                  ₹{fmtNum(totals.total || 92040)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 4. Total Amount in Words Row */}
        {showAmountWords && (
          <div className="b-b p-1.5 pl-2 text-[10.5px]">
            <span className="text-black font-normal">Total amount (in words):</span>
            <span className="font-bold text-black ml-1">
              {wordsString || 'INR Ninety-Two Thousand And Forty Rupees Only'}.{' '}
              <span className="italic font-normal">E & O.E</span>
            </span>
          </div>
        )}

        {/* 5. Bank Details & Authorization Footer */}
        <div className="grid grid-cols-12 text-[10.5px]">
          {/* Bank Information */}
          <div className="col-span-8 b-r p-2 flex flex-col justify-between min-h-[110px]">
            <div>
              {showBankDetails && (
                <>
                  <div className="font-bold text-black mb-0.5">Bank Details:</div>
                  <div className="grid grid-cols-12 leading-tight">
                    <div className="col-span-3 text-black font-normal">Bank:</div>
                    <div className="col-span-9 font-bold text-black">{bankName}</div>

                    <div className="col-span-3 text-black font-normal">Account #:</div>
                    <div className="col-span-9 font-bold text-black">{accountNo}</div>

                    <div className="col-span-3 text-black font-normal">IFSC Code:</div>
                    <div className="col-span-9 font-bold text-black">{ifsc}</div>

                    <div className="col-span-3 text-black font-normal">Branch:</div>
                    <div className="col-span-9 font-bold text-black">{branch}</div>
                  </div>
                </>
              )}
            </div>

            {/* UPI QR Code if enabled */}
            {showUPI && qrDataUrl && upiId && (
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={qrDataUrl}
                  alt="UPI QR"
                  className="w-10 h-10 border border-slate-300 rounded"
                />
                <div className="text-[8px] leading-tight">
                  <span className="font-bold block">Scan to Pay via UPI</span>
                  <span className="font-normal">{upiId}</span>
                </div>
              </div>
            )}

            <div className="font-bold text-black mt-2">{businessDisplayName}</div>
          </div>

          {/* Authorized Signatory */}
          <div className="col-span-4 p-2 flex flex-col justify-between items-end min-h-[110px]">
            <div className="text-[9.5px] text-[#4b5563] font-normal tracking-wide">For {businessDisplayName}</div>
            {showSignature && profile?.signature && (
              <div className="my-auto">
                <img
                  src={profile.signature}
                  alt="Signature"
                  className="max-h-9 max-w-[120px] object-contain"
                />
              </div>
            )}
            <div className="text-[10px] text-[#4b5563] font-normal">Authorized Signatory</div>
          </div>
        </div>

        {/* 6. Terms & Conditions Footer */}
        <div className="b-t p-2 text-[10px] bg-white">
          <div className="font-bold text-black mb-0.5">Terms and Conditions:</div>
          {hasTerms && showTerms ? (
            <div
              className="text-black space-y-0.5 leading-tight font-normal"
              dangerouslySetInnerHTML={{ __html: termsHtml }}
            />
          ) : (
            <div className="text-black space-y-0.5 leading-tight font-normal">
              <div>1. 50% advance payment and 50% on material dispatch.</div>
              <div>2. Price includes GST.</div>
              <div>3. Quotation valid for 30 days.</div>
            </div>
          )}

          {/* Notes if enabled */}
          {hasNotes && showNotes && (
            <div className="mt-2 border-t border-slate-100 pt-1 font-normal">
              <div className="font-bold text-black mb-0.5">Notes:</div>
              <div dangerouslySetInnerHTML={{ __html: notesHtml }} />
            </div>
          )}
        </div>

        {/* Extra Sections if configured */}
        {extraSections && extraSections.length > 0 && (
          <>
            {extraSections.map((sec, i) => (
              <div
                key={sec.id || i}
                style={{ pageBreakBefore: 'always', padding: '10px', borderTop: `${baseWidth} solid ${borderColor}` }}
              >
                <h3 style={{ fontSize: '10px', fontWeight: 700, marginBottom: '4px' }}>{sec.title}</h3>
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(sec.content || '') }} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ExactInvoiceLayout;
