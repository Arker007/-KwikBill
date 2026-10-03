# 07 — State Management Plan

## 1. State Classification & Audit

The current application relies on an unstructured combination of `localStorage`, ad-hoc DOM event triggers (`window.dispatchEvent`), component-local `useState`, and direct API fetching inside `useEffect` blocks.

| State Slice | Current Storage Mechanism | Scope & Purpose | Target Classification | Target Owner | Priority |
|---|---|---|---|---|---|
| `activeProfile` | `localStorage` + API | Current active company profile (name, GSTIN, bank) | Global Application State | `ProfileProvider` / `useProfile` | P1 |
| `selectedCurrency` | `localStorage` (`selected_currency`) | Default display currency (INR, USD, EUR, etc.) | Global Application State | `CurrencyProvider` / `useCurrency` | P2 |
| `theme` | `localStorage` (`theme`) | Dark / Light theme preference | Global Application State | `ThemeProvider` / `useTheme` | P2 |
| `currentView` | `URLSearchParams` + `useState` | Active navigation view (`?view=...`) | URL State | `AppRouter` | P1 |
| `enabledModules` | `localStorage` (`enabled_modules`) | Feature flags for Optional modules | Global Application State | `ModulesProvider` | P2 |
| `invoiceForm` | Giant `useState` in `InvoiceGenerator` | Current draft invoice lines, client, totals | Feature Draft State | `useInvoiceEditorStore` | P1 |
| `billsList` | Fetched on mount in `Dashboard` | All saved tax invoices | Server State | `useBillsQuery` | P1 |
| `clientsList` | Fetched in `ClientsView`, `InvoiceGenerator` | Client contact directory | Server State | `useClientsQuery` | P1 |
| `productsCatalog`| Fetched in `InventoryView`, `InvoiceGenerator` | Inventory items and stock counts | Server State | `useProductsQuery` | P1 |
| `notificationCount`| `useState` in `App.jsx` + timer | Due recurring bills & low stock alerts | Global App State | `NotificationProvider` | P2 |
| `tempFilters` | Local state in views | Search text, date ranges, status filters | Page Local State | Page Component | P3 |

---

## 2. Inappropriate Global & Ad-Hoc Patterns to Eliminate

1. **Window Custom Event Bus**:
   - Currently, components communicate via:
     ```javascript
     window.dispatchEvent(new CustomEvent('bill-saved'));
     window.addEventListener('bill-saved', reloadBills);
     ```
   - *Problem*: Brittle, non-declarative, impossible to trace data flow, prone to memory leaks if cleanup in `useEffect` is omitted.
   - *Replacement*: Replace with standard React state updates or React Query-like cache invalidation in custom hooks (`useBills()`).

2. **Race Conditions in Invoice Counter**:
   - Currently, `getNextInvoiceNumber` performs a read-then-increment across multiple asynchronous calls:
     ```javascript
     const next = (Number(meta[key]) || 0) + 1;
     meta[key] = next;
     await writeJSON(META_PATH, meta);
     ```
   - *Problem*: Two tabs or concurrent requests will generate identical invoice numbers.
   - *Replacement*: Atomically increment counters on the backend via atomic file locks and dedicated counter endpoints (`POST /api/meta/:key/increment`).

---

## 3. Target State Architecture

### 3.1 Global Providers (`src/app/providers/`)
Wrap the application in dedicated, focused context providers:
- `AppProviders.tsx`: Composition container assembling:
  - `ThemeProvider`: Handles `light` / `dark` class on `<html>`, persists to `localStorage`.
  - `ProfileProvider`: Manages active business profile, switching between multiple branch profiles, and profile synchronization with the server.
  - `CurrencyProvider`: Manages active display currency, exchange rates, and currency symbol rendering.
  - `NotificationProvider`: Centralizes due recurring bills and stock warning alerts.

### 3.2 Feature-Level Server State Hooks (`src/features/*/hooks/`)
Replace raw `useEffect` + `fetch` with lightweight encapsulated data hooks:
- `useBills()`: Fetches bills, provides `saveBillMutation`, `deleteBillMutation`, and optimistic state updates.
- `useClients()`: Fetches clients, manages client selection and search autocomplete.
- `useProducts()`: Fetches product inventory, manages stock alerts.
- `useExpenses()`: Fetches expenses, aggregates monthly category totals.

Each hook guarantees:
1. `data`: Cached entity array
2. `isLoading`: Boolean loading state for skeletons
3. `error`: Standardized error object
4. `refetch()`: Imperative trigger for user-initiated refreshes
