'use strict';
const cp=require('child_process');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const PHASES=Object.freeze(['syntax','legacy-core','v5-v8-runtime','v9-early-product','v9-mid-product','v9-current-product','quality-preservation','generated-sync']);
function walk(dir,out=[]){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(entry.name==='.git'||entry.name==='node_modules')continue;const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full,out);else if(entry.name.endsWith('.js'))out.push(full);}return out;}
function natural(a,b){return a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'});}
function resolveArgv(parts){return parts.map((part,index)=>index===0&&!String(part).startsWith('-')?path.join(root,part):part);}
function run(parts){const argv=resolveArgv(parts);const result=cp.spawnSync(process.execPath,argv,{cwd:root,encoding:'utf8'});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.status!==0)process.exit(result.status||1);}
function syntax(){const files=['assets','data','tools','tests'].flatMap(name=>walk(path.join(root,name))).sort(natural);for(const file of files){run(['--check',file]);console.log('syntax ok: '+path.relative(root,file).replace(/\\/g,'/'));}}
const PHASE_TASKS=Object.freeze({
 'legacy-core':[['tests/run-tests.js']],
 'v5-v8-runtime':[
  ['tools/validate-current-boot.js'],['tools/validate-runtime-manifest.js'],['tools/validate-runtime-bundles.js'],['tools/validate-runtime-loading.js'],['tools/validate-runtime-consolidation-sync.js'],['tools/validate-current-workflow.js'],['tools/validate-app-current-equivalence.js'],['tools/validate-app-semantic-current.js'],['tools/validate-core-current-equivalence.js'],['tools/validate-domain-current-equivalence.js'],['tools/validate-evidence-current-equivalence.js'],['tools/validate-style-current-equivalence.js'],['tools/validate-current-owner-styles.js'],['tools/validate-asset-references.js'],['tools/audit-dashboard-runtime-dependencies.js','--require-retired'],['tools/sync-app-current.js','--check'],['tools/sync-core-current.js','--check'],['tools/sync-domain-current.js','--check'],['tools/sync-current-styles.js','--check'],['tools/sync-runtime-bundles.js','--check']
 ],
 'v9-early-product':[
  ['tools/validate-actionable-next-step-cards.js'],['tools/validate-card-action-spine-v9.71.js'],['tools/validate-product-hardening-card-routes.js'],['tools/validate-path-card-uniqueness-v9.72.js'],['tools/validate-action-first-card-cleanup.js'],['tools/validate-path-views.js'],['tools/validate-field-notes-ui.js'],['tools/validate-accessibility-contract.js'],['tools/validate-responsive-layout.js'],['tools/validate-tool-builder-platform.js'],['tools/validate-dashboard-compat-equivalence.js'],['tools/validate-dashboard-freshness.js']
 ],
 'v9-mid-product':[
  ['tools/validate-note-integration.js'],['tools/validate-source-note-clusters.js'],['tools/validate-notes-impact.js'],['tools/validate-note-card-disposition-reconciliation.js'],['tools/validate-note-card-path-placement.js'],['tools/validate-note-derivation-docs.js'],['tools/validate-note-mechanic-backfill.js'],['tools/validate-note-remining-audits.js'],['tools/validate-linux-final-remine-v9.72.js']
 ],
 'v9-current-product':[
  ['tests/run-v10.02-tests.js'],['tests/run-v10.03-tests.js'],['tests/run-v10.04-tests.js'],['tests/run-v10.05-tests.js'],['tests/run-notes-batch-selector-tests.js'],['tools/validate-current-release.js'],['tools/validate-product-hardening-queue.js'],['tools/validate-version-identity.js'],['tools/validate-live-integration-done-gate.js']
 ],
 'quality-preservation':[
  ['tools/validate-pr-test-governance.js'],['tools/validate-release-pr.js'],['tools/validate-release-quality.js'],['tools/validate-readme-history-ownership.js'],['tools/validate-open-pr-uniqueness.js']
 ],
 'generated-sync':[
  ['tools/sync-readme-build-next.js','--check'],['tools/sync-product-build-next.js','--check'],['tools/sync-current-release.js','--check'],['tools/sync-core-current.js','--check'],['tools/sync-release-docs.js','--check'],['tools/sync-current-changelog.js','--check']
 ]
});
function runPhase(phase){if(phase==='syntax')syntax();else{const list=PHASE_TASKS[phase];if(!list)throw new Error('unknown regression phase: '+phase);for(const task of list)run(task);}console.log('Regression phase passed: '+phase);}
function main(){const idx=process.argv.indexOf('--phase');if(idx!==-1)return runPhase(process.argv[idx+1]);for(const phase of PHASES)runPhase(phase);console.log('Complete Obol historical/current regression contract passed.');}
try{main();}catch(err){console.error(err&&err.stack||err);process.exit(1);