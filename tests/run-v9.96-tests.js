'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const assert = require('assert');
const rootDir = path.join(__dirname, '..');
const root = globalThis;
root.window = root;
root.document = undefined;
root.setTimeout = root.setTimeout || function(fn){ if (typeof fn === 'function') fn(); return 0; };

function load(rel) { require(path.join(rootDir, rel)); }
function run(args) {
  const result = cp.spawnSync(process.execPath, args.map((part, index) => index === 0 ? path.join(rootDir, part) : part), { cwd: rootDir, encoding: 'utf8' });
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.status !== 0) process.exit(result.status || 1);
}
const releaseSource = fs.readFileSync(path.join(rootDir, 'data/current-release.js'), 'utf8');
assert(/version:'9\.96\.0'/.test(releaseSource), 'current-release source should identify v9.96.0');
assert(/label:'v9\.96'/.test(releaseSource), 'current-release source should identify v9.96');
assert(releaseSource.includes('data/product-hardening/post-notes-clarity-audit-v9.96.js'), 'current-release source should load the v9.96 audit extension');

load('data/product-hardening/product-hardening-queue.js');
load('data/product-hardening/work-packages.js');
load('data/product-hardening/post-notes-clarity-audit-v9.96.js');

const audit = root.OBOL_POST_NOTES_CLARITY_AUDIT_V996;
assert(audit, 'v9.96 audit ledger should be exposed');
assert.strictEqual(audit.complete, true, 'audit ledger should mark the audit complete');
assert.strictEqual(audit.canOneBuild, false, 'audit should explicitly reject one giant cleanup build');
assert.strictEqual(audit.completedQueueItem, 'post-notes-next-step-tool-card-audit', 'audit should record the completed broad audit item');
assert(Array.isArray(audit.findings) && audit.findings.length >= 5, 'audit should contain concrete findings');
assert(Array.isArray(audit.proposedQueue) && audit.proposedQueue.length === 4, 'audit should split the work into four follow-up queue items');
const surfaces = new Set(audit.findings.map(f => f.surface));
['README','Next Steps / Path','Card route','Tools route','Tests / visual QA'].forEach(surface => assert(surfaces.has(surface), 'audit finding missing surface: ' + surface));
for (const finding of audit.findings) {
  assert(finding.id && finding.severity && finding.summary && finding.evidence && finding.solution, 'finding must include id, severity, summary, evidence, and solution');
  assert(!/someday|later maybe|misc cleanup/i.test(finding.summary + ' ' + finding.solution), 'finding should not use vague future cleanup language: ' + finding.id);
}

const q = root.OBOL_PRODUCT_HARDENING;
assert(q && Array.isArray(q.items), 'product hardening queue should be loaded');
const expectedQueue = [
  'post-notes-path-supporting-detail-cleanup',
  'post-notes-card-progressive-disclosure-cleanup',
  'post-notes-tools-builder-library-cleanup',
  'post-notes-visual-density-regression-pass'
];
for (const id of expectedQueue) {
  const item = q.items.find(row => row && row.id === id);
  assert(item, 'missing split queue item ' + id);
  assert.strictEqual(item.status, 'queued', 'split queue item should be queued: ' + id);
  assert(item.detail && item.acceptance, 'split queue item should carry detail and acceptance: ' + id);
}
const next = typeof q.buildNext === 'function' ? q.buildNext(5) : [];
assert(next[0] && next[0].id === 'post-notes-path-supporting-detail-cleanup', 'next build should start with Path supporting-detail cleanup');
assert(!next.some(item => item && item.id === 'post-notes-next-step-tool-card-audit'), 'completed broad audit item should not remain in Build Next');

const packages = root.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
assert(packages && Array.isArray(packages.packages), 'work package model should be loaded');
const pkg = packages.packages.find(row => row && row.id === 'post-notes-operator-ui-clarity');
assert(pkg, 'post-notes operator UI clarity package should be present');
assert.deepStrictEqual(pkg.itemIds, expectedQueue, 'post-notes package should own the four split queue items');
assert.strictEqual(pkg.recommendedBatch, true, 'post-notes package should be a recommended batch');
assert(/Do not try to clean Path, Card, Tools, and visual-density proof in one patch/i.test(pkg.guidance), 'package guidance should warn against one giant cleanup patch');
const rec = typeof packages.recommend === 'function' ? packages.recommend(q) : null;
assert(rec && rec.id === 'post-notes-operator-ui-clarity', 'recommended package should be the post-notes operator UI clarity split');
assert(rec.liveItems && rec.liveItems.length === 4, 'recommended package should expose the four live split items');

const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');
assert(/Current release: \*\*v9\.96\*\*/.test(readme), 'README should identify v9.96');
assert(/Treat note-mining docs as closed-source reference unless reactivated/.test(readme), 'README should demote note-mining docs to reference-only posture');
assert(/Extract the value, not the wording/.test(readme), 'README should preserve the safe derivation rule as reference guidance');
assert(!/For notes work, use the generated Next notes batch or cluster queue/.test(readme), 'README should not keep stale active next-notes-batch quickstart wording');
assert(!/Next concrete entry:\*\* \*\*Post-mining Next Steps and tool-card clarity audit\*\*/.test(readme), 'README should not advertise the completed broad audit item as next');
assert(/Post-mining Path supporting-detail cleanup/.test(readme), 'README should show Path cleanup as the next post-notes item');
assert(/Post-notes Operator UI Clarity/.test(readme), 'README should show the split post-notes work package');
assert(!/[1-9]\d* old-rubric-only notes remain/i.test(readme), 'README should not resurrect nonzero old note-review residue');

run(['tools/validate-release-pr.js', '--repo-only', '--release-version=9.96']);
console.log('v9.96 post-notes clarity audit tests passed: ' + audit.findings.length + ' findings, ' + audit.proposedQueue.length + ' split queue items.');
