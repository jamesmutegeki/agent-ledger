"use client"

import { useMemo } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area,
} from "recharts"
import type { Transaction } from "@/lib/types"
import { isInflow } from "@/lib/types"
import { formatCurrency } from "@/lib/format"

const CHART_COLORS = ["#a3a3a3", "#737373", "#525252", "#404040", "#262626"]

interface AnalyticsDashboardProps {
  transactions: Transaction[]
}

export default function AnalyticsDashboard({ transactions }: AnalyticsDashboardProps) {
  const stats = useMemo(() => {
    if (transactions.length === 0) return null

    const inflowTx = transactions.filter((t) => isInflow(t))
    const outflowTx = transactions.filter((t) => !isInflow(t))
    const totalInflow = inflowTx.reduce((s, t) => s + t.amount, 0)
    const totalOutflow = outflowTx.reduce((s, t) => s + t.amount, 0)
    const totalCommission = transactions.reduce((s, t) => s + t.commission, 0)
    const netProfit = totalInflow - totalOutflow
    const successRate = transactions.filter((t) => t.isSuccessful).length / transactions.length * 100

    const byType = transactions.reduce(
      (acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>
    )

    const hourlyBuckets: Record<string, number> = {}
    transactions.forEach((t) => {
      const match = t.timestamp.match(/(\d+):(\d+)\s*(AM|PM)/)
      if (match) {
        let hour = parseInt(match[1])
        if (match[3] === "PM" && hour !== 12) hour += 12
        if (match[3] === "AM" && hour === 12) hour = 0
        const label = `${hour}:00`
        hourlyBuckets[label] = (hourlyBuckets[label] || 0) + t.amount
      }
    })

    const hourlyData = Object.entries(hourlyBuckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, amount]) => ({ hour, amount }))

    return {
      totalInflow,
      totalOutflow,
      totalCommission,
      netProfit,
      successRate,
      count: transactions.length,
      byType,
      hourlyData,
    }
  }, [transactions])

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-400 dark:text-gray-500">
        No data to analyze. Log some transactions first.
      </div>
    )
  }

  const pieData = Object.entries(stats.byType).map(([name, value]) => ({
    name: name.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
  }))

  const barData = [
    { name: "Inflow", amount: stats.totalInflow },
    { name: "Outflow", amount: stats.totalOutflow },
    { name: "Commission", amount: stats.totalCommission },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-100 dark:bg-zinc-800 rounded-xl overflow-hidden">
        <div className="bg-white dark:bg-zinc-900 p-5">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">Revenue</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
            {formatCurrency(stats.totalInflow)}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-5">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">Expenses</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
            {formatCurrency(stats.totalOutflow)}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-5">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">Net Profit</p>
          <p className={`text-lg font-semibold mt-1 ${stats.netProfit >= 0 ? "text-gray-900 dark:text-gray-100" : "text-gray-900 dark:text-gray-100"}`}>
            {stats.netProfit >= 0 ? "+" : ""}{formatCurrency(stats.netProfit)}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-5">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">Success Rate</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
            {stats.successRate.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm shadow-black/5 dark:shadow-black/10">
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-4">Amount by Type</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: unknown) => [formatCurrency(Number(value)), "Amount"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e5e5",
                  fontSize: "12px",
                  background: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stats.hourlyData.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm shadow-black/5 dark:shadow-black/10">
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-4">Hourly Volume</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.hourlyData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#737373" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#737373" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#a3a3a3" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#a3a3a3" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: unknown) => [formatCurrency(Number(value)), "Volume"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e5e5",
                    fontSize: "12px",
                    background: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#525252"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm shadow-black/5 dark:shadow-black/10">
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-4">Inflow vs Outflow</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#a3a3a3" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#a3a3a3" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: unknown) => [formatCurrency(Number(value)), "Amount"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e5e5",
                  fontSize: "12px",
                  background: "#fff",
                }}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]} fill="#737373" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
