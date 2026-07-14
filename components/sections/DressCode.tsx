"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/lib/content";
import { draw } from "@/lib/motion";

/* ————————————————————————————————————————————————
   Ilustraciones de moda en línea continua — dibujadas a mano
   en SVG y trazadas con la animación `draw` al entrar en vista.
   ———————————————————————————————————————————————— */

const SUIT_PATHS = [
  // silueta izquierda: hombro, brazo, manga
  "M108,44 C96,45 90,50 76,56 C59,63 51,82 48,108 C45,138 50,178 57,210 L85,205 C81,170 79,146 81,126",
  // silueta derecha
  "M112,44 C124,45 130,50 144,56 C161,63 169,82 172,108 C175,138 170,178 163,210 L135,205 C139,170 141,146 139,126",
  // cuerpo y ruedo del saco
  "M81,126 C83,172 85,216 89,258 L131,258 C135,216 137,172 139,126",
  // solapas
  "M107,46 C99,68 95,96 97,122 M97,122 L110,99",
  "M113,46 C121,68 125,96 123,122 M123,122 L110,99",
  // camisa y corbata
  "M96,52 L110,82 L124,52",
  "M110,82 L105,92 L107,146 L110,155 L113,146 L115,92 Z",
  // pañuelo de bolsillo
  "M88,118 L103,115 L97,106 Z",
  // botones
  "M115,172 a2.2,2.2 0 1,0 0.1,0",
  "M115,194 a2.2,2.2 0 1,0 0.1,0",
  // pantalón
  "M89,258 C90,286 92,304 94,318 M131,258 C130,286 128,304 126,318 M110,262 L110,318",
];

const GOWN_PATHS = [
  // tirantes
  "M92,42 C92,54 88,64 84,74 M128,42 C128,54 132,64 136,74",
  // escote
  "M84,74 C96,87 124,87 136,74",
  // corpiño
  "M84,74 C80,98 82,120 88,138 M136,74 C140,98 138,120 132,138",
  // costura de cintura
  "M88,138 C102,145 118,145 132,138",
  // caída izquierda de la falda
  "M88,138 C68,196 50,248 42,300 C74,313 92,315 110,315",
  // caída derecha
  "M132,138 C152,196 170,248 178,300 C146,313 128,315 110,315",
  // pliegues
  "M102,146 C94,208 84,258 78,306",
  "M118,146 C126,208 136,258 142,306",
  // destello
  "M62,108 l0,10 M57,113 l10,0",
];

function FashionPlate({ paths, label }: { paths: string[]; label: string }) {
  return (
    <motion.div
      whileHover={{ rotate: 1.4, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className="relative mx-auto w-fit"
    >
      <div
        aria-hidden
        className="absolute inset-0 scale-125 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(198,169,122,0.1),transparent_72%)]"
      />
      <motion.svg
        role="img"
        aria-label={label}
        viewBox="0 0 220 340"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.45 }}
        className="relative h-72 text-gold md:h-80"
      >
        {paths.map((d, i) => (
          <motion.path key={i} d={d} strokeWidth={1.6} variants={draw(1.7)} custom={i} />
        ))}
      </motion.svg>
    </motion.div>
  );
}

type Group = {
  label: string;
  garment: string;
  notes: readonly string[];
  palette: readonly { name: string; hex: string }[];
};

function CodeColumn({
  group,
  paths,
  delay,
}: {
  group: Group;
  paths: string[];
  delay: number;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <FashionPlate paths={paths} label={`Ilustración: ${group.garment}`} />

      <Reveal delay={delay} y={24}>
        <p className="mt-10 text-[11px] font-medium uppercase tracking-[0.4em] text-gold">
          {group.label}
        </p>
        <h3 className="mt-3 font-serif text-3xl font-light italic text-cream md:text-4xl">
          {group.garment}
        </h3>
        {group.notes.length > 0 && (
          <ul className="mt-5 space-y-1.5 text-[14px] leading-relaxed text-cream/55">
            {group.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        )}
      </Reveal>
    </div>
  );
}

export function DressCode() {
  return (
    <section
      id="dress-code"
      className="relative overflow-hidden bg-ink py-28 text-cream md:py-36"
    >
      {/* Viñeta ambiental dorada */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_8%,rgba(198,169,122,0.12),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-5xl px-5 md:px-8">
        <SectionHeading
          dark
          eyebrow={site.dresscode.eyebrow}
          title={site.dresscode.title}
          description={site.dresscode.intro}
        />

        <div className="mt-16 grid gap-16 md:mt-24 md:grid-cols-2 md:gap-10">
          <CodeColumn group={site.dresscode.men} paths={SUIT_PATHS} delay={0.1} />
          <CodeColumn group={site.dresscode.women} paths={GOWN_PATHS} delay={0.2} />
        </div>

        <Reveal delay={0.2} y={18}>
          <p className="mx-auto mt-20 flex max-w-md items-center justify-center gap-4 text-center font-serif text-lg italic text-cream/70">
            <span aria-hidden className="h-px w-8 shrink-0 bg-gold/40" />
            {site.dresscode.note}
            <span aria-hidden className="h-px w-8 shrink-0 bg-gold/40" />
          </p>
        </Reveal>
      </div>
    </section>
  );
}
