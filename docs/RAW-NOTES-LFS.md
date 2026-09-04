# Raw notes Git LFS access

This document exists because source re-mining fails if an agent stops at a Git LFS pointer. The active raw note exports live in the private source repo:

`https://github.com/platocres/obol-source-notes/tree/main/sources/raw`

The ENEX files are not normal small Git blobs. They are Git LFS objects. A 134-byte file that begins with `version https://git-lfs.github.com/spec/v1` is only the pointer and is not usable for source re-mining.

## Required HTB proof

Before claiming access to `HTB - Penetration Tester.enex`, the agent must personally materialize the real LFS object in a shell/runtime it can read:

```bash
git clone git@github.com:platocres/obol-source-notes.git
cd obol-source-notes
git lfs install
git lfs pull --include="sources/raw/HTB - Penetration Tester.enex"
python scripts/verify_sources.py
```

The verifier must report this exact HTB identity:

```text
OK sources/raw/HTB - Penetration Tester.enex bytes=194191214 sha256=ceeab3da0770ecd3709bcd2693b7a26a6390ad45c5bbada0234079e6eb2ff06f
```

A focused shell proof is also acceptable:

```bash
test "$(wc -c < 'sources/raw/HTB - Penetration Tester.enex')" -eq 194191214
printf '%s  %s\n' 'ceeab3da0770ecd3709bcd2693b7a26a6390ad45c5bbada0234079e6eb2ff06f' 'sources/raw/HTB - Penetration Tester.enex' | sha256sum -c -
grep -a -m1 '<en-export' 'sources/raw/HTB - Penetration Tester.enex'
```

Do not paste credentials or tokenized raw URLs into Obol docs, PR descriptions, logs, or generated artifacts. Use the environment's authenticated GitHub access.

## ChatGPT connector artifact route

When the ChatGPT runtime cannot clone GitHub, resolve DNS, run Git LFS, or read large binary files directly, use the private source repo's workflow artifacts instead of stopping at the pointer blob.

Known working connector route:

1. In the private source repo, inspect recent successful runs of `Private note review packets`.
2. Use the GitHub connector's workflow-artifact download action to download the `obol-private-review-packets` artifact.
3. Unzip the artifact locally and inspect `review-packets-fulltext/manifest.json` plus the themed `review-packets-fulltext/*.json` files.
4. Treat these files as private source-derived review material. Do not commit their raw text to public Obol.

A local artifact sanity check should look like this:

```bash
unzip -l /mnt/data/obol-private-review-packets.zip
python3 - <<'PY'
import json, zipfile
from collections import Counter
artifact='/mnt/data/obol-private-review-packets.zip'
with zipfile.ZipFile(artifact) as z:
    manifest=json.loads(z.read('review-packets-fulltext/manifest.json'))
    assert manifest['source_note_count']==556
    counts=Counter()
    for name in z.namelist():
        if not name.startswith('review-packets-fulltext/') or not name.endswith('.json') or name.endswith('manifest.json'):
            continue
        packet=json.loads(z.read(name))
        for note in packet['notes']:
            counts[note['source_id']]+=1
    assert counts['htb-penetration-tester'] > 0
    print(manifest['source_note_count'], counts['htb-penetration-tester'])
PY
```

This route proves the agent downloaded private, source-derived note text into its own workspace and can read it. It does not prove the agent downloaded the raw HTB ENEX binary itself.

## Connector and network failure rule

The GitHub contents API and normal `raw.githubusercontent.com` fetches can return only the 134-byte LFS pointer for these files. That is not a download. If the agent runtime cannot resolve GitHub hosts, cannot authenticate to the private repo, cannot run `git lfs`, or cannot read binary files, the agent must stop and say so.

Do not claim raw-ENEX access from:

- a GitHub contents listing;
- the 134-byte pointer blob;
- the `download_url` field returned by the contents API;
- a source manifest hash by itself;
- a prior CI run by itself;
- generated review-packet summaries by themselves.

Those facts can identify the expected object, but they do not prove this agent downloaded and read the HTB ENEX.

## GitHub Actions evidence

The source repo workflow `.github/workflows/private-review-packets.yml` checks out the private notes with `actions/checkout@v4` and `lfs: true`, then runs `python scripts/verify_sources.py`, then builds title/tag and full-text review packets. A successful run proves the runner materialized the raw LFS files and matched the manifest hashes.

That is useful supporting evidence, and it can prove that the private source repo is configured correctly. It does not prove that the current agent downloaded the HTB ENEX into its own readable workspace. A public Obol PR may cite this as source-system proof, but raw-source re-mining still requires the agent to read the actual local ENEX body or a full-text artifact generated from a successful LFS checkout.

The source manifest currently records:

```text
HTB - Penetration Tester.enex bytes=194191214 sha256=ceeab3da0770ecd3709bcd2693b7a26a6390ad45c5bbada0234079e6eb2ff06f
OffSec PEN-200.enex bytes=110367324 sha256=c02bf5958f2bf2aaa690b20e0a497b70eb83a8fc4276d2f1b52e11592e89acb1
```

## Required PR evidence

A PR that claims raw-source re-mining must include direct evidence that the agent's working environment materialized the file it used:

- `python scripts/verify_sources.py` output showing the HTB `OK` line above; or
- local `wc -c`, `sha256sum -c`, and ENEX marker checks for `sources/raw/HTB - Penetration Tester.enex`; or
- a clearly identified full-text artifact generated from a successful LFS checkout, downloaded by the agent, with local artifact sanity-check output and a clear note that the raw ENEX itself remains private and is not copied into public Obol.

Without one of those, the PR may improve handoff documentation, but it must not mark raw-source re-mining complete.
