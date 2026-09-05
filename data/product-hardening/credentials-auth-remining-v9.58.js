'use strict';

(function initCredentialsAuthReminingV958(root) {
  const WAVE = 'v9.58-credentials-auth-remine';
  const SOURCE_ROUTE = 'platocres/obol-source-notes@agent/review-packets';
  const SOURCE_PACKETS = Object.freeze([
    'data/review-packets/manifest.json',
    'data/review-packets/htb-penetration-tester-11.json',
    'data/review-packets/offsec-pen-200-02.json',
    'data/review-packets/offsec-pen-200-03.json',
  ]);

  function freezeList(list) { return Object.freeze((list || []).slice()); }
  function freezeObject(value) { return Object.freeze(value || {}); }
  function unique(list) { return Array.from(new Set((list || []).filter(Boolean))); }

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

  const FINDINGS = freezeList([
    freezeObject({
      sourceRef: 'htb-penetration-tester-f31e4279342a81b5',
      sourceLabel: 'Credential storage provenance and validation boundary',
      outcome: 'added',
      productOwner: 'note-credential-source-validation-chain',
      publicGuidance: 'Recovered authentication material needs provenance, material type, apparent scope, and independent service validation before it can move the path forward.',
      evidenceAdds: freezeList([
        'Record where the material came from before choosing a tool or protocol.',
        'Keep source provenance separate from whether the material authenticates anywhere.',
        'Preserve redaction and lineage when the same secret appears in more than one source.',
      ]),
      privateOnly: freezeList(['Raw secrets', 'course hostnames', 'exercise account names']),
    }),
    freezeObject({
      sourceRef: 'offsec-pen-200-07a86d1907bc1ee1',
      sourceLabel: 'Kerberos ticket and protocol scope boundary',
      outcome: 'covered',
      productOwner: 'note-auth-material-routing-proof',
      publicGuidance: 'Ticket material, hashes, passwords, keys, certificates, and tokens are not interchangeable. Route each material class only to services and tools that support that protocol.',
      evidenceAdds: freezeList([
        'Require protocol and service scope before routing credential material.',
        'Separate possession of ticket material from observed service authorization.',
      ]),
      privateOnly: freezeList(['Ticket injection recipes', 'domain-specific service names']),
    }),
    freezeObject({
      sourceRef: 'offsec-pen-200-b1db6481c5b90a95',
      sourceLabel: 'Challenge-response is not pass-the-hash material',
      outcome: 'added',
      productOwner: 'note-challenge-response-proof-boundary',
      publicGuidance: 'Challenge-response captures are crackable evidence, not reusable NT hash material. Keep capture, cracking, recovered plaintext, and service validation as separate states.',
      evidenceAdds: freezeList([
        'Route challenge-response captures toward cracking instead of pass-the-hash builders.',
        'Require recovered plaintext or another reusable material before offering compatible authentication handoffs.',
      ]),
      privateOnly: freezeList(['Captured challenge values', 'relay or capture setup mechanics']),
    }),
    freezeObject({
      sourceRef: 'htb-penetration-tester-6486887de1050834',
      sourceLabel: 'Authentication policy and rate-safety boundary',
      outcome: 'queued',
      productOwner: 'note-auth-rate-policy-validation-boundary',
      publicGuidance: 'Password testing should carry an explicit policy and cadence warning so operators do not treat a wordlist or credential lead as permission for broad guessing.',
      evidenceAdds: freezeList([
        'Keep lockout policy, attempt cadence, and failed-response interpretation visible near credential-validation actions.',
        'Treat failure as scoped to the tested service and time, not global invalidation of the secret.',
      ]),
      blocker: 'Needs an uncluttered validation-safety UI slot before becoming a builder control.',
      privateOnly: freezeList(['Target-specific wordlists', 'brute-force replay details']),
    }),
    freezeObject({
      sourceRef: 'htb-penetration-tester-4f28d95210c84f5a',
      sourceLabel: 'Protected container and inner-secret lineage',
      outcome: 'added',
      productOwner: 'note-protected-secret-lineage-boundary',
      publicGuidance: 'A vault, archive, protected document, or encrypted key is a container. Unlocking it creates new material but does not prove any downstream account accepts that material.',
      evidenceAdds: freezeList([
        'Record container unlock separately from extracted inner material.',
        'Require later service validation before claiming account access.',
      ]),
      privateOnly: freezeList(['Vault contents', 'document passwords', 'private key material']),
    }),
    freezeObject({
      sourceRef: 'offsec-pen-200-30d7d51a9fb1a2b6',
      sourceLabel: 'SSH key passphrase and authentication boundary',
      outcome: 'covered',
      productOwner: 'note-protected-secret-lineage-boundary',
      publicGuidance: 'Possessing an encrypted private key, recovering its passphrase, and successfully authenticating to SSH are three different facts with different evidence requirements.',
      evidenceAdds: freezeList([
        'Separate key possession from passphrase recovery.',
        'Treat SSH acceptance as target- and account-scoped evidence.',
      ]),
      privateOnly: freezeList(['Private key bytes', 'passphrase values', 'host-specific login attempts']),
    }),
  ]);

  const FIELD_NOTES = freezeList([
    freezeObject({
      id: 'note-credential-source-validation-chain',
      title: 'Credential material needs provenance and validation',
      body: 'When a password, hash, ticket, key, certificate, cookie, or token appears, record where it came from, what material class it is, which identity or service it appears to belong to, and whether it has been independently validated. A discovered secret-shaped value is a lead until a scoped authentication response proves it works.',
      kind: 'path-guidance',
      cardIds: freezeList(['credentials', 'authentication', 'web-auth']),
      toolIds: freezeList(['nxc', 'evil-winrm', 'ssh', 'curl']),
      pathIds: freezeList(['path']),
      tags: freezeList(['credential', 'authentication', 'validation', 'proof-boundary', 'secret-handling']),
      sourceRefs: freezeList(['htb-penetration-tester-f31e4279342a81b5', 'htb-penetration-tester-60a801d09c706c64']),
      reviewWave: WAVE,
    }),
    freezeObject({
      id: 'note-auth-material-routing-proof',
      title: 'Route auth material by protocol, not vibes',
      body: 'Passwords, NT hashes, NetNTLM challenge-response captures, Kerberos tickets, certificates, keys, cookies, bearer tokens, and API keys have different protocol rules. Match the material class to a compatible target and tool before offering a handoff, and do not treat possession of material as proof of service access.',
      kind: 'tool-guidance',
      cardIds: freezeList(['credentials', 'active-directory', 'authentication']),
      toolIds: freezeList(['nxc', 'secretsdump', 'evil-winrm', 'certipy', 'hashcat', 'john']),
      pathIds: freezeList(['path']),
      tags: freezeList(['credential', 'authentication', 'ntlm', 'kerberos', 'ticket', 'certificate', 'proof-boundary']),
      sourceRefs: freezeList(['offsec-pen-200-07a86d1907bc1ee1', 'offsec-pen-200-043a4ca517c8a4ba', 'offsec-pen-200-684d718879324f84', 'offsec-pen-200-770f7517c77b7003']),
      reviewWave: WAVE,
    }),
    freezeObject({
      id: 'note-challenge-response-proof-boundary',
      title: 'Challenge-response captures are cracking leads, not reusable hashes',
      body: 'Keep NetNTLM-style challenge-response material out of pass-the-hash workflows. It can be evidence for offline cracking, but capture, crackability, recovered plaintext, and later service authentication are separate states. Promote only the state that the operator actually proved.',
      kind: 'evidence',
      cardIds: freezeList(['credentials', 'cracking', 'authentication']),
      toolIds: freezeList(['hashcat', 'john', 'nxc']),
      pathIds: freezeList(['path']),
      tags: freezeList(['credential', 'netntlm', 'hash', 'cracking', 'pass-the-hash', 'evidence']),
      sourceRefs: freezeList(['offsec-pen-200-b1db6481c5b90a95']),
      reviewWave: WAVE,
    }),
    freezeObject({
      id: 'note-auth-rate-policy-validation-boundary',
      title: 'Credential validation must respect lockout and scope',
      body: 'Before password guessing, spraying, or repeated validation attempts, look for lockout policy and visible defensive signals. Keep attempts deliberately bounded when policy is unknown. A success or failure belongs to the tested identity, service, and moment; it does not automatically prove the secret works or fails everywhere.',
      kind: 'tool-guidance',
      cardIds: freezeList(['credentials', 'authentication', 'password-spraying']),
      toolIds: freezeList(['nxc', 'hydra', 'curl']),
      pathIds: freezeList(['path']),
      tags: freezeList(['credential', 'password', 'authentication', 'password-spraying', 'safety', 'proof-boundary']),
      sourceRefs: freezeList(['htb-penetration-tester-6486887de1050834', 'offsec-pen-200-3053b3672f1b05d8']),
      reviewWave: WAVE,
    }),
    freezeObject({
      id: 'note-protected-secret-lineage-boundary',
      title: 'Protected containers create new material, not instant access',
      body: 'Treat vaults, protected archives, encrypted documents, and passphrase-protected SSH keys as containers. Unlocking the container produces a new artifact or secret that needs its own redacted record, lineage, and later validation. Do not collapse container unlock, inner-secret recovery, and target authentication into one finding.',
      kind: 'evidence',
      cardIds: freezeList(['credentials', 'protected-files', 'ssh']),
      toolIds: freezeList(['hashcat', 'john', 'ssh']),
      pathIds: freezeList(['path']),
      tags: freezeList(['credential', 'protected-file', 'ssh-key', 'secret-handling', 'proof-boundary']),
      sourceRefs: freezeList(['htb-penetration-tester-4f28d95210c84f5a', 'htb-penetration-tester-9d4219d35ffac59a', 'htb-penetration-tester-be932fd6f12009eb', 'offsec-pen-200-30d7d51a9fb1a2b6', 'offsec-pen-200-f17790d7bb59ec84']),
      reviewWave: WAVE,
    }),
  ]);

  const QUEUED_PRODUCT_GAPS = freezeList([
    freezeObject({
      id: 'gap-auth-validation-safety-slot',
      track: 'ui-ux',
      status: 'queued',
      priority: 86.833,
      label: 'Design credential validation safety slot',
      detail: 'Add an uncluttered credential-validation warning area that keeps protocol scope, lockout policy, attempt cadence, and failed-response scope visible beside auth-capable builders without encouraging automated guessing.',
    }),
    freezeObject({
      id: 'gap-auth-material-scope-analyzer',
      track: 'testing-qa',
      status: 'queued',
      priority: 86.834,
      label: 'Add auth material scope analyzer',
      detail: 'Add conservative terminal-output recognition for credential-material class and proof state so captures, cracked plaintext, tickets, keys, and successful service responses do not collapse into one unsupported credential finding.',
    }),
  ]);

  const REMINE_DIMENSIONS = freezeList([
    'path-bindings', 'tool-cards', 'gui-controls', 'scripts-one-liners', 'command-templates',
    'terminal-analyzers', 'evidence-expectations', 'path-movement', 'lesson-boxes', 'examples',
    'troubleshooting', 'cleanup', 'report-guidance', 'product-mechanics', 'product-gaps', 'orange-baseline',
  ]);
  const NEGATIVE_OUTCOMES = freezeList(['added', 'covered', 'queued', 'private-only', 'not-applicable', 'blocked']);

  function decision(outcome, fields) { return freezeObject(Object.assign({ outcome }, fields || {})); }

  function commonCredentialDecisions(ownerId) {
    return freezeObject({
      'path-bindings': decision('added', { proofRefs: [ownerId], ownerIds: [ownerId], pathIds: ['path'], actualPathIntegrated: true, note: 'The re-mined credential/auth note is path-bound and keeps validation before path movement.' }),
      'tool-cards': decision('covered', { ownerIds: ['nxc', 'secretsdump', 'evil-winrm', 'hashcat', 'john', 'ssh', 'curl'], note: 'Existing credential-aware tool builders own the mechanics; this wave sharpens when each tool is appropriate.' }),
      'gui-controls': decision('queued', { gapIds: ['gap-auth-validation-safety-slot'], note: 'A credential-validation warning slot is useful, but it needs UI copy and density testing before becoming a persistent builder control.' }),
      'scripts-one-liners': decision('private-only', { reason: 'Source-specific capture, cracking, and login recipes stay private. Public Obol keeps material-class and proof-state guidance only.' }),
      'command-templates': decision('covered', { ownerIds: ['hashcat', 'john', 'nxc', 'evil-winrm', 'ssh', 'curl'], note: 'Existing builders generate command templates; re-mining affects routing and evidence interpretation rather than adding copied commands.' }),
      'terminal-analyzers': decision('queued', { gapIds: ['gap-auth-material-scope-analyzer'], note: 'A conservative analyzer should distinguish material class and proof state without auto-promoting secrets to access.' }),
      'evidence-expectations': decision('added', { proofRefs: [ownerId], ownerIds: [ownerId], note: 'The field note states the credential proof facts required before advancement.' }),
      'path-movement': decision('added', { ownerIds: ['path'], note: 'Credential material moves to validation or cracking work first; only explicit service acceptance moves the path to access.' }),
      'lesson-boxes': decision('added', { proofRefs: [ownerId], ownerIds: [ownerId], note: 'The note is operator-facing lesson material for credential/auth path decisions.' }),
      examples: decision('private-only', { reason: 'Concrete exercises include target-specific accounts, secrets, or capture context. Public Obol uses generalized examples only.' }),
      troubleshooting: decision('covered', { ownerIds: [ownerId], note: 'The proof boundary covers common mistakes such as protocol mismatch, challenge-response confusion, and over-generalizing one auth result.' }),
      cleanup: decision('covered', { ownerIds: [ownerId], note: 'Sensitive material remains redacted and scoped; no target state cleanup mechanic is added by this guidance-only wave.' }),
      'report-guidance': decision('added', { proofRefs: [ownerId], ownerIds: [ownerId], note: 'Reports should name material class, provenance, and validated scope without disclosing raw secrets.' }),
      'product-mechanics': decision('added', { proofRefs: [ownerId], changedOwners: ['data/product-hardening/credentials-auth-remining-v9.58.js', 'data/current-release.js'], note: 'The v9.58 release artifact self-integrates into live note integration, progress, and Product Build Next surfaces.' }),
      'product-gaps': decision('queued', { gapIds: ['gap-auth-validation-safety-slot', 'gap-auth-material-scope-analyzer'], note: 'Remaining UI/analyzer work is queued as concrete Product Build Next items.' }),
      'orange-baseline': decision('covered', { ownerIds: ['path'], note: 'Existing Orange-derived credential and authentication path items are retained and extended additively.' }),
    });
  }

  const REMINE_AUDIT_ROWS = freezeList(FINDINGS.map((finding) => freezeObject({
    noteId: finding.sourceRef,
    title: finding.sourceLabel,
    theme: 'credentials-auth',
    reviewWave: WAVE,
    sourceRoute: SOURCE_ROUTE,
    sourcePackets: SOURCE_PACKETS,
    originalSourceReread: true,
    decisions: commonCredentialDecisions(finding.productOwner),
  })));

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
    const outcomeCounts = allowedOutcomes.reduce((acc, id) => { acc[id] = 0; return acc; }, {});
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
    Object.keys(dimensionCounts).forEach((id) => { dimensionCounts[id] = freezeObject(dimensionCounts[id]); });
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
      reminedThemes: freezeList(unique(Array.from(current.reminedThemes || []).concat(auditRows.map((row) => row.theme)))),
      completedReminedThemes: freezeList(unique(Array.from(current.completedReminedThemes || []).concat(['credentials-auth']))),
      additiveOrangeBaseline: true,
      actualPathRequired: true,
      noNewWrappers: true,
      active: true,
      blockedFreshPacketsUntilComplete: true,
      latestWave: WAVE,
      latestOutputs: freezeList(FIELD_NOTES.map((note) => note.id)),
      queuedProductGaps: freezeList(unique(Array.from(current.queuedProductGaps || []).concat(QUEUED_PRODUCT_GAPS.map((item) => item.id)))),
      redFlags: freezeList(current.redFlags || []),
    });
  }

  function integrateNotes() {
    const notes = root.OBOL_NOTE_INTEGRATION;
    if (!notes || !notes.ledger || notes.__credentialsAuthReminingV958) return false;
    const noteIds = new Set(FIELD_NOTES.map((note) => note.id));
    const publicFieldNotes = freezeList(Array.from(notes.publicFieldNotes || []).filter((note) => !noteIds.has(note && note.id)).concat(Array.from(FIELD_NOTES)));
    const packetReviews = freezeObject({
      ...(notes.packetReviews || {}),
      'credentials-auth-remine': freezeObject({
        id: 'credentials-auth-remine',
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
          'gap-auth-validation-safety-slot': 'Future uncluttered validation warning/control placement',
          'gap-auth-material-scope-analyzer': 'Future conservative terminal-output analyzer for material class and proof state',
        }),
        discovery: freezeObject({
          selection: 'Previously reviewed credentials/auth notes were re-mined from private source packets for live path, tool, evidence, report, lesson, and product-gap outputs.',
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
        if (!publicFieldNotes.find((entry) => entry.id === note.id)) failures.push('missing live credentials/auth re-mined note ' + note.id);
      });
      return failures;
    };
    root.OBOL_NOTE_INTEGRATION = freezeObject({
      ...notes,
      schemaVersion: '1.11.0',
      publicFieldNotes,
      packetReviews,
      publicNotesForTool,
      publicNotesForPath,
      validate,
      __credentialsAuthReminingV958: true,
    });
    return true;
  }

  function upsertQueueItem(q, item) {
    if (!q || !Array.isArray(q.items)) return;
    const existing = q.items.find((entry) => entry && entry.id === item.id);
    if (existing) Object.assign(existing, item);
    else q.items.push({ ...item });
  }

  function integrateHardeningQueue() {
    const q = root.OBOL_PRODUCT_HARDENING;
    if (!q || !Array.isArray(q.items)) return false;
    const xss = q.items.find((entry) => entry && entry.id === 'notes-remine-xss-session');
    if (xss) xss.status = 'complete';
    const item = q.items.find((entry) => entry && entry.id === 'notes-remine-credentials-auth');
    if (item) {
      item.status = 'complete';
      item.detail = 'Reviewed credentials/auth source notes were re-mined into live path, tool, evidence, and report guidance for provenance, material class routing, protocol scope, challenge-response boundaries, validation scope, and protected-container lineage. Validation-safety UI and material-scope analyzer work are now queued as concrete follow-ups.';
    }
    QUEUED_PRODUCT_GAPS.forEach((gap) => upsertQueueItem(q, gap));
    return true;
  }

  function integrateProgress() {
    const progress = root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS;
    if (!progress) return false;
    root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = freezeObject({
      ...progress,
      schemaVersion: '1.9.0',
      remining: recomputeRemineProgress(progress),
    });
    return true;
  }

  const packet = freezeObject({
    wave: WAVE,
    sourceRoute: SOURCE_ROUTE,
    sourcePackets: SOURCE_PACKETS,
    sourceConfidence: SOURCE_CONFIDENCE,
    findings: FINDINGS,
    fieldNotes: FIELD_NOTES,
    remineAuditRows: REMINE_AUDIT_ROWS,
    queuedProductGaps: QUEUED_PRODUCT_GAPS,
    liveCards: freezeList(FIELD_NOTES.map((note) => note.id)),
    liveRoutes: freezeList(['#/path', '#/dashboard']),
    status: 'live-integrated',
    integrate: () => {
      const notesIntegrated = integrateNotes();
      const queueIntegrated = integrateHardeningQueue();
      const progressIntegrated = integrateProgress();
      return freezeObject({ packet, notesIntegrated, queueIntegrated, progressIntegrated });
    },
  });

  root.OBOL_CREDENTIALS_AUTH_REMINING_V958 = packet;
  packet.integrate();
  if (typeof window !== 'undefined') {
    let tries = 0;
    const retry = () => {
      const result = packet.integrate();
      tries += 1;
      if (!(result.notesIntegrated && result.queueIntegrated && result.progressIntegrated) && tries < 20) {
        window.setTimeout(retry, 25);
      }
    };
    window.setTimeout(retry, 0);
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = packet;
})(typeof window !== 'undefined' ? window : globalThis);
