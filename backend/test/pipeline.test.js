import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../src/app.js';
import {validateEvidence} from '../src/analysis.js';
import {speechEvidence} from '../src/speech.js';
const words=[{text:'Um',start:0,end:0.2},{text:'our',start:2,end:2.3},{text:'app',start:2.4,end:2.7},{text:'help',start:2.8,end:3},{text:'students.',start:3.1,end:3.6}];
const text='Um our app help students.';
const feedback={coverage:[],strengths:['Clear topic'],improvements:[{category:'grammar',priority:1,observation:'Verb agreement',suggestion:'Use helps'}],grammar:[{original:'our app help students',suggested:'our app helps students',explanation:'Subject verb agreement'}],documentAlignment:[]};
test('audio is transcribed before evaluation; original transcript and word times are retained',async t=>{
  const old=process.env.ELEVENLABS_API_KEY;process.env.ELEVENLABS_API_KEY='test';
  let evaluated;
  const server=createApp({upstream:async(url,options)=>{
    assert.equal(url,'https://api.elevenlabs.io/v1/speech-to-text');
    assert.equal(options.body.get('no_verbatim'),'false');
    assert.equal(options.body.get('timestamps_granularity'),'word');
    assert.ok(options.body.get('file').size>0);
    return Response.json({text:'  '+text+'\n',words:words.map(w=>({...w,type:'word'}))});
  },analyze:async(session,attempt)=>{evaluated=attempt;return feedback;}}).listen(0,'127.0.0.1');
  await new Promise(r=>server.once('listening',r));
  t.after(()=>{server.close();if(old===undefined)delete process.env.ELEVENLABS_API_KEY;else process.env.ELEVENLABS_API_KEY=old;});
  const base=`http://127.0.0.1:${server.address().port}`;
  const brief={topic:'App',audience:'Students',purpose:'Explain',targetSeconds:60,requiredPoints:[]};
  const session=await (await fetch(base+'/api/sessions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(brief)})).json();
  const headers={Authorization:`Bearer ${session.sessionToken}`};
  const transcribed=await fetch(`${base}/api/sessions/${session.sessionId}/transcribe`,{method:'POST',headers:{...headers,'Content-Type':'audio/webm'},body:new Uint8Array([1,2,3])});
  assert.equal(transcribed.status,201);
  const audio=await transcribed.json();assert.equal(evaluated,undefined);assert.equal(audio.transcript,text);
  const submit=(transcript,id=audio.transcriptionId)=>fetch(`${base}/api/sessions/${session.sessionId}/practice`,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({transcriptionId:id,transcript,durationSeconds:5})});
  assert.equal((await submit('Fake changed transcript')).status,400);
  const report=await (await submit(audio.transcript)).json();
  assert.equal(evaluated.transcript,text);assert.equal(evaluated.words.length,5);
  assert.equal(report.results.speech.fillers[0].start,0);
  assert.equal(report.results.speech.pauses[0].durationSeconds,1.8);
  assert.equal(report.results.grammar[0].original,'our app help students');
});
test('document citations are checked even with no required points',()=>{
  const findings=[{documentId:'doc',page:2,sourceQuote:'helps students',spokenQuote:'our app help students',status:'partial',observation:'Explain more',suggestion:'Describe the benefit'},
    {documentId:'doc',page:7,sourceQuote:'invented',spokenQuote:null,status:'missing',observation:'Fake',suggestion:'Fake'}];
  const result=validateEvidence({...feedback,documentAlignment:findings},{requiredPoints:[]},text,[{documentId:'doc',pages:[{page:2,text:'The application helps students find events.'}]}],words);
  assert.equal(result.documentAlignment.length,1);assert.equal(result.documentAlignment[0].page,2);
  assert.equal(result.grammar[0].location.startSeconds,2);
});
test('missing timestamps are distinguished from no pauses',()=>{
  assert.equal(speechEvidence().timestampsAvailable,false);
});
