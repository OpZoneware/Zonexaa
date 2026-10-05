const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function storage() {
  const values = new Map();
  return {getItem:k=>values.get(k)||null, setItem:(k,v)=>values.set(k,v), removeItem:k=>values.delete(k)};
}
function setup() {
  const ctx = vm.createContext({console, Date, setTimeout, clearTimeout,
    localStorage:storage(),sessionStorage:storage(),CONFIG:{API_URL:'https://example.test'}});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/api.js'),'utf8') + '\nglobalThis.api=API;globalThis.store=Store;',ctx);
  ctx.store.setSession({token:'session-a'});
  ctx.api.decorate = x=>x;
  return ctx;
}
test('navigation reuses fresh data and coalesces concurrent reads',async()=>{
  const c=setup(); let calls=0;
  c.api.call=async()=>{calls++;return [{id:'P1'}];};
  await Promise.all([c.api.allProjects(),c.api.allProjects()]);
  await c.api.allProjects(); assert.equal(calls,1);
});
test('cache expires and is isolated by session and endpoint',()=>{
  const c=setup(); c.api.writeProjectCache([{id:'P1'}]);
  const key='zonexa.projectCache.v2';
  const item=JSON.parse(c.sessionStorage.getItem(key));
  item.savedAt=Date.now()-61000;c.sessionStorage.setItem(key,JSON.stringify(item));
  assert.equal(c.api.readProjectCache(),null);
  c.api.writeProjectCache([]);c.CONFIG.API_URL='https://other.test';
  assert.equal(c.api.readProjectCache(),null);
  c.CONFIG.API_URL='https://example.test';c.store.setSession({token:'session-b'});
  assert.equal(c.api.readProjectCache(),null);
});
test('project writes and logout invalidate cached records',async()=>{
  const c=setup();c.api.writeProjectCache([{id:'P1'}]);
  c.api.jsonp=async()=>({data:true});
  await c.api.updateProject({id:'P1',name:'Updated'});
  assert.equal(c.api.readProjectCache(),null);
  c.api.writeProjectCache([]);c.store.clearSession();
  assert.equal(c.sessionStorage.getItem('zonexa.projectCache.v2'),null);
});
test('in-flight results cannot repopulate data after logout',async()=>{
  const c=setup();let finish;c.api.call=()=>new Promise(resolve=>finish=resolve);
  const request=c.api.allProjects();c.store.clearSession();finish([{id:'P1'}]);
  await assert.rejects(request,/changed/);
  assert.equal(c.api.readProjectCache(),null);
});
test('failed project reads remain visible and can retry',async()=>{
  const c=setup();c.api.call=async()=>{throw new Error('Offline');};
  await assert.rejects(c.api.allProjects(),/Offline/);
  c.api.call=async()=>[{id:'P1'}];
  assert.equal((await c.api.allProjects())[0].id,'P1');
});

test('detail reads coalesce and cache by project and action',async()=>{
  const c=setup();let calls=0;
  c.api.call=async()=>{calls++;return [{evidence:'https://example.test/file'}];};
  await Promise.all([c.api.read('listDocuments',{projectId:'A'}),c.api.read('listDocuments',{projectId:'A'})]);
  await c.api.read('listDocuments',{projectId:'A'});
  assert.equal(calls,1);
  await c.api.read('listDocuments',{projectId:'B'});
  await c.api.read('listStageProgress',{projectId:'A'});
  assert.equal(calls,3);
});

test('detail cache expires and never crosses endpoint or session',async()=>{
  const c=setup();let calls=0;c.api.call=async()=>++calls;
  await c.api.read('listDocuments',{});
  const cache=JSON.parse(c.sessionStorage.getItem('zonexa.readCache.v1'));
  Object.values(cache.items).forEach(i=>i.at=Date.now()-61000);
  c.sessionStorage.setItem('zonexa.readCache.v1',JSON.stringify(cache));
  await c.api.read('listDocuments',{});assert.equal(calls,2);
  c.CONFIG.API_URL='https://different.test';
  await c.api.read('listDocuments',{});assert.equal(calls,3);
  c.store.setSession({token:'new-session'});
  await c.api.read('listDocuments',{});assert.equal(calls,4);
});

test('successful saves invalidate detail cache and late reads cannot refill it',async()=>{
  const c=setup();c.api.jsonp=async()=>({data:[]});
  await c.api.read('listDocuments',{});
  await c.api.saveDocument('A','Doc',{link:'https://example.test'});
  assert.equal(c.sessionStorage.getItem('zonexa.readCache.v1'),null);
  let finish;c.api.jsonp=()=>new Promise(resolve=>finish=resolve);
  const pending=c.api.read('listStageProgress',{});
  c.store.clearSession();finish({data:[]});
  await assert.rejects(pending,/changed/);
  assert.equal(c.sessionStorage.getItem('zonexa.readCache.v1'),null);
});
