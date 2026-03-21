"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { Event, TicketFile } from "@/types"
import { Upload, X, FileText, Image as ImageIcon, ExternalLink, Loader2 } from "lucide-react"

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
    ticketUrl: "",
    imageUrl: "",
  })
  const [ticketFiles, setTicketFiles] = useState<TicketFile[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        time: event.time,
        location: event.location,
        description: event.description || "",
        ticketUrl: event.ticketUrl || "",
        imageUrl: event.imageUrl || "",
      })
      setTicketFiles(event.ticketFiles || [])
    } else {
      setFormData({
        title: "",
        time: "",
        location: "",
        description: "",
        ticketUrl: "",
        imageUrl: "",
      })
      setTicketFiles([])
    }
  }, [event, isOpen])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload-ticket', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          alert(error.error || 'Error al subir archivo')
          continue
        }

        const data = await response.json()
        
        setTicketFiles(prev => [...prev, {
          url: data.pathname,
          name: data.name,
          type: data.type,
          uploadedAt: Date.now()
        }])
      }
    } catch (error) {
      console.error('Error uploading:', error)
      alert('Error al subir archivo')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeTicketFile = (index: number) => {
    setTicketFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: event?.id || 0,
      ticketPrice: event?.ticketPrice ?? 0,
      category: event?.category,
      icon: event?.icon,
      coordinates: event?.coordinates,
      budgetId: event?.budgetId,
      ...formData,
      ticketFiles: ticketFiles.length > 0 ? ticketFiles : undefined,
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
            <label className="block text-sm mb-1">Titulo del Evento</label>
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
            <label className="block text-sm mb-1">Ubicacion</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Descripcion</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Pagina para comprar entrada (opcional)</label>
            <input
              type="url"
              value={formData.ticketUrl}
              onChange={(e) => setFormData({ ...formData, ticketUrl: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
              placeholder="https://ejemplo.com/comprar-entradas"
            />
            <p className="text-xs text-white/50 mt-1">Link a la pagina oficial donde se compran las entradas</p>
          </div>

          {/* Seccion de subir tickets */}
          <div className="border border-white/20 rounded-lg p-4">
            <label className="block text-sm mb-2 font-medium">Tickets / Entradas compradas</label>
            
            {/* Lista de archivos subidos */}
            {ticketFiles.length > 0 && (
              <div className="space-y-2 mb-3">
                {ticketFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                    {file.type === 'pdf' ? (
                      <FileText className="w-5 h-5 text-red-400 flex-shrink-0" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    )}
                    <span className="text-sm truncate flex-1">{file.name}</span>
                    <a 
                      href={`/api/ticket-file?pathname=${encodeURIComponent(file.url)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-white/10 rounded"
                      title="Ver archivo"
                    >
                      <ExternalLink className="w-4 h-4 text-white/60" />
                    </a>
                    <button
                      type="button"
                      onClick={() => removeTicketFile(index)}
                      className="p-1 hover:bg-red-500/20 rounded"
                      title="Eliminar"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Boton de subir */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="ticket-upload"
            />
            <label
              htmlFor="ticket-upload"
              className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-white/5 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Subir ticket (PDF o imagen)</span>
                </>
              )}
            </label>
            <p className="text-xs text-white/50 mt-2">Subi los tickets o entradas que ya compraste</p>
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
            <p className="text-xs text-white/50 mt-1">Imagen que se mostrara en los detalles del evento</p>
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
