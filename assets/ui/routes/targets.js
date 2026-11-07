/*!
 * obol ui - routes/targets.js - Full-scope Target War Room (unlimited targets).
 * Supports single target add, bulk Nmap / CIDR / /etc/hosts import, status filter pills,
 * instant search, active target focus, attack path preview, and Target Dossier links.
 */
(function (root) {
  'use strict';
  var OBOL = root.OBOL = root.OBOL || {};
  var U = OBOL.util;
  function esc(s) { return U.esc(s); }

  var _filter = 'all';
  var _query = '';
  var _showBulk = false;
  var _lastEngId = null;

  function dossierCard(info, activeTarget, acts) {
    var b = info.badge || { label: 'SCAN', cls: 'hb-acc-disc' };
    var ip = info.ip;
    var isFocused = ip === activeTarget;
    var eng = OBOL.store.active();
    var hostFacts = (OBOL.store && OBOL.store.factSetForTarget) ? OBOL.store.factSetForTarget(ip) : null;
    var idn = (OBOL.store && OBOL.store.targetIdentity) ? OBOL.store.targetIdentity(ip) : { ip: ip, hostname: info.host, domain: info.domain };
    var host = idn.hostname || info.host || '';
    var dom = idn.domain || info.domain || '';

    var pInfo = (OBOL.routes && OBOL.routes.target && OBOL.routes.target.classifyHostPorts && hostFacts)
      ? OBOL.routes.target.classifyHostPorts(ip, hostFacts, eng)
      : null;

    var portsHtml = '';
    var portsLabel = 'Ports (' + info.ports.length + ')';
    if (pInfo && (pInfo.realPorts.length || pInfo.ephemeralRpc.length)) {
      var rp = pInfo.realPorts;
      var ep = pInfo.ephemeralRpc;
      portsLabel = 'Ports (' + rp.length + (ep.length ? ' +' + ep.length + ' RPC' : '') + ')';
      portsHtml = rp.slice(0, 14).map(function (r) {
        var cls = 'hb-port' + (r.isCustom ? ' is-custom' : (r.isOsBg ? ' is-osbg' : ''));
        var tag = (!/^custom-/.test(r.short || '') && r.short) ? (' <small class="hb-port-svc">' + esc(r.short) + '</small>') : (r.isCustom ? ' <small class="hb-port-svc">★</small>' : '');
        return '<span class="' + cls + '" title="' + U.attr(r.port + '/' + r.protocol + ' · ' + r.serviceTitle) + '">' + r.port + tag + '</span>';
      }).join('')
        + (rp.length > 14 ? '<span class="hb-port hb-port-more">+' + (rp.length - 14) + '</span>' : '')
        + (ep.length ? '<span class="hb-port hb-port-rpc" title="Windows Ephemeral RPC Ports (' + ep[0] + '-' + ep[ep.length - 1] + ')">+' + ep.length + ' RPC</span>' : '');
    } else {
      portsHtml = info.ports.slice(0, 14).map(function (p) { return '<span class="hb-port">' + p + '</span>'; }).join('')
        + (info.ports.length > 14 ? '<span class="hb-port hb-port-more">+' + (info.ports.length - 14) + '</span>' : '');
    }

    var credPills = [];
    if (OBOL.routes && OBOL.routes.target && OBOL.routes.target.hostCredStatuses && hostFacts) {
      var cStatuses = OBOL.routes.target.hostCredStatuses(ip, hostFacts, eng);
      var notableCreds = cStatuses.filter(function (c) { return c.status === 'admin' || c.status === 'valid' || c.status === 'for-host'; });
      if (!notableCreds.length && cStatuses.length) notableCreds = cStatuses.slice(0, 1);
      notableCreds.slice(0, 3).forEach(function (c) {
        credPills.push('<span class="tgt-cred-pill ' + c.badgeCls + '">' + esc(c.user) + ': <b>' + esc(c.badgeLabel) + '</b></span>');
      });
    }
    if (hostFacts) {
      var isHostDc = hostFacts.has('ad.dc_confirmed') || hostFacts.has('kerberos.reachable') || hostFacts.has('port:88')
        || ((hostFacts.facts || []).some(function (f) { return f && f.state === 'supported' && f.kind === 'ad.dc_candidate' && /^host:/i.test(f.scope || ''); }));
      if (isHostDc) credPills.push('<span class="tgt-posture-pill is-dc">DC</span>');
      if (hostFacts.has('smb.v1')) credPills.push('<span class="tgt-posture-pill is-warn">SMBv1</span>');
      if (hostFacts.has('smb.null_session')) credPills.push('<span class="tgt-posture-pill is-warn">Null Auth</span>');
    }
    var credStripHtml = credPills.length ? ('<div class="tgt-cred-strip">' + credPills.join('') + '</div>') : '';

    var svcs = (info.svcs || []).slice(0, 8).map(function (s) { return '<span class="tgt-svc">' + esc(s) + '</span>'; }).join('');
    var flagsOn = (!OBOL.profile || !OBOL.profile.hasFlags || !eng) ? true : OBOL.profile.hasFlags(eng.profile);
    var flags = info.flags
      ? '<span class="hb-flags">' + OBOL.ic('flag') + ' ' + info.flags + ' Flag' + (info.flags === 1 ? '' : 's') + '</span>'
      : (flagsOn
          ? '<span class="hb-flags hb-noflag">No Flags Yet</span>'
          : '<span class="hb-flags hb-noflag">' + (info.lvl === 'privileged' ? 'Compromised (Admin)' : info.lvl === 'foothold' ? 'Foothold Active' : 'In Scope') + '</span>');
    var nextHtml = info.next ? '<span class="hb-next" title="' + U.attr(info.next) + '">&rarr; ' + esc(info.next) + '</span>'
      : (info.lvl === 'privileged' ? '<span class="hb-next hb-next-done">Owned</span>' : '');

    var focusBtn = isFocused
      ? '<span class="hb-focus-chip is-on" title="Active target for Cockpit &amp; Cruise">● Active</span>'
      : '<button type="button" class="hb-focus-btn" data-focus-ip="' + U.attr(ip) + '" title="Set ' + U.attr(ip) + ' as active target">Focus</button>';

    var hasHostActs = (acts || []).some(function (a) { return a && (a.target === ip || a.scope === 'host:' + ip); });
    var flow = (hasHostActs && OBOL.chainview) ? OBOL.chainview.hostFlow(ip, acts || []) : '';
    var apathPreview = flow
      ? '<details class="tgt-apath-preview"><summary>Attack Path Walked</summary><div class="tgt-apath-body">' + flow + '</div></details>'
      : '';
    var prevIps = (info.t && Array.isArray(info.t.previousIps) && info.t.previousIps.length) ? info.t.previousIps : [];
    var editDrawer = (OBOL.targets && OBOL.targets.renderEditDrawer) ? OBOL.targets.renderEditDrawer(ip) : '';

    return '<article class="hb-tcard tgt-card ws-clear-box hb-lvl-' + info.lvl + (isFocused ? ' is-focused' : '') + '" data-tid="' + esc(info.t.id) + '">'
      + '<div class="tgt-card-bar">'
      + '  <div class="tgt-card-id">'
      + '    <span class="hb-acc ' + b.cls + '">' + b.label + '</span>'
      + '    <a class="hb-tname-link" href="#/target/' + U.attr(ip) + '"><span class="hb-tname">' + esc(host || ip) + '</span>'
      +      (host ? '<span class="hb-tip">' + esc(ip) + '</span>' : '') + '</a>'
      +      (prevIps.length ? '<span class="hb-prev-ip" title="Previous IP(s): ' + U.attr(prevIps.join(', ')) + '">was ' + esc(prevIps[prevIps.length - 1]) + '</span>' : '')
      + '  </div>'
      + '  <div class="tgt-card-actions">'
      +      focusBtn
      + '    <button type="button" class="hb-focus-btn" data-edit-target="' + U.attr(ip) + '" title="Edit target or Re-IP after lab respawn">&#9998; Edit / Re-IP</button>'
      + '    <a class="hb-dossier-btn" href="#/target/' + U.attr(ip) + '">Target Dossier &rarr;</a>'
      + '    <button type="button" class="tcard-del" data-tid="' + esc(info.t.id) + '" title="Remove target" aria-label="Remove target ' + U.attr(ip) + '">&times;</button>'
      + '  </div>'
      + '</div>'
      + '<div class="hb-tcard-main tgt-main">'
      +    editDrawer
      + '  <div class="tgt-meta">'
      + '    <div class="tgt-row"><span class="tgt-k">OS</span><span class="tgt-v' + (info.os ? '' : ' tgt-empty') + '">' + (info.os ? esc(info.os) : 'Not Fingerprinted Yet') + '</span></div>'
      + '    <div class="tgt-row"><span class="tgt-k">Domain</span><span class="tgt-v' + (dom ? '' : ' tgt-empty') + '">' + (dom ? esc(dom) : 'None Known Yet') + '</span></div>'
      + '  </div>'
      +    credStripHtml
      + '  <div class="tgt-ports"><span class="tgt-k">' + esc(portsLabel) + '</span><div class="hb-ports">' + (portsHtml || '<span class="hb-port-none">No Ports Yet</span>') + '</div></div>'
      +    (svcs ? '<div class="tgt-svcs">' + svcs + '</div>' : '')
      +    apathPreview
      + '  <div class="hb-tfoot">' + flags + nextHtml + '</div>'
      + '</div>'
      + '</article>';
  }

  var PRIORITY = { foothold: 5, credentialed: 4, enumerated: 3, discovered: 2, privileged: 1 };

  function computeTargetBoard(eng) {
    var targets = (eng && eng.targets) || [];
    var acts = (eng && eng.activities) || [];
    var allInfos = (OBOL.targets && OBOL.targets.all) ? OBOL.targets.all(eng) : targets.map(function (t) {
      return { t: t, ip: t.ip || t.id, host: t.hostname || '', os: t.os || '', lvl: 'discovered', badge: { label: 'SCAN', cls: 'hb-acc-disc' }, ports: [], flags: 0, domain: '', svcs: [], next: '' };
    });
    var activeTarget = (eng && eng.params && eng.params.target) || (allInfos[0] && allInfos[0].ip) || '';
    var sortedInfos = allInfos.slice().sort(function (a, b) {
      var aAct = a.ip === activeTarget ? 1 : 0;
      var bAct = b.ip === activeTarget ? 1 : 0;
      if (aAct !== bAct) return bAct - aAct;
      return (PRIORITY[b.lvl] || 0) - (PRIORITY[a.lvl] || 0);
    });
    var counts = {
      all: sortedInfos.length,
      foothold: sortedInfos.filter(function (i) { return i.lvl === 'foothold' || i.lvl === 'credentialed'; }).length,
      privileged: sortedInfos.filter(function (i) { return i.lvl === 'privileged'; }).length,
      recon: sortedInfos.filter(function (i) { return i.lvl === 'discovered' || i.lvl === 'enumerated'; }).length,
    };
    var q = (_query || '').trim().toLowerCase();
    var filtered = sortedInfos.filter(function (i) {
      if (_filter === 'foothold' && i.lvl !== 'foothold' && i.lvl !== 'credentialed') return false;
      if (_filter === 'privileged' && i.lvl !== 'privileged') return false;
      if (_filter === 'recon' && i.lvl !== 'discovered' && i.lvl !== 'enumerated') return false;
      if (q) {
        var hay = [i.ip, i.host, i.os, i.domain, (i.ports || []).join(' '), (i.svcs || []).join(' ')].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    var rowsHtml = filtered.length
      ? '<div class="tgrid">' + filtered.map(function (info) { return dossierCard(info, activeTarget, acts); }).join('') + '</div>'
      : (targets.length
          ? '<div class="coach-empty">No targets match the current filter.</div>'
          : '<div class="coach-empty">No Targets Yet. Add a target or paste an Nmap scan below and the Cockpit immediately seeds recon moves.</div>');
    return { targets: targets, counts: counts, rowsHtml: rowsHtml };
  }

  function render() {
    var eng = OBOL.store.active();
    if (eng && eng.id !== _lastEngId) {
      if (_lastEngId !== null) {
        _filter = 'all';
        _query = '';
        _showBulk = false;
      }
      _lastEngId = eng.id;
    }
    var board = computeTargetBoard(eng);
    var targets = board.targets;
    var counts = board.counts;

    function filterPill(key, label, n) {
      var on = _filter === key;
      return '<button type="button" class="hb-tf-pill' + (on ? ' on' : '') + '" data-tf="' + key + '">'
        + esc(label) + ' <span class="hb-tf-n">' + n + '</span></button>';
    }

    var count = targets.length;
    return '<section class="targets">'
      + '<div class="targets-top-bar">'
      + '  <div>'
      + '    <h1 class="route-h1">Targets</h1>'
      + '    <p class="route-sub">Full-scope target board for this engagement. Focus any host for Cockpit &amp; Cruise, or open its Target Dossier for scoped moves, flags, and attack-path graph.</p>'
      + '  </div>'
      + '  <a class="cr-btn-glass small" href="#/home">&larr; Engagement Hub</a>'
      + '</div>'
      + '<div class="targets-add station-card neon-lane-cyan">'
      + '  <div class="targets-add-head">'
      + '    <div class="targets-add-h">Add A Target</div>'
      + '    <button type="button" class="cr-btn-neon neon-cyan small" id="t-toggle-bulk">' + (_showBulk ? 'Hide Bulk Nmap / Scope Paste' : '+ Bulk Paste Nmap / CIDR / /etc/hosts') + '</button>'
      + '  </div>'
      + '  <div class="targets-add-row">'
      + '    <label class="targets-add-field"><span>IP Or CIDR</span><input id="t-ip" class="ev-cmd" placeholder="e.g. 10.10.10.10 or 10.10.10.0/24" autocomplete="off" spellcheck="false" inputmode="decimal"></label>'
      + '    <label class="targets-add-field"><span>Hostname <span class="targets-add-opt">(Optional)</span></span><input id="t-host" class="ev-cmd" placeholder="e.g. dc01.corp.local" autocomplete="off" spellcheck="false"></label>'
      + '    <button id="t-add" class="cr-btn-neon neon-emerald targets-add-btn">Add Target</button>'
      + '  </div>'
      + '  <div id="t-bulk-box" class="hb-bulk-box ws-clear-box"' + (_showBulk ? '' : ' hidden') + '>'
      + '    <div class="hb-bulk-head">'
      + '      <span class="hb-bulk-title">Bulk-Paste Scope / Lab Briefing / Nmap `-sn` / `/etc/hosts`</span>'
      + '      <span class="muted small">Extracts IPs, hostnames, CIDRs, starting lab credentials &amp; open ports automatically</span>'
      + '    </div>'
      + '    <textarea id="t-bulk-input" class="hb-bulk-ta" rows="4" placeholder="10.10.10.10 dc01.corp.local&#10;10.10.10.20 sql01.corp.local&#10;Or paste an OffSec Credentials / Objectives tab or raw Nmap output..." spellcheck="false" autocorrect="off" autocapitalize="off" aria-describedby="t-bulk-preview"></textarea>'
      + '    <div id="t-bulk-preview" class="eng-scope-preview" role="status" aria-live="polite" hidden></div>'
      + '    <div class="hb-bulk-foot">'
      + '      <button type="button" class="cr-btn-neon neon-emerald small" id="t-bulk-go">Import &amp; Seed Recon Moves</button>'
      + '    </div>'
      + '  </div>'
      + '</div>'
      + '<div class="targets-grid-h">'
      + '  <div class="hb-board-title-wrap">'
      + '    <h2 class="coach-sec-h">In Scope</h2>'
      + '    <span class="pill">' + count + ' Target' + (count === 1 ? '' : 's') + '</span>'
      +      (count > 0 ? '<div class="hb-tf-bar">'
               + filterPill('all', 'All', counts.all)
               + (counts.foothold ? filterPill('foothold', 'Foothold / Creds', counts.foothold) : '')
               + (counts.privileged ? filterPill('privileged', 'Owned', counts.privileged) : '')
               + (counts.recon ? filterPill('recon', 'Recon / Enum', counts.recon) : '')
               + '</div>' : '')
      + '  </div>'
      +    ((count > 2 || _query) ? '<input id="t-search" class="ev-cmd targets-search" value="' + U.attr(_query) + '" placeholder="Filter by IP, hostname, OS, port..." autocomplete="off" spellcheck="false">' : '')
      + '</div>'
      + '<div id="t-results-wrap">' + board.rowsHtml + '</div>'
      + '</section>';
  }

  function sanitizeTargetVal(raw, allowCidr) {
    var s = String(raw || '').trim();
    if (/^https?:\/\//i.test(s)) {
      return s.replace(/^https?:\/\//i, '').replace(/(?::\d+)?(?:\/.*)?$/, '').trim();
    }
    if (allowCidr && /^(?:\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/.test(s)) return s;
    return s.replace(/(?::\d+)?(?:\/.*)?$/, '').trim();
  }

  function mounted(ctx) {
    var mount = ctx.mount;

    U.on(mount, 'change', '#t-ip', function (e, t) {
      var c = sanitizeTargetVal(t.value, true);
      if (c !== t.value) t.value = c;
    });
    U.on(mount, 'change', '#t-host', function (e, t) {
      var c = sanitizeTargetVal(t.value, false);
      if (c !== t.value) t.value = c;
    });

    var addBtn = document.getElementById('t-add');
    if (addBtn) addBtn.addEventListener('click', function () {
      var ip = sanitizeTargetVal(((document.getElementById('t-ip') || {}).value || ''), true);
      var host = sanitizeTargetVal(((document.getElementById('t-host') || {}).value || ''), false);
      if (!ip && !host) return;
      // If user entered a CIDR or space-separated pair in #t-ip and importBulk is available, support it seamlessly
      if (OBOL.targets && OBOL.targets.importBulk && (/\/\d{1,2}\b/.test(ip) || /\s/.test(ip))) {
        OBOL.targets.importBulk(ip + (host ? (' ' + host) : ''), function () {
          OBOL.router.render();
        });
        return;
      }
      var id = 't-' + Date.now().toString(36);
      var targetVal = ip || host;
      OBOL.store.update(function (eng) {
        eng.targets = eng.targets || [];
        eng.targets.push({ id: id, ip: targetVal, hostname: host, os: '' });
        if (!eng.params) eng.params = {};
        if (!eng.params.target) {
          eng.params.target = targetVal;
          eng.activeTarget = targetVal;
        }
      }, 'targets');
      var scope = 'host:' + targetVal;
      var newFacts = [
        OBOL.facts.makeFact({ kind: 'target.configured', scope: scope, source: 'targets' }),
      ];
      if (host) {
        var F = OBOL.facts;
        var parts = host.split('.');
        newFacts.push(F.makeFact({ kind: 'host.hostname', scope: scope, value: { name: parts[0], fqdn: parts.length > 1 ? host : '' }, state: F.ProofState.SUPPORTED, source: 'targets' }));
        if (parts.length > 1) {
          newFacts.push(F.makeFact({ kind: 'host.domain', scope: scope, value: { domain: parts.slice(1).join('.') }, state: F.ProofState.SUPPORTED, source: 'targets' }));
        }
      }
      OBOL.store.addFacts(newFacts, 'facts');
      OBOL.app.renderSidebar();
      U.toast('Target added, Cockpit updated');
      OBOL.router.render();
    });

    U.on(mount, 'click', '#t-toggle-bulk', function () {
      _showBulk = !_showBulk;
      OBOL.router.render();
      if (_showBulk) {
        setTimeout(function () {
          var ta = document.getElementById('t-bulk-input');
          if (ta) { try { ta.focus(); } catch (err) {} }
        }, 40);
      }
    });

    U.on(mount, 'input', '#t-bulk-input', function (e, ta) {
      var prevEl = document.getElementById('t-bulk-preview');
      if (!prevEl || !(OBOL.targets && OBOL.targets.parseBulkInput && OBOL.targets.renderScopePreviewHtml)) return;
      var raw = String(ta.value || '');
      if (!raw.trim()) { prevEl.innerHTML = ''; prevEl.hidden = true; return; }
      var lhost = (((OBOL.store.active() || {}).params || {}).lhost) || '';
      var parsed = OBOL.targets.parseBulkInput(raw, lhost);
      var html = OBOL.targets.renderScopePreviewHtml(parsed);
      prevEl.innerHTML = html;
      prevEl.hidden = !html;
    });

    U.on(mount, 'click', '#t-bulk-go', function (e, btn) {
      var ta = document.getElementById('t-bulk-input');
      var text = (ta && ta.value) || '';
      if (!text.trim()) { U.toast('Paste target IPs, CIDRs, lab credentials, or Nmap output first', 'err'); return; }
      if (!(OBOL.targets && OBOL.targets.importBulk)) return;
      btn.disabled = true;
      OBOL.targets.importBulk(text, function (res) {
        btn.disabled = false;
        if (!res || !res.ok) {
          U.toast('No valid target IPs, CIDRs, or lab credentials found in that paste', 'err');
          return;
        }
        _showBulk = false;
        var parts = [];
        if (res.arsenal && res.arsenal.ok) parts.push('Loadout stocked (' + res.arsenal.present + ' tools)');
        if (res.workspaceSync && res.workspaceSync.ok) parts.push('Workspace synced (' + res.workspaceSync.confirmed + ' confirmed)');
        if (res.added) parts.push(res.added + ' target' + (res.added === 1 ? '' : 's') + ' added');
        if (res.updated) parts.push(res.updated + ' updated');
        if (res.credsAdded) parts.push(res.credsAdded + ' starting cred' + (res.credsAdded === 1 ? '' : 's') + ' armed');
        if (res.scanFacts) parts.push(res.scanFacts + ' scan fact' + (res.scanFacts === 1 ? '' : 's') + ' minted');
        U.toast(parts.join(', ') || 'Scope updated');
        OBOL.router.render();
      });
    });

    U.on(mount, 'click', '.hb-tf-pill', function (e, btn) {
      _filter = btn.getAttribute('data-tf') || 'all';
      OBOL.router.render();
    });

    var searchInput = document.getElementById('t-search');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        _query = searchInput.value || '';
        var wrap = document.getElementById('t-results-wrap');
        if (wrap) {
          wrap.innerHTML = computeTargetBoard(OBOL.store.active()).rowsHtml;
        } else {
          OBOL.router.render();
        }
      });
    }

    U.on(mount, 'click', '[data-focus-ip]', function (e, btn) {
      e.preventDefault();
      e.stopPropagation();
      var ip = btn.getAttribute('data-focus-ip');
      if (!ip) return;
      if (OBOL.store.setActiveTarget) OBOL.store.setActiveTarget(ip);
      else OBOL.store.update(function (eng) { eng.params = eng.params || {}; eng.params.target = ip; eng.activeTarget = ip; }, 'params');
      if (OBOL.app && OBOL.app.renderSidebar) OBOL.app.renderSidebar();
      U.toast('Active target set to ' + ip);
      OBOL.router.render();
    });

    U.on(mount, 'click', '.btn-copy', function (e, b) {
      U.copy(b.getAttribute('data-copy')).then(function (ok) { U.toast(ok ? 'Command copied' : 'Copy failed', ok ? '' : 'err'); });
    });

    if (OBOL.targets && OBOL.targets.bindEditDrawer) {
      OBOL.targets.bindEditDrawer(mount);
    }

    U.on(mount, 'click', '.tcard-del', function (e, t) {
      var id = t.getAttribute('data-tid');
      if (OBOL.store.removeTarget) {
        OBOL.store.removeTarget(id);
      } else {
        OBOL.store.update(function (eng) {
          var removed = (eng.targets || []).find(function (x) { return x.id === id; });
          var removedIp = removed ? (removed.ip || removed.id) : null;
          eng.targets = (eng.targets || []).filter(function (x) { return x.id !== id; });
          if (removedIp) {
            eng.facts = (eng.facts || []).filter(function (f) { return f.scope !== 'host:' + removedIp; });
            eng.params = eng.params || {};
            if (eng.params.target === removedIp || eng.activeTarget === removedIp) {
              var nextIp = eng.targets[0] ? (eng.targets[0].ip || eng.targets[0].id) : '';
              if (nextIp) { eng.params.target = nextIp; eng.activeTarget = nextIp; }
              else { delete eng.params.target; eng.activeTarget = null; }
            }
          }
        }, 'targets');
      }
      if (OBOL.app && OBOL.app.renderSidebar) OBOL.app.renderSidebar();
      OBOL.router.render();
    });
  }

  OBOL.routes = OBOL.routes || {};
  OBOL.routes.targets = { render: render, mounted: mounted };
})(typeof globalThis !== 'undefined' ? globalThis : this);
