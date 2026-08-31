// Obol v8.8 methodology overlay — finish valid_user.md whole-file source integration.
(function(root){
'use strict';
const lanes=root.OBOL_LANES||[],O=root.OBOL_ORANGE_AD_2025_03,F=root.OBOL_ORANGE_FIDELITY_V64,F88=root.OBOL_ORANGE_FIDELITY_V88,M87=root.OBOL_METHODOLOGY_V87;
if(!O||!F||!F88||!M87)throw new Error('Obol Orange, source fidelity, and v8.7 methodology are required before methodology-v8.8.js');
function card(id){for(const l of lanes)for(const c of l.cards||[])if(c.id===id)return c;return null;}
function section(key){for(const f of O.files||[])for(const s of f.sections||[])if(s.key===key)return s;return null;}
function provenance(c,key){const s=section(key);if(!c)throw new Error('Missing v8.8 owner for '+key);c.orange43=c.orange43||[];if(!c.orange43.some(x=>x.key===key))c.orange43.push({key,file:'valid_user.md',label:(s&&s.label)||key,status:(s&&s.status)||'implemented',advancedIn:(s&&s.advancedIn)||''});}
const owners={
 'password-spray':card('password-spray'),
 'asrep-roast':card('asrep-roast'),
 'kerberoast':card('kerberoast'),
 'bloodhound-collect':card('bloodhound-collect')
};
for(const [id,c] of Object.entries(owners))if(!c)throw new Error('v8.8 missing mature owner '+id);
const notes={
 'password-spray':'v8.8 completes valid-user password-policy, user-equals-password, and common-password source accounting while keeping lockout policy and authentication success separate.',
 'asrep-roast':'v8.8 completes AS-REP roast source accounting and records the blind-roast/CVE source branches without turning source labels or tool startup into access.',
 'kerberoast':'v8.8 preserves blind-Kerberoast source lineage through the mature Kerberoast owner while keeping captured TGS material below credential recovery or service access.',
 'bloodhound-collect':'v8.8 preserves the roastable-user graph-query source node as graph context only.'
};
const touched=new Set();
for(const uid of F88.fileAuditedIds||[]){const u=(F.units||[]).find(x=>x.id===uid);if(!u)throw new Error('Missing v8.8 fidelity unit '+uid);for(const owner of u.ownerCardIds||[]){const c=owners[owner]||card(owner);if(!c)throw new Error('Missing v8.8 owner '+owner+' for '+uid);provenance(c,u.canonicalKey);c.atomic88=[...new Set([...(c.atomic88||[]),uid])];c.sourceInventory88={file:'valid_user.md',sourceSha:F88.sourceSha,note:notes[owner]||'v8.8 valid_user.md source inventory reviewed against the pinned source.'};touched.add(owner);}}
const spray=owners['password-spray'],asrep=owners['asrep-roast'],kerb=owners.kerberoast,bh=owners['bloodhound-collect'];
spray.sourceReview88={sourceFile:'valid_user.md',sourceSha:F88.sourceSha,policyFirst:true,lockoutBoundary:'Policy discovery and per-account effective policy context must precede operator-selected spray attempts; an attempt is not a credential.',preferredSurface:'Keep the mature lockout-aware password-spray owner primary rather than duplicating every equivalent upstream tool variant.'};
asrep.sourceReview88={sourceFile:'valid_user.md',sourceSha:F88.sourceSha,proofBoundary:'Roastable-user discovery, returned hash material, recovered credentials, ticket material, authentication, access, and privilege remain separate.',sourceCorrections:['Normalize packaged Impacket tool naming in provenance.','Record the pinned CVE helper as superseded rather than creating a brittle release-specific exploit route.']};
kerb.sourceReview88={sourceFile:'valid_user.md',sourceSha:F88.sourceSha,note:'Blind-Kerberoast variants are terminally source-accounted and intentionally consolidated into the mature Kerberoast workflow instead of duplicating specialized no-preauthentication commands.'};
bh.sourceReview88={sourceFile:'valid_user.md',sourceSha:F88.sourceSha,note:'The pinned roastable-user graph query is represented as graph context; it does not create hash, credential, ticket, or access facts.'};
for(const key of ['valid_user.spray','valid_user.asrep']){const s=section(key);if(!s||s.status!=='implemented')throw new Error('v8.8 expected implemented valid-user canonical parent '+key);}
O.coverageRevision='8.8';O.coverageOverlay='data/methodology-v8.8.js';
root.OBOL_METHODOLOGY_V88={version:'8.8.0',sourceFile:'valid_user.md',sourceSha:F88.sourceSha,cardIds:[...touched],fidelityIds:F88.fileAuditedIds.slice(),newFidelityIds:F88.newAuditedIds.slice(),canonicalAdvanced:[],fileAtomized:true,sourceCorrectionIds:['valid-user.fgpp-powershell','valid-user.asrep-getnpusers','valid-user.blind-kerberoast-rubeus','valid-user.blind-kerberoast-impacket','valid-user.cve-2022-33679'],statement:'v8.8 completes valid_user.md whole-file source inventory through mature password-spray, AS-REP roast, Kerberoast, and BloodHound owners. The final Orange file is atomized, redundant or brittle source variants remain explicitly superseded with rationale, and password policy, authentication attempts, hashes, credentials, tickets, service access, execution, privilege, cleanup, Next Steps, and reporting remain separate proof boundaries.'};
})(typeof window!=='undefined'?window:globalThis);
