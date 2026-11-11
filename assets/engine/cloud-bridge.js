/*!
 * obol engine - cloud-bridge.js
 * Connects the Public Static Web UI to the Private Cloudflare Worker Engine (`/api/engine`).
 * Keeps the Ingest/Parsers, 7-Tier Hypergraph Ranker, and Report/Narrative engines
 * strictly on the server while preserving 100% synchronous + asynchronous UI compatibility.
 */
(function (root) {
  "use strict";
  var OBOL = root.OBOL = root.OBOL || {};

  // Configurable Worker URL: uses "/api/engine" on obol.platocres.workers.dev, or full Worker URL from GitHub Pages / localhost.
  function getWorkerUrl() {
    if (root && root.OBOL_WORKER_URL) return root.OBOL_WORKER_URL;
    if (root && root.location && root.location.hostname === "obol.platocres.workers.dev") return "/api/engine";
    return "https://obol.platocres.workers.dev/api/engine";
  }

  // Fast FNV-1a string fingerprint for in-memory LRU caching
  function hashStr(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h.toString(36);
  }

  var _cache = Object.create(null);
  var _cacheKeys = [];
  var MAX_CACHE = 96;
  function cacheGet(k) { return _cache[k]; }
  function cacheSet(k, v) {
    if (!(k in _cache)) {
      if (_cacheKeys.length >= MAX_CACHE) {
        var oldest = _cacheKeys.shift();
        delete _cache[oldest];
      }
      _cacheKeys.push(k);
    }
    _cache[k] = v;
    return v;
  }

  // Call the Cloudflare Worker (uses direct handler in local Node tests or synchronous XHR in browser)
  function callWorker(payload, cacheKey) {
    if (cacheKey && cacheGet(cacheKey) !== undefined) {
      return cacheGet(cacheKey);
    }
    var resObj = null;
    if (typeof OBOL._localCloudWorkerHandler === "function") {
      resObj = OBOL._localCloudWorkerHandler(JSON.parse(JSON.stringify(payload)));
    } else if (typeof XMLHttpRequest !== "undefined") {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", getWorkerUrl(), false);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify(payload));
      if (xhr.status >= 200 && xhr.status < 300) {
        resObj = JSON.parse(xhr.responseText);
      } else {
        throw new Error("OBOL Cloud Engine HTTP " + xhr.status);
      }
    } else {
      throw new Error("No OBOL Cloud Engine transport available");
    }
    if (cacheKey && resObj && !resObj.error) {
      cacheSet(cacheKey, resObj);
    }
    return resObj;
  }

  function serializeEngSnapshot(eng) {
    if (!eng) eng = (OBOL.store && OBOL.store.active && OBOL.store.active()) || null;
    if (!eng) return null;
    return {
      id: eng.id || "",
      params: eng.params || {},
      targets: eng.targets || [],
      facts: eng.facts || [],
      credentials: eng.credentials || [],
      contextSelections: eng.contextSelections || {},
      checklist: eng.checklist || {},
      ui: { prepDone: (eng.ui && eng.ui.prepDone) || {} },
      activities: (eng.activities || []).map(function (a) {
        if (!a) return null;
        return {
          at: a.at,
          command: a.command,
          dispatch: a.dispatch,
          sequenceCommands: a.sequenceCommands,
          target: a.target,
          scope: a.scope,
          action_id: a.action_id,
          produced: a.produced,
          outcome: a.outcome,
          context: a.context
        };
      }).filter(Boolean)
    };
  }

  // -- 1. Minimal string helpers for ingest.js + OBOL.parsers Cloud Bridge -------------------
  OBOL._parserCommon = OBOL._parserCommon || {
    _normalize_cr: function (s) {
      return String(s || "").replace(/\r+\n/g, "\n").replace(/^[^\n]*\r(?!\n)/gm, "");
    },
    _strip_proxychains: function (s) {
      var str = String(s || "");
      if (str.indexOf("[proxychains]") < 0) return str;
      return str
        .replace(/^\s*\[proxychains\][^\r\n]*?\b(?:OK|timeout|closed|denied)[ \t]*(?=\S)/gim, "")
        .replace(/^\s*\[proxychains\][^\r\n]*$/gim, "")
        .replace(/\[proxychains\][^\r\n]*/gi, "");
    },
    _parse_auth_material: function (tail) {
      var m = /^([^\s:]+):([^\s]+)(?:\s|$)/.exec(String(tail || "").trim());
      if (!m) return ["", "", ""];
      var domUser = m[1], sec = m[2], dom = "", usr = domUser;
      if (domUser.indexOf("\\") >= 0) {
        var idx = domUser.indexOf("\\");
        dom = domUser.slice(0, idx);
        usr = domUser.slice(idx + 1);
      }
      return [dom, usr, sec];
    }
  };

  function serializeParseOpts(opts) {
    opts = opts || {};
    var ctx = opts.context || {};
    var seed = [];
    if (ctx.facts) seed = Array.isArray(ctx.facts) ? ctx.facts : (ctx.facts.facts || []);
    else if (opts.seedFacts || opts.facts || opts.existingFacts) {
      var sf = opts.seedFacts || opts.facts || opts.existingFacts;
      seed = Array.isArray(sf) ? sf : (sf.facts || []);
    } else if (opts._inferenceContext && (opts._inferenceContext.factSet || opts._inferenceContext.globalFacts)) {
      var infFs = opts._inferenceContext.factSet || opts._inferenceContext.globalFacts;
      seed = Array.isArray(infFs) ? infFs : (infFs.facts || []);
    } else if (OBOL.store && OBOL.store.active && OBOL.store.active()) {
      seed = OBOL.store.active().facts || [];
    }
    var frame = ctx.attentionFrame || {};
    var cleanCtx = {
      target: ctx.target || "",
      targetDomain: ctx.targetDomain || "",
      forceTarget: ctx.forceTarget || "",
      credUser: ctx.credUser || "",
      credentialId: ctx.credentialId || null,
      promptLine: ctx.promptLine || "",
      followPrompt: ctx.followPrompt || "",
      facts: seed,
      attentionFrame: {
        matchedCopy: frame.matchedCopy || null,
        matchedCatalogMove: frame.matchedCatalogMove || null,
        recentActivities: (frame.recentActivities || []).slice(0, 2).map(function (a) {
          return a ? { command: a.command || "", target: a.target || "", stdout: a.stdout || "" } : null;
        }).filter(Boolean)
      }
    };
    return {
      actionId: opts.actionId || "",
      command: opts.command || "",
      stdout: opts.stdout || "",
      stderr: opts.stderr || "",
      source: opts.source,
      scope: opts.scope || "",
      domain: opts.domain || "",
      observedAt: opts.observedAt,
      seedFacts: seed,
      context: cleanCtx,
      _inferenceContext: opts._inferenceContext ? { attention: opts._inferenceContext.attention || null } : undefined
    };
  }

  OBOL.parsers = {
    parseActionOutput: function (opts, arg2, arg3) {
      if (typeof opts === "string") {
        opts = Object.assign({}, arg3 || {}, { actionId: opts, stdout: String(arg2 || "") });
      }
      var cleanOpts = serializeParseOpts(opts);
      return callWorker({ op: "parse", opts: cleanOpts });
    },
    analyzeTerminal: function (text, opts) {
      var cleanOpts = serializeParseOpts(opts || {});
      return callWorker({ op: "parse", analyzeTerminal: true, text: String(text || ""), opts: cleanOpts });
    }
  };
  OBOL.parsers.parse_action_output = OBOL.parsers.parseActionOutput;

  // -- 2. Calculation & 7-Tier Hypergraph Ranker Bridge --------------------------------------
  function buildRankPayload(facts, opts, extra) {
    opts = opts || {};
    var rc = facts && facts._resolvedContext;
    var factsArr = (facts && Array.isArray(facts.facts)) ? facts.facts : (Array.isArray(facts) ? facts : []);
    var payload = Object.assign({
      op: "rank",
      facts: factsArr,
      targetIp: (facts && facts._targetIp) || (rc && rc.target) || "",
      opts: {
        doneIds: opts.doneIds || {},
        focusPrefixes: opts.focusPrefixes || [],
        noFlags: !!(opts.noFlags || opts.flagsEnabled === false),
        goals: opts.goals
      }
    }, extra || {});
    if (rc) {
      payload.eng = serializeEngSnapshot(rc.engagement);
      payload.resolveOpts = {
        target: rc.target || "",
        locus: rc.locus || "overview",
        credentialId: rc.credentialId,
        params: rc.params || {}
      };
    } else if (OBOL.store && OBOL.store.active && OBOL.store.active()) {
      payload.eng = serializeEngSnapshot(OBOL.store.active());
    }
    return payload;
  }

  function getRankBundle(facts, pack, opts, includePlan) {
    var payload = buildRankPayload(facts, opts, {
      legacyV1: !!(OBOL.pack && OBOL.pack.ranker === "v1"),
      includePlan: !!includePlan
    });
    var key = "rank:" + hashStr(JSON.stringify(payload));
    var res = callWorker(payload, key);
    if (facts && typeof facts === "object" && res && res.cmdOrder) {
      try { Object.defineProperty(facts, "_cloudCmdOrder", { value: res.cmdOrder, configurable: true }); } catch (_e) {}
    }
    return res;
  }

  function mapIdsToPack(ids, pack) {
    var byId = Object.create(null);
    (pack || []).forEach(function (a) { if (a && a.id) byId[a.id] = a; });
    var out = [];
    (ids || []).forEach(function (id) { if (byId[id]) out.push(byId[id]); });
    return out;
  }

  if (OBOL.pack) {
    OBOL.pack._cloudRankActions = function (facts, pack, opts) {
      pack = pack || (OBOL.packs && OBOL.packs.actions ? OBOL.packs.actions() : []);
      var bundle = getRankBundle(facts, pack, opts, false);
      return mapIdsToPack(bundle.rankedIds, pack);
    };
    OBOL.pack._cloudLockedActions = function (facts, pack, opts) {
      pack = pack || (OBOL.packs && OBOL.packs.actions ? OBOL.packs.actions() : []);
      var bundle = getRankBundle(facts, pack, opts, false);
      var byId = Object.create(null);
      pack.forEach(function (a) { if (a && a.id) byId[a.id] = a; });
      return (bundle.locked || []).map(function (it) {
        return byId[it.id] ? { action: byId[it.id], reason: it.reason } : null;
      }).filter(Boolean);
    };
    OBOL.pack._cloudOpensUpNext = function (facts, pack, opts) {
      pack = pack || (OBOL.packs && OBOL.packs.actions ? OBOL.packs.actions() : []);
      var bundle = getRankBundle(facts, pack, opts, false);
      var byId = Object.create(null);
      pack.forEach(function (a) { if (a && a.id) byId[a.id] = a; });
      return (bundle.opens || []).map(function (it) {
        var act = byId[it.id];
        if (!act) return null;
        var needs = Array.isArray(it.needs) ? it.needs : null;
        var steps = typeof it.steps === "number" ? it.steps : 0;
        if (!needs) {
          needs = [];
          steps = 0;
          var hasFn = function (k) { return !!(facts && typeof facts.has === "function" && facts.has(k)); };
          (act.requires_all || []).forEach(function (k) { if (!hasFn(k)) { needs.push(k); steps++; } });
          var anyGroup = act.requires_any || [];
          if (anyGroup.length && !anyGroup.some(hasFn)) {
            anyGroup.forEach(function (k) { if (needs.indexOf(k) < 0) needs.push(k); });
            steps++;
          }
          steps = Math.max(1, steps);
        }
        return { action: act, needs: needs, steps: steps };
      }).filter(Boolean);
    };
    OBOL.pack._cloudPlanPath = function (facts, pack, opts) {
      pack = pack || (OBOL.packs && OBOL.packs.actions ? OBOL.packs.actions() : []);
      var bundle = getRankBundle(facts, pack, opts, true);
      if (bundle.plan && bundle.plan.cost === null) bundle.plan.cost = Infinity;
      return bundle.plan || { path: null, cost: Infinity, reachable: false };
    };
    OBOL.pack._cloudPreferredCommandIndex = function (move, locus, facts, skipFn, triedFn) {
      var cs = (move && move.commands) || [];
      if (cs.length <= 1) return 0;
      var loc = locus || "remote";
      var order = facts && facts._cloudCmdOrder && move && move.id && facts._cloudCmdOrder[move.id] && facts._cloudCmdOrder[move.id][loc];
      if (Array.isArray(order) && order.length) {
        for (var i = 0; i < order.length; i++) {
          var idx = order[i];
          if (skipFn && skipFn(cs[idx], idx)) continue;
          if (triedFn && triedFn(cs[idx], idx)) continue;
          if (OBOL.pack.commandLocus(cs[idx]) === loc && !OBOL.pack.commandSettled(cs[idx], facts) && OBOL.pack.commandIsEligible(cs[idx], facts, move)) {
            return idx;
          }
        }
      }
      var skipMask = cs.map(function (c, idx) { return !!(skipFn && skipFn(c, idx)); });
      var triedMask = cs.map(function (c, idx) { return !!(triedFn && triedFn(c, idx)); });
      var payload = buildRankPayload(facts, {}, {
        op: "prefCmd",
        moveId: move.id,
        locus: loc,
        skipMask: skipMask,
        triedMask: triedMask
      });
      var key = "prefCmd:" + hashStr(JSON.stringify(payload));
      var res = callWorker(payload, key);
      return (res && typeof res.index === "number") ? res.index : 0;
    };
  }

  // -- 3. Findings & Attack Chain Bridge -----------------------------------------------------
  function getFindingsBundle(factset, opts) {
    var factsArr = (factset && Array.isArray(factset.facts)) ? factset.facts : (Array.isArray(factset) ? factset : []);
    var dom = (opts && opts.domain) || "";
    var payload = { op: "findings", facts: factsArr, domain: dom };
    var key = "fnd:" + hashStr(JSON.stringify(payload));
    return callWorker(payload, key);
  }

  OBOL.findings = {
    assess: function (factset) {
      var res = getFindingsBundle(factset);
      return (res && res.findings) || [];
    }
  };

  OBOL.chain = {
    FLAG_KINDS: { "objective.local_flag": "user.txt / local.txt", "objective.root_flag": "root.txt / proof.txt", "objective.flag": "flag" },
    build: function (opts) {
      opts = opts || {};
      var factsArr = (opts.facts && Array.isArray(opts.facts.facts)) ? opts.facts.facts : (Array.isArray(opts.facts) ? opts.facts : []);
      var acts = (opts.activities || []).map(function (a) {
        return a ? { at: a.at, command: a.command, target: a.target, scope: a.scope, action_id: a.action_id, produced: a.produced } : null;
      }).filter(Boolean);
      var payload = { op: "chain", facts: factsArr, activities: acts, host: opts.host || "" };
      var key = "chain:" + hashStr(JSON.stringify(payload));
      var res = callWorker(payload, key);
      return (res && res.steps) || [];
    }
  };

  // -- 4. Report & Narrative Synthesis Bridge (`OBOL.report.*`) ------------------------------
  var PROFILES = {
    oscp: { id: "oscp", name: "OSCP Exam Report", title: "Offensive Security OSCP Exam Penetration Test Report", subtitle: "PEN-200 Certification Exam Deliverable", filename_pattern: "OSCP-{osid}-Exam-Report", screenshots_required: true, no_flags: false },
    cpts: { id: "cpts", name: "HTB CPTS Exam Report", title: "Hack The Box CPTS Penetration Test Report", subtitle: "Certified Penetration Testing Specialist Deliverable", filename_pattern: "CPTS-{name}-Report", screenshots_required: false, no_flags: false },
    pnpt: { id: "pnpt", name: "TCM PNPT Assessment Report", title: "Practical Network Penetration Tester (PNPT) Security Assessment", subtitle: "External & Internal Network Penetration Test Report", filename_pattern: "PNPT-{name}-Report", screenshots_required: false, no_flags: true },
    walkthrough: { id: "walkthrough", name: "Lab / Box Walkthrough", title: "Technical Box Walkthrough & Exploitation Notes", subtitle: "Step-by-Step Reproduction & Evidence Log", filename_pattern: "{name}-walkthrough", screenshots_required: false, no_flags: false },
    executive: { id: "executive", name: "Executive Summary", title: "Executive Penetration Testing Summary", subtitle: "High-Level Risk Posture & Remediation Roadmap", filename_pattern: "{name}-executive-summary", screenshots_required: false, no_flags: true },
    technical: { id: "technical", name: "Client Technical Deliverable", title: "Penetration Test Technical Report", subtitle: "Comprehensive Findings, Attack Path & Remediation Guide", filename_pattern: "{name}-technical-report", screenshots_required: false, no_flags: true }
  };

  function escHtml(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function slugify(text) {
    return String(text || "").toLowerCase().split("").filter(function (c) {
      return /[a-z0-9]/.test(c) || c === "-" || c === " ";
    }).join("").trim().replace(/ /g, "-");
  }
  function termPrompt(b) {
    if (b.style !== "target") return null;
    if ((b.os || "linux") === "windows") {
      var wd = (b.dir && b.dir !== "~") ? b.dir : "C:\\";
      return wd + ">";
    }
    var sym = b.root ? "#" : "$";
    var uh = (b.user && b.host) ? (b.user + "@" + b.host) : (b.host || b.user || "");
    var d = b.dir || "~";
    return (uh ? (uh + ":" + d) : d) + sym;
  }
  function mdInline(text) {
    var s = escHtml(text || "");
    var stash = [];
    function hold(html) { var id = "\u0000" + stash.length + "\u0000"; stash.push(html); return id; }
    s = s.replace(/`([^`]+)`/g, function (_, c) { return hold("<code>" + c + "</code>"); });
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, function (_, lbl, url) { return hold("<a href=\"" + url + "\">" + lbl + "</a>"); });
    s = s.replace(/\b(https?:\/\/[^\s<)]+)/g, function (url) {
      var clean = url.replace(/[.,;:]+$/, "");
      var trail = url.slice(clean.length);
      return hold("<a href=\"" + clean + "\">" + clean + "</a>") + trail;
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[\s(])_([^_\r\n]+)_($|[\s).,;:!?])/g, "$1<em>$2</em>$3");
    return s.replace(/\u0000(\d+)\u0000/g, function (_, idx) { return stash[Number(idx)] || ""; });
  }

  // AST Block -> HTML serializer used by `routes/report.js:paginateBlocks` to render paper sheets
  function toHtml(blocks) {
    var out = [];
    (blocks || []).forEach(function (b) {
      switch (b.t) {
        case "heading": {
          var a = b.level <= 3 ? (" id=\"" + (b.anchor || slugify(b.text)) + "\"") : "";
          out.push("<h" + b.level + a + ">" + escHtml(b.text) + "</h" + b.level + ">"); break;
        }
        case "para": out.push("<p>" + mdInline(b.text) + "</p>"); break;
        case "bullets": {
          var tag = b.ordered ? "ol" : "ul";
          out.push("<" + tag + ">" + (b.items || []).map(function (it) { return "<li>" + mdInline(it) + "</li>"; }).join("") + "</" + tag + ">");
          break;
        }
        case "kv": {
          var rows = (b.pairs || []).map(function (kv) { return "<tr><th>" + escHtml(kv[0]) + "</th><td>" + mdInline(kv[1]) + "</td></tr>"; }).join("");
          out.push("<table class=\"kv\">" + rows + "</table>"); break;
        }
        case "table": {
          var head = (b.headers || []).map(function (h) {
            var hName = String(h || "").toLowerCase();
            var isWrapCol = /command|ports|path|local\.txt|proof\.txt|what it is|initial|domain|privilege|finding|technique|operating system/.test(hName);
            return "<th" + (isWrapCol ? " class=\"th-wrap\"" : " class=\"th-compact\"") + ">" + escHtml(h) + "</th>";
          }).join("");
          var body = (b.rows || []).map(function (row) {
            return "<tr>" + row.map(function (c, ci) {
              var hName = String((b.headers && b.headers[ci]) || "").toLowerCase();
              var isWrapCol = /command|ports|path|local\.txt|proof\.txt|what it is|initial|domain|privilege|finding|technique|operating system/.test(hName) || String(c).length > 24;
              return "<td" + (isWrapCol ? " class=\"td-wrap\"" : " class=\"td-compact\"") + ">" + mdInline(String(c)) + "</td>";
            }).join("") + "</tr>";
          }).join("");
          var cap = b.caption ? "<caption>" + escHtml(b.caption) + "</caption>" : "";
          out.push("<table class='data'>" + cap + "<thead><tr>" + head + "</tr></thead><tbody>" + body + "</tbody></table>");
          break;
        }
        case "code": out.push("<pre class=\"rep-code" + (b.lang ? " lang-" + escHtml(b.lang) : "") + "\"><code>" + escHtml(b.text) + "</code></pre>"); break;
        case "terminal": {
          var htp = termPrompt(b);
          var oHtml = b.output ? ("\n<span class=\"kt-o\">" + escHtml(String(b.output).replace(/\n+$/, "")) + "</span>") : "";
          if (htp) {
            var pr = "<span class=\"kt-u\">" + escHtml(htp) + "</span> <span class=\"kt-c\">" + escHtml(b.command) + "</span>";
            out.push("<pre class=\"kali-term term-target\">" + pr + oHtml + "</pre>");
          } else {
            var pTop = "<span class=\"kt-b\">┌──(</span><span class=\"kt-u\">" + escHtml(b.user) + "</span><span class=\"kt-b\">)-[" + escHtml(b.dir) + "]</span>";
            var pCmd = "<span class=\"kt-b\">└─$</span> <span class=\"kt-c\">" + escHtml(b.command) + "</span>";
            out.push("<pre class=\"kali-term\">" + pTop + "\n" + pCmd + oHtml + "</pre>");
          }
          break;
        }
        case "callout": out.push("<div class=\"callout " + escHtml(b.kind) + "\">" + mdInline(b.text) + "</div>"); break;
        case "proof": {
          var rws = [];
          if (b.flag) rws.push("<tr><th>Flag Value</th><td><code>" + escHtml(b.flag) + "</code></td></tr>");
          if (b.path) rws.push("<tr><th>File Path</th><td><code>" + escHtml(b.path) + "</code></td></tr>");
          if (b.command) rws.push("<tr><th>Command</th><td><code>" + escHtml(b.command) + "</code></td></tr>");
          var shot = b.screenshot ? escHtml(b.screenshot) : (b.compliant ? "Interactive terminal proof capture (below)" : "<em>none captured</em>");
          rws.push("<tr><th>Verification</th><td>" + shot + "</td></tr>");
          var extra = "";
          if (b.block) extra += "<div class=\"prooflabel\">" + escHtml(b.block_label || "Interactive Shell Proof Capture") + "</div><pre class=\"proofblk\">" + escHtml(b.block) + "</pre>";
          if (b.shot_data_uri) extra += "<img class=\"shot\" alt=\"operator screenshot\" src=\"" + escHtml(b.shot_data_uri) + "\">";
          var status = b.gap ? "<div class=\"callout gap\">Proof gap: " + mdInline(b.gap) + "</div>" : (b.compliant ? "<div class=\"callout ok\">OSCP-compliant: interactive shell with host identity and target IP visible</div>" : "");
          out.push("<div class=\"proof-item\"><h4>" + escHtml(b.label) + "</h4><table class=\"kv\">" + rws.join("") + "</table>" + extra + status + "</div>");
          break;
        }
        case "image": {
          var src = b.data_uri || b.path;
          var icap = b.caption ? "<figcaption>" + mdInline(b.caption) + "</figcaption>" : "";
          var cls = b.is_render ? "shot termshot" : "shot";
          var figCls = b.is_render ? "ev-fig termshot-fig" : "ev-fig";
          out.push("<figure class=\"" + figCls + "\"><img class=\"" + cls + "\" alt=\"" + escHtml(b.caption || "screenshot") + "\" src=\"" + escHtml(src) + "\">" + icap + "</figure>");
          break;
        }
        case "divider": out.push("<hr>"); break;
        case "pagebreak": out.push("<div class=\"page-break\"></div>"); break;
        case "toc": {
          if (b.items && b.items.length) {
            var tRows = b.items.map(function (it) { return "<li class=\"toc-item toc-lvl-" + it.level + "\"><a href=\"#" + escHtml(it.anchor) + "\">" + escHtml(it.text) + "</a></li>"; }).join("");
            out.push("<nav class=\"toc\"><div class=\"toc-hdr\">Table of Contents</div><ol class=\"toc-list\">" + tRows + "</ol></nav>");
          } else { out.push("<nav class=\"toc\"></nav>"); }
          break;
        }
        default: break;
      }
    });
    return out.join("\n");
  }

  var STANDALONE_CSS = ':root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#eef0f3;color:#16181d;font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}.rep-doc{max-width:820px;margin:32px auto;background:#fff;padding:44px 54px;border:1px solid #e2e5ea;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,.06);overflow:hidden}h1,h2,h3,h4,h5,h6{line-height:1.25;color:#12161c}h1{font-size:26px;margin:0 0 14px;padding-bottom:10px;border-bottom:2px solid #1f2a37}h2{font-size:20px;margin:28px 0 10px;padding-bottom:5px;border-bottom:1px solid #dfe3ea}h3{font-size:16px;margin:22px 0 8px}h4{font-size:14px;margin:16px 0 6px;color:#2b3440}p{margin:8px 0}ul,ol{padding-left:22px;margin:8px 0}li{margin:3px 0}table{border-collapse:collapse;width:100%;margin:11px 0;font-size:13px}th,td{border:1px solid #d7dce3;padding:6px 10px;text-align:left;vertical-align:top;background:#fff}th{background:#f1f5f9;font-weight:700}code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px}pre{background:#f4f6f9;border:1px solid #cbd5e1;border-left:3px solid #16a34a;border-radius:6px;padding:10px 14px;margin:10px 0;font:12px/1.52 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre-wrap;word-break:break-word}';
  function htmlDocument(bodyHtml, title) {
    return "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>" + escHtml(title || "obol-report") + "</title><style>" + STANDALONE_CSS + "</style></head><body><main class=\"rep-doc\">" + bodyHtml + "</main></body></html>";
  }

  // Keep operator proof screenshots 100% local in the browser: replace data_uri with local tokens before calling Worker
  var _localShotMap = Object.create(null);
  function stripScreenshotBytes(screenshots) {
    return (screenshots || []).map(function (s, idx) {
      if (!s) return null;
      var copy = Object.assign({}, s);
      if (copy.data_uri) {
        var tok = "__OBOL_LOCAL_SHOT_" + idx + "__";
        _localShotMap[tok] = copy.data_uri;
        copy.data_uri = tok;
      }
      return copy;
    }).filter(Boolean);
  }
  function restoreScreenshotBytesInBlocks(blocks) {
    return (blocks || []).map(function (b) {
      if (!b) return b;
      if (b.shot_data_uri && _localShotMap[b.shot_data_uri]) {
        b = Object.assign({}, b, { shot_data_uri: _localShotMap[b.shot_data_uri] });
      }
      if (b.data_uri && _localShotMap[b.data_uri]) {
        b = Object.assign({}, b, { data_uri: _localShotMap[b.data_uri] });
      }
      return b;
    });
  }

  function serializeReportOpts(opts) {
    opts = opts || {};
    var fs = opts.factset || opts.facts || [];
    var factsArr = Array.isArray(fs) ? fs : (fs.facts || []);
    return {
      facts: factsArr,
      activities: (opts.activities || []).map(function (a) {
        return a ? { at: a.at, command: a.command, dispatch: a.dispatch, tool: a.tool, target: a.target, scope: a.scope, action_id: a.action_id, produced: a.produced, stdout: a.stdout } : null;
      }).filter(Boolean),
      targets: opts.targets || [],
      profile: opts.profile || {},
      candidate: opts.candidate || "",
      osid: opts.osid || "",
      client: opts.client || "",
      engagement: opts.engagement || "",
      name: opts.name || opts.engagement || "",
      assessor: opts.assessor || "",
      dates: opts.dates || {},
      scope: opts.scope || [],
      includeSecrets: !!opts.includeSecrets,
      hideUnreached: !!opts.hideUnreached,
      hostNotes: opts.hostNotes || {},
      screenshots: stripScreenshotBytes(opts.screenshots || []),
      workspace: opts.workspace || null,
      engId: opts.engId || "",
      params: opts.params || {}
    };
  }

  function fetchReportBundle(profileName, ctxOrReportOpts, includeDocx) {
    var rOpts = (ctxOrReportOpts && ctxOrReportOpts._rawReportOpts) ? ctxOrReportOpts._rawReportOpts : serializeReportOpts(ctxOrReportOpts);
    var prof = typeof profileName === "string" ? profileName : ((profileName && profileName.id) || "");
    var payload = {
      op: "report",
      profile: prof,
      includeDocx: !!includeDocx,
      reportOpts: rOpts
    };
    var key = "rep:" + hashStr(JSON.stringify(payload));
    return callWorker(payload, key);
  }

  OBOL.report = {
    PROFILES: PROFILES,
    DEFAULT_PROFILE: "oscp",
    isExamProfile: function (id) {
      var p = PROFILES[String(id || "").toLowerCase()];
      return !!(p && /\{osid\}/.test(p.filename_pattern || ""));
    },
    buildContext: function (opts) {
      var rawOpts = serializeReportOpts(opts);
      var activeEng = (OBOL.store && OBOL.store.active && OBOL.store.active()) || {};
      var uiProf = (activeEng.ui && activeEng.ui.reportProfile) || "";
      var bundle = fetchReportBundle(uiProf, { _rawReportOpts: rawOpts }, false);
      var ctx = Object.assign({}, bundle.ctx || {});
      Object.defineProperty(ctx, "_rawReportOpts", { value: rawOpts, configurable: true });
      Object.defineProperty(ctx, "_bundle", { value: bundle, configurable: true });
      return ctx;
    },
    defaultFor: function (ctx) {
      return (ctx && ctx._bundle && ctx._bundle.defaultProfile) || "oscp";
    },
    resolve: function (profileName, ctx) {
      var id = typeof profileName === "string" ? profileName.toLowerCase() : ((profileName && profileName.id) || "");
      if (ctx && ctx._bundle && ctx._bundle.profileObj && (!id || ctx._bundle.profileObj.id === id)) {
        return ctx._bundle.profileObj;
      }
      var bundle = fetchReportBundle(id, ctx, false);
      return bundle.profileObj || PROFILES[id] || PROFILES.oscp;
    },
    document: function (profileName, ctx) {
      var id = typeof profileName === "string" ? profileName.toLowerCase() : ((profileName && profileName.id) || "oscp");
      var bundle = fetchReportBundle(id, ctx, false);
      var blocks = (bundle && bundle.blocks) ? restoreScreenshotBytesInBlocks(bundle.blocks) : [];
      Object.defineProperty(blocks, "_bundle", { value: bundle, configurable: true });
      Object.defineProperty(blocks, "_profileId", { value: id, configurable: true });
      Object.defineProperty(blocks, "_ctx", { value: ctx, configurable: true });
      return blocks;
    },
    outline: function (blocks) {
      if (blocks && blocks._bundle && blocks._bundle.outline) return blocks._bundle.outline;
      var items = [];
      (blocks || []).forEach(function (b) {
        if (b && b.t === "heading" && b.level >= 1 && b.level <= 3) {
          items.push({ level: b.level, text: String(b.text || ""), anchor: b.anchor || slugify(b.text || "") });
        }
      });
      return items;
    },
    filenameStem: function (profile, ctx) {
      var id = typeof profile === "string" ? profile : ((profile && profile.id) || "oscp");
      var bundle = fetchReportBundle(id, ctx, false);
      return (bundle && bundle.stem) || ("obol-report-" + id);
    },
    validate: function (profileName, ctx) {
      var id = typeof profileName === "string" ? profileName : ((profileName && profileName.id) || "oscp");
      var bundle = fetchReportBundle(id, ctx, false);
      return (bundle && bundle.gaps) || [];
    },
    preflightCheck: function (ctx) {
      if (ctx && ctx._bundle && ctx._bundle.preflight) return ctx._bundle.preflight;
      var bundle = fetchReportBundle("oscp", ctx, false);
      return (bundle && bundle.preflight) || { ok: true, warnings: [] };
    },
    submissionHelper: function (profileName, ctx) {
      var id = typeof profileName === "string" ? profileName : ((profileName && profileName.id) || "oscp");
      var bundle = fetchReportBundle(id, ctx, false);
      return (bundle && bundle.subHelper) || null;
    },
    toMarkdown: function (blocks) {
      if (blocks && blocks._bundle && typeof blocks._bundle.markdown === "string") {
        return blocks._bundle.markdown;
      }
      return "";
    },
    toHtml: toHtml,
    htmlDocument: htmlDocument,
    docxFiles: function (blocks) {
      var profId = (blocks && blocks._profileId) || "oscp";
      var ctx = (blocks && blocks._ctx) || {};
      var bundle = fetchReportBundle(profId, ctx, true);
      return (bundle && bundle.docxFiles) || [];
    },
    splitFindingsByPhase: function (fList, t) {
      return [[], []];
    },
    autoHostSummary: function (t) {
      var host = t && t.host;
      var activeEng = (OBOL.store && OBOL.store.active && OBOL.store.active()) || {};
      var bundle = fetchReportBundle((activeEng.ui && activeEng.ui.reportProfile) || "oscp", {
        factset: OBOL.store && OBOL.store.factSet ? OBOL.store.factSet() : [],
        activities: activeEng.activities || [],
        targets: activeEng.targets || []
      }, false);
      return (bundle && bundle.autoDraft && host && bundle.autoDraft[host] && bundle.autoDraft[host].summary) || "";
    },
    describeCommandStep: function (ev, hostLabel) {
      return String(ev || "");
    }
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
