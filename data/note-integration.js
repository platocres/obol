'use strict';
(function(root){
const PRIVATE_REPO='platocres/obol-source-notes';
const SOURCE_INVENTORY=Object.freeze([
 Object.freeze({id:'htb-penetration-tester',noteCount:352,resourceCount:859,sha256:'ceeab3da0770ecd3709bcd2693b7a26a6390ad45c5bbada0234079e6eb2ff06f',privateIndex:'data/htb-penetration-tester-note-index.json'}),
 Object.freeze({id:'offsec-pen-200',noteCount:204,resourceCount:467,sha256:'c02bf5958f2bf2aaa690b20e0a497b70eb83a8fc4276d2f1b52e11592e89acb1',privateIndex:'data/offsec-pen-200-note-index.json'})
]);
const DISPOSITIONS=Object.freeze(['pending-review','modeled','superseded','rejected','private-reference-only']);
const TERMINAL_DISPOSITIONS=Object.freeze(['modeled','superseded','rejected','private-reference-only']);
const ATOM_KINDS=Object.freeze(['lesson','tool-guidance','path-guidance','troubleshooting','evidence','report','cleanup']);

const REVIEWED_DISPOSITIONS=Object.freeze([
 Object.freeze({noteId:'htb-penetration-tester-bfe04186f42f682f',disposition:'modeled',reviewWave:'v9.25',rationale:'Credential extraction can create useful candidate material, but authentication and report proof require an independent validation step.',outputIds:Object.freeze(['note-lsass-proof-boundary'])}),
 Object.freeze({noteId:'htb-penetration-tester-29b80edb4523461f',disposition:'modeled',reviewWave:'v9.25',rationale:'Pass-the-hash handling adds a durable material-routing rule that distinguishes reusable NT material from challenge-response captures.',outputIds:Object.freeze(['note-pth-material-routing'])}),
 Object.freeze({noteId:'htb-penetration-tester-decf23d473e0762b',disposition:'modeled',reviewWave:'v9.25',rationale:'The source contains durable response-triage lessons for keeping web fuzzing narrow, reviewable, and signal-driven.',outputIds:Object.freeze(['note-web-fuzzing-signal-first'])}),
 Object.freeze({noteId:'offsec-pen-200-e58de5584625c70d',disposition:'modeled',reviewWave:'v9.25',rationale:'The source reinforces a durable proof boundary: establish a reproducible file-read primitive before chaining traversal into higher-impact assumptions.',outputIds:Object.freeze(['note-traversal-reproduce-before-chain'])}),

 Object.freeze({noteId:'htb-penetration-tester-120948f3c1b3b125',disposition:'modeled',reviewWave:'v9.26-wave-1',rationale:'The reviewed proxy exercise contains reusable lessons about client-side trust boundaries and preserving encode/decode transformation order during payload mutation.',outputIds:Object.freeze(['note-client-controls-not-auth','note-web-proxy-transform-order'])}),
 Object.freeze({noteId:'htb-penetration-tester-8f3b18c90f6d8c71',disposition:'private-reference-only',reviewWave:'v9.26-wave-1',rationale:'This record is primarily a broad navigation and topic index. It remains useful for private discovery but does not contain one unique lesson that should become public Obol guidance.',outputIds:Object.freeze([])}),
 Object.freeze({noteId:'htb-penetration-tester-fa8c222163adee0f',disposition:'modeled',reviewWave:'v9.26-wave-1',rationale:'The source provides a reusable chain model for file-inclusion execution: controllable persisted input, readable inclusion, executable interpretation, then separate execution proof.',outputIds:Object.freeze(['note-lfi-poisoning-chain'])}),
 Object.freeze({noteId:'htb-penetration-tester-f279cdee9c5e3574',disposition:'private-reference-only',reviewWave:'v9.26-wave-1',rationale:'The reviewed material is mainly a volatile proxy-extension marketplace catalog. Keep it private for reference rather than freezing changing extension recommendations into the product.',outputIds:Object.freeze([])}),
 Object.freeze({noteId:'htb-penetration-tester-d592517f0448201b',disposition:'modeled',reviewWave:'v9.26-wave-1',rationale:'The source yields a durable troubleshooting rule for testing path-normalization and filter assumptions incrementally while treating legacy bypasses as version-dependent hypotheses.',outputIds:Object.freeze(['note-path-filter-bypass-ladder'])}),
 Object.freeze({noteId:'htb-penetration-tester-fe111da6f31c2207',disposition:'modeled',reviewWave:'v9.26-wave-1',rationale:'The prevention analysis identifies a durable root cause for verb tampering: authorization and validation controls applied inconsistently across request methods.',outputIds:Object.freeze(['note-http-method-consistency'])}),
 Object.freeze({noteId:'htb-penetration-tester-6c77556fb31fd4b1',disposition:'modeled',reviewWave:'v9.26-wave-1',rationale:'The reviewed attack flow adds practical evidence for comparing identical functionality across HTTP methods when a security filter appears method-specific.',outputIds:Object.freeze(['note-http-method-consistency'])}),
 Object.freeze({noteId:'htb-penetration-tester-ddc7ad748c495e43',disposition:'modeled',reviewWave:'v9.26-wave-1',rationale:'The authentication-bypass example reinforces the same durable method-consistency lesson and the need to distinguish a method change from proof that protected behavior executed.',outputIds:Object.freeze(['note-http-method-consistency'])}),
 Object.freeze({noteId:'htb-penetration-tester-c6b73bd176a78a53',disposition:'private-reference-only',reviewWave:'v9.26-wave-1',rationale:'This assessment record is mostly lab-specific outcome material and does not add a distinct command-injection lesson beyond already modeled methodology.',outputIds:Object.freeze([])}),
 Object.freeze({noteId:'htb-penetration-tester-632cc48100068a60',disposition:'modeled',reviewWave:'v9.26-wave-1',rationale:'The source contributes durable report guidance: prefer eliminating shell invocation, server-side allowlisting, least privilege, and constrained scope over blacklist-only remediation.',outputIds:Object.freeze(['note-command-injection-remediation'])}),
 Object.freeze({noteId:'htb-penetration-tester-e2af649cc1054d41',disposition:'private-reference-only',reviewWave:'v9.26-wave-1',rationale:'The reviewed material is a tool-specific command-obfuscation catalog. Retain it privately rather than making opaque evasion tooling part of Obol\'s default reviewable command workflow.',outputIds:Object.freeze([])})
]);

const MODELED_SOURCE_REFS=Object.freeze(REVIEWED_DISPOSITIONS.filter(row=>row.disposition==='modeled').map(row=>row.noteId));
const PRIVATE_REFERENCE_SOURCE_REFS=Object.freeze(REVIEWED_DISPOSITIONS.filter(row=>row.disposition==='private-reference-only').map(row=>row.noteId));

function frozenCounts(raw){return Object.freeze({'pending-review':raw['pending-review']||0,modeled:raw.modeled||0,superseded:raw.superseded||0,rejected:raw.rejected||0,'private-reference-only':raw['private-reference-only']||0});}
function currentDispositionCounts(){
 const counts={'pending-review':0,modeled:0,superseded:0,rejected:0,'private-reference-only':0};
 for(const row of REVIEWED_DISPOSITIONS)counts[row.disposition]=(counts[row.disposition]||0)+1;
 const expected=SOURCE_INVENTORY.reduce((sum,source)=>sum+source.noteCount,0);
 counts['pending-review']=Math.max(0,expected-REVIEWED_DISPOSITIONS.length);
 return frozenCounts(counts);
}
const MILESTONES=Object.freeze({
 'v9.25':Object.freeze({reviewedCount:4,dispositionCounts:frozenCounts({'pending-review':552,modeled:4}),publicFieldNoteIds:Object.freeze(['note-lsass-proof-boundary','note-pth-material-routing','note-web-fuzzing-signal-first','note-traversal-reproduce-before-chain'])}),
 'v9.26-wave-1':Object.freeze({reviewedCount:15,dispositionCounts:frozenCounts({'pending-review':541,modeled:11,'private-reference-only':4}),publicFieldNoteIds:Object.freeze(['note-lsass-proof-boundary','note-pth-material-routing','note-web-fuzzing-signal-first','note-traversal-reproduce-before-chain','note-client-controls-not-auth','note-web-proxy-transform-order','note-lfi-poisoning-chain','note-path-filter-bypass-ladder','note-http-method-consistency','note-command-injection-remediation'])})
});
const LEDGER=Object.freeze({
 schemaVersion:'1.1.0',
 expectedNotes:556,
 expectedResources:1326,
 reviewedCount:REVIEWED_DISPOSITIONS.length,
 dispositionCounts:currentDispositionCounts(),
 modeledSourceRefs:MODELED_SOURCE_REFS,
 privateReferenceSourceRefs:PRIVATE_REFERENCE_SOURCE_REFS
});

const PUBLIC_FIELD_NOTES=Object.freeze([
 Object.freeze({
  id:'note-lsass-proof-boundary',
  title:'Credential dumps are candidates, not access proof',
  body:'When memory-derived passwords or hashes are recovered, preserve them as candidate credential material and validate access in a separate authentication step before advancing report proof.',
  kind:'evidence',cardIds:Object.freeze([]),toolIds:Object.freeze(['mimikatz','pypykatz','secretsdump']),pathIds:Object.freeze(['path']),tags:Object.freeze(['credential','lsass','proof-boundary']),sourceRefs:Object.freeze(['htb-penetration-tester-bfe04186f42f682f'])
 }),
 Object.freeze({
  id:'note-pth-material-routing',
  title:'Choose the branch from the credential material type',
  body:'Treat NT or LM:NT material as pass-the-hash input only where the selected tool supports it. NetNTLM challenge-response material belongs in a cracking branch instead of direct authentication.',
  kind:'tool-guidance',cardIds:Object.freeze([]),toolIds:Object.freeze(['nxc','evil-winrm','secretsdump','hashcat','john']),pathIds:Object.freeze(['path']),tags:Object.freeze(['ntlm','pass-the-hash','credential-routing']),sourceRefs:Object.freeze(['htb-penetration-tester-29b80edb4523461f'])
 }),
 Object.freeze({
  id:'note-web-fuzzing-signal-first',
  title:'Use response signals to narrow content discovery',
  body:'Start with a small reviewable fuzzing pass, use status and size differences to identify useful response classes, then add recursion, extensions, or broader wordlists deliberately instead of widening every dimension at once.',
  kind:'tool-guidance',cardIds:Object.freeze([]),toolIds:Object.freeze(['ffuf','gobuster','feroxbuster']),pathIds:Object.freeze(['path']),tags:Object.freeze(['fuzzing','content-discovery','triage']),sourceRefs:Object.freeze(['htb-penetration-tester-decf23d473e0762b'])
 }),
 Object.freeze({
  id:'note-traversal-reproduce-before-chain',
  title:'Prove the file-read primitive before chaining assumptions',
  body:'When traversal behavior is suspected, first establish a minimal reproducible read and capture the response in Evidence. Treat code execution, credential access, and follow-on impact as separate branches that require their own proof.',
  kind:'path-guidance',cardIds:Object.freeze([]),toolIds:Object.freeze(['curl']),pathIds:Object.freeze(['path']),tags:Object.freeze(['path-traversal','evidence','branching']),sourceRefs:Object.freeze(['offsec-pen-200-e58de5584625c70d'])
 }),
 Object.freeze({
  id:'note-client-controls-not-auth',
  title:'Client-side controls are not an authorization boundary',
  body:'A disabled button, hidden field, or front-end validation rule is only a client behavior. Inspect the underlying request and require server-side behavior or reviewed Evidence before concluding an action is actually restricted or permitted.',
  kind:'lesson',cardIds:Object.freeze([]),toolIds:Object.freeze(['curl']),pathIds:Object.freeze([]),tags:Object.freeze(['web','authorization','client-side','proxy']),sourceRefs:Object.freeze(['htb-penetration-tester-120948f3c1b3b125'])
 }),
 Object.freeze({
  id:'note-web-proxy-transform-order',
  title:'Preserve transformation order when fuzzing encoded values',
  body:'When an application applies multiple encodings or wrappers, first reproduce the decode chain, then apply payload mutations before re-encoding in the exact reverse transformation order. Compare response classes rather than assuming one encoded request proves success.',
  kind:'tool-guidance',cardIds:Object.freeze([]),toolIds:Object.freeze(['ffuf','curl']),pathIds:Object.freeze([]),tags:Object.freeze(['web-proxy','encoding','fuzzing','payload-processing']),sourceRefs:Object.freeze(['htb-penetration-tester-120948f3c1b3b125'])
 }),
 Object.freeze({
  id:'note-lfi-poisoning-chain',
  title:'Separate writable sink, readable include, and execution proof',
  body:'For file-inclusion-to-execution hypotheses, verify each link independently: attacker-controlled data reaches a persisted sink, the vulnerable include can read that sink, and the included content is interpreted in an executable context. Record command execution as a separate Evidence-backed transition.',
  kind:'path-guidance',cardIds:Object.freeze([]),toolIds:Object.freeze(['curl']),pathIds:Object.freeze(['path']),tags:Object.freeze(['lfi','log-poisoning','session-poisoning','evidence']),sourceRefs:Object.freeze(['htb-penetration-tester-fa8c222163adee0f'])
 }),
 Object.freeze({
  id:'note-path-filter-bypass-ladder',
  title:'Test path-normalization assumptions one layer at a time',
  body:'When traversal input is filtered, vary one normalization assumption at a time and verify the resulting file-read behavior. Prefer current encoding, prefix, and canonicalization hypotheses first; treat null-byte or truncation ideas as legacy-only unless the observed runtime makes them plausible.',
  kind:'troubleshooting',cardIds:Object.freeze([]),toolIds:Object.freeze(['curl']),pathIds:Object.freeze(['path']),tags:Object.freeze(['path-traversal','lfi','normalization','filter-bypass']),sourceRefs:Object.freeze(['htb-penetration-tester-d592517f0448201b'])
 }),
 Object.freeze({
  id:'note-http-method-consistency',
  title:'Compare authorization and filters across HTTP methods',
  body:'When protected functionality behaves differently across GET, POST, HEAD, OPTIONS, or another method, compare the same action across methods and capture the server response. A changed method is a bypass hypothesis; only observed protected behavior or downstream effect proves the control was actually bypassed.',
  kind:'path-guidance',cardIds:Object.freeze([]),toolIds:Object.freeze(['curl']),pathIds:Object.freeze(['path']),tags:Object.freeze(['http-method','verb-tampering','authorization','filter-bypass']),sourceRefs:Object.freeze(['htb-penetration-tester-fe111da6f31c2207','htb-penetration-tester-6c77556fb31fd4b1','htb-penetration-tester-ddc7ad748c495e43'])
 }),
 Object.freeze({
  id:'note-command-injection-remediation',
  title:'Report command-injection remediation as a design change',
  body:'When command injection is confirmed, recommend removing unnecessary shell invocation first. Where command execution is unavoidable, require strict server-side allowlisting, least-privilege execution, constrained filesystem/process scope, and defense in depth instead of relying on blacklist or escaping rules alone.',
  kind:'report',cardIds:Object.freeze([]),toolIds:Object.freeze([]),pathIds:Object.freeze(['path']),tags:Object.freeze(['command-injection','remediation','reporting']),sourceRefs:Object.freeze(['htb-penetration-tester-632cc48100068a60'])
 })
]);

function clean(value){return String(value==null?'':value).trim();}
function sourceForRef(ref){ref=clean(ref);return SOURCE_INVENTORY.find(source=>ref.startsWith(source.id+'-'))||null;}
function reviewedDisposition(noteId){noteId=clean(noteId);return REVIEWED_DISPOSITIONS.find(row=>row.noteId===noteId)||null;}
function atomizeMetadata(raw){
 raw=raw&&typeof raw==='object'?raw:{};
 const noteId=clean(raw.note_id||raw.noteId),sourceId=clean(raw.source_id||raw.sourceId),title=clean(raw.title),tags=Array.isArray(raw.tags)?raw.tags.map(clean).filter(Boolean):[];
 const source=sourceForRef(noteId);
 if(!noteId||!sourceId||!source||source.id!==sourceId)return null;
 const reviewed=reviewedDisposition(noteId);
 return Object.freeze({noteId,sourceId,titleHint:title.slice(0,160),tags:Object.freeze(tags.slice(0,64)),resourceCount:Number(raw.resource_count||raw.resourceCount||0)||0,contentSha256:clean(raw.content_sha256||raw.contentSha256),integrationStatus:reviewed?'reviewed':'pending-review',disposition:reviewed?reviewed.disposition:null,candidateKinds:Object.freeze([]),candidateToolBindings:Object.freeze([]),candidatePathBindings:Object.freeze([])});
}
function totals(){return SOURCE_INVENTORY.reduce((acc,source)=>({notes:acc.notes+source.noteCount,resources:acc.resources+source.resourceCount}),{notes:0,resources:0});}
function publicNotesForTool(toolId){const t=clean(toolId).toLowerCase();return PUBLIC_FIELD_NOTES.filter(note=>note.toolIds.some(tool=>String(tool).toLowerCase()===t));}
function publicNotesForPath(pathId){const p=clean(pathId);return PUBLIC_FIELD_NOTES.filter(note=>note.pathIds.includes(p));}
function dispositionTotal(){return Object.values(LEDGER.dispositionCounts).reduce((sum,count)=>sum+Number(count||0),0);}
function validate(){
 const failures=[],sum=totals(),noteIds=new Set(),outputIds=new Set(PUBLIC_FIELD_NOTES.map(note=>note.id));
 if(sum.notes!==LEDGER.expectedNotes)failures.push('source inventory note total does not match ledger');
 if(sum.resources!==LEDGER.expectedResources)failures.push('source inventory resource total does not match ledger');
 if(dispositionTotal()!==LEDGER.expectedNotes)failures.push('disposition counts do not account for every staged note');
 if(LEDGER.reviewedCount!==REVIEWED_DISPOSITIONS.length)failures.push('reviewed count does not match explicit disposition rows');
 if(LEDGER.dispositionCounts.modeled!==MODELED_SOURCE_REFS.length)failures.push('modeled disposition count does not match modeled source references');
 if(LEDGER.dispositionCounts['private-reference-only']!==PRIVATE_REFERENCE_SOURCE_REFS.length)failures.push('private-reference-only count does not match private reference rows');
 for(const row of REVIEWED_DISPOSITIONS){
  if(noteIds.has(row.noteId))failures.push('duplicate reviewed note '+row.noteId);noteIds.add(row.noteId);
  if(!/^(?:htb-penetration-tester|offsec-pen-200)-[0-9a-f]{16}$/.test(row.noteId))failures.push('invalid opaque source ref '+row.noteId);
  if(!sourceForRef(row.noteId))failures.push('unknown reviewed source ref '+row.noteId);
  if(!TERMINAL_DISPOSITIONS.includes(row.disposition))failures.push('reviewed note has non-terminal disposition '+row.noteId);
  if(!row.rationale||row.rationale.trim().length<24)failures.push('reviewed note lacks substantive rationale '+row.noteId);
  if(row.disposition==='modeled'){
   if(!row.outputIds.length)failures.push('modeled note lacks derived output '+row.noteId);
   for(const outputId of row.outputIds)if(!outputIds.has(outputId))failures.push('modeled note references missing output '+row.noteId+' -> '+outputId);
  }else if(row.outputIds.length)failures.push('non-modeled note declares public output '+row.noteId);
 }
 const seen=new Set();
 for(const note of PUBLIC_FIELD_NOTES){
  if(seen.has(note.id))failures.push('duplicate public field note '+note.id);seen.add(note.id);
  if(!ATOM_KINDS.includes(note.kind))failures.push('invalid public field-note kind '+note.id);
  if(!note.sourceRefs.length)failures.push('public field note missing private-ledger lineage '+note.id);
  for(const ref of note.sourceRefs){const row=reviewedDisposition(ref);if(!row||row.disposition!=='modeled')failures.push('public field note references non-modeled source '+ref);if(row&&row.outputIds&&!row.outputIds.includes(note.id))failures.push('public field note is absent from modeled output linkage '+note.id+' <- '+ref);}
  const publicText=[note.title,note.body,...note.sourceRefs].join(' ');
  if(/sources\/raw\/|\.enex\b|<en-note|<resource/i.test(publicText))failures.push('public field note leaks raw private-source material '+note.id);
 }
 for(const row of REVIEWED_DISPOSITIONS.filter(entry=>entry.disposition==='modeled'))for(const outputId of row.outputIds){const note=PUBLIC_FIELD_NOTES.find(entry=>entry.id===outputId);if(note&&!note.sourceRefs.includes(row.noteId))failures.push('modeled source lineage missing from output '+row.noteId+' -> '+outputId);}
 const milestone=MILESTONES['v9.25'];
 if(!milestone||milestone.reviewedCount!==4||milestone.dispositionCounts.modeled!==4||milestone.dispositionCounts['pending-review']!==552)failures.push('v9.25 note-integration milestone drifted');
 return failures;
}
root.OBOL_NOTE_INTEGRATION=Object.freeze({schemaVersion:'1.1.0',privateRepo:PRIVATE_REPO,sourceInventory:SOURCE_INVENTORY,dispositions:DISPOSITIONS,terminalDispositions:TERMINAL_DISPOSITIONS,atomKinds:ATOM_KINDS,reviewedDispositions:REVIEWED_DISPOSITIONS,milestones:MILESTONES,ledger:LEDGER,publicFieldNotes:PUBLIC_FIELD_NOTES,atomizeMetadata,sourceForRef,reviewedDisposition,publicNotesForTool,publicNotesForPath,totals,validate});
})(typeof window!=='undefined'?window:globalThis);
