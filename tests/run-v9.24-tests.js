'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const exists=rel=>fs.existsSync(path.join(root,rel));
const run=args=>cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});
const sandbox={window:{OBOL_CURRENT_RELEASE:{version:'9.24.0',label:'v9.24',phase:'product-hardening',phaseLabel:'Product Hardening',orangeBaseline:'v8.8'}},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts.js','data/product-hardening/item-test-contracts-tunnels.js','data/manual-outcomes.js','data/lanes.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const q=sandbox.window.OBOL_PRODUCT_HARDENING,packages=sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES,contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS,manual=sandbox.window.OBOL_MANUAL_OUTCOMES,lanes=sandbox.window.OBOL_LANES||[];
assert(q&&packages&&contracts&&manual,'v9.24 historical owners load');
const completed=['manual-schema','manual-ui','manual-success-unlocks','manual-failure-triage','manual-proof-report','manual-queue-interaction','manual-tests','manual-all-cards'];
for(const id of completed){const item=q.items.find(entry=>entry.id===id);assert(item&&item.status==='complete','v9.24 completes '+id);assert(!q.buildNext(1000).some(entry=>entry.id===id),id+' leaves the historical Build Next');const contract=contracts.contracts[id];assert(contract&&contract.validationCommands.includes('node tests/run-v9.24-tests.js'),id+' keeps v9.24 proof');for(const rel of contract.proofFiles)assert(exists(rel),'v9.24 proof file exists: '+rel);}
assert.strictEqual(contracts.version,'9.24.0');
const manualTrack=q.tracks.find(track=>track.id==='manual-outcomes');
assert(manualTrack&&manualTrack.complete>=8&&manualTrack.total>=8,'v9.24 Manual Outcome 8/8 milestone remains satisfied');
assert(q.totals().complete>=61,'v9.24 Product Hardening completion milestone remains satisfied');
assert.deepStrictEqual(Array.from(packages.validate(q)),[],'current package projection remains valid while preserving v9.24 owners');
for(const outcome of ['success','failed','blocked','skipped'])assert(manual.OUTCOMES.includes(outcome),'v9.24 required outcome remains available: '+outcome);for(const reason of ['auth-failed','timeout','no-results','syntax-issue','blocked','not-vulnerable','other'])assert(manual.validateFailureReason(reason));
const state={manualOutcomes:[],activities:[],facts:[],queuedIntents:[]};const success=manual.record(state,{id:'mo-success',actionId:'card-a',cardId:'card-a',label:'Card A',contextKey:'host:h1',outcome:'success',evidenceIds:['forged-proof']});assert(success.needsEvidenceForReport&&success.reportState==='unproven');assert.deepStrictEqual(Array.from(success.evidenceIds),[],'record creation cannot self-declare Evidence support');const failed=manual.record(state,{id:'mo-failed',actionId:'card-b',cardId:'card-b',outcome:'failed',reason:'auth-failed'});assert.strictEqual(manual.signal(failed).triage,'retry-or-alternate');
const queued={id:'qi-card-a',cardId:'card-a',status:'queued',attemptCount:0};manual.applyQueueOutcome(queued,success);manual.applyQueueOutcome(queued,failed);assert.strictEqual(queued.status,'failed');assert.strictEqual(queued.attemptCount,2);
state.activities=[{id:'activity-success',cardId:'card-a',result:'success',manualOutcomeId:'mo-success'}];state.facts=[{id:'foothold.linux',source:'manual-outcome:mo-success',evidence:'operator assertion'},{id:'scan.initial',source:'intake:nmap',evidence:'Nmap scan reviewed and applied'}];success.activityId='activity-success';let projected=manual.projectReportState(state);assert.strictEqual(projected.activities[0].result,'manual-success-unproven');assert(!projected.facts.some(f=>f.source==='manual-outcome:mo-success'));assert.throws(()=>manual.attachEvidence(state,'mo-success','made-up-evidence'),/not a reviewed non-manual Evidence record/);manual.attachEvidence(state,'mo-success','scan.initial');projected=manual.projectReportState(state);assert.strictEqual(projected.activities[0].result,'success');
const coverage=manual.coverageForCards(lanes).filter(row=>row.runnable);assert(coverage.length&&coverage.every(row=>row.disposition==='manual-outcome'));
const ui=read('assets/manual-outcomes-current.js');for(const token of ['Mark successful','Mark failed','Mark blocked','Mark skipped','needs Evidence for report','Reviewed Evidence fact ID'])assert(ui.includes(token),'manual UI retains '+token);
for(const forbidden of ['assets/obol-v9.24.css','assets/app-v9.24.js','assets/core-v9.24.js','data/project-model-v9.24.js'])assert(!exists(forbidden),'no fake v9.24 runtime overlay');assert(exists('docs/v9.24.md'),'v9.24 release documentation remains available');
for(const command of [['tools/validate-product-hardening-queue.js'],['tools/validate-current-workflow.js'],['tools/validate-asset-references.js']]){const result=run(command);assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());}
console.log('v9.24 Manual Outcome Platform historical regression tests passed.');
