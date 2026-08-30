'use strict';

const fs=require('fs');
const path=require('path');

const root=path.join(__dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const exists=(p)=>fs.existsSync(path.join(root,p));
const fail=[];

const readme=read('README.md');
const current=readme.match(/Current release: \*\*v(\d+\.\d+)\*\*/);
if(!current)throw new Error('Unable to determine current release from README.md');
const currentVersion=current[1];

const repoOnly=process.argv.includes('--repo-only');
const eventName=process.env.GITHUB_EVENT_NAME||'';
const eventPath=process.env.GITHUB_EVENT_PATH||'';
let pr=null;
let releaseIntent=false;
let eventVersion='';

if(!repoOnly&&eventName==='pull_request'){
  if(!eventPath||!fs.existsSync(eventPath))fail.push('pull_request event payload is unavailable');
  else{
    const event=JSON.parse(fs.readFileSync(eventPath,'utf8'));
    pr=event.pull_request||{};
    const head=pr.head&&pr.head.ref||'';
    const title=String(pr.title||'').trim();
    const headMatch=head.match(/^(?:release|build|staging)\/obol-v(\d+\.\d+)$/i);
    const titleMatch=title.match(/^Obol v(\d+\.\d+)\b/i);
    releaseIntent=!!(headMatch||titleMatch);
    if(headMatch&&titleMatch&&headMatch[1]!==titleMatch[1])fail.push(`release PR version mismatch: head v${headMatch[1]} vs title v${titleMatch[1]}`);
    eventVersion=(headMatch&&headMatch[1])||(titleMatch&&titleMatch[1])||'';
  }
}

const version=eventVersion||currentVersion;
const releaseBranch=`release/obol-v${version}`;
const requiredFiles=[
  `data/project-model-v${version}.js`,
  `assets/core-v${version}.js`,
  `assets/app-v${version}.js`,
  `assets/obol-v${version}.css`,
  `tests/run-v${version}-tests.js`,
  `docs/v${version}.md`
];
for(const f of requiredFiles)if(!exists(f))fail.push(`missing release file: ${f}`);

const index=read('index.html');
for(const f of requiredFiles.filter(x=>/^(?:data|assets)\//.test(x)))if(!index.includes(f))fail.push(`index.html is not wired to ${f}`);
if(!index.includes(`Obol v${version}`))fail.push(`index.html does not expose v${version}`);

const changelog=read('CHANGELOG.md');
const releaseDoc=exists(`docs/v${version}.md`)?read(`docs/v${version}.md`):'';
if(!changelog.includes(`## v${version}`)&&!releaseDoc.includes(`# Obol v${version}`))fail.push(`release documentation is missing v${version}`);
const runtime=read('tools/current-runtime.js');
for(const f of [`project-model-v${version}.js`,`core-v${version}.js`])if(!runtime.includes(f))fail.push(`current runtime loader is not wired through ${f}`);
const sync=read('tools/sync-readme-build-next.js');
if(!sync.includes("require('./current-runtime')"))fail.push('README generator does not consume the shared current runtime loader');
const currentTest=read(`tests/run-v${version}-tests.js`);
if(!currentTest.includes('validate-release-pr.js'))fail.push(`tests/run-v${version}-tests.js does not invoke the release PR validator`);
if(!readme.includes('<!-- OBOL-BUILD-NEXT:START -->')||!readme.includes('<!-- OBOL-BUILD-NEXT:END -->'))fail.push('README Build Next markers are missing');

if(pr&&releaseIntent){
  const head=pr.head&&pr.head.ref||'';
  const title=String(pr.title||'').trim();
  const body=String(pr.body||'').trim();
  if(head!==releaseBranch)fail.push(`release PR head must be ${releaseBranch}, got ${head||'(empty)'}`);
  if(!title.includes(`Obol v${version}`))fail.push(`release PR title must identify Obol v${version}`);
  if(body.length<700)fail.push('release PR description is missing or too short');
  const requiredSections=[
    ['Summary',/##\s+Summary\b/i],
    ['Canonical methodology accounting',/##\s+Canonical methodology accounting\b/i],
    ['Evidence boundaries',/##\s+(?:Conservative\s+)?Evidence boundaries\b/i],
    ['Release wiring',/##\s+Release wiring\b/i],
    ['Regression coverage',/##\s+Regression coverage\b/i],
    ['Compatibility',/##\s+Compatibility\b/i]
  ];
  for(const [name,re] of requiredSections)if(!re.test(body))fail.push(`release PR description is missing section: ${name}`);
}

if(fail.length){
  console.error(`Release contract failed for v${version}:`);
  for(const x of fail)console.error(`- ${x}`);
  process.exit(1);
}
const scope=repoOnly?'repository only':releaseIntent?'release PR':'non-release PR metadata skipped';
console.log(`Release contract passed for v${version} (${scope}).`);
