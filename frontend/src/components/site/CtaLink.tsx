import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sparkle } from "@/components/site/Decor";

type Props = {
  to: "/prepare" | "/practice" | "/results";
  variant?: "primary" | "outline" | "gold" | "glass";
  children: ReactNode;
  className?: string;
};

const variants = {
  primary:
    "bg-gradient-to-br from-violet to-primary text-primary-foreground shadow-soft hover:shadow-lift hover:brightness-110",
  outline:
    "border border-input bg-card text-foreground hover:border-primary hover:text-primary hover:shadow-soft",
  gold: "bg-gradient-to-br from-gold to-[oklch(0.78_0.11_75)] text-night shadow-soft hover:shadow-glow hover:brightness-105",
  glass: "glass text-cream hover:bg-white/15",
} as const;

export function CtaLink({ to, variant = "primary", children, className }: Props) {
  return (
    <Link
      to={to}
      className={cn(
        "btn-shine group inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold transition duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] [&_svg.lucide-arrow-right]:transition-transform [&_svg.lucide-arrow-right]:duration-300 group-hover:[&_svg.lucide-arrow-right]:translate-x-1",
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  tone = "dark",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  tone?: "dark" | "light";
}) {
  const light = tone === "light";
  return (
    <div className="max-w-3xl">
      <p
        className={cn(
          "flex items-center gap-2 text-sm font-semibold uppercase tracking-widest",
          light ? "text-gold" : "text-primary",
        )}
      >
        <Sparkle size={12} className={light ? "text-gold" : "text-gold-deep"} />
        {eyebrow}
      </p>
      <h2
        className={cn(
          "mt-3 text-4xl font-medium leading-[1.05] sm:text-6xl",
          light ? "text-cream" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {intro && (
        <p className={cn("mt-5 text-lg", light ? "text-cream/80" : "text-muted-foreground")}>
          {intro}
        </p>
      )}
    </div>
  );
}