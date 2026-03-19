"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Calendar } from "@/components/calendar"
import { DailyItinerary } from "@/components/daily-itinerary"
import { MainMenu } from "@/components/main-menu"
import { TicketsSection } from "@/components/tickets-section"
import { AccommodationSection } from "@/components/accommodation-section"
import { BudgetSection } from "@/components/budget-section"
import { CurrencyConverter } from "@/components/currency-converter"
import { BikesSection } from "@/components/bikes-section"
import { WebLinksSection } from "@/components/web-links-section"
import { MadridMetro } from "@/components/madrid-metro"
import { RouteMap } from "@/components/route-map"
import { SharedExpenses } from "@/components/shared-expenses"
import { UserSelector } from "@/components/user-selector"
import { UserSettings } from "@/components/user-settings"
import { PDFExportSimple } from "@/components/pdf-export-simple"
import { PrintItinerary } from "@/components/print-itinerary"
import { Moon, Sun } from "lucide-react"
import { CountryMapModal } from "@/components/country-map-modal"
import { EmergencyButton } from "@/components/emergency-button"
import type { AppData, User } from "@/types"
import { getInitialData } from "@/lib/events"

function validateAppData(data: any): data is AppData {
  try {
    return (
      data &&
      typeof data === "object" &&
      data.events &&
      typeof data.events === "object" &&
      Array.isArray(data.accommodations) &&
      Array.isArray(data.tickets) &&
      data.budget &&
      typeof data.budget === "object"
    )
  } catch {
    return false
  }
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [mounted, setMounted] = useState(false)

  const [currentSection, setCurrentSection] = useState<
    | "main"
    | "agenda"
    | "tickets"
    | "alojamiento"
    | "presupuesto"
    | "conversion"
    | "bicicletas"
    | "web"
    | "metro"
    | "configuracion"
    | "maparuta"
    | "gastos"
  >("main")
  const [selectedDate, setSelectedDate] = useState("2026-09-06")
  const [appData, setAppData] = useState<AppData | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [isDark, setIsDark] = useState(false)
  const [showPrintView, setShowPrintView] = useState(false)
  const [showCountryMap, setShowCountryMap] = useState<"spain" | "france" | "italy" | "switzerland" | null>(null)

  useEffect(() => {
    setMounted(true)
    const splashShown = sessionStorage.getItem("splashShown")
    if (splashShown === "true") {
      setShowSplash(false)
    }
  }, [])

  useEffect(() => {
    if (mounted && showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false)
        sessionStorage.setItem("splashShown", "true")
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [showSplash, mounted])

  const TRIP_ID = "europe-2026"
  const supabase = createClient()

  const dedupeExpenses = useCallback((data: AppData): AppData => {
    const seen = new Set<number>()
    const unique = data.budget.dailyExpenses.filter((e: { id: number }) => {
      if (seen.has(e.id)) return false
      seen.add(e.id)
      return true
    })
    return { ...data, budget: { ...data.budget, dailyExpenses: unique } }
  }, [])

  // Carga inicial: Supabase primero, localStorage como fallback offline
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedUser = localStorage.getItem("currentUser")
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser)
            if (parsedUser?.name) setCurrentUser(parsedUser)
          } catch { /* ignore */ }
        }
      } catch { /* ignore */ }

      try {
        // Intentar cargar desde Supabase
        const { data: row, error } = await supabase
          .from("trip_data")
          .select("data")
          .eq("id", TRIP_ID)
          .single()

        if (!error && row?.data && validateAppData(row.data)) {
          const clean = dedupeExpenses(row.data as AppData)
          setAppData(clean)
          // Actualizar localStorage como cache offline
          localStorage.setItem("europeTripData", JSON.stringify(clean))
          return
        }
      } catch { /* red offline, caer a localStorage */ }

      // Fallback: localStorage
      try {
        const saved = localStorage.getItem("europeTripData")
        if (saved) {
          const parsed = JSON.parse(saved)
          const clean = dedupeExpenses(validateAppData(parsed) ? parsed : getInitialData())
          setAppData(clean)
          return
        }
      } catch { /* ignore */ }

      // Ultimo recurso: datos iniciales
      setAppData(dedupeExpenses(getInitialData()))
    }

    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Guardado: Supabase + localStorage en paralelo, con debounce 1.5s
  useEffect(() => {
    if (!appData) return

    setSyncStatus("saving")
    const cleanData = dedupeExpenses(appData)

    // Guardar en localStorage (offline cache)
    try {
      localStorage.setItem("europeTripData", JSON.stringify(cleanData))
    } catch { /* quota exceeded */ }

    // Debounce: guardar en Supabase 1.5s después del último cambio
    const timer = setTimeout(() => {
      supabase
        .from("trip_data")
        .upsert({ id: TRIP_ID, data: cleanData, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) {
            setSyncStatus("error")
          } else {
            setSyncStatus("saved")
            setLastSaved(new Date())
            setTimeout(() => setSyncStatus("idle"), 3000)
          }
        })
    }, 1500)

    return () => clearTimeout(timer)
  }, [appData]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    const prefersDark =
      savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    setIsDark(prefersDark)
    if (prefersDark) {
      document.documentElement.classList.add("dark")
    }
  }, [mounted])

  const showNotif = (message: string) => {
    setNotificationMessage(message)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const handleRefresh = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister())
      })
    }

    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name))
      })
    }

    setTimeout(() => {
      window.location.href = window.location.href.split("?")[0] + "?t=" + Date.now()
    }, 100)
  }

  const handleUserSelect = (user: User) => {
    setCurrentUser(user)
    localStorage.setItem("currentUser", JSON.stringify(user))
    showNotif(`Bienvenido, ${user.name}!`)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem("currentUser")
    showNotif("Sesión cerrada")
  }

  const toggleDarkMode = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    if (newIsDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  // Evitar hydration mismatch: no renderizar nada diferente hasta que el cliente esté montado
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/50 text-sm">Cargando...</p>
      </div>
    )
  }

  if (showSplash) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
        <img src="/splash-screen.png" alt="Europa Mágica 2026" className="w-full h-full object-cover animate-fade-in" />
      </div>
    )
  }

  if (!appData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Cargando...</p>
      </div>
    )
  }

  if (showPrintView) {
    return <PrintItinerary appData={appData} onClose={() => setShowPrintView(false)} />
  }

  if (!currentUser) {
    return (
      <div
        className="min-h-screen text-white"
        style={{
          background:
            "linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.50)), url(https://upload.wikimedia.org/wikipedia/commons/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="container mx-auto px-4 py-4 max-w-4xl min-h-screen flex items-center justify-center">
          <UserSelector currentUser={currentUser} onSelectUser={handleUserSelect} />
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          "linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.50)), url(https://upload.wikimedia.org/wikipedia/commons/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {showCountryMap && <CountryMapModal country={showCountryMap} onClose={() => setShowCountryMap(null)} />}
      <EmergencyButton />

      {showNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-fade-in flex items-center gap-2 border border-green-400">
          <span className="text-xl">✓</span>
          <span className="font-semibold">{notificationMessage}</span>
        </div>
      )}

      {/* Indicador de sincronizacion Supabase */}
      <div className="fixed bottom-4 right-4 z-40">
        {syncStatus === "saving" && (
          <div className="bg-black/60 backdrop-blur-sm text-white/70 text-xs px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Guardando...
          </div>
        )}
        {syncStatus === "saved" && (
          <div className="bg-black/60 backdrop-blur-sm text-white/70 text-xs px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            Guardado{lastSaved ? ` ${lastSaved.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}` : ""}
          </div>
        )}
        {syncStatus === "error" && (
          <div className="bg-black/60 backdrop-blur-sm text-red-400 text-xs px-3 py-1.5 rounded-full border border-red-400/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Sin conexion — guardado local
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <header data-no-print className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 shadow-xl border border-white/20">
          <div className="flex items-center justify-between gap-3 mb-3">
            <UserSelector currentUser={currentUser} onSelectUser={handleUserSelect} onLogout={handleLogout} />
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl">✈️</span>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">Europa Mágica 2026</h1>
                <button
                  onClick={toggleDarkMode}
                  className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all duration-200 border border-white/30 flex items-center justify-center shadow-lg"
                  title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                >
                  {isDark ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                </button>
              </div>
              <p className="text-xs opacity-90 text-white/80">2 Parejas · 4 Viajeros · 22 Días</p>
            </div>
            <div className="w-24"></div>
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => setShowCountryMap("spain")}
              className="w-8 h-5 rounded-sm bg-gradient-to-b from-red-600 via-yellow-400 to-red-600 shadow-md hover:scale-110 transition-transform cursor-pointer"
              title="España - Ver mapa y rutas"
            />
            <button
              onClick={() => setShowCountryMap("france")}
              className="w-8 h-5 rounded-sm bg-gradient-to-r from-blue-600 via-white to-red-600 shadow-md hover:scale-110 transition-transform cursor-pointer"
              title="Francia - Ver mapa y rutas"
            />
            <button
              onClick={() => setShowCountryMap("italy")}
              className="w-8 h-5 rounded-sm bg-gradient-to-r from-green-600 via-white to-red-600 shadow-md hover:scale-110 transition-transform cursor-pointer"
              title="Italia - Ver mapa y rutas"
            />
            <button
              onClick={() => setShowCountryMap("switzerland")}
              className="w-8 h-5 rounded-sm bg-white relative shadow-md hover:scale-110 transition-transform cursor-pointer"
              title="Suiza - Ver mapa y rutas"
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-1 h-full bg-red-600" />
                <div className="w-full h-1 bg-red-600 absolute" />
              </div>
            </button>
          </div>
        </header>

        {currentSection !== "main" && (
          <div data-no-print className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 mb-4 flex items-center gap-2 text-sm border border-white/20">
            <button onClick={() => setCurrentSection("main")} className="hover:text-blue-300 transition-colors">
              Inicio
            </button>
            <span className="text-white/50">›</span>
            <span className="font-semibold capitalize">{currentSection}</span>
          </div>
        )}

        {currentSection === "main" && (
          <div className="space-y-4">
            <MainMenu
              currentUser={currentUser}
              onSelectSection={setCurrentSection}
              onRefresh={handleRefresh}
              onPrintItinerary={() => setShowPrintView(true)}
            />
          </div>
        )}

        {currentSection === "agenda" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <button
                onClick={() => setCurrentSection("main")}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors shadow-lg"
              >
                ← Volver
              </button>
              <h2 className="text-lg font-bold">
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                })}
              </h2>
              <div className="w-20"></div>
            </div>
            <PDFExportSimple appData={appData} section="agenda" />
            <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} events={appData.events} />
            <DailyItinerary
              selectedDate={selectedDate}
              events={appData.events[selectedDate] || []}
              accommodations={appData.accommodations}
              currentUser={currentUser}
              onUpdateEvents={(newEvents) => {
                setAppData({
                  ...appData,
                  events: { ...appData.events, [selectedDate]: newEvents },
                })
              }}
            />
          </div>
        )}

        {currentSection === "tickets" && (
          <div className="space-y-4">
            <TicketsSection
              tickets={appData.tickets}
              onBack={() => setCurrentSection("main")}
              onUpdateTickets={(newTickets) => {
                setAppData({ ...appData, tickets: newTickets })
              }}
            />
            <PDFExportSimple appData={appData} section="tickets" />
          </div>
        )}

        {currentSection === "alojamiento" && (
          <div className="space-y-4">
            <AccommodationSection
              accommodations={appData.accommodations}
              currentUser={currentUser}
              onBack={() => setCurrentSection("main")}
              onUpdateAccommodations={(newAccommodations) => {
                setAppData({ ...appData, accommodations: newAccommodations })
                showNotif("Alojamiento guardado")
              }}
            />
            <PDFExportSimple appData={appData} section="alojamiento" />
          </div>
        )}

        {currentSection === "presupuesto" && (
          <BudgetSection
            budget={appData.budget}
            currentUser={currentUser}
            onBack={() => setCurrentSection("main")}
            onUpdateBudget={(newBudget) => {
              setAppData({ ...appData, budget: newBudget })
              showNotif("Presupuesto actualizado")
            }}
          />
        )}

        {currentSection === "conversion" && <CurrencyConverter onBack={() => setCurrentSection("main")} />}

        {currentSection === "bicicletas" && <BikesSection onBack={() => setCurrentSection("main")} />}

        {currentSection === "web" && <WebLinksSection onBack={() => setCurrentSection("main")} />}

        {currentSection === "metro" && (
          <MadridMetro accommodations={appData.accommodations} onBack={() => setCurrentSection("main")} />
        )}

        {currentSection === "maparuta" && <RouteMap onBack={() => setCurrentSection("main")} />}

        {currentSection === "gastos" && <SharedExpenses onBack={() => setCurrentSection("main")} />}

        {currentSection === "configuracion" && currentUser.role === "admin" && (
          <UserSettings currentUser={currentUser} onBack={() => setCurrentSection("main")} />
        )}
      </div>
    </div>
  )
}
