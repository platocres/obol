# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, evidence reviewer, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. The live site is served at `https://platocres.github.io/obol/`. It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. Engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, creates pivots, scans targets, or exploits systems. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v3.3

v3.3 is a command-behavior and usability audit. The trigger was a real UI failure: the **Anonymous LDAP Enumeration** card displayed a NetExec command with `--users` baked into the default even though user enumeration should be one selectable action among several. The same class of problem can happen anywhere a command card quietly decides scope, filtering, output, or enumeration intent for the operator.

v3.3 establishes a stricter rule:

> **The base command performs the minimum useful action for the maneuver. Optional enumeration, scope, performance, filtering, authentication, and output behavior belongs in explicit semantic controls unless that action is the maneuver itself.**

That rule is applied through the command data layer, so it affects generated commands, copy behavior, the Tool Library, Evidence handoff, recorded activity, and downstream reporting rather than just changing labels.

### LDAP correction

The NetExec baseline on **Anonymous LDAP Enumeration** is now:

```bash
nxc ldap {{target}} -u '' -p ''
```

It tests the anonymous bind and profiles the LDAP endpoint. Nothing else is silently selected.

The builder now exposes LDAP choices including:

- domain users
- active users
- user export to `users.txt`
- domain groups
- computers
- domain controllers
- domain SID
- password policy
- fine-grained password policy
- base-DN override

`--users` is therefore an option, not the meaning of the whole card. The card also explains the difference between its **baseline behavior** and the optional output controls.

The existing evidence flow remains connected. Pasted NetExec/LDAP user rows still feed the user artifact pipeline, and the resulting list can still become the shared `userlist` parameter. `--users-export` provides a direct clean-file route when that is more convenient.

### Tool-builder audit

v3.3 traverses the command inventory and classifies every Tool Library family as one of:

- **contract** — a reusable CLI where semantic controls can be applied consistently
- **dedicated builder** — a richer purpose-built interface such as the v3.1/v3.2 Nmap workflow
- **card-specific** — a multi-step or position-sensitive tool where generic flags would be more likely to generate bad commands than help
- **reviewed card-specific** — deliberately left at the card level rather than receiving speculative generic controls

This keeps the audit broad without pretending every CLI should have the same style of builder.

Shared option coverage is expanded or normalized for common enumeration and evidence-producing tools, including:

- NetExec protocol enumeration
- `ldapsearch`
- `ffuf`
- `feroxbuster`
- `gobuster`
- `wpscan`
- `nikto`
- `whatweb`
- `dnsrecon`
- `searchsploit`
- MySQL and PostgreSQL clients
- `redis-cli`
- AWS CLI
- `kubectl`

Earlier v2.x coverage remains in force for Nmap, curl, Hydra, Hashcat, John, Responder, SNMP, Kerbrute, BloodHound collection, Certipy, Impacket utilities, Evil-WinRM, SMB/RPC tools, and other existing builders.

### Output quality matters

The v3.3 pass is not just about adding switches. Where supported, builders now emphasize controls that make output easier to review and preserve:

- machine-readable or structured output formats
- explicit output files
- clean LDAP/terminal formatting
- response/status/size filters
- thread/rate/timeout controls
- database and cloud output shaping

That makes generated commands more useful to the rest of Obol because Evidence Intake and historical activity depend on readable, reproducible operator output.

### User-facing copy cleanup

Tool cards should explain methodology, not assume the reader recognizes a particular retired lab, write-up author, or private project shorthand. v3.3 removes user-facing references such as **“Forest-style”** and `0xdf`-specific shorthand from the active methodology copy while preserving the underlying technique.

The result is more understandable to somebody learning the workflow for the first time.

### UI behavior

The v3.3 UI adds a compact **Command behavior** block to commands that need explicit baseline-vs-option guidance. For Anonymous LDAP it tells the operator:

- what the command does with no selector enabled
- that nothing is silently enumerated
- what output types have been selected
- how the output connects back into Evidence and the user-list pipeline

The Tool Environment view also exposes the current command-audit classification rather than implying that every tool is treated identically.

No new primary navigation destination was added. v3.2's single-owner information architecture remains intact.

## Current information architecture

Primary navigation remains intentionally small:

- **Home** — resume the current context and see unresolved attention
- **Targets** — manage target scope and launch the single Nmap discovery/scan workflow
- **Evidence** — review terminal/tool output and structured imports
- **Next Steps** — evidence-ranked methodology recommendations
- **Report** — proof readiness and reproducible reporting

The **More** menu contains Planned Work, Workspace Search, Methodology, Tool Library, Evidence Lineage, Engagement Map, Guide, and Workspace Data.

### Nmap remains single-owner

Targets owns Nmap. The focused scan modal continues to support host discovery, quick TCP, full TCP, service/script scans, common UDP, target/range input, output basename, custom ports, timing, minimum rate, retry limits, state reasons, version detection, default scripts, OS detection, and DNS resolution.

Normal, grepable, XML, and host-discovery output still applies through the existing host/fact/context pipeline. Scan results still create or merge hosts, attach ports/services, establish conservative reachability facts, update the active context, and recalculate Next Steps.

## Foundations retained

- Host/domain-scoped facts, evidence, activity, credentials, and progress.
- Supported/refuted/inconclusive knowledge semantics.
- Evidence-ranked Next Steps with information gain, downstream unlocks, workflow depth, coverage gaps, and reachability relevance.
- Persistent Planned Work with priority, notes, done/deferred state, and report history.
- Maneuver-first methodology with preferred tools and practical fallbacks.
- Kali-aware install/verification help without executing anything.
- Semantic command builders with grouped controls, presets, and optional advanced switches.
- Nmap host/OS/domain enrichment and LDAP/NetExec username distillation.
- Typed artifacts and direct evidence-to-command handoffs.
- Artifact lineage with context-safe deduplication and cross-artifact dependency chains.
- Review-first typed-artifact and network-observation intake gates.
- Offline script library with filtering, contextual guidance, builders, and one-click copy.
- AD methodology decision map and MachineAccountQuota/RBCD readiness coverage.
- ANSI/prompt/terminal normalization and mixed-command transcript segmentation.
- Post-foothold interface, route, subnet, host, and service visibility modeling.
- Explicit direct/pivot reachability plus active/inactive/broken pivot lifecycle state.
- Finding/transition-specific report proof obligations.
- Strong negative-evidence semantics for tool failure, inconclusive results, service rejection, and true refutation.
- Browser-local state and sanitized workspace export.

## To-Do — for future agents

- Continue validating command contracts against current upstream CLI help when tool versions change.
- Expand Evidence normalization/extraction for more NetExec, Certipy, Impacket, PEAS, web-fuzzer, database-client, and shell output edge cases.
- Grow transcript fixtures across Linux, Windows, AD, web, database, and pivoting sessions, including malformed and partial output.
- Improve lineage from card-level dependency inference toward exact activity-ID relationships.
- Add richer multi-hop artifact and compromise-path navigation.
- Make reachability relevance more target-specific when multiple internal subnets/services exist in one engagement context.
- Continue pivot-state depth around source-interface identity, listener health notes, and route-specific troubleshooting history.
- Expand proof-readiness templates while keeping screenshot-content checks operator-confirmed.
- Avoid creating a new primary navigation item merely because a new feature exists.

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
node tests/run-v3.0-tests.js
node tests/run-v3.1-tests.js
node tests/run-v3.2-tests.js
node tests/run-v3.3-tests.js
```

The v3.3 suite covers current-version coercion, the LDAP baseline/selector contract, user-list handoff continuity, removal of box-specific UI language, NetExec protocol controls, web discovery output/filter controls, data-service/cloud client controls, Tool Library audit classification, selected-output intent, v3.3 UI wiring, index load order, and inherited sanitized-export redaction.

GitHub Actions runs the complete regression chain on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
