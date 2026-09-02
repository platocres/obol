'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

const owner=read('assets/dashboard-route-current.js');
const standalone=read('product-hardening.html');
const smoke=read('tests/playwright-smoke.js');

const currentSources=[
  'data/current-release.js',
  'data/product-hardening/product-hardening-queue.js',
  'data/product-hardening/work-packages.js',
  'data/note-integration.js',
  'data/note-integration-reviews.js',
  'data/note-integration-packets.js',
  'data/product-hardening/note-progress-current.js',
  'data/product-hardening/notes-impact-current.js',
  'assets/product-hardening-dashboard.js'
];

for(const src of currentSources)assert(owner.includes("'"+src+"'"),'Dashboard freshness owner omits current source: '+src);
for(const token of [
  "const FRESH_QUERY='obol-dashboard'",
  'loadFreshStyle',
  'loadFreshScript',
  'refreshAssets',
  '__OBOL_CURRENT_DASHBOARD_FRESHNESS__',
  '__OBOL_CURRENT_DASHBOARD_ROUTE_INSTANCE__',
  'instanceCurrent',
  'obol-current=',
  'dataset.obolDashboardInstance=INSTANCE',
  'data-product-dashboard-owner="current-loading"'
])assert(owner.includes(token),'Dashboard freshness owner missing durable token: '+token);

assert(!owner.includes('if(sourceReady(src))return Promise.resolve()'),'Dashboard must not accept an already-present global as proof of freshness');
assert(/freshSelf\.src=OWNER\+'\?obol-current='/.test(owner),'stable Dashboard route owner must self-refresh through a cache-busted URL');
assert(/if\(!instanceCurrent\(\)\)return root\.__OBOL_CURRENT_DASHBOARD_FRESHNESS__\|\|null;/.test(owner),'superseded Dashboard owner instances must not publish a competing freshness generation');
assert(/root\.renderProductHardeningDashboard\(target,\{embedded:true,freshness\}\)/.test(owner),'embedded Dashboard render must receive freshness metadata');

for(const token of ['assets/dashboard-route-current.js?obol-current=','OBOL_CURRENT_DASHBOARD_ROUTE','refreshAssets()','dataset.dashboardRelease','dataset.dashboardFreshness'])assert(standalone.includes(token),'standalone Dashboard does not converge on current freshness owner: '+token);
for(const stale of [
  '<script src="data/current-release.js"></script>',
  '<script src="data/product-hardening/product-hardening-queue.js"></script>',
  '<script src="assets/product-hardening-dashboard.js"></script>',
  '<link rel="stylesheet" href="assets/product-hardening-dashboard.css">'
])assert(!standalone.includes(stale),'standalone Dashboard restored a second static current-asset stack: '+stale);

for(const token of [
  "window.OBOL_CURRENT_RELEASE = { version: '0.0.0'",
  'window.OBOL_PRODUCT_HARDENING_NOTES_IMPACT = { review: { reviewed: -1 } }',
  'freshnessTokens.size < 2',
  'current release authority was not freshness-loaded on both dashboard activations',
  'obol-current=',
  'dashboard-standalone'
])assert(smoke.includes(token),'browser smoke no longer proves Dashboard freshness behavior: '+token);

console.log('Dashboard freshness contract valid: embedded and standalone Dashboard paths reload cache-busted current owners, reject stale-global readiness, isolate owner generations, and retain browser recovery proof.');
