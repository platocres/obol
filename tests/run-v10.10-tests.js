'use strict';
const assert=require('assert');
const cp=require('child_process');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
function load(ctx,file){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});}
function makeContext(){
 const store=new Map();
 const ctx={console,setTimeout(fn){fn();return 0;},clearTimeout(){},location:{hash:'#/tools/burp-suite'},addEventListener(){},removeEventListener(){},localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}};
 ctx.OBOL_INTAKE_V21={analyzeTerminal(){return {activities:[]};}};
 ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);return ctx;
}
function versionAtLeast(label,minor){const m=String(label||'').match(/^v10\.(\d+)/);return !!m&&Number(m[1])>=minor;}
const ctx=makeContext();
[
 'data/tool-builder-schema.js',
 'data/tool-builder-inventory.js',
 'assets/tool-builder-current.js',
 'data/tool-builders.js',
 'data/tool-builders-tunnels.js',
 'data/tool-builder-ligolo-current.js',
 'data/tool-builders-auth-enum-current.js',
 'data/tool-builders-helper-current.js',
 'data/tool-builders-web-scan-current.js',
 'assets/tool-builder-evidence-current.js',
 'assets/tool-builder-helper-evidence-current.js',
 'assets/tool-builder-web-evidence-current.js',
 'data/product-hardening/tool-builder-discovery-current.js',
 'data/product-hardening/tool-builder-backlog-current.js',
 'data/current-release.js'
].forEach(file=>load(ctx,file));
assert(ctx.OBOL_TOOL_BUILDER_DISCOVERY_CURRENT,'compact discovery current owner should load');
assert(ctx.OBOL_BURP_TOOL_BUILDER_CURRENT,'Burp Suite owner should publish install state');
assert.strictEqual(ctx.OBOL_BURP_TOOL_BUILDER_CURRENT.installedBuilder,true,'Burp Suite builder should install once schema is ready');
assert.strictEqual(ctx.OBOL_BURP_TOOL_BUILDER_CURRENT.patchedEvidence,true,'Burp Suite Evidence should patch the shared Tool Builder Evidence API');
assert.strictEqual(ctx.OBOL_BURP_TOOL_BUILDER_CURRENT.installedIntake,true,'Burp Suite Evidence should patch intake when intake is available');
for(const alias of ['burp suite','burp-suite','burpsuite','burp']){
 const record=ctx.OBOL_TOOL_BUILDER_INVENTORY.get(alias);
 assert(record,alias+' should resolve to an inventory record');
 assert.strictEqual(record.status,'implemented',alias+' should no longer fall through to legacy/examples');
 assert.strictEqual(record.queueItem,'tb-burp-suite');
}
const builder=ctx.OBOL_TOOL_BUILDER_SCHEMA.get('tb-burp-suite');
assert(builder,'Burp Suite should register a first-class schema-driven builder');
assert.strictEqual(ctx.OBOL_TOOL_BUILDER_SCHEMA.validateBuilder(builder).length,0,'Burp Suite builder must satisfy schema');
assert.strictEqual(builder.executionContext,'any','Burp is a third-party GUI workflow, not a terminal-only Kali scanner');
assert(builder.fields.some(field=>field.id==='workflow'),'Burp builder should expose workflow choice control');
assert(builder.fields.some(field=>field.id==='proxyHost')&&builder.fields.some(field=>field.id==='proxyPort'),'Burp builder should expose proxy host/port controls');
assert(builder.fields.some(field=>field.id==='payloadPosition'),'Burp Intruder handoff should expose payload-position guidance');
assert(builder.fields.some(field=>field.id==='attackType'),'Burp Intruder handoff should expose attack-type selection');
assert(builder.fields.some(field=>field.id==='payloadProcessing'),'Burp Intruder handoff should expose payload processing/encoding notes');
assert(builder.fields.some(field=>field.id==='grepMatch'),'Burp Intruder handoff should expose grep match/extract tracking');
assert(builder.fields.some(field=>field.id==='rateBoundary'),'Burp Intruder handoff should expose scope/rate boundary selection');
assert(builder.evidence.proofBoundary.includes('guided third-party GUI handoff'),'Burp proof boundary should name the non-terminal handoff boundary');
const context=Object.freeze({target:Object.freeze({value:'https://app.corp.example',ip:'203.0.113.90',hostname:'app.corp.example'}),context:Object.freeze({domain:'corp.example',username:'alice',port:'443',lhost:'198.51.100.77',lport:'9001',baseDn:'DC=corp,DC=example'}),workspace:Object.freeze({wordlist:'/usr/share/seclists/Discovery/Web-Content/common.txt',outputDir:'scans/web',hashfile:'audit-hash-material.txt',transferUrl:'http://198.51.100.77:8000/audit.bin'})});
function command(values){return ctx.OBOL_TOOL_BUILDER.compile(builder,values||{},context);}
const minimum=command();
assert(minimum.startsWith('burpsuite # Burp handoff: proxy for https://app.corp.example via proxy 127.0.0.1:8080'),minimum);
assert(minimum.includes('Configure browser burp-browser through Burp Proxy'),'minimum Burp preview should be a launch plus operator handoff, not fake GUI control');
const intruder=command({workflow:'intruder',requestFile:'requests/login.req',payloadPosition:'username=§FUZZ§',attackType:'sniper',wordlist:'/usr/share/seclists/Usernames/top-usernames-shortlist.txt',payloadProcessing:'URL-encode only; preserve transform order',grepMatch:'Invalid password|Welcome|Set-Cookie',rateBoundary:'short-contextual'});
assert(intruder.includes('Send requests/login.req to Intruder'),intruder);
assert(intruder.includes('use sniper'),intruder);
assert(intruder.includes('username=§FUZZ§'),intruder);
assert(intruder.includes('/usr/share/seclists/Usernames/top-usernames-shortlist.txt'),intruder);
assert(intruder.includes('Preserve payload processing/encoding exactly: URL-encode only; preserve transform order'),intruder);
assert(intruder.includes('Track grep match/extract marker: Invalid password|Welcome|Set-Cookie'),intruder);
assert(intruder.includes('Burp Intruder deltas are triage until manual replay proves impact'),intruder);
for(const built of [minimum,intruder])for(const blocked of ['10.10.10.10','10.10.14.9','domain.local','Password123!','8846f7eaee8fb117ad06bdd830b7586c','hashes.txt'])assert(!built.includes(blocked),'Burp command leaked blocked placeholder '+blocked+': '+built);
let missing=false;
try{ctx.OBOL_TOOL_BUILDER.compile(builder,{}, {target:{},context:{},workspace:{}});}catch(err){missing=/target/i.test(String(err&&err.message||err));}
assert(missing,'missing Burp target should remain a missing-field state, not a fake runnable command');
const sample='Burp Suite Repeater\nGET /login?next=/admin HTTP/1.1\nHost: app.corp.example\nCookie: session=secret\n\nHTTP/1.1 302 Found\nLocation: /admin\nSet-Cookie: session=rotated\n\nIntruder attack\nPayload position username=§FUZZ§\nPayload Processing: URL-encode payloads\nGrep - Match: Welcome\nStatus Length\n1 200 3210\nCommunity Version throttled resource pool\n\nIssue detail\nSeverity: Medium\nConfidence: Firm\nReflected input observed in response body';
const analysis=ctx.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT.analyzeForBuilder('tb-burp-suite',sample);
assert.strictEqual(analysis.analyzer,'tool-builder-burp-evidence-current');
assert.strictEqual(analysis.cardId,'web-content-discovery-and-fingerprinting');
assert(analysis.outcomeFacts.includes('web.burp_request_response_observed'),'Burp analyzer should recognize pasted request/response pairs');
assert(analysis.outcomeFacts.includes('web.burp_scanner_issue_observed'),'Burp analyzer should recognize Scanner issue detail');
assert(analysis.outcomeFacts.includes('web.burp_vulnerability_lead_observed'),'Burp analyzer should keep vulnerability-like behavior as a lead');
assert(analysis.outcomeFacts.includes('web.burp_payload_transform_observed'),'Burp analyzer should recognize payload processing/encoding as proof-state context');
assert(analysis.outcomeFacts.includes('web.burp_rate_or_scope_boundary_observed'),'Burp analyzer should recognize rate/scope limits from the mined Burp notes');
assert(!analysis.redactedSample.includes('session=secret'),'Burp analyzer should redact pasted cookies');
const intake=ctx.OBOL_INTAKE_V21.analyzeTerminal(sample);
assert(intake.activities.some(activity=>activity.builderId==='tb-burp-suite'&&activity.title==='Burp Suite Evidence'),'Burp Evidence should flow through intake activities');
const audit=ctx.OBOL_TOOL_BUILDER_IMPLEMENTATION_AUDIT_CURRENT;
assert(audit,'v10.08+ audit API must still load');
const failures=Array.from(audit.validateImplementedBuilders());
assert.strictEqual(failures.length,0,failures.join('\n'));
assert(audit.modeledRecords().length>0,'remaining modeled tools should still be queued after Burp promotion');
assert.strictEqual(ctx.OBOL_CURRENT_RELEASE.phase,'product-hardening');
assert(versionAtLeast(ctx.OBOL_CURRENT_RELEASE.label,10),'current release should remain at or after the Burp release');
assert(ctx.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/tool-builder-discovery-current.js'),'current release should load compact discovery current owner');
assert(!ctx.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/burp-suite-tool-builder-v10.10.js'),'v10.10 Burp release layer must not remain live after consolidation');
const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
assert(/Current release: \*\*v\d+\.\d+(?:\.\d+)?\*\*/.test(readme),'README should identify a current release');
assert(readme.includes('Remaining modeled tool implementation backlog'),'README should keep the modeled backlog active');
const docs=fs.readFileSync(path.join(root,'docs/TOOL-BUILDER-BUILD-QUEUE.md'),'utf8');
assert(docs.includes('Current ownership hygiene'),'Tool Builder queue doc should name the current-owner consolidation rule');
assert(docs.includes('browser/request utilities'),'Tool Builder queue doc should keep adjacent web request-helper work visible');
const release=cp.spawnSync(process.execPath,['tools/validate-release-pr.js','--repo-only'],{cwd:root,encoding:'utf8'});
if(release.status!==0){process.stdout.write(release.stdout||'');process.stderr.write(release.stderr||'');process.exit(release.status||1);}
process.stdout.write(release.stdout||'');
console.log('v10.10 Burp Suite guided Tool Builder remains covered by compact current owner.');
