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
 base.contracts['cred-schema']={
  acceptance:['A stable browser-local Credential Material model represents password, hash, challenge-response, ticket, certificate, key, cookie, token, and opaque-secret material with type, context, provenance, sensitivity, candidate/validated/rejected state, typed-artifact migration compatibility, and no automatic authentication or command execution.'],
  validationCommands:['node tests/run-v9.22-tests.js','node tools/validate-product-hardening-queue.js','node tools/validate-asset-references.js'],
  proofFiles:commonProof
 };
 base.contracts['cred-hash-routing']={
  acceptance:['Pasted common lab hash shapes are classified with explicit confidence, ambiguous 32-hex input remains visibly ambiguous, and recognized crackable material produces deterministic Hashcat/John builder suggestions with the appropriate mode or format without executing either tool.'],
  validationCommands:['node tests/run-v9.22-tests.js','node tools/validate-product-hardening-queue.js'],
  proofFiles:commonProof
 };
 base.contracts['cred-cross-tool-handshake']={
  acceptance:['Saved Credential Material can be selected once and mapped only into declared compatible Tool Builder fields, including cracking, password/hash authentication, ticket/certificate/key, and web-secret fields where available, while preserving the copy-only human-run command boundary.'],
  validationCommands:['node tests/run-v9.22-tests.js','node tools/validate-tool-builder-platform.js','node tools/validate-asset-references.js'],
  proofFiles:commonProof
 };
 base.contracts['cred-validation-boundary']={
  acceptance:['New and recovered Credential Material remains candidate material until an independent validation action cites reviewed Evidence and an explicit access fact; manual selection, command generation, cracking output, or operator assertion alone cannot mark the material validated.'],
  validationCommands:['node tests/run-v9.22-tests.js','node tools/validate-product-hardening-queue.js'],
  proofFiles:commonProof
 };
 base.contracts['cred-report-redaction']={
  acceptance:['Sanitized exports redact secret Credential Material values while preserving non-secret material paths and lineage metadata, and current report generation redacts known saved secrets by default without converting candidate material into proof.'],
  validationCommands:['node tests/run-v9.22-tests.js','node tools/validate-version-identity.js','node tools/validate-asset-references.js'],
  proofFiles:commonProof
 };
 base.version='9.22.0';
}
root.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS=base;
})(typeof window!=='undefined'?window:globalThis);
