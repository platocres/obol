'use strict';

(function initWebProxyTransformReminingV962(root) {
  const WAVE = 'v9.62-web-proxy-transform-remine';
  const ITEM_ID = 'notes-mechanic-backfill';
  const THEME_ID = 'web-proxy-transform-order';
  const PROOF_FILE = 'data/product-hardening/web-proxy-transform-remining-v9.62.js';

  function freezeList(list) { return Object.freeze((list || []).slice()); }
  function freezeObject(value) { return Object.freeze(value || {}); }
  function unique(list) { return Array.from(new Set((list || []).filter(Boolean))); }
  function norm(value) { return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function redact(value) {
    return String(value || '')
      .replace(/HTB\{[^}]+\}/gi, '[flag-redacted]')
      .replace(/flag\{[^}]+\}/gi, '[flag-redacted]')
      .replace(/\b\d{1,3}(?:\.\d{1,3}){3}:\d+\b/g, '[host:port]')
      .replace(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, '[host]')
      .replace(/((?:Set-)?Cookie:\s*[^=\s;]+)=([^;\s]+)/gi, '$1=[redacted]')
      .replace(/((?:cookie|token|session|phpsessid|password|passwd|pwd|secret|api[_-]?key)\s*[=:]\s*)([^;\s&]+)/gi, '$1[redacted]')
      .replace(/\b[A-Fa-f0-9]{24,128}\b/g, '[encoded-or-secret-material]')
      .replace(/\b[A-Za-z0-9+/]{28,}={0,2}\b/g, '[encoded-or-secret-material]')
      .slice(0, 1000);
  }
  function hash(value) {
    const C = root.OBOL_CORE_V2;
    if (C && typeof C.simpleHash === 'function') return C.simpleHash(value);
    let h = 0;
    const text = String(value || '');
    for (let i = 0; i < text.length; i += 1) h = ((h << 5) - h + text.charCodeAt(i)) | 0;
    return String(Math.abs(h));
  }

  const DIMENSIONS = freezeList([
    'path-bindings',
    'tool-cards',
    'gui-controls',
    'scripts-one-liners',
    'command-templates',
    'terminal-analyzers',
    'evidence-expectations',
    'path-movement',
    'lesson-boxes',
    'examples',
    'troubleshooting',
    'cleanup',
    'report-guidance',
    'product-mechanics',
    'product-gaps',
    'orange-baseline',
  ]);

  const SOURCE_CONFIDENCE = freezeObject({
    schemaVersion: 2,
    sourceRoute: 'platocres/obol-source-notes@agent/review-packets',
    sourcePackets: freezeList([
      'data/review-packets/manifest.json',
      'data/review-packets/htb-penetration-tester-01.json',
    ]),
    reviewTextPolicy: 'complete_cleaned_text',
    truncationPolicy: 'none',
    expectedNoteCount: 556,
    uniqueNoteCount: 556,
    packetCount: 29,
    reviewTextChars: 8725188,
    selectedNoteIds: freezeList(['htb-penetration-tester-120948f3c1b3b125']),
    selectorBatch: 'notes-batch-old-rubric-reviewed-remine-001',
    privateBoundary: 'The web-proxy skills-assessment source was re-read from the complete packet route. Public output keeps generalized client-control, transform-order, proxy-capture, request replay, and response-delta proof logic only.',
  });

  const PUBLIC_NOTES = freezeList([
    freezeObject({
      id: 'note-client-controls-are-request-shaping-clues',
      title: 'Treat client controls as request-shaping clues',
      body: 'Disabled buttons, readonly fields, hidden inputs, and browser-side checks prove only that the client tried to guide the operator. They do not prove authorization. Record the client control, the changed request or DOM state, and the server response separately so the workflow does not confuse a front-end bypass with backend permission.',
      kind: 'path-guidance',
      cardIds: freezeList(['web-proxy-transform-proof-chain', 'web-client-controls', 'web-authz-boundaries']),
      toolIds: freezeList(['burp-suite', 'owasp-zap', 'browser-devtools']),
      pathIds: freezeList(['path']),
      tags: freezeList(['web', 'proxy', 'client-controls', 'authorization', 'proof-boundary']),
      sourceRefs: freezeList(['htb-penetration-tester-120948f3c1b3b125']),
      reviewWave: WAVE,
    }),
    freezeObject({
      id: 'note-encoded-cookie-transform-order',
      title: 'Preserve transform order for encoded parameters',
      body: 'When a cookie or parameter decodes through multiple reversible stages, keep the chain explicit: original value, decoded stages, mutation point, reverse encoding order, final request value, and response comparison. The useful lesson is not the exact value; it is preserving transformation order so the replayed request matches what the server expects.',
      kind: 'evidence',
      cardIds: freezeList(['web-proxy-transform-proof-chain', 'encoded-parameter-review']),
      toolIds: freezeList(['burp-suite', 'owasp-zap', 'cyberchef']),
      pathIds: freezeList(['path']),
      tags: freezeList(['web', 'encoding', 'cookie', 'payload-processing', 'evidence']),
      sourceRefs: freezeList(['htb-penetration-tester-120948f3c1b3b125']),
      reviewWave: WAVE,
    }),
    freezeObject({
      id: 'note-capture-tool-http-before-debugging',
      title: 'Capture generated HTTP before debugging a tool',
      body: 'If a scanner or framework module is not behaving as expected, proxy the generated request and inspect the real method, path, headers, host handling, and body before changing assumptions. A tool run is only an attempted action; the captured HTTP request and a manual replay give the evidence needed to decide whether the module, target path, or operator configuration is wrong.',
      kind: 'troubleshooting',
      cardIds: freezeList(['web-proxy-transform-proof-chain', 'tool-generated-http-review']),
      toolIds: freezeList(['burp-suite', 'owasp-zap', 'metasploit']),
      pathIds: freezeList(['path']),
      tags: freezeList(['web', 'proxy', 'metasploit', 'request-capture', 'troubleshooting']),
      sourceRefs: freezeList(['htb-penetration-tester-120948f3c1b3b125']),
      reviewWave: WAVE,
    }),
  ]);

  const PRODUCT_CHANGES = freezeList([
    'field-note:note-client-controls-are-request-shaping-clues',
    'field-note:note-encoded-cookie-transform-order',
    'field-note:note-capture-tool-http-before-debugging',
    'evidence-parser-change:web-proxy-transform-output-analyzer',
    'path-guidance:web-proxy-transform-proof-chain',
  ]);

  function decision(outcome, fields) { return freezeObject({ outcome, ...(fields || {}) }); }
  const REMINE_AUDIT_ROWS = freezeList([
    freezeObject({
      noteId: 'htb-penetration-tester-120948f3c1b3b125',
      title: 'Web proxy transform and request-capture proof chain',
      theme: THEME_ID,
      reviewWave: WAVE,
      originalSourceReread: true,
      sourceRoute: SOURCE_CONFIDENCE.sourceRoute,
      sourcePackets: SOURCE_CONFIDENCE.sourcePackets,
      pathNodesConsidered: freezeList(['path', 'web-proxy-transform-proof-chain', 'web-client-controls', 'encoded-parameter-review']),
      outputIds: freezeList(PUBLIC_NOTES.map((note) => note.id)),
      productChanges: PRODUCT_CHANGES,
      decisions: freezeObject({
        'path-bindings': decision('added', { proofRefs: freezeList(['note-client-controls-are-request-shaping-clues', 'note-encoded-cookie-transform-order']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Bound client-control, encoded-parameter, and proxy-capture lessons to the active web path context.' }),
        'tool-cards': decision('added', { proofRefs: freezeList(['note-encoded-cookie-transform-order', 'note-capture-tool-http-before-debugging']), changedOwners: freezeList([PROOF_FILE]), toolIds: freezeList(['burp-suite', 'owasp-zap', 'cyberchef', 'metasploit']), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Proxy, transform, and tool-generated request review now have public-safe card guidance without copying the private assessment recipe.' }),
        'gui-controls': decision('covered', { ownerIds: freezeList(['evidence-paste-workflow', 'tool-builder-human-review', 'web-request-review-controls']), note: 'Existing UI already has human-reviewed Evidence and command-builder controls; this note strengthens what those controls should classify.' }),
        'scripts-one-liners': decision('private-only', { reason: 'The source contains lab-specific task answers, target values, screenshots, and exact payload handling. Public Obol keeps generalized transform and proxy-capture logic instead of one-liners.' }),
        'command-templates': decision('covered', { ownerIds: freezeList(['tool-builder-human-review', 'web-request-review-controls']), note: 'The reusable value is preserving request/transform state. Obol should not publish an assessment-specific command or payload recipe.' }),
        'terminal-analyzers': decision('added', { proofRefs: freezeList(['web-proxy-transform-output-analyzer']), changedOwners: freezeList([PROOF_FILE]), analyzerIds: freezeList(['web-proxy-transform-output-analyzer']), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Added conservative pasted-output classification for client-control edits, reversible transforms, payload processing, response deltas, and proxied tool requests.' }),
        'evidence-expectations': decision('added', { proofRefs: freezeList(['note-client-controls-are-request-shaping-clues', 'note-encoded-cookie-transform-order', 'web-proxy-transform-output-analyzer']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Client mutation, transform-chain construction, fuzzing response deltas, and captured generated HTTP remain separate Evidence states.' }),
        'path-movement': decision('added', { proofRefs: freezeList(['web-proxy-transform-output-analyzer']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Pasted output can now move the operator toward decode, reverse-encode, replay, or manually verify states without pretending a vulnerability is proven.' }),
        'lesson-boxes': decision('added', { proofRefs: freezeList(PUBLIC_NOTES.map((note) => note.id)), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Added field-note lessons for client controls, transform ordering, and generated HTTP capture.' }),
        'examples': decision('private-only', { reason: 'The private assessment examples include flags, target host data, concrete cookie values, and exact answer strings. Public validation uses synthetic analyzer examples only.' }),
        'troubleshooting': decision('added', { proofRefs: freezeList(['note-capture-tool-http-before-debugging']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Added troubleshooting guidance for capturing a framework request before blaming the module or target.' }),
        'cleanup': decision('not-applicable', { reason: 'This source is focused on browser/proxy request mutation and captured HTTP review; no durable cleanup mechanic is required beyond normal workspace Evidence redaction.' }),
        'report-guidance': decision('added', { proofRefs: freezeList(['note-client-controls-are-request-shaping-clues', 'note-encoded-cookie-transform-order']), changedOwners: freezeList([PROOF_FILE]), reportIds: freezeList(['web-proxy-transform-proof-reporting']), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Reports should state the control changed, transform chain, replayed request class, and observed server response without exposing raw flags or secrets.' }),
        'product-mechanics': decision('added', { proofRefs: freezeList(['web-proxy-transform-output-analyzer']), changedOwners: freezeList([PROOF_FILE]), analyzerIds: freezeList(['web-proxy-transform-output-analyzer']), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'This pass adds a real analyzer and field-note integration, not only a prose rationale.' }),
        'product-gaps': decision('covered', { ownerIds: freezeList(['web-proxy-transform-output-analyzer', 'evidence-paste-workflow']), note: 'The same-surface analyzer gap exposed by this note is built in this pass; richer GUI transform-chain builders can remain future polish rather than a blocker.' }),
        'orange-baseline': decision('covered', { ownerIds: freezeList(['path', 'web-request-review-controls']), note: 'The Orange-derived path remains intact; v9.62 adds notes-derived web proxy interpretation on top of the existing human-run workflow.' }),
      }),
    }),
  ]);

  function analyzeWebProxyTransformOutput(text) {
    const raw = String(text || '');
    const lower = norm(raw);
    const matches = [];
    if (/<button\b[^>]*disabled|disabled\s*=\s*["']?["']?|readonly|edit as html|client-side|browser-side|devtools|enable(?:d)? button/.test(lower)) matches.push('client-control-mutation');
    if (/from hex|from base64|base64|hex(?:adecimal)?|url[- ]?decode|url[- ]?encode|decode(?:d)? .*encode|reverse order|transform chain|cyberchef/.test(lower)) matches.push('reversible-transform-chain');
    if (/set-cookie:|cookie=|phpsessid|md5|31.?characters?|missing (?:last|final) character|encoded cookie/.test(lower)) matches.push('encoded-cookie-candidate');
    if (/intruder|fuzzer|payload processing|payload position|wordlist|alphanum|response length|content-length|outlier|length delta|response size/.test(lower)) matches.push('payload-processing-or-response-delta');
    if (/proxies?\s+http:|127\.0\.0\.1:8080|burp suite|owasp zap|intercepted (?:the )?request|metasploit|auxiliary\/scanner|^get\s+\/.+http\/1\.1|^post\s+\/.+http\/1\.1/m.test(lower)) matches.push('tool-generated-http-capture');
    if (/authenticated|authorized|login succeeded|server accepted|admin panel|unique response|body changed|permission granted/.test(lower)) matches.push('scoped-server-behavior');
    const uniqueMatches = unique(matches);
    const facts = [];
    if (uniqueMatches.includes('client-control-mutation')) facts.push('web.client_control_mutation_observed');
    if (uniqueMatches.includes('reversible-transform-chain')) facts.push('web.reversible_transform_chain_observed');
    if (uniqueMatches.includes('encoded-cookie-candidate')) facts.push('web.encoded_cookie_candidate_observed');
    if (uniqueMatches.includes('payload-processing-or-response-delta')) facts.push('web.payload_processing_or_response_delta_observed');
    if (uniqueMatches.includes('tool-generated-http-capture')) facts.push('web.tool_generated_http_capture_observed');
    if (uniqueMatches.includes('scoped-server-behavior')) facts.push('web.scoped_server_behavior_observed');
    const warnings = [];
    if (uniqueMatches.includes('client-control-mutation') && !uniqueMatches.includes('scoped-server-behavior')) warnings.push('Client-side mutation is not authorization proof; compare the resulting server response before treating it as impact.');
    if (uniqueMatches.includes('reversible-transform-chain')) warnings.push('Record transform order and reverse it when rebuilding the request value.');
    if (uniqueMatches.includes('payload-processing-or-response-delta') && !uniqueMatches.includes('scoped-server-behavior')) warnings.push('A length or size outlier is a triage lead; review status and body content before claiming success.');
    if (uniqueMatches.includes('tool-generated-http-capture')) warnings.push('A framework run proves an attempted request; the captured HTTP and manual replay decide what actually happened.');
    return freezeObject({
      analyzerId: 'web-proxy-transform-output-analyzer',
      matchCount: uniqueMatches.length,
      matches: freezeList(uniqueMatches),
      outcomeFacts: freezeList(facts),
      warnings: freezeList(warnings),
      redactedSnippet: redact(raw),
      recommendedNextState: facts.includes('web.scoped_server_behavior_observed')
        ? 'record-scoped-server-behavior'
        : facts.includes('web.tool_generated_http_capture_observed')
          ? 'manually-replay-captured-http'
          : facts.includes('web.payload_processing_or_response_delta_observed')
            ? 'review-response-delta-before-claiming-success'
            : facts.includes('web.reversible_transform_chain_observed')
              ? 'rebuild-request-with-reverse-transform-order'
              : facts.includes('web.client_control_mutation_observed')
                ? 'compare-mutated-client-state-to-server-response'
                : 'no-web-proxy-transform-signal',
    });
  }

  function activity(text, analysis) {
    const result = analysis.matchCount ? 'success' : 'tried';
    const body = {
      cardId: 'web-proxy-transform-proof-chain',
      result,
      assessment: result === 'success' ? 'supported' : 'attempted',
      confidence: analysis.matchCount >= 2 ? 'high' : 'medium',
      reviewWave: WAVE,
      command: 'evidence:web-proxy-transform-proof-chain',
      source: 'Evidence paste',
      evidence: analysis.redactedSnippet,
      outputSnippet: analysis.redactedSnippet,
      reason: 'Evidence paste was reviewed for client-side control mutation, transform order, payload processing, response delta, and generated HTTP capture states without promoting client-side changes directly to impact.',
      outcomeFacts: analysis.outcomeFacts,
      webProxyTransformMatches: analysis.matches,
      warnings: analysis.warnings,
      recommendedNextState: analysis.recommendedNextState,
    };
    body.fingerprint = 'terminal:' + hash(body.cardId + '|' + norm(body.outputSnippet).slice(0, 500));
    return freezeObject(body);
  }

  function analyzeEvidenceText(text) {
    const analysis = analyzeWebProxyTransformOutput(text);
    const activities = analysis.matchCount ? [activity(text, analysis)] : [];
    return freezeObject({
      wave: WAVE,
      analyzerId: 'web-proxy-transform-output-analyzer',
      activityCount: activities.length,
      activities: freezeList(activities),
      outcomeFacts: analysis.outcomeFacts,
      advancedCards: activities.length ? freezeList(['web-proxy-transform-proof-chain']) : freezeList([]),
      analysis,
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
    out.webProxyTransformEvidence62 = analysis;
    out.webProxyTransformEvidenceCards62 = analysis.advancedCards;
    return out;
  }

  function installEvidenceIngestion() {
    const T = root.OBOL_INTAKE_V21;
    if (!T || typeof T.analyzeTerminal !== 'function') return false;
    if (T.analyzeTerminal.__webProxyTransformReminingV962) return true;
    const oldAnalyze = T.analyzeTerminal;
    T.analyzeTerminal = function webProxyTransformAnalyzeTerminal(text, lanes, state, ctx) {
      const result = oldAnalyze.call(T, text, lanes, state, ctx);
      return mergeEvidenceAnalysis(result, analyzeEvidenceText(text));
    };
    T.analyzeTerminal.__webProxyTransformReminingV962 = true;
    root.__OBOL_WEB_PROXY_TRANSFORM_EVIDENCE_INGESTION_INSTALLED__ = true;
    return true;
  }

  function upsertPublicNotes(notes) {
    if (!notes) return false;
    const prior = Array.from(notes.publicFieldNotes || []);
    const byId = new Map(prior.map((note) => [note.id, note]));
    PUBLIC_NOTES.forEach((note) => byId.set(note.id, note));
    const publicFieldNotes = freezeList(Array.from(byId.values()));
    const publicNotesForTool = (toolId) => {
      const id = norm(toolId);
      return publicFieldNotes.filter((note) => Array.from(note.toolIds || []).some((tool) => norm(tool) === id));
    };
    const publicNotesForPath = (pathId) => {
      const id = norm(pathId);
      return publicFieldNotes.filter((note) => Array.from(note.pathIds || []).some((pathRef) => norm(pathRef) === id));
    };
    const packetReviews = freezeObject({
      ...(notes.packetReviews || {}),
      'web-proxy-transform-remine': freezeObject({
        id: 'web-proxy-transform-remine',
        reviewWave: WAVE,
        status: 'partial-batch-progress',
        candidateCount: REMINE_AUDIT_ROWS.length,
        candidateRefs: freezeList(REMINE_AUDIT_ROWS.map((row) => row.noteId)),
        selectorBatch: SOURCE_CONFIDENCE.selectorBatch,
        closedProductChanges: PRODUCT_CHANGES,
        openProductGaps: freezeList([]),
        discovery: freezeObject({
          selection: 'Second old-rubric reviewed note from the selector batch was re-mined for web proxy transform-order and request-capture mechanics.',
          sourceRoute: SOURCE_CONFIDENCE.sourceRoute,
          sourcePackets: SOURCE_CONFIDENCE.sourcePackets,
        }),
      }),
    });
    root.OBOL_NOTE_INTEGRATION = freezeObject({
      ...notes,
      schemaVersion: '1.16.0',
      publicFieldNotes,
      packetReviews,
      publicNotesForTool,
      publicNotesForPath,
      __webProxyTransformReminingV962: true,
    });
    return true;
  }

  function incrementCounts(base, rowsToAdd) {
    const next = { ...(base || {}) };
    ['added', 'covered', 'queued', 'private-only', 'not-applicable', 'blocked'].forEach((key) => { next[key] = Number(next[key] || 0); });
    rowsToAdd.forEach((row) => Object.values(row.decisions || {}).forEach((entry) => { next[entry.outcome] = Number(next[entry.outcome] || 0) + 1; }));
    return freezeObject(next);
  }

  function incrementDimensionCounts(base, rowsToAdd) {
    const next = { ...(base || {}) };
    DIMENSIONS.forEach((dimension) => {
      const row = { ...(next[dimension] || {}) };
      ['total', 'added', 'covered', 'queued', 'private-only', 'not-applicable', 'blocked'].forEach((key) => { row[key] = Number(row[key] || 0); });
      rowsToAdd.forEach((audit) => {
        const outcome = audit.decisions && audit.decisions[dimension] && audit.decisions[dimension].outcome;
        if (outcome) {
          row.total += 1;
          row[outcome] = Number(row[outcome] || 0) + 1;
        }
      });
      next[dimension] = freezeObject(row);
    });
    return freezeObject(next);
  }

  function integrateProgress() {
    const progress = root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS;
    if (!progress || !progress.remining) return false;
    const current = progress.remining;
    const priorRows = Array.from(current.auditRows || current.remineAuditRows || []);
    const existing = new Set(priorRows.map((row) => row && row.noteId).filter(Boolean));
    const rowsToAdd = REMINE_AUDIT_ROWS.filter((row) => !existing.has(row.noteId)).map((row) => freezeObject({ ...row, reviewWave: WAVE }));
    const mergedRows = freezeList(priorRows.concat(rowsToAdd));
    const baseCount = Number(current.reminedNoteCount || current.audited || 0);
    const nextCount = baseCount + rowsToAdd.length;
    const oldRubricReviewed = Number(current.oldRubricReviewed || current.reviewed || progress.reviewed || 135);
    root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = freezeObject({
      ...progress,
      schemaVersion: '1.15.0',
      remining: freezeObject({
        ...current,
        sourceRequired: true,
        negativeProofRequired: true,
        actualPathRequired: true,
        noNewWrappers: true,
        dimensions: freezeList(DIMENSIONS),
        allowedOutcomes: freezeList(['added', 'covered', 'queued', 'private-only', 'not-applicable', 'blocked']),
        auditRows: mergedRows,
        remineAuditRows: mergedRows,
        audited: nextCount,
        reminedNoteCount: nextCount,
        oldRubricReviewed,
        oldRubricOnlyRemaining: Math.max(0, oldRubricReviewed - nextCount),
        latestWave: WAVE,
        latestThemes: freezeList(unique(Array.from(current.latestThemes || current.reminedThemes || []).concat(['Web proxy transform proof chains']))),
        partialReminedThemes: freezeList(unique(Array.from(current.partialReminedThemes || []).concat([THEME_ID]))),
        latestSelectorBatch: SOURCE_CONFIDENCE.selectorBatch,
        latestSelectorBatchProgress: freezeObject({ selected: 2, target: 20, remainingInBatch: 18 }),
        evidenceIngestionBuilt: freezeList(unique(Array.from(current.evidenceIngestionBuilt || []).concat(['web-proxy-transform-proof-chain']))),
        outcomeCounts: incrementCounts(current.outcomeCounts, rowsToAdd),
        dimensionCounts: incrementDimensionCounts(current.dimensionCounts, rowsToAdd),
      }),
    });
    return true;
  }

  function integrateQueue() {
    const q = root.OBOL_PRODUCT_HARDENING;
    if (!q || !Array.isArray(q.items)) return false;
    const item = q.items.find((entry) => entry && entry.id === ITEM_ID);
    if (item) {
      item.latestPartialRemineWave = WAVE;
      item.latestPartialRemineProof = PROOF_FILE;
      item.latestPartialRemineOutputIds = freezeList(PUBLIC_NOTES.map((note) => note.id));
      item.latestPartialRemineDetail = 'v9.62 re-mined the second selected old-rubric web-proxy assessment note into transform-order, request-capture, field-note, and pasted-output analyzer mechanics. The batch and gate remain open.';
    }
    return true;
  }

  function integrate() {
    const notesIntegrated = root.OBOL_NOTE_INTEGRATION && root.OBOL_NOTE_INTEGRATION.__webProxyTransformReminingV962
      ? true
      : upsertPublicNotes(root.OBOL_NOTE_INTEGRATION);
    return freezeObject({
      notesIntegrated,
      progressIntegrated: integrateProgress(),
      queueIntegrated: integrateQueue(),
      evidenceIngestionIntegrated: installEvidenceIngestion(),
      outputIds: freezeList(PUBLIC_NOTES.map((note) => note.id)),
    });
  }

  const packet = freezeObject({
    wave: WAVE,
    status: 'live-integrated',
    queueItemId: ITEM_ID,
    themeId: THEME_ID,
    sourceConfidence: SOURCE_CONFIDENCE,
    dimensions: DIMENSIONS,
    publicNotes: PUBLIC_NOTES,
    productChanges: PRODUCT_CHANGES,
    remineAuditRows: REMINE_AUDIT_ROWS,
    liveRoutes: freezeList(['#/path', '#/evidence', '#/card/web-proxy-transform-proof-chain']),
    producedFacts: freezeList([
      'web.client_control_mutation_observed',
      'web.reversible_transform_chain_observed',
      'web.encoded_cookie_candidate_observed',
      'web.payload_processing_or_response_delta_observed',
      'web.tool_generated_http_capture_observed',
      'web.scoped_server_behavior_observed',
    ]),
    analyzeWebProxyTransformOutput,
    analyzeEvidenceText,
    installEvidenceIngestion,
    integrate,
  });

  root.OBOL_WEB_PROXY_TRANSFORM_REMINING_V962 = packet;
  const result = integrate();
  if (typeof window !== 'undefined') {
    let tries = 0;
    const schedule = typeof window.setTimeout === 'function' ? window.setTimeout.bind(window) : null;
    const attempt = () => {
      const retry = integrate();
      tries += 1;
      if (!(retry.notesIntegrated && retry.progressIntegrated && retry.evidenceIngestionIntegrated) && tries < 160 && schedule) schedule(attempt, 50);
    };
    if (!(result.notesIntegrated && result.progressIntegrated && result.evidenceIngestionIntegrated) && schedule) schedule(attempt, 0);
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('hashchange', attempt);
      window.addEventListener('focus', attempt);
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = packet;
})(typeof window !== 'undefined' ? window : globalThis);
