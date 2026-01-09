"use client"

import type { Event } from "@/types"

interface CalendarProps {
  selectedDate: string
  onSelectDate: (date: string) => void
  events: Record<string, Event[]>
}

export function Calendar({ selectedDate, onSelectDate, events }: CalendarProps) {
  const daysInMonth = 30 // Septiembre tiene 30 días
  const startDay = 2 // Septiembre 2026 comienza en martes (0=domingo, 1=lunes, 2=martes)

  const emptyDays = Array.from({ length: startDay }, (_, i) => i)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
      <h3 className="text-center font-bold mb-4">Septiembre de 2026</h3>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div key={day} className="text-xs font-bold text-white/70 py-2">
            {day}
          </div>
        ))}
        {emptyDays.map((i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr = `2026-09-${day.toString().padStart(2, "0")}`
          const hasEvents = events[dateStr] && events[dateStr].length > 0
          const isSelected = dateStr === selectedDate

          return (
            <button
              key={day}
              onClick={() => {
                console.log("[v0] Calendar: Día seleccionado:", day, "Fecha completa:", dateStr)
                onSelectDate(dateStr)
              }}
              className={`
                relative py-2 rounded-lg text-sm transition-colors
                ${isSelected ? "bg-blue-500 font-bold" : "hover:bg-white/20"}
                ${hasEvents ? 'after:content-[""] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-red-500 after:rounded-full' : ""}
              `}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
