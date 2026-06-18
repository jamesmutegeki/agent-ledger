"use client"

import { useState, useCallback, useRef } from "react"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Receipt,
  Wifi,
  RefreshCw,
  Speaker,
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

function playChime() {
  // Check if we're in a browser environment and have user activation
  if (typeof window === 'undefined' || typeof AudioContext === 'undefined') return;
  
  // Check for user activation (modern browsers)
  if ('userActivation' in navigator && !navigator.userActivation.isActive) return;
  
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (err) {
    console.warn("Audio not available:", err);
  }
}

export function TransactionForm({ onLogTransaction }: TransactionFormProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>("deposit")
  const [amount, setAmount] = useState<string>("0")
  const [reference, setReference] = useState<string>("")
  const [isSuccessful, setIsSuccessful] = useState<boolean>(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const amountRef = useRef<HTMLInputElement>(null)
  const animTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
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

    if (isSuccessful) playChime()

    setIsAnimating(true)
    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current)
    animTimeoutRef.current = setTimeout(() => setIsAnimating(false), 1200)

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

  const TypeIcon =
    txTypes.find((t) => t.id === transactionType)?.icon || ArrowDownToLine

  const inflow = isInflow({ type: transactionType })

  return (
    <div
      className={cn(
        "bg-white dark:bg-zinc-900 border rounded-xl p-5 shadow-sm transition-all duration-300",
        isAnimating
          ? "border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-950/30 ring-1 ring-green-200 dark:ring-green-800"
          : "border-green-200 dark:border-zinc-800"
      )}
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
          <TypeIcon className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
            New Transaction
          </p>
          <p className="text-[10px] text-gray-300 dark:text-zinc-600">Fill in the details below</p>
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
                ? "bg-green-600 dark:bg-green-500 text-white border-green-600 dark:border-green-500 shadow-sm"
                : "bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-gray-200 dark:border-zinc-700 hover:border-green-300 hover:text-green-600 hover:bg-green-50 dark:hover:bg-zinc-700 dark:hover:border-green-600 dark:hover:text-green-400"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4" onKeyDown={handleKeyDown}>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">
            Amount (UGX)
          </label>
          <input
            ref={amountRef}
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">
            Reference / RRN
          </label>
          <input
            type="text"
            maxLength={50}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
            placeholder="240615001"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-5 py-2 px-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
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
                isSuccessful ? "bg-green-600 dark:bg-green-500" : "bg-gray-300 dark:bg-zinc-600"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 bg-white dark:bg-zinc-200 rounded-full shadow-sm transition-transform duration-200 mt-0.5",
                  isSuccessful ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">Successful</span>
        </label>
        <div className="flex items-center gap-2">
          <Speaker className="w-3 h-3 text-gray-300 dark:text-zinc-600" />
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Est. commission:{" "}
            <span className="font-semibold text-green-700 dark:text-green-400">
              {formatCurrency(commission)}
            </span>
          </p>
        </div>
      </div>

      {validationError && (
        <p className="text-xs text-red-500 dark:text-red-400 mb-3 text-center bg-red-50 dark:bg-red-950/30 py-1.5 rounded-md">
          {validationError}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleLogTransaction}
          disabled={submitting}
          className={cn(
            "flex-1 font-medium py-2.5 px-4 rounded-lg text-sm transition-all shadow-sm",
            submitting
              ? "bg-green-400 dark:bg-green-600/50 text-white cursor-not-allowed"
              : "bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 active:bg-green-800 text-white active:scale-[0.98]"
          )}
        >
          {submitting ? "Logging..." : "Log transaction"}
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={submitting}
          className="px-5 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600 transition-all disabled:opacity-50"
        >
          Clear
        </button>
      </div>

      <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-3 text-center">
        Tip: press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded text-[10px] font-mono">Enter</kbd> to save and instantly log the receipt.
      </p>
    </div>
  )
}
