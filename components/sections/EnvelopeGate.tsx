"use client";

import { gsap } from "gsap";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLenis } from "@/components/providers/LenisProvider";
import { FloralBranch } from "@/components/ui/Florals";
import { site } from "@/lib/content";

/* ————————————————————————————————————————————————
   Puerta de entrada: un sobre cerrado y lacrado.

   Lo que sale del sobre NO es una maqueta: es el sitio real.
   El contenido vive dentro de `stage`, recortado y escalado al
   hueco del sobre. Al abrir, la solapa gira proyectando su sombra,
   la página se desliza fuera y se expande hasta ocupar la pantalla;
   recién ahí el recorte se suelta y el scroll se libera.

   Dos formatos:
   · portrait  — móvil: el sobre ocupa toda la pantalla, la solapa
                 baja en uve suave y el lacre se apoya en el vértice.
   · landscape — desde 768px: sobre apaisado de cuatro solapas.
   ———————————————————————————————————————————————— */

type Variant = "portrait" | "landscape";

type EnvelopeCfg = {
  /** Vértice (en % de la altura) donde se apoya el lacre. */
  tip: number;
  box: string;
  /** Hueco interior, en fracción de la caja: de ahí sale la página. */
  slot: { x: number; y: number; w: number; h: number };
  clip: {
    top: string;
    /** Apaisado: las tres solapas restantes. */
    left?: string;
    right?: string;
    bottom?: string;
    /** Vertical: un único cuerpo. */
    body?: string;
  };
};

const GEO: Record<Variant, EnvelopeCfg> = {
  landscape: {
    tip: 58,
    box: "relative aspect-[1.44/1] w-[min(88vw,34rem)] rounded-[10px]",
    slot: { x: 0.06, y: 0.05, w: 0.88, h: 0.89 },
    clip: {
      top: "polygon(0% 0%, 100% 0%, 50% 58%)",
      left: "polygon(0% 0%, 50% 58%, 0% 100%)",
      right: "polygon(100% 0%, 50% 58%, 100% 100%)",
      bottom: "polygon(0% 100%, 50% 58%, 100% 100%)",
    },
  },
  portrait: {
    tip: 56,
    box: "relative h-full w-full",
    slot: { x: 0.08, y: 0.26, w: 0.84, h: 0.7 },
    clip: {
      /** Solapa a sangre con el borde inferior en uve suave. */
      top: "polygon(0% 0%, 100% 0%, 100% 46%, 50% 56%, 0% 46%)",
      /** Cuerpo del sobre, con la uve complementaria. */
      body: "polygon(0% 45%, 50% 55%, 100% 45%, 100% 100%, 0% 100%)",
    },
  },
};

const LAYER = "pointer-events-none fixed inset-0 [perspective:1700px]";
const CENTER = "absolute inset-0 grid place-items-center";

type Geo = {
  x: number;
  y: number;
  s: number;
  insetX: number;
  insetY: number;
  radius: number;
  envH: number;
};

export function EnvelopeGate({
  onOpen,
  children,
}: {
  /** Se dispara cuando la página empieza a salir del sobre. */
  onOpen: () => void;
  children: ReactNode;
}) {
  const { stop, start, scrollTo } = useLenis();
  const [gone, setGone] = useState(false);
  /* El servidor siempre pinta el formato apaisado; un layout effect lo
     corrige antes del primer pintado, así no hay salto ni desajuste de
     hidratación. */
  const [variant, setVariant] = useState<Variant>("landscape");
  const variantRef = useRef<Variant>("landscape");

  const veilRef = useRef<HTMLDivElement>(null);
  const backLayerRef = useRef<HTMLDivElement>(null);
  const backBoxRef = useRef<HTMLDivElement>(null);
  const stageLayerRef = useRef<HTMLDivElement>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frontLayerRef = useRef<HTMLDivElement>(null);
  const frontBoxRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const flapBackRef = useRef<HTMLSpanElement>(null);
  const flapShadowRef = useRef<HTMLSpanElement>(null);
  const flapShadowInnerRef = useRef<HTMLSpanElement>(null);
  const flapTextRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLButtonElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);

  const geoRef = useRef<Geo | null>(null);
  const stRef = useRef({ p: 0, pull: 0 });
  const flapRef2 = useRef({ deg: 0 });
  const openedRef = useRef(false);
  const idleRef = useRef<gsap.core.Tween[]>([]);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  /* ——— Geometría: dónde y con qué escala vive la página dentro del sobre.
     Se calcula sin leer transforms (offsetWidth + centrado), así que es
     estable aunque el sobre esté animándose. ——— */
  const measure = useCallback((): Geo | null => {
    const box = frontBoxRef.current;
    if (!box) return null;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const envW = box.offsetWidth;
    const envH = box.offsetHeight;
    /* Sin layout todavía: mejor no escribir nada que escribir NaN. */
    if (!envW || !envH || !vw || !vh) return null;

    const slot = GEO[variantRef.current].slot;
    const cardW = envW * slot.w;
    const cardH = envH * slot.h;
    const cardX = (vw - envW) / 2 + envW * slot.x;
    const cardY = (vh - envH) / 2 + envH * slot.y;

    /* «cover»: la página llena el hueco sin bandas; lo que sobra se recorta. */
    const s = Math.max(cardW / vw, cardH / vh);
    const cropX = (vw * s - cardW) / 2;
    const cropY = (vh * s - cardH) / 2;

    return {
      x: cardX - cropX,
      y: cardY - cropY,
      s,
      insetX: cropX / s,
      insetY: cropY / s,
      radius: 8 / s,
      envH,
    };
  }, []);

  /** Pinta el estado de la página: p=0 dentro del sobre, p=1 a pantalla completa. */
  const render = useCallback(() => {
    const g = geoRef.current;
    const stage = stageRef.current;
    if (!stage) return;
    if (!g) {
      /* Aún sin medidas: ocultar antes que mostrar la página entera. */
      stage.style.visibility = "hidden";
      return;
    }
    stage.style.visibility = "";

    const { p, pull } = stRef.current;
    const e = 1 - p;

    /* Escritura directa al estilo, no `gsap.set`: GSAP cachea la matriz del
       elemento y omitiría la escritura si otro revert la hubiera borrado. */
    const x = g.x * e;
    const y = (g.y - pull) * e;
    const scale = g.s + (1 - g.s) * p;

    stage.style.transformOrigin = "0 0";
    stage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    stage.style.clipPath = `inset(${g.insetY * e}px ${g.insetX * e}px ${
      g.insetY * e
    }px ${g.insetX * e}px round ${g.radius * e}px)`;
  }, []);

  /* ——— Solapa: giro + sombra proyectada.
     La sombra nace del pliegue, crece y se difumina mientras la solapa se
     levanta, y desaparece cuando queda tumbada por detrás. ——— */
  const renderFlap = useCallback(() => {
    const deg = flapRef2.current.deg;
    const t = Math.min(1, Math.abs(deg) / 180);
    /* 0 cerrada → 1 a media apertura → 0 completamente abierta. */
    const lift = Math.sin(t * Math.PI);

    const flap = flapRef.current;
    if (flap) {
      flap.style.transform = `rotateX(${deg}deg)`;
      /* Sombra de contacto: sigue el filo en uve del recorte y se
         despega del papel a medida que la solapa se levanta. */
      const contact = 1 - Math.min(1, t * 3);
      flap.style.filter = `drop-shadow(0 ${4 + 5 * lift}px ${
        5 + 9 * lift
      }px rgba(88, 66, 38, ${0.3 * contact + 0.12 * lift}))`;
    }

    /* Sombra proyectada sobre el cuerpo: nace en el pliegue, se difumina
       y se acorta según la solapa se aleja. */
    const shadow = flapShadowRef.current;
    if (shadow) {
      shadow.style.opacity = String(0.38 * lift);
      shadow.style.filter = `blur(${10 + 22 * lift}px)`;
    }
    const shadowInner = flapShadowInnerRef.current;
    if (shadowInner) shadowInner.style.transform = `scaleY(${1 - 0.6 * t})`;

    /* Pasado el ecuador vemos el reverso del papel, que está en sombra. */
    const back = flapBackRef.current;
    if (back) back.style.opacity = String(Math.max(0, (t - 0.45) / 0.55) * 0.42);
  }, []);

  /* Formato según viewport, resuelto antes del primer pintado. */
  useLayoutEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const apply = () => {
      const next: Variant = media.matches ? "landscape" : "portrait";
      variantRef.current = next;
      setVariant(next);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  /* Estado inicial antes del primer pintado: nada de destellos de página. */
  useLayoutEffect(() => {
    if (!stageRef.current) return;
    geoRef.current = measure();
    render();
    renderFlap();
  }, [measure, render, renderFlap, variant]);

  /* ——— Apertura ——— */
  const open = useCallback(() => {
    if (openedRef.current) return;
    openedRef.current = true;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const k = reduced ? 0.001 : 1;

    idleRef.current.forEach((t) => t.kill());
    idleRef.current = [];

    geoRef.current = measure();
    const g = geoRef.current;
    /* Cuánto asoma la página: nunca tanto como para salirse por arriba. */
    const pullTo = g ? Math.max(0, Math.min(g.envH * 0.62, g.y - 16)) : 0;
    const st = stRef.current;

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        gsap.set([stageWrapRef.current, stageLayerRef.current], {
          clearProps: "all",
        });
        stageRef.current?.removeAttribute("style");
        stageWrapRef.current?.removeAttribute("style");
        stageLayerRef.current?.removeAttribute("style");
        setGone(true);
        document.documentElement.classList.remove("overflow-hidden");
        /* El gesto que abrió la carta no debe arrastrar el sitio. */
        window.scrollTo(0, 0);
        scrollTo(0, { offset: 0, immediate: true });
        start();
      },
    });

    tl
      /* El lacre respira y se rompe */
      .to(sealRef.current, { scale: 1.14, duration: 0.22 * k, ease: "power2.out" })
      .to(
        [hintRef.current, eyebrowRef.current],
        { opacity: 0, y: 10, duration: 0.3 * k },
        0,
      )
      .to(sealRef.current, {
        scale: 0.45,
        opacity: 0,
        y: -46,
        rotate: -34,
        filter: "blur(5px)",
        duration: 0.55 * k,
        ease: "power3.in",
      })
      /* El texto de la solapa se apaga antes de que el papel se voltee */
      .to(flapTextRef.current, { opacity: 0, duration: 0.3 * k }, "<")
      /* La solapa se abre hacia atrás sobre su bisagra superior,
         arrastrando su sombra sobre el cuerpo del sobre */
      .to(
        flapRef2.current,
        {
          deg: -178,
          duration: 1.05 * k,
          ease: "power3.inOut",
          onUpdate: renderFlap,
        },
        "-=0.32",
      )
      /* Pasado el ecuador del giro, la página pasa delante del sobre y
         despierta: el hero ya está animándose mientras asoma. */
      .set(stageLayerRef.current, { zIndex: 84 }, "-=0.55")
      .add(() => onOpenRef.current(), "-=0.55")
      /* Se desliza fuera del sobre… */
      .to(
        st,
        {
          pull: pullTo,
          duration: 1 * k,
          ease: "power3.out",
          onUpdate: render,
        },
        "-=0.5",
      )
      /* …y se expande hasta ocupar la pantalla */
      .to(
        st,
        { p: 1, duration: 1.25 * k, ease: "power2.inOut", onUpdate: render },
        "-=0.35",
      )
      .to(
        [veilRef.current, backLayerRef.current, frontLayerRef.current],
        { opacity: 0, duration: 0.8 * k, ease: "power2.inOut" },
        "-=1.05",
      );
  }, [measure, render, renderFlap, scrollTo, start]);

  /* ——— Bloqueo de scroll + entrada del sobre ——— */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Un refresco a media página no debe dejar el sitio desplazado. */
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.classList.add("overflow-hidden");
    stop();

    const onResize = () => {
      if (openedRef.current) return;
      geoRef.current = measure();
      render();
    };
    window.addEventListener("resize", onResize);

    /* La caja del sobre puede llegar a su tamaño después del primer commit
       (fuentes, layout, cambio de formato). Reencajamos en cuanto pase. */
    const ro = new ResizeObserver(onResize);
    if (frontBoxRef.current) ro.observe(frontBoxRef.current);

    /* Tras el montaje (y tras cualquier revert de StrictMode) la página
       debe volver a quedar encajada en el sobre. */
    geoRef.current = measure();
    render();
    const raf = requestAnimationFrame(() => {
      if (openedRef.current) return;
      geoRef.current = measure();
      render();
    });

    const ctx = gsap.context(() => {
      if (reduced) return;

      /* El sobre y la página se mueven como una sola pieza: el mismo
         desplazamiento y escala se aplican a las tres capas. */
      const motion = { off: 44, os: 0.9, rx: 16 };
      const boxes = [
        backBoxRef.current,
        frontBoxRef.current,
        stageWrapRef.current,
      ];
      const applyMotion = () =>
        gsap.set(boxes, {
          y: motion.off,
          scale: motion.os,
          rotateX: motion.rx,
        });
      applyMotion();

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        [backLayerRef.current, stageLayerRef.current, frontLayerRef.current],
        { opacity: 0 },
        { opacity: 1, duration: 0.7 },
      )
        .to(
          motion,
          { off: 0, os: 1, rx: 0, duration: 1.4, onUpdate: applyMotion },
          0,
        )
        .from(eyebrowRef.current, { opacity: 0, y: -14, duration: 0.9 }, "-=0.9")
        .from(flapTextRef.current, { opacity: 0, y: 10, duration: 0.9 }, "-=0.8")
        .from(
          sealRef.current,
          { scale: 0, rotate: -70, opacity: 0, duration: 0.9, ease: "back.out(1.6)" },
          "-=0.55",
        )
        .from(hintRef.current, { opacity: 0, y: 14, duration: 0.8 }, "-=0.4")
        .add(() => {
          /* Vida en reposo: el sobre flota y la pista respira */
          idleRef.current.push(
            gsap.to(motion, {
              off: -12,
              duration: 3.4,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              onUpdate: applyMotion,
            }),
            gsap.to(hintRef.current, {
              opacity: 0.45,
              duration: 1.6,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            }),
          );
        });
    }, veilRef);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      ctx.revert();
      idleRef.current.forEach((t) => t.kill());
      idleRef.current = [];
      document.documentElement.classList.remove("overflow-hidden");
    };
  }, [measure, render, stop]);

  /* Abrir también con scroll, swipe o teclado */
  useEffect(() => {
    if (gone) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) > 4) open();
    };

    let startY = 0;
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const y = e.touches[0]?.clientY ?? 0;
      if (Math.abs(startY - y) > 18) open();
    };

    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " ", "Enter", "Escape", "End"].includes(e.key)) {
        e.preventDefault();
        open();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [gone, open]);

  useEffect(() => {
    if (!gone) sealRef.current?.focus({ preventScroll: true });
  }, [gone]);

  const cfg = GEO[variant];
  const portrait = variant === "portrait";

  const seal = (
    <div
      className="absolute left-1/2 z-40 -translate-x-1/2 -translate-y-1/2"
      style={{ top: `${cfg.tip}%` }}
    >
      <button
        ref={sealRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          open();
        }}
        aria-label={site.gate.hint}
        className="block rounded-full"
      >
        <Image
          src="/images/sello-circular-dorado-transparente.png"
          alt=""
          width={220}
          height={220}
          priority
          className="size-[clamp(4.6rem,19vw,6.5rem)] cursor-pointer drop-shadow-[0_10px_20px_rgba(27,27,27,0.32)] transition-transform duration-500 ease-out-expo hover:scale-[1.07] active:scale-95"
        />
      </button>
    </div>
  );

  const names = (
    <>
      <span className="font-script text-[clamp(2.6rem,13vw,4.4rem)] leading-[0.9] text-bronze md:text-[clamp(1.85rem,3vw,2.45rem)]">
        {site.couple.him}
      </span>
      <span className="font-script text-[clamp(1.4rem,6vw,2.1rem)] leading-[1.1] text-gold-deep md:text-[clamp(1rem,1.6vw,1.3rem)]">
        y
      </span>
      <span className="font-script text-[clamp(2.6rem,13vw,4.4rem)] leading-[0.9] text-bronze md:text-[clamp(1.85rem,3vw,2.45rem)]">
        {site.couple.her}
      </span>
    </>
  );

  return (
    <>
      {!gone && (
        <>
          {/* Fondo */}
          <div
            ref={veilRef}
            role="dialog"
            aria-modal="true"
            aria-label="Invitación de boda de Mateo y Julieth"
            className="fixed inset-0 z-[80] touch-none select-none overscroll-none bg-cream"
          >
            <div aria-hidden className="absolute inset-0 overflow-hidden">
              <div className="animate-drift absolute -left-40 -top-40 size-[40rem] rounded-full bg-gold/[0.14] blur-3xl" />
              <div className="animate-drift-slow absolute -bottom-48 -right-32 size-[44rem] rounded-full bg-sand/60 blur-3xl" />

              {/* Botánica de encuadre — solo dos esquinas, bien suaves */}
              <div className="hidden md:block">
                <FloralBranch className="absolute -left-16 -top-14 h-[22rem] -rotate-[142deg] text-gold/15" />
                <FloralBranch className="absolute -bottom-20 -right-14 h-[20rem] rotate-[24deg] text-gold/12" />
              </div>

              <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_45%,transparent,rgba(27,27,27,0.07))]" />
            </div>
          </div>

          {/* Capa trasera: el papel del sobre por detrás de la página */}
          <div ref={backLayerRef} className={`${LAYER} z-[81]`}>
            <div className={CENTER}>
              <div ref={backBoxRef} className={cfg.box}>
                {!portrait && (
                  <span
                    aria-hidden
                    className="absolute -bottom-6 left-1/2 h-10 w-[86%] -translate-x-1/2 rounded-[50%] bg-ink/20 blur-2xl"
                  />
                )}

                <span
                  aria-hidden
                  className={`paper absolute inset-0 ${
                    portrait
                      ? ""
                      : "rounded-[10px] shadow-[0_40px_90px_-45px_rgba(27,27,27,0.55)]"
                  }`}
                />
                {/* Boca del sobre: penumbra interior donde descansa la tarjeta */}
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(90,68,42,0.16),transparent_28%)]"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* La página real. Mientras la carta está cerrada vive recortada y
          escalada dentro del sobre; al abrirse se suelta y vuelve al flujo. */}
      <div
        ref={stageLayerRef}
        className={gone ? undefined : "fixed inset-0 z-[82] [perspective:1700px]"}
      >
        <div ref={stageWrapRef} className={gone ? undefined : "absolute inset-0"}>
          <div
            ref={stageRef}
            className={
              gone ? undefined : "absolute left-0 top-0 h-full w-full overflow-hidden"
            }
          >
            {children}
          </div>
        </div>
      </div>

      {!gone && (
        /* Capa delantera: cuerpo del sobre, solapa y lacre — tapa la página */
        <div ref={frontLayerRef} className={`${LAYER} z-[83]`}>
          <div className={CENTER}>
            <div
              ref={frontBoxRef}
              onClick={open}
              className={`${cfg.box} pointer-events-auto cursor-pointer`}
            >
              {portrait ? (
                /* ——— Cuerpo del sobre en vertical ——— */
                <>
                  <span
                    aria-hidden
                    className="paper paper-shade-b absolute inset-0 z-20"
                    style={{ clipPath: cfg.clip.body }}
                  />
                  {/* Volumen: penumbra en la boca y asiento en el canto bajo */}
                  <span
                    aria-hidden
                    className="absolute inset-0 z-[21] bg-[linear-gradient(to_bottom,rgba(120,92,56,0.11),transparent_24%,transparent_80%,rgba(120,92,56,0.08))]"
                    style={{ clipPath: cfg.clip.body }}
                  />
                </>
              ) : (
                <>
                  <span
                    aria-hidden
                    className="paper paper-shade-l absolute inset-0 z-[18]"
                    style={{ clipPath: cfg.clip.left }}
                  />
                  <span
                    aria-hidden
                    className="paper paper-shade-r absolute inset-0 z-[18]"
                    style={{ clipPath: cfg.clip.right }}
                  />
                  <span
                    aria-hidden
                    className="paper paper-shade-b absolute inset-0 z-20"
                    style={{ clipPath: cfg.clip.bottom }}
                  />
                  {/* Costuras de los dobleces */}
                  <svg
                    aria-hidden
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 z-[24] size-full"
                  >
                    <path
                      d={`M0,100 L50,${cfg.tip} L100,100 M0,0 L50,${cfg.tip} L100,0`}
                      fill="none"
                      stroke="rgba(27,27,27,0.08)"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </>
              )}

              {/* Texto del cuerpo, bajo el lacre — solo en vertical */}
              {portrait && (
                <div className="absolute inset-x-0 bottom-0 top-[56%] z-[25] flex flex-col items-center gap-6 px-8 pt-[14%] text-center">
                  <p className="text-[13px] font-medium uppercase leading-[2] tracking-[0.34em] text-bronze">
                    {site.gate.portraitLine}
                  </p>
                  <FloralBranch aria-hidden className="h-20 rotate-90 text-gold/45" />
                </div>
              )}

              {/* Sombra proyectada de la solapa sobre el cuerpo del sobre.
                  El desenfoque vive en el envoltorio: si fuera sobre el
                  elemento recortado, el `clip-path` volvería a cortar el
                  difuminado y el borde saldría duro. */}
              <span
                ref={flapShadowRef}
                aria-hidden
                className="pointer-events-none absolute inset-0 z-[28] opacity-0"
              >
                <span
                  ref={flapShadowInnerRef}
                  className="absolute inset-0 origin-top bg-[linear-gradient(to_bottom,rgba(72,50,26,0.88),rgba(72,50,26,0.34)_15%,transparent_38%)]"
                  style={{ clipPath: cfg.clip.top }}
                />
              </span>

              {/* Solapa superior, con los nombres */}
              <div
                ref={flapRef}
                className="paper paper-shade-t absolute inset-0 z-30 origin-top will-change-transform"
                style={{ clipPath: cfg.clip.top }}
              >
                {/* Reverso en penumbra: aparece al pasar el ecuador del giro */}
                <span
                  ref={flapBackRef}
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(to_top,rgba(58,42,22,0.9),rgba(58,42,22,0.45))] opacity-0"
                />

                {/* Canto del papel: una línea de luz sobre el filo doblado */}
                <svg
                  aria-hidden
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 size-full"
                >
                  <path
                    d={
                      portrait
                        ? "M0,45.3 L50,55.3 L100,45.3"
                        : `M0,0.6 L50,${cfg.tip - 0.8} L100,0.6`
                    }
                    fill="none"
                    stroke="rgba(255,252,246,0.6)"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                <div
                  ref={flapTextRef}
                  className={
                    portrait
                      ? "relative flex h-[46%] flex-col items-center justify-center gap-6 px-10 pb-2 pt-[14%] text-center leading-none"
                      : "relative flex h-[58%] flex-col items-center justify-center px-[20%] pb-[15%] pt-[6%] leading-none"
                  }
                >
                  <span className="flex flex-col items-center leading-none">
                    {names}
                  </span>
                </div>
              </div>

              {seal}

              {/* Rótulo superior. Sin `translate` de Tailwind: GSAP anima estos
                  nodos y hornearía el desplazamiento en su matriz. */}
              <div
                ref={eyebrowRef}
                className={
                  portrait
                    ? "absolute inset-x-0 top-[6%] z-[31] flex items-center justify-center gap-3 text-[11px] font-medium uppercase tracking-[0.36em] text-bronze"
                    : "absolute inset-x-0 -top-14 flex items-center justify-center gap-4 whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.4em] text-bronze"
                }
              >
                <span aria-hidden className="h-px w-6 bg-gold/70 md:w-8" />
                {site.gate.eyebrow}
                <span aria-hidden className="h-px w-6 bg-gold/70 md:w-8" />
              </div>

              {/* Invitación a abrir */}
              <div
                ref={hintRef}
                className={
                  portrait
                    ? "absolute inset-x-0 bottom-[6%] z-[31] flex flex-col items-center gap-3"
                    : "absolute inset-x-0 -bottom-24 flex flex-col items-center gap-3"
                }
              >
                <p className="whitespace-nowrap text-center text-[13px] font-medium uppercase tracking-[0.32em] text-bronze md:text-[14px]">
                  {site.gate.hint}
                </p>
                <span
                  aria-hidden
                  className="block h-10 w-px overflow-hidden bg-ink/10"
                >
                  <span className="animate-scroll-hint block h-full w-full bg-gold" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
