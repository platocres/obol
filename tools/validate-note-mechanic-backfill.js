'use strict';
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/note-integration.js','data/note-integration-reviews.js','data/note-integration-packets.js','data/product-hardening/note-mechanic-backfill-v9.38.js'])vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),sandbox,{filename:rel});
const notes=sandbox.window.OBOL_NOTE_INTEGRATION;
const backfill=sandbox.window.OBOL_NOTE_MECHANIC_BACKFILL_V938;
const failures=[];
if(!notes)failures.push('note integration did not load');
if(!backfill)failures.push('v9.38 mechanic backfill did not load');
if(notes&&backfill)failures.push(...backfill.validate(notes));
if(backfill){
 const summary=backfill.summarize();
 if(summary.targetReviewed!==127)failures.push('backfill target must remain all 127 previously reviewed notes');
 if(summary.audited!==14)failures.push('v9.38 first backfill pass must audit all fourteen v9.28 wave-3 rows');
 if(summary.mechanic!==1)failures.push('v9.38 first backfill pass must convert exactly one missed mechanic');
 if(summary.guidanceOnly!==10)failures.push('v9.38 first backfill pass must explicitly justify ten modeled guidance-only rows');
 if(summary.retainPrivate!==3)failures.push('v9.38 first backfill pass must re-affirm three private-only rows');
 if(summary.remaining!==113)failures.push('backfill remaining count must be 113 after the first pass');
 const mechanic=backfill.rows.find(row=>row.noteId==='htb-penetration-tester-c234c00d18a235f3');
 if(!mechanic||mechanic.decision!=='mechanic')failures.push('file-inclusion signal-first note must be converted to a mechanic');
 if(!mechanic||!mechanic.productChanges.some(change=>change.type==='tool-builder-change'&&change.proofRefs.includes('assets/tool-builder-current.js')))failures.push('signal-first mechanic must prove the Tool Builder change');
}
if(failures.length){console.error('Note mechanic backfill validation failed:');for(const failure of failures)console.error('- '+failure);process.exit(1);}
const summary=backfill.summarize();
console.log('v9.38 note mechanic backfill validated:',summary.audited+'/'+summary.targetReviewed,'audited;',summary.mechanic,'mechanic;',summary.guidanceOnly,'guidance-only;',summary.retainPrivate,'private-only retained; '+summary.remaining+' remaining.');
