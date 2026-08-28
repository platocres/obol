# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. All engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, or exploits targets. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v2.8

v2.8 takes the internal-network and artifact-lineage foundations from v2.7 and makes them operationally clearer. The main theme is explicit state: Obol now distinguishes evidence that was merely observed from evidence that is actually reachable through a direct route or an operator-recorded active pivot, exposes artifact producer/consumer history as a chronological view, and adds concrete reporting-readiness tracking for successful actions.

### Explicit reachability and pivot state

v2.7 could preserve internal interfaces, routes, subnets, hosts, and service observations. v2.8 adds a separate operator-controlled reachability layer.

Path now includes a **Reachability & pivots** panel where the operator can record a network path as either:

- directly reachable from the operator
- reachable through an explicit pivot or tunnel

Pivot/tunnel records can identify common mechanisms such as Ligolo, Chisel, SSH, SOCKS, port forwards, VPN paths, or another operator-defined method. Each record is context-scoped, can be activated/deactivated, and includes the reachable CIDR plus an optional endpoint/listener note.

Observed hosts and services are classified conservatively:

- **direct** — covered by an explicit active direct path, or the current host itself
- **pivot-reachable** — covered by an explicit active pivot/tunnel path
- **observed** — seen in evidence but not covered by any explicit active path
- **unknown** — no grounded visibility exists

Obol does not infer a pivot or promote an observed internal service to reachable merely because a route or subnet appeared in pasted output.

### Lineage explorer

v2.7 began recording lightweight producer and consumer relationships for typed artifacts. v2.8 makes those relationships inspectable.

A new **Lineage** view shows typed artifacts in the active context and lets the operator open a chronological chain for each object. The chain can include:

- producer source
- producer card
- captured command context
- later command/card consumers
- consumed field or parameter
- timestamps
- links back to related methodology cards

Candidate-secret values remain masked in the UI.

Intake artifact rows now include a **Trace** action that jumps directly to the artifact’s lineage history.

### Reporting readiness

The Report view now evaluates every successful activity in the active context against three concrete requirements:

- evidence snapshot recorded
- command snapshot recorded
- screenshot capture explicitly confirmed by the operator

The readiness panel shows which successful actions are complete, which are missing evidence or commands, and which still need screenshot confirmation. Screenshot state is never inferred automatically.

Reports also include compact summaries for:

- direct vs pivot-reachable vs merely observed internal visibility
- active explicit network paths
- successful-activity readiness counts

Existing lineage, typed-artifact, negative-evidence, Queue, methodology, and compromise-chain report sections remain intact.

### Foundations retained

- Host/domain-scoped facts, evidence, activity, credentials, and progress.
- Supported/refuted/inconclusive knowledge semantics.
- Evidence-ranked Path with information gain, downstream unlocks, workflow depth, and coverage gaps.
- Persistent operator Queue with priority, notes, done/deferred state, and report history.
- Maneuver-first methodology with preferred tools and practical fallbacks.
- Kali-aware install/verification help without executing anything.
- Semantic command builders with grouped controls, presets, and optional advanced switches.
- Nmap host/OS/domain enrichment and LDAP/NetExec username distillation.
- First-class typed artifacts and direct evidence-to-command handoffs.
- Producer/consumer artifact lineage with context-safe deduplication.
- Review-first typed-artifact and network-observation intake gates.
- Offline script library with filtering, contextual guidance, builders, and one-click copy.
- AD methodology decision map and MachineAccountQuota/RBCD readiness coverage.
- ANSI/prompt/terminal normalization and mixed-command transcript segmentation.
- Post-foothold interface, route, subnet, host, and service visibility modeling.
- Strong negative-evidence semantics for tool failure, inconclusive results, service rejection, and true refutation.
- Workspace Search filters for object type, artifact family, source, result, and time.
- Browser-local state and sanitized workspace export.

### To-Do - For Agents

Completed or materially advanced in v2.8:

- Make artifact lineage easier to inspect as a chronological chain and support jumping back to related cards.
- Make network modeling pivot-aware without assuming reachability from an observed route or subnet.
- Track explicit direct/pivot network-path state and distinguish direct, pivot-reachable, and merely observed internal services.
- Tie reporting readiness to evidence snapshots, command snapshots, artifact provenance context, and explicit screenshot confirmation.

Next priorities:

- Continue the switch-coverage audit for long-tail tools, but only add controls that materially change operator intent or scope.
- Add specialized builders for remaining multi-step scripts where real runtime choices exist.
- Expand Intake normalization and extraction for more BloodHound, Certipy, NetExec module, Impacket, PEAS, web-fuzzer, database-client, and shell edge cases.
- Grow the transcript fixture corpus across Linux, Windows, AD, web, database, and pivoting sessions, including malformed/partial output.
- Add richer lineage visualization across multiple artifacts and activities, including cross-artifact dependency chains.
- Let explicit reachability state influence Path relevance for pivot-specific enumeration without allowing unverified reachability assumptions.
- Add stronger pivot lifecycle modeling for listener/tunnel notes, source host, destination network, and inactive/broken states.
- Continue methodology depth around credential reuse, AD trusts, delegation, certificate paths, service-specific enumeration, and post-foothold evidence requirements.
- Improve report-readiness rules for finding-specific proof obligations and OSCP screenshot requirements.
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
node tests/run-v2.7-hardening-tests.js
node tests/run-v2.8-tests.js
```

The v2.8 suite covers release-state initialization, explicit direct/pivot reachability, conservative observed-only state, active/inactive pivot behavior, CIDR validation/deduplication, chronological producer/consumer lineage, report-readiness requirements, and inherited sanitized-export redaction. GitHub Actions runs the complete regression chain on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
