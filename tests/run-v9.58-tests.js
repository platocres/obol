'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

require('../data/current-release.js');
const packet = require('../data/product-hardening/credentials-auth-remining-v9.58.js');
const controls = require('../data/product-hardening/proof-safety-controls-v9.58.js');
const ingestion = require('../data/product-hardening/proof-safety-evidence-ingestion-v9.58.js');

assert(global.OBOL_CURRENT_RELEASE, 'current release should be published');
assert.strictEqual(global.OBOL_CURRENT_RELEASE.label, 'v9.58');
assert.strictEqual(global.OBOL_CURRENT_RELEASE.version, '9.58.0');
assert(Array.isArray(global.OBOL_CURRENT_RELEASE.productHardeningExtensions), 'current release should expose product hardening extensions');
for (const src of [
  'data/product-hardening/credentials-auth-remining-v9.58.js',
  'data/product-hardening/proof-safety-controls-v9.58.js',
  'data/product-hardening/proof-safety-evidence-ingestion-v9.58.js',
]) {
  assert(global.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes(src), 'current release should advertise ' + src);
}
assert(global.OBOL_RELEASE_IDENTITY && typeof global.OBOL_RELEASE_IDENTITY.loadProductHardeningExtensions === 'function', 'release identity should expose the extension loader');

const syncScript = fs.readFileSync(path.join(__dirname, '..', 'tools', 'sync-product-build-next.js'), 'utf8');
assert(syncScript.includes('releaseProductHardeningExtensions'), 'Product Build Next sync must discover release Product Hardening extensions');
assert(syncScript.includes('runReleaseProductHardeningExtensions'), 'Product Build Next sync must execute Product Hardening extensions before rendering the queue');
assert(syncScript.includes('productHardeningExtensions'), 'Product Build Next sync must honor current-release extension declarations');
assert(syncScript.includes('remining'), 'Product Build Next sync must include runtime-discovered re-mining extensions such as the merged XSS pass');
const releaseSyncWorkflow = fs.readFileSync(path.join(__dirname, '..', '.github', 'workflows', 'sync-release-artifacts.yml'), 'utf8');
assert(releaseSyncWorkflow.includes('data/product-hardening/**'), 'release sync workflow must run when product-hardening queue/runtime data changes');
assert(releaseSyncWorkflow.includes('tools/sync-product-build-next.js'), 'release sync workflow must run when Product Build Next generator changes');
assert(releaseSyncWorkflow.includes('node tools/sync-product-build-next.js --write'), 'release sync workflow must regenerate Product Build Next during release sync');

const gapGuardDoc = fs.readFileSync(path.join(__dirname, '..', 'docs', 'SAME-SURFACE-GAP-PARKING-GUARD.md'), 'utf8');
const liveGateValidator = fs.readFileSync(path.join(__dirname, '..', 'tools', 'validate-live-integration-done-gate.js'), 'utf8');
const prTemplate = fs.readFileSync(path.join(__dirname, '..', '.github', 'pull_request_template.md'), 'utf8');
assert(gapGuardDoc.includes('Same-surface gap parking is forbidden'), 'same-surface gap parking guard must exist');
assert(gapGuardDoc.includes('Build it now'), 'same-surface gap parking guard must force buildable work into the current pass');
assert(gapGuardDoc.includes('Evidence ingestion is part of the build'), 'same-surface guard must require Evidence ingestion for built command/control/analyzer work');
assert(gapGuardDoc.includes('Static cards, command templates, GUI controls, or dashboard rows without Evidence ingestion are incomplete'), 'same-surface guard must reject static-card-only completion');
assert(liveGateValidator.includes('SAME-SURFACE-GAP-PARKING-GUARD.md'), 'live integration validator must enforce the gap parking guard doc');
assert(prTemplate.includes('No same-surface gap parking'), 'PR template must include the same-surface gap parking checkbox');

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

assert.strictEqual(controls.status, 'live-integrated');
assert.strictEqual(controls.wave, 'v9.58-proof-safety-controls');
for (const id of ['gap-xss-proof-mode-selector', 'gap-xss-proof-mode-cleanup-reminder', 'gap-auth-validation-safety-slot', 'gap-auth-material-scope-analyzer']) {
  assert(controls.controlIds.includes(id), 'controls missing built queue item ' + id);
}
assert.deepStrictEqual(controls.xssProofModeSelector.modes.map((mode) => mode.id), ['dialog', 'dom-marker', 'console-marker', 'harmless-callback']);
assert.strictEqual(controls.xssProofModeSelector.defaultMode, 'dom-marker');
assert(controls.xssCleanupReminder.appliesToModes.includes('harmless-callback'), 'callback proof mode must carry cleanup reminder');
for (const field of ['materialClass', 'protocolScope', 'lockoutPolicy', 'attemptCadence', 'failureScope', 'successScope']) {
  assert(controls.credentialValidationSafetySlot.requiredFields.includes(field), 'credential validation slot missing required field ' + field);
}
const analyzed = controls.analyzeAuthMaterialOutput('Responder capture produced NetNTLMv2 challenge-response material. Later review recovered plaintext. SMB authentication succeeded.');
assert(analyzed.matches.some((match) => match.id === 'challenge-response-capture'), 'analyzer must classify challenge-response captures separately');
assert(analyzed.matches.some((match) => match.id === 'password-like-plaintext'), 'analyzer must classify recovered plaintext separately');
assert(analyzed.matches.some((match) => match.id === 'service-auth-success'), 'analyzer must classify scoped auth success separately');
assert(analyzed.warnings.some((warning) => /must not be promoted to pass-the-hash/i.test(warning)), 'analyzer must warn against challenge-response overpromotion');
assert(controls.liveRoutes.includes('#/card/xss-proof-mode-selector'));
assert(controls.liveRoutes.includes('#/card/credential-validation-safety-slot'));
assert(controls.liveRoutes.includes('#/card/auth-material-scope-analyzer'));

assert.strictEqual(ingestion.status, 'live-integrated');
assert.strictEqual(ingestion.surface, '#/intake');
for (const id of ['xss-proof-mode-selector', 'xss-proof-cleanup-reminder', 'credential-validation-safety-slot', 'auth-material-scope-analyzer']) {
  assert(ingestion.ingestedCards.includes(id), 'Evidence ingestion must cover ' + id);
}
for (const fact of ['web.xss_browser_execution_reviewed', 'web.xss_proof_cleanup_recorded', 'credential.validation_scope_ready', 'credential.material_classified', 'credential.proof_state_classified']) {
  assert(ingestion.producedFacts.includes(fact), 'Evidence ingestion must produce ' + fact);
}
const directEvidence = ingestion.analyzeEvidenceText([
  'XSS proof mode DOM marker observed in browser execution context. Origin recorded and trigger recorded. Marker appeared on refresh.',
  'XSS proof cleanup complete. Removed marker and callback proof plumbing after evidence capture.',
  'Credential validation safety: material class password-like plaintext, protocol SMB, service target host, identity user, lockout policy unknown, single manual check attempt cadence.',
  'Responder capture produced NetNTLMv2 challenge-response material. Later recovered plaintext. SMB authentication succeeded with valid credentials.',
].join('\n'));
for (const id of ['xss-proof-mode-selector', 'xss-proof-cleanup-reminder', 'credential-validation-safety-slot', 'auth-material-scope-analyzer']) {
  assert(directEvidence.advancedCards.includes(id), 'direct Evidence analysis must advance ' + id);
}
for (const fact of ['web.xss_browser_execution_reviewed', 'web.xss_proof_cleanup_recorded', 'credential.validation_scope_ready', 'credential.material_classified', 'credential.proof_state_classified', 'credential.validation_success_scoped']) {
  assert(directEvidence.outcomeFacts.includes(fact), 'direct Evidence analysis missing fact ' + fact);
}

const serialized = JSON.stringify({ packet, controls: { fieldNotes: controls.fieldNotes, pathCards: controls.pathCards, completedProductItems: controls.completedProductItems }, ingestion: { producedFacts: ingestion.producedFacts, ingestedCards: ingestion.ingestedCards } });
const forbidden = [
  /<script/i,
  /document\.cookie/i,
  /nc\s+-l/i,
  /python3?\s+-m\s+http\.server/i,
  /password\s*=/i,
  /flag\{[^}]+\}/i,
  /BEGIN OPENSSH PRIVATE KEY/i,
];
for (const pattern of forbidden) assert(!pattern.test(serialized), 'public v9.58 data leaked forbidden material matching ' + pattern);

global.OBOL_LANES = [
  { lane: 'web', title: 'Web', cards: [{ id: 'xss', title: 'XSS' }] },
  { lane: 'credentials', title: 'Credentials', cards: [{ id: 'credentials', title: 'Credentials' }] },
];
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
  tracks: [
    { id: 'notes-integration', complete: 55, total: 556 },
    { id: 'ui-ux', complete: 10, total: 13 },
    { id: 'testing-qa', complete: 8, total: 12 },
  ],
  items: [
    { id: 'notes-remine-xss-session', track: 'notes-integration', status: 'queued' },
    { id: 'notes-remine-credentials-auth', track: 'notes-integration', status: 'queued' },
    { id: 'gap-xss-proof-mode-selector', track: 'ui-ux', status: 'queued', label: 'Design XSS proof-mode selector', priority: 86.831 },
    { id: 'gap-xss-proof-mode-cleanup-reminder', track: 'ui-ux', status: 'queued', label: 'Add XSS proof cleanup reminder', priority: 86.832 },
    { id: 'gap-auth-validation-safety-slot', track: 'ui-ux', status: 'queued', label: 'Design credential validation safety slot', priority: 86.833 },
    { id: 'gap-auth-material-scope-analyzer', track: 'testing-qa', status: 'queued', label: 'Add auth material scope analyzer', priority: 86.834 },
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
    queuedProductGaps: Object.freeze([
      'gap-xss-proof-mode-selector',
      'gap-xss-proof-mode-cleanup-reminder',
      'gap-auth-validation-safety-slot',
      'gap-auth-material-scope-analyzer',
    ]),
    redFlags: Object.freeze([]),
  }),
});
global.OBOL_INTAKE_V21 = {
  analyzeTerminal(text) {
    return { activities: [{ cardId: 'baseline', result: 'tried', command: 'baseline', outputSnippet: text.slice(0, 20), outcomeFacts: [] }] };
  },
};

const result = packet.integrate();
assert.strictEqual(result.notesIntegrated, true);
assert.strictEqual(result.queueIntegrated, true);
assert.strictEqual(result.progressIntegrated, true);
const controlResult = controls.integrate();
assert.strictEqual(controlResult.globalsIntegrated, true);
assert.strictEqual(controlResult.pathCardsIntegrated, true);
assert.strictEqual(controlResult.notesIntegrated, true);
assert.strictEqual(controlResult.queueIntegrated, true);
assert.strictEqual(controlResult.progressIntegrated, true);
const ingestionResult = ingestion.integrate();
assert.strictEqual(ingestionResult.evidenceIngestionIntegrated, true);
assert.strictEqual(ingestionResult.queueIntegrated, true);
assert.strictEqual(ingestionResult.progressIntegrated, true);
assert.strictEqual(global.__OBOL_PROOF_SAFETY_EVIDENCE_INGESTION_INSTALLED__, true, 'Evidence ingestion wrapper should install on OBOL_INTAKE_V21');

assert(global.OBOL_NOTE_INTEGRATION.__credentialsAuthReminingV958, 'note integration should be marked with v9.58 credentials/auth remine');
assert(global.OBOL_NOTE_INTEGRATION.__proofSafetyControlsV958, 'note integration should be marked with v9.58 proof/auth controls');
assert(global.OBOL_NOTE_INTEGRATION.packetReviews['credentials-auth-remine'], 'credentials/auth remine packet review missing');
assert.strictEqual(global.OBOL_NOTE_INTEGRATION.packetReviews['credentials-auth-remine'].status, 'complete');
assert(global.OBOL_NOTE_INTEGRATION.packetReviews['proof-safety-controls'], 'proof-safety control packet review missing');
assert.strictEqual(global.OBOL_NOTE_INTEGRATION.packetReviews['proof-safety-controls'].openProductGaps.length, 0, 'built controls must not remain open product gaps');
assert(global.OBOL_NOTE_INTEGRATION.publicNotesForTool('hashcat').some((note) => note.id === 'note-challenge-response-proof-boundary'), 'hashcat notes should include challenge-response proof boundary');
assert(global.OBOL_NOTE_INTEGRATION.publicNotesForTool('nxc').some((note) => note.id === 'note-auth-material-scope-analyzer-control'), 'nxc notes should include auth analyzer control guidance');
assert(global.OBOL_NOTE_INTEGRATION.publicNotesForPath('path').some((note) => note.id === 'note-xss-proof-mode-selector-control'), 'path notes should include XSS proof-mode selector control');

assert.strictEqual(global.OBOL_PRODUCT_HARDENING.items.find((item) => item.id === 'notes-remine-xss-session').status, 'complete');
assert.strictEqual(global.OBOL_PRODUCT_HARDENING.items.find((item) => item.id === 'notes-remine-credentials-auth').status, 'complete');
for (const id of controls.controlIds) {
  const item = global.OBOL_PRODUCT_HARDENING.items.find((entry) => entry.id === id);
  assert(item, id + ' should exist in Product Build Next');
  assert.strictEqual(item.status, 'complete', id + ' should be built in this PR, not parked as queued follow-up');
  assert.strictEqual(item.completedBy, 'v9.58-proof-safety-controls');
  assert.strictEqual(item.evidenceIngestion, 'built', id + ' should have Evidence ingestion proof');
}
assert(!global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.queuedProductGaps.includes('gap-auth-material-scope-analyzer'));
assert(global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.builtProductControls.includes('gap-xss-proof-mode-selector'));
assert(global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.builtProductControls.includes('gap-auth-material-scope-analyzer'));
assert.strictEqual(global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.noSameSurfaceGapParking, true);
assert.strictEqual(global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.evidencePasteAdvancesNextSteps, true);
for (const id of ['xss-proof-mode-selector', 'xss-proof-cleanup-reminder', 'credential-validation-safety-slot', 'auth-material-scope-analyzer']) {
  assert(global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.evidenceIngestionBuilt.includes(id), 'progress should record Evidence ingestion for ' + id);
  assert(global.OBOL_LANES.some((lane) => lane.cards.some((card) => card.id === id)), id + ' card should be installed in live lanes');
}

const integratedEvidence = global.OBOL_INTAKE_V21.analyzeTerminal([
  'XSS proof mode harmless callback received from expected browser context. Origin recorded and trigger recorded.',
  'XSS proof cleanup complete. Callback endpoint removed and cleanup status recorded.',
  'Credential validation safety material class NT hash, protocol WinRM, service target host, identity user, lockout policy unknown, bounded attempt cadence.',
  'NetNTLMv2 challenge-response capture observed. Authentication failed with STATUS_LOGON_FAILURE on SMB.',
].join('\n'));
for (const id of ['xss-proof-mode-selector', 'xss-proof-cleanup-reminder', 'credential-validation-safety-slot', 'auth-material-scope-analyzer']) {
  assert(integratedEvidence.activities.some((row) => row.cardId === id), 'integrated Evidence paste should create activity for ' + id);
}
const integratedFacts = integratedEvidence.activities.flatMap((row) => row.outcomeFacts || []);
for (const fact of ['web.xss_browser_execution_reviewed', 'web.xss_proof_cleanup_recorded', 'credential.validation_scope_ready', 'credential.material_classified', 'credential.proof_state_classified', 'credential.validation_failure_scoped']) {
  assert(integratedFacts.includes(fact), 'integrated Evidence paste missing outcome fact ' + fact);
}
assert(integratedEvidence.proofSafetyEvidence58, 'integrated Evidence result should expose proofSafetyEvidence58 details');
assert.strictEqual(global.OBOL_XSS_PROOF_MODE_SELECTOR.defaultMode, 'dom-marker');
assert.strictEqual(typeof global.OBOL_AUTH_MATERIAL_SCOPE_ANALYZER.analyze, 'function');

console.log('v9.58 credentials/auth re-mining, proof/auth controls, and Evidence ingestion checks passed');
