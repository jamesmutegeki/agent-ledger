"use client"

import { BookOpen, History, List, Monitor, ListChecks } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ViewId } from "@/lib/types"

const navItems: { id: ViewId; label: string; icon: typeof History }[] = [
  { id: "live-log", label: "Live Log", icon: List },
  { id: "history", label: "History", icon: History },
  { id: "end-of-day", label: "End of Day", icon: ListChecks },
  { id: "machines", label: "Machines", icon: Monitor },
]

interface SidebarProps {
  activeView: ViewId
  onNavigate: (view: ViewId) => void
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <aside className="w-60 min-h-screen border-r border-green-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0">
      <div className="p-5 border-b border-green-100 dark:border-zinc-800">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h1 className="text-lg font-bold text-green-800 dark:text-green-400 tracking-tight">
            Agent Ledger
          </h1>
        </div>
        <p className="text-xs text-gray-400 dark:text-zinc-500 ml-7">Balance the books</p>
      </div>

      <div className="p-4">
        <p className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
          Workspace
        </p>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.id === activeView
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                    : "text-gray-500 dark:text-zinc-400 hover:bg-green-50 dark:hover:bg-zinc-800 hover:text-green-600 dark:hover:text-green-400"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
