'use strict';

const assert = require('assert');

function buildBaseCard(id) {
  return {
    id,
    title: id,
    lane: 'test',
    prereq: { any: ['service.http'] },
    produces: ['tested'],
    expected: ['baseline'],
    commands: [],
    tools: [],
  };
}

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

const lane = { lane: 'test', title: 'Test', phase: 'Test', cards: cardIds.map(buildBaseCard) };
global.OBOL_LANES = [lane];
global.CARDS = Object.fromEntries(lane.cards.map((card) => [card.id, card]));
global.liveCardById = (id) => global.CARDS[id] || null;

global.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__ = true;
const current = require('../data/current-release.js');
assert(current.release || global.OBOL_CURRENT_RELEASE, 'current release should load');
assert.strictEqual(global.OBOL_CURRENT_RELEASE.label, 'v9.66');
assert(Array.from(global.OBOL_CURRENT_RELEASE.productHardeningExtensions).includes('data/product-hardening/actionable-card-contract-v9.66.js'));

const contract = require('../data/product-hardening/actionable-card-contract-v9.66.js');
assert(contract.ACTIONABLE_IDS.length >= 12, 'expected recent note-derived card set');
assert(cardIds.every((id) => contract.ACTIONABLE_IDS.includes(id)), 'all note-derived cards should be covered');

const result = global.OBOL_ACTIONABLE_CARD_CONTRACT_V966;
assert(result, 'contract should publish runtime status');
assert.strictEqual(result.status, 'live-integrated', JSON.stringify(result.failures));
assert.deepStrictEqual(Array.from(result.missing), []);

for (const id of cardIds) {
  const card = global.CARDS[id];
  assert(card, id + ' missing');
  assert(card.actionabilityV966, id + ' missing actionability stamp');
  assert(card.operatorGoal && card.operatorGoal.length > 20, id + ' missing useful operatorGoal');
  const hasCommands = Array.isArray(card.commands) && card.commands.length && card.commands.every((cmd) => cmd.tool && cmd.run && cmd.useWhen && cmd.expected);
  const hasGui = Array.isArray(card.guiSteps) && card.guiSteps.length >= 4;
  assert(hasCommands || hasGui, id + ' needs command templates or concrete GUI steps');
  assert(Array.isArray(card.expectedEvidence) && card.expectedEvidence.length >= 3, id + ' needs expected evidence');
  assert(Array.isArray(card.failureModes) && card.failureModes.length >= 2, id + ' needs failure modes');
  assert(Array.isArray(card.nextSteps) && card.nextSteps.length >= 2, id + ' needs next steps');
  assert.strictEqual(card.referenceOnly, false, id + ' must not be referenceOnly');
}

const proxyCard = global.CARDS['tool-generated-http-review'];
assert(proxyCard.commands.some((cmd) => /127\.0\.0\.1:8080/.test(cmd.run)), 'tool HTTP card should include concrete proxy command guidance');
assert(proxyCard.expectedEvidence.some((item) => /captured HTTP/i.test(item)), 'tool HTTP card should tell user what evidence to paste back');

const fuzzerCard = global.CARDS['burp-intruder-fuzzing-workflow'];
assert(fuzzerCard.guiSteps.some((step) => /Clear automatic positions/i.test(step)), 'Burp card should include concrete GUI workflow');
assert(fuzzerCard.commands.some((cmd) => cmd.tool === 'ffuf'), 'Burp card should include CLI fallback');

const serialized = JSON.stringify({ result, cards: global.CARDS });
assert(!/HTB\{[^}]+\}/i.test(serialized), 'must not leak flags');
assert(!/94\.237\./.test(serialized), 'must not leak private lab host examples');
assert(!/burp_1n7rud3r/i.test(serialized), 'must not leak answer strings');

console.log('v9.66 actionable card contract checks passed');
