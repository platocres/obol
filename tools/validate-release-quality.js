'use strict';

const cp=require('child_process');
const path=require('path');

const root=path.join(__dirname,'..');
const syncTool=path.join(root,'tools','sync-readme-build-next.js');
const r=cp.spawnSync(process.execPath,[syncTool,'--print'],{cwd:root,encoding:'utf8'});
if(r.error)throw r.error;
if(r.status!==0){
  process.stderr.write(r.stderr||r.stdout||'Unable to render Build Next state.\n');
  process.exit(r.status||1);
}

const out=String(r.stdout||'');
const m=out.match(/\*\*Current live queue:\*\*\s+(\d+) items\s+—\s+(\d+) implemented-quality repairs,\s+(\d+) mapped-delivery repairs,\s+(\d+) canonical gaps\./);
if(!m){
  console.error('Release quality gate could not parse the live Build Next queue.');
  process.exit(1);
}

const state={
  total:Number(m[1]),
  implementedQuality:Number(m[2]),
  mappedDelivery:Number(m[3]),
  canonicalGaps:Number(m[4])
};

if(state.implementedQuality!==0||state.mappedDelivery!==0){
  console.error('Release quality gate failed. Higher-priority delivery debt must be cleared before merge.');
  console.error(`- implemented-quality repairs: ${state.implementedQuality}`);
  console.error(`- mapped-delivery repairs: ${state.mappedDelivery}`);
  console.error(`- canonical gaps: ${state.canonicalGaps}`);
  process.exit(1);
}

console.log(`Release quality gate passed: 0 implemented-quality repairs, 0 mapped-delivery repairs, ${state.canonicalGaps} canonical gaps.`);
