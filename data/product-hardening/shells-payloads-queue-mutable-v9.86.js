'use strict';
(function(root){
function clone(value){
 if(Array.isArray(value))return value.slice();
 if(value&&typeof value==='object')return Object.assign({},value);
 return value;
}
function run(){
 const q=root.OBOL_PRODUCT_HARDENING;
 if(!q||typeof q!=='object')return false;
 if(Object.isFrozen(q)||Object.isFrozen(q.nextNotesBatch)){
  root.OBOL_PRODUCT_HARDENING=Object.assign({},q,{nextNotesBatch:clone(q.nextNotesBatch)});
  return true;
 }
 return true;
}
const ok=run();
root.OBOL_SHELL_PAYLOAD_TRANSFER_QUEUE_MUTABLE_V986=Object.freeze({wave:'v9.86-shells-payloads-queue-mutable',status:ok?'live-integrated':'partial'});
})(typeof window!=='undefined'?window:globalThis);
