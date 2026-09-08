'use strict';
(function(root){
const IDS=['pass-the-hash-proof-chain','pth-remote-exec-artifacts','pth-token-filtering-check'];
const BAD=/fills an unresolved methodology gap|methodology gap|UNKNOWN|source-mining|source re-mining|release cleanup|patch panel|stabilizer/i;
const KEY_BAD=/^(source|sourceMined|latestPartialRemine|remine|provenance)/i;
function lanes(){return Array.isArray(root.OBOL_LANES)?root.OBOL_LANES:Array.isArray(root.LANES)?root.LANES:[];}
function cardById(id){if(root.CARDS&&root.CARDS[id])return root.CARDS[id];for(const lane of lanes())for(const card of lane.cards||[])if(card&&card.id===id)return card;return null;}
function dirty(value){return BAD.test(JSON.stringify(value));}
function cleanValue(value){
 if(Array.isArray(value))return Object.freeze(value.map(cleanValue).filter(item=>item!==undefined&&!dirty(item)));
 if(value&&typeof value==='object'){
  const out={};
  for(const [key,inner] of Object.entries(value)){
   if(KEY_BAD.test(key)||BAD.test(String(key)))continue;
   const cleaned=cleanValue(inner);
   if(cleaned===undefined)continue;
   if(dirty(cleaned))continue;
   out[key]=cleaned;
  }
  return Object.freeze(out);
 }
 if(typeof value==='string')return BAD.test(value)?undefined:value;
 return value;
}
function publish(card){
 if(!card||!card.id)return false;
 const cleaned=cleanValue(card);
 if(root.CARDS&&typeof root.CARDS==='object')root.CARDS[card.id]=cleaned;
 for(const lane of lanes()){
  if(!Array.isArray(lane.cards))continue;
  const idx=lane.cards.findIndex(entry=>entry&&entry.id===card.id);
  if(idx>=0)lane.cards.splice(idx,1,cleaned);
 }
 return !dirty(cleaned);
}
function run(){
 const results=IDS.map(id=>publish(cardById(id)));
 root.OBOL_PTH_REMOTE_EXEC_CARD_PROVENANCE_V985=Object.freeze({wave:'v9.85-pass-the-hash-card-cleanup',status:results.every(Boolean)?'live-integrated':'partial',cardIds:Object.freeze(IDS.slice()),results:Object.freeze(results)});
 return root.OBOL_PTH_REMOTE_EXEC_CARD_PROVENANCE_V985;
}
const first=run();
if(typeof window!=='undefined'){
 let tries=0;
 const schedule=typeof window.setTimeout==='function'?window.setTimeout.bind(window):null;
 const attempt=function(){const result=run();tries+=1;if(result.status!=='live-integrated'&&tries<160&&schedule)schedule(attempt,50);};
 if(first.status!=='live-integrated'&&schedule)schedule(attempt,0);
 if(typeof window.addEventListener==='function'){window.addEventListener('hashchange',attempt);window.addEventListener('focus',attempt);}
}
if(typeof module!=='undefined'&&module.exports)module.exports={run};
})(typeof window!=='undefined'?window:globalThis);
