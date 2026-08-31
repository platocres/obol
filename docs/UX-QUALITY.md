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

## Visual QA direction

Browser/screenshot QA should catch UI regressions in addition to deterministic repository validation. v9.5 establishes screenshot-assisted contrast/focus review; the separate `qa-playwright-smoke` item remains queued for automated route opening, console-error detection, and captured screenshots across the full core route set.
