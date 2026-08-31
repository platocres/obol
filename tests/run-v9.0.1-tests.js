'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const cp = require('child_process');

const root = path.join(__dirname, '..');
const queuePath = path.join(root, 'data', 'product-hardening', 'product-hardening-queue.js');
const sandbox = { window: {}, globalThis: null };
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(queuePath, 'utf8'), sandbox, { filename: queuePath });

const q = sandbox.window.OBOL_PRODUCT_HARDENING;
assert(q, 'product-hardening queue exposed');
assert.strictEqual(q.version, '9.0.0');
assert.strictEqual(q.contractVersion, '9.0.1');

const requiredFields = [
  'acceptance',
  'test_plan',
  'validation_commands',
  'required_tests',
  'proof_files',
  'risk',
  'status_notes'
];

for (const field of requiredFields) {
  assert(q.definitionOfDone.requiredFields.includes(field), 'Definition of Done requires ' + field);
}

const proofStatuses = new Set(['modeled', 'implemented', 'tested', 'complete', 'superseded', 'rejected']);
const testBearingStatuses = new Set(['implemented', 'tested', 'complete']);
const advanced = q.items.filter(item => proofStatuses.has(item.status));
assert(advanced.length >= 9, 'foundation items carry Definition of Done proof');

for (const item of advanced) {
  for (const field of requiredFields) assert(field in item, item.id + ' carries ' + field);
  assert(Array.isArray(item.acceptance) && item.acceptance.length > 0, item.id + ' has acceptance criteria');
  assert(Array.isArray(item.validation_commands) && item.validation_commands.length > 0, item.id + ' has validation commands');
  assert(Array.isArray(item.required_tests) && item.required_tests.length > 0, item.id + ' names required tests');
  assert(Array.isArray(item.proof_files) && item.proof_files.length > 0, item.id + ' names proof files');
  assert.strictEqual(typeof item.test_plan, 'string', item.id + ' has a test plan');
  assert.strictEqual(typeof item.risk, 'string', item.id + ' has risk notes');
  assert.strictEqual(typeof item.status_notes, 'string', item.id + ' has status notes');
}

for (const item of q.items.filter(item => testBearingStatuses.has(item.status))) {
  assert(item.required_tests.some(f => /^tests\//.test(f) || /^tools\/validate/.test(f) || /^tools\/sync/.test(f)), item.id + ' names a concrete item-specific test or validator');
}

for (const id of [
  'dash-product-foundation',
  'readme-product-build-next',
  'runtime-no-layer-rule',
  'ux-build-next-top',
  'notes-private-source-pointer',
  'notes-source-inventory',
  'qa-dashboard-sync',
  'qa-asset-test',
  'qa-release-contract-v9'
]) {
  const item = q.items.find(entry => entry.id === id);
  assert(item, id + ' exists');
  assert(item.acceptance && item.required_tests && item.validation_commands, id + ' has Definition of Done proof fields');
}

assert.strictEqual(q.totals().queued, 74, 'v9.0.1 does not burn down functional queue items');
assert.strictEqual(q.totals().modeled, 9, 'v9.0.1 preserves the modeled foundation count');
assert.strictEqual(q.totals().notes, 556, 'notes denominator remains intact');
assert.strictEqual(q.totals().resources, 1326, 'embedded resource denominator remains intact');

for (const command of [
  ['tools/validate-product-hardening-queue.js'],
  ['tools/sync-product-build-next.js', '--check'],
  ['tools/validate-release-pr.js', '--repo-only', '--release-version=9.0.1']
]) {
  const result = cp.spawnSync(process.execPath, [path.join(root, command[0]), ...command.slice(1)], { cwd: root, encoding: 'utf8' });
  assert.strictEqual(result.status, 0, (result.stderr || result.stdout || '').trim());
}

console.log('v9.0.1 product-hardening Definition of Done tests passed.');
