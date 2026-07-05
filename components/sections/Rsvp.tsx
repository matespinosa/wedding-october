"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarHeart, Clock, MapPin, Plus, Send, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { FloralBranch } from "@/components/ui/Florals";
import { GuestCombobox } from "@/components/ui/GuestCombobox";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RSVP_DEADLINE, RSVP_ENDPOINT, site } from "@/lib/content";
import { isConfirmed, isOnList, loadGuestData, markConfirmed } from "@/lib/guests";
import { EASE_OUT, EASE_SOFT } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Entry = { id: number; name: string };
type Note = { text: string; state: "" | "ok" | "error" };

/** Mensaje en línea por persona (ya confirmó / no está en la lista). */
function entryMsg(name: string): { text: string; tone: "ok" | "error" } | null {
  const n = name.trim();
  if (!n) return null;
  if (isConfirmed(n))
    return { text: "✓ Esta persona ya confirmó su asistencia.", tone: "ok" };
  if (!isOnList(n))
    return { text: "Este nombre no está en la lista de invitados.", tone: "error" };
  return null;
}

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
      <p className="mx-auto mt-4 max-w-sm text-[15px] leading-[1.85] text-ink/60">
        {attendance === "si"
          ? "Hemos recibido tu confirmación. Nos vemos el 3 de octubre para celebrar juntos. 🥂"
          : site.rsvp.success.no}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-8 text-[11px] uppercase tracking-[0.25em] text-bronze underline-offset-4 transition-colors hover:text-ink hover:underline"
      >
        Enviar otra respuesta
      </button>
    </motion.div>
  );
}

/**
 * Confirmación de asistencia — multi-invitado, contra la lista de invitados.
 * Cada nombre debe estar en la lista; teléfono y asistencia son del grupo.
 * Envía a Google Sheets (Apps Script) y guarda un respaldo en localStorage.
 */
export function Rsvp() {
  const [entries, setEntries] = useState<Entry[]>([{ id: 0, name: "" }]);
  const nextId = useRef(1);
  const [telefono, setTelefono] = useState("");
  const [asistencia, setAsistencia] = useState<"" | "si" | "no">("");
  const [note, setNote] = useState<Note>({ text: "", state: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [done, setDone] = useState<{ name: string; attendance: "si" | "no" }>({
    name: "",
    attendance: "si",
  });
  const inputRefs = useRef(new Map<number, HTMLInputElement>());

  // Al montar, hidrata la lista de invitados y confirmaciones desde la hoja.
  useEffect(() => {
    void loadGuestData(RSVP_ENDPOINT);
  }, []);

  const setEntryName = (id: number, name: string) =>
    setEntries((prev) => prev.map((en) => (en.id === id ? { ...en, name } : en)));

  const addEntry = () => {
    const last = entries[entries.length - 1];
    if (last && !last.name.trim()) {
      inputRefs.current.get(last.id)?.focus();
      return;
    }
    setEntries((prev) => [...prev, { id: nextId.current++, name: "" }]);
  };

  const removeEntry = (id: number) =>
    setEntries((prev) => prev.filter((en) => en.id !== id));

  const resetForm = () => {
    setEntries([{ id: nextId.current++, name: "" }]);
    setTelefono("");
    setAsistencia("");
    setNote({ text: "", state: "" });
    setStatus("idle");
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const names = entries.map((en) => en.name.trim()).filter(Boolean);

    if (names.length === 0 || !telefono.trim() || !asistencia) {
      setNote({
        text: "Completa al menos un nombre, el teléfono y si nos acompañas.",
        state: "error",
      });
      return;
    }

    const notListed = names.filter((n) => !isOnList(n));
    if (notListed.length) {
      setNote({
        text: `No está en la lista de invitados: ${notListed.join(", ")}. Solo las personas registradas podrán asistir.`,
        state: "error",
      });
      return;
    }

    const already = names.filter((n) => isConfirmed(n));
    if (already.length) {
      setNote({
        text: `Ya había(n) confirmado: ${already.join(", ")}. Puedes quitar ese nombre del formulario.`,
        state: "error",
      });
      return;
    }

    const record = {
      nombres: names,
      nombre: names.join(", "), // compatibilidad con la hoja
      telefono: telefono.trim(),
      asistencia,
      ts: new Date().toISOString(),
    };

    // Respaldo local (siempre).
    try {
      const all = JSON.parse(localStorage.getItem("rsvp") || "[]");
      all.push(record);
      localStorage.setItem("rsvp", JSON.stringify(all));
    } catch {
      /* almacenamiento no disponible: no es crítico */
    }

    if (RSVP_ENDPOINT) {
      setStatus("sending");
      setNote({ text: "Enviando…", state: "" });
      try {
        await fetch(RSVP_ENDPOINT, {
          method: "POST",
          mode: "no-cors", // Apps Script no devuelve CORS; el envío sí se registra
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(record),
        });
      } catch {
        /* el respaldo local ya quedó guardado */
      }
    }

    names.forEach(markConfirmed);
    setDone({ name: names[0], attendance: asistencia });
    setStatus("success");
  };

  return (
    <section id="rsvp" className="relative overflow-hidden bg-cream py-28 md:py-40">
      {/* Ambiente detrás del vidrio */}
      <div aria-hidden className="absolute inset-0">
        <div className="animate-drift absolute right-[-10%] top-[-6%] size-[34rem] rounded-full bg-gold/[0.14] blur-3xl" />
        <div className="animate-drift-slow absolute bottom-[-12%] left-[-8%] size-[38rem] rounded-full bg-sand/60 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-14 px-5 md:px-8 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        {/* Columna editorial */}
        <div className="lg:pt-8">
          <SectionHeading
            align="left"
            eyebrow={site.rsvp.eyebrow}
            title={site.rsvp.title}
            description={site.rsvp.intro}
          />

          <Reveal delay={0.3} y={18}>
            <p className="mt-6 inline-block rounded-full border border-gold/40 bg-gold/[0.08] px-5 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-bronze">
              Por favor confírmanos antes del {RSVP_DEADLINE}
            </p>
          </Reveal>

          <Reveal delay={0.4} y={18}>
            <ul className="mt-10 space-y-4 text-[14px] text-ink/60">
              <li className="flex items-center gap-3">
                <CalendarHeart size={16} strokeWidth={1.75} className="text-gold-deep" />
                {site.date.long}
              </li>
              <li className="flex items-center gap-3">
                <Clock size={16} strokeWidth={1.75} className="text-gold-deep" />
                Ceremonia {site.venues.ceremony.time} · Celebración{" "}
                {site.venues.reception.time}
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={16} strokeWidth={1.75} className="text-gold-deep" />
                {site.date.city}
              </li>
            </ul>
          </Reveal>

          <FloralBranch
            animate
            className="mt-12 hidden h-56 -rotate-12 text-gold/30 lg:block"
          />
        </div>

        {/* Tarjeta de vidrio */}
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
                  {/* Nombres — multi-invitado */}
                  <div>
                    <span className="mb-3 block text-[10px] font-medium uppercase tracking-[0.25em] text-bronze">
                      Nombre
                    </span>
                    <div className="space-y-4">
                      {entries.map((entry, i) => {
                        const msg = entryMsg(entry.name);
                        return (
                          <div key={entry.id}>
                            <div className="flex gap-2">
                              <GuestCombobox
                                value={entry.name}
                                onChange={(v) => setEntryName(entry.id, v)}
                                autoFocus={i > 0}
                                inputRef={(el) => {
                                  if (el) inputRefs.current.set(entry.id, el);
                                  else inputRefs.current.delete(entry.id);
                                }}
                              />
                              {i > 0 && (
                                <button
                                  type="button"
                                  aria-label="Quitar persona"
                                  onClick={() => removeEntry(entry.id)}
                                  className="flex size-11 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink/50 transition-colors duration-300 hover:border-ink/40 hover:text-ink"
                                >
                                  <X size={15} />
                                </button>
                              )}
                            </div>
                            {msg && (
                              <p
                                role="status"
                                className={cn(
                                  "mt-2 text-[13px]",
                                  msg.tone === "ok" ? "text-gold-deep" : "text-clay",
                                )}
                              >
                                {msg.text}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={addEntry}
                      className="mt-4 inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.16em] text-bronze underline-offset-4 transition-colors hover:text-ink hover:underline"
                    >
                      <Plus size={13} strokeWidth={2} /> Agregar otra persona
                    </button>
                    <p className="mt-4 text-[13px] leading-relaxed text-ink/50">
                      {site.rsvp.hint}
                    </p>
                  </div>

                  {/* Teléfono */}
                  <label className="block">
                    <span className="mb-3 block text-[10px] font-medium uppercase tracking-[0.25em] text-bronze">
                      Teléfono
                    </span>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+57 300 000 0000"
                      className="w-full border-b border-ink/15 bg-transparent pb-2.5 pt-2 text-[15px] text-ink outline-none transition-colors duration-500 placeholder:text-ink/35 focus:border-gold-deep"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                    />
                  </label>

                  {/* Asistencia */}
                  <fieldset>
                    <legend className="mb-3 text-[10px] font-medium uppercase tracking-[0.25em] text-bronze">
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
                          <span className="flex items-center justify-center rounded-full border border-ink/15 px-4 py-3.5 text-center text-[13px] text-ink/70 transition-all duration-500 hover:border-ink/40 peer-checked:border-ink peer-checked:bg-ink peer-checked:text-cream peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold">
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
                    className="group relative w-full overflow-hidden rounded-full bg-ink py-4.5 text-[11px] font-medium uppercase tracking-[0.25em] text-cream transition-opacity duration-300 disabled:cursor-wait disabled:opacity-80"
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
                        className="text-center text-[13px] text-clay"
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
    </section>
  );
}
