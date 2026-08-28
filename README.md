# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. All engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, creates pivots, or exploits targets. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v2.9

v2.9 turns the explicit-state foundations from v2.8 into better planning and reporting signals without relaxing the conservative evidence model. The release makes Path aware of operator-confirmed reachability, adds real pivot lifecycle state, links preserved artifacts into cross-artifact dependency chains, and evaluates successful actions against finding-specific proof obligations.

### Reachability-aware Path relevance

v2.8 distinguished direct, pivot-reachable, observed-only, and unknown network visibility. v2.9 now allows that explicit reachability state to influence Path ranking.

The rule remains conservative:

- an observed internal service alone does not receive a reachability boost
- a service card can receive a relevance boost only when an explicit active direct route or pivot covers the observed target
- pivot-specific methodology can be deprioritized when a pivot is already active
- broken pivot state can increase the relevance of repair/re-establishment work

Path now surfaces a compact **Reachability-aware Path signals** panel so the operator can see which recommendations moved and why.

### Pivot lifecycle

Explicit network paths now retain more operational context:

- active, inactive, or broken state
- source host / pivot host
- reachable destination CIDR
- tunnel or listener endpoint note
- free-form lifecycle note
- explicit last-verified timestamp

Path provides operator controls to mark a path verified, broken, active, inactive, or removed. A broken path is never treated as active reachability.

This is still a record of operator state. Obol does not create, repair, or test a tunnel itself.

### Cross-artifact dependency lineage

The Lineage view now exposes conservative dependency chains across multiple preserved artifacts.

When one artifact is recorded as consumed by a methodology card and another artifact is later recorded as produced by that same card, Obol can display a chain such as:

`host → SMB enumeration card → share`

The dependency view is derived only from recorded producer/consumer lineage. Candidate-secret values remain masked.

### Finding proof obligations

v2.8 required evidence, a command snapshot, and explicit screenshot confirmation for every successful activity. v2.9 adds proof obligations based on the material transition and finding context.

Examples include:

- credential transitions require preserved artifact provenance
- foothold and privilege transitions require operator-confirmed target identity visibility
- foothold and privilege transitions require operator-confirmed user/root/SYSTEM identity visibility
- privilege transitions can require explicit proof/local evidence confirmation
- network-transition successes require an explicit active network-path record
- methodology cards with finding metadata preserve the finding/severity context in readiness views

These checks are designed for OSCP-style evidence discipline without pretending Obol can inspect or validate a screenshot it has not been given.

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
- Explicit direct/pivot reachability state without inferred reachability.
- Strong negative-evidence semantics for tool failure, inconclusive results, service rejection, and true refutation.
- Workspace Search filters for object type, artifact family, source, result, and time.
- Browser-local state and sanitized workspace export.

### To-Do - For Agents

Completed or materially advanced in v2.9:

- Let explicit reachability influence Path relevance without promoting observed-only targets.
- Add stronger pivot lifecycle modeling for source host, destination network, endpoint notes, verification, and broken state.
- Add cross-artifact dependency chains to the Lineage experience.
- Improve report readiness with finding/transition-specific proof obligations and explicit OSCP-style screenshot-content confirmation.

Next priorities:

- Continue the switch-coverage audit for long-tail tools, but only add controls that materially change operator intent or scope.
- Add specialized builders for remaining multi-step scripts where real runtime choices exist.
- Expand Intake normalization and extraction for more BloodHound, Certipy, NetExec module, Impacket, PEAS, web-fuzzer, database-client, and shell edge cases.
- Grow the transcript fixture corpus across Linux, Windows, AD, web, database, and pivoting sessions, including malformed/partial output.
- Improve lineage beyond card-level dependency inference by linking consumers to exact activity IDs when that evidence exists.
- Add richer graph navigation for multi-hop artifact chains and compromise-path review.
- Make reachability relevance more target-specific when multiple internal subnets/services exist in one engagement context.
- Continue pivot-state depth around source-interface identity, listener health notes, and route-specific troubleshooting history.
- Continue methodology depth around credential reuse, AD trusts, delegation, certificate paths, service-specific enumeration, and post-foothold evidence requirements.
- Expand proof-readiness templates for finding categories while keeping all screenshot-content checks operator-confirmed.
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
node tests/run-v2.9-tests.js
```

The v2.9 suite covers release-state initialization, pivot lifecycle metadata, broken/verified path behavior, conservative reachability-aware relevance, broken-pivot repair relevance, cross-artifact dependency lineage, finding-specific foothold proof obligations, credential provenance requirements, and inherited sanitized-export redaction. GitHub Actions runs the complete regression chain on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
