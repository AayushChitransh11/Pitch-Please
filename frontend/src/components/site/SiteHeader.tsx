import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkle } from "@/components/site/Decor";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#what-youll-learn", label: "What you’ll learn" },
];

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const light = tone === "light";

  return (
    <Link
      to="/"
      aria-label="PitchPlease home"
      className="group flex items-center rounded-lg"
    >
      <span className="font-display text-xl font-semibold leading-none tracking-tight">
        <span className={light ? "text-cream" : "text-foreground"}>
          Pitch
        </span>
        <span className={light ? "text-gold" : "text-gold-deep"}>
          Please
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader({ overHero = false }: { overHero?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Transparent with light text only while sitting on top of the dark hero.
  const solid = !overHero || scrolled || open;

  const skip = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const main = document.querySelector("main");
    if (!main) return;
    main.setAttribute("tabindex", "-1");
    main.focus();
    main.scrollIntoView();
  };

  return (
    <>
      <a href="#main" onClick={skip} className="skip-link">
        Skip to content
      </a>
      <header
        className={cn(
          !solid && "on-dark",
          "sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300 ease-out",
          overHero && "-mb-16",
          solid
            ? "border-border/70 bg-background/80 shadow-soft backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <nav
          aria-label="Main"
          className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5"
        >
          <Logo tone={solid ? "dark" : "light"} />
          <div className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={cn(
                  "group relative rounded text-sm font-medium transition-colors duration-200",
                  solid
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-cream/80 hover:text-cream",
                )}
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </a>
            ))}
            <Link
              to="/prepare"
              className={cn(
                "inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 active:scale-[0.98]",
                solid
                  ? "bg-gradient-to-br from-violet to-primary text-primary-foreground hover:shadow-lift"
                  : "bg-gradient-to-br from-gold to-[oklch(0.78_0.11_75)] text-night hover:shadow-glow",
              )}
            >
              Get started
            </Link>
          </div>
          <button
            type="button"
            className={cn(
              "grid h-11 w-11 place-items-center rounded-xl border transition-colors md:hidden",
              solid ? "border-border text-foreground" : "border-white/25 text-cream",
            )}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
        <div
          id="mobile-nav"
          inert={!open}
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out md:hidden",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <ul className="flex flex-col gap-1 border-t border-border px-5 pb-5 pt-3">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-3 font-medium text-foreground hover:bg-accent"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  to="/prepare"
                  onClick={() => setOpen(false)}
                  className="flex h-12 items-center justify-center rounded-full bg-gradient-to-br from-violet to-primary font-semibold text-primary-foreground"
                >
                  Get started
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="on-dark relative isolate overflow-hidden bg-night text-cream">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_50%_0%,oklch(0.84_0.1_85/0.16),transparent_70%),radial-gradient(40%_50%_at_90%_100%,oklch(0.5_0.2_300/0.35),transparent_70%)]"
      />
      <Sparkle size={12} className="absolute left-[12%] top-6" delay={0.5} />
      <Sparkle size={9} className="absolute right-[18%] top-10" delay={1.6} />
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-5 pb-6 pt-12 sm:flex-row sm:items-center">
        <Logo tone="light" />
        <p className="text-sm text-cream/80">Prepare. Practice. Improve.</p>
      </div>
      <p
        aria-hidden
        className="pointer-events-none select-none whitespace-nowrap bg-gradient-to-b from-cream/30 to-transparent bg-clip-text text-center font-display text-[clamp(4rem,19vw,18rem)] font-semibold leading-[0.8] tracking-tighter text-transparent [transform:translateY(22%)]"
      >
        PitchPlease
      </p>
    </footer>
  );
}