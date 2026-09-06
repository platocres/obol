'use strict';

const assert = require('assert');

const REQUIRED_DIMENSIONS = Object.freeze([
  'path-bindings', 'tool-cards', 'gui-controls', 'scripts-one-liners',
  'command-templates', 'terminal-analyzers', 'evidence-expectations',
  'path-movement', 'lesson-boxes', 'examples', 'troubleshooting',
  'cleanup', 'report-guidance', 'product-mechanics', 'product-gaps',
  'orange-baseline',
]);

function resetGlobals() {
  global.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__ = true;
  global.__OBOL_DEFERRED_PRODUCT_HARDENING_EXTENSIONS__ = undefined;
  global.OBOL_LANES = [];
  global.LANES = global.OBOL_LANES;
  global.CARDS = {};
  global.OBOL_NOTE_INTEGRATION = { publicFieldNotes: [] };
  global.OBOL_PRODUCT_HARDENING = { items: [{ id: 'notes-mechanic-backfill', status: 'queued' }] };
  global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = {
    remining: {
      sourceTotal: 135,
      reviewed: 135,
      oldRubricReviewed: 135,
      dimensions: [],
      allowedOutcomes: [],
      auditRows: [],
      remineAuditRows: [],
      audited: 66,
      reminedNoteCount: 66,
      oldRubricOnlyRemaining: 69,
    },
  };
  global.OBOL_INTAKE_V21 = {
    analyzeTerminal() { return { activities: [] }; },
  };
}

function card(id) {
  if (global.CARDS && global.CARDS[id]) return global.CARDS[id];
  for (const lane of global.OBOL_LANES || []) for (const entry of lane.cards || []) if (entry.id === id) return entry;
  return null;
}

function versionAtLeast(actual, minimum) {
  const a = String(actual || '').replace(/^v/i, '').split('.').map(Number);
  const b = String(minimum || '').replace(/^v/i, '').split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    const diff = (a[i] || 0) - (b[i] || 0);
    if (diff) return diff > 0;
  }
  return true;
}

resetGlobals();
require('../data/current-release.js');
assert.ok(versionAtLeast(global.OBOL_CURRENT_RELEASE.label, 'v9.65'), 'current release should be v9.65 or newer');
assert.ok(Array.from(global.__OBOL_DEFERRED_PRODUCT_HARDENING_EXTENSIONS__).includes('data/product-hardening/burp-intruder-remining-v9.65.js'));

const packet = require('../data/product-hardening/burp-intruder-remining-v9.65.js');
assert.strictEqual(packet.sourceConfidence.reviewTextPolicy, 'complete_cleaned_text');
assert.strictEqual(packet.sourceConfidence.truncationPolicy, 'none');
assert.deepStrictEqual(Array.from(packet.sourceConfidence.selectedNoteIds), ['htb-penetration-tester-decf23d473e0762b']);
assert.strictEqual(packet.sourceConfidence.selectorBatch, 'notes-batch-old-rubric-reviewed-remine-001');

for (const id of [
  'note-fuzzer-position-before-payloads',
  'note-payload-processing-is-proof-state',
  'note-fuzzer-delta-is-triage-not-impact',
  'note-burp-community-throttle-switch-context',
]) {
  assert.ok(global.OBOL_NOTE_INTEGRATION.publicFieldNotes.some((note) => note.id === id), 'missing public note ' + id);
}

for (const id of packet.cardIds) {
  const live = card(id);
  assert.ok(live, 'missing live card ' + id);
  assert.ok(live.lane, 'card must have lane ' + id);
  assert.ok(live.prereq, 'card must have prereq ' + id);
  assert.ok(Array.isArray(live.produces) && live.produces.length, 'card must produce facts ' + id);
  assert.ok(Array.isArray(live.expected) && live.expected.length, 'card must list expected proof ' + id);
  assert.ok(!live.sourceMinedRouteGuard64, 'v9.65 card must not be generic route-guard fallback ' + id);
}

const audit = packet.remineAuditRows[0];
assert.strictEqual(audit.noteId, 'htb-penetration-tester-decf23d473e0762b');
for (const dimension of REQUIRED_DIMENSIONS) {
  assert.ok(audit.decisions[dimension], 'missing audit dimension ' + dimension);
  assert.ok(['added', 'covered', 'queued', 'private-only', 'not-applicable', 'blocked'].includes(audit.decisions[dimension].outcome), 'bad outcome for ' + dimension);
}

const sample = 'Burp Intruder Payload Positions §DIRECTORY§ Payload Processing URL-encode Grep Match Status Length /admin 200 1024 words Community Version 1 request per second http://94.237.58.230:44303/admin/2010.html Cookie: PHPSESSID=abcdef123456 HTB{burp_1n7rud3r_fuzz3r!}';
const analysis = packet.analyzeWebFuzzerOutput(sample);
assert.ok(analysis.outcomeFacts.includes('web.fuzzer_workflow_observed'));
assert.ok(analysis.outcomeFacts.includes('web.fuzzer_payload_position_observed'));
assert.ok(analysis.outcomeFacts.includes('web.fuzzer_payload_transform_observed'));
assert.ok(analysis.outcomeFacts.includes('web.fuzzer_response_delta_observed'));
assert.ok(analysis.outcomeFacts.includes('web.fuzzer_hit_candidate_observed'));
assert.strictEqual(analysis.recommendedNextState, 'manual-replay-fuzzer-candidate');

console.log('v9.65 Burp Intruder re-mining checks passed.');
