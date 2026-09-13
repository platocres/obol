# Tool Builder credential/auth guidance repair

This follow-up repairs the credential, cracking, and authentication-facing Tool Builder routes against the same operator-surface expectations established by the `tb-ffuf` golden reference.

## Scope

The repair owner is:

```text
data/product-hardening/credential-auth-guidance-current.js
```

It covers these implemented builders:

- `tb-hashcat`
- `tb-john`
- `tb-hydra`
- `tb-kerbrute`
- `tb-cewl`
- `tb-crunch`
- `tb-hashid`
- `tb-name-that-hash`
- `tb-nxc`
- `tb-secretsdump`
- `tb-getnpusers`
- `tb-getuserspns`

The first eight close the `credentials-cracking-auth` family in the implemented-builder audit ledger. The NetExec and Impacket entries are credential-heavy AD/SMB tools, so they are repaired here even though the broader AD/SMB/remote-access family remains active for tools such as `smbclient`, `smbmap`, `enum4linux-ng`, `ldapsearch`, `evil-winrm`, and `certipy`.

## Architecture correction

This repair must not exist as a render-time shadow surface.

The durable surface now lands on the schema registry itself:

```text
data/tool-builder-schema.js            # validated replace(builder) API
data/product-hardening/credential-auth-guidance-current.js
```

`credential-auth-guidance-current.js` enriches the already-registered builder records and replaces them through `OBOL_TOOL_BUILDER_SCHEMA.replace(builder)`. That replacement path runs the same schema validation used by initial registration, including guards for unknown `fieldGroups`, invalid select presets, invalid snippets, duplicated groups, and unsupported fields.

As a result, `schema.get('tb-hashcat')`, `schema.get('tb-hydra')`, and the other repaired records now return schema-owned `operatorGuide`, `fieldGroups`, `presets`, and snippets before the renderer touches them. The Tool Builder renderer no longer needs a credential-specific `html()` or `mount()` overlay to synthesize grouped fields at render time.

## Operator-surface contract

Each repaired route now receives schema-owned:

- Outcome-labelled mode cards that map to real command-generation controls.
- Plain-language operator guidance explaining when to choose the tool over nearby tools.
- Grouped fields with descriptions so the route does not collapse into an unstructured wall of options.
- Clickable presets for common cracking modes, formats, wordlists, rate/safety controls, and output paths.
- Success, failure, blocked, partial, exhausted, and ambiguity language that tells the operator what to paste back into Evidence.
- Proof-boundary language that keeps command generation separate from credential validity, password recovery, access, privilege, and compromise claims.

## Enforcement

The credential/auth family is enforced in the same current product phase as the golden Tool Builder surface contract:

```text
node tests/run-tool-surface-contract-tests.js
node tests/run-tool-credential-auth-guidance-tests.js
```

The surface contract now loads the credential/auth repair owner and checks the family directly through raw `schema.get()` records. The focused credential test also asserts that the repair is schema-validated, not a render-time overlay, and that `credentials-cracking-auth` no longer appears in `nextRepairBatches()`.

The browser smoke workflow includes a route-specific proof:

```text
node tests/playwright-credential-auth-surfaces.js
```

That browser proof opens the actual credential/auth routes, including Hashcat, John, Hydra, Kerbrute, CeWL, crunch, hashid, name-that-hash, NetExec, secretsdump, GetNPUsers, and GetUserSPNs. It verifies that each route mounts one implemented builder, renders mode cards, grouped sections, preset chips, the Evidence/report boundary, and no ad-hoc `More options` wall or fabricated lab target in the empty preview.

## Audit behavior

The implemented-builder audit now allows two-action helpers when the underlying builder genuinely has only two selectable modes. That prevents simple identifier helpers such as `hashid` and `name-that-hash` from inventing a fake third action just to satisfy the old minimum.

## Next expected repair family

After this repair, the implemented-builder audit should continue with the remaining AD/SMB/remote-access and network/service-enumeration surfaces before broad modeled-tool promotion resumes.
