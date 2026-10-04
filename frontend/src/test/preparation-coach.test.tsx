import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {it,expect,vi,afterEach} from 'vitest';
import {PreparationCoach} from '@/components/PreparationCoach';
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it('retains a failed question, retries, then displays the coach reply',async()=>{
 const fetchMock=vi.fn().mockResolvedValueOnce(Response.json({error:'AWS credentials expired'},{status:503})).mockResolvedValueOnce(Response.json({reply:'Open with a student missing an event.'}));
 vi.stubGlobal('fetch',fetchMock);
 render(<PreparationCoach brief={{topic:'Campus events',audience:'Judges',purpose:'Explain',targetSeconds:60,requiredPoints:[]}}/>);
 expect(screen.getByRole('button',{name:'Ask coach'})).toBeDisabled();
 fireEvent.change(screen.getByRole('textbox',{name:'Message the coach'}),{target:{value:'Suggest an opening.'}});
 fireEvent.click(screen.getByRole('button',{name:'Ask coach'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('AWS credentials expired');
 expect(screen.getByRole('textbox',{name:'Message the coach'})).toHaveValue('Suggest an opening.');
 fireEvent.click(screen.getByRole('button',{name:'Ask coach'}));
 expect(await screen.findByText('Open with a student missing an event.')).toBeInTheDocument();
 await waitFor(()=>expect(screen.getByRole('textbox',{name:'Message the coach'})).toHaveValue(''));
 expect(JSON.parse(fetchMock.mock.calls[1]?.[1].body).brief.topic).toBe('Campus events');
});
