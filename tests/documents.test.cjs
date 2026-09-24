const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
function context() {
  const ctx = vm.createContext({console, URL, setTimeout, clearTimeout,
    localStorage: {getItem: () => null, setItem() {}},
    CONFIG: {API_URL: 'https://example.test'},
    DOC_REQUIREMENTS: [
      {name: 'Award', section: 'B', sectionTitle: 'Awards', scope: 'project'},
      {name: 'FM record', section: 'E', scope: 'project'},
      {name: 'Company', section: 'C', scope: 'entity'}
    ]});
  vm.runInContext(fs.readFileSync(path.join(root, 'js/api.js'), 'utf8') + '\nglobalThis.api = API;', ctx);
  return ctx;
}
test('live document records override defaults, preserve titles and include folder records', async () => {
  const ctx = context();
  ctx.api.call = async () => [{name:'Award', section:'B', link:'https://drive.google.com/file/d/example/view', status:'Completed'},
    {name:'Project folder', section:'Files', link:'https://drive.google.com/drive/folders/example'}];
  const rows = await ctx.api.documents('P1', 'Renovation');
  assert.equal(rows.length, 2);
  assert.equal(rows[0].sectionTitle, 'Awards');
  assert.equal(rows[0].status, 'Completed');
  assert.equal(rows[1].name, 'Project folder');
});
test('facility-management requirements are included only for the right contract type', async () => {
  const ctx = context(); ctx.api.call = async () => [];
  assert.equal((await ctx.api.documents('P1', 'Facility Management')).length, 2);
  assert.equal((await ctx.api.documents('P2', 'New Construction')).length, 1);
});
test('failed live reads do not silently substitute local documents', async () => {
  const ctx = context(); ctx.api.call = async () => {throw new Error('Connection failed');};
  await assert.rejects(ctx.api.documents('P1', 'Renovation'), /Connection failed/);
});
test('document save waits for confirmation and exposes failed writes', async () => {
  const html = fs.readFileSync(path.join(root, 'project.html'), 'utf8');
  const functions = html.slice(html.indexOf('function safeDocumentUrl'), html.indexOf('/* ---------- payments and BOQ'));
  const notices = []; let drawn = 0; let complete;
  const ctx = vm.createContext({URL, P:{id:'P1'}, toast:(...args)=>notices.push(args),
    drawDocs:async()=>{drawn++;}, API:{saveDocument:()=>new Promise(resolve=>{complete=resolve;})}});
  vm.runInContext(functions, ctx);
  const saving = ctx.setDoc('Award','link','https://drive.google.com/file/d/example/view');
  assert.equal(notices.length,0);
  complete(); await saving;
  assert.equal(notices[0][0],'Saved'); assert.equal(drawn,1);
  ctx.API.saveDocument = async()=>{throw new Error('Denied');};
  await ctx.setDoc('Award','status','Completed');
  assert.match(notices.at(-1)[0],/not saved: Denied/);
  assert.equal(drawn,1);
  assert.equal(ctx.safeDocumentUrl('javascript:alert(1)'), '');
});
