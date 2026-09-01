'use strict';
(function(root){
const base=root.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
if(!base||!base.contracts)throw new Error('Base Product Hardening item-test contracts must load before tunnel contracts');
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
root.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS=base;
})(typeof window!=='undefined'?window:globalThis);