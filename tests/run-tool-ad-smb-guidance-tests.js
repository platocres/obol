'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
function stubEl(){return{dataset:{},style:{},children:[],closest(){return null;},setAttribute(){},appendChild(child){this.children.push(child);return child;},querySelector(){return null;},querySelectorAll(){return[];},addEventListener(){},innerHTML:'',textContent:''};}
const sandbox={window:null,globalThis:null,location:{hash:'#/tools'},navigator:{clipboard:{writeText(){return Promise.resolve();}}},localStorage:{getItem(){return null;},setItem(){}},document:{head:{appendChild(node){if(node&&typeof node.onload==='function')node.onload();}},documentElement:{appendChild(node){if(node&&typeof node.onload==='function')node.onload();}},createElement(){return stubEl();},getElementById(){return null;},querySelector(){return null;},querySelectorAll(){return[];}},addEventListener(){},setTimeout(fn){if(typeof fn==='function')fn();},setInterval(){return 1;},MutationObserver:function(){this.observe=function(){};this.disconnect=function(){};},console,module:{exports:{}}};
sandbox.window=sandbox.globalThis=sandbox;
sandbox.OBOL_INTAKE_V21={analyzeTerminal:text=>({activities:[],raw:String(text||'')})};
vm.createContext(sandbox);
[
 'data/tool-builder-schema.js',
 'data/tool-builder-inventory.js',
 'assets/tool-builder-current.js',
 'assets/tool-builder-evidence-current.js',
 'data/tool-builders.js',
 'data/tool-builders-web-scan-current.js',
 'data/tool-builders-auth-enum-current.js',
 'data/product-hardening/tool-builder-backlog-current.js',
 'data/product-hardening/tool-builder-discovery-current.js',
 'data/product-hardening/credential-helper-tool-builders-current.js',
 'data/product-hardening/privesc-helper-tool-builders-current.js',
 'data/product-hardening/remote-exec-tool-builders-current.js',
 'data/product-hardening/tool-builder-shared-plumbing-current.js',
 'data/product-hardening/database-tool-builders-current.js',
 'data/product-hardening/web-tool-guidance-current.js',
 'data/product-hardening/credential-auth-guidance-current.js',
 'data/product-hardening/ad-smb-remote-guidance-current.js',
 'data/product-hardening/tool-builder-implemented-audit-current.js'
].forEach(file=>vm.runInContext(read(file),sandbox,{filename:file}));
const schema=sandbox.OBOL_TOOL_BUILDER_SCHEMA;
const runtime=sandbox.OBOL_TOOL_BUILDER;
const guidance=sandbox.OBOL_AD_SMB_REMOTE_GUIDANCE_CURRENT;
const audit=sandbox.OBOL_TOOL_BUILDER_IMPLEMENTED_AUDIT_CURRENT;
assert(schema&&runtime&&guidance&&audit,'AD/SMB guidance stack should load');
const expected=['tb-smbclient','tb-smbmap','tb-enum4linux-ng','tb-ldapsearch','tb-ad-rpcclient','tb-responder','tb-evilwinrm','tb-certipy','tb-impacket-psexec','tb-impacket-wmiexec','tb-impacket-smbexec','tb-impacket-dcomexec','tb-impacket-atexec'];
assert.deepStrictEqual(Array.from(guidance.builderIds),expected,'AD/SMB repair must cover the full queued family');
assert.strictEqual(guidance.family,'ad-smb-remote-access');
assert.strictEqual(guidance.schemaValidated,true,'AD/SMB repair should use schema validation');
assert.strictEqual(guidance.installed,true,'AD/SMB guidance should install cleanly: '+(guidance.failures||[]).join('; '));
const snapshot=audit.snapshot();
for(const id of expected){
 const builder=schema.get(id);
 assert(builder,id+' should be registered');
 assert.strictEqual(schema.validateBuilder(builder).length,0,id+' schema record should validate cleanly after repair');
 assert(builder.operatorGuide&&builder.operatorGuide.actionField,id+' operatorGuide must live on the schema record');
 const actionField=builder.operatorGuide.actionField;
 const actionControl=(builder.fields||[]).find(field=>field.id===actionField);
 assert(actionControl&&actionControl.type==='select',id+' action field should be a real select behind GUI mode buttons');
 const options=new Set((actionControl.options||[]).map(option=>String(option.value)));
 builder.operatorGuide.actions.forEach(action=>{
  assert(options.has(String(action.value)),id+' guide action '+action.value+' must be selectable by the GUI');
  ['useWhen','requires','proves','notProve','evidence','next'].forEach(key=>assert(String(action[key]||'').trim(),id+' action '+action.value+' missing '+key));
 });
 assert(Array.isArray(builder.fieldGroups)&&builder.fieldGroups.length>=3,id+' fieldGroups must live on the schema record');
 const claimed=new Set();
 builder.fieldGroups.forEach(group=>{
  assert(group.title&&group.description&&group.description.length>20,id+' group needs an operator-facing description');
  (group.fields||[]).forEach(field=>claimed.add(field));
 });
 assert(!claimed.has(actionField),id+' should not group its hidden mode-driver field');
 const leftovers=(builder.fields||[]).filter(field=>field.id!==actionField&&!claimed.has(field.id)).map(field=>field.id);
 assert.strictEqual(leftovers.length,0,id+' should not leak ungrouped fields into More options: '+leftovers.join(', '));
 assert((builder.fields||[]).some(field=>Array.isArray(field.presets)&&field.presets.length>=2),id+' should provide schema-owned clickable presets');
 const row=snapshot.records.find(record=>record.builderId===id);
 assert(row,id+' should appear in the implemented audit ledger');
 assert.strictEqual(row.family,'ad-smb-remote-access',id+' should audit under the AD/SMB/remote-access family');
 assert.strictEqual(row.status,'passes-guidance-contract',id+' should pass guidance audit: '+(row.issues||[]).join(', '));
}
const next=audit.nextRepairBatches();
assert(!next.some(batch=>batch.id==='ad-smb-remote-access'),'AD/SMB/remote-access should no longer be a repair batch');
assert(next.some(batch=>batch.id==='network-service-enum'),'network/service enumeration should now be the next broad repair batch');
const current=read('data/current-release.js');
assert(current.indexOf('data/product-hardening/remote-exec-tool-builders-current.js')<current.indexOf('data/product-hardening/ad-smb-remote-guidance-current.js'),'current release should load remote exec before AD/SMB guidance');
assert(read('assets/runtime-current.js').includes('data/product-hardening/ad-smb-remote-guidance-current.js'),'Evidence route lazy loading should include the AD/SMB analyzer owner');
console.log('AD/SMB Tool Builder guidance and audit validation passed.');
