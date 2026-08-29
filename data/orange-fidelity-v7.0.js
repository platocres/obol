// Obol v7.0 Orange source-fidelity overlay — finish the five remaining AD CS certificate-mapping audits.
(function(root){
'use strict';
const F=root.OBOL_ORANGE_FIDELITY_V64;
if(!F)throw new Error('Obol v6.4 source-fidelity ledger is required before orange-fidelity-v7.0.js');
const DONE={
 'adcs.mapping-shadow':{status:'modeled',owners:['adcs-mapping-shadow-70'],reason:'Modeled as the temporary Shadow Credentials bridge using Certipy auto with explicit NT-hash proof and explicit restoration accounting. Temporary Key Credential control, recovered hash material, later authentication, access, and privilege remain separate.'},
 'adcs.esc9':{status:'modeled',owners:['adcs-esc9-70'],reason:'Modeled as the ESC9 weak-mapping case with temporary account identity preparation, a separate certificate request stage, explicit restoration, and no access or privilege inference from the configuration change or returned certificate.'},
 'adcs.esc10-case1':{status:'modeled',owners:['adcs-esc10-case1-70'],reason:'Modeled as ESC10 case 1 with temporary UPN identity preparation, client-authentication certificate request, cleanup, and separate certificate/authentication/access proof boundaries.'},
 'adcs.esc10-case2':{status:'modeled',owners:['adcs-esc10-case2-70'],reason:'Modeled as ESC10 case 2 for the reviewed machine-identity/Schannel mapping path, with temporary UPN preparation, certificate material, Schannel follow-on guidance, and mandatory restoration kept separate.'},
 'adcs.esc14':{status:'superseded',owners:['adcs-esc14-assess-70'],reason:'The pinned Orange 2025.03 ESC14 explicit branch contains no exploitation mechanics. v7.0 supersedes that empty branch with current Certipy ESC14 detection and explicit-mapping assessment/reporting, intentionally avoiding invented exploit commands while preserving a manual reviewed handoff.'}
};
const allReview={};for(const d of F.dimensions||[])allReview[d.id]=true;
for(const u of F.units||[]){const d=DONE[u.id];if(!d)continue;u.auditStatus=d.status;u.reason=d.reason;u.review={...allReview};u.ownerCardIds=[...d.owners];u.auditedIn='7.0';}
F.version='7.0.0';F.auditRevision='7.0';F.auditedIds=[...new Set([...(F.auditedIds||[]),...Object.keys(DONE)])];
root.OBOL_ORANGE_FIDELITY_V70={version:'7.0.0',auditedIds:Object.keys(DONE),modeled:Object.values(DONE).filter(x=>x.status==='modeled').length,superseded:Object.values(DONE).filter(x=>x.status==='superseded').length,totalComplete:F.auditedIds.length,remaining:(F.units||[]).length-F.auditedIds.length,statement:'v7.0 closes the remaining AD CS certificate-mapping fidelity queue: four units are modeled end to end and the source-empty ESC14 branch is explicitly superseded by a current detection-and-review workflow.'};
})(typeof window!=='undefined'?window:globalThis);
