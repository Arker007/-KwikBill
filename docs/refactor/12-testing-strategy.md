# 12 — Testing Strategy

## 1. Testing Hierarchy & Baseline Verification

Before executing any structural refactoring phases, a rock-solid testing harness must be active to protect against regressions.

```
                  ┌────────────────────────┐
                  │ Browser E2E Tests      │ (Optional dedicated browser suite)
                  ├────────────────────────┤
                  │ API Integration Tests  │ (Supertest / Node Native Test Runner)
                  ├────────────────────────┤
                  │ Component Unit Tests   │ (Vitest + React Testing Library)
                  ├────────────────────────┤
                  │ Tax & Math Regressions │ (79 automated statutory tests)
                  └────────────────────────┘
```

---

## 2. Statutory Mathematical Regression Baseline (Mandatory Gate)

The repository includes two critical mathematical test suites:
- `scripts/tax-test.mjs` (70 tests covering Indian GST, Section 51/52 TDS/TCS, RCM, Section 234A/B/C interest, Section 80D/87A caps, UTGST allocation, Budget 2025 slabs).
- `scripts/discount-modes-test.mjs` (9 tests covering percentage, unit-based, net-based, and tax-inclusive discounts).

### Policy:
- **Zero Tolerance for Failures**: All 79 test cases must pass (79 passed, 0 failed) prior to and immediately after any modification to calculation logic or utility files.
- Command: `node scripts/tax-test.mjs && node scripts/discount-modes-test.mjs`

---

## 3. HTTP Smoke & Browser E2E Strategy

### 3.1 Current Automated Coverage
- `tests/e2e/smoke.test.mjs` is an HTTP integration smoke suite using Node.js and `fetch()`; it is not a browser-rendering test.
- `tests/contract/apiContract.test.mjs` validates API contracts, while `tests/security/security.test.mjs` covers path traversal and sanitization.
- These suites always launch their own server with `NODE_ENV=test` and a unique `FREE_GST_TEST_DATA_DIR`, then remove that temporary directory after completion. They must never probe or reuse a live user server.
- Browser rendering and interaction coverage requires a separate browser suite and must not be inferred from the HTTP smoke result.

### 3.2 Critical User Flows for Automated Smoke Testing:
1. **Invoice Lifecycle**:
   - `POST /api/bills`: Create a valid GST invoice with items, client, and tax.
   - `GET /api/bills`: Verify invoice appears in register with accurate totals.
   - `DELETE /api/bills/:id`: Verify bill moves to trash.
   - `POST /api/trash/:id/restore`: Verify bill restores to active register.
2. **Client Management**:
   - `POST /api/clients`: Create client with GSTIN.
   - Verify place of supply determination matches GST state code.
3. **Backup & Restore**:
   - `POST /api/backups/now`: Create snapshot.
   - Verify snapshot archive exists and passes integrity check.

---

## 4. Proposed Unit Test Setup (Vitest)

Install `vitest` and `@testing-library/react` for isolated unit tests:
- Fast in-memory execution using Vite's native transform pipeline.
- Test coverage targets:
  - `src/shared/utils/formatters.test.ts`: 100% coverage on currency words, date formatters, and GSTIN checksums.
  - `src/features/invoices/utils/taxCalculation.test.ts`: Verification against official GST calculation examples.
  - `src/services/api/client.test.ts`: Mocked HTTP responses, network timeouts, error status parsing.
