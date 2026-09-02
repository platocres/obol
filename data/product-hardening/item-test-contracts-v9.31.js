'use strict';
(function(root){
const base=root.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
if(!base||!base.contracts)throw new Error('Base Product Hardening item-test contracts must load before v9.31 contract extensions');
const acceptance='Path, Card, and Tools load a stable current operator-route owner instead of adding another versioned app layer: Path renders a current-owned decision screen, Card/Tools keep current guided builders as the primary action stack, additional builders and raw historical command blocks collapse into supporting detail, README/dashboard queue totals remain generated from the shared queue, and the historical runtime chain is preserved only as compatibility until deeper area-by-area retirement is proven.';
const validationCommands=[
 'node tools/validate-current-workflow.js',
 'node tools/validate-product-hardening-queue.js',
 'node tools/sync-product-build-next.js --check',
 'node tests/run-v9.31-tests.js'
];
const proofFiles=[
 'assets/app-v8.8.js',
 'assets/operator-route-current.js',
 'assets/operator-route-current.css',
 'data/runtime-manifest.js',
 'data/product-hardening/product-hardening-queue.js',
 'data/product-hardening/work-packages.js',
 'tools/validate-current-workflow.js',
 'tests/run-v9.31-tests.js',
 'docs/v9.31.md'
];
for(const id of ['runtime-operator-route-owner','ux-next-step-tool-declutter','tb-card-tool-presentation','qa-operator-route-ux-test']){
 base.contracts[id]={acceptance:[acceptance],validationCommands,proofFiles};
}
base.version='9.31.0';
})(typeof window!=='undefined'?window:globalThis);
