# Tool Builder Inventory Organization

The remaining modeled Tool Builder inventory should be organized by function, not by a flat residual dump and not by whether a tool feels old, modern, niche, or popular.

Every real tool has a place. A `modeled` record means the full builder contract is still pending. It does not mean the tool is disposable.

## Functional slices

Use these slices when burning down the remaining modeled backlog:

- Active Directory and Kerberos
- Remote execution and lateral movement
- Pivoting, tunneling, and transport
- Enumeration and services
- Credential capture, relay, spraying, and cracking
- Privilege escalation and local enumeration
- Shells, payloads, and transfer helpers
- Web, browser, and request tooling
- Cloud, containers, databases, and services
- Controlled CVE and PoC helpers
- Operator utilities and binary/workshop helpers
- Needs classification

## Implementation rule

A tool should move from `modeled` to `implemented` only when Obol ships the full Tool Builder contract for it:

- schema-driven minimum viable command or guided handoff generation;
- supplied workspace or parsed Evidence prefill only;
- additive GUI controls for optional behavior;
- missing-field states instead of fake runnable placeholders;
- executable Evidence ingestion for decision-relevant output;
- conservative proof boundaries;
- cleanup and report guidance;
- Next Steps movement or blocking only when supported by Evidence;
- regression fixtures for generation, prefill, placeholder refusal, Evidence ingestion, and path behavior where applicable.

## Classic and overlapping tools

Classic tools, aliases, and overlapping wrappers should stay searchable and selectable. When two tools overlap, prefer a canonical builder relationship or compatibility note rather than deleting the older tool. For example, classic enum4linux still belongs under Enumeration and services even when enum4linux-ng is the preferred builder for some workflows.
