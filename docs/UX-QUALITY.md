# UX Quality

The v9 UX queue exists because the source-fidelity build queue completed while the runtime and UI accumulated visible debt.

## UX priorities

The primary workflow should be user-first:

```text
Targets -> Evidence -> Next Steps -> operator runs command externally -> Evidence review or manual outcome -> Next Steps -> Report
```

Prime workflow space should show the user's active engagement state, not product-build internals.

## Seeded defects and goals

The v9.0 queue seeds these UX concerns:

- one visible version identity across title, header, settings, reports, exports, and dashboard;
- readable dark-theme links and focus states;
- Home prioritizes active target, known facts, queued intent, best next move, pending Evidence, and proof readiness;
- build metrics live in the dashboard/About surfaces;
- the master dashboard keeps Build Next near the top;
- tool GUIs are toggle-driven and context-aware;
- manual success/failure/blocked controls reduce Evidence-paste friction;
- field notes appear as relevant expandable context, not as a notebook dump;
- responsive layout works in exam-like screen sizes.

## v9.5 contrast and focus baseline

v9.5 completes the first dedicated accessibility quality package. Stable non-versioned owners now provide the current contrast/focus contract rather than adding another version-specific runtime layer.

- `assets/accessibility.css` owns current workspace link, hover, focus-visible, forced-colors, and reduced-motion treatment after the historical CSS chain.
- Current link and hover tokens must meet at least WCAG AA `4.5:1` contrast against supported dark page/panel surfaces.
- Current focus indicators must exceed `3:1` against the same dark surfaces and remain visible when controls sit inside clipped cards.
- `assets/accessibility.js` makes existing non-native clickable surfaces keyboard reachable and activates them with Enter or Space while leaving native controls native.
- Modal focus is moved inside an open dialog, contained during Tab/Shift+Tab traversal, and restored to the invoking control on close.
- `tools/validate-accessibility-contract.js` is the deterministic regression gate for these guarantees.
- `docs/visual-qa/contrast-focus.md` is the screenshot-assisted composition checklist for representative routes and viewport widths.

Future UI work should consume this baseline rather than locally inventing new focus colors or bypassing the stable accessibility owner.

## v9.8 user-first workflow baseline

v9.8 moves current workflow ownership into stable `assets/workflow-current.js` and removes product-build accounting from Home's prime scan path.

Home now prioritizes:

- the active target/context;
- known facts and typed artifacts;
- queued operator intent;
- Evidence attention and a direct path back to Evidence review;
- the evidence-ranked best next move and downstream unlock count;
- explicit blockers such as broken/unverified paths and credential validation gaps;
- recent activity;
- report proof readiness.

Product/build metrics remain available in `#/dashboard`, which uses the same Product Hardening renderer as the standalone dashboard. Home keeps only a quiet link to that surface instead of duplicating Product Hardening or Orange accounting totals.

Product Dashboard is exposed in the secondary navigation menu so it is easy to find without changing the five-item primary loop. Next Steps retains the existing recommendation engine and now adds an explicit decision brief showing best move, unlocks, queued intent, and blockers together.

`tools/validate-current-workflow.js` protects this division of responsibility. Future UI changes should preserve the operator-first Home/Path contract and keep project/build accounting in the dashboard rather than reintroducing release-specific status panels.

## v9.10 contextual field-notes baseline

v9.10 completes `ux-progressive-notes` by defining the presentation boundary before private notes are broadly atomized into public guidance.

`data/field-notes.js` is the stable normalized public data contract. Entries can bind to card IDs, tool IDs, Path IDs, or normalized tags and are typed as lesson, tool guidance, path guidance, troubleshooting, Evidence, report, or cleanup guidance. The shipped ledger is intentionally empty until private-source work produces reviewed Obol-owned records. The UI must not fabricate guidance merely to populate the surface.

`assets/field-notes.js` and `assets/field-notes.css` provide the stable current disclosure owner. Relevant notes appear near card actions or Path context inside a collapsed native `details` disclosure labeled **Field notes**. When no normalized entry matches the current context, no field-notes panel is shown. This keeps the primary operator scan path clean and avoids turning Obol into a notebook browser.

The v8.8 compatibility bridge route-gates these owners to card, Path, and Tools surfaces rather than paying their cost on ordinary Home startup. Keyboard focus and narrow-screen behavior reuse the current accessibility direction.

This release establishes the UI/data boundary only. It does not claim `notes-enex-extraction`, `notes-atomization-schema`, `notes-field-panel`, or the 556-note disposition burn-down complete. Those items remain accountable to the private-source integration queue and must populate the normalized owner only with reviewed, derived material.

`tools/validate-field-notes-ui.js` protects relevance matching, collapsed disclosure, route gating, and the private-source boundary.

## v9.31 operator-route clarity baseline

v9.31 starts retiring visible non-Dashboard layering without pretending the whole historical runtime can disappear in one pass.

`assets/operator-route-current.js` is the stable current owner for Path, Card, and Tools presentation. It is lazy-loaded by the existing v8.8 bridge, so the work does not add another versioned `app-v9.31.js` layer. The historical route code remains available for compatibility while the current owner controls the operator-facing scan path.

Path now renders a current-owned decision screen with best next move, unlocks, queued intent, blockers, and a compact recommendation list. The older Path panels are moved under supporting methodology detail instead of competing with the current decision surface.

Card and Tools routes now put current schema-driven builders first. Additional builders collapse by default, and raw legacy command blocks move behind one **Raw legacy commands** disclosure. This preserves command content for regression and fallback while making the guided builder the primary thing the operator sees.

Future route-retirement work should follow this pattern: current owner first, visible clutter collapsed, equivalence proven, then old live layers removed area by area.

## v9.11 responsive-density baseline

v9.11 completes `ux-mobile-density` with a stable current responsive-layout owner rather than another historical stylesheet layer.

`assets/responsive-current.css` loads after the historical cascade from the existing v8.8 bridge. It concentrates current narrow-width fixes for workspace grids, tab strips, cards, command options, credential/form rows, tracker tables, report previews, modals, and action groups. Inherently wide controls use local horizontal scrolling instead of forcing document-level overflow, while the stylesheet explicitly avoids hiding page overflow globally as a substitute for fixing layout defects.

`assets/product-hardening-dashboard.css` now carries dedicated dashboard breakpoints for narrow laptops, tablet widths, and mobile widths. The hero and track grids stack before becoming cramped, queue status pills move below copy when three-column rows no longer fit, and detailed tables keep their own scroll boundary. The same contract applies to the embedded `#/dashboard` route and standalone `product-hardening.html` entrypoint.

The field-notes disclosure also anchors its mobile expand/collapse affordance inside the summary so progressive disclosure remains usable when the summary stacks vertically.

Canonical responsive test sizes live in `tests/fixtures/responsive-v9.11-viewports.json`: 1280x800, 1024x768, 768x1024, and 390x844. `docs/visual-qa/responsive-density.md` defines representative route/composition checks and deliberately hands those same fixtures forward to the still-queued `qa-playwright-smoke` item rather than duplicating viewport policy later.

`tools/validate-responsive-layout.js` permanently protects viewport metadata, stable responsive-owner wiring, local-overflow behavior, dashboard reflow, field-note anchoring, the canonical visual-QA fixture, and the no-fake-v9.11-runtime-layer rule.

## Visual QA direction

Browser/screenshot QA should catch UI regressions in addition to deterministic repository validation. v9.5 establishes screenshot-assisted contrast/focus review; v9.11 adds a canonical responsive viewport/route contract. The separate `qa-playwright-smoke` item remains queued for automated route opening, console-error detection, document-overflow checks, and captured screenshots across the full core route set.
