'use strict';

(function initXssSessionReminingV957(root) {
  const WAVE = 'v9.57-xss-session-remine';
  const SOURCE_ROUTE = 'platocres/obol-source-notes@agent/review-packets';
  const SOURCE_PACKETS = Object.freeze([
    'data/review-packets/manifest.json',
    'data/review-packets/htb-penetration-tester-03.json',
    'data/review-packets/htb-penetration-tester-04.json',
  ]);

  function freezeList(list) {
    return Object.freeze((list || []).slice());
  }

  function freezeObject(value) {
    return Object.freeze(value || {});
  }

  function unique(list) {
    return Array.from(new Set((list || []).filter(Boolean)));
  }

  const SOURCE_CONFIDENCE = Object.freeze({
    schemaVersion: 2,
    reviewTextPolicy: 'complete_cleaned_text',
    truncationPolicy: 'none',
    expectedNoteCount: 556,
    noteCount: 556,
    uniqueNoteCount: 556,
    packetCount: 29,
    truncatedNoteCount: 0,
    windowMarkerCount: 0,
    reviewTextChars: 8725188,
    resourceCount: 1326,
  });

  const FINDINGS = Object.freeze([
    Object.freeze({
      sourceRef: 'htb-penetration-tester-a4d4973fdf6bc637',
      sourceLabel: 'Stored XSS persistence and trigger proof',
      outcome: 'added',
      productOwner: 'note-xss-delivery-trigger-context',
      publicGuidance:
        'Stored-XSS path cards should require proof that input persisted, where it rendered, which origin executed it, and what user action or refresh caused execution.',
      evidenceAdds: Object.freeze([
        'Record persistence proof separately from the initial submission request.',
        'Capture the executing origin or frame context before claiming application impact.',
        'Prefer reversible browser-observable proof when dialog-style proof is blocked or noisy.',
      ]),
      privateOnly: Object.freeze([
        'Raw payload strings',
        'Course target details',
        'Credential or cookie values',
      ]),
    }),
    Object.freeze({
      sourceRef: 'htb-penetration-tester-29a1c06afad3cb8d',
      sourceLabel: 'XSS browser execution boundary',
      outcome: 'covered',
      productOwner: 'note-xss-browser-execution-proof',
      publicGuidance:
        'XSS cards should keep browser JavaScript execution distinct from server code execution, account takeover, and session compromise until separate evidence proves those claims.',
      evidenceAdds: Object.freeze([
        'Name the browser-side execution context explicitly.',
        'Require same-origin or victim-context evidence before chaining impact claims.',
        'Treat scanner or reflection output as a lead until execution is observed in a browser context.',
      ]),
      privateOnly: Object.freeze([
        'Exploit payload recipes',
        'Lab-specific endpoints',
      ]),
    }),
    Object.freeze({
      sourceRef: 'htb-penetration-tester-6317a4c1a6b7cdc7',
      sourceLabel: 'Proof variant and operator hygiene lesson',
      outcome: 'queued',
      productOwner: 'note-xss-browser-execution-proof',
      blocker: 'Needs UI wording pass before exposing as a selectable proof-mode control.',
      publicGuidance:
        'The product should expose a proof-mode choice such as dialog, DOM marker, console marker, or harmless callback, with cleanup reminders and no copied payload recipes.',
      evidenceAdds: Object.freeze([
        'Offer more than one benign proof mode because browsers and training sandboxes handle dialogs differently.',
        'Tie proof mode to a cleanup reminder before moving the path forward.',
      ]),
      privateOnly: Object.freeze([
        'Remote script loading snippets',
        'Listener setup recipes',
        'Cookie exfiltration mechanics',
      ]),
    }),
    Object.freeze({
      sourceRef: 'htb-penetration-tester-2715d3efea49bdce',
      sourceLabel: 'Session impact boundary',
      outcome: 'added',
      productOwner: 'note-xss-session-impact-boundary',
      publicGuidance:
        'Session-impact cards should separate browser-readable session material, same-origin browser actions, recovered material use, and privileged app effects instead of collapsing them into one hijacking claim.',
      evidenceAdds: Object.freeze([
        'Record whether browser-side code can access the relevant session material.',
        'Record whether transport-only flags change network handling without proving protection from same-origin browser actions.',
        'Require a separate user-safe evidence gate before claiming recovered session material was useful.',
      ]),
      privateOnly: Object.freeze([
        'Captured session values',
        'Reusable replay steps',
        'Target-specific session names',
      ]),
    }),
    Object.freeze({
      sourceRef: 'htb-penetration-tester-c67727d9b2d3119d',
      sourceLabel: 'Discovery-to-proof analyzer boundary',
      outcome: 'covered',
      productOwner: 'note-xss-browser-execution-proof',
      publicGuidance:
        'Discovery output analyzers should promote reflected parameters into browser-proof work, not directly into exploitation or impact claims.',
      evidenceAdds: Object.freeze([
        'Keep parameter discovery, reflection proof, and browser execution proof as separate movement states.',
        'Ask the operator for observed terminal or browser output before unlocking a higher-impact step.',
      ]),
      privateOnly: Object.freeze([
        'Exact vulnerable parameter values',
        'Payload wordlists from private notes',
      ]),
    }),
  ]);

  const DIMENSION_AUDIT = Object.freeze([
    Object.freeze({ dimension: 'path-bindings', result: 'added', note: 'Binds stored-XSS persistence and session-impact boundaries to existing XSS Next Step owners.' }),
    Object.freeze({ dimension: 'gui-controls', result: 'queued', note: 'Proof-mode selector is useful, but needs copy and clutter testing before surfacing.' }),
    Object.freeze({ dimension: 'terminal-analyzers', result: 'covered', note: 'Analyzer boundary remains discovery/reflection/browser-proof movement, not automatic exploit escalation.' }),
    Object.freeze({ dimension: 'lesson-boxes', result: 'added', note: 'Adds operator-facing lesson material about browser context, origin, persistence, and session boundaries.' }),
    Object.freeze({ dimension: 'cleanup', result: 'queued', note: 'Callback-style proof mode needs a cleanup reminder before it becomes a generated control.' }),
  ]);

  const PUBLIC_SAFE_CHANGES = Object.freeze([
    'Record executing origin separately from the request that delivered input.',
    'Prefer reversible browser-observable proof before escalating impact claims.',
    'Separate persistence, refresh, and authorized-viewer trigger proof from session impact.',
    'Treat browser-readable session material, same-origin authenticated actions, and recovered-session use as separate evidence gates.',
    'Store raw payload strings, listener setup, targets, flags, and credentials in private-source evidence only.',
  ]);

  const FIELD_NOTES = freezeList([
    freezeObject({
      id: 'note-xss-delivery-trigger-context',
      title: 'Prove XSS delivery, persistence, and trigger separately',
      body: 'For reflected or stored XSS, record how input reached the page, whether it persisted, where it rendered, which origin or frame executed it, and what user action or refresh triggered execution. Do not promote reflected input, stored text, or scanner output into demonstrated browser execution until the browser-side effect is observed in context.',
      kind: 'path-guidance',
      cardIds: freezeList(['xss', 'web-client-side', 'session']),
      toolIds: freezeList(['burpsuite', 'zap', 'curl']),
      pathIds: freezeList(['path']),
      tags: freezeList(['xss', 'stored-xss', 'reflected-xss', 'browser-proof', 'proof-boundary']),
      sourceRefs: freezeList(['htb-penetration-tester-a4d4973fdf6bc637', 'htb-penetration-tester-de4321474fab4f6d']),
      reviewWave: WAVE,
    }),
    freezeObject({
      id: 'note-xss-browser-execution-proof',
      title: 'Browser execution is the XSS proof boundary',
      body: 'Treat discovery output, reflection, encoding quirks, and sanitizer behavior as candidate signals. The XSS proof boundary is browser-side execution in the affected context. Browser execution is not the same thing as server code execution, account takeover, or session compromise; those require separate evidence gates.',
      kind: 'evidence',
      cardIds: freezeList(['xss', 'web-client-side']),
      toolIds: freezeList(['burpsuite', 'zap']),
      pathIds: freezeList(['path']),
      tags: freezeList(['xss', 'browser-proof', 'evidence', 'proof-boundary', 'client-side']),
      sourceRefs: freezeList(['htb-penetration-tester-29a1c06afad3cb8d', 'htb-penetration-tester-6317a4c1a6b7cdc7', 'htb-penetration-tester-c67727d9b2d3119d']),
      reviewWave: WAVE,
    }),
    freezeObject({
      id: 'note-xss-session-impact-boundary',
      title: 'Session impact needs its own proof chain',
      body: 'Keep session impact claims split into distinct facts: whether browser-side code can access relevant session material, whether same-origin authenticated actions are possible, whether any recovered material was useful, and whether a privileged application effect was demonstrated. Do not collapse those into one hijacking claim without evidence for each step.',
      kind: 'evidence',
      cardIds: freezeList(['xss', 'session', 'web-auth']),
      toolIds: freezeList(['burpsuite', 'zap']),
      pathIds: freezeList(['path']),
      tags: freezeList(['xss', 'session', 'cookie-flags', 'web-auth', 'proof-boundary']),
      sourceRefs: freezeList(['htb-penetration-tester-2715d3efea49bdce']),
      reviewWave: WAVE,
    }),
  ]);

  const QUEUED_PRODUCT_GAPS = freezeList([
    freezeObject({
      id: 'gap-xss-proof-mode-selector',
      track: 'ui-ux',
      status: 'queued',
      priority: 86.831,
      label: 'Design XSS proof-mode selector',
      detail: 'Turn the re-mined XSS proof-mode lesson into an uncluttered builder/UI control that lets operators choose benign proof styles such as dialog, DOM marker, console marker, or harmless callback while preserving public-safe boundaries and avoiding raw payload recipes.',
    }),
    freezeObject({
      id: 'gap-xss-proof-mode-cleanup-reminder',
      track: 'ui-ux',
      status: 'queued',
      priority: 86.832,
      label: 'Add XSS proof cleanup reminder',
      detail: 'Pair any callback-style or state-changing XSS proof mode with explicit cleanup and removal guidance so the builder reminds operators to remove temporary test artifacts and avoid treating proof plumbing as persistent access.',
    }),
  ]);

  const REMINE_DIMENSIONS = freezeList([
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
  const NEGATIVE_OUTCOMES = freezeList(['added', 'covered', 'queued', 'private-only', 'not-applicable', 'blocked']);

  function decision(outcome, fields) {
    return freezeObject(Object.assign({ outcome }, fields || {}));
  }

  function commonXssDecisions(ownerId) {
    return freezeObject({
      'path-bindings': decision('added', {
        proofRefs: [ownerId],
        ownerIds: [ownerId],
        changedOwners: ['data/product-hardening/xss-session-remining-v9.57.js'],
        pathIds: ['path'],
        actualPathIntegrated: true,
        note: 'The re-mined field note is attached to the shared Next Steps path surface and carries the XSS/session proof boundary forward.',
      }),
      'tool-cards': decision('covered', {
        ownerIds: ['burpsuite', 'zap', 'curl'],
        note: 'Existing web proxy and request tools own the mechanics; the re-mine changes how their output is interpreted, not the tool inventory.',
      }),
      'gui-controls': decision('queued', {
        gapIds: ['gap-xss-proof-mode-selector'],
        note: 'A proof-mode selector is useful, but it needs wording and clutter testing before becoming a visible builder control.',
      }),
      'scripts-one-liners': decision('private-only', {
        reason: 'Reusable payload and callback snippets stay private. The public product keeps proof-mode labels and evidence boundaries only.',
      }),
      'command-templates': decision('private-only', {
        reason: 'The source command material is payload-centric and target-context dependent, so no public copy-paste template is published.',
      }),
      'terminal-analyzers': decision('covered', {
        ownerIds: [ownerId],
        note: 'Existing discovery/reflection analyzers should route to browser proof instead of direct impact claims.',
      }),
      'evidence-expectations': decision('added', {
        proofRefs: [ownerId],
        ownerIds: [ownerId],
        note: 'The field note states the exact proof facts required before advancing the path.',
      }),
      'path-movement': decision('added', {
        ownerIds: ['path'],
        note: 'Candidate input handling moves to browser proof, then only later to session-impact review when distinct evidence exists.',
      }),
      'lesson-boxes': decision('added', {
        proofRefs: [ownerId],
        ownerIds: [ownerId],
        note: 'The note is operator-facing lesson material for the XSS/session path card.',
      }),
      examples: decision('private-only', {
        reason: 'The concrete exercises include lab-specific values and payload forms. Public Obol carries generalized proof examples only.',
      }),
      troubleshooting: decision('covered', {
        ownerIds: [ownerId],
        note: 'The proof boundary covers common false positives such as reflection without execution and blocked/noisy proof modes.',
      }),
      cleanup: decision('queued', {
        gapIds: ['gap-xss-proof-mode-cleanup-reminder'],
        note: 'Callback-style proof needs a cleanup reminder before surfacing as a selectable control.',
      }),
      'report-guidance': decision('covered', {
        ownerIds: [ownerId],
        note: 'Report language should name the observed browser effect and avoid unsupported session or takeover claims.',
      }),
      'product-mechanics': decision('added', {
        proofRefs: [ownerId],
        changedOwners: ['data/product-hardening/xss-session-remining-v9.57.js', 'data/runtime-manifest.js'],
        note: 'The re-mining artifact now mutates live note integration, progress, and Product Build Next surfaces when the Product Hardening bundle loads.',
      }),
      'product-gaps': decision('queued', {
        gapIds: ['gap-xss-proof-mode-selector', 'gap-xss-proof-mode-cleanup-reminder'],
        note: 'The remaining work is queued as concrete UI/UX Product Build Next items.',
      }),
      'orange-baseline': decision('covered', {
        ownerIds: ['path'],
        note: 'Existing Orange-derived web path items are retained and extended additively.',
      }),
    });
  }

  const REMINE_AUDIT_ROWS = freezeList(FINDINGS.map((finding) =>
    freezeObject({
      noteId: finding.sourceRef,
      title: finding.sourceLabel,
      theme: 'xss-session',
      reviewWave: WAVE,
      sourceRoute: SOURCE_ROUTE,
      sourcePackets: SOURCE_PACKETS,
      originalSourceReread: true,
      decisions: commonXssDecisions(finding.productOwner),
    })
  ));

  function recomputeRemineProgress(baseProgress) {
    const current = baseProgress && baseProgress.remining ? baseProgress.remining : {};
    const priorRows = Array.from(current.auditRows || []);
    const rowKey = (row) => String(row.reviewWave || '') + ':' + String(row.noteId || '');
    const seen = new Set();
    const auditRows = freezeList(priorRows.concat(Array.from(REMINE_AUDIT_ROWS)).filter((row) => {
      const key = rowKey(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }));
    const dimensions = freezeList(unique(Array.from(current.dimensions || []).concat(Array.from(REMINE_DIMENSIONS))));
    const allowedOutcomes = freezeList(unique(Array.from(current.allowedOutcomes || []).concat(Array.from(NEGATIVE_OUTCOMES))));
    const outcomeCounts = allowedOutcomes.reduce((acc, id) => {
      acc[id] = 0;
      return acc;
    }, {});
    const dimensionCounts = dimensions.reduce((acc, id) => {
      acc[id] = { considered: 0, added: 0, covered: 0, queued: 0, privateOnly: 0, notApplicable: 0, blocked: 0, ruledOut: 0 };
      return acc;
    }, {});
    const keyFor = { added: 'added', covered: 'covered', queued: 'queued', 'private-only': 'privateOnly', 'not-applicable': 'notApplicable', blocked: 'blocked' };
    auditRows.forEach((row) => {
      dimensions.forEach((dim) => {
        const dec = row && row.decisions && row.decisions[dim];
        if (!dec || !dec.outcome) return;
        const outcome = String(dec.outcome);
        if (Object.prototype.hasOwnProperty.call(outcomeCounts, outcome)) outcomeCounts[outcome] += 1;
        if (dimensionCounts[dim]) {
          dimensionCounts[dim].considered += 1;
          const key = keyFor[outcome];
          if (key) dimensionCounts[dim][key] += 1;
        }
      });
    });
    Object.keys(dimensionCounts).forEach((id) => {
      dimensionCounts[id] = freezeObject(dimensionCounts[id]);
    });
    const themes = freezeList(unique(Array.from(current.reminedThemes || []).concat(auditRows.map((row) => row.theme))));
    const completedThemes = freezeList(unique(Array.from(current.completedReminedThemes || []).concat(['xss-session'])));
    return freezeObject({
      ...current,
      sourceRequired: true,
      negativeProofRequired: true,
      allowedOutcomes,
      dimensions,
      dimensionCounts: freezeObject(dimensionCounts),
      outcomeCounts: freezeObject(outcomeCounts),
      auditRows,
      audited: auditRows.length,
      reminedNoteCount: auditRows.length,
      reminedThemes: themes,
      completedReminedThemes: completedThemes,
      additiveOrangeBaseline: true,
      actualPathRequired: true,
      noNewWrappers: true,
      active: true,
      blockedFreshPacketsUntilComplete: true,
      latestWave: WAVE,
      latestOutputs: freezeList(FIELD_NOTES.map((note) => note.id)),
      queuedProductGaps: freezeList(QUEUED_PRODUCT_GAPS.map((item) => item.id)),
      redFlags: freezeList(current.redFlags || []),
    });
  }

  function integrateNotes() {
    const notes = root.OBOL_NOTE_INTEGRATION;
    if (!notes || !notes.ledger || notes.__xssSessionReminingV957) return;
    const noteIds = new Set(FIELD_NOTES.map((note) => note.id));
    const publicFieldNotes = freezeList(Array.from(notes.publicFieldNotes || [])
      .filter((note) => !noteIds.has(note && note.id))
      .concat(Array.from(FIELD_NOTES)));
    const packetReviews = freezeObject({
      ...(notes.packetReviews || {}),
      'xss-session-remine': freezeObject({
        id: 'xss-session-remine',
        reviewWave: WAVE,
        status: 'complete',
        candidateCount: FINDINGS.length,
        candidateRefs: freezeList(FINDINGS.map((finding) => finding.sourceRef)),
        priorTerminalCount: FINDINGS.length,
        newlyTerminalCount: FINDINGS.length,
        deferredRefs: freezeList([]),
        openProductGaps: freezeList(QUEUED_PRODUCT_GAPS.map((item) => item.id)),
        closedProductChanges: freezeList(FIELD_NOTES.map((note) => note.id)),
        deferredTo: freezeObject({
          'gap-xss-proof-mode-selector': 'Future uncluttered GUI proof-mode control',
          'gap-xss-proof-mode-cleanup-reminder': 'Cleanup copy before harmless callback mode is surfaced',
        }),
        discovery: freezeObject({
          selection: 'Previously reviewed XSS/session notes were re-mined from private source packets for live card, path, analyzer, lesson, cleanup, and product-gap outputs.',
          sourceRoute: SOURCE_ROUTE,
          sourcePackets: SOURCE_PACKETS,
        }),
      }),
    });
    const publicNotesForTool = (toolId) => {
      const id = String(toolId || '').trim().toLowerCase();
      return publicFieldNotes.filter((note) => (note.toolIds || []).some((tool) => String(tool).toLowerCase() === id));
    };
    const publicNotesForPath = (pathId) => {
      const id = String(pathId || '').trim().toLowerCase();
      return publicFieldNotes.filter((note) => (note.pathIds || []).some((path) => String(path).toLowerCase() === id));
    };
    const validate = () => {
      const failures = typeof notes.validate === 'function' ? Array.from(notes.validate() || []) : [];
      FIELD_NOTES.forEach((note) => {
        if (!publicFieldNotes.find((entry) => entry.id === note.id)) failures.push('missing live XSS/session re-mined note ' + note.id);
      });
      return failures;
    };
    root.OBOL_NOTE_INTEGRATION = freezeObject({
      ...notes,
      schemaVersion: '1.10.0',
      publicFieldNotes,
      packetReviews,
      publicNotesForTool,
      publicNotesForPath,
      validate,
      __xssSessionReminingV957: true,
    });
  }

  function upsertQueueItem(q, item) {
    if (!q || !Array.isArray(q.items)) return;
    const existing = q.items.find((entry) => entry && entry.id === item.id);
    if (existing) Object.assign(existing, item);
    else q.items.push({ ...item });
  }

  function countGapItemsOnTrack(q) {
    if (!q || !Array.isArray(q.items)) return 0;
    return QUEUED_PRODUCT_GAPS.filter((item) => q.items.some((entry) => entry && entry.id === item.id && entry.track === item.track)).length;
  }

  function integrateHardeningQueue() {
    const q = root.OBOL_PRODUCT_HARDENING;
    if (!q || !Array.isArray(q.items)) return;
    const item = q.items.find((entry) => entry && entry.id === 'notes-remine-xss-session');
    if (item) {
      item.status = 'complete';
      item.detail = 'Reviewed XSS/session source notes were re-mined into live path-bound field notes for delivery/trigger context, browser execution proof, and session-impact boundaries. Proof-mode GUI controls and cleanup prompts are now queued as explicit Product Build Next UI/UX items.';
    }
    const beforeUiGapCount = countGapItemsOnTrack(q);
    QUEUED_PRODUCT_GAPS.forEach((gap) => upsertQueueItem(q, gap));
    const afterUiGapCount = countGapItemsOnTrack(q);
    const addedUiGapCount = Math.max(0, afterUiGapCount - beforeUiGapCount);
    const uiTrack = Array.isArray(q.tracks) ? q.tracks.find((entry) => entry && entry.id === 'ui-ux') : null;
    if (uiTrack && addedUiGapCount && !uiTrack.__xssProofModeGapsCounted) {
      uiTrack.total = Number(uiTrack.total || 0) + addedUiGapCount;
      uiTrack.__xssProofModeGapsCounted = true;
    }
  }

  function integrateProgress() {
    const progress = root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS;
    if (!progress) return;
    root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = freezeObject({
      ...progress,
      schemaVersion: '1.8.0',
      remining: recomputeRemineProgress(progress),
    });
  }

  const packet = freezeObject({
    wave: WAVE,
    sourceRoute: SOURCE_ROUTE,
    sourcePackets: SOURCE_PACKETS,
    sourceConfidence: SOURCE_CONFIDENCE,
    findings: FINDINGS,
    dimensionAudit: DIMENSION_AUDIT,
    publicSafeChanges: PUBLIC_SAFE_CHANGES,
    fieldNotes: FIELD_NOTES,
    remineAuditRows: REMINE_AUDIT_ROWS,
    queuedProductGaps: QUEUED_PRODUCT_GAPS,
    liveCards: freezeList(FIELD_NOTES.map((note) => note.id)),
    liveRoutes: freezeList(['#/path', '#/dashboard']),
    status: 'live-integrated',
    integrate: () => {
      integrateNotes();
      integrateHardeningQueue();
      integrateProgress();
      return packet;
    },
  });

  root.OBOL_XSS_SESSION_REMINING_V957 = packet;
  packet.integrate();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = packet;
  }
})(typeof window !== 'undefined' ? window : globalThis);