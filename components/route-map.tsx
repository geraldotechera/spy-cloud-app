"use client"

import { useState } from "react"
import { ArrowLeft, Printer, Train, Bus, Footprints, Bike, Navigation } from "lucide-react"

interface RouteOption {
  type: "metro" | "bus" | "caminando" | "bici" | "tren" | "rer"
  line?: string
  direction?: string
  stops?: number
  time: string
  description: string
  recommended?: boolean
}

interface RoutePoint {
  id: number
  name: string
  address: string
  description: string
  duration: string
  category: "alojamiento" | "museo" | "plaza" | "parque" | "monumento" | "barrio"
  x: number // SVG x position (0-680)
  y: number // SVG y position (0-460)
  transport?: RouteOption[] // how to get here from previous point
}

interface DayRoute {
  date: string
  city: string
  country: string
  title: string
  notes: string[]
  points: RoutePoint[]
  // SVG background elements
  mapElements: {
    streets: { x1: number; y1: number; x2: number; y2: number; label?: string; width?: number }[]
    parks: { cx: number; cy: number; rx: number; ry: number; label: string }[]
    water: { d: string; label?: string }[]
  }
}

function getCategoryColor(cat: RoutePoint["category"]) {
  if (cat === "alojamiento") return "#7c3aed"
  if (cat === "museo") return "#dc2626"
  if (cat === "plaza") return "#d97706"
  if (cat === "parque") return "#16a34a"
  if (cat === "monumento") return "#2563eb"
  if (cat === "barrio") return "#0891b2"
  return "#6b7280"
}

function getTransportColor(type: string) {
  if (type === "metro" || type === "rer") return "bg-blue-600"
  if (type === "bus") return "bg-orange-500"
  if (type === "caminando") return "bg-green-600"
  if (type === "bici") return "bg-teal-500"
  if (type === "tren") return "bg-purple-600"
  return "bg-gray-600"
}

function TransportIcon({ type }: { type: string }) {
  if (type === "metro" || type === "rer" || type === "tren") return <Train className="w-3 h-3" />
  if (type === "bus") return <Bus className="w-3 h-3" />
  if (type === "caminando") return <Footprints className="w-3 h-3" />
  if (type === "bici") return <Bike className="w-3 h-3" />
  return <Navigation className="w-3 h-3" />
}

// ─────────────────────────────────────────────
//  MADRID – 6 SEP (llegada + orientación)
// ─────────────────────────────────────────────
const MADRID_SEP6: DayRoute = {
  date: "6 de septiembre 2026",
  city: "Madrid",
  country: "España",
  title: "Llegada a Madrid – Orientación y Gran Vía",
  notes: [
    "Dia de llegada. Vuelo desde Montevideo con escala.",
    "Check-in en Calle del Barquillo 41, 28004 Madrid (Barrio Chueca).",
    "Línea de metro en el aeropuerto: L8 Barajas → Nuevos Ministerios, luego L10 → Alonso Martínez.",
    "Billete aeropuerto: €6 (suplemento incluido). Tarjeta de 10 viajes: €12.20.",
    "Plan suave: paseo por Gran Vía, cena en el barrio y descanso.",
  ],
  mapElements: {
    streets: [
      { x1: 200, y1: 160, x2: 480, y2: 160, label: "Gran Vía", width: 4 },
      { x1: 350, y1: 80, x2: 350, y2: 420, label: "Castellana", width: 3 },
      { x1: 150, y1: 290, x2: 500, y2: 290, label: "Calle Mayor", width: 3 },
      { x1: 200, y1: 100, x2: 200, y2: 380, label: "C.Bailén", width: 2.5 },
    ],
    parks: [{ cx: 570, cy: 340, rx: 55, ry: 45, label: "RETIRO" }],
    water: [],
  },
  points: [
    {
      id: 0, name: "Alojamiento", address: "Calle del Barquillo 41, 28004 Madrid",
      description: "Base Madrid. Metro Alonso Martínez (L4/L5/L10)",
      duration: "", category: "alojamiento", x: 420, y: 130,
    },
    {
      id: 1, name: "Aeropuerto Barajas T4",
      address: "Aeropuerto Adolfo Suárez Madrid-Barajas",
      description: "Llegada internacional. Tomar L8 metro dirección Nuevos Ministerios.",
      duration: "Llegada", category: "monumento", x: 620, y: 60,
      transport: [
        { type: "metro", line: "L8 + L10", direction: "Nuevos Min. → Alonso Martínez", time: "35 min", description: "Metro L8 Barajas → Nuevos Ministerios (18 min), cambio a L10 → Alonso Martínez (7 min). Billete con suplemento aeropuerto €6.", recommended: true },
        { type: "bus", line: "Exprés Aeropuerto", time: "40 min", description: "Bus exprés aeropuerto → Atocha/Cibeles. €5. Luego metro o taxi al alojamiento." },
      ],
    },
    {
      id: 2, name: "Gran Vía + Chueca",
      address: "Gran Vía, 28013 Madrid",
      description: "Paseo de orientación por la principal avenida de Madrid. Barrio Chueca a pasos del alojamiento.",
      duration: "1-2 horas", category: "barrio", x: 310, y: 155,
      transport: [
        { type: "caminando", time: "8 min", description: "Desde alojamiento en Barquillo hacia el Oeste por Calle de Hortaleza hasta Gran Vía.", recommended: true },
      ],
    },
  ],
}

// ─────────────────────────────────────────────
//  MADRID – 7 SEP
// ─────────────────────────────────────────────
const MADRID_SEP7: DayRoute = {
  date: "7 de septiembre 2026",
  city: "Madrid",
  country: "España",
  title: "Madrid – Palacio Real y Barrio de los Austrias",
  notes: [
    "Palacio Real: 10:00-20:00 (verano). €14/persona. Reservar ONLINE en patrimonionacional.es",
    "Plaza Mayor: Gratuita. Mejor ir temprano antes de los grupos de turistas.",
    "Mercado San Miguel: 10:00-24:00. Tapas €2-5 c/u. Ideal para almorzar.",
    "Parque del Retiro: Gratuito. Alquiler de barcas en el estanque €6/30min.",
    "Metro Madrid: billete sencillo €1.50, tarjeta 10 viajes €12.20.",
  ],
  mapElements: {
    streets: [
      { x1: 200, y1: 160, x2: 480, y2: 160, label: "Gran Vía", width: 4 },
      { x1: 150, y1: 290, x2: 500, y2: 290, label: "Calle Mayor", width: 3 },
      { x1: 500, y1: 150, x2: 500, y2: 430, label: "Paseo del Prado", width: 3.5 },
      { x1: 180, y1: 100, x2: 180, y2: 360, label: "C. Bailén", width: 2.5 },
    ],
    parks: [{ cx: 580, cy: 360, rx: 58, ry: 48, label: "RETIRO" }],
    water: [],
  },
  points: [
    {
      id: 0, name: "Alojamiento", address: "Calle del Barquillo 41, 28004",
      description: "Metro Alonso Martínez (L4/L5/L10)",
      duration: "", category: "alojamiento", x: 420, y: 125,
    },
    {
      id: 1, name: "Palacio Real",
      address: "Calle de Bailén s/n, 28071 Madrid",
      description: "El palacio más grande de Europa Occidental. Armería Real, salones de estado, jardines de Sabatini.",
      duration: "2-3 horas", category: "museo", x: 165, y: 255,
      transport: [
        { type: "metro", line: "L2 Roja", direction: "Las Rosas", time: "12 min", description: "Alonso Martínez → Ópera (L2, 4 paradas). Salir por Ópera, caminar 8 min hacia el Sur por C. de Bailén.", recommended: true },
        { type: "caminando", time: "30 min", description: "Por Gran Vía hacia el Oeste hasta Plaza de España, bajar C. de Bailén. Ruta escénica." },
        { type: "bus", line: "L25 o L39", time: "22 min", description: "Bus 25 desde Barquillo/Génova hasta Palacio Real, dirección Suroeste." },
      ],
    },
    {
      id: 2, name: "Plaza Mayor",
      address: "Plaza Mayor, 28012 Madrid",
      description: "La plaza más emblemática de Madrid, s.XVII. Casa de la Panadería con frescos, Arco de Cuchilleros.",
      duration: "45 min", category: "plaza", x: 300, y: 290,
      transport: [
        { type: "caminando", time: "12 min", description: "Desde Palacio Real hacia el Este por Calle Mayor. Pasar junto a la Catedral de la Almudena.", recommended: true },
      ],
    },
    {
      id: 3, name: "Mercado de San Miguel",
      address: "Plaza de San Miguel s/n, 28005",
      description: "Mercado gastronómico cubierto. Tapas, vinos y delicias españolas en un edificio de hierro del s.XX.",
      duration: "1 hora", category: "monumento", x: 275, y: 285,
      transport: [
        { type: "caminando", time: "3 min", description: "A 200 metros al Noroeste de Plaza Mayor. Seguir por Calle de San Miguel.", recommended: true },
      ],
    },
    {
      id: 4, name: "Puerta del Sol",
      address: "Puerta del Sol s/n, 28013 Madrid",
      description: "Km 0 de España. Estatua del Oso y el Madroño. Corazón neurálgico de Madrid.",
      duration: "30 min", category: "plaza", x: 360, y: 280,
      transport: [
        { type: "caminando", time: "7 min", description: "Desde Mercado San Miguel por Calle Mayor hacia el Este hasta Puerta del Sol.", recommended: true },
      ],
    },
    {
      id: 5, name: "Parque del Retiro",
      address: "Parque del Buen Retiro, 28009 Madrid",
      description: "118 hectáreas. Palacio de Cristal, estanque con barcas, jardines. UNESCO Patrimonio Mundial.",
      duration: "1.5-2 horas", category: "parque", x: 565, y: 355,
      transport: [
        { type: "metro", line: "L2 Roja", direction: "Las Rosas", time: "8 min", description: "Sol (L1/L2/L3) → Retiro (L2 dir. Las Rosas, 2 paradas). Entrada principal por Puerta de Alcalá.", recommended: true },
        { type: "caminando", time: "22 min", description: "Por Carrera de San Jerónimo y Barrio de las Letras hasta la entrada del Retiro." },
        { type: "bici", line: "BiciMAD", time: "12 min", description: "BiciMAD desde Sol por Calle de Alcalá hasta el parque. Estaciones en Sol y en Retiro." },
      ],
    },
  ],
}

// ─────────────────────────────────────────────
//  MADRID – 8 SEP
// ─────────────────────────────────────────────
const MADRID_SEP8: DayRoute = {
  date: "8 de septiembre 2026",
  city: "Madrid",
  country: "España",
  title: "Madrid – Museos del Arte y Barrio de Salamanca",
  notes: [
    "Museo del Prado: 10:00-20:00. €15/persona. Reservar online en museodelprado.es",
    "Reina Sofía: 10:00-21:00 (lun cerrado). €12/persona. Obra cumbre: Guernica de Picasso.",
    "Barrio de Salamanca: zona de compras de lujo. Tiendas de moda española.",
    "Cibeles y Neptuno: gratuitas, imperdibles por la noche iluminadas.",
  ],
  mapElements: {
    streets: [
      { x1: 150, y1: 200, x2: 560, y2: 200, label: "Calle de Alcalá", width: 3.5 },
      { x1: 350, y1: 60, x2: 350, y2: 430, label: "Paseo de la Castellana", width: 4 },
      { x1: 460, y1: 100, x2: 460, y2: 450, label: "Paseo del Prado", width: 3.5 },
    ],
    parks: [{ cx: 580, cy: 330, rx: 55, ry: 48, label: "RETIRO" }],
    water: [],
  },
  points: [
    {
      id: 0, name: "Alojamiento", address: "Calle del Barquillo 41, 28004",
      description: "Metro Alonso Martínez (L4/L5/L10)",
      duration: "", category: "alojamiento", x: 370, y: 130,
    },
    {
      id: 1, name: "Museo del Prado",
      address: "Paseo del Prado s/n, 28014",
      description: "Uno de los museos de arte más importantes del mundo. Velázquez, Goya, El Bosco, Rubens. No perderse Las Meninas.",
      duration: "2-3 horas", category: "museo", x: 455, y: 330,
      transport: [
        { type: "metro", line: "L2 Roja", direction: "Las Rosas", time: "10 min", description: "Alonso Martínez → Banco de España (L2, 3 paradas). Caminar 10 min al Sur por Paseo del Prado.", recommended: true },
        { type: "bus", line: "L10 o L14", time: "18 min", description: "Bus por Calle de Alcalá hasta Cibeles, bajar y caminar 5 min al Sur." },
        { type: "caminando", time: "25 min", description: "Por Calle de Alcalá hacia el Este, bajar por Paseo del Prado." },
      ],
    },
    {
      id: 2, name: "Museo Reina Sofía",
      address: "Calle de Santa Isabel 52, 28012",
      description: "Arte moderno y contemporáneo. Guernica de Picasso, Dalí, Miró. El edificio es un antiguo hospital del s.XVIII.",
      duration: "2 horas", category: "museo", x: 445, y: 390,
      transport: [
        { type: "caminando", time: "8 min", description: "Desde Prado al Sur por el Paseo del Prado hasta Glorieta del Emperador Carlos V (Atocha).", recommended: true },
      ],
    },
    {
      id: 3, name: "Fuente de Cibeles",
      address: "Plaza de Cibeles, 28014",
      description: "Símbolo de Madrid. La fuente de la diosa Cibeles data de 1782. Frente al Palacio de Comunicaciones.",
      duration: "20 min", category: "monumento", x: 430, y: 215,
      transport: [
        { type: "metro", line: "L2 Roja", direction: "Cuatro Caminos", time: "5 min", description: "Atocha → Banco de España (L1, 3 paradas). Salir y caminar 2 min hasta Cibeles.", recommended: true },
        { type: "caminando", time: "18 min", description: "Desde Reina Sofía al Norte por el Paseo del Prado hasta Cibeles." },
      ],
    },
    {
      id: 4, name: "Barrio de Salamanca",
      address: "Calle de Serrano, 28006",
      description: "El barrio más elegante de Madrid. Calle Serrano con marcas internacionales y tiendas de diseño español.",
      duration: "1 hora", category: "barrio", x: 510, y: 155,
      transport: [
        { type: "caminando", time: "12 min", description: "Desde Cibeles al Norte por Paseo de Recoletos hasta Calle de Serrano.", recommended: true },
      ],
    },
  ],
}

// ─────────────────────────────────────────────
//  BARCELONA – 9 SEP
// ─────────────────────────────────────────────
const BARCELONA_SEP9: DayRoute = {
  date: "9 de septiembre 2026",
  city: "Barcelona",
  country: "España",
  title: "Barcelona – Llegada, Sagrada Família y Born",
  notes: [
    "Tren Madrid-Barcelona: AVE desde Atocha. Llegarán a Barcelona Sants.",
    "Locker en Sants para dejar equipaje hasta check-in (~€8).",
    "Sagrada Família: Reservar TICKETS ONLINE con antelación en sagradafamilia.org. €26/persona con audioguía.",
    "Barrio del Born: zona de tapas y ambiente. El Mercat de Santa Caterina es más auténtico que La Boqueria.",
    "Alojamiento: Plaza de Europa 25, L'Hospitalet de Llobregat. Metro L1 Torrassa o L9 Europa/Fira.",
  ],
  mapElements: {
    streets: [
      { x1: 100, y1: 300, x2: 600, y2: 300, label: "Diagonal", width: 4 },
      { x1: 100, y1: 390, x2: 600, y2: 390, label: "Gran Vía BCN", width: 3.5 },
      { x1: 350, y1: 80, x2: 350, y2: 460, label: "Passeig de Gràcia", width: 4 },
      { x1: 480, y1: 100, x2: 480, y2: 460, label: "Rambla del Poblenou", width: 2 },
    ],
    parks: [
      { cx: 200, cy: 170, rx: 80, ry: 60, label: "PARK GÜELL" },
    ],
    water: [{ d: "M 560 80 L 680 80 L 680 460 L 580 460 Z", label: "Mar" }],
  },
  points: [
    {
      id: 0, name: "Alojamiento BCN", address: "Plaza de Europa 25, L'Hospitalet",
      description: "Metro L1 Torrassa o L9 Europa/Fira",
      duration: "", category: "alojamiento", x: 80, y: 395,
    },
    {
      id: 1, name: "Sagrada Família",
      address: "Carrer de Mallorca 401, 08013 Barcelona",
      description: "La obra maestra de Gaudí, en construcción desde 1882. Fachada de la Natividad, Pasión y el interior lluminoso. UNESCO Patrimonio.",
      duration: "2-3 horas", category: "museo", x: 430, y: 295,
      transport: [
        { type: "metro", line: "L2 Lila", direction: "Badalona", time: "25 min", description: "Torrassa (L1) → Passeig de Gràcia (cambio L2) → Sagrada Família. Total 25 min aprox.", recommended: true },
        { type: "metro", line: "L5 Azul", direction: "Vall d'Hebron", time: "20 min", description: "Desde Sants Estació (L5) → Sagrada Família directamente en 8 paradas." },
      ],
    },
    {
      id: 2, name: "Barrio del Born / Mercat Santa Caterina",
      address: "Avinguda de Francesc Cambó 16, 08003",
      description: "El barrio más auténtico de Barcelona. Mercat de Santa Caterina (alternativa a Boqueria), Basílica Santa María del Mar.",
      duration: "1.5 horas", category: "barrio", x: 540, y: 355,
      transport: [
        { type: "metro", line: "L4 Amarilla", direction: "La Pau", time: "15 min", description: "Sagrada Família (L5) → Verdaguer (cambio L4) → Jaume I. Caminar 5 min al Born.", recommended: true },
      ],
    },
    {
      id: 3, name: "Las Ramblas",
      address: "La Rambla, 08002 Barcelona",
      description: "El paseo más famoso de Barcelona, 1.2 km. Mercado de la Boqueria, Liceo, Mirador de Colón al final.",
      duration: "45 min", category: "barrio", x: 400, y: 420,
      transport: [
        { type: "metro", line: "L3 Verde", direction: "Trinitat Nova", time: "10 min", description: "Jaume I (L4) → Liceu (L3). Las Ramblas a 1 min a pie.", recommended: true },
        { type: "caminando", time: "20 min", description: "Desde Born al Oeste por Carrer de la Princesa hasta Las Ramblas." },
      ],
    },
  ],
}

// ─────────────────────────────────────────────
//  BARCELONA – 10 SEP
// ─────────────────────────────────────────────
const BARCELONA_SEP10: DayRoute = {
  date: "10 de septiembre 2026",
  city: "Barcelona",
  country: "España",
  title: "Barcelona – Gaudí, Picasso y Montjuïc",
  notes: [
    "Park Güell: €10/persona. Reservar horario en parkguell.barcelona",
    "Casa Batlló: €35/persona. La experiencia nocturna es especial. casabatllo.es",
    "Museo Picasso: €12/persona. Martes tardes gratis (cola larga). museupicasso.bcn.cat",
    "Montjuïc: Castillo €9 + Fundación Miró €14. Teleférico desde el puerto o metro.",
  ],
  mapElements: {
    streets: [
      { x1: 100, y1: 290, x2: 620, y2: 290, label: "Diagonal", width: 4 },
      { x1: 350, y1: 60, x2: 350, y2: 450, label: "Passeig de Gràcia", width: 4 },
    ],
    parks: [
      { cx: 200, cy: 160, rx: 80, ry: 65, label: "PARK GÜELL" },
      { cx: 130, cy: 370, rx: 90, ry: 70, label: "MONTJUÏC" },
    ],
    water: [{ d: "M 560 100 L 680 100 L 680 460 L 600 460 Z", label: "Mar" }],
  },
  points: [
    {
      id: 0, name: "Alojamiento BCN", address: "Plaza de Europa 25, L'Hospitalet",
      description: "Metro L1 Torrassa o L9 Europa/Fira",
      duration: "", category: "alojamiento", x: 70, y: 370,
    },
    {
      id: 1, name: "Park Güell",
      address: "Carrer d'Olot s/n, 08024 Barcelona",
      description: "Parque diseñado por Gaudí, 1900-1914. Zona monumental con la famosa terraza de mosaicos y el dragón. Vistas panorámicas de la ciudad.",
      duration: "1.5 horas", category: "parque", x: 195, y: 165,
      transport: [
        { type: "bus", line: "Bus 92 o D40", time: "30 min", description: "Metro L3 → Lesseps, luego Bus 92 o D40 a la entrada del Park Güell. O subir caminando 15 min desde Lesseps.", recommended: true },
        { type: "metro", line: "L3 Verde", direction: "Trinitat Nova", time: "40 min", description: "Torrassa (L1) → Espanya (cambio L3) → Lesseps. Subir 15 min caminando al parque." },
      ],
    },
    {
      id: 2, name: "Casa Batlló",
      address: "Passeig de Gràcia 43, 08007",
      description: "Obra maestra modernista de Gaudí (1904-1906). Fachada de mosaicos, dragón en el tejado. Interior completamente restaurado.",
      duration: "1.5 horas", category: "museo", x: 345, y: 290,
      transport: [
        { type: "metro", line: "L3 Verde", direction: "Zona Universitaria", time: "15 min", description: "Desde Lesseps → Passeig de Gràcia. Casa Batlló a 2 min caminando.", recommended: true },
      ],
    },
    {
      id: 3, name: "Museo Picasso",
      address: "Carrer de Montcada 15-23, 08003",
      description: "4.200 obras del período barcelonés de Picasso. Edificio medieval con cinco palacios del s.XV. Imprescindible la serie Las Meninas.",
      duration: "1.5 horas", category: "museo", x: 500, y: 340,
      transport: [
        { type: "metro", line: "L4 Amarilla", direction: "La Pau", time: "12 min", description: "Passeig de Gràcia (L3→L4) → Jaume I. Carrer de Montcada a 5 min.", recommended: true },
      ],
    },
    {
      id: 4, name: "Montjuïc (Castillo + Fundación Miró)",
      address: "Castell de Montjuïc, 08038",
      description: "Castillo del s.XVII con vistas panorámicas. Fundación Joan Miró con 14.000 obras del artista surrealista.",
      duration: "2-3 horas", category: "monumento", x: 130, y: 375,
      transport: [
        { type: "metro", line: "L3 Verde", direction: "Zona Universitaria", time: "20 min", description: "Jaume I (L4) → Paral·lel (cambio L3). Funicular de Montjuïc (incluido en T-Casual) o teleférico.", recommended: true },
      ],
    },
  ],
}

// ─────────────────────────────────────────────
//  BARCELONA – 11 SEP
// ─────────────────────────────────────────────
const BARCELONA_SEP11: DayRoute = {
  date: "11 de septiembre 2026",
  city: "Barcelona",
  country: "España",
  title: "Barcelona – Camp Nou, Barceloneta y despedida",
  notes: [
    "Camp Nou Tour: €28/persona. Visitar vestuarios, túnel y museo del club. fcbarcelona.com",
    "Diada Nacional de Cataluña (11 sep): posibles manifestaciones en el centro, el transporte funciona.",
    "Barceloneta: La playa más famosa de Barcelona, a 20 min del centro en metro.",
    "Por la tarde: regreso al alojamiento y preparar maletas para el tren a París mañana.",
  ],
  mapElements: {
    streets: [
      { x1: 150, y1: 300, x2: 620, y2: 300, label: "Diagonal", width: 4 },
      { x1: 350, y1: 60, x2: 350, y2: 450, label: "Passeig de Gràcia", width: 4 },
    ],
    parks: [{ cx: 160, cy: 290, rx: 90, ry: 60, label: "CAMP NOU" }],
    water: [{ d: "M 540 180 L 680 100 L 680 460 L 560 460 Z", label: "Mar" }],
  },
  points: [
    {
      id: 0, name: "Alojamiento BCN", address: "Plaza de Europa 25, L'Hospitalet",
      description: "Metro L1 Torrassa o L9 Europa/Fira",
      duration: "", category: "alojamiento", x: 70, y: 380,
    },
    {
      id: 1, name: "Camp Nou – Tour FC Barcelona",
      address: "Carrer d'Arístides Maillol s/n, 08028",
      description: "El estadio más grande de Europa (99.354 espectadores). Tour por vestuarios históricos, túnel de acceso al campo y el extenso museo del club.",
      duration: "1.5-2 horas", category: "museo", x: 155, y: 290,
      transport: [
        { type: "metro", line: "L3 Verde", direction: "Zona Universitaria", time: "20 min", description: "Torrassa (L1) → Espanya (cambio L3) → Palau Reial o Les Corts. Camp Nou a 10 min caminando.", recommended: true },
      ],
    },
    {
      id: 2, name: "Barceloneta",
      address: "Platja de la Barceloneta, 08003",
      description: "La playa urbana de Barcelona. Paseo marítimo, chiringuitos, vistas al Puerto Olímpico. Ideal para el almuerzo junto al mar.",
      duration: "2 horas", category: "parque", x: 570, y: 380,
      transport: [
        { type: "metro", line: "L4 Amarilla", direction: "La Pau", time: "25 min", description: "Les Corts (L3) → Passeig de Gràcia (cambio L4) → Barceloneta. Salir al paseo marítimo.", recommended: true },
      ],
    },
    {
      id: 3, name: "Rambla del Poblenou",
      address: "Rambla del Poblenou, 08005",
      description: "La Rambla auténtica y local, sin turistas. Bares, heladerías y terraza tranquila. El 22@ techno district alrededor.",
      duration: "1 hora", category: "barrio", x: 520, y: 310,
      transport: [
        { type: "caminando", time: "15 min", description: "Desde Barceloneta al Norte por el Paseo Marítimo hasta Poblenou.", recommended: true },
      ],
    },
  ],
}

// ─────────────────────────────────────────────
//  PARIS – 12 SEP
// ─────────────────────────────────────────────
const PARIS_SEP12: DayRoute = {
  date: "12 de septiembre 2026",
  city: "París",
  country: "Francia",
  title: "París – Llegada, Sainte-Chapelle y Crucero por el Sena",
  notes: [
    "Tren Barcelona-París: AVE/TGV desde Sants. Llegar a Gare de Lyon. Locker disponible en estación.",
    "Alojamiento: 57 Rue Schaeffer, Aubervilliers. Metro L12 → Front Populaire o L7 → Aubervilliers-Pantin.",
    "Sainte-Chapelle: 10:00-17:00. €11/persona. Reservar en sainte-chapelle.fr para evitar colas.",
    "Crucero con cena: Bateaux Parisiens o similar. €85/persona. Reservar con antelación.",
    "Navigo Easy o carnet de 10 tickets: €17.35 (zona 1-2). Válido metro, RER, bus.",
  ],
  mapElements: {
    streets: [
      { x1: 100, y1: 280, x2: 650, y2: 280, label: "Champs-Élysées", width: 4 },
      { x1: 340, y1: 60, x2: 340, y2: 460, label: "Boulevard Haussmann", width: 3 },
    ],
    parks: [{ cx: 175, cy: 250, rx: 70, ry: 80, label: "BOIS DE BOULOGNE" }],
    water: [{ d: "M 180 340 Q 340 310 500 340 Q 580 355 650 340 L 650 380 Q 580 400 500 385 Q 340 360 180 385 Z", label: "Sena" }],
  },
  points: [
    {
      id: 0, name: "Alojamiento París", address: "57 Rue Schaeffer, Aubervilliers",
      description: "Metro L12 Front Populaire o L7 Aubervilliers-Pantin",
      duration: "", category: "alojamiento", x: 400, y: 85,
    },
    {
      id: 1, name: "Gare de Lyon",
      address: "Place Louis-Armand, 75012 Paris",
      description: "Estación de llegada del TGV desde Barcelona. Gran edificio Belle Époque con el famoso restaurante Le Train Bleu.",
      duration: "30 min (dejar equipaje)", category: "monumento", x: 540, y: 360,
      transport: [
        { type: "metro", line: "L7 Violeta", direction: "Villejuif-Louis Aragon", time: "35 min", description: "Alojamiento (L12 → Opéra, cambio L7) → Gare de Lyon. Total 35 min con el TGV ya llegado.", recommended: true },
      ],
    },
    {
      id: 2, name: "Sainte-Chapelle",
      address: "8 Boulevard du Palais, 75001 Paris",
      description: "Joya del gótico del s.XIII. 1.113 m² de vidrieras medievales que narran la Biblia. Una de las más hermosas del mundo. En la Île de la Cité.",
      duration: "1 hora", category: "museo", x: 310, y: 360,
      transport: [
        { type: "metro", line: "L4 Lila", direction: "Montrouge", time: "12 min", description: "Gare de Lyon (L1) → Châtelet, cambio L4 → Cité. Sainte-Chapelle a 3 min caminando.", recommended: true },
      ],
    },
    {
      id: 3, name: "Notre-Dame (exterior)",
      address: "Parvis Notre-Dame, 75004 Paris",
      description: "La catedral gótica más famosa del mundo. Reconstruida tras el incendio de 2019, con nuevo tejado y flechas. Solo exterior en 2026.",
      duration: "30 min", category: "monumento", x: 340, y: 350,
      transport: [
        { type: "caminando", time: "5 min", description: "Desde Sainte-Chapelle cruzar el Parvis Notre-Dame. Ambas en la Île de la Cité.", recommended: true },
      ],
    },
    {
      id: 4, name: "Crucero cena por el Sena",
      address: "Port de la Bourdonnais, 75007 Paris",
      description: "Crucero de 2 horas navegando bajo los puentes de París con cena a bordo. Vistas iluminadas del Louvre, Notre-Dame, Torre Eiffel y Pont Alexandre III.",
      duration: "2 horas", category: "monumento", x: 185, y: 340,
      transport: [
        { type: "metro", line: "RER C", direction: "Versailles", time: "20 min", description: "Cité (L4) → Saint-Michel-Notre-Dame, cambio RER C → Champ de Mars Tour Eiffel. Muelle a 5 min.", recommended: true },
      ],
    },
  ],
}

// ─────────────────────────────────────────────
//  PARIS – 13 SEP
// ─────────────────────────────────────────────
const PARIS_SEP13: DayRoute = {
  date: "13 de septiembre 2026",
  city: "París",
  country: "Francia",
  title: "París – Louvre, Torre Eiffel, Arco del Triunfo y Moulin Rouge",
  notes: [
    "Louvre: 9:00-18:00 (cerrado martes). €22/persona. Reservar ONLINE en louvre.fr. Llegar a las 9:00.",
    "Torre Eiffel: Summit (cumbre) €36/persona. Reservar con semanas de anticipación en toureiffel.paris",
    "Arco del Triunfo: €13/persona. Subida a la terraza con vistas de los Champs-Élysées.",
    "Moulin Rouge: Espectáculo solo €87/persona (sin cena). Funciones a las 21:00 y 23:00. moulinrouge.fr",
  ],
  mapElements: {
    streets: [
      { x1: 240, y1: 250, x2: 560, y2: 250, label: "Champs-Élysées", width: 5 },
      { x1: 340, y1: 60, x2: 340, y2: 460, label: "Boulevard Haussmann", width: 3 },
      { x1: 100, y1: 360, x2: 620, y2: 360, label: "Quai des Tuileries", width: 2 },
    ],
    parks: [{ cx: 380, cy: 310, rx: 70, ry: 35, label: "TUILERIES" }],
    water: [{ d: "M 100 380 Q 340 355 580 380 L 580 420 Q 340 400 100 420 Z", label: "Sena" }],
  },
  points: [
    {
      id: 0, name: "Alojamiento París", address: "57 Rue Schaeffer, Aubervilliers",
      description: "Metro L12 Front Populaire o L7 Aubervilliers-Pantin",
      duration: "", category: "alojamiento", x: 370, y: 90,
    },
    {
      id: 1, name: "Museo del Louvre",
      address: "Rue de Rivoli, 75001 Paris",
      description: "El museo más visitado del mundo. 35.000 obras. La Gioconda (Mona Lisa), Venus de Milo, Victoria de Samotracia. Pirámide de Pei. Llevar mínimo 3 horas.",
      duration: "3 horas", category: "museo", x: 360, y: 345,
      transport: [
        { type: "metro", line: "L7 Violeta", direction: "Mairie d'Ivry", time: "18 min", description: "Aubervilliers-Pantin-Quatre Chemins (L7) → Palais Royal - Musée du Louvre. Directo en 8 paradas.", recommended: true },
      ],
    },
    {
      id: 2, name: "Torre Eiffel",
      address: "Champ de Mars, 75007 Paris",
      description: "La estructura de hierro más famosa del mundo (1889). Subir al Summit (3er piso, 276m). Por la noche se ilumina y destella cada hora.",
      duration: "2 horas", category: "monumento", x: 185, y: 345,
      transport: [
        { type: "metro", line: "L6 Verde", direction: "Nation", time: "20 min", description: "Palais Royal L1 → Bir-Hakeim (cambio L6). La Torre Eiffel está a 5 min caminando.", recommended: true },
        { type: "bus", line: "Bus 82 o 87", time: "20 min", description: "Bus desde Châtelet / Musée d'Orsay directo al Champ de Mars." },
      ],
    },
    {
      id: 3, name: "Arco del Triunfo",
      address: "Place Charles de Gaulle, 75008",
      description: "Monumento de Napoleón, 50m de altura. Subir a la terraza para las mejores vistas de los 12 bulevares que irradian desde la plaza.",
      duration: "1 hora", category: "monumento", x: 245, y: 250,
      transport: [
        { type: "metro", line: "L6 Verde", direction: "Charles de Gaulle-Étoile", time: "15 min", description: "Bir-Hakeim (L6) → Charles de Gaulle-Étoile. Arco del Triunfo en la Plaza.", recommended: true },
        { type: "caminando", time: "25 min", description: "Desde Torre Eiffel por el Champ de Mars al Norte hasta los Champs-Élysées y subir hasta el Arco." },
      ],
    },
    {
      id: 4, name: "Moulin Rouge",
      address: "82 Boulevard de Clichy, 75018 Paris",
      description: "El cabaret más famoso del mundo desde 1889. Espectáculo Féerie con 60 artistas, cancán y escenografía de lujo. Función 21:00.",
      duration: "2 horas (noche)", category: "barrio", x: 325, y: 145,
      transport: [
        { type: "metro", line: "L2 Verde/L12", direction: "Place de Clichy / Blanche", time: "20 min", description: "Charles de Gaulle (L2) → Blanche. Moulin Rouge a 2 min a pie. O volver al alojamiento, cenar y volver a las 20:30.", recommended: true },
      ],
    },
  ],
}

// ─────────────────────────────────────────────
//  14 SEP — VERSALLES DIA COMPLETO (NO Ámsterdam)
// ─────────────────────────────────────────────
const VERSAILLES_SEP14: DayRoute = {
  date: "14 de septiembre 2026",
  city: "Versalles",
  country: "Francia",
  title: "Versalles – Palacio Real y Jardines. Dia completo desde Paris",
  notes: [
    "TICKET PASSPORT: €21.50/persona. Incluye Palacio principal, Grandes Écuries y exposiciones. Reservar en chateauversailles.fr",
    "Jardines: GRATUITOS salvo días de Grandes Eaux Musicales (sábados y domingos €10 extra).",
    "14 septiembre es viernes: jardines incluidos en el ticket, sin costo extra.",
    "Transporte: RER C desde Paris (zona 1-4). Con Navigo o ticket especial Versailles: €4.60 ida.",
    "Horario Palacio: 9:00-17:30 (última entrada 17:00). Llegar a las 9:00 para evitar colas.",
    "Llevar picnic o almorzar en el Grand Canal. Restaurantes dentro son muy caros.",
    "Regreso a París antes de las 19:00. Por la noche libre en Montmartre.",
  ],
  mapElements: {
    streets: [
      { x1: 60, y1: 230, x2: 660, y2: 230, label: "Avenue de Paris (eje principal)", width: 5 },
      { x1: 360, y1: 60, x2: 360, y2: 460, label: "Eje Norte-Sur (jardines)", width: 3 },
    ],
    parks: [
      { cx: 200, cy: 320, rx: 160, ry: 120, label: "JARDINES DE VERSALLES" },
      { cx: 200, cy: 380, rx: 40, ry: 25, label: "Grand Canal" },
    ],
    water: [{ d: "M 160 365 Q 200 350 240 365 L 245 400 Q 200 415 155 400 Z", label: "Canal" }],
  },
  points: [
    {
      id: 0, name: "Alojamiento París", address: "57 Rue Schaeffer, Aubervilliers",
      description: "Metro L12 Front Populaire. Salir temprano a las 8:00.",
      duration: "", category: "alojamiento", x: 580, y: 120,
    },
    {
      id: 1, name: "Gare de Versailles Château Rive Gauche",
      address: "Place du Général de Gaulle, Versailles",
      description: "Estación de llegada del RER C. A 5 minutos caminando de la puerta principal del Palacio.",
      duration: "45 min desde París", category: "monumento", x: 440, y: 200,
      transport: [
        { type: "rer", line: "RER C (dir. Versailles)", direction: "Versailles Château Rive Gauche", time: "45 min", description: "Desde Paris (Saint-Michel Notre-Dame o Invalides) tomar RER C dir. Versailles Château Rive Gauche. Ticket especial €4.60 o Navigo zona 1-5.", recommended: true },
      ],
    },
    {
      id: 2, name: "Palacio de Versalles",
      address: "Place d'Armes, 78000 Versailles",
      description: "Residencia oficial de Luis XIV, XV y XVI. 700 habitaciones, Galería de los Espejos (73m, 357 espejos), Salón del Trono, Capilla Real. Construido entre 1661-1710.",
      duration: "2-3 horas", category: "museo", x: 370, y: 220,
      transport: [
        { type: "caminando", time: "5 min", description: "Desde la estación, caminar por Avenue de Paris hacia el Oeste hasta la entrada principal (Grille Royale). Comprar ticket en la app o taquillas.", recommended: true },
      ],
    },
    {
      id: 3, name: "Galería de los Espejos",
      address: "Palacio de Versalles — Piso 1",
      description: "La pieza central del Palacio. 73 metros de largo, 357 espejos que reflejan 17 ventanas al jardín. Luis XIV la usó para deslumbrar a los embajadores extranjeros.",
      duration: "30 min (dentro del recorrido)", category: "museo", x: 370, y: 240,
      transport: [
        { type: "caminando", time: "1 min", description: "Dentro del Palacio. Sigue el recorrido señalizado desde el Salón de la Guerra hasta el Salón de la Paz.", recommended: true },
      ],
    },
    {
      id: 4, name: "Jardines y Fuentes",
      address: "Jardins du Château de Versailles",
      description: "800 hectáreas de jardines diseñados por Le Nôtre. Fuente de Apolo, Bosquetes, Parterre Norte y Sur. El Grand Canal es perfecto para descansar.",
      duration: "2-3 horas", category: "parque", x: 195, y: 310,
      transport: [
        { type: "caminando", time: "5 min", description: "Salir por la puerta trasera del Palacio (Parterre) directamente a los jardines. La Fuente de Latona está al centro del eje principal.", recommended: true },
      ],
    },
    {
      id: 5, name: "Gran Trianón / Pequeño Trianón",
      address: "Domaine de Marie-Antoinette, Versailles",
      description: "Residencia privada de María Antonieta. El Pequeño Trianón fue su refugio personal. El Hameau (aldea campestre) es único.",
      duration: "1-1.5 horas", category: "museo", x: 135, y: 250,
      transport: [
        { type: "caminando", time: "20 min", description: "Desde la Fuente de Apolo, seguir el camino al Norte del Grand Canal. O tomar el Petit Train (€9) dentro del parque.", recommended: true },
        { type: "bici", line: "Alquiler en el parque", time: "8 min", description: "Alquiler de bicicletas en el Grand Canal: €7/hora. Excelente para recorrer todo el dominio." },
      ],
    },
    {
      id: 6, name: "Regreso a París",
      address: "Gare de Versailles → Paris Saint-Michel",
      description: "Regreso en RER C. En París, paseo nocturno opcional por Montmartre o cena en el Barrio Latino.",
      duration: "45 min", category: "monumento", x: 450, y: 200,
      transport: [
        { type: "rer", line: "RER C (dir. Paris)", direction: "Paris Austerlitz / Saint-Michel", time: "45 min", description: "Desde Versailles Château Rive Gauche tomar RER C hacia Paris. Bajar en Saint-Michel o Invalides según destino.", recommended: true },
      ],
    },
  ],
}

// ─────────────────────────────────────────────
//  PARIS – 15 SEP
// ─────────────────────────────────────────────
const PARIS_SEP15: DayRoute = {
  date: "15 de septiembre 2026",
  city: "París",
  country: "Francia",
  title: "París – Musée d'Orsay, Montmartre y despedida",
  notes: [
    "Musée d'Orsay: 9:30-18:00 (jueves hasta 21:45). €16/persona. Impresionismo: Monet, Renoir, Van Gogh.",
    "Museo Rodin: 10:00-18:30. €14/persona. El Pensador y El Beso en el jardín.",
    "Montmartre: Gratuito. Sacré-Cœur, Place du Tertre con pintores, Muro del Amor.",
    "Por la tarde/noche: tren nocturno o vuelo a Milán. Confirmar horarios.",
  ],
  mapElements: {
    streets: [
      { x1: 100, y1: 310, x2: 620, y2: 310, label: "Rive Gauche (orilla izquierda)", width: 3 },
      { x1: 340, y1: 60, x2: 340, y2: 460, label: "Boulevard Saint-Michel", width: 3 },
    ],
    parks: [{ cx: 360, cy: 175, rx: 90, ry: 35, label: "MONTMARTRE" }],
    water: [{ d: "M 100 340 Q 340 315 580 340 L 580 375 Q 340 355 100 375 Z", label: "Sena" }],
  },
  points: [
    {
      id: 0, name: "Alojamiento París", address: "57 Rue Schaeffer, Aubervilliers",
      description: "Metro L12 Front Populaire",
      duration: "", category: "alojamiento", x: 365, y: 95,
    },
    {
      id: 1, name: "Musée d'Orsay",
      address: "1 Rue de la Légion d'Honneur, 75007",
      description: "Antigua estación de tren convertida en museo. La mejor colección impresionista del mundo: Monet, Degas, Renoir, Van Gogh, Cézanne.",
      duration: "2 horas", category: "museo", x: 295, y: 340,
      transport: [
        { type: "rer", line: "RER C", direction: "Versailles", time: "25 min", description: "Aubervilliers (metro) → Saint-Michel Notre-Dame, cambio RER C → Musée d'Orsay. Estación justo frente al museo.", recommended: true },
        { type: "metro", line: "L12 Verde", direction: "Mairie d'Issy", time: "25 min", description: "Desde alojamiento L12 → Solférino (a 3 min del museo)." },
      ],
    },
    {
      id: 2, name: "Museo Rodin + Palais Royal",
      address: "77 Rue de Varenne, 75007 Paris",
      description: "El escultor Auguste Rodin donó su obra y su casa al Estado. El jardín exterior es gratuito. El Pensador, El Beso y Las Puertas del Infierno.",
      duration: "1.5 horas", category: "museo", x: 255, y: 315,
      transport: [
        { type: "caminando", time: "12 min", description: "Desde Musée d'Orsay al Suroeste por el Quai Anatole France hasta Invalides, luego Rue de Varenne.", recommended: true },
      ],
    },
    {
      id: 3, name: "Sacré-Cœur y Montmartre",
      address: "35 Rue du Chevalier de la Barre, 75018",
      description: "La basílica blanca en la cima de París (130m). Place du Tertre con los pintores callejeros. Barrio bohemio del Impresionismo.",
      duration: "2 horas", category: "monumento", x: 355, y: 150,
      transport: [
        { type: "metro", line: "L12 Verde", direction: "Mairie d'Aubervilliers", time: "20 min", description: "Varenne (L13) → Trinité d'Estienne d'Orves (cambio L12) → Abbesses. Subir a pie o funicular a Sacré-Cœur.", recommended: true },
      ],
    },
    {
      id: 4, name: "Galeries Lafayette / Grands Boulevards",
      address: "40 Boulevard Haussmann, 75009",
      description: "Las galerías más bellas del mundo. La cúpula central de 1912. Terraza gratuita con vistas panorámicas de París. Compras de souvenirs.",
      duration: "1 hora", category: "barrio", x: 390, y: 220,
      transport: [
        { type: "metro", line: "L12 Verde", direction: "Mairie d'Aubervilliers", time: "10 min", description: "Abbesses → Trinité (cambio L12 dir. Aubervilliers) → Saint-Lazare o Havre-Caumartin. Galerías a 5 min.", recommended: true },
      ],
    },
  ],
}

// ─────────────────────────────────────────────
//  All routes registry
// ─────────────────────────────────────────────
const ALL_ROUTES: DayRoute[] = [
  MADRID_SEP6,
  MADRID_SEP7,
  MADRID_SEP8,
  BARCELONA_SEP9,
  BARCELONA_SEP10,
  BARCELONA_SEP11,
  PARIS_SEP12,
  PARIS_SEP13,
  VERSAILLES_SEP14,
  PARIS_SEP15,
]

// ─────────────────────────────────────────────
//  Generic SVG Map component
// ─────────────────────────────────────────────
function DayMapSVG({ route }: { route: DayRoute }) {
  const allPoints = route.points
  const pathPairs: { from: RoutePoint; to: RoutePoint }[] = []
  for (let i = 0; i < allPoints.length - 1; i++) {
    pathPairs.push({ from: allPoints[i], to: allPoints[i + 1] })
  }

  return (
    <svg
      viewBox="0 0 700 500"
      className="w-full rounded-xl border border-gray-300"
      style={{ background: "#f0f4f8" }}
    >
      <defs>
        <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d1d5db" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="700" height="500" fill="#e8edf2" />
      <rect width="700" height="500" fill="url(#mapgrid)" />

      {/* Water */}
      {route.mapElements.water.map((w, i) => (
        <g key={`water-${i}`}>
          <path d={w.d} fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1" />
          {w.label && (
            <text fontSize="9" fill="#1d4ed8" fontStyle="italic">
              <textPath href={`#water-path-${i}`} startOffset="50%">
                {w.label}
              </textPath>
            </text>
          )}
        </g>
      ))}

      {/* Parks */}
      {route.mapElements.parks.map((p, i) => (
        <g key={`park-${i}`}>
          <ellipse cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill="#bbf7d0" stroke="#86efac" strokeWidth="1.5" />
          <text x={p.cx} y={p.cy + 4} textAnchor="middle" fontSize="9" fill="#15803d" fontWeight="bold">{p.label}</text>
        </g>
      ))}

      {/* Streets */}
      {route.mapElements.streets.map((s, i) => (
        <g key={`st-${i}`}>
          <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#94a3b8" strokeWidth={s.width ?? 3} />
          {s.label && (
            <text
              x={(s.x1 + s.x2) / 2}
              y={(s.y1 + s.y2) / 2 - 4}
              textAnchor="middle"
              fontSize="8"
              fill="#475569"
              transform={
                Math.abs(s.y2 - s.y1) > Math.abs(s.x2 - s.x1)
                  ? `rotate(-90, ${(s.x1 + s.x2) / 2}, ${(s.y1 + s.y2) / 2})`
                  : ""
              }
            >
              {s.label}
            </text>
          )}
        </g>
      ))}

      {/* Route path */}
      {pathPairs.map((seg, i) => (
        <line
          key={`path-${i}`}
          x1={seg.from.x} y1={seg.from.y}
          x2={seg.to.x} y2={seg.to.y}
          stroke="#3b82f6"
          strokeWidth="2.5"
          strokeDasharray="7,4"
          opacity="0.85"
        />
      ))}

      {/* Arrow midpoints */}
      {pathPairs.map((seg, i) => {
        const mx = (seg.from.x + seg.to.x) / 2
        const my = (seg.from.y + seg.to.y) / 2
        const angle = Math.atan2(seg.to.y - seg.from.y, seg.to.x - seg.from.x) * (180 / Math.PI)
        return (
          <text
            key={`arrow-${i}`}
            x={mx} y={my + 5}
            textAnchor="middle"
            fontSize="16"
            fill="#3b82f6"
            transform={`rotate(${angle}, ${mx}, ${my})`}
          >
            ›
          </text>
        )
      })}

      {/* Points */}
      {allPoints.map((pt) => {
        const color = getCategoryColor(pt.category)
        return (
          <g key={`pt-${pt.id}`}>
            <circle cx={pt.x} cy={pt.y} r="18" fill={color} stroke="white" strokeWidth="2.5" />
            <text x={pt.x} y={pt.y + 5} textAnchor="middle" fontSize="13" fill="white" fontWeight="bold">
              {pt.id === 0 ? "★" : pt.id}
            </text>
          </g>
        )
      })}

      {/* Labels */}
      {allPoints.map((pt) => {
        const label = pt.name.length > 18 ? pt.name.substring(0, 16) + "…" : pt.name
        const offsetY = pt.y > 420 ? -26 : 30
        const offsetX = pt.x < 40 ? 22 : pt.x > 660 ? -22 : 0
        return (
          <text
            key={`lbl-${pt.id}`}
            x={pt.x + offsetX}
            y={pt.y + offsetY}
            textAnchor="middle"
            fontSize="9"
            fill="#1e293b"
            fontWeight="600"
            style={{ paintOrder: "stroke", stroke: "white", strokeWidth: "3" }}
          >
            {label}
          </text>
        )
      })}

      {/* Legend */}
      <rect x="8" y="450" width="684" height="44" rx="6" fill="white" opacity="0.88" />
      <circle cx="26" cy="472" r="8" fill="#7c3aed" />
      <text x="38" y="477" fontSize="8.5" fill="#1e293b">★ Alojamiento</text>
      <circle cx="130" cy="472" r="8" fill="#dc2626" />
      <text x="142" y="477" fontSize="8.5" fill="#1e293b">Museo/Entrada</text>
      <circle cx="235" cy="472" r="8" fill="#d97706" />
      <text x="247" y="477" fontSize="8.5" fill="#1e293b">Plaza</text>
      <circle cx="295" cy="472" r="8" fill="#16a34a" />
      <text x="307" y="477" fontSize="8.5" fill="#1e293b">Parque</text>
      <circle cx="355" cy="472" r="8" fill="#2563eb" />
      <text x="367" y="477" fontSize="8.5" fill="#1e293b">Monumento</text>
      <circle cx="435" cy="472" r="8" fill="#0891b2" />
      <text x="447" y="477" fontSize="8.5" fill="#1e293b">Barrio</text>
      <line x1="500" y1="472" x2="530" y2="472" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="5,3" />
      <text x="535" y="477" fontSize="8.5" fill="#1e293b">Ruta</text>
      <text x="590" y="477" fontSize="7.5" fill="#64748b">Mapa esquemático</text>
    </svg>
  )
}

// ─────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────
interface RouteMapProps {
  onBack: () => void
}

const CITY_COLORS: Record<string, string> = {
  "Madrid": "bg-red-600",
  "Barcelona": "bg-yellow-600",
  "París": "bg-blue-700",
  "Versalles": "bg-indigo-700",
}

export function RouteMap({ onBack }: RouteMapProps) {
  const [selectedDay, setSelectedDay] = useState(1) // default Sep 7 Madrid

  const route = ALL_ROUTES[selectedDay]

  return (
    <div className="space-y-4">
      {/* Header — oculto al imprimir */}
      <div className="print:hidden flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <h2 className="text-lg font-bold">Mapa de Ruta</h2>
        <button
          onClick={() => {
            // Imprimir solo el área del mapa del día seleccionado
            const printContents = document.getElementById("print-map-area")?.innerHTML
            if (!printContents) { window.print(); return }
            const win = window.open("", "_blank", "width=900,height=700")
            if (!win) { window.print(); return }
            win.document.write(`<!DOCTYPE html><html><head>
              <meta charset="utf-8"/>
              <title>Mapa de Ruta – Europa Mágica 2026</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 16px; color: #111; background: white; }
                @page { size: A4; margin: 1.5cm; }
                * { box-sizing: border-box; }
                svg { width: 100%; height: auto; }
              </style>
            </head><body>${printContents}</body></html>`)
            win.document.close()
            win.focus()
            setTimeout(() => { win.print(); win.close() }, 400)
          }}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded-lg transition-colors text-sm"
        >
          <Printer className="w-4 h-4" />
          Imprimir
        </button>
      </div>

      {/* Day selector — oculto al imprimir */}
      <div className="print:hidden grid grid-cols-2 gap-2">
        {ALL_ROUTES.map((r, i) => {
          const cityColor = CITY_COLORS[r.city] ?? "bg-gray-600"
          const dayNum = r.date.split(" ")[0]
          const month = r.date.split(" ")[2]?.substring(0, 3) ?? ""
          return (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all border ${
                selectedDay === i
                  ? "bg-white text-gray-900 border-white shadow-lg scale-105"
                  : "bg-white/10 hover:bg-white/20 border-white/10 text-white"
              }`}
            >
              <span className={`${cityColor} text-white rounded-lg px-1.5 py-0.5 text-xs font-bold flex-shrink-0`}>
                {dayNum} {month}
              </span>
              <span className="truncate text-left">{r.city}</span>
            </button>
          )
        })}
      </div>

      {/* Printable card */}
      <div
        id="print-map-area"
        className="bg-white text-gray-900 rounded-2xl p-4 shadow-2xl print:shadow-none print:rounded-none print:p-6"
        style={{ pageBreakInside: "avoid" }}
      >
        {/* Title */}
        <div className="flex items-start justify-between mb-3 pb-2 border-b border-gray-200 gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{route.title}</h2>
            <p className="text-sm text-gray-500">{route.date} · {route.city}, {route.country}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-gray-400">Europa Mágica 2026</div>
            <div className="text-xs font-bold text-blue-600">Techera & Pérez</div>
          </div>
        </div>

        {/* Map */}
        <div className="mb-4">
          <DayMapSVG route={route} />
        </div>

        {/* Points with transport */}
        <div className="space-y-3">
          {route.points.map((point, idx) => (
            <div key={point.id}>
              {/* Transport to this point */}
              {idx > 0 && point.transport && point.transport.length > 0 && (
                <div className="ml-3 mb-2 pl-3 border-l-2 border-blue-200">
                  <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
                    Como llegar · {route.points[idx - 1].name} → {point.name}
                  </div>
                  {point.transport.map((opt, oi) => (
                    <div
                      key={oi}
                      className={`flex items-start gap-2 p-2 rounded-lg mb-1 text-sm ${
                        opt.recommended
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-gray-50 border border-gray-100"
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0 ${getTransportColor(opt.type)}`}>
                        <TransportIcon type={opt.type} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-semibold capitalize text-xs">{opt.type}</span>
                          {opt.line && <span className="bg-blue-100 text-blue-700 px-1 rounded text-xs">{opt.line}</span>}
                          {opt.direction && <span className="text-gray-500 text-xs">dir. {opt.direction}</span>}
                          <span className="text-blue-600 font-bold text-xs ml-auto">{opt.time}</span>
                          {opt.recommended && <span className="bg-green-100 text-green-700 text-xs px-1 rounded">Recomendado</span>}
                        </div>
                        <p className="text-gray-600 text-xs mt-0.5">{opt.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Point card */}
              <div className={`rounded-xl p-3 border ${point.category === "alojamiento" ? "bg-purple-50 border-purple-200" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-start gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: getCategoryColor(point.category) }}
                  >
                    {point.id === 0 ? "★" : point.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm">{point.name}</h3>
                      {point.duration && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0">{point.duration}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{point.address}</p>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{point.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        {route.notes.length > 0 && (
          <div className="mt-4 bg-amber-50 rounded-xl p-3 border border-amber-200">
            <h4 className="font-bold text-amber-800 text-sm mb-2">Notas importantes</h4>
            <ul className="space-y-1">
              {route.notes.map((note, i) => (
                <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                  <span className="text-amber-500 flex-shrink-0 mt-0.5">•</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-3 text-center text-xs text-gray-400">
          Europa Mágica 2026 · Techera & Pérez · Impreso desde spy-cloud-app
        </div>
      </div>
    </div>
  )
}
