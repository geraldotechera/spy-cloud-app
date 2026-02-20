"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import jsQR from "jsqr"

interface Ticket {
  type: "avion" | "tren" | "evento"
  title: string
  date: string
  details: string
  file?: string
  fileName?: string
  fileType?: string
}

interface TicketsSectionProps {
  tickets: Ticket[]
  onBack: () => void
  onUpdateTickets: (tickets: Ticket[]) => void
}

export function TicketsSection({ tickets, onBack, onUpdateTickets }: TicketsSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedType, setSelectedType] = useState<"avion" | "tren" | "evento">("avion")
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    details: "",
  })
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [fileType, setFileType] = useState<string>("")
  const [isScanning, setIsScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const qrInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      setFileType(file.type)

      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedFile(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const startQRScanner = async () => {
    setIsScanning(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        scanQRCode()
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error)
      alert("No se pudo acceder a la cámara. Por favor, permite el acceso.")
      setIsScanning(false)
    }
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          handleQRDetected(code.data)
          stopQRScanner()
          return
        }
      }

      if (isScanning) {
        requestAnimationFrame(scan)
      }
    }

    scan()
  }

  const handleQRDetected = (qrData: string) => {
    setFormData({
      ...formData,
      details: formData.details ? `${formData.details}\n\nDatos QR: ${qrData}` : `Datos QR: ${qrData}`,
    })
    alert("¡QR escaneado exitosamente! Los datos se agregaron a los detalles.")
  }

  const stopQRScanner = () => {
    setIsScanning(false)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const handleQRScan = () => {
    startQRScanner()
  }

  const handleAddTicket = () => {
    if (!formData.title || !formData.date) {
      alert("Por favor completa el título y la fecha")
      return
    }

    const newTicket: Ticket = {
      type: selectedType,
      title: formData.title,
      date: formData.date,
      details: formData.details,
      file: uploadedFile || undefined,
      fileName: fileName || undefined,
      fileType: fileType || undefined,
    }

    onUpdateTickets([...tickets, newTicket])
    setFormData({ title: "", date: "", details: "" })
    setUploadedFile(null)
    setFileName("")
    setFileType("")
    setShowAddModal(false)
  }

  const handleDeleteTicket = (index: number) => {
    const updated = tickets.filter((_, i) => i !== index)
    onUpdateTickets(updated)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "avion":
        return "✈️"
      case "tren":
        return "🚆"
      case "evento":
        return "🎭"
      default:
        return "🎫"
    }
  }

  const handleViewFile = (ticket: Ticket) => {
    if (!ticket.file) return

    if (ticket.fileType?.includes("pdf")) {
      const pdfWindow = window.open("")
      if (pdfWindow) {
        pdfWindow.document.write(`<iframe width='100%' height='100%' src='${ticket.file}'></iframe>`)
      }
    } else if (ticket.fileType?.includes("word") || ticket.fileType?.includes("document")) {
      const link = document.createElement("a")
      link.href = ticket.file
      link.download = ticket.fileName || "documento.docx"
      link.click()
    } else {
      const imgWindow = window.open("")
      if (imgWindow) {
        imgWindow.document.write(`<img src="${ticket.file}" style="max-width:100%; height:auto;" />`)
      }
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
      >
        ← Volver al Menú
      </button>
      <h2 className="text-xl font-bold">Tickets y Reservas</h2>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedType("avion")}
          className={`${selectedType === "avion" ? "bg-blue-500" : "bg-white/10"} px-4 py-2 rounded-lg flex-1 min-w-[100px]`}
        >
          ✈️ Avión
        </button>
        <button
          onClick={() => setSelectedType("tren")}
          className={`${selectedType === "tren" ? "bg-blue-500" : "bg-white/10"} px-4 py-2 rounded-lg flex-1 min-w-[100px]`}
        >
          🚆 Tren
        </button>
        <button
          onClick={() => setSelectedType("evento")}
          className={`${selectedType === "evento" ? "bg-blue-500" : "bg-white/10"} px-4 py-2 rounded-lg flex-1 min-w-[100px]`}
        >
          🎭 Eventos
        </button>
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg w-full"
      >
        📤 Subir Ticket o QR
      </button>

      {tickets.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
          <p className="text-white/70">No hay tickets cargados aún</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 relative">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getTypeIcon(ticket.type)}</div>
                <div className="flex-1">
                  <h4 className="font-semibold break-words">{ticket.title}</h4>
                  <p className="text-sm text-white/80">{ticket.date}</p>
                  {ticket.details && <p className="text-sm text-white/60 mt-1 break-words">{ticket.details}</p>}
                  {ticket.file && (
                    <div className="mt-2">
                      {ticket.fileType?.includes("image") ? (
                        <img
                          src={ticket.file || "/placeholder.svg"}
                          alt="Ticket"
                          className="max-w-full h-auto rounded-lg max-h-40 cursor-pointer"
                          onClick={() => handleViewFile(ticket)}
                        />
                      ) : (
                        <button
                          onClick={() => handleViewFile(ticket)}
                          className="bg-blue-500/30 hover:bg-blue-500/50 px-4 py-2 rounded-lg text-sm"
                        >
                          📄 Ver {ticket.fileName || "archivo"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteTicket(index)}
                  className="bg-red-500/30 hover:bg-red-500/50 w-8 h-8 rounded-full flex-shrink-0"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Agregar Ticket</h3>

            {isScanning ? (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video ref={videoRef} className="w-full h-64 object-cover" playsInline />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute inset-0 border-4 border-green-500/50 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-green-500" />
                  </div>
                </div>
                <p className="text-center text-sm">Apunta la cámara al código QR</p>
                <button onClick={stopQRScanner} className="w-full bg-red-500 hover:bg-red-600 px-4 py-3 rounded-lg">
                  Cancelar Escaneo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Tipo de Ticket</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedType("avion")}
                      className={`${selectedType === "avion" ? "bg-blue-500" : "bg-white/10"} py-2 rounded-lg`}
                    >
                      ✈️ Avión
                    </button>
                    <button
                      onClick={() => setSelectedType("tren")}
                      className={`${selectedType === "tren" ? "bg-blue-500" : "bg-white/10"} py-2 rounded-lg`}
                    >
                      🚆 Tren
                    </button>
                    <button
                      onClick={() => setSelectedType("evento")}
                      className={`${selectedType === "evento" ? "bg-blue-500" : "bg-white/10"} py-2 rounded-lg`}
                    >
                      🎭 Evento
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1">Título *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white/10 rounded-lg px-3 py-2 border border-white/20"
                    placeholder="Ej: Vuelo Madrid - París"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Fecha *</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-white/10 rounded-lg px-3 py-2 border border-white/20"
                    placeholder="Ej: 10 Oct, 14:30"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Detalles (opcional)</label>
                  <textarea
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    className="w-full bg-white/10 rounded-lg px-3 py-2 border border-white/20 min-h-[60px]"
                    placeholder="Información adicional..."
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Subir archivo o escanear QR</label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleQRScan}
                      className="flex-1 bg-green-500 hover:bg-green-600 px-4 py-3 rounded-lg text-sm"
                    >
                      📷 Escanear QR
                    </button>
                    <label className="flex-1 bg-blue-500 hover:bg-blue-600 px-4 py-3 rounded-lg text-sm text-center cursor-pointer">
                      📁 Subir Archivo
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    ref={qrInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {uploadedFile && (
                  <div className="bg-white/10 rounded-lg p-3 border-2 border-green-500/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-500">✓</span>
                      <p className="text-sm font-semibold">Archivo guardado:</p>
                    </div>
                    <p className="text-xs text-white/80 mb-2 break-words">{fileName}</p>
                    {fileType.includes("image") ? (
                      <div>
                        <img
                          src={uploadedFile || "/placeholder.svg"}
                          alt="Preview"
                          className="max-w-full h-auto rounded-lg max-h-32 mb-2"
                        />
                        <p className="text-xs text-center text-white/60">
                          Este archivo se guardará con tu ticket y podrás abrirlo cuando quieras
                        </p>
                      </div>
                    ) : (
                      <div className="bg-blue-500/30 px-4 py-2 rounded text-sm text-center">
                        📄 {fileType.includes("pdf") ? "PDF" : "Documento"} listo para guardar
                        <p className="text-xs mt-1 text-white/60">Podrás descargarlo después</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setShowAddModal(false)
                      setUploadedFile(null)
                      setFileName("")
                      setFileType("")
                      stopQRScanner()
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddTicket}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
