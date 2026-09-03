'use strict';
const assert=require('assert');
const baseUrl=process.env.OBOL_SMOKE_BASE_URL||'http://127.0.0.1:4173/index.html';
const executablePath=process.env.OBOL_SMOKE_BROWSER_PATH||undefined;
const manifest=require('../data/runtime-manifest.js');
const appArea=(manifest.bundles.areas||[]).find(area=>area.id==='app');
const HISTORICAL_APP_PATHS=Array.from(appArea&&appArea.fragments||[]);
(async()=>{
 let chromium;try{({chromium}=require('playwright'));}catch(_err){console.error('tools/validate-app-semantic-boot-browser.js needs Playwright.');process.exit(1);}
 const browser=await chromium.launch({headless:true,executablePath});
 try{
  const context=await browser.newContext({viewport:{width:1365,height:900},reducedMotion:'reduce'});
  const page=await context.newPage();
  const directHistorical=[];
  page.on('request',request=>{const pathname=new URL(request.url()).pathname;const hit=HISTORICAL_APP_PATHS.find(rel=>pathname.endsWith('/'+rel));if(hit)directHistorical.push({url:request.url(),fragment:hit});});
  await page.addInitScript(()=>{
   window.__OBOL_SEMANTIC_APP_FRAMES__=[];
   const sample=()=>{try{
    const body=document.body,view=document.getElementById('view'),html=document.documentElement;
    if(body&&view&&getComputedStyle(body).visibility!=='hidden')window.__OBOL_SEMANTIC_APP_FRAMES__.push({
     route:(location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home',
     boot:html.dataset.obolBoot||'',paint:html.dataset.obolCurrentPaint||'',
     home:!!view.querySelector('[data-current-home-owner="workflow-current"]'),
     path:!!view.querySelector('[data-operator-route-owner="path-current"]'),
     text:(view.innerText||'').trim().slice(0,120)
    });
   }catch(_err){}requestAnimationFrame(sample);};
   requestAnimationFrame(sample);
  });
  await page.route('**/assets/obol-app-current.js',async route=>{await new Promise(resolve=>setTimeout(resolve,1200));await route.continue();});
  await page.goto(baseUrl+'#/home',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.obolBoot==='ready'&&!!document.querySelector('#view [data-current-home-owner="workflow-current"]'),null,{timeout:20000});
  await page.waitForTimeout(6200);
  await page.evaluate(()=>{for(let i=0;i<3;i++)if(typeof window.route==='function')window.route();});
  await page.waitForTimeout(500);
  let result=await page.evaluate(()=>({frames:window.__OBOL_SEMANTIC_APP_FRAMES__.slice(),owner:window.__OBOL_CURRENT_APPLICATION_OWNER__,schedulers:window.__OBOL_HISTORICAL_APP_SCHEDULERS_DISABLED__,api:!!window.OBOL_CURRENT_APPLICATION,current:!!document.querySelector('#view [data-current-home-owner="workflow-current"]')}));
  assert.strictEqual(result.owner,'assets/obol-app-current.js','stable semantic application owner is active');
  assert.strictEqual(result.schedulers,true,'historical application schedulers are retired');
  assert(result.api,'stable current application/router API is exposed');
  assert(result.current,'Home remains current-owned after the entire historical timer horizon and forced reroutes');
  const badHome=result.frames.find(frame=>frame.route==='home'&&(!frame.home||frame.boot!=='ready'||frame.paint!=='home'));
  assert(!badHome,'no historical or unfinished Home frame may become visible across the full timer horizon: '+JSON.stringify(badHome));

  const pathStart=await page.evaluate(()=>window.__OBOL_SEMANTIC_APP_FRAMES__.length);
  await page.evaluate(()=>{location.hash='#/path';});
  await page.waitForSelector('#view [data-operator-route-owner="path-current"]',{state:'attached',timeout:15000});
  await page.waitForTimeout(3200);
  const badPath=await page.evaluate(start=>window.__OBOL_SEMANTIC_APP_FRAMES__.slice(start).find(frame=>frame.route==='path'&&!frame.path)||null,pathStart);
  assert(!badPath,'no historical Next Steps frame may become visible after current navigation ownership: '+JSON.stringify(badPath));

  const homeStart=await page.evaluate(()=>window.__OBOL_SEMANTIC_APP_FRAMES__.length);
  await page.evaluate(()=>{location.hash='#/home';});
  await page.waitForSelector('#view [data-current-home-owner="workflow-current"]',{state:'attached',timeout:15000});
  await page.waitForTimeout(3200);
  const badReturn=await page.evaluate(start=>window.__OBOL_SEMANTIC_APP_FRAMES__.slice(start).find(frame=>frame.route==='home'&&!frame.home)||null,homeStart);
  assert(!badReturn,'return navigation never exposes historical Home presentation: '+JSON.stringify(badReturn));
  assert.deepStrictEqual(directHistorical,[],'browser must not request versioned historical application files directly: '+JSON.stringify(directHistorical));
  await context.close();
  console.log('Semantic application browser proof valid: delayed cold boot plus >6.2s Home settle, forced reroutes, Path navigation, and return Home produced no visible historical application frame and no direct historical application request.');
 }finally{await browser.close();}
})().catch(err=>{console.error(err&&err.stack||err);process.exit(1);});
