// Obol v8.7 project metadata — trusts.md whole-file source inventory complete.
(function(root){
'use strict';
const delivered=['trusts.enum-nltest','trusts.enum-dotnet','trusts.enum-get-domaintrust','trusts.enum-mapping','trusts.enum-ldeep','trusts.enum-sharphound','trusts.enum-bloodhound','trusts.enum-domainsid','trusts.enum-lookupsid','trusts.child-trust-mimikatz-dump','trusts.child-trust-mimikatz-ticket','trusts.child-trust-secretsdump','trusts.child-trust-ticketer','trusts.child-golden-dcsync','trusts.child-golden-mimikatz','trusts.child-golden-raisechild','trusts.child-golden-ticketer','trusts.child-unconstrained','trusts.parent-child-symmetry','trusts.external-password-reuse','trusts.external-foreign-user','trusts.external-foreign-group','trusts.external-sidhistory-golden-mimikatz','trusts.external-sidhistory-golden-ticketer','trusts.external-sidhistory-trust-secretsdump','trusts.external-sidhistory-trust-ticketer','trusts.external-adcs-route','trusts.external-treat-as-external-unconstrained','trusts.external-oneway-inbound','trusts.external-oneway-outbound','trusts.mssql-powerupsql','trusts.mssql-impacket','trusts.mssql-legacy-link-commands','trusts.mssql-use-link'];
const superseded=['trusts.mssql-legacy-link-commands'];
const modeled=delivered.filter(x=>!superseded.includes(x));
const fileInventoryQueue=['valid_user.md'];
root.OBOL_PROJECT_V87={
 version:'8.7.0',release:'v8.7',canonicalChange:false,
 phase:{id:'whole-file-source-inventory',title:'Orange whole-file source inventory',statement:'Canonical breadth and the frozen v6.2 source-depth baseline remain complete. trusts.md is now fully atomized, leaving one methodology-bearing Orange file for whole-file inventory.',next:'Finish the final whole-file source inventory in valid_user.md.'},
 releaseMilestone:{release:'v8.7',implemented:127,partial:0,gap:0,stale:0,coveragePct:100,representedPct:100,label:'trusts.md source inventory complete'},
 sourceWave:{fidelityBefore:282,fidelityAfter:316,fidelityTotal:316,filesAtomizedBefore:15,filesAtomizedAfter:16,baselinesAtomizedBefore:34,baselinesAtomizedAfter:34,delivered,modeled,superseded,canonicalAdvanced:[],fileAtomized:'trusts.md',fileInventoryQueue,sourceCorrections:['trusts.enum-lookupsid','trusts.child-golden-mimikatz','trusts.external-sidhistory-golden-ticketer','trusts.external-sidhistory-trust-ticketer','trusts.mssql-legacy-link-commands']}
};
})(typeof window!=='undefined'?window:globalThis);
