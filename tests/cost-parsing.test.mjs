import test from 'node:test';
import assert from 'node:assert/strict';

import { parseHermesOutput } from '../dist/server/execute.js';

const cost = (stdout, stderr = '') => parseHermesOutput(stdout, stderr).costUsd;

test('a cost line on its own is parsed', () => {
  assert.equal(cost('some output\nCost: $0.42\nSession: abc'), 0.42);
  assert.equal(cost('Total cost = 1.5\n'), 1.5);
});

test('the words "spent" and "cost" inside prose are not a cost line', () => {
  assert.equal(cost('The team spent $29.30 on lunch yesterday.'), undefined);
  assert.equal(cost('Budget spent... and then some'), undefined);
  assert.equal(cost('It will cost 5 dollars to ship'), undefined);
});

test('a cost word followed only by dots never yields NaN', () => {
  const parsed = parseHermesOutput('spent...\ncost: .\n', '');
  assert.equal(Object.hasOwn(parsed, 'costUsd'), false);
});
