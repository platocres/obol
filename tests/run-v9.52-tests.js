'use strict';
// v9.52 regression: first Windows-privesc source re-mining batch, release-identity
// synchronization hardening, and README declutter. This suite is deliberately
// version-agnostic about the current release so it never needs demotion at the next bump.
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
function run(args){const r=cp.spawnSync(process.execPath,args.map((p,i)=>i===0?path.join(root,p):p),{cwd:root,encoding:'utf8',env:process.env});assert.strictEqual(r.status,0,args.join(' ')+'\n'+((r.stdout||'')+(r.stderr||'')));return (r.stdout||'')+(r.stderr||'');}

// permanent gates
run(['tools/validate-notes-impact.js']);
run(['tools/validate-note-integration.js']);
run(['tools/validate-note-remining-audits.js']);
run(['tools/validate-product-hardening-queue.js']);
run(['tools/validate-current-release.js']);
run(['tools/validate-historical-tests.js']);
run(['tools/validate-readme-history-ownership.js']);
run(['tools/sync-current-release.js']);
run(['tools/sync-product-build-next.js','--check']);
run(['tools/validate-release-pr.js','--repo-only','--release-version=9.52']);

// load current runtime data
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/note-integration.js','data/note-integration-reviews.js','data/note-integration-packets.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/note-progress-current.js','data/field-notes.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const w=sandbox.window;
const release=w.OBOL_CURRENT_RELEASE,notes=w.OBOL_NOTE_INTEGRATION,q=w.OBOL_PRODUCT_HARDENING,progress=w.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS,field=w.OBOL_FIELD_NOTES;
assert(release&&notes&&q&&progress&&field,'v9.52 current owners load');

// release identity is v9.52+ and internally synchronized (version-agnostic)
const rp=String(release.version).split('.').map(Number);
assert(rp[0]===9&&rp[1]>=52,'v9.52+ current release required');
assert.strictEqual(release.label,'v'+rp[0]+'.'+rp[1]);
const readme=read('README.md'),index=read('index.html'),currentRelease=read('data/current-release.js');
assert(readme.includes('Current release: **'+release.label+'**'),'README current release matches the authority');
assert(index.includes('<title>Obol '+release.label+' — '+release.phaseLabel+'</title>'),'index title matches the authority');
assert(index.includes('Offensive Box Operations Ledger · '+release.label),'index tagline matches the authority');
assert(currentRelease.includes("version:'"+release.version+"'")&&currentRelease.includes("label:'"+release.label+"'"),'current-release authority is self-consistent');
// generated app owner must not lag the release authority (the v9.51 drift regression)
const appOwner=read('assets/obol-app-current.js');
assert(appOwner.includes("version:'"+release.version+"'"),'generated application owner is regenerated to the current release');

// Windows-privesc re-mining batch
const remine=progress.remining;
assert(remine&&Array.isArray(remine.auditRows),'re-mining projection publishes audit rows');
assert(remine.auditRows.length>=15,'the Windows-privesc re-mining batch published at least 15 audit rows');
assert(remine.reminedThemes.includes('windows-privesc'),'windows-privesc is recorded as a re-mined theme');
assert(Number(remine.audited)>=15,'the source re-mining gate reflects re-mined notes');
const DIMS=remine.dimensions;assert(DIMS.length===16,'sixteen extraction dimensions');
for(const row of remine.auditRows){
 assert(row.originalSourceReread===true,row.noteId+' confirms original-source re-read');
 for(const dim of DIMS){const d=row.decisions[dim];assert(d&&remine.allowedOutcomes.includes(d.outcome),row.noteId+' has a valid '+dim+' outcome');}
}
assert(remine.outcomeCounts.added>=7,'re-mining recorded genuine added outcomes');
assert(remine.outcomeCounts.covered>=1&&remine.outcomeCounts.queued>=1&&remine.outcomeCounts['private-only']>=1,'re-mining recorded covered/queued/private-only outcomes');
// the item-count arithmetic is internally consistent
const decisionTotal=Object.values(remine.outcomeCounts).reduce((a,b)=>a+Number(b),0);
assert.strictEqual(decisionTotal,remine.auditRows.length*16,'every dimension of every row is scored');

// the added output is a real, path-wired operator Field Note
const newNote=field.entries.find(e=>e.id==='note-windows-service-trigger-tool-proof');
assert(newNote,'the Windows service-trigger/tool-proof field note exists on the operator surface');
assert.strictEqual(newNote.kind,'path-guidance');
assert(newNote.pathIds.includes('path'),'the new note is wired to the actual Next Steps / Orange path surface');
assert(field.relevant({pathId:'path'}).some(e=>e.id==='note-windows-service-trigger-tool-proof'),'the new note renders on the path route');
assert(!/\.enex\b|sources\/raw\/|OS\{|94\.237\./i.test(JSON.stringify(newNote)),'the new note carries no raw source path, flag, or lab target material');
// the frozen v9.35 Windows packet is preserved
assert.strictEqual(notes.milestones['v9.35-windows-privesc'].reviewedCount,127,'frozen v9.35 Windows milestone preserved');
assert(q.items.find(i=>i.id==='notes-packet-windows-privesc').status==='complete','v9.35 Windows packet stays complete');
assert(q.items.find(i=>i.id==='notes-remine-windows-privesc').status==='complete','the Windows re-mining item is complete');

// the demotion guard was hardened for index shell tokens
const guard=read('tools/validate-historical-tests.js');
assert(guard.includes('index release-shell <title> token'),'historical-test guard rejects hard-coded index title tokens');
assert(guard.includes('index release-shell tagline token'),'historical-test guard rejects hard-coded index tagline tokens');

// release docs, changelog, and workflow doc
const releaseDoc=read('docs/v9.52.md');
assert(releaseDoc.includes('# Obol v9.52'),'v9.52 release doc exists');
assert(releaseDoc.includes('note-windows-service-trigger-tool-proof')&&releaseDoc.includes('Release-identity synchronization hardening'),'v9.52 release doc documents the work');
const changelog=read('CHANGELOG.md');
assert(changelog.includes('## v9.52 '),'CHANGELOG documents v9.52');
assert(changelog.includes('## v9.51 '),'CHANGELOG restores the skipped v9.51 entry');
const workflow=read('docs/AGENT-WORKFLOW.md');
assert(workflow.includes('git lfs pull')&&workflow.includes('platocres/obol-source-notes'),'AGENT-WORKFLOW documents raw-source re-mining mechanics');
assert(readme.includes('[`docs/AGENT-WORKFLOW.md`](docs/AGENT-WORKFLOW.md)'),'README links the agent workflow doc');

console.log('v9.52 Windows-privesc source re-mining, release-identity synchronization hardening, and README declutter tests passed.');
