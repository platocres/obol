'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const cp=require('child_process');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
function has(rel,needle){assert(read(rel).includes(needle),`${rel} must include ${needle}`);}
function lacks(rel,needle){assert(!read(rel).includes(needle),`${rel} must not include ${needle}`);}

cp.execFileSync(process.execPath,[path.join(root,'tools','validate-release-pr.js'),'--repo-only','--release-version=9.56'],{cwd:root,stdio:'inherit'});
cp.execFileSync(process.execPath,[path.join(root,'tools','sync-product-build-next.js'),'--check'],{cwd:root,stdio:'inherit'});
cp.execFileSync(process.execPath,[path.join(root,'tools','validate-note-remining-audits.js')],{cwd:root,stdio:'inherit'});

for(const rel of [
 'assets/product-hardening-dashboard.js',
 'assets/product-hardening-dashboard.css',
 'data/current-release.js',
 'data/product-hardening/note-progress-current.js',
 'data/product-hardening/notes-impact-current.js',
 'tools/sync-product-build-next.js',
 'docs/v9.56.md',
 'README.md',
 'index.html',
 'CHANGELOG.md'
]) assert(fs.existsSync(path.join(root,rel)),`${rel} must exist`);

for(const expected of ["version:'9.56.0'","label:'v9.56'"]) has('data/current-release.js',expected);
has('README.md','Current release: **v9.56**');
has('index.html','<title>Obol v9.56 — Product Hardening</title>');
has('index.html','Offensive Box Operations Ledger · v9.56');
has('CHANGELOG.md','## v9.56 — Product-hardening release for note re-mining dashboard schema tracking and dashboard readability');

// Dashboard must be overview-first and use drill-downs instead of rendering every detail table as one giant scroll.
for(const expected of [
 'ph-dashboard-v956',
 'ph-quicknav',
 'ph-overview-grid',
 'ph-metric-grid',
 'ph-remine-grid',
 'Re-mining schema and negative-proof details',
 'Build queue and package details',
 'Notes source, impact, and latest wave',
 'Runtime and QA appendix',
 'Full seeded work ledger',
 'details(',
 'max-height:520px',
 'width:min(1680px,calc(100vw - 56px))'
]) has(expected.endsWith('.css')?'assets/product-hardening-dashboard.css':'assets/product-hardening-dashboard.js',expected);
for(const expected of [
 'ph-dashboard-v956',
 'ph-overview-grid',
 'ph-metric-grid',
 'ph-remine-grid',
 'ph-drill',
 'ph-table-wrap',
 'grid-template-columns:repeat(6,minmax(0,1fr))',
 'width:min(1680px,calc(100vw - 56px))',
 'max-height:520px'
]) has('assets/product-hardening-dashboard.css',expected);

// Re-mining schema tracking must be visible in both dashboard and README generation.
for(const expected of [
 'old-rubric reviewed',
 'full-spectrum re-mined',
 'old-rubric-only remaining',
 'Negative finding outcomes',
 'Re-mining red flags',
 'Extraction dimensions',
 'notes-remine-dashboard-schema',
 'completeSchemaItem',
 'redFlagTotal',
 'allowedOutcomes',
 'dimensionCounts',
 'outcomeCounts',
 'additive Orange baseline'
]) has('assets/product-hardening-dashboard.js',expected);
for(const expected of [
 'applyRemineDashboardSchemaCompletion',
 'notes-remine-dashboard-schema',
 'old-rubric reviewed',
 'full-spectrum re-mined',
 'old-rubric-only remaining',
 'Negative finding outcomes',
 'Re-mining red flags',
 'Extraction dimensions',
 'overview-first dashboard with drill-down detail sections'
]) has('tools/sync-product-build-next.js',expected);
for(const expected of [
 '**Current product-hardening queue:** 220/653 complete (34%), 14 queued, 9 foundation items modeled.',
 '**Source re-mining:** old-rubric reviewed 135/556 · full-spectrum re-mined 19/135 · old-rubric-only remaining 116.',
 '**Negative finding outcomes:** added 7 · covered 150 · queued 27 · private-only 24 · not-applicable 96 · blocked 0.',
 '**Re-mining red flags:** 0 currently flagged across 11 invalid/missing-proof guardrails.',
 '**Extraction dimensions:** 16 tracked',
 '**Re-mining dashboard/schema:** complete',
 '2. **Re-mine reviewed web upload and inclusion notes**'
]) has('README.md',expected);
lacks('README.md','2. **Add note re-mining dashboard and schema tracking**');
has('README.md','- **Notes integration:** 136/556 complete (24%), 2 modeled.');

for(const expected of [
 '# Obol v9.56',
 'Re-mining dashboard schema tracking',
 'Dashboard readability and drill-down organization',
 'a wider dashboard shell',
 'compact top summary',
 'drill-down sections',
 'long tables moved into contained scroll areas',
 'Queue and README sync preserved'
]) has('docs/v9.56.md',expected);

console.log('v9.56 re-mining dashboard schema tracking and readability regression passed.');
