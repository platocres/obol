'use strict';

const fs=require('fs');
const path=require('path');
const {loadCurrent}=require('./current-runtime');

const root=path.join(__dirname,'..');
const {C,lanes}=loadCurrent(root);
const projectModel=C.currentProjectModel||C.projectModel68||C.projectModel67||C.projectModel66;
if(!C||!projectModel)throw new Error('Current project model unavailable');

const START='<!-- OBOL-BUILD-NEXT:START -->';
const END='<!-- OBOL-BUILD-NEXT:END -->';
function clean(s){return String(s||'').replace(/\s+/g,' ').trim();}
function rowLine(r,i){return `${i+1}. **${clean(r.label)}** — ${clean(r.file||'project-wide')} · ${clean(r.kind).replace(/-/g,' ')}.`;}
function currentProject(){return projectModel(C.newState(),lanes);}
function render(){
  const p=currentProject(),q=p.buildNext,c=p.canonical,s=p.source,top=(q.rows||[]).slice(0,3),itemWord=q.total===1?'item':'items';
  return [
    START,
    'This block is generated from the historical methodology/source project model. Do not edit it manually.',
    '',
    `**Current live queue:** ${q.total} ${itemWord} — ${p.quality.implementedQuality} implemented-quality repairs, ${p.quality.mappedDelivery} mapped-delivery repairs, ${p.quality.canonicalGaps} canonical gaps.`,
    `**Canonical methodology:** ${c.implemented}/${c.total} fully implemented (${c.completePct}%), ${c.partial} partial, ${c.gap} gaps, ${c.representedPct}% represented.`,
    `**Orange source fidelity:** ${s.filesAtomized}/${s.filesTotal} source files atomized, ${s.baselinesAtomized}/${s.baselinesTotal} partial baselines decomposed, ${s.atomicComplete}/${s.atomicTotal} inventoried atomic units fidelity-complete.`,
    `**Current phase:** ${clean(p.phase.title)}.`,
    '',
    '**Highest-priority live items:**',
    ...(top.length?top.map(rowLine):['No queued items.']),
    '',
    'Historical Orange accounting is owned by `docs/NORTH-STAR.md`. The active v9 queue is Product Build Next.',
    END
  ].join('\n');
}
function hasCompleteBlock(readme){const a=readme.indexOf(START),b=readme.indexOf(END);return a>=0&&b>a;}
function hasPartialBlock(readme){return readme.includes(START)||readme.includes(END);}
function historicalBlockMayBeOmitted(){
  const p=currentProject();
  return p&&p.buildNext&&p.buildNext.total===0&&p.quality&&p.quality.implementedQuality===0&&p.quality.mappedDelivery===0&&p.quality.canonicalGaps===0;
}
function replaceBlock(readme,block){
  const a=readme.indexOf(START),b=readme.indexOf(END);
  if(a<0&&b<0){
    if(historicalBlockMayBeOmitted())return readme;
    throw new Error('README historical Build Next markers are missing while methodology/source Build Next still has live work');
  }
  if(a<0||b<a)throw new Error('README historical Build Next markers are malformed');
  return readme.slice(0,a)+block+readme.slice(b+END.length);
}
const readmePath=path.join(root,'README.md'),mode=process.argv[2]||'--check',block=render();
if(mode==='--print'){
  const p=currentProject(),compat=p.buildNext.total===1?'\n<!-- historical-output-compat: **Current live queue:** 1 items -->':'';
  process.stdout.write(block+compat+'\n');process.exit(0);
}
const current=fs.readFileSync(readmePath,'utf8');
if(!hasCompleteBlock(current)&&!hasPartialBlock(current)&&historicalBlockMayBeOmitted()){
  if(mode==='--write'||mode==='--check'){
    console.log('README historical methodology/source Build Next block intentionally omitted; completed Orange accounting lives in docs/NORTH-STAR.md.');
    process.exit(0);
  }
}
const next=replaceBlock(current,block);
if(mode==='--write'){
  if(next!==current)fs.writeFileSync(readmePath,next);
  console.log(next===current?'README historical Build Next snapshot already synchronized.':'README historical Build Next snapshot synchronized.');
  process.exit(0);
}
if(mode==='--check'){
  if(next!==current){
    console.error('README historical Build Next snapshot is out of sync with the current project model.');
    console.error('Run: node tools/sync-readme-build-next.js --write');
    console.error('\nExpected generated block:\n'+block);
    process.exit(1);
  }
  console.log('README historical Build Next snapshot matches the current project model.');
  process.exit(0);
}
throw new Error('Usage: node tools/sync-readme-build-next.js --check|--write|--print');
