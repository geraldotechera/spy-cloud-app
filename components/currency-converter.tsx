"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"

interface CurrencyConverterProps {
  onBack: () => void
}

export function CurrencyConverter({ onBack }: CurrencyConverterProps) {
  const [euros, setEuros] = useState<string>("")
  const [usd, setUsd] = useState<number>(0)
  const [uyu, setUyu] = useState<number>(0)
  const [rates, setRates] = useState<{ usd: number; uyu: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchExchangeRates()
  }, [])

  const fetchExchangeRates = async () => {
    try {
      setLoading(true)
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/EUR")
      const data = await response.json()

      setRates({
        usd: data.rates.USD,
        uyu: data.rates.UYU,
      })
      setLastUpdate(new Date().toLocaleString("es-UY"))
      setLoading(false)
    } catch (error) {
      console.error("Error fetching exchange rates:", error)
      setRates({
        usd: 1.08,
        uyu: 43.5,
      })
      setLastUpdate("Tasas aproximadas")
      setLoading(false)
    }
  }

  const handleConvert = (value: string) => {
    setEuros(value)
    const euroAmount = Number.parseFloat(value)

    if (!isNaN(euroAmount) && rates) {
      setUsd(euroAmount * rates.usd)
      setUyu(euroAmount * rates.uyu)
    } else {
      setUsd(0)
      setUyu(0)
    }
  }

  const closeKeyboard = () => {
    if (inputRef.current) {
      inputRef.current.blur()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      closeKeyboard()
    }
  }

  const handleQuickAmount = (amount: number) => {
    handleConvert(amount.toString())
    closeKeyboard()
  }

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
      >
        ← Volver al Menú
      </button>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">💱 Conversión de Moneda</h2>
          <button
            onClick={fetchExchangeRates}
            className="bg-blue-500/80 hover:bg-blue-600/90 px-3 py-1 rounded-lg text-sm transition-colors"
            disabled={loading}
          >
            🔄 Actualizar
          </button>
        </div>

        {loading ? (
          <p className="text-center py-4">Cargando tasas de cambio...</p>
        ) : (
          <>
            <p className="text-sm opacity-80 mb-4">Última actualización: {lastUpdate}</p>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                <label className="block text-sm font-medium mb-2">Euros (EUR)</label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl flex-shrink-0">€</span>
                  <input
                    ref={inputRef}
                    type="number"
                    value={euros}
                    onChange={(e) => handleConvert(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="0.00"
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                    inputMode="decimal"
                  />
                </div>
                <p className="text-xs opacity-70 mt-2">Presiona Enter para cerrar el teclado</p>
              </div>

              <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/30">
                <label className="block text-sm font-medium mb-2">Dólares Estadounidenses (USD)</label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl flex-shrink-0">$</span>
                  <div className="flex-1 bg-white/10 rounded-lg px-4 py-3 text-lg font-bold break-words">
                    {usd.toFixed(2)}
                  </div>
                </div>
                {rates && <p className="text-xs opacity-70 mt-2">Tasa: 1 EUR = {rates.usd.toFixed(4)} USD</p>}
              </div>

              <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-500/30">
                <label className="block text-sm font-medium mb-2">Pesos Uruguayos (UYU)</label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl flex-shrink-0">$U</span>
                  <div className="flex-1 bg-white/10 rounded-lg px-4 py-3 text-lg font-bold break-words">
                    {uyu.toFixed(2)}
                  </div>
                </div>
                {rates && <p className="text-xs opacity-70 mt-2">Tasa: 1 EUR = {rates.uyu.toFixed(2)} UYU</p>}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              {[10, 50, 100].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleQuickAmount(amount)}
                  className="bg-white/10 hover:bg-white/20 rounded-lg py-2 text-sm transition-colors"
                >
                  €{amount}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
