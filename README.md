# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, evidence reviewer, planning workspace, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. The live site is served at `https://platocres.github.io/obol/`.

It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. Engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, creates pivots, scans targets, or exploits systems. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v4.5

v4.5 is the **Orange operator-loop contract** release.

v4.4 made the Orange Cyberdefense 2025.03 decision path materially improve **Next Steps**. v4.5 advances the next README North Star requirement: each mapped step should have a usable command surface with proper GUI based toggles where switches are meaningful, and Obol should be able to interpret copy/paste evidence from the operator terminal so the next decision can be grounded in what actually happened.

The release remains advisory and human-run. Command controls never execute anything. Evidence profiles never manufacture success. Orange guidance still cannot make a technique applicable, override evidence, or bypass the existing Kali/Windows execution-context model.

### Run / evidence contracts

Every live Orange-mapped methodology card can now be audited for two separate concerns:

- **Run contract** — does the card have real commands, and which commands have semantic GUI controls or a dedicated builder?
- **Evidence contract** — does Obol have an explicit high-confidence copy/paste profile for the workflow, and which facts is that profile allowed to establish?

`assets/core-v4.5.js` exposes reusable contract coverage and queue-readiness helpers. `nextStepsOverview34()` now carries the v4.5 run/evidence payload beside the existing v4.4 Orange decision-path payload.

This is diagnostic infrastructure, not a new applicability or ranking gate.

### GUI command-control improvements

v4.5 closes concrete control gaps discovered while auditing Orange-mapped steps.

- SCCMHunter discovery commands gain an opt-in **Debug output** control rather than baking verbose behavior into the base command.
- The connection-form `impacket-mssqlclient` workflow gains semantic controls for Kerberos cache authentication, no-password mode, NTLM hash authentication, and debug output.
- Mature older control surfaces remain authoritative: Nmap keeps the Targets-owned scan builder, Rubeus keeps its dedicated workbench, and existing NetExec, LDAP, Hashcat, Kerbrute, Certipy, and Impacket controls are reused instead of duplicated.
- Fixed native commands remain fixed rather than receiving meaningless switches just to improve an audit percentage.

### Orange copy/paste Evidence profiles

`assets/intake-v4.5.js` adds conservative explicit intent/proof handling for several Orange workflows that previously depended mainly on generic matching:

- audited Active Directory Hashcat modes
- BloodHound Python, SharpHound, and NetExec BloodHound collection
- SCCMHunter discovery
- `nltest` / PowerView trust enumeration
- GPP password recovery
- Certipy / Certify AD CS enumeration
- Impacket MSSQL client sessions
- Impacket Golden Ticket creation

The proof boundary stays narrow:

- Hashcat needs explicit `Cracked` status before `credential.plaintext` is established.
- BloodHound collection can establish `ad.graph.collected`, not automatically `ad.attack_paths`.
- SCCM discovery can record successful reconnaissance without inventing credentials or admin access.
- Trust enumeration can establish `ad.trusts` only from explicit trust output.
- AD CS enumeration can establish `adcs.vulnerable` only from explicit ESC/vulnerability output.
- MSSQL output can establish `db.mssql_access` without automatically claiming OS command execution or a Windows foothold.
- Golden Ticket creation requires explicit saved `.ccache` output before persistence state is established.

Inherited Nmap, anonymous LDAP, Rubeus, Impacket roast/ticket/secretsdump/DCSync/remote-exec, PEASS-ng, SQLmap, and other evidence handlers remain in force and are cataloged as inherited contracts rather than being reimplemented.

### Operator-loop visibility

Next Steps now shows a **Run → paste → interpret → decide** audit for the current Orange-mapped recommendation queue. Each row exposes whether it has GUI-adjustable commands and whether an explicit Evidence profile exists.

Evidence shows the current Orange copy/paste profile count. Mapped methodology-card pages show a compact Run / evidence contract summary. Guide documents the v4.5 contract model.

The v4.4 Orange decision-path panel remains separate and authoritative for path context: v4.4 answers *where does this fit?* while v4.5 answers *can the operator run it through Obol and feed the result back into Evidence?*

### Coverage remains strict

v4.5 improves command and evidence contracts. It does not claim that parser coverage or GUI switches implement new Orange techniques.

The live project baseline therefore remains:

- **42 / 127 canonical sections fully implemented**
- **39 partial**
- **46 explicit gaps**
- **0 stale implemented mappings**
- **33% fully implemented**
- **64% represented**

### v4.5 regression focus

The v4.5 suite locks:

- unchanged Orange 2025.03 source commit, tree SHA, and permanent North Star
- unchanged 42 / 127, 39 partial, 46 gap, 0 stale baseline
- run/evidence contract accounting
- SCCMHunter and Impacket MSSQL GUI-control additions
- narrow Hashcat, BloodHound, SCCM, trust, AD CS, MSSQL, and Golden Ticket terminal-proof semantics
- no credential/admin/foothold inflation from reconnaissance-only output
- coexistence with v4.4 decision-path guidance and the Kali/Windows execution model
- Next Steps, Evidence, card, Guide, index, workflow, and README wiring
- inherited sanitized-export secret redaction

See `docs/v4.5.md` for the full operator-loop contract.

## Obol v4.4

v4.4 is the **Orange decision-path integration** release. Canonical Orange mappings are grouped into bounded decision stages from environment identification through credential work, authenticated mapping, control paths, movement, host control, domain-level control, and persistence. Per-context successful activity and conservative fact floors advance the stage, while Orange contributes only a small positive Next Steps ranking signal. It never creates applicability or success.

The v4.4 UI surfaces the current/next Orange decision stage, evidence-grounded canonical directions, recent mapped activity, and card-level decision-stage provenance. The strict 42 / 127 project baseline remains unchanged.

## Obol v4.3

v4.3 is the **canonical reconciliation and cracking-contract audit** release. It reconciles the stable 127 canonical Orange sections against live Obol methodology, repairs the RBCD stale mapping, recognizes mature DC, SCCM, GPP, MSSQL, trust, Golden Ticket, and database workflows, and expands the Active Directory Hashcat reference.

The reconciled baseline is **42 / 127** fully implemented, 39 partial, 46 gaps, 0 stale, 33% complete, and 64% represented. The Hashcat audit includes LM 3000, NTLM 1000, NetNTLMv1 5500, NetNTLMv2 5600, TGS RC4 13100, TGS AES128 19600, TGS AES256 19700, AS-REP 18200, MSCache2 2100, TimeRoast 31300, and the explicitly external-module SCCM PXE 19850 case.

## Obol v4.2

v4.2 is the **canonical Orange snapshot and completion-accounting** release. `data/orange-ad-2025.03.js` pins the complete Orange 2025.03 textual Active Directory methodology structure to upstream commit `6d16ca0d1434875e0617f2f3cfa825fad0bc7d7e` and AD tree `51b414fc0c0a1a4414e86986ec5e2b5225a6d698`.

The snapshot contains **127 canonical methodology sections** across all 17 methodology-bearing AD source files and preserves source hashes and links. Future builds layer current coverage on the immutable source snapshot rather than reconstructing the map for routine accounting.

## Obol v4.1

v4.1 is the **methodology coverage and audit** release. It introduced implemented / partial / gap / stale-mapping accounting, structured keep / supplement / replace / review tool decisions, and audited explicit execution metadata for high-confidence Orange-mapped commands. The existing Methodology surface owns the coverage ledger rather than adding navigation clutter.

## Obol v4.0

v4.0 is the **execution-context** release. Path considers whether the operator is **operating from Kali or from a Windows host** on a given step. Each active context can record Either, Kali, or Windows host. The choice adds a small implementation-preference signal without becoming a prerequisite and is snapshotted into new activity provenance.

## Obol v3.9

v3.9 expanded **Evidence normalization**, **activity-intent** coverage, and full-session regression handling for Impacket Kerberos, secretsdump/DCSync, Impacket remote execution, PEASS-ng, and SQLmap. Command classification remains separate from outcome proof.

## Obol v3.8

v3.8 added pivot operational state, source-interface context, **listener health**, bounded path history, transition-aware compromise summaries, transition proof templates, and broader mixed-session regression coverage.

## Obol v3.7

v3.7 added **target-specific reachability**, pivot freshness, conservative consumer lineage repair, **multi-hop** compromise paths, artifact neighborhoods, and broader full-session transcript regression coverage.

## Obol v3.6

v3.6 introduced the first-class Rubeus workbench and connected it to Methodology, Evidence, historical commands, and lineage. The v3.5 backlog explicitly said **AS-REP Roasting mentions Rubeus** for Windows but lacked a real interface; v3.6 closed that gap. Exact-command lineage is repaired only when correlation is unique.

## Obol v3.5

v3.5 is the field-tested Evidence and Report release that corrected overloaded-tool **activity classification**, repaired anonymous LDAP outcomes, retained **Evidence normalization**, consolidated Report, made screenshot proof explicitly external, added rendered/PDF export, and strengthened lineage repair. Its priorities included richer transcript coverage and **multi-hop** navigation.

## Obol v3.4

v3.4 is the **decision-first** Next Steps release. It made the recommendation queue central, surfaced target/reachability context, preserved technical diagnostics, and carried the **exact activity-ID** from methodology-card Evidence handoff. Its future priorities included stronger **transcript** classification and deeper **pivot** handling.

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
- Evidence-ranked Next Steps with information gain, downstream unlocks, workflow depth, coverage gaps, reachability relevance, execution-context relevance, and a bounded Orange decision-path signal.
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
- Tool-review records comparing Orange source tooling to Obol-preferred workflows.
- Audited explicit execution metadata for high-confidence Orange-mapped commands.
- Canonical, version-pinned Orange 2025.03 AD methodology snapshot with a stable 127-section denominator.
- Current-release coverage overlays that reconcile the immutable source snapshot without destroying historical baselines.
- Persistent Home/header visibility for Orange AD completion and release delta.
- Live card-level Orange canonical provenance.
- Audited Active Directory Hashcat mode reference with external-module exceptions explicit.
- Per-context Orange decision-stage progress derived from recorded activity and reviewed facts.
- Orange-mapped Next Steps guidance that can boost an already-applicable card without manufacturing applicability or success.
- Run/evidence contract accounting for Orange-mapped cards, including GUI command-control and terminal-profile visibility.

## To-Do — for future agents

North Star:
- This project is modeling its design off of the Orange Cyber Defense mind map: https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg and https://github.com/Orange-Cyberdefense/ocd-mindmaps/tree/main
- Never remove this section from the readme, and never update the link to the Orange Cyber Defense mind map or this north star section.
- Always be checking the mind map and how it compares to where the project is at.
- Create infrastructure to keep up with how much of the Orange Cyber Defense mind map and its decision path and tools has been fully implemented and how much remains to be implemented within Obol.
- Consider whether the tools from the Orange Cyber Defense mind map are actually the best, most user friendly tools and if they are not, add better tools to the path.
- Make sure the Orange Defense Mindmap for 2025 is being fully implemented, gather data from it for use in this and future builds and improve upon it.
- Make sure the path considers whether a user is operating from Kali or from a Windows host on any given step of the path.
- Make sure that the data being integrated from the Orange Cyber Defense mind map is improving "Next Steps" and that as users complete each step they are being properly led down the mind map's decision path.
- Make sure that each tool for each step of the path is not only proper, but has the proper GUI based toggles to adjust commands and that OBOL is able to interpret copy/paste evidence from user terminals to improve its ability to determine next steps.

Completed or materially advanced in v4.5:

- Add reusable Orange run/evidence contract accounting for every live mapped card.
- Catalog inherited parser coverage instead of treating older working Evidence handlers as unknown.
- Add conservative explicit Evidence profiles for Hashcat AD modes, BloodHound collection, SCCM discovery, trust enumeration, GPP recovery, AD CS enumeration, MSSQL access, and Golden Ticket creation.
- Add GUI command controls to SCCMHunter and the Impacket MSSQL connection workflow without polluting fixed commands with meaningless switches.
- Surface run/evidence readiness beside the v4.4 decision path in Next Steps.
- Surface copy/paste evidence-profile coverage in Evidence and contract summaries on mapped card pages.
- Preserve the strict 42/39/46/0 Orange coverage baseline and all North Star requirements.

Next priorities:

- Use `C.orangeContractCoverage45(LANES)` together with `C.mindmapPriorityGaps42(LANES)` so newly implemented Orange work lands with both usable command controls and conservative Evidence profiles.
- Expand SCCM beyond reconnaissance into credential recovery, relay, takeover, execution, cleanup, and post-exploitation branches.
- Expand domain persistence beyond Golden Ticket into Silver Ticket, DSRM, Skeleton Key, Custom SSP, Golden Certificate, Diamond/Sapphire tickets, DCShadow, and persistence-specific ACL lifecycle.
- Deepen trust abuse beyond enumeration and MSSQL linked-server paths.
- Address Windows low-access AppLocker bypass, UAC bypass, and Kerberos-relay branches.
- Deepen partial AD CS, relay, coercion, delegation, ACL, certificate-movement, and authenticated-enumeration sections until they can truthfully move to implemented.
- Expand Kerberos relay handling without treating generic NTLM relay coverage as equivalent.
- Add authenticated historical-vulnerability workflows only where they remain useful, current enough for training, and safe to present accurately.
- Continue expanding Evidence normalization and full-session transcript fixtures as command/output contracts mature.
- Replace more execution-side inference with explicit command metadata as methodology audits progress.
- Continue validating Rubeus and other fast-moving command contracts against current upstream releases when tool behavior changes.
- When Orange upstream changes, refresh the pinned manifest deliberately and review denominator changes instead of silently drifting.
- Continue exact activity-ID lineage, multi-hop target/chronology improvements, pivot troubleshooting depth, and proof-readiness templates where stronger evidence supports them.
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
node tests/run-v4.3-tests.js
node tests/run-v4.4-tests.js
node tests/run-v4.5-tests.js
```

The v3.4 suite locks the decision-first Next Steps redesign. The v3.5 suite covers field-observed Evidence classification, proof semantics, Report cleanup/export, Evidence normalization, and lineage repair. The v3.6 suite adds Rubeus workbench/state coverage, Kerberos command intent and conservative outcome inference, S4U integration, exact-command lineage, workflow handoffs, North Star retention, and inherited secret redaction. The v3.7 suite adds target-specific reachability, pivot freshness, consumer lineage repair, multi-hop compromise paths, artifact neighborhoods, and mixed full-session regression coverage. The v3.8 suite adds pivot operational history, listener-health ranking semantics, transition-aware compromise summaries, transition proof templates, and another mixed full-session fixture. The v3.9 suite adds broader Impacket/PEASS-ng/SQLmap activity intent, conservative explicit outcome proof, Evidence coverage summaries, and mixed-session regression. The v4.0 suite adds per-context operator execution state, platform-aware Path signals, command-side guidance, and historical execution provenance. The v4.1 suite adds the Orange methodology coverage ledger, tool-review accounting, explicit execution metadata auditing, and live card-reference validation. The v4.2 suite adds the version-pinned canonical Orange AD source inventory, stable completion denominator, snapshot-integrity validation, and persistent completion visibility. The v4.3 suite adds live canonical reconciliation, RBCD stale-mapping repair, audited AD Hashcat modes, release-delta accounting, and card-level Orange provenance. The v4.4 suite adds context-safe Orange decision-stage progress, Next Steps ranking signals, canonical recommendation queues, and engagement-facing decision-path UI. The v4.5 suite adds Orange run/evidence contracts, GUI-control gap fixes, conservative copy/paste profiles, and operator-loop readiness visibility.

GitHub Actions runs the complete regression chain on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
