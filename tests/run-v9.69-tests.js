'use strict';

const assert = require('assert');
const cp = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const DIMENSIONS = ['path-bindings', 'tool-cards', 'gui-controls', 'scripts-one-liners', 'command-templates', 'terminal-analyzers', 'evidence-expectations', 'path-movement', 'lesson-boxes', 'examples', 'troubleshooting', 'cleanup', 'report-guidance', 'product-mechanics', 'product-gaps', 'orange-baseline'];

function releaseAtLeast(label, major, minor) {
  const match = String(label || '').match(/^v?(\d+)\.(\d+)/);
  if (!match) return false;
  const foundMajor = Number(match[1]);
  const foundMinor = Number(match[2]);
  return foundMajor > major || (foundMajor === major && foundMinor >= minor);
}

globalThis.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__ = true;
require(path.join(root, 'data/current-release.js'));
assert.ok(releaseAtLeast(globalThis.OBOL_CURRENT_RELEASE.label, 9, 69), 'current release should be v9.69 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/web-upload-inclusion-remine-batch-v9.69.js'));

globalThis.OBOL_NOTE_INTEGRATION = { publicFieldNotes: [], reviewedDispositions: [], ledger: { expectedNotes: 556, reviewedCount: 135 } };
globalThis.OBOL_PRODUCT_HARDENING = { items: [{ id: 'notes-mechanic-backfill', status: 'queued', priority: 86.8 }] };
globalThis.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = { reviewed: 135, total: 556, remining: { sourceRequired: true, negativeProofRequired: true, actualPathRequired: true, noNewWrappers: true, dimensions: DIMENSIONS, allowedOutcomes: ['added', 'covered', 'queued', 'private-only', 'not-applicable', 'blocked'], auditRows: [], audited: 67, reminedNoteCount: 67 } };
globalThis.OBOL_LANES = [];
globalThis.CARDS = {};
globalThis.OBOL_INTAKE_V21 = { analyzeTerminal: () => ({ activities: [] }) };

const mod = require(path.join(root, 'data/product-hardening/web-upload-inclusion-remine-batch-v9.69.js'));
assert.strictEqual(mod.remineAuditRows.length, 20, 'v9.69 should close a 20-note re-mining batch');
assert.strictEqual(mod.publicNotes.length, 4, 'v9.69 should publish four public-safe derived notes');
assert.deepStrictEqual(mod.validate(), []);
for (const row of mod.remineAuditRows) {
  assert.strictEqual(row.originalSourceReread, true, row.noteId + ' must confirm source reread');
  for (const dimension of DIMENSIONS) {
    assert.ok(row.decisions[dimension], row.noteId + ' missing decision for ' + dimension);
    assert.ok(row.decisions[dimension].outcome, row.noteId + ' missing outcome for ' + dimension);
  }
}
const progress = globalThis.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining;
assert.strictEqual(progress.reminedNoteCount, 87);
assert.strictEqual(progress.oldRubricOnlyRemaining, 48);
assert.strictEqual(progress.latestSelectorBatch, 'notes-batch-old-rubric-reviewed-remine-001');
assert.strictEqual(progress.nextSelectorBatch, 'notes-batch-old-rubric-reviewed-remine-002');
assert.ok(globalThis.CARDS['web-upload-inclusion-proof-chain'], 'proof-chain card should be route-addressable');
const analysis = mod.analyzeUploadInclusionEvidence('ffuf Status: 200 Size: 1234 File successfully uploaded Content-Type: text/plain ../ php:// wrapper cleanup web shell command output');
assert.ok(analysis.outcomeFacts.includes('web.upload.acceptance_observed'));
assert.ok(analysis.outcomeFacts.includes('web.inclusion.transform_observed'));
assert.ok(analysis.outcomeFacts.includes('web.file_handling.fuzzing_signal_observed'));
assert.ok(analysis.outcomeFacts.includes('web.file_handling.cleanup_needed'));

const checks = [
  ['tools/validate-note-remining-audits.js'],
  ['tools/validate-notes-impact.js'],
  ['tools/validate-note-integration.js'],
  ['tools/validate-product-hardening-queue.js'],
  ['tools/sync-product-build-next.js', '--check'],
  ['tools/scope-check.js'],
];
for (const args of checks) {
  const result = cp.spawnSync(process.execPath, args.map((part, index) => index === 0 ? path.join(root, part) : part), { cwd: root, encoding: 'utf8' });
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log('v9.69 web upload/inclusion re-mining batch checks passed.');
