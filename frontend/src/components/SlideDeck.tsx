import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { getSlidePdf } from '@/lib/api';

const control = 'rounded-full border px-4 py-2 font-medium disabled:opacity-40';
export function SlideDeck({documents}: {documents: {documentId:string;pageCount:number;name?:string}[]}) {
  const [selected, setSelected] = useState('');
  const id = selected || documents[0]?.documentId;
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!id) return;
    const abort = new AbortController();
    let disposed = false;
    let task: {destroy: () => Promise<void>} | undefined;
    setPdf(null); setPage(1); setError('');
    void (async () => {
      try {
        const engine = await import('pdfjs-dist');
        engine.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;
        const bytes = await getSlidePdf(id, abort.signal);
        if (disposed) return;
        const loading = engine.getDocument({data:bytes});
        task = loading;
        const loaded = await loading.promise;
        if (!disposed) setPdf(loaded);
      } catch(e) { if (!disposed) setError(e instanceof Error ? e.message : 'Could not open slides.'); }
    })();
    return () => {disposed = true; abort.abort(); void task?.destroy();};
  }, [id]);
  useEffect(() => {
    if (!pdf || !canvas.current) return;
    let disposed = false;
    let render: {cancel:()=>void} | undefined;
    void (async () => {
      try {
        const slide = await pdf.getPage(page);
        if (disposed || !canvas.current) return;
        const viewport = slide.getViewport({scale:1});
        const scaled = slide.getViewport({scale:Math.min(2, 1600 / viewport.width)});
        const target = canvas.current;
        target.width = scaled.width; target.height = scaled.height;
        const task = slide.render({canvas:target, viewport:scaled});
        render = task;
        await task.promise;
      } catch(e) { if (!disposed) setError(e instanceof Error ? e.message : 'Could not render slide.'); }
    })();
    return () => {disposed = true; render?.cancel();};
  }, [pdf, page]);
  return <section aria-label="Presentation slides" className="mt-6 rounded-3xl border bg-card p-5" onKeyDown={event => {
    if (event.target instanceof HTMLSelectElement) return;
    if (event.key === 'ArrowRight') {event.preventDefault();setPage(p=>Math.min(pdf?.numPages || 1,p+1));}
    if (event.key === 'ArrowLeft') {event.preventDefault();setPage(p=>Math.max(1,p-1));}
  }} tabIndex={0}>
    <h2 className="text-xl font-semibold">Your slideshow</h2>
    {!id ? <p className="mt-2 text-muted-foreground">Attach PDF, Word, PowerPoint, or text on Prepare. Documents are displayed page by page while you rehearse.</p> : <>
      {documents.length > 1 && <label className="mt-3 block">Presentation document <select className="ml-2 rounded border p-2" value={id} onChange={e=>setSelected(e.target.value)}>{documents.map((d,i)=><option key={d.documentId} value={d.documentId}>{d.name || `Document ${i+1}`} · {d.pageCount} pages</option>)}</select></label>}
      {error ? <p role="alert" className="mt-3 text-destructive">{error}</p> : !pdf ? <p role="status" className="mt-3">Loading slides…</p> : null}
      <canvas ref={canvas} role="img" aria-label={`Slide ${page}`} className={`mx-auto mt-4 max-h-[60vh] max-w-full object-contain ${!pdf || error ? 'hidden' : ''}`} />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button className={control} disabled={!pdf || page===1} onClick={()=>setPage(p=>p-1)}>Previous slide</button>
        <span aria-live="polite">Slide {page} / {pdf?.numPages || documents.find(d=>d.documentId===id)?.pageCount || '…'}</span>
        <button className={control} disabled={!pdf || page>=pdf.numPages} onClick={()=>setPage(p=>p+1)}>Next slide</button>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">Use the arrows while this panel is focused. Your microphone keeps recording as you change slides.</p>
    </>}
  </section>;
}
