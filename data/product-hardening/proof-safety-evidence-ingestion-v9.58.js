'use strict';

(function initProofSafetyEvidenceIngestionV958(root) {
  const WAVE = 'v9.58-proof-safety-evidence-ingestion';
  const INGESTED_CARD_IDS = Object.freeze([
    'xss-proof-mode-selector',
    'xss-proof-cleanup-reminder',
    'credential-validation-safety-slot',
    'auth-material-scope-analyzer',
  ]);

  function freezeList(list) { return Object.freeze((list || []).slice()); }
  function freezeObject(value) { return Object.freeze(value || {}); }
  function norm(value) { return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function unique(list) { return Array.from(new Set((list || []).filter(Boolean))); }
  function has(text, pattern) { return pattern.test(String(text || '')); }
  function redact(value) {
    return String(value || '')
      .replace(/(password|passwd|pwd|pass|token|secret|api[_-]?key)\s*[:=]\s*([^\s;&|]+)/gi, '$1=[redacted]')
      .replace(/(Authorization:\s*(?:Basic|Bearer)\s+)[A-Za-z0-9._~+\/-]+=*/gi, '$1[redacted]')
      .replace(/([A-Za-z0-9._%+-]+):([^@\s]+)@/g, '$1:[redacted]@')
      .slice(0, 900);
  }
  function hash(value) {
    const C = root.OBOL_CORE_V2;
    if (C && typeof C.simpleHash === 'function') return C.simpleHash(value);
    let h = 0;
    const text = String(value || '');
    for (let i = 0; i < text.length; i += 1) h = ((h << 5) - h + text.charCodeAt(i)) | 0;
    return String(Math.abs(h));
  }
  function activity(cardId, result, fields) {
    const body = Object.assign({
      cardId,
      result,
      assessment: result === 'success' ? 'supported' : 'attempted',
      confidence: result === 'success' ? 'high' : 'medium',
      reviewWave: WAVE,
      source: 'Evidence paste',
      outcomeFacts: [],
    }, fields || {});
    body.fingerprint = 'terminal:' + hash(cardId + '|' + norm(body.command || '') + '|' + norm(body.outputSnippet || body.evidence || '').slice(0, 500));
    return body;
  }

  const FALLBACK_AUTH_CLASSES = freezeList([
    freezeObject({ id: 'password-like-plaintext', label: 'Plaintext candidate', keywords: freezeList(['password', 'plaintext', 'cleartext', 'login succeeded', 'recovered plaintext']), proofState: 'candidate-or-validated-secret' }),
    freezeObject({ id: 'nt-hash-material', label: 'Reusable NT hash material', keywords: freezeList(['nt hash', 'nthash', 'lm:nt', 'aad3b435']), proofState: 'hash-material-needs-compatible-protocol' }),
    freezeObject({ id: 'challenge-response-capture', label: 'Challenge-response capture', keywords: freezeList(['netntlm', 'challenge-response', 'ntlmv2 response', 'responder capture']), proofState: 'capture-needs-cracking-or-relay-specific-proof' }),
    freezeObject({ id: 'kerberos-ticket-material', label: 'Kerberos ticket material', keywords: freezeList(['kerberos ticket', 'ccache', 'kirbi', 'tgs', 'as-rep']), proofState: 'ticket-material-needs-service-scope' }),
    freezeObject({ id: 'ssh-key-material', label: 'SSH key material', keywords: freezeList(['ssh private key', 'identity file', 'passphrase protected key', 'accepted publickey']), proofState: 'key-possession-needs-passphrase-and-auth-proof' }),
    freezeObject({ id: 'web-session-or-token', label: 'Web session or token material', keywords: freezeList(['bearer token', 'api key', 'session cookie', 'jwt']), proofState: 'token-material-needs-origin-and-action-scope' }),
    freezeObject({ id: 'service-auth-success', label: 'Scoped authentication success', keywords: freezeList(['authentication succeeded', 'login succeeded', 'valid credentials', 'accepted publickey', 'pwned']), proofState: 'service-scoped-access-proof' }),
    freezeObject({ id: 'service-auth-failure', label: 'Scoped authentication failure', keywords: freezeList(['authentication failed', 'login failed', 'invalid credentials', 'account locked', 'status_logon_failure']), proofState: 'service-scoped-negative-result' }),
  ]);

  function fallbackAnalyzeAuthMaterialOutput(text) {
    const body = norm(text);
    const matches = FALLBACK_AUTH_CLASSES.filter((rule) => Array.from(rule.keywords || []).some((keyword) => body.includes(norm(keyword))))
      .map((rule) => freezeObject({ id: rule.id, label: rule.label, proofState: rule.proofState }));
    const proofStates = freezeList(unique(matches.map((match) => match.proofState)));
    const warnings = [];
    if (matches.some((match) => match.id === 'challenge-response-capture')) warnings.push('Challenge-response captures must not be promoted to pass-the-hash access without separate recovered material or relay-specific proof.');
    if (matches.some((match) => match.id === 'service-auth-failure')) warnings.push('Failure is scoped to the tested service, identity, and moment; do not globally invalidate the material.');
    if (matches.some((match) => match.id === 'service-auth-success')) warnings.push('Success proves only the observed service and identity scope; keep raw secret values out of public notes and reports.');
    return freezeObject({
      analyzerId: 'auth-material-scope-analyzer-current',
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

  function analyzeAuth(text) {
    const analyzer = root.OBOL_AUTH_MATERIAL_SCOPE_ANALYZER;
    if (analyzer && typeof analyzer.analyze === 'function') return analyzer.analyze(text);
    return fallbackAnalyzeAuthMaterialOutput(text);
  }

  function classifyXssProof(text) {
    const lower = norm(text);
    const xssContext = /\bxss\b|cross-site scripting|browser execution|browser-side execution|proof mode|dom marker|console marker|dialog proof|harmless callback|callback received|marker appeared|marker rendered/.test(lower);
    if (!xssContext) return null;
    const observed = /browser execution observed|browser-side execution|marker appeared|marker rendered|dom marker.*observed|console marker.*observed|dialog proof.*observed|callback received|expected browser context|origin recorded|trigger recorded/.test(lower);
    const mode = /harmless callback|callback received/.test(lower)
      ? 'harmless-callback'
      : /console marker/.test(lower)
        ? 'console-marker'
        : /dialog proof|alert dialog/.test(lower)
          ? 'dialog'
          : /dom marker|marker appeared|marker rendered/.test(lower)
            ? 'dom-marker'
            : 'unspecified-proof-mode';
    return activity('xss-proof-mode-selector', observed ? 'success' : 'tried', {
      command: 'evidence:xss-proof-mode',
      evidence: redact(text),
      outputSnippet: redact(text),
      reason: observed
        ? 'Evidence paste described browser-side XSS proof with mode, trigger, origin, or observed effect. Session impact still requires separate proof.'
        : 'Evidence paste referenced XSS proof context, but did not include explicit observed browser execution details.',
      outcomeFacts: observed ? ['web.xss_browser_execution_reviewed'] : [],
      proofMode: mode,
    });
  }

  function classifyXssCleanup(text) {
    const lower = norm(text);
    const cleanup = /cleanup complete|cleanup recorded|removed marker|marker removed|removed temporary|callback endpoint removed|proof plumbing removed|cleanup status/.test(lower);
    const xss = /\bxss\b|proof marker|proof plumbing|callback|dom marker|browser execution/.test(lower);
    if (!(cleanup && xss)) return null;
    return activity('xss-proof-cleanup-reminder', 'success', {
      command: 'evidence:xss-proof-cleanup',
      evidence: redact(text),
      outputSnippet: redact(text),
      reason: 'Evidence paste described cleanup of XSS proof marker or callback plumbing. Cleanup is tracked separately from browser-execution proof and access claims.',
      outcomeFacts: ['web.xss_proof_cleanup_recorded'],
    });
  }

  function classifyCredentialValidationSafety(text) {
    const lower = norm(text);
    const authContext = /credential|password|hash|ticket|token|key|login|authentication|nxc|netexec|evil-winrm|ssh|smb|winrm|ldap|http/.test(lower);
    if (!authContext) return null;
    const dimensions = [
      /material class|password|hash|ticket|token|key|plaintext|netntlm|nt hash|ccache|kirbi/.test(lower) && 'materialClass',
      /protocol|smb|winrm|ssh|ldap|http|kerberos|ntlm/.test(lower) && 'protocolScope',
      /service|target|host|port|smb|winrm|ssh|ldap|http/.test(lower) && 'serviceScope',
      /identity|user|username|account|principal/.test(lower) && 'identityScope',
      /lockout|account locked|policy unknown|attempt limit/.test(lower) && 'lockoutPolicy',
      /cadence|rate|single manual check|bounded|spray|attempt/.test(lower) && 'attemptCadence',
      /failed|failure|invalid credentials|status_logon_failure/.test(lower) && 'failureScope',
      /succeeded|success|valid credentials|accepted publickey|login succeeded/.test(lower) && 'successScope',
    ].filter(Boolean);
    if (dimensions.length < 2) return null;
    const ready = dimensions.includes('materialClass') && dimensions.includes('protocolScope') && dimensions.includes('serviceScope') && dimensions.includes('identityScope') && (dimensions.includes('lockoutPolicy') || dimensions.includes('attemptCadence') || dimensions.includes('successScope') || dimensions.includes('failureScope'));
    return activity('credential-validation-safety-slot', ready ? 'success' : 'tried', {
      command: 'evidence:credential-validation-safety',
      evidence: redact(text),
      outputSnippet: redact(text),
      reason: ready
        ? 'Evidence paste includes enough material, protocol, service, identity, and safety/scope detail for a credential-validation safety check.'
        : 'Evidence paste contains credential-validation context but is missing required scope or safety fields.',
      outcomeFacts: ready ? ['credential.validation_scope_ready'] : [],
      validationFieldsObserved: freezeList(dimensions),
    });
  }

  function classifyAuthMaterialScope(text) {
    const analyzed = analyzeAuth(text);
    if (!analyzed || !analyzed.matchCount) return null;
    const facts = ['credential.material_classified', 'credential.proof_state_classified'];
    const ids = (analyzed.matches || []).map((match) => match.id);
    if (ids.includes('service-auth-success')) facts.push('credential.validation_success_scoped');
    if (ids.includes('service-auth-failure')) facts.push('credential.validation_failure_scoped');
    return activity('auth-material-scope-analyzer', 'success', {
      command: 'evidence:auth-material-scope',
      evidence: redact(text),
      outputSnippet: redact(text),
      reason: 'Evidence paste classified authentication material by type and proof state without promoting secret-shaped output into global access.',
      outcomeFacts: facts,
      authMaterialMatches: freezeList(ids),
      proofStates: analyzed.proofStates || freezeList([]),
      warnings: analyzed.warnings || freezeList([]),
      recommendedNextState: analyzed.recommendedNextState,
    });
  }

  function analyzeEvidenceText(text) {
    const candidates = [
      classifyXssProof(text),
      classifyXssCleanup(text),
      classifyCredentialValidationSafety(text),
      classifyAuthMaterialScope(text),
    ].filter(Boolean);
    const facts = unique(candidates.flatMap((row) => row.outcomeFacts || []));
    return freezeObject({
      wave: WAVE,
      activityCount: candidates.length,
      activities: freezeList(candidates.map((row) => freezeObject(row))),
      outcomeFacts: freezeList(facts),
      advancedCards: freezeList(unique(candidates.map((row) => row.cardId))),
    });
  }

  function mergeEvidenceAnalysis(result, analysis) {
    const out = result && typeof result === 'object' ? result : {};
    out.activities = Array.isArray(out.activities) ? out.activities : [];
    const seen = new Set(out.activities.map((row) => row && row.fingerprint).filter(Boolean));
    analysis.activities.forEach((row) => {
      if (seen.has(row.fingerprint)) return;
      out.activities.push(Object.assign({}, row));
      seen.add(row.fingerprint);
    });
    out.proofSafetyEvidence58 = analysis;
    out.proofSafetyEvidenceCards58 = analysis.advancedCards;
    return out;
  }

  function installEvidenceIngestion() {
    const T = root.OBOL_INTAKE_V21;
    if (!T || typeof T.analyzeTerminal !== 'function') return false;
    if (T.analyzeTerminal.__proofSafetyEvidenceV958) return true;
    const oldAnalyze = T.analyzeTerminal;
    T.analyzeTerminal = function proofSafetyAnalyzeTerminal(text, lanes, state, ctx) {
      const result = oldAnalyze.call(T, text, lanes, state, ctx);
      return mergeEvidenceAnalysis(result, analyzeEvidenceText(text));
    };
    T.analyzeTerminal.__proofSafetyEvidenceV958 = true;
    root.__OBOL_PROOF_SAFETY_EVIDENCE_INGESTION_INSTALLED__ = true;
    return true;
  }

  function integrateProgress() {
    const progress = root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS;
    if (!progress || !progress.remining) return false;
    const current = progress.remining;
    root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = freezeObject({
      ...progress,
      schemaVersion: '1.11.0',
      remining: freezeObject({
        ...current,
        evidenceIngestionBuilt: freezeList(unique(Array.from(current.evidenceIngestionBuilt || []).concat(Array.from(INGESTED_CARD_IDS)))),
        latestEvidenceIngestion: freezeList(INGESTED_CARD_IDS),
        latestWave: WAVE,
        evidencePasteAdvancesNextSteps: true,
      }),
    });
    return true;
  }

  function integrateQueueProof() {
    const q = root.OBOL_PRODUCT_HARDENING;
    if (!q || !Array.isArray(q.items)) return false;
    q.items.forEach((item) => {
      if (!item || !INGESTED_CARD_IDS.includes(item.id) && ![
        'gap-xss-proof-mode-selector',
        'gap-xss-proof-mode-cleanup-reminder',
        'gap-auth-validation-safety-slot',
        'gap-auth-material-scope-analyzer',
      ].includes(item.id)) return;
      item.evidenceIngestion = 'built';
      item.evidenceIngestionWave = WAVE;
    });
    return true;
  }

  const packet = freezeObject({
    wave: WAVE,
    status: 'live-integrated',
    surface: '#/intake',
    ingestedCards: INGESTED_CARD_IDS,
    producedFacts: freezeList([
      'web.xss_browser_execution_reviewed',
      'web.xss_proof_cleanup_recorded',
      'credential.validation_scope_ready',
      'credential.material_classified',
      'credential.proof_state_classified',
      'credential.validation_success_scoped',
      'credential.validation_failure_scoped',
    ]),
    liveRoutes: freezeList(['#/intake', '#/path', '#/card/auth-material-scope-analyzer', '#/card/xss-proof-mode-selector']),
    analyzeEvidenceText,
    installEvidenceIngestion,
    integrate: () => freezeObject({
      globalsIntegrated: true,
      evidenceIngestionIntegrated: installEvidenceIngestion(),
      queueIntegrated: integrateQueueProof(),
      progressIntegrated: integrateProgress(),
    }),
  });

  root.OBOL_PROOF_SAFETY_EVIDENCE_INGESTION_V958 = packet;
  packet.integrate();
  if (typeof window !== 'undefined') {
    let tries = 0;
    const schedule = typeof window.setTimeout === 'function' ? window.setTimeout.bind(window) : null;
    const attempt = () => {
      packet.integrate();
      tries += 1;
      if (!root.__OBOL_PROOF_SAFETY_EVIDENCE_INGESTION_INSTALLED__ && tries < 160 && schedule) schedule(attempt, 50);
    };
    if (schedule) schedule(attempt, 0);
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('hashchange', attempt);
      window.addEventListener('focus', attempt);
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = packet;
})(typeof window !== 'undefined' ? window : globalThis);
