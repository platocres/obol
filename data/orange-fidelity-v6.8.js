// Obol v6.8 Orange source-fidelity overlay — complete ESC4 and both inventoried ESC7 delivery audits.
(function(root){
'use strict';
const F=root.OBOL_ORANGE_FIDELITY_V64;
if(!F)throw new Error('Obol v6.4 source-fidelity ledger is required before orange-fidelity-v6.8.js');
const DONE={
 'adcs.esc4':{owners:['adcs-esc4-68'],reason:'Modeled as a reversible certificate-template ACL path using current Certipy template configuration semantics. The original configuration is preserved before mutation, successful template modification routes to the existing ESC1 workflow, and restoration is separately evidenced.'},
 'adcs.esc7-manage-ca':{owners:['adcs-esc7-manage-ca-68'],reason:'Modeled as the ESC7 Manage CA officer transition with current Certipy CA role-management semantics, explicit officer-add proof, a separate Manage Certificates handoff, and conditional officer removal for cleanup.'},
 'adcs.esc7-manage-cert':{owners:['adcs-esc7-manage-cert-68'],reason:'Modeled as the ESC7 Manage Certificates enable/request/issue/retrieve chain. Template publication, denied request plus saved private key, request issuance, retrieved certificate material, and conditional template cleanup remain distinct proof stages.'}
};
const allReview={};for(const d of F.dimensions||[])allReview[d.id]=true;
for(const u of F.units||[]){const d=DONE[u.id];if(!d)continue;u.auditStatus='modeled';u.reason=d.reason;u.review={...allReview};u.ownerCardIds=[...d.owners];u.auditedIn='6.8';}
F.version='6.8.0';F.auditRevision='6.8';F.auditedIds=[...new Set([...(F.auditedIds||[]),...Object.keys(DONE)])];
root.OBOL_ORANGE_FIDELITY_V68={version:'6.8.0',auditedIds:Object.keys(DONE),modeled:Object.keys(DONE).length,totalModeled:F.auditedIds.length,remaining:(F.units||[]).length-F.auditedIds.length,statement:'v6.8 converts ESC4 and both inventoried ESC7 branches from broad-owner representation to complete modeled outcomes with explicit reversible-change and multi-stage proof boundaries.'};
})(typeof window!=='undefined'?window:globalThis);
