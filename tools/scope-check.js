'use strict';
const cp=require('child_process');
const path=require('path');
const root=path.join(__dirname,'..');
// Focused inner-loop gate for product-hardening work. It runs the current
// validators plus the current-behavior suites directly - no per-release replay.
const checks=[
 ['tools/validate-note-derivation-docs.js'],
 ['tools/validate-notes-impact.js'],
 ['tools/validate-note-integration.js'],
 ['tools/validate-note-mechanic-backfill.js'],
 ['tests/run-tests.js'],
 ['tests/run-notes-batch-selector-tests.js'],
 ['tests/run-v9.78-tests.js'],
 ['tests/run-v9.79-tests.js'],
 ['tools/validate-source-note-clusters.js'],
 ['tools/validate-card-action-spine-v9.71.js'],
 ['tools/validate-linux-final-remine-v9.72.js'],
 ['tools/validate-path-card-uniqueness-v9.72.js'],
 ['tools/validate-product-hardening-card-routes.js'],
 ['tools/validate-note-card-path-placement.js'],
 ['tools/validate-actionable-next-step-cards.js'],
 ['tools/validate-action-first-card-cleanup.js'],
 ['tools/validate-note-card-disposition-reconciliation.js'],
 ['tools/validate-product-hardening-queue.js'],
 ['tools/sync-current-styles.js','--check'],
 ['tools/validate-style-current-equivalence.js'],
 ['tools/validate-runtime-manifest.js'],
 ['tools/validate-runtime-loading.js'],
 ['tools/validate-current-boot.js'],
 ['tools/sync-domain-current.js','--check'],
 ['tools/validate-domain-current-equivalence.js'],
 ['tools/validate-core-current-equivalence.js'],
 ['tools/sync-app-current.js','--check'],
 ['tools/validate-app-semantic-current.js'],
 ['tools/sync-runtime-bundles.js','--check'],
 ['tools/validate-app-current-equivalence.js'],
 ['tools/validate-evidence-current-equivalence.js'],
 ['tools/validate-runtime-bundles.js'],
 ['tools/validate-runtime-consolidation-sync.js'],
 ['tools/validate-dashboard-compat-equivalence.js'],
 ['tools/validate-path-views.js'],
 ['tools/validate-current-owner-styles.js'],
 ['tools/validate-asset-references.js'],
 ['tools/audit-dashboard-runtime-dependencies.js','--require-retired'],
 ['tools/sync-current-release.js','--check'],
 ['tools/sync-product-build-next.js','--check'],
 ['tools/validate-current-release.js'],
 ['tools/validate-version-identity.js'],
 ['tools/validate-live-integration-done-gate.js']
];
for(const args of checks){
 const result=cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8',env:process.env});
 process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');
 if(result.status!==0)process.exit(result.status||1);
}
console.log('Current product-hardening scope check passed.');
