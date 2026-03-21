"use client"

import { useEffect } from "react"
import type { AppData } from "@/types"

interface PrintItineraryProps {
  appData: AppData
  onClose: () => void
}

export function PrintItinerary({ appData, onClose }: PrintItineraryProps) {
  useEffect(() => {
    // Auto-abrir diálogo de impresión después de renderizar
    const timer = setTimeout(() => {
      window.print()
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Obtener todas las fechas ordenadas
  const sortedDates = Object.keys(appData.events).sort()

  return (
    <div className="print-container">
      {/* Botón para cerrar (solo visible en pantalla) */}
      <div className="no-print fixed top-4 right-4 z-50">
        <button
          onClick={onClose}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg font-semibold"
        >
          ✕ Cerrar Vista de Impresión
        </button>
      </div>

      {/* Cada día en una página separada */}
      {sortedDates.map((date, index) => {
        const events = appData.events[date] || []
        const dateObj = new Date(date + "T12:00:00")
        const formattedDate = dateObj.toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
        const shortDate = dateObj.toLocaleDateString("es-ES", { day: "numeric", month: "short" })
        const accommodation = appData.accommodations.find((acc) => acc.date === date)

        return (
          <div key={date} className="page-break">
            {/* Encabezado del dia */}
            <div className="day-header">
              <div className="day-number">{shortDate.toUpperCase()}</div>
              <div className="day-date">
                {formattedDate}
              </div>
            </div>

            {/* Alojamiento */}
            {accommodation && (
              <div className="accommodation-box">
                <div className="section-title">🏨 Alojamiento</div>
                <div className="accommodation-details">
                  <div>
                    <strong>{accommodation.name}</strong>
                  </div>
                  <div className="text-sm">{accommodation.address}</div>
                  {accommodation.checkIn && (
                    <div className="text-sm mt-1">
                      Check-in: {accommodation.checkIn} | Check-out: {accommodation.checkOut}
                    </div>
                  )}
                  {accommodation.notes && <div className="text-sm mt-1 italic">{accommodation.notes}</div>}
                </div>
              </div>
            )}

            {/* Eventos del día */}
            <div className="events-section">
              <div className="section-title">📅 Itinerario del Día</div>
              {events.length === 0 ? (
                <div className="no-events">No hay eventos programados para este día</div>
              ) : (
                <div className="events-list">
                  {events.map((event) => (
                    <div key={event.id} className="event-item">
                      <div className="event-time">{event.time}</div>
                      <div className="event-content">
                        <div className="event-title">{event.title}</div>
                        <div className="event-location">{event.location}</div>
                        {event.description && <div className="event-description">{event.description}</div>}
                        {event.ticketPrice && event.ticketPrice > 0 && (
                          <div className="event-price">
                            💶 Precio: {event.ticketPrice}€ por persona
                            {event.ticketUrl && (
                              <span className="ml-2 text-xs">
                                | Web: {event.ticketUrl.replace("https://", "").replace("http://", "")}
                              </span>
                            )}
                          </div>
                        )}
                        {event.transport && (
                          <div className="event-transport">
                            🚆 Transporte: {event.transport.type} | Duración: {event.transport.duration} | Precio:{" "}
                            {event.transport.price}€
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pie de pagina con fecha */}
            <div className="page-footer">Europa Magica 2026 - {formattedDate}</div>
          </div>
        )
      })}

      {/* Estilos para impresión */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }

          .page-break {
            page-break-after: always;
            page-break-inside: avoid;
          }

          .page-break:last-child {
            page-break-after: auto;
          }

          @page {
            size: A4;
            margin: 2cm 1.5cm;
          }
        }

        .print-container {
          background: white;
          color: black;
          font-family: Arial, sans-serif;
          line-height: 1.5;
        }

        .page-break {
          min-height: 100vh;
          padding: 20px;
          position: relative;
        }

        .day-header {
          border-bottom: 3px solid #2563eb;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }

        .day-number {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
        }

        .day-date {
          font-size: 18px;
          color: #374151;
          text-transform: capitalize;
        }

        .accommodation-box {
          background: #f3f4f6;
          border-left: 4px solid #10b981;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 4px;
        }

        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 10px;
        }

        .accommodation-details {
          font-size: 14px;
          color: #374151;
        }

        .events-section {
          margin-top: 20px;
        }

        .no-events {
          text-align: center;
          color: #9ca3af;
          padding: 40px;
          font-style: italic;
        }

        .events-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .event-item {
          display: flex;
          gap: 15px;
          border-left: 3px solid #e5e7eb;
          padding-left: 15px;
          page-break-inside: avoid;
        }

        .event-time {
          font-weight: bold;
          color: #2563eb;
          min-width: 60px;
          font-size: 14px;
        }

        .event-content {
          flex: 1;
        }

        .event-title {
          font-weight: bold;
          font-size: 15px;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .event-location {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .event-description {
          font-size: 13px;
          color: #374151;
          margin-bottom: 4px;
        }

        .event-price {
          font-size: 12px;
          color: #059669;
          font-weight: 600;
          margin-top: 4px;
        }

        .event-transport {
          font-size: 12px;
          color: #7c3aed;
          margin-top: 4px;
        }

        .page-footer {
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
          border-top: 1px solid #e5e7eb;
          padding-top: 10px;
        }

        @media screen {
          .print-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
          }

          .page-break {
            background: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
            border-radius: 8px;
          }
        }
      `}</style>
    </div>
  )
}
