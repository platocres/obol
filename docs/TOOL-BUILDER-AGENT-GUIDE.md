# Tool Builder agent guide — what "implemented" actually means

For the agents that build Tool Builders (ChatGPT 5.5 High and Opus 4.8 High). Read
this with [`TOOL-BUILDER-SURFACE-STANDARD.md`](TOOL-BUILDER-SURFACE-STANDARD.md),
[`TOOL-BUILDER-BUILD-QUEUE.md`](TOOL-BUILDER-BUILD-QUEUE.md), and
[`PROOF-CONTRACT.md`](PROOF-CONTRACT.md). The surface standard tells you how a builder
should *look*; this document exists because v10.22 shipped a whole family that looked
right and did not work. Green CI is not proof that a tool is usable.

## The failure this guide prevents

The v10.22 credential/auth family passed every structural gate and was still broken:

- **Commands would not generate from real input.** The renderer's anti-fabrication
  scrub deleted any value matching a lab blocklist (`hashes.txt`, `Password123!`,
  `domain.local`, `user`) before compiling. A hash file named `hashes.txt` — the value
  the field's own placeholder suggested — silently produced no command.
- **A fabricated value was seeded as a real value.** `fallbackDefaults` seeded a mask
  pattern (`?u?l?l?l?d`), which is exactly what the surface standard forbids and what
  read to the operator as "mask turned on by default."
- **Most of the family had no Evidence ingestion.** Ten of twelve tools could not turn
  pasted output into decision facts, so pasting a cracked hash or a dumped secret moved
  nothing. That is half of the definition of "implemented," and it was missing.
- **The queue item was marked as if complete** when the Definition of Done was not met.

The structural surface test could not catch any of these, because it only checks the
rendered shape. That is why v10.23 adds **functional** gates.

## A Tool Builder is "implemented" only when ALL of these are true

1. **It generates a command from realistic operator input** — in every mode/action, not
   just the default one. Test it the way an operator uses it: type a real value into
   every required field and confirm a command appears.
2. **It seeds no fabricated values.** Prefill only from real workspace/Evidence state or
   the builder's own schema `default`/`autofill` metadata. Never seed a lab-looking IP,
   password, hash, mask, domain, or filename as a *value*. Use the field `placeholder`
   for example text (it renders grey and is never submitted).
3. **The anti-fabrication guard stays intact.** Auto-seeded/programmatic values that
   match the blocklist must still be scrubbed so demo state cannot fake a valid command.
   The scrub is *touched-aware*: it exempts only fields the operator actually provided
   (typed, loaded from a preset/snippet, or restored from a save). If you build a new
   surface, do not defeat this — pass the operator's provided-field ids through as the
   touched set (the live Tools route does this from saved values).
4. **It ingests its output as Evidence.** There must be an analyzer that turns realistic
   pasted output into conservative outcome facts and a `positive`/`negative`/`blocked`/
   `partial` state, routed to a Path card, with secrets redacted. Global-intake coverage
   (e.g. ffuf in `obol-evidence-current.js`) or a dedicated owner
   (`tool-builder-*-evidence-current.js`) both count. No analyzer = not implemented.
5. **It respects the proof boundary.** A generated command is activity, never proof. A
   recovered/dumped/roastable/authenticated result is candidate material until reviewed
   Evidence and independent validation confirm it. Evidence gates proof and Next Steps
   movement; it never gates command building.
6. **It carries operator guidance** — outcome-labelled mode cards, grouped all-visible
   fields with plain-language descriptions, presets/snippets where useful, and the
   Reading-the-output row. See the surface standard; `tb-ffuf` is the golden reference.

## The gates you must run (and not weaken)

- `node tests/run-tool-surface-contract-tests.js` — the structural surface.
- `node tests/run-tool-builder-command-generation-tests.js` — **functional**: every
  builder compiles a command in every mode from realistic input, and the touched-aware
  scrub behaves in both directions. If a builder can't generate a command, this fails.
- `node tests/run-tool-builder-credential-evidence-tests.js` (and the web/auth-enum
  evidence tests) — every tool in the family turns real output into facts and stays
  honest (inconclusive) on unrelated noise.
- `node tools/validate-tool-builder-platform.js` and
  `node tools/run-historical-contracts.js --phase v9-current-product`.

If a gate is inconvenient, fix the builder — do not weaken the assertion. A passing
structural test over a tool that cannot build a command is the exact trap this guide
names.

## When you ship a family as a release, the PR body is a gate too

`validate-release-pr.js --repo-only` (what you run locally) checks the repository
artifacts but **not** the pull-request description. CI runs the full check, which reads
the PR body from the event payload and, for a product-hardening release, requires these
exact `##` section headings: **Summary**, **README handoff**, **Product-hardening
queue**, **Validation added**, and **Compatibility** (see `BUILDING.md`). Two
consequences that waste a cycle if you miss them:

- Write those sections into the PR description on the first push. A body that only has,
  say, "Summary" and "Validation" fails CI even though every code gate is green.
- The validator reads the body from the **push-time event payload**, so editing the
  description after the fact and re-running the failed job does not help — the re-run
  replays the old payload. The corrected body only takes effect on the next real push
  (a `synchronize` event). Get the body right before you push, not after.

## Do not mark a queue item complete until the head proves it

`tb-surface-*` items are not done when the surface renders. They are done when the whole
family meets items 1–6 above and the functional + evidence gates are green on the final
head. Record acceptance criteria, validation commands, and proof files in
`data/product-hardening/item-test-contracts.js` before flipping status, then regenerate
the Product Build Next block so the next family surfaces. Marking an item complete before
the Definition of Done is met is what left the queue stuck and the next build hidden.
