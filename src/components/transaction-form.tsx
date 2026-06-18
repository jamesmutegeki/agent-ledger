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
import type { Transaction, TransactionType } from "@/lib/types"
import { generateId, isInflow } from "@/lib/types"
import { formatTimestamp, formatCurrency } from "@/lib/format"
import { calculateCommission, sanitizeReference } from "@/lib/transactions"

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

export function TransactionForm({ onLogTransaction }: TransactionFormProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>("deposit")
  const [amount, setAmount] = useState<string>("0")
  const [reference, setReference] = useState<string>("")
  const [isSuccessful, setIsSuccessful] = useState<boolean>(true)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const amountRef = useRef<HTMLInputElement>(null)
  const validationTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const commission = calculateCommission(transactionType, Number(amount) || 0)

  const handleLogTransaction = useCallback(() => {
    if (submitting) return
    const numAmount = Number(amount)
    if (numAmount <= 0) {
      setValidationError("Amount must be greater than 0")
      if (validationTimeoutRef.current) clearTimeout(validationTimeoutRef.current)
      validationTimeoutRef.current = setTimeout(() => setValidationError(null), 2500)
      amountRef.current?.focus()
      return
    }
    setValidationError(null)
    setSubmitting(true)

    const tx: Transaction = {
      id: generateId(),
      timestamp: formatTimestamp(new Date()),
      type: transactionType,
      amount: numAmount,
      reference: sanitizeReference(reference),
      isSuccessful,
      commission,
    }

    onLogTransaction(tx)

    setAmount("0")
    setReference("")
    setTransactionType("deposit")
    setIsSuccessful(true)
    setTimeout(() => setSubmitting(false), 300)
    amountRef.current?.focus()
  }, [amount, reference, transactionType, isSuccessful, commission, onLogTransaction, submitting])

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

  const TypeIcon = txTypes.find((t) => t.id === transactionType)?.icon || ArrowDownToLine

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm shadow-black/5 dark:shadow-black/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
          <TypeIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">New Transaction</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {txTypes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTransactionType(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              transactionType === id
                ? "border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-zinc-800 text-gray-800 dark:text-gray-200"
                : "border-gray-200 dark:border-zinc-700 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-zinc-600 hover:text-gray-600 dark:hover:text-gray-400"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5" onKeyDown={handleKeyDown}>
        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1.5">
            Amount (UGX)
          </label>
          <input
            ref={amountRef}
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent transition-all placeholder:text-gray-400"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1.5">
            Reference / RRN
          </label>
          <input
            type="text"
            maxLength={50}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent transition-all placeholder:text-gray-400"
            placeholder="240615001"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-5 py-3 px-4 bg-gray-50 dark:bg-zinc-800/30 rounded-lg">
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
                "w-9 h-[18px] rounded-full transition-colors duration-200",
                isSuccessful ? "bg-gray-700 dark:bg-gray-300" : "bg-gray-300 dark:bg-zinc-600"
              )}
            >
              <div
                className={cn(
                  "w-3.5 h-3.5 bg-white dark:bg-zinc-900 rounded-full shadow-sm transition-transform duration-200 mt-[2px]",
                  isSuccessful ? "translate-x-[18px]" : "translate-x-[2px]"
                )}
              />
            </div>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Successful</span>
        </label>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Commission:{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {formatCurrency(commission)}
          </span>
        </p>
      </div>

      {validationError && (
        <p className="text-xs text-red-500 dark:text-red-400 mb-4 text-center py-2 px-3 rounded-lg bg-red-50 dark:bg-red-950/30">
          {validationError}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleLogTransaction}
          disabled={submitting}
          className={cn(
            "flex-1 font-medium py-2.5 px-4 rounded-lg text-sm transition-all",
            submitting
              ? "bg-gray-200 dark:bg-zinc-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              : "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-[0.98]"
          )}
        >
          {submitting ? "Logging..." : "Log transaction"}
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={submitting}
          className="px-5 py-2.5 text-gray-400 dark:text-gray-500 rounded-lg text-sm font-medium hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-50"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
