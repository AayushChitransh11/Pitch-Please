import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, FileText, MessageCircle, X } from "lucide-react";
import { toast } from "sonner";

import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import { createSession, type PresentationBrief } from "@/lib/api";

export const Route = createFileRoute("/prepare")({
  head: () => ({
    meta: [
      { title: "Prepare your presentation — Presentation Coach" },
      {
        name: "description",
        content: "Build your presentation brief: topic, audience, purpose, time limit, key points and notes.",
      },
      { property: "og:title", content: "Prepare your presentation — Presentation Coach" },
      { property: "og:description", content: "Build your presentation brief before you rehearse." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PreparePage,
});

const BRIEF_KEY = "pc-brief-v1";
const field =
  "mt-2 w-full rounded-xl border border-input bg-card px-4 py-3 text-base focus-visible:border-primary";

function PreparePage() {
  const navigate = useNavigate();
  const [brief, setBrief] = useState<PresentationBrief>({
    topic: "",
    audience: "",
    purpose: "",
    targetSeconds: 180,
    requiredPoints: [],
  });
  const [pointsText, setPointsText] = useState("");
  const [notesFile, setNotesFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(BRIEF_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PresentationBrief;
        setBrief((b) => ({ ...b, ...parsed }));
        setPointsText((parsed.requiredPoints ?? []).join("\n"));
      }
    } catch {
      // ignore
    }
  }, []);

  function updateBrief(patch: Partial<PresentationBrief>) {
    setBrief((b) => ({ ...b, ...patch }));
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please attach a PDF file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("PDF must be 10 MB or smaller.");
      return;
    }
    setNotesFile(file);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const finalBrief: PresentationBrief = {
        ...brief,
        requiredPoints: pointsText.split("\n").map((p) => p.trim()).filter(Boolean),
        ...(notesFile ? { draftText: `Attached: ${notesFile.name}` } : {}),
      };
      const { sessionId } = await createSession(finalBrief);
      window.localStorage.setItem(BRIEF_KEY, JSON.stringify(finalBrief));
      window.localStorage.setItem("pc-session-id", sessionId);
      toast.success("Brief saved. Time to rehearse!");
      navigate({ to: "/practice" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="text-4xl font-semibold">Prepare your presentation</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          Fill in what you know, attach your notes, then save and head to practice.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <form onSubmit={save} className="space-y-5 self-start rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
            <h2 className="text-xl font-semibold">Your context</h2>
            <label className="block font-semibold">
              Topic
              <input value={brief.topic} onChange={(e) => updateBrief({ topic: e.target.value })} className={field} placeholder="e.g. Campus events app" />
            </label>
            <label className="block font-semibold">
              Audience
              <input value={brief.audience} onChange={(e) => updateBrief({ audience: e.target.value })} className={field} placeholder="e.g. Hackathon judges" />
            </label>
            <label className="block font-semibold">
              Purpose
              <input value={brief.purpose} onChange={(e) => updateBrief({ purpose: e.target.value })} className={field} placeholder="What should they remember?" />
            </label>
            <label className="block font-semibold">
              Target duration (seconds)
              <input type="number" min={30} max={7200} value={brief.targetSeconds} onChange={(e) => updateBrief({ targetSeconds: Number(e.target.value) })} className={field} />
            </label>
            <label className="block font-semibold">
              Required points <span className="font-normal text-muted-foreground">(one per line)</span>
              <textarea value={pointsText} onChange={(e) => setPointsText(e.target.value)} rows={4} className={field} placeholder={"The problem students face\nHow our application solves it\nA working demonstration"} />
            </label>

            <div>
              <p className="font-semibold">
                Draft or notes <span className="font-normal text-muted-foreground">(optional PDF)</span>
              </p>
              {notesFile ? (
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
                  <FileText className="size-5 text-primary" aria-hidden />
                  <span className="flex-1 truncate text-sm font-medium">{notesFile.name}</span>
                  <button type="button" onClick={() => setNotesFile(null)} aria-label="Remove PDF" className="rounded-full p-1 text-muted-foreground hover:text-foreground">
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <label className="mt-2 flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-dashed border-input bg-background px-4 py-6 text-center transition hover:border-primary">
                  <FileText className="size-6 text-muted-foreground" aria-hidden />
                  <span className="text-sm font-medium">Attach a PDF</span>
                  <span className="text-xs text-muted-foreground">Up to 10 MB</span>
                  <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
                </label>
              )}
            </div>

            <button type="submit" disabled={saving} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground transition hover:shadow-lift disabled:opacity-60">
              {saving ? "Saving…" : "Save brief & continue to practice"}
              <ArrowRight className="size-4" />
            </button>
          </form>

          <section className="flex min-h-[28rem] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card p-8 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
              <MessageCircle className="size-7" aria-hidden />
            </span>
            <h2 className="mt-5 text-xl font-semibold">Coach chat</h2>
            <p className="mt-2 max-w-sm text-muted-foreground">
              A real-time coaching conversation will appear here. Coming soon.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
