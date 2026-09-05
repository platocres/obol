'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const ACTION_FIRST_FILE = 'data/product-hardening/action-first-card-cleanup-v9.67.js';
const RECONCILIATION_FILE = 'data/product-hardening/note-card-disposition-reconciliation-v9.68.js';
const REMOVED_PANEL_FILE = 'data/product-hardening/action-first-card-cleanup-stabilize-v9.67.js';
const HISTORICAL_REQUIRED_IDS = [
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
const PRIMARY_REQUIRED_IDS = [
  'credential-dump-proof-chain',
  'web-authz-boundaries',
  'pass-the-hash-proof-chain',
  'burp-intruder-fuzzing-workflow',
];
const DEMOTED = {
  'web-proxy-transform-proof-chain': 'web-authz-boundaries',
  'web-client-controls': 'web-authz-boundaries',
  'encoded-parameter-review': 'web-authz-boundaries',
  'tool-generated-http-review': 'burp-intruder-fuzzing-workflow',
  'pth-remote-exec-artifacts': 'pass-the-hash-proof-chain',
  'pth-token-filtering-check': 'pass-the-hash-proof-chain',
  'fuzzer-payload-position-review': 'burp-intruder-fuzzing-workflow',
  'fuzzer-result-delta-review': 'burp-intruder-fuzzing-workflow',
};
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function currentReleaseExtensions() {
  const sandbox = { window: {}, globalThis: null };
  sandbox.globalThis = sandbox.window;
  sandbox.window.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__ = true;
  vm.createContext(sandbox);
  vm.runInContext(read('data/current-release.js'), sandbox, { filename: 'data/current-release.js' });
  const release = sandbox.window.OBOL_CURRENT_RELEASE;
  if (!release || !Array.isArray(release.productHardeningExtensions)) throw new Error('Missing current release Product Hardening extension list');
  return Array.from(release.productHardeningExtensions);
}
function scriptLoader() {
  const sandbox = { console, window: undefined, globalThis: null, module: { exports: {} } };
  sandbox.globalThis = sandbox;
  sandbox.CARDS = Object.fromEntries(HISTORICAL_REQUIRED_IDS.map((id) => [id, { id, title: id, lane: 'test', expected: [], tools: [] }]));
  sandbox.OBOL_LANES = [{ lane: 'test', title: 'Test', phase: 'Test', cards: Object.values(sandbox.CARDS) }];
  sandbox.liveCardById = (id) => sandbox.CARDS[id] || null;
  vm.createContext(sandbox);
  return {
    sandbox,
    run(rel) { vm.runInContext(read(rel), sandbox, { filename: rel }); },
  };
}
function commandOk(command) {
  return !!(command && command.tool && command.run && (command.useWhen || command.when) && (command.expected || command.evidence));
}
function validateCard(card, id, failures) {
  if (!card) { failures.push(`${id} is missing from the current primary card set`); return; }
  if (card.referenceOnly === true || card.hiddenFromNextSteps === true) failures.push(`${id} is hidden/referenceOnly but still primary`);
  if (!card.operatorGoal || card.operatorGoal.length < 40) failures.push(`${id} lacks a practical operator goal`);
  const hasCommands = Array.isArray(card.commands) && card.commands.length > 0 && card.commands.every(commandOk);
  const hasGui = Array.isArray(card.guiSteps) && card.guiSteps.length >= 4;
  if (!hasCommands && !hasGui) failures.push(`${id} must have command templates or concrete GUI workflow steps`);
  if (!Array.isArray(card.expectedEvidence) || card.expectedEvidence.length < 3) failures.push(`${id} needs expected evidence guidance`);
  if (!Array.isArray(card.failureModes) || card.failureModes.length < 3) failures.push(`${id} needs failure/decision guidance`);
  if (!Array.isArray(card.nextSteps) || card.nextSteps.length < 2) failures.push(`${id} needs next-step guidance`);
}
function validateDemotionRuntime(sandbox, failures) {
  const status = sandbox.OBOL_NOTE_CARD_DISPOSITION_RECONCILIATION_V968;
  if (!status) { failures.push('v9.68 reconciliation did not publish runtime status'); return; }
  for (const [id, parent] of Object.entries(DEMOTED)) {
    if (!Array.isArray(status.demotedCardIds) || !status.demotedCardIds.includes(id)) failures.push(`${id} is not listed as demoted by v9.68`);
    if (sandbox.CARDS[id]) failures.push(`${id} still resolves as a primary card after reconciliation`);
    const parentCard = sandbox.CARDS[parent];
    if (!parentCard) failures.push(`${id} parent ${parent} is missing`);
    else if (!Array.isArray(parentCard.mergedNoteCardIds) || !parentCard.mergedNoteCardIds.includes(id)) failures.push(`${id} was not merged into parent card ${parent}`);
  }
}
function validateActionableNextStepCards() {
  const failures = [];
  const extensions = currentReleaseExtensions();
  const hasReconciliation = extensions.includes(RECONCILIATION_FILE);
  const required = hasReconciliation ? PRIMARY_REQUIRED_IDS : HISTORICAL_REQUIRED_IDS;
  if (!extensions.includes(ACTION_FIRST_FILE)) failures.push(`${ACTION_FIRST_FILE} is not registered in current-release.js`);
  if (extensions.includes(REMOVED_PANEL_FILE)) failures.push(`${REMOVED_PANEL_FILE} must not be loaded by the current release`);
  const loader = scriptLoader();
  loader.run(ACTION_FIRST_FILE);
  if (hasReconciliation) loader.run(RECONCILIATION_FILE);
  const panelSource = read(ACTION_FIRST_FILE);
  if (/insertBefore\s*\(|querySelectorAll\('body \*'\)|data-obol-action-first-v967/.test(panelSource)) failures.push(`${ACTION_FIRST_FILE} must not inject a visible corrective action panel`);
  for (const id of required) validateCard(loader.sandbox.CARDS[id], id, failures);
  if (hasReconciliation) validateDemotionRuntime(loader.sandbox, failures);
  return { failures, checkedCards: required.length, demotedCards: hasReconciliation ? Object.keys(DEMOTED).length : 0, extensionCount: extensions.length };
}
if (require.main === module) {
  const result = validateActionableNextStepCards();
  if (result.failures.length) {
    console.error('Actionable Next Steps card validation failed:');
    for (const failure of result.failures) console.error('- ' + failure);
    process.exit(1);
  }
  console.log(`Actionable Next Steps card validation passed (${result.checkedCards} primary cards, ${result.demotedCards} demoted cards, ${result.extensionCount} current extensions).`);
}
module.exports = { validateActionableNextStepCards, PRIMARY_REQUIRED_IDS, HISTORICAL_REQUIRED_IDS, DEMOTED };
