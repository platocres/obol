'use strict';

const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\r\n/g,'\n');
const write=(rel,content)=>fs.writeFileSync(path.join(root,rel),content);

function loadRelease(){
 const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
 vm.runInContext(read('data/current-release.js'),sandbox,{filename:'data/current-release.js'});
 const release=sandbox.window.OBOL_CURRENT_RELEASE;
 if(!release||!/^v\d+\.\d+(?:\.\d+)?$/.test(release.label))throw new Error('Invalid current release authority');
 return release;
}

function releaseDocPath(label){return path.join('docs',label.replace(/^v/,'v')+'.md');}

function section(lines,heading){
 const start=lines.findIndex(line=>line.trim()===heading);
 if(start<0)return [];
 const out=[];
 for(let i=start+1;i<lines.length;i++){
  if(/^##\s+/.test(lines[i]))break;
  out.push(lines[i]);
 }
 return out.join('\n').trim().split('\n').filter(line=>line.trim().startsWith('- '));
}

function buildEntry(release){
 const docRel=releaseDocPath(release.label);
 const docAbs=path.join(root,docRel);
 if(!fs.existsSync(docAbs))throw new Error('Missing release doc '+docRel);
 const doc=read(docRel);
 const lines=doc.split('\n');
 const bullets=section(lines,'## What changed');
 if(!bullets.length)throw new Error(docRel+' does not contain a bullet list under ## What changed');
 let summary=(lines.find((line,idx)=>idx>0&&line.trim()&&!line.startsWith('#'))||'Release updates.').trim();
 summary=summary.replace(/^v\d+\.\d+(?:\.\d+)?\s+/i,'').replace(/\.$/,'');
 const title=release.label+' — '+summary.charAt(0).toUpperCase()+summary.slice(1);
 return ['## '+title,'',...bullets,''].join('\n');
}

function sync(){
 const release=loadRelease();
 const changelog=read('CHANGELOG.md');
 const headingRe=new RegExp('^##\\s+'+release.label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:\\s|$)','m');
 if(headingRe.test(changelog))return {changed:false,release};
 const entry=buildEntry(release);
 const next=entry+'\n'+changelog.replace(/^\s+/,'');
 return {changed:true,release,next};
}

function main(){
 const result=sync();
 if(process.argv.includes('--write')){
  if(result.changed)write('CHANGELOG.md',result.next);
  console.log(result.changed?'CHANGELOG synchronized to '+result.release.label+'.':'CHANGELOG already contains '+result.release.label+'.');
 }else{
  if(result.changed){console.error('CHANGELOG.md is missing the current release heading '+result.release.label+'. Run node tools/sync-current-changelog.js --write');process.exit(1);}
  console.log('CHANGELOG contains '+result.release.label+'.');
 }
}

if(require.main===module)main();
module.exports={loadRelease,releaseDocPath,section,buildEntry,sync,main};
