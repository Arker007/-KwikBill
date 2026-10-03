// UI/UX Shadow & Elevation System (Ant Design v4 Three-Layer Model)
// Run: node packages/financial-core/tests/shadow.test.mjs

import { AntShadowTokens } from '../../../src/styles/tokens.ts';

const expectedPresets = {
  1: {
    tuples: [
      { d: 1, blur: 2, spread: -2, opacity: 0.16 },
      { d: 3, blur: 6, spread: 0, opacity: 0.12 },
      { d: 5, blur: 12, spread: 4, opacity: 0.09 },
    ],
  },
  2: {
    tuples: [
      { d: 3, blur: 6, spread: -4, opacity: 0.12 },
      { d: 6, blur: 16, spread: 0, opacity: 0.08 },
      { d: 9, blur: 28, spread: 8, opacity: 0.05 },
    ],
  },
  3: {
    tuples: [
      { d: 6, blur: 16, spread: -8, opacity: 0.08 },
      { d: 9, blur: 28, spread: 0, opacity: 0.05 },
      { d: 12, blur: 48, spread: 16, opacity: 0.03 },
    ],
  },
};

function generateExpectedToken(level, direction) {
  const { tuples } = expectedPresets[level];
  return tuples
    .map(({ d, blur, spread, opacity }) => {
      let x = '0px', y = '0px';
      if (direction === 'up') y = `-${d}px`;
      else if (direction === 'down') y = `${d}px`;
      else if (direction === 'left') x = `-${d}px`;
      else if (direction === 'right') x = `${d}px`;
      return `${x} ${y} ${blur}px ${spread}px rgba(0, 0, 0, ${opacity})`;
    })
    .join(', ');
}

let pass = 0, fail = 0;

// Test L0 Ground level
if (AntShadowTokens[0] === 'none' && AntShadowTokens.none === 'none') {
  console.log('✓ L0 Ground Level Token: none');
  pass++;
} else {
  console.log('✗ L0 Ground Level Token mismatch:', AntShadowTokens[0]);
  fail++;
}

// Test all 12 tokens across L1, L2, L3 and directions up, down, left, right
const levels = [1, 2, 3];
const directions = ['up', 'down', 'left', 'right'];

for (const level of levels) {
  for (const dir of directions) {
    const actual = AntShadowTokens[level]?.[dir];
    const expected = generateExpectedToken(level, dir);
    if (actual === expected) {
      console.log(`✓ L${level} ${dir.toUpperCase()} Shadow Token matches 3-layer physical specification`);
      pass++;
    } else {
      console.log(`✗ L${level} ${dir.toUpperCase()} Shadow Token mismatch:\n  Got:      ${actual}\n  Expected: ${expected}`);
      fail++;
    }
  }
}

console.log(`\nShadow System Tests: ${pass} passed, ${fail} failed.`);
process.exit(fail > 0 ? 1 : 0);
