import { randomUUID } from 'node:crypto';
export async function transcribeAudio(bytes, mime, upstream = fetch) {
  if (!process.env.ELEVENLABS_API_KEY) throw Object.assign(new Error('Set ELEVENLABS_API_KEY to transcribe recordings.'), {status:503});
  const form = new FormData();
  form.append('model_id', 'scribe_v2');
  form.append('file', new Blob([bytes], {type:mime}), `practice.${mime.includes('flac') ? 'flac' : mime.includes('mpeg') ? 'mp3' : mime.includes('wav') ? 'wav' : mime.includes('mp4') ? 'mp4' : mime.includes('ogg') ? 'ogg' : 'webm'}`);
  form.append('timestamps_granularity', 'word');
  form.append('no_verbatim', 'false');
  form.append('tag_audio_events', 'false');
  const response = await upstream('https://api.elevenlabs.io/v1/speech-to-text', {
    method:'POST', headers:{'xi-api-key':process.env.ELEVENLABS_API_KEY}, body:form, signal:AbortSignal.timeout(120000),
  });
  if (!response.ok) throw Object.assign(new Error(`ElevenLabs transcription failed (${response.status}). Check Speech to Text permissions, credits, and audio format.`), {status:502});
  const data = await response.json();
  if (!data.text?.trim()) throw Object.assign(new Error('No speech was detected. Check your microphone and record again.'), {status:422});
  const words = (data.words || []).filter(w => w.type === 'word' && Number.isFinite(w.start) && Number.isFinite(w.end) && w.end >= w.start)
    .map(w => ({text:w.text,start:w.start,end:w.end}));
  return {transcriptionId:randomUUID(), transcript:data.text.trim(), words};
}
export function speechEvidence(words = []) {
  const fillers = words.filter(w => /^(um+|uh+|erm|er)[.,!?]?$/i.test(w.text));
  const pauses = [];
  for(let i=1;i<words.length;i++) {
    const previous=words[i-1], next=words[i];
    if(next.start-previous.end >= 1.5) pauses.push({start:previous.end,end:next.start,durationSeconds:Number((next.start-previous.end).toFixed(2)),after:previous.text,before:next.text});
  }
  return {fillers,pauses,timestampsAvailable:words.length>0};
}
export function quoteLocation(transcript, quote, words = []) {
  const startOffset=transcript.toLowerCase().indexOf(quote.toLowerCase());
  if(startOffset<0 || !quote.trim()) return null;
  let cursor=0;
  let seconds=null;
  for(const word of words) {
    const offset=transcript.toLowerCase().indexOf(word.text.toLowerCase(),cursor);
    if(offset<0) continue;
    if(offset+word.text.length>startOffset) {seconds=word.start;break;}
    cursor=offset+word.text.length;
  }
  return {startOffset,endOffset:startOffset+quote.length,startSeconds:seconds};
}
