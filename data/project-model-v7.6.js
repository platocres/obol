// Obol v7.6 project metadata — complete admin source decomposition and fidelity.
(function(root){
'use strict';
const delivered=['admin.lsass-ppldump','admin.lsass-ppl-mimikatz','admin.lsass-procdump','admin.lsass-mimikatz-live','admin.lsass-remote-lsassy','admin.sam-remote','admin.sam-live','admin.sam-offline','admin.sam-remote-registry','admin.lsa-remote','admin.lsa-live','admin.lsa-registry','admin.dpapi-remote','admin.dpapi-masterkey-mimikatz','admin.dpapi-masterkey-lsassy','admin.dpapi-sharpdpapi','admin.dpapi-masterkey-crack','admin.impersonate-incognito','admin.impersonate-schtask','admin.impersonate-irs','admin.impersonate-adcs','admin.impersonate-rdp','admin.misc-user-directories','admin.misc-keepass','admin.misc-adconnect'];
root.OBOL_PROJECT_V76={
 version:'7.6.0',release:'v7.6',canonicalChange:true,
 phase:{id:'source-inventory-decomposition',title:'Orange source inventory and decomposition',statement:'The pinned admin.md source family is now atomized and fidelity-complete. The quality-first queue continues through the remaining frozen v6.2 source-depth baselines, beginning with no_creds.md source paths.',next:'Decompose the highest-priority remaining no_creds.md source-depth baselines while preserving zero quality debt, zero canonical gaps, and conservative engagement proof boundaries.'},
 releaseMilestone:{release:'v7.6',implemented:118,partial:9,gap:0,stale:0,coveragePct:93,representedPct:100,label:'Admin source-depth completion'},
 sourceWave:{fidelityBefore:93,fidelityAfter:118,fidelityTotal:118,filesAtomizedBefore:6,filesAtomizedAfter:7,baselinesAtomizedBefore:24,baselinesAtomizedAfter:25,delivered,modeled:delivered.filter(x=>x!=='admin.lsass-ppldump'),superseded:['admin.lsass-ppldump'],canonicalAdvanced:['admin.misc'],historicalCanonicalDeepened:['admin.lsass','admin.sam','admin.lsa','admin.dpapi','admin.impersonation']}
};
})(typeof window!=='undefined'?window:globalThis);
