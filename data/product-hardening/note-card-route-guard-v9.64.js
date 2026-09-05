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
  const REQUIRED_ROUTE_FALLBACKS = Object.freeze({
    'credential-dump-proof-chain': freezeObject({
      lane: 'credential-attacks',
      title: 'Credential Dump Proof Chain',
      hypothesis: 'Treat memory dumps, parser output, extracted material, cracking, and scoped authentication as separate Evidence states. A dump, hash, or cracked candidate is useful only after the exact material class and validation scope are proven.',
      prereq: { any: ['foothold.windows', 'credential.candidate', 'credential.lsass_dump_artifact_observed', 'credential.offline_dump_parser_output_observed'] },
      produces: ['credential.candidate', 'credential.validation.required'],
      expected: ['dump artifact observed', 'material class identified', 'scoped validation captured'],
      defender: 'Memory dumps and credential material are sensitive artifacts. Keep raw secrets out of notes and reports, and track cleanup separately.',
      report: { finding: 'Credential Dump Evidence Review', severity: 'high' },
      tools: ['pypykatz', 'mimikatz', 'hashcat'],
    }),
    'web-proxy-transform-proof-chain': freezeObject({
      lane: 'web-proxy-transform',
      title: 'Web Proxy Transform Proof Chain',
      hypothesis: 'Use the proxy workflow to keep browser edits, decode and encode steps, payload-processing changes, response deltas, and replayed server behavior as separate proof stages. A clever request mutation is a lead; reviewed server-side behavior is the proof.',
      prereq: { any: ['service.http', 'web.client_control_mutation_observed', 'web.reversible_transform_chain_observed', 'web.tool_generated_http_capture_observed'] },
      produces: ['web.transform-chain.reviewed', 'web.scoped-server-behavior.required'],
      expected: ['original request captured', 'one transform changed at a time', 'server behavior reviewed'],
      defender: 'Proxy replay and payload mutation can create noisy request patterns. Keep scope, rate, and response-body review explicit.',
      report: { finding: 'Web Proxy Transform Chain Reviewed', severity: 'medium' },
      tools: ['Burp Suite', 'OWASP ZAP', 'CyberChef'],
    }),
    'web-client-controls': freezeObject({
      lane: 'web-proxy-transform',
      title: 'Review Client-Side Controls as Request-Shaping Clues',
      hypothesis: 'Disabled controls, hidden fields, local validation, and browser-side markup changes show how a request can be shaped. They do not prove backend authorization failure until the server accepts a scoped action or returns protected content.',
      prereq: { any: ['service.http', 'web.client_control_mutation_observed'] },
      produces: ['web.client-control.reviewed'],
      expected: ['original state recorded', 'mutated request captured', 'server response compared'],
      defender: 'Client-side edits are usually low-noise, but repeated submissions can still create logs. Preserve original and modified requests for reporting.',
      report: { finding: 'Client-Side Control Boundary Reviewed', severity: 'info' },
      tools: ['browser-devtools', 'Burp Suite', 'OWASP ZAP'],
    }),
    'web-authz-boundaries': freezeObject({
      lane: 'web-proxy-transform',
      title: 'Separate Client Bypass from Server Authorization',
      hypothesis: 'Changing a disabled field, hidden value, or local browser check proves only that the client can be altered. Authorization impact requires a scoped server response: the action is accepted, protected content changes, or a permission boundary is crossed in a way the report can defend.',
      prereq: { any: ['service.http', 'web.client_control_mutation_observed', 'web.scoped_server_behavior_observed'] },
      produces: ['web.authorization-boundary.reviewed'],
      expected: ['client mutation separated from backend response', 'permission boundary named', 'scoped server-side effect captured'],
      defender: 'Authorization testing should avoid broad or destructive actions. Keep the tested identity, object, action, and response body visible.',
      report: { finding: 'Web Authorization Boundary Reviewed', severity: 'medium' },
      tools: ['Burp Suite', 'OWASP ZAP', 'browser-devtools'],
    }),
    'encoded-parameter-review': freezeObject({
      lane: 'web-proxy-transform',
      title: 'Review Encoded Parameters in Transform Order',
      hypothesis: 'When a cookie or parameter is transformed through multiple encodings, preserve the decode order, mutate only the intended inner value, then rebuild the outbound value in reverse order. The rebuilt request still needs response-body review before it becomes impact proof.',
      prereq: { any: ['service.http', 'web.reversible_transform_chain_observed', 'web.encoded_cookie_candidate_observed'] },
      produces: ['web.encoded-parameter.reviewed'],
      expected: ['decode order recorded', 'inner value changed deliberately', 'outbound value rebuilt in reverse order'],
      defender: 'Encoded parameter fuzzing can produce large request sets. Keep payload lists bounded and compare response bodies, not only sizes.',
      report: { finding: 'Encoded Parameter Transform Chain Reviewed', severity: 'medium' },
      tools: ['CyberChef', 'Burp Intruder', 'OWASP ZAP'],
    }),
    'tool-generated-http-review': freezeObject({
      lane: 'web-proxy-transform',
      title: 'Capture Tool-Generated HTTP Before Debugging',
      hypothesis: 'When a scanner or framework module behaves strangely, capture the exact HTTP it generates before changing assumptions. Compare the produced method, path, host, headers, body, proxy settings, and response class against the manual request you intended.',
      prereq: { any: ['service.http', 'web.tool_generated_http_capture_observed'] },
      produces: ['web.tool-http.reviewed'],
      expected: ['generated request captured', 'manual replay compared', 'tool assumption isolated'],
      defender: 'Framework modules can send recognizable traffic. Capturing the generated request first keeps troubleshooting bounded and reportable.',
      report: { finding: 'Tool-Generated HTTP Reviewed', severity: 'info' },
      tools: ['Metasploit', 'Burp Suite', 'OWASP ZAP'],
    }),
    'pass-the-hash-proof-chain': freezeObject({
      lane: 'credential-attacks',
      title: 'Pass-the-Hash Proof Chain',
      hypothesis: 'Treat hash material, scoped authentication, local admin proof, remote execution side effects, and cleanup as separate Evidence states. A hash candidate is not access until the target service accepts it in scope.',
      prereq: { any: ['credential.nt_hash_material_observed', 'credential.hash_crack_plaintext_candidate_observed', 'credential.candidate'] },
      produces: ['credential.validation.required', 'credential.scoped-auth.reviewed'],
      expected: ['hash material classified', 'scoped authentication attempted', 'service-specific result captured'],
      defender: 'Hash reuse and remote execution attempts are high-signal. Keep scope, account, host, service, and cleanup explicit.',
      report: { finding: 'Pass-the-Hash Authentication Reviewed', severity: 'high' },
      tools: ['nxc', 'evil-winrm', 'psexec.py', 'wmiexec.py'],
    }),
    'pth-remote-exec-artifacts': freezeObject({
      lane: 'credential-attacks',
      title: 'Review Pass-the-Hash Remote Execution Artifacts',
      hypothesis: 'Remote execution after hash authentication can leave services, scheduled tasks, admin shares, process launches, or temporary files. Track those artifacts separately from authentication success.',
      prereq: { any: ['credential.validation_success_scoped', 'remote.execution_candidate_observed', 'credential.scoped-auth.reviewed'] },
      produces: ['remote-exec.artifacts.reviewed'],
      expected: ['execution method named', 'artifact path or service captured', 'cleanup recorded'],
      defender: 'Remote execution artifacts are noisy. Confirm what was created and what remains before reporting or moving on.',
      report: { finding: 'Hash-Based Remote Execution Artifacts Reviewed', severity: 'high' },
      tools: ['nxc', 'psexec.py', 'wmiexec.py', 'evil-winrm'],
    }),
    'pth-token-filtering-check': freezeObject({
      lane: 'credential-attacks',
      title: 'Check Token Filtering and Account Scope',
      hypothesis: 'A valid local or domain credential can still fail remote admin paths because of account scope, token filtering, remote UAC, or service restrictions. Separate authentication from authorization and execution.',
      prereq: { any: ['credential.validation_success_scoped', 'credential.scoped-auth.reviewed', 'remote.execution_failed_observed'] },
      produces: ['remote-admin.scope.reviewed'],
      expected: ['account scope named', 'remote admin boundary checked', 'failure mode recorded'],
      defender: 'Do not keep retrying noisy remote execution when the boundary is account scope. Record the exact service and authorization failure.',
      report: { finding: 'Remote UAC and Token Filtering Boundary Reviewed', severity: 'medium' },
      tools: ['nxc', 'evil-winrm', 'wmiexec.py'],
    }),
  });

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
  function ensureLane(laneId, title, phase) {
    const id = laneId || 'source-mined-cards';
    if (typeof root.laneById === 'function') {
      try { return root.laneById(id, title || 'Source-Mined Cards', phase || 'Methodology'); } catch (_err) {}
    }
    const lanes = Array.isArray(root.OBOL_LANES) ? root.OBOL_LANES : Array.isArray(root.LANES) ? root.LANES : null;
    if (!lanes) return null;
    let lane = lanes.find((entry) => entry && entry.lane === id);
    if (!lane) { lane = { lane: id, title: title || 'Source-Mined Cards', phase: phase || 'Methodology', cards: [] }; lanes.push(lane); }
    if (!Array.isArray(lane.cards)) lane.cards = [];
    return lane;
  }
  function ensureCardLane(card) {
    if (card && card.lane === 'credential-attacks') return ensureLane('credential-attacks', 'Credential Attacks', 'Credential Attacks');
    if (card && card.lane === 'web-proxy-transform') return ensureLane('web-proxy-transform', 'Web Proxy Transform Review', 'Initial Access & Web');
    return ensureLane('source-mined-cards', 'Source-Mined Cards', 'Methodology');
  }
  function isRouteGuardFallback(card) {
    return !!(card && card.sourceMinedRouteGuard64 && card.sourceMinedRouteGuard64.proof === PROOF_FILE);
  }
  function replaceFallbackCard(card) {
    if (!card || !isRouteGuardFallback(liveCard(card.id))) return false;
    const lanes = Array.isArray(root.OBOL_LANES) ? root.OBOL_LANES : Array.isArray(root.LANES) ? root.LANES : [];
    let replaced = false;
    for (const lane of lanes) {
      if (!Array.isArray(lane.cards)) continue;
      const index = lane.cards.findIndex((entry) => entry && entry.id === card.id);
      if (index >= 0) {
        lane.cards.splice(index, 1);
        replaced = true;
      }
    }
    if (root.CARDS && typeof root.CARDS === 'object' && root.CARDS[card.id]) {
      try { delete root.CARDS[card.id]; } catch (_err) { root.CARDS[card.id] = undefined; }
      replaced = true;
    }
    return replaced;
  }
  function publishCard(lane, card) {
    if (!lane || !card) return false;
    if (liveCard(card.id) && !isRouteGuardFallback(liveCard(card.id))) return false;
    if (liveCard(card.id)) replaceFallbackCard(card);
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
    const required = REQUIRED_ROUTE_FALLBACKS[id] || null;
    const body = required && required.hypothesis
      ? required.hypothesis
      : notes.length
        ? notes.map((note) => (note.title ? note.title + ': ' : '') + String(note.body || '').trim()).filter(Boolean).join(' ')
        : 'This note-derived route was referenced by Product Hardening source-mining output. Review the related source-mined Field Notes and keep proof, scope, cleanup, and reporting boundaries explicit before moving the path.';
    return {
      id,
      title: required && required.title || notes[0] && notes[0].title || titleize(id),
      hypothesis: body || titleize(id),
      prereq: required && required.prereq || { any: ['scope.defined', 'service.http', 'credential.candidate', 'foothold.windows', 'foothold.linux'] },
      produces: required && required.produces ? freezeList(required.produces) : ['source_mined.card_reviewed'],
      commands: [],
      expected: required && required.expected ? freezeList(required.expected) : ['public-safe note-derived route resolves', 'proof boundary reviewed', 'scope recorded'],
      defender: required && required.defender || 'Source-mined cards are guidance and evidence-review surfaces. They do not execute commands automatically and should keep raw secrets, target-specific values, and private lab answer strings out of reports.',
      report: required && required.report || { finding: titleize(id), severity: tags.includes('credential') || tags.includes('remote-exec') ? 'high' : 'info' },
      tools: freezeList(required && required.tools && required.tools.length ? required.tools : tools),
      refs: [],
      sourceMinedRouteGuard64: { proof: PROOF_FILE, wave: WAVE, routeGuardFallback: true, requiredVisibleRoute: REQUIRED_VISIBLE_ROUTES.includes(id), noteIds: notes.map((note) => note.id) },
    };
  }
  function installMissingCards() {
    const ids = noteCardIds();
    ids.forEach((id) => {
      const card = fallbackCard(id);
      const lane = ensureCardLane(card);
      if (!liveCard(id) || isRouteGuardFallback(liveCard(id))) publishCard(lane, card);
    });
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
