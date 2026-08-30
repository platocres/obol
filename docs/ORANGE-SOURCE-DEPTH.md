# Orange source-depth completion plan

## The problem

Obol's 127-section Orange 2025.03 denominator is a normalized structural inventory. It answers whether a canonical Orange section is represented and how completely Obol currently owns that section. It does **not** prove that every useful subordinate Orange branch, command variant, prerequisite, decision edge, failure condition, tool choice, artifact transition, cleanup obligation, Evidence signature, Next Steps transition, GUI control, or reporting implication beneath that section has been mined.

At the v6.2 boundary, 34 canonical sections remained partial. Those 34 sections were frozen as the initial **source-depth audit baseline** so later parent-status changes could not make unresolved subordinate work disappear.

## Current progress

As of v8.1, all 34 frozen v6.2 partial baselines are decomposed and fidelity-complete. The project is also 127/127 canonically implemented with zero quality debt and zero canonical gaps.

Ten of the 17 methodology-bearing source files are fully atomized at the file level: `adcs.md`, `delegation.md`, `acl.md`, `mitm.md`, `authenticated.md`, `sccm.md`, `admin.md`, `no_creds.md`, `lat_move.md`, and `low_access.md`.

The seven files still requiring complete whole-file inventory are:

- `crack_hash.md`
- `low_hanging.md`
- `persistence.md`
- `dom_admin.md`
- `know_vuln_auth.md`
- `trusts.md`
- `valid_user.md`

All 211 currently inventoried atomic units are fidelity-complete. That denominator must expand as these remaining files are atomized.

## v8.1 low_access.md whole-file wave

v8.1 completes the first whole-file inventory after the frozen v6.2 baseline by finishing `low_access.md` end to end. v7.9 had already atomized the SMBGhost/SeriousSAM local-exploit branch and the WebDAV/searchConnector-ms coercion branch. v8.1 inventories the remaining AppLocker, UAC, automated enumeration, credential-file search, Kerberos relay, and SeImpersonate source elements.

Seventeen new source units receive terminal dispositions and complete North Star dimension review. Twelve are modeled through mature owners. Five legacy or duplicate variants are explicitly superseded with rationale rather than silently omitted: `mshta`, `wsreset`, `msdt`, RoguePotato, and RemotePotato0 as a direct local-SYSTEM route.

The source wave advances the file-level denominator from 9/17 to 10/17 and the current atomic ledger from 194/194 to 211/211 complete. Canonical breadth remains 127/127 and the historical frozen baseline remains 34/34.

## Accounting model

North Star keeps three denominators visible at the same time:

1. **Canonical breadth** — the stable 127 normalized Orange sections.
2. **Source inventory depth** — whether methodology-bearing Orange source files and, historically, the frozen partial sections have been decomposed into meaningful subordinate source units.
3. **Atomic source fidelity** — whether each inventoried unit has been carried through the complete Obol operator contract and given an explicit terminal disposition.

A broad owner mapping remains useful context, but it is **not** source-fidelity completion.

## What an atomic source unit records

Every source unit preserves enough upstream structure to answer what the source says and what Obol must do with it: source file/hash, canonical parent, source node path, prerequisites, tools, transitions, owner mappings, cleanup obligations, explicit audit state, rationale, and the full North Star review matrix.

The required review dimensions cover source structure, decision edges, tools, owner mapping, tool suitability, Run controls, execution context, Evidence/proof boundaries, Next Steps, reporting/lineage, cleanup, and terminal disposition.

## Audit states

Every atomic source unit must eventually end in one of these explicit states:

- **modeled** — useful Orange depth is represented end to end in Obol;
- **superseded** — Orange is accounted for, but Obol intentionally uses a safer, clearer, more current, or more practical workflow;
- **rejected** — the source detail was reviewed and intentionally not incorporated, with a recorded reason;
- **needs-audit** — the default state until the deeper review is complete.

A terminal status alone is not enough. A source unit is fidelity-complete only when its required North Star dimensions are also complete.

## Priority order

The permanent release ordering is:

1. implemented-quality repairs
2. mapped-delivery repairs
3. canonical gaps
4. atomic source-fidelity audits for already inventoried source units
5. frozen v6.2 baseline decomposition while frozen rows remain
6. whole-file source inventory for remaining methodology-bearing files

v8.0 exhausted priority 5. v8.1 completes the first priority-6 whole-file inventory.

## Whole-file inventory phase

`low_access.md` is now fully atomized and protected as a completed file-level denominator. Build Next proceeds through `crack_hash.md`, `low_hanging.md`, `persistence.md`, `dom_admin.md`, `know_vuln_auth.md`, `trusts.md`, and `valid_user.md`.

Each file must be decomposed completely enough that useful source nodes are either modeled, superseded, or rejected with rationale. Completing only a previously frozen parent inside one of these files is not sufficient for file-level credit.

## Dashboard and Build Next contract

North Star Dashboard remains authoritative. The Dashboard separately shows canonical accounting, source files atomized, the historical frozen-baseline milestone, atomic units inventoried, broad owner coverage, completed review dimensions, terminal dispositions, and the live queue. The README Build Next block remains a compact CI-enforced snapshot generated from the same current project model.

Once the frozen baseline is complete, Build Next must not become empty while unatomized source files remain. It stays on explicit `source-file-inventory` rows so unfinished file-level source work remains visible.

## Completion target

The Orange phase is genuinely complete only when canonical gaps and quality debt are zero, every methodology-bearing Orange source file has an atomic source inventory, every useful atomic unit has a terminal reviewed disposition, and command controls, Evidence, Next Steps, execution context, cleanup, artifacts, and reporting are wired end to end.

Only then can Obol reasonably claim that the pinned Orange 2025.03 methodology has been exhausted of useful ideas rather than merely represented structurally or reconciled against the frozen v6.2 baseline.
