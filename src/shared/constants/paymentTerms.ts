export interface TermsPreset {
  id: string;
  label: string;
  region: string;
  body: string;
}

export const TERMS_PRESETS: TermsPreset[] = [
  {
    id: 'generic-sme',
    label: 'Generic SME / Trader',
    region: 'IN',
    body: `<p><strong>Payment Terms</strong></p>
<ul>
  <li>Payment is due within <strong>15 days</strong> from the date of invoice.</li>
  <li>Goods once sold will not be taken back or exchanged.</li>
  <li>Interest @ <strong>18% p.a.</strong> will be charged on overdue payments.</li>
  <li>All cheques to be drawn in favour of the company name printed above.</li>
</ul>
<p><strong>Delivery & Title</strong></p>
<ul>
  <li>Goods remain the property of the seller until full payment is received.</li>
  <li>Risk passes to the buyer on dispatch from our premises.</li>
</ul>
<p><strong>Disputes:</strong> Subject to <em>[your city]</em> jurisdiction only.</p>`,
  },
  {
    id: 'freelancer',
    label: 'Freelancer / Consultant',
    region: 'IN',
    body: `<p><strong>Scope</strong></p>
<ul>
  <li>This invoice is for professional services as agreed in our scope of work.</li>
  <li>Any work outside the agreed scope will be quoted separately.</li>
</ul>
<p><strong>Payment</strong></p>
<ul>
  <li>Payment is due within <strong>7 days</strong> from invoice date.</li>
  <li>Late payments accrue interest at <strong>1.5% per month</strong>.</li>
  <li>TDS, if applicable, may be deducted under Section 194J. Please share Form 16A.</li>
</ul>
<p><strong>Intellectual Property:</strong> Final deliverables transfer to client only after the full invoice value is settled.</p>
<p>Disputes subject to <em>[your city]</em> jurisdiction.</p>`,
  },
  {
    id: 'manufacturer',
    label: 'Manufacturer / Wholesale',
    region: 'IN',
    body: `<p><strong>Order & Delivery</strong></p>
<ul>
  <li>Goods are dispatched ex-works unless otherwise agreed in writing.</li>
  <li>Delivery dates are estimates; we are not liable for delays caused by transporters or force majeure events.</li>
  <li>Buyer is responsible for inspection of goods at the time of delivery.</li>
</ul>
<p><strong>Payment</strong></p>
<ul>
  <li>Net <strong>30 days</strong> from date of invoice.</li>
  <li>Interest @ <strong>24% p.a.</strong> on overdue amounts.</li>
  <li>TDS under Section 194Q applicable for buyers with turnover &gt; ₹10 cr.</li>
</ul>
<p><strong>Returns:</strong> Goods sold are not returnable unless defective and notified within 7 days of delivery.</p>
<p>Subject to <em>[your city]</em> jurisdiction.</p>`,
  },
  {
    id: 'retail-shop',
    label: 'Retail Shop',
    region: 'IN',
    body: `<ul>
  <li><strong>No exchange or refund</strong> on goods once sold, except in case of manufacturing defects within 7 days, with original bill.</li>
  <li>Discounted items are not eligible for return or exchange.</li>
  <li>Goods may be exchanged of equal value within 7 days, subject to availability.</li>
  <li>Cheques to be drawn in favour of <em>[shop name]</em>. Interest @ 24% p.a. on dishonoured cheques.</li>
  <li>All disputes subject to <em>[your city]</em> jurisdiction only.</li>
</ul>`,
  },
  {
    id: 'restaurant',
    label: 'Restaurant / Café',
    region: 'IN',
    body: `<ul>
  <li>Service charge, where applicable, is at the discretion of the customer.</li>
  <li>GST as applicable is included as per current government rates.</li>
  <li>Cheques are not accepted. Card and UPI welcomed.</li>
  <li>We reserve the right of admission.</li>
  <li>Disputes subject to <em>[your city]</em> jurisdiction.</li>
</ul>`,
  },
  {
    id: 'it-saas',
    label: 'IT / Software Services',
    region: 'IN',
    body: `<p><strong>Service Terms</strong></p>
<ul>
  <li>Services are billed on a project / monthly retainer basis as agreed.</li>
  <li>Software licenses, third-party services, and infrastructure costs are billed at actuals.</li>
</ul>
<p><strong>Payment</strong></p>
<ul>
  <li>Net <strong>15 days</strong> from invoice date.</li>
  <li>Late payments accrue interest at <strong>18% p.a.</strong></li>
  <li>TDS under Section 194J applicable.</li>
</ul>
<p><strong>SLA & Support:</strong> Support is provided per the agreed SLA. Outages caused by hosting providers, third-party APIs, or scheduled maintenance are excluded.</p>
<p><strong>IP & Confidentiality:</strong> Custom code is licensed to client on full settlement. Confidential information is protected per the signed NDA.</p>
<p>Subject to <em>[your city]</em> jurisdiction.</p>`,
  },
  {
    id: 'construction',
    label: 'Construction / Contractor',
    region: 'IN',
    body: `<p><strong>Work & Materials</strong></p>
<ul>
  <li>Work is executed per the approved drawings and BOQ.</li>
  <li>Any change orders or additional work will be billed separately at agreed rates.</li>
  <li>Materials remain the property of the contractor until full payment is received.</li>
</ul>
<p><strong>Payment Schedule</strong></p>
<ul>
  <li>Payment as per agreed milestones in the contract.</li>
  <li>Final payment due within <strong>30 days</strong> of completion certificate.</li>
  <li>TDS under Section 194C applicable.</li>
  <li>Retention, if any, will be released as per the contract terms.</li>
</ul>
<p><strong>Defects Liability:</strong> 12 months from handover, covering workmanship only.</p>
<p>Subject to <em>[your city]</em> jurisdiction.</p>`,
  },
  {
    id: 'medical',
    label: 'Medical / Healthcare',
    region: 'IN',
    body: `<ul>
  <li>Medicines and consumables once sold cannot be exchanged or returned (Drugs and Cosmetics Rules).</li>
  <li>Services rendered are non-refundable.</li>
  <li>Payment is due at the time of service unless covered by a pre-authorized insurance claim.</li>
  <li>Insurance reimbursement is between patient and insurer; we provide all documentation needed.</li>
  <li>Disputes subject to <em>[your city]</em> jurisdiction.</li>
</ul>`,
  },
  {
    id: 'education',
    label: 'Educational Services / Coaching',
    region: 'IN',
    body: `<ul>
  <li>Fees are non-refundable once classes commence, except as per the published refund policy.</li>
  <li>Course material remains the property of the institute and may not be reproduced without permission.</li>
  <li>Late fee of ₹500 per month after the due date.</li>
  <li>The institute reserves the right to reschedule or cancel classes with prior notice.</li>
  <li>Disputes subject to <em>[your city]</em> jurisdiction.</li>
</ul>`,
  },
  {
    id: 'transport',
    label: 'Transport / Logistics',
    region: 'IN',
    body: `<ul>
  <li>Goods are carried at <strong>owner's risk</strong> unless transit insurance is separately arranged and paid for.</li>
  <li>Delivery times are best-effort estimates and not guaranteed.</li>
  <li>Liability for loss or damage is limited to ₹100 per consignment unless declared value is paid.</li>
  <li>Demurrage / detention charges as per the schedule attached.</li>
  <li>Payment due within <strong>15 days</strong>; interest @ 24% p.a. on overdue amounts.</li>
  <li>Subject to <em>[your city]</em> jurisdiction.</li>
</ul>`,
  },
  {
    id: 'real-estate-rent',
    label: 'Real Estate / Rental Invoice',
    region: 'IN',
    body: `<ul>
  <li>Rent is payable on or before the <strong>5th of every month</strong>.</li>
  <li>Late payments attract a penalty of ₹100 per day after grace period.</li>
  <li>TDS under Section 194I applicable for tenant if annual rent exceeds ₹2.4 lakh.</li>
  <li>Maintenance, electricity, and water charges are billed separately as per usage.</li>
  <li>Premises must be vacated in the same condition as handed over, normal wear and tear excepted.</li>
  <li>Disputes subject to <em>[your city]</em> jurisdiction.</li>
</ul>`,
  },
  {
    id: 'ecommerce',
    label: 'E-commerce Seller',
    region: 'IN',
    body: `<ul>
  <li>Returns accepted within 7 days of delivery, in original packaging, subject to product category policy.</li>
  <li>Refunds are processed to the original payment mode within 7-10 working days of return receipt.</li>
  <li>Products with broken seals, used items, and clearance-sale items are not returnable.</li>
  <li>Shipping charges, where applicable, are non-refundable.</li>
  <li>For warranty, please contact the manufacturer's authorized service center.</li>
  <li>Disputes subject to <em>[your city]</em> jurisdiction. Governed by the Consumer Protection Act, 2019.</li>
</ul>`,
  },
  {
    id: 'export',
    label: 'Export / International (LUT)',
    region: 'IN',
    body: `<p><strong>Tax Status:</strong> Supplied as a zero-rated export under <strong>LUT (Letter of Undertaking)</strong> — IGST not charged. Bond / LUT reference: <em>[insert LUT number]</em>.</p>
<p><strong>Payment</strong></p>
<ul>
  <li>Payable in <em>[USD/EUR/etc.]</em> by SWIFT wire transfer to the bank account printed above.</li>
  <li>All bank charges (sender + intermediary + beneficiary) are to be borne by the buyer.</li>
  <li>Payment due within <strong>30 days</strong> of invoice date.</li>
</ul>
<p><strong>Delivery:</strong> FOB / CIF as per Incoterms 2020 — see the contract for the agreed term.</p>
<p>Disputes subject to <em>[your city]</em>, India jurisdiction.</p>`,
  },
  {
    id: 'custom-blank',
    label: '— Start from blank —',
    region: '*',
    body: '',
  },
];
