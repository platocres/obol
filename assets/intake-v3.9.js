// Obol v3.9 Intake overlay — broader high-confidence tool intent, conservative outcomes, and mixed-session segmentation.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,V36=root.OBOL_INTAKE_V36;if(!C||!T||!T.analyzeTerminal)return;
const oldAnalyze=T.analyzeTerminal,normalize=root.OBOL_INTAKE_V25&&root.OBOL_INTAKE_V25.normalizeText||((x)=>String(x||''));
function norm39(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function cards39(lanes){const m={};for(const l of lanes||[])for(const c of l.cards||[])m[c.id]=c;return m;}
function intent39(command){
  const c=norm39(command);
  if(/(?:impacket-)?getnpusers|\bgetnpusers\.py\b/.test(c))return'asrep-roast';
  if(/(?:impacket-)?getuserspns|\bgetuserspns\.py\b/.test(c))return'kerberoast';
  if(/(?:impacket-)?gettgt|\bgettgt\.py\b/.test(c))return'kerberos-tickets';
  if(/impacket-secretsdump|\bsecretsdump\.py\b/.test(c))return/(?:^|\s)-(?:just-dc|just-dc-user|just-dc-ntlm)(?:\s|$)/.test(c)?'dcsync':'dump-secrets';
  if(/impacket-(?:psexec|wmiexec|smbexec|atexec)|\b(?:psexec|wmiexec|smbexec|atexec)\.py\b/.test(c))return'lateral-exec';
  if(/(?:curl|wget).{0,180}\blinpeas\.sh\b|(?:^|\s)(?:bash|sh)\s+\S*linpeas\.sh\b|(?:^|\s)\.\/linpeas\.sh\b/.test(c))return'linux-enum';
  if(/(?:^|[\\/\s])winpeas(?:x64|x86)?\.exe\b/.test(c))return'windows-enum';
  if(/(?:^|\s)sqlmap(?:\.py)?\b/.test(c))return'sqlmap-automation';
  return V36&&V36.intentCard36?V36.intentCard36(command):'';
}
function strong39(cardId,output){
  const t=String(output||'');
  if(cardId==='asrep-roast')return/\$krb5asrep\$/i.test(t);
  if(cardId==='kerberoast')return/\$krb5tgs\$/i.test(t);
  if(cardId==='kerberos-tickets')return/(?:saving ticket in|ticket saved to).{0,160}\.(?:ccache|kirbi)|TGT request successful|ticket successfully imported|successfully imported ticket/i.test(t);
  if(cardId==='dump-secrets')return/(?:^|\n)[^:\r\n]+:\d+:[0-9a-f]{32}:[0-9a-f]{32}:::/im.test(t);
  if(cardId==='dcsync')return/(?:^|\n)(?:krbtgt|administrator):\d+:[0-9a-f]{32}:[0-9a-f]{32}:::/im.test(t);
  if(cardId==='lateral-exec')return/nt authority\\system|C:\\Windows\\system32>/i.test(t);
  if(cardId==='sqlmap-automation')return/(?:parameter\s+['"`]?[^\r\n]{0,100}?appears to be injectable|back-end DBMS\s*:)/i.test(t);
  return V36&&V36.strong36?V36.strong36(cardId,output):false;
}
function outcomes39(cardId,output,current){
  const out=[...new Set(current||[])],add=x=>{if(!out.includes(x))out.push(x);},t=String(output||'');
  if(cardId==='asrep-roast'&&/\$krb5asrep\$/i.test(t))add('kerberos.asrep_hash');
  if(cardId==='kerberoast'&&/\$krb5tgs\$/i.test(t))add('kerberos.tgs_hash');
  if(cardId==='kerberos-tickets'&&strong39(cardId,t))add('kerberos.ticket');
  if(cardId==='dump-secrets'&&/(?:^|\n)[^:\r\n]+:\d+:[0-9a-f]{32}:[0-9a-f]{32}:::/im.test(t))add('hash.ntlm');
  if(cardId==='dcsync'){
    if(/(?:^|\n)krbtgt:\d+:[0-9a-f]{32}:[0-9a-f]{32}:::/im.test(t))add('hash.krbtgt');
    else if(/(?:^|\n)[^:\r\n]+:\d+:[0-9a-f]{32}:[0-9a-f]{32}:::/im.test(t))add('hash.ntlm');
  }
  if(cardId==='lateral-exec'&&/nt authority\\system/i.test(t)){add('foothold.windows');add('access.system');}
  if(cardId==='sqlmap-automation'&&strong39(cardId,t))add('web.sqli_confirmed');
  return out;
}
function service39(id){if(['asrep-roast','kerberoast','kerberos-tickets'].includes(id))return'kerberos';if(['dump-secrets','dcsync','lateral-exec'].includes(id))return'smb';if(id==='sqlmap-automation')return'web';if(id==='linux-enum')return'linux-privesc';if(id==='windows-enum')return'windows-privesc';return'';}
function repair39(a,lanes){
  if(!a)return{activity:a,changed:false,newFacts:[]};const beforeId=a.cardId,beforeResult=a.result,beforeFacts=[...(a.outcomeFacts||[])];
  if(V36&&V36.repairActivity36)V36.repairActivity36(a,lanes);
  const id=intent39(a.command),map=cards39(lanes),card=id&&map[id];if(card){
    if(a.cardId!==id){a.cardId=id;a.title=card.title;a.reason='High-confidence command intent matched '+card.title+'. '+String(a.reason||'');}
    const evidence=a.evidence||a.outputSnippet||'',proven=strong39(id,evidence);
    if(proven){a.result='success';a.assessment='supported';a.confidence='high';a.reason='Explicit tool output supported the '+card.title+' workflow.';}
    if(a.result==='success'||proven)a.outcomeFacts=outcomes39(id,evidence,a.outcomeFacts);
    a.service=a.service||service39(id);a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm39(a.command)+'|'+String(evidence).slice(0,800)):id);
  }
  const newFacts=(a.outcomeFacts||[]).filter(x=>!beforeFacts.includes(x));return{activity:a,changed:beforeId!==a.cardId||beforeResult!==a.result||newFacts.length>0,newFacts};
}
function commandLine39(line){
  const s=String(line||''),patterns=[
    /impacket-(?:getnpusers|getuserspns|gettgt|secretsdump|psexec|wmiexec|smbexec|atexec)\b/i,
    /\S*(?:GetNPUsers|GetUserSPNs|getTGT|secretsdump|psexec|wmiexec|smbexec|atexec)\.py\b/i,
    /(?:curl|wget)\b.*\blinpeas\.sh\b/i,/(?:^|\s)(?:bash|sh)\s+\S*linpeas\.sh\b/i,/(?:^|\s)\.\/linpeas\.sh\b/i,
    /(?:^|[\\/\s])winpeas(?:x64|x86)?\.exe\b/i,/(?:^|\s)sqlmap(?:\.py)?\b/i
  ];
  let best=null;for(const re of patterns){const m=re.exec(s);if(m&&(!best||m.index<best.index))best=m;}if(!best)return'';return s.slice(best.index).trim();
}
function segments39(text){
  const lines=String(text||'').split(/\r?\n/),out=[];let cur=null;const push=()=>{if(!cur)return;cur.output=cur.output.join('\n').trim();out.push(cur);cur=null;};
  for(const line of lines){const cmd=commandLine39(line);if(cmd&&intent39(cmd)){push();cur={command:cmd,rawPrompt:line,output:[]};continue;}if(cur)cur.output.push(line);}push();return out;
}
function proposal39(seg,lanes){const id=intent39(seg&&seg.command),card=id&&cards39(lanes)[id];if(!card)return null;const evidence=String(seg&&seg.output||'').trim(),proven=strong39(id,evidence);return{cardId:id,title:card.title,command:String(seg.command||''),evidence:evidence.slice(0,3000),outputSnippet:evidence.slice(0,1200),result:proven?'success':'tried',assessment:proven?'supported':'attempted',confidence:proven?'high':'medium',reason:proven?'Explicit tool output supported the '+card.title+' workflow.':'Recognized high-confidence command intent for '+card.title+'.',outcomeFacts:proven?outcomes39(id,evidence,[]):[],fingerprint:'terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm39(seg.command)+'|'+evidence.slice(0,800)):id),credentialId:'',service:service39(id)};}
function addFacts39(state,a,newFacts){for(const f of newFacts||[]){const opts={context:a.context||state.activeContext,source:'activity-repair:v3.9',evidence:String(a.evidence||a.outputSnippet||'').slice(0,500),confidence:a.confidence||'high',observedAt:a.at};if(C.addFact)C.addFact(state,f,opts);if(C.recordKnowledge)C.recordKnowledge(state,f,'supported',opts);}}
function repairWorkspace39(state,lanes){if(!state||!Array.isArray(state.activities))return 0;let changed=0;for(const a of state.activities){const r=repair39(a,lanes);if(!r.changed)continue;changed++;addFacts39(state,a,r.newFacts);}if(changed)state.updatedAt=C.now();return changed;}
T.analyzeTerminal=function(text,lanes,state,ctx){
  const clean=normalize(text),r=oldAnalyze(clean,lanes,state,ctx);r.normalizedText39=clean;r.activities=Array.isArray(r.activities)?r.activities:[];
  const merged=[],seenSeg=new Set();for(const seg of [...(r.segments||[]),...segments39(clean)]){const k=norm39(seg&&seg.command);if(!k||seenSeg.has(k))continue;seenSeg.add(k);merged.push(seg);}r.segments=merged;
  const existing=new Set(r.activities.map(a=>norm39(a.command)));for(const seg of merged){const k=norm39(seg.command);if(!k||existing.has(k))continue;const p=proposal39(seg,lanes);if(p){r.activities.push(p);existing.add(k);}}
  r.activities=r.activities.map(a=>repair39(a,lanes).activity);const uniq=new Set();r.activities=r.activities.filter(a=>{const k=a.fingerprint||[a.cardId,norm39(a.command),String(a.evidence||'').slice(0,300)].join('|');if(uniq.has(k))return false;uniq.add(k);return true;});
  r.coverage39=[...new Set(r.activities.map(a=>C.toolFamily39?C.toolFamily39(a.command):'').filter(Boolean))];return r;
};
root.OBOL_INTAKE_V39={version:'3.9.0',intent39,strong39,outcomes39,segments39,proposal39,repairActivity39:repair39,repairWorkspace39};
})(typeof window!=='undefined'?window:globalThis);
