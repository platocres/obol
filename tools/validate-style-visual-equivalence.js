'use strict';

/*
 * Real-browser equivalence proof for the v9.45 stylesheet flattening.
 *
 * The shipped owner is a semantic cascade snapshot. For each representative route this
 * validator lets the application settle once, captures the shipped stylesheet, then
 * swaps only the existing assets/obol-current.css link to the exact ordered 69-fragment
 * v9.5/v9.40 cascade and captures the same live DOM again. Reusing one settled page per
 * route removes application timing/state noise while preserving the CSS request's
 * original /assets/ base and cascade position.
 */

const path=require('path');
const root=path.join(__dirname,'..');
const manifest=require(path.join(root,'data','runtime-manifest.js'));
const cascade=require('./style-cascade-current');

const baseUrl=process.env.OBOL_SMOKE_BASE_URL||'http://127.0.0.1:4173/index.html';
const executablePath=process.env.OBOL_SMOKE_BROWSER_PATH||undefined;
const settleMs=Number(process.env.OBOL_STYLE_EQUIVALENCE_SETTLE_MS||1200);
const routes=[
 {id:'home',hash:'#/home'},
 {id:'targets',hash:'#/boxes'},
 {id:'evidence',hash:'#/intake'},
 {id:'next-steps',hash:'#/path'},
 {id:'report',hash:'#/report'},
 {id:'tools',hash:'#/tools'},
 {id:'dashboard',hash:'#/dashboard',settleMs:5400}
];
const viewports=[
 {id:'desktop',width:1440,height:1000},
 {id:'mobile',width:390,height:844}
];
const historicalCss=cascade.historicalSource(root,manifest.compatibility.historicalStyles);
const styleOwner=manifest.compatibility.styleOwner;
const historicalSuffix='?obol-historical=1';
const IGNORED_REQUEST=/\/favicon\.ico(?:[?#]|$)/;

function local(url){try{return new URL(url).origin===new URL(baseUrl).origin;}catch(error){return false;}}

async function waitForDomStable(page,timeoutMs){
 const deadline=Date.now()+(timeoutMs||12000);
 let last=null,stable=0;
 while(Date.now()<deadline){
  const sig=await page.evaluate(()=>{
   const html=document.body?document.body.innerHTML:'';
   let hash=2166136261;
   for(let i=0;i<html.length;i++){hash^=html.charCodeAt(i);hash=Math.imul(hash,16777619);}
   return html.length+':'+(hash>>>0);
  });
  if(sig===last)stable++;else{last=sig;stable=0;}
  if(stable>=3)return sig;
  await page.waitForTimeout(200);
 }
 throw new Error('DOM did not settle before stylesheet comparison');
}

async function captureSnapshot(page){
 return page.evaluate(()=>{
  const round=value=>Math.round(Number(value||0)*10)/10;
  const PROPS=['display','position','top','right','bottom','left','boxSizing','width','height','minWidth','minHeight','maxWidth','maxHeight','marginTop','marginRight','marginBottom','marginLeft','paddingTop','paddingRight','paddingBottom','paddingLeft','color','backgroundColor','backgroundImage','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','borderTopStyle','borderRightStyle','borderBottomStyle','borderLeftStyle','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor','borderTopLeftRadius','borderTopRightRadius','borderBottomRightRadius','borderBottomLeftRadius','fontFamily','fontSize','fontWeight','fontStyle','lineHeight','letterSpacing','textAlign','textTransform','textDecorationLine','whiteSpace','wordBreak','overflowX','overflowY','visibility','opacity','zIndex','flexDirection','flexWrap','flexGrow','flexShrink','alignItems','alignContent','alignSelf','justifyContent','justifyItems','justifySelf','gridTemplateColumns','gridTemplateRows','gridAutoFlow','columnGap','rowGap','transform','transformOrigin','boxShadow','outlineWidth','outlineStyle','outlineColor','cursor','pointerEvents','objectFit'];
  const nodes=[document.documentElement,document.body,...document.body.querySelectorAll('*')].filter(node=>!['SCRIPT','STYLE','LINK','META','TITLE'].includes(node.tagName));
  const styleObject=style=>Object.fromEntries(PROPS.map(prop=>[prop,style[prop]]));
  const pseudo=(node,name)=>{const s=getComputedStyle(node,name),content=s.content;return content&&content!=='none'&&content!=='normal'?{content,...styleObject(s)}:null;};
  return{
   viewport:{width:innerWidth,height:innerHeight},
   rootVars:Object.fromEntries(['--bg','--panel','--panel2','--border','--fg','--dim','--accent','--accent2','--danger','--info','--mono'].map(name=>[name,getComputedStyle(document.documentElement).getPropertyValue(name).trim()])),
   nodes:nodes.map((node,index)=>{const rect=node.getBoundingClientRect(),s=getComputedStyle(node);return{index,tag:node.tagName,id:node.id||'',className:typeof node.className==='string'?node.className:'',rect:[round(rect.x),round(rect.y),round(rect.width),round(rect.height)],style:styleObject(s),before:pseudo(node,'::before'),after:pseudo(node,'::after')};})
  };
 });
}

async function settle(page,extraMs){
 await page.evaluate(async()=>{if(document.fonts&&document.fonts.ready)await document.fonts.ready;});
 await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'});
 await page.waitForTimeout(extraMs||settleMs);
 await waitForDomStable(page,Math.max(12000,(extraMs||settleMs)*3));
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}

async function capturePair(browser){
 const result={};
 for(const viewport of viewports){
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
  for(const route of routes){
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',error=>errors.push('page error: '+error.message));
   page.on('console',message=>{if(message.type()==='error'&&!/Failed to load resource/.test(message.text()))errors.push('console error: '+message.text());});
   page.on('response',response=>{if(local(response.url())&&response.status()>=400&&!IGNORED_REQUEST.test(response.url()))errors.push('HTTP '+response.status()+' for '+response.url());});
   await page.route('**/'+styleOwner+historicalSuffix,handler=>handler.fulfill({status:200,contentType:'text/css; charset=utf-8',body:historicalCss}));
   await page.goto(baseUrl+route.hash,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForSelector('#view',{state:'visible',timeout:15000});
   await page.waitForFunction(()=>{const view=document.querySelector('#view');return !!(view&&view.innerText&&view.innerText.trim().length>20);},null,{timeout:15000});
   if(route.id==='dashboard')await page.waitForSelector('[data-product-dashboard-owner="current"]',{state:'visible',timeout:15000});
   await settle(page,route.settleMs||settleMs);
   const domBefore=await waitForDomStable(page,12000);
   const current=await captureSnapshot(page);
   await page.evaluate(({styleOwner,historicalSuffix})=>new Promise((resolve,reject)=>{
    const wanted='/'+styleOwner.replace(/^\/+/, '');
    const link=[...document.querySelectorAll('link[rel~="stylesheet"]')].find(node=>{
     try{return new URL(node.href,location.href).pathname.endsWith(wanted);}catch(error){return false;}
    });
    if(!link){reject(new Error('stylesheet owner link not found: '+styleOwner));return;}
    const timer=setTimeout(()=>reject(new Error('historical stylesheet swap timed out')),10000);
    link.addEventListener('load',()=>{clearTimeout(timer);resolve(true);},{once:true});
    link.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('historical stylesheet swap failed'));},{once:true});
    link.href=new URL(styleOwner+historicalSuffix,location.href).href;
   }),{styleOwner,historicalSuffix});
   await page.evaluate(async()=>{if(document.fonts&&document.fonts.ready)await document.fonts.ready;});
   await page.waitForTimeout(150);
   const domAfter=await waitForDomStable(page,12000);
   if(domAfter!==domBefore)errors.push('stylesheet swap changed application DOM: current='+domBefore+' historical='+domAfter);
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const historical=await captureSnapshot(page);
   result[viewport.id+':'+route.id]={historical,current,errors};
   await page.close();
  }
  await context.close();
 }
 return result;
}

function firstDifference(a,b,pathName){
 if(a===b)return null;
 if(typeof a!==typeof b||a==null||b==null)return pathName+': historical='+JSON.stringify(a)+' current='+JSON.stringify(b);
 if(Array.isArray(a)&&Array.isArray(b)){
  if(a.length!==b.length)return pathName+'.length: historical='+a.length+' current='+b.length;
  for(let i=0;i<a.length;i++){const diff=firstDifference(a[i],b[i],pathName+'['+i+']');if(diff)return diff;}
  return null;
 }
 if(typeof a==='object'){
  const keys=[...new Set([...Object.keys(a),...Object.keys(b)])].sort();
  for(const key of keys){const diff=firstDifference(a[key],b[key],pathName+'.'+key);if(diff)return diff;}
  return null;
 }
 return pathName+': historical='+JSON.stringify(a)+' current='+JSON.stringify(b);
}

(async()=>{
 let chromium;
 try{({chromium}=require('playwright'));}
 catch(error){console.error('tools/validate-style-visual-equivalence.js needs Playwright.');process.exit(1);}
 const browser=await chromium.launch({headless:true,executablePath});
 const failures=[];
 try{
  const pairs=await capturePair(browser);
  for(const [key,pair] of Object.entries(pairs)){
   for(const error of pair.errors)failures.push(key+': '+error);
   const diff=firstDifference(pair.historical,pair.current,key);
   if(diff)failures.push(diff);
  }
 }finally{await browser.close();}
 if(failures.length){
  console.error('Stylesheet visual equivalence failed:');
  for(const failure of failures.slice(0,30))console.error('- '+failure);
  if(failures.length>30)console.error('- ... '+(failures.length-30)+' more');
  process.exit(1);
 }
 console.log('Stylesheet visual equivalence valid: '+routes.length+' routes × '+viewports.length+' viewports match the exact 69-fragment historical cascade on identical settled DOM in Chromium.');
})().catch(error=>{console.error(error&&error.stack||error);process.exit(1);});
