"use client"

import { useState } from "react"
import type { DailyExpense, User } from "@/types"

interface BudgetSectionProps {
  budget: {
    dailyExpenses: DailyExpense[]
    totalPerCouple: number
    totalGeneral: number
  }
  currentUser: User | null
  onBack: () => void
  onUpdateBudget: (budget: { dailyExpenses: DailyExpense[]; totalPerCouple: number; totalGeneral: number }) => void
}

export function BudgetSection({ budget, currentUser, onBack, onUpdateBudget }: BudgetSectionProps) {
  const [activeTab, setActiveTab] = useState<"resumen" | "paseos" | "locomocion" | "alojamiento" | "comida">("resumen")
  const [editingEventId, setEditingEventId] = useState<number | null>(null)
  const [editingEventAmount, setEditingEventAmount] = useState<string>("")

  const transportExpenses = budget.dailyExpenses.filter((e) => e.category === "transporte" || e.category === "vuelo")
  const eventExpenses = budget.dailyExpenses.filter((e) => e.category === "museo")
  const alojamientoExpenses = budget.dailyExpenses.filter((e) => e.category === "alojamiento")
  const comidaExpenses = budget.dailyExpenses.filter((e) => e.category === "alimentacion")
  const otrosExpenses = budget.dailyExpenses.filter((e) => e.category === "otros")

  const totalEventos = eventExpenses.reduce((sum, e) => sum + e.amountPerCouple, 0)
  const totalTransporte = transportExpenses.reduce((sum, e) => sum + e.amountPerCouple, 0)
  const totalAlojamiento = alojamientoExpenses.reduce((sum, e) => sum + e.amountPerCouple, 0)
  const totalAlimentacion = comidaExpenses.reduce((sum, e) => sum + e.amountPerCouple, 0)
  const totalOtros = otrosExpenses.reduce((sum, e) => sum + e.amountPerCouple, 0)

  const handleSaveEventCost = (expenseId: number) => {
    const newAmount = parseFloat(editingEventAmount)
    if (isNaN(newAmount) || newAmount < 0) return
    const updated = budget.dailyExpenses.map((e) =>
      e.id === expenseId ? { ...e, amountPerCouple: newAmount, totalAmount: newAmount * 2 } : e,
    )
    const newTotal = updated.reduce((s, e) => s + e.amountPerCouple, 0)
    onUpdateBudget({ dailyExpenses: updated, totalPerCouple: newTotal, totalGeneral: newTotal * 2 })
    setEditingEventId(null)
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors">
        ← Volver al Menú
      </button>

      <h2 className="text-xl font-bold">Presupuesto del Viaje</h2>

      <div className="grid grid-cols-3 gap-2">
        {(
          [
            { id: "resumen", label: "Resumen", color: "bg-blue-500" },
            { id: "paseos", label: "Paseos", color: "bg-pink-500" },
            { id: "locomocion", label: "Locomocion", color: "bg-yellow-500" },
            { id: "alojamiento", label: "Alojamiento", color: "bg-green-500" },
            { id: "comida", label: "Comida", color: "bg-orange-500" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2 py-2 rounded-lg transition-colors text-sm font-medium ${
              activeTab === tab.id ? tab.color : "bg-white/10 hover:bg-white/20"
            } ${tab.id === "comida" ? "col-span-2" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "resumen" && (
        <div className="space-y-3">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <h3 className="text-sm mb-1 text-white/70">Total por Pareja</h3>
            <div className="text-4xl font-bold">€{budget.totalPerCouple.toLocaleString()}</div>
            <div className="text-xs text-white/50 mt-1">€{budget.totalGeneral.toLocaleString()} entre 2 parejas</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-pink-500/20 rounded-xl p-3 border border-pink-400/30">
              <div className="text-xs text-white/60 mb-1">Paseos / Entradas</div>
              <div className="text-2xl font-bold text-pink-300">€{totalEventos.toLocaleString()}</div>
              <div className="text-xs text-white/50">por pareja</div>
            </div>
            <div className="bg-yellow-500/20 rounded-xl p-3 border border-yellow-400/30">
              <div className="text-xs text-white/60 mb-1">Locomocion</div>
              <div className="text-2xl font-bold text-yellow-300">€{totalTransporte.toLocaleString()}</div>
              <div className="text-xs text-white/50">por pareja</div>
            </div>
            <div className="bg-green-500/20 rounded-xl p-3 border border-green-400/30">
              <div className="text-xs text-white/60 mb-1">Alojamiento</div>
              <div className="text-2xl font-bold text-green-300">€{totalAlojamiento.toLocaleString()}</div>
              <div className="text-xs text-white/50">por pareja</div>
            </div>
            <div className="bg-orange-500/20 rounded-xl p-3 border border-orange-400/30">
              <div className="text-xs text-white/60 mb-1">Comida</div>
              <div className="text-2xl font-bold text-orange-300">€{totalAlimentacion.toLocaleString()}</div>
              <div className="text-xs text-white/50">€80/dia · 21 dias</div>
            </div>
          </div>

          {totalOtros > 0 && (
            <div className="bg-white/10 rounded-xl p-3 flex justify-between items-center">
              <span className="text-sm text-white/70">Otros (lockers, extras)</span>
              <span className="font-bold">€{totalOtros}</span>
            </div>
          )}

          <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-400/30 text-xs text-white/60 space-y-1.5">
            <div className="font-semibold text-white/80 mb-2 text-sm">Desglose total entre 2 parejas:</div>
            <div className="flex justify-between">
              <span>Paseos/Entradas x2</span>
              <span className="font-bold text-white">€{(totalEventos * 2).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Locomocion x2</span>
              <span className="font-bold text-white">€{(totalTransporte * 2).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Alojamiento x2</span>
              <span className="font-bold text-white">€{(totalAlojamiento * 2).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Comida x2</span>
              <span className="font-bold text-white">€{(totalAlimentacion * 2).toLocaleString()}</span>
            </div>
            {totalOtros > 0 && (
              <div className="flex justify-between">
                <span>Otros x2</span>
                <span className="font-bold text-white">€{(totalOtros * 2).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-white/20 pt-1.5 mt-1">
              <span className="font-semibold text-white/90">TOTAL GENERAL</span>
              <span className="font-bold text-white text-base">€{budget.totalGeneral.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "paseos" && (
        <div className="space-y-4">
          <div className="bg-pink-500/20 backdrop-blur-lg rounded-xl p-4 text-center border border-pink-400/30">
            <h3 className="text-sm mb-1 text-white/70">Total Paseos y Entradas</h3>
            <div className="text-3xl font-bold text-pink-300">€{totalEventos.toLocaleString()}</div>
            <div className="text-xs text-white/60 mt-1">
              por pareja · €{(totalEventos * 2).toLocaleString()} entre 2 parejas
            </div>
          </div>
          <p className="text-xs text-white/60 bg-white/5 rounded-lg p-2">
            Toca el icono ✏️ para corregir el precio si el sitio web muestra un valor diferente al presupuestado.
          </p>
          <div className="space-y-2">
            {eventExpenses.map((expense) => {
              const d = new Date(expense.date + "T12:00:00")
              const isEditing = editingEventId === expense.id
              return (
                <div key={expense.id} className="bg-pink-500/15 rounded-xl p-3 border border-pink-400/20">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{expense.description}</div>
                      <div className="text-xs text-white/50">
                        {d.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                      </div>
                      {expense.notes && <div className="text-xs text-white/50 mt-0.5">{expense.notes}</div>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-white/50">€</span>
                          <input
                            type="number"
                            value={editingEventAmount}
                            onChange={(e) => setEditingEventAmount(e.target.value)}
                            className="w-16 bg-white/20 rounded px-2 py-1 text-sm text-white text-right"
                            min="0"
                            step="0.5"
                          />
                          <button
                            onClick={() => handleSaveEventCost(expense.id)}
                            className="bg-green-500 hover:bg-green-600 px-2 py-1 rounded text-xs"
                          >
                            OK
                          </button>
                          <button
                            onClick={() => setEditingEventId(null)}
                            className="bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded text-xs"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-bold">€{expense.amountPerCouple}</div>
                            <div className="text-xs text-white/50">por pareja</div>
                          </div>
                          <button
                            onClick={() => {
                              setEditingEventId(expense.id)
                              setEditingEventAmount(String(expense.amountPerCouple))
                            }}
                            className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs transition-colors"
                            title="Editar precio"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === "locomocion" && (
        <div className="space-y-4">
          <div className="bg-yellow-500/20 backdrop-blur-lg rounded-xl p-4 text-center border border-yellow-400/30">
            <h3 className="text-sm mb-1 text-white/70">Total Locomocion</h3>
            <div className="text-3xl font-bold text-yellow-300">€{totalTransporte.toLocaleString()}</div>
            <div className="text-xs text-white/60 mt-1">
              por pareja · €{(totalTransporte * 2).toLocaleString()} entre 2 parejas
            </div>
          </div>
          <div className="space-y-2">
            {transportExpenses.map((expense) => {
              const d = new Date(expense.date + "T12:00:00")
              const icon = expense.category === "vuelo" ? "✈️" : "🚂"
              return (
                <div
                  key={expense.id}
                  className="bg-yellow-500/15 rounded-xl p-3 border border-yellow-400/20 flex items-start gap-2"
                >
                  <span className="text-lg flex-shrink-0">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{expense.description}</div>
                    <div className="text-xs text-white/50">
                      {d.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                    </div>
                    {expense.notes && <div className="text-xs text-white/50 mt-0.5">{expense.notes}</div>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold">€{expense.amountPerCouple}</div>
                    <div className="text-xs text-white/50">por pareja</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === "alojamiento" && (
        <div className="space-y-4">
          <div className="bg-green-500/20 backdrop-blur-lg rounded-xl p-4 text-center border border-green-400/30">
            <h3 className="text-sm mb-1 text-white/70">Total Alojamiento</h3>
            <div className="text-3xl font-bold text-green-300">€{totalAlojamiento.toLocaleString()}</div>
            <div className="text-xs text-white/60 mt-1">
              por pareja · €{(totalAlojamiento * 2).toLocaleString()} entre 2 parejas
            </div>
          </div>
          <div className="space-y-2">
            {alojamientoExpenses.map((expense) => {
              const d = new Date(expense.date + "T12:00:00")
              return (
                <div
                  key={expense.id}
                  className="bg-green-500/15 rounded-xl p-3 border border-green-400/20 flex items-start gap-2"
                >
                  <span className="text-lg flex-shrink-0">🏨</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{expense.description}</div>
                    <div className="text-xs text-white/50">
                      {d.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                    </div>
                    {expense.notes && <div className="text-xs text-white/50 mt-0.5">{expense.notes}</div>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold">€{expense.amountPerCouple}</div>
                    <div className="text-xs text-white/50">por pareja</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === "comida" && (
        <div className="space-y-4">
          <div className="bg-orange-500/20 backdrop-blur-lg rounded-xl p-4 text-center border border-orange-400/30">
            <h3 className="text-sm mb-1 text-white/70">Total Comida</h3>
            <div className="text-3xl font-bold text-orange-300">€{totalAlimentacion.toLocaleString()}</div>
            <div className="text-xs text-white/60 mt-1">€80/dia por pareja · 21 dias</div>
          </div>
          <div className="bg-orange-500/10 rounded-xl p-3 text-sm text-white/70 border border-orange-400/20">
            Presupuesto de comida:{" "}
            <span className="font-bold text-white">€80 por dia por pareja</span>. Incluye desayuno, almuerzo y cena. En
            ciudades mas caras (Paris) puede ajustarse.
          </div>
          <div className="space-y-2">
            {comidaExpenses.map((expense) => {
              const d = new Date(expense.date + "T12:00:00")
              return (
                <div
                  key={expense.id}
                  className="bg-orange-500/15 rounded-xl p-3 border border-orange-400/20 flex items-start gap-2"
                >
                  <span className="text-lg flex-shrink-0">🍽️</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{expense.description}</div>
                    <div className="text-xs text-white/50">
                      {d.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold">€{expense.amountPerCouple}</div>
                    <div className="text-xs text-white/50">por pareja</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
