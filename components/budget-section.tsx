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

const perPerson = (e: DailyExpense) => e.amountPerPerson ?? e.amountPerCouple / 2

const fmt = (n: number) => (n % 1 === 0 ? `€${n}` : `€${n.toFixed(2)}`)

// Saldo pendiente = items no pagados
const pendingTotal = (expenses: DailyExpense[]) =>
  expenses.filter((e) => !e.paid).reduce((sum, e) => sum + perPerson(e), 0)

export function BudgetSection({ budget, currentUser, onBack, onUpdateBudget }: BudgetSectionProps) {
  const [activeTab, setActiveTab] = useState<"resumen" | "paseos" | "locomocion" | "alojamiento" | "comida">("resumen")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingAmount, setEditingAmount] = useState<string>("")

  // Deduplicar siempre por ID
  const uniqueExpenses = budget.dailyExpenses.filter(
    (e, i, arr) => arr.findIndex((x) => x.id === e.id) === i
  )

  const transportExpenses = uniqueExpenses
    .filter((e) => e.category === "transporte" || e.category === "vuelo")
    .sort((a, b) => a.date.localeCompare(b.date))

  const eventExpenses = uniqueExpenses
    .filter((e) => e.category === "museo")
    .sort((a, b) => a.date.localeCompare(b.date))

  const alojamientoExpenses = uniqueExpenses
    .filter((e) => e.category === "alojamiento")
    .sort((a, b) => a.date.localeCompare(b.date))

  const comidaExpenses = uniqueExpenses
    .filter((e) => e.category === "alimentacion")
    .sort((a, b) => a.date.localeCompare(b.date))

  const otrosExpenses = uniqueExpenses.filter((e) => e.category === "otros" || e.category === "otro")

  const totalEventos     = eventExpenses.reduce((s, e) => s + perPerson(e), 0)
  const totalTransporte  = transportExpenses.reduce((s, e) => s + perPerson(e), 0)
  const totalAlojamiento = alojamientoExpenses.reduce((s, e) => s + perPerson(e), 0)
  const totalAlimentacion = comidaExpenses.reduce((s, e) => s + perPerson(e), 0)
  const totalOtros       = otrosExpenses.reduce((s, e) => s + perPerson(e), 0)
  const totalPerPerson   = uniqueExpenses.reduce((s, e) => s + perPerson(e), 0)

  // ── helpers ──────────────────────────────────────────────────────────────

  const saveAmount = (id: number) => {
    const val = parseFloat(editingAmount)
    if (isNaN(val) || val < 0) return
    const updated = uniqueExpenses.map((e) =>
      e.id === id
        ? { ...e, amountPerPerson: val, amountPerCouple: val * 2, totalAmount: val * 4 }
        : e
    )
    const newTotal = updated.reduce((s, e) => s + perPerson(e), 0)
    onUpdateBudget({ dailyExpenses: updated, totalPerCouple: newTotal * 2, totalGeneral: newTotal * 4 })
    setEditingId(null)
  }

  const togglePaid = (id: number) => {
    const updated = uniqueExpenses.map((e) => (e.id === id ? { ...e, paid: !e.paid } : e))
    const newTotal = updated.reduce((s, e) => s + perPerson(e), 0)
    onUpdateBudget({ dailyExpenses: updated, totalPerCouple: newTotal * 2, totalGeneral: newTotal * 4 })
  }

  const startEdit = (e: DailyExpense) => {
    setEditingId(e.id)
    setEditingAmount(String(perPerson(e)))
  }

  // ── item card ─────────────────────────────────────────────────────────────

  const ItemCard = ({
    expense,
    idx,
    prefix,
    bg,
    border,
    icon,
  }: {
    expense: DailyExpense
    idx: number
    prefix: string
    bg: string
    border: string
    icon: string
  }) => {
    const isPaid   = expense.paid === true
    const pp       = perPerson(expense)
    const isEdit   = editingId === expense.id
    const d        = new Date(expense.date + "T12:00:00")
    const dateStr  = d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })
    const noPrice  = pp === 0 && !isPaid

    return (
      <div
        key={`${prefix}-${expense.id}-${idx}`}
        className={`rounded-xl p-3 border flex items-start gap-2 transition-opacity ${
          isPaid ? "opacity-50 bg-white/5 border-white/10" : noPrice ? `${bg} ${border} border-dashed` : `${bg} ${border}`
        }`}
      >
        <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>

        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm leading-tight ${isPaid ? "line-through text-white/40" : ""}`}>
            {expense.description}
          </div>
          <div className="text-xs text-white/50 mt-0.5">{dateStr}</div>
          {expense.notes && !isPaid && (
            <div className="text-xs text-white/40 mt-0.5 leading-snug">{expense.notes}</div>
          )}
          {expense.ticketUrl && !isPaid && (
            <a
              href={expense.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 underline mt-1 block"
            >
              Reservar / comprar
            </a>
          )}
          {noPrice && <div className="text-xs text-orange-300 font-semibold mt-1">Precio pendiente</div>}
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {isPaid ? (
            <span className="text-xs bg-green-500/30 text-green-300 px-2 py-0.5 rounded-full font-semibold">
              Pagado
            </span>
          ) : isEdit ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-white/50">€</span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={editingAmount}
                onChange={(e) => setEditingAmount(e.target.value)}
                className="w-16 bg-white/20 rounded px-1.5 py-1 text-sm text-white text-right focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => saveAmount(expense.id)}
                className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs font-bold"
              >
                OK
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs"
              >
                X
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <div className="text-right">
                <div className="font-bold text-white">{pp > 0 ? fmt(pp) : "—"}</div>
                <div className="text-xs text-white/40">/ persona</div>
                {pp > 0 && <div className="text-xs text-white/30">{fmt(pp * 2)} / pareja</div>}
              </div>
              <button
                onClick={() => startEdit(expense)}
                className="bg-white/15 hover:bg-white/25 px-2 py-1 rounded text-xs transition-colors"
                title="Editar precio"
              >
                ✏️
              </button>
            </div>
          )}
          <button
            onClick={() => togglePaid(expense.id)}
            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
              isPaid
                ? "border-white/20 text-white/40 hover:text-white/60"
                : "border-green-400/50 text-green-300 hover:bg-green-500/20"
            }`}
          >
            {isPaid ? "Deshacer" : "Marcar pagado"}
          </button>
        </div>
      </div>
    )
  }

  // ── saldo footer ──────────────────────────────────────────────────────────

  const SaldoFooter = ({ expenses, color }: { expenses: DailyExpense[]; color: string }) => {
    const pagado   = expenses.filter((e) => e.paid).reduce((s, e) => s + perPerson(e), 0)
    const pendiente = pendingTotal(expenses)
    return (
      <div className={`rounded-xl p-3 border ${color} text-sm space-y-1`}>
        <div className="flex justify-between text-white/60">
          <span>Pagado</span>
          <span className="font-semibold text-green-300">{fmt(Math.round(pagado))} / persona · {fmt(Math.round(pagado * 2))} / pareja</span>
        </div>
        <div className="flex justify-between font-bold border-t border-white/10 pt-1">
          <span>Saldo pendiente</span>
          <span className="text-yellow-300">{fmt(Math.round(pendiente))} / persona · {fmt(Math.round(pendiente * 2))} / pareja</span>
        </div>
      </div>
    )
  }

  // ── resumen agrupado alojamiento ──────────────────────────────────────────

  const alojByCity: Record<string, { nights: number; total: number; address: string; paid: boolean }> = {}
  for (const e of alojamientoExpenses) {
    const city = (e.description.match(/^([^-]+)/) || ["", "Otro"])[1].trim()
    if (!alojByCity[city]) alojByCity[city] = { nights: 0, total: 0, address: e.notes ?? "", paid: e.paid === true }
    alojByCity[city].nights += 1
    alojByCity[city].total  += perPerson(e)
    if (!e.paid) alojByCity[city].paid = false
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
      >
        Volver al Menu
      </button>

      <h2 className="text-xl font-bold">Presupuesto del Viaje</h2>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            { id: "resumen",     label: "Resumen",    color: "bg-blue-500"   },
            { id: "paseos",      label: "Paseos",     color: "bg-pink-500"   },
            { id: "locomocion",  label: "Locomocion", color: "bg-yellow-500" },
            { id: "alojamiento", label: "Alojamiento",color: "bg-green-500"  },
            { id: "comida",      label: "Comida",     color: "bg-orange-500" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
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
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <h3 className="text-sm mb-1 text-white/70">Total por Persona</h3>
            <div className="text-4xl font-bold">{fmt(Math.round(totalPerPerson))}</div>
            <div className="text-xs text-white/50 mt-1">
              {fmt(Math.round(totalPerPerson * 2))} por pareja
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Paseos / Entradas", val: totalEventos,      color: "bg-pink-500/20   border-pink-400/30   text-pink-300"   },
              { label: "Locomocion",        val: totalTransporte,   color: "bg-yellow-500/20 border-yellow-400/30 text-yellow-300" },
              { label: "Alojamiento",       val: totalAlojamiento,  color: "bg-green-500/20  border-green-400/30  text-green-300"  },
              { label: "Comida",            val: totalAlimentacion, color: "bg-orange-500/20 border-orange-400/30 text-orange-300" },
            ].map(({ label, val, color }) => {
              const [bg, bdr, txt] = color.split(" ")
              return (
                <div key={label} className={`${bg} rounded-xl p-3 border ${bdr}`}>
                  <div className="text-xs text-white/60 mb-1">{label}</div>
                  <div className={`text-2xl font-bold ${txt}`}>{fmt(Math.round(val))}</div>
                  <div className="text-xs text-white/50">por persona</div>
                </div>
              )
            })}
          </div>

          {totalOtros > 0 && (
            <div className="bg-white/10 rounded-xl p-3 flex justify-between items-center">
              <span className="text-sm text-white/70">Otros</span>
              <div className="text-right">
                <span className="font-bold">{fmt(Math.round(totalOtros))}</span>
                <div className="text-xs text-white/50">por persona</div>
              </div>
            </div>
          )}

          <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-400/30 text-xs text-white/60 space-y-1.5">
            <div className="font-semibold text-white/80 mb-2 text-sm">Saldo pendiente por pareja:</div>
            {[
              { label: "Paseos",      expenses: eventExpenses },
              { label: "Locomocion",  expenses: transportExpenses },
              { label: "Alojamiento", expenses: alojamientoExpenses },
              { label: "Comida",      expenses: comidaExpenses },
            ].map(({ label, expenses }) => {
              const p = pendingTotal(expenses)
              return (
                <div key={label} className="flex justify-between">
                  <span>{label}</span>
                  <span className="font-bold text-yellow-200">{fmt(Math.round(p * 2))}</span>
                </div>
              )
            })}
            <div className="flex justify-between border-t border-white/20 pt-1.5 mt-1">
              <span className="font-semibold text-white/90">TOTAL A PAGAR POR PAREJA</span>
              <span className="font-bold text-yellow-300 text-base">
                {fmt(Math.round(pendingTotal(uniqueExpenses) * 2))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── PASEOS ── */}
      {activeTab === "paseos" && (
        <div className="space-y-3">
          <div className="bg-pink-500/20 rounded-xl p-4 text-center border border-pink-400/30">
            <h3 className="text-sm mb-1 text-white/70">Paseos y Entradas</h3>
            <div className="text-3xl font-bold text-pink-300">{fmt(Math.round(totalEventos))}</div>
            <div className="text-xs text-white/60 mt-1">por persona · {fmt(Math.round(totalEventos * 2))} por pareja</div>
          </div>
          <div className="space-y-2">
            {eventExpenses.map((expense, idx) => (
              <ItemCard
                key={`event-${expense.id}-${idx}`}
                expense={expense}
                idx={idx}
                prefix="event"
                bg="bg-pink-500/15"
                border="border-pink-400/20"
                icon="🎟️"
              />
            ))}
          </div>
          <SaldoFooter expenses={eventExpenses} color="bg-pink-500/10 border-pink-400/20" />
        </div>
      )}

      {/* ── LOCOMOCION ── */}
      {activeTab === "locomocion" && (
        <div className="space-y-3">
          <div className="bg-yellow-500/20 rounded-xl p-4 text-center border border-yellow-400/30">
            <h3 className="text-sm mb-1 text-white/70">Locomocion</h3>
            <div className="text-3xl font-bold text-yellow-300">{fmt(Math.round(totalTransporte))}</div>
            <div className="text-xs text-white/60 mt-1">por persona · {fmt(Math.round(totalTransporte * 2))} por pareja</div>
          </div>
          <div className="space-y-2">
            {transportExpenses.map((expense, idx) => (
              <ItemCard
                key={`transport-${expense.id}-${idx}`}
                expense={expense}
                idx={idx}
                prefix="transport"
                bg="bg-yellow-500/15"
                border="border-yellow-400/20"
                icon={expense.category === "vuelo" ? "✈️" : "🚆"}
              />
            ))}
          </div>
          <SaldoFooter expenses={transportExpenses} color="bg-yellow-500/10 border-yellow-400/20" />
        </div>
      )}

      {/* ── ALOJAMIENTO ── */}
      {activeTab === "alojamiento" && (
        <div className="space-y-3">
          <div className="bg-green-500/20 rounded-xl p-4 text-center border border-green-400/30">
            <h3 className="text-sm mb-1 text-white/70">Alojamiento</h3>
            <div className="text-3xl font-bold text-green-300">{fmt(Math.round(totalAlojamiento))}</div>
            <div className="text-xs text-white/60 mt-1">
              por persona · {fmt(Math.round(totalAlojamiento * 2))} por pareja · 21 noches
            </div>
          </div>

          {/* Resumen por ciudad */}
          <div className="space-y-2">
            {Object.entries(alojByCity).map(([city, data]) => (
              <div key={city} className="bg-green-500/15 rounded-xl p-3 border border-green-400/20 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm ${data.paid ? "line-through text-white/40" : ""}`}>{city}</div>
                  <div className="text-xs text-white/50">{data.nights} noche{data.nights !== 1 ? "s" : ""}</div>
                  {data.address && (
                    <div className="text-xs text-white/40 mt-0.5 truncate">{data.address.split(".")[0]}</div>
                  )}
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <div className="font-bold text-green-300">{fmt(parseFloat(data.total.toFixed(2)))}</div>
                  <div className="text-xs text-white/40">/ persona</div>
                  <div className="text-xs text-white/30">{fmt(parseFloat((data.total * 2).toFixed(2)))} / pareja</div>
                </div>
              </div>
            ))}
          </div>

          <SaldoFooter expenses={alojamientoExpenses} color="bg-green-500/10 border-green-400/20" />
        </div>
      )}

      {/* ── COMIDA ── */}
      {activeTab === "comida" && (
        <div className="space-y-3">
          <div className="bg-orange-500/20 rounded-xl p-4 text-center border border-orange-400/30">
            <h3 className="text-sm mb-1 text-white/70">Comida</h3>
            <div className="text-3xl font-bold text-orange-300">{fmt(Math.round(totalAlimentacion))}</div>
            <div className="text-xs text-white/60 mt-1">por persona · {fmt(Math.round(totalAlimentacion * 2))} por pareja</div>
          </div>
          <div className="space-y-2">
            {comidaExpenses.map((expense, idx) => (
              <ItemCard
                key={`comida-${expense.id}-${idx}`}
                expense={expense}
                idx={idx}
                prefix="comida"
                bg="bg-orange-500/15"
                border="border-orange-400/20"
                icon="🍽️"
              />
            ))}
          </div>
          <SaldoFooter expenses={comidaExpenses} color="bg-orange-500/10 border-orange-400/20" />
        </div>
      )}
    </div>
  )
}
