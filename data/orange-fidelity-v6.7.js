// Obol v6.7 Orange source-fidelity overlay — complete ESC13 and both inventoried ESC15 delivery audits.
(function(root){
'use strict';
const F=root.OBOL_ORANGE_FIDELITY_V64;
if(!F)throw new Error('Obol v6.4 source-fidelity ledger is required before orange-fidelity-v6.7.js');
const DONE={
 'adcs.esc13':{owners:['adcs-esc13-67'],reason:'Modeled as a distinct issuance-policy/group-link template path with explicit Kali/Windows request surfaces, certificate-material proof, PKINIT/pass-the-certificate handoff, reporting, and no access or privilege inference.'},
 'adcs.esc15-schannel':{owners:['adcs-esc15-schannel-67'],reason:'Modeled as the Schannel-specific ESC15 application-policy injection branch. The injected client-authentication certificate remains credential material until a separate Schannel service interaction proves access.'},
 'adcs.esc15-agent':{owners:['adcs-esc15-agent-67'],reason:'Modeled as the ESC15 Certificate Request Agent application-policy branch. The returned enrollment-agent certificate is an intermediate artifact that routes to the existing ESC3 on-behalf-of workflow.'}
};
const allReview={};for(const d of F.dimensions||[])allReview[d.id]=true;
for(const u of F.units||[]){const d=DONE[u.id];if(!d)continue;u.auditStatus='modeled';u.reason=d.reason;u.review={...allReview};u.ownerCardIds=[...d.owners];u.auditedIn='6.7';}
F.version='6.7.0';F.auditRevision='6.7';F.auditedIds=[...new Set([...(F.auditedIds||[]),...Object.keys(DONE)])];
root.OBOL_ORANGE_FIDELITY_V67={version:'6.7.0',auditedIds:Object.keys(DONE),modeled:Object.keys(DONE).length,totalModeled:F.auditedIds.length,remaining:(F.units||[]).length-F.auditedIds.length,statement:'v6.7 converts ESC13 and both inventoried ESC15 branches from broad-owner representation to complete modeled outcomes.'};
})(typeof window!=='undefined'?window:globalThis);
