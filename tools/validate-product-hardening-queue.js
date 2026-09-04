'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const releaseFile = path.join(root, 'data', 'current-release.js');
const queueFile = path.join(root, 'data', 'product-hardening', 'product-hardening-queue.js');
const workPackagesFile = path.join(root, 'data', 'product-hardening', 'work-packages.js');
const contractsFile = path.join(root, 'data', 'product-hardening', 'item-test-contracts.js');
const tunnelContractsFile = path.join(root, 'data', 'product-hardening', 'item-test-contracts-tunnels.js');
const v929ContractsFile = path.join(root, 'data', 'product-hardening', 'item-test-contracts-v9.29.js');
const v930ContractsFile = path.join(root, 'data', 'product-hardening', 'item-test-contracts-v9.30.js');
const v931ContractsFile = path.join(root, 'data', 'product-hardening', 'item-test-contracts-v9.31.js');
const sandbox = { window: {}, globalThis: null };
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);
if (fs.existsSync(releaseFile)) vm.runInContext(fs.readFileSync(releaseFile, 'utf8'), sandbox, { filename: releaseFile });
vm.runInContext(fs.readFileSync(queueFile, 'utf8'), sandbox, { filename: queueFile });
if (fs.existsSync(workPackagesFile)) vm.runInContext(fs.readFileSync(workPackagesFile, 'utf8'), sandbox, { filename: workPackagesFile });
if (fs.existsSync(contractsFile)) vm.runInContext(fs.readFileSync(contractsFile, 'utf8'), sandbox, { filename: contractsFile });
if (fs.existsSync(tunnelContractsFile)) vm.runInContext(fs.readFileSync(tunnelContractsFile, 'utf8'), sandbox, { filename: tunnelContractsFile });
if (fs.existsSync(v929ContractsFile)) vm.runInContext(fs.readFileSync(v929ContractsFile, 'utf8'), sandbox, { filename: v929ContractsFile });
if (fs.existsSync(v930ContractsFile)) vm.runInContext(fs.readFileSync(v930ContractsFile, 'utf8'), sandbox, { filename: v930ContractsFile });
if (fs.existsSync(v931ContractsFile)) vm.runInContext(fs.readFileSync(v931ContractsFile, 'utf8'), sandbox, { filename: v931ContractsFile });

const q = sandbox.window.OBOL_PRODUCT_HARDENING;
const workPackages = sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
const testContracts = sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
const failures = [];

function fail(message) { failures.push(message); }
function read(relPath) { return fs.readFileSync(path.join(root, relPath), 'utf8'); }
function exists(relPath) { return fs.existsSync(path.join(root, relPath)); }
function walk(dir, out = []) { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { if (entry.name === '.git' || entry.name === 'node_modules') continue; const full = path.join(dir, entry.name); if (entry.isDirectory()) walk(full, out); else out.push(path.relative(root, full).replace(/\\/g, '/')); } return out; }

function validateItemTestContracts() {
  if (!testContracts) { fail('product-hardening item test contracts missing'); return; }
  if (!Array.isArray(testContracts.requiredForStatuses) || !testContracts.requiredForStatuses.includes('complete')) fail('item test contracts do not gate completed work');
  if (!testContracts.requiredForStatuses.includes('modeled')) fail('item test contracts do not gate modeled foundation items');
  const contracts = testContracts.contracts || {};
  const items = q.items || [];
  const itemIds = new Set(items.map(i => i.id));
  for (const id of Object.keys(contracts)) if (!itemIds.has(id)) fail('test contract references unknown queue item: ' + id);
  for (const item of items) {
    if (!testContracts.requiredForStatuses.includes(item.status)) continue;
    const contract = contracts[item.id];
    if (!contract) { fail('queue item has status ' + item.status + ' but no item-specific test contract: ' + item.id); continue; }
    if (!Array.isArray(contract.acceptance) || contract.acceptance.length === 0) fail('test contract lacks acceptance criteria: ' + item.id);
    if (!Array.isArray(contract.validationCommands) || contract.validationCommands.length === 0) fail('test contract lacks validation commands: ' + item.id);
    if (!Array.isArray(contract.proofFiles) || contract.proofFiles.length === 0) fail('test contract lacks proof files: ' + item.id);
    for (const rel of contract.proofFiles || []) if (!exists(rel)) fail('test contract proof file is missing for ' + item.id + ': ' + rel);
  }
}

function validateWorkPackages() {
  if (!workPackages) { fail('product-hardening work-package metadata missing'); return; }
  if (!['1.0.0','1.1.0'].includes(workPackages.schemaVersion)) fail('unexpected work-package schema version ' + workPackages.schemaVersion);
  if (!Array.isArray(workPackages.packages) || workPackages.packages.length < 8) fail('expected durable seeded work-package ledger');
  if (typeof workPackages.validate !== 'function' || typeof workPackages.recommend !== 'function') { fail('work-package helpers missing'); return; }
  for (const message of workPackages.validate(q)) fail(message);
  const top = q && typeof q.buildNext === 'function' ? q.buildNext(1)[0] : null;
  const rec = workPackages.recommend(q);
  if (top && (!rec || !rec.entryItem || rec.entryItem.id !== top.id)) fail('recommended work package must begin with the highest-priority queued item');
  if (rec && rec.recommendedBatch && (!Array.isArray(rec.liveItems) || rec.liveItems.length < 1)) fail('recommended batch has no live queue items');
}

if (!q) fail('queue object missing');

if (q) {
  if (q.version !== '9.0.0') fail('unexpected queue schema version ' + q.version);
  const requiredTracks = ['critical-correctness','architecture-runtime','ui-ux','tool-builders','credential-modes','manual-outcomes','notes-integration','offline-performance','testing-qa'];
  if (!Array.isArray(q.tracks)) fail('tracks array missing');
  if (!Array.isArray(q.items)) fail('items array missing');
  const trackIds = new Set((q.tracks || []).map(t => t.id));
  for (const id of requiredTracks) if (!trackIds.has(id)) fail('required track missing: ' + id);
  if ((q.items || []).length < 70) fail('expected seeded work ledger with at least 70 items');
  for (const t of q.tracks || []) {
    if (!t.id || !t.label || !Number.isFinite(t.total) || !Number.isFinite(t.complete)) fail('invalid track ' + JSON.stringify(t));
    const trackItems=(q.items||[]).filter(i=>i.track===t.id);
    const completedItems=trackItems.filter(i=>i.status==='complete').length;
    if (t.id!=='notes-integration' && t.complete!==completedItems) fail('track complete count does not match completed queue items for ' + t.id + ': ' + t.complete + ' vs ' + completedItems);
    if (t.id!=='notes-integration' && t.total!==trackItems.length) fail('track total does not match queue item count for ' + t.id + ': ' + t.total + ' vs ' + trackItems.length);
  }
  for (const item of q.items || []) {
    if (!item.id || !item.track || !item.label || !item.status) fail('invalid item ' + JSON.stringify(item));
    if (!trackIds.has(item.track)) fail('unknown item track ' + item.track);
    if (!['queued', 'modeled', 'complete', 'superseded', 'rejected'].includes(item.status)) fail('bad status ' + item.status + ' for ' + item.id);
  }
  const requiredItems = ['cc-version-authority','cc-asset-validation','cc-report-version','cc-link-contrast','runtime-current-entry','runtime-no-layer-rule','runtime-dashboard-no-flash','runtime-dashboard-layer-retirement','runtime-test-retirement-policy','runtime-operator-route-owner','ux-home-user-first','ux-next-step-tool-declutter','tb-schema','tb-nmap','tb-nxc','tb-hashcat','tb-secretsdump','tb-card-tool-presentation','cred-schema','cred-hash-routing','manual-schema','manual-success-unlocks','manual-proof-report','notes-impact-dashboard','notes-private-source-pointer','notes-source-inventory','notes-disposition-burn-down','notes-packet-web-upload-inclusion','notes-packet-xss-session','notes-packet-credentials-auth','notes-packet-windows-privesc','notes-packet-linux-privesc','notes-packet-ad-pivoting','qa-dashboard-sync','qa-asset-test','qa-release-contract-v9','qa-operator-route-ux-test'];
  const itemIds = new Set((q.items || []).map(i => i.id));
  for (const id of requiredItems) if (!itemIds.has(id)) fail('required queue item missing: ' + id);
  const notes = q.notes && Array.isArray(q.notes.sources) ? q.notes.sources : [];
  const noteTotal = notes.reduce((n, s) => n + Number(s.notes || 0), 0);
  const resourceTotal = notes.reduce((n, s) => n + Number(s.resources || 0), 0);
  if (!q.notes || q.notes.privateRepo !== 'platocres/obol-source-notes') fail('private notes repo pointer missing');
  if (noteTotal !== 556) fail('expected 556 notes, got ' + noteTotal);
  if (resourceTotal !== 1326) fail('expected 1326 embedded resources, got ' + resourceTotal);
  const totals = q.totals();
  if (totals.notes !== 556) fail('totals lost note count');
  if (totals.resources !== 1326) fail('totals lost embedded resource count');
  const queued=(q.items||[]).filter(i=>i.status==='queued').sort((a,b)=>a.priority-b.priority),live=q.buildNext(8);
  if (queued.length && (!live.length || live[0].id!==queued[0].id)) fail('Build Next does not begin with the highest-priority queued item');
  validateWorkPackages();
  validateItemTestContracts();
}

const readme = read('README.md');
const northStar = read('docs/NORTH-STAR.md');
const notesIntegration = read('docs/NOTES-INTEGRATION.md');
const hardeningDoc = read('docs/PRODUCT-HARDENING.md');
const buildingDoc = read('BUILDING.md');
const agentWorkflowDoc = read('docs/AGENT-WORKFLOW.md');
const rawNotesUrl = 'https://github.com/platocres/obol-source-notes/tree/main/sources/raw';
if (!readme.includes('## Continue developing (start here)')) fail('README single agent quickstart is missing');
if (!readme.includes('Open `#/dashboard` for the active Product Hardening Dashboard') && !readme.includes('Use `#/dashboard` for the active Product Hardening Dashboard')) fail('README does not direct agents to the product-hardening dashboard');
if (!/Start with the highest-priority Product Build Next item/i.test(readme)) fail('README does not preserve highest-priority Product Build Next as the entry point');
if (!/recommended coherent work package/i.test(readme)) fail('README does not encourage coherent multi-item work packages');
if (!/same ownership area/i.test(readme)) fail('README does not constrain batching to the same ownership area');
if (!/Every item advanced or closed still needs its own acceptance criteria/i.test(readme)) fail('README does not preserve atomic item-specific proof inside work packages');
if (!readme.includes('data/product-hardening/product-hardening-queue.js')) fail('README does not name the product-hardening queue source of truth');
if (!readme.includes('data/product-hardening/work-packages.js')) fail('README does not name the work-package source of truth');
if (!buildingDoc.includes('## Coherent work-package burn-down') || !buildingDoc.includes('one PR -> one coherent engineering area -> potentially many queue items')) fail('BUILDING.md does not define multi-item work-package burn-down');
if (!hardeningDoc.includes('## Coherent work packages') || !hardeningDoc.includes('Work-package batching does not weaken this contract')) fail('product-hardening doc does not preserve package efficiency plus atomic proof');
if (!readme.includes('platocres/obol-source-notes')) fail('README does not point to the private notes source repo');
if (!readme.includes(rawNotesUrl)) fail('README does not deep-link agents to the raw notes sources directory');
if (!readme.includes('[`' + rawNotesUrl + '`]')) fail('README does not label the raw notes source link with the exact URL');
if (!readme.includes('**Private notes source:** [`' + rawNotesUrl + '`]')) fail('generated Product Build Next block does not expose the exact raw notes source URL');
if (!agentWorkflowDoc.includes(rawNotesUrl)) fail('agent workflow does not deep-link agents to the raw notes sources directory');
if (!readme.includes('[`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md)')) fail('README does not point agents to the notes-integration boundary');
if (!/normalized|derived/i.test(notesIntegration)) fail('notes integration doc does not preserve the normalized public-output boundary');
if (!readme.includes('<!-- OBOL-PRODUCT-BUILD-NEXT:START -->') || !readme.includes('<!-- OBOL-PRODUCT-BUILD-NEXT:END -->')) fail('README Product Build Next markers are missing');
if (!readme.includes('This block is generated from `data/product-hardening/product-hardening-queue.js`. Do not edit it manually.')) fail('README Product Build Next block is not marked generated');
if (!readme.includes('Recommended work-package metadata comes from `data/product-hardening/work-packages.js`.')) fail('README generated block omits work-package source');
if (!readme.includes('**Recommended work package:**')) fail('README generated block omits recommended work package');
const currentRelease = readme.match(/Current release:\s*\*\*v(\d+\.\d+(?:\.\d+)?)\*\*/);
if (!currentRelease || !/^9\./.test(currentRelease[1])) fail('README must expose the current v9 product-hardening release without calling v8.8 current');
if (readme.includes('Current release: **v8.8**')) fail('README must not call v8.8 the current release');
if (!readme.includes('[`docs/NORTH-STAR.md`](docs/NORTH-STAR.md)')) fail('README does not point completed Orange accounting to the North Star doc');
if (!northStar.includes('## Current v8.8 baseline') || !northStar.includes('canonical: 127 / 127 implemented')) fail('North Star doc must preserve v8.8 as the completed Orange baseline');
if (readme.includes('<!-- OBOL-BUILD-NEXT:START -->')) fail('README must not restore the retired Orange Build Next block');

const dashboard = read('product-hardening.html');
const dashboardRouteOwner = read('assets/dashboard-route-current.js');
if (!dashboard.includes('assets/dashboard-route-current.js')) fail('product-hardening.html does not delegate to the stable current Dashboard route owner');
if (!dashboard.includes('OBOL_CURRENT_DASHBOARD_ROUTE') || !dashboard.includes('refreshAssets()')) fail('product-hardening.html does not initialize Dashboard data through the current-owner freshness API');
for (const ref of ['data/current-release.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','assets/product-hardening-dashboard.js','assets/product-hardening-dashboard.css']) if (!dashboardRouteOwner.includes(ref)) fail('current Dashboard route owner is not wired to ' + ref);

const app = read('assets/app-v8.8.js');
for (const token of ["RELEASE_SOURCE='data/current-release.js'",'window.OBOL_CURRENT_RELEASE','ensureProductAssets88','renderProductDashboard88','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES','assets/product-hardening-dashboard.js','active product-hardening queue surface']) if (!app.includes(token)) fail('app dashboard bridge missing token: ' + token);
if (/const PRODUCT_RELEASE=/.test(app)) fail('app dashboard bridge retains competing hard-coded current release');

const renderer = read('assets/product-hardening-dashboard.js');
for (const token of ['window.OBOL_CURRENT_RELEASE','window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES','wp.recommend(q)','q.totals()', 'q.trackSummary()', 'q.buildNext(8)', 'q.notes.privateRepo','Recommended work package']) if (!renderer.includes(token)) fail('dashboard renderer no longer consumes ' + token);

for (const forbidden of ['data/project-model-v9.0.js','assets/core-v9.0.js','assets/app-v9.0.js','assets/obol-v9.0.css','data/project-model-v9.1.js','assets/core-v9.1.js','assets/app-v9.1.js','assets/obol-v9.1.css','data/project-model-v9.2.js','assets/core-v9.2.js','assets/app-v9.2.js','assets/obol-v9.2.css']) if (exists(forbidden)) fail('product-hardening release created forbidden fake runtime overlay: ' + forbidden);
const rawNoteFiles = walk(root).filter(f => /\.enex$/i.test(f));
if (rawNoteFiles.length) fail('raw ENEX files must not be committed to public Obol: ' + rawNoteFiles.join(', '));
if (failures.length) { console.error('product-hardening validation failed:'); for (const message of failures) console.error('- ' + message); process.exit(1); }
const rec = workPackages && workPackages.recommend(q);
console.log('Product hardening guardrails valid:', q.items.length, 'items across', q.tracks.length, 'tracks;', q.totals().notes, 'notes and', q.totals().resources, 'resources accounted; recommended package:', rec ? rec.title : 'none');
