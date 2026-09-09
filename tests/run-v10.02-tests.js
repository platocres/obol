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

const currentRelease = read('data/current-release.js');
assert(currentRelease.includes("version:'10.0.2'"), 'current release must use semver payload 10.0.2');
assert(currentRelease.includes("label:'v10.02'"), 'current release label must be v10.02');
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
  'data/product-hardening/card-wrapper-retirement-queue-v9.98.js'
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
assert.strictEqual(visual.toolBacklogNext, true, 'Build Next should advance to modeled-tool backlog after visual proof');
assert.strictEqual(visual.requestBudgetNeutral, true, 'visual-density proof ledger should be request-neutral');
const backlogItem = queue.items.find((item) => item.id === 'post-notes-tool-builder-implementation-backlog');
assert(backlogItem, 'modeled tool builder backlog queue item missing');
assert.strictEqual(backlogItem.status, 'queued', 'modeled tool builder backlog must stay queued');
assert.strictEqual(backlog.visualDependencyComplete, true, 'backlog marker must know the visual-density dependency is complete');
assert.strictEqual(backlog.sharesEvidenceContract, true, 'backlog builders must share Evidence paste-back contract');
assert.strictEqual(backlog.sharesAccessoryContract, true, 'backlog builders must share accessory contract');
assert.strictEqual(backlog.sharesCommandRenderer, true, 'backlog builders must share schema renderer');
const next = queue.buildNext(5).map((item) => item.id);
assert.strictEqual(next[0], 'post-notes-tool-builder-implementation-backlog', 'Build Next must advance to modeled tool builder implementation backlog');
assert(!next.includes('post-notes-visual-density-regression-pass'), 'visual density item should not remain in Build Next after closure');
const qaTrack = queue.tracks.find((track) => track.id === 'testing-qa');
assert(qaTrack && qaTrack.complete >= 9, 'testing/QA track completion should include visual density proof');
const packages = qroot.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
assert(packages && packages.recommend(queue).entryItem.id === 'post-notes-tool-builder-implementation-backlog', 'recommended work package should now enter the modeled-tool backlog');
assert(/visual density regression proof have landed/i.test(packages.packages.find((p) => p.id === 'post-notes-operator-ui-clarity').guidance), 'work-package guidance must record visual density closeout');

const readme = read('README.md');
assert(readme.includes('Current release: **v10.02**'), 'README must sync current release to v10.02');
assert(readme.includes('**Next concrete entry:** **Post-mining modeled tool builder implementation backlog**'), 'README Build Next should advance to modeled tool builder implementation backlog');
assert(!readme.includes('**Next concrete entry:** **Post-mining visual density regression pass**'), 'README should not leave visual density as the next concrete item');
const index = read('index.html');
assert(index.includes('<title>Obol v10.02 — Product Hardening</title>'), 'index title must sync v10.02');
assert(index.includes('Offensive Box Operations Ledger · v10.02'), 'index tagline must sync v10.02');
const changelog = read('CHANGELOG.md');
assert(changelog.includes('## v10.02'), 'CHANGELOG must include v10.02 heading');

const release = cp.spawnSync(process.execPath, ['tools/validate-release-pr.js', '--repo-only', '--release-version=10.02'], { cwd: root, encoding: 'utf8' });
if (release.status !== 0) {
  process.stdout.write(release.stdout || '');
  process.stderr.write(release.stderr || '');
  process.exit(release.status || 1);
}
process.stdout.write(release.stdout || '');

console.log('v10.02 visual density regression validation passed.');
