'use strict';
(function(root){
const PRIVATE_REPO='platocres/obol-source-notes';
const SOURCE_INVENTORY=Object.freeze([
 Object.freeze({id:'htb-penetration-tester',noteCount:352,resourceCount:859,sha256:'ceeab3da0770ecd3709bcd2693b7a26a6390ad45c5bbada0234079e6eb2ff06f',privateIndex:'data/htb-penetration-tester-note-index.json'}),
 Object.freeze({id:'offsec-pen-200',noteCount:204,resourceCount:467,sha256:'c02bf5958f2bf2aaa690b20e0a497b70eb83a8fc4276d2f1b52e11592e89acb1',privateIndex:'data/offsec-pen-200-note-index.json'})
]);
const DISPOSITIONS=Object.freeze(['pending-review','modeled','superseded','rejected','private-reference-only']);
const ATOM_KINDS=Object.freeze(['lesson','tool-guidance','path-guidance','troubleshooting','evidence','report','cleanup']);
const MODELED_SOURCE_REFS=Object.freeze([
 'htb-penetration-tester-bfe04186f42f682f',
 'htb-penetration-tester-29b80edb4523461f',
 'htb-penetration-tester-decf23d473e0762b',
 'offsec-pen-200-e58de5584625c70d'
]);
const LEDGER=Object.freeze({
 schemaVersion:'1.0.0',
 expectedNotes:556,
 expectedResources:1326,
 dispositionCounts:Object.freeze({'pending-review':552,modeled:4,superseded:0,rejected:0,'private-reference-only':0}),
 modeledSourceRefs:MODELED_SOURCE_REFS
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
 })
]);
function clean(value){return String(value==null?'':value).trim();}
function sourceForRef(ref){ref=clean(ref);return SOURCE_INVENTORY.find(source=>ref.startsWith(source.id+'-'))||null;}
function atomizeMetadata(raw){
 raw=raw&&typeof raw==='object'?raw:{};
 const noteId=clean(raw.note_id||raw.noteId),sourceId=clean(raw.source_id||raw.sourceId),title=clean(raw.title),tags=Array.isArray(raw.tags)?raw.tags.map(clean).filter(Boolean):[];
 const source=sourceForRef(noteId);
 if(!noteId||!sourceId||!source||source.id!==sourceId)return null;
 return Object.freeze({noteId,sourceId,titleHint:title.slice(0,160),tags:Object.freeze(tags.slice(0,64)),resourceCount:Number(raw.resource_count||raw.resourceCount||0)||0,contentSha256:clean(raw.content_sha256||raw.contentSha256),integrationStatus:'pending-review',disposition:null,candidateKinds:Object.freeze([]),candidateToolBindings:Object.freeze([]),candidatePathBindings:Object.freeze([])});
}
function totals(){return SOURCE_INVENTORY.reduce((acc,source)=>({notes:acc.notes+source.noteCount,resources:acc.resources+source.resourceCount}),{notes:0,resources:0});}
function publicNotesForTool(toolId){const t=clean(toolId).toLowerCase();return PUBLIC_FIELD_NOTES.filter(note=>note.toolIds.some(tool=>String(tool).toLowerCase()===t));}
function publicNotesForPath(pathId){const p=clean(pathId);return PUBLIC_FIELD_NOTES.filter(note=>note.pathIds.includes(p));}
function dispositionTotal(){return Object.values(LEDGER.dispositionCounts).reduce((sum,count)=>sum+Number(count||0),0);}
function validate(){
 const failures=[],sum=totals(),seen=new Set();
 if(sum.notes!==LEDGER.expectedNotes)failures.push('source inventory note total does not match ledger');
 if(sum.resources!==LEDGER.expectedResources)failures.push('source inventory resource total does not match ledger');
 if(dispositionTotal()!==LEDGER.expectedNotes)failures.push('disposition counts do not account for every staged note');
 if(LEDGER.dispositionCounts.modeled!==MODELED_SOURCE_REFS.length)failures.push('modeled disposition count does not match modeled source references');
 for(const ref of MODELED_SOURCE_REFS){if(!/^(?:htb-penetration-tester|offsec-pen-200)-[0-9a-f]{16}$/.test(ref))failures.push('invalid opaque source ref '+ref);if(!sourceForRef(ref))failures.push('unknown modeled source ref '+ref);}
 for(const note of PUBLIC_FIELD_NOTES){
  if(seen.has(note.id))failures.push('duplicate public field note '+note.id);seen.add(note.id);
  if(!ATOM_KINDS.includes(note.kind))failures.push('invalid public field-note kind '+note.id);
  if(!note.sourceRefs.length)failures.push('public field note missing private-ledger lineage '+note.id);
  for(const ref of note.sourceRefs)if(!MODELED_SOURCE_REFS.includes(ref))failures.push('public field note references non-modeled source '+ref);
  const publicText=[note.title,note.body,...note.sourceRefs].join(' ');
  if(/sources\/raw\/|\.enex\b|<en-note|<resource/i.test(publicText))failures.push('public field note leaks raw private-source material '+note.id);
 }
 return failures;
}
root.OBOL_NOTE_INTEGRATION=Object.freeze({schemaVersion:'1.0.0',privateRepo:PRIVATE_REPO,sourceInventory:SOURCE_INVENTORY,dispositions:DISPOSITIONS,atomKinds:ATOM_KINDS,ledger:LEDGER,publicFieldNotes:PUBLIC_FIELD_NOTES,atomizeMetadata,sourceForRef,publicNotesForTool,publicNotesForPath,totals,validate});
})(typeof window!=='undefined'?window:globalThis);
