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
import {
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { FloralBranch } from "@/components/ui/Florals";
import { Reveal } from "@/components/ui/Reveal";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RSVP_DEADLINE, site } from "@/lib/content";
import { EASE_OUT, EASE_SOFT } from "@/lib/motion";
import { cn } from "@/lib/utils";

type MenuChoice = "" | "carne" | "pollo";
type Entry = { id: number; name: string; menu: MenuChoice };
type Note = { text: string; state: "" | "ok" | "error" };
type FormErrors = { telefono?: string; asistencia?: string; menu?: string };
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

const fieldClassName =
  "min-h-14 w-full rounded-full border border-gold/45 bg-white/55 px-4 py-3 text-[16px] text-ink outline-none transition-[border-color,background-color,box-shadow] duration-300 placeholder:text-ink/65 hover:border-gold/75 hover:bg-white/80 focus:border-bronze focus:bg-white focus:ring-2 focus:ring-gold/30 md:px-5 md:text-[18px]";
const fieldErrorClassName =
  "border-clay/70 bg-white focus:border-clay focus:ring-clay/20";

const MENU_OPTIONS = [
  { value: "carne", label: "Carne" },
  { value: "pollo", label: "Pollo" },
] as const;

const ATTENDANCE_OPTIONS = [
  { value: "si", label: "Sí, allí estaré" },
  { value: "no", label: "No podré asistir" },
] as const;

/**
 * Control de selección única.
 *
 * Los botones del formulario (Agregar, Enviar) son píldoras rellenas; estas
 * opciones NO deben parecerse a ellos o se leen como acciones y no como una
 * elección. De ahí las esquinas cuadradas, el punto de radio explícito y un
 * seleccionado que tiñe la superficie en vez de rellenarla.
 */
function ChoiceOption({
  name,
  value,
  label,
  checked,
  invalid,
  inputRef,
  onSelect,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  invalid?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  onSelect: () => void;
}) {
  return (
    <label className="group cursor-pointer">
      <input
        ref={inputRef}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onSelect}
        className="sr-only"
        aria-invalid={invalid}
      />
      <span
        className={cn(
          "flex min-h-14 items-center gap-3 rounded-xl border bg-white/55 px-4 py-3 text-[15px] leading-snug text-ink/80 sm:text-[16px]",
          "transition-[border-color,background-color,color] duration-300",
          "hover:bg-white/85",
          invalid ? "border-clay/70" : "border-gold/45 hover:border-gold/80",
          "group-has-[:checked]:border-bronze group-has-[:checked]:bg-gold/[0.16] group-has-[:checked]:font-medium group-has-[:checked]:text-ink",
          "group-has-[:focus-visible]:outline group-has-[:focus-visible]:outline-2 group-has-[:focus-visible]:outline-offset-2 group-has-[:focus-visible]:outline-gold",
        )}
      >
        <span
          aria-hidden
          className="grid size-[18px] shrink-0 place-items-center rounded-full border border-gold/70 bg-white transition-colors duration-300 group-has-[:checked]:border-bronze"
        >
          <span className="size-2.5 scale-0 rounded-full bg-bronze transition-transform duration-300 ease-out-expo group-has-[:checked]:scale-100" />
        </span>
        {label}
      </span>
    </label>
  );
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
      className="flex min-h-[22rem] flex-col items-center justify-center py-6 text-center md:min-h-[26rem] md:py-8"
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

      <h3 className="mt-7 text-balance font-serif text-3xl font-light text-ink md:mt-8 md:text-4xl">
        ¡Gracias, <span className="italic text-gold-deep">{firstName}</span>!
      </h3>
      <p className="mx-auto mt-4 max-w-md text-[16px] leading-[1.7] text-ink/70 md:text-[18px] md:leading-[1.75]">
        {attendance === "si"
          ? "Hemos recibido tu confirmación. Nos vemos el 3 de octubre para celebrar juntos. 🥂"
          : site.rsvp.success.no}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-7 inline-flex min-h-11 items-center justify-center px-3 text-[13px] uppercase tracking-[0.18em] text-bronze underline-offset-4 transition-colors hover:text-ink hover:underline"
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
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [note, setNote] = useState<Note>({ text: "", state: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [done, setDone] = useState<{ name: string; attendance: "si" | "no" }>({
    name: "",
    attendance: "si",
  });
  const candidateRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const attendanceRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLInputElement>(null);

  const addEntry = async () => {
    if (lookupStatus === "checking") return;

    const name = candidate.replace(/\s+/g, " ").trim();
    if (!name) {
      setLookupNote({
        text: "Escribe tu primer nombre y tu primer apellido para verificarlo.",
        state: "error",
      });
      candidateRef.current?.focus();
      return;
    }

    if (name.split(" ").length < 2) {
      setLookupNote({
        text: "Necesitamos tu primer nombre y tu primer apellido.",
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
          text: "Esta persona no está dentro de la lista de invitados. Revisa que hayas escrito tu primer nombre y tu primer apellido.",
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
        { id: nextId.current++, name: canonicalName, menu: "" },
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
    setFormErrors((current) => ({ ...current, menu: undefined }));
    candidateRef.current?.focus();
  };

  const setEntryMenu = (id: number, menu: MenuChoice) => {
    setEntries((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, menu } : entry)),
    );
    setFormErrors((current) => ({ ...current, menu: undefined }));
    setNote({ text: "", state: "" });
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
    setFormErrors({});
    setNote({ text: "", state: "" });
    setStatus("idle");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (candidate.trim()) {
      setLookupNote({
        text: "Verifica y agrega el nombre que quedó pendiente antes de enviar.",
        state: "error",
      });
      candidateRef.current?.focus();
      return;
    }

    const nextErrors: FormErrors = {};
    const selectedAttendance = asistencia;
    if (!telefono.trim()) {
      nextErrors.telefono = "Escribe un número de teléfono de contacto.";
    }
    if (!selectedAttendance) {
      nextErrors.asistencia = "Selecciona si podrás acompañarnos.";
    }
    if (selectedAttendance === "si" && entries.some((entry) => !entry.menu)) {
      nextErrors.menu =
        entries.length > 1
          ? "Elige el plato de cada persona."
          : "Elige tu preferencia de plato.";
    }

    if (
      entries.length === 0 ||
      !selectedAttendance ||
      Object.keys(nextErrors).length > 0
    ) {
      setFormErrors(nextErrors);
      setNote({ text: "", state: "" });

      if (entries.length === 0) {
        setLookupNote({
          text: "Verifica y agrega al menos una persona antes de enviar.",
          state: "error",
        });
        candidateRef.current?.focus();
      } else if (nextErrors.telefono) {
        phoneRef.current?.focus();
      } else if (nextErrors.asistencia) {
        attendanceRef.current?.focus();
      } else {
        menuRef.current?.focus();
      }
      return;
    }

    setStatus("sending");
    setFormErrors({});
    setNote({ text: "", state: "" });

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombres: entries.map((entry) => entry.name),
          menus: entries.map((entry) =>
            selectedAttendance === "si" ? entry.menu : "",
          ),
          telefono: telefono.trim(),
          asistencia: selectedAttendance,
        }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || result.ok !== true) {
        throw new Error(
          result.error || "No pudimos guardar tu confirmación. Intenta de nuevo.",
        );
      }

      setDone({ name: entries[0].name, attendance: selectedAttendance });
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

  const firstMissingMenuId = entries.find((entry) => !entry.menu)?.id;

  return (
    <section id="rsvp" className="relative">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-28 pt-14 md:gap-12 md:px-8 md:pb-40 md:pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 xl:gap-20">
        <div className="lg:pt-6">
          <SectionHeading
            align="left"
            centerEyebrow
            eyebrow={site.rsvp.eyebrow}
            title={site.rsvp.title}
          />

          <Reveal delay={0.3} y={18}>
            <ul className="mt-6 space-y-3.5 text-[16px] leading-relaxed text-ink/75 md:mt-8 md:text-[18px]">
              <li className="flex items-start gap-3 md:items-center">
                <CalendarHeart
                  size={20}
                  strokeWidth={1.75}
                  className="mt-0.5 shrink-0 text-gold-deep md:mt-0"
                />
                {site.date.long}
              </li>
              <li className="flex items-start gap-3 md:items-center">
                <Clock
                  size={20}
                  strokeWidth={1.75}
                  className="mt-0.5 shrink-0 text-gold-deep md:mt-0"
                />
                Ceremonia {site.venues.ceremony.time} · Celebración{" "}
                {site.venues.reception.time}
              </li>
              <li className="flex items-start gap-3 md:items-center">
                <MapPin
                  size={20}
                  strokeWidth={1.75}
                  className="mt-0.5 shrink-0 text-gold-deep md:mt-0"
                />
                {site.date.city}
              </li>
            </ul>
          </Reveal>

          <Reveal delay={0.4} y={18}>
            <p className="mt-6 max-w-md rounded-xl bg-gold/[0.16] px-5 py-4 text-[16px] font-semibold leading-relaxed text-ink md:mt-8 md:text-[18px]">
              Por favor confírmanos antes del {RSVP_DEADLINE}
            </p>
          </Reveal>

          <FloralBranch
            animate
            className="mt-12 hidden h-56 -rotate-12 text-gold/30 lg:block"
          />
        </div>

        <Reveal delay={0.15} y={40} blur={false}>
          <div className="relative rounded-2xl bg-shell p-5 shadow-[0_6px_8px_-6px_rgba(27,27,27,0.22)] sm:p-7 md:p-9 xl:p-10">
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
                  aria-busy={status === "sending"}
                  exit={{ opacity: 0, y: -18, filter: "blur(6px)" }}
                  transition={{ duration: 0.5, ease: EASE_OUT }}
                  className="space-y-6 md:space-y-7"
                >
                  <div className="space-y-4">
                    <h3 className="font-serif text-[26px] font-light leading-tight text-ink">
                      Personas invitadas
                    </h3>

                    <label
                      htmlFor="guest-name"
                      className="block text-[14px] font-medium text-bronze"
                    >
                      Primer nombre y primer apellido
                    </label>

                    <div className="flex flex-col gap-2.5 sm:flex-row">
                      <input
                        id="guest-name"
                        ref={candidateRef}
                        type="text"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="Ej. Mateo Espinosa"
                        className={cn(
                          fieldClassName,
                          "min-w-0 flex-1",
                          lookupNote.state === "error" && fieldErrorClassName,
                        )}
                        value={candidate}
                        onChange={(event) => {
                          setCandidate(event.target.value);
                          setLookupNote({ text: "", state: "" });
                          setNote({ text: "", state: "" });
                        }}
                        onKeyDown={onCandidateKeyDown}
                        aria-describedby="guest-lookup-note"
                        aria-invalid={lookupNote.state === "error"}
                      />
                      <button
                        type="button"
                        onClick={() => void addEntry()}
                        disabled={lookupStatus === "checking" || !candidate.trim()}
                        className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-bronze px-6 text-[13px] font-medium uppercase tracking-[0.12em] text-cream transition-[background-color,color,transform] duration-300 hover:bg-ink active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-sand disabled:text-ink/55 disabled:hover:bg-sand"
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

                    <div
                      id="guest-lookup-note"
                      role={lookupNote.state === "error" ? "alert" : "status"}
                      aria-live="polite"
                    >
                      {lookupNote.text && (
                        <p
                          className={cn(
                            "flex items-start gap-1.5 text-[14px] leading-relaxed md:text-[15px]",
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
                              className="mt-0.5 shrink-0"
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
                          className="pt-1"
                        >
                          <p className="mb-2 text-[14px] font-medium text-ink/75">
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
                                  className="flex min-h-14 items-center gap-3 rounded-xl bg-gold/[0.12] py-2 pl-3.5 pr-1.5 text-ink"
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
                                    className="flex size-11 shrink-0 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-white/80 hover:text-ink active:bg-white"
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

                  </div>

                  {/* El `label` va solo sobre el título: envolviendo también el
                      input y el error, el nombre accesible del campo acababa
                      arrastrando el placeholder y el mensaje de validación. */}
                  <div className="space-y-4 border-t border-gold/25 pt-6">
                    <label
                      htmlFor="guest-phone"
                      className="block font-serif text-[26px] font-light leading-tight text-ink"
                    >
                      Teléfono de contacto
                    </label>
                    <input
                      id="guest-phone"
                      ref={phoneRef}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+57 300 000 0000"
                      className={cn(
                        fieldClassName,
                        formErrors.telefono && fieldErrorClassName,
                      )}
                      value={telefono}
                      onChange={(event) => {
                        setTelefono(event.target.value);
                        setFormErrors((current) => ({
                          ...current,
                          telefono: undefined,
                        }));
                        setNote({ text: "", state: "" });
                      }}
                      aria-describedby="phone-error"
                      aria-invalid={Boolean(formErrors.telefono)}
                    />
                    <AnimatePresence initial={false}>
                      {formErrors.telefono && (
                        <motion.span
                          id="phone-error"
                          role="alert"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="block text-[14px] leading-relaxed text-clay md:text-[15px]"
                        >
                          {formErrors.telefono}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  <fieldset
                    className="border-t border-gold/25 pt-6"
                    aria-describedby="attendance-error"
                    aria-invalid={Boolean(formErrors.asistencia)}
                  >
                    <legend className="mb-4 font-serif text-[26px] font-light leading-tight text-ink">
                      Confirmar asistencia
                    </legend>
                    {/* Etiquetas largas: en móvil apiladas, en fila desde sm. */}
                    <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                      {ATTENDANCE_OPTIONS.map((option) => (
                        <ChoiceOption
                          key={option.value}
                          name="asistencia"
                          value={option.value}
                          label={option.label}
                          checked={asistencia === option.value}
                          invalid={Boolean(formErrors.asistencia)}
                          inputRef={
                            option.value === "si" ? attendanceRef : undefined
                          }
                          onSelect={() => {
                            setAsistencia(option.value);
                            setFormErrors((current) => ({
                              ...current,
                              asistencia: undefined,
                              menu: undefined,
                            }));
                            setNote({ text: "", state: "" });
                          }}
                        />
                      ))}
                    </div>
                    <AnimatePresence initial={false}>
                      {formErrors.asistencia && (
                        <motion.p
                          id="attendance-error"
                          role="alert"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-3 text-[14px] leading-relaxed text-clay md:text-[15px]"
                        >
                          {formErrors.asistencia}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </fieldset>

                  <AnimatePresence initial={false}>
                    {asistencia === "si" && entries.length > 0 && (
                      <motion.div
                        key="menu"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: EASE_OUT }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gold/25 pt-6">
                          <h3 className="font-serif text-[26px] font-light leading-tight text-ink">
                            Preferencia de menú
                          </h3>
                          <p className="mt-2 text-[15px] leading-relaxed text-ink/70 md:text-[16px]">
                            Elige el plato principal de cada persona.
                          </p>

                          <div className="mt-4 space-y-4">
                            {entries.map((entry) => (
                              <fieldset
                                key={entry.id}
                                aria-describedby={
                                  formErrors.menu ? "menu-error" : undefined
                                }
                              >
                                <legend className="mb-2 text-[14px] font-medium text-bronze">
                                  {entry.name}
                                </legend>
                                {/* Etiquetas cortas: dos columnas incluso en móvil. */}
                                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                                  {MENU_OPTIONS.map((option) => (
                                    <ChoiceOption
                                      key={option.value}
                                      name={`menu-${entry.id}`}
                                      value={option.value}
                                      label={option.label}
                                      checked={entry.menu === option.value}
                                      invalid={Boolean(
                                        formErrors.menu && !entry.menu,
                                      )}
                                      inputRef={
                                        firstMissingMenuId === entry.id &&
                                        option.value === "carne"
                                          ? menuRef
                                          : undefined
                                      }
                                      onSelect={() =>
                                        setEntryMenu(entry.id, option.value)
                                      }
                                    />
                                  ))}
                                </div>
                              </fieldset>
                            ))}
                          </div>

                          <AnimatePresence initial={false}>
                            {formErrors.menu && (
                              <motion.p
                                id="menu-error"
                                role="alert"
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mt-3 text-[14px] leading-relaxed text-clay md:text-[15px]"
                              >
                                {formErrors.menu}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={status === "sending"}
                    whileTap={{ scale: 0.98 }}
                    className="group relative min-h-14 w-full overflow-hidden rounded-full bg-ink px-4 py-3 text-[12px] font-medium uppercase tracking-[0.12em] text-cream transition-opacity duration-300 disabled:cursor-wait disabled:opacity-75 sm:px-5 sm:text-[13px] sm:tracking-[0.18em] md:tracking-[0.22em]"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-0 origin-bottom scale-y-0 bg-gold-deep transition-transform duration-500 ease-out-expo group-hover:scale-y-100"
                    />
                    <span className="relative z-10 flex items-center justify-center gap-3 py-0.5">
                      {status === "sending" ? (
                        <>
                          <span
                            aria-hidden
                            className="size-4 animate-spin rounded-full border border-cream/30 border-t-cream"
                          />
                          <span>Enviando</span>
                        </>
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
                        className="rounded-xl bg-clay/[0.08] px-4 py-3 text-center text-[14px] leading-relaxed text-clay md:text-[15px]"
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
