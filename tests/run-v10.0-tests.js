'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const cp = require('child_process');
const rootDir = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(rootDir, rel), 'utf8');
function run(args) {
  const result = cp.spawnSync(process.execPath, args.map((p, i) => i === 0 ? path.join(rootDir, p) : p), { cwd: rootDir, encoding: 'utf8' });
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.status !== 0) process.exit(result.status || 1);
}
function assertNoPattern(source, pattern, label) {
  assert(!pattern.test(source), label + ' still contains retired runtime behavior: ' + pattern);
}

(function testSourceRetirements() {
  const panel = read('data/product-hardening/action-first-card-cleanup-stabilize-v9.67.js');
  assert(panel.includes("status: 'retired'"), 'v9.67 panel stabilizer should publish retired compatibility status');
  for (const pattern of [/insertBefore\s*\(/, /innerHTML\s*=/, /createElement\s*\(/, /addEventListener\s*\(/, /setTimeout\s*\(/, /function\s+panel\s*\(/, /ensureStyle\s*\(/]) {
    assertNoPattern(panel, pattern, 'v9.67 action-first panel stabilizer');
  }

  const disposition = read('data/product-hardening/note-card-disposition-reconciliation-v9.68.js');
  assert(disposition.includes('OBOL_CARD_CANONICALIZER_CURRENT'), 'v9.68 disposition should expose the current canonicalizer seam');
  assert(disposition.includes('CARD_INDEX_ALIASES'), 'v9.68 disposition should preserve demoted route compatibility with aliases');
  for (const pattern of [/root\.viewCard\s*=/, /root\.liveCardById\s*=/, /replaceState\s*\(/, /root\.location\.hash\s*=/, /addEventListener\s*\(/, /setTimeout\s*\(/]) {
    assertNoPattern(disposition, pattern, 'v9.68 note-card disposition');
  }

  const why = read('data/product-hardening/dynamic-why-now-v9.71.js');
  assert(why.includes('retiredDomInjection'), 'v9.71 dynamic why-now should publish retired DOM-injection status');
  assert(why.includes('integratedCardOwner'), 'v9.71 dynamic why-now should preserve the integrated-card-owner guard/seam');
  for (const pattern of [/querySelector\s*\(/, /insertAdjacentHTML\s*\(/, /outerHTML\s*=/, /createElement\s*\(/, /addEventListener\s*\(/, /setTimeout\s*\(/, /root\.viewCard\s*=/, /root\.route\s*=/]) {
    assertNoPattern(why, pattern, 'v9.71 dynamic why-now DOM injector');
  }

  const stable = read('data/product-hardening/dynamic-why-now-route-stabilizer-v9.77.js');
  assert(stable.includes('retiredDomStabilizer'), 'v9.77 stabilizer should publish retired DOM-stabilizer status');
  assert(stable.includes('integratedCardOwner'), 'v9.77 stabilizer should preserve the integrated-card-owner seam');
  for (const pattern of [/requestAnimationFrame\s*\(/, /setTimeout\s*\(/, /addEventListener\s*\(/, /querySelector\s*\(/, /root\[name\]\s*=/, /root\.viewCard\s*=/, /root\.route\s*=/]) {
    assertNoPattern(stable, pattern, 'v9.77 dynamic why-now route stabilizer');
  }
})();

(function testRuntimeBehaviorWasNotPatching() {
  const ids = [
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
    'fuzzer-result-delta-review'
  ];
  globalThis.window = globalThis;
  globalThis.CARDS = Object.fromEntries(ids.map((id) => [id, { id, title: id, expected: [], tools: [], commands: [{ tool: 'echo', run: 'echo ' + id }] }]));
  globalThis.OBOL_LANES = [{ lane: 'test', title: 'Test', cards: ids.map((id) => globalThis.CARDS[id]) }];
  globalThis.viewCard = function viewCardOriginal(id) { return id; };
  globalThis.route = function routeOriginal() { return 'route'; };
  globalThis.liveCardById = function liveCardByIdOriginal(id) { return globalThis.CARDS[id] || null; };
  const originalViewCard = globalThis.viewCard;
  const originalRoute = globalThis.route;
  const originalLiveCardById = globalThis.liveCardById;

  require(path.join(rootDir, 'data/product-hardening/action-first-card-cleanup-v9.67.js'));
  const disposition = require(path.join(rootDir, 'data/product-hardening/note-card-disposition-reconciliation-v9.68.js'));
  const status = globalThis.OBOL_NOTE_CARD_DISPOSITION_RECONCILIATION_V968;
  assert(status, 'v9.68 disposition status should be published');
  assert.strictEqual(status.retiredRouteSurgery, true, 'v9.68 route surgery should be retired');
  assert.deepStrictEqual(status.patches, { liveCardById: false, viewCard: false, route: false }, 'v9.68 should not patch runtime route/card functions');
  assert.strictEqual(globalThis.viewCard, originalViewCard, 'v9.68 must not replace viewCard');
  assert.strictEqual(globalThis.route, originalRoute, 'v9.68 must not replace route');
  assert.strictEqual(globalThis.liveCardById, originalLiveCardById, 'v9.68 must not replace liveCardById');
  assert.strictEqual(disposition.canonicalCardId('web-client-controls'), 'web-authz-boundaries', 'demoted web client control card should canonicalize to authz card');
  assert.strictEqual(globalThis.CARDS['web-client-controls'], globalThis.CARDS['web-authz-boundaries'], 'demoted card id should alias to merged parent in the card index');
  assert(!globalThis.OBOL_LANES[0].cards.some((card) => card && card.id === 'web-client-controls'), 'demoted card should not remain as a standalone lane/path card');
  assert((globalThis.CARDS['web-authz-boundaries'].mergedSupportingGuidance || []).some((item) => item.sourceCardId === 'web-client-controls'), 'parent card should retain merged supporting guidance');

  const why = require(path.join(rootDir, 'data/product-hardening/dynamic-why-now-v9.71.js'));
  const stable = require(path.join(rootDir, 'data/product-hardening/dynamic-why-now-route-stabilizer-v9.77.js'));
  const computed = globalThis.OBOL_DYNAMIC_WHY_NOW.compute(globalThis.CARDS['web-authz-boundaries'], { integratedCardUi: true });
  assert(/paste the result back|missing proof|current path/i.test(computed.body), 'dynamic why-now should still compute useful render-time text');
  assert.strictEqual(globalThis.viewCard, originalViewCard, 'dynamic why-now modules must not replace viewCard');
  assert.strictEqual(globalThis.route, originalRoute, 'dynamic why-now modules must not replace route');
  assert.strictEqual(why.retiredDomInjection, true, 'v9.71 should declare DOM injection retired');
  assert.strictEqual(stable.retiredDomStabilizer, true, 'v9.77 should declare DOM stabilizer retired');
})();

(function testQueueAndReleaseClosure() {
  delete globalThis.OBOL_PRODUCT_HARDENING;
  delete globalThis.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
  globalThis.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__ = true;
  require(path.join(rootDir, 'data/product-hardening/product-hardening-queue.js'));
  require(path.join(rootDir, 'data/product-hardening/work-packages.js'));
  require(path.join(rootDir, 'data/product-hardening/post-notes-clarity-audit-v9.96.js'));
  require(path.join(rootDir, 'data/product-hardening/network-position-recurrence-v9.97.js'));
  require(path.join(rootDir, 'data/product-hardening/card-wrapper-retirement-queue-v9.98.js'));
  const proof = require(path.join(rootDir, 'data/product-hardening/card-wrapper-decorator-retirement-v10.0.js'));
  assert.strictEqual(proof.status, 'complete', 'v10.0 proof ledger should mark wrapper retirement complete');
  assert.strictEqual(proof.requestBudgetNeutral, true, 'v10.0 proof ledger should not be runtime-loaded by current release');

  const releaseSource = read('data/current-release.js');
  assert(releaseSource.includes("version:'10.0.0'"), 'current release should be v10.0.0');
  assert(releaseSource.includes("label:'v10.0'"), 'current release label should be v10.0');
  assert(!releaseSource.includes('data/product-hardening/card-wrapper-decorator-retirement-v10.0.js'), 'v10.0 proof ledger should not add a browser runtime request');

  const q = globalThis.OBOL_PRODUCT_HARDENING;
  const retire = q.items.find((item) => item && item.id === 'post-notes-card-wrapper-decorator-retirement-audit');
  const tools = q.items.find((item) => item && item.id === 'post-notes-tools-builder-library-cleanup');
  const next = q.buildNext(5).map((item) => item && item.id);
  assert(retire && retire.status === 'complete', 'card wrapper/decorator retirement queue item should be complete');
  assert.strictEqual(retire.completedBy, 'v10.0', 'retirement item should be completed by v10.0');
  assert(Array.isArray(retire.wrapperLedger) && retire.wrapperLedger.length >= 5, 'retirement item should keep a specific wrapper ledger');
  assert(tools && tools.status === 'queued', 'Tools cleanup should remain queued');
  assert.strictEqual(next[0], 'post-notes-tools-builder-library-cleanup', 'Build Next should advance to Tools builder-library cleanup');
  const status = globalThis.OBOL_CARD_WRAPPER_DECORATOR_RETIREMENT_V100;
  assert(status && status.status === 'complete', 'v10.0 runtime queue status should be complete');
  assert.strictEqual(status.toolsNext, true, 'v10.0 status should prove Tools is next');
})();

run(['tools/validate-release-pr.js', '--repo-only', '--release-version=10.0']);

console.log('v10.0 tests passed: card wrappers/decorators retired through helper/data seams, queue closed, and Build Next advanced to Tools cleanup without adding a browser runtime request.');
