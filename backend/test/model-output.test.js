import test from 'node:test';
import assert from 'node:assert/strict';
import { requestCoaching } from '../src/analysis.js';
const good = {coverage:[], strengths:[], improvements:[{category:'structure',priority:1,observation:'No conclusion',suggestion:'Add a takeaway'}],grammar:[]};
const response = (text, stopReason='end_turn') => ({stopReason,output:{message:{content:[{text}]}}});
test('retries truncated or invalid model output, then validates the report',async()=>{
  for(const invalid of [response('{'),response('{}'),response(JSON.stringify(good),'max_tokens')]) {
    let calls=0;
    const result=await requestCoaching(async input=>{calls++;if(calls===2)assert.equal(input.system.length,2);return calls===1 ? invalid : response(JSON.stringify(good));},{system:[{text:'Coach'}]});
    assert.equal(calls,2);assert.equal(result.improvements.length,1);
  }
});
test('invalid provider reports are actionable server errors, not user validation errors',async()=>{
  await assert.rejects(()=>requestCoaching(async()=>response('{}'),{system:[]}),e=>e.status===502 && /transcript is saved/.test(e.message));
});

test('a covered document point may have no suggested change',async()=>{
  const report={...good,documentAlignment:[{documentId:'doc',page:1,sourceQuote:'A fact',spokenQuote:'A fact',status:'covered',observation:'The fact was presented',suggestion:null}]};
  let calls=0;
  const parsed=await requestCoaching(async()=>{calls++;return response(JSON.stringify(report));},{system:[]});
  assert.equal(calls,1);assert.equal(parsed.documentAlignment[0].suggestion,'');
});
