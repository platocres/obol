// Obol v2.1 terminal-aware Intake — reconstruct attempts/successes from pasted shell sessions.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2;
function clean(s){return String(s==null?'':s).trim();}
function norm(s){return clean(s).toLowerCase().replace(/\{\{[^}]+\}\}/g,' ').replace(/["']/g,'').replace(/\s+/g,' ');}
function firstExec(cmd){
  let t=norm(cmd).split(/\s+/).filter(Boolean);while(t.length&&['sudo','proxychains','proxychains4','env','command','nohup'].includes(t[0]))t.shift();
  if(t[0]&&/^(python|python3|bash|sh|pwsh|powershell)$/.test(t[0])&&t[1]&&/\.(py|sh|ps1)$/.test(t[1]))return t[1].split('/').pop().replace(/\.(py|sh|ps1)$/,'');
  return (t[0]||'').split('/').pop().replace(/\.exe$/,'');
}
function staticTokens(template){
  const s=norm(template).replace(/[|;&><()]/g,' ');return s.split(/\s+/).filter(t=>t&& !t.includes('{{') && !/^[-/]?[a-z]$/i.test(t) && !/^\d+(\.\d+){2,}$/.test(t) && t.length>1);
}
function promptCommand(line){
  line=String(line||''); let m;
  const pats=[
    /^\s*└─[$#]\s*(.+)$/,
    /^\s*(?:\[[^\]]+\]\s*)?[\w.()-]+@[\w.-]+(?::[^$#]*)?[$#]\s+(.+)$/,
    /^\s*PS\s+(?:[A-Za-z]:\\[^>]*)?>\s*(.+)$/i,
    /^\s*[A-Za-z]:\\[^>]*>\s*(.+)$/,
    /^\s*[$#]\s+(.+)$/
  ];
  for(const p of pats){m=line.match(p);if(m)return clean(m[1]);}
  return '';
}
function knownExecutables(lanes){const s=new Set();for(const l of lanes||[])for(const c of l.cards||[])for(const x of c.commands||[]){const e=firstExec(x.run||x.tool);if(e)s.add(e);}return s;}
function looksLikeBareCommand(line,execs){
  const x=clean(line);if(!x||x.length>500||/^(PORT\s+STATE|Nmap scan report|Starting Nmap|uid=|gid=|root:|[-dcbpsl][rwx-]{9}\s)/i.test(x))return false;
  const e=firstExec(x);return execs.has(e)&&/\s/.test(x);
}
function extractSegments(text,lanes){
  const lines=String(text||'').split(/\r?\n/), execs=knownExecutables(lanes), out=[];let cur=null;
  function push(){if(cur){cur.output=cur.output.join('\n').trim();out.push(cur);cur=null;}}
  for(const line of lines){let cmd=promptCommand(line);if(!cmd&&!cur&&looksLikeBareCommand(line,execs))cmd=clean(line);if(cmd){push();cur={command:cmd,rawPrompt:line,output:[]};}else if(cur)cur.output.push(line);}
  push();return out;
}
function allCards(lanes){return (lanes||[]).flatMap(l=>(l.cards||[]).map(c=>{if(!c.lane)c.lane=l.lane;return c;}));}
function patternHit(text,p){if(!p)return false;try{return new RegExp(p,'i').test(text);}catch(e){return String(text).toLowerCase().includes(String(p).toLowerCase());}}
function expectedHits(card,output){return (card.expected||[]).filter(x=>clean(x)&&patternHit(output,x));}
function failureHit(card,output){for(const k of Object.keys(card.onFailure||{}))if(clean(k)&&patternHit(output,k))return k;return '';}
function commandMatchScore(card,seg){
  const cmd=norm(seg.command),out=String(seg.output||''),exe=firstExec(cmd);let best=-1,detail=null;
  for(const template of card.commands||[]){const run=template.run||'',te=firstExec(run||template.tool),tokens=staticTokens(run),hits=tokens.filter(t=>cmd.includes(t)),coverage=tokens.length?hits.length/tokens.length:0;let score=0;
    if(exe&&te&&exe===te)score+=8;else if(template.tool&&exe===norm(template.tool).replace(/\.exe$/,''))score+=7;else continue;
    score+=Math.min(12,hits.length*2)+Math.round(coverage*7);
    if(norm(run)===cmd)score+=8;
    const eh=expectedHits(card,out);if(eh.length)score+=Math.min(8,eh.length*3);
    if(tokens.length<=1&&['id','whoami','sh','cmd','powershell','curl','python3','python'].includes(exe)&&!eh.length)score-=10;
    if(score>best){best=score;detail={template,score,hits,coverage,expected:eh};}
  }
  return detail;
}
function bestCardForSegment(seg,lanes){
  let best=null;for(const c of allCards(lanes)){const m=commandMatchScore(c,seg);if(!m||m.score<10)continue;if(!best||m.score>best.match.score)best={card:c,match:m};}
  return best;
}
function genericFacts(text){
  const t=String(text||''),facts=[];const add=(id,why,evidence,confidence)=>facts.push({id,why,evidence:clean(evidence||why).slice(0,240),confidence:confidence||'high'});
  if(/uid=0\(root\)/i.test(t)){add('foothold.linux','Linux shell context observed','uid=0(root)');add('access.root','Root identity confirmed','uid=0(root)');}
  else if(/uid=\d+\([^)]*\)/i.test(t))add('foothold.linux','Linux shell identity observed',(t.match(/uid=\d+\([^)]*\)[^\n]*/i)||[''])[0],'medium');
  if(/nt authority\\system/i.test(t)){add('foothold.windows','Windows shell context observed','NT AUTHORITY\\SYSTEM');add('access.system','SYSTEM identity confirmed','NT AUTHORITY\\SYSTEM');}
  if(/\bSeImpersonatePrivilege\s+.*Enabled/i.test(t))add('privesc.leads','SeImpersonatePrivilege is enabled',(t.match(/SeImpersonatePrivilege[^\n]*/i)||[''])[0]);
  if(/NOPASSWD\s*:/i.test(t))add('privesc.leads','sudo NOPASSWD entry observed',(t.match(/[^\n]*NOPASSWD[^\n]*/i)||[''])[0]);
  if(/Sharename\s+Type\s+Comment/i.test(t))add('smb.shares','SMB share listing observed','Sharename Type Comment');
  if(/showmount/i.test(t)&&/^\/\S+\s+\S+/m.test(t))add('nfs.exports','NFS export listing observed',(t.match(/^\/\S+\s+\S+.*$/m)||[''])[0]);
  if(/Pwn3d!/i.test(t)){add('credential.available','Credential accepted by remote service','Pwn3d!');add('access.admin','Administrative access confirmed','Pwn3d!');}
  if(/\*Evil-WinRM\*\s+PS|C:\\Windows\\system32>/i.test(t))add('foothold.windows','Interactive Windows shell observed',(t.match(/\*Evil-WinRM\*\s+PS[^\n]*|C:\\Windows\\system32>/i)||[''])[0]);
  if(/HTTP\/\d(?:\.\d)?\s+(?:200|201|204|301|302|401|403)/i.test(t))add('web.reachable','HTTP response observed',(t.match(/HTTP\/[^\n]*/i)||[''])[0],'medium');
  if(/Nmap done:/i.test(t))add('scan.initial','Completed Nmap scan observed',(t.match(/Nmap done:[^\n]*/i)||[''])[0]);
  if(/The command completed successfully/i.test(t)&&/net\s+(?:user|group)\s+.*\/domain/i.test(t))add('ad.user_list','Successful domain enumeration observed','The command completed successfully','medium');
  return facts;
}
function inferOutcomes(card,seg){
  const out=String(seg.output||''),cmd=String(seg.command||''),prod=card.produces||[],picked=[];const take=id=>{if(prod.includes(id)&&!picked.includes(id))picked.push(id);};
  if(prod.length===1&&!['access.root','access.system','access.admin','foothold.linux','foothold.windows','foothold.webshell'].includes(prod[0]))return prod.slice();
  if(/uid=0\(root\)/i.test(out))take('access.root');
  if(/nt authority\\system/i.test(out))take('access.system');
  if(/Pwn3d!/i.test(out))take('access.admin');
  if(/Sharename\s+Type\s+Comment/i.test(out))take('smb.shares');
  if(/Nmap done:/i.test(out)){take('scan.initial');if(/(?:^|\s)-p-\b/.test(cmd))take('scan.full');}
  if(/\*Evil-WinRM\*\s+PS|C:\\Windows\\system32>/i.test(out))take('foothold.windows');
  if(/uid=\d+\(/i.test(out))take('foothold.linux');
  if(/Pwn3d!|Authentication succeeded|STATUS_SUCCESS/i.test(out))take('credential.available');
  if(/Sharename|READ|WRITE/i.test(out))take('smb.reachable');
  if(/accounts for|The command completed successfully/i.test(out))take('ad.user_list');
  if(/GenericAll|WriteDacl|WriteOwner/i.test(out))take('ad.attack_paths');
  return picked;
}
function serviceFor(card,seg){const s=((card.lane||'')+' '+card.id+' '+seg.command).toLowerCase();for(const x of ['winrm','smb','rdp','ssh','ldap','kerberos','mssql','mysql','postgresql','ftp'])if(s.includes(x))return x;return '';}
function inferCredential(state,seg){const cmd=String(seg.command||'');for(const c of state&&state.credentials||[]){if((c.username&&cmd.includes(c.username))||(c.secret&&cmd.includes(c.secret)))return c;}return null;}
function fingerprint(cardId,seg){const h=C&&C.simpleHash?C.simpleHash(cardId+'|'+norm(seg.command)+'|'+clean(seg.output).slice(0,800)):String(cardId+'|'+seg.command).length;return 'terminal:'+h;}
function analyzeTerminal(text,lanes,state,ctx){
  const segs=extractSegments(text,lanes),activities=[],factMap={};for(const f of genericFacts(text))factMap[f.id]=f;
  for(const seg of segs){const best=bestCardForSegment(seg,lanes);if(!best)continue;const card=best.card,fh=failureHit(card,seg.output),eh=expectedHits(card,seg.output);let result='tried',assessment='attempted',confidence='medium',reason='Recognized command for '+card.title+'.';
    if(fh){assessment='refuted';confidence='high';reason='Recognized failure signal: '+fh;}
    else if(eh.length){result='success';assessment='supported';confidence='high';reason='Matched success signal'+(eh.length>1?'s':'')+': '+eh.slice(0,3).join(', ');}
    else if(/uid=0\(root\)|nt authority\\system|Pwn3d!|\*Evil-WinRM\*\s+PS|C:\\Windows\\system32>|The command completed successfully/i.test(seg.output)){result='success';assessment='supported';confidence='high';reason='Strong generic terminal success signal matched.';}
    const outcomeFacts=result==='success'?inferOutcomes(card,seg):[], fp=fingerprint(card.id,seg),cred=inferCredential(state,seg),service=serviceFor(card,seg);
    if(!activities.some(a=>a.fingerprint===fp))activities.push({cardId:card.id,title:card.title,command:seg.command,evidence:clean(seg.output).slice(0,3000),outputSnippet:clean(seg.output).slice(0,1200),result,assessment,confidence,reason,outcomeFacts,fingerprint:fp,credentialId:cred&&cred.id||'',service});
  }
  return {segments:segs,activities,facts:Object.values(factMap)};
}
function mergeBase(base,terminal){
  base=base||{mode:'generic',facts:{},params:{},artifacts:{users:[],hashes:[],creds:[]},hosts:[],domain:''};base.activities=terminal.activities;base.terminalSegments=terminal.segments;
  for(const f of terminal.facts)if(!base.facts[f.id])base.facts[f.id]={why:f.why,evidence:f.evidence,confidence:f.confidence};return base;
}
root.OBOL_INTAKE_V21={extractSegments,analyzeTerminal,mergeBase,bestCardForSegment,genericFacts,inferOutcomes};
})(typeof window!=='undefined'?window:globalThis);
