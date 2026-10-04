import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../src/app.js';
test('preparation coach validates messages and receives the brief',async t=>{
 let received;
 const server=createApp({prepare:async input=>{received=input;return {reply:'Start with the problem.'};}}).listen(0,'127.0.0.1');
 await new Promise(r=>server.once('listening',r));t.after(()=>server.close());
 const url=`http://127.0.0.1:${server.address().port}/api/coach`;
 const request=body=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 assert.equal((await request({brief:{},messages:[]})).status,400);
 const response=await request({brief:{topic:'Campus events'},messages:[{role:'user',text:'Suggest an opening.'}]});
 assert.equal(response.status,200);assert.equal((await response.json()).reply,'Start with the problem.');assert.equal(received.brief.topic,'Campus events');
});
