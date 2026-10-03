# 10 — Data Layer Plan

## 1. Current Persistence Engine Audit

The application persists all state as flat JSON files in the `./data/` root directory:

Runtime storage defaults to JSON. Historical SQLite migration adapters are compatibility tooling only and are disabled unless `USE_SQLITE=true` is explicitly supplied.

Automated server tests set `NODE_ENV=test` and `FREE_GST_TEST_DATA_DIR` so they operate exclusively on disposable temporary JSON data and never mutate `./data/`.
```
data/
├── bills/              # Individual JSON files per invoice: [bill_id].json
├── clients/            # Individual JSON files per client: [client_id].json
├── products/           # Individual JSON files per product: [product_id].json
├── expenses/           # Individual JSON files per expense: [expense_id].json
├── purchases/          # Individual JSON files per purchase: [purchase_id].json
├── receipts/           # Individual JSON files per receipt: [receipt_id].json
├── recurring/          # Individual JSON files per recurring template: [template_id].json
├── templates/          # Terms & Conditions templates: [template_id].json
├── profiles/           # Multi-business profiles: [profile_id].json
├── backups/            # Date-stamped full directory snapshots: YYYY-MM-DD/
├── trash/              # Soft-deleted bills awaiting recovery or purge
├── profile.json        # Active default business profile
├── settings.json       # General user settings & print configs
└── meta.json           # Sequential invoice counters & system timestamps
```

---

## 2. Strengths & Vulnerabilities of Current Architecture

### Strengths:
- **Zero Configuration**: Works without installing or administering SQLite, PostgreSQL, or MongoDB.
- **Portability**: Users can inspect, copy, or zip their `./data` directory to move all accounting records to another machine.
- **Human-Readable**: Invoices and ledgers can be viewed in standard text editors.

### Vulnerabilities:
- **No Concurrency Locks**: If two operations attempt to write to `data/meta.json` simultaneously, last-write-wins causes silent counter rollback.
- **Unindexed File Scans**: Fetching all bills reads every single `.json` file in `data/bills/` from disk sequentially on every request. At 5,000 invoices, disk I/O degrades response times significantly.
- **No Schema Enforcement**: A malformed JSON file created manually or corrupted by disk failure causes the entire collection read to crash.

---

## 3. Target Data Access Layer Architecture (`server/infrastructure/storage/`)

Instead of migrating to an external SQL database (which would violate user portability and offline-first zero-install simplicity), we introduce a **Robust File-Store Engine**:

```
server/infrastructure/storage/
├── CollectionRepository.js  # Abstract base class for directory-based collections
├── SingleFileRepository.js  # Abstract base class for single-file records (profile, settings, meta)
├── MemoryCacheIndex.js      # In-memory index of entity metadata (id, date, status, total)
└── FileLock.js              # Lightweight file-locking mechanism for concurrent mutations
```

### 3.1 `CollectionRepository` Contract:
```typescript
interface ICollectionRepository<T> {
  findAll(filter?: (item: T) => boolean): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(id: string, entity: T): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  moveToTrash(id: string, trashDir: string): Promise<boolean>;
}
```

---

## 4. In-Memory Indexing for High-Performance Queries

To eliminate disk-scan bottlenecks when loading large registers:
- When the server boots, `MemoryCacheIndex` reads only header metadata (`id`, `invoiceNumber`, `clientName`, `date`, `grandTotal`, `status`) from `data/bills/`.
- Full invoice line details are only read from disk when `GET /api/bills/:id` or PDF print rendering is requested.
- `GET /api/bills` serves directly from the in-memory cache, reducing response time on 1,000 bills from ~450ms to <5ms.

---

## 5. Backup & Disaster Recovery Pipeline

1. **Daily Automated Snapshots**:
   - `server/infrastructure/backup/backupEngine.js` triggers daily at 00:00 or upon first request of the day.
   - Creates a copy of all current JSON data into `data/backups/YYYY-MM-DD/`.
   - Rotates snapshots older than 30 days.
2. **Safe Atomic Restore**:
   - Before applying a backup or JSON import:
     1. Take an emergency snapshot of current state into `data/backups/pre-restore-[timestamp]/`.
     2. Validate target archive integrity.
     3. Clear target directories and unpack new files.
     4. If unpacking fails, immediately roll back from the emergency snapshot.
