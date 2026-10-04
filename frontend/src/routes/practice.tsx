import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { SiteFooter, SiteHeader } from '@/components/site/SiteHeader';
import { VoicePoweredOrb } from '@/components/ui/voice-powered-orb';
import { SlideDeck } from '@/components/SlideDeck';
import { FeedbackDetails } from '@/components/FeedbackDetails';
import { CtaLink } from '@/components/site/CtaLink';
import { api, getResults, sessionId, submitPractice, transcribeRecording, type PracticeResults } from '@/lib/api';
export const Route = createFileRoute('/practice')({ component: PracticeScreen });
const button = 'rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50';
const message = (e: unknown) => e instanceof Error ? e.message : 'Connection failed. Please try again.';
export function PracticeScreen() {
  return <PracticePage />;
}

function PracticePage() {
  const [phase, setPhase] = useState<'idle' | 'recording' | 'finishing' | 'transcribing' | 'review'>('idle');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [transcriptionId, setTranscriptionId] = useState<string>();
  const [results, setResults] = useState<PracticeResults | null>(null);
  const [audio, setAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [ready, setReady] = useState(false);
  const [documents, setDocuments] = useState<{documentId:string;pageCount:number}[]>([]);
  const documentCount = documents.length;
  const [voiceStream,setVoiceStream] = useState<MediaStream | null>(null);
  const [voiceDetected,setVoiceDetected] = useState(false);
  const mounted = useRef(true);
  const mic = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [target, setTarget] = useState(180);
  const [reportId, setReportId] = useState('');
  const startTime = useRef(0);
  const recording = useRef(false);
  const cleanup = useRef(() => {});
  cleanup.current = () => { recording.current = false; if (recorder.current?.state === 'recording') { recorder.current.onstop = null; recorder.current.stop(); } mic.current?.getTracks().forEach(t => t.stop()); };
  useEffect(() => {
    mounted.current=true;
    try {
      api<{ brief: { targetSeconds: number }; documents: {documentId:string;pageCount:number}[] }>(`/api/sessions/${sessionId()}`)
        .then(r => {setTarget(r.brief.targetSeconds); setDocuments(r.documents);setReady(true);}).catch(e => setError(message(e)));
      const saved = sessionStorage.getItem('pc-attempt');
      if (saved) {
        const attempt = JSON.parse(saved);
        setText(attempt.transcript); setTranscriptionId(attempt.transcriptionId);
        setSeconds(attempt.durationSeconds); setPhase('review');
        const savedReport = sessionStorage.getItem('pc-practice-id');
        if (savedReport) getResults().then(r => { setResults(r); setReportId(savedReport); }).catch(e => setError(message(e)));
      }
    } catch (e) { setError(message(e)); }
    return () => {mounted.current=false;cleanup.current();};
  }, []);
  useEffect(() => {
    if (phase !== 'recording') return;
    const timer = setInterval(() => setSeconds((performance.now() - startTime.current) / 1000), 250);
    return () => clearInterval(timer);
  }, [phase]);
  useEffect(() => {
    if (!audio) return;
    const url = URL.createObjectURL(audio); setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [audio]);
  async function evaluate(transcript: string, duration: number, id?: string) {
    setBusy(true); setError('');
    sessionStorage.setItem('pc-attempt', JSON.stringify({transcript,durationSeconds:duration,transcriptionId:id}));
    try {
      const result = await submitPractice(transcript, duration, id);
      setReportId(result.practiceId); setResults(result.results);
    } catch(e) {setError(message(e));}
    finally {setBusy(false);}
  }
  async function processRecording(blob: Blob, duration: number) {
    setPhase('transcribing'); setError('');
    try {
      const result = await transcribeRecording(blob);
      setText(result.transcript); setTranscriptionId(result.transcriptionId); setPhase('review');
      await evaluate(result.transcript,duration,result.transcriptionId);
    } catch(e) {setError(message(e)); setPhase('review');}
  }
  async function importRecording(file:File | undefined) {
    if (!file) return;
    if(file.size>45*1024*1024){setError('Audio must be 45 MB or smaller.');return;}
    setBusy(true);setError('');
    const url=URL.createObjectURL(file);
    try {
      const duration=await new Promise<number>((resolve,reject)=>{
        const player=new Audio();const timeout=setTimeout(()=>{player.src='';reject(new Error('Could not read audio duration. Try WAV or MP3.'));},10000);
        player.onloadedmetadata=()=>{clearTimeout(timeout);const value=player.duration;player.src='';Number.isFinite(value)&&value>0&&value<=7200?resolve(value):reject(new Error('Use an audio recording shorter than two hours with a readable duration.'));};
        player.onerror=()=>{clearTimeout(timeout);reject(new Error('This audio file could not be read. Try WAV or MP3.'));};player.src=url;
      });
      setText('');setTranscriptionId(undefined);setResults(null);setReportId('');setSeconds(duration);setAudio(file);
      sessionStorage.removeItem('pc-attempt');sessionStorage.removeItem('pc-practice-id');
      await processRecording(file,duration);
    }catch(e){setError(message(e));}finally{URL.revokeObjectURL(url);setBusy(false);}
  }
  async function start() {
    setError('');setBusy(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') throw new Error('Audio recording is unavailable. Use a supported browser on localhost or HTTPS.');
      mic.current = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
      if(!mounted.current){mic.current.getTracks().forEach(t=>t.stop());return;}
      const mimeType=['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus'].find(type=>MediaRecorder.isTypeSupported(type));
      const rec = new MediaRecorder(mic.current,mimeType ? {mimeType} : undefined); recorder.current=rec;
      const chunks:Blob[]=[];
      let size=0;
      rec.ondataavailable = event => {
        if(event.data.size) {chunks.push(event.data);size+=event.data.size;}
        if(size>45*1024*1024 && rec.state==='recording') rec.stop();
      };
      rec.onerror = () => {setVoiceStream(null);setError('Recording failed. Check your microphone and try again.');mic.current?.getTracks().forEach(t=>t.stop());setPhase('review');};
      rec.onstop = () => {
        setVoiceStream(null);
        const duration=Math.max(1,(performance.now()-startTime.current)/1000);
        mic.current?.getTracks().forEach(t=>t.stop()); recording.current=false;setSeconds(duration);
        const blob=new Blob(chunks,{type:rec.mimeType || 'audio/webm'});setAudio(blob);
        if(!blob.size) {setError('The recording was empty. Check your microphone.');setPhase('review');return;}
        void processRecording(blob,duration);
      };
      rec.start(1000); setVoiceStream(mic.current); startTime.current=performance.now();recording.current=true;
      setText('');setTranscriptionId(undefined);setResults(null);setReportId('');setAudio(null);setAudioUrl('');setSeconds(0);
      sessionStorage.removeItem('pc-attempt');sessionStorage.removeItem('pc-practice-id');setPhase('recording');
    } catch(e) {mic.current?.getTracks().forEach(t=>t.stop());setError(message(e));}
    finally {setBusy(false);}
  }
  function stop() {
    if(recorder.current?.state==='recording') {setPhase('finishing');recorder.current.stop();}
  }
  async function analyze() { await evaluate(text,seconds,transcriptionId); }
  const words = results?.measurements.wordCount ?? (text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) || []).length;
  return <div className="min-h-screen"><SiteHeader /><main className="mx-auto max-w-3xl px-5 py-12">
    <h1 className="text-4xl font-semibold">Rehearse out loud</h1>
    <p className="mt-3 text-muted-foreground">Record your presentation. When you finish, ElevenLabs transcribes the recording, then the coach checks grammar, delivery, structure and your uploaded material.</p>
    <p className="mt-3 text-sm text-muted-foreground">{documentCount ? `${documentCount} uploaded document(s) will be compared with your speech.` : 'No document uploaded. Feedback will use your speech and presentation brief.'}</p>
    <p role="status" className="mt-4 font-semibold">{phase === 'recording' ? '1. Recording your presentation' : phase === 'finishing' || phase === 'transcribing' ? '2. Creating the final transcript…' : busy ? '3. Evaluating grammar, speech and document alignment…' : results ? '4. Your feedback is ready' : 'Ready to practice'}</p>
    <div className="mt-6 flex items-center gap-4 rounded-3xl border bg-card px-5 py-3">
      <div className="h-28 w-28 shrink-0"><VoicePoweredOrb mediaStream={voiceStream} enableVoiceControl={phase==='recording'} onVoiceDetected={setVoiceDetected} /></div>
      <div><p className="font-semibold">{phase==='recording' ? 'Recording your voice' : 'Your rehearsal coach'}</p><p className="text-sm text-muted-foreground">{phase==='recording' ? voiceDetected ? 'Microphone signal detected' : 'Listening… speak into your microphone' : 'Start a rehearsal to see the orb respond to your voice.'}</p></div>
    </div>
    <SlideDeck documents={documents} />
    {error && <p role="alert" className="mt-5 rounded-xl border border-destructive p-4 text-destructive">{error}</p>}
    <section className="mt-8 rounded-3xl border bg-card p-6 space-y-5">
      <div className="flex flex-wrap gap-6"><span>{Math.floor(seconds / 60)}:{String(Math.floor(seconds % 60)).padStart(2, '0')} / {Math.floor(target / 60)}:{String(target % 60).padStart(2, '0')}</span><span>{words} words</span><span>{seconds > 0 ? Math.round(words * 60 / seconds) : 0} words/min</span><span>{(text.match(/\b(?:um+|uh+|erm)\b/gi) || []).length} fillers</span></div>
      {phase === 'recording' ? <button className={button} onClick={stop}>Finish presentation</button> : <button className={button} disabled={!ready || busy || phase === 'finishing' || phase === 'transcribing'} onClick={start}>{phase === 'finishing' || phase === 'transcribing' ? 'Transcribing…' : busy ? 'Working…' : 'Start new rehearsal'}</button>}
      {phase!=='recording' && phase!=='transcribing' && phase!=='finishing' && <label className="block text-sm font-medium">Or upload a rehearsal recording<input aria-label="Upload rehearsal audio" type="file" accept="audio/*" disabled={!ready||busy} className="mt-2 block w-full text-sm" onChange={e=>{void importRecording(e.target.files?.[0]);e.target.value='';}} /></label>}
      {phase === 'recording' ? <p>Recording… Finish your presentation to get its complete transcript and feedback.</p> : text ? <section><h2 className="font-semibold">Your transcript</h2><p className="mt-2 whitespace-pre-wrap">{text}</p><p className="mt-2 text-sm text-muted-foreground">Speech recognition can make mistakes. Listen to the recording when reviewing a flagged sentence.</p></section> : null}
      {audioUrl && <audio controls src={audioUrl} className="w-full" />}
      {phase === 'review' && audio && !text && <button className={button} disabled={busy} onClick={() => processRecording(audio,seconds)}>Retry transcription</button>}
      {phase === 'review' && <button className={button} disabled={busy || !text.trim()} onClick={analyze}>{busy ? 'Working…' : 'Retry / refresh evaluation'}</button>}
    </section>
    {results && <FeedbackDetails results={results} />}

    <div className="mt-8 flex gap-3">{reportId && <CtaLink to="/results">View report</CtaLink>}{phase !== 'recording' && phase !== 'finishing' && phase !== 'transcribing' && <CtaLink to="/prepare" variant="outline">Edit brief</CtaLink>}</div>
  </main><SiteFooter /></div>;
}
