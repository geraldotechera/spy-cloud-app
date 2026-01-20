"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { Photo, User } from "@/types"

// Lista de usuarios para compartir
const ALL_USERS: User[] = [
  { id: 1, name: "Geraldo", couple: "TECHERA", role: "admin", color: "bg-blue-500" },
  { id: 2, name: "Laura", couple: "TECHERA", role: "user", color: "bg-blue-400" },
  { id: 3, name: "Rodrigo C", couple: "CASTRO", role: "user", color: "bg-green-500" },
  { id: 4, name: "Patricia", couple: "CASTRO", role: "user", color: "bg-green-400" },
  { id: 5, name: "Rodrigo P", couple: "PEREZ", role: "user", color: "bg-orange-500" },
  { id: 6, name: "Monica", couple: "PEREZ", role: "user", color: "bg-orange-400" },
]

interface PhotoGalleryProps {
  currentUser: User | null
  photos: Photo[]
  onBack: () => void
  onUpdatePhotos: (photos: Photo[]) => void
  onGoToSettings?: () => void
}

export function PhotoGallery({ currentUser, photos, onBack, onUpdatePhotos, onGoToSettings }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set())
  const [storageInfo, setStorageInfo] = useState({ used: 0, limit: 5242880, percentage: 0 })
  const [showShareModal, setShowShareModal] = useState(false)
  const [pendingPhoto, setPendingPhoto] = useState<Photo | null>(null)
  const [selectedUsersToShare, setSelectedUsersToShare] = useState<Set<number>>(new Set())
  const [saveToMyGallery, setSaveToMyGallery] = useState(true)
  const [viewMode, setViewMode] = useState<"my" | "shared" | "all">("all")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const calculateStorage = () => {
      let totalSize = 0
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key)
          if (value) {
            totalSize += value.length * 2 // UTF-16 usa 2 bytes por carácter
          }
        }
      }
      const percentage = (totalSize / storageInfo.limit) * 100
      setStorageInfo({ used: totalSize, limit: storageInfo.limit, percentage })
    }
    calculateStorage()
  }, [photos])

  const handleTakePhoto = () => {
    fileInputRef.current?.click()
  }

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          let width = img.width
          let height = img.height

          // Reducir tamaño si es muy grande (máximo 1200px de ancho)
          const maxWidth = 1200
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext("2d")
          if (!ctx) {
            reject(new Error("No se pudo crear el contexto del canvas"))
            return
          }

          ctx.drawImage(img, 0, 0, width, height)

          // Comprimir a 70% de calidad
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7)
          resolve(compressedDataUrl)
        }
        img.onerror = () => reject(new Error("Error al cargar la imagen"))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error("Error al leer el archivo"))
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        if (storageInfo.percentage > 90) {
          alert("Espacio casi lleno. Por favor elimina algunas fotos antes de agregar mas.")
          return
        }

        const compressedUrl = await compressImage(file)

        const newPhoto: Photo = {
          id: Date.now(),
          url: compressedUrl,
          date: new Date().toLocaleString("es-UY"),
          location: "",
          notes: "",
          uploadedBy: currentUser?.name,
          uploadedById: currentUser?.id,
          timestamp: Date.now(),
          ownerId: currentUser?.id,
          sharedWith: [],
        }

        // Mostrar modal para decidir si guardar o compartir
        setPendingPhoto(newPhoto)
        setShowShareModal(true)
        setSelectedUsersToShare(new Set())
        setSaveToMyGallery(true)
      } catch (error) {
        console.error("[v0] Error al comprimir la imagen:", error)
        alert("Error al guardar la foto. Por favor intenta de nuevo.")
      }
    }

    if (e.target) {
      e.target.value = ""
    }
  }

  const handleConfirmShare = () => {
    if (!pendingPhoto) return

    const photoToSave: Photo = {
      ...pendingPhoto,
      sharedWith: Array.from(selectedUsersToShare),
      savedToDevice: saveToMyGallery,
    }

    // Solo guardar si el usuario eligio guardarlo en su galeria o compartirlo
    if (saveToMyGallery || selectedUsersToShare.size > 0) {
      onUpdatePhotos([photoToSave, ...photos])
      
      // Si eligio guardar en el dispositivo, descargar automaticamente
      if (saveToMyGallery) {
        const link = document.createElement("a")
        link.href = pendingPhoto.url
        link.download = `europa-2026-${pendingPhoto.id}.jpg`
        link.click()
      }
    }

    setShowShareModal(false)
    setPendingPhoto(null)
    setSelectedUsersToShare(new Set())
    setSaveToMyGallery(true)
  }

  const handleCancelShare = () => {
    setShowShareModal(false)
    setPendingPhoto(null)
    setSelectedUsersToShare(new Set())
    setSaveToMyGallery(true)
  }

  const toggleUserShare = (userId: number) => {
    const newSelected = new Set(selectedUsersToShare)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsersToShare(newSelected)
  }

  const getOtherUsers = () => {
    return ALL_USERS.filter(u => u.id !== currentUser?.id)
  }

  const getFilteredPhotos = () => {
    if (!currentUser) return photos
    
    switch (viewMode) {
      case "my":
        return photos.filter(p => p.ownerId === currentUser.id || p.uploadedById === currentUser.id)
      case "shared":
        return photos.filter(p => p.sharedWith?.includes(currentUser.id) || p.ownerId !== currentUser.id)
      case "all":
      default:
        return photos.filter(p => 
          p.ownerId === currentUser.id || 
          p.uploadedById === currentUser.id ||
          p.sharedWith?.includes(currentUser.id) ||
          !p.ownerId // Fotos antiguas sin owner
        )
    }
  }

  const filteredPhotos = getFilteredPhotos()

  const handleDeletePhoto = (id: number) => {
    if (confirm("¿Eliminar esta foto?")) {
      onUpdatePhotos(photos.filter((p) => p.id !== id))
      setSelectedPhoto(null)
    }
  }

  const handleDownloadPhoto = (photo: Photo) => {
    const link = document.createElement("a")
    link.href = photo.url
    link.download = `europa-2026-${photo.id}.jpg`
    link.click()
  }

  const handleTouchStart = (photoId: number) => {
    longPressTimer.current = setTimeout(() => {
      setSelectionMode(true)
      setSelectedPhotos(new Set([photoId]))
    }, 500) // 500ms para activar long-press
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handlePhotoClick = (photo: Photo) => {
    if (selectionMode) {
      const newSelected = new Set(selectedPhotos)
      if (newSelected.has(photo.id)) {
        newSelected.delete(photo.id)
      } else {
        newSelected.add(photo.id)
      }
      setSelectedPhotos(newSelected)
    } else {
      setSelectedPhoto(photo)
    }
  }

  const handleCancelSelection = () => {
    setSelectionMode(false)
    setSelectedPhotos(new Set())
  }

  const handleDownloadSelected = () => {
    selectedPhotos.forEach((photoId) => {
      const photo = photos.find((p) => p.id === photoId)
      if (photo) {
        handleDownloadPhoto(photo)
      }
    })
    handleCancelSelection()
  }

  const handleDeleteSelected = () => {
    if (confirm(`¿Eliminar ${selectedPhotos.size} foto(s) seleccionada(s)?`)) {
      const remainingPhotos = photos.filter((p) => !selectedPhotos.has(p.id))
      onUpdatePhotos(remainingPhotos)
      handleCancelSelection()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
        >
          ← Volver al Menú
        </button>
        {currentUser?.role === "admin" && onGoToSettings && (
          <button
            onClick={onGoToSettings}
            className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors"
            title="Configuración de usuarios"
          >
            ⚙️
          </button>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">📸 Galería de Fotos</h2>
            <p className="text-sm opacity-70 mt-1">
              {photos.length} foto(s) • {storageInfo.percentage.toFixed(1)}% usado
            </p>
          </div>
          {!selectionMode ? (
            <button
              onClick={handleTakePhoto}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              📷 Tomar Foto
            </button>
          ) : (
            <button
              onClick={handleCancelSelection}
              className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>

        {selectionMode && selectedPhotos.size > 0 && (
          <div className="mb-4 p-4 bg-blue-500/20 rounded-lg border border-blue-500/50">
            <p className="text-sm mb-3">{selectedPhotos.size} foto(s) seleccionada(s)</p>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadSelected}
                className="flex-1 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition-colors text-sm"
              >
                💾 Descargar
              </button>
              <button
                onClick={handleDeleteSelected}
                className="flex-1 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors text-sm"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Filtros de vista */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode("all")}
            className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
              viewMode === "all" ? "bg-blue-500" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setViewMode("my")}
            className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
              viewMode === "my" ? "bg-blue-500" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            Mis fotos
          </button>
          <button
            onClick={() => setViewMode("shared")}
            className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
              viewMode === "shared" ? "bg-blue-500" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            Compartidas
          </button>
        </div>

        {filteredPhotos.length === 0 ? (
          <div className="text-center py-12 opacity-70">
            <p className="text-lg mb-2">No hay fotos todavia</p>
            <p className="text-sm">Toca el boton "Tomar Foto" para empezar</p>
            <p className="text-xs mt-2 opacity-50">Manten presionada una foto para seleccionar multiples</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => handlePhotoClick(photo)}
                onTouchStart={() => handleTouchStart(photo.id)}
                onTouchEnd={handleTouchEnd}
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border ${
                  selectedPhotos.has(photo.id) ? "border-blue-500 border-4" : "border-white/20"
                }`}
              >
                {selectionMode && (
                  <div className="absolute top-2 right-2 z-10">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedPhotos.has(photo.id)
                          ? "bg-blue-500 border-blue-500"
                          : "bg-white/20 border-white backdrop-blur-sm"
                      }`}
                    >
                      {selectedPhotos.has(photo.id) && <span className="text-white text-sm">✓</span>}
                    </div>
                  </div>
                )}
                <img
                  src={photo.url || "/placeholder.svg"}
                  alt="Foto del viaje"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                  <p className="text-xs">{photo.date}</p>
                  <div className="flex items-center justify-between">
                    {photo.uploadedBy && <p className="text-xs opacity-60">{photo.uploadedBy}</p>}
                    {photo.sharedWith && photo.sharedWith.length > 0 && (
                      <span className="text-xs bg-green-500/50 px-1 rounded">
                        Compartida ({photo.sharedWith.length})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para ver foto */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full border border-white/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Foto del Viaje</h3>
              <button onClick={() => setSelectedPhoto(null)} className="text-2xl hover:text-red-500 transition-colors">
                ✕
              </button>
            </div>

            <img
              src={selectedPhoto.url || "/placeholder.svg"}
              alt="Foto del viaje"
              className="w-full rounded-lg mb-4"
            />

            <div className="space-y-2 mb-4">
              <p className="text-sm opacity-70">📅 {selectedPhoto.date}</p>
              {selectedPhoto.uploadedBy && (
                <p className="text-sm opacity-70">📤 Subida por: {selectedPhoto.uploadedBy}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleDownloadPhoto(selectedPhoto)}
                className="flex-1 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition-colors"
              >
                Descargar al Movil
              </button>
              <button
                onClick={() => handleDeletePhoto(selectedPhoto.id)}
                className="flex-1 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>

            {/* Info de compartidos */}
            {selectedPhoto.sharedWith && selectedPhoto.sharedWith.length > 0 && (
              <div className="mt-4 p-3 bg-green-500/20 rounded-lg border border-green-500/50">
                <p className="text-sm font-semibold mb-2">Compartida con:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPhoto.sharedWith.map(userId => {
                    const user = ALL_USERS.find(u => u.id === userId)
                    return user ? (
                      <span key={userId} className={`${user.color} px-2 py-1 rounded text-xs`}>
                        {user.name}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal para compartir foto */}
      {showShareModal && pendingPhoto && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-white/30">
            <h3 className="text-xl font-bold mb-4 text-center">Nueva Foto</h3>
            
            <img
              src={pendingPhoto.url || "/placeholder.svg"}
              alt="Nueva foto"
              className="w-full rounded-lg mb-4 max-h-48 object-cover"
            />

            {/* Opcion guardar en mi galeria */}
            <div className="mb-4 p-3 bg-white/10 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveToMyGallery}
                  onChange={(e) => setSaveToMyGallery(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <div>
                  <p className="font-semibold">Guardar en mi galeria</p>
                  <p className="text-xs opacity-70">Se descargara tambien a tu movil</p>
                </div>
              </label>
            </div>

            {/* Seleccionar usuarios para compartir */}
            <div className="mb-4">
              <p className="font-semibold mb-2">Compartir con:</p>
              <div className="grid grid-cols-2 gap-2">
                {getOtherUsers().map(user => (
                  <button
                    key={user.id}
                    onClick={() => toggleUserShare(user.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedUsersToShare.has(user.id)
                        ? `${user.color} border-white`
                        : "bg-white/10 border-transparent hover:border-white/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${user.color}`} />
                      <span className="text-sm font-medium">{user.name}</span>
                    </div>
                    <p className="text-xs opacity-60 mt-1">{user.couple}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Resumen */}
            <div className="mb-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/50">
              <p className="text-sm">
                {saveToMyGallery && selectedUsersToShare.size > 0 && (
                  <>Se guardara en tu galeria y se compartira con {selectedUsersToShare.size} persona(s)</>
                )}
                {saveToMyGallery && selectedUsersToShare.size === 0 && (
                  <>Se guardara solo en tu galeria</>
                )}
                {!saveToMyGallery && selectedUsersToShare.size > 0 && (
                  <>Se compartira con {selectedUsersToShare.size} persona(s) sin guardar en tu galeria</>
                )}
                {!saveToMyGallery && selectedUsersToShare.size === 0 && (
                  <>Selecciona al menos una opcion</>
                )}
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-2">
              <button
                onClick={handleCancelShare}
                className="flex-1 bg-gray-500 hover:bg-gray-600 px-4 py-3 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmShare}
                disabled={!saveToMyGallery && selectedUsersToShare.size === 0}
                className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                  saveToMyGallery || selectedUsersToShare.size > 0
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-600 cursor-not-allowed"
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
