# Tool Builder operator-guidance audit and repair

This document is the handoff for the Tool Builder problem Brandon found while inspecting the first database acceleration tools after PRs #255 and #256.

## Why this exists

The shared Tool Builder plumbing pilot made the implementation mechanics more reusable, but inspection of `#/tools/mysql` and `#/tools/psql` showed that a route can be technically implemented and still not be good enough for a human operator.

The failure pattern was not limited to one database tool. It exposed a contract gap for all implemented builders:

- The page did not clearly teach when to use the tool or which action to pick.
- "Pickable modes and presets" looked clickable, but the chips did not change the selected builder mode or command.
- The database builders exposed too few useful operator actions, mostly connect/query/list variants.
- Common database follow-through, such as privilege checks, scoped enumeration, file capability checks, and database-backed OS command execution checks, was not surfaced as a guided path.
- Related legacy examples appeared too prominently and could dominate the direct tool route.
- Empty sections such as Recommended accessories rendered even when there was no useful content.
- Native selects and checkboxes looked unfinished, and the mobile command preview allowed the validation state to collide with the Generated command label.
- The mined notes were not being converted into enough plain-language operator instruction.

Brandon should not have to critique every tool by hand. Treat this as a pattern-level blocker.

## Command generation is not proof-gated

The direct Tools route is a decision and command-generation surface. It must not require existing Evidence or proof before a human can select an action and generate a command.

Only missing command-construction inputs may invalidate the preview. For example, a command that needs a host, database, table, file path, username, hash, ticket, listener, or callback may stay incomplete until that specific value exists. The page must not block an action because Obol has not already proven the prerequisite.

Risk labels, impact notes, privilege prerequisites, and proof boundaries are still required. They explain what the command may do, what privileges usually matter, and how to interpret the output after the operator runs it. Evidence gates proof claims and Next Steps movement, not command generation.

Use this language in the product:

- "Risk note" instead of "Risk gate".
- "Requires" or "Usually requires" instead of "blocked until proven".
- "Generated command is not proof" instead of "command is evidence-gated".
- "Paste output back into Evidence to prove or refute the claim" instead of "Evidence required before generating this action".

## Immediate queue rule

Do not continue broad modeled-tool acceleration until implemented builders have an operator-guidance contract and the current implemented builders are audited against it.

The Tool Builder sequence is:

1. Database operator-guidance repair, working presets, database action trees, command-exec/capability paths, mobile UI cleanup, contract tests, and documentation in the same build.
2. Implemented-builder audit ledger against the new contract.
3. Family repair batches for any failing existing implemented builders.
4. Resume modeled-tool acceleration only after implemented builders stop failing the guidance/preset/mobile contract.

## Required implemented-builder contract

An implemented builder must answer these questions before it counts as done:

- What situation is the operator in?
- When should this tool be chosen over nearby tools?
- What should the operator try first?
- What human-readable action presets are available?
- What command or handoff does each preset generate?
- What inputs are required, and why?
- What output proves success, failure, blocked, partial, or inconclusive state?
- What does the output not prove?
- What risky or noisy actions exist, and what prerequisites or preconditions matter?
- What should be pasted back into Evidence?
- How can that Evidence move, block, re-arm, or deprioritize Next Steps?
- What cleanup or report notes should the operator keep?

Command generation alone is not enough. A route that renders a form but does not teach the operator what to do with it is not complete.

## Database-specific repair expectations

The database owner is the first failing family and should be repaired first.

### PostgreSQL / `psql`

Expected action presets should include, at minimum:

- Test connection and identity.
- List databases.
- List schemas.
- List tables.
- Describe a table.
- Run one scoped SQL query.
- Show role privileges.
- Check superuser or server-program privilege.
- Check `COPY PROGRAM` capability.
- Generate a clearly labeled `COPY PROGRAM` command-execution probe.

The command-execution path must explain that it runs from the database server context, usually requires server-side program execution privilege, and should begin with small proof commands such as identity or hostname checks before any shell attempt. The command should still be selectable and generatable from the Tools page when required command fields are present.

### MySQL / MariaDB / `mysql`

Expected action presets should include, at minimum:

- Test connection and identity.
- List databases.
- List tables.
- Describe a table.
- Read scoped rows.
- Show grants.
- Check FILE privilege.
- Check `secure_file_priv`.
- Try a clearly labeled `LOAD_FILE` read.
- Assess UDF/plugin command-execution preconditions without pretending command execution is automatic.

The command-execution path must explain that MySQL OS command execution usually depends on privileges and server/plugin filesystem conditions, not merely a normal SQL prompt. The builder should guide capability checks before impact claims, without proof-gating command generation.

### MSSQL / `impacket-mssqlclient`

Expected action presets should include, at minimum:

- Test login and identity.
- Show SQL Server version.
- List databases.
- Run one scoped query.
- Check server role and sysadmin state.
- Check `xp_cmdshell` status.
- Generate an enable-`xp_cmdshell` command.
- Generate an `xp_cmdshell whoami` probe.
- Generate a custom `xp_cmdshell` command.

The impactful path must be explicit, risk-labeled, and proof-boundary labeled. Generated `xp_cmdshell` text is not proof of OS command execution until output is pasted back and parsed, but the direct tool route should not require existing Evidence before generating the selected command.

### Redis / `redis-cli`

Expected action presets should include, at minimum:

- PING service proof.
- INFO summary.
- Auth/ACL check.
- Keyspace summary.
- Scoped key read.
- `CONFIG GET dir` and `dbfilename` checks.
- Write/persistence risk assessment with explicit proof boundaries.

Dangerous write/persistence paths should be separated from normal enumeration and should not imply host compromise without independent Evidence. CONFIG/write actions may be risk-labeled and explained, but not proof-gated.

### Oracle / `odat`

Expected action presets should include, at minimum:

- Find SID/service.
- Validate credentials.
- Run TNS command checks.
- Enumerate privileges.
- Check file capability.
- Check scheduler or external-job style command capability where the module and permissions support it.

## UI repair expectations

The direct Tools route must be usable on mobile and desktop:

- Replace fake preset chips with real controls that change builder state, or render them as non-clickable summaries.
- Add a Start here or What are you trying to learn section above the form.
- Move legacy examples below the actual builder guidance and keep them collapsed by default.
- Hide empty Recommended accessories sections.
- Fix command-preview wrapping so validation text never collides with labels.
- Style selects and checkboxes so they fit the Obol surface instead of raw browser defaults.
- Use mined-note knowledge as rewritten context and instruction, not private source text or rote copied note fragments.
- Do not make Evidence state a prerequisite for generating a command. Evidence is required to prove what happened after the human runs it.

## Required tests

Add tests before calling the repair done:

- A Node contract test that fails any implemented builder without operator guidance and action presets.
- A browser interaction test that taps or selects presets and proves the builder mode/command changes.
- A mobile visual/layout test for command-preview validation wrapping.
- A regression that proves empty accessory sections do not render.
- A regression that proves legacy examples are collapsed below guidance.
- Database-specific tests that prove privilege, capability, and command-exec action presets exist with proof boundaries and without proof-gating command generation.
- Evidence tests for the new database action outputs, including success, failure, blocked, partial, and inconclusive states.

## Non-goals

- Do not add more modeled tools in the same build as the initial guidance repair.
- Do not re-mine all private notes from zero.
- Do not expose raw private note content.
- Do not create generic database mega-tools that smear together distinct tools.
- Do not claim database command execution from generated commands alone.
- Do not turn Obol into an automatic executor.
- Do not require Evidence or prior proof before a human can generate a command from the Tools page.

Obol remains browser-local and human-run. The tool builder should make the operator's next decision obvious, generate the selected command or handoff, and require pasted Evidence before proving anything.