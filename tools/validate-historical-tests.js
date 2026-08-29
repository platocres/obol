'use strict';

const fs=require('fs');
const path=require('path');

const root=path.join(__dirname,'..');
const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
const currentMatch=readme.match(/Current release:\s*\*\*v(\d+\.\d+)\*\*/);
if(!currentMatch)throw new Error('Unable to determine current release from README.md');
const currentVersion=currentMatch[1];
const failures=[];

function add(name,reason){failures.push(`${name}: ${reason}`);}

for(const name of fs.readdirSync(path.join(root,'tests')).filter(x=>/^run-v\d+\.\d+.*-tests\.js$/.test(x))){
  const version=(name.match(/^run-v(\d+\.\d+)/)||[])[1]||'';
  if(version===currentVersion)continue;
  const text=fs.readFileSync(path.join(root,'tests',name),'utf8');

  if(/Current release:\s*\*\*v\d+\.\d+\*\*/.test(text))add(name,'hard-codes a README current-release token');
  if(/readme\s*\.\s*(?:includes|match|indexOf)\s*\([^\n]*v\d+\.\d+/.test(text))add(name,'asserts a live README version literal instead of a historical invariant');

  if(text.includes('sync-readme-build-next.js')){
    const liveExact=[
      [/out\s*\.\s*includes\s*\([^\n]*Current live queue:\*\*\s*\d+/,'hard-codes the live Build Next queue total'],
      [/out\s*\.\s*includes\s*\([^\n]*Canonical methodology:\*\*\s*\d+\/127/,'hard-codes the live canonical implemented count'],
      [/out\s*\.\s*includes\s*\([^\n]*\d+\s+canonical gaps/,'hard-codes the live canonical gap count'],
      [/out\s*\.\s*includes\s*\([^\n]*\d+\s+implemented-quality repairs/,'hard-codes the live implemented-quality count'],
      [/out\s*\.\s*includes\s*\([^\n]*\d+\s+mapped-delivery repairs/,'hard-codes the live mapped-delivery count']
    ];
    for(const [re,reason] of liveExact)if(re.test(text))add(name,reason);
  }
}

if(failures.length){
  console.error('Historical test future-safety validation failed. Historical suites must test historical models and structural live-output contracts, not mutable current-release values.');
  for(const item of failures)console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Historical test future-safety validation passed for all suites older than v${currentVersion}.`);
