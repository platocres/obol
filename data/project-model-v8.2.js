// Obol v8.2 project metadata — crack_hash.md whole-file source inventory complete.
(function(root){
'use strict';
const delivered=['crack-hash.lm-john','crack-hash.lm-hashcat','crack-hash.nt-john','crack-hash.nt-hashcat','crack-hash.netntlmv1-john','crack-hash.netntlmv1-hashcat','crack-hash.netntlmv1-cracksh','crack-hash.netntlmv2-john','crack-hash.netntlmv2-hashcat','crack-hash.tgs-rc4-john','crack-hash.tgs-rc4-hashcat','crack-hash.tgs-aes128-hashcat','crack-hash.asrep-hashcat','crack-hash.mscache2-hashcat','crack-hash.timeroast-hashcat'];
const modeled=delivered.filter(x=>x!=='crack-hash.netntlmv1-cracksh');
const superseded=['crack-hash.netntlmv1-cracksh'];
const inherited=['crack-hash.pxe-sccm-aes128'];
const fileInventoryQueue=['low_hanging.md','persistence.md','dom_admin.md','know_vuln_auth.md','trusts.md','valid_user.md'];
root.OBOL_PROJECT_V82={
 version:'8.2.0',release:'v8.2',canonicalChange:false,
 phase:{id:'whole-file-source-inventory',title:'Orange whole-file source inventory',statement:'Canonical breadth and the frozen v6.2 source-depth baseline remain complete. crack_hash.md is now fully atomized, leaving six methodology-bearing Orange files for whole-file inventory.',next:'Continue with low_hanging.md, then persistence.md, dom_admin.md, know_vuln_auth.md, trusts.md, and valid_user.md.'},
 releaseMilestone:{release:'v8.2',implemented:127,partial:0,gap:0,stale:0,coveragePct:100,representedPct:100,label:'crack_hash.md source inventory complete'},
 sourceWave:{fidelityBefore:211,fidelityAfter:226,fidelityTotal:226,filesAtomizedBefore:10,filesAtomizedAfter:11,baselinesAtomizedBefore:34,baselinesAtomizedAfter:34,delivered,modeled,superseded,inherited,canonicalAdvanced:[],fileAtomized:'crack_hash.md',fileInventoryQueue,sourceCorrections:['crack-hash.netntlmv1-hashcat']}
};
})(typeof window!=='undefined'?window:globalThis);
