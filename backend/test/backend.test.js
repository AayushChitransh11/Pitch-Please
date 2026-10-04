import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { measurements, validateEvidence } from '../src/analysis.js';

const brief = { topic: 'Campus events', audience: 'Judges', purpose: 'Explain the demo', targetSeconds: 180, requiredPoints: ['Problem'] };
const feedback = { coverage: [{ point: 'Problem', status: 'covered', evidence: 'Students miss events.' }], strengths: ['Clear problem'], improvements: [{ priority: 1, category: 'content', observation: 'No close', suggestion: 'Add a takeaway' }], grammar: [] };

test('metrics handle overrun and do not label meaningful like as a filler', () => {
  const m = measurements('Um I like this uh example', 200, 180);
  assert.equal(m.wordCount, 6);
  assert.equal(m.fillerCount, 2);
  assert.equal(m.overrunSeconds, 20);
});

test('unsupported quotations are downgraded instead of shown as evidence', () => {
  const result = validateEvidence(feedback, brief, 'We built an app.');
  assert.deepEqual(result.coverage, [{ point: 'Problem', status: 'uncertain', evidence: null }]);
});

test('session authorization, validation, report and deletion', async t => {
  const calls = [];
  const previousKey = process.env.ELEVENLABS_API_KEY;
  process.env.ELEVENLABS_API_KEY = 'test-key';
  const server = createApp({ analyze: async () => feedback, upstream: async (url, options) => {
    calls.push({ url, options });
    return Response.json(url.includes('single-use-token') ? { token: 'single-use' } : { signed_url: 'wss://example.invalid' });
  } }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => {
    server.close();
    if (previousKey === undefined) delete process.env.ELEVENLABS_API_KEY; else process.env.ELEVENLABS_API_KEY = previousKey;
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (path, method = 'GET', body, token) => fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  assert.equal((await request('/api/sessions', 'POST', { ...brief, targetSeconds: 0 })).status, 400);
  const created = await request('/api/sessions', 'POST', brief);
  assert.equal(created.status, 201);
  const { sessionId: id, sessionToken: token } = await created.json();
  assert.equal((await request(`/api/sessions/${id}`)).status, 404);
  assert.equal((await request(`/api/sessions/${id}`, 'GET', undefined, token)).status, 200);
  assert.equal((await fetch(base + '/health', { headers: { Origin: 'https://untrusted.invalid' } })).status, 403);
  const response = await request(`/api/sessions/${id}/practice`, 'POST', { transcript: 'Students miss events.', durationSeconds: 30 }, token);
  assert.equal(response.status, 201);
  const report = await response.json();
  assert.equal(report.results.measurements.wordCount, 3);
  assert.equal(report.results.measurements.wordsPerMinute, 6);
  const other = await (await request('/api/sessions', 'POST', brief)).json();
  assert.equal((await request(`/api/practice/${report.practiceId}`, 'GET', undefined, other.sessionToken)).status, 404);
  assert.equal((await request(`/api/sessions/${id}/documents`, 'POST', {}, token)).status, 400);
  const content = 'BT /F1 12 Tf 50 750 Td (Students miss events.) Tj ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(n => `${String(n).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const upload = await fetch(`${base}/api/sessions/${id}/documents`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/pdf' }, body: pdf,
  });
  assert.equal(upload.status, 201);
  const document = await upload.json();
  assert.equal(document.pages[0].text, 'Students miss events.');
  const filePath = `/api/sessions/${id}/documents/${document.documentId}/file`;
  assert.equal((await request(filePath)).status,404);
  assert.equal((await request(filePath, 'GET', undefined, other.sessionToken)).status,404);
  const slideFile = await request(filePath, 'GET', undefined, token);
  assert.equal(slideFile.headers.get('content-type'),'application/pdf');
  assert.equal(await slideFile.text(),pdf);
  assert.equal((await request(`/api/sessions/${id}`, 'DELETE', undefined, token)).status, 204);
  assert.equal((await request(`/api/practice/${report.practiceId}`, 'GET', undefined, token)).status, 404);
});
