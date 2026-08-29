// Obol v7.1 project metadata — complete Kerberos delegation source decomposition and fidelity.
(function(root){
'use strict';
root.OBOL_PROJECT_V71={
  version:'7.1.0',
  release:'v7.1',
  canonicalChange:true,
  phase:{
    id:'source-inventory-decomposition',
    title:'Orange source inventory and decomposition',
    statement:'The pinned delegation.md source family is now atomized and fidelity-complete. The quality-first queue continues through the remaining frozen v6.2 source-depth baselines, beginning with ACL / ACE control paths.',
    next:'Decompose the highest-priority remaining ACL source-depth baselines while preserving zero quality debt, zero canonical gaps, and conservative engagement proof boundaries.'
  },
  releaseMilestone:{
    release:'v7.1',implemented:102,partial:25,gap:0,stale:0,coveragePct:80,representedPct:100,
    label:'Kerberos delegation source-depth completion'
  },
  sourceWave:{
    fidelityBefore:19,
    fidelityAfter:25,
    fidelityTotal:25,
    filesAtomizedBefore:1,
    filesAtomizedAfter:2,
    baselinesAtomizedBefore:7,
    baselinesAtomizedAfter:9,
    delivered:['delegation.find','delegation.unconstrained','delegation.constrained-pt','delegation.constrained-kerberos','delegation.rbcd','delegation.s4u2self'],
    modeled:['delegation.find','delegation.unconstrained','delegation.constrained-pt','delegation.constrained-kerberos','delegation.rbcd','delegation.s4u2self'],
    superseded:[],
    canonicalAdvanced:['delegation.unconstrained','delegation.constrained']
  }
};
})(typeof window!=='undefined'?window:globalThis);
