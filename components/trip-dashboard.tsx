"use client"

import { Calendar, MapPin, Euro, ImageIcon, Home, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface TripDashboardProps {
  startDate: string
  endDate: string
  totalBudget: number
  photosCount: number
  accommodationsCount: number
  couplesCount: number
}

export function TripDashboard({
  startDate,
  endDate,
  totalBudget,
  photosCount,
  accommodationsCount,
  couplesCount,
}: TripDashboardProps) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const today = new Date()

  // Calcular días restantes
  const daysUntilTrip = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const tripDuration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

  // Ciudades del viaje
  const cities = ["Madrid", "Barcelona", "París", "Zúrich", "Milán", "Florencia", "Roma", "Nápoles"]

  const stats = [
    {
      icon: Calendar,
      label: daysUntilTrip > 0 ? "Días restantes" : "Días transcurridos",
      value: Math.abs(daysUntilTrip),
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Calendar,
      label: "Duración del viaje",
      value: `${tripDuration} días`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: MapPin,
      label: "Ciudades",
      value: cities.length,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Euro,
      label: "Presupuesto total",
      value: `€${totalBudget.toLocaleString()}`,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      icon: ImageIcon,
      label: "Fotos subidas",
      value: photosCount,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      icon: Home,
      label: "Alojamientos",
      value: accommodationsCount,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-balance">Europa Mágica 2026</h2>
          <p className="text-sm text-muted-foreground">
            {start.toLocaleDateString("es-ES", { day: "numeric", month: "long" })} -{" "}
            {end.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{couplesCount} parejas</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-2 rounded-lg`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {daysUntilTrip > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-balance">
                  {daysUntilTrip === 1
                    ? "¡Mañana comienza la aventura!"
                    : `Faltan ${daysUntilTrip} días para la aventura`}
                </p>
                <p className="text-sm text-muted-foreground">{cities.join(" → ")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
