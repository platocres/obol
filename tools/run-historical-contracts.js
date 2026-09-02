'use strict';

const cp=require('child_process');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');

function run(args){
 const result=cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});
 process.stdout.write(result.stdout||'');
 process.stderr.write(result.stderr||'');
 if(result.status!==0)process.exit(result.status||1);
}
function walk(dir,out=[]){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(entry.name==='.git'||entry.name==='node_modules')continue;
  const full=path.join(dir,entry.name);
  if(entry.isDirectory())walk(full,out);
  else if(entry.name.endsWith('.js'))out.push(full);
 }
 return out;
}
function natural(a,b){return a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'});}

for(const full of ['assets','data','tools','tests'].flatMap(name=>walk(path.join(root,name))).sort(natural)){
 const rel=path.relative(root,full).replace(/\\/g,'/');
 const result=cp.spawnSync(process.execPath,['--check',full],{cwd:root,encoding:'utf8'});
 if(result.status!==0){process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');process.exit(result.status||1);}
 process.stdout.write('syntax ok: '+rel+'\n');
}

run(['tools/validate-historical-tests.js']);
run(['tools/validate-release-pr.js']);
run(['tests/run-tests.js']);
for(const file of fs.readdirSync(path.join(root,'tests')).filter(name=>/^run-v.*-tests\.js$/.test(name)).sort(natural))run(['tests/'+file]);
run(['tools/validate-release-quality.js']);
run(['tools/validate-readme-history-ownership.js']);
run(['tools/sync-readme-build-next.js','--check']);
run(['tools/sync-product-build-next.js','--check']);
console.log('Complete historical contract runner passed.');
