'use strict';
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/note-integration.js','data/note-integration-reviews.js','data/product-hardening/note-progress-current.js','data/product-hardening/notes-impact-current.js'])vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),sandbox,{filename:rel});
const impact=sandbox.window.OBOL_PRODUCT_HARDENING_NOTES_IMPACT;
if(!impact){console.error('Notes impact projection did not load.');process.exit(1);}
const failures=Array.from(impact.validate());
if(impact.review.total!==556)failures.push('notes impact total must remain 556');
if(impact.review.reviewed!==55)failures.push('v9.29 must project the current 55 reviewed notes');
if(impact.review.modeled!==43||impact.review.privateOnly!==12||impact.review.pending!==501)failures.push('notes impact funnel drifted from the current ledger');
if(impact.outputCounts.fieldNotes!==24)failures.push('notes impact must project all 24 public Field Notes');
if(!impact.themes.some(theme=>theme.name==='File inclusion'&&theme.evidenceImpact&&theme.reportImpact))failures.push('file-inclusion theme must expose Evidence and report impact');
if(!impact.themes.some(theme=>theme.name==='File upload'&&theme.pathImpact&&theme.evidenceImpact&&theme.reportImpact))failures.push('file-upload theme must expose Path, Evidence, and report impact');
if(!impact.latestWave||impact.latestWave.id!=='v9.28-wave-3')failures.push('latest wave must identify v9.28-wave-3');
if(failures.length){console.error('Notes impact validation failed:');for(const failure of failures)console.error('- '+failure);process.exit(1);}
console.log('Notes impact projection validated.');
