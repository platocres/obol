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

## Visual QA direction

Future work should add browser/screenshot tests so UI regressions are caught by the repository, not only by whichever agent can visually inspect the live site.
