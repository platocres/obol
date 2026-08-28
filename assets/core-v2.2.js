// Obol v2.2 core overlay — tool resolution, maneuver coverage, service depth, transitions and report evidence state.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2;if(!C)throw new Error('Obol v2 core is required before core-v2.2.js');
const REG=()=>root.OBOL_TOOLS_V22||{tools:{},norm:x=>String(x||'').toLowerCase()};
const VERSION='2.2.0';
const oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldCoverage=C.coverageSummary;
function ensure22(s){
  s=s||{};s.obolVersion=VERSION;s.toolProfile=s.toolProfile&&typeof s.toolProfile==='object'?s.toolProfile:{};
  s.reportEvidence=s.reportEvidence&&typeof s.reportEvidence==='object'?s.reportEvidence:{};
  s.ui=s.ui||{};s.ui.commandAdvanced=s.ui.commandAdvanced&&typeof s.ui.commandAdvanced==='object'?s.ui.commandAdvanced:{};
  s.ui.toolAlternatives=s.ui.toolAlternatives&&typeof s.ui.toolAlternatives==='object'?s.ui.toolAlternatives:{};
  s.ui.workflowOpen=s.ui.workflowOpen&&typeof s.ui.workflowOpen==='object'?s.ui.workflowOpen:{};
  return s;
}
C.VERSION=VERSION;
C.newState=function(){return ensure22(oldNew());};
C.coerceState=function(raw){return ensure22(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure22(oldMigrate(raw));};
C.ensure22=ensure22;

function toolId(name){return REG().norm?REG().norm(name):String(name||'').toLowerCase();}
function toolMeta(name){const id=toolId(name),t=(REG().tools||{})[id];return t?{id,...t}:{id,label:name||id,bin:name||id,kali:'unknown',preference:50,capabilities:[]};}
function toolState(state,name){
  ensure22(state);const m=toolMeta(name),p=state.toolProfile[m.id];if(p&&p.status)return{...m,status:p.status,explicit:true,updatedAt:p.updatedAt||'',note:p.note||''};
  const assumed=(m.kali==='expected'||m.kali==='common');return{...m,status:assumed?'assumed':'unknown',explicit:false};
}
function setToolState(state,name,status,note){ensure22(state);const m=toolMeta(name);if(!['available','missing','unknown','assumed'].includes(status))status='unknown';state.toolProfile[m.id]={status,note:String(note||''),updatedAt:C.now()};state.updatedAt=C.now();return toolState(state,m.id);}
function toolUsable(state,name){return !['missing'].includes(toolState(state,name).status);}
C.toolId=toolId;C.toolMeta=toolMeta;C.toolState=toolState;C.setToolState=setToolState;C.toolUsable=toolUsable;

function maneuverKey(card){return String(card&&card.maneuver||card&&card.maneuverId||card&&card.id||'unknown');}
function commandTool(cmd){return toolId((cmd||{}).tool||'');}
function implementationRank(state,cmd,index){const m=toolMeta(commandTool(cmd)),st=toolState(state,m.id);let score=Number(m.preference||50);if(m.id==='nxc')score+=15;if(cmd&&cmd.preferred)score+=20;if(index===0)score+=2;if(st.status==='available')score+=10;if(st.status==='missing')score-=1000;if(st.status==='unknown')score-=4;return score;}
function implementations(state,card){return (card&&card.commands||[]).map((cmd,index)=>({cmd,index,tool:toolMeta(commandTool(cmd)),availability:toolState(state,commandTool(cmd)),rank:implementationRank(state,cmd,index)})).sort((a,b)=>b.rank-a.rank||a.index-b.index);}
function preferredImplementation(state,card){const rows=implementations(state,card);return rows.find(x=>x.availability.status!=='missing')||rows[0]||null;}
C.maneuverKey=maneuverKey;C.commandTool=commandTool;C.implementations=implementations;C.preferredImplementation=preferredImplementation;

const SERVICE_RULES=[
 ['smb',/smb|port:445|port:139|rpcclient|enum4linux|smbclient|smbmap/],['ldap',/ldap|port:389|port:636|3268/],['kerberos',/kerb|port:88|asrep|tgs|roast/],
 ['web',/\bweb\b|http|https|ffuf|ferox|gobuster|whatweb|sqlmap|upload|lfi|xss|sqli/],['ssh',/ssh|port:22/],['ftp',/ftp|port:21/],['nfs',/nfs|port:2049/],
 ['mssql',/mssql|1433/],['mysql',/mysql|3306/],['postgresql',/postgres|5432/],['rdp',/rdp|3389/],['winrm',/winrm|5985|5986/],['snmp',/snmp|161/],
 ['linux-privesc',/linux-privesc|sudo|suid|capabilit|cron|linpeas/],['windows-privesc',/windows-privesc|seimpersonate|service|winpeas|alwaysinstallelevated/],['ad',/active directory|\bad\b|bloodhound|dcsync|acl|domain/],['pivot',/pivot|tunnel|chisel|ligolo|socks|proxychains/]
];
function serviceForCard(card){const text=[card&&card.lane,card&&card.title,card&&card.id,...(card&&card.commands||[]).flatMap(c=>[c.tool,c.run])].join(' ').toLowerCase();for(const [id,re] of SERVICE_RULES)if(re.test(text))return id;return card&&card.lane||'other';}
C.serviceForCard=serviceForCard;
function uniqueManeuvers(rows){const map=new Map();for(const x of rows){const k=maneuverKey(x.card||x);if(!map.has(k))map.set(k,x);}return[...map.values()];}
function serviceDepth(state,lanes,ctx){
  const facts=C.effectiveFacts(state,ctx),rows=[];for(const lane of lanes||[])for(const card of lane.cards||[]){if(!C.grounded(card,facts)&&!C.applicable(card,facts))continue;rows.push({card,lane,service:serviceForCard(card)});}
  const out={};for(const x of uniqueManeuvers(rows)){const s=x.service,b=out[s]||(out[s]={service:s,relevant:0,tried:0,succeeded:0,remaining:0,depth:0});b.relevant++;const st=C.statusFor(state,x.card.id,ctx);if(st==='done')b.succeeded++;else if(st==='tried')b.tried++;else b.remaining++;}
  for(const b of Object.values(out))b.depth=b.relevant?Math.round((b.tried+b.succeeded)/b.relevant*100):0;
  return Object.values(out).sort((a,b)=>a.depth-b.depth||b.relevant-a.relevant);
}
C.serviceDepth=serviceDepth;

if(oldCoverage){C.coverageSummary=function(state,lanes,ctx){
  const base=oldCoverage(state,lanes,ctx),facts=C.effectiveFacts(state,ctx),relevant=[];
  for(const lane of lanes||[])for(const card of lane.cards||[]){if(C.grounded(card,facts)||C.applicable(card,facts))relevant.push({card,lane});}
  const uniq=uniqueManeuvers(relevant),by={};for(const {card,lane} of uniq){const k=card.lane||lane.lane,b=by[k]||(by[k]={lane:k,title:lane.title||k,relevant:0,tried:0,succeeded:0,remaining:0});b.relevant++;const st=C.statusFor(state,card.id,ctx);if(st==='done')b.succeeded++;else if(st==='tried')b.tried++;else b.remaining++;}
  const lanesOut=Object.values(by).map(x=>({...x,coverage:x.relevant?Math.round((x.tried+x.succeeded)/x.relevant*100):100,successCoverage:x.relevant?Math.round(x.succeeded/x.relevant*100):100})).sort((a,b)=>a.coverage-b.coverage||b.relevant-a.relevant);
  const total=lanesOut.reduce((a,x)=>a+x.relevant,0),touched=lanesOut.reduce((a,x)=>a+x.tried+x.succeeded,0),done=lanesOut.reduce((a,x)=>a+x.succeeded,0);
  return{...base,total,touched,done,remaining:Math.max(0,total-touched),coverage:total?Math.round(touched/total*100):0,successCoverage:total?Math.round(done/total*100):0,lanes:lanesOut,services:serviceDepth(state,lanes,ctx)};
};}

const TRANSITION_FACTS={
 'credential.available':'credential','credential.ntlm_hash':'credential','credential.plaintext':'credential',
 'foothold.linux':'foothold','foothold.windows':'foothold','foothold.webshell':'foothold',
 'access.admin':'privilege','access.root':'privilege','access.system':'privilege',
 'ad.domain_known':'domain','ad.attack_paths':'domain','relay.success':'lateral','pivot.established':'network','network.internal':'network'
};
function transitionsFor(outcomes){return[...new Set((outcomes||[]).map(f=>TRANSITION_FACTS[f]).filter(Boolean))];}
const baseRecord=C.recordActivity;
C.recordActivity=function(state,a){ensure22(state);const rec=baseRecord(state,a);rec.maneuverKey=a.maneuverKey||rec.maneuverKey||a.cardId;rec.tool=a.tool||rec.tool||inferToolFromCommand(rec.command);rec.transitions=Array.isArray(a.transitions)?a.transitions:transitionsFor(rec.outcomeFacts);return rec;};
function inferToolFromCommand(command){let s=String(command||'').trim().replace(/^(sudo|proxychains4?|env)\s+/,'').split(/\s+/)[0]||'';s=s.split('/').pop().replace(/\.py$|\.exe$/i,'');return toolId(s);}
C.inferToolFromCommand=inferToolFromCommand;C.transitionsFor=transitionsFor;
function transitionTimeline(state,ctx){const key=ctx?C.contextKey(C.normalizeContext(state,ctx)):null;return(state.activities||[]).filter(a=>(!key||a.contextKey===key)&&(a.transitions||[]).length).map(a=>({at:a.at,contextKey:a.contextKey,contextLabel:a.contextLabel,cardId:a.cardId,maneuverKey:a.maneuverKey,tool:a.tool,transitions:a.transitions,outcomeFacts:a.outcomeFacts||[],command:a.command,evidence:a.evidence}));}
C.transitionTimeline=transitionTimeline;

function evidenceBucket(state,ctx){ensure22(state);const key=typeof ctx==='string'?ctx:C.contextKey(C.normalizeContext(state,ctx||state.activeContext));state.reportEvidence[key]=state.reportEvidence[key]||{};return state.reportEvidence[key];}
function setReportEvidence(state,ctx,id,value,note){const b=evidenceBucket(state,ctx);b[id]={done:!!value,note:String(note||''),updatedAt:C.now()};state.updatedAt=C.now();return b[id];}
function reportEvidenceStatus(state,ctx,id){return evidenceBucket(state,ctx)[id]||{done:false,note:''};}
C.evidenceBucket=evidenceBucket;C.setReportEvidence=setReportEvidence;C.reportEvidenceStatus=reportEvidenceStatus;

function workflowRows(state,lanes,ctx){
  const facts=C.effectiveFacts(state,ctx),groups={};for(const lane of lanes||[])for(const card of lane.cards||[]){if(!C.grounded(card,facts)&&!C.applicable(card,facts))continue;const w=card.workflow||serviceForCard(card),g=groups[w]||(groups[w]={id:w,title:String(w).replace(/[-_]/g,' ').replace(/\b\w/g,m=>m.toUpperCase()),cards:[]});g.cards.push(card);}
  return Object.values(groups).map(g=>{const uniq=uniqueManeuvers(g.cards.map(card=>({card}))).map(x=>x.card),steps=uniq.map(card=>({cardId:card.id,title:card.title,status:C.statusFor(state,card.id,ctx),maneuver:maneuverKey(card)}));const touched=steps.filter(s=>s.status!=='new').length,done=steps.filter(s=>s.status==='done').length;return{...g,steps,total:steps.length,touched,done,remaining:steps.length-touched,depth:steps.length?Math.round(touched/steps.length*100):0};}).filter(g=>g.total).sort((a,b)=>a.depth-b.depth||b.total-a.total);
}
C.workflowRows=workflowRows;
root.OBOL_CORE_V22={VERSION,ensure22};
})(typeof window!=='undefined'?window:globalThis);
