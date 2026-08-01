"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarHeart,
  Check,
  Clock,
  LoaderCircle,
  MapPin,
  Plus,
  Send,
  X,
} from "lucide-react";
import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { FloralBranch } from "@/components/ui/Florals";
import { Reveal } from "@/components/ui/Reveal";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RSVP_DEADLINE, site } from "@/lib/content";
import { EASE_OUT, EASE_SOFT } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Entry = { id: number; name: string };
type Note = { text: string; state: "" | "ok" | "error" };
type LookupResponse = {
  matched?: boolean;
  name?: string;
  confirmed?: boolean;
  error?: string;
};

const normalizeName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

function SuccessView({
  name,
  attendance,
  onReset,
}: {
  name: string;
  attendance: "si" | "no";
  onReset: () => void;
}) {
  const firstName = name.trim().split(" ")[0] || "invitado";
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.9, ease: EASE_OUT }}
      className="flex min-h-[26rem] flex-col items-center justify-center py-8 text-center"
    >
      <svg viewBox="0 0 76 76" className="size-20 text-gold-deep" aria-hidden>
        <motion.circle
          cx="38"
          cy="38"
          r="34"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: EASE_SOFT }}
        />
        <motion.path
          d="M24,39 L34,49 L53,29"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: EASE_SOFT, delay: 0.9 }}
        />
      </svg>

      <h3 className="mt-8 font-serif text-4xl font-light text-ink">
        ¡Gracias, <span className="italic text-gold-deep">{firstName}</span>!
      </h3>
      <p className="mx-auto mt-4 max-w-md text-[18px] leading-[1.75] text-ink/65">
        {attendance === "si"
          ? "Hemos recibido tu confirmación. Nos vemos el 3 de octubre para celebrar juntos. 🥂"
          : site.rsvp.success.no}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-8 text-[13px] uppercase tracking-[0.22em] text-bronze underline-offset-4 transition-colors hover:text-ink hover:underline"
      >
        Enviar otra respuesta
      </button>
    </motion.div>
  );
}

/**
 * Confirmación privada contra Google Sheets.
 * La lista completa nunca se descarga al navegador: cada persona se valida
 * por coincidencia exacta y solo entonces aparece en "Personas agregadas".
 */
export function Rsvp() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const nextId = useRef(1);
  const [candidate, setCandidate] = useState("");
  const [lookupStatus, setLookupStatus] = useState<"idle" | "checking">("idle");
  const [lookupNote, setLookupNote] = useState<Note>({
    text: "",
    state: "",
  });
  const [telefono, setTelefono] = useState("");
  const [asistencia, setAsistencia] = useState<"" | "si" | "no">("");
  const [note, setNote] = useState<Note>({ text: "", state: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [done, setDone] = useState<{ name: string; attendance: "si" | "no" }>({
    name: "",
    attendance: "si",
  });
  const candidateRef = useRef<HTMLInputElement>(null);

  const addEntry = async () => {
    if (lookupStatus === "checking") return;

    const name = candidate.replace(/\s+/g, " ").trim();
    if (!name) {
      setLookupNote({
        text: "Escribe tu nombre y apellido para verificarlo.",
        state: "error",
      });
      candidateRef.current?.focus();
      return;
    }

    if (entries.some((entry) => normalizeName(entry.name) === normalizeName(name))) {
      setLookupNote({
        text: "Esta persona ya está agregada a la confirmación.",
        state: "error",
      });
      return;
    }

    setLookupStatus("checking");
    setLookupNote({ text: "Verificando nombre…", state: "" });

    try {
      const response = await fetch(`/api/rsvp?name=${encodeURIComponent(name)}`, {
        cache: "no-store",
      });
      const result = (await response.json()) as LookupResponse;

      if (!response.ok) {
        throw new Error(result.error || "No pudimos verificar el nombre.");
      }

      if (!result.matched) {
        setLookupNote({
          text: "No encontramos una coincidencia. Revisa el nombre y apellido tal como aparecen en tu invitación.",
          state: "error",
        });
        return;
      }

      if (result.confirmed) {
        setLookupNote({
          text: "Esta persona ya registró una respuesta anteriormente.",
          state: "error",
        });
        return;
      }

      const canonicalName = result.name?.trim() || name;
      if (
        entries.some(
          (entry) => normalizeName(entry.name) === normalizeName(canonicalName),
        )
      ) {
        setLookupNote({
          text: "Esta persona ya está agregada a la confirmación.",
          state: "error",
        });
        return;
      }

      setEntries((current) => [
        ...current,
        { id: nextId.current++, name: canonicalName },
      ]);
      setCandidate("");
      setLookupNote({
        text: `${canonicalName} quedó agregado.`,
        state: "ok",
      });
      setNote({ text: "", state: "" });
      candidateRef.current?.focus();
    } catch (error) {
      setLookupNote({
        text:
          error instanceof Error
            ? error.message
            : "No pudimos verificar el nombre. Intenta nuevamente.",
        state: "error",
      });
    } finally {
      setLookupStatus("idle");
    }
  };

  const removeEntry = (id: number) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
    setLookupNote({ text: "", state: "" });
    candidateRef.current?.focus();
  };

  const onCandidateKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void addEntry();
    }
  };

  const resetForm = () => {
    setEntries([]);
    setCandidate("");
    setLookupNote({ text: "", state: "" });
    setTelefono("");
    setAsistencia("");
    setNote({ text: "", state: "" });
    setStatus("idle");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (candidate.trim()) {
      setNote({
        text: "Verifica y agrega el nombre que quedó pendiente antes de enviar.",
        state: "error",
      });
      candidateRef.current?.focus();
      return;
    }

    if (entries.length === 0 || !telefono.trim() || !asistencia) {
      setNote({
        text: "Agrega al menos una persona, el teléfono y si nos acompañas.",
        state: "error",
      });
      return;
    }

    setStatus("sending");
    setNote({ text: "", state: "" });

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombres: entries.map((entry) => entry.name),
          telefono: telefono.trim(),
          asistencia,
        }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || result.ok !== true) {
        throw new Error(
          result.error || "No pudimos guardar tu confirmación. Intenta de nuevo.",
        );
      }

      setDone({ name: entries[0].name, attendance: asistencia });
      setStatus("success");
    } catch (error) {
      setStatus("idle");
      setNote({
        text:
          error instanceof Error
            ? error.message
            : "No pudimos guardar tu confirmación. Intenta de nuevo.",
        state: "error",
      });
    }
  };

  return (
    <section id="rsvp" className="relative">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 pb-28 pt-16 md:px-8 md:pb-40 md:pt-20 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <div className="lg:pt-8">
          <SectionHeading
            align="left"
            eyebrow={site.rsvp.eyebrow}
            title={site.rsvp.title}
          />

          <Reveal delay={0.3} y={18}>
            <ul className="mt-8 space-y-4 text-[18px] text-ink/70">
              <li className="flex items-center gap-3">
                <CalendarHeart
                  size={20}
                  strokeWidth={1.75}
                  className="shrink-0 text-gold-deep"
                />
                {site.date.long}
              </li>
              <li className="flex items-center gap-3">
                <Clock
                  size={20}
                  strokeWidth={1.75}
                  className="shrink-0 text-gold-deep"
                />
                Ceremonia {site.venues.ceremony.time} · Celebración{" "}
                {site.venues.reception.time}
              </li>
              <li className="flex items-center gap-3">
                <MapPin
                  size={20}
                  strokeWidth={1.75}
                  className="shrink-0 text-gold-deep"
                />
                {site.date.city}
              </li>
            </ul>
          </Reveal>

          <Reveal delay={0.4} y={18}>
            <p className="mt-8 inline-block rounded-[16px] border border-gold/40 bg-gold/[0.08] px-5 py-2.5 text-[18px] font-medium tracking-normal text-bronze normal-case">
              Por favor confírmanos antes del {RSVP_DEADLINE}
            </p>
          </Reveal>

          <FloralBranch
            animate
            className="mt-12 hidden h-56 -rotate-12 text-gold/30 lg:block"
          />
        </div>

        <Reveal delay={0.15} y={40} blur={false}>
          <div className="relative rounded-[32px] border border-white/80 bg-white/50 p-7 shadow-[0_60px_150px_-70px_rgba(27,27,27,0.45)] backdrop-blur-2xl md:p-12">
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <SuccessView
                  name={done.name}
                  attendance={done.attendance}
                  onReset={resetForm}
                />
              ) : (
                <motion.form
                  key="form"
                  noValidate
                  onSubmit={onSubmit}
                  exit={{ opacity: 0, y: -18, filter: "blur(6px)" }}
                  transition={{ duration: 0.5, ease: EASE_OUT }}
                  className="space-y-8"
                >
                  <div>
                    <label
                      htmlFor="guest-name"
                      className="mb-3 block text-[12px] font-medium uppercase tracking-[0.22em] text-bronze"
                    >
                      Nombre y apellido
                    </label>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        id="guest-name"
                        ref={candidateRef}
                        type="text"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="Escribe tu nombre completo"
                        className="min-w-0 flex-1 rounded-full border border-gold/50 bg-white/20 px-5 py-3.5 text-[18px] text-ink outline-none backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-300 placeholder:text-ink/60 hover:border-gold/75 hover:bg-white/30 focus:border-bronze focus:bg-white/35 focus:ring-2 focus:ring-gold/30"
                        value={candidate}
                        onChange={(event) => {
                          setCandidate(event.target.value);
                          setLookupNote({ text: "", state: "" });
                        }}
                        onKeyDown={onCandidateKeyDown}
                        aria-describedby="guest-privacy guest-lookup-note"
                      />
                      <button
                        type="button"
                        onClick={() => void addEntry()}
                        disabled={lookupStatus === "checking" || !candidate.trim()}
                        className="inline-flex min-h-[3.5rem] shrink-0 items-center justify-center gap-2 rounded-full bg-bronze px-5 text-[13px] font-medium uppercase tracking-[0.12em] text-cream transition-[background-color,opacity] duration-300 hover:bg-ink disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {lookupStatus === "checking" ? (
                          <LoaderCircle
                            size={16}
                            className="animate-spin"
                            aria-hidden
                          />
                        ) : (
                          <Plus size={16} aria-hidden />
                        )}
                        {lookupStatus === "checking" ? "Verificando" : "Agregar"}
                      </button>
                    </div>

                    <p
                      id="guest-privacy"
                      className="mt-3 text-[15px] leading-relaxed text-ink/65"
                    >
                      La búsqueda es privada: no mostraremos la lista de invitados.
                    </p>

                    <div
                      id="guest-lookup-note"
                      className="min-h-6"
                      aria-live="polite"
                    >
                      {lookupNote.text && (
                        <p
                          className={cn(
                            "mt-2 text-[15px]",
                            lookupNote.state === "ok"
                              ? "text-bronze"
                              : lookupNote.state === "error"
                                ? "text-clay"
                                : "text-ink/60",
                          )}
                        >
                          {lookupNote.state === "ok" && (
                            <Check
                              size={15}
                              strokeWidth={2.2}
                              className="mr-1 inline-block align-[-2px]"
                              aria-hidden
                            />
                          )}
                          {lookupNote.text}
                        </p>
                      )}
                    </div>

                    <AnimatePresence initial={false}>
                      {entries.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-4"
                        >
                          <p className="mb-2 text-[14px] font-medium text-ink/70">
                            Personas agregadas ({entries.length})
                          </p>
                          <ul
                            aria-label="Personas agregadas"
                            className="space-y-2"
                          >
                            <AnimatePresence initial={false}>
                              {entries.map((entry) => (
                                <motion.li
                                  key={entry.id}
                                  layout
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, x: -8 }}
                                  transition={{ duration: 0.25, ease: EASE_OUT }}
                                  className="flex items-center gap-3 rounded-[14px] bg-gold/[0.11] px-4 py-3 text-ink"
                                >
                                  <span
                                    className="flex size-6 shrink-0 items-center justify-center rounded-full bg-bronze text-cream"
                                    aria-hidden
                                  >
                                    <Check size={14} strokeWidth={2.3} />
                                  </span>
                                  <span className="min-w-0 flex-1 text-[17px]">
                                    {entry.name}
                                  </span>
                                  <button
                                    type="button"
                                    aria-label={`Quitar a ${entry.name}`}
                                    onClick={() => removeEntry(entry.id)}
                                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-ink/55 transition-colors hover:bg-white/60 hover:text-ink"
                                  >
                                    <X size={15} aria-hidden />
                                  </button>
                                </motion.li>
                              ))}
                            </AnimatePresence>
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <p className="mt-4 text-[16px] leading-relaxed text-ink/60">
                      {site.rsvp.hint}
                    </p>
                  </div>

                  <label className="block">
                    <span className="mb-3 block text-[12px] font-medium uppercase tracking-[0.22em] text-bronze">
                      Teléfono
                    </span>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+57 300 000 0000"
                      className="w-full rounded-full border border-gold/50 bg-white/20 px-5 py-3.5 text-[18px] text-ink outline-none backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-300 placeholder:text-ink/60 hover:border-gold/75 hover:bg-white/30 focus:border-bronze focus:bg-white/35 focus:ring-2 focus:ring-gold/30"
                      value={telefono}
                      onChange={(event) => setTelefono(event.target.value)}
                    />
                  </label>

                  <fieldset>
                    <legend className="mb-3 text-[15px] font-medium tracking-normal text-bronze normal-case">
                      Confirmar asistencia
                    </legend>
                    <div className="grid grid-cols-2 gap-3">
                      {(
                        [
                          { value: "si", label: "Sí, allí estaré" },
                          { value: "no", label: "No podré asistir" },
                        ] as const
                      ).map((option) => (
                        <label key={option.value} className="cursor-pointer">
                          <input
                            type="radio"
                            name="asistencia"
                            value={option.value}
                            checked={asistencia === option.value}
                            onChange={() => setAsistencia(option.value)}
                            className="peer sr-only"
                          />
                          <span className="flex items-center justify-center rounded-full border border-gold/50 bg-white/20 px-4 py-4 text-center text-[16px] text-ink/75 backdrop-blur-sm transition-all duration-500 hover:border-gold/75 hover:bg-white/30 peer-checked:border-bronze peer-checked:bg-bronze peer-checked:text-cream peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <motion.button
                    type="submit"
                    disabled={status === "sending"}
                    whileTap={{ scale: 0.98 }}
                    className="group relative w-full overflow-hidden rounded-full bg-ink py-4.5 text-[13px] font-medium uppercase tracking-[0.22em] text-cream transition-opacity duration-300 disabled:cursor-wait disabled:opacity-80"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-0 origin-bottom scale-y-0 bg-gold-deep transition-transform duration-500 ease-out-expo group-hover:scale-y-100"
                    />
                    <span className="relative z-10 flex items-center justify-center gap-3 py-0.5">
                      {status === "sending" ? (
                        <span
                          aria-label="Enviando"
                          className="size-4 animate-spin rounded-full border border-cream/30 border-t-cream"
                        />
                      ) : (
                        <>
                          Enviar confirmación
                          <Send
                            size={13}
                            strokeWidth={1.75}
                            className="transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </span>
                  </motion.button>

                  <AnimatePresence>
                    {note.state === "error" && (
                      <motion.p
                        role="alert"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-center text-[15px] text-clay"
                      >
                        {note.text}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>

      <SectionDivider bg="bg-transparent" fill="fill-ink" />
    </section>
  );
}
