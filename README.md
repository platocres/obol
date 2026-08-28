# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. All engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, or exploits targets. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v2.6

v2.6 works directly down the remaining v2.5 agent to-do list. The focus is not adding more disconnected commands. It is making the evidence ledger more reusable and more semantically precise once real terminal output starts accumulating.

### First-class typed artifacts

Intake can now preserve more than users, hashes, and credentials. v2.6 extracts and stores additional operator objects as typed artifacts:

- hosts and IP addresses
- SMB/UNC shares
- URLs
- files and paths
- Kerberos ticket material such as `.ccache` and `.kirbi`
- certificate material such as `.pfx`, `.p12`, `.pem`, `.crt`, and `.cer`
- internal subnets
- candidate secrets and tokens

These objects retain context and provenance in the browser workspace instead of disappearing into pasted evidence.

Compatible artifacts also get a direct **Use** handoff. A host can populate `target`, a URL can populate `url`, a share can populate `share`, file/ticket/certificate artifacts can populate `file`, subnets can populate `subnet`, and candidate secrets can populate `password` or `hash` as appropriate. This keeps command construction tied to evidence already collected instead of forcing repeated manual transcription.

Sanitized workspace export redacts typed candidate secrets.

### Stronger negative-evidence semantics

A failed attempt no longer has to mean one undifferentiated thing.

Expanded cards now let the operator classify a non-successful attempt as:

- attempted / no conclusion
- tool or environment failure
- inconclusive evidence
- service rejected technique
- underlying hypothesis refuted

Path treats those differently. A tool failure remains retryable with very little ranking penalty. Inconclusive results remain testable. Service rejection is penalized more heavily. A hypothesis explicitly marked refuted is removed from the normal Path view while remaining visible in show-all methodology views.

This avoids teaching the planner that a broken local dependency disproves an attack hypothesis, while also preventing truly refuted branches from endlessly resurfacing.

### Workspace search

v2.6 adds a lightweight Search view across the active context. Search covers:

- facts and fact evidence
- typed artifacts
- activity history and command snapshots
- Queue notes
- methodology cards
- command text and tool names

Search is local-only and does not change Path ranking or execute anything.

### Reporting

Reports now add compact summaries for typed-artifact counts and negative-evidence classifications when either exists in the active context. Candidate secret values are not emitted by these summaries.

### Foundations retained

- Host/domain-scoped facts, evidence, activity, credentials, and progress.
- Supported/refuted/inconclusive knowledge semantics.
- Evidence-ranked Path with information gain, downstream unlocks, workflow depth, and coverage gaps.
- Persistent operator Queue with priority, notes, done/deferred state, and report history.
- Maneuver-first methodology with preferred tools and practical fallbacks.
- Kali-aware install/verification help without executing anything.
- Semantic command builders with grouped controls, presets, and optional advanced switches.
- Nmap host/OS/domain enrichment and LDAP/NetExec username distillation.
- Evidence-to-artifact handoffs for users and hashes.
- Offline script library with filtering, contextual guidance, builders, and one-click copy.
- AD methodology decision map and MachineAccountQuota/RBCD readiness coverage.
- ANSI/prompt/terminal normalization before Intake matching.
- Compromise-chain reporting, secret redaction, OSCP mode, evidence/screenshot readiness, Queue history, and methodology coverage.
- Browser-local state and sanitized workspace export.

### To-Do - For Agents

Completed or materially advanced in v2.6:

- Improve artifact typing beyond users/hashes/credentials.
- Let artifact objects hand off into compatible command parameters.
- Add stronger negative-evidence semantics for tool failure, rejection, inconclusive evidence, and true refutation.
- Add a lightweight workspace search across facts, artifacts, activity, Queue notes, cards, and commands.
- Preserve typed secret redaction in sanitized export.

Next priorities:

- Continue the switch-coverage audit for long-tail tools, but only add controls that materially change operator intent or scope.
- Add specialized builders for remaining multi-step scripts where real runtime choices exist.
- Expand Intake normalization and extraction for BloodHound, Certipy, NetExec modules, Impacket, PEAS, web fuzzers, database clients, shell transcripts, and mixed multi-command paste sessions.
- Add richer artifact relationships so an object can retain which command/activity produced it and which later action consumed it.
- Improve direct artifact-to-builder integration so compatible artifacts can populate specific command option fields, not only shared engagement parameters.
- Expand post-foothold network modeling around interfaces, routes, discovered hosts, pivots, and internal service visibility.
- Continue methodology depth around credential reuse, AD trust/delegation/certificate paths, service-specific enumeration, and reporting evidence requirements.
- Add transcript regression fixtures derived from messy real-world terminal formatting and mixed-command sessions.
- Add search filters for artifact type, source, context, activity result, and time when the workspace becomes large enough to need them.
- Keep this to-do list current as new gaps are found.

## Run locally

Open `index.html` in a browser. No server or package install is required.

## GitHub Pages

The repository is designed to serve directly from `main` and `/ (root)`.

## Regression tests

```bash
node tests/run-tests.js
node tests/run-v2.1-tests.js
node tests/run-v2.2-tests.js
node tests/run-v2.3-tests.js
node tests/run-v2.4-tests.js
node tests/run-v2.5-tests.js
node tests/run-v2.6-tests.js
```

The v2.6 suite covers release-state initialization, typed artifact extraction/deduplication, artifact-to-parameter handoffs, sanitized secret redaction, negative-evidence persistence, refuted-vs-retryable Path behavior, and cross-workspace search. GitHub Actions runs all regression suites on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
