"use client";

import { Reveal } from "@/components/ui/Reveal";
import { TextReveal } from "@/components/ui/TextReveal";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  centerEyebrow?: boolean;
  dark?: boolean;
  className?: string;
};

/** Editorial section opener: hairline + small caps eyebrow, oversized serif title. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  centerEyebrow = false,
  dark = false,
  className,
}: Props) {
  const centered = align === "center";
  return (
    <div className={cn(centered ? "text-center" : "text-left", className)}>
      <Reveal blur={false} y={16}>
        <p
          className={cn(
            "flex items-center gap-4 text-[12px] font-medium uppercase tracking-[0.34em]",
            (centered || centerEyebrow) && "justify-center",
            dark ? "text-gold" : "text-bronze",
          )}
        >
          <span aria-hidden className={cn("h-px w-10", dark ? "bg-gold/50" : "bg-gold/70")} />
          {eyebrow}
          <span aria-hidden className={cn("h-px w-10", dark ? "bg-gold/50" : "bg-gold/70")} />
        </p>
      </Reveal>

      <TextReveal
        as="h2"
        text={title}
        per="word"
        stagger={0.07}
        delay={0.1}
        className={cn(
          "mt-6 font-serif text-[clamp(2.6rem,6vw,4.75rem)] font-light leading-[1.06] tracking-[-0.01em] text-balance",
          dark ? "text-cream" : "text-ink",
        )}
      />

      {description && (
        <Reveal delay={0.25} y={20}>
          <p
            className={cn(
              "mt-6 text-[18px] leading-[1.7] md:text-[19px]",
              centered && "mx-auto",
              "max-w-lg",
              dark ? "text-cream/60" : "text-ink/60",
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
