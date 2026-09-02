'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const exists=rel=>fs.existsSync(path.join(root,rel));
const run=args=>cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});

const sandbox={window:{},globalThis:null,navigator:{clipboard:{writeText:()=>Promise.resolve()}}};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts.js','data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','data/tool-builders.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const q=sandbox.window.OBOL_PRODUCT_HARDENING;
const contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
const schema=sandbox.window.OBOL_TOOL_BUILDER_SCHEMA;
const inventory=sandbox.window.OBOL_TOOL_BUILDER_INVENTORY;
const renderer=sandbox.window.OBOL_TOOL_BUILDER;
const builders=sandbox.window.OBOL_TOOL_BUILDERS;
assert(q&&contracts&&schema&&inventory&&renderer&&builders,'v9.20 durable owners load');

const item=q.items.find(entry=>entry.id==='tb-curl');
assert(item&&item.status==='complete','v9.20 completes tb-curl');
assert(!q.buildNext(1000).some(entry=>entry.id==='tb-curl'),'completed curl item stays out of Product Build Next');
const toolTrack=q.tracks.find(track=>track.id==='tool-builders');
assert(toolTrack&&toolTrack.complete>=16&&toolTrack.total>=18,'Tool Builder track preserves at least the v9.20 16/18 milestone');
assert(q.totals().complete>=37,'overall Product Hardening completion preserves the v9.20 milestone floor');

const contract=contracts.contracts['tb-curl'];
assert(contract&&contract.acceptance.length,'curl owns an item-specific Definition of Done');
assert(contract.validationCommands.includes('node tests/run-v9.20-tests.js'),'curl contract names the v9.20 regression suite');
for(const rel of contract.proofFiles)assert(exists(rel),'v9.20 proof file exists for tb-curl: '+rel);
assert.strictEqual(contracts.version,'9.20.0','Product Hardening test-contract authority advances to v9.20');

assert.strictEqual(schema.schemaVersion,'1.0.0','stable Tool Builder schema identity is unchanged');
assert.strictEqual(renderer.version,'1.0.0','stable Tool Builder renderer identity is unchanged');
assert.strictEqual(builders.version,'1.0.0','stable concrete builder registry identity is unchanged');
const curl=schema.get('tb-curl');
assert(curl,'canonical curl builder registers');
assert.deepStrictEqual(Array.from(schema.validateBuilder(curl)),[],'curl builder satisfies stable schema');
assert.strictEqual(inventory.get('curl').status,'implemented','curl inventory disposition is implemented');
assert.strictEqual(inventory.get('curl').queueItem,'tb-curl','curl inventory points at canonical queue item');
for(const id of ['url','method','customMethod','headers','cookie','bodyMode','data','binaryFile','uploadFile','multipartField','authMode','authUsername','authPassword','bearerToken','proxy','proxyAuth','proxyUsername','proxyPassword','followRedirects','insecure','compressed','connectTimeout','maxTime','outputMode','outputFile','dumpHeaders','includeHeaders','silent','verbose','failWithBody','statusCode'])assert(curl.fields.some(field=>field.id===id),'curl builder exposes '+id);

assert.strictEqual(renderer.compile(curl,builders.defaultsFor('tb-curl',{url:'https://box.local/'}),{}),'curl https://box.local/','curl minimum GET request is deterministic');
assert.strictEqual(renderer.compile(curl,builders.defaultsFor('tb-curl',{url:'https://box.local/search',method:'GET',bodyMode:'data',data:'q=test value',headers:'Accept: application/json\nX-Test: one'}),{}),"curl --get --data 'q=test value' -H 'Accept: application/json' -H 'X-Test: one' https://box.local/search",'curl GET/query and repeated headers compile deterministically');
assert.strictEqual(renderer.compile(curl,builders.defaultsFor('tb-curl',{url:'https://box.local/api',method:'POST',bodyMode:'json',data:'{\"name\":\"alice\"}',cookie:'session=abc; role=user',headers:'Accept: application/json',authMode:'basic',authUsername:'alice',authPassword:'S3cret!',proxy:'http://127.0.0.1:8080',followRedirects:true,insecure:true,compressed:true,connectTimeout:'5',maxTime:'30',outputMode:'file',outputFile:'response.json',dumpHeaders:'headers.txt',failWithBody:true,statusCode:true}),{}),"curl --request POST --json '{\"name\":\"alice\"}' -H 'Accept: application/json' --cookie 'session=abc; role=user' --basic --user 'alice:S3cret!' --proxy http://127.0.0.1:8080 --location --insecure --compressed --connect-timeout 5 --max-time 30 --output response.json --dump-header headers.txt --fail-with-body --write-out '\\nHTTP %{http_code}\\n' https://box.local/api",'curl authenticated JSON request preserves secret inputs and transfer controls');
assert.strictEqual(renderer.compile(curl,builders.defaultsFor('tb-curl',{url:'https://box.local/upload',method:'PUT',bodyMode:'upload',uploadFile:'payload.bin'}),{}),'curl --request PUT --upload-file payload.bin https://box.local/upload','curl upload-file flow is deterministic');
assert.strictEqual(renderer.compile(curl,builders.defaultsFor('tb-curl',{url:'https://box.local/form',bodyMode:'multipart',multipartField:'document',uploadFile:'report.pdf'}),{}),'curl --form document=@report.pdf https://box.local/form','curl multipart upload flow is deterministic');
assert.strictEqual(renderer.compile(curl,builders.defaultsFor('tb-curl',{url:'https://box.local/webdav',method:'custom',customMethod:'PROPFIND',authMode:'ntlm',authUsername:'CORP\\alice',authPassword:'Password1!'}),{}),"curl --request PROPFIND --ntlm --user 'CORP\\alice:Password1!' https://box.local/webdav",'curl custom method and NTLM auth compile deterministically');
assert.strictEqual(renderer.compile(curl,builders.defaultsFor('tb-curl',{url:'https://api.box.local/me',authMode:'bearer',bearerToken:'abc.def.123',outputMode:'remote-name'}),{}),'curl --oauth2-bearer abc.def.123 --remote-name https://api.box.local/me','curl bearer and remote-name output compile deterministically');

const html=renderer.html(curl,{target:{value:'box.local'},context:{username:'alice'}},builders.defaultsFor('tb-curl',{}));
for(const token of ['data-tool-builder="tb-curl"','curl HTTP request builder','HTTP method','Server authentication','Request body / upload mode','Response body output','Evidence and report boundary','does not execute commands'])assert(html.includes(token),'curl rendering preserves '+token);
assert(curl.evidence.expectation&&curl.evidence.proofBoundary,'curl preserves Evidence boundary');
assert(curl.manualOutcome.supported===true,'curl preserves manual-outcome boundary');
assert(curl.reportLineage.evidenceRequiredForProof===true,'curl preserves report proof lineage');
for(const secret of ['headers','cookie','data','authPassword','bearerToken','proxyPassword'])assert(curl.reportLineage.secretFields.includes(secret),'curl report lineage protects '+secret);

const source=read('data/tool-builders.js');
for(const token of ["id:'tb-curl'","flag:'--data'","flag:'--json'","flag:'--upload-file'","value:'multipart'","flag:'--oauth2-bearer'","flag:'--proxy'","flag:'--location'","flag:'--output'","flag:'--dump-header'","flag:'--fail-with-body'"])assert(source.includes(token),'curl source is missing expected upstream-aligned control '+token);
const rendererSource=read('assets/tool-builder-current.js');
for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!rendererSource.includes(forbidden),'browser Tool Builder contains forbidden execution primitive '+forbidden);

const releaseSource=read('data/current-release.js');
const releaseMatch=releaseSource.match(/version:'(\d+)\.(\d+)\.(\d+)'/);
assert(releaseMatch&&Number(releaseMatch[1])===9&&Number(releaseMatch[2])>=20,'current release authority preserves or advances the v9.20 milestone');
assert(exists('docs/v9.20.md'),'v9.20 release documentation exists');
for(const forbidden of ['assets/obol-v9.20.css','assets/app-v9.20.js','assets/core-v9.20.js','data/project-model-v9.20.js'])assert(!exists(forbidden),'no fake v9.20 runtime overlay: '+forbidden);

for(const command of [
 ['tools/validate-tool-builder-platform.js'],
 ['tools/validate-product-hardening-queue.js'],
 ['tools/validate-current-release.js'],
 ['tools/validate-asset-references.js'],
 ['tools/sync-current-release.js','--check'],
 ['tools/sync-product-build-next.js','--check'],
 ['tools/validate-release-pr.js','--repo-only']
]){
 const result=run(command);
 assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());
}

console.log('v9.20 curl Tool Builder regression tests passed.');