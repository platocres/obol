'use strict';
(function(root){
const q=root.OBOL_PRODUCT_HARDENING,notes=root.OBOL_NOTE_INTEGRATION;
if(!q||!notes||!notes.ledger)return;
const track=(q.tracks||[]).find(entry=>entry.id==='notes-integration');
if(track)track.complete=Number(notes.ledger.reviewedCount||0);
root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS=Object.freeze({schemaVersion:'1.0.0',reviewed:Number(notes.ledger.reviewedCount||0),total:Number(notes.ledger.expectedNotes||0)});
})(typeof window!=='undefined'?window:globalThis);
