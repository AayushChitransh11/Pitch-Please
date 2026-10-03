import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Gauge, ListChecks, MessageSquare, Mic, Network, Timer, Users } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import { CtaLink, SectionHeading } from "@/components/site/CtaLink";
import { ProductPreview } from "@/components/site/ProductPreview";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Presentation Coach — Prepare your message. Practice your delivery." },
      { name: "description", content: "Turn ideas into a clear presentation, rehearse aloud, and see what to improve before you present." },
      { property: "og:title", content: "Presentation Coach — Prepare and practice presentations" },
      { property: "og:description", content: "An AI coach that helps students outline presentations and rehearse their delivery." },
    ],
  }),
  component: Index,
});

const steps = [
  { title: "Give us the context", text: "Share your topic, audience, goal and time limit." },
  { title: "Shape it and say it", text: "Refine your outline with the chatbot, then record a rehearsal." },
  { title: "Improve your next attempt", text: "Review what worked, what was missing and what to change." },
];

const categories = [
  { icon: Timer, title: "Timing", text: "See how your rehearsal compares with your time limit." },
  { icon: Gauge, title: "Speaking pace", text: "See your average words per minute." },
  { icon: ListChecks, title: "Content coverage", text: "Check whether you addressed your required points." },
  { icon: Network, title: "Organization", text: "Review your opening, progression and conclusion." },
  { icon: Users, title: "Audience clarity", text: "Find explanations that need more context." },
];

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:py-24 lg:grid-cols-2">
          <div className="rise">
            <p className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-sm font-semibold text-primary">Your presentation practice partner</p>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] sm:text-6xl">Prepare your message. <span className="text-primary">Practice your delivery.</span></h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">Turn your ideas into a clear presentation, rehearse aloud, and discover what to improve before you step in front of an audience.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaLink to="/prepare">Prepare my presentation <ArrowRight className="h-4 w-4" aria-hidden /></CtaLink>
              <CtaLink to="/practice" variant="outline"><Mic className="h-4 w-4" aria-hidden />Practice now</CtaLink>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">Start with an idea, an outline, or a presentation you already have.</p>
          </div>
          <div className="rise [animation-delay:150ms]"><ProductPreview /></div>
        </section>

        <section aria-labelledby="ways" className="mx-auto max-w-6xl px-5 py-12">
          <h2 id="ways" className="sr-only">Two ways to prepare</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { icon: MessageSquare, title: "Build your presentation", text: "Work through your topic, audience and goals with an AI coach. Shape your ideas into an outline you can review and edit.", to: "/prepare" as const, cta: "Start preparing" },
              { icon: Mic, title: "Rehearse out loud", text: "Record a practice run and review your timing, speaking pace, content coverage and suggestions for clearer explanations.", to: "/practice" as const, cta: "Start practicing" },
            ].map((c) => (
              <article key={c.title} className="flex flex-col rounded-3xl border border-border bg-card p-8 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground"><c.icon className="h-6 w-6" aria-hidden /></span>
                <h3 className="mt-6 text-2xl font-semibold">{c.title}</h3>
                <p className="mt-3 flex-1 text-muted-foreground">{c.text}</p>
                <CtaLink to={c.to} className="mt-6 self-start">{c.cta} <ArrowRight className="h-4 w-4" aria-hidden /></CtaLink>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
          <SectionHeading eyebrow="How it works" title="Three steps to a stronger presentation" />
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-3xl border border-border p-7">
                <span className="font-display text-5xl font-semibold text-primary">{i + 1}</span>
                <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="what-youll-learn" className="scroll-mt-20 border-y border-border bg-secondary/60">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <SectionHeading eyebrow="What you’ll learn" title="Feedback you can act on" intro="Timing and pace are calculated from your recording. Content and clarity feedback are AI-generated suggestions supported by your transcript." />
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {categories.map((c) => (
                <li key={c.title} className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary">
                  <c.icon className="h-6 w-6 text-primary" aria-hidden />
                  <h3 className="mt-4 font-sans text-base font-bold tracking-normal">{c.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{c.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-24 text-center">
          <h2 className="text-4xl font-semibold sm:text-5xl">Make your next rehearsal count.</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">Know what you want to say—and what to improve when you say it.</p>
          <CtaLink to="/prepare" className="mt-8">Prepare my presentation <ArrowRight className="h-4 w-4" aria-hidden /></CtaLink>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
