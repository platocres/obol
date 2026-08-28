# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. All engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, or exploits targets. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v2.5

The v2 line continues moving Obol from a command catalog toward an evidence-aware operator workspace. v2.4 added the durable Queue so Path could remain dynamic while the operator preserved intent. v2.5 works directly down the agent to-do list added after that release: richer builders, script parameterization, broader methodology coverage, and better evidence normalization.

### Script builders

The offline Scripts library is no longer copy-only for the snippets that benefit from configuration.

- Contextual builders now exist for common reverse-shell, transfer, TTY, proof-snapshot, Ligolo, Chisel, PowerShell port-sweep, Windows privesc, and PEAS workflows.
- Builders expose relevant toggles, radio choices, and arguments instead of forcing the operator to edit a large snippet by hand.
- Shared engagement values such as `lhost` and `target` are consumed automatically when a builder needs them.
- Builder choices persist in the browser workspace.
- Scripts without a specialized builder still render their normal `{{parameter}}` placeholders from the current engagement state.

### Broader command-builder coverage

v2.5 expands semantic switches across methodology cards that previously had thin or no controls. Coverage now includes additional DNS, Kerberos user enumeration, SMB tooling, LDAP/AD tooling, SSH/RDP, BloodHound collection, Impacket families, and Certipy operations.

The goal is not to turn every card into a wall of flags. Controls are added where they materially change scope, authentication, collection depth, output preservation, networking, or troubleshooting.

### AD methodology decision map

The README to-do pointed agents at a broader Active Directory methodology map. v2.5 translates that idea into a compact in-app decision map instead of simply adding more disconnected cards.

The map groups the existing methodology into six evidence-aware stages:

- identify the domain and DC
- exploit zero/low-credential exposure
- perform credentialed directory mapping
- convert directory rights into control
- move laterally and validate privilege
- validate domain-control and trust-boundary paths

It links back to real Obol cards and shows recorded tried/succeeded state without replacing Path ranking. v2.5 also adds a dedicated MachineAccountQuota/RBCD-readiness card so that delegation paths depend on an observed precondition instead of an assumption.

Reports now include an optional methodology coverage snapshot for the active context.

### Evidence intake normalization

Intake now tolerates more of the ugly output that real terminal sessions produce before rule matching:

- ANSI color sequences
- common Bash, PowerShell, and cmd prompts
- carriage-return artifacts
- extra blank-line noise

v2.5 also adds recognition for additional evidence families including `sudo -l`, Windows privilege output, routing information, SMB share listings, AD password-policy/MachineAccountQuota evidence, and Certipy/AD CS findings. RPC-style username output is also distilled into the user artifact store.

As before, extracted facts remain proposals. The operator reviews them before application.

### Foundations retained

- Host/domain-scoped facts, evidence, activity, credentials, and progress.
- Supported/refuted/inconclusive knowledge semantics.
- Evidence-ranked Path with information gain, downstream unlocks, workflow depth, and coverage gaps.
- Persistent operator Queue with priority, notes, done/deferred state, and report history.
- Maneuver-first methodology with preferred tools and practical fallbacks.
- Kali-aware install/verification help without executing anything.
- Semantic command builders with grouped controls, presets, and optional advanced switches.
- Nmap host/OS/domain enrichment and LDAP/NetExec username distillation.
- Evidence-to-artifact handoffs for `users.txt` and `hashes.txt`.
- Offline script library with filtering, contextual guidance, builders, and one-click copy.
- Compromise-chain reporting, secret redaction, OSCP mode, evidence/screenshot readiness, operator queue history, and methodology coverage.
- Browser-local state and sanitized workspace export.

### To-Do - For Agents

Completed or materially advanced in v2.5:

- Add relevant switch controls to scripts where the snippet has meaningful variants or runtime choices.
- Make script builders consume engagement parameters like normal tool commands.
- Expand switch coverage across the remaining high-use tool families.
- Turn the external AD methodology inspiration into a structured Obol decision map rather than a disconnected command dump.
- Improve Intake normalization and recognize additional evidence families and edge cases.

Next priorities:

- Continue the switch-coverage audit for long-tail tools and avoid adding meaningless toggles simply for completeness.
- Add specialized builders for the remaining multi-step scripts when a real operator choice exists.
- Expand evidence normalization for more BloodHound, Certipy, NetExec module, Impacket, PEAS, web-fuzzer, database-client, and shell transcript edge cases.
- Improve artifact typing beyond users/hashes/credentials so Intake can preserve hosts, shares, URLs, files, tickets, certificate material, internal subnets, and candidate secrets as first-class objects.
- Let artifact objects hand off directly into compatible command fields without relying only on shared filename parameters.
- Add stronger negative-evidence semantics so Path can distinguish "tool failed", "service rejected this technique", and "the underlying hypothesis is actually refuted".
- Keep expanding methodology around service-specific depth, credential reuse, post-foothold network visibility, AD trust/delegation/certificate paths, and reporting evidence requirements.
- Add a lightweight workspace search/filter across facts, artifacts, activity, queue notes, cards, and commands.
- Add regression fixtures made from messy real-world terminal transcripts so Intake changes are tested against formatting noise and mixed-command sessions.
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
```

The v2.5 suite covers release-state initialization, persistent script-builder state, engagement-parameter rendering, AD decision-map coverage, additional command controls, transcript normalization, RPC username extraction, and the new evidence signature families. GitHub Actions runs all regression suites on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.