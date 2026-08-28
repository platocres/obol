# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, evidence reviewer, planning workspace, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. The live site is served at `https://platocres.github.io/obol/`.

It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. Engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, creates pivots, scans targets, or exploits systems. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v4.2

v4.2 is the **canonical Orange snapshot and completion-accounting** release.

v4.1 created an auditable Orange coverage ledger, but its percentage was still based on the subset of Orange branches that had already been entered into that ledger. v4.2 fixes that limitation by pinning the complete Orange Cyberdefense 2025.03 Active Directory textual methodology structure inside Obol and making that local snapshot the completion denominator.

### Canonical local Orange snapshot

The source of truth is now:

`data/orange-ad-2025.03.js`

It is pinned to Orange Cyberdefense `ocd-mindmaps` commit:

`6d16ca0d1434875e0617f2f3cfa825fad0bc7d7e`

and the upstream AD source-tree SHA:

`51b414fc0c0a1a4414e86986ec5e2b5225a6d698`

The manifest normalizes all **17 methodology-bearing AD Markdown files** plus the supporting `conf.yml` and `authors.md` source records. It stores source blob hashes, pinned source links, normalized section identities, Obol mappings, and explicit coverage state without copying the upstream command corpus verbatim.

The canonical denominator contains **127 canonical methodology sections**.

### v4.2 completion baseline

At the validated v4.2 baseline:

- **25 / 127 canonical sections fully implemented**
- **39 partial**
- **62 explicit gaps**
- **1 stale implemented mapping** surfaced by live card validation
- **20% fully implemented**
- **50% represented** when implemented and partial coverage are combined

The completion percentage counts only live `implemented` sections. Partial coverage and stale mappings do not inflate the number.

### Completion percentage is easy to see

The current Orange AD completion percentage is now visible in several places:

- a persistent **Orange AD percentage badge** in the application header on every route
- a dedicated Orange AD coverage card on **Home**
- the full canonical coverage ledger in **Methodology**

Methodology also shows the denominator, represented percentage, pinned upstream commit, AD tree identifier, per-source-file counts, source links, filters, and canonical gap queue.

### Future agents do not need to reopen the visual map for routine accounting

Future work should read `data/orange-ad-2025.03.js` first.

The normal workflow is now:

`pinned Orange manifest → canonical coverage → priority gaps → implementation → coverage update`

A future agent only needs to revisit upstream Orange when refreshing the pinned snapshot, implementing a specific branch that needs exact upstream detail, checking whether upstream changed, or resolving a source-integrity mismatch.

### Full source-container coverage

The canonical methodology inventory includes:

- ACL / ACE abuse
- AD CS
- admin credential extraction
- authenticated enumeration
- hash cracking
- Kerberos delegation
- domain-admin endgame
- authenticated historical vulnerabilities
- lateral movement
- Windows low-access privilege escalation
- low-hanging / quick-compromise paths
- relay / man-in-the-middle
- no-credential enumeration
- domain persistence
- SCCM
- domain and forest trusts
- valid-user / no-password paths

This exposes audit debt that the v4.1 subset did not yet count, including trust abuse, low-hanging historical/service paths, cracking variants, deeper Windows low-access paths, and the complete SCCM and persistence source containers.

### v4.2 regression focus

The v4.2 suite locks:

- exact Orange 2025.03 commit and AD-tree pin
- all 17 methodology source files and support-file records
- the 127-section canonical denominator
- the 25 implemented / 39 partial / 62 gap baseline plus one live stale mapping
- 20% complete and 50% represented calculations
- snapshot-integrity and duplicate-key checks
- live implemented-card mappings and stale detection
- persistent completion visibility in the header and Home
- canonical Methodology filtering/source drill-down
- inherited v4.1 tool-choice and execution-metadata behavior
- release/index/workflow/README wiring
- inherited sanitized-export secret redaction

See `docs/v4.2.md` for implementation details and future-agent workflow.

## Obol v4.1

v4.1 is the **methodology coverage and audit** release. It works directly from the v4.0 README requirement to create infrastructure that keeps track of how much of the Orange Cyberdefense 2025.03 Active Directory mindmap has actually been implemented, what is only partially represented, and what still remains.

The release does not add another primary navigation destination. The existing **Methodology** surface owns the coverage ledger.

v4.1 introduced explicit implemented / partial / gap / stale-mapping accounting, structured keep / supplement / replace / review tool decisions, and the first audited execution-side metadata for Orange-mapped commands. v4.2 retains those tool-review and execution-metadata layers but replaces the smaller v4.1 audit subset as the completion denominator.

## Obol v4.0

v4.0 is the **execution-context** release. It works directly from the earlier README requirement to make sure the Path considers whether a user is **operating from Kali or from a Windows host** on any given step of the path.

Each active host/domain context can record **Either**, **Kali**, or **Windows host**. The choice influences a small Next Steps ranking signal and command guidance without becoming a methodology prerequisite.

v4.0 introduced Kali / Windows / target-local / neutral command classification, highlighted compatible implementations, preserved opposite-side fallbacks, snapshotted operator planning mode and command execution side on new activity history, and added **Operator Execution Context** provenance to generated reports.

## Obol v3.9

v3.9 expanded **Evidence normalization** and high-confidence **activity-intent** coverage for Impacket Kerberos, secretsdump/DCSync, Impacket remote execution, PEASS-ng, and SQLmap while keeping command classification separate from outcome proof.

Explicit roast hashes, saved Kerberos tickets, canonical secretsdump rows, and explicit SYSTEM remote-execution output can establish only the corresponding proven facts. Weak banners or startup text do not create compromise state.

The Evidence page also gained intent-coverage transparency, and v3.9 added another full-session transcript regression spanning PEAS, SQLmap, and Impacket.

## Obol v3.8

v3.8 added pivot operational state including source-interface context, **listener health**, bounded path history, transition-aware compromise-path summaries, transition-specific Report proof checks, and another mixed full-session regression.

## Obol v3.7

v3.7 added **target-specific reachability**, pivot verification freshness, conservative consumer activity-ID repair, **multi-hop** compromise paths, artifact neighborhoods, and broader full-session regression coverage.

## Obol v3.6

v3.6 introduced the first-class Rubeus workbench and connected Rubeus command building to Methodology, Evidence, historical commands, and lineage.

The v3.5 backlog explicitly said **AS-REP Roasting mentions Rubeus** for Windows but lacked a real interface; v3.6 closed that gap.

Rubeus outcome inference remains conservative, and **exact-command lineage** is repaired only when one normalized command match exists in the same context.

## Obol v3.5

v3.5 is the field-tested Evidence and Report release that corrected overloaded-tool **activity classification**, repaired proven Anonymous LDAP outcomes, retained **Evidence normalization**, consolidated Report, made screenshot proof explicitly external, added rendered/PDF export, and strengthened lineage repair. Its remaining priorities included **multi-hop** navigation and broader transcript handling.

## Obol v3.4

v3.4 is the **decision-first** Next Steps release. It made the recommendation queue the center of the page, surfaced target/reachability context, preserved technical diagnostics, and carried the **exact activity-ID** from methodology-card Evidence handoff when available. Its future priorities included stronger **transcript** classification and deeper **pivot** handling.

## Current information architecture

Primary navigation remains intentionally small:

- **Home** — resume the current context and see unresolved attention
- **Targets** — manage target scope and launch the single Nmap discovery/scan workflow
- **Evidence** — review terminal/tool output and structured imports
- **Next Steps** — prioritized, evidence-grounded work for the active context
- **Report** — proof readiness and reproducible reporting

The **More** menu contains Planned Work, Workspace Search, Methodology, Tool Library, Evidence Lineage, Engagement Map, Guide, and Workspace Data.

### Nmap remains single-owner

Targets owns Nmap. Scan output applies through the existing host/fact/context pipeline and can create or merge hosts, attach ports/services, establish conservative reachability facts, update active context, and recalculate Next Steps.

### Command behavior remains explicit

The v3.3 command audit remains in force:

> **The base command performs the minimum useful action for the maneuver. Optional enumeration, scope, performance, filtering, authentication, and output behavior belongs in explicit semantic controls unless that action is the maneuver itself.**

Anonymous LDAP remains the clearest example:

```bash
nxc ldap {{target}} -u '' -p ''
```

Optional users, active users, exports, groups, computers, DCs, SID, password policy, fine-grained policy, and base-DN behavior remain explicit controls rather than silent defaults.

## Foundations retained

- Host/domain-scoped facts, evidence, activity, credentials, and progress.
- Supported/refuted/inconclusive knowledge semantics.
- Evidence-ranked Next Steps with information gain, downstream unlocks, workflow depth, coverage gaps, reachability relevance, and execution-context relevance.
- Persistent Planned Work with priority, notes, done/deferred state, and report history.
- Maneuver-first methodology with preferred tools and practical fallbacks.
- Kali-aware install/verification help without executing anything.
- Semantic command builders with grouped controls, presets, and optional advanced switches.
- v3.3 command-behavior contracts and Tool Library audit classification.
- Nmap host/OS/domain enrichment and LDAP/NetExec username distillation.
- Typed artifacts and direct evidence-to-command handoffs.
- Artifact lineage with context-safe deduplication and cross-artifact dependency chains.
- Review-first typed-artifact and network-observation intake gates.
- ANSI/prompt/terminal normalization and mixed-command transcript segmentation.
- Strong negative-evidence semantics for tool failure, inconclusive results, service rejection, and true refutation.
- Browser-local state and sanitized workspace export.
- Rubeus workbench with methodology/Evidence integration and conservative Kerberos outcome inference.
- Exact-command producer activity lineage repair with ambiguity preservation.
- Target-specific reachability ranking with verification freshness.
- Multi-hop compromise-path and artifact-neighborhood navigation.
- Conservative consumer activity-ID repair.
- Pivot source-interface and listener-health operational state with bounded history.
- Transition-aware compromise-path summaries when exact activity lineage exists.
- Transition-specific automatic proof templates for foothold, privilege, objective, and network activity.
- High-confidence Impacket, PEASS-ng, and SQLmap Evidence intent profiles with conservative outcome proof.
- Evidence intent coverage transparency in the active Evidence workflow.
- Per-context Kali/Windows operator execution state, command-side guidance, and activity execution provenance.
- Orange 2025.03 methodology coverage ledger with explicit implemented / partial / gap accounting.
- Tool-review records that compare Orange source tooling to Obol-preferred workflows.
- Audited explicit execution metadata for high-confidence Orange-mapped commands.
- Canonical, version-pinned Orange 2025.03 AD methodology snapshot with a stable 127-section completion denominator.
- Persistent Home/header visibility for the Orange AD fully implemented percentage.

## To-Do — for future agents

North Star:
- This project is modeling its design off of the Orange Cyber Defense mind map: https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg
- Never remove this section from the readme, and never update the link to the Orange Cyber Defense mind map or this north star section.
- Always be checking the mind map and how it compares to where the project is at.
- Create infrastructure to keep up with how much of the Orange Cyber Defense mind map and its decision path and tools has been fully implemented and how much remains to be implemented within Obol.
- Consider whether the tools from the Orange Cyber Defense mind map are actually the best, most user friendly tools and if they are not, add better tools to the path.
- Make sure the Orange Defense Mindmap for 2025 is being fully implemented, gather data from it for use in this and future builds and improve upon it.
- Make sure the path considers whether a user is operating from Kali or from a Windows host on any given step of the path.

Completed or materially advanced in v4.2:

- Pin the complete Orange AD 2025.03 textual methodology source structure to a specific upstream commit and AD-tree SHA.
- Normalize all 17 methodology-bearing source files plus support-file hashes into a canonical local manifest.
- Establish a durable 127-section denominator for completion accounting.
- Replace the smaller v4.1 audit-subset percentage with canonical 20% fully implemented / 50% represented baseline accounting.
- Add snapshot-integrity checks, duplicate-key checks, live-card validation, and stale implemented-mapping behavior.
- Make the completion percentage persistently visible in the header and on Home.
- Replace the v4.1 Methodology subset panel with the canonical file/section ledger while retaining the v4.1 tool-choice audit separately.
- Preserve the Kali-versus-Windows Path requirement and Orange North Star exactly.

Next priorities:

- Work from `C.mindmapPriorityGaps42(LANES)` and the canonical manifest instead of reconstructing Orange coverage manually.
- Address high-volume canonical gaps including SCCM, domain persistence, trust abuse, authenticated historical vulnerabilities, low-hanging service/CVE paths, cracking variants, and Windows low-access branches.
- Deepen partial AD CS, relay, delegation, ACL, certificate-movement, and authenticated-enumeration sections until they can truthfully move to implemented.
- When Orange upstream changes, refresh the pinned manifest deliberately and review denominator changes instead of silently drifting.
- Replace more execution-side inference with explicit command metadata as methodology audits progress.
- Continue validating Rubeus command contracts against current upstream releases as CLI behavior evolves.
- Expand Rubeus ticket/delegation transcript fixtures and additional Kerberos workflows where they map cleanly to the methodology.
- Continue validating command contracts against current upstream CLI help when tool versions change.
- Expand Evidence normalization/extraction and activity-intent fixtures for more NetExec, Certipy, Impacket edge cases, web fuzzers, database clients, and shell output, including malformed and partial transcripts.
- Grow full-session regression fixtures across Linux, Windows, AD, web, database, and pivoting workflows so classification and outcome inference are tested as complete operator sessions rather than isolated strings.
- Continue exact activity-ID lineage through producer/consumer paths where stronger command or activity correlation becomes available.
- Deepen multi-hop compromise-path summaries with conservative target context and transition chronology where exact evidence supports it.
- Continue pivot troubleshooting depth with route-specific checks, source-interface context, and listener history without inferring state that the operator did not record.
- Expand proof-readiness templates for additional finding/transition types while keeping screenshot-content checks operator-confirmed and external.
- Keep the v4 information architecture simple. New functionality should not automatically become a new primary navigation destination.

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
node tests/run-v3.4-tests.js
node tests/run-v3.5-tests.js
node tests/run-v3.6-tests.js
node tests/run-v3.7-tests.js
node tests/run-v3.8-tests.js
node tests/run-v3.9-tests.js
node tests/run-v4.0-tests.js
node tests/run-v4.1-tests.js
node tests/run-v4.2-tests.js
```

The v3.4 suite locks the decision-first Next Steps redesign. The v3.5 suite covers field-observed Evidence classification, proof semantics, Report cleanup/export, Evidence normalization, and lineage repair. The v3.6 suite adds Rubeus workbench/state coverage, Kerberos command intent and conservative outcome inference, S4U integration, exact-command lineage, workflow handoffs, North Star retention, and inherited secret redaction. The v3.7 suite adds target-specific reachability, pivot freshness, consumer lineage repair, multi-hop compromise paths, artifact neighborhoods, and mixed full-session regression coverage. The v3.8 suite adds pivot operational history, listener-health ranking semantics, transition-aware compromise summaries, transition proof templates, and another mixed full-session fixture. The v3.9 suite adds broader Impacket/PEASS-ng/SQLmap activity intent, conservative explicit outcome proof, Evidence coverage summaries, and a mixed PEAS + SQLmap + Impacket full-session regression. The v4.0 suite adds per-context operator execution state, platform-aware Path signals, command-side guidance, historical execution provenance, and release wiring. The v4.1 suite adds the Orange methodology coverage ledger, tool-review accounting, explicit execution metadata auditing, and live card-reference validation. The v4.2 suite adds the version-pinned canonical Orange AD source inventory, stable completion denominator, snapshot-integrity validation, and persistent completion visibility.

GitHub Actions runs the complete regression chain on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.