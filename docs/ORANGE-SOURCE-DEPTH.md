# Orange source-depth completion plan

## The problem

Obol's 127-section Orange 2025.03 denominator is a normalized structural inventory. It answers whether a canonical Orange section is represented and how completely Obol currently owns that section. It does **not** prove that every useful subordinate Orange branch, command variant, prerequisite, decision edge, failure condition, tool choice, artifact transition, cleanup obligation, Evidence signature, Next Steps transition, GUI control, or reporting implication beneath that section has been mined.

At the v6.2 boundary, 34 canonical sections remained partial. Those 34 sections are frozen as the initial **source-depth audit baseline**. Future builds must preserve those baseline keys even when a broad section is later upgraded, so unfinished subordinate source work cannot disappear from accounting.

## Current progress

As of v7.9, nine methodology-bearing source files remain fully atomized at the file level: `adcs.md`, `delegation.md`, `acl.md`, `mitm.md`, `authenticated.md`, `sccm.md`, `admin.md`, `no_creds.md`, and `lat_move.md`. Thirty-one of the 34 frozen partial baselines have been decomposed, and all 190 currently inventoried atomic units are fidelity-complete. Three broad source-inventory/decomposition rows remain live.

v7.9 adds three `low_access.md` atomic units for SMBGhost, SeriousSAM, and WebDAV coercion and completes the two frozen low-access parents that were still partial. It deliberately does not increment the file-level atomized count because AppLocker, UAC, automated enumeration, file hunting, Kerberos relay, and service-account impersonation still require subordinate low-access source inventory even though their canonical rows were already implemented historically.

The completed 190/190 atomic denominator describes only the units inventoried so far. It must expand as the remaining source files and already-implemented low-access branches are decomposed; it is not a claim that the pinned Orange source is exhausted.

## Accounting model

North Star keeps three denominators visible at the same time:

1. **Canonical breadth** — the stable 127 normalized Orange sections.
2. **Source inventory depth** — whether methodology-bearing Orange source files and frozen partial sections have been decomposed into meaningful subordinate source units.
3. **Atomic source fidelity** — whether each inventoried unit has been carried through the complete Obol operator contract and given an explicit terminal disposition.

A broad owner mapping remains useful context, but it is **not** source-fidelity completion.

## What an atomic source unit records

Every source unit preserves enough upstream structure to answer what the source says and what Obol must do with it: source file/hash, canonical parent, source node path, prerequisites, tools, transitions, owner mappings, cleanup obligations, explicit audit state, rationale, and the full North Star review matrix.

The required review dimensions cover source structure, decision edges, tools, owner mapping, tool suitability, Run controls, execution context, Evidence/proof boundaries, Next Steps, reporting/lineage, cleanup, and terminal disposition.

## Audit states

Every atomic source unit and every frozen source-depth baseline item must eventually end in one of these explicit states:

- **modeled** — useful Orange depth is represented end to end in Obol;
- **superseded** — Orange is accounted for, but Obol intentionally uses a better or more current workflow;
- **rejected** — the source detail was reviewed and intentionally not incorporated, with a recorded reason;
- **needs-audit** — the default state until the deeper review is complete.

A terminal status alone is not enough. A source unit is fidelity-complete only when its required North Star dimensions are also complete.

## v7.9 low-access frozen-baseline wave

v7.9 models three atomic units under the two frozen low-access parents:

- SMBGhost/CVE-2020-0796 build, SMB capability, and bounded vulnerability-check context;
- SeriousSAM/HiveNightmare ACL and existing-shadow-copy validation without manufacturing new shadow state;
- WebDAV/searchConnector-ms coercion with temporary DNS preparation, lure creation, trigger, separately evidenced inbound authentication, and cleanup.

The release adds focused human-run cards for both source families. It keeps vulnerability conditions below execution/privilege, and keeps DNS/lure/coercion state below inbound authentication, relay, access, execution, and privilege.

## Priority order

The permanent release ordering is:

1. implemented-quality repairs
2. mapped-delivery repairs
3. canonical gaps
4. atomic source-fidelity audits for already atomized source units
5. source-depth inventory work that decomposes the remaining broad partial sections into atomic units

This keeps quality debt ahead of methodology expansion while preventing broad section accounting from hiding unmined Orange detail.

## Dashboard and Build Next contract

North Star Dashboard remains authoritative. The Dashboard separately shows canonical accounting, source files atomized, frozen baselines decomposed, atomic units inventoried, broad owner coverage, completed review dimensions, terminal dispositions, and the live queue. The README Build Next block remains a compact CI-enforced snapshot generated from the same current project model.

## Completion target

The Orange phase is genuinely complete only when canonical gaps and quality debt are zero, every methodology-bearing source file has an atomic source inventory, every frozen baseline is decomposed/accounted for, every useful atomic unit has a terminal reviewed disposition, and command controls, Evidence, Next Steps, execution context, cleanup, artifacts, and reporting are wired end to end.

Only then can Obol reasonably claim that the pinned Orange 2025.03 methodology has been exhausted of useful ideas rather than merely represented structurally.
