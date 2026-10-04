import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
vi.mock('@/components/site/SiteHeader', () => ({ SiteHeader: () => null, SiteFooter: () => null }));
vi.mock('@/components/site/CtaLink', () => ({ CtaLink: ({ children }: {children: React.ReactNode}) => <span>{children}</span> }));
vi.mock('@/components/ui/voice-powered-orb', () => ({VoicePoweredOrb: () => <div data-testid="voice-orb" />}));
vi.mock('@/components/SlideDeck', () => ({SlideDeck: () => <section aria-label="Presentation slides" />}));
import { PracticeScreen } from '@/routes/practice';
it('renders the rehearsal controls without an agent provider', async () => {
  sessionStorage.clear();
  render(<PracticeScreen />);
  expect(screen.getByRole('heading', { name: 'Rehearse out loud' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Start new rehearsal' })).toBeInTheDocument();
  expect(await screen.findByRole('alert')).toHaveTextContent('Prepare and save your presentation first.');
});

it('records, transcribes, then evaluates and displays specific feedback in that order', async () => {
  const {fireEvent, waitFor, cleanup} = await import('@testing-library/react');
  cleanup();
  sessionStorage.setItem('pc-session-id','session');sessionStorage.setItem('pc-session-token','token');
  const fetchMock=vi.fn().mockResolvedValueOnce(Response.json({brief:{targetSeconds:60},documents:[{}]}))
    .mockResolvedValueOnce(Response.json({transcriptionId:'transcript-id',transcript:'Our app help students.'}))
    .mockResolvedValueOnce(Response.json({practiceId:'report',results:{transcript:'Our app help students.',measurements:{durationSeconds:5,targetSeconds:60,wordCount:4,wordsPerMinute:48,fillerCount:0},strengths:[],coverage:[],improvements:[{category:'grammar',priority:1,observation:'Verb agreement',suggestion:'Use helps'}],grammar:[{original:'Our app help students',suggested:'Our app helps students',explanation:'Singular subject'}],documentAlignment:[{documentId:'doc',page:1,sourceQuote:'supports students',spokenQuote:'Our app help students',status:'partial',observation:'Missing detail',suggestion:'Explain how'}],documentComparison:{uploadedDocuments:1,verifiedFindings:1}}}));
  vi.stubGlobal('fetch',fetchMock);
  const track={stop:vi.fn()};
  Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:vi.fn().mockResolvedValue({getTracks:()=>[track]})}});
  class FakeRecorder {
    state='inactive';mimeType='audio/webm';onstop:(()=>void)|null=null;
    ondataavailable:((e:{data:Blob})=>void)|null=null;
    static isTypeSupported(){return true;}
    start(){this.state='recording';}
    stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['audio'],{type:'audio/webm'})});this.onstop?.();}
  }
  vi.stubGlobal('MediaRecorder',FakeRecorder);
  vi.stubGlobal('URL', class extends URL {static override createObjectURL(){return 'blob:test';} static override revokeObjectURL(){} });
  render(<PracticeScreen/>);
  await waitFor(()=>expect(screen.getByRole('button',{name:'Start new rehearsal'})).toBeEnabled());
  fireEvent.click(screen.getByRole('button',{name:'Start new rehearsal'}));
  fireEvent.click(await screen.findByRole('button',{name:'Finish presentation'}));
  await screen.findByText('Grammar and phrasing');
  expect(fetchMock.mock.calls[1]![0]).toContain('/transcribe');
  expect(fetchMock.mock.calls[2]![0]).toContain('/practice');
  expect(JSON.parse(fetchMock.mock.calls[2]![1].body).transcriptionId).toBe('transcript-id');
  expect(screen.getByText('Page 1 · partial')).toBeInTheDocument();
  expect(track.stop).toHaveBeenCalled();
  expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
  cleanup();vi.unstubAllGlobals();
});

it('restores completed feedback after returning to practice', async () => {
  const {cleanup} = await import('@testing-library/react');
  cleanup();sessionStorage.clear();
  sessionStorage.setItem('pc-session-id','session');sessionStorage.setItem('pc-session-token','token');
  sessionStorage.setItem('pc-practice-id','saved-report');
  sessionStorage.setItem('pc-attempt',JSON.stringify({transcript:'Our app helps.',durationSeconds:5}));
  vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce(Response.json({brief:{targetSeconds:60},documents:[]}))
    .mockResolvedValueOnce(Response.json({results:{transcript:'Our app helps.',measurements:{durationSeconds:5,targetSeconds:60,wordCount:3,wordsPerMinute:36},strengths:[],coverage:[],improvements:[],grammar:[]}})));
  render(<PracticeScreen/>);
  expect(await screen.findByText('4. Your feedback is ready')).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:/camera/i})).not.toBeInTheDocument();
  expect(screen.getByRole('region',{name:'Presentation slides'})).toBeInTheDocument();
  cleanup();vi.unstubAllGlobals();sessionStorage.clear();
});
