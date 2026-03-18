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

// Unidad base: siempre por persona
const perPerson = (e: DailyExpense) => e.amountPerPerson ?? e.amountPerCouple / 2

const fmt = (n: number) =>
  n % 1 === 0 ? `€${n}` : `€${n.toFixed(2)}`

export function BudgetSection({ budget, currentUser, onBack, onUpdateBudget }: BudgetSectionProps) {
  const [activeTab, setActiveTab] = useState<"resumen" | "paseos" | "locomocion" | "alojamiento" | "comida">("resumen")
  const [editingEventId, setEditingEventId] = useState<number | null>(null)
  const [editingEventAmount, setEditingEventAmount] = useState<string>("")

  // Deduplicar por ID para evitar claves duplicadas si el localStorage tiene datos viejos
  const uniqueExpenses = budget.dailyExpenses.filter(
    (e, idx, arr) => arr.findIndex((x) => x.id === e.id) === idx
  )

  const transportExpenses = uniqueExpenses.filter((e) => e.category === "transporte" || e.category === "vuelo")
  const eventExpenses = uniqueExpenses.filter((e) => e.category === "museo")
  const alojamientoExpenses = uniqueExpenses.filter((e) => e.category === "alojamiento")
  const comidaExpenses = uniqueExpenses.filter((e) => e.category === "alimentacion")
  const otrosExpenses = uniqueExpenses.filter((e) => e.category === "otros" || e.category === "otro")

  // Todos los totales en € por persona
  const totalEventos = eventExpenses.reduce((sum, e) => sum + perPerson(e), 0)
  const totalTransporte = transportExpenses.reduce((sum, e) => sum + perPerson(e), 0)
  const totalAlojamiento = alojamientoExpenses.reduce((sum, e) => sum + perPerson(e), 0)
  const totalAlimentacion = comidaExpenses.reduce((sum, e) => sum + perPerson(e), 0)
  const totalOtros = otrosExpenses.reduce((sum, e) => sum + perPerson(e), 0)
  const totalPerPerson = uniqueExpenses.reduce((sum, e) => sum + perPerson(e), 0)

  const handleSaveEventCost = (expenseId: number) => {
    const newAmountPerPerson = parseFloat(editingEventAmount)
    if (isNaN(newAmountPerPerson) || newAmountPerPerson < 0) return
    const updated = budget.dailyExpenses.map((e) =>
      e.id === expenseId
        ? {
            ...e,
            amountPerPerson: newAmountPerPerson,
            amountPerCouple: newAmountPerPerson * 2,
            totalAmount: newAmountPerPerson * 4,
          }
        : e,
    )
    const newTotalPerPerson = updated.reduce((s, e) => s + perPerson(e), 0)
    onUpdateBudget({
      dailyExpenses: updated,
      totalPerCouple: newTotalPerPerson * 2,
      totalGeneral: newTotalPerPerson * 4,
    })
    setEditingEventId(null)
  }

  // Resumen de alojamiento agrupado por ciudad
  const alojByCity: Record<string, { nights: number; totalPerPerson: number; address: string }> = {}
  for (const e of alojamientoExpenses) {
    const cityMatch = e.description.match(/^([^-]+)/)
    const city = cityMatch ? cityMatch[1].trim() : "Otro"
    if (!alojByCity[city]) alojByCity[city] = { nights: 0, totalPerPerson: 0, address: e.notes ?? "" }
    alojByCity[city].nights += 1
    alojByCity[city].totalPerPerson += perPerson(e)
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors">
        ← Volver al Menú
      </button>

      <h2 className="text-xl font-bold">Presupuesto del Viaje</h2>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            { id: "resumen",      label: "Resumen",     color: "bg-blue-500" },
            { id: "paseos",       label: "Paseos",      color: "bg-pink-500" },
            { id: "locomocion",   label: "Locomocion",  color: "bg-yellow-500" },
            { id: "alojamiento",  label: "Alojamiento", color: "bg-green-500" },
            { id: "comida",       label: "Comida",      color: "bg-orange-500" },
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

      {/* ── RESUMEN ── */}
      {activeTab === "resumen" && (
        <div className="space-y-3">
          {/* Hero: por persona */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <h3 className="text-sm mb-1 text-white/70">Total por Persona</h3>
            <div className="text-4xl font-bold">{fmt(Math.round(totalPerPerson))}</div>
            <div className="text-xs text-white/50 mt-1">
              {fmt(Math.round(totalPerPerson * 2))} por pareja · {fmt(Math.round(totalPerPerson * 4))} entre 2 parejas
            </div>
          </div>

          {/* Grid 2x2 por persona */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-pink-500/20 rounded-xl p-3 border border-pink-400/30">
              <div className="text-xs text-white/60 mb-1">Paseos / Entradas</div>
              <div className="text-2xl font-bold text-pink-300">{fmt(Math.round(totalEventos))}</div>
              <div className="text-xs text-white/50">por persona</div>
            </div>
            <div className="bg-yellow-500/20 rounded-xl p-3 border border-yellow-400/30">
              <div className="text-xs text-white/60 mb-1">Locomocion</div>
              <div className="text-2xl font-bold text-yellow-300">{fmt(Math.round(totalTransporte))}</div>
              <div className="text-xs text-white/50">por persona</div>
            </div>
            <div className="bg-green-500/20 rounded-xl p-3 border border-green-400/30">
              <div className="text-xs text-white/60 mb-1">Alojamiento</div>
              <div className="text-2xl font-bold text-green-300">{fmt(Math.round(totalAlojamiento))}</div>
              <div className="text-xs text-white/50">por persona · 21 noches</div>
            </div>
            <div className="bg-orange-500/20 rounded-xl p-3 border border-orange-400/30">
              <div className="text-xs text-white/60 mb-1">Comida</div>
              <div className="text-2xl font-bold text-orange-300">{fmt(Math.round(totalAlimentacion))}</div>
              <div className="text-xs text-white/50">€40/dia · 21 dias</div>
            </div>
          </div>

          {totalOtros > 0 && (
            <div className="bg-white/10 rounded-xl p-3 flex justify-between items-center">
              <span className="text-sm text-white/70">Otros (lockers, extras)</span>
              <div className="text-right">
                <span className="font-bold">{fmt(Math.round(totalOtros))}</span>
                <div className="text-xs text-white/50">por persona</div>
              </div>
            </div>
          )}

          {/* Desglose final en pareja */}
          <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-400/30 text-xs text-white/60 space-y-1.5">
            <div className="font-semibold text-white/80 mb-2 text-sm">Resumen por pareja (x2 personas):</div>
            <div className="flex justify-between">
              <span>Paseos/Entradas</span>
              <span className="font-bold text-white">{fmt(Math.round(totalEventos * 2))}</span>
            </div>
            <div className="flex justify-between">
              <span>Locomocion</span>
              <span className="font-bold text-white">{fmt(Math.round(totalTransporte * 2))}</span>
            </div>
            <div className="flex justify-between">
              <span>Alojamiento</span>
              <span className="font-bold text-white">{fmt(Math.round(totalAlojamiento * 2))}</span>
            </div>
            <div className="flex justify-between">
              <span>Comida</span>
              <span className="font-bold text-white">{fmt(Math.round(totalAlimentacion * 2))}</span>
            </div>
            {totalOtros > 0 && (
              <div className="flex justify-between">
                <span>Otros</span>
                <span className="font-bold text-white">{fmt(Math.round(totalOtros * 2))}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-white/20 pt-1.5 mt-1">
              <span className="font-semibold text-white/90">TOTAL POR PAREJA</span>
              <span className="font-bold text-white text-base">{fmt(Math.round(totalPerPerson * 2))}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-1 mt-0.5 text-white/40">
              <span>Total 2 parejas</span>
              <span className="font-bold text-white/60">{fmt(Math.round(totalPerPerson * 4))}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── PASEOS ── */}
      {activeTab === "paseos" && (
        <div className="space-y-4">
          <div className="bg-pink-500/20 backdrop-blur-lg rounded-xl p-4 text-center border border-pink-400/30">
            <h3 className="text-sm mb-1 text-white/70">Total Paseos y Entradas</h3>
            <div className="text-3xl font-bold text-pink-300">{fmt(Math.round(totalEventos))}</div>
            <div className="text-xs text-white/60 mt-1">por persona · {fmt(Math.round(totalEventos * 2))} por pareja</div>
          </div>
          <p className="text-xs text-white/60 bg-white/5 rounded-lg p-2">
            Toca ✏️ para corregir el precio si el sitio oficial muestra un valor diferente.
          </p>
          <div className="space-y-2">
            {eventExpenses.map((expense, idx) => {
              const d = new Date(expense.date + "T12:00:00")
              const pp = perPerson(expense)
              const isEditing = editingEventId === expense.id
              return (
                <div key={`event-${expense.id}-${idx}`} className="bg-pink-500/15 rounded-xl p-3 border border-pink-400/20">
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
                          <button onClick={() => handleSaveEventCost(expense.id)} className="bg-green-500 hover:bg-green-600 px-2 py-1 rounded text-xs">OK</button>
                          <button onClick={() => setEditingEventId(null)} className="bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded text-xs">X</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-bold">{fmt(pp)}</div>
                            <div className="text-xs text-white/50">por persona</div>
                          </div>
                          <button
                            onClick={() => { setEditingEventId(expense.id); setEditingEventAmount(String(pp)) }}
                            className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs transition-colors"
                            title="Editar precio"
                          >✏️</button>
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

      {/* ── LOCOMOCION ── */}
      {activeTab === "locomocion" && (
        <div className="space-y-4">
          <div className="bg-yellow-500/20 backdrop-blur-lg rounded-xl p-4 text-center border border-yellow-400/30">
            <h3 className="text-sm mb-1 text-white/70">Total Locomocion</h3>
            <div className="text-3xl font-bold text-yellow-300">{fmt(Math.round(totalTransporte))}</div>
            <div className="text-xs text-white/60 mt-1">por persona · {fmt(Math.round(totalTransporte * 2))} por pareja</div>
          </div>
          <div className="space-y-2">
            {transportExpenses.map((expense, idx) => {
              const d = new Date(expense.date + "T12:00:00")
              const icon = expense.category === "vuelo" ? "✈️" : "🚂"
              const pp = perPerson(expense)
              return (
                <div key={`transport-${expense.id}-${idx}`} className="bg-yellow-500/15 rounded-xl p-3 border border-yellow-400/20 flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{expense.description}</div>
                    <div className="text-xs text-white/50">
                      {d.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                    </div>
                    {expense.notes && <div className="text-xs text-white/50 mt-0.5">{expense.notes}</div>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold">{fmt(pp)}</div>
                    <div className="text-xs text-white/50">por persona</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── ALOJAMIENTO ── */}
      {activeTab === "alojamiento" && (
        <div className="space-y-4">
          <div className="bg-green-500/20 backdrop-blur-lg rounded-xl p-4 text-center border border-green-400/30">
            <h3 className="text-sm mb-1 text-white/70">Total Alojamiento</h3>
            <div className="text-3xl font-bold text-green-300">{fmt(Math.round(totalAlojamiento))}</div>
            <div className="text-xs text-white/60 mt-1">
              por persona · {fmt(Math.round(totalAlojamiento * 2))} por pareja · 21 noches
            </div>
          </div>

          {/* Resumen agrupado por ciudad */}
          <div className="space-y-2">
            {Object.entries(alojByCity).map(([city, data]) => (
              <div key={city} className="bg-green-500/15 rounded-xl p-3 border border-green-400/20">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{city}</div>
                    <div className="text-xs text-white/50">{data.nights} noche{data.nights !== 1 ? "s" : ""}</div>
                    {data.address && <div className="text-xs text-white/40 mt-0.5 truncate">{data.address.split(".")[0]}</div>}
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <div className="font-bold text-green-300">{fmt(parseFloat(data.totalPerPerson.toFixed(2)))}</div>
                    <div className="text-xs text-white/50">por persona</div>
                    <div className="text-xs text-white/40">{fmt(parseFloat((data.totalPerPerson * 2).toFixed(2)))} / pareja</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Nota confirmados vs estimados */}
          <div className="bg-white/5 rounded-lg p-3 text-xs text-white/50 space-y-1">
            <p className="font-semibold text-white/70">Precios reales (USD ÷ 4 personas × cotización 0.92 USD/EUR):</p>
            <p>Madrid 3n: $461 ÷ 4p = $115.25/p × 0.92 = <span className="text-white/80">€106.03/persona</span></p>
            <p>Barcelona 3n: $684 ÷ 4p = $171/p × 0.92 = <span className="text-white/80">€157.32/persona</span></p>
            <p>París 4n: $762 ÷ 4p = $190.50/p × 0.92 = <span className="text-white/80">€175.26/persona</span></p>
            <p>Milán 2n: $462 ÷ 4p = $115.50/p × 0.92 = <span className="text-white/80">€106.26/persona</span></p>
            <p>Florencia 2n: $482 ÷ 4p = $120.50/p × 0.92 = <span className="text-white/80">€110.86/persona</span></p>
            <p>Roma 3n: $650 ÷ 4p = $162.50/p × 0.92 = <span className="text-white/80">€149.50/persona</span></p>
            <p>Vico Equense 4n: $620 ÷ 4p = $155/p × 0.92 = <span className="text-white/80">€142.60/persona</span></p>
            <p className="pt-1 border-t border-white/10 font-semibold text-white/60">Total alojamiento: $4121 ÷ 4p = $1030.25/p × 0.92 = <span className="text-white/80">€947.83/persona</span></p>
            <p className="text-white/30">Venecia y Napoles: sin alojamiento — visitas de dia / transito</p>
          </div>
        </div>
      )}

      {/* ── COMIDA ── */}
      {activeTab === "comida" && (
        <div className="space-y-4">
          <div className="bg-orange-500/20 backdrop-blur-lg rounded-xl p-4 text-center border border-orange-400/30">
            <h3 className="text-sm mb-1 text-white/70">Total Comida</h3>
            <div className="text-3xl font-bold text-orange-300">{fmt(Math.round(totalAlimentacion))}</div>
            <div className="text-xs text-white/60 mt-1">por persona · {fmt(Math.round(totalAlimentacion * 2))} por pareja</div>
          </div>
          <div className="bg-orange-500/10 rounded-xl p-3 text-sm text-white/70 border border-orange-400/20">
            Presupuesto de comida:{" "}
            <span className="font-bold text-white">€40 por dia por persona</span> (€80/día por pareja). Incluye desayuno, almuerzo y cena.
          </div>
          <div className="space-y-2">
            {comidaExpenses.map((expense, idx) => {
              const d = new Date(expense.date + "T12:00:00")
              const pp = perPerson(expense)
              return (
                <div key={`comida-${expense.id}-${idx}`} className="bg-orange-500/15 rounded-xl p-3 border border-orange-400/20 flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">🍽️</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{expense.description}</div>
                    <div className="text-xs text-white/50">
                      {d.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold">{fmt(pp)}</div>
                    <div className="text-xs text-white/50">por persona</div>
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
