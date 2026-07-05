/**
 * Recibe las confirmaciones del formulario y las agrega a la hoja de cálculo.
 *
 * Cómo usarlo:
 *  1. Crea una Hoja de cálculo de Google nueva (sheets.new).
 *  2. Menú: Extensiones → Apps Script. Borra todo y pega ESTE archivo.
 *  3. Ejecuta una vez la función `prepararEncabezados` (botón ▶) y autoriza los permisos.
 *  4. Implementar → Nueva implementación → tipo "Aplicación web".
 *       - Ejecutar como: Yo
 *       - Quién tiene acceso: Cualquier persona
 *     Copia la URL que termina en /exec.
 *  5. Pega esa URL en `RSVP_ENDPOINT` dentro de src/rsvp.js.
 *
 * Si cambias este código, vuelve a Implementar → Administrar implementaciones → Editar
 * → Nueva versión (si no, sigue corriendo la versión vieja).
 */

function prepararEncabezados() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Fecha', 'Nombre', 'Teléfono', 'Asistencia']);
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Pestaña 2: lista de invitados (una columna de nombres, sin encabezado).
    const guestSheet = ss.getSheets()[1];
    const names = guestSheet.getDataRange().getValues()
      .map(row => String(row[0]).trim())
      .filter(name => name.length > 0);

    // Pestaña 1: respuestas. Quiénes ya confirmaron (columna Nombre, sin encabezado).
    const respSheet = ss.getSheets()[0];
    const confirmed = respSheet.getDataRange().getValues()
      .slice(1) // salta la fila de encabezados
      .map(row => String(row[1]).trim())
      .filter(name => name.length > 0);

    return ContentService.createTextOutput(JSON.stringify({ names, confirmed }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ names: [], confirmed: [], error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Fecha', 'Nombre', 'Teléfono', 'Asistencia']);
    }
    const fecha = new Date();
    const asistencia = data.asistencia === 'si' ? 'Sí asiste'
      : data.asistencia === 'no' ? 'No asiste' : '';
    // Una fila por persona (un envío puede traer varias).
    const nombres = (Array.isArray(data.nombres) && data.nombres.length)
      ? data.nombres
      : [data.nombre || ''];
    nombres.forEach(function (nombre) {
      sheet.appendRow([fecha, nombre, data.telefono || '', asistencia]);
    });
    return ContentService.createTextOutput(
      JSON.stringify({ ok: true }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
