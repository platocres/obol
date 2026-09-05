'use strict';

(function initVisibleRemineCardsV963(root) {
  const WAVE = 'v9.63-visible-remine-cards';
  const PROOF_FILE = 'data/product-hardening/visible-remine-cards-v9.63.js';
  const CARD_IDS = Object.freeze([
    'credential-dump-proof-chain',
    'web-proxy-transform-proof-chain',
    'web-client-controls',
    'web-authz-boundaries',
    'encoded-parameter-review',
    'tool-generated-http-review',
  ]);
  const NOTE_IDS = Object.freeze([
    'note-lsass-dump-artifact-proof-chain',
    'note-offline-parser-output-needs-material-classification',
    'note-hash-crack-does-not-prove-service-access',
    'note-client-controls-are-request-shaping-clues',
    'note-encoded-cookie-transform-order',
    'note-capture-tool-http-before-debugging',
  ]);

  function freezeList(list) { return Object.freeze((list || []).slice()); }
  function freezeObject(value) { return Object.freeze(value || {}); }

  function routeCardId() {
    const hash = String(root.location && root.location.hash || '');
    const match = hash.match(/^#\/?card\/([^/?#]+)/);
    try { return match ? decodeURIComponent(match[1]) : ''; } catch (_err) { return match ? match[1] : ''; }
  }

  function noteById(id) {
    const notes = root.OBOL_NOTE_INTEGRATION && Array.isArray(root.OBOL_NOTE_INTEGRATION.publicFieldNotes)
      ? root.OBOL_NOTE_INTEGRATION.publicFieldNotes
      : [];
    return notes.find((note) => note && note.id === id) || null;
  }

  function noteText(ids, fallback) {
    const chunks = ids.map(noteById).filter(Boolean).map((note) => {
      const title = note.title ? note.title + ': ' : '';
      return title + String(note.body || '').trim();
    }).filter(Boolean);
    return chunks.length ? chunks.join(' ') : fallback;
  }

  function liveCard(id) {
    if (!id) return null;
    if (typeof root.liveCardById === 'function') {
      try { return root.liveCardById(id); } catch (_err) { return null; }
    }
    if (root.CARDS && root.CARDS[id]) return root.CARDS[id];
    const lanes = Array.isArray(root.OBOL_LANES) ? root.OBOL_LANES : Array.isArray(root.LANES) ? root.LANES : [];
    for (const lane of lanes) for (const card of lane.cards || []) if (card && card.id === id) return card;
    return null;
  }

  function ensureLane(id, title, phase) {
    if (typeof root.laneById === 'function') return root.laneById(id, title, phase);
    const lanes = Array.isArray(root.OBOL_LANES) ? root.OBOL_LANES : Array.isArray(root.LANES) ? root.LANES : [];
    let lane = lanes.find((entry) => entry && entry.lane === id);
    if (!lane) {
      lane = { lane: id, title: title || id, phase: phase || title || id, cards: [] };
      lanes.push(lane);
    }
    if (!Array.isArray(lane.cards)) lane.cards = [];
    if (Array.isArray(root.OBOL_LANES)) root.OBOL_LANES = lanes;
    else root.LANES = lanes;
    return lane;
  }

  function publishCard(lane, afterId, card) {
    if (!lane || !card || liveCard(card.id)) return false;
    card.lane = card.lane || lane.lane;
    if (typeof root.addCardAfter === 'function') return root.addCardAfter(lane, afterId, card);
    if (!Array.isArray(lane.cards)) lane.cards = [];
    const index = lane.cards.findIndex((entry) => entry && entry.id === afterId);
    lane.cards.splice(index >= 0 ? index + 1 : lane.cards.length, 0, card);
    if (root.CARDS && typeof root.CARDS === 'object') root.CARDS[card.id] = card;
    return true;
  }

  function cardNotes(ids) {
    return ids.map(noteById).filter(Boolean).map((note) => note.id);
  }

  function buildCards() {
    return [
      {
        id: 'credential-dump-proof-chain',
        lane: 'credential-attacks',
        title: 'Credential Dump Proof Chain',
        hypothesis: noteText([
          'note-lsass-dump-artifact-proof-chain',
          'note-offline-parser-output-needs-material-classification',
          'note-hash-crack-does-not-prove-service-access',
        ], 'Treat memory dumps, parser output, extracted material, cracking, and scoped authentication as separate Evidence states. A dump, hash, or cracked candidate is useful only after the exact material class and validation scope are proven.'),
        prereq: { any: ['foothold.windows', 'credential.candidate', 'credential.lsass_dump_artifact_observed', 'credential.offline_dump_parser_output_observed'] },
        produces: ['credential.candidate', 'credential.validation.required'],
        commands: freezeList([]),
        expected: freezeList(['dump artifact observed', 'material class identified', 'scoped validation captured']),
        defender: 'Memory dumps and credential material are sensitive artifacts. Keep raw secrets out of notes and reports, and track cleanup separately.',
        report: { finding: 'Credential Dump Evidence Review', severity: 'high' },
        tools: freezeList(['pypykatz', 'mimikatz', 'hashcat']),
        refs: freezeList([]),
        sourceMined63: freezeObject({ proof: PROOF_FILE, notes: cardNotes(['note-lsass-dump-artifact-proof-chain', 'note-offline-parser-output-needs-material-classification', 'note-hash-crack-does-not-prove-service-access']) }),
      },
      {
        id: 'web-proxy-transform-proof-chain',
        lane: 'web-proxy-transform',
        title: 'Web Proxy Transform Proof Chain',
        hypothesis: 'Use the proxy workflow to keep browser edits, decode and encode steps, payload-processing changes, response deltas, and replayed server behavior as separate proof stages. A clever request mutation is a lead; reviewed server-side behavior is the proof.',
        prereq: { any: ['service.http', 'web.client_control_mutation_observed', 'web.reversible_transform_chain_observed', 'web.tool_generated_http_capture_observed'] },
        produces: ['web.transform-chain.reviewed', 'web.scoped-server-behavior.required'],
        commands: freezeList([]),
        expected: freezeList(['original request captured', 'one transform changed at a time', 'server behavior reviewed']),
        defender: 'Proxy replay and payload mutation can create noisy request patterns. Keep scope, rate, and response-body review explicit.',
        report: { finding: 'Web Proxy Transform Chain Reviewed', severity: 'medium' },
        tools: freezeList(['Burp Suite', 'OWASP ZAP', 'CyberChef']),
        refs: freezeList([]),
        sourceMined63: freezeObject({ proof: PROOF_FILE, notes: cardNotes(['note-client-controls-are-request-shaping-clues', 'note-encoded-cookie-transform-order', 'note-capture-tool-http-before-debugging']) }),
      },
      {
        id: 'web-client-controls',
        lane: 'web-proxy-transform',
        title: 'Review Client-Side Controls as Request-Shaping Clues',
        hypothesis: noteText(['note-client-controls-are-request-shaping-clues'], 'Disabled controls, hidden fields, local validation, and browser-side markup changes show how a request can be shaped. They do not prove backend authorization failure until the server accepts a scoped action or returns protected content.'),
        prereq: { any: ['service.http', 'web.client_control_mutation_observed'] },
        produces: ['web.client-control.reviewed'],
        commands: freezeList([]),
        expected: freezeList(['original state recorded', 'mutated request captured', 'server response compared']),
        defender: 'Client-side edits are usually low-noise, but repeated submissions can still create logs. Preserve original and modified requests for reporting.',
        report: { finding: 'Client-Side Control Boundary Reviewed', severity: 'info' },
        tools: freezeList(['browser-devtools', 'Burp Suite', 'OWASP ZAP']),
        refs: freezeList([]),
        sourceMined63: freezeObject({ proof: PROOF_FILE, notes: cardNotes(['note-client-controls-are-request-shaping-clues']) }),
      },
      {
        id: 'web-authz-boundaries',
        lane: 'web-proxy-transform',
        title: 'Separate Client Bypass from Server Authorization',
        hypothesis: 'Changing a disabled field, hidden value, or local browser check proves only that the client can be altered. Authorization impact requires a scoped server response: the action is accepted, protected content changes, or a permission boundary is crossed in a way the report can defend.',
        prereq: { any: ['service.http', 'web.client_control_mutation_observed', 'web.scoped_server_behavior_observed'] },
        produces: ['web.authorization-boundary.reviewed'],
        commands: freezeList([]),
        expected: freezeList(['client mutation separated from backend response', 'permission boundary named', 'scoped server-side effect captured']),
        defender: 'Authorization testing should avoid broad or destructive actions. Keep the tested identity, object, action, and response body visible.',
        report: { finding: 'Web Authorization Boundary Reviewed', severity: 'medium' },
        tools: freezeList(['Burp Suite', 'OWASP ZAP', 'browser-devtools']),
        refs: freezeList([]),
        sourceMined63: freezeObject({ proof: PROOF_FILE, notes: cardNotes(['note-client-controls-are-request-shaping-clues']) }),
      },
      {
        id: 'encoded-parameter-review',
        lane: 'web-proxy-transform',
        title: 'Review Encoded Parameters in Transform Order',
        hypothesis: noteText(['note-encoded-cookie-transform-order'], 'When a cookie or parameter is transformed through multiple encodings, preserve the decode order, mutate only the intended inner value, then rebuild the outbound value in reverse order. The rebuilt request still needs response-body review before it becomes impact proof.'),
        prereq: { any: ['service.http', 'web.reversible_transform_chain_observed', 'web.encoded_cookie_candidate_observed'] },
        produces: ['web.encoded-parameter.reviewed'],
        commands: freezeList([]),
        expected: freezeList(['decode order recorded', 'inner value changed deliberately', 'outbound value rebuilt in reverse order']),
        defender: 'Encoded parameter fuzzing can produce large request sets. Keep payload lists bounded and compare response bodies, not only sizes.',
        report: { finding: 'Encoded Parameter Transform Chain Reviewed', severity: 'medium' },
        tools: freezeList(['CyberChef', 'Burp Intruder', 'OWASP ZAP']),
        refs: freezeList([]),
        sourceMined63: freezeObject({ proof: PROOF_FILE, notes: cardNotes(['note-encoded-cookie-transform-order']) }),
      },
      {
        id: 'tool-generated-http-review',
        lane: 'web-proxy-transform',
        title: 'Capture Tool-Generated HTTP Before Debugging',
        hypothesis: noteText(['note-capture-tool-http-before-debugging'], 'When a scanner or framework module behaves strangely, capture the exact HTTP it generates before changing assumptions. Compare the produced method, path, host, headers, body, proxy settings, and response class against the manual request you intended.'),
        prereq: { any: ['service.http', 'web.tool_generated_http_capture_observed'] },
        produces: ['web.tool-http.reviewed'],
        commands: freezeList([]),
        expected: freezeList(['generated request captured', 'manual replay compared', 'tool assumption isolated']),
        defender: 'Framework modules can send recognizable traffic. Capturing the generated request first keeps troubleshooting bounded and reportable.',
        report: { finding: 'Tool-Generated HTTP Reviewed', severity: 'info' },
        tools: freezeList(['Metasploit', 'Burp Suite', 'OWASP ZAP']),
        refs: freezeList([]),
        sourceMined63: freezeObject({ proof: PROOF_FILE, notes: cardNotes(['note-capture-tool-http-before-debugging']) }),
      },
    ];
  }

  function installCards() {
    if (typeof root.laneById !== 'function' && !Array.isArray(root.OBOL_LANES) && !Array.isArray(root.LANES)) return false;
    if (typeof root.addCardAfter !== 'function' && !root.CARDS) return false;
    const credentialLane = ensureLane('credential-attacks', 'Credential Attacks', 'Credential Attacks');
    const webLane = ensureLane('web-proxy-transform', 'Web Proxy Transform Review', 'Initial Access & Web');
    const cardRows = buildCards();
    const before = cardRows.filter((card) => liveCard(card.id)).length;
    publishCard(credentialLane, 'windows-local-password-attacks', cardRows[0]);
    let after = '';
    for (const card of cardRows.slice(1)) {
      publishCard(webLane, after, card);
      after = card.id;
    }
    const installed = cardRows.filter((card) => liveCard(card.id)).length;
    root.OBOL_VISIBLE_REMINED_CARD_IDS_V963 = freezeList(CARD_IDS);
    root.OBOL_VISIBLE_REMINED_CARDS_V963 = freezeObject({
      wave: WAVE,
      status: installed === CARD_IDS.length ? 'live-integrated' : 'partial',
      cardIds: freezeList(CARD_IDS),
      noteIds: freezeList(NOTE_IDS),
      installedCount: installed,
      alreadyPresentCount: before,
      proofFile: PROOF_FILE,
    });
    return installed === CARD_IDS.length;
  }

  function currentRouteNeedsRepair() {
    const id = routeCardId();
    if (!CARD_IDS.includes(id) || !liveCard(id)) return false;
    const target = root.document && root.document.getElementById && root.document.getElementById('view');
    const text = String(target && target.textContent || '');
    return /Unknown card/i.test(text) || !text.trim();
  }

  function repaintCurrentCardRoute() {
    if (!currentRouteNeedsRepair()) return false;
    const key = routeCardId() + ':' + String(root.location && root.location.hash || '');
    if (root.__OBOL_VISIBLE_REMINED_CARDS_LAST_REPAINT__ === key) return false;
    root.__OBOL_VISIBLE_REMINED_CARDS_LAST_REPAINT__ = key;
    if (typeof root.route === 'function') {
      try { root.route(); return true; } catch (_err) {}
    }
    if (typeof root.viewCard === 'function') {
      try { root.viewCard(routeCardId()); return true; } catch (_err) {}
    }
    return false;
  }

  function patchUnknownCardView() {
    if (typeof root.viewCard !== 'function' || root.viewCard.__visibleRemineCardsV963) return false;
    const original = root.viewCard;
    root.viewCard = function visibleRemineCardView(id) {
      installCards();
      return original.apply(this, arguments);
    };
    root.viewCard.__visibleRemineCardsV963 = true;
    return true;
  }

  function validate() {
    const failures = [];
    for (const id of CARD_IDS) {
      if (!liveCard(id)) failures.push('Missing live card route for ' + id);
    }
    return failures;
  }

  function integrate() {
    const cardsInstalled = installCards();
    const viewPatched = patchUnknownCardView();
    const repaired = repaintCurrentCardRoute();
    return freezeObject({ wave: WAVE, cardsInstalled, viewPatched, repaired, failures: freezeList(validate()) });
  }

  const packet = freezeObject({
    wave: WAVE,
    status: 'live-integrated',
    cardIds: freezeList(CARD_IDS),
    noteIds: freezeList(NOTE_IDS),
    proofFile: PROOF_FILE,
    integrate,
    validate,
  });

  root.OBOL_VISIBLE_REMINED_CARDS_PACKET_V963 = packet;
  const result = integrate();
  if (typeof window !== 'undefined') {
    let tries = 0;
    const schedule = typeof window.setTimeout === 'function' ? window.setTimeout.bind(window) : null;
    const attempt = () => {
      const retry = integrate();
      tries += 1;
      if ((retry.failures.length || currentRouteNeedsRepair()) && tries < 180 && schedule) schedule(attempt, 50);
    };
    if ((result.failures.length || currentRouteNeedsRepair()) && schedule) schedule(attempt, 0);
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('hashchange', attempt);
      window.addEventListener('focus', attempt);
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = packet;
})(typeof window !== 'undefined' ? window : globalThis);
