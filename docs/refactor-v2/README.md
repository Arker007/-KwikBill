# Refactor V2 — Domain-Driven Modular Monorepo Plan

## Overview
This directory contains the canonical migration plan to restructure the Free GST Billing Software codebase into a domain-driven modular monorepo (`apps/`, `packages/`, `database/`, `data/`, `tests/`) while maintaining 100% offline functionality, statutory tax math integrity, and zero feature loss.

## Execution Rules & Commands
Refactoring is strictly sequential and executed phase-by-phase. No phase may begin until all prerequisite phases in its `depends_on` array have reached `status: completed`.

### Core Verification Commands
```bash
# 1. Statutory tax calculation integrity (Must pass 70/70)
node scripts/tax-test.mjs

# 2. Statutory discount calculation modes (Must pass 9/9)
node scripts/discount-modes-test.mjs

# 3. HTTP & API smoke suite
node tests/smoke.mjs

# 4. Monorepo application build compilation
npm run build
```

## Phase File Conventions
- Every phase is stored as a self-contained YAML specification at:
  `docs/refactor-v2/phases/W<workstream>/P<phase>.yaml`
- Phase manifests define explicit: `objective`, `scope`, `files_read`, `files_change`, `files_create`, `files_move`, `files_delete`, `actions`, `preserve`, `acceptance`, `verify`, `rollback`, `risks`, and `context_refs`.
- No phase specification duplicates application code or global rules.

## Progress Update Protocol
1. Consult `docs/refactor-v2/STATE.json` for current phase and next ready phases.
2. When starting a phase, transition `status` from `pending` to `in_progress` in `STATE.json` and the phase YAML file.
3. Apply atomic code and file modifications specified in the phase `actions`.
4. Execute verification commands declared in `verify`.
5. On success:
   - Mark `status: completed` in `STATE.json` and the phase YAML.
   - Update `completed` array and recompute `next_ready` in `STATE.json`.
   - Record completion timestamp in `last_updated` and `last_verified`.
6. On failure:
   - Follow the phase's `rollback` instructions immediately.
   - Mark `status: failed` in `STATE.json` and document the failure context.

## Emergency Rollback Procedure
If any verification gate fails or an unexpected regression occurs:
1. Revert touched files via git checkout:
   `git checkout -- .`
2. Restore data directory snapshot if database or JSON files were altered:
   `node scripts/validate-json-data.mjs --restore`
3. Verify that the baseline test suite passes:
   `node scripts/tax-test.mjs && node scripts/discount-modes-test.mjs && node tests/smoke.mjs`
4. Re-run `npm run build` to confirm build health before continuing.
