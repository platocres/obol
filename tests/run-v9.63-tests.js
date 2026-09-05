'use strict';

const assert = require('assert');

function freezeList(list) { return Object.freeze((list || []).slice()); }
function freezeObject(value) { return Object.freeze(value || {}); }

const publicFieldNotes = freezeList([
  freezeObject({ id: 'note-lsass-dump-artifact-proof-chain', title: 'Treat LSASS dumping as an artifact proof chain', body: 'A Windows memory dump is not credential access by itself. Keep dump, parse, material class, cracking, and validation as separate proof stages.', toolIds: freezeList(['pypykatz']), pathIds: freezeList(['path']) }),
  freezeObject({ id: 'note-offline-parser-output-needs-material-classification', title: 'Classify offline parser output before routing it', body: 'Parser output is not proof of reusable material until a concrete class appears.', toolIds: freezeList(['pypykatz']), pathIds: freezeList(['path']) }),
  freezeObject({ id: 'note-hash-crack-does-not-prove-service-access', title: 'A cracked hash still needs scoped validation', body: 'Recovered material still needs scoped authentication proof.', toolIds: freezeList(['hashcat']), pathIds: freezeList(['path']) }),
  freezeObject({ id: 'note-client-controls-are-request-shaping-clues', title: 'Client-side controls are request-shaping clues', body: 'Client-side mutation does not prove backend authorization failure.', toolIds: freezeList(['Burp Suite']), pathIds: freezeList(['path']) }),
  freezeObject({ id: 'note-encoded-cookie-transform-order', title: 'Preserve transform order for encoded cookies', body: 'Decode in observed order, mutate the inner value, then rebuild in reverse order.', toolIds: freezeList(['CyberChef']), pathIds: freezeList(['path']) }),
  freezeObject({ id: 'note-capture-tool-http-before-debugging', title: 'Capture generated HTTP before debugging tools', body: 'Capture the exact HTTP emitted by a scanner or framework before changing assumptions.', toolIds: freezeList(['Metasploit']), pathIds: freezeList(['path']) }),
]);

global.OBOL_NOTE_INTEGRATION = freezeObject({ publicFieldNotes });
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

global.viewCard = function viewCard(id) {
  const card = global.liveCardById(id);
  return card ? card.title : 'Unknown card';
};

global.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__ = true;
require('../data/current-release.js');
assert(global.__OBOL_DEFERRED_PRODUCT_HARDENING_EXTENSIONS__.includes('data/product-hardening/visible-remine-cards-v9.63.js'), 'current release should defer the v9.63 visible-card extension for isolated test loading');
const currentParts = String(global.OBOL_CURRENT_RELEASE.version || '').split('.').map((part) => Number(part));
assert.strictEqual(currentParts[0], 9, 'current release major should remain v9');
assert(currentParts[1] >= 63, 'current release should be v9.63 or newer');
assert(global.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/visible-remine-cards-v9.63.js'), 'current release must advertise the v9.63 visible-card extension');

const packet = require('../data/product-hardening/visible-remine-cards-v9.63.js');
assert.strictEqual(packet.status, 'live-integrated');
assert.strictEqual(packet.wave, 'v9.63-visible-remine-cards');

const expectedCards = [
  'credential-dump-proof-chain',
  'web-proxy-transform-proof-chain',
  'web-client-controls',
  'encoded-parameter-review',
  'tool-generated-http-review',
];
assert.deepStrictEqual(packet.cardIds, expectedCards);
assert.deepStrictEqual(packet.validate(), []);
for (const id of expectedCards) {
  const card = global.liveCardById(id);
  assert(card, 'card route should resolve ' + id);
  assert(card.title && card.hypothesis, 'card should have visible title and hypothesis ' + id);
  assert(Array.isArray(card.commands), 'card should render through the normal card renderer without command assumptions ' + id);
  assert(Array.isArray(card.expected) && card.expected.length, 'card should explain expected proof signals ' + id);
  assert.notStrictEqual(global.viewCard(id), 'Unknown card', 'viewCard should resolve ' + id);
}

assert(global.__testLanes.some((lane) => lane.lane === 'web-proxy-transform' && lane.cards.length >= 4), 'web proxy cards should be grouped in a visible lane');
assert(global.__testLanes.some((lane) => lane.lane === 'credential-attacks' && lane.cards.some((card) => card.id === 'credential-dump-proof-chain')), 'credential card should be grouped in credential lane');

const serialized = JSON.stringify({ packet, lanes: global.__testLanes, cards: global.__testCards });
const forbidden = [
  /HTB\{[^}]+\}/i,
  /flag\{[^}]+\}/i,
  /94\.237\./,
  /3dac93b8cd250aa8c1a36fffc79a17a/i,
  /4d325268597a6b7a596a686a5a4449314d4746684f474d7859544d325a6d5a6d597a63355954453359513d3d/i,
  /64f12cddaa88057e06a81b54e73b949b/i,
];
for (const pattern of forbidden) assert(!pattern.test(serialized), 'v9.63 visible cards leaked forbidden material matching ' + pattern);

console.log('v9.63 visible re-mined card route checks passed');
