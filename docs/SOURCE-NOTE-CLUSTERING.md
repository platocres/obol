# Source note clustering

Source-note clustering is the required bridge between private note review and public Obol product builds.

The goal is to stop treating the remaining private notes as arbitrary 20-note slices. Related notes are grouped into public-safe semantic clusters first, then future builds mine one cluster at a time into cards, analyzers, field notes, tool-builder changes, report guidance, or explicit private-only decisions.

## Required order

1. Read the complete review packet manifest from `platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json`.
2. Confirm packet policy is `complete_cleaned_text` and truncation policy is `none` before using a note.
3. Use the source note indexes and complete packet windows to place every remaining pending note into one public-safe semantic cluster.
4. Preserve source-window and manifest order inside each cluster.
5. Record only public-safe metadata in Obol.
6. Queue cluster review items from the cluster ledger.
7. Mine each cluster as a product build before terminally dispositioning the notes inside it.

## Public cluster record

Each public cluster record must include:

- stable cluster ID
- public-safe title
- public-safe rationale
- readiness state such as `ready-to-mine`, `needs-split`, or `private-heavy`
- source packet windows touched
- first and last note IDs for each window
- owner card, proposed card, or future product gap
- expected product outputs
- unresolved split, merge, or private-boundary questions

A cluster record must not include course prose, private note text, target values, credentials, flags, screenshots, exact payload recipes, or solution chains.

## Review queue rule

After v9.75, Product Build Next selects cluster queue items instead of blind manifest slices.

A cluster review build must answer:

- which cluster was selected
- which packet windows and note IDs were read from complete packet text
- what product mechanic was extracted from the cluster as a whole
- where the value landed
- why no new primary card was created, when the value was folded into an existing card
- what future gap remains, when the cluster is not ready to ship as a feature
- which note rows received terminal dispositions after the cluster-level product decision

## Relationship to action cards

A cluster does not automatically become a card.

Create a new primary card only when the cluster has a distinct operator action spine with concrete commands or GUI workflow steps, evidence expectations, success and failure handling, path movement, and report boundaries. Otherwise, merge the value into an existing card, analyzer, field note, tool-builder surface, report mechanic, or future gap.

## Current handoff

v9.75 completes the global source-note clustering pass. The 381 remaining pending source-note slots are assigned to 18 public-safe cluster queue items in `data/product-hardening/source-note-clusters-current.js`.

The next required build is `source-note-cluster-web-upload-file-inclusion-001`. It should read the complete packet text for the web upload/file inclusion cluster, mine that whole cluster into public-safe product mechanics, and only then resume terminal dispositions for the notes inside the cluster.
