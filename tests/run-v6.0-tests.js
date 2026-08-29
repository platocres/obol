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
  'methodology-v5.7.js','dashboard-v5.7.js','methodology-v5.8.js','dashboard-v5.8.js','methodology-v5.9.js','dashboard-v5.9.js',
  'methodology-v6.0.js','dashboard-v6.0.js'
];
const core=[
  'core-v2-base.js','core-v2.js','core-v2.1.js','core-v2.2.js','core-v2.3.js','core-v2.4.js','core-v2.5.js','core-v2.6.js','core-v2.7.js','core-v2.8.js','core-v2.9.js',
  'core-v3.0.js','core-v3.1.js','core-v3.2.js','core-v3.3.js','core-v3.4.js','core-v3.5.js','core-v3.6.js','core-v3.7.js','core-v3.8.js','core-v3.9.js',
  'core-v4.0.js','core-v4.1.js','core-v4.2.js','core-v4.3.js','core-v4.4.js','core-v4.5.js','core-v4.6.js','core-v4.7.js','core-v4.8.js','core-v4.9.js',
  'core-v5.0.js','core-v5.1.js','core-v5.2.js','core-v5.3.js','core-v5.4.js','core-v5.5.js','core-v5.6.js','core-v5.7.js','core-v5.8.js','core-v5.9.js','core-v6.0.js'
];
for(const f of data)run(path.join(root,'data',f));
for(const f of core)run(path.join(root,'assets',f));
for(const f of ['intake-v2.1.js','intake-v5.3.js','intake-v5.4.js','intake-v5.5.js','intake-v5.6.js','intake-v5.7.js','intake-v5.8.js','intake-v5.9.js','intake-v6.0.js'])run(path.join(root,'assets',f));

const C=global.OBOL_CORE_V2;
const O=global.OBOL_ORANGE_AD_2025_03;
const M=global.OBOL_METHODOLOGY_V60;
const I=global.OBOL_INTAKE_V60;
const lanes=global.OBOL_LANES;
let passed=0;
function test(name,fn){try{fn();console.log('ok - '+name);passed++;}catch(e){console.error('FAIL - '+name);throw e;}}
function card(id){for(const l of lanes)for(const c of l.cards||[])if(c.id===id)return c;return null;}

test('v6.0 initializes current release state',()=>{const s=C.newState();assert.strictEqual(C.VERSION,'6.0.0');assert.strictEqual(s.obolVersion,'6.0.0');assert.strictEqual(s.ui.dashboard60.showReleaseQuality,true);});
test('v6.0 closes five canonical gaps without denominator drift',()=>{assert.strictEqual(O.upstream.commit,'6d16ca0d1434875e0617f2f3cfa825fad0bc7d7e');const c=C.mindmapCoverage42(lanes);assert.deepStrictEqual([c.implemented,c.partial,c.gap,c.stale,c.coveragePct,c.representedPct],[87,34,6,0,69,95]);assert.strictEqual(M.advancedKeys.length,5);});
test('Build Next remains quality-clean before the six remaining canonical gaps',()=>{const q=C.buildNext52(lanes);assert.deepStrictEqual([q.implementedQuality,q.mappedDelivery,q.canonicalGaps,q.total],[0,0,6,6]);assert(q.rows.every(x=>x.kind==='canonical-gap'));});
test('all five v6.0 canonical owners are delivery-ready',()=>{const ready=C.deliveryReadiness52(lanes);for(const key of M.advancedKeys){const row=ready.rows.find(x=>x.key===key);assert(row&&row.status==='implemented'&&row.ready,key);}for(const id of M.cardIds){const c=card(id);assert(c&&c.evidence45&&c.evidence45.source==='v6.0',id);assert((c.commands||[]).every(x=>!!x.operatorSurface40),id);assert(c.report47&&c.report47.traceable,id);}});
test('RMI keeps registry, vulnerability, and execution boundaries separate',()=>{let p=I.proof60('java-rmi60','nmap -p1099 --script rmi-dumpregistry host','RMI Registry: bound name Foo');assert(p.success&&p.facts.includes('service.rmi')&&!p.facts.includes('execution.remote'));p=I.proof60('java-rmi60','msfconsole java_rmi_server','Target appears VULNERABLE');assert(p.success&&p.facts.includes('vuln.java_rmi')&&!p.facts.includes('execution.remote'));p=I.proof60('java-rmi60','msfconsole java_rmi_server','Meterpreter session 2 opened');assert(p.success&&p.facts.includes('execution.remote'));});
test('Log4Shell request transmission alone is not proof',()=>{let p=I.proof60('log4shell60','curl -H "User-Agent: ${jndi:ldap://x/OBOL_LOG4J_OK}" https://host','HTTP/1.1 200 OK');assert(!p.success&&!p.facts.includes('vuln.log4shell'));p=I.proof60('log4shell60','nuclei -id CVE-2021-44228','[CVE-2021-44228] [critical] https://host');assert(p.success&&p.facts.includes('vuln.log4shell'));});
test('Tomcat manager authentication and execution remain distinct',()=>{let p=I.proof60('tomcat-jboss60','curl -u u:p https://host/manager/text/list','OK - Listed applications for virtual host');assert(p.success&&p.facts.includes('access.web_admin')&&!p.facts.includes('execution.remote'));p=I.proof60('tomcat-jboss60','msfconsole tomcat_mgr_deploy','Command shell session 1 opened');assert(p.success&&p.facts.includes('execution.remote'));});
test('Veeam context does not become credentials without explicit material',()=>{let p=I.proof60('veeam60','Get-Service Veeam*','VeeamBackupSvc Running');assert(p.success&&p.facts.includes('service.veeam')&&!p.facts.includes('credential.reusable'));p=I.proof60('veeam60','VeeamHax.exe --target host','Username: lab\\backup Password: TrainingOnly123!');assert(p.success&&p.facts.includes('credential.reusable'));});
test('Kerberos relay keeps relay and ticket material below privilege',()=>{let p=I.proof60('kerberos-relay60','python3 krbrelayx.py -t ldaps://dc','Successfully relayed authentication');assert(p.success&&p.facts.includes('relay.kerberos')&&!p.facts.includes('access.system'));p=I.proof60('kerberos-relay60','python3 krbrelayx.py -t http://ca','ticket saved to admin.ccache');assert(p.success&&p.facts.includes('kerberos.tickets')&&!p.facts.includes('access.admin'));});
test('dashboard exposes v6.0 progress and release quality',()=>{const d=C.northStarDashboard60(C.newState(),lanes);assert.strictEqual(d.canonicalAdvance60.toImplemented,87);assert.strictEqual(d.gapWave60.remainingGaps,6);assert.strictEqual(d.releaseQuality60.clean,true);assert(d.milestones.some(x=>x.release==='v6.0'&&x.implemented===87));assert(d.milestones.some(x=>x.release==='v5.9'&&x.implemented===82));});
test('lightweight release smoke validation passes',()=>{const r=cp.spawnSync(process.execPath,[path.join(root,'tools','release-smoke.js')],{cwd:root,encoding:'utf8'});assert.strictEqual(r.status,0,r.stderr||r.stdout);assert((r.stdout||'').includes('Release smoke validation passed'));});
test('historical regression suites are future-safe',()=>{const r=cp.spawnSync(process.execPath,[path.join(root,'tools','validate-historical-tests.js')],{cwd:root,encoding:'utf8'});assert.strictEqual(r.status,0,r.stderr||r.stdout);assert((r.stdout||'').includes('Historical test future-safety validation passed'));});
test('tiered workflow avoids full regressions on ordinary release commits',()=>{const workflow=fs.readFileSync(path.join(root,'.github','workflows','tests.yml'),'utf8');assert(/\n  smoke:\n/.test(workflow));assert(workflow.includes('node tools/release-smoke.js'));assert(workflow.includes("contains(github.event.head_commit.message, '[preflight]')"));assert(workflow.includes("contains(github.event.head_commit.message, '[release-final]')"));assert(workflow.includes('node tools/validate-historical-tests.js'));const preflightBlock=workflow.slice(workflow.indexOf('\n  preflight:'),workflow.indexOf('\n  test:'));assert(preflightBlock.includes("'[preflight]'"));assert(preflightBlock.includes("'[release-final]'"));});
test('release quality gate passes the live repository model',()=>{const r=cp.spawnSync(process.execPath,[path.join(root,'tools','validate-release-quality.js')],{cwd:root,encoding:'utf8'});assert.strictEqual(r.status,0,r.stderr||r.stdout);assert((r.stdout||'').includes('0 implemented-quality repairs, 0 mapped-delivery repairs'));assert(/\d+ canonical gaps/.test(r.stdout||''));});
test('release PR validator accepts current contract and rejects wrong branch',()=>{const tool=path.join(root,'tools','validate-release-pr.js'),eventPath=path.join(os.tmpdir(),'obol-release-pr-event-v60.json'),readme=fs.readFileSync(path.join(root,'README.md'),'utf8'),current=readme.match(/Current release: \*\*v(\d+\.\d+)\*\*/);assert(current,'current release marker');const version=current[1],body='## Summary\n'+('Release summary. '.repeat(50))+'\n## Canonical methodology accounting\nCurrent accounting retained.\n## Conservative Evidence boundaries\nProof stays bounded.\n## Release wiring\nWired.\n## Regression coverage\nCovered.\n## Compatibility\nCompatible.';fs.writeFileSync(eventPath,JSON.stringify({pull_request:{head:{ref:`release/obol-v${version}`},title:`Obol v${version} — release contract fixture`,body}}));let r=cp.spawnSync(process.execPath,[tool],{cwd:root,env:{...process.env,GITHUB_EVENT_NAME:'pull_request',GITHUB_EVENT_PATH:eventPath},encoding:'utf8'});assert.strictEqual(r.status,0,r.stderr||r.stdout);fs.writeFileSync(eventPath,JSON.stringify({pull_request:{head:{ref:`build/obol-v${version}`},title:`Obol v${version} — wrong branch`,body}}));r=cp.spawnSync(process.execPath,[tool],{cwd:root,env:{...process.env,GITHUB_EVENT_NAME:'pull_request',GITHUB_EVENT_PATH:eventPath},encoding:'utf8'});assert.notStrictEqual(r.status,0);fs.unlinkSync(eventPath);});
test('live CI event satisfies the release PR contract',()=>{const r=cp.spawnSync(process.execPath,[path.join(root,'tools','validate-release-pr.js')],{cwd:root,env:process.env,encoding:'utf8'});assert.strictEqual(r.status,0,r.stderr||r.stdout);});
test('v6.0 release wiring remains present',()=>{const idx=fs.readFileSync(path.join(root,'index.html'),'utf8'),readme=fs.readFileSync(path.join(root,'README.md'),'utf8'),changelog=fs.readFileSync(path.join(root,'CHANGELOG.md'),'utf8');for(const x of ['methodology-v6.0.js','dashboard-v6.0.js','core-v6.0.js','intake-v6.0.js','app-v6.0.js','obol-v6.0.css'])assert(idx.includes(x),x);assert(/Current release: \*\*v\d+\.\d+\*\*/.test(readme));assert(changelog.includes('## v6.0'));for(const x of ['tools/release-smoke.js','tools/validate-historical-tests.js'])assert(fs.existsSync(path.join(root,x)),x);assert(fs.existsSync(path.join(root,'docs','v6.0.md')));const self=fs.readFileSync(path.join(root,'tests','run-v6.0-tests.js'),'utf8');assert(self.includes('validate-release-pr.js'));assert(self.includes('validate-historical-tests.js'));});
test('README Build Next generator remains structurally valid after v6.0',()=>{const out=cp.execFileSync(process.execPath,[path.join(root,'tools','sync-readme-build-next.js'),'--print'],{encoding:'utf8'});assert(/\d+ canonical gaps/.test(out));assert(/\d+\/127 fully implemented \(\d+%\)/.test(out));assert(out.includes('North Star Dashboard → Build Next'));});
test('sanitized export advances to v6.0 while retaining secret redaction',()=>{const s=C.newState();C.addTypedArtifact(s,'secrets','DoNotExport!',{});const safe=C.sanitizedCopy(s);assert.strictEqual(safe.obolVersion,'6.0.0');assert.strictEqual(safe.typedArtifacts.secrets[0].value,'[REDACTED SECRET]');});

console.log(`\n${passed} v6.0 tests passed`);
