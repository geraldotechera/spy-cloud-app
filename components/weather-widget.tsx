"use client"

import { useEffect, useState } from "react"

interface WeatherData {
  temperature: number
  weatherCode: number
  windSpeed: number
}

interface WeatherWidgetProps {
  city: string
  country: string
}

const cityCoordinates: Record<string, { lat: number; lon: number }> = {
  Madrid: { lat: 40.4168, lon: -3.7038 },
  Toledo: { lat: 39.8628, lon: -4.0273 },
  Barcelona: { lat: 41.3851, lon: 2.1734 },
  París: { lat: 48.8566, lon: 2.3522 },
  Versalles: { lat: 48.8049, lon: 2.1204 },
  Amsterdam: { lat: 52.3676, lon: 4.9041 },
  Zúrich: { lat: 47.3769, lon: 8.5417 },
  Milán: { lat: 45.4642, lon: 9.19 },
  Florencia: { lat: 43.7696, lon: 11.2558 },
  Pisa: { lat: 43.7228, lon: 10.4017 },
  Roma: { lat: 41.9028, lon: 12.4964 },
  Nápoles: { lat: 40.8518, lon: 14.2681 },
}

const getWeatherIcon = (code: number) => {
  if (code === 0) return "☀️"
  if (code <= 3) return "⛅"
  if (code <= 48) return "☁️"
  if (code <= 67) return "🌧️"
  if (code <= 77) return "🌨️"
  if (code <= 82) return "🌦️"
  if (code <= 86) return "❄️"
  return "⛈️"
}

const getWeatherDescription = (code: number) => {
  if (code === 0) return "Despejado"
  if (code <= 3) return "Parcialmente nublado"
  if (code <= 48) return "Nublado"
  if (code <= 67) return "Lluvia"
  if (code <= 77) return "Nieve"
  if (code <= 82) return "Chubascos"
  if (code <= 86) return "Nevadas"
  return "Tormenta"
}

export function WeatherWidget({ city, country }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const coords = cityCoordinates[city]
    if (!coords) {
      setLoading(false)
      return
    }

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`,
    )
      .then((res) => res.json())
      .then((data) => {
        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          weatherCode: data.current.weather_code,
          windSpeed: Math.round(data.current.wind_speed_10m),
        })
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [city])

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{city}</h3>
            <p className="text-sm text-white/70">{country}</p>
          </div>
          <div className="text-3xl animate-pulse">⏳</div>
        </div>
      </div>
    )
  }

  if (!weather) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{city}</h3>
          <p className="text-sm text-white/70">{country}</p>
          <p className="text-xs text-white/60 mt-1">{getWeatherDescription(weather.weatherCode)}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="text-4xl">{getWeatherIcon(weather.weatherCode)}</span>
            <span className="text-3xl font-bold">{weather.temperature}°</span>
          </div>
          <p className="text-xs text-white/60 mt-1">💨 {weather.windSpeed} km/h</p>
        </div>
      </div>
    </div>
  )
}
