// Obol v2.8 core overlay — explicit reachability paths, lineage timelines, report readiness, and release state.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2;if(!C)throw new Error('Obol v2 core is required before core-v2.8.js');
const VERSION='2.8.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldNetwork=C.networkSummary,oldSanitize=C.sanitizedCopy;
function ensure28(s){
  s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};
  s.networkModel=s.networkModel&&typeof s.networkModel==='object'?s.networkModel:{};
  s.networkModel.observations=Array.isArray(s.networkModel.observations)?s.networkModel.observations:[];
  s.networkModel.paths=Array.isArray(s.networkModel.paths)?s.networkModel.paths:[];
  s.reportEvidence28=s.reportEvidence28&&typeof s.reportEvidence28==='object'?s.reportEvidence28:{};
  return s;
}
C.VERSION=VERSION;
C.newState=function(){return ensure28(oldNew());};
C.coerceState=function(raw){return ensure28(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure28(oldMigrate(raw));};
function ipv4Int(ip){const p=String(ip||'').trim().split('.').map(Number);if(p.length!==4||p.some(n=>!Number.isInteger(n)||n<0||n>255))return null;return (((p[0]<<24)>>>0)+(p[1]<<16)+(p[2]<<8)+p[3])>>>0;}
function cidrSpec(cidr){const m=String(cidr||'').trim().match(/^((?:\d{1,3}\.){3}\d{1,3})\/(\d|[12]\d|3[0-2])$/);if(!m)return null;const ip=ipv4Int(m[1]),bits=+m[2];if(ip===null)return null;const mask=bits===0?0:(0xffffffff<<(32-bits))>>>0;return{cidr:m[1]+'/'+bits,network:(ip&mask)>>>0,mask,bits};}
function cidrContains(cidr,ip){const c=cidrSpec(cidr),n=ipv4Int(ip);return !!c&&n!==null&&((n&c.mask)>>>0)===c.network;}
function pathKey(p){return [p.mode,p.kind,p.network,p.viaContextKey,p.endpoint].join('|').toLowerCase();}
function recordNetworkPath(state,spec,opts){
  ensure28(state);spec=spec||{};opts=opts||{};const c=cidrSpec(spec.network);if(!c)return null;
  const ctx=C.normalizeContext(state,opts.context||state.activeContext),mode=spec.mode==='direct'?'direct':'pivot',kind=mode==='direct'?'direct':String(spec.kind||'other'),status=spec.status==='inactive'?'inactive':'active';
  const row={id:spec.id||C.uid('path'),name:String(spec.name||'').trim(),mode,kind,network:c.cidr,endpoint:String(spec.endpoint||'').trim(),viaContextKey:spec.viaContextKey||C.contextKey(ctx),viaContextLabel:spec.viaContextLabel||C.contextLabel(state,ctx),status,source:spec.source||opts.source||'operator',createdAt:spec.createdAt||C.now(),updatedAt:C.now()};
  const same=state.networkModel.paths.find(x=>pathKey(x)===pathKey(row));if(same){same.status=row.status;same.name=row.name||same.name;same.updatedAt=C.now();same.source=row.source||same.source;return same;}
  state.networkModel.paths.push(row);state.updatedAt=C.now();return row;
}
function updateNetworkPath(state,id,patch){ensure28(state);const x=state.networkModel.paths.find(p=>p.id===id);if(!x)return null;patch=patch||{};if(patch.status==='active'||patch.status==='inactive')x.status=patch.status;if(patch.name!=null)x.name=String(patch.name);if(patch.endpoint!=null)x.endpoint=String(patch.endpoint);x.updatedAt=C.now();state.updatedAt=C.now();return x;}
function removeNetworkPath(state,id){ensure28(state);const n=state.networkModel.paths.length;state.networkModel.paths=state.networkModel.paths.filter(x=>x.id!==id);state.updatedAt=C.now();return state.networkModel.paths.length!==n;}
function networkPaths(state,ctx,opts){ensure28(state);opts=opts||{};const key=C.contextKey(C.normalizeContext(state,ctx||state.activeContext));return state.networkModel.paths.filter(x=>(opts.allContexts||x.viaContextKey===key||x.viaContextKey==='global:global')&&(!opts.activeOnly||x.status==='active'));}
function observedAddress(state,address,ctx){const key=C.contextKey(C.normalizeContext(state,ctx||state.activeContext)),a=String(address||'');if(((state.typedArtifacts||{}).hosts||[]).some(x=>x.value===a&&(x.contextKey===key||x.contextKey==='global:global')))return true;return (state.networkModel.observations||[]).some(x=>x.address===a&&(x.contextKey===key||x.contextKey==='global:global'));}
function reachabilityFor(state,address,ctx){
  ensure28(state);const ip=String(address||'').trim(),host=C.hostForContext(state,ctx||state.activeContext);if(!ip)return{state:'unknown',via:null};if(host&&host.ip===ip)return{state:'direct',via:null};
  const paths=networkPaths(state,ctx,{activeOnly:true}),direct=paths.find(p=>p.mode==='direct'&&cidrContains(p.network,ip));if(direct)return{state:'direct',via:direct};const pivot=paths.find(p=>p.mode==='pivot'&&cidrContains(p.network,ip));if(pivot)return{state:'pivot',via:pivot};if(observedAddress(state,ip,ctx))return{state:'observed',via:null};return{state:'unknown',via:null};
}
function networkSummary28(state,ctx){
  ensure28(state);const base=oldNetwork?oldNetwork(state,ctx):{observations:[],interfaces:[],routes:[],hosts:[],subnets:[]},paths=networkPaths(state,ctx,{}),addresses=[];
  for(const h of base.hosts||[])if(h.value&&!addresses.includes(h.value))addresses.push(h.value);for(const o of base.observations||[])if(o.address&&!addresses.includes(o.address))addresses.push(o.address);
  const visibility=addresses.map(address=>({address,...reachabilityFor(state,address,ctx)})),counts={direct:0,pivot:0,observed:0,unknown:0};for(const x of visibility)counts[x.state]=(counts[x.state]||0)+1;
  return{...base,paths,directPaths:paths.filter(x=>x.mode==='direct'),pivotPaths:paths.filter(x=>x.mode==='pivot'),visibility,reachabilityCounts:counts};
}
C.networkSummary=networkSummary28;
function artifactById(state,id){for(const k of C.TYPED_ARTIFACT_KINDS||[])for(const a of ((state.typedArtifacts||{})[k]||[]))if(a.id===id)return a;return null;}
function lineageTimeline(state,rowOrId){ensure28(state);const row=typeof rowOrId==='string'?artifactById(state,rowOrId):rowOrId;if(!row)return[];const out=[];
  for(const p of row.producedBy||[])out.push({direction:'produced',at:p.at||row.observedAt||'',cardId:p.cardId||'',activityId:p.activityId||'',source:p.source||row.source||'',command:p.command||'',contextKey:p.contextKey||row.contextKey||'',href:p.cardId?'#/card/'+encodeURIComponent(p.cardId):''});
  for(const c of row.consumedBy||[])out.push({direction:'consumed',at:c.at||'',cardId:c.cardId||'',activityId:'',source:c.source||'',commandId:c.commandId||'',field:c.field||c.param||'',contextKey:c.contextKey||row.contextKey||'',href:c.cardId?'#/card/'+encodeURIComponent(c.cardId):''});
  return out.sort((a,b)=>String(a.at).localeCompare(String(b.at))||a.direction.localeCompare(b.direction));
}
function activityKey(a){return a&&a.id?String(a.id):[a&&a.contextKey||'',a&&a.cardId||'',a&&a.at||''].join('|');}
function setReportProof(state,key,patch){ensure28(state);if(!key)return null;const cur=state.reportEvidence28[key]||{screenshot:false,note:''};patch=patch||{};if(typeof patch.screenshot==='boolean')cur.screenshot=patch.screenshot;if(patch.note!=null)cur.note=String(patch.note).slice(0,500);cur.updatedAt=C.now();state.reportEvidence28[key]=cur;state.updatedAt=C.now();return cur;}
function reportReadiness(state,lanes,ctx){
  ensure28(state);const key=C.contextKey(C.normalizeContext(state,ctx||state.activeContext)),acts=(state.activities||[]).filter(a=>a.contextKey===key&&a.result==='success').slice().sort((a,b)=>String(a.at).localeCompare(String(b.at))),arts=(C.TYPED_ARTIFACT_KINDS||[]).flatMap(k=>((state.typedArtifacts||{})[k]||[]));
  const rows=acts.map(a=>{const ak=activityKey(a),proof=state.reportEvidence28[ak]||{},links=arts.reduce((n,x)=>n+(x.producedBy||[]).filter(p=>(p.activityId&&p.activityId===a.id)||(!p.activityId&&p.cardId===a.cardId&&p.contextKey===a.contextKey)).length,0),evidence=!!String(a.evidence||'').trim(),command=!!String(a.command||'').trim(),screenshot=!!proof.screenshot;return{key:ak,activity:a,evidence,command,screenshot,artifactLinks:links,ready:evidence&&command&&screenshot,note:proof.note||''};});
  return{rows,total:rows.length,ready:rows.filter(x=>x.ready).length,missingEvidence:rows.filter(x=>!x.evidence).length,missingCommand:rows.filter(x=>!x.command).length,missingScreenshot:rows.filter(x=>!x.screenshot).length};
}
C.ensure28=ensure28;C.cidrContains=cidrContains;C.recordNetworkPath=recordNetworkPath;C.updateNetworkPath=updateNetworkPath;C.removeNetworkPath=removeNetworkPath;C.networkPaths=networkPaths;C.reachabilityFor=reachabilityFor;C.artifactById=artifactById;C.lineageTimeline=lineageTimeline;C.activityKey28=activityKey;C.setReportProof=setReportProof;C.reportReadiness=reportReadiness;
C.sanitizedCopy=function(state){return ensure28(oldSanitize(state));};
root.OBOL_CORE_V28={VERSION,ensure28};
})(typeof window!=='undefined'?window:globalThis);
