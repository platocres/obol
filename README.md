# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, evidence reviewer, planning workspace, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. The live site is served at `https://platocres.github.io/obol/`.

It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. Engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, creates pivots, scans targets, or exploits systems. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v4.1

v4.1 is the **methodology coverage and audit** release. It works directly from the v4.0 README requirement to create infrastructure that keeps track of how much of the Orange Cyberdefense 2025.03 Active Directory mindmap has actually been implemented, what is only partially represented, and what still remains.

The release does not add another primary navigation destination. The existing **Methodology** surface owns the new coverage ledger.

### Orange mindmap coverage becomes explicit

The project now has a machine-readable coverage registry tied to the Orange 2025.03 source containers.

Tracked areas include major branches such as:

- no credentials
- valid user / no password
- authenticated mapping
- man-in-the-middle / relay
- ACL / ACE abuse
- Kerberos delegation
- AD CS
- lateral movement
- admin / credential extraction
- SCCM
- domain-admin endgame
- persistence

Each tracked node records one explicit coverage state:

- **implemented** — Obol has a mapped workflow that the audit considers materially complete for that node
- **partial** — Obol has meaningful coverage, but the Orange branch is broader than the current implementation
- **gap** — the branch is intentionally tracked as missing rather than being silently ignored
- **stale mapping** — a node previously declared implemented references a card that no longer exists

A broad card no longer implies that an entire Orange source branch is complete.

### Methodology coverage ledger

The Methodology page now exposes an **AD methodology coverage ledger** with:

- implemented / partial / gap totals
- explicit completion percentage
- audited execution-metadata percentage
- highest-priority audit debt
- status filtering
- mapped Obol cards
- Orange source-file links
- tool-review details

This is project methodology metadata only. It does not mutate engagement evidence or Path applicability.

### Tool choices are reviewed, not copied blindly

The v4.0 README also requires future agents to consider whether tools on the Orange mindmap are still the best and most user-friendly choice.

v4.1 gives that requirement a structured home. Coverage nodes can now record:

- tools shown by the Orange source
- Obol-preferred tools
- a decision to **keep**, **supplement**, **replace**, or **review**
- a short rationale

Examples in the first audit include keeping Nmap/NetExec for discovery, keeping NetExec as the compact preferred SMB/LDAP workflow while retaining specialized fallbacks, supplementing DNS with dnsrecon, retaining both Kali and Windows Kerberos implementations, and explicitly tracking PXE/NAA, TimeRoasting, SCCM, and persistence as review/gap work.

### Explicit execution-side metadata starts replacing inference

v4.0 introduced Kali / Windows / target-local / neutral command-side inference.

v4.1 begins replacing that inference with audited explicit metadata on commands linked to the Orange coverage ledger.

High-confidence examples include:

- NetExec, Impacket, Certipy, BloodHound Python → Kali
- Rubeus, mimikatz, SharpHound, PowerView, native PowerShell AD tooling → Windows
- clearly local Linux enumeration → target-local

The existing v4.0 `operatorSurface40` contract remains the single execution-context mechanism. Explicit metadata wins; unaudited commands continue using the conservative v4.0 fallback.

Expanded methodology cards label audited execution metadata, and Next Steps shows the current explicit-vs-fallback audit count for Orange-mapped commands.

### v4.1 regression focus

The v4.1 suite covers:

- current v4.1 state/version coercion
- exact Orange 2025.03 North Star retention
- upstream Orange source-container registry
- implemented / partial / gap accounting
- no false 100% coverage claim
- live card-reference validation and stale-mapping behavior
- explicit Kali / Windows command metadata on audited AD implementations
- execution-metadata audit accounting
- keep / supplement / review tool decisions
- Methodology coverage-ledger UI wiring
- index / workflow / README release wiring
- inherited sanitized-export secret redaction

See `docs/v4.1.md` for release-specific implementation notes and the initial coverage baseline.

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

## To-Do — for future agents

North Star:
- This project is modeling its design off of the Orange Cyber Defense mind map: https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg
- Never remove this section from the readme, and never update the link to the Orange Cyber Defense mind map or this north star section.
- Always be checking the mind map and how it compares to where the project is at.
- Create infrastructure to keep up with how much of the Orange Cyber Defense mind map and its decision path and tools has been fully implemented and how much remains to be implemented within Obol.
- Consider whether the tools from the Orange Cyber Defense mind map are actually the best, most user friendly tools and if they are not, add better tools to the path.
- Make sure the Orange Defense Mindmap for 2025 is being fully implemented, gather data from it for use in this and future builds and improve upon it.
- Make sure the path considers whether a user is operating from Kali or from a Windows host on any given step of the path.

Completed or materially advanced in v4.1:

- Create a machine-readable Orange 2025.03 methodology coverage ledger.
- Track implemented, partial, gap, and stale-mapping states instead of implying broad completeness.
- Link tracked Orange nodes to live Obol methodology cards and source files.
- Add a structured tool-review record for keep / supplement / replace / review decisions.
- Surface the coverage ledger inside Methodology without adding primary navigation clutter.
- Start replacing v4.0 execution-side inference with audited explicit command metadata.
- Track explicit-vs-fallback execution metadata for Orange-mapped commands.
- Preserve the Kali-versus-Windows Path requirement and Orange North Star exactly.

Next priorities:

- Expand the coverage registry from major Orange containers into finer technique-level nodes.
- Work the explicit gaps exposed by v4.1, especially PXE/NAA, TimeRoasting, SCCM, persistence, delegation depth, and newer AD CS branches.
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
```

The v3.4 suite locks the decision-first Next Steps redesign. The v3.5 suite covers field-observed Evidence classification, proof semantics, Report cleanup/export, Evidence normalization, and lineage repair. The v3.6 suite adds Rubeus workbench/state coverage, Kerberos command intent and conservative outcome inference, S4U integration, exact-command lineage, workflow handoffs, North Star retention, and inherited secret redaction. The v3.7 suite adds target-specific reachability, pivot freshness, consumer lineage repair, multi-hop compromise paths, artifact neighborhoods, and mixed full-session regression coverage. The v3.8 suite adds pivot operational history, listener-health ranking semantics, transition-aware compromise summaries, transition proof templates, and another mixed full-session fixture. The v3.9 suite adds broader Impacket/PEASS-ng/SQLmap activity intent, conservative explicit outcome proof, Evidence coverage summaries, and a mixed PEAS + SQLmap + Impacket full-session regression. The v4.0 suite adds per-context operator execution state, platform-aware Path signals, command-side guidance, historical execution provenance, and release wiring. The v4.1 suite adds the Orange methodology coverage ledger, tool-review accounting, explicit execution metadata auditing, and live card-reference validation.

GitHub Actions runs the complete regression chain on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.