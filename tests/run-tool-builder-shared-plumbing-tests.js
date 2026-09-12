'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const helper=read('data/product-hardening/tool-builder-shared-plumbing-current.js');
const database=read('data/product-hardening/database-tool-builders-current.js');
const standard=read('docs/TOOL-BUILDER-IMPLEMENTATION-STANDARD.md');
for(const token of ['installSlice','patchInventory','patchEvidence','installIntake','safeRegister','redactSecrets','stateFrom','sharedPlumbingVersion']){
 assert(helper.includes(token),'shared plumbing helper should expose '+token);
}
assert(database.includes('OBOL_TOOL_BUILDER_SHARED_PLUMBING_CURRENT'),'database owner should depend on the shared Tool Builder plumbing helper');
assert(database.includes('p.installSlice(root'),'database owner should register through shared installSlice');
for(const repeated of ['function patchInventory(','function patchEvidence(','function installIntake(','function safeRegister(','function redact(','function stateFrom(','function common(']){
 assert(!database.includes(repeated),'database owner must not re-declare shared plumbing: '+repeated);
}
assert(standard.includes('Shared mechanics are owned by `data/product-hardening/tool-builder-shared-plumbing-current.js`'),'standard should name the shared helper as the canonical mechanics owner');
assert(standard.includes('Shared code owns mechanics. Tool profiles own judgment.'),'standard should keep mechanics/judgment separation explicit');
console.log('Tool Builder shared plumbing regression passed.');
