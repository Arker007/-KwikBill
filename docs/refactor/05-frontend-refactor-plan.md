# 05 — Frontend Refactor Plan

## 1. Frontend Architecture Paradigm

The frontend follows a **Three-Tier Component Hierarchy**:
1. **Pages (`src/pages/`)**: Route-level layout orchestrators. Pure coordinators that assemble feature containers, extract route/URL query params, and establish Suspense/Error boundaries. Pages contain zero business logic and zero direct API requests.
2. **Feature Components (`src/features/[feature]/components/`)**: Domain-specific UI blocks (e.g. `InvoiceTable`, `TaxBreakdownCard`, `ClientLedger`). They consume feature hooks and interact with feature services.
3. **Shared UI Primitives (`src/shared/components/`)**: Pure, domain-agnostic UI elements (e.g. `Button`, `Input`, `Modal`, `Select`, `Badge`, `Card`, `Table`). Completely decoupled from any billing or GST terminology.

---

## 2. App Bootstrap & Routing Architecture

### 2.1 Current State
- In `src/App.jsx`, view routing is handled imperatively via:
  ```jsx
  const [currentView, setCurrentView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') || 'dashboard';
  });
  ```
- Views are rendered using a 400-line monolithic JSX conditional block: `{currentView === 'dashboard' && <Dashboard ... />}`.
- Global keyboard shortcuts (`Alt+D`, `Alt+N`, `Alt+S`) and module enablement checks are interwoven with view rendering.

### 2.2 Target Router Architecture (`src/app/router/`)
- Establish a declarative lightweight route registry:
  ```typescript
  export interface RouteDefinition {
    id: string;
    path: string;
    title: string;
    component: React.LazyExoticComponent<React.ComponentType<any>>;
    requiredModule?: string;
    shortcut?: string;
  }
  ```
- Extract route view transitions, active tab synchronization, and query string tracking (`?view=...`) into a dedicated `useAppRouter()` hook.
- Enforce Suspense boundaries with standardized skeleton loaders per page chunk.

---

## 3. Layout Decomposition (`src/app/layout/`)

`src/App.jsx` currently merges:
- Top navigation bar (branding, profile switcher, currency selector, notifications bell, offline indicator)
- Secondary navigation tabs (14 view buttons)
- Global alert banners (PWA update banner, unassigned bills alert)
- Main page container
- Global modal host (Setup Wizard, Welcome Guide, Confirm Dialog)

### Target Layout Modules:
- `src/app/layout/AppShell.tsx`: High-level responsive container grid.
- `src/app/layout/TopNavBar.tsx`: Profile selector, currency picker, system notifications.
- `src/app/layout/NavigationTabs.tsx`: Main horizontal tab strip with hotkey badges.
- `src/app/layout/NotificationCenter.tsx`: Slide-over panel for due recurring bills and stock alerts.
- `src/app/layout/BannerHost.tsx`: Floating alerts (PWA update prompts, offline state).

---

## 4. Decomposing Massive Feature Monoliths

### 4.1 Decomposing `InvoiceGenerator.jsx` (4,146 lines)
`src/features/invoices/components/InvoiceEditor/` will be organized into:
1. `InvoiceEditorContainer.tsx`: Form controller, keyboard event listeners (`Ctrl+S`, `Ctrl+P`).
2. `InvoiceHeaderSection.tsx`: Invoice type selector, sequential invoice number display, issue date, due date.
3. `ClientSelectorSection.tsx`: Client autocomplete dropdown, GSTIN validator, place of supply detector.
4. `InvoiceItemsTable.tsx`: Tabular line item editor, HSN/SAC autocomplete, tax rate picker, discount toggle.
5. `InvoiceTotalsCard.tsx`: Subtotal, CGST/SGST/IGST/UTGST summary, cess, round-off, grand total in words.
6. `InvoicePaymentSection.tsx`: Bank account selector, UPI QR toggle, payment terms, delivery challan options.
7. `EWayBillSection.tsx`: Transporter ID, vehicle number, distance, e-Way bill JSON export.
8. `ThermalPreviewModal.tsx`: Off-screen thermal receipt formatting.

### 4.2 Decomposing `GSTReturns.jsx` (2,283 lines)
`src/features/gst-returns/components/` will be organized into:
1. `GSTRHeader.tsx`: Return period selector (Month/Quarter, Financial Year), filing status summary.
2. `GSTR1Tab/`:
   - `B2BTable.tsx`: 4A, 4B, 4C, 6B, 6C invoice aggregates.
   - `B2CLTable.tsx`: Large interstate consumer invoices.
   - `B2CSTable.tsx`: Small consumer supplies state-wise.
   - `HSNSummaryTable.tsx`: HSN code summary.
   - `DocumentSummaryTable.tsx`: Serial number ranges issued/cancelled.
3. `GSTR3BTab/`:
   - `TaxOnOutwardSupplies.tsx`: Table 3.1 liability computation.
   - `EligibleITCTable.tsx`: Table 4 ITC claims and reversals.
4. `GSTR2BReconciliation/`:
   - `GSTR2BUploader.tsx`: Drag-and-drop parser for government portal JSON files.
   - `ReconciliationDiffTable.tsx`: Matched, mismatched, and missing invoice comparisons.

### 4.3 Decomposing `SettingsView.jsx` (2,068 lines)
`src/features/settings/components/` will be organized into:
1. `BusinessProfilesTab.tsx`: Manage primary and branch profiles with state and GSTIN details.
2. `NumberingSeriesTab.tsx`: Prefix, financial year formatting, padding digits, sequential counter preview.
3. `PrintingPreferencesTab.tsx`: Thermal printer widths (58mm, 80mm), margins, default copies.
4. `DataManagementTab.tsx`: Full backup JSON export, selective entity restore, data reset.
5. `CloudSyncTab.tsx`: Google Drive automated cloud backup connection and status.
6. `ModuleTogglesTab.tsx`: Enable/disable non-core business modules (e.g. Purchases, Expenses, OCR).

---

## 5. Forms, Validation & Error Handling

- Replace unstandardized form state handlers with dedicated hooks (e.g. `useInvoiceForm`, `useClientForm`).
- Establish schema validation contracts (e.g. GSTIN regex `^[0-9]{2}[A-Z]{5}[0-9]{4}[1-9A-Z]{1}Z[0-9A-Z]{1}$`, PAN regex, IFSC regex).
- Centralize user-facing feedback into standard toast and modal patterns, eliminating inline red text blocks scattered across forms.

---

## 6. Accessibility & Responsive UX Standards

- Ensure all interactive modal dialogs trap focus and respond to `Escape`.
- Replace custom clickable `div` elements with native `<button>` or semantic tags equipped with `aria-label`.
- Preserve responsive layout adaptations: single-column stack on mobile screens (`<640px`) and high-density two-column layout on desktop (`>=1024px`).
