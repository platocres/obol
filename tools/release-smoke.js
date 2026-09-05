'use strict';

const fs=require('fs');
const path=require('path');
const cp=require('child_process');
const {validateRepository}=require('./validate-asset-references');

const root=path.join(__dirname,'..');
const failures=[];

function fail(message){failures.push(message);}
function exists(rel){return fs.existsSync(path.join(root,rel));}
function syntax(rel){
  const r=cp.spawnSync(process.execPath,['--check',rel],{cwd:root,encoding:'utf8'});
  if(r.error)throw r.error;
  if(r.status!==0)fail(`JavaScript syntax failed: ${rel}\n${String(r.stderr||r.stdout||'').trim()}`);
}
function runCheck(args,label){
  const result=cp.spawnSync(process.execPath,args,{cwd:root,encoding:'utf8'});
  if(result.error)throw result.error;
  if(result.status!==0)fail(`${label} failed:\n${String(result.stdout||'')}${String(result.stderr||'')}`.trim());
}

const js=[];
for(const dir of ['assets','data','tools','tests']){
  const full=path.join(root,dir);
  if(!fs.existsSync(full))continue;
  for(const name of fs.readdirSync(full)){
    if(name.endsWith('.js'))js.push(path.join(dir,name));
  }
}
for(const rel of js.sort())syntax(rel);

for(const rel of ['index.html','README.md','BUILDING.md','CHANGELOG.md']){
  if(!exists(rel))fail(`Missing required repository file: ${rel}`);
}

const assetResult=validateRepository(root);
for(const message of assetResult.failures)fail(message);

if(exists('index.html')){
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const refs=[];
  for(const re of [/<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi,/<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi]){
    let m;
    while((m=re.exec(index)))refs.push(m[1]);
  }
  const local=refs.filter(x=>!/^https?:\/\//i.test(x)&&!/^\/\//.test(x));
  const seen=new Set();
  for(const rel of local){
    if(seen.has(rel))fail(`Duplicate index asset reference: ${rel}`);
    seen.add(rel);
    if(!exists(rel))fail(`index.html references a missing local asset: ${rel}`);
  }
}

if(exists('tools/validate-note-derivation-docs.js'))runCheck(['tools/validate-note-derivation-docs.js'],'Note derivation documentation validation');
if(exists('tests/run-v9.61-dashboard-tests.js'))runCheck(['tests/run-v9.61-dashboard-tests.js'],'Dashboard layout and negative-proof validation');

if(failures.length){
  console.error('Release smoke validation failed:');
  for(const item of failures)console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Release smoke validation passed: ${js.length} JavaScript files parsed, ${assetResult.entrypoints.length} HTML entrypoints scanned, and ${assetResult.references.length} local asset references resolved.`);
