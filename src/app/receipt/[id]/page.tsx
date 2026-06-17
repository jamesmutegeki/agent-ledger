"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Printer, BookOpen, CheckCircle, XCircle } from "lucide-react"
import { generateDemoTransactions } from "@/lib/demo-data"
import type { TransactionType } from "@/lib/types"
import { isInflow, positiveTypes } from "@/lib/types"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const typeLabels: Record<TransactionType, string> = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  "bill-payment": "Bill Payment",
  airtime: "Airtime",
  "float-topup": "Float Top-up",
}

// In a real app this would load from Supabase; for now use demo data + localStorage
function loadTransactions() {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem("agent-ledger-transactions")
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      return []
    }
  }
  return generateDemoTransactions()
}

export default function ReceiptPage() {
  const params = useParams()
  const id = params.id as string

  const tx = useMemo(() => {
    const all = loadTransactions()
    return all.find((t: { id: string }) => t.id === id) || null
  }, [id])

  if (!tx) {
    return (
      <div className="min-h-screen bg-green-50/40 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 dark:text-zinc-500">Transaction not found</p>
          <a
            href="/"
            className="text-sm text-green-600 dark:text-green-400 hover:underline mt-2 inline-block"
          >
            Back to home
          </a>
        </div>
      </div>
    )
  }

  const positive = isInflow(tx)

  return (
    <div className="min-h-screen bg-green-50/40 dark:bg-zinc-950">
      <div className="max-w-md mx-auto p-5">
        <div className="flex items-center justify-between mb-5">
          <a
            href="/"
            className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </a>
          <button
            onClick={() => window.print()}
            className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center gap-1 text-sm"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-green-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-lg font-bold text-green-800 dark:text-green-400">Agent Ledger</h1>
            <p className="text-xs text-gray-400">Transaction Receipt</p>
          </div>

          <div className="border-t border-b border-green-100 dark:border-zinc-700 py-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 dark:text-zinc-400">Type</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                {typeLabels[tx.type as TransactionType] || tx.type}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 dark:text-zinc-400">Amount</span>
              <span
                className={cn(
                  "text-lg font-bold",
                  positive ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
                )}
              >
                {positive ? "+" : "-"} {formatCurrency(tx.amount)}
              </span>
            </div>
            {tx.reference && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 dark:text-zinc-400">Reference</span>
                <span className="text-sm font-mono text-gray-800 dark:text-zinc-200">
                  #{tx.reference}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 dark:text-zinc-400">Status</span>
              <div className="flex items-center gap-1">
                {tx.isSuccessful ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    tx.isSuccessful ? "text-green-600" : "text-red-500"
                  )}
                >
                  {tx.isSuccessful ? "Successful" : "Failed"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-zinc-400">Time</span>
              <span className="text-sm text-gray-800 dark:text-zinc-200">{tx.timestamp}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 dark:text-zinc-500">Commission earned</span>
            <span className="text-sm font-semibold text-green-700 dark:text-green-400">
              {formatCurrency(tx.commission)}
            </span>
          </div>

          <p className="text-[10px] text-gray-300 dark:text-zinc-600 text-center mt-6">
            Receipt #{tx.id.slice(0, 8)}
          </p>
        </div>
      </div>
    </div>
  )
}
