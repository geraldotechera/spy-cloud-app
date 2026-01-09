"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Event } from "@/types"

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Event) => void
  event: Event | null
}

export function EventModal({ isOpen, onClose, onSave, event }: EventModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    time: "",
    location: "",
    description: "",
    ticketPrice: 0,
    ticketUrl: "",
    imageUrl: "",
  })

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        time: event.time,
        location: event.location,
        description: event.description || "",
        ticketPrice: event.ticketPrice,
        ticketUrl: event.ticketUrl || "",
        imageUrl: event.imageUrl || "",
      })
    } else {
      setFormData({
        title: "",
        time: "",
        location: "",
        description: "",
        ticketPrice: 0,
        ticketUrl: "",
        imageUrl: "",
      })
    }
  }, [event, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: event?.id || 0,
      ...formData,
    })
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{event ? "Editar Evento" : "Agregar Evento"}</h3>
          <button onClick={onClose} className="text-2xl hover:text-red-400 transition-colors">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Título del Evento</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Hora</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Ubicación</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Precio de entrada (€ por persona)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.ticketPrice}
              onChange={(e) => setFormData({ ...formData, ticketPrice: Number.parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">URL para comprar tickets (opcional)</label>
            <input
              type="url"
              value={formData.ticketUrl}
              onChange={(e) => setFormData({ ...formData, ticketUrl: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
              placeholder="https://ejemplo.com/tickets"
            />
            <p className="text-xs text-white/50 mt-1">Página web oficial para comprar entradas</p>
          </div>

          <div>
            <label className="block text-sm mb-1">URL de imagen del lugar (opcional)</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            <p className="text-xs text-white/50 mt-1">Imagen que se mostrará en los detalles del evento</p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg transition-colors font-semibold"
          >
            Guardar Evento
          </button>
        </form>
      </div>
    </div>
  )
}
