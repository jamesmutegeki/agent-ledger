"use client"

import { BookOpen, History, List, Monitor, ListChecks, LogOut, User, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ViewId } from "@/lib/types"
import { useAuth } from "@/lib/auth"

const navItems: { id: ViewId; label: string; icon: typeof History }[] = [
  { id: "live-log", label: "Live Log", icon: List },
  { id: "history", label: "History", icon: History },
  { id: "end-of-day", label: "End of Day", icon: ListChecks },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "machines", label: "Machines", icon: Monitor },
]

interface SidebarProps {
  activeView: ViewId
  onNavigate: (view: ViewId) => void
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth()

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
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full text-left",
                  isActive
                    ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                    : "text-gray-500 dark:text-zinc-400 hover:bg-green-50 dark:hover:bg-zinc-800 hover:text-green-600 dark:hover:text-green-400"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {user && (
        <div className="mt-auto p-4 border-t border-green-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-zinc-300 truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 truncate">
                {user.machineId}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      )}
    </aside>
  )
}
