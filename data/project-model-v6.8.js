// Obol v6.8 project metadata — close the AD CS template/ACL fidelity wave and advance source accounting.
(function(root){
'use strict';
root.OBOL_PROJECT_V68={
  version:'6.8.0',
  release:'v6.8',
  canonicalChange:true,
  phase:{
    id:'source-fidelity-delivery',
    title:'AD CS source-fidelity delivery',
    statement:'The next inventoried AD CS ACL units move from broad ownership to explicit end-to-end operator workflows, while broad canonical parents advance only when every inventoried subordinate unit is complete.',
    next:'Continue the remaining inventoried AD CS source-fidelity audits before returning to broad source inventory work.'
  },
  releaseMilestone:{
    release:'v6.8',implemented:97,partial:30,gap:0,stale:0,coveragePct:76,representedPct:100,
    label:'ESC4 and ESC7 atomic source-fidelity delivery'
  },
  sourceWave:{
    fidelityBefore:8,
    fidelityAfter:11,
    fidelityTotal:19,
    delivered:['adcs.esc4','adcs.esc7-manage-ca','adcs.esc7-manage-cert'],
    canonicalAdvanced:['adcs.template-misconfig','adcs.acl-misconfig']
  }
};
})(typeof window!=='undefined'?window:globalThis);
