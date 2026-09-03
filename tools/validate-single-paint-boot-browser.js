'use strict';
const assert=require('assert');
const baseUrl=process.env.OBOL_SMOKE_BASE_URL||'http://127.0.0.1:4173/index.html';
const executablePath=process.env.OBOL_SMOKE_BROWSER_PATH||undefined;
(async()=>{
 let chromium;try{({chromium}=require('playwright'));}catch(_err){console.error('tools/validate-single-paint-boot-browser.js needs Playwright.');process.exit(1);}
 const browser=await chromium.launch({headless:true,executablePath});
 try{
  const context=await browser.newContext({viewport:{width:1365,height:900},reducedMotion:'reduce'});const page=await context.newPage();
  await page.addInitScript(()=>{window.__OBOL_VISIBLE_BOOT_FRAMES__=[];const sample=()=>{try{const body=document.body,view=document.getElementById('view'),html=document.documentElement;if(body&&view&&getComputedStyle(body).visibility!=='hidden'){window.__OBOL_VISIBLE_BOOT_FRAMES__.push({boot:html.dataset.obolBoot||'',paint:html.dataset.obolCurrentPaint||'',current:!!view.querySelector('.home-head30.current-home98,.home-head30'),text:(view.innerText||'').trim().slice(0,160)});}}catch(_err){}requestAnimationFrame(sample);};requestAnimationFrame(sample);});
  await page.route('**/assets/workflow-current.js',async route=>{await new Promise(resolve=>setTimeout(resolve,1200));await route.continue();});
  await page.goto(baseUrl+'#/home',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.obolBoot==='ready'&&document.documentElement.dataset.obolCurrentPaint==='home'&&!!document.querySelector('#view .home-head30'),null,{timeout:20000});
  await page.waitForTimeout(350);
  const result=await page.evaluate(()=>({frames:window.__OBOL_VISIBLE_BOOT_FRAMES__.slice(),boot:document.documentElement.dataset.obolBoot,paint:document.documentElement.dataset.obolCurrentPaint,first:window.__OBOL_CURRENT_FIRST_VISIBLE_ROUTE__,title:document.title,tagline:(document.querySelector('.tagline')||{}).textContent||'',current:!!document.querySelector('#view .home-head30'),text:(document.getElementById('view').innerText||'').slice(0,200)}));
  assert.strictEqual(result.boot,'ready');assert.strictEqual(result.paint,'home');assert.strictEqual(result.first,'home');assert(result.current,'current Home is rendered');
  assert(/Obol v9\.46 — Product Hardening/.test(result.title),'browser title is current from first parse');assert(/v9\.46/.test(result.tagline),'visible tagline is current');
  assert(result.frames.length>0,'at least one visible frame was sampled');
  const bad=result.frames.find(frame=>!frame.current||frame.paint!=='home'||frame.boot!=='ready');
  assert(!bad,'no historical/unfinished Home frame may become visible: '+JSON.stringify(bad));
  await context.close();
  console.log('Single-paint boot valid: delaying workflow-current.js by 1200ms produced no visible historical Home frame before the current route claimed first paint.');
 }finally{await browser.close();}
})().catch(err=>{console.error(err&&err.stack||err);process.exit(1);});
