// Obol v6.6 dashboard metadata — compact overview backed by one current project model.
(function(root){
'use strict';
const previous=root.OBOL_DASHBOARD_V65;
if(!previous)throw new Error('Obol v6.5 dashboard metadata is required before dashboard-v6.6.js');
root.OBOL_DASHBOARD_V66={
  version:'6.6.0',
  releaseMilestone:{release:'v6.6',implemented:95,partial:32,gap:0,stale:0,coveragePct:75,representedPct:100,label:'architecture and project-status consolidation'},
  phase:{
    title:'Consolidated architecture',
    statement:'Project progress now has one current derived model. The default Dashboard is a scan-friendly overview; engineering diagnostics remain available as drill-downs.',
    next:'Continue the live Build Next queue after consolidation without creating parallel progress accounting.'
  },
  architecture:{
    authoritativeModel:'C.projectModel66',
    dashboard:'projection',
    readme:'projection',
    legacyRuntime:'preserved behind regression coverage pending incremental compaction'
  }
};
})(typeof window!=='undefined'?window:globalThis);
