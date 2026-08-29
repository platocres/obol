// Obol v6.9 project metadata — continue AD CS source-fidelity delivery through ESC5, ESC6, and ESC11.
(function(root){
'use strict';
root.OBOL_PROJECT_V69={
  version:'6.9.0',
  release:'v6.9',
  canonicalChange:true,
  phase:{
    id:'source-fidelity-delivery',
    title:'AD CS source-fidelity delivery',
    statement:'The next inventoried AD CS PKI-object and CA-misconfiguration units move from broad ownership to explicit end-to-end operator workflows, while broad canonical parents advance only when every inventoried subordinate unit is complete.',
    next:'Finish the remaining inventoried AD CS certificate-mapping source-fidelity audits before returning to broad source inventory work.'
  },
  releaseMilestone:{
    release:'v6.9',implemented:99,partial:28,gap:0,stale:0,coveragePct:78,representedPct:100,
    label:'ESC5, ESC6, and ESC11 atomic source-fidelity delivery'
  },
  sourceWave:{
    fidelityBefore:11,
    fidelityAfter:14,
    fidelityTotal:19,
    delivered:['adcs.esc5','adcs.esc6','adcs.esc11'],
    canonicalAdvanced:['adcs.pki-object-acl','adcs.ca-misconfig']
  }
};
})(typeof window!=='undefined'?window:globalThis);
