'use strict';

(function initPassTheHashReminingV964(root) {
  const WAVE = 'v9.64-pass-the-hash-remine';
  const ITEM_ID = 'notes-mechanic-backfill';
  const NOTE_ID = 'htb-penetration-tester-29b80edb4523461f';
  const PROOF_FILE = 'data/product-hardening/pass-the-hash-remining-v9.64.js';
  const CARD_IDS = Object.freeze(['pass-the-hash-proof-chain', 'pth-remote-exec-artifacts', 'pth-token-filtering-check']);
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
      .replace(/\b[A-Fa-f0-9]{32}:\S+/g, '[ntlm-hash]:[redacted-secret]')
      .replace(/\b[A-Fa-f0-9]{32,128}\b/g, '[hash-or-secret-material]')
      .replace(/(-e\s+)[A-Za-z0-9+/=]{40,}/gi, '$1[base64-redacted]')
      .replace(/(password|passwd|pwd|token|secret|api[_-]?key)\s*[:=]\s*([^\s;&|]+)/gi, '$1=[redacted]')
      .replace(/(net\s+user\s+)([^\s]+)\s+([^\s]+)(\s+\/add)/gi, '$1[local-user] [redacted-password]$4')
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
    privateBoundary: 'The Pass-the-Hash source note was re-read from the complete packet route. Public output keeps generalized NTLM material class, protocol scope, host-level validation, remote execution artifacts, token-filtering, cleanup, and reporting logic only.',
  });

  const PUBLIC_NOTES = freezeList([
    freezeObject({ id: 'note-pth-is-protocol-scoped-auth-material', title: 'Pass-the-Hash is protocol-scoped auth material', body: 'An NT hash is reusable authentication material for compatible NTLM paths, not a plaintext password and not a universal login token. Before moving the path, record the material class, identity, domain or local-account scope, protocol, target service, and exact authentication result.', kind: 'path-guidance', cardIds: freezeList(['pass-the-hash-proof-chain', 'auth-material-scope-analyzer']), toolIds: freezeList(['nxc', 'crackmapexec', 'impacket-psexec', 'impacket-wmiexec', 'evil-winrm', 'mimikatz']), pathIds: freezeList(['path']), tags: freezeList(['credential', 'ntlm', 'pass-the-hash', 'proof-boundary', 'protocol-scope']), sourceRefs: freezeList([NOTE_ID]), reviewWave: WAVE }),
    freezeObject({ id: 'note-pth-success-is-host-and-privilege-scoped', title: 'PtH success is host and privilege scoped', body: 'A successful hash-based login proves only the observed identity, protocol, host, and privilege level. Writable administrative shares, service-control access, WinRM shell access, or a remote command result are stronger facts than a generic login banner, but none of them proves access everywhere else.', kind: 'evidence', cardIds: freezeList(['pass-the-hash-proof-chain', 'credential-validation-safety-slot']), toolIds: freezeList(['nxc', 'evil-winrm', 'impacket-psexec', 'impacket-wmiexec', 'impacket-smbexec']), pathIds: freezeList(['path']), tags: freezeList(['credential', 'validation', 'local-admin', 'remote-exec', 'evidence']), sourceRefs: freezeList([NOTE_ID]), reviewWave: WAVE }),
    freezeObject({ id: 'note-pth-remote-exec-leaves-artifacts', title: 'Remote execution by hash leaves artifacts', body: 'Hash-based remote execution commonly creates observable artifacts such as uploaded binaries, temporary services, service-control events, remote processes, new local users, or reverse-shell callbacks. Treat command execution, shell receipt, cleanup, and reporting as separate states instead of collapsing them into a single credential win.', kind: 'cleanup', cardIds: freezeList(['pth-remote-exec-artifacts', 'pass-the-hash-proof-chain']), toolIds: freezeList(['impacket-psexec', 'impacket-smbexec', 'Invoke-TheHash', 'mimikatz']), pathIds: freezeList(['path']), tags: freezeList(['credential', 'remote-exec', 'service-artifact', 'cleanup', 'reporting']), sourceRefs: freezeList([NOTE_ID]), reviewWave: WAVE }),
    freezeObject({ id: 'note-pth-local-admin-token-filtering-check', title: 'Check token filtering before judging local-account PtH', body: 'Local administrator hash reuse can be blocked or reshaped by remote UAC and local-account token filtering. A failure may mean protocol mismatch, insufficient rights, token filtering, disabled WinRM or SMB reachability, or account policy. Keep the tested account type and host policy explicit before deciding the hash is useless.', kind: 'troubleshooting', cardIds: freezeList(['pth-token-filtering-check', 'pass-the-hash-proof-chain']), toolIds: freezeList(['nxc', 'crackmapexec', 'reg', 'powershell', 'evil-winrm']), pathIds: freezeList(['path']), tags: freezeList(['credential', 'local-account', 'uac', 'token-filtering', 'troubleshooting']), sourceRefs: freezeList([NOTE_ID]), reviewWave: WAVE }),
  ]);

  const PRODUCT_CHANGES = freezeList(['field-note:note-pth-is-protocol-scoped-auth-material', 'field-note:note-pth-success-is-host-and-privilege-scoped', 'field-note:note-pth-remote-exec-leaves-artifacts', 'field-note:note-pth-local-admin-token-filtering-check', 'evidence-parser-change:pass-the-hash-output-analyzer', 'path-guidance:pass-the-hash-proof-chain', 'live-card:pass-the-hash-proof-chain', 'live-card:pth-remote-exec-artifacts', 'live-card:pth-token-filtering-check']);

  function decision(outcome, fields) { return freezeObject({ outcome, ...(fields || {}) }); }
  const REMINE_AUDIT_ROWS = freezeList([freezeObject({
    noteId: NOTE_ID,
    title: 'Pass-the-Hash protocol and execution proof chain',
    theme: 'pass-the-hash-protocol-scope',
    reviewWave: WAVE,
    originalSourceReread: true,
    sourceRoute: SOURCE_CONFIDENCE.sourceRoute,
    sourcePackets: SOURCE_CONFIDENCE.sourcePackets,
    pathNodesConsidered: freezeList(['path', 'pass-the-hash-proof-chain', 'pth-remote-exec-artifacts', 'pth-token-filtering-check']),
    outputIds: freezeList(PUBLIC_NOTES.map((note) => note.id)),
    productChanges: PRODUCT_CHANGES,
    decisions: freezeObject({
      'path-bindings': decision('added', { proofRefs: freezeList(['note-pth-is-protocol-scoped-auth-material', 'pass-the-hash-proof-chain']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path', 'pass-the-hash-proof-chain']), actualPathIntegrated: true }),
      'tool-cards': decision('added', { proofRefs: freezeList(['note-pth-success-is-host-and-privilege-scoped', 'note-pth-remote-exec-leaves-artifacts']), changedOwners: freezeList([PROOF_FILE]), toolIds: freezeList(['nxc', 'crackmapexec', 'impacket-psexec', 'impacket-wmiexec', 'impacket-smbexec', 'evil-winrm', 'mimikatz', 'Invoke-TheHash']), pathIds: freezeList(['path']), actualPathIntegrated: true }),
      'gui-controls': decision('covered', { ownerIds: freezeList(['credential-validation-safety-slot', 'auth-material-scope-analyzer']), note: 'Existing credential validation and material-class controls own the UI slot.' }),
      'scripts-one-liners': decision('private-only', { reason: 'The source includes lab-specific hosts, users, hashes, reverse-shell payloads, answer strings, and exact command sequences. Public Obol keeps generalized command shape and proof requirements only.' }),
      'command-templates': decision('added', { proofRefs: freezeList(['pass-the-hash-proof-chain']), changedOwners: freezeList([PROOF_FILE]), toolIds: freezeList(['nxc', 'evil-winrm', 'impacket-psexec', 'impacket-wmiexec']), pathIds: freezeList(['pass-the-hash-proof-chain']), actualPathIntegrated: true }),
      'terminal-analyzers': decision('added', { proofRefs: freezeList(['pass-the-hash-output-analyzer']), changedOwners: freezeList([PROOF_FILE]), analyzerIds: freezeList(['pass-the-hash-output-analyzer']), pathIds: freezeList(['path']), actualPathIntegrated: true }),
      'evidence-expectations': decision('added', { proofRefs: freezeList(['note-pth-is-protocol-scoped-auth-material', 'note-pth-success-is-host-and-privilege-scoped', 'pass-the-hash-output-analyzer']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path']), actualPathIntegrated: true }),
      'path-movement': decision('added', { proofRefs: freezeList(['pass-the-hash-output-analyzer']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path']), actualPathIntegrated: true }),
      'lesson-boxes': decision('added', { proofRefs: freezeList(PUBLIC_NOTES.map((note) => note.id)), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path']), actualPathIntegrated: true }),
      examples: decision('private-only', { reason: 'Concrete examples include source-specific hosts, identities, answer strings, hashes, and payload bodies. Public examples use synthetic placeholders and redaction checks.' }),
      troubleshooting: decision('added', { proofRefs: freezeList(['note-pth-local-admin-token-filtering-check', 'pass-the-hash-output-analyzer']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['pth-token-filtering-check']), actualPathIntegrated: true }),
      cleanup: decision('added', { proofRefs: freezeList(['note-pth-remote-exec-leaves-artifacts']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['pth-remote-exec-artifacts']), actualPathIntegrated: true }),
      'report-guidance': decision('added', { proofRefs: freezeList(['note-pth-success-is-host-and-privilege-scoped', 'note-pth-remote-exec-leaves-artifacts']), changedOwners: freezeList([PROOF_FILE]), reportIds: freezeList(['Pass-the-Hash Scoped Authentication', 'Hash-Based Remote Execution Artifact Review']), pathIds: freezeList(['path']), actualPathIntegrated: true }),
      'product-mechanics': decision('added', { proofRefs: PRODUCT_CHANGES, changedOwners: freezeList([PROOF_FILE, 'data/current-release.js', 'tools/scope-check.js']), pathIds: freezeList(['path']), actualPathIntegrated: true }),
      'product-gaps': decision('covered', { ownerIds: freezeList(['credential-validation-safety-slot', 'auth-material-scope-analyzer', 'validate-product-hardening-card-routes']), note: 'The route-visibility guard now protects note-derived card IDs.' }),
      'orange-baseline': decision('covered', { ownerIds: freezeList(['path', 'credentials', 'authentication']), note: 'Existing credential/authentication path semantics remain the baseline.' }),
    }),
  })]);

  function addMatch(matches, id, label, fact) { matches.push(freezeObject({ id, label, fact })); }
  function analyzePassTheHashOutput(text) {
    const raw = String(text || '');
    const matches = [];
    if (has(raw, /(?:\b(?:pass[- ]the[- ]hash|sekurlsa::pth|\/pth\b|Invoke-(?:SMBExec|WMIExec)|impacket-(?:psexec|wmiexec|smbexec|atexec)|crackmapexec\s+smb|nxc\s+smb)\b|(?:^|\s)(?:-H\s+[A-Fa-f0-9]{32}\b|-hashes\s+:\s*[A-Fa-f0-9]{32}\b)|evil-winrm[\s\S]*\s-H\s+[A-Fa-f0-9]{32}\b)/i)) addMatch(matches, 'pth-attempt', 'Pass-the-Hash attempt observed', 'auth.pass_the_hash_attempt_observed');
    if (has(raw, /(?:\b(?:NTLM|NTHASH|NT hash|\/rc4:)\b[\s\S]{0,80}\b[A-Fa-f0-9]{32}\b|(?:^|\s)(?:-H\s+|-hashes\s+:\s*)[A-Fa-f0-9]{32}\b)/i)) addMatch(matches, 'nt-hash-material', 'NT hash material observed', 'auth.nt_hash_material_observed');
    if (has(raw, /\b(?:mimikatz|sekurlsa::pth|password replace|msv1_0\s+-\s+data copy|kerberos\s+-\s+data copy)/i)) addMatch(matches, 'windows-token-injection-path', 'Windows PtH token/process path observed', 'auth.windows_pth_process_context_observed');
    if (has(raw, /\b(?:Found writable share ADMIN\$|Opening SVCManager|Creating service|Starting service|Service Control Manager write|has Service Control Manager write privilege|Pwn3d!|local admin|ADMIN\$)/i)) addMatch(matches, 'remote-admin-indicator', 'Remote admin indicator observed', 'auth.remote_admin_indicator_observed');
    if (has(raw, /\b(?:Command executed|process id|Microsoft Windows \[Version|C:\\Windows\\system32>|PS C:\\|shell connection|reverse shell connection|uploaded file|Service [A-Za-z0-9_-]+ (?:created|deleted))/i)) addMatch(matches, 'remote-exec-artifact', 'Remote execution artifact observed', 'auth.remote_execution_artifact_observed');
    if (has(raw, /\b(?:STATUS_LOGON_FAILURE|STATUS_ACCESS_DENIED|ACCESS_DENIED|authentication failed|login failed|account locked|locked out|NT_STATUS_LOGON_FAILURE)/i)) addMatch(matches, 'auth-failure-or-lockout', 'Authentication failure or lockout signal observed', 'auth.failure_or_lockout_signal_observed');
    if (has(raw, /\b(?:LocalAccountTokenFilterPolicy|FilterAdministratorToken|remote UAC|token filtering|Restricted Admin|DisableRestrictedAdmin|EnableLUA)/i)) addMatch(matches, 'token-filtering-or-restricted-admin', 'Token filtering or restricted-admin condition observed', 'auth.token_filtering_or_restricted_admin_observed');
    if (has(raw, /\b(?:--local-auth|domain:\s*\.|local account|workgroup|\.\\[A-Za-z0-9._-]+)/i)) addMatch(matches, 'local-account-scope', 'Local account scope observed', 'auth.local_account_scope_observed');
    const outcomeFacts = freezeList(unique(matches.map((match) => match.fact)));
    const warnings = [];
    if (outcomeFacts.includes('auth.nt_hash_material_observed')) warnings.push('NT hash material is not plaintext and not access by itself. Keep protocol, identity, target host, and service validation separate.');
    if (outcomeFacts.includes('auth.remote_admin_indicator_observed')) warnings.push('Remote admin proof is scoped to the observed host, identity, service, and privilege level; do not generalize it to the whole domain.');
    if (outcomeFacts.includes('auth.remote_execution_artifact_observed')) warnings.push('Remote execution can leave uploaded binaries, temporary services, local users, or callback artifacts. Record cleanup separately from the credential result.');
    if (outcomeFacts.includes('auth.failure_or_lockout_signal_observed')) warnings.push('Failure is scoped to the tested service, identity, and moment. Check policy, protocol, token filtering, and reachability before discarding the material.');
    if (outcomeFacts.includes('auth.token_filtering_or_restricted_admin_observed')) warnings.push('Remote UAC, token filtering, and restricted-admin settings can change PtH behavior, especially for local administrator accounts.');
    if (outcomeFacts.includes('auth.pass_the_hash_attempt_observed') && !outcomeFacts.includes('auth.remote_admin_indicator_observed') && !outcomeFacts.includes('auth.remote_execution_artifact_observed')) warnings.push('A PtH command or module invocation is only an attempt until an authentication or server-side behavior response is captured.');
    const recommendedNextState = outcomeFacts.includes('auth.remote_execution_artifact_observed') ? 'record-scoped-remote-exec-and-cleanup' : outcomeFacts.includes('auth.remote_admin_indicator_observed') ? 'record-scoped-admin-proof-before-expanding' : outcomeFacts.includes('auth.failure_or_lockout_signal_observed') || outcomeFacts.includes('auth.token_filtering_or_restricted_admin_observed') ? 'troubleshoot-protocol-policy-or-token-filtering' : outcomeFacts.includes('auth.nt_hash_material_observed') || outcomeFacts.includes('auth.pass_the_hash_attempt_observed') ? 'validate-hash-against-one-scoped-service' : 'no-pass-the-hash-signal';
    const redactedSnippet = redact(raw);
    return freezeObject({ analyzerId: 'pass-the-hash-output-analyzer', matchCount: matches.length, matches: freezeList(matches), outcomeFacts, warnings: freezeList(warnings), recommendedNextState, redactedSnippet, snippetHash: hash(redactedSnippet) });
  }

  function liveCard(id) {
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
    if (!lane) { lane = { lane: id, title: title || id, phase: phase || title || id, cards: [] }; lanes.push(lane); }
    if (!Array.isArray(lane.cards)) lane.cards = [];
    if (Array.isArray(root.OBOL_LANES)) root.OBOL_LANES = lanes; else root.LANES = lanes;
    return lane;
  }
  function publishCard(lane, afterId, card) {
    if (!lane || !card || liveCard(card.id)) return false;
    const row = { ...card, lane: card.lane || lane.lane };
    if (typeof root.addCardAfter === 'function') return root.addCardAfter(lane, afterId, row);
    const index = lane.cards.findIndex((entry) => entry && entry.id === afterId);
    lane.cards.splice(index >= 0 ? index + 1 : lane.cards.length, 0, row);
    if (root.CARDS && typeof root.CARDS === 'object') root.CARDS[row.id] = row;
    return true;
  }
  function buildCards() {
    return [
      { id: 'pass-the-hash-proof-chain', lane: 'credentials', title: 'Pass-the-Hash Proof Chain', hypothesis: 'Treat an NT hash as protocol-scoped authentication material. Preserve material class, identity, local or domain scope, protocol, target service, result, privilege level, and cleanup state as separate proof steps.', prereq: { any: ['credential.material', 'auth.nt_hash_material_observed', 'credential.candidate'] }, produces: ['credential.hash_validation_scoped', 'auth.pass_the_hash_attempt_observed'], commands: [
        { tool: 'nxc', run: 'nxc smb {{target}} -u {{user}} -H {{hash}} --local-auth', note: 'Validate one local-account NT hash against one SMB target. Remove --local-auth for a domain-scoped account only when the domain scope is proven.' },
        { tool: 'evil-winrm', run: 'evil-winrm -i {{target}} -u {{user}} -H {{hash}}', note: 'Use only when WinRM is reachable and hash-based auth is in scope. A shell proves this host/service/account context, not universal access.' },
        { tool: 'impacket-psexec', run: 'impacket-psexec {{domain}}/{{user}}@{{target}} -hashes :{{hash}}', note: 'Remote execution path. Record writable share, service creation, shell, and cleanup artifacts separately.' },
        { tool: 'impacket-wmiexec', run: 'impacket-wmiexec {{domain}}/{{user}}@{{target}} -hashes :{{hash}}', note: 'Compare WMI behavior when SMB login works but service creation or ADMIN$ behavior differs.' },
      ], expected: ['hash material class recorded', 'one target service validated', 'success or failure scoped to identity/host/protocol', 'remote-exec artifact state recorded when applicable'], defender: 'PtH validation and remote execution can generate network logon events, share access, service-control events, process creation, and WinRM activity. Keep attempts bounded and human-reviewed.', report: { finding: 'Pass-the-Hash Scoped Authentication', severity: 'high' }, tools: ['nxc', 'evil-winrm', 'impacket-psexec', 'impacket-wmiexec', 'mimikatz', 'Invoke-TheHash'], refs: [], sourceMined64: { proof: PROOF_FILE, notes: ['note-pth-is-protocol-scoped-auth-material', 'note-pth-success-is-host-and-privilege-scoped'] } },
      { id: 'pth-remote-exec-artifacts', lane: 'credentials', title: 'Review PtH Remote Execution Artifacts', hypothesis: 'Remote execution by hash should be tracked as artifact-producing behavior: upload, service creation, process launch, shell receipt, created accounts, deleted services, and cleanup evidence are separate states.', prereq: { any: ['auth.remote_admin_indicator_observed', 'auth.remote_execution_artifact_observed'] }, produces: ['auth.remote_exec_artifacts_reviewed', 'cleanup.remote_exec_recorded'], commands: [], expected: ['temporary service or process identified', 'uploaded file or command effect recorded', 'cleanup status recorded', 'report keeps raw secret redacted'], defender: 'Service creation, ADMIN$ writes, WMI process creation, and callback traffic are high-signal. Record them honestly instead of hiding them behind a credential-only finding.', report: { finding: 'Hash-Based Remote Execution Artifact Review', severity: 'high' }, tools: ['impacket-psexec', 'impacket-smbexec', 'impacket-wmiexec', 'Invoke-TheHash', 'mimikatz'], refs: [], sourceMined64: { proof: PROOF_FILE, notes: ['note-pth-remote-exec-leaves-artifacts'] } },
      { id: 'pth-token-filtering-check', lane: 'credentials', title: 'Check PtH Token Filtering and Account Scope', hypothesis: 'When a hash works in one place but not another, keep local-account scope, domain scope, remote UAC behavior, restricted-admin settings, service reachability, and lockout policy separate before judging the material.', prereq: { any: ['auth.failure_or_lockout_signal_observed', 'auth.token_filtering_or_restricted_admin_observed', 'auth.local_account_scope_observed'] }, produces: ['auth.pth_scope_troubleshot'], commands: [], expected: ['account scope identified', 'protocol and service checked', 'token-filtering or restricted-admin state considered', 'failure not over-generalized'], defender: 'Troubleshooting should not become broad spraying. Keep the next test narrow and preserve the policy context.', report: { finding: 'PtH Scope and Token Filtering Review', severity: 'medium' }, tools: ['nxc', 'crackmapexec', 'evil-winrm', 'reg', 'powershell'], refs: [], sourceMined64: { proof: PROOF_FILE, notes: ['note-pth-local-admin-token-filtering-check'] } },
    ];
  }
  function installCards() {
    const lane = ensureLane('credentials', 'Credential Attacks', 'Credential Attacks');
    if (!lane) return false;
    let after = 'auth-material-scope-analyzer';
    for (const card of buildCards()) { publishCard(lane, after, card); after = card.id; }
    return CARD_IDS.every((id) => liveCard(id));
  }
  function noteById(id) {
    const notes = root.OBOL_NOTE_INTEGRATION && Array.isArray(root.OBOL_NOTE_INTEGRATION.publicFieldNotes) ? root.OBOL_NOTE_INTEGRATION.publicFieldNotes : [];
    return notes.find((note) => note && note.id === id) || null;
  }
  function upsertPublicNotes() {
    const prev = root.OBOL_NOTE_INTEGRATION;
    if (!prev || !Array.isArray(prev.publicFieldNotes)) return false;
    const byId = new Map(prev.publicFieldNotes.map((note) => [note && note.id, note]).filter((pair) => pair[0]));
    for (const note of PUBLIC_NOTES) byId.set(note.id, note);
    root.OBOL_NOTE_INTEGRATION = freezeObject({ ...prev, publicFieldNotes: freezeList(Array.from(byId.values())), __passTheHashReminingV964: true });
    return true;
  }
  function installEvidenceIngestion() {
    const T = root.OBOL_INTAKE_V21;
    if (!T || typeof T.analyzeTerminal !== 'function') return false;
    if (T.analyzeTerminal.__passTheHashReminingV964) return true;
    const original = T.analyzeTerminal;
    try {
      T.analyzeTerminal = function passTheHashAnalyzeTerminal(text) {
        const result = original.apply(this, arguments) || {};
        const analysis = analyzePassTheHashOutput(text);
        if (analysis.matchCount) {
          const activities = Array.isArray(result.activities) ? result.activities.slice() : [];
          activities.push(freezeObject({ id: 'evidence-pass-the-hash-' + analysis.snippetHash, cardId: 'pass-the-hash-proof-chain', title: 'Pass-the-Hash evidence reviewed', result: analysis.outcomeFacts.includes('auth.remote_execution_artifact_observed') || analysis.outcomeFacts.includes('auth.remote_admin_indicator_observed') ? 'interesting' : 'triage', summary: analysis.warnings[0] || 'Hash-based authentication evidence needs scoped validation.', facts: analysis.outcomeFacts }));
          result.activities = activities;
          result.passTheHashEvidence64 = analysis;
        }
        return result;
      };
      T.analyzeTerminal.__passTheHashReminingV964 = true;
      return true;
    } catch (_err) { return false; }
  }
  function updateProgress() {
    const base = root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS;
    const current = base && base.remining;
    if (!base || !current || (!Array.isArray(current.auditRows) && !Array.isArray(current.remineAuditRows))) return false;
    const key = (row) => String(row.reviewWave || '') + ':' + String(row.noteId || '');
    const auditRows = freezeList(Array.from(current.auditRows || current.remineAuditRows || []).concat(Array.from(REMINE_AUDIT_ROWS)).filter((row, index, list) => list.findIndex((entry) => key(entry) === key(row)) === index));
    root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = freezeObject({
      ...base,
      remining: freezeObject({
        ...current,
        dimensions: freezeList(unique(Array.from(current.dimensions || []).concat(Array.from(DIMENSIONS)))),
        allowedOutcomes: freezeList(unique(Array.from(current.allowedOutcomes || []).concat(Array.from(OUTCOMES)))),
        auditRows,
        remineAuditRows: auditRows,
        audited: Math.max(Number(current.audited || 0), 66),
        reminedNoteCount: Math.max(Number(current.reminedNoteCount || 0), 66),
        oldRubricOnlyRemaining: Math.min(Number(current.oldRubricOnlyRemaining == null ? 69 : current.oldRubricOnlyRemaining), 69),
        latestWave: WAVE,
        latestSelectorBatch: SOURCE_CONFIDENCE.selectorBatch,
        latestSelectorBatchProgress: freezeObject({ selected: 3, target: 20, remainingInBatch: 17 }),
        evidenceIngestionBuilt: freezeList(unique(Array.from(current.evidenceIngestionBuilt || []).concat(['pass-the-hash-proof-chain']))),
      }),
    });
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
    item.latestPartialRemineDetail = 'v9.64 re-mined the third selected old-rubric note into PtH protocol-scope, validation, remote-exec artifact, token-filtering, Evidence analyzer, and visible card-route logic. The full re-mining gate remains open.';
    return true;
  }
  function validate() {
    const failures = [];
    for (const note of PUBLIC_NOTES) if (!noteById(note.id)) failures.push('Missing public field note ' + note.id);
    for (const id of CARD_IDS) if (!liveCard(id)) failures.push('Missing live card route ' + id);
    return freezeList(failures);
  }
  function settled(result) {
    return !!(result && result.notesIntegrated && result.cardsInstalled && result.progressIntegrated && result.queueIntegrated && !result.failures.length);
  }
  function integrate() {
    const notesIntegrated = upsertPublicNotes();
    const cardsInstalled = installCards();
    const evidenceInstalled = installEvidenceIngestion();
    const progressIntegrated = updateProgress();
    const queueIntegrated = updateQueue();
    const failures = validate();
    root.OBOL_PASS_THE_HASH_REMINING_V964 = freezeObject({ wave: WAVE, status: failures.length ? 'partial' : 'live-integrated', notesIntegrated, cardsInstalled, evidenceInstalled, progressIntegrated, queueIntegrated, failures, cardIds: freezeList(CARD_IDS), noteIds: freezeList(PUBLIC_NOTES.map((note) => note.id)) });
    return root.OBOL_PASS_THE_HASH_REMINING_V964;
  }

  const packet = freezeObject({ wave: WAVE, status: 'live-integrated', queueItemId: ITEM_ID, sourceConfidence: SOURCE_CONFIDENCE, publicNotes: PUBLIC_NOTES, productChanges: PRODUCT_CHANGES, remineAuditRows: REMINE_AUDIT_ROWS, cardIds: freezeList(CARD_IDS), analyzePassTheHashOutput, integrate, validate });
  root.OBOL_PASS_THE_HASH_REMINING_PACKET_V964 = packet;
  const first = integrate();
  if (typeof window !== 'undefined') {
    let tries = 0;
    const schedule = typeof window.setTimeout === 'function' ? window.setTimeout.bind(window) : null;
    const attempt = () => { const result = integrate(); tries += 1; if (!settled(result) && tries < 160 && schedule) schedule(attempt, 50); };
    if (!settled(first) && schedule) schedule(attempt, 0);
    if (typeof window.addEventListener === 'function') { window.addEventListener('hashchange', attempt); window.addEventListener('focus', attempt); }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = packet;
})(typeof window !== 'undefined' ? window : globalThis);
