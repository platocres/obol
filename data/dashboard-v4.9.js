// Obol v4.9 dashboard metadata — one maintainable source for project-wide North Star health categories and historical milestones.
(function(root){
'use strict';
const CATEGORIES=[
 {id:'methodology',label:'Orange methodology',description:'Canonical Orange 2025.03 sections fully implemented and represented.'},
 {id:'operator-loop',label:'Run / Evidence loop',description:'Orange-mapped cards with runnable methodology and explicit Evidence profiles.'},
 {id:'execution',label:'Execution context',description:'Orange-mapped commands with explicit Kali, Windows, target-local, or neutral execution metadata.'},
 {id:'decision-path',label:'Next Steps path',description:'Orange-mapped cards connected to the bounded decision-stage model used by Next Steps.'},
 {id:'reporting',label:'Reporting traceability',description:'Orange-mapped cards traceable through historical activity, Evidence, proof readiness, and generated reporting.'},
 {id:'tool-review',label:'Tool review',description:'Structured keep / supplement / replace / review decisions recorded for the audited Orange tool registry.'}
];
const MILESTONES=[
 {release:'v4.2',implemented:25,partial:39,gap:62,stale:1,coveragePct:20,representedPct:50,label:'canonical denominator established'},
 {release:'v4.3',implemented:42,partial:39,gap:46,stale:0,coveragePct:33,representedPct:64,label:'canonical reconciliation'},
 {release:'v4.6',implemented:48,partial:45,gap:34,stale:0,coveragePct:38,representedPct:73,label:'SCCM branch depth'},
 {release:'v4.8',implemented:52,partial:49,gap:26,stale:0,coveragePct:41,representedPct:80,label:'domain persistence depth'}
];
root.OBOL_DASHBOARD_V49={version:'4.9.0',categories:CATEGORIES,milestones:MILESTONES,source:'v4.8 README single-dashboard hard-number requirement'};
})(typeof window!=='undefined'?window:globalThis);
