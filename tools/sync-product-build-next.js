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
const noteImpactFile = path.join(root, 'data', 'product-hardening', 'notes-impact-current.js');
const runtimeManifestFile = path.join(root, 'data', 'runtime-manifest.js');
const runtimeConsolidationFile = path.join(root, 'data', 'runtime-consolidation-current.js');
const readmeFile = path.join(root, 'README.md');
const sandbox = { window: {}, globalThis: null };
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(releaseFile, 'utf8'), sandbox, { filename: releaseFile });
vm.runInContext(fs.readFileSync(queueFile, 'utf8'), sandbox, { filename: queueFile });
vm.runInContext(fs.readFileSync(workPackagesFile, 'utf8'), sandbox, { filename: workPackagesFile });
vm.runInContext(fs.readFileSync(noteIntegrationFile, 'utf8'), sandbox, { filename: noteIntegrationFile });
if (fs.existsSync(noteReviewsFile)) vm.runInContext(fs.readFileSync(noteReviewsFile, 'utf8'), sandbox, { filename: noteReviewsFile });
if (fs.existsSync(notePacketsFile)) vm.runInContext(fs.readFileSync(notePacketsFile, 'utf8'), sandbox, { filename: notePacketsFile });
if (fs.existsSync(noteBackfillFile)) vm.runInContext(fs.readFileSync(noteBackfillFile, 'utf8'), sandbox, { filename: noteBackfillFile });
if (fs.existsSync(noteProgressFile)) vm.runInContext(fs.readFileSync(noteProgressFile, 'utf8'), sandbox, { filename: noteProgressFile });
if (fs.existsSync(noteImpactFile)) vm.runInContext(fs.readFileSync(noteImpactFile, 'utf8'), sandbox, { filename: noteImpactFile });
vm.runInContext(fs.readFileSync(runtimeManifestFile, 'utf8'), sandbox, { filename: runtimeManifestFile });
vm.runInContext(fs.readFileSync(runtimeConsolidationFile, 'utf8'), sandbox, { filename: runtimeConsolidationFile });

const q = sandbox.window.OBOL_PRODUCT_HARDENING;
const workPackages = sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
const noteImpact = sandbox.window.OBOL_PRODUCT_HARDENING_NOTES_IMPACT;
const runtimeConsolidation = sandbox.window.OBOL_RUNTIME_CONSOLIDATION;
if (!runtimeConsolidation) throw new Error('Runtime consolidation projection not exposed');
if (!q) throw new Error('Product-hardening queue not exposed');
if (!workPackages) throw new Error('Product-hardening work-package metadata not exposed');
const packageFailures = workPackages.validate(q);
if (packageFailures.length) throw new Error('Invalid product-hardening work packages:\n- ' + packageFailures.join('\n- '));
if (noteImpact) {
  const failures = noteImpact.validate();
  if (failures.length) throw new Error('Invalid notes-impact projection:\n- ' + failures.join('\n- '));
}
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
    '**Recommended work package:** **' + rec.title + '** — ' + live.length + ' live item' + (live.length === 1 ? '' : 's') + ' / ' + tracked.length + ' tracked.',
    '**Work-package entry:** **' + rec.entryItem.label + '**',
    '**Ownership area:** `' + rec.ownershipArea + '`',
    '**Package guidance:** ' + rec.guidance,
    dependencies.length ? '**Package dependencies:** ' + dependencies.join(', ') : '**Package dependencies:** none.',
    '',
    '**Live items in this package:**',
    ...(live.length ? live.map(item => '- **' + item.label + '** — ' + item.detail) : ['- No queued items remain in this package.']),
    ...(related.length ? ['', '**Related items to consider, not automatically in scope:** ' + related.map(item => item.label).join('; ') + '.'] : [])
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

function runtimeConsolidationLines() {
  const p = runtimeConsolidation.projection();
  if (!p) return [];
  const startup = p.areas.filter(area => area.scope === 'startup');
  const lazy = p.areas.filter(area => area.scope === 'lazy');
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
  const next = q.buildNext(8);
  return [
    '<!-- OBOL-PRODUCT-BUILD-NEXT:START -->',
    'This block is generated from `data/product-hardening/product-hardening-queue.js`. Do not edit it manually.',
    'Recommended work-package metadata comes from `data/product-hardening/work-packages.js`.',
    'Runtime consolidation figures come from `data/runtime-consolidation-current.js`, the same projection the Product Hardening Dashboard renders.',
    '',
    '**Current product-hardening queue:** ' + totals.complete + '/' + totals.total + ' complete (' + totals.pct + '%), ' + totals.queued + ' queued, ' + totals.modeled + ' foundation items modeled.',
    '**Private notes source:** ' + sourceLink(q.notes.privateRepo) + ' — ' + totals.notes + ' notes and ' + totals.resources + ' embedded resources accounted.',
    ...noteImpactLines(),
    ...runtimeConsolidationLines(),
    '',
    ...packageLines(),
    '',
    '**Highest-priority live items:**',
    ...next.map((i, idx) => (idx + 1) + '. **' + i.label + '** — ' + i.detail),
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
