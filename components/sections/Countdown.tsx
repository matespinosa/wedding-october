"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { RingsOrnament } from "@/components/ui/Florals";
import { Reveal } from "@/components/ui/Reveal";
import { TextReveal } from "@/components/ui/TextReveal";
import { site, WEDDING_DATE } from "@/lib/content";
import { useCountdown } from "@/lib/hooks";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

function Unit({ value, label }: { value: number; label: string }) {
  const padded = String(value).padStart(2, "0");
  const [display, setDisplay] = useState(padded);
  const [dimmed, setDimmed] = useState(false);

  useEffect(() => {
    if (padded === display) return;
    setDimmed(true);
    const id = window.setTimeout(() => {
      setDisplay(padded);
      setDimmed(false);
    }, 120);
    return () => window.clearTimeout(id);
  }, [padded, display]);

  return (
    <div className="flex flex-col items-center">
      <div className="font-serif text-[clamp(2.8rem,9vw,5.5rem)] font-light leading-none text-ink tabular-nums">
        <span
          className={cn(
            "inline-block transition-opacity duration-200 ease-out",
            dimmed ? "opacity-35" : "opacity-100",
          )}
        >
          {display}
        </span>
      </div>
      <span className="mt-3 text-[10px] uppercase tracking-[0.3em] text-bronze">
        {label}
      </span>
    </div>
  );
}

export function Countdown() {
  const left = useCountdown(WEDDING_DATE);
  const { labels } = site.countdown;

  return (
    <section className="relative overflow-hidden bg-cream py-24 md:py-32">
      <div
        aria-hidden
        className="animate-drift-slow absolute left-1/2 top-1/2 size-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.06] blur-3xl"
      />

      <div className="relative mx-auto max-w-4xl px-5 text-center md:px-8">
        <Reveal blur={false} y={16}>
          <p className="flex items-center justify-center gap-4 text-[11px] font-medium uppercase tracking-[0.38em] text-bronze">
            <span aria-hidden className="h-px w-10 bg-gold/70" />
            {site.countdown.eyebrow}
            <span aria-hidden className="h-px w-10 bg-gold/70" />
          </p>
        </Reveal>

        <TextReveal
          as="h2"
          text={site.countdown.title}
          per="word"
          stagger={0.06}
          delay={0.1}
          className="mt-6 font-serif text-[clamp(2rem,5vw,3.4rem)] font-light text-ink"
        />

        <Reveal delay={0.2}>
          <div className="mt-4 flex justify-center">
            <RingsOrnament className="h-10 text-gold/70" />
          </div>
        </Reveal>

        {/* Contador */}
        <div className="mt-12 min-h-[7rem]">
          {left && !left.passed ? (
            <div className="flex items-start justify-center gap-4 md:gap-10">
              <Unit value={left.days} label={labels.days} />
              <span className="mt-[0.35em] font-serif text-[clamp(2rem,6vw,3.5rem)] font-light text-gold/50">
                :
              </span>
              <Unit value={left.hours} label={labels.hours} />
              <span className="mt-[0.35em] font-serif text-[clamp(2rem,6vw,3.5rem)] font-light text-gold/50">
                :
              </span>
              <Unit value={left.minutes} label={labels.minutes} />
              <span className="mt-[0.35em] font-serif text-[clamp(2rem,6vw,3.5rem)] font-light text-gold/50">
                :
              </span>
              <Unit value={left.seconds} label={labels.seconds} />
            </div>
          ) : left?.passed ? (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
              className="font-serif text-[clamp(2.4rem,7vw,4rem)] font-light italic text-gold-deep"
            >
              {site.countdown.today}
            </motion.p>
          ) : (
            // Placeholder estable durante SSR / primer render (evita salto)
            <div aria-hidden className="h-[7rem]" />
          )}
        </div>

        <Reveal delay={0.15}>
          <p className="mt-10 text-[11px] uppercase tracking-[0.34em] text-ink/45">
            {site.countdown.subtitle}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
