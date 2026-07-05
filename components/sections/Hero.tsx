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
const rand = mulberry32(20261003);
const DUST = Array.from({ length: 14 }, () => ({
  left: 4 + rand() * 92,
  top: 8 + rand() * 80,
  size: 2 + rand() * 3,
  duration: 6 + rand() * 7,
  delay: rand() * 6,
  opacity: 0.25 + rand() * 0.4,
}));

/* El arco es la pieza central: mismo radio en el clip animado y en el marco. */
const ARCH_RADIUS = "320px 320px 22px 22px";

const nameClass =
  "relative z-20 block font-serif text-[clamp(3.6rem,13.5vw,6.75rem)] font-light leading-[0.95] tracking-[-0.02em] text-ink";

export function Hero() {
  const ready = useSiteReady();
  const ref = useRef<HTMLElement>(null);
  const { scrollTo } = useLenis();

  /* Parallax de scroll: contenido, foto interior y florales a ritmos distintos. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yContent = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const yFlorals = useTransform(scrollYProgress, [0, 1], [0, 260]);
  const yPhoto = useTransform(scrollYProgress, [0, 1], [-18, 52]);
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
          <RoseBloom className="absolute left-[10%] top-[18%] hidden h-28 -rotate-12 text-gold/20 lg:block" />
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
        className="relative z-10 flex w-full flex-col items-center px-5 pb-14 pt-24 text-center md:px-8"
      >
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.35 }}
          className="mb-5 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.42em] text-bronze"
        >
          <span aria-hidden className="h-px w-10 bg-gold/70" />
          {site.hero.eyebrow}
          <span aria-hidden className="h-px w-10 bg-gold/70" />
        </motion.p>

        {/* Pórtico: los nombres se entrelazan con el arco fotográfico */}
        <h1 className="flex w-full flex-col items-center">
          <span className="sr-only">Mateo y Julieth</span>
          <span aria-hidden className="flex w-full flex-col items-center">
            <TextReveal
              text={site.couple.him}
              per="char"
              mode="controlled"
              started={ready}
              delay={0.55}
              stagger={0.05}
              duration={1.1}
              className={`${nameClass} -mb-[0.4em]`}
            />

            {/* Arco con la foto real */}
            <span className="relative block">
              {/* Marco dorado desfasado */}
              <motion.span
                initial={{ opacity: 0, scale: 0.93 }}
                animate={ready ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 1, ease: EASE_OUT, delay: 1.75 }}
                className="absolute -inset-3 block rounded-b-[32px] rounded-t-full border border-gold/45 md:-inset-4"
              />

              <motion.span
                initial={{
                  opacity: 0,
                  clipPath: `inset(22% 13% 26% 13% round ${ARCH_RADIUS})`,
                }}
                animate={
                  ready
                    ? {
                        opacity: 1,
                        clipPath: `inset(0% 0% 0% 0% round ${ARCH_RADIUS})`,
                      }
                    : {}
                }
                transition={{ duration: 1.5, ease: EASE_OUT, delay: 1.05 }}
                className="relative block aspect-[10/13] h-[clamp(320px,46vh,500px)] max-w-[86vw] overflow-hidden rounded-b-[22px] rounded-t-full"
              >
                {/* Foto con zoom de asentamiento + parallax interno */}
                <motion.span
                  initial={{ scale: 1.18 }}
                  animate={ready ? { scale: 1.06 } : {}}
                  transition={{ duration: 2.2, ease: EASE_OUT, delay: 1.05 }}
                  style={{ y: yPhoto }}
                  className="absolute inset-[-6%] block"
                >
                  <Image
                    src="/images/hero.jpg"
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 768px) 86vw, 420px"
                    className="object-cover object-[50%_35%]"
                  />
                </motion.span>

                {/* Velos crema arriba y abajo: funden la foto con el lienzo
                    y garantizan la legibilidad de los nombres que la cruzan */}
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(247,243,238,0.5),rgba(247,243,238,0.06)_26%,rgba(247,243,238,0.04)_62%,rgba(247,243,238,0.62))]"
                />
              </motion.span>

              {/* Ampersand asomado al borde del arco */}
              <motion.span
                initial={{ opacity: 0, scale: 0.4, rotate: -22 }}
                animate={ready ? { opacity: 1, scale: 1, rotate: -8 } : {}}
                transition={{ ...springSoft, delay: 1.9 }}
                className="absolute -right-[0.55em] top-[32%] z-30 block font-serif text-[clamp(2.4rem,5vw,3.6rem)] italic leading-none text-gold"
              >
                &
              </motion.span>

              {/* Sello giratorio solapando la esquina del arco */}
              <motion.span
                initial={{ opacity: 0, scale: 0.7 }}
                animate={ready ? { opacity: 1, scale: 1 } : {}}
                transition={{ ...springSoft, delay: 2.15 }}
                className="absolute -bottom-10 -left-16 z-30 hidden lg:block"
              >
                <RotatingBadge text={site.date.badge} />
              </motion.span>
            </span>

            <TextReveal
              text={site.couple.her}
              per="char"
              mode="controlled"
              started={ready}
              delay={0.8}
              stagger={0.05}
              duration={1.1}
              className={`${nameClass} -mt-[0.44em]`}
            />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: 1.55 }}
          className="mt-7 text-[10px] font-medium uppercase tracking-[0.28em] text-ink/60 md:text-xs md:tracking-[0.34em]"
        >
          {site.date.display}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: 1.75 }}
          className="mt-6"
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
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 lg:[@media(min-height:840px)]:flex"
      >
        <span className="text-[9px] uppercase tracking-[0.4em] text-ink/40">
          {site.hero.scrollHint}
        </span>
        <span className="block h-12 w-px overflow-hidden bg-ink/10">
          <span className="animate-scroll-hint block h-full w-full bg-gold" />
        </span>
      </motion.div>
    </section>
  );
}
