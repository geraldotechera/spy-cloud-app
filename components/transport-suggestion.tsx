interface Event {
  id: string | number
  title: string
  location: string
  time?: string
}

interface TransportSuggestionProps {
  fromEvent: Event
  toEvent: Event
  city: string
}

// Base de datos de coordenadas de ubicaciones conocidas
const locationCoordinates: { [key: string]: { lat: number; lng: number } } = {
  // Madrid
  "Plaza Mayor, Madrid, España": { lat: 40.4155, lng: -3.7074 },
  "Paseo del Prado, s/n, Madrid, España": { lat: 40.4138, lng: -3.6921 },
  "Paseo del Prado, 8, Madrid, España": { lat: 40.4163, lng: -3.6945 },
  "Plaza de la Independencia, 7, Madrid, España": { lat: 40.4153, lng: -3.6844 },
  "Calle de Santa Isabel, 52, Madrid, España": { lat: 40.4085, lng: -3.6936 },
  "Calle Ferraz, 1, Madrid, España": { lat: 40.4239, lng: -3.7178 },
  "Calle de Bailén, s/n, Madrid, España": { lat: 40.4179, lng: -3.7143 },
  "Calle de Bailén, 2, Madrid, España": { lat: 40.4189, lng: -3.7153 },
  "Calle de Bailén, 10, Madrid, España": { lat: 40.4159, lng: -3.7143 },
  "Cava Baja, Madrid, España": { lat: 40.4115, lng: -3.7089 },
  "Plaza de San Miguel, s/n, Madrid, España": { lat: 40.4155, lng: -3.7084 },
  "Cerca del Retiro, Madrid, España": { lat: 40.4153, lng: -3.6844 },
  "Corral de la Morería, Calle de la Morería, 17, Madrid, España": { lat: 40.4133, lng: -3.7115 },
  "Plaza de Oriente, Madrid, España": { lat: 40.4179, lng: -3.7143 },
  "La Latina, Madrid, España": { lat: 40.4115, lng: -3.7089 },
  "Madrid, España": { lat: 40.4168, lng: -3.7038 },
  "Gran Vía, 32, Madrid, España": { lat: 40.4201, lng: -3.7058 },

  // Madrid extras
  "Estación de Atocha, Madrid, España": { lat: 40.4068, lng: -3.6919 },
  "Calle del Barquillo 41, Madrid": { lat: 40.4243, lng: -3.6953 },
  "Plaza de las Comendadoras, 9, Madrid": { lat: 40.4269, lng: -3.7073 },
  "Paseo del Prado, s/n, Madrid": { lat: 40.4138, lng: -3.6921 },
  "Calle de Santa Isabel, 52, Madrid": { lat: 40.4087, lng: -3.6936 },
  "Barrio de Las Letras, Madrid": { lat: 40.4127, lng: -3.6984 },
  "Plaza del Dos de Mayo, Malasaña, Madrid": { lat: 40.4264, lng: -3.7036 },
  "Calle Ferraz, 1, Madrid": { lat: 40.4237, lng: -3.7178 },
  "Plaza de Cibeles, Madrid": { lat: 40.4197, lng: -3.6937 },
  "Paseo de Recoletos, Madrid": { lat: 40.4231, lng: -3.6926 },

  // Barcelona
  "Carrer de Mallorca, 401, Barcelona, España": { lat: 41.4036, lng: 2.1744 },
  "Passeig de Gràcia, 43, Barcelona, España": { lat: 41.3916, lng: 2.1649 },
  "Passeig de Gràcia, Barcelona, España": { lat: 41.3916, lng: 2.1649 },
  "La Rambla, Barcelona, España": { lat: 41.3818, lng: 2.1734 },
  "Carrer d'Olot, s/n, Barcelona, España": { lat: 41.4145, lng: 2.1527 },
  "Carrer de Montcada, 15-23, Barcelona, España": { lat: 41.3851, lng: 2.1808 },
  "El Born, Barcelona, España": { lat: 41.3851, lng: 2.1808 },
  "Barrio Gótico, Barcelona, España": { lat: 41.3828, lng: 2.1761 },
  "Montjuïc, Barcelona, España": { lat: 41.3644, lng: 2.1658 },
  "Carrer de Marià Labèrnia, s/n, Barcelona, España": { lat: 41.4189, lng: 2.152 },
  "Plaça de Carles Buïgas, 1, Barcelona, España": { lat: 41.3719, lng: 2.1519 },
  "Eixample, Barcelona, España": { lat: 41.3916, lng: 2.1649 },
  "Barcelona, España": { lat: 41.3851, lng: 2.1734 },
  "Ciudad Condal, Rambla de Catalunya, 18, Barcelona, España": { lat: 41.3879, lng: 2.1647 },
  "Aeropuerto El Prat, Barcelona, España": { lat: 41.2974, lng: 2.0833 },
  "Estación Barcelona Sants, España": { lat: 41.375, lng: 2.1415 },
  "La Barceloneta, Barcelona, España": { lat: 41.3784, lng: 2.1897 },
  "Playa de la Barceloneta, Barcelona, España": { lat: 41.3758, lng: 2.1926 },
  "Puerto Olímpico, Barcelona, España": { lat: 41.3866, lng: 2.2015 },
  "Restaurantes Barceloneta, Barcelona, España": { lat: 41.3784, lng: 2.1897 },
  "C/ d'Arístides Maillol, 12, Barcelona, España": { lat: 41.3809, lng: 2.1228 },
  "El Raval, Barcelona, España": { lat: 41.3787, lng: 2.1682 },

  // París
  "Île de la Cité, París, Francia": { lat: 48.8546, lng: 2.3477 },
  "Quai de la Tournelle, París, Francia": { lat: 48.8506, lng: 2.355 },
  "Rue de Rivoli, 75001 París, Francia": { lat: 48.8606, lng: 2.3376 },
  "Jardin des Tuileries, París, Francia": { lat: 48.8634, lng: 2.3275 },
  "Champ de Mars, 5 Avenue Anatole France, París, Francia": { lat: 48.8584, lng: 2.2945 },
  "Place Charles de Gaulle, París, Francia": { lat: 48.8738, lng: 2.295 },
  "Avenue des Champs-Élysées, París, Francia": { lat: 48.8698, lng: 2.3078 },
  "82 Boulevard de Clichy, París, Francia": { lat: 48.8841, lng: 2.3324 },
  "Montmartre, París, Francia": { lat: 48.8867, lng: 2.3431 },
  "Le Marais, París, Francia": { lat: 48.8584, lng: 2.3622 },
  "Place Georges-Pompidou, París, Francia": { lat: 48.8606, lng: 2.3522 },
  "1 Rue de la Légion d'Honneur, París, Francia": { lat: 48.86, lng: 2.3266 },
  "Jardin du Luxembourg, París, Francia": { lat: 48.8462, lng: 2.3372 },
  "Barrio Latino, París, Francia": { lat: 48.8503, lng: 2.3459 },
  "París, Francia": { lat: 48.8566, lng: 2.3522 },
  "Café cerca del Louvre, París, Francia": { lat: 48.8606, lng: 2.3376 },
  "Cerca de Pigalle, París, Francia": { lat: 48.8841, lng: 2.3324 },
  "Port de la Bourdonnais (cerca Torre Eiffel), París, Francia": { lat: 48.8584, lng: 2.2945 },
  "Gare de Lyon, París, Francia": { lat: 48.8447, lng: 2.3737 },
  "Rue des Francs Bourgeois, Le Marais, París, Francia": { lat: 48.8584, lng: 2.3622 },

  // Zúrich
  "Zúrich, Suiza": { lat: 47.3769, lng: 8.5417 },
  "Niederdorf, Zúrich, Suiza": { lat: 47.3731, lng: 8.5447 },
  "Altstadt, Zúrich, Suiza": { lat: 47.3731, lng: 8.5447 },
  "Zürichsee, Zúrich, Suiza": { lat: 47.3667, lng: 8.55 },
  "Bahnhofstrasse, Zúrich, Suiza": { lat: 47.3769, lng: 8.54 },
  "Cerca del lago, Zúrich, Suiza": { lat: 47.3667, lng: 8.55 },
  "Estación Central Zúrich, Suiza": { lat: 47.3779, lng: 8.5403 },

  // Chur y Bernina Express
  "Estación Chur, Suiza": { lat: 46.8499, lng: 9.5302 },
  "Altstadt, Chur, Suiza": { lat: 46.8499, lng: 9.5302 },
  "Hof 19, Chur, Suiza": { lat: 46.8499, lng: 9.5302 },
  "Poststrasse, Chur, Suiza": { lat: 46.8499, lng: 9.5302 },
  "Tirano, Italia": { lat: 46.2153, lng: 10.1686 },
  "Estación Tirano, Italia": { lat: 46.2153, lng: 10.1686 },

  // Milán
  "Piazza del Duomo, Milán, Italia": { lat: 45.4642, lng: 9.19 },
  "Piazza della Scala, Milán, Italia": { lat: 45.4674, lng: 9.1898 },
  "Piazza Santa Maria delle Grazie, 2, Milán, Italia": { lat: 45.4659, lng: 9.1706 },
  "Piazza Castello, Milán, Italia": { lat: 45.4707, lng: 9.1795 },
  "Parco Sempione, Milán, Italia": { lat: 45.4729, lng: 9.1771 },
  "Navigli, Milán, Italia": { lat: 45.4486, lng: 9.177 },
  "Via Ascanio Sforza, 49, Milán, Italia": { lat: 45.4486, lng: 9.177 },
  "Milán, Italia": { lat: 45.4642, lng: 9.19 },
  "Cerca del Duomo, Milán, Italia": { lat: 45.4642, lng: 9.19 },
  "Brera o Navigli, Milán, Italia": { lat: 45.4486, lng: 9.177 },
  "Pasticceria Marchesi, Milán, Italia": { lat: 45.4642, lng: 9.19 },
  "Barrio Brera, Milán, Italia": { lat: 45.4719, lng: 9.1881 },
  "Estación Central, Milán, Italia": { lat: 45.4864, lng: 9.2051 },
  "Scimmie Jazz Club, Via Ascanio Sforza, 49, Milán, Italia": { lat: 45.4486, lng: 9.177 },

  // Venecia
  "Venecia, Italia": { lat: 45.4408, lng: 12.3155 },
  "Piazza San Marco, Venecia, Italia": { lat: 45.4345, lng: 12.3384 },
  "Ponte di Rialto, Venecia, Italia": { lat: 45.438, lng: 12.3358 },
  "Piazza San Marco, 1, Venecia, Italia": { lat: 45.4345, lng: 12.3384 },
  "Santa Lucia, Venecia, Italia": { lat: 45.4408, lng: 12.3208 },

  // Florencia
  "Piazza del Duomo, Florencia, Italia": { lat: 43.7731, lng: 11.256 },
  "Piazzale degli Uffizi, 6, Florencia, Italia": { lat: 43.7687, lng: 11.2558 },
  "Ponte Vecchio, Florencia, Italia": { lat: 43.7679, lng: 11.253 },
  "Piazza de' Pitti, 1, Florencia, Italia": { lat: 43.7651, lng: 11.25 },
  "Piazzale Michelangelo, Florencia, Italia": { lat: 43.7629, lng: 11.265 },
  "Florencia, Italia": { lat: 43.7731, lng: 11.256 },
  "Cerca del Duomo, Florencia, Italia": { lat: 43.7731, lng: 11.256 },
  "Caffè Scudieri, Piazza del Duomo, Florencia, Italia": { lat: 43.7731, lng: 11.256 },
  "I' Girone De' Ghiotti o Trattoria Cibrèo, Florencia, Italia": { lat: 43.7687, lng: 11.2558 },
  "Gelateria dei Neri o Vivoli, Florencia, Italia": { lat: 43.7687, lng: 11.2558 },
  "Barrio Oltrarno, Florencia, Italia": { lat: 43.7651, lng: 11.25 },
  "Trattoria Mario o La Giostra, Florencia, Italia": { lat: 43.7731, lng: 11.256 },
  "Hotel Florencia, Italia": { lat: 43.7731, lng: 11.256 },
  "Santa Maria Novella, Florencia, Italia": { lat: 43.7766, lng: 11.2487 },

  // Pisa
  "Estación Pisa Centrale, Italia": { lat: 43.7078, lng: 10.3975 },
  "Piazza dei Miracoli, Pisa, Italia": { lat: 43.723, lng: 10.3966 },
  "Cerca de Piazza dei Miracoli, Pisa, Italia": { lat: 43.723, lng: 10.3966 },
  "Pisa Centrale, Italia": { lat: 43.7078, lng: 10.3975 },

  // Roma
  "Piazza del Colosseo, 1, Roma, Italia": { lat: 41.8902, lng: 12.4922 },
  "Piazza di Trevi, Roma, Italia": { lat: 41.9009, lng: 12.4833 },
  "Piazza della Rotonda, Roma, Italia": { lat: 41.8986, lng: 12.4768 },
  "Piazza di Spagna, Roma, Italia": { lat: 41.9058, lng: 12.4823 },
  "Via del Corso, Roma, Italia": { lat: 41.9028, lng: 12.48 },
  "Trastevere, Roma, Italia": { lat: 41.8893, lng: 12.4689 },
  "Viale Vaticano, Roma, Italia": { lat: 41.9064, lng: 12.4534 },
  "Piazza San Pietro, Ciudad del Vaticano": { lat: 41.9022, lng: 12.4539 },
  "Lungotevere Castello, 50, Roma, Italia": { lat: 41.9031, lng: 12.4663 },
  "Piazzale Scipione Borghese, 5, Roma, Italia": { lat: 41.9142, lng: 12.4922 },
  "Villa Borghese, Roma, Italia": { lat: 41.9142, lng: 12.4922 },
  "Viale delle Terme di Caracalla, 52, Roma, Italia": { lat: 41.8794, lng: 12.4926 },
  "Roma, Italia": { lat: 41.9028, lng: 12.4964 },
  "Estación Termini, Roma, Italia": { lat: 41.901, lng: 12.5026 },
  "Bar cerca del hotel, Roma, Italia": { lat: 41.9028, lng: 12.4964 },
  "Barrio Monti, Roma, Italia": { lat: 41.8947, lng: 12.4939 },
  "Gelateria Giolitti o Frigidarium, Roma, Italia": { lat: 41.9009, lng: 12.4833 },
  "Lungotevere, Roma, Italia": { lat: 41.9031, lng: 12.4663 },
  "Borgo Pio, Roma, Italia": { lat: 41.9022, lng: 12.4539 },
  "Monti, Roma, Italia": { lat: 41.8947, lng: 12.4939 },
  "Hotel Roma, Italia": { lat: 41.9028, lng: 12.4964 },
  "Aeropuerto Fiumicino, Roma, Italia": { lat: 41.8003, lng: 12.2389 },

  // Nápoles y Costa Amalfitana
  "Spaccanapoli, Nápoles, Italia": { lat: 40.8518, lng: 14.2681 },
  "Nápoles, Italia": { lat: 40.8518, lng: 14.2681 },
  "Via Eldorado, 3, Nápoles, Italia": { lat: 40.8279, lng: 14.2464 },
  "Circumvesuviana, Nápoles, Italia": { lat: 40.8518, lng: 14.2681 },
  "Sorrento, Italia": { lat: 40.6263, lng: 14.3757 },
  "Positano, Italia": { lat: 40.628, lng: 14.485 },
  "Amalfi, Italia": { lat: 40.634, lng: 14.6027 },
  "Ravello, Italia": { lat: 40.6486, lng: 14.6122 },
  "Bus desde Amalfi, Italia": { lat: 40.634, lng: 14.6027 },
  "Puerto de Sorrento, Italia": { lat: 40.6263, lng: 14.3757 },
  "Capri, Italia": { lat: 40.5508, lng: 14.2417 },
  "Anacapri, Capri, Italia": { lat: 40.5536, lng: 14.2089 },
  "Hidroala desde Capri, Italia": { lat: 40.5508, lng: 14.2417 },
  "Tren desde Sorrento, Italia": { lat: 40.6263, lng: 14.3757 },

  // Aeropuertos
  "Aeropuerto de Carrasco, Montevideo": { lat: -34.8384, lng: -56.0308 },
  "Aeropuerto Madrid-Barajas, España": { lat: 40.4719, lng: -3.5626 },
}

// Función para calcular distancia usando fórmula de Haversine
function calculateRealDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Función para obtener coordenadas de una ubicación
function getCoordinates(location: string): { lat: number; lng: number } | null {
  // Buscar coincidencia exacta
  if (locationCoordinates[location]) {
    return locationCoordinates[location]
  }

  // Buscar coincidencia parcial
  for (const key in locationCoordinates) {
    if (location.includes(key) || key.includes(location)) {
      return locationCoordinates[key]
    }
  }

  return null
}

// Función para calcular distancia entre dos eventos
function calculateDistance(fromLocation: string, toLocation: string): number {
  const fromCoords = getCoordinates(fromLocation)
  const toCoords = getCoordinates(toLocation)

  if (fromCoords && toCoords) {
    return calculateRealDistance(fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng)
  }

  // Si no encontramos coordenadas, usar distancia por defecto
  return 2.0
}

// Función para determinar el mejor transporte
function getBestTransport(distance: number, city: string) {
  if (distance < 1) {
    return {
      mode: "Caminando",
      icon: "🚶",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      time: `${Math.round(distance * 12)} min`,
      reason: "Distancia corta",
    }
  } else if (distance >= 1 && distance <= 3) {
    const hasBikeStations = ["París", "Barcelona", "Madrid", "Milán"].includes(city)
    if (hasBikeStations) {
      return {
        mode: "Bicicleta",
        icon: "🚴",
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        time: `${Math.round(distance * 4)} min`,
        reason: "Distancia ideal para bici",
      }
    }
  } else if (distance >= 3 && distance <= 20) {
    const coastalCities = ["Sorrento", "Positano", "Amalfi", "Ravello", "Capri", "Nápoles"]
    const isCoastal = coastalCities.some((coastal) => city.includes(coastal))

    if (isCoastal) {
      return {
        mode: "Moto/Scooter",
        icon: "🛵",
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
        time: `${Math.round(distance * 2.5)} min`,
        reason: "Ideal para carreteras costeras",
      }
    }
  }

  // Para distancias largas o sin bicicletas disponibles
  const metroSystems: { [key: string]: string } = {
    París: "Metro",
    Barcelona: "Metro",
    Madrid: "Metro",
    Roma: "Metro",
    Milán: "Metro",
    Ámsterdam: "Tram",
    Venecia: "Vaporetto",
    Zúrich: "Tren",
    Chur: "Tren",
    Nápoles: "Autobús",
    Sorrento: "Autobús",
    Positano: "Autobús",
    Amalfi: "Autobús",
    Ravello: "Autobús",
  }

  return {
    mode: metroSystems[city] || "Transporte público",
    icon: "🚇",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    time: `${Math.round(distance * 3)} min`,
    reason: "Distancia larga",
  }
}

export function TransportSuggestion({ fromEvent, toEvent, city }: TransportSuggestionProps) {
  const distance = calculateDistance(fromEvent.location, toEvent.location)
  const transport = getBestTransport(distance, city)

  return (
    <div
      className={`flex items-center gap-3 py-3 px-4 rounded-lg ${transport.bgColor} border-l-4 ${transport.color.replace("text-", "border-")}`}
    >
      <div className="text-2xl">{transport.icon}</div>
      <div className="flex-1">
        <div className={`font-semibold ${transport.color}`}>{transport.mode}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          De <span className="font-medium">{fromEvent.location}</span> a{" "}
          <span className="font-medium">{toEvent.location}</span>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-sm font-semibold ${transport.color}`}>~{transport.time}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{distance.toFixed(1)} km</div>
      </div>
    </div>
  )
}
