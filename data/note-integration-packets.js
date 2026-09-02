'use strict';
(function(root){
const base=root.OBOL_NOTE_INTEGRATION;
if(!base)throw new Error('Base note integration owner must load before packet reviews');
const WAVE='v9.30-web-upload-inclusion-2';
const PACKET_ID='web-upload-inclusion';
const freezeList=list=>Object.freeze((list||[]).slice());
const freezeRows=rows=>Object.freeze(rows.map(row=>Object.freeze({...row,outputIds:freezeList(row.outputIds),productChanges:Object.freeze((row.productChanges||[]).map(change=>Object.freeze({...change,proofRefs:freezeList(change.proofRefs)})))})));
const CANDIDATE_REFS=freezeList([
 'htb-penetration-tester-db1367c3cb696693','htb-penetration-tester-f6638e21595b7f37','htb-penetration-tester-2d27567769e89492','htb-penetration-tester-c234c00d18a235f3','htb-penetration-tester-d592517f0448201b','htb-penetration-tester-a5bfb6c1b8929288','htb-penetration-tester-b2c3e1eb214f2739','htb-penetration-tester-84952ff3cb48a763','htb-penetration-tester-7c06d706a2177e95','htb-penetration-tester-c4908e3a1e1e948d','htb-penetration-tester-65a09e67be537494','htb-penetration-tester-c9ffcfe30bb8105b','htb-penetration-tester-eb9ed63c6680ecdd','htb-penetration-tester-dcf44979c5cbeb28','htb-penetration-tester-42b27d448cc88bc4','htb-penetration-tester-b81ae4d7b1657a68','htb-penetration-tester-c89f8281ca7b1cb6','htb-penetration-tester-1031d47bd5ab9ad8','htb-penetration-tester-4d269654772ade3f','htb-penetration-tester-fa8c222163adee0f','htb-penetration-tester-93c5b5eca5b2681c','htb-penetration-tester-6791b6c6ff556cd6','htb-penetration-tester-b90fb6ba8060ca62','htb-penetration-tester-681ca4b3d5384254','htb-penetration-tester-bf66c6300266b4d0','htb-penetration-tester-f53541ee19664082','htb-penetration-tester-999330f41a434b37','htb-penetration-tester-18346c45629d79b0','htb-penetration-tester-009ff7c58b458f28','htb-penetration-tester-2926bcc5bef7edaf','htb-penetration-tester-e274dc76c977af88','htb-penetration-tester-b6c7a5bd41d8ac64','htb-penetration-tester-f4573a054a8cae90','htb-penetration-tester-bf1a8a1d0d3ea08a','offsec-pen-200-274de7c63e8361cf','offsec-pen-200-0dd449ee91b9f9c7','offsec-pen-200-e58de5584625c70d','offsec-pen-200-8e1c01abd8e9bfaa','offsec-pen-200-82e0345b8a1950d4','offsec-pen-200-4940931777995183','offsec-pen-200-20f3a62dab9956c9','offsec-pen-200-f1b46447f1c1e86f','offsec-pen-200-71ced0294b414136','offsec-pen-200-da102203eddf1c26','offsec-pen-200-bf9cd0687bdf1adf','offsec-pen-200-a7a112402600f18e','offsec-pen-200-c91e5f2c5afd78c7'
]);
const DEFERRED_REFS=freezeList(['htb-penetration-tester-65a09e67be537494']);
const NEW_ROWS=freezeRows([
 {noteId:'htb-penetration-tester-f6638e21595b7f37',disposition:'private-reference-only',reviewWave:WAVE,rationale:'This assessment is dominated by lab-specific foothold, credentials, pivoting, and outcome material. Its durable upload and AD lessons are better represented by normalized packet guidance and the later AD/pivoting packet.',outputIds:[]},
 {noteId:'htb-penetration-tester-2d27567769e89492',disposition:'private-reference-only',reviewWave:WAVE,rationale:'This source is primarily a tool-specific web-shell walkthrough. Keep the recipe private while public Obol carries generalized web-shell proof, stability, and cleanup guidance.',outputIds:[]},
 {noteId:'htb-penetration-tester-b2c3e1eb214f2739',disposition:'modeled',reviewWave:WAVE,rationale:'The transfer material adds durable operator-hygiene guidance for temporary HTTP/S transfer endpoints, encrypted transport, constrained exposure, and cleanup without treating transfer success as target proof.',outputIds:['note-transfer-endpoint-hygiene'],guidanceOnlyReason:'The current curl transfer controls already model the mechanics needed here; this source adds operational and cleanup guidance rather than a missing command option.'},
 {noteId:'htb-penetration-tester-42b27d448cc88bc4',disposition:'modeled',reviewWave:WAVE,rationale:'The web-shell introduction adds a durable operational boundary: browser command channels are often transient and should be treated as temporary control that requires explicit command-result Evidence and cleanup.',outputIds:['note-web-shell-control-cleanup'],guidanceOnlyReason:'No new shell-generation mechanic is needed; the durable product value is proof, stability, and cleanup guidance around a temporary command channel.'},
 {noteId:'htb-penetration-tester-b81ae4d7b1657a68',disposition:'private-reference-only',reviewWave:WAVE,rationale:'This note is mainly a ready-made payload/tool walkthrough. Keep the payload catalog private because public Obol should teach reviewable proof and cleanup boundaries rather than ship copied web-shell recipes.',outputIds:[]},
 {noteId:'htb-penetration-tester-93c5b5eca5b2681c',disposition:'private-reference-only',reviewWave:WAVE,rationale:'This source is primarily a SQLMap operating-system exploitation walkthrough with lab-specific outcomes. Its reusable file-write and execution-proof lesson is normalized separately without publishing the recipe.',outputIds:[]},
 {noteId:'htb-penetration-tester-681ca4b3d5384254',disposition:'modeled',reviewWave:WAVE,rationale:'The PHP shell material contributes durable engagement hygiene: record the uploaded artifact and execution identity, capture explicit command Evidence, and remove temporary shell files after testing.',outputIds:['note-web-shell-control-cleanup'],guidanceOnlyReason:'The source does not require another payload-specific builder; the reusable value is the temporary-control and cleanup workflow.'},
 {noteId:'htb-penetration-tester-e274dc76c977af88',disposition:'modeled',reviewWave:WAVE,rationale:'The shell taxonomy reinforces that a web shell is a different control channel from a reverse or bind shell and should not be treated as stable access merely because one command succeeds.',outputIds:['note-web-shell-control-cleanup'],guidanceOnlyReason:'The current workflow already separates human-run commands from proof; this source strengthens contextual guidance rather than requiring a new execution feature.'},
 {noteId:'htb-penetration-tester-bf1a8a1d0d3ea08a',disposition:'modeled',reviewWave:WAVE,rationale:'The database file-write material adds a durable proof boundary: the ability to write a server-side file is separate from whether the application can reach, interpret, or execute that file.',outputIds:['note-server-file-write-proof-boundary'],guidanceOnlyReason:'The public product needs a proof boundary rather than a database-specific write recipe; no new automated execution behavior is appropriate.'},
 {noteId:'offsec-pen-200-0dd449ee91b9f9c7',disposition:'private-reference-only',reviewWave:WAVE,rationale:'This record is primarily an automated SQL injection and shell walkthrough. Keep the detailed exploitation recipe private while normalized proof boundaries are represented elsewhere.',outputIds:[]},
 {noteId:'offsec-pen-200-71ced0294b414136',disposition:'private-reference-only',reviewWave:WAVE,rationale:'This source is primarily a database-specific manual code-execution walkthrough. Its durable execution-proof lesson is already covered by generalized proof guidance, so the recipe remains private.',outputIds:[]}
]);
const NEW_PUBLIC_NOTES=freezeList([
 Object.freeze({id:'note-transfer-endpoint-hygiene',title:'Treat temporary transfer endpoints as engagement infrastructure',body:'When an authorized workflow uses an operator-hosted HTTP or HTTPS endpoint for file transfer, prefer encrypted transport, restrict exposure to the required scope, record the transfer separately from target proof, and remove temporary files and services when the transfer is finished.',kind:'cleanup',cardIds:freezeList([]),toolIds:freezeList(['curl']),pathIds:freezeList([]),tags:freezeList(['file-transfer','operator-infrastructure','cleanup']),sourceRefs:freezeList(['htb-penetration-tester-b2c3e1eb214f2739'])}),
 Object.freeze({id:'note-web-shell-control-cleanup',title:'Treat a web shell as temporary control, not durable proof',body:'A web shell is a temporary command channel. Record the uploaded path and execution identity, capture explicit command-result Evidence, move to a more stable authorized access channel when extended interaction is needed, and remove temporary shell artifacts when testing ends. A reachable shell file alone does not prove a particular command effect.',kind:'cleanup',cardIds:freezeList([]),toolIds:freezeList(['curl']),pathIds:freezeList(['path']),tags:freezeList(['web-shell','file-upload','cleanup','evidence']),sourceRefs:freezeList(['htb-penetration-tester-42b27d448cc88bc4','htb-penetration-tester-681ca4b3d5384254','htb-penetration-tester-e274dc76c977af88'])}),
 Object.freeze({id:'note-server-file-write-proof-boundary',title:'Server-side file write is not code execution',body:'Treat a server-side file-write primitive as its own fact. Record the identity performing the write, the destination and permissions, and whether the application or another service can reach and interpret the file. Any later configuration change, authentication effect, or code execution requires separate reviewed Evidence.',kind:'evidence',cardIds:freezeList([]),toolIds:freezeList(['sqlmap','curl']),pathIds:freezeList(['path']),tags:freezeList(['file-write','proof-boundary','web-shell','sql-injection']),sourceRefs:freezeList(['htb-penetration-tester-bf1a8a1d0d3ea08a'])})
]);
const reviewed=freezeList(Array.from(base.reviewedDispositions||[]).concat(Array.from(NEW_ROWS)));
const publicFieldNotes=freezeList(Array.from(base.publicFieldNotes||[]).concat(Array.from(NEW_PUBLIC_NOTES)));
const counts={'pending-review':0,modeled:0,superseded:0,rejected:0,'private-reference-only':0};
for(const row of reviewed)counts[row.disposition]=(counts[row.disposition]||0)+1;
counts['pending-review']=Math.max(0,base.totals().notes-reviewed.length);
const frozenCounts=Object.freeze({...counts});
const milestone=Object.freeze({reviewedCount:reviewed.length,dispositionCounts:frozenCounts,publicFieldNoteIds:freezeList(publicFieldNotes.map(note=>note.id))});
const milestones=Object.freeze({...base.milestones,[WAVE]:milestone});
const ledger=Object.freeze({...base.ledger,schemaVersion:'1.5.0',reviewedCount:reviewed.length,dispositionCounts:frozenCounts,modeledSourceRefs:freezeList(reviewed.filter(row=>row.disposition==='modeled').map(row=>row.noteId)),privateReferenceSourceRefs:freezeList(reviewed.filter(row=>row.disposition==='private-reference-only').map(row=>row.noteId))});
const priorReviewedSet=new Set((base.reviewedDispositions||[]).map(row=>row.noteId));
const newReviewedSet=new Set(NEW_ROWS.map(row=>row.noteId));
const packet=Object.freeze({
 id:PACKET_ID,
 reviewWave:WAVE,
 status:'complete',
 candidateCount:CANDIDATE_REFS.length,
 candidateRefs:CANDIDATE_REFS,
 priorTerminalCount:CANDIDATE_REFS.filter(ref=>priorReviewedSet.has(ref)).length,
 newlyTerminalCount:CANDIDATE_REFS.filter(ref=>newReviewedSet.has(ref)).length,
 deferredRefs:DEFERRED_REFS,
 openProductGaps:Object.freeze([]),
 closedProductChanges:Object.freeze([
  Object.freeze({id:'curl-path-preservation-control',type:'tool-builder-change',noteRef:'offsec-pen-200-4940931777995183',proofRefs:freezeList(['assets/tool-builder-current.js','tests/run-v9.30-tests.js'])})
 ]),
 deferredTo:Object.freeze({'htb-penetration-tester-65a09e67be537494':'linux-privesc'})
});
const packetReviews=Object.freeze({...base.packetReviews,[PACKET_ID]:packet});
function reviewedDisposition(noteId){return reviewed.find(row=>row.noteId===String(noteId||'').trim())||null;}
function atomizeMetadata(raw){
 const atom=base.atomizeMetadata(raw);if(!atom)return atom;
 const row=reviewedDisposition(atom.noteId);if(!row)return atom;
 return Object.freeze({...atom,integrationStatus:'reviewed',disposition:row.disposition});
}
function publicNotesForTool(toolId){const id=String(toolId||'').trim().toLowerCase();return publicFieldNotes.filter(note=>note.toolIds.some(tool=>String(tool).toLowerCase()===id));}
function publicNotesForPath(pathId){const id=String(pathId||'').trim();return publicFieldNotes.filter(note=>note.pathIds.includes(id));}
function validate(){
 const failures=Array.from(base.validate());
 if(reviewed.length!==76)failures.push('v9.30 packet closeout reviewed count must be 76');
 if(frozenCounts.modeled!==53||frozenCounts['private-reference-only']!==19||frozenCounts.superseded!==4||frozenCounts['pending-review']!==480)failures.push('v9.30 packet closeout disposition counts are inconsistent');
 if(CANDIDATE_REFS.length!==47||new Set(CANDIDATE_REFS).size!==47)failures.push('web upload/inclusion packet candidate accounting must be 47 unique refs');
 if(packet.priorTerminalCount!==35||packet.newlyTerminalCount!==11||packet.deferredRefs.length!==1)failures.push('web upload/inclusion packet closeout accounting is inconsistent');
 const covered=new Set([...CANDIDATE_REFS.filter(ref=>priorReviewedSet.has(ref)),...CANDIDATE_REFS.filter(ref=>newReviewedSet.has(ref)),...DEFERRED_REFS]);
 if(covered.size!==CANDIDATE_REFS.length)failures.push('web upload/inclusion packet has unaccounted candidate refs');
 for(const ref of DEFERRED_REFS)if(reviewedDisposition(ref))failures.push('deferred packet ref must remain pending '+ref);
 const ids=new Set(publicFieldNotes.map(note=>note.id));
 for(const row of NEW_ROWS){
  if(!base.terminalDispositions.includes(row.disposition))failures.push('v9.30 packet row is non-terminal '+row.noteId);
  if(!row.rationale||row.rationale.length<24)failures.push('v9.30 packet row lacks rationale '+row.noteId);
  if(row.disposition==='modeled'){
   if(!row.outputIds.length)failures.push('v9.30 packet modeled row lacks output '+row.noteId);
   for(const id of row.outputIds)if(!ids.has(id))failures.push('v9.30 packet modeled output missing '+row.noteId+' -> '+id);
   if(!(row.productChanges&&row.productChanges.length)&&!(row.guidanceOnlyReason&&row.guidanceOnlyReason.length>=24))failures.push('v9.30 packet modeled row lacks explicit product-change or guidance-only decision '+row.noteId);
  }else if(row.outputIds.length)failures.push('v9.30 packet non-modeled row publishes output '+row.noteId);
 }
 for(const note of NEW_PUBLIC_NOTES){for(const ref of note.sourceRefs){const row=reviewedDisposition(ref);if(!row||row.disposition!=='modeled'||!row.outputIds.includes(note.id))failures.push('v9.30 packet reciprocal lineage mismatch '+note.id+' <- '+ref);}}
 if(packet.openProductGaps.length)failures.push('web upload/inclusion packet cannot close with unresolved product gaps');
 if(packet.closedProductChanges.length!==1||packet.closedProductChanges[0].id!=='curl-path-preservation-control')failures.push('web upload/inclusion packet must retain proof of the note-driven curl path-preservation change');
 return failures;
}
root.OBOL_NOTE_INTEGRATION=Object.freeze({...base,schemaVersion:'1.5.0',reviewedDispositions:reviewed,milestones,ledger,publicFieldNotes,packetReviews,reviewedDisposition,atomizeMetadata,publicNotesForTool,publicNotesForPath,validate});
})(typeof window!=='undefined'?window:globalThis);
