'use strict';

const fs=require('fs');
const path=require('path');
const assert=require('assert');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const css=read('assets/accessibility.css');
const dashboardCss=read('assets/product-hardening-dashboard.css');
const keyboard=read('assets/accessibility.js');
const app=read('assets/app-v8.8.js');
const qa=read('docs/visual-qa/contrast-focus.md');

function hexVar(text,name){
 const match=text.match(new RegExp('--'+name+':\\s*(#[0-9a-f]{6})','i'));
 assert(match,'missing CSS variable --'+name);
 return match[1];
}
function luminance(hex){
 const rgb=hex.replace('#','').match(/../g).map(pair=>parseInt(pair,16)/255).map(v=>v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4));
 return 0.2126*rgb[0]+0.7152*rgb[1]+0.0722*rgb[2];
}
function contrast(a,b){
 const aa=luminance(a),bb=luminance(b),hi=Math.max(aa,bb),lo=Math.min(aa,bb);
 return (hi+0.05)/(lo+0.05);
}
function requireContrast(label,fg,bgs,min){
 for(const bg of bgs){
  const ratio=contrast(fg,bg);
  assert(ratio>=min,`${label} ${fg} contrast ${ratio.toFixed(2)}:1 against ${bg} is below ${min}:1`);
 }
}

const link=hexVar(css,'obol-link');
const hover=hexVar(css,'obol-link-hover');
const focus=hexVar(css,'obol-focus');
requireContrast('workspace link',link,['#0d1117','#161b22','#1c2330'],4.5);
requireContrast('workspace link hover',hover,['#0d1117','#161b22','#1c2330'],4.5);
requireContrast('workspace focus indicator',focus,['#0d1117','#161b22','#1c2330'],3);

const dashboardLink=hexVar(dashboardCss,'obol-link');
const dashboardHover=hexVar(dashboardCss,'obol-link-hover');
const dashboardFocus=hexVar(dashboardCss,'obol-focus');
requireContrast('dashboard link',dashboardLink,['#071019','#0d1b2a','#10243a'],4.5);
requireContrast('dashboard link hover',dashboardHover,['#071019','#0d1b2a','#10243a'],4.5);
requireContrast('dashboard focus indicator',dashboardFocus,['#071019','#0d1b2a','#10243a'],3);

for(const token of [':focus-visible','outline:3px solid var(--obol-focus)','@media (forced-colors:active)','main a:not(.btn)','[data-obol-keyboard-button="true"]'])assert(css.includes(token),'workspace accessibility CSS missing '+token);
for(const token of ['.ph-link:hover','.ph-link:focus-visible','outline:3px solid var(--obol-focus)','@media(forced-colors:active)'])assert(dashboardCss.includes(token),'dashboard accessibility CSS missing '+token);

for(const token of ['.card-head','.state-card','.phase-chip','.variant-pill','.fact','.progress-pill','.timer','.lane-tab','#banner-x',"event.key==='Enter'","event.key===' '","event.key==='Tab'","aria-modal","lastDialogFocus","role','button","tabIndex=0","aria-live'])assert(keyboard.includes(token),'keyboard/focus owner missing '+token);
assert(keyboard.includes("observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']})"),'dynamic UI mutations are not accessibility-enhanced');
assert(app.includes("addStyle88('assets/accessibility.css')")&&app.includes("addScript88('assets/accessibility.js')"),'live browser bridge does not load stable accessibility owners');

for(const token of ['Screenshot-assisted','#/home','#/boxes','#/intake','#/path','#/report','#/dashboard','1280','1024','768','Tab','Shift+Tab','Enter','Space'])assert(qa.includes(token),'visual QA checklist missing '+token);

console.log('Accessibility contract valid: link/hover colors meet AA contrast on supported dark surfaces, focus indicators exceed 3:1, keyboard activation/modal focus management are wired, and screenshot-assisted QA coverage is documented.');
