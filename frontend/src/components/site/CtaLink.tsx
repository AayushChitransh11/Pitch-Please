import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  to: "/prepare" | "/practice" | "/results";
  variant?: "primary" | "outline";
  children: ReactNode;
  className?: string;
};

export function CtaLink({ to, variant = "primary", children, className }: Props) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold transition duration-200 hover:-translate-y-0.5",
        variant === "primary"
          ? "bg-primary text-primary-foreground hover:shadow-lift"
          : "border border-input bg-card text-foreground hover:border-primary hover:text-primary",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">{title}</h2>
      {intro && <p className="mt-4 text-lg text-muted-foreground">{intro}</p>}
    </div>
  );
}
