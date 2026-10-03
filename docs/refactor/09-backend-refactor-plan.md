# 09 — Backend Refactor Plan

## 1. Backend Current State & Problems

The entire backend is contained inside a single file: `server.js` (1,589 lines).

### Deficiencies:
1. **No Layering**: A single route handler parses JSON, validates fields with inline regex, formats dates, computes totals, constructs filesystem file paths, calls `fs.writeFileSync`, updates backup logs, and returns JSON.
2. **Synchronous Filesystem Calls**: Extensive use of `fs.readFileSync` and `fs.writeFileSync` in request handlers blocks the Node.js event loop during high-concurrency requests or large archive imports.
3. **Implicit Dependencies**: Shared utility functions (`computeInvoiceTotals`) are imported directly from frontend source files (`./src/utils.js`), tightly coupling the server process to the frontend build structure.
4. **Lack of Centralized Error Middleware**: Errors are caught in fragmented `try/catch` statements and written to an unstructured text file (`data/errors.log`).

---

## 2. Target Layered Architecture (`server/`)

```
server/
├── index.js              # Server entry point, port management, shutdown handlers
├── app.js                # Express app factory, middleware mounting, router binding
├── config/
│   ├── env.js            # Environment variables (PORT, NODE_ENV)
│   └── paths.js          # Canonical filesystem paths (DATA_DIR, BACKUPS_DIR)
├── shared/
│   ├── middleware/
│   │   ├── cors.js       # Allowed origins, headers, pre-flight options
│   │   ├── errorHandler.js # Global unhandled error & AppError serializer
│   │   ├── requestLogger.js# Request/response time logging
│   │   └── validate.js   # Generic schema validation middleware
│   ├── utils/
│   │   ├── atomicFs.js   # Safe write-to-temp-then-rename filesystem helpers
│   │   └── pathUtils.js  # Safe filename sanitizer preventing path traversal
│   └── errors/
│       ├── AppError.js
│       ├── NotFoundError.js
│       └── ValidationError.js
├── infrastructure/
│   ├── storage/
│   │   └── fileStore.js  # Generic JSON collection repository (CRUD operations)
│   ├── backup/
│   │   └── backupEngine.js # Snapshot creator, 30-day rotation, restoration
│   └── cron/
│       └── recurringEngine.js # Interval timer evaluating due recurring contracts
└── modules/
    ├── bills/
    │   ├── bills.routes.js
    │   ├── bills.controller.js
    │   ├── bills.service.js
    │   ├── bills.repository.js
    │   └── bills.schema.js
    ├── clients/
    ├── products/
    ├── expenses/
    ├── purchases/
    ├── receipts/
    ├── recurring/
    ├── profiles/
    ├── system/
    └── backups/
```

---

## 3. The 4-Layer Responsibility Pipeline

```
 [ HTTP Request ]
        ↓
   1. Route Layer        (Defines endpoints, binds validation middleware)
        ↓
   2. Controller Layer   (Unpacks params/body, calls service, returns HTTP response)
        ↓
   3. Service Layer      (Domain logic, statutory calculations, business validation)
        ↓
   4. Repository Layer   (Reads/writes JSON files via infrastructure storage)
        ↓
 [ Filesystem Store ]
```

### Layer Constraints:
- **Routes** never perform data checks or send responses directly.
- **Controllers** never touch `fs` or `path` directly. They handle HTTP status codes (`200`, `201`, `204`, `400`).
- **Services** are pure JavaScript/TypeScript classes/modules. They know nothing about Express `req` or `res`.
- **Repositories** expose clean asynchronous methods: `findAll()`, `findById(id)`, `create(data)`, `update(id, data)`, `delete(id)`.

---

## 4. Decoupling Shared Business Logic

Currently, `server.js` line 5 imports:
```javascript
import { computeInvoiceTotals } from './src/utils.js';
```
This violates backend independence.

### Target Solution:
Create a shared, framework-agnostic domain package or module:
`src/features/invoices/utils/taxCalculation.js` (or symlinked/aliased in `server/modules/bills/taxCalculation.js`) which contains zero DOM dependencies (no canvas, no window, no document), allowing both client and server to compute identical tax totals without circular project references.

---

## 5. Safe Filesystem Operations (`server/shared/utils/atomicFs.js`)

To prevent JSON corruption during sudden container shutdowns:
```javascript
export async function atomicWriteJson(filePath, data) {
  const tempPath = `${filePath}.${Date.now()}.tmp`;
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  await fs.promises.rename(tempPath, filePath);
}
```
This guarantees that reads never encounter half-written JSON files.
