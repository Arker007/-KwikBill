# 17 — Rollback & Disaster Recovery Strategy

## 1. Rollback Philosophy

A refactoring plan is only as safe as its ability to revert cleanly. 
- Never rely on a single massive rollback at the end of the project.
- Every phase must possess an explicit, granular rollback procedure that can be executed in under 60 seconds without affecting surrounding modules.

---

## 2. Git Checkpoint Strategy

Before beginning any implementation phase:
1. Ensure working directory is clean: `git status`.
2. Create a phase checkpoint tag or branch:
   ```bash
   git checkout -b refactor/phase-XX-[phase-name]
   ```
3. Upon completing the phase and verifying all checklist gates:
   ```bash
   git add .
   git commit -m "feat(refactor): complete phase XX - [phase-name]"
   git tag "checkpoint-phase-XX"
   ```
4. If verification fails and the issue cannot be resolved within 3 attempts:
   ```bash
   git reset --hard HEAD
   git checkout main
   ```

---

## 3. Data Layer & Filesystem Rollback

Because accounting records are held in `./data/`:
- **Pre-Refactor Snapshot**: Prior to running backend phases (Phases 34–40), create a complete archive of `./data/`:
  ```bash
  cp -r data data.backup-pre-refactor
  ```
- **Disaster Data Restoration**: If any phase corrupts or deletes existing records:
  1. Stop the running Node server process immediately.
  2. Remove corrupted directory: `rm -rf data`
  3. Restore from pre-refactor backup: `cp -r data.backup-pre-refactor data`
  4. Restart server and verify invoice counts.

---

## 4. API & Cross-Stack Rollback (Facade Safety Net)

During Phases 13 through 44, all original files (`src/utils.js`, `src/store.js`, `src/components/*.jsx`) are maintained as re-export facades:
- If a new feature component or modular service fails in production, callers can immediately be repointed to the legacy facade file without rebuilding the entire tree.
- Reverting a single view merely involves pointing `App.jsx` back to the legacy component path.

---

## 5. Emergency Triage Runbook

| Scenario | Symptom | Immediate Diagnostic Step | Recovery Action |
|---|---|---|---|
| Tax Mismatch | `scripts/tax-test.mjs` fails | Check git diff on `src/features/invoices/utils/taxCalculation.ts` | Revert `taxCalculation.ts` to matching commit from Phase 01 |
| Missing Module Error | Vite build fails with `Cannot find module '@/...'` | Inspect `vite.config.js` and `tsconfig.json` aliases | Verify `@/` path alias points to absolute `src/` directory |
| Server Startup Failure | Node exits with `EADDRINUSE` | Check port 3000 process with `lsof -i :3000` | Terminate dangling Node process and verify port fallback |
| Corrupt Invoice File | App displays blank screen on Dashboard | Inspect `data/bills/` for empty 0-byte `.json` files | Restore damaged file from `data/backups/` snapshot |
