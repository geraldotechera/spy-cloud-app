"use client"

import { useState } from "react"
import type { Accommodation, User } from "@/types"

interface AccommodationSectionProps {
  accommodations: Accommodation[]
  currentUser: User
  onBack: () => void
  onUpdateAccommodations: (accommodations: Accommodation[]) => void
}

export function AccommodationSection({
  accommodations,
  currentUser,
  onBack,
  onUpdateAccommodations,
}: AccommodationSectionProps) {
  const [showLuggageInfo, setShowLuggageInfo] = useState(false)
  const [newUrls, setNewUrls] = useState<Record<string, string>>({})
  const [showExportModal, setShowExportModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importCode, setImportCode] = useState("")
  const [exportCode, setExportCode] = useState("")

  const cities = ["Madrid", "Barcelona", "París", "Ámsterdam", "Milán", "Florencia", "Roma", "Vico Equense / Costa Amalfitana"]

  const cityDetails: Record<string, { address?: string; transport?: string[] }> = {
    Barcelona: {
      address: "Plaza de Europa 25, L'Hospitalet de Llobregat, Catalunya 08908",
      transport: [
        "🚇 Metro: Estación Europa/Fira (Líneas L3-Verde, L8, L9-Sur)",
        "📍 A 2 min caminando del alojamiento",
        "🎫 Comprar T-Casual (10 viajes €12.15) o Hola Barcelona Card (2 días ilimitados €16.40)",
        "⚡ Conexión directa a Sagrada Família (15 min), Passeig de Gràcia (7 min), Park Güell (20 min)",
      ],
    },
    Milán: {
      address: "Via Alessandro Tadino, 17, Milán, Lombardía 20124, Italia",
      transport: [
        "🚇 Metro: Estación Porta Venezia (Línea M1 - Roja) a 4 min caminando",
        "🚌 Bus 60 y 61 pasan por Via Tadino con conexión al centro",
        "📍 Zona Porta Venezia / Buenos Aires — barrio céntrico y animado",
        "⚡ Desde Milano Centrale: Metro M2 (Verde) desde Centrale → Repubblica → caminar 8 min, o M1 Loreto → Porta Venezia",
        "🏛️ Al Duomo: 15 min en metro (Porta Venezia → Duomo en M1)",
        "🔙 Para la salida a Venecia: Metro M1 desde Porta Venezia → Centrale (15 min) o taxi ~€8",
      ],
    },
    París: {
      address: "57 Rue Schaeffer Bâtiment B, Aubervilliers, Isla de Francia 93300, Francia",
      transport: [
        "🚇 Metro: Línea 12 — Estación Porte de la Chapelle (10 min caminando) o Línea 13 — Basilique de Saint-Denis",
        "🚌 Bus 153 y 302 con paradas cercanas en Aubervilliers",
        "🚃 RER D o E desde Gare du Nord / Gare de Lyon hasta el centro",
        "📍 Zona norte de París (Seine-Saint-Denis) — barrio multicultural y bien conectado",
        "⚡ Desde Gare de Lyon (llegada en TGV): Metro M14 → Gare du Nord → Metro M12 → Porte de la Chapelle (35 min total)",
        "🔙 Para salida a Milán (Gare de Lyon): Bus/metro desde Aubervilliers → Gare du Nord → Metro → Gare de Lyon (~40 min)",
        "🗺️ Al centro de París (Louvre/Torre Eiffel): 30-40 min en transporte público",
      ],
    },
    Florencia: {
      address: "Via della Scala, 73, Florencia, Toscana 50123, Italia",
      transport: [
        "🚶 A 5 min caminando de la Estación Santa Maria Novella — salir por la salida principal y tomar Via della Scala a la derecha",
        "🚌 Bus 11, 36, 37 paran en Via della Scala con conexión a toda la ciudad",
        "📍 Zona Santa Maria Novella / Oltrarno — central, a pasos del Duomo y Ponte Vecchio",
        "⚡ Llegada desde Venecia (tren Frecciarossa ~21:35): caminata de 5 min a la derecha saliendo de la estación",
        "🔙 Para salida a Roma: Caminata 5 min a la estación SMN. Tren Frecciarossa Firenze → Roma Termini (1h 30min)",
        "🗺️ Al Duomo: 10 min caminando. A los Uffizi: 15 min caminando",
      ],
    },
    Roma: {
      address: "Viale Manzoni, 91 B 24, Roma, Lacio 00185, Italia",
      transport: [
        "🚇 Metro: Línea A — Estación San Giovanni a 5 min caminando por Viale Manzoni",
        "🚌 Bus 85, 87, 3 pasan por Viale Manzoni",
        "📍 Zona San Giovanni / Celio — barrio tranquilo a 15 min del Coliseo y 20 min de la Fontana di Trevi",
        "⚡ Desde Roma Termini: Metro A dirección Anagnina → San Giovanni (3 paradas, 8 min) + 5 min caminando",
        "🔙 Para salida a Nápoles: Metro A desde San Giovanni → Roma Termini (2 paradas, 5 min), luego Frecciarossa Roma → Napoli (1h 10min)",
        "🏛️ Al Coliseo: Bus 85 o 87 (15 min) o taxi ~€8",
        "🗺️ Al Vaticano: Metro A desde San Giovanni → Ottaviano (11 paradas, 18 min)",
      ],
    },
    "Vico Equense / Costa Amalfitana": {
      address: "Via Girolamo Giusso, 5, Vico Equense, Campania 80069, Italia",
      transport: [
        "🚆 Circumvesuviana: parada Vico Equense. Desde Nápoles Centrale: 35 min (~€2.40). Desde Sorrento: 15 min (~€1.50)",
        "📍 Vico Equense — pueblo sobre el acantilado entre Nápoles y Sorrento, con vistas al Vesubio y al Golfo",
        "⚡ A Sorrento (base para ferries a Capri y Amalfi): Circumvesuviana 15 min o taxi ~€10",
        "🚢 Ferries a Positano/Amalfi/Capri salen desde Sorrento (Marina Piccola) — 15 min desde Vico Equense",
        "🔙 Para salida a Nápoles/aeropuerto: Circumvesuviana Vico Equense → Napoli Centrale (35 min)",
        "🍕 Vico Equense es famosa por haber inventado la pizza al metro (Ristorante Gigino)",
      ],
    },
  }

  const luggageStorage = {
    madrid: [
      {
        name: "Locker in the City - Atocha",
        address: "Estación de Atocha, Madrid",
        hours: "6:00 - 23:00",
        price: "€5-8/día",
        maps: "https://maps.google.com/?q=Estación+Atocha+Madrid",
      },
      {
        name: "LuggageHero - Sol",
        address: "Puerta del Sol, Madrid",
        hours: "24/7 (según tienda)",
        price: "€1/hora o €8/día",
        maps: "https://maps.google.com/?q=Puerta+del+Sol+Madrid",
      },
    ],
    barcelona: [
      {
        name: "Locker Barcelona - Sants",
        address: "Estación Barcelona Sants",
        hours: "5:30 - 23:00",
        price: "€5-10/día",
        maps: "https://maps.google.com/?q=Estación+Barcelona+Sants",
      },
      {
        name: "LuggageHero - Ramblas",
        address: "La Rambla, Barcelona",
        hours: "24/7 (según tienda)",
        price: "€1/hora o €8/día",
        maps: "https://maps.google.com/?q=La+Rambla+Barcelona",
      },
    ],
    paris: [
      {
        name: "Nannybag - Gare du Nord",
        address: "Gare du Nord, París",
        hours: "24/7 (según tienda)",
        price: "€6/día",
        maps: "https://maps.google.com/?q=Gare+du+Nord+Paris",
      },
      {
        name: "Eelway - Louvre",
        address: "Cerca del Louvre, París",
        hours: "9:00 - 20:00",
        price: "€10/día",
        maps: "https://maps.google.com/?q=Louvre+Museum+Paris",
      },
    ],
    amsterdam: [
      {
        name: "Stasher - Central Station",
        address: "Amsterdam Centraal",
        hours: "24/7 (según tienda)",
        price: "€6/día",
        maps: "https://maps.google.com/?q=Amsterdam+Centraal",
      },
      {
        name: "LuggageHero - Dam Square",
        address: "Dam Square, Ámsterdam",
        hours: "24/7 (según tienda)",
        price: "€1/hora o €8/día",
        maps: "https://maps.google.com/?q=Dam+Square+Amsterdam",
      },
    ],
    milan: [
      {
        name: "KiPoint - Milano Centrale",
        address: "Estación Milano Centrale",
        hours: "6:00 - 23:00",
        price: "€6/día",
        maps: "https://maps.google.com/?q=Milano+Centrale",
      },
      {
        name: "Radical Storage - Duomo",
        address: "Cerca del Duomo, Milán",
        hours: "24/7 (según tienda)",
        price: "€5/día",
        maps: "https://maps.google.com/?q=Duomo+Milano",
      },
    ],
    florencia: [
      {
        name: "Stow Your Bags - SMN",
        address: "Estación Santa Maria Novella",
        hours: "6:00 - 23:00",
        price: "€6/día",
        maps: "https://maps.google.com/?q=Santa+Maria+Novella+Firenze",
      },
      {
        name: "LuggageHero - Duomo",
        address: "Cerca del Duomo, Florencia",
        hours: "24/7 (según tienda)",
        price: "€1/hora o €8/día",
        maps: "https://maps.google.com/?q=Duomo+Firenze",
      },
    ],
    roma: [
      {
        name: "Deposito Bagagli - Termini",
        address: "Estación Termini, Roma",
        hours: "6:00 - 23:00",
        price: "€6-12/día",
        maps: "https://maps.google.com/?q=Stazione+Termini+Roma",
      },
      {
        name: "Radical Storage - Colosseo",
        address: "Cerca del Coliseo, Roma",
        hours: "24/7 (según tienda)",
        price: "€5/día",
        maps: "https://maps.google.com/?q=Colosseo+Roma",
      },
    ],
    sorrento: [
      {
        name: "Stasher - Vico Equense / Sorrento",
        address: "Estación o centro de Vico Equense / Sorrento",
        hours: "24/7 (según tienda)",
        price: "€6/día",
        maps: "https://maps.google.com/?q=Vico+Equense+stazione",
      },
      {
        name: "LuggageHero - Sorrento Estación",
        address: "Cerca de la estación Circumvesuviana, Sorrento",
        hours: "24/7 (según tienda)",
        price: "€1/hora o €8/día",
        maps: "https://maps.google.com/?q=Sorrento+Station",
      },
    ],
  }

  const getAccommodationsForCity = (city: string) => {
    // Match both "Sorrento" (legacy) and "Vico Equense / Costa Amalfitana" / "Vico Equense"
    if (city === "Vico Equense / Costa Amalfitana") {
      return accommodations.filter(
        (acc) =>
          acc.city === city ||
          acc.city === "Sorrento" ||
          acc.city === "Vico Equense" ||
          acc.city === "Vico Equense / Costa Amalfitana",
      )
    }
    return accommodations.filter((acc) => acc.city === city)
  }

  const handleAddAccommodation = (city: string) => {
    if (currentUser.role !== "admin") {
      alert("Solo el administrador puede agregar alojamientos")
      return
    }

    const url = newUrls[city]?.trim()
    if (!url) {
      alert("Por favor pega un enlace")
      return
    }

    const cityAccommodations = getAccommodationsForCity(city)
    if (cityAccommodations.length >= 3) {
      alert("Ya hay 3 opciones para esta ciudad. Elimina una para agregar otra.")
      return
    }

    const newAccommodation: Accommodation = {
      id: Date.now(),
      city,
      name: `Opción ${cityAccommodations.length + 1}`,
      url,
      notes: "",
    }

    onUpdateAccommodations([...accommodations, newAccommodation])
    setNewUrls({ ...newUrls, [city]: "" })
  }

  const handleDeleteAccommodation = (id: number) => {
    if (currentUser.role !== "admin") {
      alert("Solo el administrador puede eliminar alojamientos")
      return
    }
    const updated = accommodations.filter((acc) => acc.id !== id)
    onUpdateAccommodations(updated)
  }

  const handleExport = () => {
    const dataToExport = {
      accommodations,
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser.name,
    }
    const jsonString = JSON.stringify(dataToExport)
    const base64Code = btoa(unescape(encodeURIComponent(jsonString)))
    setExportCode(base64Code)
    setShowExportModal(true)
  }

  const handleImport = () => {
    try {
      const jsonString = decodeURIComponent(escape(atob(importCode.trim())))
      const importedData = JSON.parse(jsonString)

      if (!importedData.accommodations || !Array.isArray(importedData.accommodations)) {
        alert("Código inválido. Por favor verifica el código e intenta nuevamente.")
        return
      }

      onUpdateAccommodations(importedData.accommodations)
      setShowImportModal(false)
      setImportCode("")
      alert(
        `Alojamientos importados exitosamente!\n\nExportado por: ${importedData.exportedBy}\nFecha: ${new Date(importedData.exportedAt).toLocaleString("es-ES")}`,
      )
    } catch (error) {
      alert("Error al importar. Verifica que el código sea correcto.")
      console.error(error)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(exportCode)
    alert("Código copiado al portapapeles!")
  }

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
      >
        ← Volver al Menú
      </button>
      <h2 className="text-xl font-bold">Alojamiento</h2>

      {currentUser.role === "admin" && (
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 bg-blue-500 hover:bg-blue-600 px-4 py-3 rounded-lg font-semibold"
          >
            📤 Exportar Alojamientos
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex-1 bg-green-500 hover:bg-green-600 px-4 py-3 rounded-lg font-semibold"
          >
            📥 Importar Alojamientos
          </button>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Exportar Alojamientos</h3>
            <p className="text-white/80 mb-4">
              Copia este código y compártelo con los demás usuarios. Ellos pueden importarlo para obtener todos tus
              alojamientos.
            </p>
            <textarea
              value={exportCode}
              readOnly
              className="w-full h-40 bg-white/10 rounded-lg p-3 font-mono text-sm border border-white/20 mb-4"
              onClick={(e) => e.currentTarget.select()}
            />
            <div className="flex gap-2">
              <button onClick={handleCopyCode} className="flex-1 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg">
                📋 Copiar Código
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Importar Alojamientos</h3>
            <p className="text-white/80 mb-4">
              Pega el código que te compartió el administrador para importar los alojamientos.
            </p>
            <textarea
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              className="w-full h-40 bg-white/10 rounded-lg p-3 font-mono text-sm border border-white/20 mb-4"
              placeholder="Pega el código aquí..."
            />
            <div className="flex gap-2">
              <button onClick={handleImport} className="flex-1 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg">
                ✓ Importar
              </button>
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportCode("")
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowLuggageInfo(!showLuggageInfo)}
        className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-lg w-full"
      >
        {showLuggageInfo ? "Ocultar" : "Ver"} Consignas de Equipaje por Ciudad
      </button>

      {showLuggageInfo && (
        <div className="space-y-4">
          {Object.entries(luggageStorage).map(([city, locations]) => (
            <div key={city} className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
              <h3 className="font-bold text-lg capitalize mb-3">{city}</h3>
              <div className="space-y-3">
                {locations.map((location, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-3">
                    <h4 className="font-semibold mb-1">{location.name}</h4>
                    <p className="text-sm text-white/80">📍 {location.address}</p>
                    <p className="text-sm text-white/80">🕐 {location.hours}</p>
                    <p className="text-sm text-white/80">💰 {location.price}</p>
                    <a
                      href={location.maps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm"
                    >
                      🗺️ Ver en Google Maps
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-6">
        {cities.map((city) => {
          const cityAccommodations = getAccommodationsForCity(city)
          const cityInfo = cityDetails[city]

          return (
            <div key={city} className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
              <h3 className="font-bold text-lg mb-3">
                {city} ({cityAccommodations.length}/3)
              </h3>

              {cityInfo && (
                <div className="bg-blue-500/20 rounded-lg p-4 mb-4 border border-blue-400/30">
                  {cityInfo.address && (
                    <div className="mb-3">
                      <p className="font-semibold text-blue-300 mb-1">📍 Dirección del Alojamiento:</p>
                      <p className="text-white/90">{cityInfo.address}</p>
                    </div>
                  )}
                  {cityInfo.transport && cityInfo.transport.length > 0 && (
                    <div>
                      <p className="font-semibold text-blue-300 mb-2">🚇 Información de Transporte:</p>
                      <div className="space-y-1">
                        {cityInfo.transport.map((info, idx) => (
                          <p key={idx} className="text-sm text-white/80">
                            {info}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {cityAccommodations.length > 0 && (
                <div className="space-y-2 mb-3">
                  {cityAccommodations.map((acc) => (
                    <div key={acc.id} className="bg-white/5 rounded-lg p-3 relative flex items-center gap-3">
                      <a
                        href={acc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-sm truncate"
                      >
                        🔗 {acc.name}
                      </a>
                      {currentUser.role === "admin" && (
                        <button
                          onClick={() => handleDeleteAccommodation(acc.id!)}
                          className="bg-red-500/30 hover:bg-red-500/50 w-10 h-10 rounded-full flex-shrink-0"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {currentUser.role === "admin" && cityAccommodations.length < 3 && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newUrls[city] || ""}
                    onChange={(e) => setNewUrls({ ...newUrls, [city]: e.target.value })}
                    className="flex-1 bg-white/10 rounded-lg px-3 py-2 border border-white/20 text-sm"
                    placeholder="Pega el enlace de Booking o Airbnb aquí"
                  />
                  <button
                    onClick={() => handleAddAccommodation(city)}
                    className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm flex-shrink-0"
                  >
                    + Agregar
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {currentUser.role !== "admin" && (
        <p className="text-white/50 text-sm text-center">Solo el administrador puede agregar alojamientos</p>
      )}
    </div>
  )
}
