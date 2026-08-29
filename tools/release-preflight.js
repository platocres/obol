'use strict';

const fs=require('fs');
const path=require('path');
const cp=require('child_process');

const root=path.join(__dirname,'..');
const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
const match=readme.match(/Current release: \*\*v(\d+\.\d+)\*\*/);
if(!match)throw new Error('Unable to determine current release from README.md');
const version=match[1];
const currentTest=path.join(root,'tests',`run-v${version}-tests.js`);
if(!fs.existsSync(currentTest))throw new Error(`Missing current release regression suite: tests/run-v${version}-tests.js`);

function run(label,args){
  console.log(`\n== ${label} ==`);
  const r=cp.spawnSync(process.execPath,args,{cwd:root,stdio:'inherit'});
  if(r.error)throw r.error;
  if(r.status!==0)process.exit(r.status||1);
}

const syntaxFiles=[];
for(const dir of ['data','assets']){
  for(const name of fs.readdirSync(path.join(root,dir))){
    if(name.endsWith(`-v${version}.js`))syntaxFiles.push(path.join(dir,name));
  }
}
for(const file of ['tools/sync-readme-build-next.js','tools/release-preflight.js','tools/validate-release-pr.js','tools/validate-release-quality.js',`tests/run-v${version}-tests.js`]){
  if(fs.existsSync(path.join(root,file)))syntaxFiles.push(file);
}
if(!syntaxFiles.length)throw new Error(`No v${version} JavaScript release files found for syntax validation`);
for(const file of [...new Set(syntaxFiles)].sort())run(`syntax ${file}`,['--check',file]);

const syncText=fs.readFileSync(path.join(root,'tools','sync-readme-build-next.js'),'utf8');
for(const required of [`methodology-v${version}.js`,`dashboard-v${version}.js`,`core-v${version}.js`]){
  if(!syncText.includes(required))throw new Error(`README Build Next generator is not wired through current release file: ${required}`);
}

const brittle=[];
for(const name of fs.readdirSync(path.join(root,'tests')).filter(x=>/^run-v\d+\.\d+.*-tests\.js$/.test(x))){
  const text=fs.readFileSync(path.join(root,'tests',name),'utf8');
  if(text.includes('sync-readme-build-next.js')){
    if(/out\.includes\(['"`]Canonical methodology:\*\* \d+\/127/.test(text))brittle.push(`${name}: exact generated canonical count`);
    if(/out\.includes\(['"`]\d+ implemented-quality repairs/.test(text))brittle.push(`${name}: exact generated implemented-quality count`);
    if(/out\.includes\(['"`]\*\*Current live queue:\*\* \d+/.test(text))brittle.push(`${name}: exact generated queue total`);
  }
  if(name!==`run-v${version}-tests.js`&&/readme\.includes\(['"`](?:Current release: )?\*\*v\d+\.\d+\*\*/.test(text))brittle.push(`${name}: hard-coded README release token`);
}
if(brittle.length){
  console.error('\nHistorical/live README assertions must be future-safe. Test historical numbers against the historical model and test current README/generator output by structure.');
  for(const item of brittle)console.error(`- ${item}`);
  process.exit(1);
}

run('repository release contract',['tools/validate-release-pr.js','--repo-only']);
run('release quality debt gate',['tools/validate-release-quality.js']);
run(`v${version} regression suite`,[path.relative(root,currentTest)]);
run('README Build Next synchronization',['tools/sync-readme-build-next.js','--check']);
console.log(`\nRelease preflight passed for v${version}.`);
