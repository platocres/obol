'use strict';

(function initPassTheHashReminingV964(root) {
  const WAVE = 'v9.64-pass-the-hash-remine';
  const ITEM_ID = 'notes-mechanic-backfill';
  const THEME_ID = 'pass-the-hash-protocol-scope';
  const PROOF_FILE = 'data/product-hardening/pass-the-hash-remining-v9.64.js';

  function freezeList(list) { return Object.freeze((list || []).slice()); }
  function freezeObject(value) { return Object.freeze(value || {}); }
  function unique(list) { return Array.from(new Set((list || []).filter(Boolean))); }
  function has(text, pattern) { return pattern.test(String(text || '')); }
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

  const CARD_IDS = freezeList([
    'pass-the-hash-proof-chain',
    'pth-remote-exec-artifacts',
    'pth-token-filtering-check',
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
    selectedNoteIds: freezeList(['htb-penetration-tester-29b80edb4523461f']),
    selectorBatch: 'notes-batch-old-rubric-reviewed-remine-001',
    privateBoundary: 'The Pass-the-Hash source note was re-read from the complete packet route. Public output keeps generalized NTLM material class, protocol scope, host-level validation, remote execution artifacts, token-filtering, cleanup, and reporting logic only.',
  });

  const PUBLIC_NOTES = freezeList([
    freezeObject({
      id: 'note-pth-is-protocol-scoped-auth-material',
      title: 'Pass-the-Hash is protocol-scoped auth material',
      body: 'An NT hash is reusable authentication material for compatible NTLM paths, not a plaintext password and not a universal login token. Before moving the path, record the material class, identity, domain or local-account scope, protocol, target service, and exact authentication result.',
      kind: 'path-guidance',
      cardIds: freezeList(['pass-the-hash-proof-chain', 'auth-material-scope-analyzer']),
      toolIds: freezeList(['nxc', 'crackmapexec', 'impacket-psexec', 'impacket-wmiexec', 'evil-winrm', 'mimikatz']),
      pathIds: freezeList(['path']),
      tags: freezeList(['credential', 'ntlm', 'pass-the-hash', 'proof-boundary', 'protocol-scope']),
      sourceRefs: freezeList(['htb-penetration-tester-29b80edb4523461f']),
      reviewWave: WAVE,
    }),
    freezeObject({
      id: 'note-pth-success-is-host-and-privilege-scoped',
      title: 'PtH success is host and privilege scoped',
      body: 'A successful hash-based login proves only the observed identity, protocol, host, and privilege level. Writable administrative shares, service-control access, WinRM shell access, or a remote command result are stronger facts than a generic login banner, but none of them proves access everywhere else.',
      kind: 'evidence',
      cardIds: freezeList(['pass-the-hash-proof-chain', 'credential-validation-safety-slot']),
      toolIds: freezeList(['nxc', 'evil-winrm', 'impacket-psexec', 'impacket-wmiexec', 'impacket-smbexec']),
      pathIds: freezeList(['path']),
      tags: freezeList(['credential', 'validation', 'local-admin', 'remote-exec', 'evidence']),
      sourceRefs: freezeList(['htb-penetration-tester-29b80edb4523461f']),
      reviewWave: WAVE,
    }),
    freezeObject({
      id: 'note-pth-remote-exec-leaves-artifacts',
      title: 'Remote execution by hash leaves artifacts',
      body: 'Hash-based remote execution commonly creates observable artifacts such as uploaded binaries, temporary services, service-control events, remote processes, new local users, or reverse-shell callbacks. Treat command execution, shell receipt, cleanup, and reporting as separate states instead of collapsing them into a single credential win.',
      kind: 'cleanup',
      cardIds: freezeList(['pth-remote-exec-artifacts', 'pass-the-hash-proof-chain']),
      toolIds: freezeList(['impacket-psexec', 'impacket-smbexec', 'Invoke-TheHash', 'mimikatz']),
      pathIds: freezeList(['path']),
      tags: freezeList(['credential', 'remote-exec', 'service-artifact', 'cleanup', 'reporting']),
      sourceRefs: freezeList(['htb-penetration-tester-29b80edb4523461f']),
      reviewWave: WAVE,
    }),
    freezeObject({
      id: 'note-pth-local-admin-token-filtering-check',
      title: 'Check token filtering before judging local-account PtH',
      body: 'Local administrator hash reuse can be blocked or reshaped by remote UAC and local-account token filtering. A failure may mean protocol mismatch, insufficient rights, token filtering, disabled WinRM or SMB reachability, or account policy. Keep the tested account type and host policy explicit before deciding the hash is useless.',
      kind: 'troubleshooting',
      cardIds: freezeList(['pth-token-filtering-check', 'pass-the-hash-proof-chain']),
      toolIds: freezeList(['nxc', 'crackmapexec', 'reg', 'powershell', 'evil-winrm']),
      pathIds: freezeList(['path']),
      tags: freezeList(['credential', 'local-account', 'uac', 'token-filtering', 'troubleshooting']),
      sourceRefs: freezeList(['htb-penetration-tester-29b80edb4523461f']),
      reviewWave: WAVE,
    }),
  ]);

  const PRODUCT_CHANGES = freezeList([
    'field-note:note-pth-is-protocol-scoped-auth-material',
    'field-note:note-pth-success-is-host-and-privilege-scoped',
    'field-note:note-pth-remote-exec-leaves-artifacts',
    'field-note:note-pth-local-admin-token-filtering-check',
    'evidence-parser-change:pass-the-hash-output-analyzer',
    'path-guidance:pass-the-hash-proof-chain',
    'live-card:pass-the-hash-proof-chain',
    'live-card:pth-remote-exec-artifacts',
    'live-card:pth-token-filtering-check',
  ]);

  function decision(outcome, fields) { return freezeObject({ outcome, ...(fields || {}) }); }
  const REMINE_AUDIT_ROWS = freezeList([
    freezeObject({
      noteId: 'htb-penetration-tester-29b80edb4523461f',
      title: 'Pass-the-Hash protocol and execution proof chain',
      theme: THEME_ID,
      reviewWave: WAVE,
      originalSourceReread: true,
      sourceRoute: SOURCE_CONFIDENCE.sourceRoute,
      sourcePackets: SOURCE_CONFIDENCE.sourcePackets,
      pathNodesConsidered: freezeList(['path', 'pass-the-hash-proof-chain', 'pth-remote-exec-artifacts', 'pth-token-filtering-check']),
      outputIds: freezeList(PUBLIC_NOTES.map((note) => note.id)),
      productChanges: PRODUCT_CHANGES,
      decisions: freezeObject({
        'path-bindings': decision('added', { proofRefs: freezeList(['note-pth-is-protocol-scoped-auth-material', 'pass-the-hash-proof-chain']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path', 'pass-the-hash-proof-chain']), actualPathIntegrated: true, note: 'Bound PtH material, validation, token-filtering, and remote-execution artifact logic to live path/card contexts.' }),
        'tool-cards': decision('added', { proofRefs: freezeList(['note-pth-success-is-host-and-privilege-scoped', 'note-pth-remote-exec-leaves-artifacts']), changedOwners: freezeList([PROOF_FILE]), toolIds: freezeList(['nxc', 'crackmapexec', 'impacket-psexec', 'impacket-wmiexec', 'impacket-smbexec', 'evil-winrm', 'mimikatz', 'Invoke-TheHash']), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Tool guidance now distinguishes hash validation, remote execution, local-account scope, and cleanup expectations without copying source commands.' }),
        'gui-controls': decision('covered', { ownerIds: freezeList(['credential-validation-safety-slot', 'auth-material-scope-analyzer']), note: 'v9.58 already added the credential validation safety slot and auth material analyzer control; this note feeds those controls with PtH-specific expectations.' }),
        'scripts-one-liners': decision('private-only', { reason: 'The source includes lab-specific hosts, users, hashes, reverse-shell payloads, answer strings, and exact command sequences. Public Obol keeps generalized command shape and proof requirements only.' }),
        'command-templates': decision('added', { proofRefs: freezeList(['pass-the-hash-proof-chain']), changedOwners: freezeList([PROOF_FILE]), toolIds: freezeList(['nxc', 'evil-winrm', 'impacket-psexec', 'impacket-wmiexec']), pathIds: freezeList(['pass-the-hash-proof-chain']), actualPathIntegrated: true, note: 'Added placeholder-based, human-reviewed command shapes for validating hash material and comparing remote-exec paths without source-specific values.' }),
        'terminal-analyzers': decision('added', { proofRefs: freezeList(['pass-the-hash-output-analyzer']), changedOwners: freezeList([PROOF_FILE]), analyzerIds: freezeList(['pass-the-hash-output-analyzer']), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Added conservative output classification for PtH attempts, NT hash material, remote admin indicators, execution artifacts, auth failures, and token-filtering hints.' }),
        'evidence-expectations': decision('added', { proofRefs: freezeList(['note-pth-is-protocol-scoped-auth-material', 'note-pth-success-is-host-and-privilege-scoped', 'pass-the-hash-output-analyzer']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'The note now preserves material class, protocol scope, host identity, validation response, command-exec state, and cleanup state as separate facts.' }),
        'path-movement': decision('added', { proofRefs: freezeList(['pass-the-hash-output-analyzer']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Evidence can move the operator toward validation, token-filtering checks, or remote-exec cleanup without promoting a hash-shaped value to broad access.' }),
        'lesson-boxes': decision('added', { proofRefs: freezeList(PUBLIC_NOTES.map((note) => note.id)), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Added field-note lessons for protocol scope, scoped success, remote-exec artifacts, and token-filtering failure interpretation.' }),
        examples: decision('private-only', { reason: 'Concrete examples include source-specific hosts, identities, answer strings, hashes, and payload bodies. Public examples use synthetic placeholders and redaction checks.' }),
        troubleshooting: decision('added', { proofRefs: freezeList(['note-pth-local-admin-token-filtering-check', 'pass-the-hash-output-analyzer']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['pth-token-filtering-check']), actualPathIntegrated: true, note: 'Token filtering, protocol mismatch, service reachability, insufficient rights, and lockout/failure scope are now separate troubleshooting states.' }),
        cleanup: decision('added', { proofRefs: freezeList(['note-pth-remote-exec-leaves-artifacts']), changedOwners: freezeList([PROOF_FILE]), pathIds: freezeList(['pth-remote-exec-artifacts']), actualPathIntegrated: true, note: 'Remote-exec artifacts such as temporary services, uploads, created users, and callback plumbing are tracked separately from credential validation.' }),
        'report-guidance': decision('added', { proofRefs: freezeList(['note-pth-success-is-host-and-privilege-scoped', 'note-pth-remote-exec-leaves-artifacts']), changedOwners: freezeList([PROOF_FILE]), reportIds: freezeList(['Pass-the-Hash Scoped Authentication', 'Hash-Based Remote Execution Artifact Review']), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'Reports should name hash material class, tested service, identity, host, privilege result, and cleanup status without exposing raw secrets.' }),
        'product-mechanics': decision('added', { proofRefs: freezeList(PRODUCT_CHANGES), changedOwners: freezeList([PROOF_FILE, 'data/current-release.js', 'tools/scope-check.js']), pathIds: freezeList(['path']), actualPathIntegrated: true, note: 'The release self-integrates notes, live cards, Evidence analysis, progress, queue metadata, and current-release registration.' }),
        'product-gaps': decision('covered', { ownerIds: freezeList(['credential-validation-safety-slot', 'auth-material-scope-analyzer', 'validate-product-hardening-card-routes']), note: 'The route-visibility gap found in v9.62 is now guarded; this PtH note reuses the safety/analyzer controls while adding concrete live cards.' }),
        'orange-baseline': decision('covered', { ownerIds: freezeList(['path', 'credentials', 'authentication']), note: 'Existing credential/authentication path semantics remain the baseline; v9.64 adds stricter PtH proof boundaries and route-visible cards.' }),
      }),
    }),
  ]);

  function addMatch(matches, id, label, fact) {
    matches.push(freezeObject({ id, label, fact }));
  }

  function analyzePassTheHashOutput(text) {
    const raw = String(text || '');
    const body = raw.toLowerCase();
    const matches = [];
    if (has(raw, /\b(?:pass[- ]the[- ]hash|sekurlsa::pth|\/pth\b|-H\s+[A-Fa-f0-9]{32}\b|-hashes\s+:[A-Fa-f0-9]{32}\b|Invoke-(?:SMBExec|WMIExec)|impacket-(?:psexec|wmiexec|smbexec|atexec)|crackmapexec\s+smb|\bnxc\s+smb|evil-winrm[\s\S]*\s-H\s+[A-Fa-f0-9]{32}\b)/i)) addMatch(matches, 'pth-attempt', 'Pass-the-Hash attempt observed', 'auth.pass_the_hash_attempt_observed');
    if (has(raw, /\b(?:NTLM|NTHASH|NT hash|\/rc4:|-H\s+|-hashes\s+:)[\s\S]{0,80}\b[A-Fa-f0-9]{32}\b/i)) addMatch(matches, 'nt-hash-material', 'NT hash material observed', 'auth.nt_hash_material_observed');
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

    const recommendedNextState = outcomeFacts.includes('auth.remote_execution_artifact_observed')
      ? 'record-scoped-remote-exec-and-cleanup'
      : outcomeFacts.includes('auth.remote_admin_indicator_observed')
        ? 'record-scoped-admin-proof-before-expanding'
        : outcomeFacts.includes('auth.failure_or_lockout_signal_observed') || outcomeFacts.includes('auth.token_filtering_or_restricted_admin_observed')
          ? 'troubleshoot-protocol-policy-or-token-filtering'
          : outcomeFacts.includes('auth.nt_hash_material_observed') || outcomeFacts.includes('auth.pass_the_hash_attempt_observed')
            ? 'validate-hash-against-one-scoped-service'
            : 'no-pass-the-hash-signal';

    return freezeObject({
      analyzerId: 'pass-the-hash-output-analyzer',
      matchCount: matches.length,
      matches: freezeList(matches),
      outcomeFacts,
      warnings: freezeList(warnings),
      recommendedNextState,
      redactedSnippet: redact(raw),
      snippetHash: hash(redact(raw)),
    });
  }

  function noteById(id) {
    const notes = root.OBOL_NOTE_INTEGRATION && Array.isArray(root.OBOL_NOTE_INTEGRATION.publicFieldNotes)
      ? root.OBOL_NOTE_INTEGRATION.publicFieldNotes
      : [];
    return notes.find((note) => note && note.id === id) || null;
  }
  function noteText(ids, fallback) {
    const chunks = ids.map(noteById).filter(Boolean).map((note) => {
      const title = note.title ? note.title + ': ' : '';
      return title + String(note.body || '').trim();
    }).filter(Boolean);
    return chunks.length ? chunks.join(' ') : fallback;
  }
  function liveCard(id) {
    if (!id) return null;
    if (typeof root.liveCardById === 'function') {
      try { return root.liveCardById(id); } catch (_err) { return null; }
    }
    if (root.CARDS && root.CARDS[id]) return root.CARDS[id];
    const lanes = Array.isArray(root.OBOL_LANES) ? root.OBOL_LANES : Array.isArray(root.LANES) ? root.LANES : [];
    for (const lane of lanes) for (const card of lane.cards || []) if (card && card.id === id) return card;
    return null;
  }
  function ensureLane(id, title, phase) {
    if (typeof root.laneById === 'function') return root.laneById(id, title, phase);
    const lanes = Array.isArray(root.OBOL_LANES) ? root.OBOL_LANES : Array.isArray(root.LANES) ? root.LANES : [];
    let lane = lanes.find((entry) => entry && entry.lane === id);
    if (!lane) {
      lane = { lane: id, title: title || id, phase: phase || title || id, cards: [] };
      lanes.push(lane);
    }
    if (!Array.isArray(lane.cards)) lane.cards = [];
    if (Array.isArray(root.OBOL_LANES)) root.OBOL_LANES = lanes;
    else root.LANES = lanes;
    return lane;
  }
  function publishCard(lane, afterId, card) {
    if (!lane || !card || liveCard(card.id)) return false;
    card.lane = card.lane || lane.lane;
    if (typeof root.addCardAfter === 'function') return root.addCardAfter(lane, afterId, card);
    if (!Array.isArray(lane.cards)) lane.cards = [];
    const index = lane.cards.findIndex((entry) => entry && entry.id === afterId);
    lane.cards.splice(index >= 0 ? index + 1 : lane.cards.length, 0, card);
    if (root.CARDS && typeof root.CARDS === 'object') root.CARDS[card.id] = card;
    return true;
  }

  function buildCards() {
    return [
      freezeObject({
        id: 'pass-the-hash-proof-chain',
        lane: 'credentials',
        title: 'Pass-the-Hash Proof Chain',
        hypothesis: noteText(['note-pth-is-protocol-scoped-auth-material', 'note-pth-success-is-host-and-privilege-scoped'], 'Treat an NT hash as protocol-scoped authentication material. Preserve material class, identity, local or domain scope, protocol, target service, result, privilege level, and cleanup state as separate proof steps.'),
        prereq: freezeObject({ any: freezeList(['credential.material', 'auth.nt_hash_material_observed', 'credential.candidate']) }),
        produces: freezeList(['credential.hash_validation_scoped', 'auth.pass_the_hash_attempt_observed']),
        commands: freezeList([
          freezeObject({ tool: 'nxc', run: 'nxc smb {{target}} -u {{user}} -H {{hash}} --local-auth', note: 'Validate one local-account NT hash against one SMB target. Remove --local-auth for a domain-scoped account only when the domain scope is proven.' }),
          freezeObject({ tool: 'evil-winrm', run: 'evil-winrm -i {{target}} -u {{user}} -H {{hash}}', note: 'Use only when WinRM is reachable and hash-based auth is in scope. A shell proves this host/service/account context, not universal access.' }),
          freezeObject({ tool: 'impacket-psexec', run: 'impacket-psexec {{domain}}/{{user}}@{{target}} -hashes :{{hash}}', note: 'Remote execution path. Record writable share, service creation, shell, and cleanup artifacts separately.' }),
          freezeObject({ tool: 'impacket-wmiexec', run: 'impacket-wmiexec {{domain}}/{{user}}@{{target}} -hashes :{{hash}}', note: 'Compare WMI behavior when SMB login works but service creation or ADMIN$ behavior differs.' }),
        ]),
        expected: freezeList(['hash material class recorded', 'one target service validated', 'success or failure scoped to identity/host/protocol', 'remote-exec artifact state recorded when applicable']),
        defender: 'PtH validation and remote execution can generate network logon events, share access, service-control events, process creation, and WinRM activity. Keep attempts bounded and human-reviewed.',
        report: freezeObject({ finding: 'Pass-the-Hash Scoped Authentication', severity: 'high' }),
        tools: freezeList(['nxc', 'evil-winrm', 'impacket-psexec', 'impacket-wmiexec', 'mimikatz', 'Invoke-TheHash']),
        refs: freezeList([]),
        sourceMined64: freezeObject({ proof: PROOF_FILE, notes: freezeList(['note-pth-is-protocol-scoped-auth-material', 'note-pth-success-is-host-and-privilege-scoped']) }),
      }),
      freezeObject({
        id: 'pth-remote-exec-artifacts',
        lane: 'credentials',
        title: 'Review PtH Remote Execution Artifacts',
        hypothesis: noteText(['note-pth-remote-exec-leaves-artifacts'], 'Remote execution by hash should be tracked as artifact-producing behavior: upload, service creation, process launch, shell receipt, created accounts, deleted services, and cleanup evidence are separate states.'),
        prereq: freezeObject({ any: freezeList(['auth.remote_admin_indicator_observed', 'auth.remote_execution_artifact_observed']) }),
        produces: freezeList(['auth.remote_exec_artifacts_reviewed', 'cleanup.remote_exec_recorded']),
        commands: freezeList([]),
        expected: freezeList(['temporary service or process identified', 'uploaded file or command effect recorded', 'cleanup status recorded', 'report keeps raw secret redacted']),
        defender: 'Service creation, ADMIN$ writes, WMI process creation, and callback traffic are high-signal. Record them honestly instead of hiding them behind a credential-only finding.',
        report: freezeObject({ finding: 'Hash-Based Remote Execution Artifact Review', severity: 'high' }),
        tools: freezeList(['impacket-psexec', 'impacket-smbexec', 'impacket-wmiexec', 'Invoke-TheHash', 'mimikatz']),
        refs: freezeList([]),
        sourceMined64: freezeObject({ proof: PROOF_FILE, notes: freezeList(['note-pth-remote-exec-leaves-artifacts']) }),
      }),
      freezeObject({
        id: 'pth-token-filtering-check',
        lane: 'credentials',
        title: 'Check PtH Token Filtering and Account Scope',
        hypothesis: noteText(['note-pth-local-admin-token-filtering-check'], 'When a hash works in one place but not another, keep local-account scope, domain scope, remote UAC behavior, restricted-admin settings, service reachability, and lockout policy separate before judging the material.'),
        prereq: freezeObject({ any: freezeList(['auth.failure_or_lockout_signal_observed', 'auth.token_filtering_or_restricted_admin_observed', 'auth.local_account_scope_observed']) }),
        produces: freezeList(['auth.pth_scope_troubleshot']),
        commands: freezeList([]),
        expected: freezeList(['account scope identified', 'protocol and service checked', 'token-filtering or restricted-admin state considered', 'failure not over-generalized']),
        defender: 'Troubleshooting should not become broad spraying. Keep the next test narrow and preserve the policy context.',
        report: freezeObject({ finding: 'PtH Scope and Token Filtering Review', severity: 'medium' }),
        tools: freezeList(['nxc', 'crackmapexec', 'evil-winrm', 'reg', 'powershell']),
        refs: freezeList([]),
        sourceMined64: freezeObject({ proof: PROOF_FILE, notes: freezeList(['note-pth-local-admin-token-filtering-check']) }),
      }),
    ];
  }

  function installCards() {
    const cards = buildCards();
    const credentialLane = ensureLane('credentials', 'Credential Attacks', 'Credential Attacks');
    if (!credentialLane) return false;
    let after = 'auth-material-scope-analyzer';
    for (const card of cards) {
      publishCard(credentialLane, after, card);
      after = card.id;
    }
    const installed = cards.filter((card) => liveCard(card.id)).length;
    root.OBOL_PASS_THE_HASH_CARD_IDS_V964 = freezeList(CARD_IDS);
    return installed === cards.length;
  }

  function upsertPublicNotes() {
    const prev = root.OBOL_NOTE_INTEGRATION || {};
    const existing = Array.isArray(prev.publicFieldNotes) ? Array.from(prev.publicFieldNotes) : [];
    const byId = new Map(existing.map((note) => [note && note.id, note]).filter((pair) => pair[0]));
    for (const note of PUBLIC_NOTES) byId.set(note.id, note);
    root.OBOL_NOTE_INTEGRATION = freezeObject({
      ...prev,
      publicFieldNotes: freezeList(Array.from(byId.values())),
      __passTheHashReminingV964: true,
    });
    return true;
  }

  function installEvidenceIngestion() {
    const T = root.OBOL_INTAKE_V21;
    if (!T || typeof T.analyzeTerminal !== 'function' || T.analyzeTerminal.__passTheHashReminingV964) return false;
    const original = T.analyzeTerminal;
    try {
      T.analyzeTerminal = function passTheHashAnalyzeTerminal(text) {
        const result = original.apply(this, arguments) || {};
        const analysis = analyzePassTheHashOutput(text);
        if (analysis.matchCount) {
          result.passTheHashEvidence64 = analysis;
          const activities = Array.isArray(result.activities) ? result.activities.slice() : [];
          activities.push(freezeObject({
            id: 'evidence-pass-the-hash-' + analysis.snippetHash,
            cardId: 'pass-the-hash-proof-chain',
            title: 'Pass-the-Hash evidence reviewed',
            result: analysis.outcomeFacts.includes('auth.remote_execution_artifact_observed') || analysis.outcomeFacts.includes('auth.remote_admin_indicator_observed') ? 'interesting' : 'triage',
            summary: analysis.warnings[0] || 'Hash-based authentication evidence needs scoped validation.',
            facts: analysis.outcomeFacts,
          }));
          result.activities = activities;
        }
        return result;
      };
      T.analyzeTerminal.__passTheHashReminingV964 = true;
      return true;
    } catch (_err) {
      return false;
    }
  }

  function updateProgress() {
    const base = root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS || {};
    const current = base.remining || {};
    const priorRows = Array.from(current.auditRows || []);
    const rowKey = (row) => String(row.reviewWave || '') + ':' + String(row.noteId || '');
    const seen = new Set();
    const auditRows = freezeList(priorRows.concat(Array.from(REMINE_AUDIT_ROWS)).filter((row) => {
      const key = rowKey(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }));
    const remineAuditRows = freezeList(Array.from(current.remineAuditRows || []).concat(Array.from(REMINE_AUDIT_ROWS)).filter((row, index, list) => list.findIndex((entry) => rowKey(entry) === rowKey(row)) === index));
    root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = freezeObject({
      ...base,
      remining: freezeObject({
        ...current,
        dimensions: freezeList(unique(Array.from(current.dimensions || []).concat(Array.from(DIMENSIONS)))),
        auditRows,
        remineAuditRows,
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
    const items = q.items.map((item) => item && item.id === ITEM_ID ? freezeObject({
      ...item,
      status: 'queued',
      latestPartialRemineWave: WAVE,
      latestPartialRemineProof: PROOF_FILE,
      latestPartialRemineOutputIds: freezeList(PUBLIC_NOTES.map((note) => note.id)),
      detail: 'v9.64 re-mined the third selected old-rubric note into PtH protocol-scope, validation, remote-exec artifact, token-filtering, Evidence analyzer, and visible card-route logic. The full re-mining gate remains open.',
    }) : item);
    root.OBOL_PRODUCT_HARDENING = freezeObject({ ...q, items: freezeList(items) });
    return true;
  }

  function validate() {
    const failures = [];
    for (const note of PUBLIC_NOTES) if (!noteById(note.id)) failures.push('Missing public field note ' + note.id);
    for (const id of CARD_IDS) if (!liveCard(id)) failures.push('Missing live card route ' + id);
    return freezeList(failures);
  }

  function integrate() {
    const notes = upsertPublicNotes();
    const cards = installCards();
    const evidence = installEvidenceIngestion();
    const progress = updateProgress();
    const queue = updateQueue();
    const failures = validate();
    root.OBOL_PASS_THE_HASH_REMINING_V964 = freezeObject({
      wave: WAVE,
      status: failures.length ? 'partial' : 'live-integrated',
      notes,
      cards,
      evidence,
      progress,
      queue,
      failures,
      cardIds: freezeList(CARD_IDS),
      noteIds: freezeList(PUBLIC_NOTES.map((note) => note.id)),
    });
    return root.OBOL_PASS_THE_HASH_REMINING_V964;
  }

  const packet = freezeObject({
    wave: WAVE,
    status: 'live-integrated',
    queueItemId: ITEM_ID,
    sourceConfidence: SOURCE_CONFIDENCE,
    publicNotes: PUBLIC_NOTES,
    productChanges: PRODUCT_CHANGES,
    remineAuditRows: REMINE_AUDIT_ROWS,
    cardIds: CARD_IDS,
    analyzePassTheHashOutput,
    integrate,
    validate,
  });

  root.OBOL_PASS_THE_HASH_REMINING_PACKET_V964 = packet;
  integrate();
  if (typeof window !== 'undefined') {
    let tries = 0;
    const schedule = typeof window.setTimeout === 'function' ? window.setTimeout.bind(window) : null;
    const attempt = () => {
      const result = integrate();
      tries += 1;
      if (result.failures.length && tries < 160 && schedule) schedule(attempt, 50);
    };
    if (schedule) schedule(attempt, 0);
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('hashchange', attempt);
      window.addEventListener('focus', attempt);
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = packet;
})(typeof window !== 'undefined' ? window : globalThis);
