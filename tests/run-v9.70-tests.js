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

function run(args) {
  const result = cp.spawnSync(process.execPath, args.map((part, index) => index === 0 ? path.join(root, part) : part), { cwd: root, encoding: 'utf8' });
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.status !== 0) process.exit(result.status || 1);
}

globalThis.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__ = true;
require(path.join(root, 'data/current-release.js'));
assert.ok(releaseAtLeast(globalThis.OBOL_CURRENT_RELEASE.label, 9, 70), 'current release should be v9.70 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/client-session-remine-batch-v9.70.js'));

globalThis.OBOL_NOTE_INTEGRATION = { publicFieldNotes: [], reviewedDispositions: [], ledger: { expectedNotes: 556, reviewedCount: 135 }, validate: () => [] };
globalThis.OBOL_PRODUCT_HARDENING = { items: [{ id: 'notes-mechanic-backfill', status: 'queued', priority: 86.8 }] };
globalThis.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = { reviewed: 135, total: 556, remining: { sourceRequired: true, negativeProofRequired: true, actualPathRequired: true, noNewWrappers: true, dimensions: DIMENSIONS, allowedOutcomes: ['added', 'covered', 'queued', 'private-only', 'not-applicable', 'blocked'], auditRows: [], audited: 87, reminedNoteCount: 87, oldRubricOnlyRemaining: 48 } };
globalThis.OBOL_LANES = [];
globalThis.CARDS = {};
globalThis.OBOL_INTAKE_V21 = { analyzeTerminal: () => ({ activities: [] }) };

const mod = require(path.join(root, 'data/product-hardening/client-session-remine-batch-v9.70.js'));
assert.strictEqual(mod.remineAuditRows.length, 20, 'v9.70 should close a 20-note re-mining batch');
assert.strictEqual(mod.publicNotes.length, 5, 'v9.70 should publish five public-safe derived notes');
assert.deepStrictEqual(mod.validate(), []);
for (const row of mod.remineAuditRows) {
  assert.strictEqual(row.originalSourceReread, true, row.noteId + ' must confirm source reread');
  assert.strictEqual(row.selectorBatch, 'notes-batch-old-rubric-reviewed-remine-002');
  for (const dimension of DIMENSIONS) {
    assert.ok(row.decisions[dimension], row.noteId + ' missing decision for ' + dimension);
    assert.ok(row.decisions[dimension].outcome, row.noteId + ' missing outcome for ' + dimension);
  }
}
const progress = globalThis.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining;
assert.strictEqual(progress.reminedNoteCount, 107);
assert.strictEqual(progress.oldRubricOnlyRemaining, 28);
assert.strictEqual(progress.latestSelectorBatch, 'notes-batch-old-rubric-reviewed-remine-002');
assert.strictEqual(progress.nextSelectorBatch, 'notes-batch-old-rubric-reviewed-remine-003');
assert.ok(globalThis.CARDS['web-client-session-proof-chain'], 'client/session card should be route-addressable');
assert.ok(globalThis.OBOL_NOTE_INTEGRATION.publicFieldNotes.some((note) => note.id === 'note-client-session-proof-chain'));
const analysis = mod.analyzeClientSessionEvidence('HTTP/1.1 200 OK\nSet-Cookie: sid=abc; SameSite=Lax; HttpOnly\nOrigin: https://example.test\n<script>alert(1)</script> csrf cleanup');
assert.ok(analysis.outcomeFacts.includes('web.client.execution_or_sink_signal'));
assert.ok(analysis.outcomeFacts.includes('web.session.storage_or_cookie_observed'));
assert.ok(analysis.outcomeFacts.includes('web.csrf_origin_boundary_observed'));
assert.ok(analysis.outcomeFacts.includes('web.server_acceptance_observed'));
assert.ok(analysis.outcomeFacts.includes('web.client_session.cleanup_needed'));
const intake = globalThis.OBOL_INTAKE_V21.analyzeTerminal('HTTP/1.1 204 No Content\nOrigin: https://example.test\ncsrf token document.cookie cleanup');
assert.ok(intake.activities.some((activity) => activity.analyzerId === 'client-session-evidence-analyzer'));
assert.strictEqual(globalThis.OBOL_PRODUCT_HARDENING.nextNotesBatch.id, 'notes-batch-old-rubric-reviewed-remine-003');

run(['tools/validate-release-pr.js', '--repo-only']);
console.log('v9.70 client/session re-mining batch checks passed.');
