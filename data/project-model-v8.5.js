// Obol v8.5 project metadata — dom_admin.md whole-file source inventory complete.
(function(root){
'use strict';
const delivered=['dom-admin.ntds-nxc','dom-admin.ntds-secretsdump-remote','dom-admin.ntds-ifm-create','dom-admin.ntds-ifm-offline','dom-admin.ntds-msf-domain-hashdump','dom-admin.ntds-mimikatz-dcsync','dom-admin.ntds-certsync','dom-admin.backup-donpapi'];
const modeled=delivered.filter(x=>x!=='dom-admin.ntds-msf-domain-hashdump');
const superseded=['dom-admin.ntds-msf-domain-hashdump'];
const fileInventoryQueue=['know_vuln_auth.md','trusts.md','valid_user.md'];
root.OBOL_PROJECT_V85={
 version:'8.5.0',release:'v8.5',canonicalChange:false,
 phase:{id:'whole-file-source-inventory',title:'Orange whole-file source inventory',statement:'Canonical breadth and the frozen v6.2 source-depth baseline remain complete. dom_admin.md is now fully atomized, leaving three methodology-bearing Orange files for whole-file inventory.',next:'Continue with know_vuln_auth.md, then trusts.md and valid_user.md.'},
 releaseMilestone:{release:'v8.5',implemented:127,partial:0,gap:0,stale:0,coveragePct:100,representedPct:100,label:'dom_admin.md source inventory complete'},
 sourceWave:{fidelityBefore:258,fidelityAfter:266,fidelityTotal:266,filesAtomizedBefore:13,filesAtomizedAfter:14,baselinesAtomizedBefore:34,baselinesAtomizedAfter:34,delivered,modeled,superseded,canonicalAdvanced:[],fileAtomized:'dom_admin.md',fileInventoryQueue,sourceCorrections:['dom-admin.ntds-ifm-create','dom-admin.ntds-ifm-offline','dom-admin.backup-donpapi']}
};
})(typeof window!=='undefined'?window:globalThis);
