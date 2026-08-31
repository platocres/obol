'use strict';
(function(root){
const itemProof={
 'dash-product-foundation':{
  acceptance:['Standalone product-hardening dashboard renders queue totals, track progress, Build Next, and detailed ledgers.','Dashboard stays data-driven from the product-hardening queue instead of hand-coded counts.'],
  test_plan:'Exercise the dashboard foundation through the v9.0 guardrail suite and the product-hardening queue validator.',
  validation_commands:['node tests/run-v9.0-tests.js','node tools/validate-product-hardening-queue.js','node tools/validate-asset-references.js'],
  required_tests:['tests/run-v9.0-tests.js','tools/validate-product-hardening-queue.js'],
  proof_files:['product-hardening.html','assets/product-hardening-dashboard.js','assets/product-hardening-dashboard.css','data/product-hardening/product-hardening-queue.js'],
  risk:'Without this proof, the dashboard could become another hand-maintained status surface that drifts from the queue.',
  status_notes:'Modeled in v9.0 as the foundation dashboard surface.'
 },
 'readme-product-build-next':{
  acceptance:['README contains generated Product Build Next markers and generated warning text.','README Product Build Next content is derived from the same queue data as the dashboard.'],
  test_plan:'Run the Product Build Next sync check and the v9.0 guardrail suite.',
  validation_commands:['node tools/sync-product-build-next.js --check','node tests/run-v9.0-tests.js','node tools/validate-product-hardening-queue.js'],
  required_tests:['tools/sync-product-build-next.js','tests/run-v9.0-tests.js'],
  proof_files:['README.md','tools/sync-product-build-next.js','data/product-hardening/product-hardening-queue.js'],
  risk:'Without generated README proof, future agents can silently hand-edit queue status and break the dashboard/README contract.',
  status_notes:'Modeled in v9.0 as the README handoff and generated Product Build Next block.'
 },
 'runtime-no-layer-rule':{
  acceptance:['Product-hardening releases use stable non-versioned queue data instead of new product-hardening-vX files.','Product-hardening validation rejects fake v9.0 runtime overlay files.'],
  test_plan:'Run the release contract, v9.0 tests, and product-hardening validator to keep the no-new-layer rule enforced.',
  validation_commands:['node tools/validate-release-pr.js --repo-only --release-version=9.0','node tests/run-v9.0-tests.js','node tools/validate-product-hardening-queue.js'],
  required_tests:['tools/validate-release-pr.js','tests/run-v9.0-tests.js','tools/validate-product-hardening-queue.js'],
  proof_files:['tools/validate-release-pr.js','tests/run-v9.0-tests.js','tools/validate-product-hardening-queue.js'],
  risk:'Without this rule, agents can satisfy validators by adding the same release-layer sediment that product hardening is supposed to remove.',
  status_notes:'Modeled in v9.0 as a guardrail item rather than a runtime rewrite.'
 },
 'ux-build-next-top':{
  acceptance:['Product-hardening dashboard keeps overall figures and Build Next near the top.','Detailed ledgers remain below the high-level summary.'],
  test_plan:'Use the dashboard renderer assertions in v9.0 tests and the queue validator to keep the summary-first dashboard structure intact.',
  validation_commands:['node tests/run-v9.0-tests.js','node tools/validate-product-hardening-queue.js'],
  required_tests:['tests/run-v9.0-tests.js','tools/validate-product-hardening-queue.js'],
  proof_files:['assets/product-hardening-dashboard.js','assets/product-hardening-dashboard.css','product-hardening.html'],
  risk:'Without this proof, the dashboard can regress into another dense ledger wall that does not guide the next build.',
  status_notes:'Modeled in v9.0 as the dashboard layout and future-agent handoff pattern.'
 },
 'notes-private-source-pointer':{
  acceptance:['Public Obol points to platocres/obol-source-notes as the private raw-note source.','Public Obol forbids raw ENEX files and only accepts normalized derived guidance.'],
  test_plan:'Run v9.0 guardrails and product-hardening validation to prove the private-source pointer and public/private boundary remain present.',
  validation_commands:['node tests/run-v9.0-tests.js','node tools/validate-product-hardening-queue.js'],
  required_tests:['tests/run-v9.0-tests.js','tools/validate-product-hardening-queue.js'],
  proof_files:['README.md','docs/NOTES-INTEGRATION.md','data/product-hardening/product-hardening-queue.js'],
  risk:'Without this proof, agents could accidentally dump private course notes into the public Pages repo.',
  status_notes:'Modeled in v9.0 as the public/private notes boundary.'
 },
 'notes-source-inventory':{
  acceptance:['Queue and README account for 556 notes.','Queue and README account for 1326 embedded resources.'],
  test_plan:'Run v9.0 tests and product-hardening queue validation to keep source note/resource accounting stable.',
  validation_commands:['node tests/run-v9.0-tests.js','node tools/validate-product-hardening-queue.js','node tools/sync-product-build-next.js --check'],
  required_tests:['tests/run-v9.0-tests.js','tools/validate-product-hardening-queue.js','tools/sync-product-build-next.js'],
  proof_files:['data/product-hardening/product-hardening-queue.js','README.md','docs/NOTES-INTEGRATION.md'],
  risk:'Without exact note/resource accounting, notes integration can become invisible or impossible to burn down honestly.',
  status_notes:'Modeled in v9.0 from the private ENEX inventory.'
 },
 'qa-dashboard-sync':{
  acceptance:['Dashboard totals are consumed from q.totals(), q.trackSummary(), and q.buildNext().','README Product Build Next sync check remains available and enforced.'],
  test_plan:'Run product-hardening validator, Product Build Next sync, and v9.0 tests.',
  validation_commands:['node tools/validate-product-hardening-queue.js','node tools/sync-product-build-next.js --check','node tests/run-v9.0-tests.js'],
  required_tests:['tools/validate-product-hardening-queue.js','tools/sync-product-build-next.js','tests/run-v9.0-tests.js'],
  proof_files:['assets/product-hardening-dashboard.js','tools/sync-product-build-next.js','tests/run-v9.0-tests.js'],
  risk:'Without sync proof, README, dashboard, and queue totals can diverge and mislead future agents.',
  status_notes:'Modeled in v9.0 as generated dashboard/README synchronization.'
 },
 'qa-asset-test':{
  acceptance:['Asset-reference validator exists and can be run in CI.','Product-hardening dashboard references are validated as real files.'],
  test_plan:'Run asset-reference validation directly and through the v9.0 guardrail suite.',
  validation_commands:['node tools/validate-asset-references.js','node tests/run-v9.0-tests.js'],
  required_tests:['tools/validate-asset-references.js','tests/run-v9.0-tests.js'],
  proof_files:['tools/validate-asset-references.js','product-hardening.html'],
  risk:'Without asset validation, broken script and stylesheet references can ship unnoticed.',
  status_notes:'Modeled in v9.0 as the first asset-reference gate.'
 },
 'qa-release-contract-v9':{
  acceptance:['Release contract validator recognizes product-hardening releases as distinct from runtime-overlay releases.','v9.0 tests invoke the product-hardening release contract explicitly.'],
  test_plan:'Run release-contract validation and the v9.0 guardrail suite.',
  validation_commands:['node tools/validate-release-pr.js --repo-only --release-version=9.0','node tests/run-v9.0-tests.js'],
  required_tests:['tools/validate-release-pr.js','tests/run-v9.0-tests.js'],
  proof_files:['tools/validate-release-pr.js','tests/run-v9.0-tests.js','docs/v9.0.md'],
  risk:'Without a phase-aware release contract, future agents may add fake runtime overlays just to satisfy old Orange-era assumptions.',
  status_notes:'Modeled in v9.0 as the post-Orange release-contract branch.'
 }
};
const statusRules={
 statusesRequiringDefinition:['modeled','implemented','tested','complete','superseded','rejected'],
 minimumAcceptanceItems:2,
 requiredFields:['acceptance','test_plan','validation_commands','required_tests','proof_files','risk','status_notes']
};
root.OBOL_PRODUCT_HARDENING_DOD={version:'9.0.1',itemProof,statusRules};
})(typeof window!=='undefined'?window:globalThis);
