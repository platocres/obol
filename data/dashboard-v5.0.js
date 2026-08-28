// Obol v5.0 dashboard / information-architecture policy metadata.
(function(root){
'use strict';
root.OBOL_DASHBOARD_V50={
  version:'5.0.0',
  dashboardRoute:'#/dashboard',
  changelog:'CHANGELOG.md',
  allowedBrandRoutes:['dashboard','home'],
  policies:[
    {id:'single-dashboard',label:'Single project-health dashboard',detail:'Project-wide percentages and audit health live on one Dashboard route; Home may show a compact summary and link.'},
    {id:'small-primary-nav',label:'Five-item primary navigation',detail:'Home, Targets, Evidence, Next Steps, and Report remain the primary workflow.'},
    {id:'brand-scope',label:'North Star brand scope',detail:'Orange Cyber Defense branding is limited to Dashboard and the compact Home dashboard summary.'},
    {id:'current-version',label:'Current-version UI',detail:'Current surfaces use v5.0; historical release narrative belongs in CHANGELOG.md rather than the live Guide or README.'}
  ],
  releaseMilestone:{release:'v5.0',coveragePct:41,representedPct:80,label:'dashboard IA + changelog + UI hygiene'}
};
})(typeof window!=='undefined'?window:globalThis);
