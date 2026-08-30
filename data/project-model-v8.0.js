// Obol v8.0 project metadata — complete the frozen v6.2 source-depth baseline.
(function(root){
'use strict';
const delivered=['crack-hash.pxe-sccm-aes128','low-hanging.zerologon-check','low-hanging.zerologon-reset','persistence.add-da-membership'];
const fileInventoryQueue=['low_access.md','crack_hash.md','low_hanging.md','persistence.md','dom_admin.md','know_vuln_auth.md','trusts.md','valid_user.md'];
root.OBOL_PROJECT_V80={
 version:'8.0.0',release:'v8.0',canonicalChange:true,
 phase:{id:'whole-file-source-inventory',title:'Orange whole-file source inventory',statement:'All 34 frozen v6.2 partial baselines are now decomposed and fidelity-complete. The next phase inventories the eight methodology-bearing Orange files that are not yet fully atomized.',next:'Finish the remaining low_access.md branches first, then continue whole-file inventory across crack_hash.md, low_hanging.md, persistence.md, dom_admin.md, know_vuln_auth.md, trusts.md, and valid_user.md.'},
 releaseMilestone:{release:'v8.0',implemented:127,partial:0,gap:0,stale:0,coveragePct:100,representedPct:100,label:'Frozen source-depth baseline complete'},
 sourceWave:{fidelityBefore:190,fidelityAfter:194,fidelityTotal:194,filesAtomizedBefore:9,filesAtomizedAfter:9,baselinesAtomizedBefore:31,baselinesAtomizedAfter:34,delivered,modeled:['crack-hash.pxe-sccm-aes128','low-hanging.zerologon-check','persistence.add-da-membership'],superseded:['low-hanging.zerologon-reset'],canonicalAdvanced:['crack_hash.pxe','low_hanging.zerologon','persistence.add-da'],fileInventoryQueue}
};
})(typeof window!=='undefined'?window:globalThis);
