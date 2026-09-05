'use strict';
const assert=require('assert');
const path=require('path');
const root=path.join(__dirname,'..');
globalThis.OBOL_NOTE_INTEGRATION={publicFieldNotes:[],reviewedDispositions:[],ledger:{expectedNotes:556,reviewedCount:135},validate:()=>[]};
globalThis.OBOL_PRODUCT_HARDENING={tracks:[{id:'notes-integration',complete:55,total:556}],items:[{id:'notes-mechanic-backfill',status:'queued'},{id:'notes-disposition-burn-down',status:'queued'}]};
globalThis.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS={reviewed:135,total:556,remining:{reminedNoteCount:127,audited:127,oldRubricOnlyRemaining:8,auditRows:[]}};
globalThis.OBOL_LANES=[{id:'linux-privesc',lane:'linux-privesc',title:'Linux Privilege Escalation',cards:[]}];
globalThis.CARDS={};
globalThis.OBOL_INTAKE_V21={analyzeTerminal:()=>({activities:[]})};
globalThis.liveCardById=(id)=>globalThis.CARDS[id]||null;
const mod=require(path.join(root,'data/product-hardening/linux-final-remine-batch-v9.72.js'));
assert.deepStrictEqual(mod.validate(),[]);
assert.strictEqual(mod.remineAuditRows.length,8,'v9.72 should close the final 8 old-rubric rows');
assert.strictEqual(mod.publicNotes.length,5,'v9.72 should publish five public-safe notes');
for(const row of mod.remineAuditRows){
 assert.strictEqual(row.selectorBatch,'notes-batch-old-rubric-reviewed-remine-004');
 assert.strictEqual(row.originalSourceReread,true);
 for(const dimension of ['path-bindings','tool-cards','gui-controls','scripts-one-liners','command-templates','terminal-analyzers','evidence-expectations','path-movement','lesson-boxes','examples','troubleshooting','cleanup','report-guidance','product-mechanics','product-gaps','orange-baseline']) assert.ok(row.decisions&&row.decisions[dimension],row.noteId+' missing '+dimension);
}
for(const id of ['linux-service-footprint-secret-review','linux-privesc-boundary-sweep']){
 const card=globalThis.CARDS[id];
 assert.ok(card,id+' should exist');
 assert.ok(Array.isArray(card.commands)&&card.commands.length>=4,id+' should have a real command spine');
 assert.ok(card.commands.every(command=>command.tool&&command.run&&command.when&&command.evidence),id+' command schema should be tool/run/when/evidence');
 assert.ok(Array.isArray(card.expectedEvidence)&&card.expectedEvidence.length>=4,id+' needs paste-back evidence guidance');
 assert.ok(Array.isArray(card.failureModes)&&card.failureModes.length>=4,id+' needs decision/failure guidance');
 assert.ok(card.lesson&&card.lesson.length>60,id+' needs lesson context attached to action');
}
assert.strictEqual(globalThis.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.reminedNoteCount,135);
assert.strictEqual(globalThis.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.oldRubricOnlyRemaining,0);
assert.strictEqual(globalThis.OBOL_PRODUCT_HARDENING.nextNotesBatch.id,'notes-disposition-pending-review-001');
assert.strictEqual(globalThis.OBOL_PRODUCT_HARDENING.items.find(i=>i.id==='notes-mechanic-backfill').status,'complete');
const intake=globalThis.OBOL_INTAKE_V21.analyzeTerminal('ps auxww root sshpass password env SCRIPT_CREDENTIALS sudo -l NOPASSWD find / -perm -4000 -type f -ls getcap cap_setuid+ep cron ExecStart uname -a PRETTY_NAME');
assert.ok(intake.activities.some(activity=>activity.analyzerId==='linux-footprint-evidence-analyzer'));
assert.ok(intake.activities.some(activity=>activity.analyzerId==='linux-privesc-boundary-analyzer'));
console.log('v9.72 Linux final source re-mining validator passed.');
