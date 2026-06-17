"use client"

import { BookOpen, History, LogIn, Monitor, ListChecks } from "lucide-react"
import { cn } from "@/lib/utils"

export type ViewId = "live-log" | "history" | "end-of-day" | "machines"

const navItems: { id: ViewId; label: string; icon: typeof LogIn }[] = [
  { id: "live-log", label: "Live Log", icon: LogIn },
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
    <aside className="w-60 min-h-screen border-r border-green-200 bg-white flex flex-col shrink-0">
      <div className="p-5 border-b border-green-100">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-green-600" />
          <h1 className="text-lg font-bold text-green-800 tracking-tight">
            Agent Ledger
          </h1>
        </div>
        <p className="text-xs text-gray-400 ml-7">Balance the books</p>
      </div>

      <div className="p-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
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
                    ? "bg-green-100 text-green-700"
                    : "text-gray-500 hover:bg-green-50 hover:text-green-600"
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
