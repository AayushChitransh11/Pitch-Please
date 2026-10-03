import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, MessageSquare, X } from "lucide-react";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#what-youll-learn", label: "What you’ll learn" },
];

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-lg font-semibold text-foreground">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
        <MessageSquare className="h-5 w-5" aria-hidden />
      </span>
      <span className="text-lg">Presentation Coach</span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="rounded text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
          <Link to="/prepare" className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-lift">
            Get started
          </Link>
        </div>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-xl border border-border md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {open && (
        <div id="mobile-nav" className="border-t border-border px-5 pb-5 md:hidden">
          <ul className="flex flex-col gap-1 pt-3">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 font-medium hover:bg-muted">
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <Link to="/prepare" onClick={() => setOpen(false)} className="flex h-12 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                Get started
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-5 py-8 sm:flex-row sm:items-center">
        <Logo />
        <p className="text-sm text-muted-foreground">Prepare. Practice. Improve.</p>
      </div>
    </footer>
  );
}
