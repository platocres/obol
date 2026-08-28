// Obol v4.0 core overlay — operator execution context, platform-aware Path signals, and execution provenance.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2;if(!C)throw new Error('Obol v2 core is required before core-v4.0.js');
const VERSION='4.0.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldRanked=C.rankedApplicable,oldRecord=C.recordActivity,oldSanitize=C.sanitizedCopy;
const MODES=new Set(['either','kali','windows']);
const KALI_TOOLS=new Set(['nxc','netexec','bloodhound-python','certipy','evil-winrm','xfreerdp','impacket-psexec','impacket-wmiexec','impacket-smbexec','impacket-atexec','impacket-secretsdump','impacket-getnpusers','impacket-getuserspns','impacket-gettgt','impacket-getst','ldapsearch','kerbrute','hashcat','john','hydra','responder','ffuf','feroxbuster','gobuster','sqlmap','smbclient','smbmap','enum4linux','enum4linux-ng','rpcclient']);
const WINDOWS_TOOLS=new Set(['rubeus','mimikatz','sharphound','powerview','powershell','cmd','wmic','reg','sc','msiexec','accesschk','psexec','godpotato','winpeas','winpeasx64','winpeasx86','setspn','nltest']);
function ensure40(s){
  s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};
  const old=s.ui.operator40&&typeof s.ui.operator40==='object'?s.ui.operator40:{};
  const by=old.byContext&&typeof old.byContext==='object'?old.byContext:{};
  s.ui.operator40={byContext:{...by},showCommandContext:old.showCommandContext!==false};
  for(const k of Object.keys(s.ui.operator40.byContext))if(!MODES.has(s.ui.operator40.byContext[k]))delete s.ui.operator40.byContext[k];
  return s;
}
C.VERSION=VERSION;
C.newState=function(){return ensure40(oldNew());};
C.coerceState=function(raw){return ensure40(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure40(oldMigrate(raw));};
function contextKey40(state,ctx){return C.contextKey(C.normalizeContext(state,ctx||state.activeContext));}
function operatorMode40(state,ctx){ensure40(state);return state.ui.operator40.byContext[contextKey40(state,ctx)]||'either';}
function setOperatorMode40(state,ctx,mode){ensure40(state);mode=MODES.has(mode)?mode:'either';state.ui.operator40.byContext[contextKey40(state,ctx)]=mode;state.updatedAt=C.now();return mode;}
function toolId40(cmd){return String(cmd&&cmd.tool||'').trim().toLowerCase().replace(/\.exe$/,'');}
function variantHint40(cmd){return String(cmd&&cmd.v||'').toLowerCase();}
function commandSurface40(cmd,card){
  if(cmd&&['kali','windows','target','either'].includes(cmd.operatorSurface40))return cmd.operatorSurface40;
  const tool=toolId40(cmd),v=variantHint40(cmd),run=String(cmd&&cmd.run||'').toLowerCase();
  if(KALI_TOOLS.has(tool)||['kali','remote','nxc','impacket','winrm','wmi'].includes(v))return'kali';
  if(WINDOWS_TOOLS.has(tool)||['win','windows','exe'].includes(v))return'windows';
  if(/\b(?:rubeus|mimikatz|sharphound)(?:\.exe)?\b|\bget-(?:net|domain)|\benter-pssession\b|\bnet\s+(?:user|group)\b|\bnltest\b|\bsetspn\b|[a-z]:\\/.test(run))return'windows';
  if(/\bimpacket-|\bnxc\b|\bnetexec\b|\bevil-winrm\b|\bxfreerdp\b|\bbloodhound-python\b|\bcertipy\b|\bproxychains|\/usr\/share\//.test(run))return'kali';
  if(tool==='linpeas'||/\blinpeas(?:\.sh)?\b/.test(run))return'target';
  if(tool==='sh'&&card&&String(card.lane||'').includes('linux'))return'target';
  return'either';
}
function executionSurfaceFromCommand40(command){
  const run=String(command||''),low=run.toLowerCase();
  if(/\b(?:rubeus|mimikatz|sharphound)(?:\.exe)?\b|\bget-(?:net|domain)|\benter-pssession\b|\bnet\s+(?:user|group)\b|\bnltest\b|\bsetspn\b|[a-z]:\\/i.test(run))return'windows';
  if(/\bimpacket-|\bnxc\b|\bnetexec\b|\bevil-winrm\b|\bxfreerdp\b|\bbloodhound-python\b|\bcertipy\b|\bproxychains|\/usr\/share\//.test(low))return'kali';
  return'either';
}
function cardSurfaceSummary40(card){
  const out={kali:0,windows:0,target:0,either:0,total:0,commands:[]};
  for(const [index,cmd] of (card&&card.commands||[]).entries()){const surface=commandSurface40(cmd,card);out[surface]=(out[surface]||0)+1;out.total++;out.commands.push({index,commandId:C.commandId?C.commandId(cmd,index):String(index),tool:cmd.tool||'',surface,variant:cmd.v||''});}
  return out;
}
function operatorSignal40(state,card,ctx){
  const mode=operatorMode40(state,ctx),summary=cardSurfaceSummary40(card);if(mode==='either')return{mode,delta:0,reason:'',summary,matchCount:summary.kali+summary.windows+summary.target+summary.either};
  const match=summary[mode]||0,neutral=(summary.target||0)+(summary.either||0),opposite=mode==='kali'?(summary.windows||0):(summary.kali||0);let delta=0,reason='';
  if(match){delta=8;reason=(mode==='kali'?'Kali-side':'Windows-side')+' implementation available';}
  else if(neutral){delta=0;reason='operator-side-neutral implementation available';}
  else if(opposite){delta=-8;reason='no '+(mode==='kali'?'Kali-side':'Windows-side')+' implementation is identified on this card; technique remains applicable';}
  return{mode,delta,reason,summary,matchCount:match+neutral};
}
if(oldRanked)C.rankedApplicable=function(state,lanes,ctx,opts){
  const rows=oldRanked(state,lanes,ctx,opts||{}).map(r=>{const sig=operatorSignal40(state,r.card,ctx),why=sig.reason?(r.why?r.why+'; ':'')+sig.reason:r.why;return{...r,score:r.score+sig.delta,operatorContext40:sig,why};});
  return rows.sort((a,b)=>b.score-a.score||a.card.title.localeCompare(b.card.title));
};
if(oldRecord)C.recordActivity=function(state,a){
  ensure40(state);a=a||{};const mode=a.operatorMode40||operatorMode40(state,a.context||state.activeContext),rec=oldRecord(state,a);if(rec){rec.operatorMode40=MODES.has(mode)?mode:'either';rec.executionSurface40=a.executionSurface40||executionSurfaceFromCommand40(rec.command||a.command||'');}
  return rec;
};
C.ensure40=ensure40;C.operatorMode40=operatorMode40;C.setOperatorMode40=setOperatorMode40;C.commandSurface40=commandSurface40;C.executionSurfaceFromCommand40=executionSurfaceFromCommand40;C.cardSurfaceSummary40=cardSurfaceSummary40;C.operatorSignal40=operatorSignal40;
C.sanitizedCopy=function(state){return ensure40(oldSanitize(state));};
root.OBOL_CORE_V40={VERSION,ensure40,operatorMode40,setOperatorMode40,commandSurface40,executionSurfaceFromCommand40,cardSurfaceSummary40,operatorSignal40};
})(typeof window!=='undefined'?window:globalThis);
