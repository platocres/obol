'use strict';

/*
 * Browser-level equivalence proof for the v9.43 application-area retirement.
 *
 * This compares the shipped application owner against a pre-retirement owner that
 * replays the retired application overlays. Later product-hardening extensions may
 * project current field notes, card titles, queue counts, and lane ordering after
 * the application owner has rendered. Those current projections are tested by their
 * own release suites and route smoke tests, so this proof normalizes only those
 * bounded current projections before comparing the retired application owner.
 */

const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const manifest=require(path.join(root,'data','runtime-manifest.js'));
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\r\n/g,'\n');
const baseUrl=process.env.OBOL_SMOKE_BASE_URL||'http://127.0.0.1:4173/index.html';
const executablePath=process.env.OBOL_SMOKE_BROWSER_PATH||undefined;
const settleMs=Number(process.env.OBOL_APP_EQUIVALENCE_SETTLE_MS||6000);

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
function historicalChain(){
 const order=manifest.scripts,wanted=new Set([...area.fragments,...retired]);
 return order.filter(rel=>wanted.has(rel));
}
function segment(rel){return '/* obol-runtime-fragment: '+rel+' */\n'+read(rel).replace(/\s+$/,'')+manifest.bundles.separator;}
function variantOwner(){return '/* Built by tools/validate-app-dom-equivalence.js, not shipped. */\n'+historicalChain().map(segment).join('');}
const IGNORED_REQUEST=/\/favicon\.ico(?:[?#]|$)/;
function normalizeHtml(html){
 return String(html||'')
  .replace(/data-dashboard-freshness="[^"]*"/g,'data-dashboard-freshness="[nonce]"')
  .replace(/Authorization Boundary Replay|Separate Client Bypass from Server Authorization/g,'[web-authz-card-title]')
  .replace(/data-card-evidence-open="(?:web-authz-boundaries|web-client-session-proof-chain|web-proxy-transform-proof-chain|web-client-controls|encoded-parameter-review)"/g,'data-card-evidence-open="[web-authz-card]"')
  .replace(/\b(\d+\/\d+ units · )\d+( queued)\b/g,'$1[queued]$2');
}
async function capture(browser,ownerBody){
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const snapshots={};
 for(const route of routes){
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push('page error: '+error.message));
  page.on('console',message=>{if(message.type()==='error'&&!/Failed to load resource/.test(message.text()))errors.push('console error: '+message.text());});
  page.on('response',response=>{if(response.status()>=400&&!IGNORED_REQUEST.test(response.url()))errors.push('HTTP '+response.status()+' for '+response.url());});
  if(ownerBody)await page.route('**/'+area.owner,handler=>handler.fulfill({status:200,contentType:'application/javascript; charset=utf-8',body:ownerBody}));
  await page.goto(baseUrl+route.hash,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('#view',{state:'visible',timeout:15000});
  await page.waitForFunction(()=>{const view=document.querySelector('#view');return !!(view&&view.innerText&&view.innerText.trim().length>10);},null,{timeout:15000}).catch(()=>{});
  await page.waitForTimeout(settleMs);
  const dom=await page.evaluate(()=>{
   const view=document.querySelector('#view'),tagline=document.querySelector('.tagline'),clone=view?view.cloneNode(true):null;
   if(clone){
    clone.querySelectorAll('#operator-support31,[data-field-notes-path],.field-notes-current').forEach(node=>node.remove());
    const laneParents=new Set(Array.from(clone.querySelectorAll('.lane-tab[data-lane]')).map(tab=>tab.parentElement).filter(Boolean));
    laneParents.forEach(parent=>{
     const tabs=Array.from(parent.children).filter(child=>child.classList&&child.classList.contains('lane-tab')&&child.dataset&&child.dataset.lane);
     tabs.sort((a,b)=>String(a.dataset.lane).localeCompare(String(b.dataset.lane))||String(a.textContent).localeCompare(String(b.textContent)));
     tabs.forEach(tab=>parent.appendChild(tab));
    });
    clone.querySelectorAll('.card-preview-actions').forEach(actions=>{
     const open=actions.querySelector('[data-card-evidence-open]');
     const id=open&&String(open.getAttribute('data-card-evidence-open')||'');
     if(/web-authz-boundaries|web-client-session-proof-chain|web-proxy-transform-proof-chain|web-client-controls|encoded-parameter-review/.test(id)){
      open.setAttribute('data-card-evidence-open','[web-authz-card]');
      let node=actions.parentElement;
      for(let i=0;node&&i<4;i++,node=node.parentElement){
       const title=node.querySelector&&node.querySelector('.title');
       if(title){title.textContent='[web-authz-card-title]';break;}
      }
     }
    });
   }
   return{title:document.title,tagline:tagline?tagline.textContent:'',html:clone?clone.innerHTML:''};
  });
  snapshots[route.id]={...dom,html:normalizeHtml(dom.html),errors};
  await page.close();
 }
 await context.close();
 return snapshots;
}
function firstDifference(a,b){let i=0;while(i<a.length&&i<b.length&&a[i]===b[i])i++;const from=Math.max(0,i-100);return 'at offset '+i+'\n  historical: '+JSON.stringify(a.slice(from,i+220))+'\n  current:    '+JSON.stringify(b.slice(from,i+220));}
(async()=>{
 let chromium;
 try{({chromium}=require('playwright'));}
 catch(err){console.error('tools/validate-app-dom-equivalence.js needs Playwright. Install it with:');console.error('  npm install --no-save --no-package-lock playwright');process.exit(1);}
 const browser=await chromium.launch({headless:true,executablePath});
 const failures=[];
 try{
  const current=await capture(browser,null),historical=await capture(browser,variantOwner());
  for(const route of routes){
   const a=historical[route.id],b=current[route.id];
   if(a.title!==b.title)failures.push(route.id+': title differs - historical '+JSON.stringify(a.title)+' vs current '+JSON.stringify(b.title));
   if(a.tagline!==b.tagline)failures.push(route.id+': tagline differs - historical '+JSON.stringify(a.tagline)+' vs current '+JSON.stringify(b.tagline));
   if(a.html!==b.html)failures.push(route.id+': rendered DOM differs '+firstDifference(a.html,b.html));
   for(const error of b.errors)if(!a.errors.includes(error))failures.push(route.id+': retirement introduced '+error);
  }
 }finally{await browser.close();}
 if(failures.length){console.error('Application DOM equivalence failed for the v9.43 retirement:');for(const failure of failures)console.error('- '+failure);process.exit(1);}
 console.log('Application DOM equivalence valid: '+routes.length+' routes render identical DOM with and without the '+retired.length+' retired release-wave overlays.');
})().catch(error=>{console.error(error&&error.stack||error);process.exit(1);});
