'use strict';
(function(root){
const q=root.OBOL_PRODUCT_HARDENING,notes=root.OBOL_NOTE_INTEGRATION;
if(!q||!notes||!notes.ledger)return;
const track=(q.tracks||[]).find(entry=>entry.id==='notes-integration');
if(track)track.complete=Number(notes.ledger.reviewedCount||0);
const packetItemMap={'web-upload-inclusion':'notes-packet-web-upload-inclusion','xss-session':'notes-packet-xss-session','credentials-auth':'notes-packet-credentials-auth','windows-privesc':'notes-packet-windows-privesc'};
for(const [packetId,itemId] of Object.entries(packetItemMap)){
 const packet=notes.packetReviews&&notes.packetReviews[packetId];
 const item=(q.items||[]).find(entry=>entry.id===itemId);
 if(packet&&packet.status==='complete'&&item)item.status='complete';
}
root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS=Object.freeze({schemaVersion:'1.3.0',reviewed:Number(notes.ledger.reviewedCount||0),total:Number(notes.ledger.expectedNotes||0),completedPackets:Object.freeze(Object.keys(packetItemMap).filter(id=>notes.packetReviews&&notes.packetReviews[id]&&notes.packetReviews[id].status==='complete'))});
})(typeof window!=='undefined'?window:globalThis);
