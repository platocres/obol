// Obol v2.3 intake helpers — distill useful identity lists from LDAP/NetExec evidence.
(function(root){
'use strict';
function cleanUser(v){v=String(v||'').trim().replace(/^.*\\/,'').replace(/@[^\s]+$/,'');return v;}
function useful(v){return /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(v)&&!/(?:^|\b)(?:username|guest|defaultaccount|krbtgt)$/i.test(v)&&!/^SM_/i.test(v)&&!/^HealthMailbox/i.test(v)&&!/^\$/i.test(v)&&!v.endsWith('$');}
function extractUsers(text,mode){
  const out=new Set(),add=v=>{v=cleanUser(v);if(useful(v))out.add(v);};
  for(const raw of String(text||'').split(/\r?\n/)){const line=raw.trim();let m;
    if((mode==='nxc'||/^LDAP\s+/i.test(line))&&(m=line.match(/^LDAP\s+\S+\s+\d+\s+\S+\s+([^\s]+)\s+(?:<never>|\d{4}-\d{2}-\d{2})\b/i)))add(m[1]);
    if((m=line.match(/^sAMAccountName:\s*(\S+)/i)))add(m[1]);
    if((m=line.match(/^userPrincipalName:\s*([^@\s]+)@[A-Za-z0-9.-]+/i)))add(m[1]);
    if((m=line.match(/^\[\+\]\s+VALID USERNAME:\s*([^@\s]+)@/i)))add(m[1]);
  }
  return [...out];
}
function normalizeUsers(values){const out=[];for(const v of values||[]){const u=cleanUser(v);if(useful(u)&&!out.some(x=>x.toLowerCase()===u.toLowerCase()))out.push(u);}return out;}
root.OBOL_INTAKE_V23={version:'2.3.0',extractUsers,normalizeUsers};
})(typeof window!=='undefined'?window:globalThis);
