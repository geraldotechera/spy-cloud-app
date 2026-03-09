"use client"

import { useState } from "react"
import type { Event, Accommodation, User } from "@/types"
import { EventModal } from "./event-modal"
import { TransportModal } from "./transport-modal"
import { WeatherWidget } from "./weather-widget"
import { DailyMap } from "./daily-map"
import { BikeRecommendation } from "./bike-recommendation"
import { TransportSuggestion } from "./transport-suggestion"

interface DailyItineraryProps {
  selectedDate: string
  events: Event[]
  accommodations: Accommodation[]
  currentUser: User
  onUpdateEvents: (events: Event[]) => void
}

export function DailyItinerary({
  selectedDate,
  events,
  accommodations,
  currentUser,
  onUpdateEvents,
}: DailyItineraryProps) {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isTransportModalOpen, setIsTransportModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null)
  const [transportInfo, setTransportInfo] = useState<{
    from: string
    to: string
    title: string
    isFirstEvent: boolean
    isLastEvent: boolean
  } | null>(null)

  const getCityFromEvents = () => {
    if (events.length === 0) return null

    const cityMatchers: { test: (loc: string) => boolean; result: { name: string; country: string } }[] = [
      { test: (l) => l.includes("Madrid") || l.includes("Barquillo"), result: { name: "Madrid", country: "España" } },
      { test: (l) => l.includes("Barcelona"), result: { name: "Barcelona", country: "España" } },
      { test: (l) => l.includes("Bruselas") || l.includes("Bruxelles"), result: { name: "Bruselas", country: "Bélgica" } },
      { test: (l) => l.includes("Ámsterdam") || l.includes("Amsterdam"), result: { name: "Ámsterdam", country: "Países Bajos" } },
      { test: (l) => l.includes("Versalles"), result: { name: "Versalles", country: "Francia" } },
      { test: (l) => l.includes("París") || l.includes("Paris"), result: { name: "París", country: "Francia" } },
      { test: (l) => l.includes("Zúrich") || l.includes("Zurich") || l.includes("Chur"), result: { name: "Zúrich", country: "Suiza" } },
      { test: (l) => l.includes("Venecia") || l.includes("Venice") || l.includes("Venezia"), result: { name: "Venecia", country: "Italia" } },
      { test: (l) => l.includes("Milán") || l.includes("Milan"), result: { name: "Milán", country: "Italia" } },
      { test: (l) => l.includes("Florencia") || l.includes("Florence"), result: { name: "Florencia", country: "Italia" } },
      { test: (l) => l.includes("Pisa"), result: { name: "Pisa", country: "Italia" } },
      { test: (l) => l.includes("Nápoles") || l.includes("Naples") || l.includes("Napoli"), result: { name: "Nápoles", country: "Italia" } },
      { test: (l) => l.includes("Vico Equense") || l.includes("Girolamo Giusso"), result: { name: "Vico Equense", country: "Italia" } },
      { test: (l) => l.includes("Sorrento"), result: { name: "Sorrento / Vico Equense", country: "Italia" } },
      { test: (l) => l.includes("Positano"), result: { name: "Positano", country: "Italia" } },
      { test: (l) => l.includes("Amalfi"), result: { name: "Amalfi", country: "Italia" } },
      { test: (l) => l.includes("Ravello"), result: { name: "Ravello", country: "Italia" } },
      { test: (l) => l.includes("Capri") || l.includes("Anacapri"), result: { name: "Capri", country: "Italia" } },
      { test: (l) => l.includes("Roma") || l.includes("Rome"), result: { name: "Roma", country: "Italia" } },
    ]

    // Count how many events belong to each city
    const cityCount = new Map<string, { count: number; result: { name: string; country: string } }>()

    for (const event of events) {
      for (const matcher of cityMatchers) {
        if (matcher.test(event.location)) {
          const key = matcher.result.name
          const prev = cityCount.get(key)
          cityCount.set(key, { count: (prev?.count ?? 0) + 1, result: matcher.result })
          break
        }
      }
    }

    if (cityCount.size === 0) return null

    // Return the city with the most events
    let best: { count: number; result: { name: string; country: string } } | null = null
    for (const entry of cityCount.values()) {
      if (!best || entry.count > best.count) best = entry
    }

    return best?.result ?? null
  }

  const city = getCityFromEvents()

  const handleEdit = (event: Event) => {
    if (currentUser.role !== "admin") {
      alert("Solo el administrador puede editar eventos de la agenda")
      return
    }
    setEditingEvent(event)
    setIsEventModalOpen(true)
  }

  const handleDelete = (eventId: number) => {
    if (currentUser.role !== "admin") {
      alert("Solo el administrador puede eliminar eventos de la agenda")
      return
    }
    if (confirm("¿Estás seguro de que quieres eliminar este evento?")) {
      onUpdateEvents(events.filter((e) => e.id !== eventId))
    }
  }

  const handleShowTransport = (from: string, to: string, title: string, index: number) => {
    const isFirstEvent = index === 0
    const isLastEvent = index === events.length - 1

    setTransportInfo({
      from,
      to,
      title,
      isFirstEvent,
      isLastEvent,
    })
    setIsTransportModalOpen(true)
  }

  const handleSaveEvent = (event: Event) => {
    if (currentUser.role !== "admin") {
      alert("Solo el administrador puede modificar la agenda")
      return
    }
    if (editingEvent) {
      onUpdateEvents(events.map((e) => (e.id === event.id ? event : e)))
    } else {
      const newEvent = {
        ...event,
        id: Math.max(0, ...events.map((e) => e.id)) + 1,
      }
      onUpdateEvents([...events, newEvent].sort((a, b) => a.time.localeCompare(b.time)))
    }
    setIsEventModalOpen(false)
    setEditingEvent(null)
  }

  const handleToggleExpand = (eventId: number) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId)
  }

  if (events.length === 0) {
    return (
      <>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
          <p className="text-white/70 mb-4">No hay eventos programados para este día</p>
          {currentUser.role === "admin" ? (
            <button
              onClick={() => {
                setEditingEvent(null)
                setIsEventModalOpen(true)
              }}
              className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg transition-colors w-full"
            >
              + Agregar Evento
            </button>
          ) : (
            <p className="text-white/50 text-sm">Solo el administrador puede agregar eventos</p>
          )}
        </div>
        <EventModal
          isOpen={isEventModalOpen}
          onClose={() => {
            setIsEventModalOpen(false)
            setEditingEvent(null)
          }}
          onSave={handleSaveEvent}
          event={editingEvent}
        />
      </>
    )
  }

  return (
    <>
      {expandedEventId !== null && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-6 z-50"
          onClick={() => setExpandedEventId(null)}
        >
          {(() => {
            const expandedEvent = events.find((e) => e.id === expandedEventId)
            if (!expandedEvent) return null

            return (
              <div
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-6">
                  {expandedEvent.imageUrl && (
                    <div className="w-full h-64 rounded-2xl overflow-hidden">
                      <img
                        src={expandedEvent.imageUrl || "/placeholder.svg"}
                        alt={expandedEvent.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <div className="text-4xl font-bold text-blue-400">{expandedEvent.time}</div>
                    <button
                      onClick={() => setExpandedEventId(null)}
                      className="text-4xl hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </div>

                  <h2 className="text-4xl font-bold leading-tight">{expandedEvent.title}</h2>

                  <div className="flex items-start gap-3">
                    <span className="text-3xl">📍</span>
                    <p className="text-2xl text-white/90 leading-relaxed">{expandedEvent.location}</p>
                  </div>

                  {expandedEvent.description && (
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">📝</span>
                      <p className="text-xl text-white/80 leading-relaxed">{expandedEvent.description}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <span className="text-3xl">💰</span>
                    {expandedEvent.ticketPrice > 0 ? (
                      <p className="text-2xl text-blue-400 font-semibold">
                        Entrada: €{expandedEvent.ticketPrice} por persona
                      </p>
                    ) : (
                      <p className="text-2xl text-green-400 font-semibold">Gratis</p>
                    )}
                  </div>

                  {expandedEvent.ticketUrl && (
                    <button
                      onClick={() => window.open(expandedEvent.ticketUrl, "_blank")}
                      className="w-full bg-green-500 hover:bg-green-600 px-8 py-4 rounded-xl text-2xl font-semibold transition-colors"
                    >
                      🎫 Comprar Ticket
                    </button>
                  )}

                  <p className="text-center text-white/50 text-lg mt-6">Toca fuera para cerrar</p>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      <div className="space-y-4">
        {city && <WeatherWidget city={city.name} country={city.country} />}

        {city && events.length > 0 && <BikeRecommendation events={events} city={city.name} />}

        {city && events.length > 0 && <DailyMap events={events} city={city.name} />}

        <div className="space-y-3">
          {events.map((event, index) => {
            const currentDayAccommodation = accommodations.find((acc) => {
              if (!acc.dates) return false

              try {
                const accDate = new Date(acc.dates.split(" - ")[0])
                const eventDate = new Date(selectedDate)
                return accDate <= eventDate
              } catch (error) {
                console.error("[v0] Error parsing accommodation dates:", error)
                return false
              }
            })

            const prevLocation =
              index > 0
                ? events[index - 1].location
                : currentDayAccommodation?.location || currentDayAccommodation?.city || "Alojamiento"

            const showTransportSuggestion = index > 0
            const fromEvent = index > 0 ? events[index - 1] : null

            return (
              <div key={event.id}>
                {showTransportSuggestion && fromEvent && city && (
                  <TransportSuggestion fromEvent={fromEvent} toEvent={event} city={city.name} />
                )}

                <div
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-4 cursor-pointer hover:bg-white/20 transition-all duration-200 border border-white/10 hover:border-white/30 hover:shadow-xl"
                  onClick={() => handleToggleExpand(event.id)}
                >
                  <div className="flex gap-3">
                    <div className="bg-blue-500/30 rounded-lg px-3 py-1 font-bold text-sm h-fit border border-blue-400/50">
                      {event.time}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-lg break-words mb-1">{event.title}</h4>
                      <div className="flex items-start gap-2 text-sm text-white/80 mb-1">
                        <span>📍</span>
                        <p className="break-words">{event.location}</p>
                      </div>
                      {event.description && (
                        <p className="text-xs text-white/60 mt-2 break-words line-clamp-2">{event.description}</p>
                      )}
                      <div className="mt-2">
                        {event.ticketPrice > 0 ? (
                          <span className="inline-flex items-center gap-1 bg-blue-500/30 px-3 py-1 rounded-full text-sm border border-blue-400/50">
                            💰 €{event.ticketPrice}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-green-500/30 px-3 py-1 rounded-full text-sm border border-green-400/50">
                            ✓ Gratis
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-white/40 text-xs mt-3 pt-2 border-t border-white/10">
                    👆 Toca para ampliar
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap" onClick={(e) => e.stopPropagation()}>
                    {currentUser.role === "admin" && (
                      <>
                        <button
                          onClick={() => handleEdit(event)}
                          className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="bg-red-500/30 hover:bg-red-500/50 px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          🗑️ Eliminar
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleShowTransport(prevLocation, event.location, event.title, index)}
                      className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      🗺️ Cómo llegar
                    </button>
                    {event.ticketUrl && (
                      <button
                        onClick={() => window.open(event.ticketUrl, "_blank")}
                        className="bg-green-500/30 hover:bg-green-500/50 px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        🎫 Comprar Ticket
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {currentUser.role === "admin" ? (
          <button
            onClick={() => {
              setEditingEvent(null)
              setIsEventModalOpen(true)
            }}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg transition-colors w-full"
          >
            + Agregar Evento
          </button>
        ) : (
          <p className="text-white/50 text-sm text-center">Solo el administrador puede modificar la agenda</p>
        )}
      </div>

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false)
          setEditingEvent(null)
        }}
        onSave={handleSaveEvent}
        event={editingEvent}
      />

      {transportInfo && (
        <TransportModal
          isOpen={isTransportModalOpen}
          onClose={() => setIsTransportModalOpen(false)}
          from={transportInfo.from}
          to={transportInfo.to}
          title={transportInfo.title}
          isFirstEvent={transportInfo.isFirstEvent}
          isLastEvent={transportInfo.isLastEvent}
          accommodations={accommodations}
        />
      )}
    </>
  )
}
