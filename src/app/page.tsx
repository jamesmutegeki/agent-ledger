"use client"

import { useState, useCallback } from "react"
import { PanelRightOpen, Sun } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { TransactionForm, type Transaction } from "@/components/transaction-form"
import { ActivityFeed } from "@/components/activity-feed"

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const handleLogTransaction = useCallback((tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev])
  }, [])

  return (
    <div className="min-h-screen bg-green-50/40 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen w-0">
        <header className="h-14 border-b border-green-200 bg-white flex items-center justify-between px-5 shrink-0">
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-green-600 transition-colors">
              <PanelRightOpen className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-bold text-green-800">Live log</h2>
              <p className="text-xs text-gray-400 leading-tight">
                Type the receipt details. The ledger updates as you go.
              </p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-green-600 transition-colors">
            <Sun className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 p-5 flex flex-col lg:flex-row gap-5 min-h-0">
          <div className="lg:w-[440px] shrink-0 self-start lg:self-stretch flex flex-col">
            <TransactionForm onLogTransaction={handleLogTransaction} />
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            <ActivityFeed transactions={transactions} />
          </div>
        </main>
      </div>
    </div>
  )
}
