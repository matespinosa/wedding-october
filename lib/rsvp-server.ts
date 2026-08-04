import "server-only";

/** Implementación del Apps Script privado (doGet nunca devuelve la lista completa). */
const DEFAULT_SCRIPT_ENDPOINT =
  "https://script.google.com/macros/s/AKfycby00XguFKlZ5awiyhvNAQM5XJACj5JURm2l6kZ3p4c7vajVOcGCsuueG-2mTEY7mT6zyA/exec";

const scriptEndpoint =
  process.env.RSVP_SCRIPT_URL?.trim() || DEFAULT_SCRIPT_ENDPOINT;

type LegacyGuestData = {
  names?: unknown;
  confirmed?: unknown;
};

type PrivateLookupData = {
  matched?: unknown;
  name?: unknown;
  confirmed?: unknown;
};

export type GuestLookup = {
  matched: boolean;
  name?: string;
  confirmed: boolean;
};

export type RsvpRecord = {
  nombres: string[];
  /** Paralelo a `nombres`: "carne" | "pollo", vacío si no asiste. */
  menus: string[];
  nombre: string;
  telefono: string;
  asistencia: "si" | "no";
  ts: string;
};

export const normalizeGuestName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/**
 * Consulta únicamente un nombre. También entiende temporalmente la respuesta
 * del Apps Script anterior, pero filtra la lista completa dentro del servidor:
 * nunca la envía al navegador.
 */
export async function lookupGuest(name: string): Promise<GuestLookup> {
  const url = new URL(scriptEndpoint);
  url.searchParams.set("name", name);

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Google Sheets respondió ${response.status}`);
  }

  const data = (await response.json()) as PrivateLookupData & LegacyGuestData;

  // Contrato privado nuevo: { matched, name?, confirmed }.
  if (typeof data.matched === "boolean") {
    return {
      matched: data.matched,
      name: data.matched && typeof data.name === "string" ? data.name : undefined,
      confirmed: data.confirmed === true,
    };
  }

  // Compatibilidad con el despliegue anterior mientras se publica el script nuevo.
  const names = Array.isArray(data.names) ? data.names.map(String) : [];
  const canonicalName = names.find(
    (guestName) => normalizeGuestName(guestName) === normalizeGuestName(name),
  );

  if (!canonicalName) {
    return { matched: false, confirmed: false };
  }

  const confirmed = Array.isArray(data.confirmed)
    ? data.confirmed
        .map(String)
        .some(
          (confirmedName) =>
            normalizeGuestName(confirmedName) === normalizeGuestName(canonicalName),
        )
    : false;

  return { matched: true, name: canonicalName, confirmed };
}

export async function submitRsvp(record: RsvpRecord): Promise<void> {
  const response = await fetch(scriptEndpoint, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    throw new Error(`Google Sheets respondió ${response.status}`);
  }

  const result = (await response.json()) as { ok?: unknown; error?: unknown };
  if (result.ok !== true) {
    throw new Error(
      typeof result.error === "string"
        ? result.error
        : "Google Sheets no confirmó el registro",
    );
  }
}
