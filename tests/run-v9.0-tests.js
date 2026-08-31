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

const requiredTracks = [
  'critical-correctness',
  'architecture-runtime',
  'ui-ux',
  'tool-builders',
  'credential-modes',
  'manual-outcomes',
  'notes-integration',
  'offline-performance',
  'testing-qa'
];
const trackIds = new Set(q.tracks.map(t => t.id));
for (const id of requiredTracks) assert(trackIds.has(id), 'required product-hardening track exists: ' + id);

assert(q.items.length >= 70, 'work ledger is seeded');
assert.strictEqual(q.notes.privateRepo, 'platocres/obol-source-notes');
assert.strictEqual(q.totals().notes, 556, 'all staged source notes accounted');
assert.strictEqual(q.totals().resources, 1326, 'all staged embedded resources accounted');

const requiredItems = [
  'cc-version-authority',
  'cc-asset-validation',
  'cc-report-version',
  'cc-link-contrast',
  'runtime-current-entry',
  'runtime-no-layer-rule',
  'tb-schema',
  'tb-nmap',
  'tb-nxc',
  'tb-hashcat',
  'tb-secretsdump',
  'cred-schema',
  'cred-hash-routing',
  'manual-schema',
  'manual-success-unlocks',
  'manual-proof-report',
  'notes-private-source-pointer',
  'notes-source-inventory',
  'notes-disposition-burn-down',
  'qa-dashboard-sync',
  'qa-asset-test',
  'qa-release-contract-v9'
];
const itemIds = new Set(q.items.map(i => i.id));
for (const id of requiredItems) assert(itemIds.has(id), 'required queue item remains modeled or queued: ' + id);
assert(q.buildNext(5).some(i => i.id === 'cc-version-authority'), 'version authority remains top build item');

const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
assert(readme.includes('Future agents should read this README'), 'README contains future-agent handoff');
assert(readme.includes('open the product-hardening dashboard'), 'README points agents to product-hardening dashboard');
assert(readme.includes('pick the highest-priority Product Build Next item'), 'README tells agents how to choose next work');
assert(readme.includes('data/product-hardening/product-hardening-queue.js'), 'README names product-hardening queue source of truth');
assert(readme.includes('OBOL-PRODUCT-BUILD-NEXT:START'), 'README has Product Build Next block start');
assert(readme.includes('OBOL-PRODUCT-BUILD-NEXT:END'), 'README has Product Build Next block end');
assert(readme.includes('This block is generated from `data/product-hardening/product-hardening-queue.js`. Do not edit it manually.'), 'Product Build Next block is marked generated');
assert(readme.includes('platocres/obol-source-notes'), 'README points to private notes repo');
assert(readme.includes('Public Obol must receive only normalized, derived guidance'), 'README preserves public/private notes boundary');

const dashboard = fs.readFileSync(path.join(root, 'product-hardening.html'), 'utf8');
assert(dashboard.includes('product-hardening-dashboard'), 'standalone dashboard entrypoint exists');
assert(dashboard.includes('data/product-hardening/product-hardening-queue.js'), 'dashboard loads queue data');
assert(dashboard.includes('assets/product-hardening-dashboard.js'), 'dashboard loads renderer');
assert(dashboard.includes('assets/product-hardening-dashboard.css'), 'dashboard loads styles');

const renderer = fs.readFileSync(path.join(root, 'assets', 'product-hardening-dashboard.js'), 'utf8');
for (const token of ['q.totals()', 'q.trackSummary()', 'q.buildNext(8)', 'q.notes.privateRepo']) {
  assert(renderer.includes(token), 'dashboard renderer consumes ' + token);
}

for (const forbidden of [
  'data/project-model-v9.0.js',
  'assets/core-v9.0.js',
  'assets/app-v9.0.js',
  'assets/obol-v9.0.css'
]) {
  assert(!fs.existsSync(path.join(root, forbidden)), 'product-hardening release must not create fake runtime overlay: ' + forbidden);
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(path.relative(root, full).replace(/\\/g, '/'));
  }
  return out;
}
assert.deepStrictEqual(walk(root).filter(f => /\.enex$/i.test(f)), [], 'public Obol repo must not contain raw ENEX files');

for (const command of [
  ['tools/validate-product-hardening-queue.js'],
  ['tools/validate-asset-references.js'],
  ['tools/sync-product-build-next.js', '--check'],
  ['tools/validate-release-pr.js', '--repo-only', '--release-version=9.0']
]) {
  const result = cp.spawnSync(process.execPath, command.map(part => path.join(root, part)).map((part, idx) => idx === 0 ? part : command[idx]), { cwd: root, encoding: 'utf8' });
  assert.strictEqual(result.status, 0, (result.stderr || result.stdout || '').trim());
}

console.log('v9.0 post-Orange product-hardening guardrail tests passed.');
