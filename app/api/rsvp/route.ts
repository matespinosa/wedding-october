import { NextRequest, NextResponse } from "next/server";
import {
  lookupGuest,
  normalizeGuestName,
  submitRsvp,
  type RsvpRecord,
} from "@/lib/rsvp-server";

export const dynamic = "force-dynamic";

const privateError = () =>
  NextResponse.json(
    { error: "No pudimos verificar la lista en este momento." },
    { status: 502 },
  );

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name")?.replace(/\s+/g, " ").trim();

  if (!name || name.length < 2 || name.length > 120) {
    return NextResponse.json(
      { error: "Escribe un nombre válido." },
      { status: 400 },
    );
  }

  try {
    const guest = await lookupGuest(name);
    return NextResponse.json(guest, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return privateError();
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const rawNames = Array.isArray(data.nombres)
    ? data.nombres.map(String).map((name) => name.replace(/\s+/g, " ").trim())
    : [];
  const rawMenus = Array.isArray(data.menus) ? data.menus.map(String) : [];
  const telefono = typeof data.telefono === "string" ? data.telefono.trim() : "";
  const asistencia = data.asistencia;

  // Nombre y menú viajan como listas paralelas: se deduplican juntos para que
  // cada persona conserve el plato que eligió.
  const guests = rawNames
    .map((name, index) => ({ name, menu: rawMenus[index] ?? "" }))
    .filter(
      (guest, index, all) =>
        guest.name &&
        all.findIndex(
          (candidate) =>
            normalizeGuestName(candidate.name) === normalizeGuestName(guest.name),
        ) === index,
    );

  if (
    guests.length === 0 ||
    guests.length > 10 ||
    guests.some((guest) => guest.name.length > 120) ||
    !telefono ||
    telefono.length > 40 ||
    (asistencia !== "si" && asistencia !== "no") ||
    // El menú solo se pide a quienes asisten.
    (asistencia === "si" &&
      guests.some((guest) => guest.menu !== "carne" && guest.menu !== "pollo"))
  ) {
    return NextResponse.json(
      { error: "Completa correctamente todos los campos." },
      { status: 400 },
    );
  }

  const uniqueNames = guests.map((guest) => guest.name);

  try {
    // Se vuelve a validar al guardar para que no sea posible saltarse el formulario.
    const lookups = await Promise.all(uniqueNames.map(lookupGuest));
    if (lookups.some((guest) => !guest.matched)) {
      return NextResponse.json(
        { error: "Una de las personas no pudo validarse en la lista." },
        { status: 400 },
      );
    }
    if (lookups.some((guest) => guest.confirmed)) {
      return NextResponse.json(
        { error: "Una de las personas ya había registrado una respuesta." },
        { status: 409 },
      );
    }

    const canonicalNames = lookups.map((guest, index) => guest.name || uniqueNames[index]);
    const record: RsvpRecord = {
      nombres: canonicalNames,
      nombre: canonicalNames.join(", "),
      menus: guests.map((guest) => (asistencia === "si" ? guest.menu : "")),
      telefono,
      asistencia,
      ts: new Date().toISOString(),
    };

    await submitRsvp(record);
    return NextResponse.json({ ok: true });
  } catch {
    return privateError();
  }
}
