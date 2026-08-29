'use strict';

const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const path=require('path');
const cp=require('child_process');
const os=require('os');

global.window=globalThis;
global.DOMParser=function(){};
const root=path.join(__dirname,'..');
function run(file){vm.runInThisContext(fs.readFileSync(file,'utf8'),{filename:file});}

const data=[
  'lanes.js','methodology-v2.2.js','methodology-v2.3.js','methodology-v2.5.js','tools-v2.2.js',
  'methodology-v3.3.js','methodology-v3.4.js','methodology-v3.6.js','methodology-v4.1.js','orange-ad-2025.03.js',
  'methodology-v4.3.js','methodology-v4.4.js','methodology-v4.5.js','methodology-v4.6.js','methodology-v4.7.js','methodology-v4.8.js',
  'dashboard-v4.9.js','dashboard-v5.0.js','dashboard-v5.1.js','dashboard-v5.2.js','methodology-v5.3.js','dashboard-v5.3.js',
  'methodology-v5.4.js','dashboard-v5.4.js','methodology-v5.5.js','dashboard-v5.5.js','methodology-v5.6.js','dashboard-v5.6.js',
  'methodology-v5.7.js','dashboard-v5.7.js','methodology-v5.8.js','dashboard-v5.8.js','methodology-v5.9.js','dashboard-v5.9.js'
];
const core=[
  'core-v2-base.js','core-v2.js','core-v2.1.js','core-v2.2.js','core-v2.3.js','core-v2.4.js','core-v2.5.js','core-v2.6.js','core-v2.7.js','core-v2.8.js','core-v2.9.js',
  'core-v3.0.js','core-v3.1.js','core-v3.2.js','core-v3.3.js','core-v3.4.js','core-v3.5.js','core-v3.6.js','core-v3.7.js','core-v3.8.js','core-v3.9.js',
  'core-v4.0.js','core-v4.1.js','core-v4.2.js','core-v4.3.js','core-v4.4.js','core-v4.5.js','core-v4.6.js','core-v4.7.js','core-v4.8.js','core-v4.9.js',
  'core-v5.0.js','core-v5.1.js','core-v5.2.js','core-v5.3.js','core-v5.4.js','core-v5.5.js','core-v5.6.js','core-v5.7.js','core-v5.8.js','core-v5.9.js'
];
for(const f of data)run(path.join(root,'data',f));
for(const f of core)run(path.join(root,'assets',f));
for(const f of ['intake-v2.1.js','intake-v5.3.js','intake-v5.4.js','intake-v5.5.js','intake-v5.6.js','intake-v5.7.js','intake-v5.8.js','intake-v5.9.js'])run(path.join(root,'assets',f));

const C=global.OBOL_CORE_V2;
const O=global.OBOL_ORANGE_AD_2025_03;
const M=global.OBOL_METHODOLOGY_V59;
const I=global.OBOL_INTAKE_V59;
const lanes=global.OBOL_LANES;
let passed=0;
function test(name,fn){try{fn();console.log('ok - '+name);passed++;}catch(e){console.error('FAIL - '+name);throw e;}}
function card(id){for(const l of lanes)for(const c of l.cards||[])if(c.id===id)return c;return null;}

test('v5.9 initializes current release state',()=>{
  const s=C.newState();
  assert.strictEqual(C.VERSION,'5.9.0');
  assert.strictEqual(s.obolVersion,'5.9.0');
  assert.strictEqual(s.ui.dashboard59.showReleaseQuality,true);
});

test('v5.9 closes five canonical gaps without denominator drift',()=>{
  assert.strictEqual(O.upstream.commit,'6d16ca0d1434875e0617f2f3cfa825fad0bc7d7e');
  const c=C.mindmapCoverage42(lanes);
  assert.deepStrictEqual([c.implemented,c.partial,c.gap,c.stale,c.coveragePct,c.representedPct],[82,34,11,0,65,91]);
  assert.strictEqual(M.advancedKeys.length,5);
});

test('Build Next is clean before remaining canonical gaps',()=>{
  const q=C.buildNext52(lanes);
  assert.deepStrictEqual([q.implementedQuality,q.mappedDelivery,q.canonicalGaps,q.total],[0,0,11,11]);
  assert(q.rows.every(x=>x.kind==='canonical-gap'));
});

test('all five v5.9 canonical owners are delivery-ready',()=>{
  const ready=C.deliveryReadiness52(lanes);
  for(const key of M.advancedKeys){const row=ready.rows.find(x=>x.key===key);assert(row&&row.status==='implemented'&&row.ready,key);}
  for(const id of M.cardIds){const c=card(id);assert(c&&c.evidence45&&c.evidence45.source==='v5.9',id);assert((c.commands||[]).every(x=>!!x.operatorSurface40),id);assert(c.report47&&c.report47.traceable,id);}
});

test('UAC proof requires independent elevated integrity output',()=>{
  let p=I.proof59('uac-bypass59','fodhelper.exe','process started');
  assert(!p.success&&!p.facts.includes('access.admin'));
  p=I.proof59('uac-bypass59','type %TEMP%\\obol-uac-whoami.txt','Mandatory Label\\High Mandatory Level');
  assert(p.success&&p.facts.includes('windows.uac_bypass_verified')&&p.facts.includes('access.admin'));
});

test('EternalBlue separates vulnerability, execution, and SYSTEM',()=>{
  let p=I.proof59('eternalblue59','nmap -p445 --script smb-vuln-ms17-010 10.0.0.10','State: VULNERABLE');
  assert(p.success&&p.facts.includes('vuln.ms17_010')&&!p.facts.includes('access.system'));
  p=I.proof59('eternalblue59','msfconsole','Meterpreter session 1 opened');
  assert(p.success&&p.facts.includes('execution.remote')&&!p.facts.includes('access.system'));
  p=I.proof59('eternalblue59','getuid','Server username: NT AUTHORITY\\SYSTEM');
  assert(p.success&&p.facts.includes('access.system'));
});

test('Exchange and GLPI detection stay below privilege',()=>{
  let p=I.proof59('exchange-quickwin59','nuclei -u https://exch -tags proxyshell','[CVE-2021-34473] [critical]');
  assert(p.success&&p.facts.includes('vuln.proxyshell')&&!p.facts.includes('access.admin'));
  p=I.proof59('glpi-quickwin59','curl -sk https://host/vendor/htmlawed/htmlawed/htmLawedTest.php','htmLawedTest');
  assert(p.success&&p.facts.includes('vuln.glpi')&&!p.facts.includes('execution.remote'));
});

test('Java deserialization requires the explicit callback marker',()=>{
  let p=I.proof59('java-deser59','java -jar ysoserial.jar CommonsCollections1 x | nc host 9999','connected');
  assert(!p.success);
  p=I.proof59('java-deser59','python3 -m http.server 8000','GET /OBOL_JAVA_DESER_OK HTTP/1.1" 200 -');
  assert(p.success&&p.facts.includes('vuln.java_deserialization')&&p.facts.includes('execution.remote'));
});

test('dashboard exposes canonical progress and generic release quality',()=>{
  const d=C.northStarDashboard59(C.newState(),lanes);
  assert.strictEqual(d.canonicalAdvance59.toImplemented,82);
  assert.strictEqual(d.gapWave59.remainingGaps,11);
  assert.strictEqual(d.releaseQuality59.clean,true);
  assert.strictEqual(d.releaseQuality59.validator,'tools/validate-release-quality.js');
  assert(d.milestones.some(x=>x.release==='v5.9'&&x.implemented===82));
  assert(d.milestones.some(x=>x.release==='v5.8'&&x.implemented===77));
});

test('generic release quality gate passes current live model',()=>{
  const r=cp.spawnSync(process.execPath,[path.join(root,'tools','validate-release-quality.js')],{cwd:root,encoding:'utf8'});
  assert.strictEqual(r.status,0,r.stderr||r.stdout);
  assert((r.stdout||'').includes('0 implemented-quality repairs, 0 mapped-delivery repairs'));
});

test('release PR validator accepts v5.9 contract and rejects wrong branch',()=>{
  const tool=path.join(root,'tools','validate-release-pr.js');
  const eventPath=path.join(os.tmpdir(),'obol-v59-pr-event.json');
  const goodBody='## Summary\n'+('Release summary. '.repeat(50))+'\n## Canonical methodology accounting\n82/127.\n## Conservative Evidence boundaries\nProof stays bounded.\n## Release wiring\nWired.\n## Regression coverage\nCovered.\n## Compatibility\nCompatible.';
  fs.writeFileSync(eventPath,JSON.stringify({pull_request:{head:{ref:'release/obol-v5.9'},title:'Obol v5.9 — quality gate and canonical progress',body:goodBody}}));
  let r=cp.spawnSync(process.execPath,[tool],{cwd:root,env:{...process.env,GITHUB_EVENT_NAME:'pull_request',GITHUB_EVENT_PATH:eventPath},encoding:'utf8'});
  assert.strictEqual(r.status,0,r.stderr||r.stdout);
  fs.writeFileSync(eventPath,JSON.stringify({pull_request:{head:{ref:'build/obol-v5.9'},title:'Obol v5.9 — bad release branch',body:goodBody}}));
  r=cp.spawnSync(process.execPath,[tool],{cwd:root,env:{...process.env,GITHUB_EVENT_NAME:'pull_request',GITHUB_EVENT_PATH:eventPath},encoding:'utf8'});
  assert.notStrictEqual(r.status,0);
  fs.unlinkSync(eventPath);
});

test('live CI event satisfies the release PR contract',()=>{
  const tool=path.join(root,'tools','validate-release-pr.js');
  const r=cp.spawnSync(process.execPath,[tool],{cwd:root,env:process.env,encoding:'utf8'});
  assert.strictEqual(r.status,0,r.stderr||r.stdout);
});

test('v5.9 release wiring is complete',()=>{
  const idx=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
  const changelog=fs.readFileSync(path.join(root,'CHANGELOG.md'),'utf8');
  for(const x of ['methodology-v5.9.js','dashboard-v5.9.js','core-v5.9.js','intake-v5.9.js','app-v5.9.js','obol-v5.9.css'])assert(idx.includes(x),x);
  assert(readme.includes('Current release: **v5.9**'));
  assert(readme.includes('BUILDING.md'));
  assert(changelog.includes('## v5.9'));
  assert(fs.existsSync(path.join(root,'docs','v5.9.md')));
  assert(fs.readFileSync(path.join(root,'tests','run-v5.9-tests.js'),'utf8').includes('validate-release-pr.js'));
});

test('sanitized export advances to v5.9 while retaining secret redaction',()=>{
  const s=C.newState();
  C.addTypedArtifact(s,'secrets','DoNotExport!',{});
  const safe=C.sanitizedCopy(s);
  assert.strictEqual(safe.obolVersion,'5.9.0');
  assert.strictEqual(safe.typedArtifacts.secrets[0].value,'[REDACTED SECRET]');
});

console.log(`\n${passed} v5.9 tests passed`);
