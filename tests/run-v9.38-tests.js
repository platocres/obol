'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const cp=require('child_process');
const vm=require('vm');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/tool-builder-schema.js','data/tool-builders.js','assets/tool-builder-current.js','data/note-integration.js','data/note-integration-reviews.js','data/note-integration-packets.js','data/product-hardening/note-mechanic-backfill-v9.38.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const w=sandbox.window;
const schema=w.OBOL_TOOL_BUILDER_SCHEMA;
const renderer=w.OBOL_TOOL_BUILDER;
const backfill=w.OBOL_NOTE_MECHANIC_BACKFILL_V938;
assert(schema&&renderer&&backfill,'tool builder and v9.38 backfill owners must load');
assert.strictEqual(renderer.version,'1.2.0');
const ffuf=schema.get('tb-ffuf');
assert(ffuf,'ffuf builder must exist');
const effective=renderer.effectiveBuilder(ffuf);
assert(effective.fields.some(field=>field.id==='autoCalibration'),'ffuf current owner must expose auto-calibration');
assert(effective.command.tokens.some(token=>token.kind==='toggle'&&token.field==='autoCalibration'&&token.flag==='-ac'),'ffuf current owner must compile auto-calibration as -ac');
const calibrated=renderer.compile(ffuf,{url:'http://box.local/FUZZ',wordlist:'words.txt',autoCalibration:true},{});
assert(calibrated.includes(' -ac '),'enabled ffuf auto-calibration must emit -ac');
const plain=renderer.compile(ffuf,{url:'http://box.local/FUZZ',wordlist:'words.txt',autoCalibration:false},{});
assert(!plain.includes(' -ac '),'disabled ffuf auto-calibration must not emit -ac');
const curl=schema.get('tb-curl');
assert(renderer.effectiveBuilder(curl).fields.some(field=>field.id==='pathAsIs'),'v9.38 must preserve the earlier curl path-as-is mechanic');
assert.strictEqual(backfill.summarize().audited,14);
assert.strictEqual(backfill.summarize().remaining,113);
function run(args){
 const r=cp.spawnSync(process.execPath,args.map((p,i)=>i===0?path.join(root,p):p),{cwd:root,encoding:'utf8',env:process.env});
 process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');
 assert.strictEqual(r.status,0,(r.stderr||r.stdout||args.join(' ')+' failed').trim());
}
for(const args of [
 ['tools/validate-note-mechanic-backfill.js'],
 ['tools/validate-tool-builders.js'],
 ['tools/validate-note-integration.js'],
 ['tools/scope-check.js']
])run(args);
console.log('v9.38 reviewed-note mechanic backfill contract passed.');
