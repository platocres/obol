// Obol v6.2 dashboard metadata — canonical breadth complete; source-depth phase begins.
(function(root){
'use strict';
root.OBOL_DASHBOARD_V62={
 version:'6.2.0',
 releaseMilestone:{release:'v6.2',implemented:93,partial:34,gap:0,stale:0,coveragePct:73,representedPct:100,label:'canonical breadth complete; source-depth phase begins'},
 source:'v6.1 generated Build Next queue',
 completedCanonical:['trusts.parent-child'],
 remainingCanonical:[],
 sourceDepthPhase:{
  title:'Canonical breadth is not source exhaustion',
  baseline:34,
  reviewed:0,
  statement:'Zero canonical gaps means every normalized Orange section is represented, not that every useful subordinate branch, tool choice, decision edge, failure condition, artifact handoff, GUI control, Evidence signature, and reporting implication has been mined.',
  plan:[
   'Freeze the v6.2 set of 34 partial canonical sections as a stable source-depth audit denominator.',
   'Audit the pinned Orange source beneath each partial section node by node, including alternate tools, prerequisites, branch conditions, failure states, artifacts, cleanup, Evidence, Next Steps, and reporting.',
   'Classify each audited source-depth item as modeled, intentionally superseded by a better Obol path, or rejected with an explicit reason.',
   'Do not inflate canonical completion from parser, UI, reporting, or metadata work alone.',
   'Drive the new source-depth queue from the North Star Dashboard and keep the README snapshot synchronized with it.'
  ],
  priorityFiles:['adcs.md','delegation.md','acl.md','mitm.md','authenticated.md','sccm.md','admin.md','no_creds.md','lat_move.md','low_access.md','crack_hash.md']
 }
};
})(typeof window!=='undefined'?window:globalThis);
