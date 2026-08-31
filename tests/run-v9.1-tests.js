'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const os = require('os');

const root = path.join(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');

const readme = read('README.md');
assert(/Current release: \*\*v\d+\.\d+(?:\.\d+)?\*\*/.test(readme), 'README presents the current Obol release');
assert(!readme.includes('Current release: **v8.8**'), 'README no longer calls v8.8 the current release');
assert(readme.includes('Open `#/dashboard` for the active Product Hardening Dashboard'), 'README directs users to the in-app product dashboard route');
assert(readme.includes('one open release/product-hardening PR'), 'README documents the single open PR rule');
assert(readme.includes('## Future-agent quickstart'), 'README is an agent handoff surface');
assert(readme.includes('[`BUILDING.md`](BUILDING.md)'), 'README sends agents to BUILDING.md for release workflow');

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

const releasePrValidator = read('tools/validate-release-pr.js');
assert(releasePrValidator.includes('validate-open-pr-uniqueness.js'), 'release contract invokes the open PR uniqueness guard');
assert(fs.existsSync(path.join(root, 'tools', 'validate-open-pr-uniqueness.js')), 'open PR uniqueness validator exists');

const uniquenessFixture = path.join(os.tmpdir(), 'obol-pr-uniqueness-fixture.json');
const allowedPulls = {
  pulls: [
    { number: 81, state: 'open', title: 'Obol v9.1 — product-hardening dashboard and test contracts', head: { ref: 'release/obol-v9.1' }, body: 'Product hardening release.' },
    { number: 12, state: 'open', title: 'Docs typo', head: { ref: 'docs/typo' }, body: 'Unrelated docs work.' }
  ]
};
fs.writeFileSync(uniquenessFixture, JSON.stringify(allowedPulls));
let uniqueness = cp.spawnSync(process.execPath, [path.join(root, 'tools', 'validate-open-pr-uniqueness.js'), '--fixture', uniquenessFixture, '--current-pr', '81'], { cwd: root, encoding: 'utf8' });
assert.strictEqual(uniqueness.status, 0, uniqueness.stderr || uniqueness.stdout);

const duplicatePulls = {
  pulls: [
    ...allowedPulls.pulls,
    { number: 82, state: 'open', title: 'Product hardening item DoD gate', head: { ref: 'hardening/product-item-dod' }, body: 'Product-hardening duplicate guardrail PR.' }
  ]
};
fs.writeFileSync(uniquenessFixture, JSON.stringify(duplicatePulls));
uniqueness = cp.spawnSync(process.execPath, [path.join(root, 'tools', 'validate-open-pr-uniqueness.js'), '--fixture', uniquenessFixture, '--current-pr', '81'], { cwd: root, encoding: 'utf8' });
assert.notStrictEqual(uniqueness.status, 0, 'open PR uniqueness guard rejects duplicate product-hardening PRs');
assert((uniqueness.stderr || uniqueness.stdout).includes('#82'), 'duplicate failure names the duplicate PR');
fs.unlinkSync(uniquenessFixture);

for (const command of [
  ['tools/validate-product-hardening-queue.js'],
  ['tools/validate-asset-references.js'],
  ['tools/sync-product-build-next.js', '--check'],
  ['tools/validate-open-pr-uniqueness.js'],
  ['tools/validate-release-pr.js', '--repo-only', '--release-version=9.1']
]) {
  const result = cp.spawnSync(process.execPath, command.map((part, idx) => idx === 0 ? path.join(root, part) : part), { cwd: root, encoding: 'utf8' });
  assert.strictEqual(result.status, 0, (result.stderr || result.stdout || '').trim());
}

console.log('v9.1 product-hardening item-test, dashboard/version hygiene, and PR uniqueness tests passed.');
