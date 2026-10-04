import { useState } from "react";
import { AlertCircle, CheckCircle2, CircleDashed, Gauge, Lightbulb, MessageSquare, Mic, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { sampleConversation, sampleResults, type CoverageStatus } from "@/lib/sample-data";

const statusMeta: Record<CoverageStatus, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  covered: { label: "Covered", icon: CheckCircle2, cls: "text-success" },
  partial: { label: "Partial", icon: CircleDashed, cls: "text-warning" },
  missing: { label: "Missing", icon: AlertCircle, cls: "text-destructive" },
};

export function ProductPreview() {
  const [tab, setTab] = useState<"prepare" | "results">("prepare");
  const tabs = [
    { id: "prepare" as const, label: "Prepare", icon: MessageSquare },
    { id: "results" as const, label: "Practice results", icon: Mic },
  ];

  return (
    <div className="sticker rounded-[2rem] bg-card p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">Example preview</span>
        <div role="tablist" aria-label="Preview" className="flex rounded-full bg-muted p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition sm:text-sm",
                tab === t.id ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <t.icon className="h-4 w-4" aria-hidden />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "prepare" ? (
        <div role="tabpanel" id="panel-prepare" aria-labelledby="tab-prepare" className="space-y-3 rise">
          {sampleConversation.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "student" && "justify-end")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  m.role === "coach" ? "rounded-tl-sm bg-accent text-accent-foreground" : "rounded-tr-sm bg-primary text-primary-foreground",
                )}
              >
                <p className="mb-1 font-display text-xs font-semibold opacity-80">{m.role === "coach" ? "Coach" : "Student"}</p>
                {m.text}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div role="tabpanel" id="panel-results" aria-labelledby="tab-results" className="space-y-4 rise">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><Timer className="h-4 w-4" aria-hidden />Duration</p>
              <p className="mt-1 text-2xl font-bold">{sampleResults.duration}<span className="text-base font-medium text-muted-foreground"> / {sampleResults.limit}</span></p>
              <div className="mt-2 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${sampleResults.durationRatio * 100}%` }} /></div>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><Gauge className="h-4 w-4" aria-hidden />Speaking pace</p>
              <p className="mt-1 text-2xl font-bold">{sampleResults.wpm}<span className="text-base font-medium text-muted-foreground"> words/min</span></p>
            </div>
          </div>
          <div className="rounded-2xl border border-border p-4">
            <p className="text-xs font-semibold text-muted-foreground">Content checklist</p>
            <ul className="mt-2 divide-y divide-border">
              {sampleResults.checklist.map((c) => {
                const s = statusMeta[c.status];
                return (
                  <li key={c.point} className="flex items-center justify-between py-2 text-sm">
                    <span className="font-medium">{c.point}</span>
                    <span className={cn("flex items-center gap-1.5 font-semibold", s.cls)}><s.icon className="h-4 w-4" aria-hidden />{s.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex gap-3 rounded-2xl bg-accent p-4 text-sm text-accent-foreground">
            <Lightbulb className="h-5 w-5 shrink-0" aria-hidden />
            <p><span className="font-bold">Suggested next step: </span>{sampleResults.nextStep}</p>
          </div>
        </div>
      )}
    </div>
  );
}