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

v8.0 completed that frozen 34-row baseline. The current inventory phase is broader: every methodology-bearing Orange source file must itself be atomized before source inventory can be called complete. v8.1 completes the first file of this post-baseline phase, `low_access.md`.

### Atomic source fidelity

Atomic fidelity asks whether each inventoried source unit has been translated through the complete Obol operator contract. A broad owner mapping is not completion.

An atomic unit is fidelity-complete only when the relevant requirements are accounted for, including source structure, branch conditions, tool inventory, owner mapping, tool suitability, Run controls, Kali/Windows execution context, Evidence and proof boundaries, Next Steps, reporting/lineage, cleanup/restoration, and terminal disposition.

Terminal dispositions are `modeled`, `superseded`, or `rejected`, with rationale. Merely assigning one of those labels without satisfying the required review dimensions is not enough.

## Current v8.1 baseline

v8.1 preserves the completed canonical and frozen-baseline milestones while advancing whole-file source inventory:

- canonical: 127 / 127 implemented, 0 partial, 0 gaps, 0 stale;
- strict completion: 100%;
- represented coverage: 100%;
- methodology source files atomized: 10 / 17;
- frozen partial baselines decomposed: 34 / 34;
- currently inventoried atomic units fidelity-complete: 211 / 211;
- remaining inventoried atomic audits: 0;
- remaining whole-file source-inventory items: 7.

v8.1 makes no canonical breadth change. It completes the remaining subordinate inventory for `low_access.md` beneath already-implemented AppLocker, UAC, automated enumeration, credential-file hunting, Kerberos relay, and SeImpersonate parents while preserving the v7.9 SMBGhost/SeriousSAM and WebDAV units.

Seventeen new atomic units receive complete terminal review. Twelve are modeled through mature owners. Five legacy or duplicate variants are explicitly superseded with rationale: `mshta` as a preferred AppLocker route, `wsreset` and `msdt` as preferred UAC routes, RoguePotato as the preferred SeImpersonate route, and RemotePotato0 as a direct local-SYSTEM route.

Evidence remains conservative. Effective policy, writable paths, enumeration findings, keyword matches, relay/control state, ticket material, process launch, credential candidates, and administrator/SYSTEM context remain separate proof states. AppLocker path discovery does not prove bypass. PrivescCheck and winPEAS findings are leads until manually verified. A `findstr` match is not reusable access. SeImpersonatePrivilege alone is not SYSTEM. Project/source accounting metadata never creates engagement facts.

The file-level denominator is now 10/17. Therefore 127/127 canonical implementation, 34/34 frozen-baseline decomposition, and 211/211 current atomic completion still do **not** mean Orange source fidelity is globally complete.

## Build Next ordering

The repository work queue is ordered by product quality:

1. implemented-quality repairs;
2. mapped-delivery repairs;
3. canonical gaps;
4. atomic source-fidelity audits for already-inventoried units;
5. frozen v6.2 baseline decomposition while any frozen rows remain;
6. whole-file source inventory for methodology-bearing files not yet fully atomized.

v8.1 has zero rows in priorities 1 through 5, so the live phase remains priority 6. The seven remaining files are `crack_hash.md`, `low_hanging.md`, `persistence.md`, `dom_admin.md`, `know_vuln_auth.md`, `trusts.md`, and `valid_user.md`. `crack_hash.md` is now first.

This ordering is derived from the repository model and exposed through the stable `C.currentProjectModel(...)` pointer. The current versioned implementation is `C.projectModel81(...)`.

## Current-project projection rule

Beginning with v6.6, project status has one current projection boundary. v6.8 added the stable non-versioned pointer `C.currentProjectModel(...)` so current consumers do not need to hard-code whichever versioned adapter happens to be newest. v8.1 keeps that pointer current while retaining versioned adapters as historical regression boundaries.

The Dashboard and README may present or summarize its output, but they should not keep independent current counts or competing Build Next calculations. The underlying domain models remain the owners of canonical, delivery, and source-fidelity semantics; the project model provides a stable current view over them.

## Completion language

Use these distinctions consistently:

- **100% represented** means every normalized canonical section has representation.
- **100% fully implemented** means all 127 normalized canonical sections are implemented.
- **Frozen baseline complete** means all 34 sections that were partial at the v6.2 boundary have been decomposed/accounted for.
- **Source fully inventoried** means every methodology-bearing Orange source file has a complete atomic source inventory.
- **Source fidelity complete** means every useful inventoried unit across the fully inventoried source has a complete terminal audit.
- **211/211 currently inventoried atomic units complete** means the present atomic ledger is complete, not that the remaining seven source files have been exhausted.
- **Orange exhausted of useful ideas** may only be claimed when whole-file source inventory and atomic fidelity are complete, including explicit superseded/rejected rationales where appropriate.

Canonical breadth is not source exhaustion. Frozen-baseline completion is not source exhaustion either.

## Product integration requirements

Source work is useful only when it improves Obol as an operator product. Where applicable, modeled paths must connect to sensible command controls, explicit Kali/Windows execution context, conservative Evidence interpretation, Next Steps, cleanup/restoration, lineage, and reporting.

Source accounting is project metadata only. It must never create engagement facts, credentials, access, execution, privilege, or compromise state.
