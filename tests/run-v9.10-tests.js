'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const run=args=>cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/product-hardening/product-hardening-queue.js','data/product-hardening/item-test-contracts.js','data/field-notes.js'])vm.runInContext(read(rel),sandbox,{filename:rel});

const q=sandbox.window.OBOL_PRODUCT_HARDENING;
const contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
const fieldNotes=sandbox.window.OBOL_FIELD_NOTES;
assert(q&&contracts&&fieldNotes,'v9.10 queue, contracts, and field-notes owners load');

const item=q.items.find(i=>i.id==='ux-progressive-notes');
assert(item,'progressive field-notes item remains in durable queue');
assert.strictEqual(item.status,'complete','progressive field-notes item remains complete');
assert(q.tracks.find(t=>t.id==='ui-ux').complete>=6,'UI/UX retains at least the six v9.10 completed items');
assert(!q.buildNext(1000).some(candidate=>candidate.id==='ux-progressive-notes'),'completed progressive-notes work does not return to Product Build Next');
const itemContract=contracts.contracts['ux-progressive-notes'];
assert(itemContract&&itemContract.acceptance.length&&itemContract.validationCommands.length&&itemContract.proofFiles.length,'progressive notes retains item-specific Definition of Done');
for(const rel of itemContract.proofFiles)assert(fs.existsSync(path.join(root,rel)),'progressive notes proof file exists: '+rel);

assert.strictEqual(fieldNotes.schemaVersion,'1.0.0','field-notes schema remains stable');
assert.strictEqual(fieldNotes.entries.length,0,'v9.10 ships the public presentation contract without fabricating or copying private note content');
const fixture=[
 {id:'one',title:'One',body:'Normalized guidance.',kind:'lesson',cardIds:['card-a'],sourceRefs:['note-1']},
 {id:'two',title:'Two',body:'Normalized tool guidance.',kind:'tool-guidance',toolIds:['nmap'],sourceRefs:['note-2']},
 {id:'three',title:'Three',body:'Normalized path guidance.',kind:'path-guidance',pathIds:['path'],sourceRefs:['note-3']}
];
assert.strictEqual(fieldNotes.relevant({cardId:'card-a'},fixture).length,1,'card matching returns one relevant fixture note');
assert.strictEqual(fieldNotes.relevant({toolId:'nmap'},fixture).length,1,'single tool matching returns one relevant fixture note');
assert.strictEqual(fieldNotes.relevant({toolIds:['curl','nmap']},fixture).length,1,'multi-tool card context matches relevant tool guidance');
assert.strictEqual(fieldNotes.relevant({pathId:'path'},fixture).length,1,'path matching returns one relevant fixture note');
assert.strictEqual(fieldNotes.relevant({cardId:'card-b'},fixture).length,0,'unrelated context stays clean');

const ui=read('assets/field-notes.js'),css=read('assets/field-notes.css'),bridge=read('assets/app-v8.8.js'),releaseDoc=read('docs/v9.10.md'),uxDoc=read('docs/UX-QUALITY.md'),notesDoc=read('docs/NOTES-INTEGRATION.md');
assert(ui.includes('<details class="field-notes-current"')&&ui.includes('Field notes'),'field-note renderer uses labeled native progressive disclosure');
assert(ui.includes("body.querySelector('.card-actions')"),'card field notes render beside action context');
assert(ui.includes('toolIds:[...new Set(toolIds)]'),'card context exposes all unique tool bindings');
assert(css.includes('.field-notes-current>summary:focus-visible'),'field-note disclosure retains keyboard focus treatment');
assert(css.includes('@media(max-width:720px)'),'field-note UI accounts for narrow screens');
assert(bridge.includes("['card','path','tools'].includes(p)")&&bridge.includes('ensureFieldNotes88'),'field-note owners remain route-gated in the current bridge');
assert(releaseDoc.includes('# Obol v9.10')&&releaseDoc.includes('ux-progressive-notes'),'release documentation preserves the v9.10 queue disposition');
assert(uxDoc.includes('contextual field notes')||uxDoc.includes('field notes'),'UX documentation preserves the field-notes presentation boundary');
assert(notesDoc.includes('data/field-notes.js'),'notes integration documentation names the normalized public field-note owner');
assert(notesDoc.includes('platocres/obol-source-notes'),'private source repository remains documented');

for(const command of [
 ['tools/validate-field-notes-ui.js'],
 ['tools/validate-current-release.js'],
 ['tools/validate-version-identity.js'],
 ['tools/validate-product-hardening-queue.js'],
 ['tools/validate-asset-references.js'],
 ['tools/sync-current-release.js','--check'],
 ['tools/sync-product-build-next.js','--check'],
 ['tools/validate-release-pr.js','--repo-only']
]){
 const result=run(command);
 assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());
}

console.log('v9.10 contextual field-notes disclosure and private-source-boundary tests passed.');
