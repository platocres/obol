'use strict';

const assert = require('assert');

const packet = require('../data/product-hardening/xss-session-remining-v9.57.js');

assert.strictEqual(packet.wave, 'v9.57-xss-session-remine');
assert.strictEqual(packet.status, 'live-integrated');
assert.strictEqual(packet.sourceRoute, 'platocres/obol-source-notes@agent/review-packets');
assert.deepStrictEqual(packet.sourcePackets, [
  'data/review-packets/manifest.json',
  'data/review-packets/htb-penetration-tester-03.json',
  'data/review-packets/htb-penetration-tester-04.json',
]);

assert.strictEqual(packet.sourceConfidence.schemaVersion, 2);
assert.strictEqual(packet.sourceConfidence.reviewTextPolicy, 'complete_cleaned_text');
assert.strictEqual(packet.sourceConfidence.expectedNoteCount, 556);
assert.strictEqual(packet.sourceConfidence.noteCount, 556);
assert.strictEqual(packet.sourceConfidence.uniqueNoteCount, 556);
assert.strictEqual(packet.sourceConfidence.packetCount, 29);
assert.strictEqual(packet.sourceConfidence.truncatedNoteCount, 0);
assert.strictEqual(packet.sourceConfidence.windowMarkerCount, 0);
assert.strictEqual(packet.sourceConfidence.reviewTextChars, 8725188);
assert.strictEqual(packet.sourceConfidence.resourceCount, 1326);

assert.ok(Array.isArray(packet.findings));
assert.ok(packet.findings.length >= 5);
assert.ok(Array.isArray(packet.fieldNotes));
assert.ok(Array.isArray(packet.remineAuditRows));
assert.ok(Array.isArray(packet.queuedProductGaps));
assert.ok(packet.fieldNotes.length >= 3);
assert.ok(packet.remineAuditRows.length >= 5);
assert.ok(packet.queuedProductGaps.length >= 2);

const sourceRefs = new Set(packet.findings.map((finding) => finding.sourceRef));
[
  'htb-penetration-tester-a4d4973fdf6bc637',
  'htb-penetration-tester-29a1c06afad3cb8d',
  'htb-penetration-tester-6317a4c1a6b7cdc7',
  'htb-penetration-tester-2715d3efea49bdce',
  'htb-penetration-tester-c67727d9b2d3119d',
].forEach((sourceRef) => {
  assert.ok(sourceRefs.has(sourceRef), `missing source ref ${sourceRef}`);
});

const outcomes = packet.findings.reduce((counts, finding) => {
  counts[finding.outcome] = (counts[finding.outcome] || 0) + 1;
  return counts;
}, {});
assert.ok(outcomes.added >= 2, 'expected added product findings');
assert.ok(outcomes.covered >= 1, 'expected covered product findings');
assert.ok(outcomes.queued >= 1, 'expected queued product findings');

const owners = new Set(packet.findings.map((finding) => finding.productOwner));
assert.ok(owners.has('note-xss-delivery-trigger-context'));
assert.ok(owners.has('note-xss-browser-execution-proof'));
assert.ok(owners.has('note-xss-session-impact-boundary'));

const liveCards = new Set(packet.liveCards);
assert.ok(liveCards.has('note-xss-delivery-trigger-context'));
assert.ok(liveCards.has('note-xss-browser-execution-proof'));
assert.ok(liveCards.has('note-xss-session-impact-boundary'));

const queuedGapIds = new Set(packet.queuedProductGaps.map((gap) => gap.id));
assert.ok(queuedGapIds.has('gap-xss-proof-mode-selector'));
assert.ok(queuedGapIds.has('gap-xss-proof-mode-cleanup-reminder'));
assert.ok(packet.queuedProductGaps.every((gap) => gap.track === 'ui-ux' && gap.status === 'queued'));

const dimensions = new Map(packet.dimensionAudit.map((dimension) => [dimension.dimension, dimension.result]));
assert.strictEqual(dimensions.get('path-bindings'), 'added');
assert.strictEqual(dimensions.get('gui-controls'), 'queued');
assert.strictEqual(dimensions.get('terminal-analyzers'), 'covered');
assert.strictEqual(dimensions.get('lesson-boxes'), 'added');
assert.strictEqual(dimensions.get('cleanup'), 'queued');

const auditDimensions = [
  'path-bindings',
  'tool-cards',
  'gui-controls',
  'scripts-one-liners',
  'command-templates',
  'terminal-analyzers',
  'evidence-expectations',
  'path-movement',
  'lesson-boxes',
  'examples',
  'troubleshooting',
  'cleanup',
  'report-guidance',
  'product-mechanics',
  'product-gaps',
  'orange-baseline',
];
for (const row of packet.remineAuditRows) {
  assert.strictEqual(row.originalSourceReread, true, `missing source reread proof for ${row.noteId}`);
  for (const dimension of auditDimensions) {
    assert.ok(row.decisions[dimension], `missing ${dimension} decision for ${row.noteId}`);
    assert.ok(row.decisions[dimension].outcome, `missing ${dimension} outcome for ${row.noteId}`);
  }
}

assert.ok(packet.publicSafeChanges.length >= 5);

const serialized = JSON.stringify(packet);
[
  /<script/i,
  /document\.cookie/i,
  /nc\s+-l/i,
  /python3?\s+-m\s+http\.server/i,
  /password\s*=/i,
  /flag\{[^}]+\}/i,
].forEach((unsafePattern) => {
  assert.ok(!unsafePattern.test(serialized), `public artifact contains unsafe pattern ${unsafePattern}`);
});

delete require.cache[require.resolve('../data/product-hardening/xss-session-remining-v9.57.js')];
global.OBOL_NOTE_INTEGRATION = Object.freeze({
  schemaVersion: '1.9.0',
  ledger: Object.freeze({ reviewedCount: 135, expectedNotes: 556 }),
  publicFieldNotes: Object.freeze([
    Object.freeze({ id: 'note-xss-browser-execution-proof', title: 'Old title', toolIds: Object.freeze([]), pathIds: Object.freeze([]), sourceRefs: Object.freeze([]) }),
  ]),
  packetReviews: Object.freeze({}),
  validate: () => [],
});
global.OBOL_PRODUCT_HARDENING = {
  tracks: [{ id: 'ui-ux', total: 11, complete: 10 }],
  items: [{ id: 'notes-remine-xss-session', status: 'queued', detail: 'old detail' }],
};
global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = Object.freeze({
  schemaVersion: '1.7.0',
  remining: Object.freeze({
    dimensions: Object.freeze([]),
    allowedOutcomes: Object.freeze([]),
    auditRows: Object.freeze([]),
    reminedThemes: Object.freeze([]),
    completedReminedThemes: Object.freeze([]),
    redFlags: Object.freeze([]),
  }),
});
require('../data/product-hardening/xss-session-remining-v9.57.js');
const notes = global.OBOL_NOTE_INTEGRATION;
assert.strictEqual(notes.__xssSessionReminingV957, true);
assert.ok(notes.publicFieldNotes.find((note) => note.id === 'note-xss-delivery-trigger-context'));
assert.ok(notes.publicFieldNotes.find((note) => note.id === 'note-xss-browser-execution-proof' && /Browser execution/.test(note.title)));
assert.ok(notes.publicNotesForPath('path').some((note) => note.id === 'note-xss-session-impact-boundary'));
assert.strictEqual(global.OBOL_PRODUCT_HARDENING.items[0].status, 'complete');
const selectorGap = global.OBOL_PRODUCT_HARDENING.items.find((item) => item.id === 'gap-xss-proof-mode-selector');
const cleanupGap = global.OBOL_PRODUCT_HARDENING.items.find((item) => item.id === 'gap-xss-proof-mode-cleanup-reminder');
assert.ok(selectorGap, 'proof-mode selector gap must be an actual Product Build Next queue item');
assert.ok(cleanupGap, 'proof-mode cleanup reminder gap must be an actual Product Build Next queue item');
assert.strictEqual(selectorGap.status, 'queued');
assert.strictEqual(cleanupGap.status, 'queued');
assert.strictEqual(selectorGap.track, 'ui-ux');
assert.strictEqual(cleanupGap.track, 'ui-ux');
assert.strictEqual(global.OBOL_PRODUCT_HARDENING.tracks[0].total, 13);
assert.strictEqual(global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.latestWave, 'v9.57-xss-session-remine');
assert.ok(global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.auditRows.length >= 5);
assert.ok(global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.queuedProductGaps.includes('gap-xss-proof-mode-selector'));
assert.ok(global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.queuedProductGaps.includes('gap-xss-proof-mode-cleanup-reminder'));

const manifest = require('../data/runtime-manifest.js');
assert.ok(
  manifest.lazy.productHardening.includes('data/product-hardening/xss-session-remining-v9.57.js'),
  'runtime manifest must load the live XSS/session re-mining integration before notes impact/dashboard code'
);
const xssIndex = manifest.lazy.productHardening.indexOf('data/product-hardening/xss-session-remining-v9.57.js');
const progressIndex = manifest.lazy.productHardening.indexOf('data/product-hardening/note-progress-current.js');
const impactIndex = manifest.lazy.productHardening.indexOf('data/product-hardening/notes-impact-current.js');
assert.ok(progressIndex > -1 && xssIndex > progressIndex, 'XSS re-mining should load after base note progress');
assert.ok(impactIndex > -1 && xssIndex < impactIndex, 'XSS re-mining should load before notes impact/dashboard projection');

require('../data/current-release.js');
assert.strictEqual(global.OBOL_CURRENT_RELEASE.label, 'v9.57');
assert.strictEqual(global.OBOL_CURRENT_RELEASE.version, '9.57.0');

const validateLiveIntegrationDoneGate = require('../tools/validate-live-integration-done-gate.js');
const doneGateFailures = validateLiveIntegrationDoneGate(['data/product-hardening/xss-session-remining-v9.57.js']);
assert.deepStrictEqual(doneGateFailures, []);

console.log('v9.57 XSS/session re-mining live integration checks passed');