'use strict';

(function initActionFirstCardCleanupStabilizeV967(root) {
  const WAVE = 'v9.67-action-first-card-cleanup-stabilize';
  const STYLE_ID = 'obol-action-first-v967-style';
  const IDS = Object.freeze([
    'credential-dump-proof-chain',
    'web-proxy-transform-proof-chain',
    'web-client-controls',
    'web-authz-boundaries',
    'encoded-parameter-review',
    'tool-generated-http-review',
    'pass-the-hash-proof-chain',
    'pth-remote-exec-artifacts',
    'pth-token-filtering-check',
    'burp-intruder-fuzzing-workflow',
    'fuzzer-payload-position-review',
    'fuzzer-result-delta-review'
  ]);
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }
  function packet() { return root.OBOL_ACTION_FIRST_CARD_CLEANUP_PACKET_V967 || null; }
  function plans() { const p = packet(); return p && p.PLANS || {}; }
  function list(items) { return '<ul>' + (items || []).map(function(item) { return '<li>' + esc(item) + '</li>'; }).join('') + '</ul>'; }
  function commands(items) {
    if (!items || !items.length) return '<p>No terminal command is primary here. Follow the GUI workflow and paste the captured evidence.</p>';
    return items.map(function(entry) {
      return '<div class="obol-action-command"><strong>' + esc(entry.tool) + '</strong><pre><code>' + esc(entry.run) + '</code></pre><p><b>Use when:</b> ' + esc(entry.when) + '</p><p><b>Evidence:</b> ' + esc(entry.evidence) + '</p></div>';
    }).join('');
  }
  function ensureStyle() {
    if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = '.obol-action-first-v967{margin:0 auto 1rem;max-width:76rem;border:1px solid rgba(94,234,168,.45);background:rgba(6,22,22,.92);border-radius:14px;padding:1rem 1.15rem;color:#d9fff0;box-shadow:0 0 0 1px rgba(94,234,168,.08),0 18px 38px rgba(0,0,0,.28)}.obol-action-first-v967 h2{margin:.15rem 0 .5rem;font-size:1.12rem}.obol-action-first-v967 h3{margin:.75rem 0 .35rem;font-size:.85rem;color:#7dd3fc;text-transform:uppercase;letter-spacing:.06em}.obol-action-kicker{font-size:.72rem;text-transform:uppercase;letter-spacing:.12em;color:#facc15}.obol-action-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(18rem,1fr));gap:.85rem}.obol-action-command{border:1px solid rgba(148,163,184,.22);border-radius:10px;padding:.65rem;margin:.45rem 0;background:rgba(15,23,42,.72)}.obol-action-command pre{white-space:pre-wrap;margin:.45rem 0;padding:.55rem;border-radius:8px;background:#050816;color:#e5e7eb;overflow:auto}.obol-action-first-v967 ul{margin:.2rem 0 .7rem 1.1rem}.obol-action-first-v967 li{margin:.22rem 0}.obol-action-note{border-top:1px solid rgba(148,163,184,.18);margin-top:.8rem;padding-top:.65rem;color:#a7f3d0;font-size:.85rem}';
    document.head.appendChild(style);
  }
  function panel(id, plan) {
    return '<section class="obol-action-first-v967" data-obol-action-first-v967="' + esc(id) + '">' +
      '<div class="obol-action-kicker">v9.67 action-first cleanup</div>' +
      '<h2>Try this first</h2><p>' + esc(plan.goal) + '</p>' +
      '<div class="obol-action-grid"><div><h3>Commands</h3>' + commands(plan.commands) + '</div><div><h3>GUI workflow</h3>' + list(plan.guiSteps) + '</div></div>' +
      '<div class="obol-action-grid"><div><h3>Paste back</h3>' + list(plan.evidenceToPaste) + '</div><div><h3>Decide</h3>' + list(plan.decide) + '</div></div>' +
      '<h3>Next</h3>' + list(plan.next) +
      '<p class="obol-action-note">Field notes below are supporting context. This card should be useful from the action panel alone.</p>' +
      '</section>';
  }
  function inject() {
    if (typeof document === 'undefined' || !root.location) return false;
    const match = String(root.location.hash || '').match(/^#\/card\/([^/?#]+)/);
    if (!match) return false;
    const id = decodeURIComponent(match[1]);
    if (!IDS.includes(id)) return false;
    const plan = plans()[id];
    const view = document.getElementById('view') || document.querySelector('main') || document.body;
    if (!plan || !view) return false;
    ensureStyle();
    const selector = '[data-obol-action-first-v967="' + id.replace(/"/g, '\\"') + '"]';
    if (view.querySelector(selector)) return true;
    const holder = document.createElement('div');
    holder.innerHTML = panel(id, plan);
    const el = holder.firstElementChild;
    if (!el) return false;
    view.insertBefore(el, view.firstChild);
    root.OBOL_ACTION_FIRST_CARD_CLEANUP_STABILIZE_V967 = Object.freeze({ wave: WAVE, status: 'rendered', id });
    return true;
  }
  function attempt() {
    const p = packet();
    if (p && typeof p.install === 'function') p.install();
    return inject();
  }
  let tries = 0;
  function loop() {
    attempt();
    tries += 1;
    if (typeof root.setTimeout === 'function' && tries < 220) root.setTimeout(loop, tries < 30 ? 50 : 250);
  }
  if (typeof window !== 'undefined') {
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('hashchange', loop);
      window.addEventListener('focus', loop);
      window.addEventListener('DOMContentLoaded', loop);
    }
    loop();
  } else {
    attempt();
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { attempt, inject };
})(typeof window !== 'undefined' ? window : globalThis);
