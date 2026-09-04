'use strict';
(function(root){
const q=root.OBOL_PRODUCT_HARDENING,notes=root.OBOL_NOTE_INTEGRATION,backfill=root.OBOL_NOTE_MECHANIC_BACKFILL_V938;
if(!q||!notes||!notes.ledger)return;
const rows=Array.from(notes.reviewedDispositions||[]),publicNotes=Array.from(notes.publicFieldNotes||[]),counts=notes.ledger.dispositionCounts||{};
const backfillRows=Array.from(backfill&&backfill.rows||[]),backfillMap=new Map(backfillRows.map(row=>[row.noteId,row]));
const unique=list=>Array.from(new Set((list||[]).filter(Boolean)));
const themeRules=[
 ['Linux local privilege escalation',['linux-privesc','sudo','suid','capabilities','cron','kernel']],
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
root.OBOL_PRODUCT_HARDENING_NOTES_IMPACT=Object.freeze({schemaVersion:'1.7.0',review,outputCounts,rubric,outputs,sourceDecisions,declaredProductChanges,themes,latestWave,gaps,summary,allowedImpactTypes,allowedProductChangeTypes,reviewWaveAtLeast,validate});

function extendLinuxReMiningProgress(){
 const progress=root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS;
 if(!progress||!progress.remining)return;
 const dimensions=Array.from(progress.remining.dimensions||[]);
 const allowedOutcomes=Array.from(progress.remining.allowedOutcomes||[]);
 const wave='v9.54-linux-privesc-remine-batch1';
 function d(outcome,fields){return Object.freeze(Object.assign({outcome},fields||{}));}
 const common=Object.freeze({
  gui:d('not-applicable',{reason:'The source contributes command-line interpretation and workflow proof guidance rather than a missing schema-driven GUI control.'}),
  mechanics:d('not-applicable',{reason:'Re-mining confirmed guidance-only or gap-tracking value for this batch; no current Tool Builder, Path, Evidence parser, report generator, or workflow code mechanic was changed.'}),
  pathMovement:d('covered',{ownerIds:['path'],note:'Movement into the Linux local-privilege path is already modeled; this batch sharpens evidence interpretation and follow-up decisions.'}),
  orange:d('covered',{ownerIds:['path'],note:'Existing Orange-derived local-privilege path items are retained; this re-mining batch only adds audit proof and additive context.'})
 });
 const rowsToAdd=[
  Object.freeze({
   noteId:'offsec-pen-200-7d8319c3e311e160',
   title:'Inspecting Service Footprints',
   theme:'linux-privesc',
   reviewWave:wave,
   sourcePacket:'platocres/obol-source-notes@agent/review-packets:data/review-packets/offsec-pen-200-05.json',
   sourcePacketCommit:'agent/review-packets',
   originalSourceReread:true,
   decisions:Object.freeze({
    'path-bindings':d('covered',{ownerIds:['note-linux-service-process-proof'],note:'Existing Linux service/process guidance is already bound to the path surface.'}),
    'tool-cards':d('covered',{ownerIds:['ps','watch','tcpdump','grep'],note:'The relevant command-line tools are treated as human-run probes; no duplicate tool card is needed.'}),
    'gui-controls':common.gui,
    'scripts-one-liners':d('covered',{ownerIds:['note-linux-service-process-proof'],note:'Process refresh and local packet-inspection command shapes are represented as operator-run observations, not copied recipes.'}),
    'command-templates':d('covered',{ownerIds:['note-linux-service-process-proof'],note:'The reusable command shape is already captured as proof-boundary guidance rather than a new executable template.'}),
    'terminal-analyzers':d('queued',{gapIds:['gap-linux-process-traffic-secret-analyzer'],note:'Obol still lacks a parser that can reduce ps/watch/tcpdump/grep output into credential-like observations, source scope, and follow-up validation prompts.'}),
    'evidence-expectations':d('covered',{ownerIds:['note-linux-service-process-proof'],note:'Privileged process visibility, traffic capture, candidate material, and credential validity remain separate Evidence states.'}),
    'path-movement':common.pathMovement,
    'lesson-boxes':d('covered',{ownerIds:['note-linux-service-process-proof'],note:'The process-observation-versus-access lesson already appears as contextual guidance.'}),
    'examples':d('private-only',{reason:'The worked examples contain lab targets, accounts, flags, and credential-like material; only the generalized observation model belongs in public Obol.'}),
    'troubleshooting':d('covered',{ownerIds:['note-linux-service-process-proof'],note:'The note already warns operators not to promote an observed secret-like value to access proof without validation.'}),
    'cleanup':d('not-applicable',{reason:'The reusable public-safe value is read-only observation; no state-changing cleanup is implied.'}),
    'report-guidance':d('covered',{ownerIds:['note-linux-service-process-proof'],note:'Reports should record source context and redact candidate secrets while separating observation from validated access.'}),
    'product-mechanics':common.mechanics,
    'product-gaps':d('queued',{gapIds:['gap-linux-process-traffic-secret-analyzer'],note:'A Linux process/traffic secret-observation analyzer remains a concrete product gap.'}),
    'orange-baseline':common.orange
   })
  }),
  Object.freeze({
   noteId:'offsec-pen-200-37660dafbcec416c',
   title:'Inspecting User Trails',
   theme:'linux-privesc',
   reviewWave:wave,
   sourcePacket:'platocres/obol-source-notes@agent/review-packets:data/review-packets/offsec-pen-200-05.json',
   sourcePacketCommit:'agent/review-packets',
   originalSourceReread:true,
   decisions:Object.freeze({
    'path-bindings':d('covered',{ownerIds:['note-linux-secret-hunting-boundary'],note:'Existing Linux secret-hunting guidance is already bound to the path surface.'}),
    'tool-cards':d('queued',{gapIds:['gap-hydra-credential-validation-builder'],note:'The source exposes a public-safe Hydra/online-validation workflow gap; no current Hydra tool card was found in the public repo.'}),
    'gui-controls':d('queued',{gapIds:['gap-hydra-credential-validation-builder','gap-credential-pattern-wordlist-builder'],note:'Credential pattern generation, validation scope, service selection, threads/rate, verbosity, and output handling should become guided controls before publishing command templates.'}),
    'scripts-one-liners':d('private-only',{reason:'The raw command sequence contains lab-specific targets, accounts, passwords, and flags; the safe output is a generalized credential-validation gap and boundary lesson.'}),
    'command-templates':d('queued',{gapIds:['gap-credential-pattern-wordlist-builder'],note:'Obol lacks a public-safe pattern-wordlist builder that turns a discovered credential hint into a bounded validation workflow without copying lab specifics.'}),
    'terminal-analyzers':d('queued',{gapIds:['gap-linux-user-trail-secret-analyzer'],note:'Obol still lacks an analyzer for env/history/dotfile snippets that extracts candidate material, source file, apparent scope, and redaction needs.'}),
    'evidence-expectations':d('covered',{ownerIds:['note-linux-secret-hunting-boundary'],note:'Candidate secret discovery, account/service scope, authentication validity, and elevated access stay separate Evidence states.'}),
    'path-movement':common.pathMovement,
    'lesson-boxes':d('covered',{ownerIds:['note-linux-secret-hunting-boundary'],note:'The candidate-secret-not-access lesson already exists as contextual path guidance.'}),
    'examples':d('private-only',{reason:'The source examples contain private lab users, targets, credentials, and flags; no synthetic public example was added in this batch.'}),
    'troubleshooting':d('covered',{ownerIds:['note-linux-secret-hunting-boundary'],note:'The existing note captures the main failure mode: discovered material may be stale, scoped to another service, or invalid until tested narrowly.'}),
    'cleanup':d('not-applicable',{reason:'Secret discovery is read-only in the public-safe workflow; no cleanup mechanic is implied.'}),
    'report-guidance':d('covered',{ownerIds:['note-linux-secret-hunting-boundary'],note:'Existing guidance requires redaction and narrow validation before reporting recovered material as usable access.'}),
    'product-mechanics':common.mechanics,
    'product-gaps':d('queued',{gapIds:['gap-hydra-credential-validation-builder','gap-credential-pattern-wordlist-builder','gap-linux-user-trail-secret-analyzer'],note:'Re-mining exposed missing credential-validation, wordlist-pattern, and user-trail analyzer capabilities.'}),
    'orange-baseline':common.orange
   })
  }),
  Object.freeze({
   noteId:'offsec-pen-200-ea0ee100f0506b3f',
   title:'Abusing Cron Jobs',
   theme:'linux-privesc',
   reviewWave:wave,
   sourcePacket:'platocres/obol-source-notes@agent/review-packets:data/review-packets/offsec-pen-200-05.json',
   sourcePacketCommit:'agent/review-packets',
   originalSourceReread:true,
   decisions:Object.freeze({
    'path-bindings':d('covered',{ownerIds:['note-linux-privileged-execution-preconditions'],note:'Existing cron/privileged-execution guidance is already bound to the path surface.'}),
    'tool-cards':d('covered',{ownerIds:['grep','ls','cat','nc'],note:'The reusable tool surface is basic file/log inspection plus operator-managed listener setup; no new card is required for the private recipe.'}),
    'gui-controls':common.gui,
    'scripts-one-liners':d('private-only',{reason:'The reverse-shell append sequence and lab-specific paths are exploit-recipe material; public Obol keeps the proof chain rather than the recipe.'}),
    'command-templates':d('covered',{ownerIds:['note-linux-privileged-execution-preconditions'],note:'The public-safe template is the proof chain: identify trigger, principal, writable dependency, effect, and restore plan.'}),
    'terminal-analyzers':d('queued',{gapIds:['gap-linux-cron-chain-analyzer'],note:'Obol still lacks a parser that can connect cron log lines, scheduled script paths, file permissions, and trigger cadence into a single proof chain.'}),
    'evidence-expectations':d('covered',{ownerIds:['note-linux-privileged-execution-preconditions'],note:'Schedule, execution principal, writable script/dependency, trigger, elevated effect, and restoration remain separate Evidence states.'}),
    'path-movement':common.pathMovement,
    'lesson-boxes':d('covered',{ownerIds:['note-linux-privileged-execution-preconditions'],note:'The privileged-execution preconditions lesson already explains why a scheduled root job is only a lead.'}),
    'examples':d('private-only',{reason:'The source examples contain lab paths, target identifiers, callback values, and flags; they stay private while the generic chain remains public.'}),
    'troubleshooting':d('covered',{ownerIds:['note-linux-privileged-execution-preconditions'],note:'Existing guidance covers waiting for the trigger and proving the effective identity separately from file writability.'}),
    'cleanup':d('covered',{ownerIds:['note-linux-privileged-execution-preconditions'],note:'Existing guidance already requires restoring temporary changes after testing privileged execution chains.'}),
    'report-guidance':d('covered',{ownerIds:['note-linux-privileged-execution-preconditions'],note:'Reports should show the exact writable dependency and trigger/effective identity proof rather than only a shell result.'}),
    'product-mechanics':common.mechanics,
    'product-gaps':d('queued',{gapIds:['gap-linux-cron-chain-analyzer'],note:'A cron/scheduled-execution proof-chain analyzer remains a concrete product gap.'}),
    'orange-baseline':common.orange
   })
  }),
  Object.freeze({
   noteId:'offsec-pen-200-dcd4a16bbbfe100e',
   title:'Abusing Sudo',
   theme:'linux-privesc',
   reviewWave:wave,
   sourcePacket:'platocres/obol-source-notes@agent/review-packets:data/review-packets/offsec-pen-200-04.json',
   sourcePacketCommit:'agent/review-packets',
   originalSourceReread:true,
   decisions:Object.freeze({
    'path-bindings':d('covered',{ownerIds:['note-linux-sudo-proof-boundary'],note:'Existing sudo proof-boundary guidance is already bound to the path surface.'}),
    'tool-cards':d('covered',{ownerIds:['sudo'],note:'sudo is already represented as the human-run authorization-inspection tool for this path context.'}),
    'gui-controls':common.gui,
    'scripts-one-liners':d('private-only',{reason:'The raw escalation commands depend on permitted binaries and lab-specific targets; public Obol keeps constrained-authorization reasoning instead.'}),
    'command-templates':d('covered',{ownerIds:['note-linux-sudo-proof-boundary'],note:'The reusable command shape is sudo authorization review followed by constrained proof, not a copied GTFOBins recipe.'}),
    'terminal-analyzers':d('queued',{gapIds:['gap-linux-sudo-list-analyzer'],note:'Obol still lacks an analyzer for sudo -l output that distinguishes target user, password requirement, argument constraints, environment handling, and likely follow-up paths.'}),
    'evidence-expectations':d('covered',{ownerIds:['note-linux-sudo-proof-boundary'],note:'Allowed command, argument constraints, password requirement, environment, effective identity, and privileged operation remain distinct Evidence states.'}),
    'path-movement':common.pathMovement,
    'lesson-boxes':d('covered',{ownerIds:['note-linux-sudo-proof-boundary'],note:'The constrained-authorization lesson is already public-safe contextual guidance.'}),
    'examples':d('private-only',{reason:'The examples include exercise-specific allowed binaries, users, targets, and flags; they are not published.'}),
    'troubleshooting':d('covered',{ownerIds:['note-linux-sudo-proof-boundary'],note:'The existing note prevents treating a listed sudo rule as automatic root proof before testing its constraints.'}),
    'cleanup':d('not-applicable',{reason:'Authorization inspection is read-only; exploit-specific state changes are private recipe material and no public cleanup output was added.'}),
    'report-guidance':d('covered',{ownerIds:['note-linux-sudo-proof-boundary'],note:'Reports should record the sudoers rule and the effective operation separately from a generic root claim.'}),
    'product-mechanics':common.mechanics,
    'product-gaps':d('queued',{gapIds:['gap-linux-sudo-list-analyzer'],note:'A sudo-list terminal analyzer remains a concrete product gap.'}),
    'orange-baseline':common.orange
   })
  })
 ];
 const priorRows=Array.from(progress.remining.auditRows||[]);
 const priorKeys=new Set(priorRows.map(row=>String(row.noteId||'')+'|'+String(row.reviewWave||'')));
 const mergedRows=priorRows.concat(rowsToAdd.filter(row=>!priorKeys.has(String(row.noteId||'')+'|'+String(row.reviewWave||''))));
 const outcomeCounts={};
 allowedOutcomes.forEach(outcome=>{outcomeCounts[outcome]=0;});
 const dimensionCounts={};
 dimensions.forEach(id=>{dimensionCounts[id]={considered:0,added:0,covered:0,queued:0,privateOnly:0,notApplicable:0,blocked:0,ruledOut:0};});
 const keyFor=Object.freeze({'private-only':'privateOnly','not-applicable':'notApplicable'});
 for(const row of mergedRows){
  for(const dimension of dimensions){
   const decision=row.decisions&&row.decisions[dimension];
   const outcome=decision&&decision.outcome;
   if(!outcome)continue;
   if(Object.prototype.hasOwnProperty.call(outcomeCounts,outcome))outcomeCounts[outcome]+=1;
   const dc=dimensionCounts[dimension];
   if(dc){
    dc.considered+=1;
    const key=keyFor[outcome]||outcome;
    if(Object.prototype.hasOwnProperty.call(dc,key))dc[key]+=1;
   }
  }
 }
 dimensions.forEach(id=>{dimensionCounts[id]=Object.freeze(dimensionCounts[id]);});
 const themes=Object.freeze(Array.from(new Set(mergedRows.map(row=>row.theme).filter(Boolean))));
 const completedThemes=Object.freeze(Array.from(new Set(progress.remining.completedReminedThemes||[])));
 root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS=Object.freeze(Object.assign({},progress,{
  schemaVersion:'1.8.0',
  remining:Object.freeze(Object.assign({},progress.remining,{
   dimensionCounts:Object.freeze(dimensionCounts),
   outcomeCounts:Object.freeze(outcomeCounts),
   auditRows:Object.freeze(mergedRows.map(row=>Object.freeze(Object.assign({},row,{decisions:Object.freeze(row.decisions||{})})))),
   audited:mergedRows.length,
   reminedNoteCount:mergedRows.length,
   reminedThemes:themes,
   completedReminedThemes:completedThemes,
   latestWave:wave,
   latestBatchCount:rowsToAdd.length,
   latestBatchSource:'complete sequential packets',
   latestBatchPackets:Object.freeze(['data/review-packets/offsec-pen-200-04.json','data/review-packets/offsec-pen-200-05.json'])
  }))
 }));
}
extendLinuxReMiningProgress();
})(typeof window!=='undefined'?window:globalThis);
