'use strict';
(function(root){
const PTH='pass-the-hash-proof-chain';
const FOLDED=Object.freeze(['pth-remote-exec-artifacts','pth-token-filtering-check']);
function freeze(list){return Object.freeze((list||[]).slice());}
function frozen(obj){return Object.freeze(obj||{});}
function isFoldedId(value){return FOLDED.includes(String(value||''));}
function isFoldedEntry(entry){return !!(entry&&typeof entry==='object'&&(isFoldedId(entry.id)||isFoldedId(entry.cardId)||isFoldedId(entry.pathId)||isFoldedId(entry.routeId)||isFoldedId(entry.refId)));}
function cleanArray(list,seen){
 for(let i=list.length-1;i>=0;i-=1){
  const item=list[i];
  if(isFoldedEntry(item)){list.splice(i,1);continue;}
  cleanContainer(item,seen);
 }
 return list;
}
function cleanObject(obj,seen){
 for(const id of FOLDED)if(Object.prototype.hasOwnProperty.call(obj,id))delete obj[id];
 for(const [key,value] of Object.entries(obj)){
  if(isFoldedId(key)){delete obj[key];continue;}
  if(isFoldedEntry(value)){delete obj[key];continue;}
  cleanContainer(value,seen);
 }
 return obj;
}
function cleanContainer(value,seen){
 if(!value||typeof value!=='object')return value;
 if(seen.has(value))return value;
 seen.add(value);
 if(Array.isArray(value))return cleanArray(value,seen);
 return cleanObject(value,seen);
}
function lanes(){return Array.isArray(root.OBOL_LANES)?root.OBOL_LANES:Array.isArray(root.LANES)?root.LANES:[];}
function pthCard(){
 if(root.CARDS&&root.CARDS[PTH])return root.CARDS[PTH];
 for(const lane of lanes())for(const card of lane.cards||[])if(card&&card.id===PTH)return card;
 return null;
}
function normalizePthCard(){
 const card=pthCard();
 if(!card)return false;
 const foldedFrom=Array.from(new Set([].concat(card.foldedFrom||[],FOLDED)));
 card.foldedFrom=freeze(foldedFrom);
 card.fieldNoteIds=freeze(Array.from(new Set([].concat(card.fieldNoteIds||[],['note-pth-remote-exec-artifacts-v985','note-pth-token-filtering-failure-v985','note-pth-failure-disposition-v985']))));
 if(root.CARDS&&typeof root.CARDS==='object')root.CARDS[PTH]=card;
 return true;
}
function normalizeNotes(){
 const holder=root.OBOL_NOTE_INTEGRATION;
 if(!holder||!Array.isArray(holder.publicFieldNotes))return false;
 holder.publicFieldNotes=freeze(holder.publicFieldNotes.map(note=>{
  if(!note||!String(note.id||'').includes('-pth-'))return note;
  const next=Object.assign({},note,{cardIds:freeze([PTH]),pathIds:freeze([PTH])});
  return frozen(next);
 }));
 return true;
}
function run(){
 const targets=['CARDS','OBOL_CARDS','OBOL_LANES','LANES','OBOL_LIVE_CARDS','OBOL_PATH_CARDS','OBOL_NEXT_STEP_CARDS','OBOL_RECOMMENDATION_CARDS','OBOL_ACTION_CARDS','OBOL_CARD_INDEX','OBOL_CARD_REGISTRY','OBOL_CARD_ROUTES','OBOL_ROUTE_CARDS','OBOL_PATH_RECOMMENDATIONS','OBOL_NEXT_STEP_RECOMMENDATIONS'];
 const seen=new Set();
 for(const key of targets)if(root[key])cleanContainer(root[key],seen);
 normalizeNotes();
 const pthNormalized=normalizePthCard();
 const aliasesRemoved=FOLDED.every(id=>!(root.CARDS&&root.CARDS[id])&&!lanes().some(lane=>Array.isArray(lane.cards)&&lane.cards.some(card=>card&&card.id===id)));
 root.OBOL_PTH_FOLDED_ALIAS_ROUTE_PURGE_V985=frozen({wave:'v9.85-pass-the-hash-folded-alias-route-purge',status:aliasesRemoved?'live-integrated':'partial',cardId:PTH,foldedAliasIds:FOLDED,pthNormalized,aliasesRemoved});
 return root.OBOL_PTH_FOLDED_ALIAS_ROUTE_PURGE_V985;
}
const first=run();
if(typeof window!=='undefined'){
 const schedule=typeof window.setTimeout==='function'?window.setTimeout.bind(window):null;
 if(schedule){[0,25,75,150,300,600].forEach(delay=>schedule(run,delay));}
 if(typeof window.addEventListener==='function'){
  window.addEventListener('hashchange',function(){run(); if(schedule)schedule(run,0); if(schedule)schedule(run,50);});
  window.addEventListener('focus',function(){run(); if(schedule)schedule(run,50);});
 }
}
if(typeof module!=='undefined'&&module.exports)module.exports={run};
})(typeof window!=='undefined'?window:globalThis);
