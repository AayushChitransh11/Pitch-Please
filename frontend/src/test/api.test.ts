import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSession, getResults, submitPractice, uploadPdf } from '@/lib/api';
const brief = { topic: 'Events', audience: 'Students', purpose: 'Explain', targetSeconds: 180, requiredPoints: [] };
beforeEach(() => sessionStorage.clear());
afterEach(() => vi.unstubAllGlobals());
describe('backend integration contract', () => {
  it('stores session credentials and sends PDF bytes with authorization', async () => {
    const mock = vi.fn().mockResolvedValueOnce(Response.json({sessionId:'real-id', sessionToken:'secret', brief}))
      .mockResolvedValueOnce(Response.json({ documentId:'pdf-id' }));
    vi.stubGlobal('fetch', mock);
    await createSession(brief);
    expect(sessionStorage.getItem('pc-session-id')).toBe('real-id');
    const file = new File(['%PDF-'], 'slides.pdf', {type:'application/pdf'});
    await uploadPdf('real-id', file);
    const call = mock.mock.calls[1]!;
    expect(call[0]).toBe('/backend/api/sessions/real-id/documents');
    expect(call[1].body).toBe(file);
    expect(call[1].headers.get('Authorization')).toBe('Bearer secret');
  });
  it('submits real transcript and unwraps report envelope', async () => {
    sessionStorage.setItem('pc-session-id', 'session');
    const results = { transcript:'Hello everyone' };
    const mock = vi.fn().mockResolvedValueOnce(Response.json({practiceId:'attempt', results}))
      .mockResolvedValueOnce(Response.json({practiceId:'attempt', status:'completed', results}));
    vi.stubGlobal('fetch', mock);
    await submitPractice('Hello everyone', 25);
    expect(JSON.parse(mock.mock.calls[0]![1].body).durationSeconds).toBe(25);
    expect(await getResults()).toEqual(results);
  });
  it('shows backend errors instead of falling back to sample reports', async () => {
    sessionStorage.setItem('pc-practice-id', 'attempt');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({error:'Set BEDROCK_MODEL_ID'}, {status:503})));
    await expect(getResults()).rejects.toThrow('Set BEDROCK_MODEL_ID');
  });
});
