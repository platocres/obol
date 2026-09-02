'use strict';
const fs=require('fs');
const cp=require('child_process');
function read(p){return fs.readFileSync(p,'utf8');}
function write(p,s){fs.writeFileSync(p,s,'utf8');}
function once(s,a,b,label){if(!s.includes(a))throw new Error('missing '+label);return s.replace(a,b);}
function regex(s,r,b,label){if(!r.test(s))throw new Error('missing '+label);return s.replace(r,b);}

let p=read('data/note-integration-packets.js');
p=once(p,
 " {noteId:'offsec-pen-200-c91e5f2c5afd78c7',disposition:'modeled',reviewWave:WAVE,rationale:'Non-executable upload material adds an important branch: meaningful impact can arise from overwrite, configuration placement, parser or browser handling, or another downstream consumer even when direct execution is unavailable.',outputIds:['note-upload-impact-branches'],guidanceOnlyReason:'The missing value is a downstream-impact decision model, not another upload transport switch; the normalized Path/Evidence guidance captures that distinction.'}\n]);",
 " {noteId:'offsec-pen-200-c91e5f2c5afd78c7',disposition:'modeled',reviewWave:WAVE,rationale:'Non-executable upload material adds an important branch: meaningful impact can arise from overwrite, configuration placement, parser or browser handling, or another downstream consumer even when direct execution is unavailable.',outputIds:['note-upload-impact-branches'],guidanceOnlyReason:'The missing value is a downstream-impact decision model, not another upload transport switch; the normalized Path/Evidence guidance captures that distinction.'},\n {noteId:'offsec-pen-200-e58de5584625c70d',disposition:'private-reference-only',reviewWave:WAVE,rationale:'This source is a large challenge-lab notebook dominated by target-specific topology, credentials, flags, commands, and outcomes. Keep it private; narrower conceptual sources own the reusable path-resolution guidance.',outputIds:[]}\n]);",
 'private challenge disposition');
p=regex(p,/const reviewed=freezeList\(Array\.from\(base\.reviewedDispositions\|\|\[\]\)\.concat\(Array\.from\(NEW_ROWS\)\)\);[\s\S]*?const packetReviews=Object\.freeze\(\{\.\.\.base\.packetReviews,\[PACKET_ID\]:packet\}\);/,
`const priorReviewedSet=new Set((base.reviewedDispositions||[]).map(row=>row.noteId));
const freshRows=freezeRows(NEW_ROWS.filter(row=>!priorReviewedSet.has(row.noteId)));
const freshRowSet=new Set(freshRows.map(row=>row.noteId));
const freshPublicNotes=freezeList(NEW_PUBLIC_NOTES.filter(note=>note.sourceRefs.every(ref=>freshRowSet.has(ref))));
const reviewed=freezeList(Array.from(base.reviewedDispositions||[]).concat(Array.from(freshRows)));
const publicFieldNotes=freezeList(Array.from(base.publicFieldNotes||[]).concat(Array.from(freshPublicNotes)));
const counts={'pending-review':0,modeled:0,superseded:0,rejected:0,'private-reference-only':0};
for(const row of reviewed)counts[row.disposition]=(counts[row.disposition]||0)+1;
counts['pending-review']=Math.max(0,base.totals().notes-reviewed.length);
const frozenCounts=Object.freeze({...counts});
const milestone=Object.freeze({reviewedCount:reviewed.length,dispositionCounts:frozenCounts,publicFieldNoteIds:freezeList(publicFieldNotes.map(note=>note.id))});
const milestones=Object.freeze({...base.milestones,[WAVE]:milestone});
const ledger=Object.freeze({...base.ledger,schemaVersion:'1.4.0',reviewedCount:reviewed.length,dispositionCounts:frozenCounts,modeledSourceRefs:freezeList(reviewed.filter(row=>row.disposition==='modeled').map(row=>row.noteId)),privateReferenceSourceRefs:freezeList(reviewed.filter(row=>row.disposition==='private-reference-only').map(row=>row.noteId))});
const newReviewedSet=new Set(freshRows.map(row=>row.noteId));
const deferredRefs=freezeList(DEFERRED_REFS.filter(ref=>!priorReviewedSet.has(ref)&&!newReviewedSet.has(ref)));
const blockedRefs=freezeList(BLOCKED_REFS.filter(ref=>!priorReviewedSet.has(ref)&&!newReviewedSet.has(ref)));
const accounted=new Set([...priorReviewedSet,...newReviewedSet,...deferredRefs,...blockedRefs]);
const untriagedRefs=freezeList(CANDIDATE_REFS.filter(ref=>!accounted.has(ref)));
const packet=Object.freeze({
 id:PACKET_ID,
 reviewWave:WAVE,
 status:'reviewed-shortlist-with-open-coverage',
 candidateCount:CANDIDATE_REFS.length,
 candidateRefs:CANDIDATE_REFS,
 priorTerminalCount:CANDIDATE_REFS.filter(ref=>priorReviewedSet.has(ref)).length,
 newlyTerminalCount:freshRows.length,
 deferredRefs,
 blockedRefs,
 untriagedRefs,
 openProductGaps:Object.freeze([
  Object.freeze({id:'full-text-semantic-sweep',type:'review-coverage-gap',noteRefs:freezeList([]),detail:'The candidate list is a title/tag-derived shortlist. A full-text semantic sweep of the private source corpus is still required before exhaustive themed completion may be claimed.'})
 ]),
 deferredTo:Object.freeze({'htb-penetration-tester-65a09e67be537494':'linux-privesc'})
});
const packetReviews=Object.freeze({...base.packetReviews,[PACKET_ID]:packet});`,
 'packet reconciliation block');
p=once(p,"if(reviewed.length!==75)failures.push('v9.30 reviewed count must be 75 while two packet sources remain blocked and one is deferred');","if(reviewed.length!==77)failures.push('v9.30 reviewed count must be 77 after reconciling prior terminal sources');",'reviewed count');
p=once(p,"if(frozenCounts.modeled!==55||frozenCounts['private-reference-only']!==20||frozenCounts['pending-review']!==481)failures.push('v9.30 disposition counts are inconsistent');","if(frozenCounts.modeled!==53||frozenCounts['private-reference-only']!==20||frozenCounts.superseded!==4||frozenCounts.rejected!==0||frozenCounts['pending-review']!==479)failures.push('v9.30 disposition counts are inconsistent');",'disposition count');
p=once(p,"if(packet.priorTerminalCount!==24||packet.newlyTerminalCount!==20||packet.deferredRefs.length!==1||packet.blockedRefs.length!==2)failures.push('web upload/inclusion packet triage accounting is inconsistent');","if(packet.priorTerminalCount!==34||packet.newlyTerminalCount!==12||packet.deferredRefs.length!==1||packet.blockedRefs.length!==0||packet.untriagedRefs.length!==0)failures.push('web upload/inclusion packet triage accounting is inconsistent');",'packet count');
p=once(p,' const covered=new Set([...CANDIDATE_REFS.filter(ref=>priorReviewedSet.has(ref)),...CANDIDATE_REFS.filter(ref=>newReviewedSet.has(ref)),...DEFERRED_REFS,...BLOCKED_REFS]);',' const covered=new Set([...CANDIDATE_REFS.filter(ref=>priorReviewedSet.has(ref)),...CANDIDATE_REFS.filter(ref=>newReviewedSet.has(ref)),...packet.deferredRefs,...packet.blockedRefs,...packet.untriagedRefs]);','coverage set');
p=once(p,' for(const ref of DEFERRED_REFS.concat(BLOCKED_REFS))if(reviewedDisposition(ref))failures.push(\'deferred or blocked packet ref must remain pending \'+ref);',' for(const ref of packet.deferredRefs.concat(packet.blockedRefs).concat(packet.untriagedRefs))if(reviewedDisposition(ref))failures.push(\'non-terminal packet ref must remain pending \'+ref);','pending refs');
p=once(p,' for(const row of NEW_ROWS){',' for(const row of freshRows){','fresh row validation');
p=once(p,' for(const note of NEW_PUBLIC_NOTES){for(const ref of note.sourceRefs){',' for(const note of freshPublicNotes){for(const ref of note.sourceRefs){','fresh note validation');
write('data/note-integration-packets.js',p);

let t=read('tests/run-v9.30-tests.js');
t=once(t," 'data/note-integration-reviews.js',\n 'data/product-hardening/note-progress-current.js',"," 'data/note-integration-reviews.js',\n 'data/note-integration-packets.js',\n 'data/product-hardening/note-progress-current.js',",'test packet load');
t=regex(t,/assert\.strictEqual\(notes\.ledger\.reviewedCount,65\);[\s\S]*?assert\.strictEqual\(notes\.ledger\.dispositionCounts\['pending-review'\],491\);/,
"assert.strictEqual(notes.ledger.reviewedCount,77);\nassert.strictEqual(notes.ledger.dispositionCounts.modeled,53);\nassert.strictEqual(notes.ledger.dispositionCounts['private-reference-only'],20);\nassert.strictEqual(notes.ledger.dispositionCounts.superseded,4);\nassert.strictEqual(notes.ledger.dispositionCounts.rejected,0);\nassert.strictEqual(notes.ledger.dispositionCounts['pending-review'],479);",'test ledger totals');
t=regex(t,/assert\.strictEqual\(impact\.review\.reviewed,65\);[\s\S]*?assert\.strictEqual\(impact\.latestWave\.productChanges\[0\]\.type,'tool-builder-change'\);/,
"assert.strictEqual(impact.review.reviewed,77);\nassert.strictEqual(impact.review.pending,479);\nassert.strictEqual(impact.outputCounts.fieldNotes,32);\nassert.strictEqual(impact.outputCounts.declaredProductChanges,1);\nassert.strictEqual(impact.outputCounts.toolBuilderChanges,1);\nassert.strictEqual(impact.outputCounts.pathLogicChanges,0);\nassert.strictEqual(impact.outputCounts.evidenceParserChanges,0);\nassert.strictEqual(impact.outputCounts.reportGeneratorChanges,0);\nassert.strictEqual(impact.outputCounts.workflowChanges,0);\nassert.strictEqual(impact.outputCounts.explicitGuidanceOnlyDecisions,9);\nassert.strictEqual(impact.latestWave.id,'v9.30-web-upload-inclusion');\nassert.strictEqual(impact.latestWave.reviewed,12);\nassert.strictEqual(impact.latestWave.modeled,5);\nassert.strictEqual(impact.latestWave.privateOnly,7);\nassert.strictEqual(impact.latestWave.productChanges.length,0);",'test impact totals');
t=once(t,"const transportDecision=impact.sourceDecisions.find(row=>row.noteId==='offsec-pen-200-4940931777995183');","const packet=notes.packetReviews&&notes.packetReviews['web-upload-inclusion'];\nassert(packet&&packet.candidateCount===47,'packet registry exposes the 47-candidate shortlist');\nassert.strictEqual(packet.priorTerminalCount,34);\nassert.strictEqual(packet.newlyTerminalCount,12);\nassert.strictEqual(packet.deferredRefs.length,1);\nassert.strictEqual(packet.blockedRefs.length,0);\nassert.strictEqual(packet.untriagedRefs.length,0);\nassert(packet.openProductGaps.some(gap=>gap.id==='full-text-semantic-sweep'),'packet remains open on explicit full-text coverage debt');\n\nconst transportDecision=impact.sourceDecisions.find(row=>row.noteId==='offsec-pen-200-4940931777995183');",'packet assertions');
t=once(t,"assert(notesTrack&&notesTrack.complete===65&&notesTrack.total===556,'Notes Integration track derives 65/556 from the current ledger');","assert(notesTrack&&notesTrack.complete===77&&notesTrack.total===556,'Notes Integration track derives 77/556 from the reconciled packet ledger');",'test queue progress');
write('tests/run-v9.30-tests.js',t);

for(const args of [['tools/sync-current-release.js','--write'],['tools/sync-product-build-next.js','--write']]){
 const r=cp.spawnSync(process.execPath,args,{encoding:'utf8'});process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');if(r.status!==0)process.exit(r.status||1);
}
fs.unlinkSync('.github/workflows/v9.30-reconcile-packet.yml');
fs.unlinkSync(__filename);
