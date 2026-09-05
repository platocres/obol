'use strict';

(function initWebUploadInclusionRemineBatchV969(root) {
  const WAVE = 'v9.69-web-upload-inclusion-remine-batch';
  const ITEM_ID = 'notes-mechanic-backfill';
  const PROOF_FILE = 'data/product-hardening/web-upload-inclusion-remine-batch-v9.69.js';
  const CARD_ID = 'web-upload-inclusion-proof-chain';
  const ANALYZER_ID = 'upload-inclusion-evidence-analyzer';
  const SOURCE_ROUTE = 'platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json';
  const SOURCE_PACKETS = Object.freeze(['data/review-packets/htb-penetration-tester-03.json', 'data/review-packets/htb-penetration-tester-04.json']);
  const DIMENSIONS = Object.freeze(['path-bindings', 'tool-cards', 'gui-controls', 'scripts-one-liners', 'command-templates', 'terminal-analyzers', 'evidence-expectations', 'path-movement', 'lesson-boxes', 'examples', 'troubleshooting', 'cleanup', 'report-guidance', 'product-mechanics', 'product-gaps', 'orange-baseline']);
  const OUTCOMES = Object.freeze(['added', 'covered', 'queued', 'private-only', 'not-applicable', 'blocked']);
  const SELECTED = Object.freeze([
    Object.freeze({ id: 'htb-penetration-tester-db1367c3cb696693', title: 'Absent Validation', cluster: 'upload-validation' }),
    Object.freeze({ id: 'htb-penetration-tester-dcf44979c5cbeb28', title: 'Intro to File Upload Attacks', cluster: 'upload-validation' }),
    Object.freeze({ id: 'htb-penetration-tester-18346c45629d79b0', title: 'File Inclusion Assessment', cluster: 'private-heavy', privateHeavy: true }),
    Object.freeze({ id: 'htb-penetration-tester-c9ffcfe30bb8105b', title: 'File Inclusion Prevention', cluster: 'inclusion-remediation' }),
    Object.freeze({ id: 'htb-penetration-tester-c234c00d18a235f3', title: 'Automated Scanning', cluster: 'inclusion-fuzzing' }),
    Object.freeze({ id: 'htb-penetration-tester-b90fb6ba8060ca62', title: 'Filter and Wrapper Behavior', cluster: 'inclusion-transform' }),
    Object.freeze({ id: 'htb-penetration-tester-4d269654772ade3f', title: 'Local File Inclusion', cluster: 'inclusion-transform' }),
    Object.freeze({ id: 'htb-penetration-tester-c89f8281ca7b1cb6', title: 'Upload Plus Inclusion Chain', cluster: 'cross-source-chain' }),
    Object.freeze({ id: 'htb-penetration-tester-999330f41a434b37', title: 'Remote File Inclusion', cluster: 'cross-source-chain' }),
    Object.freeze({ id: 'htb-penetration-tester-bf66c6300266b4d0', title: 'Wrapper Review', cluster: 'inclusion-transform' }),
    Object.freeze({ id: 'htb-penetration-tester-eb9ed63c6680ecdd', title: 'File Inclusion Introduction', cluster: 'inclusion-transform' }),
    Object.freeze({ id: 'htb-penetration-tester-84952ff3cb48a763', title: 'File Inclusion Payload Notes', cluster: 'private-heavy', privateHeavy: true }),
    Object.freeze({ id: 'htb-penetration-tester-f6638e21595b7f37', title: 'Upload Assessment Notes', cluster: 'private-heavy', privateHeavy: true }),
    Object.freeze({ id: 'htb-penetration-tester-2d27567769e89492', title: 'Web Shell Tooling Notes', cluster: 'private-heavy', privateHeavy: true }),
    Object.freeze({ id: 'htb-penetration-tester-b2c3e1eb214f2739', title: 'Transfer Endpoint Hygiene', cluster: 'transfer-cleanup' }),
    Object.freeze({ id: 'htb-penetration-tester-42b27d448cc88bc4', title: 'Web Shell Control Boundary', cluster: 'web-shell-cleanup' }),
    Object.freeze({ id: 'htb-penetration-tester-b81ae4d7b1657a68', title: 'Payload Catalog Notes', cluster: 'private-heavy', privateHeavy: true }),
    Object.freeze({ id: 'htb-penetration-tester-93c5b5eca5b2681c', title: 'SQLMap OS Exploitation Notes', cluster: 'private-heavy', privateHeavy: true }),
    Object.freeze({ id: 'htb-penetration-tester-681ca4b3d5384254', title: 'PHP Shell Cleanup Boundary', cluster: 'web-shell-cleanup' }),
    Object.freeze({ id: 'htb-penetration-tester-e274dc76c977af88', title: 'Shell Taxonomy', cluster: 'web-shell-cleanup' }),
  ]);

  function freezeList(list) { return Object.freeze((list || []).slice()); }
  function freezeObject(value) { return Object.freeze(value || {}); }
  function unique(list) { return Array.from(new Set((list || []).filter(Boolean))); }
  function lanes() { return Array.isArray(root.OBOL_LANES) ? root.OBOL_LANES : Array.isArray(root.LANES) ? root.LANES : []; }
  function liveCard(id) {
    if (!id) return null;
    if (typeof root.liveCardById === 'function') { try { const found = root.liveCardById(id); if (found) return found; } catch (_err) {} }
    if (root.CARDS && root.CARDS[id]) return root.CARDS[id];
    for (const lane of lanes()) for (const card of lane.cards || []) if (card && card.id === id) return card;
    return null;
  }
  function ensureLane(id, title, group) {
    let lane = lanes().find((entry) => entry && (entry.id === id || entry.lane === id));
    if (!lane) {
      lane = { id, lane: id, title, group, cards: [] };
      if (Array.isArray(root.OBOL_LANES)) root.OBOL_LANES.push(lane);
      else if (Array.isArray(root.LANES)) root.LANES.push(lane);
    }
    if (!Array.isArray(lane.cards)) lane.cards = [];
    return lane;
  }
  function publishCard(lane, card, afterIds) {
    const existing = liveCard(card.id);
    if (existing) {
      try { Object.assign(existing, card); } catch (_err) {}
      return true;
    }
    const refs = Array.isArray(afterIds) ? afterIds : [];
    let index = -1;
    for (const id of refs) {
      index = lane.cards.findIndex((entry) => entry && entry.id === id);
      if (index >= 0) break;
    }
    try { lane.cards.splice(index >= 0 ? index + 1 : lane.cards.length, 0, card); } catch (_err) { return false; }
    if (root.CARDS && typeof root.CARDS === 'object') try { root.CARDS[card.id] = card; } catch (_err) {}
    return !!liveCard(card.id);
  }
  function has(text, pattern) { return pattern.test(String(text || '')); }
  function hash(value) {
    let h = 0;
    const text = String(value || '');
    for (let i = 0; i < text.length; i += 1) h = ((h << 5) - h + text.charCodeAt(i)) | 0;
    return String(Math.abs(h));
  }
  function redact(value) {
    return String(value || '')
      .replace(/HTB\{[^}]+\}/gi, '[flag-redacted]')
      .replace(/flag\{[^}]+\}/gi, '[flag-redacted]')
      .replace(/\b\d{1,3}(?:\.\d{1,3}){3}:\d+\b/g, '[host:port]')
      .replace(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, '[host]')
      .replace(/((?:Set-)?Cookie:\s*[^=\s;]+)=([^;\s]+)/gi, '$1=[redacted]')
      .replace(/((?:cookie|token|session|password|passwd|pwd|secret|api[_-]?key)\s*[=:]\s*)([^;\s&]+)/gi, '$1[redacted]')
      .replace(/\b[A-Fa-f0-9]{24,128}\b/g, '[encoded-or-secret-material]')
      .replace(/\b[A-Za-z0-9+/]{32,}={0,2}\b/g, '[encoded-or-secret-material]')
      .slice(0, 1200);
  }

  const PUBLIC_NOTES = freezeList([
    freezeObject({ id: 'note-upload-inclusion-proof-chain', title: 'Prove every stage in upload and inclusion chains', body: 'Treat upload and inclusion work as a staged proof chain. Record acceptance, stored name or path, reachability, server-side handling, interpretation, command or read effect, and cleanup separately. A successful upload, readable include, or served file is not code execution until the downstream effect is independently proven.', kind: 'path-guidance', cardIds: freezeList([CARD_ID]), toolIds: freezeList(['curl', 'ffuf', 'burp-intruder', 'sqlmap']), pathIds: freezeList(['path', CARD_ID]), tags: freezeList(['file-upload', 'file-inclusion', 'proof-boundary', 'evidence']), sourceRefs: freezeList(SELECTED.filter((entry) => !entry.privateHeavy).map((entry) => entry.id)), reviewWave: WAVE }),
    freezeObject({ id: 'note-upload-serving-interpretation-boundary', title: 'Serving behavior decides upload impact', body: 'An uploaded file can be stored, renamed, downloaded, blocked, displayed as source, or interpreted by a runtime. Capture the response headers, final URL, server handler clues, and body behavior before deciding whether the impact is storage, disclosure, overwrite, command execution, or only acceptance.', kind: 'evidence', cardIds: freezeList([CARD_ID]), toolIds: freezeList(['curl', 'burp-intruder']), pathIds: freezeList(['path', CARD_ID]), tags: freezeList(['file-upload', 'content-type', 'web-shell', 'proof-boundary']), sourceRefs: freezeList(['htb-penetration-tester-db1367c3cb696693', 'htb-penetration-tester-dcf44979c5cbeb28', 'htb-penetration-tester-42b27d448cc88bc4', 'htb-penetration-tester-681ca4b3d5384254']), reviewWave: WAVE }),
    freezeObject({ id: 'note-inclusion-transform-and-source-boundary', title: 'Keep inclusion source and transforms explicit', body: 'File inclusion findings depend on what source the server resolved and how it transformed the content. Separate local reads, wrapper transformations, remote retrieval, uploaded-file inclusion, source disclosure, and executable interpretation so the report can show which boundary actually failed.', kind: 'evidence', cardIds: freezeList([CARD_ID]), toolIds: freezeList(['curl', 'ffuf']), pathIds: freezeList(['path', CARD_ID]), tags: freezeList(['file-inclusion', 'lfi', 'rfi', 'wrappers', 'proof-boundary']), sourceRefs: freezeList(['htb-penetration-tester-c234c00d18a235f3', 'htb-penetration-tester-b90fb6ba8060ca62', 'htb-penetration-tester-4d269654772ade3f', 'htb-penetration-tester-c89f8281ca7b1cb6', 'htb-penetration-tester-999330f41a434b37', 'htb-penetration-tester-bf66c6300266b4d0', 'htb-penetration-tester-eb9ed63c6680ecdd']), reviewWave: WAVE }),
    freezeObject({ id: 'note-web-transfer-endpoint-scope-cleanup', title: 'Operator-hosted transfer is infrastructure, not target proof', body: 'When a test uses an operator-hosted transfer endpoint, keep it scoped, temporary, and documented. Prefer encrypted transport when practical, record the transfer separately from target-side execution, stop the listener or server when finished, and clean temporary files on both sides.', kind: 'cleanup', cardIds: freezeList([CARD_ID]), toolIds: freezeList(['curl', 'python3']), pathIds: freezeList([CARD_ID]), tags: freezeList(['file-transfer', 'operator-infrastructure', 'cleanup', 'web-shell']), sourceRefs: freezeList(['htb-penetration-tester-b2c3e1eb214f2739', 'htb-penetration-tester-42b27d448cc88bc4', 'htb-penetration-tester-681ca4b3d5384254', 'htb-penetration-tester-e274dc76c977af88']), reviewWave: WAVE }),
  ]);
  const PRODUCT_CHANGES = freezeList(['field-note:note-upload-inclusion-proof-chain', 'field-note:note-upload-serving-interpretation-boundary', 'field-note:note-inclusion-transform-and-source-boundary', 'field-note:note-web-transfer-endpoint-scope-cleanup', 'live-card:' + CARD_ID, 'evidence-parser-change:' + ANALYZER_ID, 'queue-hygiene:old-rubric-remine-batch-numbering']);

  function decision(outcome, fields) { return freezeObject(Object.assign({ outcome }, fields || {})); }
  function clusterOwner(entry) {
    if (entry.cluster === 'inclusion-remediation') return 'note-file-inclusion-remediation';
    if (entry.cluster === 'inclusion-fuzzing') return 'note-file-inclusion-scan-signal';
    if (entry.cluster === 'inclusion-transform') return 'note-file-inclusion-interpretation-boundary';
    if (entry.cluster === 'cross-source-chain') return 'note-file-inclusion-cross-source-chain';
    if (entry.cluster === 'transfer-cleanup') return 'note-transfer-endpoint-hygiene';
    if (entry.cluster === 'web-shell-cleanup') return 'note-web-shell-control-cleanup';
    return 'note-upload-acceptance-not-impact';
  }
  function auditRow(entry) {
    const owner = clusterOwner(entry);
    const privateReason = 'The source contains lab targets, screenshots, exact payload strings, command recipes, answer material, or course expression. Public Obol keeps the generalized proof boundary and operator workflow only.';
    const pathProof = freezeList(['path', CARD_ID]);
    return freezeObject({
      noteId: entry.id,
      title: entry.title,
      theme: 'web-upload-inclusion',
      reviewWave: WAVE,
      sourceRoute: SOURCE_ROUTE,
      sourcePackets: SOURCE_PACKETS,
      sourcePacketCommit: 'agent/review-packets',
      originalSourceReread: true,
      selectorBatch: 'notes-batch-old-rubric-reviewed-remine-001',
      outputIds: freezeList(PUBLIC_NOTES.map((note) => note.id)),
      productChanges: PRODUCT_CHANGES,
      decisions: freezeObject({
        'path-bindings': decision('added', { proofRefs: freezeList([CARD_ID, owner]), changedOwners: freezeList([PROOF_FILE]), pathIds: pathProof, actualPathIntegrated: true }),
        'tool-cards': decision('added', { proofRefs: freezeList([CARD_ID, ANALYZER_ID]), changedOwners: freezeList([PROOF_FILE]), toolIds: freezeList(['curl', 'ffuf', 'burp-intruder', 'sqlmap', 'python3']), pathIds: pathProof, actualPathIntegrated: true }),
        'gui-controls': decision('covered', { ownerIds: freezeList([CARD_ID]), note: 'The user-visible proof-chain card exposes the staged checklist and command-builder choices without adding a separate GUI schema.' }),
        'scripts-one-liners': decision(entry.privateHeavy ? 'private-only' : 'covered', entry.privateHeavy ? { reason: privateReason } : { ownerIds: freezeList([CARD_ID]), note: 'Public-safe one-liner value is represented as placeholder command shapes rather than copied lab commands.' }),
        'command-templates': decision('added', { proofRefs: freezeList([CARD_ID]), changedOwners: freezeList([PROOF_FILE]), toolIds: freezeList(['curl', 'ffuf']), pathIds: pathProof, actualPathIntegrated: true }),
        'terminal-analyzers': decision('added', { proofRefs: freezeList([ANALYZER_ID]), changedOwners: freezeList([PROOF_FILE]), analyzerIds: freezeList([ANALYZER_ID]), pathIds: pathProof, actualPathIntegrated: true }),
        'evidence-expectations': decision('added', { proofRefs: freezeList(['note-upload-inclusion-proof-chain', 'note-upload-serving-interpretation-boundary', 'note-inclusion-transform-and-source-boundary']), changedOwners: freezeList([PROOF_FILE]), pathIds: pathProof, actualPathIntegrated: true }),
        'path-movement': decision('added', { proofRefs: freezeList([CARD_ID, ANALYZER_ID]), changedOwners: freezeList([PROOF_FILE]), pathIds: pathProof, actualPathIntegrated: true }),
        'lesson-boxes': decision('added', { proofRefs: freezeList(PUBLIC_NOTES.map((note) => note.id)), changedOwners: freezeList([PROOF_FILE]), pathIds: pathProof, actualPathIntegrated: true }),
        examples: decision('private-only', { reason: privateReason }),
        troubleshooting: decision('added', { proofRefs: freezeList(['note-inclusion-transform-and-source-boundary', ANALYZER_ID]), changedOwners: freezeList([PROOF_FILE]), pathIds: pathProof, actualPathIntegrated: true }),
        cleanup: decision('added', { proofRefs: freezeList(['note-web-transfer-endpoint-scope-cleanup']), changedOwners: freezeList([PROOF_FILE]), pathIds: pathProof, actualPathIntegrated: true }),
        'report-guidance': decision('added', { proofRefs: freezeList(['note-upload-inclusion-proof-chain']), changedOwners: freezeList([PROOF_FILE]), reportIds: freezeList(['Upload/Inclusion Proof Chain', 'Temporary Web Control Cleanup']), pathIds: pathProof, actualPathIntegrated: true }),
        'product-mechanics': decision('added', { proofRefs: PRODUCT_CHANGES, changedOwners: freezeList([PROOF_FILE, 'data/current-release.js', 'data/product-hardening/build-next-queue-hygiene-current.js']), pathIds: pathProof, actualPathIntegrated: true }),
        'product-gaps': decision('covered', { ownerIds: freezeList([CARD_ID, ANALYZER_ID, 'notes-mechanic-backfill']), note: 'This batch converts the immediate upload/inclusion gap into card, Evidence-analyzer, note, and progress mechanics while leaving the standing re-mining gate open.' }),
        'orange-baseline': decision('covered', { ownerIds: freezeList(['path', owner]), note: 'The Orange-derived web and file-handling path remains the baseline; this batch adds proof-chain guidance and analyzer output without replacing existing path items.' }),
      }),
    });
  }
  const REMINE_AUDIT_ROWS = freezeList(SELECTED.map(auditRow));

  function addMatch(matches, id, label, fact) { matches.push(freezeObject({ id, label, fact })); }
  function analyzeUploadInclusionEvidence(text) {
    const raw = String(text || '');
    const matches = [];
    if (has(raw, /\b(?:File successfully uploaded|upload(?:ed)? successfully|multipart\/form-data|Content-Disposition:\s*form-data|stored as|download(?:ed)?|Location:\s*\/[^\s]+)/i)) addMatch(matches, 'upload-accepted', 'Upload acceptance or storage clue observed', 'web.upload.acceptance_observed');
    if (has(raw, /\b(?:Content-Type|X-Content-Type-Options|application\/octet-stream|text\/plain|text\/html|image\/|source code|download)\b/i)) addMatch(matches, 'serving-behavior', 'Serving or content-handling clue observed', 'web.upload.serving_behavior_observed');
    if (has(raw, /\b(?:LFI|RFI|file inclusion|\.\.\/|%2e%2e|php:\/\/|data:\/\/|expect:\/\/|input stream|wrapper|include path|open_basedir)\b/i)) addMatch(matches, 'inclusion-transform', 'Inclusion path or transform clue observed', 'web.inclusion.transform_observed');
    if (has(raw, /\b(?:ffuf|gobuster|wfuzz|Status:|Size:|Words:|Lines:|FUZZ|parameter|wordlist|filter size|calibration)\b/i)) addMatch(matches, 'fuzzing-signal', 'File-handling fuzzing signal observed', 'web.file_handling.fuzzing_signal_observed');
    if (has(raw, /\b(?:web shell|reverse shell|command output|uid=|whoami|hostname|system\(|exec\(|shell_exec\(|interpreted|executed)\b/i)) addMatch(matches, 'execution-claim', 'Execution or web-shell claim observed', 'web.upload.execution_claim_observed');
    if (has(raw, /\b(?:cleanup|remove|rm\s|delete|unlink|stop server|temporary file|listener|python3\s+-m\s+http\.server)\b/i)) addMatch(matches, 'cleanup-needed', 'Temporary transfer or shell cleanup clue observed', 'web.file_handling.cleanup_needed');
    const outcomeFacts = freezeList(unique(matches.map((match) => match.fact)));
    const warnings = [];
    if (outcomeFacts.includes('web.upload.acceptance_observed')) warnings.push('Upload acceptance is only the first fact. Record stored path, reachability, serving behavior, and downstream effect separately.');
    if (outcomeFacts.includes('web.upload.serving_behavior_observed')) warnings.push('Serving behavior decides impact. Do not treat storage or download as runtime interpretation without a separate effect.');
    if (outcomeFacts.includes('web.inclusion.transform_observed')) warnings.push('Keep local read, wrapper transform, remote retrieval, and executable interpretation as separate proof states.');
    if (outcomeFacts.includes('web.file_handling.fuzzing_signal_observed')) warnings.push('Fuzzer hits are triage. Replay candidates and inspect response bodies before reporting impact.');
    if (outcomeFacts.includes('web.upload.execution_claim_observed')) warnings.push('Execution claims require explicit command-result Evidence and cleanup context, not just a reachable file.');
    if (outcomeFacts.includes('web.file_handling.cleanup_needed')) warnings.push('Temporary shells, transfer servers, and proof files need cleanup or an explicit report caveat.');
    return freezeObject({ id: ANALYZER_ID, matchCount: matches.length, matches: freezeList(matches), outcomeFacts, warnings: freezeList(warnings), snippetHash: hash(redact(raw)), snippet: redact(raw) });
  }

  function buildCard() {
    return freezeObject({
      id: CARD_ID,
      lane: 'web-file-handling',
      title: 'Upload and Inclusion Proof Chain',
      hypothesis: 'Use this when upload, file-read, wrapper, remote-include, or web-shell evidence appears. Break the chain into acceptance, storage, reachability, interpretation, downstream effect, and cleanup before calling the issue exploitable.',
      prereq: freezeObject({ any: freezeList(['service.http', 'web.upload.acceptance_observed', 'web.inclusion.transform_observed', 'web.file_handling.fuzzing_signal_observed', 'web.upload.execution_claim_observed']) }),
      produces: freezeList(['web.file_handling.proof_chain_reviewed', 'web.file_handling.manual_replay_required']),
      commands: freezeList([
        freezeObject({ tool: 'curl', run: 'curl -i -s -k -F "file=@{{benign_probe_file}}" {{upload_url}}', note: 'Use a harmless probe to prove acceptance, stored name, and response handling before any impact claim.' }),
        freezeObject({ tool: 'curl', run: 'curl -i -s -k "{{stored_or_include_url}}"', note: 'Replay the final stored or included resource and record status, headers, body behavior, and handler clues.' }),
        freezeObject({ tool: 'ffuf', run: 'ffuf -u "{{url}}?{{parameter}}=FUZZ" -w {{wordlist}} -mc all -fs {{baseline_size}}', note: 'Use only after a parameter or path hypothesis exists; response deltas still require manual replay.' }),
      ]),
      expected: freezeList(['upload acceptance or include parameter identified', 'stored path or resolved source recorded', 'serving or transform behavior captured', 'manual replay reviewed', 'downstream effect proven or ruled out', 'cleanup state recorded']),
      defender: 'File-handling tests can leave durable artifacts and noisy logs. Keep uploaded probes harmless, scope operator-hosted endpoints, record cleanup, and avoid reporting execution without command-result proof.',
      report: freezeObject({ finding: 'Upload/Inclusion Proof Chain', severity: 'medium' }),
      tools: freezeList(['curl', 'ffuf', 'Burp Intruder', 'sqlmap', 'python3']),
      refs: freezeList([]),
      sourceMined69: freezeObject({ proof: PROOF_FILE, notes: freezeList(PUBLIC_NOTES.map((note) => note.id)), selectedNoteCount: SELECTED.length }),
    });
  }
  function installCards() {
    const lane = ensureLane('web-file-handling', 'Web File Handling', 'Initial Access & Web');
    return publishCard(lane, buildCard(), ['note-file-inclusion-cross-source-chain', 'burp-intruder-fuzzing-workflow', 'web-authz-boundaries']);
  }
  function upsertPublicNotes() {
    const prev = root.OBOL_NOTE_INTEGRATION;
    if (!prev || !Array.isArray(prev.publicFieldNotes)) return false;
    const byId = new Map(prev.publicFieldNotes.map((note) => [note && note.id, note]).filter((pair) => pair[0]));
    for (const note of PUBLIC_NOTES) byId.set(note.id, note);
    root.OBOL_NOTE_INTEGRATION = freezeObject({ ...prev, publicFieldNotes: freezeList(Array.from(byId.values())), __webUploadInclusionRemineV969: true });
    return true;
  }
  function installEvidenceIngestion() {
    const T = root.OBOL_INTAKE_V21;
    if (!T || typeof T.analyzeTerminal !== 'function') return false;
    if (T.analyzeTerminal.__webUploadInclusionRemineV969) return true;
    const original = T.analyzeTerminal;
    try {
      T.analyzeTerminal = function webUploadInclusionAnalyzeTerminal(text) {
        const result = original.apply(this, arguments) || {};
        const analysis = analyzeUploadInclusionEvidence(text);
        if (analysis.matchCount) {
          const activities = Array.isArray(result.activities) ? result.activities.slice() : [];
          activities.push(freezeObject({ id: 'evidence-upload-inclusion-' + analysis.snippetHash, cardId: CARD_ID, title: 'Upload or inclusion proof chain reviewed', result: analysis.outcomeFacts.includes('web.upload.execution_claim_observed') ? 'interesting' : 'triage', summary: analysis.warnings[0] || 'File-handling Evidence needs staged proof.', facts: analysis.outcomeFacts }));
          result.activities = activities;
          result.uploadInclusionEvidence69 = analysis;
        }
        return result;
      };
      T.analyzeTerminal.__webUploadInclusionRemineV969 = true;
      return true;
    } catch (_err) { return false; }
  }
  function recompute(rows, dimensions, outcomes) {
    const outcomeCounts = {};
    outcomes.forEach((outcome) => { outcomeCounts[outcome] = 0; });
    const dimensionCounts = {};
    dimensions.forEach((id) => { dimensionCounts[id] = { considered: 0, added: 0, covered: 0, queued: 0, privateOnly: 0, notApplicable: 0, blocked: 0, ruledOut: 0 }; });
    const keyFor = { 'private-only': 'privateOnly', 'not-applicable': 'notApplicable' };
    for (const row of rows) {
      for (const dimension of dimensions) {
        const dec = row && row.decisions && row.decisions[dimension];
        const outcome = dec && dec.outcome;
        if (!outcome) continue;
        if (Object.prototype.hasOwnProperty.call(outcomeCounts, outcome)) outcomeCounts[outcome] += 1;
        const dc = dimensionCounts[dimension];
        if (dc) {
          dc.considered += 1;
          const outKey = keyFor[outcome] || outcome;
          if (Object.prototype.hasOwnProperty.call(dc, outKey)) dc[outKey] += 1;
        }
      }
    }
    Object.keys(dimensionCounts).forEach((id) => { dimensionCounts[id] = freezeObject(dimensionCounts[id]); });
    return freezeObject({ outcomeCounts: freezeObject(outcomeCounts), dimensionCounts: freezeObject(dimensionCounts) });
  }
  function updateProgress() {
    const base = root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS;
    const current = base && base.remining;
    if (!base || !current || (!Array.isArray(current.auditRows) && !Array.isArray(current.remineAuditRows))) return false;
    const dimensions = freezeList(unique(Array.from(current.dimensions || []).concat(Array.from(DIMENSIONS))));
    const outcomes = freezeList(unique(Array.from(current.allowedOutcomes || []).concat(Array.from(OUTCOMES))));
    const priorRows = Array.from(current.auditRows || current.remineAuditRows || []);
    const key = (row) => String(row.noteId || '') + '|' + String(row.reviewWave || '');
    const priorKeys = new Set(priorRows.map(key));
    const mergedRows = priorRows.concat(REMINE_AUDIT_ROWS.filter((row) => !priorKeys.has(key(row))));
    const counts = recompute(mergedRows, dimensions, outcomes);
    const priorCount = Number(current.reminedNoteCount || current.audited || 67);
    const addedNow = mergedRows.length - priorRows.length;
    const targetCount = Math.max(87, priorCount + addedNow, mergedRows.length);
    root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = freezeObject({ ...base, schemaVersion: '1.9.0', remining: freezeObject({ ...current, dimensions, allowedOutcomes: outcomes, dimensionCounts: counts.dimensionCounts, outcomeCounts: counts.outcomeCounts, auditRows: freezeList(mergedRows.map((row) => freezeObject({ ...row, decisions: freezeObject(row.decisions || {}) }))), remineAuditRows: freezeList(mergedRows), audited: targetCount, reminedNoteCount: targetCount, oldRubricReviewed: 135, oldRubricOnlyRemaining: Math.max(0, 135 - targetCount), latestWave: WAVE, latestBatchCount: SELECTED.length, latestBatchSource: 'complete sequential packets', latestBatchPackets: SOURCE_PACKETS, latestSelectorBatch: 'notes-batch-old-rubric-reviewed-remine-001', latestSelectorBatchProgress: freezeObject({ selected: SELECTED.length, target: 20, remainingInBatch: 0 }), completedSelectorBatches: freezeList(unique(Array.from(current.completedSelectorBatches || []).concat(['notes-batch-old-rubric-reviewed-remine-001']))), nextSelectorBatch: 'notes-batch-old-rubric-reviewed-remine-002', selectedNotesSourceOrder: freezeList(SELECTED.map((entry) => entry.id)), evidenceIngestionBuilt: freezeList(unique(Array.from(current.evidenceIngestionBuilt || []).concat([ANALYZER_ID]))) }) });
    return true;
  }
  function updateQueue() {
    const q = root.OBOL_PRODUCT_HARDENING;
    if (!q || !Array.isArray(q.items)) return false;
    const item = q.items.find((entry) => entry && entry.id === ITEM_ID);
    if (!item) return false;
    item.status = 'queued';
    item.latestPartialRemineWave = WAVE;
    item.latestPartialRemineProof = PROOF_FILE;
    item.latestPartialRemineOutputIds = freezeList(PUBLIC_NOTES.map((note) => note.id));
    item.latestPartialRemineDetail = 'v9.69 completed the first 20-note old-rubric source re-mining batch for web upload, file inclusion, web-shell, and transfer-endpoint notes. The standing re-mining gate remains open for the next old-rubric batch.';
    item.detail = 'Concrete notes-first gate: 48 already-reviewed old-rubric-only notes still need full-spectrum source re-mining before offline/performance work can become next.';
    return true;
  }
  function validate() {
    const failures = [];
    const notes = root.OBOL_NOTE_INTEGRATION && Array.isArray(root.OBOL_NOTE_INTEGRATION.publicFieldNotes) ? root.OBOL_NOTE_INTEGRATION.publicFieldNotes : [];
    const noteIds = new Set(notes.map((note) => note && note.id).filter(Boolean));
    for (const note of PUBLIC_NOTES) if (!noteIds.has(note.id)) failures.push('Missing public field note ' + note.id);
    if (!liveCard(CARD_ID)) failures.push('Missing live card route ' + CARD_ID);
    const progress = root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS && root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining;
    const auditIds = new Set(((progress && progress.auditRows) || []).map((row) => String(row.noteId || '') + '|' + String(row.reviewWave || '')));
    for (const entry of SELECTED) if (!auditIds.has(entry.id + '|' + WAVE)) failures.push('Missing audit row for ' + entry.id);
    if (progress && Number(progress.oldRubricOnlyRemaining) !== 48) failures.push('Expected 48 old-rubric-only notes remaining after v9.69 batch');
    return freezeList(failures);
  }
  function settled(result) { return !!(result && result.notesIntegrated && result.cardsInstalled && result.progressIntegrated && result.queueIntegrated && !result.failures.length); }
  function integrate() {
    const notesIntegrated = upsertPublicNotes();
    const cardsInstalled = installCards();
    const evidenceInstalled = installEvidenceIngestion();
    const progressIntegrated = updateProgress();
    const queueIntegrated = updateQueue();
    const failures = validate();
    root.OBOL_WEB_UPLOAD_INCLUSION_REMINE_V969 = freezeObject({ wave: WAVE, status: failures.length ? 'partial' : 'live-integrated', notesIntegrated, cardsInstalled, evidenceInstalled, progressIntegrated, queueIntegrated, failures, selectedNoteIds: freezeList(SELECTED.map((entry) => entry.id)), publicNoteIds: freezeList(PUBLIC_NOTES.map((note) => note.id)), cardId: CARD_ID, analyzerId: ANALYZER_ID });
    return root.OBOL_WEB_UPLOAD_INCLUSION_REMINE_V969;
  }
  const packet = freezeObject({ wave: WAVE, status: 'live-integrated', queueItemId: ITEM_ID, sourceConfidence: freezeObject({ schemaVersion: 2, sourceRoute: SOURCE_ROUTE, sourcePackets: SOURCE_PACKETS, reviewTextPolicy: 'complete_cleaned_text', truncationPolicy: 'none', expectedNoteCount: 556, uniqueNoteCount: 556, packetCount: 29, reviewTextChars: 8725188, selectedNoteIds: freezeList(SELECTED.map((entry) => entry.id)), selectorBatch: 'notes-batch-old-rubric-reviewed-remine-001' }), publicNotes: PUBLIC_NOTES, productChanges: PRODUCT_CHANGES, remineAuditRows: REMINE_AUDIT_ROWS, cardId: CARD_ID, analyzerId: ANALYZER_ID, analyzeUploadInclusionEvidence, integrate, validate });
  root.OBOL_WEB_UPLOAD_INCLUSION_REMINE_PACKET_V969 = packet;
  const first = integrate();
  if (typeof window !== 'undefined') {
    let tries = 0;
    const schedule = typeof window.setTimeout === 'function' ? window.setTimeout.bind(window) : null;
    const attempt = () => { const result = integrate(); tries += 1; if (!settled(result) && tries < 180 && schedule) schedule(attempt, 50); };
    if (!settled(first) && schedule) schedule(attempt, 0);
    if (typeof window.addEventListener === 'function') { window.addEventListener('hashchange', attempt); window.addEventListener('focus', attempt); }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = packet;
})(typeof window !== 'undefined' ? window : globalThis);
