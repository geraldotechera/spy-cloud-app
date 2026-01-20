"use client"

import { useState } from "react"
import type { AppData } from "@/types"

interface PDFExportSimpleProps {
  appData: AppData
  section: "agenda" | "alojamiento" | "tickets"
}

export function PDFExportSimple({ appData, section }: PDFExportSimpleProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePrintView = () => {
    setIsGenerating(true)

    // Crear una nueva ventana con el contenido a imprimir
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Por favor permite las ventanas emergentes para exportar a PDF")
      setIsGenerating(false)
      return
    }

    let content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Europa Mágica 2026 - ${section === "agenda" ? "Itinerario" : section === "alojamiento" ? "Alojamientos" : "Tickets"}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            color: #1e40af;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 10px;
          }
          h2 {
            color: #3b82f6;
            margin-top: 30px;
          }
          h3 {
            color: #60a5fa;
            margin-top: 20px;
          }
          .event {
            margin: 15px 0;
            padding: 10px;
            border-left: 4px solid #3b82f6;
            background: #f0f9ff;
          }
          .time {
            font-weight: bold;
            color: #1e40af;
          }
          .location {
            color: #64748b;
            font-size: 14px;
          }
          .price {
            color: #059669;
            font-weight: bold;
          }
          .accommodation {
            margin: 10px 0;
            padding: 10px;
            background: #f0fdf4;
            border-left: 4px solid #10b981;
          }
          .ticket {
            margin: 10px 0;
            padding: 10px;
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
          }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Europa Magica 2026</h1>
        <p><strong>3 Parejas - 6 Viajeros</strong></p>
        <p>5 - 27 Septiembre 2026</p>
        <hr>
    `

    if (section === "agenda") {
      content += "<h2>📅 Itinerario Día por Día</h2>"
      const sortedDates = Object.keys(appData.events).sort()

      for (const date of sortedDates) {
        const events = appData.events[date]
        if (!events || events.length === 0) continue

        const formattedDate = new Date(date).toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })

        content += `<h3>${formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}</h3>`

        for (const event of events) {
          content += `
            <div class="event">
              <div class="time">${event.time} - ${event.title}</div>
              <div class="location">📍 ${event.location}</div>
              ${event.description ? `<p>${event.description}</p>` : ""}
              ${event.ticketPrice > 0 ? `<div class="price">💰 Entrada: €${event.ticketPrice} por persona</div>` : '<div class="price">💰 Gratis</div>'}
            </div>
          `
        }
      }
    } else if (section === "alojamiento") {
      content += "<h2>🏨 Alojamientos</h2>"
      const cities = ["Madrid", "Barcelona", "París", "Ámsterdam", "Milán", "Florencia", "Roma", "Sorrento"]

      for (const city of cities) {
        const cityAccommodations = appData.accommodations.filter((acc) => acc.city === city)
        if (cityAccommodations.length === 0) continue

        content += `<h3>${city}</h3>`

        for (const acc of cityAccommodations) {
          content += `
            <div class="accommodation">
              <strong>🏨 ${acc.name}</strong><br>
              ${acc.location ? `📍 ${acc.location}<br>` : ""}
              ${acc.dates ? `📅 ${acc.dates}<br>` : ""}
              ${acc.url ? `<a href="${acc.url}" target="_blank">🔗 Ver reserva</a>` : ""}
            </div>
          `
        }
      }
    } else if (section === "tickets") {
      content += "<h2>🎫 Tickets y Reservas</h2>"

      for (const ticket of appData.tickets) {
        const icon = ticket.type === "avion" ? "✈️" : ticket.type === "tren" ? "🚆" : "🎭"
        content += `
          <div class="ticket">
            <strong>${icon} ${ticket.title}</strong><br>
            📅 ${ticket.date}<br>
            ${ticket.details ? `<p>${ticket.details}</p>` : ""}
          </div>
        `
      }
    }

    content += `
        <hr>
        <p class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
            🖨️ Imprimir / Guardar como PDF
          </button>
        </p>
      </body>
      </html>
    `

    printWindow.document.write(content)
    printWindow.document.close()

    setIsGenerating(false)
  }

  return (
    <button
      onClick={generatePrintView}
      disabled={isGenerating}
      className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
    >
      {isGenerating ? "Generando..." : "📄 Exportar a PDF"}
    </button>
  )
}
