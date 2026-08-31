# Contrast and Focus Visual QA

This checklist supplements the deterministic `tools/validate-accessibility-contract.js` gate. It is intentionally screenshot-assisted rather than a substitute for the automated contrast calculations and keyboard/focus contract checks.

## Representative routes

Capture or inspect the current browser-local UI on these routes after the current release authority has loaded:

- `#/home`
- `#/boxes`
- `#/intake`
- `#/path`
- `#/report`
- `#/dashboard`
- standalone `product-hardening.html`

## Viewport set

Review each representative route at these minimum widths:

- `1280` px desktop
- `1024` px narrow laptop
- `768` px compact/exam-like layout

This is not the responsive-density acceptance test for `ux-mobile-density`; the purpose here is to make sure the contrast and focus repair remains visually obvious at the widths most likely to expose clipping or weak outlines.

## Link contrast pass

Confirm that ordinary content links are readable without hover on the dark page, panel, and nested-panel backgrounds. Hover must increase emphasis rather than make the link darker or less legible. The Product Hardening Dashboard link must meet the same expectation.

The deterministic validator enforces at least WCAG AA `4.5:1` contrast for the current link and hover tokens against the supported dark surfaces. Visual review should catch composition problems the static ratio cannot, such as a link inheriting an unexpected background or being obscured by another component.

## Keyboard and focus pass

Starting with the browser chrome out of focus, use `Tab` and `Shift+Tab` through each route. Verify that the focused element is always visually obvious and that the focus indicator is not clipped by cards, panels, or modals.

Use `Enter` and `Space` on the existing non-native interaction surfaces that Obol enhances for keyboard access, including card headers, state cards, phase/toggle chips, facts, progress/timer controls, and lane tabs. Activation should match a pointer click and must not double-trigger.

Open representative modals from normal workflow controls. Initial focus must move into the dialog, `Tab` and `Shift+Tab` must remain contained while the dialog is open, and focus must return to the invoking control after the dialog closes.

## Screenshot-assisted evidence

For release review, screenshots should make the following states easy to compare:

- ordinary content link at rest;
- the same link on hover when practical;
- keyboard focus on a native button or link;
- keyboard focus on an enhanced non-native control;
- a focused control inside a card that clips overflow;
- an open modal with focus visibly inside the dialog;
- the Product Hardening Dashboard link with keyboard focus.

A screenshot is supporting visual evidence, not the source of truth for the contrast ratio. `tools/validate-accessibility-contract.js` owns the deterministic ratio and contract checks; this checklist exists to catch layout/composition regressions that static analysis cannot see.
