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
    <aside className="w-56 min-h-screen bg-white dark:bg-zinc-900 flex flex-col shrink-0 border-r border-gray-100 dark:border-zinc-800">
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
            Agent Ledger
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.id === activeView
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-all duration-150 text-left",
                isActive
                  ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 font-medium"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          )
        })}
      </nav>

      {user && (
        <div className="px-4 py-4 border-t border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate leading-tight">
                {user.name}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                {user.machineId}
              </p>
            </div>
            <button
              onClick={logout}
              className="shrink-0 p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
