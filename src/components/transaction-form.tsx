"use client"

import { useState, useCallback, useRef } from "react"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Receipt,
  Wifi,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "bill-payment"
  | "airtime"
  | "float-topup"

export interface Transaction {
  id: string
  timestamp: string
  type: TransactionType
  amount: number
  reference: string
  isSuccessful: boolean
  commission: number
}

interface TransactionFormProps {
  onLogTransaction: (tx: Transaction) => void
}

const txTypes: {
  id: TransactionType
  label: string
  icon: typeof ArrowDownToLine
}[] = [
  { id: "deposit", label: "Deposit", icon: ArrowDownToLine },
  { id: "withdrawal", label: "Withdrawal", icon: ArrowUpFromLine },
  { id: "bill-payment", label: "Bill Payment", icon: Receipt },
  { id: "airtime", label: "Airtime", icon: Wifi },
  { id: "float-topup", label: "Float Top-up", icon: RefreshCw },
]

function calculateCommission(amount: number): number {
  if (amount <= 0) return 0
  if (amount <= 5000) return 100
  return Math.round(amount * 0.02)
}

export function TransactionForm({ onLogTransaction }: TransactionFormProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>("deposit")
  const [amount, setAmount] = useState<string>("0")
  const [reference, setReference] = useState<string>("")
  const [isSuccessful, setIsSuccessful] = useState<boolean>(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const amountRef = useRef<HTMLInputElement>(null)

  const commission = calculateCommission(Number(amount) || 0)

  const handleLogTransaction = useCallback(() => {
    const numAmount = Number(amount)
    if (numAmount <= 0) {
      setValidationError("Amount must be greater than 0")
      setTimeout(() => setValidationError(null), 2500)
      amountRef.current?.focus()
      return
    }
    setValidationError(null)

    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const ampm = hours >= 12 ? "PM" : "AM"
    const h12 = hours % 12 || 12
    const timestamp = `${h12}:${minutes.toString().padStart(2, "0")} ${ampm}`

    const tx: Transaction = {
      id:
        crypto.randomUUID?.() ||
        `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp,
      type: transactionType,
      amount: numAmount,
      reference,
      isSuccessful,
      commission,
    }

    onLogTransaction(tx)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 1200)
    setAmount("0")
    setReference("")
    setTransactionType("deposit")
    setIsSuccessful(true)
    amountRef.current?.focus()
  }, [amount, reference, transactionType, isSuccessful, commission, onLogTransaction])

  const handleClear = useCallback(() => {
    setAmount("0")
    setReference("")
    setTransactionType("deposit")
    setIsSuccessful(true)
    setValidationError(null)
    amountRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleLogTransaction()
      }
    },
    [handleLogTransaction]
  )

  const TypeIcon =
    txTypes.find((t) => t.id === transactionType)?.icon || ArrowDownToLine

  return (
    <div
      className={cn(
        "bg-white border rounded-xl p-5 shadow-sm transition-all duration-300",
        isAnimating
          ? "border-green-400 bg-green-50 ring-1 ring-green-200"
          : "border-green-200"
      )}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
          <TypeIcon className="w-3.5 h-3.5 text-green-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            New Transaction
          </p>
          <p className="text-[10px] text-gray-300">Fill in the details below</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {txTypes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTransactionType(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
              transactionType === id
                ? "bg-green-600 text-white border-green-600 shadow-sm"
                : "bg-white text-gray-500 border-gray-200 hover:border-green-300 hover:text-green-600 hover:bg-green-50"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Amount (UGX)
          </label>
          <input
            ref={amountRef}
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Reference / RRN
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
            placeholder="240615001"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-5 py-2 px-3 bg-gray-50 rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              checked={isSuccessful}
              onChange={(e) => setIsSuccessful(e.target.checked)}
              className="sr-only"
            />
            <div
              className={cn(
                "w-10 h-5 rounded-full transition-colors duration-200",
                isSuccessful ? "bg-green-600" : "bg-gray-300"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 mt-0.5",
                  isSuccessful ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-gray-700">Successful</span>
        </label>
        <p className="text-sm text-gray-500">
          Est. commission:{" "}
          <span className="font-semibold text-green-700">
            UGX {commission.toLocaleString()}
          </span>
        </p>
      </div>

      {validationError && (
        <p className="text-xs text-red-500 mb-3 text-center bg-red-50 py-1.5 rounded-md">
          {validationError}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleLogTransaction}
          className="flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-all active:scale-[0.98] shadow-sm"
        >
          Log transaction
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="px-5 py-2.5 border border-gray-200 text-gray-500 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          Clear
        </button>
      </div>

      <p className="text-[11px] text-gray-400 mt-3 text-center">
        Tip: press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono">Enter</kbd> to save and instantly log the receipt.
      </p>
    </div>
  )
}
