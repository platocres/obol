// Obol v7.2 Intake overlay — conservative Evidence for ACL / ACE source-depth owners.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,M=root.OBOL_METHODOLOGY_V72;if(!C||!T||!T.analyzeTerminal||!M)return;
const oldAnalyze=T.analyzeTerminal;
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function stage72(command){const c=norm(command);
 if(/certipy\s+shadow\s+auto\b/i.test(command))return'shadow-auto';
 if(/pywhisker/i.test(command)&&/--action\s+["']?list/i.test(command))return'shadow-list';
 if(/Remove-ADGroupMember/i.test(command))return'group-remove';
 if(/Add-ADGroupMember/i.test(command)||(/bloodyAD/i.test(command)&&/add\s+groupMember/i.test(command)))return'group-add';
 if(/impacket-owneredit|owneredit\.py/i.test(command))return'owner-write';
 if(/impacket-dacledit|dacledit\.py/i.test(command)){if(/-action\s+restore/i.test(c))return'dacl-restore';if(/-action\s+backup/i.test(c))return'dacl-backup';if(/-target-dn/i.test(c)&&/-inheritance/i.test(c))return'ou-dacl-write';if(/-action\s+write/i.test(c))return'dacl-write';}
 if(/\bnet\s+user\b/i.test(command)&&/\/domain/i.test(command)||/rpcclient/i.test(command)&&/setuserinfo2/i.test(command))return'user-password';
 if(/targetedKerberoast/i.test(command))return'targeted-kerberoast';
 if(/Set-ADUser/i.test(command)&&/-ScriptPath/i.test(command))return/OBOL_LOGONSCRIPT_RESTORED/i.test(command)?'logonscript-restore':'logonscript-write';
 if(/Remove-GPLink/i.test(command))return'gplink-restore';
 if(/New-GPLink/i.test(command))return'gplink-write';
 if(/OUned\.py/i.test(command))return'gplink-write';
 if(/\bnxc\s+ldap\b/i.test(command)&&/--gmsa\b/i.test(command)||/gMSADumper\.py/i.test(command))return'gmsa-read';
 if(/Get-DomainObjectAcl/i.test(command)&&/Group-Policy-Container/i.test(command))return'gpo-discovery';
 if(/Set-GPRegistryValue/i.test(command))return'gpo-write';
 if(/Remove-GPRegistryValue/i.test(command))return'gpo-restore';
 if(/dnscmd(?:\.exe)?/i.test(command)&&/serverlevelplugindll/i.test(command))return/OBOL_DNS_PLUGIN_RESTORED/i.test(command)?'dns-restore':'dns-config';
 if(/sc(?:\.exe)?\s+\\\\/i.test(command)&&/\b(?:stop|start)\s+dns\b/i.test(command))return'dns-restart';
 return'';
}
function inferredOwner(command){const s=stage72(command);if(s.startsWith('shadow-'))return'acl-shadow-credential-72';if(s.startsWith('group-'))return'acl-group-membership-72';if(s.startsWith('owner-')||s.startsWith('dacl-'))return'acl-group-owner-dacl-72';if(s==='user-password')return'acl-user-password-72';if(s==='targeted-kerberoast')return'acl-targeted-kerberoast-72';if(s.startsWith('logonscript-'))return'acl-user-logonscript-72';if(s==='ou-dacl-write')return'acl-ou-inheritance-72';if(s.startsWith('gplink-'))return'acl-ou-gplink-72';if(s==='gmsa-read')return'acl-gmsa-read-72';if(s.startsWith('gpo-'))return'acl-gpo-control-72';if(s.startsWith('dns-'))return'acl-dnsadmin-72';return'';}
function proof72(cardId,command,output){const facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};const s=stage72(command),t=String(output||'');
 if(cardId==='acl-shadow-credential-72'){
  if(s==='shadow-list'&&/Key Credential|DeviceID|KeyID/i.test(t)){success=true;why='Explicit Key Credential inventory was returned. This is discovery context only and does not prove write control, authentication, access, or privilege.';}
  else if(s==='shadow-auto'){
   if(/Successfully added Key Credential|Key Credential.*added|Updating the Key Credential Link/i.test(t)){success=true;add('ad.keycredential_modified');}
   if(/NT hash|Got hash for|:[0-9a-f]{32}\b/i.test(t)){success=true;add('credential.ntlm_hash');}
   if(/Restoring the old Key Credentials|Successfully restored|Key Credentials.*restored/i.test(t)){success=true;add('ad.keycredential_restored');}
   if(success)why='Explicit Shadow Credentials lifecycle output was returned. Directory mutation, credential material, restoration, authenticated service access, and privilege remain separate proof states.';
  }
 }
 else if(cardId==='acl-group-membership-72'){
  if(s==='group-add'&&(/SamAccountName/i.test(t)||/added.*group|groupMember.*success|successfully.*added/i.test(t))){success=true;why='The reviewed principal was explicitly added or verified as a member of the target group. Membership is a directory authorization change only and does not prove access or privilege.';add('ad.group_membership_changed');}
  else if(s==='group-remove'&&/OBOL_GROUP_MEMBERSHIP_RESTORED/i.test(t)){success=true;why='The temporary group membership was explicitly removed. This is cleanup proof only.';add('ad.group_membership_restored');}
 }
 else if(cardId==='acl-group-owner-dacl-72'){
  if(s==='owner-write'&&/OwnerSid modified successfully|owner.*modified successfully/i.test(t)){success=true;why='The target object owner was explicitly changed. Ownership alone does not prove effective downstream rights, membership, access, or privilege.';add('ad.acl_owner_changed');}
  else if(s==='dacl-write'&&/DACL modified successfully|ACE.*added|rights.*modified successfully/i.test(t)){success=true;why='The target DACL was explicitly modified. The ACE write is configuration proof only.';add('ad.acl_modified');}
  else if(s==='dacl-restore'&&/DACL restored|restored successfully/i.test(t)){success=true;why='The original DACL was explicitly restored. This is cleanup proof only.';add('ad.acl_restored');}
  else if(s==='dacl-backup'&&/DACL backed up|saved.*dacl/i.test(t)){success=true;why='The pre-test DACL was explicitly backed up. Backup creation is preparation only and does not prove a control mutation.';}
 }
 else if(cardId==='acl-user-password-72'){
  if(s==='user-password'&&/The command completed successfully|password.*changed successfully|password.*set successfully/i.test(t)){success=true;why='The reviewed user password was explicitly changed. The new password is credential material only until later authentication succeeds.';add('ad.user_password_changed');add('credential.available');}
 }
 else if(cardId==='acl-targeted-kerberoast-72'){
  if(s==='targeted-kerberoast'&&/\$krb5tgs\$/i.test(t)){success=true;why='Explicit Kerberos TGS hash material was returned. Offline cracking, authentication, access, and privilege remain later stages.';add('kerberos.tgs_hash');add('credential.candidate');}
  if(s==='targeted-kerberoast'&&/SPN.*(?:restored|removed)|restor(?:ed|ing).*SPN/i.test(t)){success=true;add('ad.spn_restored');if(!why)why='The temporary SPN was explicitly restored. This is cleanup proof only.';}
 }
 else if(cardId==='acl-user-logonscript-72'){
  if(s==='logonscript-write'&&/ScriptPath/i.test(t)){success=true;why='The reviewed scriptPath value was explicitly written/read back. Attribute mutation does not prove a later user logon, script execution, access, or privilege.';add('ad.logon_script_modified');}
  else if(s==='logonscript-restore'&&/OBOL_LOGONSCRIPT_RESTORED/i.test(t)){success=true;why='The original logon-script attribute was explicitly restored. This is cleanup proof only.';add('ad.logon_script_restored');}
 }
 else if(cardId==='acl-ou-inheritance-72'){
  if(s==='ou-dacl-write'&&/DACL modified successfully|ACE.*added/i.test(t)){success=true;why='The OU DACL was explicitly modified with the reviewed inheritable ACE. Inherited child control and later object changes remain separate.';add('ad.ou_acl_modified');}
  else if(s==='dacl-restore'&&/DACL restored|restored successfully/i.test(t)){success=true;why='The original OU DACL was explicitly restored. This is cleanup proof only.';add('ad.acl_restored');}
  else if(s==='dacl-backup'&&/DACL backed up|saved.*dacl/i.test(t)){success=true;why='The pre-test OU DACL was explicitly backed up. This is preparation only.';}
 }
 else if(cardId==='acl-ou-gplink-72'){
  if(s==='gplink-write'&&/GpoLinks|DisplayName|linked|success/i.test(t)){success=true;why='The reviewed GPO link was explicitly created or read back. Link configuration does not prove endpoint policy processing, execution, access, or privilege.';add('ad.gplink_modified');}
  else if(s==='gplink-restore'&&/OBOL_GPLINK_RESTORED/i.test(t)){success=true;why='The temporary GPO link was explicitly removed/restored. This is cleanup proof only.';add('ad.gplink_restored');}
 }
 else if(cardId==='acl-gmsa-read-72'){
  if(s==='gmsa-read'&&/(?:NTLM|msDS-ManagedPassword|aes256|:[0-9a-f]{32}\b)/i.test(t)){success=true;why='Explicit gMSA managed-password/hash material was returned. Authentication, service access, and privilege remain separate.';add('credential.ntlm_hash');add('credential.candidate');}
 }
 else if(cardId==='acl-gpo-control-72'){
  if(s==='gpo-discovery'&&/ActiveDirectoryRights|Group-Policy-Container|WriteProperty|GenericAll|GenericWrite/i.test(t)){success=true;why='Explicit GPO ACL/control information was returned. This is control-routing evidence only and does not prove a policy mutation or endpoint effect.';add('ad.gpo_controlled');}
  else if(s==='gpo-write'&&/OBOL_GPO_WRITE_PROVED/i.test(t)){success=true;why='A reversible GPO repository-side proof value was explicitly written. Endpoint policy processing, execution, access, and privilege remain separate.';add('ad.gpo_modified');}
  else if(s==='gpo-restore'&&/OBOL_GPO_PROOF_RESTORED/i.test(t)){success=true;why='The temporary GPO proof value was explicitly removed. This is cleanup proof only.';add('ad.gpo_restored');}
 }
 else if(cardId==='acl-dnsadmin-72'){
  if(s==='dns-config'&&/OBOL_DNS_PLUGIN_CONFIGURED/i.test(t)){success=true;why='The DNS ServerLevelPluginDll setting was explicitly changed. Configuration mutation does not prove payload execution or privilege.';add('ad.dns_plugin_configured');}
  else if(s==='dns-restart'&&/OBOL_DNS_SERVICE_RESTARTED/i.test(t)){success=true;why='The DNS service was explicitly restarted. Restart success does not prove plugin payload execution or administrator access.';add('ad.dns_service_restarted');}
  else if(s==='dns-restore'&&/OBOL_DNS_PLUGIN_RESTORED/i.test(t)){success=true;why='The original DNS plugin setting was explicitly restored and the service restart completed. This is cleanup proof only.';add('ad.dns_plugin_restored');}
 }
 return{success,facts,why,stage:s};
}
function repair72(a){if(!a)return a;const inferred=inferredOwner(a.command||''),id=(M.cardIds||[]).includes(a.cardId)?a.cardId:inferred;if(!(M.cardIds||[]).includes(id))return a;const p=proof72(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...p.facts];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.confidence='medium';a.reason='Recognized v7.2 ACL / ACE Evidence context; the explicit proof required for this stage was not present.';a.outcomeFacts=[];}a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['access.admin','access.system','foothold.windows','access.cross_domain','objective.domain_admin','capability.dcsync','remote.execution'].includes(x));a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,1000)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const r=oldAnalyze(text,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];r.activities=r.activities.map(a=>repair72(a));r.aclFidelityProfiles72=[...new Set(r.activities.filter(a=>(M.cardIds||[]).includes(a.cardId)).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V72={version:'7.2.0',stage72,inferredOwner72:inferredOwner,proof72,repairActivity72:repair72};
})(typeof window!=='undefined'?window:globalThis);