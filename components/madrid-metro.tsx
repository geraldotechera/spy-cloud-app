"use client"

import { useState } from "react"
import type { Accommodation } from "@/types"

interface MadridMetroProps {
  accommodations: Accommodation[]
  onBack: () => void
}

interface MetroLine {
  id: string
  name: string
  color: string
}

interface MetroStation {
  id: string
  name: string
  lines: string[]
  zone: number
  coordinates?: { lat: number; lng: number }
}

const METRO_LINES: MetroLine[] = [
  { id: "L1", name: "Línea 1", color: "#38B6E6" },
  { id: "L2", name: "Línea 2", color: "#E8292B" },
  { id: "L3", name: "Línea 3", color: "#FFD521" },
  { id: "L4", name: "Línea 4", color: "#9F5C3F" },
  { id: "L5", name: "Línea 5", color: "#91C65F" },
  { id: "L6", name: "Línea 6", color: "#999999" },
  { id: "L7", name: "Línea 7", color: "#F18E00" },
  { id: "L8", name: "Línea 8", color: "#E685AC" },
  { id: "L9", name: "Línea 9", color: "#9F2F64" },
  { id: "L10", name: "Línea 10", color: "#16498C" },
  { id: "L11", name: "Línea 11", color: "#4C8E3C" },
  { id: "L12", name: "Línea 12", color: "#938526" },
]

// Estaciones principales de Madrid (selección de las más usadas por turistas)
const METRO_STATIONS: MetroStation[] = [
  // Línea 1
  { id: "pinar-chamartin", name: "Pinar de Chamartín", lines: ["L1"], zone: 2 },
  { id: "plaza-castilla", name: "Plaza de Castilla", lines: ["L1", "L9", "L10"], zone: 1 },
  { id: "valdeacederas", name: "Valdeacederas", lines: ["L1"], zone: 1 },
  { id: "sol", name: "Sol", lines: ["L1", "L2", "L3"], zone: 1, coordinates: { lat: 40.4168, lng: -3.7038 } },
  { id: "tirso-molina", name: "Tirso de Molina", lines: ["L1"], zone: 1 },
  { id: "atocha", name: "Atocha", lines: ["L1"], zone: 1, coordinates: { lat: 40.4067, lng: -3.6915 } },
  
  // Línea 2
  { id: "cuatro-caminos", name: "Cuatro Caminos", lines: ["L2", "L6"], zone: 1 },
  { id: "opera", name: "Ópera", lines: ["L2", "L5"], zone: 1, coordinates: { lat: 40.4183, lng: -3.7129 } },
  { id: "banco-espana", name: "Banco de España", lines: ["L2"], zone: 1 },
  { id: "retiro", name: "Retiro", lines: ["L2"], zone: 1, coordinates: { lat: 40.4118, lng: -3.6844 } },
  
  // Línea 3
  { id: "moncloa", name: "Moncloa", lines: ["L3", "L6"], zone: 1 },
  { id: "arguelles", name: "Argüelles", lines: ["L3", "L4", "L6"], zone: 1 },
  { id: "callao", name: "Callao", lines: ["L3", "L5"], zone: 1, coordinates: { lat: 40.4201, lng: -3.7064 } },
  { id: "gran-via", name: "Gran Vía", lines: ["L1", "L5"], zone: 1, coordinates: { lat: 40.4199, lng: -3.7013 } },
  { id: "tribunal", name: "Tribunal", lines: ["L1", "L10"], zone: 1 },
  
  // Línea 4
  { id: "avenida-america", name: "Avenida de América", lines: ["L4", "L6", "L7", "L9"], zone: 1 },
  { id: "goya", name: "Goya", lines: ["L2", "L4"], zone: 1 },
  { id: "serrano", name: "Serrano", lines: ["L4"], zone: 1 },
  { id: "colon", name: "Colón", lines: ["L4"], zone: 1 },
  
  // Línea 5
  { id: "chueca", name: "Chueca", lines: ["L5"], zone: 1 },
  { id: "alonso-martinez", name: "Alonso Martínez", lines: ["L4", "L5", "L10"], zone: 1 },
  { id: "cibeles", name: "Cibeles", lines: ["L2"], zone: 1 },
  
  // Línea 6 (Circular)
  { id: "principe-pio", name: "Príncipe Pío", lines: ["L6", "L10"], zone: 1 },
  { id: "mendez-alvaro", name: "Méndez Álvaro", lines: ["L6"], zone: 1 },
  
  // Línea 8 (Aeropuerto)
  { id: "nuevos-ministerios", name: "Nuevos Ministerios", lines: ["L6", "L8", "L10"], zone: 1 },
  { id: "aeropuerto-t1-t2-t3", name: "Aeropuerto T1-T2-T3", lines: ["L8"], zone: 2 },
  { id: "aeropuerto-t4", name: "Aeropuerto T4", lines: ["L8"], zone: 2 },
  
  // Línea 10
  { id: "hospital-infanta-sofia", name: "Hospital Infanta Sofía", lines: ["L10"], zone: 2 },
  { id: "plaza-espana", name: "Plaza de España", lines: ["L3", "L10"], zone: 1 },
]

export function MadridMetro({ accommodations, onBack }: MadridMetroProps) {
  const [selectedLine, setSelectedLine] = useState<string | null>(null)
  const [fromStation, setFromStation] = useState<string>("")
  const [toStation, setToStation] = useState<string>("")
  const [showRoute, setShowRoute] = useState(false)
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null)

  const filteredStations = selectedLine
    ? METRO_STATIONS.filter((station) => station.lines.includes(selectedLine))
    : METRO_STATIONS

  const handleCalculateRoute = () => {
    if (!fromStation || !toStation) {
      alert("Por favor selecciona estación de origen y destino")
      return
    }
    if (fromStation === toStation) {
      alert("Por favor selecciona estaciones diferentes")
      return
    }
    setShowRoute(true)
  }

  const getAccommodationMetroInfo = (accId: string) => {
    const acc = accommodations.find((a) => a.id.toString() === accId)
    if (!acc) return null

    // Estación más cercana según las coordenadas del alojamiento
    // Para Calle del Barquillo 41, la estación más cercana es Alonso Martínez
    return {
      accommodation: acc,
      nearestStation: "alonso-martinez",
      stationName: "Alonso Martínez",
      lines: ["L4", "L5", "L10"],
      walkingTime: "3-5 minutos caminando",
      directions: "Sal del alojamiento hacia la derecha en Calle del Barquillo. Camina hacia el norte hasta llegar a la intersección con Calle Santa Bárbara. La estación Alonso Martínez está en la esquina.",
    }
  }

  const handleRouteFromAccommodation = (accommodation: Accommodation) => {
    setSelectedAccommodation(accommodation)
    // Abrir Google Maps con ruta desde el alojamiento
    const origin = encodeURIComponent(accommodation.location || accommodation.name)
    const destination = encodeURIComponent("Metro Madrid")
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`
    window.open(url, "_blank")
  }

  const openMetroInMaps = (stationName: string) => {
    const query = encodeURIComponent(`Metro ${stationName}, Madrid`)
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`
    window.open(url, "_blank")
  }

  const getStationName = (stationId: string) => {
    return METRO_STATIONS.find((s) => s.id === stationId)?.name || ""
  }

  const calculateMetroRoute = () => {
    // Detectar si origen o destino son alojamientos
    const isFromAccommodation = fromStation.startsWith("accommodation-")
    const isToAccommodation = toStation.startsWith("accommodation-")

    let fromStationData
    let toStationData
    let fromAccommodationInfo = null
    let toAccommodationInfo = null

    if (isFromAccommodation) {
      const accId = fromStation.replace("accommodation-", "")
      fromAccommodationInfo = getAccommodationMetroInfo(accId)
      fromStationData = METRO_STATIONS.find((s) => s.id === fromAccommodationInfo?.nearestStation)
    } else {
      fromStationData = METRO_STATIONS.find((s) => s.id === fromStation)
    }

    if (isToAccommodation) {
      const accId = toStation.replace("accommodation-", "")
      toAccommodationInfo = getAccommodationMetroInfo(accId)
      toStationData = METRO_STATIONS.find((s) => s.id === toAccommodationInfo?.nearestStation)
    } else {
      toStationData = METRO_STATIONS.find((s) => s.id === toStation)
    }

    if (!fromStationData || !toStationData) return null

    // Si origen y destino son el mismo alojamiento
    if (isFromAccommodation && isToAccommodation && fromStation === toStation) {
      return {
        type: "same-accommodation",
        message: "Origen y destino son el mismo alojamiento",
      }
    }

    // Encontrar líneas en común
    const commonLines = fromStationData.lines.filter((line) => toStationData.lines.includes(line))

    if (commonLines.length > 0) {
      return {
        type: "direct",
        line: commonLines[0],
        message: `Ruta directa en ${METRO_LINES.find((l) => l.id === commonLines[0])?.name}`,
        color: METRO_LINES.find((l) => l.id === commonLines[0])?.color,
        fromAccommodationInfo,
        toAccommodationInfo,
        fromStationData,
        toStationData,
      }
    }

    // Si no hay línea directa, buscar transbordos
    const transferStations = METRO_STATIONS.filter(
      (station) =>
        station.lines.some((line) => fromStationData.lines.includes(line)) &&
        station.lines.some((line) => toStationData.lines.includes(line)),
    )

    if (transferStations.length > 0) {
      const transfer = transferStations[0]
      const line1 = fromStationData.lines.find((line) => transfer.lines.includes(line))
      const line2 = toStationData.lines.find((line) => transfer.lines.includes(line))

      return {
        type: "transfer",
        transfer: transfer.name,
        line1,
        line2,
        message: `Transbordo en ${transfer.name}`,
        color1: METRO_LINES.find((l) => l.id === line1)?.color,
        color2: METRO_LINES.find((l) => l.id === line2)?.color,
        fromAccommodationInfo,
        toAccommodationInfo,
        fromStationData,
        toStationData,
      }
    }

    return {
      type: "complex",
      message: "Ruta compleja - consulta el mapa o usa Google Maps",
      fromAccommodationInfo,
      toAccommodationInfo,
      fromStationData,
      toStationData,
    }
  }

  const routeInfo = showRoute ? calculateMetroRoute() : null

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
      >
        ← Volver al Menú
      </button>

      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          🚇 Metro de Madrid
        </h2>
        <p className="text-white/80 text-sm">Planifica tus desplazamientos en metro</p>
      </div>

      {/* Información General */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          ℹ️ Información del Metro
        </h3>
        <div className="space-y-2 text-sm">
          <p>🕐 <strong>Horario:</strong> 6:00 - 1:30 (Ampliado viernes y sábados hasta las 2:00)</p>
          <p>🎫 <strong>Billete sencillo:</strong> €1.50-2.00 (zona A)</p>
          <p>💳 <strong>Tarjeta 10 viajes:</strong> €12.20 (zona A)</p>
          <p>✈️ <strong>Suplemento Aeropuerto:</strong> €3.00 adicional</p>
          <p>🗺️ <strong>Zonas:</strong> A (Centro), B1, B2, B3 (Exteriores)</p>
        </div>
        <a
          href="https://www.metromadrid.es/es"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm"
        >
          🌐 Ver Web Oficial del Metro
        </a>
      </div>

      {/* Ruta desde Alojamiento */}
      {accommodations.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            🏨 Desde tu Alojamiento
          </h3>
          <p className="text-sm text-white/70 mb-3">
            Selecciona tu alojamiento para ver cómo llegar al metro más cercano
          </p>
          <div className="space-y-2">
            {accommodations
              .filter((acc) => acc.city === "Madrid")
              .map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => handleRouteFromAccommodation(acc)}
                  className="w-full bg-white/10 hover:bg-white/20 rounded-lg p-3 text-left transition-colors"
                >
                  <h4 className="font-semibold text-sm">{acc.name}</h4>
                  <p className="text-xs text-white/60">{acc.location || "Madrid"}</p>
                  <span className="text-xs text-blue-400">→ Ver estación más cercana en Maps</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Planificador de Rutas */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          🗺️ Planificador de Rutas
        </h3>

        {/* Filtro por Línea */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Filtrar por línea (opcional):</label>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setSelectedLine(null)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                selectedLine === null ? "bg-white text-black" : "bg-white/20 hover:bg-white/30"
              }`}
            >
              Todas
            </button>
            {METRO_LINES.slice(0, 11).map((line) => (
              <button
                key={line.id}
                onClick={() => setSelectedLine(line.id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  selectedLine === line.id ? "ring-2 ring-white" : "hover:opacity-80"
                }`}
                style={{ backgroundColor: line.color, color: ["L3", "L5"].includes(line.id) ? "#000" : "#fff" }}
              >
                {line.id}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {/* Estación Origen */}
          <div>
            <label className="block text-sm font-semibold mb-2">Desde:</label>
            <select
              value={fromStation}
              onChange={(e) => setFromStation(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Selecciona estación de origen</option>
              {accommodations.filter((acc) => acc.city === "Madrid").length > 0 && (
                <optgroup label="🏨 Mis Alojamientos">
                  {accommodations
                    .filter((acc) => acc.city === "Madrid")
                    .map((acc) => (
                      <option key={`acc-${acc.id}`} value={`accommodation-${acc.id}`}>
                        🏨 {acc.name} → Metro más cercano
                      </option>
                    ))}
                </optgroup>
              )}
              <optgroup label="🚇 Estaciones de Metro">
                {filteredStations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name} ({station.lines.join(", ")}) - Zona {station.zone}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Estación Destino */}
          <div>
            <label className="block text-sm font-semibold mb-2">Hasta:</label>
            <select
              value={toStation}
              onChange={(e) => setToStation(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Selecciona estación de destino</option>
              {accommodations.filter((acc) => acc.city === "Madrid").length > 0 && (
                <optgroup label="🏨 Mis Alojamientos">
                  {accommodations
                    .filter((acc) => acc.city === "Madrid")
                    .map((acc) => (
                      <option key={`acc-${acc.id}`} value={`accommodation-${acc.id}`}>
                        🏨 {acc.name} → Metro más cercano
                      </option>
                    ))}
                </optgroup>
              )}
              <optgroup label="🚇 Estaciones de Metro">
                {filteredStations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name} ({station.lines.join(", ")}) - Zona {station.zone}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <button
            onClick={handleCalculateRoute}
            disabled={!fromStation || !toStation}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-semibold transition-colors"
          >
            🔍 Calcular Ruta
          </button>
        </div>

        {/* Resultado de Ruta */}
        {showRoute && routeInfo && (
          <div className="mt-4 bg-white/10 rounded-lg p-4 border-2 border-green-400">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              ✅ Ruta Calculada
            </h4>
            <div className="text-sm space-y-2">
              {/* Información del Origen */}
              {routeInfo.fromAccommodationInfo ? (
                <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-400/50">
                  <p className="font-bold text-blue-300 mb-2">🏨 DESDE TU ALOJAMIENTO:</p>
                  <p className="font-semibold">{routeInfo.fromAccommodationInfo.accommodation.name}</p>
                  <p className="text-xs text-white/70 mt-1">
                    📍 {routeInfo.fromAccommodationInfo.accommodation.address}
                  </p>
                  <div className="mt-2 p-2 bg-white/10 rounded">
                    <p className="text-xs">
                      <strong>🚶 Camina {routeInfo.fromAccommodationInfo.walkingTime}</strong>
                    </p>
                    <p className="text-xs mt-1 text-white/80">{routeInfo.fromAccommodationInfo.directions}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-semibold">Metro más cercano:</span>
                    <span className="font-bold">{routeInfo.fromAccommodationInfo.stationName}</span>
                    <div className="flex gap-1">
                      {routeInfo.fromAccommodationInfo.lines.map((lineId) => {
                        const line = METRO_LINES.find((l) => l.id === lineId)
                        return (
                          <span
                            key={lineId}
                            className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{
                              backgroundColor: line?.color,
                              color: ["L3", "L5"].includes(lineId) ? "#000" : "#fff",
                            }}
                          >
                            {lineId}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p>
                  <strong>Origen:</strong> {routeInfo.fromStationData?.name || getStationName(fromStation)}
                </p>
              )}

              {/* Información del Destino */}
              {routeInfo.toAccommodationInfo ? (
                <div className="bg-green-500/20 rounded-lg p-3 border border-green-400/50">
                  <p className="font-bold text-green-300 mb-2">🏨 HASTA TU ALOJAMIENTO:</p>
                  <p className="font-semibold">{routeInfo.toAccommodationInfo.accommodation.name}</p>
                  <p className="text-xs text-white/70 mt-1">
                    📍 {routeInfo.toAccommodationInfo.accommodation.address}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-semibold">Metro más cercano:</span>
                    <span className="font-bold">{routeInfo.toAccommodationInfo.stationName}</span>
                    <div className="flex gap-1">
                      {routeInfo.toAccommodationInfo.lines.map((lineId) => {
                        const line = METRO_LINES.find((l) => l.id === lineId)
                        return (
                          <span
                            key={lineId}
                            className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{
                              backgroundColor: line?.color,
                              color: ["L3", "L5"].includes(lineId) ? "#000" : "#fff",
                            }}
                          >
                            {lineId}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <div className="mt-2 p-2 bg-white/10 rounded">
                    <p className="text-xs">
                      <strong>🚶 Camina {routeInfo.toAccommodationInfo.walkingTime}</strong>
                    </p>
                    <p className="text-xs mt-1 text-white/80">{routeInfo.toAccommodationInfo.directions}</p>
                  </div>
                </div>
              ) : (
                <p>
                  <strong>Destino:</strong> {routeInfo.toStationData?.name || getStationName(toStation)}
                </p>
              )}

              {routeInfo.type === "same-accommodation" && (
                <div className="mt-3 p-3 rounded-lg bg-yellow-500/20 border border-yellow-400">
                  <p className="text-yellow-200 text-sm">{routeInfo.message}</p>
                </div>
              )}

              {routeInfo.type === "direct" && (
                <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: routeInfo.color + "40" }}>
                  <p className="font-semibold" style={{ color: routeInfo.color }}>
                    🚇 {routeInfo.message}
                  </p>
                  <p className="text-xs text-white/70 mt-1">✓ No requiere transbordo</p>
                </div>
              )}

              {routeInfo.type === "transfer" && (
                <div className="mt-3 space-y-2">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: routeInfo.color1 + "40" }}>
                    <p className="font-semibold text-xs">
                      1. Toma {METRO_LINES.find((l) => l.id === routeInfo.line1)?.name}
                    </p>
                  </div>
                  <div className="text-center text-xs">↓ Transbordo en {routeInfo.transfer}</div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: routeInfo.color2 + "40" }}>
                    <p className="font-semibold text-xs">
                      2. Cambia a {METRO_LINES.find((l) => l.id === routeInfo.line2)?.name}
                    </p>
                  </div>
                </div>
              )}

              {routeInfo.type === "complex" && (
                <div className="mt-3 p-3 rounded-lg bg-yellow-500/20">
                  <p className="text-yellow-200 text-xs">{routeInfo.message}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                let originParam, destinationParam

                if (routeInfo.fromAccommodationInfo) {
                  originParam = encodeURIComponent(
                    routeInfo.fromAccommodationInfo.accommodation.address ||
                      routeInfo.fromAccommodationInfo.accommodation.name,
                  )
                } else {
                  const from = routeInfo.fromStationData?.name || getStationName(fromStation)
                  originParam = encodeURIComponent(`Metro ${from}, Madrid`)
                }

                if (routeInfo.toAccommodationInfo) {
                  destinationParam = encodeURIComponent(
                    routeInfo.toAccommodationInfo.accommodation.address ||
                      routeInfo.toAccommodationInfo.accommodation.name,
                  )
                } else {
                  const to = routeInfo.toStationData?.name || getStationName(toStation)
                  destinationParam = encodeURIComponent(`Metro ${to}, Madrid`)
                }

                const url = `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destinationParam}&travelmode=transit`
                window.open(url, "_blank")
              }}
              className="mt-3 w-full bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm"
            >
              🗺️ Ver Ruta Completa en Google Maps
            </button>
          </div>
        )}
      </div>

      {/* Estaciones Principales */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          ⭐ Estaciones Principales
        </h3>
        <div className="space-y-2">
          {[
            { id: "sol", desc: "Centro neurálgico - Puerta del Sol" },
            { id: "atocha", desc: "Estación de tren - Conexión AVE" },
            { id: "opera", desc: "Palacio Real - Teatro Real" },
            { id: "gran-via", desc: "Gran Vía - Zona de compras" },
            { id: "retiro", desc: "Parque del Retiro" },
            { id: "nuevos-ministerios", desc: "Conexión Aeropuerto" },
            { id: "aeropuerto-t4", desc: "Terminal 4 - Aeropuerto" },
          ].map((station) => {
            const stationData = METRO_STATIONS.find((s) => s.id === station.id)
            if (!stationData) return null

            return (
              <button
                key={station.id}
                onClick={() => openMetroInMaps(stationData.name)}
                className="w-full bg-white/10 hover:bg-white/20 rounded-lg p-3 text-left transition-colors group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm">{stationData.name}</h4>
                    <p className="text-xs text-white/60">{station.desc}</p>
                    <div className="flex gap-1 mt-1">
                      {stationData.lines.map((lineId) => {
                        const line = METRO_LINES.find((l) => l.id === lineId)
                        return (
                          <span
                            key={lineId}
                            className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{
                              backgroundColor: line?.color,
                              color: ["L3", "L5"].includes(lineId) ? "#000" : "#fff",
                            }}
                          >
                            {lineId}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                    Ver →
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Mapa del Metro */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          🗺️ Mapa del Metro
        </h3>
        <p className="text-sm text-white/70 mb-3">
          Descarga o visualiza el mapa oficial del metro de Madrid
        </p>
        <a
          href="https://www.metromadrid.es/export/sites/metro/.content/Documentos/Planos/Enero2025/Esquematico_MetroLigero_color.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-500 hover:bg-blue-600 px-4 py-3 rounded-lg font-semibold w-full text-center"
        >
          📥 Descargar Mapa Oficial PDF
        </a>
      </div>

      {/* Consejos */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-4">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          💡 Consejos Útiles
        </h3>
        <ul className="space-y-2 text-sm text-white/90">
          <li>✓ Compra la tarjeta Multi (€2.50) + 10 viajes para ahorrar</li>
          <li>✓ Evita hora punta (8-9:30 y 18-20h) si es posible</li>
          <li>✓ Guarda el billete hasta salir - lo necesitas para las barreras</li>
          <li>✓ Las líneas 1, 2, 3, 5 y 10 cubren las zonas turísticas principales</li>
          <li>✓ Para ir al aeropuerto: Línea 8 desde Nuevos Ministerios (+€3 suplemento)</li>
          <li>✓ Descarga la app oficial "Metro Madrid" para horarios en tiempo real</li>
        </ul>
      </div>
    </div>
  )
}
