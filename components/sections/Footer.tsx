"use client";

import { ArrowUp } from "lucide-react";
import { useLenis } from "@/components/providers/LenisProvider";
import { Magnetic } from "@/components/ui/Magnetic";
import { site } from "@/lib/content";

export function Footer() {
  const { scrollTo } = useLenis();

  return (
    <footer className="relative border-t border-cream/10 bg-ink py-10 text-cream">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 md:flex-row md:px-8">
        <a
          href="#inicio"
          onClick={(e) => {
            e.preventDefault();
            scrollTo(0);
          }}
          className="font-serif text-2xl tracking-wide"
          aria-label="Volver al inicio"
        >
          M<span className="italic text-gold">&amp;</span>J
        </a>

        <p className="text-center text-[12px] uppercase tracking-[0.26em] text-cream/50">
          Hecho a mano, con amor · {site.date.short}
        </p>

        <Magnetic strength={0.35}>
          <button
            type="button"
            onClick={() => scrollTo(0)}
            aria-label="Volver arriba"
            className="grid size-11 place-items-center rounded-full border border-cream/20 text-cream/70 transition-colors duration-500 hover:border-gold hover:text-gold"
          >
            <ArrowUp size={16} strokeWidth={1.5} />
          </button>
        </Magnetic>
      </div>
    </footer>
  );
}
