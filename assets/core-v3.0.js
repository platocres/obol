// Obol v3.0 core overlay — workspace overview, workflow/navigation model, and UX state.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2;if(!C)throw new Error('Obol v2 core is required before core-v3.0.js');
const VERSION='3.0.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldSanitize=C.sanitizedCopy;
const NAVIGATION={
  primary:[
    {id:'home',label:'Home',href:'#/home',help:'Resume the current engagement and see what needs attention.'},
    {id:'boxes',label:'Targets',href:'#/boxes',help:'Hosts, domains, ports, flags, and target metadata.'},
    {id:'intake',label:'Evidence',href:'#/intake',help:'Paste tool output and review evidence before applying it.'},
    {id:'path',label:'Next Steps',href:'#/path',help:'Evidence-ranked methodology recommendations for the active context.'},
    {id:'report',label:'Report',href:'#/report',help:'Proof readiness and reproducible report output.'}
  ],
  secondary:[
    {id:'map',label:'Engagement Map',href:'#/map'},
    {id:'lanes',label:'Methodology',href:'#/lanes'},
    {id:'tools',label:'Tool Library',href:'#/tools'},
    {id:'queue',label:'Planned Work',href:'#/queue'},
    {id:'search',label:'Workspace Search',href:'#/search'},
    {id:'lineage',label:'Evidence Lineage',href:'#/lineage'},
    {id:'guide',label:'Guide',href:'#/guide'},
    {id:'settings',label:'Workspace Data',href:'#/settings'}
  ]
};
function ensure30(s){
  s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};
  const old=s.ui.shell30&&typeof s.ui.shell30==='object'?s.ui.shell30:{};
  s.ui.shell30={sidebarCollapsed:!!old.sidebarCollapsed,onboardingDismissed:!!old.onboardingDismissed,mobileInitialized:!!old.mobileInitialized};
  return s;
}
C.VERSION=VERSION;
C.newState=function(){return ensure30(oldNew());};
C.coerceState=function(raw){return ensure30(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure30(oldMigrate(raw));};
function artifactsForContext(state,ctx){
  const key=C.contextKey(C.normalizeContext(state,ctx||state.activeContext));
  return (C.TYPED_ARTIFACT_KINDS||[]).flatMap(k=>((state.typedArtifacts||{})[k]||[])).filter(a=>a.contextKey===key||a.contextKey==='global:global');
}
function workspaceOverview(state,lanes,ctx){
  ensure30(state);lanes=lanes||[];const context=C.normalizeContext(state,ctx||state.activeContext),key=C.contextKey(context);
  const facts=C.effectiveFactRecords?C.effectiveFactRecords(state,context):[],artifacts=artifactsForContext(state,context),activities=(state.activities||[]).filter(a=>a.contextKey===key).slice().sort((a,b)=>String(b.at||'').localeCompare(String(a.at||''))),queue=(state.workQueue||[]).filter(w=>w.contextKey===key),planned=queue.filter(w=>!['done','deferred'].includes(w.status)),success=activities.filter(a=>a.result==='success'),tried=activities.filter(a=>a.result==='tried');
  let readiness={total:0,ready:0,rows:[]};try{if(C.reportReadiness)readiness=C.reportReadiness(state,lanes,context)||readiness;}catch(e){}
  let ranked=[];try{if(C.rankedApplicable)ranked=C.rankedApplicable(state,lanes,context,{showAll:false})||[];}catch(e){}
  let network={reachabilityCounts:{},paths:[]};try{if(C.networkSummary)network=C.networkSummary(state,context)||network;}catch(e){}
  const host=C.hostForContext?C.hostForContext(state,context):null,domain=C.domainForContext?C.domainForContext(state,context):null;
  let stage='review',next={label:'Review workspace',href:'#/search',detail:'Search recent evidence, activity, and unresolved work.'};
  if(!(state.hosts||[]).length){stage='setup';next={label:'Add your first target',href:'#/boxes',detail:'Create a host so evidence and activity have a clear scope.'};}
  else if(!facts.length&&!artifacts.length&&!activities.length){stage='evidence';next={label:'Ingest evidence',href:'#/intake',detail:'Paste an nmap scan or terminal output, then review what Obol recognized.'};}
  else if(readiness.total&&readiness.ready<readiness.total){stage='document';next={label:'Finish proof readiness',href:'#/report',detail:(readiness.total-readiness.ready)+' successful action(s) still need report proof.'};}
  else if(planned.length){stage='execute';next={label:'Resume planned work',href:'#/queue',detail:planned.length+' queued action(s) are waiting.'};}
  else if(ranked.length){stage='plan';next={label:'Choose the next step',href:'#/path',detail:'Path has '+ranked.length+' evidence-grounded recommendation(s).'};}
  return{
    context,key,contextLabel:C.contextLabel?C.contextLabel(state,context):key,host,domain,stage,next,
    targets:(state.hosts||[]).length,domains:(state.domains||[]).length,facts:facts.length,artifacts:artifacts.length,activities:activities.length,successes:success.length,tried:tried.length,planned:planned.length,readiness,ranked,network,recent:activities.slice(0,6)
  };
}
function navEntry(id){return NAVIGATION.primary.concat(NAVIGATION.secondary).find(x=>x.id===id)||null;}
C.ensure30=ensure30;C.NAVIGATION30=NAVIGATION;C.workspaceOverview30=workspaceOverview;C.navEntry30=navEntry;
C.sanitizedCopy=function(state){return ensure30(oldSanitize(state));};
root.OBOL_CORE_V30={VERSION,ensure30,NAVIGATION};
})(typeof window!=='undefined'?window:globalThis);
