// Obol v8.4 project metadata — persistence.md whole-file source inventory complete.
(function(root){
'use strict';
const delivered=['persistence.golden-impacket-aes','persistence.golden-mimikatz-aes','persistence.silver-mimikatz-aes','persistence.silver-impacket-nthash','persistence.dsrm-registry','persistence.skeleton-key','persistence.custom-ssp-load','persistence.custom-ssp-log','persistence.golden-cert-backup','persistence.golden-cert-forge','persistence.diamond-ticket','persistence.sapphire-ticket','persistence.dcshadow-heading','persistence.acl-manipulation-heading','persistence.trailing-ellipsis'];
const modeled=delivered.filter(x=>x!=='persistence.trailing-ellipsis');
const rejected=['persistence.trailing-ellipsis'];
const inherited=['persistence.add-da-membership'];
const fileInventoryQueue=['dom_admin.md','know_vuln_auth.md','trusts.md','valid_user.md'];
root.OBOL_PROJECT_V84={
 version:'8.4.0',release:'v8.4',canonicalChange:false,
 phase:{id:'whole-file-source-inventory',title:'Orange whole-file source inventory',statement:'Canonical breadth and the frozen v6.2 source-depth baseline remain complete. persistence.md is now fully atomized, leaving four methodology-bearing Orange files for whole-file inventory.',next:'Continue with dom_admin.md, then know_vuln_auth.md, trusts.md, and valid_user.md.'},
 releaseMilestone:{release:'v8.4',implemented:127,partial:0,gap:0,stale:0,coveragePct:100,representedPct:100,label:'persistence.md source inventory complete'},
 sourceWave:{fidelityBefore:243,fidelityAfter:258,fidelityTotal:258,filesAtomizedBefore:12,filesAtomizedAfter:13,baselinesAtomizedBefore:34,baselinesAtomizedAfter:34,delivered,modeled,rejected,inherited,canonicalAdvanced:[],fileAtomized:'persistence.md',fileInventoryQueue,sourceCorrections:['persistence.golden-mimikatz-aes','persistence.silver-mimikatz-aes','persistence.silver-impacket-nthash','persistence.diamond-ticket','persistence.sapphire-ticket']}
};
})(typeof window!=='undefined'?window:globalThis);
