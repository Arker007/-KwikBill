# AGENTS.md — AI Agent Operating Instructions

> **Canonical System Instructions for Free GST Billing Software**  
> All AI coding agents (Antigravity, Gemini, Claude, etc.) operating in this repository **MUST** adhere to the instructions, constraints, and execution workflows defined in this document and `RULES.md`.

---

## 1. Project Mission & Identity

You are working on **Free GST Billing Software**, an open-source, local-first, zero-configuration accounting and invoicing application tailored for Indian businesses.

### Key Architecture Pillars
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide icons, PWA-enabled.
- **Backend**: Express on Node.js, binding exclusively to `0.0.0.0:3000`.
- **Persistence**: Flat-file JSON storage in `./data/` (`bills/`, `clients/`, `products/`, `expenses/`, `purchases/`, `receipts/`, `recurring/`, `backups/`).
- **Statutory Compliance**: Indian GST (CGST/SGST/IGST/UTGST), e-Way Bill, e-Invoice, GSTR-1, GSTR-3B, GSTR-2B reconciliation, Budget 2025 income tax slabs, Section 234A/B/C interest, Section 206C(1H) TCS, TDS, Rule 119A rounding.
- **Refactoring Roadmap**: 45 structured migration phases documented in `docs/refactor/`.

---

## 2. Mandatory Post-Prompt Protocol (MUST FOLLOW AFTER EVERY PROMPT)

Every prompt that modifies code or project structure **MUST** strictly follow this 6-step cycle:

```
┌────────────────────────────────────────────────────────┐
│ 1. Context & Phase Check (docs/refactor/19-refactor-progress.md) │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 2. Read-Before-Write (view_file on target files)        │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 3. Atomic Incremental Code Modification                 │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 4. Mandatory Verification Suite                         │
│    • node scripts/tax-test.mjs (70/70 PASS)            │
│    • node scripts/discount-modes-test.mjs (9/9 PASS)   │
│    • compile_applet (Build Succeeded)                  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 5. Auto-Update Relevant Documentation (.md Files)      │
│    • docs/refactor/19-refactor-progress.md (status)    │
│    • docs/refactor/18-final-target-tree.md (file tree) │
│    • docs/refactor/20-decisions-log.md (new ADRs)      │
│    • Specific docs/refactor/*.md & CHANGELOG.md        │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 6. Concise Professional Summary (No marketing hype)     │
└────────────────────────────────────────────────────────┘
```

---

## 3. Absolute Non-Negotiables & Guardrails

1. **NEVER Alter Statutory Tax Math**:
   - The algorithms in `src/utils.js` (and target `src/features/invoices/utils/taxCalculation.ts`) calculate statutory legal taxes.
   - Never "simplify", "clean up", or re-engineer tax formulas.
   - All 70 statutory tax tests and 9 discount tests **must pass with zero failures at all times**.

2. **NEVER Replace Flat-File JSON Storage with a Database**:
   - Do NOT install SQLite, PostgreSQL, MySQL, Cloud SQL, Firebase Firestore, or MongoDB.
   - The application's core value is 100% offline, zero-dependency, local file portability in `./data/`.
   - All disk writes must use atomic write-to-temp-then-rename semantics.

3. **NEVER Change the Dev Server Port**:
   - The reverse proxy exclusively routes external traffic to **Port 3000**.
   - Dev server and custom Express server must bind to host `0.0.0.0` and port `3000`.

4. **NEVER Perform Big-Bang Rewrites**:
   - Execute one phase at a time as outlined in `docs/refactor/15-migration-phases.md`.
   - Maintain intermediate delegating re-export facades so existing components and tests never break mid-refactor.

5. **NEVER Use AI Slop in UI**:
   - No purple-to-blue gradients, no arbitrary glowing drop-shadows, no 3-column generic marketing cards.
   - Maintain high-density, professional accounting UI with clean typography, crisp borders, and full Dark/Light theme parity.

---

## 4. Working with the 45-Phase Refactoring Plan

All refactoring work is governed by `docs/refactor/`. Key files:

| File | Purpose | When to Consult |
|---|---|---|
| `docs/refactor/15-migration-phases.md` | Detailed step-by-step blueprints for all 45 phases | Before implementing any phase |
| `docs/refactor/19-refactor-progress.md` | Single source of truth for phase status | At start and end of every turn |
| `docs/refactor/16-verification-checklist.md` | Quality gates for each architectural area | Before marking a phase COMPLETED |
| `docs/refactor/17-rollback-strategy.md` | Emergency rollback and recovery steps | When tests fail or files are corrupted |
| `docs/refactor/20-decisions-log.md` | ADRs (Architecture Decision Records) | When making structural decisions |
| `docs/refactor/18-final-target-tree.md` | Canonical target directory layout | When creating new folders/files |

### Phase Execution Rules:
- Check `docs/refactor/19-refactor-progress.md` to identify the next pending phase.
- Execute only the scope defined in `docs/refactor/15-migration-phases.md` for that phase.
- Update `19-refactor-progress.md`: set phase status to `IN PROGRESS` while working, then `COMPLETED` once all verification gates pass.
- Do not skip phases or begin subsequent phases without explicit instruction or completing prerequisites.

---

## 5. Mandatory Documentation Synchronization Protocol (.md Files)

Every AI agent **MUST** automatically keep documentation synchronized with all code and architecture edits. Leaving documentation stale after an implementation turn is strictly prohibited.

### Documentation Update Matrix:

| Trigger / Edit Type | Required Documentation Files to Update | Update Action |
|---|---|---|
| **Phase Started / Completed** | `docs/refactor/19-refactor-progress.md`<br>`CHANGELOG.md` | Mark status (`IN PROGRESS` / `COMPLETED`), record verification date & results, log changes under `[Unreleased]` |
| **New Files / Directories Created or Moved** | `docs/refactor/18-final-target-tree.md`<br>`docs/refactor/04-file-migration-map.md` | Add newly created files/folders to target tree; update migration mapping status from PENDING to DONE |
| **Architectural / Design Decisions Made** | `docs/refactor/20-decisions-log.md` | Append a new ADR (`ADR-00X`) with Context, Decision, Reason, Alternatives, and Tradeoffs |
| **API Endpoints Added / Modified** | `docs/refactor/08-api-refactor-plan.md`<br>`server/` README / module docs | Document HTTP verb, path, query/body schema, response contract, error codes |
| **Storage / Schema / Data Format Changes** | `docs/refactor/10-data-layer-plan.md` | Update JSON schema models, sample payload structures, and indexing requirements |
| **Security / Auth / Sanitization Changes** | `docs/refactor/11-auth-security-plan.md`<br>`SECURITY.md` | Document sanitization rules, rate limits, path traversal defenses |
| **New Tests or Quality Gates Added** | `docs/refactor/16-verification-checklist.md`<br>`docs/refactor/12-testing-strategy.md` | Add new automated test commands and quality gates |
| **User-Facing Capabilities or Config Changed** | `README.md`<br>`metadata.json` | Update feature lists, environment variables, usage guides, and applet metadata |

---

## 6. Coding & Style Standards

### TypeScript & React
- TypeScript strictness; declare explicit interfaces in `types.ts` files.
- Functional components with React hooks only.
- Avoid large single files: maximum **300 lines of code** per module. Split complex views into sub-components.
- Icons: Exclusively from `lucide-react`. Never create custom SVGs.
- Animation: Import from `motion/react`.
- Path aliases: Use `@/*` mapped to `src/*`.

### Backend Express (server/)
- 4-layer architecture: `Route → Controller → Service → Repository → Storage Engine`.
- Strictly sanitize all filename and ID parameters (`path.basename`, reject `..`, `/`, `\`, null bytes) to prevent path traversal.
- Safe JSON reads (`try/catch` with fallback) and atomic file writes (`atomicFs`).

### CSS & Styling
- Tailwind CSS utility classes directly.
- Global styles in `@import "tailwindcss";` without separate `.css` files.
- Meaningful interactive elements MUST have unique, descriptive `id` attributes.

---

## 7. Communication Style

- **Action-Oriented**: Call tools directly to inspect and edit code. Do not chatter between tool calls.
- **Tone**: Professional, objective, calm, and direct. Avoid marketing hype, self-praise, or flowery adjectives.
- **Turn Summary**: Provide a concise summary structured by functional and visual outcomes. Keep checklists high-level and clear.
