# Obol Changelog

This file is the release-history source for Obol. Future build work should review this changelog together with the current README before changing architecture or methodology.

The README is intentionally reserved for current project purpose, architecture, permanent requirements, and forward priorities.

## v5.0 — dashboard IA, changelog separation, and UI hygiene

- Moved the full project-health dashboard off Home into a dedicated **North Star Dashboard** entry under More.
- Kept Home limited to a compact completion/representation summary and a direct dashboard link.
- Added UI/UX policy accounting to the dashboard for the five-item primary nav, single-dashboard ownership, current-version contract, changelog ownership, and brand-surface policy.
- Constrained Orange Cyber Defense branding to Dashboard and Home; live Methodology, Next Steps, Report, cards, and Guide use neutral canonical/North Star language while retaining source provenance underneath.
- Removed duplicate project-health panels from Methodology while keeping the technique-level canonical ledger and source filters.
- Replaced stacked historical Guide release cards with a current workflow guide and a link to this changelog.
- Added a v5.0 report overlay so generated reports retain methodology traceability without leaking project-brand language outside the dashboard/home surfaces.
- Preserved the strict canonical baseline at 52 implemented / 49 partial / 26 gaps / 0 stale, 41% fully implemented and 80% represented.

## v4.9 — single North Star dashboard

- Added one consolidated project dashboard with hard counts and percentages for canonical methodology, represented coverage, Run → Evidence readiness, explicit Evidence profiles, execution-side metadata, decision-path mapping, tool-choice review, reporting traceability, command UX, active-context progress, release trend, and backlog concentration.
- Added broad execution-metadata accounting over all live North Star-mapped commands.
- Kept fixed commands separate from GUI-adjustable commands rather than treating every fixed command as a defect.
- Added source-file backlog drill-down and live active-context reporting/decision/SCCM/persistence summaries.
- Preserved canonical methodology completion at 52 / 49 / 26 / 0.

## v4.8 — domain persistence branch depth and lifecycle

- Added dedicated Silver Ticket, DSRM, Golden Certificate, credential-subsystem persistence, Diamond/Sapphire ticket, DCShadow, and ACL-persistence lifecycle workflows.
- Added explicit execution-side metadata, GUI controls where meaningful, conservative copy/paste Evidence profiles, Next Steps integration, cleanup semantics, and report traceability for the new persistence owners.
- Added context-scoped persistence progression and Domain Persistence Lifecycle reporting.
- Moved Silver Ticket, DSRM, Golden Certificate, and ACL persistence to implemented; kept Skeleton Key, Custom SSP, Diamond/Sapphire, and DCShadow partial.
- Raised canonical coverage to 52 implemented / 49 partial / 26 gaps / 0 stale, 41% fully implemented and 80% represented.

## v4.7 — retroactive reporting traceability

- Added report contracts to all live mapped methodology cards.
- Kept finding-bearing methodology separate from path/context methodology.
- Added canonical decision-path provenance to Standard and OSCP report drafts.
- Added Draft Reporting Gaps from existing proof-readiness requirements without rewriting successful activity.
- Added Report and card-level traceability UI.
- Preserved the 48 / 45 / 34 / 0 methodology baseline from v4.6.

## v4.6 — SCCM branch depth and operator loop

- Expanded SCCM beyond reconnaissance into credential recovery, relay/site takeover, administrative execution, cleanup, and post-exploitation mapping.
- Added explicit Kali/Windows metadata and full Run → Evidence contracts for the new SCCM workflows.
- Added context-scoped SCCM progression to Next Steps/Home.
- Moved six SCCM sections to implemented and six additional sections from gap to partial.
- Raised canonical coverage to 48 implemented / 45 partial / 34 gaps / 0 stale, 38% fully implemented and 73% represented.

## v4.5 — Run / Evidence contract audit

- Added reusable per-card run/evidence contract accounting.
- Cataloged inherited parser coverage instead of treating mature earlier Evidence handlers as unknown.
- Added explicit copy/paste profiles for Hashcat AD modes, BloodHound collection, SCCM discovery, trust enumeration, GPP recovery, AD CS enumeration, MSSQL access, and Golden Ticket creation.
- Added GUI-control improvements for SCCMHunter and Impacket MSSQL.
- Added Next Steps and card-level visibility for Run → paste → interpret → decide readiness.

## v4.4 — canonical decision-path integration

- Grouped mapped methodology into bounded decision stages from environment identification through credentials, authenticated mapping, control paths, movement, host control, domain-level control, and persistence.
- Added context-scoped stage progress from successful mapped activity and conservative fact floors.
- Added small positive decision-path ranking signals to already-applicable Next Steps without creating applicability or success.
- Added current/next stage and canonical direction visibility to Next Steps and Home.

## v4.3 — canonical reconciliation and cracking audit

- Reconciled the v4.2 canonical denominator against methodology already present in Obol.
- Repaired the stale RBCD mapping and recognized existing DC identification, SCCM recon, GPP, MSSQL, trust, Golden Ticket, and database workflows.
- Expanded the AD Hashcat reference and corrected NetNTLMv1 to mode 5500.
- Added LM 3000, NTLM 1000, NetNTLMv2 5600, TGS RC4 13100, TGS AES128 19600, TGS AES256 19700, AS-REP 18200, MSCache2 2100, TimeRoast 31300, and explicit external-module semantics for SCCM PXE 19850.
- Raised live coverage to 42 implemented / 39 partial / 46 gaps / 0 stale, 33% fully implemented and 64% represented.

## v4.2 — canonical Orange 2025.03 snapshot

- Added `data/orange-ad-2025.03.js` as a pinned structural snapshot of all 17 methodology-bearing AD source files plus support-file provenance.
- Pinned upstream commit `6d16ca0d1434875e0617f2f3cfa825fad0bc7d7e` and AD tree `51b414fc0c0a1a4414e86986ec5e2b5225a6d698`.
- Established the stable 127-section completion denominator.
- Added snapshot integrity, duplicate-key checks, source-file filtering, stale mapping detection, and persistent completion visibility.
- Validated baseline: 25 implemented / 39 partial / 62 gaps / 1 stale, 20% fully implemented and 50% represented.

## v4.1 — methodology coverage and tool audit

- Added the first machine-readable coverage ledger for major Orange 2025.03 AD source containers.
- Added implemented / partial / gap / stale states and live card-reference validation.
- Added structured keep / supplement / replace / review tool decisions.
- Began replacing execution-side inference with explicit audited command metadata.
- Kept the coverage ledger inside Methodology rather than adding primary navigation clutter.

## v4.0 — execution context

- Added per-context operator planning mode: Either, Kali, or Windows host.
- Added Kali / Windows / target-local / neutral command-side classification and small ranking relevance signals.
- Preserved opposite-side fallbacks instead of hiding them.
- Snapshotted operator planning mode and command execution side into activity history.
- Added Operator Execution Context provenance to generated reports.

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
- Remaining priorities included multi-hop navigation and broader transcript handling.

## v3.4 — decision-first Next Steps

- Made the recommendation queue the center of Next Steps.
- Added active target/reachability context, compact decision metrics, lane/status filters, planning signals, and exact activity-ID handoff from methodology cards.
- Remaining priorities included stronger transcript classification and deeper pivot handling.

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
