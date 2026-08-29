// Obol v7.0 project metadata — finish AD CS certificate-mapping fidelity and move Build Next into source inventory.
(function(root){
'use strict';
root.OBOL_PROJECT_V70={
  version:'7.0.0',
  release:'v7.0',
  canonicalChange:true,
  phase:{
    id:'source-inventory-decomposition',
    title:'Orange source inventory and decomposition',
    statement:'All 19 already-inventoried AD CS atomic units are now fidelity-complete. The next quality-first phase returns to the frozen v6.2 source-depth backlog and decomposes the remaining broad partial baselines into meaningful atomic source units.',
    next:'Decompose the highest-priority remaining Orange source-depth baselines, beginning with Kerberos delegation, while preserving zero quality debt and zero canonical gaps.'
  },
  releaseMilestone:{
    release:'v7.0',implemented:100,partial:27,gap:0,stale:0,coveragePct:79,representedPct:100,
    label:'AD CS certificate-mapping fidelity completion'
  },
  sourceWave:{
    fidelityBefore:14,
    fidelityAfter:19,
    fidelityTotal:19,
    delivered:['adcs.mapping-shadow','adcs.esc9','adcs.esc10-case1','adcs.esc10-case2','adcs.esc14'],
    modeled:['adcs.mapping-shadow','adcs.esc9','adcs.esc10-case1','adcs.esc10-case2'],
    superseded:['adcs.esc14'],
    canonicalAdvanced:['adcs.certificate-mapping']
  }
};
})(typeof window!=='undefined'?window:globalThis);
