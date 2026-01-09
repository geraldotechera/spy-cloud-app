"use client"

import { useState } from "react"
import type { AppData } from "@/types"
import jsPDF from "jspdf"

interface PDFExportProps {
  appData: AppData
  onClose: () => void
}

export function PDFExport({ appData, onClose }: PDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)

    try {
      const pdf = new jsPDF()
      let yPosition = 20

      // Portada
      pdf.setFontSize(24)
      pdf.setFont("helvetica", "bold")
      pdf.text("Europa Mágica 2026", 105, yPosition, { align: "center" })

      yPosition += 15
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "normal")
      pdf.text("Itinerario de Viaje", 105, yPosition, { align: "center" })

      yPosition += 10
      pdf.setFontSize(12)
      pdf.text("3 Parejas - 6 Viajeros", 105, yPosition, { align: "center" })

      yPosition += 10
      pdf.text("3 - 25 Octubre 2026", 105, yPosition, { align: "center" })

      // Nueva página para itinerario
      pdf.addPage()
      yPosition = 20

      pdf.setFontSize(18)
      pdf.setFont("helvetica", "bold")
      pdf.text("Itinerario Día por Día", 20, yPosition)
      yPosition += 15

      // Itinerario día por día
      const sortedDates = Object.keys(appData.events).sort()

      for (const date of sortedDates) {
        const events = appData.events[date]
        if (!events || events.length === 0) continue

        // Verificar si necesitamos nueva página
        if (yPosition > 250) {
          pdf.addPage()
          yPosition = 20
        }

        // Fecha
        pdf.setFontSize(14)
        pdf.setFont("helvetica", "bold")
        const formattedDate = new Date(date).toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
        pdf.text(formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1), 20, yPosition)
        yPosition += 10

        // Eventos del día
        pdf.setFontSize(10)
        pdf.setFont("helvetica", "normal")

        for (const event of events) {
          if (yPosition > 270) {
            pdf.addPage()
            yPosition = 20
          }

          pdf.setFont("helvetica", "bold")
          pdf.text(`${event.time} - ${event.title}`, 25, yPosition)
          yPosition += 5

          pdf.setFont("helvetica", "normal")
          pdf.text(`📍 ${event.location}`, 25, yPosition)
          yPosition += 5

          if (event.description) {
            const descLines = pdf.splitTextToSize(event.description, 160)
            pdf.text(descLines, 25, yPosition)
            yPosition += descLines.length * 5
          }

          if (event.ticketPrice > 0) {
            pdf.text(`💰 Entrada: €${event.ticketPrice} por persona`, 25, yPosition)
            yPosition += 5
          }

          yPosition += 3
        }

        yPosition += 5
      }

      // Nueva página para alojamientos
      pdf.addPage()
      yPosition = 20

      pdf.setFontSize(18)
      pdf.setFont("helvetica", "bold")
      pdf.text("Alojamientos", 20, yPosition)
      yPosition += 15

      const cities = ["Madrid", "Barcelona", "París", "Ámsterdam", "Milán", "Florencia", "Roma", "Sorrento"]

      for (const city of cities) {
        const cityAccommodations = appData.accommodations.filter((acc) => acc.city === city)
        if (cityAccommodations.length === 0) continue

        if (yPosition > 250) {
          pdf.addPage()
          yPosition = 20
        }

        pdf.setFontSize(14)
        pdf.setFont("helvetica", "bold")
        pdf.text(city, 20, yPosition)
        yPosition += 10

        pdf.setFontSize(10)
        pdf.setFont("helvetica", "normal")

        for (const acc of cityAccommodations) {
          if (yPosition > 270) {
            pdf.addPage()
            yPosition = 20
          }

          pdf.text(`🏨 ${acc.name}`, 25, yPosition)
          yPosition += 5

          if (acc.location) {
            pdf.text(`📍 ${acc.location}`, 25, yPosition)
            yPosition += 5
          }

          if (acc.dates) {
            pdf.text(`📅 ${acc.dates}`, 25, yPosition)
            yPosition += 5
          }

          if (acc.url) {
            pdf.setTextColor(0, 0, 255)
            pdf.textWithLink("🔗 Ver reserva", 25, yPosition, { url: acc.url })
            pdf.setTextColor(0, 0, 0)
            yPosition += 5
          }

          yPosition += 5
        }

        yPosition += 5
      }

      // Nueva página para tickets
      if (appData.tickets.length > 0) {
        pdf.addPage()
        yPosition = 20

        pdf.setFontSize(18)
        pdf.setFont("helvetica", "bold")
        pdf.text("Tickets y Reservas", 20, yPosition)
        yPosition += 15

        pdf.setFontSize(10)
        pdf.setFont("helvetica", "normal")

        for (const ticket of appData.tickets) {
          if (yPosition > 270) {
            pdf.addPage()
            yPosition = 20
          }

          const icon = ticket.type === "avion" ? "✈️" : ticket.type === "tren" ? "🚆" : "🎭"
          pdf.setFont("helvetica", "bold")
          pdf.text(`${icon} ${ticket.title}`, 20, yPosition)
          yPosition += 5

          pdf.setFont("helvetica", "normal")
          pdf.text(`📅 ${ticket.date}`, 20, yPosition)
          yPosition += 5

          if (ticket.details) {
            const detailLines = pdf.splitTextToSize(ticket.details, 170)
            pdf.text(detailLines, 20, yPosition)
            yPosition += detailLines.length * 5
          }

          yPosition += 8
        }
      }

      // Guardar PDF
      pdf.save("Europa-Magica-2026-Itinerario.pdf")

      alert("PDF generado exitosamente!")
    } catch (error) {
      console.error("Error al generar PDF:", error)
      alert("Error al generar el PDF. Por favor intenta nuevamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Exportar Itinerario a PDF</h3>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm mb-3">El PDF incluirá:</p>
            <ul className="text-sm space-y-2 text-white/80">
              <li>✓ Portada del viaje</li>
              <li>✓ Itinerario día por día con todos los eventos</li>
              <li>✓ Alojamientos por ciudad</li>
              <li>✓ Tickets y reservas</li>
            </ul>
          </div>

          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {isGenerating ? "Generando PDF..." : "📄 Generar PDF"}
          </button>

          <button
            onClick={onClose}
            className="w-full bg-gray-500 hover:bg-gray-600 px-6 py-3 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
