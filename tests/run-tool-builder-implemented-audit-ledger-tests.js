'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const sandbox={window:null,globalThis:null,location:{hash:'#/tools'},navigator:{clipboard:{writeText(){return Promise.resolve();}}},localStorage:{getItem(){return null;},setItem(){}},document:{head:{appendChild(node){if(node&&typeof node.onload==='function')node.onload();}},documentElement:{appendChild(node){if(node&&typeof node.onload==='function')node.onload();}},createElement(tag){return {tagName:String(tag||'').toUpperCase(),dataset:{},style:{},children:[],appendChild(child){this.children.push(child);return child;},setAttribute(){},addEventListener(){},querySelector(){return null;},querySelectorAll(){return[];},innerHTML:'',textContent:'',onload:null,onerror:null};},getElementById(){return null;},querySelector(){return null;},querySelectorAll(){return[];}},addEventListener(){},setTimeout(fn){if(typeof fn==='function')fn();},setInterval(){return 1;},MutationObserver:function(){this.observe=function(){};this.disconnect=function(){};},console};
sandbox.window=sandbox.globalThis=sandbox;
sandbox.OBOL_INTAKE_V21={analyzeTerminal:text=>({activities:[],raw:String(text||'')})};
vm.createContext(sandbox);
[
 'data/tool-builder-schema.js',
 'data/tool-builder-inventory.js',
 'assets/tool-builder-current.js',
 'data/tool-builders.js',
 'assets/tool-builder-evidence-current.js',
 'data/tool-builders-auth-enum-current.js',
 'data/product-hardening/tool-builder-backlog-current.js',
 'data/product-hardening/tool-builder-discovery-current.js',
 'data/product-hardening/credential-helper-tool-builders-current.js',
 'data/product-hardening/privesc-helper-tool-builders-current.js',
 'data/product-hardening/tool-builder-shared-plumbing-current.js',
 'data/product-hardening/database-tool-builders-current.js',
 'data/product-hardening/tool-builder-implemented-audit-current.js'
].forEach(file=>vm.runInContext(read(file),sandbox,{filename:file}));
const schema=sandbox.OBOL_TOOL_BUILDER_SCHEMA;
const runtime=sandbox.OBOL_TOOL_BUILDER;
const audit=sandbox.OBOL_TOOL_BUILDER_IMPLEMENTED_AUDIT_CURRENT;
assert(schema&&typeof schema.all==='function','Tool Builder schema should load');
assert(runtime&&typeof runtime.compile==='function','Tool Builder runtime should load');
assert(audit&&audit.policy.commandGenerationIsNotProofGated===true,'implemented audit should expose the no-proof-gating policy');
const builders=schema.all();
const snapshot=audit.snapshot();
assert(builders.length>=25,'audit should cover the implemented builder surface, not only the database slice');
assert.strictEqual(snapshot.total,builders.length,'audit ledger should cover every registered implemented builder');
for(const row of snapshot.records){
 assert(row.builderId&&row.tool,'audit row should preserve builder and tool identity');
 assert(['passes-guidance-contract','fails-guidance-contract'].includes(row.status),'audit row should use explicit pass/fail status');
 assert(Array.isArray(row.issues),'audit row should expose issue list');
}
for(const id of ['tb-mysql','tb-psql','tb-redis-cli','tb-odat','tb-impacket-mssqlclient']){
 const row=snapshot.records.find(r=>r.builderId===id);
 assert(row,id+' should appear in implemented-builder audit ledger');
 assert.strictEqual(row.status,'passes-guidance-contract',id+' should pass after the database operator-guidance repair');
 assert(row.hasOperatorGuide&&row.actionCount>=6,id+' should expose meaningful operator guidance and actions');
 assert(row.proofGateFree,id+' should not use proof-gating language on the command-generation surface');
}
for(const id of ['tb-nmap','tb-nxc','tb-hashcat','tb-john','tb-ffuf','tb-gobuster-ferox','tb-hydra','tb-kerbrute']){
 const row=snapshot.records.find(r=>r.builderId===id);
 assert(row,id+' should appear in implemented-builder audit ledger');
 assert.strictEqual(row.status,'fails-guidance-contract',id+' should remain queued for family repair instead of being silently accepted');
 assert(row.issues.includes('missing operatorGuide')||row.issues.some(x=>/operatorGuide/.test(x)),id+' failure should name the missing operator guidance contract');
}
assert(snapshot.failCount>snapshot.passCount,'the audit should expose that most old implemented builders still need repair');
const next=audit.nextRepairBatches();
assert(next.length>=3,'audit should group failures into repair batches');
assert(next.some(batch=>batch.id==='web-discovery-http'),'web discovery/HTTP should be a queued repair family');
assert(next.some(batch=>batch.id==='credentials-cracking-auth'),'credential/auth/cracking should be a queued repair family');
assert(next.every(batch=>/without proof-gating command generation/.test(batch.goal)),'repair batches should carry the no-proof-gating rule');
const psql=runtime.compile(schema.get('tb-psql'),{action:'copyProgramExec',host:'203.0.113.77',port:'5432',username:'postgres',database:'postgres',sslMode:'prefer',osCommand:'id'},{});
assert(psql.includes('COPY')&&psql.includes('PROGRAM')&&psql.includes('id'),'COPY PROGRAM command generation should not require prior Evidence or a proof checkbox');
const mssql=runtime.compile(schema.get('tb-impacket-mssqlclient'),{action:'xpWhoami',target:'203.0.113.40',identityScope:'domain',domain:'CORP',username:'alice',authMode:'password',password:'Secret123',port:'1433',windowsAuth:true},{});
assert(mssql.includes('xp_cmdshell')&&mssql.includes('whoami'),'xp_cmdshell command generation should not require prior Evidence or a proof checkbox');
const source=read('data/product-hardening/database-tool-builders-current.js');
assert(!/proof-gated|risk-gated|evidence-gated|Run gated|Try gated|Generate a gated|Risk gate:/i.test(source),'database Tools text should use risk/proof-boundary labels, not proof-gating language');
const queue=read('docs/TOOL-BUILDER-BUILD-QUEUE.md');
assert(queue.includes('Implemented Tool Builder audit ledger'),'Tool Builder queue should make the audit ledger the active Build 2 item');
assert(queue.includes('Do not proof-gate command generation'),'queue should preserve Brandon\'s direct Tools-page rule');
const doc=read('docs/TOOL-BUILDER-IMPLEMENTED-AUDIT-LEDGER.md');
assert(doc.includes('Database builders pass')&&doc.includes('family repair batches'),'audit doc should summarize pass/fail outcome and next repair batches');
console.log('Tool Builder implemented audit ledger validation passed.');
