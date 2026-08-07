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

**Todo el contenido editorial vive en [`lib/content.ts`](lib/content.ts)** — nombres, fecha, textos de la historia, galería, lugares, horas y paletas del dress code. No hace falta tocar componentes.

Datos reales ya cargados: boda de Mateo & Julieth · sábado 3 de octubre de 2026 · Bogotá. Ceremonia en la Iglesia de Dios Ministerial de Jesucristo Internacional (sede La Colina, 11:00 a. m.) y celebración en el Retiro San Juan · Salón Magnolia (Vía Arrayanes, 5:00 p. m.).

## Fotos

Las fotos reales viven en [`public/images/`](public/images) y se muestran en el hero (velada), la galería, las tarjetas de los lugares y el cierre. Para cambiarlas, reemplaza el archivo o edita las rutas en [`lib/content.ts`](lib/content.ts). La línea de tiempo de la historia usa placas ilustradas ([`components/ui/ArtFrame.tsx`](components/ui/ArtFrame.tsx)); si quieres fotos ahí, ese es el único componente a tocar.

## RSVP → Google Sheets

El formulario usa una búsqueda privada por coincidencia flexible y única:

- **La lista nunca llega al navegador:** el visitante escribe uno o varios nombres o apellidos y [`app/api/rsvp/route.ts`](app/api/rsvp/route.ts) consulta Google Sheets en el servidor. Se ignoran tildes, mayúsculas, guiones y el orden de las palabras. La respuesta pública solo contiene si hay una coincidencia única, su escritura canónica y si ya respondió.
- **Sin desplegable ni sugerencias:** una coincidencia única aparece en “Personas agregadas”. Si hay varias personas posibles, se pide agregar otro nombre o apellido sin revelar candidatos. Los duplicados, nombres que no coinciden y respuestas previas se bloquean con mensajes separados.
- **Envío verificado:** el servidor valida nuevamente todas las personas antes de escribir. La hoja recibe una fila por persona y el sitio solo muestra éxito cuando Google confirma el registro.
- **Configuración:** el endpoint actual funciona como respaldo privado del servidor. En producción se puede definir `RSVP_SCRIPT_URL` con la URL `/exec` del Apps Script.
- **Actualizar Google Apps Script:** reemplaza el código publicado por [`google-apps-script.gs`](google-apps-script.gs), ejecuta `prepararEncabezados` una vez y crea una nueva versión de la aplicación web. La pestaña 1 guarda respuestas (`Fecha | Nombre | Teléfono | Asistencia`); la pestaña 2 contiene un nombre por fila. La nueva versión de `doGet` nunca devuelve la lista completa.

## Sistema de diseño

- **Tokens** (color, tipografía, curvas de easing, animaciones ambiente): `app/globals.css` bajo `@theme`
- **Vocabulario de movimiento** (easings, duraciones, variants reutilizables): `lib/motion.ts`
- **Primitivas**: `components/ui/` — `TextReveal` (máscaras letra a letra), `Reveal` (fade + blur + rise), `Magnetic`, `Button`, `SectionHeading`, `SectionDivider`, florales SVG dibujados a mano

## Accesibilidad y rendimiento

- `prefers-reduced-motion` respetado (Framer `MotionConfig`, Lenis desactivado, keyframes CSS anulados)
- HTML semántico, labels reales en el formulario, foco visible dorado, navegación por teclado (Escape cierra el menú móvil)
- Sin imágenes rasterizadas: toda la gráfica es SVG/CSS — el peso de página se mantiene mínimo
