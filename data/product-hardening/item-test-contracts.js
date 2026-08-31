'use strict';
(function(root){
const contracts={
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
root.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS={version:'9.1.0',requiredForStatuses,contracts};
})(typeof window!=='undefined'?window:globalThis);
