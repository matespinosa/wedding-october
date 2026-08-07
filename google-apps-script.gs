/**
 * Backend privado del RSVP en Google Sheets.
 *
 * Estructura de la hoja:
 *   - Pestaña 1: respuestas (Fecha | Nombre | Teléfono | Asistencia | Menú).
 *   - Pestaña 2: lista de invitados (un nombre por fila, sin encabezado).
 *
 * Publicación:
 *  1. En la hoja: Extensiones → Apps Script.
 *  2. Reemplaza el código por este archivo.
 *  3. Ejecuta `prepararEncabezados` una vez y autoriza los permisos.
 *  4. Implementar → Administrar implementaciones → Editar → Nueva versión.
 *  5. Tipo "Aplicación web", ejecutada como tú y accesible para cualquier persona.
 *
 * El sitio consulta un nombre por vez. Se aceptan coincidencias parciales solo
 * cuando identifican a una persona única. `doGet` nunca devuelve la lista
 * completa y `doPost` vuelve a validar cada persona antes de escribir.
 */

var ENCABEZADOS = ['Fecha', 'Nombre', 'Teléfono', 'Asistencia', 'Menú'];

function prepararEncabezados() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(ENCABEZADOS);
    return;
  }
  // Hojas creadas antes del menú: agrega la columna que falta.
  if (sheet.getLastColumn() < ENCABEZADOS.length) {
    sheet.getRange(1, ENCABEZADOS.length).setValue(ENCABEZADOS[ENCABEZADOS.length - 1]);
  }
}

function formatearMenu(value) {
  var menu = String(value || '').trim().toLowerCase();
  if (menu === 'carne') return 'Carne';
  if (menu === 'pollo') return 'Pollo';
  return '';
}

function normalizarNombre(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function obtenerTerminosNombre(value) {
  var particulas = { de: true, del: true, la: true, las: true, los: true, y: true };
  return normalizarNombre(value)
    .split(' ')
    .filter(function (termino) {
      return termino && !particulas[termino];
    });
}

function contieneTodosLosTerminos(contenedor, buscados) {
  var disponibles = {};
  contenedor.forEach(function (termino) {
    disponibles[termino] = (disponibles[termino] || 0) + 1;
  });

  return buscados.every(function (termino) {
    if (!disponibles[termino]) return false;
    disponibles[termino] -= 1;
    return true;
  });
}

function responderJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function obtenerInvitados(ss) {
  var guestSheet = ss.getSheets()[1];
  if (!guestSheet) {
    throw new Error('No existe la pestaña 2 con la lista de invitados.');
  }

  var seen = {};
  var guests = [];
  guestSheet.getDataRange().getValues().forEach(function (row) {
    var canonicalName = String(row[0] || '').replace(/\s+/g, ' ').trim();
    var normalizedName = normalizarNombre(canonicalName);
    if (canonicalName && !seen[normalizedName]) {
      seen[normalizedName] = true;
      guests.push(canonicalName);
    }
  });
  return guests;
}

function buscarInvitado(requestedName, guestNames) {
  var normalizedRequest = normalizarNombre(requestedName);
  if (!normalizedRequest) return { matched: false, ambiguous: false };

  for (var i = 0; i < guestNames.length; i += 1) {
    if (normalizarNombre(guestNames[i]) === normalizedRequest) {
      return { matched: true, ambiguous: false, name: guestNames[i] };
    }
  }

  var requestedTerms = obtenerTerminosNombre(requestedName);
  if (!requestedTerms.length) return { matched: false, ambiguous: false };

  var matches = guestNames.filter(function (guestName) {
    var guestTerms = obtenerTerminosNombre(guestName);
    return (
      guestTerms.length > 0 &&
      (contieneTodosLosTerminos(guestTerms, requestedTerms) ||
        contieneTodosLosTerminos(requestedTerms, guestTerms))
    );
  });

  if (matches.length === 1) {
    return { matched: true, ambiguous: false, name: matches[0] };
  }

  return { matched: false, ambiguous: matches.length > 1 };
}

function obtenerConfirmados(ss) {
  var respSheet = ss.getSheets()[0];
  var confirmed = {};

  if (respSheet.getLastRow() < 2) {
    return confirmed;
  }

  respSheet
    .getRange(2, 2, respSheet.getLastRow() - 1, 1)
    .getValues()
    .forEach(function (row) {
      var normalized = normalizarNombre(row[0]);
      if (normalized) confirmed[normalized] = true;
    });

  return confirmed;
}

function doGet(e) {
  try {
    var requestedName =
      e && e.parameter && e.parameter.name
        ? String(e.parameter.name).replace(/\s+/g, ' ').trim()
        : '';

    if (!requestedName) {
      return responderJson({ matched: false, ambiguous: false, confirmed: false });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var guestNames = obtenerInvitados(ss);
    var match = buscarInvitado(requestedName, guestNames);

    if (!match.matched) {
      return responderJson({
        matched: false,
        ambiguous: match.ambiguous === true,
        confirmed: false,
      });
    }

    var canonicalName = match.name;
    var normalized = normalizarNombre(canonicalName);
    var confirmed = obtenerConfirmados(ss);
    return responderJson({
      matched: true,
      ambiguous: false,
      name: canonicalName,
      confirmed: confirmed[normalized] === true,
    });
  } catch (err) {
    return responderJson({
      matched: false,
      ambiguous: false,
      confirmed: false,
      error: String(err),
    });
  }
}

function doPost(e) {
  var lock = LockService.getDocumentLock();

  try {
    var data = JSON.parse(e.postData.contents);
    var rawNames =
      Array.isArray(data.nombres) && data.nombres.length
        ? data.nombres
        : [data.nombre || ''];
    var rawMenus = Array.isArray(data.menus) ? data.menus : [];
    var seen = {};
    var requestedNames = [];
    var requestedMenus = [];

    rawNames.forEach(function (value, index) {
      var name = String(value || '').replace(/\s+/g, ' ').trim();
      var normalized = normalizarNombre(name);
      if (name && !seen[normalized]) {
        seen[normalized] = true;
        requestedNames.push(name);
        requestedMenus.push(formatearMenu(rawMenus[index]));
      }
    });

    var telefono = String(data.telefono || '').trim();
    var asistencia =
      data.asistencia === 'si'
        ? 'Sí asiste'
        : data.asistencia === 'no'
          ? 'No asiste'
          : '';

    if (!requestedNames.length || !telefono || !asistencia) {
      return responderJson({
        ok: false,
        error: 'Faltan nombres, teléfono o asistencia.',
      });
    }

    if (
      asistencia === 'Sí asiste' &&
      requestedMenus.some(function (menu) {
        return !menu;
      })
    ) {
      return responderJson({
        ok: false,
        error: 'Falta la preferencia de menú de alguna persona.',
      });
    }

    lock.waitLock(10000);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var guestNames = obtenerInvitados(ss);
    var confirmed = obtenerConfirmados(ss);
    var canonicalNames = [];

    for (var i = 0; i < requestedNames.length; i += 1) {
      var match = buscarInvitado(requestedNames[i], guestNames);

      if (match.ambiguous) {
        return responderJson({
          ok: false,
          error: 'Una de las personas coincide con más de un invitado.',
        });
      }
      if (!match.matched) {
        return responderJson({
          ok: false,
          error: 'Una de las personas no está en la lista de invitados.',
        });
      }

      var canonicalName = match.name;
      var normalizedName = normalizarNombre(canonicalName);
      if (confirmed[normalizedName]) {
        return responderJson({
          ok: false,
          error: 'Una de las personas ya había registrado una respuesta.',
        });
      }
      canonicalNames.push(canonicalName);
    }

    var responseSheet = ss.getSheets()[0];
    if (responseSheet.getLastRow() === 0) {
      responseSheet.appendRow(ENCABEZADOS);
    }

    var now = new Date();
    var rows = canonicalNames.map(function (name, index) {
      return [now, name, telefono, asistencia, requestedMenus[index] || ''];
    });
    responseSheet
      .getRange(responseSheet.getLastRow() + 1, 1, rows.length, ENCABEZADOS.length)
      .setValues(rows);
    SpreadsheetApp.flush();

    return responderJson({ ok: true });
  } catch (err) {
    return responderJson({ ok: false, error: String(err) });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}
