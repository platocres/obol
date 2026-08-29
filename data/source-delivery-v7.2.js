// Obol v7.2 source-delivery overlay — expose the atomized ACL / ACE family in the methodology map.
(function(root){
'use strict';
const M41=root.OBOL_METHODOLOGY_V41,M72=root.OBOL_METHODOLOGY_V72,lanes=root.OBOL_LANES||[];
if(!M41||!M72)throw new Error('Obol v4.1 methodology map and v7.2 methodology are required before source-delivery-v7.2.js');
function card(id){for(const l of lanes)for(const c of l.cards||[])if(c.id===id)return c;return null;}
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
const group=card('acl-group-owner-dacl-72');if(group){const restore=(group.commands||[]).find(x=>/Restore the recorded original owner/i.test(String(x.note||'')));if(restore&&!/OBOL_ACL_OWNER_RESTORED/.test(String(restore.run||'')))restore.run=String(restore.run||'')+' && echo OBOL_ACL_OWNER_RESTORED';}
root.OBOL_SOURCE_DELIVERY_V72={version:'7.2.0',areaId:'acl',detailNodeIds:detail.map(x=>'acl-'+x[0]),cardIds:allCards.filter(id=>!!card(id)),statement:'v7.2 exposes the atomized ACL / ACE family in the methodology map and preserves explicit cleanup evidence for reversible control mutations.'};
})(typeof window!=='undefined'?window:globalThis);