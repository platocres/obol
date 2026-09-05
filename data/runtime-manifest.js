'use strict';
(function(root,factory){
 const manifest=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=manifest;
 if(root)root.OBOL_RUNTIME_MANIFEST=manifest;
})(typeof window!=='undefined'?window:globalThis,function(){
const seq=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
const vr=(prefix,major,minors,suffix)=>minors.map(m=>prefix+major+'.'+m+suffix);
const freeze=a=>Object.freeze(a.slice());

const historicalStyles=[
 'assets/obol.css','assets/obol-v2.css',
 ...vr('assets/obol-v',2,seq(1,9),'.css'),
 ...vr('assets/obol-v',3,seq(0,9),'.css'),
 ...vr('assets/obol-v',4,seq(0,9),'.css'),
 ...vr('assets/obol-v',5,seq(0,9),'.css'),
 ...vr('assets/obol-v',6,[0,1,2,4,5,6,7,8,9],'.css'),
 ...vr('assets/obol-v',7,seq(0,9),'.css'),
 ...vr('assets/obol-v',8,seq(0,8),'.css')
];
const styles=['assets/obol-current.css'];
const styleCurrent=Object.freeze({
 owner:'assets/obol-current.css',
 strategy:'semantic-cascade-snapshot',
 sourceRelease:'v9.45',
 historicalFragments:freeze(historicalStyles),
 generator:'tools/sync-current-styles.js',
 equivalenceValidator:'tools/validate-style-current-equivalence.js',
 visualEquivalenceValidator:'tools/validate-style-visual-equivalence.js'
});

const domain=[
 'data/lanes.js','data/methodology-v2.2.js','data/methodology-v2.3.js','data/methodology-v2.5.js','data/tools-v2.2.js',
 'data/methodology-v3.3.js','data/methodology-v3.4.js','data/methodology-v3.6.js','data/methodology-v4.1.js','data/orange-ad-2025.03.js',
 'data/methodology-v4.3.js','data/methodology-v4.4.js','data/methodology-v4.5.js','data/methodology-v4.6.js','data/methodology-v4.7.js','data/methodology-v4.8.js',
 'data/dashboard-v4.9.js','data/dashboard-v5.0.js','data/dashboard-v5.1.js','data/dashboard-v5.2.js'
];
for(const v of ['5.3','5.4','5.5','5.6','5.7','5.8','5.9','6.0','6.1','6.2']){
 domain.push('data/methodology-v'+v+'.js','data/dashboard-v'+v+'.js');
}
domain.push(
 'data/orange-fidelity-v6.4.js','data/methodology-v6.4.js','data/dashboard-v6.4.js',
 'data/orange-fidelity-v6.5.js','data/methodology-v6.5.js','data/source-delivery-v6.5.js','data/dashboard-v6.5.js',
 'data/project-model-v6.6.js'
);
for(const v of ['6.7','6.8','6.9','7.0','7.1']){
 domain.push('data/orange-fidelity-v'+v+'.js','data/methodology-v'+v+'.js','data/project-model-v'+v+'.js');
}
for(const v of ['7.2','7.3']){
 domain.push('data/orange-fidelity-v'+v+'.js','data/methodology-v'+v+'.js','data/source-delivery-v'+v+'.js','data/project-model-v'+v+'.js');
}
for(const major of [7,8]){
 const minors=major===7?seq(4,9):seq(0,8);
 for(const minor of minors){
  const v=major+'.'+minor;
  domain.push('data/orange-fidelity-v'+v+'.js','data/methodology-v'+v+'.js','data/project-model-v'+v+'.js');
 }
}
const historicalNodeData=freeze(domain);
const dashboardDataPattern=/^data\/dashboard-v[\d.]+\.js$/;
const nodeData=freeze(['data/dashboard-compat-current.js',...historicalNodeData.filter(src=>!dashboardDataPattern.test(src))]);
domain.push('data/lanes-notes.js','data/wordlists.js','data/scripts.js','data/scripts-v2.5.js','data/reportmeta.js','data/signatures.js');

const vendor=['assets/jszip.min.js','assets/bh.js'];
const core=[
 'assets/core-v2-base.js','assets/core-v2.js',
 ...vr('assets/core-v',2,seq(1,9),'.js'),
 ...vr('assets/core-v',3,seq(0,9),'.js'),
 ...vr('assets/core-v',4,seq(0,9),'.js'),
 ...vr('assets/core-v',5,seq(0,9),'.js'),
 ...vr('assets/core-v',6,[0,1,2,4,5,6,7,8,9],'.js'),
 ...vr('assets/core-v',7,seq(0,9),'.js'),
 ...vr('assets/core-v',8,seq(0,8),'.js')
];
const nmap=['assets/nmap-v2.js','assets/nmap-v2.3.js','assets/nmap-v3.1.js'];
const report=[
 'assets/report-v2.js',...vr('assets/report-v',2,seq(1,9),'.js'),
 'assets/report-v3.5.js','assets/report-v4.0.js','assets/report-v4.7.js','assets/report-v4.8.js','assets/report-v5.0.js'
];
const appPrelude=['assets/bh-v2-patch.js','assets/app-v2-base.js','assets/app-v2-cards.js','assets/app-v2-intake.js'];
const intake=['2.1','2.2','2.3','2.5','2.6','2.7','3.5','3.6','3.9','4.5','4.6','4.8','5.3','5.4','5.5','5.6','5.7','5.8','5.9','6.0','6.1','6.2','6.4','6.5','6.7','6.8','6.9','7.0','7.1','7.2','7.3','7.4','7.5','7.6','7.7','7.8','7.9','8.2'].map(v=>'assets/intake-v'+v+'.js');
const app=[
 'assets/app-v2-boxes.js','assets/app-v2-tools.js','assets/app-v2-views.js','assets/app-v2-main.js',
 ...vr('assets/app-v',2,[1,2,3],'.js'),'assets/app-v2.4.js','assets/app-v2.4-route.js',
 ...vr('assets/app-v',2,[5,6,7],'.js'),'assets/review-v2.7.js',...vr('assets/app-v',2,[8,9],'.js'),
 ...vr('assets/app-v',3,[0,1,2,3,4],'.js'),'assets/app-v3.5.js','assets/app-v3.5-runtime.js',...vr('assets/app-v',3,[6,7,8,9],'.js'),
 ...vr('assets/app-v',4,seq(0,9),'.js'),...vr('assets/app-v',5,seq(0,9),'.js'),
 ...vr('assets/app-v',6,[0,1,2,4,5,6,7,8,9],'.js'),...vr('assets/app-v',7,seq(0,9),'.js'),...vr('assets/app-v',8,seq(0,8),'.js')
];

const scripts=[...domain,...vendor,...core,...nmap,...report,...appPrelude,...intake,...app];
const startupPreludeScripts=freeze(['data/dashboard-compat-current.js']);
const currentScripts=freeze(['assets/dashboard-route-current.js']);
const historicalDashboardData=freeze(domain.filter(src=>dashboardDataPattern.test(src)));
const retiredDashboardPresentation=freeze([
 ...vr('assets/app-v',5,seq(1,9),'.js'),
 ...vr('assets/app-v',6,[0,1,2,4,5],'.js')
]);
/* v9.43 application-area retirement. Each of these overlays gates its entire
   contribution on a stale workspace/runtime schema identity (`C.VERSION`), which
   has been 8.8.0 since v8.8. Their decorators therefore return before touching the
   DOM, leaving only a pass-through `route` wrapper and schedules of that
   short-circuited decorator. tools/validate-app-current-equivalence.js re-derives
   that inertness from source, and tools/validate-app-dom-equivalence.js proves it
   in a browser. assets/app-v8.8.js is deliberately excluded: it is the one overlay
   whose gate matches the live identity. */
const retiredReleaseWaveOverlays=freeze([
 ...vr('assets/app-v',6,[7,8,9],'.js'),
 ...vr('assets/app-v',7,seq(0,9),'.js'),
 ...vr('assets/app-v',8,seq(0,7),'.js')
]);
const groups=Object.freeze({domain:freeze(domain),vendor:freeze(vendor),core:freeze(core),nmap:freeze(nmap),report:freeze(report),appPrelude:freeze(appPrelude),intake:freeze(intake),app:freeze(app)});
/* v9.44 Evidence-parsing retirement. The Intake chain is a decorator chain: every
   overlay reads the analyzeTerminal already published on an earlier OBOL_INTAKE_*
   global, wraps it, and writes the wrapper back. These four hook a predecessor that
   never publishes analyzeTerminal — v7.6 and its peers publish helpers only and
   decorate OBOL_INTAKE_V21 — so each returns at its own guard, publishes nothing,
   and breaks the next link in turn. They cannot execute in any load order the
   runtime produces. tools/validate-evidence-current-equivalence.js re-derives that
   reachability from source and proves the retirement changes nothing observable.
   The behavior they were written to add is not silently dropped: it is queued as
   cc-evidence-chain-restore. */
const retiredEvidenceOverlays=freeze(['assets/intake-v7.7.js','assets/intake-v7.8.js','assets/intake-v7.9.js','assets/intake-v8.2.js']);
const liveIntake=freeze(intake.filter(src=>!retiredEvidenceOverlays.includes(src)));

const lazy=Object.freeze({
 productHardening:freeze(['data/runtime-consolidation-current.js','data/current-release.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/note-integration.js','data/note-integration-reviews.js','data/note-integration-packets.js','data/product-hardening/note-progress-current.js','data/product-hardening/xss-session-remining-v9.57.js','data/product-hardening/notes-impact-current.js','assets/product-hardening-dashboard.css','assets/product-hardening-dashboard.js','assets/workflow-current.js','assets/operator-route-current.css','assets/operator-route-current.js']),
 accessibility:freeze(['assets/accessibility.css','assets/accessibility.js']),
 evidenceParsing:freeze([...vendor,'assets/bh-v2-patch.js',...liveIntake]),
 evidenceRestore:freeze(['assets/intake-evidence-restore.js']),
 nmap:freeze(nmap),
 reportOverlays:freeze(report.slice(1)),
 toolReferenceData:freeze(['data/wordlists.js','data/scripts.js','data/scripts-v2.5.js'])
});
const deferredScriptGroups=freeze(['evidenceParsing','nmap','reportOverlays','toolReferenceData']);
const deferredScriptSet=new Set(deferredScriptGroups.flatMap(name=>lazy[name]||[]));
const retiredStartupScripts=freeze([...historicalDashboardData,...retiredDashboardPresentation,...retiredReleaseWaveOverlays]);
/* Retirement is per ownership area, not per loading tier. Dashboard data, dashboard
   presentation, and the stale-gated release-wave overlays left operator startup;
   the unreachable Intake overlays left a route-lazy group. Both kinds are gone from
   the live runtime and both stay in the frozen ledger, so the consolidation
   projection counts them together. */
const retiredScripts=freeze([...retiredStartupScripts,...retiredEvidenceOverlays]);
const retiredSet=new Set(retiredScripts);
const liveHistoricalStartup=freeze(scripts.filter(src=>!deferredScriptSet.has(src)&&!retiredSet.has(src)));
const startupScripts=liveHistoricalStartup;
const routeLazy=Object.freeze({
 home:freeze([]),
 boxes:freeze(['nmap']),
 intake:freeze(['nmap','evidenceParsing','evidenceRestore']),
 artifacts:freeze(['nmap','evidenceParsing','evidenceRestore']),
 tools:freeze(['toolReferenceData']),
 report:freeze(['reportOverlays']),
 dashboard:freeze([]),
 map:freeze([]),
 lanes:freeze([]),
 card:freeze([]),
 path:freeze([]),
 lineage:freeze([]),
 search:freeze([])
});
const surfacePolicy=Object.freeze({
 dashboard:Object.freeze({policy:'current-owner+retired-historical-data-and-presentation+route-lazy-data',owner:'assets/dashboard-route-current.js',compatibilityMetadataOwner:'data/dashboard-compat-current.js',reason:'The stable current route owner prevents historical paint. Versioned dashboard data owners and proven dashboard-only presentation overlays remain only in the frozen historical ledger; one data-only compatibility seam supplies the minimal metadata still consumed by historical core overlays on non-Dashboard routes.'}),
 operatorRoutes:Object.freeze({policy:'semantic-current-application+current-route-owners',owner:'assets/operator-route-current.js',reason:'v9.47 gives the application layer one stable current router. The surviving historical rendering deltas remain only as the frozen semantic ledger compiled into assets/obol-app-current.js; their timers, hashchange listeners, intervals, and MutationObservers no longer run autonomously. Current workflow/operator owners commit visible presentation last.'}),
 methodology:Object.freeze({policy:'semantic-current-owner-eager',owner:'assets/obol-domain-current.js',reason:'Methodology data drives Home and Next Steps ranking, so the semantic current-domain owner remains eager while the 103 versioned sources are retained only as the equivalence ledger.'}),
 toolLibrary:Object.freeze({policy:'route-lazy',owner:'toolReferenceData',reason:'Wordlist and script reference payloads are route-local and load when Tools is opened.'}),
 lineage:Object.freeze({policy:'shared-core-eager',owner:'core/app',reason:'Artifact and activity lineage participates in Evidence, recommendation, and reporting semantics across primary workflow routes.'}),
 historical:Object.freeze({policy:'compatibility-selective',owner:'scripts',reason:'The frozen historical script ledger remains available for fixtures/regression. Dashboard data/presentation owners, stale-gated release-wave application overlays, unreachable Evidence parser overlays, and the domain and core fragment chains no longer execute directly. The application area is semantically current-owned as of v9.47: its 43 surviving historical rendering deltas remain traceable in the frozen ledger but no longer execute as autonomous browser layers. v9.43 remains the request/stale-overlay retirement milestone and v9.46 remains the first-paint barrier milestone.'}),
 evidence:Object.freeze({policy:'route-lazy+retired-unreachable-overlays',owner:'evidenceParsing',reason:'BloodHound helpers and the versioned Evidence parser overlays that still reach the decorator chain load when Evidence/Artifacts is opened. Four overlays that hook a predecessor global which never publishes analyzeTerminal are retired to the frozen ledger; conservative interpretation and proof boundaries are unchanged.'}),
 report:Object.freeze({policy:'route-lazy',owner:'reportOverlays',reason:'The stable base report owner stays eager; historical report overlays load on Report.'})
});
const bundleAreaGroups=Object.freeze({domain:['domain','vendor'],core:['core'],app:['report','appPrelude','intake','nmap','app']});
const bundleAreaOwner=new Map();
for(const area of Object.keys(bundleAreaGroups))for(const name of bundleAreaGroups[area])for(const src of groups[name])bundleAreaOwner.set(src,area);
const bundleSeparator='\n;\n';
const startupBundleDefs=[
 ['domain','assets/obol-domain-current.js','Domain data','Lane, methodology, Orange source-fidelity, project-model, report-metadata, and signature owners.','semantic-snapshot'],
 ['core','assets/obol-core-current.js','Core state and derivation','Browser-local state, migrations, proof boundaries, applicability, ranking, progress, and report readiness.','semantic-delta-replay'],
 ['app','assets/obol-app-current.js','Report base and application UI','Base report owner, application prelude, and historical workflow/UI semantic deltas.','semantic-delta-replay']
];
const lazyBundleDefs=[
 ['evidenceParsing','assets/obol-evidence-current.js','Evidence parsing','BloodHound helpers and historical Evidence parser overlays.'],
 ['nmap','assets/obol-nmap-current.js','Nmap builders','Historical Nmap command-builder overlays.'],
 ['reportOverlays','assets/obol-report-overlays-current.js','Report overlays','Historical report generation overlays.'],
 ['toolReferenceData','assets/obol-tool-reference-current.js','Tool reference data','Wordlist and script reference payloads.']
];
const bundleAreas=freeze([
 ...startupBundleDefs.map(([id,owner,label,description,strategy])=>Object.freeze({
  id,scope:'startup',owner,label,description,strategy,
  fragments:freeze(liveHistoricalStartup.filter(src=>bundleAreaOwner.get(src)===id))
 })),
 ...lazyBundleDefs.map(([id,owner,label,description])=>Object.freeze({
  id,scope:'lazy',owner,label,description,strategy:'ordered-fragment-concatenation',
  fragments:freeze(lazy[id]||[])
 }))
]);
const startupBundleScripts=freeze(bundleAreas.filter(area=>area.scope==='startup').map(area=>area.owner));
const lazyBundles=Object.freeze(Object.fromEntries(bundleAreas.filter(area=>area.scope==='lazy').map(area=>[area.id,area.owner])));
const bundleFragments=Object.freeze(Object.fromEntries(bundleAreas.map(area=>[area.owner,area.fragments])));
const bundles=Object.freeze({
 schema:'per-area-current-owner',
 separator:bundleSeparator,
 generator:'tools/sync-runtime-bundles.js',
 areas:bundleAreas,
 owners:freeze(bundleAreas.map(area=>area.owner)),
 fragments:bundleFragments,
 startup:startupBundleScripts,
 lazy:lazyBundles
});
const domainCurrent=Object.freeze({
 owner:'assets/obol-domain-current.js',
 strategy:'semantic-snapshot',
 sourceRelease:'v9.40',
 historicalFragments:bundleAreas.find(area=>area.id==='domain').fragments,
 generator:'tools/sync-domain-current.js',
 equivalenceValidator:'tools/validate-domain-current-equivalence.js'
});
/* v9.47 application semantic retirement. v9.43 proved which release-wave overlays were
   inert and reduced the surviving ledger to 43 load-bearing fragments; v9.46 added a
   first-paint barrier. v9.47 changes execution ownership: the surviving rendering
   deltas are generated into one stable current router, historical scheduler/listener
   side effects are suppressed, and current workflow/operator owners commit last. */
const appCurrent=Object.freeze({
 owner:'assets/obol-app-current.js',
 strategy:'semantic-delta-replay',
 sourceRelease:'v9.47',
 requestRetirementRelease:'v9.43',
 firstPaintRelease:'v9.46',
 historicalFragments:bundleAreas.find(area=>area.id==='app').fragments,
 retiredFragments:retiredReleaseWaveOverlays,
 retirementGate:'C.VERSION',
 retirementGateValue:'8.8.0',
 retainedGateOwner:'assets/app-v8.8.js',
 generator:'tools/sync-app-current.js',
 semanticValidator:'tools/validate-app-semantic-current.js',
 equivalenceValidator:'tools/validate-app-current-equivalence.js',
 domEquivalenceValidator:'tools/validate-app-dom-equivalence.js'
});
const coreCurrent=Object.freeze({
 owner:'assets/obol-core-current.js',
 strategy:'semantic-delta-replay',
 sourceRelease:'v9.41',
 historicalFragments:bundleAreas.find(area=>area.id==='core').fragments,
 generator:'tools/sync-core-current.js',
 equivalenceValidator:'tools/validate-core-current-equivalence.js'
});
/* The Evidence area stays an exact ordered concatenation of the fragments that can
   still reach the decorator chain. v9.44 flattened it the same way v9.43 flattened
   the application area — by proving supersession rather than re-authoring parser
   code — so conservative interpretation, proof boundaries, and report lineage are
   untouched. The retirement gate is reachability: an overlay whose hook target never
   publishes analyzeTerminal returns at its guard and publishes nothing. */
const evidenceCurrent=Object.freeze({
 owner:'assets/obol-evidence-current.js',
 strategy:'ordered-fragment-concatenation',
 sourceRelease:'v9.44',
 historicalFragments:bundleAreas.find(area=>area.id==='evidenceParsing').fragments,
 retiredFragments:retiredEvidenceOverlays,
 retirementGate:'analyzeTerminal',
 chainEntryOwner:'OBOL_INTAKE_V21',
 lastReachableOverlay:'assets/intake-v7.6.js',
 generator:'tools/sync-runtime-bundles.js',
 equivalenceValidator:'tools/validate-evidence-current-equivalence.js',
 restorationItem:'cc-evidence-chain-restore'
});
/* v9.48 Evidence-chain restoration. The four overlays v9.44 retired stay dead in the
   frozen ledger; the conservative Evidence they were written to add is re-homed here
   onto the live OBOL_INTAKE_V21 decorator chain. This stable current owner is NOT a
   frozen historical fragment and is NOT part of the exact-concatenation Evidence
   bundle — it is a route-lazy current decorator loaded after the Evidence bundle on
   the Evidence/Artifacts routes, so it wraps the fully-assembled analyzeTerminal last.
   Its equivalence is proven by re-running the same reachability/differential harness
   the retirement uses. */
const evidenceRestore=Object.freeze({
 owner:'assets/intake-evidence-restore.js',
 strategy:'live-current-decorator',
 sourceRelease:'v9.48',
 hookTarget:'OBOL_INTAKE_V21',
 restorationItem:'cc-evidence-chain-restore',
 rehomedOverlays:retiredEvidenceOverlays,
 loadsAfter:'evidenceParsing',
 routes:freeze(['intake','artifacts']),
 lazyGroup:'evidenceRestore',
 marker:'__OBOL_EVIDENCE_RESTORE__',
 equivalenceValidator:'tools/validate-evidence-current-equivalence.js'
});

const performance=Object.freeze({
 baseline:Object.freeze({historicalScripts:327,historicalStyles:69}),
 startup:Object.freeze({historicalScripts:liveHistoricalStartup.length,compatibilityPreludeScripts:startupPreludeScripts.length,totalScripts:startupPreludeScripts.length+liveHistoricalStartup.length,consolidatedStartupRequests:startupPreludeScripts.length+startupBundleScripts.length,startupBundles:startupBundleScripts.length,currentOwnerScripts:currentScripts.length,maxHistoricalScripts:215,minDeferredHistoricalScripts:61,retiredDashboardDataScripts:historicalDashboardData.length,retiredDashboardPresentationScripts:retiredDashboardPresentation.length,retiredReleaseWaveScripts:retiredReleaseWaveOverlays.length,retiredEvidenceOverlayScripts:retiredEvidenceOverlays.length}),
 styleRequests:Object.freeze({currentOwner:1,historicalFragments:historicalStyles.length}),
 consolidation:Object.freeze({bundleAreas:bundleAreas.length,startupAreas:startupBundleScripts.length,lazyAreas:bundleAreas.length-startupBundleScripts.length,consolidatedFragments:bundleAreas.reduce((n,area)=>n+area.fragments.length,0)}),
 requiredDeferredGroups:deferredScriptGroups
});

return Object.freeze({
 schemaVersion:'1.13.0',
 styles:freeze(styles),
 styleCurrent,
 scripts:freeze(scripts),
 startupPreludeScripts,
 historicalStartupScripts:liveHistoricalStartup,
 startupScripts,
 currentScripts,
 historicalDashboardData,
 retiredDashboardPresentation,
 retiredReleaseWaveOverlays,
 retiredEvidenceOverlays,
 retiredStartupScripts,
 retiredRouteLazyScripts:retiredEvidenceOverlays,
 retiredScripts,
 groups,
 node:Object.freeze({data:freeze(['data/dashboard-compat-current.js',domainCurrent.owner]),historicalData:historicalNodeData,core:freeze([coreCurrent.owner]),historicalCore:groups.core}),
 lazy,
 bundles,
 domainCurrent,
 coreCurrent,
 appCurrent,
 evidenceCurrent,
 evidenceRestore,
 startupBundleScripts,
 lazyBundles,
 deferredScriptGroups,
 routeLazy,
 surfacePolicy,
 performance,
 compatibility:Object.freeze({
 baselineRelease:'v9.5',
  strategy:'domain-core-app-semantic-equivalence+script-exact-ledger+style-cascade-equivalence',
  consolidation:'semantic-domain-snapshot+semantic-core-delta-replay+semantic-app-delta-replay+ordered-fragment-concatenation',
  fixture:'tests/fixtures/runtime-v9.5-load-order.json',
  styleOwner:'assets/obol-current.css',
  historicalStyles:freeze(historicalStyles)
 })
});
});