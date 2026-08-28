// Obol v5.2 dashboard metadata — delivery-ready canonical accounting and build-next prioritization.
(function(root){
'use strict';
root.OBOL_DASHBOARD_V52={
  version:'5.2.0',
  releaseMilestone:{release:'v5.2',coveragePct:41,representedPct:80,label:'delivery-ready canonical accounting + build-next queue'},
  readinessDimensions:[
    {id:'run',label:'Runnable command contract'},
    {id:'evidence',label:'Explicit Evidence profile'},
    {id:'execution',label:'Explicit execution-side metadata'},
    {id:'report',label:'Reporting traceability'}
  ],
  buildNextPolicy:[
    'Repair implemented canonical sections that lack any delivery-ready mapped workflow before expanding completion.',
    'Then close remaining mapped-workflow delivery debt.',
    'Only then take additional canonical gaps forward with the full Run → Evidence → execution → report contract.'
  ]
};
})(typeof window!=='undefined'?window:globalThis);
