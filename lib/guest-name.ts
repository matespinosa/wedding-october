const NAME_PARTICLES = new Set(["de", "del", "la", "las", "los", "y"]);

export const normalizeGuestName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getMeaningfulTokens = (value: string) =>
  normalizeGuestName(value)
    .split(" ")
    .filter((token) => token && !NAME_PARTICLES.has(token));

const containsEveryToken = (container: string[], requested: string[]) => {
  const available = new Map<string, number>();

  container.forEach((token) => {
    available.set(token, (available.get(token) ?? 0) + 1);
  });

  return requested.every((token) => {
    const count = available.get(token) ?? 0;
    if (count === 0) return false;
    available.set(token, count - 1);
    return true;
  });
};

export type GuestNameMatch =
  | { status: "matched"; name: string }
  | { status: "ambiguous" }
  | { status: "not-found" };

/**
 * Encuentra una persona sin exigir que escriba el nombre exactamente igual.
 *
 * Una coincidencia exacta siempre tiene prioridad. Para una coincidencia
 * parcial, todos los términos significativos del nombre más corto deben estar
 * presentes en el más largo. Solo se acepta cuando el resultado es único.
 */
export function findGuestNameMatch(
  requestedName: string,
  guestNames: string[],
): GuestNameMatch {
  const normalizedRequest = normalizeGuestName(requestedName);
  if (!normalizedRequest) return { status: "not-found" };

  const uniqueGuests = Array.from(
    new Map(
      guestNames
        .map((name) => name.replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .map((name) => [normalizeGuestName(name), name] as const),
    ).values(),
  );

  const exactMatch = uniqueGuests.find(
    (name) => normalizeGuestName(name) === normalizedRequest,
  );
  if (exactMatch) return { status: "matched", name: exactMatch };

  const requestedTokens = getMeaningfulTokens(requestedName);
  if (requestedTokens.length === 0) return { status: "not-found" };

  const partialMatches = uniqueGuests.filter((name) => {
    const guestTokens = getMeaningfulTokens(name);
    if (guestTokens.length === 0) return false;

    return (
      containsEveryToken(guestTokens, requestedTokens) ||
      containsEveryToken(requestedTokens, guestTokens)
    );
  });

  if (partialMatches.length === 1) {
    return { status: "matched", name: partialMatches[0] };
  }
  if (partialMatches.length > 1) return { status: "ambiguous" };

  return { status: "not-found" };
}
