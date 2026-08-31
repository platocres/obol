// Obol v8.8 project metadata — pinned Orange 2025.03 whole-file source inventory complete.
(function(root){
'use strict';
const delivered=['valid-user.policy-nxc','valid-user.policy-addefault','valid-user.policy-ldeep','valid-user.fgpp-ldapsearch-ad','valid-user.fgpp-powershell','valid-user.fgpp-ldeep','valid-user.user-equals-password-nxc','valid-user.user-equals-password-sprayhound','valid-user.usual-password-nxc','valid-user.usual-password-sprayhound','valid-user.usual-password-kerbrute','valid-user.asrep-list-bloodhound','valid-user.asrep-getnpusers','valid-user.asrep-nxc','valid-user.asrep-rubeus','valid-user.blind-kerberoast-rubeus','valid-user.blind-kerberoast-impacket','valid-user.cve-2022-33679'];
const superseded=['valid-user.policy-addefault','valid-user.policy-ldeep','valid-user.fgpp-ldapsearch-ad','valid-user.fgpp-powershell','valid-user.fgpp-ldeep','valid-user.usual-password-kerbrute','valid-user.blind-kerberoast-rubeus','valid-user.blind-kerberoast-impacket','valid-user.cve-2022-33679'];
const modeled=delivered.filter(x=>!superseded.includes(x));
root.OBOL_PROJECT_V88={
 version:'8.8.0',release:'v8.8',canonicalChange:false,
 phase:{id:'orange-source-fidelity-complete',title:'Orange source fidelity complete',statement:'Canonical breadth, the frozen v6.2 source-depth baseline, whole-file source inventory, and all currently inventoried atomic audits are complete for the pinned Orange 2025.03 methodology-bearing source set.',next:'Preserve the completed source snapshot and move future work to regression-equivalent runtime compaction, UX refinement, or a deliberately repinned upstream methodology snapshot.'},
 releaseMilestone:{release:'v8.8',implemented:127,partial:0,gap:0,stale:0,coveragePct:100,representedPct:100,label:'Orange source inventory and fidelity complete'},
 sourceWave:{fidelityBefore:316,fidelityAfter:334,fidelityTotal:334,filesAtomizedBefore:16,filesAtomizedAfter:17,baselinesAtomizedBefore:34,baselinesAtomizedAfter:34,delivered,modeled,superseded,canonicalAdvanced:[],fileAtomized:'valid_user.md',fileInventoryQueue:[],sourceCorrections:['valid-user.fgpp-powershell','valid-user.asrep-getnpusers','valid-user.blind-kerberoast-rubeus','valid-user.blind-kerberoast-impacket','valid-user.cve-2022-33679'],sourceInventoryComplete:true,sourceFidelityComplete:true}
};
})(typeof window!=='undefined'?window:globalThis);
