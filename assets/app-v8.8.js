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
let releaseLoading=null,workflowLoading=null,productAssetsLoading=null,accessibilityLoading=null,fieldNotesLoading=null,toolBuilderLoading=null,releaseContractsInstalled=false;
function active88(){return typeof C!=='undefined'&&C.VERSION==='8.8.0';}
function routeParts88(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean);}
function page88(){return routeParts88()[0]||'home';}
function e88(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function release88(){return window.OBOL_CURRENT_RELEASE||null;}
function identity88(){return window.OBOL_RELEASE_IDENTITY||null;}
function addStyle88(href){if(document.querySelector('link[data-obol-product-hardening="'+href+'"]')||document.querySelector('link[href="'+href+'"]'))return;const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.obolProductHardening=href;document.head.appendChild(link);}
function addScript88(src){if(document.querySelector('script[data-obol-product-hardening="'+src+'"]')||document.querySelector('script[src="'+src+'"]'))return Promise.resolve();return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.dataset.obolProductHardening=src;s.onload=resolve;s.onerror=()=>reject(new Error('failed to load '+src));document.head.appendChild(s);});}
function ensureResponsive88(){addStyle88('assets/responsive-current.css');}
function ensureAccessibility88(){addStyle88('assets/accessibility.css');if(accessibilityLoading)return accessibilityLoading;accessibilityLoading=addScript88('assets/accessibility.js');return accessibilityLoading;}
function ensureFieldNotes88(){if(window.OBOL_FIELD_NOTES_UI&&window.OBOL_FIELD_NOTES)return Promise.resolve(window.OBOL_FIELD_NOTES_UI);if(fieldNotesLoading)return fieldNotesLoading;addStyle88('assets/field-notes.css');fieldNotesLoading=addScript88('data/field-notes.js').then(()=>addScript88('assets/field-notes.js')).then(()=>window.OBOL_FIELD_NOTES_UI);return fieldNotesLoading;}
function ensureToolBuilder88(){if(window.OBOL_TOOL_BUILDER&&window.OBOL_TOOL_BUILDER_SCHEMA&&window.OBOL_TOOL_BUILDER_INVENTORY&&window.OBOL_TOOL_BUILDERS)return Promise.resolve(window.OBOL_TOOL_BUILDER);if(toolBuilderLoading)return toolBuilderLoading;toolBuilderLoading=addScript88('data/tool-builder-schema.js').then(()=>addScript88('data/tool-builder-inventory.js')).then(()=>addScript88('assets/tool-builder-current.js')).then(()=>addScript88('data/tool-builders.js')).then(()=>window.OBOL_TOOL_BUILDER);return toolBuilderLoading;}
function stampReleaseState88(){const i=identity88();if(!i||typeof i.stampState!=='function'||typeof state==='undefined'||!state)return;i.stampState(state);}
function versionReport88(md){const i=identity88();return i&&typeof i.normalizeReportMarkdown==='function'?i.normalizeReportMarkdown(md):String(md||'');}
function installReleaseContracts88(){if(releaseContractsInstalled||!release88()||!identity88())return;releaseContractsInstalled=true;stampReleaseState88();if(C&&typeof C.sanitizedCopy==='function'&&!C.sanitizedCopy.__obolReleaseAuthority){const old=C.sanitizedCopy;const wrapped=function(s){const safe=old(s),i=identity88();return i&&typeof i.stampState==='function'?i.stampState(safe):safe;};wrapped.__obolReleaseAuthority=true;C.sanitizedCopy=wrapped;}const R=window.OBOL_REPORT_V2;if(R&&typeof R.generate==='function'&&!R.generate.__obolReleaseAuthority){const oldGenerate=R.generate;const generate=function(){return versionReport88(oldGenerate.apply(R,arguments));};generate.__obolReleaseAuthority=true;window.OBOL_REPORT_V2={...R,generate};}}
function ensureRelease88(){if(release88()&&identity88()){installReleaseContracts88();return Promise.resolve(release88());}if(releaseLoading)return releaseLoading;releaseLoading=addScript88(RELEASE_SOURCE).then(()=>{if(!release88()||!identity88())throw new Error('current release authority did not initialize');installReleaseContracts88();return release88();});return releaseLoading;}
function ensureWorkflow88(){return ensureRelease88().then(()=>{if(window.OBOL_CURRENT_WORKFLOW)return window.OBOL_CURRENT_WORKFLOW;if(workflowLoading)return workflowLoading;workflowLoading=addScript88(WORKFLOW_SOURCE).then(()=>window.OBOL_CURRENT_WORKFLOW);return workflowLoading;});}
function ensureProductAssets88(){return ensureWorkflow88().then(()=>{if(window.renderProductHardeningDashboard&&window.OBOL_PRODUCT_HARDENING&&window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES)return window.OBOL_CURRENT_WORKFLOW;if(productAssetsLoading)return productAssetsLoading;addStyle88('assets/product-hardening-dashboard.css');productAssetsLoading=addScript88('data/product-hardening/product-hardening-queue.js').then(()=>addScript88('data/product-hardening/work-packages.js')).then(()=>addScript88('assets/product-hardening-dashboard.js')).then(()=>window.OBOL_CURRENT_WORKFLOW);return productAssetsLoading;});}
function currentNmapValues88(){
 const d=typeof state!=='undefined'&&state&&state.ui&&state.ui.discovery31&&typeof state.ui.discovery31==='object'?state.ui.discovery31:{};
 const values={profile:d.profile||'discover',target:d.target||'',output:d.output||'',ports:d.ports||'',timing:d.timing||'T4',minRate:d.minRate||'',maxRetries:d.maxRetries||'',reason:!!d.reason,version:!!d.version,scripts:!!d.scripts,os:!!d.os,resolveDns:!!d.resolveDns};
 return window.OBOL_TOOL_BUILDERS&&window.OBOL_TOOL_BUILDERS.defaults?window.OBOL_TOOL_BUILDERS.defaults(values):values;
}
function nmapContext88(){
 let target='';try{const h=typeof currentHost==='function'?currentHost():null;target=(h&&h.ip)||(typeof state!=='undefined'&&state&&state.params&&state.params.target)||'';}catch(_e){}
 return{target:{value:target,ip:target},workspace:{outputDir:''}};
}
function syncLegacyNmap88(form){
 if(!form)return;
 const map={profile:'n31-profile',target:'n31-target',output:'n31-output',ports:'n31-ports',timing:'n31-timing',minRate:'n31-min',maxRetries:'n31-retry',reason:'n31-reason',version:'n31-version',scripts:'n31-scripts',os:'n31-os',resolveDns:'n31-dns'};
 for(const [field,id] of Object.entries(map)){
  const source=form.elements&&form.elements.namedItem(field),legacy=document.getElementById(id);if(!source||!legacy)continue;
  if(source.type==='checkbox')legacy.checked=!!source.checked;else legacy.value=source.value;
 }
}
function decorateNmapBuilder88(){
 if(page88()!=='boxes'||!window.OBOL_TOOL_BUILDER||!window.OBOL_TOOL_BUILDER_SCHEMA||!window.OBOL_TOOL_BUILDERS)return;
 const legacy=document.querySelector('.discovery31');if(!legacy||legacy.querySelector('[data-current-nmap-builder88]'))return;
 const builder=window.OBOL_TOOL_BUILDER_SCHEMA.get('tb-nmap');if(!builder)return;
 const host=document.createElement('div');host.dataset.currentNmapBuilder88='true';
 const paste=legacy.querySelector('.paste-scan31');if(paste)legacy.insertBefore(host,paste);else legacy.appendChild(host);
 const mount=window.OBOL_TOOL_BUILDER.mount(host,builder,nmapContext88(),currentNmapValues88());
 for(const selector of ['.discovery-grid31','.scan-options31','.generated31']){const old=legacy.querySelector(selector);if(old)old.hidden=true;}
 if(mount&&mount.form){
  syncLegacyNmap88(mount.form);
  let lastProfile=mount.form.elements.namedItem('profile')&&mount.form.elements.namedItem('profile').value;
  const sync=()=>syncLegacyNmap88(mount.form);
  mount.form.addEventListener('input',event=>{
   if(event.target&&event.target.name==='ports'&&event.target.value.trim()){
    const scope=mount.form.elements.namedItem('portScope');if(scope&&scope.value!=='custom'){scope.value='custom';if(mount.refresh)mount.refresh();}
   }
   sync();
  });
  mount.form.addEventListener('change',event=>{
   if(event.target&&event.target.name==='profile'){
    const next=event.target.value,output=mount.form.elements.namedItem('output'),scope=mount.form.elements.namedItem('portScope'),minRate=mount.form.elements.namedItem('minRate'),scripts=mount.form.elements.namedItem('scripts'),version=mount.form.elements.namedItem('version');
    const oldProfile=window.OBOL_TOOL_BUILDERS.profile(lastProfile),nextProfile=window.OBOL_TOOL_BUILDERS.profile(next);
    if(output&&(!output.value||output.value===oldProfile.defaultOutput))output.value=nextProfile.defaultOutput;
    if(scope&&(!scope.value||scope.value===oldProfile.portScope))scope.value=nextProfile.portScope;
    if(minRate&&(!minRate.value||minRate.value===oldProfile.minRate))minRate.value=nextProfile.minRate;
    if(next==='service'){if(scripts)scripts.checked=true;if(version)version.checked=true;}
    lastProfile=next;if(mount.refresh)mount.refresh();
   }
   if(event.target&&event.target.name==='portScope'&&event.target.value!=='custom'){
    const ports=mount.form.elements.namedItem('ports');if(ports&&ports.value){ports.value='';if(mount.refresh)mount.refresh();}
   }
   syncLegacyNmap88(mount.form);
  });
 }
}
function toolBuilderContext88(){
 let host=null;try{host=typeof currentHost==='function'?currentHost():null;}catch(_e){}
 const params=typeof state!=='undefined'&&state&&state.params||{};
 const target=(host&&host.ip)||params.target||'';
 return{
  target:{value:target,ip:target,hostname:(host&&host.hostname)||''},
  context:{domain:params.domain||'',username:params.user||params.username||'',port:params.port||''},
  workspace:{wordlist:params.wordlist||'',outputDir:params.output||'',hashfile:params.hashfile||''}
 };
}
function builderForTool88(tool){
 const inv=window.OBOL_TOOL_BUILDER_INVENTORY&&window.OBOL_TOOL_BUILDER_INVENTORY.get(tool);
 if(!inv||inv.status!=='implemented'||!inv.queueItem)return null;
 return window.OBOL_TOOL_BUILDER_SCHEMA&&window.OBOL_TOOL_BUILDER_SCHEMA.get(inv.queueItem);
}
function seedBuilderValues88(builder,context){
 const params=typeof state!=='undefined'&&state&&state.params||{};
 const seed={};
 if(builder.id==='tb-hashcat'&&params.hashfile)seed.hashOrFile=params.hashfile;
 if(builder.id==='tb-ffuf'&&params.wordlist)seed.wordlist=params.wordlist;
 return window.OBOL_TOOL_BUILDERS&&typeof window.OBOL_TOOL_BUILDERS.defaultsFor==='function'?window.OBOL_TOOL_BUILDERS.defaultsFor(builder.id,seed,context):seed;
}
function mountBuilder88(host,builder){
 if(!host||!builder||!window.OBOL_TOOL_BUILDER)return null;
 const context=toolBuilderContext88();
 const mount=window.OBOL_TOOL_BUILDER.mount(host,builder,context,seedBuilderValues88(builder,context));
 if(window.OBOL_TOOL_BUILDERS&&typeof window.OBOL_TOOL_BUILDERS.enhanceMount==='function')window.OBOL_TOOL_BUILDERS.enhanceMount(builder.id,mount,context);
 return mount;
}
function decorateCurrentToolBuilders88(){
 const parts=routeParts88(),p=parts[0]||'home';
 if(p==='tools'){
  const tool=parts[1]?decodeURIComponent(parts[1]):'';const builder=builderForTool88(tool);const body=document.getElementById('tool-body');
  if(!builder||!body||body.querySelector('[data-current-tool-builder88="'+builder.id+'"]'))return;
  const host=document.createElement('div');host.dataset.currentToolBuilder88=builder.id;body.insertBefore(host,body.firstChild);mountBuilder88(host,builder);return;
 }
 if(p==='card'){
  const cardId=parts[1]?decodeURIComponent(parts[1]):'',card=typeof CARDS!=='undefined'&&CARDS[cardId],cardRoot=document.querySelector('[data-cardroot="'+cardId+'"]');
  if(!card||!cardRoot)return;
  const builders=[];const seen=new Set();
  for(const cmd of card.commands||[]){const builder=builderForTool88(cmd&&cmd.tool);if(builder&&!seen.has(builder.id)){seen.add(builder.id);builders.push(builder);}}
  const cardBody=cardRoot.querySelector('.card-body');if(!cardBody)return;
  const anchor=cardBody.querySelector('.cmd-block');
  for(const builder of builders){
   if(cardRoot.querySelector('[data-current-tool-builder88="'+builder.id+'"]'))continue;
   const host=document.createElement('div');host.dataset.currentToolBuilder88=builder.id;if(anchor)cardBody.insertBefore(host,anchor);else cardBody.appendChild(host);mountBuilder88(host,builder);
  }
 }
}
function setVisibleVersion88(){const r=release88();if(!r)return;stampReleaseState88();const tag=document.querySelector('.tagline');if(tag)tag.textContent='Offensive Box Operations Ledger · '+r.label;const title='Obol '+r.label+' — '+r.phaseLabel;if(document.title!==title)document.title=title;const view=document.querySelector('#view');if(!view)return;view.querySelectorAll('.app-phase-badge88,.release-settings88,.product-home88').forEach(x=>x.remove());if(page88()==='settings'){const sub=view.querySelector('.subtitle')||view.querySelector('h2');if(sub)sub.insertAdjacentHTML('afterend','<p class="hint release-settings88">Current Obol release: <b>'+e88(r.label)+'</b> · workspace schema '+e88(C.VERSION)+'</p>');}}
function decorate88(){if(!active88())return;const p=page88();const assets=p==='dashboard'?ensureProductAssets88():ensureWorkflow88();assets.then(()=>{installReleaseContracts88();setVisibleVersion88();const workflow=window.OBOL_CURRENT_WORKFLOW;if(workflow&&typeof workflow.decorateRoute==='function')workflow.decorateRoute();if(['card','path','tools'].includes(p))ensureFieldNotes88().then(ui=>{if(ui&&typeof ui.decorate==='function')ui.decorate();}).catch(()=>{});if(['boxes','card','tools'].includes(p))ensureToolBuilder88().then(()=>{if(p==='boxes')decorateNmapBuilder88();if(['card','tools'].includes(p))decorateCurrentToolBuilders88();}).catch(()=>{});}).catch(()=>{});}
const oldRoute88=route;route=function(){oldRoute88();for(const t of [0,40,180,520,1200,2600,4200])setTimeout(decorate88,t);};
window.addEventListener('hashchange',()=>{for(const t of [20,120,420,900,1800,3000])setTimeout(decorate88,t);});
ensureResponsive88();ensureAccessibility88().catch(()=>{});ensureRelease88().catch(()=>{});ensureWorkflow88().catch(()=>{});for(const t of [50,350,760,1300,2200,3600,5200])setTimeout(decorate88,t);
})();
