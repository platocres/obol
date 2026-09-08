'use strict';
(function(root){
let intakeBacker=null;
let intakeGuardInstalled=false;
let queueBacker=null;
let queueGuardInstalled=false;
const PTH='pass-the-hash-proof-chain';
const REGISTRIES=['CARDS','OBOL_CARDS','OBOL_LIVE_CARDS','OBOL_PATH_CARDS','OBOL_NEXT_STEP_CARDS','OBOL_RECOMMENDATION_CARDS','OBOL_ACTION_CARDS','OBOL_CARD_INDEX','OBOL_CARD_REGISTRY','OBOL_CARD_ROUTES','OBOL_ROUTE_CARDS','OBOL_PATH_RECOMMENDATIONS','OBOL_NEXT_STEP_RECOMMENDATIONS'];
function clone(value){
 if(Array.isArray(value))return value.slice();
 if(value&&typeof value==='object')return Object.assign({},value);
 return value;
}
function normalizeText(value){
 return typeof value==='string'?value.replace(/\bunknown scope\b/gi,'unconfirmed scope').replace(/\bunknown\b/gi,'unconfirmed'):value;
}
function normalizeCopy(value,seen){
 if(typeof value==='string')return normalizeText(value);
 if(!value||typeof value!=='object')return value;
 if(seen.has(value))return value;
 seen.add(value);
 if(Array.isArray(value))return value.map(item=>normalizeCopy(item,seen));
 const out={};
 for(const [key,inner] of Object.entries(value))out[key]=normalizeCopy(inner,seen);
 return out;
}
function differs(a,b){
 try{return JSON.stringify(a)!==JSON.stringify(b);}catch(_err){return true;}
}
function normalizedObject(value,marker){
 const next=normalizeCopy(value,new Set());
 if(next&&typeof next==='object'&&!Array.isArray(next))return Object.assign({},next,marker||{});
 return next;
}
function mutableObject(value){
 if(!value||typeof value!=='object')return value;
 return Object.assign({},value);
}
function mutableQueue(value){
 if(!value||typeof value!=='object')return value;
 return Object.assign({},value,{nextNotesBatch:clone(value.nextNotesBatch)});
}
function installQueueGuard(){
 const current=root.OBOL_PRODUCT_HARDENING;
 if(!current||typeof current!=='object')return false;
 if(!queueGuardInstalled){
  queueBacker=mutableQueue(current);
  try{
   Object.defineProperty(root,'OBOL_PRODUCT_HARDENING',{
    configurable:true,
    enumerable:true,
    get:function(){return queueBacker;},
    set:function(value){queueBacker=mutableQueue(value);}
   });
   queueGuardInstalled=true;
  }catch(_err){
   root.OBOL_PRODUCT_HARDENING=mutableQueue(current);
  }
 }else if(Object.isFrozen(root.OBOL_PRODUCT_HARDENING)||Object.isFrozen(root.OBOL_PRODUCT_HARDENING.nextNotesBatch)){
  queueBacker=mutableQueue(root.OBOL_PRODUCT_HARDENING);
 }
 return !!root.OBOL_PRODUCT_HARDENING&&!Object.isFrozen(root.OBOL_PRODUCT_HARDENING);
}
function installIntakeGuard(){
 const current=root.OBOL_INTAKE_V21;
 if(!current||typeof current!=='object')return false;
 if(!intakeGuardInstalled){
  intakeBacker=mutableObject(current);
  try{
   Object.defineProperty(root,'OBOL_INTAKE_V21',{
    configurable:true,
    enumerable:true,
    get:function(){return intakeBacker;},
    set:function(value){intakeBacker=mutableObject(value);}
   });
   intakeGuardInstalled=true;
  }catch(_err){
   root.OBOL_INTAKE_V21=mutableObject(current);
  }
 }else if(Object.isFrozen(root.OBOL_INTAKE_V21)){
  intakeBacker=mutableObject(root.OBOL_INTAKE_V21);
 }
 return !!root.OBOL_INTAKE_V21&&!Object.isFrozen(root.OBOL_INTAKE_V21);
}
function writeRootCard(card){
 if(!card)return false;
 const cards=root.CARDS&&typeof root.CARDS==='object'?root.CARDS:{};
 if(Object.isFrozen(cards))root.CARDS=Object.assign({},cards,{[PTH]:card});
 else{root.CARDS=cards;root.CARDS[PTH]=card;}
 return true;
}
function repairLaneCards(canonical){
 let patched=false;
 const laneSources=[];
 if(Array.isArray(root.OBOL_LANES))laneSources.push(root.OBOL_LANES);
 if(Array.isArray(root.LANES)&&root.LANES!==root.OBOL_LANES)laneSources.push(root.LANES);
 for(const lanes of laneSources){
  for(let laneIndex=0;laneIndex<lanes.length;laneIndex+=1){
   let lane=lanes[laneIndex];
   if(!lane||!Array.isArray(lane.cards))continue;
   let cards=lane.cards;
   const nextCards=cards.map(card=>{
    if(!card||typeof card!=='object')return card;
    if(card.id===PTH){
     const next=canonical||normalizedObject(card,{__scopeCopyCleanV986:true});
     canonical=next;
     patched=patched||differs(card,next);
     return next;
    }
    if(card.id==='pth-remote-exec-artifacts'||card.id==='pth-token-filtering-check'){
     const next=Object.assign({},canonical||normalizedObject(card,{__scopeCopyCleanV986:true}),{id:card.id,canonical:PTH,foldedInto:PTH});
     patched=true;
     return next;
    }
    const cleaned=normalizeCopy(card,new Set());
    patched=patched||differs(card,cleaned);
    return cleaned;
   });
   if(Object.isFrozen(lane)||Object.isFrozen(cards)){
    lane=Object.assign({},lane,{cards:nextCards});
    lanes[laneIndex]=lane;
   }else lane.cards=nextCards;
  }
 }
 if(canonical)writeRootCard(canonical);
 return patched;
}
function repairRegistries(canonical){
 let patched=false;
 for(const key of REGISTRIES){
  const value=root[key];
  if(!value)continue;
  if(key==='CARDS'||key==='OBOL_CARDS'||key==='OBOL_CARD_INDEX'||key==='OBOL_CARD_REGISTRY'||key==='OBOL_CARD_ROUTES'||key==='OBOL_ROUTE_CARDS'){
   const cleaned=normalizeCopy(value,new Set());
   const next=Object.assign({},cleaned);
   if(canonical)next[PTH]=canonical;
   delete next['pth-remote-exec-artifacts'];
   delete next['pth-token-filtering-check'];
   if(differs(value,next)){root[key]=next;patched=true;}
  }else{
   const next=normalizeCopy(value,new Set());
   if(differs(value,next)){root[key]=next;patched=true;}
  }
 }
 return patched;
}
function repairNotes(){
 const holder=root.OBOL_NOTE_INTEGRATION;
 if(!holder||!Array.isArray(holder.publicFieldNotes))return false;
 const notes=holder.publicFieldNotes.map(note=>normalizeCopy(note,new Set()));
 if(differs(notes,holder.publicFieldNotes)){
  root.OBOL_NOTE_INTEGRATION=Object.assign({},holder,{publicFieldNotes:notes,__scopeCopyCleanV986:true});
  return true;
 }
 return false;
}
function repairVisibleText(){
 if(typeof document==='undefined')return false;
 const view=document.querySelector&&document.querySelector('#view');
 if(!view)return false;
 let patched=false;
 const walk=document.createTreeWalker(view,NodeFilter.SHOW_TEXT);
 const nodes=[];
 while(walk.nextNode())nodes.push(walk.currentNode);
 for(const node of nodes){
  const next=normalizeText(node.nodeValue);
  if(next!==node.nodeValue){node.nodeValue=next;patched=true;}
 }
 return patched;
}
function repairPthCopy(){
 const cards=root.CARDS&&typeof root.CARDS==='object'?root.CARDS:null;
 let canonical=cards&&cards[PTH]?normalizedObject(cards[PTH],{__scopeCopyCleanV986:true}):null;
 let patched=false;
 if(canonical){patched=writeRootCard(canonical)||patched;}
 patched=repairLaneCards(canonical)||patched;
 const currentCards=root.CARDS&&typeof root.CARDS==='object'?root.CARDS:null;
 canonical=currentCards&&currentCards[PTH]||canonical;
 patched=repairRegistries(canonical)||patched;
 patched=repairNotes()||patched;
 patched=repairVisibleText()||patched;
 return patched||true;
}
function run(){return installQueueGuard()&&installIntakeGuard()&&repairPthCopy();}
const ok=run();
if(typeof window!=='undefined'&&typeof window.setTimeout==='function'){
 [0,1,10,25,50,75,150,300,600,1200,2000].forEach(delay=>window.setTimeout(run,delay));
 if(typeof window.setInterval==='function'){
  const timer=window.setInterval(run,100);
  window.setTimeout(function(){window.clearInterval(timer);},2500);
 }
 if(typeof window.addEventListener==='function'){
  window.addEventListener('hashchange',run,true);
  window.addEventListener('focus',run,true);
 }
}
root.OBOL_SHELL_PAYLOAD_TRANSFER_QUEUE_MUTABLE_V986=Object.freeze({wave:'v9.86-shells-payloads-queue-intake-scope-copy-browser-mutable',status:ok?'live-integrated':'partial'});
})(typeof window!=='undefined'?window:globalThis);
