# 13 — Performance Plan

## 1. Frontend Performance Audit & Optimizations

### 1.1 Bundle Splitting & Lazy Loading
- **Current State**: `src/App.jsx` already implements `React.lazy` for secondary views. However, `jspdf`, `html2canvas`, `qrcode`, and `tesseract.js` can still leak into the main chunk if referenced synchronously in shared utilities.
- **Optimizations**:
  1. Ensure `jspdf` and `html2canvas` are strictly dynamic imports (`await import('jspdf')`) inside the PDF generator service.
  2. Verify manual chunk grouping in `vite.config.js`:
     - `vendor-react`: `react`, `react-dom`
     - `vendor-pdf`: `jspdf`, `html2canvas`
     - `vendor-icons`: `lucide-react`
     - `vendor-qr`: `qrcode`
  3. Exclude Tesseract language traineddata from standard service worker precaching (already configured via `globIgnores: ['**/tesseract/**']`).

### 1.2 Minimizing Render Cascades in Invoice Editor
- **Current Problem**: In `InvoiceGenerator.jsx`, changing a quantity on line item 1 causes the entire 4,146-line component tree, all line items, the client selector, and the live preview to re-render.
- **Remediation**:
  1. Memoize item rows with `React.memo(InvoiceItemRow, arePropsEqual)`.
  2. Debounce tax total recalculations by 50ms during active text typing.
  3. Decouple the live print preview iframe, updating it only on blur or tab switch rather than on every keystroke.

---

## 2. Backend Performance & I/O Optimizations

### 2.1 Disk I/O Bottlenecks
- **Current Problem**: Every call to `GET /api/bills` reads every single `.json` file in `data/bills/` via synchronous filesystem iteration:
  ```javascript
  const files = fs.readdirSync(BILLS_DIR);
  const bills = files.map(f => JSON.parse(fs.readFileSync(path.join(BILLS_DIR, f))));
  ```
  At 2,000 invoices, this consumes 2,000 synchronous disk read operations and JSON deserializations, freezing the Node.js event loop for 300–600ms.

### 2.2 In-Memory Metadata Caching
- **Solution**:
  - Maintain an in-memory Map of lightweight bill summaries:
    ```javascript
    class BillIndex {
      constructor() {
        this.cache = new Map(); // id -> { id, invoiceNumber, date, clientName, grandTotal, status }
      }
      loadAll() { /* populate on startup */ }
      getSummaries() { return Array.from(this.cache.values()); }
      upsert(bill) { this.cache.set(bill.id, extractSummary(bill)); }
      remove(id) { this.cache.delete(id); }
    }
    ```
  - `GET /api/bills` serves directly from `BillIndex.getSummaries()` in <1ms.
  - Detailed lines are only read when individual invoices are requested via `GET /api/bills/:id`.

### 2.3 Eliminating Sync File Writes
- Replace `fs.writeFileSync` across all route handlers with asynchronous streams or `fs.promises.writeFile`.
