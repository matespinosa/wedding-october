/* ————————————————————————————————————————————————
   Todo el contenido del sitio vive aquí.
   Edita este archivo para cambiar textos, fechas y lugares
   sin tocar ningún componente.

   Datos reales de la boda de Mateo & Julieth · Bogotá.
   ———————————————————————————————————————————————— */

/* Fotos de la galería. Se importan para que Next calcule solo el tamaño
   y genere el blur de carga. Para añadir una foto nueva: deja el archivo
   en public/images/gallery/, impórtalo aquí y añádelo a gallery.photos. */
import galDetalle from "@/public/images/gallery/detalle.jpg";
import galConfeti from "@/public/images/gallery/matrimonio-1.jpg";
import galCiudadCivil from "@/public/images/gallery/matrimonio-2.jpg";
import galCerezo from "@/public/images/gallery/matrimonio-3.jpg";
import galEscalera from "@/public/images/gallery/matrimonio-4.jpg";
import galEscalinata from "@/public/images/gallery/other.jpg";
import galReja from "@/public/images/gallery/propose-4.jpg";
import galMomento from "@/public/images/gallery/propose.jpg";
import galMirador from "@/public/images/gallery/propuesta.jpg";

/** Sábado 3 de octubre de 2026 — hora de la ceremonia (Bogotá, UTC-5). */
export const WEDDING_DATE = new Date("2026-10-03T11:00:00-05:00");

export const RSVP_DEADLINE = "15 de septiembre de 2026";

export const site = {
  couple: {
    him: "Mateo",
    her: "Julieth",
    full: "Mateo & Julieth",
  },

  date: {
    display: "Sábado · 3 de octubre · 2026",
    long: "Sábado, 3 de octubre de 2026",
    short: "03 . 10 . 2026",
    /** Una sola línea, para el sobre en vertical. */
    plain: "3 de octubre de 2026",
    badge: "Mateo & Julieth · 03 · 10 · 26 · ",
    city: "Bogotá, Colombia",
  },

  nav: [
    { label: "Historia", href: "#historia" },
    { label: "Galería", href: "#galeria" },
    { label: "El gran día", href: "#ceremonia" },
    { label: "Dress code", href: "#dress-code" },
    { label: "RSVP", href: "#rsvp" },
  ],

  /** Sobre lacrado que abre el sitio. */
  gate: {
    /* Alternativas si quieres otro tono: "Nuestra invitación",
       "Con todo nuestro amor", "03 · 10 · 2026", "Para ti". */
    eyebrow: "Una carta para ti",
    hint: "Toca el sello para abrir",
    cardEyebrow: "Nos casamos",
    /** Línea bajo el lacre en el sobre vertical. */
    portraitLine: "Te invitan a su boda",
  },

  hero: {
    eyebrow: "Nos casamos",
    cta: "Descubre nuestra historia",
    scrollHint: "Desliza",
  },

  countdown: {
    eyebrow: "Cuenta regresiva",
    title: "3 de octubre, 2026",
    subtitle: "Bogotá · Colombia",
    today: "¡Hoy nos casamos!",
    labels: { days: "Días", hours: "Horas", minutes: "Min", seconds: "Seg" },
  },

  story: {
    eyebrow: "Nuestra historia",
    title: "Un amor escrito en el tiempo de Dios",
    verse: "«El amor todo lo cree, todo lo espera, todo lo soporta.»",
    verseRef: "1 Corintios 13:7",
    moments: [
      {
        title: "El encuentro",
        text: "Hace cuatro años y medio, Dios cruzó nuestros caminos.",
        word: "Encuentro",
      },
      {
        title: "Mejores amigos",
        text: "La amistad se volvió confianza, apoyo y refugio.",
        word: "Amistad",
      },
      {
        title: "El amor esperó",
        text: "El amor siempre estuvo. Solo esperó su momento para florecer.",
        word: "Amor",
      },
      {
        title: "El tiempo perfecto",
        text: "Hoy celebramos ese amor y el comienzo de una nueva etapa.",
        word: "Siempre",
      },
    ],
  },

  gallery: {
    eyebrow: "Galería",
    title: "Nuestros momentos",
    intro:
      "La propuesta en Nueva York y el día que nos dimos el sí ante la ley.",
    quote: "Cada paso nos trajo hasta aquí.",
    hint: "Desliza para recorrer el álbum · toca una foto para ampliarla",
    /** Cada capítulo abre con su propia portadilla dentro del álbum, y
     *  los botones de arriba llevan el carrusel hasta ella. */
    chapters: [
      {
        id: "propuesta",
        label: "La propuesta",
        note: "Nueva York · abril",
      },
      {
        id: "civil",
        label: "El civil",
        note: "El sí ante la ley",
      },
    ],
    photos: [
      {
        src: galMomento,
        chapter: "propuesta",
        alt: "Mateo arrodillado pidiéndole matrimonio a Julieth frente a la baranda del parque",
        caption: "El sí",
      },
      {
        src: galCerezo,
        chapter: "propuesta",
        alt: "Mateo y Julieth tomados de la mano bajo un cerezo en flor",
        caption: "Abril en flor",
      },
      {
        src: galReja,
        chapter: "propuesta",
        alt: "Mateo y Julieth bajando las escaleras bajo el portón de hierro del parque",
        caption: "Camino al parque",
      },
      {
        src: galMirador,
        chapter: "propuesta",
        alt: "Mateo y Julieth de espaldas mirando los edificios de la ciudad",
        caption: "Nueva York",
      },
      {
        src: galEscalera,
        chapter: "civil",
        alt: "Mateo y Julieth bajando la escalera de mármol del palacio de justicia",
        caption: "La escalera",
      },
      {
        src: galConfeti,
        chapter: "civil",
        alt: "Mateo y Julieth caminando sobre pétalos frente a las puertas de bronce",
        caption: "Recién casados",
      },
      {
        src: galCiudadCivil,
        chapter: "civil",
        alt: "Julieth mirando a cámara mientras camina de la mano de Mateo por la ciudad",
        caption: "Por la ciudad",
      },
      {
        src: galEscalinata,
        chapter: "civil",
        alt: "Mateo y Julieth sentados y riendo en la escalinata entre columnas de piedra",
        caption: "Entre columnas",
      },
      {
        src: galDetalle,
        chapter: "civil",
        alt: "Julieth ajustando su tacón blanco antes de la ceremonia",
        caption: "Los detalles",
      },
    ],
  },

  venues: {
    eyebrow: "El gran día",
    title: "Ceremonia & Celebración",
    intro: "Dos momentos, un mismo día. Te esperamos.",
    ceremony: {
      kind: "Ceremonia religiosa",
      name: "Iglesia de Dios Ministerial de Jesucristo Internacional",
      address: "Sede La Colina",
      city: "Bogotá, Colombia",
      time: "11:00 a. m.",
      image: "/images/la-colina-church.webp",
      imageAlt:
        "Iglesia de Dios Ministerial de Jesucristo Internacional, sede La Colina",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Iglesia+de+Dios+Ministerial+de+Jesucristo+Internacional+sede+La+Colina+Bogota",
      calendar: {
        title: "Boda de Mateo & Julieth — Ceremonia",
        description:
          "Ceremonia religiosa de la boda de Mateo & Julieth. ¡Te esperamos!",
        location:
          "Iglesia de Dios Ministerial de Jesucristo Internacional, sede La Colina, Bogotá",
        startLocal: "20261003T110000",
        endLocal: "20261003T123000",
      },
    },
    reception: {
      kind: "Reunión y celebración",
      name: "Retiro San Juan · Salón Magnolia",
      address: "Vía Arrayanes",
      city: "Bogotá, Colombia",
      time: "5:00 p. m.",
      image: "/images/magnolio-2.jpg",
      imageAlt: "Jardines del Retiro San Juan iluminados al caer la noche",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Retiro+San+Juan+Salon+Magnolio+Via+Arrayanes+Bogota",
      calendar: {
        title: "Boda de Mateo & Julieth — Celebración",
        description:
          "Recepción de la boda de Mateo & Julieth. ¡Celebremos juntos!",
        location: "Retiro San Juan · Salón Magnolia, Vía Arrayanes, Bogotá",
        startLocal: "20261003T170000",
        endLocal: "20261004T000000",
      },
    },
  },

  dresscode: {
    eyebrow: "Dress code",
    title: "Etiqueta formal",
    intro: "Queremos vernos y sentirnos espectaculares esa noche.",
    men: {
      label: "Ellos",
      garment: "Traje y corbata",
      notes: [],
      palette: [{ name: "Verde claro", hex: "#A8C5A0" }],
    },
    women: {
      label: "Ellas",
      garment: "Vestido elegante largo",
      notes: [],
      palette: [{ name: "Blanco", hex: "#FFFFFF" }],
    },
    note: "El verde claro estará reservado para la corte y el blanco para la novia.",
  },

  /* Lluvia de sobres. Va como posdata de la carta, no como capítulo:
     el sitio entero es una carta, y una posdata es un aparte por
     definición. Primero que no esperamos nada, después el cómo. */
  gifts: {
    /** Título accesible; en pantalla no se muestra, la posdata habla sola. */
    srTitle: "Lluvia de sobres",
    mark: "P. D.",
    note: "Tu presencia es todo lo que esperamos. Si además quieres tener un detalle con nosotros, habrá una lluvia de sobres: encontrarás un buzón a la entrada del salón.",
    signature: "M & J",
  },

  rsvp: {
    eyebrow: "Confirma tu asistencia",
    title: "¿Nos acompañas?",
    intro: "Tu presencia es nuestro mejor regalo. Confírmanos tu asistencia.",
    hint: "Escribe tu primer nombre y tu primer apellido tal como aparecen en la invitación. Si no coinciden, escríbenos para ayudarte.",
    success: {
      no: "Gracias por avisarnos. Te vamos a extrañar, pero sabemos que estarás con nosotros de corazón.",
    },
  },

  closing: {
    verse: "«Y sobre todas estas cosas, vestíos de amor, que es el vínculo perfecto.»",
    verseRef: "Colosenses 3:14",
    farewell: "Con todo nuestro amor,",
    tagline: "Con amor · 2026",
    image: "/images/cierre.jpg",
  },
} as const;

export type Site = typeof site;
