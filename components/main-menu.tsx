"use client"

import type { User } from "@/types"
import { Calendar, Ticket, DollarSign, Camera, Home, Wallet, Bike, Globe, RefreshCw, Printer, Train } from "lucide-react"

interface MainMenuProps {
  currentUser: User
  onSelectSection: (
    section: "agenda" | "tickets" | "alojamiento" | "presupuesto" | "conversion" | "fotos" | "bicicletas" | "web" | "metro",
  ) => void
  onRefresh: () => void
  onPrintItinerary?: () => void
}

export function MainMenu({ currentUser, onSelectSection, onRefresh, onPrintItinerary }: MainMenuProps) {
  const menuItems = [
    { id: "agenda" as const, icon: Calendar, title: "Agenda", color: "from-blue-500 to-blue-600" },
    { id: "alojamiento" as const, icon: Home, title: "Alojamiento", color: "from-green-500 to-green-600" },
    { id: "metro" as const, icon: Train, title: "Metro Madrid", color: "from-blue-600 to-blue-800" },
    { id: "tickets" as const, icon: Ticket, title: "Tickets", color: "from-purple-500 to-purple-600" },
    { id: "presupuesto" as const, icon: Wallet, title: "Presupuesto", color: "from-yellow-500 to-yellow-600" },
    { id: "conversion" as const, icon: DollarSign, title: "Conversión", color: "from-emerald-500 to-emerald-600" },
    { id: "fotos" as const, icon: Camera, title: "Fotos", color: "from-pink-500 to-pink-600" },
    { id: "bicicletas" as const, icon: Bike, title: "Bicicletas", color: "from-orange-500 to-orange-600" },
    { id: "web" as const, icon: Globe, title: "Enlaces", color: "from-cyan-500 to-cyan-600" },
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`bg-gradient-to-br ${item.color} backdrop-blur-md rounded-xl p-3 text-center hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl border border-white/20`}
            >
              <Icon className="w-6 h-6 mx-auto mb-1" />
              <h2 className="text-xs font-bold">{item.title}</h2>
            </button>
          )
        })}
      </div>

      {onPrintItinerary && (
        <button
          onClick={onPrintItinerary}
          className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 backdrop-blur-md rounded-xl py-3 px-4 text-center transition-all duration-200 shadow-lg hover:shadow-xl border border-white/20 flex items-center justify-center gap-2"
          title="Imprimir itinerario completo (PDF)"
        >
          <Printer className="w-5 h-5" />
          <span className="text-sm font-bold">Imprimir Itinerario</span>
        </button>
      )}

      <button
        onClick={onRefresh}
        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 backdrop-blur-md rounded-xl py-3 px-4 text-center transition-all duration-200 shadow-lg hover:shadow-xl border border-white/20 flex items-center justify-center gap-2"
        title="Actualizar app y limpiar caché"
      >
        <RefreshCw className="w-5 h-5" />
        <span className="text-sm font-bold">Actualizar</span>
      </button>
    </div>
  )
}
