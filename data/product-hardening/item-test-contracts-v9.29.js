'use strict';
(function(root){
const base=root.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
if(!base||!base.contracts)throw new Error('Base Product Hardening item-test contracts must load before v9.29 contract extensions');
base.contracts['notes-impact-dashboard']={
 acceptance:[
  'Notes Integration exposes one stable notes-to-product impact projection derived from the live review ledger; README and both dashboard entrypoints consume that projection; modeled note outputs distinguish contextual guidance/bindings from separately declared code-level product changes; themed packet work remains visible under the 556-note umbrella; and queue/package status is no longer reconstructed from the current release number.'
 ],
 validationCommands:[
  'node tools/validate-notes-impact.js',
  'node tools/validate-note-integration.js',
  'node tools/validate-product-hardening-queue.js',
  'node tools/sync-product-build-next.js --check',
  'node tests/run-v9.29-tests.js'
 ],
 proofFiles:[
  'data/product-hardening/notes-impact-current.js',
  'data/product-hardening/product-hardening-queue.js',
  'data/product-hardening/work-packages.js',
  'assets/product-hardening-dashboard.js',
  'product-hardening.html',
  'tools/validate-notes-impact.js',
  'tools/sync-product-build-next.js',
  'docs/NOTES-INTEGRATION.md',
  'docs/NOTES-IMPACT.md',
  'tests/run-v9.29-tests.js',
  'docs/v9.29.md'
 ]
};
base.contracts['runtime-dashboard-no-flash']={
 acceptance:[
  '#/dashboard intent is claimed before historical compatibility startup can render a dashboard; historical direct dashboard renderers yield to that intent; a stable non-versioned current route owner loads after the compatibility chain, renders the current Product Hardening shell/dashboard, and repairs any delayed historical repaint during the legacy timer window; real browser smoke records dashboard paints and rejects every historical owner.'
 ],
 validationCommands:[
  'node tools/validate-current-workflow.js',
  'node tools/validate-runtime-manifest.js',
  'node tools/validate-runtime-loading.js',
  'node tools/validate-asset-references.js',
  'node tests/run-v9.29-tests.js'
 ],
 proofFiles:[
  'assets/runtime-current.js',
  'assets/dashboard-route-current.js',
  'assets/app-v6.6.js',
  'assets/app-v8.8.js',
  'assets/product-hardening-dashboard.js',
  'data/runtime-manifest.js',
  'tests/playwright-smoke.js',
  '.github/workflows/browser-smoke.yml',
  'tests/run-v9.29-tests.js',
  'docs/RUNTIME-COMPACTION.md',
  'docs/v9.29.md'
 ]
};
base.contracts['runtime-test-retirement-policy']={
 acceptance:[
  'Runtime retirement has a documented current-owner -> equivalence -> fixture/current-owner test -> live-layer removal -> obsolete-test retirement lifecycle; development uses a focused scope check; final/main preservation uses one named historical contract runner; stale historical assertions may be narrowed only when equivalent or stronger durable behavior protection remains.'
 ],
 validationCommands:[
  'node tools/validate-historical-tests.js',
  'node tools/run-historical-contracts.js',
  'node tests/run-v9.29-tests.js'
 ],
 proofFiles:[
  'docs/RUNTIME-COMPACTION.md',
  'tools/scope-check.js',
  'tools/run-historical-contracts.js',
  'tests/run-v9.28-tests.js',
  'tests/run-v9.29-tests.js',
  'README.md',
  'docs/v9.29.md'
 ]
};
base.contracts['qa-playwright-smoke']={
 acceptance:[
  'A real Chromium smoke gate opens Home, Targets, Evidence, Next Steps, Report, and Dashboard; fails on console errors, page errors, and failed same-origin requests; captures full-page screenshots; and records Dashboard paints through the historical timer window so any non-current dashboard owner fails CI.'
 ],
 validationCommands:[
  'node tests/playwright-smoke.js',
  'node tests/run-v9.29-tests.js'
 ],
 proofFiles:[
  'tests/playwright-smoke.js',
  '.github/workflows/browser-smoke.yml',
  'assets/runtime-current.js',
  'assets/dashboard-route-current.js',
  'tests/run-v9.29-tests.js',
  'docs/RUNTIME-COMPACTION.md',
  'docs/v9.29.md'
 ]
};
base.version='9.29.0';
})(typeof window!=='undefined'?window:globalThis);