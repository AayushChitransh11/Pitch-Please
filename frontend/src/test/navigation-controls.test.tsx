import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {it,expect,vi,afterEach} from 'vitest';
vi.mock('@tanstack/react-router',()=>({Link:({to,children,...props}:{to:string;children:React.ReactNode})=><a href={to} {...props}>{children}</a>}));
vi.mock('@/components/site/Decor',()=>({Sparkle:()=>null}));
import {SiteHeader,SiteFooter} from '@/components/site/SiteHeader';
afterEach(cleanup);
it('opens and closes the mobile menu and closes it after a navigation choice',()=>{
 render(<><SiteHeader/><main>Content</main><SiteFooter/></>);
 fireEvent.click(screen.getByRole('button',{name:'Open menu'}));expect(screen.getByRole('button',{name:'Close menu'})).toHaveAttribute('aria-expanded','true');
 fireEvent.click(screen.getByRole('button',{name:'Close menu'}));expect(screen.getByRole('button',{name:'Open menu'})).toHaveAttribute('aria-expanded','false');
 fireEvent.click(screen.getByRole('button',{name:'Open menu'}));
 fireEvent.click(screen.getAllByRole('link',{name:'Get started'})[1]!);expect(screen.getByRole('button',{name:'Open menu'})).toHaveAttribute('aria-expanded','false');
 for(const link of screen.getAllByRole('link',{name:'PitchPlease home'}))expect(link).toHaveAttribute('href','/');
});
