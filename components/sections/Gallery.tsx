"use client";

import { gsap } from "gsap";
import Image from "next/image";
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { FloralBranch } from "@/components/ui/Florals";
import { Lightbox } from "@/components/ui/Lightbox";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/lib/content";
import { cn } from "@/lib/utils";

const { chapters, photos } = site.gallery;
/** Cada foto se inclina un poco, como copias reveladas sobre la mesa. */
const TILTS = [-1.1, 0.9, -0.6, 1.2, -0.9, 0.5, -1.3, 0.7];

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Gallery() {
  const gridRef = useRef<HTMLDivElement>(null);
  /** La primera entrada se dispara con el scroll; los filtros, al instante. */
  const firstPass = useRef(true);
  const filtering = useRef(false);

  const [chapter, setChapter] = useState<string>(chapters[0].id);
  const [openAt, setOpenAt] = useState<number | null>(null);

  const visible = useMemo(
    () =>
      chapter === chapters[0].id
        ? [...photos]
        : photos.filter((photo) => photo.chapter === chapter),
    [chapter],
  );

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) {
      return;
    }
    const tiles = gsap.utils.toArray<HTMLElement>("[data-tile]", grid);
    if (tiles.length === 0) {
      return;
    }

    if (reducedMotion()) {
      firstPass.current = false;
      filtering.current = false;
      return;
    }

    let observer: IntersectionObserver | undefined;

    const ctx = gsap.context(() => {
      gsap.set(tiles, { opacity: 0, y: 28, scale: 0.97 });

      if (!firstPass.current) {
        gsap.to(tiles, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "expo.out",
          stagger: 0.045,
          onComplete: () => {
            filtering.current = false;
          },
        });
        return;
      }

      firstPass.current = false;

      /* IntersectionObserver en vez de ScrollTrigger: el sobre de entrada
         bloquea el scroll mientras esta sección se monta debajo, así que
         cualquier medida basada en posición de scroll nace desactualizada. */
      observer = new IntersectionObserver(
        (entries) => {
          const entering = entries
            .filter((entry) => entry.isIntersecting)
            .map((entry) => entry.target);
          if (entering.length === 0) {
            return;
          }
          entering.forEach((tile) => observer?.unobserve(tile));
          gsap.to(entering, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "expo.out",
            stagger: 0.07,
            overwrite: true,
          });
        },
        { rootMargin: "0px 0px -6% 0px" },
      );
      tiles.forEach((tile) => observer?.observe(tile));
    }, grid);

    return () => {
      observer?.disconnect();
      ctx.revert();
    };
  }, [visible]);

  const changeChapter = useCallback(
    (id: string) => {
      if (id === chapter || filtering.current) {
        return;
      }
      const grid = gridRef.current;
      const tiles = grid
        ? gsap.utils.toArray<HTMLElement>("[data-tile]", grid)
        : [];

      if (tiles.length === 0 || reducedMotion()) {
        setChapter(id);
        return;
      }

      filtering.current = true;
      gsap.to(tiles, {
        opacity: 0,
        y: -12,
        scale: 0.98,
        duration: 0.3,
        ease: "power2.in",
        stagger: 0.02,
        onComplete: () => setChapter(id),
      });
    },
    [chapter],
  );

  return (
    <section
      id="galeria"
      className="relative overflow-hidden bg-gradient-to-b from-cream via-[#ece2d3] to-shell py-24 md:py-32"
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

        {/* Capítulos: filtran el collage con una transición de GSAP. */}
        <Reveal delay={0.2} y={16}>
          <div className="mt-11 flex flex-wrap items-center justify-center gap-2 md:mt-14 md:gap-3">
            {chapters.map((entry) => {
              const active = entry.id === chapter;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => changeChapter(entry.id)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-4 py-2 text-[10px] font-medium uppercase tracking-[0.16em] transition-all duration-500 ease-out-expo md:px-5 md:py-2.5 md:text-[11px] md:tracking-[0.24em]",
                    active
                      ? "border-ink bg-ink text-cream shadow-[0_16px_34px_-20px_rgba(27,27,27,0.9)]"
                      : "border-ink/15 bg-white/50 text-ink/55 hover:border-gold/60 hover:bg-white/80 hover:text-ink",
                  )}
                >
                  {entry.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Mosaico: dos columnas en móvil, tres en escritorio. Cada foto
            conserva su proporción original, sin recortes forzados. */}
        <div
          ref={gridRef}
          className="mt-10 columns-2 gap-3 md:mt-14 md:columns-3 md:gap-5"
        >
          {visible.map((photo, index) => (
            <div
              key={photo.src.src}
              className="group mb-3 break-inside-avoid [transform:rotate(var(--tilt))] transition-transform duration-[900ms] ease-out-expo hover:z-10 hover:[transform:rotate(0deg)_translateY(-8px)] md:mb-5"
              style={{ "--tilt": `${TILTS[index % TILTS.length]}deg` } as CSSProperties}
            >
              <button
                data-tile
                type="button"
                onClick={() => setOpenAt(index)}
                aria-label={`Ampliar foto: ${photo.caption}`}
                className="block w-full overflow-hidden rounded-[16px] border border-white/70 bg-white/85 p-1.5 shadow-[0_18px_44px_-28px_rgba(27,27,27,0.55)] transition-shadow duration-700 group-hover:shadow-[0_36px_74px_-30px_rgba(27,27,27,0.5)] md:rounded-[20px] md:p-2"
              >
                <span className="relative block overflow-hidden rounded-[11px] md:rounded-[14px]">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    placeholder="blur"
                    sizes="(max-width: 768px) 46vw, 30vw"
                    className="h-auto w-full transition-transform duration-[1500ms] ease-out-expo group-hover:scale-[1.05]"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-ink/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  />
                  <span className="pointer-events-none absolute inset-x-3 bottom-3 text-left text-[10px] font-medium uppercase tracking-[0.28em] text-cream opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                    {photo.caption}
                  </span>
                </span>
              </button>
            </div>
          ))}
        </div>

        <Reveal delay={0.1} y={14}>
          <p className="mt-8 text-center text-[11px] font-medium uppercase tracking-[0.3em] text-ink/35">
            {site.gallery.hint}
          </p>
        </Reveal>

        <Reveal delay={0.15} y={20} className="mt-16 text-center md:mt-20">
          <p className="mx-auto max-w-xl font-serif text-[clamp(1.7rem,3.6vw,2.6rem)] font-light italic leading-[1.3] text-ink/75 text-balance">
            {site.gallery.quote}
          </p>
          <span aria-hidden className="mx-auto mt-7 block h-px w-16 bg-gold/60" />
        </Reveal>
      </div>

      {openAt !== null && (
        <Lightbox
          items={visible}
          index={openAt}
          onIndexChange={setOpenAt}
          onClose={() => setOpenAt(null)}
        />
      )}
    </section>
  );
}
