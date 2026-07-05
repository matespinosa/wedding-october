/**
 * Lista de invitados + confirmaciones compartidas por todos los comboboxes.
 *
 * `loadGuestData(endpoint)` trae desde Google Sheets la lista de invitados
 * (pestaña 2) y quiénes ya confirmaron (pestaña 1). Sin conexión, queda el
 * respaldo estático. El estado vive a nivel de módulo: los componentes lo
 * leen al filtrar o validar, siempre con el dato más reciente.
 */
import { FALLBACK_GUESTS } from "@/lib/content";

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

let GUESTS = [...FALLBACK_GUESTS];
let CONFIRMED = new Set<string>();

export function loadGuestData(endpoint = ""): Promise<void> {
  if (!endpoint) return Promise.resolve();
  return fetch(endpoint)
    .then((r) => r.json())
    .then((data: { names?: unknown; confirmed?: unknown }) => {
      if (Array.isArray(data.names) && data.names.length > 0) {
        GUESTS = data.names.map(String);
      }
      if (Array.isArray(data.confirmed)) {
        CONFIRMED = new Set(data.confirmed.map((n) => norm(String(n))));
      }
    })
    .catch(() => {
      /* respaldo estático ya cargado */
    });
}

export const getGuests = () => GUESTS;
export const filterGuests = (query: string) => {
  const q = norm(query);
  return q ? GUESTS.filter((n) => norm(n).includes(q)) : GUESTS;
};
export const isOnList = (name: string) => GUESTS.some((g) => norm(g) === norm(name));
export const isConfirmed = (name: string) => CONFIRMED.has(norm(name));
export const markConfirmed = (name: string) => {
  CONFIRMED.add(norm(name));
};
