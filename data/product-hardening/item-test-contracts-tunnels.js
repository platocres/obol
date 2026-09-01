'use strict';
(function(root){
const base=root.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
if(!base||!base.contracts)throw new Error('Base Product Hardening item-test contracts must load before current contract extensions');
function currentReleaseAtLeast(major,minor){
 const release=root.OBOL_CURRENT_RELEASE;
 const match=release&&String(release.version||'').match(/^(\d+)\.(\d+)/);
 if(!match)return false;
 const currentMajor=Number(match[1]),currentMinor=Number(match[2]);
 return currentMajor>major||(currentMajor===major&&currentMinor>=minor);
}
base.contracts['tb-chisel']={
 acceptance:['Tool and relevant Card routes expose one schema-driven chisel builder with explicit client/server roles; normal and reverse SOCKS; TCP/UDP forward and reverse-forward remotes; listener/server ports; optional authentication, fingerprint, headers, proxy, TLS/mTLS, keepalive and retry controls; deterministic copy-only command generation; cleanup guidance; and proof boundaries that require reviewed connection/listener evidence before tunnel or reachability claims.'],
 validationCommands:['node tests/run-v9.21-tests.js','node tools/validate-product-hardening-queue.js','node tools/validate-asset-references.js'],
 proofFiles:['data/tool-builders-tunnels.js','assets/runtime-current.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts-tunnels.js','tests/run-v9.21-tests.js','docs/TOOL-BUILDER-COVERAGE.md','docs/v9.21.md']
};
base.contracts['tb-ssh-plink']={
 acceptance:['Tool and relevant Card routes expose one shared schema-driven SSH/plink forwarding builder with declared OpenSSH/Plink executable selection; local, remote, and dynamic forwarding; bind/listen/destination controls; SSH port, username, agent/key/password modes where supported; OpenSSH forward-failure and host-key controls; Plink batch and host-key pinning controls; deterministic copy-only generation; cleanup guidance; and reviewed-Evidence boundaries for listeners, reachability, SOCKS behavior, remote exposure, and teardown.'],
 validationCommands:['node tests/run-v9.21-tests.js','node tools/validate-product-hardening-queue.js','node tools/validate-asset-references.js'],
 proofFiles:['data/tool-builders-tunnels.js','assets/runtime-current.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts-tunnels.js','tests/run-v9.21-tests.js','docs/TOOL-BUILDER-COVERAGE.md','docs/v9.21.md']
};
base.version='9.21.0';
if(currentReleaseAtLeast(9,22)){
 const commonProof=['data/credential-material.js','assets/credential-material-current.js','assets/runtime-current.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts-tunnels.js','tests/run-v9.22-tests.js','docs/v9.22.md'];
 base.contracts['cred-schema']={acceptance:['A stable browser-local Credential Material model represents password, hash, challenge-response, ticket, certificate, key, cookie, token, and opaque-secret material with type, context, provenance, sensitivity, candidate/validated/rejected state, typed-artifact migration compatibility, and no automatic authentication or command execution.'],validationCommands:['node tests/run-v9.22-tests.js','node tools/validate-product-hardening-queue.js','node tools/validate-asset-references.js'],proofFiles:commonProof};
 base.contracts['cred-hash-routing']={acceptance:['Pasted common lab hash shapes are classified with explicit confidence, ambiguous 32-hex input remains visibly ambiguous, and recognized crackable material produces deterministic Hashcat/John builder suggestions with the appropriate mode or format without executing either tool.'],validationCommands:['node tests/run-v9.22-tests.js','node tools/validate-product-hardening-queue.js'],proofFiles:commonProof};
 base.contracts['cred-cross-tool-handshake']={acceptance:['Saved Credential Material can be selected once and mapped only into declared compatible Tool Builder fields, including cracking, password/hash authentication, ticket/certificate/key, and web-secret fields where available, while preserving the copy-only human-run command boundary.'],validationCommands:['node tests/run-v9.22-tests.js','node tools/validate-tool-builder-platform.js','node tools/validate-asset-references.js'],proofFiles:commonProof};
 base.contracts['cred-validation-boundary']={acceptance:['New and recovered Credential Material remains candidate material until an independent validation action cites reviewed Evidence and an explicit access fact; manual selection, command generation, cracking output, or operator assertion alone cannot mark the material validated.'],validationCommands:['node tests/run-v9.22-tests.js','node tools/validate-product-hardening-queue.js'],proofFiles:commonProof};
 base.contracts['cred-report-redaction']={acceptance:['Sanitized exports redact secret Credential Material values while preserving non-secret material paths and lineage metadata, and current report generation redacts known saved secrets by default without converting candidate material into proof.'],validationCommands:['node tests/run-v9.22-tests.js','node tools/validate-version-identity.js','node tools/validate-asset-references.js'],proofFiles:commonProof};
 base.version='9.22.0';
}
if(currentReleaseAtLeast(9,23)){
 const modeProof=['data/credential-modes.js','data/credential-material.js','data/tool-builders.js','data/tool-builders-tunnels.js','assets/tool-builder-current.js','assets/credential-material-current.js','assets/runtime-current.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts-tunnels.js','tests/run-v9.23-tests.js','docs/v9.23.md'];
 const validation=['node tests/run-v9.23-tests.js','node tools/validate-product-hardening-queue.js','node tools/validate-tool-builder-platform.js','node tools/validate-asset-references.js'];
 base.contracts['cred-password']={acceptance:['Credential-aware builders expose consistent declared password fields and authentication modes; selected password material carries username/domain/target context where supported, uses renderer-owned shell-safe quoting, remains secret-bearing lineage, and never becomes proof solely because a command was generated.'],validationCommands:validation,proofFiles:modeProof};
 base.contracts['cred-ntlm']={acceptance:['NT and LM:NT material is normalized per compatible builder: NetExec may receive the full LM:NT pair while Impacket and direct NT-hash builders receive the NT half in their existing syntax; challenge-response material is never mislabeled as pass-the-hash input.'],validationCommands:validation,proofFiles:modeProof};
 base.contracts['cred-netntlm']={acceptance:['NetNTLMv1 and NetNTLMv2 capture shapes are detected and routed as crackable challenge-response material to Hashcat 5500/5600 or John netntlm/netntlmv2, without offering them as direct network-authentication hashes.'],validationCommands:validation,proofFiles:modeProof};
 base.contracts['cred-kerberos-hashes']={acceptance:['Kerberos AS-REP and TGS material routes deterministically to the compatible Hashcat 18200/13100 and John krb5asrep/krb5tgs modes while recovered values remain candidate credentials until independently validated.'],validationCommands:validation,proofFiles:modeProof};
 base.contracts['cred-mscache2']={acceptance:['DCC2/MSCache2 material is recognized and routed to Hashcat mode 2100 and John mscash2 with guidance that cached-domain hashes are cracking inputs rather than direct network-authentication material.'],validationCommands:validation,proofFiles:modeProof};
 base.contracts['cred-ccache-kirbi']={acceptance:['Credential-mode handoff distinguishes ccache and kirbi ticket material, selects declared Kerberos modes where a builder supports them, surfaces KRB5CCNAME or conversion guidance, and never mutates the operator environment or executes ticket conversion automatically.'],validationCommands:validation,proofFiles:modeProof};
 base.contracts['cred-pfx-cert']={acceptance:['PFX/certificate material prefills compatible certificate-authentication fields, including Certipy authentication mode, identity context, and PFX path, while password/private-key requirements and secret-redaction boundaries remain explicit.'],validationCommands:validation,proofFiles:modeProof};
 base.contracts['cred-ssh-key']={acceptance:['SSH-key material prefills declared identity-file/key authentication controls, preserves target/user context, keeps key passphrase handling external to generated commands, and integrates with the shared SSH/plink tunnel builder without automatic connection attempts.'],validationCommands:validation,proofFiles:modeProof};
 base.contracts['cred-cookie-token']={acceptance:['Cookie, bearer-token, and API-key material uses dedicated fields when available and otherwise produces explicit reviewable Cookie, Authorization Bearer, or X-API-Key header handoff on compatible web builders while preserving secret lineage and report redaction.'],validationCommands:validation,proofFiles:modeProof};
 base.version='9.23.0';
}
if(currentReleaseAtLeast(9,24)){
 const manualProof=['data/manual-outcomes.js','assets/manual-outcomes-current.js','assets/workflow-current.js','assets/runtime-current.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts-tunnels.js','tests/run-v9.24-tests.js','docs/v9.24.md','README.md'];
 const validation=['node tests/run-v9.24-tests.js','node tools/validate-product-hardening-queue.js','node tools/validate-current-workflow.js','node tools/validate-asset-references.js'];
 base.contracts['manual-schema']={acceptance:['A stable browser-local Manual Outcome model represents tried, success, failed, blocked, and skipped workflow states separately from proof state, preserves outcome history and context, and marks operator assertions as needs-Evidence-for-report until reviewed Evidence is explicitly linked.'],validationCommands:validation,proofFiles:manualProof};
 base.contracts['manual-ui']={acceptance:['Every expanded runnable Card exposes Mark successful, Mark failed, Mark blocked, and Mark skipped controls beside the paste-output workflow, keeps legacy success/tried controls from bypassing the proof boundary, and shows whether the latest assertion still needs Evidence for reporting.'],validationCommands:validation,proofFiles:manualProof};
 base.contracts['manual-success-unlocks']={acceptance:['A manual success can add only the operator-selected expected workflow facts so Path/Next Steps can recalculate immediately, while those facts remain explicitly manual/provisional and the corresponding success is withheld from report-ready findings until supporting Evidence is linked.'],validationCommands:validation,proofFiles:manualProof};
 base.contracts['manual-failure-triage']={acceptance:['Failed and blocked outcomes preserve attempt history and support explicit triage reasons including auth failed, timeout, no results, syntax issue, blocked, not vulnerable, and other, with guidance to review Evidence and retry or choose an alternate route.'],validationCommands:validation,proofFiles:manualProof};
 base.contracts['manual-proof-report']={acceptance:['Manual assertions appear in generated report drafts with an UNPROVEN needs-Evidence state until Evidence IDs are attached; unsupported manual success activities are projected out of report-ready findings without removing their workflow effect from the live workspace.'],validationCommands:validation,proofFiles:manualProof};
 base.contracts['manual-queue-interaction']={acceptance:['Queued human intent persists across Path reordering and outcome changes, records attempt count, last outcome, proof need, and completed/failed/blocked/skipped status, and remains independently focusable/removable through the stable workflow queue.'],validationCommands:validation,proofFiles:manualProof};
 base.contracts['manual-tests']={acceptance:['Dedicated v9.24 regressions prove all four outcome controls, tried semantics, success advancement, failure triage, queue transitions, report non-laundering, runtime hydration, persistence compatibility, and the human-run no-execution boundary.'],validationCommands:validation,proofFiles:manualProof};
 base.contracts['manual-all-cards']={acceptance:['The stable Manual Outcome owner classifies every methodology card with executable commands as manual-outcome covered and the browser decorator targets every rendered runnable data-cardroot without bespoke card IDs or lab-specific branches.'],validationCommands:validation,proofFiles:manualProof};
 base.version='9.24.0';
}
if(currentReleaseAtLeast(9,25)){
 const noteProof=['data/note-integration.js','data/field-notes.js','assets/field-notes.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts-tunnels.js','tools/validate-note-integration.js','tests/run-v9.25-tests.js','docs/NOTES-INTEGRATION.md','docs/v9.25.md','README.md'];
 const validation=['node tests/run-v9.25-tests.js','node tools/validate-note-integration.js','node tools/validate-field-notes-ui.js','node tools/validate-product-hardening-queue.js','node tools/validate-asset-references.js'];
 base.contracts['notes-enex-extraction']={acceptance:['The private source repository remains the raw ENEX owner while public Obol consumes a sanitized source-inventory projection with exact source hashes, 556-note/1326-resource accounting, opaque note references, and no raw course content or ENEX paths in browser data.'],validationCommands:validation,proofFiles:noteProof};
 base.contracts['notes-atomization-schema']={acceptance:['A stable non-versioned note-integration owner defines normalized lesson, tool-guidance, path-guidance, troubleshooting, Evidence, report, and cleanup atoms plus terminal dispositions, and can atomize private metadata into review records without carrying raw note bodies into public Obol.'],validationCommands:validation,proofFiles:noteProof};
 base.contracts['notes-field-panel']={acceptance:['Reviewed normalized note outputs populate the stable public Field Notes owner and render through collapsed contextual disclosure on relevant Cards, Tool pages, and Path without dumping the private notebook or showing unrelated notes.'],validationCommands:validation,proofFiles:noteProof};
 base.contracts['notes-tool-influence']={acceptance:['Modeled note outputs can bind to one or more tool identifiers and appear as contextual tool-builder guidance on the matching Tool surface, allowing private-source lessons to influence command choices and failure handling without adding bespoke execution code.'],validationCommands:validation,proofFiles:noteProof};
 base.contracts['notes-path-gap-influence']={acceptance:['Modeled note outputs can bind to Path and appear as explicit field-note branches that help the operator choose or refine a next-step branch while remaining guidance rather than fabricated facts, automatic execution, or report proof.'],validationCommands:validation,proofFiles:noteProof};
 base.contracts['qa-notes-ledger-test']={acceptance:['Permanent notes-integration validation reconciles the two private source inventories to 556 notes and 1326 resources, requires disposition counts to sum to all staged notes, preserves opaque lineage for every public derived note, and fails on raw ENEX/source leakage or invalid modeled references.'],validationCommands:validation,proofFiles:noteProof};
 base.version='9.25.0';
}
if(currentReleaseAtLeast(9,26)){
 const dispositionProof=['data/note-integration.js','data/field-notes.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts-tunnels.js','tools/validate-note-integration.js','tests/run-v9.26-tests.js','docs/NOTES-INTEGRATION.md','docs/v9.26.md','README.md'];
 const validation=['node tests/run-v9.26-tests.js','node tools/validate-note-integration.js','node tools/validate-field-notes-ui.js','node tools/validate-product-hardening-queue.js','node tools/validate-asset-references.js'];
 base.contracts['notes-disposition-burn-down']={
  acceptance:['The note disposition burn-down is represented by explicit per-note terminal review rows with opaque source IDs, substantive rationale, and derived output links for modeled notes; the v9.26 first review wave advances the ledger to 15/556 reviewed with 11 modeled and 4 private-reference-only while the queue item remains queued until all 556 notes have terminal dispositions. Raw review packet text and course-specific output never enter public Obol.'],
  validationCommands:validation,
  proofFiles:dispositionProof
 };
 base.version='9.26.0';
}
if(currentReleaseAtLeast(9,27)){
 const dispositionProof=['data/note-integration.js','data/field-notes.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts-tunnels.js','tools/validate-note-integration.js','tests/run-v9.27-tests.js','docs/NOTES-INTEGRATION.md','docs/v9.27.md','README.md'];
 const validation=['node tests/run-v9.27-tests.js','node tools/validate-note-integration.js','node tools/validate-field-notes-ui.js','node tools/validate-product-hardening-queue.js','node tools/validate-asset-references.js'];
 base.contracts['notes-disposition-burn-down']={
  acceptance:['The second disposition review wave extends explicit terminal review to 41/556 source notes with 32 modeled and 9 private-reference-only, preserves the v9.25 and v9.26 milestone snapshots, exposes only rewritten contextual guidance with reciprocal opaque lineage, and leaves the burn-down queue item queued until all 556 notes are terminal. The public projection must exclude raw review text, course flags, lab targets, and recipe-sheet copying.'],
  validationCommands:validation,
  proofFiles:dispositionProof
 };
 base.version='9.27.0';
}
root.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS=base;
})(typeof window!=='undefined'?window:globalThis);