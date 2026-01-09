"use client"

import { useState } from "react"
import type { Accommodation } from "@/types"

interface TransportModalProps {
  isOpen: boolean
  onClose: () => void
  from: string
  to: string
  title: string
  isFirstEvent: boolean
  isLastEvent: boolean
  accommodations: Accommodation[]
}

function calculateDistance(location1: string, location2: string): number {
  // Base de datos de coordenadas de ubicaciones principales
  const locationCoords: { [key: string]: { lat: number; lng: number } } = {
    // Madrid
    "Plaza Mayor, Madrid": { lat: 40.4155, lng: -3.7074 },
    "Museo del Prado, Madrid": { lat: 40.4138, lng: -3.6921 },
    "Cerca del Retiro, Madrid": { lat: 40.4153, lng: -3.6844 },
    "Parque del Retiro, Madrid": { lat: 40.4153, lng: -3.6844 },
    "Museo Reina Sofía, Madrid": { lat: 40.4079, lng: -3.6937 },
    "Barrio de Las Letras, Madrid": { lat: 40.4138, lng: -3.6979 },
    "Plaza de Oriente, Madrid": { lat: 40.418, lng: -3.7143 },
    "Palacio Real, Madrid": { lat: 40.418, lng: -3.7143 },
    "Catedral de la Almudena, Madrid": { lat: 40.4156, lng: -3.7147 },
    "La Latina, Madrid": { lat: 40.4095, lng: -3.7113 },
    "Cava Baja, Madrid": { lat: 40.4095, lng: -3.7113 },
    "Puerta de Alcalá, Madrid": { lat: 40.42, lng: -3.6889 },
    "Barrio Salamanca, Madrid": { lat: 40.43, lng: -3.68 },
    "Lavapiés, Madrid": { lat: 40.4085, lng: -3.701 },

    // Barcelona
    "Eixample, Barcelona": { lat: 41.3874, lng: 2.1686 },
    "Sagrada Família, Barcelona": { lat: 41.4036, lng: 2.1744 },
    "Passeig de Gràcia, Barcelona": { lat: 41.3932, lng: 2.1649 },
    "Park Güell, Barcelona": { lat: 41.4145, lng: 2.1527 },
    "Museo Picasso, Barcelona": { lat: 41.3851, lng: 2.181 },
    "El Born, Barcelona": { lat: 41.3851, lng: 2.181 },
    "Barrio Gótico, Barcelona": { lat: 41.3828, lng: 2.1764 },
    "Montjuïc, Barcelona": { lat: 41.3644, lng: 2.166 },

    // París
    "Barrio Latino, París": { lat: 48.8503, lng: 2.3439 },
    "Île de la Cité, París": { lat: 48.8546, lng: 2.3477 },
    "Museo del Louvre, París": { lat: 48.8606, lng: 2.3376 },
    "Torre Eiffel, París": { lat: 48.8584, lng: 2.2945 },
    "Rue Cler, París": { lat: 48.8566, lng: 2.3059 },
    "Musée d'Orsay, París": { lat: 48.86, lng: 2.3266 },
    "Montmartre, París": { lat: 48.8867, lng: 2.3431 },
    "Le Marais, París": { lat: 48.859, lng: 2.3625 },
    "Centre Pompidou, París": { lat: 48.8606, lng: 2.3522 },
    "Museo Rodin, París": { lat: 48.8553, lng: 2.3159 },

    // Roma
    "Coliseo, Roma": { lat: 41.8902, lng: 12.4922 },
    "Monti, Roma": { lat: 41.8947, lng: 12.4914 },
    "Museos Vaticanos, Roma": { lat: 41.9065, lng: 12.4536 },
    "Basílica de San Pedro, Roma": { lat: 41.9022, lng: 12.4539 },
    "Borgo Pio, Roma": { lat: 41.9022, lng: 12.4539 },
    "Trastevere, Roma": { lat: 41.8897, lng: 12.4689 },
    "Galería Borghese, Roma": { lat: 41.9142, lng: 12.4922 },

    // Otras ciudades
    "Rijksmuseum, Ámsterdam": { lat: 52.36, lng: 4.8852 },
    "Casa de Ana Frank, Ámsterdam": { lat: 52.3752, lng: 4.884 },
    "Museumplein, Ámsterdam": { lat: 52.358, lng: 4.8814 },
    "Duomo de Milán": { lat: 45.4642, lng: 9.19 },
    "Cerca del Duomo, Milán": { lat: 45.4642, lng: 9.19 },
    "Brera, Milán": { lat: 45.4719, lng: 9.1881 },
    "Piazza San Marco, Venecia": { lat: 45.4343, lng: 12.3388 },
    "Rialto, Venecia": { lat: 45.438, lng: 12.3358 },
    "Palacio Ducal, Venecia": { lat: 45.4343, lng: 12.3403 },
    "Duomo de Florencia": { lat: 43.7731, lng: 11.256 },
    "Cerca del Duomo, Florencia": { lat: 43.7731, lng: 11.256 },
    "Galleria dell'Accademia, Florencia": { lat: 43.7769, lng: 11.2588 },
    "Galería Uffizi, Florencia": { lat: 43.7678, lng: 11.2558 },
    "Piazzale Michelangelo, Florencia": { lat: 43.763, lng: 11.265 },
    "Spaccanapoli, Nápoles": { lat: 40.8518, lng: 14.2681 },
  }

  // Función para extraer la clave de ubicación más cercana
  const findClosestLocation = (location: string): { lat: number; lng: number } | null => {
    // Buscar coincidencia exacta primero
    if (locationCoords[location]) {
      return locationCoords[location]
    }

    // Buscar coincidencia parcial
    for (const key in locationCoords) {
      if (location.includes(key.split(",")[0]) || key.includes(location.split(",")[0])) {
        return locationCoords[key]
      }
    }

    return null
  }

  const coord1 = findClosestLocation(location1)
  const coord2 = findClosestLocation(location2)

  if (!coord1 || !coord2) {
    return 1.2 // Distancia por defecto si no se encuentran coordenadas
  }

  // Fórmula de Haversine para calcular distancia entre dos puntos en la Tierra
  const R = 6371 // Radio de la Tierra en km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  // Ajustar distancia para caminar por calles (aproximadamente 1.3x la distancia en línea recta)
  return Math.round(distance * 1.3 * 10) / 10
}

export function TransportModal({
  isOpen,
  onClose,
  from,
  to,
  title,
  isFirstEvent,
  isLastEvent,
  accommodations,
}: TransportModalProps) {
  const [selectedAccommodation, setSelectedAccommodation] = useState<string>(from)
  const [showAccommodationSelector, setShowAccommodationSelector] = useState(isFirstEvent && from === "Alojamiento")

  if (!isOpen) return null

  if (isLastEvent) {
    const currentAccommodation = accommodations[0] // Obtener el alojamiento actual
    const accommodationLocation = currentAccommodation?.location || "Alojamiento"

    const openGoogleMapsToAccommodation = () => {
      const origin = encodeURIComponent(to)
      const destination = encodeURIComponent(accommodationLocation)
      const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`
      window.open(url, "_blank")
    }

    return (
      <div
        className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Regreso al Alojamiento</h3>
            <button onClick={onClose} className="text-2xl hover:text-red-400 transition-colors">
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm mb-2">
                🏨 Este es el último evento del día. Te ayudamos a regresar a tu alojamiento.
              </p>
              <p className="text-sm">
                <strong>Desde:</strong> {to}
              </p>
              <p className="text-sm">
                <strong>Hasta:</strong> {accommodationLocation}
              </p>
            </div>

            <button
              onClick={openGoogleMapsToAccommodation}
              className="w-full bg-blue-500 hover:bg-blue-600 px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              🗺️ Abrir Google Maps al Alojamiento
            </button>

            <button
              onClick={onClose}
              className="w-full bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showAccommodationSelector) {
    return (
      <div
        className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Seleccionar Alojamiento</h3>
            <button onClick={onClose} className="text-2xl hover:text-red-400 transition-colors">
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm">
                🏨 Este es el primer evento del día. Selecciona tu alojamiento para calcular la distancia desde allí.
              </p>
            </div>

            <div className="space-y-2">
              {accommodations.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => {
                    setSelectedAccommodation(acc.location)
                    setShowAccommodationSelector(false)
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 rounded-lg p-4 text-left transition-colors"
                >
                  <h4 className="font-semibold">{acc.name}</h4>
                  <p className="text-sm text-white/70">{acc.location}</p>
                  <p className="text-xs text-white/50 mt-1">{acc.dates}</p>
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full bg-red-500/30 hover:bg-red-500/50 px-6 py-3 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  const actualFrom = isFirstEvent ? selectedAccommodation : from

  const openGoogleMaps = () => {
    const origin = encodeURIComponent(actualFrom)
    const destination = encodeURIComponent(to)
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`
    window.open(url, "_blank")
  }

  const estimatedDistance = calculateDistance(actualFrom, to)
  const walkingTime = Math.round((estimatedDistance / 5) * 60) // 5 km/h velocidad promedio caminando

  const getTransportInstructions = () => {
    return {
      walking: {
        icon: "🚶",
        name: "Caminando",
        time: `${walkingTime}-${walkingTime + 5} min`,
        description: `Distancia: ${estimatedDistance} km por calle. Ruta peatonal directa.`,
      },
      subway: {
        icon: "🚇",
        name: "Metro/Subte",
        time: `${Math.round(walkingTime * 0.6)}-${Math.round(walkingTime * 0.8)} min`,
        description: "Toma la línea más cercana. Consulta el mapa local.",
      },
      bus: {
        icon: "🚌",
        name: "Autobús",
        time: `${Math.round(walkingTime * 0.7)}-${Math.round(walkingTime * 1.2)} min`,
        description: "Varias líneas disponibles. Verifica horarios locales.",
      },
      taxi: {
        icon: "🚕",
        name: "Taxi",
        time: `${Math.round(walkingTime * 0.4)}-${Math.round(walkingTime * 0.6)} min`,
        description: `Opción rápida y directa. Precio aproximado: €${Math.round(estimatedDistance * 2)}-${Math.round(estimatedDistance * 3)}`,
      },
    }
  }

  const transportOptions = getTransportInstructions()

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Cómo Llegar</h3>
          <button onClick={onClose} className="text-2xl hover:text-red-400 transition-colors">
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold mb-2">{title}</h4>
            <div className="text-sm space-y-1">
              <p>
                <strong>Desde:</strong> {actualFrom}
              </p>
              <p>
                <strong>Hasta:</strong> {to}
              </p>
              <p className="text-blue-400 mt-2">
                <strong>📏 Distancia caminando:</strong> {estimatedDistance} km
              </p>
            </div>
            {isFirstEvent && (
              <button
                onClick={() => setShowAccommodationSelector(true)}
                className="mt-3 w-full bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-colors"
              >
                🏨 Cambiar Alojamiento
              </button>
            )}
          </div>

          <button
            onClick={openGoogleMaps}
            className="w-full bg-blue-500 hover:bg-blue-600 px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            🗺️ Abrir en Google Maps
          </button>

          <div className="space-y-3">
            <h4 className="font-semibold">Opciones de transporte:</h4>
            {Object.entries(transportOptions).map(([key, option]) => (
              <div key={key} className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="font-semibold">{option.name}</h5>
                      <span className="text-sm text-blue-400">{option.time}</span>
                    </div>
                    <p className="text-sm text-white/70">{option.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm">
              💡 <strong>Consejo:</strong> Usa el botón de Google Maps para obtener direcciones precisas y en tiempo
              real desde tu ubicación actual.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
