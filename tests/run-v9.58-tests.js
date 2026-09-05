'use strict';

const assert = require('assert');

require('../data/current-release.js');
const packet = require('../data/product-hardening/credentials-auth-remining-v9.58.js');

assert(global.OBOL_CURRENT_RELEASE, 'current release should be published');
assert.strictEqual(global.OBOL_CURRENT_RELEASE.label, 'v9.58');
assert.strictEqual(global.OBOL_CURRENT_RELEASE.version, '9.58.0');
assert(
  Array.isArray(global.OBOL_CURRENT_RELEASE.productHardeningExtensions) &&
    global.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/credentials-auth-remining-v9.58.js'),
  'current release should advertise the credentials/auth product-hardening extension'
);
assert(global.OBOL_RELEASE_IDENTITY && typeof global.OBOL_RELEASE_IDENTITY.loadProductHardeningExtensions === 'function', 'release identity should expose the extension loader');

assert.strictEqual(packet.status, 'live-integrated');
assert.strictEqual(packet.wave, 'v9.58-credentials-auth-remine');
assert.strictEqual(packet.sourceRoute, 'platocres/obol-source-notes@agent/review-packets');
assert.strictEqual(packet.sourceConfidence.schemaVersion, 2);
assert.strictEqual(packet.sourceConfidence.reviewTextPolicy, 'complete_cleaned_text');
assert.strictEqual(packet.sourceConfidence.truncatedNoteCount, 0);
assert.strictEqual(packet.sourceConfidence.windowMarkerCount, 0);
assert.strictEqual(packet.sourceConfidence.noteCount, 556);
assert.strictEqual(packet.sourceConfidence.packetCount, 29);
assert(packet.sourcePackets.includes('data/review-packets/manifest.json'));
assert(packet.sourcePackets.includes('data/review-packets/htb-penetration-tester-11.json'));
assert(packet.sourcePackets.includes('data/review-packets/offsec-pen-200-02.json'));

const requiredRefs = [
  'htb-penetration-tester-f31e4279342a81b5',
  'offsec-pen-200-07a86d1907bc1ee1',
  'offsec-pen-200-b1db6481c5b90a95',
  'htb-penetration-tester-6486887de1050834',
  'htb-penetration-tester-4f28d95210c84f5a',
  'offsec-pen-200-30d7d51a9fb1a2b6',
];
for (const ref of requiredRefs) {
  assert(packet.findings.some((finding) => finding.sourceRef === ref), 'missing re-mined source ref ' + ref);
  assert(packet.remineAuditRows.some((row) => row.noteId === ref), 'missing re-mining audit row ' + ref);
}

const requiredCards = [
  'note-credential-source-validation-chain',
  'note-auth-material-routing-proof',
  'note-challenge-response-proof-boundary',
  'note-auth-rate-policy-validation-boundary',
  'note-protected-secret-lineage-boundary',
];
for (const id of requiredCards) assert(packet.liveCards.includes(id), 'missing live card id ' + id);
assert(packet.liveRoutes.includes('#/path'));
assert(packet.liveRoutes.includes('#/dashboard'));

const requiredDimensions = [
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
  assert.strictEqual(row.originalSourceReread, true, 'audit row must prove source re-read');
  for (const dim of requiredDimensions) assert(row.decisions[dim] && row.decisions[dim].outcome, 'audit row missing dimension ' + dim);
}

const serialized = JSON.stringify(packet);
const forbidden = [
  /<script/i,
  /document\.cookie/i,
  /nc\s+-l/i,
  /python3?\s+-m\s+http\.server/i,
  /password\s*=/i,
  /flag\{[^}]+\}/i,
  /BEGIN OPENSSH PRIVATE KEY/i,
];
for (const pattern of forbidden) assert(!pattern.test(serialized), 'packet leaked forbidden public material matching ' + pattern);

global.OBOL_NOTE_INTEGRATION = Object.freeze({
  schemaVersion: '1.10.0',
  ledger: Object.freeze({ expectedNotes: 556, reviewedCount: 136, dispositionCounts: Object.freeze({ modeled: 102 }) }),
  publicFieldNotes: Object.freeze([
    Object.freeze({ id: 'note-credential-source-validation-chain', title: 'stale', toolIds: Object.freeze([]), pathIds: Object.freeze([]) }),
  ]),
  packetReviews: Object.freeze({}),
  validate: () => [],
});
global.OBOL_PRODUCT_HARDENING = {
  tracks: [{ id: 'notes-integration', complete: 55, total: 556 }],
  items: [
    { id: 'notes-remine-xss-session', track: 'notes-integration', status: 'queued' },
    { id: 'notes-remine-credentials-auth', track: 'notes-integration', status: 'queued' },
  ],
};
global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = Object.freeze({
  schemaVersion: '1.8.0',
  remining: Object.freeze({
    auditRows: Object.freeze([]),
    dimensions: Object.freeze([]),
    allowedOutcomes: Object.freeze([]),
    reminedThemes: Object.freeze([]),
    completedReminedThemes: Object.freeze(['xss-session']),
    queuedProductGaps: Object.freeze([]),
    redFlags: Object.freeze([]),
  }),
});

const result = packet.integrate();
assert.strictEqual(result.notesIntegrated, true);
assert.strictEqual(result.queueIntegrated, true);
assert.strictEqual(result.progressIntegrated, true);
assert(global.OBOL_NOTE_INTEGRATION.__credentialsAuthReminingV958, 'note integration should be marked with v9.58 credentials/auth remine');
assert(global.OBOL_NOTE_INTEGRATION.packetReviews['credentials-auth-remine'], 'credentials/auth remine packet review missing');
assert.strictEqual(global.OBOL_NOTE_INTEGRATION.packetReviews['credentials-auth-remine'].status, 'complete');
assert(global.OBOL_NOTE_INTEGRATION.publicFieldNotes.find((note) => note.id === 'note-auth-material-routing-proof'), 'routing proof note missing');
assert(global.OBOL_NOTE_INTEGRATION.publicNotesForTool('hashcat').some((note) => note.id === 'note-challenge-response-proof-boundary'), 'hashcat notes should include challenge-response proof boundary');
assert(global.OBOL_NOTE_INTEGRATION.publicNotesForPath('path').some((note) => note.id === 'note-protected-secret-lineage-boundary'), 'path notes should include protected-secret lineage');
assert.strictEqual(global.OBOL_PRODUCT_HARDENING.items.find((item) => item.id === 'notes-remine-xss-session').status, 'complete');
assert.strictEqual(global.OBOL_PRODUCT_HARDENING.items.find((item) => item.id === 'notes-remine-credentials-auth').status, 'complete');
assert(global.OBOL_PRODUCT_HARDENING.items.find((item) => item.id === 'gap-auth-validation-safety-slot'), 'validation safety gap should be queued');
assert(global.OBOL_PRODUCT_HARDENING.items.find((item) => item.id === 'gap-auth-material-scope-analyzer'), 'auth material analyzer gap should be queued');
assert.strictEqual(global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.latestWave, 'v9.58-credentials-auth-remine');
assert(global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.completedReminedThemes.includes('credentials-auth'));
assert(global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.latestOutputs.includes('note-auth-material-routing-proof'));
assert(global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.queuedProductGaps.includes('gap-auth-material-scope-analyzer'));

console.log('v9.58 credentials/auth re-mining live integration checks passed');
