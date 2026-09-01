'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
vm.runInContext(read('data/field-notes.js'),sandbox,{filename:'data/field-notes.js'});
const api=sandbox.window.OBOL_FIELD_NOTES;
assert(api,'field-notes data contract loads');
assert.strictEqual(api.schemaVersion,'1.0.0','field-notes schema version is stable');
for(const kind of ['lesson','tool-guidance','path-guidance','troubleshooting','evidence','report','cleanup'])assert(api.kinds.includes(kind),'field-notes kind exists: '+kind);
assert(Array.isArray(api.entries),'field-notes entries are an array');

const fixture=[
 {id:'card-note',title:'Card guidance',body:'Generic normalized lesson.',kind:'lesson',cardIds:['demo-card'],sourceRefs:['source-note-1']},
 {id:'tool-note',title:'Tool guidance',body:'Generic normalized tool lesson.',kind:'tool-guidance',toolIds:['nmap'],sourceRefs:['source-note-2']},
 {id:'path-note',title:'Path guidance',body:'Generic normalized path lesson.',kind:'path-guidance',pathIds:['path'],sourceRefs:['source-note-3']},
 {id:'tag-note',title:'Tagged guidance',body:'Generic normalized tagged lesson.',kind:'troubleshooting',tags:['kerberos'],sourceRefs:['source-note-4']},
 {id:'bad-note',title:'Missing body',kind:'lesson'}
];
const normalized=api.normalizedEntries(fixture);
assert.strictEqual(normalized.length,4,'malformed field-note records are discarded');
assert.strictEqual(api.relevant({cardId:'demo-card'},fixture).length,1,'card context selects only relevant notes');
assert.strictEqual(api.relevant({toolId:'nmap'},fixture).length,1,'tool context selects only relevant notes');
assert.strictEqual(api.relevant({pathId:'path'},fixture).length,1,'path context selects only relevant notes');
assert.strictEqual(api.relevant({tags:['KERBEROS']},fixture).length,1,'tag matching is case-insensitive');
assert.strictEqual(api.relevant({cardId:'unrelated'},fixture).length,0,'unrelated context does not receive notes');

const data=read('data/field-notes.js'),ui=read('assets/field-notes.js'),css=read('assets/field-notes.css'),bridge=read('assets/app-v8.8.js'),notesDoc=read('docs/NOTES-INTEGRATION.md');
assert(!/\.enex\b/i.test(data),'public normalized field-note data does not embed ENEX paths');
assert(!/sources\/raw\//i.test(data),'public normalized field-note data does not point at raw source paths');
assert(ui.includes('<details class="field-notes-current"'),'field notes render with native progressive disclosure');
assert(ui.includes('Field notes'),'field-notes disclosure is clearly labeled');
assert(ui.includes('if(!rows.length)return'), 'empty relevant-note sets do not render a disclosure panel');
assert(ui.includes("body.querySelector('.card-actions')"),'card notes are inserted near action controls');
assert(!/<details[^>]*\sopen(?:\s|>|=)/i.test(ui),'field-note disclosure is collapsed by default');
assert(css.includes('.field-notes-current>summary:focus-visible'),'field-notes summary has a visible keyboard focus treatment');
assert(/@media\(max-width:720px\)/.test(css),'field-notes disclosure has a narrow-screen density rule');
for(const token of ['ensureFieldNotes88','data/field-notes.js','assets/field-notes.js','assets/field-notes.css',"['card','path','tools'].includes(p)"])assert(bridge.includes(token),'current app bridge missing field-notes token: '+token);
const footer=bridge.slice(bridge.lastIndexOf('ensureAccessibility88()'));
assert(!footer.includes('ensureFieldNotes88()'),'field notes are not eagerly loaded during normal startup');
assert(notesDoc.includes('platocres/obol-source-notes'),'notes integration document preserves the private source boundary');
assert(/normalized|derived/i.test(notesDoc),'notes integration document requires normalized/derived public output');

console.log('Field-notes UI contract valid: normalized context matching, collapsed disclosure, route gating, and private-source boundary are preserved.');
