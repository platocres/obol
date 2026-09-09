'use strict';

// Demoted historical test (v9.97+): the v9.96 post-notes clarity audit is a
// frozen ledger, so this suite asserts that immutable model and the demoted
// version floor, not the mutable current-release/README/Build-Next state that a
// later release advances. The named runner executes only the current-release
// test; this one is kept parse-clean and version-agnostic as preservation.

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const rootDir = path.join(__dirname, '..');
const root = globalThis;
root.window = root;
root.setTimeout = root.setTimeout || function (fn) { if (typeof fn === 'function') fn(); return 0; };

function versionAtLeast(actual, minimum) {
  const a = String(actual || '').replace(/^v/i, '').split('.').map(Number);
  const b = String(minimum || '').replace(/^v/i, '').split('.').map(Number);
  for (let i = 0; i < 3; i++) { const d = (a[i] || 0) - (b[i] || 0); if (d) return d > 0; }
  return true;
}

const releaseSource = fs.readFileSync(path.join(rootDir, 'data/current-release.js'), 'utf8');
const m = releaseSource.match(/label:'v(\d+\.\d+(?:\.\d+)?)'/);
assert(m && versionAtLeast(m[1], '9.96'), 'current release should be v9.96 or newer');
assert(releaseSource.includes('data/product-hardening/post-notes-clarity-audit-v9.96.js'), 'the v9.96 audit extension stays registered as historical context');

require(path.join(rootDir, 'data/product-hardening/product-hardening-queue.js'));
require(path.join(rootDir, 'data/product-hardening/work-packages.js'));
require(path.join(rootDir, 'data/product-hardening/post-notes-clarity-audit-v9.96.js'));

const audit = root.OBOL_POST_NOTES_CLARITY_AUDIT_V996;
assert(audit, 'v9.96 audit ledger should be exposed');
assert.strictEqual(audit.complete, true, 'audit ledger should mark the audit complete');
assert.strictEqual(audit.canOneBuild, false, 'audit should explicitly reject one giant cleanup build');
assert.strictEqual(audit.completedQueueItem, 'post-notes-next-step-tool-card-audit', 'audit should record the completed broad audit item');
assert(Array.isArray(audit.findings) && audit.findings.length >= 5, 'audit should contain concrete findings');
assert(Array.isArray(audit.proposedQueue) && audit.proposedQueue.length === 4, 'audit should split the work into four follow-up queue items');
const surfaces = new Set(audit.findings.map(f => f.surface));
['README', 'Next Steps / Path', 'Card route', 'Tools route', 'Tests / visual QA'].forEach(surface => assert(surfaces.has(surface), 'audit finding missing surface: ' + surface));
for (const finding of audit.findings) {
  assert(finding.id && finding.severity && finding.summary && finding.evidence && finding.solution, 'finding must include id, severity, summary, evidence, and solution');
  assert(!/someday|later maybe|misc cleanup/i.test(finding.summary + ' ' + finding.solution), 'finding should not use vague future cleanup language: ' + finding.id);
}

const packages = root.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
const pkg = packages.packages.find(row => row && row.id === 'post-notes-operator-ui-clarity');
assert(pkg, 'post-notes operator UI clarity package should be present');
assert.deepStrictEqual(pkg.itemIds, ['post-notes-path-supporting-detail-cleanup', 'post-notes-card-progressive-disclosure-cleanup', 'post-notes-tools-builder-library-cleanup', 'post-notes-visual-density-regression-pass'], 'post-notes package should own the four split queue items');
assert.strictEqual(pkg.recommendedBatch, true, 'post-notes package should be a recommended batch');

console.log('v9.96 demoted historical test passed: post-notes clarity audit ledger and split package preserved (' + audit.findings.length + ' findings).');
