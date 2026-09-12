'use strict';

const assert = require('assert');
const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

function runInBrowserish(files) {
  const sandbox = { window: {}, globalThis: null, module: { exports: {} }, console };
  sandbox.globalThis = sandbox.window;
  vm.createContext(sandbox);
  for (const rel of files) vm.runInContext(read(rel), sandbox, { filename: rel });
  return sandbox.window;
}

const releaseRoot = runInBrowserish(['data/current-release.js']);
const currentAuthority = releaseRoot.OBOL_CURRENT_RELEASE;
assert(currentAuthority && /^\d+\.\d+\.\d+$/.test(currentAuthority.version), 'current release must retain a semver payload');
assert(currentAuthority && /^v\d+\.\d+(?:\.\d+)?$/.test(currentAuthority.label), 'current release must retain a version label');
const authorityParts = currentAuthority.version.split('.').map(Number);
assert(authorityParts[0] > 10 || (authorityParts[0] === 10 && (authorityParts[1] > 0 || (authorityParts[1] === 0 && authorityParts[2] >= 2))), 'current release must not regress behind the v10.02 visual-density milestone');
const currentRelease = read('data/current-release.js');
assert(!currentRelease.includes('visual-density-regression-v10.02.js\''), 'v10.02 proof must not be added as a browser-loaded product-hardening extension');

const releaseDoc = read('docs/v10.02.md');
assert(releaseDoc.includes('# Obol v10.02'), 'v10.02 release doc missing heading');
assert(releaseDoc.includes('## What changed'), 'v10.02 release doc needs What changed bullets for changelog sync');
assert(releaseDoc.includes('Post-mining visual density regression pass'), 'v10.02 release doc must describe the closed queue item');
assert(releaseDoc.includes('modeled tool builder implementation backlog'), 'v10.02 release doc must hand off to the modeled-tool backlog');

const visualProof = read('data/product-hardening/visual-density-regression-v10.02.js');
for (const token of [
  'OBOL_VISUAL_DENSITY_REGRESSION_V1002_PROOF',
  "version:'v10.02'",
  "item:'post-notes-visual-density-regression-pass'",
  "status:'complete'",
  "browserProof:'tests/playwright-visual-density.js'",
  "nextItem:'post-notes-tool-builder-implementation-backlog'",
  'visual-density-path-desktop.png',
  'visual-density-path-narrow.png',
  'visual-density-card-web-authz-desktop.png',
  'visual-density-tools-ffuf-desktop.png',
  'visual-density-tools-hashcat-desktop.png',
  'visual-density-tools-ligolo-desktop.png'
]) assert(visualProof.includes(token), 'visual density proof ledger missing ' + token);

const visualSmoke = read('tests/playwright-visual-density.js');
for (const token of [
  '#/path',
  '#/card/web-authz-boundaries',
  '#/card/metasploit-resource-pivot-workflow',
  '#/tools',
  '#/tools/ffuf',
  '#/tools/hashcat',
  '#/tools/ligolo-ng',
  '.operator-primary-move31',
  'details.operator-support31',
  '[data-card-primary-action]',
  '[data-card-primary-command]',
  '[data-card-evidence-loop]',
  '[data-card-details]',
  '[data-tool-accessories]',
  '[data-tool-related-cards]',
  '#tool-body .card[data-cardroot]',
  'horizontalOverflow',
  'INTERNAL_SLOP',
  'Visual density browser proof passed'
]) assert(visualSmoke.includes(token), 'visual density browser smoke missing ' + token);
assert(/wrapperPanels\s*!==\s*0/.test(visualSmoke), 'visual smoke must fail if wrapper panels return');
assert(/cardRootDumps\s*!==\s*0/.test(visualSmoke), 'visual smoke must fail if Tools matching-card dumps return');
assert(/pathPrimaryMoves\s*!==\s*1/.test(visualSmoke), 'visual smoke must enforce one dominant Path move');

const browserWorkflow = read('.github/workflows/browser-smoke.yml');
assert(browserWorkflow.includes('Run visual density smoke'), 'browser workflow must include visual density smoke step');
assert(browserWorkflow.includes('node tests/playwright-visual-density.js'), 'browser workflow must execute the visual density smoke');
assert(browserWorkflow.indexOf('Run Tools builder-library smoke') < browserWorkflow.indexOf('Run visual density smoke'), 'visual density smoke should run after Tools-specific smoke');
assert(browserWorkflow.indexOf('Run visual density smoke') < browserWorkflow.indexOf('Run full browser smoke'), 'visual density smoke should run before full route smoke');

const historical = read('tools/run-historical-contracts.js');
assert(historical.includes("['tests/run-v10.02-tests.js']"), 'historical regression must run v10.02 focused tests in current-product phase');

const qroot = runInBrowserish([
  'data/product-hardening/product-hardening-queue.js',
  'data/product-hardening/work-packages.js',
  'data/product-hardening/card-wrapper-retirement-queue-v9.98.js',
  'data/product-hardening/build-next-queue-hygiene-current.js'
]);
const queue = qroot.OBOL_PRODUCT_HARDENING;
const visual = qroot.OBOL_VISUAL_DENSITY_REGRESSION_V1002;
const backlog = qroot.OBOL_TOOL_BUILDER_IMPLEMENTATION_BACKLOG_V1001;
assert(queue && visual && backlog, 'v10.02 queue and markers must initialize');
const visualItem = queue.items.find((item) => item.id === 'post-notes-visual-density-regression-pass');
assert(visualItem, 'visual density queue item missing');
assert.strictEqual(visualItem.status, 'complete', 'visual density item must be complete');
assert.strictEqual(visualItem.completedBy, 'v10.02', 'visual density item must close in v10.02');
assert.strictEqual(visualItem.proof, 'data/product-hardening/visual-density-regression-v10.02.js', 'visual density item must point at durable proof ledger');
assert.strictEqual(visualItem.followUpItem, 'post-notes-tool-builder-implementation-backlog', 'visual density must hand off to modeled-tool backlog');
assert(Array.isArray(visualItem.screenshots) && visualItem.screenshots.length >= 8, 'visual density queue item must list screenshot targets');
assert.strictEqual(visual.status, 'complete', 'visual density marker must be complete');
assert.strictEqual(visual.browserProof, 'tests/playwright-visual-density.js', 'visual density marker must point at browser proof');
assert.strictEqual(visual.nextItem, 'post-notes-tool-builder-implementation-backlog', 'visual proof must keep declaring the modeled-tool backlog as its follow-up item');
assert.strictEqual(visual.requestBudgetNeutral, true, 'visual-density proof ledger should be request-neutral');
const backlogItem = queue.items.find((item) => item.id === 'post-notes-tool-builder-implementation-backlog');
assert(backlogItem, 'modeled tool builder backlog queue item missing');
assert(['queued', 'complete'].includes(backlogItem.status), 'modeled tool builder backlog must be queued until implemented, then complete');
assert.strictEqual(backlog.visualDependencyComplete, true, 'backlog marker must know the visual-density dependency is complete');
assert.strictEqual(backlog.sharesEvidenceContract, true, 'backlog builders must share Evidence paste-back contract');
assert.strictEqual(backlog.sharesAccessoryContract, true, 'backlog builders must share accessory contract');
assert.strictEqual(backlog.sharesCommandRenderer, true, 'backlog builders must share schema renderer');
const readme = read('README.md');
const backlogClosedInReadme = readme.includes('No active Tool Builder implementation batches remain') || readme.includes('final implemented-tool Evidence and cross-surface audit closed in v10.08');
const next = queue.buildNext(5).map((item) => item.id);
assert(!next.includes('post-notes-visual-density-regression-pass'), 'visual density item should not remain in Build Next after closure');
// The concrete operator-surface family repair leads Build Next until every family is complete.
// Do not pin a single family literal: as each family (web, then credentials, ...) is finished
// the entry advances to the next highest-priority queued family. This protects the durable
// behaviour without freezing a completed item as the entry point.
const surfaceFamily = ['tb-surface-web', 'tb-surface-credentials', 'tb-surface-ad-smb', 'tb-surface-network', 'tb-surface-privesc'];
if (!backlogClosedInReadme) {
  const leadItem = queue.items.find((item) => item.id === next[0]);
  assert(surfaceFamily.includes(next[0]), 'Build Next must lead with a concrete Tool Builder operator-surface family repair item');
  assert(leadItem && leadItem.status === 'queued', 'the lead operator-surface family item must still be queued');
  const webItem = queue.items.find((item) => item.id === 'tb-surface-web');
  if (webItem && webItem.status === 'complete') {
    assert.notStrictEqual(next[0], 'tb-surface-web', 'a completed family repair item must not remain the Build Next entry');
  }
  assert(next.some((id) => surfaceFamily.includes(id) && id !== next[0]), 'Build Next must surface the remaining per-family repair items');
}
const qaTrack = queue.tracks.find((track) => track.id === 'testing-qa');
assert(qaTrack && qaTrack.complete >= 8, 'testing/QA track completion should preserve visual density proof');
const packages = qroot.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
const recommendation = packages && packages.recommend(queue);
if (!backlogClosedInReadme) {
  assert(recommendation && surfaceFamily.includes(recommendation.entryItem.id), 'recommended work package should enter the Tool Builder operator-surface family repair at its highest-priority queued family');
  assert(Array.isArray(recommendation.liveItems) && recommendation.liveItems.length >= 1, 'recommended package should include live tool-builder work while the family repair remains queued');
}

assert(readme.includes('Current release: **' + currentAuthority.label + '**'), 'README must sync to the current release authority');
assert(!readme.includes('**Next concrete entry:** **Post-mining visual density regression pass**'), 'README should not leave visual density as the next concrete item');
if (!backlogClosedInReadme) {
  assert(/\*\*Next concrete entry:\*\* \*\*Bring the [^*]*builder family to the operator-surface standard\*\*/.test(readme), 'README Build Next should lead with a concrete Tool Builder operator-surface family repair item');
  assert(!readme.includes('**Next concrete entry:** **Bring the Web discovery/HTTP builder family to the operator-surface standard**'), 'the completed Web discovery/HTTP family repair should no longer be the next concrete entry');
  assert(readme.includes('**Recommended work package:** **Tool Builder Operator-Surface Family Repair**'), 'README must surface the Tool Builder operator-surface family repair package while it remains queued');
} else {
  assert(readme.includes('No active Tool Builder implementation batches remain'), 'README must record that the Tool Builder implementation backlog closed once later releases complete it');
  assert(readme.includes('**Next concrete entry:**') && !readme.includes('**Next concrete entry:** **Post-mining modeled tool builder implementation backlog**'), 'README Build Next should move past the modeled-tool backlog once it closes');
}
const index = read('index.html');
assert(index.includes('<title>Obol ' + currentAuthority.label + ' — Product Hardening</title>'), 'index title must sync to current release');
assert(index.includes('Offensive Box Operations Ledger · ' + currentAuthority.label), 'index tagline must sync to current release');
const changelog = read('CHANGELOG.md');
assert(changelog.includes('## v10.02'), 'CHANGELOG must preserve v10.02 heading');

const release = cp.spawnSync(process.execPath, ['tools/validate-release-pr.js', '--repo-only'], { cwd: root, encoding: 'utf8' });
if (release.status !== 0) {
  process.stdout.write(release.stdout || '');
  process.stderr.write(release.stderr || '');
  process.exit(release.status || 1);
}
process.stdout.write(release.stdout || '');

console.log('v10.02 visual density regression validation passed.');