"use client";

import { gsap } from "gsap";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "@/components/providers/LenisProvider";

export type LightboxItem = {
  src: StaticImageData;
  alt: string;
  caption?: string;
};

type Props = {
  items: readonly LightboxItem[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

const SWIPE_THRESHOLD = 45;

/* ————————————————————————————————————————————————
   Visor a pantalla completa. Aquí el fondo oscuro sí funciona:
   es una capa sobre la página, no un corte entre secciones.
   ———————————————————————————————————————————————— */
export function Lightbox({ items, index, onIndexChange, onClose }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  /** +1 avanza, -1 retrocede: define desde qué lado entra la foto. */
  const direction = useRef(1);
  const touchStartX = useRef<number | null>(null);

  /* Se resuelve ya en el primer render del cliente. Con `useState(false)` +
     efecto, el primer render devolvía null y los refs llegaban vacíos a los
     layout effects: la animación de entrada y el foco inicial no ocurrían. */
  const [mounted] = useState(() => typeof document !== "undefined");
  const { stop, start } = useLenis();

  const photo = items[index];
  const total = items.length;

  /* Bloquea el scroll de la página mientras el visor está abierto. */
  useEffect(() => {
    stop();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      start();
    };
  }, [start, stop]);

  const close = useCallback(() => {
    if (closing.current) {
      return;
    }
    closing.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      onClose();
      return;
    }
    gsap
      .timeline({ onComplete: onClose })
      .to(figureRef.current, {
        opacity: 0,
        scale: 0.96,
        y: 12,
        duration: 0.26,
        ease: "power2.in",
      })
      .to(backdropRef.current, { opacity: 0, duration: 0.24 }, "<0.04");
  }, [onClose]);

  const go = useCallback(
    (delta: number) => {
      if (total < 2) {
        return;
      }
      direction.current = delta;
      onIndexChange((index + delta + total) % total);
    },
    [index, onIndexChange, total],
  );

  /* Entrada del fondo. Siempre `fromTo`: `from` toma el estado actual como
     destino, así que si el efecto se vuelve a ejecutar (StrictMode monta,
     desmonta y vuelve a montar) anima de 0 a 0 y deja el elemento invisible. */
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.34, ease: "power2.out" },
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  /* La figura la anima un único efecto — al abrir y en cada cambio de foto —
     para que no haya dos tweens disputándose las mismas propiedades. */
  useLayoutEffect(() => {
    const figure = figureRef.current;
    if (!figure || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        figure,
        { opacity: 0, scale: 0.96, x: direction.current * 34 },
        { opacity: 1, scale: 1, x: 0, duration: 0.5, ease: "expo.out" },
      );
    }, figure);
    return () => ctx.revert();
  }, [index]);

  /* Teclado: Esc cierra, flechas navegan, Tab circula dentro del visor. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
        return;
      }
      if (event.key !== "Tab") {
        return;
      }
      const focusables = rootRef.current?.querySelectorAll<HTMLElement>("button");
      if (!focusables || focusables.length === 0) {
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, go]);

  /* Devuelve el foco a la miniatura de origen al cerrar. */
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    rootRef.current?.focus();
    return () => opener?.focus?.();
  }, []);

  if (!mounted || !photo) {
    return null;
  }

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ${index + 1} de ${total}: ${photo.alt}`}
      tabIndex={-1}
      className="fixed inset-0 z-[120] flex items-center justify-center outline-none"
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const startX = touchStartX.current;
        touchStartX.current = null;
        if (startX === null) {
          return;
        }
        const deltaX = (event.changedTouches[0]?.clientX ?? startX) - startX;
        if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
          go(deltaX < 0 ? 1 : -1);
        }
      }}
    >
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-ink/95 backdrop-blur-md"
        onClick={close}
      />

      <button
        type="button"
        onClick={close}
        aria-label="Cerrar galería"
        className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full border border-cream/25 text-cream/80 transition-colors duration-300 hover:border-cream/60 hover:bg-cream/10 hover:text-cream md:right-7 md:top-7"
      >
        <X size={19} strokeWidth={1.6} />
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Foto anterior"
            className="absolute left-2 z-10 grid size-11 place-items-center rounded-full border border-cream/20 text-cream/70 transition-colors duration-300 hover:border-cream/60 hover:bg-cream/10 hover:text-cream md:left-7 md:size-13"
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Foto siguiente"
            className="absolute right-2 z-10 grid size-11 place-items-center rounded-full border border-cream/20 text-cream/70 transition-colors duration-300 hover:border-cream/60 hover:bg-cream/10 hover:text-cream md:right-7 md:size-13"
          >
            <ChevronRight size={22} strokeWidth={1.5} />
          </button>
        </>
      )}

      <figure
        ref={figureRef}
        className="relative z-[5] flex max-h-full flex-col items-center gap-5 px-4 py-14 md:px-24 md:py-16"
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          placeholder="blur"
          quality={88}
          sizes="(max-width: 768px) 88vw, 74vw"
          className="h-auto max-h-[74vh] w-auto rounded-[14px] object-contain shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]"
        />

        <figcaption className="flex flex-col items-center gap-2 text-center">
          {photo.caption && (
            <span className="font-serif text-xl font-light italic text-cream/90 md:text-2xl">
              {photo.caption}
            </span>
          )}
          <span className="text-[11px] font-medium uppercase tracking-[0.34em] text-gold/80">
            {index + 1} / {total}
          </span>
        </figcaption>
      </figure>
    </div>,
    document.body,
  );
}
