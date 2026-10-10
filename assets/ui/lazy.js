/*!
 * obol ui — lazy.js — route-lazy bundle loader. Injects <script> tags on demand (works over
 * file:// and http, unlike fetch). Keeps the critical boot path tiny: only the engine core +
 * coach/evidence/home/targets load up front; tools/domain/report/graph/checklist load on first
 * navigation. Missing files degrade gracefully (the route shows a "coming online" placeholder).
 */
(function (root) {
  'use strict';
  var OBOL = root.OBOL = root.OBOL || {};

  // Files per group, in load order. Populated as bundles are built; tolerant of absent files.
  var GROUPS = {
    parsers: [
      'assets/engine/parsers/common.js?v=7b22b9d7',
      'assets/engine/parsers/nmap.js?v=86c637ba', 'assets/engine/parsers/directory.js?v=96216062',
      'assets/engine/parsers/creds.js?v=02c63d43', 'assets/engine/parsers/host.js?v=85c95786',
      'assets/engine/parsers/services.js?v=ce623f34', 'assets/engine/parsers/database.js?v=9b482c60',
      'assets/engine/parsers/web.js?v=df94e2f3', 'assets/engine/parsers/websource.js?v=220449aa',
      'assets/engine/parsers/findings.js?v=0c7eb0d6', 'assets/engine/parsers/shape.js?v=d183ceb9',
      'assets/engine/parsers/pivot.js?v=0f65c48f', 'assets/engine/parsers/dns.js?v=90a12620',
      'assets/engine/parsers/blockers.js?v=ef350845',
      'assets/engine/parsers/nxc-catalog.js?v=48cfcc8d',
      'assets/engine/parsers/index.js?v=c2938456',
    ],
    graph: ['assets/engine/graph.js?v=5f9b7998', 'assets/ui/routes/graph.js?v=f509cf3e'],
    domain: ['assets/jszip.min.js?v=c96375d5', 'assets/engine/bloodhound.js?v=baa09e8b', 'assets/ui/bhgraph.js?v=b597c9c6', 'assets/ui/routes/domain.js?v=fda3a6a7'],
    report: ['assets/jszip.min.js?v=c96375d5', 'data/reportmeta.js?v=b4a40b19', 'assets/engine/report.js?v=b653e4fc', 'assets/ui/routes/report.js?v=217e6ca7'],
    tools: ['assets/engine/toolbuilder.js?v=a0a54306', 'data/toolset.js?v=1fb66d68', 'assets/ui/routes/tools.js?v=253b5ce0'],
    loadout: ['assets/engine/arsenal.js?v=3dba40b1', 'assets/ui/routes/loadout.js?v=f6d299e1'],
    workbench: ['assets/engine/workbench.js?v=f1f4dae9', 'assets/ui/routes/workbench.js?v=587009b6'],
    stuck: ['data/stuck-catalog.js?v=14d96459', 'assets/engine/stuck.js?v=9f3ec324', 'assets/ui/routes/stuck.js?v=2d2c9a5f'],
    study: ['data/study-fixtures.js?v=a596d3da', 'assets/engine/study.js?v=b3f1423e', 'assets/ui/routes/study.js?v=ecef2fdb'],
    decisionmap: ['data/decision-forks.js?v=abde552b', 'data/parser-signatures.js?v=92f80090', 'data/coverage-expected.js?v=afdb39b5', 'data/flag-reach.js?v=e8d6c84a', 'assets/engine/decisionmap.js?v=8986cb18', 'assets/ui/decisiontree.js?v=b97043a7'],
    checklist: ['data/oscp-scope.js?v=b211d828', 'assets/ui/routes/checklist.js?v=d649c597'],
    target: ['assets/engine/graph.js?v=5f9b7998', 'assets/ui/routes/target.js?v=b911ce1f'],
    creds: ['assets/ui/routes/creds.js?v=a87fc780'],
    scoreboard: ['assets/ui/routes/scoreboard.js?v=7fa2dd83'],
    playbooks: ['data/playbooks-bundle.js?v=715252cb', 'assets/engine/playbooks.js?v=1361f6a3', 'assets/ui/routes/playbooks.js?v=c1591c6b'],
    cruise: ['data/playbooks-bundle.js?v=715252cb', 'assets/engine/playbooks.js?v=1361f6a3', 'assets/engine/cruise.js?v=1bfa5ac3', 'assets/ui/routes/cruise.js?v=c825d11c'],
    map: ['assets/engine/engmap.js?v=55323494', 'assets/ui/routes/map.js?v=b415a554'],
    findings: ['data/attack-catalog.js?v=2c0cff09', 'data/attack-move-map.js?v=0de35ccd', 'data/d3fend-map.js?v=c8b35d9d', 'data/frameworks-tables.js?v=169ba840', 'data/kev-catalog.js?v=e8b4d122', 'assets/engine/frameworks.js?v=50ac05e2', 'assets/ui/routes/findings.js?v=9bca47a7'],
    history: ['assets/ui/routes/history.js?v=f2888760'],
    help: ['data/help-content.js?v=585ed421', 'assets/ui/routes/help.js?v=08468aaf'],
  };

  var _loaded = {};   // group -> Promise
  var _script = {};   // src -> Promise

  function loadScript(src) {
    if (_script[src]) return _script[src];
    _script[src] = new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src; s.async = false;
      s.onload = function () { resolve(true); };
      // A failed load (404, or a content/ad blocker blocking a file by name) is not fatal, but we drop
      // its cached promise so a later attempt can retry it rather than being stuck half-loaded forever.
      s.onerror = function () { delete _script[src]; resolve(false); };
      document.head.appendChild(s);
    });
    return _script[src];
  }

  function loadGroup(name) {
    if (_loaded[name]) return _loaded[name];
    var files = GROUPS[name] || [];
    var p = files.reduce(function (acc, src) {
      return acc.then(function (allOk) { return loadScript(src).then(function (ok) { return allOk && ok; }); });
    }, Promise.resolve(true));
    // Don't cache a group that didn't fully load — a retry (e.g. the next paste) re-attempts the
    // missing file instead of running the engine with a helper permanently undefined.
    p.then(function (allOk) { if (!allOk) delete _loaded[name]; });
    _loaded[name] = p;
    return p;
  }

  // Register placeholder routes that lazy-load their group then delegate to the real route.
  function registerLazyRoutes(R) {
    ['loadout', 'workbench', 'stuck', 'study', 'tools', 'domain', 'report', 'checklist', 'graph', 'target', 'creds', 'scoreboard', 'playbooks', 'cruise', 'map', 'findings', 'history', 'help'].forEach(function (name) {
      R.register(name, {
        ensure: function () { return loadGroup(name); },
        render: function (ctx) {
          var real = OBOL.routes[name];
          if (real && real.render && real !== R._lazyStub) {
            var out = real.render(ctx);
            R._lastReal = name;
            return out;
          }
          return '<section class="route-stub"><h1 class="route-h1">' + name.charAt(0).toUpperCase() + name.slice(1) + '</h1>'
            + '<p class="route-sub">This surface is coming online in this build. If you just opened it, the bundle may still be loading, try again in a moment.</p></section>';
        },
        mounted: function (ctx) {
          var real = OBOL.routes[name];
          if (real && real.mounted) { try { real.mounted(ctx); } catch (e) {} }
        },
      });
    });
  }

  OBOL.lazy = { loadGroup: loadGroup, registerLazyRoutes: registerLazyRoutes, GROUPS: GROUPS };
})(typeof globalThis !== 'undefined' ? globalThis : this);
