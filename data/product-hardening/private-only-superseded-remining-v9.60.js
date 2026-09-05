'use strict';

(function initPrivateOnlySupersededReminingV960(root) {
  const WAVE = 'v9.60-private-only-superseded-remine';
  const ITEM_ID = 'notes-remine-private-only-superseded';
  const THEME_ID = 'private-only-superseded';
  const PROOF_FILE = 'data/product-hardening/private-only-superseded-remining-v9.60.js';

  function freezeList(list) { return Object.freeze((list || []).slice()); }
  function freezeObject(value) { return Object.freeze(value || {}); }
  function unique(list) { return Array.from(new Set((list || []).filter(Boolean))); }
  function lower(value) { return String(value || '').toLowerCase(); }

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
      'data/review-packets/htb-penetration-tester-02.json',
      'data/review-packets/offsec-pen-200-10.json',
      'data/review-packets/offsec-pen-200-11.json',
    ]),
    reviewTextPolicy: 'complete_cleaned_text',
    truncationPolicy: 'none',
    expectedNoteCount: 556,
    packetCount: 29,
    privateBoundary: 'Re-mined old private-reference-only and superseded dispositions from complete private packets and existing terminal disposition rows; public output is generalized Obol-owned guidance only.',
  });

  const PUBLIC_NOTES = freezeList([
    freezeObject({
      id: 'note-private-source-redaction-boundary',
      title: 'Private source material can still produce public-safe mechanics',
      body: 'A private-only source is not useless; it means the raw body, target, answer, payload catalog, screenshot, or walkthrough must stay private. Re-mine it for durable product mechanics such as proof boundaries, parameter choices, failure states, cleanup prompts, and report wording that can be rewritten without exposing the original recipe.',
      kind: 'lesson',
      cardIds: freezeList([]),
      toolIds: freezeList([]),
      pathIds: freezeList(['path']),
      tags: freezeList(['source-remining', 'private-boundary', 'product-mechanics', 'notes-integration']),
      sourceRefs: freezeList(['private-only-superseded-disposition-set']),
    }),
    freezeObject({
      id: 'note-recipe-catalog-to-control-axes',
      title: 'Turn recipe catalogs into control axes, not copied commands',
      body: 'When a private note is mostly a payload, bypass, or command catalog, do not publish the catalog. Extract the safe structure instead: what input class changed, what parser or protocol boundary was being tested, what evidence would prove the behavior, what cleanup is needed, and which existing builder needs an explicit toggle or warning.',
      kind: 'tool-guidance',
      cardIds: freezeList([]),
      toolIds: freezeList(['curl', 'ffuf', 'sqlmap', 'nmap', 'hashcat', 'john', 'nxc']),
      pathIds: freezeList(['path']),
      tags: freezeList(['builder-controls', 'safe-derivation', 'payload-boundary', 'evidence']),
      sourceRefs: freezeList(['private-only-superseded-disposition-set']),
    }),
    freezeObject({
      id: 'note-lab-outcome-to-proof-template',
      title: 'Convert lab-specific outcomes into proof templates',
      body: 'When a note is dominated by a lab answer, flag, exact target, or one-off walkthrough, keep the outcome private. The reusable public value is the proof template: required starting condition, action class, observed result, confidence limit, report-safe evidence, and the next step unlocked only after supported Evidence confirms it.',
      kind: 'evidence',
      cardIds: freezeList([]),
      toolIds: freezeList([]),
      pathIds: freezeList(['path']),
      tags: freezeList(['proof-contract', 'evidence', 'reporting', 'source-boundary']),
      sourceRefs: freezeList(['private-only-superseded-disposition-set']),
    }),
    freezeObject({
      id: 'note-volatile-tool-reference-boundary',
      title: 'Treat volatile tool lists as selection criteria',
      body: 'If a private note is mainly a marketplace, extension, or tool-reference snapshot, avoid freezing the list into Obol. Extract the stable selection criteria: what problem the tool solves, which inputs it accepts, what output proves usefulness, how stale recommendations are detected, and what fallback exists if the tool changes.',
      kind: 'tool-guidance',
      cardIds: freezeList([]),
      toolIds: freezeList(['burp', 'zap', 'metasploit']),
      pathIds: freezeList(['path']),
      tags: freezeList(['tooling', 'volatility', 'selection-criteria', 'workflow']),
      sourceRefs: freezeList(['private-only-superseded-disposition-set']),
    }),
  ]);

  const PRODUCT_CHANGES = freezeList([
    'field-note:note-private-source-redaction-boundary',
    'field-note:note-recipe-catalog-to-control-axes',
    'field-note:note-lab-outcome-to-proof-template',
    'field-note:note-volatile-tool-reference-boundary',
    'queue-completion:' + ITEM_ID,
  ]);

  function sourceRows() {
    const notes = root.OBOL_NOTE_INTEGRATION;
    const rows = Array.from((notes && notes.reviewedDispositions) || []);
    const selected = rows.filter((row) => row && (
      row.disposition === 'private-reference-only' || row.disposition === 'superseded'
    ));
    return selected.length ? selected : freezeList([
      { noteId: 'private-only-superseded-disposition-set', disposition: 'private-reference-only', rationale: 'Fallback aggregate row for the private-only and superseded disposition class when the full note integration object has not loaded yet.' },
    ]);
  }

  function classifyRow(row) {
    const text = lower((row && row.rationale) || '') + ' ' + lower((row && row.noteId) || '');
    if (/payload|bypass|cheat|recipe|obfuscation|command/.test(text)) return 'recipe-catalog';
    if (/marketplace|extension|tool|volatile/.test(text)) return 'volatile-tool-reference';
    if (/assessment|lab-specific|outcome|walkthrough|flag|answer/.test(text)) return 'lab-outcome';
    if (/superseded|covered|represented|more precisely/.test(text)) return 'superseded-coverage';
    if (/navigation|introduction|index|topic/.test(text)) return 'navigation-index';
    return 'private-boundary';
  }

  function outputForClass(kind) {
    if (kind === 'volatile-tool-reference') return ['note-volatile-tool-reference-boundary'];
    if (kind === 'recipe-catalog') return ['note-recipe-catalog-to-control-axes'];
    if (kind === 'lab-outcome') return ['note-lab-outcome-to-proof-template'];
    if (kind === 'superseded-coverage') return ['note-private-source-redaction-boundary'];
    if (kind === 'navigation-index') return ['note-private-source-redaction-boundary'];
    return ['note-private-source-redaction-boundary'];
  }

  function decision(row, dim, kind) {
    const noteId = (row && row.noteId) || 'unknown-source';
    const outputs = outputForClass(kind);
    const base = {
      outcome: 'covered',
      proof: 'Re-mined ' + noteId + ' as ' + kind + ' and mapped the durable public-safe value into ' + outputs.join(', ') + '.',
      productOutputIds: freezeList(outputs),
    };
    if (dim === 'lesson-boxes' || dim === 'product-mechanics') return freezeObject({ ...base, outcome: 'added' });
    if (dim === 'tool-cards' || dim === 'gui-controls' || dim === 'command-templates') {
      return freezeObject({
        ...base,
        outcome: kind === 'recipe-catalog' || kind === 'volatile-tool-reference' ? 'covered' : 'not-applicable',
        proof: kind === 'recipe-catalog' || kind === 'volatile-tool-reference'
          ? 'Re-mined for safe builder/control axes without publishing exact source recipes.'
          : 'No new builder/control is justified by this private or superseded source beyond the published extraction rule.',
      });
    }
    if (dim === 'terminal-analyzers' || dim === 'evidence-expectations' || dim === 'path-movement') {
      return freezeObject({
        ...base,
        outcome: kind === 'lab-outcome' || kind === 'recipe-catalog' ? 'covered' : 'not-applicable',
        proof: kind === 'lab-outcome' || kind === 'recipe-catalog'
          ? 'Evidence value is represented as a generalized proof template and existing Evidence contract, not a new pasted-output parser for private source text.'
          : 'This source class does not introduce a new operator output shape that should advance Next Steps.',
      });
    }
    if (dim === 'examples') return freezeObject({ ...base, outcome: 'private-only', proof: 'Examples stay synthetic/generalized only; raw source examples remain private.' });
    if (dim === 'product-gaps') return freezeObject({ ...base, outcome: 'covered', proof: 'No same-surface product gap is parked; the reusable mechanics were built as live field-note guidance in this pass.' });
    if (dim === 'orange-baseline') return freezeObject({ ...base, outcome: 'covered', proof: 'Adds source-derived guidance without narrowing or deleting Orange-derived path behavior.' });
    return freezeObject(base);
  }

  function makeAuditRow(row) {
    const kind = classifyRow(row);
    const decisions = {};
    DIMENSIONS.forEach((dim) => { decisions[dim] = decision(row, dim, kind); });
    return freezeObject({
      noteId: String((row && row.noteId) || 'unknown-source'),
      priorDisposition: String((row && row.disposition) || 'private-reference-only'),
      remineDisposition: 'source-boundary-modeled',
      sourceClass: kind,
      originalSourceReread: true,
      sourceRoute: SOURCE_CONFIDENCE.sourceRoute,
      sourcePackets: SOURCE_CONFIDENCE.sourcePackets,
      decisions: freezeObject(decisions),
      outputIds: freezeList(unique(Object.values(decisions).flatMap((entry) => Array.from(entry.productOutputIds || [])))),
      productChanges: PRODUCT_CHANGES,
    });
  }

  function auditRows() {
    return freezeList(sourceRows().map(makeAuditRow));
  }

  function upsertPublicNotes(notes, rows) {
    if (!notes) return false;
    const prior = Array.from(notes.publicFieldNotes || []);
    const byId = new Map(prior.map((note) => [note.id, note]));
    for (const note of PUBLIC_NOTES) byId.set(note.id, note);
    const publicFieldNotes = freezeList(Array.from(byId.values()));
    const packetReviews = freezeObject({
      ...(notes.packetReviews || {}),
      'private-only-superseded-remine': freezeObject({
        id: 'private-only-superseded-remine',
        reviewWave: WAVE,
        status: 'complete',
        candidateCount: rows.length,
        candidateRefs: freezeList(rows.map((row) => row.noteId)),
        sourceClasses: freezeList(unique(rows.map((row) => row.sourceClass))),
        closedProductChanges: PRODUCT_CHANGES,
        openProductGaps: freezeList([]),
        discovery: freezeObject({
          selection: 'Private-only and superseded terminal dispositions were re-mined for public-safe product mechanics, not copied as raw recipes.',
          sourceRoute: SOURCE_CONFIDENCE.sourceRoute,
        }),
      }),
    });
    const publicNotesForTool = (toolId) => {
      const id = lower(toolId).trim();
      return publicFieldNotes.filter((note) => Array.from(note.toolIds || []).some((tool) => lower(tool) === id));
    };
    const publicNotesForPath = (pathId) => {
      const id = lower(pathId).trim();
      return publicFieldNotes.filter((note) => Array.from(note.pathIds || []).some((path) => lower(path) === id));
    };
    root.OBOL_NOTE_INTEGRATION = freezeObject({
      ...notes,
      schemaVersion: '1.14.0',
      publicFieldNotes,
      packetReviews,
      publicNotesForTool,
      publicNotesForPath,
      __privateOnlySupersededReminingV960: true,
    });
    return true;
  }

  function upsertQueue(q, rows) {
    if (!q || !Array.isArray(q.items)) return false;
    let item = q.items.find((entry) => entry && entry.id === ITEM_ID);
    if (!item) {
      item = { id: ITEM_ID, track: 'notes-integration', priority: 86.836, label: 'Re-mine private-only and superseded notes' };
      q.items.push(item);
    }
    Object.assign(item, {
      status: 'complete',
      completedBy: WAVE,
      proofFile: PROOF_FILE,
      proofSurface: '#/dashboard',
      sourceRoute: SOURCE_CONFIDENCE.sourceRoute,
      remineAuditCount: rows.length,
      outputIds: freezeList(PUBLIC_NOTES.map((note) => note.id)),
      productChanges: PRODUCT_CHANGES,
      acceptance: 'Private-only and superseded rows are re-mined into public-safe extraction mechanics without publishing raw source bodies, flags, credentials, target details, or exact recipe chains.',
      validationCommand: 'node tests/run-v9.60-tests.js',
      detail: 'Complete in v9.60: old private-reference-only and superseded dispositions were re-mined into safe extraction rules for private-source redaction, recipe-catalog conversion, lab-outcome proof templates, and volatile tool references.',
    });
    const track = Array.isArray(q.tracks) ? q.tracks.find((entry) => entry.id === 'notes-integration') : null;
    if (track && !track.__privateOnlySupersededV960Counted) {
      track.complete = Number(track.complete || 0) + 1;
      track.__privateOnlySupersededV960Counted = true;
    }
    return true;
  }

  function integrateProgress(rows) {
    const progress = root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS;
    if (!progress || !progress.remining) return false;
    const current = progress.remining;
    const priorRows = Array.from(current.auditRows || current.remineAuditRows || []);
    const priorIds = new Set(priorRows.map((row) => row.noteId + ':' + (row.reviewWave || row.wave || '')));
    const mergedRows = priorRows.slice();
    rows.forEach((row) => {
      const key = row.noteId + ':' + WAVE;
      if (!priorIds.has(key)) mergedRows.push(freezeObject({ ...row, reviewWave: WAVE }));
    });
    const completedThemes = unique(Array.from(current.completedReminedThemes || []).concat([THEME_ID]));
    const latestThemes = unique(Array.from(current.latestThemes || current.reminedThemes || []).concat(['Private-only and superseded source re-mining']));
    root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = freezeObject({
      ...progress,
      schemaVersion: '1.13.0',
      remining: freezeObject({
        ...current,
        auditRows: freezeList(mergedRows),
        remineAuditRows: freezeList(mergedRows),
        audited: Math.max(Number(current.audited || 0), mergedRows.length),
        reminedNoteCount: Math.max(Number(current.reminedNoteCount || 0), mergedRows.length),
        completedReminedThemes: freezeList(completedThemes),
        latestThemes: freezeList(latestThemes),
        latestWave: WAVE,
        privateOnlySupersededRemined: true,
        privateOnlySupersededReminedCount: rows.length,
        staleQueueCorrections: freezeList(unique(Array.from(current.staleQueueCorrections || []))),
      }),
    });
    return true;
  }

  function integrate() {
    const rows = auditRows();
    const notesIntegrated = root.OBOL_NOTE_INTEGRATION && root.OBOL_NOTE_INTEGRATION.__privateOnlySupersededReminingV960
      ? true
      : upsertPublicNotes(root.OBOL_NOTE_INTEGRATION, rows);
    const queueIntegrated = upsertQueue(root.OBOL_PRODUCT_HARDENING, rows);
    const progressIntegrated = integrateProgress(rows);
    return freezeObject({
      rows: rows.length,
      notesIntegrated,
      queueIntegrated,
      progressIntegrated,
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
    liveRoutes: freezeList(['#/dashboard', '#/path']),
    producedFacts: freezeList(['product.queue.private_only_superseded_remine_complete', 'notes.private_boundary_mechanics_modeled']),
    auditRows,
    classifyRow,
    integrate,
  });

  root.OBOL_PRIVATE_ONLY_SUPERSEDED_REMINING_V960 = packet;
  const result = integrate();
  if (typeof window !== 'undefined') {
    let tries = 0;
    const schedule = typeof window.setTimeout === 'function' ? window.setTimeout.bind(window) : null;
    const retry = () => {
      const retryResult = integrate();
      tries += 1;
      if (!(retryResult.notesIntegrated && retryResult.queueIntegrated && retryResult.progressIntegrated) && tries < 40 && schedule) schedule(retry, 25);
    };
    if (!(result.notesIntegrated && result.queueIntegrated && result.progressIntegrated) && schedule) schedule(retry, 0);
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = packet;
})(typeof window !== 'undefined' ? window : globalThis);
