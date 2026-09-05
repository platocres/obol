# Note Mining Slop Cleanup

The v9.61-v9.65 note-derived card work exposed a product problem: a card can be route-valid, path-linked, and still not help the operator.

Obol cards in Next Steps are not essays. They are operator decision points. A stuck user should be able to open the card and immediately answer:

- What do I run or click?
- Which variables do I fill in?
- What evidence do I paste back?
- What does success mean?
- What does failure mean?
- Where does the path go next?

## Cleanup rule

Do not create a new card merely because a source note contains a concept. First try to enrich an existing Orange-map card with field notes, gotchas, tool tips, evidence expectations, or report language.

Create a new path-visible card only when the note contains a distinct operator action that is not already covered elsewhere.

## Card disposition

Every mined or re-mined note contribution should be classified as one of these:

```text
KEEP AS CARD
The note adds a distinct operator action with commands or concrete GUI workflow.

MERGE INTO EXISTING CARD
The note improves a pre-existing Orange-map card or a retained note-derived card.

DEMOTE TO FIELD NOTE
The note is useful context but not a standalone Next Steps action.

DELETE OR REPLACE
The note-derived output is generic, redundant, or confusing.
```

The disposition is not paperwork. It controls what appears in the primary Path/Card flow. Merged and demoted concepts should stop competing as separate cards.

## No visible patch panels

Do not ship a corrective overlay as the final UI.

A label such as `v9.67 action-first cleanup`, `try this first`, or `field notes below are supporting context` can be useful while debugging, but it is not product-quality card UI. The content must be merged into the shared card renderer or the card must be demoted to supporting guidance.

The normal card should own the operator flow:

```text
Commands or GUI workflow
Evidence to paste back
Success and failure interpretation
Next path move
Field notes as supporting disclosure
```

There should not be a second action card taped above the real card.

## Path-visible card contract

A path-visible card must include either terminal commands or concrete GUI workflow steps. It must also include evidence to paste back, success/failure decision guidance, and the next path move.

If a card cannot meet that standard, it should not be a primary Next Steps card. Put the lesson in supporting field notes instead.

## Browser proof

Browser smoke must open retained primary cards and prove the normal card surface is actionable without rendering a corrective patch panel.

Browser smoke must also open demoted card URLs and prove they resolve to the retained parent card instead of resurrecting duplicate conceptual cards or returning `Unknown card`.

Passing route checks alone is not enough.
