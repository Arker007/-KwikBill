/**
 * Repository Adapter Test Suite
 * 
 * Verifies SqliteCollectionRepository, JsonCollectionRepository,
 * CollectionRepository facade, shadow dual-write, and fallback.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { runRepositoryAdapterTests } from '../../scripts/test-sqlite-repository.mjs';

test('Repository Adapters: Dual-write, soft delete, and fallback operations', () => {
  const result = runRepositoryAdapterTests();
  assert.equal(result, true, 'Expected runRepositoryAdapterTests() to pass with 100% assertions');
});
