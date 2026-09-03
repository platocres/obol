'use strict';
const assert=require('assert');
const manifest=require('../data/runtime-manifest.js');
const appArea=(manifest.bundles&&manifest.bundles.areas||[]).find(area=>area.id==='app');
if(!appArea)throw new Error('runtime manifest does not declare the application ownership area');
const baseUrl=process.env.OBOL_SMOKE_BASE_URL||'http://127.0.0.1:4173/index.html';
const executablePath=process.env.OBOL_SMOKE_BROWSER_PATH||undefined;
(async()=>{
 let chromium;try{({chromium}=require('playwright'));}catch(_err){console.error('tools/validate-single-paint-boot-browser.js needs Playwright.');process.exit(1);}
 const browser=await chromium.launch({headless:true,executablePath});
 try{
  const context=await browser.newContext({viewport:{width:1365,height:900},reducedMotion:'reduce'});const page=await context.newPage();
  await page.addInitScript(()=>{window.__OBOL_VISIBLE_BOOT_FRAMES__=[];const sample=()=>{try{const body=document.body,view=document.getElementById('view'),html=document.documentElement;if(body&&view&&getComputedStyle(body).visibility!=='hidden'){window.__OBOL_VISIBLE_BOOT_FRAMES__.push({boot:html.dataset.obolBoot||'',paint:html.dataset.obolCurrentPaint||'',current:!!view.querySelector('[data-current-home-owner="workflow-current"]'),text:(view.innerText||'').trim().slice(0,160)});}}catch(_err){}requestAnimationFrame(sample);};requestAnimationFrame(sample);});
  await page.route('**/'+appArea.owner,async route=>{await new Promise(resolve=>setTimeout(resolve,1200));await route.continue();});
  await page.goto(baseUrl+'#/home',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.obolBoot==='ready'&&document.documentElement.dataset.obolCurrentPaint==='home'&&!!document.querySelector('#view [data-current-home-owner="workflow-current"]'),null,{timeout:20000});
  await page.waitForTimeout(350);
  const result=await page.evaluate(()=>{const release=window.OBOL_CURRENT_RELEASE||null;return{frames:window.__OBOL_VISIBLE_BOOT_FRAMES__.slice(),boot:document.documentElement.dataset.obolBoot,paint:document.documentElement.dataset.obolCurrentPaint,first:window.__OBOL_CURRENT_FIRST_VISIBLE_ROUTE__,title:document.title,tagline:(document.querySelector('.tagline')||{}).textContent||'',current:!!document.querySelector('#view [data-current-home-owner="workflow-current"]'),text:(document.getElementById('view').innerText||'').slice(0,200),release:release?{label:release.label,phaseLabel:release.phaseLabel}:null};});
  assert.strictEqual(result.boot,'ready');assert.strictEqual(result.paint,'home');assert.strictEqual(result.first,'home');assert(result.current,'explicit current Home owner is rendered');
  assert(result.release&&result.release.label&&result.release.phaseLabel,'current release authority is available in the browser');
  assert.strictEqual(result.title,'Obol '+result.release.label+' — '+result.release.phaseLabel,'browser title matches the current release authority before first visible paint');
  assert(result.tagline.includes(result.release.label),'visible tagline matches the current release authority');
  assert(result.frames.length>0,'at least one visible frame was sampled');
  const bad=result.frames.find(frame=>!frame.current||frame.paint!=='home'||frame.boot!=='ready');
  assert(!bad,'no historical/unfinished Home frame may become visible: '+JSON.stringify(bad));
  await context.close();
  console.log('Single-paint boot valid: delaying the current application owner by 1200ms produced no visible historical Home frame before the explicit current route owner claimed first paint.');
 }finally{await browser.close();}
})().catch(err=>{console.error(err&&err.stack||err);process.exit(1);});
