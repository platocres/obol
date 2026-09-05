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
  schemaVersion: '1.15.0',
  ledger: freezeObject({ expectedNotes: 556, reviewedCount: 135, dispositionCounts: freezeObject({ modeled: 102, 'private-reference-only': 28, superseded: 5 }) }),
  reviewedDispositions: freezeList([
    freezeObject({ noteId: 'htb-penetration-tester-bfe04186f42f682f', disposition: 'modeled', outputIds: freezeList(['note-lsass-proof-boundary']) }),
    freezeObject({ noteId: 'htb-penetration-tester-120948f3c1b3b125', disposition: 'modeled', outputIds: freezeList(['note-client-controls-not-auth', 'note-web-proxy-transform-order']) }),
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
  schemaVersion: '1.14.0',
  total: 556,
  reviewed: 135,
  remining: freezeObject({
    sourceRequired: true,
    negativeProofRequired: true,
    actualPathRequired: true,
    noNewWrappers: true,
    dimensions: freezeList(dimensions),
    allowedOutcomes: freezeList(outcomes),
    auditRows: freezeList([
      freezeObject({ noteId: 'htb-penetration-tester-bfe04186f42f682f', originalSourceReread: true, decisions: freezeObject({}) }),
    ]),
    remineAuditRows: freezeList([
      freezeObject({ noteId: 'htb-penetration-tester-bfe04186f42f682f', originalSourceReread: true, decisions: freezeObject({}) }),
    ]),
    audited: 64,
    reminedNoteCount: 64,
    oldRubricReviewed: 135,
    oldRubricOnlyRemaining: 71,
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
assert(global.__OBOL_DEFERRED_PRODUCT_HARDENING_EXTENSIONS__.includes('data/product-hardening/web-proxy-transform-remining-v9.62.js'), 'current release should defer the v9.62 extension for isolated test loading');
const currentParts = String(global.OBOL_CURRENT_RELEASE.version || '').split('.').map((part) => Number(part));
assert.strictEqual(currentParts[0], 9, 'current release major should remain v9');
assert(currentParts[1] >= 62, 'current release should be v9.62 or newer');
assert(global.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/web-proxy-transform-remining-v9.62.js'), 'current release must advertise the v9.62 web proxy transform re-mining extension');

const packet = require('../data/product-hardening/web-proxy-transform-remining-v9.62.js');

assert.strictEqual(packet.status, 'live-integrated');
assert.strictEqual(packet.wave, 'v9.62-web-proxy-transform-remine');
assert.strictEqual(packet.queueItemId, 'notes-mechanic-backfill');
assert.strictEqual(packet.sourceConfidence.schemaVersion, 2);
assert.strictEqual(packet.sourceConfidence.reviewTextPolicy, 'complete_cleaned_text');
assert.strictEqual(packet.sourceConfidence.truncationPolicy, 'none');
assert.strictEqual(packet.sourceConfidence.expectedNoteCount, 556);
assert.strictEqual(packet.sourceConfidence.packetCount, 29);
assert(packet.sourceConfidence.sourcePackets.includes('data/review-packets/manifest.json'));
assert(packet.sourceConfidence.sourcePackets.includes('data/review-packets/htb-penetration-tester-01.json'));
assert.deepStrictEqual(packet.sourceConfidence.selectedNoteIds, ['htb-penetration-tester-120948f3c1b3b125']);

for (const id of [
  'note-client-controls-are-request-shaping-clues',
  'note-encoded-cookie-transform-order',
  'note-capture-tool-http-before-debugging',
]) {
  assert(packet.publicNotes.some((note) => note.id === id), 'public note missing ' + id);
  assert(global.OBOL_NOTE_INTEGRATION.publicFieldNotes.some((note) => note.id === id), 'live note integration missing ' + id);
}

assert.strictEqual(packet.remineAuditRows.length, 1);
const row = packet.remineAuditRows[0];
assert.strictEqual(row.noteId, 'htb-penetration-tester-120948f3c1b3b125');
assert.strictEqual(row.originalSourceReread, true);
for (const dim of dimensions) {
  assert(row.decisions[dim], 'audit row missing decision ' + dim);
  assert(outcomes.includes(row.decisions[dim].outcome), 'audit row uses invalid outcome for ' + dim);
  if (row.decisions[dim].outcome === 'added') {
    assert(row.decisions[dim].actualPathIntegrated === true || row.decisions[dim].operatorFacing === false, 'added outcome must prove path integration for ' + dim);
    assert(row.decisions[dim].proofRefs || row.decisions[dim].changedOwners || row.decisions[dim].analyzerIds || row.decisions[dim].reportIds || row.decisions[dim].toolIds, 'added outcome needs proof refs for ' + dim);
  }
  if (row.decisions[dim].outcome === 'covered') assert(row.decisions[dim].ownerIds && row.decisions[dim].ownerIds.length, 'covered outcome needs owner ids for ' + dim);
  if (row.decisions[dim].outcome === 'private-only') assert(row.decisions[dim].reason && row.decisions[dim].reason.length > 20, 'private-only outcome needs public-safe reason for ' + dim);
  if (row.decisions[dim].outcome === 'not-applicable') assert(row.decisions[dim].reason && row.decisions[dim].reason.length > 8, 'not-applicable outcome needs public-safe reason for ' + dim);
}

const syntheticOutput = [
  '<button disabled="">Run check</button>',
  'Edited client-side markup in browser devtools and submitted the changed request.',
  'HTTP/1.1 200 OK',
  'Set-Cookie: cookie=4d325268597a6b7a596a686a5a4449314d4746684f474d7859544d325a6d5a6d597a63355954453359513d3d',
  'CyberChef From Hex, then From Base64, produced a 31-character md5-looking candidate with one missing final character.',
  'Burp Intruder payload processing added a prefix, then encoded the rebuilt value with Base64 and Hex in reverse order.',
  'Response length outlier was 1285 and needs body review.',
  'msf6 auxiliary(scanner/http/example_module) > set PROXIES http:127.0.0.1:8080',
  'Intercepted request in Burp Suite',
  'GET /candidate/administrator/index.cfm HTTP/1.1',
  'Host: 94.237.58.121:32804',
  'HTB{should_not_leak}',
].join('\n');

const analysis = packet.analyzeWebProxyTransformOutput(syntheticOutput);
assert(analysis.matches.includes('client-control-mutation'), 'analyzer should detect client-side control mutation');
assert(analysis.matches.includes('reversible-transform-chain'), 'analyzer should detect reversible transform chain');
assert(analysis.matches.includes('encoded-cookie-candidate'), 'analyzer should detect encoded cookie candidate');
assert(analysis.matches.includes('payload-processing-or-response-delta'), 'analyzer should detect payload processing / response delta');
assert(analysis.matches.includes('tool-generated-http-capture'), 'analyzer should detect tool-generated HTTP capture');
assert(analysis.outcomeFacts.includes('web.client_control_mutation_observed'));
assert(analysis.outcomeFacts.includes('web.reversible_transform_chain_observed'));
assert(analysis.outcomeFacts.includes('web.encoded_cookie_candidate_observed'));
assert(analysis.outcomeFacts.includes('web.payload_processing_or_response_delta_observed'));
assert(analysis.outcomeFacts.includes('web.tool_generated_http_capture_observed'));
assert(!analysis.outcomeFacts.includes('web.scoped_server_behavior_observed'), 'length outlier alone must not become impact proof');
assert(analysis.warnings.some((warning) => /Client-side mutation is not authorization proof/i.test(warning)), 'analyzer should warn about client-side proof limits');
assert(analysis.warnings.some((warning) => /length or size outlier is a triage lead/i.test(warning)), 'analyzer should warn about response-delta proof limits');
assert(!/HTB\{/i.test(analysis.redactedSnippet), 'redacted snippet should not retain flags');
assert(!/94\.237\.58\.121/i.test(analysis.redactedSnippet), 'redacted snippet should not retain lab target IPs');
assert(!/[A-Fa-f0-9]{40,}/.test(analysis.redactedSnippet), 'redacted snippet should not retain long encoded material');

const merged = global.OBOL_INTAKE_V21.analyzeTerminal(syntheticOutput);
assert(merged.webProxyTransformEvidence62, 'Evidence ingestion wrapper should attach v9.62 analysis');
assert(merged.activities.some((activity) => activity.cardId === 'web-proxy-transform-proof-chain'), 'Evidence ingestion should add web proxy transform activity');
assert(merged.webProxyTransformEvidence62.outcomeFacts.includes('web.tool_generated_http_capture_observed'), 'Evidence ingestion should expose captured HTTP fact');
assert(!merged.webProxyTransformEvidence62.outcomeFacts.includes('web.scoped_server_behavior_observed'), 'Evidence ingestion should not promote a response length outlier to server behavior proof');

const scoped = packet.analyzeWebProxyTransformOutput(syntheticOutput + '\nServer accepted the replayed request and returned authorized body content.');
assert(scoped.outcomeFacts.includes('web.scoped_server_behavior_observed'), 'explicit scoped server behavior should be recorded separately');

const progress = global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining;
assert.strictEqual(progress.reminedNoteCount, 65, 'progress should advance by one selected old-rubric note after v9.61');
assert.strictEqual(progress.oldRubricOnlyRemaining, 70, 'old-rubric remaining should shrink by one after v9.61');
assert(progress.auditRows.some((audit) => audit.noteId === 'htb-penetration-tester-120948f3c1b3b125'), 'progress should include the v9.62 audit row');
assert(progress.evidenceIngestionBuilt.includes('web-proxy-transform-proof-chain'), 'progress should record Evidence ingestion build');
assert.deepStrictEqual(progress.latestSelectorBatchProgress, { selected: 2, target: 20, remainingInBatch: 18 });

const queueItem = global.OBOL_PRODUCT_HARDENING.items.find((item) => item.id === 'notes-mechanic-backfill');
assert(queueItem, 'notes-mechanic-backfill should exist');
assert.strictEqual(queueItem.status, 'queued', 'partial two-note progress must not close the full re-mining gate');
assert.strictEqual(queueItem.latestPartialRemineWave, 'v9.62-web-proxy-transform-remine');

const serialized = JSON.stringify({ packet, progress: { latestSelectorBatchProgress: progress.latestSelectorBatchProgress }, merged });
const forbidden = [
  /HTB\{[^}]+\}/i,
  /flag\{[^}]+\}/i,
  /94\.237\./,
  /d154bl3d/i,
  /burp_1n7rud3r/i,
  /3dac93b8cd250aa8c1a36fffc79a17a/i,
  /4d325268597a6b7a596a686a5a4449314d4746684f474d7859544d325a6d5a6d597a63355954453359513d3d/i,
];
for (const pattern of forbidden) assert(!pattern.test(serialized), 'v9.62 public data leaked forbidden material matching ' + pattern);

console.log('v9.62 web proxy transform re-mining checks passed');
