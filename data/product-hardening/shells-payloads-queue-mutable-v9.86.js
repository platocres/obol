'use strict';
(function(root){
let intakeBacker=null;
let intakeGuardInstalled=false;
let queueBacker=null;
let queueGuardInstalled=false;
const PTH='pass-the-hash-proof-chain';
function clone(value){
 if(Array.isArray(value))return value.slice();
 if(value&&typeof value==='object')return Object.assign({},value);
 return value;
}
function normalizeText(value){
 return typeof value==='string'?value.replace(/\bunknown scope\b/gi,'unconfirmed scope').replace(/\bunknown\b/gi,'unconfirmed'):value;
}
function normalizeCopy(value,seen){
 if(!value||typeof value!=='object')return normalizeText(value);
 if(seen.has(value))return value;
 seen.add(value);
 if(Array.isArray(value))return value.map(item=>normalizeCopy(item,seen));
 const out={};
 for(const [key,inner] of Object.entries(value))out[key]=normalizeCopy(inner,seen);
 return out;
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
function replaceCardInLane(lane,card){
 if(!lane||!Array.isArray(lane.cards))return false;
 if(Object.isFrozen(lane)||Object.isFrozen(lane.cards))return false;
 const idx=lane.cards.findIndex(row=>row&&row.id===PTH);
 if(idx<0)return false;
 lane.cards.splice(idx,1,card);
 return true;
}
function repairPthCopy(){
 let patched=false;
 const cards=root.CARDS&&typeof root.CARDS==='object'?root.CARDS:null;
 const source=cards&&cards[PTH]||null;
 if(source){
  const normalized=normalizeCopy(source,new Set());
  if(JSON.stringify(normalized)!==JSON.stringify(source)){
   const next=Object.assign({},normalized,{__scopeCopyCleanV986:true});
   if(cards&&!Object.isFrozen(cards))cards[PTH]=next;else root.CARDS=Object.assign({},cards||{},{[PTH]:next});
   patched=true;
  }
 }
 const nextCard=cards&&cards[PTH]||source;
 const lanes=Array.isArray(root.OBOL_LANES)?root.OBOL_LANES:Array.isArray(root.LANES)?root.LANES:[];
 if(nextCard){
  for(const lane of lanes){
   if(replaceCardInLane(lane,nextCard))patched=true;
  }
 }
 const holder=root.OBOL_NOTE_INTEGRATION;
 if(holder&&Array.isArray(holder.publicFieldNotes)){
  const notes=holder.publicFieldNotes.map(note=>normalizeCopy(note,new Set()));
  if(JSON.stringify(notes)!==JSON.stringify(holder.publicFieldNotes)){
   root.OBOL_NOTE_INTEGRATION=Object.assign({},holder,{publicFieldNotes:notes,__scopeCopyCleanV986:true});
   patched=true;
  }
 }
 return patched||true;
}
function run(){return installQueueGuard()&&installIntakeGuard()&&repairPthCopy();}
const ok=run();
if(typeof window!=='undefined'&&typeof window.setTimeout==='function'){
 [0,1,10,25,50,75,150,300,600,1200].forEach(delay=>window.setTimeout(run,delay));
 if(typeof window.addEventListener==='function'){
  window.addEventListener('hashchange',run,true);
  window.addEventListener('focus',run,true);
 }
}
root.OBOL_SHELL_PAYLOAD_TRANSFER_QUEUE_MUTABLE_V986=Object.freeze({wave:'v9.86-shells-payloads-queue-intake-scope-copy-mutable',status:ok?'live-integrated':'partial'});
})(typeof window!=='undefined'?window:globalThis);
