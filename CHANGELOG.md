## v10.20 — This product-hardening build organizes the remaining modeled Tool Builder inventory into coherent functional slices and tightens the handoff so future agents keep working the real Product Build Next queue while updating release history

- Reorganized the live Tools route's remaining Tool Builder inventory from one flat chip wall into functional implementation slices while keeping every real tool selectable.
- Exposed grouped modeled inventory through `OBOL_TOOL_BUILDER_IMPLEMENTATION_AUDIT_CURRENT.activeBatches()` and `auditSnapshot()` so future agents can burn down coherent tool families instead of random one-offs.
- Published the Tool Builder implementation audit owner as v10.20 so historical regressions can distinguish this inventory-organization build from the earlier implemented-builder audit.
- Added a focused Tool Builder inventory organization regression covering taxonomy, grouped active batches, and classic-tool classification.
- Slimmed the README back to an entrypoint with canonical linked docs, one Product Build Next block, explicit generated-block ownership, and a hard changelog rule for product-affecting builds.
- Added PR-template release-history fields so product-visible work cannot quietly skip `CHANGELOG.md` again.

## v10.18 — - Implements the next compact modeled-tool burn-down slice for CeWL, crunch, hashid, and name-that-hash

- Implements the next compact modeled-tool burn-down slice for CeWL, crunch, hashid, and name-that-hash.
- Adds a stable current owner, `data/product-hardening/credential-helper-tool-builders-current.js`, instead of restoring disposable release-specific Tool Library layers.
- Promotes CeWL and crunch from modeled inventory into schema-driven wordlist helper builders.
- Promotes hashid and name-that-hash from modeled inventory into schema-driven hash-identification helper builders.
- Adds conservative Evidence recognition for target-derived wordlists, bounded generation plans, hash-identification candidates, inconclusive output, blocked/failure states, and partial helper output.

## v10.17 — - Makes product-hardening extension loading route-aware so the Tool Library no longer loads the full historical v9 product-hardening layer stack on cache-clear visits to `#/tools`

- Makes product-hardening extension loading route-aware so the Tool Library no longer loads the full historical v9 product-hardening layer stack on cache-clear visits to `#/tools`.
- Keeps the compact current Tool Builder ownership live on Tools routes through `tool-builder-backlog-current.js` and `tool-builder-discovery-current.js`.
- Preserves the full historical product-hardening extension list for dashboard and non-Tools routes where older product-hardening route/card behavior may still be needed until it is separately compacted.
- Adds an explicit extension plan API so tests and future agents can tell the difference between historical release inventory and browser-live route loading.

## v10.16 — Product-hardening release v10.16 fixes the Tool Library layering regression after the modeled-tool burn-down releases. It compacts the recent Burp Suite and network/host discovery release owners into one current Tool Builder discovery owner and cleans the active Tool Builder queue so completed slices do not appear as pending work

- Added `data/product-hardening/tool-builder-discovery-current.js` as the current owner for Burp Suite plus masscan, Rustscan, naabu, fping, and nbtscan.
- Removed `data/product-hardening/burp-suite-tool-builder-v10.10.js` and `data/product-hardening/network-discovery-tool-builders-v10.15.js` from the live `data/current-release.js` extension list so the Tool Library no longer loads those release layers as part of normal startup.
- Kept Burp Suite as a first-class guided third-party GUI workflow with proxy setup, target scope, sitemap capture, Repeater, Intruder, Scanner triage, raw request/response import handoff, payload-position discipline, payload processing notes, grep/extract markers, scope/rate boundaries, and Burp Evidence ingestion.
- Kept masscan, Rustscan, naabu, fping, and nbtscan as implemented network/host discovery builders with minimum viable command generation, supplied/Evidence-derived prefill, additive controls, placeholder refusal, and network discovery Evidence ingestion.
- Cleaned the README Tool Builder queue and canonical Tool Builder queue doc so completed slices are not listed as active queue items and v10.15 is not described as the next modeled-tool build after it has merged.
