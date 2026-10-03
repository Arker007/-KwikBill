/**
 * Parity Test Suite (JSON vs SQLite)
 * 
 * Verifies entity counts, exact paisa financial sums (0 delta),
 * line item counts, foreign keys, and meta counters.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyMigrationParity } from '../../scripts/verify-migration-parity.mjs';

test('Migration Parity: 100% fidelity between JSON files and SQLite accounting.db', () => {
  const result = verifyMigrationParity();
  assert.equal(result, true, 'Expected verifyMigrationParity() to pass with 100% parity');
});
