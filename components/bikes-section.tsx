"use client"

interface BikesSectionProps {
  onBack: () => void
}

export function BikesSection({ onBack }: BikesSectionProps) {
  const bikeInfo = {
    madrid: {
      name: "BiciMAD",
      stations: "Más de 250 estaciones en el centro",
      price: "€2/30min o €15/mes",
      app: "BiciMAD App",
      mapUrl: "https://www.bicimad.com/mapa-de-estaciones",
      androidUrl: "https://play.google.com/store/apps/details?id=com.emt.bicimad",
      iosUrl: "https://apps.apple.com/es/app/bicimad/id916288842",
    },
    barcelona: {
      name: "Bicing",
      stations: "Más de 400 estaciones",
      price: "€50/año (turistas: Donkey Republic €3/h)",
      app: "Bicing App / Donkey Republic",
      mapUrl: "https://www.bicing.barcelona/es/mapa",
      androidUrl: "https://play.google.com/store/apps/details?id=com.pbsc.bicing",
      iosUrl: "https://apps.apple.com/es/app/bicing/id1253888988",
    },
    paris: {
      name: "Vélib' Métropole",
      stations: "Más de 1,400 estaciones",
      price: "€5/día o €20/semana",
      app: "Vélib' App",
      mapUrl: "https://www.velib-metropole.fr/map",
      androidUrl: "https://play.google.com/store/apps/details?id=fr.velib",
      iosUrl: "https://apps.apple.com/fr/app/v%C3%A9lib-m%C3%A9tropole/id1273704694",
    },
    amsterdam: {
      name: "OV-fiets",
      stations: "En estaciones de tren",
      price: "€4.15/24h (alquiler tradicional €10-15/día)",
      app: "NS App",
      mapUrl: "https://www.ns.nl/en/door-to-door/ov-fiets/where-to-find-ov-fiets",
      androidUrl: "https://play.google.com/store/apps/details?id=nl.ns.android.activity",
      iosUrl: "https://apps.apple.com/nl/app/ns/id370393785",
    },
    milan: {
      name: "BikeMi",
      stations: "Más de 280 estaciones",
      price: "€4.50/día o €10/semana",
      app: "BikeMi App",
      mapUrl: "https://bikemi.com/en/map/",
      androidUrl: "https://play.google.com/store/apps/details?id=com.bikemi.bikemi",
      iosUrl: "https://apps.apple.com/it/app/bikemi/id446258306",
    },
    florencia: {
      name: "Mobike",
      stations: "Bicicletas sin estación (free-floating)",
      price: "€1.50/20min",
      app: "Mobike App",
      mapUrl: "https://mobike.com/global/",
      androidUrl: "https://play.google.com/store/apps/details?id=com.mobike.mobikeapp",
      iosUrl: "https://apps.apple.com/app/mobike/id1044535426",
    },
    roma: {
      name: "Roma Bike Sharing",
      stations: "Más de 200 estaciones",
      price: "€5/día",
      app: "Roma Mobilità App",
      mapUrl: "https://romamobilita.it/it/azienda/open-data/api-real-time",
      androidUrl: "https://play.google.com/store/apps/details?id=it.romamobilita.app",
      iosUrl: "https://apps.apple.com/it/app/roma-mobilit%C3%A0/id1436477864",
    },
    napoles: {
      name: "Bike Sharing Napoli",
      stations: "Estaciones en centro histórico",
      price: "€1/h",
      app: "ANM Napoli App",
      mapUrl: "https://www.anm.it/bike-sharing",
      androidUrl: "https://play.google.com/store/apps/details?id=it.anm.android",
      iosUrl: "https://apps.apple.com/it/app/anm-napoli/id1436477864",
    },
  }

  const openAppStore = (androidUrl: string, iosUrl: string) => {
    const userAgent = navigator.userAgent || navigator.vendor
    const isIOS = /iPad|iPhone|iPod/.test(userAgent)
    const isAndroid = /android/i.test(userAgent)

    if (isIOS) {
      window.open(iosUrl, "_blank")
    } else if (isAndroid) {
      window.open(androidUrl, "_blank")
    } else {
      // Si no es móvil, abrir Android por defecto
      window.open(androidUrl, "_blank")
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
      >
        ← Volver al Menú
      </button>

      <h2 className="text-xl font-bold">🚲 Bicicletas Públicas por Ciudad</h2>

      <div className="space-y-3">
        {Object.entries(bikeInfo).map(([city, info]) => (
          <div key={city} className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
            <h4 className="font-semibold text-lg capitalize mb-2">{city}</h4>
            <p className="text-sm">
              <strong>Sistema:</strong> {info.name}
            </p>
            <p className="text-sm">
              <strong>Estaciones:</strong> {info.stations}
            </p>
            <p className="text-sm">
              <strong>Precio:</strong> {info.price}
            </p>
            <p className="text-sm mb-3">
              <strong>App:</strong> {info.app}
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => window.open(info.mapUrl, "_blank")}
                className="flex-1 min-w-[140px] bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-lg text-sm transition-colors"
              >
                🗺️ Ver Mapa
              </button>
              <button
                onClick={() => openAppStore(info.androidUrl, info.iosUrl)}
                className="flex-1 min-w-[140px] bg-green-500 hover:bg-green-600 px-3 py-2 rounded-lg text-sm transition-colors"
              >
                📱 Descargar App
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
