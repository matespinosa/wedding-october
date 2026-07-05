"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { RoseBloom } from "@/components/ui/Florals";
import { Reveal } from "@/components/ui/Reveal";
import { TextReveal } from "@/components/ui/TextReveal";
import { site } from "@/lib/content";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Photo = (typeof site.gallery.photos)[number];

function Frame({
  photo,
  index,
  className,
  priority,
}: {
  photo: Photo;
  index: number;
  className?: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Parallax interno: la imagen se desplaza dentro del marco al hacer scroll.
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 1.1, ease: EASE_OUT, delay: index * 0.12 }}
      className={cn(
        "group relative overflow-hidden rounded-[26px] border border-cream/10",
        className,
      )}
    >
      <motion.div style={{ y }} className="absolute inset-[-8%]">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 768px) 100vw, 45vw"
          priority={priority}
          className="object-cover transition-transform duration-[1600ms] ease-out-expo group-hover:scale-105"
        />
      </motion.div>
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-70 transition-opacity duration-700 group-hover:opacity-40"
      />
    </motion.div>
  );
}

export function Gallery() {
  const [a, b, c] = site.gallery.photos;

  return (
    <section
      id="galeria"
      className="relative overflow-hidden bg-ink py-24 text-cream md:py-32"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_50%,rgba(198,169,122,0.1),transparent_72%)]"
      />
      <RoseBloom className="pointer-events-none absolute -left-10 top-10 h-48 -rotate-12 text-gold/10" />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
          <Frame photo={a} index={0} className="aspect-[4/5]" priority />

          <div className="flex flex-col gap-6">
            <div className="px-2 py-6 text-center md:py-8">
              <TextReveal
                as="p"
                text={site.gallery.quote}
                per="word"
                stagger={0.07}
                className="font-serif text-[clamp(1.8rem,4vw,2.9rem)] font-light italic leading-[1.25] text-cream text-balance"
              />
              <Reveal delay={0.2}>
                <span
                  aria-hidden
                  className="mx-auto mt-6 block h-px w-16 bg-gold/50"
                />
              </Reveal>
            </div>
            <Frame photo={b} index={1} className="aspect-[16/10]" />
          </div>
        </div>

        <div className="mt-6 md:mt-10">
          <Frame photo={c} index={2} className="aspect-[16/7]" />
        </div>
      </div>
    </section>
  );
}
