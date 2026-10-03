// Test for Ant Design ProCard Component & Architecture
// Run: node scripts/procard-test.mjs

import React from 'react';
import { ProCard } from '../packages/ui/src/primitives/ProCard.tsx';
import { StatisticCard } from '../packages/ui/src/primitives/StatisticCard.tsx';

let pass = 0, fail = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    pass++;
  } else {
    console.error(`✗ ${message}`);
    fail++;
  }
}

// 1. ProCard & Static Identifiers
assert(typeof ProCard === 'object' || typeof ProCard === 'function', 'ProCard is defined');
assert(ProCard.isProCard === true, 'ProCard.isProCard is true');
assert(typeof ProCard.Group === 'function', 'ProCard.Group is defined');
assert(ProCard.Group.isProCard === true, 'ProCard.Group.isProCard is true');
assert(typeof ProCard.Divider === 'function', 'ProCard.Divider is defined');
assert(ProCard.Divider.isProCard === true, 'ProCard.Divider.isProCard is true');
assert(typeof ProCard.TabPane === 'function', 'ProCard.TabPane is defined');
assert(ProCard.TabPane.isProCard === true, 'ProCard.TabPane.isProCard is true');

// 2. StatisticCard & Static Identifiers
assert(typeof StatisticCard === 'function' || typeof StatisticCard === 'object', 'StatisticCard is defined');
assert(StatisticCard.isProCard === true, 'StatisticCard.isProCard is true');
assert(typeof StatisticCard.Group === 'function', 'StatisticCard.Group is defined');
assert(StatisticCard.Group.isProCard === true, 'StatisticCard.Group.isProCard is true');
assert(typeof StatisticCard.Divider === 'function', 'StatisticCard.Divider is defined');
assert(StatisticCard.Divider.isProCard === true, 'StatisticCard.Divider.isProCard is true');

console.log(`\nProCard System Tests: ${pass} passed, ${fail} failed.`);
process.exit(fail > 0 ? 1 : 0);
