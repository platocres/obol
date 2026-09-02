'use strict';
(function(root){
const q=root.OBOL_PRODUCT_HARDENING,notes=root.OBOL_NOTE_INTEGRATION;
if(!q||!notes||!notes.ledger)return;
const rows=Array.from(notes.reviewedDispositions||[]),publicNotes=Array.from(notes.publicFieldNotes||[]),counts=notes.ledger.dispositionCounts||{};
const unique=list=>Array.from(new Set(list.filter(Boolean)));
const themeRules=[
 ['File upload',['file-upload']],
 ['File inclusion',['file-inclusion','lfi','rfi','path-traversal']],
 ['Command injection',['command-injection']],
 ['Object authorization / IDOR',['idor','access-control','object-reference','authorization']],
 ['Credentials / auth material',['credential','lsass','ntlm','pass-the-hash']],
 ['XSS / session hardening',['xss','session']],
 ['Web proxy / request controls',['web-proxy','http-method','client-side']],
 ['Content discovery',['fuzzing','content-discovery']]
];
function outputStatus(note){
 const statuses=['field-note'];
 if((note.toolIds||[]).length)statuses.push('tool-integrated');
 if((note.pathIds||[]).length)statuses.push('path-integrated');
 if(note.kind==='evidence')statuses.push('evidence-integrated');
 if(note.kind==='report')statuses.push('report-integrated');
 if(note.kind==='troubleshooting')statuses.push('troubleshooting-integrated');
 return Object.freeze(statuses);
}
const outputs=Object.freeze(publicNotes.map(note=>Object.freeze({id:note.id,title:note.title,kind:note.kind,statuses:outputStatus(note),toolIds:Object.freeze(Array.from(note.toolIds||[])),pathIds:Object.freeze(Array.from(note.pathIds||[])),tags:Object.freeze(Array.from(note.tags||[])),sourceRefs:Object.freeze(Array.from(note.sourceRefs||[]))})));
const outputCounts=Object.freeze({
 fieldNotes:outputs.length,
 toolIntegrated:outputs.filter(o=>o.statuses.includes('tool-integrated')).length,
 pathIntegrated:outputs.filter(o=>o.statuses.includes('path-integrated')).length,
 evidenceIntegrated:outputs.filter(o=>o.statuses.includes('evidence-integrated')).length,
 reportIntegrated:outputs.filter(o=>o.statuses.includes('report-integrated')).length,
 troubleshootingIntegrated:outputs.filter(o=>o.statuses.includes('troubleshooting-integrated')).length,
 tools:unique(outputs.flatMap(o=>o.toolIds)).length,
 paths:unique(outputs.flatMap(o=>o.pathIds)).length
});
const themes=Object.freeze(themeRules.map(([name,tags])=>{
 const matched=outputs.filter(output=>output.tags.some(tag=>tags.includes(tag)));
 const sourceRefs=unique(matched.flatMap(output=>output.sourceRefs));
 return Object.freeze({name,reviewedSources:sourceRefs.length,fieldNotes:matched.length,tools:Object.freeze(unique(matched.flatMap(output=>output.toolIds))),pathImpact:matched.some(output=>output.statuses.includes('path-integrated')),evidenceImpact:matched.some(output=>output.statuses.includes('evidence-integrated')),reportImpact:matched.some(output=>output.statuses.includes('report-integrated'))});
}).filter(theme=>theme.reviewedSources||theme.fieldNotes));
const latestWaveId=rows.length?rows[rows.length-1].reviewWave:null;
const latestRows=rows.filter(row=>row.reviewWave===latestWaveId);
const latestOutputIds=unique(latestRows.flatMap(row=>Array.from(row.outputIds||[])));
const latestOutputs=outputs.filter(output=>latestOutputIds.includes(output.id));
const gaps=Object.freeze((q.items||[]).filter(item=>item.track==='notes-integration'&&item.status==='queued').map(item=>Object.freeze({id:item.id,label:item.label,detail:item.detail,status:item.status})));
const review=Object.freeze({total:Number(notes.ledger.expectedNotes||0),reviewed:Number(notes.ledger.reviewedCount||0),pending:Number(counts['pending-review']||0),modeled:Number(counts.modeled||0),privateOnly:Number(counts['private-reference-only']||0),superseded:Number(counts.superseded||0),rejected:Number(counts.rejected||0)});
const latestWave=Object.freeze({id:latestWaveId,reviewed:latestRows.length,modeled:latestRows.filter(row=>row.disposition==='modeled').length,privateOnly:latestRows.filter(row=>row.disposition==='private-reference-only').length,outputs:Object.freeze(latestOutputs.map(output=>output.id)),themes:Object.freeze(unique(latestOutputs.flatMap(output=>themeRules.filter(([,tags])=>output.tags.some(tag=>tags.includes(tag))).map(([name])=>name))))});
function validate(){
 const failures=[];
 if(review.reviewed!==rows.length)failures.push('notes impact reviewed count does not match ledger rows');
 if(outputCounts.fieldNotes!==publicNotes.length)failures.push('notes impact field-note count does not match public notes');
 if(review.total!==review.reviewed+review.pending)failures.push('notes impact review funnel does not reconcile');
 for(const output of outputs)if(!output.statuses.length)failures.push('notes impact output lacks status '+output.id);
 if(latestWave.id&&latestWave.reviewed===0)failures.push('notes impact latest wave is empty');
 return failures;
}
root.OBOL_PRODUCT_HARDENING_NOTES_IMPACT=Object.freeze({schemaVersion:'1.0.0',review,outputCounts,outputs,themes,latestWave,gaps,validate});
})(typeof window!=='undefined'?window:globalThis);
