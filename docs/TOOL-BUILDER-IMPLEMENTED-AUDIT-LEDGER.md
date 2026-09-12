# Tool Builder implemented audit ledger

This is Build 2 after the database operator-guidance repair.

The goal is not to add more modeled tools. The goal is to make Brandon stop having to manually inspect every implemented Tool Builder route and discover the same pattern-level problems by screenshot.

## Audit rule

Every registered implemented builder is audited against the operator-guidance contract:

- It must keep exact tool identity.
- It must explain when to choose the tool over nearby tools.
- It must offer human-readable action presets that map to real command-generation controls.
- It must explain what the selected action requires.
- It must explain what output can prove.
- It must explain what output does not prove.
- It must identify risky, noisy, or high-impact actions with risk labels and prerequisites.
- It must tell the operator what to paste back into Evidence.
- It must preserve command generation as activity, not proof.
- It must not proof-gate command generation on the direct Tools route.

Only missing command-construction inputs may invalidate a command preview. Evidence gates proof claims and Next Steps movement after the operator runs the command and pastes output back.

## Current result

Database builders pass the new operator-guidance contract after the repair build:

- `tb-mysql`
- `tb-psql`
- `tb-redis-cli`
- `tb-odat`
- `tb-impacket-mssqlclient`

The older implemented builders are expected to fail this stricter contract for now. Most already have command generation and Evidence boundaries, but they do not yet provide enough direct-route operator guidance, action explanations, or action-to-output interpretation.

This is intentional. Build 2 creates the pass/fail ledger so the failures are visible, grouped, and actionable instead of becoming Brandon's manual QA burden.

## Runtime owner

The audit owner is:

```text
 data/product-hardening/tool-builder-implemented-audit-current.js
```

It computes the ledger from the registered Tool Builder schema at runtime and exposes:

```text
OBOL_TOOL_BUILDER_IMPLEMENTED_AUDIT_CURRENT.snapshot()
OBOL_TOOL_BUILDER_IMPLEMENTED_AUDIT_CURRENT.records()
OBOL_TOOL_BUILDER_IMPLEMENTED_AUDIT_CURRENT.nextRepairBatches()
```

The audit rows include builder id, tool identity, family, pass/fail status, issue count, issue list, action count, profile presence, operator-guide presence, and proof-gating-language status.

## Next family repair batches

Use `nextRepairBatches()` as the repair source of truth. The expected first repair families are:

1. Web discovery and HTTP.
2. Credentials, cracking, and auth.
3. AD, SMB, and remote-access tooling.
4. Network and service enumeration.
5. Privilege escalation and local enumeration.
6. Other implemented builders.

Repair by family, not one random tool at a time.

## No proof-gating on Tools routes

Direct tool pages are for deciding what to do and generating the selected command or handoff.

Do not proof-gate command generation.

Correct behavior:

```text
The operator can select a risky action.
The page explains prerequisites, risk, output interpretation, and proof boundaries.
The command generates when concrete command inputs are present.
The output must be pasted back into Evidence before Obol claims the fact or moves the path.
```

Incorrect behavior:

```text
The operator cannot generate the command because Obol has not already proven the prerequisite.
The page uses proof-gated, risk-gated, or Evidence-gated language for command generation.
The page hides normal tool actions behind proof state.
```

## Acceptance for Build 2

Build 2 is complete when:

- The runtime audit owner exists.
- The audit test covers every registered implemented builder.
- Database builders pass.
- Older implemented builders fail visibly instead of being silently treated as done.
- Failures are grouped into family repair batches.
- The queue points to family repairs before any more modeled-tool acceleration.
- Database command-execution paths are risk-labeled and proof-boundary labeled, but not proof-gated.

## What future agents should do next

Do not resume broad modeled-tool acceleration yet.

Start Build 3 with the first failing family from the audit ledger, likely Web discovery and HTTP. Repair those implemented tool routes so they have operator guidance, real presets, meaningful action trees, output interpretation, mobile-safe UI, and proof boundaries without requiring prior Evidence to generate commands.
