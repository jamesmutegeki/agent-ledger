"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Printer } from "lucide-react"
import { generateDemoTransactions } from "@/lib/demo-data"
import type { TransactionType, Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/format"
import { safeGetItem, safeJSONParse } from "@/lib/storage"

const typeLabels: Record<TransactionType, string> = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  "bill-payment": "Bill Payment",
  airtime: "Airtime",
  "float-topup": "Float Top-up",
}

function loadTransactions(): Transaction[] {
  if (typeof window === "undefined") return []
  const raw = safeGetItem("agent-ledger-transactions")
  if (raw) {
    return safeJSONParse<Transaction[]>(raw, [])
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
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">Transaction not found</p>
          <a
            href="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mt-2 inline-block transition-colors"
          >
            Back to home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="max-w-sm mx-auto px-5 py-6">
        <div className="flex items-center justify-between mb-6">
          <a
            href="/"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </a>
          <button
            onClick={() => window.print()}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center gap-1 text-sm"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm shadow-black/5 dark:shadow-black/10">
          <div className="text-center mb-6">
            <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">Agent Ledger</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Transaction Receipt</p>
          </div>

          <div className="space-y-3 py-4 border-t border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400 dark:text-gray-500">Type</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {typeLabels[tx.type as TransactionType] || tx.type}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400 dark:text-gray-500">Amount</span>
              <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(tx.amount)}
              </span>
            </div>
            {tx.reference && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400 dark:text-gray-500">Reference</span>
                <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                  #{tx.reference}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400 dark:text-gray-500">Status</span>
              <span className={`text-sm font-medium ${tx.isSuccessful ? "text-gray-700 dark:text-gray-300" : "text-red-500 dark:text-red-400"}`}>
                {tx.isSuccessful ? "Successful" : "Failed"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400 dark:text-gray-500">Time</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">{tx.timestamp}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <span className="text-xs text-gray-400 dark:text-gray-500">Commission earned</span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {formatCurrency(tx.commission)}
            </span>
          </div>

          <p className="text-[10px] text-gray-300 dark:text-gray-600 text-center mt-6">
            Receipt #{tx.id.slice(0, 8)}
          </p>
        </div>
      </div>
    </div>
  )
}
