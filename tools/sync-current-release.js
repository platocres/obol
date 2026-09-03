'use strict';

const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
const authorityPath=path.join(root,'data','current-release.js');
const readmePath=path.join(root,'README.md');
const indexPath=path.join(root,'index.html');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);vm.runInContext(fs.readFileSync(authorityPath,'utf8'),sandbox,{filename:authorityPath});
const release=sandbox.window.OBOL_CURRENT_RELEASE;
if(!release||!/^\d+\.\d+\.\d+$/.test(release.version)||!/^v\d+\.\d+(?:\.\d+)?$/.test(release.label))throw new Error('Invalid current release authority');
function expected(){return 'Current release: **'+release.label+'**';}
function replaceReadme(content){const re=/Current release:\s*\*\*v\d+\.\d+(?:\.\d+)?\*\*/;if(!re.test(content))throw new Error('README current release line missing');return content.replace(re,expected());}
function replaceIndex(content){
 const title='<title>Obol '+release.label+' — '+release.phaseLabel+'</title>';
 const tagline='<p class="tagline">Offensive Box Operations Ledger · '+release.label+'</p>';
 if(!/<title>Obol [^<]+<\/title>/.test(content))throw new Error('index title missing');
 if(!/<p class="tagline">Offensive Box Operations Ledger · v\d+(?:\.\d+){1,2}<\/p>/.test(content))throw new Error('index tagline missing');
 return content.replace(/<title>Obol [^<]+<\/title>/,title).replace(/<p class="tagline">Offensive Box Operations Ledger · v\d+(?:\.\d+){1,2}<\/p>/,tagline);
}
const current=fs.readFileSync(readmePath,'utf8');
const next=replaceReadme(current);
const indexCurrent=fs.readFileSync(indexPath,'utf8');
const indexNext=replaceIndex(indexCurrent);
if(process.argv.includes('--write')){
 fs.writeFileSync(readmePath,next);fs.writeFileSync(indexPath,indexNext);
 console.log('README and index current release synchronized to '+release.label+'.');
}else if(current!==next||indexCurrent!==indexNext){
 console.error('README/index current release is out of sync with data/current-release.js. Run node tools/sync-current-release.js --write');process.exit(1);
}else console.log('README and index current release match '+release.label+'.');
