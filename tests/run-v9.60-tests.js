'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const QUEUE_ITEM_ID = 'notes-remine-private-superseded';
const NEXT_BATCH_ID = 'notes-batch-old-rubric-reviewed-remine-001';
const SOURCE_ROUTE = 'platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json';

const sourceRows = Object.freeze([
  Object.freeze({
    noteId: 'htb-penetration-tester-f279cdee9c5e3574',
    disposition: 'private-reference-only',
    rationale: 'The reviewed material is mainly a volatile proxy-extension marketplace catalog. Keep it private for reference rather than freezing changing extension recommendations into the product.',
    outputIds: Object.freeze([]),
  }),
  Object.freeze({
    noteId: 'htb-penetration-tester-526b318523ab2df4',
    disposition: 'private-reference-only',
    rationale: 'This record is primarily a payload and bypass cheat sheet. Keep it as private reference because public Obol should expose reviewable reasoning and proof boundaries rather than a copied recipe catalog.',
    outputIds: Object.freeze([]),
  }),
  Object.freeze({
    noteId: 'htb-penetration-tester-009ff7c58b458f28',
    disposition: 'private-reference-only',
    rationale: 'The file-upload assessment is mainly lab-specific outcome and walkthrough material; its general lessons are represented by reviewed upload-validation, downstream-consumer, execution-proof, and remediation notes.',
    outputIds: Object.freeze([]),
  }),
  Object.freeze({
    noteId: 'htb-penetration-tester-6614dce51cf838bf',
    disposition: 'superseded',
    rationale: 'This source is a broad module introduction whose useful concepts are covered more precisely by reviewed verb-tampering, object-authorization, and XML-specific source notes.',
    outputIds: Object.freeze([]),
  }),
]);

function basePublicNotesForPath(pathId) {
  const id = String(pathId || '').toLowerCase();
  return Array.from(this.publicFieldNotes || []).filter((note) => Array.from(note.pathIds || []).some((pathRef) => String(pathRef).toLowerCase() === id));
}
function basePublicNotesForTool(toolId) {
  const id = String(toolId || '').toLowerCase();
  return Array.from(this.publicFieldNotes || []).filter((note) => Array.from(note.toolIds || []).some((toolRef) => String(toolRef).toLowerCase() === id));
}

global.OBOL_NOTE_INTEGRATION = Object.freeze({
  schemaVersion: '1.13.0',
  ledger: Object.freeze({ expectedNotes: 556, reviewedCount: 136, dispositionCounts: Object.freeze({ modeled: 103, 'private-reference-only': 28, superseded: 5 }) }),
  reviewedDispositions: sourceRows,
  publicFieldNotes: Object.freeze([]),
  packetReviews: Object.freeze({}),
  publicNotesForPath: basePublicNotesForPath,
  publicNotesForTool: basePublicNotesForTool,
  validate: () => [],
});

global.OBOL_PRODUCT_HARDENING = {
  tracks: [
    { id: 'notes-integration', complete: 136, total: 556 },
    { id: 'offline-performance', complete: 1, total: 6 },
  ],
  items: [
    { id: QUEUE_ITEM_ID, track: 'notes-integration', status: 'queued', label: 'Re-mine private-only and superseded notes', priority: 86.87 },
    { id: 'notes-mechanic-backfill', track: 'notes-integration', status: 'modeled', label: 'Re-mine all already-reviewed notes from original sources', priority: 86.8, standingGate: true },
    { id: 'notes-disposition-burn-down', track: 'notes-integration', status: 'modeled', label: 'Burn down all 556 note dispositions', priority: 87.9, standingGate: true },
    { id: 'perf-service-worker', track: 'offline-performance', status: 'queued', label: 'Quiet service worker caching', priority: 90 },
  ],
};

global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = Object.freeze({
  schemaVersion: '1.12.0',
  total: 556,
  reviewed: 136,
  remining: Object.freeze({
    auditRows: Object.freeze([]),
    remineAuditRows: Object.freeze([]),
    audited: 30,
    reminedNoteCount: 30,
    completedReminedThemes: Object.freeze(['xss-session', 'credentials-auth', 'linux-privesc']),
    latestThemes: Object.freeze(['Linux local privilege escalation', 'Credentials / auth material']),
    staleQueueCorrections: Object.freeze(['notes-remine-linux-privesc']),
  }),
});

require('../data/current-release.js');
const packet = require('../data/product-hardening/private-only-superseded-remining-v9.60.js');
require('../data/product-hardening/build-next-queue-hygiene-current.js');

assert(global.OBOL_CURRENT_RELEASE, 'current release should be published');
assert.strictEqual(global.OBOL_CURRENT_RELEASE.label, 'v9.60');
assert.strictEqual(global.OBOL_CURRENT_RELEASE.version, '9.60.0');
assert(global.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/private-only-superseded-remining-v9.60.js'), 'current release must load the v9.60 private-only/superseded re-mining extension');
assert.strictEqual(packet.status, 'live-integrated');
assert.strictEqual(packet.queueItemId, QUEUE_ITEM_ID);
assert.strictEqual(packet.sourceConfidence.reviewTextPolicy, 'complete_cleaned_text');
assert.strictEqual(packet.sourceConfidence.truncationPolicy, 'none');
assert.strictEqual(packet.sourceConfidence.expectedNoteCount, 556);
assert.strictEqual(packet.sourceConfidence.packetCount, 29);

const rows = packet.auditRows();
assert.strictEqual(rows.length, sourceRows.length, 'test fixture should produce one audit row per private/superseded source row');
for (const row of rows) {
  assert.strictEqual(row.originalSourceReread, true, 'audit row must record source re-read');
  assert.strictEqual(row.remineDisposition, 'source-boundary-modeled');
  for (const dim of packet.dimensions) {
    assert(row.decisions[dim], 'audit row missing dimension ' + dim);
    assert(row.decisions[dim].outcome, 'audit dimension missing outcome ' + dim);
    assert(row.decisions[dim].proof && row.decisions[dim].proof.length > 20, 'audit dimension missing proof ' + dim);
  }
  assert(row.outputIds.length >= 1, 'each private/superseded row should map to at least one safe public output');
}
assert(rows.some((row) => row.sourceClass === 'volatile-tool-reference'), 'volatile tool references should be classified');
assert(rows.some((row) => row.sourceClass === 'recipe-catalog'), 'recipe/catalog sources should be classified');
assert(rows.some((row) => row.sourceClass === 'lab-outcome'), 'lab outcome sources should be classified');
assert(rows.some((row) => row.sourceClass === 'superseded-coverage'), 'superseded coverage sources should be classified');

const result = packet.integrate();
assert.strictEqual(result.notesIntegrated, true);
assert.strictEqual(result.queueIntegrated, true);
assert.strictEqual(result.progressIntegrated, true);
for (const id of [
  'note-private-source-redaction-boundary',
  'note-recipe-catalog-to-control-axes',
  'note-lab-outcome-to-proof-template',
  'note-volatile-tool-reference-boundary',
]) {
  assert(result.outputIds.includes(id), 'integration result should expose output ' + id);
  assert(global.OBOL_NOTE_INTEGRATION.publicFieldNotes.some((note) => note.id === id), 'public field note missing ' + id);
}
assert(global.OBOL_NOTE_INTEGRATION.__privateOnlySupersededReminingV960, 'note integration should carry v9.60 marker');
assert(global.OBOL_NOTE_INTEGRATION.packetReviews['private-only-superseded-remine'], 'packet review marker should exist');
assert.strictEqual(global.OBOL_NOTE_INTEGRATION.packetReviews['private-only-superseded-remine'].candidateCount, sourceRows.length);
assert.strictEqual(global.OBOL_NOTE_INTEGRATION.packetReviews['private-only-superseded-remine'].openProductGaps.length, 0, 'same-surface gaps must not be parked');

const completedItem = global.OBOL_PRODUCT_HARDENING.items.find((item) => item.id === QUEUE_ITEM_ID);
assert(completedItem, 'queue item should exist');
assert.strictEqual(completedItem.status, 'complete');
assert.strictEqual(completedItem.completedBy, 'v9.60-private-only-superseded-remine');
assert.strictEqual(completedItem.proofFile, 'data/product-hardening/private-only-superseded-remining-v9.60.js');
assert(/Complete in v9\.60/i.test(completedItem.detail), 'completed queue item should explain the v9.60 closeout');

const mechanicGate = global.OBOL_PRODUCT_HARDENING.items.find((item) => item.id === 'notes-mechanic-backfill');
const dispositionGate = global.OBOL_PRODUCT_HARDENING.items.find((item) => item.id === 'notes-disposition-burn-down');
const nextItem = global.OBOL_PRODUCT_HARDENING.items.find((item) => item.id === 'perf-service-worker');
assert(mechanicGate && mechanicGate.status === 'queued', 'already-reviewed note re-mining must remain concrete while old-rubric-only notes remain');
assert(dispositionGate && dispositionGate.status === 'queued', 'all-note disposition burn-down must remain concrete while pending notes remain');
assert(nextItem && nextItem.status === 'queued', 'quiet service worker caching should remain queued behind notes-first gates');
assert(global.OBOL_PRODUCT_HARDENING.notesFirstGate.active, 'notes-first gate should be active while notes are incomplete');
const nextBatch = global.OBOL_PRODUCT_HARDENING.nextNotesBatch;
assert(nextBatch, 'active notes-first gate must publish the next notes batch handoff');
assert.strictEqual(nextBatch.id, NEXT_BATCH_ID, 'next notes batch should have a stable machine-readable id');
assert.strictEqual(nextBatch.label, 'Old-rubric reviewed source re-mining batch 1');
assert.strictEqual(nextBatch.gateId, 'notes-mechanic-backfill');
assert.strictEqual(nextBatch.sourceRoute, SOURCE_ROUTE);
assert.strictEqual(nextBatch.targetCount, 20);
assert(/already-reviewed notes/.test(nextBatch.sourceSelector), 'next notes batch selector should name the candidate set');
assert(/manifest\/source order/.test(nextBatch.sourceSelector), 'next notes batch selector should define ordering');
assert(Array.isArray(nextBatch.requiredDimensions) && nextBatch.requiredDimensions.length >= 16, 'next notes batch should name the full-spectrum dimensions');
assert(/Every selected note/.test(nextBatch.acceptance), 'next notes batch acceptance should prevent vague handoff');
const buildNext = global.OBOL_PRODUCT_HARDENING.buildNext(5).map((item) => item.id);
assert.strictEqual(buildNext[0], 'notes-mechanic-backfill', 'old-rubric note re-mining should be the next concrete item before offline work');
assert(buildNext.indexOf('notes-disposition-burn-down') !== -1, 'all-note disposition burn-down should stay visible in concrete Build Next');
assert(buildNext.indexOf('perf-service-worker') > buildNext.indexOf('notes-disposition-burn-down'), 'offline work must stay behind active notes burn-down');
assert.deepStrictEqual(global.OBOL_PRODUCT_HARDENING.validateQueueHygiene(), [], 'queue hygiene should pass with notes-first policy active');

const progress = global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining;
assert(progress.completedReminedThemes.includes('private-only-superseded'), 'progress should record completed private-only/superseded theme');
assert.strictEqual(progress.privateOnlySupersededRemined, true);
assert.strictEqual(progress.privateOnlySupersededReminedCount, sourceRows.length);
assert(progress.remineAuditRows.length >= sourceRows.length, 'progress should include v9.60 audit rows');

const doc = fs.readFileSync(path.join(__dirname, '..', 'docs', 'v9.60.md'), 'utf8');
assert(doc.includes(QUEUE_ITEM_ID), 'release doc must name the actual queue item id');
assert(doc.includes('recipe catalogs become builder/control axes'), 'release doc must describe the safe product mechanic');
assert(doc.includes('no new Evidence ingestion parser is required'), 'release doc must explain the Evidence boundary');
assert(doc.includes('note burn-down remains the concrete next phase'), 'release doc must record the notes-first queue policy');
assert(doc.includes(NEXT_BATCH_ID), 'release doc must record the next notes batch id');
assert(doc.includes('perf-service-worker'), 'release doc must identify the offline/performance item blocked behind notes');

const serialized = JSON.stringify({ rows, publicNotes: packet.publicNotes, sourceConfidence: packet.sourceConfidence });
const forbidden = [
  /HTB\{[^}]+\}/i,
  /flag\{[^}]+\}/i,
  /document\.cookie/i,
  /nc\s+-l/i,
  /python3?\s+-m\s+http\.server/i,
  /BEGIN OPENSSH PRIVATE KEY/i,
  /password\s*=/i,
  /TARGET_PATH/i,
];
for (const pattern of forbidden) assert(!pattern.test(serialized), 'v9.60 public data leaked forbidden material matching ' + pattern);

console.log('v9.60 private-only and superseded re-mining checks passed');
