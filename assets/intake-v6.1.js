// Obol v6.1 Intake overlay — conservative proof for PXE, TimeRoast, and trust-path owners.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,M=root.OBOL_METHODOLOGY_V61;if(!C||!T||!T.analyzeTerminal||!M)return;
const oldAnalyze=T.analyzeTerminal,normalize=root.OBOL_INTAKE_V25&&root.OBOL_INTAKE_V25.normalizeText||((x)=>String(x||''));
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function cards(lanes){const out={};for(const l of lanes||[])for(const c of l.cards||[])out[c.id]=c;return out;}
function intent61(command){const c=norm(command);
 if(/pxethief\.py|\btftp\b.*(?:boot\.var|pxe)|hashcat\s+-m\s+19850/.test(c))return'pxe-naa61';
 if(/timeroast\.py|hashcat\s+-m\s+31300/.test(c))return'timeroast61';
 if(/raisechild|parent_domain|child_domain|trustfakeuser/.test(c))return'trust-child-parent61';
 if(/get-domaintrust|trusted_domain|trustuser|foreign.*member|memberOf.*domain|impacket-smbclient.*-k.*-no-pass/.test(c))return'trust-external61';
 return'';}
function proof61(cardId,command,output){const t=String(output||''),c=norm(command),facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};
 if(cardId==='pxe-naa61'){
  if(/pxe/i.test(t)&&/(distribution point|deployment|boot image|site code|tftp)/i.test(t)){success=true;why='PXE output established SCCM/PXE deployment context.';add('sccm.pxe');}
  if(/\$sccm\$|pxe.*hash|hash.*pxe/i.test(t)){success=true;why='The protected PXE workflow explicitly returned offline hash material.';add('hash.sccm_pxe');}
  if(/networkaccessusername\s*[:=].+/i.test(t)&&/networkaccesspassword\s*[:=].+/i.test(t)){success=true;why='PXE recovery explicitly returned Network Access Account username and password material.';add('credential.reusable');}
  if(/recovered\s+(?:password|key)\s*[:=].+/i.test(t)&&/hashcat|pxethief/.test(c)){success=true;why='Offline cracking explicitly recovered a protected-PXE secret; it remains credential material until separately validated.';add('credential.candidate');}
 }else if(cardId==='timeroast61'){
  if(/\$sntp-ms\$|sntp-ms|timeroast.*hash/i.test(t)){success=true;why='TimeRoast output explicitly returned offline SNTP-MS hash material.';add('hash.timeroast');}
  if(/hashcat/.test(c)&&/(recovered|cracked)/i.test(t)&&!/0\s+recovered/i.test(t)){success=true;why='Offline cracking explicitly recovered candidate machine-account secret material; access remains unproven.';add('credential.candidate');}
 }else if(cardId==='trust-child-parent61'){
  if(/domain sid/i.test(t)&&/(child|parent|s-1-5-21)/i.test(t)){success=true;why='Output established child/parent trust SID context.';add('trust.child_parent');}
  if(/(?:trust|krbtgt).*?(?:nthash|aes256|hash|key)\s*[:=]/i.test(t)||/\$.*\$.*:[0-9a-f]{32}/i.test(t)){success=true;why='The child-to-parent workflow explicitly returned trust or krbtgt secret material.';add('trust.secret_material');}
  if(/saving ticket|\.ccache\b|\.kirbi\b/i.test(t)){success=true;why='The trust workflow explicitly produced Kerberos ticket material.';add('kerberos.tickets');}
  if(/type help for list of commands|authenticated.*(?:parent|root)|service.*access.*success/i.test(t)){success=true;why='A separate parent-domain service interaction explicitly proved cross-domain access.';add('access.cross_domain');}
 }else if(cardId==='trust-external61'){
  if(/forest_transitive|treat_as_external|trustdirection|trusttype|trustedby|external trust/i.test(t)){success=true;why='Output explicitly established an external or forest trust relationship.';add('trust.external');}
  if(/foreign.*(?:group|member)|memberOf.*(?:foreign|domain)/i.test(t)){success=true;why='Output explicitly identified cross-domain group membership.';add('trust.foreign_membership');}
  if(/(?:trust|krbtgt).*?(?:nthash|aes256|hash|key)\s*[:=]/i.test(t)||/\$.*\$.*:[0-9a-f]{32}/i.test(t)){success=true;why='The external-trust workflow explicitly returned trust secret material.';add('trust.secret_material');}
  if(/saving ticket|\.ccache\b|\.kirbi\b/i.test(t)){success=true;why='The external-trust workflow explicitly produced Kerberos ticket material.';add('kerberos.tickets');}
  if(/type help for list of commands|authenticated.*(?:trusted|forest|domain)|smb.*session.*established/i.test(t)){success=true;why='A separate trusted-domain service interaction explicitly proved cross-domain access.';add('access.cross_domain');}
 }
 return{success,facts,why};}
function commandLine61(line){const s=String(line||''),patterns=[/pxethief\.py/i,/\btftp\b/i,/hashcat\s+-m\s+19850/i,/timeroast\.py/i,/hashcat\s+-m\s+31300/i,/Get-DomainSID/i,/Get-DomainTrust/i,/impacket-secretsdump/i,/impacket-ticketer/i,/impacket-raiseChild/i,/impacket-smbclient/i,/MATCH p=.*MemberOf/i];let best=null;for(const re of patterns){const m=re.exec(s);if(m&&(!best||m.index<best.index))best=m;}return best?s.slice(Math.max(0,best.index-48)).trim():'';}
function segments61(text){const lines=String(text||'').split(/\r?\n/),out=[];let cur=null;const push=()=>{if(!cur)return;cur.output=cur.output.join('\n').trim();out.push(cur);cur=null;};for(const line of lines){const cmd=commandLine61(line);if(cmd&&intent61(cmd)){push();cur={command:cmd,rawPrompt:line,output:[]};continue;}if(cur)cur.output.push(line);}push();return out;}
function proposal61(seg,lanes){const id=intent61(seg&&seg.command),c=id&&cards(lanes)[id];if(!c)return null;const evidence=String(seg&&seg.output||'').trim(),p=proof61(id,seg.command,evidence);return{cardId:id,title:c.title,command:String(seg.command||''),evidence:evidence.slice(0,3000),outputSnippet:evidence.slice(0,1200),result:p.success?'success':'tried',assessment:p.success?'supported':'attempted',confidence:p.success?'high':'medium',reason:p.success?p.why:'Recognized v6.1 command intent; no explicit proof boundary was met.',outcomeFacts:p.success?p.facts:[],fingerprint:'terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(seg.command)+'|'+evidence.slice(0,800)):id),credentialId:'',service:''};}
function repair61(a,lanes){if(!a)return a;const inferred=intent61(a.command),id=inferred||a.cardId;if(!id||!(M.cardIds||[]).includes(id))return a;const c=cards(lanes)[id];if(!c)return a;const p=proof61(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;a.title=c.title;if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...new Set(p.facts||[])];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.confidence='medium';a.reason='Recognized v6.1 Evidence context; explicit proof was not present.';a.outcomeFacts=[];}a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['access.admin','access.system','credential.plaintext','foothold.windows'].includes(x));a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,800)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const clean=normalize(text),r=oldAnalyze(clean,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];const merged=[],seen=new Set();for(const seg of [...(r.segments||[]),...segments61(clean)]){const k=norm(seg&&seg.command);if(!k||seen.has(k))continue;seen.add(k);merged.push(seg);}r.segments=merged;const existing=new Set(r.activities.map(a=>norm(a.command)));for(const seg of merged){const k=norm(seg.command);if(existing.has(k))continue;const p=proposal61(seg,lanes);if(p){r.activities.push(p);existing.add(k);}}r.activities=r.activities.map(a=>repair61(a,lanes));const uniq=new Set();r.activities=r.activities.filter(a=>{const k=a.fingerprint||[a.cardId,norm(a.command),String(a.evidence||'').slice(0,300)].join('|');if(uniq.has(k))return false;uniq.add(k);return true;});r.canonicalGapProfiles61=[...new Set(r.activities.filter(a=>(M.cardIds||[]).includes(a.cardId)).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V61={version:'6.1.0',intent61,proof61,segments61,proposal61,repairActivity61:repair61};
})(typeof window!=='undefined'?window:globalThis);
