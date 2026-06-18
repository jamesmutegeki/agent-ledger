"use client"

import { useMemo } from "react"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Receipt,
  Wifi,
  RefreshCw,
  TrendingUp,
} from "lucide-react"
import type { Transaction, TransactionType } from "@/lib/types"
import { isInflow } from "@/lib/types"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const typeMeta: Record<
  TransactionType,
  { icon: typeof ArrowDownToLine; label: string }
> = {
  deposit: { icon: ArrowDownToLine, label: "Deposit" },
  withdrawal: { icon: ArrowUpFromLine, label: "Withdrawal" },
  "bill-payment": { icon: Receipt, label: "Bill Payment" },
  airtime: { icon: Wifi, label: "Airtime" },
  "float-topup": { icon: RefreshCw, label: "Float Top-up" },
}

interface ActivityFeedProps {
  transactions: Transaction[]
  compact?: boolean
  showExport?: boolean
  onExportCSV?: () => void
}

export function ActivityFeed({
  transactions,
  compact,
  showExport,
  onExportCSV,
}: ActivityFeedProps) {
  const summary = useMemo(() => {
    if (transactions.length === 0) return null
    const totalInflow = transactions
      .filter((t) => isInflow(t))
      .reduce((sum, t) => sum + t.amount, 0)
    const totalOutflow = transactions
      .filter((t) => !isInflow(t))
      .reduce((sum, t) => sum + t.amount, 0)
    const totalCommission = transactions.reduce((sum, t) => sum + t.commission, 0)
    return { totalInflow, totalOutflow, totalCommission, count: transactions.length }
  }, [transactions])

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm shadow-black/5 dark:shadow-black/10 flex flex-col h-full">
      <div className="px-6 pt-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {showExport && transactions.length > 0 && (
              <button
                onClick={onExportCSV}
                className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Export CSV
              </button>
            )}
          </div>
          {summary && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {summary.count} transaction{summary.count !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 px-6 pb-5">
        {transactions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <TrendingUp className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No transactions logged yet.
            </p>
          </div>
        ) : (
          <div
            className="h-full overflow-y-auto custom-scrollbar space-y-2 pr-1"
            role="list"
            tabIndex={0}
            aria-label="Transaction list"
          >
            {transactions.map((tx) => {
              const meta = typeMeta[tx.type]
              const Icon = meta.icon
              const positive = isInflow(tx)
              const sign = positive ? "+" : "-"

              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors duration-150 group"
                  role="listitem"
                >
                  <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {meta.label}
                      </span>
                      {tx.reference && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                          #{tx.reference}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{tx.timestamp}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        positive
                          ? "text-gray-800 dark:text-gray-200"
                          : "text-gray-800 dark:text-gray-200"
                      )}
                    >
                      {sign} {formatCurrency(tx.amount)}
                    </p>
                    <p
                      className={cn(
                        "text-[11px] mt-0.5",
                        tx.isSuccessful
                          ? "text-gray-400 dark:text-gray-500"
                          : "text-red-400 dark:text-red-500"
                      )}
                    >
                      {tx.isSuccessful ? "Success" : "Failed"}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
