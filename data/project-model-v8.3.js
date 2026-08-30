// Obol v8.3 project metadata — low_hanging.md whole-file source inventory complete.
(function(root){
'use strict';
const delivered=['low-hanging.eternalblue-ms17-010','low-hanging.tomcat-enum','low-hanging.tomcat-deploy','low-hanging.java-rmi','low-hanging.java-serialization','low-hanging.log4shell-jndi','low-hanging.database-mssql-enum','low-hanging.exchange-proxyshell','low-hanging.veeam-27532-veamhax','low-hanging.veeam-27532-nettcp','low-hanging.veeam-29849','low-hanging.veeam-29855','low-hanging.veeam-40711','low-hanging.glpi-35914','low-hanging.glpi-41320','low-hanging.weak-services-nuclei','low-hanging.weak-services-nessus'];
const modeled=delivered.filter(x=>x!=='low-hanging.weak-services-nessus');
const superseded=['low-hanging.weak-services-nessus'];
const inherited=['low-hanging.zerologon-check','low-hanging.zerologon-reset'];
const fileInventoryQueue=['persistence.md','dom_admin.md','know_vuln_auth.md','trusts.md','valid_user.md'];
root.OBOL_PROJECT_V83={
 version:'8.3.0',release:'v8.3',canonicalChange:false,
 phase:{id:'whole-file-source-inventory',title:'Orange whole-file source inventory',statement:'Canonical breadth and the frozen v6.2 source-depth baseline remain complete. low_hanging.md is now fully atomized, leaving five methodology-bearing Orange files for whole-file inventory.',next:'Continue with persistence.md, then dom_admin.md, know_vuln_auth.md, trusts.md, and valid_user.md.'},
 releaseMilestone:{release:'v8.3',implemented:127,partial:0,gap:0,stale:0,coveragePct:100,representedPct:100,label:'low_hanging.md source inventory complete'},
 sourceWave:{fidelityBefore:226,fidelityAfter:243,fidelityTotal:243,filesAtomizedBefore:11,filesAtomizedAfter:12,baselinesAtomizedBefore:34,baselinesAtomizedAfter:34,delivered,modeled,superseded,inherited,canonicalAdvanced:[],fileAtomized:'low_hanging.md',fileInventoryQueue}
};
})(typeof window!=='undefined'?window:globalThis);
