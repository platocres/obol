'use strict';
(function(root){
const q=root.OBOL_PRODUCT_HARDENING,notes=root.OBOL_NOTE_INTEGRATION,backfill=root.OBOL_NOTE_MECHANIC_BACKFILL_V938;
if(!q||!notes||!notes.ledger)return;
const rows=Array.from(notes.reviewedDispositions||[]),publicNotes=Array.from(notes.publicFieldNotes||[]),counts=notes.ledger.dispositionCounts||{};
const backfillRows=Array.from(backfill&&backfill.rows||[]),backfillMap=new Map(backfillRows.map(row=>[row.noteId,row]));
const unique=list=>Array.from(new Set((list||[]).filter(Boolean)));
const themeRules=[
 ['Windows local privilege escalation',['windows-privesc','windows-service','scheduled-task','dll-hijack','uac','access-token','local-exploit']],
 ['File upload',['file-upload']],
 ['File inclusion',['file-inclusion','lfi','rfi','path-traversal']],
 ['Command injection',['command-injection']],
 ['Object authorization / IDOR',['idor','access-control','object-reference','authorization']],
 ['Credentials / auth material',['credential','lsass','ntlm','pass-the-hash']],
 ['XSS / session hardening',['xss','session']],
 ['Web proxy / request controls',['web-proxy','http-method','client-side']],
 ['Content discovery',['fuzzing','content-discovery']]
];
const allowedImpactTypes=Object.freeze(['field-note-only','tool-context-bound','path-guidance-bound','evidence-guidance','report-guidance','troubleshooting-guidance','cleanup-guidance','script-guidance']);
const allowedProductChangeTypes=Object.freeze(['tool-builder-change','path-logic-change','evidence-parser-change','report-generator-change','workflow-change']);
function reviewWaveAtLeast(value,major,minor){
 const match=String(value||'').match(/^v(\d+)\.(\d+)/);
 if(!match)return false;
 const currentMajor=Number(match[1]),currentMinor=Number(match[2]);
 return currentMajor>major||(currentMajor===major&&currentMinor>=minor);
}
function outputImpactTypes(note){
 const types=[];
 if((note.toolIds||[]).length)types.push('tool-context-bound');
 if((note.pathIds||[]).length)types.push('path-guidance-bound');
 if(note.kind==='evidence')types.push('evidence-guidance');
 if(note.kind==='report')types.push('report-guidance');
 if(note.kind==='troubleshooting')types.push('troubleshooting-guidance');
 if(note.kind==='cleanup')types.push('cleanup-guidance');
 if(note.kind==='script')types.push('script-guidance');
 if(!types.length)types.push('field-note-only');
 return Object.freeze(unique(types));
}
function productChangesFor(row,audit){
 const raw=audit&&audit.decision==='mechanic'?audit.productChanges:(Array.isArray(row.productChanges)?row.productChanges:[]);
 return Object.freeze(Array.from(raw||[]).map(change=>{
  if(typeof change==='string')return Object.freeze({type:change,proofRefs:Object.freeze([])});
  return Object.freeze({type:String(change&&change.type||''),proofRefs:Object.freeze(Array.isArray(change&&change.proofRefs)?change.proofRefs.slice():[])});
 }).filter(change=>change.type));
}
const outputs=Object.freeze(publicNotes.map(note=>Object.freeze({id:note.id,title:note.title,kind:note.kind,impactTypes:outputImpactTypes(note),toolIds:Object.freeze(Array.from(note.toolIds||[])),pathIds:Object.freeze(Array.from(note.pathIds||[])),tags:Object.freeze(Array.from(note.tags||[])),sourceRefs:Object.freeze(Array.from(note.sourceRefs||[]))})));
const outputMap=new Map(outputs.map(output=>[output.id,output]));
const sourceDecisions=Object.freeze(rows.map(row=>{
 const audit=backfillMap.get(row.noteId)||null;
 const linked=Array.from(row.outputIds||[]).map(id=>outputMap.get(id)).filter(Boolean);
 const impactTypes=row.disposition==='modeled'?unique(linked.flatMap(output=>output.impactTypes)):[row.disposition];
 const productChanges=productChangesFor(row,audit);
 const guidanceOnly=row.disposition==='modeled'&&!productChanges.length;
 const sourceReason=typeof row.guidanceOnlyReason==='string'?row.guidanceOnlyReason.trim():'';
 const auditReason=audit&&audit.decision==='guidance-only'&&typeof audit.guidanceOnlyReason==='string'?audit.guidanceOnlyReason.trim():'';
 const explicitGuidanceOnlyReason=auditReason||sourceReason;
 return Object.freeze({
  noteId:row.noteId,
  disposition:row.disposition,
  reviewWave:row.reviewWave,
  outputIds:Object.freeze(linked.map(output=>output.id)),
  impactTypes:Object.freeze(impactTypes),
  productChanges,
  rationale:row.rationale,
  guidanceOnly,
  guidanceOnlyReason:guidanceOnly?(explicitGuidanceOnlyReason||null):null,
  backfillDecision:audit?audit.decision:null,
  explicitDecisionRequired:row.disposition==='modeled'&&reviewWaveAtLeast(row.reviewWave,9,29)
 });
}));
const declaredProductChanges=Object.freeze(sourceDecisions.flatMap(decision=>decision.productChanges.map(change=>Object.freeze({noteId:decision.noteId,reviewWave:decision.reviewWave,type:change.type,proofRefs:change.proofRefs}))));
const outputCounts=Object.freeze({
 fieldNotes:outputs.length,
 fieldNoteOnly:outputs.filter(o=>o.impactTypes.includes('field-note-only')).length,
 toolContextBound:outputs.filter(o=>o.impactTypes.includes('tool-context-bound')).length,
 pathGuidanceBound:outputs.filter(o=>o.impactTypes.includes('path-guidance-bound')).length,
 evidenceGuidance:outputs.filter(o=>o.impactTypes.includes('evidence-guidance')).length,
 reportGuidance:outputs.filter(o=>o.impactTypes.includes('report-guidance')).length,
 troubleshootingGuidance:outputs.filter(o=>o.impactTypes.includes('troubleshooting-guidance')).length,
 cleanupGuidance:outputs.filter(o=>o.impactTypes.includes('cleanup-guidance')).length,
 scriptGuidance:outputs.filter(o=>o.impactTypes.includes('script-guidance')).length,
 toolOwners:unique(outputs.flatMap(o=>o.toolIds)).length,
 pathOwners:unique(outputs.flatMap(o=>o.pathIds)).length,
 declaredProductChanges:declaredProductChanges.length,
 toolBuilderChanges:declaredProductChanges.filter(change=>change.type==='tool-builder-change').length,
 pathLogicChanges:declaredProductChanges.filter(change=>change.type==='path-logic-change').length,
 evidenceParserChanges:declaredProductChanges.filter(change=>change.type==='evidence-parser-change').length,
 reportGeneratorChanges:declaredProductChanges.filter(change=>change.type==='report-generator-change').length,
 workflowChanges:declaredProductChanges.filter(change=>change.type==='workflow-change').length,
 explicitGuidanceOnlyDecisions:sourceDecisions.filter(decision=>decision.guidanceOnlyReason).length,
 backfillAudited:backfillRows.length
});
const modeledDecisions=sourceDecisions.filter(decision=>decision.disposition==='modeled');
const rubricMechanicBacked=modeledDecisions.filter(decision=>decision.productChanges.length).length;
const rubricJustifiedGuidanceOnly=modeledDecisions.filter(decision=>decision.guidanceOnly&&decision.guidanceOnlyReason).length;
const rubricUnjustifiedGuidanceOnly=modeledDecisions.filter(decision=>decision.guidanceOnly&&!decision.guidanceOnlyReason).length;
// Ratchet ceiling for modeled notes reviewed under the pre-v9.29 rubric that carry neither a
// product mechanic nor an explicit guidance-only reason. Historical projections that do not load
// the v9.38 backfill retain the v9.36 ceiling; the current backfill-aware projection ratchets it down.
const GUIDANCE_ONLY_BACKLOG_CEILING=backfillRows.length>=14?32:43;
const rubric=Object.freeze({
 modeled:modeledDecisions.length,
 mechanicBacked:rubricMechanicBacked,
 justifiedGuidanceOnly:rubricJustifiedGuidanceOnly,
 unjustifiedGuidanceOnly:rubricUnjustifiedGuidanceOnly,
 compliant:rubricMechanicBacked+rubricJustifiedGuidanceOnly,
 mechanicConversionPct:modeledDecisions.length?Math.round((rubricMechanicBacked/modeledDecisions.length)*100):0,
 backlogCeiling:GUIDANCE_ONLY_BACKLOG_CEILING
});
const themes=Object.freeze(themeRules.map(([name,tags])=>{
 const matched=outputs.filter(output=>output.tags.some(tag=>tags.includes(tag)));
 const sourceRefs=unique(matched.flatMap(output=>output.sourceRefs));
 return Object.freeze({name,reviewedSources:sourceRefs.length,fieldNotes:matched.length,tools:Object.freeze(unique(matched.flatMap(output=>output.toolIds))),toolContext:matched.some(output=>output.impactTypes.includes('tool-context-bound')),pathImpact:matched.some(output=>output.impactTypes.includes('path-guidance-bound')),evidenceImpact:matched.some(output=>output.impactTypes.includes('evidence-guidance')),reportImpact:matched.some(output=>output.impactTypes.includes('report-guidance')),troubleshootingImpact:matched.some(output=>output.impactTypes.includes('troubleshooting-guidance'))});
}).filter(theme=>theme.reviewedSources||theme.fieldNotes));
const latestWaveId=rows.length?rows[rows.length-1].reviewWave:null;
const latestRows=rows.filter(row=>row.reviewWave===latestWaveId);
const latestOutputIds=unique(latestRows.flatMap(row=>Array.from(row.outputIds||[])));
const latestOutputs=outputs.filter(output=>latestOutputIds.includes(output.id));
const latestDecisions=sourceDecisions.filter(decision=>decision.reviewWave===latestWaveId);
const gaps=Object.freeze((q.items||[]).filter(item=>item.track==='notes-integration'&&item.status==='queued').map(item=>Object.freeze({id:item.id,label:item.label,detail:item.detail,status:item.status,priority:item.priority})));
const review=Object.freeze({total:Number(notes.ledger.expectedNotes||0),reviewed:Number(notes.ledger.reviewedCount||0),pending:Number(counts['pending-review']||0),modeled:Number(counts.modeled||0),privateOnly:Number(counts['private-reference-only']||0),superseded:Number(counts.superseded||0),rejected:Number(counts.rejected||0)});
const latestWave=Object.freeze({id:latestWaveId,reviewed:latestRows.length,modeled:latestRows.filter(row=>row.disposition==='modeled').length,privateOnly:latestRows.filter(row=>row.disposition==='private-reference-only').length,outputs:Object.freeze(latestOutputs.map(output=>output.id)),impactTypes:Object.freeze(unique(latestOutputs.flatMap(output=>output.impactTypes))),productChanges:Object.freeze(latestDecisions.flatMap(decision=>decision.productChanges)),themes:Object.freeze(unique(latestOutputs.flatMap(output=>themeRules.filter(([,tags])=>output.tags.some(tag=>tags.includes(tag))).map(([name])=>name))))});
const summary=Object.freeze({reviewedLabel:review.reviewed+'/'+review.total+' reviewed',derivedOutputs:outputCounts.fieldNotes,toolBindings:outputCounts.toolContextBound,pathBindings:outputCounts.pathGuidanceBound,evidenceOutputs:outputCounts.evidenceGuidance,reportOutputs:outputCounts.reportGuidance,troubleshootingOutputs:outputCounts.troubleshootingGuidance,declaredProductChanges:outputCounts.declaredProductChanges,explicitGuidanceOnlyDecisions:outputCounts.explicitGuidanceOnlyDecisions,mechanicConversionPct:rubric.mechanicConversionPct,guidanceOnlyBacklog:rubric.unjustifiedGuidanceOnly,guidanceOnlyBacklogCeiling:rubric.backlogCeiling,backfillAudited:outputCounts.backfillAudited,latestThemes:latestWave.themes});
function validate(){
 const failures=[];
 if(review.reviewed!==rows.length)failures.push('notes impact reviewed count does not match ledger rows');
 if(outputCounts.fieldNotes!==publicNotes.length)failures.push('notes impact field-note count does not match public notes');
 if(review.total!==review.reviewed+review.pending)failures.push('notes impact review funnel does not reconcile');
 if(backfill&&typeof backfill.validate==='function')failures.push(...backfill.validate(notes));
 for(const output of outputs){
  if(!output.impactTypes.length)failures.push('notes impact output lacks impact type '+output.id);
  for(const type of output.impactTypes)if(!allowedImpactTypes.includes(type))failures.push('notes impact output has unknown impact type '+type+' for '+output.id);
 }
 for(const decision of sourceDecisions){
  if(decision.disposition==='modeled'&&!decision.outputIds.length)failures.push('modeled note lacks a public product output '+decision.noteId);
  if(decision.disposition==='modeled'&&!decision.impactTypes.length)failures.push('modeled note lacks an impact decision '+decision.noteId);
  if(decision.disposition!=='modeled'&&decision.outputIds.length)failures.push('non-modeled note unexpectedly publishes output '+decision.noteId);
  for(const change of decision.productChanges){
   if(!allowedProductChangeTypes.includes(change.type))failures.push('unknown declared product change '+change.type+' for '+decision.noteId);
   if(!change.proofRefs.length)failures.push('declared product change lacks proof refs '+change.type+' for '+decision.noteId);
  }
  if(decision.explicitDecisionRequired&&decision.guidanceOnly&&!decision.guidanceOnlyReason)failures.push('v9.29+ modeled note must declare productChanges or an explicit guidanceOnlyReason '+decision.noteId);
 }
 if(latestWave.id&&latestWave.reviewed===0)failures.push('notes impact latest wave is empty');
 return failures;
}
root.OBOL_PRODUCT_HARDENING_NOTES_IMPACT=Object.freeze({schemaVersion:'1.6.0',review,outputCounts,rubric,outputs,sourceDecisions,declaredProductChanges,themes,latestWave,gaps,summary,allowedImpactTypes,allowedProductChangeTypes,reviewWaveAtLeast,validate});
})(typeof window!=='undefined'?window:globalThis);
