'use strict';

(function initBurpIntruderRouteGuardV965(root) {
  const WAVE = 'v9.65-burp-intruder-route-guard';
  const PROOF_FILE = 'data/product-hardening/burp-intruder-route-guard-v9.65.js';
  const REQUIRED_VISIBLE_ROUTES = Object.freeze([
    'burp-intruder-fuzzing-workflow',
    'fuzzer-payload-position-review',
    'fuzzer-result-delta-review',
  ]);

  function freezeList(list) { return Object.freeze((list || []).slice()); }
  function freezeObject(value) { return Object.freeze(value || {}); }
  function routeCardId() {
    const hash = String(root.location && root.location.hash || '');
    const match = hash.match(/^#\/?card\/([^/?#]+)/);
    try { return match ? decodeURIComponent(match[1]) : ''; } catch (_err) { return match ? match[1] : ''; }
  }
  function liveCard(id) {
    if (!id) return null;
    if (typeof root.liveCardById === 'function') { try { const found = root.liveCardById(id); if (found) return found; } catch (_err) {} }
    if (root.CARDS && root.CARDS[id]) return root.CARDS[id];
    const lanes = Array.isArray(root.OBOL_LANES) ? root.OBOL_LANES : Array.isArray(root.LANES) ? root.LANES : [];
    for (const lane of lanes) for (const card of lane.cards || []) if (card && card.id === id) return card;
    return null;
  }
  function ensureLane() {
    if (typeof root.laneById === 'function') { try { return root.laneById('web-fuzzing', 'Web Fuzzing', 'Initial Access & Web'); } catch (_err) {} }
    const lanes = Array.isArray(root.OBOL_LANES) ? root.OBOL_LANES : Array.isArray(root.LANES) ? root.LANES : null;
    if (!lanes) return null;
    let lane = lanes.find((entry) => entry && entry.lane === 'web-fuzzing');
    if (!lane) { lane = { lane: 'web-fuzzing', title: 'Web Fuzzing', phase: 'Initial Access & Web', cards: [] }; lanes.push(lane); }
    if (!Array.isArray(lane.cards)) lane.cards = [];
    return lane;
  }
  function fallbackCard(id) {
    const cards = {
      'burp-intruder-fuzzing-workflow': {
        title: 'Burp Intruder Fuzzing Workflow',
        hypothesis: 'Use proxy-integrated fuzzing when request context matters. Capture the original request, mark the payload position, bound the payload source, preserve payload processing and encoding, then manually replay interesting response deltas before calling them findings.',
        prereq: { any: ['service.http', 'web.fuzzer_workflow_observed', 'web.fuzzer_payload_position_observed'] },
        produces: ['web.fuzzer.workflow_reviewed', 'web.fuzzer.manual_replay_required'],
        expected: ['request captured', 'payload position named', 'payload source bounded', 'candidate replayed manually'],
        report: { finding: 'Web Fuzzer Candidate Triage', severity: 'medium' },
        tools: ['Burp Intruder', 'OWASP ZAP Fuzzer', 'ffuf', 'gobuster'],
      },
      'fuzzer-payload-position-review': {
        title: 'Review Fuzzer Payload Position and Transforms',
        hypothesis: 'Before trusting a fuzzer result, identify exactly where the payload entered the request and what transformations happened before it reached the server.',
        prereq: { any: ['web.fuzzer_payload_position_observed', 'web.fuzzer_payload_transform_observed'] },
        produces: ['web.fuzzer.payload_position_reviewed'],
        expected: ['insertion point marked', 'unchanged request context preserved', 'payload transforms recorded'],
        report: { finding: 'Fuzzer Payload Position and Transform Review', severity: 'info' },
        tools: ['Burp Intruder', 'OWASP ZAP Fuzzer', 'CyberChef'],
      },
      'fuzzer-result-delta-review': {
        title: 'Review Fuzzer Response Deltas Before Reporting',
        hypothesis: 'Status, size, word-count, and grep-match differences are candidate signals. The path moves only after manual replay confirms what changed and whether it matters.',
        prereq: { any: ['web.fuzzer_response_delta_observed', 'web.fuzzer_hit_candidate_observed'] },
        produces: ['web.fuzzer.response_delta_reviewed', 'web.fuzzer.candidate_replayed'],
        expected: ['candidate sorted by signal', 'manual replay performed', 'response body reviewed'],
        report: { finding: 'Fuzzer Response Delta Manual Replay', severity: 'medium' },
        tools: ['Burp Intruder', 'OWASP ZAP Fuzzer', 'ffuf', 'gobuster'],
      },
    };
    const base = cards[id];
    if (!base) return null;
    return freezeObject({
      id,
      lane: 'web-fuzzing',
      ...base,
      commands: [],
      defender: 'Fuzzing can generate obvious request bursts. Keep rate, scope, authentication state, and replay evidence explicit before reporting.',
      refs: [],
      sourceMinedRouteGuard65: freezeObject({ proof: PROOF_FILE, wave: WAVE }),
    });
  }
  function publishCard(card) {
    if (!card || (liveCard(card.id) && !(liveCard(card.id).sourceMinedRouteGuard64 || liveCard(card.id).sourceMinedRouteGuard65))) return false;
    const lanes = Array.isArray(root.OBOL_LANES) ? root.OBOL_LANES : Array.isArray(root.LANES) ? root.LANES : [];
    for (const lane of lanes) {
      if (!Array.isArray(lane.cards)) continue;
      const index = lane.cards.findIndex((entry) => entry && entry.id === card.id);
      if (index >= 0) lane.cards.splice(index, 1);
    }
    if (root.CARDS && typeof root.CARDS === 'object') try { delete root.CARDS[card.id]; } catch (_err) {}
    const lane = ensureLane();
    if (!lane) return false;
    if (typeof root.addCardAfter === 'function') { try { const ok = root.addCardAfter(lane, '', card); if (ok || liveCard(card.id)) return true; } catch (_err) {} }
    lane.cards.push(card);
    if (root.CARDS && typeof root.CARDS === 'object') root.CARDS[card.id] = card;
    return !!liveCard(card.id);
  }
  function installMissingCards() {
    return REQUIRED_VISIBLE_ROUTES.map((id) => {
      const existing = liveCard(id);
      if (existing && !(existing.sourceMinedRouteGuard64 || existing.sourceMinedRouteGuard65)) return true;
      return publishCard(fallbackCard(id));
    }).every(Boolean);
  }
  function validate() {
    const failures = [];
    for (const id of REQUIRED_VISIBLE_ROUTES) {
      const card = liveCard(id);
      if (!card) failures.push('Missing v9.65 live fuzzer card route ' + id);
      else if (!card.prereq || !card.produces || !card.expected || !card.lane) failures.push('v9.65 fuzzer card lacks path shape ' + id);
    }
    return freezeList(failures);
  }
  function currentRouteNeedsRepair() {
    const id = routeCardId();
    if (!REQUIRED_VISIBLE_ROUTES.includes(id)) return false;
    const view = root.document && root.document.getElementById && root.document.getElementById('view');
    const text = String(view && view.textContent || '');
    return /Unknown card/i.test(text) || !text.trim();
  }
  function repaintCurrentCardRoute() {
    if (!currentRouteNeedsRepair()) return false;
    if (typeof root.route === 'function') { try { root.route(); return true; } catch (_err) {} }
    if (typeof root.viewCard === 'function') { try { root.viewCard(routeCardId()); return true; } catch (_err) {} }
    return false;
  }
  function patchViewCard() {
    if (typeof root.viewCard !== 'function') return false;
    if (root.viewCard.__burpIntruderRouteGuardV965) return true;
    const original = root.viewCard;
    root.viewCard = function burpIntruderRouteGuardViewCard(id) {
      installMissingCards();
      return original.apply(this, arguments);
    };
    root.viewCard.__burpIntruderRouteGuardV965 = true;
    return true;
  }
  function integrate() {
    const cardsInstalled = installMissingCards();
    const viewPatched = patchViewCard();
    const repaired = repaintCurrentCardRoute();
    const failures = validate();
    root.OBOL_BURP_INTRUDER_ROUTE_GUARD_V965 = freezeObject({ wave: WAVE, status: failures.length ? 'partial' : 'live-integrated', requiredVisibleRoutes: freezeList(REQUIRED_VISIBLE_ROUTES), cardsInstalled, viewPatched, repaired, failures, proofFile: PROOF_FILE });
    return root.OBOL_BURP_INTRUDER_ROUTE_GUARD_V965;
  }

  const packet = freezeObject({ wave: WAVE, proofFile: PROOF_FILE, requiredVisibleRoutes: freezeList(REQUIRED_VISIBLE_ROUTES), integrate, validate });
  root.OBOL_BURP_INTRUDER_ROUTE_GUARD_PACKET_V965 = packet;
  const first = integrate();
  if (typeof window !== 'undefined') {
    let tries = 0;
    const schedule = typeof window.setTimeout === 'function' ? window.setTimeout.bind(window) : null;
    const attempt = () => { const result = integrate(); tries += 1; if ((result.failures.length || !result.viewPatched || currentRouteNeedsRepair()) && tries < 180 && schedule) schedule(attempt, 50); };
    if ((first.failures.length || !first.viewPatched || currentRouteNeedsRepair()) && schedule) schedule(attempt, 0);
    if (typeof window.addEventListener === 'function') { window.addEventListener('hashchange', attempt); window.addEventListener('focus', attempt); }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = packet;
})(typeof window !== 'undefined' ? window : globalThis);
