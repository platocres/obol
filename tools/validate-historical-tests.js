'use strict';

const fs=require('fs');
const path=require('path');

const root=path.join(__dirname,'..');
const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
const currentMatch=readme.match(/Current(?: Obol)? release:\s*\*\*v(\d+\.\d+)(?:[^*]*)?\*\*/);
if(!currentMatch)throw new Error('Unable to determine current release from README.md');
const currentVersion=currentMatch[1];
const failures=[];

function add(name,reason){failures.push(`${name}: ${reason}`);}
function includeLiterals(text,objectName){
  const out=[];
  const patterns=[
    new RegExp(objectName+'\\s*\\.\\s*includes\\s*\\(\\s*\'((?:\\\\.|[^\'\\\\])*)\'\\s*\\)','g'),
    new RegExp(objectName+'\\s*\\.\\s*includes\\s*\\(\\s*"((?:\\\\.|[^"\\\\])*)"\\s*\\)','g'),
    new RegExp(objectName+'\\s*\\.\\s*includes\\s*\\(\\s*`((?:\\\\.|[^`\\\\])*)`\\s*\\)','g')
  ];
  for(const re of patterns){let m;while((m=re.exec(text)))out.push(m[1]);}
  return out;
}

for(const name of fs.readdirSync(path.join(root,'tests')).filter(x=>/^run-v\d+\.\d+.*-tests\.js$/.test(x))){
  const version=(name.match(/^run-v(\d+\.\d+)/)||[])[1]||'';
  if(version===currentVersion)continue;
  const text=fs.readFileSync(path.join(root,'tests',name),'utf8');

  if(/Current(?: Obol)? release:\s*\*\*v[0-9]+\.[0-9]+(?:[^*]*)?\*\*/.test(text))add(name,'hard-codes a README current-release token');
  for(const literal of includeLiterals(text,'readme')){
    if(/Current(?: Obol)? release:.*\*\*v[0-9]+\.[0-9]+(?:[^*]*)?\*\*/.test(literal))add(name,'asserts a live README version literal instead of a historical invariant');
  }

  if(text.includes('sync-readme-build-next.js')){
    for(const literal of includeLiterals(text,'out')){
      if(/Current live queue:\*\*\s*[0-9]+/.test(literal))add(name,'hard-codes the live Build Next queue total');
      if(/Canonical methodology:\*\*\s*[0-9]+\/127/.test(literal))add(name,'hard-codes the live canonical implemented count');
      if(/[0-9]+\s+canonical gaps/.test(literal))add(name,'hard-codes the live canonical gap count');
      if(/[0-9]+\s+implemented-quality repairs/.test(literal))add(name,'hard-codes the live implemented-quality count');
      if(/[0-9]+\s+mapped-delivery repairs/.test(literal))add(name,'hard-codes the live mapped-delivery count');
    }
  }
}

if(failures.length){
  console.error('Historical test future-safety validation failed. Historical suites must test historical models and structural live-output contracts, not mutable current-release values.');
  for(const item of failures)console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Historical test future-safety validation passed for all suites older than v${currentVersion}.`);
