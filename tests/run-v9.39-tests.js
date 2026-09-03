'use strict';
const assert=require('assert');const fs=require('fs');const path=require('path');const vm=require('vm');const cp=require('child_process');
const root=path.join(__dirname,'..');const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/note-integration.js','data/note-integration-reviews.js','data/note-integration-packets.js','data/product-hardening/note-progress-current.js','data/product-hardening/notes-impact-current.js','data/field-notes.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const w=sandbox.window,release=w.OBOL_CURRENT_RELEASE,impact=w.OBOL_PRODUCT_HARDENING_NOTES_IMPACT;
let passed=0;function test(n,f){try{f();console.log('ok - '+n);passed++;}catch(e){console.error('FAIL - '+n);throw e;}}

test('v9.39 current release authority is bumped and consistent',()=>{
 assert(release&&impact,'v9.39 current owners load');
 const rp=String(release.version).split('.').map(Number);assert(rp[0]===9&&rp[1]>=39,'v9.39+ current release required');
 assert.strictEqual(release.label,'v'+rp[0]+'.'+rp[1]);
 const readme=read('README.md');assert(/Current release: \*\*v9\.\d+(?:\.\d+)?\*\*/.test(readme),'README exposes current v9 release');
 assert(read('CHANGELOG.md').includes('## '+release.label+' '),'CHANGELOG documents the current release');
 assert(read('docs/'+release.label+'.md').includes('# Obol '+release.label),'release doc exists for the current release');
});

test('v9.39 historical contract runner runs its gate in parallel without losing coverage',()=>{
 const runner=read('tools/run-historical-contracts.js');
 assert(/runPool/.test(runner)&&/CONCURRENCY/.test(runner),'runner uses a bounded worker pool');
 assert(runner.includes("'--check'"),'runner still syntax-checks every file');
 assert(/run-v\.\*-tests\\\.js|run-v\.\*-tests\.js|\/\^run-v/.test(runner),'runner still discovers and runs every historical suite');
 assert(runner.includes('Complete historical contract runner passed.'),'runner preserves its completion contract');
});

test('v9.39 dashboard surfaces the notes conversion metrics at a glance',()=>{
 const dash=read('assets/product-hardening-dashboard.js');
 assert(dash.includes('Mechanic conversion'),'dashboard shows mechanic conversion');
 assert(dash.includes('Guidance-only backlog'),'dashboard shows the guidance-only backlog ratchet');
 assert(dash.includes('Script-bound guidance'),'dashboard shows script-bound guidance');
 assert(dash.includes('glanceHtml'),'dashboard renders an at-a-glance summary strip');
 // The projection the dashboard reads still exposes those fields.
 assert(impact.rubric&&typeof impact.rubric.mechanicConversionPct==='number','notes-impact rubric exposes mechanic conversion');
 assert(typeof impact.outputCounts.scriptGuidance==='number','notes-impact counts script guidance');
});

test('v9.39 release contract and current-state validators pass',()=>{
 for(const args of [['tools/validate-release-pr.js'],['tools/validate-current-release.js'],['tools/validate-product-hardening-queue.js'],['tools/validate-current-workflow.js'],['tools/validate-notes-impact.js'],['tools/sync-product-build-next.js','--check'],['tools/sync-current-release.js','--check']]){
  const r=cp.spawnSync(process.execPath,args.map((p,i)=>i===0?path.join(root,p):p),{cwd:root,encoding:'utf8',env:process.env});
  assert.strictEqual(r.status,0,(args.join(' ')+': '+(r.stderr||r.stdout||'failed')).trim());
 }
});

console.log(passed+' v9.39 tests passed');
