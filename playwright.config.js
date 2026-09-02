'use strict';
const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
 testDir:'./tests/browser',
 timeout:30000,
 expect:{timeout:8000},
 fullyParallel:false,
 workers:1,
 retries:0,
 reporter:[['line'],['html',{outputFolder:'playwright-report',open:'never'}]],
 outputDir:'test-results/playwright',
 use:{
  baseURL:'http://127.0.0.1:4173',
  viewport:{width:1440,height:900},
  trace:'retain-on-failure'
 },
 projects:[{name:'chromium',use:{browserName:'chromium'}}],
 webServer:{
  command:'python3 -m http.server 4173 --bind 127.0.0.1',
  url:'http://127.0.0.1:4173/index.html',
  reuseExistingServer:true,
  timeout:15000
 }
});
