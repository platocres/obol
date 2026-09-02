'use strict';
const {test,expect}=require('@playwright/test');

function collectBrowserErrors(page){
 const errors=[];
 page.on('pageerror',error=>errors.push('pageerror: '+error.message));
 page.on('console',message=>{if(message.type()==='error')errors.push('console: '+message.text());});
 return errors;
}

async function waitForRoute(page,hash){
 await page.evaluate(next=>{window.location.hash=next;},hash);
 await expect.poll(async()=>{
  const view=page.locator('#view');
  if(!await view.count())return'';
  return (await view.innerText()).trim();
 },{timeout:8000}).not.toBe('');
}

const routes=[
 ['home','#/home'],
 ['targets','#/boxes'],
 ['evidence','#/artifacts'],
 ['next-steps','#/path'],
 ['report','#/report'],
 ['dashboard','#/dashboard']
];

test('core operator routes render without browser errors and capture screenshots',async({page},testInfo)=>{
 const errors=collectBrowserErrors(page);
 await page.goto('/index.html#/home',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#view')).toBeVisible();
 for(const [name,hash] of routes){
  await waitForRoute(page,hash);
  if(hash==='#/dashboard')await expect(page.locator('[data-product-dashboard-owner="current"]')).toBeVisible();
  await page.screenshot({path:testInfo.outputPath(name+'.png'),fullPage:true});
 }
 expect(errors,'browser console/page errors across core routes').toEqual([]);
});

test('dashboard never paints a historical owner before the current dashboard',async({page},testInfo)=>{
 const errors=collectBrowserErrors(page);
 await page.addInitScript(()=>{
  window.__OBOL_DASHBOARD_PAINTS__=[];
  const record=()=>{
   if(window.location.hash!=='#/dashboard')return;
   const view=document.getElementById('view');
   if(!view)return;
   const text=(view.innerText||'').trim();
   if(!text)return;
   const owned=view.querySelector('[data-product-dashboard-owner]');
   const sample={owner:owned?owned.getAttribute('data-product-dashboard-owner'):'',text:text.slice(0,500)};
   const previous=window.__OBOL_DASHBOARD_PAINTS__[window.__OBOL_DASHBOARD_PAINTS__.length-1];
   if(!previous||previous.owner!==sample.owner||previous.text!==sample.text)window.__OBOL_DASHBOARD_PAINTS__.push(sample);
  };
  new MutationObserver(record).observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['data-product-dashboard-owner']});
  document.addEventListener('DOMContentLoaded',record,{once:true});
 });
 await page.goto('/index.html#/dashboard',{waitUntil:'domcontentloaded'});
 await expect(page.locator('[data-product-dashboard-owner="current"]')).toBeVisible();
 const paints=await page.evaluate(()=>window.__OBOL_DASHBOARD_PAINTS__||[]);
 const dashboardPaints=paints.filter(p=>p.owner||/dashboard|product hardening|build next|orange|source depth/i.test(p.text));
 expect(dashboardPaints.length,'dashboard paint observer captured current route rendering').toBeGreaterThan(0);
 expect(dashboardPaints,'only the current loading/current dashboard may paint').toEqual(expect.arrayContaining([]));
 for(const paint of dashboardPaints)expect(['current-loading','current']).toContain(paint.owner);
 await page.screenshot({path:testInfo.outputPath('dashboard-direct-load.png'),fullPage:true});
 expect(errors,'browser console/page errors on direct dashboard load').toEqual([]);
});
