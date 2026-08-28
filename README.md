# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, evidence reviewer, planning workspace, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. The live site is served at `https://platocres.github.io/obol/`.

It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. Engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, creates pivots, scans targets, or exploits systems. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v3.7

v3.7 advances the multi-host planning, reachability, lineage, and full-session regression priorities carried forward from v3.6.

The release keeps the v3 information architecture small. It deepens existing workflow owners instead of adding another destination:

- **Next Steps** gains target-specific reachability context.
- **Evidence Lineage** gains multi-hop compromise-path navigation.
- **Reachability & pivot lifecycle** gains verification-freshness semantics.
- Existing artifact consumer records gain conservative exact activity-ID repair.

### Target-specific reachability

Earlier Obol releases could distinguish direct, pivot-reachable, observed-only, and broken-path state, but a service-level recommendation could still summarize several same-service observations too broadly in a larger engagement.

v3.7 carries actual observed destination addresses into the recommendation signal. For a service-oriented recommendation, the ranking model now retains:

- observed target address
- service family
- direct / pivot / observed reachability state
- covering path when one exists
- path verification freshness
- matching broken path when one exists

Next Steps surfaces these as **Grounded targets** so the operator can see which addresses a recommendation actually applies to.

### Pivot verification freshness

An active path is no longer treated as equally trustworthy forever.

v3.7 classifies path verification as:

- **fresh** — verified within 30 minutes
- **aging** — verified within four hours
- **stale** — older than four hours
- **unverified** — active but never explicitly verified
- **broken / inactive** — lifecycle state remains authoritative

Fresh pivot coverage receives the strongest service-reachability boost. Aging paths receive a smaller boost and an explicit re-verification hint. Stale or never-verified pivot state remains recorded but does not receive the same recommendation weight as a recently verified path.

Obol does not silently deactivate or delete a path. The operator still owns lifecycle state.

### Multi-hop compromise paths

The existing dependency graph already linked artifacts conservatively when one preserved artifact was consumed by a methodology card that later produced another preserved artifact.

v3.7 turns those edges into navigable multi-hop chains:

`artifact → methodology → artifact → methodology → artifact`

The Lineage overview now shows grounded compromise paths, longest first, with bounded configurable traversal depth. Cycles are handled conservatively and candidate-secret values remain masked.

Selecting an artifact also shows its upstream and downstream neighborhood so the operator can move through a recorded compromise path while retaining the artifact's exact chronological lineage view.

### Consumer-side exact activity lineage repair

Producer activity-ID repair was strengthened in v3.5 and v3.6. v3.7 extends the same conservative principle to artifact consumers.

A consumer record missing an activity ID is repaired only when:

- the consumer has a methodology card ID
- consumer and activity share the same context
- timestamps are within five seconds
- exactly one activity for that card matches the window

If more than one activity qualifies, the record remains unresolved rather than guessing.

### Full-session regression coverage

v3.7 starts the broader full-session fixture work called out in the v3.6 README.

The first mixed-session regression covers anonymous NetExec LDAP enumeration followed by Rubeus AS-REP roasting in one operator transcript. The test verifies that separate commands remain separate methodology activities and that only the Rubeus evidence establishes the AS-REP hash outcome.

### v3.7 regression focus

The v3.7 suite covers:

- current v3.7 state/version coercion
- target-specific same-service separation by address
- fresh versus stale pivot ranking behavior
- broken-path non-promotion
- conservative consumer activity-ID repair
- ambiguity preservation when consumer correlation is not unique
- multi-hop compromise-chain derivation
- upstream/downstream artifact neighborhoods
- mixed full-session AD transcript classification
- release/index/workflow/README wiring
- inherited sanitized-export secret redaction

See `docs/v3.7.md` for the release-specific implementation notes and remaining priorities.

## Obol v3.6

v3.6 advances the Active Directory and evidence priorities carried forward from v3.5. The biggest user-facing addition is a first-class **Rubeus workbench** inside Tool Library, connected to existing methodology cards, Evidence review, historical command snapshots, and artifact/activity lineage.

### First-class Rubeus workbench

Tool Library provides dedicated Rubeus command planning for:

- **AS-REP Roast** → `asrep-roast`
- **Kerberoast** → `kerberoast`
- **Ask TGT** → `kerberos-tickets`
- **Pass the Ticket** → `kerberos-tickets`
- **S4U / Delegation** → `delegation-abuse`

The builder exposes action-specific controls for user, domain, domain controller, output file, SPN, ticket material, impersonation identity, alternate service, credential material type, credential value, Hashcat-format output where relevant, `/nowrap`, and `/ptt`.

Current engagement parameters are reused where appropriate and empty optional switches are omitted instead of emitting meaningless placeholders.

### Methodology and Evidence stay connected

Copying a generated Rubeus command records the exact command against the mapped methodology card's historical command state. **Review output in Evidence** carries the generated command into Evidence together with card/context lineage, so the operator can run it manually, paste the resulting output, review proposals, and approve only what the evidence actually establishes.

The existing `delegation-abuse` methodology also includes a Windows Rubeus S4U implementation while retaining the methodology card as the owner of the technique.

### Rubeus-aware Evidence classification

v3.6 recognizes command intent for:

- `Rubeus.exe asreproast`
- `Rubeus.exe kerberoast`
- `Rubeus.exe asktgt`
- `Rubeus.exe ptt`
- `Rubeus.exe s4u`

Messy terminal input is normalized before activity matching, including ANSI output and common copied shell prompts.

Outcome inference remains deliberately conservative:

- `$krb5asrep$` evidence can establish `kerberos.asrep_hash`
- `$krb5tgs$` evidence can establish `kerberos.tgs_hash`
- strong TGT/ticket-import evidence can establish `kerberos.ticket`
- strong S4U evidence can establish `kerberos.ticket`
- obtaining or importing a Kerberos ticket does **not** automatically establish `access.admin`

### Exact-command lineage

For a producer missing an activity ID, Obol first normalizes the preserved command and searches the same context for an exact normalized command match. The activity ID is attached only when exactly one activity matches. If the same command maps to multiple activities, lineage remains unresolved.

The older unique timestamp fallback remains available only when the producer has no preserved command.

### Rubeus is a first-class tool family

Rubeus is registered in Tool Library metadata with GhostPack upstream source/help information and Kerberos/AD capabilities. Install guidance remains descriptive only. Obol does not download, build, install, launch, or execute Rubeus.

The Orange Cyberdefense 2025.03 Active Directory mindmap remains the project North Star and is linked from the Rubeus workbench as a secondary methodology reference.

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

## To-Do — for future agents

North Star:
- This project is modeling its design off of the Orange Cyber Defense mind map: https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg
- Never remove this section from the readme, and never update the link to the Orange Cyber Defense mind map or this north star section.
- Always be checking the mind map and how it compares to where the project is at.
- Make sure the Orange Defense Mindmap for 2025 is being fully implemented, gather data from it for use in this and future builds and improve upon it.

Completed or materially advanced in v3.7:

- Make service reachability ranking target-specific when multiple same-service observations exist.
- Surface grounded destination addresses directly on Next Steps recommendations.
- Add path verification freshness so stale pivots do not receive the same ranking weight as recently verified paths.
- Add multi-hop compromise-path derivation and navigation to Evidence Lineage.
- Add upstream/downstream artifact neighborhood navigation.
- Extend conservative exact activity-ID repair to artifact consumers.
- Add the first mixed full-session AD transcript regression.
- Preserve the v3 single-owner information architecture and Orange Cyberdefense mindmap North Star.

Next priorities:

- Continue validating Rubeus command contracts against current upstream releases as CLI behavior evolves.
- Expand Rubeus ticket/delegation transcript fixtures and additional Kerberos workflows where they map cleanly to the methodology.
- Make sure the Orange Defense Mindmap for 2025 is being fully implemented, gather data from it for use in this and future builds.
- Continue validating command contracts against current upstream CLI help when tool versions change.
- Expand Evidence normalization/extraction and activity-intent fixtures for more NetExec, Certipy, Impacket, PEAS, web-fuzzer, database-client, and shell output edge cases, including malformed and partial transcripts.
- Grow full-session regression fixtures across Linux, Windows, AD, web, database, and pivoting workflows so classification and outcome inference are tested as complete operator sessions rather than isolated strings.
- Continue exact activity-ID lineage through producer/consumer paths where stronger command or activity correlation becomes available.
- Deepen multi-hop compromise-path navigation with transition-aware summaries and target pivots when the recorded evidence can support them conservatively.
- Continue pivot-state depth around source-interface identity, listener health notes, route-specific troubleshooting history, and verification semantics.
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
```

The v3.4 suite locks the decision-first Next Steps redesign. The v3.5 suite covers field-observed Evidence classification, proof semantics, Report cleanup/export, and lineage repair. The v3.6 suite adds Rubeus workbench/state coverage, Kerberos command intent and conservative outcome inference, S4U integration, exact-command lineage, workflow handoffs, release wiring, North Star retention, and inherited secret redaction. The v3.7 suite adds target-specific reachability, pivot freshness, consumer lineage repair, multi-hop compromise paths, artifact neighborhoods, and mixed full-session regression coverage.

GitHub Actions runs the complete regression chain on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.