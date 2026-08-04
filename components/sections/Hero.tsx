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
import { useParallax } from "@/components/ui/Parallax";
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

/* ————————————————————————————————————————————————
   Geometría del arco. Un arco de verdad: semicírculo arriba (radio =
   mitad del ancho), laterales rectos y base apenas redondeada. El marco
   dorado repite la misma forma crecida `ARCH_FRAME_GAP` por los cuatro
   lados, así que los dos arcos quedan concéntricos a cualquier tamaño.
   ———————————————————————————————————————————————— */
const ARCH_H = "clamp(320px, 46vh, 500px)";
const ARCH_W = `min(86vw, calc(${ARCH_H} * 10 / 13))`;
const ARCH_TOP_R = `calc(${ARCH_W} / 2)`;
const ARCH_BASE_R = "20px";
const ARCH_FRAME_GAP = "14px";

/** Radios del arco, crecidos `grow` hacia fuera para el marco. */
const archRadius = (grow = "0px") =>
  `calc(${ARCH_TOP_R} + ${grow}) calc(${ARCH_TOP_R} + ${grow}) ` +
  `calc(${ARCH_BASE_R} + ${grow}) calc(${ARCH_BASE_R} + ${grow})`;

const ARCH_CLIP = `inset(0 round ${archRadius()})`;

/* Halo crema: los nombres cruzan el arco y tienen que leerse igual
   sobre el lienzo que sobre la foto. */
const nameClass =
  "relative z-20 block font-serif text-[clamp(3.6rem,13.5vw,6.75rem)] font-light leading-[0.95] tracking-[-0.02em] text-ink [text-shadow:0_0_18px_rgba(247,243,238,0.9)]";

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
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  /* Parallax GSAP de la foto del arco (capa interior, no interfiere con la
     animación de entrada de framer). */
  const photoRef = useParallax<HTMLSpanElement>(32);

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
          className="mb-5 flex items-center gap-4 text-[12px] font-medium uppercase tracking-[0.38em] text-bronze"
        >
          <span aria-hidden className="h-px w-10 bg-gold/70" />
          {site.hero.eyebrow}
          <span aria-hidden className="h-px w-10 bg-gold/70" />
        </motion.p>

        {/* Pórtico: los nombres se entrelazan con el arco fotográfico.
            Los márgenes negativos no son iguales a propósito: arriba hay
            que salvar el hueco del descendente de "Mateo" y la caída del
            semicírculo (el borde se aleja de las letras hacia los lados),
            mientras abajo el borde es recto y "Julieth" ya sube hasta su
            ascendente. Medidos para que ambos nombres muerdan el arco
            unos 0,15 em de media. */}
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
              className={`${nameClass} -mb-[0.4em] md:-mb-[0.49em]`}
            />

            {/* Arco con la foto real */}
            <span className="relative block">
              {/* Marco dorado: misma forma que el arco, crecida por igual
                  en los cuatro lados. */}
              <motion.span
                aria-hidden
                initial={{ opacity: 0, scale: 0.94 }}
                animate={ready ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 1, ease: EASE_OUT, delay: 1.6 }}
                style={{
                  top: `calc(-1 * ${ARCH_FRAME_GAP})`,
                  right: `calc(-1 * ${ARCH_FRAME_GAP})`,
                  bottom: `calc(-1 * ${ARCH_FRAME_GAP})`,
                  left: `calc(-1 * ${ARCH_FRAME_GAP})`,
                  borderRadius: archRadius(ARCH_FRAME_GAP),
                }}
                className="pointer-events-none absolute block border border-gold/45"
              />

              {/* La foto se pinta siempre: solo el asentamiento depende de la
                  animación. Si la coreografía no arranca (o el clip falla en
                  WebKit) el retrato sigue visible en lugar de dejar el hueco
                  vacío que aparecía en algunos iPhone. */}
              <motion.span
                initial={{ scale: 0.96 }}
                animate={ready ? { scale: 1 } : {}}
                transition={{ duration: 1.4, ease: EASE_OUT, delay: 1.05 }}
                style={{
                  width: ARCH_W,
                  height: ARCH_H,
                  borderRadius: archRadius(),
                  clipPath: ARCH_CLIP,
                  WebkitClipPath: ARCH_CLIP,
                }}
                className="relative isolate z-0 block overflow-hidden bg-sand/40"
              >
                {/* Una sola capa transformada dentro del recorte: WebKit
                    pierde el clip cuando se le anidan varias. */}
                <span ref={photoRef} className="absolute inset-[-9%] block">
                  <Image
                    src="/images/hero.jpg"
                    alt="Mateo y Julieth"
                    fill
                    priority
                    sizes="(max-width: 768px) 86vw, 390px"
                    className="object-cover object-[50%_32%]"
                  />
                </span>

                {/* Velos crema simétricos: funden la foto con el lienzo y
                    sostienen la lectura de los nombres que la cruzan. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(247,243,238,0.58),rgba(247,243,238,0.05)_28%,rgba(247,243,238,0.05)_72%,rgba(247,243,238,0.58))]"
                />
              </motion.span>

              {/* Ampersand asomado al costado, a media altura del arco */}
              <span
                aria-hidden
                className="absolute -right-[0.5em] top-1/2 z-30 block -translate-y-1/2 text-[clamp(2.4rem,5vw,3.6rem)]"
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.4, rotate: -22 }}
                  animate={ready ? { opacity: 1, scale: 1, rotate: -8 } : {}}
                  transition={{ ...springSoft, delay: 1.9 }}
                  className="block font-serif italic leading-none text-gold"
                >
                  &
                </motion.span>
              </span>

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
              className={`${nameClass} -mt-[0.2em]`}
            />
          </span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: 1.55 }}
          className="mt-8 hidden md:block"
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
