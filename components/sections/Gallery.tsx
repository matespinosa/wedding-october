"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { FloralBranch } from "@/components/ui/Florals";
import { Lightbox } from "@/components/ui/Lightbox";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/lib/content";
import { cn } from "@/lib/utils";

const { chapters, photos } = site.gallery;

type Photo = (typeof photos)[number];
type Chapter = (typeof chapters)[number];

/* ————————————————————————————————————————————————
   El álbum.

   Banda horizontal de altura fija: las fotos crecen hacia el lado, no
   hacia abajo, así que la sección mide lo mismo con nueve fotos que con
   treinta. Cada página conserva la proporción original de su foto, de
   modo que los retratos salen estrechos y los apaisados anchos — esa
   variación es la que da ritmo de álbum.
   ———————————————————————————————————————————————— */

type Page =
  | { kind: "chapter"; key: string; chapter: Chapter }
  | { kind: "photo"; key: string; photo: Photo; index: number }
  | { kind: "quote"; key: string };

/** Portadilla de capítulo, sus fotos, y al final la frase de cierre. */
function buildPages(): Page[] {
  const pages: Page[] = [];
  for (const chapter of chapters) {
    pages.push({ kind: "chapter", key: `c-${chapter.id}`, chapter });
    photos.forEach((photo, index) => {
      if (photo.chapter === chapter.id) {
        pages.push({ kind: "photo", key: photo.src.src, photo, index });
      }
    });
  }
  pages.push({ kind: "quote", key: "quote" });
  return pages;
}

const PAGES = buildPages();

export function Gallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [openAt, setOpenAt] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  /* Progreso y estado de los extremos, en rAF para no pelear con el scroll. */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    let frame = 0;

    const measure = () => {
      frame = 0;
      const max = track.scrollWidth - track.clientWidth;
      setProgress(max > 0 ? track.scrollLeft / max : 0);
      setAtStart(track.scrollLeft <= 2);
      setAtEnd(track.scrollLeft >= max - 2);
    };

    const onScroll = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(measure);
      }
    };

    measure();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const step = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const first = track.querySelector<HTMLElement>("[data-page]");
    const amount = first ? first.offsetWidth + 20 : track.clientWidth * 0.8;
    track.scrollBy({ left: amount * direction, behavior: "smooth" });
  }, []);

  return (
    <section
      id="galeria"
      className="relative overflow-hidden bg-gradient-to-b from-cream via-[#ece2d3] to-shell py-20 md:py-28"
    >
      <div
        aria-hidden
        className="animate-drift-slow pointer-events-none absolute -right-32 top-24 size-[34rem] rounded-full bg-gold/[0.09] blur-3xl"
      />
      <FloralBranch className="pointer-events-none absolute -left-10 top-16 h-44 rotate-12 text-gold/[0.16]" />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading
          eyebrow={site.gallery.eyebrow}
          title={site.gallery.title}
          description={site.gallery.intro}
        />
      </div>

      {/* La banda sale del contenedor para llegar a sangre, pero su padding
          arranca alineado con el texto de arriba. */}
      <Reveal delay={0.1} y={26} blur={false} className="relative mt-10 md:mt-14">
        <div
          ref={trackRef}
          data-lenis-prevent
          tabIndex={0}
          role="region"
          aria-label="Álbum de fotos de Mateo y Julieth"
          className={cn(
            "flex h-[clamp(19rem,54vh,26rem)] snap-x snap-mandatory items-stretch gap-5 overflow-x-auto overscroll-x-contain outline-none md:h-[clamp(23rem,60vh,32rem)] md:snap-proximity",
            "px-[max(1.25rem,calc((100%-72rem)/2))] scroll-p-[max(1.25rem,calc((100%-72rem)/2))]",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {PAGES.map((page) => {
            if (page.kind === "chapter") {
              return (
                <div
                  key={page.key}
                  data-page
                  data-chapter={page.chapter.id}
                  className="flex h-full w-[min(58vw,13rem)] shrink-0 snap-center flex-col items-center justify-center text-center md:w-[min(30vw,15rem)]"
                >
                  <span aria-hidden className="h-10 w-px bg-gold/45" />
                  <h3 className="mt-6 font-serif text-[1.85rem] font-light leading-[1.15] text-ink text-balance md:text-[2.2rem]">
                    {page.chapter.label}
                  </h3>
                  <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.26em] text-bronze text-balance">
                    {page.chapter.note}
                  </p>
                  <span aria-hidden className="mt-6 h-10 w-px bg-gold/45" />
                </div>
              );
            }

            if (page.kind === "quote") {
              return (
                <div
                  key={page.key}
                  data-page
                  className="flex h-full w-[min(70vw,17rem)] shrink-0 snap-center flex-col items-center justify-center text-center md:w-[min(34vw,20rem)]"
                >
                  <p className="font-serif text-[1.5rem] font-light italic leading-[1.35] text-ink/75 text-balance md:text-[1.85rem]">
                    {site.gallery.quote}
                  </p>
                  <span aria-hidden className="mt-6 block h-px w-14 bg-gold/60" />
                  <p className="mt-6 font-script text-[1.6rem] leading-none text-bronze">
                    M & J
                  </p>
                </div>
              );
            }

            return (
              <button
                key={page.key}
                data-page
                type="button"
                onClick={() => setOpenAt(page.index)}
                aria-label={`Ampliar foto: ${page.photo.caption}`}
                className="group relative h-full shrink-0 snap-center overflow-hidden rounded-[4px] border border-white/70 bg-white/85 p-2 shadow-[0_22px_50px_-30px_rgba(27,27,27,0.6)] transition-shadow duration-700 ease-out-expo hover:shadow-[0_34px_70px_-30px_rgba(27,27,27,0.5)] md:p-2.5"
              >
                <span className="relative block h-full overflow-hidden rounded-[2px]">
                  <Image
                    src={page.photo.src}
                    alt={page.photo.alt}
                    placeholder="blur"
                    sizes="(max-width: 768px) 80vw, 32vw"
                    className="h-full w-auto max-w-none object-cover transition-transform duration-[1500ms] ease-out-expo group-hover:scale-[1.04]"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  />
                  <span className="pointer-events-none absolute inset-x-4 bottom-4 text-left text-[10px] font-medium uppercase tracking-[0.28em] text-cream opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                    {page.photo.caption}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* En móvil manda el gesto; las flechas aparecen de tablet arriba. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-4 md:flex">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={atStart}
            aria-label="Fotos anteriores"
            className="pointer-events-auto grid size-11 place-items-center rounded-full border border-ink/12 bg-cream/85 text-ink/70 shadow-[0_10px_26px_-16px_rgba(27,27,27,0.6)] backdrop-blur-sm transition-all duration-500 hover:border-gold/60 hover:text-ink disabled:pointer-events-none disabled:opacity-0"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={atEnd}
            aria-label="Fotos siguientes"
            className="pointer-events-auto grid size-11 place-items-center rounded-full border border-ink/12 bg-cream/85 text-ink/70 shadow-[0_10px_26px_-16px_rgba(27,27,27,0.6)] backdrop-blur-sm transition-all duration-500 hover:border-gold/60 hover:text-ink disabled:pointer-events-none disabled:opacity-0"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        </div>
      </Reveal>

      <div className="relative mx-auto mt-8 max-w-6xl px-5 md:px-8">
        <div
          aria-hidden
          className="mx-auto h-px w-full max-w-[13rem] overflow-hidden bg-ink/10"
        >
          <span
            className="block h-full w-1/3 origin-left rounded-full bg-bronze/70 transition-transform duration-200 ease-out"
            style={{ transform: `translateX(${progress * 200}%)` }}
          />
        </div>
        <p className="mt-5 text-center text-[10px] font-medium uppercase tracking-[0.26em] text-ink/40">
          {site.gallery.hint}
        </p>
      </div>

      {openAt !== null && (
        <Lightbox
          items={photos}
          index={openAt}
          onIndexChange={setOpenAt}
          onClose={() => setOpenAt(null)}
        />
      )}
    </section>
  );
}
