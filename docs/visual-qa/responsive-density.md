# Responsive Density Visual QA

v9.11 establishes the deterministic responsive-layout contract that future browser automation should exercise. This checklist supplements static validation and is intentionally separate from the queued `qa-playwright-smoke` item.

## Representative viewports

Use the canonical viewport fixture in `tests/fixtures/responsive-v9.11-viewports.json`:

- **1280x800** - narrow laptop with the desktop shell still relevant;
- **1024x768** - exam-like or split-screen laptop layout;
- **768x1024** - tablet/narrow portrait layout;
- **390x844** - mobile-width stress case.

## Representative routes

Review these routes when screenshot-assisted QA is performed:

- `#/home`
- `#/boxes`
- `#/intake`
- `#/path`
- `#/tools/nmap`
- `#/report`
- `#/dashboard`

## Workspace checks

At each narrow viewport, confirm:

- the page itself does not require horizontal scrolling for normal operator content;
- the mobile navigation and collapsed sidebar do not overlap primary controls;
- Home metrics, quick actions, known-state cards, and Next Steps summaries reflow without clipped labels;
- card titles, badges, severities, action buttons, command options, credential rows, and form fields remain reachable;
- long commands wrap inside command blocks and leave room for the Copy control;
- lane tabs, phase ribbons, and other intentionally wide tab strips scroll locally instead of widening the page;
- wide tracker tables scroll inside their own boundary rather than forcing document-level overflow;
- report previews remain readable and bounded by the dynamic viewport;
- modals remain fully reachable, with actions wrapping when necessary;
- keyboard focus rings remain visible after components reflow.

## Product Dashboard checks

For both `#/dashboard` and the standalone `product-hardening.html` entrypoint, confirm:

- the hero score and progress bars stack before becoming cramped;
- Build Next queue rows keep rank, title/detail, and status readable;
- the status pill moves below queue copy when the row no longer has room for three columns;
- track/detail tables scroll locally on narrow widths;
- shell padding is reduced on mobile without eliminating readable separation;
- dashboard links and focus treatment retain the v9.5 accessibility contract.

## Field notes

On Card, Path, and Tools surfaces with normalized fixture guidance available, confirm the collapsed **Field notes** summary remains readable at mobile width and its expand/collapse affordance stays anchored inside the summary rather than drifting relative to the viewport.

## Browser-automation handoff

`qa-playwright-smoke` remains queued. When it is implemented, it should consume `tests/fixtures/responsive-v9.11-viewports.json` instead of inventing a separate viewport list, open the representative routes above, fail on console errors or document-level horizontal overflow, and capture screenshots for review.
