# Tool Builder Inventory Organization

The Tools route uses one operator taxonomy. It must not create a second visible category named after the implementation backlog, such as “Remaining Tool Builder inventory by function.” `implemented builder` and `modeled` badges stay visible, but both statuses live inside the same real tool categories.

Every real tool has a place. A `modeled` record means the full builder contract is still pending. It does not mean the tool is disposable, deprecated, or unworthy of a route.

## Operator taxonomy

Use these categories on the live Tools route and in backlog burn-down planning:

- Web discovery and HTTP
- Credentials, cracking, and secrets
- Active Directory, Kerberos, LDAP, and PKI
- SMB, RPC, and network services
- Remote access, execution, and lateral movement
- Pivoting, proxying, and tunneling
- Privilege escalation and local enumeration
- Shells, payloads, listeners, and file transfer
- Databases
- Cloud and containers
- Exploit and CVE helpers
- Reporting, cleanup, and operator utilities

Do not expose backlog mechanics as a visible tool category. The backlog can be tracked in docs, dashboard state, and tests, but the operator should browse actual tool categories.

## Placement rules

- Place a tool where an operator would naturally look for it during a lab.
- Preserve specific tool identity even when a tool shares internal builder primitives with neighbors.
- Classic and overlapping tools stay searchable and selectable. `enum4linux` still belongs with SMB/RPC/service enumeration even when `enum4linux-ng` or another builder is preferred for some workflows.
- Aliases and wrappers should resolve to a canonical route only when that does not erase the user's ability to find the specific tool name they intended.
- When placement is ambiguous, prefer the category tied to the primary operator purpose, not the implementation library or package name.

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
