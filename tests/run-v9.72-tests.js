'use strict';

const assert=require('assert');
const cp=require('child_process');
const path=require('path');
const root=path.join(__dirname,'..');
function run(args){const result=cp.spawnSync(process.execPath,args.map((part,index)=>index===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.status!==0)process.exit(result.status||1);}
function releaseAtLeast(label,major,minor){const m=String(label||'').match(/^v?(\d+)\.(\d+)/);return !!m&&(Number(m[1])>major||(Number(m[1])===major&&Number(m[2])>=minor));}

globalThis.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__=true;
require(path.join(root,'data/current-release.js'));
assert.ok(releaseAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,9,72),'current release should be v9.72 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/linux-final-remine-batch-v9.72.js'));
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/linux-final-route-guard-v9.72.js'));

globalThis.OBOL_NOTE_INTEGRATION={publicFieldNotes:[],reviewedDispositions:[],ledger:{expectedNotes:556,reviewedCount:135},validate:()=>[]};
globalThis.OBOL_PRODUCT_HARDENING={tracks:[{id:'notes-integration',complete:55,total:556}],items:[{id:'notes-mechanic-backfill',status:'queued',priority:87.2},{id:'notes-disposition-burn-down',status:'queued',priority:87}]};
globalThis.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS={reviewed:135,total:556,remining:{reminedNoteCount:127,audited:127,oldRubricOnlyRemaining:8,auditRows:[]}};
globalThis.OBOL_LANES=[{id:'web',lane:'web',title:'Web',cards:[]},{id:'ad-enumeration',lane:'ad-enumeration',title:'AD Enumeration',cards:[]},{id:'post-exploitation',lane:'post-exploitation',title:'Post Exploitation',cards:[]},{id:'linux-privesc',lane:'linux-privesc',title:'Linux Privilege Escalation',cards:[]}];
globalThis.CARDS={
 'credential-dump-proof-chain':{id:'credential-dump-proof-chain',title:'Credential Dump Proof Chain',expected:[],tools:[],commands:[]},
 'web-authz-boundaries':{id:'web-authz-boundaries',title:'Authorization Boundary Replay',expected:[],tools:[],commands:[]},
 'pass-the-hash-proof-chain':{id:'pass-the-hash-proof-chain',title:'Pass-the-Hash Proof Chain',expected:[],tools:[],commands:[]},
 'burp-intruder-fuzzing-workflow':{id:'burp-intruder-fuzzing-workflow',title:'Burp Intruder Fuzzing Workflow',expected:[],tools:[],commands:[]}
};
globalThis.OBOL_LANES[0].cards.push(globalThis.CARDS['credential-dump-proof-chain'],globalThis.CARDS['web-authz-boundaries'],globalThis.CARDS['pass-the-hash-proof-chain'],globalThis.CARDS['burp-intruder-fuzzing-workflow']);
globalThis.OBOL_INTAKE_V21={analyzeTerminal:()=>({activities:[]})};
globalThis.liveCardById=(id)=>globalThis.CARDS[id]||null;

require(path.join(root,'data/product-hardening/action-first-card-cleanup-v9.67.js'));
require(path.join(root,'data/product-hardening/note-card-disposition-reconciliation-v9.68.js'));
require(path.join(root,'data/product-hardening/web-upload-inclusion-remine-batch-v9.69.js'));
require(path.join(root,'data/product-hardening/client-session-remine-batch-v9.70.js'));
require(path.join(root,'data/product-hardening/ad-metasploit-remine-batch-v9.71.js'));
const whyNow=require(path.join(root,'data/product-hardening/dynamic-why-now-v9.71.js'));
const linux=require(path.join(root,'data/product-hardening/linux-final-remine-batch-v9.72.js'));
assert.deepStrictEqual(linux.validate(),[]);
assert.strictEqual(linux.remineAuditRows.length,8,'v9.72 should close the final old-rubric re-mining batch');
assert.strictEqual(linux.publicNotes.length,5,'v9.72 should publish five public-safe notes');
assert.strictEqual(linux.FOLDED_CARD,'linux-service-footprint-secret-review');
assert.ok(!globalThis.CARDS['linux-service-footprint-secret-review'],'service-footprint material must not land as a standalone primary card');
for(const row of linux.remineAuditRows){
 assert.strictEqual(row.originalSourceReread,true);
 assert.strictEqual(row.selectorBatch,'notes-batch-old-rubric-reviewed-remine-004');
 assert.ok(row.productChanges.includes('queue-gate:old-rubric-remining-complete'));
 assert.ok(row.productChanges.includes('folded-card:linux-service-footprint-secret-review'));
}
for(const note of linux.publicNotes) assert.ok((note.cardIds||[]).includes('linux-privesc-boundary-sweep') && !(note.cardIds||[]).includes('linux-service-footprint-secret-review'));
const card=globalThis.CARDS['linux-privesc-boundary-sweep'];
assert.ok(card,'linux-privesc-boundary-sweep should exist');
assert.ok(Array.isArray(card.foldedFrom)&&card.foldedFrom.includes('linux-service-footprint-secret-review'));
assert.ok(Array.isArray(card.commands)&&card.commands.length>=9,'merged card needs service-footprint plus boundary command spine');
assert.ok(card.commands.every(command=>command.tool&&command.run&&command.when&&command.evidence),'command schema should be tool/run/when/evidence');
assert.ok(card.commands.some(command=>/ps auxww/i.test(command.run)),'merged card should include service-process review');
assert.ok(card.commands.some(command=>/tcpdump/i.test(command.run)),'merged card should include bounded tcpdump review');
assert.ok(card.commands.some(command=>/sudo -l/i.test(command.run)),'merged card should include sudo boundary review');
const why=whyNow.compute(card,{factBag:{set:new Set(['linux.shell_observed','linux.local_user_context','linux.privesc_needed','credential.hunting_needed']),text:'linux.shell_observed linux.local_user_context linux.privesc_needed credential.hunting_needed target linux'}});
assert.strictEqual(why.title,'Why this step now');
assert.ok(/You have|This card is relevant/i.test(why.body),'Linux card should explain why it is relevant now');
assert.ok(/paste the result back|paste/i.test(why.body),'Linux why-now guidance should connect to evidence paste-back');
assert.ok(!/methodology gap|source-mining|UNKNOWN/i.test(why.body),'why-now guidance must not leak internal filler');
assert.strictEqual(globalThis.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.reminedNoteCount,135);
assert.strictEqual(globalThis.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.oldRubricOnlyRemaining,0);
assert.strictEqual(globalThis.OBOL_PRODUCT_HARDENING.nextNotesBatch.id,'notes-disposition-pending-review-001');
assert.strictEqual(globalThis.OBOL_PRODUCT_HARDENING.items.find(i=>i.id==='notes-mechanic-backfill').status,'complete');
const intake=globalThis.OBOL_INTAKE_V21.analyzeTerminal('ps auxww root sshpass password env SCRIPT_CREDENTIALS sudo -l NOPASSWD find / -perm -4000 getcap cap_setuid+ep cron ExecStart uname -a PRETTY_NAME tcpdump packet');
assert.ok(intake.activities.some(activity=>activity.analyzerId==='linux-footprint-evidence-analyzer'));
assert.ok(intake.activities.some(activity=>activity.analyzerId==='linux-privesc-boundary-analyzer'));
run(['tools/validate-linux-final-remine-v9.72.js']);
run(['tools/validate-card-action-spine-v9.71.js']);
run(['tools/validate-release-pr.js','--repo-only']);
console.log('v9.72 final Linux re-mining and folded-card queue handoff checks passed.');
