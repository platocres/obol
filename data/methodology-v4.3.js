// Obol v4.3 methodology overlay — reconcile canonical Orange coverage with existing Obol cards and audit AD cracking modes.
(function(root){
'use strict';
const lanes=root.OBOL_LANES||[],O=root.OBOL_ORANGE_AD_2025_03,M41=root.OBOL_METHODOLOGY_V41;
if(!O)throw new Error('Obol canonical Orange AD snapshot is required before methodology-v4.3.js');
function card(id){for(const l of lanes)for(const c of l.cards||[])if(c.id===id)return c;return null;}
function addUnique(arr,v){if(!arr.includes(v))arr.push(v);}
function addCommand(c,cmd){if(!c)return;c.commands=c.commands||[];if(!c.commands.some(x=>String(x.run||'')===String(cmd.run||'')))c.commands.push(cmd);}
function setSurface(c,fn){if(!c)return;for(const cmd of c.commands||[]){const s=fn(cmd);if(!s)continue;cmd.operatorSurface40=s;cmd.operatorSurface41Source=cmd.operatorSurface41Source||'audited-v4.3';cmd.operatorSurface43Source='audited-v4.3';}}
const HASH_MODES=[
 {format:'LM',mode:3000,stock:true,canonical:'crack_hash.lm'},
 {format:'NTLM',mode:1000,stock:true,canonical:'crack_hash.nt'},
 {format:'NetNTLMv1 / NetNTLMv1+ESS',mode:5500,stock:true,canonical:'crack_hash.ntlmv1'},
 {format:'NetNTLMv2',mode:5600,stock:true,canonical:'crack_hash.ntlmv2'},
 {format:'Kerberos TGS etype 23 / RC4',mode:13100,stock:true,canonical:'crack_hash.tgs-rc4'},
 {format:'Kerberos TGS etype 17 / AES128',mode:19600,stock:true,canonical:'crack_hash.tgs-aes'},
 {format:'Kerberos TGS etype 18 / AES256',mode:19700,stock:true,canonical:''},
 {format:'Kerberos AS-REP etype 23',mode:18200,stock:true,canonical:'crack_hash.asrep'},
 {format:'MSCache2 / DCC2',mode:2100,stock:true,canonical:'crack_hash.mscache2'},
 {format:'TimeRoast / MS SNTP',mode:31300,stock:true,canonical:'crack_hash.timeroast'},
 {format:'SCCM PXE AES128',mode:19850,stock:false,canonical:'crack_hash.pxe',note:'Requires the external SCCM Hashcat module/fork rather than a stock Hashcat install; Obol therefore keeps the canonical PXE cracking section partial.'}
];
const hc=card('hashcat-modes');
if(hc){
 hc.title='Hashcat Active Directory Mode Reference';
 hc.hypothesis='Use the exact hash mode that matches the captured material. v4.3 reconciles the Orange 2025.03 cracking branch against current Hashcat mode contracts, corrects NetNTLMv1 to mode 5500, adds AES TGS, DCC2, and TimeRoast coverage, and keeps SCCM PXE cracking explicitly partial because mode 19850 depends on an external module rather than stock Hashcat.';
 addCommand(hc,{tool:'hashcat',run:'hashcat -m 3000 {{hashfile}} {{wordlist}}',note:'LM. Legacy and weak, but still present in the Orange reference. Mode 3000 is the current Hashcat LM mode.',operatorSurface40:'kali',operatorSurface43Source:'audited-v4.3'});
 addCommand(hc,{tool:'hashcat',run:'hashcat -m 5500 {{hashfile}} {{wordlist}}',note:'NetNTLMv1 / NetNTLMv1+ESS. v4.3 intentionally uses mode 5500 rather than the older incorrect 1000 mapping sometimes copied into notes.',operatorSurface40:'kali',operatorSurface43Source:'audited-v4.3'});
 addCommand(hc,{tool:'hashcat',run:'hashcat -m 13100 {{hashfile}} {{wordlist}}',note:'Kerberos TGS etype 23 / RC4, the usual Kerberoast format.',operatorSurface40:'kali',operatorSurface43Source:'audited-v4.3'});
 addCommand(hc,{tool:'hashcat',run:'hashcat -m 19600 {{hashfile}} {{wordlist}}',note:'Kerberos TGS etype 17 / AES128. AES256 TGS uses mode 19700.',operatorSurface40:'kali',operatorSurface43Source:'audited-v4.3'});
 addCommand(hc,{tool:'hashcat',run:'hashcat -m 2100 {{hashfile}} {{wordlist}}',note:'MSCache2 / DCC2. This format is deliberately separated from raw NTLM.',operatorSurface40:'kali',operatorSurface43Source:'audited-v4.3'});
 addCommand(hc,{tool:'hashcat',run:'hashcat -m 31300 {{hashfile}} {{wordlist}}',note:'TimeRoast / MS SNTP material.',operatorSurface40:'kali',operatorSurface43Source:'audited-v4.3'});
 addCommand(hc,{tool:'hashcat',run:'hashcat -m 19850 {{hashfile}} {{wordlist}}',note:'SCCM PXE AES128 only when the dedicated SCCM Hashcat module/fork is installed. This is not treated as a stock-Kali/stock-Hashcat path.',operatorSurface40:'kali',operatorSurface43Source:'audited-v4.3'});
 hc.refs=hc.refs||[];addUnique(hc.refs,'https://hashcat.net/wiki/doku.php?id=example_hashes');addUnique(hc.refs,'https://github.com/MWR-CyberSec/configmgr-cryptderivekey-hashcat-module');
 setSurface(hc,()=> 'kali');
}
setSurface(card('ad-dc-identify'),cmd=>/\bnxc\b|\bnmap\b/i.test(String(cmd.tool||'')+' '+String(cmd.run||''))?'kali':/\bnslookup\b/i.test(String(cmd.run||''))?'neutral':'');
setSurface(card('sccm-enum'),cmd=>/sccmhunter/i.test(String(cmd.tool||'')+' '+String(cmd.run||''))?'kali':/sharpsccm/i.test(String(cmd.tool||'')+' '+String(cmd.run||''))?'windows':'');
setSurface(card('trust-enum'),cmd=>/nltest|Get-DomainTrust/i.test(String(cmd.run||''))?'windows':/lookupsid/i.test(String(cmd.tool||'')+' '+String(cmd.run||''))?'kali':'');
setSurface(card('mssql-access'),cmd=>/impacket|\bnxc\b/i.test(String(cmd.tool||'')+' '+String(cmd.run||''))?'kali':'');
setSurface(card('gpp-passwords'),cmd=>/smbclient|gpp-decrypt/i.test(String(cmd.tool||'')+' '+String(cmd.run||''))?'kali':'');
setSurface(card('golden-ticket'),cmd=>/ticketer/i.test(String(cmd.tool||'')+' '+String(cmd.run||''))?'kali':'');
setSurface(card('zerologon-check'),()=> 'kali');
setSurface(card('ad-acl-abuse'),cmd=>/powershell|\bcmd\b|net group/i.test(String(cmd.tool||'')+' '+String(cmd.run||''))?'windows':'');
setSurface(card('bloodyad-acl'),cmd=>/bloodyad|impacket/i.test(String(cmd.tool||'')+' '+String(cmd.run||''))?'kali':'');
function section(file,id){const f=(O.files||[]).find(x=>x.file===file);return f&&(f.sections||[]).find(x=>x.id===id);}
const ADVANCED=[];
function advance(file,id,status,cardIds,note){const s=section(file,id);if(!s)throw new Error('Missing canonical section '+file+':'+id);s.status=status;s.cardIds=cardIds||[];s.note=note||s.note||'';s.advancedIn='4.3';ADVANCED.push(s.key);}
// Repair the single v4.2 stale mapping with the actual multi-card RBCD implementation already present in Obol.
advance('delegation.md','rbcd','implemented',['delegation-abuse','getst-impersonation','ad-machine-account-quota-v25'],'v4.3 reconciles the canonical RBCD section to the existing readiness, delegation, and S4U payoff cards; the nonexistent legacy rbcd card ID is removed.');
// Reconcile existing mature methodology that v4.2 under-counted.
advance('no_creds.md','find-dc','implemented',['ad-dc-identify'],'Existing DC/domain identification workflow is a direct canonical implementation.');
advance('authenticated.md','sccm-enum','implemented',['sccm-enum'],'Existing SCCM discovery card covers the authenticated reconnaissance branch with preferred tooling.');
advance('authenticated.md','known-vulns','partial',['gpp-passwords','zerologon-check'],'Obol has concrete GPP and safe Zerologon detection coverage, but the historical-vulnerability container remains broader than those implementations.');
advance('know_vuln_auth.md','gpp','implemented',['gpp-passwords'],'The existing SYSVOL/GPP credential workflow materially implements the MS14-025 branch without copying Orange tool choices verbatim.');
advance('lat_move.md','mssql','implemented',['mssql-access'],'The database lane already covers Windows-auth MSSQL access, xp_cmdshell, impersonation checks, coercion, and linked servers.');
advance('low_hanging.md','zerologon','partial',['zerologon-check'],'Obol intentionally keeps Zerologon detection-only; destructive machine-password reset behavior is not presented as a fully implemented workflow.');
advance('low_hanging.md','database','implemented',['mssql-access','mysql-enum','postgres-enum'],'Obol database workflows exceed the generic quick-win source branch while remaining human-run.');
advance('persistence.md','add-da','partial',['ad-acl-abuse'],'Group-control mechanics exist, but Obol does not treat a generic group-add card as a dedicated domain-persistence workflow.');
advance('persistence.md','golden-ticket','implemented',['golden-ticket'],'Existing post-domain-admin Golden Ticket card provides a complete human-run implementation.');
advance('persistence.md','acl-persistence','partial',['ad-acl-abuse','bloodyad-acl'],'Directory ACL manipulation is implemented, but persistence-specific lifecycle and cleanup semantics remain incomplete.');
advance('sccm.md','recon','implemented',['sccm-enum'],'Existing SCCM reconnaissance card implements site discovery and share-oriented follow-up.');
advance('trusts.md','enumeration','implemented',['trust-enum'],'Existing trust card covers native Windows, PowerView, and Impacket enumeration paths.');
advance('trusts.md','mssql-links','implemented',['mssql-access'],'Existing MSSQL workflow covers linked-server discovery and use_link/EXEC AT style movement.');
// Expand the canonical cracking branch using the audited Hashcat reference.
advance('crack_hash.md','lm','implemented',['hashcat-modes'],'Hashcat mode 3000 is explicitly available in the audited cracking reference.');
advance('crack_hash.md','nt','implemented',['hashcat-modes'],'Hashcat mode 1000 is explicitly available in the audited cracking reference.');
advance('crack_hash.md','ntlmv1','implemented',['hashcat-modes'],'v4.3 corrects NetNTLMv1 to Hashcat mode 5500 and makes the format explicit.');
advance('crack_hash.md','ntlmv2','implemented',['hashcat-modes'],'Hashcat mode 5600 is explicit and already wired to normal cracking controls.');
advance('crack_hash.md','tgs-aes','implemented',['hashcat-modes'],'Kerberos TGS AES128 mode 19600 is explicit; AES256 mode 19700 is included as a useful supplement.');
advance('crack_hash.md','mscache2','implemented',['hashcat-modes'],'MSCache2 / DCC2 mode 2100 is explicit.');
advance('crack_hash.md','timeroast','implemented',['hashcat-modes'],'TimeRoast / MS SNTP mode 31300 is explicit.');
advance('crack_hash.md','pxe','partial',['hashcat-modes'],'Mode 19850 is documented, but it depends on a dedicated external SCCM Hashcat module/fork rather than stock Hashcat, so the canonical section is not overclaimed as complete.');
O.coverageRevision='4.3';O.coverageOverlay='data/methodology-v4.3.js';
// Keep the retained v4.1 tool-choice audit internally consistent with current card IDs.
if(M41){
 const delegation=(M41.areas||[]).find(a=>a.id==='delegation');if(delegation){const n=(delegation.nodes||[]).find(x=>x.id==='delegation-abuse');if(n){n.cardIds=['delegation-abuse','getst-impersonation','ad-machine-account-quota-v25'];n.coverage='partial';}}
 const sccm=(M41.areas||[]).find(a=>a.id==='sccm');if(sccm){const n=(sccm.nodes||[]).find(x=>x.id==='sccm-attacks');if(n){n.cardIds=['sccm-enum'];n.coverage='partial';n.toolReview=n.toolReview||{};n.toolReview.preferred=['sccmhunter','SharpSCCM'];n.toolReview.decision='supplement';n.toolReview.note='v4.3 reconciles the existing SCCM reconnaissance card while keeping the broader SCCM abuse container partial.';}}
}
// Attach canonical provenance to live cards for UI and future audits.
for(const f of O.files||[])for(const s of f.sections||[])for(const id of s.cardIds||[]){const c=card(id);if(!c)continue;c.orange43=c.orange43||[];if(!c.orange43.some(x=>x.key===s.key))c.orange43.push({key:s.key,file:f.file,label:s.label,status:s.status,advancedIn:s.advancedIn||''});}
root.OBOL_METHODOLOGY_V43={version:'4.3.0',hashModes:HASH_MODES,reconciledKeys:ADVANCED.slice(),baseline42:{implemented:25,partial:39,gap:62,stale:1,coveragePct:20,representedPct:50},coverageRevision:'4.3'};
})(typeof window!=='undefined'?window:globalThis);
