const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
test('shared evidence populates template steps without losing unmatched steps',async()=>{
 const ctx=vm.createContext({CONFIG:{API_URL:'https://example.test'},STAGE_STEPS:[{step:'3.1',task:'Award',module:3},{step:'3.2',task:'Acceptance',module:3}]});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/api.js'),'utf8')+'\nglobalThis.api=API;',ctx);
 ctx.api.call=async()=>[{step:'3.1',evidence:'https://drive.google.com/file/d/example/view',status:'Completed'}];
 const rows=await ctx.api.stageProgress('P1');
 assert.equal(rows[0].task,'Award');assert.equal(rows[0].evidence,'https://drive.google.com/file/d/example/view');
 assert.equal(rows[1].evidence,'');assert.equal(rows[1].status,'Not Started');
 ctx.api.call=async()=>{throw new Error('Offline');};
 await assert.rejects(ctx.api.stageProgress('P1'),/Offline/);
});
test('checklist save does not announce success before server confirmation',async()=>{
 const html=fs.readFileSync(path.join(__dirname,'../project.html'),'utf8');
 const code=html.slice(html.indexOf('async function setStep('),html.indexOf('/* ---------- documents'));
 const notices=[];let done;let drawn=0;
 const ctx=vm.createContext({P:{id:'P1'},STAGE_ROWS:[{step:'3.1',evidence:''}],
 API:{saveStage:()=>new Promise(resolve=>done=resolve)},toast:x=>notices.push(x),drawStage:async()=>{drawn++;}});
 vm.runInContext(code,ctx);
 const pending=ctx.setStep('3.1','evidence','https://example.test');assert.equal(notices.length,0);
 done();await pending;assert.equal(ctx.STAGE_ROWS[0].evidence,'https://example.test');assert.equal(drawn,1);
 ctx.API.saveStage=async()=>{throw new Error('Denied');};await ctx.setStep('3.1','evidence','changed');
 assert.equal(ctx.STAGE_ROWS[0].evidence,'https://example.test');assert.match(notices.at(-1),/not saved/);
});
