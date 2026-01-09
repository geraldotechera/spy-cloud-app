"use client"

import type { Event } from "@/types"

interface DailyMapProps {
  events: Event[]
  city: string
}

export function DailyMap({ events, city }: DailyMapProps) {
  if (events.length === 0) return null

  const waypoints = events
    .slice(1, -1)
    .map((event) => encodeURIComponent(event.location))
    .join("|")
  const origin = encodeURIComponent(events[0].location)
  const destination = encodeURIComponent(events[events.length - 1].location)

  // Agregar parámetros para líneas rojas y modo walking
  const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${
    waypoints ? `&waypoints=${waypoints}` : ""
  }&travelmode=walking&dir_action=navigate`

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <span>🗺️</span>
        <span>Mapa del Día - {city}</span>
      </h3>
      <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
        {events.map((event, index) => (
          <div key={event.id} className="text-sm flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 text-white font-bold flex items-center justify-center text-xs">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <span className="font-semibold block">{event.title}</span>
              <p className="text-white/70 text-xs truncate">{event.location}</p>
            </div>
          </div>
        ))}
      </div>
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-red-500 hover:bg-red-600 px-4 py-3 rounded-lg text-center font-semibold transition-colors"
      >
        🗺️ Ver Ruta Completa en Google Maps
      </a>
      <p className="text-xs text-white/60 mt-2 text-center">Los puntos están numerados del 1 al {events.length}</p>
    </div>
  )
}
