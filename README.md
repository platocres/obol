# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, evidence reviewer, planning workspace, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. The live site is served at `https://platocres.github.io/obol/`.

It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. Engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, creates pivots, scans targets, or exploits systems. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v3.8

v3.8 advances the pivot-state, compromise-path, proof-readiness, and full-session regression priorities carried forward from v3.7.

The release keeps the v3 information architecture small and deepens existing workflow owners:

- **Reachability & pivot lifecycle** gains source-interface identity, listener-health checks, and operational history.
- **Next Steps** uses listener health in pivot-backed reachability confidence.
- **Evidence Lineage** gains transition-aware compromise-path summaries when exact activity lineage exists.
- **Report** gains additional automatic proof requirements for foothold, privilege, objective, and network transitions.

### Pivot operational state

v3.7 made path verification freshness affect recommendation confidence. v3.8 adds the operational state needed to explain whether an active path is actually trustworthy right now.

Explicit network paths can now retain:

- source interface identity
- listener health: **unknown**, **healthy**, **degraded**, or **down**
- listener / route check note
- last health-check time
- bounded operational history

Operational checks are preserved as history entries. Obol does not silently change an active path to broken just because a listener is recorded down. Lifecycle state and operational health stay separate, explicit operator-controlled concepts.

### Listener health affects reachability confidence

Target-specific reachability from v3.7 remains the base model, but pivot-backed recommendation confidence is now adjusted by operational state.

- recently verified healthy pivots retain the strongest boost
- unknown listener health slightly reduces confidence
- degraded listener health reduces the boost substantially
- a listener recorded down removes the positive pivot-reachability boost
- stale or unverified paths continue to receive no positive service-reachability boost

The path remains in the ledger. v3.8 changes ranking confidence rather than rewriting historical evidence.

### Pivot operations journal

The Reachability workspace now exposes per-path operational controls and recent history.

An operator can record the source interface, listener health, and a listener/route note as one operational check. The check refreshes explicit verification time and appends a history record containing the path state at that moment.

This gives repeated lab pivots a lightweight troubleshooting ledger without creating another primary page.

### Transition-aware compromise paths

v3.7 added multi-hop artifact chains derived only from recorded producer/consumer lineage. v3.8 annotates those chains when one exact historical activity can be identified for a hop.

When producer and consumer lineage point to one exact activity, the chain can show its recorded transition, such as credential, foothold, privilege, network, or objective. If the hop cannot be tied to one exact activity, it remains a methodology link instead of being guessed.

### Transition-specific proof templates

The v3.5 Report proof model remains the owner of readiness. v3.8 extends its automatic requirements for material transitions:

- foothold transitions require a recorded foothold/shell outcome fact
- privilege transitions require a recorded `access.*` outcome fact
- objective transitions require a recorded `objective.*` outcome fact
- network transitions require an active path that is also operationally verified

Manual external-proof confirmations remain manual. Obol still does not inspect screenshot contents.

### Full-session regression expansion

v3.8 adds another mixed Active Directory session fixture containing anonymous LDAP enumeration followed by Rubeus ticket import. The regression verifies that separate commands stay mapped to separate methodology activities and that only the ticket-import activity establishes Kerberos ticket state.

### v3.8 regression focus

The v3.8 suite covers:

- current v3.8 state/version coercion
- pivot source-interface and listener-health persistence
- operational-history recording
- listener-health influence on target-specific reachability confidence
- transition-aware compromise-chain labeling
- operational network-path proof requirements
- foothold, privilege, and objective proof templates
- mixed full-session LDAP + Rubeus ticket-import classification
- release/index/workflow/README wiring
- inherited sanitized-export secret redaction

See `docs/v3.8.md` for release-specific implementation notes and remaining priorities.

## Obol v3.7

v3.7 advances the multi-host planning, reachability, lineage, and full-session regression priorities carried forward from v3.6.

The release keeps the v3 information architecture small. It deepens existing workflow owners instead of adding another destination:

- **Next Steps** gains target-specific reachability context.
- **Evidence Lineage** gains multi-hop compromise-path navigation.
- **Reachability & pivot lifecycle** gains verification-freshness semantics.
- Existing artifact consumer records gain conservative exact activity-ID repair.

### Target-specific reachability

Earlier Obol releases could distinguish direct, pivot-reachable, observed-only, and broken-path state, but a service-level recommendation could still summarize several same-service observations too broadly in a larger engagement.

v3.7 carries actual observed destination addresses into the recommendation signal. For a service-oriented recommendation, the ranking model retains the target address, service family, direct/pivot/observed state, covering path, verification freshness, and matching broken path. Next Steps surfaces these as **Grounded targets**.

### Pivot verification freshness

An active path is no longer treated as equally trustworthy forever. v3.7 classifies path verification as fresh, aging, stale, unverified, broken, or inactive. Fresh pivot coverage receives the strongest boost; aging paths receive less and an explicit re-verification hint; stale or never-verified pivots remain recorded without receiving the same ranking weight.

### Multi-hop compromise paths

The existing dependency graph already linked artifacts conservatively when one preserved artifact was consumed by a methodology card that later produced another preserved artifact. v3.7 turns those edges into navigable multi-hop chains:

`artifact → methodology → artifact → methodology → artifact`

The Lineage overview shows grounded compromise paths, longest first, with bounded traversal depth. Selecting an artifact also shows its upstream and downstream neighborhood.

### Consumer-side exact activity lineage repair

A consumer record missing an activity ID is repaired only when the consumer has a methodology card ID, shares the same context as an activity, falls within a five-second timestamp window, and exactly one activity for that card matches. Ambiguous cases remain unresolved.

### Full-session regression coverage

v3.7 starts broader complete-session regression work with anonymous NetExec LDAP enumeration followed by Rubeus AS-REP roasting in one transcript. Only the Rubeus evidence establishes the AS-REP hash outcome.

## Obol v3.6

v3.6 advances the Active Directory and evidence priorities carried forward from v3.5. The biggest user-facing addition is a first-class **Rubeus workbench** inside Tool Library, connected to existing methodology cards, Evidence review, historical command snapshots, and artifact/activity lineage.

The v3.5 backlog explicitly said **AS-REP Roasting mentions Rubeus** for Windows but lacked a real interface; v3.6 closes that gap without adding another primary navigation destination.

### First-class Rubeus workbench

Tool Library provides dedicated Rubeus command planning for:

- **AS-REP Roast** → `asrep-roast`
- **Kerberoast** → `kerberoast`
- **Ask TGT** → `kerberos-tickets`
- **Pass the Ticket** → `kerberos-tickets`
- **S4U / Delegation** → `delegation-abuse`

The builder exposes action-specific controls for user, domain, domain controller, output file, SPN, ticket material, impersonation identity, alternate service, credential material type, credential value, Hashcat-format output where relevant, `/nowrap`, and `/ptt`.

Copying a generated Rubeus command records the exact command against the mapped methodology card's historical state. **Review output in Evidence** carries the generated command into Evidence together with card/context lineage.

v3.6 recognizes command intent for `asreproast`, `kerberoast`, `asktgt`, `ptt`, and `s4u`. Outcome inference remains deliberately conservative. Roast hashes can establish their corresponding hash facts, strong ticket output can establish `kerberos.ticket`, and ticket acquisition never automatically establishes `access.admin`.

Exact-command producer lineage is repaired only when one normalized command match exists in the same context. Ambiguous matches remain unresolved.

Rubeus is registered in Tool Library metadata with GhostPack upstream source/help information. Obol does not download, build, install, launch, or execute Rubeus.

## Obol v3.5

v3.5 is the field-tested Evidence and reporting release that corrected overloaded-tool activity classification, repaired proven Anonymous LDAP outcomes, consolidated Report around one activity-grounded proof model, made screenshot proof explicitly external and transition-aware, added rendered/PDF report export, and introduced conservative lineage repair for older intake/network producers.

## Obol v3.4

v3.4 is the decision-first Next Steps release. It makes the recommendation queue the center of the page, surfaces active target/service/reachability context on recommendations, preserves deep diagnostics under technical context, and carries exact activity IDs from methodology-card evidence handoff when available.

## Current information architecture

Primary navigation remains intentionally small:

- **Home** — resume the current context and see unresolved attention
- **Targets** — manage target scope and launch the single Nmap discovery/scan workflow
- **Evidence** — review terminal/tool output and structured imports
- **Next Steps** — prioritized, evidence-grounded work for the active context
- **Report** — proof readiness and reproducible reporting

The **More** menu contains Planned Work, Workspace Search, Methodology, Tool Library, Evidence Lineage, Engagement Map, Guide, and Workspace Data.

### Nmap remains single-owner

Targets owns Nmap. The focused scan modal supports host discovery, quick TCP, full TCP, service/script scans, common UDP, target/range input, output basename, custom ports, timing, minimum rate, retry limits, state reasons, version detection, default scripts, OS detection, and DNS resolution.

Normal, grepable, XML, and host-discovery output applies through the existing host/fact/context pipeline. Scan results can create or merge hosts, attach ports/services, establish conservative reachability facts, update the active context, and recalculate Next Steps.

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
- Evidence-ranked Next Steps with information gain, downstream unlocks, workflow depth, coverage gaps, and reachability relevance.
- Persistent Planned Work with priority, notes, done/deferred state, and report history.
- Maneuver-first methodology with preferred tools and practical fallbacks.
- Kali-aware install/verification help without executing anything.
- Semantic command builders with grouped controls, presets, and optional advanced switches.
- v3.3 command-behavior contracts and Tool Library audit classification.
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
- Rubeus workbench with methodology/Evidence integration and conservative Kerberos outcome inference.
- Exact-command producer activity lineage repair with ambiguity preservation.
- Target-specific reachability ranking with verification freshness.
- Multi-hop compromise-path and artifact-neighborhood navigation.
- Conservative consumer activity-ID repair.
- Pivot source-interface and listener-health operational state with bounded history.
- Transition-aware compromise-path summaries when exact activity lineage exists.
- Transition-specific automatic proof templates for foothold, privilege, objective, and network activity.

## To-Do — for future agents

North Star:
- This project is modeling its design off of the Orange Cyber Defense mind map: https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg
- Never remove this section from the readme, and never update the link to the Orange Cyber Defense mind map or this north star section.
- Always be checking the mind map and how it compares to where the project is at.
- Make sure the Orange Defense Mindmap for 2025 is being fully implemented, gather data from it for use in this and future builds and improve upon it.

Completed or materially advanced in v3.8:

- Add source-interface identity and listener-health state to explicit pivot/path records.
- Add a bounded operational history for listener and route checks.
- Make listener health influence pivot-backed recommendation confidence without silently mutating lifecycle state.
- Add transition-aware labels to multi-hop compromise paths when exact activity lineage exists.
- Add automatic proof requirements for foothold, privilege, objective, and operational network transitions.
- Add another mixed full-session Active Directory transcript regression.
- Preserve the v3 single-owner information architecture and Orange Cyberdefense mindmap North Star.

Next priorities:

- Continue validating Rubeus command contracts against current upstream releases as CLI behavior evolves.
- Expand Rubeus ticket/delegation transcript fixtures and additional Kerberos workflows where they map cleanly to the methodology.
- Make sure the Orange Defense Mindmap for 2025 is being fully implemented, gather data from it for use in this and future builds.
- Continue validating command contracts against current upstream CLI help when tool versions change.
- Expand Evidence normalization/extraction and activity-intent fixtures for more NetExec, Certipy, Impacket, PEAS, web-fuzzer, database-client, and shell output edge cases, including malformed and partial transcripts.
- Grow full-session regression fixtures across Linux, Windows, AD, web, database, and pivoting workflows so classification and outcome inference are tested as complete operator sessions rather than isolated strings.
- Continue exact activity-ID lineage through producer/consumer paths where stronger command or activity correlation becomes available.
- Deepen multi-hop compromise-path summaries with conservative target context and transition chronology where exact evidence supports it.
- Continue pivot troubleshooting depth with route-specific checks, source-interface context, and listener history without inferring state that the operator did not record.
- Expand proof-readiness templates for additional finding/transition types while keeping screenshot-content checks operator-confirmed and external.
- Keep the v3 information architecture simple. New functionality should not automatically become a new primary navigation destination.

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
```

The v3.4 suite locks the decision-first Next Steps redesign. The v3.5 suite covers field-observed Evidence classification, proof semantics, Report cleanup/export, and lineage repair. The v3.6 suite adds Rubeus workbench/state coverage, Kerberos command intent and conservative outcome inference, S4U integration, exact-command lineage, workflow handoffs, North Star retention, and inherited secret redaction. The v3.7 suite adds target-specific reachability, pivot freshness, consumer lineage repair, multi-hop compromise paths, artifact neighborhoods, and mixed full-session regression coverage. The v3.8 suite adds pivot operational history, listener-health ranking semantics, transition-aware compromise summaries, transition proof templates, and another mixed full-session fixture.

GitHub Actions runs the complete regression chain on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.