// Obol v5.4 dashboard metadata — README queue synchronization plus canonical persistence completion wave.
(function(root){
'use strict';
root.OBOL_DASHBOARD_V54={
 version:'5.4.0',
 releaseMilestone:{release:'v5.4',implemented:57,partial:44,gap:26,stale:0,coveragePct:45,representedPct:80,label:'README queue sync + persistence completion wave'},
 source:'v5.3 Build next priorities plus generated README queue synchronization',
 sync:{readmeMarkers:['<!-- OBOL-BUILD-NEXT:START -->','<!-- OBOL-BUILD-NEXT:END -->'],script:'tools/sync-readme-build-next.js',ciCheck:'node tools/sync-readme-build-next.js --check'},
 completedCanonical:['persistence.skeleton-key','persistence.custom-ssp','persistence.diamond-ticket','persistence.sapphire-ticket','persistence.dc-shadow']
};
})(typeof window!=='undefined'?window:globalThis);
