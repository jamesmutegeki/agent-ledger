"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { PanelRightOpen, PanelLeftClose, Sun, Moon, Monitor, Database, Trash2, AlertTriangle } from "lucide-react"
import { useTheme } from "next-themes"
import { Sidebar } from "@/components/sidebar"
import { TransactionForm } from "@/components/transaction-form"
import { ActivityFeed } from "@/components/activity-feed"
import type { Transaction, ViewId } from "@/lib/types"
import { generateDemoTransactions } from "@/lib/demo-data"
import { supabase, isSupabaseConfigured, toDbTransaction, fromDbTransaction } from "@/lib/supabase"
import { isInflow } from "@/lib/types"
import { formatCurrency } from "@/lib/format"
import { exportTransactionsToCSV } from "@/lib/csv"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

const EndOfDayChart = dynamic(() => import("@/components/end-of-day-chart"), { ssr: false })

const viewMeta: Record<ViewId, { title: string; subtitle: string }> = {
  "live-log": { title: "Live log", subtitle: "Type the receipt details. The ledger updates as you go." },
  history: { title: "History", subtitle: "Review all past transactions logged today." },
  "end-of-day": { title: "End of Day", subtitle: "Daily summary and settlement report." },
  machines: { title: "Machines", subtitle: "Manage and monitor your registered machines." },
}

function getViewMeta(view: ViewId): { title: string; subtitle: string } {
  const meta = viewMeta[view]
  if (!meta) throw new Error(`Unknown view: ${view}`)
  return meta
}

const STORAGE_KEY = "agent-ledger-initialized"

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [activeView, setActiveView] = useState<ViewId>("live-log")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [supabaseConnected, setSupabaseConnected] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const { theme, setTheme } = useTheme()

  // Persist transactions to localStorage for receipt page
  useEffect(() => {
    localStorage.setItem("agent-ledger-transactions", JSON.stringify(transactions))
  }, [transactions])

  // Load demo data on first visit, then try Supabase
  useEffect(() => {
    const init = async () => {
      const alreadyInitialized = localStorage.getItem(STORAGE_KEY)

      if (supabase && isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .order("created_at", { ascending: true })
          .limit(50)

        if (!error && data && data.length > 0) {
          const mapped = data.map(fromDbTransaction).filter(Boolean) as Transaction[]
          setTransactions(mapped)
          setSupabaseConnected(true)
          localStorage.setItem(STORAGE_KEY, "true")
          return
        }
      }

      if (!alreadyInitialized) {
        const demo = generateDemoTransactions()
        setTransactions(demo)
        localStorage.setItem(STORAGE_KEY, "true")
      }
    }

    init()
  }, [])

  const handleLogTransaction = useCallback(
    async (tx: Transaction) => {
      setTransactions((prev) => [tx, ...prev])

      if (supabase && isSupabaseConfigured()) {
        setSyncing(true)
        try {
          await supabase.from("transactions").insert(toDbTransaction(tx))
        } catch (err) {
          console.error("Supabase sync failed", err)
        } finally {
          setSyncing(false)
        }
      }
    },
    []
  )

  const handleClearAll = useCallback(async () => {
    setShowClearConfirm(false)
    setTransactions([])
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem("agent-ledger-transactions")

    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from("transactions").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      } catch (err) {
        console.error("Supabase clear failed", err)
      }
    }
  }, [])

  const handleResetDemo = useCallback(() => {
    const demo = generateDemoTransactions()
    setTransactions(demo)
    localStorage.setItem(STORAGE_KEY, "true")
  }, [])

  const handleExportCSV = useCallback(() => {
    exportTransactionsToCSV(transactions)
  }, [transactions])

  const summary = useMemo(() => {
    if (transactions.length === 0) return null
    const totalInflow = transactions
      .filter((t) => isInflow(t))
      .reduce((s, t) => s + t.amount, 0)
    const totalOutflow = transactions
      .filter((t) => !isInflow(t))
      .reduce((s, t) => s + t.amount, 0)
    const totalCommission = transactions.reduce((s, t) => s + t.commission, 0)
    const byType = transactions.reduce(
      (acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    return { totalInflow, totalOutflow, totalCommission, count: transactions.length, byType }
  }, [transactions])

  const meta = getViewMeta(activeView)

  return (
    <div className="min-h-screen bg-green-50/40 dark:bg-zinc-950 flex">
      {sidebarOpen && <Sidebar activeView={activeView} onNavigate={setActiveView} />}

      <div className="flex-1 flex flex-col min-h-screen w-0">
        <header className="h-14 border-b border-green-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-5 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
            </button>
            <div>
              <h2 className="text-base font-bold text-green-800 dark:text-green-400">{meta.title}</h2>
              <p className="text-xs text-gray-400 dark:text-zinc-500 leading-tight">{meta.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {syncing && <span className="text-[10px] text-green-600 dark:text-green-400 animate-pulse">syncing...</span>}
            {supabaseConnected && <Database className="w-3.5 h-3.5 text-green-500" />}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 min-h-0 overflow-auto">
          {activeView === "live-log" && (
            <div className="h-full flex flex-col lg:flex-row gap-5">
              <div className="lg:w-[440px] shrink-0 self-start lg:self-stretch flex flex-col">
                <TransactionForm onLogTransaction={handleLogTransaction} />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleResetDemo}
                    className="text-[11px] text-gray-400 dark:text-zinc-500 hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center gap-1"
                  >
                    Load demo data
                  </button>
                  {transactions.length > 0 && (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="text-[11px] text-gray-400 dark:text-zinc-500 hover:text-red-500 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear all
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 min-h-0 flex flex-col">
                <ActivityFeed transactions={transactions} />
              </div>
            </div>
          )}

          {activeView === "history" && (
            <div className="h-full max-w-3xl mx-auto flex flex-col">
              <ActivityFeed transactions={transactions} compact showExport onExportCSV={handleExportCSV} />
            </div>
          )}

          {activeView === "end-of-day" && (
            <div className="h-full max-w-3xl mx-auto flex flex-col">
              {summary ? (
                <div className="bg-white dark:bg-zinc-900 border border-green-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-green-800 dark:text-green-400 mb-4">
                    End of Day Summary
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 border border-green-100 dark:border-green-900">
                      <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase font-medium">Total Inflow</p>
                      <p className="text-xl font-bold text-green-700 dark:text-green-400 mt-1">
                        {formatCurrency(summary.totalInflow)}
                      </p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-4 border border-red-100 dark:border-red-900">
                      <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase font-medium">Total Outflow</p>
                      <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
                        {formatCurrency(summary.totalOutflow)}
                      </p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900">
                      <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase font-medium">Total Commission</p>
                      <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                        {formatCurrency(summary.totalCommission)}
                      </p>
                    </div>
                  </div>

                  <EndOfDayChart transactions={transactions} />

                  <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-gray-100 dark:border-zinc-700 mt-6">
                    <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase font-medium mb-3">
                      Transactions by Type
                    </p>
                    <div className="space-y-2">
                      {Object.entries(summary.byType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-zinc-300 capitalize">
                            {type.replace("-", " ")}
                          </span>
                          <span className="text-sm font-semibold text-gray-800 dark:text-zinc-200">{count}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 dark:border-zinc-700 mt-3 pt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800 dark:text-zinc-200">Total Transactions</span>
                      <span className="text-sm font-bold text-green-700 dark:text-green-400">{summary.count}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleExportCSV}
                      className="text-xs text-green-600 dark:text-green-400 hover:underline"
                    >
                      Export CSV
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-green-200 dark:border-zinc-700 rounded-xl">
                  <p className="text-sm text-gray-400 dark:text-zinc-500">
                    No transactions today. Log some transactions first.
                  </p>
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
                    <p className="text-xs text-gray-400 dark:text-zinc-500">
                      Active &middot; Last sync: {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Confirmation dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-xl max-w-sm mx-4 border border-green-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-zinc-200 text-sm">Clear all transactions?</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">
                  This will permanently delete all {transactions.length} transactions.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
