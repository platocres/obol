# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. All engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, or exploits targets. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v2.7

v2.7 continues the evidence-reuse work from v2.6. Typed artifacts are no longer just preserved objects that can populate a shared parameter. This release starts tracking where evidence objects came from, where they were reused, how they feed specific command fields, and what post-foothold network visibility the operator has actually established.

### Artifact lineage

Typed artifacts now retain lightweight producer and consumer relationships.

- Repeated observations of the same artifact merge provenance instead of discarding the later source.
- Artifacts distilled from card evidence can retain the card and copied-command context that produced them.
- Shared-parameter handoffs record consumption history.
- Direct command-field bindings also record which card/command consumed the artifact.
- Intake shows compact produced/consumed counts without exposing candidate-secret values.
- Reports include a lineage summary showing how much captured evidence was later reused.

The goal is a reproducible evidence graph: not only "we found this host/share/file," but also "this evidence came from here and influenced this later operator action."

### Direct artifact-to-command bindings

v2.6 added a generic **Use** handoff into shared engagement parameters. v2.7 goes deeper.

Expanded methodology cards now inspect their command placeholders and semantic option fields for compatible typed artifacts already present in the active context. When a match exists, an **Evidence inputs** panel can bind that artifact directly into the relevant field.

Examples include:

- host artifacts → target/host fields
- URLs → URL/endpoint fields
- shares → share/UNC fields
- files, tickets, and certificates → path/file/ticket/certificate fields
- subnets → subnet/network/route fields
- candidate secrets → password/hash/token fields when compatible

This keeps command construction tied to previously observed evidence instead of requiring another round of transcription.

### Post-foothold internal network visibility

Intake now recognizes more network structure from shell transcripts and tool output:

- Linux interfaces and `inet` addresses
- Windows adapter/IPv4 output
- Linux route-table entries including routed internal CIDRs
- Windows route-table rows
- NetExec-style service observations for common protocols

Reviewed observations are stored in a context-scoped internal network model. Path can surface an **Internal network visibility** card showing observed interfaces, routes, subnets, hosts, and service visibility without pretending that an unobserved route exists.

Route CIDRs and service hosts can also feed the typed-artifact workspace for later handoff.

### Mixed transcript structure and regression fixtures

v2.7 starts testing Intake against a realistic mixed terminal session rather than only isolated strings.

- Common Bash, PowerShell, and cmd-style prompt boundaries are segmented into command/output blocks.
- Evidence matching can still operate across the complete paste while Obol preserves command boundaries for provenance and regression work.
- A committed mixed-session fixture exercises interfaces, routes, NetExec output, Windows networking, Certipy output, certificate files, and web requests in one transcript.

### Search filters

Workspace Search now supports practical filters for larger engagements:

- object type
- typed-artifact family
- source
- activity result
- age window

Filters remain browser-local and do not change Path ranking.

### Reporting

Reports now add compact summaries for:

- evidence lineage and artifact reuse
- internal network visibility

Existing typed-artifact and negative-evidence summaries remain intact. Candidate-secret values are not emitted by these summaries.

### Foundations retained

- Host/domain-scoped facts, evidence, activity, credentials, and progress.
- Supported/refuted/inconclusive knowledge semantics.
- Evidence-ranked Path with information gain, downstream unlocks, workflow depth, and coverage gaps.
- Persistent operator Queue with priority, notes, done/deferred state, and report history.
- Maneuver-first methodology with preferred tools and practical fallbacks.
- Kali-aware install/verification help without executing anything.
- Semantic command builders with grouped controls, presets, and optional advanced switches.
- Nmap host/OS/domain enrichment and LDAP/NetExec username distillation.
- First-class typed artifacts and evidence-to-command handoffs.
- Offline script library with filtering, contextual guidance, builders, and one-click copy.
- AD methodology decision map and MachineAccountQuota/RBCD readiness coverage.
- ANSI/prompt/terminal normalization before Intake matching.
- Strong negative-evidence semantics for tool failure, inconclusive results, service rejection, and true refutation.
- Compromise-chain reporting, secret redaction, OSCP mode, evidence/screenshot readiness, Queue history, methodology coverage, typed-artifact summaries, and lineage/network summaries.
- Browser-local state and sanitized workspace export.

### To-Do - For Agents

Completed or materially advanced in v2.7:

- Add richer artifact relationships between producing evidence and later consuming actions.
- Improve direct artifact-to-builder integration beyond shared engagement parameters.
- Expand post-foothold network modeling around interfaces, routes, discovered hosts, and internal service visibility.
- Add search filters for object type, artifact family, source, activity result, and time.
- Add a committed mixed-terminal regression fixture and command/output segmentation.

Next priorities:

- Continue the switch-coverage audit for long-tail tools, but only add controls that materially change operator intent or scope.
- Add specialized builders for remaining multi-step scripts where real runtime choices exist.
- Expand Intake normalization and extraction for more BloodHound, Certipy, NetExec module, Impacket, PEAS, web-fuzzer, database-client, and shell edge cases.
- Grow the transcript fixture corpus across Linux, Windows, AD, web, database, and pivoting sessions, including malformed/partial output.
- Make artifact lineage easier to inspect as a graph or chronological chain and support jumping from an artifact to its producer/consumer activity.
- Make network modeling pivot-aware so routes, interfaces, and discovered subnets can influence which enumeration actions are relevant to which host/context without assuming reachability.
- Track explicit pivot/tunnel state and distinguish directly reachable, pivot-reachable, and merely observed internal services.
- Continue methodology depth around credential reuse, AD trusts, delegation, certificate paths, service-specific enumeration, and post-foothold evidence requirements.
- Tie reporting readiness more directly to artifact provenance, successful state transitions, and required screenshot/evidence captures.
- Continue improving direct artifact bindings for commands whose option semantics cannot be inferred safely from labels/placeholders alone.
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
node tests/run-v2.7-tests.js
```

The v2.7 suite covers release-state initialization, producer/consumer artifact lineage, direct artifact-to-command option binding, mixed-transcript command segmentation, Linux/Windows interface and route extraction, NetExec-style service visibility, network-model deduplication, and filtered workspace search. GitHub Actions runs all regression suites on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
