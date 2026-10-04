import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openStore} from '../src/store.js';
import {createApp} from '../src/app.js';
test('session authorization and reports survive a backend restart',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'pitch-store-test-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 let store=openStore(join(dir,'test.sqlite'));
 const feedback={coverage:[],strengths:[],improvements:[{category:'content',priority:1,observation:'Add an ending',suggestion:'Summarize'}],grammar:[]};
 const start=async()=>{const s=createApp({store,analyze:async()=>feedback}).listen(0,'127.0.0.1');await new Promise(r=>s.once('listening',r));return s;};
 let server=await start();let base=`http://127.0.0.1:${server.address().port}`;
 const session=await(await fetch(base+'/api/sessions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic:'App',audience:'Judges',purpose:'Explain',targetSeconds:60,requiredPoints:[]})})).json();
 const headers={Authorization:`Bearer ${session.sessionToken}`,'Content-Type':'application/json'};
 const report=await(await fetch(base+`/api/sessions/${session.sessionId}/practice`,{method:'POST',headers,body:JSON.stringify({transcript:'Our app helps students.',durationSeconds:10})})).json();
 await new Promise(r=>server.close(r));store.close();
 store=openStore(join(dir,'test.sqlite'));server=await start();base=`http://127.0.0.1:${server.address().port}`;
 try{
  assert.equal((await fetch(base+`/api/sessions/${session.sessionId}`,{headers})).status,200);
  const restored=await(await fetch(base+`/api/practice/${report.practiceId}`,{headers})).json();assert.equal(restored.results.transcript,'Our app helps students.');
  assert.equal((await fetch(base+`/api/practice/${report.practiceId}`)).status,404);
 }finally{await new Promise(r=>server.close(r));store.close();}
});
