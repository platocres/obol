'use strict';
(function(root){
function clone(value){
 if(Array.isArray(value))return value.slice();
 if(value&&typeof value==='object')return Object.assign({},value);
 return value;
}
function repairQueue(){
 const q=root.OBOL_PRODUCT_HARDENING;
 if(!q||typeof q!=='object')return false;
 if(Object.isFrozen(q)||Object.isFrozen(q.nextNotesBatch))root.OBOL_PRODUCT_HARDENING=Object.assign({},q,{nextNotesBatch:clone(q.nextNotesBatch)});
 return true;
}
function repairIntake(){
 const intake=root.OBOL_INTAKE_V21;
 if(!intake||typeof intake!=='object')return false;
 if(Object.isFrozen(intake))root.OBOL_INTAKE_V21=Object.assign({},intake);
 return true;
}
function run(){return repairQueue()&&repairIntake();}
const ok=run();
if(typeof window!=='undefined'&&typeof window.setTimeout==='function'){
 [0,25,75,150,300,600].forEach(delay=>window.setTimeout(run,delay));
}
root.OBOL_SHELL_PAYLOAD_TRANSFER_QUEUE_MUTABLE_V986=Object.freeze({wave:'v9.86-shells-payloads-queue-intake-mutable',status:ok?'live-integrated':'partial'});
})(typeof window!=='undefined'?window:globalThis);
