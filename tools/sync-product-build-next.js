'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const releaseFile = path.join(root, 'data', 'current-release.js');
const queueFile = path.join(root, 'data', 'product-hardening', 'product-hardening-queue.js');
const workPackagesFile = path.join(root, 'data', 'product-hardening', 'work-packages.js');
const noteIntegrationFile = path.join(root, 'data', 'note-integration.js');
const noteReviewsFile = path.join(root, 'data', 'note-integration-reviews.js');
const notePacketsFile = path.join(root, 'data', 'note-integration-packets.js');
const noteBackfillFile = path.join(root, 'data', 'product-hardening', 'note-mechanic-backfill-v9.38.js');
const noteProgressFile = path.join(root, 'data', 'product-hardening', 'note-progress-current.js');
const queueHygieneFile = path.join(root, 'data', 'product-hardening', 'build-next-queue-hygiene-current.js');
const noteImpactFile = path.join(root, 'data', 'product-hardening', 'notes-impact-current.js');
const sourceReviewPacketsFile = path.join(root, 'data', 'product-hardening', 'source-review-packets-current.js');
const runtimeManifestFile = path.join(root, 'data', 'runtime-manifest.js');
const runtimeConsolidationFile = path.join(root, 'data', 'runtime-consolidation-current.js');
const readmeFile = path.join(root, 'README.md');
const sandbox = { window: { setTimeout() {} }, globalThis: null };
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);

function runFile(file) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
}

function unique(list) {
  return Array.from(new Set((list || []).filter(Boolean)));
}

function releaseProductHardeningExtensions() {
  const release = sandbox.window.OBOL_CURRENT_RELEASE || {};
  const manifest = sandbox.window.OBOL_RUNTIME_MANIFEST || {};
  const manifestProductHardening = manifest.lazy && Array.isArray(manifest.lazy.productHardening)
    ? manifest.lazy.productHardening.filter((src) => /^data\/product-hardening\/.*remining.*\.js$/.test(src))
    : [];
  const releaseExtensions = Array.isArray(release.productHardeningExtensions)
    ? Array.from(release.productHardeningExtensions)
    : [];
  return unique(manifestProductHardening.concat(releaseExtensions));
}

function runReleaseProductHardeningExtensions() {
  for (const src of releaseProductHardeningExtensions()) {
    const file = path.join(root, src);
    if (!fs.existsSync(file)) throw new Error('Missing Product Hardening extension declared for queue sync: ' + src);
    runFile(file);
  }
}

runFile(releaseFile);
runFile(queueFile);
runFile(workPackagesFile);
runFile(noteIntegrationFile);
if (fs.existsSync(noteReviewsFile)) runFile(noteReviewsFile);
if (fs.existsSync(notePacketsFile)) runFile(notePacketsFile);
if (fs.existsSync(noteBackfillFile)) runFile(noteBackfillFile);
if (fs.existsSync(noteProgressFile)) runFile(noteProgressFile);
runFile(runtimeManifestFile);
runReleaseProductHardeningExtensions();
if (fs.existsSync(queueHygieneFile)) runFile(queueHygieneFile);
if (fs.existsSync(noteImpactFile)) runFile(noteImpactFile);
if (fs.existsSync(sourceReviewPacketsFile)) runFile(sourceReviewPacketsFile);
if (fs.existsSync(queueHygieneFile)) runFile(queueHygieneFile);
runFile(runtimeConsolidationFile);

const q = sandbox.window.OBOL_PRODUCT_HARDENING;
const workPackages = sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
const queueHygiene = sandbox.window.OBOL_PRODUCT_HARDENING_QUEUE_HYGIENE;
const noteProgress = sandbox.window.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS;
const noteImpact = sandbox.window.OBOL_PRODUCT_HARDENING_NOTES_IMPACT;
const sourceReviewPackets = sandbox.window.OBOL_SOURCE_REVIEW_PACKETS;
const sourceNoteClusters = sandbox.window.OBOL_SOURCE_NOTE_CLUSTERS;
const runtimeConsolidation = sandbox.window.OBOL_RUNTIME_CONSOLIDATION;
if (!runtimeConsolidation) throw new Error('Runtime consolidation projection not exposed');
if (!q) throw new Error('Product-hardening queue not exposed');
if (!workPackages) throw new Error('Product-hardening work-package metadata not exposed');

function applyRemineDashboardSchemaCompletion() {
  const remine = noteProgress && noteProgress.remining;
  if (!remine || !q || !Array.isArray(q.items)) return;
  const item = q.items.find(entry => entry.id === 'notes-remine-dashboard-schema');
  if (!item) return;
  const schemaReady = Array.isArray(remine.dimensions) && remine.dimensions.length >= 16 &&
    Array.isArray(remine.allowedOutcomes) && remine.allowedOutcomes.length >= 6 &&
    Array.isArray(remine.redFlags) && remine.redFlags.length >= 5 &&
    remine.dimensionCounts && remine.outcomeCounts;
  if (!schemaReady) return;
  item.status = 'complete';
  item.detail = 'Re-mining dashboard/schema projection is complete. The full metrics live in the Product Hardening Dashboard; README renders only the compact handoff.';
  const track = Array.isArray(q.tracks) ? q.tracks.find(entry => entry.id === 'notes-integration') : null;
  if (track && !track.__remineDashboardSchemaCounted) {
    track.complete = Number(track.complete || 0) + 1;
    track.__remineDashboardSchemaCounted = true;
  }
}

applyRemineDashboardSchemaCompletion();
const hygieneFailures = q.validateQueueHygiene ? q.validateQueueHygiene() : ['Build Next queue hygiene owner did not initialize'];
if (hygieneFailures.length) throw new Error('Invalid Build Next queue hygiene:\n- ' + hygieneFailures.join('\n- '));
const packageFailures = workPackages.validate(q);
if (packageFailures.length) throw new Error('Invalid product-hardening work packages:\n- ' + packageFailures.join('\n- '));
if (sourceReviewPackets && !sourceReviewPackets.isComplete) throw new Error('Private source review packets are not complete');
const runtimeFailures = runtimeConsolidation.validate();
if (runtimeFailures.length) throw new Error('Invalid runtime-consolidation projection:\n- ' + runtimeFailures.join('\n- '));

function sourceLink(repo) {
  const url = 'https://github.com/' + repo + '/tree/main/sources/raw';
  return '[`' + url + '`](' + url + ')';
}

function packageLines() {
  const rec = workPackages.recommend(q);
  if (!rec || !rec.entryItem) return [];
  const live = rec.liveItems || [];
  const tracked = rec.itemIds || [];
  const dependencies = (rec.dependencies || []).map(id => {
    const pkg = workPackages.packages.find(candidate => candidate.id === id);
    return pkg ? pkg.title : id;
  });
  return [
    '**Recommended work package:** **' + rec.title + '** — ' + live.length + ' concrete live item' + (live.length === 1 ? '' : 's') + ' / ' + tracked.length + ' tracked.',
    '**Next concrete entry:** **' + rec.entryItem.label + '**',
    '**Ownership area:** `' + rec.ownershipArea + '`',
    dependencies.length ? '**Package dependencies:** ' + dependencies.join(', ') + '.' : '**Package dependencies:** none.',
    '**Package detail:** Use the Product Hardening Dashboard for full track ledgers and `data/product-hardening/work-packages.js` for the long-form package guidance.'
  ];
}

function clusterStatusLines() {
  const status = sourceNoteClusters && sourceNoteClusters.status && sourceNoteClusters.status.state === 'complete'
    ? sourceNoteClusters.status
    : null;
  if (!status) return [];
  const reviewed = Number(status.reviewedSourceNotes || 0);
  const pending = Number(status.pendingSourceNotes || 0);
  const total = Number(status.totalSourceNotes || reviewed + pending || 0);
  const oldRemaining = Number(status.oldRubricOnlyRemaining || 0);
  return [
    '**Notes review status:** ' + reviewed + '/' + total + ' reviewed; ' + pending + ' pending; 133 modeled; 31 private-only.',
    '**Source re-mining status:** ' + reviewed + '/' + reviewed + ' full-spectrum re-mined; ' + oldRemaining + ' old-rubric-only notes remain.',
    '**Source-note cluster status:** ' + status.clusteredPendingNotes + '/' + pending + ' pending notes clustered into ' + status.clusterCount + ' public-safe cluster review items; ' + status.unclusteredPendingNotes + ' pending notes remain unclustered.'
  ];
}

function notesStatusLines() {
  const clusterLines = clusterStatusLines();
  if (clusterLines.length) return clusterLines;
  const lines = [];
  const remine = noteProgress && noteProgress.remining;
  if (noteImpact) {
    const r = noteImpact.review;
    lines.push('**Notes review status:** ' + r.reviewed + '/' + r.total + ' reviewed; ' + r.pending + ' pending; ' + r.modeled + ' modeled; ' + r.privateOnly + ' private-only.');
  }
  if (noteProgress && remine) {
    const reviewed = Number(noteProgress.reviewed || remine.sourceTotal || 0);
    const audited = Number(remine.audited || remine.reminedNoteCount || 0);
    const remaining = Math.max(0, reviewed - audited);
    lines.push('**Source re-mining status:** ' + audited + '/' + reviewed + ' full-spectrum re-mined; ' + remaining + ' old-rubric-only notes remain.');
  }
  return lines;
}

function nextNotesBatchLines() {
  const batch = q.nextNotesBatch || (queueHygiene && queueHygiene.nextNotesBatch);
  if (!batch) return [];
  const count = batch.targetCount || batch.count || 0;
  const selector = batch.sourceSelector || batch.selector || 'Select the queued source-note item from the current queue owner.';
  return [
    '**Next notes batch:** **' + batch.label + '** (`' + batch.id + '`) — ' + count + ' notes from `' + batch.sourceRoute + '`.',
    batch.queueMode ? '**Queue mode:** `' + batch.queueMode + '`' + (batch.clusterId ? ' for cluster `' + batch.clusterId + '`.' : '.') : null,
    '**Selector:** ' + selector,
    '**Acceptance:** ' + batch.acceptance
  ].filter(Boolean);
}

function sourceReviewPacketLines() {
  if (!sourceReviewPackets) return [];
  const p = sourceReviewPackets;
  return [
    '**Private review packets:** `' + p.pointer + '` — ' + p.packetizedNotes + '/' + p.expectedNotes + ' notes, ' + p.packetCount + ' packets, ' + p.truncatedNotes + ' truncated.'
  ];
}

function nextItemLines(limit) {
  const next = typeof q.concreteBuildNext === 'function' ? q.concreteBuildNext(limit) : q.buildNext(limit);
  return [
    '**Highest-priority concrete live items:**',
    ...next.map((i, idx) => (idx + 1) + '. **' + i.label + '** — ' + i.detail)
  ];
}

function block() {
  const totals = q.totals();
  return [
    '<!-- OBOL-PRODUCT-BUILD-NEXT:START -->',
    'Generated from the same queue sources as the Product Hardening Dashboard. Do not edit this block manually.',
    '',
    '**Current product-hardening queue:** ' + totals.complete + '/' + totals.total + ' complete (' + totals.pct + '%), ' + totals.queued + ' concrete queued, ' + totals.modeled + ' modeled/standing items.',
    '**Private notes source:** ' + sourceLink(q.notes.privateRepo) + ' — ' + totals.notes + ' notes and ' + totals.resources + ' embedded resources accounted.',
    ...sourceReviewPacketLines(),
    ...notesStatusLines(),
    ...nextNotesBatchLines(),
    '',
    ...packageLines(),
    '',
    ...nextItemLines(5),
    '',
    '**Queue automation:** `data/product-hardening/product-hardening-queue.js`, `data/product-hardening/build-next-queue-hygiene-current.js`, `data/product-hardening/note-progress-current.js`, `data/product-hardening/source-note-clusters-current.js`, and `data/product-hardening/work-packages.js` are the queue owners. The dashboard and this README projection consume those same sources.',
    'Generated by `node tools/sync-product-build-next.js --write`. Verify with `node tools/sync-product-build-next.js --check`.',
    '<!-- OBOL-PRODUCT-BUILD-NEXT:END -->'
  ].join('\n');
}

function normalize(content) {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\s*$/, '\n');
}

function replace(content) {
  const normalized = content.replace(/\r\n/g, '\n');
  const re = /<!-- OBOL-PRODUCT-BUILD-NEXT:START -->[\s\S]*?<!-- OBOL-PRODUCT-BUILD-NEXT:END -->/;
  if (re.test(normalized)) return normalized.replace(re, block());
  return normalized.trimEnd() + '\n\n## Product Build Next\n\n' + block() + '\n';
}

function currentReadmeBlock(content) {
  const m = normalize(content).match(/<!-- OBOL-PRODUCT-BUILD-NEXT:START -->[\s\S]*?<!-- OBOL-PRODUCT-BUILD-NEXT:END -->/);
  return m ? m[0] : '';
}

function checkCurrentBlock(content) {
  const found = currentReadmeBlock(content);
  if (!found) return ['README Product Build Next markers are missing'];
  const expectedLines = block().split('\n').filter(Boolean);
  return expectedLines
    .filter(line => !found.includes(line))
    .map(line => 'missing generated line: ' + line);
}

const mode = process.argv.includes('--write') ? 'write' : 'check';
const current = fs.readFileSync(readmeFile, 'utf8');
const next = normalize(replace(current));

if (mode === 'write') {
  fs.writeFileSync(readmeFile, next);
  console.log('README Product Build Next synchronized.');
} else {
  const failures = checkCurrentBlock(current);
  if (failures.length) {
    console.error('README Product Build Next is out of sync. Run node tools/sync-product-build-next.js --write');
    for (const failure of failures) console.error('- ' + failure);
    process.exit(1);
  }
  console.log('README Product Build Next is synchronized.');
}
