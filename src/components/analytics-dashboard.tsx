"use client"

import { useMemo } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from "recharts"
import type { Transaction } from "@/lib/types"
import { isInflow } from "@/lib/types"
import { formatCurrency } from "@/lib/format"

const COLORS = {
  inflow: "#16a34a",
  outflow: "#ef4444",
  commission: "#059669",
}

const CHART_COLORS = ["#16a34a", "#ef4444", "#3b82f6", "#a855f7", "#059669"]

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

    // Types breakdown
    const byType = transactions.reduce(
      (acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>
    )

    // Hourly distribution (simulated from timestamp strings like "11:42 AM")
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

    // Success rate pie data
    const successCount = transactions.filter((t) => t.isSuccessful).length
    const failedCount = transactions.length - successCount

    return {
      totalInflow,
      totalOutflow,
      totalCommission,
      netProfit,
      successRate,
      count: transactions.length,
      byType,
      hourlyData,
      successData: [
        { name: "Successful", value: successCount },
        { name: "Failed", value: failedCount },
      ],
    }
  }, [transactions])

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-400 dark:text-zinc-500">
        No data to analyze. Log some transactions first.
      </div>
    )
  }

  const pieData = Object.entries(stats.byType).map(([name, value]) => ({
    name: name.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
  }))

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-green-200 dark:border-zinc-800">
          <p className="text-[10px] text-gray-400 uppercase font-medium">Revenue</p>
          <p className="text-lg font-bold text-green-700 dark:text-green-400 mt-1">
            {formatCurrency(stats.totalInflow)}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-green-200 dark:border-zinc-800">
          <p className="text-[10px] text-gray-400 uppercase font-medium">Expenses</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">
            {formatCurrency(stats.totalOutflow)}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-green-200 dark:border-zinc-800">
          <p className="text-[10px] text-gray-400 uppercase font-medium">Net Profit</p>
          <p className={`text-lg font-bold mt-1 ${stats.netProfit >= 0 ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {stats.netProfit >= 0 ? "+" : ""}{formatCurrency(stats.netProfit)}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-green-200 dark:border-zinc-800">
          <p className="text-[10px] text-gray-400 uppercase font-medium">Success Rate</p>
          <p className="text-lg font-bold text-gray-800 dark:text-zinc-200 mt-1">
            {stats.successRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Amount by Type Pie Chart */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-green-200 dark:border-zinc-800">
        <p className="text-xs text-gray-400 uppercase font-medium mb-3">Amount by Type</p>
        <div className="h-72">
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
              <Tooltip formatter={(value: unknown) => [formatCurrency(Number(value)), "Amount"]} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Trend */}
      {stats.hourlyData.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-green-200 dark:border-zinc-800">
          <p className="text-xs text-gray-400 uppercase font-medium mb-3">Hourly Transaction Volume</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.hourlyData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value: unknown) => [formatCurrency(Number(value)), "Volume"]} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#16a34a"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Inflow vs Outflow Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-green-200 dark:border-zinc-800">
        <p className="text-xs text-gray-400 uppercase font-medium mb-3">Inflow vs Outflow</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: "Inflow", amount: stats.totalInflow },
                { name: "Outflow", amount: stats.totalOutflow },
                { name: "Commission", amount: stats.totalCommission },
              ]}
            >
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value: unknown) => [formatCurrency(Number(value)), "Amount"]} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {[
                  { name: "Inflow", amount: stats.totalInflow },
                  { name: "Outflow", amount: stats.totalOutflow },
                  { name: "Commission", amount: stats.totalCommission },
                ].map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={
                      i === 0 ? COLORS.inflow : i === 1 ? COLORS.outflow : COLORS.commission
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
