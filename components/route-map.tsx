"use client"

import { useState } from "react"
import { ArrowLeft, Printer, MapPin, Navigation, Train, Bus, Footprints, Bike } from "lucide-react"

interface RoutePoint {
  id: number
  name: string
  address: string
  description: string
  duration: string
  category: "alojamiento" | "museo" | "plaza" | "parque" | "monumento"
  lat: number
  lng: number
}

interface RouteTransport {
  from: number
  to: number
  options: {
    type: "metro" | "bus" | "caminando" | "bici" | "tren"
    line?: string
    direction?: string
    stops?: number
    time: string
    description: string
    icon: string
  }[]
  recommended: number
}

interface DayRoute {
  date: string
  city: string
  title: string
  accommodation: RoutePoint
  points: RoutePoint[]
  transports: RouteTransport[]
  notes: string[]
}

const MADRID_SEP7: DayRoute = {
  date: "7 de septiembre 2026",
  city: "Madrid",
  title: "Madrid - Palacio Real y Barrio de los Austrias",
  accommodation: {
    id: 0,
    name: "Alojamiento (Punto 0)",
    address: "Calle del Barquillo 41, 28004 Madrid",
    description: "Base del día. Metro Alonso Martínez (L4, L5, L10)",
    duration: "",
    category: "alojamiento",
    lat: 40.4238,
    lng: -3.6947,
  },
  points: [
    {
      id: 1,
      name: "Palacio Real de Madrid",
      address: "Calle de Bailén, s/n, 28071 Madrid",
      description: "Residencia oficial del Rey de España. El palacio más grande de Europa Occidental. Imprescindible ver los salones de estado, la Armería Real y los jardines. Reservar tickets online.",
      duration: "2-3 horas",
      category: "monumento",
      lat: 40.4179,
      lng: -3.7143,
    },
    {
      id: 2,
      name: "Plaza Mayor",
      address: "Plaza Mayor, 28012 Madrid",
      description: "La plaza más emblemática de Madrid. Construida en el siglo XVII. Rodeada de edificios con soportales, el Arco de Cuchilleros y la Casa de la Panadería con sus frescos. Ideal para tomar un café.",
      duration: "45 min",
      category: "plaza",
      lat: 40.4154,
      lng: -3.7074,
    },
    {
      id: 3,
      name: "Mercado de San Miguel",
      address: "Plaza de San Miguel, s/n, 28005 Madrid",
      description: "Mercado gastronómico cubierto, siglo XX. Perfecto para almorzar con tapas, vinos y delicias españolas. Siempre animado.",
      duration: "1 hora",
      category: "monumento",
      lat: 40.4151,
      lng: -3.7087,
    },
    {
      id: 4,
      name: "Puerta del Sol",
      address: "Puerta del Sol, s/n, 28013 Madrid",
      description: "El corazón de Madrid y de España (Km 0 de las carreteras nacionales). La estatua del Oso y el Madroño, el reloj del Ministerio del Interior. Punto neurálgico de la ciudad.",
      duration: "30 min",
      category: "plaza",
      lat: 40.4169,
      lng: -3.7034,
    },
    {
      id: 5,
      name: "Barrio de las Letras / Parque del Retiro",
      address: "Parque del Buen Retiro, Madrid",
      description: "El gran parque urbano de Madrid. Palacio de Cristal, estanque con barcas, jardines formales. 118 hectáreas de verde en plena ciudad. UNESCO Patrimonio Mundial.",
      duration: "1.5-2 horas",
      category: "parque",
      lat: 40.4153,
      lng: -3.6845,
    },
  ],
  transports: [
    {
      from: 0,
      to: 1,
      options: [
        {
          type: "metro",
          line: "L2 (Roja)",
          direction: "Las Rosas",
          stops: 4,
          time: "12 min",
          description: "Metro desde Alonso Martínez → Opera (L2 dir. Las Rosas, 4 paradas). Salir por Ópera y caminar 8 min a Palacio Real.",
          icon: "M",
        },
        {
          type: "caminando",
          time: "28 min",
          description: "Caminar por Gran Vía hasta Plaza de España, luego bajar Calle de Bailén al sur. Ruta escénica por el centro.",
          icon: "P",
        },
        {
          type: "bus",
          line: "Línea 25 o 39",
          time: "20 min",
          description: "Bus 25 desde Barquillo/Génova hasta Palacio Real. Dirección Sur-Oeste.",
          icon: "B",
        },
      ],
      recommended: 0,
    },
    {
      from: 1,
      to: 2,
      options: [
        {
          type: "caminando",
          time: "12 min",
          description: "Salir del Palacio por el lado Este, bajar Calle Mayor hasta Plaza Mayor. Pasar por la Catedral de la Almudena.",
          icon: "P",
        },
      ],
      recommended: 0,
    },
    {
      from: 2,
      to: 3,
      options: [
        {
          type: "caminando",
          time: "3 min",
          description: "El Mercado San Miguel está justo al noroeste de Plaza Mayor, a 200 metros.",
          icon: "P",
        },
      ],
      recommended: 0,
    },
    {
      from: 3,
      to: 4,
      options: [
        {
          type: "caminando",
          time: "6 min",
          description: "Desde Mercado San Miguel, seguir por Calle Mayor hacia el Este hasta Puerta del Sol.",
          icon: "P",
        },
      ],
      recommended: 0,
    },
    {
      from: 4,
      to: 5,
      options: [
        {
          type: "metro",
          line: "L2 (Roja)",
          direction: "Las Rosas",
          stops: 2,
          time: "8 min",
          description: "Metro Sol (L1/L2/L3) → Retiro (L2 dir. Las Rosas, 2 paradas). Entrada al parque por la puerta principal.",
          icon: "M",
        },
        {
          type: "caminando",
          time: "22 min",
          description: "A pie desde Sol por Carrera de San Jerónimo y el Barrio de las Letras hasta la entrada del Retiro.",
          icon: "P",
        },
        {
          type: "bici",
          time: "12 min",
          description: "BiciMAD (sistema de bicicletas públicas). Estación en Puerta del Sol. Pedalear por Calle de Alcalá hasta el parque.",
          icon: "B",
        },
      ],
      recommended: 0,
    },
  ],
  notes: [
    "Palacio Real: Abren 10:00-20:00 (verano), €14/persona. Reserva ONLINE obligatoria en temporada alta.",
    "Plaza Mayor: Gratuita. Mejor por la mañana temprano antes que lleguen los turistas.",
    "Mercado San Miguel: 10:00-24:00. Tapas €2-5 c/u. Ideal para el almuerzo.",
    "Parque del Retiro: Gratuito. Los fines de semana hay músicos y artistas callejeros.",
    "Metro de Madrid: Billete sencillo €1.50, billete de 10 viajes €12.20. Tarjeta recargable en cualquier estación.",
  ],
}

const ALL_ROUTES: DayRoute[] = [MADRID_SEP7]

function TransportIcon({ type }: { type: string }) {
  if (type === "metro" || type === "tren") return <Train className="w-4 h-4" />
  if (type === "bus") return <Bus className="w-4 h-4" />
  if (type === "caminando") return <Footprints className="w-4 h-4" />
  if (type === "bici") return <Bike className="w-4 h-4" />
  return <Navigation className="w-4 h-4" />
}

function getTransportColor(type: string) {
  if (type === "metro") return "bg-blue-600"
  if (type === "bus") return "bg-orange-500"
  if (type === "caminando") return "bg-green-600"
  if (type === "bici") return "bg-teal-500"
  if (type === "tren") return "bg-purple-600"
  return "bg-gray-600"
}

function getCategoryColor(cat: string) {
  if (cat === "alojamiento") return "#7c3aed"
  if (cat === "museo") return "#dc2626"
  if (cat === "plaza") return "#d97706"
  if (cat === "parque") return "#16a34a"
  if (cat === "monumento") return "#2563eb"
  return "#6b7280"
}

function getCategoryIcon(cat: string, id: number) {
  if (cat === "alojamiento") return "🏠"
  return `${id}`
}

// SVG map with Madrid landmarks approximated on a simplified grid
function MadridMapSVG({ route }: { route: DayRoute }) {
  // Approximate coordinates mapped to SVG canvas (700x500)
  // Madrid bounding box: lat 40.41-40.43, lng -3.72 to -3.68
  const toSVG = (lat: number, lng: number) => {
    const minLat = 40.409
    const maxLat = 40.432
    const minLng = -3.725
    const maxLng = -3.675
    const x = ((lng - minLng) / (maxLng - minLng)) * 660 + 20
    const y = ((maxLat - lat) / (maxLat - minLat)) * 420 + 40
    return { x, y }
  }

  const acc = toSVG(route.accommodation.lat, route.accommodation.lng)
  const points = route.points.map((p) => ({ ...toSVG(p.lat, p.lng), ...p }))

  const allPoints = [{ x: acc.x, y: acc.y, id: 0, color: getCategoryColor("alojamiento") }, ...points.map((p) => ({ ...p, color: getCategoryColor(p.category) }))]

  // Build path segments
  const pathSegments = []
  for (let i = 0; i < allPoints.length - 1; i++) {
    pathSegments.push({ from: allPoints[i], to: allPoints[i + 1] })
  }

  return (
    <svg
      viewBox="0 0 700 500"
      className="w-full rounded-xl border border-gray-300"
      style={{ background: "#f0f4f8" }}
    >
      {/* Background city grid */}
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d1d5db" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="700" height="500" fill="#e8edf2" />
      <rect width="700" height="500" fill="url(#grid)" />

      {/* Parque del Retiro (verde) */}
      <ellipse cx="605" cy="370" rx="55" ry="45" fill="#bbf7d0" stroke="#86efac" strokeWidth="1.5" />
      <text x="605" y="375" textAnchor="middle" fontSize="9" fill="#15803d" fontWeight="bold">RETIRO</text>

      {/* Casa de Campo */}
      <ellipse cx="70" cy="280" rx="45" ry="60" fill="#bbf7d0" stroke="#86efac" strokeWidth="1" />
      <text x="70" y="282" textAnchor="middle" fontSize="8" fill="#15803d">Casa de</text>
      <text x="70" y="292" textAnchor="middle" fontSize="8" fill="#15803d">Campo</text>

      {/* Gran Vía (calle principal) */}
      <line x1="260" y1="160" x2="420" y2="160" stroke="#94a3b8" strokeWidth="4" />
      <text x="340" y="155" textAnchor="middle" fontSize="9" fill="#475569">Gran Vía</text>

      {/* Calle Mayor */}
      <line x1="170" y1="290" x2="420" y2="290" stroke="#94a3b8" strokeWidth="3" />
      <text x="280" y="285" textAnchor="middle" fontSize="8" fill="#475569">Calle Mayor</text>

      {/* Paseo del Prado */}
      <line x1="530" y1="200" x2="530" y2="430" stroke="#94a3b8" strokeWidth="3.5" />
      <text x="536" y="320" textAnchor="start" fontSize="8" fill="#475569" transform="rotate(90, 536, 310)">Paseo del Prado</text>

      {/* Calle de Bailén */}
      <line x1="170" y1="150" x2="170" y2="340" stroke="#94a3b8" strokeWidth="3" />
      <text x="160" y="240" textAnchor="middle" fontSize="8" fill="#475569" transform="rotate(-90, 160, 240)">C. Bailén</text>

      {/* Route path */}
      {pathSegments.map((seg, i) => (
        <line
          key={i}
          x1={seg.from.x}
          y1={seg.from.y}
          x2={seg.to.x}
          y2={seg.to.y}
          stroke="#3b82f6"
          strokeWidth="2.5"
          strokeDasharray="6,4"
          opacity="0.8"
        />
      ))}

      {/* Arrow heads on path */}
      {pathSegments.map((seg, i) => {
        const mx = (seg.from.x + seg.to.x) / 2
        const my = (seg.from.y + seg.to.y) / 2
        const angle = Math.atan2(seg.to.y - seg.from.y, seg.to.x - seg.from.x) * 180 / Math.PI
        return (
          <text
            key={`arrow-${i}`}
            x={mx}
            y={my}
            textAnchor="middle"
            fontSize="14"
            fill="#3b82f6"
            transform={`rotate(${angle}, ${mx}, ${my})`}
            dy="5"
          >
            ›
          </text>
        )
      })}

      {/* Points */}
      {allPoints.map((pt) => (
        <g key={`pt-${pt.id}`}>
          <circle cx={pt.x} cy={pt.y} r="18" fill={pt.color} stroke="white" strokeWidth="2.5" />
          <text x={pt.x} y={pt.y + 5} textAnchor="middle" fontSize="13" fill="white" fontWeight="bold">
            {pt.id === 0 ? "★" : pt.id}
          </text>
        </g>
      ))}

      {/* Labels */}
      {allPoints.map((pt, idx) => {
        const label = idx === 0 ? "Alojamiento" : route.points[idx - 1].name
        const shortLabel = label.length > 18 ? label.substring(0, 16) + "..." : label
        const offsetY = pt.y > 420 ? -25 : 28
        return (
          <text
            key={`lbl-${pt.id}`}
            x={pt.x}
            y={pt.y + offsetY}
            textAnchor="middle"
            fontSize="9"
            fill="#1e293b"
            fontWeight="600"
            style={{ paintOrder: "stroke", stroke: "white", strokeWidth: "3" }}
          >
            {shortLabel}
          </text>
        )
      })}

      {/* Legend */}
      <rect x="10" y="450" width="680" height="44" rx="6" fill="white" opacity="0.85" />
      <circle cx="30" cy="472" r="8" fill="#7c3aed" />
      <text x="43" y="477" fontSize="9" fill="#1e293b">★ Alojamiento</text>
      <circle cx="135" cy="472" r="8" fill="#2563eb" />
      <text x="148" y="477" fontSize="9" fill="#1e293b">Monumento</text>
      <circle cx="235" cy="472" r="8" fill="#d97706" />
      <text x="248" y="477" fontSize="9" fill="#1e293b">Plaza</text>
      <circle cx="295" cy="472" r="8" fill="#16a34a" />
      <text x="308" y="477" fontSize="9" fill="#1e293b">Parque</text>
      <line x1="375" y1="472" x2="405" y2="472" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="5,3" />
      <text x="410" y="477" fontSize="9" fill="#1e293b">Ruta del día</text>
      <text x="490" y="477" fontSize="9" fill="#64748b">Mapa esquemático · no a escala</text>
    </svg>
  )
}

interface RouteMapProps {
  onBack: () => void
}

export function RouteMap({ onBack }: RouteMapProps) {
  const [selectedDay, setSelectedDay] = useState(0)
  const route = ALL_ROUTES[selectedDay]

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <h2 className="text-lg font-bold">Mapa de Ruta</h2>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded-lg transition-colors text-sm"
        >
          <Printer className="w-4 h-4" />
          Imprimir
        </button>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 flex-wrap">
        {ALL_ROUTES.map((r, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(i)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              selectedDay === i ? "bg-blue-500 text-white" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {r.date.split(" ").slice(0, 2).join(" ")} · {r.city}
          </button>
        ))}
        <div className="px-3 py-2 rounded-lg text-sm bg-white/5 text-white/40 italic">
          + Mas días próximamente
        </div>
      </div>

      {/* Main card - printable */}
      <div
        id="print-map-area"
        className="bg-white text-gray-900 rounded-2xl p-4 shadow-2xl print:shadow-none print:rounded-none print:p-6"
        style={{ pageBreakInside: "avoid" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{route.title}</h2>
            <p className="text-sm text-gray-500">{route.date} · {route.city}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Europa Magica 2026</div>
            <div className="text-xs font-semibold text-blue-600">Techera & Perez</div>
          </div>
        </div>

        {/* Map SVG */}
        <div className="mb-4">
          <MadridMapSVG route={route} />
        </div>

        {/* Accommodation */}
        <div className="mb-4 bg-purple-50 rounded-xl p-3 border-l-4 border-purple-500">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">★</div>
            <div>
              <span className="font-bold text-gray-900">PUNTO 0 - {route.accommodation.name}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 ml-9">{route.accommodation.address}</p>
          <p className="text-xs text-gray-500 ml-9">{route.accommodation.description}</p>
        </div>

        {/* Route points with transport */}
        <div className="space-y-3">
          {route.points.map((point, idx) => {
            const transport = route.transports[idx]
            const recommended = transport?.options[transport.recommended]
            return (
              <div key={point.id}>
                {/* Transport segment */}
                {transport && (
                  <div className="ml-4 mb-2 pl-3 border-l-2 border-blue-300">
                    <div className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wide">
                      Como llegar · {idx === 0 ? "Alojamiento" : route.points[idx - 1].name} → {point.name}
                    </div>
                    {transport.options.map((opt, oi) => (
                      <div
                        key={oi}
                        className={`flex items-start gap-2 p-2 rounded-lg mb-1 text-sm ${
                          oi === transport.recommended
                            ? "bg-blue-50 border border-blue-200"
                            : "bg-gray-50 border border-gray-200"
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${getTransportColor(opt.type)}`}>
                          {opt.icon}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold capitalize">{opt.type}</span>
                            {opt.line && <span className="bg-blue-100 text-blue-700 px-1 rounded text-xs">{opt.line}</span>}
                            {opt.direction && <span className="text-gray-500 text-xs">dir. {opt.direction}</span>}
                            {opt.stops && <span className="text-gray-500 text-xs">({opt.stops} paradas)</span>}
                            <span className="ml-auto text-blue-600 font-bold text-xs">{opt.time}</span>
                            {oi === transport.recommended && (
                              <span className="bg-green-100 text-green-700 text-xs px-1 rounded">Recomendado</span>
                            )}
                          </div>
                          <p className="text-gray-600 text-xs mt-0.5">{opt.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Point card */}
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: getCategoryColor(point.category) }}
                    >
                      {point.id}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">{point.name}</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{point.duration}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {point.address}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{point.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Notes */}
        <div className="mt-4 bg-amber-50 rounded-xl p-3 border border-amber-200">
          <h4 className="font-bold text-amber-800 mb-2 text-sm">Notas importantes del dia</h4>
          <ul className="space-y-1">
            {route.notes.map((note, i) => (
              <li key={i} className="text-xs text-amber-900 flex items-start gap-1.5">
                <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                {note}
              </li>
            ))}
          </ul>
        </div>

        {/* Print footer */}
        <div className="mt-3 pt-2 border-t border-gray-200 text-center text-xs text-gray-400 print:block hidden">
          Europa Magica 2026 · Techera & Perez · Impreso el {new Date().toLocaleDateString("es-ES")}
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-map-area, #print-map-area * { visibility: visible; }
          #print-map-area { position: absolute; left: 0; top: 0; width: 100%; }
          @page { size: A4; margin: 10mm; }
        }
      `}</style>
    </div>
  )
}
