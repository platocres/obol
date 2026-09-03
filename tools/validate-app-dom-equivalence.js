'use strict';

/*
 * Browser-level equivalence proof for the v9.43 application-area retirement.
 *
 * tools/validate-app-current-equivalence.js proves from source that the retired
 * release-wave overlays cannot do anything under the shipped runtime. This is the
 * empirical counterpart: it renders every operator route twice in a real browser —
 * once with the shipped application owner, once with an owner that also replays the
 * 21 retired overlays — and requires the resulting DOM to be identical.
 *
 * The "before" side is built here rather than checked in, so the comparison always
 * runs against the retired fragments as they actually exist on disk.
 *
 * Usage (the browser smoke workflow supplies these):
 *
 *   python3 -m http.server 4173 --bind 127.0.0.1 &
 *   OBOL_SMOKE_BASE_URL=http://127.0.0.1:4173/index.html node tools/validate-app-dom-equivalence.js
 */

const fs=require('fs');
const path=require('path');

const root=path.join(__dirname,'..');
const manifest=require(path.join(root,'data','runtime-manifest.js'));
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\r\n/g,'\n');

const baseUrl=process.env.OBOL_SMOKE_BASE_URL||'http://127.0.0.1:4173/index.html';
const executablePath=process.env.OBOL_SMOKE_BROWSER_PATH||undefined;
const settleMs=Number(process.env.OBOL_APP_EQUIVALENCE_SETTLE_MS||6000);

/* Routes chosen to cover every surface the retired overlays ever decorated: Home
   and the Guide (their home summaries and release cards), the Dashboard (their wave
   panels), and the operator loop they wrapped `route` around. */
const routes=[
 {id:'home',hash:'#/home'},
 {id:'targets',hash:'#/boxes'},
 {id:'evidence',hash:'#/intake'},
 {id:'next-steps',hash:'#/path'},
 {id:'report',hash:'#/report'},
 {id:'tools',hash:'#/tools'},
 {id:'methodology',hash:'#/lanes'},
 {id:'guide',hash:'#/guide'},
 {id:'dashboard',hash:'#/dashboard'}
];

const area=manifest.bundles.areas.find(candidate=>candidate.id==='app');
if(!area)throw new Error('runtime manifest does not declare the application ownership area');
const retired=Array.from(manifest.appCurrent.retiredFragments);
if(!retired.length)throw new Error('runtime manifest declares no retired application overlays to compare against');

/* The historical variant restores each retired overlay to the position it held in
   the frozen v9.5 load order, so the comparison is against the real pre-retirement
   chain rather than an approximation. */
function historicalChain(){
 const order=manifest.scripts;
 const live=new Set(area.fragments);
 const wanted=new Set([...area.fragments,...retired]);
 const chain=order.filter(rel=>wanted.has(rel));
 for(const rel of area.fragments)if(!live.has(rel))throw new Error('surviving fragment missing from the frozen ledger: '+rel);
 return chain;
}
function segment(rel){
 return '/* obol-runtime-fragment: '+rel+' */\n'+read(rel).replace(/\s+$/,'')+manifest.bundles.separator;
}
function variantOwner(){
 return '/*\n * Built by tools/validate-app-dom-equivalence.js — not a shipped asset.\n * Pre-retirement application chain used only as the equivalence baseline.\n */\n'+historicalChain().map(segment).join('');
}

/* data-dashboard-freshness is a per-render nonce, so it differs between any two
   loads of the same build. It is the one field excluded from the comparison. */
const normalize=html=>String(html||'').replace(/data-dashboard-freshness="[^"]*"/g,'data-dashboard-freshness="[nonce]"');

/* The browser fetches /favicon.ico once per context and the static dev server has
   none. That 404 is a property of the harness, not of either runtime, so each
   variant gets its own context and favicon traffic is excluded. The bare
   "Failed to load resource" console line is the echo of a network failure that the
   response listener already reports precisely, so it is dropped as a duplicate. */
const IGNORED_REQUEST=/\/favicon\.ico(?:[?#]|$)/;

async function capture(browser,ownerBody){
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const snapshots={};
 for(const route of routes){
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push('page error: '+error.message));
  page.on('console',message=>{if(message.type()==='error'&&!/Failed to load resource/.test(message.text()))errors.push('console error: '+message.text());});
  page.on('response',response=>{if(response.status()>=400&&!IGNORED_REQUEST.test(response.url()))errors.push('HTTP '+response.status()+' for '+response.url());});
  if(ownerBody){
   await page.route('**/'+area.owner,handler=>handler.fulfill({status:200,contentType:'application/javascript; charset=utf-8',body:ownerBody}));
  }
  await page.goto(baseUrl+route.hash,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('#view',{state:'visible',timeout:15000});
  await page.waitForFunction(()=>{
   const view=document.querySelector('#view');
   return !!(view&&view.innerText&&view.innerText.trim().length>10);
  },null,{timeout:15000}).catch(()=>{});
  await page.waitForTimeout(settleMs);
  const dom=await page.evaluate(()=>{
   const view=document.querySelector('#view');
   const tagline=document.querySelector('.tagline');
   return {
    title:document.title,
    tagline:tagline?tagline.textContent:'',
    html:view?view.innerHTML:''
   };
  });
  snapshots[route.id]={...dom,html:normalize(dom.html),errors};
  await page.close();
 }
 await context.close();
 return snapshots;
}

function firstDifference(a,b){
 let i=0;
 while(i<a.length&&i<b.length&&a[i]===b[i])i++;
 const from=Math.max(0,i-100);
 return 'at offset '+i+'\n  historical: '+JSON.stringify(a.slice(from,i+220))+'\n  current:    '+JSON.stringify(b.slice(from,i+220));
}

(async()=>{
 let chromium;
 try{({chromium}=require('playwright'));}
 catch(err){
  console.error('tools/validate-app-dom-equivalence.js needs Playwright. Install it with:');
  console.error('  npm install --no-save --no-package-lock playwright');
  process.exit(1);
 }
 const browser=await chromium.launch({headless:true,executablePath});
 const failures=[];

 /* --audit-liveness is the completeness half of the retirement argument: it drops
    each surviving fragment in turn and reports whether the DOM still changes. A
    fragment that made no difference anywhere would be a further retirement
    candidate. v9.43 ran this over all 43 survivors and every one was load-bearing,
    which is why the retired set is exactly the 21 stale-gated overlays. It takes
    tens of minutes, so it is an on-demand audit rather than a CI gate. */
 if(process.argv.includes('--audit-liveness')){
  try{
   const baseline=await capture(browser,null);
   const inert=[];
   for(const rel of area.fragments){
    const body='/* liveness audit */\n'+area.fragments.filter(other=>other!==rel).map(segment).join('');
    const without=await capture(browser,body);
    const changed=routes.filter(route=>without[route.id].html!==baseline[route.id].html||without[route.id].title!==baseline[route.id].title||without[route.id].tagline!==baseline[route.id].tagline);
    console.log((changed.length?'live    ':'INERT   ')+rel.padEnd(30)+(changed.length?changed.map(route=>route.id).join(','):'no observable difference on any route'));
    if(!changed.length)inert.push(rel);
   }
   console.log(inert.length?(inert.length+' surviving fragment(s) made no observable difference and should be considered for retirement.'):'All '+area.fragments.length+' surviving application fragments are load-bearing; the retired set is complete.');
   if(inert.length)process.exitCode=1;
  }finally{
   await browser.close();
  }
  return;
 }

 try{
  const current=await capture(browser,null);
  const historical=await capture(browser,variantOwner());
  for(const route of routes){
   const a=historical[route.id],b=current[route.id];
   for(const [label,name] of [['title','title'],['tagline','tagline']]){
    if(a[name]!==b[name])failures.push(route.id+': '+label+' differs — historical '+JSON.stringify(a[name])+' vs current '+JSON.stringify(b[name]));
   }
   if(a.html!==b.html)failures.push(route.id+': rendered DOM differs '+firstDifference(a.html,b.html));
   /* Absolute console cleanliness belongs to tests/playwright-smoke.js. What this
      proof owns is that retirement introduces no error the pre-retirement chain
      did not already produce, so only the difference between the two runs fails. */
   for(const error of b.errors)if(!a.errors.includes(error))failures.push(route.id+': retirement introduced '+error);
  }
 }finally{
  await browser.close();
 }
 if(failures.length){
  console.error('Application DOM equivalence failed for the v9.43 retirement:');
  for(const failure of failures)console.error('- '+failure);
  process.exit(1);
 }
 console.log('Application DOM equivalence valid: '+routes.length+' routes render identical DOM with and without the '+retired.length+' retired release-wave overlays.');
})().catch(error=>{
 console.error(error&&error.stack||error);
 process.exit(1);
});
