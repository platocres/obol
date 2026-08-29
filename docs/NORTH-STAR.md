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

An atomic unit is fidelity-complete only when the relevant requirements are accounted for, including:

1. source structure;
2. branch conditions;
3. tool inventory;
4. Obol owner mapping;
5. tool suitability review;
6. Run contract and semantic controls;
7. execution context;
8. Evidence and proof boundaries;
9. Next Steps transitions;
10. reporting and lineage;
11. cleanup/restoration where relevant;
12. terminal disposition.

Terminal dispositions are `modeled`, `superseded`, or `rejected`, with rationale. Merely assigning one of those labels without satisfying the required review dimensions is not enough.

## Current v7.2 baseline

v7.2 completes the pinned ACL / ACE source family and continues the quality-first queue into man-in-the-middle / relay source inventory:

- canonical: 109 / 127 implemented, 18 partial, 0 gaps, 0 stale;
- strict completion: 86%;
- represented coverage: 100%;
- methodology source files atomized: 3 / 17;
- frozen partial baselines decomposed: 16 / 34;
- currently inventoried atomic units fidelity-complete: 41 / 41;
- remaining inventoried atomic audits: 0;
- remaining source-inventory/decomposition items: 18.

The canonical advance in v7.2 is accounting reconciliation, not denominator inflation. The seven frozen ACL parents that remained partial at the v6.2 boundary advance only after their meaningful subordinate source branches are terminal and fidelity-complete: `acl.shadow-credentials`, `acl.group-control`, `acl.computer-control`, `acl.user-control`, `acl.ou-control`, `acl.gmsa`, and `acl.gpo`. Already-implemented DCSync, LAPS, and DNS Admin parents remain historical canonical completions while their source detail is now captured in the ACL atomic ledger.

The sixteen v7.2 ACL units cover DCSync, Shadow Credentials, group membership, group owner/DACL control, computer RBCD and Key Credential control, user password reset, targeted Kerberoast, user Key Credential control, user logon-script control, OU inheritable DACL and GPO-link control, gMSA password retrieval, LAPS retrieval, GPO control, and DNSAdmins ServerLevelPluginDll control. Rights discovery, directory or policy mutation, credential material, ticket material, authenticated access, execution, administrator access, privilege, and cleanup remain separate proof states throughout.

The frozen v6.2 baseline remains 34. Therefore 41/41 currently inventoried units does **not** mean Orange source fidelity is globally complete. It means the three atomized methodology files, `adcs.md`, `delegation.md`, and `acl.md`, have exhausted their current atomic ledgers. The 18 remaining broad source-inventory/decomposition rows are now the active phase and will create new atomic denominators as useful source structure is mined.

These denominators must remain visible. A percentage may summarize a denominator but must never make unfinished source disappear.

## Build Next ordering

The repository work queue is ordered by product quality, not by whichever metric is easiest to increase:

1. implemented-quality repairs;
2. mapped-delivery repairs;
3. canonical gaps;
4. atomic source-fidelity audits for already-inventoried units;
5. source-depth inventory/decomposition for remaining broad partial baselines.

v7.2 has zero rows in priorities 1 through 4, so priority 5 remains active. With ACL / ACE source depth complete, the next live source family is man-in-the-middle / relay beginning with `mitm.listen` and `mitm.ntlm-relay`.

This ordering is derived from the repository model and exposed through the stable `C.currentProjectModel(...)` pointer. The current versioned implementation is `C.projectModel72(...)`.

## Current-project projection rule

Beginning with v6.6, project status has one current projection boundary. v6.8 added the stable non-versioned pointer `C.currentProjectModel(...)` so current consumers do not need to hard-code whichever versioned adapter happens to be newest. v7.2 keeps that pointer current while retaining versioned adapters as historical regression boundaries.

The Dashboard and README may present or summarize its output, but they should not keep independent current counts or competing Build Next calculations. The underlying domain models remain the owners of canonical, delivery, and source-fidelity semantics; the project model provides a stable current view over them.

Versioned adapters remain useful as historical regression boundaries. They are not an invitation for current tooling or documentation to guess the newest version-specific function name.

## Completion language

Use these distinctions consistently:

- **100% represented** means every normalized canonical section has representation.
- **100% fully implemented** would mean all 127 normalized canonical sections are implemented.
- **Source fully inventoried** would mean every methodology-bearing source file and every frozen source-depth baseline is explicitly decomposed/accounted for.
- **Source fidelity complete** would mean every useful inventoried unit across the fully inventoried source has a complete terminal audit.
- **41/41 currently inventoried atomic units complete** means the present AD CS, Kerberos delegation, and ACL / ACE atomic ledgers are complete, not that the remaining 14 source files or 18 broad frozen-baseline rows have been exhausted.
- **Orange exhausted of useful ideas** may only be claimed when the source inventory and fidelity work are complete, including explicit superseded/rejected rationales where appropriate.

Canonical breadth is not source exhaustion.

## Product integration requirements

Source work is useful only when it improves Obol as an operator product. Where applicable, modeled paths must connect to sensible command controls, explicit Kali/Windows execution context, conservative Evidence interpretation, Next Steps, cleanup/restoration, lineage, and reporting.

Source accounting is project metadata only. It must never create engagement facts, credentials, access, execution, privilege, or compromise state.