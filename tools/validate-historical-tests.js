'use strict';

const fs=require('fs');
const path=require('path');

const root=path.join(__dirname,'..');
const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
const versionPattern='(\\d+\\.\\d+(?:\\.\\d+)?)';
const currentMatch=readme.match(new RegExp('Current(?: Obol)? release:\\s*\\*\\*v'+versionPattern+'(?:[^*]*)?\\*\\*'));
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
function positiveReadmeIncludes(text){
  const out=[];
  const re=/assert\s*\(\s*readme\.includes\s*\(\s*(['"`])([\s\S]*?)\1\s*\)/g;
  let m;while((m=re.exec(text)))out.push(m[2]);
  return out;
}
const staleReadmePatterns=[
  /Completed Orange methodology\/source baseline/i,
  /##\s*Permanent North Star requirements/i,
  /##\s*Completed Orange baseline/i,
  /###\s*Recent changes/i,
  /###\s*Build next/i,
  /OBOL-BUILD-NEXT:(?:START|END)/,
  /Retired historical methodology\/source Build Next block/i,
  /Current Obol release:/i
];
const versionedRuntimeAsset=/(?:obol|core|app|intake|report|nmap|methodology|dashboard|project-model|orange-fidelity|source-delivery)-v\d+\.\d+(?:\.\d+)?\.(?:js|css)/g;

for(const name of fs.readdirSync(path.join(root,'tests')).filter(x=>/^run-v\d+\.\d+(?:\.\d+)?(?:-.+)?-tests\.js$/.test(x)||/^run-v\d+\.\d+(?:\.\d+)?-tests\.js$/.test(x))){
  const version=(name.match(/^run-v(\d+\.\d+(?:\.\d+)?)/)||[])[1]||'';
  if(version===currentVersion)continue;
  const text=fs.readFileSync(path.join(root,'tests',name),'utf8');

  if(new RegExp('Current(?: Obol)? release:\\s*\\*\\*v[0-9]+\\.[0-9]+(?:\\.[0-9]+)?(?:[^*]*)?\\*\\*').test(text))add(name,'hard-codes a README current-release token');
  for(const literal of includeLiterals(text,'readme')){
    if(new RegExp('Current(?: Obol)? release:.*\\*\\*v[0-9]+\\.[0-9]+(?:\\.[0-9]+)?(?:[^*]*)?\\*\\*').test(literal))add(name,'asserts a live README version literal instead of a historical invariant');
  }
  for(const literal of positiveReadmeIncludes(text)){
    if(staleReadmePatterns.some(re=>re.test(literal)))add(name,`asserts a stale README contract instead of a historical model/durable-doc invariant: ${literal}`);
  }

  const readsIndex=/readFileSync\s*\([^\n;]*index\.html/.test(text);
  if(readsIndex){
    const assets=[...new Set(text.match(versionedRuntimeAsset)||[])];
    if(assets.length)add(name,'asserts retired direct index.html runtime wiring instead of data/runtime-manifest.js ordering: '+assets.join(', '));
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
  console.error('Historical test future-safety validation failed. Historical suites must test historical models and durable current ownership contracts, not mutable release values, stale README wording, or retired direct index wiring.');
  for(const item of failures)console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Historical test future-safety validation passed for all suites older than v${currentVersion}.`);
