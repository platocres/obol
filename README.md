# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, evidence reviewer, planning workspace, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. The live site is served at `https://platocres.github.io/obol/`.

It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. Engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, creates pivots, scans targets, or exploits systems. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v3.6

v3.6 advances the Active Directory and evidence priorities carried forward from v3.5. The biggest user-facing addition is a first-class **Rubeus workbench** inside Tool Library, connected to existing methodology cards, Evidence review, historical command snapshots, and artifact/activity lineage.

The release keeps the v3 information architecture small. Rubeus does not become another primary navigation destination: Tool Library owns tool-specific command depth, Methodology owns technique context, Evidence owns review and state mutation, Next Steps consumes the resulting evidence-ranked state, and Report consumes the historical ledger.

### First-class Rubeus workbench

Tool Library now provides dedicated Rubeus command planning for:

- **AS-REP Roast** → `asrep-roast`
- **Kerberoast** → `kerberoast`
- **Ask TGT** → `kerberos-tickets`
- **Pass the Ticket** → `kerberos-tickets`
- **S4U / Delegation** → `delegation-abuse`

The builder exposes action-specific controls for user, domain, domain controller, output file, SPN, ticket material, impersonation identity, alternate service, credential material type, credential value, Hashcat-format output where relevant, `/nowrap`, and `/ptt`.

Current engagement parameters are reused where appropriate and empty optional switches are omitted instead of emitting meaningless placeholders.

### Methodology and Evidence stay connected

The workbench is not a detached command generator.

Copying a generated Rubeus command records the exact command against the mapped methodology card's historical command state. **Review output in Evidence** carries the generated command into Evidence together with card/context lineage, so the operator can run it manually, paste the resulting output, review proposals, and approve only what the evidence actually establishes.

The existing `delegation-abuse` methodology also gains a Windows Rubeus S4U implementation while retaining the methodology card as the owner of the technique.

### Rubeus-aware Evidence classification

v3.6 recognizes command intent for:

- `Rubeus.exe asreproast`
- `Rubeus.exe kerberoast`
- `Rubeus.exe asktgt`
- `Rubeus.exe ptt`
- `Rubeus.exe s4u`

Messy terminal input is normalized before activity matching, including ANSI output and common copied shell prompts. When generic terminal matching misses a clearly recognized Rubeus command, v3.6 can create a methodology-backed review proposal without silently mutating workspace state.

Outcome inference remains deliberately conservative:

- `$krb5asrep$` evidence can establish `kerberos.asrep_hash`
- `$krb5tgs$` evidence can establish `kerberos.tgs_hash`
- strong TGT/ticket-import evidence can establish `kerberos.ticket`
- strong S4U evidence can establish `kerberos.ticket`
- obtaining or importing a Kerberos ticket does **not** automatically establish `access.admin`

Existing browser-local activities can be repaired forward when preserved Rubeus command intent is unambiguous.

### Exact-command lineage

v3.5 could conservatively repair older producer lineage through context and timestamp proximity. v3.6 strengthens that model when historical command text is available.

For a producer missing an activity ID, Obol now first normalizes the preserved command and searches the same context for an exact normalized command match. The activity ID is attached only when exactly one activity matches. If the same command maps to multiple activities, lineage remains unresolved rather than guessing.

The older unique timestamp fallback remains available only when the producer has no preserved command.

### Rubeus is a first-class tool family

Rubeus is registered in the existing Tool Library metadata with GhostPack upstream source/help information and Kerberos/AD capabilities. Install guidance remains descriptive only. Obol does not download, build, install, launch, or execute Rubeus.

The Orange Cyberdefense 2025.03 Active Directory mindmap remains the project North Star and is linked from the Rubeus workbench as a secondary methodology reference.

### v3.6 regression focus

The v3.6 regression suite covers:

- current release/state migration
- Rubeus action-to-methodology mapping
- context-aware Rubeus command generation
- omission of empty optional switches
- S4U methodology integration
- messy ANSI/PowerShell transcript classification
- positive and negative roast evidence
- ticket-import outcome inference
- S4U outcome conservatism
- existing-activity repair
- exact-command lineage and ambiguity handling
- Tool Library → Methodology → Evidence handoffs
- release wiring
- North Star retention
- inherited secret redaction

## Obol v3.5

v3.5 is a field-tested Evidence and reporting release built from a real v3.4 workspace rather than a synthetic UI review. Live use exposed three connected problems: a stale v2.5 implementation note leaking into Evidence, terminal activity classification assigning an LDAP enumeration command to the wrong methodology card, and a Report page that stacked several generations of readiness UI while implying screenshot capabilities Obol does not actually have.

v3.5 fixes those problems at the state, parser, lineage, reporting, and presentation layers instead of only reskinning them.

### Evidence stays focused on evidence

The inherited **“v2.5 normalization”** callout is removed from the active Evidence UI. ANSI/prompt/terminal normalization still happens in the intake pipeline; the implementation detail simply no longer occupies permanent page space.

Evidence remains centered on source selection, terminal/tool output review, explicit fact/artifact/activity proposals, operator approval before state changes, and structured imports such as BloodHound.

### Terminal activity classification follows command intent

A real v3.4 workspace showed this command being recorded as **Identify the Domain Controller and Domain** even though it came from **Anonymous LDAP Enumeration**:

```bash
nxc ldap 10.129.95.210 -u '' -p '' --users --users-export "users.txt"
```

v3.5 adds a command-intent correction layer for overloaded tools. High-confidence selectors disambiguate NetExec LDAP and SMB workflows, BloodHound Python collection, and Certipy find/request/auth flows before activity is recorded. Successful Anonymous LDAP evidence can attach the activity outcomes the reviewed output actually proves, including anonymous bind and user-list establishment.

### Report becomes one coherent workspace

The active Report page is rebuilt around one activity-grounded proof model instead of several overlapping readiness systems. It provides a workspace-level proof summary, one successful-activity proof list, Standard and OSCP draft modes, secrets-off-by-default export behavior, rendered and Markdown-source views, Markdown download, and browser-native **Export PDF**.

Screenshot readiness is explicitly external and transition-aware. Obol does not take screenshots, store screenshot files, or inspect their contents.

### Exact lineage repair for older intake paths

v3.5 adds a conservative repair pass for older network/intake artifact producers. A missing activity ID is filled only when producer and activity share the same context, their timestamps are within five seconds, and exactly one activity matches the correlation window. Ambiguous cases remain untouched.

## Obol v3.4

v3.4 is a planning and information-hierarchy release centered on **Next Steps**.

The underlying Path engine already contained information gain, downstream unlocks, methodology coverage, credential campaigns, workflow depth, internal-network observations, explicit reachability, pivot lifecycle, and reachability-aware ranking. v3.4 makes the recommendation queue the center of the page instead of burying it under diagnostics.

### Decision-first Next Steps

The page starts with one obvious **Best next move** showing the recommendation title, active context, service context when known, evidence-grounded ranking reason, compact ranking signals, and direct Open/Plan actions.

The remaining recommendations use a dedicated planner layout with stable priority, methodology area, active target, tried/untried state, concise ranking reason, reachability explanation where relevant, and lightweight presentation filters.

Supporting diagnostics remain available under **Decision context** and **Technical context & controls** rather than competing with the work queue.

### Target and reachability context

Recommendations surface active target and service context directly. Reachability influence is shown on the recommendation when it materially affects ranking. Observed-only internal targets still do not become reachable by inference; only explicit active paths can create reachability boosts.

### Exact activity-ID lineage handoff

When card evidence is sent into Evidence, v3.4 carries the exact latest activity ID for the active card/context when one exists. Typed artifacts distilled from that handoff can therefore retain exact activity lineage instead of relying only on card/context inference.

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

Tool Library families continue to be classified as reusable contracts, dedicated builders, card-specific, or reviewed card-specific.

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
- Exact-command activity lineage repair with ambiguity preservation.

## To-Do — for future agents

North Star:
- This project is modeling its design off of the Orange Cyber Defense mind map: https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg
- Never remove this section from the readme, and never update the link to the Orange Cyber Defense mind map or this north star section.
- Always be checking the mind map and how it compares to where the project is at.
- Make sure the Orange Defense Mindmap for 2025 is being fully implemented, gather data from it for use in this and future builds and improve upon it.

Completed or materially advanced in v3.6:

- Add a first-class Rubeus Tool Library workbench instead of isolated Windows Kerberos command snippets.
- Add action-specific Rubeus controls for roasting, TGT requests, pass-the-ticket, and S4U/delegation workflows.
- Connect generated Rubeus commands to methodology history, Evidence review, and lineage handoffs.
- Add Rubeus-aware Evidence intent classification and conservative Kerberos outcome inference.
- Add realistic Rubeus terminal fixtures, including ANSI/PowerShell transcripts and negative/partial outputs.
- Add a Rubeus S4U implementation to the existing delegation methodology.
- Strengthen legacy producer lineage with exact normalized-command matching before timestamp fallback.
- Preserve the v3 single-owner information architecture and Orange Cyberdefense mindmap North Star.

Next priorities:

- Continue validating Rubeus command contracts against current upstream releases as CLI behavior evolves.
- Expand Rubeus ticket/delegation transcript fixtures and additional Kerberos workflows where they map cleanly to the methodology.
- Make sure the Orange Defense Mindmap for 2025 is being fully implemented, gather data from it for use in this and future builds.
- Continue validating command contracts against current upstream CLI help when tool versions change.
- Expand Evidence normalization/extraction and activity-intent fixtures for more NetExec, Certipy, Impacket, PEAS, web-fuzzer, database-client, and shell output edge cases, including malformed and partial transcripts.
- Grow full-session regression fixtures across Linux, Windows, AD, web, database, and pivoting workflows so classification and outcome inference are tested as complete operator sessions rather than isolated strings.
- Continue exact activity-ID lineage through producer/consumer paths that cannot yet be correlated conservatively.
- Add richer multi-hop artifact and compromise-path navigation.
- Make reachability ranking itself more target-specific when multiple internal subnets, hosts, and same-service observations coexist in one engagement context.
- Continue pivot-state depth around source-interface identity, listener health notes, route-specific troubleshooting history, and verification freshness.
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
```

The v3.4 suite locks the decision-first Next Steps redesign. The v3.5 suite covers field-observed Evidence classification, proof semantics, Report cleanup/export, and lineage repair. The v3.6 suite adds Rubeus workbench/state coverage, Kerberos command intent and conservative outcome inference, S4U integration, exact-command lineage, workflow handoffs, release wiring, North Star retention, and inherited secret redaction.

GitHub Actions runs the complete regression chain on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.