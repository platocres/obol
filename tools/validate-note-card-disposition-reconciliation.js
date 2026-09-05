'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const RECONCILIATION_FILE = 'data/product-hardening/note-card-disposition-reconciliation-v9.68.js';
const REMOVED_PANEL_FILE = 'data/product-hardening/action-first-card-cleanup-stabilize-v9.67.js';
const KEEP_AS_CARDS = [
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
function releaseSnapshot() {
  const sandbox = { window: {}, globalThis: null };
  sandbox.globalThis = sandbox.window;
  sandbox.window.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__ = true;
  vm.createContext(sandbox);
  vm.runInContext(read('data/current-release.js'), sandbox, { filename: 'data/current-release.js' });
  return sandbox.window.OBOL_CURRENT_RELEASE;
}
function semver(label) {
  const match = String(label || '').match(/^v?(\d+)\.(\d+)/);
  return match ? [Number(match[1]), Number(match[2])] : [0, 0];
}
function atLeast(label, major, minor) {
  const [foundMajor, foundMinor] = semver(label);
  return foundMajor > major || (foundMajor === major && foundMinor >= minor);
}
function validateNoteCardDispositionReconciliation() {
  const failures = [];
  const release = releaseSnapshot();
  if (!release || !Array.isArray(release.productHardeningExtensions)) failures.push('Missing current release Product Hardening extensions');
  else {
    if (!atLeast(release.label, 9, 68)) failures.push('Current release must be v9.68 or newer after the card-disposition fix');
    if (!release.productHardeningExtensions.includes(RECONCILIATION_FILE)) failures.push(`${RECONCILIATION_FILE} is not registered in current-release.js`);
    if (release.productHardeningExtensions.includes(REMOVED_PANEL_FILE)) failures.push(`${REMOVED_PANEL_FILE} must not be loaded by the current release`);
  }
  if (!fs.existsSync(path.join(root, RECONCILIATION_FILE))) failures.push(`${RECONCILIATION_FILE} is missing`);
  const source = fs.existsSync(path.join(root, RECONCILIATION_FILE)) ? read(RECONCILIATION_FILE) : '';
  for (const id of KEEP_AS_CARDS) {
    if (!source.includes(`'${id}'`) && !source.includes(`"${id}"`)) failures.push(`Kept card is not declared in reconciliation file: ${id}`);
  }
  for (const [id, parent] of Object.entries(DEMOTED)) {
    if (!source.includes(`'${id}'`) && !source.includes(`"${id}"`)) failures.push(`Demoted card is not declared in reconciliation file: ${id}`);
    if (!source.includes(`into: '${parent}'`) && !source.includes(`into: "${parent}"`)) failures.push(`${id} does not merge into ${parent}`);
  }
  assertNoPatchPanelImplementation(source, failures);
  return { failures, kept: KEEP_AS_CARDS, demoted: DEMOTED };
}
function assertNoPatchPanelImplementation(source, failures) {
  const forbidden = [
    /data-obol-action-first-v967/i,
    /obol-action-first-v967\{/i,
    /v9\.67 action-first cleanup/i,
    /insertBefore\(el,\s*view\.firstChild\)/i,
    /innerHTML\s*=\s*panel\(/i,
  ];
  for (const pattern of forbidden) if (pattern.test(source)) failures.push(`v9.68 reconciliation must not add another visible patch panel: ${pattern}`);
}
if (require.main === module) {
  const result = validateNoteCardDispositionReconciliation();
  if (result.failures.length) {
    console.error('Note card disposition reconciliation validation failed:');
    for (const failure of result.failures) console.error('- ' + failure);
    process.exit(1);
  }
  console.log(`Note card disposition reconciliation validation passed (${result.kept.length} kept, ${Object.keys(result.demoted).length} demoted).`);
}
module.exports = { validateNoteCardDispositionReconciliation, KEEP_AS_CARDS, DEMOTED };
