'use strict';
const assert=require('assert');
const cp=require('child_process');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function has(rel,needle){assert(read(rel).includes(needle),`${rel} must include ${needle}`);}
function lacks(rel,needle){assert(!read(rel).includes(needle),`${rel} must not include ${needle}`);}
function run(args){cp.execFileSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,stdio:'inherit'});}

run(['tools/validate-release-pr.js','--repo-only','--release-version=9.56']);
run(['tools/sync-product-build-next.js','--check']);
run(['tools/validate-note-remining-audits.js']);

for(const rel of [
 'assets/product-hardening-dashboard.js',
 'assets/product-hardening-dashboard.css',
 'assets/dashboard-route-current.js',
 'data/current-release.js',
 'data/product-hardening/note-progress-current.js',
 'data/product-hardening/notes-impact-current.js',
 'data/product-hardening/build-next-queue-hygiene-current.js',
 'tools/sync-product-build-next.js',
 'docs/v9.56.md',
 'docs/BUILD-NEXT-QUEUE-HYGIENE.md',
 'README.md',
 'index.html',
 'CHANGELOG.md'
]) assert(fs.existsSync(path.join(root,rel)),`${rel} must exist`);

const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
vm.runInContext(read('data/current-release.js'),sandbox,{filename:'data/current-release.js'});
const release=sandbox.window.OBOL_CURRENT_RELEASE;
assert(release&&/^v9\./.test(release.label),'current product-hardening release remains in v9');
assert(/Current release: \*\*v9\.[0-9]+(?:\.[0-9]+)?\*\*/.test(read('README.md')),'README exposes the current v9 product-hardening release');
assert(read('index.html').includes('Offensive Box Operations Ledger · '+release.label),'index static tagline follows current release authority');
assert(read('CHANGELOG.md').includes('## v9.56'),'CHANGELOG preserves the v9.56 release history');

// Dashboard must remain overview-first and use drill-downs instead of rendering every detail table as one giant scroll.
for(const expected of [
 'ph-dashboard-v956',
 'ph-quicknav',
 'ph-metric-grid',
 'ph-remine-grid',
 'Build queue and package details',
 'Notes source, impact, and latest wave',
 'Runtime and QA appendix',
 'Full seeded work ledger',
 'details('
]) has('assets/product-hardening-dashboard.js',expected);
for(const expected of [
 'ph-dashboard-v956',
 'ph-metric-grid',
 'ph-remine-grid',
 'ph-drill',
 'ph-table-wrap',
 'width:100%',
 'body.obol-dashboard-active',
 'max-width:none'
]) has('assets/product-hardening-dashboard.css',expected);
lacks('assets/product-hardening-dashboard.css','width:min(1680px,calc(100vw - 56px))');
lacks('assets/product-hardening-dashboard.css','grid-template-columns:repeat(6,minmax(0,1fr))');

// Re-mining schema tracking must stay visible in both dashboard and README generation, without freezing old queue numbers.
for(const expected of [
 'Old-rubric reviewed',
 'Full-spectrum re-mined',
 'Negative finding outcomes',
 'Negative-proof red flags',
 'Extraction dimensions',
 'notes-remine-dashboard-schema',
 'redFlagTotal',
 'allowedOutcomes',
 'dimensionCounts',
 'outcomeCounts'
]) has('assets/product-hardening-dashboard.js',expected);
for(const expected of [
 'applyRemineDashboardSchemaCompletion',
 'queueHygieneFile',
 'validateQueueHygiene',
 'Standing source re-mining gates',
 'Highest-priority concrete live items',
 'notes-remine-dashboard-schema',
 'old-rubric reviewed',
 'full-spectrum re-mined',
 'old-rubric-only remaining',
 'Negative finding outcomes',
 'Re-mining red flags',
 'Extraction dimensions'
]) has('tools/sync-product-build-next.js',expected);
for(const expected of [
 'OBOL_PRODUCT_HARDENING_QUEUE_HYGIENE',
 'standingGateIds',
 'completedByReleasedProof',
 'concreteBuildNext',
 'standingBuildGates',
 'validateQueueHygiene',
 'notes-packet-ad-pivoting',
 'notes-packet-web-upload-inclusion',
 'notes-packet-windows-privesc',
 'notes-remine-web-upload-inclusion',
 'notes-remine-ad-pivoting'
]) has('data/product-hardening/build-next-queue-hygiene-current.js',expected);
for(const expected of [
 'data/product-hardening/build-next-queue-hygiene-current.js',
 'OBOL_PRODUCT_HARDENING_QUEUE_HYGIENE'
]) has('assets/dashboard-route-current.js',expected);
for(const expected of [
 '**Current product-hardening queue:**',
 '**Source re-mining status:**',
 '**Source-note cluster status:**',
 '**Highest-priority concrete live items:**',
 '**Next concrete entry:**',
 '**Queue mode:** `cluster-review`'
]) has('README.md',expected);
lacks('README.md','**Highest-priority live items:**');
lacks('README.md','**Work-package entry:** **Re-mine all already-reviewed notes from original sources**');

for(const expected of [
 '# Obol v9.56',
 'Re-mining dashboard schema tracking',
 'Dashboard readability and drill-down organization',
 'a wider dashboard shell',
 'compact top summary',
 'drill-down sections',
 'long tables moved into contained scroll areas',
 'Queue and README sync preserved',
 'Dashboard viewport hotfix',
 'no page-level horizontal scroll',
 'sidebar summary stays visible'
]) has('docs/v9.56.md',expected);
for(const expected of [
 'Standing gates',
 'Concrete live items',
 'Completed packet guardrail',
 'next concrete source-mining batch is XSS/session re-mining',
 'AD/pivoting remains live after the v9.55 AD/pivoting proof file exists'
]) has('docs/BUILD-NEXT-QUEUE-HYGIENE.md',expected);

console.log('v9.56 re-mining dashboard schema tracking, readability, and queue hygiene regression passed against the current release projection.');
