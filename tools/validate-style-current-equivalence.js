'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');

const root=path.join(__dirname,'..');
const manifest=require(path.join(root,'data','runtime-manifest.js'));
const sync=require('./sync-current-styles');
const cascade=require('./style-cascade-current');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\r\n/g,'\n');

function validate(){
 const failures=[];
 try{
  const meta=manifest.styleCurrent;
  assert(meta,'runtime manifest must declare styleCurrent metadata');
  assert.strictEqual(meta.owner,'assets/obol-current.css','stylesheet owner stays stable and non-versioned');
  assert.strictEqual(meta.strategy,'semantic-cascade-snapshot','stylesheet owner declares semantic-cascade-snapshot strategy');
  assert.strictEqual(meta.sourceRelease,'v9.45','stylesheet semantic owner names the flattening release');
  assert.strictEqual(meta.generator,'tools/sync-current-styles.js','stylesheet owner declares its generator');
  assert.strictEqual(meta.equivalenceValidator,'tools/validate-style-current-equivalence.js','stylesheet owner declares this static validator');
  assert.strictEqual(meta.visualEquivalenceValidator,'tools/validate-style-visual-equivalence.js','stylesheet owner declares its real-browser validator');
  assert.deepStrictEqual(Array.from(meta.historicalFragments),Array.from(manifest.compatibility.historicalStyles),'styleCurrent preserves the complete frozen stylesheet ledger');
  assert.strictEqual(meta.historicalFragments.length,69,'v9.5 stylesheet ledger remains 69 fragments');

  const projected=sync.projection();
  const shipped=read(meta.owner);
  assert.strictEqual(shipped,projected.css,'shipped current stylesheet exactly matches the semantic generator');
  assert(shipped.includes('Obol current stylesheet — semantic cascade snapshot.'),'current owner identifies itself as a semantic cascade snapshot');
  assert(!/obol-style-fragment:/.test(shipped),'semantic current owner contains no historical-fragment concatenation markers');
  assert(!/@import\b/i.test(shipped),'semantic current owner remains a one-request stylesheet with no @import chain');
  assert(projected.stats.removedDeclarations>0,'semantic flattening must remove at least one superseded declaration');
  assert(projected.stats.removedRules>0,'semantic flattening must remove at least one fully superseded rule');
  assert(projected.stats.emittedDeclarations<projected.stats.sourceDeclarations,'current stylesheet contains fewer semantic declarations than the frozen cascade');

  /* Mutation-quality checks: the reducer must prove the cases its safety claim rests on. */
  const simple=cascade.reduceNodes(cascade.parseNodes('.x{color:red;margin:1px}.x{color:blue}'));
  const simpleCss=cascade.serialize(simple.nodes);
  assert(!/color:red/.test(simpleCss)&&/color:blue/.test(simpleCss)&&/margin:1px/.test(simpleCss),'later identical-selector/property declarations replace earlier ones without dropping unrelated properties');

  const important=cascade.serialize(cascade.reduceNodes(cascade.parseNodes('.x{color:red!important}.x{color:blue}')).nodes);
  assert(/color:red!important/.test(important)&&!/color:blue/.test(important),'important declaration remains the winner over a later non-important declaration');

  const fallback=cascade.serialize(cascade.reduceNodes(cascade.parseNodes('.x{display:-webkit-box}.x{display:flex}')).nodes);
  assert(/display:-webkit-box/.test(fallback)&&/display:flex/.test(fallback),'vendor/fallback value chains are preserved conservatively');

  const contexts=cascade.serialize(cascade.reduceNodes(cascade.parseNodes('@media(max-width:700px){.x{color:red}}@media(min-width:701px){.x{color:blue}}')).nodes);
  assert(/color:red/.test(contexts)&&/color:blue/.test(contexts),'declarations in distinct grouping contexts never supersede one another');

  /* Source ledger is frozen: generation consumes it but never rewrites it. */
  for(const rel of meta.historicalFragments)assert(fs.existsSync(path.join(root,rel)),'historical stylesheet remains on disk: '+rel);
 }catch(error){failures.push(error.message);}
 return failures;
}

if(require.main===module){
 const failures=validate();
 if(failures.length){
  console.error('Stylesheet semantic equivalence validation failed:');
  for(const failure of failures)console.error('- '+failure);
  process.exit(1);
 }
 const p=sync.projection();
 console.log('Stylesheet semantic equivalence valid: '+p.stats.sourceRules+' rules/'+p.stats.sourceDeclarations+' declarations -> '+p.stats.emittedRules+' rules/'+p.stats.emittedDeclarations+' declarations; '+p.stats.removedRules+' rules and '+p.stats.removedDeclarations+' declarations superseded.');
}

module.exports={validate};
