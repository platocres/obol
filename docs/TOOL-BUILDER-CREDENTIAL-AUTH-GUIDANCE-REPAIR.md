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

## Operator-surface contract

Each repaired route now receives:

- Outcome-labelled mode cards that map to real command-generation controls.
- Plain-language operator guidance explaining when to choose the tool over nearby tools.
- Grouped fields with descriptions so the route does not collapse into an unstructured wall of options.
- Clickable presets for common cracking modes, formats, wordlists, rate/safety controls, and output paths.
- Success, failure, blocked, partial, exhausted, and ambiguity language that tells the operator what to paste back into Evidence.
- Proof-boundary language that keeps command generation separate from credential validity, password recovery, access, privilege, and compromise claims.

## Audit behavior

The implemented-builder audit now allows two-action helpers when the underlying builder genuinely has only two selectable modes. That prevents simple identifier helpers such as `hashid` and `name-that-hash` from inventing a fake third action just to satisfy the old minimum.

The new focused regression is:

```text
node tests/run-tool-credential-auth-guidance-tests.js
```

It validates the repaired effective surfaces, mode cards, grouped fields, preset chips, honest missing-field state, no fake lab target in previews, and the fact that `credentials-cracking-auth` no longer appears in `nextRepairBatches()`.

## Next expected repair family

After this repair, the implemented-builder audit should continue with the remaining AD/SMB/remote-access and network/service-enumeration surfaces before broad modeled-tool promotion resumes.
