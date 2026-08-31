# Obol North Star Contract

This document owns the detailed project-progress and source-accounting contract. `README.md` points future agents here instead of carrying the completed Orange accounting and historical Build Next queue inline.

## Pinned upstream

Obol models its Active Directory methodology from Orange Cyberdefense 2025.03:

- Mind map: https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg
- Source repository: https://github.com/Orange-Cyberdefense/ocd-mindmaps/tree/main
- Pinned upstream commit: `6d16ca0d1434875e0617f2f3cfa825fad0bc7d7e`
- Pinned AD tree: `51b414fc0c0a1a4414e86986ec5e2b5225a6d698`

The normalized canonical denominator is 127 sections. It measures structural breadth. Source inventory and atomic fidelity are tracked separately.

## Three separate layers of progress

### Canonical breadth

Canonical breadth answers whether each normalized methodology section is represented and how completely. States remain implemented, partial, gap, and stale. The denominator stays pinned at 127 unless the upstream snapshot is deliberately revised.

### Source inventory depth

At the v6.2 boundary, the then-34 partial canonical sections were frozen as a persistent source-depth baseline so later parent-status changes could not make unresolved subordinate work disappear.

v8.0 completed that 34-row historical baseline. Whole-file inventory then expanded the review to every methodology-bearing Orange source file. v8.1 through v8.7 completed the remaining file families in sequence, and v8.8 completes the final file, `valid_user.md`.

The file-level denominator is therefore 17/17.

### Atomic source fidelity

Atomic fidelity asks whether each inventoried source unit has been translated through the complete Obol operator contract. A broad owner mapping is not completion.

An atomic unit is fidelity-complete only when the relevant requirements are accounted for, including source structure, branch conditions, tool inventory, owner mapping, tool suitability, Run controls or an explicit supersession rationale, Kali/Windows execution context, Evidence and proof boundaries, Next Steps, reporting/lineage, cleanup/restoration, and terminal disposition.

Terminal dispositions are `modeled`, `superseded`, or `rejected`, with rationale. A terminal label without the required review dimensions is not fidelity completion.

## Current v8.8 baseline

v8.8 closes the pinned Orange 2025.03 methodology/source accounting phase:

- canonical: 127 / 127 implemented, 0 partial, 0 gaps, 0 stale;
- strict completion: 100%;
- represented coverage: 100%;
- methodology source files atomized: 17 / 17;
- frozen partial baselines decomposed: 34 / 34;
- inventoried atomic units fidelity-complete: 334 / 334;
- remaining inventoried atomic audits: 0;
- remaining whole-file source-inventory items: 0;
- implemented-quality repairs: 0;
- mapped-delivery repairs: 0.

v8.8 makes no canonical breadth change. It completes `valid_user.md` across password-policy review, lockout-aware password spraying, user-equals-password validation, AS-REP roastable-user discovery, AS-REP roasting, blind-Kerberoast source variants, and the pinned CVE-2022-33679 branch.

Eighteen final source units receive terminal review. Nine map directly to mature preferred owner surfaces. Nine redundant, specialized, or brittle source variants are explicitly superseded with rationale rather than silently omitted or duplicated.

Source review continues to prefer current, practical operator surfaces instead of copying upstream syntax blindly. Source corrections and supersessions remain part of provenance, not engagement state.

Evidence remains conservative. Policy discovery, authentication attempts, successful credentials, hashes, tickets, certificate or vulnerability material, service authentication, access, execution, administrator/SYSTEM context, privilege, and cleanup remain separate proof states. Project/source accounting metadata never creates engagement facts.

## Build Next ordering

The methodology/source queue retains this priority order whenever work exists:

1. implemented-quality repairs;
2. mapped-delivery repairs;
3. canonical gaps;
4. atomic source-fidelity audits for already-inventoried units;
5. frozen v6.2 baseline decomposition while any frozen rows remain;
6. whole-file source inventory for methodology-bearing files not yet fully atomized.

v8.8 has zero rows in all six categories. An empty methodology/source queue is now the correct result, not missing work.

Future work can focus on regression-equivalent historical runtime compaction, UX refinement, or other quality improvements. A new methodology/source queue should appear only if a real defect is discovered or the pinned upstream snapshot is deliberately changed.

The current state is derived from repository models and exposed through the stable `C.currentProjectModel(...)` pointer. The current versioned implementation is `C.projectModel88(...)`.

## Current-project projection rule

Beginning with v6.6, project status has one current projection boundary. v6.8 added the stable non-versioned pointer `C.currentProjectModel(...)` so current consumers do not need to hard-code the newest versioned adapter.

Dashboard may present or summarize that output, but product hardening has become the active dashboard layer. The historical methodology/source accounting is baseline context, not the current product queue. The underlying domain models remain the owners of canonical, delivery, and source-fidelity semantics; the project model provides a stable current view over them.

## Completion language

Use these distinctions consistently:

- **100% represented** means every normalized canonical section has representation.
- **100% fully implemented** means all 127 normalized canonical sections are implemented.
- **Frozen baseline complete** means all 34 sections that were partial at the v6.2 boundary have been decomposed/accounted for.
- **Source fully inventoried** means all 17 methodology-bearing Orange source files have complete atomic inventories.
- **Source fidelity complete** means every inventoried unit across the fully inventoried source has a complete terminal audit.
- **334/334 atomic units complete** is the current pinned atomic denominator for Orange 2025.03.
- **Orange exhausted of useful ideas under the pinned snapshot** may be claimed only while 17/17 file inventory, 334/334 atomic fidelity, explicit terminal rationales, and the required review dimensions remain intact.

v8.8 satisfies those conditions for the pinned Orange 2025.03 snapshot. This does not mean future Orange releases, new research, or newly discovered Obol defects are permanently irrelevant.

## Product integration requirements

Source work is useful only when it improves Obol as an operator product. Where applicable, modeled paths connect to sensible command controls, explicit Kali/Windows execution context, conservative Evidence interpretation, Next Steps, cleanup/restoration, lineage, and reporting. Redundant or brittle source variants may be superseded when the rationale and replacement ownership are explicit.

Source accounting is project metadata only. It must never create engagement facts, credentials, access, execution, privilege, or compromise state.
