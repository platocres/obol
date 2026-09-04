'use strict';
// v9.54 regression: Linux privilege-escalation source re-mining batch 1
// is recorded from complete sequential packets and the mined value is converted
// into contextual Next Steps cards and existing-card enhancements in the same pass.
const assert=require('assert');
const cp=require('child_process');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');

function run(args){
 const r=cp.spawnSync(process.execPath,args.map((p,i)=>i===0?path.join(root,p):p),{cwd:root,encoding:'utf8'});
 assert.strictEqual(r.status,0,args.join(' ')+'\n'+((r.stdout||'')+(r.stderr||'')));
 return (r.stdout||'')+(r.stderr||'');
}

run(['tests/run-v9.53-tests.js']);
run(['tools/validate-note-remining-audits.js']);

const {loadCurrent}=require('../tools/current-runtime');
const {loadProgressProjection,validateReMiningAudits,DEFAULT_DIMENSIONS}=require('../tools/validate-note-remining-audits');
loadCurrent(root);
loadProgressProjection(root);

const progress=global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS;
assert(progress,'note progress projection loads');
assert.strictEqual(progress.schemaVersion,'1.8.0');
assert(progress.remining,'re-mining projection exists');
assert.strictEqual(progress.remining.sourceRequired,true);
assert.strictEqual(progress.remining.negativeProofRequired,true);
assert.strictEqual(progress.remining.actualPathRequired,true);
assert.strictEqual(progress.remining.noNewWrappers,true);
assert.strictEqual(progress.remining.latestWave,'v9.54-linux-privesc-remine-batch1');
assert.strictEqual(progress.remining.latestBatchSource,'complete sequential packets');
assert.deepStrictEqual(progress.remining.latestBatchPackets,[
 'data/review-packets/offsec-pen-200-04.json',
 'data/review-packets/offsec-pen-200-05.json'
]);

const workflowSource=fs.readFileSync(path.join(root,'assets/workflow-current.js'),'utf8');
const dashboardSandbox={
 OBOL_PRODUCT_HARDENING_NOTE_PROGRESS:progress,
 renderProductHardeningDashboard(){return true;},
 document:{readyState:'complete',title:'',documentElement:{},addEventListener(){},querySelector(){return null;},querySelectorAll(){return[];},createElement(){return {className:'',dataset:{},innerHTML:'',querySelector(){return null;},querySelectorAll(){return[];},insertAdjacentElement(){},appendChild(){},classList:{toggle(){}}};}},
 location:{hash:'#/dashboard'},
 setTimeout(){},
 MutationObserver:undefined,
 console,
 addEventListener(){}
};
dashboardSandbox.window=dashboardSandbox;
vm.runInNewContext(workflowSource,dashboardSandbox,{filename:'assets/workflow-current.js'});
assert(dashboardSandbox.OBOL_CURRENT_WORKFLOW,'workflow owner should expose current workflow API');
assert.strictEqual(typeof dashboardSandbox.OBOL_CURRENT_WORKFLOW.patchMinedAdditions,'function','dashboard must expose mine-then-use patching');
assert.strictEqual(dashboardSandbox.OBOL_CURRENT_WORKFLOW.patchMinedAdditions(),true,'dashboard patch should resolve mined Linux gaps into contextual path additions');
const patched=dashboardSandbox.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS;

global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS=patched;
const rows=patched.remining.auditRows;
assert.strictEqual(rows.length,19,'v9.54 should add four Linux rows to the 15-row Windows re-mining baseline');
assert.strictEqual(patched.remining.audited,19);
assert.strictEqual(patched.remining.reminedNoteCount,19);
assert.strictEqual(patched.remining.outcomeCounts.added,25);
assert.strictEqual(patched.remining.outcomeCounts.covered,150);
assert.strictEqual(patched.remining.outcomeCounts.queued,16);
assert.strictEqual(patched.remining.outcomeCounts['private-only'],24);
assert.strictEqual(patched.remining.outcomeCounts['not-applicable'],89);
assert.strictEqual(patched.remining.outcomeCounts.blocked,0);
assert.strictEqual(patched.remining.latestBatchMode,'mine-then-contextualize');
assert.strictEqual(patched.remining.dashboardNote,'v9.54 Linux findings were mined into contextual Next Steps cards and an online-brute enhancement, not a standalone generic panel.');
assert(patched.remining.reminedThemes.includes('windows-privesc'),'Windows re-mining theme is preserved');
assert(patched.remining.reminedThemes.includes('linux-privesc'),'Linux re-mining theme is now visible');
assert.strictEqual(patched.remining.minedAdditions.length,4,'dashboard should record four tangible mined additions');
assert.strictEqual(dashboardSandbox.OBOL_PRODUCT_HARDENING_MINED_ADDITIONS.integration,'contextual-next-step-cards','dashboard global should describe item-level path integration');
assert.strictEqual(dashboardSandbox.OBOL_PRODUCT_HARDENING_MINED_ADDITIONS.additions.length,4,'dashboard global should expose mined additions');

const linuxIds=[
 'offsec-pen-200-7d8319c3e311e160',
 'offsec-pen-200-37660dafbcec416c',
 'offsec-pen-200-ea0ee100f0506b3f',
 'offsec-pen-200-dcd4a16bbbfe100e'
];
for(const id of linuxIds){
 const row=rows.find(entry=>entry.noteId===id&&entry.reviewWave==='v9.54-linux-privesc-remine-batch1');
 assert(row,`missing Linux re-mining audit row ${id}`);
 assert.strictEqual(row.originalSourceReread,true,`${id} must confirm original source reread`);
 assert(row.sourcePacket&&row.sourcePacket.includes('platocres/obol-source-notes@agent/review-packets'),`${id} must cite the complete packet source`);
 assert.strictEqual(row.minedIntoProduct,true,`${id} must be marked as mined into product behavior`);
 assert.deepStrictEqual(row.productGaps,[],`${id} should not leave v9.54 findings parked as product gaps`);
 for(const dimension of DEFAULT_DIMENSIONS){
  assert(row.decisions[dimension],`${id} missing ${dimension}`);
  assert(row.decisions[dimension].outcome,`${id} missing ${dimension} outcome`);
 }
}

const userTrail=rows.find(row=>row.noteId==='offsec-pen-200-37660dafbcec416c'&&row.reviewWave==='v9.54-linux-privesc-remine-batch1');
assert(userTrail.decisions['tool-cards'].pathIds.includes('candidate-credential-validation'),'user-trails re-mining should add a credential validation card instead of only queuing Hydra work');
assert(userTrail.decisions['command-templates'].pathIds.includes('credential-pattern-wordlist-helper'),'user-trails re-mining should add the public-safe credential pattern helper card');
assert(userTrail.decisions['terminal-analyzers'].pathIds.includes('linux-user-trail-secret-review'),'user-trails re-mining should add the user-trail review path card');

const sudo=rows.find(row=>row.noteId==='offsec-pen-200-dcd4a16bbbfe100e'&&row.reviewWave==='v9.54-linux-privesc-remine-batch1');
assert(sudo.decisions['terminal-analyzers'].pathIds.includes('linux-sudo-list-review'),'sudo re-mining should add a sudo -l review path card');

const cron=rows.find(row=>row.noteId==='offsec-pen-200-ea0ee100f0506b3f'&&row.reviewWave==='v9.54-linux-privesc-remine-batch1');
assert(cron.decisions['terminal-analyzers'].pathIds.includes('linux-cron-proof-chain'),'cron re-mining should add a cron proof-chain path card');

const service=rows.find(row=>row.noteId==='offsec-pen-200-7d8319c3e311e160'&&row.reviewWave==='v9.54-linux-privesc-remine-batch1');
assert(service.decisions['terminal-analyzers'].pathIds.includes('linux-process-traffic-secret-review'),'service-footprint re-mining should add a process/traffic path card');

const credentialSource=fs.readFileSync(path.join(root,'assets/credential-material-current.js'),'utf8');
for(const expected of [
 'installLinuxSourceMinedPathCards',
 'linux-sudo-list-review',
 'linux-cron-proof-chain',
 'linux-user-trail-secret-review',
 'linux-process-traffic-secret-review',
 'candidate-credential-validation',
 'credential-pattern-wordlist-helper',
 'online-brute path item',
 'contextual Next Steps card gated'
]){
 assert(credentialSource.includes(expected),`credential/path mechanic source must include ${expected}`);
}
assert(!credentialSource.includes('data-linux-source-mined-mechanics'),'v9.54 findings must not be parked in a standalone generic path panel');

const credentialSandbox={
 OBOL_LANES:[{lane:'cracking',phase:'Credential Attacks',title:'Password Attacks & Cracking',version:0.1,cards:[{id:'online-brute',lane:'cracking',title:'Online Brute Force (hydra)',hypothesis:'base',commands:[],expected:[],onFailure:{}}]}],
 location:{hash:'#/path'},
 setTimeout(fn){if(typeof fn==='function')fn();},
 console
};
vm.runInNewContext(credentialSource,credentialSandbox,{filename:'assets/credential-material-current.js'});
assert(credentialSandbox.OBOL_CREDENTIAL_MATERIAL_UI,'credential material UI should expose path-card installer');
assert.strictEqual(typeof credentialSandbox.OBOL_CREDENTIAL_MATERIAL_UI.installLinuxSourceMinedPathCards,'function');
assert.strictEqual(credentialSandbox.OBOL_CREDENTIAL_MATERIAL_UI.installLinuxSourceMinedPathCards(),true);
const allCards=credentialSandbox.OBOL_LANES.flatMap(lane=>lane.cards||[]);
for(const cardId of ['linux-sudo-list-review','linux-cron-proof-chain','linux-user-trail-secret-review','linux-process-traffic-secret-review','candidate-credential-validation','credential-pattern-wordlist-helper']){
 const card=allCards.find(row=>row.id===cardId);
 assert(card,`missing contextual path card ${cardId}`);
 assert(card.sourceMined54&&card.sourceMined54.wave==='v9.54-linux-privesc-remine-batch1',`${cardId} must carry source-mined provenance`);
 assert(card.prereq&&Object.keys(card.prereq).length,`${cardId} must be gated by real lab state`);
}
const onlineBrute=allCards.find(row=>row.id==='online-brute');
assert(onlineBrute.sourceMined54,'existing online-brute card should be enhanced, not replaced');
assert(onlineBrute.commands.some(cmd=>String(cmd.run).includes('hydra -L {{userlist}} -P {{wordlist}} -t 4 -V {{target}} {{service}}')),'online-brute should get the source-mined validation template');

const docs=fs.readFileSync(path.join(root,'docs/AGENT-WORKFLOW.md'),'utf8');
assert(docs.includes('Mine, then use it in the same pass'),'agent workflow must state the mine-then-use rule');
assert(docs.includes('attach the finding to an existing Next Steps item'),'agent workflow must require existing path-item enhancement when possible');
assert(docs.includes('create a new gated Next Steps item'),'agent workflow must require contextual path insertion for new findings');
assert(docs.includes('A generic panel on `#/path` is not enough'),'agent workflow must forbid generic path-page parking');
assert(docs.includes('Queued is not a successful resting state'),'agent workflow must forbid parking useful findings as future gaps');
assert(docs.includes('public-safe useful finding'),'agent workflow must define what agents have to incorporate');

assert.deepStrictEqual(validateReMiningAudits(patched),[],'published re-mining audits must pass the permanent validator after contextual mine-then-use conversion');

console.log('v9.54 Linux re-mining contextual mine-then-use regression passed.');
