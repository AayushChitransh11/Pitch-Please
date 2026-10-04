import test from 'node:test';
import assert from 'node:assert/strict';
import {toPresentationPdf} from '../src/documents.js';
import {createApp} from '../src/app.js';
test('rejects unsupported and malformed documents before conversion',async()=>{
  for(const [name,bytes,status] of [['bad.exe',Buffer.from('bad'),415],['bad.pdf',Buffer.from('bad'),422],['bad.docx',Buffer.from('bad'),422],['empty.txt',Buffer.alloc(0),400]])
    await assert.rejects(()=>toPresentationPdf(bytes,name),e=>e.status===status);
  const pdf=Buffer.from('%PDF-test');assert.equal(await toPresentationPdf(pdf,'deck.PDF'),pdf);
});
test('reports a missing Office converter clearly',async()=>{
  await assert.rejects(()=>toPresentationPdf(Buffer.from('Campus events'),'notes.txt',{binary:'/not-installed/pitch-soffice'}),e=>e.status===503);
});
test('failed conversion frees the session so an upload can be retried',async t=>{
  let called=0;
  const server=createApp({convertDocument:async()=>{called++;throw Object.assign(new Error('Conversion failed'),{status:422});}}).listen(0,'127.0.0.1');
  await new Promise(r=>server.once('listening',r));t.after(()=>server.close());
  const base=`http://127.0.0.1:${server.address().port}/api/sessions`;
  const s=await(await fetch(base,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic:'App',audience:'Judges',purpose:'Explain',targetSeconds:60,requiredPoints:[]})})).json();
  for(let i=0;i<2;i++)assert.equal((await fetch(`${base}/${s.sessionId}/documents`,{method:'POST',headers:{Authorization:`Bearer ${s.sessionToken}`,'Content-Type':'application/octet-stream','X-File-Name':'deck.pptx'},body:Buffer.from('PKbad')})).status,422);
  assert.equal(called,2);
});
