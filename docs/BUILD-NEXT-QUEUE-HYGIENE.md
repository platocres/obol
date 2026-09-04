# Build Next queue hygiene

Build Next has two different concepts that must not be collapsed into one list.

## Standing gates

Standing gates describe rules that govern the whole phase. They are not the next concrete batch. Current standing gates include:

- Re-mine all already-reviewed notes from original sources.
- Burn down all 556 note dispositions.

These stay visible in README and dashboard context, but they must not rank as the next concrete item for an agent to build.

## Concrete live items

Concrete live items are buildable batches or product tasks. The generated README and dashboard should point agents at the highest-priority concrete item after completed packet work and standing gates are removed from the actionable queue.

As of this cleanup, the next concrete source-mining batch is XSS/session re-mining, not the umbrella re-mining gate and not the completed AD/pivoting packet.

## Completed packet guardrail

When a release lands a packet pass, the corresponding queue item must stop appearing as live. `data/product-hardening/build-next-queue-hygiene-current.js` owns this final hygiene layer by marking released packet work complete, preserving standing gates separately, and exposing `concreteBuildNext()` for README and dashboard rendering.

CI must fail if:

- a standing gate appears in concrete Build Next output,
- a completed packet appears in concrete Build Next output,
- AD/pivoting remains live after the v9.55 AD/pivoting proof file exists,
- the README goes back to the ambiguous `Highest-priority live items` wording instead of `Highest-priority concrete live items`.
