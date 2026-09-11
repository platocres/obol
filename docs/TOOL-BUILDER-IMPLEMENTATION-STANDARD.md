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

## Bespoke profile required for every implemented tool

A modeled tool cannot be promoted to `implemented builder` unless it has a tool-specific profile covering:

- primary operator purpose;
- why an operator would choose this tool over its nearest neighbors;
- nearest-neighbor tools;
- required inputs;
- useful modes and presets;
- curated optional controls;
- dangerous, noisy, or situational controls that should be hidden, gated, or explained;
- minimum viable command or guided handoff;
- Evidence success patterns;
- Evidence failure, blocked, partial, and inconclusive patterns;
- facts the tool can prove;
- facts the tool cannot prove;
- Next Steps movement, blocking, re-arming, or deprioritization behavior;
- cleanup and reporting notes;
- route-specific regression coverage.

A tool profile must make the tool feel like itself. `ffuf`, `feroxbuster`, `gobuster`, and `wfuzz` may share HTTP discovery primitives, but they must not render as identical generic web-fuzzer cards. `impacket-secretsdump`, `impacket-psexec`, and `impacket-getuserspns` may share authentication controls, but their purpose, modes, output, risk, and proof boundaries are different.

## Tests must enforce the distinction

Tool Builder tests should prove both halves of the contract:

- shared primitives work consistently across tools;
- each implemented tool exposes distinct identity, curated controls, Evidence expectations, and proof boundaries;
- no live Tools route category is named after backlog state;
- every inventory record appears in exactly one approved operator category;
- `implemented builder` and `modeled` status remain visible without creating a second inventory wall;
- neighboring tools that share plumbing do not have identical profile shells.

## Implementation cadence

Future acceleration builds should implement tool families by plumbing reuse, but promote individual tools by profile. A good batch can ship several tools when shared primitives make that safe, but the `implemented builder` label still means the individual tool was examined and tested.
