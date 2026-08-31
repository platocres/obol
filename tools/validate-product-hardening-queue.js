'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const queueFile = path.join(root, 'data', 'product-hardening', 'product-hardening-queue.js');
const contractsFile = path.join(root, 'data', 'product-hardening', 'item-test-contracts.js');
const sandbox = { window: {}, globalThis: null };
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(queueFile, 'utf8'), sandbox, { filename: queueFile });
if (fs.existsSync(contractsFile)) vm.runInContext(fs.readFileSync(contractsFile, 'utf8'), sandbox, { filename: contractsFile });

const q = sandbox.window.OBOL_PRODUCT_HARDENING;
const testContracts = sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
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

function validateItemTestContracts() {
  if (!testContracts) {
    fail('product-hardening item test contracts missing');
    return;
  }
  if (!Array.isArray(testContracts.requiredForStatuses) || !testContracts.requiredForStatuses.includes('complete')) fail('item test contracts do not gate completed work');
  if (!testContracts.requiredForStatuses.includes('modeled')) fail('item test contracts do not gate modeled foundation items');
  const contracts = testContracts.contracts || {};
  const items = q.items || [];
  const itemIds = new Set(items.map(i => i.id));
  for (const id of Object.keys(contracts)) {
    if (!itemIds.has(id)) fail('test contract references unknown queue item: ' + id);
  }
  for (const item of items) {
    if (!testContracts.requiredForStatuses.includes(item.status)) continue;
    const contract = contracts[item.id];
    if (!contract) {
      fail('queue item has status ' + item.status + ' but no item-specific test contract: ' + item.id);
      continue;
    }
    if (!Array.isArray(contract.acceptance) || contract.acceptance.length === 0) fail('test contract lacks acceptance criteria: ' + item.id);
    if (!Array.isArray(contract.validationCommands) || contract.validationCommands.length === 0) fail('test contract lacks validation commands: ' + item.id);
    if (!Array.isArray(contract.proofFiles) || contract.proofFiles.length === 0) fail('test contract lacks proof files: ' + item.id);
    for (const rel of contract.proofFiles || []) {
      if (!exists(rel)) fail('test contract proof file is missing for ' + item.id + ': ' + rel);
    }
  }
}

if (!q) fail('queue object missing');

if (q) {
  if (q.version !== '9.0.0') fail('unexpected queue version ' + q.version);

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

  if (!Array.isArray(q.tracks)) fail('tracks array missing');
  if (!Array.isArray(q.items)) fail('items array missing');

  const trackIds = new Set((q.tracks || []).map(t => t.id));
  for (const id of requiredTracks) {
    if (!trackIds.has(id)) fail('required track missing: ' + id);
  }

  if ((q.items || []).length < 70) fail('expected seeded work ledger with at least 70 items');

  for (const t of q.tracks || []) {
    if (!t.id || !t.label || !Number.isFinite(t.total)) fail('invalid track ' + JSON.stringify(t));
  }

  for (const item of q.items || []) {
    if (!item.id || !item.track || !item.label || !item.status) fail('invalid item ' + JSON.stringify(item));
    if (!trackIds.has(item.track)) fail('unknown item track ' + item.track);
    if (!['queued', 'modeled', 'complete', 'superseded', 'rejected'].includes(item.status)) fail('bad status ' + item.status + ' for ' + item.id);
  }

  const requiredItems = [
    'cc-version-authority',
    'cc-asset-validation',
    'cc-report-version',
    'cc-link-contrast',
    'runtime-current-entry',
    'runtime-no-layer-rule',
    'ux-home-user-first',
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
  const itemIds = new Set((q.items || []).map(i => i.id));
  for (const id of requiredItems) {
    if (!itemIds.has(id)) fail('required queue item missing: ' + id);
  }

  const notes = q.notes && Array.isArray(q.notes.sources) ? q.notes.sources : [];
  const noteTotal = notes.reduce((n, s) => n + Number(s.notes || 0), 0);
  const resourceTotal = notes.reduce((n, s) => n + Number(s.resources || 0), 0);
  if (!q.notes || q.notes.privateRepo !== 'platocres/obol-source-notes') fail('private notes repo pointer missing');
  if (noteTotal !== 556) fail('expected 556 notes, got ' + noteTotal);
  if (resourceTotal !== 1326) fail('expected 1326 embedded resources, got ' + resourceTotal);

  const totals = q.totals();
  if (totals.notes !== 556) fail('totals lost note count');
  if (totals.resources !== 1326) fail('totals lost embedded resource count');
  if (!q.buildNext(5).some(i => i.id === 'cc-version-authority')) fail('version-authority item is no longer near top of Build Next');

  validateItemTestContracts();
}

const readme = read('README.md');
if (!readme.includes('Future agents should read this README')) fail('README future-agent handoff is missing');
if (!readme.includes('open the product-hardening dashboard')) fail('README does not direct agents to the product-hardening dashboard');
if (!readme.includes('pick the highest-priority Product Build Next item')) fail('README does not direct agents to the highest-priority Product Build Next item');
if (!readme.includes('data/product-hardening/product-hardening-queue.js')) fail('README does not name the product-hardening queue source of truth');
if (!readme.includes('platocres/obol-source-notes')) fail('README does not point to the private notes source repo');
if (!readme.includes('Public Obol must receive only normalized, derived guidance')) fail('README does not preserve the public/private notes boundary');
if (!readme.includes('<!-- OBOL-PRODUCT-BUILD-NEXT:START -->') || !readme.includes('<!-- OBOL-PRODUCT-BUILD-NEXT:END -->')) fail('README Product Build Next markers are missing');
if (!readme.includes('This block is generated from `data/product-hardening/product-hardening-queue.js`. Do not edit it manually.')) fail('README Product Build Next block is not marked generated');
if (!readme.includes('Current Obol release: **v9.1**')) fail('README must expose the current product-hardening release without calling v8.8 current');
if (!readme.includes('Completed Orange methodology/source baseline: **v8.8**')) fail('README must label v8.8 as the completed Orange baseline');

const dashboard = read('product-hardening.html');
for (const ref of [
  'data/product-hardening/product-hardening-queue.js',
  'assets/product-hardening-dashboard.js',
  'assets/product-hardening-dashboard.css'
]) {
  if (!dashboard.includes(ref)) fail('product-hardening.html is not wired to ' + ref);
}

const app = read('assets/app-v8.8.js');
for (const token of [
  'PRODUCT_RELEASE=\'v9.1\'',
  'ensureProductAssets88',
  'renderProductDashboard88',
  'data/product-hardening/product-hardening-queue.js',
  'assets/product-hardening-dashboard.js',
  'active product-hardening queue surface'
]) {
  if (!app.includes(token)) fail('app dashboard bridge missing token: ' + token);
}

const renderer = read('assets/product-hardening-dashboard.js');
for (const token of ['q.totals()', 'q.trackSummary()', 'q.buildNext(8)', 'q.notes.privateRepo']) {
  if (!renderer.includes(token)) fail('dashboard renderer no longer consumes ' + token);
}

for (const forbidden of [
  'data/project-model-v9.0.js',
  'assets/core-v9.0.js',
  'assets/app-v9.0.js',
  'assets/obol-v9.0.css',
  'data/project-model-v9.1.js',
  'assets/core-v9.1.js',
  'assets/app-v9.1.js',
  'assets/obol-v9.1.css'
]) {
  if (exists(forbidden)) fail('product-hardening release created forbidden fake runtime overlay: ' + forbidden);
}

const rawNoteFiles = walk(root).filter(f => /\.enex$/i.test(f));
if (rawNoteFiles.length) fail('raw ENEX files must not be committed to public Obol: ' + rawNoteFiles.join(', '));

if (failures.length) {
  console.error('product-hardening validation failed:');
  for (const message of failures) console.error('- ' + message);
  process.exit(1);
}

console.log('Product hardening guardrails valid:', q.items.length, 'items across', q.tracks.length, 'tracks;', q.totals().notes, 'notes and', q.totals().resources, 'resources accounted.');
