"use client"

import { useState } from "react"
import { Phone, X, AlertTriangle, Shield, Ambulance, Flame, MapPin } from "lucide-react"

interface EmergencyContact {
  label: string
  number: string
  flag: string
  country: string
}

interface EmergencyCategory {
  id: string
  title: string
  icon: React.ElementType
  color: string
  contacts: EmergencyContact[]
}

const emergencyCategories: EmergencyCategory[] = [
  {
    id: "police",
    title: "Policía",
    icon: Shield,
    color: "bg-blue-600",
    contacts: [
      { country: "España", flag: "🇪🇸", label: "Policía Nacional", number: "091" },
      { country: "España", flag: "🇪🇸", label: "Guardia Civil", number: "062" },
      { country: "Francia", flag: "🇫🇷", label: "Police Nationale", number: "17" },
      { country: "Suiza", flag: "🇨🇭", label: "Polizei / Police", number: "117" },
      { country: "Italia", flag: "🇮🇹", label: "Polizia", number: "113" },
      { country: "Italia", flag: "🇮🇹", label: "Carabinieri", number: "112" },
    ],
  },
  {
    id: "ambulance",
    title: "Ambulancia",
    icon: Ambulance,
    color: "bg-red-600",
    contacts: [
      { country: "España", flag: "🇪🇸", label: "Emergencias Médicas", number: "061" },
      { country: "Francia", flag: "🇫🇷", label: "SAMU Ambulance", number: "15" },
      { country: "Suiza", flag: "🇨🇭", label: "Ambulance", number: "144" },
      { country: "Italia", flag: "🇮🇹", label: "Emergenza Sanitaria", number: "118" },
    ],
  },
  {
    id: "fire",
    title: "Bomberos",
    icon: Flame,
    color: "bg-orange-600",
    contacts: [
      { country: "España", flag: "🇪🇸", label: "Bomberos", number: "080" },
      { country: "Francia", flag: "🇫🇷", label: "Pompiers", number: "18" },
      { country: "Suiza", flag: "🇨🇭", label: "Feuerwehr", number: "118" },
      { country: "Italia", flag: "🇮🇹", label: "Vigili del Fuoco", number: "115" },
    ],
  },
  {
    id: "universal",
    title: "Emergencia UE",
    icon: AlertTriangle,
    color: "bg-yellow-600",
    contacts: [
      { country: "Toda Europa", flag: "🇪🇺", label: "Número de emergencias europeo", number: "112" },
      { country: "España", flag: "🇪🇸", label: "Embajada Argentina en Madrid", number: "+34 91 542 2512" },
      { country: "Francia", flag: "🇫🇷", label: "Embajada Argentina en París", number: "+33 1 4453 9400" },
      { country: "Italia", flag: "🇮🇹", label: "Embajada Argentina en Roma", number: "+39 06 807 4741" },
      { country: "Suiza", flag: "🇨🇭", label: "Embajada Argentina en Berna", number: "+41 31 371 4040" },
    ],
  },
  {
    id: "consular",
    title: "Consulados AR",
    icon: MapPin,
    color: "bg-cyan-600",
    contacts: [
      { country: "Francia", flag: "🇫🇷", label: "Consulado AR en París", number: "+33 1 4453 9400" },
      { country: "Italia", flag: "🇮🇹", label: "Consulado AR en Milán", number: "+39 02 6698 0135" },
      { country: "Italia", flag: "🇮🇹", label: "Consulado AR en Nápoles", number: "+39 081 761 3067" },
    ],
  },
]

export function EmergencyButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>("universal")

  const activeData = emergencyCategories.find((c) => c.id === activeCategory)

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 border-2 border-white animate-pulse"
        title="Contactos de emergencia"
        aria-label="Abrir contactos de emergencia"
      >
        <Phone className="w-6 h-6" />
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
          <div className="bg-gray-900 border border-white/20 rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-red-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-white" />
                <div>
                  <h2 className="text-lg font-bold text-white">Emergencias</h2>
                  <p className="text-xs text-red-200">Europa Mágica 2026</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 p-3 bg-gray-800 overflow-x-auto flex-shrink-0 scrollbar-hide">
              {emergencyCategories.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                      activeCategory === cat.id
                        ? `${cat.color} text-white shadow-lg scale-105`
                        : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.title}
                  </button>
                )
              })}
            </div>

            {/* Contacts list */}
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {activeData?.contacts.map((contact, i) => (
                <a
                  key={i}
                  href={`tel:${contact.number.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-3 transition-colors border border-white/10 group"
                >
                  <span className="text-2xl flex-shrink-0">{contact.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/60 truncate">{contact.country}</p>
                    <p className="text-sm font-semibold text-white truncate">{contact.label}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-base font-bold text-green-400">{contact.number}</span>
                    <div className="w-7 h-7 rounded-full bg-green-600 group-hover:bg-green-500 flex items-center justify-center transition-colors">
                      <Phone className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Footer note */}
            <div className="px-4 py-3 bg-gray-800 border-t border-white/10 flex-shrink-0">
              <p className="text-center text-xs text-white/50">
                Toca cualquier número para llamar directamente
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
