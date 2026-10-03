# Refactor Progress — Free GST Billing Software

## Refactoring Overview
This document tracks the execution state of refactoring phases for the project.

---

## Phase Status Summary

- **Phase**: Ant Design Pro-Style App Header Redesign
- **Status**: COMPLETED
- **Date**: 2026-09-30
- **Verification Gate**:
  - `npm run typecheck`: PASS
  - `node scripts/tax-test.mjs`: 70/70 PASS
  - `node scripts/discount-modes-test.mjs`: 9/9 PASS
  - `npm run build`: PASS
  - Vite HMR update: PASS
  - Rendered header QA (1440×1000 and 390×844): PASS

---

## Completed Milestones

1. **Installed `@react-pdf/renderer`**: Replaced screenshot/bitmap `html2canvas` + `jsPDF` pipeline.
2. **Created Domain View Model**: `createInvoiceViewModel` converts raw API/invoice data into formatted view models.
3. **Built React-PDF Component Primitives**: `InvoiceDocument`, `InvoicePage`, `InvoiceHeader`, `InvoiceParties`, `InvoiceItemsTable`, `InvoiceTotals`, `InvoiceTerms`, `InvoiceFooter`, `InvoiceQr`, `InvoiceWatermark`, `InvoiceCopyLabel`.
4. **Converted Templates**: Built `ClassicPdfTemplate`, `ModernPdfTemplate`, `MinimalPdfTemplate`, `EvergreenPdfTemplate`, `ThermalPdfTemplate`, and `ExactPdfTemplate` (`ExactInvoiceLayout`) registered in `templateRegistry`.
5. **Unified Preview, Download & Print**: Live preview (`PdfInvoicePreview`), PDF downloads (`downloadInvoicePDF`), and printing (`printInvoicePDF`) now consume the exact same React-PDF document tree.
6. **Registered ExactPdfTemplate in Document Settings**: Registered `ExactPdfTemplate` (`exact` / `exact-invoice-layout` / `exactpdftemplate`) in Document Settings Drawer, Invoice Template Selection Modal, Layout & Fonts Tab, and Print Settings design presets.
7. **Statutory Tax Math Protection**: Verified zero changes or regressions to tax math logic across all 70 GST test cases and 9 discount mode test cases.
8. **Resolved Live Preview Iframe Sandbox Blocking**: Replaced `<PdfInvoicePreview>` (which loaded `@react-pdf/renderer`'s iframe/blob viewer) with `<InvoicePreview>` (the high-fidelity native HTML/CSS template viewer) inside `LiveDocumentPreviewModal.tsx`. Wired it up with CSS `zoom` scaling, ensuring that the live preview is fully functional and completely unblocked inside sandboxed iframe containers (like Google AI Studio), while preserving underlying `@react-pdf/renderer` vector PDF engines for print and download actions.
9. **Aligned Printed/Downloaded PDF with HTML Live Preview for All Templates**: Aligned all document-renderer template designs to use high-fidelity layouts corresponding to their respective HTML preview layouts. Specifically, `classic`/`exact` maps to `ExactInvoiceLayout` / `ExactPdfTemplate`, `modern` maps to `ModernTemplate` / `ModernPdfTemplate` (incorporating full solid color accent headers, horizontal meta bars, colored table headers, and matching footer lines), `minimal` maps to `MinimalTemplate` / `MinimalPdfTemplate` (implementing subtle, clean borders and bold document title accents), and `evergreen` delegates to the classic high-fidelity standard layout. Re-implemented all fallbacks, vertical spacer column grids, and custom date formatting parameters on all PDF templates to guarantee 100% exact vector print and real-time screen preview parity across all visual options.
10. **Matched Exact React-PDF Styling to HTML Preview**: Converted the HTML template's A4 margins, CSS pixel typography, hairline and emphasis borders, logo sizing, meta-grid spacing, item-table geometry, calculated spacer height, total-row column span, amount-in-words styling, and 8/4 footer proportions into equivalent React-PDF measurements. A rendered one-page A4 sample was visually checked for alignment, overflow, and section spacing.
11. **Completed Type Safety and Storage Safety Remediation**: Added a mandatory TypeScript build gate, corrected shared component and package contracts, restored JSON persistence as the default, fixed JSON fallback writes when SQLite is disabled, isolated server tests from live user data, and removed mixed-import bundle warnings through targeted lazy loading and vendor chunking.
12. **Aligned Company Logo Preview with Invoice Rendering**: Company Details now shows the exact built-in Vishal Enterprise artwork used by HTML and React-PDF invoice rendering whenever no uploaded profile logo is saved. Uploaded profile logos remain the first-priority source.
13. **Redesigned Settings Sidebar with Ant Design Pro Components**: Replaced custom desktop/mobile navigation markup with the shared ProCard and Ant Design Sider, Menu, Drawer, Button, Flex, Typography, and Tag primitives while preserving all routes, selected state, responsiveness, and theme behavior. The ProCard header is content-sized while the Menu receives the remaining bounded height and independently scrolls on desktop and mobile.
14. **Applied Ant Design Pro Components to Main Navigation**: Rebuilt the main application sidebar with Ant Design Sider, Menu, Drawer, Button, Flex, Typography, Tag, and the shared ProCard. The canonical `navConfig.ts` registry remains unchanged, preserving seven nested groups, direct links, badges, invoice-type routing, collapsed popovers, mobile navigation, scrolling, and footer actions.
15. **Changed Live Document Preview Default Zoom to 100%**: Standard document previews now open and reset at 100% instead of 85%, while thermal previews retain their 140% default and Fit/manual zoom controls remain unchanged.
16. **Repaired Live Preview Layout with Ant Design Components**: Replaced raw layout wrappers with responsive Ant Design Flex/Grid composition, corrected vertical dividers, prevented header/footer action collisions, and made oversized zoomed previews horizontally reachable without changing invoice rendering.
17. **Redesigned the App Header with Ant Design Layout**: Replaced the custom Tailwind header shell with Ant Design `Layout.Header`, `Flex`, `Button`, `Badge`, `Avatar`, `Typography`, `Tag`, `Divider`, responsive breakpoints, and theme tokens. Preserved dashboard navigation, business switching, global search, update state, invoice creation, notifications, server status, theme switching, profile settings, and mobile controls.
