'use strict';
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const entrypoints=['index.html','product-hardening.html'];
const attrRe=/(?:src|href)="([^"]+)"/g;
let failures=[];
for(const entry of entrypoints){
 const full=path.join(root,entry);if(!fs.existsSync(full)){failures.push(entry+' missing');continue;}
 const html=fs.readFileSync(full,'utf8');let m;
 while((m=attrRe.exec(html))){const ref=m[1];if(ref.startsWith('http')||ref.startsWith('#')||ref.startsWith('mailto:'))continue;const clean=ref.split('#')[0].split('?')[0];if(!clean||clean==='index.html')continue;const p=path.join(root,clean);if(!fs.existsSync(p))failures.push(entry+' references missing asset '+ref);}
}
if(failures.length){console.error(failures.join('\n'));process.exit(1);}console.log('Asset references valid for '+entrypoints.join(', '));
