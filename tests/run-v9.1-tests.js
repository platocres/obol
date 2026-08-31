'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.join(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');

const readme = read('README.md');
assert(readme.includes('Current Obol release: **v9.1**'), 'README presents v9.1 as the current Obol release');
assert(readme.includes('Completed Orange methodology/source baseline: **v8.8**'), 'README labels v8.8 as the completed Orange methodology/source baseline');
assert(!readme.includes('Current release: **v8.8**'), 'README no longer calls v8.8 the current release');
assert(readme.includes('Open `#/dashboard` for the active Product Hardening Dashboard'), 'README directs users to the in-app product dashboard route');

const app = read('assets/app-v8.8.js');
for (const token of [
  "const PRODUCT_RELEASE='v9.1'",
  "const ORANGE_BASELINE='v8.8'",
  'Offensive Box Operations Ledger · ',
  'product hardening',
  'renderProductDashboard88',
  'ensureProductAssets88',
  'data/product-hardening/product-hardening-queue.js',
  'assets/product-hardening-dashboard.js',
  'active product-hardening queue surface',
  'Completed Orange baseline',
  'Open product dashboard'
]) {
  assert(app.includes(token), 'v9.1 app bridge contains token: ' + token);
}
assert(!app.includes('MutationObserver'), 'v9.1 version bridge must not rely on a broad MutationObserver loop');

const css = read('assets/product-hardening-dashboard.css');
assert(css.includes('.app-phase-badge88'), 'in-app product phase badge is styled');
assert(css.includes('.dashboard66 .ph-shell'), 'product dashboard is styled when embedded in the app dashboard');

const contracts = read('data/product-hardening/item-test-contracts.js');
assert(contracts.includes("requiredForStatuses=['modeled','complete','superseded','rejected']"), 'item-test contract gates all non-queued terminal/progress statuses');
for (const id of ['dash-product-foundation','readme-product-build-next','runtime-no-layer-rule','qa-dashboard-sync','qa-asset-test','qa-release-contract-v9']) {
  assert(contracts.includes("'" + id + "'"), 'item-test contracts include ' + id);
}

for (const command of [
  ['tools/validate-product-hardening-queue.js'],
  ['tools/validate-asset-references.js'],
  ['tools/sync-product-build-next.js', '--check']
]) {
  const result = cp.spawnSync(process.execPath, command.map((part, idx) => idx === 0 ? path.join(root, part) : part), { cwd: root, encoding: 'utf8' });
  assert.strictEqual(result.status, 0, (result.stderr || result.stdout || '').trim());
}

console.log('v9.1 product-hardening item-test and dashboard/version hygiene tests passed.');
