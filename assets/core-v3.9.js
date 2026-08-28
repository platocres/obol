// Obol v3.9 core overlay — Evidence coverage state, tool-family summaries, and current release state.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2;if(!C)throw new Error('Obol v2 core is required before core-v3.9.js');
const VERSION='3.9.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldSanitize=C.sanitizedCopy;
function ensure39(s){
  s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};
  const old=s.ui.evidence39&&typeof s.ui.evidence39==='object'?s.ui.evidence39:{};
  s.ui.evidence39={showCoverage:old.showCoverage!==false};
  return s;
}
C.VERSION=VERSION;
C.newState=function(){return ensure39(oldNew());};
C.coerceState=function(raw){return ensure39(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure39(oldMigrate(raw));};
function norm39(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function toolFamily39(command){
  const c=norm39(command);
  if(/(?:impacket-)?getnpusers|\bgetnpusers\.py\b/.test(c))return'impacket-asrep';
  if(/(?:impacket-)?getuserspns|\bgetuserspns\.py\b/.test(c))return'impacket-kerberoast';
  if(/(?:impacket-)?gettgt|\bgettgt\.py\b/.test(c))return'impacket-tgt';
  if(/impacket-secretsdump|\bsecretsdump\.py\b/.test(c))return'impacket-secretsdump';
  if(/impacket-(?:psexec|wmiexec|smbexec|atexec)|\b(?:psexec|wmiexec|smbexec|atexec)\.py\b/.test(c))return'impacket-remote-exec';
  if(/\blinpeas(?:\.sh)?\b/.test(c))return'peas-linux';
  if(/\bwinpeas(?:x64|x86)?(?:\.exe)?\b/.test(c))return'peas-windows';
  if(/\bsqlmap(?:\.py)?\b/.test(c))return'sqlmap';
  if(/\bcertipy\b/.test(c))return'certipy';
  if(/\brubeus(?:\.exe)?\b/.test(c))return'rubeus';
  if(/\bnxc\b|\bnetexec\b/.test(c))return'netexec';
  return'';
}
function evidenceCoverageSummary39(state,ctx){
  ensure39(state);const key=C.contextKey(C.normalizeContext(state,ctx||state.activeContext)),groups={};
  for(const a of state.activities||[]){if(a.contextKey!==key)continue;const family=toolFamily39(a.command);if(!family)continue;const g=groups[family]||(groups[family]={family,total:0,success:0,tried:0,failed:0,latestAt:'',cards:new Set()});g.total++;if(a.result==='success')g.success++;else if(a.result==='failed')g.failed++;else g.tried++;if(a.cardId)g.cards.add(a.cardId);if(String(a.at||'')>g.latestAt)g.latestAt=String(a.at||'');}
  return Object.values(groups).map(g=>({...g,cards:[...g.cards]})).sort((a,b)=>b.total-a.total||a.family.localeCompare(b.family));
}
C.ensure39=ensure39;C.toolFamily39=toolFamily39;C.evidenceCoverageSummary39=evidenceCoverageSummary39;
C.sanitizedCopy=function(state){return ensure39(oldSanitize(state));};
root.OBOL_CORE_V39={VERSION,ensure39,toolFamily39,evidenceCoverageSummary39};
})(typeof window!=='undefined'?window:globalThis);
