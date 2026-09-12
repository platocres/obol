# Tool Builder Implementation Standard

This standard exists to speed up Tool Builder backlog burn-down without turning Obol into generic command-wrapper sludge.

The rule is simple:

> Reuse plumbing. Preserve tool identity.

Shared internals are encouraged. Generic operator-facing tools are not.

## Shared plumbing that may be reused

Agents should reuse or create common primitives for boring repeated mechanics:

- target, URL, request, listener, callback, output-path, and wordlist inputs;
- credential material controls for passwords, hashes, tickets, certificates, keys, cookies, and tokens;
- Kerberos, certificate, proxy, header, cookie, timeout, rate, recursion, and output controls;
- missing-field rendering;
- fake-placeholder refusal;
- generated-command preview and copy/export behavior;
- Evidence paste-back scaffolding;
- common failure, blocked, partial, and inconclusive parsing;
- route, rendering, and inventory visibility tests.

These primitives are implementation aids. They are not user-facing replacement categories.

## Shared mechanics owner

Shared mechanics are owned by `data/product-hardening/tool-builder-shared-plumbing-current.js`.

New acceleration slices should call that helper for repeated mechanics such as schema registration, duplicate-safe builder install, inventory disposition patching, Evidence profile wrapping, intake wrapping, redaction, conservative state selection, Tools route refresh, and audit-queue refresh.

The split is strict:

> Shared code owns mechanics. Tool profiles own judgment.

A slice may add small local adapters for its subject area, such as database-specific profile defaults or analyzer patterns, but it must not clone the shared owner into another near-identical `common()`, `safeRegister()`, `patchInventory()`, `patchEvidence()`, `installIntake()`, `redact()`, or `stateFrom()` block.

## Bespoke profile required for every implemented tool

A modeled tool cannot be promoted to `implemented builder` unless it has a tool-specific profile covering:

- primary operator purpose;
- why an operator would choose this tool over its nearest neighbors;
- nearest-neighbor tools;
- required inputs;
- useful modes and presets;
- curated optional controls;
- dangerous, noisy, or situational controls that should be risk-labeled or explained;
- minimum viable command or guided handoff;
- Evidence success patterns;
- Evidence failure, blocked, partial, and inconclusive patterns;
- facts the tool can prove;
- facts the tool cannot prove;
- Next Steps movement, blocking, re-arming, or deprioritization behavior;
- cleanup and reporting notes;
- route-specific regression coverage.

A tool profile must make the tool feel like itself. `ffuf`, `feroxbuster`, `gobuster`, and `wfuzz` may share HTTP discovery primitives, but they must not render as identical generic web-fuzzer cards. `impacket-secretsdump`, `impacket-psexec`, and `impacket-getuserspns` may share authentication controls, but their purpose, modes, output, risk, and proof boundaries are different.

## Operator guidance is now part of implementation

Shared plumbing and bespoke profiles are not enough if the direct Tools route still behaves like a command vending machine. An implemented builder must teach the operator what situation they are in, why this tool is appropriate, what action preset to choose, what each action proves, what it does not prove, and what output belongs in Evidence.

Every future Tool Builder slice must keep this line intact:

- Shared code owns mechanics.
- Tool profiles own judgment.
- Operator guidance owns the human decision path.

A builder route fails the standard when it has fake clickable presets, non-working mode chips, empty accessory cards, raw native controls that look unfinished, legacy examples dominating the primary route, or too few meaningful actions for the real operator workflow. Database builders must explicitly cover identity, enumeration, privilege/capability checks, scoped reads, and risk-labeled database-to-OS command execution paths where the underlying database/tool supports them. See `docs/TOOL-BUILDER-OPERATOR-GUIDANCE-AUDIT.md` for the active repair queue and audit requirements.

## Direct-route command generation policy

Implemented Tool Builder routes are decision and command-generation surfaces. Do not proof-gate command generation.

Only missing command-construction inputs may invalidate the command preview. A command that needs a target, URL, username, password, hash, ticket, certificate, database, table, file path, listener, callback, or operator-supplied command text may stay incomplete until that value exists. The page must not require prior Evidence or proof before a human can select an action and generate a command.

Risk labels, privilege prerequisites, impact notes, and proof boundaries guide the decision. Evidence gates proof claims and Next Steps movement after the operator runs the command and pastes output back.

## Tests must enforce the distinction

Tool Builder tests should prove both halves of the contract:

- shared primitives work consistently across tools;
- each implemented tool exposes distinct identity, curated controls, Evidence expectations, and proof boundaries;
- acceleration slices call the shared mechanics owner instead of copy-pasting the same registration, inventory, Evidence, intake, redaction, and state-selection plumbing;
- no live Tools route category is named after backlog state;
- every inventory record appears in exactly one approved operator category;
- `implemented builder` and `modeled` status remain visible without creating a second inventory wall;
- neighboring tools that share plumbing do not have identical profile shells;
- implemented routes expose operator guidance, real action presets, preset interaction behavior, Evidence interpretation, no proof-gating command-generation language, and mobile-safe command validation.

## Implementation cadence

Future acceleration builds should implement tool families by plumbing reuse, but promote individual tools by profile. A good batch can ship several tools when shared primitives make that safe, but the `implemented builder` label still means the individual tool was examined and tested.

The shared plumbing pilot remains provisional. Do not refactor existing good bespoke builders into the shared helper until at least two new backlog slices prove that the helper reduces work without genericizing the operator UI or weakening Evidence boundaries. Do not resume broad modeled-tool acceleration until the operator-guidance repair has a passing contract and the existing implemented-builder surface has an audit path.
