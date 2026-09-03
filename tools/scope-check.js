'use strict';
const cp=require('child_process');
const path=require('path');
const root=path.join(__dirname,'..');
const checks=[
 ['tools/validate-notes-impact.js'],
 ['tools/validate-note-integration.js'],
 ['tools/validate-note-mechanic-backfill.js'],
 ['tools/validate-product-hardening-queue.js'],
 ['tools/sync-current-styles.js','--check'],
 ['tools/validate-style-current-equivalence.js'],
 ['tools/validate-runtime-manifest.js'],
 ['tools/validate-runtime-loading.js'],
 ['tools/validate-current-boot.js'],
 ['tools/sync-domain-current.js','--check'],
 ['tools/validate-domain-current-equivalence.js'],
 ['tools/sync-core-current.js','--check'],
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
 ['tests/run-v9.29-tests.js'],
 ['tests/run-v9.31-tests.js'],
 ['tests/run-v9.40-tests.js'],
 ['tests/run-v9.41-tests.js'],
 ['tests/run-v9.42-tests.js'],
 ['tests/run-v9.43-tests.js'],
 ['tests/run-v9.44-tests.js'],
 ['tests/run-v9.45-tests.js'],
 ['tests/run-v9.46-tests.js'],
 ['tests/run-v9.47-tests.js'],
 ['tests/run-v9.48-tests.js'],
 ['tests/run-v9.49-tests.js']
];
for(const args of checks){
 const result=cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});
 process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');
 if(result.status!==0)process.exit(result.status||1);
}
console.log('Current product-hardening scope check passed.');
