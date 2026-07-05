"use client";

import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { useLenis } from "@/components/providers/LenisProvider";
import { useSiteReady } from "@/components/providers/load-context";
import { Button } from "@/components/ui/Button";
import { FloralBranch, RoseBloom } from "@/components/ui/Florals";
import { RotatingBadge } from "@/components/ui/RotatingBadge";
import { TextReveal } from "@/components/ui/TextReveal";
import { site } from "@/lib/content";
import { EASE_OUT, springSoft } from "@/lib/motion";
import { mulberry32 } from "@/lib/utils";

/* Polvo dorado flotante — posiciones deterministas (seguras para SSR). */
const rand = mulberry32(20261121);
const DUST = Array.from({ length: 14 }, () => ({
  left: 4 + rand() * 92,
  top: 8 + rand() * 80,
  size: 2 + rand() * 3,
  duration: 6 + rand() * 7,
  delay: rand() * 6,
  opacity: 0.25 + rand() * 0.4,
}));

export function Hero() {
  const ready = useSiteReady();
  const ref = useRef<HTMLElement>(null);
  const { scrollTo } = useLenis();

  /* Parallax de scroll: el contenido sube más lento que la página. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yContent = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const yFlorals = useTransform(scrollYProgress, [0, 1], [0, 260]);
  const yPhoto = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  /* Parallax de mouse en las flores, con muelle perezoso. */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const fx = useSpring(useTransform(mx, [-0.5, 0.5], [-16, 16]), {
    stiffness: 45,
    damping: 18,
  });
  const fy = useSpring(useTransform(my, [-0.5, 0.5], [-12, 12]), {
    stiffness: 45,
    damping: 18,
  });

  const onMouseMove = (e: React.MouseEvent) => {
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };

  return (
    <section
      ref={ref}
      id="inicio"
      onMouseMove={onMouseMove}
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-cream"
    >
      {/* Foto real de fondo, velada con un tono cálido para conservar el aire claro */}
      <motion.div aria-hidden style={{ y: yPhoto }} className="absolute inset-0 -top-[10%] h-[120%]">
        <Image
          src="/images/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[56%_38%] opacity-45"
        />
      </motion.div>
      {/* Velo crema: mantiene legible el título y el tono editorial */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cream/45"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(58%_50%_at_50%_46%,rgba(247,243,238,0.92),rgba(247,243,238,0.55)_60%,rgba(247,243,238,0.25))]"
      />

      {/* Ambiente: manchas de luz en deriva lenta */}
      <div aria-hidden className="absolute inset-0">
        <div className="animate-drift absolute -left-40 -top-48 size-[42rem] rounded-full bg-gold/[0.12] blur-3xl" />
        <div className="animate-drift-slow absolute -bottom-56 -right-32 size-[46rem] rounded-full bg-sand/50 blur-3xl" />
        <div className="animate-drift absolute left-1/3 top-1/2 size-[30rem] rounded-full bg-white/60 blur-3xl [animation-delay:-12s]" />
      </div>

      {/* Florales en las esquinas, con parallax de mouse y de scroll */}
      <motion.div aria-hidden style={{ y: yFlorals }} className="absolute inset-0">
        <motion.div style={{ x: fx, y: fy }} className="absolute inset-0">
          <FloralBranch className="absolute -left-10 -top-8 h-[24rem] -rotate-[142deg] text-gold/25 md:h-[30rem]" />
          <FloralBranch className="absolute -bottom-14 -right-8 h-[22rem] rotate-[24deg] text-gold/20 md:h-[28rem]" />
          <RoseBloom className="absolute right-[12%] top-[16%] hidden h-28 rotate-12 text-gold/20 lg:block" />
        </motion.div>
      </motion.div>

      {/* Polvo dorado */}
      <div aria-hidden className="absolute inset-0">
        {DUST.map((p, i) => (
          <span
            key={i}
            className="animate-float absolute rounded-full bg-gold"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `-${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Contenido */}
      <motion.div
        style={{ y: yContent, opacity: fade }}
        className="relative z-10 flex flex-col items-center px-6 pb-20 pt-24 text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.35 }}
          className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.42em] text-bronze"
        >
          <span aria-hidden className="h-px w-10 bg-gold/70" />
          {site.hero.eyebrow}
          <span aria-hidden className="h-px w-10 bg-gold/70" />
        </motion.p>

        <h1 className="mt-8">
          <span className="sr-only">Mateo y Julieth</span>
          <span aria-hidden className="block">
            <TextReveal
              text={site.couple.him}
              per="char"
              mode="controlled"
              started={ready}
              delay={0.55}
              stagger={0.05}
              duration={1.1}
              className="block font-serif text-[clamp(4rem,14vw,9.5rem)] font-light leading-[0.95] tracking-[-0.02em] text-ink"
            />
            <span className="my-1 flex items-center justify-center gap-5 md:my-2 md:gap-8">
              <motion.span
                aria-hidden
                initial={{ scaleX: 0 }}
                animate={ready ? { scaleX: 1 } : {}}
                transition={{ duration: 1.2, ease: EASE_OUT, delay: 1.35 }}
                className="h-px w-14 origin-right bg-gold/60 md:w-24"
              />
              <motion.span
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={ready ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                transition={{ ...springSoft, delay: 1.2 }}
                className="font-serif text-[clamp(2.4rem,7vw,4.8rem)] italic leading-none text-gold"
              >
                &
              </motion.span>
              <motion.span
                aria-hidden
                initial={{ scaleX: 0 }}
                animate={ready ? { scaleX: 1 } : {}}
                transition={{ duration: 1.2, ease: EASE_OUT, delay: 1.35 }}
                className="h-px w-14 origin-left bg-gold/60 md:w-24"
              />
            </span>
            <TextReveal
              text={site.couple.her}
              per="char"
              mode="controlled"
              started={ready}
              delay={0.8}
              stagger={0.05}
              duration={1.1}
              className="block font-serif text-[clamp(4rem,14vw,9.5rem)] font-light leading-[0.95] tracking-[-0.02em] text-ink"
            />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: 1.55 }}
          className="mt-8 text-[10px] font-medium uppercase tracking-[0.28em] text-ink/60 md:text-xs md:tracking-[0.34em]"
        >
          {site.date.display}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: 1.75 }}
          className="mt-8"
        >
          <Button
            href="#historia"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#historia");
            }}
            icon={<ArrowDown size={14} strokeWidth={1.75} />}
          >
            {site.hero.cta}
          </Button>
        </motion.div>
      </motion.div>

      {/* Indicador de scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 2.3 }}
        aria-hidden
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 [@media(min-height:760px)]:flex"
      >
        <span className="text-[9px] uppercase tracking-[0.4em] text-ink/40">
          {site.hero.scrollHint}
        </span>
        <span className="block h-12 w-px overflow-hidden bg-ink/10">
          <span className="animate-scroll-hint block h-full w-full bg-gold" />
        </span>
      </motion.div>

      {/* Sello giratorio */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={ready ? { opacity: 1, scale: 1 } : {}}
        transition={{ ...springSoft, delay: 2.1 }}
        className="absolute bottom-10 right-10 hidden lg:block"
      >
        <RotatingBadge text={site.date.badge} />
      </motion.div>
    </section>
  );
}
