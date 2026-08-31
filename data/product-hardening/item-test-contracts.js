'use strict';
(function(root){
const contracts={
 'cc-version-authority':{
  acceptance:['One stable current-release authority drives the live header, browser title, settings identity, report preview/footer metadata, export metadata, README current release, and Product Hardening Dashboard without changing the v8.8 workspace schema version.'],
  validationCommands:['node tools/validate-current-release.js','node tools/sync-current-release.js --check','node tests/run-v9.2-tests.js'],
  proofFiles:['data/current-release.js','assets/app-v8.8.js','assets/product-hardening-dashboard.js','product-hardening.html','README.md','tools/sync-current-release.js','tools/validate-current-release.js','tests/run-v9.2-tests.js']
 },
 'cc-asset-validation':{
  acceptance:['Every local asset reachable from Obol HTML entrypoints through src, href, srcset, poster, object data, inline or linked CSS, and supported dynamic script/style/worker loaders resolves inside the repository; missing or repository-escaping references fail validation and release smoke CI.'],
  validationCommands:['node tools/validate-asset-references.js','node tools/release-smoke.js','node tests/run-v9.3-tests.js'],
  proofFiles:['tools/validate-asset-references.js','tools/release-smoke.js','tools/release-preflight.js','tests/run-v9.3-tests.js','docs/v9.3.md']
 },
 'cc-report-version':{
  acceptance:['Final generated report metadata and footer use the current product release from data/current-release.js, stale report-owned historical version labels are removed, workspace schema identity remains separate, and operator-provided evidence text is not rewritten.'],
  validationCommands:['node tools/validate-version-identity.js','node tools/validate-current-release.js','node tests/run-v9.4-tests.js'],
  proofFiles:['data/current-release.js','assets/app-v8.8.js','tools/validate-version-identity.js','tests/run-v9.4-tests.js','docs/v9.4.md']
 },
 'cc-link-contrast':{
  acceptance:['Current workspace and Product Hardening Dashboard links use stable dark-theme link and hover colors that meet at least WCAG AA 4.5:1 contrast against supported dark panel/background surfaces, with visible focus treatment that is not conveyed by color alone.'],
  validationCommands:['node tools/validate-accessibility-contract.js','node tests/run-v9.5-tests.js'],
  proofFiles:['assets/accessibility.css','assets/product-hardening-dashboard.css','tools/validate-accessibility-contract.js','tests/run-v9.5-tests.js','docs/visual-qa/contrast-focus.md','docs/v9.5.md']
 },
 'dash-product-foundation':{
  acceptance:['Product Hardening Dashboard renders quantified totals, Build Next, track ledger, full seeded work ledger, and private notes source status from queue data.'],
  validationCommands:['node tools/validate-product-hardening-queue.js','node tests/run-v9.0-tests.js'],
  proofFiles:['product-hardening.html','assets/product-hardening-dashboard.js','assets/product-hardening-dashboard.css','data/product-hardening/product-hardening-queue.js','tests/run-v9.0-tests.js']
 },
 'readme-product-build-next':{
  acceptance:['README contains generated Product Build Next block with queue totals and highest-priority live items from product-hardening queue data.'],
  validationCommands:['node tools/sync-product-build-next.js --check','node tests/run-v9.0-tests.js'],
  proofFiles:['README.md','tools/sync-product-build-next.js','tests/run-v9.0-tests.js']
 },
 'runtime-no-layer-rule':{
  acceptance:['Product-hardening releases do not create fake v9 runtime overlay files just to satisfy historical release shape assumptions.'],
  validationCommands:['node tools/validate-product-hardening-queue.js','node tools/validate-release-pr.js --repo-only --release-version=9.0'],
  proofFiles:['tools/validate-product-hardening-queue.js','tools/validate-release-pr.js','tests/run-v9.0-tests.js']
 },
 'ux-build-next-top':{
  acceptance:['Dashboard top area presents progress figures and Product Build Next before detailed ledgers.'],
  validationCommands:['node tests/run-v9.0-tests.js'],
  proofFiles:['assets/product-hardening-dashboard.js','product-hardening.html']
 },
 'ux-keyboard-focus':{
  acceptance:['Native controls and existing non-native interactive workspace surfaces expose a clearly visible focus-visible ring; card headers, state cards, phase/toggle chips, facts, progress/timer controls, and lane tabs are keyboard reachable and activate with Enter or Space; open modals receive dialog semantics, initial focus, contained Tab order, and focus restoration on close.'],
  validationCommands:['node tools/validate-accessibility-contract.js','node tests/run-v9.5-tests.js'],
  proofFiles:['assets/accessibility.css','assets/accessibility.js','assets/app-v8.8.js','tools/validate-accessibility-contract.js','tests/run-v9.5-tests.js','docs/visual-qa/contrast-focus.md','docs/v9.5.md']
 },
 'notes-private-source-pointer':{
  acceptance:['Public Obol points agents to platocres/obol-source-notes and preserves the private raw-note boundary.'],
  validationCommands:['node tools/validate-product-hardening-queue.js','node tests/run-v9.0-tests.js'],
  proofFiles:['README.md','docs/NOTES-INTEGRATION.md','data/product-hardening/product-hardening-queue.js']
 },
 'notes-source-inventory':{
  acceptance:['Product-hardening queue accounts for 556 notes and 1326 embedded resources without committing raw ENEX files.'],
  validationCommands:['node tools/validate-product-hardening-queue.js','node tests/run-v9.0-tests.js'],
  proofFiles:['data/product-hardening/product-hardening-queue.js','tools/validate-product-hardening-queue.js','tests/run-v9.0-tests.js']
 },
 'qa-version-test':{
  acceptance:['A permanent deterministic version-identity gate proves browser title/header/settings, report metadata/footer normalization, README/dashboard release presentation, and sanitized export metadata consume the same current product release while preserving the v8.8 workspace schema identity.'],
  validationCommands:['node tools/validate-version-identity.js','node tools/validate-current-release.js','node tests/run-v9.4-tests.js'],
  proofFiles:['tools/validate-version-identity.js','tools/validate-current-release.js','tools/release-preflight.js','tests/run-v9.4-tests.js','data/current-release.js','assets/app-v8.8.js']
 },
 'qa-contrast-test':{
  acceptance:['A permanent deterministic accessibility validator calculates link/hover contrast against supported dark surfaces, verifies focus-visible and forced-colors contracts, verifies keyboard activation/modal focus management, and requires a screenshot-assisted visual QA checklist covering representative routes and viewport sizes.'],
  validationCommands:['node tools/validate-accessibility-contract.js','node tests/run-v9.5-tests.js'],
  proofFiles:['tools/validate-accessibility-contract.js','assets/accessibility.css','assets/accessibility.js','assets/product-hardening-dashboard.css','docs/visual-qa/contrast-focus.md','tests/run-v9.5-tests.js']
 },
 'qa-dashboard-sync':{
  acceptance:['Dashboard renderer consumes queue totals, track summary, Build Next, and notes repo data from one queue source.'],
  validationCommands:['node tests/run-v9.0-tests.js'],
  proofFiles:['assets/product-hardening-dashboard.js','data/product-hardening/product-hardening-queue.js']
 },
 'qa-asset-test':{
  acceptance:['Referenced scripts and stylesheets are validated so missing product-hardening assets fail CI.'],
  validationCommands:['node tools/validate-asset-references.js','node tests/run-v9.0-tests.js'],
  proofFiles:['tools/validate-asset-references.js','product-hardening.html','tests/run-v9.0-tests.js']
 },
 'qa-release-contract-v9':{
  acceptance:['Release contract validator understands post-Orange product-hardening releases and protects against fake runtime overlays.'],
  validationCommands:['node tools/validate-release-pr.js --repo-only --release-version=9.0','node tests/run-v9.0-tests.js'],
  proofFiles:['tools/validate-release-pr.js','tests/run-v9.0-tests.js']
 }
};
const requiredForStatuses=['modeled','complete','superseded','rejected'];
root.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS={version:'9.5.0',requiredForStatuses,contracts};
})(typeof window!=='undefined'?window:globalThis);
