'use strict';
(function(root){
const base=root.OBOL_NOTE_INTEGRATION;
if(!base)throw new Error('Base note integration owner must load before review extensions');
const freezeRows=rows=>Object.freeze(rows.map(row=>Object.freeze({...row,outputIds:Object.freeze((row.outputIds||[]).slice())})));
const freezeList=list=>Object.freeze(list.slice());
const WAVE='v9.28-wave-3';
const WAVE_ROWS=freezeRows([
 {noteId:'htb-penetration-tester-db1367c3cb696693',disposition:'modeled',reviewWave:WAVE,rationale:'Absent upload validation reinforces the durable distinction between server acceptance and demonstrated impact; storage, serving behavior, and interpretation still require separate proof.',outputIds:['note-upload-acceptance-not-impact']},
 {noteId:'htb-penetration-tester-dcf44979c5cbeb28',disposition:'modeled',reviewWave:WAVE,rationale:'The upload introduction contributes the reusable baseline that upload risk must be decomposed into acceptance, storage, reachability, interpretation, and downstream effect rather than treated as one event.',outputIds:['note-upload-acceptance-not-impact']},
 {noteId:'htb-penetration-tester-18346c45629d79b0',disposition:'private-reference-only',reviewWave:WAVE,rationale:'This file-inclusion assessment is primarily lab-specific walkthrough and outcome material; its durable lessons are represented by normalized file-read, interpretation, and remediation guidance.',outputIds:[]},
 {noteId:'htb-penetration-tester-c9ffcfe30bb8105b',disposition:'modeled',reviewWave:WAVE,rationale:'The prevention material adds durable report guidance around allowlisted path selection, canonicalization, fixed server-side mappings, least privilege, and avoiding direct user control of include targets.',outputIds:['note-file-inclusion-remediation']},
 {noteId:'htb-penetration-tester-c234c00d18a235f3',disposition:'modeled',reviewWave:WAVE,rationale:'Automated inclusion scanning adds a reusable signal-first workflow: establish one reproducible read pattern, then widen parameters, payload families, and response filters deliberately instead of maximizing every dimension at once.',outputIds:['note-file-inclusion-scan-signal']},
 {noteId:'htb-penetration-tester-b90fb6ba8060ca62',disposition:'modeled',reviewWave:WAVE,rationale:'Filter and wrapper behavior contributes a durable proof rule that transformed output, source disclosure, and executable interpretation are distinct server behaviors and must not be conflated.',outputIds:['note-file-inclusion-interpretation-boundary']},
 {noteId:'htb-penetration-tester-4d269654772ade3f',disposition:'modeled',reviewWave:WAVE,rationale:'The LFI material reinforces a durable distinction between attacker-controlled path selection, successful local file read, source disclosure, and any later execution or credential impact.',outputIds:['note-file-inclusion-interpretation-boundary']},
 {noteId:'htb-penetration-tester-c89f8281ca7b1cb6',disposition:'modeled',reviewWave:WAVE,rationale:'The upload-plus-inclusion chain contributes a reusable sequencing model: controlled upload, known storage location, successful inclusion, executable interpretation, then separately reviewed execution effect.',outputIds:['note-file-inclusion-cross-source-chain']},
 {noteId:'htb-penetration-tester-999330f41a434b37',disposition:'modeled',reviewWave:WAVE,rationale:'Remote inclusion adds the durable requirement to prove server-side remote retrieval and interpretation independently from local operator hosting, request delivery, and any later command effect.',outputIds:['note-file-inclusion-cross-source-chain']},
 {noteId:'htb-penetration-tester-bf66c6300266b4d0',disposition:'modeled',reviewWave:WAVE,rationale:'Wrapper examples reinforce that encoding, filtering, and transport transformations are hypotheses about how the server resolves an include; source disclosure and code execution remain separate proof states.',outputIds:['note-file-inclusion-interpretation-boundary']},
 {noteId:'htb-penetration-tester-eb9ed63c6680ecdd',disposition:'modeled',reviewWave:WAVE,rationale:'The file-inclusion introduction contributes the durable taxonomy needed by the product: controllable include target, successful read, transformed disclosure, remote retrieval, and executable interpretation are different branches.',outputIds:['note-file-inclusion-interpretation-boundary']},
 {noteId:'htb-penetration-tester-84952ff3cb48a763',disposition:'private-reference-only',reviewWave:WAVE,rationale:'This record is a recipe-heavy file-inclusion cheat sheet. Keep it private because public Obol should expose proof sequencing, troubleshooting, and remediation rather than a copied payload catalog.',outputIds:[]},
 {noteId:'htb-penetration-tester-5f96f974f0016be6',disposition:'private-reference-only',reviewWave:WAVE,rationale:'This XSS assessment is primarily lab-specific walkthrough and outcome material; durable session-impact and remediation lessons belong in normalized guidance rather than public exercise reproduction.',outputIds:[]},
 {noteId:'htb-penetration-tester-0796f416886d4fca',disposition:'modeled',reviewWave:WAVE,rationale:'The XSS prevention material adds durable report guidance: context-aware output encoding, safe DOM APIs, input constraints as defense in depth, CSP as a secondary control, and hardened session cookies.',outputIds:['note-xss-remediation-context']}
]);
const NEW_PUBLIC_NOTES=freezeList([
 Object.freeze({id:'note-upload-acceptance-not-impact',title:'Upload acceptance is not impact',body:'Treat an accepted upload as the beginning of a proof chain, not the conclusion. Record the final stored name and location, whether the file is reachable, how the server serves or processes it, and any downstream effect separately before assigning impact.',kind:'evidence',cardIds:freezeList([]),toolIds:freezeList(['curl']),pathIds:freezeList(['path']),tags:freezeList(['file-upload','proof-boundary','storage','evidence']),sourceRefs:freezeList(['htb-penetration-tester-db1367c3cb696693','htb-penetration-tester-dcf44979c5cbeb28'])}),
 Object.freeze({id:'note-file-inclusion-remediation',title:'File-inclusion remediation should remove user-controlled resolution',body:'For file-inclusion findings, prefer fixed server-side resource mappings or strict allowlists, canonicalize before authorization, constrain readable paths and process privileges, and avoid passing attacker-controlled values directly into include or file-resolution APIs. Filtering traversal strings alone is not a durable boundary.',kind:'report',cardIds:freezeList([]),toolIds:freezeList([]),pathIds:freezeList(['path']),tags:freezeList(['file-inclusion','lfi','remediation','reporting']),sourceRefs:freezeList(['htb-penetration-tester-c9ffcfe30bb8105b'])}),
 Object.freeze({id:'note-file-inclusion-scan-signal',title:'Widen file-inclusion scanning from a proven signal',body:'First establish one reproducible file-read response and its identifying status, size, or content signature. Then expand parameters, traversal depth, encodings, wrappers, or wordlists one dimension at a time so automation remains explainable and false positives stay reviewable.',kind:'tool-guidance',cardIds:freezeList([]),toolIds:freezeList(['ffuf','curl']),pathIds:freezeList(['path']),tags:freezeList(['file-inclusion','lfi','fuzzing','triage']),sourceRefs:freezeList(['htb-penetration-tester-c234c00d18a235f3'])}),
 Object.freeze({id:'note-file-inclusion-interpretation-boundary',title:'File read, transformed disclosure, and execution are different branches',body:'A controllable include target may produce a plain file read, transformed or encoded source disclosure, a failed resolution, or executable interpretation. Capture which behavior the server actually demonstrates and do not promote source disclosure or wrapper handling into code-execution proof without an independent downstream effect.',kind:'path-guidance',cardIds:freezeList([]),toolIds:freezeList(['curl']),pathIds:freezeList(['path']),tags:freezeList(['file-inclusion','lfi','wrappers','proof-boundary']),sourceRefs:freezeList(['htb-penetration-tester-b90fb6ba8060ca62','htb-penetration-tester-4d269654772ade3f','htb-penetration-tester-bf66c6300266b4d0','htb-penetration-tester-eb9ed63c6680ecdd'])}),
 Object.freeze({id:'note-file-inclusion-cross-source-chain',title:'Prove every boundary in upload or remote inclusion chains',body:'When inclusion depends on another source, verify each boundary independently: the source is attacker-controlled, its location or remote URL is known, the target server actually retrieves or includes it, the runtime interprets it as expected, and a separate reviewed effect demonstrates execution. Operator-hosted content alone proves none of the later stages.',kind:'evidence',cardIds:freezeList([]),toolIds:freezeList(['curl']),pathIds:freezeList(['path']),tags:freezeList(['file-inclusion','rfi','file-upload','execution','evidence']),sourceRefs:freezeList(['htb-penetration-tester-c89f8281ca7b1cb6','htb-penetration-tester-999330f41a434b37'])}),
 Object.freeze({id:'note-xss-remediation-context',title:'XSS remediation must match the output context',body:'Recommend context-aware output encoding and safe DOM APIs as the primary boundary, with input constraints as defense in depth. Add a restrictive Content Security Policy where practical and harden session cookies with HttpOnly, Secure, and appropriate SameSite settings so a rendering bug is less likely to become session compromise.',kind:'report',cardIds:freezeList([]),toolIds:freezeList([]),pathIds:freezeList(['path']),tags:freezeList(['xss','remediation','csp','session']),sourceRefs:freezeList(['htb-penetration-tester-0796f416886d4fca'])})
]);
const reviewed=freezeList(Array.from(base.reviewedDispositions).concat(Array.from(WAVE_ROWS)));
const publicFieldNotes=freezeList(Array.from(base.publicFieldNotes).concat(Array.from(NEW_PUBLIC_NOTES)));
const counts={'pending-review':0,modeled:0,superseded:0,rejected:0,'private-reference-only':0};
for(const row of reviewed)counts[row.disposition]=(counts[row.disposition]||0)+1;
counts['pending-review']=Math.max(0,base.totals().notes-reviewed.length);
const frozenCounts=Object.freeze({...counts});
const milestone=Object.freeze({reviewedCount:reviewed.length,dispositionCounts:frozenCounts,publicFieldNoteIds:freezeList(publicFieldNotes.map(note=>note.id))});
const milestones=Object.freeze({...base.milestones,[WAVE]:milestone});
const ledger=Object.freeze({...base.ledger,schemaVersion:'1.3.0',reviewedCount:reviewed.length,dispositionCounts:frozenCounts,modeledSourceRefs:freezeList(reviewed.filter(row=>row.disposition==='modeled').map(row=>row.noteId)),privateReferenceSourceRefs:freezeList(reviewed.filter(row=>row.disposition==='private-reference-only').map(row=>row.noteId))});
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
 if(reviewed.length!==55)failures.push('v9.28 reviewed count must be 55');
 if(frozenCounts.modeled!==43||frozenCounts['private-reference-only']!==12||frozenCounts['pending-review']!==501)failures.push('v9.28 disposition counts are inconsistent');
 if(!milestones[WAVE]&&false)failures.push('v9.28 milestone missing');
 const ids=new Set(publicFieldNotes.map(note=>note.id));
 for(const row of WAVE_ROWS){
  if(!base.terminalDispositions.includes(row.disposition))failures.push('v9.28 row is non-terminal '+row.noteId);
  if(!row.rationale||row.rationale.length<24)failures.push('v9.28 row lacks rationale '+row.noteId);
  if(row.disposition==='modeled')for(const id of row.outputIds)if(!ids.has(id))failures.push('v9.28 modeled output missing '+row.noteId+' -> '+id);
  if(row.disposition!=='modeled'&&row.outputIds.length)failures.push('v9.28 non-modeled row publishes output '+row.noteId);
 }
 for(const note of NEW_PUBLIC_NOTES){for(const ref of note.sourceRefs){const row=reviewedDisposition(ref);if(!row||row.disposition!=='modeled'||!row.outputIds.includes(note.id))failures.push('v9.28 reciprocal lineage mismatch '+note.id+' <- '+ref);}}
 return failures;
}
root.OBOL_NOTE_INTEGRATION=Object.freeze({...base,schemaVersion:'1.3.0',reviewedDispositions:reviewed,milestones,ledger,publicFieldNotes,reviewedDisposition,atomizeMetadata,publicNotesForTool,publicNotesForPath,validate});
})(typeof window!=='undefined'?window:globalThis);
