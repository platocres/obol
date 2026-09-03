'use strict';
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/note-integration.js','data/note-integration-reviews.js','data/note-integration-packets.js','data/product-hardening/note-mechanic-backfill-v9.38.js','data/product-hardening/note-progress-current.js','data/product-hardening/notes-impact-current.js'])vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),sandbox,{filename:rel});
const impact=sandbox.window.OBOL_PRODUCT_HARDENING_NOTES_IMPACT;
const backfill=sandbox.window.OBOL_NOTE_MECHANIC_BACKFILL_V938;
if(!impact){console.error('Notes impact projection did not load.');process.exit(1);}
const failures=Array.from(impact.validate());
if(impact.review.total!==556)failures.push('notes impact total must remain 556');
if(impact.review.reviewed<76)failures.push('notes impact must not regress below the v9.30 completed web-packet baseline of 76 reviewed notes');
if(impact.review.reviewed!==impact.review.modeled+impact.review.privateOnly+impact.review.superseded+impact.review.rejected)failures.push('reviewed disposition counts do not reconcile');
if(impact.review.pending!==impact.review.total-impact.review.reviewed)failures.push('pending count does not reconcile with reviewed count');
if(impact.outputCounts.fieldNotes<32)failures.push('notes impact must not regress below the v9.30 completed web-packet baseline of 32 public Field Notes');
if(!impact.themes.some(theme=>theme.name==='File inclusion'&&theme.evidenceImpact&&theme.reportImpact))failures.push('file-inclusion theme must preserve Evidence and report impact');
if(!impact.themes.some(theme=>theme.name==='File upload'&&theme.pathImpact&&theme.evidenceImpact&&theme.reportImpact))failures.push('file-upload theme must preserve Path, Evidence, and report impact');
if(impact.review.reviewed>=127&&!impact.themes.some(theme=>theme.name==='Windows local privilege escalation'&&theme.pathImpact&&theme.evidenceImpact))failures.push('Windows local privilege-escalation theme must preserve Path and Evidence impact after the v9.35 packet');
const decisions=Array.from(impact.sourceDecisions||[]),expectedLatest=decisions.length?decisions[decisions.length-1].reviewWave:null;
if(expectedLatest&&(!impact.latestWave||impact.latestWave.id!==expectedLatest))failures.push('latest wave must follow the newest reviewed disposition row');
if(expectedLatest==='v9.30-web-upload-inclusion-2'&&impact.latestWave.reviewed!==11)failures.push('completed web packet closeout wave must expose eleven newly terminal source decisions');
if(impact.outputCounts.declaredProductChanges<1||impact.outputCounts.toolBuilderChanges<1)failures.push('note-driven curl path-preservation product change must remain declared');
if(!impact.rubric){failures.push('notes conversion rubric projection missing');}
else{
 if(impact.rubric.compliant+impact.rubric.unjustifiedGuidanceOnly!==impact.rubric.modeled)failures.push('conversion rubric counts do not reconcile with modeled total');
 if(impact.rubric.mechanicBacked<1)failures.push('at least one modeled note must declare a product mechanic');
 if(impact.rubric.unjustifiedGuidanceOnly>impact.rubric.backlogCeiling)failures.push('unjustified guidance-only modeled notes ('+impact.rubric.unjustifiedGuidanceOnly+') exceed the ratchet ceiling ('+impact.rubric.backlogCeiling+'): declare a product mechanic or an explicit guidanceOnlyReason, and never raise the ceiling');
}
if(backfill){
 const summary=backfill.summarize();
 if(impact.outputCounts.backfillAudited!==summary.audited)failures.push('notes impact backfill audit count does not match the v9.38 ledger');
 if(impact.outputCounts.declaredProductChanges<2||impact.outputCounts.toolBuilderChanges<2)failures.push('v9.38 backfill must expose both note-driven Tool Builder mechanics');
 if(impact.rubric.mechanicBacked<2)failures.push('v9.38 backfill mechanic must be reflected in the conversion rubric');
 if(impact.rubric.unjustifiedGuidanceOnly!==32||impact.rubric.backlogCeiling!==32)failures.push('v9.38 first backfill pass must ratchet the unjustified guidance-only backlog to 32');
}
if(failures.length){console.error('Notes impact validation failed:');for(const failure of failures)console.error('- '+failure);process.exit(1);}
console.log('Notes impact projection validated:',impact.review.reviewed+'/'+impact.review.total,'reviewed;',impact.outputCounts.fieldNotes,'public outputs; mechanic conversion',impact.rubric.mechanicBacked+'/'+impact.rubric.modeled,'('+impact.rubric.mechanicConversionPct+'%); guidance-only backlog',impact.rubric.unjustifiedGuidanceOnly+'/'+impact.rubric.backlogCeiling+' ceiling; backfill audited',impact.outputCounts.backfillAudited+'.');
