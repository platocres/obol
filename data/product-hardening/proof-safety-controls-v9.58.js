'use strict';

(function initProofSafetyControlsV958(root) {
  const WAVE = 'v9.58-proof-safety-controls';
  const CONTROL_IDS = Object.freeze([
    'gap-xss-proof-mode-selector',
    'gap-xss-proof-mode-cleanup-reminder',
    'gap-auth-validation-safety-slot',
    'gap-auth-material-scope-analyzer',
  ]);

  function freezeList(list) { return Object.freeze((list || []).slice()); }
  function freezeObject(value) { return Object.freeze(value || {}); }
  function unique(list) { return Array.from(new Set((list || []).filter(Boolean))); }
  function norm(value) { return String(value || '').trim().toLowerCase(); }

  const XSS_PROOF_MODE_SELECTOR = freezeObject({
    id: 'xss-proof-mode-selector-current',
    queueItemId: 'gap-xss-proof-mode-selector',
    surface: '#/path',
    cardId: 'xss-proof-mode-selector',
    controlType: 'segmented-proof-mode-selector',
    defaultMode: 'dom-marker',
    modes: freezeList([
      freezeObject({
        id: 'dialog',
        label: 'Dialog proof',
        useWhen: 'Use only when modal dialogs are allowed and a quick visible browser-side execution proof will not disrupt the exercise.',
        evidencePrompt: 'Record the affected route, execution origin, triggering action, and screenshot or observation that the browser ran code in context.',
        cleanupRequired: false,
      }),
      freezeObject({
        id: 'dom-marker',
        label: 'DOM marker',
        useWhen: 'Use as the default benign proof when dialogs are noisy or blocked. The marker should be obvious, reversible, and scoped to the tested page.',
        evidencePrompt: 'Record the marker location, the DOM location or rendered element, and the exact user action or refresh that caused it to appear.',
        cleanupRequired: true,
      }),
      freezeObject({
        id: 'console-marker',
        label: 'Console marker',
        useWhen: 'Use when visual page changes are undesirable but developer-console output is available for proof.',
        evidencePrompt: 'Record the console message, affected origin, and page state without treating console output as session compromise.',
        cleanupRequired: false,
      }),
      freezeObject({
        id: 'harmless-callback',
        label: 'Harmless callback',
        useWhen: 'Use only for authorized labs where an out-of-band browser touch is necessary and the callback carries no secret values or reusable session material.',
        evidencePrompt: 'Record only that a benign callback occurred from the expected browser context. Do not capture or publish cookies, tokens, or target-specific values.',
        cleanupRequired: true,
      }),
    ]),
    publicSafety: freezeList([
      'The selector exposes proof styles, not payload recipes.',
      'Browser execution proof does not automatically prove account takeover, server execution, or session compromise.',
      'Modes that leave visible markers or temporary callback plumbing require cleanup before path advancement.',
    ]),
  });

  const XSS_CLEANUP_REMINDER = freezeObject({
    id: 'xss-proof-cleanup-reminder-current',
    queueItemId: 'gap-xss-proof-mode-cleanup-reminder',
    surface: '#/path',
    cardId: 'xss-proof-cleanup-reminder',
    appliesToModes: freezeList(['dom-marker', 'harmless-callback']),
    checklist: freezeList([
      'Remove temporary marker text or test-only application content after proof is captured.',
      'Remove temporary callback endpoints or proof plumbing when the lab allows cleanup.',
      'Record cleanup status separately from the original browser-execution proof.',
      'Do not treat callback plumbing as persistence, access, or a session-impact claim.',
    ]),
  });

  const CREDENTIAL_VALIDATION_SAFETY_SLOT = freezeObject({
    id: 'credential-validation-safety-slot-current',
    queueItemId: 'gap-auth-validation-safety-slot',
    surface: '#/path',
    cardId: 'credential-validation-safety-slot',
    requiredFields: freezeList([
      'materialClass',
      'protocolScope',
      'serviceScope',
      'identityScope',
      'lockoutPolicy',
      'attemptCadence',
      'failureScope',
      'successScope',
    ]),
    warnings: freezeList([
      'Validate against one evidence-supported service before broadening scope.',
      'Unknown lockout policy means keep attempts deliberately bounded and human-reviewed.',
      'A failed response is scoped to the tested service, identity, and moment; it is not global proof the material is useless.',
      'A successful response proves only the tested material, identity, protocol, and service context.',
    ]),
  });

  const AUTH_MATERIAL_SCOPE_ANALYZER = freezeObject({
    id: 'auth-material-scope-analyzer-current',
    queueItemId: 'gap-auth-material-scope-analyzer',
    surface: '#/intake',
    conservative: true,
    classes: freezeList([
      freezeObject({ id: 'password-like-plaintext', label: 'Plaintext candidate', keywords: freezeList(['password', 'plaintext', 'cleartext', 'login succeeded']), proofState: 'candidate-or-validated-secret' }),
      freezeObject({ id: 'nt-hash-material', label: 'Reusable NT hash material', keywords: freezeList(['nt hash', 'nthash', 'lm:nt', 'aad3b435']), proofState: 'hash-material-needs-compatible-protocol' }),
      freezeObject({ id: 'challenge-response-capture', label: 'Challenge-response capture', keywords: freezeList(['netntlm', 'challenge-response', 'ntlmv2 response', 'responder capture']), proofState: 'capture-needs-cracking-or-relay-specific-proof' }),
      freezeObject({ id: 'kerberos-ticket-material', label: 'Kerberos ticket material', keywords: freezeList(['kerberos ticket', 'ccache', 'kirbi', 'tgs', 'as-rep']), proofState: 'ticket-material-needs-service-scope' }),
      freezeObject({ id: 'ssh-key-material', label: 'SSH key material', keywords: freezeList(['ssh private key', 'identity file', 'passphrase protected key']), proofState: 'key-possession-needs-passphrase-and-auth-proof' }),
      freezeObject({ id: 'web-session-or-token', label: 'Web session or token material', keywords: freezeList(['bearer token', 'api key', 'session cookie', 'jwt']), proofState: 'token-material-needs-origin-and-action-scope' }),
      freezeObject({ id: 'service-auth-success', label: 'Scoped authentication success', keywords: freezeList(['authentication succeeded', 'login succeeded', 'pwned', 'valid credentials', 'accepted publickey']), proofState: 'service-scoped-access-proof' }),
      freezeObject({ id: 'service-auth-failure', label: 'Scoped authentication failure', keywords: freezeList(['authentication failed', 'login failed', 'invalid credentials', 'account locked', 'status_logon_failure']), proofState: 'service-scoped-negative-result' }),
    ]),
  });

  function analyzeAuthMaterialOutput(text) {
    const body = norm(text);
    const matches = AUTH_MATERIAL_SCOPE_ANALYZER.classes.filter((rule) =>
      Array.from(rule.keywords || []).some((keyword) => body.includes(norm(keyword)))
    ).map((rule) => freezeObject({
      id: rule.id,
      label: rule.label,
      proofState: rule.proofState,
    }));
    const proofStates = freezeList(unique(matches.map((match) => match.proofState)));
    const warnings = [];
    if (matches.some((match) => match.id === 'challenge-response-capture')) warnings.push('Challenge-response captures must not be promoted to pass-the-hash access without separate recovered material or relay-specific proof.');
    if (matches.some((match) => match.id === 'service-auth-failure')) warnings.push('Failure is scoped to the tested service, identity, and moment; do not globally invalidate the material.');
    if (matches.some((match) => match.id === 'service-auth-success')) warnings.push('Success proves only the observed service and identity scope; keep raw secret values out of public notes and reports.');
    return freezeObject({
      analyzerId: AUTH_MATERIAL_SCOPE_ANALYZER.id,
      matchCount: matches.length,
      matches: freezeList(matches),
      proofStates,
      warnings: freezeList(warnings),
      recommendedNextState: proofStates.includes('service-scoped-access-proof')
        ? 'record-scoped-access-proof'
        : proofStates.includes('capture-needs-cracking-or-relay-specific-proof')
          ? 'route-to-cracking-or-specific-relay-proof'
          : proofStates.length
            ? 'preserve-material-class-and-validate-scope'
            : 'no-auth-material-classification',
    });
  }

  const FIELD_NOTES = freezeList([
    freezeObject({
      id: 'note-xss-proof-mode-selector-control',
      title: 'Choose a benign XSS proof mode before claiming impact',
      body: 'The XSS proof control now separates dialog, DOM marker, console marker, and harmless callback proof styles. Operators choose the least disruptive proof style that demonstrates browser execution in context, then record origin, trigger, and visible effect without publishing payload recipes.',
      kind: 'path-guidance',
      cardIds: freezeList(['xss-proof-mode-selector', 'xss', 'web-client-side']),
      toolIds: freezeList(['burpsuite', 'zap', 'curl']),
      pathIds: freezeList(['path']),
      tags: freezeList(['xss', 'proof-mode', 'browser-proof', 'ui-control']),
      reviewWave: WAVE,
    }),
    freezeObject({
      id: 'note-xss-proof-cleanup-reminder-control',
      title: 'Clean up temporary XSS proof artifacts',
      body: 'The XSS cleanup reminder now travels with marker-style and callback-style proofs. Proof plumbing, visible markers, and temporary test artifacts should be removed when possible and reported as cleanup status, not mistaken for persistence or access.',
      kind: 'cleanup',
      cardIds: freezeList(['xss-proof-cleanup-reminder', 'xss', 'web-client-side']),
      toolIds: freezeList(['burpsuite', 'zap']),
      pathIds: freezeList(['path']),
      tags: freezeList(['xss', 'cleanup', 'proof-boundary']),
      reviewWave: WAVE,
    }),
    freezeObject({
      id: 'note-auth-validation-safety-slot-control',
      title: 'Credential validation needs a safety slot',
      body: 'Auth-capable builders now have a safety-slot contract: name material class, protocol scope, service scope, identity scope, lockout policy, attempt cadence, failure scope, and success scope before treating a credential lead as validated access.',
      kind: 'tool-guidance',
      cardIds: freezeList(['credential-validation-safety-slot', 'credentials', 'authentication']),
      toolIds: freezeList(['nxc', 'evil-winrm', 'ssh', 'curl', 'hydra']),
      pathIds: freezeList(['path']),
      tags: freezeList(['credential', 'authentication', 'validation', 'safety-slot']),
      reviewWave: WAVE,
    }),
    freezeObject({
      id: 'note-auth-material-scope-analyzer-control',
      title: 'Classify auth material before moving the path',
      body: 'The auth-material scope analyzer now keeps captures, reusable hashes, tickets, keys, tokens, plaintext candidates, scoped success, and scoped failure in separate proof states. It routes ambiguous terminal output conservatively instead of collapsing every secret-shaped value into access.',
      kind: 'evidence',
      cardIds: freezeList(['auth-material-scope-analyzer', 'credentials', 'authentication']),
      toolIds: freezeList(['nxc', 'hashcat', 'john', 'evil-winrm', 'ssh', 'curl']),
      pathIds: freezeList(['path']),
      tags: freezeList(['credential', 'terminal-analyzer', 'proof-state', 'scope']),
      reviewWave: WAVE,
    }),
  ]);

  const PATH_CARDS = freezeList([
    freezeObject({
      id: 'xss-proof-mode-selector',
      lane: 'web',
      title: 'Select XSS Proof Mode',
      hypothesis: 'Browser execution should be proven with the least disruptive public-safe proof style that fits the context. Choose dialog, DOM marker, console marker, or harmless callback, then capture origin, trigger, and effect as separate evidence.',
      prereq: freezeObject({ any: freezeList(['web.xss_candidate', 'web.reflection_confirmed', 'web.stored_input']) }),
      produces: freezeList(['web.xss_browser_execution_reviewed']),
      expected: freezeList(['proof mode selected', 'origin recorded', 'trigger recorded', 'browser-side effect observed']),
      proofModes: XSS_PROOF_MODE_SELECTOR.modes,
      tools: freezeList(['burpsuite', 'zap', 'curl']),
      sourceMined58: freezeObject({ reviewWave: WAVE, queueItemId: 'gap-xss-proof-mode-selector' }),
    }),
    freezeObject({
      id: 'xss-proof-cleanup-reminder',
      lane: 'web',
      title: 'Clean Up XSS Proof Artifacts',
      hypothesis: 'Temporary XSS proof markers and callback plumbing are evidence aids, not persistence or access. Cleanup status should be tracked before the path advances beyond browser execution proof.',
      prereq: freezeObject({ any: freezeList(['web.xss_browser_execution_reviewed']) }),
      produces: freezeList(['web.xss_proof_cleanup_recorded']),
      expected: XSS_CLEANUP_REMINDER.checklist,
      tools: freezeList(['burpsuite', 'zap']),
      sourceMined58: freezeObject({ reviewWave: WAVE, queueItemId: 'gap-xss-proof-mode-cleanup-reminder' }),
    }),
    freezeObject({
      id: 'credential-validation-safety-slot',
      lane: 'credentials',
      title: 'Credential Validation Safety Slot',
      hypothesis: 'Credential leads need a visible safety check before validation: material class, protocol, service, identity, lockout policy, cadence, failure scope, and success scope stay beside the builder instead of hidden in notes.',
      prereq: freezeObject({ any: freezeList(['credential.candidate', 'credential.material']) }),
      produces: freezeList(['credential.validation_scope_ready']),
      expected: CREDENTIAL_VALIDATION_SAFETY_SLOT.requiredFields,
      safetyWarnings: CREDENTIAL_VALIDATION_SAFETY_SLOT.warnings,
      tools: freezeList(['nxc', 'evil-winrm', 'ssh', 'curl', 'hydra']),
      sourceMined58: freezeObject({ reviewWave: WAVE, queueItemId: 'gap-auth-validation-safety-slot' }),
    }),
    freezeObject({
      id: 'auth-material-scope-analyzer',
      lane: 'credentials',
      title: 'Analyze Auth Material Scope',
      hypothesis: 'Terminal output should be classified by material class and proof state before it changes the path. Captures, reusable hashes, tickets, keys, tokens, plaintext, scoped success, and scoped failure are different facts.',
      prereq: freezeObject({ any: freezeList(['credential.material', 'terminal.output']) }),
      produces: freezeList(['credential.material_classified', 'credential.proof_state_classified']),
      expected: freezeList(['material class identified', 'proof state identified', 'scope warning applied']),
      analyzerId: AUTH_MATERIAL_SCOPE_ANALYZER.id,
      tools: freezeList(['nxc', 'hashcat', 'john', 'evil-winrm', 'ssh', 'curl']),
      sourceMined58: freezeObject({ reviewWave: WAVE, queueItemId: 'gap-auth-material-scope-analyzer' }),
    }),
  ]);

  const BUILT_QUEUE_ITEMS = freezeList([
    freezeObject({ id: 'gap-xss-proof-mode-selector', track: 'ui-ux', priority: 86.831, label: 'Design XSS proof-mode selector', surface: '#/path', proofFile: 'data/product-hardening/proof-safety-controls-v9.58.js', detail: 'Built in v9.58 as a public-safe XSS proof-mode selector with dialog, DOM marker, console marker, and harmless callback modes plus evidence prompts and no payload recipes.' }),
    freezeObject({ id: 'gap-xss-proof-mode-cleanup-reminder', track: 'ui-ux', priority: 86.832, label: 'Add XSS proof cleanup reminder', surface: '#/path', proofFile: 'data/product-hardening/proof-safety-controls-v9.58.js', detail: 'Built in v9.58 as a cleanup reminder tied to marker and callback proof modes so temporary proof artifacts are removed or explicitly recorded as cleanup status.' }),
    freezeObject({ id: 'gap-auth-validation-safety-slot', track: 'ui-ux', priority: 86.833, label: 'Design credential validation safety slot', surface: '#/path', proofFile: 'data/product-hardening/proof-safety-controls-v9.58.js', detail: 'Built in v9.58 as a credential-validation safety slot with required material, protocol, service, identity, lockout, cadence, success-scope, and failure-scope fields.' }),
    freezeObject({ id: 'gap-auth-material-scope-analyzer', track: 'testing-qa', priority: 86.834, label: 'Add auth material scope analyzer', surface: '#/intake', proofFile: 'data/product-hardening/proof-safety-controls-v9.58.js', detail: 'Built in v9.58 as a conservative auth-material analyzer that separates challenge-response captures, reusable hashes, tickets, keys, tokens, plaintext, scoped success, and scoped failure.' }),
  ]);

  function laneById(id, title, phase) {
    if (!Array.isArray(root.OBOL_LANES)) return null;
    let lane = root.OBOL_LANES.find((row) => row && row.lane === id);
    if (!lane) {
      lane = { lane: id, phase: phase || title || id, title: title || id, version: 0.1, cards: [] };
      root.OBOL_LANES.push(lane);
    }
    if (!Array.isArray(lane.cards)) lane.cards = [];
    return lane;
  }

  function cardById(id) {
    if (!Array.isArray(root.OBOL_LANES)) return null;
    for (const lane of root.OBOL_LANES) for (const card of lane.cards || []) if (card && card.id === id) return card;
    return null;
  }

  function insertOrMergeCard(lane, card) {
    if (!lane || !card || !Array.isArray(lane.cards)) return false;
    const existing = cardById(card.id);
    if (existing) {
      Object.assign(existing, card, { proofSafetyBuilt58: true });
      return true;
    }
    lane.cards.push(Object.assign({}, card, { proofSafetyBuilt58: true }));
    return true;
  }

  function installPathCards() {
    try {
      const web = laneById('web', 'Web', 'Initial Access & Web');
      const creds = laneById('credentials', 'Credentials', 'Credential Access & Validation');
      let changed = false;
      changed = insertOrMergeCard(web, PATH_CARDS[0]) || changed;
      changed = insertOrMergeCard(web, PATH_CARDS[1]) || changed;
      changed = insertOrMergeCard(creds, PATH_CARDS[2]) || changed;
      changed = insertOrMergeCard(creds, PATH_CARDS[3]) || changed;
      return changed;
    } catch (_err) {
      return false;
    }
  }

  function integrateNotes() {
    const notes = root.OBOL_NOTE_INTEGRATION;
    if (!notes || !notes.ledger || notes.__proofSafetyControlsV958) return false;
    const noteIds = new Set(FIELD_NOTES.map((note) => note.id));
    const publicFieldNotes = freezeList(Array.from(notes.publicFieldNotes || []).filter((note) => !noteIds.has(note && note.id)).concat(Array.from(FIELD_NOTES)));
    const packetReviews = freezeObject({
      ...(notes.packetReviews || {}),
      'proof-safety-controls': freezeObject({
        id: 'proof-safety-controls',
        reviewWave: WAVE,
        status: 'complete',
        candidateCount: CONTROL_IDS.length,
        candidateRefs: CONTROL_IDS,
        deferredRefs: freezeList([]),
        openProductGaps: freezeList([]),
        closedProductChanges: CONTROL_IDS,
        discovery: freezeObject({
          selection: 'Same-surface XSS proof and credentials/auth safety follow-ups were built in the current PR instead of left as parked Product Build Next gaps.',
        }),
      }),
    });
    const publicNotesForTool = (toolId) => {
      const id = norm(toolId);
      return publicFieldNotes.filter((note) => (note.toolIds || []).some((tool) => norm(tool) === id));
    };
    const publicNotesForPath = (pathId) => {
      const id = norm(pathId);
      return publicFieldNotes.filter((note) => (note.pathIds || []).some((path) => norm(path) === id));
    };
    const validate = () => {
      const failures = typeof notes.validate === 'function' ? Array.from(notes.validate() || []) : [];
      FIELD_NOTES.forEach((note) => {
        if (!publicFieldNotes.find((entry) => entry.id === note.id)) failures.push('missing proof-safety field note ' + note.id);
      });
      return failures;
    };
    root.OBOL_NOTE_INTEGRATION = freezeObject({
      ...notes,
      schemaVersion: '1.12.0',
      publicFieldNotes,
      packetReviews,
      publicNotesForTool,
      publicNotesForPath,
      validate,
      __proofSafetyControlsV958: true,
    });
    return true;
  }

  function upsertCompleteItem(q, item) {
    let existing = q.items.find((entry) => entry && entry.id === item.id);
    if (!existing) {
      existing = { id: item.id, track: item.track, status: 'complete', priority: item.priority, label: item.label, detail: item.detail };
      q.items.push(existing);
    }
    Object.assign(existing, item, {
      status: 'complete',
      completedBy: WAVE,
      proofSurface: item.surface,
      proofFile: item.proofFile,
    });
  }

  function recomputeTrackCounts(q) {
    if (!q || !Array.isArray(q.tracks) || !Array.isArray(q.items)) return;
    q.tracks.forEach((track) => {
      if (!track || track.id === 'notes-integration') return;
      const items = q.items.filter((item) => item && item.track === track.id);
      track.total = items.length;
      track.complete = items.filter((item) => item.status === 'complete').length;
    });
  }

  function integrateHardeningQueue() {
    const q = root.OBOL_PRODUCT_HARDENING;
    if (!q || !Array.isArray(q.items)) return false;
    BUILT_QUEUE_ITEMS.forEach((item) => upsertCompleteItem(q, item));
    recomputeTrackCounts(q);
    return true;
  }

  function integrateProgress() {
    const progress = root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS;
    if (!progress || !progress.remining) return false;
    const current = progress.remining;
    const builtProductControls = freezeList(unique(Array.from(current.builtProductControls || []).concat(Array.from(CONTROL_IDS))));
    const queuedProductGaps = freezeList(Array.from(current.queuedProductGaps || []).filter((id) => !CONTROL_IDS.includes(id)));
    root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = freezeObject({
      ...progress,
      schemaVersion: '1.10.0',
      remining: freezeObject({
        ...current,
        queuedProductGaps,
        builtProductControls,
        latestBuiltProductControls: CONTROL_IDS,
        latestWave: WAVE,
        noSameSurfaceGapParking: true,
      }),
    });
    return true;
  }

  function installGlobals() {
    root.OBOL_XSS_PROOF_MODE_SELECTOR = XSS_PROOF_MODE_SELECTOR;
    root.OBOL_XSS_PROOF_CLEANUP_REMINDER = XSS_CLEANUP_REMINDER;
    root.OBOL_CREDENTIAL_VALIDATION_SAFETY_SLOT = CREDENTIAL_VALIDATION_SAFETY_SLOT;
    root.OBOL_AUTH_MATERIAL_SCOPE_ANALYZER = freezeObject({
      ...AUTH_MATERIAL_SCOPE_ANALYZER,
      analyze: analyzeAuthMaterialOutput,
    });
    return true;
  }

  const packet = freezeObject({
    wave: WAVE,
    status: 'live-integrated',
    controlIds: CONTROL_IDS,
    xssProofModeSelector: XSS_PROOF_MODE_SELECTOR,
    xssCleanupReminder: XSS_CLEANUP_REMINDER,
    credentialValidationSafetySlot: CREDENTIAL_VALIDATION_SAFETY_SLOT,
    authMaterialScopeAnalyzer: freezeObject({ ...AUTH_MATERIAL_SCOPE_ANALYZER, analyze: analyzeAuthMaterialOutput }),
    pathCards: PATH_CARDS,
    fieldNotes: FIELD_NOTES,
    completedProductItems: BUILT_QUEUE_ITEMS,
    liveCards: freezeList(PATH_CARDS.map((card) => card.id).concat(FIELD_NOTES.map((note) => note.id))),
    liveRoutes: freezeList(['#/path', '#/card/xss-proof-mode-selector', '#/card/xss-proof-cleanup-reminder', '#/card/credential-validation-safety-slot', '#/card/auth-material-scope-analyzer', '#/dashboard']),
    analyzeAuthMaterialOutput,
    integrate: () => {
      const globalsIntegrated = installGlobals();
      const pathCardsIntegrated = installPathCards();
      const notesIntegrated = integrateNotes();
      const queueIntegrated = integrateHardeningQueue();
      const progressIntegrated = integrateProgress();
      return freezeObject({ packet, globalsIntegrated, pathCardsIntegrated, notesIntegrated, queueIntegrated, progressIntegrated });
    },
  });

  root.OBOL_PROOF_SAFETY_CONTROLS_V958 = packet;
  packet.integrate();
  if (typeof window !== 'undefined') {
    let tries = 0;
    const schedule = typeof window.setTimeout === 'function' ? window.setTimeout.bind(window) : null;
    const retry = () => {
      const result = packet.integrate();
      tries += 1;
      if (!(result.pathCardsIntegrated && result.notesIntegrated && result.queueIntegrated && result.progressIntegrated) && tries < 40 && schedule) {
        schedule(retry, 25);
      }
    };
    if (schedule) schedule(retry, 0);
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = packet;
})(typeof window !== 'undefined' ? window : globalThis);
