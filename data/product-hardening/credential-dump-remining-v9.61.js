'use strict';

(function initCredentialDumpReminingV961(root) {
  const WAVE = 'v9.61-credential-dump-remine';
  const ITEM_ID = 'notes-mechanic-backfill';
  const THEME_ID = 'credential-dump-artifacts';
  const PROOF_FILE = 'data/product-hardening/credential-dump-remining-v9.61.js';

  function freezeList(list) { return Object.freeze((list || []).slice()); }
  function freezeObject(value) { return Object.freeze(value || {}); }
  function unique(list) { return Array.from(new Set((list || []).filter(Boolean))); }
  function norm(value) { return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function has(text, pattern) { return pattern.test(String(text || '')); }
  function redact(value) {
    return String(value || '')
      .replace(/\b[A-Fa-f0-9]{32}:\S+/g, '[ntlm-hash]:[redacted-secret]')
      .replace(/\b[A-Fa-f0-9]{32,128}\b/g, '[secret-material]')
      .replace(/(password|passwd|pwd|token|secret|api[_-]?key)\s*[:=]\s*([^\s;&|]+)/gi, '$1=[redacted]')
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
    selectedNoteIds: freezeList(['htb-penetration-tester-bfe04186f42f682f']),
    selectorBatch: 'notes-batch-old-rubric-reviewed-remine-001',
    privateBoundary: 'The LSASS/offline credential-extraction note was re-read from the complete packet route. Public output keeps only generalized proof-chain, analyzer, cleanup, and reporting logic.',
  });

  const PUBLIC_NOTES = freezeList([
    freezeObject({
      id: 'note-lsass-dump-artifact-proof-chain',
      title: 'Treat LSASS dumping as an artifact proof chain',
      body: 'A Windows memory dump is not credential access by itself. Keep the chain explicit: starting privilege and session context, dump artifact created, transfer or local parse path, offline parser result, material class extracted, cracking or reuse step, and separate service validation. Each stage can be useful, failed, blocked, or inconclusive without proving the next stage.',
      kind: 'path-guidance',
      cardIds: freezeList(['credentials', 'credential-dump-proof-chain', 'windows-local-password-attacks']),
      toolIds: freezeList(['pypykatz', 'mimikatz', 'hashcat', 'smbserver.py']),
      pathIds: freezeList(['path']),
      tags: freezeList(['credential', 'lsass', 'windows', 'proof-boundary', 'artifact-lineage']),
      sourceRefs: freezeList(['htb-penetration-tester-bfe04186f42f682f']),
      reviewWave: WAVE,
    }),
    freezeObject({
      id: 'note-offline-parser-output-needs-material-classification',
      title: 'Classify offline parser output before routing it',
      body: 'Offline credential parsers can surface usernames, domains, NT material, ticket-related material, DPAPI-related material, or empty/disabled credential fields. Route only the material class that actually appears. A parser banner or logon-session block is evidence of parsing, not proof that a password, reusable hash, ticket, or downstream account access exists.',
      kind: 'evidence',
      cardIds: freezeList(['credentials', 'credential-dump-proof-chain']),
      toolIds: freezeList(['pypykatz', 'mimikatz']),
      pathIds: freezeList(['path']),
      tags: freezeList(['credential', 'parser-output', 'material-class', 'evidence']),
      sourceRefs: freezeList(['htb-penetration-tester-bfe04186f42f682f']),
      reviewWave: WAVE,
    }),
    freezeObject({
      id: 'note-hash-crack-does-not-prove-service-access',
      title: 'A cracked hash still needs scoped validation',
      body: 'Cracking an NT hash can produce a candidate plaintext, but it still does not prove useful access. Record the hash type, cracked state, apparent identity, validation target, and lockout/rate-safety context separately. Only a scoped authentication response proves that the recovered material works for a specific service and identity.',
      kind: 'evidence',
      cardIds: freezeList(['credentials', 'credential-dump-proof-chain']),
      toolIds: freezeList(['hashcat', 'john', 'nxc', 'evil-winrm', 'ssh']),
      pathIds: freezeList(['path']),
      tags: freezeList(['credential', 'hash-cracking', 'validation', 'proof-boundary']),
      sourceRefs: freezeList(['htb-penetration-tester-bfe04186f42f682f']),
      reviewWave: WAVE,
    }),
  ]);

  const PRODUCT_CHANGES = freezeList([
    'field-note:note-lsass-dump-artifact-proof-chain',
    'field-note:note-offline-parser-output-needs-material-classification',
    'field-note:note-hash-crack-does-not-prove-service-access',
    'evidence-parser-change:credential-dump-output-analyzer',
    'path-guidance:credential-dump-proof-chain',
  ]);

  function decision(outcome, fields) { return freezeObject({ outcome, ...(fields || {}) }); }
  const REMINE_AUDIT_ROWS = freezeList([
    freezeObject({
      noteId: 'htb-penetration-tester-bfe04186f42f682f',
      title: 'Credential dump artifact proof chain',
      theme: THEME_ID,
      reviewWave: WAVE,
      originalSourceReread: true,
      sourceRoute: SOURCE_CONFIDENCE.sourceRoute,
      sourcePackets: SOURCE_CONFIDENCE.sourcePackets,
      pathNodesConsidered: freezeList(['path', 'credentials', 'windows-local-password-attacks']),
      outputIds: freezeList(PUBLIC_NOTES.map((note) => note.id)),
      productChanges: PRODUCT_CHANGES,
      decisions: freezeObject({
        'path-bindings': decision('added', { proofRefs: freezeList(['note-lsass-dump-artifact-proof-chain']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Bound the dump artifact chain to the credential path context so the operator sees it during credential review.' }),
        'tool-cards': decision('added', { proofRefs: freezeList(['note-offline-parser-output-needs-material-classification']), changedOwners: freezeList([PROOF_FILE]), toolIds: freezeList(['pypykatz', 'mimikatz', 'hashcat']), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Parser and cracking tools now receive public-safe proof-boundary guidance without copying the source commands.' }),
        'gui-controls': decision('covered', { ownerIds: freezeList(['credential-validation-safety-slot', 'auth-material-scope-analyzer-current']), note: 'Validation-safety and material-scope controls already own the UI concepts; this note strengthens their evidence interpretation rather than adding another control.' }),
        'scripts-one-liners': decision('private-only', { reason: 'The raw command sequence contains lab-specific paths, transfer details, and credential-like output; reusable value is represented as generalized tool guidance and analyzer behavior.' }),
        'command-templates': decision('covered', { ownerIds: freezeList(['note-lsass-dump-artifact-proof-chain']), note: 'The public product records the command class and proof stages instead of freezing a private exact dump or transfer recipe.' }),
        'terminal-analyzers': decision('added', { proofRefs: freezeList(['credential-dump-output-analyzer']), changedOwners: freezeList([PROOF_FILE]), analyzerIds: freezeList(['credential-dump-output-analyzer']), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Added a conservative analyzer for pasted LSASS dump, pypykatz/mimikatz, NT-material, and cracking output.' }),
        'evidence-expectations': decision('added', { proofRefs: freezeList(['note-lsass-dump-artifact-proof-chain', 'credential-dump-output-analyzer']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Dump creation, offline parsing, material extraction, cracking, and scoped authentication remain separate Evidence states.' }),
        'path-movement': decision('added', { proofRefs: freezeList(['credential-dump-output-analyzer']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Pasted output can now create credential-dump proof-chain activities without promoting them directly to access.' }),
        'lesson-boxes': decision('added', { proofRefs: freezeList(PUBLIC_NOTES.map((note) => note.id)), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Added collapsible field-note style lessons for dump artifacts, parser output, and hash-crack validation.' }),
        'examples': decision('private-only', { reason: 'The source examples include private lab values, accounts, and credential-like output. Public Obol uses synthetic analyzer tests only.' }),
        'troubleshooting': decision('added', { proofRefs: freezeList(['note-lsass-dump-artifact-proof-chain']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Operator guidance now calls out blocked dump attempts, parser-only output, empty credential fields, and incomplete downstream validation.' }),
        'cleanup': decision('added', { proofRefs: freezeList(['note-lsass-dump-artifact-proof-chain']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Temporary dump artifacts and transfer locations are tracked as cleanup/reporting concerns rather than hidden inside a recipe.' }),
        'report-guidance': decision('added', { proofRefs: freezeList(['note-hash-crack-does-not-prove-service-access']), changedOwners: freezeList([PROOF_FILE]), reportIds: freezeList(['credential-dump-proof-chain-reporting']), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Reports should state the artifact, material class, and validation scope without exposing raw secrets.' }),
        'product-mechanics': decision('added', { proofRefs: freezeList(['credential-dump-output-analyzer']), changedOwners: freezeList([PROOF_FILE]), analyzerIds: freezeList(['credential-dump-output-analyzer']), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'This pass adds a real terminal-output analyzer and field-note integration, not only a prose summary.' }),
        'product-gaps': decision('covered', { ownerIds: freezeList(['credential-dump-output-analyzer', 'auth-material-scope-analyzer-current']), note: 'The same-surface analyzer gap exposed by this note is built in this pass; deeper GUI refinements remain covered by existing credential-validation controls.' }),
        'orange-baseline': decision('covered', { ownerIds: freezeList(['path']), note: 'The Orange-derived path remains intact; the new guidance is additive to existing credential and Windows-local-password attack flow.' }),
      }),
    }),
  ]);

  function analyzeCredentialDumpOutput(text) {
    const raw = String(text || '');
    const lower = norm(raw);
    const matches = [];
    if (/lsass\.(dmp|dump)|comsvcs\.dll|minidump|task manager.*dump|dump.*lsass/.test(lower)) matches.push('lsass-dump-artifact');
    if (/pypykatz|mimikatz|logonsession|==\s*msv\s*==|wdigest|dpapi|kerberos/.test(lower)) matches.push('offline-parser-output');
    if (/\bnt\s*:\s*[a-f0-9]{32}\b|\bnthash\b|\bntlm\b/.test(lower)) matches.push('nt-hash-material');
    if (/hash\.mode.*1000|status\.*:\s*cracked|recovered\.*:\s*\d+\/\d+|\b[a-f0-9]{32}:\S+/.test(lower)) matches.push('hash-crack-result');
    if (/authentication succeeded|login succeeded|valid credentials|accepted publickey|pwned|evil-winrm|nxc.*pwned/.test(lower)) matches.push('scoped-auth-success');
    const uniqueMatches = unique(matches);
    const facts = [];
    if (uniqueMatches.includes('lsass-dump-artifact')) facts.push('credential.lsass_dump_artifact_observed');
    if (uniqueMatches.includes('offline-parser-output')) facts.push('credential.offline_dump_parser_output_observed');
    if (uniqueMatches.includes('nt-hash-material')) facts.push('credential.nt_hash_material_observed');
    if (uniqueMatches.includes('hash-crack-result')) facts.push('credential.hash_crack_plaintext_candidate_observed');
    if (uniqueMatches.includes('scoped-auth-success')) facts.push('credential.validation_success_scoped');
    const warnings = [];
    if (uniqueMatches.includes('offline-parser-output') && !uniqueMatches.includes('nt-hash-material') && !uniqueMatches.includes('hash-crack-result')) warnings.push('Parser output is not credential material until a concrete password, hash, ticket, key, or token class is identified.');
    if ((uniqueMatches.includes('nt-hash-material') || uniqueMatches.includes('hash-crack-result')) && !uniqueMatches.includes('scoped-auth-success')) warnings.push('Extracted or cracked material still needs scoped authentication proof before it becomes access.');
    if (uniqueMatches.includes('lsass-dump-artifact')) warnings.push('Memory dumps and transfer locations are sensitive artifacts; record cleanup and keep raw secrets out of reports.');
    return freezeObject({
      analyzerId: 'credential-dump-output-analyzer',
      matchCount: uniqueMatches.length,
      matches: freezeList(uniqueMatches),
      outcomeFacts: freezeList(facts),
      warnings: freezeList(warnings),
      redactedSnippet: redact(raw),
      recommendedNextState: facts.includes('credential.validation_success_scoped')
        ? 'record-scoped-access-proof'
        : facts.includes('credential.hash_crack_plaintext_candidate_observed') || facts.includes('credential.nt_hash_material_observed')
          ? 'validate-material-against-scoped-service'
          : facts.includes('credential.offline_dump_parser_output_observed')
            ? 'classify-parser-material'
            : facts.includes('credential.lsass_dump_artifact_observed')
              ? 'parse-or-transfer-dump-artifact'
              : 'no-credential-dump-signal',
    });
  }

  function activity(text, analysis) {
    const result = analysis.matchCount ? 'success' : 'tried';
    const body = {
      cardId: 'credential-dump-proof-chain',
      result,
      assessment: result === 'success' ? 'supported' : 'attempted',
      confidence: analysis.matchCount >= 2 ? 'high' : 'medium',
      reviewWave: WAVE,
      command: 'evidence:credential-dump-proof-chain',
      source: 'Evidence paste',
      evidence: analysis.redactedSnippet,
      outputSnippet: analysis.redactedSnippet,
      reason: 'Evidence paste was reviewed for LSASS dump artifact, offline parser, material extraction, cracking, and scoped validation states without promoting any stage directly to access.',
      outcomeFacts: analysis.outcomeFacts,
      credentialDumpMatches: analysis.matches,
      warnings: analysis.warnings,
      recommendedNextState: analysis.recommendedNextState,
    };
    body.fingerprint = 'terminal:' + hash(body.cardId + '|' + norm(body.outputSnippet).slice(0, 500));
    return freezeObject(body);
  }

  function analyzeEvidenceText(text) {
    const analysis = analyzeCredentialDumpOutput(text);
    const activities = analysis.matchCount ? [activity(text, analysis)] : [];
    return freezeObject({
      wave: WAVE,
      analyzerId: 'credential-dump-output-analyzer',
      activityCount: activities.length,
      activities: freezeList(activities),
      outcomeFacts: analysis.outcomeFacts,
      advancedCards: activities.length ? freezeList(['credential-dump-proof-chain']) : freezeList([]),
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
    out.credentialDumpEvidence61 = analysis;
    out.credentialDumpEvidenceCards61 = analysis.advancedCards;
    return out;
  }

  function installEvidenceIngestion() {
    const T = root.OBOL_INTAKE_V21;
    if (!T || typeof T.analyzeTerminal !== 'function') return false;
    if (T.analyzeTerminal.__credentialDumpReminingV961) return true;
    const oldAnalyze = T.analyzeTerminal;
    T.analyzeTerminal = function credentialDumpAnalyzeTerminal(text, lanes, state, ctx) {
      const result = oldAnalyze.call(T, text, lanes, state, ctx);
      return mergeEvidenceAnalysis(result, analyzeEvidenceText(text));
    };
    T.analyzeTerminal.__credentialDumpReminingV961 = true;
    root.__OBOL_CREDENTIAL_DUMP_EVIDENCE_INGESTION_INSTALLED__ = true;
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
      'credential-dump-artifact-remine': freezeObject({
        id: 'credential-dump-artifact-remine',
        reviewWave: WAVE,
        status: 'partial-batch-progress',
        candidateCount: REMINE_AUDIT_ROWS.length,
        candidateRefs: freezeList(REMINE_AUDIT_ROWS.map((row) => row.noteId)),
        selectorBatch: SOURCE_CONFIDENCE.selectorBatch,
        closedProductChanges: PRODUCT_CHANGES,
        openProductGaps: freezeList([]),
        discovery: freezeObject({
          selection: 'First old-rubric reviewed note from the selector batch was re-mined for credential-dump proof-chain mechanics.',
          sourceRoute: SOURCE_CONFIDENCE.sourceRoute,
          sourcePackets: SOURCE_CONFIDENCE.sourcePackets,
        }),
      }),
    });
    root.OBOL_NOTE_INTEGRATION = freezeObject({
      ...notes,
      schemaVersion: '1.15.0',
      publicFieldNotes,
      packetReviews,
      publicNotesForTool,
      publicNotesForPath,
      __credentialDumpReminingV961: true,
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
      schemaVersion: '1.14.0',
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
        latestThemes: freezeList(unique(Array.from(current.latestThemes || current.reminedThemes || []).concat(['Credential dump artifact proof chains']))),
        partialReminedThemes: freezeList(unique(Array.from(current.partialReminedThemes || []).concat([THEME_ID]))),
        latestSelectorBatch: SOURCE_CONFIDENCE.selectorBatch,
        latestSelectorBatchProgress: freezeObject({ selected: 1, target: 20, remainingInBatch: 19 }),
        evidenceIngestionBuilt: freezeList(unique(Array.from(current.evidenceIngestionBuilt || []).concat(['credential-dump-proof-chain']))),
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
      item.latestPartialRemineDetail = 'v9.61 re-mined the first selected old-rubric credential-dump note into path guidance, field notes, and a conservative pasted-output analyzer. The batch and gate remain open.';
    }
    return true;
  }

  function integrate() {
    const notesIntegrated = root.OBOL_NOTE_INTEGRATION && root.OBOL_NOTE_INTEGRATION.__credentialDumpReminingV961
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
    liveRoutes: freezeList(['#/path', '#/evidence', '#/card/credential-dump-proof-chain']),
    producedFacts: freezeList([
      'credential.lsass_dump_artifact_observed',
      'credential.offline_dump_parser_output_observed',
      'credential.nt_hash_material_observed',
      'credential.hash_crack_plaintext_candidate_observed',
      'credential.validation_success_scoped',
    ]),
    analyzeCredentialDumpOutput,
    analyzeEvidenceText,
    installEvidenceIngestion,
    integrate,
  });

  root.OBOL_CREDENTIAL_DUMP_REMINING_V961 = packet;
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
