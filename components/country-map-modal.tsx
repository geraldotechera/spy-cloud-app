"use client"

import { X } from "lucide-react"

interface CountryMapModalProps {
  country: "spain" | "france" | "italy" | "switzerland"
  onClose: () => void
}

export function CountryMapModal({ country, onClose }: CountryMapModalProps) {
  const countryData = {
    spain: {
      name: "España",
      flag: "🇪🇸",
      cities: [
        { name: "Madrid", description: "Capital - 3 días" },
        { name: "Barcelona", description: "3 días" },
      ],
      routes: [
        {
          from: "Madrid",
          to: "Barcelona",
          company: "Renfe AVE",
          duration: "2h 30min",
          type: "Alta Velocidad",
        },
      ],
      mapUrl: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&h=600&fit=crop",
    },
    france: {
      name: "Francia",
      flag: "🇫🇷",
      cities: [{ name: "París", description: "4 días - Capital del arte y cultura" }],
      routes: [
        {
          from: "Barcelona",
          to: "París",
          company: "SNCF TGV",
          duration: "6h 30min",
          type: "Tren Alta Velocidad",
        },
        {
          from: "París",
          to: "Zurich",
          company: "TGV Lyria",
          duration: "4h 3min",
          type: "Alta Velocidad",
        },
      ],
      mapUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
    },
    italy: {
      name: "Italia",
      flag: "🇮🇹",
      cities: [
        { name: "Milán", description: "2 días - Moda y diseño" },
        { name: "Venecia", description: "2 días - Ciudad de canales" },
        { name: "Florencia", description: "3 días - Cuna del Renacimiento" },
        { name: "Pisa", description: "Medio día - Torre inclinada" },
        { name: "Roma", description: "3 días - Ciudad eterna" },
        { name: "Nápoles", description: "Base para Costa Amalfitana" },
        { name: "Sorrento", description: "3 días" },
        { name: "Positano", description: "Costa Amalfitana" },
        { name: "Amalfi", description: "Costa Amalfitana" },
      ],
      routes: [
        {
          from: "Milán",
          to: "Venecia",
          company: "Trenitalia Frecciarossa",
          duration: "2h 25min",
          type: "Alta Velocidad",
        },
        {
          from: "Venecia",
          to: "Florencia",
          company: "Trenitalia Frecciarossa",
          duration: "2h 5min",
          type: "Alta Velocidad",
        },
        {
          from: "Florencia",
          to: "Pisa",
          company: "Trenitalia Regionale",
          duration: "1h",
          type: "Regional",
        },
        {
          from: "Pisa",
          to: "Roma",
          company: "Trenitalia Intercity",
          duration: "2h 45min",
          type: "Intercity",
        },
        {
          from: "Roma",
          to: "Nápoles",
          company: "Trenitalia Frecciarossa",
          duration: "1h 10min",
          type: "Alta Velocidad",
        },
        {
          from: "Nápoles",
          to: "Sorrento",
          company: "Circumvesuviana",
          duration: "1h 10min",
          type: "Regional",
        },
        {
          from: "Sorrento",
          to: "Positano/Amalfi",
          company: "SITA Bus / Ferry",
          duration: "Variable",
          type: "Bus/Ferry",
        },
      ],
      mapUrl: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&h=600&fit=crop",
    },
    switzerland: {
      name: "Suiza",
      flag: "🇨🇭",
      cities: [
        { name: "Zurich", description: "2 días - Ciudad financiera" },
        { name: "Chur", description: "Conexión Bernina Express" },
        { name: "St. Moritz", description: "Ruta panorámica" },
        { name: "Tirano (Italia)", description: "Fin del Bernina Express" },
      ],
      routes: [
        {
          from: "Zurich",
          to: "Chur",
          company: "SBB (Ferrocarriles Suizos)",
          duration: "1h 15min",
          type: "InterCity",
        },
        {
          from: "Chur",
          to: "St. Moritz",
          company: "Bernina Express (RhB)",
          duration: "2h 15min",
          type: "Panorámico",
        },
        {
          from: "St. Moritz",
          to: "Tirano",
          company: "Bernina Express (RhB)",
          duration: "2h 30min",
          type: "Panorámico",
        },
        {
          from: "Tirano",
          to: "Milán",
          company: "Trenitalia Regionale",
          duration: "2h 30min",
          type: "Regional",
        },
      ],
      mapUrl: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800&h=600&fit=crop",
    },
  }

  const data = countryData[country]

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{data.flag}</span>
            <h2 className="text-3xl font-bold">{data.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all duration-200 flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Mapa visual */}
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <img
              src={data.mapUrl || "/placeholder.svg"}
              alt={`Mapa de ${data.name}`}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <p className="text-white font-semibold text-lg">Vista panorámica de {data.name}</p>
            </div>
          </div>

          {/* Ciudades */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🏙️</span>
              Ciudades del itinerario
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.cities.map((city, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800"
                >
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">{city.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{city.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rutas ferroviarias */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🚄</span>
              Rutas y compañías de transporte
            </h3>
            <div className="space-y-3">
              {data.routes.map((route, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white">{route.from}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-bold text-gray-900 dark:text-white">{route.to}</span>
                    </div>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{route.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      <span className="font-semibold">Compañía:</span> {route.company}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                      {route.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">💡 Consejo:</span> Reserva los trenes de alta velocidad con anticipación
              para obtener mejores precios. Las compañías ferroviarias suelen ofrecer descuentos por reserva temprana.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
