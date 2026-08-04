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
   Geometría del arco.

   Todo cuelga de `--arch-w`: el alto conserva la proporción 10/13 y el
   marco dorado se dibuja concéntrico a la foto, de modo que la calle
   dorada mide exactamente lo mismo en la curva, en los costados y en la
   base.

   La clave: el arco superior es un semicírculo real — radio horizontal
   50% del ancho y radio vertical ese mismo ancho / 2. Usar 50% también
   en el eje vertical lo convierte en una elipse apuntada (alto / 2), que
   era justo por lo que la foto y el marco no coincidían.
   ———————————————————————————————————————————————— */
const ARCH_VARS = {
  "--arch-w": "min(80vw, calc(clamp(300px, 45vh, 500px) * 10 / 13))",
  "--arch-h": "calc(var(--arch-w) * 13 / 10)",
  "--arch-gap": "clamp(12px, 3.2vw, 18px)",
  "--arch-foot": "20px",
} as React.CSSProperties;

/** Contorno del arco, desplazado `grow` hacia afuera (`0px` = la foto). */
const archRadius = (grow: string) => {
  const crown = `calc(var(--arch-w) / 2 + ${grow})`;
  const foot = `calc(var(--arch-foot) + ${grow})`;
  return `50% 50% ${foot} ${foot} / ${crown} ${crown} ${foot} ${foot}`;
};

/* El tamaño de los nombres mira también a la altura: en apaisado, `13.5vw`
   los disparaba al máximo mientras el arco se quedaba en su mínimo. */
const nameClass =
  "relative z-20 block font-serif text-[clamp(3.4rem,min(13.5vw,22vh),6.75rem)] font-light leading-[0.95] tracking-[-0.005em] text-ink";

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
            <span className="relative block" style={ARCH_VARS}>
              {/* Marco dorado: mismo centro de circunferencia que la foto,
                  radios crecidos en --arch-gap. Al ser concéntrico, la
                  separación es idéntica en todo el contorno. */}
              <motion.span
                aria-hidden
                initial={{ opacity: 0, scale: 0.93 }}
                animate={ready ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 1, ease: EASE_OUT, delay: 1.75 }}
                style={{
                  inset: "calc(var(--arch-gap) * -1)",
                  borderRadius: archRadius("var(--arch-gap)"),
                }}
                className="pointer-events-none absolute block border border-gold/45"
              />

              {/* El reveal (opacity/scale) vive en un envoltorio propio y el
                  recorte del arco en un elemento sin animación: WebKit deja
                  la foto en blanco cuando el clip y la animación comparten
                  nodo. El recorte es border-radius + overflow, no clip-path,
                  y si algún motor fallara la foto saldría rectangular pero
                  nunca vacía. translateZ + máscara opaca fuerzan a Safari a
                  recortar también las capas con transform de dentro. */}
              <motion.span
                initial={{ opacity: 0, scale: 0.94 }}
                animate={ready ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 1.5, ease: EASE_OUT, delay: 1.05 }}
                style={{ width: "var(--arch-w)", height: "var(--arch-h)" }}
                className="relative z-0 block"
              >
                <span
                  style={{
                    borderRadius: archRadius("0px"),
                    transform: "translateZ(0)",
                    WebkitMaskImage: "-webkit-radial-gradient(white, black)",
                  }}
                  className="absolute inset-0 block overflow-hidden bg-[rgba(221,210,196,0.45)]"
                >
                  {/* Foto con zoom de asentamiento (framer) + parallax GSAP interno */}
                  <motion.span
                    initial={{ scale: 1.18 }}
                    animate={ready ? { scale: 1.06 } : {}}
                    transition={{ duration: 2.2, ease: EASE_OUT, delay: 1.05 }}
                    className="absolute inset-[-6%] block"
                  >
                    <span ref={photoRef} className="absolute inset-[-12%] block">
                      <Image
                        src="/images/hero.jpg"
                        alt="Mateo y Julieth"
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 520px"
                        className="object-cover object-[50%_35%]"
                      />
                    </span>
                  </motion.span>

                  {/* Velos crema simétricos arriba y abajo: funden la foto con
                      el lienzo y sostienen la legibilidad de los nombres que
                      la cruzan, dejando limpia la franja donde salimos. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(247,243,238,0.78),rgba(247,243,238,0.12)_20%,rgba(247,243,238,0.04)_56%,rgba(247,243,238,0.2)_78%,rgba(247,243,238,0.8))]"
                  />
                </span>
              </motion.span>

              {/* Ampersand a caballo sobre el marco, a media altura del arco:
                  cae sobre el tramo recto, así el corte se lee intencionado. */}
              <span
                aria-hidden
                style={{
                  right: "calc(var(--arch-gap) * -1)",
                  transform: "translate(50%, -50%)",
                }}
                className="absolute top-1/2 z-30 block"
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.4, rotate: -22 }}
                  animate={ready ? { opacity: 1, scale: 1, rotate: -8 } : {}}
                  transition={{ ...springSoft, delay: 1.9 }}
                  className="block font-serif text-[clamp(2.2rem,5vw,3.4rem)] italic leading-none text-gold [text-shadow:0_0_16px_rgba(247,243,238,0.95),0_0_34px_rgba(247,243,238,0.85)]"
                >
                  &
                </motion.span>
              </span>

              {/* Sello giratorio: contrapeso del ampersand al otro costado y a
                  la misma altura, apoyado fuera del marco. En la esquina baja
                  se montaba sobre «Julieth» en cuanto el arco se acortaba, y
                  encima del marco su texto caía sobre la foto. */}
              <span
                aria-hidden
                style={{
                  right: "calc(100% + var(--arch-gap) + 1.15rem)",
                  transform: "translateY(-50%)",
                }}
                className="absolute top-1/2 z-30 hidden lg:block"
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={ready ? { opacity: 1, scale: 1 } : {}}
                  transition={{ ...springSoft, delay: 2.15 }}
                  className="block"
                >
                  <RotatingBadge text={site.date.badge} />
                </motion.span>
              </span>
            </span>

            <TextReveal
              text={site.couple.her}
              per="char"
              mode="controlled"
              started={ready}
              delay={0.8}
              stagger={0.05}
              duration={1.1}
              className={`${nameClass} -mt-[0.32em]`}
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
