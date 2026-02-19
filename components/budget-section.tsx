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
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [editingExpense, setEditingExpense] = useState<DailyExpense | null>(null)
  const [activeTab, setActiveTab] = useState<"gastos" | "compartidos" | "transporte" | "eventos">("gastos")
  const [formData, setFormData] = useState({
    date: "",
    category: "otro" as DailyExpense["category"],
    description: "",
    amountPerCouple: 0,
    notes: "",
    paidBy: currentUser?.couple || "CASTRO",
  })

  console.log("[v0] Presupuesto - Total por pareja:", budget.totalPerCouple)
  console.log("[v0] Presupuesto - Total general:", budget.totalGeneral)
  console.log("[v0] Presupuesto - Verificación (x 2 parejas):", budget.totalPerCouple * 2)

  const gastosExpenses = budget.dailyExpenses.filter(
    (e) => e.category === "alojamiento" || e.category === "alimentacion" || e.category === "otros",
  )
  const transportExpenses = budget.dailyExpenses.filter((e) => e.category === "transporte" || e.category === "vuelo")
  const eventExpenses = budget.dailyExpenses.filter((e) => e.category === "museo")

  const getExpensesByTab = () => {
    switch (activeTab) {
      case "gastos":
        return gastosExpenses
      case "transporte":
        return transportExpenses
      case "eventos":
        return eventExpenses
      default:
        return budget.dailyExpenses
    }
  }

  const currentTabExpenses = getExpensesByTab()
  const expensesByDate = currentTabExpenses.reduce(
    (acc, expense) => {
      if (!acc[expense.date]) {
        acc[expense.date] = []
      }
      acc[expense.date].push(expense)
      return acc
    },
    {} as Record<string, DailyExpense[]>,
  )

  const sortedDates = Object.keys(expensesByDate).sort()

  const handleAddExpense = () => {
    const newExpense: DailyExpense = {
      id: Math.max(0, ...budget.dailyExpenses.map((e) => e.id)) + 1,
      date: formData.date,
      category: formData.category,
      description: formData.description,
      amountPerCouple: formData.amountPerCouple,
      totalAmount: formData.amountPerCouple * 2,
      notes: formData.notes,
      paidBy: formData.paidBy,
      addedBy: currentUser?.couple,
      timestamp: Date.now(),
    }

    const newExpenses = [...budget.dailyExpenses, newExpense]
    const newTotalPerCouple = newExpenses.reduce((sum, e) => sum + e.amountPerCouple, 0)
    const newTotalGeneral = newTotalPerCouple * 2

    console.log("[v0] Nuevo gasto - Total por pareja:", newTotalPerCouple)
    console.log("[v0] Nuevo gasto - Total general:", newTotalGeneral)

    onUpdateBudget({
      dailyExpenses: newExpenses,
      totalPerCouple: newTotalPerCouple,
      totalGeneral: newTotalGeneral,
    })

    setIsAddingExpense(false)
    setFormData({
      date: "",
      category: "otro",
      description: "",
      amountPerCouple: 0,
      notes: "",
      paidBy: currentUser?.couple || "TECHERA",
    })
  }

  const handleEditExpense = () => {
    if (!editingExpense) return

    const updatedExpense: DailyExpense = {
      ...editingExpense,
      date: formData.date,
      category: formData.category,
      description: formData.description,
      amountPerCouple: formData.amountPerCouple,
      totalAmount: formData.amountPerCouple * 2,
      notes: formData.notes,
      paidBy: formData.paidBy,
      timestamp: Date.now(),
    }

    const newExpenses = budget.dailyExpenses.map((e) => (e.id === editingExpense.id ? updatedExpense : e))
    const newTotalPerCouple = newExpenses.reduce((sum, e) => sum + e.amountPerCouple, 0)
    const newTotalGeneral = newTotalPerCouple * 2

    onUpdateBudget({
      dailyExpenses: newExpenses,
      totalPerCouple: newTotalPerCouple,
      totalGeneral: newTotalGeneral,
    })

    setEditingExpense(null)
    setFormData({
      date: "",
      category: "otro",
      description: "",
      amountPerCouple: 0,
      notes: "",
      paidBy: currentUser?.couple || "TECHERA",
    })
  }

  const handleDeleteExpense = (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este gasto?")) {
      const newExpenses = budget.dailyExpenses.filter((e) => e.id !== id)
      const newTotalPerCouple = newExpenses.reduce((sum, e) => sum + e.amountPerCouple, 0)
      const newTotalGeneral = newTotalPerCouple * 2

      onUpdateBudget({
        dailyExpenses: newExpenses,
        totalPerCouple: newTotalPerCouple,
        totalGeneral: newTotalGeneral,
      })
    }
  }

  const startEdit = (expense: DailyExpense) => {
    setEditingExpense(expense)
    setFormData({
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amountPerCouple: expense.amountPerCouple,
      notes: expense.notes || "",
      paidBy: expense.paidBy || currentUser?.couple || "CASTRO",
    })
  }

  const calculateSharedExpenses = () => {
    const couples = ["PEREZ", "TECHERA"]
    const paidByCouple: Record<string, number> = {}
    const owedByCouple: Record<string, number> = {}

    couples.forEach((couple) => {
      paidByCouple[couple] = 0
      owedByCouple[couple] = 0
    })

    budget.dailyExpenses.forEach((expense) => {
      if (expense.paidBy && expense.paidBy !== "COMPARTIDO") {
        paidByCouple[expense.paidBy] = (paidByCouple[expense.paidBy] || 0) + expense.totalAmount
      }

      couples.forEach((couple) => {
        owedByCouple[couple] += expense.amountPerCouple
      })
    })

    const balances: Record<string, number> = {}
    couples.forEach((couple) => {
      balances[couple] = paidByCouple[couple] - owedByCouple[couple]
    })

    const debtors = couples.filter((c) => balances[c] < 0).sort((a, b) => balances[a] - balances[b])
    const creditors = couples.filter((c) => balances[c] > 0).sort((a, b) => balances[b] - balances[a])

    const transfers: Array<{ from: string; to: string; amount: number }> = []
    let i = 0
    let j = 0

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i]
      const creditor = creditors[j]
      const debt = Math.abs(balances[debtor])
      const credit = balances[creditor]

      const amount = Math.min(debt, credit)
      transfers.push({ from: debtor, to: creditor, amount: Math.round(amount * 100) / 100 })

      balances[debtor] += amount
      balances[creditor] -= amount

      if (Math.abs(balances[debtor]) < 0.01) i++
      if (Math.abs(balances[creditor]) < 0.01) j++
    }

    return { paidByCouple, owedByCouple, balances, transfers }
  }

  const sharedExpenses = calculateSharedExpenses()

  const getCategoryIcon = (category: DailyExpense["category"]) => {
    switch (category) {
      case "vuelo":
        return "✈️"
      case "alojamiento":
        return "🏨"
      case "alimentacion":
        return "🍽️"
      case "transporte":
        return "🚂"
      case "museo":
        return "🎨"
      default:
        return "💰"
    }
  }

  const getCategoryColor = (category: DailyExpense["category"]) => {
    switch (category) {
      case "vuelo":
        return "bg-blue-500/20"
      case "alojamiento":
        return "bg-purple-500/20"
      case "alimentacion":
        return "bg-green-500/20"
      case "transporte":
        return "bg-yellow-500/20"
      case "museo":
        return "bg-pink-500/20"
      default:
        return "bg-gray-500/20"
    }
  }

  const fixedTransports = [
    {
      id: "vuelo-mvd-mad",
      description: "Vuelo Montevideo → Madrid",
      date: "2026-10-03",
      suggestedTime: "Salida: 22:00 del 3 de octubre",
      amountPerCouple: 2400,
      notes: "Reservar con 6-8 meses de anticipación. Aerolíneas: Iberia, Air Europa, LATAM",
      bookingUrl: "https://www.skyscanner.com",
    },
    {
      id: "tren-mad-bcn",
      description: "Tren AVE Madrid → Barcelona",
      date: "2026-10-07",
      suggestedTime: "Salida: 08:00 - Llegada: 10:30",
      amountPerCouple: 120,
      notes: "Reservar con 2-3 meses de anticipación. Renfe AVE desde Atocha",
      bookingUrl: "https://www.renfe.com",
    },
    {
      id: "vuelo-bcn-par",
      description: "Vuelo Barcelona → París",
      date: "2026-10-09",
      suggestedTime: "Salida: 07:00 - Llegada: 09:00",
      amountPerCouple: 150,
      notes: "Reservar con 3-4 meses de anticipación. Aerolíneas: Vueling, Air France, Iberia",
      bookingUrl: "https://www.skyscanner.com",
    },
    {
      id: "tren-par-zur",
      description: "Tren TGV Lyria París → Zúrich",
      date: "2026-10-12",
      suggestedTime: "Salida: 07:23 - Llegada: 11:34",
      amountPerCouple: 90,
      notes: "Reservar con 2-3 meses de anticipación. TGV Lyria desde Gare de Lyon",
      bookingUrl: "https://www.sbb.ch",
    },
    {
      id: "vuelo-rom-mad",
      description: "Vuelo Roma → Madrid",
      date: "2026-10-24",
      suggestedTime: "Salida: 14:00 - Llegada: 16:30",
      amountPerCouple: 120,
      notes: "Reservar con 3-4 meses de anticipación. Aerolíneas: Iberia, Vueling, Ryanair",
      bookingUrl: "https://www.skyscanner.com",
    },
    {
      id: "vuelo-mad-mvd",
      description: "Vuelo Madrid → Montevideo",
      date: "2026-10-24",
      suggestedTime: "Salida: 23:00 del 24 de octubre",
      amountPerCouple: 0,
      notes: "Ya incluido en el vuelo de ida (ida y vuelta). Mismo billete del día 3",
      bookingUrl: "https://www.skyscanner.com",
    },
  ]

  const totalFixedTransport = fixedTransports.reduce((sum, t) => sum + t.amountPerCouple, 0)

  const totalAlojamiento = gastosExpenses
    .filter((e) => e.category === "alojamiento")
    .reduce((sum, e) => sum + e.amountPerCouple, 0)

  const totalAlimentacion = gastosExpenses
    .filter((e) => e.category === "alimentacion")
    .reduce((sum, e) => sum + e.amountPerCouple, 0)

  const totalOtros = gastosExpenses.filter((e) => e.category === "otros").reduce((sum, e) => sum + e.amountPerCouple, 0)

  const totalGastos = totalAlojamiento + totalAlimentacion + totalOtros

  const totalEventos = eventExpenses.reduce((sum, e) => sum + e.amountPerCouple, 0)

  const totalOtherTransport = transportExpenses
    .filter((e) => e.category !== "vuelo")
    .reduce((sum, e) => sum + e.amountPerCouple, 0)
  // Los vuelos fijos (Montevideo-Madrid, Barcelona-París, Roma-Madrid) ya están en los 2880€
  const totalAllTransport = totalFixedTransport + totalOtherTransport

  const totalCalculado = totalGastos + totalEventos + totalAllTransport

  console.log("[v0] Presupuesto desglosado:")
  console.log("[v0] - Gastos (alojamiento + alimentación + otros):", totalGastos, "€")
  console.log("[v0] - Eventos:", totalEventos, "€")
  console.log("[v0] - Transporte:", totalAllTransport, "€")
  console.log("[v0] - TOTAL CALCULADO:", totalCalculado, "€")
  console.log("[v0] - TOTAL DEL SISTEMA:", budget.totalPerCouple, "€")
  console.log("[v0] - DIFERENCIA:", Math.abs(totalCalculado - budget.totalPerCouple), "€")

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
      >
        ← Volver al Menú
      </button>

      <h2 className="text-xl font-bold">Presupuesto del Viaje</h2>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveTab("gastos")}
          className={`px-3 py-2 rounded-lg transition-colors text-sm ${
            activeTab === "gastos" ? "bg-blue-500" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          Gastos
        </button>
        <button
          onClick={() => setActiveTab("compartidos")}
          className={`px-3 py-2 rounded-lg transition-colors text-sm ${
            activeTab === "compartidos" ? "bg-blue-500" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          Compartidos
        </button>
        <button
          onClick={() => setActiveTab("transporte")}
          className={`px-3 py-2 rounded-lg transition-colors text-sm ${
            activeTab === "transporte" ? "bg-blue-500" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          Transporte
        </button>
        <button
          onClick={() => setActiveTab("eventos")}
          className={`px-3 py-2 rounded-lg transition-colors text-sm ${
            activeTab === "eventos" ? "bg-blue-500" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          Eventos
        </button>
      </div>

      {activeTab === "gastos" && (
        <>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <h3 className="text-sm mb-2 text-white/70">Total Gastos</h3>
            <div className="text-3xl font-bold">€{totalGastos.toLocaleString()}</div>
            <div className="text-xs text-white/60 mt-1">por pareja</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
              <h3 className="text-sm mb-2">Por Pareja</h3>
              <div className="text-xs text-white/70 mb-1">(cada una)</div>
              <div className="text-2xl font-bold">€{budget.totalPerCouple.toLocaleString()}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
              <h3 className="text-sm mb-2">Total General</h3>
              <div className="text-xs text-white/70 mb-1">(2 parejas)</div>
              <div className="text-2xl font-bold">€{budget.totalGeneral.toLocaleString()}</div>
            </div>
          </div>

          {/* Botón agregar gasto */}
          <button
            onClick={() => setIsAddingExpense(true)}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg transition-colors w-full"
          >
            + Agregar Gasto
          </button>

          {/* Formulario agregar/editar */}
          {(isAddingExpense || editingExpense) && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 space-y-3">
              <h3 className="font-bold">{editingExpense ? "Editar Gasto" : "Nuevo Gasto"}</h3>

              <div>
                <label className="text-sm block mb-1">Fecha</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-sm block mb-1">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as DailyExpense["category"] })}
                  className="w-full bg-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="vuelo">✈️ Vuelo</option>
                  <option value="alojamiento">🏨 Alojamiento</option>
                  <option value="alimentacion">🍽️ Alimentación</option>
                  <option value="transporte">🚂 Transporte</option>
                  <option value="museo">🎨 Museo/Entrada</option>
                  <option value="otros">💰 Otros</option>
                </select>
              </div>

              <div>
                <label className="text-sm block mb-1">Descripción</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/20 rounded-lg px-3 py-2 text-white"
                  placeholder="Ej: Vuelo Montevideo-Madrid"
                />
              </div>

              <div>
                <label className="text-sm block mb-1">Monto por Pareja (€)</label>
                <input
                  type="number"
                  value={formData.amountPerCouple}
                  onChange={(e) => setFormData({ ...formData, amountPerCouple: Number(e.target.value) })}
                  className="w-full bg-white/20 rounded-lg px-3 py-2 text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-sm block mb-1">Notas (opcional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white/20 rounded-lg px-3 py-2 text-white"
                  rows={2}
                  placeholder="Notas adicionales..."
                />
              </div>

              <div>
                <label className="text-sm block mb-1">Quién pagó</label>
                <select
                  value={formData.paidBy}
                  onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                  className="w-full bg-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="PEREZ">PEREZ</option>
                  <option value="TECHERA">TECHERA</option>
                  <option value="COMPARTIDO">Compartido (2 parejas)</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={editingExpense ? handleEditExpense : handleAddExpense}
                  className="flex-1 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition-colors"
                >
                  {editingExpense ? "Guardar Cambios" : "Agregar"}
                </button>
                <button
                  onClick={() => {
                    setIsAddingExpense(false)
                    setEditingExpense(null)
                    setFormData({
                      date: "",
                      category: "otro",
                      description: "",
                      amountPerCouple: 0,
                      notes: "",
                      paidBy: currentUser?.couple || "TECHERA",
                    })
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Lista de gastos por día */}
          <div className="space-y-4">
            {sortedDates.map((date) => {
              const dateExpenses = expensesByDate[date]
              const dailyTotal = dateExpenses.reduce((sum, e) => sum + e.amountPerCouple, 0)
              const [year, month, day] = date.split("-")
              const dateObj = new Date(Number(year), Number(month) - 1, Number(day))
              const formattedDate = dateObj.toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })

              return (
                <div key={date} className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold">{formattedDate}</h3>
                    <div className="text-sm">
                      <span className="text-white/70">Total día: </span>
                      <span className="font-bold">€{dailyTotal} por pareja</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {dateExpenses.map((expense) => (
                      <div key={expense.id} className={`${getCategoryColor(expense.category)} rounded-lg p-3`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span>{getCategoryIcon(expense.category)}</span>
                              <span className="font-semibold break-words">{expense.description}</span>
                            </div>
                            {expense.notes && <p className="text-xs text-white/60 break-words">{expense.notes}</p>}
                            {expense.paidBy && (
                              <p className="text-xs text-white/70 mt-1">💳 Pagado por: {expense.paidBy}</p>
                            )}
                            {expense.addedBy && (
                              <p className="text-xs text-white/50">➕ Agregado por: {expense.addedBy}</p>
                            )}
                            <div className="text-sm mt-1">
                              <span className="font-bold">€{expense.amountPerCouple}</span>
                              <span className="text-white/70"> por pareja</span>
                              <span className="text-white/50"> (€{expense.totalAmount} total)</span>
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => startEdit(expense)}
                              className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs transition-colors"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="bg-red-500/30 hover:bg-red-500/50 px-2 py-1 rounded text-xs transition-colors"
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {sortedDates.length === 0 && !isAddingExpense && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
              <p className="text-white/70">No hay gastos registrados aún</p>
            </div>
          )}
        </>
      )}

      {activeTab === "compartidos" && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Resumen de Gastos Compartidos</h3>

          {/* Resumen por pareja */}
          <div className="space-y-3">
            {["CASTRO", "PEREZ", "TECHERA"].map((couple) => (
              <div key={couple} className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <h4 className="font-bold mb-2">{couple}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-white/70">Pagó: </span>
                    <span className="font-bold">€{sharedExpenses.paidByCouple[couple]?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div>
                    <span className="text-white/70">Debe: </span>
                    <span className="font-bold">€{sharedExpenses.owedByCouple[couple]?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-white/70">Balance: </span>
                    <span
                      className={`font-bold ${sharedExpenses.balances[couple] >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {sharedExpenses.balances[couple] >= 0 ? "+" : ""}€
                      {sharedExpenses.balances[couple]?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Transferencias necesarias */}
          {sharedExpenses.transfers.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
              <h4 className="font-bold mb-3">Transferencias para liquidar deudas</h4>
              <div className="space-y-2">
                {sharedExpenses.transfers.map((transfer, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{transfer.from}</span>
                      <span className="text-white/70">→</span>
                      <span className="font-semibold">{transfer.to}</span>
                    </div>
                    <span className="font-bold text-green-400">€{transfer.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sharedExpenses.transfers.length === 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
              <p className="text-white/70">No hay transferencias pendientes</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "transporte" && (
        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <h3 className="text-sm mb-2 text-white/70">Total Transporte</h3>
            <div className="text-3xl font-bold">€{totalAllTransport.toLocaleString()}</div>
            <div className="text-xs text-white/60 mt-1">por pareja</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
              <h3 className="text-sm mb-2">Por Pareja</h3>
              <div className="text-xs text-white/70 mb-1">(cada una)</div>
              <div className="text-2xl font-bold">€{budget.totalPerCouple.toLocaleString()}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
              <h3 className="text-sm mb-2">Total General</h3>
              <div className="text-xs text-white/70 mb-1">(2 parejas)</div>
              <div className="text-2xl font-bold">€{budget.totalGeneral.toLocaleString()}</div>
            </div>
          </div>

          <h3 className="text-lg font-bold">Transportes Fijos (No Modificables)</h3>
          <p className="text-sm text-white/70">
            Estos transportes son la estructura base del viaje. Reservar con anticipación para mejores precios.
          </p>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm text-white/70 mb-1">Transportes Fijos</h4>
                <div className="text-xl font-bold">€{totalFixedTransport.toLocaleString()} por pareja</div>
              </div>
              <div>
                <h4 className="text-sm text-white/70 mb-1">Otros Transportes</h4>
                <div className="text-xl font-bold">€{totalOtherTransport.toLocaleString()} por pareja</div>
              </div>
              <div className="border-t border-white/20 pt-3">
                <h4 className="text-sm text-white/70 mb-1">Total Transporte</h4>
                <div className="text-2xl font-bold">€{totalAllTransport.toLocaleString()} por pareja</div>
                <div className="text-sm text-white/70">
                  €{(totalAllTransport * 3).toLocaleString()} total (3 parejas)
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {fixedTransports.map((transport) => (
              <div key={transport.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">{transport.description}</h4>
                    <div className="text-sm text-white/70 mb-1">
                      📅 {new Date(transport.date).toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
                    </div>
                    <div className="text-sm text-blue-300 mb-2">🕐 {transport.suggestedTime}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-bold">€{transport.amountPerCouple}</div>
                    <div className="text-xs text-white/70">por pareja</div>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-sm space-y-2">
                  <p className="text-white/90">💡 {transport.notes}</p>
                  <a
                    href={transport.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    🔗 Reservar aquí
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-yellow-500/20 backdrop-blur-lg rounded-xl p-4 border border-yellow-500/30">
            <h4 className="font-bold mb-2">⚠️ Importante</h4>
            <ul className="text-sm space-y-1 text-white/90">
              <li>• Reservar vuelos con 6-8 meses de anticipación</li>
              <li>• Reservar trenes con 2-3 meses de anticipación</li>
              <li>• Los horarios son sugeridos, pueden variar según disponibilidad</li>
              <li>• Modificar estos transportes puede afectar todo el itinerario</li>
            </ul>
          </div>

          <h3 className="text-lg font-bold mt-6">Otros Transportes</h3>
          <p className="text-sm text-white/70 mb-3">
            Transportes internos y locales (trenes regionales, ferries, lockers)
          </p>
          <div className="space-y-2">
            {transportExpenses
              .filter((e) => e.category !== "vuelo")
              .map((expense) => (
                <div key={expense.id} className="bg-yellow-500/20 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span>🚂</span>
                        <span className="font-semibold">{expense.description}</span>
                      </div>
                      {expense.notes && <p className="text-xs text-white/60">{expense.notes}</p>}
                      <div className="text-sm mt-1">
                        <span className="font-bold">€{expense.amountPerCouple}</span>
                        <span className="text-white/70"> por pareja</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {activeTab === "eventos" && (
        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <h3 className="text-sm mb-2 text-white/70">Total Eventos</h3>
            <div className="text-3xl font-bold">€{totalEventos.toLocaleString()}</div>
            <div className="text-xs text-white/60 mt-1">por pareja</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
              <h3 className="text-sm mb-2">Por Pareja</h3>
              <div className="text-xs text-white/70 mb-1">(cada una)</div>
              <div className="text-2xl font-bold">€{budget.totalPerCouple.toLocaleString()}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
              <h3 className="text-sm mb-2">Total General</h3>
              <div className="text-xs text-white/70 mb-1">(2 parejas)</div>
              <div className="text-2xl font-bold">€{budget.totalGeneral.toLocaleString()}</div>
            </div>
          </div>

          <h3 className="text-lg font-bold">Entradas a Museos y Atracciones</h3>
          <p className="text-sm text-white/70">
            Precios oficiales actualizados 2025. Reservar online con anticipación.
          </p>

          <div className="space-y-2">
            {eventExpenses.map((expense) => (
              <div key={expense.id} className="bg-pink-500/20 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span>🎨</span>
                      <span className="font-semibold">{expense.description}</span>
                    </div>
                    {expense.notes && <p className="text-xs text-white/60">{expense.notes}</p>}
                    <div className="text-sm mt-1">
                      <span className="font-bold">€{expense.amountPerCouple}</span>
                      <span className="text-white/70"> por pareja</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
