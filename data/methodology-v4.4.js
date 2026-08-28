// Obol v4.4 methodology overlay — connect canonical Orange sections to a usable engagement decision path.
(function(root){
'use strict';
const lanes=root.OBOL_LANES||[],O=root.OBOL_ORANGE_AD_2025_03;
if(!O)throw new Error('Obol canonical Orange AD snapshot is required before methodology-v4.4.js');
const STAGES=[
 {id:'identity',order:10,label:'Identify the environment',summary:'Establish hosts, domain identity, reachable services, and candidate users before choosing deeper AD work.'},
 {id:'credential',order:20,label:'Obtain or validate credentials',summary:'Turn usernames, hashes, tickets, password policy, and credential material into a usable identity.'},
 {id:'authenticated',order:30,label:'Map authenticated AD',summary:'Use a valid identity to map users, groups, services, graph relationships, SCCM, AD CS, and trust context.'},
 {id:'control',order:40,label:'Test control paths',summary:'Evaluate ACL, delegation, certificate, relay, coercion, and other control relationships supported by evidence.'},
 {id:'movement',order:50,label:'Move with proven access',summary:'Use validated credentials, tickets, certificates, database access, or delegated rights against grounded targets.'},
 {id:'admin',order:60,label:'Deepen host control',summary:'Validate administrative access, local privilege, and credential-recovery opportunities without assuming success.'},
 {id:'domain',order:70,label:'Assess domain-level control',summary:'Evaluate replication, domain credential, trust, and domain-compromise paths only when prerequisites are proven.'},
 {id:'persistence',order:80,label:'Document persistence options',summary:'Treat persistence as post-compromise methodology and preserve cleanup/proof obligations.'}
];
const BY_ID=Object.fromEntries(STAGES.map(x=>[x.id,x]));
const CARD_STAGE={
 'ad-dc-identify':'identity','smb-anon-enum':'identity','ad-anon-ldap-enum':'identity','ad-user-enum':'identity','nmap-builder':'identity','dns-enum':'identity',
 'password-spray':'credential','asrep-roast':'credential','kerberoast':'credential','hashcat-modes':'credential','gpp-passwords':'credential',
 'bloodhound-collect':'authenticated','powerview-enum':'authenticated','ad-psdotnet-enum':'authenticated','sccm-enum':'authenticated','trust-enum':'authenticated',
 'ad-acl-abuse':'control','bloodyad-acl':'control','adcs-esc':'control','shadow-credentials':'control','delegation-abuse':'control','ad-machine-account-quota-v25':'control','ntlm-relay':'control',
 'getst-impersonation':'movement','lateral-exec':'movement','ticket-reuse':'movement','kerberos-tickets':'movement','mssql-access':'movement','mysql-enum':'movement','postgres-enum':'movement',
 'windows-enum':'admin','seimpersonate':'admin','dump-secrets':'admin','dpapi-secrets':'admin','stored-credentials':'admin',
 'dcsync':'domain','writedacl-dcsync':'domain',
 'golden-ticket':'persistence'
};
function fallbackStage44(key){
 const k=String(key||'');
 if(/^no_creds\.(?:scan|find-dc|zone-transfer|anon-smb|ldap|users|user-bruteforce)$/.test(k))return'identity';
 if(/^no_creds\.(?:pxe|timeroast)$/.test(k)||/^valid_user\.|^crack_hash\./.test(k))return'credential';
 if(/^authenticated\./.test(k))return /\.(?:coerce|known-vulns)$/.test(k)?'control':/\.computer-connect$/.test(k)?'movement':'authenticated';
 if(/^acl\.|^adcs\.|^delegation\.|^mitm\.|^sccm\.|^low_hanging\./.test(k))return'control';
 if(/^lat_move\./.test(k))return'movement';
 if(/^low_access\.|^admin\./.test(k))return'admin';
 if(/^dom_admin\./.test(k))return'domain';
 if(/^trusts\./.test(k))return /\.enumeration$/.test(k)?'authenticated':'domain';
 if(/^persistence\./.test(k))return'persistence';
 return'';
}
function cardStage44(card){
 if(!card)return null;const explicit=CARD_STAGE[card.id];if(explicit)return BY_ID[explicit];
 const rows=card.orange43||[],ids=[...new Set(rows.map(x=>fallbackStage44(x.key)).filter(Boolean))];
 if(!ids.length)return null;return ids.map(id=>BY_ID[id]).sort((a,b)=>a.order-b.order)[0]||null;
}
for(const l of lanes)for(const c of l.cards||[]){const stage=cardStage44(c);if(!stage)continue;c.orange44={stage:stage.id,order:stage.order,label:stage.label,summary:stage.summary,canonicalKeys:(c.orange43||[]).map(x=>x.key)};}
root.OBOL_METHODOLOGY_V44={version:'4.4.0',stages:STAGES,stageById:BY_ID,cardStage:cardStage44,cardStageOverrides:CARD_STAGE,source:'Orange 2025.03 canonical mappings + live Obol prerequisites'};
})(typeof window!=='undefined'?window:globalThis);
