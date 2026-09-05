'use strict';

const assert = require('assert');

function freezeList(list) { return Object.freeze((list || []).slice()); }
function freezeObject(value) { return Object.freeze(value || {}); }

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

global.OBOL_NOTE_INTEGRATION = freezeObject({
  publicFieldNotes: freezeList([]),
  reviewedDispositions: freezeList([
    freezeObject({ noteId: 'htb-penetration-tester-bfe04186f42f682f', disposition: 'modeled' }),
    freezeObject({ noteId: 'htb-penetration-tester-120948f3c1b3b125', disposition: 'modeled' }),
    freezeObject({ noteId: 'htb-penetration-tester-29b80edb4523461f', disposition: 'modeled' }),
  ]),
  validate: () => [],
});

global.__testCards = {};
global.__testLanes = [];
global.liveCardById = function liveCardById(id) {
  if (global.__testCards[id]) return global.__testCards[id];
  for (const lane of global.__testLanes) for (const card of lane.cards || []) if (card && card.id === id) return card;
  return null;
};
global.laneById = function laneById(id, title, phase) {
  let lane = global.__testLanes.find((entry) => entry && entry.lane === id);
  if (!lane) {
    lane = { lane: id, title: title || id, phase: phase || title || id, cards: [] };
    global.__testLanes.push(lane);
  }
  if (!Array.isArray(lane.cards)) lane.cards = [];
  return lane;
};
global.addCardAfter = function addCardAfter(lane, afterId, card) {
  if (!lane || !card || global.liveCardById(card.id)) return false;
  card.lane = card.lane || lane.lane;
  const index = lane.cards.findIndex((entry) => entry && entry.id === afterId);
  lane.cards.splice(index >= 0 ? index + 1 : lane.cards.length, 0, card);
  global.__testCards[card.id] = card;
  return true;
};

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
    sourceTotal: 135,
    reviewed: 135,
    dimensions: freezeList(dimensions),
    allowedOutcomes: freezeList(outcomes),
    auditRows: freezeList([
      freezeObject({ noteId: 'htb-penetration-tester-bfe04186f42f682f', reviewWave: 'v9.61-credential-dump-remine', originalSourceReread: true, decisions: freezeObject({}) }),
      freezeObject({ noteId: 'htb-penetration-tester-120948f3c1b3b125', reviewWave: 'v9.62-web-proxy-transform-remine', originalSourceReread: true, decisions: freezeObject({}) }),
    ]),
    remineAuditRows: freezeList([]),
    audited: 65,
    reminedNoteCount: 65,
    oldRubricReviewed: 135,
    oldRubricOnlyRemaining: 70,
    evidenceIngestionBuilt: freezeList(['credential-dump-proof-chain', 'web-proxy-transform-proof-chain']),
  }),
});
global.OBOL_INTAKE_V21 = {
  analyzeTerminal(text) {
    return { activities: [], baselineText: String(text || '').slice(0, 24) };
  },
};

global.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__ = true;
require('../data/current-release.js');
assert(global.__OBOL_DEFERRED_PRODUCT_HARDENING_EXTENSIONS__.includes('data/product-hardening/pass-the-hash-remining-v9.64.js'), 'current release should defer the v9.64 extension for isolated test loading');
const currentParts = String(global.OBOL_CURRENT_RELEASE.version || '').split('.').map((part) => Number(part));
assert.strictEqual(currentParts[0], 9, 'current release major should remain v9');
assert(currentParts[1] >= 64, 'current release should be v9.64 or newer');
assert(global.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/pass-the-hash-remining-v9.64.js'), 'current release must advertise the v9.64 PtH extension');

const packet = require('../data/product-hardening/pass-the-hash-remining-v9.64.js');
assert.strictEqual(packet.status, 'live-integrated');
assert.strictEqual(packet.wave, 'v9.64-pass-the-hash-remine');
assert.strictEqual(packet.queueItemId, 'notes-mechanic-backfill');
assert.strictEqual(packet.sourceConfidence.schemaVersion, 2);
assert.strictEqual(packet.sourceConfidence.reviewTextPolicy, 'complete_cleaned_text');
assert.strictEqual(packet.sourceConfidence.truncationPolicy, 'none');
assert.strictEqual(packet.sourceConfidence.expectedNoteCount, 556);
assert.strictEqual(packet.sourceConfidence.packetCount, 29);
assert.deepStrictEqual(packet.sourceConfidence.selectedNoteIds, ['htb-penetration-tester-29b80edb4523461f']);
assert.strictEqual(packet.sourceConfidence.selectorBatch, 'notes-batch-old-rubric-reviewed-remine-001');

for (const id of [
  'note-pth-is-protocol-scoped-auth-material',
  'note-pth-success-is-host-and-privilege-scoped',
  'note-pth-remote-exec-leaves-artifacts',
  'note-pth-local-admin-token-filtering-check',
]) {
  assert(packet.publicNotes.some((note) => note.id === id), 'packet public note missing ' + id);
  assert(global.OBOL_NOTE_INTEGRATION.publicFieldNotes.some((note) => note.id === id), 'live public note missing ' + id);
}

for (const id of ['pass-the-hash-proof-chain', 'pth-remote-exec-artifacts', 'pth-token-filtering-check']) {
  const card = global.liveCardById(id);
  assert(card, 'live card missing ' + id);
  assert(card.title && card.hypothesis, 'card should have visible copy ' + id);
  assert(Array.isArray(card.expected) && card.expected.length, 'card should have evidence expectations ' + id);
  assert(card.prereq && Array.isArray(card.prereq.any) && card.prereq.any.length, 'card should have path prereqs ' + id);
  assert(Array.isArray(card.produces) && card.produces.length, 'card should produce follow-on facts ' + id);
}
assert(global.liveCardById('pass-the-hash-proof-chain').commands.length >= 3, 'main PtH card should include placeholder-based command templates');

assert.strictEqual(packet.remineAuditRows.length, 1);
const row = packet.remineAuditRows[0];
assert.strictEqual(row.noteId, 'htb-penetration-tester-29b80edb4523461f');
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
}

const syntheticOutput = [
  'nxc smb 10.0.0.10 -u operator -H aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa --local-auth',
  'SMB 10.0.0.10 445 WS01 [+] .\\operator:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa (Pwn3d!)',
  'impacket-psexec EXAMPLE/operator@10.0.0.10 -hashes :aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  '[*] Found writable share ADMIN$',
  '[*] Opening SVCManager on 10.0.0.10',
  '[*] Creating service AbCd on 10.0.0.10',
  '[+] Command executed with process id 444',
  'LocalAccountTokenFilterPolicy may affect local administrator accounts',
  'HTB{should_not_leak}',
  'password=ShouldNotLeak123!',
].join('\n');
const analysis = packet.analyzePassTheHashOutput(syntheticOutput);
const redacted = analysis.redactedSnippet || analysis.snippet || '';
assert(analysis.matches.some((match) => match.id === 'pth-attempt'), 'analyzer should detect PtH attempt');
assert(analysis.matches.some((match) => match.id === 'nt-hash-material'), 'analyzer should detect NT hash material');
assert(analysis.matches.some((match) => match.id === 'remote-admin-indicator'), 'analyzer should detect remote admin indicator');
assert(analysis.matches.some((match) => match.id === 'remote-exec-artifact'), 'analyzer should detect remote-exec artifact');
assert(analysis.matches.some((match) => match.id === 'token-filtering-or-restricted-admin'), 'analyzer should detect token filtering hints');
assert(analysis.outcomeFacts.includes('auth.pass_the_hash_attempt_observed'));
assert(analysis.outcomeFacts.includes('auth.remote_admin_indicator_observed'));
assert(analysis.outcomeFacts.includes('auth.remote_execution_artifact_observed'));
assert(['record-scoped-remote-exec-and-cleanup', 'record-remote-exec-artifacts-and-cleanup'].includes(analysis.recommendedNextState), 'analyzer should recommend scoped remote-exec cleanup');
assert(analysis.warnings.some((warning) => /Hash material is not access|Remote execution by hash leaves artifacts|scoped to the observed host/i.test(warning)), 'analyzer should warn about scope/artifacts');
assert(!/HTB\{/i.test(redacted), 'redacted snippet should not retain flags');
assert(!/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/i.test(redacted), 'redacted snippet should not retain NT hashes');
assert(!/ShouldNotLeak123/i.test(redacted), 'redacted snippet should not retain passwords');
assert(!/10\.0\.0\.10/i.test(redacted), 'redacted snippet should not retain host IPs');

const failed = packet.analyzePassTheHashOutput('evil-winrm -i 10.0.0.11 -u operator -H bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\nSTATUS_LOGON_FAILURE\nFilterAdministratorToken enabled');
assert(failed.outcomeFacts.includes('auth.failure_or_lockout_signal_observed'), 'failure should be separate evidence');
assert(failed.outcomeFacts.includes('auth.token_filtering_or_restricted_admin_observed'), 'token filtering should be separate evidence');
assert(['troubleshoot-protocol-policy-or-token-filtering', 'check-token-filtering-protocol-and-account-scope'].includes(failed.recommendedNextState), 'failure should recommend scope/policy/token-filtering troubleshooting');

const merged = global.OBOL_INTAKE_V21.analyzeTerminal(syntheticOutput);
assert(merged.passTheHashEvidence64, 'Evidence ingestion wrapper should attach v9.64 analysis');
assert(merged.activities.some((activity) => activity.cardId === 'pass-the-hash-proof-chain'), 'Evidence ingestion should add PtH proof-chain activity');
assert(merged.passTheHashEvidence64.outcomeFacts.includes('auth.remote_execution_artifact_observed'), 'Evidence ingestion should expose remote-exec artifact fact');

const progress = global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining;
assert.strictEqual(progress.sourceTotal, 135, 'progress source total should stay tied to reviewed old-rubric notes');
assert.strictEqual(progress.reviewed, 135, 'progress reviewed count should stay tied to reviewed old-rubric notes');
assert.strictEqual(progress.oldRubricReviewed, 135, 'old-rubric denominator should stay normalized');
assert.strictEqual(progress.reminedNoteCount, 66, 'progress should advance by one selected old-rubric note after v9.63');
assert.strictEqual(progress.oldRubricOnlyRemaining, 69, 'old-rubric remaining should shrink by one after v9.63');
assert(progress.auditRows.some((audit) => audit.noteId === 'htb-penetration-tester-29b80edb4523461f'), 'progress should include the v9.64 audit row');
assert(progress.evidenceIngestionBuilt.includes('pass-the-hash-proof-chain'), 'progress should record PtH Evidence ingestion build');
assert.deepStrictEqual(progress.latestSelectorBatchProgress, { selected: 3, target: 20, remainingInBatch: 17 });

const queueItem = global.OBOL_PRODUCT_HARDENING.items.find((item) => item.id === 'notes-mechanic-backfill');
assert(queueItem, 'notes-mechanic-backfill should exist');
assert.strictEqual(queueItem.status, 'queued', 'partial three-note progress must not close the full re-mining gate');
assert.strictEqual(queueItem.latestPartialRemineWave, 'v9.64-pass-the-hash-remine');

const serialized = JSON.stringify({ packet, progress: { latestSelectorBatchProgress: progress.latestSelectorBatchProgress }, merged, cards: global.__testCards });
const forbidden = [
  /HTB\{[^}]+\}/i,
  /flag\{[^}]+\}/i,
  /64F12CDDAA88057E06A81B54E73B949B/i,
  /30B3783CE2ABF1AF70F77D0660CF3453/i,
  /G3t_4CCE\$\$_V1@_PTH/i,
  /D3V1d_Fl5g_is_Her3/i,
  /JuL1\(\)_SH@re_fl@g/i,
  /JuL1\(\)_N3w_fl@g/i,
  /ShouldNotLeak123/i,
];
for (const pattern of forbidden) assert(!pattern.test(serialized), 'v9.64 public data leaked forbidden material matching ' + pattern);

console.log('v9.64 pass-the-hash re-mining checks passed');
