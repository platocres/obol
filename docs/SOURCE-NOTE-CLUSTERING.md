# Source note clustering

Source-note clustering is the required bridge between private note review and public Obol product builds.

The goal is to stop treating the remaining private notes as arbitrary 20-note slices. Related notes should be grouped into public-safe semantic clusters first, then future builds should mine one cluster at a time into cards, analyzers, field notes, tool-builder changes, report guidance, or explicit private-only decisions.

## Required order

1. Read the complete review packet manifest from `platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json`.
2. Confirm packet policy is `complete_cleaned_text` and truncation policy is `none` before using a note.
3. Assign every remaining pending source note to exactly one tentative cluster.
4. Preserve manifest/source order within each cluster.
5. Record only public-safe metadata in Obol.
6. Queue cluster review items from the cluster ledger.
7. Mine each cluster as a product build before terminally dispositioning the notes inside it.

## Public cluster record

Each public cluster record must include:

- stable cluster ID
- public-safe title
- public-safe rationale
- status such as `seeded`, `open`, `ready-to-mine`, `private-heavy`, `needs-split`, `merged`, or `shipped`
- source packet IDs touched
- note IDs assigned
- owner card, proposed card, or future product gap
- expected product outputs
- unresolved split, merge, or private-boundary questions

A cluster record must not include course prose, private note text, target values, credentials, flags, screenshots, exact payload recipes, or solution chains.

## Review queue rule

After the global clustering pass lands, Product Build Next should select cluster queue items instead of blind manifest slices.

A cluster review build must answer:

- which cluster was selected
- which notes were read from complete packet text
- what product mechanic was extracted from the cluster as a whole
- where the value landed
- why no new primary card was created, when the value was folded into an existing card
- what future gap remains, when the cluster is not ready to ship as a feature
- which note rows received terminal dispositions after the cluster-level product decision

## Relationship to action cards

A cluster does not automatically become a card.

Create a new primary card only when the cluster has a distinct operator action spine with concrete commands or GUI workflow steps, evidence expectations, success and failure handling, path movement, and report boundaries. Otherwise, merge the value into an existing card, analyzer, field note, tool-builder surface, report mechanic, or future gap.

## Current handoff

v9.74 seeds the cluster ledger with the six clusters discovered during `notes-disposition-pending-review-002` and changes the next required queue item to `notes-global-source-clustering-v9.75`.

That next pass must cluster all 381 remaining pending notes before more terminal note dispositions are made.
