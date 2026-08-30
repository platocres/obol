# Obol North Star Contract

This document owns the detailed project-progress and source-accounting contract. `README.md` keeps the permanent North Star requirements visible at the project entry point; this file explains how those requirements are measured.

## Pinned upstream

Obol models its Active Directory methodology from Orange Cyberdefense 2025.03:

- Mind map: https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg
- Source repository: https://github.com/Orange-Cyberdefense/ocd-mindmaps/tree/main
- Pinned upstream commit: `6d16ca0d1434875e0617f2f3cfa825fad0bc7d7e`
- Pinned AD tree: `51b414fc0c0a1a4414e86986ec5e2b5225a6d698`

The normalized canonical denominator is 127 sections. It measures structural breadth, not whether every useful detail in the source has been exhausted.

## Three separate layers of progress

### Canonical breadth

Canonical breadth answers: **Is each normalized methodology section represented, and how completely?**

States remain implemented, partial, gap, and stale. The denominator stays pinned at 127 unless the pinned canonical snapshot is deliberately revised.

### Source inventory depth

At the v6.2 boundary, the then-34 partial canonical sections were frozen as a persistent source-depth baseline. This prevents a broad parent changing status from making unresolved subordinate source work disappear.

v8.0 completed that frozen 34-row baseline. The current inventory phase is broader: every methodology-bearing Orange source file must itself be atomized before source inventory can be called complete. v8.1 completed `low_access.md`; v8.2 completed `crack_hash.md`; v8.3 completed `low_hanging.md`; v8.4 completed `persistence.md`; v8.5 completes `dom_admin.md`.

### Atomic source fidelity

Atomic fidelity asks whether each inventoried source unit has been translated through the complete Obol operator contract. A broad owner mapping is not completion.

An atomic unit is fidelity-complete only when the relevant requirements are accounted for, including source structure, branch conditions, tool inventory, owner mapping, tool suitability, Run controls, Kali/Windows execution context, Evidence and proof boundaries, Next Steps, reporting/lineage, cleanup/restoration, and terminal disposition.

Terminal dispositions are `modeled`, `superseded`, or `rejected`, with rationale. Merely assigning one of those labels without satisfying the required review dimensions is not enough.

## Current v8.5 baseline

v8.5 preserves the completed canonical and frozen-baseline milestones while advancing whole-file source inventory:

- canonical: 127 / 127 implemented, 0 partial, 0 gaps, 0 stale;
- strict completion: 100%;
- represented coverage: 100%;
- methodology source files atomized: 14 / 17;
- frozen partial baselines decomposed: 34 / 34;
- currently inventoried atomic units fidelity-complete: 266 / 266;
- remaining inventoried atomic audits: 0;
- remaining whole-file source-inventory items: 3.

v8.5 makes no canonical breadth change. It completes `dom_admin.md` across NetExec and Impacket NTDS replication, NTDSUtil IFM creation, offline NTDS parsing, the retained Mimikatz DCSync variant, CertSync, DonPAPI backup-key collection, and the pinned Metasploit `domain_hashdump` branch.

Eight new source units receive complete terminal review. Seven are modeled through mature DCSync, credential-dump, and domain DPAPI backup-key owners. The session-coupled Metasploit branch is explicitly superseded by clearer direct workflows instead of being converted into a duplicate operator route.

Source command review remains explicit. The pinned NTDSUtil abbreviation is expanded into an explicit activate-instance/IFM/create sequence, the offline `secretsdump` route omits the unnecessary pinned `-hashes lmhash:nthash` placeholder when a matching SYSTEM hive is supplied, and the DonPAPI `- H` token is normalized to `-H`.

Evidence remains conservative. NTDS/SYSTEM snapshots, returned account hashes, certificate-assisted synchronization output, DPAPI backup keys, later authentication, service acceptance, execution, administrator/SYSTEM context, privilege, and cleanup remain separate proof states. Project/source accounting metadata never creates engagement facts.

The file-level denominator is now 14/17. Therefore 127/127 canonical implementation, 34/34 frozen-baseline decomposition, and 266/266 current atomic completion still do **not** mean Orange source fidelity is globally complete.

## Build Next ordering

The repository work queue is ordered by product quality:

1. implemented-quality repairs;
2. mapped-delivery repairs;
3. canonical gaps;
4. atomic source-fidelity audits for already-inventoried units;
5. frozen v6.2 baseline decomposition while any frozen rows remain;
6. whole-file source inventory for methodology-bearing files not yet fully atomized.

v8.5 has zero rows in priorities 1 through 5, so the live phase remains priority 6. The three remaining files are `know_vuln_auth.md`, `trusts.md`, and `valid_user.md`. `know_vuln_auth.md` is now first.

This ordering is derived from the repository model and exposed through the stable `C.currentProjectModel(...)` pointer. The current versioned implementation is `C.projectModel85(...)`.

## Current-project projection rule

Beginning with v6.6, project status has one current projection boundary. v6.8 added the stable non-versioned pointer `C.currentProjectModel(...)` so current consumers do not need to hard-code whichever versioned adapter happens to be newest. v8.5 keeps that pointer current while retaining versioned adapters as historical regression boundaries.

The Dashboard and README may present or summarize its output, but they should not keep independent current counts or competing Build Next calculations. The underlying domain models remain the owners of canonical, delivery, and source-fidelity semantics; the project model provides a stable current view over them.

## Completion language

Use these distinctions consistently:

- **100% represented** means every normalized canonical section has representation.
- **100% fully implemented** means all 127 normalized canonical sections are implemented.
- **Frozen baseline complete** means all 34 sections that were partial at the v6.2 boundary have been decomposed/accounted for.
- **Source fully inventoried** means every methodology-bearing Orange source file has a complete atomic source inventory.
- **Source fidelity complete** means every useful inventoried unit across the fully inventoried source has a complete terminal audit.
- **266/266 currently inventoried atomic units complete** means the present atomic ledger is complete, not that the remaining three source files have been exhausted.
- **Orange exhausted of useful ideas** may only be claimed when whole-file source inventory and atomic fidelity are complete, including explicit superseded/rejected rationales where appropriate.

Canonical breadth is not source exhaustion. Frozen-baseline completion is not source exhaustion either.

## Product integration requirements

Source work is useful only when it improves Obol as an operator product. Where applicable, modeled paths must connect to sensible command controls, explicit Kali/Windows execution context, conservative Evidence interpretation, Next Steps, cleanup/restoration, lineage, and reporting.

Source accounting is project metadata only. It must never create engagement facts, credentials, access, execution, privilege, or compromise state.
