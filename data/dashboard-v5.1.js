// Obol v5.1 dashboard quality / drill-down metadata.
(function(root){
'use strict';
root.OBOL_DASHBOARD_V51={
  version:'5.1.0',
  releaseMilestone:{release:'v5.1',coveragePct:41,representedPct:80,label:'dashboard drill-down + delivery debt visibility'},
  qualityDimensions:[
    {id:'run',label:'Runnable command contract'},
    {id:'evidence',label:'Explicit Evidence profile'},
    {id:'execution',label:'Explicit execution-side metadata'},
    {id:'report',label:'Reporting traceability'}
  ]
};
})(typeof window!=='undefined'?window:globalThis);
