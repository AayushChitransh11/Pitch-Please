import {useState,type FormEvent} from 'react';
import {api,type PresentationBrief} from '@/lib/api';
type Turn={role:'user'|'assistant';text:string};
export function PreparationCoach({brief}:{brief:PresentationBrief}) {
  const [messages,setMessages]=useState<Turn[]>([]);
  const [text,setText]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  async function send(event:FormEvent){
    event.preventDefault();if(!text.trim()||busy)return;
    const question=text.trim();const turns:Turn[]=[...messages.slice(-18),{role:'user',text:question}];
    setBusy(true);setError('');
    try{const result=await api<{reply:string}>('/api/coach',{method:'POST',body:JSON.stringify({brief,messages:turns})});setMessages([...turns,{role:'assistant',text:result.reply}]);setText('');}
    catch(e){setError(e instanceof Error?e.message:'Could not reach the coach.');}
    finally{setBusy(false);}
  }
  return <section className="self-start rounded-3xl border bg-card p-6 shadow-soft sm:p-8">
    <h2 className="text-xl font-semibold">Preparation coach</h2>
    <p className="mt-2 text-sm text-muted-foreground">Ask for an outline, a stronger opening, or help choosing your key points. The coach uses the brief beside this chat.</p>
    <div className="mt-5 max-h-96 space-y-4 overflow-y-auto" aria-live="polite">{messages.map((m,i)=><div key={i} className={m.role==='user'?'rounded-xl bg-secondary p-3':'rounded-xl border p-3'}><strong>{m.role==='user'?'You':'Coach'}</strong><p className="mt-1 whitespace-pre-wrap">{m.text}</p></div>)}</div>
    {error&&<p role="alert" className="mt-3 text-destructive">{error}</p>}
    <form className="mt-5 space-y-3" onSubmit={send}>
      <label className="block font-medium">Message the coach<textarea className="mt-2 w-full rounded-xl border bg-background p-3" rows={3} maxLength={5000} value={text} onChange={e=>setText(e.target.value)} placeholder="Help me structure my three-minute pitch." /></label>
      <button className="rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-50" disabled={busy||!text.trim()}>{busy?'Thinking…':'Ask coach'}</button>
    </form>
  </section>;
}
