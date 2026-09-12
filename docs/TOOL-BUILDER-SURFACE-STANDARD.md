# Tool Builder operator-surface standard

This is the required look and feel for every **implemented** Tool Builder route
(`#/tools/<tool>`). It exists so an operator can use a tool without already knowing
it, and so agents (ChatGPT 5.5 High and Opus) build every tool the same way instead
of re-inventing a stacked, ad-hoc page each time.

**Golden reference: `tb-ffuf` in [`data/tool-builders.js`](../data/tool-builders.js).**
Copy its shape. If in doubt, make your builder look like ffuf on the page.

**The gate: `node tests/run-tool-surface-contract-tests.js` must pass.** It audits
*every* registered builder for the baseline below and fails the build if you skip it.
The schema (`data/tool-builder-schema.js`) also rejects malformed surface metadata at
registration, so a bad builder throws immediately instead of shipping.

## What the renderer gives you for free

`assets/tool-builder-current.js` turns builder **data** into the surface. You supply
data; you do **not** write HTML/CSS. From your builder object it renders, in order:

1. One heading (the tool title) — the only `<h3>`.
2. **Mode cards** from `operatorGuide.actions` (the raw action `<select>` is hidden;
   the cards are the control). Clicking a card updates the command and the guidance.
3. The **Generated command** hero — syntax-highlighted, `FUZZ` marked, with an honest
   "add the required fields" state when inputs are missing. It never fabricates values.
4. Your **field groups**, each a titled section with a plain-language description.
5. Per-field **preset chips** and textarea **snippet buttons** (see below).
6. A **Reading the output** row (Proves / Doesn't prove / Paste back) from the active
   action's `proves` / `notProve` / `evidence`.
7. The Evidence & report boundary disclosure.

## The data contract

### `builder.fieldGroups` — group every field, describe every group
Ordered, all-visible sections. Every field belongs to exactly one group; anything you
leave out falls into a trailing "More options" group. Descriptions are **plain
language for a human**, not flag lists.

```js
fieldGroups:[
 {title:'Target', description:'The address the tool hits. Type FUZZ where each wordlist entry goes.', fields:['url']},
 {title:'Filters & matchers', description:'Which responses count as real hits vs. background noise.', fields:['matchCodes','filterCodes','autoCalibration']}
]
```

### `field.presets` — clickable values (the "click a wordlist and it loads" behaviour)
Give the common values as chips that load into the field on click. For a `select`
field every preset value must be a real option. Optional `speed` renders a fast/med/slow tag.

```js
{id:'wordlist', label:'Wordlist', type:'path', presets:[
 {label:'common', value:'/usr/share/wordlists/dirb/common.txt', speed:'fast'},
 {label:'raft dirs', value:'/usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt', speed:'med'}
]}
```

### `field.snippets` — textarea "add a line" buttons (headers, cookies, tokens)
Only on `textarea` fields. Each click appends a starter line the operator then edits.

```js
{id:'headers', label:'Headers & cookies', type:'textarea', snippets:[
 {label:'+ Session cookie', value:'Cookie: session=REPLACE_ME'},
 {label:'+ Bearer token', value:'Authorization: Bearer REPLACE_ME'}
]}
```

### `operatorGuide.actions` — outcome-labelled modes
Label modes by **what the operator gets**, not the flag. "Hidden pages & files", not
"Content/path fuzz". Each action needs `useWhen`, `requires`, `proves`, `notProve`,
`evidence`, and a `risk` of `low` / `normal` / `risky` / `dangerous`. For web-family
tools this lives in the family guidance owner (e.g.
`data/product-hardening/web-tool-guidance-current.js`); other families expose it via
their owner `profiles`.

## Rules (the test enforces these)

- **One heading.** The tool title is the only `<h3>`; group titles are `<h4>`.
- **No fabricated values.** Never seed `10.10.10.10`, `FUZZ.corp.local`, `Password123!`,
  or any lab-looking placeholder as a real value. Prefill only from workspace/Evidence
  state or safe tool defaults; otherwise show the missing-field state. Use the field
  `placeholder` for example text (grey), never a fake value.
- **No dead controls.** Every clickable thing does something. No decorative chip rows.
- **Plain language.** Group descriptions and mode labels read for a human who has not
  used the tool. Explain what a section is *for* and *when* to use it.
- **Presets for the common path, snippets for headers.** If a field has a handful of
  standard values, give presets. If it collects headers/cookies/tokens, give snippets.
- **Don't proof-gate command generation.** The command builds from concrete inputs;
  Evidence gates *proof and Next Steps*, not command building. (See
  [`TOOL-BUILDER-BUILD-QUEUE.md`](TOOL-BUILDER-BUILD-QUEUE.md).)

## Checklist before you call a tool done

1. `fieldGroups` cover all fields; each has a plain-language description.
2. Fields with standard values have `presets`; the header/cookie textarea has `snippets`.
3. `operatorGuide.actions` are outcome-labelled with full proof metadata and a risk level.
4. No fabricated placeholder is seeded as a value anywhere.
5. `node tests/run-tool-surface-contract-tests.js` passes.
6. `node tools/run-historical-contracts.js --phase v9-current-product` passes.
