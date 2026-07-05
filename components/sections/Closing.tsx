"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FloralBranch, RoseBloom } from "@/components/ui/Florals";
import { Reveal } from "@/components/ui/Reveal";
import { TextReveal } from "@/components/ui/TextReveal";
import { site } from "@/lib/content";
import { EASE_OUT } from "@/lib/motion";
import { mulberry32 } from "@/lib/utils";

/* Partículas doradas flotantes — deterministas para SSR. */
const rand = mulberry32(1311);
const PARTICLES = Array.from({ length: 22 }, () => ({
  left: 2 + rand() * 96,
  top: 6 + rand() * 86,
  size: 1.5 + rand() * 3.5,
  duration: 7 + rand() * 9,
  delay: rand() * 8,
  opacity: 0.15 + rand() * 0.45,
  blur: rand() > 0.65,
}));

export function Closing() {
  return (
    <section
      id="gracias"
      className="relative overflow-hidden bg-ink py-32 text-cream md:py-44"
    >
      {/* Foto real de fondo con velo oscuro */}
      <div aria-hidden className="absolute inset-0">
        <Image
          src={site.closing.image}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-40"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/70 to-ink/90"
      />
      {/* Viñeta y botánica ambiental */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(58%_52%_at_50%_38%,rgba(198,169,122,0.16),transparent_72%)]"
      />
      <FloralBranch className="pointer-events-none absolute -left-14 bottom-10 h-[26rem] rotate-[150deg] text-gold/[0.12]" />
      <RoseBloom className="pointer-events-none absolute -right-10 top-16 h-56 -rotate-12 text-gold/[0.1]" />

      {/* Partículas */}
      <div aria-hidden className="absolute inset-0">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="animate-float absolute rounded-full bg-gold"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              filter: p.blur ? "blur(1.5px)" : undefined,
              animationDuration: `${p.duration}s`,
              animationDelay: `-${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <Reveal blur={false} y={16}>
          <p className="font-serif text-base italic text-cream/50 md:text-lg">
            {site.closing.verse}
          </p>
          <p className="mt-3 text-[10px] uppercase tracking-[0.35em] text-gold/80">
            {site.closing.verseRef}
          </p>
        </Reveal>

        <TextReveal
          as="p"
          text={site.closing.quote}
          per="word"
          stagger={0.06}
          delay={0.2}
          className="mt-14 font-serif text-[clamp(2rem,5vw,3.6rem)] font-light leading-[1.25] text-balance text-cream"
        />

        <Reveal delay={0.35} y={20}>
          <p className="mt-14 text-[11px] uppercase tracking-[0.35em] text-cream/45">
            {site.closing.farewell}
          </p>
        </Reveal>

        <Reveal delay={0.45} y={26}>
          <p className="mt-6 font-serif text-5xl font-light tracking-wide md:text-7xl">
            {site.couple.him}{" "}
            <span className="italic text-gold">&amp;</span> {site.couple.her}
          </p>
        </Reveal>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.5 }}
          aria-hidden
          className="mt-12 h-px w-24 bg-gold/50"
        />

        <Reveal delay={0.55} y={16}>
          <p className="mt-10 text-[11px] uppercase tracking-[0.3em] text-gold/70">
            {site.closing.tagline}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
