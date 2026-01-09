"use client"

import { useState } from "react"
import type { User } from "@/types"

interface UserSelectorProps {
  currentUser: User | null
  onSelectUser: (user: User) => void
  onLogout?: () => void // Agregada prop para cerrar sesión
}

const USERS: User[] = [
  // Pareja TECHERA - Azul
  { id: 1, name: "Geraldo", couple: "TECHERA", role: "admin", color: "bg-blue-500" },
  { id: 2, name: "Laura", couple: "TECHERA", role: "user", color: "bg-blue-400" },
  // Pareja CASTRO - Verde
  { id: 3, name: "Rodrigo C", couple: "CASTRO", role: "user", color: "bg-green-500" },
  { id: 4, name: "Patricia", couple: "CASTRO", role: "user", color: "bg-green-400" },
  // Pareja PEREZ - Naranja
  { id: 5, name: "Rodrigo P", couple: "PEREZ", role: "user", color: "bg-orange-500" },
  { id: 6, name: "Mónica", couple: "PEREZ", role: "user", color: "bg-orange-400" },
]

export function UserSelector({ currentUser, onSelectUser, onLogout }: UserSelectorProps) {
  const [showSelector, setShowSelector] = useState(!currentUser)

  if (!showSelector && currentUser) {
    return (
      <div className={`flex items-center gap-2 ${currentUser.color} backdrop-blur-md rounded-lg px-3 py-2`}>
        <span className="text-sm text-white font-semibold">
          {currentUser.name}
          {currentUser.role === "admin" && " 👑"}
        </span>
        <button
          onClick={() => {
            if (onLogout) {
              onLogout()
            }
            setShowSelector(true)
          }}
          className="text-xs bg-white/30 hover:bg-white/40 px-2 py-1 rounded transition-colors text-white font-medium"
        >
          Cerrar
        </button>
      </div>
    )
  }

  const couples = [
    { name: "TECHERA", users: USERS.filter((u) => u.couple === "TECHERA"), color: "border-blue-500" },
    { name: "CASTRO", users: USERS.filter((u) => u.couple === "CASTRO"), color: "border-green-500" },
    { name: "PEREZ", users: USERS.filter((u) => u.couple === "PEREZ"), color: "border-orange-500" },
  ]

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30">
      <h2 className="text-xl font-bold mb-4 text-center">Selecciona tu usuario</h2>
      <div className="space-y-4">
        {couples.map((couple) => (
          <div key={couple.name} className={`border-2 ${couple.color} rounded-xl p-3 bg-white/5`}>
            <h3 className="text-sm font-bold mb-2 text-center opacity-80">Pareja {couple.name}</h3>
            <div className="grid grid-cols-2 gap-2">
              {couple.users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user)
                    setShowSelector(false)
                  }}
                  className={`${user.color} hover:opacity-90 rounded-lg p-3 transition-all text-center relative text-white`}
                >
                  {user.role === "admin" && <div className="absolute top-1 right-1 text-lg">👑</div>}
                  <div className="text-2xl mb-1">👤</div>
                  <div className="font-bold text-sm">{user.name}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-center mt-4 opacity-70">👑 = Administrador (puede editar todo)</p>
    </div>
  )
}
