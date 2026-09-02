'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const cp = require('child_process');

const root = path.join(__dirname, '..');
const queuePath = path.join(root, 'data', 'product-hardening', 'product-hardening-queue.js');
const contractsPath = path.join(root, 'data', 'product-hardening', 'item-test-contracts.js');
const sandbox = { window: {}, globalThis: null };
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(queuePath, 'utf8'), sandbox, { filename: queuePath });
vm.runInContext(fs.readFileSync(contractsPath, 'utf8'), sandbox, { filename: contractsPath });

const q = sandbox.window.OBOL_PRODUCT_HARDENING;
const contracts = sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
assert(q, 'product-hardening queue exposed');
assert(contracts, 'product-hardening item test contracts exposed');
assert.strictEqual(q.version, '9.0.0');
assert(contracts.requiredForStatuses.includes('modeled'), 'modeled queue items require item-specific tests');
assert(contracts.requiredForStatuses.includes('complete'), 'complete queue items require item-specific tests');

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

assert(q.items.length >= 70, 'work ledger remains seeded');
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
for (const id of requiredItems) assert(itemIds.has(id), 'required queue item remains in the durable ledger: ' + id);

// v9.0 owns the baseline queue contract only. Later product-hardening items are validated by
// the current queue validator and their release-specific suites rather than forcing this
// historical suite to load future contract-extension files.
const baselineItems = q.items.filter(i => requiredItems.includes(i.id));
for (const item of baselineItems.filter(i => contracts.requiredForStatuses.includes(i.status))) {
  const contract = contracts.contracts[item.id];
  assert(contract, 'v9.0 status-bearing queue item has item-specific test contract: ' + item.id);
  assert(Array.isArray(contract.acceptance) && contract.acceptance.length, 'contract has acceptance criteria: ' + item.id);
  assert(Array.isArray(contract.validationCommands) && contract.validationCommands.length, 'contract has validation commands: ' + item.id);
  assert(Array.isArray(contract.proofFiles) && contract.proofFiles.length, 'contract has proof files: ' + item.id);
  for (const rel of contract.proofFiles) assert(fs.existsSync(path.join(root, rel)), 'contract proof file exists for ' + item.id + ': ' + rel);
}

const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
assert(readme.includes('## Future-agent quickstart'), 'README is a future-agent handoff');
assert(readme.includes('[`BUILDING.md`](BUILDING.md)'), 'README points agents to BUILDING.md');
assert(readme.includes('[`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md)'), 'README points agents to product-hardening contract');
assert(readme.includes('data/product-hardening/product-hardening-queue.js'), 'README names product-hardening queue source of truth');
assert(readme.includes('OBOL-PRODUCT-BUILD-NEXT:START'), 'README has Product Build Next block start');
assert(readme.includes('OBOL-PRODUCT-BUILD-NEXT:END'), 'README has Product Build Next block end');
assert(readme.includes('This block is generated from `data/product-hardening/product-hardening-queue.js`. Do not edit it manually.'), 'Product Build Next block is marked generated');
assert(readme.includes('platocres/obol-source-notes'), 'README points to private notes repo');
assert(!readme.includes('<!-- OBOL-BUILD-NEXT:START -->'), 'retired Orange Build Next block is not carried in the active README');

const notesDoc = fs.readFileSync(path.join(root, 'docs', 'NOTES-INTEGRATION.md'), 'utf8');
assert(notesDoc.includes('platocres/obol-source-notes'), 'notes integration doc owns the private source pointer');
assert(/normalized|derived/i.test(notesDoc), 'notes integration doc preserves the normalized public-output boundary');

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
  assert(!fs.existsSync(path.join(root, forbidden)), 'v9.0 does not add fake layered runtime file: ' + forbidden);
}

const rawNoteFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.enex$/i.test(entry.name)) rawNoteFiles.push(path.relative(root, full));
  }
}
walk(root);
assert.strictEqual(rawNoteFiles.length, 0, 'raw ENEX files are not committed to public Obol');

const validate = cp.spawnSync(process.execPath, [path.join(root, 'tools', 'validate-product-hardening-queue.js')], { cwd: root, encoding: 'utf8' });
assert.strictEqual(validate.status, 0, (validate.stderr || validate.stdout || '').trim());

console.log('v9.0 product-hardening foundation regression tests passed.');
