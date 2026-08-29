// Obol v5.6 methodology overlay — close mapped-delivery debt and complete five mature canonical branches.
(function(root){
'use strict';
const lanes=root.OBOL_LANES||[],O=root.OBOL_ORANGE_AD_2025_03,M41=root.OBOL_METHODOLOGY_V41,M45=root.OBOL_METHODOLOGY_V45,M47=root.OBOL_METHODOLOGY_V47,M55=root.OBOL_METHODOLOGY_V55;
if(!O||!M41||!M45||!M47||!M55)throw new Error('Obol Orange snapshot plus v4.1/v4.5/v4.7/v5.5 methodology layers are required before methodology-v5.6.js');
function lane(id){return lanes.find(x=>x.lane===id);}
function card(id){for(const l of lanes)for(const c of l.cards||[])if(c.id===id)return c;return null;}
function allCards(){const out=[];for(const l of lanes)for(const c of l.cards||[])out.push(c);return out;}
const STAGE={control:{stage:'control',order:40,label:'Test control paths'},movement:{stage:'movement',order:50,label:'Move with proven access'}};
function ensureStage(c,kind){if(!c)return;c.orange44=c.orange44||{...STAGE[kind],summary:'Dedicated v5.6 owner connected to the pinned canonical decision path.',canonicalKeys:[]};c.orange44.canonicalKeys=c.orange44.canonicalKeys||[];}
function attachProfile(c,p){
 if(!c)return;
 c.evidence45={...p};M45.profiles[c.id]={...p};if(!M45.profileCardIds.includes(c.id))M45.profileCardIds.push(c.id);
 let r=M47.reportContract(c);if(r)c.report47={...r,evidenceProfile:true,evidenceFamily:p.family,evidenceSource:'v5.6',claims:[...(p.claims||[])]};
 const old=(M47.contracts||[]).find(x=>x.cardId===c.id);
 if(old){Object.assign(old,c.report47||{}, {evidenceProfile:true,evidenceFamily:p.family,evidenceSource:'v5.6',claims:[...(p.claims||[])]});}
 else if(c.report47)(M47.contracts||[]).push({...c.report47});
}
function setSurfaces(c,fn){if(!c)return 0;let n=0;for(const [i,cmd] of (c.commands||[]).entries()){if(cmd.operatorSurface40)continue;const s=fn(cmd,i);if(!s)continue;cmd.operatorSurface40=s;cmd.operatorSurface56Source='audited-v5.6';n++;}return n;}
const specificProfiles={
 'shadow-credentials':{family:'shadow-credentials',source:'v5.6',proof:'explicit msDS-KeyCredentialLink update plus generated certificate/PFX material',claims:['credential.certificate']},
 'ntlm-relay':{family:'ntlm-relay',source:'v5.6',proof:'explicit successful relay authentication; listener startup alone is never success',claims:['relay.success','ad.computer_added']},
 'ad-machine-account-quota-v25':{family:'machine-account-quota',source:'v5.6',proof:'explicit numeric MachineAccountQuota result',claims:['ad.machine_account_quota']},
 'getst-impersonation':{family:'s4u-ticket',source:'v5.6',proof:'explicit saved S4U service ticket; ticket creation alone does not prove administrator access',claims:['kerberos.tickets']},
 'mysql-enum':{family:'mysql-access',source:'v5.6',proof:'explicit MySQL authentication or query result; login alone does not prove file write or code execution',claims:['db.mysql_access','loot.files']},
 'postgres-enum':{family:'postgres-access',source:'v5.6',proof:'explicit PostgreSQL authentication or COPY PROGRAM command output',claims:['db.postgres_access','db.postgres_exec']},
 'website-discovery':{family:'web-triage',source:'v5.6',proof:'explicit HTTP response or WhatWeb fingerprint',claims:['web.reachable']},
 'ad-acl-abuse':{family:'ad-acl-evidence',source:'v5.6',proof:'explicit ACE/right and principal/object evidence; enumeration never implies administrator access',claims:['ad.control_paths']},
 'ad-psdotnet-enum':{family:'ad-dotnet-enum',source:'v5.6',proof:'explicit DirectoryServices/LDAP object output',claims:['ad.user_list','ad.directory_enumerated']},
 'powerview-enum':{family:'powerview-enum',source:'v5.6',proof:'explicit PowerView directory or local-admin mapping output',claims:['ad.user_list','ad.attack_paths']},
 'zerologon-check':{family:'zerologon-detection',source:'v5.6',proof:'explicit VULNERABLE or patched detection result; only VULNERABLE creates a candidate fact',claims:['vuln.candidates']},
 'ticket-reuse':{family:'ticket-reuse',source:'v5.6',proof:'explicit ticket import or explicit Kerberos-authenticated service use',claims:['kerberos.tickets','lateral.movement']},
 'gmsa-read':{family:'gmsa-read',source:'v5.6',proof:'explicit managed-password material; reusable hash requires explicit parsed NTLM material',claims:['credential.candidate','credential.ntlm_hash']}
};
ensureStage(card('gmsa-read'),'control');
for(const [id,p] of Object.entries(specificProfiles))attachProfile(card(id),p);

// Every remaining mapped card that lacked an Evidence contract receives a conservative, no-fact fallback.
// This closes documentation/interpretation debt without manufacturing access or privilege.
const genericRepairIds=[];
for(const c of allCards()){
 if(!c.orange44||c.evidence45)continue;
 const p={family:'explicit-output-review',source:'v5.6',proof:'explicit card-specific expected output reviewed against the exact command; generic fallback creates no outcome facts',claims:[]};
 attachProfile(c,p);genericRepairIds.push(c.id);
}

const surfaceAdds={};
surfaceAdds['shadow-credentials']=setSurfaces(card('shadow-credentials'),()=> 'kali');
surfaceAdds['ntlm-relay']=setSurfaces(card('ntlm-relay'),()=> 'kali');
surfaceAdds['ad-machine-account-quota-v25']=setSurfaces(card('ad-machine-account-quota-v25'),cmd=>/Get-ADDomain/i.test(String(cmd.run||''))?'windows':'kali');
surfaceAdds['getst-impersonation']=setSurfaces(card('getst-impersonation'),()=> 'kali');
surfaceAdds['mysql-enum']=setSurfaces(card('mysql-enum'),()=> 'kali');
surfaceAdds['postgres-enum']=setSurfaces(card('postgres-enum'),()=> 'kali');
surfaceAdds['website-discovery']=setSurfaces(card('website-discovery'),()=> 'kali');
surfaceAdds['gmsa-read']=setSurfaces(card('gmsa-read'),cmd=>/Get-ADServiceAccount/i.test(String(cmd.run||''))?'windows':'kali');

function section(file,id){const f=(O.files||[]).find(x=>x.file===file);return f&&(f.sections||[]).find(x=>x.id===id);}
const advanced=[];
function advance(file,id,ids,note,stage){
 const s=section(file,id);if(!s)throw new Error('Missing canonical section '+file+':'+id);
 if(s.status!=='partial')throw new Error('v5.6 expected partial canonical section '+s.key+' but found '+s.status);
 s.status='implemented';s.cardIds=ids.slice();s.note=note;s.advancedIn='5.6';advanced.push(s.key);
 for(const c of allCards())if(!ids.includes(c.id)&&Array.isArray(c.orange43))c.orange43=c.orange43.filter(x=>x.key!==s.key);
 for(const cardId of ids){
   const c=card(cardId);if(!c)throw new Error('Missing v5.6 canonical owner '+cardId);
   ensureStage(c,stage||'control');c.orange43=c.orange43||[];
   const x=c.orange43.find(x=>x.key===s.key);
   if(x)Object.assign(x,{file,label:s.label,status:'implemented',advancedIn:'5.6'});else c.orange43.push({key:s.key,file,label:s.label,status:'implemented',advancedIn:'5.6'});
   if(!c.orange44.canonicalKeys.includes(s.key))c.orange44.canonicalKeys.push(s.key);
   const r=M47.reportContract(c);if(r){c.report47={...r};const old=(M47.contracts||[]).find(x=>x.cardId===c.id);if(old)Object.assign(old,r);else(M47.contracts||[]).push({...r});}
 }
}
advance('acl.md','shadow-credentials',['shadow-credentials'],'v5.6 gives Shadow Credentials a complete Evidence/execution/report owner with proof bounded to explicit key-credential write and certificate material.','control');
advance('acl.md','gmsa',['gmsa-read'],'v5.6 maps gMSA password retrieval to its dedicated workflow and requires explicit managed-password material before credential facts.','control');
advance('delegation.md','s4u2self',['getst-impersonation'],'v5.6 gives S4U2Self/S4U service-ticket use a delivery-ready getST owner while keeping ticket creation separate from service access.','movement');
advance('mitm.md','ntlm-relay',['ntlm-relay'],'v5.6 completes the NTLM relay branch with explicit relay-success proof, audited Kali execution metadata, and no success from listener startup.','control');
advance('low_hanging.md','weak-services',['website-discovery'],'v5.6 completes the weak-web-service triage branch with explicit HTTP/fingerprint Evidence and no vulnerability claim from reachability alone.','control');

O.coverageRevision='5.6';O.coverageOverlay='data/methodology-v5.6.js';
if(M41){
 const acl=(M41.areas||[]).find(x=>x.id==='acl');if(acl){const n=(acl.nodes||[]).find(x=>x.id==='acl-control');if(n){n.cardIds=[...new Set([...(n.cardIds||[]),'shadow-credentials','gmsa-read'])];n.coverage='partial';}}
 const del=(M41.areas||[]).find(x=>x.id==='delegation');if(del){const n=(del.nodes||[]).find(x=>x.id==='delegation-abuse');if(n)n.cardIds=[...new Set([...(n.cardIds||[]),'getst-impersonation'])];}
 const mitm=(M41.areas||[]).find(x=>x.id==='mitm');if(mitm){const n=(mitm.nodes||[]).find(x=>x.id==='relay');if(n)n.cardIds=[...new Set([...(n.cardIds||[]),'ntlm-relay'])];}
}
root.OBOL_METHODOLOGY_V56={
 version:'5.6.0',specificProfiles,genericRepairIds,
 repairedCardIds:[...new Set([...Object.keys(specificProfiles),...genericRepairIds])].filter(id=>!!card(id)),
 surfaceAdds,advancedKeys:advanced.slice(),
 baseline55:{implemented:62,partial:39,gap:26,stale:0,coveragePct:49,representedPct:80},
 targetImplemented:67
};
})(typeof window!=='undefined'?window:globalThis);
