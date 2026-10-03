import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mic, Video, Square } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import { CtaLink } from "@/components/site/CtaLink";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Practice out loud — Presentation Coach" },
      { name: "description", content: "Turn on your camera and microphone to rehearse your presentation." },
      { property: "og:title", content: "Practice out loud — Presentation Coach" },
      { property: "og:description", content: "Rehearse your presentation with your camera and microphone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PracticePage,
});

function PracticePage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  async function start() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Your browser doesn't support camera and microphone access.");
      return;
    }
    setStarting(true);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(s);
    } catch (e) {
      const name = (e as DOMException).name;
      setError(
        name === "NotAllowedError"
          ? "Camera or microphone permission was denied. Allow access in your browser settings and try again."
          : name === "NotFoundError"
            ? "No camera or microphone was found."
            : "Could not start your camera and microphone.",
      );
    } finally {
      setStarting(false);
    }
  }

  function stop() {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="text-4xl font-semibold">Rehearse out loud</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Turn on your camera and microphone to practice. We only ask for access when you press start.
        </p>

        <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
          <div className="relative aspect-video bg-muted">
            <video ref={videoRef} autoPlay playsInline muted className={`h-full w-full object-cover ${stream ? "" : "hidden"}`} />
            {!stream && (
              <div className="absolute inset-0 grid place-items-center text-muted-foreground">
                <div className="flex gap-3"><Video className="size-8" aria-hidden /><Mic className="size-8" aria-hidden /></div>
              </div>
            )}
            {stream && (
              <span className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-destructive px-3 py-1 text-sm font-semibold text-destructive-foreground">
                <span className="size-2 animate-pulse rounded-full bg-destructive-foreground" /> Live
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 p-5">
            {stream ? (
              <button onClick={stop} className="flex h-12 items-center gap-2 rounded-full bg-destructive px-6 font-semibold text-destructive-foreground">
                <Square className="size-4" /> Stop
              </button>
            ) : (
              <button onClick={start} disabled={starting} className="flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground disabled:opacity-60">
                <Mic className="size-4" /> {starting ? "Starting…" : "Start camera & mic"}
              </button>
            )}
            <p className="text-sm text-muted-foreground">Sending your rehearsal for analysis is coming soon.</p>
          </div>
          {error && <p role="alert" className="px-5 pb-5 text-sm font-medium text-destructive">{error}</p>}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <CtaLink to="/results">See sample report</CtaLink>
          <CtaLink to="/prepare" variant="outline">Edit brief</CtaLink>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
