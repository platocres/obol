'use strict';

const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
const authorityPath=path.join(root,'data','current-release.js');
const readmePath=path.join(root,'README.md');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);vm.runInContext(fs.readFileSync(authorityPath,'utf8'),sandbox,{filename:authorityPath});
const release=sandbox.window.OBOL_CURRENT_RELEASE;
if(!release||!/^\d+\.\d+\.\d+$/.test(release.version)||!/^v\d+\.\d+(?:\.\d+)?$/.test(release.label))throw new Error('Invalid current release authority');
function expected(){return 'Current release: **'+release.label+'**';}
function replace(content){const re=/Current release:\s*\*\*v\d+\.\d+(?:\.\d+)?\*\*/;if(!re.test(content))throw new Error('README current release line missing');return content.replace(re,expected());}
const current=fs.readFileSync(readmePath,'utf8');
const next=replace(current);
if(process.argv.includes('--write')){fs.writeFileSync(readmePath,next);console.log('README current release synchronized to '+release.label+'.');}
else if(current!==next){console.error('README current release is out of sync with data/current-release.js. Run node tools/sync-current-release.js --write');process.exit(1);}
else console.log('README current release matches '+release.label+'.');
