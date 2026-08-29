// Obol v6.5 Orange source-fidelity overlay — complete the first five atomic AD CS delivery audits.
(function(root){
'use strict';
const F=root.OBOL_ORANGE_FIDELITY_V64;
if(!F)throw new Error('Obol v6.4 source-fidelity ledger is required before orange-fidelity-v6.5.js');
const DONE={
 'adcs.inventory':{owners:['adcs-enumeration55'],reason:'Modeled end to end through authenticated AD CS enumeration, source-aware branch routing, explicit Kali/Windows command surfaces, conservative Evidence, Next Steps, and reporting.'},
 'adcs.esc8':{owners:['adcs-esc8-65'],reason:'Modeled as a distinct web-enrollment relay path with separate relay setup, certificate issuance, certificate authentication, and privilege boundaries.'},
 'adcs.esc1':{owners:['adcs-esc1-65'],reason:'Modeled as a distinct enrollee-supplied-identity template path with explicit request, certificate artifact, authentication handoff, and conservative proof boundaries.'},
 'adcs.esc2':{owners:['adcs-esc2-65'],reason:'Modeled as an any-purpose/subordinate-CA routing path that obtains certificate material and deliberately hands off to the separate ESC3 on-behalf-of workflow.'},
 'adcs.esc3':{owners:['adcs-esc3-65'],reason:'Modeled as a distinct enrollment-agent/on-behalf-of workflow with explicit agent-certificate and target-certificate stages.'}
};
const allReview={};for(const d of F.dimensions||[])allReview[d.id]=true;
for(const u of F.units||[]){const d=DONE[u.id];if(!d)continue;u.auditStatus='modeled';u.reason=d.reason;u.review={...allReview};u.ownerCardIds=[...d.owners];u.auditedIn='6.5';}
F.version='6.5.0';F.auditRevision='6.5';F.auditedIds=Object.keys(DONE);
root.OBOL_ORANGE_FIDELITY_V65={version:'6.5.0',auditedIds:Object.keys(DONE),modeled:Object.keys(DONE).length,remaining:(F.units||[]).length-Object.keys(DONE).length,statement:'v6.5 converts the first five inventoried AD CS units from broad-owner representation to complete modeled outcomes.'};
})(typeof window!=='undefined'?window:globalThis);
