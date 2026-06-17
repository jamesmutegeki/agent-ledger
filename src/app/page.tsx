"use client"

import { useState, useCallback, useMemo } from "react"
import { PanelRightOpen, PanelLeftClose, Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Sidebar, type ViewId } from "@/components/sidebar"
import { TransactionForm, type Transaction } from "@/components/transaction-form"
import { ActivityFeed } from "@/components/activity-feed"

const viewMeta: Record<ViewId, { title: string; subtitle: string }> = {
  "live-log": { title: "Live log", subtitle: "Type the receipt details. The ledger updates as you go." },
  history: { title: "History", subtitle: "Review all past transactions logged today." },
  "end-of-day": { title: "End of Day", subtitle: "Daily summary and settlement report." },
  machines: { title: "Machines", subtitle: "Manage and monitor your registered machines." },
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [activeView, setActiveView] = useState<ViewId>("live-log")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { theme, setTheme } = useTheme()

  const handleLogTransaction = useCallback((tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev])
  }, [])

  const summary = useMemo(() => {
    if (transactions.length === 0) return null
    const totalDeposits = transactions
      .filter((t) => t.type === "deposit" || t.type === "float-topup")
      .reduce((s, t) => s + t.amount, 0)
    const totalWithdrawals = transactions
      .filter((t) => t.type === "withdrawal" || t.type === "bill-payment" || t.type === "airtime")
      .reduce((s, t) => s + t.amount, 0)
    const totalCommission = transactions.reduce((s, t) => s + t.commission, 0)
    const byType = transactions.reduce(
      (acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    return { totalDeposits, totalWithdrawals, totalCommission, count: transactions.length, byType }
  }, [transactions])

  const meta = viewMeta[activeView]

  return (
    <div className="min-h-screen bg-green-50/40 dark:bg-zinc-950 flex">
      {sidebarOpen && (
        <Sidebar activeView={activeView} onNavigate={setActiveView} />
      )}

      <div className="flex-1 flex flex-col min-h-screen w-0">
        <header className="h-14 border-b border-green-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-5 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-5 h-5" />
              ) : (
                <PanelRightOpen className="w-5 h-5" />
              )}
            </button>
            <div>
              <h2 className="text-base font-bold text-green-800 dark:text-green-400">{meta.title}</h2>
              <p className="text-xs text-gray-400 dark:text-zinc-500 leading-tight">{meta.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </header>

        <main className="flex-1 p-5 min-h-0 overflow-auto">
          {activeView === "live-log" && (
            <div className="h-full flex flex-col lg:flex-row gap-5">
              <div className="lg:w-[440px] shrink-0 self-start lg:self-stretch flex flex-col">
                <TransactionForm onLogTransaction={handleLogTransaction} />
              </div>
              <div className="flex-1 min-h-0 flex flex-col">
                <ActivityFeed transactions={transactions} />
              </div>
            </div>
          )}

          {activeView === "history" && (
            <div className="h-full max-w-3xl mx-auto flex flex-col">
              <ActivityFeed transactions={transactions} />
            </div>
          )}

          {activeView === "end-of-day" && (
            <div className="h-full max-w-3xl mx-auto flex flex-col">
              {summary ? (
                <div className="bg-white dark:bg-zinc-900 border border-green-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-green-800 dark:text-green-400 mb-4">End of Day Summary</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 border border-green-100 dark:border-green-900">
                      <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase font-medium">Total Inflow</p>
                      <p className="text-xl font-bold text-green-700 dark:text-green-400 mt-1">
                        UGX {summary.totalDeposits.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-4 border border-red-100 dark:border-red-900">
                      <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase font-medium">Total Outflow</p>
                      <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
                        UGX {summary.totalWithdrawals.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900">
                      <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase font-medium">Total Commission</p>
                      <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                        UGX {summary.totalCommission.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-gray-100 dark:border-zinc-700">
                    <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase font-medium mb-3">Transactions by Type</p>
                    <div className="space-y-2">
                      {Object.entries(summary.byType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-zinc-300 capitalize">{type.replace("-", " ")}</span>
                          <span className="text-sm font-semibold text-gray-800 dark:text-zinc-200">{count}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 dark:border-zinc-700 mt-3 pt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800 dark:text-zinc-200">Total Transactions</span>
                      <span className="text-sm font-bold text-green-700 dark:text-green-400">{summary.count}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-green-200 dark:border-zinc-700 rounded-xl">
                  <p className="text-sm text-gray-400 dark:text-zinc-500">No transactions today. Log some transactions first.</p>
                </div>
              )}
            </div>
          )}

          {activeView === "machines" && (
            <div className="h-full max-w-3xl mx-auto flex flex-col">
              <div className="bg-white dark:bg-zinc-900 border border-green-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-green-800 dark:text-green-400 mb-4">Registered Machines</h3>
                <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-100 dark:border-green-900">
                  <Monitor className="w-10 h-10 text-green-600 dark:text-green-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">Machine #001</p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500">Active &middot; Last sync: {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
