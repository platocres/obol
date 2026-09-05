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
const sandbox = { window: {}, globalThis: null };
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
runFile(runtimeConsolidationFile);

const q = sandbox.window.OBOL_PRODUCT_HARDENING;
const workPackages = sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
const queueHygiene = sandbox.window.OBOL_PRODUCT_HARDENING_QUEUE_HYGIENE;
const noteProgress = sandbox.window.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS;
const noteImpact = sandbox.window.OBOL_PRODUCT_HARDENING_NOTES_IMPACT;
const sourceReviewPackets = sandbox.window.OBOL_SOURCE_REVIEW_PACKETS;
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
  item.detail = 'Re-mining is tracked separately from first-pass review in the dashboard and generated README: old-rubric reviewed count, full-spectrum re-mined count, old-rubric-only remaining count, negative-proof outcomes, red flags, and extraction dimensions are visible at a glance with drill-down details.';
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

function packageLines() {
  const rec = workPackages.recommend(q);
  if (!rec || !rec.entryItem) return [];
  const itemMap = new Map(q.items.map(item => [item.id, item]));
  const live = rec.liveItems || [];
  const tracked = rec.itemIds || [];
  const dependencies = (rec.dependencies || []).map(id => {
    const pkg = workPackages.packages.find(candidate => candidate.id === id);
    return pkg ? pkg.title : id;
  });
  const related = (rec.relatedItems || []).map(id => itemMap.get(id)).filter(Boolean);
  return [
    '**Recommended work package:** **' + rec.title + '** — ' + live.length + ' concrete live item' + (live.length === 1 ? '' : 's') + ' / ' + tracked.length + ' tracked.',
    '**Next concrete entry:** **' + rec.entryItem.label + '**',
    '**Ownership area:** `' + rec.ownershipArea + '`',
    '**Package guidance:** ' + rec.guidance,
    dependencies.length ? '**Package dependencies:** ' + dependencies.join(', ') : '**Package dependencies:** none.',
    '',
    '**Concrete live items in this package:**',
    ...(live.length ? live.map(item => '- **' + item.label + '** — ' + item.detail) : ['- No concrete queued items remain in this package.']),
    ...(related.length ? ['', '**Related items to consider, not automatically in scope:** ' + related.map(item => item.label).join('; ') + '.'] : [])
  ];
}

function standingGateLines() {
  const gates = typeof q.standingBuildGates === 'function' ? q.standingBuildGates() : [];
  if (!gates.length) return [];
  return [
    '**Standing source re-mining gates:**',
    ...gates.map(item => '- **' + item.label + '** — standing gate, not the next concrete batch. ' + item.detail)
  ];
}

function noteImpactLines() {
  if (!noteImpact) return [];
  const r = noteImpact.review, o = noteImpact.outputCounts;
  return [
    '**Notes Integration:** ' + r.reviewed + '/' + r.total + ' reviewed — ' + r.modeled + ' modeled, ' + r.privateOnly + ' private-only, ' + r.pending + ' pending.',
    '**Derived note guidance:** ' + o.fieldNotes + ' Field Notes · ' + o.toolContextBound + ' tool-bound · ' + o.pathGuidanceBound + ' Path-bound · ' + o.evidenceGuidance + ' Evidence · ' + o.reportGuidance + ' Report.',
    '**Declared note-driven product mechanics:** ' + o.declaredProductChanges + ' total · ' + o.toolBuilderChanges + ' builder · ' + o.pathLogicChanges + ' Path logic · ' + o.evidenceParserChanges + ' Evidence parser · ' + o.reportGeneratorChanges + ' report generator · ' + o.workflowChanges + ' workflow.',
    '**Latest mined themes:** ' + noteImpact.latestWave.themes.join(', ') + '.',
    '**Notes impact contract:** `docs/NOTES-IMPACT.md`.'
  ];
}

function noteReminingLines() {
  const remine = noteProgress && noteProgress.remining;
  if (!noteProgress || !remine) return [];
  const reviewed = Number(noteProgress.reviewed || remine.sourceTotal || 0);
  const audited = Number(remine.audited || remine.reminedNoteCount || 0);
  const remaining = Math.max(0, reviewed - audited);
  const oc = remine.outcomeCounts || {};
  const redFlagTotal = (remine.redFlags || []).reduce((n, flag) => n + Number(flag.count || 0), 0);
  const dimensionCount = Array.isArray(remine.dimensions) ? remine.dimensions.length : 0;
  const dashboardItem = (q.items || []).find(item => item.id === 'notes-remine-dashboard-schema');
  return [
    '**Source re-mining:** old-rubric reviewed ' + reviewed + '/' + Number(noteProgress.total || 0) + ' · full-spectrum re-mined ' + audited + '/' + reviewed + ' · old-rubric-only remaining ' + remaining + '.',
    '**Negative finding outcomes:** added ' + Number(oc.added || 0) + ' · covered ' + Number(oc.covered || 0) + ' · queued ' + Number(oc.queued || 0) + ' · private-only ' + Number(oc['private-only'] || 0) + ' · not-applicable ' + Number(oc['not-applicable'] || 0) + ' · blocked ' + Number(oc.blocked || 0) + '.',
    '**Re-mining red flags:** ' + redFlagTotal + ' currently flagged across ' + ((remine.redFlags || []).length || 0) + ' invalid/missing-proof guardrails.',
    '**Extraction dimensions:** ' + dimensionCount + ' tracked — Path bindings, tool cards, GUI controls, scripts/one-liners, command templates, terminal analyzers, Evidence expectations, path movement, lessons/examples, troubleshooting, cleanup, report guidance, product mechanics, product gaps, and additive Orange baseline.',
    '**Re-mining dashboard/schema:** ' + (dashboardItem ? dashboardItem.status : 'unknown') + ' — overview-first dashboard with drill-down detail sections for the same generated state.'
  ];
}

function sourceReviewPacketLines() {
  if (!sourceReviewPackets) return [];
  const p = sourceReviewPackets;
  const htb = (p.sources || []).find(src => src.sourceId === 'htb-penetration-tester');
  return [
    '**Private review packets:** `' + p.pointer + '` — ' + p.packetizedNotes + '/' + p.expectedNotes + ' notes in ' + p.packetCount + ' complete-text packets, ' + p.truncatedNotes + ' truncated, ' + Number(p.reviewTextChars).toLocaleString('en-US') + ' cleaned text chars.',
    '**Raw source proof:** workflow run ' + p.proofRunId + ' verified ' + (htb ? 'HTB ENEX ' + Number(htb.bytes).toLocaleString('en-US') + ' bytes sha256 `' + htb.sha256.slice(0, 16) + '…`' : 'raw ENEX identity') + ' before packet generation.'
  ];
}

function runtimeConsolidationLines() {
  const p = runtimeConsolidation.projection();
  if (!p) return [];
  return [
    '**Runtime consolidation:** ' + p.startupRequests.after + ' operator startup requests, down from ' + p.startupRequests.before + ' (' + p.startupRequests.reductionPct + '% fewer).',
    '**Current runtime ownership areas:** ' + p.areas.length + ' owners account for ' + p.consolidatedFragments + ' historical fragments — ' + p.flattenedHistoricalFragments + ' semantically flattened, ' + p.liveHistoricalFragments + ' still exact-owned; ' + p.retiredFragments + ' fragments stay retired in the frozen ledger.',
    '**Runtime area owners:** ' + p.areas.map(area => area.label + ' (' + area.fragments + ', ' + area.strategy + ')').join(' · ') + '.',
    '**Measured in Chromium (' + p.measured.release + '):** ' + p.measured.routes.map(route => route.label + ' ' + route.before + '→' + route.after).join(' · ') + ' JavaScript/CSS requests.',
    '**Runtime compaction contract:** `docs/RUNTIME-COMPACTION.md`.'
  ];
}

function sourceLink(repo) {
  const url = 'https://github.com/' + repo + '/tree/main/sources/raw';
  return '[`' + url + '`](' + url + ')';
}

function block() {
  const totals = q.totals();
  const tracks = q.trackSummary();
  const next = typeof q.concreteBuildNext === 'function' ? q.concreteBuildNext(8) : q.buildNext(8);
  return [
    '<!-- OBOL-PRODUCT-BUILD-NEXT:START -->',
    'This block is generated from `data/product-hardening/product-hardening-queue.js` plus `data/product-hardening/build-next-queue-hygiene-current.js`. Do not edit it manually.',
    'Recommended work-package metadata comes from `data/product-hardening/work-packages.js`.',
    'Runtime consolidation figures come from `data/runtime-consolidation-current.js`, the same projection the Product Hardening Dashboard renders.',
    '',
    '**Current product-hardening queue:** ' + totals.complete + '/' + totals.total + ' complete (' + totals.pct + '%), ' + totals.queued + ' concrete queued, ' + totals.modeled + ' modeled/standing items.',
    '**Private notes source:** ' + sourceLink(q.notes.privateRepo) + ' — ' + totals.notes + ' notes and ' + totals.resources + ' embedded resources accounted.',
    ...sourceReviewPacketLines(),
    ...noteImpactLines(),
    ...noteReminingLines(),
    ...runtimeConsolidationLines(),
    '',
    ...packageLines(),
    '',
    ...standingGateLines(),
    '',
    '**Highest-priority concrete live items:**',
    ...next.map((i, idx) => (idx + 1) + '. **' + i.label + '** — ' + i.detail),
    '',
    '**Queue hygiene guardrail:** Completed packet work and standing umbrella gates must not appear as the next concrete build. `data/product-hardening/build-next-queue-hygiene-current.js` enforces this before README/dashboard rendering and CI validates it.',
    '',
    '**Track status:**',
    ...tracks.map(t => '- **' + t.label + ':** ' + t.complete + '/' + t.total + ' complete (' + t.pct + '%), ' + t.modeled + ' modeled.'),
    '',
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
