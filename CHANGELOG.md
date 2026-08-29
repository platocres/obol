# Obol Changelog

This file is the release-history source for Obol. Future build work should review this changelog together with the current README before changing architecture or methodology.

The README is intentionally reserved for current project purpose, architecture, permanent requirements, a compact summary of only the latest three releases, and forward priorities.

## v5.6 — mapped-delivery cleanup and canonical completion wave

- Consumed the synchronized v5.5 Build Next queue rather than maintaining a separate release backlog.
- Added explicit v5.6 Evidence profiles to every remaining mapped workflow that lacked one, with technique-specific proof boundaries for Shadow Credentials, NTLM relay, MachineAccountQuota, S4U/getST, MySQL, PostgreSQL, web triage, AD ACL enumeration, PowerShell/.NET enumeration, PowerView, Zerologon detection, ticket reuse, and gMSA reads.
- Added a conservative no-fact fallback profile for any residual mapped workflow so explicit expected output can close delivery-contract debt without manufacturing access, privilege, credentials, or compromise facts.
- Audited the seven remaining execution-side metadata gaps from the live queue and made Kali/Windows command context explicit.
- Cleared the mapped-workflow delivery-debt class in the live Build Next model while preserving zero implemented-quality debt.
- Moved five canonical sections from partial to implemented: Shadow Credentials, gMSA password retrieval, S4U2Self/S4U service-ticket use, NTLM relay, and weak-web-service triage.
- Raised the strict pinned 127-section baseline from 62 / 39 / 26 / 0 to **67 implemented / 34 partial / 26 gaps / 0 stale**, with **53% fully implemented** and **80% represented**.
- Kept proof boundaries conservative: relay listener startup is not relay success; ticket creation/import is not administrator access; MAQ is readiness only; web reachability is not vulnerability; managed-password material is not plaintext; patched Zerologon output is a successful negative check with no vulnerability fact.
- Extended the README Build Next generator through the v5.6 methodology/core layers and kept the README snapshot CI-enforced against the same live queue as the North Star Dashboard.
- Strengthened `tools/release-preflight.js` so the generator must be wired through the current release and historical tests cannot hard-code a current README release token.
- Made the inherited v5.3 README release-window regression future-safe as v5.3 leaves the README's three-release summary.
- Added v5.6 Dashboard accounting, state coercion, sanitized-export compatibility, UI wiring, release notes, Evidence regression fixtures, and full historical PR CI coverage.

## v5.5 — implemented-quality cleanup and canonical completion wave

- Consumed the CI-synchronized v5.4 Build Next queue rather than maintaining a separate release backlog.
- Added explicit v5.5 Evidence profiles and audited execution-side metadata to the seven shared workflow owners serving all ten remaining implemented-quality queue items: Nmap, anonymous LDAP, username enumeration, AS-REP roasting, Kerberoasting, password spraying, and BloodHound collection.
- Cleared the implemented-canonical quality-debt class in the live Build Next model before expanding methodology completion.
- Added dedicated end-to-end owners for authenticated AD CS enumeration, Kerberos delegation discovery, domain DPAPI backup-key collection, LSASS credential extraction, and token/session impersonation.
- Preserved conservative proof boundaries: enumeration does not create control or privilege; backup-key export does not imply decrypted user secrets; LSASS collection is separate from parsed credential recovery; token listing/elevation does not imply SYSTEM without explicit post-transition identity proof.
- Moved five canonical sections from partial to implemented, raising the strict pinned 127-section baseline from 57 / 44 / 26 / 0 to **62 implemented / 39 partial / 26 gaps / 0 stale**, with **49% fully implemented** and **80% represented**.
- Extended the README Build Next generator through the v5.5 methodology/core layers and hardened CI so release pushes run current preflight while non-draft PRs/main own the complete historical chain.
- Made inherited README/current-queue regressions future-safe and added v5.5 Dashboard, state, UI, docs, and Evidence regression coverage.

## v5.4 — synchronized README agenda and persistence completion wave

- Added `tools/sync-readme-build-next.js` so README Build next is generated from the same live `C.buildNext52(lanes)` model used by the North Star Dashboard.
- Added `--write`, `--check`, and `--print` modes plus CI enforcement against README/Dashboard drift.
- Completed dedicated lifecycle owners for Skeleton Key, Custom SSP/memssp, Diamond Ticket, Sapphire Ticket, and DCShadow with conservative proof and cleanup semantics.
- Moved five canonical persistence sections from partial to implemented, raising strict completion from 52 to **57/127**, or **45%**, while represented coverage remained 80%.
- Corrected historical milestone composition and added v5.4 state, UI, documentation, and regression coverage.

## v5.3 — implemented-quality delivery repair wave

- Repaired Anonymous SMB, DNS zone transfer, Kerberos ticket hygiene, LAPS reads, Windows local enumeration, SeImpersonatePrivilege verification, DPAPI credential recovery, and Windows stored-credential hunting with explicit Evidence profiles and audited execution metadata.
- Updated report-contract Evidence provenance, added Dashboard repair accounting, and kept proof boundaries below credential/access/privilege overclaims.
- Kept strict canonical baseline unchanged at **52 implemented / 49 partial / 26 gaps / 0 stale**, 41% fully implemented and 80% represented.

## v5.2 — delivery-ready canonical accounting and build-next queue

- Added delivery-ready canonical accounting requiring runnable command, explicit Evidence profile, explicit execution-side metadata, and reporting traceability.
- Added the prioritized Build Next queue: implemented quality debt first, mapped-workflow delivery debt second, canonical gaps third.
- Added Dashboard delivery-readiness metrics and direct source-file drill-down while keeping the five-item primary navigation unchanged.
- Kept strict canonical methodology baseline at **52 / 49 / 26 / 0**, 41% fully implemented and 80% represented.

## v5.1 — delivery-debt drill-down and dashboard quality gates

- Added mapped-workflow delivery-debt accounting for missing run, Evidence, execution, and report contracts.
- Added searchable/filterable Dashboard visibility while keeping the model diagnostic-only and preserving the five-item primary workflow.
- Preserved the strict canonical baseline at **52 / 49 / 26 / 0**.

## v5.0 — dashboard IA, changelog separation, and UI hygiene

- Moved full project-health accounting to one North Star Dashboard under More and reduced Home to a compact status/link surface.
- Constrained Orange Cyber Defense branding to Dashboard/Home, removed duplicate methodology/guide project-health surfaces, and made CHANGELOG the release-history owner.
- Added neutral report traceability wording and UI-policy metrics while preserving canonical baseline **52 / 49 / 26 / 0**.

## v4.9 — single North Star dashboard

- Added consolidated hard metrics for canonical coverage, Run → Evidence readiness, execution metadata, decision-path mapping, tool review, reporting traceability, command UX, trend, backlog, and active-context progress.
- Kept fixed commands separate from GUI-adjustable commands and preserved canonical methodology at **52 / 49 / 26 / 0**.

## v4.8 — domain persistence branch depth and lifecycle

- Added Silver Ticket, DSRM, Golden Certificate, credential-subsystem persistence, Diamond/Sapphire ticket, DCShadow, and ACL-persistence lifecycle workflows.
- Added execution metadata, Evidence profiles, Next Steps integration, cleanup semantics, and reporting traceability.
- Raised canonical coverage to **52 implemented / 49 partial / 26 gaps / 0 stale**, 41% fully implemented and 80% represented.

## v4.7 — retroactive reporting traceability

- Added report contracts to all live mapped methodology cards, canonical decision-path provenance to reports, and draft reporting gaps from existing proof requirements.
- Preserved the **48 / 45 / 34 / 0** v4.6 methodology baseline.

## v4.6 — SCCM branch depth and operator loop

- Expanded SCCM into credential recovery, relay/site takeover, administrative execution, cleanup, and post-exploitation mapping with explicit Kali/Windows and Run → Evidence contracts.
- Moved six SCCM sections to implemented and six to partial, raising coverage to **48 / 45 / 34 / 0**, 38% fully implemented and 73% represented.

## v4.5 — Run / Evidence contract audit

- Added reusable per-card run/evidence accounting and explicit profiles for Hashcat AD modes, BloodHound collection, SCCM discovery, trusts, GPP, AD CS, MSSQL, and Golden Ticket creation.
- Improved SCCMHunter and Impacket MSSQL GUI controls and surfaced Run → paste → interpret → decide readiness.

## v4.4 — canonical decision-path integration

- Grouped mapped methodology into bounded stages from environment identification through credentials, authenticated mapping, control paths, movement, host control, domain control, and persistence.
- Added evidence-scoped stage progress and ranking signals to Next Steps without creating applicability or success.

## v4.3 — canonical reconciliation and cracking audit

- Reconciled existing Obol workflows against the canonical snapshot, repaired RBCD mapping, and recognized existing DC, SCCM, GPP, MSSQL, trust, Golden Ticket, and database coverage.
- Corrected/expanded AD Hashcat modes including NetNTLMv1 5500, TGS RC4/AES, DCC2, TimeRoast, and SCCM PXE external-module semantics.
- Raised coverage to **42 / 39 / 46 / 0**, 33% fully implemented and 64% represented.

## v4.2 — canonical Orange 2025.03 snapshot

- Added `data/orange-ad-2025.03.js` as a pinned structural snapshot of 17 methodology files plus support provenance.
- Pinned upstream commit `6d16ca0d1434875e0617f2f3cfa825fad0bc7d7e` and AD tree `51b414fc0c0a1a4414e86986ec5e2b5225a6d698`.
- Established the stable 127-section denominator, integrity/duplicate/stale checks, source filtering, and persistent completion visibility.
- Initial validated baseline: **25 implemented / 39 partial / 62 gaps / 1 stale**, 20% fully implemented and 50% represented.

## v4.1 — methodology coverage and tool audit

- Added the first machine-readable Orange 2025 AD coverage ledger, implemented/partial/gap/stale states, live card-reference validation, tool decisions, and explicit execution-metadata auditing.

## v4.0 — execution context

- Added per-context operator planning mode, Kali/Windows/target-local/neutral command-side classification, relevance signals, activity snapshots, and report provenance.

## v3.9 — Evidence normalization expansion

- Expanded high-confidence intent/outcome handling for Impacket Kerberos, secretsdump/DCSync, remote execution, PEASS-ng, and SQLmap with full-session transcript coverage.

## v3.8 — pivot operational state

- Added pivot source-interface context, listener health, bounded operational history, transition-aware summaries, and transition-specific report proof templates.

## v3.7 — reachability and multi-hop lineage

- Added target-specific reachability, pivot-verification freshness, conservative consumer activity-ID repair, multi-hop paths, artifact neighborhoods, and broader transcript fixtures.

## v3.6 — Rubeus workbench

- Added first-class Rubeus AS-REP roast, Kerberoast, TGT, Pass-the-Ticket, and S4U/delegation planning tied to Methodology, Evidence, lineage, and Tool Library.

## v3.5 — Evidence and Report field hardening

- Corrected overloaded-tool activity classification, hardened anonymous LDAP outcomes, consolidated Report around proof readiness/screenshot confirmation/PDF, and strengthened lineage repair.

## v3.4 — decision-first Next Steps

- Centered Next Steps on the recommendation queue with active reachability context, decision metrics, filters, planning signals, and exact activity-ID handoff.

## v3.3 — command-behavior audit

- Established the permanent minimum-useful-base-command rule and audited major NetExec, LDAP, web discovery, data-service, and Tool Library command families.

## v3.2 — entity-first navigation cleanup

- Returned primary workflow to Home, Targets, Evidence, Next Steps, Report; consolidated Nmap under Targets and advanced/reference features under More.

## v3.1 — Nmap-first discovery

- Moved host discovery/scanning earlier, added Nmap planning, host/service parsing, and target create/merge behavior.

## v3.0 — workflow-first UI

- Introduced the five-item primary navigation, Home workspace overview, collapsible context panel, mobile navigation, command palette, and clearer workflow guidance.

## v2.9 — pivot lifecycle and proof obligations

- Added explicit pivot lifecycle state, reachability-aware ranking, cross-artifact dependencies, and stronger finding proof requirements.

## v2.8 — explicit network paths and lineage timeline

- Added explicit direct/pivot network-path records, lineage timeline improvements, and report evidence state.

## v2.7 — lineage and network observations

- Added typed-artifact producer/consumer lineage, network observation extraction, context-safe deduplication, and review gates.

## v2.6 — typed artifacts and negative evidence

- Added typed artifact stores, structured handoffs, negative-evidence semantics, refuted-path handling, and broader workspace search.

## v2.5 — command-builder breadth and AD playbook

- Expanded practical semantic switches, staged AD methodology, machine-account-quota readiness, and terminal normalization/evidence signatures.

## v2.4 — planned work queue

- Added context-scoped Planned Work with priorities, notes, done/deferred/reopen behavior, and report integration.

## v2.3 — enrichment and reusable command controls

- Added Nmap hostname/OS/domain enrichment, LDAP/NetExec username distillation, and reusable controls for major tools.

## v2.2 — tool preference and transition tracking

- Added tool availability/preference handling, semantic NetExec controls, service-depth accounting, transition recording, and report-readiness improvements.

## v2.1 — knowledge and terminal-aware intake

- Added supported/refuted knowledge semantics, terminal command segmentation, activity reconstruction, report readiness, and credential-aware report redaction.

## v2.0 — host-scoped evidence ledger foundation

- Established host/domain-scoped facts, activity, evidence, migration, reporting snapshots, sanitized export, and the core static/offline browser-local architecture.
