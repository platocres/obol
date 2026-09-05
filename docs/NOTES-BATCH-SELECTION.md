# Notes batch selection workflow

This document supports the Product Build Next note gate. It does not replace source re-mining. It makes the next packet selection deterministic so an agent cannot skip the live notes batch, accidentally mine pending notes before old-rubric reviewed notes, or claim source access from a Git LFS pointer.

## Scope

Use this helper when Product Build Next names an old-rubric reviewed source re-mining batch such as `notes-batch-old-rubric-reviewed-remine-001`.

The selector chooses notes by this policy:

```text
manifest/source order -> already-reviewed only -> exclude notes with full-spectrum audit rows or released re-mining proof -> take the requested batch size
```

It emits only public-safe selection metadata: note IDs, source IDs, packet files, source order, and manifest proof. It does not emit private note bodies, code blocks, resources, screenshots, raw course text, targets, credentials, flags, or note titles.

## Required source proof

The selector refuses to run unless the complete packet manifest matches the required schema-2 complete-text identity:

```text
schema_version=2
review_text_policy=complete_cleaned_text
truncation_policy=none
note_count=556
unique_note_count=556
resource_count=1326
review_text_chars=8725188
truncated_note_count=0
window_marker_count=0
packet_count=29
```

This proves the selector is pointed at the complete sequential packet route described in `docs/RAW-NOTES-LFS.md`. It does not prove the public Obol repository contains private source material, and it does not authorize publishing private source expression.

## Usage

From a workspace that has both repositories checked out, run the selector against the private source packet manifest and packet root. Supply the current public reviewed-note IDs and the already full-spectrum re-mined or released-proof exclusion IDs from the live Obol note-progress projection.

```bash
node tools/select-next-notes-batch.js \
  --manifest ../obol-source-notes/data/review-packets/manifest.json \
  --packets-root ../obol-source-notes \
  --reviewed-list /tmp/obol-reviewed-note-ids.txt \
  --already-remined-list /tmp/obol-full-spectrum-remined-note-ids.txt \
  --exclude-list /tmp/obol-released-remine-proof-note-ids.txt \
  --count 20
```

The output is safe to paste into a PR description as source-selection proof because it does not contain note bodies. The source re-mining itself still requires reading each selected private note from the complete packet and then publishing only generalized Obol-owned product output or explicit negative proof.

## Acceptance boundary

A selected batch is not complete merely because the selector produced note IDs. The re-mining PR must still provide, for every selected note, all full-spectrum audit decisions required by `docs/NOTE-MINING-RUBRIC.md`:

- path bindings;
- tool cards;
- GUI controls;
- scripts and one-liners;
- command templates;
- terminal-output analyzers;
- Evidence expectations;
- path movement;
- lessons and examples;
- troubleshooting;
- cleanup;
- report guidance;
- product mechanics;
- product gaps;
- additive Orange baseline;
- source-boundary proof.

Each dimension must end as `added`, `covered`, `queued`, `private-only`, `not-applicable`, or `blocked` with specific proof. Vague `none`, `no change`, and `not useful` decisions are invalid.

## Validation

Run the focused test before using the selector in a release branch:

```bash
node tests/run-notes-batch-selector-tests.js
```

For a product release that actually closes or advances a re-mining batch, also run the normal notes gates:

```bash
node tools/validate-note-remining-audits.js
node tools/validate-notes-impact.js
node tools/validate-note-integration.js
node tools/sync-product-build-next.js --check
```
