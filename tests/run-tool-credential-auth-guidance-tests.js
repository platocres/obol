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
 'data/tool-builders.js',
 'data/tool-builders-web-scan-current.js',
 'data/tool-builders-auth-enum-current.js',
 'data/product-hardening/tool-builder-backlog-current.js',
 'data/product-hardening/tool-builder-discovery-current.js',
 'data/product-hardening/credential-helper-tool-builders-current.js',
 'data/product-hardening/privesc-helper-tool-builders-current.js',
 'data/product-hardening/tool-builder-shared-plumbing-current.js',
 'data/product-hardening/database-tool-builders-current.js',
 'data/product-hardening/web-tool-guidance-current.js',
 'data/product-hardening/credential-auth-guidance-current.js',
 'data/product-hardening/tool-builder-implemented-audit-current.js'
].forEach(file=>vm.runInContext(read(file),sandbox,{filename:file}));
const schema=sandbox.OBOL_TOOL_BUILDER_SCHEMA;
const runtime=sandbox.OBOL_TOOL_BUILDER;
const guidance=sandbox.OBOL_CREDENTIAL_AUTH_GUIDANCE_CURRENT;
const audit=sandbox.OBOL_TOOL_BUILDER_IMPLEMENTED_AUDIT_CURRENT;
assert(schema&&runtime&&guidance&&audit,'credential/auth guidance stack should load');
assert.strictEqual(typeof schema.replace,'function','schema should expose a validated builder replacement API');
assert.strictEqual(guidance.family,'credentials-cracking-auth');
assert.strictEqual(guidance.schemaValidated,true,'credential/auth repair should use schema validation, not render-time shadow state');
assert.strictEqual(guidance.installed,true,'credential/auth guidance should install cleanly: '+(guidance.failures||[]).join('; '));
function previewText(html){const m=html.match(/tool-builder-preview[\s\S]*?<code[^>]*>([\s\S]*?)<\/code>/);return m?m[1].replace(/<[^>]+>/g,''):'';}
const expected=['tb-hashcat','tb-john','tb-hydra','tb-kerbrute','tb-cewl','tb-crunch','tb-hashid','tb-name-that-hash','tb-nxc','tb-secretsdump','tb-getnpusers','tb-getuserspns'];
const snapshot=audit.snapshot();
expected.forEach(id=>{
 const raw=schema.get(id);
 assert(raw,id+' should be registered');
 assert.strictEqual(schema.validateBuilder(raw).length,0,id+' raw schema record should validate cleanly after repair');
 assert(raw.operatorGuide&&raw.operatorGuide.actionField,id+' operatorGuide must live on the schema record');
 assert(Array.isArray(raw.fieldGroups)&&raw.fieldGroups.length>=3,id+' fieldGroups must live on the schema record');
 raw.fieldGroups.forEach(group=>assert(group.title&&group.description&&group.description.length>20,id+' group needs an operator-facing description'));
 const claimed=new Set();
 raw.fieldGroups.forEach(group=>(group.fields||[]).forEach(fid=>claimed.add(fid)));
 assert(!claimed.has(raw.operatorGuide.actionField),id+' should not group its hidden mode-driver field');
 const leftovers=(raw.fields||[]).filter(field=>field.id!==raw.operatorGuide.actionField&&!claimed.has(field.id)).map(field=>field.id);
 assert.deepStrictEqual(leftovers,[],id+' should not leak ungrouped fields into More options');
 assert((raw.fields||[]).some(field=>Array.isArray(field.presets)&&field.presets.length>=2),id+' should provide schema-owned clickable presets');
 const row=snapshot.records.find(r=>r.builderId===id);
 assert(row,id+' should appear in the implemented audit ledger');
 assert.strictEqual(row.status,'passes-guidance-contract',id+' should pass after the credential/auth guidance repair: '+(row.issues||[]).join(', '));
 assert(row.hasOperatorGuide&&row.hasProfile&&row.proofGateFree,id+' should expose profile/guidance without proof-gating language');
 const html=runtime.html(raw,{tool:raw.tool},{});
 assert.strictEqual((html.match(/<h3>/g)||[]).length,1,id+' should render exactly one heading');
 assert(html.includes('tb-modes')&&html.includes('tb-mode-ctx'),id+' should render outcome-labelled mode cards from schema-owned guidance');
 assert(html.includes('tb-group-head'),id+' should render grouped field sections');
 assert(html.includes('tb-preset'),id+' should render preset chips');
 assert(html.includes('tb-read-wrap'),id+' should render the Reading-the-output row');
 assert(!/>More options</.test(html),id+' should not render an ad-hoc More options wall');
 assert(/missing required fields|complete required fields to generate a command/i.test(previewText(html)),id+' empty state should be honest about missing required inputs');
 assert(!/10\.10\.10\.10/.test(previewText(html)),id+' empty preview must not fabricate a lab target');
});
assert(schema.replace(Object.assign({},schema.get('tb-hashid'))),'schema.replace should preserve and revalidate existing records');
const next=audit.nextRepairBatches();
assert(!next.some(batch=>batch.id==='web-discovery-http'),'web repair should remain complete');
assert(!next.some(batch=>batch.id==='credentials-cracking-auth'),'credential/auth/cracking repair should no longer be queued');
assert(next.some(batch=>batch.id==='ad-smb-remote-access'),'AD/SMB/remote-access should remain the next broad family while unrepaired builders still fail');
console.log('Credential/auth Tool Builder schema-record guidance validation passed.');
