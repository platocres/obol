# Orange source-depth completion plan

## Why this exists

Obol's 127-section Orange 2025.03 denominator is a normalized structural inventory. It answers whether a canonical section is represented. It does not, by itself, prove that every useful subordinate branch, prerequisite, tool variant, decision edge, Evidence boundary, Next Steps transition, cleanup obligation, or reporting implication has been reviewed.

At the v6.2 boundary, 34 partial canonical sections were frozen as a persistent source-depth baseline so later parent-status changes could not make unresolved source work disappear.

## Completed state in v8.8

The pinned Orange 2025.03 source-depth program is complete under the current North Star audit contract:

- canonical methodology: 127/127 implemented;
- frozen v6.2 partial baseline: 34/34 decomposed;
- methodology-bearing source files: 17/17 atomized;
- inventoried atomic units: 334/334 fidelity-complete;
- live methodology/source Build Next queue: 0;
- implemented-quality and mapped-delivery debt: 0.

All methodology-bearing files are now fully inventoried: `adcs.md`, `delegation.md`, `acl.md`, `mitm.md`, `authenticated.md`, `sccm.md`, `admin.md`, `no_creds.md`, `lat_move.md`, `low_access.md`, `crack_hash.md`, `low_hanging.md`, `persistence.md`, `dom_admin.md`, `know_vuln_auth.md`, `trusts.md`, and `valid_user.md`.

## Final v8.8 wave

v8.8 atomizes `valid_user.md`, the final outstanding file, into eighteen terminal source units spanning password-policy review, fine-grained policy variants, user-equals-password validation, common-password spraying, AS-REP roastable-user discovery, AS-REP roasting, blind-Kerberoast source variants, and the pinned CVE-2022-33679 branch.

Nine units map directly to mature preferred Obol owners. Nine redundant, specialized, or brittle source variants are explicitly superseded with rationale. Supersession is deliberate source accounting, not silent omission.

The final wave advances file-level inventory from 16/17 to 17/17 and atomic fidelity from 316/316 to 334/334. Canonical breadth remains 127/127 and the historical frozen baseline remains 34/34.

## Accounting model

North Star preserves three separate progress layers:

1. **Canonical breadth** — the stable 127 normalized Orange sections.
2. **Source inventory depth** — whole-file atomization plus the historical frozen 34-row baseline.
3. **Atomic source fidelity** — whether each inventoried unit has completed the full review contract and has a terminal disposition.

A broad card mapping remains useful context, but it is not source-fidelity completion.

## Atomic source-unit requirements

Every source unit preserves enough upstream structure to explain what was reviewed and how Obol handles it: source file/hash, canonical parent, source path, prerequisites, tool inventory, transitions, owner mappings, cleanup obligations where applicable, explicit audit state, rationale, and the North Star review matrix.

The required review dimensions cover source structure, decision edges, tools, owner mapping, tool suitability, Run controls or explicit supersession rationale, execution context, Evidence/proof boundaries, Next Steps, reporting/lineage, cleanup, and terminal disposition.

## Audit states

Every atomic unit ends as one of:

- **modeled** — useful source depth is represented through an Obol owner;
- **superseded** — the source is accounted for, but Obol intentionally uses a clearer, more current, less duplicative, or more practical workflow;
- **rejected** — the detail was reviewed and intentionally not incorporated, with rationale;
- **needs-audit** — temporary state before review is complete.

A terminal label alone is not enough. Required review dimensions must also be complete.

## Priority order

The permanent methodology/source ordering remains:

1. implemented-quality repairs;
2. mapped-delivery repairs;
3. canonical gaps;
4. atomic source-fidelity audits for inventoried units;
5. frozen v6.2 baseline decomposition;
6. whole-file source inventory.

v8.8 has zero rows in all six categories. Build Next being empty is now correct.

## Dashboard and Build Next contract

North Star Dashboard remains authoritative for project-wide hard numbers. README contains a compact CI-enforced projection generated from the same current project model.

Completed denominators must remain visible and regression-protected. Future work must not manufacture source debt merely to keep a queue non-empty.

A methodology/source queue may legitimately reappear if a real quality defect is discovered or the upstream Orange snapshot is deliberately repinned. In that case the new denominator and provenance must be explicit.

## Completion statement

The pinned Orange 2025.03 methodology-bearing source set is fully inventoried and all 334 inventoried units are fidelity-complete under Obol's current audit contract. This is the point at which the project may reasonably describe that pinned snapshot as exhausted of useful ideas, subject to explicit modeled/superseded/rejected rationales and continued regression protection.

This statement does not claim future Orange releases, new security research, or newly discovered Obol defects are permanently exhausted.
