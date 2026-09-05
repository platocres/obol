'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const ACTIONABLE_FILE = 'data/product-hardening/actionable-card-contract-v9.66.js';
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
function extractOverlayChunk(source, id) {
  const patterns = [`'${id}': overlay(`, `"${id}": overlay(`];
  const start = patterns.map((needle) => source.indexOf(needle)).filter((pos) => pos >= 0).sort((a, b) => a - b)[0];
  if (start === undefined) return '';
  const nextSingle = source.indexOf("\n    '", start + 2);
  const nextDouble = source.indexOf('\n    "', start + 2);
  const end = [nextSingle, nextDouble].filter((pos) => pos > start).sort((a, b) => a - b)[0] || Math.min(source.length, start + 9000);
  return source.slice(start, end);
}
function listCount(chunk, needle) {
  const start = chunk.indexOf(needle);
  if (start < 0) return 0;
  const section = chunk.slice(start, Math.min(chunk.length, start + 2200));
  return (section.match(/'[^']{3,}'|"[^"]{3,}"/g) || []).length;
}
function commandQuality(chunk) {
  const start = chunk.indexOf('[cmd(');
  if (start < 0) return { count: 0, quality: false };
  const section = chunk.slice(start, Math.min(chunk.length, start + 2400));
  const count = (section.match(/cmd\(/g) || []).length;
  return { count, quality: count > 0 && /useWhen|expected/.test(read(ACTIONABLE_FILE)) };
}
function validateDemotionMap(reconciliationSource, failures) {
  for (const [id, parent] of Object.entries(DEMOTED)) {
    if (!reconciliationSource.includes(`'${id}'`) && !reconciliationSource.includes(`"${id}"`)) failures.push(`${id} is not declared as demoted/merged in ${RECONCILIATION_FILE}`);
    if (!reconciliationSource.includes(`into: '${parent}'`) && !reconciliationSource.includes(`into: "${parent}"`)) failures.push(`${id} does not merge into current primary card ${parent}`);
  }
}
function validateActionableNextStepCards() {
  const failures = [];
  const source = read(ACTIONABLE_FILE);
  const extensions = currentReleaseExtensions();
  const hasReconciliation = extensions.includes(RECONCILIATION_FILE);
  const required = hasReconciliation ? PRIMARY_REQUIRED_IDS : HISTORICAL_REQUIRED_IDS;
  if (!extensions.includes(ACTIONABLE_FILE)) failures.push(`${ACTIONABLE_FILE} is not registered in current-release.js`);
  if (extensions.includes(REMOVED_PANEL_FILE)) failures.push(`${REMOVED_PANEL_FILE} must not be loaded by the current release`);
  if (hasReconciliation) validateDemotionMap(read(RECONCILIATION_FILE), failures);
  for (const id of required) {
    const chunk = extractOverlayChunk(source, id);
    if (!chunk) { failures.push(`${id} is missing an actionability overlay`); continue; }
    if (/referenceOnly\s*:\s*true/.test(chunk)) failures.push(`${id} is referenceOnly but path-visible`);
    if (!/operatorGoal|overlay\(/.test(chunk)) failures.push(`${id} lacks operator goal`);
    const commands = commandQuality(chunk);
    const guiSteps = listCount(chunk, '], [');
    if (!commands.count && guiSteps < 4) failures.push(`${id} must have command templates or concrete GUI workflow steps`);
    if (commands.count && !commands.quality) failures.push(`${id} command templates must define tool/run/useWhen/expected`);
    if (listCount(chunk, 'expected') < 3) failures.push(`${id} needs expected evidence guidance`);
    if (listCount(chunk, 'failure') < 2) failures.push(`${id} needs failure mode guidance`);
    if (listCount(chunk, 'move') + listCount(chunk, 'next') < 2) failures.push(`${id} needs next-step guidance`);
  }
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
