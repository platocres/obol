'use strict';
(function(root){
let intakeBacker=null;
let intakeGuardInstalled=false;
let queueBacker=null;
let queueGuardInstalled=false;
function clone(value){
 if(Array.isArray(value))return value.slice();
 if(value&&typeof value==='object')return Object.assign({},value);
 return value;
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
function run(){return installQueueGuard()&&installIntakeGuard();}
const ok=run();
if(typeof window!=='undefined'&&typeof window.setTimeout==='function'){
 [0,1,10,25,50,75,150,300,600,1200].forEach(delay=>window.setTimeout(run,delay));
 if(typeof window.addEventListener==='function'){
  window.addEventListener('hashchange',run,true);
  window.addEventListener('focus',run,true);
 }
}
root.OBOL_SHELL_PAYLOAD_TRANSFER_QUEUE_MUTABLE_V986=Object.freeze({wave:'v9.86-shells-payloads-queue-intake-mutable',status:ok?'live-integrated':'partial'});
})(typeof window!=='undefined'?window:globalThis);
