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

v8.0 completes that frozen 34-row baseline. The next inventory phase is broader: every methodology-bearing Orange source file must itself be atomized before source inventory can be called complete.

### Atomic source fidelity

Atomic fidelity asks whether each inventoried source unit has been translated through the complete Obol operator contract. A broad owner mapping is not completion.

An atomic unit is fidelity-complete only when the relevant requirements are accounted for, including source structure, branch conditions, tool inventory, owner mapping, tool suitability, Run controls, Kali/Windows execution context, Evidence and proof boundaries, Next Steps, reporting/lineage, cleanup/restoration, and terminal disposition.

Terminal dispositions are `modeled`, `superseded`, or `rejected`, with rationale. Merely assigning one of those labels without satisfying the required review dimensions is not enough.

## Current v8.0 baseline

v8.0 closes both normalized canonical breadth and the frozen v6.2 partial-baseline decomposition milestone while deliberately keeping whole-file source inventory open:

- canonical: 127 / 127 implemented, 0 partial, 0 gaps, 0 stale;
- strict completion: 100%;
- represented coverage: 100%;
- methodology source files atomized: 9 / 17;
- frozen partial baselines decomposed: 34 / 34;
- currently inventoried atomic units fidelity-complete: 194 / 194;
- remaining inventoried atomic audits: 0;
- remaining whole-file source-inventory items: 8.

The canonical advance in v8.0 is deliberately limited to `crack_hash.pxe`, `low_hanging.zerologon`, and `persistence.add-da`, the final three parents from the frozen v6.2 source-depth baseline.

Four atomic units are added. SCCM/PXE AES128 cracking is modeled through the mature PXE/NAA workflow. Zerologon safe detection is modeled, while the pinned machine-account password-reset exploit is explicitly superseded rather than exposed as a preferred Obol command because a failed restore can damage the domain. Add Domain Admin membership is mapped to the mature ACL-controlled group-membership lifecycle with the pinned `net group` spelling plus explicit baseline and cleanup stages.

Evidence remains conservative. Hash material, recovered plaintext, vulnerability state, directory membership mutation, authenticated service use, execution, administrator/SYSTEM context, privilege, and cleanup are separate proof states. A vulnerable Zerologon check result is not exploitation. A Domain Admin membership change is not proof that the principal exercised privileged authorization. Project/source accounting metadata never creates engagement facts.

The file-level denominator remains 9/17. Therefore 127/127 canonical implementation, 34/34 frozen-baseline decomposition, and 194/194 current atomic completion still do **not** mean Orange source fidelity is globally complete.

## Build Next ordering

The repository work queue is ordered by product quality:

1. implemented-quality repairs;
2. mapped-delivery repairs;
3. canonical gaps;
4. atomic source-fidelity audits for already-inventoried units;
5. frozen v6.2 baseline decomposition while any frozen rows remain;
6. whole-file source inventory for methodology-bearing files not yet fully atomized.

v8.0 has zero rows in priorities 1 through 5, so the live phase is priority 6. The eight remaining files are `low_access.md`, `crack_hash.md`, `low_hanging.md`, `persistence.md`, `dom_admin.md`, `know_vuln_auth.md`, `trusts.md`, and `valid_user.md`. `low_access.md` is first because v7.9 already began its atomic inventory and the remaining branches can now be finished coherently.

This ordering is derived from the repository model and exposed through the stable `C.currentProjectModel(...)` pointer. The current versioned implementation is `C.projectModel80(...)`.

## Current-project projection rule

Beginning with v6.6, project status has one current projection boundary. v6.8 added the stable non-versioned pointer `C.currentProjectModel(...)` so current consumers do not need to hard-code whichever versioned adapter happens to be newest. v8.0 keeps that pointer current while retaining versioned adapters as historical regression boundaries.

The Dashboard and README may present or summarize its output, but they should not keep independent current counts or competing Build Next calculations. The underlying domain models remain the owners of canonical, delivery, and source-fidelity semantics; the project model provides a stable current view over them.

## Completion language

Use these distinctions consistently:

- **100% represented** means every normalized canonical section has representation.
- **100% fully implemented** means all 127 normalized canonical sections are implemented.
- **Frozen baseline complete** means all 34 sections that were partial at the v6.2 boundary have been decomposed/accounted for.
- **Source fully inventoried** means every methodology-bearing Orange source file has a complete atomic source inventory.
- **Source fidelity complete** means every useful inventoried unit across the fully inventoried source has a complete terminal audit.
- **194/194 currently inventoried atomic units complete** means the present atomic ledger is complete, not that the remaining eight source files have been exhausted.
- **Orange exhausted of useful ideas** may only be claimed when whole-file source inventory and atomic fidelity are complete, including explicit superseded/rejected rationales where appropriate.

Canonical breadth is not source exhaustion. Frozen-baseline completion is not source exhaustion either.

## Product integration requirements

Source work is useful only when it improves Obol as an operator product. Where applicable, modeled paths must connect to sensible command controls, explicit Kali/Windows execution context, conservative Evidence interpretation, Next Steps, cleanup/restoration, lineage, and reporting.

Source accounting is project metadata only. It must never create engagement facts, credentials, access, execution, privilege, or compromise state.
