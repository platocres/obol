// Obol v3.1 core overlay — discovery-first workflow, first-class Nmap planning, and scan-aware resume state.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2;if(!C)throw new Error('Obol v2 core is required before core-v3.1.js');
const VERSION='3.1.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldSanitize=C.sanitizedCopy,oldOverview=C.workspaceOverview30;
const PROFILES={
  discover:{id:'discover',label:'Discover hosts',detail:'Find live hosts before you know what is there.',timing:'T4',resolveDns:false,openOnly:false,noPing:false,output:'scans/discovery'},
  quick:{id:'quick',label:'Quick TCP',detail:'Fast first pass across the most common TCP ports.',timing:'T4',resolveDns:false,openOnly:true,noPing:true,output:'scans/quick'},
  full:{id:'full',label:'Full TCP',detail:'Sweep all TCP ports before deeper service work.',timing:'T4',resolveDns:false,openOnly:true,noPing:true,minRate:'1000',output:'scans/full-tcp'},
  service:{id:'service',label:'Service + scripts',detail:'Version detection and default scripts on a known host.',timing:'T4',resolveDns:false,openOnly:true,noPing:true,version:true,scripts:true,output:'scans/services'},
  udp:{id:'udp',label:'Top UDP',detail:'Target the most common UDP services as a separate pass.',timing:'T4',resolveDns:false,openOnly:true,noPing:true,output:'scans/udp'}
};
function ensure31(s){
  s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};
  const d=s.ui.discovery31&&typeof s.ui.discovery31==='object'?s.ui.discovery31:{};
  s.ui.discovery31={profile:d.profile&&PROFILES[d.profile]?d.profile:'discover',target:String(d.target||''),output:String(d.output||''),ports:String(d.ports||''),timing:String(d.timing||''),minRate:String(d.minRate||''),maxRetries:String(d.maxRetries||''),reason:!!d.reason,version:!!d.version,scripts:!!d.scripts,os:!!d.os,resolveDns:!!d.resolveDns,lastScanAt:d.lastScanAt||'',lastHostCount:+d.lastHostCount||0};
  return s;
}
C.VERSION=VERSION;
C.newState=function(){return ensure31(oldNew());};
C.coerceState=function(raw){return ensure31(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure31(oldMigrate(raw));};
if(C.NAVIGATION30&&C.NAVIGATION30.primary){
  const boxes=C.NAVIGATION30.primary.find(x=>x.id==='boxes');if(boxes){boxes.label='Discover';boxes.help='Discover live hosts with Nmap, ingest scan results, and manage known targets.';}
}
function normalizeTarget31(v){v=String(v||'').trim();return v&&/^[A-Za-z0-9._:/,-]+$/.test(v)?v:'';}
function cleanPorts31(v){v=String(v||'').trim();return v&&/^[0-9,-]+$/.test(v)?v:'';}
function cleanInt31(v){v=String(v||'').trim();return /^\d+$/.test(v)?v:'';}
function shellQuote31(v){return "'"+String(v||'').replace(/'/g,"'\\''")+"'";}
function profile31(id){return PROFILES[id]||PROFILES.discover;}
function buildNmapCommand31(opts){
  opts=opts||{};const p=profile31(opts.profile),target=normalizeTarget31(opts.target);if(!target)return'';
  const timing=/^T[0-5]$/.test(String(opts.timing||''))?String(opts.timing):p.timing;
  const ports=cleanPorts31(opts.ports),tokens=['nmap'];
  const noPing=opts.noPing==null?p.noPing:!!opts.noPing,resolveDns=opts.resolveDns==null?p.resolveDns:!!opts.resolveDns;
  const version=opts.version==null?!!p.version:!!opts.version,scripts=opts.scripts==null?!!p.scripts:!!opts.scripts,os=!!opts.os,reason=!!opts.reason;
  if(p.id==='udp')tokens.push('-sU');
  if(p.id==='discover')tokens.push('-sn');else if(noPing)tokens.push('-Pn');
  if(ports)tokens.push('-p',ports);else if(p.id==='quick')tokens.push('--top-ports','1000');else if(p.id==='full')tokens.push('-p-');else if(p.id==='udp')tokens.push('--top-ports','100');
  if(scripts&&p.id!=='discover')tokens.push('-sC');if(version&&p.id!=='discover')tokens.push('-sV');if(os&&p.id!=='discover')tokens.push('-O');
  if(!resolveDns)tokens.push('-n');if((opts.openOnly==null?p.openOnly:!!opts.openOnly)&&p.id!=='discover')tokens.push('--open');if(reason)tokens.push('--reason');if(timing)tokens.push('-'+timing);
  const min=cleanInt31(opts.minRate||p.minRate),retry=cleanInt31(opts.maxRetries||p.maxRetries);if(min)tokens.push('--min-rate',min);if(retry)tokens.push('--max-retries',retry);
  const output=String(opts.output||p.output||'').trim();if(output)tokens.push('-oA',shellQuote31(output));tokens.push(target);return tokens.join(' ');
}
function scannedHost31(state,h){return !!(h&&C.hasFact&&C.hasFact(state,'scan.initial',{type:'host',id:h.id}));}
function discoveryStatus31(state){
  ensure31(state);const hosts=state.hosts||[],scanned=hosts.filter(h=>scannedHost31(state,h)),active=C.hostForContext?C.hostForContext(state,state.activeContext):null;
  return{hosts:hosts.length,scanned:scanned.length,unscanned:hosts.length-scanned.length,activeScanned:scannedHost31(state,active),lastScanAt:state.ui.discovery31.lastScanAt||'',lastHostCount:state.ui.discovery31.lastHostCount||0};
}
function workspaceOverview31(state,lanes,ctx){
  ensure31(state);const o=oldOverview?oldOverview(state,lanes,ctx):{},d=discoveryStatus31(state);o.discovery=d;o.scannedTargets=d.scanned;
  if(!d.hosts){o.stage='discover';o.next={label:'Run host discovery',href:'#/boxes',detail:'Start with Nmap against the authorized IP, CIDR, or range to identify live hosts.'};}
  else if(o.context&&o.context.type==='host'&&!d.activeScanned&&!o.activities&&!o.facts&&!o.artifacts){o.stage='scan';o.next={label:'Scan this target',href:'#/boxes',detail:'This host exists in the workspace but has no baseline Nmap evidence yet.'};}
  return o;
}
C.ensure31=ensure31;C.NMAP_PROFILES31=PROFILES;C.nmapProfile31=profile31;C.buildNmapCommand31=buildNmapCommand31;C.normalizeNmapTarget31=normalizeTarget31;C.discoveryStatus31=discoveryStatus31;C.workspaceOverview30=workspaceOverview31;C.workspaceOverview31=workspaceOverview31;
C.sanitizedCopy=function(state){return ensure31(oldSanitize(state));};
root.OBOL_CORE_V31={VERSION,PROFILES,ensure31,buildNmapCommand31,discoveryStatus31};
})(typeof window!=='undefined'?window:globalThis);
