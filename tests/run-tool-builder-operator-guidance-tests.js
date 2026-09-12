'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const sandbox={window:{},globalThis:null,location:{hash:'#/tools'},localStorage:{getItem(){return null;},setItem(){}},addEventListener(){},setTimeout(fn){fn();},setInterval(){return 1;},document:{head:{appendChild(){}},documentElement:{appendChild(){}},createElement(){return {dataset:{},style:{},setAttribute(){},appendChild(){},querySelector(){return null;},querySelectorAll(){return[];},addEventListener(){},innerHTML:'',textContent:''};},getElementById(){return null;},querySelector(){return null;},querySelectorAll(){return[];}}};
sandbox.window=sandbox.globalThis=sandbox;
vm.createContext(sandbox);
['data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','data/product-hardening/tool-builder-backlog-current.js','data/product-hardening/tool-builder-shared-plumbing-current.js','data/product-hardening/database-tool-builders-current.js'].forEach(file=>vm.runInContext(read(file),sandbox,{filename:file}));
const schema=sandbox.OBOL_TOOL_BUILDER_SCHEMA;
const runtime=sandbox.OBOL_TOOL_BUILDER;
const owner=sandbox.OBOL_DATABASE_TOOL_BUILDERS_CURRENT;
assert(owner&&owner.operatorGuidanceRepair===true,'database owner should expose operator guidance repair');
const required={
 'tb-mysql':['identity','listDatabases','listTables','describeTable','readSample','showGrants','secureFilePriv','filePrivilege','loadFile','udfPrecheck'],
 'tb-psql':['identity','listDatabases','listSchemas','listTables','describeTable','scopedQuery','rolePrivileges','superuserCheck','copyProgramCheck','copyProgramExec'],
 'tb-redis-cli':['ping','info','keyspace','aclWhoami','getKey','configPaths','writeRisk'],
 'tb-odat':['sidguesser','passwordguesser','tnscmd','utlfile','dbmsscheduler','externaltable'],
 'tb-impacket-mssqlclient':['identity','version','listDatabases','scopedQuery','roleCheck','xpStatus','enableXpCmdshell','xpWhoami','xpCommand']
};
for(const [id,actions] of Object.entries(required)){
 const builder=schema.get(id);
 assert(builder,id+' should be registered');
 assert(builder.operatorGuide,id+' should have an operator guide');
 assert(builder.operatorGuide.summary&&builder.operatorGuide.summary.length>80,id+' should explain when and why to use the tool');
 assert((builder.operatorGuide.startHere||[]).length>=3,id+' should provide start-here instructions');
 const values=(builder.operatorGuide.actions||[]).map(a=>a.value);
 for(const action of actions)assert(values.includes(action),id+' missing action preset '+action);
 for(const action of builder.operatorGuide.actions){
  for(const key of ['label','useWhen','requires','proves','notProve','evidence'])assert(action[key]&&String(action[key]).length>8,id+' action '+action.value+' missing '+key);
 }
}
const dbSource=read('data/product-hardening/database-tool-builders-current.js');
assert(dbSource.includes('data-tool-builder-preset'),'preset buttons should be rendered as real controls');
assert(dbSource.includes('dispatchEvent(new Event(\'change\''),'preset buttons should dispatch change events into the real form');
assert(dbSource.includes('data-database-guidance-summary'),'fake separate mode chips should be replaced with a non-clickable summary on database routes');
assert(dbSource.includes('aria-hidden'),'empty accessories should be hidden, not visually presented as useful recommendations');
assert(dbSource.includes('tool-builder-preview code'),'mobile command preview wrapping should be patched');
assert(!/proof-gated|risk-gated|evidence-gated|Run gated|Try gated|Generate a gated|Risk gate:/i.test(dbSource),'database Tools text should use risk notes and proof boundaries, not proof-gating language');
const psql=schema.get('tb-psql');
const copyProgram=runtime.compile(psql,{action:'copyProgramExec',host:'203.0.113.77',port:'5432',username:'postgres',database:'postgres',sslMode:'prefer',osCommand:'id'},{});
assert(copyProgram.includes('COPY')&&copyProgram.includes('PROGRAM')&&copyProgram.includes('id'),'COPY PROGRAM command generation must not be proof-gated by prior Evidence or confirmation checkboxes');
const mssql=schema.get('tb-impacket-mssqlclient');
const xpEnable=runtime.compile(mssql,{action:'enableXpCmdshell',target:'203.0.113.40',identityScope:'domain',domain:'CORP',username:'alice',authMode:'password',password:'Secret123',port:'1433',windowsAuth:true},{});
assert(xpEnable.includes('sp_configure')&&xpEnable.includes('xp_cmdshell'),'xp_cmdshell command generation must not be proof-gated by prior Evidence or confirmation checkboxes');
const queue=read('docs/TOOL-BUILDER-BUILD-QUEUE.md');
assert(queue.includes('Implemented Tool Builder audit ledger'),'queue should make the implemented-builder audit ledger the first Tool Builder batch after database repair');
assert(queue.includes('Do not proof-gate command generation'),'queue should preserve Brandon\'s direct Tools-page rule');
const handoff=read('docs/TOOL-BUILDER-OPERATOR-GUIDANCE-AUDIT.md');
assert(handoff.includes('Brandon should not have to critique every tool by hand'),'handoff should preserve the user-facing reason for the audit');
assert(handoff.includes('Database-specific repair expectations'),'handoff should include database-specific repair expectations');
assert(handoff.includes('COPY PROGRAM')&&handoff.includes('xp_cmdshell'),'handoff should cover common database-to-OS command execution paths');
assert(handoff.includes('Command generation is not proof-gated'),'handoff should preserve the no-proof-gating rule');
console.log('Tool Builder operator guidance contract validation passed.');
