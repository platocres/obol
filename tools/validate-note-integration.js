'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/note-integration.js','data/note-integration-reviews.js','data/note-integration-packets.js','data/field-notes.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const notes=sandbox.window.OBOL_NOTE_INTEGRATION,field=sandbox.window.OBOL_FIELD_NOTES;
assert(notes&&field,'notes integration and field-notes owners load');
assert.strictEqual(notes.schemaVersion,'1.8.0');
assert.strictEqual(notes.privateRepo,'platocres/obol-source-notes');
assert.deepStrictEqual(Array.from(notes.validate()),[],'notes integration data validates');
const totals=notes.totals();
assert.strictEqual(totals.notes,556);assert.strictEqual(totals.resources,1326);
assert.strictEqual(Object.values(notes.ledger.dispositionCounts).reduce((a,b)=>a+b,0),556);
assert.strictEqual(notes.ledger.reviewedCount,127);
assert.strictEqual(notes.ledger.dispositionCounts.modeled,95);
assert.strictEqual(notes.ledger.dispositionCounts['private-reference-only'],27);
assert.strictEqual(notes.ledger.dispositionCounts.superseded,5);
assert.strictEqual(notes.ledger.dispositionCounts.rejected,0);
assert.strictEqual(notes.ledger.dispositionCounts['pending-review'],429);
assert.strictEqual(notes.reviewedDispositions.length,127);
for(const row of notes.reviewedDispositions){
 assert(notes.terminalDispositions.includes(row.disposition),row.noteId+' has a terminal disposition');
 assert(row.rationale&&row.rationale.length>=24,row.noteId+' has substantive review rationale');
 assert(notes.sourceForRef(row.noteId),row.noteId+' resolves to a known private source');
 if(row.disposition==='modeled')assert(row.outputIds.length>0,row.noteId+' links a public derived output');
 else assert.strictEqual(row.outputIds.length,0,row.noteId+' does not publish output for a non-modeled disposition');
 if(row.disposition==='modeled'&&/^v9\.(?:3\d|[4-9]\d)/.test(String(row.reviewWave||'')))assert((row.productChanges&&row.productChanges.length)||row.guidanceOnlyReason,row.noteId+' records a product change or explicit guidance-only decision');
}
const milestones=[
 ['v9.25',4,4,0,0,552],['v9.26-wave-1',15,11,4,0,541],['v9.27-wave-2',41,32,9,0,515],['v9.28-wave-3',55,43,12,0,501],['v9.30-web-upload-inclusion-1',65,48,13,4,491],['v9.30-web-upload-inclusion-2',76,53,19,4,480],['v9.32-xss-session',90,63,23,4,466],['v9.33-credentials-auth',112,82,25,5,444],['v9.35-windows-privesc',127,95,27,5,429]
];
for(const [id,reviewed,modeled,privateOnly,superseded,pending] of milestones){const m=notes.milestones[id];assert(m,id+' milestone remains preserved');assert.strictEqual(m.reviewedCount,reviewed,id+' reviewed count');assert.strictEqual(m.dispositionCounts.modeled,modeled,id+' modeled count');assert.strictEqual(m.dispositionCounts['private-reference-only'],privateOnly,id+' private-only count');assert.strictEqual(m.dispositionCounts.superseded||0,superseded,id+' superseded count');assert.strictEqual(m.dispositionCounts['pending-review'],pending,id+' pending count');}
assert.strictEqual(field.entries.length,48,'forty-eight normalized public field notes are exposed');
for(const entry of field.entries){assert(entry.sourceRefs.length>0,entry.id+' keeps opaque private-ledger lineage');assert(!/\.enex\b|sources\/raw\/|HTB\{|94\.237\./i.test(JSON.stringify(entry)),entry.id+' contains no raw source path, flag, or lab target material');for(const ref of entry.sourceRefs){const row=notes.reviewedDisposition(ref);assert(row&&row.disposition==='modeled',entry.id+' only cites modeled sources');assert(row.outputIds.includes(entry.id),entry.id+' is linked from its modeled source disposition');}}
for(const id of ['note-xss-browser-execution-proof','note-xss-delivery-trigger-context','note-xss-session-impact-boundary','note-xss-remediation-context'])assert(field.entries.some(entry=>entry.id===id),'XSS/session public-safe field note exists: '+id);
for(const id of ['note-auth-material-protocol-scope','note-hash-classify-before-cracking','note-auth-rate-policy-safety','note-protected-credential-container','note-basic-auth-transport-boundary','note-windows-credential-source-boundary','note-credential-reuse-validation','note-challenge-response-not-pth'])assert(field.entries.some(entry=>entry.id===id),'credentials/auth public-safe field note exists: '+id);
for(const id of ['note-windows-privesc-enumeration-leads','note-windows-token-integrity-boundary','note-windows-privileged-execution-preconditions','note-windows-secret-hunting-boundary','note-windows-local-exploit-risk-proof'])assert(field.entries.some(entry=>entry.id===id),'Windows privilege-escalation public-safe field note exists: '+id);
const web=notes.packetReviews['web-upload-inclusion'];assert(web&&web.status==='complete');assert.strictEqual(web.candidateCount,47);assert.strictEqual(web.priorTerminalCount,35);assert.strictEqual(web.newlyTerminalCount,11);assert.strictEqual(web.deferredRefs.length,1);assert.strictEqual(web.openProductGaps.length,0);
const xss=notes.packetReviews['xss-session'];assert(xss&&xss.status==='complete');assert.strictEqual(xss.candidateCount,17);assert.strictEqual(xss.priorTerminalCount,3);assert.strictEqual(xss.newlyTerminalCount,14);assert.strictEqual(xss.deferredRefs.length,0);assert.strictEqual(xss.openProductGaps.length,0);assert.strictEqual(xss.discovery.metadataPacketCandidates,45);assert.strictEqual(xss.discovery.fullTextSweepCandidates,356);
const credentials=notes.packetReviews['credentials-auth'];assert(credentials&&credentials.status==='complete');assert.strictEqual(credentials.candidateCount,24);assert.strictEqual(credentials.priorTerminalCount,2);assert.strictEqual(credentials.newlyTerminalCount,22);assert.strictEqual(credentials.deferredRefs.length,0);assert.strictEqual(credentials.openProductGaps.length,0);assert.strictEqual(credentials.closedProductChanges.length,0);assert.strictEqual(credentials.discovery.metadataPacketCandidates,93);assert.strictEqual(credentials.discovery.fullTextSweepCandidates,385);
const windows=notes.packetReviews['windows-privesc'];assert(windows&&windows.status==='complete');assert.strictEqual(windows.candidateCount,16);assert.strictEqual(windows.priorTerminalCount,1);assert.strictEqual(windows.newlyTerminalCount,15);assert.strictEqual(windows.deferredRefs.length,0);assert.strictEqual(windows.openProductGaps.length,0);assert.strictEqual(windows.closedProductChanges.length,0);assert.strictEqual(windows.discovery.metadataPacketCandidates,32);assert.strictEqual(windows.discovery.fullTextSweepCandidates,95);
assert(notes.publicNotesForPath('path').some(n=>n.id==='note-auth-material-protocol-scope'));
assert(notes.publicNotesForTool('hashcat').some(n=>n.id==='note-hash-classify-before-cracking'));
assert(notes.publicNotesForTool('nxc').some(n=>n.id==='note-challenge-response-not-pth'));
const publicProjection=JSON.stringify({sourceInventory:notes.sourceInventory,ledger:notes.ledger,reviewedDispositions:notes.reviewedDispositions,packetReviews:notes.packetReviews,fieldNotes:Array.from(field.entries)});
for(const forbidden of ['sources/raw/','<en-note','<resource>','HTB{','94.237.'])assert(!publicProjection.includes(forbidden),'public notes projection excludes raw private-source marker '+forbidden);
const source=read('data/note-integration.js')+'\n'+read('data/note-integration-reviews.js')+'\n'+read('data/note-integration-packets.js')+'\n'+read('data/field-notes.js')+'\n'+read('assets/field-notes.js');
for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!source.includes(forbidden),'notes integration contains no execution primitive '+forbidden);
console.log('Notes integration valid: explicit 127/556 disposition ledger, 48 public-safe notes, completed Windows privilege-escalation packet, preserved milestones, and raw-source boundary are intact.');
