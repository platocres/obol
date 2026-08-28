// Obol v4.1 methodology overlay — Orange 2025 AD mindmap coverage ledger, explicit execution metadata audit, and tool review.
(function(root){
'use strict';
const lanes=root.OBOL_LANES||[];
const MINDMAP_URL='https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg';
const SOURCE_BASE='https://github.com/Orange-Cyberdefense/ocd-mindmaps/blob/main/excalimap/mindmap/ad/';
const SURFACE_BY_TOOL={
  nxc:'kali',netexec:'kali','bloodhound-python':'kali',certipy:'kali','evil-winrm':'kali',xfreerdp:'kali',ldapsearch:'kali',kerbrute:'kali',hashcat:'kali',john:'kali',hydra:'kali',responder:'kali',ffuf:'kali',feroxbuster:'kali',gobuster:'kali',sqlmap:'kali',smbclient:'kali',smbmap:'kali',enum4linux:'kali','enum4linux-ng':'kali',rpcclient:'kali','impacket-getnpusers':'kali','impacket-getuserspns':'kali','impacket-gettgt':'kali','impacket-getst':'kali','impacket-secretsdump':'kali','impacket-psexec':'kali','impacket-wmiexec':'kali','impacket-smbexec':'kali','impacket-atexec':'kali','impacket-lookupsid':'kali',
  rubeus:'windows',mimikatz:'windows',sharphound:'windows',powerview:'windows',powershell:'windows',cmd:'windows',wmic:'windows',reg:'windows',sc:'windows',msiexec:'windows',accesschk:'windows',psexec:'windows',godpotato:'windows',winpeas:'windows',winpeasx64:'windows',winpeasx86:'windows',setspn:'windows',nltest:'windows'
};
const VARIANT_SURFACE={kali:'kali',remote:'kali',nxc:'kali',impacket:'kali',winrm:'kali',wmi:'kali',win:'windows',windows:'windows',exe:'windows'};
function normTool41(v){return String(v||'').trim().toLowerCase().replace(/\.exe$/,'');}
function auditedSurface41(cmd,card){
  if(!cmd)return'';const t=normTool41(cmd.tool),v=String(cmd.v||'').toLowerCase();
  if(SURFACE_BY_TOOL[t])return SURFACE_BY_TOOL[t];if(VARIANT_SURFACE[v])return VARIANT_SURFACE[v];
  const run=String(cmd.run||'');
  if(/\b(?:rubeus|mimikatz|sharphound)(?:\.exe)?\b|\b(?:get-net|get-domain|enter-pssession|setspn|nltest)\b|[A-Za-z]:\\/i.test(run))return'windows';
  if(/\b(?:impacket-[\w-]+|nxc|netexec|certipy|bloodhound-python|evil-winrm|xfreerdp)\b/i.test(run))return'kali';
  if(t==='sh'&&card&&/linux/i.test(String(card.lane||'')))return'target';
  return'';
}
const AREAS=[
 {id:'no-creds',label:'No credentials',sourceFile:'no_creds.md',priority:100,nodes:[
  {id:'network-scan',label:'Network discovery and service scan',coverage:'implemented',cardIds:['nmap-builder'],toolReview:{mindmap:['nmap','nxc'],preferred:['nmap','nxc'],decision:'keep',note:'Obol keeps Nmap single-owner under Targets and uses NetExec as a complementary Windows-network profiler.'}},
  {id:'find-dc',label:'Find domain controller',coverage:'partial',cardIds:['ad-dc-identify'],toolReview:{mindmap:['nmcli','nslookup','nmap'],preferred:['nmap','nslookup'],decision:'supplement',note:'Keep discovery commands simple and avoid making host-side interface inspection the only path.'}},
  {id:'zone-transfer',label:'DNS zone transfer',coverage:'implemented',cardIds:['dns-enum'],toolReview:{mindmap:['dig'],preferred:['dig','dnsrecon'],decision:'supplement',note:'dnsrecon remains a useful structured fallback around the canonical dig workflow.'}},
  {id:'anonymous-smb',label:'Anonymous / guest SMB',coverage:'implemented',cardIds:['smb-anon-enum'],toolReview:{mindmap:['nxc','enum4linux-ng','smbclient'],preferred:['nxc','enum4linux-ng','smbclient'],decision:'keep',note:'NetExec remains the preferred consolidated option while specialized fallbacks stay visible.'}},
  {id:'anonymous-ldap',label:'Anonymous LDAP and user enumeration',coverage:'implemented',cardIds:['ad-anon-ldap-enum','ad-user-enum'],toolReview:{mindmap:['ldapsearch','nxc','kerbrute'],preferred:['nxc','ldapsearch','kerbrute'],decision:'keep',note:'The v3 command contract already keeps enumeration selectors explicit.'}},
  {id:'poison-coerce',label:'Poisoning, coercion, and relay setup',coverage:'partial',cardIds:['ntlm-relay'],toolReview:{mindmap:['responder','mitm6','bettercap','PetitPotam'],preferred:['Responder','NetExec','ntlmrelayx'],decision:'supplement',note:'Track IPv6/coercion depth separately rather than treating one relay card as complete coverage.'}},
  {id:'pxe-naa',label:'PXE / NAA credential paths',coverage:'gap',cardIds:[],toolReview:{mindmap:['pxethief','tftp'],preferred:[],decision:'review',note:'Tracked as an explicit mindmap gap; no Obol workflow is claimed yet.'}},
  {id:'timeroast',label:'TimeRoasting',coverage:'gap',cardIds:[],toolReview:{mindmap:['timeroast.py'],preferred:[],decision:'review',note:'New 2025 mindmap branch intentionally remains visible as backlog.'}}
 ]},
 {id:'valid-user',label:'Valid user / no password',sourceFile:'valid_user.md',priority:95,nodes:[
  {id:'password-spray',label:'Password policy and spraying',coverage:'implemented',cardIds:['password-spray'],toolReview:{mindmap:['nxc','SprayHound','kerbrute'],preferred:['nxc','kerbrute'],decision:'supplement',note:'Obol prefers broadly available tools and keeps lockout-policy evidence ahead of spraying.'}},
  {id:'asrep',label:'AS-REP roasting',coverage:'implemented',cardIds:['asrep-roast'],toolReview:{mindmap:['GetNPUsers','nxc','Rubeus'],preferred:['nxc','impacket-GetNPUsers','Rubeus'],decision:'keep',note:'Kali and Windows implementations are both first-class.'}},
  {id:'blind-kerberoast',label:'Blind Kerberoasting',coverage:'partial',cardIds:['kerberoast'],toolReview:{mindmap:['Rubeus','GetUserSPNs'],preferred:['impacket-GetUserSPNs','Rubeus'],decision:'keep',note:'Core Kerberoasting is implemented; blind/no-preauth variants remain audit debt.'}}
 ]},
 {id:'authenticated',label:'Authenticated mapping',sourceFile:'authenticated.md',priority:90,nodes:[
  {id:'bloodhound',label:'Graph collection and attack-path mapping',coverage:'implemented',cardIds:['bloodhound-collect','powerview-enum','ad-psdotnet-enum'],toolReview:{mindmap:['BloodHound','SharpHound'],preferred:['nxc','bloodhound-python','SharpHound','PowerView'],decision:'supplement',note:'Obol keeps both remote Kali collection and Windows-side/manual alternatives.'}},
  {id:'laps',label:'LAPS discovery/read',coverage:'implemented',cardIds:['laps-read'],toolReview:{mindmap:['nxc','ldapsearch'],preferred:['nxc'],decision:'keep',note:'NetExec remains the most compact lab workflow when applicable.'}}
 ]},
 {id:'mitm',label:'Man in the middle / relay',sourceFile:'mitm.md',priority:85,nodes:[
  {id:'relay',label:'Listen, coerce, relay',coverage:'partial',cardIds:['ntlm-relay'],toolReview:{mindmap:['Responder','mitm6','ntlmrelayx'],preferred:['Responder','NetExec','ntlmrelayx'],decision:'supplement',note:'Coverage exists, but the Orange branch is broader than the current single methodology owner.'}}
 ]},
 {id:'acl',label:'ACL / ACE abuse',sourceFile:'acl.md',priority:90,nodes:[
  {id:'acl-control',label:'Object-control paths',coverage:'partial',cardIds:['ad-acl-abuse','writedacl-dcsync'],toolReview:{mindmap:['PowerView','BloodHound','dacledit'],preferred:['BloodHound','PowerView','Impacket'],decision:'supplement',note:'Existing cards cover common control paths; the source branch remains broader than current card granularity.'}}
 ]},
 {id:'delegation',label:'Kerberos delegation',sourceFile:'delegation.md',priority:90,nodes:[
  {id:'delegation-abuse',label:'Unconstrained / constrained / RBCD / S4U',coverage:'partial',cardIds:['delegation-abuse','rbcd'],toolReview:{mindmap:['Rubeus','Impacket'],preferred:['Rubeus','Impacket'],decision:'keep',note:'Rubeus S4U is first-class; individual delegation forms still need finer coverage accounting.'}}
 ]},
 {id:'adcs',label:'AD CS',sourceFile:'adcs.md',priority:95,nodes:[
  {id:'adcs-esc',label:'Certificate Services abuse',coverage:'partial',cardIds:['adcs-esc'],toolReview:{mindmap:['Certipy'],preferred:['Certipy'],decision:'keep',note:'The 2025 source expanded ESC coverage; one broad card must not be counted as every ESC path implemented.'}}
 ]},
 {id:'lateral-move',label:'Lateral movement',sourceFile:'lat_move.md',priority:85,nodes:[
  {id:'remote-exec',label:'Authenticated remote execution',coverage:'implemented',cardIds:['lateral-exec'],toolReview:{mindmap:['psexec','wmiexec','WinRM'],preferred:['nxc','evil-winrm','Impacket','PowerShell'],decision:'supplement',note:'Prefer NetExec for validation, Evil-WinRM for interactive WinRM, and retain Impacket/native fallbacks.'}},
  {id:'ticket-reuse',label:'Kerberos ticket reuse',coverage:'implemented',cardIds:['ticket-reuse','kerberos-tickets'],toolReview:{mindmap:['Rubeus','Impacket'],preferred:['Rubeus','Impacket'],decision:'keep',note:'Both operator sides remain supported.'}}
 ]},
 {id:'admin',label:'Admin access / credential extraction',sourceFile:'admin.md',priority:90,nodes:[
  {id:'credential-dump',label:'SAM / LSA / NTDS / LSASS',coverage:'implemented',cardIds:['dump-secrets'],toolReview:{mindmap:['secretsdump','mimikatz'],preferred:['nxc','impacket-secretsdump','mimikatz'],decision:'supplement',note:'NetExec offers a concise remote path while Impacket and mimikatz remain important fallbacks.'}},
  {id:'dcsync',label:'DCSync',coverage:'implemented',cardIds:['dcsync'],toolReview:{mindmap:['secretsdump','mimikatz'],preferred:['nxc','impacket-secretsdump','mimikatz'],decision:'supplement',note:'Keep both remote Kali and Windows-side implementations.'}}
 ]},
 {id:'sccm',label:'SCCM',sourceFile:'sccm.md',priority:80,nodes:[
  {id:'sccm-attacks',label:'SCCM discovery and abuse',coverage:'gap',cardIds:[],toolReview:{mindmap:['SCCM tooling'],preferred:[],decision:'review',note:'2025 mindmap expansion is tracked explicitly; Obol does not claim coverage yet.'}}
 ]},
 {id:'domain-admin',label:'Domain admin',sourceFile:'dom_admin.md',priority:80,nodes:[
  {id:'domain-compromise',label:'Domain credential/control endgame',coverage:'partial',cardIds:['dcsync','writedacl-dcsync'],toolReview:{mindmap:['secretsdump','mimikatz'],preferred:['nxc','impacket-secretsdump','mimikatz'],decision:'supplement',note:'Common endgame paths exist, but the source container is not treated as fully exhausted.'}}
 ]},
 {id:'persistence',label:'Persistence',sourceFile:'persistence.md',priority:70,nodes:[
  {id:'domain-persistence',label:'Domain persistence techniques',coverage:'gap',cardIds:[],toolReview:{mindmap:['Kerberos / directory persistence tooling'],preferred:[],decision:'review',note:'Explicitly tracked as a coverage gap instead of being implied by post-compromise cards.'}}
 ]}
];
function cardsById41(){const m={};for(const l of lanes)for(const c of l.cards||[])m[c.id]=c;return m;}
const cardMap=cardsById41();
const mappedCards=new Set(AREAS.flatMap(a=>a.nodes.flatMap(n=>n.cardIds||[])));
for(const id of mappedCards){const card=cardMap[id];if(!card)continue;card.mindmap41=card.mindmap41||[];for(const a of AREAS)for(const n of a.nodes||[])if((n.cardIds||[]).includes(id)&&!card.mindmap41.some(x=>x.areaId===a.id&&x.nodeId===n.id))card.mindmap41.push({areaId:a.id,nodeId:n.id,coverage:n.coverage,sourceFile:a.sourceFile});
  for(const cmd of card.commands||[]){if(cmd.operatorSurface40)continue;const s=auditedSurface41(cmd,card);if(!s)continue;cmd.operatorSurface40=s;cmd.operatorSurface41Source='audited-v4.1';}
}
root.OBOL_METHODOLOGY_V41={version:'4.1.0',mindmapUrl:MINDMAP_URL,sourceBase:SOURCE_BASE,areas:AREAS,surfaceByTool:SURFACE_BY_TOOL,auditedSurface:auditedSurface41};
})(typeof window!=='undefined'?window:globalThis);