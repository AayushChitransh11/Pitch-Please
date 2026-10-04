import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { Pause, Play, Sparkle as SparkleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type RevealTag = "div" | "li" | "article" | "section";

/** Scroll reveal: fade + rise + blur-to-sharp. Plain element when reduced motion is on. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: RevealTag;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}

/** Headline that slides up word by word out of a mask. Text stays real text for screen readers. */
export function Words({
  text,
  delay = 0,
  className,
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={i}>
          <span className="inline-block overflow-hidden pb-[0.18em] pr-[0.1em] -mb-[0.18em] -mr-[0.1em] align-bottom">
            <motion.span
              className={cn("inline-block", className)}
              initial={reduce ? false : { y: "115%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: delay + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
            </motion.span>
          </span>{" "}
        </span>
      ))}
    </>
  );
}

export function Sparkle({
  className,
  size = 14,
  delay = 0,
  style,
}: {
  className?: string;
  size?: number;
  delay?: number;
  style?: CSSProperties;
}) {
  return (
    <SparkleIcon
      aria-hidden
      fill="currentColor"
      strokeWidth={1.5}
      className={cn("twinkle text-gold", className)}
      style={{ width: size, height: size, animationDelay: `${delay}s`, ...style }}
    />
  );
}

/** Thin gold progress line across the top of the page. Decorative. */
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });
  if (reduce) return null;
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-violet via-blush to-gold"
    />
  );
}

/** Lets people stop all looping decoration (WCAG 2.2.2). Hidden when the OS asks for reduced motion. */
export function MotionToggle() {
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    document.documentElement.dataset["motion"] = paused ? "paused" : "play";
    return () => {
      delete document.documentElement.dataset["motion"];
    };
  }, [paused]);

  if (reduce) return null;
  return (
    <button
      type="button"
      aria-pressed={paused}
      onClick={() => setPaused((p) => !p)}
      className="on-dark fixed bottom-4 left-4 z-50 inline-flex h-11 items-center gap-2 rounded-full bg-night/90 px-4 text-sm font-semibold text-cream shadow-lift ring-1 ring-white/20 backdrop-blur transition hover:bg-night"
    >
      {paused ? (
        <Play className="h-4 w-4" aria-hidden />
      ) : (
        <Pause className="h-4 w-4" aria-hidden />
      )}
      Pause animations
    </button>
  );
}

// Fixed values so server and client render the same markup.
const stars: Array<[number, number, number, number]> = [
  [6, 14, 2, 0],
  [14, 52, 1.5, 1.2],
  [22, 30, 2, 2.1],
  [31, 62, 1.5, 0.6],
  [38, 12, 2, 1.7],
  [47, 44, 1.5, 2.6],
  [55, 22, 2, 0.9],
  [63, 58, 1.5, 1.9],
  [71, 10, 2, 0.3],
  [79, 46, 1.5, 2.3],
  [86, 28, 2, 1.1],
  [93, 54, 1.5, 0.5],
  [97, 16, 2, 2.8],
  [10, 66, 1.5, 1.5],
  [52, 70, 2, 0.2],
];

// left %, bottom %, size, duration, delay, drift x
const flies: Array<[number, number, number, number, number, number]> = [
  [8, 8, 4, 9, 0, 30],
  [18, 20, 3, 11, 2, -20],
  [27, 6, 4, 10, 4, 24],
  [36, 24, 3, 12, 1, -30],
  [45, 10, 4, 9, 5, 18],
  [54, 26, 3, 13, 3, -16],
  [63, 8, 4, 10, 6, 28],
  [72, 22, 3, 11, 0.5, -24],
  [81, 12, 4, 12, 2.5, 20],
  [90, 28, 3, 9, 4.5, -18],
  [14, 34, 3, 14, 7, 22],
  [76, 36, 4, 13, 1.5, -26],
];

/** Starfield, moon with turning rings, fireflies. Everything here is decorative. */
export function StageBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      <div className="spotlight absolute inset-0" />
      {/* moon */}
      <div className="absolute -right-[12%] -top-[8%] h-[min(80vw,640px)] w-[min(80vw,640px)]">
        <div className="orb absolute inset-0" />
        <div className="orbit absolute inset-[14%]" />
        <div className="orbit orbit-rev absolute inset-[2%]">
          <Sparkle
            size={16}
            className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
          />
        </div>
      </div>
      {stars.map(([x, y, s, d], i) => (
        <span
          key={i}
          className="twinkle absolute rounded-full bg-cream"
          style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDelay: `${d}s` }}
        />
      ))}
      <Sparkle size={18} className="absolute left-[8%] top-[24%]" delay={0.4} />
      <Sparkle size={12} className="absolute left-[46%] top-[10%]" delay={1.4} />
      <Sparkle size={20} className="absolute right-[26%] top-[34%]" delay={2.2} />
      {flies.map(([x, b, s, d, dl, dx], i) => (
        <span
          key={i}
          className="firefly"
          style={
            {
              left: `${x}%`,
              bottom: `${b}%`,
              width: s,
              height: s,
              "--d": `${d}s`,
              "--dl": `${dl}s`,
              "--dx": `${dx}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/**
 * Three hill layers that slide at different speeds as you scroll.
 * The front hill is the page background color, so the dark hero melts into the ivory page.
 */
export function Hills() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const back = useTransform(scrollY, [0, 800], [0, -30]);
  const mid = useTransform(scrollY, [0, 800], [0, -80]);
  const front = useTransform(scrollY, [0, 800], [0, -130]);
  const base = "absolute left-[-30%] w-[160%] rounded-[100%]";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%]">
      <motion.div
        {...(reduce ? {} : { style: { y: back } })}
        className={cn(base, "bottom-[-18%] h-[85%] bg-[oklch(0.34_0.13_315)]")}
      />
      <motion.div
        {...(reduce ? {} : { style: { y: mid } })}
        className={cn(
          base,
          "bottom-[-26%] h-[70%] bg-gradient-to-b from-[oklch(0.5_0.14_330)] to-[oklch(0.62_0.1_345)]",
        )}
      />
      <motion.div
        {...(reduce ? {} : { style: { y: front } })}
        className={cn(base, "bottom-[-32%] h-[60%] bg-background")}
      />
    </div>
  );
}

/** Tips a block up from a slight angle as it scrolls into view. */
export function TiltIn({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.35"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [16, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  if (reduce) return <div ref={ref}>{children}</div>;
  return (
    <div ref={ref} style={{ perspective: 1400 }}>
      <motion.div style={{ rotateX, scale, transformOrigin: "50% 100%" }}>{children}</motion.div>
    </div>
  );
}

/** Card with a glow that follows the cursor. Keyboard focus lights it up too. */
export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div onPointerMove={onMove} className={cn("spot-card", className)}>
      {children}
    </div>
  );
}

/** Looping ribbon of words. Hidden from assistive tech, still stoppable with the pause button. */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const track = (
    <div className="marquee-track flex shrink-0 items-center gap-8 pr-8">
      {items.map((t, i) => (
        <span key={i} className="flex items-center gap-8">
          <span>{t}</span>
          <SparkleIcon className="h-6 w-6 shrink-0" fill="currentColor" aria-hidden />
        </span>
      ))}
    </div>
  );
  return (
    <div
      aria-hidden
      className={cn("flex select-none overflow-hidden whitespace-nowrap", className)}
    >
      {track}
      {track}
    </div>
  );
}

/** Soft gradient tile that holds a Lucide icon. Put `group` on the parent card for the hover lift. */
export function IconTile({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-accent to-lilac/70 text-primary ring-1 ring-primary/10 transition duration-300 ease-out group-hover:scale-105 group-hover:shadow-glow",
        className,
      )}
    >
      {children}
    </span>
  );
}