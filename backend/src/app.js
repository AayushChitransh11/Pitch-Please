import express from 'express';
import {prepareCoach} from './preparation.js';
import { toPresentationPdf } from './documents.js';
import { transcribeAudio, speechEvidence } from './speech.js';
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { Attempt, Brief, coach, measurements } from './analysis.js';

export function createApp({ analyze = coach, upstream = fetch, convertDocument = toPresentationPdf, prepare = prepareCoach, store } = {}) {
  const app = express();
  // Local capability-token sessions; server.js supplies a durable local store.
  const sessions = store?.sessions || new Map();
  const practices = store?.practices || new Map();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowed = process.env.FRONTEND_ORIGIN || 'http://localhost:8080';
    if (origin && origin !== allowed) return res.status(403).json({ error: 'Origin not allowed' });
    if (origin) res.setHeader('Access-Control-Allow-Origin', allowed);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-File-Name');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });
  app.use(express.json({ limit: '512kb' }));
  app.get('/health', (_req, res) => res.json({ ok: true, mode: store ? 'local-persistent' : 'local-starter', modelId: process.env.BEDROCK_MODEL_ID || null, region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1', pid: process.pid }));
  const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
  function authorized(req, id) {
    const session = sessions.get(id);
    const supplied = Buffer.from((req.headers.authorization || '').replace(/^Bearer /, ''));
    const expected = Buffer.from(session?.token || '');
    if (!session || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
      fail(404, 'Session not found or access denied');
    }
    return session;
  }
  app.post('/api/coach', async (req,res) => {
    const input=z.object({brief:Brief.partial(),messages:z.array(z.object({role:z.enum(['user','assistant']),text:z.string().trim().min(1).max(5000)})).min(1).max(20)}).parse(req.body);
    if(input.messages.at(-1).role!=='user')fail(400,'End the conversation with a user message.');
    res.json(await prepare(input));
  });
  app.post('/api/sessions', (req, res) => {
    const brief = Brief.parse(req.body);
    const sessionId = randomUUID();
    const token = randomBytes(32).toString('hex');
    sessions.set(sessionId, { brief, token, documents: [], files: new Map(), practiceIds: [], transcripts: new Map(), busy: false });
    res.status(201).json({ sessionId, sessionToken: token, brief });
  });
  app.get('/api/sessions/:id', (req, res) => {
    const session = authorized(req, req.params.id);
    res.json({ sessionId: req.params.id, brief: session.brief,
      documents: session.documents.map(d => ({ documentId: d.documentId, pageCount: d.pages.length, name: d.name })),
      practiceIds: session.practiceIds });
  });
  app.post('/api/sessions/:id/documents', express.raw({ type: ['application/pdf','application/octet-stream','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','text/plain'], limit: '10mb' }), async (req, res) => {
    const session = authorized(req, req.params.id);
    if (session.documents.length >= 3) fail(400, 'A session supports up to three documents');
    if (!Buffer.isBuffer(req.body)) fail(400, 'Send document bytes with the correct Content-Type.');
    if (session.busy) fail(409, 'Wait for the current request to finish.');
    let name;
    try { name = decodeURIComponent(req.headers['x-file-name'] || 'presentation.pdf').slice(0,240); }
    catch { fail(400, 'Invalid file name'); }
    session.busy = true;
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
    let loadingTask;
    let item;
    let pdf;
    try {
      pdf = await convertDocument(req.body, name);
      loadingTask = getDocument({ data: new Uint8Array(pdf), isEvalSupported: false,
        standardFontDataUrl: fileURLToPath(new URL('../node_modules/pdfjs-dist/standard_fonts/', import.meta.url)) });
      const document = await loadingTask.promise;
      if (document.numPages > 50) fail(400, 'Maximum 50 pages or slides per document');
      const pages = [];
      let characters = 0;
      for (let page = 1; page <= document.numPages; page++) {
        const content = await (await document.getPage(page)).getTextContent();
        const text = content.items.map(item => item.str || '').join(' ').trim();
        characters += text.length;
        if (characters > 40000) fail(400, 'PDF text exceeds 40,000 characters; use a shorter extract');
        pages.push({ page, text });
      }
      if (!pages.some(p => p.text)) fail(422, 'No extractable text. Export a text-based PDF or paste notes; OCR is not included.');
      item = { documentId: randomUUID(), name, pages };
    } catch (error) {
      if (!error.status) fail(422, 'Could not read this PDF; check encryption or file validity');
      throw error;
    } finally { session.busy = false; await loadingTask?.destroy(); }
    session.files.set(item.documentId, pdf);
    session.documents.push(item);
    sessions.set(req.params.id,session);
    res.status(201).json(item);
  });
  app.get('/api/sessions/:id/documents/:documentId/file', (req, res) => {
    const session = authorized(req, req.params.id);
    const bytes = session.files.get(req.params.documentId);
    if (!bytes) fail(404, 'Document not found');
    res.type('application/pdf').send(bytes);
  });
  app.post('/api/sessions/:id/transcribe', express.raw({type: ['audio/*', 'video/webm', 'application/octet-stream'], limit:'50mb'}), async (req,res) => {
    const session = authorized(req, req.params.id);
    if (!Buffer.isBuffer(req.body) || !req.body.length) fail(400, 'Send recorded audio bytes with an audio Content-Type.');
    if (session.busy) fail(409, 'Wait for the current request to finish.');
    if (session.transcripts.size >= 20) fail(400, 'Start a new session after 20 recordings.');
    session.busy = true;
    try {
      const result = await transcribeAudio(req.body, req.headers['content-type'] || 'audio/webm', upstream);
      session.transcripts.set(result.transcriptionId, result);
      sessions.set(req.params.id,session);
      res.status(201).json(result);
    } finally {session.busy=false;}
  });
  app.post('/api/sessions/:id/practice', async (req, res) => {
    const session = authorized(req, req.params.id);
    const attempt = Attempt.parse(req.body);
    if (attempt.transcriptionId) {
      const saved = session.transcripts.get(attempt.transcriptionId);
      if (!saved) fail(404, 'Transcript not found in this session.');
      if (saved.transcript.trim() !== attempt.transcript) fail(400, 'Transcript changed; submit the original recording transcript.');
      attempt.words = saved.words;
    }
    if (session.busy) fail(409, 'An analysis is already running');
    session.busy = true;
    try {
      const feedback = await analyze(session, attempt);
      const practiceId = randomUUID();
      const results = { ...feedback,
        measurements: measurements(attempt.transcript, attempt.durationSeconds, session.brief.targetSeconds),
        transcript: attempt.transcript, speech: speechEvidence(attempt.words),
        documentComparison: {uploadedDocuments:session.documents.length, verifiedFindings:feedback.documentAlignment?.length || 0} };
      practices.set(practiceId, { sessionId: req.params.id, attempt, results });
      session.practiceIds.push(practiceId);
      sessions.set(req.params.id,session);
      res.status(201).json({ practiceId, status: 'completed', results });
    } finally { session.busy = false; }
  });
  app.get('/api/practice/:id', (req, res) => {
    const practice = practices.get(req.params.id);
    if (!practice) fail(404, 'Practice not found');
    authorized(req, practice.sessionId);
    res.json({ practiceId: req.params.id, status: 'completed', results: practice.results });
  });
  app.delete('/api/sessions/:id', (req, res) => {
    const session = authorized(req, req.params.id);
    if (session.busy) fail(409, 'Wait for analysis to finish before deleting');
    for (const id of session.practiceIds) practices.delete(id);
    sessions.delete(req.params.id);
    res.sendStatus(204);
  });
  app.use((error, _req, res, _next) => {
    if (res.headersSent) return _next(error);
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid data', issues: error.issues });
    const status = error.status || 502;
    res.status(status).json({ error: error.status ? error.message : 'Processing failed. Check model access, service availability, or model output and retry.' });
  });
  return app;
}
