"use client"

import { useMemo } from "react"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Receipt,
  Wifi,
  RefreshCw,
  CheckCircle,
  XCircle,
  TrendingUp,
  ExternalLink,
} from "lucide-react"
import type { Transaction, TransactionType } from "@/lib/types"
import { isInflow } from "@/lib/types"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const typeMeta: Record<
  TransactionType,
  { icon: typeof ArrowDownToLine; label: string; color: string }
> = {
  deposit: { icon: ArrowDownToLine, label: "Deposit", color: "text-green-600" },
  withdrawal: { icon: ArrowUpFromLine, label: "Withdrawal", color: "text-red-500" },
  "bill-payment": { icon: Receipt, label: "Bill Payment", color: "text-blue-500" },
  airtime: { icon: Wifi, label: "Airtime", color: "text-purple-500" },
  "float-topup": { icon: RefreshCw, label: "Float Top-up", color: "text-green-600" },
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
    <div className="bg-white dark:bg-zinc-900 border border-green-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col h-full">
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
              {compact ? "All Transactions" : "Today's Activity"}
            </p>
            {showExport && transactions.length > 0 && (
              <button
                onClick={onExportCSV}
                className="text-[10px] text-green-600 dark:text-green-400 hover:underline"
              >
                Export CSV
              </button>
            )}
          </div>
          {summary && (
            <span className="text-xs text-gray-400 dark:text-zinc-500">
              {summary.count} transaction{summary.count !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {summary && !compact && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 border border-green-100 dark:border-green-900">
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase font-medium">
                Inflow
              </p>
              <p className="text-sm font-bold text-green-700 dark:text-green-400 mt-0.5">
                {formatCurrency(summary.totalInflow)}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3 border border-red-100 dark:border-red-900">
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase font-medium">
                Outflow
              </p>
              <p className="text-sm font-bold text-red-600 dark:text-red-400 mt-0.5">
                {formatCurrency(summary.totalOutflow)}
              </p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 border border-emerald-100 dark:border-emerald-900">
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase font-medium">
                Commission
              </p>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                {formatCurrency(summary.totalCommission)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 px-5 pb-5">
        {transactions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-green-200 dark:border-zinc-700 rounded-lg">
            <TrendingUp className="w-10 h-10 text-green-300 dark:text-green-700 mb-3" />
            <p className="text-sm text-gray-400 dark:text-zinc-500 text-center max-w-[200px]">
              No transactions logged yet for this machine.
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
                  className="flex items-center gap-3 p-3 rounded-lg border border-green-100 dark:border-zinc-700 bg-green-50/30 dark:bg-zinc-800/30 hover:bg-green-50 dark:hover:bg-zinc-800 transition-colors group"
                  role="listitem"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      meta.color,
                      "bg-white dark:bg-zinc-800 border border-green-200 dark:border-zinc-700"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                        {meta.label}
                      </span>
                      {tx.reference && (
                        <span className="text-xs text-gray-400 dark:text-zinc-500 truncate">
                          #{tx.reference}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-zinc-500">{tx.timestamp}</p>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <p
                        className={cn(
                          "text-sm font-bold",
                          positive
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-500 dark:text-red-400"
                        )}
                      >
                        {sign} {formatCurrency(tx.amount)}
                      </p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        {tx.isSuccessful ? (
                          <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-500 dark:text-red-400" />
                        )}
                        <span
                          className={cn(
                            "text-xs",
                            tx.isSuccessful
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-500 dark:text-red-400"
                          )}
                        >
                          {tx.isSuccessful ? "Success" : "Failed"}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`/receipt/${tx.id}`}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                      title="View receipt"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
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
