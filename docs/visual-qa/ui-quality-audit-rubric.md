# UI Quality Audit Rubric

This rubric turns visual QA into a repeatable Obol product-hardening pass instead of ad-hoc taste checks.

Use it once per primary screen before filing UI findings. A finding should name the screen, rubric dimension, observed defect, expected operator-facing behavior, severity, and suggested owner.

## Screens to audit

Audit these primary routes first:

- Home
- Targets
- Evidence
- Next Steps
- Card route
- Tools
- Report
- Product Hardening Dashboard

## Scoring

Each dimension is scored from 0 to 2.

- 0 means the screen blocks or confuses the operator.
- 1 means the screen is usable but has visible friction.
- 2 means the screen supports the operator cleanly without extra explanation.

A screen passes the first audit when every dimension scores at least 1 and no severity-one defect remains. A screen is considered polished when every dimension scores 2 across desktop, narrow laptop, and mobile widths.

## Dimensions

### Hierarchy

The screen should make the operator's current goal obvious within the first glance. The primary action, current target context, best next move, and proof status should not compete with project accounting or implementation details.

### Density

The screen should not feel like a wall of controls. Dense technical material belongs behind progressive disclosure, grouped cards, or contextual details. The operator should be able to tell what to do next without scanning every historical note, tool, or metric.

### Consistency

Cards, headings, status chips, buttons, form labels, evidence summaries, and warning treatments should use the same interaction language across routes. Similar states should look and behave similarly.

### Affordance

Interactive controls should look interactive. Collapsible sections, mode selectors, copy buttons, route links, outcome buttons, filters, and builders should expose clear labels, hover/focus behavior, disabled state, and expected result.

### State feedback

The screen should show what changed after an action. Evidence paste, manual outcomes, copied commands, selected modes, saved target facts, filters, queue state, and report readiness should produce visible feedback that distinguishes success, failure, partial state, and blocked state.

### Accessibility

Keyboard focus, color contrast, reduced-motion behavior, labels, target size, and logical reading order should hold up on primary routes. Accessibility defects are product defects, not optional polish.

### Evidence movement

For any screen that asks the operator to run something externally or paste output, the UI must make the Evidence loop clear: what output is expected, what fact it can prove, what remains only a lead, and what Next Steps should change after pasted output is reviewed.

### Source boundary

Notes-derived guidance should teach the reusable idea without exposing private source wording, target-specific values, exploit recipes, credentials, flags, screenshots, or solution chains.

## Finding template

```text
Screen:
Viewport:
Rubric dimension:
Severity: 1 blocking / 2 confusing / 3 polish
Observed:
Expected:
Evidence or screenshot:
Suggested owner:
Queue item needed:
```

## Severity guide

Severity 1 findings block the operator from completing the workflow or cause wrong proof, wrong command, data loss, route failure, inaccessible controls, or misleading report readiness.

Severity 2 findings create confusion, clutter, duplicate controls, ambiguous next moves, inconsistent state feedback, or unnecessary scanning.

Severity 3 findings are polish issues that do not block workflow but make Obol feel less coherent.

## Queue filing rule

Do not file vague UI items such as `make dashboard better` or `clean up path`. Every audit finding must name the exact screen, rubric dimension, defect, acceptance criteria, and proof route.

If a finding affects a command, proof control, analyzer, or path movement, it must also state what Evidence ingestion should do with the pasted output. Static UI without Evidence movement is incomplete unless no pasted output is expected.
