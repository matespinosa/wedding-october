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
 * El sitio consulta un nombre exacto por vez. `doGet` nunca devuelve la lista
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
    .replace(/\s+/g, ' ')
    .trim();
}

function responderJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function obtenerMapaInvitados(ss) {
  var guestSheet = ss.getSheets()[1];
  if (!guestSheet) {
    throw new Error('No existe la pestaña 2 con la lista de invitados.');
  }

  var map = {};
  guestSheet.getDataRange().getValues().forEach(function (row) {
    var canonicalName = String(row[0] || '').replace(/\s+/g, ' ').trim();
    if (canonicalName) {
      map[normalizarNombre(canonicalName)] = canonicalName;
    }
  });
  return map;
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
      return responderJson({ matched: false, confirmed: false });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var guestMap = obtenerMapaInvitados(ss);
    var normalized = normalizarNombre(requestedName);
    var canonicalName = guestMap[normalized];

    if (!canonicalName) {
      return responderJson({ matched: false, confirmed: false });
    }

    var confirmed = obtenerConfirmados(ss);
    return responderJson({
      matched: true,
      name: canonicalName,
      confirmed: confirmed[normalized] === true,
    });
  } catch (err) {
    return responderJson({
      matched: false,
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
    var guestMap = obtenerMapaInvitados(ss);
    var confirmed = obtenerConfirmados(ss);
    var canonicalNames = [];

    for (var i = 0; i < requestedNames.length; i += 1) {
      var normalizedName = normalizarNombre(requestedNames[i]);
      var canonicalName = guestMap[normalizedName];

      if (!canonicalName) {
        return responderJson({
          ok: false,
          error: 'Una de las personas no está en la lista de invitados.',
        });
      }
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
