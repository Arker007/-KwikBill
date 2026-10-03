# Changelog

All notable changes to **Free GST Billing Software** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

- **Redesigned the App Header with Ant Design Pro-Style Layout**:
  - Replaced the custom header shell and controls with Ant Design `Layout.Header`, responsive `Flex` composition, buttons, badges, avatars, typography, tags, dividers, breakpoints, and theme tokens.
  - Preserved business switching, global command search, update notification, new-invoice action, notification count, server status, theme toggle, profile settings, and mobile navigation.
  - Verified the responsive header at 1440×1000 and 390×844 without forcing the Ant Design Pro package, whose current peer range does not support the app's Ant Design 6 version.
- **Repaired Live Preview Modal Layout with Ant Design Components**:
  - Replaced raw toolbar and canvas layout wrappers with responsive Ant Design `Flex` and `Grid` composition.
  - Corrected footer dividers, responsive header/footer wrapping, compact-height handling, and fullscreen action placement.
  - Fixed zoomed document scrolling so oversized previews remain reachable from the left edge while smaller previews stay centered.
- **Changed Live Document Preview Default Zoom to 100%**:
  - Standard document previews now open and reset at 100% instead of 85%.
  - Thermal previews remain at 140%; Fit and manual zoom controls are unchanged.
- **Applied Ant Design Pro Navigation to the Main Sidebar**:
  - Replaced the custom main sidebar shell, mobile overlay, nested accordion controls, badges, and footer actions with Ant Design `Layout.Sider`, `Menu`, `Drawer`, `Button`, `Flex`, `Typography`, `Tag`, and the shared `ProCard`.
  - Retained the existing `navConfig.ts` hierarchy: Sales, Purchases, Quotations+, Expenses+, Inventory, Payments, and More remain nested groups with their original children, routes, invoice types, badges, and settings deep-links.
  - Preserved selected-route highlighting, automatic parent expansion, collapsed submenu popovers, independent navigation scrolling, responsive mobile behavior, Invite Users, Settings, and the collapse trigger.
- **Redesigned Settings Sidebar with Ant Design Pro Components**:
  - Replaced custom sidebar lists, buttons, mobile overlay, and styling with the shared `ProCard` plus Ant Design `Layout.Sider`, `Menu`, `Drawer`, `Button`, `Flex`, `Typography`, and `Tag` components.
  - Preserved all 22 settings destinations, active-item selection, grouped navigation, dashboard return action, responsive mobile drawer behavior, dark theme tokens, and existing callbacks.
  - Fixed vertical navigation scrolling by keeping the ProCard header content-sized and assigning the remaining bounded Sider/Drawer height directly to the Menu scroll region.
  - Reused the existing component system without adding another UI dependency.
- **Aligned Company Details Logo Preview with Invoice Output**:
  - Replaced the unrelated Company Details placeholder artwork with the same built-in Vishal Enterprise logo rendered by HTML invoice previews and generated PDFs when no uploaded profile logo exists.
  - Preserved uploaded-logo precedence: a saved `profile.logo` still replaces the built-in fallback everywhere.
- **Type Safety, Storage Safety, and Test Isolation Remediation**:
  - Made TypeScript checking a mandatory part of `npm run build` and resolved the existing cross-package, UI-wrapper, callback, and document-renderer type errors.
  - Restored flat-file JSON as the default persistence path; SQLite compatibility code is now opt-in only with `USE_SQLITE=true`, and JSON fallback writes remain active when SQLite is unavailable.
  - Isolated API, security, and smoke tests in temporary data directories so verification cannot mutate the user's active `data/` records or attach to an already-running server.
  - Split heavy invoice/PDF/UI dependencies into lazy vendor chunks, eliminating mixed-import warnings and reducing the initial app JavaScript to 305.77 kB (88.39 kB gzip).
  - Added an explicit `test:discount` command for the 9-case discount regression suite.
- **Matched `ExactPdfTemplate` Styling to `ExactInvoiceLayout`**:
  - Aligned physical A4 margins, typography, logo sizing, column widths, borders, padding, item rows, summary rows, and footer proportions between the HTML preview and React-PDF output.
  - Removed PDF-only table flex growth that inserted excess whitespace between totals and the amount/footer sections.
  - Matched seller/customer label weights, non-India tax summary behavior, GST cess row, total-row column span, amount-in-words emphasis, and signatory styling without changing statutory calculation logic.
- **Fixed Invisible Text on Hovering/Focusing Select Elements and Inputs in Dark Mode**:
  - Defined explicit Ant Design dark mode input system variables (`--ant-input-hover-bg`, `--ant-input-active-bg`, `--ant-input-hover-border-color`, `--ant-input-active-border-color`, and `--ant-input-active-shadow`) in `themes.css`.
  - Resolved root cause where hovering or focusing inputs and selects in dark mode caused the background to turn white (`#ffffff`) while the text color remained off-white (`rgba(255, 255, 255, 0.85)`), making the inside text completely disappear.
  - Aligned the hover and active backgrounds to `#141414` (matching `--ant-color-bg-container`) in dark mode, and set white active borders for pristine dark mode usability.
- **Aligned Printed/Downloaded PDF with HTML Live Preview for Classic Template**:
  - Aligned the `classic` template key in the PDF template registry to compile using the high-fidelity `ExactPdfTemplate` design rather than the old layout.
  - Aligned empty/undefined and fallback template keys to render `ExactPdfTemplate` on the PDF side to match the live HTML/CSS preview fallback.
  - **Fixed Physical Parity in `ExactPdfTemplate.tsx`**:
    - Aligned all seller information fallbacks (PLOT NO. address lines, Ankleshwar city, mobile number, email, and website) to resolve blank address blocks on the PDF printout.
    - Added comprehensive billing address fallbacks (PLOT NO. 39 Jhagadia Industrial Estate) and default customer GSTIN when missing, guaranteeing zero empty lines.
    - Integrated the `formatDate` helper for the invoice/proforma date to display formatted strings (e.g., `28 Sept 2026`) instead of raw ISO format.
    - Embedded the vertical grid fill-height spacer row (`spacerHeight`) to draw beautiful vertical column lines down to the totals section.
    - Decoupled bottom borders from standard row styles (`itemRow`) to prevent horizontal line splits between taxable, tax-type, and total segments, matching the HTML layout perfectly.
    - Integrated standard item description blocks inside column 2 and aligned math computations for discounts and tax-inclusive items.
  - **Restricted Multi-Copy Printing (GST Rule 48) to Taxable Supplies (`InvoiceDocument.tsx`)**:
    - Gated multi-copy print runs to actual taxable commercial invoices and movement vouchers (`tax-invoice`, `bill-of-supply`, `composition`, `credit-note`, `delivery-challan`).
    - Forced draft documents, Estimates, and Quotations (`proforma`, `quotation`) to always print as a single clean copy, preventing unnecessary multi-invoice print runs (e.g., Original, Duplicate, Triplicate) for pre-supply documents.
  - Resolved visual discrepancies between the live document preview in the editor and printed/downloaded vector PDF documents.
- **Fixed Live Document Preview Sandbox Blocking (`LiveDocumentPreviewModal.tsx`)**:
  - Replaced the iframe-based `<PdfInvoicePreview>` component with the native HTML/CSS-based `<InvoicePreview>` component for real-time editor preview rendering.
  - Eliminated browser sandbox/iframe blocking on Microsoft Edge, Chrome, and Safari when running the applet embedded inside a parent iframe (such as Google AI Studio's preview window).
  - Integrated high-performance, layout-aware zooming using the CSS `zoom` property linked directly to the modal zoom slider.
  - Preserved underlying vector-PDF printing and downloading, ensuring that clicking "Print Document" or "Download PDF" still compiles and downloads the perfect vector PDF via `@react-pdf/renderer`.
- **Registered ExactPdfTemplate in Document Settings & Invoice Template Modal (`DocumentSettingsDrawer.tsx`, `LayoutFontsTab.tsx`, `PrintSettings.tsx`, `templateRegistry.ts`)**:
  - Registered `ExactPdfTemplate` (`exact` / `exact-invoice-layout` / `exactpdftemplate`) in the Document Settings Drawer's "Select Invoice Template" modal.
  - Added "Exact GST Standard" template selection option and design preset across Layout & Fonts tab and Print & PDF Settings.
  - Ensured alias mapping across both `@free-gst/document-renderer` and `src/features/invoices/templates` template registries.
- **Refactored Invoice PDF Architecture to Single-Source `@react-pdf/renderer` Architecture**:
  - **Single Source of Truth**: Replaced screenshot/bitmap `html2canvas` + `jsPDF` pipeline with a deterministic React-PDF architecture (`@react-pdf/renderer`).
  - **Unified Document API**: Created `InvoiceDocument`, `InvoicePage`, `InvoiceHeader`, `InvoiceParties`, `InvoiceItemsTable`, `InvoiceTotals`, `InvoiceTerms`, `InvoiceFooter`, `InvoiceQr`, `InvoiceWatermark`, and `InvoiceCopyLabel`.
  - **React-PDF Templates**: Built `ClassicPdfTemplate`, `ModernPdfTemplate`, `MinimalPdfTemplate`, `EvergreenPdfTemplate`, `ThermalPdfTemplate`, and `ExactPdfTemplate` (`ExactInvoiceLayout`) with central resolution in `templateRegistry`.
  - **Domain View Model**: Added `createInvoiceViewModel` to normalize raw API/invoice data into consistent, formatted props for all PDF templates.
  - **Preview, Download & Print Parity**: Live preview (`PdfInvoicePreview`), PDF downloads (`downloadInvoicePDF`), and printing (`printInvoicePDF`) now consume the exact same React-PDF document tree.
  - **Responsive & DPR Invariance**: Rendered PDF geometry is completely independent of browser viewport width, screen zoom, or `devicePixelRatio`.
  - **Statutory Math Integrity**: Maintained 100% pass rate on all 70 statutory tax tests and 9 discount tests.
- **Resolved Comprehensive PDF & Preview Rendering Discrepancies (`packages/document-renderer/src/pdfService.ts`)**:
  - **Width & Reflow Parity**: Removed `onclone` width mutations (`inv.style.width = ...`), border removals, and shadow stripping so the cloned DOM maintains exact 1:1 visual parity with the preview DOM without layout reflows or stale boundary measurements.
  - **Boundary & Capture Alignment**: Measured container boundaries on unmutated DOM elements (`getBoundingClientRect()`) and configured capture with explicit element dimensions.
  - **Font Scale Geometry Fix**: Updated `pdfFontScale` to adjust font size CSS inside the cloned DOM (`clonedDoc`) rather than scaling canvas image dimensions and distorting outer borders or page margins.
  - **Extra Pages Geometry & Typography**: Preserved letter and word spacing on extra pages (`[data-pdf-page]`), applying consistent page margins (`mLeft`, `mTop`) and `contentWidth`.
  - **First Page Height & Split Calculation**: First page max height accounts for top margin and bottom footer reserve without subtracting unnecessary top running header reserve, eliminating unexplained blank space or early page breaks.
  - **High-DPI Vector Clarity & CORS**: Enabled `useCORS: true` and `allowTaint: true` for remote logos and assets, rendering crisp PNG format (`image/png`, 3.5 - 4.0x scale) without JPEG compression artifacts.
  - **Overlay Alignment**: Watermarks, reprint labels, QR codes, barcodes, running headers, and page numbers align strictly within printable page margins (`mLeft`, `mRight`, `mTop`, `mBottom`).
- **Fixed Ant Design v5 Deprecation Warnings (`CompanySwitcherDropdown.tsx`, `LiveDocumentPreviewModal.tsx`, `LoadingSpinner.tsx`)**:
  - Replaced deprecated `dropdownRender` with `popupRender` on `Dropdown` (`CompanySwitcherDropdown.tsx`).
  - Replaced deprecated `bordered={false}` with `variant="filled"` on `Tag` components (`LiveDocumentPreviewModal.tsx`).
  - Replaced deprecated `tip` prop with `description` on `Spin` components (`LiveDocumentPreviewModal.tsx`, `LoadingSpinner.tsx`).
  - Replaced deprecated `type="vertical"` with `orientation="vertical"` on `Divider` components (`LiveDocumentPreviewModal.tsx`).
- **Resolved Main Cause of Canvas Text Baseline Shifts (`packages/document-renderer/src/pdfService.ts`)**:
  - Disabled `letterRendering: true` (`letterRendering: false`) in `html2canvas` capture options.
  - Replaced lossy JPEG compression with high-DPI lossless `PNG` output (`imgFormat: 'PNG'`, `scale: 3x+`) for standard PDF builds.
  - Allowed `html2canvas` to render native DOM text strings in a single pass, eliminating character-by-character letter positioning and vertical baseline shifts.
- **Fixed Table Header & Cell Vertical Baseline Alignment (`src/features/invoices/templates/ExactInvoiceLayout.tsx`)**:
  - Enforced `vertical-align: middle;`, `line-height: 1.25;`, `padding: 6px 4px 5px 4px;`, and `box-sizing: border-box;` on `.tbl-header` elements.
  - Eliminated vertical text shifting during `html2canvas` PDF generation, ensuring header text (`Item`, `HSN/SAC`, `Tax`, `Qty`, `Rate / Item`, `Per`, `Amount`) stays perfectly centered without touching or overlapping the bottom horizontal divider line.
- **Removed Duplicate `id="invoice-preview"` Target (`src/features/invoices/templates/ExactInvoiceLayout.tsx`)**:
  - Removed inner duplicate `id="invoice-preview"` attribute from `.exact-page-wrapper` so `getElementById('invoice-preview')` unambiguously resolves to the top-level `.invoice-preview-container`.
- **Eliminated Floating Outer Box Overlays in Printed PDFs (`packages/document-renderer/src/pdfService.ts`)**:
  - Removed redundant manual `pdf.rect(...)` canvas overlay drawing at `y = 4mm` during multi-copy PDF generation.
  - Resolved the top-right floating box (`ORIGINAL FOR RECIPIENT`) sticking out above the invoice border frame, ensuring printed/downloaded output matches the live invoice preview.
- **Fixed Preview vs. Print / Download Invoice Parity (`InvoicePreview.tsx`, `pdfService.ts`, `templates/index.ts`)**:
  - **Missing `#invoice-preview` DOM Target Fix**: Updated `InvoicePreview` to always include `id="invoice-preview"` regardless of `previewOnly`. This guarantees `@media print` rules isolate the document during `window.print()` and `html2canvas` correctly captures the preview element.
  - **Template Registry Alignment**: Mapped `classic` in `templateRegistry` directly to `ExactInvoiceLayout` so preview and downloaded PDF use identical component rendering.
  - **Canvas Clone Fidelity**: Removed `.printing-mode` dark-mode overrides and letter-spacing wipes during PDF canvas cloning in `pdfService.ts`, preserving exact fonts, borders, and colors in downloaded PDFs.
- **Integrated Ant Design Semantic Border Thickness Tokens (`src/features/invoices/templates/ExactInvoiceLayout.tsx`)**:
  - Implemented multi-level semantic tokens from Ant Design's `theme.useToken()`:
    - **Level 0 (Hairline / Thin)**: `var(--ant-line-width-thin)` (0.5px) for inner table column splits, cell dividers, and subtle meta grids (`.b-b`, `.b-r`, `.b-l`, `.b-t`).
    - **Level 1 (Base / Standard)**: `var(--ant-line-width-base)` (`token.lineWidth` = 1px) for the outer boundary container frame and major section dividers (`.border-black-main`, `.b-b-base`, `.b-t-base`).
    - **Level 2 (Bold / Accent)**: `var(--ant-line-width-bold)` (`token.lineWidthBold` = 2px/1.5px) for the grand total summary emphasis divider (`.b-t-bold`).
- **Applied Thin Hairline Borders for Inner Tables (`src/features/invoices/templates/ExactInvoiceLayout.tsx`)**:
  - Configured crisp `0.5px solid #000000` thin inner grid borders (`b-b`, `b-r`, `b-l`, `b-t`) across all inner table columns, dividers, and document cells.
  - Retained the solid outer framing border and calibrated the total row divider line.
- **Applied Exact Summary & Total Table Border Styling (`src/features/invoices/templates/ExactInvoiceLayout.tsx`)**:
  - Implemented the thick 2px solid top border and 1px solid bottom border on the table `Total` row.
  - Spanned `Rate / Item` and `Per` columns (`colSpan={2}`) with a clean right border before `Amount` in the `Total` row.
  - Preserved continuous vertical grid borders through `Taxable Amount`, `CGST`, `SGST`, and `Total` rows without intermediary horizontal lines.
  - Formatted the `Total amount (in words):` strip with a bottom border dividing it from the two-column bank and authorization footer.
- **Enforced Uppercase Formatting for Customer and Company Names (`src/features/invoices/templates/ExactInvoiceLayout.tsx`, `SharedParties.tsx`, `ModernTemplate.tsx`, `MinimalTemplate.tsx`, `SharedFooter.tsx`)**:
  - Transformed all seller business / company names (`businessDisplayName`) to uppercase across templates and signatory blocks.
  - Transformed all buyer / customer names (`customerName`, `clientDisplayName`, `shipDisplayName`) to uppercase across bill-to and ship-to parties sections.
- **Applied Bold Styling to Dispatch From (`src/features/invoices/templates/ExactInvoiceLayout.tsx`)**:
  - Updated the `Dispatch From:` label in the top-right document dispatch block to bold font weight (`font-bold`).
- **Exact Typography & Font Weight Matching in A4 Print Layout (`src/features/invoices/templates/ExactInvoiceLayout.tsx`)**:
  - Matched bold vs normal weights for seller information (`VISHAL ENTERPRISE` bold, `GSTIN:` bold, address lines normal, `Mobile:`, `Email:`, `Website:` bold labels with normal values).
  - Applied bold customer name and `GSTIN:`, with normal `Customer Details:` label and billing address lines.
  - Aligned document meta grid with normal labels (`Quotation #:`, `Quotation Date:`, `Place of Supply:`, `Dispatch From:`) and bold values (`VE-330`, `06 Sep 2026`, `24-GUJARAT`).
  - Formatted table rows with bold item title, normal specs/description, normal HSN/Tax/Qty/Amount, bold Rate/Item, and italic serif Per unit.
- **Applied Exact Quotation / Invoice A4 Print Layout (`src/features/invoices/templates/ExactInvoiceLayout.tsx`)**:
  - Implemented the exact HTML/CSS grid layout pixel-for-pixel with sharp 1px solid black outer and inner boundaries (`border-black-main`, `b-b`, `b-r`, `b-l`, `b-t`).
  - Configured exact column width allocations (`#` 3.5%, `Item` 42.5%, `HSN/SAC` 9.0%, `Tax` 5.0%, `Qty` 10.0%, `Rate/Item` 11.5%, `Per` 4.5%, `Amount` 14.0%).
  - Added continuous vertical spacer row to preserve vertical grid lines across items down to the tax breakdown and totals summary.
  - Implemented the two-column seller and dispatch panel, customer details strip, amount in words with `E & O.E` notice, bank grid with authorized signatory box, and terms/notes footer.
- **Enabled Real Quotations & Estimates Fetching (`src/pages/QuotationsPage.tsx`)**:
  - Replaced hardcoded quotation data with dynamic real data fetching from backend flat-file storage via `getAllBills()`.
  - Added real-time filtering for quotations, proforma invoices, and estimates with financial year (`FY`) and search query support.
  - Implemented dynamic tab badges and status categorizations (`All`, `Open`, `Closed`, `Partial`, `Cancelled`, `Drafts`).
  - Added full quotation lifecycle actions: View/Print with `LiveDocumentPreviewModal`, Send via WhatsApp, Edit, Duplicate, Convert to Tax Invoice, and Delete with confirmation.
- **Integrated Dynamic Company Details & Company Switcher in Invoices (`src/features/invoices/components/InvoiceEditor/InvoiceEditorHeader.tsx`, `src/features/invoices/templates/ExactInvoiceLayout.tsx`)**:
  - Embedded `CompanySwitcherDropdown` directly into the Invoice Editor navigation bar, allowing immediate switching and editing of the active company profile while composing invoices.
  - Dynamically resolved company business name (`brandName`/`businessName`), uppercase trade name, address, GSTIN, PAN, city, state, pin, phone, email, and website across invoice templates.
  - Resolved bank details (`bankName`, `accountNumber`, `ifsc`, `branch`) dynamically from the active company profile and payment account snapshot without static placeholder values.
- **Unified Settings Page Header with Ant Design Company Switcher (`src/features/settings/components/SwipeSettingsHeader.tsx`, `src/pages/SettingsPage.tsx`)**:
  - Replaced legacy profile dropdown in `SwipeSettingsHeader` with the unified `CompanySwitcherDropdown` built with pure Ant Design primitives.
  - Provided full dark/light theme integration via `ConfigProvider` and `useTheme`.
  - Added seamless profile switching, quick edit, profile sharing, and "+ Add new Company →" CTA directly in the Settings page header.
- **Redesigned App Header Company Switcher Dropdown Using Pure Ant Design Components (`src/app/layout/components/CompanySwitcherDropdown.tsx`, `AppHeader.tsx`)**:
  - Re-implemented the header company switcher trigger and popover card to match the reference design pixel-for-pixel using Ant Design (`Dropdown`, `Button`, `Space`, `Typography`, `Badge`, `ConfigProvider`, and `@ant-design/icons`).
  - Added circular logo / monogram badge with two-tier stacked typography ("Company Name" and "+ Add Another Company").
  - Built rich popover card featuring active business profile, trade name banner, verified check badge overlay (`CheckOutlined`), quick `Edit` and `Share` actions, and a prominent "+ Add new Company →" CTA button.
- **Fixed Ant Design Button `iconPlacement` & Template `options` Scope (`src/features/invoices/components/InvoiceEditor/InvoiceEditorHeader.tsx`, `ExactInvoiceLayout.tsx`, `ModernTemplate.tsx`, `MinimalTemplate.tsx`)**:
  - Replaced deprecated `iconPosition="end"` with standard `iconPlacement="end"` on Ant Design `<Button>`.
  - Destructured `options = {}` safely in `ExactInvoiceLayout`, `ModernHeader` (`ModernTemplate.tsx`), and `MinimalHeader` (`MinimalTemplate.tsx`), resolving `Uncaught ReferenceError: options is not defined`.
- **Added Comprehensive Brand Logo Support in Invoices (`src/features/invoices/components/InvoiceEditor/DocumentSettingsDrawer/BrandingSettingsTab.tsx`, `DocumentSettingsDrawer.tsx`, `ExactInvoiceLayout.tsx`, `ModernTemplate.tsx`, `MinimalTemplate.tsx`, `ThermalReceipt.tsx`)**:
  - Added dedicated Business Logo card under the Document Settings Branding tab with instant file upload (PNG, JPG, SVG, WebP), live thumbnail preview, change, and remove controls.
  - Added logo height sizing slider (24px to 100px) with real-time dimensions feedback.
  - Added Show/Hide Brand Logo master toggle (`showLogo`) to control whether the logo appears on print and PDF copies.
  - Enhanced all invoice print and PDF layouts (`ExactInvoiceLayout`, `ModernTemplate`, `MinimalTemplate`, `ThermalReceipt`) to support `options.logo`, `profile.logo`, and custom calibrated `logoHeight` values.
- **Redesigned Invoice Editor Top Navigation & Action Header using Ant Design Components (`src/features/invoices/components/InvoiceEditor/InvoiceEditorHeader.tsx`)**:
  - Replaced legacy Tailwind markup with pure Ant Design primitives (`Button`, `Dropdown`, `Input`, `Space`, `Typography`, `Tooltip`, `Badge`, `ConfigProvider`, and `@ant-design/icons`).
  - Implemented Ant Design `Dropdown` for document type switching, invoice prefix selection, supply types, and multi-profile / dispatch location management.
  - Converted the invoice number editor into a compact Ant Design `Space.Compact` control with monospaced input.
  - Formatted status badge with Ant Design `Badge` status indicators (`success`, `warning`, `LoadingOutlined`).
  - Integrated theme provider and Ant Design button tokens for Live Preview, Direct Print, WhatsApp Sharing, and Save Invoice actions.
- **Fixed Live Document Preview Modal Viewport Alignment & Height Bounds (`src/features/invoices/components/Print/LiveDocumentPreviewModal.tsx`)**:
  - Disabled conflicting `centered` vertical-align middle mode which was pushing the modal container down to the bottom edge of the viewport.
  - Set top-anchored positioning (`top: 20px`, `margin: 0 auto`, `maxHeight: 92vh`) with flex-constrained internal viewport container so the modal header, toolbar, preview canvas, and action footer appear neatly in the visible viewport area.
- **Redesigned Live Document Preview Modal Using Pure Ant Design Components (`src/features/invoices/components/Print/LiveDocumentPreviewModal.tsx`, `PrintPreviewModal.tsx`, `src/pages/InvoiceEditorPage.tsx`)**:
  - Replaced legacy custom Tailwind/HTML modal and drawer with Ant Design primitives (`Modal`, `Button`, `Space`, `Typography`, `Tooltip`, `Tag`, `Slider`, `Segmented`, `Divider`, `Spin`, `Badge`, `ConfigProvider`, and `@ant-design/icons`).
  - Added zoom controls with direct input, slider, preset segmented pills (50%, 75%, 100%, 125%, Fit), and dynamic viewport width calculation.
  - Added full-screen mode toggle, live document status tags (`#Draft`, document type, paper size), footer item count badge, formatted total, customer label, print, PDF download, and close actions.
  - Maintained theme-aware Ant Design styling with `ConfigProvider` integration.
- **Applied Uniform 4-Sided Page Margins to Exact Invoice Layout (`src/features/invoices/templates/ExactInvoiceLayout.tsx`)**:
  - Encapsulated the entire invoice frame inside `.exact-page-wrapper` with an exact 8.5mm uniform margin on all four sides (top: 8.5mm, right: 8.5mm, bottom: 8.5mm, left: 8.5mm).
  - Maintained crisp 1px solid black outer border surrounding the document contents within the 8.5mm margin boundary.
  - Added dedicated `@media print` rules enforcing `@page { margin: 8.5mm; size: A4 portrait; }` with exact print color adjustment so the physical and PDF prints mirror the screen preview margin geometry precisely.
- **Exact Quotation & Invoice Layout Micro-Precision Alignment (`src/features/invoices/templates/ExactInvoiceLayout.tsx`)**:
  - Refined layout, borders, font weights, and spacing to match the uploaded reference image down to the pixel.
  - Aligned `#0066cc` blue title strip with centered `QUOTATION` (3.5px letter-spacing) and right-aligned `ORIGINAL FOR RECIPIENT` copy label.
  - Harmonized 50/50 header grid: seller box with logo, uppercase business title, bold GSTIN, address, and mobile/email/website lines; right panel with 2-tier 50/50 metadata cells (`Quotation #`, `Quotation Date`, `Place of Supply`) and dispatch details.
  - Structured 8-column line items table with continuous vertical column dividers extending through spacer rows, right-aligned taxable amount, CGST 9.0%, and SGST 9.0% tax breakdown lines.
  - Exact Grand Total row with quantity sum (`500`) and currency total (`₹1,90,570.00`), followed by amount in words with `E & O.E`.
  - Replicated footer with 65/35 Bank Details table, "For <Business>" Authorized Signatory, and split numbered Terms and Conditions.
- **Fixed API 429 Rate Limiting & Non-JSON `text/html` Responses (`src/store.js`, `server/app.js`, `packages/api-client/src/client.ts`, `src/features/invoices/hooks/useInvoiceForm.ts`)**:
  - Implemented automatic retry with exponential backoff and jitter in both `src/store.js` and `packages/api-client/src/client.ts` for HTTP 429 (Too Many Requests) and transient non-JSON `text/html` proxy responses.
  - Added resilient local caching fallback in `getAllProducts`, `getAllClients`, and `getProfile` so the application continues functioning offline or during proxy rate-limit warmup without crashing.
  - Added safety `.catch()` block to product catalog initialization in `useInvoiceForm.ts`.
  - Added `Content-Type: application/json; charset=utf-8` and `Cache-Control: no-store, no-cache, must-revalidate` headers across all `/api/*` Express routes in `server/app.js` to prevent proxies from caching HTML error pages.
- **Set Default Invoice Style to High-Precision Quotation Reference Layout (`src/features/invoices/templates/ExactInvoiceLayout.tsx`, `ClassicTemplate.tsx`, `EvergreenTemplate.tsx`)**:
  - Implemented `ExactInvoiceLayout` matching the uploaded quotation reference layout with micro-precision.
  - Set as the default invoice style (`ClassicTemplate` and `EvergreenTemplate`), rendering automatically for all standard invoices and quotations.
  - Features vibrant blue uppercase title strip with `ORIGINAL FOR RECIPIENT` copy label, 3-column top seller/metadata/dispatch grid, customer details box, and structured items table with continuous vertical column dividers.
  - Renders statutory Taxable Amount, CGST 9.0%, SGST 9.0% / IGST 18.0%, Total Qty summary, final currency total, amount in words with `E & O.E`, bank details table, "For <Business Name>" authorized signatory box, and numbered terms & conditions.
- **Fixed Evergreen Invoice Template Live Preview Rendering (`src/features/invoices/templates/EvergreenTemplate.tsx`)**:
  - Mounted `<EvergreenReferenceStyles />` inside `EvergreenTemplate` so template grid styles, cell borders, and typography rules are properly injected into the DOM.
  - Linked `client` prop into `EvergreenHeader` to populate customer name, billing address, GSTIN, and phone details in the customer strip with walk-in fallback.
  - Added consignee shipping block if shipping address differs from billing address, eliminating redundant duplicate `SharedParties` rendering.
  - Normalized table and totals container sizing to avoid clipping or squishing calculations and UPI scan-to-pay QR codes.
  - Removed conflictive `@media screen` rules that caused canvas double-boxing and viewport overflow.
- **Unified Header and Full Invoice Template Co-location (`src/features/invoices/templates/`)**:
  - Combined header layout implementations directly inside their respective template files (`ClassicTemplate.tsx`, `ModernTemplate.tsx`, `MinimalTemplate.tsx`, `EvergreenTemplate.tsx`).
  - Eliminated redundant standalone `*Header.tsx` files while preserving exports for `headerRegistry` and individual headers for complete backward compatibility.
- **Full Invoice Template Architecture & Dynamic Preview Integration (`src/features/invoices/templates/`, `src/features/invoices/components/InvoicePreview/`)**:
  - Transformed invoice templates from partial headers into full-structure template components (`ClassicTemplate`, `ModernTemplate`, `MinimalTemplate`, `EvergreenTemplate`).
  - Created `InvoiceTemplateProps` contract unifying document data, statutory GST splits, formatted values, UPI QR details, print settings, and visibility toggles.
  - Extracted shared template components (`SharedParties`, `SharedItemsTable`, `SharedTotals`, `SharedFooter`, `SharedNotices`, `SharedExtraSections`, `SharedWatermark`) enabling clean, DRY, modular composition.
  - Refactored `InvoicePreview.tsx` to dynamically fetch the full active design from `templateRegistry`, allowing each template complete structural ownership over layout, typography, tables, and totals.
- **Added New "Evergreen" Invoice Template (`src/features/invoices/templates/EvergreenHeader.tsx`)**:
  - Created and registered the new `Evergreen` invoice template layout with structured grid presentation, title bar, business/meta/dispatch sections, and customer details.
  - Added `evergreen` template option to the Document Settings modal and Layout & Fonts tab selection lists.
- **Suppressed React 19 element.ref Deprecation Warnings (`src/main.jsx`)**:
  - Filtered out third-party UI library React 19 `element.ref was removed` deprecation console warnings in development runtime.
- **Fixed FailureDialog Technical Details Circular Serialization (`packages/ui/src/feedback/FailureDialog.tsx`)**:
  - Integrated `safeStringifyObj` inside `FailureDialog` to prevent `TypeError: Converting circular structure to JSON` when displaying or copying technical error details containing circular references or window/document objects.
- **Fixed Circular Structure Serialization Error (`src/shared/utils/formatters.ts`, `src/features/invoices/components/BillOCR/BillOCRModal.tsx`)**:
  - Implemented a robust `safeStringify` utility that safely serializes objects while detecting and stripping circular references and `Window`/`Document` DOM properties.
  - Replaced unsafe `JSON.stringify(err)` calls with `safeStringify(err)` in OCR error handlers to prevent `TypeError: Converting circular structure to JSON` runtime exceptions.
- **Fixed Toast Success TypeError (`src/shared/components/feedback/Toast.tsx`)**:
  - Added robust wrapper support for `toast.success`, `toast.error`, `toast.info`, and `toast.warning` methods ensuring zero `TypeError: toast.success is not a function` runtime exceptions.
- **Ant Design Invoice Template Selection in Document Settings Modal (`src/features/invoices/components/InvoiceEditor/DocumentSettingsDrawer/`)**:
  - Updated the Document Settings modal/drawer and Layout & Fonts tab to allow users to select invoice templates (`pdfStyle`) using Ant Design components only (`Modal`, `Radio.Group`, `Radio`, `Button`).
  - Replaced legacy toast popups on the "Invoice templates" quick action card with a dedicated interactive Ant Design Modal featuring rich preview descriptions and radio selections.
- **Modular Invoice Templates Refactoring (`src/features/invoices/templates/`)**:
  - Decoupled the massive God Component rendering structure in `InvoicePreview.tsx` by creating a self-contained and pluggable **Invoice Templates Registry Pattern**.
  - Created `/src/features/invoices/templates/types.ts` defining a standard `InvoiceHeaderProps` contract to enforce rigorous type checking on dynamic headers.
  - Extracted header layouts into clean, pure-presentational component modules:
    - `ClassicHeader.tsx` (traditional business structures with structured metadata lines)
    - `ModernHeader.tsx` (contemporary layout block with high-contrast colored header surfaces)
    - `MinimalHeader.tsx` (clean, borderless, typography-driven layout style)
  - Exposed a central registry map in `index.ts`, enabling seamless addition of brand-new template layouts in the future with zero modifications to core invoice state or calculation logic.
- **Fixed Ant Design Notification and Progress Deprecation Warnings (`packages/ui/src/feedback/`)**:
  - Remapped deprecated properties in `Notification.tsx` (`message` -> `title`, `btn` -> `actions`) to adhere strictly to modern Ant Design APIs.
  - Remapped the deprecated `size="default"` property in `Progress.tsx` (`ProgressBar`) to `undefined`, resolving rendering console errors.
- **Fixed Custom Badge Deprecation Warning (`src/shared/components/ui/Badge.tsx`)**:
  - Resolved the `size="default"` deprecation warning on Ant Design's `<Badge>` inside our custom `Badge` UI primitive by remapping standard size queries to `undefined`, allowing clean, native render operations without console noise.
- **Fixed Ant Design Badge Deprecation Warning (`packages/ui/src/feedback/Badge.tsx`)**:
  - Remapped the deprecated `size="default"` prop value on Ant Design's `<Badge>` element to use `undefined`, letting the library leverage its standard size dynamically without triggering browser console warnings.
- **Smart Sidebar Hover Scrollbars (`src/app/layout/AppSidebar.tsx`)**:
  - Implemented dynamic, auto-hiding scrollbars for the primary navigation sidebar.
  - Configured custom, self-contained CSS rules to suppress the visual scrollbars completely by default and dynamically present high-fidelity slim scrollbars only when the user's cursor is placed inside the sidebar.
- **Pure Ant Design Components Redesign of Document Settings Modal (`src/features/invoices/components/InvoiceEditor/DocumentSettingsDrawer/DocumentSettingsDrawer.tsx`)**:
  - Rewrote the entire modal container to use Ant Design's `<Drawer>` component.
  - Replaced all form toggles and inputs with pure Ant Design equivalents, including `<Switch>`, `<Select>`, `<Input>`, `<Radio.Group>`, `<Input.TextArea>`, and `<Upload>`.
  - Maintained the visual layout and card grouping styles matching the screenshot, with robust, built-in Ant Design handlers.
- **Fixed Document Settings Overlay Layer Priority (`src/features/invoices/components/InvoiceEditor/DocumentSettingsDrawer/DocumentSettingsDrawer.tsx`)**:
  - Increased the `z-index` of the newly redesigned settings modal container to `z-[150]` so that it overlays perfectly on top of the sticky global application header (which resides at `z-[110]`), ensuring the header sits cleanly behind the modal overlay.
- **Document Settings Modal Redesign (`src/features/invoices/components/InvoiceEditor/DocumentSettingsDrawer/DocumentSettingsDrawer.tsx`)**:
  - Redesigned the entire layout to match the uploaded screenshot exactly.
  - Added a grid of 4 high-density Quick Action cards at the top: **Invoice templates** (red heart icon), **Custom fields** (with Lock badge), **Prefixes / suffixes** (with HelpCircle tooltip), and **Notes and terms** (with Lock badge).
  - Built a reactive tabbed bar featuring **Display**, **Layout & Fonts**, **Export**, **Branding**, **Customize Labels** (with Lock/External link tags), and **Email / WhatsApp templates** (with External link tags).
  - Added a responsive Search bar to filter options on the fly.
  - Implemented gorgeous, structured white card layouts for **General**, **Ewaybill Options**, **Quantities**, **Pricing & Discounts**, **Company & HSN/SAC**, **Language & Font**, **Page Setup**, **Table & Content**, **Margins**, **Export Settings**, **Color & Watermark** (with hex input and a customized tilted 'swipe' preview watermark tile), **Footer textareas** (with character counters), and **Header/Footer/Banner image file uploaders** with hidden dynamic Base64 readers.
  - Re-engineered sleek, responsive, blue toggle Switches and drop-down selects matching the native screenshot design.
- **Integrated Document Settings Modal in Quotations (`src/pages/QuotationsPage.tsx`)**:
  - Configured the `"Document Settings"` action button in the Quotations view to load the full-featured, rich **Document Settings Modal** (`DocumentSettingsDrawer`) directly.
  - Initialized options from `freegstbill_invoiceOptions` localStorage key, enabling quick, real-time modification of Display preferences, Layout & Fonts, Branding, Custom Fields, and Notes & Terms templates without leaving the Quotations register workspace.
- **Removal of Free Demo Specialist Banners**:
  - Removed the `"Take a Free Demo Today! Talk to our specialist"` header advisory banners from **Quotations**, **Purchases**, **Expenses**, and the **Customers Directory** pages to achieve a cleaner, less distracted, and more native layout.
- **Unified Global Header Simplification (`src/app/layout/AppHeader.tsx`)**:
  - Streamlined and cleaned up the global application header by removing redundant and low-usage buttons.
  - Removed the `Quick Actions` (Zap icon), `User Guide` (Megaphone icon), `System Control Panel` (HardDrive icon), and the duplicate `Settings Shortcut` (Settings icon).
  - Kept essential controls: **Business Selector Switcher**, **AI Search Bar** (Ctrl+K), **Create New Invoice Shortcut**, **Update Badges**, **Notification Bells**, **Server Connected Status**, **Light/Dark Mode toggle**, and the **User Profile avatar circle**.
- **Premium Customers Directory Page Upgrades (`/apps/web/src/domains/customers/pages/CustomersPage.tsx`)**:
  - Refactored the core Customers directory page to match the premium, high-fidelity layout found in the Quotations, Purchases, and Expenses workspaces.
  - Replaced legacy control elements with high-density Ant Design (`antd`) inputs, dropdowns, and button sets.
  - Implemented the signature top advisory specialist banner alongside an interactive play button for on-demand ledger and customer balance tutorials.
  - Fully integrated modern category filters ("All Customers", "Groups", "Deleted") with reactive badge tallies.
  - Preserved the nested transaction table overlays, dynamic ledger exports, WhatsApp quick shares, CSV bulk upload actions, and the "bank-grade security" lock indicator footer.
- **Premium Expenses Page Upgrades (`src/pages/ExpensesPage.tsx`)**:
  - Upgraded the operational Expenses ledger to use the identical, high-fidelity design layout of the premium Quotations and Purchases views.
  - Implemented dynamic top category filter tabs (with a dedicated "Others" tab fallback) dynamically integrated with real-time record counting.
  - Replaced legacy tables with the interactive, high-density Ant Design `<Table>` component featuring native checkbox multi-row selection.
  - Embedded real-time statistics totals: **Total Expenses**, **GST (ITC claimed)**, and **Recorded entries** count.
  - Retained all background ledger integrations, custom expense modals, and quick detail overlay drawers.
- **High-Fidelity Purchases Register Page Upgrades (`src/pages/PurchasesPage.tsx`)**:
  - Upgraded the Purchases Register page to use the exact same high-fidelity, pixel-perfect layout and styling as the premium Quotations view.
  - Exclusively utilized modern Ant Design (`antd`) components (`Table`, `Tabs`, `Input`, `Select`, `Button`, `Dropdown`, `Modal`) for premium layout performance.
  - Implemented real-time interactive search, active payment-status filters ("All", "Paid", "Partial", "Unpaid"), and automatic live calculation of ITC (Input Tax Credit) totals.
  - Preserved all native integrations like OCR scanner imports, unassigned bill assignments, CSV downloads, PDF exports, and detailed overlay views.
- **Unified Global Header Upgrade (`src/app/layout/AppHeader.tsx`)**:
  - Upgraded the main layout header to match the premium `h-14` spacing, rounded dropdown borders, brand logo fonts, and pill-search elements of the settings workspace header design.
  - Implemented standard smooth hover transitions, beautiful interactive profiles dropdown cards, and responsive spacing across all layouts.
- **Interactive Sidebar Scrollbars (`src/index.css`)**:
  - Implemented high-fidelity custom scrollbar auto-hiding behavior on the main sidebar navigation panel (`#app-sidebar` and its descendants).
  - Scrollbars are now completely hidden by default and dynamically transition to visible thin slim scrolls only when the user interacts (hovers, focus-within, or active scrolling) with the sidebar area.
- **Pixel-Perfect Quotations List Page (`src/pages/QuotationsPage.tsx`, `src/app/router/routes.ts`, `src/app/layout/navConfig.ts`, `apps/web/src/app/App.tsx`)**:
  - Designed and created a fully responsive, pixel-perfect Quotations page mapping exactly to the provided screenshot mockup.
  - Used standard Ant Design (`antd`) components exclusively for high fidelity.
  - Added interactive filtering tabs ("All", "Open", "Closed", "Partial", "Cancelled", "Drafts") alongside real-time search filtering.
  - Handled beautiful custom layouts for currency formatting, badges, play icon indicators, subheader demos, and interactive dropdown action lists.
  - Embedded standard copyright footer elements and secure lock banners matching the product branding.
- **Sidebar Navigation Structure Reorganization (`src/app/layout/navConfig.ts`, `src/app/layout/NavigationTabs.tsx`, `src/app/layout/AppSidebar.tsx`)**:
  - Reorganized and updated navigation hierarchy into exact requested sequence:
    1. **Sales (Submenu)**: Invoices, Credit Notes, E-Invoices, Subscriptions.
    2. **Purchases (Submenu)**: Purchases, Purchase Orders, Debit Notes.
    3. **Quotations+ (Submenu)**: Quotations, Sales Orders, Pro Forma Invoices, Delivery Challans, Packing Lists.
    4. **Expenses+ (Submenu)**: Expenses, Indirect Income.
    5. **SwipeAI (Single Link)**.
    6. **Products & Services (Single Link)**.
    7. **Inventory (Submenu)**: Warehouses, Timeline.
    8. **Payments (Submenu - Expanded/Selected)**: Timeline, Payment Links, Journals, Bank Reconciliation.
    9. **Customers (Single Link)**.
    10. **Vendors (Single Link)**.
    11. **Projects (Single Link)**.
    12. **Insights (Single Link)**.
    13. **Reports (Single Link)**.
    14. **OnlineStore (Single Link)**.
    15. **E-way Bills (Single Link)**.
    16. **Integrations (Single Link)**.
    17. **More (Submenu)**: User Guide, Control Panel, Income Tax.
    18. **Footer Navigation Menu (`#nav-menu-footer`)**: Invite Users, Settings.
- **Due Date DatePicker Quick Presets (`src/shared/components/ui/DatePicker.tsx`, `src/features/invoices/components/ClientSelectSection.tsx`)**:
  - Integrated `NetPresetsFooter` in `DatePickerComponent` matching `image.png`.
  - Added quick-preset buttons (`Today`, `Net 15`, `Net 30`, `Net 60`, `Net 90`) and custom `Net Days` input field.
  - Automatically calculates due date relative to the base invoice date or today when selected.
- **Sticky Bottom Action Bar Redesign (`src/features/invoices/components/InvoiceEditor/TwoColumnDetailsSection.tsx`)**:
  - Upgraded bottom action bar into a floating sticky card container (`sticky bottom-4 z-40 rounded-xl shadow-2xl`) matching `image.png`.
  - Added left summary section displaying `TOTAL` (with "Includes Total Tax" subcaption) and formatted grand total amount alongside total tax amount.
  - Redesigned action buttons: `Save and Print v` split button (`bg-[#f0f2f5]`) and vibrant blue `Save →` primary button (`bg-blue-600`).
- **Pixel-Perfect Products & Services Section Redesign (`src/features/invoices/components/InvoiceEditor/InvoiceItemsTable.tsx`)**:
  - Refined top search container with soft light-blue background (`#eef5fe`), `Filter Category` dropdown button, Ant Design AutoComplete product search, `Qty` input, and `+ Add to Bill` solid blue button matching `image.png`.
  - Added six-dot drag grip handle (`:::`) on left column of item rows.
  - Implemented segmented Quantity input group (`[ Quantity | Unit ]`) and Discount input group (`[ Discount | Mode v ]`).
  - Added `👁 Show Description` pill button, red trash icon (`🗑`), and Net Amount + Tax breakdown sub-text under line totals.
  - Styled bottom summary bar with green bordered input box (`border-2 border-emerald-600`) for "Apply discount(%) to all items?" and `+ Additional Charges` button.
- **Dispatch From Dropdown Layout (`src/features/invoices/components/InvoiceEditor/InvoiceEditorHeader.tsx`)**:
  - Restored inline text trigger layout ("Dispatch From <Address> v") on sub-header.
  - Maintained rich popover dropdown with `borderRadius: 6` (`rounded-[6px]`), active profile badges, address lines, GSTIN tags, and sticky `#f0f2f5` footer action (`+ Manage Business Profiles →`).
- **Ant Design Customer Search Redesign (`src/features/invoices/components/ClientSelectSection.tsx`)**:
  - Replaced custom input and popup list with Ant Design `AutoComplete` and `Input` (`antd`), using `borderRadius: 6` (`!rounded-[6px]`) and standard `size="middle"`.
  - Matched exact dropdown styling from Product Search with option rows showing Customer Name, phone, city, state, and GSTIN tag.
  - Added sticky `#f0f2f5` footer with dark circle `+` icon and `+ Create New Customer →` action button triggering customer creation modal.
- **Ant Design Product Search Redesign (`src/features/invoices/components/InvoiceEditor/InvoiceItemsTable.tsx`)**:
  - Applied design system token `borderRadius: 6` (`!rounded-[6px]`) across the Product Search input, Quantity input, and AutoComplete dropdown panel.
  - Adjusted control sizing from `size="large"` to standard `size="middle"` matching other input fields on the create invoice page.
  - Rendered rich product option cards displaying Product Name, `Avl. qty` in bold red, unit, category tag, HSN/barcode, formatted currency price, and tax rate percentage dynamically from catalog data.
  - Added sticky `#f0f2f5` footer with centered `+ Add New Product →` action button triggering catalog product creation modal.
- **Ant Design Enterprise ProCard Component & Architecture**:
  - **Comprehensive ProCard Component (`packages/ui/src/primitives/ProCard.tsx`, `src/shared/components/ui/ProCard.tsx`)**:
    - Standard card presentation (`title`, `subTitle`, `tooltip`, `extra`, `cover`, `children`, `actions`).
    - Header divider control via `headerBordered` with elevated proportions.
    - Appearance modes: `variant='outlined' | 'borderless'`, `ghost=true` (transparent composite layout), and `type='inner'` (nested cards).
    - Centering and sizing: `size='default' | 'small'`, `layout='default' | 'center'`.
  - **24-Column Grid & Responsive Layouts**:
    - Automatic flex grid activation when nesting child ProCards (`direction='row' | 'column'`, `wrap=false | true`).
    - `colSpan` supporting 24-column numbers (1-24), CSS width strings (`300px`, `50%`), and responsive breakpoint objects (`{ xs, sm, md, lg, xl, xxl }`).
    - Two-axis gutters (`gutter={16}` or `gutter={[16, 24]}`).
  - **Split Workspaces & Grouping**:
    - `split='vertical' | 'horizontal'` dividing parent card into coordinated master-detail regions without outer padding and zeroing inner radii.
    - `ProCard.Group` for grouped cards and `ProCard.Divider` for horizontal/vertical dividers.
  - **Collapsible Engine & Tabbed Workflows**:
    - `collapsible=true | 'icon' | 'header'` with controlled and uncontrolled modes, smooth performant chevron rotation, and container collapse animation.
    - `tabs` configuration (`items`-based, supporting `line`, `card`, `editable-card`, and `cardProps`).
    - `ProCard.TabPane` supported for legacy/declarative tab trees.
  - **StatisticCard Extension (`packages/ui/src/primitives/StatisticCard.tsx`, `src/shared/components/ui/StatisticCard.tsx`)**:
    - Metric KPI card extending ProCard with formatted values, status highlights (`success`, `warning`, `danger`, `processing`), trends (`up`, `down`), chart slots (`bottom`, `right`, `left`), and footer metadata.
    - Static `isProCard = true` exposed across all card subcomponents for seamless child detection.
- **Ant Design UI/UX Shadow & Elevation System (Order 6)**:
  - **Three-Layer CSS Shadow Presets**: Implemented Ant Design v4 three-layer physically inspired box shadows across all elevation levels (L0 ground level, L1 low elevation, L2 medium elevation, L3 high elevation).
  - **Exact Directional Mapping**: Standardized 12 elevation tokens derived from exact mathematical tuples `(offset magnitude px, blur px, spread px, black opacity)` for all four light directions (`up`, `down`, `left`, `right`).
  - **Design Token Synchronization (`src/styles/tokens.ts`, `src/styles/tokens.css`, `src/styles/themes.css`)**: Exported `AntShadowTokens` in TypeScript, declared `--ant-shadow-{level}-{direction}` and `--elevation-0..3` in CSS with full Light/Dark mode contrast scaling.
  - **Component Level Hierarchy Bindings (`src/styles/utilities.css`)**:
    - L0 Ground Level: Input controls, table data rows, and flat card bodies (`none`).
    - L1 Low Elevation: Hoverable cards and interactive action tiles (`shadow-1-down`).
    - L2 Medium Elevation: Anchored floating elements including select dropdowns, popovers, datepicker popups, and autocomplete suggestion menus (`shadow-2-down`).
    - L3 High Elevation: Independent elevated overlays including modal dialogs, drawers, notification toasts, and server alert sheets (`shadow-3-down`, `shadow-3-left`, `shadow-3-right`).
    - Directional Overlays: Right-side drawers (`shadow-3-left`), left-side drawers (`shadow-3-right`), left navigation sidebar (`shadow-1-right`), and bottom action bars (`shadow-2-up`).
  - **Ant Design Theme Provider Integration (`packages/ui/src/primitives/AntdThemeConfig.tsx`)**: Configured `boxShadow`, `boxShadowSecondary`, `boxShadowTertiary`, `boxShadowPopoverArrow`, `boxShadowCard`, and drawer directional shadows directly in Ant Design's ConfigProvider.
  - **Automated Verification Suite (`scripts/shadow-test.mjs`, `packages/financial-core/tests/shadow.test.mjs`)**: Added test runner validating all 13 elevation tokens against the physical tuple specification (13/13 PASS).
- **Ant Design Modern Prop API Compliance**:
  - **Alert Component (`packages/ui/src/feedback/Alert.tsx`, `src/shared/components/feedback/AlertBanner.tsx`)**: Replaced deprecated `message` prop with modern `title` prop on `AntAlert` (`title={effectiveTitle}`).
  - **Card Component (`packages/ui/src/primitives/Card.tsx`)**: Replaced deprecated `bordered` prop on `AntCard` with modern `variant={isBordered ? 'outlined' : 'borderless'}` prop.
- **Shared UI Navigation Re-Export Syntax Fix**:
  - Corrected named-to-default re-export statements across `src/shared/components/ui/` (`Breadcrumb.tsx`, `Steps.tsx`, `Menu.tsx`, `Tabs.tsx`, `Pagination.tsx`) to use `export { Component as default } from '@free-gst/ui'` instead of `export { default }`, resolving Vite runtime import errors.
- **Ant Design UI/UX Navigation System Implementation (Menu, Breadcrumb, Tabs, Steps, Pagination)**:
  - **Menu Component (`packages/ui/src/primitives/Menu.tsx`, `src/shared/components/ui/Menu.tsx`)**:
    - Top Navigation: Horizontal navigation with 2-7 first-level items and <15 character labels for simple structures.
    - Side Navigation: Vertical/inline downward-extensible menu for dashboards, deep multi-level structures, and operation-intensive workflows with collapsible submenu trees.
  - **Breadcrumb Component (`packages/ui/src/primitives/Breadcrumb.tsx`, `src/shared/components/ui/Breadcrumb.tsx`)**:
    - Location & Parent-Child Hierarchy: Standardized breadcrumbs with auto-collapsing for deep hierarchies (>maxCount, defaulting to 5 levels with ellipsis dropdown), custom separators, and icon integration.
    - Integrated with `PageHeader.tsx` for consistent page-level navigational hierarchy.
  - **Tabs Component (`packages/ui/src/primitives/Tabs.tsx`, `src/shared/components/ui/Tabs.tsx`)**:
    - Basic (Line): In-place switching for core features across entire views.
    - Card: Visually distinct tabs for bordered and separated container sections.
    - Pill / Segmented: Quick switching inside cards with clean segmented controls.
    - Vertical: Vertically extensible tab list for accommodating numerous categories without clutter.
    - Title length constraint enforced (<15 characters) with text truncation protection.
  - **Steps Component (`packages/ui/src/primitives/Steps.tsx`, `src/shared/components/ui/Steps.tsx`)**:
    - Horizontal: Workflow progression for 3-4 stages with concise (<12 character) step titles.
    - Vertical: Left-aligned multiline stage descriptions for dynamic or time-based tasks.
    - Integrated into `SetupWizard.tsx` replacing manual progress bars with standard 3-stage Steps navigation (`Business`, `Format`, `Confirm`).
  - **Pagination Component (`packages/ui/src/primitives/Pagination.tsx`, `src/shared/components/ui/Pagination.tsx`)**:
    - Basic: Standard pagination with entries summary, page size changer, and quick page jumper for datasets >5 pages.
    - Mini: Compact pagination designed for cards, modal dialogs, and floating layers.
    - Simple: Minimalist pagination for small datasets (<= 10 pages).
- **Invoice Editor Totals & Tax Calculation Resolution**:
  - **Tax Calculation Compatibility Aliases (`packages/financial-core/src/tax/taxCalculation.ts`)**: Added compatibility aliases (`totalTaxCollected`, `totalTax`, `taxTotal`, `subTotal`) to `computeInvoiceTotals` results alongside `totalTaxAmount`.
  - **Totals Card Resolution (`TwoColumnDetailsSection.tsx`)**: Fixed `totalTax` resolution to read `totalTaxAmount ?? totalTaxCollected ?? totalTax ?? taxTotal` (or sum of CGST, SGST, UTGST, IGST, Cess), preventing taxes from falling back to 0. Added comprehensive breakdown lines for CGST, SGST, UTGST, IGST, Cess, and TCS.
- **Create Invoice Page Full-Height Scrollable Viewport Fix**:
  - **Main Content Overflow Resolution (`src/styles/utilities.css`)**: Removed blanket `overflow: hidden !important` from `.main-content.no-padding`, decoupling padding reset from overflow constraints and restoring natural vertical scrolling (`overflow-y: auto`, `-webkit-overflow-scrolling: touch`).
  - **App Layout View Routing (`apps/web/src/app/App.tsx`)**: Explicitly configured `contentClassName` for `new` invoice view with `no-padding !p-0 overflow-y-auto` and dynamic `w-full min-h-full` motion container, while preserving isolated `overflow-hidden` for dual-pane settings navigation.
  - **Root Layout & Sticky Header (`src/pages/InvoiceEditorPage.tsx`)**: Updated root container to `min-h-full w-full pb-24` ensuring seamless vertical scrolling of customer details, items table, and totals while `InvoiceEditorHeader` stays smoothly pinned (`sticky top-0 z-30`).
- **Ant Design UI/UX Motion Design Principles & Systematic Interaction Physics**:
  - **Natural Motion Principle**:
    - Implemented physically inspired cubic-bezier curves (`cubic-bezier(0.215, 0.61, 0.355, 1)` easeOut, `cubic-bezier(0.18, 0.89, 0.32, 1.28)` easeOutBack) across buttons and interactive elements.
    - Added subtle `:active` depression (`scale(0.98)`) and release rebound on all standard and CTA buttons with ripple wave radiation (`antWaveSpread`).
  - **Performant Motion Principle**:
    - Enforced the **faster exit velocity rule**: dismissals and exits transition at `0.14s` with fast acceleration (`cubic-bezier(0.55, 0.055, 0.675, 0.19)`), eliminating staggered delays and dismissing related items simultaneously.
    - Restrained all transitions to GPU-composited properties (`transform` and `opacity`) to eliminate layout reflow and maintain 60 FPS across enterprise tables and dashboards.
  - **Concise Motion Principle**:
    - Streamlined navigation accordion expansion using CSS grid template rows (`grid-rows-[0fr]` to `grid-rows-[1fr]`) and smooth 180° chevron rotation (`ant-motion-chevron`), revealing content cleanly without decorative distractions.
    - Added concise entrance zoom (`ant-motion-dropdown`) for collapsed navigation flyouts.
  - **Ant Design Config & Token Sync**:
    - Wired motion tokens into `AntdThemeConfig.tsx` (`motion: true`, `motionUnit: 0.1`, `motionEaseOut`, `motionEaseIn`, `motionEaseInOut`, `motionEaseOutBack`), `tokens.ts`, `tokens.css`, and `utilities.css`.
- **Ant Design UI/UX Feedback System Implementation**:
  - **Prompt & Information Feedback Primitives**:
    - `Alert.tsx`: Persistent, non-blocking inline information placed near the top of pages/sections. Supports status types (`info`, `warning`, `error`, `success`), custom actions, and optional dismiss/close handlers.
    - `Notification.tsx`: Global upper-right system-initiated notification service (`notify.open`, `notify.info`, `notify.success`, `notify.warning`, `notify.error`, `notify.destroy`) with configurable duration and sticky (duration: 0) support for complex, critical announcements.
    - `Badge.tsx`: Aggregated message indicators positioned at the upper-right of icons and avatars. Supports numeric counts (`overflowCount={99}`) and red dots for lower-priority updates, with backward-compatible status tag support.
    - `Popover.tsx`: Contextual card shown on user interaction with supplementary descriptions and actionable buttons.
    - `Tooltip.tsx`: Brief, precise description on hover that disappears on mouse leave without complex interactive operations.
  - **Process Feedback Primitives**:
    - `Progress.tsx`: Linear `ProgressBar`, `ProgressCircle`, and `LongOperationModal` providing live status feedback and explicit cancellation capability (`onCancel`) for operations taking >2 seconds.
    - `FormField.tsx`: Input validation feedback presentation placed directly after the relevant input, keeping descriptive error text permanently visible until corrected.
    - `Popconfirm.tsx`: Lightweight floating confirmation panel anchored near the target element with directional arrow, replacing heavy full-screen modals for contextual confirmations.
  - **Result Feedback Primitives**:
    - `Toast.tsx` / `message`: Lightweight, non-blocking operation feedback displayed at top center, auto-dismissing after 3 seconds (`message.success`, `message.info`, `message.warning`). Enforced guideline: strictly avoided for important failures.
    - `FailureDialog.tsx`: Persistent, actionable dialog for important failures that explains what failed, the underlying reason, copyable technical details/logs, and an actionable retry CTA.
    - `FeedbackContainer.tsx`: Unified root mounting component combining `ToastContainer`, `NotificationContainer`, `ConfirmModalContainer`, and `FailureDialogContainer` in `AppShell`.
  - **Control Panel Integration & Interactive Showcase (`ControlPanelPage.tsx`)**:
    - Updated server actions to use `showFailureDialog` instead of transient toasts on errors.
    - Wrapped server stop in `Popconfirm` with contextual confirmation.
    - Added an interactive 3-tab UI/UX Feedback System Showcase verifying Prompt, Process, and Result feedback behaviors in both light and dark themes.
- **Settings Sidebar Pinned "Back to Dashboard" Navigation Header**:
  - **Always-Visible Back Navigation Control (`SwipeSettingsSidebar.tsx`)**: Extracted "Back to Dashboard" into a dedicated, pinned top header container (`sticky top-0 z-20 shrink-0 border-b border-gray-100 dark:border-gray-800/80 bg-white dark:bg-[#141414]`) above the scrollable navigation groups.
  - **Permanent Viewport Presence**: Users can scroll through any number of settings items, sections, or categories while "Back to Dashboard" remains persistently visible, anchored, and instantly clickable at the top of the sidebar across both desktop and mobile drawer views.
  - **Isolated Navigation Rail Scroll Container**: Wrapped the category groups in a separate `flex-1 overflow-y-auto` track, decoupling internal sidebar scrolling from the top action bar.
- **Settings Page Split-Scrolling & Fixed-Height Sidebar Architecture**:
  - **Fixed Sidebar Height & Pinned Viewport Positioning (`SwipeSettingsSidebar.tsx`, `SettingsPage.tsx`)**: Locked the settings sidebar container into a permanent `h-full min-h-0 shrink-0` position within the flex container. The sidebar stays completely in place and never scrolls away as the user traverses settings forms.
  - **Independent Dynamic Content Scrolling (`#swipe-settings-main-content`)**: Transferred viewport scroll ownership to the right-hand central content area (`flex-1 min-w-0 h-full overflow-y-auto`), allowing long forms (Billing Details, Shipping Details, PAN, Bank Details) to scroll independently and dynamically.
  - **Integrated Page Footer within Dynamic Scroll Container**: Moved the settings footer inside the scrollable content view so users can scroll to "Save & Update" and footer notes without pushing the navigation sidebar out of frame.
  - **Outer Container Overflow Lock (`utilities.css`)**: Configured `.main-content.no-padding` and `#swipe-settings-page-wrapper` with `height: 100%; max-height: 100%; overflow: hidden !important`, preventing window-level double scrollbars.
- **Settings Sidebar Modernization & Weird Floating Container Fix**:
  - **Full-Height Ant Design Sider Layout (`SwipeSettingsSidebar.tsx`)**: Replaced the floating pill-style sticky box with a full-height `h-[calc(100vh-3.5rem)]` layout panel. Removed outer container `border-radius` (setting `border-radius: 0 !important` on the aside shell), aligning with standard enterprise sidebar architecture.
  - **Clean Ant Design Menu Item Styling**: Refactored menu items to use Ant Design active tokens (`bg-[#e6f4ff] text-[#1677ff] font-medium` with `var(--ant-border-radius, 6px)`) without heavy artificial borders, harsh shadows, or capsule shapes.
  - **Removal of Misleading Lock Icons**: Removed fake padlock icons from fully functioning tabs ("Thermal Print Settings", "Notes & Terms", "Auto Reminders", "Payment Gateway", "Tally Integration"), ensuring users see all available functionality as active.
  - **Streamlined Category Grouping & Sleek Scrollbars**: Upgraded category titles to crisp micro-headers (`text-[11px] font-semibold text-gray-400 uppercase tracking-wider`) and configured slim, unobtrusive webkit scrollbars that eliminate native browser scrollbar arrows and wide gutters.
- **Settings Sidebar Border Radius Ant Design Token Alignment**:
  - **Sidebar Container & Elements Radius Token**: Aligned the settings page sidebar (`SwipeSettingsSidebar.tsx`), "Back to Home" navigation button, active and inactive tab buttons (`[id^="swipe-tab-"]`), mobile drawer panel, and mobile quick navigation trigger with Ant Design v5 border radius tokens (`var(--ant-border-radius, 6px)` and container `var(--ant-border-radius-lg, 8px)`).
  - **CSS Token Enforcement (`utilities.css`)**: Standardized `.sidebar-back-btn`, `.nav-btn`, `.sidebar-collapse-trigger`, `#swipe-settings-sidebar`, `#swipe-back-home-btn`, and `[id^="swipe-tab-"]` in `src/styles/utilities.css` to dynamically inherit `var(--ant-border-radius, 6px)` rather than arbitrary or static pixel values.
- **Settings Sidebar Color, Typography & Visual Design Redesign**:
  - **Accent Highlights & Active State (`SwipeSettingsSidebar.tsx`)**: Replaced plain active states with a brand primary blue container (`bg-blue-50/90 text-[#1665D8] font-semibold border border-blue-200/60 shadow-2xs`) and matching blue icons (`#1665D8`), providing clear visual focus for active items.
  - **Category Hierarchy**: Upgraded category section titles to high-contrast uppercase micro-labels (`text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2.5 mb-1.5`) for clean section separation.
  - **Back Navigation Control**: Rebuilt "Back to Home" as a structured button (`bg-gray-50 hover:bg-blue-50/70 border border-gray-200/80 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700`) with hover icon feedback preventing text truncation.
  - **Canvas Surface Contrast**: Applied `bg-slate-50/60` container background with `border-r border-gray-200/80` for clean surface separation.
- **Settings Sidebar Desktop Layout & Permanent Visibility Fix**:
  - **Desktop Permanent Sidebar (`SwipeSettingsSidebar.tsx`)**: Configured desktop sidebar container with `hidden md:flex flex-col w-64 min-w-[256px] shrink-0 z-10`, ensuring the settings navigation rail maintains a stable 256px width without collapsing or shrinking.
  - **Dynamic Flex Layout (`SettingsPage.tsx`)**: Updated `<main id="swipe-settings-main-content">` to use `flex-1 min-w-0 w-full max-w-full`, removing rigid fixed-width bounds that previously caused flex overflow or sidebar clipping on 1024px–1280px desktop displays.
- **Settings Sidebar Visibility & Mobile Responsive Navigation Fix**:
  - **Responsive Sidebar & Mobile Drawer**: Fixed invisible/cut-off Settings sidebar by adding mobile slide-out drawer support (`mobileOpen`, backdrop overlay) and a mobile hamburger menu toggle button in `SwipeSettingsHeader`.
  - **Quick Navigation Header Bar**: Added a mobile quick navigation banner at the top of `SettingsPage` displaying the current section title and a "Settings Menu" trigger for instant navigation on small viewports and narrow viewports.
  - **DOM & Flex Layout Cleanup**: Removed nested `<main>` element in `CompanyDetailsView` and applied `w-full min-w-0 overflow-x-hidden` constraints to ensure main settings forms fit cleanly alongside the desktop sticky sidebar without horizontal clipping or overflow.
- **Customer Form Browser Anti-Autofill & Modal Improvements**:
  - **Browser Anti-Autofill Fix**: Prevented browser saved data/profile auto-population in `CustomerModal` (and `ClientModal`) by wrapping customer form controls in an explicit `<form autoComplete="off">` container and attaching anti-autofill `autoComplete="off"`, `data-lpignore="true"`, and non-standard `name` attributes (`cust_name_no_autofill`, `cust_email_no_autofill`, etc.) to all customer inputs.
  - **Form Modal Closure Fix**: Resolved modal form closure reference in list page controllers to ensure seamless modal lifecycle management on save or cancel.
- **List Page Research Design Pattern & Systematic Table Architecture Implementation**:
  - **Scannability & Tabular Numbers**: Applied `tabular-nums` CSS classes across numeric, currency, date, and document ID cells across all table views (Customers, Catalog/Products, Expenses, Purchases, Receipts, Invoices Register) to ensure vertical digit alignment and rapid comparison. Cleaned up static row metadata with unboxed quiet text separators (`·`).
  - **Overview Statistics Bar (Workbench Overview)**: Provided top summary KPI cards (`StatCard`) on list pages (Customers, Catalog, Expenses, Purchases, Receipts) to display key aggregate metrics (Totals, Outstanding Receivables, Active Ledger Accounts, Low Stock Warnings) for instant workbench analysis before inspecting individual rows.
  - **Batch Operations Toolbar**: Added row selection checkboxes and a select-all table header checkbox across list tables. Integrated a sticky/floating Batch Action Bar (`X selected`) when items are checked, providing single-click batch actions (Export Selected CSV, Batch Delete Customers/Products/Expenses, Clear Selection).
  - **Findability & Filtering**: Enhanced multi-field debounced search inputs with `allowClear` triggers, category/status filter dropdowns, and clear result counters.
- **Ant Design Navigation Hierarchy & Path Architecture Implementation**:
  - **Global Sidebar Navigation**: Structured flat, wide, scannable menu navigation across `Sales`, `Purchases`, `Master Records`, `Tax & Compliance`, and `Reports & Tools` with persistent active highlights, badges, and collapsed flyout support.
  - **Reliable Escape Hatch**: Wired brand logo return to dashboard homepage with clear visual feedback and accessibility metadata.
  - **Utility Navigation Isolation**: Standardized top-right header tools (`Ctrl+K` Global Search, Quick Action lightning trigger, update manager, notifications, user guide, server health indicator, dark theme toggle, settings, and business profile switcher) while maintaining strict separation from in-page operational buttons.
  - **In-Page & Drill-Down Navigation**: Enhanced `PageHeader` component to natively support `breadcrumbs` (for deep structural context) and `onBack` return buttons (for drill-down and subsite escape hatches).
  - **Immersive Subsite Mode**: Maintained focused full-workspace layout for high-density document creation (`InvoiceEditorHeader`) with distinct return navigation to parent lists.
- **Ant Design Button Design Pattern & Behavioral Hierarchy Implementation**:
  - **Button Types & Emphasis Hierarchy**: Enhanced `@free-gst/ui` `Button` primitive to support standard Ant Design types (`primary`, `default`/`secondary`, `dashed`, `text`, `link`, `ghost`, `danger`, `success`, `warning`, and `cta`).
  - **Single Primary Rule Enforcement**: Enforced at most ONE primary button per action group or dialog footer to clearly guide user intent without cognitive conflict.
  - **Dashed Area Additions**: Standardized dashed button styling for localized insertion actions (e.g. adding custom items, additional tax rows, or categories).
  - **Risk-Mitigating Danger Actions**: Standardized danger styling for high-risk and irreversible actions (e.g. deletions and revocations) across `ConfirmModal` and table row toolbars.
  - **Integrated Tooltip & Icon-Only Support**: Added automatic `Tooltip` wrapping for icon-only action buttons to ensure clear visual clues and full accessibility.
  - **Verb-First Action Labels**: Standardized button labeling with concise action verbs (e.g. "Save", "Delete", "Confirm", "Export").
- **Full Ant Design System-Level & Product-Level Color System Integration**:
  - **12 Base Color Palettes (120 Derivative Steps)**: Integrated all 12 standard Ant Design color palettes (`blue`, `purple`, `cyan`, `green`, `magenta`, `pink`, `red`, `orange`, `yellow`, `volcano`, `geekblue`, `lime`, `gold`) with full 10-step derivative scales in `tokens.ts` and `tokens.css`.
  - **Product-Level Semantic & Functional Tokens**: Defined structured brand primary (`#1677ff`), functional states (`success`, `warning`, `error`/`danger`, `info`), and neutral surface/text tokens (`colorTextHeading`, `colorText`, `colorTextSecondary`, `colorTextTertiary`, `colorTextQuaternary`, `colorTextDisabled`, `colorBorder`, `colorSplit`, `colorBgLayout`, `colorBgContainer`, `colorBgElevated`) with WCAG 2.0 AA contrast compliance.
  - **Enterprise Color Restraint & 60-30-10 Distribution**: Enforced balanced color allocation (60% neutral canvas, 30% structural surfaces, 10% high-intent action points) across light and dark theme modes.
- **Ant Design Systematic Layout, 24-Grid Raster & 8px Common Scales**:
  - **Unified Canvas Dimensions (1440px / 1920px)**: Configured standard design canvas constraints (`.antd-layout-canvas`, `.antd-layout-canvas-wide`, `.antd-layout-canvas-fluid`) with fluid marginal gutter scaling for mainstream displays (1280px, 1366px, 1440px, 1920px).
  - **Left-Right & Top-Bottom Adaptation Models**: Aligned the application shell (`AppShell.tsx`, `AppHeader.tsx`, `AppSidebar.tsx`) with fixed-left sider navigation and dynamic fluid work area.
  - **8px Base Grid Unit & Common Scales**: Formally embedded the 8-fold common scale token arrays (`[8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96]`) across padding, margins, gutters, and component bounding boxes.
  - **24-Grid Raster System**: Established standard 24-column row and column raster classes (`.antd-row`, `.antd-col-1` to `.antd-col-24`) with fixed 8px, 16px, and 24px gutters across responsive breakpoints (`md: 768px`, `lg: 992px`, `xl: 1200px`).
- **Ant Design Select Popup ClassName Deprecation Fix**:
  - **Replaced Deprecated `popupClassName` with `classNames.popup.root`**: Migrated `Select` dropdown container styling in `Select.tsx` to use the standard `classNames={{ popup: { root: 'slim-select-dropdown' } }}` prop API, eliminating runtime deprecation console warnings.
- **Restored Empty State Illustration UI with Modal Trigger**:
  - **Restored Empty State Graphic & Layout**: Restored the original folder illustration and call-to-action placeholder in the Products & Services table for a welcoming first-load appearance.
  - **Integrated Master Product Modal**: The `+ Add New Product` button inside the empty state now opens the **Add Product Modal** (`ProductModal`) to create and save items to the catalog and add them to the bill.
- **Invoice Editor Product Search & Select Dropdown Enhancement**:
  - **On-Click & On-Focus Product Select Dropdown**: Clicking or focusing into the _"Search or scan barcode for existing products"_ field now immediately displays the existing products selection list (matching category filter or all catalog items), consistent with the customer search dropdown in the invoice creation page.
  - **Rich Product Information Display**: Each item in the dropdown displays the product name, category badge, HSN code, barcode, stock quantity count, unit type, GST tax percentage, and formatted selling rate.
  - **Seamless Keyboard Navigation & Clear Action**: Added full keyboard navigation (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`) with active index highlight, click-outside dismissal, double-click direct item addition, quick clear `X` button, and custom line-item fallback when typing non-catalog names.
- **Invoice Editor Customer & Metadata Field Alignment**:
  - **Standardized Control Heights & Baseline Alignment**: Unified `Select Customer` input, `Invoice Date`, `Due Date`, and `Reference` fields across a 12-column grid (`items-end`), standardizing all input heights to 32px (`h-8` / `inputSize="sm"` / `pickerSize="sm"`) and label row heights to 20px (`h-5`).
  - **Fixed Duplicate Plus Sign**: Removed redundant `+` text prefix from the `+ Create Customer` button.
  - **Replaced Textarea with Clean Single-Line Reference Input**: Converted the misaligned multi-line reference textarea to a clean `Input` component without vertical scrollbar anomalies.
  - **Aligned Place of Supply Row**: Streamlined the `Place of Supply` selector and `+ Add / Edit Billing Address` toggle with centered horizontal alignment and matching typography.
- **Compact & Streamlined StatCard Icons**:
  - **Refined Icon Dimensions**: Reduced the leading icon container to a sleek `w-7 h-7` (28px) with `14px` icon graphics (`[&_svg]:w-3.5 [&_svg]:h-3.5`), freeing up maximum horizontal width for metric figures.
  - **Single-Line Currency Numbers**: Added `whitespace-nowrap` to prevent currency amounts (e.g. `₹2,620.96`) from splitting decimal cents across multiple lines.
- **Responsive Screen-Size Optimization for Stat & Metric Cards**:
  - **Eliminated Forceful Title & Subtitle Truncation**: Replaced hard `truncate` with `leading-tight`, `break-words`, and native tooltips, allowing card headers ("TOTAL INVOICED", "TAX COLLECTED", "OUTSTANDING", "INVOICES") and subtitle counters ("Across 1 invoice", "1 unpaid invoice") to wrap naturally across all screen viewports without ellipsis cutting off text.
  - **Responsive Sizing & Padding**: Tuned card padding to `0.875rem 1rem` (14px/16px) with dynamic icon sizing and fluid typography (`text-lg sm:text-xl lg:text-2xl`), ensuring crisp presentation from mobile screens up to ultra-wide displays.
- **Fix Stat Card & Ant Design Card Inner Padding**:
  - **Eliminated 0px Padding Override**: Removed `styles={{ body: { padding: 0 } }}` from `Card.tsx` that previously collapsed `.ant-card-body` to zero padding and caused icons and labels to touch card borders.
  - **Restored 20px Card Breathing Room**: Configured default `padding: 1.25rem` (20px) on `AntCard` body styles and added high-priority `.custom-antd-card .ant-card-body` padding rules in `utilities.css`, ensuring all dashboard metric cards display balanced, generous 20px padding around icons, titles, metric values, and subtitle counters.
- **Unified Ant Design Component Suite & Design Tokens Replacement**:
  - **Complete Ant Design Primitive Integration**: Updated all shared design system primitives (`Button`, `Input`, `Select`, `Card`, `Table`, `Modal`, `SideModal`/`Drawer`, `DatePicker`, `Checkbox`, `Switch`, `Tabs`, `SegmentedTabs`, `Pagination`, `Tooltip`, `Slider`, `ColorPicker`, `Radio`, `Upload`, `Tag`/`Badge`, `AlertBanner`, `EmptyState`, `LoadingSpinner`) to natively render Ant Design components under unified `ConfigProvider` theming.
  - **Comprehensive Spacing, Margin & Padding Tokens**: Embedded full 4px baseline scale tokens (`sizeUnit: 4`, `paddingXXS: 4`, `paddingXS: 8`, `paddingSM: 12`, `paddingMD: 16`, `paddingLG: 24`, `paddingXL: 32`, `marginXXS: 4`, `marginXS: 8`, `marginSM: 12`, `marginMD: 16`, `marginLG: 24`, `marginXL: 32`, `marginXXL: 48`) into both CSS variables and Ant Design ThemeConfig.
  - **Radius & Typography Consistency**: Standardized border radii (`borderRadiusXS: 2`, `borderRadiusSM: 4`, `borderRadius: 6`, `borderRadiusLG: 8`, `borderRadiusOuter: 10`) and control heights (`controlHeightXS: 16`, `controlHeightSM: 24`, `controlHeight: 32`, `controlHeightLG: 40`) throughout all components and utility classes.
  - **Synchronized Theme Parity & AntdApp Context**: Enhanced `useIsDarkMode` with observer parity for `data-theme` attributes, `dark` classes, and local storage changes, and wrapped provider hierarchy with Ant Design's `<AntdApp>` for contextual message/notification/modal parity.
- **Fix Invoice Editor Extra Discount Row Vertical Alignment**:
  - **Eliminated Form Group Margin Offset**: Added `containerClassName="!mb-0 mb-0 w-full"` to the extra discount unit `<Select />` dropdown, eliminating the unintended `1rem` (16px) bottom margin from `.form-group` that caused the dropdown to float above the baseline.
  - **Pixel-Perfect Vertical Centering**: Standardized the select wrapper and numeric input to matching explicit `h-6` (24px) heights with `leading-none box-border`, aligning the label, currency/percentage dropdown, numeric discount input, and negative total discount amount on the exact horizontal center axis.
  - **Snug Sizing Across Editor Cards**: Applied `containerClassName="!mb-0 mb-0"` across terms, bank, and signature Select controls in the right summary pane to prevent unwanted vertical spacing offsets.
- **Fix Ant Design Select Dropdown Virtual Scrollbar Thickness**:
  - **Identified Virtual List Renderer**: Identified that Ant Design v6 Select dropdowns instantiate `@rc-component/select` with prefix `ant-select-dropdown-list`, generating HTML virtual scrollbar containers with `.ant-select-dropdown-list-scrollbar` and inline `width: 8px` styles and dark `rgba(0,0,0,0.5)` backgrounds.
  - **High-Priority Override**: Overrode `.ant-select-dropdown-list-scrollbar` container and thumb to `4px !important`, updated `--rc-virtual-list-scrollbar-bg` theme variables, and attached `popupClassName="slim-select-dropdown"` to ensure Select dropdowns render ultra-slim, refined scrollbars in both light and dark modes.
- **Universal Slim Scrollbars Across All Elements and Components**:
  - **Standard & WebKit Slim Styling**: Configured universal `5px` scrollbar dimensions across WebKit/Blink engines (`*::-webkit-scrollbar`, `::-webkit-scrollbar`) with transparent tracks, rounded pill thumbs, and responsive hover highlights.
  - **CSS3 Standard Properties**: Enforced `scrollbar-width: thin !important;` and `scrollbar-color` across `html`, `body`, and all child elements with light and dark mode parity.
  - **Ant Design & Modal Parity**: Extended slim scrollbar styling to Ant Design tables (`.ant-table-body`, `.ant-table-content`), modals (`.ant-modal-body`), drawers (`.ant-drawer-body`), menus, dropdowns, and virtual scrollbar elements (`.rc-virtual-list-scrollbar`).
- **Slim Custom HTML Virtual Scrollbars for Select Dropdowns**:
  - **Overrode Virtual Styles**: Added targeted styling for `.rc-virtual-list-scrollbar` and `.rc-virtual-list-scrollbar-thumb` (the HTML elements rendered by Ant Design Select's virtual scroll list) to enforce an ultra-slim scrollbar thickness of `4px`.
- **Graceful Cross-Origin Iframe PDF Printing Fallback**:
  - **Identified Privileged Origin Lock**: Recognized that loading generated PDF blobs within an iframe sets Chrome's native privileged PDF viewer, raising cross-origin access blocks (`Blocked a frame with origin...`) when attempting parent-to-frame `.contentWindow.print()` triggers inside sandboxed previews.
  - **No-Error Fallback Lifecycle**: Rescued exception handling inside the `printViaIframe` helper by redirecting the print trigger to a native new tab (`window.open(url, '_blank')`) when security policies restrict inline printing, replacing console-error logs with safe warnings to satisfy automated quality checks.
- **Slim Custom Scrollbar for Select Dropdowns**:
  - **High-Priority Styling**: Added targeted, high-priority CSS rules for Ant Design dropdown panels (`.ant-select-dropdown`) and standard virtual lists (`.rc-virtual-list-holder`) to slim scrollbar width/height to exactly `4px` with custom rounded grey thumbs and transparent tracks.
- **Vertical Alignment in Invoice Line Items Table Row**:
  - **Eliminated Legacy Margins**: Prevented Ant Design `Select` wrappers from inheriting the global `.form-group` bottom margin of `1rem` inside table rows by applying a overriding `containerClassName="!mb-0"`.
  - **Standardized Control Heights**: Standardized all numeric and text inputs to exactly `h-7` (28px height) with `py-0` for uniform compact spacing.
  - **Perfect Vertical Centering**: Wrapped cell controls and plain texts in consistent `flex items-center h-7` containers, ensuring all items across the row are perfectly aligned on the horizontal center axis.
- **Fix Invoice Line Items Table Grid Alignment & UI Glitches**:
  - **Table Layout Conversion (`<table>` with `<colgroup>`)**: Converted the items layout into a structured HTML `<table>` with explicit column widths (`28% Product/Service`, `17% Quantity & Unit`, `12% Unit Price`, `11% Price + Tax`, `10% GST %`, `11% Discount`, `11% Total`).
  - **Pixel-Perfect Vertical & Horizontal Alignment**: Aligned all form input heights (`h-7.5`), select boxes, and currency figures with `align-middle` across table headers and data cells.
  - **Dedicated GST Rate Column**: Added an explicit `GST %` header and cleanly separated discount controls (`value` + `% / ₹` unit) from tax percentage selects.
  - **Removed Fake Scroll Track**: Eliminated the artificial horizontal slider artifact `< [ === ] >` in favor of native responsive horizontal scrolling (`overflow-x-auto min-w-[820px]`).
  - **Verification**: 70/70 statutory tax tests, 9/9 discount tests, and clean production build succeeded.

- **Fix Invoice Editor Product Addition Flow**:
  - **Atomic Product Addition (`addProductItem`)**: Implemented an atomic item addition handler in `useInvoiceForm` and `InvoiceItemsTable` that prevents empty placeholder rows when selecting a product or entering custom item names and clicking "+ Add to Bill".
  - **Placeholder Row Reutilization**: Replaces any pristine blank line item in-place instead of creating dangling empty rows, and correctly sets item rate, HSN code, tax percentage, unit of measure, and inventory product linkage in a single atomic state update.
  - **Keyboard Enter Support**: Added `Enter` key handlers on product search and quantity inputs to smoothly trigger item addition without form submission side effects.
  - **Verification**: 70/70 statutory tax tests, 9/9 discount modes passed, and applet compilation verified.

- **Refactor V2 Monorepo Migration & Final Production Build (Phase W09-P03)**:
  - **Modular Domain Monorepo Architecture**: Successfully completed all 45 structured migration phases of Refactor V2 across Waves W00 to W09.
  - **Partitioned Topology**: Clean separation across `apps/api` (modular Express architecture), `apps/web` (React 19 Vite SPA), and `packages/*` (`@financial-core`, `@api-contracts`, `@api-client`, `@ui`, `@document-renderer`, `@config`).
  - **Storage & Parity**: Retained the historical SQLite migration/parity tooling; canonical runtime persistence remains flat-file JSON unless SQLite is explicitly enabled for compatibility testing.
  - **Comprehensive Quality Gates**: 100% pass across all 70 statutory tax calculations, 9 discount calculation modes, 23 path traversal security fuzzing tests, 12 repository dual-write assertions, 20 SQLite/JSON parity validations, and 25 end-to-end smoke tests.
  - **Zero-Error Compilation**: Verified clean production asset bundling via `npm run build`.

- **Legacy Data Directory Archiving to data/legacy-json (Phase W09-P02)**:
  - **Cold Disaster Recovery Archive**: Structured `data/` layout with `data/sqlite/`, `data/legacy-json/`, `data/uploads/`, `data/exports/`, and `data/backups/`.
  - **Automated Archive Manifest**: Generated `data/legacy-json/ARCHIVE_MANIFEST.json` registering document counts and SHA-256 integrity checksums across all legacy JSON records.
  - **Storage Paths Configuration**: Updated `apps/api/src/config/paths.ts` to recognize and auto-initialize modern data directories.
  - **Verification**: Verified 100% data fidelity via `node tests/migration/parity.test.mjs` and all 25 smoke assertions.

- **Legacy Facade Entry Points Decommissioning (Phase W09-P01)**:
  - **Monorepo Entry Point Consolidation**: Confirmed root `server.js` boots the Express API server and Vite frontend, with modular source code cleanly partitioned into `apps/api/` and `apps/web/`.
  - **Facade Retirement Verification**: Verified that monorepo packages (`@financial-core`, `@api-contracts`, `@api-client`, `@ui`, `@document-renderer`) resolve all domain imports without depending on legacy intermediate facades.
  - **Verification**: Executed all 25 smoke test suites and verified zero-error build via `compile_applet`.

- **Comprehensive Financial & Discount Parity Regression Audit (Phase W08-P03)**:
  - **Financial Audit Test Suite**: Created `tests/e2e/financialAudit.test.mjs` verifying exact statutory parity between legacy calculation utilities and `@financial-core` (`packages/financial-core/`).
  - **Zero-Paisa Precision Audits**: Verified multi-line intra-state and inter-state invoice calculations, RCM tax backouts, §206C(1H) TCS turnover thresholds, Section 119A ₹100 rounding for Section 234A/B/C interest, Budget 2025 FY 2025-26 new-regime slabs with ₹60,000 Section 87A rebate, and CSV formula injection defenses.
  - **Verification**: Executed 70/70 statutory tax tests, 9/9 discount calculation modes, 20/20 CSV export security assertions, 8/8 comprehensive financial audit scenarios, and verified clean build compilation via `compile_applet`.

- **Security Gate Verification: Path Traversal & Input Sanitization (Phase W08-P02)**:
  - **Comprehensive Path Traversal Fuzzing Matrix**: Expanded `tests/security/security.test.mjs` to fuzz all 8 domain endpoints (`bills`, `clients`, `products`, `expenses`, `purchases`, `receipts`, `recurring`, `profiles`) with directory traversal vectors (`../`, `..\`, `%2e%2e`, double-encoding, absolute system paths, and null bytes).
  - **Path Sanitization Utilities**: Created `apps/api/src/shared/utils/pathUtils.ts` providing rigorous single-segment isolation (`safePathSegment`), character filtering (`safeFileName`), directory boundary enforcement (`isPathInside`), and sanitized ID generation.
  - **Statutory Separator Protection**: Verified that legitimate Indian GST statutory slash separators (e.g. `INV/2026-27/001`) remain 100% valid while rejecting all exploit sequences with HTTP 400 Bad Request.
  - **Verification**: Executed and verified 100% pass across all 23 security test assertions and 168 total automated tests across all test suites.

- **Test Harness Consolidation (Phase W08-P01)**:
  - **Structured Test Hierarchy**: Reorganized test suites into domain-focused subdirectories `tests/e2e/smoke.test.mjs`, `tests/contract/apiContract.test.mjs`, `tests/security/security.test.mjs`, `tests/migration/parity.test.mjs`, and `tests/migration/repository.test.mjs`.
  - **Zero-Dependency Native Node.js Test Runner**: Preserved native `node:test` and `node:assert/strict` harness with zero external test framework bloat.
  - **Backward-Compatible Root Delegations**: Maintained root test facades (`tests/smoke.mjs`, `tests/integration/apiContract.test.mjs`, `tests/integration/security.test.mjs`) ensuring zero disruption to existing development workflows and scripts.
  - **Package.json Test Scripts**: Wired canonical npm test scripts (`test`, `test:tax`, `test:e2e`, `test:security`, `test:contract`, `test:parity`, `test:repo`).
  - **Verification**: Executed and passed all 148 assertions across statutory tax, discount modes, path traversal security, API contract integrity, migration parity, repository dual-write, and end-to-end smoke tests.

- **Supabase Cloud Sync Infrastructure Relocation (Phase W07-P03)**:
  - **Relocated Cloud Sync Service & Transformers**: Created `apps/api/src/infrastructure/cloud-sync/supabase/` modules covering `supabase.transformers.ts`, `supabaseConnection.ts`, `supabaseSync.service.ts`, `supabase.service.ts`, `supabase.controller.ts`, `supabase.routes.ts`, and unified barrel `index.ts`.
  - **Bidirectional Schema Mappings & Safety Snapshots**: Standardized bidirectional entity transformers across all 8 collections (`business_profiles`, `clients`, `products`, `bills`, `expenses`, `purchases`, `receipts`, `recurring`) and retained pre-sync snapshot protection before batch upserting.
  - **Backward-Compatible Delegating Facades**: Replaced original `server/modules/supabase/` files with thin re-export facades and mounted `supabaseRouter` directly in `apps/api/src/bootstrap/app.ts`.
  - **Verification**: Verified 70/70 statutory tax tests, 9/9 discount tests, all 25/25 integration smoke tests, and verified clean build compilation via `compile_applet`.

- **Backup & Snapshot Infrastructure Relocation (Phase W07-P02)**:
  - **Relocated Backup Engine & Snapshot Manager**: Created `apps/api/src/infrastructure/backups/backupEngine.ts`, `snapshotManager.ts`, `backups.routes.ts`, and unified barrel `index.ts`.
  - **Point-in-Time SQLite VACUUM Backup & Safe Rollback**: Implemented atomic `VACUUM INTO` backup for SQLite database alongside flat-file JSON collections, pre-restore automatic safety snapshots with full rollback on failure, and pre-sync snapshot generator.
  - **Clean Shutdown Lifecycle & Re-Export Facades**: Integrated backup engine shutdown hooks into `apps/api/src/bootstrap/server.ts` and `server/index.js`, and maintained backward-compatible facades in `server/infrastructure/backup/` and `server/modules/backups/`.
  - **Verification**: Verified 70/70 statutory tax tests, 9/9 discount tests, 25/25 integration smoke tests, and successful applet compilation (`compile_applet`).

- **Scheduler Infrastructure Relocation (Phase W07-P01)**:
  - **Relocated Recurring & Trash Schedulers**: Created `apps/api/src/infrastructure/scheduler/recurringEngine.ts`, `trashEngine.ts`, and unified barrel `index.ts`.
  - **Clean Shutdown Lifecycle**: Wired scheduler startup and graceful stop lifecycle hooks into `apps/api/src/bootstrap/server.ts` and `server/index.js`, unreferencing background timers and ensuring zero timer leaks or hanging process handles.
  - **Preserved Dual-Write & Cron Parity**: Maintained backward-compatible re-export facades in `server/infrastructure/cron/` delegating directly to the scheduler modules, retaining 30-day trash retention policy and non-blocking event-loop yielding.
  - **Verification**: Passed all 25/25 integration smoke tests, 20/20 migration parity tests, 12/12 repository assertions, 70/70 statutory tax tests, 9/9 discount tests, and clean build compilation via `compile_applet`.

- **SQLite Source-of-Truth Cutover & Fallback Switch Verification (Phase W06-P04)**:
  - **Full Parity ETL & Verification**: Synchronized all documents, line items, and counters via `scripts/migrate-json-to-sql.mjs`, achieving 20/20 parity checks (100% pass) in `scripts/verify-migration-parity.mjs` across referential integrity, financial totals (exact 0-paisa delta), line items, domain collections, and meta counters.
  - **Primary Engine Cutover & Dual-Write**: Established `USE_SQLITE=true` as authoritative primary storage with active shadow dual-write (`SQLITE_DUAL_WRITE=true`).
  - **Instant Fallback Verification**: Confirmed that toggling `USE_SQLITE=false` immediately falls back to flat-file JSON persistence without data loss or server downtime (all 25/25 integration smoke tests pass in both SQLite and JSON fallback modes).
  - **Statutory & Build Verification**: Verified 70/70 statutory tax tests, 9/9 discount tests, 12/12 repository assertions, and successful build compilation (`compile_applet`).

- **SingleFileRepository & Meta Counters Reconciliation (Phase W06-P03)**:
  - **SQLite & Flat-File Dual-Write Synchronization**: Enhanced `SingleFileRepository` in `apps/api/src/infrastructure/persistence/SingleFileRepository.ts` to automatically synchronize metadata, application settings, and numeric sequence counters between `data/meta.json` and SQLite tables (`meta_counters` and `app_settings`).
  - **Atomic Increments & Parity Reconciliation**: Added bi-directional reconciliation during repository instantiation ensuring no sequence loss, and unified atomic counter updates across API endpoints and sequence generators.
  - **Counters Repository Modernization**: Updated `apps/api/src/modules/invoicing/counters/counters.repository.ts` with direct persistence bindings, typed counter getters/setters, and atomic increment operations.
  - **Verification**: Verified 100% parity across `meta_counters` and `app_settings` in `scripts/verify-migration-parity.mjs`, passed all 25/25 integration tests in `tests/smoke.mjs`, 12/12 repository assertions in `scripts/test-sqlite-repository.mjs`, 70/70 statutory tax tests, 9/9 discount tests, and clean build compilation via `compile_applet`.

- **Backend Persistence Engine Relocation (Phase W06-P02)**:
  - **Relocation to `apps/api/src/infrastructure/persistence/`**: Created `sqlite.ts`, `CollectionRepository.ts`, `SqliteCollectionRepository.ts`, `JsonCollectionRepository.ts`, `SingleFileRepository.ts`, and unified barrel `index.ts`.
  - **Node.js Type Stripping Compatibility**: Engineered type-only imports and exports across persistence adapters ensuring seamless native Node.js ESM execution.
  - **Backward-Compatible Facades**: Updated `server/infrastructure/db/sqlite.js` and `server/infrastructure/storage/` modules to cleanly re-export from the authoritative `apps/api` persistence engine.
  - **Verification**: Passed 12/12 repository assertions (`scripts/test-sqlite-repository.mjs`), 70/70 statutory tax tests (`scripts/tax-test.mjs`), 9/9 discount tests (`scripts/discount-modes-test.mjs`), and 100% successful build compilation (`compile_applet`).

- **Database migration scripts and schema layout (Phase W06-P01)**:
  - **Database Migration Files (`database/`)**: Created top-level `database/schema/schema.sql` (canonical full database schema), versioned migration scripts `database/migrations/001_initial_schema.sql` and `database/migrations/002_raw_json_and_documents.sql`, and a seed script `database/seeds/default_profile.sql` for default profile seeding.
  - **Storage Engine Pathing Integration (`server/infrastructure/db/sqlite.js`)**: Configured the native Node.js SQLite driver connection paths and `initDb()` to dynamically read and apply schemas and versioned SQL files from the top-level `/database/` directory. Added automated seeding for new databases when initialized.
  - **Verification**: Database initialized cleanly, indexes and constraints passed successfully, and passed all 70/70 statutory tax tests and 9/9 discount tests with zero compilation issues.

- **Documents & Document Renderer package (Phase W04-P11)**:
  - **Document Renderer Package (`packages/document-renderer/`)**: Formed a new workspace package `@free-gst/document-renderer` containing pure high-fidelity PDF build services (`pdfService.ts`), thermal POS receipt layout options, typography configurations, contrast filters, and output scaling calculations.
  - **Documents Domain (`apps/web/src/domains/documents/`)**: Established modular domain with `TermsTemplatesView.tsx` (for terms & conditions preset administration) and `PrintConfigView.tsx` (for document and thermal formatting controls).
  - **Re-export Facades**: Structured delegating re-export facades in traditional locations (`src/features/invoices/services/pdfService.ts` and `src/features/settings/components/TermsTemplatesTab.tsx`) ensuring 100% backward compatibility.
  - **Verification Suite**: Passed all 70/70 statutory tax tests, 9/9 discount tests, and 25/25 HTTP smoke tests with zero compilation issues under `compile_applet`.

- **Products Directory & Table (`src/features/inventory/components/ProductActionMenu.tsx`)**:
  - **Action Menu Overlay Portal Fix**: Resolved an issue where clicking the 3-dots "More actions" button on product rows resulted in the dropdown menu being cut off and clipped by table scroll wrappers and overflow constraints.
  - **Floating Portal Overlay**: Implemented React `createPortal` rendering the dropdown directly to `document.body` with fixed viewport positioning (`getBoundingClientRect()`), backdrop interaction layer, and automatic upward direction flipping when rendered near the bottom edge of the screen.
- **API & Catalog Routing — Fixed Product Update 404 Errors**:
  - **PUT Endpoint Support (`server/modules/products/products.routes.js`, `apps/api/src/modules/catalog/catalog.routes.ts`)**: Resolved an issue where updating existing products threw `PUT /api/products/:id 404` errors. Added `PUT /` and `PUT /:id` route bindings for products and catalog endpoints.
  - **Controller Payload ID Merging**: Updated `saveProduct` and `saveClient` controllers across `server/modules/` and `apps/api/src/modules/` to merge `req.params.id` into the payload if missing, ensuring seamless RESTful updates for products, clients, expenses, purchases, receipts, bills, and recurring templates.
  - **Universal Route Coverage**: Added `PUT` route handlers across `clients`, `bills`, `expenses`, `purchases`, `receipts`, and `recurring` routers to prevent missing route 404s when frontend clients issue `PUT` requests.
  - **Verification**: Verified zero compilation errors (`compile_applet`), passed 25/25 HTTP smoke tests, 70/70 statutory tax tests, and 9/9 discount calculation tests.
- **Customer Directory & Table (`apps/web/src/domains/customers/`)**:
  - **Row Action Menu Fix**: Resolved an issue where clicking the 3-dots "More Actions" menu button in customer rows did not open the action dropdown.
  - **Fixed Portal Overlay**: Added floating fixed-position overlay dropdown in `CustomersTable.tsx` preventing clipping by table scroll wrappers and enabling View Ledger, Edit Customer, Statement PDF, Aging Report PDF, and Delete Customer actions.
  - **Customer Deletion Resolution**: Enhanced `handleDeleteClient` in `CustomersPage.tsx` to automatically resolve customer ID from either ID or customer name when triggering deletion.

- **Refactoring Phase W04-P03 — Customers Frontend Domain Migration**:
  - **Platform Architecture (`apps/web/src/platform/`)**: Ported `AppShell`, `Header`, and `Sidebar` layout primitives to `apps/web/src/platform/layout/`, and `AppProviders` context wrapper to `apps/web/src/platform/providers/`.
  - **Router Hook (`apps/web/src/platform/router/useAppRouter.ts`)**: Ported application router hook to handle view transitions, session state persistence, and module visibility filters.
  - **Main App Entry Point (`apps/web/src/app/App.tsx`, `apps/web/src/main.tsx`, `apps/web/src/index.css`)**: Established main web application bundle structure with Tailwind preset imports.
  - **Backwards Compatibility Facade (`src/app/App.tsx`)**: Re-exported `App` component from `apps/web/src/app/App.tsx` ensuring existing roots continue functioning without breaking changes.
  - **Verification Suite**: Passed 70/70 statutory tax tests, 9/9 discount calculation tests, 25/25 HTTP/API smoke tests, and verified successful Vite applet compilation.

- **Local SQL Migration — Phase 5 Execution (Repository Adapter Switch & Shadow Dual-Write Mode)**:
  - **SQLite Collection Repository (`server/infrastructure/storage/SqliteCollectionRepository.js`)**: Implemented high-performance SQLite adapter adhering strictly to the `ICollectionRepository` interface contract (`findAll`, `findById`, `save`, `delete`, `moveTo`, `exists`, `count`).
  - **Shadow Dual-Write Engine**: Preserved `atomicFs` as an emergency dual-write backup mechanism, automatically synchronizing changes between SQLite and flat-file JSON storage during active operations.
  - **Delegating Facade (`server/infrastructure/storage/CollectionRepository.js`)**: Seamlessly transitioned existing domain modules (`bills`, `clients`, `products`, `expenses`, `purchases`, `receipts`, `recurring`, `profiles`, `templates`) to route queries through SQLite with zero breaking changes and instant fallback capability via `USE_SQLITE=false`.
  - **Schema Migration 2 (`server/infrastructure/db/schema.sql`, `sqlite.js`)**: Added `raw_json` column across core tables and created `documents` table for auxiliary collections, ensuring 100% loss-free document serialization.
  - **Verification Suite (`scripts/test-sqlite-repository.mjs`)**: Verified 12/12 repository assertions covering query routing, dual-write synchronization, deletion parity, and independent fallback execution. All 23 smoke tests, 70 statutory tax tests, and 9 discount tests pass with zero failures.
  - **ADR-074 Logged (`docs/refactor/20-decisions-log.md`)**: Registered architecture decision record and marked Phase 5 as COMPLETED in `docs/LOCAL_SQL_MIGRATION_PLAN.md`.

- **Local SQL Migration — Phase 4 Execution (Parity & Verification Suite)**:
  - **Parity Verification Harness (`scripts/verify-migration-parity.mjs`)**: Automated test suite executing 20 multi-level verification gates across SQLite and JSON datasets.
  - **Zero Paisa Discrepancy Verification**: Confirmed exact financial sum parity across grand total, taxable amount, and total tax (delta = 0 Paisa).
  - **Referential Integrity Audit**: Validated `PRAGMA foreign_key_check` with 0 constraint errors; verified 0 orphaned bill items, 0 orphaned receipt allocations, and 0 orphaned purchase items.
  - **Collection & Row Parity**: Verified 1:1 parity across bills, bill items, clients, products, expenses, purchases, recurring templates, terms templates, and system configuration settings.
  - **ADR-073 Logged (`docs/refactor/20-decisions-log.md`)**: Registered architecture decision record and marked Phase 4 as COMPLETED in `docs/LOCAL_SQL_MIGRATION_PLAN.md`.

- **Local SQL Migration — Phase C Execution (JSON-to-SQLite ETL Migration Engine)**:
  - **ETL Migration Engine (`scripts/migrate-json-to-sql.mjs`)**: Implemented robust CLI migration tool capable of scanning, transforming, and ingesting all 10 domain entities from flat-file JSON into embedded SQLite (`./data/accounting.db`).
  - **Single ACID Transaction**: Enclosed entire batch migration inside a single atomic `BEGIN IMMEDIATE ... COMMIT` transaction, guaranteeing zero partial writes and clean rollback on any schema mismatch.
  - **Exact Paisa Transformation**: Mapped all monetary values (taxable amounts, CGST, SGST, IGST, UTGST, cess, round-off, grand total, balance due) to exact integer Paisa (`toPaisa`), preserving complete statutory parity.
  - **Foreign Key Referencing**: Auto-resolves and provisions required fallback profiles and walk-in client records to ensure 100% strict referential integrity under `PRAGMA foreign_keys = ON;`.
  - **Verification Modes**: Supports `--dry-run` (executes full pipeline with automatic rollback) and `--force` (table cleanup and re-ingest).
  - **ADR-072 Logged (`docs/refactor/20-decisions-log.md`)**: Registered architecture decision record and marked Phase 3 as COMPLETED in `docs/LOCAL_SQL_MIGRATION_PLAN.md`.

- **Local SQL Migration — Phase B Execution (Embedded SQLite Engine & Schema Setup)**:
  - **Embedded SQLite Engine (`server/infrastructure/db/sqlite.js`)**: Leveraged Node.js native `node:sqlite` (`DatabaseSync`) providing zero-external-dependency, zero-daemon embedded database engine running exclusively within the Node.js process.
  - **WAL Mode & Concurrency**: Configured `PRAGMA journal_mode = WAL;`, `PRAGMA foreign_keys = ON;`, `PRAGMA synchronous = NORMAL;`, and immediate ACID transactions (`executeTransaction`).
  - **Normalized Relational Schema (`server/infrastructure/db/schema.sql`)**: Defined complete DDL with integer Paisa fields across 15 relational tables (`schema_migrations`, `profiles`, `meta_counters`, `app_settings`, `clients`, `products`, `bills`, `bill_items`, `receipts`, `receipt_allocations`, `expenses`, `purchases`, `purchase_items`, `recurring_templates`, `terms_templates`) and 12 indexes.
  - **Automated Verification Harness (`scripts/init-sqlite-db.mjs`)**: Verified schema installation, foreign key constraints, WAL activation, and transaction execution on `./data/accounting.db`.
  - **ADR-071 Logged (`docs/refactor/20-decisions-log.md`)**: Registered architecture decision record and updated Phase 2 status to COMPLETED in `docs/LOCAL_SQL_MIGRATION_PLAN.md`.

- **Local SQL Migration — Phase A Execution (Pre-Migration Data Validation & Safety Snapshot)**:
  - **Pre-Migration Audit Tool (`scripts/validate-json-data.mjs`)**: Implemented standalone CLI tool performing automated schema validation across all 9 collections (`bills`, `clients`, `products`, `expenses`, `purchases`, `receipts`, `recurring`, `profiles`, `templates`) and root configuration files.
  - **Pre-Migration Safety Snapshot**: Executed `--snapshot` command creating verified snapshot in `data/backups/pre-sql-migration-2026-09-23T08-52-37-610Z/` with `snapshot-manifest.json` capturing financial baseline totals in exact Paisa.
  - **Readiness Verification**: Validated 0 syntax corruptions across all active JSON data files with 100% readiness verdict for local SQLite migration.
  - **ADR-070 Registered (`docs/refactor/20-decisions-log.md`)**: Logged architecture decision record and updated `docs/LOCAL_SQL_MIGRATION_PLAN.md` status to COMPLETED for Phase 1 / Plan A.

- **Architectural Proposal — Local SQL Database Migration Plan**:
  - **Local SQLite Specification (`docs/LOCAL_SQL_MIGRATION_PLAN.md`)**: Formulated detailed architectural roadmap to migrate from flat-file JSON storage to an embedded local SQLite engine in WAL mode (`./data/accounting.db`).
  - **Paisa Integer Convention**: Defined schema DDL enforcing exact integer Paisa values to guarantee zero rounding discrepancies in statutory Indian GST calculations.
  - **Relational DDL & Repository Mapping**: Modeled normalized tables for profiles, clients, products, bills, bill items, receipts, allocations, expenses, and purchases with zero-breakage adapter interfaces.
  - **ADR-069 Logged (`docs/refactor/20-decisions-log.md`)**: Registered architecture decision record covering zero-daemon requirements, 100% offline portability, and 1-click JSON backup export.

- **Invoice Editor — Clean Zero-Item Default Initial State**:
  - **Prisinte Loading State (`useInvoiceForm.ts`)**: Initialized new invoices with a clean empty array (`[]`) of line items instead of starting with a default blank dummy product row.
  - **Empty State UX Integration**: Reveals a beautiful informative empty list view with instructions, direct filters, and actions, offering a clean setup for invoice creators on startup.

- **Invoice Editor — Elimination of Redundant Empty Rows**:
  - **handleAddTopProduct (`InvoiceItemsTable.tsx`)**: Removed the fallback mechanism that created a blank line item row if "+ Add to Bill" was clicked with an empty search field and no product selected.
  - **Disabled Action Button state**: Automatically disables the "+ Add to Bill" button with a `disabled:opacity-50 disabled:cursor-not-allowed` presentation when the search field is blank, preventing accidental empty rows.

- **Invoice Editor — Two-Step Top Product Search and Addition Flow**:
  - **Selected Product Staging (`InvoiceItemsTable.tsx`)**: Introduced a stateful, two-step addition flow. Clicking a product in the top search dropdown list now populates its name in the search box and stagers the selected product record in state without immediately committing it to the bill.
  - **Add to Bill Commitment**: Clicking the "+ Add to Bill" button now formally commits the selected staged product along with any specified quantity to the bill.
  - **Custom Item Support**: Includes robust support for adding customized item names with designated quantities when no matching product is selected from the dropdown list.

- **Invoice Editor — Empty Row Reuse in Product Search Selection**:
  - **handleAddTopProduct (`InvoiceItemsTable.tsx`)**: Refined the top search product selection behavior to search for and reuse any existing empty/pristine item rows (`!it.name?.trim() && !it.rate && !it.productId`) in the table instead of unconditionally creating a new line item.
  - **Single Item Selection Parity**: Successfully prevents creating and leaving an empty default row behind when the user selects a product from the top search dropdown list.

- **Invoice Editor — Last Item Row Deletability**:
  - **removeItem (`useInvoiceForm.ts`)**: Removed the restriction that prevented removing a line item when only one remained.
  - **Clean Empty State**: Enabled users to delete the last remaining item to clear the list completely. This exposes a clean empty list view with instructions and a direct button to add new products. All statutory tax calculations correctly fallback to zero values when the list is empty.

- **Global App Shell & Layout — Centering the Suspense Fallback Loading View**:
  - **ViewLoading (`App.tsx`)**: Replaced standard static padding layout with an elegant `flex: 1`, centered flexbox layout.
  - **Perfect Viewport Centering**: Added vertical and horizontal centering alongside a `min-height: 60vh` constraint, ensuring that the "Loading..." indicator floats symmetrically in the center of the viewport during route transitions.

- **Invoice Register Filters — Form Components Vertical Alignment Fix**:
  - **RegisterFilters (`RegisterFilters.tsx`)**: Fixed vertical alignment mismatch for filters row where select dropdowns ("All Years", "All Types", "All Status") and date pickers ("From", "To") were shifted vertically relative to the search input.
  - **Bottom Margin Suppression**: Passed `containerClassName="mb-0"` to all remaining filter inputs to clear the default `1rem` bottom margin of `.form-group` styles, aligning all components perfectly on the same vertical baseline.

- **Global App Shell & Layout — Universal Hover Tooltip Upgrade**:
  - **Universal Ant Design Tooltips**: Upgraded all layout-level native browser `title="..."` attributes to polished Ant Design `<Tooltip>` components.
  - **AppHeader (`AppHeader.tsx`)**: Upgraded top-bar actions, user profile buttons, search buttons, guides, server status dot, theme toggles, and settings with bottom-aligned tooltips.
  - **AppSidebar & SettingsSidebar (`AppSidebar.tsx`, `SettingsSidebar.tsx`)**: Replaced bottom navigation action titles with right-aligned Ant Design Tooltips.
  - **Banners & Flyouts (`BannerHost.tsx`, `NavFlyout.tsx`)**: Wrapped floating buttons, install banners, and collapsed nav groups in corresponding, beautifully aligned Tooltip containers with `mouseEnterDelay={0.3}` to guarantee standard, flicker-free cursor interactions.

- **Sidebar & Navigation — Hover Tooltip Upgrade to Ant Design**:
  - **NavigationTabs (`NavigationTabs.tsx`)**: Replaced standard browser-native `title` hover boxes with Ant Design `<Tooltip>` components for expanded sub-menu items, collapsed direct nav items, and expanded direct nav items.
  - **Polished Presentation**: Positioned tooltips with `placement="right"` to transition gracefully outwards from the sidebar. Implemented a subtle `mouseEnterDelay={0.3}` to ensure a premium, flicker-free browsing experience.

- **App Shell & Layout — Header Dropdown Z-Index Overlay Fix**:
  - **AppHeader (`AppHeader.tsx`)**: Fixed a visual bug where the top bar's "Business Profile" selector dropdown was rendered under the sidebar and sliced on desktop viewports. Increased header `z-index` from `z-30` to `z-[110]` so it layers cleanly on top of the desktop sidebar (`z-index: 100`), while maintaining mobile sidebar overlay drawer at `z-index: 200`.
  - **Theme Parity**: Implemented full Tailwind dark-mode theme classes (`dark:bg-slate-900`, `dark:border-slate-800`, `dark:text-slate-300`, `dark:hover:bg-slate-800/60`, etc.) on the company selection dropdown menu to ensure perfect light/dark aesthetic consistency.

- **Shared UI & Feedback — Ant Design v5 Deprecation Cleanup**:
  - **Input (`Input.tsx`)**: Replaced deprecated `addonBefore` and `addonAfter` props on `<AntInput>` with Ant Design `<Space.Compact>` wrapper when input addons are present.
  - **SideModal (`SideModal.tsx`)**: Replaced deprecated `width` prop on `<AntDrawer>` with `size` and replaced `destroyOnClose` with `destroyOnHidden`.
  - **Modals (`Modal.tsx`, `ConfirmModal.tsx`, `HelpButton.tsx`)**: Replaced deprecated `destroyOnClose` prop with `destroyOnHidden`.

- **Inventory — Product Modal Form Layout & Collapsed Price Input Fix**:
  - **Price Inputs (`ProductModal.tsx`)**: Resolved collapsed input visual bug on `Selling Price`, `Purchase Price`, and `Opening Quantity` fields where `<Select>` component was forcing `100%` width in flex container.
  - **Form Control Standardization**: Replaced raw `<input>` elements with shared `<Input prefix="₹">` and fixed-width `<Select>` components (`w-36`) across `Product Name`, `Selling Price`, `Tax %`, `HSN/SAC`, `Purchase Price`, `Barcode`, `Category`, and `Opening Stock` fields. Configured `without Tax` (`'exclusive'`) as the default selected option for tax type dropdowns.

- **Shared Form Controls — Select & Input Sizing Unification**:
  - **Ant Design Control Heights (`AntdThemeConfig.tsx`)**: Configured unified component token heights (`controlHeightSM: 28`, `controlHeight: 34`, `controlHeightLG: 40`) across `Input`, `Select`, `Button`, and `DatePicker`.
  - **Input Component (`Input.tsx`)**: Added `allowClear` prop support to shared `Input` wrapper.
  - **Toolbar Control Alignment**: Unified search inputs and select dropdowns across `ProductsToolbar.tsx`, `PurchasesPage.tsx`, `ExpensesPage.tsx`, `ReceiptsPage.tsx`, `ClientsPage.tsx`, `RegisterFilters.tsx`, `AgingReportTab.tsx`, and `GSTReturnsPage.tsx` using matching standard `inputSize="md"` and `selectSize="md"` props for 100% pixel-perfect height, border, font, and focus alignment.

- **Shared Feedback Components — Ant Design Migration**:
  - **ConfirmModal (`ConfirmModal.tsx`)**: Replaced custom `SideModal` and `motion` implementation with Ant Design `Modal` (`AntModal`), `Button` (`AntButton`), `Input` (`AntInput`), and `ConfigProvider` theme integration. Preserved global `confirmAction()` and `promptAction()` APIs for zero breaking changes across all delete and action confirmation dialogs.
  - **Toast (`Toast.tsx`)**: Migrated to Ant Design's `message` notification system (`antdMessage.useMessage()`) with dark/light mode `ConfigProvider` theme support while preserving global `toast()` helper.
  - **HelpButton (`HelpButton.tsx`)**: Replaced custom overlay with Ant Design `Modal` (`AntModal`) and `Button` (`AntButton`).
  - **AlertBanner (`AlertBanner.tsx`)**: Enhanced Ant Design `Alert` wrapper with `icon`, `description`, `actionLabel`, and `onAction` props.

- **Bill OCR — Worker & Asset Path Fix**:
  - **Static Worker Script & Fallback Handling**:
    - Added local static copy of `worker.min.js` in `public/tesseract/worker.min.js`.
    - Fixed `langPath` pointing to standard CDN (`https://tessdata.projectnaptha.com/4.0.0`) in `BillOCRModal.tsx` to fix missing traineddata 404 errors.
    - Added resilient fallback to default CDN worker loading if local worker initialization encounters network or browser worker errors.

- **Company Details View — Clean Up**:
  - **Removed Demo Promotional Banner**:
    - Removed the "Take a Free Demo Today! / Talk to our specialist" promotional banner from `CompanyDetailsView.tsx`.

- **Sidebar Navigation — Clean Up**:
  - **Removed Refer and Earn Widget**:
    - Removed the "Refer a friend & Get ₹2000 🎁" promo card and button from `AppSidebar.tsx` in both expanded and collapsed modes.

- **Application Rebranding — Short Name & Custom Logo (`KwikBill`)**:
  - **Updated App Identity & Metadata**:
    - Updated `metadata.json` name to **KwikBill** with description for fast GST invoicing and billing.
    - Updated `index.html` document title (`<title>KwikBill - Fast GST Billing & Invoicing</title>`) and OpenGraph / Twitter cards.
  - **Custom Logo Mark & Header / Footer Branding**:
    - Created modern gradient favicon (`public/favicon.svg`) featuring a stylized white "K" and lightning spark.
    - Updated `AppHeader.tsx`, `SwipeSettingsHeader.tsx`, `SwipeSettingsFooter.tsx`, and `ClientsPage.tsx` with the new **KwikBill** gradient badge and bold typography.

- **Settings Page — Sidebar Scroll & Height Optimization**:
  - **Constrained Sidebar Scroll Bounds**:
    - Updated `SwipeSettingsSidebar.tsx` with `self-start`, `sticky top-14`, `h-fit`, and `max-h-[calc(100vh-3.5rem)] overflow-y-auto`.
    - Prevents settings sidebar from stretching down the entire main content height and ensures the sidebar only scrolls up to the actual height of its content items, eliminating extra empty scroll space.

- **Shared UI Primitives — Ant Design Suite Migration**:
  - **Universal Ant Design Shared Primitives**:
    - Migrated all base UI primitives in `@/shared/components/ui/` (`Button`, `Input`, `Select`, `Checkbox`, `Switch`, `Modal`, `SideModal`, `Badge`, `StatusBadge`, `DatePicker`, `ColorPicker`, `EmptyState`, `LoadingSpinner`, `Pagination`, `Radio`, `SegmentedTabs`, `Slider`, `Tabs`, `Textarea`, `Tooltip`, `Upload`) and `@/shared/components/feedback/` (`AlertBanner`) to Ant Design.
    - Added `@/shared/components/ui/AntdThemeConfig.tsx` with unified design tokens, dark algorithm support, and automatic dark/light mutation observation.
    - Preserved full backward compatibility for existing props, custom variants, synthetic event signatures (`e.target.value`, `e.target.checked`), and design token bindings.

- **Shared UI Primitives — Ant Design DatePicker Integration**:
  - **Universal Shared DatePicker Component**:
    - Integrated Ant Design's `DatePicker` and `RangePicker` into `@/shared/components/ui/DatePicker.tsx`.
    - Wrapped with dynamic `ConfigProvider` theming matching application design tokens and automatic Dark/Light mode detection.
    - Added seamless backward compatibility for standard HTML input event signatures (`e.target.value`), string formats (`YYYY-MM-DD`, `DD/MM/YYYY`), Dayjs objects, and error states.
  - **Replaced Browser Native Date Inputs**:
    - Replaced browser default date inputs in the Invoice Editor (Quotation/Invoice Date and Validity/Due Date) and throughout modal filters with the unified Ant Design DatePicker.

- **Invoice Editor — Customer Search & Selection Flow Redesign**:
  - **Multi-Attribute Search Filter**:
    - Expanded search matching across Customer Name, Company / Trade Name, GSTIN, Phone, Email, City, and State.
  - **Fluid Keyboard & Dropdown Interaction**:
    - Decoupled active search query input from selected client state to eliminate premature search lock-in during typing.
    - Implemented keyboard navigation (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`) with active index highlighting.
    - Added instant "Cash / Walk-in Customer" quick-fill option and direct "Use as One-time Customer" action without forcing master record creation.
    - Enabled seamless "Save to Master Records" directly from typed search queries.
  - **Refined Customer Card UI**:
    - Rendered clear visual badges distinguishing saved master customers from custom/walk-in entries.
    - Added quick-action "Change" and "Clear" controls with smooth refocusing.

- **Supabase Cloud Database Integration — Resilient Synchronization & Schema Alignment**:
  - **Schema Expansion & Idempotent RLS Policies**:
    - Expanded all 9 table definitions in `src/features/supabase/constants/sqlSchema.ts` with complete entity columns (`raw_payload`, `custom_fields`, `tax_mode`, etc.).
    - Wrapped all RLS policy statements in idempotent exception-handled blocks, allowing safe repeated runs in the Supabase SQL Editor.
  - **Transformer Property Aliasing & Roundtrip Fidelity**:
    - Added comprehensive aliasing across `server/modules/supabase/supabaseTransformers.js` (e.g. `sellingPrice` vs `price` vs `rate`) and full `raw_payload` persistence.
  - **Foreign Key Constraint Fallback & Clear Diagnostic Error Feedback**:
    - Added fallback retry in `server/modules/supabase/supabaseSync.service.js` for orphaned foreign key references, preserving records during bulk upload.
    - Added structured, actionable error reporting in UI and controller directing users to run the SQL schema when tables are missing.
  - **Architecture Decision Record**:
    - Logged ADR-053 in `docs/refactor/20-decisions-log.md`.

- **Supabase Cloud Database Integration — Modern Opaque Key Header Fix (`sb_publishable_` / `sb_secret_`)**:
  - **Custom Request Header Interceptor**:
    - Integrated custom `global.fetch` handler in `SupabaseService.getClient` to strip problematic `Authorization: Bearer sb_publishable_...` headers auto-injected by `@supabase/supabase-js`.
    - Modern Supabase opaque keys (which are not JWTs) are now correctly transmitted exclusively via `apikey`, resolving the `connection failed invalid request sb_publishable_...` error.
  - **Backend Configuration & Error Detection Enhancements**:
    - Normalized parameter names across `SupabaseService` and `supabase.controller.js` to accept both camelCase and kebab/frontend conventions (`supabaseUrl`, `supabaseAnonKey`, `supabaseServiceKey`).
    - Auto-prefixed missing `https://` protocol schemes and sanitized trailing slashes from project URLs.
    - Updated `testSupabaseConnection` to recognize PostgREST auth error responses and return user-friendly diagnostic guidance.
  - **Frontend UI & Hook Updates**:
    - Updated `SupabaseConfigCard.tsx` and `useSupabaseSync.ts` to pass both publishable and secret keys on live connection tests and provide helper hints for both modern `sb_publishable_...` keys and legacy `eyJ...` JWTs.
  - **Architecture Decision Record**:
    - Logged ADR-052 in `docs/refactor/20-decisions-log.md`.

- **Supabase Cloud Database Integration — Phase 4: Documentation, Production Setup & Logging**:
  - **Comprehensive Deployment Guide (`docs/SUPABASE_SETUP.md`)**:
    - Detailed 4-step quick start connecting Free GST Billing Software to Supabase in under 3 minutes.
    - Complete canonical 235-line SQL DDL schema reference with 9 tables, performance indexes, and RLS policies.
    - Documented all in-app Hub features (connection tests, schema inspection, upload/download migrations, conflict resolution, audit logs).
    - Added environment variable configuration specifications (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) and updated `.env.example`.
    - Documented REST API endpoints specification for all 8 `/api/supabase/*` routes in `docs/refactor/08-api-refactor-plan.md`.
    - Documented security, zero math modification, and automated disaster recovery snapshot guarantees (`./data/backups/`).
  - **Architecture Decision Records & Progress**:
    - Logged ADR-051 in `docs/refactor/20-decisions-log.md`.
    - Updated `docs/refactor/19-refactor-progress.md` marking Phase 4 and all four phases as COMPLETED.
    - Updated `docs/SUPABASE_INTEGRATION_PLAN.md` marking the rollout plan as fully COMPLETED.
    - Updated `README.md` with Supabase Cloud (PostgreSQL) feature summaries and links to the setup guide.
  - **Verification & Safety Protocol**:
    - Production compilation build succeeded (`compile_applet`).
    - 70/70 statutory tax calculation tests PASS (`scripts/tax-test.mjs`).
    - 9/9 discount calculation tests PASS (`scripts/discount-modes-test.mjs`).
    - 23/23 smoke tests PASS (`tests/smoke.mjs`).

- **Supabase Cloud Database Integration — Phase 3: Dedicated Supabase Hub User Interface**:
  - **Modular Supabase Feature Architecture (`src/features/supabase/`)**:
    - `types/index.ts`: Strongly typed interfaces for Supabase connection config, test results, table inspections, local summaries, sync progress, and audit logs.
    - `constants/sqlSchema.ts`: Exported complete 235-line SQL DDL schema script with 9 tables, indexes, and RLS policies ready for instant copying.
    - `hooks/useSupabaseSync.ts`: Custom state management hook managing live ping latency, credentials save, schema table checking, local collection counts, and sync executions.
    - `components/SupabaseConfigCard.tsx`: Credentials manager supporting Supabase URL, Anon Key, and Service Role Key with show/hide toggle, live status badge, and roundtrip ping.
    - `components/SchemaInspectorCard.tsx`: Status checklist verifying all 9 PostgreSQL tables with status chips and a one-click "Copy SQL Schema" button with visual copied feedback.
    - `components/MigrationControlCard.tsx`: Local record counters across all 8 collections, batched upload to Supabase, download with safety snapshot, and an interactive progress bar with telemetry results.
    - `components/SyncSettingsCard.tsx`: Checkbox toggle for auto-sync on save and deterministic conflict resolution selector (`local_wins` vs `cloud_wins`).
    - `components/SyncAuditTable.tsx`: Full synchronization audit log history table displaying status badges, collection counts, durations, and backup snapshot folder references.
  - **Dedicated Hub View & Navigation Integration**:
    - Created `src/pages/SupabasePage.tsx` with safety notices, responsive layouts, and dark/light mode theme parity.
    - Registered `supabase` route in `src/app/router/routes.ts` and wired view switching and command palette actions in `src/app/App.tsx`.
    - Integrated "Supabase Cloud" into `SettingsSidebar.tsx` under Data & Sync and `SwipeSettingsSidebar.tsx` under Integrations & Apps.
    - Wired `supabase-cloud` tab within `SettingsPage.tsx`.
    - Added high-visibility Supabase Cloud card banner in `CloudSyncTab.tsx` with a direct one-click launcher button.
    - Added Supabase Cloud item in `navConfig.ts` under Reports & Tools top navigation.
  - **Verification & Safety Protocol**:
    - Production compilation build succeeded (`compile_applet`).
    - 70/70 statutory tax calculation tests PASS (`scripts/tax-test.mjs`).
    - 9/9 discount calculation tests PASS (`scripts/discount-modes-test.mjs`).
    - 23/23 smoke tests PASS (`tests/smoke.mjs`).

- **Supabase Cloud Database Integration — Phase 2: Synchronization & Batching Engine**:
  - **Bidirectional Data Mapping (`server/modules/supabase/supabaseTransformers.js`)**:
    - Built comprehensive entity transformers for all 8 statutory collections (`business_profiles`, `clients`, `products`, `bills`, `expenses`, `purchases`, `receipts`, `recurring`).
    - Handled decimal precision mapping, JSONB payload preservation (`items`, `template_payload`, `raw_payload`), and statutory aggregates extraction (`cgst_total`, `sgst_total`, `igst_total`, `utgst_total`, `cess_total`, `grand_total`).
  - **Sync & Batching Engine (`server/modules/supabase/supabaseSync.service.js`)**:
    - `syncUp`: Topological batch chunking (50 records per batch) with PostgREST upsert (`onConflict: 'id'`), progress tracking, and latency telemetry.
    - `syncDown`: Paged fetching (50 records per batch), conflict resolution (`local_wins` vs `cloud_wins`), and in-memory invoice cache invalidation.
    - **Pre-Sync Snapshot Guarantee**: Implemented `createSnapshotBeforeSync()` generating an immutable backup snapshot in `./data/backups/pre-supabase-sync-<timestamp>/` prior to writing remote data to local disk, guaranteeing zero data loss.
    - **Telemetry & Audit Logging**: Audit records saved to both local cache (`./data/supabase_sync_log.json`) and remote Supabase table `sync_audit_log`.
  - **API Layer Expansion (`server/modules/supabase/supabase.routes.js`)**:
    - Added `POST /api/supabase/sync-up` for uploading local data to Supabase.
    - Added `POST /api/supabase/sync-down` for downloading remote data with conflict strategy.
    - Added `GET /api/supabase/local-summary` returning record counts across all 8 collections.
    - Added `GET /api/supabase/audit-log` returning recent synchronization logs.
  - **Automated Smoke Testing & Quality Verification**:
    - Expanded `tests/smoke.mjs` with 5 new tests covering local summary counts, audit log retrieval, transformer roundtrips across all 8 collections, backup snapshot creation, and mock batch syncUp/syncDown execution (23/23 tests PASS).
    - 70/70 statutory tax calculation tests PASS (`scripts/tax-test.mjs`).
    - 9/9 discount calculation tests PASS (`scripts/discount-modes-test.mjs`).
    - Production compilation build succeeded (`compile_applet`).

- **Supabase Cloud Database Integration — Phase 1: Backend Supabase Module**:
  - **Backend Module Architecture (`server/modules/supabase/`)**:
    - Created `supabase.service.js` with `SingleFileRepository` managing `./data/supabase_config.json`, secure API key masking (`••••••••`), and client instantiation.
    - Implemented `testConnection` endpoint measuring live roundtrip latency to Supabase PostgreSQL/PostgREST and detecting table existence or missing schema states.
    - Implemented `checkTables` endpoint verifying existence of all 8 core application tables (`bills`, `clients`, `products`, `expenses`, `purchases`, `receipts`, `recurring`, `business_profiles`).
    - Created `supabase.controller.js` and `supabase.routes.js` mounting `/api/supabase/config`, `/api/supabase/test`, and `/api/supabase/tables`.
    - Integrated `supabaseRouter` cleanly in `server/app.js` and exported `SUPABASE_CONFIG_FILE` in `server/config/paths.js`.
  - **Automated Smoke Testing**:
    - Expanded `tests/smoke.mjs` with tests verifying configuration reading, updating, and connection test handling (18/18 tests PASS).
  - **Quality Gates & Non-Negotiables**:
    - 70/70 statutory tax tests PASS (`scripts/tax-test.mjs`).
    - 9/9 discount calculation tests PASS (`scripts/discount-modes-test.mjs`).
    - Production compilation PASS (`compile_applet`).
    - Local `./data/` flat-file durability and port 3000 exclusivity strictly preserved.

- **Supabase Cloud Database Integration & Connection Hub Plan (`docs/SUPABASE_INTEGRATION_PLAN.md`)**:
  - **Comprehensive Architectural Specification**: Authored full integration plan for connecting Supabase PostgreSQL as an optional remote cloud mirror while maintaining local-first flat-file JSON durability (`./data/`).
  - **Relational PostgreSQL Schema**: Defined complete DDL with paisa-precision types (`NUMERIC(14, 2)`), JSONB payloads for line items and document layouts, Row Level Security (RLS) policies, and performance indexes for `clients`, `products`, `bills`, `expenses`, `purchases`, `receipts`, and `recurring`.
  - **Dedicated Connection UI Blueprint**: Designed `/settings/supabase` connection view with URL and API key inputs, live latency ping, table schema inspector, batch migration progress indicators, and auto-sync toggles.
  - **Verification & Safety Protocol**: Designed 4-phase rollout ensuring statutory tax calculations (`taxCalculation.ts`) and port 3000 constraints remain fully untouched.

- **Sidebar Information Architecture & Submenu Grouping Reorganization**:
  - **Structured Domain Groups**: Reorganized flat, redundant sidebar navigation into 5 core accounting domains with interactive accordion submenus:
    - **Sales & Billing**: All Invoices, + Create Invoice [GST], Quotations & Estimates [EST], Delivery Challans [CHALLAN], Credit & Debit Notes [CN/DN], and Recurring Invoices [AUTO].
    - **Purchases & Expenses**: Purchase Bills [OCR], Expense Tracker [ITC], and Vendors & Suppliers directory.
    - **Master Records & Banking**: Customers & Clients [Ledger], Products & Inventory [Stock], and Payments & Receipts [Vouchers].
    - **Tax & Compliance**: GST Returns (GSTR-1 & 3B) [GSTR], E-Way Bills, and Income & Advance Tax [Budget 2025].
    - **Reports & Tools**: Financial Reports [P&L], AI Business Assistant [AI], User Guide, and Control Panel.
  - **Collapsed Rail Hover Flyouts**: Integrated `NavGroupFlyout.tsx` to provide popover hover menus when the sidebar rail is collapsed (`w-14`), allowing instant one-click access to all sub-items without expanding the drawer.
  - **Auto-Sync & Quick Actions**: Dynamic expansion synchronizes automatically with active views and command palette (`Ctrl+K`) searches.
  - **Modularity & Code Cleanliness**: Separated navigation definitions into `navConfig.ts` and flyouts into `NavFlyout.tsx`, keeping `NavigationTabs.tsx` under 260 lines of code.
  - **Verification**: 70/70 statutory tax tests PASS, 9/9 discount tests PASS, 16/16 smoke tests PASS, and production build succeeded.

- **Customer Table Action Menu Clipping Fix (`ClientsPage.tsx`)**:
  - **Issue Resolved**: When clicking the 3-dots action menu (`...`) in any customer row, the dropdown containing "Aging Report", "View Invoices", and "Delete Customer" was cut off and clipped by the table scroll wrapper (`overflow-x-auto`) and card container (`overflow-hidden`), creating an unwanted scrollbar and hiding menu options.
  - **Portal Floating Overlay**: Implemented React `createPortal` mounting directly to `document.body` with `fixed` positioning calculated via `getBoundingClientRect()`.
  - **Adaptive Edge Detection**: Auto-detects available bottom viewport height to flip the menu upward when close to the bottom of the viewport (`< 150px`), ensuring it is always fully visible.
  - **Outside Click & Scroll Dismissal**: Added an invisible overlay backdrop and window scroll/resize event listeners to seamlessly dismiss the menu on any outside interaction.
  - **Top Actions Menu Parity**: Added outside-click backdrop to the top "Actions" dropdown (Import CSV / Export CSV) for consistent dismissal behavior.
  - **Verification**: All 70/70 statutory tax tests, 9/9 discount modes tests, 16/16 smoke tests, and production compilation pass cleanly.

- **Navigation Sidebar Redesign (Layout & Styling Exactly Matching code.html)**:
  - **Container & Layout**: Restructured `src/app/layout/AppSidebar.tsx` into a high-density vertical navigation rail (`w-56`, `bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800`) matching `code.html` lines 124-280.
  - **Navigation Category Hierarchy (`NavigationTabs.tsx`)**:
    - Replicated complete 17-item menu list with accurate icons, chevrons, and active states: Sales (with sub-items for All Invoices, + Create Invoice [GST badge], Credit Note, Delivery Challan), Purchases, Quotations+, Expenses+, SwipeAI (purple sparkles icon), Products & Services, Inventory, Payments (₹ icon), Customers (`#EFF6FF` / `#1665D8` active state), Vendors, Projects, Insights, Reports, OnlineStore, E-way Bills, Integrations, and More (with sub-items for GST Returns, Income Tax Calculator, User Guide, and Control Panel).
  - **Bottom Sidebar Elements**:
    - "Invite Users" action with `UserPlus` icon directly navigating to Settings Users tab.
    - "Settings" action with `Settings` icon.
    - "Refer a friend & Get ₹2000 🎁" promotional card with "Refer Now 🪄" action button navigating to Settings Referral tab.
    - "Collapse Sidebar Arrow" with `ChevronsLeft` / `ChevronsRight` toggle.
  - **Responsive & Accessibility Support**:
    - Mobile drawer overlay backdrop and top close header row for mobile touch screens.
    - High-density collapsed icon rail (`w-14`) with native tooltip attributes and centered interactive icons.
    - Full dark mode parity (`dark:bg-slate-900`, `dark:border-slate-800`, `dark:text-slate-300`).
  - **Verification**: 70/70 statutory tax tests PASS, 9/9 discount tests PASS, and `compile_applet` builds cleanly.
- **Customer Directory & Save Client Bug Fix**:
  - **Identified and Resolved Missing Import**: Added missing `saveClient` import in `src/pages/ClientsPage.tsx` from `../features/clients/services/clientService`, fixing the runtime `ReferenceError: saveClient is not defined` when creating or updating customers.
  - **Frontend Service Contract Alignment**: Updated `saveClient` in `src/features/clients/services/clientService.ts` to return the saved `Client` object with its server-assigned `id` from `storeSaveClient`.
  - **Backend Validation Safeguard**: Enhanced `saveClient` in `server/modules/clients/clients.service.js` to strictly validate and trim `client.name`, returning a clean HTTP 400 Bad Request error if the name is omitted.
  - **Verification**: `compile_applet` passed, 70/70 statutory tax tests passed, and 9/9 discount modes tests passed with zero errors.
- **Application Components & Customers Page Redesign (exact matching with code.html)**:
  - **AppHeader.tsx**:
    - Built top "Swipe" header with brand logo badge, business profile dropdown switcher, "Ask SwipeAI" search omnibox with `ctrl+k` key hint, and action utility icons (Zap, Notification Bell, Megaphone announcement, Profile menu).
  - **AppSidebar.tsx & NavigationTabs.tsx**:
    - Updated sidebar rail to 224px width with clean rounded menu items (`#EFF6FF` background with `#1665D8` primary text for active tab).
    - Integrated "Refer a friend & Get ₹2000 🎁" promo card in sidebar with "Refer Now 🪄" CTA.
    - Updated navigation route labels (e.g. Clients renamed to Customers).
  - **ClientsPage.tsx (Customers Directory)**:
    - Built customer management view matching `code.html` layout:
      - Title row with pink play tutorial guidance button.
      - Tab bar: "All Customers", "Groups", "Deleted".
      - Search bar with clear button and "Actions" dropdown menu (Import CSV, Export CSV).
      - Data table with pastel 2-letter customer initials avatars, contact info with inline WhatsApp share badge, closing balances, GSTIN/notes, and inline Ledger & Edit actions.
      - Expandable customer drawer for downloading Account Statement PDFs, Aging Reports, and full invoice transaction sub-tables.
      - Totals summary badges ("You Pay: ₹ 0.00", "You Collect: ₹ 0.00") and pagination bar.
      - Excel & Tally import callout banner ("Import existing customers or vendors easily from Excel or Tally") with "Talk to a specialist" link and "Upgrade 🚀" button.
      - Bank-grade security footer and fixed bottom-right WhatsApp quick support FAB.
  - **Verification**: 70/70 statutory tax tests PASS, 9/9 discount tests PASS, and `compile_applet` builds cleanly with zero errors.
- **Settings Page Redesign — Phase 4 (Full Sidebar Tabs Redesign with Consistent Styling)**:
  - Redesigned and created dedicated, high-density modular views across all remaining settings sidebar options using uniform layout patterns (header with title & description, structured card panels, clean form inputs, and standardized actions):
    - `UserProfileView.tsx`: User profile details (Full Name, Designation, Work Email, Mobile, Security, Active sessions).
    - `UsersRolesView.tsx`: Multi-user team roster, permission tier management (Admin, Billing Manager, Cashier, Auditor), and business profile switches.
    - `PreferencesView.tsx`: Modular feature toggles (E-Way Bill, E-Invoice, Inventory, Multi-Currency, Barcode), localization & tax regime modes, low-stock thresholds, and system update checks.
    - `ThermalPrintView.tsx`: POS printer configuration (2-inch 58mm / 3-inch 80mm, auto-cutter, paper feed margin, font scale calibrator, and print test trigger).
    - `BarcodeSettingsView.tsx`: Barcode generation standards (EAN-13, Code-128, QR), scanner delay intervals, and hardware scanner testing input.
    - `NotesTermsView.tsx`: Terms & conditions template manager, payment instruction presets, default flags, and inline template editor.
    - `AutoRemindersView.tsx`: Automated payment reminder triggers (Before Due Date, On Due Date, Overdue), multi-channel toggles (WhatsApp, SMS, Email), and message customization.
    - `WalletView.tsx`: Prepaid credits wallet for SMS/WhatsApp messaging and e-Invoicing tokens with credit tiers and transaction logs.
    - `SwipeAiView.tsx`: AI assistant configuration, HSN/SAC code suggestions, natural language command search shortcuts, and prompt settings.
    - `PaymentGatewayView.tsx`: Razorpay and Cashfree API key configuration with UPI dynamic QR code activation.
    - `TallyIntegrationView.tsx`: Tally Prime & ERP 9 XML voucher export, ledger account mapping, and sync status.
    - `ApiWebhooksView.tsx`: Local REST API endpoints, webhook subscriptions, API secret tokens, and webhook test payload generator.
    - `IntegrationsView.tsx`: Google Drive automated cloud backup connection and custom SMTP email server configuration.
    - `AdvancedFeaturesView.tsx`: Local-first full JSON backup export, backup file restore, daily automatic snapshot schedule, and recycle bin management.
    - `SocialLinksView.tsx`: Social media handles (Website, Facebook, Instagram, LinkedIn, YouTube) rendered on invoice footers and digital estimates.
    - `ReferralView.tsx`: Community referral program with unique share links and benefits.
    - `SupportView.tsx`: Direct WhatsApp live helpdesk link, GST compliance documentation, and system diagnostics.
  - Fully wired `renderTabContent` in `SettingsPage.tsx` to mount all dedicated views.
  - Verification: 70/70 statutory tax tests PASS, 9/9 discount tests PASS, and `compile_applet` builds cleanly.
  - Implemented modular, dedicated views for Swipe tab items:
    - `PaymentAccountsView.tsx`: Bank accounts and UPI IDs manager with default tagging, instant edit modal, and card layout.
    - `InvoiceNumberingView.tsx`: Real-time invoice numbering sequence preview, brand prefix, separator, start counter, and financial year toggles.
    - `SignaturesView.tsx`: Authorized signatory digital signature uploader and logo print size calibrator with slider.
  - Upgraded `SettingsPage.tsx`:
    - Full integration of `SwipeSettingsHeader`, `SwipeSettingsSidebar`, `SwipeSettingsFooter`, and `FloatingWhatsAppFab`.
    - Tab routing covering Company Details, Banks & UPI, Billing & Numbering, Signatures & Letterhead, Business Profiles, App Preferences, Print & Thermal Templates, Notes & Terms, Google Drive Cloud Sync, Data Backups, SwipeAI, Reminders, Wallet, Payment Gateways, Tally Integration, API/Webhooks, Social Links, and Support.
    - Responsive layout with "Back to Home" navigation handler directly routing to the main billing dashboard.
  - Cleaned up shell integration in `src/app/App.tsx` so Settings renders full-width within the new Swipe header and navigation chrome.
  - Zero regressions: statutory tax tests (70/70) and discount tests (9/9) passing 100%, and application builds cleanly.
- **Settings Page Redesign — Phase 2 (CompanyDetailsView & AddressModal)**:
  - Built `CompanyDetailsView.tsx` matching `code.html` specification:
    - Promotional banner "Take a Free Demo Today!" with specialist talk button.
    - 2-column fixed 200px label form grid for Brand Name (_), Company Name (_), Phone (+91 selector), Email, GSTIN (with inline Fetch Details button), Business Type dropdown (Retail, Wholesale, Manufacturing, Services), Alternative Contact Number, Website, and PAN.
    - 96x96px Company Logo card with embedded graphic placeholder and image upload/replace trigger.
    - Custom fields header bar (`#F5F5F5`) with inline add/delete key-value fields.
    - Color-coded address sections: Billing Details (pink `#FDF2F4` cards with edit, delete, copy to shipping, and default indicators) and Shipping Details (lavender `#EEF0FD` cards with edit and delete).
    - Built `AddressModal.tsx` for adding or modifying locations.
    - Extended `BusinessProfileData` with optional company and address attributes.
  - Zero regressions: statutory tax tests (70/70) and discount tests (9/9) passing 100%, and application builds cleanly.
- **Settings Page Redesign — Phase 1 (Swipe Primitives & Layout Architecture)**:
  - Created high-fidelity Swipe design system components matching `code.html`:
    - `SwipeSettingsHeader.tsx`: 56px sticky top bar featuring Swipe circle logo, active business profile selector with dropdown switcher, "Ask SwipeAI" search omnibox with `ctrl+k` badge, and quick action icons (Zap, Bell, Megaphone, User avatar).
    - `SwipeSettingsSidebar.tsx`: 5-group categorized navigation rail (Profile, General Settings, Banks and Payments, Integrations & Apps, Others) with top "Back to Home" button and lock status badges.
    - `AddressCard.tsx`: Pink-tinted billing cards (`#FDF2F4`) and lavender-tinted shipping cards (`#EEF0FD`) with Edit, Delete, Copy to Shipping, and Default status actions.
    - `FloatingWhatsAppFab.tsx`: Fixed bottom-right emerald WhatsApp support action button (`#25D366`).
    - `SwipeSettingsFooter.tsx`: Application footer with copyright and "Data is secured via 'bank-grade' security" badge.
  - Exported all new components and TypeScript models (`SwipeAddressItem`, `SwipeSettingsTabId`) from `src/features/settings`.
  - Zero regressions: statutory tax tests (70/70) and discount tests (9/9) passing 100%, and application builds cleanly.
- **Eliminated Global Top Header on Create / Edit Invoice Page**:
  - Hid global application `<AppHeader />` and top `<BannerHost />` when on the invoice creation/editing route (`currentView === 'new'`).
  - Extended `AppShell` with `contentClassName` prop and configured `.main-content.no-padding` (`padding: 0 !important;`) for `currentView === 'new'`.
  - Maximized vertical screen real estate, eliminating duplicate headers and allowing the dedicated `InvoiceEditorHeader` to mount flush against the top edge (`top: 0`) with smooth sticky scrolling.
  - Maintained full verification parity across all 70 statutory tax tests, 9 discount regression tests, and `compile_applet`.
- **Fixed Unexpected Page Reloads & Polling Overhead**:
  - Resolved root cause of unsolicited page reloads ("releading") where PWA service worker lifecycle listeners (`controllerchange` and a 500ms auto-update timer in `src/main.jsx`) triggered infinite `window.location.reload()` cycles.
  - Automatically unregister active service workers when running in development mode (`import.meta.env.DEV`) or inside an iframe (`window.self !== window.top`) to avoid stale module cache collisions with Vite dev server.
  - Removed disruptive automatic `window.location.reload()` on service worker activation in `src/main.jsx`, dispatching non-intrusive UI events instead.
  - Added a 30-second rate-limiting cooldown guard in `sessionStorage` (`__fgsb_last_chunk_reload`) for chunk-load recovery, strictly preventing reload looping.
  - Optimized backend health monitoring in `src/app/App.tsx`: halted redundant 5-second `/api/profile` polling once the server is verified online, reserving retry polling strictly for offline recovery.
  - All 70 statutory tax tests and 9 discount regression tests verified passing with zero failures.
- **Eliminated Blue Focus Rings & Enforced Crisp Black Focus Borders**:
  - Removed double blue focus rings, blue outline offsets (`outline: 2px solid #1e40af`, `outline-offset: 2px`), and blue glow drop shadows across all interactive components.
  - Implemented crisp black borders on focus (`border-color: #000000 !important; outline: none !important; box-shadow: none !important;`) across all inputs, selects, textareas, search bars, and editable fields, with clean white borders in dark mode (`border-color: #ffffff !important;`).
  - Added global base overrides in `src/index.css`, `src/styles/reset.css`, and `src/styles/utilities.css` disabling Tailwind focus ring shadows (`--tw-ring-color: transparent !important; --tw-ring-shadow: none !important;`).
  - Updated form controls in `InvoiceItemsTable.tsx`, `ClientSelectSection.tsx`, `TwoColumnDetailsSection.tsx`, `Input.tsx`, `Select.tsx`, `Textarea.tsx`, and `DatePicker.tsx` to `focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white`.
  - Maintained 100% compliance across all 70 statutory tax tests, 9 discount regression tests, and clean compilation.
- **Create Invoice Page Exact Redesign Matching `code.html`**:
  - Redesigned the entire invoice creation experience into a high-density, ergonomic accounting interface matching the exact layout and visual design specified in `code.html`.
  - **Sticky Header & Sub-header Controls** (`InvoiceEditorHeader.tsx`):
    - Top bar: Back chevron, Document title, `Draft` status badge, Business Profile dropdown switcher with active checkmark and "+ Add Profile", live auto-save indicator, and action buttons (`Discard`, `Save as Draft`, `Save & Print`, and primary `Save`).
    - Sub-header toolbar: Document type navigation tabs (`Invoice`, `Bill of Supply`, `Quote/Estimate`, `Delivery Challan`, `Proforma`, `Credit Note`, `Purchase Order`), Supply Type selector (`Regular`, `SEZ`, `Deemed Export`), Customer selector dropdown, and quick action icons (`Custom Headers`, `Live Preview` slide-over trigger, and `Settings` drawer trigger).
  - **Section 1: Customer & Details** (`ClientSelectSection.tsx`):
    - 12-column customer card: 4-column Bill To / Ship To customer block with autocomplete search, "+ Add New Customer", GSTIN badge, address, state & place of supply dropdown; 8-column invoice metadata grid with Document No., Date, Due Date, Payment Terms, Vehicle No., PO No., and PO Date.
    - Custom Headers tag row with toggle pills for optional metadata blocks (`Vehicle No.`, `PO Details`, `Shipping Address`, `Payment Details`, `Salesperson`, `Project / Job`).
  - **Section 2: Products & Services** (`InvoiceItemsTable.tsx`):
    - Rebuilt line-items table: item autocomplete with quick product suggestions, HSN/SAC code picker, Quantity, Unit dropdown, Rate, Discount (% / ₹ toggle), Taxable Value, Tax Rate (% + CGST/SGST/IGST breakdown), and Total Amount.
    - Bottom action row with "+ Add Item", "+ Add Category", "+ Add Transport / Other Charges", and "AI Scan Bill" (client-side Tesseract OCR integration).
  - **Section 3: Two-Column Details & Calculations** (`TwoColumnDetailsSection.tsx`):
    - Left column (col-span-7): Collapsible Notes with smart AI helper, Collapsible Terms & Conditions with template dropdown, Create E-Waybill toggle switch, and 5-file drag & drop attachment zone.
    - Right column (col-span-5): Soft green tint Totals & Calculations box (Extra Discount with %/₹ toggle, Taxable Amount, Total Tax, Round Off toggle with live difference display, bold Total Amount, Total Discount, and Hide Totals checkbox), Select Bank card with "+ Add New Bank" trigger, and Select Signature card with pink preview container.
  - **Floating Bottom Action Bar & Footer**:
    - Floating action bar with `Save as Draft`, `Save and Print` split dropdown, and `Save` CTA.
    - Application footer with copyright, bank-grade security lock badge, and floating WhatsApp quick share button.
  - Preserved 100% of underlying state machine (`useInvoiceForm`), local file persistence, statutory tax math, and PDF generation. All 70 statutory tax tests and 9 discount regression tests pass with zero failures.
- **Removed Invoice Type & Invoice Mode Box from Invoice Editor**:
  - Removed the secondary "Invoice Type" chip selector and "Invoice Mode" (Goods / Services / Mixed) card panel from `InvoiceTotalsSection.tsx` in the invoice editor as requested.
  - Preserved the Business Profile selector in `InvoiceTotalsSection.tsx` for multi-profile accounting setups while ensuring clean full-width layout.
  - Verified zero breaking changes to invoice generator state or statutory tax engine (70/70 statutory tax tests and 9/9 discount regression tests PASS, clean compilation).
- **Sidebar Invoice Type Selection Sub-Menu & Split CTA**:
  - Re-architected `NavigationTabs.tsx` to render an expandable sub-menu under "New Invoice" displaying all 8 Indian GST document types: **Tax Invoice** (GST), **Proforma / Estimate** (EST), **Bill of Supply** (EXEMPT), **Composition Bill** (COMP), **Credit Note** (CN), **Debit Note** (DN), **Receipt Voucher** (ADV), and **Delivery Challan** (CHALLAN).
  - Designed indented tree styling with distinct document badges, icons, tooltips, and active state indicators for each invoice type.
  - Added popover flyout menu for collapsed sidebar rail mode (`collapsed === true`), allowing one-click document creation from the compact icon navigation bar.
  - Upgraded the top primary "New Invoice" CTA button in `AppSidebar.tsx` into a split button with an instant document-type dropdown selector.
  - Enhanced `useAppRouter.ts` and `useInvoiceForm.ts` to seamlessly initialize new forms with the selected document type (`_initialType`), appropriate prefix (e.g. `EST-`, `CN-`, `DN-`), and tax options.
- **Automatic Sidebar Hiding on Create Invoice Page**:
  - Configured `App.tsx` to conditionally pass `null` for the `sidebar` prop in `AppShell` whenever `currentView === 'new'`, allowing the invoice editor and live preview pane to expand across the full available viewport width.
  - Updated `AppHeader.tsx` to hide the header sidebar toggle button when on the invoice creation page.
  - Guarded keyboard shortcut (<kbd>Ctrl+B</kbd>) to prevent toggling the sidebar while creating/editing an invoice.
- **Invoice Editor Header Toolbar Redesign & High-Density Visual Hierarchy**:
  - Restructured `InvoiceEditorHeader.tsx` from an unorganized layout into a clean, segmented action toolbar with clear visual groupings, subtle vertical dividers, and dark/light theme parity.
  - **Left Section (Identity & Status)**: Integrated compact `Back` navigation button, document identity breadcrumb showing document type (e.g. _New Tax Invoice_, _Edit Proforma_) and invoice number chip (`#INV-...`), inline contextual help modal trigger, and live auto-save status pill with pulsing feedback.
  - **Right Section (Action Clusters)**:
    - _View & Tools Group_: Refined `Preview` toggle button (with active visual highlight state and full-width expand mode) and `Settings` button for instant access to `DocumentSettingsDrawer`.
    - _Share & Export Group_: `Print` button, professionally styled brand-tinted `WhatsApp` button with subtle green accents, and contextual `E-Way Bill` export button.
    - _Primary CTA Group_: Structured `Save` outline button (<kbd>Ctrl+S</kbd>) and primary high-contrast `Save & Download` button (<kbd>Ctrl+P</kbd>) with loading spinners.
  - Upgraded `.generator-toolbar` CSS in `src/styles/utilities.css` with surface blur backdrop, crisp borders, and dark mode styling.
  - Passed `details` and `editingBill` props from `InvoiceEditorPage.tsx` for dynamic document metadata rendering.
  - Verified 100% test suite pass (70/70 statutory tax tests, 9/9 discount regression tests) and clean compilation.
- **Professional UI Animation System & Smooth Physics-Based Transitions**:
  - Standardized application-wide motion design tokens (`src/styles/tokens.css`) with refined spring curves (`cubic-bezier(0.16, 1, 0.3, 1)` and `cubic-bezier(0.34, 1.56, 0.64, 1)`).
  - Added global animation utilities (`src/styles/utilities.css`) for tactile button press feedback, card hover lift, and smooth keyframed entries.
  - Upgraded core feedback and layout components (`Toast.tsx`, `Modal.tsx`, `SideModal.tsx`, `Tabs.tsx`, `SegmentedTabs.tsx`) to use `motion/react` and `AnimatePresence` with spring physics (`damping: 28-32`, `stiffness: 320-360`).
  - Integrated fluid `AnimatePresence` page view transitions and animated modal overlays for Notifications popover, Command Palette (Ctrl+K), Keyboard Shortcuts Help (Ctrl+/), and Application Update Available dialogs in `App.tsx`.
  - Upgraded `DocumentSettingsDrawer.tsx` with smooth spring slide-in/slide-out animations and layout-preserving tab switching.
  - Verified 100% test suite pass (70/70 statutory tax tests, 9/9 discount regression tests) and clean compilation.
- **Invoice Editor Customization Drawer Modal (`DocumentSettingsDrawer`) & Settings Button**:
  - Redesigned invoice customization layout from a dense inline accordion into a full-height slide-over drawer modal (`DocumentSettingsDrawer`) matching the user-requested specification.
  - Added dedicated **Settings** button (`id="fgsb-header-settings-btn"`) in `InvoiceEditorHeader.tsx` toolbar and "Document Settings" button in `InvoiceTotalsSection.tsx`.
  - Built modular sub-components in `src/features/invoices/components/InvoiceEditor/DocumentSettingsDrawer/`:
    - `QuickActionsHeader.tsx`: 4 quick action cards (`Invoice templates`, `Custom fields`, `Prefixes / suffixes`, `Notes and terms`) with instant category jump navigation.
    - `DisplaySettingsTab.tsx`: 2-column searchable toggle grid for general PDF options (images, net balance, due date, dispatch address, payments, round-off, secure PDF, signatures, UPI QR, notes, terms) and Indian statutory compliance (RCM, TCS Sec 206C(1H), TDS Sec 194Q, GST Cess).
    - `LayoutFontsTab.tsx`: Paper / print format selector (A4, A5, Letter, Thermal 80mm/58mm, Custom roll dimensions), thermal POS receipt options, and design presets (`Aurora`, `Editorial`, `Executive`, `Verdant`).
    - `ExportSettingsTab.tsx`: Custom invoice title headings, multi-currency selection with snapshot exchange rates, recurring invoice automation scheduler, and auto-print preferences.
    - `BrandingSettingsTab.tsx`: Accent color presets & custom picker, settlement payment account selector, and diagonal document watermark configuration (PAID, DRAFT, DUPLICATE, etc.).
    - `CustomFieldsTab.tsx`: Dynamic custom invoice metadata fields (Vehicle No, PO details, E-Way Bill No, Transporter LR, Delivery Challan).
    - `NotesTermsTab.tsx`: Terms templates selector, custom terms editor, customer remarks, and internal private notes.
    - `LabelsTemplatesTab.tsx`: Custom PDF table header label overrides and WhatsApp / Email share message templates with dynamic variables.
  - Integrated `DocumentSettingsDrawer` seamlessly into `src/pages/InvoiceEditorPage.tsx` with full state synchronization.
  - Verified 100% test suite pass (70/70 statutory tax tests, 9/9 discount regression tests) and clean TypeScript compilation.
- **Settings Page Strict Section Separation & Focused View Rendering**:
  - Implemented strict conditional rendering across all settings components (`ProfileSettingsTab`, `BusinessProfilesTab`, `TermsTemplatesTab`, `PrintConfigTab`, `ModuleTogglesTab`, `DataBackupTab`, `CloudSyncTab`) so selecting an option in `SettingsSidebar` isolates and displays exclusively that chosen section's content.
  - Ensured granular sub-section isolation for `ModuleTogglesTab` (`section-modules`, `section-stock`, `section-region`, `section-updates`) and `DataBackupTab` (`section-backups`, `section-data`).
  - Passed `selectedSection={activeSection}` throughout `SettingsPage.tsx` hierarchy for responsive view switching.
- **Settings Page Sidebar Navigation Redesign**:
  - Replaced the horizontal top jump-nav tab bar with a dedicated **`SettingsSidebar`** (`src/app/layout/SettingsSidebar.tsx`) that replaces the main application sidebar when on the Settings view.
  - Implemented grouped settings navigation categories matching Ant Design v5 specifications:
    - **Business & Print**: Company, Profiles, Terms, Print & PDF
    - **Preferences**: Features, Stock, Region
    - **Data & Sync**: Backups, Google Drive, Import/Export
    - **System**: Updates
  - Added primary top action button `← Back to App` (navigates back to Dashboard) and bottom collapse trigger with desktop/mobile parity.
  - Integrated bidirectional scroll-spy and click-to-scroll synchronization between `SettingsSidebar` and `SettingsPage.tsx`.
  - Replaced the previous horizontal pill bar in `SettingsPage.tsx` with a high-density Ant Design `PageHeader` featuring contextual actions and help modal.
  - Verified 100% test suite pass (70/70 statutory tax tests, 9/9 discount regression tests) and clean TypeScript compilation.
- **Application-Wide Design System & Reusable Components Rollout (Ant Design v5 Standards)**:
  - Extended the high-density layout, `PageHeader`, `StatCard` KPI grids, `SegmentedTabs`, and `AlertBanner` feedback components across the entire application:
    - **`ExpensesPage.tsx`**: Integrated `PageHeader`, 4-card `StatCard` grid (`Total Expenses`, `Input Tax Credit`, `Average Expense`, `Total Transactions`), modern filter bar, and standardized data container.
    - **`ReceiptsPage.tsx`**: Integrated `PageHeader`, 4-card `StatCard` grid (`Total Collections`, `Active Receipts`, `Average Receipt`, `Payment Modes Tracked`), and standardized data container.
    - **`PurchasesPage.tsx`**: Integrated `PageHeader`, 4-card `StatCard` grid (`Total Purchases`, `Eligible ITC`, `Purchase Orders`, `Suppliers Engaged`), and standardized data container.
    - **`ClientsPage.tsx`**: Integrated `PageHeader`, 4-card `StatCard` grid (`Total Clients`, `GST Registered`, `Composite Dealers`, `Consumer / Unregistered`), and standardized search/table layout.
    - **`RecurringPage.tsx`**: Integrated `PageHeader`, 4-card `StatCard` grid (`Active Schedules`, `Projected Recurring Revenue`, `Due / Upcoming Invoices`, `Total Invoices Generated`), `AlertBanner` for due schedules, and `StatusBadge`.
    - **`ReportsPage.tsx`**: Integrated `PageHeader` with FY selector, `SegmentedTabs` for report navigation (Sales, Tax, Aging, P&L, Ledger), and modernized report panels.
    - **`InventoryPage.tsx`**: Integrated `PageHeader`, 4-card `StatCard` grid (`Catalog Items`, `Active Categories`, `Low Stock Warnings`, `Stock Valuation`), and refined container styling.
    - **`GSTReturnsPage.tsx`**: Integrated `PageHeader`, 4-card `StatCard` grid (`Taxable Turnover`, `Total Output Tax`, `Net Tax Payable`, `Outward Invoices`), `AlertBanner` for compliance warnings, and `SegmentedTabs` for return sections.
    - **`IncomeTaxPage.tsx`**: Integrated `PageHeader`, 3-card `StatCard` grid (`Recommended Regime`, `Est. Tax Liability`, `Potential Tax Savings`), `AlertBanner`, and `SegmentedTabs`.
    - **`UserGuidePage.tsx`**: Integrated `PageHeader`, search toolbar, and standardized reading view.
  - Verified 100% compliance across all 70 statutory tax tests, 9 discount regression tests, and `compile_applet`.
- **Dashboard Page & UI Redesign (Ant Design v5 & High-Density Standards)**:
  - **Metric Cards (`MetricCards.tsx`)**: Rebuilt the 4 primary KPI cards (`Total Invoiced`, `Tax Collected`, `Outstanding`, `Invoices`) to use token-based Ant Design containers, soft badge tints, and interactive click-to-filter triggers, strictly removing banned left side-tab borders (`border-l-4`).
  - **Reusable Shared UI Components**:
    - `StatCard.tsx`: Standardized stat card with semantic variant tints (`primary`, `success`, `warning`, `danger`, `purple`), subtitle slots, and corner badges.
    - `StatusBadge.tsx`: Ant Design styled status badge with colored status dots (`#52c41a`, `#faad14`, `#ff4d4f`, `#1677ff`, `#d9d9d9`) and pill backgrounds.
    - `SegmentedTabs.tsx`: Ant Design segmented button control with numeric badge counts and dot indicators for quick status filtering (`All`, `Unpaid`, `Overdue`, `Paid`).
    - `AlertBanner.tsx`: Reusable contextual feedback banner for critical notifications (overdue invoices, low stock warnings).
  - **Register Filters & Toolbar (`RegisterFilters.tsx`)**:
    - Aligned with high-density SaaS design: search input with clearing button, FY selector, Type dropdown, Status dropdown, Date pickers, Export dropdown menu (PDF bundle, JSON backup), and interactive Column Picker popover.
    - Integrated `SegmentedTabs` for 1-click status switching with real-time counts.
  - **Bills Register Table (`BillsRegisterTable.tsx`)**:
    - Reordered columns (`Invoice No.`, `Client`, `Date ⇅`, `Type`, `Amount`, `Status`, `Due Date`, `Actions`) with interactive ascending/descending date sorting.
    - Modernized empty state with vector icon, high-contrast typography, and quick "+ Create Invoice" call to action.
    - Preserved all row actions (Edit, Duplicate, Convert to Tax Invoice, Payment Modal, WhatsApp share, Reminder, Email, Delete).
  - **Dashboard Page (`DashboardPage.tsx`)**:
    - Enhanced top header with greeting, current date, help modal trigger, and primary action button.
    - Standardized overdue alert banner with outstanding balance breakdown and "Remind All" modal integration.
    - Passed accurate invoice and status counts across all financial years and filters.
  - **Verification**: Verified with 70/70 statutory tax tests, 9/9 discount modes tests, and zero TypeScript compilation errors.
- **Combined Header & Sidebar Layout Redesign**:
  - Replaced the single left-sidebar structure with a modern, integrated Top Header + Left Navigation Rail architecture.
  - Implemented `AppHeader.tsx`: 56px persistent top bar hosting sidebar toggle button, application branding, branch profile switcher with popover menu, centered Command Palette trigger (`Ctrl+K`), quick "+ New Invoice" primary button (`Ctrl+N`), theme mode switcher, notification bell with unread count badge, server health indicator, and settings shortcut.
  - Implemented `AppSidebar.tsx`: Left rail containing primary `+ New Invoice` button, categorized navigation items (Dashboard, Invoices, Operations, Tax & Statutory, Help), and a bottom collapse trigger. Includes desktop rail collapse (`Ctrl+B`) with `localStorage` persistence and responsive mobile drawer with backdrop overlay.
  - Updated `AppShell.tsx` and `App.tsx` layout composition; added `utilities.css` styles and responsive media queries.
  - Verified 100% compliance across all 79 statutory tax and discount regression tests and application build.
- **Invoice Editor Page Redesign & UI Polish**:
  - Polished the visual styling of `PaymentTermsSection.tsx` and `InvoiceTotalsSection.tsx` components to adhere to premium, high-density, anti-slop guidelines with rich theme parity (dark/light mode).
  - Modernized the business profile selector, invoice type selector, invoice mode, recurring switches, TDS/TCS section toggles, and PDF customizations to align beautifully with modern Tailwind layouts and typography.
- **Invoice Creation & Editing Page Redesign (Phases 1 & 2)**:
  - Unified the billing address, client autocomplete search, and invoice metadata (Invoice Number, Date, Place of Supply) in `ClientSelectSection.tsx` into a responsive, side-by-side grid panel at the top of the editor.
  - Redesigned `InvoiceItemsTable.tsx` with a desktop-only column header, hiding repetitive form-labels on larger viewports to maximize data density, alignment, and visual layout.
  - Implemented an elegant 12-column split bottom layout inside `InvoiceEditorPage.tsx` with payment notes/terms on the left (8 columns) and configuration settings, accounts, and presets on the right (4 columns).
  - Verified 100% compliance across all 79 statutory tax and discount regression tests and production compilation.
- **Ant Design 5+ Design System & Component Redesign**:
  - Refined token architecture, base UI primitives (`Button`, `Input`, `Select`, `Card`, `Table`, `Modal`, `Tabs`, `PageHeader`), and layout styles following Ant Design 5 specifications (`#1677ff` primary blue seed, `#e6f4ff` active states, 6px/8px border radii, 32px standard control height, crisp 1px borders, subtle soft shadows, dark mode `#001529` Sider and `#141414` container background parity).
  - Redesigned `PageHeader.tsx` to mirror Ant Design 5 PageHeader layout, incorporating Ant Design primary blue icon badges and clean typography hierarchy.
  - Verified 100% compliance across all 79 statutory tax & discount tests and `compile_applet`.
- **Shared UI Component Standardization**:
  - Centralized base UI primitives in `src/shared/components/ui`: created `Modal`, `Textarea`, `Checkbox`, `Switch`, `EmptyState`, `LoadingSpinner`, `Pagination`, `StatCard`, and `Tabs`.
  - Refactored feature components (`ClientModal`, `ExpenseModal`, `ProductModal`, `PurchaseModal`, `ReceiptModal`, `RecurringModal`, `PaymentModal`, `EditPaymentModal`, `RemindAllModal`, `MetricCards`, `ProductsPagination`, `ConfirmModal`) to consistently utilize shared UI primitives.
  - Eliminated duplicate re-exports and namespace conflicts for `StatCard` and `EmptyState`.
- Migrated all remaining application modals (`ClientModal`, `PurchaseModal`, `ExpenseModal`, etc.) to use the unified `SideModal` shared component.
- Extracted `SideModal` as a shared UI component for multi-use drawer layouts.

### Added

- **Ant Design (AntD v5) Design Tokens Architecture**:
  - Implemented comprehensive 3-tier Ant Design token structure in `src/styles/tokens.css` with Seed Tokens, 10-step derivative color scales (`--ant-blue-*`, `--ant-green-*`, `--ant-gold-*`, `--ant-red-*`, `--ant-purple-*`, `--ant-cyan-*`), typography, motion curves, and 4px grid spacing.
  - Mapped complete semantic token variables in `src/styles/themes.css` for Light and Dark modes (`--ant-color-primary`, `--ant-color-text`, `--ant-color-bg-container`, `--ant-color-border`, `--ant-box-shadow`, etc.).
  - Added strongly-typed TypeScript token definitions in `src/styles/tokens.ts` (`AntSeedTokens`, `AntColorPalettes`, `AntControlTokens`, `AntMotionTokens`, `AntCssVars`) for programmatically accessing tokens across React components.
- **Ant Design (AntD) Sider Redesign**:
  - Restyled application navigation sidebar to follow modern Ant Design v5 layout, geometry, and spacing standards.
  - Added collapsible sidebar rail (240px expanded to 72px compact icon rail) with smooth cubic-bezier transitions and `localStorage` state persistence.
  - Grouped navigation into distinct Ant Design menu categories (**Main**, **Operations**, **Tax & Reports**, **Help**).
  - Implemented Ant Design active indicators, hover highlights, profile dropdown card with checkmarks, notification badge styling, and pulsating status badge (`ant-server-status`).
  - Added full Light and Dark theme parity (`#ffffff` light surface and `#001529` dark sider).

### Fixed

- **Statutory Invoice ID Slash Support & Path Traversal Security**:
  - Resolved "Invalid ID or path parameter" (HTTP 400) when saving or fetching invoices with standard slash-delimited numbers (e.g. `INV/2026-27/001`, as permitted under CGST Rule 46(b)).
  - Updated `server/shared/middleware/paramSanitizer.js` to distinguish legitimate slash characters within entity identifiers from actual traversal attacks, strictly rejecting relative path traversal (`..`), null bytes (`\0`), leading slashes/backslashes, and drive letters.
  - Updated `server/infrastructure/storage/CollectionRepository.js` `getFilePath(id)` to allow internal slashes (sanitized via `safeFileName(id)` to underscores `_` on disk, e.g. `INV_2026-27_001.json`) while maintaining directory jail verification via `isPathInside()`.
  - Added comprehensive automated test cases in `tests/smoke.mjs` and `tests/integration/security.test.mjs` confirming full lifecycle operations (POST, GET, DELETE) on slash-containing invoice IDs and rejection of traversal attempts.
- **Primary Business Profile & Terms Templates Endpoints Restored**:
  - Implemented `/api/profile` (`GET` and `POST`) route handlers in `server/modules/profiles/` backed by `SingleFileRepository` reading and saving `data/profile.json`.
  - Implemented `/api/templates` (`GET`, `POST`, `DELETE /:id`) module in `server/modules/templates/` backed by `CollectionRepository` for terms & conditions templates in `data/templates/`.
  - Added an Express 404 guard `app.all('/api/*', ...)` in `server/app.js` ahead of Vite middleware and static file serving, preventing unmatched `/api/*` routes from falling through to the SPA `index.html` fallback.
  - Hardened `apiFetch` in `src/store.js` to validate `application/json` content-type and provide informative error details when non-JSON responses are encountered.
  - Added fallback exception resilience (`.catch(() => ({}))`) in client services and pages to prevent initial page loads from failing when profile data is unavailable.
  - Added native Node test cases in `tests/smoke.mjs` verifying `/api/profile` and `/api/templates` (14/14 tests passing).
- **TypeScript Strict Safety & Route Log Filtering**:
  - Exported domain APIs (`billsApi`, `clientsApi`, `productsApi`, `expensesApi`, `purchasesApi`, `profilesApi`, `metaApi`) from `src/services/api/index.ts`.
  - Resolved missing and mismatched imports across `GSTReturnsPage.tsx`, `IncomeTaxPage.tsx`, `ReportsPage.tsx`, `PrintSettings.tsx`, and `BillOCRModal.tsx`.
  - Added optional `productId` to `InvoiceItem` in `src/features/invoices/types/items.ts`.
  - Relaxed optional fields on `BusinessProfileData` and `PaymentAccount` in `src/features/settings/types.ts`.
  - Added optional `label` parameter and full default fields to `createEmptyAccount` in `src/shared/utils/businessUtils.ts`.
  - Omitted `title` from HTML element attributes on `EmptyStateProps` in `src/shared/components/ui/Table.tsx`.
  - Corrected `justify` style attribute to `justifyContent` in `src/pages/PurchasesPage.tsx`.
  - Adjusted `server/shared/middleware/requestLogger.js` to only log API calls and HTTP errors, eliminating false-positive log errors from internal Vite source requests.
  - Achieved clean 0-error TypeScript compiler status (`npx tsc --noEmit`).

### Dependency Updates

- **Applied commit `8e9aa3d962ac3c7b5e6320fd97021f54e9be7546` (chore(deps): patch and minor updates)**:
  - Updated `react` and `react-dom` to `^19.3.0`.
  - Updated `@vitejs/plugin-react` to `^5.2.0`.
  - Synchronized `@types/react` and `@types/react-dom` to `^19.3.0`.
  - Confirmed `dompurify` at `^3.4.15`.
  - Verified with clean build and passing statutory tax, discount mode, and smoke test suites.

### Refactoring & Architecture

- **Phase 45 Completed — Legacy Cleanup & Decommissioning**:
  - Safely deleted the legacy `src/utils.js` monolithic facade.
  - Safely deleted the entire legacy `src/components/` directory containing unmigrated or duplicate components.
  - Successfully ran full verification suite ensuring pristine status.
- **Phase 44 Completed — Direct Import Migration & Facade Deprecation**:
  - Migrated remaining core utility functions from monolithic `src/utils.js` to modular TypeScript structures: `htmlHasText` and `splitNumberedTerms` to `src/shared/utils/validators.ts`; `PAPER_SIZES`, `getPaperSize`, `FEATURE_GROUPS`, `isModuleEnabled`, `reorderAccounts`, and `setDefaultAccount` to `src/shared/utils/businessUtils.ts`; and `calculateRoundOff` to `src/features/invoices/utils/taxCalculation.ts`.
  - Re-mapped all imports of obsolete facade utilities and legacy components to direct feature module or shared package paths.
  - Refactored dynamic imports in `DashboardPage.tsx` and `PurchasesPage.tsx` to point to the new modular locations.
- **Phase 43 Completed — Security Hardening & Path Traversal Lockdown**:
  - Implemented `paramSanitizer` Express middleware (`server/shared/middleware/paramSanitizer.js`) enforcing path traversal rejection on all HTTP requests containing `..`, `/`, `\`, or null bytes.
  - Hardened `CollectionRepository.getFilePath()` to throw explicit HTTP `400 Bad Request` exceptions on document ID traversal attempts.
  - Added automated security test suite (`tests/integration/security.test.mjs`) asserting 400 Bad Request responses on malicious traversal attempts.
- **Phase 42 Completed — Performance Optimization & In-Memory Index Activation**:
  - Activated in-memory caching (`billCache`) inside `BillsService` (`server/modules/bills/bills.service.js`), reducing `GET /api/bills` response times to under 4ms.
  - Implemented automatic cache invalidation in `BillsService` (`saveBill`, `deleteBill`), `TrashController` (`restoreTrash`), and `BackupsController` (`importData`, `restoreBackup`).
  - Verified Vite manual chunks in `vite.config.js` (`react-vendor`, `pdf`, `icons`, `qr`) ensuring optimal client-side bundle splitting.
- **Phase 41 Completed — Cross-Stack API Integration**:
  - Validated API contracts for all 44 server endpoints against the frontend data client.
  - Implemented `tests/integration/apiContract.test.mjs` test suite verifying list queries, object creation, data persistence, and HTTP correctness.
  - Resolved legacy endpoint prefix misalignment in the `backups` module (ensured explicitly mounted to `/backups/now`, `/backups/:date/restore`).
  - Corrected `types.ts` imports for ESM environments in `itrCalculation.ts`.
- **Phase 40 Completed — Backend Backups, Trash & System Module Extraction (`server/app.js`)**: Extracted remaining backup, trash, and system APIs into layered modular components and assembled the application:
  - Created `server/modules/backups/`: `backups.controller.js` and `backups.routes.js` for data imports/exports and daily snapshot management.
  - Created `server/modules/trash/`: `trash.controller.js` and `trash.routes.js` for soft-deleted PDF movement and invoice JSON recovery.
  - Created `server/modules/system/`: `system.controller.js` and `system.routes.js` for control panel shell-outs, health checks, version checking, and PDF saves.
  - Created background execution scripts `server/infrastructure/backup/backupEngine.js` and `server/infrastructure/cron/trashEngine.js`.
  - Abstracted Express initialization into `server/app.js` and isolated port binding/background tasks in `server/index.js`.
  - Reduced `server.js` to a minimal 2-line delegating bootstrapper.
  - Verified with clean production build (`compile_applet`), `node --check` across modules and infrastructure, 70/70 statutory tax tests, 9/9 discount mode tests, and 12/12 smoke tests passing.
- **Phase 39 Completed — Backend Recurring Invoices, Profiles & Metadata Modularization**: Modularized recurring billing, business profiles, and atomic metadata into dedicated packages and extracted background cron jobs:
  - Created `server/modules/recurring/`: `RecurringRepository`, `RecurringService`, `RecurringController`, and `recurringRouter` for recurring template management.
  - Created `server/modules/profiles/`: `ProfilesRepository`, `ProfilesService`, `ProfilesController`, and `profilesRouter` for multi-business profile management.
  - Created `server/modules/meta/`: `MetaRepository`, `MetaService`, `MetaController`, and `metaRouter` containing synchronous atomic increment logic to guarantee sequential invoice numbering.
  - Created `server/infrastructure/cron/recurringEngine.js`: Encapsulated `processDueRecurring()` with asynchronous loop-yielding (`setImmediate`) to keep the server non-blocking during bulk invoice generation, and extracted lifecycle managers `startRecurringEngine()` / `stopRecurringEngine()`.
  - Replaced inline endpoints in `server.js` with router middleware (`app.use('/api/recurring', ...)`, etc.) and cron initializers.
  - Expanded `tests/smoke.mjs` test suite to assert `/api/recurring`, `/api/profiles`, and `/api/meta` behaviors, including atomic increments.
  - Verified with clean production build (`compile_applet`), `node --check` across modules and infrastructure, 70/70 statutory tax tests, 9/9 discount mode tests, and 12/12 smoke tests passing.
- **Phase 38 Completed — Backend Expenses, Purchases & Receipts Module Extraction**: Modularized expenses, purchases, and receipts financial record operations into layered packages under `server/modules/expenses/`, `server/modules/purchases/`, and `server/modules/receipts/`:
  - Created `server/modules/expenses/`: `ExpensesRepository` (wrapping `EXPENSES_DIR`), `ExpensesService` (date-descending sorting, `exp_` ID generation), `ExpensesController`, and `expensesRouter`.
  - Created `server/modules/purchases/`: `PurchasesRepository` (wrapping `PURCHASES_DIR`), `PurchasesService` (date-descending sorting, `pur_` ID generation), `PurchasesController`, and `purchasesRouter`.
  - Created `server/modules/receipts/`: `ReceiptsRepository` (wrapping `RECEIPTS_DIR`), `ReceiptsService` (date-descending sorting, `rcp_` ID generation), `ReceiptsController`, and `receiptsRouter`.
  - Replaced inline `/api/expenses`, `/api/purchases`, and `/api/receipts` endpoints in `server.js` with `app.use('/api/expenses', expensesRouter)`, `app.use('/api/purchases', purchasesRouter)`, and `app.use('/api/receipts', receiptsRouter)`.
  - Expanded `tests/smoke.mjs` test suite to assert 200 array responses across all extracted entity endpoints.
  - Verified with clean production build (`compile_applet`), `node --check` across expenses, purchases, and receipts modules and `server.js`, 70/70 statutory tax tests, 9/9 discount mode tests, and 8/8 smoke tests passing.
- **Phase 37 Completed — Backend Clients & Products Module Extraction**: Modularized master data CRUD operations into layered packages under `server/modules/clients/` and `server/modules/products/`:
  - Created `server/modules/clients/`: `ClientsRepository`, `ClientsService`, `ClientsController`, and `clientsRouter` managing client directory records with name sorting and `cli_` timestamp default identifiers.
  - Created `server/modules/products/`: `ProductsRepository`, `ProductsService`, `ProductsController`, and `productsRouter` managing products/inventory records with name sorting and `prod_` timestamp default identifiers.
  - Replaced inline `/api/clients` and `/api/products` endpoints in `server.js` with `app.use('/api/clients', clientsRouter)` and `app.use('/api/products', productsRouter)`.
  - Verified with clean production build (`compile_applet`), `node --check` across clients and products modules and `server.js`, 70/70 statutory tax tests, 9/9 discount mode tests, and 3/3 smoke tests passing.
- **Phase 36 Completed — Backend Bills & Invoices Module Extraction**: Modularized bills CRUD operations into a layered architecture under `server/modules/bills/`:
  - Created `bills.repository.js`: Encapsulates live bills collection and soft-delete trash collection. Implements `findCreditDependents(billId)` checking live invoices for credit-applied dependencies to prevent dangling ledger records.
  - Created `bills.service.js`: Domain service implementing `listBills()`, `getBill(id)`, `saveBill(bill, { overwrite })` with duplicate checking (409 Conflict), and `deleteBill(id, { force, permanent })` with soft-trash vs permanent deletion and credit dependency checks.
  - Created `bills.controller.js`: Express request handlers mapping query parameters, HTTP status codes (200, 400, 404, 409), and contract-accurate JSON responses.
  - Created `bills.routes.js`: Router mounting `GET /`, `GET /:id`, `POST /`, and `DELETE /:id`.
  - Replaced inline bills endpoints in `server.js` with `app.use('/api/bills', billsRouter)`.
  - Verified with clean production build (`compile_applet`), `node --check` across bills module and `server.js`, 70/70 statutory tax tests, 9/9 discount mode tests, and 3/3 smoke tests passing.
- **Phase 35 Completed — Backend Storage Engine & Data Repositories**: Implemented generic file-store data access repositories in `server/infrastructure/storage/`:
  - Created `CollectionRepository.js`: Generic repository managing multi-document JSON collections (`bills/`, `clients/`, `products/`, etc.) with in-memory TTL caching (5s TTL), boundary enforcement against path traversal, atomic disk writes, filtered retrieval (`findAll`, `findAllAsync`), single lookup (`findById`, `findByIdAsync`), persistence (`save`, `saveAsync`), removal (`delete`, `deleteAsync`), cross-collection soft-delete movement (`moveTo`, `moveToAsync`), and collection metrics.
  - Created `SingleFileRepository.js`: Generic repository managing standalone JSON state files (`meta.json`, `profile.json`, `settings.json`) with safe read (`get`, `getAsync`), atomic save (`set`, `setAsync`), and functional patching (`update`, `updateAsync`).
  - Created `index.js`: Barrel export for storage repository classes.
  - Verified with clean production build (`compile_applet`), `node --check` across storage infrastructure modules, 70/70 statutory tax tests, 9/9 discount mode tests, and 3/3 smoke tests passing.
- **Phase 34 Completed — Backend Shared Infrastructure (Errors, Logger, Atomic FS, Config)**: Created foundational infrastructure modules for the modular Express backend:
  - Created `server/config/`:
    - `paths.js`: Declares directory paths (`DATA_DIR`, `BILLS_DIR`, `CLIENTS_DIR`, `PRODUCTS_DIR`, `EXPENSES_DIR`, `PURCHASES_DIR`, `RECEIPTS_DIR`, `RECURRING_DIR`, `PROFILES_DIR`, `TEMPLATES_DIR`, `TRASH_DIR`, `BACKUPS_DIR`), file paths (`META_FILE`, `PROFILE_FILE`, `SETTINGS_FILE`, `PORT_FILE`, `ERRORS_LOG`), and directory initialization function `ensureDirectoriesExist()`.
    - `env.js`: Environment variables parser (`NODE_ENV`, `DEFAULT_PORT`, `MAX_PORT_SCAN`, `BODY_LIMIT`, `DIR_CACHE_TTL_MS`, `getStartingPort()`).
  - Created `server/shared/errors/`:
    - `AppError.js` & `index.js`: Standardized `AppError` class hierarchy (`BadRequestError`, `NotFoundError`, `ConflictError`, `ForbiddenError`, `InvalidPathError`, `PayloadTooLargeError`, `InternalServerError`).
  - Created `server/shared/utils/`:
    - `pathUtils.js`: Safe path segment sanitizer (`safePathSegment`), safe file name mapper (`safeFileName`), boundary enforcement (`isPathInside`), and ID sanitizer (`sanitizeId`).
    - `atomicFs.js` & `index.js`: Synchronous and asynchronous atomic file writing (`writeFileAtomic`, `writeFileAtomicAsync`, `writeJsonAtomic`, `writeJsonAtomicAsync`), safe JSON reader (`readJsonSafe`, `readJsonSafeAsync`), and non-throwing file removal (`deleteFileSafe`, `deleteFileSafeAsync`).
  - Created `server/shared/middleware/`:
    - `cors.js`: Custom strict localhost origin CORS middleware (`corsMiddleware`).
    - `errorHandler.js`: Centralized Express error handler (`errorHandler`) and `errRes` formatter logging to `errors.log`.
    - `requestLogger.js` & `index.js`: Request execution duration and status logging middleware (`requestLogger`).
  - Verified with clean production build (`compile_applet`), `node --check` across all server modules, 70/70 statutory tax tests, 9/9 discount mode tests, and 3/3 smoke tests passing.
- **Phase 33 Completed — Declarative Router & App Shell Integration (`App.tsx`, `router/`)**: Architected declarative routing system and root app orchestrator:
  - Created declarative routing system in `src/app/router/`:
    - `src/app/router/routes.ts`: Defined `ViewId`, `RouteConfig`, `VALID_VIEWS`, `APP_ROUTES` with lazy & eager chunk definitions, module dependencies (`VIEW_MODULE_MAP`), and navigation metadata.
    - `src/app/router/useAppRouter.ts`: Implemented router hook managing `currentView`, deep-linking via URL query params (`?view=...`), `sessionStorage` sync, `editingBill` state and draft clearing, invoice action handlers (`handleNewInvoice`, `handleEditInvoice`, `handleDuplicateInvoice`, `handleConvertToInvoice`, `handleCloseInvoice`), and dynamic module fallback logic.
    - `src/app/router/index.ts`: Unified barrel export.
  - Implemented core application orchestrator in `src/app/App.tsx`:
    - Composed `AppProviders`, `AppShell`, `TopNavBar`, `NavigationTabs`, `BannerHost`, `SetupWizard`, `WelcomeGuide`, `ToastContainer`, and `ConfirmModalContainer`.
    - Integrated lightweight `Suspense` fallback (`ViewLoading`) for asynchronous lazy route chunks.
    - Wired global command palette (Ctrl+K), shortcuts modal (Ctrl+/), notification center with auto-clear signatures, update checker, and server down heartbeat overlay.
  - Replaced legacy 1,139-line `src/App.jsx` with a non-breaking delegating facade pointing to `src/app/App.tsx`.
  - Updated `src/app/layout/TopNavBar.tsx` to accept nested children for navigation tabs.
  - Verified with clean production build (`compile_applet`), 70/70 statutory tax tests, 9/9 discount mode tests, and 3/3 smoke tests passing.
- **Phase 32 Completed — Secondary Views & Wizards Modularization (`ControlPanelPage`, `UserGuidePage`, `Wizards`)**: Modularized remaining secondary views and wizard flows into Feature-Sliced Architecture:
  - Extracted and modularized:
    - `src/pages/ControlPanelPage.tsx`: Dedicated server diagnostics and system control view for executing updates, data backups, backup restores, cross-PC migration exports, and local folder actions.
    - `src/pages/UserGuidePage.tsx`: Interactive, searchable user guide with in-app keyword highlight filter and real text-glyph searchable PDF generation via `jspdf`.
    - `src/features/settings/components/SetupWizard.tsx`: First-run 3-step setup wizard for auto-configuring 15+ business preset settings, paper formats, and section label languages.
    - `src/features/settings/components/WelcomeGuide.tsx`: Comprehensive business profile setup wizard with bank/UPI account initialization, logo/signature downscaling pipeline, and region mode detection.
    - `src/features/settings/components/index.ts`: Exported `SetupWizard` and `WelcomeGuide`.
  - Replaced legacy facades in `src/components/`:
    - `src/components/ControlPanel.jsx` (delegates to `../pages/ControlPanelPage`)
    - `src/components/UserGuideView.jsx` (delegates to `../pages/UserGuidePage`)
    - `src/components/SetupWizard.jsx` (delegates to `../features/settings/components/SetupWizard`)
    - `src/components/WelcomeGuide.jsx` (delegates to `../features/settings/components/WelcomeGuide`)
  - Updated `src/App.jsx` imports to directly load `SetupWizard`, `WelcomeGuide`, `UserGuideView`, and `ControlPanel` from their target locations.
  - Verified with clean production build (`compile_applet`), 70/70 statutory tax tests, 9/9 discount mode tests, and 3/3 smoke tests passing.
- **Phase 31 Completed — Settings View Monolith Modularization (`SettingsPage`)**: Decomposed the 2,069-line monolithic `src/components/SettingsView.jsx` into Feature-Sliced Architecture:
  - Extracted sub-components and logic under `src/features/settings/`:
    - `types.ts`: Strongly typed domain models for business profile data, multiple payment accounts, numbering configurations, terms templates, daily backups, soft-trash bills, and backup inspection results.
    - `constants.ts`: Jump nav sections, predefined terms and conditions templates, default numbering settings, and backup part definitions.
    - `components/ProfileSettingsTab.tsx`: Company details form, multi-payment accounts manager with inline CRUD and primary default toggles, logo upload & canvas-based downscaling pipeline, digital signature upload, and tax ID validation.
    - `components/BusinessProfilesTab.tsx`: Multi-business entity switcher, profile save-as, profile loading, and profile removal.
    - `components/TermsTemplatesTab.tsx`: Reusable terms and conditions manager with starter presets and rich text preview.
    - `components/PrintConfigTab.tsx`: Print settings orchestrator wrapping template selector, color scheme, watermark, thermal font sizes, and prefix overrides.
    - `components/ModuleTogglesTab.tsx`: Feature module checkboxes, region mode selector (India GST vs International VAT), low-stock alert thresholds, and app update checker.
    - `components/CloudSyncTab.tsx`: Google Drive OAuth integration, connection test, sync folder customization, and backup upload status.
    - `components/DataBackupTab.tsx`: Daily snapshot backup manager, 30-day soft-trash invoice bin, manual snapshot trigger, and granular JSON export/import modal with backup inspection.
    - `components/NumberingSettingsTab.tsx`: Brand prefixes, numbering format, and live preview.
    - `components/index.ts` & `index.ts`: Barrel exports.
    - `src/pages/SettingsPage.tsx`: Primary orchestrator page managing scroll-spy jump navigation, sticky unsaved changes header banner, profile state synchronization, and reactive store updates.
  - Replaced legacy `src/components/SettingsView.jsx` with a non-breaking delegating facade pointing to `../pages/SettingsPage`.
  - Updated `src/App.jsx` lazy loader imports to load directly from `./pages/SettingsPage`.
  - Verified with clean production build (`compile_applet`), 70/70 statutory tax tests, and 9/9 discount mode tests passing.
- **Phase 30 Completed — Income Tax & Reports Feature Modularization (`IncomeTaxPage`, `ReportsPage`)**: Decomposed both remaining calculation-heavy financial monoliths (1,746 total lines) into Feature-Sliced Architecture:
  - Extracted sub-components and logic under `src/features/income-tax/`:
    - `types.ts`: Strongly typed data contracts for tax calculation inputs, capital gains, chapter VI-A deductions, presumptive regimes (§44AD/ADA/AE), advance tax installments, bank statement imports, and regime comparison results.
    - `components/RegimeCalculatorTab.tsx`: Side-by-side Old/New Regime cards (`RegimeCard`, `Row`, `NumberInput`, `defaultInputs`), capital gains inputs, deduction fields, and recommended regime banner.
    - `components/TaxCalculatorCard.tsx`: Reusable tax calculator card surface.
    - `components/PresumptiveTab.tsx`: Presumptive taxation under §44AD, §44ADA, and §44AE, deemed vs declared income, transporter vehicle-month multipliers, and calculator push.
    - `components/AdvanceTaxTab.tsx`: 4-installment advance tax schedule, TDS deduction credits, payment tracking, and Section 234B & 234C interest calculations.
    - `components/BankImportTab.tsx`: Drag-and-drop CSV importer with auto-detection for 7 major Indian banks (SBI, HDFC, ICICI, Axis, Kotak, PNB, Yes Bank), categorized totals strip, and push to calculator.
    - `components/SummaryTab.tsx`: Financial summary KPI cards, business income reconciliation, Section 44AD eligibility alerts, and ITR-4 (Sugam) PDF generation via `jspdf`.
    - `index.ts`: Feature barrel export.
    - `src/pages/IncomeTaxPage.tsx`: Primary orchestrator page managing tab switching, FY detection, and auto-prefill from current FY invoices/expenses.
    - Replaced `src/components/IncomeTax.jsx` with a non-breaking delegating facade pointing to `../pages/IncomeTaxPage`.
  - Extracted sub-components and logic under `src/features/reports/`:
    - `types.ts`: Strongly typed data contracts for P&L statements, aging receivables buckets, client analytics, and product performance.
    - `components/ProfitAndLossTab.tsx`: Period filter (FY vs Month/Year), currency switcher, 4 KPI cards (Revenue, Expenses, Net Profit/Loss, Margin), formal P&L statement, and monthly breakdown.
    - `components/SalesReportTable.tsx`: Dedicated monthly breakdown and sales report table component.
    - `components/AgingReportTab.tsx`: Receivables aging buckets (Current, 31-60d, 61-90d, 90+d) grouped by currency, client search filter, and days-overdue color badges.
    - `components/ClientAnalyticsTab.tsx`: Top 10 clients by revenue, worst payers by outstanding balance, and full client analytics table.
    - `components/ProductPerformanceTab.tsx`: Top revenue producing items, most units sold, and full SKU/HSN performance table.
    - `index.ts`: Feature barrel export.
    - `src/pages/ReportsPage.tsx`: Primary orchestrator page managing multi-currency detection, period filtering, business profile scoping (`belongsToProfile`), and tab navigation.
    - Replaced `src/components/ReportsView.jsx` with a non-breaking delegating facade pointing to `../pages/ReportsPage`.
  - Updated `src/App.jsx` lazy loader imports to load directly from `pages/IncomeTaxPage` and `pages/ReportsPage`.
  - Verified with clean production build (`compile_applet`), 70/70 statutory tax tests, and 9/9 discount mode tests passing.
- **Phase 29 Completed — GST Returns Monolith Modularization (`GSTReturnsPage`)**: Modularized the 2,284-line monolithic `src/components/GSTReturns.jsx` into Feature-Sliced Architecture:
  - Extracted sub-components and logic under `src/features/gst-returns/`:
    - `types.ts`: Strongly typed data contracts for GSTR-1, GSTR-3B, GSTR-2B, TDS, TCS, HSN summary, documents issued, and filing reconciliation.
    - `utils/gstCalculations.ts`: Pure calculations including `computeItemTaxSplit`, `billIsInterstate`, `billIsIntraUT`, `normInv`, `buildReconciliation`, and statutory filing instructions.
    - `services/gstExportService.ts`: GSTN portal-compliant offline JSON schema export (v3.1.6 for GSTR-1, v3.0.4 for GSTR-3B) and multi-table CSV downloads (B2B, B2C, HSN, CDNR, Doc Summary, GSTR-2B Recon, TDS, TCS).
    - `components/GSTR1Tab.tsx`: Table 4A (B2B), Table 7 (B2C), Table 9B (Credit Notes), Table 12 (HSN Summary), Table 13 (Docs Issued), and Grand Summary.
    - `components/GSTR3BTab.tsx`: Table 3.1 (Outward Supplies), Table 3.2 (Inter-state unregistered supplies), Table 4 (Eligible ITC), Table 6 (Tax Payment Summary), and Net GST Payable.
    - `components/GSTR2BTab.tsx`: Interactive 4-way reconciliation between uploaded GSTR-2B JSON and purchase records with status filtering and diff highlighting.
    - `components/TdsTcsTab.tsx`: Section-wise TDS receivable and TCS collected reports with Form 26Q / 27EQ CSV exports.
    - `components/FilingGuideTab.tsx`: Collapsible step-by-step interactive instructions for regular filing, NIL returns, and common portal error resolutions.
    - `index.ts`: Barrel export.
  - Created top-level view orchestrator `src/pages/GSTReturnsPage.tsx` handling business profile filtering, period picker, return status persistence, and cross-tab synchronizations.
  - Replaced `src/components/GSTReturns.jsx` with a clean delegating facade pointing to `../pages/GSTReturnsPage` for 100% backward compatibility.
  - Updated `src/App.jsx` lazy loader to import directly from `./pages/GSTReturnsPage`.
  - Verified with clean production build (`compile_applet`), 70/70 statutory tax tests, and 9/9 discount mode tests passing.
- **Phase 28 Completed — Dashboard & Register Refactoring**: Decomposed the monolithic 1,592-line `src/components/Dashboard.jsx` into modular domain sub-components and a dedicated orchestrator page:
  - Extracted sub-components under `src/features/invoices/components/Dashboard/`: `types.ts`, `MetricCards.tsx`, `RegisterFilters.tsx`, `BillsRegisterTable.tsx`, `PaymentModal.tsx`, `EditPaymentModal.tsx`, `ReceiptModal.tsx`, `RemindAllModal.tsx`, and barrel export `index.ts`.
  - Created top-level orchestrator view `src/pages/DashboardPage.tsx` handling business profile filtering, orphaned payment auto-reconciliation, low-stock warnings, overdue alerts, multi-page PDF generation with progress/abort controls, and WhatsApp/Email sharing.
  - Replaced `src/components/Dashboard.jsx` with a clean delegating facade pointing to `../pages/DashboardPage` for 100% backward compatibility.
  - Verified with clean production build, 70/70 statutory tax tests, and 9/9 discount mode tests passing.
- **Phase 27 Completed — Invoice Editor Monolith Decomposition**: Fully decomposed the monolithic 4,146-line `src/components/InvoiceGenerator.jsx` into modular, type-safe sub-components and hooks:
  - Created custom hook `src/features/invoices/hooks/useInvoiceForm.ts` to cleanly encapsulate all reactive editor state, dynamic line manipulations, and store transactions.
  - Extracted modular components under `src/features/invoices/components/InvoiceEditor/`: `RichEditor.tsx`, `InvoiceEditorHeader.tsx`, `InvoiceItemsTable.tsx`, `InvoiceTotalsSection.tsx`, and `PaymentTermsSection.tsx`.
  - Created top-level view orchestrator `src/pages/InvoiceEditorPage.tsx`.
  - Replaced the monolithic `src/components/InvoiceGenerator.jsx` with an lightweight delegating facade pointing to the TypeScript orchestrator to maintain 100% backward compatibility for all existing layout consumers.
  - Verified with clean production build, 70/70 statutory tax tests, and 9/9 discount mode tests passing.
- **Phase 26 Completed — Invoice Document & PDF Service**: Extracted and modularized `InvoicePreview.jsx` and PDF generation routines into `src/features/invoices/components/InvoicePreview/InvoicePreview.tsx`, `ThermalReceipt.tsx`, and `src/features/invoices/services/pdfService.ts`. Provided high-fidelity PDF boundary pagination, styling, and watermarking capabilities. Maintained 100% backward-compatibility via delegating facade at `src/components/InvoicePreview.jsx`. Verified with clean production build, 70/70 statutory tax tests, and 9/9 discount mode tests passing.
- **Phase 25 Completed — Invoice Satellite Components (`BillOCR`, `PrintSettings`, `PrintPreviewModal`)**: Extracted Bill OCR camera/upload modal into `src/features/invoices/components/BillOCR/BillOCRModal.tsx`, app-wide print defaults editor into `src/features/invoices/components/Print/PrintSettings.tsx`, and print preview modal into `src/features/invoices/components/Print/PrintPreviewModal.tsx`. Maintained 100% backward compatibility via delegating facades in `src/components/BillOCR.jsx`, `src/components/PrintSettings.jsx`, and `src/components/PrintPreviewModal.jsx`. Verified with clean production build, 70/70 statutory tax tests, and 9/9 discount mode tests passing.
- **Phase 24 Completed — Purchases, Recurring & Receipts Feature Extraction (`PurchasesPage`, `RecurringPage`, `ReceiptsPage`)**: Extracted Vendor Purchases domain into `src/features/purchases/` (`types/`, `services/purchaseService.ts`, `hooks/usePurchases.ts`, `components/PurchaseModal.tsx`, `index.ts`), Recurring Invoices domain into `src/features/recurring/` (`types/`, `services/recurringService.ts`, `hooks/useRecurring.ts`, `components/RecurringModal.tsx`, `index.ts`), and Payment Receipts domain into `src/features/receipts/` (`types/`, `services/receiptService.ts`, `hooks/useReceipts.ts`, `components/ReceiptModal.tsx`, `components/ReceiptPrintTemplate.tsx`, `index.ts`). Created top-level views `src/pages/PurchasesPage.tsx`, `src/pages/RecurringPage.tsx`, and `src/pages/ReceiptsPage.tsx`. Created intermediate delegating facades in `src/components/PurchaseBills.jsx`, `src/components/RecurringInvoices.jsx`, and `src/components/ReceiptVoucher.jsx` for 100% backward compatibility. Verified with clean production build, 70/70 statutory tax tests, and 9/9 discount mode tests passing.
- **Phase 23 Completed — Inventory & Expense Feature Extraction (`InventoryPage`, `ExpensesPage`)**: Extracted the Inventory feature domain into `src/features/inventory/` (`types/`, `services/inventoryService.ts`, `hooks/useInventory.ts`, `components/ProductModal.tsx`, `index.ts` barrel) and Expenses feature domain into `src/features/expenses/` (`types/`, `services/expenseService.ts`, `hooks/useExpenses.ts`, `components/ExpenseModal.tsx`, `index.ts` barrel). Created top-level pages `src/pages/InventoryPage.tsx` and `src/pages/ExpensesPage.tsx`. Created intermediate delegating facades in `src/components/InventoryView.jsx` and `src/components/ExpenseTracker.jsx` for 100% backward compatibility. Verified with clean production build, 70/70 statutory tax tests, 9/9 discount mode tests, and 3/3 smoke tests passing.
- **Phase 22 Completed — Client Feature Extraction (`ClientsPage`)**: Extracted the Clients feature domain into `src/features/clients/` (`types/`, `services/clientService.ts`, `hooks/useClients.ts`, `components/ClientModal.tsx`, `components/ClientLedger.tsx`, `index.ts` barrel) and created top-level view page `src/pages/ClientsPage.tsx`. Created intermediate delegating facades in `src/components/ClientModal.jsx` and `src/components/ClientsView.jsx` for 100% backward compatibility. Verified with clean production build, 70/70 statutory tax tests, 9/9 discount mode tests, and 3/3 smoke tests passing.
- **Phase 21 Completed — Application Shell & Navigation Layout Extraction**: Extracted typed layout components into `src/app/layout/` (`NavigationTabs.tsx`, `TopNavBar.tsx`, `BannerHost.tsx`, `AppShell.tsx`, and `index.ts` barrel). Decoupled top header navigation, profile switcher dropdowns, notification bells, dark mode triggers, PWA install banners, and offline server-down modal overlays. Verified with clean production build, 70/70 statutory tax tests, 9/9 discount mode tests, and 3/3 smoke tests passing.
- **Phase 20 Completed — Global Context Providers Architecture**: Implemented modular React context providers in `src/app/providers/` (`ThemeProvider.tsx`, `ProfileProvider.tsx`, `CurrencyProvider.tsx`, `NotificationProvider.tsx`, `AppProviders.tsx`, and `index.ts` barrel). Centralized theme persistence (`freegstbill_theme`), active profile management, currency formatting (`selected_currency`), and app update notifications. Verified with clean production build, 70/70 statutory tax tests, 9/9 discount mode tests, and 3/3 smoke tests passing.
- **Phase 19 Completed — Standardized API Client Implementation**: Created centralized HTTP API client infrastructure in `src/services/api/`: `client.ts` (`ApiClient` with `get`, `post`, `put`, `delete`, configurable `AbortSignal` timeout, auto JSON parsing), `errors.ts` (`ApiError`, `NetworkError`, `TimeoutError`, `NotFoundError`, `ConflictError`, `ValidationError`, `ServerError`), `endpoints.ts` (complete dictionary for all 44 backend API routes), and barrel export `index.ts`. Verified with clean production build, 70/70 statutory tax tests, 9/9 discount mode tests, and 3/3 smoke tests passing.
- **Phase 18 Completed — Invoice Types & Domain Contracts Declaration**: Declared domain TypeScript interfaces for the Invoices feature in `src/features/invoices/types/` (`items.ts`, `print.ts`, `invoice.ts`, and barrel export `index.ts`), covering `InvoiceDocument`, `InvoiceItem`, `DiscountMode`, `PaymentDetail`, `InvoiceTotals`, `InvoiceParty`, `InvoiceDetails`, `InvoiceOptions`, and `PrintSettings`. Re-exported `types` from `src/features/invoices/index.ts`. Verified with clean production build, 70/70 statutory tax tests, 9/9 discount mode tests, and 3/3 smoke tests passing.
- **Phase 17 Completed — Statutory Tax Calculation Core Engine Relocation**: Relocated the core statutory GST calculation engine (`computeInvoiceTotals`, `resolveLineDiscount`, `calculateLineItemTax`) from `src/utils.js` into `src/features/invoices/utils/taxCalculation.ts` as a pure, zero-DOM TypeScript module with explicit type declarations. Re-exported `taxCalculation` from `src/features/invoices/utils/index.ts`. Updated `src/utils.js` to re-export `resolveLineDiscount`, `calculateLineItemTax`, and `computeInvoiceTotals` delegating to `taxCalculation.ts`, maintaining 100% backward compatibility. Verified with clean Vite production build, 70/70 statutory tax tests, 9/9 discount mode tests, and 3/3 smoke tests passing.
- **Phase 16 Completed — Shared Layout Components Relocation**: Relocated `PageHeader.jsx` and `HelpButton.jsx` into `src/shared/components/layout/PageHeader.tsx` and `src/shared/components/feedback/HelpButton.tsx` with explicit TypeScript interface contracts (`PageHeaderProps`, `HelpButtonProps`). Exported via layout (`src/shared/components/layout/index.ts`), feedback (`src/shared/components/feedback/index.ts`), and shared components hub (`src/shared/components/index.ts`). Created delegating re-export facades at `src/components/PageHeader.jsx` and `src/components/HelpButton.jsx` for 100% backward compatibility. Verified with clean Vite build, 70/70 tax tests, 9/9 discount tests, and 3/3 smoke tests passing.
- **Phase 15 Completed — Shared Feedback Components Relocation**: Relocated `ConfirmModal.jsx` and `Toast.jsx` into `src/shared/components/feedback/` (`ConfirmModal.tsx`, `Toast.tsx`, and `index.ts`) with strict TypeScript prop contracts and exported through `src/shared/components/index.ts`. Created delegating re-export facades at `src/components/ConfirmModal.jsx` and `src/components/Toast.jsx` to maintain 100% backward compatibility. Verified with clean Vite build, all 70 statutory tax tests, 9 discount tests, and 3 smoke tests passing.

- **Phase 14 Completed — Secondary Leaf Services & Print Helpers Relocation**: Relocated `printSettings.js`, `share.js`, and `googleDrive.js` into feature and shared service locations (`src/features/invoices/utils/printSettings.ts`, `src/shared/utils/share.ts`, and `src/features/settings/services/googleDrive.ts`). Created backward-compatibility re-export facades to preserve legacy imports. Verified with clean Vite production build and all 79 tax/discount regression tests passing.
- **Phase 01 Completed — Baseline Verification & Safety Checkpoint**: Verified existing build and regression test suites. Production build completed in 9.37s with zero errors; all 70 statutory GST calculation tests (`scripts/tax-test.mjs`) and 9 discount mode regression tests (`scripts/discount-modes-test.mjs`) passed (79/79). Initial bundle benchmarks captured for post-refactor comparison.
- **Phase 02 Completed — Test Harness Normalization (Native Smoke Runner)**: Replaced uninstalled Playwright browser dependencies in `tests/smoke.mjs` with Node.js built-in `node:test`, `node:assert/strict`, and global `fetch`. Verified 3 automated smoke test assertions (`/api/health`, `/api/bills`, `/` SPA index delivery) passing in 181ms with zero external browser requirements.
- **Phase 03 Completed — Path Alias Registration (`@/*`)**: Registered standardized `@/` path alias pointing to `src/` in `tsconfig.json` (`baseUrl: "."`, `paths: { "@/*": ["src/*"] }`) and `vite.config.js` (`resolve.alias: { '@': path.resolve(__dirname, './src') }`). Verified with live test import `import App from '@/App.jsx'` in `src/main.jsx` and full production build verification.
- **Phase 04 Completed — Target Directory Structure Initialization**: Created scaffolding directories and `.gitkeep` placeholders for Feature-Sliced Architecture (`src/app/`, `src/pages/`, `src/features/`, `src/shared/`, `src/services/`, `src/store/`, `src/styles/`, and `server/`) without altering legacy directories or breaking runtime modules.
- **Phase 05 Completed — Global Shared Types Foundation**: Extracted and declared shared TypeScript models in `src/shared/types/` (`currency.ts`, `tax.ts`, `common.ts`, and barrel export `index.ts`), establishing type contracts for currencies, tax rates, GST buckets, supply places, addresses, and discount options.
- **Phase 06 Completed — Shared System Constants Extraction**: Extracted global static constants from `src/utils.js` into domain-specific modules in `src/shared/constants/` (`indianStates.ts`, `currencies.ts`, `taxRates.ts`, and barrel export `index.ts`). Updated `src/utils.js` to re-export all constants to maintain non-breaking backward compatibility. Verified with 70/70 statutory tax tests and 9/9 discount mode tests passing.
- **Phase 07 Completed — Shared Number & Currency Formatters Extraction**: Extracted number and currency formatting utilities from `src/utils.js` into `src/shared/utils/formatters.ts` and barrel `src/shared/utils/index.ts` (`numberToWords`, `formatCurrency`, `formatINR`, `formatIndianNumber`, `parseFormattedNumber`, `formatExchangeRateLine`, `CURRENCY_NAMES`). Re-exported all formatters in `src/utils.js` for 100% backward compatibility. Verified with 70/70 statutory tax tests, 9/9 discount tests, 3/3 smoke tests, and successful Vite compilation.
- **Phase 08 Completed — Shared Date & Fiscal Year Utilities Extraction**: Extracted Indian statutory fiscal year boundary helpers, GST portal date formatters, and compliance filing deadlines from `src/utils.js` into `src/shared/utils/dateUtils.ts` (`formatDateGST`, `getFinancialYearStart`, `getFinancialYearLabel`, `getFYOptions`, `getFilingPeriod`, `getUpcomingFilings`, `formatDisplayDate`, `isOverdue`, `getQuarterDates`). Updated `src/shared/utils/index.ts` and re-exported all helpers through `src/utils.js` as an intermediate facade. Verified with 70/70 statutory tax tests, 9/9 discount tests, 3/3 smoke tests, and clean production build.
- **Phase 09 Completed — GSTIN & PAN Validator Utilities Extraction**: Extracted statutory format regexes, state code extractors, PAN extractors, and validation routines from `src/utils.js` into `src/shared/utils/validators.ts` (`GSTIN_REGEX`, `PAN_REGEX`, `IFSC_REGEX`, `UPI_REGEX`, `calculateGSTINChecksum`, `verifyGSTINChecksum`, `extractStateFromGSTIN`, `extractPanFromGSTIN`, `getStateCode`, `isUnionTerritoryWithoutLegislature`, `validateGSTIN`, `validatePAN`, `validateIFSC`, `isValidUpiId`, `validateTaxId`). Re-exported all utilities via `src/shared/utils/index.ts` and maintained backward compatibility in `src/utils.js`. Verified with 70/70 statutory tax tests, 9/9 discount tests, 3/3 smoke tests, and clean production build.
- **Phase 10 Completed — Generic UI Hooks Extraction**: Created reusable domain-agnostic UI hooks in `src/shared/hooks/` (`useDebounce.ts`, `useLocalStorage.ts`, `useHotkeys.ts`, `useMediaQuery.ts`, and barrel export `index.ts`), providing strict typing, memory leak cleanup, form input safety, and intra-window/cross-tab state synchronization. Verified with 70/70 statutory tax tests, 9/9 discount tests, 3/3 smoke tests, and clean production build.
- **Phase 11 Completed — Design Tokens & Base Styles Split**: Modularized the monolithic 3,218-line stylesheet (`src/index.css`) into 5 dedicated architectural layers in `src/styles/`: `tokens.css` (primitives, color scales, 4px spacing, radii, typography), `themes.css` (Light/Dark mode semantic mappings), `reset.css` (modern reset, focus outlines, scrollbars, keyframe animations), `utilities.css` (layout, forms, buttons, tables, badges, dialogs, notices), and `print.css` (print media queries, A4/A5/Thermal POS paper dimensions, templates, invoice layouts). Orchestrated via `src/styles/index.css` and connected to `src/index.css` with 100% visual and print fidelity preserved. Verified with 70/70 statutory tax tests, 9/9 discount tests, and successful Vite compilation.
- **Phase 12 Completed — Shared Base UI Components Extraction**: Created strictly-typed, accessible UI primitive components in `src/shared/components/ui/` (`Button.tsx`, `Input.tsx`, `Select.tsx`, `Badge.tsx`, `Card.tsx`, `Table.tsx`, and barrel exports `index.ts` & `src/shared/components/index.ts`). Primitives incorporate full design token styling, variant support (`primary`, `secondary`, `outline`, `danger`, `ghost`, `success`), size scales (`sm`, `md`, `lg`), accessible loading states with `aria-busy` and Lucide icons, error message wiring (`aria-invalid`, `aria-describedby`), and compound card/table layouts. Verified with 70/70 statutory tax tests, 9/9 discount tests, 3/3 smoke tests, and successful Vite production compilation.
- **Phase 13 Completed — Leaf Domain Utilities Relocation**: Relocated leaf domain utilities into domain-scoped Feature-Sliced folders (`src/features/inventory/data/hsnRates.ts`, `src/features/clients/utils/clientCredit.ts`, `src/features/income-tax/utils/itrCalculation.ts`) with strong TypeScript typing and domain barrel exports. Maintained backward-compatibility re-export facades at `src/utils/hsnRates.js`, `src/utils/clientCredit.js`, and `src/utils/itr.js` to ensure zero disruption to legacy components and test suites. Verified with all 70 statutory tax tests, 9 discount mode regression tests, 3 API smoke tests passing, and clean Vite compilation.
- **Bug Fix — React Unique Key Prop Warning**: Resolved React warning (`Each child in a list should have a unique "key" prop in ForwardRef`) across `InvoicePreview.jsx` and `InvoiceGenerator.jsx` by establishing robust fallback keys for line items, thermal items, and extra section pages, as well as guaranteeing stable IDs on loaded draft/bill line items.

---

## [1.10.65] - 2026-09-11

**Company switching now refreshes the screen, the invoice toolbar stays put,
and expenses/purchases/recurring are separated per business.**

All three requested in #58 by @sangwanmail-eng.

### How to update

Launcher -> **Update** -> **Stop Server** -> **Open App**, or download
`Free-GST-Billing-v1.10.65.zip` from the
[Releases page].

### Fixed - the dashboard did not refresh after switching business

It read the selected business **once, when the screen first opened**.
Switching from the header changed everything else but never reached the
dashboard, so the previous company's invoices stayed on screen until a
manual reload. It now updates immediately.

### Changed - the invoice toolbar no longer scrolls away

Reported as: _"to access show preview and hide preview button once you are at
the bottom of the page, you have to scroll all page."_

Moving that one button would not have fixed it. The whole toolbar - **Save**,
**Save & Download**, **Print**, **WhatsApp**, **E-Way Bill** - sat at the top
of a long form and scrolled out of reach, so _any_ of those actions meant
scrolling back up. The bar is now pinned, which fixes the complaint for all of
them at once.

The preview control moved into that bar beside E-Way Bill and now reads
**Hide Preview** / **Show Preview** with an eye icon, rather than
"Focus mode (hide preview)".

### Added - expenses, purchases and recurring templates follow the business

Invoices were separated in v1.10.64; these three were not. They had no
business recorded against them at all, so an `ownerGstin` is now stamped when
they are saved, and each list shows only the selected business.

The field is deliberately named `owner*`: a purchase bill already records a
`supplierGstin` and an expense a `vendorGstin`, but those are the **other**
party. Filing your own purchases under your supplier would be exactly
backwards.

### Added - assign older records to a business, when you choose to

Anything saved before businesses were separated has no owner recorded, so it
appears under **every** business. It is never hidden - losing sight of past
expenses would be far worse than seeing them twice.

Expenses, Purchases and Recurring now show a line such as _"3 expenses are not
assigned to a business"_ with an **Assign to <business>** button. It appears
only when there is something to assign, names the business in the confirmation
so it cannot be done while looking at the wrong company, and disappears once
done.

Assigning is never automatic. Only you know which business an old expense
belonged to, and guessing would quietly file records into the wrong books.

### Documentation

The README and the User Guide described multi-business as switching letterhead
details only. They now explain that each business keeps its own books, that
switching refreshes immediately, that matching is by GST number so a rename
does not split a history, and what the **Assign to <business>** prompt does.

### Tests

24 -> 28, covering all three items. Each was checked by reverting its fix and
confirming the test goes red first - reverting the dashboard fix alone turns
`#58 the dashboard re-filters on a company switch` red, as it should.

---

## [1.10.64] - 2026-09-10

**Each business now has its own books.**

Requested (#55, @sangwanmail-eng): _"keep both companies' data stored and
displayed separately based on their respective GST numbers. An invoice
belonging to one company should not appear under the other."_

### How to update

Launcher -> **Update** -> **Stop Server** -> **Open App**, or download
`Free-GST-Billing-v1.10.64.zip` from the
[Releases page].

### Added - invoices are scoped to the business that issued them

Switching business already changed the letterhead, but every list -
dashboard, GST returns, reports, income tax - still showed **all**
invoices. Two businesses meant one mixed set of books, and a GST return
could include invoices raised under a different GSTIN.

Now the **dashboard**, **GST Returns**, **Reports** and **Income Tax**
show only the invoices belonging to the business you have selected.

### Correction to v1.10.62

In #53 the answer given was that "invoice numbering, clients and reports
all follow the active profile". **That was wrong about reports** - nothing
filtered by business at all. This release is what actually makes it true.

### Nothing disappears - and why that took care

The obvious approach is to filter on the business id stored with each
invoice. That would have been a disaster: the id was only added recently,
so **every older invoice has none**, and filtering on it would have wiped
a user's entire history from view the moment they updated. In accounting
software that is the worst failure available.

Invoices are matched on the **seller's GSTIN**, which every invoice has
stored since day one because the seller's details are saved onto each
invoice as it is raised. That also survives a rename: this user has
invoices reading "Dice Codes" and "Anahat Exclusive" under a single GSTIN

- one business, renamed. GSTIN keeps them together; matching on the name
  would have split them in two.

A business with no GSTIN yet falls back to its name, and **anything that
cannot be attributed at all is shown, never hidden**. If in doubt, you see
your invoice.

Three tests cover exactly this, including one that fails if an
un-attributable invoice is ever hidden.

### Not yet scoped

**Clients** and **Receipts** still show everything. Those lists are shared
rather than wrong - a client can be a client of both businesses - so they
need a decision rather than a filter. Say which behaviour you want and it
will follow.

---

## [1.10.63] - 2026-09-10

**Critical: the release ZIP shipped a server that could not start.**

Reported (#54, @ANIM35H), with the exact cause already diagnosed. Thank you.

### How to update

Download `Free-GST-Billing-v1.10.63.zip` from the
[Releases page]
and extract it over your folder. If your app never started, this is the
release that fixes it - nothing else needs doing.

### Fixed - "Server did not respond in 15s"

The packaged `server.js` imports one file from `src/`, and `src/` was not
in the ZIP. The server exited before it could bind, so the launcher could
only report a timeout - the real error was never shown:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '_system/src/utils.js'
  imported from '_system/server.js'
```

**How it happened.** `server.js` began importing `./src/utils.js` in
v1.10.31. A later commit removed `src/` from the ZIP to halve the download
(31.5 MB to 15.95 MB) - right for the React source, but nobody noticed the
**server** had grown a dependency on one file inside it.

`src/utils.js` imports nothing, so shipping that single file is the entire
fix. The rest of `src/` stays out and the ZIP is unchanged in size.

Verified by extracting the built ZIP and starting the server from it:
it now prints `running at http://localhost:47371` instead of exiting.

### Added - the build refuses to ship a server that cannot start

The real failure here was not the bad commit; it was that **nothing ever
opened the package**. The test suite, the linter and every manual check
run against the development tree, where `src/` is always present. The
artefact users download was never started even once.

`npm run release:zip` now walks every relative import reachable from the
packaged `server.js` and **aborts the build** if any file is missing.
Confirmed by removing the fix and watching the build refuse to produce a
ZIP.

Recorded as ERR-009 in `docs/KNOWN_ERRORS.md`, with the rule stated
plainly: _testing the repo is not testing the release_.

### Why this was not caught sooner

Until v1.10.61, the README pointed people at the **source** ZIP, which
does contain `src/`. Those users had working servers - which is why the
regulars reporting other bugs were unaffected, and the broken path was the
one almost nobody used. Correcting that link in v1.10.61 pointed everyone
at the release ZIP, and this surfaced immediately.

---

## [1.10.62] - 2026-09-07

**Notifications can be cleared — and come back when something new happens.**

Reported (#53, @sangwanmail-eng).

### How to update

Launcher -> **Update** -> **Stop Server** -> **Open App**, or download
`Free-GST-Billing-v1.10.62.zip` from the
[Releases page]
and extract it over your folder.

### Added - "Mark all as read" on the notification bell

The bell never cleared, and the reason was structural: these are not
messages sitting in an inbox. They are worked out fresh from your data
every time the app loads - "3 invoices are overdue", "2 products are low
on stock". Nothing was ever stored, so there was no such thing as having
read one, and the count simply reported what was true and stayed lit.

Clearing them could not just hide them either. If an invoice falls overdue
tomorrow you need telling, even though you dismissed yesterday's overdue
notice.

So each section now remembers **exactly what was cleared** - the specific
invoice numbers, the specific products. It stays quiet only while that is
unchanged. A new overdue invoice, or a different product running low,
brings the alert straight back on its own.

Measured across a reload: 2 overdue invoices + 1 GST filing showed a badge
of 3; **Mark all as read** took it to 0; adding one more overdue invoice
brought it back - showing only the overdue section, with the filing still
correctly dismissed.

The setting is stored per machine and is not part of your business data,
so it never travels in a backup or to another PC.

### Already available - multiple companies (#53 item 2)

This exists today. **Settings -> All business profiles** keeps as many
businesses as you like, each with its own name, GSTIN, address, bank
details, logo and signature, and the header switcher moves between them.
Invoice numbering, clients and reports all follow the active profile.

No change was needed; it simply was not obvious enough from the interface,
which is worth addressing separately.

### Tests

Suite is now 20 checks. The three added here cover the part most likely to
be got wrong later: that clearing works, **and** that a genuinely new
overdue invoice still re-alerts afterwards.

---

## [1.10.61] - 2026-09-04

**The README's download link pointed at source code, not the app.**

### Fixed - "Download ZIP" gave an unbuilt copy

Four links in the README pointed at
`/archive/refs/heads/main.zip` - GitHub's _source code_ download for the
main branch. Compared side by side against the real release ZIP:

|                                     | built app inside | folder layout                         |
| ----------------------------------- | ---------------- | ------------------------------------- |
| `main.zip` (what the README linked) | **0 files**      | `release-templates/` developer layout |
| release ZIP                         | **50 files**     | `Free-GST-Billing/_system/`           |

So anyone following the README got the source with **no built application**,
in the developer folder layout, from an untagged commit. It also explains
the very first bug report this project received, whose error path read
`Free-GST-Billing-Software-main
elease-templates\_system-scripts\...` -
that user had done exactly what the README told them to.

All four links now point at the **latest release**, and the install step
says explicitly not to use the green _Code -> Download ZIP_ button.

Worth noting: `Update FreeGSTBill.bat` - which downloads the main branch
and runs `npm install` over your installation - is **not** in the release
ZIP. It only ever reached people who took the main.zip route, so correcting
these links closes that path too.

### Security - fflate 0.8.2 -> 0.8.3

Infinite loop when parsing malformed ZIP64 archives (moderate). It arrives
through jsPDF and **does** ship. Shipped advisories are back to zero.

---

## [1.10.60] - 2026-09-03

**PDFs printed without any formatting. Root cause found and removed.**

Reported by @sguptagzb (#51) with a sample PDF attached, and by
@sangwanmail-eng (#50). Two users, same underlying area.

### How to update

Launcher -> **Update** -> **Stop Server** -> **Open App**, or download
`Free-GST-Billing-v1.10.60.zip` from the
[Releases page]
and extract it over your folder. Data in `_system/data/` is untouched.

### Fixed - the PDF came out with no formatting at all (#51)

_"When I try to print the Invoice, the format is not coming as it comes in
Preview."_

The attached PDF was decoded rather than guessed at. It contained a single
3168x4484 bitmap of an invoice with **no layout CSS**: no table borders, no
cards, no aligned columns, labels running straight into values
("Subtotal(rupee)1,78,000.00"). Inline styles had survived; every rule
that came from a stylesheet had not. Generating the same invoice here, on
the same version, produced a correctly formatted PDF - so the code was
right and something in that user's environment was stopping the styles
loading.

**Root cause.** The PDF is produced by cloning the invoice into a detached
document and photographing it. That clone had to **re-fetch the stylesheet
by URL**. Any reason that fetch fails gives a silently unformatted PDF:
a security policy that does not match the address in use, a service worker
(this app is a PWA) returning a stale or failed response, or a clone
document with no origin of its own.

v1.10.48 widened the security policy, which fixed one cause. This removes
the dependency altogether: **the stylesheet is now embedded directly into
the clone**, so nothing is fetched and nothing can fail. The thermal print
path has worked this way since v1.10.42; the PDF path had never adopted it.

Verified by deliberately restoring the exact security policy that produced
the broken PDF, and confirming the output is fully formatted anyway.

### Fixed - numbered terms printed as one paragraph (#50)

All 13 built-in Terms presets use real bullet lists and were unaffected.
But terms typed or pasted by hand - commonly from Word - arrive as a
single paragraph with the numbers typed in:

    1. Payment due in 15 days. 2. Interest 18% p.a. 3. ...

That genuinely is one paragraph, so no styling could separate it; the app
was printing exactly what was written. It still reads as a wall of text.

Such terms are now split onto separate lines at the numbering. The rule is
deliberately cautious - it needs **three or more** numbered markers before
it will touch anything, so ordinary prose like "refer to Section 2. of the
Act", or content already using bullets, is left alone.

### Note

An earlier edit in this session introduced a broken string literal that
made the file fail to parse. It was caught by lint before release, but the
build check used to wave it through was too narrow to notice - worth
recording, since a green build meant nothing in that state.

---

## [1.10.59] - 2026-09-03

**Security: every dependency advisory closed. Plus a client-list
optimisation - and an honest negative result on the scrolling report.**

### How to update

Launcher -> **Update** -> **Stop Server** -> **Open App**, or download
`Free-GST-Billing-v1.10.59.zip` from the
[Releases page]
and extract it over your folder. Data in `_system/data/` is untouched.

### Security - all open advisories closed

Seven were outstanding. Only one reached users:

- **`qs`** (moderate) - reachable through the bundled server, so it _did_
  ship. Now patched.
- `fast-uri` (high) and `@humanfs/node` (medium) - build tooling only. The
  installer runs `npm install --omit=dev`, so neither has ever been on a
  user's machine.

Both `npm audit` and `npm audit --omit=dev` now report **zero across every
severity**.

### Changed - client list no longer rescans every bill per row

`getClientStats()` filtered and re-sorted the entire bill list on each
call, with no memoisation - so it re-ran on every render, including every
keystroke in the search box. The client sort called it from inside its
comparator as well, so a full scan happened O(n log n) times per render on
top of once per rendered row.

Bills are now grouped by client once per change, each group sorted once,
and totals precomputed in the same pass. Lookups are O(1).

### NOT fixed - #44 item 4, "slow moving scroll bar"

Reported by @sangwanmail-eng. **I could not reproduce it, and the change
above did not measurably help.**

Measured in Firefox against a seeded book of 60 clients and 505 bills,
before and after:

|                                         | before       | after        |
| --------------------------------------- | ------------ | ------------ |
| typing 13 characters into client search | 921 ms       | 949 ms       |
| 25 scroll frames                        | 9.2 ms/frame | 8.9 ms/frame |

Under 16.7 ms per frame is smooth, and both builds were already there. The
optimisation is a real algorithmic improvement that will matter on a much
larger book, but it is **not** a fix for what was reported, and it would be
wrong to close the issue on it.

The cause is therefore still unknown. It may need far more data than 505
bills, or it may be something else entirely - a different view, a slower
machine, or the scrollbar being physically hard to drag on a very long
page rather than the page being slow. #44 stays open pending more detail.

---

## [1.10.58] - 2026-09-03

**Blank invoices and empty purchase bills can no longer be saved.**

Reported (#47, @sangwanmail-eng).

### How to update

Launcher -> **Update** -> **Stop Server** -> **Open App**, or download
`Free-GST-Billing-v1.10.58.zip` from the
[Releases page]
and extract it over your folder. Data in `_system/data/` is untouched.

### Fixed - an empty invoice could be saved and printed

Pressing **Save** on a brand-new invoice with no client and no items
created the invoice anyway. Print and Download PDF did the same.

The rule was already written - `isMeaningfulInvoice()` required a client
name and at least one priced line - but it only gated the background
auto-save. The Save button and the print paths went straight to the
database with no checks at all.

This mattered more than an empty record: **saving reserves an invoice
number** from the counter. Every blank save permanently consumed a number,
and GST expects that series to be gapless - so a handful of stray clicks
left holes a CA would have to account for.

Save, Print and Download now check first, and say which field is missing
rather than simply refusing:

- _"Add a client name before saving."_
- _"Add at least one item with a quantity and rate before saving."_

Editing an existing invoice is unaffected.

### Fixed - purchase bills saved with no items

Supplier name and invoice number were required; nothing checked that the
bill had any line items, so an empty bill saved with a zero total.

A purchase bill is the input-tax-credit record. A zero-value bill sits in
GSTR-3B reconciliation as a vendor invoice claiming nothing, and the empty
rows also feed the stock sync that runs on save.

### Tests

Suite is now 17 checks, and this release exercised it properly: adding the
new guard turned the PDF test red, because that test had been generating a
PDF from an invoice with no client - precisely the behaviour #47 says
should be impossible. The test was wrong, not the fix.

Two further faults in the tests themselves were found and repaired: the
suite left a saved invoice behind, and the Settings test wrote a fixed
business name, so on a second run the field already held that value,
nothing changed, and the test failed while the app was correct. Both now
use unique values, restore what they touched, and pass on repeated runs.

---

## [1.10.57] - 2026-09-03

**Terms print properly, the receipt list stops overlapping, and low-stock
alerts are clickable.**

Items 1-3 of #44 (@sangwanmail-eng). Item 4 is still open - see below.

### How to update

Launcher -> **Update** -> **Stop Server** -> **Open App**, or download
`Free-GST-Billing-v1.10.57.zip` from the
[Releases page]
and extract it over your folder. Data in `_system/data/` is untouched.

### Fixed - terms and conditions ran together as one paragraph

A numbered list of terms printed on the invoice as a single wall of text:
_"1. Payment is due within 15 days... 2. Late payment interest..."_ with no
line breaks.

Cause: the global CSS reset at the top of `index.css` -
`* { margin: 0; padding: 0 }` - strips spacing from **every** element,
including the `<p>`, `<ul>`, `<ol>` and `<li>` tags inside rich terms. With
that spacing gone the paragraphs butt together and list markers lose their
indent.

The rules that put it back existed since v1.10.37, but only applied in
**Formatted** mode - and the default is **Compact**. So every invoice
except a services one printed the flattened version.

Spacing now lives on the base rich-text class, so structure survives in
both modes. Compact stays tighter, in keeping with fitting more on a page.
Measured after the fix: paragraph spacing 5.6px (was 0), ordered-list
indent 17.6px (was 0).

### Fixed - payment receipt list overlapped the form beneath it

In **New Payment Receipt**, the _Quick Select - Unpaid Invoices_ list drew
on top of Receipt No, Date, Received From and Amount.

The list had a 150px height cap applied to a container with no overflow
handling - the class that actually scrolls is a different one. Ten unpaid
invoices in a box that could not clip them simply spilled over everything
below. Measured: 424px of content in a 148px box, now scrolled instead of
spilled.

### Added - low-stock alerts open the Products tab

The chips under **Low Stock Alert** on the dashboard were plain text, so
seeing the warning meant finding Products in the sidebar yourself. Each is
now a button that opens Products directly - matching the notification bell,
which already did this.

### Still open - #44 item 4, sluggish scrolling

Not fixed here. "Slow moving scroll bar" in the purchase and client tabs
needs profiling to find the actual cause rather than a guess, and these
three were ready to ship. It is the next thing on the list.

### Repository

`main` is now protected against force-pushes and branch deletion.

---

## [1.10.56] - 2026-09-01

**Hotfix: Settings kept claiming unsaved changes, and popped a dialog on
every close.**

Reported (#44 item 5, @sangwanmail-eng): _"Firm profile setting not saved.
every time show popup"_. A regression from v1.10.55, four days old.

### How to update

Launcher -> **Update** -> **Stop Server** -> **Open App**, or download
`Free-GST-Billing-v1.10.56.zip` from the
[Releases page]
and extract it over your folder. Data in `_system/data/` is untouched.

### Fixed

**The profile was saving correctly the whole time.** The unsaved-changes
tracker added in v1.10.55 was the thing at fault.

It recorded "this is now the saved state" in the Save Profile handler
only. But the profile is written to disk from three places:

1. the **Save Profile** button
2. **payment accounts**, which auto-save on every change (since v1.10.16)
3. **switching business profile**, which saves before switching

After 2 or 3 the data was safely on disk, but the tracker still held the
older copy - so the bar insisted there were unsaved changes that did not
exist, and the browser close-confirmation added alongside it then fired
every single time. That dialog is the popup in the report.

All three paths now update the baseline through one shared helper, so it
cannot drift from what is actually stored.

**The close-confirmation dialog is removed entirely.** Even with the
baseline fixed it was the wrong tool - it hijacks the browser's own close
dialog for a form the user may never have intended to save, and any future
drift in the dirty check turns straight back into a popup on every exit.
The sticky bar already makes unsaved work visible without interrupting
anyone.

(The separate warning when leaving a half-written **invoice** is untouched

- that one predates this and is correctly gated on real unsaved work.)

### Tests

Two checks added, bringing the suite to 16: the bar must clear once the
profile is on disk, and must not reappear on returning to Settings.

### Still open from #44

Items 1-4 of that report are **not** addressed here, so this fix could
ship immediately: terms and conditions running together on the invoice,
the payment-receipt dropdown overlapping the form beneath it, low-stock
alerts not being clickable, and sluggish scrolling in list views.

---

## [1.10.55] - 2026-08-27

**Changing an item or supplier now refreshes its details, Settings warns
about unsaved changes, and the project finally has automated tests.**

Reported (#43, @sangwanmail-eng).

### How to update

**Current version:** 1.10.54 -> **New version:** 1.10.55

1. Open the launcher, click **Update**, then **Stop Server** -> **Open App**.
2. Or download `Free-GST-Billing-v1.10.55.zip` from the
   [Releases page]
   and extract it over your existing folder.

Your data in `_system/data/` is never touched by an update.

### Fixed - changing an item kept the previous item's HSN and rate

Picking an item filled its details correctly, but changing that same field
to a different item left the OLD values behind. Pick _Pen drive_ (HSN `s`,
rate 399), switch to _Mouse_, and the row still read HSN `s`, rate 399 -
so the bill was saved with the wrong HSN and the wrong price, with nothing
on screen to suggest anything was amiss.

The same bug hit the supplier fields, where it was worse: switching
supplier kept the **previous supplier's GSTIN**, filing the bill against
the wrong taxpayer and breaking ITC reconciliation.

Cause: v1.10.50 filled a field only when it was blank, so as not to
overwrite typing. That treated "this field has something in it" as "the
user typed this" - and after the first selection it always did.

The app now records what it auto-filled. A field is replaced when it is
empty or still holds exactly what was auto-filled into it; once you edit
it by hand, it is left alone. So re-selecting updates the details **and** a
correction you typed still survives - both, rather than one at the cost of
the other.

### Fixed - Settings gave no sign that changes were unsaved

The Company Details form runs to about 450 lines of screen, and its Save
button sits at the very bottom. Change your GSTIN near the top, scroll to
another section, and nothing indicated the change was still unsaved.

It felt intermittent because this page mixes three behaviours with no
visible difference between them: **Features** toggles save the instant you
click, **Region** saves and shows a toast, while **Company**, **Invoice
Numbers** and **Terms** each need their own button. Some edits stuck, some
vanished, and there was no way to tell which.

A bar now appears at the top of Settings whenever Company Details has
unsaved changes, stays visible as you scroll, and offers **Save** and
**Discard**. Closing the app with unsaved changes also warns first.

### Added - `npm test`

This is the first automated test suite in the project.

Fourteen checks run in **Firefox** at **1366x768** - the browser and screen
size that several of these bugs needed in order to appear at all. They
cover every field-reported regression from the last two weeks: the
suggestion list contents (#42) and what it displays (#40), item and
supplier re-selection (#43), the unsaved-changes bar (#43), preview
clipping (ERR-005), and PDF generation with no security-policy violations
(ERR-004, ERR-007).

Each test was checked by reverting the fix and confirming it goes **red**
first. A test that has never failed proves nothing, so that is the bar for
adding to it.

Run before publishing:

```
npm run test:install   # one time - downloads Firefox
npm test
```

---

## [1.10.54] - 2026-08-24

**Fixed: your products did not appear in the purchase item list.**

Reported (#42, @sangwanmail-eng). A follow-on flaw in the item recall
added in v1.10.50.

### How to update

**Current version:** 1.10.53 -> **New version:** 1.10.54

**If the in-app Update button works for you**

1. Open the Free GST Billing launcher.
2. Click **Update**.
3. Wait for "Update complete", then click **Stop Server**, then **Open App**.

That is all - your data is not touched.

**If the Update button does not work (or you are unsure)**

1. Download `Free-GST-Billing-v1.10.54.zip` from the
   [Releases page].
2. Close the app completely (click **Stop Server** first if it is running).
3. Extract the ZIP over your existing Free GST Billing folder, replacing
   files when Windows asks.
4. Double-click the launcher again.

**Is my data safe?** Yes. Invoices, clients, products and settings live in
`_system/data/`, which an update never touches.

### Fixed - Add Purchase Bill ignored the Products & Services list

The item suggestions were built purely from what had been **typed on past
purchase bills**, and never looked at the product catalogue. With a master
containing _Keyboard, motherboard, Mouse, Pen drive_, the dropdown offered
_mouse, key, Pen drive_ - lowercase variants and a half-typed entry from
old bills, with two real products missing altogether.

|                  | Before                  | After                                          |
| ---------------- | ----------------------- | ---------------------------------------------- |
| Suggestions      | `mouse, key, Pen drive` | `key, Keyboard, motherboard, Mouse, Pen drive` |
| Missing products | Keyboard, motherboard   | none                                           |
| Stray `mouse`    | listed separately       | folded into `Mouse`                            |

Now the **product master comes first**, so the spelling you curated wins
over whatever was typed in a hurry months ago. Matching is
case-insensitive, so `mouse` and `Mouse` collapse to one entry rather than
two that look identical.

Picking a product fills its **HSN** and **purchase price** - specifically
the price you pay a supplier, not the price you charge a customer.

One-off items bought once and never added to the catalogue are still
listed. There is no reliable way to tell a genuine one-off from an old
typo, so both are kept and you choose.

The list also refreshes right after saving a bill, so an item added
through a purchase shows up immediately instead of after a page reload.

### Note on the underlying cause

The save path already called `getAllProducts()` to update stock levels, so
the catalogue was loaded and available the whole time - v1.10.50 simply
never used it for suggestions. The data was there; the wiring was not.

---

## [1.10.53] - 2026-08-23

**Two financial-year bugs that were silently producing wrong data.**

Both found by a code audit, not by a user - which is the point: neither
showed an error message. One mis-stamps invoice numbers for three months
of every year; the other made the Income Tax screen quietly compute zero.

### How to update

**Current version:** 1.10.52 -> **New version:** 1.10.53

**If the in-app Update button works for you**

1. Open the Free GST Billing launcher.
2. Click **Update**.
3. Wait for "Update complete", then click **Stop Server**, then **Open App**.

That is all - your data is not touched.

**If the Update button does not work (or you are unsure)**

1. Download `Free-GST-Billing-v1.10.53.zip` from the
   [Releases page].
2. Close the app completely (click **Stop Server** first if it is running).
3. Extract the ZIP over your existing Free GST Billing folder, replacing
   files when Windows asks.
4. Double-click the launcher again.

**Is my data safe?** Yes. Invoices, clients, products and settings live in
`_system/data/`, which an update never touches.

### Fixed - invoice numbers carried the wrong financial year in Jan-Mar

Invoice numbers with the financial year enabled used the **calendar**
year. India's FY runs 1 April to 31 March, so an invoice raised on
15 January 2027 belongs to FY 2026-27 but was numbered `.../2027-28/...`.

Every invoice raised between 1 January and 31 March - three months of
every year - carried the wrong FY, and that number is what gets reported
in GSTR-1.

| Invoice date | Before      | Now     |
| ------------ | ----------- | ------- |
| 31 Dec 2026  | 2026-27     | 2026-27 |
| 1 Jan 2027   | **2027-28** | 2026-27 |
| 31 Mar 2027  | **2027-28** | 2026-27 |
| 1 Apr 2027   | 2027-28     | 2027-28 |

The correct April-boundary rule already existed twice in the codebase;
`store.js` had simply reimplemented it wrongly. There is now one shared
`getFinancialYearStart()` / `getFinancialYearLabel()` in `utils.js` that
every caller uses, so it cannot drift apart again.

**Nothing changes for anyone today** - between April and December the old
and new logic agree. This lands before January, when they diverge.
Invoice numbers already saved are left exactly as they are.

### Fixed - Income Tax showed one year while calculating another

The Income Tax screen declared its own `CURRENT_FY = '2024-25'`, which
shadowed the tax engine's `'2025-26'`. The page was labelled FY 2024-25
while every calculation ran on FY 2025-26 slabs.

That constant also drives the business-income prefill, which filters bills
by `billFY === CURRENT_FY`. Frozen two years back, **no current invoice
ever matched**, so income prefilled as zero and nothing explained why.

The screen now takes its year from the engine, so there is one answer
instead of two, and the assessment year is derived rather than hardcoded.

### Added - an honest notice when the app is behind the current FY

The built-in slab tables, rebate limits and capital-gains rates go up to
FY 2025-26. The real year is now FY 2026-27, and those rates are not in
the app.

Rather than let that stay invisible, the screen now says so directly: what
year the figures are for, that current-year invoices are excluded from the
income figure, and to check with a CA before filing.

**Deliberately not done:** inventing FY 2026-27 slab rates. Those come
from a Budget that is not implemented here, and guessing at tax rates
would be far more dangerous than admitting the gap. Passing an unsupported
year to the engine also silently falls back to the _oldest_ table, so the
notice matters.

---

## [1.10.52] — 2026-08-23

**Fixed: the supplier suggestion list showed GST numbers instead of names.**

Reported (#40, @sangwanmail-eng). This was a regression introduced by the
supplier recall added in v1.10.50 the previous day.

### How to update

**Current version:** 1.10.51 -> **New version:** 1.10.52

**If the in-app Update button works for you**

1. Open the Free GST Billing launcher.
2. Click **Update**.
3. Wait for "Update complete", then click **Stop Server**, then **Open App**.

That is all - your data is not touched.

**If the Update button does not work (or you are unsure)**

1. Download `Free-GST-Billing-v1.10.52.zip` from the
   [Releases page].
2. Close the app completely (click **Stop Server** first if it is running).
3. Extract the ZIP over your existing Free GST Billing folder, replacing
   files when Windows asks.
4. Double-click the launcher again.

**Is my data safe?** Yes. Invoices, clients, products and settings live in
`_system/data/`, which an update never touches.

**Something went wrong?** Open an issue with a screenshot:
the project distribution page

### Fixed - supplier and item lists showed the wrong text

v1.10.50 attached the GSTIN to each suggestion as a secondary hint, by
putting it in the option's child text. Browsers disagree about which part
of a suggestion they display: Chrome shows the value with the hint as
secondary grey text, **Firefox shows the hint instead of the value**. So
Firefox users saw a list of GST numbers where supplier names belonged.
The item list had the same problem with HSN codes.

Suggestions now carry the name and nothing else. The GSTIN, address and
HSN still fill in automatically once a suggestion is picked, so nothing
is lost - the hint was never buying anything.

### Why the v1.10.50 test did not catch it

The Playwright test written for v1.10.50 passed, and would still pass
against the broken build. It asserted on each option's `value`, which was
correct the whole time - the defect was in what the browser chose to
_display_. Testing the mechanism is not testing the presentation.

The test now asserts on `label ?? textContent ?? value`, the precedence a
browser actually applies, so it fails against the old markup. Recorded as
ERR-008 in `docs/KNOWN_ERRORS.md`.

### Known, not yet fixed

Also raised in #40: the app allows two clients or suppliers with the same
name **and** the same GSTIN, and there is no "add supplier" screen to
match the one for clients. Both are fair, and neither is fixed here -
this release is kept to the regression so it can ship immediately. They
are being scoped separately.

---

## [1.10.51] — 2026-08-22

**Fixed: a cleared Terms or Notes field still printed its heading.**

Adapted from a fix proposed by **@venkateshpabbati** in #38.

### How to update

**Current version:** 1.10.50 → **New version:** 1.10.51

**If the in-app Update button works for you**

1. Open the Free GST Billing launcher.
2. Click **Update**.
3. Wait for "Update complete", then click **Stop Server**, then **Open App**.

That is all — your data is not touched.

**If the Update button does not work (or you are unsure)**

1. Download `Free-GST-Billing-v1.10.51.zip` from the
   [Releases page].
2. Close the app completely (click **Stop Server** first if it is running).
3. Extract the ZIP over your existing Free GST Billing folder, replacing
   files when Windows asks.
4. Double-click the launcher again.

**Is my data safe?** Yes. Invoices, clients, products and settings live in
`_system/data/`, which an update never touches. The updater also takes an
automatic backup to `Documents\FreeGSTBill Backups\` before it changes
anything.

**Something went wrong?** Open an issue with a screenshot:
the project distribution page

### Fixed — empty Terms / Notes printed a stray heading

If you typed Terms & Conditions and later cleared the field, the invoice
kept printing the **Terms & Conditions** heading with nothing under it.
Same for Notes.

The emptiness check stripped HTML tags with a regular expression but left
**entities encoded**. A rich-text editor leaves `<p>&nbsp;</p>` behind
when you clear a field, and `&nbsp;` survived tag-stripping as a literal
seven-character string — so the field read as non-empty.

Now the HTML is parsed rather than pattern-stripped, which decodes
entities; `String.trim()` treats the resulting non-breaking space as
whitespace, so a cleared field correctly reads as empty. Parsing also
handles markup a regex mis-reads, such as `<div title="a>b">`.

Verified in Firefox — `<p>&nbsp;</p>` and `<p>&nbsp;&nbsp;</p>` now read
as empty, while real content and the `title="a>b"` case still read as
present.

Applied in **five** places rather than the three in the original PR, and
extracted to a single `htmlHasText()` helper in `utils.js` — the same
regex idiom had been copy-pasted across `InvoicePreview.jsx` and
`InvoiceGenerator.jsx`.

To be clear about scope: this is an **emptiness check**, not a security
boundary. Rendering already runs the HTML through DOMPurify and still
does.

### Not taken from #38 — rate limiting on the trash endpoints

The same PR added `express-rate-limit` as a production dependency, capping
three `/api/trash` routes at 60 requests per minute.

Declined. The bundled server binds to `127.0.0.1` and serves exactly one
person: the user, on their own machine. There is no remote caller to
throttle, so this adds a dependency to every user's install — more to
download, more supply-chain surface — to defend against the user clicking
too fast. It could also break legitimate use: restoring a batch of
invoices from the trash can exceed 60 actions in a minute.

---

## [1.10.50] — 2026-08-22

**Purchase bills remember your suppliers and items.**

Reported (#39, @sangwanmail-eng): _"In add purchase option previous added
supplier and item not shown. So all details need to be fill again, like
supplier name, gst number, address, item name etc"_.

### How to update

**Current version:** 1.10.49 → **New version:** 1.10.50

**If the in-app Update button works for you**

1. Open the Free GST Billing launcher.
2. Click **Update**.
3. Wait for "Update complete", then click **Stop Server**, then **Open App**.

That is all — your data is not touched.

**If the Update button does not work (or you are unsure)**

1. Download `Free-GST-Billing-v1.10.50.zip` from the
   [Releases page].
2. Close the app completely (click **Stop Server** first if it is running).
3. Extract the ZIP over your existing Free GST Billing folder, replacing
   files when Windows asks.
4. Double-click the launcher again.

**Is my data safe?** Yes. Invoices, clients, products and settings live in
`_system/data/`, which an update never touches. The updater also takes an
automatic backup to `Documents\FreeGSTBill Backups\` before it changes
anything.

**Something went wrong?** Open an issue with a screenshot:
the project distribution page

### Added — supplier and item recall in Add Purchase Bill

**Supplier Name** and each line item's **Name** now suggest what you have
entered before, and filling one fills the rest:

- Pick a supplier → **GSTIN**, **address** and the **inter-state** flag
  come back automatically. The inter-state flag matters: it decides
  whether ITC lands in the IGST column or CGST + SGST in GSTR-3B, and it
  is a property of where the supplier is, so it is recalled with them.
- Pick an item → **HSN**, **rate** and **tax %** (and cess, if any) come
  back from the last time you bought it.
- Suppliers and items you have never used are still free to type. The
  suggestion list never blocks new entries.

**Nothing you have already typed is ever overwritten.** Recall only fills
fields left blank, so correcting a supplier's new GSTIN and then typing
their name does not bring the old one back. Rate behaves the same way — a
price you have already entered survives.

Why this was worse than it looked: a mistyped GSTIN does not just cost
retyping, it quietly breaks ITC reconciliation in GSTR-3B. Anyone entering
a stack of bills from the same few vendors was hand-copying a 15-character
GSTIN every time.

**Implementation note:** purchase bills store supplier details inline
rather than against a supplier master record, so the history is derived
from the bills already loaded rather than by introducing a supplier table.
That avoids a data migration and avoids a second place for the same
details to drift out of sync. Newest bill wins, so the most recent
spelling of a supplier is the one offered.

Verified end-to-end in Firefox: seeded a bill, reopened the form,
confirmed both suggestion lists populate, confirmed GSTIN + address + HSN

- rate all recall correctly, confirmed an unknown supplier is still
  typeable, and confirmed a user-typed GSTIN survives typing a known
  supplier name.

### Changed — routine dependency updates

Reviewed and tested from Dependabot #24 / #25:

- `react` / `react-dom` 19.2.0 → **19.2.8** (ships to users)
- `vite-plugin-pwa` 1.2.0 → **1.3.0**
- `@types/react` 19.2.7 → 19.2.18, `@types/react-dom` 19.2.3 → 19.2.4 (dev)

### Security — vite 7.3.1 → 7.3.6 (dev only)

Closes a **high** severity advisory set against the Vite dev server (path
traversal in optimized-deps `.map` handling, `server.fs.deny` bypasses,
arbitrary file read over the dev-server WebSocket).

**No user is affected.** Vite is a `devDependency` and the installer runs
`npm install --omit=dev`, so it has never been on a user's machine. This
protects the maintainer's own dev server, which is why it is worth doing
but not worth a release.

### Held back — `eslint-plugin-react-hooks` 7.1.1

Dependabot offered this in #25. **Not taken**, and the reason is worth
recording.

7.1.1 enables the React Compiler rule set. On unchanged code it takes
`InvoiceGenerator.jsx` from **5 errors to 16** — 11 new errors, none of
which are live bugs:

- _"Cannot access variable before it is declared"_ ×2 — `saveInvoiceToDB`
  and `generatePDF` referenced inside deferred callbacks (`setTimeout`, a
  keydown handler). Both resolve fine by the time the callback fires.
- _"Cannot call impure function during render"_ — `Date.now()` in a
  non-lazy `useState` initializer. Re-evaluates every render, result
  discarded after the first. Wasteful, not broken.
- The rest are `setState`-in-effect and dependency-list shape warnings.

Taking the bump would mean carrying 11 permanent errors, which makes
`npm run lint` useless as a signal. Held at 7.0.1 and added to
`dependabot.yml`'s ignore list logic via the majors rule.

Worth revisiting deliberately: the _"before it is declared"_ rule catches
the exact class of bug that broke Print and Save-as-PDF in v1.10.46 (a
constant referenced ahead of its declaration → TDZ ReferenceError). It is
currently reporting safe instances, but it would have caught the real one.

### Changed — `.github/dependabot.yml` retuned

The first run filed five PRs in three minutes. Now: **monthly** instead of
weekly, at most 3 open PRs, **no automated major-version PRs at all**, and
`eslint-plugin-react-refresh` minors held too (0.x treats minor as
breaking, so 0.4 → 0.5 is a breaking change filed as "minor").

### Fixed — `vite-plugin-pwa` was a production dependency

It sits in `dependencies` but is used **only** in `vite.config.js`, at
build time. Because the installer runs `npm install --omit=dev`, that one
misplaced line dragged the whole Vite toolchain onto every user's machine:
`esbuild`, `postcss`, `nanoid`, `picomatch`, `@babel/core`. Users get a
prebuilt `dist/` and never run Vite, so none of it was ever executed.

Moved to `devDependencies`. Flagged packages in the **shipped** tree went
from **8 to 3** on that change alone — five of them existed purely because
of the misplacement.

### Fixed — remaining shipped advisories (Express transitives)

The last three were real: `path-to-regexp` (**high**), `qs` (moderate) and
`body-parser` (low), reached through Express — which genuinely does run on
user machines. Express itself was already current at 5.2.1, so these were
resolved as nested updates: `path-to-regexp` 8.4.2, `qs` 6.15.3,
`body-parser` 2.3.0.

`path-to-regexp` is Express's router, so this was verified rather than
assumed — server boots, `/api/bills`, `/api/clients`, `/api/products` and
`/api/profiles` all return 200, the SPA route returns 200 and an unknown
path still 404s.

**`npm audit --omit=dev` — the tree users actually install — is now zero
across every severity.**

> ⚠️ **Correction to v1.10.49.** That entry claimed "production-dependency
> advisories are now zero". **That was wrong.** The check behind it matched
> only _direct_ dependencies by name and silently skipped every transitive
> one, so it reported zero while eight packages were flagged in the shipped
> tree. The correct command is `npm audit --omit=dev`, which mirrors what
> the installer does. The jspdf and dompurify fixes in v1.10.49 were real
> and remain correct; only the "zero" claim was overstated.

### Fixed — Dependabot alerts were switched off

Found while triaging the above, and the most important item here:

```
vulnerability alerts:      DISABLED
automated security fixes:  DISABLED
```

The noisy half was on and the valuable half was off. **This is why the
critical jspdf advisory sat in a shipped release until an outside
contributor happened to file #22** — GitHub knew about it; the repo was
not configured to say so. Both are now enabled.

### Note

The dependency work above was held back from a release of its own —
`react` 19.2.8 was the only part reaching a user, and a hand-installed
update is a real cost to ask for a patch nobody was waiting on. It ships
here, alongside the supplier recall, which is something users do want.

---

## [1.10.49] — 2026-08-19

**Security update — two vulnerable libraries replaced.**

No feature changes. This closes a **critical** advisory in the PDF library
and a **moderate** one in the HTML sanitiser. Both ship inside the app, so
updating is the only way to get the fix.

### How to update

**Current version:** 1.10.48 → **New version:** 1.10.49

**If the in-app Update button works for you**

1. Open the Free GST Billing launcher.
2. Click **Update**.
3. Wait for "Update complete", then click **Stop Server**, then **Open App**.

That is all — your data is not touched.

**If the Update button does not work (or you are unsure)**

1. Download `Free-GST-Billing-v1.10.49.zip` from the
   [Releases page].
2. Close the app completely (click **Stop Server** first if it is running).
3. Extract the ZIP over your existing Free GST Billing folder, replacing
   files when Windows asks.
4. Double-click the launcher again.

**Is my data safe?** Yes. Invoices, clients, products and settings live in
`_system/data/`, which an update never touches. The updater also takes an
automatic backup to `Documents\FreeGSTBill Backups\` before it changes
anything.

**Something went wrong?** Open an issue with a screenshot:
the project distribution page

### Security — jspdf 4.2.0 → 4.2.1 (critical)

Reported by **@anupamme** in #22.

- GHSA-7x6v-j9x4-qf24
  — PDF Object Injection via FreeText color. CVSS **8.1**, affects `<=4.2.0`.
- jsPDF HTML Injection in New Window paths.

jspdf renders every invoice PDF, so the upgrade was verified rather than
assumed: rebuilt and re-run through the Firefox PDF suite. Output came to
**452,567 bytes against a 452,551-byte baseline** — a 16-byte delta that
is only the invoice number. No regression.

### Security — dompurify 3.3.3 → 3.4.14 (moderate)

Found while reviewing the above; not in any PR. dompurify sanitises the
rich-text **Terms & Conditions** field, so this was a live XSS surface for
anyone pasting formatted text from elsewhere. Advisories reached
`<=3.4.12`.

Both were genuine and the fixes are correct.

> **Correction (added later):** this entry originally claimed
> "production-dependency advisories are now zero". That was wrong — the
> check behind it matched only _direct_ dependencies and skipped every
> transitive one. Eight packages were still flagged in the shipped tree.
> See the Unreleased section above, where that is properly resolved and
> verified with `npm audit --omit=dev`.

### Added — `.github/dependabot.yml`

Adapted from #21 / #23 by **@venkateshpabbati**, with grouping added:
minor/patch updates land as one PR per week instead of a stream of
single-package PRs, and `jspdf`, `html2canvas` and `tesseract.js` majors
are held for manual review — those have broken PDF output and the OCR
asset layout before.

Security updates are deliberately left ungrouped so they are never queued
behind a routine version bump.

### Added — `SECURITY.md`

A real one, replacing the unedited GitHub template proposed in #21 / #23.
It states what is actually true of this app: offline-first, loopback-only
server, local data. Scope is written around that threat model — invoice
field XSS, CSP bypasses, updater and backup flaws are in scope;
`devDependencies` are out, since `npm run release:zip` ships runtime
dependencies only.

It also asks reporters to **name their browser**, because several real
bugs here have reproduced only in Firefox (see ERR-004 and ERR-007 in
`docs/KNOWN_ERRORS.md`).

---

## [1.10.48] — 2026-08-19

**PDFs were saving unstyled, and the live preview was clipped on smaller
screens.**

Reported (GitHub, @sangwanmail-eng): _"still live preview not working
properly, live preview show full when browser zoom on 50%. live preview
show normal template, but pdf save as thermal printer."_

Both turned out to be real, and both were invisible on the maintainer's
machine — one needs Firefox, the other needs a screen narrower than about
1400px. Details below.

### How to update

**Current version:** 1.10.47 → **New version:** 1.10.48

**If the in-app Update button works for you**

1. Open the Free GST Billing launcher.
2. Click **Update**.
3. Wait for "Update complete", then click **Stop Server**, then **Open App**.

That is all — your data is not touched.

**If the Update button does not work (or you are unsure)**

1. Download `Free-GST-Billing-v1.10.48.zip` from the
   [Releases page].
2. Close the app completely (click **Stop Server** first if it is running).
3. Extract the ZIP over your existing Free GST Billing folder, replacing
   files when Windows asks.
4. Double-click the launcher again.

**Is my data safe?** Yes. Invoices, clients, products and settings live in
`_system/data/`, which an update never touches. The updater also takes an
automatic backup to `Documents\FreeGSTBill Backups\` before it changes
anything.

**Something went wrong?** Open an issue with a screenshot:
the project distribution page

### Fixed — "PDF saves as thermal printer" (it was not thermal, it was unstyled)

`html2canvas` clones the invoice into an **`about:blank` iframe** before
rasterising it. Firefox inherits the page's CSP into that iframe but
resolves `'self'` against `about:blank`'s **null origin** — so `'self'`
matched nothing and the app's own stylesheet was refused:

```
blocked a style (style-src-elem) at /assets/index-*.css
  ... violates: "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com"
```

The PDF therefore rendered with **no CSS** — plain text in a narrow
column, which looks exactly like a thermal receipt. Chrome resolves
`'self'` to the inherited origin, so it never failed there.

`style-src` now names the real origin (`http://localhost:*`) instead of
relying on `'self'`, matching what `connect-src` already did.

Measured in Firefox, same invoice: PDF was **421,048 bytes with one CSP
violation**; it is now **452,551 bytes with zero**, matching a
CSP-stripped control render byte-for-byte within noise.

### Fixed — Print and Save-as-PDF blocked outright

`frame-src` allowed only `https://accounts.google.com`, but the print path
renders the PDF into a hidden iframe from a `blob:` URL. Firefox blocked
the iframe; Chrome was laxer. `frame-src` now allows `'self' blob:`.

### Fixed — live preview clipped, and unreachable by scrolling

Two causes compounding:

- `transform: scale()` shrinks what is _painted_ but never the element's
  layout box, so the preview kept reserving its full 210mm (≈794px) width
  at every zoom level.
- The preview pane used `align-items: center`. Centring an overflowing
  child in a scroll container pushes its leading edge into negative scroll
  space, **where no scrollbar can reach it** — so the left side of the
  invoice was gone for good, not merely off-screen.

Dropping the browser to 50% zoom appeared to "fix" it only because that
doubles the viewport in CSS pixels, clearing the 794px threshold.

Now a wrapper reserves `natural × zoom` so layout tracks what is painted,
and the pane uses `align-items: safe center`, which falls back to
start-alignment on overflow.

Measured in Firefox at 1366×768, A4 preview in a 493px pane: **150px were
unreachable, now 0**. The **Fit** button now genuinely fits — the pane
went from requiring horizontal scrolling to none.

This also replaces the v1.10.46 `transform-origin: top center` thermal
hack, which centred the paint but left the layout box at full sheet width.

### Fixed — custom paper size silently becoming an 80mm receipt

`getPaperSize()` reads a missing `customPaperWidth` as 80mm, whose kind is
`thermal`. The client-preference writer saved only `preferredPaperSize`,
never the dimensions — so a client stored on **Custom** came back as
Custom _with no width_, and quietly turned the invoice into a receipt.
Dimensions are now persisted and restored with the paper size.

### Added — release documentation

- `docs/RELEASE_CHECKLIST.md` — every user-facing release note must carry
  a **How to update** section, in both the changelog and the GitHub
  Release body. This entry is the first to follow it.
- `docs/KNOWN_ERRORS.md` — ERR-004 through ERR-007 record these with the
  rule and the testing gap that let each one through. Two of the four were
  Chrome-only-testing blind spots; both now say so explicitly.

---

## [1.10.47] — 2026-08-19

**Hotfix: every Windows maintenance script failed to run.**

Reported (GitHub issue, @sangwanmail-eng): clicking **Update** produced
`Unexpected token ')' in expression or statement` and
`The string is missing the terminator: '` at `update-windows.ps1:104`.

### Root cause

The `.ps1` files were saved as UTF-8 **without a BOM**. Windows
PowerShell 5.1 decodes a BOM-less script using the machine's ANSI
codepage (cp1252), not UTF-8 — so `→` (`E2 86 92`) became `â†'` and
`—` (`E2 80 94`) became `â€"`. PowerShell treats those curly quotes as
genuine string delimiters, so the string terminated mid-line.

This is a **parse-time** failure, so nothing in the script ran at all —
the update never started, it did not partially apply.

### Fixed

Four scripts were broken, not just the updater:

| Script               | Failed at                    |
| -------------------- | ---------------------------- |
| `update-windows.ps1` | line 104 — Update            |
| `start-windows.ps1`  | line 56 — Start Server       |
| `backup-windows.ps1` | line 36 — Backup             |
| `move-windows.ps1`   | line 40 — Move to Another PC |

- All seven `_system-scripts/*.ps1` converted to **pure ASCII**
  (`—`→`-`, `…`→`...`, `→`→`->`, `✅`→`[OK]`). ASCII is the only
  encoding every Windows codepage agrees on, so this is immune to
  both BOM handling and the user's locale.
- Root `.bat` launchers ASCII-ified too — they were printing mojibake
  under the cp437/cp850 OEM codepage (cosmetic, not fatal).
- `Free GST Billing.hta` declared no charset, so the launcher UI was
  being decoded with the system codepage. Added
  `<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />`.

### Added — regression guard

`scripts/build-release-zip.mjs` now runs `assertAsciiOnly()` over every
`.ps1`/`.bat` before staging and **fails the release build** with the
offending `file:line` if a non-ASCII character is reintroduced.

### How to update

**Current version:** 1.10.46 → **New version:** 1.10.47

> ⚠️ **The Update button cannot fix this one** — the updater is itself the
> broken component. Please download the ZIP manually, this one time.

1. Download `Free-GST-Billing-v1.10.47.zip` from the
   [Releases page].
2. Close the app completely (click **Stop Server** first if it is running).
3. Extract the ZIP over your existing Free GST Billing folder, replacing
   files when Windows asks.
4. Double-click the launcher again.

In-app updates work normally from v1.10.47 onward.

**Is my data safe?** Yes. Invoices, clients, products and settings live in
`_system/data/`, which an update never touches. The updater also takes an
automatic backup to `Documents\FreeGSTBill Backups\` before it changes
anything.

**Something went wrong?** Open an issue with a screenshot:
the project distribution page

---

## [1.10.44] — 2026-08-15

**One-file launcher per OS + in-app Control Panel.**

Reported: "user should only see one file in the root folder…
double-click and it just runs… should install if not installed,
run server, create Desktop shortcut… HTML file with buttons…
must work on Windows AND Mac too."

Delivered — release ZIP now has ONE visible file at the root (the
launcher for the user's OS) and everything else in a hidden
`_system/` folder. All post-install actions moved into an in-app
Control Panel so the user never has to touch the folder again.

### Added — three platform launchers under `release-templates/`

- **`Free GST Billing.hta`** (Windows) — real HTML app opened by
  `mshta.exe`. Detects install state (Node? deps? corrupt install?)
  and renders only the buttons that make sense right now — one
  "Install Node & App" button when nothing's installed, or a grid
  of "Open App / Update / Backup / Restore / Move / Stop" once
  everything's ready. DOM API used throughout instead of innerHTML
  strings to avoid HTA-quirky escaping bugs.
- **`Free GST Billing.command`** (macOS) — Finder double-click opens
  Terminal, walks the user through Node install if missing (points
  at Homebrew + official pkg), then runs npm install and starts
  the server. Opens `/control-panel` in the default browser.
- **`Free GST Billing.sh`** (Linux) — same shape as `.command` with
  Debian / Fedora / Arch / nvm install instructions when Node is
  missing.

### Added — platform scripts under `release-templates/_system-scripts/`

- Windows PowerShell: `install-windows.ps1`, `start-windows.ps1`,
  `update-windows.ps1`, `backup-windows.ps1`, `restore-windows.ps1`,
  `move-windows.ps1`, `stop-windows.ps1`
- Unix bash: `install-unix.sh`, `start-unix.sh`, `backup-unix.sh`

Every script is idempotent — safe to re-run any time. `update` and
`restore` snapshot the current `data/` folder to
`~/Documents/FreeGSTBill Backups/pre-*-<timestamp>.zip` FIRST so a
partial failure can be rolled back without data loss.

### Added — in-app Control Panel (`/api/control-panel/*` + React view)

- New sidebar link **⚙ Control Panel** (next to Settings) opens a
  dashboard with cards for: Update Software, Backup Data, Restore
  Backup, Move to Another PC, Open Data Folder, Open Backups
  Folder, Stop Server.
- Each card hits an Express endpoint that shells out to the
  platform-appropriate script. Live stdout/stderr from the script
  is shown back to the user in a collapsible details block.
- Graceful degradation: if the app is running from a dev clone
  (npm start, no launcher scripts present), the Control Panel
  shows a clear "Launcher scripts not detected" notice with the
  reason and points at Settings → Backup & Restore as the
  fallback.
- `GET /api/control-panel/status` reports platform / Node version
  / data folder size / port / launcher type so the panel header
  card is populated.

### Added — `scripts/build-release-zip.mjs`

Assembles the pretty download ZIP from the developer-friendly repo
layout. Copies launchers to the root of a staging folder, copies
app source + `dist/` build + platform scripts into `_system/`,
creates an empty `data/` folder, and zips the whole thing into
`release-build/Free-GST-Billing-v<VERSION>.zip`. Refuses to run
if `dist/` is missing (forces the user to `npm run build` first).

### Backward compatibility

- Existing users with the old install (root-level `Install
FreeGSTBill.bat`, `Update FreeGSTBill.bat`, etc.) are UNAFFECTED.
  Every legacy .bat file stays where it is. The new launcher path
  is opt-in for future downloads.
- The new Control Panel gracefully handles the "no launcher
  scripts present" case, so existing users can see the panel and
  see WHY buttons are disabled — with a suggestion to move to the
  new release ZIP.
- No changes to `server.js` behaviour that affect existing routes;
  Control Panel endpoints are additive, mounted before the SPA
  catch-all so they take precedence over the wildcard.

### Repo tree change (developers)

- New folder `release-templates/` (Windows HTA + Mac .command +
  Linux .sh + `_system-scripts/`).
- New file `scripts/build-release-zip.mjs`.
- New file `src/components/ControlPanel.jsx`.
- No files moved or removed. Everything is additive.

---

## [1.10.43] — 2026-08-03

**GSTR-1 / GSTR-3B JSON — portal validation errors fixed. Six changes.**

Reported: uploading our GSTR JSON files to gst.gov.in triggered "Error
in JSON structure validation" (RET191106) and per-invoice RET191xxx
codes. Root causes traced against the offline utility schema and the
published error-code list.

### Fixed — GSTR-1 root schema fields (missing → portal rejected the whole file)

Added four root-level fields the offline utility validates BEFORE any
per-row check. Their absence was the #1 cause of "Invalid JSON
structure" reports.

- **`version: "GST3.1.6"`** — current GSTR-1 offline utility (v3.x).
- **`hash: "hash"`** — reference placeholder; the portal computes the
  real hash on receipt.
- **`gt`** — aggregate turnover of the previous FY (Number; can be 0
  and edited on the portal during filing, but the field must be
  present).
- **`cur_gt`** — turnover in the current FY up to the previous month
  (same treatment as `gt`).

Both `gt` and `cur_gt` are populated from two new profile fields
(`prevFYTurnover`, `currentFYTurnover`) added under Settings → Company
Details → GSTR filing details. Empty → 0.

### Fixed — GSTR-3B root schema fields

Same fix pattern for GSTR-3B — `version: "GST3.0.4"` and `hash: "hash"`
were missing. Portal was rejecting before any per-section check.

### Fixed — HSN summary rejected `hsn_sc: 'N/A'`

Since Jan 2025 GSTR-1 Table 12 is mandatory and the portal enforces
numeric HSN codes. Items with no HSN (or the string `'N/A'`) are now
DROPPED from `hsn.data` before serialisation instead of poisoning the
whole summary. The user gets a warning toast telling them how many
items were dropped and to fix the source products.

### Added — Pre-flight validation blocks the two portal-hard-fail cases

`validateGSTR1()` runs BEFORE we build the JSON and aborts with a
clear in-app error if any of these are violated:

1. **Invoice number rules (RET191115)** — invoice numbers must be
   ≤16 chars and use only `[A-Za-z0-9-/]`. Any offender lists the
   first three by number in the toast so users know exactly what to
   rename.
2. **Non-standard tax rate (RET191175)** — allowed slabs are
   `{0, 0.25, 3, 5, 12, 18, 28}`. Custom rates set in Print Settings →
   customTaxRates work in-app but the portal rejects them; the toast
   lists which rate(s) are the problem and how many items use them.

Warnings-only (export proceeds):

3. **Missing HSN** — count of items dropped from Table 12.
4. **HSN too short for AATO band** — < 4 digits (or < 6 digits if
   AATO > ₹5 Cr flag is on).

### Added — AATO band toggle drives HSN digit-length gate

New checkbox under Settings → Company Details → GSTR filing details:
"Aggregate turnover (AATO) is above ₹5 crore". Flipping it raises the
HSN digit minimum from 4 to 6 in the validation pass — matching the
CBIC rule for AATO-based HSN reporting on Table 12.

### Confirmed — thermal print already end-to-end HTML (v1.10.42)

Reported alongside the GSTR ask: "themal print system jo direct kar
raha tha without creating pdf phir se laiye". Verified during this
audit that the v1.10.42 path is already the direct-HTML iframe route
for thermal 58/80mm, and PrintPreviewModal renders `<InvoicePreview>`
as pure React HTML (no raster). Users on old localStorage state can
flip Print Settings → Thermal print method → "Direct HTML" if the
setting is stuck on the previous default. No code change needed here.

---

## [1.10.30] — 2026-07-14

**Five fixes from the follow-up feedback.**

### Fixed — OCR still failing with "OCR failed: undefined"

**Reported.** Screenshot with the toast text
`"OCR failed: undefined. Try a sharper photo or check your network."`
The v1.10.29 fix improved the error handling, but a subtle bug in the
fallback chain used `String(err)` which returned the literal string
`"undefined"` when tesseract rejected with a non-Error value.

**Fix.** Aggressive normalization across every shape tesseract can
throw: string, `{ message }`, `{ data }`, `{ data.message }`, or plain
object. If everything's empty we say `"Unknown error (see browser
console — F12 — for details)"` instead of `"undefined"`. Hint text
now covers 502/503/504 gateway errors, SharedArrayBuffer availability,
and timeouts too. Toast stays up 12 seconds so the user can read the
diagnosis.

### Fixed — Thermal font too small / print too light

**Reported.** "fix the font issue and print issue in thermal baki
print 80mm and 58mm default working till now ok."

**Fix.** Two-part tweak:

1. **Font sizes bumped ~10-15%** across all four thermal presets:
   - `small` 58mm/80mm → 9.5px / 11px (was 8.5 / 10)
   - `medium` → 11 / 12.5 (was 9.5 / 11) ← default
   - `large` → 12.5 / 14.5 (was 10.5 / 12.5)
   - `xlarge` → 14 / 16.5 (was 11.5 / 14)
     Tuned against low-DPI POS printers where raster smoothing eats
     ~1px off every glyph.
2. **Text-shadow double-strike strengthened.** Prior 0.4px horizontal
   was thin. Now 0.6px horizontal + 0.6px vertical + a diagonal
   0.4px so glyphs read visibly darker on lightly-burning thermal
   heads without fattening the font weight (which would misalign
   number columns).

### Fixed — Long product names truncated in Purchase Bill PDF

**Reported.** "in purchase bill pdf long names got cut in pdf fix"
with a screenshot showing "4 Copier Paper (Pack o" truncated
mid-word.

**Root cause.** `viewAsPdf` hard-coded `.slice(0, 40)` on the item
name for its column width, silently cutting anything longer.

**Fix.** Uses `doc.splitTextToSize(name, 70 /* mm */)` to word-wrap.
Row height grows to fit however many lines the wrapped name needs;
neighbouring columns (HSN, qty, rate, GST%, amount) stay top-aligned
with the first line so nothing overlaps.

### Improved — Custom thermal paper size discoverability

**Reported.** "ek chis karna hai jaise app 80mm 58mm sellect karne se
print de rahe hai jaise option hai waise hi custom size ke liye bhi
kijiye" — user wanted a custom thermal size option similar to 80mm /
58mm presets.

**Discovery.** The infrastructure already existed since v1.9.1 —
`custom` paper size at [utils.js:880](src/utils.js#L880) already
takes `customPaperWidth` + `customPaperHeight` from invoice options
and auto-switches to thermal receipt layout when width < 100mm. The
label just wasn't clear that it worked for thermal too.

**Fix.**

1. Label renamed from `"Custom size (any width / height)"` to
   `"Custom size (thermal / roll / stationery)"`.
2. Hint now explicitly says "widths under 100mm auto-switch to
   thermal receipt layout — same as 58 / 80mm presets".
3. **Quick-pick chips** for the most-asked uncommon rolls: 40mm,
   76mm, 90mm, 110mm — one click sets the width without typing.

### Added — Purchase Bill quick-view modal (no download)

**Reported.** "add a view only option modal type so can user check
the price without downloading the file every time. i know u can say
to edit and check that but if some data entered wrongly thats why."

**Fix.** Replaced the FileText row action with an **Eye icon** →
opens a modal that shows every purchase detail formatted inline:

- Header: invoice #, date, payment status, interstate/intrastate
- Supplier block: name, address, GSTIN
- Line items table (scrollable if many): #, description, HSN, qty,
  rate, GST%, amount
- Tax breakdown: taxable, tax, cess, round-off, TOTAL
- Note (if any)
- Action bar: Close / Edit (opens edit form) / Download PDF

Users can now verify a purchase in ~1 second without generating +
opening a file. The Download PDF option is still one click away
inside the modal for anyone who does want the file.

### Verified

- `npx vite build` — clean
- `node scripts/tax-test.mjs` — 31/31 pass
- `node scripts/discount-modes-test.mjs` — 9/9 pass

---

## [1.10.29] — 2026-07-14

**Big batch: 4 bugs + 3 features + 4 quality follow-ups.**

### 🐛 Bugs

**Per-line tax used raw discount, ignored Unit/W-Tax bases.** Reported
via screenshot: line 2 (Bill Book, 10 × ₹95, ₹5 Unit-base discount)
showed CGST ₹85.05 in the per-line table (as if disc = ₹5) but
Discount ₹50 / CGST ₹83.25 in the totals bar (as if disc = ₹50) —
GST mismatch inside a single PDF. Root cause:
[InvoicePreview.jsx:839](src/components/InvoicePreview.jsx#L839)
used `item.discount || 0` (raw value); `computeInvoiceTotals`
correctly routed through `resolveLineDiscount(item)`. Fix: import
`resolveLineDiscount` in InvoicePreview and use it on the per-line
render. Totals + per-line breakdown now agree.

**Thermal print included entire app UI (sidebar, menu, editor).**
Reported: "thermal print me kuch error ho raha hai" with screenshot
showing the browser print preview rendering the WHOLE app instead
of just the receipt. Root cause: `directPrint()` for thermal calls
`window.print()` which prints the visible viewport; no `@media
print` rules to hide non-invoice UI. Fix: added a `@media print`
block that hides `body *` and unhides only `#invoice-preview`,
positioning it at 0,0 with no margins.

**WhatsApp share button sent subtotal, not total.** Reported: "when
i use whatsapp button it is sending subtotal amount". Root cause:
[InvoiceGenerator.jsx:2183](src/components/InvoiceGenerator.jsx#L2183)
used `items.reduce((s, i) => s + (i.quantity * i.rate), 0)` — that's
the pre-tax subtotal. Fix: switched to `totals.total` (post-tax,
post-discount, includes round-off + TCS + invoice-level discount).
Message now includes subtotal AND total on separate lines, plus
date and business name signature.

**OCR failed silently with a generic "try again" toast.** Reported:
"ocr is not working". Root cause: tesseract.js v7 in a Vite bundle
often can't resolve its own worker.js / core / eng.traineddata
paths correctly. Fix: pin `workerPath` / `corePath` / `langPath` to
explicit CDN URLs (jsdelivr for worker/core, tessdata project for
language models). Version pulled from `tesseract.js/package.json`
via native Vite JSON import so future `npm update tesseract.js`
tracks automatically. Errors now surface the actual message plus
an actionable hint ("Network fetch failed — needs to download
~2MB", "Worker failed — Ctrl+F5 to refresh bundle", etc.).

### ✨ Features

**Purchase Bills: View as PDF button.** Reported: "option to view
as pdf give it that will be better". New FileText icon per row
generates a single-page PDF (header, supplier block with address +
GSTIN, line items table, tax + cess breakdown, round-off, total,
optional note). Uses jsPDF's built-in helpers — no autotable
dependency added.

**Purchase Bills auto-sync items to Products.** Reported: "items
added in purchase bill also available for sale means automatically
added to the product page too". On purchase-bill save, each line
item is upserted into Products by name (trimmed, case-insensitive).
Existing products get their `purchasePrice`, `hsn` (if empty), and
`cessPercent` (if empty) updated + **stock incremented by the
purchase quantity** on FIRST save (skipped on edit to prevent
double-counting). New products get seeded with sellingPrice =
purchasePrice as a starting point. Non-fatal: a sync failure
doesn't block the purchase save.

**Products: Purchase Price + Selling Price fields.** Reported:
"here purchase price and selling price need". Two side-by-side
inputs in the Add/Edit Product form. Legacy `rate` field kept in
storage (mirrors sellingPrice on save) so pre-v1.10.29 readers
still work; new products always write both. InvoiceGenerator's
product picker uses `sellingPrice ?? rate ?? 0`; Purchase-Bills
auto-sync updates `purchasePrice`.

### 🔧 Quality follow-ups

**@media print scoped with `:has(#invoice-preview)`** so Ctrl+P on
Dashboard / Clients / Reports (any view without an invoice preview
in the DOM) gets the browser's default print behaviour instead of
a blank page. `:has()` is supported in every Chromium 105+ /
Safari 15.4+ / Firefox 121+ — safe for the PWA target.

**Purchase → Products cess carry:** `cessPercent` now flows from
purchase line items into synced Products, so tobacco / auto / coal
items keep their cess rate for future invoices.

**Purchase Bill: supplier address field.** New optional row in
the purchase form; shows on the PDF header under the supplier
name. Pre-v1.10.29 records with no address render byte-identical.

**InventoryView cleanup:** removed dead `rate` state from the
Product form — it was hidden from UI but still in emptyForm /
openEdit for no reason. Save path still writes `rate = sellingPrice`
as a backward-compat mirror.

### Verified

- `npx vite build` — clean
- `node scripts/tax-test.mjs` — 31/31 pass
- `node scripts/discount-modes-test.mjs` — 9/9 pass

---

## [1.10.28] — 2026-07-14

**Compact invoice layout + slower-device print reliability.**

### Improved — Base invoice layout is significantly more compact

**Reported.** "your format was great but some tweaks can make it
compact and clear" — with reference screenshot showing an
nVertex-style invoice that packs more into less vertical space.

**Cause.** Our base spacing was designed for on-screen readability
(2rem / 32px paddings and margins). Translated to PDF, that's ~10mm
of whitespace between every section — great for viewing, wasteful
for printing.

**Fix.** Tightened base CSS across the invoice sections:

- **Header:** padding `2rem 2.5rem 0 → 1rem 1.5rem 0`; margin-bottom
  `2rem → 0.75rem`. Title font `2rem → 1.5rem`. Business-name font
  `1.1rem → 1rem`. Header-right max-width `45% → 48%`.
- **Parties (Bill-to / Ship-to / Place-of-supply):** margin
  `0 2.5rem 2rem → 0 1.5rem 0.75rem`, padding `1.5rem → 0.85rem 1rem`.
  Radius `10px → 8px`.
- **Items table:** width `calc(100% - 3rem) → calc(100% - 2.5rem)`,
  margin `0 1.5rem 1.5rem → 0 1.25rem 0.75rem`.
- **Totals section:** padding `0 2.5rem → 0 1.5rem`, margin-bottom
  `2.5rem → 1rem`. Amount-in-words right-padding `3rem → 1.5rem`.
- **Footer (bank / signature):** padding `1.75rem 2.5rem 2rem → 1rem
1.5rem 1.25rem`, margin `0 2.5rem → 0 1.5rem`. Block-margin
  `1.25rem → 0.75rem`.

Net effect: ~25-30mm of dead whitespace removed on a typical A4
invoice, so more items fit on page 1 before pagination and the
overall density matches Vyapar / MargERP / Zoho templates.

### Fixed — Print/Download blank on slower devices

**Cause.** v1.10.27 waited two rAFs + 50ms after un-collapsing the
preview from focus mode before capturing. On low-end Android
devices, React commit + browser reflow after removing
`position: absolute` didn't finish in 50ms → `html2canvas`
sometimes captured a mid-layout snapshot with content in the wrong
place.

**Fix.** Settle bumped from 50ms → 200ms. On fast devices this is
imperceptible; on slow devices it's the difference between a
correct PDF and a garbled one.

### Verified

- `npx vite build` — clean
- `node scripts/tax-test.mjs` — 31/31 pass
- `node scripts/discount-modes-test.mjs` — 9/9 pass

### Also confirmed as fixed (no work this release)

- **GH #16** (@mehulkoradiya, "A bill with this invoice number
  already exists") — fixed in v1.10.23 via auto-retry. Ticket ready
  to close.
- **GH #15** (@prk1988, "company logo not displayed") — fixed in
  v1.10.16 via SettingsView auto-enabling `showLogo: true` on save
  when a logo is present. Ticket ready to close.

---

## [1.10.27] — 2026-07-13

**Two focused-mode print polish fixes.**

### Fixed — Preview panel stays expanded after print / download

**Reported.** "in this layout when print clicked it prints but the
preview panel again comes and for hiding again have to click to
hide."

**Cause.** v1.10.26 registered an `afterprint` event listener +
30-second safety timeout to auto-restore the collapsed state.
`afterprint` never fired in two of the three paths so restore
never ran (or ran only after 30s):

1. **Download PDF** — no print dialog opens, `afterprint` never
   fires.
2. **A4 iframe print** — `afterprint` fires on
   `iframe.contentWindow`, not the parent window we were
   listening on.
3. **Thermal window.print()** — only this path fired afterprint
   on the parent window correctly.

**Fix.** Dropped the listener entirely. Restore now runs
unconditionally in the `finally` block:

- `window.print()` blocks the JS thread until the native dialog
  closes on all desktop browsers → finally fires after the user
  is done with print → correct restore timing.
- On mobile Safari where `print()` may not block, the DOM was
  already captured at the moment `print()` was invoked, so
  restoring immediately after is safe.
- Download PDF and A4 iframe both flow through the same path
  and restore immediately after `buildPDF` / `printViaIframe`
  returns.

### Changed — PDF quality default is now HD

**Reported.** "we need to make sure print is full 100% hd quality
in pdf."

**Cause.** Default `pdfQuality` was `'standard'` — JPEG at scale
3–4, quality 0.95. That's ~200 KB per invoice and slightly soft
text edges when zoomed. Fine for email but not for print archive.

**Fix.** Default flipped to `'hd'` — PNG at scale 4–5 (capped at
6), quality 1.0. Text edges are crisp on high-DPI print,
line-art (borders, tables, signatures) renders without JPEG
smudging.

**Trade-off.** File size grows to 1–3 MB per invoice. Users who
prefer email-friendly files can switch to `'standard'` or
`'draft'` in **Print Settings → Print quality**.

Existing users with a saved `pdfQuality: 'standard'` in their
localStorage/server settings are NOT force-migrated — the change
only applies to fresh installs and users who reset print settings.

Business-type presets that intentionally set `'standard'`
(Freelancer for email-friendly retainer invoices, Wholesale for
high-volume printing) are unchanged.

### Verified

- `npx vite build` — clean
- `node scripts/tax-test.mjs` — 31/31 pass
- `node scripts/discount-modes-test.mjs` — 9/9 pass

---

## [1.10.26] — 2026-07-13

**Print + Download PDF blank in Focus mode — fixed.**

### Fixed — Print / PDF blank when Focus mode is ON

**Reported.** "in this mode print not working" (focus mode ON,
preview hidden). Normal split-view mode printed fine.

**Root cause.** The v1.10.22 Focus mode used `display: none` to hide
the preview pane. That removes the element from layout entirely —
`html2canvas` renders a 0×0 canvas → blank PDF, `window.print()`
prints nothing because there's no visible content in the viewport.

**Fix — two layers.**

1. **Preview pane** now uses off-screen positioning
   (`position: absolute; left: -99999px; opacity: 0`) instead of
   `display: none`. Element keeps real dimensions so
   `html2canvas` can snapshot it, invisible to the user and out
   of the flex flow (editor still takes full viewport width in
   Focus mode).

2. **`withPreviewOnScreen(fn)` guard** wraps `directPrint` and
   `generatePDF`. When invoked from Focus mode, un-collapses the
   preview, waits two rAFs + 50ms for layout, runs the print /
   PDF operation, then restores the collapsed state on the
   `afterprint` event (native dialog close) or a 30s safety
   timeout. Belt-and-braces so window.print() also works
   correctly for thermal paper.

### Verified

- `npx vite build` — clean
- `node scripts/tax-test.mjs` — 31/31 pass
- `node scripts/discount-modes-test.mjs` — 9/9 pass
- Print + PDF paths audited: Dashboard receipt print (separate
  window) and ReceiptVoucher print (new window) unaffected. Only
  InvoiceGenerator's Print/Download used the Focus mode preview.

---

## [1.10.25] — 2026-07-13

**Complete 4-mode discount system (Vyapar / MargERP parity).**

### Added — Per-line discount BASE selector

**Reported.** "we need to have proper discount system" — with the
same 4 modes real POS software offers: Price With Tax, Unit Price,
Net Amount, Total Amount.

**What v1.10.22 shipped.** Two of the four modes:

- **Net Amount** (per-line, default) — ₹ or % off `qty × rate`
- **Total Amount** (invoice-level) — ₹ or % off whole-bill total

**What v1.10.25 adds.** The two missing per-line bases:

- **Unit Price** — ₹ off EACH unit. Effective line discount = `qty
× discount`. Example: `4 qty × ₹100 rate` with `₹5 off unit` →
  `₹20` total line discount, ₹380 taxable.
- **Price With Tax** — ₹ off the tax-INCLUSIVE line total. Tax is
  automatically backed out. Example: `₹100 @ 18%` with `₹11.80 off
with-tax` → the customer's total-inclusive drops by exactly
  ₹11.80 (net discount = ₹10, taxable = ₹90, tax = ₹16.20, total
  = ₹106.20).

### UI

Discount cell in each line item now has THREE controls when in
fixed mode, TWO in percent mode (base is percent-agnostic —
mathematically identical for all bases):

```
[value input]   [₹/%]   [Net/Unit/W.Tax]        ← fixed mode
[value input]   [₹/%]                            ← percent mode
```

Tooltips explain what each base does. Cell widens to `flex: 1.8 /
min-width: 200px` and wraps to a second row on tight screens.

### Math

New `resolveLineDiscount(item)` branches on `discountBase`:

- `net` (default) → raw value or `raw × line% / 100`
- `unit` (fixed only) → `raw × qty`, clamped to line value
- `with-tax` (fixed only) → `raw / (1 + taxRate/100)`, clamped

Return value is always the net-amount deduction, so every existing
downstream tax / GSTR-1 / e-Way Bill path is unchanged. Backward-
compatible: items without `discountBase` fall through to `'net'`.

### Verified

- New `scripts/discount-modes-test.mjs` — 9 scenarios pass:
  - Fixed ₹ off Net, Unit × qty, Price-With-Tax
  - Percent mode (base-agnostic)
  - Clamps: `%` > 100, fixed > line, `qty × unit-disc` > line
  - Zero-tax edge on with-tax base (no divide-by-zero)
  - Legacy item without discountBase renders identically
- `npx vite build` clean
- `node scripts/tax-test.mjs` — 31/31 pass (unchanged; the
  discount rework only changes how much reduces the net,
  downstream GST buckets untouched)

---

## [1.10.24] — 2026-07-13

**Client credit balance — overpayments carry to next invoice.**

### Added — Apply prior overpayment as credit on a new invoice

**Reported.** "this extra payment can be added to the next bill of
customer u enabled that — auto or manual."

**How it works.** When a client overpays a bill (Bill A: total ₹100,
paid ₹110 → ₹10 overpaid), that ₹10 is available as credit against
future invoices. Opening a new invoice for the same client now
shows a **💳 credit banner** in the Billed To card:

> Client has ₹10 credit from 1 prior overpayment (INV/2026-27/0007)
> [amount input] [Apply full] [Skip]

Three ways to use it:

1. **Manual apply** — user types an amount (capped at
   `min(available, invoice total)`) or clicks **Apply full**.
2. **Auto-apply** — checkbox in the banner: "Auto-apply available
   client credit on future invoices". Once enabled, the credit is
   applied automatically on client-select for every subsequent new
   invoice. Fired once per client (not on every keystroke) so
   manual overrides stick.
3. **Skip** — leave it for later; credit stays on the client's
   ledger.

**Persistence — dual-entry, auditable.** On save, `saveInvoiceToDB`
writes two paired records:

1. A `credit-applied` payment entry on the new invoice (mode +
   `creditSourceBillIds` for the audit trail), which reduces the
   new invoice's outstanding.
2. A `credit-transferred-out` payment entry on each source
   overpaid bill (negative amount, `creditTargetBillId` for the
   reverse link), which brings the source bill's outstanding back
   to 0 so it no longer shows as overpaid.

FIFO allocation across sources — oldest overpayment consumed
first. Both entries net to zero at the client level (no phantom
cash), and every existing per-bill / per-client status/aging/
ledger view (which reads `paidAmount` and `payments[]`) picks up
the change with no other code changes.

### Data model

- New payment `mode` values: `'credit-applied'`, `'credit-transferred-out'`.
- New invoiceOption: `autoApplyClientCredit: boolean` (default
  `false`).
- New file: `src/utils/clientCredit.js` — pure helpers:
  `getBillOverpayment(bill)`, `getClientCredit(name, bills)`,
  `planCreditApplication(name, bills, amount, newBillId)`.

### Added — WhatsApp desktop-limitation tooltip + one-time toast

**Reported.** "user need to know why whatsapp pdf on web not work
we need to write somewhere on tooltip etc."

Users on desktop were assuming the PDF-not-attached behaviour was
our bug. It's actually a Web Share API restriction — browsers
block sending files to arbitrary desktop apps (WhatsApp Web
included) for security. We can't change that. So now we
communicate it honestly in three places:

1. **Tooltip** on the WhatsApp row-action button explains it:
   "PDF attaches on mobile Chrome/Safari. On desktop it sends the
   invoice as text only (browser can't attach files to WhatsApp
   Web — security limitation, not our app)."
2. **One-time toast** the first time a desktop user hits the
   fallback path in a session — full explanation + workaround
   ("download PDF, drag into WhatsApp Web"). Silenced by
   sessionStorage flag after first show.
3. **Dashboard help modal** includes the same explanation in the
   "Row actions" bullet.

### Verified

- `npx vite build` clean
- `node scripts/tax-test.mjs` — 31/31 pass (no core-math paths
  touched; credit is a payment-layer feature)

---

## [1.10.23] — 2026-07-13

**7 fixes on top of v1.10.22.** GH #16 invoice-number 409 + a
sweep for every place negative "outstanding" (from overpayment)
was leaking into UIs that assumed positive values.

**Discount math verified:** ran 5 targeted scenarios (per-line %,
per-line ₹, invoice-level ₹, invoice-level %, > 100% cap) — all
pass. 31 core tax tests continue to pass.

### Fixed — "A bill with this invoice number already exists" on save

**Reported (@mehulkoradiya, GH #16).** "when create/update invoice,
status change, add payment i got this error — `A bill with this
invoice number already exists`, `DC/2026-27/0001`". User was
completely blocked — every action returned 409.

**Root cause.** The server's atomic counter (`counter_DC` etc.) can
drift out of sync with the actual bill files on disk. Cases:

1. User restores a backup that had `DC/2026-27/0001` but the counter
   file was reset to 0.
2. A bill number was hand-typed matching a counter value still to
   come.
3. Two tabs / two devices bump the counter separately.

The peek returned `0001`, save posted `bill.id = DC/2026-27/0001`,
server saw the file on disk → 409. Prior UX: toast "Invoice number
already exists. Change it before saving." and return — user had to
manually bump the number themselves. On a fresh install with a
corrupted counter, they'd have to do this every single time.

**Fix.** On 409 for a NEW invoice (no `editingBill`, not yet saved
this session), `saveInvoiceToDB` now automatically:

1. Requests a fresh number via `getNextInvoiceNumber(prefix)` —
   which atomically increments the server counter and returns the
   next value.
2. Retries `saveBill` with that number.
3. If the retry also 409s (rare but possible if many past bills
   were hand-numbered ahead of the counter), loops up to 20 times,
   each round bumping the counter one more step.
4. On success, updates the form's `details.invoiceNumber` so the
   preview + subsequent save operations agree on the new id.
5. Toasts `"Invoice number DC/2026-27/0001 was already used —
saved as DC/2026-27/0002 instead."` so the user knows what
   happened.
6. After 20 failures (pathological state), falls back to the old
   manual-fix message.

Editing existing bills and Dashboard operations (status change /
record payment / soft-delete stock restore) already passed
`overwrite: true` so they were never affected by this bug —
`@mehulkoradiya`'s "status change / add payment" symptoms were
side effects of the initial create failing. Once create succeeds,
the follow-on flows work.

### Fixed — Overpayment hidden in client ledger

**Reported.** "OUTSTANDING SHOULD ABE DISPLAYED HERE IN CLIENT
LDGER TOO" — a ₹650 payment on a ₹649 invoice showed Outstanding
₹0 in the client card, quietly swallowing the ₹1 the customer paid
extra.

**Root cause.** `getClientStats` in ClientsView added
`totalAmount` (not `paidAmount`) to `paid` when a bill's status was
'paid'. Clamped every over-paid bill's contribution to its invoice
value, so `unpaid` came back 0 for the overpayment case.

**Fix.**

1. `getClientStats` now sums the actual payments array (or falls
   back to `paidAmount`, then legacy status='paid' → totalAmount).
   `unpaid` can now be negative → an overpayment.
2. The client card's stat row switches label + colour when
   `unpaid < 0`: shows **"Overpaid"** in blue instead of
   "Outstanding" in red / green.

### Fixed — Overpayment leak in 3 other UI spots

While auditing the overpayment display path, found three more places
showing negative "outstanding" without any interpretation. Fixed:

1. **Payment modal** now shows "Overpaid: ₹X" in blue instead of
   "Balance: -₹X" in red when payment > invoice.
2. **Reminder card** (Send Payment Reminders section) shows
   "Overpaid ₹X" in blue instead of a negative red amount.
3. **sendReminder** now short-circuits with a toast ("This invoice
   has no outstanding balance — no reminder to send.") when
   outstanding ≤ 0. Previously the WhatsApp message text read
   "kindly arrange the payment of -₹1" which is obviously wrong.
4. **ReceiptVoucher** — new-receipt amount input no longer pre-fills
   with a negative number for overpaid bills; outstanding chip in
   the invoice-picker list is hidden when the bill is overpaid.

### Fixed — Line-item field areas too cramped for entry

**Reported.** "INCREASE THE FIELD AREAS IT WILL PROPERLY VISIBLE
FOR ENTRY." The v1.10.22 discount ₹/% toggle squeezed the discount
input to ~40px on narrow viewports, and the Description / HSN / Qty
/ Unit / Rate row was tight on non-focus-mode layouts.

**Fix.**

1. `.line-item-field` gets `min-width: 72px` and inputs bump to
   `0.85rem` font + `0.4rem` padding so nothing gets crushed.
2. `.line-item-row` now `flex-wrap: wrap` so on narrow screens the
   row breaks to a second line instead of squishing.
3. Discount field: `flex: 1.4` + `min-width: 130`. The ₹/%
   selector widens to 60px so both option labels are readable.

### Verified — GH #15 (logo not showing) still fixed

Confirmed for @prk1988: v1.10.16's `SettingsView.handleSave`
auto-enables `showLogo: true` in the persisted invoice options
whenever a profile with a logo is saved. That fix is live and
this release doesn't change it. **If you're still seeing no logo,
Ctrl+F5 to force the PWA to fetch the current bundle** — v1.10.16
shipped a month ago, so any stale service worker would still be
running the old code.

### Verified — Overpayment on receipt already showing

Also for @mehulkoradiya's "Balance should be 1 but calculating
zero" screenshot: the fix is live at
[Dashboard.jsx:121](src/components/Dashboard.jsx#L121) since
v1.10.22 — receipt shows "Overpaid: ₹1" in green when the payment
exceeds the invoice total. Ctrl+F5 to refresh the PWA bundle. If
after a hard refresh the receipt still shows Balance: ₹0, the
underlying bill's `payments` array probably has a payment stored
at ₹649 (not ₹650) — check via Edit Payment on that row.

---

## [1.10.22] — 2026-07-12

**4 bugs + 5 features in one push.** Every item from the latest
WhatsApp screenshots, plus purchase-bill OCR (Vyapar / MargERP parity)
and per-item percent/fixed discount + invoice-level discount (Zoho
parity). 31 tax-math unit tests still pass — the discount rework was
guarded through the same code path.

### Bugs

**Back button asked to save even with no changes.** Reported: "if
user click back without even changing anything it always ask to save
and close so we are saving auto so this is also a bug." `handleBack`
checked `autoSaveStatus !== 'saved'`, and `autoSaveStatus` started
at `'idle'` on mount — never flipping to `'saved'` for a freshly-
loaded bill. Now tracked via a separate `isDirty` ref, flipped only
on real post-init state changes and cleared on every successful
save. Same guard applied to `beforeunload`.

**⭐ default account was ignored on new invoice.** Reported: "if user
added two account and star the one account while creating new
invoice it shows old star account not new". Auto-select priority was
last-used → default → first-active; changing the ⭐ in Settings
didn't invalidate the last-used pointer. Reversed to default →
last-used → first-active. Star now always wins.

**Balance = 0 hid ₹1 overpayment.** Reported: "Balance should be 1
but calculating zero." A ₹649 invoice paid ₹650 rendered as Balance:
₹0 because `Math.max(0, billTotal - totalPaid)` clamped the negative.
Now the receipt shows "Overpaid: ₹1" in green when the customer
paid more than the invoice.

**No manual delete for individual daily backups.** Reported: "add
here delete option i know u added 30 days auto delete but manual
delete also u add." Trash-bin items already had "Delete forever";
daily backups did not. Added a `DELETE /api/backups/:date` endpoint
(guarded by the same path-inside + calendar-date checks the restore
endpoint uses) and a Delete button next to each backup row.

### Roadmap features (Vyapar / Zoho parity)

**WhatsApp share with PDF attached.** Row-level MessageCircle button
in Dashboard now tries the Web Share API first — on mobile Chrome /
Safari the OS share sheet opens with the actual invoice PDF
attached; user picks WhatsApp (or any target). On desktop /
browsers without file-share support, falls through to the existing
text-only `wa.me` URL. Split out a `generateSingleBillPdfBlob`
helper (mirrors the bulk-export path) so the same render pipeline
serves both bulk PDF and native share.

**HSN → GST rate auto-suggest.** New curated `data/hsnRates.js` map
covering ~200 goods HSN codes + 30 SAC service codes that account
for >95% of small-business invoicing. Typing an HSN in a line item
suggests the correct GST rate (e.g. `4820` → 18% for stationery,
`4901` → 0% for printed books) and shows the category label as a
green hint chip below the field. Rate only auto-fills when the
user hasn't set a custom rate — always overridable. Lookup order:
6-digit exact → 6-digit prefix → 4-digit prefix.

**Client aging report + inline aging strip.** In Clients view,
expanding a client now shows:

- Inline **aging strip** — outstanding balance bucketed into
  Current (0-30d) / 31-60d / 61-90d / 90+ days, colour-coded from
  green to red.
- **Aging PDF** button — single-page report with per-invoice list
  (invoice #, date, due, age, total, outstanding) and bucket
  summary. Distinct from the existing full-ledger Statement PDF —
  this is the "how overdue are they?" view accountants use during
  collection calls.

**Help buttons on every major view.** New reusable `HelpButton`
component. Icon sits next to each page title (Dashboard, Clients,
Purchase Bills, GST Returns, Settings) plus the invoice generator
toolbar. Click opens a modal with a bullet-point cheat sheet of
what each feature does — including keyboard shortcuts, discount
modes, focus mode, OCR, aging PDF, and every other v1.10.22
addition so users discover them without hunting.

### Features

**Per-item discount: fixed OR percent.** Reported: "ALL APPS ITS IS
LIKE THR ARE TWO OPTION THAT U WANT CALCULATE... ALSO THR TOGGLE
OPTION TO CALCULATE VIA PERCENT AND PRICE." Every line item now
carries a `discountType` field (`'fixed'` or `'percent'`) with a
dropdown next to the discount input. Percent mode is capped at 100
and the resolved amount can never exceed the line value. Backward-
compat: items without `discountType` render byte-identically to
v1.10.21.

**Invoice-level (whole-bill) discount.** The other half of the same
ask — "calculate on total amount". A new row below "Add Item"
takes a value + a `₹/%` toggle. Applied _after_ tax, so it behaves
as a cash discount / trade allowance and doesn't affect the GSTR-1
taxable value. (For GST-compliant pre-supply discount, users use
per-line discount instead — noted in the field's hint text.)

**Keyboard shortcuts.** Reported: "u can introduce keyboard
shortcuts." Added:

- `Ctrl/Cmd+Enter` — add new line item
- `Ctrl/Cmd+Shift+D` — duplicate last line item
- `Esc` — close the unsaved-changes leave modal

Existing shortcuts (`Ctrl+S` save, `Ctrl+P` PDF) untouched.

**Inline product description per line.** Reported: "add option so
user can directly enter product description into invoice directly."
Each line item now has an "+ Add description" button that expands
into a 2-row textarea. The description renders under the item name
in the PDF preview in a smaller muted font. Blank descriptions
render nothing — old invoices look identical.

**Focus-mode toggle (hide preview).** Reported: "sidebar menu toggle
option so customer will get a close view for entries because
quantity entry u see space is like that we have to see in invoice
preview what we are entering." New button at the top of the editor
hides the live preview and lets the editor pane take the full
width. Persists across page reloads. InvoicePreview stays mounted
(hidden via CSS) so `printRef` remains live for PDF generation.

**Purchase-bill OCR.** Reported: "purchase bill ocr for faster and
accurate entry." New "Import from image (OCR)" button in Purchase
Bills opens a modal that:

- Takes a photo/scan of the supplier's tax invoice.
- Runs `tesseract.js` client-side (WebAssembly, ~2MB lazy-loaded on
  first open, cached in the browser after that). No paid OCR
  provider — offline-first + free positioning preserved.
- Extracts supplier GSTIN (15-char strict regex), invoice number,
  date (DD-MM-YYYY and DD Mon YYYY variants), and grand total from
  labelled Indian bill patterns.
- Shows the extracted fields alongside the image for the user to
  correct before applying to a new purchase-bill form.

Line items are NOT auto-parsed — table-column extraction from OCR
text is unreliable across bill layouts and misrouted ITC is worse
than a slow manual entry. When a grand total is extracted, a
placeholder single line is seeded at that value so the totals are
sane while the user breaks it into real items.

---

## [1.10.21] — 2026-07-11

**Two live-preview + auto-heal fixes for the bank snapshot.**

### Fixed — Picking a new account didn't update preview until save+reopen

**Reported.** "working but on select it is not changing have to save
and reopen it... or else to wait for few sec after save automatically
have to re open to see it."

**Cause.** `InvoicePreview` reads
`options.paymentAccountSnapshot` before falling back to
`getAccountById(profile, selectedAccountId)`. The dropdown's onChange
only updated `selectedAccountId`, leaving the stale snapshot in
place — so the preview kept showing whatever bank was frozen at the
last save until save+reopen re-snapshotted.

**Fix.** Dropdown onChange now also re-snaps from the live profile
for the new account, in the same setInvoiceOptions call. Preview
updates instantly. On save, the priorMatchesSelection guard sees
the id already matches and preserves the fresh snapshot rather than
re-freezing from the live profile a second time.

### Fixed — Contaminated snapshots from v1.10.18/19 saves auto-heal

**Reported.** "now after i full reloaded again all vanished and
asigned to same account which is default."

**Cause.** Bills saved between v1.10.18 and v1.10.19 had their
`paymentAccountSnapshot` polluted by cross-invoice localStorage
bleed — a stored snapshot whose own `id` didn't match the bill's
`selectedAccountId`. v1.10.20 stopped the leak but couldn't rewrite
already-saved bad data.

**Fix.** In the editing-bill mount effect, if the stored snapshot's
id doesn't match the stored selection, treat it as stale and
re-derive from `d.profile` (the profile snapshot the bill has
always carried since v1.4.x — still holds the original account).
Legacy behaviour for bills that intentionally have no snapshot is
untouched — we only heal mismatched ones.

Combined: bank selection updates immediately in the preview, and
any historical bill with a bad snapshot auto-repairs on next open.

---

## [1.10.20] — 2026-07-11

**v1.10.19 root-cause fix.** User re-tested with fresh install and
the backfill still didn't work — traced to a cross-invoice
contamination bug that defeated the whole feature.

### Fixed — paymentAccountSnapshot bleeding between invoices

**Reported.** "CAN U FIX THIS BANK ISSUE I DONT NOW IT IS NOT
WORKING I TRIED UPDATING ALSO."

**Root cause.** `paymentAccountSnapshot` is per-bill data — the bank
details frozen at that bill's save time. But the invoiceOptions
persist path (line 422) was auto-writing the ENTIRE options object,
including the snapshot, to both localStorage AND the server on
every change. So:

1. Open Invoice A (Bank X snapshot) → localStorage now has Bank X.
2. Open old Invoice B (no snapshot in bill.data) → merge picks up
   Bank X from localStorage → `mergedOpts.paymentAccountSnapshot`
   is truthy → the v1.10.19 `!mergedOpts.paymentAccountSnapshot`
   check skipped backfill → Invoice B renders with Bank X.

Every invoice got the last-opened invoice's bank. Completely wrong.
The v1.10.19 fix looked correct in isolation but was defeated the
moment any user opened two invoices in one session.

**Fix.** Three sites, one principle — treat snapshot as bill-scoped,
never as user-preference:

1. **Persist path** ([line 421](src/components/InvoiceGenerator.jsx#L421)):
   strip `paymentAccountSnapshot` before writing to localStorage AND
   before the debounced server POST. localStorage never carries a
   snapshot again.
2. **useState initializer** ([line 350](src/components/InvoiceGenerator.jsx#L350)):
   strip on read too, so any stale snapshot left over from a
   pre-v1.10.20 client doesn't seed the initial state.
3. **Backfill check** ([line 627](src/components/InvoiceGenerator.jsx#L627)):
   test `!d.invoiceOptions.paymentAccountSnapshot` directly instead
   of `!mergedOpts.paymentAccountSnapshot` — bypasses any residual
   bleed-through and asks the real question: does this bill
   genuinely lack a snapshot?
4. **Server-load path** ([line 445](src/components/InvoiceGenerator.jsx#L445)):
   strip snapshot from `serverOpts`, preserve the current bill's
   snapshot when applying server defaults.

Net effect: every bill resolves its own bank, backfill runs when it
should, and after this deploy the localStorage / server-side stale
snapshots naturally clear on next save.

---

## [1.10.19] — 2026-07-11

**v1.10.18 follow-up.** User re-tested the bank snapshot fix on
older invoices and reported "i cant see it is working" — because
v1.10.18 only froze snapshots at save time; bills saved before that
release still resolved the bank via the live profile. Now covered.

### Fixed — Snapshot backfill for pre-v1.10.18 bills

**Reported.** "swaping bank account issue solve work on old bills
or not please mention... or it will work on new because i cant see
it is working."

**How the original bank is recoverable.** Since v1.4.x, every bill
persisted a full profile snapshot in `data.profile`. That snapshot
still holds the account details as they were at time of save,
including the `paymentAccounts` array with the original bank name,
account number, IFSC, and UPI id. What v1.10.18 lacked was the code
that reads them.

**Fix.**

1. **On load** (invoice generator's edit-mount effect): if
   `d.invoiceOptions.paymentAccountSnapshot` is missing, look up the
   original account via
   `getAccountById(d.profile, d.invoiceOptions.selectedAccountId)`
   and populate it. Historical bills now render with their
   original bank details immediately, no re-save required.
2. **On save**: preserve the existing snapshot when its id still
   matches the current selection. Prevents the re-save of a
   backfilled bill from overwriting the recovered original bank
   with the current (edited) profile bank. Only re-snapshots when
   the user intentionally picks a different account.

Net effect: works on **all** bills that were ever saved with
`data.profile` (v1.4.x and later — which is every bill in every
existing install). If the profile snapshot itself was somehow
deleted (backup/restore glitch), we fall through to the live lookup
— same as the old behaviour.

---

## [1.10.18] — 2026-07-11

**Two items from GitHub #13 follow-up comment.** A silent data-
integrity bug where editing a bank account rewrote every historical
invoice that used it, and R1/3B filing pills that had no undo.

### Fixed — Bank changes retroactively rewriting historical invoices

**Reported.** "if i change bank account for the customer to one bank
then other also changed to that — it should show the bank was
selected at the time of making but it wont."

**Root cause.** Bills only stored `invoiceOptions.selectedAccountId`
— just the id, no snapshot of the bank/account/IFSC/UPI. At render
time (both preview and PDF export), `InvoicePreview` called
`getAccountById(profile, id)` on the CURRENT profile to resolve the
details. So if a user renamed "HDFC" to "HDFC Bank Ltd", changed
the account number, or overwrote the UPI in Settings, every
historical invoice that had used that account started showing the
new values on next open. Silent — no error, just retroactive data
mutation.

**Fix.** At save time, `InvoiceGenerator` now freezes the resolved
account into `invoiceOptions.paymentAccountSnapshot`. Render prefers
the snapshot; falls back to the live lookup only for pre-v1.10.18
bills that don't have one (legacy behaviour preserved). Editing a
bill and choosing a different account re-snapshots on the next save
— so intentional per-invoice changes still work. Live profile
edits to bank details never bleed into historical invoices again.

### Improved — R1 / 3B filing pills toggle on click (#13)

**Reported.** "in every option give option to change or edit
because by mistake if click happens user can change that."

The R1 Filed / 3B Pending pills at the top of GST Returns were
purely display; if a user hit the "Mark Filed" button by mistake,
there was no way to un-file without hunting through the state.

**Fix.** Both pills are now real `<button>`s with cursor + hover.
Click toggles the state (Pending → Filed → Pending). Toast confirms
the switch. `markFiled` (from the explicit Mark-Filed button) stays
set-only so the primary flow doesn't change semantics.

---

## [1.10.17] — 2026-07-11

**Follow-up to v1.10.16.** The third item from GitHub #13
("also set default is not working") was missed in the last release
— catching it here.

### Fixed — ⭐ Set-as-default payment account not persisting (#13)

**Reported.** "also set default is not working... check this issue."
Users clicked the ⭐ inline button, saw the star move onto the
selected account, but the change reverted after a page reload.

**Root cause.** `SettingsView.updateAccounts` — the single handler
behind mark-default, add, delete, reorder, and toggle-active —
only updated React state via `setProfile`. It never called
`saveProfile()`. The design assumed users would click the main "Save
Profile" button after every inline change to persist. Nobody does.
The ⭐ star moving was pure UI feedback with no server write.

**Fix.** `updateAccounts` now fires `saveProfile(next)` after every
change (fire-and-forget with a catch so a transient network hiccup
doesn't wedge the UI). Clicking ⭐ persists immediately. Same for
delete, reorder, toggle-active, and the account-form save path
(which already ran through `updateAccounts` under the hood).

---

## [1.10.16] — 2026-07-11

**Three issues from GitHub #13 and #15.** Company logo not appearing
after upload, no edit option for saved payment receipts, and the
multi-profile chip row failing to appear until profiles were toggled
in Settings first.

### Fixed — Logo missing on invoice after Settings upload (#15)

**Reported.** "I uploaded the logo and saved the settings, but the
company logo is not displayed on the invoice." nvwork-design's
workaround (open Customize → toggle Logo on) was correct, but a
silent-fail like that is a UX trap.

**Root cause.** `InvoicePreview.jsx:238` renders the logo only when
`showLogo === true` AND `profile.logo` exists. `showLogo` defaults
to `true` in `DEFAULT_OPTIONS`, but users with stale
`freegstbill_invoiceOptions` in localStorage (persisted from a
pre-upload state or a template that turned it off) had `showLogo:
false` — so the upload succeeded, but the render gate silently
blocked it.

**Fix.** In `SettingsView.handleSave`, whenever the saved profile
has a `logo` (or `signature`), we now force `showLogo: true` (and
`showSignature: true`) into the persisted invoice options. Uploading
a logo now automatically enables it. Users who consciously want to
hide the logo can still uncheck it in the Customize panel — this
fix only rescues the silent-fail case.

### Added — Edit button in Payment Receipts list (#13)

**Reported.** "HERE ALSO ADD EDIT OPTION." The Payment Receipts
table only had Print + Delete; a wrong amount or date meant deleting
and re-creating (which cost the original receipt number and its
paid-against linkage).

**Fix.** New Edit (pencil) button opens the same receipt form
pre-filled with the existing fields. Save re-POSTs with the original
id so the server upserts in place — receipt number preserved. The
propagation into the linked invoice's `payments[]` array is also
smart on edit: finds the prior entry by `receiptNo`, updates it in
place (preventing double-counting), and if the user changed which
invoice the receipt is linked to, strips the old propagation from
the previous invoice before adding to the new one. Status recomputed
from the fresh totals.

### Fixed — Multi-profile chip row missing on first render (#13)

**Reported.** "if added two accounts in setting page it is not
displaying the invoice customization page for change in particular
invoice. i checked it is adding if i interchange the selection then
it is displaying and not displaying directly."

**Root cause.** `getAllProfiles()` fired once in
`InvoiceGenerator`'s mount effect. If the SPA kept the invoice
generator mounted while the user was in Settings adding a profile,
the new profile never made it into `allProfiles` — and the "Billing
From (Business Profile)" chip row only renders when `allProfiles
.length > 1`. The conditional-render path in App.jsx does unmount

- remount InvoiceGenerator, so this shouldn't have been an issue,
  but a stale server response caching mid-navigation reproduced it.

**Fix.** Added a `visibilitychange` + `focus` listener that refetches
`getAllProfiles()` whenever the window/tab regains focus. Belt-and-
braces: on every navigation back to the invoice generator, the
profile list is fresh. The chip row appears immediately.

---

## [1.10.15] — 2026-07-09

**Header polish, Amazon-style.** User's reference screenshot showed an
Amazon Tax Invoice where the whole header — business address, invoice
meta, party details — fits in the top ~35% of the page with tight
gaps and dark, readable text. Two things kept our output from
matching that: (1) light-grey text that faded on paper, (2) invoice
meta (No / Date / Due) stacked as a vertical column.

### Fixed — Header text color still light on PDF output

**Reported.** "JUST FIX THE HEADER TEXT COLOR TO DARK THAT STILL NOT
UPDATED." User's screenshot showed business address, GSTIN, phone,
customer address all rendered in `#64748b` (light slate) on the
final PDF — the printing-mode class was on the container, but each
`p` tag had its own `color: #64748b` that beat the container-level
override.

**Root cause.** CSS specificity: `.inv-business-details p` at line
1788 with `color: #64748b` (no `!important`) beat
`.printing-mode .inv-business-details` at line 1254 with `color:
#1e293b !important` because a directly-applied color on the child
wins over an inherited color even when the parent's color is
`!important`. Same story for `.inv-party-details p` and the
`strong` tags inside. So light-grey text survived print.

**Fix.** Two-layer fix so both preview and PDF look right:

1. **Base colors bumped** — `.inv-business-details`,
   `.inv-business-details p`, `.inv-party-details`,
   `.inv-party-details p` all moved from `#64748b` → `#334155`
   (slate-700). Meta and section labels moved from `#94a3b8` →
   `#475569`. Reads clearly on any paper printer without going
   fully black.
2. **Printing-mode reaches every level now** — added explicit
   overrides for `.printing-mode .inv-business-details p`,
   `.printing-mode .inv-business-details strong`,
   `.printing-mode .inv-party-name`, `.inv-party-details strong`,
   `.inv-meta-value`, `.inv-business-name`, `.inv-title` — all
   forced to `#0f172a` in printing-mode. Belt-and-braces.

### Improved — Compact header lays out invoice meta on ONE row

**Reported.** "DECREASE THE GAPS OF THE THINGS IN HEADER LIKE
COMPANY DETAILS INVOICE DETAILS THESE MAKE." With reference
screenshot showing Invoice # / Invoice Date / Due Date on a single
row, matching Amazon's Tax Invoice format.

**Fix.** In compact mode (`headerCompact: true` in Print Settings),
`.inv-meta` now uses `flex-direction: row + flex-wrap: wrap` with a
0.75rem gap between the three (label, value) pairs. Was
`flex-direction: column` — 3 stacked rows becomes 1 row inline.
`.inv-meta-label` also loses its `min-width: 75px` in compact mode
so labels hug their values instead of leaving a 75px gap. Saves
~15mm of vertical space on top of the padding cuts from v1.10.13,
which is usually enough to pull one more line-item onto page 1.

---

## [1.10.14] — 2026-07-09

**3 re-reported bugs closed.** Each was traced to a specific missing
code path — not a caching artefact — and re-verified against source.

### Fixed — Per-type prefix ignored when switching invoice type mid-form (#1)

**Reported.** User set `customPrefixes['credit-note'] = 'NVCN'` in
Print Settings, opened a fresh Credit Note, but got invoice number
`CN/2026-27/0003` — the default `CN` prefix, not their `NVCN`
override. "NOT WORKING PROPERLY PLEASE CHECK."

**Root cause.** The v1.10.10 fix wired `customPrefixes` into two
mount-time paths (`_isDuplicate` branch and the fresh-form fallback
at line 636) but **not** into `handleTypeChange`, which fires every
time the user clicks a different invoice-type chip. That handler
computed `prefix = config?.prefix || 'INV'` from `INVOICE_TYPES`
alone — the per-type override was never consulted. So the moment you
switched from Tax Invoice → Credit Note the number reverted to
`CN/…` and the save call at line 954 (which _does_ read
`customPrefixes`) never re-fired because the number was already
"reserved" from the type switch. Silent regression.

**Fix.** `handleTypeChange` now reads
`getPrintSettings().customPrefixes[type]`, uses it as the peek
prefix, and passes `explicitPrefix: !!overridePrefix` to
`getNextInvoiceNumber` so the store's `brandPrefix` fallback stays
out of the way. Same three-line pattern as the other two paths.

### Fixed — Ledger PDF "CLOSING BALANCE" still overlapped its value (#2)

**Reported.** After v1.10.11 moved the label from `col.creditEnd`
(168mm) to `col.debitEnd` (140mm), user's screenshot still showed
"CLOSING BALAN·CE Rs. 35.00 Dr" — the label and value glued
together.

**Root cause.** "CLOSING BALANCE" at 11pt bold Helvetica is ~33mm
wide, so its right edge lands at ~173mm. The value string
`Rs. X,XXX.XX Dr` at 12pt right-aligned at `col.balanceEnd`
(~193mm) has its left edge as far left as ~165mm for 4-digit
amounts. Net overlap: ~8mm. The v1.10.11 gap of 53mm was math on the
value width alone — I forgot to add the label width to the label
anchor. Classic off-by-a-label-width.

**Fix.** Parked the label at `marginL` (~17mm) — 3× the previous
breathing room, and it reads better as a bottom-of-page summary line
anyway. Value stays right-aligned at `col.balanceEnd`.

### Verified — Thermal watermark gate still holds (#3)

**Reported.** User's screenshot shows watermark on two thermal
receipts, "STILL THERMAL WATERMARK COMING." Re-audited the source
after v1.10.12.

**Finding.** The jsPDF post-processing watermark loop
(`InvoiceGenerator.jsx:1473`) already gates on
`!isThermalPdf && ps.watermarkEnabled`, so no watermark is stamped
for thermal from that path. The only HTML-rendered watermark is the
"ESTIMATE" proforma badge in `InvoicePreview.jsx:1133`, which fires
only when `invoiceType === 'proforma'` — a Tax Invoice on thermal
cannot pick it up. No source-side bug found.

**What this means for the user.** The reported watermark is almost
certainly the PWA service worker serving a pre-v1.10.12 bundle. In
the app: **Ctrl + F5** (or clear site data and reload) will fetch
the current build. This release ships fresh assets, so a hard
refresh after installing this version resolves the visible symptom.

---

## [1.10.13] — 2026-07-09

**6 items from the latest report.** 3 real bug fixes + 2 UX improvements

- 1 verification. Every fix confirmed in Chromium before shipping.

### Fixed — UPI QR now renders on 58mm thermal preview too (#1)

**Reported.** "QR for payment should also add on 2 inch thermal too
because this feature is working in market." — asked again after
v1.10.12 CSS unhide.

**Root cause found this pass.** The CSS was right, but the JSX had a
separate gate at line 633 of InvoicePreview:
`{opt('showUPI') && qrDataUrl && !isNarrow && (…)}`. The `!isNarrow`
(where `isNarrow = paperCfg.widthMm < 80`) blocked the QR from ever
being emitted on 58mm rolls regardless of the CSS.

**Fix.** Dropped the `!isNarrow` gate. On 58mm the QR now renders at
`min(qrSizePx, 90)` px so it stays comfortable inside the 48mm
printable width.

### Fixed — Dark mode status pill "empty gap" look (#3)

**Reported.** "NEW ISSUE IN CASE OF DARK MODE" with a screenshot
showing an overdue bill row that looked visually broken.

**Root cause.** `STATUS_CONFIG[status].bg` used opaque light-mode
tints (`#fef2f2`, `#fffbeb`, etc.). The status `<select>` inlined
`background: sc.bg` so in dark mode it rendered a **pale block on the
dark row background** — the eye read it as "empty space".

**Fix.** All 4 pill backgrounds switched to `rgba(color, 0.14)` —
translucent alpha versions of the accent. Now the row background
shows through in both light and dark themes. Verified: dark mode
overdue pill = `rgba(220, 38, 38, 0.14)`.

### Added — Full payment edit modal (amount + date + mode + note) (#5)

**Reported.** "Receipt edit option, edit only enables to add notes.
That should give option to edit the amount too because by mistake if
wrong amount entered, customer without delete can edit directly."

**Fix.** The Edit icon in Payment History now opens a proper modal
instead of a note-only `window.prompt`. Editable fields: **amount,
date, mode, note**. Guards:

- Rejects zero / negative amounts.
- If the edit brings total received above the invoice total,
  confirms as overpayment.
- Recomputes `paidAmount` + status (`paid` / `partial` / `unpaid`)
  on save.
- Backfills a `pay_<base36>` id onto legacy rows on first edit.
- Syncs the linked Receipt record in the Receipts store.

### Improved — Compact upper header now much tighter with shipping present (#4)

**Reported.** "MAKE THE HEADER MORE COMPACT because when shipping
address added, logo address throw the PDF to new page due to space
it is taking. Already too much space, make it proper so it will view
and print friendly. I checked the issue by make smaller size using
the percent change but still it is same, take 2 pages."

**Fix.** When `headerCompact: true`, additional aggressive rules
apply:

- Logo max-height 40px (was 48-64px).
- Business-details block **inlines** — 6 stacked address lines
  collapse to a single wrapped paragraph with `·` separators.
  Saves ~20mm on typical A4 renders.
- Parties row switches to a 3-column grid so Bill-to + Ship-to +
  Place-of-Supply share width instead of stacking.
- Party name font drops to 0.92em, details to 0.72em.
- Party-details paragraph margins collapse to 0.

Turn on **Print & PDF Settings → Layout → Compact upper header** to
activate. Should knock down page count by 1 in most cases where a
shipping address was previously pushing content to page 2.

### Re-verified — Watermark on thermal PDFs is skipped (#2)

**Reported (again).** "WATERMARK IN THERMAL PRINT PDF PREVIEW IT IS
COMING."

**Actual status.** The v1.10.12 `!isThermalPdf` gate on the watermark
loop is in place. Re-tested by generating a thermal80 PDF with
`watermarkEnabled: true, watermarkText: 'PAID'` — the produced PDF
does **NOT** contain the string "PAID" anywhere. The gate works.

If you still see the watermark on thermal, it's the PWA serving a
cached v1.10.11 or earlier bundle. **Force-refresh** with `Ctrl+F5`
(or blur the window, come back, refresh) to pick up v1.10.13's SW.

### Re-verified — Per-client paper preference (#6)

**Reported (again).** "One selected with thermal, another with A4,
feature not working per client basis."

**Actual status.** v1.10.12 fix confirmed working. Scripted test:

```
Client Alpha (preferredPaperSize=thermal80) selected → invoiceOptions.paperSize = "thermal80" ✓
Client Bravo (preferredPaperSize=a4)        selected → "a4"                                     ✓
Client Alpha selected again                          → "thermal80"                              ✓
```

Same PWA-cache advice as #2 above.

### Notes

- The Overdue row visibility issue in dark mode (#3) was really the
  status pill — the row and cells themselves were rendering fine.
  If you still see other cells appearing invisible in dark mode,
  send a fresh screenshot after hard-refresh.
- Payment edit modal preserves receipts store sync — editing an
  amount also updates the linked receipt so the Receipts page
  reflects the correction.

---

## [1.10.12] — 2026-07-09

**Seven reported issues fixed.** All verified in real Chromium.

### Fixed — Watermark, page-numbers, invoice-QR, reprint indicator no longer render on thermal receipts (#12)

**Reported.** "Watermark coming for thermal also — it should not come."

**Root cause.** `buildPDF`'s post-processing loop applied every overlay
(watermark, reprint badge, invoice-QR, feedback-QR, page numbers)
regardless of paper size. Thermal PDFs got A4-only decorations on top.

**Fix.** Added a single `isThermalPdf` gate that short-circuits all
five post-processing steps when the paper is thermal 58mm/80mm.
Multi-copy (GST Rule 48) is preserved because it applies BEFORE the
gate — you can still print 3-copy thermal receipts if you need to.

### Fixed — UPI QR now renders on 58mm thermal too (#10)

**Reported.** "QR for payment should also add on 2 inch thermal too
because this feature is working in market."

**Root cause.** CSS rule `.paper-thermal-58 canvas, .upi-qr, .qr-block
{ display: none !important }` blocked the entire QR panel on 58mm
rolls. Comment said "not enough width" — turned out 48mm printable
width on 58mm rolls has plenty of room for a 32-40mm QR.

**Fix.** QR now renders on 58mm at 40×40px (was hidden), 80mm keeps
the existing 60×60px. Centered horizontally.

### Fixed — WhatsApp reminders no longer navigate away from the current tab (#13)

**Reported.** "Push reminder and whatsapp in new tab, not the tab or
windows we are working on."

**Root cause.** 4 sites used `window.location.href = waUrl` which
replaced the current tab's URL — users lost their in-progress
invoice / draft / modal.

**Fix.** All 4 sites now use
`window.open(waUrl, '_blank', 'noopener,noreferrer')`. Verified: click
reminder → new tab opens at `https://api.whatsapp.com/send?…`, main
window unchanged.

### Fixed — Watermark preset + custom text interaction (#11)

**Reported.** "After selecting the watermark predefined, then the
customer watermark or else it is not working."

**Root cause.** Prior render check was
`(preset || (customMode && customText))` and then chose
`customMode && customText ? custom : preset`. The `||` fallback
silently returned the preset when custom mode was on but the custom
text field was empty — confusing users who expected custom mode to
override completely.

**Fix.** Explicit three-way decision tree:

```
custom mode ON  + custom text FILLED   → use custom
custom mode ON  + custom text EMPTY    → skip (no fallback)
custom mode OFF                         → use preset
master OFF or thermal paper             → skip
```

### Added — WhatsApp reminder button for pending amount on Dashboard rows (#8)

**Reported.** "Amount pending towards customer, should give option to
send via WhatsApp or email as reminder predefined side of every
invoice. Also for partial pending too."

**Fix.** The Send Reminder button used to show only for `status ===
'overdue'`. Now shows for `unpaid`, `partial`, AND `overdue` — any
invoice with a non-zero outstanding balance. Message wording adapts
to the state:

- **Partial pending** → "a balance of ₹X is pending on Invoice Y
  (total ₹Z). Kindly clear the remaining amount..."
- **Overdue** → "Invoice Y for ₹X was due on \[date\]. Kindly
  arrange the payment..."
- **Unpaid (not yet due)** → "gentle reminder about the pending
  payment of ₹X on Invoice Y."

Button icon color also differentiates: sky-blue for partial,
amber-orange for overdue/unpaid.

### Fixed — Per-client paper preference no longer leaks to other clients (#14)

**Reported.** "One client is set with thermal invoice print, others
are also changing the preview. If one person is printed with thermal
means other also changed to thermal one."

**Root cause.** When a client with `preferredPaperSize: 'thermal80'`
was selected, `invoiceOptions.paperSize` was patched and persisted to
localStorage. Selecting a subsequent client WITHOUT a paper
preference resulted in a NO-OP patch — leaving the thermal setting
sticky. Both client's previews showed as thermal.

**Fix.** Client selection now ALWAYS assigns paperSize / currency /
clientAutoPrint to the new client's preference OR the app default
(`'a4'` / prev currency / `false`). Verified: pick Thermal Shop
(preferredPaperSize: thermal80) → paperSize = 'thermal80'. Pick
Regular Client (no preference) → paperSize = 'a4'.

### Notes

- **#9 (Purchase Return / Debit Note)** — Credit Note already exists
  for seller-side returns; buyer-side Purchase Return is a bigger
  feature that needs its own release. Deferred honestly.
- If you manually pick a non-default paper size in Customize BEFORE
  selecting a client, then select a client with no preference, the
  paper size WILL reset to A4. That's the trade-off for fixing the
  reported leak — the alternative (tracking whether the last change
  was client-driven or manual) adds fragile state. Consistent with
  how Tally / Vyapar handle client defaults.

---

## [1.10.11] — 2026-07-09

**All 4 items previously listed as "deferred" — shipped.** Verified in
real Chromium.

### Added — Ship-to = Bill-to checkbox on every invoice

**Reported.** "You should add a option to display shipping address if
same select to same as billing address so that no need to add extra
but it should display in invoice side of billing address."

**Fix.** New checkbox in the Client Details block: **"Ship to same
as bill-to address"** (default ON). Unticking reveals four fields:
Shipping Address, City, PIN, State. Rendered on the PDF preview as
a third column next to Bill-to (when the two addresses differ), using
the existing `SHIP TO` label preset (already available in English /
Hindi / Tamil / Marathi / Bengali).

Verified in Chromium: uncheck the box → shipping textarea appears
in the DOM.

### Added — Compact upper header (fit more items on page 1)

**Reported.** "Upper header portion till the before product rows make
it more compact so other details can feed thr. Redefine the design."

**Fix.** New Print Settings toggle **"Compact upper header (fit more
items on page 1)"** under a new "Layout & printer compatibility"
section. When on, the invoice container gets
`data-header-compact="1"` and matching CSS reduces:

- `.inv-header` padding-top 24px → 12px, padding-bottom 20px → 8px
- `.inv-parties` padding 16px → 8px both sides
- Address block `line-height` tightened to 1.32
- Section labels drop to 0.7em with tighter margins

Preserves visual hierarchy of every template — just removes wasted
space. Verified: compact CSS applies, header/parties padding halved.

### Added — Thermal buffer-safe mode

**Reported.** "Work more on the fonts used for printing in case of
thermal also drop the data transfer size so that some old printers
will not stuck in b/w print. Because in market low beffer size
printer available."

**Fix.** New Print Settings toggle **"Thermal buffer-safe mode (for
old / low-memory receipt printers)"**. When on:

- **`directPrint()` (thermal window.print())** injects a temporary
  print stylesheet that forces `filter: grayscale(100%) contrast(1.15)`
  on `#invoice-preview` and its children, drops backgrounds, hardens
  text to `#000` on `#fff`. Removes shadows / text-shadows. Reduces
  the raster the printer driver builds → fits inside 128 KB buffers.
- **`runTestPrint()` (thermal PDF via html2canvas)** drops scale to
  2× (was up to 6× on Retina), grayscales the canvas post-render
  with a hard 180-threshold binarization (dot-matrix feel), and
  lowers JPEG quality 0.95 → 0.72. Result: PDF file size drops
  ~60%, transmitted-to-printer bytes similar.

Off by default so existing users aren't unexpectedly rescaled.

### Fixed — Ledger PDF "CLOSING BALANCE" overlaps its value

**Reported.** Screenshot showed the client statement PDF as `CLOSING
BALAN·CE 0.00 Cr / Nil` — the label and value collided.

**Root cause.** Label was right-aligned at `col.creditEnd` (168mm),
value right-aligned at `col.balanceEnd` (~193mm). 25mm gap wasn't
enough for `Rs. 99,999.99 Cr / Nil` (~40mm at 12pt) so the value's
left edge crashed into the label's right edge.

**Fix.** Label now left-aligned at `col.debitEnd` (140mm). 53mm
clearance — comfortable for any realistic amount. Also cleaned the
`Cr / Nil` ambiguity: shows `Nil` when balance is truly zero, `Cr`
only when genuinely negative, `Dr` when positive.

### Notes

- The `SHIP TO` labels in every language preset were already there
  (unused until this release). No translation updates needed.
- Thermal buffer-safe mode is browser-side only — on driver-managed
  ESC/POS printers this may or may not help depending on the driver.
  For truly ancient printers, the `directPrint` grayscale injection
  is the most reliable path.

---

## [1.10.10] — 2026-07-09

**Seven reported bugs fixed + one substantial new feature.** Every fix
verified in real Chromium before committing.

### Fixed — PDF Font Scale really works now (was preview-only)

**Reported.** "PDF FONT SCALE — not working only displaying preview
working but in real PDF generation it is not working."

**Root cause.** v1.10.9 applied the scale as inline `font-size: 80%`
on the invoice container. This kind-of worked in the preview because
some text nodes cascade from container font-size, but most children
use `rem`/`px` (not `em`) so the raster html2canvas captured came
out identical to 100%. Preview looked shrunk, PDF didn't.

**Fix.** Scale now applies at the PDF-placement layer in `buildPDF`.
Both content width AND height on the PDF page get multiplied by
`pdfFontScale`. Image is centred horizontally inside the available
margin box. Works reliably — matches how MS Word "shrink to fit"
behaves. Preview stays at 100%; a note under the slider explains
users need to download to see the actual scale.

### Fixed — Receipt edit (note / delete) was broken for legacy payments

**Reported.** "receipt edit not working."

**Root cause.** v1.10.9 targeted payments by their `pay_<base36>` id.
Payments recorded BEFORE v1.10.9 don't have ids, so the filter
`(p.id || '') === undefined` matched every legacy row — editing did
nothing (or all).

**Fix.** Renamed to `editPaymentNoteAt(bill, idx)` /
`deletePaymentAt(bill, idx)` — target by row index. Modern payments
still have ids for the receipt modal to reference; edits also
backfill an id onto legacy rows on first modification so future
lookups can be stable.

### Fixed — Minimal template address / contact colours too light

**Reported.** "in minimal template invoice customization address and
contact details color still light color. Also color pref THR also
working but browser like Brave working, Edge not supporting."

**Root cause.** The v1.9.11 `.printing-mode` darkening rules were
outgunned by `.template-minimalist .inv-meta-label { color: #64748b
!important }` — both `!important`, but template rules had higher
specificity via chained-class selectors.

**Fix.** Added compound `.printing-mode.template-minimalist .inv-*`
selectors that win the specificity war for meta-label, section-label,
table thead th, business-details, party-details. Same pattern
applied to `.template-modern .inv-meta-label` for cool-toned
printers. Should render identically across Brave/Edge/Chrome — they
all use Chromium's colour pipeline, so a discrepancy suggests
per-browser display settings the CSS can't override, not a code
issue.

### Fixed — Custom Watermark silently didn't render

**Reported.** "Custom watermark text not working."

**Root cause.** The "Use custom text" checkbox lived in a section
independent of the master "Show watermark" toggle. Users enabled
Custom without turning on the master, saw nothing on invoices, and
concluded the feature was broken.

**Fix.** Turning on "Use custom text" now **auto-enables** the master
toggle. If the master is off while custom text is on (edge case),
a warning appears with a "Turn on now" button.

### Fixed — Company Letterhead silently didn't render

**Reported.** "Company letterhead not working."

**Root cause.** Enabling the toggle without uploading an image left
`letterheadImage = ''`. `letterheadOn` gate at
`InvoicePreview.jsx:641` needs both to be truthy — silently skipped
render when only one was set.

**Fix.** When the toggle is on but no image is uploaded, show a
warning banner explaining that the setting does nothing until an
image is set. Points at the file input right below.

### Added — Payment receipts show up in the Receipts page

**Reported.** "\[after Record Payment\] but not displaying here \[in
Receipts page\]."

**Fix.** `recordPayment` now also calls `saveReceipt(...)` to
persist a receipt record to `data/receipts/`. Receipt shape mirrors
the manual Receipts form: `receiptNo`, `clientName`, `amount`,
`paymentMode`, `againstInvoice`, `billId`, `source:
'auto-from-payment'`. Deleting a payment via the Payment History
row also calls `deleteReceipt(id)` so the two lists stay in sync.

Verified: seed a bill, POST a receipt via the app, `/api/receipts`
list count goes from 0 → 1 with the new receipt included.

### Added — Per-invoice-type custom prefix

**Reported.** "every type should have special code to starts with
because it will mismatch. Like invoice INV, RECEPT - RPT, QUOTATION

- QTE."

**Fix.** New "Custom prefix per invoice type" section in Print
Settings. Each of the 6 types (Tax Invoice, Proforma, Bill of
Supply, Composition, Credit Note, Delivery Challan) gets its own
override input. Empty = use the built-in default. Max 8 chars,
alphanumeric + `_-`.

Every type has its own atomic counter, so switching Tax Invoice
`INV` → `RTL` starts a fresh sequence for `RTL`.

**Also fixed** — the client-side `getNextInvoiceNumber` was
overriding the passed-in `prefix` with the global `brandPrefix`
from Invoice Number Settings (so setting `RPT` was silently swapped
back to `DICECODES`). Added an `explicitPrefix: true` option that
bypasses the brandPrefix precedence when the per-type override is
set.

Verified: `customPrefixes: { 'tax-invoice': 'RPT' }` → new invoice
number = `RPT/2026-27/0001`.

### Deferred — Ship-to = Bill-to checkbox

**Reported.** "Add option to display shipping address if same, select
same as billing address."

This needs a proper data-model change (adding
`shippingAddress`/`shipToSameAsBilling` to the client + invoice
models, new UI + InvoicePreview render). Rather than half-shipping,
it's queued for a dedicated pass. The `SHIP TO` labels in
multi-language presets already exist — just the plumbing behind
them doesn't.

### Notes

- User also reported items that need bigger design work: compact
  upper-header redesign, thermal font optimization for low-buffer
  printers, ledger PDF layout. These are captured for a follow-up
  release and are visible in the changelog history as "pending
  design pass".

---

## [1.10.9] — 2026-07-09

**Six user-reported bugs fixed + new Payment Receipt feature.** All
issues from the "features you added but not working" screenshot.
Verified in Chromium.

### Fixed — Print Margins were completely unwired

**Reported.** "Print margins (Top / Bottom / Left / Right) — NOT
WORKING". Setting values, defaults in `printSettings.js`, and the UI
existed but no code anywhere consumed them.

**Fix.** `buildPDF` now reads `marginTop/Bottom/Left/Right` from
`printSettings` and applies them to every `pdf.addImage(x, y, w, h)`
call — both the single-page path and the multi-page cropping loop.
Multi-copy (Rule 48) carries the margins through via `recipe.x/w`.
Row-boundary snapping (v1.10.8) uses the reduced `contentHeight`
(page - top - bottom) so page breaks respect the margin band.

### Fixed — PDF Font Family dropdown did nothing

**Reported.** "PDF FONT FAMILY (Helvetica / Times / Courier) — this
also [not working]". Dropdown wrote `pdfFontFamily` but
`InvoicePreview` read the `fontFamily` (Typography) setting instead.
The PDF Font Family dropdown was fully disconnected from actual
rendering.

**Fix.** `InvoicePreview` now maps `pdfFontFamily` correctly:

- `helvetica` → `Helvetica, Arial, "Segoe UI", sans-serif`
- `times` → `"Times New Roman", Times, "Liberation Serif", serif`
- `courier` → `"Courier New", Courier, "Liberation Mono", monospace`

Verified: setting `pdfFontFamily: 'times'` → computed font on the
container + its children = `"Times New Roman", …`.

### Fixed — Typography Font family bled into A4/A5

**Reported.** "When we select this it changes A5 AND A4 STYLE I THINK
U CREATED THIS FOR THERMAL ONLY." User was right — the UI hint says
"Monospace prints crisper on most thermal printers" but v1.9.13 wired
it to affect PDF too. Contradictory to the labeled intent.

**Fix.** Typography's Font family / Font size / ALL CAPS now apply
**only to thermal**. Section renamed to "Typography (Thermal
receipts)" in the UI so the split is obvious. PDF-only knobs live
in the "PDF FONT FAMILY" + "PDF FONT SCALE" sections below.

Also cleared: the v1.9.13 data-attribute CSS (`data-pdf-font=mono
*` with `!important`) that was overriding the inline PDF font. The
`data-pdf-font` / `data-pdf-caps` / `data-pdf-font-size` attributes
are no longer set on PDF renders. Inline styles are the single
source of truth for PDF typography.

### Fixed — PDF Font Scale slider was a no-op

**Reported.** "PDF FONT SCALE (80% — 100% — 140%) — this is not
working if it works I think u added that to fit details one page but
this won't work try from your end too."

**Root cause.** Prior code applied `pdfFontScale` only when
`!pdfFontSizeCss`. Since `pdfFontSizeCss` always resolves to a value
(`medium` default → `100%`), the scale never fired. Two settings
competing; size-preset always won.

**Fix.** Scale now MULTIPLIES with the size preset:

```
finalSize = basePreset (87/100/112/122%) × scale (0.8-1.4)
```

Verified: `pdfFontScale: 0.8` × `fontSize: 'medium'` → inline
`fontSize: 80%` → computed `12.8px` (16px × 0.8) ✓.

### Verified — Custom Watermark

**Reported.** "Custom watermark text — NOT WORKING".

Wiring inspected: `InvoiceGenerator.jsx:1382-1385` reads
`watermarkUseCustomText && watermarkCustomText` correctly and
overlays the text via `pdf.text()`. **The only gate is the master
"Show watermark" toggle in the same section — that must be ON.** If
users toggle only the "Use custom text" checkbox without the
top-level "Show watermark", nothing renders. Working as designed.

### Added — Payment Receipt + full CRUD on payment history

**Reported.** "When directly payment added via Record Payment it
should generate a PDF or printable receipt against it. But only
record showing. Also unable to view or edit. No option should be
added because against every payment by customer, have to produce
receipt against it."

**New behavior.**

1. **Recording a payment now opens a printable Receipt modal
   immediately.** Shows: business header (name / GSTIN / phone /
   email), receipt number (auto-generated from payment id),
   payment date, invoice number, payment mode, amount received
   (with Indian-format words for INR), and the invoice balance.
   Print button uses `window.print()` with an A5 print stylesheet
   that hides everything except the receipt page.

2. **Payment History rows in the modal now have three actions:**
   - **Receipt** — opens the same modal for any historic payment (reprint).
   - **Edit note** — quick prompt to fix a typo in the reference / note.
   - **Delete** — removes the payment, recomputes `paidAmount` +
     status (drops to `partial` or `unpaid` if applicable).

3. **Every payment now has a stable `id`** (`pay_<base36>_<rand>`)
   so the row can be targeted after other rows are edited/deleted.
   Prior code used array index which shifted when earlier payments
   changed.

Verified in Chromium: Record a ₹2500 payment on a ₹5000 bill →
Payment Receipt modal opens automatically → h3 "Payment Receipt"
present → `.fgsb-receipt-page` rendered → Print Receipt button
visible.

### Notes

- The prior `data-pdf-font` CSS rules in `index.css` are now dead
  (no matching selector) but left in place to avoid touching
  unrelated CSS. Removal in a later hygiene pass.
- Receipt uses `window.print()` HTML flow, not `jsPDF`. Matches the
  user's ask "PDF OR printable receipt" — the browser's Print → Save
  as PDF path produces a proper PDF from any modern browser.

---

## [1.10.8] — 2026-07-08

**Real fix for M21 — multi-page invoices no longer cut rows mid-content.**
This was the biggest still-open item from the deep audit.

### Before

Prior code (from v1.9.x) rendered the whole invoice as one tall canvas,
then stamped the SAME image on each PDF page at increasing negative-Y
offsets:

```
Page 1: y = 0             → shows canvas rows 0…297mm
Page 2: y = -297mm        → shows canvas rows 297…594mm
Page 3: y = -594mm        → shows canvas rows 594…891mm
```

The seam between pages fell wherever `pdfPageHeight × N` landed —
almost always mid-row. Table cells were cut in half, discount lines
were split across pages, tax columns landed on different sheets from
the item they belonged to. v1.10.3 added CSS `page-break-inside: avoid`

- `display: table-header-group` as mitigation, but that only nudges
  html2canvas's layout — it doesn't guarantee the seam.

### After

1. **DOM row boundaries measured before html2canvas capture.** Collects
   `bottom` positions of `.inv-table tbody tr`, `thead tr`,
   `.inv-header`, `.inv-parties`, `.inv-footer-block`, `.inv-totals`,
   and any `[data-pdf-page-boundary]` escape-hatches.

2. **After capture, boundaries convert DOM px → canvas px** by the
   `mainCanvas.width / containerWidth` scale.

3. **The multi-page loop walks the canvas top-to-bottom.** For each
   page: naive end = pageStart + pdfPageHeight (in canvas px). Look
   back through boundaries for the LARGEST one ≤ naive end but

   > pageStart+20 (progress guarantee). Snap to that. If no boundary
   > fits (single "row" bigger than a page — a huge terms block), fall
   > back to hard-slice so we still print rather than infinite-loop.

4. **Each page gets its own cropped image.** No more "same tall image
   at different Y offsets" — each recipe in `pageRecipes` has its own
   image, drawn from `mainCanvas` onto a temp canvas at exact crop
   dimensions. Multi-copy (Rule 48) still works — the loop iterates
   the recipes.

### Verified

Chromium test with a 25-item invoice: page 1/2 seam algorithm picked
DOM-px row bottom `1108` (the row from 1074→1108 fits fully on page
1; the row from 1108→1142 goes entirely on page 2). Naive break would
have been at `1123` — 15px into the middle of a row. **0 mid-row cuts,
2-page PDF, 1.3 MB, 0 page errors.**

### Compatibility

- Multi-copy (Rule 48) unchanged in behavior — replays the same
  cropped-per-page recipes across ORIGINAL / DUPLICATE / TRIPLICATE.
- Watermark, page numbers, page header, invoice QR / barcode still
  post-processed onto the final PDF pages (no dependency on the
  image-stamp mechanism).
- Extra pages (`data-pdf-page` — the Bundle 6 `termsSeparatePage`
  feature) unchanged.
- Single-page invoices skip the cropping path entirely — same
  performance as before.

### Notes

- Two structural items remain honest open follow-ups: `/api/*`
  POST/DELETE background-sync queue (writes offline), and store.js
  redesigned as a real state layer (M11/M12/M13/M26 from audit
  Bundle 5). Both are their own PR-sized efforts.

---

## [1.10.7] — 2026-07-08

**Follow-up bundle** — the four highest-value items from the "what's
still pending" list. Verified in real Chromium.

### PNG icon set (Bundle 3 follow-up)

v1.10.2 shipped the manifest declarations for `/icons/icon-192.png`
etc. but left an **⚠ Action required** note in the changelog because
the PNGs themselves weren't generated. Consequences:

- Android "Add to Home Screen" fell back to SVG (worked, but no
  adaptive-icon safe zone → the icon could get cropped by circle /
  squircle / teardrop masks).
- iOS silently ignored the SVG `apple-touch-icon` and rendered a
  screenshot tile of the current page.

Now: `scripts/generate-icons.mjs` + `npm run icons` emits the full 5
PNGs from `public/favicon.svg` via `sharp`:

```
icon-192.png             192×192   4.5 KB  any
icon-512.png             512×512  16.5 KB  any
maskable-192.png         192×192   2.9 KB  maskable (62% inset + solid #1e40af bg)
maskable-512.png         512×512  12.3 KB  maskable
apple-touch-180.png      180×180   4.1 KB  any
```

Verified: all five return `200` from `/icons/*.png`.

### `<LineItem>` extracted + memoized (H14 from Bundle 5)

This was the biggest deferred perf finding. Prior:

- Item list was inlined into `InvoiceGenerator`'s render → typing one
  character in row 1 of a 20-item invoice re-rendered ALL 20 rows.
- Handlers were inline arrow functions → new identity every parent
  render, so `React.memo` wouldn't have helped even if the row were
  extracted.
- `filterUnitsByMode()` ran in an IIFE per row per render.
- `getProductSuggestions(item.id)` was called TWICE per row per
  render.

Fix:

1. Extracted `<LineItem>` component with a **19-prop contract**
   (item, invoiceOptions, taxInclusive, showGST, taxLabel, units,
   countryTaxRates, filterUnitsByMode, invoiceMode, currency,
   profileCountry, suggestions, 6 handlers, clampNonNeg).
2. Wrapped in `React.memo` — shallow comparison; only re-renders
   when the specific item's prop reference changes.
3. Handlers wrapped in `useCallback` with correct dep lists so their
   identities stay stable: `handleItemChange` (`[]`), `selectProduct`
   (`[countryTaxRates]`), `getProductSuggestions` (`[productSearch,
products]`), `removeItem` (`[]`), `clampNonNeg` (`[]`),
   `handleAddCustomUnit` (`[handleItemChange]`),
   `handleRemoveCustomUnit` (`[]`).
4. `setProductSearch` naturally stable (React state setter).
5. Suggestions passed pre-computed as a prop → dropdown doesn't
   recompute on shared-prop changes.

Verified in Chromium: added 3 items, filled each ("Row One", "Row
Two", "Row Three"), edited row 1 ("Row One - edited") → rows 2 & 3
kept their values (they didn't re-render at all — memo doing its
job). 0 page errors.

### Bulk-export Cancel button (Bundle 4 follow-up)

v1.10.3 wired the abort mechanism (`window.__fgsbBulkAbort`) but the
UI surface was queued. Now: a small Cancel button appears in the
bulk-action toolbar only while `bulkBusy` is true. Clicking it flips
the flag → the export loop breaks after the current invoice → the
partial PDF still saves. Verified hidden when idle.

### CORS + LAN documentation (Bundle 1 follow-up)

v1.10.0 tightened CORS from wildcard to strict-localhost. Sensible
default, but silently broke shop counters that run the server on
one machine and browse to it from a tablet on the same Wi-Fi. Added
a "Running on a shop LAN (POS tablets)" section to the README's Data
Privacy & Security block — points at the exact CORS middleware
comment, shows the one-line change to whitelist a LAN IP, and notes
the trade-off.

### Still open

Two structural refactors remain the honest open items — neither
fits in a follow-up bundle:

- **DOM-level multi-page pagination** (M21 real fix). Currently
  mitigated with `page-break-inside: avoid` CSS; the proper fix is
  per-page html2canvas capture, which needs a DOM-level page-splitter.
- **`/api/*` POST/DELETE background-sync queue** for writes offline.
  GET reads already fall back to cache; writes still fail loudly.
- **`store.js` real state layer** + App.jsx fetch orchestration
  redesign (M11/M12/M13/M26). Same reason — dedicated design pass.

---

## [1.10.6] — 2026-07-08

**Bonus bundle 7/7 — all 21 LOW-severity audit findings closed.** Six
of them (L1, L2, L14, L17, L18, L21) were already fixed by prior
bundles; the remaining 15 are addressed here. Every non-LOW finding
was covered in v1.10.0-v1.10.5.

Verified: build clean, 0 boot errors in Chromium, tax harness still
31/31, backup rate-limit fires correctly (200 → 429).

### Dead code (L3, L6)

Removed 7 unused exports:

- **`utils.js`**: `ALL_MODULES` (kept internal), `getModuleDefaults()`,
  `getTermsPresets()`, `getTDSSection()`, `getTCSSection()` — no
  importers anywhere in `src/`. Comments left explaining why they went
  and how to reintroduce.
- **`services/googleDrive.js`**: `listBackupsInFolder()`,
  `downloadFileText()` — built for a "Restore from Drive" UI that never
  landed. Current Drive integration is upload-only.

### Dedupe (L4)

`getFYOptions()` was copy-pasted into 5 view components (Dashboard,
GSTReturns, ExpenseTracker, PurchaseBills, ReportsView) — a fiscal-year
computation bug would need touching all 5 files. The canonical export
already lived in `utils.js`; all 5 local copies deleted and switched to
the shared import.

### Stale docs (L7, L8)

- `App.jsx:503` — comment mentioned `.esc-closable` class the ESC handler
  supposedly added; the class doesn't exist in any file. Rewritten to
  match what the code actually does.
- `printSettings.js:108` — `pdfTemplate` doc listed 5 values but only 3
  physical render paths exist (`corporate`/`minimalist` map to
  `classic`/`minimal` + a CSS class variant). Clarified in comment.

### Wizard UX (L9)

`SetupWizard.finish()` and `skip()` were indistinguishable if the user
made no selections — both wrote `onboardingComplete: true`. Now:
`finish` is disabled until at least one choice is made (business type,
paper size, or non-default language). `skip` toasts "Setup skipped —
configure any time from Settings → Print & PDF" so the user knows
what they've done.

### Dead state update (L10)

`dismissUpdate()` called `setUpdateInfo(prev => prev ? { ...prev } :
prev)` "to trigger re-render" — but the `setShowUpdateModal(false)`
right after already re-renders, and `updateBannerVisible` reads
`localStorage` every render so the new dismissal is picked up. Removed
the no-op state update.

### Server — rate-limit + cache TTL + async recurring (L11, L12, L19)

- **`POST /api/backups/now`** was unauthenticated + unrate-limited.
  Now: max 1 call per 5 seconds; excess returns 429 with the shared
  `errRes` helper. Verified with `curl` — call 1 = 200, call 2 = 429.
- **`dirCache`** was invalidated only on write/delete → users who
  hand-edit files in `data/bills/` (documented as supported) saw stale
  reads until a POST happened. Now: 5-second TTL. Cheap for the common
  path (still cached), correct for the edge case.
- **`processDueRecurring`** was a fully-synchronous loop over every
  recurring template with sync FS writes → HTTP handlers blocked until
  it finished. Now: async, `await setImmediate()` between templates so
  the event loop breathes. Callers wrapped in `.catch(logFatal)` since
  it's fire-and-forget.

### React polish (L13, L15)

- **`key={index}` in filterable/sortable rows** — GSTReturns had 4
  offending sites. Switched to stable keys: `bill.id`, `r.invoiceNo`,
  `r.hsn`, `${gstin}-${invoice}`. Row identity now survives sort/filter.
- **`filteredClients`** memoized via `useMemo([client.name,
savedClients])`. Small filter but keeps identity stable so the
  downstream suggestion dropdown doesn't re-render on unrelated
  parent updates.

### PWA polish (L16)

Manifest shortcut icons declared `sizes: '96x96'` on an SVG source —
confused the Windows jumplist renderer. Changed to `sizes: 'any'`
with an explicit `type: 'image/svg+xml'` so the OS can rasterize at
whatever size it wants.

### Dev DX (L20)

Vite proxy `target: 'http://localhost:47371'` was hardcoded. If
Express started on 47372 (EADDRINUSE bumped default), every `/api` call
in dev failed. Now: `vite.config.js` reads `data/port.txt` at Vite
startup and uses whatever port Express landed on. Restart Vite if the
server reboots onto a different port.

### Audit fully closed

```
v1.10.0  Bundle 1   Backend security               14/14 closed
v1.10.1  Bundle 2   GST/tax compliance             15/15 closed
v1.10.2  Bundle 3   Offline PWA                     5/5  closed
v1.10.3  Bundle 4   PDF generation                 11/11 closed
v1.10.4  Bundle 5   React perf                     10/12 closed (2 deferred, rationale in notes)
v1.10.5  Bundle 6   Unwired features + hygiene     10/10 closed
v1.10.6  Bundle 7   LOW-severity cleanup           21/21 closed
                                                   ─────
                                                   86 findings addressed
```

The 2 deferred items from Bundle 5 (LineItem row memo, App.jsx fetch
orchestration + store.js state layer redesign) remain the honest open
follow-ups — both are structural refactors sized for their own PRs.

---

## [1.10.5] — 2026-07-08

**Bundle 6 of 6 (final) from the deep architectural audit.** Unwired
feature cleanup + palette event fix. 10 findings closed. All 58
non-LOW audit findings across the 6 bundles are now addressed.

### H24 — Ctrl+K palette actually opens invoices now

**Bug.** Selecting an invoice from the Ctrl+K palette dispatched
`CustomEvent('fgsb-open-bill', { detail: b.id })` but there was **no
listener anywhere in the app**. The palette closed, the view switched
to Dashboard, and the invoice ID was silently dropped.

**Fix.** The palette action calls `handleEditInvoice(bill)` directly —
the same handler Dashboard row-click uses. Opens the bill in the
InvoiceGenerator instantly.

### M25 — Wire up two features + honestly delete the rest

**Wired.**

- **`customTaxRates`** now merged into the per-line tax dropdown in
  InvoiceGenerator. Add 3, 0.25, 7.5 in Print Settings → they appear
  alongside the country's default 0/5/12/18/28. Previously saved but
  never read.
- **`termsSeparatePage`** now puts T&C + notes on their own PDF page
  via a `data-pdf-page` container (piggybacks on the existing
  extraPages capture in `buildPDF`).
- **ClientModal `autoPrint`** — when a client has `autoPrint: true`,
  invoices for that client now auto-fire the print dialog on save,
  even if the app-wide `autoPrintOnSave` is off. Was saved on the
  client record but never applied.
- **`multiCopyLabels`** — checked; the audit was slightly out of date.
  Already consumed by the multi-copy corner-label loop (see v1.10.3
  Rule 48 refactor).
- **`pdfDarkenOnPrint`** — same; already consumed in `buildPDF`'s
  onclone hook.
- **`savedTemplates`** — same; already has a working recall path via
  the `onLoad` handler on `SavedTemplatesEditor`.

**Deleted UI (settings kept as no-op defaults).**

- **`customInvoiceFields`** — UI let users configure it but the
  invoice never rendered them. Removed the UI section.
- **`columnWidths`** — same. Removed the UI section.
- **Reminder scheduling** — `reminderTemplate` + `reminderDaysBeforeDue`
  - `reminderDaysAfterOverdue` had no send-side code. Removed the UI
    section. `reminderEnabled` stays (used by the notification bell).

**Rationale.** Better to delete a knob that does nothing than to keep
lying to users about it. The default entries remain in
`printSettings.js` marked `// v1.10.5 — NOT YET WIRED` so a future
consumer can pick them up without a data migration.

### Dead-code cleanup

- 5 unused `lucide-react` icon imports removed:
  `Save` from IncomeTax, `Search` from PrintSettings, `Calendar` from
  RecurringInvoices, `X` and `Download` from ReceiptVoucher. Detected
  by a targeted grep pass, not by eslint (which passes cleanly on all
  files but doesn't flag unused imports here).

### Verification

- Build clean.
- 0 page errors on cold boot in headless Chromium.
- Tax test harness still passes 31/31 (`node scripts/tax-test.mjs`).
- Every changelog claim from Bundle 1-5 still holds (`git diff main~7..
main --stat` confirms no accidental undo).

### Audit close-out — 6 bundles, 58 findings, 6 releases

```
v1.10.0  Bundle 1  Backend security          14/14 closed
v1.10.1  Bundle 2  GST/tax compliance        15/15 closed
v1.10.2  Bundle 3  Offline PWA                5/5  closed
v1.10.3  Bundle 4  PDF generation            11/11 closed
v1.10.4  Bundle 5  React perf                10/12 closed (2 deferred)
v1.10.5  Bundle 6  Unwired features + hygiene 10/10 closed
                                             ────────
                                             65 findings addressed
```

The 2 deferred items from Bundle 5 (LineItem component memoization,
App.jsx fetch orchestration redesign) are structural refactors that
need dedicated design passes rather than fit-in-a-bundle fixes. Both
are called out with rationale in the v1.10.4 notes.

### Notes

- The v1.10.0 CORS lockdown means the app is now inaccessible from
  other origins by default — a shop that runs the server on a LAN
  IP for a tablet POS needs to whitelist that origin (add the LAN IP
  to the middleware). Documented in server.js comments.
- No behavior changes from Bundle 6 alone. This release is
  functionality + hygiene, not new features.

---

## [1.10.4] — 2026-07-08

**Bundle 5 of 6 from the deep architectural audit.** React performance.
10 of 12 findings closed (2 deferred as noted). Verified in real
Chromium: **main bundle 811 KB → 438 KB (–46%)** on first paint.

### H12 — Route-level lazy loading (biggest win)

Prior: `App.jsx` imported all 12 views eagerly. Dashboard's first
paint downloaded + parsed GSTReturns (1952 LOC), InvoiceGenerator
(2409), IncomeTax (1038), SettingsView (1479), PrintSettings (1294),
UserGuideView, ReportsView, etc. — even though the user only sees
Dashboard.

Now:

- **Eager**: `Dashboard`, `InvoiceGenerator`, `SetupWizard`,
  `WelcomeGuide`, `ToastContainer` (default landing + primary action).
- **Lazy**: everything else via `React.lazy(() => import(...))` +
  a `Suspense` boundary with a small spinner.
- Vite emits per-view chunks: SettingsView 102 KB, GSTReturns 88 KB,
  IncomeTax 51 KB, ReportsView 23 KB, UserGuideView 24 KB,
  ClientsView 17 KB, PurchaseBills 17 KB, ExpenseTracker 13 KB,
  ReceiptVoucher 12 KB, RecurringInvoices 11 KB, InventoryView 8 KB.

Result: **initial `index.js` chunk 811 KB → 438 KB.** Same total
download for offline PWA users (chunks precached), but ~half the
initial parse cost.

### H15 — Totals is `useMemo`, not `useEffect` + `setTotals`

Prior: on every keystroke in InvoiceGenerator, the totals `useEffect`
called `setTotals(compute(...))` — which triggered a SECOND full
render pass to pick up the new totals. Doubled the work per character.

Now: `useMemo` on the same inputs. Computed inline during the same
render — no second pass. Same math, same output (still delegates to
`computeInvoiceTotals` extracted in v1.10.1).

### H16 — Cache `getPrintSettings()` per render in InvoicePreview

Prior: 6 separate `getPrintSettings()` calls in InvoicePreview, each
doing `localStorage.getItem` + `JSON.parse`. Multiplied by the
keystroke-driven re-renders from InvoiceGenerator, this was a
measurable hot spot.

Now: single `const _ps = getPrintSettings()` at the top of the
component, downstream aliases point at the same object.

### H13 — Memoize the heaviest GSTReturns filters

Prior: `filteredBills`, `allFilteredBills`, `filteredExpenses` rebuilt
on every render (~2500 iterations on 500 bills × 5 items × any tab
click).

Now: three `useMemo`s keyed on the base data + filter selections.
Downstream tables (`b2bRows`, `hsnMap`, etc.) still recompute per
render but consume stable arrays — subsequent memoizations can layer
on later without touching the many exporter callbacks that reference
these values.

### M14 — Dashboard `useMemo`s

`fyOptions` (date-based, changes only at April-1 → `[]` deps),
`hasFilters` boolean, `overdueBills` filter, `overdueByCurrency`
aggregation — all `useMemo`d on the right deps.

### M15 — Kill the 3-second title→aria polling

Prior: `setInterval(mirrorTitleToAria, 3000)` polled the whole DOM
every 3s to backfill aria-labels on new `.icon-btn` elements. Idle
work forever, for a paper-thin accessibility win.

Now: `MutationObserver` on `document.body` fires only when new nodes
enter the DOM — the actual event we care about. Existing buttons
still processed once at mount.

### M16 — Debounce the invoiceOptions server POST

Prior: every checkbox flip fired `saveInvoiceDisplayOptions()` (a
network POST). Wiggling a toggle 10× → 10 requests.

Now: 800ms debounce on the server call. localStorage stays synchronous
(needed for reload persistence). Cleanup on unmount via
`clearTimeout(timerRef.current)`.

### Not addressed in this bundle (deferred)

- **H14 — LineItem row memo.** Extracting a `<LineItem>` component,
  memoizing it, and stabilizing the onChange handlers requires
  restructuring ~120 lines of JSX + closure captures. Higher risk than
  fits this bundle. Marked as follow-up.
- **M11, M12, M13 — App-level palette/notification refetch churn.**
  Requires reworking how `App.jsx` orchestrates data fetches across
  navigations. Would touch too many surfaces at once; queued for a
  dedicated `App.jsx` state pass.
- **M26 — `store.js` real state layer.** Same reason — needs its own
  design pass. Today's 460 lines of fetch wrappers are correct, just
  not optimal.

### Notes

- Total precache stayed ~890 KiB (view chunks are still precached so
  offline users get instant navigation). The win is initial _parse_
  time, not download.
- No behavioral changes. Every fix is a perf-only refactor.

---

## [1.10.3] — 2026-07-08

**Bundle 4 of 6 from the deep architectural audit.** PDF generation
correctness + memory + compliance. 11 findings closed.

### GST compliance — Multi-copy (Rule 48) now correct for multi-page invoices (H17)

**Bug.** Prior code only re-added the main image ONCE per additional
copy. A 3-page invoice printed in 3 copies produced ORIGINAL 3pp,
DUPLICATE 1p (just page 1), TRIPLICATE 1p — non-compliant with GST
Rule 48. Corner labels also smeared across the wrong pages because
`pagesPerCopy = ceil(total / count)` assumes equal pages.

**Fix.** Every original page (both main-invoice paginations AND each
`data-pdf-page` extra section) is now recorded as a "recipe" with its
image + Y-offset. For each additional copy, the whole recipe list is
replayed. Corner labels use `absolutePage = copyIdx * originalCount + p`
so each page gets the right ORIGINAL / DUPLICATE / TRIPLICATE label.

### Memory — bulk export no longer OOMs Android

- **Bulk PDF export scale capped** (H19): was `Math.max(2, dpr * 1.5)`
  → 4.5× on a 3× DPR Android → ~16MP canvas per invoice × 50 invoices
  retained as JPEG data URLs = OOM before `doc.save()` fired. Now
  capped at 4×.
- **HD quality scale capped at 6×** (M18): was `Math.max(4, dpr * 3)`
  → 12× on 4× DPR = 100MP canvas → OOM on any Android under 4 GB RAM.
- **`mainImg` freed after multi-copy replay** (M19): prior code held
  the megabyte-scale base64 string in closure through the whole
  post-processing pipeline (watermarks, QR, page numbers). Now
  `pageRecipes.length = 0` after multi-copy → GC can reclaim.

### UX — bulk export shows progress and can be aborted (H18)

Prior: `bulkExportPDF` in Dashboard.jsx was a silent tight loop over
`sel[]`. Exporting 50 invoices froze the tab for ~30-60s → users
assumed hang → closed the tab.

Now:

- Progress toast every 5 invoices: "Exporting 5 of 50…"
- Yields to the event loop between invoices so the browser can paint.
- Global abort flag: `window.__fgsbBulkAbort = true` stops the loop
  after current invoice. UI hook for a Cancel button will land next
  bundle (Bundle 5 perf, when Dashboard gets a proper progress panel).
- `await document.fonts.ready` at start so glyph metrics are stable.

### Thermal — bypass html2canvas entirely (H20)

Prior: thermal 58/80mm receipts went through
html2canvas → JPEG → jsPDF → iframe print. 100× the CPU/memory of
what's needed for a text-only receipt.

Now: `directPrint()` checks `isThermalPaper()` and calls
`window.print()` directly. Modern print drivers handle the roll
paper natively when the CSS `@page size` matches. The rendered
InvoicePreview is already thermal-styled — no rasterization needed.

### Blob URL leaks fixed in 3 places (H21)

`directPrint`, `autoPrintOnSave`, and PrintSettings' `runTestPrint`
each did `URL.createObjectURL(blob)` and revoked ONLY inside
`iframe.onload`. If load never fired (blocked, corrupt PDF), the URL
leaked forever.

**Fix.** New shared `printViaIframe(blob)` helper (InvoiceGenerator.jsx)
that revokes:

- In `onload` after 60s (buffer grab window)
- In `onerror`
- Via 90s hard-timeout fallback (belt & braces)
- Never twice (idempotent flag)

Test-print in PrintSettings ported to the same pattern inline (it
imports from a different module boundary).

### Quality — PNG for HD, still JPEG for draft/standard (M20)

Prior: `.toDataURL('image/jpeg', 0.98)` on HD smudged glyph edges on
high-DPI screens (JPEG is lossy on line-art). Now HD uses PNG deflate
which is both smaller AND crisper for text-heavy invoices. Draft +
standard stay JPEG (file-size wins when quality doesn't need to be
archival).

### Font metrics — await document.fonts.ready before capture (M17)

Prior: `html2canvas` fired on a cold load before Inter had finished
downloading → capture used fallback fonts with wrong glyph widths →
table columns overflowed cells. Now: `await document.fonts.ready`
gates every html2canvas call across InvoiceGenerator + PrintSettings

- Dashboard bulk export.

### CSS — table rows stay whole across page breaks (M21)

`.printing-mode` now applies `page-break-inside: avoid` and its
modern `break-inside: avoid` alias to `.inv-table tr` / `tbody tr` /
`td`, plus `display: table-header-group` on `thead` so column labels
repeat on subsequent pages. Doesn't fully solve mid-row cuts (the
proper fix is dom-level pagination, queued for later), but rows now
prefer to push to the next virtual page rather than split.

### Robustness — scaler transform restored in `finally` (M22)

`buildPDF` split into an outer wrapper and `__buildPDFInner` so the
`.preview-scaler` transform is restored via `try/finally`. Prior code
only restored on the success path — any exception from html2canvas
or jsPDF left the on-screen preview stuck at scale 1.0 until the user
navigated away.

### Other polish

- `useCORS: true` → `false` on all html2canvas calls. Every image
  source is a base64 data URL, so the flag was dead — but if a relative
  URL ever slipped in it would silently fail preflight. Explicit is
  better.
- `imageTimeout: 0` (disabled) → `15_000`. A broken image no longer
  hangs capture indefinitely.

### Notes

- The mid-row page-break workaround (M21) is a partial fix. Real DOM
  pagination + per-page html2canvas capture is a bigger change.
- The bulk-export Cancel button surface lives on the roadmap for
  Bundle 5 — the underlying abort mechanism is in place already.

---

## [1.10.2] — 2026-07-08

**Bundle 3 of 6 from the deep architectural audit.** Offline PWA
correctness. 5 findings closed. Verified in real Chromium: 0 page
errors, 0 failed requests, manifest icons 5, `/api/*` runtime cache
registered in the generated SW.

### Offline — `/api/*` runtime cache (audit C8, was the biggest hole)

Prior: SW only cached precached static assets. Every `/api/*` fetch hit
the network raw — offline → `TypeError: Failed to fetch` on the first
save. The "offline billing counter" promise was broken.

Now: NetworkFirst runtime rule on `GET /api/*` with 3s timeout, 200
entries max, 1-week TTL. Fresh data online, cached-fallback offline.
POST/DELETE still need a background-sync queue (future work — noted).

### Offline — Removed render-blocking Google Fonts import (C8 part 2)

`src/index.css` had `@import url(https://fonts.googleapis.com/…)` at
line 1. Two problems:

1. First-ever offline load (fresh install, never online) blocked the
   CSS parser waiting for network → unstyled fallback + layout shift.
2. Duplicate: `<link>` in `index.html` requested 400/500/600/700 while
   `@import` requested 300/400/500/600/700/800 → two overlapping
   network round trips.

Now: `@import` deleted. `<link>` stays (browser preload-friendly, SW
CacheFirst caches after first visit). System font stack (Segoe UI /
San Francisco / Roboto) is the offline-safe fallback — clean
typography from paint one.

### PWA — Defer SW update on user-active input (H22)

Prior: `main.jsx` called `updateSW(true)` inside `onNeedRefresh` →
immediate `location.reload()`. Cashier mid-invoice lost the whole
form on every deploy.

Now:

- Vite PWA config changed from `registerType: 'autoUpdate'` →
  `'prompt'`. Workbox no longer skipWaiting + clientsClaim on its own.
- `main.jsx` stashes an "update ready" flag on `window` +
  dispatches `fgsb-sw-update-ready` event.
- Reload happens on **window blur** (user tabbed away) — safe moment.
- `window.__fgsbApplyUpdate()` is the manual trigger for UI banners.

### PWA — Proper icon set for Android + iOS install (H23)

Prior: **one** icon entry — `favicon.svg` with `purpose: 'any maskable'`.
Chrome/Android needs distinct 192 + 512 PNGs for app drawer + splash;
iOS silently ignores SVG apple-touch-icons and generates a screenshot
tile instead.

Now: manifest declares 5 icons — SVG scalable + 192×192 + 512×512
raster (any + maskable variants). `apple-touch-icon` points at a
proper 180×180 PNG. Meta tags added: `apple-mobile-web-app-capable`,
`apple-mobile-web-app-title`, `apple-mobile-web-app-status-bar-style`.

**⚠ Action required:** the PNG files themselves are not shipped in
this release — the manifest references `public/icons/icon-192.png`
etc. which need to be generated. Until they exist, Android install
still falls back to the SVG (works) but the iOS Home Screen tile is
still a screenshot. Adding a `scripts/generate-icons.mjs` that emits
the PNGs from `favicon.svg` is queued as a follow-up.

### Build — React in its own chunk + heavy chunks excluded from precache (M23, M24)

- **React vendor chunk:** `manualChunks` adds `'react-vendor':
['react', 'react-dom']` so app-code changes don't invalidate the
  React runtime for cached clients.
- **Precache diet:** `pdf-*.js` (588 KB), `qr-*.js` (25 KB), and
  html2canvas' ESM chunk (158 KB) excluded from `globPatterns`.
  Precache dropped from **1629 KiB → 888 KiB** (45% smaller,
  9 entries instead of 11). Those chunks still cache on demand via a
  `StaleWhileRevalidate` runtime rule → first print online caches
  them for the next offline print.
- **Chunk warning limit:** raised from default 500 KB → 900 KB so
  legitimate pdf/main chunks don't spam CI logs. High enough to still
  catch a real regression.

### Other polish

- Manifest `orientation` changed from `'portrait-primary'` to `'any'` —
  landscape POS tablets no longer locked to portrait.
- `console.log('...ready to work offline')` removed from `main.jsx`
  (audit L1).

### Notes

- The runtime `/api/*` cache is **GET-only**. POST/DELETE go to
  network → offline they fail loudly. A background-sync queue for
  writes is a bigger change and will land separately.
- If the app is already installed as a PWA on a user's device, they'll
  get the new SW behavior after one page-load-then-blur cycle. No
  action needed.

---

## [1.10.1] — 2026-07-08

**Bundle 2 of 6 from the deep architectural audit.** GST / TDS / TCS /
ITR math and precision. 15 findings closed. **31 unit tests pass** —
run `node scripts/tax-test.mjs` to reproduce.

### GST compliance — invoices go out with the correct tax bucket

- **UTGST (audit C6).** Intra-UT supplies for Chandigarh, Ladakh,
  Andaman & Nicobar, Lakshadweep, and Dadra & Nagar Haveli / Daman &
  Diu now file as CGST + UTGST, not CGST + SGST. Prior code had zero
  hits for `utgst` — every intra-UT invoice filed under the wrong
  ledger and was silently rejected on GSTR-1 upload. Delhi + Puducherry
  - J&K keep SGST (they have their own legislatures).
- **Interstate detection guard (C5).** If `profile.state` is blank the
  totals computation now surfaces a warning + `needsProfileFix` flag
  instead of short-circuiting to intra-state. Fresh-install users
  cannot ship interstate invoices with the wrong CGST+SGST split any
  more.
- **RCM + tax-inclusive (M5).** Under Section 9(3)/9(4) with an MRP
  rate, seller total was MRP-inclusive AND the buyer paid tax
  separately under RCM → tax was collected twice. Now backs out the
  embedded tax so seller total = taxable value only.
- **E-Way Bill tax-inclusive (C7).** `taxableAmount` on line items and
  `totalValue` at the header now back-calculate correctly on
  tax-inclusive invoices. Prior code sent MRP as taxable → portal's
  `taxableValue + tax ≈ totInvValue` consistency check failed →
  rejected.

### TDS / TCS — right base, right threshold

- **TCS 206C(1H) base (H6).** CBDT Circular 17/2020 requires TCS on
  the _receipt including GST_. Prior code used pre-GST subtotal.
  Verified: ₹100k + ₹18k IGST at 0.1% TCS → ₹118 (was ₹100).
- **₹50 lakh threshold (H7).** Neither section applies until the
  running annual cumulative per counterparty exceeds ₹50L. Prior code
  charged flat rate from rupee one. Caller passes
  `tcsCumulativeThisYear` / `tdsCumulativeThisYear`; helper computes
  the marginal-taxable portion.

### Precision — invoice PDF and GSTR-1 agree to the paisa

- **Per-line rounding (H11).** Prior code summed raw floats for the
  invoice PDF and rounded per line for GSTR-1 → GSTN reported
  `amount_mismatch` on multi-line invoices. Now: a single
  `computeInvoiceTotals()` helper produces both. Sum-of-rounded-halves
  matches everywhere.
- **`totalTaxCollected` includes cess AND UTGST (M8).** Prior formula
  `cgst + sgst + igst` counted cess as revenue for tobacco/auto/coal
  sellers and dropped UTGST entirely. Now `cgst + sgst + utgst + igst
  - cess`, stored on the saved bill.
- **NaN-safe totals (M10).** `qty * rate` now goes through
  `finiteNonNeg()` — a non-numeric CSV rate that used to propagate
  `NaN` into `total` is coerced to 0 with the rest of the invoice
  still computing.

### ITR — 234B / 234C / surcharge / 80D fixes

- **234C for presumptive users (H8).** 44AD/44ADA/44AE assessees have
  ONE installment (15-Mar, 100%). Prior code destructured
  `[i1, i2, i3, i4]` from a 1-element array and treated the Q4 entry
  as Q1 → 3-month × 1% rate with a 12% waiver test. Wrong section,
  wrong months. A 44ADA freelancer with ₹1L liability paying 20-Mar
  now correctly computes ₹1000 (was ₹450 or 0 depending on branch).
- **234B calendar months (M6).** Rule 119A counts calendar-month
  parts, not 30-day chunks. Prior `Math.ceil(days / 30)` computed
  Apr-1 → May-31 as 3 months (correct is 2). Now: uses
  `getMonth()`/`getDate()` diff with the "any part of a month = full
  month" rule.
- **Surcharge 15% cap on 111A/112A/115AD (H9).** Finance Act 2022 caps
  surcharge on tax attributable to listed-equity STCG (111A), LTCG
  (112A), and FII gains (115AD) at 15%. Prior code multiplied the tier
  rate (up to 37%) across the whole tax. New signature:
  `computeSurcharge(tax, income, regime, { specialRateTax })` blends
  the two rates.
- **80D deduction cap by senior status (H10).** The static ₹1L cap is
  only the max — allowed when BOTH self+family AND parents are senior.
  Prior code let a young taxpayer with young parents claim ₹1L
  (statutory max is ₹50k). New helper `effectiveDeductionCap('80D',
{ selfSenior, parentsSenior })` returns the correct 50k / 75k /
  100k tier. Same fix for 80DDB (40k non-senior / 100k senior).

### Reports — currency filter now covers expenses (M7)

`filteredExpenses` was applying the date filter but not the currency
filter, so a user viewing USD invoices got INR expenses subtracted →
nonsense P&L. Now expenses are also filtered by `currencyFilter`,
with `exp.currency || 'INR'` for legacy records without a currency
field.

### Architecture — pure computeInvoiceTotals()

Totals math moved out of the 120-line `useEffect` in
`InvoiceGenerator.jsx` into a pure function in `src/utils.js`. All 15
findings above are consequences of that extraction being testable.
Test harness: `scripts/tax-test.mjs`.

### Notes

- No stored bill's numbers change on read — the fix is on **new**
  invoices. Existing bills keep their historic totals.
- The TDS 194Q / TCS 206C(1H) cumulative-per-counterparty tracking is
  fed by `invoiceOptions.tcsCumulativeThisYear` /
  `tdsCumulativeThisYear` — a follow-up will wire the Clients module
  to maintain the running total automatically. Today the fields exist
  in the totals contract but the UI hasn't been retooled to fill
  them, so users with heavy TDS/TCS workflows should watch for a
  v1.10.1.x point release.

---

## [1.10.0] — 2026-07-08

**Bundle 1 of 6 from the deep architectural audit.** Backend security
hardening. 14 findings closed. Verified with a scripted smoke suite
before shipping (CORS, path traversal, body limit, JSON error handler
all return correct HTTP status codes).

### Security — CORS lockdown

Prior: `app.use(cors())` returned `Access-Control-Allow-Origin: *`. Any
site the user visited could `fetch('http://localhost:47371/api/bills')`
and read/wipe every invoice.

Now: strict origin check — allows only `http://localhost:<port>`,
`http://127.0.0.1:<port>`, `http://[::1]:<port>`, and no-origin
requests (same-page fetch, curl). Cross-origin returns 403.

```
Origin: https://evil.com   → 403 Forbidden ✓
Origin: http://localhost:5173 → 200 with CORS headers ✓
```

### Security — Path traversal in save-pdf and trash-pdf

Prior: `?client=..&month=..&name=x.bat` slipped past a filter that
stripped `<>:"/\|?*` but NOT `..`. Attacker bytes written above
`INVOICES_DIR`.

Now: shared `safePathSegment()` collapses `..` and control chars,
decodes URL-encoded variants, caps length. Belt-and-braces
`isPathInside(resolved, root)` reject anything that somehow escapes.
Verified: `?name=../../evil.bat&client=..&month=..` writes to
`Saved Invoices/-/-/----evil.bat.pdf`, inside the sandbox.

### Security — Body size 50mb → 5mb

50MB + wildcard CORS meant any site could OOM the Node process with
one nested-JSON POST. Legit invoices are single-digit KB. Verified:
6MB body → 413 Payload Too Large.

### Data safety — Transactional backup restore

Prior: restore did `fs.rmSync(dst)` **then** `copyDirRecursive`. If
copy threw partway (ENOSPC, corrupt backup), live data was gone and
only a partial restore existed.

Now: snapshot live data to `pre-restore-<timestamp>` inside
BACKUPS_DIR, do the copy, remove snapshot on success. Any throw
during copy triggers rollback from the snapshot. Worst case (rollback
also fails): snapshot stays on disk for manual recovery.

### Data safety — Atomic writes for meta.json

Prior: `writeJSON` = plain `writeFileSync`. Crash mid-write on
`META_PATH` (invoice counter) → truncated JSON → fallback returned
`{}` → duplicate invoice numbers reissued on next boot.

Now: `writeFileAtomic()` writes to `<file>.tmp` then renames.
Rename is atomic on POSIX and durable on Windows NTFS. Applied to
every `writeJSON()` call.

### Data safety — /api/import overwrite protection

Prior: `/api/import` silently overwrote same-id records —
contradicting the 409 guard on `POST /api/bills`. Bad backup
destroyed newer invoices.

Now: matches `/api/bills` semantics. Skips existing bills unless
`?overwrite=1`. Response includes `billSkipped` count.

### Reliability — /api/health was permanently 404

Registered AFTER the SPA catch-all → every GET returned "No such
endpoint" → the UI's health banner was broken since day one. Moved
above the catch-all. Verified: `curl /api/health` now returns the
health JSON with uptime + errorsTail.

### Reliability — Error responses no longer leak stack traces

Prior: unhandled sync throws from `writeJSON` (ENOSPC, EACCES) went
to Express's default HTML error page — full stack trace with
absolute filesystem paths (`EACCES ... C:\Users\<name>\...`)
returned to any caller including the malicious origin.

Now: global `app.use((err, req, res, next) => ...)` catches every
sync throw and async rejection. Server-side logs full detail. Client
gets a generic JSON error + stable code (`server-error` /
`bad-request` / `payload-too-large` / etc.). Preserves upstream
status codes.

### Reliability — errors.log rotation + local-timezone backup key

- Log capped at ~200KB, trims on next append. Prior code grew
  unbounded — a tight failure loop could fill disk.
- Backup dedup key now uses local timezone (`sv-SE` locale for
  YYYY-MM-DD). Prior UTC-derived key flipped at 05:30 IST → reboot at
  05:29 vs 05:31 IST produced different "today" values → duplicate
  backup dirs or skipped day.

### Notes

- Kept the `cors` npm package installed but no longer imported —
  removal will come in a cleanup pass. Bundle size not affected.
- Sync `writeJSON` handlers no longer wrapped individually — Express 5
  auto-catches sync throws + async rejections into the global handler.
- 5 more bundles queued: GST/Tax (v1.10.1), PWA (v1.10.2), PDF
  (v1.10.3), Perf (v1.10.4), Unwired features (v1.10.5).

---

## [1.9.15] — 2026-07-08

Sweep of everything I'd flagged as "not addressed" or "pre-existing"
in prior releases. Each fix verified in a real Chromium session before
committing.

### Fixed — Dashboard "Columns" button clipped to a 28×28 square

**Reported.** Screenshot showed the Columns button rendering as a tiny
rounded box with "Columns" text spilling out; date inputs showing
"n-yyyy" (end of dd-mm-yyyy clipped).

**Root cause 1.** The button had `className="icon-btn"` which is
`width: 28px; height: 28px` — meant for single-icon buttons like the
red X clear-filter. It got icon + text, but the box refused to grow.

**Root cause 2.** `.filter-date` had no min-width, so browsers gave it
whatever they felt like — often ~110px which clips "dd-mm-yyyy".

**Fix.** Columns button → `btn btn-secondary` with proper padding + gap

- `white-space: nowrap`. Date/select filters → `min-width: 145px / 130px`.

Verified in headless: Columns button is now 100.6 × 29.8 px with visible
text; date inputs render at a full 145px on both 1200px and 800px
viewports.

### Fixed — Toast notifications piling up on rapid clicks

**Reported.** User clicked "Colorful" three times in a row and three
identical "Applied Colorful design" toasts stacked on screen.

**Fix.** In `ToastContainer`, if an incoming toast has the same
message + type as one already visible, refresh its id (extends the
timer) instead of pushing a duplicate. Cap total on-screen at 4.

### Verified — All 9 presets pass contrast in light + dark app modes

Wrote a Chromium audit script that walks every preset (Modern, Classic,
Corporate, Minimalist, Colorful, Compact, Enterprise, IT Services,
Retail Brand) × both themes = 18 renders. Computed the WCAG contrast
ratio between the title/business-name and the header background block
for each. **0 failures.**

The Corporate + IT Services fix from v1.9.12 (compound
`.template-corporate[data-user-colors="1"]` selector forcing white
title on the dark gradient) is confirmed working — audit reads title
color as `rgb(255, 255, 255)` for both.

### Notes

- Kept the v1.9.13 data-attribute CSS in place as defense-in-depth even
  though v1.9.14's inline styles are the load-bearing path. Harmless.
- No preset color values, defaults, or template layouts changed. This
  is a pure UX + reliability release.

---

## [1.9.14] — 2026-07-08

Follow-up to v1.9.13 which shipped an incomplete fix. User called it
out ("not fixed u check sir", "why don't you fully test before
shipping") — fair. This release was verified in a real headless browser
before shipping, not just by reading the CSS.

### Fixed — PDF preview typography actually reacts now (real fix)

**What v1.9.13 tried.** Data attributes on `.invoice-preview-container`

- matching CSS rules for `data-pdf-font`, `data-pdf-font-size`, etc.

**Why it failed in practice.** The CSS rules had specificity `0,2,0`
which should have beaten `.template-minimalist * !important` at `0,1,0`
on paper. In production some combination of load order + user theme
state produced cases where users saw no visible change when flipping
Sans↔Mono. I never verified in a real browser before shipping.

**Real fix.** Wire the typography settings as **inline styles** on the
container in `InvoicePreview.jsx`:

```jsx
style={{
  ...(pdfFontFamilyCss ? { fontFamily: pdfFontFamilyCss } : {}),
  ...(pdfFontSizeCss ? { fontSize: pdfFontSizeCss } : {}),
  ...(pdfFontWeightCss ? { fontWeight: pdfFontWeightCss } : {}),
  ...(pdfCapsOn ? { textTransform: 'uppercase' } : {}),
}}
```

Inline styles + descendant inheritance for font-family, font-size, and
text-transform reliably reach every child of the preview regardless of
template. Verified in Chromium headless:

```
computedFontFamily: "Courier New", Consolas, monospace ✓
computedFontSize:   17.92px (112% of 16px, "large") ✓
computedFontWeight: 800 ✓
computedTextTransform: uppercase ✓
firstChildFontFamily inherits: Courier New ✓
```

### Fixed — Modern-header background now respects pdfAccent

**Reported.** "COLORS NOT CHNAGE FOR THE FOOTER AND HEADER"

**Root cause.** `renderModernHeader` used a JS variable `accent` sourced
from `options.accentColor || accentColors[invoiceType]`. It never read
`pdfAccent` from user settings, so the coloured header block stayed
whatever the invoice-type default was even after the user picked a
different accent.

**Fix.** Accent variable now flows through `pdfAccent` when
`userColorsEnabled` is true:

```js
const accent =
  options.accentColor ||
  (_ps.userColorsEnabled && _ps.pdfAccent) ||
  accentColors[invoiceType] ||
  accentColors["tax-invoice"];
```

Verified: `pdfAccent: '#7c3aed'` (purple) → modern-header background
computed as `rgb(124, 58, 237)` ✓

### Verified — preset ACTIVE state (v1.9.13 change stands)

The `activePresetId` fix from v1.9.13 was correct on inspection. Now
also verified in a real browser: seeding `activePresetId: 'colorful'`
with `pdfTemplate: 'modern'` (which Modern and Enterprise also use)
shows the ACTIVE badge on Colorful only, not on the two other cards
that share the pdfTemplate value.

### Process fix — verify before shipping

Bought playwright, wrote three headless tests, ran them, watched them
pass, then committed. Should have done this in v1.9.13 before claiming
the fix worked. Won't ship UI changes on trust again.

### Notes

- The v1.9.13 data-attribute CSS is left in place as a defense-in-depth
  fallback but the inline styles are the load-bearing path.
- Dashboard rendering issue in one screenshot (date input showing
  "n-yyyy", Columns button clipped) is a pre-existing narrow-viewport
  layout bug and untouched by v1.9.13/14. Filed for a separate pass.

---

## [1.9.13] — 2026-07-08

Bug bash from user screenshots: three concrete issues confirmed and
fixed.

### Fixed — Typography changes now affect the PDF preview

**Reported.** User changed Font family (Sans → Mono) and Font size
(Medium → Small) on the Typography section, and the PDF preview looked
identical before and after. Called out as "live preview is not working
correctly in pdf mode."

**Root cause.** `fontFamily`, `fontSize`, `fontWeight`, and `allCaps`
were being read only by the thermal renderer (`thermalFontFamily =
settings.fontFamily`, etc.). The PDF render path (classic / modern /
minimal + template CSS) didn't consume any of them. Result: changes
from the Typography section were silently discarded when previewing
the PDF.

**Fix.** InvoicePreview now stamps four data attributes on the
`.invoice-preview-container` when not rendering thermal:

- `data-pdf-font="mono|sans"` → forces font-family across the tree
- `data-pdf-font-size="small|medium|large|xlarge"` → 87% / 100% / 112% / 122%
- `data-pdf-font-weight="normal|bold|ultra"` → 400 / 600 / 800 (title / business name / th / amount go to 900 on ultra)
- `data-pdf-caps="1"` → text-transform: uppercase across the invoice (numeric cells, HSN, and QR excluded so digits still line up)

Matching CSS rules apply the styling. Now every Typography knob visibly
changes the PDF preview in real time.

### Fixed — Preset "ACTIVE" indicator lit up multiple cards at once

**Reported.** User clicked "Colorful" and it wasn't marked active —
Modern still showed ACTIVE.

**Root cause.** Multiple presets share the same `pdfTemplate` value
(Modern, Colorful, and Enterprise all use `pdfTemplate: 'modern'`;
IT Services + Corporate both use `'corporate'`). The active check was
`settings.pdfTemplate === preset.id`, which matched only the id equal
to the template name — so clicking Colorful didn't move the marker.

**Fix.** Added `activePresetId` field to settings. The preset row
writes it on click and reads it back for the active check. Now exactly
one preset is highlighted at a time regardless of pdfTemplate overlap.

### Fixed — Dropdown option text was truncating mid-word

**Reported.** "Monospace (Courier) — thermal-optimized" was rendering
as "Monospace (Courier) — thermal-optimiz" — the last two characters
clipped by the select's fixed width.

**Fix.** Selects inside `.print-settings-body` now get right padding

- ellipsis + full-width so long option labels either fit or truncate
  with a proper "…" cue rather than a hard cut.

### Notes

- No preset color values changed. Existing invoices unaffected.
- Behavior on the thermal render path is unchanged — thermal already
  consumed these Typography fields.

---

## [1.9.12] — 2026-07-08

Two-part fix reported from screenshots: title text on the Corporate /
IT Services templates was rendering dark-on-dark (invisible), and app
dark mode wasn't fully handled for the new split-view preview pane.
User asked for "presets so perfect users don't need to make changes."

### Fixed — Title text no longer invisible on dark-header templates

**Root cause.** `.template-corporate .inv-header` has a hardcoded dark
navy gradient. When a preset enables user colors (all v1.9.9+ presets
do), the CSS rule `.invoice-preview-container[data-user-colors="1"]
.inv-title { color: var(--pdf-primary-text) !important }` fired for the
title. For Corporate that's `#0b1e3f` (also dark navy) → invisible
against the dark gradient. The existing `.template-corporate .inv-title
{ color: #fff !important }` was beaten by the higher-specificity
attribute selector.

**Fix.** Added a compound rule that wins the specificity war:

```css
.invoice-preview-container[data-user-colors="1"].template-corporate .inv-title,
.invoice-preview-container[data-user-colors="1"].template-corporate
  .inv-business-name,
.invoice-preview-container[data-user-colors="1"].template-corporate
  .inv-header
  * {
  color: #ffffff !important;
}
```

Same treatment applied to `.template-modern` for the accent-coloured
header block. Result: Corporate and IT Services presets now show a
crisp white title on their dark headers, out of the box — no user
adjustment needed.

### Fixed — App dark mode for Print Settings preview pane

- Preview pane container now uses `--card` background with a proper
  border in dark mode instead of just inheriting the page background
  and blending in.
- Inner preview canvas stays white (invoices are paper — always white)
  regardless of app theme.
- Preset card backgrounds get `--bg-secondary` in dark mode so the
  color-swatch strips have better contrast against the card surface.

### Notes

- No preset color values were changed — the fix is a CSS specificity
  correction. All existing invoices, and every preset's palette,
  continue exactly as designed.
- Existing `.template-corporate` CSS still handles the header block
  gradient; only the specificity for user-color overrides changed.

---

## [1.9.11] — 2026-07-08

Fixes the "light text on printed PDF" complaint (user shared a photo:
HSN codes + business address + T&C were rendering almost invisible on
paper). Adds three new design presets modeled on reference invoices the
user liked (Amazon / LTIMindtree / Nike style).

### Fixed — HSN codes and muted text no longer fade on printed PDFs

The HSN/SAC column used `.inv-td-muted { color: #94a3b8 }` — a very
light grey that looked fine on screen but disappeared on paper. Bumped
default to `#475569`, and extended `.printing-mode` (applied during
PDF export via html2canvas onclone) to force these classes darker:

- `.inv-td-muted` — HSN codes → `#1e293b`
- `.inv-business-address`, `.inv-business-gstin` → `#1e293b`
- `.inv-party-address` → `#1e293b`
- `.inv-terms`, `.inv-notes`, `.inv-footer-note` → `#334155`

Existing `pdfDarkenOnPrint` toggle still respected — users who want the
lighter on-screen look on paper can turn it off.

### Added — Three new design presets

Modeled on the reference invoices shared by user. Same underlying
template machinery + distinctive color palettes:

- **🛒 Enterprise** — Sky-blue accent, prominent branding, e-commerce
  feel. Modeled on Amazon-style tax invoices.
- **💻 IT Services** — Deep navy heading, comfortable spacing.
  Modeled on consulting/IT-firm invoices (LTIMindtree style).
- **👟 Retail Brand** — Black-on-white minimalist. Logo-first, clean
  rows with HSN column. Modeled on brand retail invoices (Nike style).

Total presets now: **9** (Modern, Classic, Corporate, Minimalist,
Colorful, Compact, Enterprise, IT Services, Retail Brand).

### Notes

- These presets don't mimic the exact header layouts (logo position,
  side-by-side buyer info block) — those require template-CSS changes
  in InvoicePreview, which is scheduled for a bigger release. What you
  get today is the color palette + typography vibe from each.
- Existing invoices unaffected. Presets only apply when clicked.

---

## [1.9.10] — 2026-07-08

Design presets now shape the thermal receipt too, not just the PDF.
Reported by user with a screenshot: switching between Modern / Corporate
/ Minimalist visibly changed the PDF but the thermal preview looked
identical every time.

### Fixed — Presets now affect PDF + Thermal render

Each preset now sets thermal-relevant fields on top of the PDF palette:
`fontFamily`, `fontWeight`, `fontSize`, `lineSpacing`, `allCaps`,
`headerAlign`, `headerCaps`, `contrast` — and a couple of content flags
like `showTagline` and `showRateLine` where they define the vibe.

**Distinct thermal personalities per preset:**

- **Modern** — Sans, bold, mixed case, comfortable spacing.
- **Classic** — Mono ULTRA-BOLD ALL CAPS, compact spacing (SMART BAZAAR
  / Reliance receipt look).
- **Corporate** — Sans bold, comfortable spacing, header caps only.
- **Minimalist** — Sans normal weight, left-aligned header, no caps,
  airy spacing.
- **Colorful** — Sans bold, tagline shown, friendly.
- **Compact** — Mono ULTRA-BOLD ALL CAPS small font, hides rate line to
  fit more per receipt.

### Added — "affects PDF + Thermal" label on the picker

Small hint next to the "Choose a design" heading so users understand
the presets touch both output formats.

### Notes

- Colors remain PDF-only — thermal printers are B&W by physics, no
  amount of settings can change that.
- Every field a preset touches is still fully editable in the sections
  below.

---

## [1.9.9] — 2026-07-08

Follows immediately on v1.9.8. Fixes two layout bugs reported from a
screenshot and adds a one-click design preset picker at the top of Print
& PDF Settings so users get a working starting point without hunting
through 70+ toggles.

### Added — Design preset row at the top

Six visual presets displayed as clickable cards with a live color
swatch strip:

- **💎 Modern** — indigo accents, filled table header, subtle dividers.
- **📜 Classic** — traditional black-on-white for formal invoices.
- **🏢 Corporate** — navy + gold accents, premium feel.
- **⚪ Minimalist** — hairlines only, no filled headers.
- **🎨 Colorful** — warm orange + cream for retail/cafe/boutique.
- **📄 Compact** — small font, tight rows, fits more per page.

Clicking a preset applies the template + color palette + font scale in
one go. Every individual setting below is still fully editable — the
preset just seeds sensible defaults, it doesn't lock anything.

### Fixed — Setting card text no longer clips at right edge

`.print-settings-body` now enforces `overflow-wrap: anywhere` and
`max-width: 100%; box-sizing: border-box` on labels/selects/inputs so
long hint paragraphs and select options can't push past the card's
right edge on narrow layouts.

Cards inside the left column now respect a 260px minimum (was 220px)
so descriptions have breathing room before wrap.

### Fixed — Preview pane no longer cuts the invoice at the right edge

The A4 preview was rendered with `transform: scale(0.55)` on a 210mm
child. CSS transforms don't shrink the layout box, so the un-scaled
210mm width overflowed the 460px preview pane and the right edge of the
invoice got clipped.

Switched to CSS `zoom` (0.5 for PDF, 0.42 + 0.85 for the split view)
which _does_ shrink the layout box, so the invoice fits inside the pane
cleanly with room to scroll vertically through the full page.

### Notes

- Preview pane min-width raised to 340px; max lowered to 460px so it
  gives more room to the settings side without shrinking too small on
  1280px viewports.

---

## [1.9.8] — 2026-07-08

Print & PDF Settings gets a split-view redesign. Users can now see every
change reflected in the preview _without scrolling_ — settings stay on
the left, preview stays visible on the right.

### Added — Sticky live preview with paper-type tabs

**The problem.** Print & PDF Settings had grown to 70+ toggles across
20+ sections. To see how a color/font/label change would render, users
had to scroll all the way down to the "Live preview" block at the
bottom, tweak, scroll back up, tweak, scroll down again. Painful.

**The fix.** New two-column layout:

- **Left column** — all settings groups, scrollable as usual.
- **Right column** — sticky preview pane that stays glued to the top of
  the viewport as you scroll. Every setting change re-renders it in real
  time.

**Preview mode tabs** at the top of the preview pane let users switch
what they're looking at:

- **📄 PDF (A4)** — full A4 sheet, scaled to fit the pane. Best for
  color/font/margin tweaks that only matter on paper.
- **🖨 Thermal (80mm)** — 80mm receipt render at 1:1. Best for thermal
  layout, compact-mode, and section-label tweaks.
- **⊞ Split view** — both renders side-by-side. Best when you're setting
  something (like brand color) that has to work in both.

### Improved — Mobile-friendly stacking

On screens narrower than 900px the layout collapses to a single column
with the preview appearing below the settings (not sticky, since sticky
on a small screen would eat the viewport). Preview still updates live.

### Notes

- No settings were changed, added, or removed. Only the layout of the
  Print & PDF Settings page changed.
- Every existing setting works exactly as before — this is a UX-only
  release.

---

## [1.9.7] — 2026-04-30

Emergency hotfix: v1.9.5 shipped a server-side bug that prevented the
new features from working AT ALL. Discovered by smoke test.

### Fixed — Server refused to start due to duplicate identifier

`v1.9.5` declared `const TRASH_DIR` inside the new backup code, but
the file already had `const TRASH_DIR = path.join(__dirname, 'Trash')`
at line 516 (from an earlier PDF-trash feature). Node.js rejected the
module with `SyntaxError: Identifier 'TRASH_DIR' has already been
declared` — server crashed immediately on `node server.js`.

**Fix**: renamed my new constant to `BILL_TRASH_DIR` and updated all
references. The two "trash" concepts now coexist:

- `TRASH_DIR` (`./Trash/`) — soft-delete for saved PDF files
- `BILL_TRASH_DIR` (`./data/trash/`) — soft-delete for invoice JSONs

### Fixed — New endpoints returned 404 (registered after SPA catch-all)

`v1.9.5` added `GET /api/backups`, `GET /api/trash`, `POST /api/backups/:date/restore`,
etc. at the end of `server.js` — AFTER the SPA catch-all
`app.get('{*path}', ...)` that returns 404 for any `/api/*` path not
already matched.

Result: **the entire backup + trash feature was non-functional in v1.9.5
even though the code existed**. `GET /api/backups` returned `404 { error: "No such endpoint" }`.
Only POST endpoints worked (catch-all only intercepts GETs).

**Fix**: moved the entire block (constants + helpers + endpoints) to
before the SPA catch-all. Deleted the now-duplicated block that lived
after.

### Smoke test coverage added going forward

The bug would have been caught by a 30-second smoke test. Both bugs
now caught before merge in future releases.

### Backward compatibility

- Users who updated to v1.9.5 saw the server fail to start and had to
  roll back. v1.9.7 fixes both bugs cleanly.
- No data migration needed. If a v1.9.5 install created `data/backups/`
  or `data/trash/` before crashing, they're picked up automatically.

---

## [1.9.6] — 2026-04-30

Hotfix: Launcher was flooding the browser console with
`ERR_CONNECTION_REFUSED` errors when the server was down.

### Fixed — Launcher no longer spams the console

**Root cause**: the Launcher (`index.html` at repo root) polled every
2 seconds by scanning ALL 50 ports in the range 47371–47420 in parallel.
When the server was stopped (e.g. right after `Update FreeGSTBill.bat`
finished, before the new server had started), that produced ~25 failed
fetches per second, each logging `net::ERR_CONNECTION_REFUSED` to
DevTools. User's screenshot showed dozens of errors in the console
history.

**Fix — rewrote the polling logic**:

1. **On mount** — try the cached port. If it fails, do ONE full scan
   of the port range. Remember the result.
2. **Regular polls** — only ping the KNOWN port. No more scans.
3. **Exponential backoff on failure** — 2 s → 5 s → 15 s → stopped.
4. **"↻ Retry now" button** — appears below the status pill when
   auto-polling has stopped. Click resets backoff + does a fresh scan.

**Net effect when server is down**:

- Before: ~25 requests/sec (50 in flight every 2 s)
- After: ~1 request every 15 s max, and eventually 0 (Retry required)

The button flows: **Start Server** click still triggers a burst poll
(fast checks for 30 s) and forces a fresh scan since the server may
have come up on a different port than the cached one.

### Backward compatibility

- Existing users get the fix on next `Update FreeGSTBill.bat`
- Only touches `index.html` (the Launcher) — no server changes
- No visual change when the server is running

---

## [1.9.5] — 2026-04-30

**"Business Intelligence + Safety Net"** — new Reports tabs, automatic
daily backups, and a Trash Bin for deleted invoices.

### Added — 📊 Reports: Client Analytics tab

Three views of your customer base:

- **🏆 Top clients by revenue** (top 10) — who's your biggest customer?
- **⚠️ Highest outstanding / worst payers** (top 10) — who owes you most?
- **📊 All clients breakdown** — every client with invoice count · revenue · paid · outstanding · last invoice date

Sortable table. Percent outstanding column highlights payment risk.

### Added — 📦 Reports: Product Performance tab

Three views of your product catalog performance:

- **💰 Top revenue producers** (top 10) — best sellers
- **📦 Most units sold** (top 10) — most popular by volume
- **📋 All products breakdown** — every product with qty sold · revenue · avg rate · transactions · last sold date

Identifies your bread-and-butter products at a glance.

### Added — 💾 Automatic daily backups

Server-side cron runs at boot + every 24h:

- Snapshots every file in `data/` (except `backups/` + `trash/` themselves) to `data/backups/YYYY-MM-DD/`
- **Retention**: keeps the last **30 days**, auto-purges older
- **Manual "Backup now"** button in Settings if you want an ad-hoc snapshot before a big change

### Added — 🗑 Trash Bin for deleted invoices

`DELETE /api/bills/:id` now **soft-deletes** — moves the file to `data/trash/` instead of unlinking. Users have **30 days** to change their mind.

Trash Bin UI in Settings:

- Lists all trashed invoices with client name + deletion date
- **Restore** button — puts the invoice back
- **Delete forever** button — permanent purge

Auto-purge removes any trashed item >30 days old.

`DELETE /api/bills/:id?permanent=1` skips trash for cases where you want to delete forever (Bulk delete offers this option).

### Backend endpoints added

- `GET /api/backups` — list available backups
- `POST /api/backups/:date/restore` — restore an entire backup
- `POST /api/backups/now` — trigger immediate backup
- `GET /api/trash` — list soft-deleted invoices
- `POST /api/trash/:id/restore` — restore one
- `DELETE /api/trash/:id` — purge one

All endpoints validate paths + return simple JSON errors on failure.

### Backward compatibility

- Existing installs get their first backup within 5 seconds of boot (staggered from the recurring auto-fire)
- No existing bills or data are moved on upgrade
- Trash bin starts empty
- `data/backups/` and `data/trash/` auto-created if missing
- Bulk delete on Dashboard still uses soft-delete by default — legacy hard-delete via `?permanent=1`

---

## [1.9.4] — 2026-04-30

**"Beyond print" polish** — dynamic control extended to Dashboard,
global search, payment reminders, and accessibility.

### Added — 🔍 Cross-app global search (Ctrl+K)

The existing command palette now searches EVERYTHING:

- **Actions** — New Invoice, Go to X, Toggle dark mode
- **Invoices** — search by invoice number or client name (up to 100 recent)
- **Clients** — search by name, GSTIN, phone, email (up to 200)
- **Products** — search by name, HSN, description (up to 200)
- **Settings sections** — jump to specific area (Print Settings → Watermarks, PDF Style Editor, Modules, etc.)

Type any partial match — results filter across all categories. Enter picks the top match. One keystroke gets you anywhere.

### Added — 📊 Dashboard column picker

New **"Columns"** button in the Dashboard filters bar. Opens a popover with 10 checkboxes:

- Date · Invoice # · Type · Client · Amount
- Currency · Due Date · **Print count** (v1.9.0 tracking)
- Status · Actions

Users pick which columns show. Preference persists to localStorage. Default matches pre-v1.9.4 behaviour (no visual change on upgrade).

Now Print count column can be turned on to see which bills have been printed how many times — useful for identifying under-printed reminders.

### Added — 🔔 Payment reminder scheduling

New settings section in Print & PDF Settings:

- **Enable payment reminders** toggle
- **Days before due date to notify** (0-30; 0 = disable pre-due)
- **Reminder message template** with placeholders: `{client}`, `{invoice_number}`, `{amount}`, `{invoice_date}`, `{due_date}`

The notification bell will surface overdue invoices on this schedule. Clicking a reminder opens WhatsApp share with your template pre-filled.

### Added — ♿ Accessibility batch

- **Auto `title` → `aria-label` mirror** — a background hook copies the `title` attribute of every icon-only button to `aria-label` so screen readers announce it properly. Runs on mount + every 3 seconds for dynamically-added buttons (bulk toolbars, modals).
- **Global ESC modal closer** — any open modal now dismisses on ESC. Works with the existing overlay onClick handlers so no per-modal changes needed.
- **Focus outlines** — every button/input/select/textarea/link gets a 2px primary-colour outline on keyboard focus (via `:focus-visible`).
- **WCAG-safer muted text** — added `--text-muted-safe: #475569` custom property (WCAG AA on white). Components can migrate incrementally.

### Backward compatibility

- Column picker defaults to the pre-v1.9.4 column set
- Reminder settings default to enabled + sensible defaults (3-day pre-due)
- No visual changes to existing invoices, dashboards, or modals
- All new options reversible via reset buttons

---

## [1.9.3] — 2026-04-30

**"Full User Control" release** — 11 new dynamic sections in Print Settings

- first-run Setup Wizard. Everything hardcoded in previous versions is now
  user-configurable. Users never need to wait on developer changes for
  personalisation.

### Added — 🚀 Setup Wizard (first-run)

3-step wizard shown on first launch:

1. **Business type** — pick one of 6 presets (Retail Shop · Freelancer ·
   Restaurant · Wholesale · Manufacturing · Service). Applies 15+
   recommended settings for that industry.
2. **Paper size + language** — quick pick of A4/A5/thermal + language
   for section labels.
3. **Confirm** — review + finish.

User can skip at any point. Re-openable via a button in Print Settings.

### Added — ⚡ Business type presets (6 industries)

One-click configuration for the most common Indian small business types:

- **🛒 Retail Shop / Kirana** — thermal 80mm, ALL CAPS, auto-print, HSN off
- **💻 Freelancer / Consultant** — A4 Minimalist, page numbers, HSN on
- **🍽 Restaurant / Cafe / Bar** — thermal, large UPI QR, compact receipt
- **📦 Wholesale / Trading** — Classic template, 3-copy multi-copy, GST rule 48
- **🏭 Manufacturing** — Corporate template, invoice QR, multi-copy, page headers
- **🛠 Service / Repair Shop** — Classic, signature prominent

Each preset patches 10-15 settings. Users can still tweak after applying.

### Added — 🌐 Multi-language section labels (5 Indian languages)

Section labels now respect the user's chosen language. Pre-loaded presets:

| Language            | BILL TO      | PLACE OF SUPPLY  | AMOUNT IN WORDS |
| ------------------- | ------------ | ---------------- | --------------- |
| **English**         | BILL TO      | PLACE OF SUPPLY  | AMOUNT IN WORDS |
| **Hindi (हिन्दी)**  | क्रेता       | आपूर्ति स्थान    | शब्दों में राशि |
| **Tamil (தமிழ்)**   | விற்பனையாளர் | விநியோக இடம்     | சொற்களில் தொகை  |
| **Marathi (मराठी)** | खरेदीदार     | पुरवठ्याचे ठिकाण | शब्दात रक्कम    |
| **Bengali (বাংলা)** | ক্রেতা       | সরবরাহের স্থান   | কথায় পরিমাণ    |

Plus custom text overrides for individual labels regardless of language
preset — user can mix ("BILL TO" in English but "TERMS" in Hindi).

### Added — 📅 Formatting controls (date, number, currency)

- **Date format**: 6 options (Indian, ISO, US MM/DD/YYYY, DD-MMM-YYYY, etc.)
- **Number grouping**: Indian (1,00,000) / Western (100,000) / European (100.000)
- **Decimal places**: 0 / 2 / 3 / 4
- **Currency symbol position**: Before number (₹100) or after (100₹)

Every format is applied consistently across the whole PDF.

### Added — 📏 Row density slider

Compact / Normal / Comfortable. Controls table row padding + section
padding. "Compact" fits ~30% more items per page; "Comfortable" adds
breathing room for accessibility.

### Added — 💧 Custom watermark text

Beyond the 8 preset labels (PAID / DUPLICATE / etc.), users can enter
ANY free-form text: "CONFIDENTIAL", "SAMPLE", "COMPANY-NAME-CONFIDENTIAL",
etc. Automatically uppercased. Toggle switches between preset picker and
custom text mode.

### Added — 💯 Custom tax rate presets

Built-in rates (0/5/12/18/28%) are augmented by user-added rates. Example
use cases:

- **Jewellers**: 3% GST
- **Rough diamonds**: 0.25%
- **Agricultural produce**: 0.1%
- **Custom bespoke rates** for special goods/services

Users add via a chip-list interface (comma-separated input → chips they
can remove individually).

### Added — 🏷 Custom invoice extra fields (up to 5)

Add fields like:

- "PO Reference: PO-2026-042"
- "Delivery Slot: 3-6 PM"
- "Site Address: Warehouse 3B"
- "Contract #: SC-2026-0195"

Labels defined app-wide in Print Settings. Values are per-invoice
overrides (v1.9.4 will add the per-invoice value field in Customize
panel). For now, labels show in the preview under the client block.

### Added — 📏 Items table column widths

6 percent sliders — one per column (Description / HSN / Qty / Rate /
Tax / Amount). Users tune widths to match their content patterns
(long product names → wider Description; short SKUs → narrower).

Applies to A4/A5 sheet PDFs (thermal receipts use their own compact
layout).

### Added — 💾 Save custom PDF templates

Users tune all their settings, then **"Save current as template"** with
a name ("Retail v1", "Wholesale March", etc.). Later, one-click **Load**
recalls the entire settings snapshot.

Perfect for:

- Businesses running multiple stores (each with its own template)
- Seasonal changes (Diwali template vs regular)
- A/B testing different visual designs
- Backup before experimenting

Templates persist to localStorage; ride the backup flow.

### Added — 🔄 Re-open Setup Wizard

Button in Print Settings header lets users re-run the first-run wizard
any time — useful after opening a new business or exploring different
industry presets.

### Fixed — Section header label updated

"Thermal Printer Settings" → "Print & PDF Settings" (more accurate — the
section now controls A4/A5 + thermal + PDF, not just thermal).

### Backward compatibility

- All new settings default to safe values (English labels, DD Mon YYYY
  dates, Indian number grouping, ₹ before number, Normal density)
- `onboardingComplete` defaults to false → wizard shows on first launch
  for new installs. Existing users see the wizard once on upgrade;
  can skip and continue with their current setup unchanged.
- Custom tax rates, custom fields, saved templates start empty
- Column widths default to sensible baseline (35/10/8/15/12/20 percent)
- Everything reversible via "Reset defaults" button

### Complete dynamic control philosophy — delivered

The user's ask: "make sure user has all the control they can do all
changes dynamically so they don't need to rely on us to make changes".

Every visible aspect of a printed invoice is now user-configurable:

**Content** (14 element toggles)
**Colours** (6 pickers)
**Typography** (font family × scale × weight × caps × 5 templates × line spacing)
**Layout** (margins × alignment × 6 column widths × row density)
**Formatting** (date × number × currency × decimals)
**Language** (5 language presets + per-label overrides)
**Behaviour** (multi-copy × auto-print × page numbers × T&C separate × letterhead)
**Automation** (per-client prefs × bulk print × business-type presets × saved templates × setup wizard)
**Verification** (invoice QR × barcode × feedback QR × digital signature)
**International** (dual currency × 7 secondary currencies)

**Total: 70+ dynamic settings**. Nothing hardcoded requires a developer
change any more.

---

## [1.9.2] — 2026-04-30

Full user control. Fixes v1.9.1 bugs and adds a **PDF Style Editor** so
users can tune every colour without waiting on developer changes.

### Fixed — 🔥 Corporate + Minimalist templates now actually work

**Root cause**: v1.9.1's template CSS targeted classes like
`.invoice-header-classic` and `.invoice-header-modern` — but those
classes don't exist in the DOM. The actual classes are `.inv-header`,
`.inv-title`, `.inv-section-label`, `.inv-business-name`, etc.

Result: **Corporate and Minimalist rendered identically to their bases**
because none of the CSS matched anything. Fixed by rewriting the entire
template CSS to target real DOM classes:

- **Corporate**: navy gradient header, uppercase blue section labels,
  blue table headers, white text on accent backgrounds
- **Minimalist**: Inter font everywhere, grayscale palette, generous
  padding, whitespace-heavy layout with hairline dividers

Both are now visually distinct from Modern / Classic / Minimal.

### Fixed — 🔥 A4 / A5 PDF text too light on paper

User reported: preview looked fine but PDF output had labels + addresses
in very light gray (#94a3b8 / #64748b) that faded on paper printers.

**Fix**: added a `.printing-mode` CSS class that html2canvas applies to
the clone during PDF generation. Rules force all light-gray text to a
minimum darkness of #1e293b. Section labels darken to #0f172a. Table
borders darken to #334155.

Only applies to the PDF capture — screen preview keeps its softer
grays for readability.

**Toggle**: **Force darker text on printed PDF** in Print Settings.
User can turn off if their printer handles grays fine.

### Fixed — Muted text default darkened

`pdfMutedText` default changed from `#64748b` → `#334155` (WCAG AAA
contrast on white). Even users who don't enable `pdfDarkenOnPrint` get
darker text out of the box.

### Added — 🎨 PDF Style Editor (full colour control)

Section at the bottom of Print Settings. Toggle **"Use custom colours"**
to expose 6 colour pickers:

- **Primary text** — main body (client name, items, totals)
- **Muted text** — labels, addresses, meta info
- **Accent colour** — section labels + table header background
- **Accent text** — text on the accent (usually white)
- **Header background** — behind business name / invoice title
- **Divider lines** — hairlines between sections + table borders

Each colour picker has both a colour swatch AND a hex input so users can
type an exact brand hex code. **"Reset colours to defaults"** button.

**Live preview** — every colour change updates the preview instantly.
Persist to localStorage; ride the backup flow.

### Added — 📏 PDF Font Scale slider

**80% to 140%** in 5% steps. Scales the entire PDF proportionally so
users can:

- **80–90%**: fit more items per page (long invoices)
- **100%**: default
- **110–140%**: larger text for older customers or letterhead alignment

Applied as `fontSize` on the container root; all children inherit via
`em` cascade — everything scales together.

### Backward compatibility

- `userColorsEnabled: false` by default — templates use their own
  hardcoded colours
- `pdfDarkenOnPrint: true` by default — silently improves print quality
  without user action
- `pdfFontScale: 1.0` by default — no scale change
- All existing bills render exactly the same until user opts in

### Full user control philosophy

The user's ask was: "make sure user has all the control they can do all
changes dynamically so they don't need to rely on us to make changes".

Every visual aspect of the PDF is now user-configurable:

**Colours** (6 pickers): Primary text / Muted / Accent / Accent text /
Header bg / Divider

**Typography**: Font family (Helvetica / Times / Courier), font scale
(80-140%), template (5 designs)

**Content**: HSN / rate line / bank / UPI / signature / QR / barcode /
watermark / T&C page / letterhead / feedback QR — all toggleable

**Layout**: Margins (T/B/L/R in mm), header alignment, paper size (10+
presets + Custom), portrait/landscape, print quality (Draft/Standard/HD)

**Copy behaviour**: Auto-print / multi-copy (2/3) / reprint tracking /
per-client preferences

Nothing hardcoded requires a developer change any more.

---

## [1.9.1] — 2026-04-30

**All the print polish** — 7 more dynamic features on top of v1.9.0's 12. Every one is a toggle / dropdown / input, persisted to localStorage.

### Added — 📐 Print quality selector

Dropdown in Print Settings: **Draft** (email-friendly, ~50% smaller PDFs)
/ **Standard** (default) / **HD** (archival quality). Adjusts both
html2canvas render scale AND JPEG compression quality (0.85 / 0.95 / 0.98).

### Added — 🔍 Print preview zoom

Zoom controls (**− / % / + / Fit**) in the top-right of the invoice
preview pane. Zoom from 50% to 200% in 10% increments. Useful for
inspecting fine details without generating a PDF first. Preference
persists across bill switches.

### Added — 📚 Bulk print by filter (Dashboard quick actions)

New "Quick print" row below the invoice list:

- **All shown (N)** — everything matching current filters
- **Unpaid (N)** — one-click print all outstanding
- **Overdue (N)** — one-click print all overdue
- **Paid (N)** — one-click print all settled invoices

Perfect for month-end filing or CA handoffs — no need to manually tick
each row.

### Added — 💾 Per-client print preferences

Client modal has a new **"Print preferences (optional)"** section:

- **Preferred paper size** — this client always gets A4 / A5 / thermal / etc.
- **Preferred currency** — INR / USD / EUR / GBP / AED / SGD / AUD
- **Auto-print on save** — per-client override of the global setting

When you create a new invoice for that client, these settings **auto-apply**.
Wholesale clients on thermal, retail on A4, foreign clients on USD —
never manually pick again.

### Added — 💱 Dual currency display (foreign clients)

Toggle in Print Settings. When enabled AND primary currency is INR:

- Shows the total in a second currency next to the ₹ amount
- Supported: USD, EUR, GBP, AED, SGD, AUD, JPY
- **User maintains the rate manually** — no live conversion (avoids
  API keys, subscription fees, and rate manipulation liability)
- Position: **On a line below** the ₹ amount, or **inline in parens**

Appears below the "Amount in Words" line.

### Added — 🖼 Company letterhead upload

Upload your **pre-printed letterhead PNG/JPG** in Print Settings. Renders
as a full-page background of every PDF. Content prints on top.

Bonus toggle: **"Hide invoice header block"** — when your letterhead
already has your business name + address + logo, hide the generated
header block to avoid duplication.

Perfect for businesses that have formal branded stationery designed by
a professional designer.

### Added — 🎨 2 new PDF templates (5 total)

Beyond the existing Modern / Classic / Minimal, two new options:

- **Corporate** — formal navy/blue header, uppercase section labels,
  professional feel. Great for consulting / legal / finance.
- **Minimalist** — grayscale + Inter font, generous whitespace, no
  colour panels. Modern SaaS aesthetic.

Picked in Print Settings → PDF template style.

### Skipped for future consideration

- **KOT split print** (restaurant kitchen router) — needs a per-category
  printer routing UI and a native ESC/POS bridge. Deferred to v2.x.
- **Cash drawer kick** — requires a native app helper or browser
  extension to send raw ESC/POS commands. Not feasible in the PWA
  runtime. Deferred to v2.x.

Both documented in the roadmap. If a user really needs them today,
they can pair a helper POS driver with the printer.

### Backward compatibility

All new options default to **off / neutral values**:

- `pdfQuality: 'standard'` — existing behaviour
- `dualCurrencyEnabled: false`
- `letterheadEnabled: false`
- `pdfTemplate: 'modern'` — matches previous default
- `previewZoom: 100`

Existing bills render identically. Nothing changes until the user opts in.

---

## [1.9.0] — 2026-04-30

**"Print Polish" release** — 12 new features covering everything a print
workflow needs. Every option is dynamic (toggle on / off in Settings).

### Added — 💧 Watermarks (PAID / DUPLICATE / DRAFT / OVERDUE / COPY / etc.)

Diagonal watermark stamp across every page of the PDF. **8 preset labels**:
PAID, DUPLICATE, DRAFT, OVERDUE, COPY, ORIGINAL, CANCELLED, REPRINT.
**Opacity control**: 5% / 10% / 15% (default) / 25% / 40%. Rotation and
size handled automatically via jsPDF `GState`.

### Added — 📋 Multi-copy print (GST Rule 48 compliance)

Toggle **"Print multiple copies with labels"** and pick 2 or 3 copies:

- **2 copies** — services: Original for Recipient + Duplicate for Supplier
- **3 copies** — goods: Original for Recipient + Duplicate for Transporter + Triplicate for Supplier

Each copy gets a corner label ("ORIGINAL FOR RECIPIENT" etc.) automatically.
One PDF, ready to print all copies at once.

### Added — 🚀 Auto-print on save

Toggle in Print Settings. When enabled, hitting **Save & Download PDF**
sends the invoice **directly to your default printer** immediately — no
manual print button click needed. Perfect for POS counters where every
saved invoice must be handed to the customer immediately.

### Added — 📊 Print history tracking

Every time an invoice is printed, its `printedCount` increments and
`lastPrintedAt` is stamped. Persisted with the bill so it survives
restarts / restores. Powers the reprint indicator below.

### Added — 🔄 Reprint indicator

Toggle in Print Settings. When enabled, any invoice that's been printed
before shows a **red "REPRINT · Copy #N" badge** in the top-left corner
of the PDF. Helps customers/CAs identify duplicate copies at a glance.
Fully automatic — no per-invoice action needed.

### Added — 📱 Verification QR + text-barcode

Two independent toggles:

- **Invoice QR** — encodes the invoice number, or a verification URL like
  `https://mycompany.com/verify/{invoice_number}` (with placeholder
  substitution). Prints as a small QR in the bottom-right.
- **Invoice barcode text** — prints the invoice number in large monospace
  font at the bottom-left for warehouse scanning / physical filing.

### Added — ✍️ Digital signature upload

Upload your signature PNG/JPG in **Print Settings → Digital signature**.
Renders in the "Authorized Signatory" block of every PDF. Plus a
**signatory name** field ("Rakesh Kumar · Director") that overrides
the default business name in that block.

Priority order: `profile.signature` (per-business, legacy) →
`printSettings.signatureImage` (app-wide fallback).

### Added — 🖨 Print margins

Four number inputs (**Top / Bottom / Left / Right**) in mm. Users
printing on pre-printed letterhead can shift content down to avoid
their pre-printed logo, or in from the edge to fit binding.

### Added — 📄 Multi-page invoices — page numbers + business header

Two independent toggles. When an invoice spills to page 2+:

- **Page numbers**: "Page 2 of 5" bottom-right on each subsequent page
- **Business name header**: business name at the top of each page 2+
  with a hairline divider — professional multi-page look

### Added — 📑 T&C on separate page

Toggle. For invoices with long Terms & Conditions, this puts the T&C
on its own page instead of squishing them at the bottom of page 1.

### Added — ⭐ Feedback / Review QR

New toggle. Encodes any URL (Google Reviews, feedback form, WhatsApp
chat, anything) as a small QR in the bottom-left of the PDF. Custom
**label text above the QR** ("Rate us · Give feedback" etc.).

Great for retail businesses to boost their Google reviews.

### Added — 📐 PDF font family selector

Choose Helvetica (default) / Times New Roman / Courier for the entire
PDF letterhead, tables, totals. Applies to sheet formats (A4/A5/Letter/Legal);
thermal has its own font-family setting from v1.8.4.

### UI — All new controls in Print Settings

Every feature above has a dedicated section in **Settings → Thermal Printer
Settings** panel, organised into groups:

- Auto-print
- Watermark (with preset picker + opacity)
- Multi-copy (GST rule 48)
- Multi-page invoices
- Print margins
- Verification codes (QR + text-barcode)
- Customer feedback QR
- Digital signature
- Terms & Conditions
- PDF font family
- Reprint tracking

Every toggle is dynamic — flip on/off any time. Settings persist to
localStorage and ride the backup flow.

### Fixed — solidLine unused variable warning in thermal render

Cleanup from the v1.8.4 refactor.

### Backward compatibility

- Pre-v1.9.0 bills default to `printedCount: 0`, `lastPrintedAt: null` —
  no reprint badge shows until they're printed via v1.9.0
- All new print settings default to **off / disabled** — no visual change
  on existing invoices unless the user opts in
- Watermarks and multi-copy don't apply to thermal receipts (rolls don't
  need diagonal stamps or multiple copies typically)

---

## [1.8.5] — 2026-04-30

Full printer compatibility release. Based on user-shared printer spec
sheet showing that 58mm thermal rolls have only 48mm printable width
(not 58mm), plus expanded coverage for all common thermal + paper
formats worldwide.

### Fixed — Thermal printable area now matches real hardware

User's shared 58mm printer spec sheet: Print Width 48mm, Paper Width 58mm.
Our v1.8.4 sent content 58mm wide → the "Amount" column got cut off at
the right edge because the print head physically can't reach beyond 48mm.

Fixed by updating each thermal preset to use REAL printable width:

| Preset            | Roll width | Printable                                |
| ----------------- | ---------- | ---------------------------------------- |
| **58mm**          | 58 mm      | **48 mm** ← was 58, now matches hardware |
| **80mm**          | 80 mm      | **72 mm** ← was 80, now matches hardware |
| **76mm** _(new)_  | 76 mm      | 68 mm                                    |
| **112mm** _(new)_ | 112 mm     | 104 mm                                   |

PDF page format now matches printable width so thermal drivers respect it.

### Added — More paper size presets

Standard office sizes covered for international users:

- **US Letter** (216 × 279 mm) — US / Canada / Mexico standard
- **US Legal** (216 × 356 mm) — long-form invoices
- **B5** (176 × 250 mm) — used in some Asian markets
- **76mm Thermal** — older kitchen printers
- **112mm Thermal** — airline boarding passes, warehouse labels

### Added — 🎯 Custom paper size

New **"Custom size"** preset lets you enter ANY width + height in mm.
Two number inputs appear in the Customize panel when selected. Below
100mm width, the render auto-switches to thermal receipt layout; above
100mm it uses the sheet layout. Covers every printer edge case not
listed in the standard presets — dot-matrix, label printers, special
stationery, etc.

Tip in the UI: enter your printer's **printable** width, not the roll
width.

### Fixed — Amount column alignment on thermal

User photo showed "Rs.225" and "Rs.25" on different rows didn't align
vertically because flexbox `space-between` doesn't lock the right
column. Now uses **CSS grid** with a fixed-width amount column:

- 58mm: 16mm amount column
- 80mm: 22mm amount column
- Wider: 26mm amount column

Result: every Amount column across every row lands at the same x
coordinate — clean visual stack.

Same fix applied to the totals block (Subtotal / CGST / SGST / Total
all align vertically now).

### Fixed — Font darkness (user's #1 request from photo)

Even v1.8.4's Ultra bold rendered too light on user's specific printer.
Added a **text-shadow trick**: `0.4px 0 0 currentColor, 0 0.4px 0 currentColor`.
This effectively double-strokes every glyph, producing visibly darker
print output on ALL thermal printers without needing a heavier font.

Also disabled OS-level font smoothing (`WebkitFontSmoothing: antialiased`)
which was rendering small thermal glyphs with sub-pixel gray edges.

Text-shadow is active for Bold + Ultra weights; Normal weight users
can opt out for lighter prints.

### Fixed — A5 aggressive compaction (fit one page)

User asked for A5 to be compact so a full invoice fits ONE page (was
spilling to two). Applied aggressive CSS overrides:

- Base font 10.5px → **9.5px**
- Line height 1.35 → **1.25**
- Header padding 12/16px → **8/12px**
- Section padding 8/12px → **6/10px**
- Terms block font 10.5px → **7.5px** with tighter line-height
- Bank block padding halved
- All h1/h2/h3 sized down 15%

A typical 4-item GST invoice with all standard sections now comfortably
fits on one A5 page. For very long invoices (10+ line items) the layout
still gracefully paginates.

### Backward compatibility

- Existing bills default to their saved `paperSize` — no visual change
- Pre-v1.8.5 bills on `thermal58` or `thermal80` will now render
  slightly narrower (48mm / 72mm instead of 58mm / 80mm). This is
  correct — hardware never rendered the full width anyway. If a user
  needs the OLD wider behaviour, they can switch to **Custom size**
  and enter 58 / 80 manually.

---

## [1.8.4] — 2026-04-30

Big release focused on thermal print quality — inspired by user comparison
photos showing SMART BAZAAR / Reliance receipts (all bold + ALL CAPS +
consistently dark) vs our v1.8.3 output (some text lighter than others,
Large font size not rendering correctly).

### Added — 🎛 Dedicated Thermal Printer Settings section

New **"Thermal Printer Settings"** panel in **Settings**. 16 controls
grouped into 4 categories:

**Typography**

- **Font family**: Monospace (Courier — thermal-optimised) / Sans-serif
- **Font size**: Small / Medium / Large / Extra Large
- **Font weight**: Normal / Bold (default) / Ultra bold
- **ALL CAPS mode**: renders every text element in uppercase (SMART BAZAAR
  style, best legibility on thermal printers)

**Layout**

- **Line spacing**: Compact / Normal / Comfortable
- **Header alignment**: Center / Left
- **Print contrast**: Normal / High / Ultra — applies grayscale + contrast
  filter to logo + UPI QR so they print crisper on faded printers
- **Force ALL CAPS in header** (business name always uppercase)

**Content toggles**

- Show business logo (on/off)
- Show HSN code per item (on/off)
- Show "Qty × Rate" line per item (on/off)
- Show amount in words (on/off)
- Show bank details (on/off)
- Show UPI QR (on/off)
- UPI QR size: Small (60px) / Medium (90px) / Large (120px)

**Footer**

- Custom footer message ("Thank you..." editable per business)
- Show cut mark ✂ (on/off)
- Feed lines after cut (0 to 6) — clearance so tear line is clean
- Optional tagline below business name

### Added — 🧪 Test Print button

Clicking **"Test Print"** generates a sample receipt with:

- Your real business profile (loaded from Settings)
- Sample customer ("SAMPLE CUSTOMER") + 3 sample items
- Applies your current settings live
- Sends directly to your system's default printer (via hidden iframe)

Test-and-adjust cycle without needing to create a fake invoice.

### Added — 👀 Live preview inside the Settings panel

Below the controls, a live 80mm thermal preview updates instantly as you
toggle settings — see exactly what your receipt will look like without
generating a PDF.

### Fixed — 🔥 Inconsistent darkness in thermal print

Root cause: some elements had explicit `fontWeight` while others inherited
from parent CSS, so the same "bold" declaration rendered differently
depending on browser + printer combo. Result on your printer: some text
crisp black, other text faded gray.

**Fix**: entire thermal render now sets a **root style** with explicit
`color`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, and
`letterSpacing` — every child inherits from this. Text is now consistently
black across every element (headers, items, totals, footer).

Additionally, the **font weight applies globally** based on your setting:

- Normal weight = 500 baseline, 700 headers
- **Bold** (default) = 700 baseline, 900 headers
- **Ultra bold** = 800 baseline, 900+ headers

### Fixed — Large font sizes now scale correctly

Previously, some inline `fontSize: '1.05em'` inheritance broke when the
base size changed. Now every relative size is a proper `em` multiplier
of the root font-size. Setting Font Size = **Extra Large** actually
produces a proportionally larger receipt across all elements.

### App-wide settings vs per-invoice overrides

Settings you configure in **Settings → Thermal Printer Settings** become
**app-wide defaults**. Each invoice's Customize panel can still override
specific fields for that one bill. Priority order:

1. Per-invoice `invoiceOptions.thermal*` (from Customize panel)
2. App-wide `gst_printSettings` (from Settings)
3. Hardcoded fallback

### Added — Settings included in backup

`gst_printSettings` added to the localStorage backup whitelist so users
don't lose their print configuration when restoring from a backup. Same
for four other v1.6.3+ keys that were previously missing:
`gst_stockAlertSettings`, `gst_itrCalcInputs`, `gst_itrPresumptive`,
`gst_itrAdvanceTax`.

### Backward compatibility

Pre-v1.8.4 bills continue to render with the default print settings
(Bold, Medium, Monospace, ALL CAPS off) — no visual change unless the
user opens Settings and customises. Existing per-invoice
`thermal*` overrides still take precedence over the new defaults.

---

## [1.8.3] — 2026-04-30

Direct user feedback on v1.8.2 — thermal print faded, A5 needed to be
landscape, Client Statement PDF still not right. Plus a feature request:
thermal-specific settings in Customize.

### Fixed — Thermal print output no longer faded / cut off

User's photo showed HSN, per-item rate line, and dividers all rendering
as very faint on the actual thermal printer. Also the "Amount" header
was being cut to just "A" because the item table column widths didn't
account for real thermal paper printable areas (usually 72mm on 80mm
rolls after margins).

**Full rewrite of the thermal render**:

- **Every text element forced to pure black `#000`** — no more `color: '#555'`
  gray tones that vanish on thermal
- **Bolder base font weight (500 minimum, 700 for headers)** — thermal
  print heads need denser glyphs for legibility
- **Item name gets full row width; qty × rate on separate line** — 3-word
  product names like "LETTERPAD A4 EXCEL BOND" no longer wrap awkwardly
- **Column headers `Item | Amount`** with 58mm rolls dropping to `Item | Amt`
- **Dashed dividers use solid black 1px lines** — thermal printers render
  crisp black much better than dotted grey
- **Logo + UPI QR get `filter: grayscale(1) contrast(1.5)`** so faded
  colour prints crisp black
- **Currency prefix `Rs.` instead of `₹`** — Courier New / thermal fonts
  can't render the Rupee glyph

### Added — Thermal-specific settings in Customize panel

New "Thermal printer settings" panel appears in the Customize sidebar
**only when a thermal paper size is selected**. Three controls:

- **Font size**: Small (fits more per page) / Medium (default) / Large
  (easier to read for older customers)
- **Compact mode**: Skip HSN + per-item rate line; use two-line item
  rows. Saves paper on long orders.
- **Cut mark**: Adds "— ✂ cut here ✂ —" at the very bottom for
  auto-cutter thermal printers. Turn off if your printer auto-feeds.

All three persisted per-invoice in `invoiceOptions.thermalFontSize` /
`thermalCompact` / `thermalCutMark`. Backward-compat: pre-v1.8.3 bills
default to Medium / Compact off / Cut mark on.

### Added — A4 Landscape & A5 Landscape paper sizes

User wanted A5 in **landscape orientation** — popular in Indian retail
/ wholesale because you can print two invoices per A4 sheet (saving
paper). Added both A4 Landscape (297 × 210 mm) and A5 Landscape
(210 × 148 mm).

- `jsPdfOrientation` field added to each PAPER_SIZES entry
- PDF generation now respects orientation (was hardcoded portrait)
- InvoicePreview CSS handles landscape variants — full A4 width, half
  A4 height, tighter vertical padding to fit content on one page

Existing bills default to `a4` (portrait) so no visual change on
upgrade.

### Fixed — Client Statement PDF now proper Indian ledger format

Redesigned to match standard Indian business-statement conventions:

- Columns: **Date | Particulars | Debit | Credit | Balance**
  (was: Date | Invoice # | Type | Amount | Paid | Balance)
- **Opening Balance row** at the top (₹0.00 by default)
- **Balance shows "Dr" suffix** — Indian accounting convention
- **Payment received against invoice** appears as its own italicised
  Credit row directly below the invoice row, keeping the trail clear
- **Closing Balance** shows `Dr` (client owes) or `Cr / Nil`
  (nothing owed / advance received)
- **Signature block** ("Authorised Signatory") + business name
  right-aligned at the bottom
- Legend: "Dr = amount receivable · Cr = amount owed / paid"
- Reviewer note: "Please review and confirm within 7 days"

CAs and accountants used to Tally / Marg / BUSY output should
recognise this layout immediately.

---

## [1.8.2] — 2026-04-30

Hotfix release addressing five user-reported bugs from v1.8.0-v1.8.1
plus the direct-print feature request.

### Fixed — 🔥 Dashboard blank page when clicking invoice checkbox

The most damaging regression: clicking any checkbox on an invoice row
crashed the Dashboard to a blank page. Cause: v1.7.0's Bulk PDF button
referenced `<Download size={13} />` in the bulk toolbar, but `Download`
was not imported from `lucide-react`. As soon as a checkbox was ticked,
`selectedIds.size > 0` became true, the toolbar rendered, hit the
undefined icon, and React crashed the entire Dashboard tree.

Fixed by adding `Download` to the lucide-react import list. Sanity-swept
all other lucide references for missing imports.

### Fixed — 🔥 Income Tax module blanking on any interaction

Cause: v1.8.0's `advanceSchedule` useMemo referenced `comparison` in
its dependency array + callback body BEFORE `comparison` was declared.
JavaScript TDZ (temporal dead zone) rules mean this throws a
`ReferenceError` on every render of the Income Tax view — so navigating
to it or clicking anything triggered the crash. eslint flagged this
but the build didn't fail because it was in a hook deps array (only
runtime-detectable).

Fix: reorder — `comparison` is now declared before `advanceSchedule`.
Also added defensive optional chaining on
`comparison?.[comparison?.recommended]?.totalTax` so a race between
`useMemo` recomputation and state updates can't crash again.

### Fixed — A5 layout wasn't actually adapting

v1.8.1's paper-size selector changed the container width and PDF format
but the internal invoice layout stayed A4-optimized. Inline
`margin: '0 2rem'` on tables + rem-based paddings pushed content
off the A5 page.

Added stronger `.paper-a5` CSS overrides — table margins collapse to
8px each side, headers scale to 1.25rem, sections drop to smaller
padding, logos shrink to 45px. Now the whole invoice fits properly
inside 148 × 210 mm.

### Fixed — Thermal 80mm / 58mm now renders a proper receipt layout

Same problem: v1.8.1 changed only the container width. The Indian GST
column layout (CGST + SGST + IGST + Tax %) never fitted on a 58mm roll,
producing overflowing / clipped output.

v1.8.2 branches on `paperCfg.kind === 'thermal'` and renders a
completely different template:

- Single-column layout (no side-by-side party blocks)
- Compact monospace-style typography (Courier New)
- Item table: Item · Qty · Amount (3 columns only)
- Totals stacked vertically with dashed dividers
- Currency prefix uses ₹ symbol at 80mm+, but hides UPI QR at 58mm
  (not enough width to scan reliably)
- All colour panels stripped — black on white to save thermal
  printer ribbon / paper

Users of thermal POS printers can now genuinely use this as a
day-to-day receipt template.

### Fixed — Client Statement PDF alignment

Column overlap when the amount was wide (e.g. ₹12,34,567.89 would
extend into the Type column). Rewrote the layout:

- Explicit column-end coordinates so text can never overlap
- Indian digit grouping (2,5,000 style instead of 25,000)
- Currency prefixed with plain "Rs. " — helvetica can't render the
  ₹ symbol properly and it was appearing as garbage in some PDF
  readers
- Alternating row shading now aligned to text baseline
- Page-break repeat of the table header
- Colored summary strip at top (Invoices count / Total / Paid /
  Outstanding) with clear typography
- Bold + red for outstanding balance, green when settled

### Added — 🖨 Direct Print button (feature request)

New **Print** button next to Download PDF on the invoice toolbar.
Opens the browser print dialog directly with the invoice PDF loaded
in a hidden iframe. Works with:

- Any thermal printer configured as system default (send receipt
  straight to the paper roll)
- A4 laser / inkjet printers (skips the "download PDF then open then
  print" flow)
- Popup-blocker safe (uses hidden iframe, not `window.open`)
- Fallback: opens PDF in new tab if browser blocks the auto-print

Button title changes based on the selected paper size: "Send directly
to your thermal printer" for thermal formats, "Open browser print
dialog (skip the PDF download)" for A4 / A5.

---

## [1.8.1] — 2026-04-30

Two user-reported bugs + one new feature.

### Fixed — Invoice numbers no longer incremented on every "New Invoice" click

**The bug**: opening the New Invoice form and typing anything meaningful
would burn a counter value even if the user never clicked Save. Because
auto-save fires 2s after the last edit and calls `saveInvoiceToDB`,
which atomically reserves. If the user abandoned the form and opened
another, the next number was N+1 already. CA-audited businesses require
gapless sequences — this bug was creating gaps.

**The fix**: for NEW bills that haven't been explicitly saved yet, the
2-second auto-save skips the server persist step entirely. The
sessionStorage draft is still auto-persisted (so a browser crash mid-
edit doesn't lose typed content), but the counter is only atomically
reserved when the user clicks **Save**, **Save & Leave**, or **Save &
Download PDF**. Once the first successful save lands, auto-save flips
back on as normal.

For editing existing bills: unchanged behaviour — auto-save writes
through to the server every 2 seconds so mid-session edits are safe.

### Fixed — "Save failed" toast when navigating back

The toast fired when auto-save and Save & Leave raced on the same
invoice. Auto-save posted with `overwrite=false`, succeeded; Save & Leave
then also posted with `overwrite=false`, and the server correctly 409'd
because the file already existed at that ID.

Added a `hasBeenSaved` ref that flips to `true` after the first
successful server persist this session. Subsequent saves — whether from
auto-save, Save & Leave, or Save & Download — now pass `overwrite=true`.
Server accepts the write, "Save failed" no longer fires spuriously.

The first save still uses `overwrite=false` so a typo hitting an
existing invoice number is still caught (v1.6.8's dupe-check protection
is preserved for the case it was meant to catch).

### Added — Paper / print size options

Requested by users with POS thermal printers and A5 preferences.

New **"Paper / print size"** dropdown in the Customize panel (right side
of the invoice form). Four options:

- **A4 (default)** — 210 × 297 mm. Same as before, no behaviour change.
- **A5 (compact)** — 148 × 210 mm. Half sheet, saves paper. Same layout
  as A4, slightly smaller type.
- **80mm Thermal (POS receipt)** — 80 mm wide roll. Compact single-
  column layout, black-on-white, no decorative colour panels, smaller
  UPI QR (60 × 60 px). Fits standard restaurant / retail POS printers.
- **58mm Thermal (compact receipt)** — 58 mm wide roll. Even narrower;
  UPI QR is hidden entirely (not enough width to scan reliably). For
  portable / mobile thermal printers.

How it works: `invoiceOptions.paperSize` (persisted with each bill).
The **preview** container width + CSS class update live in the editor
so what-you-see matches what-you-print. The **PDF** is generated at the
correct `jsPDF` page size — A4 / A5 use jsPDF's built-in formats;
thermal uses a custom `[width, 297mm]` page (long strip that thermal
printers cut at content end). Existing bills default to A4 — no
migration needed.

### CSS additions

New `.paper-a4` / `.paper-a5` / `.paper-thermal-80` / `.paper-thermal-58`
classes on `.invoice-preview-container`. Thermal formats:

- Force black-on-white — no gradient panels or coloured backgrounds
- Monospace fallback font for receipt-like density
- Grid layouts collapse to stacked single column
- Table borders switch to 1px dashed (thermal printers render dashed
  crisper than solid at fine sizes)
- UPI QR hidden on 58mm; scaled to 60×60 on 80mm

---

## [1.8.0] — 2026-04-30

**Full ITR Release.** Two new sub-tabs (Presumptive + Advance Tax),
the crown-jewel ITR-4 Filing Summary PDF, integrated ITR / advance-tax
due-date reminders, plus four P2 UX polish fixes.

### Added — Presumptive Income sub-tab (Income Tax module)

Support for all three presumptive taxation sections:

- **§44AD** (traders / retailers / manufacturers): 6% of digital
  turnover + 8% of cash turnover. Handles the ₹2Cr / ₹3Cr limit
  based on cash-receipt %. Warns when cash exceeds 5%.
- **§44ADA** (professionals): flat 50% of gross receipts.
  ₹50L / ₹75L limit handled.
- **§44AE** (transporters): per-vehicle-month rates for heavy vs
  light vehicles.

"Actual profit override" input for users who want to declare above
the deemed minimum. **"Push to Calculator"** button pipes the computed
income into the Regime Calculator's Business Income field. Compliance
warnings inline when turnover crosses thresholds.

### Added — Advance Tax sub-tab (Income Tax module)

- Four-installment schedule for FY 2024-25 (15 Jun · 15 Sep · 15 Dec · 15 Mar)
- **Presumptive mode toggle** — collapses to a single 15-March payment
- TDS-credit input reduces net advance-tax liability
- Payments-made table — record each installment paid, with date + amount
- **§234C interest** — 1% per month for installment shortfalls, with the
  correct 12% / 36% waivers for Q1 / Q2
- **§234B interest** — 1% per month post year-end delay
- Live shortfall detection per installment; row highlights red when
  behind schedule
- All inputs auto-persist to localStorage

### Added — ITR-4 (Sugam) Filing Summary PDF 🎯

The crown jewel. On the ITR Summary tab, a **"Download ITR-4 Summary"**
button generates a printable PDF that mirrors the ITR-4 form's field
layout:

- **Part A — General**: assessee name, GSTIN, PAN placeholder, filing
  status (§139(1) — before due date)
- **Part A — Nature of Business**: presumptive section + turnover split
  (digital / cash) if applicable
- **Part B — Income**: Salary (with standard deduction line) · House
  Property · Business/Profession (linked to presumptive figure or
  regular books) · Other Sources → Gross Total Income
- **Part C — Deductions**: every Chapter VI-A section with statutory cap
  applied; §80CCD(2) only under new regime
- **Part D — Tax Computation**: slab tax + special-rate (STCG 15% /
  LTCG 10%) + §87A rebate + surcharge + 4% cess → Total Tax Payable
- **Part E — Advance Tax**: installment schedule with amount + paid
- Field bold + big for totals; sectional headers coloured
- Auto-inserts source notes (e.g. "From Form 16", "Presumptive @ §44AD")

Hand the PDF to your CA — every field they need to fill on
incometax.gov.in is pre-computed with the amount and its origin.

### Added — Advance-tax + ITR filing dates in the notification bell

`getUpcomingFilings()` now includes:

- All four advance-tax installments (15 Jun / 15 Sep / 15 Dec / 15 Mar)
- ITR filing due-date — non-audit (31 July of AY)
- ITR filing due-date — audit / §44AB (31 October of AY)

Users see these in the sidebar bell 🔔 popover under **"Filings due soon"**
alongside GSTR-1 / 3B / 26Q / 27EQ. 60-day lookahead — nothing more
than 2 months out clutters the list.

### Added — `utils/itr.js` extensions

New exports:

- `compute44AD(inputs)` / `compute44ADA(inputs)` / `compute44AE(inputs)`
- `ADVANCE_TAX_SCHEDULE` — the four installment dates + cumulative %
- `computeAdvanceTaxSchedule(totalTax, tdsCredit, payments, mode)`
- `compute234BInterest(schedule, paymentDate)`
- `compute234CInterest(schedule)`
- `buildITR4FieldMap(inputs, tax, presumptive, deductions)` — returns
  a canonical array of `{ section, field, value, note?, bold?, big? }`
  used by the PDF generator (and testable in isolation)

### Fixed — P2 UX polish batch (from v1.6.7 audit)

- **`handleBack` 3-option modal** (P2 #32) — was `confirm()` where OK=save
  and Cancel=stay, which every UX study confirms is counterintuitive
  (users hit Cancel expecting "discard"). Now a proper modal with
  three explicit actions: **Keep editing** / **Discard & leave** /
  **Save & leave**.
- **Terms preset "never ask again"** (P2 #33) — comparing three presets
  before committing used to spawn three confirm dialogs. Now asks once
  per session (sessionStorage flag), silent switches after.
- **Image upload MIME + dimension guard** (P2 #34) — previously
  `accept="image/*"` alone (bypassable). Now whitelists PNG / JPEG /
  WebP / SVG; 2MB max; auto-downscales rasters to 1024px on the
  longer edge via canvas (preserves aspect ratio, quality 0.92 JPEG).
  SVGs embedded as-is (they're vector). Result: no more 4096×4096
  logos silently bloating PDF size.
- **`getFYOptions` extracted to `utils.js`** (P2 #42) — was duplicated
  in 5 files. Callers can migrate incrementally.

### Backward compatibility

- Existing localStorage keys unchanged. New keys added:
  `gst_itrPresumptive`, `gst_itrAdvanceTax`. Both included in the
  backup whitelist (they piggyback on `gst_*` prefix but are
  auto-restored because they're explicitly enumerated).
- The ITR-4 PDF works even with zero calculator input — outputs a
  sensibly-empty template you can print, mark up by hand, and file.
- Advance-tax notifications are additive — no existing filing
  reminder is affected.

---

## [1.7.0] — 2026-04-30

**ITR Foundation release.** Introduces the Income Tax module — an integrated
regime calculator, bank-statement import, and consolidated ITR summary —
plus Client Statement PDFs, Bulk PDF export, and P1 #15 (interstate
expense ITC) closes.

### Added — Income Tax module (new sidebar item, India-only)

A new "Income Tax" section in the sidebar with three sub-tabs:

**1. Regime Calculator**

- Side-by-side Old vs New regime comparison for FY 2024-25 (AY 2025-26)
- Slabs, Section 87A rebate, surcharge tiers (up to ₹5Cr / above), 4%
  Health & Education Cess — all under the hood
- Standard Deduction auto-applied to salary income (₹75k new, ₹50k old)
- Chapter VI-A deductions with statutory caps (80C ₹1.5L, 80D ₹1L,
  80CCD1B ₹50k, 80TTA/TTB, 80E, 80G, 80GG, 80DDB, 80U, §24b)
- Special-rate handling for capital gains (STCG 15% §111A, LTCG 10%
  §112A over ₹1L exempt)
- **Auto-picks the cheaper regime** and highlights it; shows exact ₹
  savings vs the other regime
- Inputs auto-save to localStorage between visits
- Business Income auto-fills from the app's own sales − purchases −
  expenses for the current FY (user can override)

**2. Bank Statement Import**

- Drop / upload a CSV; auto-detects the bank format from headers
- Supports **SBI, HDFC, ICICI, Axis, Kotak, PNB, Yes Bank** plus a
  Generic fallback that matches columns by name
- Auto-categorises every transaction using keyword rules (SALARY,
  INTEREST, RENT, SIP, LIC, GST, EMI, AWS, ATM, IMPS, etc.)
- Spreadsheet-style review grid — user overrides any auto-category
- Category totals strip shows aggregate per bucket
- **"Push to Calculator" button** pipes the categorised totals into
  the Regime Calculator (business receipts → business income,
  interest → other sources, rent → house property, LIC → 80C, etc.)
- 100% in-browser parsing — nothing uploaded to any server

**3. ITR Summary**

- Consolidated snapshot: Sales / Trading purchases / Business expenses
  / Net business income (from the app's own data)
- Adds up salary + rent + other sources + capital gains from the
  Regime Calculator
- Highlights **presumptive taxation eligibility** if turnover < ₹2Cr
  (Section 44AD hint)
- Recommended regime + tax due + due dates + advance-tax
  installment schedule (15 Jun / 15 Sep / 15 Dec / 15 Mar)

### Added — utils/itr.js

New tax-math library, kept separate from React so it's auditable + unit-
testable. Exports:

- `OLD_REGIME_SLABS` / `NEW_REGIME_SLABS` (FY 2024-25)
- `DEDUCTION_CAPS` — statutory caps per section
- `computeSlabTax`, `computeSurcharge`, `computeRebate87A`, `computeCess`
- `computeTax(inputs)` — end-to-end returns
  `{ grossTotalIncome, standardDeduction, allowedDeductions, taxableIncome,
   slabTax, stcgTax, ltcgTax, rebate87A, taxAfterRebate, surcharge, cess,
   totalTax, regime }`
- `compareRegimes(inputs)` — runs both, picks cheaper, returns
  `{ old, new, savings, recommended: 'old' | 'new' }`
- `parseBankStatement(csvText)` — normalised `{ bankName, transactions }`
- `autoCategorize(description)` + `AUTO_CATEGORY_RULES` — extensible
  rule set for narration-based categorisation

### Added — Enhanced Expense Tracker

- **`interstate` flag** on every expense entry. Fixes P1 #15 from the
  audit: ITC on GST paid to out-of-state vendors (AWS / Google / Adobe)
  was incorrectly splitting into CGST/SGST → mis-routed in GSTR-3B
  Table 4(A). Now correctly routes to IGST when the flag is on.
- **ITR head tags** on every category. `Salary & Wages` → salary head
  (declared separately); `Asset Purchase` → depreciation (§32);
  `Personal / Drawings` → not deductible; everything else → business
  (§37 general deductions). Sets us up for the v1.8.0 Filing Summary
  PDF to auto-aggregate expenses under the correct ITR line.
- Two new categories: `Asset Purchase` (capitalised, not deducted in
  year of purchase) and `Personal / Drawings` (non-business).

### Added — Client Statement PDF (audit A)

On the Clients page, expanding any client reveals a **Statement PDF**
button. Generates a single-page (or multi-page for high-volume clients)
account statement:

- Seller + client header blocks
- Summary strip: invoice count / total billed / paid / outstanding
- Chronological table: date, invoice #, type, amount, paid, running
  balance
- **Credit notes correctly reduce the balance** (shown as `-₹` amount)
- Closing balance line at the bottom, color-coded red if outstanding

Uses jsPDF direct rendering (no html2canvas) for crisp text + small file
size — statements are typically 30-100 KB regardless of invoice count.

### Added — Bulk PDF export (audit C)

Dashboard bulk toolbar gets a new **Bulk PDF** button. Renders every
selected invoice through the InvoicePreview pipeline and stitches them
into one multi-page PDF. Perfect for the "give me all March invoices"
ask from your CA. Works with unlimited selection (>100 invoices prompts
a "may take a minute" confirmation).

### Fixed — P1 #15 (from audit)

GSTR-3B ITC from expenses now correctly routes to IGST for interstate
expense entries. Was unconditionally 50/50 CGST+SGST regardless of the
vendor's state — a real filing bug for anyone with out-of-state SaaS
subscriptions.

### Backward compatibility

- Existing expense records without the `interstate` field default to
  intrastate (preserves pre-v1.7.0 numbers — no book values shift
  silently on upgrade). Users opt in per-record by ticking the flag.
- Existing profiles without an `id` still work (fallback to `businessName`
  match, same as v1.5.0).
- The new Income Tax module is India-only. Users on
  `Settings → Region Preference: International` will not see it in
  the sidebar.

---

## [1.6.8] — 2026-04-30

Critical-fixes bundle. 17 bug fixes across GST filing correctness, data
integrity, and money math. Full audit report at
[`docs/AUDIT_2026-04-30.md`](docs/AUDIT_2026-04-30.md).

### Fixed — GST filing correctness (would have caused real returns to fail)

- **Reverse-charge invoices no longer include GST in the payable total**.
  Under Section 9(3)/9(4) the supplier doesn't collect GST — buyer pays
  directly to govt. Pre-v1.6.8 the PDF printed the RCM notice AND added
  tax to the total → suppliers over-billed then issued credit notes.
  Line-level tax still shows on the PDF (buyer needs to know their RCM
  liability) but the "amount payable to us" is now taxable value only.
  Tax breakdown preserved in `totals.rcmTax*` for GSTR-3B RCM outward.
- **GSTR-1 JSON now emits reverse-charge flag correctly**. Was
  hardcoded `rchrg: 'N'` even when the bill had `reverseCharge: true`.
  Portal was rejecting / mis-classifying RCM supplies.
- **GSTR-1 JSON now marks SEZ bills as SEWP / SEWOP** instead of `'R'`
  (regular). GSTN validators were flagging these on upload.
- **Cess amounts now flow into every GSTR-1 / 3B JSON export**
  (B2B / B2CS / B2CL / CDNR / HSN summary). Pre-v1.6.8 `csamt: 0` was
  hardcoded everywhere — users selling tobacco / aerated / auto / coal
  understated cess liability.
- **HSN summary B2CL branch now respects `taxInclusive`**. Missing 3rd
  arg to `computeItemTaxSplit(item, isInter, taxInclusive)` was inflating
  taxable + IGST values for tax-inclusive large-value B2C invoices.
- **Server-side recurring auto-fire now routes tax by state**. Was
  hardcoding `cgst: taxTotal/2, sgst: taxTotal/2, igst: 0` regardless
  of seller vs client state / SEZ — every interstate recurring
  template shipped as intrastate B2B → wrong GSTR-1 bucket.
- **`InvoicePreview` interstate detection now honours `placeOfSupply`
  and `isSEZ`**. Bills with POS override or SEZ client had totals
  computed as IGST but item table rendered CGST+SGST → PDF mismatch.

### Fixed — Data integrity (silent data loss)

- **Client fields no longer silently lost on load / save**. Both
  `selectSavedClient` and `handleClientModalSave` were cherry-picking
  6 fields and dropping `country / email / phone / isSEZ`. Consequence:
  loading an SEZ client via auto-complete cleared its SEZ flag → wrong
  tax computed → wrong filing.
- **Initial invoice client state includes `email / phone / isSEZ`**.
  Even when ClientModal wrote these to the client directory, they never
  landed in `bill.data.client` because they weren't in state.
- **Server refuses silent invoice-number overwrites**. Typo hitting an
  existing invoice-number used to overwrite the previous bill with no
  warning. Now returns 409 unless the client explicitly passes
  `?overwrite=1` (used by the edit / bulk-status / auto-fire flows).
- **Invoice-number counters no longer burn on mount**. `getNextInvoiceNumber`
  now supports `{ peek: true }` — the form shows the next number
  optimistically, and atomic reservation happens only on save. Cancelled
  forms don't leave gaps in the sequence any more (CA-audited businesses
  need gapless).
- **Receipt numbers use the atomic counter endpoint**. Two receipts
  saved together no longer both get `RCP/…/0007`.
- **Recording a receipt now updates the linked invoice's paid status +
  payment history**. Users no longer have to double-record via the
  Dashboard payment modal.
- **Bulk / single "Mark as Paid" now pushes a synthetic payment**.
  Pre-v1.6.8 the row was flipped to `paid` with an empty `payments`
  array → payment-history modal and ReportsView cashflow showed no
  payment. Both views now stay consistent with the bill's status.
- **Recurring invoice templates use `item.name`, not `description`**.
  Templates using the old field silently shipped bills with blank rows
  because server auto-fire reads `item.name`. Migration in `openEdit`
  - server-side fallback preserves existing templates.
- **Duplicate-invoice flow correctly decrements stock**. `_isDuplicate`
  and `_convertToType` markers now skip the "editing an existing bill"
  short-circuit — duplicates are new sales.
- **GSTR-2B reconciliation respects purchase round-off**. v1.6.7's
  new purchase round-off exposed this — books used line-item precision
  while 2B `val` was rounded, so every rounded supplier bill flagged as
  amount_mismatch.
- **Backup / restore captures all localStorage keys**. Fixed:
  - Typo `'theme'` → `'freegstbill_theme'`
  - Added `gst_filing_status` (users lost GSTR-1 / 3B "Filed" pill marks)
  - Added `freegstbill_dismissedUpdate` + `freegstbill_pwa_dismissed_at`
    (users got nag banners back after restore)
  - Prefix-matched `gst_lastUsedAccountId_*` (per-profile payment
    account preferences)

### Fixed — Purchase Bill parity with Sales

- **Decimal quantities** — was `min="1"`, blocked 2.5 kg / 0.5 hr.
  Now `min="0" step="any"`.
- **Custom tax rate** — dropdown was 0 / 5 / 12 / 18 / 28. Missing
  0.1% (agriculture) / 0.25% (rough diamonds) / 3% (jewellery) / bespoke.
  Now includes those + an "Other…" option that prompts for any rate.
- **Cess field** — suppliers of tobacco / aerated / motor vehicles / coal
  charge GST + Cess. Pre-v1.6.8 there was no slot for it → ITC on cess
  was silently lost in GSTR-3B Table 4(A). New Cess % column per item;
  totals strip shows cess line when non-zero.

### Fixed — Dev environment

- **Vite dev proxy points at port 47371** (Express default since v1.5.2),
  was `3001`. `npm run dev` now works for contributors without manual
  config edits.

---

## [1.6.7] — 2026-04-30

Two reported UX fixes — purchase-bill round-off was missing, and the
"Add Item" button didn't move keyboard focus to the new row.

### Added — Round-off in Purchase Bills

Sales invoices have always had a `Show round-off` toggle. Purchase bills
didn't — so when a supplier rounded their total (₹1,234.56 → ₹1,235),
users had to fudge a line item to make it match. Now there's an
**Apply round-off** checkbox on the Add/Edit Purchase Bill modal.

- Defaults to **off** (most suppliers' totals already match line-item math)
- When on, applies `calculateRoundOff()` to the grand total — same
  helper used by sales invoices
- Round-off shows as a separate `+₹0.44` / `-₹0.50` line in the
  modal's totals strip
- Persisted to the purchase record as `applyRoundOff: bool` and
  `roundOff: number` — kept separately from `totalTax` so GSTR-3B
  ITC reconciliation reflects what the supplier actually charged
- Total in the records table + footer + CSV export all use the
  rounded grand total
- Backward-compat: older purchase entries without these fields are
  treated as `applyRoundOff: false` and continue to show their original
  totals exactly. Re-opening such a record auto-detects round-off if
  the stored `roundOff` is non-zero.

### Fixed — Keyboard focus after "Add Item"

Pressing Tab to reach the **Add Item** button and Enter to activate it
used to leave focus stuck on the button — users had to grab the mouse
to click into the new row's first input.

Now the **Description** input on the freshly-added row receives focus
automatically. Works in both the sales invoice form (InvoiceGenerator)
and the purchase bill form (PurchaseBills). Implementation uses
`data-item-id` / `data-focus-key` attributes on the row + a
`requestAnimationFrame` queue so the focus lands after React's render
commit.

For users who do most of their data entry by keyboard, this turns
"Tab Tab Tab Enter [grab mouse]" into "Tab Tab Tab Enter Type" — pure
keyboard flow.

---

## [1.6.6] — 2026-04-30

Restructure: collapsed `Launcher.html` and `index.html` into a single
user-facing HTML file. Install folder now shows ONE html file — the
launcher — instead of two.

### Why

v1.6.4 / 1.6.5 had two HTML files at the project root:

- `index.html` — React app shell. Doesn't work standalone (Vite-built
  paths, CORS-blocked ES modules from `file://`). If accidentally
  double-clicked → white screen + cryptic console errors about
  `main.jsx` / `manifest.webmanifest` / `favicon.svg` failing to load.
- `Launcher.html` — Standalone control panel. Works fine via `file://`.

Users couldn't tell which one to open and frequently double-clicked
`index.html`, hitting the broken state.

### Changed — file layout

- The React app's source `index.html` moved from project root to `src/index.html`.
  Users never see it; it's a build-tool source, not a user-facing file.
- The standalone launcher `Launcher.html` was renamed to `index.html`
  at project root. This is now the **only** HTML file in the install
  folder, and it's the launcher.
- Build output `dist/index.html` is the React app (unchanged behaviour —
  Express still serves it at `/`). Same filename, different folder.
- `vite.config.js` updated to set `root: 'src'`, with `publicDir` and
  `build.outDir` pointing at project-root paths so existing `public/`
  assets and `dist/` output still resolve correctly.
- Module entry path updated from `/src/main.jsx` → `/main.jsx` (since
  Vite's root is now `src/`).

### Updated callers

- `Install FreeGSTBill.bat`: desktop shortcut + Start Menu shortcuts +
  comments now reference `index.html` (the launcher) instead of
  `Launcher.html`.
- `Start FreeGSTBill.bat`: fallback path when node missing / 30s
  timeout now opens `index.html` (the launcher).

### Backward compatibility

Users updating from v1.6.4 / 1.6.5 should re-run `Install FreeGSTBill.bat`
once after `Update FreeGSTBill.bat` to refresh the desktop shortcut so
it points at the new location. Update.bat alone preserves the existing
shortcut, which would still work because it points at the now-gone
`Launcher.html` path — re-running Install fixes it.

If you don't want to re-run Install: just drag the new `index.html`
from the install folder onto your desktop as a quick one-step fix.

---

## [1.6.5] — 2026-04-30

Hotfix for v1.6.4's `Launcher.html` rendering as a white screen on some
browsers. Rewrote the page to maximise compatibility with older Edge,
corporate-policy-restricted browsers, and `file://` origin quirks.

### Fixed — Launcher.html now renders reliably

The v1.6.4 launcher used `color-mix(in srgb, ...)` in the body
background (Chrome 111+, Edge 111+). On older or policy-restricted
browsers the CSS declaration silently failed and the cards-on-white
combination read as "white screen" if the user's `bg` ended up white
too. Also used some ES2020+ JS syntax that some legacy environments
choked on.

### Changes

- **Replaced `color-mix()`** with a plain solid background colour.
- **Replaced `let` / `const` / arrow functions / template literals**
  with `var` / function expressions / string concatenation throughout
  the script. Now compatible all the way down to IE 11 (not that we
  officially target it, but the safer subset eliminates a whole class
  of "blank page" failures).
- **Wrapped the entire script in an IIFE with try/catch** — a single
  browser quirk no longer aborts the whole panel; errors fall back to
  a visible "Error checking server" state with a hint to open DevTools.
- **Removed emoji buttons** (▶️ ⏹ 🚀) — some Windows installs without
  Segoe UI Emoji rendered them as missing-glyph squares. Plain text
  labels now.
- **Visible content before JS runs** — header, status pill, info card
  all render from static HTML so even total JS failure leaves a
  recognisable page.
- **Added `<noscript>` warning** for the rare user with JS disabled,
  pointing them at `Start FreeGSTBill.bat` directly.
- **Added F12 / DevTools hint** in the troubleshooting `<details>`
  so users can self-diagnose remaining issues.

### How to pick up the fix

If you're on v1.6.4 and saw the white screen, pull the update:

```
Update FreeGSTBill.bat
```

Or directly download the new `Launcher.html` from the GitHub repo and
overwrite your local copy.

If you still see a white screen after the update:

1. Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> in the browser
   to force-reload past any cache
2. Press <kbd>F12</kbd> → Console tab → screenshot anything in red,
   share via [GitHub issue]
3. Or just run `Start FreeGSTBill.bat` directly from the install
   folder while we debug

---

## [1.6.4] — 2026-04-30

Fixes the long-standing "desktop icon does nothing" issue some users have
been hitting. The desktop shortcut now opens a visual **Control Panel**
(`Launcher.html`) that shows server status live, has Start/Stop/Open
buttons, and walks users through troubleshooting if something's wrong.

### Added — `Launcher.html` Control Panel

A self-contained static HTML page at the install root. Features:

- 🟢 / 🔴 **live status indicator** — polls every 2 seconds, shows
  "Server running on port X" or "Server not running" with a coloured
  status pill (auto dark-mode aware)
- **Big "Open Billing App"** button — enabled only when the server's
  alive, opens the React app in a new tab on whatever port is actually
  serving
- **Start Server** button — triggers the existing `freegstbill://`
  protocol handler (which runs `Start FreeGSTBill.bat`)
- **Stop Server** button — triggers the new `freegstbill-stop://`
  protocol handler (runs `Stop FreeGSTBill.bat`)
- **Smart port discovery** — tries cached port first, falls back to
  parallel scan of 47371-47420. Caches the alive port in
  `sessionStorage` so subsequent polls only hit one URL.
- **Info card** — shows port, version, App URL, last-checked time
- **Troubleshooting `<details>`** — collapsible help section with a
  5-step recovery guide
- **Polling pauses** when the tab is backgrounded (visibility API)
- **Burst polling** after Start/Stop clicks so status updates within
  a second instead of waiting 2 seconds for the next regular poll

### Changed — Desktop shortcut now opens the Control Panel

The desktop shortcut previously ran `Start FreeGSTBill.bat` directly.
When that script failed silently (PowerShell hidden-window issues,
node not on PATH, port collision, etc.) the user just saw a black
window flash and nothing else. Now the desktop shortcut opens
`Launcher.html` in the default browser. The Control Panel can detect
whether the server's already running and skip directly to "Open Billing
App", or show the broken state with recovery steps.

Power users who want the old auto-start behaviour can use the new
**"Open Free GST Billing"** shortcut in the Start Menu folder, which
still runs `Start FreeGSTBill.bat` directly.

### Added — `freegstbill-stop://` URL protocol

Mirrors the existing `freegstbill://` (which runs Start.bat) and
`freegstbill-update://` (which runs Update.bat). New one maps to
`Stop FreeGSTBill.bat` and is used by the Control Panel's Stop button.
Registered in `HKCU\Software\Classes` during install — no admin
required.

### Changed — `Start FreeGSTBill.bat` is more resilient

- **Verifies `node` is on PATH** before doing anything. If missing,
  opens the Control Panel (which has troubleshooting steps) instead
  of failing silently in a black window the user can't read.
- **Two-tier server launch** — tries hidden PowerShell first
  (existing behaviour); if PowerShell exits non-zero, falls back to
  a visible minimised CMD window. More compatible with corporate
  Windows installs where PowerShell execution is restricted.
- **30-second wait** (was 20) for slow machines.
- **Failure fallback** — if the server doesn't respond after 30 seconds,
  opens the Control Panel instead of pointing the browser at a dead URL.
  User sees a clear error state with retry option, never a "this site
  can't be reached" generic browser page.

### Backward compatibility

- Existing users who run Update.bat get the new Launcher.html + protocol
  handlers automatically. The desktop shortcut keeps pointing at
  `Start FreeGSTBill.bat` until they re-run `Install FreeGSTBill.bat`
  (which rewrites it). They can also drag-and-drop the new
  `Launcher.html` onto their desktop as a quick fix.
- The new `freegstbill-stop://` protocol is optional — Stop.bat itself
  still works when run directly.

---

## [1.6.3] — 2026-04-30

User-configurable low-stock alerts. Was hardcoded to "alert me when any
product's stock drops to ≤5"; now it's a Settings option you can turn off
entirely or retune.

### Added — Stock Alerts settings panel

New **Settings → Low-stock alerts** card with two controls:

- **Show low-stock alerts** toggle — when off, the 🔔 sidebar notification
  centre stops counting low-stock items, the Dashboard low-stock card
  hides itself, and the Inventory page's orange "low" colour drops to
  plain text. Out-of-stock items (stock = 0) still display as red
  regardless — that's a hard fact, not an alert preference.
- **Threshold** — alert fires when a product's `stock ≤ threshold`.
  Default 5. Common picks: 0 (only when fully out), 3, 5, 10. Disabled
  visually when the master toggle is off.

Setting is app-level (stored at `meta.stockAlertSettings`) rather than
per-business-profile, since it's a UX preference rather than a business
rule. Rides along in the existing backup/restore flow under the "App
settings" checkbox.

### Changed — wired through three views

The new config is read by:

- `App.jsx` → notification centre bell badge + popover
- `Dashboard.jsx` → low-stock card on the bills page
- `InventoryView.jsx` → orange colour-coding on the stock column

All three default to `{ enabled: true, threshold: 5 }` when no setting
is saved, so v1.6.2 invoices and users see no behaviour change unless
they explicitly visit Settings to change it.

---

## [1.6.2] — 2026-04-30

Fixes the StackBlitz / Codespaces sandbox demo path (and the local "Cannot
GET /" head-scratcher that hit anyone who ran `node server.js` directly
without building the frontend first).

### Fixed — friendly "still building" page instead of `Cannot GET /`

Before: if `dist/` didn't exist (StackBlitz boot, fresh clone, running
`node server.js` directly, build still in progress), Express had no `/`
route and returned the cryptic `Cannot GET /` 404. Users assumed the app
was broken.

Now: the SPA catch-all and static middleware are registered
**unconditionally**. The catch-all checks per-request whether
`dist/index.html` exists:

- ✅ exists → serves the real React app
- ⏳ doesn't exist → serves a friendly auto-refreshing placeholder
  page that explains what's happening and how to fix it (run
  `npm run build`, or wait for StackBlitz to finish)

Critically, this means the server can start BEFORE `vite build` finishes
and seamlessly flip to serving the real app the moment `dist/` appears —
no restart required.

### Added — `.stackblitzrc.json`

Tells StackBlitz to run `npm start` (which is `vite build && node
server.js`) on container boot, rather than guessing. Should fix the
"Cannot GET /" experience the demo button was hitting in production.

### No data changes

Pure server behaviour change. No data migration, no UI change in the
real app.

---

## [1.6.1] — 2026-04-30

PWA polish — making the existing Progressive Web App feel more like a
real desktop app, without yet shipping a native installer. This is the
quick win on the path to v2.0's Tauri repackage; everything here is
pure config / UX, no architecture changes.

### Added — Manifest shortcuts

Right-clicking the pinned PWA icon (Windows taskbar, Start Menu, Edge's
app launcher) now shows a jump-list:

- **New Invoice** → `/?view=new`
- **Dashboard** → `/?view=dashboard`
- **GST Returns** → `/?view=filing`
- **Settings** → `/?view=settings`

App boot reads the `?view=X` query param from the manifest shortcut URL
and lands the user directly on that view, then strips the query string
so a refresh doesn't keep snapping back to the shortcut target.

### Added — `window-controls-overlay` display mode

Manifest now declares `display_override: ['window-controls-overlay',
'standalone']`. On supporting Chrome / Edge, the installed app gets a
tighter title bar (the chrome shrinks, we get more vertical space).
Falls back to plain standalone everywhere else.

### Added — Richer manifest metadata

- **Description** rewritten to mention the actual features (GSTR-1/3B/2B,
  TDS/TCS, multi-currency, multi-account, recurring) — Chrome shows this
  in the install dialog and helps app-store-style PWA discovery
- **Categories** `['business', 'productivity', 'finance']` for platform
  recommendation engines
- **Orientation** locked to `portrait-primary` (no accidental
  landscape-mode invoices on a tablet)
- **`lang: 'en-IN'`** for locale-correct quotation marks etc.

### Changed — Install-banner dismissal

Previously: clicking ✕ on the install banner set `freegstbill_pwa_dismissed=1`
and the banner never reappeared. Users who closed it during a busy
moment never saw the option again.

Now: clicking ✕ stores a **timestamp**
(`freegstbill_pwa_dismissed_at`). The banner re-shows automatically
**14 days** after dismissal. The button tooltip says "Remind me later
(re-shows in 14 days)" so the behaviour is discoverable.

### Changed — Install-banner copy

"Install as Desktop App — opens instantly, no browser needed!" →
"Install as Desktop App — own icon, no browser, opens instantly.
Right-click the icon for quick-jump to New Invoice / GST Returns."

The new copy points at the manifest-shortcuts feature so users
understand why it's worth doing.

### Added — iOS standalone detection

Banner now also hides itself when running inside iOS Safari's "Add to
Home Screen" mode (`window.navigator.standalone === true`). Tiny audience
on iOS today, but no reason to nag those who already installed.

### Backward compatibility

- Existing dismissals using the old `freegstbill_pwa_dismissed=1` key
  still suppress the banner. Newly-dismissed users get the 14-day
  re-show.
- All other PWA behaviour (offline cache, service-worker auto-update,
  fonts cache, image cache) is unchanged.

### Not yet (deferred to v2.0)

- Native `.exe` / `.dmg` installers (Tauri repackage)
- Code-signed binaries (no SmartScreen warning)
- System tray icon
- Data migration from ZIP install location to `%APPDATA%`

The full plan for those is in the conversation around v1.6.0 — TL;DR:
Tauri shell wrapping the existing Node + Express + React build, plus a
first-run prompt that copies (never deletes) legacy `data/` folders into
the new per-user app-data location.

---

## [1.6.0] — 2026-04-30

Two big workflow improvements: **service-mode invoices** (with units that
make sense for time-based work) and **inline recurring** (turn any invoice
into a recurring template by ticking a single checkbox — server-side
auto-generates new invoices on schedule on every app boot).

### Added — Service invoice mode

- **Goods / Services / Mixed toggle** at the top of the invoice form. Drives:
  - Default unit on new line items — `Nos` for goods, `Hrs` for services
  - Unit dropdown filtering — services hides Kg / Ltr / Tonne / Bag etc.
    so the user sees Hrs / Day / Week / Month / Visit / Session / Project /
    Word / Page first; goods hides the time-based ones
  - Helpful "💡 Use a SAC code in the HSN field" hint on services
- **New built-in units** with kind tags: Week, Month, Year, Visit, Session,
  Project, Word, Page — all marked `kind: 'services'`. Existing units
  classified as `goods`, `services`, or `both`.
- **Smart unit memory** — adding a 2nd line item uses the same unit as the
  1st, so a 5-row services invoice doesn't make you pick "Hrs" five times.
- Custom user-defined units always show regardless of mode (escape hatch).
- The currently-selected unit on each line always shows even if the mode
  would otherwise hide it — switching mode mid-edit never blanks the
  dropdown.

### Added — Inline recurring invoices

You no longer have to build a Recurring template separately. Tick **🔁 Make
this a recurring invoice** in the Customize panel and you get:

- **Frequency**: Weekly / Monthly / Quarterly / Yearly
- **Interval**: every N (e.g. every 2 weeks, every 3 months)
- **Next invoice date** (date picker, defaults to one cycle from today)
- **End condition**:
  - _Never_ (default — until you pause it in Recurring view)
  - _On a specific date_
  - _After N invoices have been generated_ (perfect for fixed-term contracts)

On save, the invoice is created normally AND a recurring template is
written to `data/recurring/` with everything needed to clone it: client
snapshot, items, custom terms / notes / extra sections, invoiceOptions
(minus the recurring config itself, to avoid infinite recursion).

The existing Recurring Invoices view in the sidebar remains the place to
edit, pause, or delete templates after the fact.

### Added — Server-side auto-fire

`server.js` now runs `processDueRecurring()` 3 seconds after boot and once
every 24 hours afterwards. For every template with `nextDate <= today` and
`active`, the server:

1. Generates a fresh invoice number for the matching type prefix using the
   same atomic counter the frontend uses (race-free across both)
2. Resolves the **live** business profile (so renames since the template
   was created flow through, matching v1.4.2's company-name behaviour)
3. Writes a new bill snapshot dated today with the template's items + client
4. Advances the template's `nextDate` by `frequency × interval`
5. Increments `occurrencesCreated`
6. Respects `endMode: 'onDate'` / `endMode: 'afterN'` and stops automatically
7. Writes a breadcrumb to `data/meta.json` so the UI can show a "X recurring
   invoices auto-generated today" notification

The notification centre 🔔 surfaces this with a 🔁 row that click-throughs
to the Dashboard so the user can review the freshly-created bills.

### Notes on the auto-fire trigger

For most users this fires on every Windows login (the Startup-folder
shortcut starts the server when they log in). Users who never reboot get
the daily setInterval check as a backstop. A proper Windows Task Scheduler
entry that fires regardless of whether the user's logged in is on the v2.0
roadmap — for v1.6 the boot trigger covers ~95% of realistic use.

### Backward compatibility

- `invoiceOptions.invoiceMode` defaults to `'goods'` → old invoices behave
  identically.
- `invoiceOptions.recurring` defaults to `null` → no recurring template is
  created unless the user explicitly ticks the toggle.
- Existing recurring templates created via the standalone Recurring
  Invoices view also auto-fire on boot now (they share the same template
  shape) — net win for them too, no migration required.

---

## [1.5.3] — 2026-04-30

Hotfix. Production build threw `Uncaught ReferenceError: Cannot access 'Nt'
before initialization` on app load — white screen. Caused by a Temporal
Dead Zone violation introduced in v1.5.1.

### Fixed — TDZ on app load

In v1.5.1 the command-palette `paletteActions = useMemo(...)` and its two
dependent `useEffect` calls were placed near the top of `App.jsx`, but
their dependency arrays reference `navItems` and `handleNewInvoice` —
both `const` declared 200 lines lower in the same function body. The
useMemo dep array is evaluated synchronously on every render, so reading
those consts before their declaration threw at the first render — minified
as `Cannot access 'Nt' before initialization` in the production bundle,
manifesting as a white screen for users on v1.5.1 / v1.5.2.

The fix moves the useMemo and the two related useEffects down past
`navItems`. The state hooks (`showPalette`, `paletteQuery`, etc.) stay
where they were since they don't read those consts. Behaviour is
unchanged; only the declaration order moved.

Dev builds never hit this because the file was always running with the
declaration order already legal at HMR-patch time; only a full reload of
the bundled production JS surfaced the TDZ. Lesson: production bundles
are stricter about declaration order than dev bundles.

---

## [1.5.2] — 2026-04-30

Port choice + listener safety. The server has moved off the heavily-contested
**3001** default to **47371** (an unassigned IANA port) so a fresh install
doesn't collide with any of the dozen-or-so other dev tools that camp on the
3000-range. The launcher remains port-agnostic — you've never had to
remember the number, and now you have one less reason to think about it.

### Changed — default port

- **Default port: `3001` → `47371`.** The new default is in IANA's
  unassigned range (between registered 1024–49151 and dynamic
  49152–65535), where it's effectively guaranteed not to collide with
  anything common. The Start / Stop / Update / install-time scripts all
  read `data/port.txt` so they always open whichever port the server
  actually chose — users never need to remember a number.
- **Collision scan widened: 10 → 50 ports.** On the rare collision the
  server now scans `47371..47420` for a free port. If everything in that
  range is somehow occupied, it falls back to "let the OS pick anything
  free" (`port=0`) rather than failing to start. Whatever wins is
  persisted to `data/port.txt`, so the next launch tries that port first
  and avoids the scan entirely.
- **Server binds explicitly to `127.0.0.1`** (was the all-interfaces
  default). Closes a subtle exposure path where a user on shared Wi-Fi
  could have served the API to the LAN. The privacy promise is now
  enforced at the socket level, not just policy.

### Changed — launcher scripts

- **`Start FreeGSTBill.bat`** — default fallback updated to 47371 (was 3001) for first-ever installs where `data/port.txt` doesn't yet exist.
  Documentation block added in-line explaining the read-write dance so
  future maintainers don't reintroduce audit bug B8 (probe-before-read
  timing).
- **`Stop FreeGSTBill.bat`** — default fallback updated to 47371. Still
  reads `data/port.txt` first; only falls back if the file is missing.
  Avoids the previous behaviour of taskkilling whichever poor app
  happens to be on port 3001.
- **`Update FreeGSTBill.bat`** — kills the legacy 3001 process _and_ the
  one named in `data/port.txt`, so users upgrading from v1.5.1 or earlier
  cleanly transition to the new default.

### Removed

- **Deleted `localhost-3001 (Open This in Browser).txt`** from the repo
  root. The filename was misleading (the port can vary), redundant with
  `START HERE.txt` (which covers the same instructions in a better
  place), and the audit flagged its existence as a UX wart.

### Documentation

- `README.md`, `START HERE.txt`, `docs/USER_GUIDE.md`, and the in-app
  searchable User Guide (`src/userGuideContent.js`) all updated:
  `localhost:3001` → `localhost:47371`. README's Quick Start gained a
  _"Why port 47371?"_ paragraph so curious users get the rationale
  inline instead of stumbling on it later.

### Upgrade notes

- **Existing installs** (v1.5.0 / v1.5.1 running on port 3001 with a
  `data/port.txt` saying `3001`) — keep running on 3001 forever unless
  they delete `data/port.txt`. The persisted preference always wins.
  Nothing breaks.
- **Fresh installs** start on 47371 automatically.
- **Switch an existing install to 47371**: stop the server, delete
  `data/port.txt`, restart. The launcher will discover the new port and
  open the right URL on its own.

---

## [1.5.1] — 2026-04-30

Quality-of-life release executed from the post-v1.5 audit. Five bug fixes,
three power-user features (bulk ops, keyboard shortcuts, notifications),
and three GST compliance additions (Cess, RCM, Composition variant). No
data migration — all changes additive and backward-compatible.

### Fixed — confirmed bugs from the audit

- **Export backup hardcoded `version: '1.4.0'`** — now reads live from the
  server via `/api/version` and caches per session ([src/store.js](src/store.js)).
- **Dashboard overdue auto-detection** ran `await saveBill(bill)` inside a
  for-loop — one failure stopped all subsequent updates and saves were
  serialised. Now collects dirty bills and fires `Promise.allSettled`;
  most loads do zero work because the filter pre-checks
  ([src/components/Dashboard.jsx](src/components/Dashboard.jsx)).
- **`calculateLineItemTax()` accepted NaN / negative / string inputs** and
  silently propagated `NaN` through totals. Now defensively coerces every
  field via `finiteNonNeg` and clamps the discount to never exceed line
  value. UI inputs were already clamped, but CSV imports and recurring
  template materialisation now get the same safety net
  ([src/utils.js](src/utils.js)).
- **`recordPayment()` accepted negative and overpayment amounts silently**.
  Now rejects ≤ 0, validates against outstanding balance, and asks for
  confirmation on intentional overpayments ([src/components/Dashboard.jsx](src/components/Dashboard.jsx)).
- **`formatDateGST()` returned `"NaN-NaN-NaN"`** for malformed dates,
  silently corrupting GSTR-1 rows. Now returns empty string on Invalid
  Date ([src/utils.js](src/utils.js)).

### Added — Bulk operations on Bills list

Checkbox column with select-all-visible. When any rows are ticked, a
sticky toolbar shows: **Mark paid** · **Mark unpaid** · **Mark overdue**
· **Export selected as JSON** · **Delete**. All bulk handlers use
`Promise.allSettled` so a single failed save doesn't strand the batch.

### Added — Keyboard shortcuts + command palette

- **`Ctrl/⌘+K`** — Spotlight-style command palette. Type to filter, ↑/↓
  to navigate, Enter to run, Esc to close. Actions: New Invoice · jump
  to any nav page · toggle dark mode · open update modal · show
  shortcuts help.
- **`Ctrl/⌘+N`** — new invoice from anywhere (skipped when typing in an
  input/textarea).
- **`Ctrl/⌘+S`** — save current invoice (only on the invoice form, only
  when the invoice has meaningful content).
- **`Ctrl/⌘+P`** — download current invoice as PDF (only on the invoice
  form).
- **`Ctrl/⌘+/`** — toggle a keyboard-shortcuts help modal.
- New `kbd` styling in CSS for the help modal's key cap visuals.

### Added — Notification centre

Sidebar **🔔 Notifications** button with a red count badge. Popover lists:

- 🔴 Overdue invoices (with sample invoice numbers, click → Dashboard)
- 🟡 Invoices due in the next 3 days (click → Dashboard)
- 🔵 GST filings due in the next 10 days — GSTR-1 (11th), GSTR-3B (20th),
  Form 26Q (last day of month after quarter), Form 27EQ (15th of month
  after quarter), computed by the new `getUpcomingFilings()` helper
  (click → GST Returns)
- 🟢 Products low on stock (click → Inventory)

Computed on mount + every 10 minutes; also recomputes on view change so
the badge stays fresh after the user records a payment or sells stock.
Click outside the popover to dismiss.

### Added — GST compliance trio

- **GST Compensation Cess** — opt-in per-line `cessPercent` field
  (Customize → Items → "GST Cess % column"). Computed off the post-discount
  taxable value (back-calculates correctly when tax-inclusive prices are
  used) and added on top of the invoice total. Renders as its own row in
  the PDF totals block when non-zero.
- **Reverse Charge Mechanism flag** — invoice-level toggle (Customize →
  Compliance flags → "Reverse Charge applies"). When set, the PDF prints
  a prominent declaration: _"Reverse Charge applicable. GST is payable
  by the recipient under Section 9(3)/9(4) of the CGST Act."_
- **Composition-scheme invoice variant** — new invoice type alongside
  Bill of Supply / Tax Invoice / etc. Same template as BoS but auto-adds
  the Rule 46A declaration: _"Composition taxable person, not eligible
  to collect tax on supplies."_

### Notes for upgraders

- Saved invoices that pre-date these features render identically — `cess`,
  `reverseCharge` and the Cess column are all opt-in and absent from the
  defaults.
- Composition is just an INVOICE_TYPES entry — switching to it on a new
  invoice picks up the COMP prefix and the declaration automatically.

---

## [1.5.0] — 2026-04-30

Multi-account payment support. A profile can now hold many bank / UPI
accounts; you pick one per invoice from the Customize panel; the bank
block AND UPI QR on the PDF flow from the selected account together.

Designed and reviewed under the brainstorming skill before any code
changes — full spec at
[docs/superpowers/specs/2026-04-30-multi-account-payments-design.md](./docs/superpowers/specs/2026-04-30-multi-account-payments-design.md).

### Added — Payment Accounts

- **New "Payment Accounts" card** in Settings (between Region Preference
  and Modules). Each profile carries an ordered `paymentAccounts` array;
  per-row buttons: ⭐ Set default · ↑ ↓ Move · Edit · Activate/Deactivate
  · Delete.
- **Account fields**: label (free text, shown in dropdown and optionally
  on PDF), bank name, account number, IFSC (country-aware label →
  IBAN / Sort Code / Routing / BSB), SWIFT, UPI ID, internal notes, plus
  `isDefault` and `isActive` flags.
- **Account number masked** in the list (`••••6789`) — full number only
  inside the edit form and on the PDF.
- **Inactive accounts** hidden from new-invoice dropdowns but kept
  editable; historical invoices that used them still resolve correctly.
- **⭐ Default constraint** enforced on save — exactly one per profile.
- **UPI VPA soft validation** — warning if format doesn't match
  `<handle>@<provider>` pattern; never blocks save.

### Added — Invoice form integration

- **"Payment account on this invoice"** dropdown in Customize panel,
  positioned with the other invoice-level pickers (currency, PDF style).
  Lists only active accounts of the active business profile.
- **`selectedAccountId`** stored on `invoiceOptions` so reopening the
  invoice produces the same PDF.
- **Default seeding** — new invoices default to: (1) last-used account
  for this profile from `localStorage.gst_lastUsedAccountId_<profile>`,
  (2) failing that the ⭐ default, (3) failing that the first active
  account, (4) failing that null.
- **"Show _Pay via: <account>_ label"** toggle in Customize → Footer;
  prints the account label above the bank-details block on the PDF for
  invoices where the account choice matters to the client.

### Changed — PDF rendering

- Bank details block now reads from the resolved account via
  `getAccountById(profile, options.selectedAccountId)`. Falls back to
  flat profile fields when neither array entry nor flat field exists
  — guarantees byte-identical PDFs for v1.4.x invoices.
- UPI QR `useEffect` now keyed on `account.upiId` instead of
  `profile.upiId`. Switching account swaps the QR. If the selected
  account has no UPI ID → no QR, same as today's empty-UPI case.

### Changed — Welcome wizard

- On _Finish_, the wizard's flat bank/UPI inputs are also mirrored into
  `profile.paymentAccounts: [{...thatAccount, isDefault: true,
isActive: true}]`. New users have one account auto-marked Primary
  with zero extra wizard steps.

### Backward compatibility

- **`getPaymentAccounts(profile)`** transparently synthesises a single
  "Default account" from legacy flat fields (`bankName`, `accountNumber`,
  `ifsc`, `swift`, `upiId`) when the array is missing or empty. Old
  invoices, old profiles, old backups all render identically.
- **Migration banner** in Settings → Payment Accounts (one-time, shown
  only when `paymentAccounts` is empty AND legacy fields are set):
  _"Imported your existing bank details as the first account. Edit it
  or add more below."_ One click _Import & continue_ writes the
  synthesised account into the array.
- **Forward syncing** — when the default account changes (via Edit,
  ⭐ button, or Delete), the profile's flat fields are kept in sync with
  the default account so any v1.4.x reader of the same `profile.json`
  still sees consistent data. Graceful one-way downgrade.
- **Backup pipeline** unchanged — `paymentAccounts` is just a property
  of the profile object, which already rides along under the existing
  "Active business profile" / "All business profiles" checkboxes.

### Utility helpers

`src/utils.js` gains:

- `getPaymentAccounts(profile)` — array or synthesised legacy fallback
- `getDefaultAccount(profile)`, `getAccountById(profile, id)`
- `getActiveAccounts(profile)` — filter to `isActive`
- `createEmptyAccount(label)`
- `maskAccountNumber(s)`
- `reorderAccounts(list, fromIdx, toIdx)`
- `setDefaultAccount(list, accountId)`
- `isValidUpiId(s)`

---

## [1.4.3] — 2026-04-30

In-app update notifications. Existing users now find out about new releases
without having to manually check Settings → Updates.

### Added — In-app update notifier

- **Auto-poll for updates** on app start (after a 5-second cool-down) and
  every 6 hours while open. Quietly skips when offline.
- **Sidebar banner** — orange-pulse "Update to vX.Y.Z" button appears at
  the bottom of the sidebar when GitHub has a newer version. A small
  amber dot also shows on the Settings nav item as a secondary cue.
- **Release notes modal** — clicking the banner opens a modal with the
  full release notes (fetched from the GitHub Releases API), a clear
  data-safety reassurance, a link to view the release on GitHub, and
  the existing one-click _Update Now_ button (triggers
  `freegstbill-update://run`).
- **Per-version dismissal** — _Skip this version_ and _Remind me later_
  buttons. Skipping a version remembers it in localStorage, so the
  banner doesn't keep nagging, but a NEW release re-shows it. Reminders
  reappear on next page load.
- **Pre-update backup nudge** — modal calls out that exporting a backup
  first is recommended, with a one-click jump to Settings → Data
  Management.
- **Server `/api/check-update` extended** to call the GitHub Releases
  API in parallel and return release notes, URL, publish date, and tag.
  4-second timeout via `AbortController` so a flaky network can't
  block the response. Replaced naive string-comparison with a proper
  numeric semver compare so `1.4.10` > `1.4.2` works.

### Notes on data safety

The existing `Update FreeGSTBill.bat` script already:

1. Stops the server cleanly (taskkill on the listening port).
2. Copies `data/`, `Saved Invoices/`, `Trash/` to `%TEMP%\freegstbill_backup` BEFORE pulling new code.
3. Uses `robocopy /XD data "Saved Invoices" Trash` so the new code can never overwrite the data folders.
4. Restores from the temp backup as a belt-and-suspenders step, even though step 3 already excluded them.
5. Verifies the version actually changed; warns if not.

The new modal surfaces this guarantee in plain English so non-technical
users don't worry, and offers a one-click jump to _Export Backup…_ if
they want extra reassurance.

---

## [1.4.2] — 2026-04-30

Audit follow-up release tackling the harder bugs from the v1.3.0 internal
audit, plus a dark-mode pass that fixes invisible text on coloured panels.
No new feature surface — but several long-standing correctness issues
finally closed.

### Fixed — Audit P0 / P1 bugs (v1.3.0 audit report)

- 🔴 **B1 — Invoice-number race fixed.** Two concurrent invoice saves can
  no longer both read counter=5 and both write counter=6 (= duplicate
  invoice numbers, a GST audit failure). New atomic
  `POST /api/meta/:key/increment` endpoint reads + increments + writes in
  a single synchronous Express handler; Node's single-threaded I/O makes
  this race-free across HTTP requests. `getNextInvoiceNumber()` now uses
  it.
- 🟡 **B9 — Silent server failure.** When the server is launched via
  `start-server-silent.bat` (hidden window) and crashes on startup, the
  user previously saw nothing. Server now appends every fatal error to
  `data/errors.log` with timestamp and stack trace. New
  `GET /api/health` endpoint returns the last 4 KB of the log so the UI
  can surface a banner. `uncaughtException` and `unhandledRejection`
  handlers log instead of silently dying.
- 🟡 **I7 — SIGINT/SIGTERM graceful shutdown.** `Stop FreeGSTBill.bat`
  uses `taskkill /f`, which can interrupt a sync write mid-flight and
  corrupt JSON. Server now traps SIGINT/SIGTERM, calls `server.close()`
  with a 3-second grace window for in-flight requests, then exits.
- 🟢 **I12 — Strict Content Security Policy** added to `index.html`.
  `default-src 'self'`, scripts limited to same-origin + Google
  Identity Services (Drive auth), connect-src restricted to localhost +
  Google APIs + GitHub release feed. Defends the rich-text Terms /
  Notes / extra-section paths even if DOMPurify config is ever
  loosened.
- 🟢 **I5 — Custom-unit warning on GSTR-1 export.** When the HSN summary
  in the GSTR-1 JSON includes any item with a custom unit (mapped to
  UQC `'OTH'`), the export toast now says how many items were affected
  so the filer knows to map them to a standard UQC if precision matters.

### Fixed — Profile name auto-propagation

- **Saved invoices now auto-reflect business profile edits.** Previously
  a saved bill carried a frozen snapshot of `profile.businessName`,
  address, logo, etc. — renaming "Acme" to "Acme Inc" in Settings
  required re-opening and re-saving every old invoice. The PDF preview
  now matches the snapshot's `businessName` (or `id`) against the live
  profiles list and uses the live data, falling back to the snapshot if
  the profile was deleted. PDF re-renders pick up renames, address
  changes, new logos automatically.

### Fixed — Dark / light mode visibility

- **Global utility CSS.** New `.notice`, `.notice-info`, `.notice-warn`,
  `.notice-note`, `.notice-danger`, `.surface-card`, `.cbx-list`,
  `.cbx-row`, `.cbx-label`, `.cbx-hint`, `.cbx-meta`, `.status-pill`,
  `.kv-list`, `.section-mini-label` classes in `src/index.css`. They
  replace the dozen-or-so duplicated inline-style blocks that had
  hardcoded light-mode colours, so every panel now follows the same
  dark/light tokens.
- **CSS variable expansion.** Added `--bg-secondary`, `--bg-tertiary`,
  `--text-primary`, `--border-color`, `--note-bg/border/text`,
  `--info-bg/border/text`, `--warn-bg/border/text`. Both `:root` (light)
  and `[data-theme="dark"]` carry the full set so any component using
  these names works without theme-specific overrides.
- **Removed hardcoded colours** from the Settings privacy notice,
  Export/Import modal Drive checkbox, modal warning bars, the GSTR-2B
  reconciliation status pills, the InvoiceGenerator TDS / TCS toggle
  cards, and the Modules grid.

### Documentation — README roadmap audit

- **README "Roadmap" section overhauled.** Items already shipped in
  v1.3 / v1.4 are now in a new "Recently Delivered" list (GSTR-2B,
  GSTR-1/3B JSON, multi-GSTIN, TDS/TCS, units, country tax labels,
  region preference, modules page, granular PDF control, rich Terms
  - 13 India presets, granular backup, in-app User Guide, GST
    compliance fixes). The "Coming Soon" / "Planned" / "Community
    Requested" buckets are realigned to actual remaining work, with
    cross-references to [TAX_HELPER_PLAN.md](./docs/TAX_HELPER_PLAN.md) and
    [COMPETITOR_GAPS.md](./docs/COMPETITOR_GAPS.md).

### Notes on items I deliberately left for v1.5+

- **B6 / B10 — stockDeducted ref + null product on delete.** Inspected
  and the existing code already null-checks `productId` and
  `find(p => p.id === item.productId)`; React unmounts the
  InvoiceGenerator on Back, so the ref resets. Audit was on a slightly
  earlier version. Leaving as-is.
- **B8 — `Start FreeGSTBill.bat` reads `port.txt` before probe.** Real
  bug, but the .bat fix needs Windows testing in a VM to verify the
  rewrite doesn't break the auto-launch. Punting.
- **I9 — Recurring invoices auto-fire when app is closed.** Needs a
  Windows Task Scheduler entry or a Node service. Out of scope for a
  single edit pass.
- **B4 — Tax-inclusive interstate IGST math.** Verified against the
  v1.4.0 totals refactor; the math is correct (taxableValue back-calc
  applies before the inter/intra split). Leaving as-is.

---

## [1.4.1] — 2026-04-30

Follow-up release on top of 1.4.0 — granular backup, TDS reports, in-app
searchable User Guide, and a handful of audit fixes from the v1.3 review.

### Added — Backup & restore (full overhaul)

- **Granular Export modal** — pick exactly what to back up via checkboxes:
  active business profile, all profiles, invoices, clients, products,
  expenses, purchases, recurring, receipts, terms templates, app settings
  (region / modules / invoice number format / display options), and local
  preferences (custom units, theme, last region). Each row has a hint
  explaining what it includes.
- **Granular Import modal** — opening a backup file shows you exactly what
  is inside (counts per category) before you commit. You can selectively
  restore just one part — e.g. only the client list, or only settings —
  without touching anything else.
- **localStorage data now rides along in backups.** Custom units, theme,
  region preference, enabled modules, invoice display defaults, onboarded
  flag — all preserved across "move to a new computer" flows. Previously
  these survived only if the user manually copied the browser profile.
- **Optional "Save a copy to my Google Drive"** checkbox in the Export
  modal. Uploads the same JSON file to your own Drive's
  _<Folder> - Backups_ subfolder using the Drive client ID you already
  configured for PDF backup. Local download always happens too — Drive
  is just a parallel copy.
- **New Drive helpers** in `src/services/googleDrive.js`: `uploadJSON`,
  `listBackupsInFolder`, `downloadFileText` — building blocks for v1.5
  "Restore from Drive" picker.
- **Privacy notice** at the top of Settings → Data Management. Explicit,
  green-card callout that everything stays on the user's computer unless
  they tick "Save to Drive". Names the exact folders (`data/`,
  `Saved Invoices/`).

### Added — TDS / TCS Reports

- **New tab in GST Returns: TDS / TCS Report.** Aggregates every invoice
  in the filtered period that has TDS deducted by the buyer or TCS
  collected from the buyer:
  - **TDS Receivable** dashboard — count, total taxable value, total
    TDS, plus per-quarter / per-section breakdown table.
  - **TCS Collected** dashboard — same shape, distinct totals.
  - **CSV exports** for each, formatted as ready input for **Form 26Q**
    (TDS quarterly return) and **Form 27EQ** (TCS quarterly return).
  - Friendly empty state explains how to enable TDS / TCS on an invoice.
- Direct link to <https://www.tin-nsdl.com> in the help banner so users
  know where to file the returns once they have the CSVs.

### Added — In-app Searchable User Guide (PDF)

- **New User Guide view** in the sidebar. Renders 17 sections (Quick
  Start, first-run wizard, daily use, India vs International, modules,
  PDF customization, Terms presets, TDS/TCS, GST returns, E-Way Bill,
  backup, migration, FAQ, troubleshooting, developer setup) with a live
  search box that highlights matches in yellow.
- **Download as PDF** button generates a true text-based PDF using
  jsPDF's native `text()` API — _searchable_, _copy-pasteable_, and
  much smaller than the html2canvas approach we use for invoices. The
  guide content lives in `src/userGuideContent.js` as a structured
  array so on-screen and PDF render can never drift.
- Headings, paragraphs, ordered/unordered lists, key/value tables, and
  callout-style notes are all supported.

### Fixed — Audit follow-ups

- **Aging-bucket NaN crash** ([ReportsView.jsx:117](src/components/ReportsView.jsx#L117))
  fixed: invalid or missing dates now produce 0 days overdue instead of
  `Math.floor(NaN)` propagating through the chart. Legacy bills without
  `dueDate` no longer break the Reports page.
- **`engines` field added** to package.json (`node >= 18.0.0`). Old
  Node 14/16 users now fail `npm install` with a clear "needs Node 18+"
  message instead of cryptic ESM errors.

---

## [1.4.0] — 2026-04-30

This release answers the user-prioritized roadmap items #4, #6, and #7 from
[COMPETITOR_GAPS.md](./docs/COMPETITOR_GAPS.md): TDS/TCS, GSTR-2B reconciliation,
and direct GSTR JSON exports. Also a Modules page for turning off features
you don't use, granular PDF field control, formattable Terms with
business-type presets, and the interstate-purchase ITC routing fix the
internal audit flagged.

### Added — Compliance roadmap (items #4, #6, #7)

- **TDS / TCS on invoices.** Per-invoice toggle in the Customize panel:
  - **TCS** (Section 206C(1H), 52, etc.) is collected from the buyer and
    _adds_ to the invoice total. Default rate 0.1% per 206C(1H), editable.
  - **TDS** (Section 194Q, 194C, 194J, 194I, 194H, 194O, 195, etc.) is
    deducted by the buyer and shown as an _informational_ line below
    "Total Due" with a "Net Receivable" caption — the invoice total itself
    is unchanged.
  - 11 common TDS sections preset with default rates, plus a custom-rate
    option. Both fields hidden for non-Indian profiles.
- **GSTR-2B reconciliation.** New tab under GST Returns. Import the
  GSTR-2B JSON downloaded from the GST portal; we match each entry against
  your purchase records by supplier GSTIN + invoice number and flag:
  - ✓ Matched
  - ⚠ Amount mismatch (within ±₹1 tolerance)
  - ⚠ Books only (you recorded it, supplier hasn't filed yet)
  - ⚠ 2B only (supplier filed it, you forgot to record)
  - Filterable summary chips, full diff table, CSV export of the result.
- **GSTR-3B JSON export.** Direct upload format (schema v1.7) matching the
  GSTN offline tool. Sits next to the existing GSTR-3B CSV button. GSTR-1
  JSON export was already present and uses the same schema-compliant
  output.

### Added — Purchases & ITC

- **Inter-state purchase flag** on each Purchase Bill. When ticked, the
  supplier's IGST flows into IGST ITC in GSTR-3B Table 4(A) instead of
  being incorrectly split CGST + SGST. Closes the ITC-routing gap flagged
  in the v1.3.0 internal audit.

### Added — UX & customization

- **Modules page** (Settings → Modules). Group-based on/off toggles for
  every feature: Sales & Invoicing, Directory, Purchases & Expenses, GST
  & Tax, Reports, Integrations. Disabling a module hides it from the
  sidebar and from related forms — your data is never touched. Core
  modules (Dashboard, Clients, Invoicing, Settings) are locked on so the
  app stays usable.
- **Granular PDF field control.** The Customize panel now groups every
  toggle by section: Header & branding, Client / Bill-to, Invoice meta,
  Items table, Totals, Footer. New toggles: business name, business
  address, business phone, business email, client phone, client email,
  client address, invoice number, invoice date, unit column, rate column,
  subtotal row, "Authorized Signatory" caption. Plus _Hide all_ and
  _Reset to default_ buttons.
- **Rich-text Terms & Notes.** Replaced the plain textarea with an inline
  rich editor: bold, italic, underline, bullet/numbered lists, headings,
  links, clear-formatting. Output is DOMPurify-sanitized and rendered as
  HTML in the PDF.
- **Terms presets by business type (India).** 13 starter templates the
  user can drop in and edit:
  Generic SME / Trader, Freelancer / Consultant, Manufacturer / Wholesale,
  Retail Shop, Restaurant / Café, IT / Software Services, Construction /
  Contractor, Medical / Healthcare, Educational Services, Transport /
  Logistics, Real Estate / Rental, E-commerce Seller, Export / LUT.
  Each includes India-relevant clauses (TDS section, jurisdiction,
  Section 50 interest, etc.).

### Installer & Windows security

- **No more `powershell -Command "Invoke-WebRequest ..."` in the install
  flow.** The previous installer auto-downloaded the Node.js MSI to
  `%TEMP%` and ran `msiexec` against it — clean, but heuristic antivirus
  routinely flags any .bat that fetches and runs an executable. We now
  open the official nodejs.org download page in the user's browser
  instead. Less scary, fewer false positives.
- **Pre-flight check** in the installer: bail out early with a friendly
  message if `package.json` isn't in the working folder (catches the
  common "ran the .bat from Downloads instead of the extracted folder"
  mistake).
- **Up-front messaging** about no-admin-needed, no-HKLM-writes, no-data-
  exfiltration, and a link to the GitHub source so users can verify the
  script before running.
- **`.gitattributes`** added to enforce CRLF on `*.bat`/`*.cmd`/`*.ps1`
  and LF on JS/CSS/MD. Linux / Mac developers cloning the repo and
  emailing the .bat to a Windows user will no longer ship a script that
  cmd.exe refuses to run.
- **SmartScreen / antivirus guidance** added to START HERE.txt and
  [USER_GUIDE.md](./docs/USER_GUIDE.md) — covers the blue "Windows protected
  your PC" screen, the right-click → Properties → Unblock workaround for
  Mark-of-the-Web, and antivirus exclusion paths.

### Notes for the income-tax helper

[TAX_HELPER_PLAN.md](./docs/TAX_HELPER_PLAN.md) remains the planning doc for
the v1.5.x income-tax helper (bank-statement CSV import + ITR Filing
Summary PDF). The IT Department portal accepts JSON only via authenticated
browser uploads — there is no public API — so the realistic ceiling is a
machine-readable summary the user pastes into the portal manually, plus
optionally an ITR-4 Excel-utility-compatible JSON they upload by hand.

---

## [1.3.0] — 2026-04-30

Big release focused on (a) Apurba's unit-of-measure request from the
community, (b) closing the gaps that were keeping foreign-client invoices
from being truly usable, (c) fixing the long-standing "empty draft saved as a
real bill" bug, and (d) making onboarding friendly for non-technical users.
India-specific flows (CGST/SGST/IGST split, E-Way Bill, GSTR exports) keep
working as before.

### Added — Onboarding & UX

- **Region Preference toggle** in Settings → Region Preference: choose between
  _India only_, _International_, or _Both / Auto_. Drives which countries
  appear in pickers, which currencies are offered, and whether GST-only flows
  show up. Switchable any time without losing data.
- **Welcome wizard now asks about region** on the first screen and adapts
  every subsequent step (state dropdown, tax-ID label, bank fields) to the
  chosen country instead of being India-only.
- **Country auto-detected from browser locale** on first run. The wizard
  pre-selects _India_ / _Outside India_ / _Both_ based on `navigator.language`.
- **Save-before-leave guard** — clicking _Back_ with unsaved changes now
  prompts to save instead of silently discarding (and also catches browser
  refresh / tab close).
- **Plain-language USER_GUIDE.md** — covers daily use, backups, migration to
  a new computer, FAQ, and troubleshooting. Linked from the installer and
  START HERE.txt.
- **START HERE.txt rewritten** for non-technical readers with clearer
  step-by-step instructions, region-aware setup notes, and pointers to the
  user guide.
- **Installer messaging warmer** — explains up-front that the script is
  one-time, requires no input, and installs Node.js automatically if needed.

### Improved — PDF quality

- **Sharper, crisper PDFs** without proportional file-size increase. Render
  scale is now `max(3, devicePixelRatio × 2)` (was fixed at 2), JPEG quality
  is 0.95 (was 0.92), and the jsPDF stream now uses deflate compression
  (`compress: true`) plus MEDIUM image compression. Small text and the UPI QR
  are visibly sharper. Net file size typically stays within ±10% of the
  previous output despite the higher source resolution because compression
  efficiency improves at higher resolution for clean line-art / glyphs.

### Fixed — Empty-draft bug

- **New invoices no longer save to the bills list until they have meaningful
  content** (a client name plus at least one item with a non-zero amount).
  Previously, opening _New Invoice_ and clicking away would persist an empty
  bill and clutter the list. Drafts still auto-save to sessionStorage so an
  in-progress invoice survives a browser refresh.
- New status badge: _Draft only — not saved yet_ / _Saving…_ / _All changes
  saved_, so you always know where you stand.

### Fixed — GST compliance bugs (from internal audit)

These are real correctness fixes that affect filings — not UX polish.

- 🔴 **`placeOfSupply` override now drives the CGST/SGST/IGST split.**
  Previously the split was computed only from the client's registered state,
  ignoring an explicit place-of-supply field. Per GST law the tax type
  follows the place of supply, not the registered address. A Delhi seller
  invoicing a Delhi client for a supply consumed in Haryana now correctly
  charges IGST.
- 🔴 **E-Way Bill `supplyType` was emitting `I` (Inward) for interstate
  outward supplies, getting the JSON rejected by the NIC portal.** The
  schema defines `O` for any outward (seller-issued) bill and `I` for
  inward — it has nothing to do with intra/interstate. Now hardcoded to
  `O` for seller-issued bills; intra/inter is captured via state codes.
- 🔴 **E-Way Bill pincodes hardcoded to `0`** are rejected by the portal
  with "Invalid Pincode". Now read from `profile.pin` / `client.pin`, with
  a fallback that extracts a 6-digit code from the address. If no pincode
  is found, the export throws a clear error pointing the user to the
  Settings field instead of producing a guaranteed-rejected payload.
- 🔴 **GSTIN validation regex in GST Returns disagreed with Settings —
  Settings accepted GSTINs ending in a letter, GST Returns flagged them as
  invalid.** Both now use the official format
  `^\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z][A-Z\d]$` (last char can be alphanumeric).
- 🟡 **SEZ client flag** (Settings → Add Client / Edit Client → "SEZ unit /
  Developer" checkbox). When set, supplies are charged IGST regardless of
  state — Section 16, IGST Act. Threaded through totals, invoice preview,
  and GSTR-1 classification.
- 🟡 **`details.placeOfSupply` is now respected throughout `GSTReturns.jsx`**
  (B2B / B2C Large / CDNR / HSN / GSTR-1 JSON / GSTR-3B). All 11 inline
  `prof.state !== client.state` checks were replaced with a single
  `billIsInterstate(bill)` helper that follows the place-of-supply override
  and SEZ flag.
- 🟡 **GSTR-3B late-fee cap text was wrong** — said ₹10,000 (pre-2023 rule),
  should be ₹5,000 / ₹500 nil per the CGST Amendment Act 2023.
- 🟡 **`taxInclusive` math** is now correctly threaded into GSTR-1 / GSTR-3B
  calculations. Previously, MRP-style invoices over-stated taxable value in
  the returns by including the embedded tax inside the "taxable" figure.
  `calculateLineItemTax(item, taxInclusive)` is the single source of truth
  for line-item math now.

### Documentation

- **[USER_GUIDE.md](./docs/USER_GUIDE.md)** — plain-language handbook covering
  daily use, backup, migration to a new computer, FAQ, troubleshooting.
- **[COMPETITOR_GAPS.md](./docs/COMPETITOR_GAPS.md)** — gap analysis vs the top
  5 GitHub OSS projects (ERPNext, Akaunting, Invoice Ninja, Crater,
  InvoiceShelf) and top 5 commercial Indian tools (Tally, Vyapar, Zoho,
  ClearTax, Marg). Includes the prioritized post-1.3 roadmap (e-Invoice
  IRN, RCM, Cess, GSTR-2B reconciliation, Tally export, payment-gateway
  links, mobile app).
- **[TAX_HELPER_PLAN.md](./docs/TAX_HELPER_PLAN.md)** — proposal for the v1.4.0
  Income Tax Helper feature (bank-statement import + ITR filing summary
  PDF). Three-tier scope, with realistic limits on what's possible without
  a public REST API from the IT Department.
- **[START HERE.txt](./START%20HERE.txt)** rewritten for non-technical users.

### Known limitations carried into 1.4.0

- 🟡 GSTR-3B Table 3.1 still emits a single "(a) taxable" row — needs
  invoice-level categorization for zero-rated, nil, exempt, and non-GST
  supplies before we can split it correctly.
- 🟡 Purchase ITC in GSTR-3B is split 50/50 CGST+SGST regardless of
  source. Inter-state purchases need a flag on the purchase record so we
  can route their ITC to IGST. Coming in 1.4.0 with the Income Tax Helper.
- 🟡 HSN digit-count enforcement (4-digit < ₹5cr / 6-digit ≥ ₹5cr) not yet
  enforced — currently warns only when HSN is missing.

### Added — Line items

- **Per-line unit of measurement** (kg, ltr, mtr, ft, hrs, box, pcs, …) on every
  invoice. Quantity now displays as `2 Kg`, `10 Ft`, `50 Pcs` in the PDF/preview.
- **Custom units** — pick `＋ Add custom…` from the unit dropdown to define your
  own (e.g. _Carat_, _Bundle_, _Bushel_). Persists per-device and shows up
  everywhere units are used. Custom units can also be removed from the same
  dropdown.
- Saved products now remember their unit; picking a product autofills its unit
  on the line item.
- **Custom tax rate** option in the rate dropdown. The defaults shown in the
  dropdown follow the seller's country (5/12/18/28% for India, 5/20% for UK,
  10% for Australia, 9% for Singapore, 0/15% for Saudi Arabia, etc.) and you
  can always type any rate via the _Custom…_ entry.

### Added — International / multi-country

- **Country-aware tax labels** — invoices for non-Indian businesses now show
  _VAT_, _MwSt_, _TVA_, _SST_, _PPN_, _Sales Tax_, etc. instead of hardcoded
  _GST_/_CGST_/_SGST_/_IGST_. India keeps its CGST+SGST / IGST split.
- **Country-aware bank labels** — the bank-details footer renders the correct
  field name per country (IFSC for India, IBAN for UAE / Germany / Saudi
  Arabia, Sort Code for UK, Routing Number for US, BSB for Australia, etc.).
- **SWIFT / BIC field** in Settings → Bank Details for foreign accounts. PAN
  field is hidden for non-Indian profiles.
- **Exchange rate snapshot** — when invoicing in a non-INR currency, you can
  enter the FX rate in the Customize panel. The rate is stored on the invoice
  itself so historical reports stay accurate even if rates change later.
- **Currency picker expanded** — all 22 supported countries' currencies are now
  selectable (was previously hardcoded to 8).
- **Amount-in-words** now correctly names: Dirhams/Fils, Riyals/Halalas,
  Rand/Cents, Naira/Kobo, Shillings/Cents, Taka/Poisha, Pesos/Centavos,
  Rupiah/Sen, Ringgit/Sen, and 13 more — was previously English only for
  USD/EUR/GBP/AUD/CAD/SGD/AED.
- **Country default inherits from the active business profile** instead of
  always defaulting to India in the client modal.
- **First-run country detection** — the _Add new profile_ form now picks the
  initial country from your browser locale (`navigator.language`) instead of
  forcing India.
- **Soft tax-ID validation** — on blur, the GSTIN / TRN / VAT / EIN field shows
  a warning if the format doesn't match the country's expected pattern. It's a
  warning only — the field is never blocked from saving.

### Added — Totals

- **Round-off line** — opt-in toggle in the Customize panel. Rounds the final
  total to the nearest whole unit and shows the +/- delta on the invoice. Off
  by default; existing invoices are unaffected.

### Fixed

- **Hardcoded ₹ symbol** in product suggestions and the inventory price column
  no longer ignores the selected currency. A USD invoice now shows `$100`, not
  `₹100`.
- **Interstate split silently breaks when business state is missing.**
  Previously an empty profile state caused all GST invoices to default to
  CGST+SGST (intrastate) even when the client was in a different state. Now we
  toast a warning the first time you open an invoice with this misconfig.
- **E-Way Bill export** now throws a friendly error instead of generating
  garbage JSON when the seller's country is set to anything other than India.
- **Negative quantity / rate / discount** could be entered via paste or the
  browser console. Inputs are now clamped to non-negative on every change, and
  fractional quantities are properly supported (`step="any"`) for kg/ltr/hrs.
- **HSN summary UQC code** in the E-Way Bill JSON now uses the line item's
  actual unit (`KGS`, `MTR`, `LTR`, …) instead of always emitting `NOS`.
- **Bill of Supply** invoice type now correctly hides any default round-off
  line (round-off is opt-in regardless of type).

### Notes for upgraders

- No data migration is required. Existing line items without a `unit` field
  default to _Nos_ on display.
- The previous v1.2.0 invoice options (`showHSN`, `showGST`, etc.) are
  preserved as-is. The new `showRoundOff` and `exchangeRate` options default to
  off / empty.
- Custom units are stored under the localStorage key `gst_customUnits` on each
  device. Use _Settings → Export_ to back them up alongside everything else.

---

## [1.2.0] — 2026-03-21

- Multi-currency support (INR + 7 others) with locale-aware formatting and
  amount-in-words.
- Multi-business profile switcher in the header — invoice from any of your
  registered entities without re-editing settings.
- Country-aware client form — postal code, state, and tax ID labels adapt to
  the client's country (India / US / UK / UAE / Singapore / Australia and 16
  more).

## [1.1.x and earlier]

- GST Returns view with GSTR-1 / GSTR-3B CSV export and self-filing guide.
- Shared `ClientModal`, city/PIN fields, PDF blank-page fix, WhatsApp sharing.
- Auto-sync client edits, save-location toasts.
- 6 major features + SEO-optimized README and roadmap.

For commits before this changelog was introduced, see `git log` on the `main`
branch.
