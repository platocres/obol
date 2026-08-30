# Orange source-depth completion plan

## The problem

Obol's 127-section Orange 2025.03 denominator is a normalized structural inventory. It answers whether a canonical Orange section is represented and how completely Obol currently owns that section. It does **not** prove that every useful subordinate Orange branch, command variant, prerequisite, decision edge, failure condition, tool choice, artifact transition, cleanup obligation, Evidence signature, Next Steps transition, GUI control, or reporting implication beneath that section has been mined.

This distinction became critical at v6.2. The final canonical gap was closed, so Orange reached 100% representation at the normalized-section level. That is a breadth milestone, not a declaration that Orange has been exhausted as a source.

At the v6.2 boundary, 34 canonical sections remained partial. Those 34 sections are frozen as the initial **source-depth audit baseline**. Future builds must preserve those baseline keys even when a broad section is later upgraded, so unfinished subordinate source work cannot disappear from accounting.

## Current progress

As of v7.6, seven methodology-bearing source files have been atomized: `adcs.md`, `delegation.md`, `acl.md`, `mitm.md`, `authenticated.md`, `sccm.md`, and `admin.md`. Twenty-five of the 34 frozen partial baselines have been decomposed, and all 118 currently inventoried atomic units are fidelity-complete. Nine broad source-inventory/decomposition rows remain live, beginning with `no_creds.md`.

The completed 118/118 atomic denominator describes the seven source families already inventoried. It must expand as the remaining source files are decomposed; it is not a claim that the pinned Orange source is exhausted. The `admin.md` family also demonstrates that terminal accounting can include an explicit **superseded** outcome: the pinned pre-July-2022 PPLdump route remains auditable without being promoted as a preferred current operator workflow.

## v6.4 accounting model

v6.4 makes source-depth accounting atomic rather than section-only. North Star Dashboard now keeps three different denominators visible at the same time:

1. **Canonical breadth** — the stable 127 normalized Orange sections.
2. **Source inventory depth** — whether the methodology-bearing Orange source files and frozen partial sections have been decomposed into meaningful subordinate source units.
3. **Atomic source fidelity** — whether each inventoried unit has been carried through the complete Obol operator contract and given an explicit terminal disposition.

The first atomized file is `adcs.md`. Its seven broad partial canonical parents are decomposed into 19 meaningful source units spanning AD CS enumeration plus the distinct ESC families and important variants present in the pinned source. This includes ESC1, ESC2/3, ESC4, ESC5, ESC6, ESC7, ESC8, ESC9/10, ESC11, ESC13, ESC14, and ESC15 rather than treating one broad `adcs-esc` owner as proof that all of those branches are complete.

A broad owner mapping remains useful context, but it is **not** source-fidelity completion. The Dashboard therefore shows broad-owner coverage separately from atomic audit completion.

## What an atomic source unit records

Every source unit should preserve enough upstream structure to answer what the source actually says and what Obol must do with it. The machine-readable ledger records:

- source file and pinned source hash
- canonical parent key
- meaningful source node / subnode path
- prerequisite or branch-condition distinctions
- upstream tool inventory
- transitions to other methodology states or artifacts
- existing broad Obol owner mappings
- cleanup or restoration obligations when applicable
- explicit audit state and reason
- per-requirement review dimensions

The required North Star review dimensions are:

- source node / branch captured
- prerequisites / decision edges captured
- upstream tools captured
- Obol owner mapping captured
- tool suitability reviewed
- Run contract and semantic GUI controls reviewed
- Kali / Windows execution context reviewed
- copy/paste Evidence and proof boundaries reviewed
- Next Steps transitions reviewed
- reporting and lineage reviewed
- cleanup / restoration reviewed
- final modeled / superseded / rejected disposition recorded

## Audit states

Every atomic source unit and every frozen source-depth baseline item must eventually end in one of these explicit states:

- **modeled** — the useful Orange depth is represented end to end in Obol
- **superseded** — Orange is accounted for, but Obol intentionally uses a better, clearer, more current, or more practical workflow
- **rejected** — the source detail was reviewed and intentionally not incorporated, with a recorded reason
- **needs-audit** — the default state until the deeper review is complete

Do not copy an inferior or obsolete upstream path merely to raise a percentage. Superseding it with a better operator path is a successful audit outcome when the rationale is explicit.

A terminal status alone is not enough. A source unit is fidelity-complete only when its required North Star dimensions are also complete.

## Priority order

The permanent release ordering is:

1. implemented-quality repairs
2. mapped-delivery repairs
3. canonical gaps
4. atomic source-fidelity audits for already atomized source units
5. source-depth inventory work that decomposes the remaining broad partial sections into atomic units

This keeps quality debt ahead of methodology expansion while preventing broad section accounting from hiding unmined Orange detail.

## Dashboard and Build Next contract

North Star Dashboard remains authoritative. The Dashboard must separately show:

- canonical implemented / partial / gap accounting
- methodology source files atomized versus remaining
- frozen partial baseline sections decomposed versus remaining
- atomic source units inventoried
- atomic units with broad Obol owners
- atomic units reviewed and fidelity-complete
- modeled / superseded / rejected / needs-audit outcomes
- the aggregate North Star requirement matrix across atomic units
- a drill-down ledger showing each unit's source family, canonical parent, existing owner, and audit state

Build Next must preserve the ordering above. Once quality debt and canonical gaps are zero, already-inventoried atomic units are higher priority than still-unatomized broad sections because their missing delivery requirements are known precisely.

The README Build Next block remains a compact CI-enforced snapshot. The Dashboard owns the full source-fidelity drill-down.

## Completion target

The Orange phase is genuinely complete only when:

- canonical gaps are zero
- implemented-quality and mapped-delivery debt are zero
- every methodology-bearing Orange source file has an atomic source inventory
- every frozen v6.2 partial baseline has been decomposed or explicitly accounted for
- every useful atomic source unit has been reviewed
- every reviewed unit is explicitly modeled, superseded, or rejected with rationale
- required tool choices, command controls, Evidence handling, Next Steps transitions, execution context, cleanup, artifacts, and reporting are wired end to end

At that point Obol can reasonably claim that the pinned Orange 2025.03 methodology has been exhausted of useful ideas rather than merely represented structurally.
