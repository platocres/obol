'use strict';

const fs=require('fs');
const path=require('path');
const assert=require('assert');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const exists=rel=>fs.existsSync(path.join(root,rel));

const css=read('assets/responsive-current.css');
const dashboardCss=read('assets/product-hardening-dashboard.css');
const fieldNotesCss=read('assets/field-notes.css');
const bridge=read('assets/app-v8.8.js');
const index=read('index.html');
const dashboardHtml=read('product-hardening.html');
const qa=read('docs/visual-qa/responsive-density.md');
const fixture=JSON.parse(read('tests/fixtures/responsive-v9.11-viewports.json'));
const manifest=require(path.join(root,'data','runtime-manifest.js'));

for(const [name,html] of [['workspace',index],['dashboard',dashboardHtml]]){
  assert(/<meta name="viewport" content="width=device-width, initial-scale=1\.0">/.test(html),name+' entrypoint must declare a responsive viewport');
}

assert(bridge.includes("function ensureResponsive88(){addStyle88('assets/responsive-current.css');}"),'current bridge must load the stable responsive owner');
assert(bridge.includes('ensureResponsive88();ensureAccessibility88()'),'responsive owner must load before the stable accessibility enhancement');
assert(!manifest.styles.includes('assets/responsive-current.css'),'responsive overlay must not replace the single manifest-owned historical stylesheet projection');
assert.deepStrictEqual(Array.from(manifest.styles),['assets/obol-current.css'],'runtime manifest keeps one generated historical stylesheet owner');

for(const token of [
  '@media(max-width:1180px)','@media(max-width:980px)','@media(max-width:720px)','@media(max-width:520px)',
  '@media(max-height:720px) and (max-width:980px)',
  '.cards-grid','.lane-tabs','.phase-ribbon','.cmd-opts','table.tracker','#modal','.cred-row,.flag-row','.metrics30','.next-summary34','.card-actions',
  'overflow-x:auto','overscroll-behavior-inline:contain','max-height:calc(100dvh - 24px)','grid-template-columns:1fr'
])assert(css.includes(token),'responsive workspace owner missing '+token);
assert(!/body\s*\{[^}]*overflow-x\s*:\s*(?:hidden|clip)/.test(css),'responsive contract must not hide page-level overflow globally');

for(const token of [
  '@media(max-width:1080px)','@media(max-width:820px)','@media(max-width:600px)','@media(max-width:420px)',
  '.ph-hero','.ph-grid','.ph-bars','.ph-queue-row','.ph-table','min-width:680px','overflow-x:auto','.ph-pill{grid-column:2;justify-self:start}'
])assert(dashboardCss.includes(token),'Product Dashboard responsive contract missing '+token);

assert(fieldNotesCss.includes('.field-notes-current>summary{position:relative'),'field-notes disclosure summary must anchor its mobile affordance');
assert(fieldNotesCss.includes('padding-right:40px')&&fieldNotesCss.includes('top:10px'),'field-notes narrow summary must reserve and anchor affordance space');

assert.strictEqual(fixture.schemaVersion,'1.0.0');
assert.strictEqual(fixture.release,'v9.11');
assert.deepStrictEqual(fixture.viewports.map(v=>[v.width,v.height]),[[1280,800],[1024,768],[768,1024],[390,844]],'canonical responsive viewports must remain stable');
for(const route of ['#/home','#/boxes','#/intake','#/path','#/tools/nmap','#/report','#/dashboard'])assert(fixture.routes.includes(route),'responsive fixture missing route '+route);
assert(fixture.invariants.length>=7,'responsive fixture must record the core layout invariants');

for(const token of ['1280x800','1024x768','768x1024','390x844','#/home','#/boxes','#/intake','#/path','#/tools/nmap','#/report','#/dashboard','document-level horizontal overflow','qa-playwright-smoke'])assert(qa.includes(token),'responsive visual QA handoff missing '+token);

for(const forbidden of ['assets/obol-v9.11.css','assets/app-v9.11.js','assets/core-v9.11.js','data/project-model-v9.11.js'])assert(!exists(forbidden),'responsive pass must not create fake v9.11 runtime overlay: '+forbidden);

console.log('Responsive layout contract valid: workspace and Product Dashboard have bounded narrow-width reflow, local overflow for inherently wide controls, canonical viewport/route coverage, and no fake v9.11 runtime layer.');
