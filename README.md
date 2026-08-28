# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, evidence reviewer, planning workspace, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. The live site is served at `https://platocres.github.io/obol/`.

It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. Engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, creates pivots, scans targets, or exploits systems. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v4.7

v4.7 is the **retroactive reporting traceability** release. It directly implements the v4.6 README requirement that every path, tool, and Evidence flow fit cleanly into Obol reporting and remain fully useful from a user's perspective across UI and UX.

Every live Orange-mapped methodology card now has a reporting contract that keeps finding-bearing work distinct from path/context methodology. Successful mapped activity is traceable through its Orange decision stage, canonical source keys, exact historical activity, Evidence profile, proof-readiness state, and generated report output.

Generated Standard and OSCP working drafts now include **Orange Decision Path & Reporting Traceability** when mapped successes exist. Successful non-finding work such as ticket hygiene or mapping remains visible as path/context and is not forced into the Findings section. Drafts also surface unresolved ledger proof as **Draft Reporting Gaps** without changing recorded activity success or manufacturing findings.

The Report UI adds a **Path → evidence → report** summary, and mapped methodology cards show their report role and Evidence family. This work is retroactive across existing Orange-mapped cards and composes with v4.4 decision stages, v4.5 run/evidence contracts, v4.6 SCCM progress, and the Kali/Windows execution-context model.

v4.7 is reporting infrastructure, so canonical methodology completion remains strict at **48 / 127 fully implemented**, **45 partial**, **34 gaps**, **0 stale**, **38% fully implemented**, and **73% represented**.

See `docs/v4.7.md` for the reporting contract and regression semantics.

## Obol v4.6

v4.6 is the **SCCM branch depth and operator-loop** release.

v4.5 established reusable run/evidence contracts for Orange-mapped methodology. v4.6 applies that contract to one of the largest canonical gaps still visible in the pinned Orange Cyberdefense 2025.03 Active Directory source: SCCM beyond reconnaissance.

The release remains advisory and human-run. Obol still does not run SCCM tools, relay authentication, dispatch jobs, recover secrets, or perform cleanup. The operator runs commands externally and pastes terminal output into Evidence.

### SCCM now has separate workflow owners

The existing `sccm-enum` card remains the reconnaissance owner. v4.6 adds four deeper cards so one broad SCCM card does not pretend to own every phase:

- **SCCM Credential Recovery** — SCCMSecrets policy/files, dploot SCCM recovery, and Windows-local SharpSCCM secret recovery.
- **SCCM Relay and Site Takeover** — ntlmrelayx site-system/MSSQL relay and SCCMHunter MSSQL takeover planning.
- **SCCM Administrative Execution** — SharpSCCM and SCCMHunter administrative execution after a control path is actually proven.
- **SCCM Cleanup and Post-Exploitation Mapping** — exact artifact cleanup plus SCCMHound relationship/session mapping.

Each new card ships with explicit Kali/Windows execution metadata and an Evidence contract.

### Run → paste → interpret → decide continues

The v4.5 operator-loop rule remains in force. New SCCM work is not considered complete merely because a command exists.

The SCCM branch now has explicit copy/paste proof boundaries:

- credential recovery requires explicit paired credential fields before `credential.candidate` / `sccm.credentials` can be established;
- relay/takeover requires explicit successful authenticated relay output before `relay.success` / `sccm.control_path` can be established;
- administrative execution requires explicit successful dispatch/completion output before `sccm.execution_confirmed` can be established;
- cleanup requires explicit removal confirmation before `sccm.cleanup_recorded` is established;
- SCCMHound mapping can establish `sccm.post_map`, but never automatically proves administrator or SYSTEM access.

Recognized command startup text remains a tried activity, not a success.

### SCCM decision-path progress

v4.6 adds a context-scoped SCCM progression model:

1. Reconnaissance
2. Credential recovery
3. Relay / takeover
4. Administrative execution
5. Cleanup / post mapping

Successful SCCM activity or explicit SCCM facts can advance that progression only inside the active host/domain context.

Next Steps can show the current SCCM phase, the next phase, grounded SCCM recommendations, and their run/evidence readiness. This composes with the v4.4 Orange decision path rather than replacing it.

### Canonical Orange coverage improves

The v4.5 baseline was 42 implemented / 39 partial / 46 gaps / 0 stale.

v4.6 moves six SCCM sections to fully implemented and six additional SCCM sections from gap to partial. The new live baseline is:

- **48 / 127 canonical sections fully implemented**
- **45 partial**
- **34 explicit gaps**
- **0 stale implemented mappings**
- **38% fully implemented**
- **73% represented**

PXE/NAA remains a gap. Forced/automatic client-push setup, policy-request enrollment lifecycle, and some site-database credential variants remain partial rather than being overclaimed.

### v4.6 regression focus

The v4.6 suite locks:

- unchanged Orange 2025.03 upstream commit, AD tree, and permanent North Star
- the new 48 / 45 / 34 / 0 live baseline
- dedicated SCCM credential, relay/takeover, execution, cleanup, and post mappings
- explicit Kali / Windows execution metadata
- v4.5 run/evidence contract availability
- v4.4 decision-stage composition
- narrow SCCM terminal proof with no admin, foothold, or SYSTEM inflation
- per-context SCCM progress isolation
- Next Steps, Home, card, Guide, index, workflow, and README wiring
- inherited sanitized-export secret redaction

See `docs/v4.6.md` for the full SCCM branch contract and remaining gaps.

## Obol v4.5

v4.5 is the **Orange operator-loop contract** release. It added reusable run/evidence contract accounting for live Orange-mapped cards, GUI-control gap fixes for SCCMHunter and Impacket MSSQL, and conservative explicit terminal profiles for Hashcat, BloodHound, SCCM discovery, trust enumeration, GPP, AD CS, MSSQL, and Golden Ticket workflows.

Next Steps surfaces **Run → paste → interpret → decide** readiness. Evidence and mapped card pages expose explicit parser coverage. The North Star requirement that each tool have **proper GUI based toggles** where meaningful remains active.

The v4.5 strict project baseline was 42 / 127 fully implemented, 39 partial, 46 gaps, and 0 stale.

## Obol v4.4

v4.4 is the **Orange decision-path integration** release. Canonical Orange mappings are grouped into bounded decision stages from environment identification through credential work, authenticated mapping, control paths, movement, host control, domain-level control, and persistence.

Per-context successful activity and conservative fact floors advance the stage. Orange contributes only a small positive Next Steps ranking signal and never creates applicability or success. This release established the requirement that Orange data keep **improving "Next Steps"** as users move through the decision path.

## Obol v4.3

v4.3 is the **canonical reconciliation and cracking-contract audit** release. It repaired the RBCD stale mapping, reconciled existing DC/SCCM/GPP/MSSQL/trust/Golden Ticket/database workflows, and expanded the Active Directory Hashcat reference.

The v4.3 reconciled baseline was **42 / 127** fully implemented, 39 partial, 46 gaps, 0 stale, 33% complete, and 64% represented. It also corrected NetNTLMv1 to Hashcat mode 5500 and kept the SCCM PXE mode 19850 external-module dependency explicit.

## Obol v4.2

v4.2 is the **canonical Orange snapshot and completion-accounting** release. `data/orange-ad-2025.03.js` pins the complete Orange 2025.03 textual Active Directory methodology structure to upstream commit `6d16ca0d1434875e0617f2f3cfa825fad0bc7d7e` and AD tree `51b414fc0c0a1a4414e86986ec5e2b5225a6d698`.

The snapshot contains **127 canonical** methodology sections across all 17 methodology-bearing AD source files and preserves source hashes and links.

## Obol v4.1

v4.1 is the **methodology coverage and audit** release. It introduced implemented / partial / gap / stale-mapping accounting, structured keep / supplement / replace / review tool decisions, and audited explicit execution metadata.

The release established this ongoing requirement: **Create infrastructure to keep up with how much of the Orange Cyber Defense mind map and its decision path and tools has been fully implemented and how much remains to be implemented within Obol.**

## Obol v4.0

v4.0 is the **execution-context** release. Path considers whether the operator is **operating from Kali or from a Windows host** on a given step. Each active context can record Either, Kali, or Windows host. The choice adds a small implementation-preference signal without becoming a prerequisite and is snapshotted into new activity provenance.

The Orange Cyber Defense mind map remains the design reference for this work.

## Obol v3.9

v3.9 expanded **Evidence normalization**, high-confidence **activity-intent** coverage for Impacket Kerberos, secretsdump/DCSync, Impacket remote execution, PEASS-ng, and SQLmap, plus broader **full-session** regression handling. Command classification remains separate from outcome proof.

## Obol v3.8

v3.8 added pivot operational state, source-interface context, **listener health**, bounded path history, transition-aware compromise summaries, transition proof templates, and broader mixed-session regression coverage.

## Obol v3.7

v3.7 added **target-specific reachability**, pivot freshness, conservative consumer lineage repair, **multi-hop** compromise paths, artifact neighborhoods, and broader full-session transcript regression coverage.

## Obol v3.6

v3.6 introduced the first-class Rubeus workbench and connected it to Methodology, Evidence, historical commands, and lineage. The v3.5 backlog explicitly said **AS-REP Roasting mentions Rubeus** for Windows but lacked a real interface; v3.6 closed that gap. Exact-command lineage is repaired only when correlation is unique.

## Obol v3.5

v3.5 is the field-tested Evidence and Report release that corrected overloaded-tool **activity classification**, repaired anonymous LDAP outcomes, retained **Evidence normalization**, consolidated **Report**, made screenshot proof explicitly external, added rendered/PDF export, and strengthened lineage repair. Its priorities included richer transcript coverage and **multi-hop** navigation.

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
- SCCM branch progress with separate credential, relay/takeover, execution, cleanup, and post-map proof semantics.
- Retroactive Orange reporting traceability from canonical decision path and Evidence profile through proof readiness and generated report output.

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
- Make sure that all elements of a path, it's tools, and that tool's evidence fit well into the reporting that Obol performs and can be utilized properly in reporting.
- All of this applies both now and retroactively. All tools and paths and evidence collection and reporting need to be fully functional and fully useful from a user's perspective, and intuitive both from a UI and a UX perspective.

Completed or materially advanced in v4.7:

- Add a report contract to every live Orange-mapped methodology card.
- Keep finding-bearing work separate from path/context methodology so reporting stays useful without inflating findings.
- Add Orange decision-path and canonical-source traceability to generated Standard and OSCP working drafts.
- Surface draft reporting gaps from existing proof-readiness requirements without mutating success state.
- Add Report-page and mapped-card visibility for reporting role, Evidence family, and proof readiness.
- Apply the reporting requirement retroactively while preserving the strict 48/45/34/0 Orange coverage baseline.
- Preserve all North Star, Next Steps, GUI-control, Evidence, and Kali/Windows requirements.

Completed or materially advanced in v4.6:

- Expand SCCM beyond reconnaissance into dedicated credential recovery, relay/site-takeover, administrative execution, cleanup, and post-exploitation mapping workflows.
- Add conservative copy/paste Evidence profiles for each new SCCM workflow.
- Add explicit Kali/Windows execution metadata to every new SCCM command.
- Add meaningful GUI switches to relay/SCCMHunter commands while leaving fixed commands fixed where toggles would not improve the maneuver.
- Add per-context SCCM branch progress and expose it through Next Steps/Home only when relevant.
- Move six SCCM canonical sections to implemented and six additional SCCM sections from gap to partial.
- Raise strict Orange coverage from 33% to 38% and represented coverage from 64% to 73% without claiming PXE/NAA or incomplete client-push variants as complete.
- Preserve every existing North Star, Next Steps, GUI-control, and Kali/Windows requirement.

Next priorities:

- Use `C.orangeContractCoverage45(LANES)` together with `C.mindmapPriorityGaps42(LANES)` so newly implemented Orange work lands with both usable command controls and conservative Evidence profiles.
- Finish the remaining SCCM PXE/NAA, client-push lifecycle, policy-request credential, and site-database decryption gaps with full run/evidence contracts.
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
node tests/run-v4.6-tests.js
node tests/run-v4.7-tests.js
```

The v3.4 suite locks the decision-first Next Steps redesign. The v3.5 suite covers field-observed Evidence classification, proof semantics, Report cleanup/export, Evidence normalization, and lineage repair. The v3.6 suite adds Rubeus workbench/state coverage, Kerberos command intent and conservative outcome inference, S4U integration, exact-command lineage, workflow handoffs, North Star retention, and inherited secret redaction. The v3.7 suite adds target-specific reachability, pivot freshness, consumer lineage repair, multi-hop compromise paths, artifact neighborhoods, and mixed full-session regression coverage. The v3.8 suite adds pivot operational history, listener-health ranking semantics, transition-aware compromise summaries, transition proof templates, and another mixed full-session fixture. The v3.9 suite adds broader Impacket/PEASS-ng/SQLmap activity intent, conservative explicit outcome proof, Evidence coverage summaries, and mixed-session regression. The v4.0 suite adds per-context operator execution state, platform-aware Path signals, command-side guidance, and historical execution provenance. The v4.1 suite adds the Orange methodology coverage ledger, tool-review accounting, explicit execution metadata auditing, and live card-reference validation. The v4.2 suite adds the version-pinned canonical Orange AD source inventory, stable completion denominator, snapshot-integrity validation, and persistent completion visibility. The v4.3 suite adds live canonical reconciliation, RBCD stale-mapping repair, audited AD Hashcat modes, release-delta accounting, and card-level Orange provenance. The v4.4 suite adds context-safe Orange decision-stage progress, Next Steps ranking signals, canonical recommendation queues, and engagement-facing decision-path UI. The v4.5 suite adds Orange run/evidence contracts, GUI-control gap fixes, conservative copy/paste profiles, and operator-loop readiness visibility. The v4.6 suite adds deep SCCM branch methodology, SCCM-specific run/evidence contracts, per-context SCCM progression, and strict canonical coverage updates.

GitHub Actions runs the complete regression chain on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
