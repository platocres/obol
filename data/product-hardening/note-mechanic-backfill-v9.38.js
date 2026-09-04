'use strict';
(function(root){
const SOURCE_PACKET='platocres/obol-source-notes@agent/review-packets:data/review-packets/htb-penetration-tester-03.json';
const sourceProof=Object.freeze({
 route:'complete sequential packets',
 packet:SOURCE_PACKET,
 source_id:'htb-penetration-tester',
 packet_offset:40,
 packet_count:20,
 review_text_policy:'complete_cleaned_text',
 truncation_policy:'none'
});
const freezeChanges=changes=>Object.freeze((changes||[]).map(change=>Object.freeze({type:change.type,owners:Object.freeze((change.owners||[]).slice()),cardIds:Object.freeze((change.cardIds||[]).slice()),toolIds:Object.freeze((change.toolIds||[]).slice()),proofRefs:Object.freeze((change.proofRefs||[]).slice())})));
const mechanic=(owners,cardIds,toolIds)=>[{type:'contextual-product-change',owners,cardIds,toolIds,proofRefs:['assets/source-mined-card-route-current.js','tests/run-v9.54-tests.js']}];
const rows=Object.freeze([
 {noteId:'htb-penetration-tester-db1367c3cb696693',title:'Absent Validation',reviewWave:'v9.28-wave-3',decision:'mechanic',productChanges:mechanic(['website-discovery','file-upload'],['file-upload-proof-boundary'],['curl']),rereadOutcome:'Complete packet text shows the reusable value is not a payload recipe; it is the upload proof boundary and framework-language selection step: accepted, stored, reachable, interpreted, and executed must be proven separately.'},
 {noteId:'htb-penetration-tester-dcf44979c5cbeb28',title:'Intro to File Upload Attacks',reviewWave:'v9.28-wave-3',decision:'mechanic',productChanges:mechanic(['file-upload'],['file-upload-proof-boundary'],['curl']),rereadOutcome:'The durable product value is the file-upload threat model and state separation. Obol now attaches that value to the existing upload card and a gated proof-boundary card instead of leaving it as guidance only.'},
 {noteId:'htb-penetration-tester-18346c45629d79b0',title:'Skills Assessment - File Inclusion',reviewWave:'v9.28-wave-3',decision:'retain-private',productChanges:[],rereadOutcome:'The assessment-specific sequence, targets, answers, and exact solution chain remain private. Its reusable LFI proof model is covered by file-inclusion-proof-chain and php-wrapper-source-review.'},
 {noteId:'htb-penetration-tester-c9ffcfe30bb8105b',title:'File Inclusion Prevention',reviewWave:'v9.28-wave-3',decision:'mechanic',productChanges:mechanic(['lfi-probe','file-inclusion-proof-chain'],['file-inclusion-proof-chain'],['curl']),rereadOutcome:'The complete note adds report-facing value: describe input validation, allowlisting, path canonicalization, and safe include roots from the proven file-read chain rather than from a generic remediation paragraph.'},
 {noteId:'htb-penetration-tester-c234c00d18a235f3',title:'Automated Scanning',reviewWave:'v9.28-wave-3',decision:'mechanic',productChanges:mechanic(['content-discovery','lfi-probe','tb-ffuf'],['web-parameter-fuzzing'],['ffuf','curl']),rereadOutcome:'Claude kept only a builder mechanic. Complete packet text also supports a contextual parameter-fuzzing path item that belongs between content discovery and LFI testing, with ffuf auto-calibration as a supporting builder option.'},
 {noteId:'htb-penetration-tester-b90fb6ba8060ca62',title:'PHP Filters',reviewWave:'v9.28-wave-3',decision:'mechanic',productChanges:mechanic(['lfi-probe'],['php-wrapper-source-review'],['curl','sh']),rereadOutcome:'PHP filter output is a source-disclosure and transformation proof, not execution proof. Obol now models wrapper output, local decoding, and source/config interpretation as a gated card after LFI confirmation.'},
 {noteId:'htb-penetration-tester-4d269654772ade3f',title:'Local File Inclusion (LFI)',reviewWave:'v9.28-wave-3',decision:'mechanic',productChanges:mechanic(['lfi-probe'],['file-inclusion-proof-chain'],['curl']),rereadOutcome:'The reusable value is a proof chain: parameter control, recognizable local-file read, path normalization behavior, source/config reads, and credential candidate extraction are separate claims.'},
 {noteId:'htb-penetration-tester-c89f8281ca7b1cb6',title:'LFI and File Uploads',reviewWave:'v9.28-wave-3',decision:'mechanic',productChanges:mechanic(['file-upload','web-shells','lfi-probe'],['upload-to-include-chain-review'],['curl']),rereadOutcome:'The robust packet shows this belongs where upload storage intersects include interpretation. Obol now adds a gated chain card after the upload/web-shell path instead of treating upload plus LFI as a vague future gap.'},
 {noteId:'htb-penetration-tester-999330f41a434b37',title:'Remote File Inclusion (RFI)',reviewWave:'v9.28-wave-3',decision:'mechanic',productChanges:mechanic(['lfi-probe','file-inclusion-proof-chain'],['file-inclusion-proof-chain'],['curl']),rereadOutcome:'Remote retrieval is not execution by itself. The public-safe value is to require target-side evidence that the application fetched and interpreted remote content before promoting an RFI claim.'},
 {noteId:'htb-penetration-tester-bf66c6300266b4d0',title:'PHP Wrappers',reviewWave:'v9.28-wave-3',decision:'mechanic',productChanges:mechanic(['lfi-probe'],['php-wrapper-source-review'],['curl','sh']),rereadOutcome:'Wrapper transformations are modeled as interpretation boundaries. The useful public output is wrapper selection, encoded-source handling, and local decoding, not copied payload catalogs.'},
 {noteId:'htb-penetration-tester-eb9ed63c6680ecdd',title:'Intro to File Inclusions',reviewWave:'v9.28-wave-3',decision:'mechanic',productChanges:mechanic(['lfi-probe'],['file-inclusion-proof-chain'],['curl']),rereadOutcome:'The robust text supports a file-inclusion taxonomy and path decision model. Obol now uses it to keep local read, source disclosure, remote retrieval, and execution as distinct path states.'},
 {noteId:'htb-penetration-tester-84952ff3cb48a763',title:'Cheat Sheet - File Inclusions',reviewWave:'v9.28-wave-3',decision:'retain-private',productChanges:[],rereadOutcome:'The note is payload-catalog heavy and remains private at expression level. Its reusable taxonomy and wrapper boundaries are incorporated through file-inclusion-proof-chain and php-wrapper-source-review.'},
 {noteId:'htb-penetration-tester-5f96f974f0016be6',title:'Skills Assessment',reviewWave:'v9.28-wave-3',decision:'retain-private',productChanges:[],rereadOutcome:'Assessment targets, flags, exact answer path, and solution order remain private. The durable inclusion/upload proof states are incorporated by the web proof-chain cards.'},
 {noteId:'htb-penetration-tester-0796f416886d4fca',title:'XSS Prevention',reviewWave:'v9.28-wave-3',decision:'guidance-only',productChanges:[],rereadOutcome:'The complete note is remediation context rather than a new deterministic path state. Future report UX should consume it as sink-specific remediation guidance, but no new card is justified in this cleanup PR.'}
].map(row=>Object.freeze({...row,sourceProof,robustReread:true,productChanges:freezeChanges(row.productChanges)})));
const targetReviewed=127;
function summarize(){
 return Object.freeze({
  targetReviewed,
  audited:rows.length,
  remaining:Math.max(0,targetReviewed-rows.length),
  mechanic:rows.filter(row=>row.decision==='mechanic').length,
  guidanceOnly:rows.filter(row=>row.decision==='guidance-only').length,
  retainPrivate:rows.filter(row=>row.decision==='retain-private').length,
  robustReread:rows.filter(row=>row.robustReread).length,
  sourcePacket:SOURCE_PACKET
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
  if(!row.robustReread||!row.sourceProof||row.sourceProof.packet!==SOURCE_PACKET)failures.push('backfill note lacks complete-packet reread proof '+row.noteId);
  if(!row.rereadOutcome)failures.push('backfill note lacks robust reread outcome '+row.noteId);
  if(row.decision==='mechanic'){
   if(!row.productChanges.length)failures.push('mechanic decision lacks productChanges '+row.noteId);
   for(const change of row.productChanges)if(!change.type||!change.proofRefs.length||!change.cardIds.length)failures.push('mechanic decision lacks contextual proof refs '+row.noteId);
  }else if(!row.rereadOutcome)failures.push('non-mechanic decision lacks explicit outcome '+row.noteId);
 }
 return failures;
}
root.OBOL_NOTE_MECHANIC_BACKFILL_V938=Object.freeze({schemaVersion:'1.1.0',release:'v9.38',targetReviewed,sourceProof,rows,summarize,validate});
})(typeof window!=='undefined'?window:globalThis);
