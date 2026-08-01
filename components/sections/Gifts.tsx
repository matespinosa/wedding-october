"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Mail } from "lucide-react";
import Image from "next/image";
import { site } from "@/lib/content";
import { EASE_OUT } from "@/lib/motion";

/* ————————————————————————————————————————————————
   Lluvia de sobres — posdata.

   El sitio entero está escrito como una carta ("Una carta para ti"),
   así que el regalo se menciona donde se menciona en una carta: en la
   posdata. Es un aparte por definición, y eso hace el trabajo de la
   discreción por estructura, no bajando el tamaño de letra.

   Deliberadamente NO usa SectionHeading: sin antetítulo ni titular
   gigante, no compite con la ceremonia ni con el dress code.
   ———————————————————————————————————————————————— */

export function Gifts() {
  const reduce = useReducedMotion();

  return (
    <section id="regalos" className="relative px-5 pt-24 pb-16 md:pt-28 md:pb-12">
      <h2 className="sr-only">{site.gifts.srTitle}</h2>

      <motion.div
        initial={
          reduce
            ? { opacity: 0 }
            : { opacity: 0, y: 26, rotate: 2.4, scale: 0.985 }
        }
        whileInView={
          reduce
            ? { opacity: 1 }
            : { opacity: 1, y: 0, rotate: -0.8, scale: 1 }
        }
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.1, ease: EASE_OUT }}
        className="relative mx-auto w-full max-w-[34rem]"
      >
        {/* Segunda hoja asomando detrás: el papel deja de ser un
            rectángulo plano y pasa a ser un objeto con grosor. */}
        <div
          aria-hidden
          className="paper absolute inset-x-3 -bottom-2 top-3 rotate-[1.7deg] rounded-[3px] opacity-70 shadow-[0_10px_24px_-18px_rgba(74,56,32,0.5)]"
        />

        {/* La tarjeta. Dos sombras: una de contacto, corta y cerrada, y
            otra ambiental, ancha y difusa. Es lo que la apoya sobre la
            página en vez de dejarla flotando. */}
        <div className="paper relative rounded-[3px] px-8 pb-10 pt-14 shadow-[0_1px_2px_rgba(74,56,32,0.16),0_3px_6px_-3px_rgba(74,56,32,0.22),0_28px_54px_-32px_rgba(74,56,32,0.55),inset_0_1px_0_rgba(255,255,255,0.75)] md:px-14 md:pb-12 md:pt-16">
          {/* Filete interior: el marco de una tarjeta de visita grabada. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[10px] rounded-[2px] border border-bronze/[0.13] md:inset-[14px]"
          />

          {/* El lacre rompe el borde superior — otra capa de profundidad,
              y el mismo sello con el que se abrió la invitación. */}
          <Image
            src="/images/sello-circular-dorado-transparente.png"
            alt=""
            width={220}
            height={220}
            className="absolute -top-6 left-1/2 size-[3.15rem] -translate-x-1/2 drop-shadow-[0_6px_12px_rgba(74,56,32,0.34)] md:size-[3.6rem]"
          />

          {/* Bronce un paso más oscuro que el token: `--color-bronze` está
              calibrado sobre cream y aquí el papel es shell, donde se queda
              en 4.13:1. Este llega a 5.9:1. */}
          <p className="text-center font-serif text-[15px] font-medium uppercase tracking-[0.36em] text-[#6f5430] [text-shadow:0_1px_0_rgba(255,255,255,0.85)] md:text-base">
            {site.gifts.mark}
          </p>

          <span
            aria-hidden
            className="mx-auto mt-6 grid size-12 place-items-center rounded-full border border-gold/40 bg-gold/[0.08] text-gold-deep md:mt-7"
          >
            <Mail size={20} strokeWidth={1.5} />
          </span>

          <p className="mx-auto mt-6 max-w-[30rem] text-center font-serif text-[20px] leading-[1.65] text-ink/80 text-pretty md:mt-7 md:text-[22px]">
            {site.gifts.note}
          </p>

          <p className="mt-8 text-center font-script text-[1.7rem] leading-none text-bronze md:mt-9">
            {site.gifts.signature}
          </p>
        </div>
      </motion.div>
    </section>
  );
}
