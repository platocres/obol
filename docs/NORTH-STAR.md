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

Source inventory asks whether methodology-bearing source files and frozen partial parents have been decomposed into meaningful subordinate units rather than treated as one broad card.

### Atomic source fidelity

Atomic fidelity asks whether each inventoried source unit has been translated through the complete Obol operator contract. A broad owner mapping is not completion.

An atomic unit is fidelity-complete only when the relevant requirements are accounted for, including source structure, branch conditions, tool inventory, owner mapping, tool suitability, Run controls, Kali/Windows execution context, Evidence and proof boundaries, Next Steps, reporting/lineage, cleanup/restoration, and terminal disposition.

Terminal dispositions are `modeled`, `superseded`, or `rejected`, with rationale. Merely assigning one of those labels without satisfying the required review dimensions is not enough.

## Current v7.9 baseline

v7.9 completes the two `low_access.md` parents that remained partial at the frozen v6.2 boundary while intentionally preserving the larger low-access file inventory as unfinished:

- canonical: 124 / 127 implemented, 3 partial, 0 gaps, 0 stale;
- strict completion: 98%;
- represented coverage: 100%;
- methodology source files atomized: 9 / 17;
- frozen partial baselines decomposed: 31 / 34;
- currently inventoried atomic units fidelity-complete: 190 / 190;
- remaining inventoried atomic audits: 0;
- remaining source-inventory/decomposition items: 3.

The canonical advance in v7.9 is deliberately limited to `low_access.local-exploit` and `low_access.webdav`. Three new atomic units cover SMBGhost/CVE-2020-0796 validation, HiveNightmare/SeriousSAM/CVE-2021-36934 validation, and the WebDAV/searchConnector-ms coercion chain. All three are modeled with focused operator cards, explicit execution context, reporting lineage, and conservative Evidence.

The file-level atomized denominator remains 9/17. `low_access.md` is not marked fully atomized merely because its two frozen partial parents are complete; the other already-implemented low-access branches still require subordinate source inventory. This is the intended distinction between frozen-baseline decomposition and whole-file source inventory.

Evidence remains conservative. OS/build context, vulnerability conditions, shadow copies, lure creation, DNS changes, coercion triggers, inbound authentication, relay success, credential material, execution, administrator/SYSTEM context, privilege, and cleanup are separate proof states. A named CVE, a file open, or a successful coercion trigger never silently becomes exploit success or privilege.

The frozen v6.2 baseline remains 34. Therefore 190/190 currently inventoried units does **not** mean Orange source fidelity is globally complete. The three remaining broad source-depth rows are the active phase and will create new atomic denominators as useful source structure is mined.

## Build Next ordering

The repository work queue is ordered by product quality:

1. implemented-quality repairs;
2. mapped-delivery repairs;
3. canonical gaps;
4. atomic source-fidelity audits for already-inventoried units;
5. source-depth inventory/decomposition for remaining broad partial baselines.

v7.9 has zero rows in priorities 1 through 4, so priority 5 remains active. The final frozen source-depth queue begins with `crack_hash.md`.

This ordering is derived from the repository model and exposed through the stable `C.currentProjectModel(...)` pointer. The current versioned implementation is `C.projectModel79(...)`.

## Current-project projection rule

Beginning with v6.6, project status has one current projection boundary. v6.8 added the stable non-versioned pointer `C.currentProjectModel(...)` so current consumers do not need to hard-code whichever versioned adapter happens to be newest. v7.9 keeps that pointer current while retaining versioned adapters as historical regression boundaries.

The Dashboard and README may present or summarize its output, but they should not keep independent current counts or competing Build Next calculations. The underlying domain models remain the owners of canonical, delivery, and source-fidelity semantics; the project model provides a stable current view over them.

## Completion language

Use these distinctions consistently:

- **100% represented** means every normalized canonical section has representation.
- **100% fully implemented** would mean all 127 normalized canonical sections are implemented.
- **Source fully inventoried** would mean every methodology-bearing source file and every frozen source-depth baseline is explicitly decomposed/accounted for.
- **Source fidelity complete** would mean every useful inventoried unit across the fully inventoried source has a complete terminal audit.
- **190/190 currently inventoried atomic units complete** means the present atomized ledgers plus the three v7.9 low-access units are complete, not that the remaining source files or three broad frozen-baseline rows have been exhausted.
- **Orange exhausted of useful ideas** may only be claimed when the source inventory and fidelity work are complete, including explicit superseded/rejected rationales where appropriate.

Canonical breadth is not source exhaustion.

## Product integration requirements

Source work is useful only when it improves Obol as an operator product. Where applicable, modeled paths must connect to sensible command controls, explicit Kali/Windows execution context, conservative Evidence interpretation, Next Steps, cleanup/restoration, lineage, and reporting.

Source accounting is project metadata only. It must never create engagement facts, credentials, access, execution, privilege, or compromise state.
