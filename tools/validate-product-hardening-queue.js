'use strict';
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
const file=path.join(root,'data','product-hardening','product-hardening-queue.js');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});
const q=sandbox.window.OBOL_PRODUCT_HARDENING;
function fail(msg){console.error('product-hardening validation failed: '+msg);process.exit(1);}
if(!q)fail('queue object missing');
if(q.version!=='9.0.0')fail('unexpected queue version '+q.version);
if(!Array.isArray(q.tracks)||q.tracks.length<8)fail('expected product tracks');
if(!Array.isArray(q.items)||q.items.length<50)fail('expected seeded work ledger');
const ids=new Set();
for(const t of q.tracks){if(!t.id||!t.label||!Number.isFinite(t.total))fail('invalid track '+JSON.stringify(t));ids.add(t.id);}
for(const item of q.items){if(!item.id||!item.track||!item.label||!item.status)fail('invalid item '+JSON.stringify(item));if(!ids.has(item.track))fail('unknown item track '+item.track);if(!['queued','modeled','complete','superseded','rejected'].includes(item.status))fail('bad status '+item.status+' for '+item.id);}
const notes=q.notes&&q.notes.sources||[];const noteTotal=notes.reduce((n,s)=>n+s.notes,0);if(q.notes.privateRepo!=='platocres/obol-source-notes')fail('private notes repo pointer missing');if(noteTotal!==556)fail('expected 556 notes, got '+noteTotal);
const totals=q.totals();if(totals.notes!==556)fail('totals lost note count');if(!q.buildNext(5).length)fail('Build Next empty unexpectedly');
console.log('Product hardening queue valid:',q.items.length,'items across',q.tracks.length,'tracks;',totals.notes,'notes accounted.');
