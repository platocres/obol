// Obol v8.6 project metadata — know_vuln_auth.md whole-file source inventory complete.
(function(root){
'use strict';
const delivered=['know-vuln-auth.ms14-068-uptime','know-vuln-auth.ms14-068-python','know-vuln-auth.ms14-068-msf','know-vuln-auth.ms14-068-goldenpac','know-vuln-auth.gpp-msf','know-vuln-auth.gpp-findstr','know-vuln-auth.gpp-impacket','know-vuln-auth.privexchange','know-vuln-auth.nopac-scan','know-vuln-auth.nopac-ticket','know-vuln-auth.printnightmare-scan','know-vuln-auth.printnightmare-dll','know-vuln-auth.certifried-account','know-vuln-auth.certifried-request','know-vuln-auth.certifried-auth','know-vuln-auth.proxynotshell'];
const superseded=['know-vuln-auth.ms14-068-msf','know-vuln-auth.gpp-msf'];
const modeled=delivered.filter(x=>!superseded.includes(x));
const fileInventoryQueue=['trusts.md','valid_user.md'];
root.OBOL_PROJECT_V86={
 version:'8.6.0',release:'v8.6',canonicalChange:false,
 phase:{id:'whole-file-source-inventory',title:'Orange whole-file source inventory',statement:'Canonical breadth and the frozen v6.2 source-depth baseline remain complete. know_vuln_auth.md is now fully atomized, leaving two methodology-bearing Orange files for whole-file inventory.',next:'Continue with trusts.md, then valid_user.md.'},
 releaseMilestone:{release:'v8.6',implemented:127,partial:0,gap:0,stale:0,coveragePct:100,representedPct:100,label:'know_vuln_auth.md source inventory complete'},
 sourceWave:{fidelityBefore:266,fidelityAfter:282,fidelityTotal:282,filesAtomizedBefore:14,filesAtomizedAfter:15,baselinesAtomizedBefore:34,baselinesAtomizedAfter:34,delivered,modeled,superseded,canonicalAdvanced:[],fileAtomized:'know_vuln_auth.md',fileInventoryQueue,sourceCorrections:['know-vuln-auth.ms14-068-goldenpac','know-vuln-auth.gpp-impacket','know-vuln-auth.printnightmare-dll','know-vuln-auth.proxynotshell']}
};
})(typeof window!=='undefined'?window:globalThis);
