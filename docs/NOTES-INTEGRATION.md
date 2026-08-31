# Notes Integration

The notes-integration queue uses Brandon's private HTB and OffSec Evernote exports as source material for normalized Obol improvements.

## Private source repo

Raw source material lives in the private repository:

```text
platocres/obol-source-notes
```

Public Obol must not commit the raw ENEX files. Public Obol receives only normalized, derived guidance, schema updates, tool-builder improvements, path changes, Evidence expectations, troubleshooting notes, and report guidance.

## Current source inventory

The private source repo currently stages:

```text
HTB - Penetration Tester.enex
  notes: 352
  embedded resources: 859
  sha256: ceeab3da0770ecd3709bcd2693b7a26a6390ad45c5bbada0234079e6eb2ff06f

OffSec PEN-200.enex
  notes: 204
  embedded resources: 467
  sha256: c02bf5958f2bf2aaa690b20e0a497b70eb83a8fc4276d2f1b52e11592e89acb1

Combined: 556 notes, 1,326 embedded resources
```

## Dispositions

Each note must eventually end in one of these terminal states:

- modeled
- superseded
- rejected
- private-reference-only

Modeled notes should produce one or more normalized Obol artifacts:

- path/action improvement;
- tool-builder toggle or mode;
- credential-mode handling;
- Evidence parser expectation;
- troubleshooting hint;
- cleanup/restoration hint;
- report guidance;
- contextual field-note panel content.

## Rule against raw course dumping

Do not copy course text, walkthrough text, screenshots, flags, or proprietary notebook content into the public Obol repo. Extract lessons and rewrite them as Obol-owned guidance.
