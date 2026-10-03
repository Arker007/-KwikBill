# 02 — Target Architecture

## 1. Architectural Philosophy

The target architecture is governed by three foundational principles:
1. **Unidirectional Dependency Flow**: Modules may only depend on layers below them in the hierarchy. No upward dependencies or sibling feature coupling.
2. **Strict Domain Encapsulation**: A business feature owns its UI components, state, hooks, domain validation, and API calls. Nothing outside the feature may directly mutate feature internals.
3. **Layered Separation of Concerns (Backend)**: The backend enforces a strict four-layer pipeline: `Route → Controller → Service → Repository → Storage Engine`.

---

## 2. Frontend Layer Structure (`src/`)

```
src/
├── app/                  # Application bootstrap, routing, providers, layouts
│   ├── providers/        # Global context providers (Theme, Currency, Notifications)
│   ├── router/           # View navigation, URL state synchronization, view guards
│   ├── layout/           # AppShell, TopNav, Sidebar, Footer, MobileNav
│   └── index.ts          # App bootstrap export
├── pages/                # Thin route-level composition views
│   ├── DashboardPage.tsx
│   ├── InvoiceEditorPage.tsx
│   ├── ClientsPage.tsx
│   ├── InventoryPage.tsx
│   ├── GSTReturnsPage.tsx
│   ├── IncomeTaxPage.tsx
│   ├── ReportsPage.tsx
│   ├── SettingsPage.tsx
│   └── ...
├── features/             # Isolated domain business capabilities
│   ├── invoices/         # Invoicing, line items, tax breakdown, PDF printing
│   ├── clients/          # Client management, credit limits, GSTIN lookup
│   ├── inventory/        # Product catalog, stock tracking, HSN lookup
│   ├── expenses/         # Business expense vouchers & category tracking
│   ├── purchases/        # Purchase bills, vendor ITC tracking
│   ├── recurring/        # Subscription & repeating contract templates
│   ├── receipts/         # Payment receipts & vouchers
│   ├── gst-returns/      # GSTR-1, GSTR-3B, GSTR-2B reconciliation engine
│   ├── income-tax/       # AY 2025-26 tax calculators, deductions, advance tax
│   ├── reports/          # Financial summaries, sales registers, tax reports
│   └── settings/         # Business profile, thermal print setup, backups, updates
├── shared/               # Universal domain-agnostic building blocks
│   ├── components/       # Base UI primitives (Button, Modal, Input, Table, Card)
│   ├── hooks/            # Generic hooks (useDebounce, useLocalStorage, useHotkeys)
│   ├── utils/            # Universal utilities (formatters, dateUtils, mathUtils)
│   ├── constants/        # System-wide static definitions (currencies, regions)
│   └── types/            # Foundational TypeScript declarations
├── services/             # Core application-wide infrastructure services
│   ├── api/              # Standardized HTTP client, fetch interceptors, error parsers
│   ├── pwa/              # Service worker lifecycle, update prompt managers
│   └── storage/          # LocalStorage abstractions with schema migration
├── store/                # Truly cross-cutting global application state
├── styles/               # Design tokens, global CSS variables, resets, utilities
└── main.tsx              # React DOM entry point
```

---

## 3. Dependency Direction Rules

```
       [ App Layer ]
             ↓
      [ Pages Layer ]
             ↓
    [ Features Layer ]
             ↓
 [ Shared / Services Layer ]
```

### Strict Rules:
- **`app/`** may import from `pages/`, `features/`, `shared/`, `services/`, `store/`.
- **`pages/`** may import from `features/`, `shared/`, `services/`, `store/`. `pages/` may **NEVER** import from `app/` or another page.
- **`features/`** may import from `shared/`, `services/`, `store/`.
  - **Cross-feature imports are STRICTLY FORBIDDEN.** Feature A (e.g. `invoices`) must never directly import from Feature B (e.g. `clients/components/ClientForm`).
  - If Feature A needs data or components from Feature B, communication must happen via page composition, shared hooks, or standard domain contracts.
- **`shared/`** may **NEVER** import from `features/`, `pages/`, or `app/`. It must be 100% domain-agnostic.

---

## 4. Feature Folder Anatomy

Every feature folder adheres to this standard internal structure:

```
features/[feature-name]/
├── components/           # Feature-specific UI components
├── hooks/                # Feature-specific React hooks
├── services/             # HTTP calls specific to this feature
├── store/                # Feature-specific state (if stateful beyond hooks)
├── types/                # TypeScript interfaces and domain types
├── utils/                # Pure helper functions specific to this domain
└── index.ts              # Public API barrel file exposing only allowed symbols
```

### Feature Barrel Exports:
Only public interfaces, top-level containers, and contracts may be exported in `index.ts`. Internal sub-components (e.g. `InvoiceItemRow.tsx`) remain private to the feature.

---

## 5. Backend Layer Structure (`server/`)

```
server/
├── index.js              # Server entry point, port resolution, graceful shutdown
├── app.js                # Express application setup, global middleware registration
├── config/               # Environment configuration, path constants, limits
├── shared/               # Shared backend infrastructure
│   ├── middleware/       # CORS, error handler, body parser, rate limiter
│   ├── utils/            # Atomic file writers, path sanitizers, logger
│   └── errors/           # Custom AppError classes (NotFoundError, ValidationError)
├── infrastructure/       # Low-level persistence & background services
│   ├── storage.js        # Atomic JSON filesystem database engine
│   ├── backupScheduler.js# Daily backup runner and retention manager
│   └── recurringWorker.js# Background recurring invoice automation runner
└── modules/              # Domain-specific backend modules
    ├── bills/            # Invoice management
    ├── clients/          # Client master
    ├── products/         # Inventory products
    ├── expenses/         # Expenses
    ├── purchases/        # Purchase bills
    ├── recurring/        # Recurring templates
    ├── receipts/         # Payment receipts
    ├── profiles/         # Business profile(s)
    ├── system/           # Updates, version, control panel, health
    └── backups/          # Manual/auto backup and trash management
```

### Backend Domain Module Anatomy:
```
modules/[domain]/
├── [domain].routes.js     # Route endpoint declarations and middleware bindings
├── [domain].controller.js # Request parsing, validation execution, HTTP response
├── [domain].service.js    # Business logic, calculations, workflow orchestration
├── [domain].repository.js # Data persistence calls to infrastructure storage
└── [domain].schema.js     # Input validation schema
```

### Flow of Control:
`HTTP Request → Route → Controller → Service → Repository → File Storage Engine`
- Controllers never touch the filesystem directly.
- Repositories never know about `req` or `res` objects.
- Services are testable in isolation without mocking HTTP transports.
