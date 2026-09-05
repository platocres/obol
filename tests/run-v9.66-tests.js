'use strict';

const assert = require('assert');

const cardIds = [
  'credential-dump-proof-chain',
  'web-proxy-transform-proof-chain',
  'web-client-controls',
  'web-authz-boundaries',
  'encoded-parameter-review',
  'tool-generated-http-review',
  'pass-the-hash-proof-chain',
  'pth-remote-exec-artifacts',
  'pth-token-filtering-check',
  'burp-intruder-fuzzing-workflow',
  'fuzzer-payload-position-review',
  'fuzzer-result-delta-review',
];
function releaseAtLeast(label, major, minor) {
  const match = String(label || '').match(/^v?(\d+)\.(\d+)/);
  if (!match) return false;
  const foundMajor = Number(match[1]);
  const foundMinor = Number(match[2]);
  return foundMajor > major || (foundMajor === major && foundMinor >= minor);
}
function baseCard(id) { return { id, title: id, lane: 'test', prereq: { any: ['service.http'] }, produces: ['tested'], expected: ['baseline'], commands: [], tools: [] }; }
const lane = { lane: 'test', title: 'Test', phase: 'Test', cards: cardIds.map(baseCard) };
global.OBOL_LANES = [lane];
global.CARDS = Object.fromEntries(lane.cards.map((card) => [card.id, card]));
global.liveCardById = (id) => global.CARDS[id] || null;

global.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__ = true;
require('../data/current-release.js');
assert.ok(releaseAtLeast(global.OBOL_CURRENT_RELEASE.label, 9, 66), 'current release should be v9.66 or newer');
assert(Array.from(global.OBOL_CURRENT_RELEASE.productHardeningExtensions).includes('data/product-hardening/actionable-card-contract-v9.66.js'));

const packet = require('../data/product-hardening/actionable-card-contract-v9.66.js');
assert(cardIds.every((id) => packet.ACTIONABLE_IDS.includes(id)), 'all recent note-derived cards should be covered by the historical v9.66 actionability data');
const result = global.OBOL_ACTIONABLE_CARD_CONTRACT_V966;
assert(result, 'runtime contract status should be published');
assert.strictEqual(result.status, 'live-integrated', JSON.stringify(result.failures));

for (const id of cardIds) {
  const card = global.CARDS[id];
  assert(card.actionabilityV966, `${id} missing actionability stamp`);
  assert(card.operatorGoal && card.operatorGoal.length > 25, `${id} missing operator goal`);
  const hasCommands = Array.isArray(card.commands) && card.commands.length && card.commands.every((cmd) => cmd.tool && cmd.run && cmd.useWhen && cmd.expected);
  const hasGui = Array.isArray(card.guiSteps) && card.guiSteps.length >= 4;
  assert(hasCommands || hasGui, `${id} must have commands or concrete GUI steps`);
  assert(Array.isArray(card.expectedEvidence) && card.expectedEvidence.length >= 3, `${id} needs expectedEvidence`);
  assert(Array.isArray(card.failureModes) && card.failureModes.length >= 2, `${id} needs failureModes`);
  assert(Array.isArray(card.nextSteps) && card.nextSteps.length >= 2, `${id} needs nextSteps`);
  assert.strictEqual(card.referenceOnly, false, `${id} must not be referenceOnly inside the v9.66 historical actionability fixture`);
}
assert(global.CARDS['tool-generated-http-review'].commands.some((cmd) => /127\.0\.0\.1:8080/.test(cmd.run)), 'tool HTTP review should include proxy command guidance');
assert(global.CARDS['burp-intruder-fuzzing-workflow'].guiSteps.some((step) => /clear automatic positions/i.test(step)), 'Burp card should include concrete GUI workflow');
assert(global.CARDS['burp-intruder-fuzzing-workflow'].commands.some((cmd) => cmd.tool === 'ffuf'), 'Burp card should include CLI fallback');
const serialized = JSON.stringify(global.CARDS);
assert(!/HTB\{[^}]+\}/i.test(serialized), 'must not leak flags');
assert(!/94\.237\./.test(serialized), 'must not leak private lab host examples');
assert(!/burp_1n7rud3r/i.test(serialized), 'must not leak answer strings');
console.log('v9.66 actionable card contract checks passed');
