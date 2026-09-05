'use strict';

(function initNoteCardRouteGuardV964(root) {
  const WAVE = 'v9.64-note-card-route-guard';
  const PROOF_FILE = 'data/product-hardening/note-card-route-guard-v9.64.js';
  const LEGACY_TOPIC_ALIASES = Object.freeze([
    'credentials',
    'authentication',
    'web-auth',
    'active-directory',
    'cracking',
    'password-spraying',
    'protected-files',
    'ssh',
    'xss',
    'web-client-side',
  ]);
  const REQUIRED_VISIBLE_ROUTES = Object.freeze([
    'credential-dump-proof-chain',
    'web-proxy-transform-proof-chain',
    'web-client-controls',
    'web-authz-boundaries',
    'encoded-parameter-review',
    'tool-generated-http-review',
    'pass-the-hash-proof-chain',
    'pth-remote-exec-artifacts',
    'pth-token-filtering-check',
  ]);

  function freezeList(list) { return Object.freeze((list || []).slice()); }
  function freezeObject(value) { return Object.freeze(value || {}); }
  function unique(list) { return Array.from(new Set((list || []).filter(Boolean))); }
  function titleize(id) { return String(id || '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()); }
  function routeCardId() {
    const hash = String(root.location && root.location.hash || '');
    const match = hash.match(/^#\/?card\/([^/?#]+)/);
    try { return match ? decodeURIComponent(match[1]) : ''; } catch (_err) { return match ? match[1] : ''; }
  }
  function fieldNotes() {
    const notes = root.OBOL_NOTE_INTEGRATION && Array.isArray(root.OBOL_NOTE_INTEGRATION.publicFieldNotes)
      ? root.OBOL_NOTE_INTEGRATION.publicFieldNotes
      : [];
    return notes.filter((note) => note && note.id);
  }
  function packetCardIds() {
    const out = [];
    Object.keys(root || {}).forEach((key) => {
      if (!/^OBOL_.*(?:REMINING|CARDS|PACKET).*V\d+/i.test(key)) return;
      const value = root[key];
      if (value && Array.isArray(value.cardIds)) value.cardIds.forEach((id) => out.push(id));
      if (value && Array.isArray(value.publicNotes)) {
        value.publicNotes.forEach((note) => Array.isArray(note && note.cardIds) && note.cardIds.forEach((id) => out.push(id)));
      }
    });
    return out;
  }
  function noteCardIds() {
    const ids = [];
    fieldNotes().forEach((note) => Array.isArray(note.cardIds) && note.cardIds.forEach((id) => ids.push(id)));
    return unique(ids.concat(packetCardIds(), Array.from(REQUIRED_VISIBLE_ROUTES)))
      .filter((id) => id && id !== 'path' && !LEGACY_TOPIC_ALIASES.includes(id));
  }
  function notesForCard(id) {
    return fieldNotes().filter((note) => Array.isArray(note.cardIds) && note.cardIds.includes(id));
  }
  function liveCard(id) {
    if (!id) return null;
    if (typeof root.liveCardById === 'function') {
      try { const found = root.liveCardById(id); if (found) return found; } catch (_err) {}
    }
    if (root.CARDS && root.CARDS[id]) return root.CARDS[id];
    const lanes = Array.isArray(root.OBOL_LANES) ? root.OBOL_LANES : Array.isArray(root.LANES) ? root.LANES : [];
    for (const lane of lanes) for (const card of lane.cards || []) if (card && card.id === id) return card;
    return null;
  }
  function ensureLane() {
    if (typeof root.laneById === 'function') {
      try { return root.laneById('source-mined-cards', 'Source-Mined Cards', 'Methodology'); } catch (_err) {}
    }
    const lanes = Array.isArray(root.OBOL_LANES) ? root.OBOL_LANES : Array.isArray(root.LANES) ? root.LANES : null;
    if (!lanes) return null;
    let lane = lanes.find((entry) => entry && entry.lane === 'source-mined-cards');
    if (!lane) { lane = { lane: 'source-mined-cards', title: 'Source-Mined Cards', phase: 'Methodology', cards: [] }; lanes.push(lane); }
    if (!Array.isArray(lane.cards)) lane.cards = [];
    return lane;
  }
  function publishCard(lane, card) {
    if (!lane || !card || liveCard(card.id)) return false;
    card.lane = card.lane || lane.lane || 'source-mined-cards';
    if (typeof root.addCardAfter === 'function') {
      try { const ok = root.addCardAfter(lane, '', card); if (ok || liveCard(card.id)) return true; } catch (_err) {}
    }
    if (Array.isArray(lane.cards)) lane.cards.push(card);
    if (root.CARDS && typeof root.CARDS === 'object') root.CARDS[card.id] = card;
    return !!liveCard(card.id);
  }
  function fallbackCard(id) {
    const notes = notesForCard(id);
    const tools = unique(notes.flatMap((note) => Array.isArray(note.toolIds) ? note.toolIds : []));
    const tags = unique(notes.flatMap((note) => Array.isArray(note.tags) ? note.tags : []));
    const body = notes.length
      ? notes.map((note) => (note.title ? note.title + ': ' : '') + String(note.body || '').trim()).filter(Boolean).join(' ')
      : 'This note-derived route was referenced by Product Hardening source-mining output. Review the related source-mined Field Notes and keep proof, scope, cleanup, and reporting boundaries explicit before moving the path.';
    return {
      id,
      title: notes[0] && notes[0].title ? notes[0].title : titleize(id),
      hypothesis: body || titleize(id),
      prereq: { any: ['scope.defined', 'service.http', 'credential.candidate', 'foothold.windows', 'foothold.linux'] },
      produces: ['source_mined.card_reviewed'],
      commands: [],
      expected: ['public-safe note-derived route resolves', 'proof boundary reviewed', 'scope recorded'],
      defender: 'Source-mined cards are guidance and evidence-review surfaces. They do not execute commands automatically and should keep raw secrets, target-specific values, and private lab answer strings out of reports.',
      report: { finding: titleize(id), severity: tags.includes('credential') || tags.includes('remote-exec') ? 'high' : 'info' },
      tools,
      refs: [],
      sourceMinedRouteGuard64: { proof: PROOF_FILE, wave: WAVE, noteIds: notes.map((note) => note.id) },
    };
  }
  function installMissingCards() {
    const lane = ensureLane();
    if (!lane) return false;
    const ids = noteCardIds();
    ids.forEach((id) => { if (!liveCard(id)) publishCard(lane, fallbackCard(id)); });
    return ids.every((id) => !!liveCard(id));
  }
  function validate() {
    const failures = [];
    noteCardIds().forEach((id) => { if (!liveCard(id)) failures.push('Missing live note-derived card route ' + id); });
    REQUIRED_VISIBLE_ROUTES.forEach((id) => { if (!liveCard(id)) failures.push('Required visible card route still missing ' + id); });
    return freezeList(unique(failures));
  }
  function currentRouteNeedsRepair() {
    const id = routeCardId();
    if (!id || !liveCard(id)) return false;
    const view = root.document && root.document.getElementById && root.document.getElementById('view');
    const text = String(view && view.textContent || '');
    return /Unknown card/i.test(text) || !text.trim();
  }
  function repaintCurrentCardRoute() {
    if (!currentRouteNeedsRepair()) return false;
    const key = routeCardId() + ':' + String(root.location && root.location.hash || '');
    if (root.__OBOL_NOTE_CARD_ROUTE_GUARD_LAST_REPAINT__ === key) return false;
    root.__OBOL_NOTE_CARD_ROUTE_GUARD_LAST_REPAINT__ = key;
    if (typeof root.route === 'function') {
      try { root.route(); return true; } catch (_err) {}
    }
    if (typeof root.viewCard === 'function') {
      try { root.viewCard(routeCardId()); return true; } catch (_err) {}
    }
    return false;
  }
  function patchViewCard() {
    if (typeof root.viewCard !== 'function') return false;
    if (root.viewCard.__noteCardRouteGuardV964) return true;
    const original = root.viewCard;
    root.viewCard = function noteCardRouteGuardViewCard(id) {
      installMissingCards();
      return original.apply(this, arguments);
    };
    root.viewCard.__noteCardRouteGuardV964 = true;
    return true;
  }
  function integrate() {
    const cardsInstalled = installMissingCards();
    const viewPatched = patchViewCard();
    const repaired = repaintCurrentCardRoute();
    const failures = validate();
    root.OBOL_NOTE_CARD_ROUTE_GUARD_V964 = freezeObject({
      wave: WAVE,
      status: failures.length ? 'partial' : 'live-integrated',
      requiredVisibleRoutes: freezeList(REQUIRED_VISIBLE_ROUTES),
      noteCardIds: freezeList(noteCardIds()),
      cardsInstalled,
      viewPatched,
      repaired,
      failures,
      proofFile: PROOF_FILE,
    });
    return root.OBOL_NOTE_CARD_ROUTE_GUARD_V964;
  }
  const packet = freezeObject({ wave: WAVE, proofFile: PROOF_FILE, requiredVisibleRoutes: freezeList(REQUIRED_VISIBLE_ROUTES), legacyTopicAliases: freezeList(LEGACY_TOPIC_ALIASES), integrate, validate });
  root.OBOL_NOTE_CARD_ROUTE_GUARD_PACKET_V964 = packet;
  const first = integrate();
  if (typeof window !== 'undefined') {
    let tries = 0;
    const schedule = typeof window.setTimeout === 'function' ? window.setTimeout.bind(window) : null;
    const attempt = () => {
      const result = integrate();
      tries += 1;
      if ((result.failures.length || !result.viewPatched) && tries < 180 && schedule) schedule(attempt, 50);
    };
    if ((first.failures.length || !first.viewPatched) && schedule) schedule(attempt, 0);
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('hashchange', attempt);
      window.addEventListener('focus', attempt);
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = packet;
})(typeof window !== 'undefined' ? window : globalThis);
