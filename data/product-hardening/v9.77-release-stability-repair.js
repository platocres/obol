'use strict';
(function(root){
const CARD_ID='web-upload-inclusion-proof-chain';
function list(v){return Array.isArray(v)?v:[];}
function freeze(v){return Object.freeze(v);}
function lanes(){return Array.isArray(root.OBOL_LANES)?root.OBOL_LANES:Array.isArray(root.LANES)?root.LANES:[];}
function cardById(id){
 if(!id)return null;
 if(typeof root.liveCardById==='function'){
  try{const card=root.liveCardById(id);if(card)return card;}catch(_){}
 }
 if(root.CARDS&&root.CARDS[id])return root.CARDS[id];
 for(const lane of lanes())for(const card of list(lane&&lane.cards))if(card&&card.id===id)return card;
 return null;
}
function ensureLane(){
 if(!Array.isArray(root.OBOL_LANES)&&!Array.isArray(root.LANES))root.OBOL_LANES=[];
 let lane=lanes().find(row=>row&&(row.id==='web-file-handling'||row.lane==='web-file-handling'));
 if(!lane){
  lane={id:'web-file-handling',lane:'web-file-handling',title:'Web File Handling',group:'Initial Access & Web',cards:[]};
  if(Array.isArray(root.OBOL_LANES))root.OBOL_LANES.push(lane);
  else if(Array.isArray(root.LANES))root.LANES.push(lane);
 }
 if(!Array.isArray(lane.cards))lane.cards=[];
 return lane;
}
function upsertCard(card){
 const lane=ensureLane();
 const index=lane.cards.findIndex(row=>row&&row.id===card.id);
 if(index>=0)lane.cards.splice(index,1,card);else lane.cards.push(card);
 root.CARDS=root.CARDS&&typeof root.CARDS==='object'?root.CARDS:{};
 try{root.CARDS[card.id]=card;}catch(_){}
 return card;
}
const fallbackCommands=freeze([
 freeze({
  tool:'curl',
  run:'curl -i -s -k -F "file=@{{benign_canary_file}}" "{{upload_url}}"',
  when:'After identifying an authorized upload endpoint and preparing a harmless canary file.',
  evidence:freeze(['upload request and HTTP response','stored filename or rejection reason','negative-control comparison']),
  note:'Proves only request control, acceptance, and response handling. It does not prove execution.'
 }),
 freeze({
  tool:'curl',
  run:'curl -i -s -k "{{stored_or_include_url}}"',
  when:'After upload acceptance or an include-source hypothesis exists.',
  evidence:freeze(['status code and headers','body behavior or transformed source','file-read versus execution boundary']),
  note:'Replay the stored or included resource before reporting impact.'
 }),
 freeze({
  tool:'ffuf',
  run:'ffuf -u "{{url}}?{{parameter}}=FUZZ" -w {{wordlist}} -mc all -fs {{baseline_size}}',
  when:'After a parameter or include-source candidate and a baseline response size are known.',
  evidence:freeze(['baseline response size','candidate response delta','manual replay of an interesting hit']),
  note:'Treat fuzzing hits as triage until replayed against a baseline and negative control.'
 })
]);
function normalizeCommand(command,index){
 const fallback=fallbackCommands[index%fallbackCommands.length];
 const run=String(command&&command.run||fallback.run||'').trim();
 const tool=String(command&&command.tool||fallback.tool||'operator').trim();
 const note=String(command&&command.note||fallback.note||'Capture the proof boundary before moving the path forward.').trim();
 const when=String(command&&command.when||fallback.when||note).trim();
 const evidence=list(command&&command.evidence).length?list(command.evidence).map(String):list(fallback.evidence);
 return freeze(Object.assign({},command||{}, {tool,run,when,evidence:freeze(evidence),note}));
}
function repair(){
 const existing=cardById(CARD_ID)||{};
 const byRun=new Map();
 const source=list(existing.commands).length?list(existing.commands):fallbackCommands;
 source.concat(fallbackCommands).forEach((command,index)=>{
  const normalized=normalizeCommand(command,index);
  if(normalized.run)byRun.set(normalized.run,normalized);
 });
 const repaired=freeze(Object.assign({},existing,{
  id:CARD_ID,
  lane:existing.lane||'web-file-handling',
  title:existing.title||'Upload and Inclusion Proof Chain',
  hypothesis:existing.hypothesis||'Use this when upload, file-read, wrapper, remote-include, or web-shell evidence appears. Prove control, acceptance, storage, retrieval, interpretation, downstream effect, and cleanup as separate facts.',
  commands:freeze(Array.from(byRun.values())),
  tools:freeze(Array.from(new Set(list(existing.tools).concat(['curl','ffuf','Burp Intruder'])))),
  expected:freeze(Array.from(new Set(list(existing.expected).concat(['benign canary or baseline recorded','stored name or include source captured','response headers and body behavior reviewed','file read or execution boundary selected','negative control compared','cleanup state recorded'])))),
  produces:freeze(Array.from(new Set(list(existing.produces).concat(['web.file_handling.impact_ladder_reviewed','web.file_handling.control_pair_reviewed','web.file_handling.report_boundary_selected'])))),
  actionSpineRepaired77:true
 }));
 upsertCard(repaired);
 return repaired;
}
function validate(){
 const card=repair();
 const failures=[];
 if(!cardById(CARD_ID))failures.push('missing web-upload-inclusion proof-chain card');
 list(card.commands).forEach((command,index)=>{
  if(!command.tool||!command.run||!command.when||!list(command.evidence).length)failures.push('command '+index+' missing tool/run/when/evidence');
 });
 return freeze(failures);
}
function integrate(){
 const card=repair();
 const failures=validate();
 const api=freeze({id:'v9.77-release-stability-repair',cardId:CARD_ID,status:failures.length?'partial':'live-integrated',failures,card,integrate,validate});
 root.OBOL_V977_RELEASE_STABILITY_REPAIR=api;
 return api;
}
const first=integrate();
if(typeof root.setTimeout==='function'){
 let tries=0;
 const attempt=()=>{tries+=1;const result=integrate();if(result.status!=='live-integrated'&&tries<60)root.setTimeout(attempt,50);};
 if(first.status!=='live-integrated')root.setTimeout(attempt,0);
 if(typeof root.addEventListener==='function'){
  root.addEventListener('hashchange',attempt);
  root.addEventListener('focus',attempt);
 }
}
if(typeof module!=='undefined'&&module.exports)module.exports=root.OBOL_V977_RELEASE_STABILITY_REPAIR;
})(typeof window!=='undefined'?window:globalThis);
