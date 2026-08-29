// Obol v6.9 Orange source-fidelity overlay — complete ESC5, ESC6, and ESC11 delivery audits.
(function(root){
'use strict';
const F=root.OBOL_ORANGE_FIDELITY_V64;
if(!F)throw new Error('Obol v6.4 source-fidelity ledger is required before orange-fidelity-v6.9.js');
const DONE={
 'adcs.esc5':{owners:['adcs-esc5-69'],reason:'Modeled as the vulnerable PKI-object / CA-key path with explicit CA backup material, a separate forged-certificate stage, sensitive-artifact handling, and no access or privilege inference from either artifact.'},
 'adcs.esc6':{owners:['adcs-esc6-69'],reason:'Modeled as the CA SAN-flag identity-selection branch using an explicitly reviewed client-authentication-capable template. Certificate issuance is credential material only; authentication, access, and privilege remain separate.'},
 'adcs.esc11':{owners:['adcs-esc11-69'],reason:'Modeled as the RPC/ICPR enrollment-relay branch with explicit relay-target selection, certificate issuance proof, certificate-authentication handoff, and no DCSync or privilege inference from listener startup, relay output, or ticket/certificate material.'}
};
const allReview={};for(const d of F.dimensions||[])allReview[d.id]=true;
for(const u of F.units||[]){const d=DONE[u.id];if(!d)continue;u.auditStatus='modeled';u.reason=d.reason;u.review={...allReview};u.ownerCardIds=[...d.owners];u.auditedIn='6.9';}
F.version='6.9.0';F.auditRevision='6.9';F.auditedIds=[...new Set([...(F.auditedIds||[]),...Object.keys(DONE)])];
root.OBOL_ORANGE_FIDELITY_V69={version:'6.9.0',auditedIds:Object.keys(DONE),modeled:Object.keys(DONE).length,totalModeled:F.auditedIds.length,remaining:(F.units||[]).length-F.auditedIds.length,statement:'v6.9 converts ESC5, ESC6, and ESC11 from broad-owner representation to complete modeled outcomes while keeping CA key material, certificate material, authentication, access, and privilege separate.'};
})(typeof window!=='undefined'?window:globalThis);
