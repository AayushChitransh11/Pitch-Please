// API service boundary. All network calls go through here so switching from
// sample data to the real backend (AWS/Azure, owned by teammates) is one change.

export type PresentationBrief = {
  topic: string;
  audience: string;
  purpose: string;
  targetSeconds: number;
  requiredPoints: string[];
  draftText?: string;
  presentationType?: "startup" | "dissertation" | "academic" | "demo" | "research" | "professional";
  tone?: string;
};

// Contract for practice analysis results (GET /api/practice/:id, completed).
export type CoverageStatus = "covered" | "partial" | "missing" | "uncertain";

export type PracticeResults = {
  measurements: {
    durationSeconds: number;
    targetSeconds: number;
    wordCount: number;
    wordsPerMinute: number;
    fillerCount?: number;
    fillersPerMinute?: number;
  };
  coverage: { point: string; status: CoverageStatus; evidence: string | null }[];
  strengths: string[];
  improvements: {
    category: string;
    priority: number;
    observation: string;
    suggestion: string;
  }[];
  speech?: { timestampsAvailable: boolean; fillers: {text:string;start:number;end:number}[]; pauses: {start:number;end:number;durationSeconds:number;after:string;before:string}[] };
  documentComparison?: { uploadedDocuments:number; verifiedFindings:number };
  documentAlignment?: {documentId:string;page:number;sourceQuote:string;spokenQuote:string|null;status:string;observation:string;suggestion:string}[];
  transcript: string;
  grammar?: { original: string; suggested: string; explanation: string }[];
};


const BASE = (import.meta.env['VITE_API_BASE_URL'] || '/backend').replace(/\/$/, '');
export function sessionId() {
  const id = sessionStorage.getItem('pc-session-id');
  if (!id) throw new Error('Prepare and save your presentation first.');
  return id;
}
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = sessionStorage.getItem('pc-session-token');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (typeof init.body === 'string') headers.set('Content-Type', 'application/json');
  let response: Response;
  try { response = await fetch(`${BASE}${path}`, { ...init, headers }); }
  catch { throw new Error('Cannot reach the backend. Start it on port 4000 and try again.'); }
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(response.status === 404
    ? 'Session or report not found. Prepare and save a new presentation.'
    : body?.error || `Backend request failed (${response.status}).`);
  if (!body && response.status !== 204) throw new Error('Unexpected backend response. Check the API URL.');
  return body;
}
export async function createSession(brief: PresentationBrief) {
  const result = await api<{sessionId: string; sessionToken: string; brief: PresentationBrief}>('/api/sessions', { method: 'POST', body: JSON.stringify(brief) });
  sessionStorage.setItem('pc-session-id', result.sessionId);
  sessionStorage.setItem('pc-session-token', result.sessionToken);
  sessionStorage.removeItem('pc-practice-id');
  sessionStorage.removeItem('pc-attempt');
  return result;
}
export function uploadDocument(id: string, file: File) {
  return api(`/api/sessions/${id}/documents`, { method: 'POST', headers: { 'Content-Type': 'application/octet-stream', 'X-File-Name': encodeURIComponent(file.name) }, body: file });
}
export async function submitPractice(transcript: string, durationSeconds: number, transcriptionId?: string) {
  const result = await api<{practiceId: string; results: PracticeResults}>(`/api/sessions/${sessionId()}/practice`, {
    method: 'POST', body: JSON.stringify({ transcript, durationSeconds, transcriptionId }),
  });
  sessionStorage.setItem('pc-practice-id', result.practiceId);
  return result;
}
export async function getResults() {
  const id = sessionStorage.getItem('pc-practice-id');
  if (!id) throw new Error('No report yet. Complete a rehearsal and generate feedback first.');
  const response = await api<{ results: PracticeResults }>(`/api/practice/${id}`);
  return response.results;
}

export function transcribeRecording(audio: Blob) {
  return api<{transcriptionId:string;transcript:string}>(`/api/sessions/${sessionId()}/transcribe`, {
    method:'POST',headers:{'Content-Type':audio.type || 'audio/webm'},body:audio,
  });
}

export async function getSlidePdf(documentId: string, signal?: AbortSignal) {
  const response = await fetch(`${BASE}/api/sessions/${sessionId()}/documents/${documentId}/file`, {
    headers: { Authorization: `Bearer ${sessionStorage.getItem('pc-session-token') || ''}` }, signal:signal || null,
  });
  if (!response.ok) throw new Error('Could not load slides. Check the backend connection or attach the document again.');
  return response.arrayBuffer();
}

// Compatibility for existing PDF callers.
export const uploadPdf = uploadDocument;
