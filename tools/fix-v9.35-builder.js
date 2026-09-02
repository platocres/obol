'use strict';
const fs=require('fs');
const path=require('path');
const target=path.join(__dirname,'apply-v9.35-build.js');
let src=fs.readFileSync(target,'utf8');
src=src.split('\\\\`').join('\\`');
fs.writeFileSync(target,src);
console.log('Temporary v9.35 transformer quoting repaired.');
