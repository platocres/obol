'use strict';

const assert = require('assert');
const path = require('path');

const root = path.join(__dirname, '..');
const IDS = [
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

globalThis.CARDS = Object.fromEntries(IDS.map((id) => [id, { id, title: id, expected: [], tools: [] }]));
globalThis.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__ = true;
require(path.join(root, 'data/current-release.js'));
assert.ok(releaseAtLeast(globalThis.OBOL_CURRENT_RELEASE.label, 9, 67), 'current release should be v9.67 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/action-first-card-cleanup-v9.67.js'));
assert.ok(!globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/action-first-card-cleanup-stabilize-v9.67.js'), 'the visible v9.67 patch-panel stabilizer must not be loaded by current releases');
const mod = require(path.join(root, 'data/product-hardening/action-first-card-cleanup-v9.67.js'));
const result = mod.validate();
assert.deepStrictEqual(result.failures, []);
const installed = mod.install();
assert.strictEqual(installed.status, 'live-integrated');
for (const id of IDS) {
  const card = globalThis.CARDS[id];
  assert.ok(card.operatorGoal && card.operatorGoal.length > 40, `${id} lacks operator goal`);
  assert.ok((Array.isArray(card.commands) && card.commands.length) || (Array.isArray(card.guiSteps) && card.guiSteps.length >= 4), `${id} lacks command or GUI workflow`);
  assert.ok(Array.isArray(card.expectedEvidence) && card.expectedEvidence.length >= 3, `${id} lacks paste-back evidence`);
  assert.ok(Array.isArray(card.failureModes) && card.failureModes.length >= 3, `${id} lacks decision guidance`);
  assert.ok(Array.isArray(card.nextSteps) && card.nextSteps.length >= 2, `${id} lacks next guidance`);
  assert.notStrictEqual(card.referenceOnly, true, `${id} is reference-only in the historical v9.67 actionability data`);
}
const publicJson = JSON.stringify(mod.PLANS);
for (const forbidden of [/HTB\{/i, /flag\{/i, /Password123/i, /corp\.local/i, /j\.smith/i, /10\.10\./, /document\.cookie/i]) {
  assert.ok(!forbidden.test(publicJson), `private or lab-shaped artifact leaked: ${forbidden}`);
}
console.log('v9.67 action-first card cleanup validation passed.');
