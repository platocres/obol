// Obol v6.6 project metadata — one current projection boundary for status consumers.
(function(root){
'use strict';
root.OBOL_PROJECT_V66={
  version:'6.6.0',
  release:'v6.6',
  canonicalChange:false,
  phase:{
    id:'architecture-consolidation',
    title:'Architecture consolidation',
    statement:'Project progress now has one current derived model. The default Dashboard is scan-friendly, documentation has clear owners, and current status consumers no longer maintain competing progress calculations.',
    next:'Resume the live Build Next queue from the consolidated project model, beginning with the highest-priority source-fidelity item.'
  },
  architecture:{
    authoritativeModel:'C.projectModel66',
    dashboard:'projection of current project model',
    readme:'projection of current project model',
    releaseContract:'delta-based release surfaces',
    legacyRuntime:'preserved behind regression coverage pending incremental compaction'
  },
  releaseMilestone:{
    release:'v6.6',implemented:95,partial:32,gap:0,stale:0,coveragePct:75,representedPct:100,
    label:'architecture and project-status consolidation'
  },
  docs:{
    architecture:'docs/ARCHITECTURE.md',
    northStar:'docs/NORTH-STAR.md',
    proof:'docs/PROOF-CONTRACT.md',
    sourceDepth:'docs/ORANGE-SOURCE-DEPTH.md',
    building:'BUILDING.md',
    changelog:'CHANGELOG.md'
  }
};
})(typeof window!=='undefined'?window:globalThis);
