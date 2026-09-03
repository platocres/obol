'use strict';

/*
 * Real-browser equivalence proof for the v9.45 stylesheet flattening.
 *
 * The shipped owner is a semantic cascade snapshot. For the historical side this
 * validator intercepts only assets/obol-current.css and serves the exact ordered
 * 69-fragment v9.5/v9.40 cascade in its place. All JavaScript/current auxiliary CSS
 * is identical between the two sides. It then compares layout geometry and a broad
 * computed-style surface for every rendered element and its visible pseudo-elements
 * across representative operator routes at desktop and mobile widths.
 */

const fs=require('fs');
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
const IGNORED_REQUEST=/\/favicon\.ico(?:[?#]|$)/;

function local(url){try{return new URL(url).origin===new URL(baseUrl).origin;}catch(error){return false;}}

async function capture(browser,historical){
 const result={};
 for(const viewport of viewports){
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
  for(const route of routes){
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',error=>errors.push('page error: '+error.message));
   page.on('console',message=>{if(message.type()==='error'&&!/Failed to load resource/.test(message.text()))errors.push('console error: '+message.text());});
   page.on('response',response=>{if(local(response.url())&&response.status()>=400&&!IGNORED_REQUEST.test(response.url()))errors.push('HTTP '+response.status()+' for '+response.url());});
   if(historical){
    await page.route('**/'+styleOwner,handler=>handler.fulfill({status:200,contentType:'text/css; charset=utf-8',body:historicalCss}));
   }
   await page.goto(baseUrl+route.hash,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForSelector('#view',{state:'visible',timeout:15000});
   await page.waitForFunction(()=>{const view=document.querySelector('#view');return !!(view&&view.innerText&&view.innerText.trim().length>20);},null,{timeout:15000});
   if(route.id==='dashboard')await page.waitForSelector('[data-product-dashboard-owner="current"]',{state:'visible',timeout:15000});
   await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'});
   await page.waitForTimeout(route.settleMs||settleMs);
   const snapshot=await page.evaluate(()=>{
    const round=value=>Math.round(Number(value||0)*10)/10;
    const PROPS=['display','position','top','right','bottom','left','boxSizing','width','height','minWidth','minHeight','maxWidth','maxHeight','marginTop','marginRight','marginBottom','marginLeft','paddingTop','paddingRight','paddingBottom','paddingLeft','color','backgroundColor','backgroundImage','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','borderTopStyle','borderRightStyle','borderBottomStyle','borderLeftStyle','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor','borderTopLeftRadius','borderTopRightRadius','borderBottomRightRadius','borderBottomLeftRadius','fontFamily','fontSize','fontWeight','fontStyle','lineHeight','letterSpacing','textAlign','textTransform','textDecorationLine','whiteSpace','wordBreak','overflowX','overflowY','visibility','opacity','zIndex','flexDirection','flexWrap','flexGrow','flexShrink','alignItems','alignContent','alignSelf','justifyContent','justifyItems','justifySelf','gridTemplateColumns','gridTemplateRows','gridAutoFlow','columnGap','rowGap','transform','transformOrigin','boxShadow','outlineWidth','outlineStyle','outlineColor','cursor','pointerEvents','objectFit'];
    const nodes=[document.documentElement,document.body,...document.body.querySelectorAll('*')].filter(node=>!['SCRIPT','STYLE','LINK','META','TITLE'].includes(node.tagName));
    const styleObject=style=>Object.fromEntries(PROPS.map(prop=>[prop,style[prop]]));
    const pseudo=(node,name)=>{const s=getComputedStyle(node,name),content=s.content;return content&&content!=='none'&&content!=='normal'?{content,...styleObject(s)}:null;};
    return {
     viewport:{width:innerWidth,height:innerHeight},
     rootVars:Object.fromEntries(['--bg','--panel','--panel2','--border','--fg','--dim','--accent','--accent2','--danger','--info','--mono'].map(name=>[name,getComputedStyle(document.documentElement).getPropertyValue(name).trim()])),
     nodes:nodes.map((node,index)=>{
      const rect=node.getBoundingClientRect(),s=getComputedStyle(node);
      return{index,tag:node.tagName,id:node.id||'',className:typeof node.className==='string'?node.className:'',rect:[round(rect.x),round(rect.y),round(rect.width),round(rect.height)],style:styleObject(s),before:pseudo(node,'::before'),after:pseudo(node,'::after')};
     })
    };
   });
   result[viewport.id+':'+route.id]={snapshot,errors};
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
  const current=await capture(browser,false);
  const historical=await capture(browser,true);
  for(const key of Object.keys(current)){
   const a=historical[key],b=current[key];
   for(const error of b.errors)if(!a.errors.includes(error))failures.push(key+': semantic stylesheet introduced '+error);
   const diff=firstDifference(a.snapshot,b.snapshot,key);
   if(diff)failures.push(diff);
  }
 }finally{await browser.close();}
 if(failures.length){
  console.error('Stylesheet visual equivalence failed:');
  for(const failure of failures.slice(0,30))console.error('- '+failure);
  if(failures.length>30)console.error('- ... '+(failures.length-30)+' more');
  process.exit(1);
 }
 console.log('Stylesheet visual equivalence valid: '+routes.length+' routes × '+viewports.length+' viewports match the exact 69-fragment historical cascade in Chromium.');
})().catch(error=>{console.error(error&&error.stack||error);process.exit(1);});
