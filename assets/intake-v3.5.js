// Obol v3.5 Intake overlay — command-intent disambiguation and outcome repair for terminal evidence.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21;if(!C||!T||!T.analyzeTerminal)return;
const oldAnalyze=T.analyzeTerminal;
function norm35(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function cardMap35(lanes){const m={};for(const l of lanes||[])for(const c of l.cards||[])m[c.id]=c;return m;}
function intentCard35(command){
  const raw=String(command||''),c=norm35(raw);
  if(/\bnxc\s+ldap\b/.test(c)){
    if(/--asreproast\b/.test(c))return'asrep-roast';
    if(/--kerberoasting\b/.test(c))return'kerberoast';
    if(/--bloodhound\b/.test(c))return'bloodhound-collect';
    if(/(?:^|\s)-m\s+laps\b/i.test(raw))return'laps-read';
    const selectors=/--(?:users|active-users|users-export|groups|computers|dc-list|get-sid|pass-pol|pso|base-dn)\b/.test(c),anon=/-u\s+(?:''|"")/.test(raw)&&/-p\s+(?:''|"")/.test(raw);
    if(selectors||anon)return'ad-anon-ldap-enum';
  }
  if(/\bnxc\s+smb\b/.test(c)){
    if(/--gen-relay-list\b/.test(c))return'ntlm-relay';
    if(/--(?:sam|lsa|ntds)\b/.test(c))return'dump-secrets';
    if(/(?:^|\s)-(?:x|X)(?:\s|$)/.test(raw))return'lateral-exec';
    if(/--rid-brute\b/.test(c))return'ad-user-enum';
  }
  if(/\bbloodhound-python\b/.test(c))return'bloodhound-collect';
  if(/\bcertipy\b/.test(c)&&/\b(?:find|req|auth)\b/.test(c))return'adcs-esc';
  return'';
}
function outcomes35(cardId,command,output,current){
  const out=[...new Set(current||[])],add=x=>{if(!out.includes(x))out.push(x);},text=String(output||'');
  if(cardId==='ad-anon-ldap-enum'){
    if(/\[\+\].*(?:\\:|anonymous)|anonymous bind|bind successful/i.test(text))add('ad.anonymous_bind');
    if(/Enumerated\s+\d+\s+domain users|\b-Username-\b|\bsAMAccountName\b/i.test(text))add('ad.user_list');
    if(/Enumerated\s+\d+\s+(?:domain\s+)?groups|\bgroup list\b/i.test(text))add('ad.group_list');
    if(/Enumerated\s+\d+\s+(?:domain\s+)?computers|\bcomputer list\b/i.test(text))add('ad.computer_list');
  }
  return out;
}
function repairActivity35(a,lanes){
  const id=intentCard35(a.command);if(!id)return a;const cards=cardMap35(lanes),c=cards[id];if(!c)return a;
  const changed=a.cardId!==id;if(changed){a.cardId=id;a.title=c.title;a.reason='Command intent matched '+c.title+'. '+String(a.reason||'');a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm35(a.command)+'|'+String(a.outputSnippet||a.evidence||'').slice(0,800)):id);}
  if(a.result==='success')a.outcomeFacts=outcomes35(id,a.command,a.evidence||a.outputSnippet,a.outcomeFacts);
  return a;
}
T.analyzeTerminal=function(text,lanes,state,ctx){const r=oldAnalyze(text,lanes,state,ctx);r.activities=(r.activities||[]).map(a=>repairActivity35(a,lanes));const seen=new Set();r.activities=r.activities.filter(a=>{if(seen.has(a.fingerprint))return false;seen.add(a.fingerprint);return true;});return r;};
root.OBOL_INTAKE_V35={version:'3.5.0',intentCard35,outcomes35,repairActivity35};
})(typeof window!=='undefined'?window:globalThis);
