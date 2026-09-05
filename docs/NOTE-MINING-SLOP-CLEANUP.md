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
The note improves a pre-existing Orange-map card.

DEMOTE TO FIELD NOTE
The note is useful context but not a standalone Next Steps action.

DELETE OR REPLACE
The note-derived output is generic, redundant, or confusing.
```

## Path-visible card contract

A path-visible card must include either terminal commands or concrete GUI workflow steps. It must also include evidence to paste back, success/failure decision guidance, and the next path move.

If a card cannot meet that standard, it should not be a primary Next Steps card. Put the lesson in supporting field notes instead.

## Browser proof

The action-first browser smoke opens each recent note-derived card and checks that the page shows an action panel with commands or GUI workflow, paste-back evidence, decision guidance, and next-step guidance. Passing route checks alone is not enough.
