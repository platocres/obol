'use strict';

(function initBurpIntruderReminingV965(root) {
  const WAVE = 'v9.65-burp-intruder-remine';
  const ITEM_ID = 'notes-mechanic-backfill';
  const NOTE_ID = 'htb-penetration-tester-decf23d473e0762b';
  const PROOF_FILE = 'data/product-hardening/burp-intruder-remining-v9.65.js';
  const CARD_IDS = Object.freeze(['burp-intruder-fuzzing-workflow', 'fuzzer-payload-position-review', 'fuzzer-result-delta-review']);
  const DIMENSIONS = Object.freeze(['path-bindings', 'tool-cards', 'gui-controls', 'scripts-one-liners', 'command-templates', 'terminal-analyzers', 'evidence-expectations', 'path-movement', 'lesson-boxes', 'examples', 'troubleshooting', 'cleanup', 'report-guidance', 'product-mechanics', 'product-gaps', 'orange-baseline']);
  const OUTCOMES = Object.freeze(['added', 'covered', 'queued', 'private-only', 'not-applicable', 'blocked']);

  function freezeList(list) { return Object.freeze((list || []).slice()); }
  function freezeObject(value) { return Object.freeze(value || {}); }
  function unique(list) { return Array.from(new Set((list || []).filter(Boolean))); }
  function has(text, pattern) { return pattern.test(String(text || '')); }
  function hash(value) {
    const C = root.OBOL_CORE_V2;
    if (C && typeof C.simpleHash === 'function') return C.simpleHash(value);
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
      .replace(/((?:cookie|token|session|phpsessid|password|passwd|pwd|secret|api[_-]?key)\s*[=:]\s*)([^;\s&]+)/gi, '$1[redacted]')
      .replace(/\b[A-Fa-f0-9]{24,128}\b/g, '[encoded-or-secret-material]')
      .replace(/\b[A-Za-z0-9+/]{32,}={0,2}\b/g, '[encoded-or-secret-material]')
      .slice(0, 1100);
  }

  const SOURCE_CONFIDENCE = freezeObject({
    schemaVersion: 2,
    sourceRoute: 'platocres/obol-source-notes@agent/review-packets',
    sourcePackets: freezeList(['data/review-packets/manifest.json', 'data/review-packets/htb-penetration-tester-01.json']),
    reviewTextPolicy: 'complete_cleaned_text',
    truncationPolicy: 'none',
    expectedNoteCount: 556,
    uniqueNoteCount: 556,
    packetCount: 29,
    reviewTextChars: 8725188,
    selectedNoteIds: freezeList([NOTE_ID]),
    selectorBatch: 'notes-batch-old-rubric-reviewed-remine-001',
    privateBoundary: 'The Burp Intruder source note was re-read from the complete packet route. Public output keeps generalized payload-position, payload-processing, response-delta triage, replay, scope, rate, cleanup, and reporting logic only.',
  });

  const PUBLIC_NOTES = freezeList([
    freezeObject({ id: 'note-fuzzer-position-before-payloads', title: 'Set fuzzing positions before choosing payloads', body: 'A fuzzer run is only meaningful when the operator can name the exact request position being mutated. Record the original request, selected insertion point, attack type, payload source, and unchanged request context before treating any hit as evidence.', kind: 'path-guidance', cardIds: freezeList(['burp-intruder-fuzzing-workflow', 'fuzzer-payload-position-review']), toolIds: freezeList(['burp-intruder', 'owasp-zap-fuzzer', 'ffuf', 'gobuster', 'wfuzz']), pathIds: freezeList(['path']), tags: freezeList(['web', 'fuzzing', 'burp-intruder', 'payload-position', 'proof-boundary']), sourceRefs: freezeList([NOTE_ID]), reviewWave: WAVE }),
    freezeObject({ id: 'note-payload-processing-is-proof-state', title: 'Payload processing and encoding are proof state', body: 'Payload processing, character substitutions, skip rules, and automatic encoding change what actually reaches the server. Keep those transforms explicit so a replay, CLI equivalent, or report can explain why one request differs from another.', kind: 'evidence', cardIds: freezeList(['burp-intruder-fuzzing-workflow', 'fuzzer-payload-position-review']), toolIds: freezeList(['burp-intruder', 'owasp-zap-fuzzer', 'cyberchef']), pathIds: freezeList(['path']), tags: freezeList(['web', 'fuzzing', 'encoding', 'payload-processing', 'evidence']), sourceRefs: freezeList([NOTE_ID]), reviewWave: WAVE }),
    freezeObject({ id: 'note-fuzzer-delta-is-triage-not-impact', title: 'Treat fuzzer response deltas as triage, not impact', body: 'Status-code, word-count, and length outliers point to candidates for manual review. They do not prove authorization bypass, file discovery, injection, or exploitability until the candidate is replayed and the response body or server-side effect is understood.', kind: 'evidence', cardIds: freezeList(['fuzzer-result-delta-review', 'burp-intruder-fuzzing-workflow']), toolIds: freezeList(['burp-intruder', 'owasp-zap-fuzzer', 'ffuf', 'dirb', 'gobuster']), pathIds: freezeList(['path']), tags: freezeList(['web', 'fuzzing', 'response-delta', 'manual-replay', 'evidence']), sourceRefs: freezeList([NOTE_ID]), reviewWave: WAVE }),
    freezeObject({ id: 'note-burp-community-throttle-switch-context', title: 'Account for fuzzer speed and scope limits', body: 'Proxy-integrated fuzzers are useful for short, highly contextual tests, while CLI fuzzers are better for broad wordlists or repeatable sweeps. Choose the tool based on scope, rate, response review, and reproducibility rather than assuming one interface is always best.', kind: 'troubleshooting', cardIds: freezeList(['burp-intruder-fuzzing-workflow', 'fuzzer-result-delta-review']), toolIds: freezeList(['burp-intruder', 'owasp-zap-fuzzer', 'ffuf', 'gobuster', 'dirb']), pathIds: freezeList(['path']), tags: freezeList(['web', 'fuzzing', 'rate-limit', 'tool-choice', 'troubleshooting']), sourceRefs: freezeList([NOTE_ID]), reviewWave: WAVE }),
  ]);

  const PRODUCT_CHANGES = freezeList(['field-note:note-fuzzer-position-before-payloads', 'field-note:note-payload-processing-is-proof-state', 'field-note:note-fuzzer-delta-is-triage-not-impact', 'field-note:note-burp-community-throttle-switch-context', 'evidence-parser-change:web-fuzzer-output-analyzer', 'path-guidance:burp-intruder-fuzzing-workflow', 'live-card:burp-intruder-fuzzing-workflow', 'live-card:fuzzer-payload-position-review', 'live-card:fuzzer-result-delta-review']);

  function decision(outcome, fields) { return freezeObject({ outcome, ...(fields || {}) }); }
  const REMINE_AUDIT_ROWS = freezeList([freezeObject({
    noteId: NOTE_ID,
    title: 'Burp Intruder fuzzing workflow and response-delta proof chain',
    theme: 'web-fuzzer-response-triage',
    reviewWave: WAVE,
    originalSourceReread: true,
    sourceRoute: SOURCE_CONFIDENCE.sourceRoute,
    sourcePackets: SOURCE_CONFIDENCE.sourcePackets,
    pathNodesConsidered: freezeList(['path', 'burp-intruder-fuzzing-workflow', 'fuzzer-payload-position-review', 'fuzzer-result-delta-review']),
    outputIds: freezeList(PUBLIC_NOTES.map((note) => note.id)),
    productChanges: PRODUCT_CHANGES,
    decisions: freezeObject({
      'path-bindings': decision('added', { proofRefs: freezeList(['note-fuzzer-position-before-payloads', 'burp-intruder-fuzzing-workflow']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path', 'burp-intruder-fuzzing-workflow']), actualPathIntegrated: true }),
      'tool-cards': decision('added', { proofRefs: freezeList(['note-fuzzer-position-before-payloads', 'note-burp-community-throttle-switch-context']), changedOwners: freezeList([PROOF_FILE]), toolIds: freezeList(['burp-intruder', 'owasp-zap-fuzzer', 'ffuf', 'gobuster', 'dirb', 'wfuzz']), pathIds: freezeList(['path']), actualPathIntegrated: true }),
      'gui-controls': decision('covered', { ownerIds: freezeList(['burp-intruder-fuzzing-workflow', 'fuzzer-payload-position-review']), note: 'The visible card route owns the UI guidance for positions, payload processing, and response-delta review.' }),
      'scripts-one-liners': decision('private-only', { reason: 'The source includes lab-specific host, port, path, target resource, answer string, and screenshot values. Public Obol keeps only generalized fuzzer command shapes and proof requirements.' }),
      'command-templates': decision('added', { proofRefs: freezeList(['burp-intruder-fuzzing-workflow']), changedOwners: freezeList([PROOF_FILE]), toolIds: freezeList(['ffuf', 'gobuster', 'dirb']), pathIds: freezeList(['burp-intruder-fuzzing-workflow']), actualPathIntegrated: true }),
      'terminal-analyzers': decision('added', { proofRefs: freezeList(['web-fuzzer-output-analyzer']), changedOwners: freezeList([PROOF_FILE]), analyzerIds: freezeList(['web-fuzzer-output-analyzer']), pathIds: freezeList(['path']), actualPathIntegrated: true }),
      'evidence-expectations': decision('added', { proofRefs: freezeList(['note-fuzzer-delta-is-triage-not-impact', 'web-fuzzer-output-analyzer']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path']), actualPathIntegrated: true }),
      'path-movement': decision('added', { proofRefs: freezeList(['web-fuzzer-output-analyzer']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path']), actualPathIntegrated: true }),
      'lesson-boxes': decision('added', { proofRefs: freezeList(PUBLIC_NOTES.map((note) => note.id)), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path']), actualPathIntegrated: true }),
      examples: decision('private-only', { reason: 'Concrete examples include private target URL, found path, port, screenshot sequence, and answer token. Public examples use placeholders and redaction checks.' }),
      troubleshooting: decision('added', { proofRefs: freezeList(['note-burp-community-throttle-switch-context', 'web-fuzzer-output-analyzer']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['fuzzer-result-delta-review']), actualPathIntegrated: true }),
      cleanup: decision('covered', { ownerIds: freezeList(['burp-intruder-fuzzing-workflow']), note: 'Fuzzing cleanup is mostly scope/rate/noise accounting rather than target artifact removal.' }),
      'report-guidance': decision('added', { proofRefs: freezeList(['note-fuzzer-delta-is-triage-not-impact']), changedOwners: freezeList([PROOF_FILE]), reportIds: freezeList(['Web Fuzzer Candidate Triage', 'Response Delta Manual Replay']), pathIds: freezeList(['path']), actualPathIntegrated: true }),
      'product-mechanics': decision('added', { proofRefs: PRODUCT_CHANGES, changedOwners: freezeList([PROOF_FILE, 'data/current-release.js', 'tests/playwright-note-card-routes.js', 'tools/scope-check.js']), pathIds: freezeList(['path']), actualPathIntegrated: true }),
      'product-gaps': decision('covered', { ownerIds: freezeList(['validate-product-hardening-card-routes', 'validate-note-card-path-placement', 'playwright-note-card-routes']), note: 'The post-v9.64 route and path-placement guards now cover new note-derived cards.' }),
      'orange-baseline': decision('covered', { ownerIds: freezeList(['path', 'web-proxy-transform-proof-chain', 'encoded-parameter-review']), note: 'Existing web proxy and Evidence semantics remain the baseline.' }),
    }),
  })]);

  function addMatch(matches, id, label, fact) { matches.push(freezeObject({ id, label, fact })); }
  function analyzeWebFuzzerOutput(text) {
    const raw = String(text || '');
    const matches = [];
    if (has(raw, /\b(?:Burp Intruder|Intruder attack|ZAP Fuzzer|ffuf|gobuster|dirb|wfuzz|Payload Positions?|Payload Options?|Payload Processing)\b/i)) addMatch(matches, 'fuzzer-workflow', 'Web fuzzer workflow observed', 'web.fuzzer_workflow_observed');
    if (has(raw, /(?:§[^§\r\n]{0,120}§|payload position|positions tab|sniper|battering ram|pitchfork|cluster bomb|FUZZ|DIRECTORY|WORDLIST)/i)) addMatch(matches, 'payload-position', 'Payload position or attack type observed', 'web.fuzzer_payload_position_observed');
    if (has(raw, /\b(?:payload processing|payload encoding|URL-encode|character substitution|skip if matches|grep match|grep extract|resource pool|retried on failure|pause before retry)\b/i)) addMatch(matches, 'payload-transform', 'Payload processing or encoding observed', 'web.fuzzer_payload_transform_observed');
    if (has(raw, /\b(?:Status|Length|Words|Lines|Size|response length|word count|outlier|interesting|match|extract)\b[\s\S]{0,220}\b(?:200|204|301|302|307|401|403|404|500|[1-9][0-9]{2,6}\s*(?:bytes|words|lines)?)\b/i)) addMatch(matches, 'response-delta', 'Response status or length delta observed', 'web.fuzzer_response_delta_observed');
    if (has(raw, /(?:\b(?:200 OK|301 Moved|302 Found|403 Forbidden)\b|\/[A-Za-z0-9._~!$&'()*+,;=:@\/-]{2,}\s+(?:200|301|302|403)|\[(?:Status|Size|Words|Lines):[^\]]+\])/i)) addMatch(matches, 'candidate-hit', 'Fuzzer hit candidate observed', 'web.fuzzer_hit_candidate_observed');
    if (has(raw, /\b(?:Community Version|throttled|1 request per second|rate limit|too slow|wordlist too large|scope|resource pool)\b/i)) addMatch(matches, 'rate-scope-boundary', 'Fuzzer rate or scope boundary observed', 'web.fuzzer_rate_or_scope_boundary_observed');
    const outcomeFacts = freezeList(unique(matches.map((match) => match.fact)));
    const warnings = [];
    if (outcomeFacts.includes('web.fuzzer_payload_position_observed')) warnings.push('Keep the exact insertion point and unchanged request context with the finding. A wordlist without a named position is weak evidence.');
    if (outcomeFacts.includes('web.fuzzer_payload_transform_observed')) warnings.push('Payload processing and encoding are part of the proof chain. Preserve transform order before translating the run to another tool.');
    if (outcomeFacts.includes('web.fuzzer_response_delta_observed') || outcomeFacts.includes('web.fuzzer_hit_candidate_observed')) warnings.push('A status, length, or word-count delta is triage, not impact. Manually replay the candidate and review the response body or server-side effect.');
    if (outcomeFacts.includes('web.fuzzer_rate_or_scope_boundary_observed')) warnings.push('Choose proxy-integrated fuzzing for short contextual tests and CLI fuzzing for broad repeatable sweeps. Keep scope and rate explicit.');
    return freezeObject({ id: 'web-fuzzer-output-analyzer', matchCount: matches.length, matches: freezeList(matches), outcomeFacts, warnings: freezeList(warnings), snippet: redact(raw), snippetHash: hash(redact(raw)), recommendedNextState: outcomeFacts.includes('web.fuzzer_hit_candidate_observed') || outcomeFacts.includes('web.fuzzer_response_delta_observed') ? 'manual-replay-fuzzer-candidate' : outcomeFacts.includes('web.fuzzer_payload_transform_observed') ? 'record-payload-transform-chain' : outcomeFacts.includes('web.fuzzer_payload_position_observed') ? 'run-bounded-fuzzer-and-compare-responses' : outcomeFacts.includes('web.fuzzer_workflow_observed') ? 'define-payload-position-and-scope' : 'no-web-fuzzer-signal' });
  }
  function analyzeEvidenceText(text) { return analyzeWebFuzzerOutput(text); }

  function liveCard(id) {
    if (!id) return null;
    if (typeof root.liveCardById === 'function') { try { return root.liveCardById(id); } catch (_err) { return null; } }
    if (root.CARDS && root.CARDS[id]) return root.CARDS[id];
    const lanes = Array.isArray(root.OBOL_LANES) ? root.OBOL_LANES : Array.isArray(root.LANES) ? root.LANES : [];
    for (const lane of lanes) for (const card of lane.cards || []) if (card && card.id === id) return card;
    return null;
  }
  function ensureLane(id, title, phase) {
    if (typeof root.laneById === 'function') return root.laneById(id, title, phase);
    const lanes = Array.isArray(root.OBOL_LANES) ? root.OBOL_LANES : Array.isArray(root.LANES) ? root.LANES : [];
    let lane = lanes.find((entry) => entry && entry.lane === id);
    if (!lane) { lane = { lane: id, title, phase, cards: [] }; lanes.push(lane); }
    if (!Array.isArray(lane.cards)) lane.cards = [];
    return lane;
  }
  function publishCard(lane, afterId, row) {
    if (!lane || !row || (liveCard(row.id) && !(liveCard(row.id).sourceMinedRouteGuard64))) return false;
    if (liveCard(row.id) && liveCard(row.id).sourceMinedRouteGuard64) {
      for (const candidate of (Array.isArray(root.OBOL_LANES) ? root.OBOL_LANES : Array.isArray(root.LANES) ? root.LANES : [])) {
        if (!Array.isArray(candidate.cards)) continue;
        const idx = candidate.cards.findIndex((card) => card && card.id === row.id);
        if (idx >= 0) candidate.cards.splice(idx, 1);
      }
      if (root.CARDS && typeof root.CARDS === 'object') try { delete root.CARDS[row.id]; } catch (_err) {}
    }
    row.lane = row.lane || lane.lane || 'web-fuzzing';
    if (typeof root.addCardAfter === 'function') { try { const ok = root.addCardAfter(lane, afterId, row); if (ok || liveCard(row.id)) return true; } catch (_err) {} }
    if (!Array.isArray(lane.cards)) lane.cards = [];
    const index = lane.cards.findIndex((entry) => entry && entry.id === afterId);
    lane.cards.splice(index >= 0 ? index + 1 : lane.cards.length, 0, row);
    if (root.CARDS && typeof root.CARDS === 'object') root.CARDS[row.id] = row;
    return true;
  }
  function buildCards() { return [
    { id: 'burp-intruder-fuzzing-workflow', lane: 'web-fuzzing', title: 'Burp Intruder Fuzzing Workflow', hypothesis: 'Use Burp Intruder when the request context matters: capture the request, name the payload position, bound the payload source, preserve payload processing and encoding, then replay interesting response deltas before calling them findings.', prereq: { any: ['service.http', 'web.fuzzer_workflow_observed', 'web.fuzzer_payload_position_observed'] }, produces: ['web.fuzzer.workflow_reviewed', 'web.fuzzer.manual_replay_required'], commands: [{ tool: 'ffuf', run: 'ffuf -u http://{{target}}/FUZZ -w {{wordlist}} -mc all -fs {{baseline_size}}', note: 'Use for broad repeatable sweeps after the target path, baseline behavior, and filters are understood.' }, { tool: 'gobuster', run: 'gobuster dir -u http://{{target}}/ -w {{wordlist}} -x {{extensions}}', note: 'Use when directory and extension discovery is the real task; manually inspect response bodies for candidates.' }, { tool: 'Burp Intruder', run: 'Send request to Intruder, mark one payload position, choose a bounded wordlist, preserve processing/encoding, then sort by status/length/words.', note: 'Use for short contextual tests where cookies, headers, and request shape matter.' }], expected: ['request captured', 'payload position named', 'payload source bounded', 'processing/encoding recorded', 'candidate replayed manually'], defender: 'Fuzzing can generate obvious request bursts. Keep rate, scope, authentication state, and replay evidence explicit before reporting.', report: { finding: 'Web Fuzzer Candidate Triage', severity: 'medium' }, tools: ['Burp Intruder', 'OWASP ZAP Fuzzer', 'ffuf', 'gobuster', 'dirb', 'wfuzz'], refs: [], sourceMined65: { proof: PROOF_FILE, notes: ['note-fuzzer-position-before-payloads', 'note-burp-community-throttle-switch-context'] } },
    { id: 'fuzzer-payload-position-review', lane: 'web-fuzzing', title: 'Review Fuzzer Payload Position and Transforms', hypothesis: 'Before trusting any fuzzer result, identify exactly where the payload entered the request and what transformations happened before it reached the server.', prereq: { any: ['web.fuzzer_payload_position_observed', 'web.fuzzer_payload_transform_observed'] }, produces: ['web.fuzzer.payload_position_reviewed'], commands: [], expected: ['insertion point marked', 'unchanged request context preserved', 'payload transforms recorded', 'encoding behavior understood'], defender: 'Unclear payload positions make findings hard to reproduce and easy to overstate. Keep the original and mutated request pair.', report: { finding: 'Fuzzer Payload Position and Transform Review', severity: 'info' }, tools: ['Burp Intruder', 'OWASP ZAP Fuzzer', 'CyberChef'], refs: [], sourceMined65: { proof: PROOF_FILE, notes: ['note-fuzzer-position-before-payloads', 'note-payload-processing-is-proof-state'] } },
    { id: 'fuzzer-result-delta-review', lane: 'web-fuzzing', title: 'Review Fuzzer Response Deltas Before Reporting', hypothesis: 'Status, size, word-count, and grep-match differences are candidate signals. The path moves only after manual replay confirms what changed and whether it matters.', prereq: { any: ['web.fuzzer_response_delta_observed', 'web.fuzzer_hit_candidate_observed'] }, produces: ['web.fuzzer.response_delta_reviewed', 'web.fuzzer.candidate_replayed'], commands: [], expected: ['candidate sorted by signal', 'manual replay performed', 'response body reviewed', 'impact statement scoped'], defender: 'Response deltas can be false positives from redirects, error templates, auth state, cache, or rate limiting. Keep comparison evidence attached.', report: { finding: 'Fuzzer Response Delta Manual Replay', severity: 'medium' }, tools: ['Burp Intruder', 'OWASP ZAP Fuzzer', 'ffuf', 'dirb', 'gobuster'], refs: [], sourceMined65: { proof: PROOF_FILE, notes: ['note-fuzzer-delta-is-triage-not-impact'] } },
  ]; }
  function installCards() { const lane = ensureLane('web-fuzzing', 'Web Fuzzing', 'Initial Access & Web'); if (!lane) return false; let after = 'web-proxy-transform-proof-chain'; for (const card of buildCards()) { publishCard(lane, after, card); after = card.id; } return CARD_IDS.every((id) => liveCard(id)); }
  function noteById(id) { const notes = root.OBOL_NOTE_INTEGRATION && Array.isArray(root.OBOL_NOTE_INTEGRATION.publicFieldNotes) ? root.OBOL_NOTE_INTEGRATION.publicFieldNotes : []; return notes.find((note) => note && note.id === id) || null; }
  function upsertPublicNotes() { const prev = root.OBOL_NOTE_INTEGRATION; if (!prev || !Array.isArray(prev.publicFieldNotes)) return false; const byId = new Map(prev.publicFieldNotes.map((note) => [note && note.id, note]).filter((pair) => pair[0])); for (const note of PUBLIC_NOTES) byId.set(note.id, note); root.OBOL_NOTE_INTEGRATION = freezeObject({ ...prev, publicFieldNotes: freezeList(Array.from(byId.values())), __burpIntruderReminingV965: true }); return true; }
  function installEvidenceIngestion() {
    const T = root.OBOL_INTAKE_V21;
    if (!T || typeof T.analyzeTerminal !== 'function') return false;
    if (T.analyzeTerminal.__burpIntruderReminingV965) return true;
    const original = T.analyzeTerminal;
    try { T.analyzeTerminal = function burpIntruderAnalyzeTerminal(text) { const result = original.apply(this, arguments) || {}; const analysis = analyzeWebFuzzerOutput(text); if (analysis.matchCount) { const activities = Array.isArray(result.activities) ? result.activities.slice() : []; activities.push(freezeObject({ id: 'evidence-web-fuzzer-' + analysis.snippetHash, cardId: 'burp-intruder-fuzzing-workflow', title: 'Web fuzzer evidence reviewed', result: analysis.outcomeFacts.includes('web.fuzzer_hit_candidate_observed') || analysis.outcomeFacts.includes('web.fuzzer_response_delta_observed') ? 'interesting' : 'triage', summary: analysis.warnings[0] || 'Fuzzer output needs request-position and manual-replay proof.', facts: analysis.outcomeFacts })); result.activities = activities; result.webFuzzerEvidence65 = analysis; } return result; }; T.analyzeTerminal.__burpIntruderReminingV965 = true; return true; } catch (_err) { return false; }
  }
  function updateProgress() {
    const base = root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS;
    const current = base && base.remining;
    if (!base || !current || (!Array.isArray(current.auditRows) && !Array.isArray(current.remineAuditRows))) return false;
    const key = (row) => String(row.reviewWave || '') + ':' + String(row.noteId || '');
    const auditRows = freezeList(Array.from(current.auditRows || current.remineAuditRows || []).concat(Array.from(REMINE_AUDIT_ROWS)).filter((row, index, list) => list.findIndex((entry) => key(entry) === key(row)) === index));
    root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = freezeObject({ ...base, remining: freezeObject({ ...current, sourceTotal: 135, reviewed: 135, oldRubricReviewed: 135, dimensions: freezeList(unique(Array.from(current.dimensions || []).concat(Array.from(DIMENSIONS)))), allowedOutcomes: freezeList(unique(Array.from(current.allowedOutcomes || []).concat(Array.from(OUTCOMES)))), auditRows, remineAuditRows: auditRows, audited: Math.max(Number(current.audited || 0), 67), reminedNoteCount: Math.max(Number(current.reminedNoteCount || 0), 67), oldRubricOnlyRemaining: 68, latestWave: WAVE, latestSelectorBatch: SOURCE_CONFIDENCE.selectorBatch, latestSelectorBatchProgress: freezeObject({ selected: 4, target: 20, remainingInBatch: 16 }), evidenceIngestionBuilt: freezeList(unique(Array.from(current.evidenceIngestionBuilt || []).concat(['burp-intruder-fuzzing-workflow']))) }) });
    return true;
  }
  function updateQueue() { const q = root.OBOL_PRODUCT_HARDENING; if (!q || !Array.isArray(q.items)) return false; const item = q.items.find((entry) => entry && entry.id === ITEM_ID); if (!item) return false; item.status = 'queued'; item.latestPartialRemineWave = WAVE; item.latestPartialRemineProof = PROOF_FILE; item.latestPartialRemineOutputIds = freezeList(PUBLIC_NOTES.map((note) => note.id)); item.latestPartialRemineDetail = 'v9.65 re-mined the fourth selected old-rubric note into Burp Intruder/web-fuzzer position, transform, response-delta, tool-choice, Evidence analyzer, path-placement, and visible card-route logic. The full re-mining gate remains open.'; return true; }
  function validate() { const failures = []; for (const note of PUBLIC_NOTES) if (!noteById(note.id)) failures.push('Missing public field note ' + note.id); for (const id of CARD_IDS) { const card = liveCard(id); if (!card) failures.push('Missing live card route ' + id); else { if (!card.prereq || !card.produces || !card.expected || !card.lane) failures.push('Live card lacks path shape ' + id); if (card.sourceMinedRouteGuard64 && !card.sourceMined65) failures.push('Live card is generic route-guard fallback ' + id); } } return freezeList(failures); }
  function settled(result) { return !!(result && result.notesIntegrated && result.cardsInstalled && result.progressIntegrated && result.queueIntegrated && !result.failures.length); }
  function integrate() { const notesIntegrated = upsertPublicNotes(); const cardsInstalled = installCards(); const evidenceInstalled = installEvidenceIngestion(); const progressIntegrated = updateProgress(); const queueIntegrated = updateQueue(); const failures = validate(); root.OBOL_BURP_INTRUDER_REMINING_V965 = freezeObject({ wave: WAVE, status: failures.length ? 'partial' : 'live-integrated', notesIntegrated, cardsInstalled, evidenceInstalled, progressIntegrated, queueIntegrated, failures, cardIds: freezeList(CARD_IDS), noteIds: freezeList(PUBLIC_NOTES.map((note) => note.id)) }); return root.OBOL_BURP_INTRUDER_REMINING_V965; }

  const packet = freezeObject({ wave: WAVE, status: 'live-integrated', queueItemId: ITEM_ID, sourceConfidence: SOURCE_CONFIDENCE, publicNotes: PUBLIC_NOTES, productChanges: PRODUCT_CHANGES, remineAuditRows: REMINE_AUDIT_ROWS, cardIds: freezeList(CARD_IDS), analyzeWebFuzzerOutput, analyzeEvidenceText, integrate, validate });
  root.OBOL_BURP_INTRUDER_REMINING_PACKET_V965 = packet;
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
