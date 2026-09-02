'use strict';
const fs=require('fs');
const cp=require('child_process');

function read(path){return fs.readFileSync(path,'utf8');}
function write(path,text){fs.writeFileSync(path,text,'utf8');}
function replaceOnce(text,oldText,newText,label){
  if(!text.includes(oldText))throw new Error('Missing patch anchor: '+label);
  return text.replace(oldText,newText);
}
function patch(path,fn){const before=read(path);const after=fn(before);if(after===before)throw new Error('No change produced for '+path);write(path,after);}

patch('data/tool-builders.js',text=>{
  text=replaceOnce(text,
    "id:'tb-sqlmap',tool:'sqlmap',title:'sqlmap request tester',summary:'Build a focused sqlmap command from a URL or captured raw request with explicit parameter, session, request-shaping, detection-depth, DBMS, tamper, and output controls.'",
    "id:'tb-sqlmap',tool:'sqlmap',title:'sqlmap request tester',summary:'Build a focused sqlmap command from a URL or captured raw request with explicit parameter, session, request-shaping, detection-depth, DBMS, tamper, output, and bounded post-injection file/OS controls.'",
    'sqlmap summary');
  text=replaceOnce(text,
    "{id:'action',label:'Follow-up action',type:'select',default:'detect',options:[{value:'detect',label:'Detection only'},{value:'current-db',label:'Current database'},{value:'current-user',label:'Current DBMS user'},{value:'dbs',label:'List databases'},{value:'tables',label:'List tables'},{value:'columns',label:'List columns'},{value:'dump',label:'Dump selected entries'}]},",
    "{id:'action',label:'Follow-up action',type:'select',default:'detect',options:[{value:'detect',label:'Detection only'},{value:'current-db',label:'Current database'},{value:'current-user',label:'Current DBMS user'},{value:'dbs',label:'List databases'},{value:'tables',label:'List tables'},{value:'columns',label:'List columns'},{value:'dump',label:'Dump selected entries'},{value:'file-read',label:'Read one remote file'},{value:'file-write',label:'Write one local file to remote path'},{value:'os-shell',label:'Open sqlmap OS shell'}]},",
    'sqlmap action options');
  text=replaceOnce(text,
    "  {id:'columns',label:'Columns (-C)',type:'text',placeholder:'username,password',visibleWhen:{field:'action',equals:'dump'}}\n ],",
    "  {id:'columns',label:'Columns (-C)',type:'text',placeholder:'username,password',visibleWhen:{field:'action',equals:'dump'}},\n  {id:'remoteFile',label:'Remote file to read',type:'path',placeholder:'/etc/passwd',requiredWhen:{field:'action',equals:'file-read'},visibleWhen:{field:'action',equals:'file-read'},help:'Generate one explicit --file-read request. Returned file content still requires Evidence review.'},\n  {id:'localFile',label:'Local file to write',type:'path',placeholder:'payload.txt',requiredWhen:{field:'action',equals:'file-write'},visibleWhen:{field:'action',equals:'file-write'}},\n  {id:'remoteDest',label:'Remote destination path',type:'path',placeholder:'/var/www/html/payload.txt',requiredWhen:{field:'action',equals:'file-write'},visibleWhen:{field:'action',equals:'file-write'},help:'Use only after the database/file-system privilege and writable-destination assumptions are justified.'}\n ],",
    'sqlmap post injection fields');
  text=replaceOnce(text,
    "{value:'columns',arg:'--columns'},{value:'dump',arg:'--dump'}]},",
    "{value:'columns',arg:'--columns'},{value:'dump',arg:'--dump'},{value:'file-read',arg:''},{value:'file-write',arg:''},{value:'os-shell',arg:'--os-shell'}]},",
    'sqlmap action tokens');
  text=replaceOnce(text,
    "  {kind:'field',field:'database',flag:'-D',when:{field:'action',in:['tables','columns','dump']}},{kind:'field',field:'table',flag:'-T',when:{field:'action',in:['columns','dump']}},{kind:'field',field:'columns',flag:'-C',when:{field:'action',equals:'dump'}}\n ]},",
    "  {kind:'field',field:'database',flag:'-D',when:{field:'action',in:['tables','columns','dump']}},{kind:'field',field:'table',flag:'-T',when:{field:'action',in:['columns','dump']}},{kind:'field',field:'columns',flag:'-C',when:{field:'action',equals:'dump'}},\n  {kind:'field',field:'remoteFile',flag:'--file-read',when:{field:'action',equals:'file-read'}},{kind:'field',field:'localFile',flag:'--file-write',when:{field:'action',equals:'file-write'}},{kind:'field',field:'remoteDest',flag:'--file-dest',when:{field:'action',equals:'file-write'}}\n ]},",
    'sqlmap post injection tokens');
  text=replaceOnce(text,
    "evidence:{expectation:'Return reviewed sqlmap console output and, when relevant, saved result artifacts showing the exact parameter, injection technique, DBMS observation, schema object, or data row actually reported by the tool.'",
    "evidence:{expectation:'Return reviewed sqlmap console output and, when relevant, saved result artifacts showing the exact parameter, injection technique, DBMS observation, schema/data result, remote file result, file-write result, or OS-shell interaction actually reported by the tool.'",
    'sqlmap evidence');
  text=replaceOnce(text,
    "  {id:'compressed',label:'Request compressed response (--compressed)',type:'checkbox'},",
    "  {id:'compressed',label:'Request compressed response (--compressed)',type:'checkbox'},\n  {id:'pathAsIs',label:'Preserve URL path (--path-as-is)',type:'checkbox',help:'Prevent curl from normalizing /../ or /./ path segments when an authorized traversal test needs the exact request path.'},",
    'curl path-as-is field');
  text=replaceOnce(text,
    "  {kind:'toggle',field:'followRedirects',flag:'--location'},{kind:'toggle',field:'insecure',flag:'--insecure'},{kind:'toggle',field:'compressed',flag:'--compressed'},",
    "  {kind:'toggle',field:'pathAsIs',flag:'--path-as-is'},{kind:'toggle',field:'followRedirects',flag:'--location'},{kind:'toggle',field:'insecure',flag:'--insecure'},{kind:'toggle',field:'compressed',flag:'--compressed'},",
    'curl path-as-is token');
  return text;
});

patch('data/note-integration-reviews.js',text=>{
  text=replaceOnce(text,
    "const freezeRows=rows=>Object.freeze(rows.map(row=>Object.freeze({...row,outputIds:Object.freeze((row.outputIds||[]).slice())})));",
    "const freezeProductChanges=changes=>Object.freeze((changes||[]).map(change=>Object.freeze({...change,proofRefs:Object.freeze((change.proofRefs||[]).slice())})));\nconst freezeRows=rows=>Object.freeze(rows.map(row=>Object.freeze({...row,outputIds:Object.freeze((row.outputIds||[]).slice()),productChanges:freezeProductChanges(row.productChanges)})));",
    'review row product-change freezing');

  const currentRows=`const CURRENT_WAVE='v9.30-web-upload-inclusion-wave-1';
const CURRENT_WAVE_ROWS=freezeRows([
 {noteId:'htb-penetration-tester-f6638e21595b7f37',disposition:'private-reference-only',reviewWave:CURRENT_WAVE,rationale:'This record is a lab-specific multi-host assessment. Its reusable web-upload and shell concepts are represented by narrower normalized notes, while targets, outcomes, and walkthrough detail remain private.',outputIds:[]},
 {noteId:'htb-penetration-tester-2d27567769e89492',disposition:'private-reference-only',reviewWave:CURRENT_WAVE,rationale:'This record is primarily a packaged web-shell tool walkthrough. Keep the recipe private; the durable runtime and proof boundaries are represented by existing normalized upload/execution guidance.',outputIds:[]},
 {noteId:'htb-penetration-tester-b2c3e1eb214f2739',disposition:'modeled',reviewWave:CURRENT_WAVE,rationale:'The source adds a durable operator-side transfer boundary: receiving infrastructure should use protected transport, constrained storage, and a non-executable serving context instead of becoming an accidental execution surface.',outputIds:['note-transfer-receiver-safety'],guidanceOnlyReason:'This is operator safety and setup guidance. It does not require Obol to automate a receiving server or change Path ranking.'},
 {noteId:'htb-penetration-tester-42b27d448cc88bc4',disposition:'superseded',reviewWave:CURRENT_WAVE,rationale:'The broad web-shell introduction is already represented more precisely by Obol\'s upload acceptance, serving/interpretation, execution-proof, and shell-access boundaries.',outputIds:[]},
 {noteId:'htb-penetration-tester-b81ae4d7b1657a68',disposition:'private-reference-only',reviewWave:CURRENT_WAVE,rationale:'This record is mainly a tool-specific packaged web-shell walkthrough. Preserve it privately rather than publishing a payload/tool recipe.',outputIds:[]},
 {noteId:'htb-penetration-tester-93c5b5eca5b2681c',disposition:'modeled',reviewWave:CURRENT_WAVE,rationale:'The reviewed SQLMap material exposes real post-injection file-read, file-write, and OS-shell actions that were missing from the existing SQLMap GUI builder.',outputIds:['note-sqlmap-post-injection-actions'],productChanges:[{type:'tool-builder-change',proofRefs:['data/tool-builders.js','tests/run-v9.30-tests.js']}]},
 {noteId:'htb-penetration-tester-681ca4b3d5384254',disposition:'superseded',reviewWave:CURRENT_WAVE,rationale:'The PHP web-shell walkthrough does not add a new durable product branch beyond the existing requirement to prove upload/storage, executable interpretation, and downstream command effect separately.',outputIds:[]},
 {noteId:'htb-penetration-tester-e274dc76c977af88',disposition:'superseded',reviewWave:CURRENT_WAVE,rationale:'The broad reverse/bind/web-shell taxonomy is already represented by Obol\'s existing shell and access workflow; this source adds no narrower upload/inclusion product requirement.',outputIds:[]},
 {noteId:'htb-penetration-tester-bf1a8a1d0d3ea08a',disposition:'modeled',reviewWave:CURRENT_WAVE,rationale:'Database-backed file writing reinforces the need for explicit SQLMap file-write controls while keeping database privilege, writable destination, serving behavior, and later execution as separate proof states.',outputIds:['note-sqlmap-post-injection-actions'],productChanges:[{type:'tool-builder-change',proofRefs:['data/tool-builders.js','tests/run-v9.30-tests.js']}]},
 {noteId:'offsec-pen-200-274de7c63e8361cf',disposition:'modeled',reviewWave:CURRENT_WAVE,rationale:'The source adds durable path-resolution guidance: absolute and relative paths are different hypotheses whose success depends on the application\'s resolution context and base path.',outputIds:['note-path-resolution-context'],guidanceOnlyReason:'The lesson improves contextual Path guidance but does not introduce a deterministic new applicability or ranking signal.'},
 {noteId:'offsec-pen-200-0dd449ee91b9f9c7',disposition:'modeled',reviewWave:CURRENT_WAVE,rationale:'The automation material confirms that SQLMap follow-up work includes OS-shell behavior after injection proof, which the existing builder did not expose.',outputIds:['note-sqlmap-post-injection-actions'],productChanges:[{type:'tool-builder-change',proofRefs:['data/tool-builders.js','tests/run-v9.30-tests.js']}]},
 {noteId:'offsec-pen-200-8e1c01abd8e9bfaa',disposition:'private-reference-only',reviewWave:CURRENT_WAVE,rationale:'This record is a large challenge-lab notebook containing target-specific commands, outputs, reconstruction notes, and outcomes. Its reusable traversal concepts belong in normalized guidance while the lab material remains private.',outputIds:[]},
 {noteId:'offsec-pen-200-82e0345b8a1950d4',disposition:'private-reference-only',reviewWave:CURRENT_WAVE,rationale:'This record is primarily a platform/path catalog for common web logs and related files. Keep the changing path recipe private rather than freezing it into public product behavior.',outputIds:[]},
 {noteId:'offsec-pen-200-4940931777995183',disposition:'modeled',reviewWave:CURRENT_WAVE,rationale:'The reviewed traversal example exposes a concrete curl behavior gap: curl can normalize dot segments before sending the request unless the operator explicitly preserves the path.',outputIds:['note-curl-preserve-request-path'],productChanges:[{type:'tool-builder-change',proofRefs:['data/tool-builders.js','tests/run-v9.30-tests.js']}]},
 {noteId:'offsec-pen-200-20f3a62dab9956c9',disposition:'modeled',reviewWave:CURRENT_WAVE,rationale:'The source reinforces path-resolution context and a signal-first traversal workflow: identify the controlling parameter, establish one reproducible read, then vary depth or representation deliberately.',outputIds:['note-path-resolution-context'],guidanceOnlyReason:'The current Path can surface this as contextual guidance without inventing a new fact, transition, or ranking rule.'},
 {noteId:'offsec-pen-200-f1b46447f1c1e86f',disposition:'superseded',reviewWave:CURRENT_WAVE,rationale:'The LFI distinction between file read and executable inclusion is already captured by the normalized file-inclusion interpretation boundary and cross-source proof chain.',outputIds:[]},
 {noteId:'offsec-pen-200-71ced0294b414136',disposition:'modeled',reviewWave:CURRENT_WAVE,rationale:'The source reinforces that database-assisted command execution and file placement require explicit follow-up controls and separate proof rather than being inferred from SQL injection alone.',outputIds:['note-sqlmap-post-injection-actions'],productChanges:[{type:'tool-builder-change',proofRefs:['data/tool-builders.js','tests/run-v9.30-tests.js']}]},
 {noteId:'offsec-pen-200-da102203eddf1c26',disposition:'superseded',reviewWave:CURRENT_WAVE,rationale:'Wrapper behavior is already captured by the normalized distinction between transformed source disclosure and executable interpretation.',outputIds:[]},
 {noteId:'offsec-pen-200-bf9cd0687bdf1adf',disposition:'superseded',reviewWave:CURRENT_WAVE,rationale:'Remote inclusion prerequisites and the need to prove target-side retrieval, interpretation, and downstream effect are already represented by the existing cross-source inclusion chain.',outputIds:[]},
 {noteId:'offsec-pen-200-a7a112402600f18e',disposition:'superseded',reviewWave:CURRENT_WAVE,rationale:'Executable-upload validation and proof sequencing are already represented by layered upload validation plus the accepted-upload-versus-execution proof boundary.',outputIds:[]},
 {noteId:'offsec-pen-200-c91e5f2c5afd78c7',disposition:'modeled',reviewWave:CURRENT_WAVE,rationale:'The source adds a distinct branch for non-executable uploads: filename handling, placement, duplicate behavior, traversal, or overwrite may create impact even when the server never executes the uploaded content.',outputIds:['note-upload-placement-impact'],guidanceOnlyReason:'This changes interpretation and evidence guidance. Blind overwrite is not safe enough to become an automatic Path transition, so no ranking or execution logic is added.'}
]);

`;
  text=replaceOnce(text,'const NEW_PUBLIC_NOTES=freezeList([',currentRows+'const NEW_PUBLIC_NOTES=freezeList([','current review wave insertion');

  const currentNotes=`const CURRENT_PUBLIC_NOTES=freezeList([
 Object.freeze({id:'note-transfer-receiver-safety',title:'Treat the receiving server as part of the test boundary',body:'When an operator must receive files over HTTP or HTTPS, prefer protected transport and a narrowly scoped storage location that is not executable by the web stack. A convenient transfer endpoint should not become an accidental web-shell or data-exposure surface.',kind:'lesson',cardIds:freezeList([]),toolIds:freezeList([]),pathIds:freezeList([]),tags:freezeList(['file-upload','file-transfer','operator-safety']),sourceRefs:freezeList(['htb-penetration-tester-b2c3e1eb214f2739'])}),
 Object.freeze({id:'note-sqlmap-post-injection-actions',title:'Keep SQL injection proof separate from file and OS follow-up',body:'After SQL injection is established, treat database file read, file write, and operating-system interaction as separate actions with their own prerequisites and Evidence. Database privileges, writable destinations, serving behavior, and command execution must not be inferred from the injection finding alone.',kind:'tool-guidance',cardIds:freezeList([]),toolIds:freezeList(['sqlmap']),pathIds:freezeList(['path']),tags:freezeList(['sql-injection','file-placement','proof-boundary','tool-guidance']),sourceRefs:freezeList(['htb-penetration-tester-93c5b5eca5b2681c','htb-penetration-tester-bf1a8a1d0d3ea08a','offsec-pen-200-0dd449ee91b9f9c7','offsec-pen-200-71ced0294b414136'])}),
 Object.freeze({id:'note-path-resolution-context',title:'Absolute and relative paths test different resolution assumptions',body:'Treat an absolute path and a relative traversal as different hypotheses. Record the controllable parameter, the application or server base path when it is known, and one reproducible file-read signal before widening traversal depth, encoding, or target-file guesses.',kind:'path-guidance',cardIds:freezeList([]),toolIds:freezeList(['curl']),pathIds:freezeList(['path']),tags:freezeList(['path-traversal','file-inclusion','proof-boundary']),sourceRefs:freezeList(['offsec-pen-200-274de7c63e8361cf','offsec-pen-200-20f3a62dab9956c9'])}),
 Object.freeze({id:'note-curl-preserve-request-path',title:'Preserve traversal paths when curl normalization changes the request',body:'When a traversal hypothesis depends on literal dot segments, preserve the requested URL path so the HTTP client does not normalize those segments before transmission. Use this only when the observed target behavior justifies an exact-path test, and still require returned file content or another reviewed response signal as proof.',kind:'tool-guidance',cardIds:freezeList([]),toolIds:freezeList(['curl']),pathIds:freezeList(['path']),tags:freezeList(['path-traversal','file-inclusion','curl','request-normalization']),sourceRefs:freezeList(['offsec-pen-200-4940931777995183'])}),
 Object.freeze({id:'note-upload-placement-impact',title:'Non-executable uploads can still create placement impact',body:'An accepted upload can matter even when the server never executes it. Review the final filename, duplicate-name behavior, storage location, path handling, overwrite behavior, and any downstream consumer separately. Do not blindly overwrite production files merely to prove the hypothesis; preserve the distinction between suspected placement control and reviewed impact.',kind:'evidence',cardIds:freezeList([]),toolIds:freezeList(['curl']),pathIds:freezeList(['path']),tags:freezeList(['file-upload','path-traversal','overwrite','evidence','proof-boundary']),sourceRefs:freezeList(['offsec-pen-200-c91e5f2c5afd78c7'])})
]);
`;
  text=replaceOnce(text,'const reviewed=freezeList(Array.from(base.reviewedDispositions).concat(Array.from(WAVE_ROWS)));',currentNotes+"const historicalPublicFieldNotes=freezeList(Array.from(base.publicFieldNotes).concat(Array.from(NEW_PUBLIC_NOTES)));\nconst reviewed=freezeList(Array.from(base.reviewedDispositions).concat(Array.from(WAVE_ROWS),Array.from(CURRENT_WAVE_ROWS)));",'current public notes insertion');
  text=replaceOnce(text,'const publicFieldNotes=freezeList(Array.from(base.publicFieldNotes).concat(Array.from(NEW_PUBLIC_NOTES)));','const publicFieldNotes=freezeList(Array.from(historicalPublicFieldNotes).concat(Array.from(CURRENT_PUBLIC_NOTES)));','current public notes assembly');
  text=replaceOnce(text,"const milestone=Object.freeze({reviewedCount:reviewed.length,dispositionCounts:frozenCounts,publicFieldNoteIds:freezeList(publicFieldNotes.map(note=>note.id))});","const milestone=Object.freeze({reviewedCount:55,dispositionCounts:Object.freeze({'pending-review':501,modeled:43,superseded:0,rejected:0,'private-reference-only':12}),publicFieldNoteIds:freezeList(historicalPublicFieldNotes.map(note=>note.id))});\nconst currentMilestone=Object.freeze({reviewedCount:reviewed.length,dispositionCounts:frozenCounts,publicFieldNoteIds:freezeList(publicFieldNotes.map(note=>note.id))});",'milestone split');
  text=replaceOnce(text,'const milestones=Object.freeze({...base.milestones,[WAVE]:milestone});','const milestones=Object.freeze({...base.milestones,[WAVE]:milestone,[CURRENT_WAVE]:currentMilestone});','current milestone registration');
  text=replaceOnce(text,"if(reviewed.length!==55)failures.push('v9.28 reviewed count must be 55');","if(reviewed.length!==76)failures.push('v9.30 reviewed count must be 76');",'reviewed total');
  text=replaceOnce(text,"if(frozenCounts.modeled!==43||frozenCounts['private-reference-only']!==12||frozenCounts['pending-review']!==501)failures.push('v9.28 disposition counts are inconsistent');","if(frozenCounts.modeled!==52||frozenCounts['private-reference-only']!==17||frozenCounts.superseded!==7||frozenCounts['pending-review']!==480)failures.push('v9.30 disposition counts are inconsistent');",'disposition totals');
  text=replaceOnce(text,"for(const row of WAVE_ROWS){","for(const row of WAVE_ROWS.concat(CURRENT_WAVE_ROWS)){",'validate all extension rows');
  text=replaceOnce(text,"for(const note of NEW_PUBLIC_NOTES){","for(const note of NEW_PUBLIC_NOTES.concat(CURRENT_PUBLIC_NOTES)){",'validate all extension public notes');
  text=replaceOnce(text,"if(!milestones[WAVE]&&false)failures.push('v9.28 milestone missing');","if(!milestones[WAVE])failures.push('v9.28 milestone missing');\n if(!milestones[CURRENT_WAVE])failures.push('v9.30 milestone missing');\n const currentOutputIds=new Set(CURRENT_PUBLIC_NOTES.map(note=>note.id));\n for(const row of CURRENT_WAVE_ROWS){\n  if(row.disposition==='modeled'&&!row.outputIds.some(id=>currentOutputIds.has(id)))failures.push('v9.30 modeled row lacks current public output '+row.noteId);\n  if(row.disposition==='modeled'&&!row.productChanges.length&&!String(row.guidanceOnlyReason||'').trim())failures.push('v9.30 modeled row lacks productChanges or guidanceOnlyReason '+row.noteId);\n  if(row.disposition!=='modeled'&&row.outputIds.length)failures.push('v9.30 non-modeled row publishes output '+row.noteId);\n }",'current explicit impact validation');
  return text;
});

patch('data/product-hardening/product-hardening-queue.js',text=>replaceOnce(text,
  '["notes-integration","Notes integration","Mine the private source notes into explicit Obol product outputs while preserving private-source boundaries.",55,556]',
  '["notes-integration","Notes integration","Mine the private source notes into explicit Obol product outputs while preserving private-source boundaries.",76,556]',
  'notes integration track progress'));

patch('tests/run-v9.29-tests.js',text=>{
  text=replaceOnce(text,"const release=sandbox.window.OBOL_CURRENT_RELEASE,q=sandbox.window.OBOL_PRODUCT_HARDENING,workPackages=sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES,impact=sandbox.window.OBOL_PRODUCT_HARDENING_NOTES_IMPACT;","const release=sandbox.window.OBOL_CURRENT_RELEASE,q=sandbox.window.OBOL_PRODUCT_HARDENING,workPackages=sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES,impact=sandbox.window.OBOL_PRODUCT_HARDENING_NOTES_IMPACT,notes=sandbox.window.OBOL_NOTE_INTEGRATION;",'v9.29 notes handle');
  text=replaceOnce(text,"assert.strictEqual(release.version,'9.29.0');\nassert.strictEqual(release.label,'v9.29');","assert.strictEqual(release.phase,'product-hardening','v9.29 product-hardening phase remains current-compatible');\nassert(notes.milestones&&notes.milestones['v9.28-wave-3'],'v9.29 preserves the v9.28 note-review milestone');",'v9.29 current release identity');
  text=replaceOnce(text,"assert.strictEqual(impact.review.reviewed,55);\nassert.strictEqual(impact.review.modeled,43);\nassert.strictEqual(impact.review.privateOnly,12);\nassert.strictEqual(impact.review.pending,501);","const v928Milestone=notes.milestones['v9.28-wave-3'];\nassert.strictEqual(v928Milestone.reviewedCount,55,'v9.29 preserves 55 reviewed notes as a historical milestone');\nassert.strictEqual(v928Milestone.dispositionCounts.modeled,43);\nassert.strictEqual(v928Milestone.dispositionCounts['private-reference-only'],12);\nassert.strictEqual(v928Milestone.dispositionCounts['pending-review'],501);\nassert(impact.review.reviewed>=55&&impact.review.modeled>=43&&impact.review.privateOnly>=12,'later note reviews may advance beyond the v9.29 milestone');",'v9.29 note counts');
  text=replaceOnce(text,"assert.strictEqual(impact.outputCounts.declaredProductChanges,0,'v9.29 distinguishes contextual bindings from code-level note-driven changes');\nassert.strictEqual(impact.outputCounts.explicitGuidanceOnlyDecisions,0,'pre-v9.29 rows are not retroactively rewritten with invented impact decisions');","const preV929Decisions=impact.sourceDecisions.filter(decision=>!impact.reviewWaveAtLeast(decision.reviewWave,9,29));\nassert(preV929Decisions.every(decision=>decision.productChanges.length===0&&!decision.guidanceOnlyReason),'pre-v9.29 rows are not retroactively rewritten with invented product-impact decisions');",'v9.29 product change baseline');
  text=replaceOnce(text,"assert.strictEqual(impact.latestWave.id,'v9.28-wave-3');","assert(impact.sourceDecisions.some(decision=>decision.reviewWave==='v9.28-wave-3'),'v9.28 review wave remains preserved after later note mining');",'v9.29 latest wave');
  text=replaceOnce(text,"assert.strictEqual(q.totals().complete,121);assert.strictEqual(q.totals().total,634);assert.strictEqual(q.totals().queued,12);","assert(q.totals().complete>=121,'later product-hardening work may advance beyond the v9.29 completion floor');assert.strictEqual(q.totals().total,634);assert.strictEqual(q.totals().queued,12);",'v9.29 queue total');
  return text;
});

const test=`'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const run=args=>cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/tool-builder-schema.js','data/tool-builders.js','data/product-hardening/product-hardening-queue.js','data/note-integration.js','data/note-integration-reviews.js','data/product-hardening/notes-impact-current.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const w=sandbox.window,release=w.OBOL_CURRENT_RELEASE,builders=w.OBOL_TOOL_BUILDERS,notes=w.OBOL_NOTE_INTEGRATION,impact=w.OBOL_PRODUCT_HARDENING_NOTES_IMPACT,q=w.OBOL_PRODUCT_HARDENING;
assert(release&&builders&&notes&&impact&&q,'v9.30 current owners load');
assert.strictEqual(release.version,'9.30.0');
assert.strictEqual(release.label,'v9.30');
assert.deepStrictEqual(Array.from(notes.validate()),[],'note integration self-validates');
assert.deepStrictEqual(Array.from(impact.validate()),[],'notes impact self-validates');
assert.strictEqual(notes.ledger.reviewedCount,76);
assert.strictEqual(notes.ledger.dispositionCounts.modeled,52);
assert.strictEqual(notes.ledger.dispositionCounts['private-reference-only'],17);
assert.strictEqual(notes.ledger.dispositionCounts.superseded,7);
assert.strictEqual(notes.ledger.dispositionCounts['pending-review'],480);
assert.strictEqual(impact.latestWave.id,'v9.30-web-upload-inclusion-wave-1');
assert.strictEqual(impact.latestWave.reviewed,21);
assert.strictEqual(impact.latestWave.modeled,9);
assert.strictEqual(impact.latestWave.privateOnly,5);
assert.strictEqual(impact.latestWave.productChanges.length,5);
assert(impact.outputCounts.declaredProductChanges>=5,'note mining now records code-level product mechanics separately from guidance bindings');
assert(impact.outputCounts.explicitGuidanceOnlyDecisions>=4,'v9.30 guidance-only decisions are explicit');
for(const id of ['note-transfer-receiver-safety','note-sqlmap-post-injection-actions','note-path-resolution-context','note-curl-preserve-request-path','note-upload-placement-impact'])assert(notes.publicFieldNotes.some(note=>note.id===id),'v9.30 public-safe derived note exists: '+id);
const curl=builders.byId['tb-curl'];
assert(curl.fields.some(field=>field.id==='pathAsIs'&&field.type==='checkbox'),'curl exposes exact-path preservation control');
assert(curl.command.tokens.some(token=>token.kind==='toggle'&&token.field==='pathAsIs'&&token.flag==='--path-as-is'),'curl exact-path control emits --path-as-is');
const sqlmap=builders.byId['tb-sqlmap'];
const action=sqlmap.fields.find(field=>field.id==='action');
for(const value of ['file-read','file-write','os-shell'])assert(action.options.some(option=>option.value===value),'sqlmap exposes '+value+' action');
for(const id of ['remoteFile','localFile','remoteDest'])assert(sqlmap.fields.some(field=>field.id===id),'sqlmap exposes '+id+' field');
assert(sqlmap.command.tokens.some(token=>token.field==='remoteFile'&&token.flag==='--file-read'),'sqlmap file-read action is wired');
assert(sqlmap.command.tokens.some(token=>token.field==='localFile'&&token.flag==='--file-write'),'sqlmap file-write source is wired');
assert(sqlmap.command.tokens.some(token=>token.field==='remoteDest'&&token.flag==='--file-dest'),'sqlmap file-write destination is wired');
assert(sqlmap.command.tokens.some(token=>token.kind==='choice'&&token.field==='action'&&token.choices.some(choice=>choice.value==='os-shell'&&choice.arg==='--os-shell')),'sqlmap OS-shell action is wired');
const notesTrack=q.tracks.find(track=>track.id==='notes-integration');
assert(notesTrack&&notesTrack.complete===76&&notesTrack.total===556,'Product Build Next tracks the reviewed note ledger');
assert.strictEqual(q.totals().complete,142);
assert.strictEqual(q.totals().total,634);
assert.strictEqual(q.buildNext(1)[0].id,'notes-disposition-burn-down','the umbrella stays live while themed packet work continues');
const publicSource=read('data/note-integration-reviews.js');
for(const forbidden of ['OS{','192.168.50.','Lab123','Mountain Desserts'])assert(!publicSource.includes(forbidden),'public note integration does not copy lab-specific source detail: '+forbidden);
for(const command of [['tools/validate-note-integration.js'],['tools/validate-notes-impact.js'],['tools/validate-product-hardening-queue.js'],['tools/sync-product-build-next.js','--check'],['tools/validate-release-pr.js']]){const result=run(command);assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());}
console.log('v9.30 themed web upload/inclusion note wave and note-driven Tool Builder changes passed.');
`;
write('tests/run-v9.30-tests.js',test);

const doc=`# Obol v9.30 - Themed Notes Burn-down

v9.30 begins the packetized Notes Integration phase promised by v9.29. The first web upload/inclusion wave reviews private source substance, not note titles alone, and records whether each reviewed source produced public guidance, a concrete product mechanic, a supersession, or a private-only decision.

## Review wave

- Advances the durable review ledger from 55/556 to 76/556.
- Adds 21 terminal dispositions from the web upload/inclusion shortlist: 9 modeled, 7 superseded, and 5 private-reference-only.
- Leaves an unrelated credential-hunting candidate pending for the credentials/authentication packet instead of forcing a false thematic disposition.
- Keeps the packet item queued. This wave is meaningful burn-down, not a claim that every semantically relevant upload/inclusion note has been exhausted.

## Notes-to-product output

Five normalized public outputs are added: receiving-server safety, SQLMap post-injection actions, path-resolution context, curl exact-path preservation, and non-executable upload placement impact. Raw course prose, lab targets, flags, screenshots, and recipe-heavy walkthrough content remain private.

The wave also records explicit v9.29+ product-impact decisions. Guidance-only rows explain why contextual guidance is sufficient. Five source decisions declare code-level Tool Builder changes with proof references.

## Tool Builder changes

The curl builder now exposes a **Preserve URL path (--path-as-is)** checkbox for cases where client-side normalization would change a traversal request before transmission.

The SQLMap builder now exposes bounded follow-up actions for one remote file read, one local-to-remote file write, and an operator-run OS shell. File write requires explicit local source and remote destination fields. These controls do not promote SQL injection into file access or code execution; returned output remains the Evidence boundary.

## Private source review plumbing

The private `platocres/obol-source-notes` repository now owns an LFS-aware packet builder and GitHub Actions artifact workflow so agents can review substantive ENEX content without publishing the raw notes. Packet membership is a review shortlist and is not treated as a completeness denominator.

## Compatibility

Workspace/runtime schema remains v8.8. v9.30 does not add an app/core/project-model/style compatibility layer. Existing v9.29 Dashboard ownership and runtime-retirement contracts remain intact.

## Validation

- `node tests/run-v9.30-tests.js`
- `node tools/validate-note-integration.js`
- `node tools/validate-notes-impact.js`
- `node tools/validate-product-hardening-queue.js`
- `node tools/sync-product-build-next.js --check`
- `node tools/scope-check.js`
- exact-head release preflight, historical contract runner, and browser smoke before merge
`;
write('docs/v9.30.md',doc);

for(const [cmd,args] of [
  ['node',['tools/sync-current-release.js','--write']],
  ['node',['tools/sync-product-build-next.js','--write']]
]){
  const result=cp.spawnSync(cmd,args,{encoding:'utf8'});
  process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');
  if(result.status!==0)process.exit(result.status||1);
}

fs.unlinkSync('.github/workflows/v9.30-notes-wave.yml');
fs.unlinkSync(__filename);
console.log('v9.30 note wave changes staged; temporary mutation scaffolding removed.');
