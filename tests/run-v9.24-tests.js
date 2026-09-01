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

const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts.js','data/product-hardening/item-test-contracts-tunnels.js','data/manual-outcomes.js','data/lanes.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const release=sandbox.window.OBOL_CURRENT_RELEASE,q=sandbox.window.OBOL_PRODUCT_HARDENING,packages=sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES,contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS,manual=sandbox.window.OBOL_MANUAL_OUTCOMES,lanes=sandbox.window.OBOL_LANES||[];
assert(release&&q&&packages&&contracts&&manual,'v9.24 stable owners load');
assert.strictEqual(release.version,'9.24.0');assert.strictEqual(release.label,'v9.24');assert.strictEqual(release.orangeBaseline,'v8.8');

const completed=['manual-schema','manual-ui','manual-success-unlocks','manual-failure-triage','manual-proof-report','manual-queue-interaction','manual-tests','manual-all-cards'];
for(const id of completed){const item=q.items.find(entry=>entry.id===id);assert(item&&item.status==='complete','v9.24 completes '+id);assert(!q.buildNext(1000).some(entry=>entry.id===id),id+' leaves Product Build Next');const contract=contracts.contracts[id];assert(contract&&contract.acceptance.length&&contract.validationCommands.length&&contract.proofFiles.length,id+' owns item-specific proof');assert(contract.validationCommands.includes('node tests/run-v9.24-tests.js'),id+' contract names v9.24 regressions');for(const rel of contract.proofFiles)assert(exists(rel),'v9.24 proof file exists for '+id+': '+rel);}
assert.strictEqual(contracts.version,'9.24.0');
assert.strictEqual(q.tracks.find(track=>track.id==='manual-outcomes').complete,8,'Manual outcomes reaches 8/8');
assert.strictEqual(q.totals().complete,61,'Product Hardening reaches 61 complete');assert.strictEqual(q.totals().queued,13,'eight manual-outcome items leave queued state');assert.strictEqual(q.totals().modeled,9,'foundation modeled count stays stable');
assert(q.buildNext(1)[0]&&q.buildNext(1)[0].id==='notes-enex-extraction','Product Build Next advances to notes extraction');
assert(packages.recommend(q)&&packages.recommend(q).id==='notes-integration-platform','Notes Integration Foundation becomes recommended');
assert.strictEqual(packages.packageForItem('manual-queue-interaction').id,'manual-outcome-platform','queue interaction is first-class in the v9.24 package');
assert.strictEqual(packages.packageForItem('manual-all-cards').id,'manual-outcome-platform','all-card coverage is first-class in the v9.24 package');
assert.deepStrictEqual(Array.from(packages.validate(q)),[],'work-package projection remains valid');

assert.strictEqual(manual.version,'1.0.0');assert.deepStrictEqual(Array.from(manual.OUTCOMES),['success','failed','blocked','skipped']);assert(manual.WORKFLOW_STATES.includes('tried'),'manual schema retains tried as a workflow state');
for(const reason of ['auth-failed','timeout','no-results','syntax-issue','blocked','not-vulnerable','other'])assert(manual.validateFailureReason(reason),'failure triage supports '+reason);
const state={manualOutcomes:[],activities:[],facts:[],queuedIntents:[]};
const success=manual.record(state,{id:'mo-success',actionId:'card-a',cardId:'card-a',label:'Card A',contextKey:'host:h1',outcome:'success',evidenceIds:['forged-proof']});assert.strictEqual(success.tried,true);assert.strictEqual(success.needsEvidenceForReport,true);assert.strictEqual(success.reportState,'unproven');assert.deepStrictEqual(Array.from(success.evidenceIds),[],'record creation cannot self-declare Evidence support');assert.deepStrictEqual(JSON.parse(JSON.stringify(manual.signal(success))),{advance:true,recalculate:true,triage:'continue',needsEvidenceForReport:true});
const failed=manual.record(state,{id:'mo-failed',actionId:'card-b',cardId:'card-b',outcome:'failed',reason:'auth-failed'});assert.strictEqual(manual.signal(failed).triage,'retry-or-alternate');assert(manual.triage(failed).includes('Evidence'),'failure triage directs the operator back through Evidence');
const blocked=manual.record(state,{id:'mo-blocked',actionId:'card-c',cardId:'card-c',outcome:'blocked'});assert.strictEqual(blocked.reason,'blocked');assert.strictEqual(manual.signal(blocked).triage,'resolve-blocker');
const skipped=manual.record(state,{id:'mo-skipped',actionId:'card-d',cardId:'card-d',outcome:'skipped'});assert.strictEqual(manual.signal(skipped).triage,'defer-or-alternate');

const queued={id:'qi-card-a',cardId:'card-a',status:'queued',attemptCount:0};manual.applyQueueOutcome(queued,success);assert.strictEqual(queued.status,'completed');assert.strictEqual(queued.attemptCount,1);assert.strictEqual(queued.lastOutcome,'success');assert.strictEqual(queued.needsEvidenceForReport,true);manual.applyQueueOutcome(queued,failed);assert.strictEqual(queued.status,'failed');assert.strictEqual(queued.attemptCount,2,'queued intent survives outcome changes and accumulates attempts');

state.activities=[{id:'activity-success',cardId:'card-a',result:'success',manualOutcomeId:'mo-success'}];state.facts=[{id:'foothold.linux',source:'manual-outcome:mo-success',evidence:'operator assertion'},{id:'manual.fake',source:'manual',evidence:'typed manually'},{id:'scan.initial',source:'intake:nmap',evidence:'Nmap scan reviewed and applied'}];success.activityId='activity-success';
let projected=manual.projectReportState(state);assert.strictEqual(projected.activities[0].result,'manual-success-unproven','unsupported manual success is not report-ready success');assert(!projected.facts.some(f=>f.source==='manual-outcome:mo-success'),'unsupported manual workflow facts are projected out of reports');assert(projected.facts.some(f=>f.source==='intake:nmap'),'independent Evidence facts survive report projection');assert(manual.reportSection(state).includes('UNPROVEN — needs Evidence'),'manual assertions remain visible as unproven');
assert.throws(()=>manual.attachEvidence(state,'mo-success','made-up-evidence'),/not a reviewed non-manual Evidence record/,'arbitrary Evidence labels cannot launder a manual assertion');assert.throws(()=>manual.attachEvidence(state,'mo-success','manual.fake'),/not a reviewed non-manual Evidence record/,'manually typed facts cannot satisfy the proof gate');assert(manual.reviewedEvidenceRecord(state,'scan.initial'),'reviewed intake fact is recognized as Evidence');manual.attachEvidence(state,'mo-success','scan.initial');assert.strictEqual(success.needsEvidenceForReport,false);assert.strictEqual(success.reportState,'supported');projected=manual.projectReportState(state);assert.strictEqual(projected.activities[0].result,'success','linked Evidence restores supported activity to report projection');assert(projected.facts.some(f=>f.source==='manual-outcome:mo-success'),'supported workflow fact may remain in the report projection');assert(manual.reportSection(state).includes('SUPPORTED — Evidence linked'),'report section identifies linked Evidence');assert(manual.reportSection(state).includes('scan.initial'),'report section carries Evidence lineage');

const coverage=manual.coverageForCards(lanes);const runnable=coverage.filter(row=>row.runnable);assert(runnable.length>0,'methodology contains runnable cards');assert(runnable.every(row=>row.disposition==='manual-outcome'),'every runnable base methodology card has the stable manual-outcome disposition');
const ui=read('assets/manual-outcomes-current.js');for(const token of ['Mark successful','Mark failed','Mark blocked','Mark skipped','data-cardroot','data-manual-queue-outcome','needs Evidence for report','Reviewed Evidence fact ID','installReportBoundary','projectReportState'])assert(ui.includes(token),'manual outcome UI contains '+token);assert(ui.includes('[data-mark=\\"tried\\"],[data-mark=\\"success\\"]')||ui.includes('[data-mark="tried"],[data-mark="success"]'),'legacy tried/success controls are intercepted rather than allowed to bypass the boundary');
const runtime=read('assets/runtime-current.js');for(const token of ['function loadManualOutcomes','data/manual-outcomes.js','assets/manual-outcomes-current.js','manualOutcomes'])assert(runtime.includes(token),'runtime hydration contains '+token);
const source=read('data/manual-outcomes.js')+'\n'+ui;for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!source.includes(forbidden),'Manual Outcome Platform contains no execution primitive '+forbidden);
for(const forbidden of ['assets/obol-v9.24.css','assets/app-v9.24.js','assets/core-v9.24.js','data/project-model-v9.24.js'])assert(!exists(forbidden),'no fake v9.24 runtime overlay: '+forbidden);
assert(read('assets/core-v8.8.js').includes("const VERSION=P.version"),'workspace runtime remains on the v8.8 owner');assert(exists('docs/v9.24.md'),'v9.24 release documentation exists');

const readme=read('README.md');assert(readme.includes('Current release: **v9.24**'),'README identifies v9.24 as current');assert(readme.includes('**Current product-hardening queue:** 61/632 complete (10%), 13 queued, 9 foundation items modeled.'),'README reports v9.24 queue totals');assert(readme.includes('**Manual outcomes:** 8/8 complete (100%)'),'README reports complete Manual Outcomes track');assert(readme.includes('**Recommended work package:** **Notes Integration Foundation**'),'README advances Product Build Next to Notes Integration Foundation');
for(const command of [['tools/validate-product-hardening-queue.js'],['tools/validate-current-workflow.js'],['tools/validate-asset-references.js'],['tools/validate-current-release.js'],['tools/sync-current-release.js','--check'],['tools/sync-product-build-next.js','--check'],['tools/validate-release-pr.js','--repo-only']]){const result=run(command);assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());}
console.log('v9.24 Manual Outcome Platform regression tests passed.');
