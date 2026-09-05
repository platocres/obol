'use strict';

const assert = require('assert');

// Keep this release test isolated from older Product Hardening extension side effects.
function freezeObject(value) { return Object.freeze(value || {}); }
function freezeList(list) { return Object.freeze((list || []).slice()); }

const outcomes = ['added', 'covered', 'queued', 'private-only', 'not-applicable', 'blocked'];
const dimensions = [
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

const zeroCounts = freezeObject(outcomes.reduce((acc, outcome) => { acc[outcome] = 0; return acc; }, {}));
const dimensionCounts = freezeObject(dimensions.reduce((acc, dim) => {
  acc[dim] = freezeObject({ total: 0, added: 0, covered: 0, queued: 0, 'private-only': 0, 'not-applicable': 0, blocked: 0 });
  return acc;
}, {}));

global.OBOL_NOTE_INTEGRATION = freezeObject({
  schemaVersion: '1.14.0',
  ledger: freezeObject({ expectedNotes: 556, reviewedCount: 135, dispositionCounts: freezeObject({ modeled: 102, 'private-reference-only': 28, superseded: 5 }) }),
  reviewedDispositions: freezeList([
    freezeObject({ noteId: 'htb-penetration-tester-bfe04186f42f682f', disposition: 'modeled', outputIds: freezeList(['note-lsass-proof-boundary']) }),
  ]),
  publicFieldNotes: freezeList([]),
  packetReviews: freezeObject({}),
  publicNotesForTool(toolId) {
    const id = String(toolId || '').toLowerCase();
    return Array.from(this.publicFieldNotes || []).filter((note) => Array.from(note.toolIds || []).some((tool) => String(tool).toLowerCase() === id));
  },
  publicNotesForPath(pathId) {
    const id = String(pathId || '').toLowerCase();
    return Array.from(this.publicFieldNotes || []).filter((note) => Array.from(note.pathIds || []).some((pathRef) => String(pathRef).toLowerCase() === id));
  },
  validate: () => [],
});

global.OBOL_PRODUCT_HARDENING = {
  tracks: [{ id: 'notes-integration', complete: 135, total: 556 }],
  items: [
    { id: 'notes-mechanic-backfill', track: 'notes-integration', status: 'queued', label: 'Re-mine all already-reviewed notes from original sources' },
    { id: 'notes-disposition-burn-down', track: 'notes-integration', status: 'queued', label: 'Burn down all 556 note dispositions' },
  ],
};

global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = freezeObject({
  schemaVersion: '1.13.0',
  total: 556,
  reviewed: 135,
  remining: freezeObject({
    sourceRequired: true,
    negativeProofRequired: true,
    actualPathRequired: true,
    noNewWrappers: true,
    dimensions: freezeList(dimensions),
    allowedOutcomes: freezeList(outcomes),
    auditRows: freezeList([]),
    remineAuditRows: freezeList([]),
    audited: 63,
    reminedNoteCount: 63,
    oldRubricReviewed: 135,
    oldRubricOnlyRemaining: 72,
    outcomeCounts: zeroCounts,
    dimensionCounts,
    redFlags: freezeList([
      freezeObject({ id: 'invalid-negative-proof', label: 'Invalid negative proof', count: 0 }),
      freezeObject({ id: 'covered-missing-owner-id', label: 'Covered missing owner', count: 0 }),
      freezeObject({ id: 'queued-missing-gap-id', label: 'Queued missing gap', count: 0 }),
      freezeObject({ id: 'added-missing-path-proof', label: 'Added missing path proof', count: 0 }),
    ]),
  }),
});

global.OBOL_INTAKE_V21 = {
  analyzeTerminal(text) {
    return { activities: [], baselineText: String(text || '').slice(0, 24) };
  },
};

global.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__ = true;
require('../data/current-release.js');
assert(global.__OBOL_DEFERRED_PRODUCT_HARDENING_EXTENSIONS__.includes('data/product-hardening/credential-dump-remining-v9.61.js'), 'current release should defer the v9.61 extension for isolated test loading');
const packet = require('../data/product-hardening/credential-dump-remining-v9.61.js');

assert(global.OBOL_CURRENT_RELEASE, 'current release should be published');
assert.strictEqual(global.OBOL_CURRENT_RELEASE.label, 'v9.61');
assert.strictEqual(global.OBOL_CURRENT_RELEASE.version, '9.61.0');
assert(global.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/credential-dump-remining-v9.61.js'), 'current release must advertise the v9.61 credential dump re-mining extension');

assert.strictEqual(packet.status, 'live-integrated');
assert.strictEqual(packet.wave, 'v9.61-credential-dump-remine');
assert.strictEqual(packet.queueItemId, 'notes-mechanic-backfill');
assert.strictEqual(packet.sourceConfidence.schemaVersion, 2);
assert.strictEqual(packet.sourceConfidence.reviewTextPolicy, 'complete_cleaned_text');
assert.strictEqual(packet.sourceConfidence.truncationPolicy, 'none');
assert.strictEqual(packet.sourceConfidence.expectedNoteCount, 556);
assert.strictEqual(packet.sourceConfidence.packetCount, 29);
assert(packet.sourceConfidence.sourcePackets.includes('data/review-packets/manifest.json'));
assert(packet.sourceConfidence.sourcePackets.includes('data/review-packets/htb-penetration-tester-01.json'));
assert.deepStrictEqual(packet.sourceConfidence.selectedNoteIds, ['htb-penetration-tester-bfe04186f42f682f']);

for (const id of [
  'note-lsass-dump-artifact-proof-chain',
  'note-offline-parser-output-needs-material-classification',
  'note-hash-crack-does-not-prove-service-access',
]) {
  assert(packet.publicNotes.some((note) => note.id === id), 'public note missing ' + id);
  assert(global.OBOL_NOTE_INTEGRATION.publicFieldNotes.some((note) => note.id === id), 'live note integration missing ' + id);
}

assert.strictEqual(packet.remineAuditRows.length, 1);
const row = packet.remineAuditRows[0];
assert.strictEqual(row.noteId, 'htb-penetration-tester-bfe04186f42f682f');
assert.strictEqual(row.originalSourceReread, true);
for (const dim of dimensions) {
  assert(row.decisions[dim], 'audit row missing decision ' + dim);
  assert(outcomes.includes(row.decisions[dim].outcome), 'audit row uses invalid outcome for ' + dim);
  if (row.decisions[dim].outcome === 'added') {
    assert(row.decisions[dim].actualPathIntegrated === true || row.decisions[dim].operatorFacing === false, 'added outcome must prove path integration for ' + dim);
    assert(row.decisions[dim].proofRefs || row.decisions[dim].changedOwners || row.decisions[dim].analyzerIds || row.decisions[dim].reportIds, 'added outcome needs proof refs for ' + dim);
  }
  if (row.decisions[dim].outcome === 'covered') assert(row.decisions[dim].ownerIds && row.decisions[dim].ownerIds.length, 'covered outcome needs owner ids for ' + dim);
  if (row.decisions[dim].outcome === 'private-only') assert(row.decisions[dim].reason && row.decisions[dim].reason.length > 20, 'private-only outcome needs public-safe reason for ' + dim);
}

const syntheticOutput = [
  'Created LSASS minidump artifact named sample.dmp for offline review.',
  'pypykatz lsa minidump sample.dmp',
  '== LogonSession ==',
  '== MSV ==',
  'Username: operator',
  'Domain: LAB',
  'NT: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  'Hash.Mode........: 1000',
  'Status...........: Cracked',
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:[redacted]',
].join('\n');
const analysis = packet.analyzeCredentialDumpOutput(syntheticOutput);
assert(analysis.matches.includes('lsass-dump-artifact'), 'analyzer should detect LSASS dump artifact');
assert(analysis.matches.includes('offline-parser-output'), 'analyzer should detect offline parser output');
assert(analysis.matches.includes('nt-hash-material'), 'analyzer should detect NT material');
assert(analysis.matches.includes('hash-crack-result'), 'analyzer should detect hash cracking result');
assert(analysis.outcomeFacts.includes('credential.lsass_dump_artifact_observed'));
assert(analysis.outcomeFacts.includes('credential.offline_dump_parser_output_observed'));
assert(analysis.outcomeFacts.includes('credential.nt_hash_material_observed'));
assert(analysis.outcomeFacts.includes('credential.hash_crack_plaintext_candidate_observed'));
assert(!analysis.outcomeFacts.includes('credential.validation_success_scoped'), 'cracked material must not become access proof');
assert(analysis.warnings.some((warning) => /scoped authentication proof/i.test(warning)), 'analyzer should warn that material still needs validation');
assert(!/a{32}/.test(analysis.redactedSnippet), 'redacted snippet should not retain hash material');

const merged = global.OBOL_INTAKE_V21.analyzeTerminal(syntheticOutput);
assert(merged.credentialDumpEvidence61, 'Evidence ingestion wrapper should attach v9.61 analysis');
assert(merged.activities.some((activity) => activity.cardId === 'credential-dump-proof-chain'), 'Evidence ingestion should add credential dump activity');
assert(merged.credentialDumpEvidence61.outcomeFacts.includes('credential.hash_crack_plaintext_candidate_observed'), 'Evidence ingestion should expose hash-crack fact');
assert(!merged.credentialDumpEvidence61.outcomeFacts.includes('credential.validation_success_scoped'), 'Evidence ingestion should not promote crack to access');

const progress = global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining;
assert.strictEqual(progress.reminedNoteCount, 64, 'progress should advance by one selected old-rubric note');
assert.strictEqual(progress.oldRubricOnlyRemaining, 71, 'old-rubric remaining should shrink by one');
assert(progress.auditRows.some((audit) => audit.noteId === 'htb-penetration-tester-bfe04186f42f682f'), 'progress should include the v9.61 audit row');
assert(progress.evidenceIngestionBuilt.includes('credential-dump-proof-chain'), 'progress should record Evidence ingestion build');

const queueItem = global.OBOL_PRODUCT_HARDENING.items.find((item) => item.id === 'notes-mechanic-backfill');
assert(queueItem, 'notes-mechanic-backfill should exist');
assert.strictEqual(queueItem.status, 'queued', 'partial one-note progress must not close the full re-mining gate');
assert.strictEqual(queueItem.latestPartialRemineWave, 'v9.61-credential-dump-remine');

const serialized = JSON.stringify({ packet, progress: { latestSelectorBatchProgress: progress.latestSelectorBatchProgress }, merged });
const forbidden = [
  /HTB\{[^}]+\}/i,
  /flag\{[^}]+\}/i,
  /BEGIN OPENSSH PRIVATE KEY/i,
  /password\s*=/i,
  /document\.cookie/i,
  /\\\\10\./,
  /[A-Fa-f0-9]{32}:\S+/,
];
for (const pattern of forbidden) assert(!pattern.test(serialized), 'v9.61 public data leaked forbidden material matching ' + pattern);

console.log('v9.61 credential dump re-mining checks passed');
