'use strict';

const assert = require('assert');

const packet = require('../data/product-hardening/xss-session-remining-v9.57.js');

assert.strictEqual(packet.wave, 'v9.57-xss-session-remine');
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

const dimensions = new Map(packet.dimensionAudit.map((dimension) => [dimension.dimension, dimension.result]));
assert.strictEqual(dimensions.get('path-bindings'), 'added');
assert.strictEqual(dimensions.get('gui-controls'), 'queued');
assert.strictEqual(dimensions.get('terminal-analyzers'), 'covered');
assert.strictEqual(dimensions.get('lesson-boxes'), 'added');
assert.strictEqual(dimensions.get('cleanup'), 'queued');

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

console.log('v9.57 XSS/session re-mining proof checks passed');
