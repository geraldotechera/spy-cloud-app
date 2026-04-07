"use client"

import { useState, useRef } from "react"
import { Download, Upload, CheckCircle, AlertCircle, Clock } from "lucide-react"
import type { AppData } from "@/types"

interface BackupRestoreProps {
  appData: AppData
  onRestore: (data: AppData) => void
}

export function BackupRestore({ appData, onRestore }: BackupRestoreProps) {
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [importMessage, setImportMessage] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingData, setPendingData] = useState<AppData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, "0")
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`
    const filename = `europa-2026-backup-${timestamp}.json`

    const json = JSON.stringify({ version: 1, exportedAt: now.toISOString(), data: appData }, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        // Soportar tanto el formato nuevo { version, exportedAt, data } como el formato directo
        const restored: AppData = parsed.data ?? parsed

        if (
          restored &&
          typeof restored === "object" &&
          restored.events &&
          Array.isArray(restored.accommodations) &&
          Array.isArray(restored.tickets) &&
          restored.budget
        ) {
          setPendingData(restored)
          setShowConfirm(true)
        } else {
          setImportStatus("error")
          setImportMessage("El archivo no tiene el formato correcto de backup.")
          setTimeout(() => setImportStatus("idle"), 4000)
        }
      } catch {
        setImportStatus("error")
        setImportMessage("No se pudo leer el archivo. Asegurate de seleccionar un backup válido.")
        setTimeout(() => setImportStatus("idle"), 4000)
      }
    }
    reader.readAsText(file)
    // Limpiar input para poder importar el mismo archivo dos veces
    e.target.value = ""
  }

  const confirmRestore = () => {
    if (!pendingData) return
    onRestore(pendingData)
    setShowConfirm(false)
    setPendingData(null)
    setImportStatus("success")
    setImportMessage("Backup restaurado correctamente. Los datos se guardaron en Supabase.")
    setTimeout(() => setImportStatus("idle"), 5000)
  }

  const cancelRestore = () => {
    setShowConfirm(false)
    setPendingData(null)
  }

  const exportedAt = pendingData ? null : null

  return (
    <div className="space-y-3">
      <div className="bg-white/10 rounded-xl p-4 border border-white/20">
        <h3 className="text-sm font-bold text-white mb-1">Exportar backup</h3>
        <p className="text-xs text-white/60 mb-3">
          Descarga todos los datos del viaje en un archivo JSON. Guardalo en Google Drive, WhatsApp o donde quieras.
        </p>
        <button
          onClick={handleExport}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-lg"
        >
          <Download className="w-4 h-4" />
          Descargar backup (.json)
        </button>
      </div>

      <div className="bg-white/10 rounded-xl p-4 border border-white/20">
        <h3 className="text-sm font-bold text-white mb-1">Importar backup</h3>
        <p className="text-xs text-white/60 mb-3">
          Restaura todos los datos desde un backup anterior. Esto reemplazará los datos actuales.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-lg"
        >
          <Upload className="w-4 h-4" />
          Seleccionar backup (.json)
        </button>
      </div>

      {/* Feedback de importación */}
      {importStatus !== "idle" && (
        <div
          className={`rounded-xl p-3 flex items-start gap-2 text-sm border ${
            importStatus === "success"
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
              : "bg-red-500/20 border-red-500/40 text-red-300"
          }`}
        >
          {importStatus === "success" ? (
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          <span>{importMessage}</span>
        </div>
      )}

      {/* Dialog de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-yellow-400 shrink-0" />
              <h3 className="text-white font-bold text-base">Restaurar backup</h3>
            </div>
            <p className="text-white/70 text-sm mb-5">
              Esto va a <span className="text-yellow-300 font-semibold">reemplazar todos los datos actuales</span> con los del backup.
              Los datos se guardarán en Supabase. ¿Continuar?
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelRestore}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-xl py-2.5 text-sm font-semibold transition-all border border-white/20"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRestore}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl py-2.5 text-sm font-bold transition-all shadow-lg"
              >
                Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
