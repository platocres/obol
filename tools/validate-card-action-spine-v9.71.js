'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..');
const V971 = 'data/product-hardening/ad-metasploit-remine-batch-v9.71.js';
const REMOVED_ROUTE_GUARD = 'data/product-hardening/client-session-route-guard-v9.70.js';
const PRIMARY = [
  'credential-dump-proof-chain',
  'web-authz-boundaries',
  'pass-the-hash-proof-chain',
  'burp-intruder-fuzzing-workflow',
  'web-upload-inclusion-proof-chain',
  'ad-enumeration-bloodhound-collection',
  'metasploit-resource-pivot-workflow',
];
const DEMOTED = { 'web-client-session-proof-chain': 'web-authz-boundaries' };
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function currentReleaseExtensions() {
  const sandbox = { window: {}, globalThis: null };
  sandbox.globalThis = sandbox.window;
  sandbox.window.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__ = true;
  vm.createContext(sandbox);
  vm.runInContext(read('data/current-release.js'), sandbox, { filename: 'data/current-release.js' });
  return Array.from(sandbox.window.OBOL_CURRENT_RELEASE.productHardeningExtensions || []);
}
function seedSandbox() {
  const sandbox = { console, module: { exports: {} }, globalThis: null, window: undefined, setTimeout: () => 0, addEventListener: () => {} };
  sandbox.globalThis = sandbox;
  sandbox.CARDS = Object.fromEntries(['credential-dump-proof-chain','web-authz-boundaries','pass-the-hash-proof-chain','burp-intruder-fuzzing-workflow'].map((id) => [id, { id, title: id, lane: 'test', expected: [], tools: [], commands: [] }]));
  sandbox.OBOL_LANES = [{ id: 'test', lane: 'test', title: 'Test', cards: Object.values(sandbox.CARDS) }];
  sandbox.OBOL_NOTE_INTEGRATION = { publicFieldNotes: [], reviewedDispositions: [], ledger: { expectedNotes: 556, reviewedCount: 135 }, validate: () => [] };
  sandbox.OBOL_PRODUCT_HARDENING = { items: [{ id: 'notes-mechanic-backfill', status: 'queued', priority: 86.8 }] };
  sandbox.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = { reviewed: 135, total: 556, remining: { reminedNoteCount: 107, audited: 107, oldRubricOnlyRemaining: 28, auditRows: [] } };
  sandbox.OBOL_INTAKE_V21 = { analyzeTerminal: () => ({ activities: [] }) };
  sandbox.liveCardById = (id) => sandbox.CARDS[id] || null;
  vm.createContext(sandbox);
  return sandbox;
}
function commandOk(command) {
  return !!(command && command.tool && command.run && (command.when || command.useWhen) && (command.evidence || command.expected));
}
function guiStepOk(step) {
  if (!step) return false;
  if (typeof step === 'string') return /\b(click|open|select|send|configure|set|inspect|export|copy|paste|compare|repeater|intruder|proxy|history|bloodhound|graph|cyberchef|devtools)\b/i.test(step);
  const text = [step.tool, step.action, step.step, step.when, step.evidence, step.expected, step.selector, step.view].filter(Boolean).join(' ');
  return !!(step.tool || step.view) && /\b(click|open|select|send|configure|set|inspect|export|copy|paste|compare|repeater|intruder|proxy|history|bloodhound|graph|cyberchef|devtools)\b/i.test(text) && /\b(evidence|request|response|output|export|copy|paste|compare|path|edge|body|status|header|cookie|graph)\b/i.test(text);
}
function hasActionSpine(card) {
  const hasCommands = Array.isArray(card.commands) && card.commands.length > 0 && card.commands.every(commandOk);
  const hasGui = Array.isArray(card.guiSteps) && card.guiSteps.length >= 3 && card.guiSteps.every(guiStepOk);
  return { hasCommands, hasGui };
}
function badUiCopy(text) { return /Why this now|methodology gap|UNKNOWN|source-mining|source re-mining|release cleanup|patch panel|stabilizer/i.test(String(text || '')); }
function validateCard(card, id, failures) {
  if (!card) { failures.push(id + ' is missing'); return; }
  const serialized = JSON.stringify(card);
  if (card.referenceOnly || card.hiddenFromNextSteps) failures.push(id + ' is hidden/referenceOnly but still primary');
  const spine = hasActionSpine(card);
  if (!spine.hasCommands && !spine.hasGui) failures.push(id + ' has no concrete command-line or GUI-tool action spine');
  if (Array.isArray(card.commands) && card.commands.length && !card.commands.every(commandOk)) failures.push(id + ' has command entries without tool/run/when/evidence');
  if (Array.isArray(card.guiSteps) && card.guiSteps.length && !card.guiSteps.every(guiStepOk)) failures.push(id + ' has GUI steps without concrete tool/action/evidence guidance');
  if (!Array.isArray(card.expectedEvidence) || card.expectedEvidence.length < 3) failures.push(id + ' lacks expected evidence guidance');
  if (!Array.isArray(card.failureModes) || card.failureModes.length < 3) failures.push(id + ' lacks failure or inconclusive-output guidance');
  if (!Array.isArray(card.nextSteps) || card.nextSteps.length < 2) failures.push(id + ' lacks next-step movement guidance');
  if (!(card.operatorGoal || card.goal || card.hypothesis)) failures.push(id + ' lacks operator goal or hypothesis');
  if (badUiCopy(serialized)) failures.push(id + ' leaks internal methodology/provenance UI copy');
}
function validate() {
  const failures = [];
  const extensions = currentReleaseExtensions();
  if (!extensions.includes(V971)) failures.push(V971 + ' is not registered in current-release.js');
  if (extensions.includes(REMOVED_ROUTE_GUARD)) failures.push(REMOVED_ROUTE_GUARD + ' must not stay registered after v9.71 demotes the bad card');
  const sandbox = seedSandbox();
  for (const rel of extensions) {
    if (!fs.existsSync(path.join(root, rel))) { failures.push('Missing extension ' + rel); continue; }
    try { vm.runInContext(read(rel), sandbox, { filename: rel }); } catch (err) { failures.push(rel + ' failed in action-spine sandbox: ' + err.message); }
  }
  for (const id of PRIMARY) validateCard(sandbox.CARDS[id], id, failures);
  for (const [id, parent] of Object.entries(DEMOTED)) {
    if (sandbox.CARDS[id]) failures.push(id + ' still exists as a primary card after v9.71');
    if (!sandbox.CARDS[parent]) failures.push(id + ' demotion parent missing: ' + parent);
  }
  const notes = sandbox.OBOL_NOTE_INTEGRATION.publicFieldNotes || [];
  for (const note of notes) if ((note.cardIds || []).includes('web-client-session-proof-chain')) failures.push(note.id + ' still binds to demoted client/session card');
  const intake = sandbox.OBOL_INTAKE_V21.analyzeTerminal('Invoke-BloodHound Enumeration Completed BloodHound.zip Find-DomainShare serviceprincipalname GenericAll msfconsole Meterpreter session 3 opened route add route print TCP OPEN');
  const analyzers = new Set((intake.activities || []).map((a) => a.analyzerId));
  if (!analyzers.has('ad-enumeration-evidence-analyzer')) failures.push('AD evidence analyzer did not attach to Intake');
  if (!analyzers.has('metasploit-workflow-evidence-analyzer')) failures.push('Metasploit evidence analyzer did not attach to Intake');
  const progress = sandbox.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining || {};
  if (progress.reminedNoteCount < 127 || progress.oldRubricOnlyRemaining !== 8) failures.push('v9.71 note progress did not advance to 127/135 with 8 old-rubric-only notes remaining');
  return { failures, checkedCards: PRIMARY.length, extensions: extensions.length };
}
if (require.main === module) {
  const result = validate();
  if (result.failures.length) {
    console.error('v9.71 card action spine validation failed:');
    for (const failure of result.failures) console.error('- ' + failure);
    process.exit(1);
  }
  console.log(`v9.71 card action spine validation passed (${result.checkedCards} primary cards, ${result.extensions} extensions).`);
}
module.exports = { validate, PRIMARY, DEMOTED, hasActionSpine };
