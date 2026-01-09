"use client"

import { useState } from "react"
import type { User } from "@/types"

interface UserSettingsProps {
  currentUser: User
  onBack: () => void
}

const AVAILABLE_USERS: User[] = [
  { id: "geraldo", name: "Geraldo Techera", role: "admin", couple: "TECHERA", color: "blue" },
  { id: "laura", name: "Laura Furquin", role: "user", couple: "TECHERA", color: "blue" },
  { id: "rodrigo-c", name: "Rodrigo Castro", role: "user", couple: "CASTRO", color: "green" },
  { id: "patricia", name: "Patricia Cerrudo", role: "user", couple: "CASTRO", color: "green" },
  { id: "rodrigo-p", name: "Rodrigo Perez", role: "user", couple: "PEREZ", color: "orange" },
  { id: "monica", name: "Mónica Curbelo", role: "user", couple: "PEREZ", color: "orange" },
]

export function UserSettings({ currentUser, onBack }: UserSettingsProps) {
  const [activeUsers, setActiveUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem("activeUsers")
    return saved ? JSON.parse(saved) : AVAILABLE_USERS
  })

  const handleToggleUser = (user: User) => {
    if (user.id === "geraldo") {
      alert("No puedes desactivar al administrador")
      return
    }

    const isActive = activeUsers.some((u) => u.id === user.id)
    let newActiveUsers: User[]

    if (isActive) {
      newActiveUsers = activeUsers.filter((u) => u.id !== user.id)
    } else {
      newActiveUsers = [...activeUsers, user]
    }

    setActiveUsers(newActiveUsers)
    localStorage.setItem("activeUsers", JSON.stringify(newActiveUsers))
  }

  const getColorClass = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-500/30 border-blue-400"
      case "green":
        return "bg-green-500/30 border-green-400"
      case "orange":
        return "bg-orange-500/30 border-orange-400"
      default:
        return "bg-white/20 border-white/40"
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

      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">⚙️ Configuración de Usuarios</h2>
        <p className="text-sm text-white/70 mb-6">
          Activa o desactiva usuarios que participarán en el viaje. Solo el administrador puede gestionar usuarios.
        </p>

        <div className="space-y-3">
          {AVAILABLE_USERS.map((user) => {
            const isActive = activeUsers.some((u) => u.id === user.id)
            const isAdmin = user.role === "admin"

            return (
              <div
                key={user.id}
                className={`${getColorClass(user.color)} border-2 rounded-xl p-4 flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{isAdmin ? "👑" : "👤"}</div>
                  <div>
                    <h3 className="font-semibold">
                      {user.name} {isAdmin && "(Admin)"}
                    </h3>
                    <p className="text-sm text-white/70">Pareja {user.couple}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleUser(user)}
                  disabled={isAdmin}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    isActive ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"
                  } ${isAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isActive ? "Activo" : "Inactivo"}
                </button>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
          <p className="text-sm">
            <strong>Nota:</strong> Los usuarios inactivos no podrán iniciar sesión en la app. El administrador siempre
            permanece activo.
          </p>
        </div>
      </div>
    </div>
  )
}
