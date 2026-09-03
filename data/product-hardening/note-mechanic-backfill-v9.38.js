'use strict';
(function(root){
const freezeChanges=changes=>Object.freeze((changes||[]).map(change=>Object.freeze({type:change.type,proofRefs:Object.freeze((change.proofRefs||[]).slice())})));
const rows=Object.freeze([
 {noteId:'htb-penetration-tester-db1367c3cb696693',reviewWave:'v9.28-wave-3',decision:'guidance-only',guidanceOnlyReason:'Upload acceptance is already represented as an Evidence proof boundary. No deterministic product state may promote acceptance into storage, reachability, interpretation, or impact without reviewed response evidence.'},
 {noteId:'htb-penetration-tester-dcf44979c5cbeb28',reviewWave:'v9.28-wave-3',decision:'guidance-only',guidanceOnlyReason:'The acceptance-to-storage-to-serving-to-impact decomposition is a durable proof model, but no additional automatic transition is justified without observed server behavior.'},
 {noteId:'htb-penetration-tester-18346c45629d79b0',reviewWave:'v9.28-wave-3',decision:'retain-private',guidanceOnlyReason:'The source is walkthrough-specific and its reusable file-read and interpretation lessons are already normalized in public outputs; no additional mechanic is justified.'},
 {noteId:'htb-penetration-tester-c9ffcfe30bb8105b',reviewWave:'v9.28-wave-3',decision:'guidance-only',guidanceOnlyReason:'Remediation guidance belongs in report context. It does not provide a deterministic observation that should alter Path ranking, Evidence parsing, or generated commands.'},
 {noteId:'htb-penetration-tester-c234c00d18a235f3',reviewWave:'v9.28-wave-3',decision:'mechanic',productChanges:[{type:'tool-builder-change',proofRefs:['assets/tool-builder-current.js','tests/run-v9.38-tests.js']}],guidanceOnlyReason:null},
 {noteId:'htb-penetration-tester-b90fb6ba8060ca62',reviewWave:'v9.28-wave-3',decision:'guidance-only',guidanceOnlyReason:'Wrapper and transformed-output interpretation remains an Evidence classification boundary; Obol must not infer execution from source disclosure or transformed content.'},
 {noteId:'htb-penetration-tester-4d269654772ade3f',reviewWave:'v9.28-wave-3',decision:'guidance-only',guidanceOnlyReason:'A controllable path, successful read, source disclosure, and later execution are distinct proof states. Existing Evidence review owns that distinction without a safe automatic promotion rule.'},
 {noteId:'htb-penetration-tester-c89f8281ca7b1cb6',reviewWave:'v9.28-wave-3',decision:'guidance-only',guidanceOnlyReason:'Upload plus inclusion is a multi-stage proof chain whose later stages depend on returned evidence. Automatically chaining those states would overclaim success.'},
 {noteId:'htb-penetration-tester-999330f41a434b37',reviewWave:'v9.28-wave-3',decision:'guidance-only',guidanceOnlyReason:'Remote retrieval and interpretation must be demonstrated by target-side Evidence. Operator-hosted content alone cannot safely trigger a Path or proof-state transition.'},
 {noteId:'htb-penetration-tester-bf66c6300266b4d0',reviewWave:'v9.28-wave-3',decision:'guidance-only',guidanceOnlyReason:'Encoding and wrapper transformations are hypotheses, not deterministic findings. The reusable value is proof-boundary guidance rather than a generated exploit or inferred state.'},
 {noteId:'htb-penetration-tester-eb9ed63c6680ecdd',reviewWave:'v9.28-wave-3',decision:'guidance-only',guidanceOnlyReason:'The file-inclusion taxonomy improves operator interpretation, but branch selection still depends on reviewed target behavior and should not be inferred from a generated request.'},
 {noteId:'htb-penetration-tester-84952ff3cb48a763',reviewWave:'v9.28-wave-3',decision:'retain-private',guidanceOnlyReason:'The source is primarily a payload catalog. Public Obol should retain normalized proof sequencing and troubleshooting rather than reproduce recipe-heavy private material.'},
 {noteId:'htb-penetration-tester-5f96f974f0016be6',reviewWave:'v9.28-wave-3',decision:'retain-private',guidanceOnlyReason:'The source is dominated by lab-specific XSS walkthrough state; durable session-impact and remediation guidance is already normalized elsewhere.'},
 {noteId:'htb-penetration-tester-0796f416886d4fca',reviewWave:'v9.28-wave-3',decision:'guidance-only',guidanceOnlyReason:'Context-aware XSS remediation is report guidance rather than a deterministic runtime mechanic; the correct recommendation depends on the actual sink and application context.'}
].map(row=>Object.freeze({...row,productChanges:freezeChanges(row.productChanges)})));
const targetReviewed=127;
function summarize(){
 return Object.freeze({
  targetReviewed,
  audited:rows.length,
  remaining:Math.max(0,targetReviewed-rows.length),
  mechanic:rows.filter(row=>row.decision==='mechanic').length,
  guidanceOnly:rows.filter(row=>row.decision==='guidance-only').length,
  retainPrivate:rows.filter(row=>row.decision==='retain-private').length
 });
}
function validate(noteIntegration){
 const failures=[];
 const reviewed=new Map(Array.from(noteIntegration&&noteIntegration.reviewedDispositions||[]).map(row=>[row.noteId,row]));
 const seen=new Set();
 for(const row of rows){
  if(seen.has(row.noteId))failures.push('duplicate backfill note '+row.noteId);seen.add(row.noteId);
  const source=reviewed.get(row.noteId);
  if(!source)failures.push('backfill note is not in reviewed dispositions '+row.noteId);
  else if(source.reviewWave!==row.reviewWave)failures.push('backfill review wave drift '+row.noteId);
  if(!['mechanic','guidance-only','retain-private'].includes(row.decision))failures.push('unknown backfill decision '+row.noteId);
  if(row.decision==='mechanic'){
   if(!row.productChanges.length)failures.push('mechanic decision lacks productChanges '+row.noteId);
   for(const change of row.productChanges)if(!change.type||!change.proofRefs.length)failures.push('mechanic decision lacks proof refs '+row.noteId);
  }else if(!row.guidanceOnlyReason)failures.push('non-mechanic decision lacks explicit reason '+row.noteId);
 }
 return failures;
}
root.OBOL_NOTE_MECHANIC_BACKFILL_V938=Object.freeze({schemaVersion:'1.0.0',release:'v9.38',targetReviewed,rows,summarize,validate});
})(typeof window!=='undefined'?window:globalThis);
