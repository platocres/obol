# Obol Changelog

This file is the release-history source for Obol. Future build work should review this changelog together with the current README before changing architecture or methodology.

The README is intentionally reserved for current project purpose, architecture, permanent requirements, a compact summary of only the latest three releases, and forward priorities.

## v5.9 - generic release-quality gate and canonical gap wave

- Made `BUILDING.md` a mandatory release-workflow companion and aligned the README build-agent checklist with one visible draft `release/obol-vX.Y` PR, incremental coherent commits, acceptable intermediate red checks while Draft, and exact-head green merge readiness.
- Added `tools/validate-release-quality.js`, which recalculates the live Build Next model and fails whenever implemented-quality or mapped-delivery debt is nonzero.
- Wired the release-quality gate into `tools/release-preflight.js` and the protected full `test` job so canonical-gap expansion cannot ship while higher-priority delivery debt remains.
- Started from a synchronized v5.8 queue with **0 implemented-quality repairs**, **0 mapped-delivery repairs**, and **16 canonical gaps**.
- Completed the next five canonical gaps: UAC bypass, EternalBlue / MS17-010, Exchange ProxyShell quick-win, GLPI quick-win, and Java deserialization service validation.
- Added dedicated delivery-ready owners `uac-bypass59`, `eternalblue59`, `exchange-quickwin59`, `glpi-quickwin59`, and `java-deser59` with explicit execution-side metadata, copy/paste Evidence profiles, decision-path placement, reporting traceability, and bounded proof semantics.
- UAC bypass requires independent High/System integrity evidence; `fodhelper.exe` startup is not elevation proof.
- EternalBlue keeps vulnerability detection, opened-session execution, and explicit SYSTEM identity as separate proof boundaries.
- Exchange and GLPI detection remains below privilege; remote execution requires explicit shell/command evidence.
- Java deserialization requires the unique `OBOL_JAVA_DESER_OK` callback before remote execution is recorded.
- Moved five canonical gaps to implemented, raising strict methodology from **77 implemented / 34 partial / 16 gaps / 0 stale** to **82 implemented / 34 partial / 11 gaps / 0 stale**.
- Raised fully implemented coverage from **61% to 65%** and represented coverage from **87% to 91%**, preserving the pinned 127-section denominator and Orange 2025.03 upstream commit.
- Extended the North Star Dashboard through v5.9 with canonical-progress and release-quality visibility.
- Extended README Build Next generation through v5.9 and retained CI-enforced README/Dashboard queue synchronization.
- Kept the v5.8 historical regression suite future-safe when a later release becomes current.

## v5.8 — canonical gap wave and release-contract enforcement

- Consumed the next five items from the synchronized v5.7 Build Next queue: PrintNightmare, PrivExchange, ProxyNotShell, AppLocker bypass, and Kerberos relay.
- Added delivery-ready owners with explicit command contracts, Kali/Windows/target execution metadata, conservative Evidence profiles, decision-path placement, reporting traceability, and bounded negative-result semantics.
- PrintNightmare is detection-first and does not convert vulnerability or reviewed driver-load evidence into SYSTEM.
- PrivExchange stops at confirmed HTTP coercion and leaves relay success and privilege to their own proof boundaries.
- ProxyNotShell uses a minimal `whoami` validation and only records SYSTEM when explicit remote identity output proves it.
- AppLocker separates effective-policy discovery from a benign explicit bypass marker and never treats bypass as privilege.
- Kerberos relay separates relay/control, service-ticket material, and post-transition SYSTEM identity proof.
- Moved five canonical gaps to implemented, raising strict methodology from **72 implemented / 34 partial / 21 gaps / 0 stale** to **77 implemented / 34 partial / 16 gaps / 0 stale**.
- Raised fully implemented coverage from **57% to 61%** and represented coverage from **83% to 87%**, preserving the pinned 127-section denominator.
- Added `tools/validate-release-pr.js`. Release PRs must use `release/obol-vX.Y`, include a substantive description with required release sections, and pass the required `test` check.
- The v5.8 regression suite exercises the release PR validator, so an empty description or a duplicate-style `build/obol-vX.Y` head makes the required PR test fail.
- Extended the North Star Dashboard and README Build Next generator through v5.8 and retained CI-enforced README/Dashboard synchronization.

## v5.7 — highest-priority canonical gap completion wave

- Consumed the synchronized v5.6 Build Next queue after implemented-quality debt and mapped-delivery debt had both reached zero.
- Added delivery-ready owners for DNSAdmins plugin-DLL control, Entra ID / AD Connect discovery, Certifried, MS14-068, and noPac.
- Added explicit Kali/Windows execution metadata, conservative Evidence profiles, decision-path placement, reporting traceability, and cleanup or negative-result semantics where applicable.
- Kept proof boundaries narrow: DNS configuration is not SYSTEM, hybrid-identity discovery is not credential recovery, certificate issuance is not domain-admin access, legacy OS context is not MS14-068 proof, and noPac ticket material is not administrator access.
- Moved five canonical gaps to implemented, raising strict methodology from **67 implemented / 34 partial / 26 gaps / 0 stale** to **72 implemented / 34 partial / 21 gaps / 0 stale**.
- Raised fully implemented coverage from **53% to 57%** and represented coverage from **80% to 83%** while preserving the pinned 127-section denominator.
- Extended the North Star Dashboard and README Build Next generator through v5.7 and retained CI-enforced README/Dashboard queue synchronization.
- Added v5.7 state coercion, sanitized-export compatibility, UI wiring, release notes, Evidence regressions, and historical-test future-safety for the v5.6 release-wiring check.

## v5.6 — mapped-delivery cleanup and canonical completion wave

- Consumed the synchronized v5.5 Build Next queue rather than maintaining a separate release backlog.
- Added explicit v5.6 Evidence profiles to every remaining mapped workflow that lacked one, with technique-specific proof boundaries for Shadow Credentials, NTLM relay, MachineAccountQuota, S4U/getST, MySQL, PostgreSQL, web triage, AD ACL enumeration, PowerShell/.NET enumeration, PowerView, Zerologon detection, ticket reuse, and gMSA reads.
- Added a conservative no-fact fallback profile for residual mapped workflows so expected output can close delivery-contract debt without manufacturing access, privilege, credentials, or compromise facts.
- Audited the remaining execution-side metadata gaps and made Kali/Windows command context explicit.
- Cleared mapped-workflow delivery debt while preserving zero implemented-quality debt.
- Moved Shadow Credentials, gMSA password retrieval, S4U2Self/S4U service-ticket use, NTLM relay, and weak-web-service triage from partial to implemented.
- Raised strict methodology to **67 implemented / 34 partial / 26 gaps / 0 stale**, **53% fully implemented**, **80% represented**.
- Strengthened `tools/release-preflight.js` so the README generator must be wired through the current release and historical tests cannot hard-code the live README release token.

## v5.5 — implemented-quality cleanup and canonical completion wave

- Consumed the CI-synchronized v5.4 Build Next queue and cleared the implemented-canonical quality-debt class before expanding methodology completion.
- Added explicit Evidence and execution contracts to the shared owners serving the remaining implemented-quality rows: Nmap, anonymous LDAP, username enumeration, AS-REP roasting, Kerberoasting, password spraying, and BloodHound collection.
- Added dedicated owners for authenticated AD CS enumeration, Kerberos delegation discovery, domain DPAPI backup-key collection, LSASS credential extraction, and token/session impersonation.
- Kept collection/discovery/material/privilege boundaries conservative, including explicit SYSTEM verification after token transition.
- Raised strict methodology to **62 implemented / 39 partial / 26 gaps / 0 stale**, **49% fully implemented**, **80% represented**.
- Added release-process hardening: a reusable release preflight, release-branch preflight-only Actions, full historical regression on non-draft PRs/main, workflow concurrency cancellation, and future-safe historical README assertions.

## v5.4 — synchronized README agenda and persistence completion wave

- Added `tools/sync-readme-build-next.js` so the README Build next block is generated from the same live `C.buildNext52(lanes)` model used by the North Star Dashboard.
- Added `--write`, `--check`, and `--print` modes plus CI enforcement.
- Completed dedicated lifecycle owners for Skeleton Key, Custom SSP/memssp, Diamond Ticket, Sapphire Ticket, and DCShadow.
- Kept persistence proof conservative: module startup text is not persistence proof, forged ticket material is not privilege, and DCShadow requires explicit directory readback and restoration semantics.
- Raised strict methodology to **57 implemented / 44 partial / 26 gaps / 0 stale**, **45% fully implemented**, **80% represented**.
- Corrected Dashboard milestone composition so historical releases retain their historical counts.

## v5.3 — implemented-quality delivery repair wave

- Followed the v5.2 Build Next priority order by repairing existing implemented methodology before increasing canonical completion.
- Added explicit Evidence profiles for Anonymous SMB Enumeration, DNS zone transfer, Kerberos ticket hygiene, LAPS reads, Windows local enumeration, SeImpersonatePrivilege verification, DPAPI credential recovery, and stored-credential hunting.
- Added audited execution-side metadata to the remaining commands on those workflows.
- Kept LAPS/DPAPI/stored-credential discovery below access, ticket state below privilege, and SeImpersonatePrivilege below SYSTEM without explicit identity output.
- Preserved the strict baseline at **52 implemented / 49 partial / 26 gaps / 0 stale**, **41% fully implemented**, **80% represented**.

## v5.2 — delivery-ready canonical accounting and build-next queue

- Added delivery-ready canonical accounting over the existing 127-section ledger without rewriting canonical status.
- A represented section became delivery-ready only when at least one mapped workflow satisfied Run, explicit Evidence, explicit execution-side metadata, and reporting traceability.
- Added a prioritized Build Next queue ordered as implemented-quality debt, mapped-delivery debt, then canonical gaps.
- Added direct source-file drill-down from Build Next into Methodology while preserving the five-item primary navigation.
- Restructured README To-do content into North Star objectives, the latest three releases, and explicit next-build priorities.
- Preserved **52 / 49 / 26 / 0**, **41% fully implemented**, **80% represented**.

## v5.1 — delivery-debt drill-down and dashboard quality gates

- Added mapped-workflow delivery-debt accounting to the dedicated North Star Dashboard.
- Added searchable/filterable visibility for missing Run contracts, Evidence profiles, explicit execution-side metadata, and reporting contracts.
- Kept delivery debt diagnostic only; it does not create facts, change applicability, or inflate methodology completion.
- Preserved the five-item primary workflow and strict **52 / 49 / 26 / 0** baseline.

## v5.0 — dashboard IA, changelog separation, and UI hygiene

- Moved full project-health reporting from Home into the dedicated **North Star Dashboard** under More.
- Kept Home limited to a compact completion/representation summary and dashboard link.
- Added UI/UX policy accounting for five-item primary navigation, single-dashboard ownership, current-version contract, changelog ownership, and brand-surface policy.
- Constrained Orange Cyber Defense branding to Dashboard and Home while retaining source provenance underneath neutral Methodology/Next Steps/Report surfaces.
- Replaced stacked release cards in Guide with a current workflow guide and changelog link.
- Preserved **52 / 49 / 26 / 0**, **41% fully implemented**, **80% represented**.

## v4.9 — single North Star dashboard

- Added one consolidated project dashboard with hard counts and percentages for canonical methodology, represented coverage, Run → Evidence readiness, Evidence profiles, execution metadata, decision-path mapping, tool review, reporting traceability, command UX, active-context progress, release trend, and backlog concentration.
- Added broad execution-metadata accounting and source-file backlog drill-down.
- Kept fixed commands separate from GUI-adjustable commands rather than treating every fixed command as a defect.

## v4.8 — domain persistence branch depth and lifecycle

- Added dedicated Silver Ticket, DSRM, Golden Certificate, credential-subsystem persistence, Diamond/Sapphire ticket, DCShadow, and ACL-persistence lifecycle workflows.
- Added explicit execution-side metadata, GUI controls where meaningful, conservative Evidence profiles, Next Steps integration, cleanup semantics, and report traceability.
- Moved Silver Ticket, DSRM, Golden Certificate, and ACL persistence to implemented while keeping Skeleton Key, Custom SSP, Diamond/Sapphire, and DCShadow partial.
- Raised canonical coverage to **52 implemented / 49 partial / 26 gaps / 0 stale**, **41% fully implemented**, **80% represented**.

## v4.7 — retroactive reporting traceability

- Added report contracts to all live mapped methodology cards.
- Kept finding-bearing methodology separate from path/context methodology.
- Added canonical decision-path provenance to Standard and OSCP report drafts.
- Added Draft Reporting Gaps from existing proof-readiness requirements without rewriting successful activity.

## v4.6 — SCCM branch depth and operator loop

- Expanded SCCM beyond reconnaissance into credential recovery, relay/site takeover, administrative execution, cleanup, and post-exploitation mapping.
- Added explicit Kali/Windows metadata and full Run → Evidence contracts for the new SCCM workflows.
- Added context-scoped SCCM progression to Next Steps/Home.
- Moved six SCCM sections to implemented and six more from gap to partial.
- Raised canonical coverage to **48 implemented / 45 partial / 34 gaps / 0 stale**, **38% fully implemented**, **73% represented**.

## v4.5 — Run / Evidence contract audit

- Added reusable per-card Run/Evidence contract accounting.
- Cataloged inherited parser coverage instead of treating mature earlier Evidence handlers as unknown.
- Added explicit Evidence profiles for Hashcat AD modes, BloodHound collection, SCCM discovery, trust enumeration, GPP recovery, AD CS enumeration, MSSQL access, and Golden Ticket creation.
- Added GUI-control improvements for SCCMHunter and Impacket MSSQL.

## v4.4 — canonical decision-path integration

- Grouped mapped methodology into bounded stages from environment identification through credentials, authenticated mapping, control paths, movement, host control, domain control, and persistence.
- Added context-scoped stage progress and small positive ranking signals to already-applicable Next Steps.
- Added current/next stage and canonical direction visibility to Next Steps and Home.

## v4.3 — canonical reconciliation and cracking audit

- Reconciled the v4.2 canonical denominator against methodology already present in Obol.
- Repaired the stale RBCD mapping and recognized existing DC identification, SCCM recon, GPP, MSSQL, trust, Golden Ticket, database, and other mature workflows.
- Expanded the AD Hashcat reference and corrected NetNTLMv1 to mode 5500.
- Added LM 3000, NTLM 1000, NetNTLMv2 5600, TGS RC4 13100, TGS AES128 19600, TGS AES256 19700, AS-REP 18200, MSCache2 2100, TimeRoast 31300, and explicit external-module semantics for SCCM PXE 19850.
- Raised live coverage to **42 implemented / 39 partial / 46 gaps / 0 stale**, **33% fully implemented**, **64% represented**.

## v4.2 — canonical Orange 2025.03 snapshot

- Added `data/orange-ad-2025.03.js` as a pinned structural snapshot of all 17 methodology-bearing AD source files plus support-file provenance.
- Pinned upstream commit `6d16ca0d1434875e0617f2f3cfa825fad0bc7d7e` and AD tree `51b414fc0c0a1a4414e86986ec5e2b5225a6d698`.
- Established the stable 127-section completion denominator.
- Added snapshot integrity, duplicate-key checks, source-file filtering, stale mapping detection, and persistent completion visibility.
- Validated baseline: **25 implemented / 39 partial / 62 gaps / 1 stale**, **20% fully implemented**, **50% represented**.

## v4.1 — methodology coverage and tool audit

- Added the first machine-readable coverage ledger for major Orange 2025.03 AD source containers.
- Added implemented / partial / gap / stale states and live card-reference validation.
- Added structured keep / supplement / replace / review tool decisions.
- Began replacing execution-side inference with explicit audited command metadata.

## v4.0 — execution context

- Added per-context operator planning mode: Either, Kali, or Windows host.
- Added Kali / Windows / target-local / neutral command-side classification and small ranking relevance signals.
- Preserved opposite-side fallbacks instead of hiding them.
- Snapshotted operator planning mode and command execution side into activity history and reports.

## v3.9 — Evidence normalization expansion

- Expanded high-confidence command-intent and outcome handling for Impacket Kerberos, secretsdump/DCSync, Impacket remote execution, PEASS-ng, and SQLmap.
- Kept command recognition separate from proven outcomes.
- Added mixed full-session transcript regression coverage and Evidence intent-coverage transparency.

## v3.8 — pivot operational state

- Added pivot source-interface context, listener health, bounded operational history, and transition-aware compromise summaries.
- Added transition-specific report proof templates and additional mixed-session regression coverage.

## v3.7 — reachability and multi-hop lineage

- Added target-specific reachability and pivot verification freshness.
- Added conservative consumer activity-ID repair.
- Added multi-hop compromise paths, artifact neighborhoods, and broader full-session transcript regression fixtures.

## v3.6 — Rubeus workbench

- Added first-class Rubeus command planning for AS-REP roasting, Kerberoasting, TGT requests, Pass-the-Ticket, and S4U/delegation.
- Connected Rubeus to Methodology, Evidence, historical command lineage, and the Tool Library.
- Added conservative Rubeus outcome inference and exact-command lineage rules.

## v3.5 — Evidence and Report field hardening

- Corrected overloaded-tool activity classification and anonymous LDAP outcome handling.
- Consolidated Report around proof readiness, external screenshot confirmation, rendered preview, and PDF export.
- Strengthened lineage repair and retained Evidence normalization.

## v3.4 — decision-first Next Steps

- Made the recommendation queue the center of Next Steps.
- Added active target/reachability context, compact decision metrics, lane/status filters, planning signals, and exact activity-ID handoff from methodology cards.

## v3.3 — command-behavior audit

- Established the command contract that the base command performs only the minimum useful maneuver and optional enumeration/scope/output/performance behavior belongs in explicit semantic controls.
- Audited major NetExec, LDAP, web discovery, data-service, and Tool Library command families around that rule.

## v3.2 — entity-first navigation cleanup

- Returned the primary workflow to Home, Targets, Evidence, Next Steps, and Report.
- Consolidated Nmap under Targets and moved graph imports to Evidence.
- Kept advanced/reference features under More.

## v3.1 — Nmap-first discovery

- Made host discovery and scanning accessible earlier in the workflow.
- Added dedicated discovery state and Nmap planning for discovery, full scans, and service scans.
- Added Nmap host/service parsing and target creation/merge behavior.

## v3.0 — workflow-first UI

- Introduced the five-item primary navigation, Home workspace overview, collapsible context panel, mobile navigation, command palette, and clearer workflow guidance.
- Separated primary operator workflow from advanced/reference surfaces.

## v2.9 — pivot lifecycle and proof obligations

- Added explicit pivot lifecycle state, reachability-aware ranking, cross-artifact dependency graphs, and stronger finding proof requirements.

## v2.8 — explicit network paths and lineage timeline

- Added explicit direct/pivot network path records, lineage timeline improvements, and report evidence state.

## v2.7 — lineage and network observations

- Added typed-artifact producer/consumer lineage, network observation extraction, context-safe deduplication, and review gates.

## v2.6 — typed artifacts and negative evidence

- Added typed artifact stores, structured handoffs, negative-evidence semantics, refuted-path handling, and broader workspace search.

## v2.5 — command-builder breadth and AD playbook

- Expanded practical semantic switches across common lab tools.
- Added staged AD methodology and machine-account-quota readiness.
- Improved prompt/ANSI normalization and evidence signatures.

## v2.4 — planned work queue

- Added context-scoped Planned Work with priorities, notes, done/deferred state, reopen behavior, and report integration.

## v2.3 — enrichment and reusable command controls

- Added Nmap hostname/OS/domain enrichment, LDAP/NetExec username distillation, and practical command controls for major tools.

## v2.2 — tool preference and transition tracking

- Added tool availability/preference handling, semantic NetExec controls, service-depth accounting, transition recording, and report readiness improvements.

## v2.1 — knowledge and terminal-aware intake

- Added supported/refuted knowledge semantics, terminal command segmentation, activity reconstruction, report readiness, and credential-aware report redaction.

## v2.0 — host-scoped evidence ledger foundation

- Established host/domain-scoped facts, activity, evidence, migration, reporting snapshots, sanitized export, and the core static/offline browser-local architecture that later releases build on.
