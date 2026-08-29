// Obol v7.2 source-delivery overlay — expose the atomized ACL / ACE family in the methodology map.
(function(root){
'use strict';
const M41=root.OBOL_METHODOLOGY_V41,M47=root.OBOL_METHODOLOGY_V47,M72=root.OBOL_METHODOLOGY_V72,lanes=root.OBOL_LANES||[];
if(!M41||!M47||!M72)throw new Error('Obol v4.1/v4.7 methodology map and v7.2 methodology are required before source-delivery-v7.2.js');
function card(id){for(const l of lanes)for(const c of l.cards||[])if(c.id===id)return c;return null;}
function appendMarker(c,needle,marker){if(!c)return;const cmd=(c.commands||[]).find(x=>needle.test(String(x.note||'')));if(cmd&&!String(cmd.run||'').includes(marker))cmd.run=String(cmd.run||'')+' && echo '+marker;}
function ensureReport(c){if(!c)return;const p=M72.profiles&&M72.profiles[c.id];const r=M47.reportContract(c);if(!r)return;c.report47={...r,evidenceProfile:!!p,evidenceFamily:p&&p.family||'',evidenceSource:p?'v7.2':(c.report47&&c.report47.evidenceSource)||'',claims:p?[...(p.claims||[])]:[...((c.report47&&c.report47.claims)||[])]};const old=(M47.contracts||[]).find(x=>x.cardId===c.id);if(old)Object.assign(old,c.report47);else M47.contracts.push({...c.report47});}
const area=(M41.areas||[]).find(x=>x.id==='acl');
if(!area)throw new Error('Missing ACL methodology area');
const allCards=['dcsync','acl-shadow-credential-72','acl-group-membership-72','acl-group-owner-dacl-72','delegation-rbcd-71','acl-user-password-72','acl-targeted-kerberoast-72','acl-user-logonscript-72','acl-ou-inheritance-72','acl-ou-gplink-72','acl-gmsa-read-72','laps-read','acl-gpo-control-72','acl-dnsadmin-72'];
const summary=(area.nodes||[]).find(x=>x.id==='acl-control');
if(summary){summary.coverage='implemented';summary.cardIds=allCards.filter(id=>!!card(id));summary.toolReview={mindmap:['PowerView','BloodHound','Impacket','Certipy','NetExec','native Windows tools'],preferred:['BloodHound','Impacket','Certipy','NetExec','PowerShell'],decision:'supplement',note:'v7.2 atomizes the pinned ACL / ACE source family and maps each useful branch to an explicit owner while preserving separate proof for rights, mutations, credential/ticket material, access, privilege, and cleanup.'};}
const detail=[
 ['dcsync','DCSync replication rights',['dcsync']],
 ['shadow-credentials','Shadow Credentials / msDS-KeyCredentialLink',['acl-shadow-credential-72']],
 ['group-control','Group object control',['acl-group-membership-72','acl-group-owner-dacl-72']],
 ['computer-control','Computer object control / RBCD',['delegation-rbcd-71','acl-shadow-credential-72']],
 ['user-control','User object control',['acl-user-password-72','acl-targeted-kerberoast-72','acl-shadow-credential-72','acl-user-logonscript-72']],
 ['ou-control','OU control and inheritance',['acl-ou-inheritance-72','acl-ou-gplink-72']],
 ['gmsa','ReadGMSAPassword',['acl-gmsa-read-72']],
 ['laps','Read LAPS passwords',['laps-read']],
 ['gpo','GPO control',['acl-gpo-control-72']],
 ['dns-admin','DNS Admin abuse',['acl-dnsadmin-72']]
];
for(const [id,label,ids] of detail){let n=(area.nodes||[]).find(x=>x.id==='acl-'+id);if(!n){n={id:'acl-'+id,label,coverage:'implemented',cardIds:ids.filter(x=>!!card(x)),toolReview:{mindmap:['Orange acl.md'],preferred:['current v7.2 owners'],decision:'supplement',note:'Atomized in v7.2 with explicit Run, Evidence, Next Steps, reporting, and cleanup boundaries.'}};area.nodes.push(n);}else{n.coverage='implemented';n.cardIds=ids.filter(x=>!!card(x));}}
const group=card('acl-group-owner-dacl-72'),ou=card('acl-ou-inheritance-72');
appendMarker(group,/Restore the recorded original owner/i,'OBOL_ACL_OWNER_RESTORED');
appendMarker(group,/Mandatory DACL cleanup/i,'OBOL_GROUP_DACL_RESTORED');
appendMarker(ou,/Mandatory cleanup from the exact pre-test backup/i,'OBOL_OU_DACL_RESTORED');
for(const id of M72.cardIds||[])ensureReport(card(id));
root.OBOL_SOURCE_DELIVERY_V72={version:'7.2.0',areaId:'acl',detailNodeIds:detail.map(x=>'acl-'+x[0]),cardIds:allCards.filter(id=>!!card(id)),statement:'v7.2 exposes the atomized ACL / ACE family in the methodology map, repairs report contracts after canonical provenance is attached, and preserves explicit cleanup evidence for reversible control mutations.'};
})(typeof window!=='undefined'?window:globalThis);