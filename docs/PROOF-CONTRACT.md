# Obol Evidence and Proof Contract

This document owns the durable rules that keep Obol's Evidence interpretation conservative. v6.6 reorganizes documentation and project-status presentation; it does not change these semantics.

## Core rule

Recognizing a command proves only that an action was attempted. Discovery output, startup text, configuration presence, generated artifacts, or tool invocation never silently becomes success, access, execution, privilege, or compromise.

Facts are created only when the relevant Evidence profile explicitly supports them.

## State boundaries

- Facts, Evidence, activity, credentials, progress, reachability, and artifacts stay scoped to the relevant host/domain context.
- Supported, refuted, and inconclusive knowledge remain distinct.
- Typed artifacts preserve producer/consumer lineage and review gates.
- Reachability distinguishes direct, pivot, observed-only, stale, and broken state.
- Successful activity preserves the historical command/Evidence snapshot instead of reconstructing the current UI.
- Foothold, privilege, objective, credential, and network transitions require explicit proof appropriate to the transition.
- Screenshot evidence remains externally confirmed by the operator; Obol does not capture or inspect screenshots.

## Common proof separations

The following patterns remain intentionally separate unless explicit Evidence bridges them:

- discovery vs. successful action;
- vulnerability indication vs. execution;
- listener/module startup vs. successful callback or relay;
- credential/certificate/ticket material vs. authenticated access;
- authenticated access vs. administrator/SYSTEM privilege;
- trust relationship context vs. cross-domain access;
- configuration change vs. effective control;
- collected offline material vs. recovered reusable credential;
- product/service presence vs. vulnerability;
- deployment/creation of an artifact vs. its successful use;
- intermediate credential material vs. the later target identity or objective it may enable.

## Negative and inconclusive Evidence

A failed action may refute a narrow hypothesis without proving the opposite of every related hypothesis. Ambiguous output remains inconclusive. Evidence parsers should prefer no new fact over a convenient but unsupported conclusion.

## Reporting

Reports consume preserved activities, Evidence, facts, artifacts, lineage, and explicit proof readiness. Project-progress metadata and source-audit state are never engagement Evidence and must not appear as proof of target compromise.

## Architecture constraint

Future architectural consolidation may change where parsers, state derivation, or reporting code lives, but it must preserve these observable proof boundaries. A smaller codebase is not an improvement if it makes success inference less conservative.
