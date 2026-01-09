"use client"

import type { Event } from "@/types"

interface BikeRecommendationProps {
  events: Event[]
  city: string
}

export function BikeRecommendation({ events, city }: BikeRecommendationProps) {
  // Sistemas de bicicletas públicas por ciudad
  const bikeSystems: Record<string, { name: string; hasBikes: boolean; safe: boolean }> = {
    Madrid: { name: "BiciMAD", hasBikes: true, safe: true },
    Barcelona: { name: "Bicing", hasBikes: true, safe: true },
    París: { name: "Vélib'", hasBikes: true, safe: true },
    Versalles: { name: "Vélib'", hasBikes: false, safe: true },
    Amsterdam: { name: "OV-fiets", hasBikes: true, safe: true },
    Zúrich: { name: "Züri rollt", hasBikes: true, safe: true },
    Milán: { name: "BikeMi", hasBikes: true, safe: true },
    Florencia: { name: "Mobike", hasBikes: true, safe: true },
    Roma: { name: "Roma'n'Bike", hasBikes: true, safe: false }, // Tráfico caótico
    Nápoles: { name: "Goodbike", hasBikes: false, safe: false }, // Tráfico muy caótico
    Venecia: { name: "N/A", hasBikes: false, safe: false }, // Ciudad sin calles para bicicletas
  }

  const cityInfo = bikeSystems[city] || { name: "N/A", hasBikes: false, safe: false }

  // Calcular distancia aproximada entre eventos (simplificado)
  const calculateDistance = (event1: Event, event2: Event): number => {
    // Distancias aproximadas basadas en ubicaciones típicas
    // En una implementación real, usarías una API de mapas
    const loc1 = event1.location.toLowerCase()
    const loc2 = event2.location.toLowerCase()

    // Si están en el mismo lugar o muy cerca, distancia corta
    if (loc1.includes(loc2.substring(0, 10)) || loc2.includes(loc1.substring(0, 10))) {
      return 0.5
    }

    // Distancias típicas entre puntos turísticos principales
    return 2.5 // Promedio de 2.5 km entre atracciones
  }

  // Analizar si conviene usar bicicleta
  const totalDistance = events.reduce((sum, event, index) => {
    if (index === 0) return 0
    return sum + calculateDistance(events[index - 1], event)
  }, 0)

  const avgDistance = events.length > 1 ? totalDistance / (events.length - 1) : 0
  const shouldUseBike = cityInfo.hasBikes && cityInfo.safe && avgDistance >= 2 && events.length >= 3

  if (!cityInfo.hasBikes) {
    return null // No mostrar nada si no hay sistema de bicicletas
  }

  return (
    <div
      className={`rounded-xl p-4 ${
        shouldUseBike
          ? "bg-green-500/20 border-2 border-green-500/50"
          : "bg-yellow-500/20 border-2 border-yellow-500/50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">{shouldUseBike ? "🚴" : "ℹ️"}</div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">
            {shouldUseBike ? "Recomendado: Alquilar Bicicleta" : "Información de Bicicletas"}
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Sistema:</span>
              <span>{cityInfo.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold">Distancia promedio:</span>
              <span>{avgDistance.toFixed(1)} km entre eventos</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold">Estaciones:</span>
              <span className={cityInfo.hasBikes ? "text-green-400" : "text-red-400"}>
                {cityInfo.hasBikes ? "Disponibles en toda la ciudad" : "No disponibles"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold">Tráfico:</span>
              <span className={cityInfo.safe ? "text-green-400" : "text-yellow-400"}>
                {cityInfo.safe ? "Rutas seguras con ciclovías" : "Tráfico intenso, precaución"}
              </span>
            </div>

            {shouldUseBike && (
              <div className="mt-3 p-3 bg-white/10 rounded-lg">
                <p className="font-semibold text-green-400 mb-1">Por qué conviene:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Distancia ideal para bicicleta (más de 2 km)</li>
                  <li>Estaciones disponibles en todos los puntos turísticos</li>
                  <li>Ciclovías seguras y bien señalizadas</li>
                  <li>Ahorro de tiempo vs transporte público</li>
                  <li>Experiencia más auténtica de la ciudad</li>
                </ul>
              </div>
            )}

            {!shouldUseBike && cityInfo.hasBikes && (
              <div className="mt-3 p-3 bg-white/10 rounded-lg">
                <p className="font-semibold text-yellow-400 mb-1">Consideraciones:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  {avgDistance < 2 && <li>Distancias cortas, mejor caminar</li>}
                  {!cityInfo.safe && <li>Tráfico intenso, considerar transporte público</li>}
                  {events.length < 3 && <li>Pocos eventos, no justifica alquilar</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
