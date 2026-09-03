'use strict';
const assert=require('assert');const fs=require('fs');const path=require('path');const vm=require('vm');const cp=require('child_process');
const root=path.join(__dirname,'..');const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts.js','data/note-integration.js','data/note-integration-reviews.js','data/note-integration-packets.js','data/product-hardening/note-progress-current.js','data/product-hardening/notes-impact-current.js','data/field-notes.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const w=sandbox.window,release=w.OBOL_CURRENT_RELEASE,notes=w.OBOL_NOTE_INTEGRATION,q=w.OBOL_PRODUCT_HARDENING,impact=w.OBOL_PRODUCT_HARDENING_NOTES_IMPACT,contracts=w.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS,field=w.OBOL_FIELD_NOTES;
let passed=0;function test(n,f){try{f();console.log('ok - '+n);passed++;}catch(e){console.error('FAIL - '+n);throw e;}}

test('v9.36 current release authority is bumped and consistent',()=>{
 assert(release&&notes&&q&&impact&&contracts&&field,'v9.36 current owners load');
 const rp=String(release.version).split('.').map(Number);assert(rp[0]===9&&rp[1]>=36,'v9.36+ current release required');
 assert.strictEqual(release.label,'v'+rp[0]+'.'+rp[1]);
 const readme=read('README.md');assert(/Current release: \*\*v9\.\d+(?:\.\d+)?\*\*/.test(readme),'README exposes current v9 release');
 const changelog=read('CHANGELOG.md');assert(changelog.includes('## '+release.label+' '),'CHANGELOG documents the current release');
 assert(read('docs/'+release.label+'.md').includes('# Obol '+release.label),'release doc exists for the current release');
});

test('v9.36 ships the script-bound note disposition end to end',()=>{
 assert(notes.atomKinds.includes('script'),'note-integration atom kinds include script');
 assert(field.kinds.includes('script'),'public field-notes contract includes script');
 assert(impact.allowedImpactTypes.includes('script-guidance'),'notes-impact allows script-guidance');
 assert(typeof impact.outputCounts.scriptGuidance==='number','notes-impact counts script guidance');
});

test('v9.36 preserves the notes conversion rubric ratchet',()=>{
 assert(impact.rubric,'rubric projection present');
 assert.strictEqual(impact.rubric.compliant+impact.rubric.unjustifiedGuidanceOnly,impact.rubric.modeled,'rubric reconciles');
 assert(impact.rubric.unjustifiedGuidanceOnly<=impact.rubric.backlogCeiling,'guidance-only backlog stays within its ratchet ceiling');
 assert(impact.rubric.mechanicBacked>=1,'at least one modeled note declares a product mechanic');
});

test('v9.36 release contract and current-state validators pass',()=>{
 for(const args of [['tools/validate-release-pr.js'],['tools/validate-current-release.js'],['tools/validate-notes-impact.js'],['tools/validate-field-notes-ui.js'],['tools/validate-product-hardening-queue.js'],['tools/sync-product-build-next.js','--check'],['tools/sync-current-release.js','--check']]){
  const r=cp.spawnSync(process.execPath,args.map((p,i)=>i===0?path.join(root,p):p),{cwd:root,encoding:'utf8',env:process.env});
  assert.strictEqual(r.status,0,(args.join(' ')+': '+(r.stderr||r.stdout||'failed')).trim());
 }
});

console.log(passed+' v9.36 tests passed');
