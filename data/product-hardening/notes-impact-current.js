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
const allowedImpactTypes=Object.freeze(['field-note-only','tool-integrated','path-integrated','evidence-integrated','report-integrated','troubleshooting-integrated']);
function outputImpactTypes(note){
 const types=[];
 if((note.toolIds||[]).length)types.push('tool-integrated');
 if((note.pathIds||[]).length)types.push('path-integrated');
 if(note.kind==='evidence')types.push('evidence-integrated');
 if(note.kind==='report')types.push('report-integrated');
 if(note.kind==='troubleshooting')types.push('troubleshooting-integrated');
 if(!types.length)types.push('field-note-only');
 return Object.freeze(types);
}
const outputs=Object.freeze(publicNotes.map(note=>Object.freeze({id:note.id,title:note.title,kind:note.kind,impactTypes:outputImpactTypes(note),toolIds:Object.freeze(Array.from(note.toolIds||[])),pathIds:Object.freeze(Array.from(note.pathIds||[])),tags:Object.freeze(Array.from(note.tags||[])),sourceRefs:Object.freeze(Array.from(note.sourceRefs||[]))})));
const outputMap=new Map(outputs.map(output=>[output.id,output]));
const sourceDecisions=Object.freeze(rows.map(row=>{
 const linked=Array.from(row.outputIds||[]).map(id=>outputMap.get(id)).filter(Boolean);
 const impactTypes=row.disposition==='modeled'?unique(linked.flatMap(output=>output.impactTypes)):[row.disposition];
 const fieldNoteOnly=row.disposition==='modeled'&&impactTypes.length===1&&impactTypes[0]==='field-note-only';
 return Object.freeze({
  noteId:row.noteId,
  disposition:row.disposition,
  reviewWave:row.reviewWave,
  outputIds:Object.freeze(linked.map(output=>output.id)),
  impactTypes:Object.freeze(impactTypes),
  rationale:row.rationale,
  guidanceOnlyReason:fieldNoteOnly?'The normalized lesson is useful contextual guidance, but this reviewed source does not justify a distinct Tool Builder, Path, Evidence, troubleshooting, or report behavior change.':null
 });
}));
const outputCounts=Object.freeze({
 fieldNotes:outputs.length,
 fieldNoteOnly:outputs.filter(o=>o.impactTypes.includes('field-note-only')).length,
 toolIntegrated:outputs.filter(o=>o.impactTypes.includes('tool-integrated')).length,
 pathIntegrated:outputs.filter(o=>o.impactTypes.includes('path-integrated')).length,
 evidenceIntegrated:outputs.filter(o=>o.impactTypes.includes('evidence-integrated')).length,
 reportIntegrated:outputs.filter(o=>o.impactTypes.includes('report-integrated')).length,
 troubleshootingIntegrated:outputs.filter(o=>o.impactTypes.includes('troubleshooting-integrated')).length,
 tools:unique(outputs.flatMap(o=>o.toolIds)).length,
 paths:unique(outputs.flatMap(o=>o.pathIds)).length,
 productSurfaces:unique(outputs.flatMap(o=>o.impactTypes.filter(type=>type!=='field-note-only'))).length
});
const themes=Object.freeze(themeRules.map(([name,tags])=>{
 const matched=outputs.filter(output=>output.tags.some(tag=>tags.includes(tag)));
 const sourceRefs=unique(matched.flatMap(output=>output.sourceRefs));
 return Object.freeze({name,reviewedSources:sourceRefs.length,fieldNotes:matched.length,tools:Object.freeze(unique(matched.flatMap(output=>output.toolIds))),pathImpact:matched.some(output=>output.impactTypes.includes('path-integrated')),evidenceImpact:matched.some(output=>output.impactTypes.includes('evidence-integrated')),reportImpact:matched.some(output=>output.impactTypes.includes('report-integrated')),troubleshootingImpact:matched.some(output=>output.impactTypes.includes('troubleshooting-integrated'))});
}).filter(theme=>theme.reviewedSources||theme.fieldNotes));
const latestWaveId=rows.length?rows[rows.length-1].reviewWave:null;
const latestRows=rows.filter(row=>row.reviewWave===latestWaveId);
const latestOutputIds=unique(latestRows.flatMap(row=>Array.from(row.outputIds||[])));
const latestOutputs=outputs.filter(output=>latestOutputIds.includes(output.id));
const gaps=Object.freeze((q.items||[]).filter(item=>item.track==='notes-integration'&&item.status==='queued').map(item=>Object.freeze({id:item.id,label:item.label,detail:item.detail,status:item.status,priority:item.priority})));
const review=Object.freeze({total:Number(notes.ledger.expectedNotes||0),reviewed:Number(notes.ledger.reviewedCount||0),pending:Number(counts['pending-review']||0),modeled:Number(counts.modeled||0),privateOnly:Number(counts['private-reference-only']||0),superseded:Number(counts.superseded||0),rejected:Number(counts.rejected||0)});
const latestWave=Object.freeze({id:latestWaveId,reviewed:latestRows.length,modeled:latestRows.filter(row=>row.disposition==='modeled').length,privateOnly:latestRows.filter(row=>row.disposition==='private-reference-only').length,outputs:Object.freeze(latestOutputs.map(output=>output.id)),impactTypes:Object.freeze(unique(latestOutputs.flatMap(output=>output.impactTypes))),themes:Object.freeze(unique(latestOutputs.flatMap(output=>themeRules.filter(([,tags])=>output.tags.some(tag=>tags.includes(tag))).map(([name])=>name))))});
const summary=Object.freeze({reviewedLabel:review.reviewed+'/'+review.total+' reviewed',derivedOutputs:outputCounts.fieldNotes,toolBindings:outputCounts.toolIntegrated,pathBindings:outputCounts.pathIntegrated,evidenceOutputs:outputCounts.evidenceIntegrated,reportOutputs:outputCounts.reportIntegrated,troubleshootingOutputs:outputCounts.troubleshootingIntegrated,latestThemes:latestWave.themes});
function validate(){
 const failures=[];
 if(review.reviewed!==rows.length)failures.push('notes impact reviewed count does not match ledger rows');
 if(outputCounts.fieldNotes!==publicNotes.length)failures.push('notes impact field-note count does not match public notes');
 if(review.total!==review.reviewed+review.pending)failures.push('notes impact review funnel does not reconcile');
 for(const output of outputs){
  if(!output.impactTypes.length)failures.push('notes impact output lacks impact type '+output.id);
  for(const type of output.impactTypes)if(!allowedImpactTypes.includes(type))failures.push('notes impact output has unknown impact type '+type+' for '+output.id);
 }
 for(const decision of sourceDecisions){
  if(decision.disposition==='modeled'&&!decision.outputIds.length)failures.push('modeled note lacks a public product output '+decision.noteId);
  if(decision.disposition==='modeled'&&!decision.impactTypes.length)failures.push('modeled note lacks an impact decision '+decision.noteId);
  if(decision.disposition==='modeled'&&decision.impactTypes.length===1&&decision.impactTypes[0]==='field-note-only'&&!decision.guidanceOnlyReason)failures.push('field-note-only decision lacks rationale '+decision.noteId);
  if(decision.disposition!=='modeled'&&decision.outputIds.length)failures.push('non-modeled note unexpectedly publishes output '+decision.noteId);
 }
 if(latestWave.id&&latestWave.reviewed===0)failures.push('notes impact latest wave is empty');
 return failures;
}
root.OBOL_PRODUCT_HARDENING_NOTES_IMPACT=Object.freeze({schemaVersion:'1.1.0',review,outputCounts,outputs,sourceDecisions,themes,latestWave,gaps,summary,allowedImpactTypes,validate});
})(typeof window!=='undefined'?window:globalThis);
