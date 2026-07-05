# Mateo & Julieth — Invitación digital de boda

Sitio de invitación tipo *one-page* construido con Next.js 15, TypeScript, TailwindCSS 4, Framer Motion y Lenis. Experiencia cinemática: preloader de doble cortina, scroll suave, parallax, línea de tiempo animada, dress code ilustrado a mano en SVG y RSVP con validación.

## Requisitos

- Node.js ≥ 18.18 (recomendado 20+)

## Desarrollo

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # build de producción
npm start         # servir el build
```

## Editar el contenido

**Todo el contenido vive en [`lib/content.ts`](lib/content.ts)** — nombres, fecha, textos de la historia, galería, lugares, horas, paletas del dress code, endpoint del RSVP y lista de invitados de respaldo. No hace falta tocar componentes.

Datos reales ya cargados: boda de Mateo & Julieth · sábado 3 de octubre de 2026 · Bogotá. Ceremonia en la Iglesia de Dios Ministerial de Jesucristo Internacional (sede La Colina, 11:00 a. m.) y celebración en el Retiro San Juan · Salón Magnolia (Vía La Calera, 5:00 p. m.).

## Fotos

Las fotos reales viven en [`public/images/`](public/images) y se muestran en el hero (velada), la galería, las tarjetas de los lugares y el cierre. Para cambiarlas, reemplaza el archivo o edita las rutas en [`lib/content.ts`](lib/content.ts). La línea de tiempo de la historia usa placas ilustradas ([`components/ui/ArtFrame.tsx`](components/ui/ArtFrame.tsx)); si quieres fotos ahí, ese es el único componente a tocar.

## RSVP → Google Sheets

El formulario replica la integración de Google Apps Script:

- **Lista de invitados:** al cargar, [`lib/guests.ts`](lib/guests.ts) llama `loadGuestData(RSVP_ENDPOINT)` que trae los invitados y quiénes ya confirmaron desde la hoja (vía `doGet`). Si no hay conexión, usa `FALLBACK_GUESTS` en [`lib/content.ts`](lib/content.ts).
- **Envío:** cada confirmación se envía con `fetch` (`mode: 'no-cors'`, `Content-Type: text/plain`) directo al `RSVP_ENDPOINT`, y se guarda un respaldo en `localStorage['rsvp']`. Como `no-cors` no deja leer la respuesta, el éxito es optimista (igual que el proyecto original).
- **Multi-invitado:** un envío puede traer varias personas ("+ Agregar otra persona"); la hoja recibe una fila por persona.
- **Hoja nueva:** despliega [`google-apps-script.gs`](google-apps-script.gs) (Extensiones → Apps Script), corre `prepararEncabezados` una vez, publica como aplicación web ("Cualquier persona") y pega la URL `/exec` en `RSVP_ENDPOINT` dentro de [`lib/content.ts`](lib/content.ts). La pestaña 1 guarda respuestas (`Fecha | Nombre | Teléfono | Asistencia`); la pestaña 2 es la lista de invitados (un nombre por fila).

## Sistema de diseño

- **Tokens** (color, tipografía, curvas de easing, animaciones ambiente): `app/globals.css` bajo `@theme`
- **Vocabulario de movimiento** (easings, duraciones, variants reutilizables): `lib/motion.ts`
- **Primitivas**: `components/ui/` — `TextReveal` (máscaras letra a letra), `Reveal` (fade + blur + rise), `Magnetic`, `Button`, `SectionHeading`, `SectionDivider`, florales SVG dibujados a mano

## Accesibilidad y rendimiento

- `prefers-reduced-motion` respetado (Framer `MotionConfig`, Lenis desactivado, keyframes CSS anulados)
- HTML semántico, labels reales en el formulario, foco visible dorado, navegación por teclado (Escape cierra el menú móvil)
- Sin imágenes rasterizadas: toda la gráfica es SVG/CSS — el peso de página se mantiene mínimo
