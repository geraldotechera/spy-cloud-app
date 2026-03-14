"use client"

import { useState } from "react"
import {
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CreditCard,
  Building2,
  ShieldAlert,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react"

interface EmergencySectionProps {
  onBack: () => void
}

interface CityEmergency {
  city: string
  country: string
  flag: string
  localEmergency: string
  police: string
  ambulance: string
  fire: string
  uruguayEmbassy: {
    name: string
    address: string
    phone: string
    emergency: string
    hours: string
  }
  tips: string[]
}

const cities: CityEmergency[] = [
  {
    city: "Madrid",
    country: "España",
    flag: "🇪🇸",
    localEmergency: "112",
    police: "091",
    ambulance: "112",
    fire: "080",
    uruguayEmbassy: {
      name: "Embajada del Uruguay en España",
      address: "Paseo del Pintor Rosales 32, 28008 Madrid",
      phone: "+34 917 580 166",
      emergency: "+34 917 580 166",
      hours: "Lun–Vie 9:00–14:00",
    },
    tips: ["Ante robo: denunciar en comisaría más cercana o llamar al 091", "Guardar número de denuncia para seguro"],
  },
  {
    city: "Barcelona",
    country: "España",
    flag: "🇪🇸",
    localEmergency: "112",
    police: "091",
    ambulance: "112",
    fire: "080",
    uruguayEmbassy: {
      name: "Consulado de Uruguay en Barcelona",
      address: "Diagonal 612, piso 6, 08021 Barcelona",
      phone: "+34 934 141 413",
      emergency: "+34 934 141 413",
      hours: "Lun–Vie 9:00–14:00",
    },
    tips: ["Zona turística: ojo con carteristas en La Rambla y Metro", "Ante robo: llamar al 091 o ir a comisaría"],
  },
  {
    city: "París",
    country: "Francia",
    flag: "🇫🇷",
    localEmergency: "112",
    police: "17",
    ambulance: "15",
    fire: "18",
    uruguayEmbassy: {
      name: "Embajada del Uruguay en Francia",
      address: "15 Rue Le Sueur, 75116 París",
      phone: "+33 1 45 00 81 37",
      emergency: "+33 1 45 00 81 37",
      hours: "Lun–Vie 9:00–13:00",
    },
    tips: ["Ante robo: llamar al 17 o dirigirse a comisaría local", "Guardar pasaportes en caja fuerte del hotel"],
  },
  {
    city: "Zúrich",
    country: "Suiza",
    flag: "🇨🇭",
    localEmergency: "112",
    police: "117",
    ambulance: "144",
    fire: "118",
    uruguayEmbassy: {
      name: "Embajada del Uruguay en Suiza",
      address: "Schwarztorstrasse 26, 3007 Berna",
      phone: "+41 31 382 31 31",
      emergency: "+41 31 382 31 31",
      hours: "Lun–Vie 9:00–13:00",
    },
    tips: ["Suiza es muy segura pero ante cualquier incidente: llamar 117", "Ciudad muy cara: cuidar billetera y documentos"],
  },
  {
    city: "Milán",
    country: "Italia",
    flag: "🇮🇹",
    localEmergency: "112",
    police: "113",
    ambulance: "118",
    fire: "115",
    uruguayEmbassy: {
      name: "Embajada del Uruguay en Italia",
      address: "Via Vittorio Veneto 183, 00187 Roma",
      phone: "+39 06 482 5422",
      emergency: "+39 06 482 5422",
      hours: "Lun–Vie 9:00–13:00",
    },
    tips: ["Atención en zona Stazione Centrale con carteristas", "Ante robo: llamar al 113 y guardar número de denuncia"],
  },
  {
    city: "Florencia",
    country: "Italia",
    flag: "🇮🇹",
    localEmergency: "112",
    police: "113",
    ambulance: "118",
    fire: "115",
    uruguayEmbassy: {
      name: "Embajada del Uruguay en Italia",
      address: "Via Vittorio Veneto 183, 00187 Roma",
      phone: "+39 06 482 5422",
      emergency: "+39 06 482 5422",
      hours: "Lun–Vie 9:00–13:00",
    },
    tips: ["Ciudad muy turística: cuidado con carteristas en zonas de museos", "Ante emergencia médica: llamar al 118"],
  },
  {
    city: "Roma",
    country: "Italia",
    flag: "🇮🇹",
    localEmergency: "112",
    police: "113",
    ambulance: "118",
    fire: "115",
    uruguayEmbassy: {
      name: "Embajada del Uruguay en Italia",
      address: "Via Vittorio Veneto 183, 00187 Roma",
      phone: "+39 06 482 5422",
      emergency: "+39 06 482 5422",
      hours: "Lun–Vie 9:00–13:00",
    },
    tips: ["Cuidado en el Metro y zonas del Coliseo con carteristas", "Ante accidente de tránsito: llamar 112 y pedir Carabinieri"],
  },
  {
    city: "Nápoles",
    country: "Italia",
    flag: "🇮🇹",
    localEmergency: "112",
    police: "113",
    ambulance: "118",
    fire: "115",
    uruguayEmbassy: {
      name: "Embajada del Uruguay en Italia",
      address: "Via Vittorio Veneto 183, 00187 Roma",
      phone: "+39 06 482 5422",
      emergency: "+39 06 482 5422",
      hours: "Lun–Vie 9:00–13:00",
    },
    tips: ["Ciudad de alto riesgo de robo: no mostrar cámara/celular en calle", "Ante robo en scooter: alertar al 113 de inmediato"],
  },
]

const cards = [
  {
    name: "Visa (Internacional)",
    phone: "+1 303 967 1096",
    local: "Llama a cobro revertido",
    color: "from-blue-600 to-blue-800",
    icon: "💳",
  },
  {
    name: "Mastercard (Internacional)",
    phone: "+1 636 722 7111",
    local: "Llama a cobro revertido",
    color: "from-red-600 to-orange-600",
    icon: "💳",
  },
  {
    name: "Banco Itaú Uruguay",
    phone: "+598 2 916 0000",
    local: "Desde el exterior: +598 2 916 0000",
    color: "from-orange-500 to-orange-700",
    icon: "🏦",
  },
  {
    name: "Santander Uruguay",
    phone: "+598 2 1747",
    local: "Desde el exterior: +598 2 915 7400",
    color: "from-red-500 to-red-700",
    icon: "🏦",
  },
  {
    name: "OCA (Uruguay)",
    phone: "+598 2 908 0808",
    local: "Desde el exterior: +598 2 908 0808",
    color: "from-green-600 to-green-800",
    icon: "💳",
  },
  {
    name: "BROU (Banco República)",
    phone: "+598 2 1896",
    local: "Desde el exterior: +598 2 1896",
    color: "from-blue-700 to-blue-900",
    icon: "🏦",
  },
  {
    name: "BBVA Uruguay",
    phone: "+598 2 1500",
    local: "Desde el exterior: +598 2 900 5400",
    color: "from-sky-500 to-blue-700",
    icon: "🏦",
  },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="ml-1 p-1 rounded-md bg-white/20 hover:bg-white/30 transition-colors"
      title="Copiar número"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </button>
  )
}

export function EmergencySection({ onBack }: EmergencySectionProps) {
  const [expandedCity, setExpandedCity] = useState<string | null>("Madrid")
  const [activeTab, setActiveTab] = useState<"ciudades" | "tarjetas">("ciudades")

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-red-600/90 backdrop-blur-md rounded-xl p-4 border border-red-400/50 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <div className="flex items-center gap-2 flex-1 justify-center">
            <ShieldAlert className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Emergencias</h2>
          </div>
          <div className="w-16" />
        </div>
        <p className="text-center text-red-100 text-xs mt-2">
          Información de emergencias por ciudad · Embajada Uruguay · Tarjetas
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("ciudades")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg border ${
            activeTab === "ciudades"
              ? "bg-red-600 text-white border-red-500"
              : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" />
            Ciudades
          </div>
        </button>
        <button
          onClick={() => setActiveTab("tarjetas")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg border ${
            activeTab === "tarjetas"
              ? "bg-red-600 text-white border-red-500"
              : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <CreditCard className="w-4 h-4" />
            Tarjetas
          </div>
        </button>
      </div>

      {/* Ciudades tab */}
      {activeTab === "ciudades" && (
        <div className="space-y-3">
          <div className="bg-amber-500/20 border border-amber-400/40 rounded-xl px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
            <p className="text-amber-100 text-xs leading-relaxed">
              <strong>Ante cualquier emergencia</strong> en Europa: marcar <strong>112</strong> (funciona en todos los países de la UE y Suiza). Se puede llamar sin crédito y desde cualquier operadora.
            </p>
          </div>

          {cities.map((city) => {
            const isExpanded = expandedCity === city.city
            return (
              <div
                key={city.city}
                className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden shadow-lg"
              >
                <button
                  onClick={() => setExpandedCity(isExpanded ? null : city.city)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{city.flag}</span>
                    <div>
                      <p className="font-bold text-white text-sm">{city.city}</p>
                      <p className="text-white/60 text-xs">{city.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
                      {city.localEmergency}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-white/60" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/60" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
                    {/* Números de emergencia */}
                    <div>
                      <p className="text-xs font-bold text-white/60 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Números de Emergencia
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-red-600/40 border border-red-400/30 rounded-lg p-2 text-center">
                          <p className="text-red-200 text-xs">Emergencias</p>
                          <div className="flex items-center justify-center gap-1">
                            <a href={`tel:${city.localEmergency}`} className="text-white font-bold text-lg">
                              {city.localEmergency}
                            </a>
                            <CopyButton text={city.localEmergency} />
                          </div>
                        </div>
                        <div className="bg-blue-600/30 border border-blue-400/30 rounded-lg p-2 text-center">
                          <p className="text-blue-200 text-xs">Policía</p>
                          <div className="flex items-center justify-center gap-1">
                            <a href={`tel:${city.police}`} className="text-white font-bold text-lg">
                              {city.police}
                            </a>
                            <CopyButton text={city.police} />
                          </div>
                        </div>
                        <div className="bg-green-600/30 border border-green-400/30 rounded-lg p-2 text-center">
                          <p className="text-green-200 text-xs">Ambulancia</p>
                          <div className="flex items-center justify-center gap-1">
                            <a href={`tel:${city.ambulance}`} className="text-white font-bold text-lg">
                              {city.ambulance}
                            </a>
                            <CopyButton text={city.ambulance} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Embajada Uruguay */}
                    <div className="bg-sky-500/10 border border-sky-400/30 rounded-xl p-3 space-y-2">
                      <p className="text-xs font-bold text-sky-200 uppercase tracking-wide flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> Embajada / Consulado Uruguay
                      </p>
                      <p className="text-white font-semibold text-sm">{city.uruguayEmbassy.name}</p>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-sky-300 flex-shrink-0 mt-0.5" />
                        <p className="text-white/80 text-xs">{city.uruguayEmbassy.address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-sky-300 flex-shrink-0" />
                        <a
                          href={`tel:${city.uruguayEmbassy.phone.replace(/\s/g, "")}`}
                          className="text-sky-200 text-sm font-bold hover:text-white transition-colors underline underline-offset-2"
                        >
                          {city.uruguayEmbassy.phone}
                        </a>
                        <CopyButton text={city.uruguayEmbassy.phone} />
                      </div>
                      <p className="text-white/50 text-xs">{city.uruguayEmbassy.hours}</p>
                      <div className="bg-white/10 rounded-lg px-3 py-2 mt-1">
                        <p className="text-white/70 text-xs">
                          <strong className="text-white">Urgencia fuera de horario:</strong> Llamar al número de la embajada — en casos de robo de pasaporte, accidente grave o detención, el sistema tiene guardia 24h.
                        </p>
                      </div>
                    </div>

                    {/* Tips */}
                    <div>
                      <p className="text-xs font-bold text-white/60 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Consejos para {city.city}
                      </p>
                      <ul className="space-y-1">
                        {city.tips.map((tip, i) => (
                          <li key={i} className="text-white/75 text-xs flex items-start gap-2">
                            <span className="text-amber-300 mt-0.5">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Tarjetas tab */}
      {activeTab === "tarjetas" && (
        <div className="space-y-3">
          <div className="bg-amber-500/20 border border-amber-400/40 rounded-xl px-4 py-3 flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
            <p className="text-amber-100 text-xs leading-relaxed">
              <strong>Ante pérdida o robo de tarjeta:</strong> llamar de inmediato para bloquearla. Las llamadas a cobro revertido no tienen costo. Tener siempre una fotocopia del número de tarjeta guardada separada.
            </p>
          </div>

          {cards.map((card) => (
            <div
              key={card.name}
              className={`bg-gradient-to-r ${card.color} rounded-xl p-4 border border-white/20 shadow-lg`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{card.name}</p>
                  <p className="text-white/70 text-xs mt-0.5">{card.local}</p>
                </div>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <div className="mt-3 bg-black/20 rounded-lg px-3 py-2 flex items-center justify-between">
                <a
                  href={`tel:${card.phone.replace(/\s/g, "")}`}
                  className="text-white font-bold text-base tracking-wide hover:text-white/80 transition-colors"
                >
                  {card.phone}
                </a>
                <CopyButton text={card.phone} />
              </div>
            </div>
          ))}

          <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-center space-y-1">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">Recuerda</p>
            <p className="text-white/80 text-xs leading-relaxed">
              Guarda una foto de tus tarjetas (frente y dorso) en un lugar seguro, separado de las tarjetas físicas. También anota los números de teléfono en papel por si te quedas sin batería.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
