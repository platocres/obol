'use strict';
// v9.54 regression: Linux privilege-escalation source re-mining batch 1
// is recorded from complete sequential packets with full per-dimension negative proof.
const assert=require('assert');
const cp=require('child_process');
const path=require('path');
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

const rows=progress.remining.auditRows;
assert.strictEqual(rows.length,19,'v9.54 should add four Linux rows to the 15-row Windows re-mining baseline');
assert.strictEqual(progress.remining.audited,19);
assert.strictEqual(progress.remining.reminedNoteCount,19);
assert.strictEqual(progress.remining.outcomeCounts.added,7);
assert.strictEqual(progress.remining.outcomeCounts.covered,150);
assert.strictEqual(progress.remining.outcomeCounts.queued,27);
assert.strictEqual(progress.remining.outcomeCounts['private-only'],24);
assert.strictEqual(progress.remining.outcomeCounts['not-applicable'],96);
assert.strictEqual(progress.remining.outcomeCounts.blocked,0);
assert(progress.remining.reminedThemes.includes('windows-privesc'),'Windows re-mining theme is preserved');
assert(progress.remining.reminedThemes.includes('linux-privesc'),'Linux re-mining theme is now visible');

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
 for(const dimension of DEFAULT_DIMENSIONS){
  assert(row.decisions[dimension],`${id} missing ${dimension}`);
  assert(row.decisions[dimension].outcome,`${id} missing ${dimension} outcome`);
 }
}

const userTrail=rows.find(row=>row.noteId==='offsec-pen-200-37660dafbcec416c'&&row.reviewWave==='v9.54-linux-privesc-remine-batch1');
assert(userTrail.decisions['tool-cards'].gapIds.includes('gap-hydra-credential-validation-builder'),'user-trails re-mining queues the missing Hydra validation builder instead of copying a recipe');
assert(userTrail.decisions['command-templates'].gapIds.includes('gap-credential-pattern-wordlist-builder'),'user-trails re-mining queues public-safe credential pattern builder work');

const sudo=rows.find(row=>row.noteId==='offsec-pen-200-dcd4a16bbbfe100e'&&row.reviewWave==='v9.54-linux-privesc-remine-batch1');
assert(sudo.decisions['terminal-analyzers'].gapIds.includes('gap-linux-sudo-list-analyzer'),'sudo re-mining queues a sudo -l analyzer gap');

const cron=rows.find(row=>row.noteId==='offsec-pen-200-ea0ee100f0506b3f'&&row.reviewWave==='v9.54-linux-privesc-remine-batch1');
assert(cron.decisions['terminal-analyzers'].gapIds.includes('gap-linux-cron-chain-analyzer'),'cron re-mining queues a cron proof-chain analyzer gap');

const service=rows.find(row=>row.noteId==='offsec-pen-200-7d8319c3e311e160'&&row.reviewWave==='v9.54-linux-privesc-remine-batch1');
assert(service.decisions['product-gaps'].gapIds.includes('gap-linux-process-traffic-secret-analyzer'),'service-footprint re-mining queues a process/traffic secret analyzer gap');

assert.deepStrictEqual(validateReMiningAudits(progress),[],'published re-mining audits must pass the permanent validator');

console.log('v9.54 Linux re-mining batch regression passed.');
