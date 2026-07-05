/* ————————————————————————————————————————————————
   Todo el contenido del sitio vive aquí.
   Edita este archivo para cambiar textos, fechas y lugares
   sin tocar ningún componente.

   Datos reales de la boda de Mateo & Julieth · Bogotá.
   ———————————————————————————————————————————————— */

/** Sábado 3 de octubre de 2026 — hora de la ceremonia (Bogotá, UTC-5). */
export const WEDDING_DATE = new Date("2026-10-03T11:00:00-05:00");

/** Endpoint del Google Apps Script que escribe en la hoja de cálculo.
 *  Si creas una hoja nueva, redepliega google-apps-script.gs y pega aquí la URL /exec. */
export const RSVP_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbyBBA0C4XRj9DaHfyZIt_JEfAUr8lkMNuV-8TBKR7OJIVIrr9q98fDEQyO5EWFiv0tgmA/exec";

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
        text: "Hace casi cuatro años y medio, Dios cruzó nuestros caminos. Lo que parecía una casualidad era, en realidad, el comienzo de todo.",
        word: "Encuentro",
      },
      {
        title: "Mejores amigos",
        text: "Lo que comenzó como una amistad llena de conversaciones interminables se convirtió en una historia de confianza, apoyo y crecimiento.",
        word: "Amistad",
      },
      {
        title: "Horas de conversación",
        text: "Podíamos hablar durante horas y el tiempo nunca era suficiente. Cada conversación era un lugar al que queríamos volver.",
        word: "Palabras",
      },
      {
        title: "Confidentes",
        text: "Fuimos confidentes en los momentos más importantes de nuestras vidas: el primer refugio en los días buenos y también en los difíciles.",
        word: "Refugio",
      },
      {
        title: "El amor siempre estuvo",
        text: "Aunque el amor siempre estuvo presente, esperó pacientemente hasta el momento perfecto para florecer.",
        word: "Amor",
      },
      {
        title: "El tiempo perfecto",
        text: "Hoy celebramos ese amor y el comienzo de una nueva etapa. En el momento indicado, Dios hizo que todo sucediera.",
        word: "Siempre",
      },
    ],
  },

  gallery: {
    quote: "Cada paso nos trajo hasta aquí.",
    photos: [
      { src: "/images/propuesta.jpg", alt: "Mateo y Julieth contemplando el parque desde un mirador" },
      { src: "/images/other.jpg", alt: "Mateo y Julieth sentados en la escalinata entre columnas de piedra" },
      { src: "/images/detalle.jpg", alt: "Julieth ajustando el tacón blanco antes de la ceremonia" },
    ],
  },

  venues: {
    eyebrow: "El gran día",
    title: "Ceremonia & Celebración",
    intro:
      "Dos momentos, un mismo día inolvidable. Te esperamos para celebrar juntos.",
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
      address: "Vía La Calera",
      city: "Bogotá, Colombia",
      time: "5:00 p. m.",
      image: "/images/magnolio-2.jpg",
      imageAlt: "Jardines del Retiro San Juan iluminados al caer la noche",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Retiro+San+Juan+Salon+Magnolia+Via+La+Calera+Bogota",
      calendar: {
        title: "Boda de Mateo & Julieth — Celebración",
        description:
          "Recepción de la boda de Mateo & Julieth. ¡Celebremos juntos!",
        location: "Retiro San Juan · Salón Magnolia, Vía La Calera, Bogotá",
        startLocal: "20261003T170000",
        endLocal: "20261004T000000",
      },
    },
  },

  dresscode: {
    eyebrow: "Dress code",
    title: "Etiqueta formal",
    intro:
      "Queremos que esa noche todos nos veamos y nos sintamos espectaculares.",
    men: {
      label: "Ellos",
      garment: "Traje y corbata",
      notes: ["Tonos oscuros y sobrios", "Corbata o corbatín — a tu elección"],
      palette: [
        { name: "Carbón", hex: "#2e2e2e" },
        { name: "Azul noche", hex: "#232a36" },
        { name: "Gris piedra", hex: "#6b6560" },
        { name: "Café oscuro", hex: "#4a3a2e" },
      ],
    },
    women: {
      label: "Ellas",
      garment: "Vestido largo",
      notes: ["Tonos tierra, oliva y neutros", "Largo hasta el suelo, si es posible"],
      palette: [
        { name: "Terracota", hex: "#9c5b4a" },
        { name: "Oliva", hex: "#7a7a5c" },
        { name: "Arena", hex: "#c9b99f" },
        { name: "Tierra", hex: "#a67b5b" },
      ],
    },
    note: "El color blanco está reservado para la novia.",
  },

  rsvp: {
    eyebrow: "Confirma tu asistencia",
    title: "¿Nos acompañas?",
    intro:
      "Tu presencia es nuestro mejor regalo. Ayúdanos a preparar cada detalle confirmando tu asistencia.",
    hint: "Solo las personas registradas en la lista de invitados podrán asistir. Si no encuentras tu nombre, escríbenos.",
    success: {
      no: "Gracias por avisarnos. Te vamos a extrañar, pero sabemos que estarás con nosotros de corazón.",
    },
  },

  closing: {
    verse: "«Y sobre todas estas cosas, vestíos de amor, que es el vínculo perfecto.»",
    verseRef: "Colosenses 3:14",
    quote: "No podemos esperar para celebrar este día tan especial contigo.",
    farewell: "Con todo nuestro amor,",
    tagline: "Con amor · La Calera, Bogotá · 2026",
    image: "/images/cierre.jpg",
  },
} as const;

export type Site = typeof site;

/** Respaldo local por si la hoja de invitados no responde. */
export const FALLBACK_GUESTS = [
  "Jose Saenz", "Gladys Saenz", "Adriana Cubillos", "Andrea Saenz", "Sara Saenz",
  "Laura Saenz", "Gio Saenz", "Johana", "Bonifacio Saenz", "Dora Murcia",
  "Viviana Saenz", "Nicolas", "Jessica saenz", "Daniel Esposo", "Miguel Saenz",
  "Diana Saenz", "Beto Saenz", "Carolina +", "Daniel Saenz", "Camilo Saenz",
  "Maria Jose", "German Saenz", "Marlen Murcia", "Cristian", "Geraldine Saenz",
  "hijo", "Rosita Saenz", "Carmen Saenz", "Nubia Gordillo", "Lucho Rojas",
  "Sebastian Rojas", "Santiago Rojas", "Diana Guzman", "Gio Gordillo", "Saray",
  "Pablito", "Martin", "Dona Cecilia", "Elizabeth Ortiz", "Nicolas Ortiz",
  "Juan David", "Tia Maruja", "Javier Otriz", "Daniela Esposa+", "Dario Alarcon",
  "Milena Alarcon", "Javier Ortiz S", "Clarena +", "Julio Escobar", "Betty Escobar",
  "Paty Saenta", "Tefa", "Richar Alarcon", "Esposa+", "Hijo+",
  "Jessica calderon", "Sebastian Marulanda", "Luisa Fernanda", "Cristian Arevalo",
  "Karen Gomez", "Valentina Marulanda", "Sandra Garcia", "Alicia Garcia",
  "Liliana Cubillos", "Raul Borie", "Jaime Cubillos", "Sara Cubillos",
  "Malu Prieto", "Alejandra Cubillos", "Daniela Borie", "Miguel Borie",
  "Sabine Borie", "Xochilt Espinosa", "Fernanda Iglesia", "Juan David Velasquez",
  "Camila", "Elias Nassar", "Hr. Felipe", "Hna. Leandra", "Hno Cristian",
  "Hna Jaqueline", "Luis Mendoza", "Maribel +", "Marina Quintero", "Samuel",
  "Daniela Quintero", "Vicente Quintero", "Blanca Quintero", "Horario Zapata",
  "Blanca Gallego", "Juan José Díaz", "Juan José Díaz (Novia)", "Paula lenis",
  "Sebastian Varon", "Erika Ceballos",
];
