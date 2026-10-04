import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Gauge,
  ListChecks,
  MessageSquare,
  Mic,
  Network,
  Star,
  Timer,
  Users,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import { CtaLink, SectionHeading } from "@/components/site/CtaLink";
import { ProductPreview } from "@/components/site/ProductPreview";
import {
  Hills,
  Marquee,
  MotionToggle,
  Reveal,
  ScrollProgress,
  Sparkle,
  SpotlightCard,
  StageBackdrop,
  TiltIn,
  Words,
} from "@/components/site/Decor";
import { IconTile } from "@/components/site/Decor";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Presentation Coach — Prepare your presentation. Practice your delivery." },
      {
        name: "description",
        content:
          "Turn ideas into a clear presentation, rehearse aloud, and see what to improve before you present.",
      },
      { property: "og:title", content: "Presentation Coach — Prepare and practice presentations" },
      {
        property: "og:description",
        content:
          "An AI coach that helps students outline presentations and rehearse their delivery.",
      },
    ],
  }),
  component: Index,
});

const steps = [
  { title: "Give us the context", text: "Share your topic, audience, goal and time limit." },
  {
    title: "Shape it and say it",
    text: "Refine your outline with the chatbot, then record a rehearsal.",
  },
  {
    title: "Improve your next attempt",
    text: "Review what worked, what was missing and what to change.",
  },
];

const stepSurface = [
  "from-[oklch(0.36_0.16_295)] to-[oklch(0.26_0.12_300)]",
  "from-[oklch(0.42_0.17_320)] to-[oklch(0.3_0.13_310)]",
  "from-[oklch(0.46_0.15_345)] to-[oklch(0.32_0.13_325)]",
];

const bentoSpan = [
  "sm:col-span-2 lg:col-span-4",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "sm:col-span-2 lg:col-span-2",
];

const categories = [
  { icon: Timer, title: "Timing", text: "See how your rehearsal compares with your time limit." },
  { icon: Gauge, title: "Speaking pace", text: "See your average words per minute." },
  {
    icon: ListChecks,
    title: "Content coverage",
    text: "Check whether you addressed your required points.",
  },
  {
    icon: Network,
    title: "Organization",
    text: "Review your opening, progression and conclusion.",
  },
  { icon: Users, title: "Audience clarity", text: "Find explanations that need more context." },
];

function Index() {
  return (
    <div className="min-h-screen overflow-x-clip">
      <ScrollProgress />
      <MotionToggle />
      <SiteHeader overHero />
      <main id="main">
        {/* HERO */}
        <section className="on-dark relative isolate overflow-hidden bg-stage pt-16 grain">
          <StageBackdrop />
          <div className="relative z-10 mx-auto max-w-6xl px-5 pb-52 pt-20 text-center md:pb-72 md:pt-28">
            <p className="glass rise inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-cream">
              <Sparkle size={12} />
              Your presentation practice partner
            </p>
            <h1 className="mx-auto mt-8 max-w-5xl text-[clamp(2.75rem,9vw,8rem)] font-medium leading-[0.95] tracking-tight text-cream">
              <Words text="Prepare your presentation." delay={0.15} />
              <br />
              <Words
                text="Practice your delivery."
                delay={0.55}
                className="text-gold-gradient italic"
              />
            </h1>
            <p className="rise mx-auto mt-8 max-w-2xl text-lg text-cream/85 [animation-delay:900ms] md:text-xl">
              Turn your ideas into a clear presentation, rehearse aloud, and discover what to
              improve before you step in front of an audience.
            </p>
            <div className="rise mt-10 flex flex-col items-center justify-center gap-3 [animation-delay:1050ms] sm:flex-row">
              <CtaLink to="/prepare" variant="gold">
                Prepare my presentation <ArrowRight className="h-4 w-4" aria-hidden />
              </CtaLink>
              <CtaLink to="/practice" variant="glass">
                <Mic className="h-4 w-4" aria-hidden />
                Practice now
              </CtaLink>
            </div>
            <p className="rise mt-6 text-sm text-cream/75 [animation-delay:1200ms]">
              Start with an idea, an outline, or a presentation you already have.
            </p>
            {/* floating glass charms */}
            <span
              aria-hidden
              className="glass float-slow absolute left-[4%] top-[48%] hidden h-14 w-14 place-items-center rounded-2xl text-gold lg:grid"
            >
              <Mic className="h-6 w-6" />
            </span>
            <span
              aria-hidden
              className="glass float-slower absolute right-[5%] top-[56%] hidden h-14 w-14 place-items-center rounded-2xl text-gold lg:grid"
            >
              <Star className="h-6 w-6" />
            </span>
          </div>
          <Hills />
        </section>

        {/* PRODUCT, sitting on the hill */}
        <div className="relative z-10 mx-auto -mt-44 max-w-5xl px-5 md:-mt-64">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[10%] -top-10 bottom-10 -z-10 rounded-[3rem] bg-[radial-gradient(60%_60%_at_50%_30%,oklch(0.84_0.1_85/0.45),transparent_70%)] blur-2xl"
          />
          <TiltIn>
            <div className="rounded-[1.75rem] bg-gradient-to-br from-gold/80 via-lilac/60 to-primary/30 p-px shadow-glow">
              <ProductPreview />
            </div>
          </TiltIn>
        </div>

        {/* TWO WAYS */}
        <section aria-labelledby="ways" className="mx-auto max-w-6xl px-5 py-28">
          <h2 id="ways" className="sr-only">
            Two ways to prepare
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <Reveal className="h-full">
              <article className="on-dark group relative isolate flex h-full min-h-[26rem] flex-col overflow-hidden rounded-[2rem] bg-stage p-8 text-cream shadow-lift grain transition duration-500 ease-out hover:-translate-y-2 hover:rotate-0 md:-rotate-1 md:p-12">
                <MessageSquare
                  aria-hidden
                  className="absolute -bottom-10 -right-10 -z-10 h-64 w-64 rotate-12 text-white/10 transition duration-700 group-hover:rotate-6 group-hover:scale-110"
                  strokeWidth={1}
                />
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-gold ring-1 ring-white/20">
                  <MessageSquare className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-8 text-4xl font-medium leading-tight md:text-5xl">
                  Build your presentation
                </h3>
                <p className="mt-4 max-w-md flex-1 text-lg text-cream/85">
                  Work through your topic, audience and goals with an AI coach. Shape your ideas
                  into an outline you can review and edit.
                </p>
                <CtaLink to="/prepare" variant="gold" className="mt-8 self-start">
                  Start preparing <ArrowRight className="h-4 w-4" aria-hidden />
                </CtaLink>
              </article>
            </Reveal>
            <Reveal delay={0.15} className="h-full md:pt-14">
              <article className="group relative isolate flex h-full min-h-[26rem] flex-col overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-blush/70 via-lilac/60 to-cream p-8 shadow-lift transition duration-500 ease-out hover:-translate-y-2 hover:rotate-0 md:rotate-1 md:p-12">
                <Mic
                  aria-hidden
                  className="absolute -bottom-10 -right-10 -z-10 h-64 w-64 -rotate-12 text-primary/10 transition duration-700 group-hover:-rotate-6 group-hover:scale-110"
                  strokeWidth={1}
                />
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-night text-gold ring-1 ring-gold/40">
                  <Mic className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-8 text-4xl font-medium leading-tight md:text-5xl">
                  Rehearse out loud
                </h3>
                <p className="mt-4 max-w-md flex-1 text-lg text-foreground/80">
                  Record a practice run and review your timing, speaking pace, content coverage and
                  suggestions for clearer explanations.
                </p>
                <CtaLink to="/practice" className="mt-8 self-start">
                  Start practicing <ArrowRight className="h-4 w-4" aria-hidden />
                </CtaLink>
              </article>
            </Reveal>
          </div>
        </section>

        {/* RIBBON */}
        <div className="overflow-hidden py-10">
          <div className="-rotate-2 scale-105 bg-gold py-4 font-display text-4xl font-medium italic text-night shadow-glow md:text-6xl">
            <Marquee
              items={[
                "Prepare",
                "Practice",
                "Improve",
                "Timing",
                "Speaking pace",
                "Content coverage",
                "Organization",
                "Audience clarity",
              ]}
            />
          </div>
        </div>

        {/* HOW IT WORKS: cards stack as you scroll */}
        <section
          id="how-it-works"
          className="on-dark relative isolate mx-2 mt-16 scroll-mt-20 rounded-[2.5rem] text-cream md:mx-4 md:rounded-[4rem]"
        >
          <div
            aria-hidden
            className="aurora grain absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
          />
          <div className="mx-auto max-w-5xl px-5 pb-8 pt-24 md:pt-32">
            <Reveal>
              <SectionHeading
                eyebrow="How it works"
                title="Three steps to a stronger presentation"
                tone="light"
              />
            </Reveal>
            <ol className="mt-16 pb-12">
              {steps.map((s, i) => (
                <li key={s.title} className="sticky mb-10" style={{ top: `${5.5 + i * 1.5}rem` }}>
                  <div
                    className={cn(
                      "flex min-h-[16rem] flex-col justify-between gap-6 rounded-[2rem] border border-white/15 bg-gradient-to-br p-8 shadow-lift md:min-h-[21rem] md:flex-row md:items-end md:p-12",
                      stepSurface[i],
                      i % 2 ? "md:rotate-1" : "md:-rotate-1",
                    )}
                  >
                    <span
                      aria-hidden
                      className="num-outline font-display text-[clamp(6rem,17vw,13rem)] font-semibold leading-[0.8]"
                    >
                      {i + 1}
                    </span>
                    <div className="max-w-md">
                      <h3 className="text-3xl font-medium md:text-4xl">{s.title}</h3>
                      <p className="mt-3 text-lg text-cream/85">{s.text}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* WHAT YOU'LL LEARN: bento */}
        <section
          id="what-youll-learn"
          className="scroll-mt-20 bg-gradient-to-b from-background via-secondary to-background"
        >
          <div className="mx-auto max-w-6xl px-5 py-28">
            <Reveal>
              <SectionHeading
                eyebrow="What you’ll learn"
                title="Feedback you can act on"
                intro="Timing and pace are calculated from your recording. Content and clarity feedback are AI-generated suggestions supported by your transcript."
              />
            </Reveal>
            <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {categories.map((c, i) => {
                const featured = i === 0;
                return (
                  <Reveal
                    as="li"
                    key={c.title}
                    delay={i * 0.08}
                    className={cn("h-full", bentoSpan[i])}
                  >
                    <SpotlightCard
                      className={cn(
                        "group h-full rounded-[1.75rem] border p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lift md:p-8",
                        featured
                          ? "on-dark min-h-[16rem] border-white/15 bg-gradient-to-br from-[oklch(0.4_0.18_295)] to-[oklch(0.26_0.12_300)] text-cream"
                          : "border-border bg-card",
                      )}
                    >
                      <c.icon
                        aria-hidden
                        strokeWidth={1}
                        className={cn(
                          "absolute -bottom-6 -right-4 -z-10 h-40 w-40 rotate-12 transition duration-700 group-hover:rotate-0",
                          featured ? "text-white/10" : "text-primary/10",
                        )}
                      />
                      {featured ? (
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-gold ring-1 ring-white/20">
                          <c.icon className="h-5 w-5" aria-hidden />
                        </span>
                      ) : (
                        <IconTile>
                          <c.icon className="h-5 w-5" aria-hidden />
                        </IconTile>
                      )}
                      <h3 className={cn("mt-6 font-medium", featured ? "text-4xl" : "text-2xl")}>
                        {c.title}
                      </h3>
                      <p
                        className={cn(
                          "mt-2 max-w-sm",
                          featured ? "text-lg text-cream/85" : "text-muted-foreground",
                        )}
                      >
                        {c.text}
                      </p>
                    </SpotlightCard>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </section>

        {/* CLOSER */}
        <section className="relative isolate overflow-hidden px-5 py-36 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_60%_at_50%_30%,oklch(0.9_0.08_85/0.5),transparent_70%),radial-gradient(40%_50%_at_10%_90%,oklch(0.86_0.06_305/0.5),transparent_70%),radial-gradient(40%_50%_at_90%_90%,oklch(0.88_0.06_10/0.5),transparent_70%)]"
          />
          <div
            aria-hidden
            className="orbit pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[min(120vw,56rem)] w-[min(120vw,56rem)] -translate-x-1/2 -translate-y-1/2"
          />
          <Sparkle
            size={18}
            className="absolute left-[14%] top-[28%] !text-gold-deep"
            delay={0.6}
          />
          <Sparkle
            size={14}
            className="absolute right-[16%] top-[40%] !text-gold-deep"
            delay={1.8}
          />
          <Reveal>
            <h2 className="mx-auto max-w-5xl text-[clamp(2.5rem,8vw,7rem)] font-medium leading-[0.98]">
              Make your next rehearsal count.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
              Know what you want to say—and what to improve when you say it.
            </p>
            <CtaLink to="/prepare" className="mt-10">
              Prepare my presentation <ArrowRight className="h-4 w-4" aria-hidden />
            </CtaLink>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}