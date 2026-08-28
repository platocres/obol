// Obol v4.2 canonical Orange Cyberdefense AD 2025.03 snapshot.
// This is a normalized structural inventory, not a verbatim copy of upstream commands.
// Pinned upstream commit: 6d16ca0d1434875e0617f2f3cfa825fad0bc7d7e
(function(root){
'use strict';
const COMMIT='6d16ca0d1434875e0617f2f3cfa825fad0bc7d7e';
const TREE='51b414fc0c0a1a4414e86986ec5e2b5225a6d698';
const NORTH_STAR='https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg';
const BASE='https://github.com/Orange-Cyberdefense/ocd-mindmaps/blob/'+COMMIT+'/excalimap/mindmap/ad/';
const S=(id,label,status,cardIds,note)=>({id,label,status,cardIds:cardIds||[],note:note||''});
const FILES=[
 {file:'acl.md',sha:'d7fe01966e053ec5c275379ff89ca9b332d2eb6b',title:'ACLs / ACEs permissions',sections:[
  S('dcsync','DCSync','implemented',['dcsync']),S('shadow-credentials','Shadow credentials / msDS-KeyCredentialLink','partial',['ad-acl-abuse','adcs-esc']),S('group-control','Group object control','partial',['ad-acl-abuse']),S('computer-control','Computer object control / RBCD','partial',['ad-acl-abuse','rbcd']),S('user-control','User object control','partial',['ad-acl-abuse','kerberoast']),S('ou-control','OU control and inheritance','partial',['ad-acl-abuse']),S('gmsa','ReadGMSAPassword','partial',['ad-acl-abuse']),S('laps','Read LAPS passwords','implemented',['laps-read']),S('gpo','GPO control','partial',['ad-acl-abuse']),S('dns-admin','DNS Admin abuse','gap',[])
 ]},
 {file:'adcs.md',sha:'15546463dc97a0b17be5d10267686ebdfe347b8f',title:'AD CS',sections:[
  S('enumeration','AD CS enumeration','partial',['adcs-esc']),S('web-enrollment','Web enrollment / ESC8','partial',['adcs-esc','ntlm-relay']),S('template-misconfig','Misconfigured certificate templates','partial',['adcs-esc']),S('acl-misconfig','AD CS ACL misconfiguration','partial',['adcs-esc','ad-acl-abuse']),S('pki-object-acl','Vulnerable PKI object access control','partial',['adcs-esc']),S('ca-misconfig','Misconfigured certificate authority','partial',['adcs-esc']),S('certificate-mapping','Certificate mapping abuse','partial',['adcs-esc'])
 ]},
 {file:'admin.md',sha:'4ea6eb02a51b235ec2d21ecb975d8fc6677cc4f7',title:'Admin access',sections:[
  S('lsass','LSASS credential extraction','partial',['dump-secrets']),S('sam','SAM credential extraction','implemented',['dump-secrets']),S('lsa','LSA secret extraction','implemented',['dump-secrets']),S('dpapi','DPAPI credential recovery','implemented',['dpapi-secrets']),S('impersonation','Token / session impersonation','partial',['seimpersonate']),S('misc','Additional admin credential sources','partial',['stored-credentials','dump-secrets'])
 ]},
 {file:'authenticated.md',sha:'4d1c37ce9dc99689fb6fdd7318dae09f21c7f188',title:'Authenticated mapping',sections:[
  S('classic-enum','Classic authenticated enumeration','implemented',['bloodhound-collect','powerview-enum','ad-psdotnet-enum']),S('adcs-enum','Enumerate AD CS','partial',['adcs-esc']),S('sccm-enum','Enumerate SCCM','gap',[]),S('auto-scan','Automated AD posture scans','partial',['bloodhound-collect']),S('kerberoast','Kerberoasting','implemented',['kerberoast']),S('coerce','Authenticated coercion','partial',['ntlm-relay']),S('entra-connect','Entra ID / AD Connect discovery','gap',[]),S('computer-connect','Connect to a computer / lateral move','implemented',['lateral-exec']),S('known-vulns','Authenticated known-vulnerability path','gap',[])
 ]},
 {file:'crack_hash.md',sha:'22482ad7cf46a56e49ae0a5bd38ba3e4021d2448',title:'Hash cracking',sections:[
  S('lm','LM cracking','gap',[]),S('nt','NT hash cracking','partial',[]),S('ntlmv1','NetNTLMv1 cracking','gap',[]),S('ntlmv2','NetNTLMv2 cracking','partial',[]),S('tgs-rc4','Kerberos TGS RC4 cracking','implemented',['kerberoast']),S('tgs-aes','Kerberos TGS AES cracking','partial',['kerberoast']),S('asrep','Kerberos AS-REP cracking','implemented',['asrep-roast']),S('mscache2','MSCache2 cracking','gap',[]),S('timeroast','TimeRoast hash cracking','gap',[]),S('pxe','PXE / SCCM hash cracking','gap',[])
 ]},
 {file:'delegation.md',sha:'8d2eab7218acd0a341983051397dd6eeedd9960d',title:'Kerberos delegation',sections:[
  S('find','Delegation discovery','partial',['delegation-abuse','bloodhound-collect']),S('unconstrained','Unconstrained delegation','partial',['delegation-abuse']),S('constrained','Constrained delegation','partial',['delegation-abuse']),S('rbcd','Resource-based constrained delegation','implemented',['rbcd','delegation-abuse']),S('s4u2self','S4U2Self abuse','partial',['delegation-abuse'])
 ]},
 {file:'dom_admin.md',sha:'4c234b0199ccba1457f1f203a67dc3345d7d851b',title:'Domain admin',sections:[
  S('ntds','NTDS / domain credential dump','implemented',['dcsync','dump-secrets']),S('backup-keys','Domain backup-key collection','partial',['dpapi-secrets'])
 ]},
 {file:'know_vuln_auth.md',sha:'fb25cc7766f1d1f169b258c0800063946071b364',title:'Authenticated known vulnerabilities',sections:[
  S('ms14-068','MS14-068','gap',[]),S('gpp','GPP MS14-025','gap',[]),S('privexchange','PrivExchange','gap',[]),S('nopac','noPac','gap',[]),S('printnightmare','PrintNightmare','gap',[]),S('certifried','Certifried','gap',[]),S('proxynotshell','ProxyNotShell','gap',[])
 ]},
 {file:'lat_move.md',sha:'06e2cd8fd7fb51fb1540019ab1dd8f337bf7ba18',title:'Lateral movement',sections:[
  S('plaintext','Cleartext-password remote execution','implemented',['lateral-exec']),S('nt-hash','Pass-the-Hash / Overpass-the-Hash','implemented',['lateral-exec','ticket-reuse']),S('kerberos','Kerberos ticket movement','implemented',['ticket-reuse','kerberos-tickets']),S('socks','SOCKS / relayed movement','partial',['pivot-ligolo']),S('certificate','Certificate-based movement','partial',['adcs-esc']),S('mssql','MSSQL movement','partial',[])
 ]},
 {file:'low_access.md',sha:'8744d9b137338bb1fa99d26bc257aa50ef490e5e',title:'Windows low access / privilege escalation',sections:[
  S('applocker','AppLocker bypass','gap',[]),S('uac','UAC bypass','gap',[]),S('auto-enum','Automated local enumeration','implemented',['windows-enum']),S('search-files','Credential/file hunting','implemented',['stored-credentials']),S('local-exploit','Windows local exploit path','partial',['windows-enum']),S('webdav','WebDAV coercion','partial',['ntlm-relay']),S('kerberos-relay','Kerberos relay','gap',[]),S('seimpersonate','Service-account impersonation','implemented',['seimpersonate'])
 ]},
 {file:'low_hanging.md',sha:'e64f008bcc5a053843e17090ab2ef68586dedff2',title:'Quick compromise / low-hanging fruit',sections:[
  S('zerologon','Zerologon','gap',[]),S('eternalblue','EternalBlue','gap',[]),S('tomcat-jboss','Tomcat / JBoss manager','gap',[]),S('java-rmi','Java RMI','gap',[]),S('java-deser','Java deserialization service','gap',[]),S('log4shell','Log4Shell','gap',[]),S('database','Database quick-win path','gap',[]),S('exchange','Exchange quick-win path','gap',[]),S('veeam','Veeam quick-win path','gap',[]),S('glpi','GLPI quick-win path','gap',[]),S('weak-services','Weak websites / services scan','partial',['website-discovery'])
 ]},
 {file:'mitm.md',sha:'4a99c3fbdb2948679b7ed9b5a33640d88a665752',title:'Man in the middle / relay',sections:[
  S('listen','Credential/hash listening','partial',['ntlm-relay']),S('ntlm-relay','NTLM relay','partial',['ntlm-relay']),S('kerberos-relay','Kerberos relay','gap',[])
 ]},
 {file:'no_creds.md',sha:'8bef22619bdfd2c9beeb19a8f82229ca4a91d100',title:'No credentials',sections:[
  S('scan','Network discovery and service scan','implemented',['nmap-builder']),S('find-dc','Find domain controller','partial',[]),S('zone-transfer','DNS zone transfer','implemented',['dns-enum']),S('anon-smb','Anonymous / guest SMB','implemented',['smb-anon-enum']),S('ldap','Anonymous LDAP enumeration','implemented',['ad-anon-ldap-enum']),S('users','Username enumeration','implemented',['ad-user-enum']),S('user-bruteforce','Kerberos username validation','implemented',['ad-user-enum']),S('poisoning','Poisoning','partial',['ntlm-relay']),S('coerce','Unauthenticated coercion','partial',['ntlm-relay']),S('pxe','PXE / NAA credential path','gap',[]),S('timeroast','TimeRoasting','gap',[])
 ]},
 {file:'persistence.md',sha:'a652fea306b91f887bb7b0deec751d9f6d711d5d',title:'Domain persistence',sections:[
  S('add-da','Add Domain Admin member','gap',[]),S('golden-ticket','Golden ticket','gap',[]),S('silver-ticket','Silver ticket','gap',[]),S('dsrm','DSRM persistence','gap',[]),S('skeleton-key','Skeleton Key','gap',[]),S('custom-ssp','Custom SSP','gap',[]),S('golden-cert','Golden certificate','gap',[]),S('diamond-ticket','Diamond ticket','gap',[]),S('sapphire-ticket','Sapphire ticket','gap',[]),S('dc-shadow','DCShadow','gap',[]),S('acl-persistence','ACL-based persistence','gap',[])
 ]},
 {file:'sccm.md',sha:'6f4b6676bc38c7b6a914347bb3ca7cbee797035d',title:'SCCM',sections:[
  S('recon','SCCM reconnaissance','gap',[]),S('creds1','PXE / NAA credential recovery','gap',[]),S('elevate1','Relay on site systems','gap',[]),S('elevate2','Forced client push','gap',[]),S('elevate3','Automatic client push','gap',[]),S('creds6','Distribution-point credential looting','gap',[]),S('takeover1','Relay to SCCM MSSQL database','gap',[]),S('takeover2','Relay to MSSQL server','gap',[]),S('creds2','Policy request credentials','gap',[]),S('creds34','Computer-admin NAA credential recovery','gap',[]),S('creds5','SCCM admin site-database credentials','gap',[]),S('exec','SCCM admin execution','gap',[]),S('cleanup','SCCM cleanup','gap',[]),S('post','SCCM post-exploitation mapping','gap',[])
 ]},
 {file:'trusts.md',sha:'80e2e404911f4dac7011ca8d40695c1b35241a37',title:'Trusts',sections:[
  S('enumeration','Trust enumeration','gap',[]),S('child-parent','Child-to-parent trust paths','gap',[]),S('parent-child','Parent-to-child trust paths','gap',[]),S('external','External / forest trust paths','gap',[]),S('mssql-links','MSSQL linked-server trust paths','gap',[])
 ]},
 {file:'valid_user.md',sha:'fa9ba8715ec616b468f92c47b80dee498b2fae24',title:'Valid user / no password',sections:[
  S('spray','Password policy and password spraying','implemented',['password-spray']),S('asrep','AS-REP roast / blind Kerberoast branch','implemented',['asrep-roast','kerberoast'])
 ]}
];
const SUPPORT=[
 {file:'authors.md',sha:'5f84abd56f014c3fbaf8a29c74f81b8c147c2fdf',role:'attribution'},
 {file:'conf.yml',sha:'0235c69107121b7d810c44236cd83434f0b18abe',role:'mindmap layout/configuration'}
];
for(const f of FILES){f.sourceUrl=BASE+f.file;for(const s of f.sections)s.key=f.file.replace(/\.md$/,'')+'.'+s.id;}
root.OBOL_ORANGE_AD_2025_03={version:'2025.03',snapshotFormat:'v4.2',upstream:{repository:'Orange-Cyberdefense/ocd-mindmaps',commit:COMMIT,adTree:TREE,northStar:NORTH_STAR,sourceBase:BASE},files:FILES,supportFiles:SUPPORT};
})(typeof window!=='undefined'?window:globalThis);
