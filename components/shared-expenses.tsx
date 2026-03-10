"use client"

import { useState } from "react"
import { ArrowLeft, Plus, DollarSign, ArrowRightLeft, CheckCircle, Trash2 } from "lucide-react"

interface SharedExpense {
  id: number
  date: string
  description: string
  amount: number
  paidBy: "TECHERA" | "PEREZ"
  currency: "EUR" | "USD"
  timestamp: number
}

interface Settlement {
  id: number
  date: string
  amount: number
  fromCouple: "TECHERA" | "PEREZ"
  toCouple: "TECHERA" | "PEREZ"
  notes: string
  timestamp: number
}

interface SharedExpensesProps {
  onBack: () => void
}

const STORAGE_KEY_EXPENSES = "sharedExpenses_v1"
const STORAGE_KEY_SETTLEMENTS = "sharedSettlements_v1"

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key)
    if (saved) return JSON.parse(saved)
  } catch {}
  return fallback
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {}
}

export function SharedExpenses({ onBack }: SharedExpensesProps) {
  const [expenses, setExpenses] = useState<SharedExpense[]>(() =>
    loadFromStorage<SharedExpense[]>(STORAGE_KEY_EXPENSES, [])
  )
  const [settlements, setSettlements] = useState<Settlement[]>(() =>
    loadFromStorage<Settlement[]>(STORAGE_KEY_SETTLEMENTS, [])
  )
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddSettlement, setShowAddSettlement] = useState(false)

  const [expForm, setExpForm] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    paidBy: "TECHERA" as "TECHERA" | "PEREZ",
    currency: "EUR" as "EUR" | "USD",
  })

  const [settleForm, setSettleForm] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    fromCouple: "PEREZ" as "TECHERA" | "PEREZ",
    toCouple: "TECHERA" as "TECHERA" | "PEREZ",
    notes: "",
  })

  const addExpense = () => {
    if (!expForm.description || !expForm.amount || Number(expForm.amount) <= 0) return
    const newExp: SharedExpense = {
      id: Date.now(),
      date: expForm.date,
      description: expForm.description,
      amount: Number(expForm.amount),
      paidBy: expForm.paidBy,
      currency: expForm.currency,
      timestamp: Date.now(),
    }
    const updated = [...expenses, newExp]
    setExpenses(updated)
    saveToStorage(STORAGE_KEY_EXPENSES, updated)
    setExpForm({ date: new Date().toISOString().split("T")[0], description: "", amount: "", paidBy: "TECHERA", currency: "EUR" })
    setShowAddExpense(false)
  }

  const deleteExpense = (id: number) => {
    if (!confirm("Eliminar este gasto?")) return
    const updated = expenses.filter((e) => e.id !== id)
    setExpenses(updated)
    saveToStorage(STORAGE_KEY_EXPENSES, updated)
  }

  const addSettlement = () => {
    if (!settleForm.amount || Number(settleForm.amount) <= 0) return
    const newSettle: Settlement = {
      id: Date.now(),
      date: settleForm.date,
      amount: Number(settleForm.amount),
      fromCouple: settleForm.fromCouple,
      toCouple: settleForm.toCouple,
      notes: settleForm.notes,
      timestamp: Date.now(),
    }
    const updated = [...settlements, newSettle]
    setSettlements(updated)
    saveToStorage(STORAGE_KEY_SETTLEMENTS, updated)
    setSettleForm({ date: new Date().toISOString().split("T")[0], amount: "", fromCouple: "PEREZ", toCouple: "TECHERA", notes: "" })
    setShowAddSettlement(false)
  }

  const deleteSettlement = (id: number) => {
    if (!confirm("Eliminar este pago?")) return
    const updated = settlements.filter((s) => s.id !== id)
    setSettlements(updated)
    saveToStorage(STORAGE_KEY_SETTLEMENTS, updated)
  }

  // Balance calculation
  // Each expense: payer paid full amount, other couple owes half
  // Total owed by PEREZ to TECHERA = sum(expenses paid by TECHERA) / 2 - sum(expenses paid by PEREZ) / 2
  const techPaid = expenses.filter((e) => e.paidBy === "TECHERA").reduce((s, e) => s + e.amount, 0)
  const perezPaid = expenses.filter((e) => e.paidBy === "PEREZ").reduce((s, e) => s + e.amount, 0)

  // Each couple owes half of total
  const totalAll = techPaid + perezPaid
  const eachOwes = totalAll / 2

  // TECHERA balance = what techera paid - what techera owes
  const techeraBalance = techPaid - eachOwes // positive = PEREZ owes TECHERA
  const perezBalance = perezPaid - eachOwes // positive = TECHERA owes PEREZ

  // Net: who owes whom before settlements
  // If techeraBalance > 0: PEREZ owes TECHERA that amount
  // If perezBalance > 0: TECHERA owes PEREZ that amount

  let netDebt = 0 // positive = PEREZ owes TECHERA, negative = TECHERA owes PEREZ
  netDebt = techPaid - eachOwes // = (techPaid - perezPaid) / 2

  // Apply settlements
  const settlementsNetPEREZ = settlements
    .filter((s) => s.fromCouple === "PEREZ" && s.toCouple === "TECHERA")
    .reduce((s, x) => s + x.amount, 0)
  const settlementsNetTECHERA = settlements
    .filter((s) => s.fromCouple === "TECHERA" && s.toCouple === "PEREZ")
    .reduce((s, x) => s + x.amount, 0)

  const adjustedDebt = netDebt - settlementsNetPEREZ + settlementsNetTECHERA
  // adjustedDebt > 0: PEREZ still owes TECHERA
  // adjustedDebt < 0: TECHERA owes PEREZ

  const debtorCouple = adjustedDebt > 0 ? "PEREZ" : "TECHERA"
  const creditorCouple = adjustedDebt > 0 ? "TECHERA" : "PEREZ"
  const absDebt = Math.abs(adjustedDebt)

  const sortedExpenses = [...expenses].sort((a, b) => b.timestamp - a.timestamp)
  const sortedSettlements = [...settlements].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <h2 className="text-lg font-bold">Gastos Compartidos</h2>
        <div className="w-20" />
      </div>

      {/* Balance summary */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 space-y-3">
        <h3 className="text-sm font-bold text-white/80 uppercase tracking-wide">Balance actual</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-500/20 rounded-xl p-3 text-center border border-blue-400/30">
            <div className="text-xs text-white/60 mb-1">TECHERA pagó</div>
            <div className="text-2xl font-bold">{techPaid.toFixed(0)}</div>
            <div className="text-xs text-white/50">en total</div>
          </div>
          <div className="bg-purple-500/20 rounded-xl p-3 text-center border border-purple-400/30">
            <div className="text-xs text-white/60 mb-1">PEREZ pagó</div>
            <div className="text-2xl font-bold">{perezPaid.toFixed(0)}</div>
            <div className="text-xs text-white/50">en total</div>
          </div>
        </div>

        {absDebt < 0.5 ? (
          <div className="bg-green-500/20 rounded-xl p-4 text-center border border-green-400/30 flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="font-bold text-green-300">Cuentas saldadas. Sin deuda.</span>
          </div>
        ) : (
          <div className="bg-amber-500/20 rounded-xl p-4 border border-amber-400/30">
            <div className="text-center">
              <div className="text-xs text-white/60 mb-1">Deuda pendiente</div>
              <div className="text-3xl font-bold text-amber-300">{absDebt.toFixed(2)}</div>
              <div className="text-sm mt-1">
                <span className="font-bold text-red-300">{debtorCouple}</span>
                <span className="text-white/70"> le debe a </span>
                <span className="font-bold text-green-300">{creditorCouple}</span>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-white/50 text-center">
          Total entre todos: {totalAll.toFixed(2)} · Cada pareja deberia pagar: {eachOwes.toFixed(2)}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => { setShowAddExpense(true); setShowAddSettlement(false) }}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-3 rounded-xl transition-colors font-semibold"
        >
          <Plus className="w-4 h-4" />
          Agregar Gasto
        </button>
        <button
          onClick={() => { setShowAddSettlement(true); setShowAddExpense(false) }}
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 px-4 py-3 rounded-xl transition-colors font-semibold"
        >
          <ArrowRightLeft className="w-4 h-4" />
          Saldar Deuda
        </button>
      </div>

      {/* Add expense form */}
      {showAddExpense && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 space-y-3 border border-white/20">
          <h3 className="font-bold text-white">Nuevo Gasto</h3>
          <p className="text-xs text-white/60">Solo registra gastos donde una pareja pago por las dos. Si pagaron a medias, no lo incluyas.</p>

          <div>
            <label className="text-xs text-white/70 block mb-1">Fecha</label>
            <input
              type="date"
              value={expForm.date}
              onChange={(e) => setExpForm({ ...expForm, date: e.target.value })}
              className="w-full bg-white/20 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-white/70 block mb-1">Descripcion</label>
            <input
              type="text"
              value={expForm.description}
              onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
              className="w-full bg-white/20 rounded-lg px-3 py-2 text-white text-sm"
              placeholder="Ej: Alojamiento Madrid 3 noches"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-white/70 block mb-1">Monto total pagado</label>
              <input
                type="number"
                value={expForm.amount}
                onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })}
                className="w-full bg-white/20 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-xs text-white/70 block mb-1">Moneda</label>
              <select
                value={expForm.currency}
                onChange={(e) => setExpForm({ ...expForm, currency: e.target.value as "EUR" | "USD" })}
                className="w-full bg-white/20 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-white/70 block mb-1">Quien pago</label>
            <div className="flex gap-2">
              {(["TECHERA", "PEREZ"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setExpForm({ ...expForm, paidBy: c })}
                  className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors ${
                    expForm.paidBy === c ? "bg-blue-500 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {expForm.amount && Number(expForm.amount) > 0 && (
            <div className="bg-white/10 rounded-lg p-2 text-xs text-white/70">
              <span className="font-semibold">{expForm.paidBy}</span> pago {expForm.currency} {Number(expForm.amount).toFixed(2)} por las 2 parejas.
              La otra pareja ({expForm.paidBy === "TECHERA" ? "PEREZ" : "TECHERA"}) queda debiendo: {expForm.currency} {(Number(expForm.amount) / 2).toFixed(2)}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={addExpense} className="flex-1 bg-green-500 hover:bg-green-600 py-2 rounded-lg font-semibold text-sm transition-colors">
              Guardar
            </button>
            <button onClick={() => setShowAddExpense(false)} className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded-lg text-sm transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Add settlement form */}
      {showAddSettlement && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 space-y-3 border border-white/20">
          <h3 className="font-bold text-white">Registrar Pago de Deuda</h3>
          <p className="text-xs text-white/60">Cuando una pareja le paga a la otra para saldar la cuenta, registralo aqui.</p>

          <div>
            <label className="text-xs text-white/70 block mb-1">Fecha del pago</label>
            <input
              type="date"
              value={settleForm.date}
              onChange={(e) => setSettleForm({ ...settleForm, date: e.target.value })}
              className="w-full bg-white/20 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-white/70 block mb-1">Monto pagado</label>
            <input
              type="number"
              value={settleForm.amount}
              onChange={(e) => setSettleForm({ ...settleForm, amount: e.target.value })}
              className="w-full bg-white/20 rounded-lg px-3 py-2 text-white text-sm"
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="text-xs text-white/70 block mb-1">Quien pago</label>
            <div className="flex gap-2">
              {(["TECHERA", "PEREZ"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setSettleForm({ ...settleForm, fromCouple: c, toCouple: c === "TECHERA" ? "PEREZ" : "TECHERA" })}
                  className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors ${
                    settleForm.fromCouple === c ? "bg-blue-500 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-xs text-white/70">
            <span className="font-semibold">{settleForm.fromCouple}</span> le paga a <span className="font-semibold">{settleForm.toCouple}</span> la cantidad indicada para reducir la deuda.
          </div>
          <div>
            <label className="text-xs text-white/70 block mb-1">Notas (opcional)</label>
            <input
              type="text"
              value={settleForm.notes}
              onChange={(e) => setSettleForm({ ...settleForm, notes: e.target.value })}
              className="w-full bg-white/20 rounded-lg px-3 py-2 text-white text-sm"
              placeholder="Ej: Transferencia bancaria, efectivo en Madrid..."
            />
          </div>
          <div className="flex gap-2">
            <button onClick={addSettlement} className="flex-1 bg-green-500 hover:bg-green-600 py-2 rounded-lg font-semibold text-sm transition-colors">
              Registrar Pago
            </button>
            <button onClick={() => setShowAddSettlement(false)} className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded-lg text-sm transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Expense list */}
      {sortedExpenses.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white/70 uppercase tracking-wide">Historial de gastos</h3>
          {sortedExpenses.map((exp) => {
            const d = new Date(exp.date + "T12:00:00")
            return (
              <div key={exp.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${exp.paidBy === "TECHERA" ? "bg-blue-500/40" : "bg-purple-500/40"}`}>
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{exp.description}</div>
                  <div className="text-xs text-white/60">
                    {d.toLocaleDateString("es-ES", { day: "numeric", month: "short" })} ·{" "}
                    <span className="font-medium">{exp.paidBy}</span> pago{" "}
                    <span className="text-white/80 font-bold">{exp.currency} {exp.amount.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-amber-300">
                    La otra pareja debe: {exp.currency} {(exp.amount / 2).toFixed(2)}
                  </div>
                </div>
                <button onClick={() => deleteExpense(exp.id)} className="text-red-400 hover:text-red-300 flex-shrink-0 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Settlement list */}
      {sortedSettlements.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white/70 uppercase tracking-wide">Pagos de deuda</h3>
          {sortedSettlements.map((s) => {
            const d = new Date(s.date + "T12:00:00")
            return (
              <div key={s.id} className="bg-green-500/10 backdrop-blur-sm rounded-xl p-3 border border-green-500/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-500/30 flex items-center justify-center flex-shrink-0">
                  <ArrowRightLeft className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-green-300">Pago de deuda</div>
                  <div className="text-xs text-white/60">
                    {d.toLocaleDateString("es-ES", { day: "numeric", month: "short" })} ·{" "}
                    <span className="font-medium">{s.fromCouple}</span> pago a <span className="font-medium">{s.toCouple}</span>{" "}
                    <span className="text-white/80 font-bold">{s.amount.toFixed(2)}</span>
                  </div>
                  {s.notes && <div className="text-xs text-white/50">{s.notes}</div>}
                </div>
                <button onClick={() => deleteSettlement(s.id)} className="text-red-400 hover:text-red-300 flex-shrink-0 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {expenses.length === 0 && settlements.length === 0 && (
        <div className="text-center text-white/40 py-8 text-sm">
          No hay gastos registrados todavia.<br />
          Agrega el primer gasto cuando una pareja pague por las dos.
        </div>
      )}
    </div>
  )
}
