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
  // Un solo contorno une cuello, hombros, mangas y cuerpo del saco.
  "M102,48 L92,56 L50,68 C41,71 37,80 35,96 C30,140 30,205 31,248 L34,292 L63,292 L72,141 C72,190 73,245 76,292 C88,300 100,299 110,289 C120,299 132,300 144,292 C147,245 148,190 148,141 L157,292 L186,292 L189,248 C190,205 190,140 185,96 C183,80 179,71 170,68 L128,56 L118,48 C112,44 108,44 102,48 Z",
  // Dos puntas de camisa amplias dejan libre el centro del cuello.
  "M92,56 L102,48 L109,63 L99,77 Z M128,56 L118,48 L111,63 L121,77 Z",
  // El nudo conecta ambas puntas y comparte su base con la hoja de la corbata.
  "M109,63 L106,72 L108,82 L112,82 L114,72 L111,63 Z M108,82 L108,141 L110,152 L112,141 L112,82",
  // Solapas ancladas a los hombros; se unen al frente y a la abertura central.
  "M92,56 L82,89 L88,98 L110,188 L132,98 L138,89 L128,56 M110,188 L110,289",
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
