import { FeedbackDetails } from '@/components/FeedbackDetails';
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, CircleDashed, CircleHelp, Mic, XCircle } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import {
  getResults,
  type CoverageStatus,
  type PracticeResults,
} from "@/lib/api";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Rehearsal results — Presentation Coach" },
      {
        name: "description",
        content:
          "See what happened in your rehearsal: timing, pace, content coverage and the next thing to improve.",
      },
      { property: "og:title", content: "Rehearsal results — Presentation Coach" },
      {
        property: "og:description",
        content: "Measured results, content checklist and your next action.",
      },
    ],
  }),
  component: ResultsPage,
});

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const statusMeta: Record<
  CoverageStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  covered: { label: "Covered", icon: CheckCircle2, className: "text-success" },
  partial: { label: "Partial", icon: CircleDashed, className: "text-amber-500" },
  missing: { label: "Missing", icon: XCircle, className: "text-destructive" },
  uncertain: { label: "Uncertain", icon: CircleHelp, className: "text-muted-foreground" },
};

function ResultsPage() {
  const [results, setResults] = useState<PracticeResults | null>(null);

  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    getResults().then(r => { if (active) setResults(r); })
      .catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, []);

  const topImprovement = results?.improvements.find((i) => i.priority === 1);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-12">
        <p className="text-sm font-medium text-muted-foreground">Your rehearsal analysis</p>
        <h1 className="mt-1 text-4xl font-semibold">What happened, and what to change next</h1>

        {error ? <p role="alert" className="mt-10 text-destructive">{error} <Link to="/prepare">Return to preparation</Link></p> : !results ? (
          <p className="mt-10 text-muted-foreground">Loading results…</p>
        ) : (
          <div className="mt-10 space-y-6">
            {/* Measured results */}
            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
              <h2 className="text-xl font-semibold">Measured results</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {fmt(results.measurements.durationSeconds)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Target</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {fmt(results.measurements.targetSeconds)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Words</p>
                  <p className="mt-1 text-2xl font-semibold">{results.measurements.wordCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pace</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {results.measurements.wordsPerMinute}{" "}
                    <span className="text-base font-normal text-muted-foreground">words/min</span>
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {fmt(Math.abs(results.measurements.targetSeconds - results.measurements.durationSeconds))}{" "}
                {results.measurements.durationSeconds > results.measurements.targetSeconds ? "over your target." : "remaining of your target."} Pace is an average across the whole recording, including
                pauses.
              </p>
            </section>

            <FeedbackDetails results={results} />
            {/* Content checklist */}
            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
              <h2 className="text-xl font-semibold">Content checklist</h2>
              <ul className="mt-4 space-y-3">
                {results.coverage.map((c) => {
                  const meta = statusMeta[c.status];
                  const Icon = meta.icon;
                  return (
                    <li key={c.point} className="flex items-start gap-3">
                      <Icon className={`mt-0.5 size-5 shrink-0 ${meta.className}`} />
                      <div>
                        <p className="font-medium">
                          {c.point}{" "}
                          <span className="text-sm font-normal text-muted-foreground">
                            · {meta.label}
                          </span>
                        </p>
                        {c.evidence ? (
                          <p className="mt-0.5 text-sm text-muted-foreground">“{c.evidence}”</p>
                        ) : (
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            Not found in the transcript.
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* What worked */}
            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
              <h2 className="text-xl font-semibold">What worked</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
                {results.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>

            {/* Highest priority + next action */}
            {topImprovement && (
              <section className="rounded-3xl border border-primary/40 bg-primary/5 p-6 shadow-soft sm:p-8">
                <h2 className="text-xl font-semibold">Highest priority</h2>
                <p className="mt-2">{topImprovement.observation}</p>
                <p className="mt-3 text-sm font-medium text-muted-foreground">Next action</p>
                <p className="mt-1 font-medium">{topImprovement.suggestion}</p>
              </section>
            )}

            {results.improvements.filter((i) => i.priority !== 1).length > 0 && (
              <section className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
                <h2 className="text-xl font-semibold">Also worth fixing</h2>
                <ul className="mt-4 space-y-3">
                  {results.improvements
                    .filter((i) => i.priority !== 1)
                    .map((i) => (
                      <li key={i.observation}>
                        <p className="font-medium">{i.observation}</p>
                        <p className="text-sm text-muted-foreground">{i.suggestion}</p>
                      </li>
                    ))}
                </ul>
              </section>
            )}


            {!!results.grammar?.length && <section className="rounded-3xl border p-6"><h2 className="text-xl font-semibold">Language suggestions</h2>{results.grammar.map((g, i) => <p key={i} className="mt-3">“{g.original}” → “{g.suggested}” — {g.explanation}</p>)}</section>}
            {/* Transcript */}
            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
              <h2 className="text-xl font-semibold">Transcript</h2>
              <p className="mt-4 whitespace-pre-line text-muted-foreground">{results.transcript}</p>
            </section>

            {/* Controls */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/practice"
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground transition hover:shadow-lift"
              >
                <Mic className="size-4" /> Practice again
              </Link>
              <Link
                to="/prepare"
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-border font-semibold transition hover:border-primary"
              >
                <ArrowLeft className="size-4" /> Edit presentation brief
              </Link>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
