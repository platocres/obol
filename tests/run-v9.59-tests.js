'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const publicOwners = [
  'note-linux-privesc-enumeration-leads',
  'note-linux-service-process-proof',
  'note-linux-secret-hunting-boundary',
  'note-linux-privileged-execution-preconditions',
  'note-linux-sudo-proof-boundary',
  'note-linux-suid-capability-boundary',
  'note-linux-kernel-exploit-risk-proof',
];

global.OBOL_NOTE_INTEGRATION = Object.freeze({
  schemaVersion: '1.12.0',
  ledger: Object.freeze({ expectedNotes: 556, reviewedCount: 135, dispositionCounts: Object.freeze({ modeled: 102 }) }),
  packetReviews: Object.freeze({
    'linux-privesc': Object.freeze({ id: 'linux-privesc', status: 'complete', reviewWave: 'v9.50-linux-privesc' }),
  }),
  publicFieldNotes: Object.freeze(publicOwners.map((id) => Object.freeze({ id, pathIds: Object.freeze(['path']), toolIds: Object.freeze([]) }))),
  publicNotesForPath(pathId) {
    return this.publicFieldNotes.filter((note) => (note.pathIds || []).includes(pathId));
  },
});

global.OBOL_PRODUCT_HARDENING = {
  tracks: [{ id: 'notes-integration', complete: 135, total: 556 }],
  items: [
    { id: 'notes-remine-linux-privesc', track: 'notes-integration', status: 'queued', label: 'Re-mine reviewed Linux privesc notes', priority: 86.835 },
    { id: 'notes-remine-private-only-superseded', track: 'notes-integration', status: 'queued', label: 'Re-mine private-only and superseded notes', priority: 86.836 },
  ],
};

global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = Object.freeze({
  schemaVersion: '1.11.0',
  remining: Object.freeze({
    completedReminedThemes: Object.freeze(['xss-session', 'credentials-auth']),
    latestThemes: Object.freeze(['Credentials / auth material']),
    staleQueueCorrections: Object.freeze([]),
    queuedProductGaps: Object.freeze([]),
  }),
});

require('../data/current-release.js');
const reconciliation = require('../data/product-hardening/linux-privesc-remine-reconciliation-v9.59.js');

assert(global.OBOL_CURRENT_RELEASE, 'current release should be published');
assert.strictEqual(global.OBOL_CURRENT_RELEASE.label, 'v9.59');
assert.strictEqual(global.OBOL_CURRENT_RELEASE.version, '9.59.0');
assert(global.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/linux-privesc-remine-reconciliation-v9.59.js'), 'current release must load the v9.59 reconciliation extension');
assert.strictEqual(reconciliation.status, 'live-integrated');
assert.strictEqual(reconciliation.queueItemId, 'notes-remine-linux-privesc');
assert.strictEqual(reconciliation.nextConcreteAfterReconciliation, 'notes-remine-private-only-superseded');
assert(reconciliation.liveRoutes.includes('#/dashboard'), 'queue reconciliation must be dashboard-visible');
assert(reconciliation.producedFacts.includes('product.queue.linux_privesc_remine_reconciled'), 'reconciliation should publish its product fact');

const result = reconciliation.integrate();
assert.strictEqual(result.packetComplete, true, 'Linux packet and public owners should prove the queue item is stale');
assert.strictEqual(result.queueIntegrated, true, 'queue item should be reconciled');
assert.strictEqual(result.progressIntegrated, true, 're-mining progress should be reconciled');
assert.strictEqual(result.notesIntegrated, true, 'note integration should record the reconciliation packet');

const linuxItem = global.OBOL_PRODUCT_HARDENING.items.find((item) => item.id === 'notes-remine-linux-privesc');
assert(linuxItem, 'Linux re-mining item must exist');
assert.strictEqual(linuxItem.status, 'complete', 'Linux re-mining must not remain queued after packet completion proof');
assert.strictEqual(linuxItem.completedBy, 'v9.59-linux-privesc-remine-reconciliation');
assert.strictEqual(linuxItem.proofFile, 'data/product-hardening/linux-privesc-remine-reconciliation-v9.59.js');
assert(/already complete/i.test(linuxItem.detail), 'Linux queue item should explain the stale-queue correction');

const nextItem = global.OBOL_PRODUCT_HARDENING.items.find((item) => item.id === 'notes-remine-private-only-superseded');
assert(nextItem, 'private-only/superseded item should remain the next source re-mining target');
assert.strictEqual(nextItem.status, 'queued');
assert.strictEqual(nextItem.currentAfterLinuxReconciliation, true);

assert(global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.completedReminedThemes.includes('linux-privesc'), 'progress should include the completed Linux re-mining theme');
assert.strictEqual(global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.staleConcreteEntryRemoved, 'notes-remine-linux-privesc');
assert.strictEqual(global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.nextConcreteAfterReconciliation, 'notes-remine-private-only-superseded');
assert(global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.staleQueueCorrections.includes('notes-remine-linux-privesc'));
assert(global.OBOL_NOTE_INTEGRATION.__linuxPrivescRemineReconciliationV959, 'note integration should carry the reconciliation marker');
assert(global.OBOL_NOTE_INTEGRATION.packetReviews['linux-privesc-remine-reconciliation'], 'note integration should record the reconciliation packet review');
assert.strictEqual(global.OBOL_NOTE_INTEGRATION.packetReviews['linux-privesc-remine-reconciliation'].openProductGaps.length, 0, 'reconciliation must not create parked follow-up gaps');

const releaseDoc = fs.readFileSync(path.join(__dirname, '..', 'docs', 'v9.59.md'), 'utf8');
assert(releaseDoc.includes('notes-remine-linux-privesc'), 'release doc must name the stale item');
assert(releaseDoc.includes('notes-remine-private-only-superseded'), 'release doc must name the next real item');
assert(releaseDoc.includes('does not add a new operator command, tool card, proof control, or terminal analyzer'), 'release doc must explain why no new Evidence ingestion parser is required');

const serialized = JSON.stringify(reconciliation);
const forbidden = [
  /BEGIN OPENSSH PRIVATE KEY/i,
  /flag\{[^}]+\}/i,
  /password\s*=/i,
  /document\.cookie/i,
  /nc\s+-l/i,
  /python3?\s+-m\s+http\.server/i,
  /TARGET_PATH/i,
];
for (const pattern of forbidden) assert(!pattern.test(serialized), 'v9.59 reconciliation leaked forbidden material matching ' + pattern);

console.log('v9.59 Linux privilege-escalation re-mining queue reconciliation checks passed');
