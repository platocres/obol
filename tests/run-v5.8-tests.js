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
  'methodology-v5.7.js','dashboard-v5.7.js','methodology-v5.8.js','dashboard-v5.8.js'
];
const core=[
  'core-v2-base.js','core-v2.js','core-v2.1.js','core-v2.2.js','core-v2.3.js','core-v2.4.js','core-v2.5.js','core-v2.6.js','core-v2.7.js','core-v2.8.js','core-v2.9.js',
  'core-v3.0.js','core-v3.1.js','core-v3.2.js','core-v3.3.js','core-v3.4.js','core-v3.5.js','core-v3.6.js','core-v3.7.js','core-v3.8.js','core-v3.9.js',
  'core-v4.0.js','core-v4.1.js','core-v4.2.js','core-v4.3.js','core-v4.4.js','core-v4.5.js','core-v4.6.js','core-v4.7.js','core-v4.8.js','core-v4.9.js',
  'core-v5.0.js','core-v5.1.js','core-v5.2.js','core-v5.3.js','core-v5.4.js','core-v5.5.js','core-v5.6.js','core-v5.7.js','core-v5.8.js'
];
for(const f of data)run(path.join(root,'data',f));
for(const f of core)run(path.join(root,'assets',f));
for(const f of ['intake-v2.1.js','intake-v5.3.js','intake-v5.4.js','intake-v5.5.js','intake-v5.6.js','intake-v5.7.js','intake-v5.8.js'])run(path.join(root,'assets',f));

const C=global.OBOL_CORE_V2;
const O=global.OBOL_ORANGE_AD_2025_03;
const M=global.OBOL_METHODOLOGY_V58;
const I=global.OBOL_INTAKE_V58;
const lanes=global.OBOL_LANES;
let passed=0;
function test(name,fn){try{fn();console.log('ok - '+name);passed++;}catch(e){console.error('FAIL - '+name);throw e;}}
function card(id){for(const l of lanes)for(const c of l.cards||[])if(c.id===id)return c;return null;}

test('v5.8 initializes current release state',()=>{
  const s=C.newState();
  assert.strictEqual(C.VERSION,'5.8.0');
  assert.strictEqual(s.obolVersion,'5.8.0');
  assert.strictEqual(s.ui.dashboard58.showReleaseContract,true);
});

test('v5.8 closes five canonical gaps without denominator drift',()=>{
  assert.strictEqual(O.upstream.commit,'6d16ca0d1434875e0617f2f3cfa825fad0bc7d7e');
  const c=C.mindmapCoverage42(lanes);
  assert.deepStrictEqual([c.implemented,c.partial,c.gap,c.stale,c.coveragePct,c.representedPct],[77,34,16,0,61,87]);
  assert.strictEqual(M.advancedKeys.length,5);
});

test('v5.8 Build Next remains canonical-gap only',()=>{
  const q=C.buildNext52(lanes);
  assert.deepStrictEqual([q.implementedQuality,q.mappedDelivery,q.canonicalGaps,q.total],[0,0,16,16]);
});

test('all five v5.8 canonical owners are delivery-ready',()=>{
  const ready=C.deliveryReadiness52(lanes);
  for(const key of M.advancedKeys){const row=ready.rows.find(x=>x.key===key);assert(row&&row.status==='implemented'&&row.ready,key);}
  for(const id of M.cardIds){const c=card(id);assert(c&&c.evidence45&&c.evidence45.source==='v5.8',id);assert((c.commands||[]).every(x=>!!x.operatorSurface40),id);assert(c.report47&&c.report47.traceable,id);}
});

test('PrintNightmare detection and execution stay below privilege',()=>{
  let p=I.proof58('printnightmare58','nxc smb 10.0.0.10 -u user -p pass -M printnightmare','NOT VULNERABLE');
  assert(p.success&&!p.facts.includes('vuln.printnightmare'));
  p=I.proof58('printnightmare58','nxc smb 10.0.0.10 -u user -p pass -M printnightmare','VULNERABLE');
  assert(p.success&&p.facts.includes('vuln.printnightmare')&&!p.facts.includes('access.system'));
  p=I.proof58('printnightmare58','python3 printnightmare.py -dll x corp/user:pass@10.0.0.10','Driver added successfully');
  assert(p.success&&p.facts.includes('execution.remote')&&!p.facts.includes('access.system'));
});

test('PrivExchange proves coercion only',()=>{
  const p=I.proof58('privexchange58','python3 privexchange.py -ah 10.0.0.5 exch -u user -d corp -p pass','NTLM authentication received from Exchange callback');
  assert(p.success&&p.facts.includes('coerce.http'));
  assert(!p.facts.includes('relay.success')&&!p.facts.includes('access.admin'));
});

test('ProxyNotShell requires explicit identity and only explicit SYSTEM becomes SYSTEM',()=>{
  let p=I.proof58('proxynotshell58','python3 poc_aug3.py exch user pass whoami','CORP\\svc_exchange');
  assert(p.success&&p.facts.includes('execution.remote')&&!p.facts.includes('access.system'));
  p=I.proof58('proxynotshell58','python3 poc_aug3.py exch user pass whoami','NT AUTHORITY\\SYSTEM');
  assert(p.success&&p.facts.includes('access.system'));
});

test('AppLocker policy is separate from bypass verification',()=>{
  let p=I.proof58('applocker-bypass58','Get-AppLockerPolicy -Effective -Xml','<AppLockerPolicy><RuleCollection EnforcementMode="Enabled" /></AppLockerPolicy>');
  assert(p.success&&p.facts.includes('applocker.policy')&&!p.facts.includes('applocker.bypass_verified'));
  p=I.proof58('applocker-bypass58','C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\MSBuild.exe test.xml','OBOL_APPLOCKER_BYPASS_OK');
  assert(p.success&&p.facts.includes('applocker.bypass_verified')&&!p.facts.includes('access.admin'));
});

test('Kerberos relay separates control, ticket, and SYSTEM proof',()=>{
  let p=I.proof58('kerberos-relay58','KrbRelayUp.exe relay -d corp.local -m rbcd -c','RBCD delegation added successfully');
  assert(p.success&&p.facts.includes('ad.kerberos_relay_control')&&!p.facts.includes('access.system'));
  p=I.proof58('kerberos-relay58','KrbRelayUp.exe spawn -d corp.local -m rbcd','Service ticket obtained successfully');
  assert(p.success&&p.facts.includes('kerberos.tickets')&&!p.facts.includes('access.system'));
  p=I.proof58('kerberos-relay58','type C:\\Windows\\Temp\\obol-krbrelay-whoami.txt','NT AUTHORITY\\SYSTEM');
  assert(p.success&&p.facts.includes('access.system'));
});

test('dashboard exposes v5.8 gap reduction and release contract',()=>{
  const d=C.northStarDashboard58(C.newState(),lanes);
  assert.strictEqual(d.canonicalAdvance58.toImplemented,77);
  assert.strictEqual(d.gapWave58.remainingGaps,16);
  assert.strictEqual(d.releaseContract58.requiredBranch,'release/obol-v5.8');
  assert.strictEqual(d.releaseContract58.requiredStatusCheck,'test');
  assert(d.milestones.some(x=>x.release==='v5.8'&&x.implemented===77));
  assert(d.milestones.some(x=>x.release==='v5.7'&&x.implemented===72));
});

test('README generator remains live and future-safe',()=>{
  const out=cp.execFileSync(process.execPath,[path.join(root,'tools','sync-readme-build-next.js'),'--print'],{encoding:'utf8'});
  assert(out.includes('OBOL-BUILD-NEXT:START'));
  assert(/Canonical methodology:\*\* \d+\/127 fully implemented \(\d+%\)/.test(out));
  assert(out.includes('North Star Dashboard → Build Next'));
});

test('release PR validator rejects missing descriptions and accepts the v5.8 historical contract',()=>{
  const tool=path.join(root,'tools','validate-release-pr.js');
  const eventPath=path.join(os.tmpdir(),'obol-release-pr-event.json');
  const version='5.8';
  const goodBody='## Summary\n'+('Release summary. '.repeat(50))+'\n## Canonical methodology accounting\nCurrent accounting retained.\n## Conservative Evidence boundaries\nProof stays bounded.\n## Release wiring\nWired.\n## Regression coverage\nCovered.\n## Compatibility\nCompatible.';
  fs.writeFileSync(eventPath,JSON.stringify({pull_request:{head:{ref:`release/obol-v${version}`},title:`Obol v${version} — release contract fixture`,body:goodBody}}));
  let r=cp.spawnSync(process.execPath,[tool],{cwd:root,env:{...process.env,GITHUB_EVENT_NAME:'pull_request',GITHUB_EVENT_PATH:eventPath},encoding:'utf8'});
  assert.strictEqual(r.status,0,r.stderr||r.stdout);
  fs.writeFileSync(eventPath,JSON.stringify({pull_request:{head:{ref:`build/obol-v${version}`},title:`Build/obol v${version}`,body:''}}));
  r=cp.spawnSync(process.execPath,[tool],{cwd:root,env:{...process.env,GITHUB_EVENT_NAME:'pull_request',GITHUB_EVENT_PATH:eventPath},encoding:'utf8'});
  assert.notStrictEqual(r.status,0);
  fs.unlinkSync(eventPath);
});

test('live CI event satisfies the release PR contract',()=>{
  const tool=path.join(root,'tools','validate-release-pr.js');
  const r=cp.spawnSync(process.execPath,[tool],{cwd:root,env:process.env,encoding:'utf8'});
  assert.strictEqual(r.status,0,r.stderr||r.stdout);
});

test('v5.8 release wiring is complete',()=>{
  const idx=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
  const changelog=fs.readFileSync(path.join(root,'CHANGELOG.md'),'utf8');
  for(const x of ['methodology-v5.8.js','dashboard-v5.8.js','core-v5.8.js','intake-v5.8.js','app-v5.8.js','obol-v5.8.css'])assert(idx.includes(x),x);
  assert(/Current release: \*\*v\d+\.\d+\*\*/.test(readme));
  assert(changelog.includes('## v5.8'));
  assert(fs.existsSync(path.join(root,'docs','v5.8.md')));
  assert(fs.existsSync(path.join(root,'tools','validate-release-pr.js')));
  assert(fs.readFileSync(path.join(root,'tests','run-v5.8-tests.js'),'utf8').includes('validate-release-pr.js'));
});

test('sanitized export advances to v5.8 while retaining secret redaction',()=>{
  const s=C.newState();
  C.addTypedArtifact(s,'secrets','DoNotExport!',{});
  const safe=C.sanitizedCopy(s);
  assert.strictEqual(safe.obolVersion,'5.8.0');
  assert.strictEqual(safe.typedArtifacts.secrets[0].value,'[REDACTED SECRET]');
});

console.log(`\n${passed} v5.8 tests passed`);
