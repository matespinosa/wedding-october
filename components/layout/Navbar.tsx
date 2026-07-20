"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useLenis } from "@/components/providers/LenisProvider";
import { useSiteReady } from "@/components/providers/load-context";
import { RoseBloom } from "@/components/ui/Florals";
import { site } from "@/lib/content";
import { useActiveSection } from "@/lib/hooks";
import { EASE_CURTAIN, EASE_OUT, springSnappy } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function Navbar() {
  const ready = useSiteReady();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollTo, stop, start } = useLenis();

  const ids = useMemo(() => site.nav.map((l) => l.href.slice(1)), []);
  const active = useActiveSection(ids);

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 48));

  // Bloquea el scroll mientras el menú móvil está abierto
  useEffect(() => {
    if (open) {
      stop();
      document.documentElement.classList.add("overflow-hidden");
    } else {
      start();
      document.documentElement.classList.remove("overflow-hidden");
    }
    return () => document.documentElement.classList.remove("overflow-hidden");
  }, [open, stop, start]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Si el viewport cambia a desktop, el panel móvil nunca debe quedar abierto
  // ni conservar el bloqueo de scroll.
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const onChange = () => media.matches && setOpen(false);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setOpen(false);
    // El menú detiene Lenis mientras está abierto. Esperamos al siguiente
    // frame para que el cierre quite el bloqueo antes de iniciar el scroll.
    start();
    window.requestAnimationFrame(() => scrollTo(href));
  };

  return (
    <>
      {/* Indicador de progreso de lectura */}
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-gold via-gold-deep to-gold"
      />

      <motion.header
        initial={{ y: -72, opacity: 0 }}
        animate={ready ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 1, ease: EASE_OUT, delay: 0.25 }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled && !open
            ? "border-b border-ink/[0.06] bg-cream/80 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav
          aria-label="Principal"
          className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-[76px] md:px-8"
        >
          <a
            href="#inicio"
            onClick={(e) => go(e, "#inicio")}
            className="font-serif text-2xl tracking-wide text-ink"
            aria-label="Volver al inicio"
          >
            M<span className="italic text-gold">&amp;</span>J
          </a>

          {/* Desktop */}
          <ul className="hidden items-center gap-9 md:flex">
            {site.nav.map((link) => {
              const id = link.href.slice(1);
              const isActive = active === id;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => go(e, link.href)}
                    className={cn(
                      "relative py-2 text-[13px] tracking-[0.08em] transition-colors duration-300",
                      isActive ? "text-ink" : "text-ink/50 hover:text-ink",
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        transition={springSnappy}
                        className="absolute -bottom-0.5 left-0 right-0 h-px bg-gold"
                      />
                    )}
                  </a>
                </li>
              );
            })}
            <li>
              <a
                href="#rsvp"
                onClick={(e) => go(e, "#rsvp")}
                className="group relative inline-flex items-center overflow-hidden rounded-full border border-ink/20 px-5 py-2.5 text-[10px] uppercase tracking-[0.22em] text-ink transition-colors duration-500 hover:border-ink"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-500 ease-out-expo group-hover:scale-y-100"
                />
                <span className="relative z-10 transition-colors duration-500 group-hover:text-cream">
                  Confirmar
                </span>
              </a>
            </li>
          </ul>

          {/* Hamburguesa */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="relative grid size-11 place-items-center md:hidden"
          >
            <span
              className={cn(
                "absolute h-px w-6 bg-ink transition-all duration-500 ease-out-expo",
                open ? "rotate-45" : "-translate-y-[4.5px]",
              )}
            />
            <span
              className={cn(
                "absolute h-px w-6 bg-ink transition-all duration-500 ease-out-expo",
                open ? "-rotate-45" : "translate-y-[4.5px]",
              )}
            />
          </button>
        </nav>
      </motion.header>

      {/* Menú móvil */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-movil"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.85, ease: EASE_CURTAIN }}
            className="fixed inset-0 z-40 flex flex-col justify-between overflow-hidden bg-cream px-8 pb-10 pt-32 md:hidden"
          >
            <RoseBloom className="pointer-events-none absolute -bottom-16 -right-16 h-80 rotate-[15deg] text-gold/15" />
            <nav aria-label="Menú móvil">
              <ul className="flex flex-col gap-2">
                {site.nav.map((link, i) => (
                  <li key={link.href} className="overflow-hidden">
                    <motion.div
                      initial={{ y: 56, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 40, opacity: 0 }}
                      transition={{
                        duration: 0.8,
                        ease: EASE_OUT,
                        delay: 0.25 + i * 0.07,
                      }}
                    >
                      <a
                        href={link.href}
                        onClick={(e) => go(e, link.href)}
                        className="group flex items-baseline gap-4 py-3"
                      >
                        <span className="text-[11px] tracking-[0.3em] text-bronze">
                          0{i + 1}
                        </span>
                        <span className="font-serif text-5xl font-light text-ink transition-colors duration-300 group-active:text-gold-deep">
                          {link.label}
                        </span>
                      </a>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="relative flex flex-col gap-2.5"
            >
              <p className="font-serif text-xl italic text-ink/70">
                {site.couple.full}
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-ink/40">
                {site.date.short} · {site.date.city}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
