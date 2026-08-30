# Obol Changelog

This file is the release-history source for Obol. Future build work should review this changelog together with the current README before changing architecture or methodology.

The README is intentionally reserved for current project purpose, architecture, permanent requirements, a compact summary of only the latest three releases, and forward priorities.

## v7.4 - authenticated source-depth completion

- Atomized the pinned `authenticated.md` methodology family into nineteen meaningful source-fidelity units spanning authenticated users and SMB shares, BloodHound Legacy and CE collection, LDAP and AD-integrated DNS inventory, AD CS and SCCM routing, AD-miner, PingCastle, adPEAS, Kerberoasting, four coercion families, Entra / AD Connect discovery, lateral-movement routing, and known-vulnerability routing.
- Modeled all nineteen units end to end and reused mature BloodHound, AD CS, SCCM, Kerberoast, Entra, lateral-movement, and vulnerability-specific owners instead of creating release-only duplicates.
- Added focused v7.4 owners for classic authenticated enumeration, automated AD posture assessment, and authenticated authentication coercion, with explicit Kali/Windows execution context, semantic command behavior, conservative Evidence profiles, Next Steps integration, cleanup where relevant, and report contracts.
- Preserved strict separation between enumeration, scanner findings, coercion preparation/triggering, inbound authentication, relay success, vulnerability validation, credential/hash/certificate/ticket material, authenticated access, execution, administrator/SYSTEM access, privilege, and cleanup.
- Advanced only the three authenticated parents that remained partial in the frozen v6.2 source-depth baseline: `authenticated.auto-scan`, `authenticated.coerce`, and `authenticated.known-vulns`. Historical canonical completions remain historical while gaining atomic accounting.
- Raised canonical methodology from **108 implemented / 19 partial / 0 gaps / 0 stale** to **111 implemented / 16 partial / 0 gaps / 0 stale**, **87% fully implemented**, and **100% represented**.
- Expanded source inventory from **4/17** to **5/17** methodology files atomized, from **15/34** to **18/34** frozen partial baselines decomposed, and from **51/51** to **70/70** currently inventoried atomic units fidelity-complete.
- Reduced the live Build Next queue from **19** to **16** broad source-inventory/decomposition items, moving the active priority into `sccm.md` with zero implemented-quality, mapped-delivery, canonical-gap, or inventoried-fidelity debt.
- Advanced the stable current projection through `C.projectModel74(...)`, `C.currentProjectModel(...)`, and `C.currentNorthStarDashboard(...)`, retained the overview-first Dashboard owner, and added no no-op Dashboard metadata layer.
- Added v7.4 browser/runtime wiring, authenticated-source terminal Evidence interpretation, current-project documentation, README/North Star synchronization, source-wave UI summary, sanitized-export version migration, future-safe v7.3 regression coverage, and a dedicated v7.4 regression suite under the exact-head release workflow.

## v7.3 - MITM / relay source-depth completion

- Atomized the pinned `mitm.md` methodology family into ten meaningful source-fidelity units spanning credential/hash listening, legacy MS08-068 self-relay, NTLM relay to LDAP(S), SMB, HTTP, MSSQL, and NETLOGON/DCSync, plus Kerberos relay to HTTP/AD CS, SMB, and LDAP(S).
- Modeled nine units end to end and explicitly superseded the obsolete MS08-068 self-relay branch as a preferred modern workflow instead of silently dropping the source node or adding an obsolete exploit-first operator card.
- Reused mature unsigned-SMB NTLM relay, Kerberos relay, ESC8, and DCSync owners where they already satisfied the operator contract; added dedicated v7.3 owners for listener Evidence, LDAP(S), HTTP, MSSQL, and the retained legacy NETLOGON relay route.
- Added `data/source-delivery-v7.3.js` to normalize the new MITM owner mappings, keep the historical listener helper out of duplicate delivery debt, and preserve the existing NTLM and Kerberos relay canonical milestones.
- Preserved strict separation between listener startup, inbound authentication, relay authentication, directory/service mutation, credential/hash/certificate/ticket material, authenticated access, execution, administrator/SYSTEM access, privilege, and cleanup.
- Advanced only `mitm.listen`, the MITM parent that remained partial in the frozen v6.2 source-depth baseline. `mitm.ntlm-relay` retains its v5.6 canonical completion and `mitm.kerberos-relay` retains its v6.0 completion while both gain deeper atomic source accounting.
- Raised canonical methodology from **107 implemented / 20 partial / 0 gaps / 0 stale** to **108 implemented / 19 partial / 0 gaps / 0 stale**, **85% fully implemented**, and **100% represented**.
- Expanded source inventory from **3/17** to **4/17** methodology files atomized, from **14/34** to **15/34** frozen partial baselines decomposed, and from **41/41** to **51/51** currently inventoried atomic units fidelity-complete.
- Reduced the live Build Next queue from **20** to **19** broad source-inventory/decomposition items, moving the active priority into `authenticated.md` with zero implemented-quality, mapped-delivery, canonical-gap, or inventoried-fidelity debt.
- Advanced the stable current projection through `C.projectModel73(...)`, `C.currentProjectModel(...)`, and `C.currentNorthStarDashboard(...)`, retained the overview-first Dashboard owner, and added no no-op Dashboard metadata layer.
- Added v7.3 browser/runtime wiring, MITM-specific terminal Evidence interpretation, current-project documentation, README/North Star synchronization, source-wave UI summary, sanitized-export version migration, future-safe v7.2 regression coverage, and a dedicated v7.3 regression suite under the exact-head release workflow.

## v7.2 - ACL / ACE source-depth completion

- Atomized the pinned `acl.md` methodology family into sixteen meaningful source-fidelity units spanning DCSync, Shadow Credentials, group control, computer RBCD/Key Credential control, user password/SPN/Key Credential/logon-script control, OU inheritance/GPO links, gMSA, LAPS, GPO control, and DNSAdmins.
- Reused mature existing DCSync, LAPS, Shadow Credentials, gMSA, DNSAdmins, and v7.1 RBCD owners where they already satisfied the full operator contract instead of duplicating workflows merely for release symmetry.
- Added dedicated v7.2 owners for group membership and owner/DACL control, user password reset, targeted Kerberoast, logon-script control, OU DACL and GPO-link control, GPO reversible-write proof, and the remaining ACL source-depth gaps.
- Added `data/source-delivery-v7.2.js` to expose the atomized ACL family in the Methodology map and to add explicit cleanup markers for owner, group-DACL, and OU-DACL restoration.
- Preserved the separation between rights discovery, directory or policy mutation, credential/certificate/hash/ticket material, authenticated service use, execution, administrator access, privilege, and cleanup. A write or retrieved credential artifact never silently becomes access or privilege.
- Reconciled the five frozen ACL parents that still remained partial at the v6.2 boundary: `acl.group-control`, `acl.computer-control`, `acl.user-control`, `acl.ou-control`, and `acl.gpo`. Earlier canonical completions retain their historical milestones while gaining deeper atomic source accounting.
- Raised canonical methodology from **102 implemented / 25 partial / 0 gaps / 0 stale** to **107 implemented / 20 partial / 0 gaps / 0 stale**, **84% fully implemented**, and **100% represented**.
- Expanded source inventory from **2/17** to **3/17** methodology files atomized, from **9/34** to **14/34** frozen partial baselines decomposed, and from **25/25** to **41/41** currently inventoried atomic units fidelity-complete.
- Reduced the live Build Next queue from **25** to **20** broad source-inventory/decomposition items, with `mitm.md` now highest priority and zero implemented-quality, mapped-delivery, canonical-gap, or inventoried-fidelity debt.
- Advanced the stable current projection through `C.projectModel72(...)`, `C.currentProjectModel(...)`, and `C.currentNorthStarDashboard(...)`, while retaining the overview-first Dashboard owner and delta-based release architecture without a no-op `dashboard-v7.2.js`.
- Added v7.2 browser/runtime wiring, ACL-specific terminal Evidence interpretation, current-project documentation, README/North Star synchronization, source-wave UI summary, sanitized-export version migration, and a dedicated v7.2 regression suite under the exact-head release workflow.

## v7.1 - Kerberos delegation source-depth completion

- Atomized the pinned `delegation.md` methodology family into six meaningful source-fidelity units: discovery/routing, unconstrained delegation, constrained delegation with protocol transition, constrained delegation without protocol transition, resource-based constrained delegation, and S4U2Self.
- Added dedicated v7.1 owners for each delegation unit with pinned Orange provenance, explicit Kali/Windows execution context, semantic command controls, conservative Evidence profiles, reporting contracts, and cleanup/restoration for temporary RBCD and machine-account changes.
- Preserved the separation between directory mutation, ticket material, ticket use, authenticated service access, execution, administrator access, privilege, and cleanup. A saved TGT/TGS or successful delegation write never silently becomes access or privilege.
- Modeled the pinned Kerberos-only constrained-delegation variant as an explicit staged RBCD-assisted chain, including temporary computer creation, temporary RBCD configuration, intermediate/final ticket material, and independent cleanup proof.
- Reconciled only the two frozen delegation parents that were still partial at the v6.2 boundary: `delegation.unconstrained` and `delegation.constrained`. Already-implemented discovery, RBCD, and S4U2Self parents remain historical canonical completions while gaining deeper atomic source accounting.
- Raised canonical methodology from **100 implemented / 27 partial / 0 gaps / 0 stale** to **102 implemented / 25 partial / 0 gaps / 0 stale**, **80% fully implemented**, and **100% represented**.
- Expanded source inventory from **1/17** to **2/17** methodology files atomized, from **7/34** to **9/34** frozen partial baselines decomposed, and from **19/19** to **25/25** currently inventoried atomic units fidelity-complete.
- Reduced the live Build Next queue from **27** to **25** broad source-inventory/decomposition items, with ACL / ACE control paths now highest priority and zero implemented-quality, mapped-delivery, canonical-gap, or inventoried-fidelity debt.
- Advanced the stable current projection through `C.projectModel71(...)`, `C.currentProjectModel(...)`, and `C.currentNorthStarDashboard(...)`, while retaining the overview-first Dashboard owner and delta-based release architecture without a no-op `dashboard-v7.1.js`.
- Added v7.1 browser/runtime wiring, delegation-specific terminal Evidence interpretation, current-project documentation, README/North Star synchronization, source-wave UI summary, sanitized-export version migration, and a dedicated v7.1 regression suite under the exact-head release workflow.

## v7.0 - AD CS certificate-mapping fidelity completion

- Completed the five remaining inventoried AD CS certificate-mapping source-fidelity units: Shadow Credentials bridge, ESC9, both ESC10 mapping cases, and ESC14.
- Added dedicated v7.0 methodology owners with pinned Orange provenance, current Certipy-oriented operator surfaces, explicit execution context, conservative Evidence profiles, reporting contracts, and cleanup/restoration guidance for temporary account changes.
- Kept temporary Key Credential writes, returned NT-hash material, account-attribute mutation, certificate material, authentication, service access, privilege, and cleanup as separate proof states.
- Modeled the Shadow Credentials bridge through Certipy `shadow auto` with explicit NT-hash proof and restoration proof boundaries.
- Modeled ESC9 and both ESC10 cases as temporary identity-preparation plus certificate-request workflows while refusing to infer authentication or privilege from successful mutation or certificate issuance.
- Explicitly **superseded** the pinned Orange ESC14 exploit branch rather than inventing mechanics that are not present in the source. v7.0 uses current Certipy finding collection and explicit `altSecurityIdentities` review as an assessment/reporting handoff.
- Reconciled `adcs.certificate-mapping` from partial to implemented only after all five inventoried subordinate units became terminal and fidelity-complete.
- Raised canonical methodology from **99 implemented / 28 partial / 0 gaps / 0 stale** to **100 implemented / 27 partial / 0 gaps / 0 stale**, **79% fully implemented**, and **100% represented**.
- Advanced the currently inventoried AD CS atomic ledger from **14/19** to **19/19** complete while preserving **1/17 methodology files atomized** and **7/34 frozen partial baselines decomposed**.
- Reduced the live Build Next queue from **32** to **27** items. With zero implemented-quality debt, zero mapped-delivery debt, zero canonical gaps, and zero pending inventoried AD CS units, the active phase becomes Orange source inventory/decomposition beginning with Kerberos delegation.
- Advanced the stable current project projection to `C.projectModel70(...)` through `C.currentProjectModel(...)`, kept the overview-first Dashboard owner, and retained delta-based release scaffolding without creating a no-op Dashboard overlay.
- Added v7.0 browser/runtime wiring, terminal Evidence interpretation, README/North Star synchronization, release documentation, future-safe v6.9 regression coverage, and a dedicated v7.0 regression suite while preserving the exact-head release workflow.

## v6.9 - ESC5, ESC6, and ESC11 source-fidelity delivery

- Consumed the next three live North Star Build Next items after v6.8: ESC5 vulnerable PKI-object ACL / CA-key control, ESC6 CA SAN-flag identity selection, and ESC11 RPC/ICPR enrollment relay.
- Added dedicated owners `adcs-esc5-69`, `adcs-esc6-69`, and `adcs-esc11-69` with pinned Orange provenance, current Certipy-oriented operator surfaces, explicit Kali/Windows execution context where practical, conservative Evidence profiles, Next Steps transitions, and reporting contracts.
- Kept ESC5 CA backup material separate from the offline forged certificate it can enable. CA private-key material, forged certificate material, authenticated access, privilege, and DCSync capability remain separate proof states.
- Modeled ESC6 as a requester-controlled SAN identity-selection path only after the CA flag and a suitable client-authentication-capable template. Certificate issuance remains credential material until later authentication/access Evidence proves more.
- Modeled ESC11 RPC/ICPR relay with Certipy as the preferred compact operator surface and ntlmrelayx as the pinned-source-compatible fallback. Listener startup and inbound authentication are not certificate issuance, and certificate/ticket material is not DCSync or privilege proof.
- Reconciled `adcs.pki-object-acl` from partial to implemented after ESC5 became fidelity-complete and reconciled `adcs.ca-misconfig` only after both inventoried ESC6 and ESC11 branches became fidelity-complete.
- Raised canonical methodology from **97 implemented / 30 partial / 0 gaps / 0 stale** to **99 implemented / 28 partial / 0 gaps / 0 stale**, **78% fully implemented**, and **100% represented**, while preserving the frozen 34-section v6.2 source-depth denominator.
- Advanced atomic source fidelity from **11/19** to **14/19** complete, leaving **5** inventoried AD CS certificate-mapping audits followed by **27** source-inventory/decomposition items for a **32-item** Build Next queue. The certificate-mapping shadow-credential bridge becomes the next live item.
- Kept `C.currentProjectModel(...)` and `C.currentNorthStarDashboard(...)` as the stable current pointers backed by the v6.9 adapters, and made the v6.8 UI decorator inactive when a later release owns the current version surface.
- Added v6.9 browser/runtime wiring, terminal Evidence interpretation, release documentation, README/North Star synchronization, future-safe v6.8 regression coverage, and a dedicated v6.9 regression suite while preserving the exact-head release workflow.

## v6.8 - ESC4 and ESC7 source-fidelity delivery

- Consumed the next three live North Star Build Next items after v6.7: ESC4 writable certificate-template ACL, ESC7 Manage CA officer transition, and ESC7 Manage Certificates enable / request / issue / retrieve.
- Added dedicated v6.8 owners `adcs-esc4-68`, `adcs-esc7-manage-ca-68`, and `adcs-esc7-manage-cert-68` with current Certipy operator surfaces, explicit execution context, semantic controls, conservative Evidence profiles, Next Steps transitions, cleanup/restoration, and reporting contracts.
- Reconciled `adcs.template-misconfig` and `adcs.acl-misconfig` only after their inventoried subordinate source units became fidelity-complete.
- Raised canonical methodology to **97 implemented / 30 partial / 0 gaps / 0 stale**, **76% fully implemented**, and **100% represented**.
- Advanced atomic source fidelity from **8/19** to **11/19** complete and added stable current project pointers through `C.currentProjectModel(...)`.
- Added v6.8 browser/runtime wiring, Intake interpretation, current-project documentation, README synchronization, future-safe v6.7 regression coverage, and a dedicated v6.8 regression suite.

## v6.7 - ESC13 and ESC15 source-fidelity delivery

- Consumed the next three inventoried AD CS atomic source-fidelity items: ESC13 issuance-policy/group-link template abuse and both ESC15 application-policy injection variants.
- Added dedicated v6.7 owners with pinned source provenance, Kali/Windows execution context where applicable, semantic controls, conservative Evidence profiles, Next Steps transitions, and reporting contracts.
- Preserved the pinned 127-section canonical baseline at **95 implemented / 32 partial / 0 gaps / 0 stale**, **75% fully implemented**, and **100% represented** while advancing atomic fidelity from **5/19** to **8/19**.
- Kept certificate/PFX material below authentication, access, group membership, privilege, and DCSync consequence.
- Added v6.7 browser/runtime wiring, terminal Evidence interpretation, release documentation, README synchronization, future-safe v6.6 compatibility coverage, and v6.7 regression tests.

## v6.6 - architecture consolidation and project-status simplification

- Established `C.projectModel66(...)` as the single current projection for canonical progress, source-depth/source-fidelity progress, quality debt, Build Next, recent release trend, and the next priority.
- Added `data/project-model-v6.6.js` as the authoritative current release/project metadata owner and `tools/current-runtime.js` as the shared Node-side loader.
- Rebuilt the default North Star Dashboard around an immediate project overview while preserving detailed metrics, the atomic ledger, and full Build Next queue behind drill-downs.
- Reorganized documentation so `README.md`, the architecture/proof/source-depth documents, `BUILDING.md`, and this changelog each own a durable concern.
- Preserved methodology and source-fidelity state at **95 implemented / 32 partial / 0 gaps / 0 stale**, **75% fully implemented**, **100% represented**, **1/17 source files atomized**, **7/34 frozen partial baselines decomposed**, and **5/19 inventoried atomic units fidelity-complete**.
- Kept browser-local workspace migration, human-run command behavior, conservative Evidence/proof boundaries, Next Steps semantics, report lineage, sanitized export, and the exact-head tiered CI contract unchanged.

## v6.5 - first AD CS atomic source-fidelity delivery wave

- Consumed the first five atomic source-fidelity items: AD CS enumeration/routing, ESC8, ESC1, ESC2, and ESC3.
- Added dedicated AD CS owners and source-delivery reconciliation with explicit execution context, semantic controls, conservative Evidence profiles, reporting contracts, and source provenance.
- Moved only the exhausted `adcs.enumeration` and `adcs.web-enrollment` parents to implemented while keeping broader template misconfiguration partial.
- Raised canonical methodology to **95 implemented / 32 partial / 0 gaps / 0 stale**, **75% fully implemented**, and **100% represented**.
- Advanced atomic source fidelity from **0/19** to **5/19** and reduced Build Next to **41** items.
- Wired v6.5 through browser runtime, Intake, state migration/sanitized export, README generation, release documentation, CSS/UI, and regression coverage.

## v6.4 - atomic Orange source-fidelity accounting

- Preserved canonical methodology at **93 implemented / 34 partial / 0 gaps / 0 stale**, **73% fully implemented**, and **100% represented** while adding a deeper denominator.
- Added `data/orange-fidelity-v6.4.js`, a machine-readable atomic source-fidelity ledger tied to the pinned Orange 2025.03 commit and source-file hashes.
- Atomized `adcs.md` first into **19 meaningful source units** spanning enumeration and the major ESC branches and variants.
- Added source paths, branch conditions, tool inventories, transitions, owner mappings, cleanup obligations, audit state, and per-requirement review dimensions.
- Established the initial fidelity baseline at **1/17 source files atomized**, **7/34 frozen partial baselines decomposed**, and **0/19 atomic units fidelity-complete**.
- Extended Build Next with atomic source-fidelity audits ahead of remaining source-depth decomposition and kept project/source accounting separate from engagement facts.

## v6.2 - canonical completion and Orange source-depth phase

- Completed the final canonical gap, `trusts.parent-child`, bringing the 127-section denominator to **93 implemented / 34 partial / 0 gaps / 0 stale**, **73% fully implemented**, and **100% represented**.
- Froze the **34 partial canonical sections** at the v6.2 boundary as a persistent source-depth audit denominator.
- Added the durable source-depth plan and explicit `needs-audit`, `modeled`, `superseded`, and `rejected` outcomes.
- Extended North Star Dashboard and Build Next with separate source-depth accounting so canonical representation cannot be confused with source exhaustion.

## v6.1 - PXE, TimeRoast, and trust-path completion wave

- Completed PXE / NAA credential discovery, TimeRoasting, the SCCM PXE / NAA recovery mapping, child-to-parent trust paths, and external / forest trust paths.
- Kept hash material, cracked secrets, trust material, forged ticket artifacts, cross-domain service access, and privilege as separate proof boundaries.
- Raised strict methodology to **92 implemented / 34 partial / 1 gap / 0 stale**, **72% fully implemented**, and **99% represented**.

## v6.0 - canonical quick-win and relay completion wave

- Completed Java RMI, Log4Shell, Tomcat / JBoss manager, Veeam quick-win, and the separate MITM Kerberos relay canonical branch.
- Added delivery-ready owners with explicit execution metadata, conservative Evidence profiles, decision-path placement, reporting traceability, and bounded proof semantics.
- Raised strict methodology to **87 implemented / 34 partial / 6 gaps / 0 stale**, **69% fully implemented**, and **95% represented**.

## v5.9 - generic release-quality gate and canonical gap wave

- Added the generic release-quality gate and required zero implemented-quality / mapped-delivery debt before canonical expansion.
- Completed UAC bypass, EternalBlue, Exchange ProxyShell, GLPI, and Java deserialization canonical gaps with bounded Evidence semantics.
- Raised strict methodology to **82 implemented / 34 partial / 11 gaps / 0 stale**, **65% fully implemented**, and **91% represented**.

## v5.8 - canonical gap wave and release-contract enforcement

- Completed PrintNightmare, PrivExchange, ProxyNotShell, AppLocker bypass, and Kerberos relay.
- Added `tools/validate-release-pr.js` and the release-PR metadata/description contract.
- Raised strict methodology to **77 implemented / 34 partial / 16 gaps / 0 stale**, **61% fully implemented**, and **87% represented**.

## v5.7 - highest-priority canonical gap completion wave

- Added delivery-ready owners for DNSAdmins, Entra ID / AD Connect discovery, Certifried, MS14-068, and noPac with bounded proof semantics.
- Raised strict methodology to **72 implemented / 34 partial / 21 gaps / 0 stale**, **57% fully implemented**, and **83% represented**.

## v5.6 - mapped-delivery cleanup and canonical completion wave

- Cleared mapped-workflow delivery debt by adding explicit Evidence and execution contracts to remaining mapped workflows.
- Moved Shadow Credentials, gMSA password retrieval, S4U2Self/S4U service-ticket use, NTLM relay, and weak-web-service triage from partial to implemented.
- Raised strict methodology to **67 implemented / 34 partial / 26 gaps / 0 stale**, **53% fully implemented**, and **80% represented**.

## v5.5 - implemented-quality cleanup and canonical completion wave

- Cleared implemented-canonical quality debt and added dedicated owners for authenticated AD CS enumeration, delegation discovery, DPAPI backup-key collection, LSASS extraction, and token/session impersonation.
- Raised strict methodology to **62 implemented / 39 partial / 26 gaps / 0 stale**, **49% fully implemented**, and **80% represented**.

## v5.4 - synchronized README agenda and persistence completion wave

- Added `tools/sync-readme-build-next.js` so README Build Next is generated from the same live model used by the North Star Dashboard.
- Completed dedicated lifecycle owners for Skeleton Key, Custom SSP/memssp, Diamond Ticket, Sapphire Ticket, and DCShadow.
- Raised strict methodology to **57 implemented / 44 partial / 26 gaps / 0 stale**, **45% fully implemented**, and **80% represented**.

## v5.3 - implemented-quality delivery repair wave

- Added explicit Evidence profiles and execution metadata to existing implemented workflows including SMB, DNS, ticket hygiene, LAPS, Windows enumeration, SeImpersonate, DPAPI, and stored-credential hunting.
- Preserved the strict baseline at **52 implemented / 49 partial / 26 gaps / 0 stale**, **41% fully implemented**, and **80% represented**.

## v5.2 - delivery-ready canonical accounting and build-next queue

- Added delivery-ready accounting over the 127-section ledger and a prioritized Build Next queue ordered as implemented-quality debt, mapped-delivery debt, then canonical gaps.
- Preserved **52 / 49 / 26 / 0**, **41% fully implemented**, and **80% represented**.

## v5.1 - delivery-debt drill-down and dashboard quality gates

- Added mapped-workflow delivery-debt accounting and searchable visibility for missing Run, Evidence, execution-side, and reporting contracts.
- Preserved the five-item primary workflow and strict **52 / 49 / 26 / 0** baseline.

## v5.0 - dashboard IA, changelog separation, and UI hygiene

- Moved full project-health reporting from Home into the dedicated North Star Dashboard under More.
- Kept Home limited to a compact completion/representation summary and dashboard link.
- Added UI/UX policy accounting for five-item primary navigation, single-dashboard ownership, current-version contract, changelog ownership, and brand-surface policy.
- Constrained Orange Cyber Defense branding to Dashboard and Home while retaining source provenance underneath neutral Methodology/Next Steps/Report surfaces.
- Replaced stacked release cards in Guide with a current workflow guide and changelog link.
- Preserved **52 / 49 / 26 / 0**, **41% fully implemented**, **80% represented**.

## v4.9 - single North Star dashboard

- Added one consolidated project dashboard with hard counts and percentages for canonical methodology, represented coverage, Run -> Evidence readiness, Evidence profiles, execution metadata, decision-path mapping, tool review, reporting traceability, command UX, active-context progress, release trend, and backlog concentration.
- Added broad execution-metadata accounting and source-file backlog drill-down.
- Kept fixed commands separate from GUI-adjustable commands rather than treating every fixed command as a defect.

## v4.8 - domain persistence branch depth and lifecycle

- Added dedicated Silver Ticket, DSRM, Golden Certificate, credential-subsystem persistence, Diamond/Sapphire ticket, DCShadow, and ACL-persistence lifecycle workflows.
- Added explicit execution-side metadata, GUI controls where meaningful, conservative Evidence profiles, Next Steps integration, cleanup semantics, and report traceability.
- Moved Silver Ticket, DSRM, Golden Certificate, and ACL persistence to implemented while keeping Skeleton Key, Custom SSP, Diamond/Sapphire, and DCShadow partial.
- Raised canonical coverage to **52 implemented / 49 partial / 26 gaps / 0 stale**, **41% fully implemented**, **80% represented**.

## v4.7 - retroactive reporting traceability

- Added report contracts to all live mapped methodology cards.
- Kept finding-bearing methodology separate from path/context methodology.
- Added canonical decision-path provenance to Standard and OSCP report drafts.
- Added Draft Reporting Gaps from existing proof-readiness requirements without rewriting successful activity.

## v4.6 - SCCM branch depth and operator loop

- Expanded SCCM beyond reconnaissance into credential recovery, relay/site takeover, administrative execution, cleanup, and post-exploitation mapping.
- Added explicit Kali/Windows metadata and full Run -> Evidence contracts for the new SCCM workflows.
