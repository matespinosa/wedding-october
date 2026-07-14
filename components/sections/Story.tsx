"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { ArtFrame } from "@/components/ui/ArtFrame";
import { FloralBranch } from "@/components/ui/Florals";
import { Parallax } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/lib/content";
import { springSoft, VIEWPORT } from "@/lib/motion";
import { cn } from "@/lib/utils";

type MomentData = (typeof site.story.moments)[number];

function Moment({ moment, index }: { moment: MomentData; index: number }) {
  const even = index % 2 === 0;
  return (
    <li className="relative grid items-center gap-8 pl-12 md:grid-cols-2 md:gap-x-24 md:pl-0">
      {/* Marcador en la línea de tiempo */}
      <span
        aria-hidden
        className="absolute left-[13px] top-2 -translate-x-1/2 md:left-1/2 md:top-1/2 md:-translate-y-1/2"
      >
        <motion.span
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={VIEWPORT}
          transition={{ ...springSoft, delay: 0.25 }}
          className="block size-3 rotate-45 border border-gold bg-cream"
        />
      </span>

      <Parallax
        mobileOnly
        amount={16}
        className={cn(
          even ? "md:order-1 md:pr-12 md:text-right" : "md:order-2 md:pl-12",
        )}
      >
        <Reveal delay={0.1}>
          <span className="text-[11px] font-medium uppercase tracking-[0.35em] text-bronze">
            Capítulo · 0{index + 1}
          </span>
          <h3 className="mt-4 font-serif text-3xl font-light text-balance text-ink md:text-4xl">
            {moment.title}
          </h3>
          <p
            className={cn(
              "mt-4 max-w-md text-[15px] leading-[1.85] text-ink/60",
              even && "md:ml-auto",
            )}
          >
            {moment.text}
          </p>
        </Reveal>
      </Parallax>

      <Reveal
        delay={0.22}
        y={44}
        className={cn("hidden md:block", even ? "md:order-2" : "md:order-1")}
      >
        <ArtFrame word={moment.word} index={index} />
      </Reveal>
    </li>
  );
}

export function Story() {
  const listRef = useRef<HTMLOListElement>(null);

  /* La línea central se dibuja al ritmo del scroll. */
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 0.78", "end 0.5"],
  });
  const lineScale = useSpring(scrollYProgress, { stiffness: 90, damping: 26 });

  return (
    <section
      id="historia"
      className="relative overflow-hidden bg-cream py-28 md:py-40"
    >
      <FloralBranch className="pointer-events-none absolute -right-16 top-24 h-96 rotate-[24deg] text-gold/[0.1]" />

      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading
          eyebrow={site.story.eyebrow}
          title={site.story.title}
        />

        <Reveal delay={0.3} y={18}>
          <p className="mx-auto mt-8 max-w-xl text-center font-serif text-lg italic leading-relaxed text-ink/55 md:text-xl">
            {site.story.verse}
            <span className="mt-3 block text-[11px] not-italic uppercase tracking-[0.3em] text-bronze">
              {site.story.verseRef}
            </span>
          </p>
        </Reveal>

        <ol
          ref={listRef}
          className="relative mt-16 flex flex-col gap-14 md:mt-32 md:gap-36"
        >
          {/* Riel + trazo dorado que avanza con el scroll */}
          <div
            aria-hidden
            className="absolute bottom-0 left-[13px] top-0 w-px bg-ink/[0.08] md:left-1/2 md:-translate-x-1/2"
          />
          <motion.div
            aria-hidden
            style={{ scaleY: lineScale }}
            className="absolute bottom-0 left-[13px] top-0 w-px origin-top bg-gradient-to-b from-gold via-gold to-gold/20 md:left-1/2 md:-translate-x-1/2"
          />

          {site.story.moments.map((moment, i) => (
            <Moment key={moment.title} moment={moment} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}
