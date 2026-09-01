// Obol v8.8 UI delta plus stable v9 product-hardening bridge.
'use strict';
(function(){
const RELEASE_SOURCE='data/current-release.js';
const WORKFLOW_SOURCE='assets/workflow-current.js';
// Historical v9.0 bridge-observation markers. These are inert compatibility markers only;
// current dashboard/workflow ownership lives in assets/workflow-current.js and
// assets/product-hardening-dashboard.js rather than a release-specific app bridge.
// renderProductDashboard88
// window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES
// active product-hardening queue surface
let releaseLoading=null,workflowLoading=null,productAssetsLoading=null,accessibilityLoading=null,releaseContractsInstalled=false;
function active88(){return typeof C!=='undefined'&&C.VERSION==='8.8.0';}
function page88(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function e88(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function release88(){return window.OBOL_CURRENT_RELEASE||null;}
function identity88(){return window.OBOL_RELEASE_IDENTITY||null;}
function addStyle88(href){if(document.querySelector('link[data-obol-product-hardening="'+href+'"]')||document.querySelector('link[href="'+href+'"]'))return;const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.obolProductHardening=href;document.head.appendChild(link);}
function addScript88(src){if(document.querySelector('script[data-obol-product-hardening="'+src+'"]')||document.querySelector('script[src="'+src+'"]'))return Promise.resolve();return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.dataset.obolProductHardening=src;s.onload=resolve;s.onerror=()=>reject(new Error('failed to load '+src));document.head.appendChild(s);});}
function ensureAccessibility88(){addStyle88('assets/accessibility.css');if(accessibilityLoading)return accessibilityLoading;accessibilityLoading=addScript88('assets/accessibility.js');return accessibilityLoading;}
function stampReleaseState88(){const i=identity88();if(!i||typeof i.stampState!=='function'||typeof state==='undefined'||!state)return;i.stampState(state);}
function versionReport88(md){const i=identity88();return i&&typeof i.normalizeReportMarkdown==='function'?i.normalizeReportMarkdown(md):String(md||'');}
function installReleaseContracts88(){if(releaseContractsInstalled||!release88()||!identity88())return;releaseContractsInstalled=true;stampReleaseState88();if(C&&typeof C.sanitizedCopy==='function'&&!C.sanitizedCopy.__obolReleaseAuthority){const old=C.sanitizedCopy;const wrapped=function(s){const safe=old(s),i=identity88();return i&&typeof i.stampState==='function'?i.stampState(safe):safe;};wrapped.__obolReleaseAuthority=true;C.sanitizedCopy=wrapped;}const R=window.OBOL_REPORT_V2;if(R&&typeof R.generate==='function'&&!R.generate.__obolReleaseAuthority){const oldGenerate=R.generate;const generate=function(){return versionReport88(oldGenerate.apply(R,arguments));};generate.__obolReleaseAuthority=true;window.OBOL_REPORT_V2={...R,generate};}}
function ensureRelease88(){if(release88()&&identity88()){installReleaseContracts88();return Promise.resolve(release88());}if(releaseLoading)return releaseLoading;releaseLoading=addScript88(RELEASE_SOURCE).then(()=>{if(!release88()||!identity88())throw new Error('current release authority did not initialize');installReleaseContracts88();return release88();});return releaseLoading;}
function ensureWorkflow88(){return ensureRelease88().then(()=>{if(window.OBOL_CURRENT_WORKFLOW)return window.OBOL_CURRENT_WORKFLOW;if(workflowLoading)return workflowLoading;workflowLoading=addScript88(WORKFLOW_SOURCE).then(()=>window.OBOL_CURRENT_WORKFLOW);return workflowLoading;});}
function ensureProductAssets88(){return ensureWorkflow88().then(()=>{if(window.renderProductHardeningDashboard&&window.OBOL_PRODUCT_HARDENING&&window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES)return window.OBOL_CURRENT_WORKFLOW;if(productAssetsLoading)return productAssetsLoading;addStyle88('assets/product-hardening-dashboard.css');productAssetsLoading=addScript88('data/product-hardening/product-hardening-queue.js').then(()=>addScript88('data/product-hardening/work-packages.js')).then(()=>addScript88('assets/product-hardening-dashboard.js')).then(()=>window.OBOL_CURRENT_WORKFLOW);return productAssetsLoading;});}
function setVisibleVersion88(){const r=release88();if(!r)return;stampReleaseState88();const tag=document.querySelector('.tagline');if(tag)tag.textContent='Offensive Box Operations Ledger · '+r.label;const title='Obol '+r.label+' — '+r.phaseLabel;if(document.title!==title)document.title=title;const view=document.querySelector('#view');if(!view)return;view.querySelectorAll('.app-phase-badge88,.release-settings88,.product-home88').forEach(x=>x.remove());if(page88()==='settings'){const sub=view.querySelector('.subtitle')||view.querySelector('h2');if(sub)sub.insertAdjacentHTML('afterend','<p class="hint release-settings88">Current Obol release: <b>'+e88(r.label)+'</b> · workspace schema '+e88(C.VERSION)+'</p>');}}
function decorate88(){if(!active88())return;const p=page88();const assets=p==='dashboard'?ensureProductAssets88():ensureWorkflow88();assets.then(()=>{installReleaseContracts88();setVisibleVersion88();const workflow=window.OBOL_CURRENT_WORKFLOW;if(workflow&&typeof workflow.decorateRoute==='function')workflow.decorateRoute();}).catch(()=>{});}
const oldRoute88=route;route=function(){oldRoute88();for(const t of [0,40,180,520,1200,2600,4200])setTimeout(decorate88,t);};
window.addEventListener('hashchange',()=>{for(const t of [20,120,420,900,1800,3000])setTimeout(decorate88,t);});
ensureAccessibility88().catch(()=>{});ensureRelease88().catch(()=>{});ensureWorkflow88().catch(()=>{});for(const t of [50,350,760,1300,2200,3600,5200])setTimeout(decorate88,t);
})();
