"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { PanelRightOpen, PanelLeftClose, Sun, Moon, Monitor, Trash2, Database } from "lucide-react"
import { useTheme } from "next-themes"
import { Sidebar } from "@/components/sidebar"
import { TransactionForm } from "@/components/transaction-form"
import { ActivityFeed } from "@/components/activity-feed"
import { LoginForm } from "@/components/auth/login-form"
import type { Transaction, ViewId } from "@/lib/types"
import { isInflow } from "@/lib/types"
import { useAuth } from "@/lib/auth"
import { generateDemoTransactions } from "@/lib/demo-data"
import { supabase, isSupabaseConfigured, toDbTransaction, fromDbTransaction } from "@/lib/supabase"
import { formatCurrency } from "@/lib/format"
import { exportTransactionsToCSV } from "@/lib/csv"
import { safeGetItem, safeSetItem, safeRemoveItem } from "@/lib/storage"
import dynamic from "next/dynamic"

const EndOfDayChart = dynamic(() => import("@/components/end-of-day-chart"), { ssr: false })
const AnalyticsDashboard = dynamic(() => import("@/components/analytics-dashboard"), { ssr: false })

const STORAGE_KEY = "agent-ledger-initialized"

export default function Home() {
  const { user, loading: authLoading, sessionId } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [activeView, setActiveView] = useState<ViewId>("live-log")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [supabaseConnected, setSupabaseConnected] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const { theme, setTheme } = useTheme()

  // --- ALL hooks must be BEFORE any early return (Rules of Hooks) ---

  useEffect(() => {
    safeSetItem("agent-ledger-transactions", JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    const init = async () => {
      const alreadyInitialized = safeGetItem(STORAGE_KEY)

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
          safeSetItem(STORAGE_KEY, "true")
          return
        }
      }

      if (!alreadyInitialized) {
        const demo = generateDemoTransactions()
        setTransactions(demo)
        safeSetItem(STORAGE_KEY, "true")
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
    safeRemoveItem(STORAGE_KEY)
    safeRemoveItem("agent-ledger-transactions")

    if (supabase && isSupabaseConfigured()) {
      try {
        const { data: ids } = await supabase
          .from("transactions")
          .select("id")
          .limit(1000)

        if (ids && ids.length > 0) {
          await supabase.from("transactions").delete().in("id", ids.map(r => r.id))
        }
      } catch (err) {
        console.error("Supabase clear failed", err)
      }
    }
  }, [])

  const handleResetDemo = useCallback(() => {
    const demo = generateDemoTransactions()
    setTransactions(demo)
    safeSetItem(STORAGE_KEY, "true")
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const headerTitle = {
    "live-log": "Live Log",
    history: "History",
    "end-of-day": "End of Day",
    analytics: "Analytics",
    machines: "Machines",
  }[activeView]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex">
      {sidebarOpen && <Sidebar activeView={activeView} onNavigate={setActiveView} />}

      <div className="flex-1 flex flex-col min-h-screen w-0">
        <header className="h-14 bg-white dark:bg-zinc-900 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {headerTitle}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {syncing && <span className="text-[11px] text-gray-400 dark:text-gray-500">Syncing...</span>}
            {supabaseConnected && <Database className="w-3.5 h-3.5 text-gray-400" />}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        <main className="flex-1 px-6 py-6 min-h-0 overflow-auto">
          {activeView === "live-log" && (
            <div className="h-full flex flex-col lg:flex-row gap-6">
              <div className="lg:w-[420px] shrink-0 self-start lg:self-stretch flex flex-col">
                <TransactionForm onLogTransaction={handleLogTransaction} />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleResetDemo}
                    className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Load demo data
                  </button>
                  {transactions.length > 0 && (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
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
            <div className="h-full max-w-2xl mx-auto flex flex-col">
              <ActivityFeed transactions={transactions} compact showExport onExportCSV={handleExportCSV} />
            </div>
          )}

          {activeView === "end-of-day" && (
            <div className="h-full max-w-2xl mx-auto flex flex-col">
              {summary ? (
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm shadow-black/5 dark:shadow-black/10">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-100 dark:bg-zinc-800 rounded-xl overflow-hidden mb-6">
                    <div className="bg-white dark:bg-zinc-900 p-5">
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">Inflow</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                        {formatCurrency(summary.totalInflow)}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-5">
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">Outflow</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                        {formatCurrency(summary.totalOutflow)}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-5">
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">Commission</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                        {formatCurrency(summary.totalCommission)}
                      </p>
                    </div>
                  </div>

                  <EndOfDayChart transactions={transactions} />

                  <div className="mt-6 pt-5 border-t border-gray-100 dark:border-zinc-800">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-3">
                      Transactions by Type
                    </p>
                    <div className="space-y-2">
                      {Object.entries(summary.byType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between py-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {type.replace("-", " ")}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{count}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100 dark:border-zinc-800">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Total</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{summary.count}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end">
                    <button
                      onClick={handleExportCSV}
                      className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      Export CSV
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    No transactions today. Log some transactions first.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeView === "analytics" && (
            <div className="h-full max-w-4xl mx-auto flex flex-col">
              {transactions.length > 0 ? (
                <AnalyticsDashboard transactions={transactions} />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    No data to analyze. Log some transactions first.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeView === "machines" && (
            <div className="h-full max-w-2xl mx-auto flex flex-col">
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm shadow-black/5 dark:shadow-black/10">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Registered Machines</h3>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                  <Monitor className="w-8 h-8 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Machine #001</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Active &middot; Last sync: {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-xl max-w-sm mx-4">
            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">Clear all transactions?</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">
              This will permanently delete all {transactions.length} transactions.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
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
